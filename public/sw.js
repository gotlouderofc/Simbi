/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const CACHE_NAME = 'simbi-screenplay-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Use a wrapper to log, but do not let individual failures abort install
        return Promise.allSettled(
          ASSETS_TO_CACHE.map(url => {
            return cache.add(url).catch(err => {
              console.warn(`[Service Worker] Failed to pre-cache ${url}:`, err);
            });
          })
        );
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Only handle standard GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle cross-origin or non-http protocols carefully
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Helper to fetch and update cache silently in the background
      const updateCache = () => {
        // If no internet connection discovered, don't bother with updates
        if (typeof navigator !== 'undefined' && 'onLine' in navigator && !navigator.onLine) {
          return Promise.resolve();
        }
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
            }
            return networkResponse;
          })
          .catch(() => {
            /* Silently catch offline background fetch errors and don't bother with updates */
          });
      };

      if (cachedResponse) {
        // Serve from cache first on page web app load and update silently in background
        event.waitUntil(updateCache());
        return cachedResponse;
      }

      // If not in cache, fetch from network and store in cache
      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback for navigations
          const isDocument = request.mode === 'navigate' || 
                            (request.headers.get('accept') && request.headers.get('accept').includes('text/html'));
          if (isDocument) {
            return caches.match('/') || caches.match('/index.html');
          }
          return new Response('Network error occurred and no cache available', {
            status: 480,
            statusText: 'Network Unavailable Offline'
          });
        });
    })
  );
});
