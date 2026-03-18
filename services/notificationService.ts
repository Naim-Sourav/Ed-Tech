
export const VAPID_PUBLIC_KEY = 'BA_eO1nS1GlGu41-4Aw2lOwv1K3k1062NUsjpf153YgK1nbWZnK_K4MOsPzK6jAVPOR07mVymegydu_Nfv5Us4A';

/**
 * Requests notification permission and subscribes the user to push notifications
 */
export async function subscribeToPushNotifications() {
  console.log('Push notifications are currently disabled.');
  return null;
}

/**
 * Checks if the user is already subscribed
 */
export async function checkSubscription() {
  return false;
}
