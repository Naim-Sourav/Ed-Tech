const CACHE_NAME = 'porikkhangon-pwa-v1';
const API_CACHE_NAME = 'porikkhangon-api-cache-v1';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './Pshape.svg',
  './letterlogo.svg'
];

// ১. Install Event: App Shell ক্যাশ করা
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching App Shell');
      return cache.addAll(APP_SHELL);
    })
  );
});

// ২. Activate Event: পুরানো ক্যাশ ক্লিন করা
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

// ৩. Fetch Event: API Caching এবং Offline Support
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // A. API Caching (Firebase বা এক্সটার্নাল ডাটার জন্য Network First Strategy)
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
        .catch(() => caches.match(event.request)) // অফলাইনে থাকলে ক্যাশ থেকে ডাটা দেখাবে
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

// ৪. Push Notifications: ব্যাকগ্রাউন্ডে নোটিফিকেশন রিসিভ করা
self.addEventListener('push', (event) => {
  console.log('[SW] Push Received.');
  let data = { title: 'নতুন আপডেট!', content: 'পরীক্ষাঙ্গনে নতুন কিছু এসেছে, চেক করে দেখুন!', url: '/' };
  
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

// নোটিফিকেশনে ক্লিক করলে অ্যাপ ওপেন হওয়া
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});

// ৫. Background Sync: অফলাইনে কুইজ সাবমিট করলে ইন্টারনেটে আসলে সিঙ্ক হওয়া
self.addEventListener('sync', (event) => {
  console.log('[SW] Background Sync Triggered:', event.tag);
  if (event.tag === 'sync-quiz-results') {
    event.waitUntil(
      // এখানে আপনার ডাটাবেসে সেভ করার ফাংশন কল হবে
      console.log('[SW] Syncing offline quiz results to server...')
    );
  }
});

// ৬. Periodic Background Sync: প্রতিদিন ব্যাকগ্রাউন্ডে লিডারবোর্ড বা কোয়েস্ট আপডেট করা
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic Sync Triggered:', event.tag);
  if (event.tag === 'update-leaderboard') {
    event.waitUntil(
      // ডাটাবেস থেকে নতুন লিডারবোর্ড ক্যাশ করার ফাংশন
      console.log('[SW] Updating leaderboard data in background...')
    );
  }
});
