import { ILLUSTRATIONS, PHOTOS } from '../data/seedJournals';

export const cardImage = (illustration) =>
  (ILLUSTRATIONS[illustration] || ILLUSTRATIONS.cycling).src;

export const photoSources = Object.values(PHOTOS);

export const coverCyclist = '/assets/journal/cyclist-cover.png';
export const successCyclist = '/assets/journal/cyclist-success.png';

export function resolvePhoto(source) {
  if (!source) return '';
  if (
    source.startsWith('/') ||
    source.startsWith('http://') ||
    source.startsWith('https://') ||
    source.startsWith('data:') ||
    source.startsWith('blob:')
  ) {
    return source;
  }
  return PHOTOS[source] || source;
}

export async function fileToCompressedDataUrl(file, maxSize = 1400) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  if (!file.type.startsWith('image/')) return dataUrl;

  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });

  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  if (scale === 1 && dataUrl.length < 900_000) return dataUrl;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.82);
}
