/* Porikkhangon Service Worker (v2)
 * - App-shell + static asset caching (offline support)
 * - Firebase Cloud Messaging background handler (merged here so a single SW
 *   controls the whole scope — do NOT register a second worker)
 */
const STATIC_CACHE = 'porikkhangon-static-v2';
const RUNTIME_CACHE = 'porikkhangon-runtime-v2';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './Pshape.svg',
  './letterlogo.svg',
  './icon-192.png',
  './icon-512.png',
];

// ---- Install: precache the app shell (tolerant: one failure must not kill all)
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      Promise.allSettled(APP_SHELL.map((url) => cache.add(url)))
    )
  );
});

// ---- Activate: drop old caches, take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names.map((name) => {
            if (name !== STATIC_CACHE && name !== RUNTIME_CACHE) {
              return caches.delete(name);
            }
            return Promise.resolve(false);
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Allow the page to trigger an update: navigator.serviceWorker.controller.postMessage({type:'SKIP_WAITING'})
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// URLs the worker must NEVER touch (auth streams, realtime DB, APIs, FCM).
const BYPASS = [
  'firestore.googleapis.com',
  'firebaseio.com',
  'fcm.googleapis.com',
  'firebaseinstallations.googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  '/api/',
  'onrender.com',
  'googleapis.com/gemini',
  'generativelanguage.googleapis.com',
];

function shouldBypass(url) {
  return BYPASS.some((part) => url.includes(part));
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = req.url;
  if (shouldBypass(url)) return; // let the browser handle it (no caching)

  // A. Navigations (incl. /?p= deep-link restores): network first, else cached shell.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => (res && res.status === 200 ? res : caches.match('./index.html')))
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  const sameOrigin = new URL(url).origin === self.location.origin;

  // B. Same-origin static assets: stale-while-revalidate.
  if (sameOrigin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res && res.status === 200) {
              const copy = res.clone();
              caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, copy));
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // C. Cross-origin GET (fonts, images): cache first, then network.
  if (req.destination === 'font' || req.destination === 'image' || req.destination === 'style') {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req).then((res) => {
            if (res && (res.status === 200 || res.type === 'opaque')) {
              const copy = res.clone();
              caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, copy));
            }
            return res;
          })
      )
    );
  }
});

// ---- Firebase Cloud Messaging (background) ----
try {
  importScripts(
    'https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js'
  );

  firebase.initializeApp({
    apiKey: 'AIzaSyBXXaWWoFqn6MpH6IWSm6CGaqUJzAmzbzA',
    authDomain: 'dopamine-quiz.firebaseapp.com',
    projectId: 'dopamine-quiz',
    storageBucket: 'dopamine-quiz.firebasestorage.app',
    messagingSenderId: '822531459966',
    appId: '1:822531459966:web:8e7d2385090e997eb1c12f',
  });

  const messaging = firebase.messaging();

  // Data-only messages need manual display; notification-payload messages are
  // shown automatically by the SDK — never add a second generic push listener.
  messaging.onBackgroundMessage((payload) => {
    if (payload.notification) return; // SDK already displayed it
    const title = (payload.data && payload.data.title) || 'নতুন আপডেট';
    const options = {
      body: (payload.data && payload.data.body) || 'আপনার জন্য একটি নতুন মেসেজ আছে।',
      icon: './icon-192.png',
      badge: './icon-192.png',
      data: payload.data || {},
    };
    self.registration.showNotification(title, options);
  });
} catch (_e) {
  // Offline during install — messaging simply stays unavailable until next update.
}

// ---- Notification click: focus the app or open the target URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const target = data.url || data.link || data.click_action || '/';
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windows) => {
        for (const win of windows) {
          if ('focus' in win) return win.focus();
        }
        if (self.clients.openWindow) return self.clients.openWindow(target);
        return null;
      })
  );
});
