
const CACHE_NAME = 'dhrubok-pwa-v4';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './Pshape.svg',
  './letterlogo.svg'
];

// 1. Install Event: Cache the App Shell immediately
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force this SW to become active
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching App Shell');
      return cache.addAll(APP_SHELL);
    })
  );
});

// 2. Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control of all clients
});

// 3. Fetch Event: Handle requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // A. Skip non-GET requests and external API calls (Firebase, etc.)
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // B. Handle Navigation Requests (HTML pages like /dashboard, /profile)
  // This is CRITICAL for SPA. If offline OR server returns 404, always serve index.html.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If valid response, return it
          if (response.status === 200) {
            return response;
          }
          // If 404 or other error, fallback to index.html (SPA routing)
          return caches.match('./index.html');
        })
        .catch(() => {
          // If offline, return index.html
          return caches.match('./index.html');
        })
    );
    return;
  }

  // C. Handle Assets (JS, CSS, Images) - Stale-While-Revalidate strategy
  // Try cache first, if missing try network and cache it.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          // Check if valid response
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          // Clone and cache
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // Optional: Return a placeholder image if an image request fails
          // if (event.request.destination === 'image') return caches.match('./offline-img.png');
        });
    })
  );
});
