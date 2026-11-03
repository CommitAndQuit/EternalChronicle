const CACHE_NAME = 'eternal-chronicle-v3';

// The worker lives at <base>/sw.js, so its own directory is the site base.
// Resolving assets relatively keeps the PWA working under /<repo>/ on GitHub Pages.
const BASE_URL = new URL('./', self.location.href).href;
const OFFLINE_URL = new URL('index.html', BASE_URL).href;
const urlFor = (path) => new URL(path.replace(/^\/+/, ''), BASE_URL).href;

const STATIC_ASSETS = [
  BASE_URL,
  OFFLINE_URL,
  urlFor('manifest.json'),
  urlFor('icons/icon-192.png'),
  urlFor('icons/icon-512.png'),
  urlFor('fonts/inter-latin.woff2'),
  urlFor('assets/journal/categories/holiday.webp'),
  urlFor('assets/journal/categories/surprise.webp'),
  urlFor('assets/journal/categories/daily.webp'),
  urlFor('assets/journal/categories/sports.webp'),
  urlFor('assets/journal/cards/cycling.webp'),
  urlFor('assets/journal/cards/photography.webp'),
  urlFor('assets/journal/cards/travel.webp'),
  urlFor('assets/journal/cards/office.webp'),
  urlFor('assets/journal/photos/fuji.webp'),
  urlFor('assets/journal/photos/blossom.webp'),
  urlFor('assets/journal/cyclist-cover.png'),
  urlFor('assets/journal/cyclist-success.png')
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then((cached) => cached || caches.match(BASE_URL))
      )
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          return response;
        })
        .catch(() => cached);
    })
  );
});
