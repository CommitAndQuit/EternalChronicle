#!/usr/bin/env python3
"""Extract the journal artwork from the reference walkthrough video.

Requirements: Python 3, Pillow, ffmpeg.
Run from the repository root:  python3 scripts/extract-journal-assets.py
"""

from __future__ import annotations

import subprocess
import tempfile
from collections import Counter, deque
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
VIDEO = ROOT / "original-e5537ada0a02083de76c890dd4f8415b.mp4"
OUT = ROOT / "public" / "assets" / "journal"
SCALE = 4  # the reference video is a 4x capture of an 800px-wide phone

CARDS = {
    # name: (frame, (x0, y0, x1, y1) at 800px, text boxes at native crop scale)
    "travel": (
        "1.5",
        (283, 193, 516, 378),
        [(40, 40, 560, 175), (40, 160, 450, 275), (40, 265, 370, 395),
         (40, 385, 340, 475), (795, 65, 905, 135)],
    ),
    "photography": (
        "3.0",
        (283, 139, 516, 332),
        [(40, 40, 400, 180), (40, 165, 620, 295), (40, 285, 430, 410),
         (40, 395, 340, 485), (795, 70, 905, 140)],
    ),
    "office": (
        "3.0",
        (283, 344, 516, 545),
        [(40, 80, 555, 235), (40, 225, 520, 350), (40, 340, 430, 460),
         (40, 440, 340, 515), (795, 85, 905, 155)],
    ),
    "cycling": (
        "6.5",
        (283, 193, 516, 378),
        [(40, 50, 590, 200), (40, 185, 620, 310), (40, 300, 300, 410),
         (40, 390, 340, 485), (795, 65, 905, 135)],
    ),
}

CATEGORY_BOXES = {
    "holiday": (64, 353, 262, 551),
    "surprise": (303, 354, 499, 550),
    "daily": (549, 354, 744, 549),
}

CATEGORY_GRAY = (217, 218, 220)


def frame(times: dict[str, Image.Image], stamp: str) -> Image.Image:
    if stamp not in times:
        raise RuntimeError(f"missing frame {stamp}")
    return times[stamp]


def native(box):
    return tuple(int(v * SCALE) for v in box)


def crop_frame(im: Image.Image, box):
    return im.crop(native(box))


def clean_card(im: Image.Image, boxes):
    """Remove the baked-in video typography by filling its tight boxes."""
    im = im.convert("RGB")
    # The illustration sits to the right of the copy, so the flat card colour is
    # the dominant tone across the whole crop. Sampling a corner is unreliable
    # because the crop includes the rounded white corner of the card.
    sample = im.resize((160, 160), Image.BILINEAR)
    bg = Counter(sample.getdata()).most_common(1)[0][0]
    draw = ImageDraw.Draw(im)
    for box in boxes:
        draw.rectangle(box, fill=bg)
    return im, bg


def walk_components(mask):
    """Yield connected components of a boolean mask."""
    height, width = len(mask), len(mask[0])
    seen = [[False] * width for _ in range(height)]
    for y in range(height):
        row = mask[y]
        for x in range(width):
            if not row[x] or seen[y][x]:
                continue
            queue = deque([(y, x)])
            seen[y][x] = True
            points = []
            while queue:
                cy, cx = queue.popleft()
                points.append((cy, cx))
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = cy + dy, cx + dx
                    if 0 <= ny < height and 0 <= nx < width and mask[ny][nx] and not seen[ny][nx]:
                        seen[ny][nx] = True
                        queue.append((ny, nx))
            yield points


def drop_specks(im: Image.Image, min_area: int):
    im = im.convert("RGBA")
    pixels = im.load()
    mask = [[pixels[x, y][3] > 8 for x in range(im.width)] for y in range(im.height)]
    keep = [[False] * im.width for _ in range(im.height)]
    for points in walk_components(mask):
        if len(points) >= min_area:
            for y, x in points:
                keep[y][x] = True
    for y in range(im.height):
        for x in range(im.width):
            if not keep[y][x]:
                pixels[x, y] = (0, 0, 0, 0)
    return im


def trim_to_alpha(im: Image.Image, pad: int = 2):
    bbox = im.getbbox()
    if not bbox:
        return im
    x0, y0, x1, y1 = bbox
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
    x1, y1 = min(im.width, x1 + pad), min(im.height, y1 + pad)
    return im.crop((x0, y0, x1, y1))


def key_background(im: Image.Image, seeds, color=(255, 0, 255), thresh=28):
    """Flood-fill a flat background to a chroma key, then make it transparent."""
    im = im.convert("RGB")
    ImageDraw.floodfill(im, seeds[0], color, thresh=thresh)
    for seed in seeds[1:]:
        if im.getpixel(seed) != color:
            ImageDraw.floodfill(im, seed, color, thresh=thresh)
    rgba = im.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            if pixels[x, y][:3] == color:
                pixels[x, y] = (0, 0, 0, 0)
    return rgba


def feather_alpha(im: Image.Image, radius: int = 2):
    from PIL import ImageFilter
    alpha = im.getchannel("A").filter(ImageFilter.GaussianBlur(radius))
    im.putalpha(alpha)
    return im


def main():
    if not VIDEO.exists():
        raise SystemExit(f"Reference video not found: {VIDEO}")
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "cards").mkdir(exist_ok=True)
    (OUT / "categories").mkdir(exist_ok=True)
    (OUT / "photos").mkdir(exist_ok=True)

    stamps = ["1.5", "3.0", "6.5", "8.5", "9.5", "10.5", "13.0"]
    frames = {}
    with tempfile.TemporaryDirectory() as tmp:
        for stamp in stamps:
            target = Path(tmp) / f"{stamp}.jpg"
            subprocess.run(
                ["ffmpeg", "-v", "error", "-ss", stamp, "-i", str(VIDEO),
                 "-frames:v", "1", "-q:v", "2", str(target)],
                check=True,
            )
            frames[stamp] = Image.open(target).convert("RGB")
        stills = {k: v.copy() for k, v in frames.items()}

    # Dashboard cards: remove the reference copy so live text can be overlaid.
    for name, (stamp, box, text_boxes) in CARDS.items():
        card = crop_frame(stills[stamp], box)
        card, _ = clean_card(card, [tuple(int(v) for v in b) for b in text_boxes])
        card = card.resize((700, round(card.height * 700 / card.width)), Image.LANCZOS)
        card.save(OUT / "cards" / f"{name}.webp", "WEBP", quality=92, method=6)
        print("card", name, card.size)

    # Category artwork.
    sheet = crop_frame(stills["8.5"], (283, 293, 516, 560))
    for name, box in CATEGORY_BOXES.items():
        icon = sheet.crop(box)
        icon = icon.resize((192, 192), Image.LANCZOS)
        icon.save(OUT / "categories" / f"{name}.webp", "WEBP", quality=92, method=6)
        print("category", name, icon.size)

    # Sports is clipped by the reference sheet; redraw the football as a flat
    # illustration so the full circular tile is available when the row scrolls.
    sports = Image.new("RGBA", (384, 384), CATEGORY_GRAY + (255,))
    ball = Image.new("RGBA", (260, 170), (0, 0, 0, 0))
    bd = ImageDraw.Draw(ball)
    bd.ellipse((8, 8, 252, 162), fill=(107, 74, 67, 255), outline=(77, 49, 43, 255), width=5)
    bd.ellipse((23, 23, 237, 147), outline=(139, 96, 82, 255), width=3)
    lace = [(82, 92), (100, 87), (118, 83), (136, 81), (154, 83), (172, 87)]
    bd.line(lace, fill=(250, 248, 243, 255), width=8, joint="curve")
    for lx, ly in lace[::2]:
        bd.line((lx + 2, ly - 20, lx + 2, ly + 20), fill=(250, 248, 243, 255), width=6)
    bd.ellipse((150, 110, 160, 120), fill=(40, 34, 33, 255))
    ball = ball.rotate(-24, expand=True, resample=Image.BICUBIC)
    sports.alpha_composite(ball, ((384 - ball.width) // 2, (384 - ball.height) // 2))
    sports = sports.resize((192, 192), Image.LANCZOS)
    sports.save(OUT / "categories" / "sports.webp", "WEBP", quality=92, method=6)

    # Journal photos from the content sheet.
    photo1 = crop_frame(stills["10.5"], (287, 388, 423, 562))
    photo2 = crop_frame(stills["9.5"], (431, 388, 525, 562))

    # Remove the baked "more" button from the first photo with a sky clone.
    w, h = photo1.size
    patch = photo1.crop((190, 10, 290, 118)).resize((118, 118), Image.LANCZOS)
    mask = Image.new("L", (118, 118), 0)
    ImageDraw.Draw(mask).ellipse((4, 4, 114, 114), fill=255)
    from PIL import ImageFilter
    mask = mask.filter(ImageFilter.GaussianBlur(10))
    photo1.paste(patch, (405, 15), mask)
    photo1 = photo1.resize((420, round(photo1.height * 420 / photo1.width)), Image.LANCZOS)
    photo2 = photo2.resize((300, round(photo2.height * 300 / photo2.width)), Image.LANCZOS)
    photo1.save(OUT / "photos" / "fuji.webp", "WEBP", quality=92, method=6)
    photo2.save(OUT / "photos" / "blossom.webp", "WEBP", quality=92, method=6)

    # Cover cyclist, lifted from the draft card.
    cycle = crop_frame(stills["6.5"], CARDS["cycling"][1])
    cycle, _ = clean_card(cycle, [tuple(int(v) for v in b) for b in CARDS["cycling"][2]])
    cover = cycle.crop((180, 140, 932, 740))
    cover = key_background(cover, [(5, 5), (cover.width - 5, 5),
                                  (5, cover.height - 5), (cover.width - 5, cover.height - 5)])
    cover = drop_specks(cover, 300)
    cover = trim_to_alpha(cover)
    cover = feather_alpha(cover, 0.6)
    cover.thumbnail((620, 620), Image.LANCZOS)
    cover.save(OUT / "cyclist-cover.png")
    print("cover cyclist", cover.size)

    # Success cyclist, lifted from the success screen. Its purple/white boundary
    # is at y=285 of the 525px-tall source (aligned with the header in SuccessView).
    success = crop_frame(stills["13.0"], (300, 140, 500, 330))
    success = key_background(success, [(5, 5), (5, success.height - 5),
                                      (success.width - 5, 5), (success.width - 5, success.height - 5)],
                             thresh=20)
    success = drop_specks(success, 500)
    success = success.crop((80, 0, 720, 760))
    success = trim_to_alpha(success, pad=0)
    success = feather_alpha(success, 0.5)
    success.save(OUT / "cyclist-success.png")
    print("success cyclist", success.size)

    print(f"Wrote assets to {OUT}")


if __name__ == "__main__":
    main()
