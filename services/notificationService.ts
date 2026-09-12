
import { messaging } from './firebase';
import { logger } from '../utils/logger';
import { getToken, onMessage } from 'firebase/messaging';
import { syncUserToMongoDB } from './api';
import { User } from 'firebase/auth';

export const VAPID_PUBLIC_KEY = 'BDCyoL9qnbTFyt01O1yKke5iR918d5tBjxMRHM5ks57HmrGnfinm4WnUsDi71B9lRWEqMOn5HVdOqqFDtMu61lM';

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

    // 2. Register the single app Service Worker (also handles FCM background
    // messages — see public/sw.js). One worker per scope: never register a
    // second one here or they will fight over control.
    const swPath = './sw.js';
    const registration = await navigator.serviceWorker.register(swPath, {
      scope: './'
    });
    
    // Wait for the service worker to be active
    await navigator.serviceWorker.ready;

    // 3. Get Token
    const token = await getToken(messaging, {
      vapidKey: VAPID_PUBLIC_KEY,
      serviceWorkerRegistration: registration
    });

    if (token && user) {
      logger.debug('Token generated successfully');
      await syncUserToMongoDB(user, { fcmToken: token });
      return { token };
    }
    
    return { error: 'টোকেন জেনারেট করা যায়নি। আবার চেষ্টা করুন।' };
  } catch (error: any) {
    logger.error('Detailed Error:', error);
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
    logger.debug('Message received in foreground: ', payload);
    callback(payload);
  });
}
