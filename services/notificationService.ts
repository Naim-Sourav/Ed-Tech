
import { messaging } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { syncUserToMongoDB } from './api';
import { User } from 'firebase/auth';

export const VAPID_PUBLIC_KEY = 'BA_eO1nS1GlGu41-4Aw2IOwv1K3k1O62NUSjpf153YgK1nbWZnK_K4MOsPzK6jAVPOR07mVymegydu_Nfv5Us4A';

/**
 * Requests notification permission and subscribes the user to push notifications
 */
export async function subscribeToPushNotifications(user: User | null) {
  if (!messaging || !('serviceWorker' in navigator)) {
    console.error('Messaging not supported or service worker not available');
    return null;
  }
  
  try {
    // Explicitly register the service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('Service Worker registered:', registration);

    const permission = await Notification.requestPermission();
    console.log('Notification permission status:', permission);
    
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: VAPID_PUBLIC_KEY,
        serviceWorkerRegistration: registration
      });
      
      if (token && user) {
        console.log('FCM Token generated successfully:', token);
        // Save token to MongoDB
        await syncUserToMongoDB(user, { fcmToken: token });
        return token;
      } else {
        console.warn('Token was not generated or user is not logged in.');
      }
    } else {
      console.warn('Notification permission denied by user.');
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
