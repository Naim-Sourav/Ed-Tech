
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

// Custom SVG Icon Component for Bottom Nav
const CustomIcon = ({ src, active, className }: { src: string, active: boolean, className?: string }) => (
  <div 
    className={`w-6 h-6 transition-all duration-300 ${active ? 'bg-brand dark:bg-brand-bright' : 'bg-ink/40 dark:bg-white/40'} ${className}`}
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
  const mobileNavItems = [
    { path: '/dashboard', label: 'হোম', icon: '/icons/home.svg' },
    { path: '/qbank', label: 'প্রশ্নব্যাংক', icon: '/icons/qbank.svg' },
    { path: '/exams', label: 'এক্সাম', icon: '/icons/exam.svg' },
    { path: '/history', label: 'ইতিহাস', icon: '/icons/history.svg' },
    { path: '/profile', label: 'প্রোফাইল', icon: '/icons/user.svg' },
  ];

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
          case 'SUCCESS': return <CheckCircle size={16} className="text-brand-deep dark:text-brand-bright" />;
          case 'BATTLE_CHALLENGE': return <Swords size={16} className="text-brand-deep dark:text-brand-bright" />;
          case 'BATTLE_RESULT': return <Trophy size={16} className="text-amber-600" />;
          default: return <Info size={16} className="text-brand-deep dark:text-brand-bright" />;
      }
  };

  const isActive = (path: string) => location.pathname === path;

  const renderAvatar = () => {
    if (userAvatar && userAvatar.startsWith('http')) {
        return <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />;
    }
    return (
        <div className="w-full h-full flex items-center justify-center ring-conic text-white font-bold text-lg">
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
              className="fixed inset-y-0 left-0 w-72 bg-paper dark:bg-ink-2 border-r border-ink/10 dark:border-white/10 z-[150] flex flex-col shadow-2xl md:hidden h-full"
            >
              <div className="p-5 border-b border-ink/6 dark:border-white/10 flex items-center justify-between relative">
                <div className="flex items-center gap-1.5">
                  <img src="./Pshape.svg" alt="Porikkhangon Logo" className="h-12 w-auto object-contain logo-dark-mode" />
                  <img src="./letterlogo.svg" alt="Porikkhangon Letter Logo" className="h-7 w-auto object-contain logo-dark-mode" />
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-ink/5 dark:hover:bg-white/10 text-mist">
                  <X size={20}/>
                </button>
                {/* Drag Handle Indicator */}
                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-ink/10 dark:bg-white/15 rounded-full opacity-50" />
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
                  className="p-4 border-b border-ink/6 dark:border-white/10"
                >
                  <Link 
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`w-full p-3 rounded-2xl flex items-center gap-3 hover:bg-ink/5 dark:hover:bg-white/[0.04] transition-all text-left group border border-transparent hover:border-ink/10 dark:hover:border-white/10 ${isActive('/profile') ? 'bg-mint/50 dark:bg-white/[0.06] border-ink/6 dark:border-white/10' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-white dark:border-white/[0.1] shadow-sm">
                       {renderAvatar()}
                    </div>
                    <div className="overflow-hidden flex-1">
                      <p className="text-sm font-bold text-ink dark:text-paper truncate group-hover:text-brand-deep dark:hover:text-brand-bright transition-colors">
                        {currentUser.displayName || 'Learner'}
                      </p>
                      <p className="text-[12px] text-mist truncate flex items-center gap-1">
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
                            ? 'bg-mint dark:bg-brand/15 text-brand-deep dark:text-brand-bright shadow-sm'
                            : 'text-ink/75 dark:text-white/75 hover:bg-ink/5 dark:hover:bg-white/10 hover:text-ink dark:hover:text-paper'
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
                      className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm text-ink/75 dark:text-white/75 hover:bg-mint/60 dark:hover:bg-brand/15 hover:text-brand-deep dark:hover:text-brand-bright"
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
                            ? 'bg-mint dark:bg-brand/20 text-brand-deep dark:text-brand-bright'
                            : 'text-mist hover:bg-mint/60 dark:hover:bg-white/[0.06] hover:text-brand-deep dark:hover:text-brand-bright'
                        }`}
                      >
                        <ShieldCheck size={18} />
                        <span>{"অ্যাডমিন প্যানেল"}</span>
                      </Link>
                    </motion.div>
                  )}
                </nav>

                <div className="p-4 border-t border-ink/6 dark:border-white/10 space-y-3 bg-paper dark:bg-ink-2">
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    className="grid grid-cols-2 gap-3"
                  >
                    <div className="flex items-center justify-center gap-2 p-1 rounded-xl bg-mint/50 dark:bg-white/[0.06] border border-ink/6 dark:border-white/10">
                        <ThemeToggle themeMode={themeMode || 'system'} onToggle={toggleTheme} size="sm" />
                        <span className="pr-2 text-xs font-bold text-ink/75 dark:text-white/80">{getThemeLabel()}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-flag/10 dark:bg-flag/15 text-flag hover:bg-flag/20 dark:hover:bg-flag/25 transition-colors text-xs font-bold border border-flag/25 dark:border-flag/30 active:scale-95"
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
              className="fixed inset-y-0 right-0 w-80 md:w-96 bg-paper dark:bg-ink-2 z-[170] shadow-2xl border-l border-ink/10 dark:border-white/10 flex flex-col"
            >
               <div className="p-4 bg-paper dark:bg-ink-2 border-b border-ink/6 dark:border-white/10 flex justify-between items-center">
                   <h4 className="text-base font-bold text-ink dark:text-paper flex items-center gap-2">
                       নোটিফিকেশন <span className="bg-brand/10 text-brand-deep dark:text-brand-bright px-2 py-0.5 rounded-full text-xs">{unreadCount}</span>
                   </h4>
                   <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                          <button onClick={markAllAsRead} className="text-[12px] font-bold text-mist hover:text-brand-deep dark:hover:text-brand-bright flex items-center gap-1 transition-colors">
                              <Check size={12}/> সব পঠিত
                          </button>
                      )}
                      <button onClick={() => setIsNotificationOpen(false)} className="p-2 rounded-full hover:bg-ink/5 dark:hover:bg-white/10 text-mist">
                          <X size={20}/>
                      </button>
                   </div>
               </div>

               <div className="p-3 border-b border-ink/6 dark:border-white/10 bg-paper dark:bg-ink-2">
                   <div className="flex bg-ink/8 dark:bg-white/[0.06] p-1 rounded-xl">
                       <button 
                           onClick={() => setFilter('ALL')}
                           className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-all ${filter === 'ALL' ? 'bg-white dark:bg-white/[0.08] shadow-sm text-brand-deep dark:text-paper' : 'text-mist hover:text-ink dark:hover:text-white/80'}`}
                       >
                           সব
                       </button>
                       <button 
                           onClick={() => setFilter('UNREAD')}
                           className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-all ${filter === 'UNREAD' ? 'bg-white dark:bg-white/[0.08] shadow-sm text-brand-deep dark:text-paper' : 'text-mist hover:text-ink dark:hover:text-white/80'}`}
                       >
                           অপঠিত
                       </button>
                   </div>
               </div>

                {!isPushSubscribed && (
                    <div className="px-4 py-3 bg-mint dark:bg-brand/10 border-b border-brand/15 dark:border-white/10">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-brand/15 dark:bg-brand/20 rounded-lg text-brand-deep dark:text-brand-bright">
                                    <Bell size={16} />
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-ink dark:text-paper">পুশ নোটিফিকেশন অফ আছে</p>
                                    <p className="text-[9px] text-mist">নতুন আপডেট পেতে এটি চালু করুন</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleEnablePush}
                                className="px-3 py-1.5 bg-brand text-white text-[12px] font-bold rounded-lg shadow-sm active:scale-95 transition-all"
                            >
                                চালু করুন
                            </button>
                        </div>
                    </div>
                )}

               <div className="flex-1 overflow-y-auto custom-scrollbar bg-mint/50/30 dark:bg-ink-2/20">
                  {displayedNotifications.length === 0 ? (
                     <div className="p-10 text-center flex flex-col items-center justify-center text-mist mt-20">
                         <div className="w-16 h-16 bg-ink/5 dark:bg-white/[0.06] rounded-full flex items-center justify-center mb-3">
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
                                 className={`p-4 border-b border-ink/6 dark:border-white/10 transition-colors cursor-pointer active:bg-ink/5 dark:active:bg-white/[0.06] relative ${isRead ? 'bg-paper dark:bg-ink-2' : 'bg-mint/50 dark:bg-brand/10'}`}
                              >
                                 {!isRead && (
                                     <span className="absolute top-4 right-4 w-2 h-2 bg-brand rounded-full"></span>
                                 )}
                                 
                                 <div className="flex gap-3">
                                     <div className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
                                         n.type === 'SUCCESS' ? 'bg-brand/12 border-brand/25 dark:bg-brand/20 dark:border-brand/30' : 
                                         n.type === 'WARNING' ? 'bg-yellow-100 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/50' : 
                                         n.type === 'BATTLE_CHALLENGE' ? 'bg-brand/12 border-brand/25 dark:bg-brand/20 dark:border-brand/30' : 
                                         'bg-brand/12 border-brand/25 dark:bg-brand/20 dark:border-brand/30'
                                     }`}>
                                         {getNotificationIcon(n.type)}
                                     </div>
                                     <div className="flex-1 min-w-0 pr-4">
                                         <div className="flex justify-between items-center mb-1">
                                             <p className={`text-xs font-bold truncate ${isRead ? 'text-ink/75 dark:text-white/80' : 'text-ink dark:text-paper'}`}>{n.title}</p>
                                             <span className="text-[9px] text-mist whitespace-nowrap">{new Date(n.date).toLocaleDateString()}</span>
                                         </div>
                                         <p className={`text-[11px] leading-relaxed line-clamp-2 ${isRead ? 'text-mist' : 'text-ink/80 dark:text-white/80'}`}>{n.message}</p>
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
        w-72 bg-paper dark:bg-ink-2 border-r border-ink/10 dark:border-white/10 flex-col h-full flex-shrink-0
      `}>
        <div className="p-5 border-b border-ink/6 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <img src="./Pshape.svg" alt="Porikkhangon Logo" className="h-12 w-auto object-contain logo-dark-mode" />
            <img src="./letterlogo.svg" alt="Porikkhangon Letter Logo" className="h-7 w-auto object-contain logo-dark-mode" />
          </div>
          
          <div className="relative md:block hidden">
             <button 
                onClick={() => setIsNotificationOpen(true)} 
                className="p-2.5 rounded-full relative transition-all hover:bg-ink/5 dark:hover:bg-white/[0.03] text-mist dark:text-white/75"
             >
                <Bell size={20}/>
                {unreadCount > 0 && (
                   <span className="absolute top-2 right-2.5 w-2 h-2 bg-flag rounded-full ring-2 ring-paper dark:ring-ink-2 animate-pulse"></span>
                )}
             </button>
          </div>
        </div>
 
        <div className="p-4 border-b border-ink/6 dark:border-white/10">
          <Link 
            to="/profile"
            className={`w-full p-3 rounded-2xl flex items-center gap-3 hover:bg-ink/5 dark:hover:bg-white/[0.04] transition-all text-left group border border-transparent hover:border-ink/10 dark:hover:border-white/10 ${isActive('/profile') ? 'bg-mint/50 dark:bg-white/[0.06] border-ink/6 dark:border-white/10' : ''}`}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-white dark:border-white/[0.1] shadow-sm">
               {renderAvatar()}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-ink dark:text-paper truncate">
                {currentUser.displayName || 'Learner'}
              </p>
              <p className="text-[12px] text-mist truncate flex items-center gap-1">
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
                  ? 'bg-mint dark:bg-brand/15 text-brand-deep dark:text-brand-bright shadow-sm'
                  : 'text-ink/75 dark:text-white/75 hover:bg-ink/5 dark:hover:bg-white/10 hover:text-ink dark:hover:text-paper'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}

          {!isAppInstalled && (
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm text-ink/75 dark:text-white/75 hover:bg-mint/60 dark:hover:bg-brand/15 hover:text-brand-deep dark:hover:text-brand-bright"
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
                  ? 'bg-mint dark:bg-brand/20 text-brand-deep dark:text-brand-bright'
                  : 'text-mist hover:bg-mint/60 dark:hover:bg-white/[0.06] hover:text-brand-deep dark:hover:text-brand-bright'
              }`}
            >
              <ShieldCheck size={18} />
              <span>{"অ্যাডমিন প্যানেল"}</span>
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-ink/6 dark:border-white/10 space-y-3 bg-paper dark:bg-ink-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-center gap-2 p-1 rounded-xl bg-mint/50 dark:bg-white/[0.06] border border-ink/6 dark:border-white/10">
                <ThemeToggle themeMode={themeMode || 'system'} onToggle={toggleTheme} size="sm" />
                <span className="pr-2 text-xs font-bold text-ink/75 dark:text-white/80">{getThemeLabel()}</span>
            </div>
            <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-flag/10 dark:bg-flag/15 text-flag hover:bg-flag/20 dark:hover:bg-flag/25 transition-colors text-xs font-bold border border-flag/25 dark:border-flag/30"
            >
                <LogOut size={16} /> {"লগআউট"}
            </button>
          </div>
          <div className="text-[12px] text-center text-mist font-medium">
            <p>© ২০২৪ পরীক্ষাঙ্গন | v1.1 PWA</p>
          </div>
        </div>
      </div>

      {/* Native-like Fixed Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-paper/95 dark:bg-ink-2/95 backdrop-blur-xl border-t border-ink/6 dark:border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16 px-1 relative">
          {mobileNavItems.map((item, idx) => {
            const active = item.path ? isActive(item.path) : false;
            
            return (
              <Link 
                key={idx} 
                to={item.path!} 
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(10);
                }}
                className={`flex-1 flex flex-col items-center justify-center h-full transition-all duration-300 relative z-10 ${active ? 'text-brand-deep dark:text-brand-bright' : 'text-mist'}`}
              >
                {/* 2px top-border indicator above the active icon */}
                {active && (
                  <motion.div 
                    layoutId="activeNavIndicatorLine"
                    className="absolute top-0 left-5 right-5 h-[2px] bg-brand dark:bg-brand-bright rounded-full"
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                  />
                )}
                
                <div className={`flex flex-col items-center ${active ? 'gap-0.5' : ''}`}>
                  <CustomIcon 
                    src={item.icon} 
                    active={active} 
                  />
                  {active && (
                    <span className="text-[12px] font-bold text-brand-deep dark:text-brand-bright transition-all duration-300 tracking-tight font-sans">
                      {item.label}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  );
};

export default Navigation;
