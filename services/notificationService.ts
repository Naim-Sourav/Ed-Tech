
import { messaging } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { syncUserToMongoDB } from './api';
import { User } from 'firebase/auth';

export const VAPID_PUBLIC_KEY = 'BA_eO1nS1GlGu41-4Aw2IOwv1K3k1O62NUSjpf153YgK1nbWZnK_K4MOsPzK6jAVPOR07mVymegydu_Nfv5Us4A';

/**
 * Requests notification permission and subscribes the user to push notifications
 */
export async function subscribeToPushNotifications(user: User | null) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { error: 'এই ব্রাউজারে নোটিফিকেশন সাপোর্ট করে না' };
  }

  try {
    // 1. Request Permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { error: 'নোটিফিকেশন পারমিশন দেওয়া হয়নি। ব্রাউজার সেটিংস থেকে Allow করুন।' };
    }

    if (!messaging) {
      return { error: 'Firebase Messaging শুরু করা যায়নি।' };
    }

    // 2. Register Service Worker with relative path for GitHub Pages compatibility
    // We use a relative path and wait for it to be ready
    const swPath = './firebase-messaging-sw.js';
    const registration = await navigator.serviceWorker.register(swPath);
    
    // Wait for the service worker to be active
    await navigator.serviceWorker.ready;

    // 3. Get Token
    const token = await getToken(messaging, {
      vapidKey: VAPID_PUBLIC_KEY,
      serviceWorkerRegistration: registration
    });

    if (token && user) {
      console.log('Token generated successfully');
      await syncUserToMongoDB(user, { fcmToken: token });
      return { token };
    }
    
    return { error: 'টোকেন জেনারেট করা যায়নি। আবার চেষ্টা করুন।' };
  } catch (error: any) {
    console.error('Detailed Error:', error);
    // Provide user-friendly error messages based on common Firebase errors
    if (error.code === 'messaging/permission-blocked') {
      return { error: 'নোটিফিকেশন ব্লক করা আছে। সেটিংস থেকে পারমিশন রিসেট করুন।' };
    } else if (error.code === 'messaging/failed-serviceworker-registration') {
      return { error: 'সার্ভিস ওয়ার্কার রেজিস্টার করা যায়নি। পেজটি রিফ্রেশ করুন।' };
    }
    return { error: `সমস্যা: ${error.message || 'অজানা সমস্যা হয়েছে'}` };
  }
}

/**
 * Checks if the user is already subscribed
 */
export async function checkSubscription() {
  if (!('Notification' in window)) return false;
  return Notification.permission === 'granted';
}

/**
 * Listen for foreground messages
 */
export function onForegroundMessage(callback: (payload: any) => void) {
  if (!messaging) return () => {};
  return onMessage(messaging, (payload) => {
    console.log('Message received in foreground: ', payload);
    callback(payload);
  });
}
