import { assetUrl } from '../lib/assets';

const DAY = 24 * 60 * 60 * 1000;

export const CATEGORIES = [
  {
    id: 'holiday',
    label: 'Holiday',
    icon: assetUrl('/assets/journal/categories/holiday.webp'),
    tint: '#FBE6DB',
    ring: '#E58A69',
  },
  {
    id: 'surprise',
    label: 'Surprise',
    icon: assetUrl('/assets/journal/categories/surprise.webp'),
    tint: '#E4E4E4',
    ring: '#B9B9B9',
  },
  {
    id: 'daily',
    label: 'Daily Life',
    icon: assetUrl('/assets/journal/categories/daily.webp'),
    tint: '#FBE6DB',
    ring: '#E58A69',
  },
  {
    id: 'sports',
    label: 'Sports',
    icon: assetUrl('/assets/journal/categories/sports.webp'),
    tint: '#E4E4E4',
    ring: '#B9B9B9',
  },
];

export const ILLUSTRATIONS = {
  travel: { src: assetUrl('/assets/journal/cards/travel.webp'), accent: '#A08C8E' },
  photography: { src: assetUrl('/assets/journal/cards/photography.webp'), accent: '#546171' },
  office: { src: assetUrl('/assets/journal/cards/office.webp'), accent: '#82A899' },
  cycling: { src: assetUrl('/assets/journal/cards/cycling.webp'), accent: '#5E3474' },
};

export const PHOTOS = {
  fuji: assetUrl('/assets/journal/photos/fuji.webp'),
  blossom: assetUrl('/assets/journal/photos/blossom.webp'),
};

export const categoryFor = (label) =>
  CATEGORIES.find((category) => category.label === label) || CATEGORIES[2];

export const illustrationFor = (key) => ILLUSTRATIONS[key] || ILLUSTRATIONS.cycling;

export const accentFor = (key) => illustrationFor(key).accent;

// Used to give each newly created journal its own backdrop instead of
// repeating the same purple for every entry.
export const ACCENT_COLORS = [
  '#A0574B', // terracotta
  '#4E6478', // slate blue
  '#66794F', // olive
  '#8B5A73', // mauve
  '#3E5C54', // pine
  '#7A5B3E', // umber
  '#4C4A75', // indigo
  '#5E3474', // plum
];

export const nextAccentColor = (index = 0) =>
  ACCENT_COLORS[((index % ACCENT_COLORS.length) + ACCENT_COLORS.length) % ACCENT_COLORS.length];

export const createId = () =>
  `journal-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export function createEmptyJournal(overrides = {}) {
  const now = new Date().toISOString();
  return {
    id: createId(),
    title: '',
    titleSource: 'auto',
    titleModel: null,
    content: '',
    createdAt: now,
    updatedAt: now,
    publishedAt: null,
    journalDate: '',
    status: 'draft',
    category: 'Daily Life',
    illustration: 'cycling',
    accentColor: ILLUSTRATIONS.cycling.accent,
    photos: [],
    ...overrides,
  };
}

const isoDaysAgo = (days, hours = 9) =>
  new Date(Date.now() - days * DAY - hours * 60 * 60 * 1000).toISOString();

const base = (overrides) => ({
  status: 'published',
  category: 'Daily Life',
  titleSource: 'user',
  photos: [PHOTOS.fuji, PHOTOS.blossom],
  journalDate: '',
  ...overrides,
});

export function buildSeedJournals() {
  const cyclingCreated = isoDaysAgo(2, 3);

  return [
    {
      ...createEmptyJournal({
        id: 'journal-cycling-draft',
        title: 'Cycling and enjoy the city view',
        titleSource: 'user',
        content:
          'Rode along the river path just before sunset. The city looked softer from the saddle — warm light on the bridges, laundry moving in the windows, someone practicing trumpet in an open courtyard.\n\nI stopped for a while near the old station and watched the evening settle in. No destination, no rush. Just the quiet hum of the wheels and a city I thought I already knew.',
        createdAt: cyclingCreated,
        updatedAt: cyclingCreated,
        category: 'Daily Life',
        illustration: 'cycling',
        accentColor: ILLUSTRATIONS.cycling.accent,
        photos: [PHOTOS.fuji, PHOTOS.blossom],
      }),
    },
    base({
      id: 'journal-travel-partner',
      title: 'My first trip with my partner',
      content:
        'We took the early train out of the city with one bag between us and no real plan. By noon we were sharing a paper plate of dumplings beside a river neither of us could name.\n\nIt was the first trip where nothing needed to be photographed to feel important. I just wanted to remember the way we laughed at the map.',
      createdAt: isoDaysAgo(2),
      updatedAt: isoDaysAgo(2),
      publishedAt: isoDaysAgo(2),
      category: 'Holiday',
      illustration: 'travel',
      accentColor: ILLUSTRATIONS.travel.accent,
    }),
    base({
      id: 'journal-street-photography',
      title: 'Street Photography Journal',
      content:
        'A slow walk through the market with a camera and no checklist. I kept coming back to hands — holding fruit, counting change, waving goodbye.\n\nFive frames made the cut. The rest are just reasons to keep looking.',
      createdAt: isoDaysAgo(5),
      updatedAt: isoDaysAgo(5),
      publishedAt: isoDaysAgo(5),
      category: 'Daily Life',
      illustration: 'photography',
      accentColor: ILLUSTRATIONS.photography.accent,
      photos: [PHOTOS.blossom],
    }),
    base({
      id: 'journal-first-day-office',
      title: 'First day at office, very nervous',
      content:
        'I rehearsed my introduction in the elevator and then forgot all of it when the doors opened. Everyone was kinder than I expected.\n\nBy the end of the day I had a desk, a tiny plant, and twelve new names to learn.',
      createdAt: isoDaysAgo(5, 4),
      updatedAt: isoDaysAgo(5, 4),
      publishedAt: isoDaysAgo(5, 4),
      category: 'Daily Life',
      illustration: 'office',
      accentColor: ILLUSTRATIONS.office.accent,
      photos: [PHOTOS.fuji],
    }),
    ...seedArchive(),
  ];
}

function seedArchive() {
  const archive = [
    ['A slow morning in Kyoto', 9, 'Holiday', 'travel', [PHOTOS.blossom]],
    ['Weekend market finds', 12, 'Surprise', 'office', [PHOTOS.fuji]],
    ['The quiet side of the city', 16, 'Daily Life', 'photography', []],
    ['Learning to cook again', 21, 'Daily Life', 'office', [PHOTOS.blossom]],
    ['Sunday hike, no signal', 27, 'Sports', 'travel', [PHOTOS.fuji, PHOTOS.blossom]],
    ['Coffee shop sketches', 34, 'Daily Life', 'photography', [PHOTOS.blossom]],
    ['A rainy walk home', 41, 'Surprise', 'travel', []],
    ['Museum afternoon', 52, 'Holiday', 'office', [PHOTOS.fuji]],
    ['Small wins this week', 63, 'Daily Life', 'photography', []],
    ['The rooftop at sunset', 78, 'Surprise', 'travel', [PHOTOS.blossom]],
    ['Notes from the train', 96, 'Holiday', 'office', []],
    ['Turning 30, quietly', 124, 'Daily Life', 'photography', [PHOTOS.fuji]],
  ];

  return archive.map(([title, days, category, illustration, photos], index) => {
    const created = isoDaysAgo(days, index % 3);
    return base({
      id: `journal-archive-${index + 1}`,
      title,
      content:
        'A small entry from an ordinary day. I am keeping these here so the quiet moments have somewhere to live.\n\nNothing dramatic happened, and that was the point.',
      createdAt: created,
      updatedAt: created,
      publishedAt: created,
      category,
      illustration,
      accentColor: ILLUSTRATIONS[illustration].accent,
      photos,
    });
  });
}

export const totalSeedCount = 16;
