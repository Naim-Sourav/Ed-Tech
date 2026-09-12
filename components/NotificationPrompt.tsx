import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BellRing, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import { subscribeToPushNotifications } from '../services/notificationService';

const DISMISS_KEY = 'push_prompt_dismissed_at';
const RE_PROMPT_DAYS = 7;

/**
 * Soft prompt asking logged-in users to enable push notifications.
 * Shown only while permission is 'default' and the user hasn't dismissed
 * recently. Previously nothing ever asked new users (dead code path).
 */
const NotificationPrompt: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'default') return;
    try {
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
      if (Date.now() - dismissedAt < RE_PROMPT_DAYS * 86400000) return;
    } catch (_e) {
      // localStorage unavailable — still prompt
    }
    const timer = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(timer);
  }, [currentUser]);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch (_e) {
      // ignore
    }
    setVisible(false);
  };

  const enable = async () => {
    setBusy(true);
    try {
      const res = await subscribeToPushNotifications(currentUser);
      if (res && 'token' in res && res.token) {
        showToast('নোটিফিকেশন চালু হয়েছে! 🔔', 'success');
        setVisible(false);
      } else {
        showToast((res as any)?.error || 'নোটিফিকেশন চালু করা যায়নি', 'error');
        if (Notification.permission === 'denied') setVisible(false);
      }
    } catch (_e) {
      showToast('নোটিফিকেশন চালু করা যায়নি', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          role="dialog"
          aria-label="নোটিফিকেশন চালু করুন"
          className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[9000] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 flex items-start gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-700 dark:text-orange-400 flex items-center justify-center shrink-0">
            <BellRing size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-gray-900 dark:text-white">পরীক্ষার আপডেট মিস করবেন না</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
              নতুন মডেল টেস্ট, রেজাল্ট ও ব্যাটল চ্যালেঞ্জের নোটিফিকেশন পান।
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={enable}
                disabled={busy}
                className="flex-1 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors disabled:opacity-60"
              >
                {busy ? 'চালু হচ্ছে…' : 'চালু করুন'}
              </button>
              <button
                onClick={dismiss}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 text-xs font-bold transition-colors"
              >
                পরে
              </button>
            </div>
          </div>
          <button
            onClick={dismiss}
            aria-label="বন্ধ করুন"
            className="p-1 -m-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPrompt;
