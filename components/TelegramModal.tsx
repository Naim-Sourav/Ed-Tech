import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const TelegramModal: React.FC = () => {
  const { currentUser } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    
    const hasSeenModal = localStorage.getItem('hasSeenTelegramModal');
    if (!hasSeenModal) {
      const timer = setTimeout(() => {
        setShow(true);
      }, 5000); // Show after 5 seconds of entering the app
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  const handleClose = () => {
    setShow(false);
    localStorage.setItem('hasSeenTelegramModal', 'true');
  };

  const handleJoin = () => {
    window.open('https://t.me/porikkhangon', '_blank');
    handleClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden relative border border-gray-100 dark:border-zinc-800"
          >
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10 bg-gray-50 dark:bg-zinc-800/50 rounded-full"
            >
              <X size={20} />
            </button>

            <div className="p-8 pb-6 flex flex-col items-center text-center relative z-10">
              <div className="w-20 h-20 bg-gradient-to-tr from-sky-400 to-blue-600 rounded-[1.5rem] flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/30 rotate-3 transition-transform hover:rotate-6">
                <MessageCircle size={40} className="-rotate-3" fill="currentColor" />
              </div>
              
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                টেলিগ্রাম চ্যানেলে যুক্ত হোন!
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium mb-6">
                পরীক্ষাঙ্গন এর নিত্যনতুন আপডেট, ফ্রি এক্সাম রুটিন, এবং প্রয়োজনীয় পিডিএফ পেতে আমাদের টেলিগ্রাম চ্যানেলে যুক্ত থাকুন।
              </p>

              <button
                onClick={handleJoin}
                className="w-full bg-[#0088cc] hover:bg-[#007ab8] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-blue-500/20"
              >
                যুক্ত হোন <ExternalLink size={18} />
              </button>
              
              <button
                onClick={handleClose}
                className="w-full mt-3 py-3 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                এখন নয়
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default TelegramModal;
