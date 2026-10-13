/* ============================================================
   sw.js — SHIVAM DUPLEX Society · Service Worker (v4)
   Fixed: Network-First navigation (prevents page unlinking)
   Supports offline caching & seamless PWA installation
   ============================================================ */

const CACHE_NAME = 'shivam-duplex-v6';

const STATIC_ASSETS = [
  'index.html',
  'dashboard.html',
  'members.html',
  'maintenance.html',
  'payments.html',
  'expenses.html',
  'funds.html',
  'events.html',
  'notices.html',
  'reports.html',
  'resident.html',
  'css/style.css',
  'css/homepage.css',
  'css/tables.css',
  'css/forms.css',
  'css/shiva-theme.css',
  'js/app.js',
  'js/pwa.js',
  'js/print.js',
  'js/firebase-config.js',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

/* ── Install: Pre-cache core files ── */
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW v4] Caching core assets');
      return Promise.allSettled(
        STATIC_ASSETS.map((url) =>
          cache.add(url).catch((err) => console.warn('[SW v4] Pre-cache skip:', url, err))
        )
      );
    })
  );
});

/* ── Activate: Purge ALL previous caches ── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW v4] Purging old cache:', name);
            return caches.delete(name);
          })
      )
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch ── */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET requests
  if (req.method !== 'GET') return;

  // Skip external APIs (Firebase, Google, CDNs)
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

  // 1. Navigation requests (User clicking links between pages):
  // ALWAYS Network-First! Never hijack navigation to index.html!
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          // If completely offline, try to find this page in cache
          const cached = await caches.match(req);
          if (cached) return cached;
          const fallback = await caches.match(url.pathname.replace(/^\//, ''));
          if (fallback) return fallback;
          return caches.match('index.html');
        })
    );
    return;
  }

  // 2. Static Assets (CSS, JS, Images, Icons):
  // Cache-First with Network Revalidation
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        // Revalidate in background
        fetch(req)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(req, networkResponse.clone()));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      return fetch(req).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) return networkResponse;
        const clone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        return networkResponse;
      });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
