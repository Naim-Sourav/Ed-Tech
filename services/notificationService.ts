
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
    console.error('Notifications not supported in this browser');
    return null;
  }

  try {
    // 1. Request Permission First
    const permission = await Notification.requestPermission();
    console.log('Permission status:', permission);

    if (permission !== 'granted') {
      console.warn('Permission not granted');
      return null;
    }

    // 2. Ensure Messaging is available
    if (!messaging) {
      console.error('Firebase Messaging not initialized');
      return null;
    }

    // 3. Register Service Worker and get Token
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    });

    const token = await getToken(messaging, {
      vapidKey: VAPID_PUBLIC_KEY,
      serviceWorkerRegistration: registration
    });

    if (token && user) {
      console.log('Token generated:', token);
      await syncUserToMongoDB(user, { fcmToken: token });
      return token;
    }
  } catch (error) {
    console.error('Error in subscription:', error);
  }
  return null;
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
