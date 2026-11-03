const baseUrl = import.meta.env.BASE_URL || '/';
const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

const isExternal = (path) =>
  /^(?:[a-z]+:)?\/\//i.test(path) ||
  path.startsWith('data:') ||
  path.startsWith('blob:') ||
  path.startsWith('#');

/**
 * Resolve a file from `public/` against Vite's configured base path.
 * This keeps assets working both at the site root and on GitHub Pages
 * project sites (e.g. /EternalChronicle/).
 */
export function assetUrl(path) {
  if (!path) return '';
  if (isExternal(path)) return path;
  if (normalizedBase !== '/' && path.startsWith(normalizedBase)) return path;
  return `${normalizedBase}${path.replace(/^\/+/, '')}`;
}
