const CACHE_NAME = 'porikkhangon-pwa-v1';
const API_CACHE_NAME = 'porikkhangon-api-cache-v1';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './Pshape.svg',
  './letterlogo.svg'
];

// à§§. Install Event: App Shell à¦•à§à¦¯à¦¾à¦¶ à¦•à¦°à¦¾
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching App Shell');
      return cache.addAll(APP_SHELL);
    })
  );
});

// à§¨. Activate Event: à¦ªà§à¦°à¦¾à¦¨à§‹ à¦•à§à¦¯à¦¾à¦¶ à¦•à§à¦²à¦¿à¦¨ à¦•à¦°à¦¾
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// à§©. Fetch Event: API Caching à¦à¦¬à¦‚ Offline Support
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // A. API Caching (Firebase à¦¬à¦¾ à¦à¦•à§à¦¸à¦Ÿà¦¾à¦°à§à¦¨à¦¾à¦² à¦¡à¦¾à¦Ÿà¦¾à¦° à¦œà¦¨à§à¦¯ Network First Strategy)
  if (url.origin !== self.location.origin || url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          const responseToCache = networkResponse.clone();
          caches.open(API_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => caches.match(event.request)) // à¦…à¦«à¦²à¦¾à¦‡à¦¨à§‡ à¦¥à¦¾à¦•à¦²à§‡ à¦•à§à¦¯à¦¾à¦¶ à¦¥à§‡à¦•à§‡ à¦¡à¦¾à¦Ÿà¦¾ à¦¦à§‡à¦–à¦¾à¦¬à§‡
    );
    return;
  }

  // B. Navigation Requests (SPA Routing)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => response.status === 200 ? response : caches.match('./index.html'))
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // C. Static Assets Caching (Stale-While-Revalidate)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        return networkResponse;
      });
    })
  );
});

// à§ª. Push Notifications: à¦¬à§à¦¯à¦¾à¦•à¦—à§à¦°à¦¾à¦‰à¦¨à§à¦¡à§‡ à¦¨à§‹à¦Ÿà¦¿à¦«à¦¿à¦•à§‡à¦¶à¦¨ à¦°à¦¿à¦¸à¦¿à¦­ à¦•à¦°à¦¾
self.addEventListener('push', (event) => {
  console.log('[SW] Push Received.');
  let data = { title: 'à¦¨à¦¤à§à¦¨ à¦†à¦ªà¦¡à§‡à¦Ÿ!', content: 'à¦ªà¦°à§€à¦•à§à¦·à¦¾à¦™à§à¦—à¦¨à§‡ à¦¨à¦¤à§à¦¨ à¦•à¦¿à¦›à§ à¦à¦¸à§‡à¦›à§‡, à¦šà§‡à¦• à¦•à¦°à§‡ à¦¦à§‡à¦–à§à¦¨!', url: '/' };
  
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.content,
    icon: './Pshape.svg',
    badge: './Pshape.svg',
    vibrate: [100, 50, 100],
    data: { url: data.url }
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// à¦¨à§‹à¦Ÿà¦¿à¦«à¦¿à¦•à§‡à¦¶à¦¨à§‡ à¦•à§à¦²à¦¿à¦• à¦•à¦°à¦²à§‡ à¦…à§à¦¯à¦¾à¦ª à¦“à¦ªà§‡à¦¨ à¦¹à¦“à§Ÿà¦¾
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});

// à§«. Background Sync: à¦…à¦«à¦²à¦¾à¦‡à¦¨à§‡ à¦•à§à¦‡à¦œ à¦¸à¦¾à¦¬à¦®à¦¿à¦Ÿ à¦•à¦°à¦²à§‡ à¦‡à¦¨à§à¦Ÿà¦¾à¦°à¦¨à§‡à¦Ÿà§‡ à¦†à¦¸à¦²à§‡ à¦¸à¦¿à¦™à§à¦• à¦¹à¦“à§Ÿà¦¾
self.addEventListener('sync', (event) => {
  console.log('[SW] Background Sync Triggered:', event.tag);
  if (event.tag === 'sync-quiz-results') {
    event.waitUntil(
      // à¦à¦–à¦¾à¦¨à§‡ à¦†à¦ªà¦¨à¦¾à¦° à¦¡à¦¾à¦Ÿà¦¾à¦¬à§‡à¦¸à§‡ à¦¸à§‡à¦­ à¦•à¦°à¦¾à¦° à¦«à¦¾à¦‚à¦¶à¦¨ à¦•à¦² à¦¹à¦¬à§‡
      console.log('[SW] Syncing offline quiz results to server...')
    );
  }
});

// à§¬. Periodic Background Sync: à¦ªà§à¦°à¦¤à¦¿à¦¦à¦¿à¦¨ à¦¬à§à¦¯à¦¾à¦•à¦—à§à¦°à¦¾à¦‰à¦¨à§à¦¡à§‡ à¦²à¦¿à¦¡à¦¾à¦°à¦¬à§‹à¦°à§à¦¡ à¦¬à¦¾ à¦•à§‹à§Ÿà§‡à¦¸à§à¦Ÿ à¦†à¦ªà¦¡à§‡à¦Ÿ à¦•à¦°à¦¾
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic Sync Triggered:', event.tag);
  if (event.tag === 'update-leaderboard') {
    event.waitUntil(
      // à¦¡à¦¾à¦Ÿà¦¾à¦¬à§‡à¦¸ à¦¥à§‡à¦•à§‡ à¦¨à¦¤à§à¦¨ à¦²à¦¿à¦¡à¦¾à¦°à¦¬à§‹à¦°à§à¦¡ à¦•à§à¦¯à¦¾à¦¶ à¦•à¦°à¦¾à¦° à¦«à¦¾à¦‚à¦¶à¦¨
      console.log('[SW] Updating leaderboard data in background...')
    );
  }
});
