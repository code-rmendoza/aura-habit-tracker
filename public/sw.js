const CACHE_NAME = 'aura-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json',
  '/screenshot-dashboard.png',
  '/screenshot-stats.png',
  '/screenshot-desktop.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Solo manejar peticiones locales
  if (e.request.url.startsWith(self.location.origin)) {
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Intentar actualizar en segundo plano (stale-while-revalidate)
          fetch(e.request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(e.request, networkResponse);
              });
            }
          }).catch(() => {/* Ignorar errores de red en segundo plano */});
          
          return cachedResponse;
        }
        return fetch(e.request);
      })
    );
  }
});
