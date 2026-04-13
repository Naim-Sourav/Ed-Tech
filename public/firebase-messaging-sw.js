// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBXXaWWoFqn6MpH6IWSm6CGaqUJzAmzbzA",
  authDomain: "dopamine-quiz.firebaseapp.com",
  projectId: "dopamine-quiz",
  storageBucket: "dopamine-quiz.firebasestorage.app",
  messagingSenderId: "822531459966",
  appId: "1:822531459966:web:8e7d2385090e997eb1c12f",
  measurementId: "G-6TWRMVGB18"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'নতুন আপডেট';
  const notificationOptions = {
    body: payload.notification?.body || 'আপনার জন্য একটি নতুন মেসেজ আছে।',
    icon: payload.notification?.image || '/logo192.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
