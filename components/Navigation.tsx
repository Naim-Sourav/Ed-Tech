
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, Home, PieChart, Moon, Sun, Swords, 
  Library, LogOut, User, ShieldCheck, Bell, Trophy, Archive, 
  Monitor, Zap, Info, AlertTriangle, CheckCircle, Check,
  LayoutGrid, Bot, BookOpen, ChevronRight, X, Download, Share
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Notification } from '../types';
import { useToast } from './Toast';

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
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  
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
    { path: '/dashboard', label: t('nav_home'), icon: <Home size={18} /> },
    { path: '/exams', label: 'Exam Zone', icon: <LayoutGrid size={18} /> },
    { path: '/challenges', label: t('nav_challenges'), icon: <Zap size={18} /> },
    { path: '/bot', label: 'Porikkhangon AI', icon: <Bot size={18} /> },
    { path: '/courses', label: t('nav_courses'), icon: <Library size={18} /> },
    { path: '/qbank', label: t('nav_qbank'), icon: <Archive size={18} /> },
    { path: '/battle', label: t('nav_battle'), icon: <Swords size={18} /> },
    { path: '/leaderboard', label: t('nav_leaderboard'), icon: <Trophy size={18} /> },
    { path: '/planner', label: t('nav_tracker'), icon: <PieChart size={18} /> },
    { path: '/admission', label: t('nav_admission'), icon: <GraduationCap size={18} /> },
  ];

  // Mobile Bottom Nav Items - Optimized for touch
  const mobileNavItems = [
    { path: '/dashboard', label: 'Home', icon: <Home size={24} /> },
    { path: '/courses', label: 'Courses', icon: <BookOpen size={24} /> },
    { path: '/exams', label: 'Exams', icon: <LayoutGrid size={24} /> },
    { path: '/bot', label: 'AI Bot', icon: <Bot size={24} /> },
    { path: '/profile', label: 'Profile', icon: <User size={24} /> },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const getThemeIcon = () => {
    if (themeMode === 'dark') return <Moon size={16} />;
    if (themeMode === 'system') return <Monitor size={16} />;
    return <Sun size={16} />;
  };

  const getThemeLabel = () => {
    if (themeMode === 'dark') return 'ডার্ক';
    if (themeMode === 'system') return 'অটো';
    return 'লাইট';
  };

  const getNotificationIcon = (type: string) => {
      switch(type) {
          case 'WARNING': return <AlertTriangle size={16} className="text-amber-600" />;
          case 'SUCCESS': return <CheckCircle size={16} className="text-orange-600" />;
          case 'BATTLE_CHALLENGE': return <Swords size={16} className="text-orange-600" />;
          case 'BATTLE_RESULT': return <Trophy size={16} className="text-amber-600" />;
          default: return <Info size={16} className="text-orange-600" />;
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
  const ADMIN_EMAIL = "nurnaimsourav@gmail.com";

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
              <div className="p-5 pt-safe-area border-b border-gray-100 dark:border-white/[0.05] flex items-center justify-between relative">
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
                      <p className="text-[10px] text-gray-500 dark:text-zinc-500 truncate flex items-center gap-1">
                        {t('nav_profile_view')} <ChevronRight size={10}/>
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
                      className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm text-gray-600 dark:text-zinc-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400"
                    >
                      {isIOS ? <Share size={18} /> : <Download size={18} />}
                      <span>অ্যাপ ইনস্টল করুন</span>
                    </motion.button>
                  )}
                  
                  {currentUser.email === ADMIN_EMAIL && (
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
                        <span>{t('nav_admin')}</span>
                      </Link>
                    </motion.div>
                  )}
                </nav>

                <div className="p-4 pb-safe-area border-t border-gray-100 dark:border-white/[0.05] space-y-3 bg-white dark:bg-black">
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    className="grid grid-cols-2 gap-3"
                  >
                    <button
                        onClick={toggleTheme}
                        className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors text-xs font-bold border border-gray-100 dark:border-white/[0.05] active:scale-95"
                    >
                        {getThemeIcon()} {getThemeLabel()}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-xs font-bold border border-red-100 dark:border-red-900/20 active:scale-95"
                    >
                        <LogOut size={16} /> {t('nav_logout')}
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
               <div className="p-4 pt-safe-area bg-white dark:bg-black border-b border-gray-100 dark:border-white/[0.05] flex justify-between items-center">
                   <h4 className="text-base font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
                       নোটিফিকেশন <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">{unreadCount}</span>
                   </h4>
                   <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                          <button onClick={markAllAsRead} className="text-[10px] font-bold text-gray-500 hover:text-primary flex items-center gap-1 transition-colors">
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
                           className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${filter === 'ALL' ? 'bg-white dark:bg-white/[0.08] shadow-sm text-primary dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-zinc-400'}`}
                       >
                           সব
                       </button>
                       <button 
                           onClick={() => setFilter('UNREAD')}
                           className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${filter === 'UNREAD' ? 'bg-white dark:bg-white/[0.08] shadow-sm text-primary dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-zinc-400'}`}
                       >
                           অপঠিত
                       </button>
                   </div>
               </div>

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
              <p className="text-[10px] text-gray-500 dark:text-zinc-500 truncate flex items-center gap-1">
                {t('nav_profile_view')} <ChevronRight size={10}/>
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
              className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm text-gray-600 dark:text-zinc-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400"
            >
              {isIOS ? <Share size={18} /> : <Download size={18} />}
              <span>অ্যাপ ইনস্টল করুন</span>
            </button>
          )}
          
          {currentUser.email === ADMIN_EMAIL && (
            <Link
              to="/admin"
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all duration-200 font-bold mt-6 text-sm ${
                isActive('/admin')
                  ? 'bg-orange-100 dark:bg-zinc-800 text-orange-700 dark:text-orange-300'
                  : 'text-gray-500 dark:text-zinc-500 hover:bg-orange-50 dark:hover:bg-zinc-800/50 hover:text-orange-700 dark:hover:text-orange-300'
              }`}
            >
              <ShieldCheck size={18} />
              <span>{t('nav_admin')}</span>
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-white/[0.05] space-y-3 bg-white dark:bg-black">
          <div className="grid grid-cols-2 gap-3">
            <button
                onClick={toggleTheme}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors text-xs font-bold border border-gray-100 dark:border-white/[0.05]"
            >
                {getThemeIcon()} {getThemeLabel()}
            </button>
            <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-xs font-bold border border-red-100 dark:border-red-900/20"
            >
                <LogOut size={16} /> {t('nav_logout')}
            </button>
          </div>
          <div className="text-[10px] text-center text-gray-400 dark:text-zinc-500 font-medium">
            <p>© ২০২৪ পরীক্ষাঙ্গন | v1.1 PWA</p>
          </div>
        </div>
      </div>

      {/* App-like Bottom Navigation (Fixed & Glassmorphic) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] pb-safe-area bg-white/80 dark:bg-black/80 backdrop-blur-3xl border-t border-gray-200/50 dark:border-white/[0.05] shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around h-16 px-2 relative">
          {/* Sliding Background Pill */}
          <div className="absolute inset-0 flex items-center justify-around px-2 pointer-events-none">
            {mobileNavItems.map((item, idx) => (
              <div key={idx} className="flex-1 h-full flex items-center justify-center relative">
                {isActive(item.path!) && (
                  <motion.div 
                    layoutId="bottomNavPill"
                    className="absolute w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-2xl"
                    transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                  />
                )}
              </div>
            ))}
          </div>

          {mobileNavItems.map((item, idx) => {
            const active = item.path ? isActive(item.path) : false;
            
            return (
              <Link 
                key={idx} 
                to={item.path!} 
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(8);
                }}
                className={`flex-1 flex flex-col items-center justify-center h-full transition-all duration-300 relative z-10 ${active ? 'text-primary dark:text-orange-400' : 'text-gray-400 dark:text-zinc-500'}`}
              >
                <motion.div 
                  animate={{ 
                    scale: active ? 1.1 : 1,
                    y: active ? -2 : 0
                  }}
                  className="relative"
                >
                    {React.cloneElement(item.icon as React.ReactElement<any>, { 
                        strokeWidth: active ? 2.5 : 2,
                        size: 22,
                        className: `transition-all duration-300 ${active ? 'drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]' : ''}`
                    })}
                    
                    {/* Tiny dot indicator for active tab */}
                    {active && (
                      <motion.div 
                        layoutId="activeDot"
                        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                      />
                    )}
                </motion.div>
                
                <span className={`text-[9px] mt-1 font-bold transition-all duration-300 tracking-tight ${active ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-0.5'}`}>
                    {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  );
};

export default Navigation;
