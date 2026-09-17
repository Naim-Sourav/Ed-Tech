import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { WifiOff } from 'lucide-react';

/** Slim banner shown whenever the browser goes offline. */
const OfflineBanner: React.FC = () => {
  const [online, setOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          role="status"
          className="bg-gray-900 dark:bg-violet-500 text-white dark:text-black text-center text-xs font-bold py-2 px-4 flex items-center justify-center gap-2 overflow-hidden"
        >
          <WifiOff size={14} />
          ইন্টারনেট সংযোগ নেই — কিছু ফিচার অফলাইনে কাজ নাও করতে পারে
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineBanner;
