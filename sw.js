/* ============================================================
   sw.js — SHIVAM DUPLEX Society · Service Worker (v3)
   Caches all pages and Lord Shiva assets for offline use
   ============================================================ */

const CACHE_NAME = 'shivam-duplex-v3';
const OFFLINE_URL = 'index.html';

const STATIC_ASSETS = [
  './',
  './index.html',
  './members.html',
  './maintenance.html',
  './payments.html',
  './expenses.html',
  './funds.html',
  './events.html',
  './notices.html',
  './reports.html',
  './resident.html',
  './css/style.css',
  './css/tables.css',
  './css/forms.css',
  './css/shiva-theme.css',
  './js/app.js',
  './js/pwa.js',
  './js/print.js',
  './js/firebase-config.js',
  './js/excel-export.js',
  './js/utils.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

/* ── Install: cache all static files ── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW v3] Caching static assets');
      return Promise.allSettled(
        STATIC_ASSETS.map((url) =>
          cache.add(url).catch((e) => console.warn('[SW v3] Cache fail:', url, e))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

/* ── Activate: clear old caches ── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW v3] Deleting old cache:', name);
            return caches.delete(name);
          })
      )
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch: Network-first for Firestore, Cache-first for local static ── */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip Firebase/external API calls — always go to network
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('firebase.googleapis.com') ||
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('cdn.jsdelivr.net') ||
    url.hostname.includes('cdn.sheetjs.com') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cache, but revalidate in background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      // Not in cache — fetch from network
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200) return response;
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => {
          return caches.match(OFFLINE_URL);
        });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
