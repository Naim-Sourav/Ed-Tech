import React, { useEffect, useState } from 'react';
import { getToken } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { messaging, db } from '../firebase'; // আপনার firebase.ts এর সঠিক পাথ নিশ্চিত করুন
import { useAuth } from '../contexts/AuthContext';

export const NotificationBanner = () => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isVisible, setIsVisible] = useState(false);
  const { currentUser } = useAuth(); // লগ-ইন করা ইউজারের ইনফো নেওয়ার জন্য

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
      if (Notification.permission === 'default') {
        setIsVisible(true);
      }
    }
  }, []);

  const handleRequestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      setIsVisible(false);

      if (permission === 'granted') {
        console.log('[Push] Notification permission granted!');
        
        // ১. আপনার VAPID Key দিয়ে ফায়ারবেস থেকে টোকেন সংগ্রহ করা
        const currentToken = await getToken(messaging, {
          vapidKey: 'BA_eO1nS1GlGu41-4Aw2lOwv1K3k1062NUsjpf153YgK1nbWZnK_K4MOsPzK6jAVPOR07mVymegydu_Nfv5Us4A'
        });

        if (currentToken) {
          console.log('[Push] FCM Token Generated:', currentToken);

          // ২. টোকেনটি Firestore ডাটাবেসে ইউজারের প্রোফাইলে সেভ করা
          if (currentUser?.uid) {
            const tokenRef = doc(db, 'users', currentUser.uid, 'fcmTokens', currentToken);
            await setDoc(tokenRef, {
              token: currentToken,
              createdAt: Date.now(),
              deviceInfo: navigator.userAgent
            }, { merge: true });
            console.log('[Push] Token saved to Firestore successfully!');
          }

          // ৩. ইউজারকে একটি ওয়েলকাম নোটিফিকেশন দেখানো
          new Notification('ধন্যবাদ!', {
            body: 'এখন থেকে আপনি পরীক্ষাঙ্গনের সব নতুন আপডেট পেয়ে যাবেন।',
            icon: './Pshape.svg'
          });

        } else {
          console.log('[Push] No registration token available. Request permission to generate one.');
        }
      } else {
        console.log('[Push] Notification permission denied.');
      }
    } catch (error) {
      console.error('[Push] Error during token generation:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-700 border border-orange-200 dark:border-gray-600 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="bg-orange-500 text-white p-2 rounded-full shadow-md shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div>
          <h3 className="text-gray-900 dark:text-white font-bold text-sm sm:text-base">নতুন আপডেট পেতে চান?</h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
            নতুন এক্সাম ব্যাচ, লিডারবোর্ড র‍্যাংক এবং ডেইলি কোয়েস্টের আপডেট মিস না করতে চাইলে নোটিফিকেশন চালু করুন।
          </p>
        </div>
      </div>
      <div className="flex gap-2 w-full sm:w-auto shrink-0">
        <button 
          onClick={() => setIsVisible(false)}
          className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors w-full sm:w-auto"
        >
          পরে
        </button>
        <button 
          onClick={handleRequestPermission}
          className="px-4 py-2 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-lg shadow-md transition-all active:scale-95 w-full sm:w-auto"
        >
          চালু করুন
        </button>
      </div>
    </div>
  );
};
