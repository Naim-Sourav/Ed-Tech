
import React, { useState, useMemo, useEffect } from 'react';
import { logger } from '../utils/logger';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, Home, Swords, 
  Library, LogOut, ShieldCheck, Bell, Trophy, Archive, 
 Zap, Info, AlertTriangle, CheckCircle, Check,
  LayoutGrid, Bot, ChevronRight, X, Download, Share, Clock
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { isAdminEmail } from '../utils/adminConfig';
import { Notification } from '../types';
import { useToast } from './Toast';
import { subscribeToPushNotifications, checkSubscription } from '../services/notificationService';

interface NavigationProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  themeMode?: 'light' | 'dark' | 'system';
  toggleTheme: () => void;
  notifications: Notification[];
  readNotificationIds: Set<string>;
  setReadNotificationIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;
}

// Icon used inside the floating (dark) bottom bar — masked so it always takes the ink color
const BarIcon = ({ src, active, size = 'w-6 h-6' }: { src: string, active: boolean, size?: string }) => (
  <div
    className={`${size} transition-all duration-300 ${active ? 'bg-white' : 'bg-white/45'} group-active:scale-90`}
    style={{
      maskImage: `url(${src})`,
      WebkitMaskImage: `url(${src})`,
      maskRepeat: 'no-repeat',
      WebkitMaskRepeat: 'no-repeat',
      maskPosition: 'center',
      WebkitMaskPosition: 'center',
      maskSize: 'contain',
      WebkitMaskSize: 'contain'
    }}
  />
);

type MobileBarItem = { path: string; label: string; icon: string };

// One tappable cell of the floating bottom bar (icon + label, always labelled)
const BarLink = ({ item, active }: { item: MobileBarItem; active: boolean }) => (
  <Link
    to={item.path}
    aria-label={item.label}
    aria-current={active ? 'page' : undefined}
    onClick={() => { if (navigator.vibrate) navigator.vibrate(8); }}
    className={`group relative flex-1 flex flex-col items-center justify-center gap-[3px] py-1.5 transition-all duration-300 ${active ? 'text-white' : 'text-white/50'}`}
  >
    <span className={`flex h-8 w-full max-w-[54px] items-center justify-center rounded-full transition-all duration-300 ${active ? 'bg-white/10' : 'bg-transparent'}`}>
      <BarIcon src={item.icon} active={active} />
    </span>
    <span className={`text-[10px] sm:text-[10.5px] leading-none font-bold tracking-tight whitespace-nowrap transition-colors ${active ? 'text-white' : 'text-white/50'}`}>
      {item.label}
    </span>
  </Link>
);

const Navigation: React.FC<NavigationProps> = ({ 
  isMobileMenuOpen, 
  setIsMobileMenuOpen,
  themeMode,
  toggleTheme,
  notifications,
  readNotificationIds,
  setReadNotificationIds,
  isNotificationOpen,
  setIsNotificationOpen
}) => {
  const { currentUser, logout, userAvatar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [isPushSubscribed, setIsPushSubscribed] = useState(false);

  useEffect(() => {
    const checkPush = async () => {
      const subscribed = await checkSubscription();
      setIsPushSubscribed(subscribed);
    };
    
    checkPush();
    
    // Re-check when window gets focus (e.g. user returns from settings)
    window.addEventListener('focus', checkPush);
    return () => window.removeEventListener('focus', checkPush);
  }, [currentUser]);

  const handleEnablePush = async () => {
    const result = await subscribeToPushNotifications(currentUser);
    if (result && 'token' in result) {
      setIsPushSubscribed(true);
      showToast("পুশ নোটিফিকেশন চালু হয়েছে!", "success");
    } else if (result && 'error' in result) {
      showToast(result.error, "error");
    } else {
      showToast("পুশ নোটিফিকেশন চালু করা যায়নি। আবার চেষ্টা করুন।", "error");
    }
  };
  
  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Capture the install prompt event
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // We don't need to set showInstallBtn true here anymore, we show it by default unless installed
    };
    window.addEventListener('beforeinstallprompt', handler);

    // 2. Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
        setIsAppInstalled(true);
    }

    // 3. Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android/Chrome: Show native prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      // iOS Instruction
      showToast("Safari মেনু থেকে 'Add to Home Screen'-এ ক্লিক করুন", "info");
    } else {
      // Other browsers fallback
      showToast("ব্রাউজার মেনু থেকে 'Install App' বা 'Add to Home Screen' সিলেক্ট করুন", "info");
    }
  };

  const unreadCount = useMemo(() => {
      return notifications.filter(n => !readNotificationIds.has(n.id)).length;
  }, [notifications, readNotificationIds]);

  const displayedNotifications = useMemo(() => {
      if (filter === 'UNREAD') {
          return notifications.filter(n => !readNotificationIds.has(n.id));
      }
      return notifications;
  }, [notifications, filter, readNotificationIds]);

  const handleNotificationClick = (notification: Notification) => {
     setReadNotificationIds(prev => new Set(prev).add(notification.id));
     if(notification.actionLink) {
        if(notification.type === 'BATTLE_CHALLENGE' && notification.metadata?.roomId) {
            localStorage.setItem('battle_join_room', notification.metadata.roomId);
        }
        navigate(notification.actionLink);
        setIsNotificationOpen(false); 
     }
  };

  const markAllAsRead = () => {
      const newSet = new Set(readNotificationIds);
      notifications.forEach(n => newSet.add(n.id));
      setReadNotificationIds(newSet);
  };

  const navItems = [
    { path: '/dashboard', label: "হোম", icon: <Home size={18} /> },
    { path: '/exams', label: 'Exam Zone', icon: <LayoutGrid size={18} /> },
    { path: '/challenges', label: "চ্যালেঞ্জ", icon: <Zap size={18} /> },
    { path: '/bot', label: 'Porikkhangon AI', icon: <Bot size={18} /> },
    { path: '/courses', label: "কোর্সসমূহ", icon: <Library size={18} /> },
    { path: '/qbank', label: "প্রশ্ন ব্যাংক", icon: <Archive size={18} /> },
    { path: '/battle', label: "কুইজ ব্যাটল", icon: <Swords size={18} /> },
    { path: '/leaderboard', label: "লিডারবোর্ড", icon: <Trophy size={18} /> },
    { path: '/history', label: 'ইতিহাস', icon: <Clock size={18} /> },
    { path: '/admission', label: "ভর্তি তথ্য", icon: <GraduationCap size={18} /> },
  ];

  // Mobile Bottom Nav Items - Custom SVG Icons
  // The center slot is reserved for the raised "Exam" button (P logo)
  const mobileNavLeft: MobileBarItem[] = [
    { path: '/dashboard', label: 'হোম', icon: '/icons/home.svg' },
    { path: '/qbank', label: 'প্রশ্নব্যাংক', icon: '/icons/qbank.svg' },
  ];

  const mobileNavRight: MobileBarItem[] = [
    { path: '/history', label: 'ইতিহাস', icon: '/icons/history.svg' },
    { path: '/profile', label: 'প্রোফাইল', icon: '/icons/user.svg' },
  ];

  const examNavItem = { path: '/exams', label: 'এক্সাম' };

  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
      navigate('/');
    } catch (error) {
      logger.error("Failed to log out", error);
    }
  };

  const getThemeLabel = () => {
    if (themeMode === 'dark') return 'ডার্ক';
    if (themeMode === 'system') return 'অটো';
    return 'লাইট';
  };

  const getNotificationIcon = (type: string) => {
      switch(type) {
          case 'WARNING': return <AlertTriangle size={16} className="text-amber-600" />;
          case 'SUCCESS': return <CheckCircle size={16} className="text-orange-700 dark:text-orange-400" />;
          case 'BATTLE_CHALLENGE': return <Swords size={16} className="text-orange-700 dark:text-orange-400" />;
          case 'BATTLE_RESULT': return <Trophy size={16} className="text-amber-600" />;
          default: return <Info size={16} className="text-orange-700 dark:text-orange-400" />;
      }
  };

  const isActive = (path: string) => location.pathname === path;

  const renderAvatar = () => {
    if (userAvatar && userAvatar.startsWith('http')) {
        return <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />;
    }
    return (
        <div className="w-full h-full flex items-center justify-center bg-orange-500 text-white font-bold text-lg">
            {currentUser?.displayName?.charAt(0).toUpperCase() || 'U'}
        </div>
    );
  };

  if (!currentUser) return null;
  const showAdminLinks = isAdminEmail(currentUser?.email);

  return (
    <>
      {/* Mobile Sidebar Overlay & Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[140] md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              drag="x"
              dragConstraints={{ left: -300, right: 0 }}
              dragElastic={0.1}
              onDragEnd={(_, info) => {
                if (info.offset.x < -50) setIsMobileMenuOpen(false);
              }}
              className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-black border-r border-gray-200 dark:border-white/[0.05] z-[150] flex flex-col shadow-2xl md:hidden h-full"
            >
              <div className="p-5 border-b border-gray-100 dark:border-white/[0.05] flex items-center justify-between relative">
                <div className="flex items-center gap-1.5">
                  <img src="./Pshape.svg" alt="Porikkhangon Logo" className="h-12 w-auto object-contain logo-dark-mode" />
                  <img src="./letterlogo.svg" alt="Porikkhangon Letter Logo" className="h-7 w-auto object-contain logo-dark-mode" />
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-500">
                  <X size={20}/>
                </button>
                {/* Drag Handle Indicator */}
                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-200 dark:bg-zinc-800 rounded-full opacity-50" />
              </div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.05
                    }
                  }
                }}
                className="flex flex-col h-full overflow-hidden"
              >
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, x: -20, scale: 0.95 },
                    visible: { opacity: 1, x: 0, scale: 1 }
                  }}
                  className="p-4 border-b border-gray-100 dark:border-white/[0.05]"
                >
                  <Link 
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`w-full p-3 rounded-2xl flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-all text-left group border border-transparent hover:border-gray-100 dark:hover:border-white/[0.05] ${isActive('/profile') ? 'bg-gray-50 dark:bg-white/[0.03] border-gray-100 dark:border-white/[0.05]' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-white dark:border-white/[0.1] shadow-sm">
                       {renderAvatar()}
                    </div>
                    <div className="overflow-hidden flex-1">
                      <p className="text-sm font-bold text-gray-800 dark:text-zinc-100 truncate group-hover:text-primary transition-colors">
                        {currentUser.displayName || 'Learner'}
                      </p>
                      <p className="text-[12px] text-gray-500 dark:text-zinc-500 truncate flex items-center gap-1">
                        {"প্রোফাইল দেখুন"} <ChevronRight size={10}/>
                      </p>
                    </div>
                  </Link>
                </motion.div>

                <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                  {navItems.map((item) => (
                    <motion.div
                      key={item.path}
                      variants={{
                        hidden: { opacity: 0, x: -20, scale: 0.95 },
                        visible: { opacity: 1, x: 0, scale: 1 }
                      }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm ${
                          isActive(item.path)
                            ? 'bg-orange-50 dark:bg-primary/10 text-primary dark:text-orange-400 shadow-sm'
                            : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                  
                  {!isAppInstalled && (
                    <motion.button
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0 }
                      }}
                      onClick={handleInstallClick}
                      className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm text-gray-600 dark:text-zinc-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-700 dark:text-orange-400"
                    >
                      {isIOS ? <Share size={18} /> : <Download size={18} />}
                      <span>অ্যাপ ইনস্টল করুন</span>
                    </motion.button>
                  )}
                  
                  {showAdminLinks && (
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0 }
                      }}
                    >
                      <Link
                        to="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all duration-200 font-bold mt-6 text-sm ${
                          isActive('/admin')
                            ? 'bg-orange-100 dark:bg-zinc-800 text-orange-700 dark:text-orange-300'
                            : 'text-gray-500 dark:text-zinc-500 hover:bg-orange-50 dark:hover:bg-zinc-800/50 hover:text-orange-700 dark:hover:text-orange-300'
                        }`}
                      >
                        <ShieldCheck size={18} />
                        <span>{"অ্যাডমিন প্যানেল"}</span>
                      </Link>
                    </motion.div>
                  )}
                </nav>

                <div className="p-4 border-t border-gray-100 dark:border-white/[0.05] space-y-3 bg-white dark:bg-black">
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    className="grid grid-cols-2 gap-3"
                  >
                    <div className="flex items-center justify-center gap-2 p-1 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
                        <ThemeToggle themeMode={themeMode || 'system'} onToggle={toggleTheme} size="sm" />
                        <span className="pr-2 text-xs font-bold text-gray-600 dark:text-zinc-300">{getThemeLabel()}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-xs font-bold border border-red-100 dark:border-red-900/20 active:scale-95"
                    >
                        <LogOut size={16} /> {"লগআউট"}
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notification Drawer */}
      <AnimatePresence>
        {isNotificationOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[160]"
              onClick={() => setIsNotificationOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              drag="x"
              dragConstraints={{ left: 0, right: 300 }}
              dragElastic={0.1}
              onDragEnd={(_, info) => {
                if (info.offset.x > 50) setIsNotificationOpen(false);
              }}
              className="fixed inset-y-0 right-0 w-80 md:w-96 bg-white dark:bg-black z-[170] shadow-2xl border-l border-gray-200 dark:border-white/[0.05] flex flex-col"
            >
               <div className="p-4 bg-white dark:bg-black border-b border-gray-100 dark:border-white/[0.05] flex justify-between items-center">
                   <h4 className="text-base font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
                       নোটিফিকেশন <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">{unreadCount}</span>
                   </h4>
                   <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                          <button onClick={markAllAsRead} className="text-[12px] font-bold text-gray-500 hover:text-primary flex items-center gap-1 transition-colors">
                              <Check size={12}/> সব পঠিত
                          </button>
                      )}
                      <button onClick={() => setIsNotificationOpen(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-500">
                          <X size={20}/>
                      </button>
                   </div>
               </div>

               <div className="p-3 border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-black">
                   <div className="flex bg-gray-200 dark:bg-white/[0.03] p-1 rounded-xl">
                       <button 
                           onClick={() => setFilter('ALL')}
                           className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-all ${filter === 'ALL' ? 'bg-white dark:bg-white/[0.08] shadow-sm text-primary dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-zinc-400'}`}
                       >
                           সব
                       </button>
                       <button 
                           onClick={() => setFilter('UNREAD')}
                           className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-all ${filter === 'UNREAD' ? 'bg-white dark:bg-white/[0.08] shadow-sm text-primary dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-zinc-400'}`}
                       >
                           অপঠিত
                       </button>
                   </div>
               </div>

                {!isPushSubscribed && (
                    <div className="px-4 py-3 bg-orange-50 dark:bg-orange-900/10 border-b border-orange-100 dark:border-orange-900/20">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-700 dark:text-orange-400">
                                    <Bell size={16} />
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-gray-800 dark:text-zinc-200">পুশ নোটিফিকেশন অফ আছে</p>
                                    <p className="text-[9px] text-gray-500 dark:text-zinc-500">নতুন আপডেট পেতে এটি চালু করুন</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleEnablePush}
                                className="px-3 py-1.5 bg-primary text-white text-[12px] font-bold rounded-lg shadow-sm active:scale-95 transition-all"
                            >
                                চালু করুন
                            </button>
                        </div>
                    </div>
                )}

               <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30 dark:bg-black/20">
                  {displayedNotifications.length === 0 ? (
                     <div className="p-10 text-center flex flex-col items-center justify-center text-gray-400 mt-20">
                         <div className="w-16 h-16 bg-gray-100 dark:bg-white/[0.03] rounded-full flex items-center justify-center mb-3">
                           <Bell size={24} className="opacity-50"/>
                         </div>
                         <p className="text-sm font-medium">কোনো নোটিফিকেশন নেই</p>
                     </div>
                  ) : (
                     <motion.div
                       initial="hidden"
                       animate="visible"
                       variants={{
                         visible: {
                           transition: {
                             staggerChildren: 0.05
                           }
                         }
                       }}
                     >
                       {displayedNotifications.map((n) => {
                          const isRead = readNotificationIds.has(n.id);
                          return (
                              <motion.div 
                                 variants={{
                                   hidden: { opacity: 0, x: 20, scale: 0.95 },
                                   visible: { opacity: 1, x: 0, scale: 1 }
                                 }}
                                 drag="x"
                                 dragConstraints={{ left: -100, right: 0 }}
                                 dragElastic={0.2}
                                 onDragEnd={(_, info) => {
                                   if (info.offset.x < -80) {
                                     setReadNotificationIds(prev => new Set(prev).add(n.id));
                                   }
                                 }}
                                 key={n.id} 
                                 onClick={() => handleNotificationClick(n)}
                                 className={`p-4 border-b border-gray-100 dark:border-white/[0.05] transition-colors cursor-pointer active:bg-gray-100 dark:active:bg-white/[0.03] relative ${isRead ? 'bg-white dark:bg-black' : 'bg-orange-50/40 dark:bg-orange-900/10'}`}
                              >
                                 {!isRead && (
                                     <span className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full"></span>
                                 )}
                                 
                                 <div className="flex gap-3">
                                     <div className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
                                         n.type === 'SUCCESS' ? 'bg-orange-100 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800/50' : 
                                         n.type === 'WARNING' ? 'bg-yellow-100 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/50' : 
                                         n.type === 'BATTLE_CHALLENGE' ? 'bg-orange-100 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800/50' : 
                                         'bg-orange-100 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800/50'
                                     }`}>
                                         {getNotificationIcon(n.type)}
                                     </div>
                                     <div className="flex-1 min-w-0 pr-4">
                                         <div className="flex justify-between items-center mb-1">
                                             <p className={`text-xs font-bold truncate ${isRead ? 'text-gray-600 dark:text-zinc-300' : 'text-gray-900 dark:text-white'}`}>{n.title}</p>
                                             <span className="text-[9px] text-gray-400 whitespace-nowrap">{new Date(n.date).toLocaleDateString()}</span>
                                         </div>
                                         <p className={`text-[11px] leading-relaxed line-clamp-2 ${isRead ? 'text-gray-500 dark:text-zinc-500' : 'text-gray-700 dark:text-zinc-300'}`}>{n.message}</p>
                                     </div>
                                 </div>
                              </motion.div>
                          )
                       })}
                     </motion.div>
                  )}
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (Static or hidden on mobile) */}
      <div className={`
        hidden md:flex
        w-72 bg-white dark:bg-black border-r border-gray-200 dark:border-white/[0.05] flex-col h-full flex-shrink-0
      `}>
        <div className="p-5 border-b border-gray-100 dark:border-white/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <img src="./Pshape.svg" alt="Porikkhangon Logo" className="h-12 w-auto object-contain logo-dark-mode" />
            <img src="./letterlogo.svg" alt="Porikkhangon Letter Logo" className="h-7 w-auto object-contain logo-dark-mode" />
          </div>
          
          <div className="relative md:block hidden">
             <button 
                onClick={() => setIsNotificationOpen(true)} 
                className="p-2.5 rounded-full relative transition-all hover:bg-gray-50 dark:hover:bg-white/[0.03] text-gray-500 dark:text-zinc-400"
             >
                <Bell size={20}/>
                {unreadCount > 0 && (
                   <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-black animate-pulse"></span>
                )}
             </button>
          </div>
        </div>
 
        <div className="p-4 border-b border-gray-100 dark:border-white/[0.05]">
          <Link 
            to="/profile"
            className={`w-full p-3 rounded-2xl flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-all text-left group border border-transparent hover:border-gray-100 dark:hover:border-white/[0.05] ${isActive('/profile') ? 'bg-gray-50 dark:bg-white/[0.03] border-gray-100 dark:border-white/[0.05]' : ''}`}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-white dark:border-white/[0.1] shadow-sm">
               {renderAvatar()}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-gray-800 dark:text-zinc-100 truncate">
                {currentUser.displayName || 'Learner'}
              </p>
              <p className="text-[12px] text-gray-500 dark:text-zinc-500 truncate flex items-center gap-1">
                {"প্রোফাইল দেখুন"} <ChevronRight size={10}/>
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm ${
                isActive(item.path)
                  ? 'bg-orange-50 dark:bg-primary/10 text-primary dark:text-orange-400 shadow-sm'
                  : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}

          {!isAppInstalled && (
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm text-gray-600 dark:text-zinc-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-700 dark:text-orange-400"
            >
              {isIOS ? <Share size={18} /> : <Download size={18} />}
              <span>অ্যাপ ইনস্টল করুন</span>
            </button>
          )}
          
          {showAdminLinks && (
            <Link
              to="/admin"
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all duration-200 font-bold mt-6 text-sm ${
                isActive('/admin')
                  ? 'bg-orange-100 dark:bg-zinc-800 text-orange-700 dark:text-orange-300'
                  : 'text-gray-500 dark:text-zinc-500 hover:bg-orange-50 dark:hover:bg-zinc-800/50 hover:text-orange-700 dark:hover:text-orange-300'
              }`}
            >
              <ShieldCheck size={18} />
              <span>{"অ্যাডমিন প্যানেল"}</span>
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-white/[0.05] space-y-3 bg-white dark:bg-black">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-center gap-2 p-1 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
                <ThemeToggle themeMode={themeMode || 'system'} onToggle={toggleTheme} size="sm" />
                <span className="pr-2 text-xs font-bold text-gray-600 dark:text-zinc-300">{getThemeLabel()}</span>
            </div>
            <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-xs font-bold border border-red-100 dark:border-red-900/20"
            >
                <LogOut size={16} /> {"লগআউট"}
            </button>
          </div>
          <div className="text-[12px] text-center text-gray-400 dark:text-zinc-500 font-medium">
            <p>© ২০২৪ পরীক্ষাঙ্গন | v1.1 PWA</p>
          </div>
        </div>
      </div>

      {/* Floating Bottom Navigation — raised center button with the P (পরীক্ষা/Exam) logo */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] pointer-events-none">
        <div className="pointer-events-auto relative rounded-t-[1.9rem] bg-[#0B0B10]/[0.97] dark:bg-[#06060A] backdrop-blur-2xl ring-1 ring-white/10 shadow-[0_-14px_44px_rgba(0,0,0,0.28)] pt-2.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] px-1.5">

          {/* Soft green halo spilling out of the center button onto the bar */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-14 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/20 blur-2xl nav-halo" />

          <div className="relative flex items-stretch">
            {/* Left group */}
            {mobileNavLeft.map((item) => (
              <BarLink key={item.path} item={item} active={isActive(item.path)} />
            ))}

            {/* Center slot — kept clear so the raised button can sit on the bar's top edge */}
            <div className="w-[72px] sm:w-[84px] shrink-0 flex items-end justify-center pb-[3px]">
              <span className={`text-[10px] sm:text-[10.5px] leading-none font-bold tracking-tight whitespace-nowrap transition-colors ${isActive(examNavItem.path) ? 'text-emerald-300' : 'text-white/50'}`}>
                {examNavItem.label}
              </span>
            </div>

            {/* Right group */}
            {mobileNavRight.map((item) => (
              <BarLink key={item.path} item={item} active={isActive(item.path)} />
            ))}
          </div>

          {/* Raised Exam button — the "P" mark that stands for পরীক্ষা / Exam */}
          <Link
            to={examNavItem.path}
            aria-label="এক্সাম জোন"
            title="এক্সাম"
            onClick={() => { if (navigator.vibrate) navigator.vibrate(12); }}
            className={`nav-fab absolute left-1/2 -top-[28px] -translate-x-1/2 flex h-[58px] w-[58px] items-center justify-center rounded-[1.45rem] border-[3px] border-white bg-gradient-to-br from-[#9B7BFF] via-[#7C3AED] to-[#4C1D95] transition-transform duration-150 active:scale-95 ${isActive(examNavItem.path) ? 'nav-fab-active' : ''}`}
          >
            <img
              src="/icons/exam-p-glyph.png"
              alt=""
              aria-hidden="true"
              className="h-[27px] w-[27px] object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
            />
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navigation;
