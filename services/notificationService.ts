
import { messaging } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { syncUserToMongoDB } from './api';
import { User } from 'firebase/auth';

export const VAPID_PUBLIC_KEY = 'BA_eO1nS1GlGu41-4Aw2IOwv1K3k1O62NUSjpf153YgK1nbWZnK_K4MOsPzK6jAVPOR07mVymegydu_Nfv5Us4A';

/**
 * Requests notification permission and subscribes the user to push notifications
 */
export async function subscribeToPushNotifications(user: User | null) {
  if (!messaging) return null;
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: VAPID_PUBLIC_KEY
      });
      
      if (token && user) {
        console.log('FCM Token:', token);
        // Save token to MongoDB via syncUserToMongoDB
        await syncUserToMongoDB(user, { fcmToken: token });
        return token;
      }
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
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
