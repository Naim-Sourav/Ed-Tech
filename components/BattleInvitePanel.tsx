import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { UserPlus } from 'lucide-react';
import { toBengaliNumber } from '../utils/numberUtils';
import { listenToOnlineUsers, sendBattleInvite } from '../services/battleService';

export const PlayerAvatar: React.FC<{ src?: string | null; name?: string | null; className?: string }> = ({ src, name, className = '' }) => {
  if (src) {
    return <img src={src} alt={name || 'player'} className={`${className} object-cover bg-gray-100 dark:bg-zinc-800`} />;
  }
  return (
    <div
      className={`${className} flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-950/40 dark:to-amber-950/30 text-orange-700 dark:text-orange-400 font-black select-none`}
      aria-label={name || undefined}
    >
      {(name || 'P').trim().charAt(0).toUpperCase()}
    </div>
  );
};

export const OnlinePlayersInvitePanel: React.FC<{
  roomId: string;
  battleConfig: any;
  currentUser: any;
  userAvatar: string;
  showToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}> = ({ roomId, battleConfig, currentUser, userAvatar, showToast }) => {
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [invitedUids, setInvitedUids] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = listenToOnlineUsers(currentUser.uid, (users) => {
      setOnlineUsers(users);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const handleInvite = async (user: any) => {
    if (!currentUser) return;
    try {
      const subject = (battleConfig && battleConfig.subjects && battleConfig.subjects[0]) || 'All';
      const chapter = (battleConfig && battleConfig.chapters && battleConfig.chapters[0]) || 'Full Syllabus';

      await sendBattleInvite(
        user.uid,
        roomId,
        { uid: currentUser.uid, name: currentUser.displayName || 'Anonymous', avatar: userAvatar },
        subject,
        chapter
      );

      setInvitedUids(prev => ({ ...prev, [user.uid]: true }));
      showToast(`${user.name}-কে চ্যালেঞ্জ পাঠানো হয়েছে!`, 'success');

      // Re-enable the invite button after 15 seconds
      setTimeout(() => {
        setInvitedUids(prev => ({ ...prev, [user.uid]: false }));
      }, 15000);
    } catch (err: any) {
      logger.error(err);
      showToast("চ্যালেঞ্জ পাঠাতে ব্যর্থ হয়েছে।", "error");
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm p-5 space-y-3.5 max-w-md mx-auto w-full relative z-30">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-gray-900 dark:text-white text-sm flex items-center gap-2">
          <span className="relative flex w-2 h-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping"></span>
            <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-500"></span>
          </span>
          অনলাইন প্লেয়ার ({toBengaliNumber(onlineUsers.length)})
        </h3>
        <span className="text-[11px] font-medium text-gray-400 dark:text-zinc-500">
          বন্ধুকে চ্যালেঞ্জ পাঠান
        </span>
      </div>

      {onlineUsers.length === 0 ? (
        <div className="py-6 text-center space-y-1">
          <UserPlus size={22} className="mx-auto text-gray-300 dark:text-zinc-600 mb-1" />
          <p className="text-sm font-bold text-gray-400 dark:text-zinc-500">এখন কেউ অনলাইনে নেই</p>
          <p className="text-xs text-gray-400/80 dark:text-zinc-600 font-medium">রুম কোডটি বন্ধুদের সাথে শেয়ার করুন</p>
        </div>
      ) : (
        <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2 pr-1">
          {onlineUsers.map(user => (
            <div
              key={user.uid}
              className="flex items-center justify-between p-2.5 rounded-2xl border border-gray-50 dark:border-white/5 bg-gray-50/60 dark:bg-white/[0.02] hover:border-primary/20 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <PlayerAvatar src={user.avatar} name={user.name} className="w-10 h-10 rounded-xl" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
                </div>
                <span className="font-bold text-gray-800 dark:text-zinc-200 text-sm truncate max-w-[150px]">
                  {user.name}
                </span>
              </div>

              <button
                disabled={invitedUids[user.uid]}
                onClick={() => handleInvite(user)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  invitedUids[user.uid]
                    ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary/90 active:scale-95 shadow-md shadow-primary/20'
                }`}
              >
                {invitedUids[user.uid] ? 'পাঠানো হয়েছে' : 'ইনভাইট'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
