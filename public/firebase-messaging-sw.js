// ফায়ারবেসের লাইব্রেরিগুলো ইমপোর্ট করা হচ্ছে
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// আপনার firebase.ts এর কনফিগারেশন
const firebaseConfig = {
  apiKey: "AIzaSyBXXaWWoFqn6MpH6IWSm6CGaqUJzAmzbzA",
  authDomain: "dopamine-quiz.firebaseapp.com",
  projectId: "dopamine-quiz",
  storageBucket: "dopamine-quiz.firebasestorage.app",
  messagingSenderId: "822531459966",
  appId: "1:822531459966:web:8e7d2385090e997eb1c12f",
  measurementId: "G-6TWRMVGB18"
};

// ফায়ারবেস ইনিশিয়ালাইজ করা
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// ব্যাকগ্রাউন্ডে নোটিফিকেশন রিসিভ করার কোড
messaging.onBackgroundMessage(function(payload) {
  console.log('[Firebase SW] Received background message ', payload);
  
  const notificationTitle = payload.notification.title || 'নতুন নোটিফিকেশন';
  const notificationOptions = {
    body: payload.notification.body,
    icon: './Pshape.svg', // আপনার অ্যাপের আইকন
    badge: './Pshape.svg',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
