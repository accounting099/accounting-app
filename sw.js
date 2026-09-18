// Service Worker for Accounting PWA - Network First
const CACHE_NAME = 'accounting-pwa-v4';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Always fetch Google Apps Script from network
  if (url.origin.includes('google.com') || url.origin.includes('googleusercontent.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Network-first for page navigation and config so updates appear instantly
  if (event.request.mode === 'navigate' || url.pathname.endsWith('config.js') || url.pathname.endsWith('index.html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache for icons
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
