
import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  GraduationCap, Home, PieChart, Moon, Sun, Swords, 
  Library, LogOut, User, ShieldCheck, Bell, Trophy, Archive, 
  Monitor, Zap, Info, AlertTriangle, CheckCircle, Check, MailOpen,
  LayoutGrid, Bot, BookOpen, ChevronRight, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Notification } from '../types';

interface NavigationProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  themeMode?: 'light' | 'dark' | 'system';
  toggleTheme: () => void;
  // Notification Props passed from App
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
  
  // Notification UI State
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

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
     // Mark as read
     setReadNotificationIds(prev => new Set(prev).add(notification.id));

     if(notification.actionLink) {
        if(notification.type === 'BATTLE_CHALLENGE' && notification.metadata && notification.metadata.roomId) {
            localStorage.setItem('battle_join_room', notification.metadata.roomId);
        }
        navigate(notification.actionLink);
        setIsNotificationOpen(false); // Close drawer
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
    { path: '/bot', label: 'Synapse AI', icon: <Bot size={18} /> },
    { path: '/courses', label: t('nav_courses'), icon: <Library size={18} /> },
    { path: '/qbank', label: t('nav_qbank'), icon: <Archive size={18} /> },
    { path: '/battle', label: t('nav_battle'), icon: <Swords size={18} /> },
    { path: '/leaderboard', label: t('nav_leaderboard'), icon: <Trophy size={18} /> },
    { path: '/tracker', label: t('nav_tracker'), icon: <PieChart size={18} /> },
    { path: '/admission', label: t('nav_admission'), icon: <GraduationCap size={18} /> },
  ];

  // Mobile Bottom Nav Items
  const mobileNavItems = [
    { path: '/dashboard', label: 'Home', icon: <Home size={22} /> },
    { path: '/tracker', label: 'Planner', icon: <PieChart size={22} /> },
    { path: '/courses', label: 'Courses', icon: <BookOpen size={22} /> },
    { path: '/bot', label: 'Doubt', icon: <Bot size={22} /> },
    { path: '/profile', label: 'Profile', icon: <User size={22} /> },
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
          case 'WARNING': return <AlertTriangle size={16} className="text-yellow-600" />;
          case 'SUCCESS': return <CheckCircle size={16} className="text-green-600" />;
          case 'BATTLE_CHALLENGE': return <Swords size={16} className="text-orange-600" />;
          case 'BATTLE_RESULT': return <Trophy size={16} className="text-yellow-600" />;
          default: return <Info size={16} className="text-blue-600" />;
      }
  };

  const isActive = (path: string) => location.pathname === path;

  // Helper to render user avatar or initial
  const renderAvatar = () => {
    if (userAvatar && userAvatar.startsWith('http')) {
        return <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />;
    }
    return (
        <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold text-lg">
            {currentUser?.displayName?.charAt(0).toUpperCase() || 'U'}
        </div>
    );
  };

  if (!currentUser) return null;

  // Define Admin Email Constant to match context logic
  const ADMIN_EMAIL = "nurnaimsourav@gmail.com";

  return (
    <>
      {/* Mobile Overlay (High Z-Index) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[140] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Notification Drawer (Right Side) */}
      {isNotificationOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[160]"
            onClick={() => setIsNotificationOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-80 md:w-96 bg-white dark:bg-gray-900 z-[170] shadow-2xl border-l border-gray-200 dark:border-gray-800 flex flex-col animate-in slide-in-from-right-full duration-500 ease-out">
             {/* Header */}
             <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                 <h4 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                     নোটিফিকেশন <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">{unreadCount}</span>
                 </h4>
                 <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-[10px] font-bold text-gray-500 hover:text-primary flex items-center gap-1 transition-colors">
                            <Check size={12}/> সব পঠিত করুন
                        </button>
                    )}
                    <button onClick={() => setIsNotificationOpen(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                        <X size={20}/>
                    </button>
                 </div>
             </div>

             {/* Filter Tabs */}
             <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                 <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-xl">
                     <button 
                         onClick={() => setFilter('ALL')}
                         className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${filter === 'ALL' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                     >
                         সব (All)
                     </button>
                     <button 
                         onClick={() => setFilter('UNREAD')}
                         className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${filter === 'UNREAD' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                     >
                         অপঠিত (Unread)
                     </button>
                 </div>
             </div>

             {/* List */}
             <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30 dark:bg-black/20">
                {displayedNotifications.length === 0 ? (
                   <div className="p-10 text-center flex flex-col items-center justify-center text-gray-400 mt-20">
                       <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                         {filter === 'UNREAD' ? <MailOpen size={24} className="opacity-50"/> : <Bell size={24} className="opacity-50"/>}
                       </div>
                       <p className="text-sm font-medium">কোনো নোটিফিকেশন নেই</p>
                       {filter === 'UNREAD' && <p className="text-[10px] opacity-70">সবগুলো পড়া হয়ে গেছে!</p>}
                   </div>
                ) : (
                   displayedNotifications.map(n => {
                      const isRead = readNotificationIds.has(n.id);
                      return (
                          <div 
                             key={n.id} 
                             onClick={() => handleNotificationClick(n)}
                             className={`p-4 border-b border-gray-100 dark:border-gray-800 transition-colors cursor-pointer group relative ${isRead ? 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800' : 'bg-blue-50/40 dark:bg-blue-900/10 hover:bg-blue-50/60 dark:hover:bg-blue-900/20'}`}
                          >
                             {!isRead && (
                                 <span className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full ring-2 ring-white dark:ring-gray-900"></span>
                             )}
                             
                             <div className="flex gap-3">
                                 <div className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
                                     n.type === 'SUCCESS' ? 'bg-green-100 border-green-200 dark:bg-green-900/30 dark:border-green-800' : 
                                     n.type === 'WARNING' ? 'bg-yellow-100 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800' : 
                                     n.type === 'BATTLE_CHALLENGE' ? 'bg-orange-100 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800' : 
                                     'bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800'
                                 }`}>
                                     {getNotificationIcon(n.type)}
                                 </div>
                                 <div className="flex-1 min-w-0 pr-4">
                                     <div className="flex justify-between items-center mb-1">
                                         <p className={`text-xs font-bold truncate ${isRead ? 'text-gray-600 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>{n.title}</p>
                                         <span className="text-[9px] text-gray-400 whitespace-nowrap">{new Date(n.date).toLocaleDateString()}</span>
                                     </div>
                                     <p className={`text-[11px] leading-relaxed line-clamp-2 ${isRead ? 'text-gray-500 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>{n.message}</p>
                                     
                                     {n.actionLink && (
                                         <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-white bg-primary px-3 py-1 rounded-full hover:bg-blue-700 transition-colors shadow-sm">
                                             {n.type === 'BATTLE_CHALLENGE' ? 'Join Battle' : 'View Details'} <ChevronRight size={10}/>
                                         </div>
                                     )}
                                 </div>
                             </div>
                          </div>
                      )
                   })
                )}
             </div>
          </div>
        </>
      )}

      {/* Sidebar (Desktop & Mobile Drawer - Z-Index 150 to stay ABOVE bottom nav) */}
      <div className={`
        fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 transition duration-300 ease-in-out
        w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-[150] flex flex-col shadow-2xl md:shadow-none h-full
      `}>
        {/* Header - Compact Padding */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 relative">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-gradient-to-br from-primary to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/30">
              ধ্রু
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-none tracking-tight">ধ্রুবক</h1>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-0.5 tracking-wide">{t('nav_prep')}</p>
            </div>
          </div>
          
          {/* Desktop Notification Bell Trigger */}
          <div className="relative md:block hidden">
             <button 
                onClick={() => setIsNotificationOpen(true)} 
                className="p-2.5 rounded-full relative transition-all hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
             >
                <Bell size={20}/>
                {unreadCount > 0 && (
                   <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900 animate-pulse"></span>
                )}
             </button>
          </div>
        </div>

        {/* User Profile - Compact */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <Link 
            to="/profile"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`w-full p-3 rounded-2xl flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-left group border border-transparent hover:border-gray-100 dark:hover:border-gray-700 ${isActive('/profile') ? 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700' : ''}`}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-white dark:border-gray-600 shadow-sm group-hover:scale-105 transition-transform">
               {renderAvatar()}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-gray-800 dark:text-white truncate">
                {currentUser.displayName || 'Learner'}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                {t('nav_profile_view')} <ChevronRight size={10}/>
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Items - Scrollable area */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm ${
                isActive(item.path)
                  ? 'bg-blue-50 dark:bg-primary/10 text-primary dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
          
          {/* Admin Button - Restricted to specific email */}
          {currentUser.email === ADMIN_EMAIL && (
            <Link
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all duration-200 font-bold mt-6 text-sm ${
                isActive('/admin')
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  : 'text-gray-500 dark:text-gray-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <ShieldCheck size={18} />
              <span>{t('nav_admin')}</span>
            </Link>
          )}
        </nav>

        {/* Theme & Footer - Compact */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-3 bg-white dark:bg-gray-900">
          <div className="grid grid-cols-2 gap-3">
            <button
                onClick={toggleTheme}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs font-bold border border-gray-100 dark:border-gray-700"
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

          <div className="text-[10px] text-center text-gray-400 dark:text-gray-600 font-medium">
            <p>© ২০২৪ ধ্রুবক | v1.0</p>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation (Floating & Glassmorphic) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100]">
        {/* Gradient Fade for content underneath */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/90 via-white/50 to-transparent dark:from-gray-900/90 dark:via-gray-900/50 pointer-events-none"></div>
        
        {/* The Navbar */}
        <div className="bg-white/80 dark:bg-gray-900/85 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800 pb-safe pt-1 shadow-lg relative">
            <div className="flex items-center justify-around h-16 px-2">
              {mobileNavItems.map((item, idx) => {
                const active = item.path ? isActive(item.path) : false;
                
                return (
                  <Link 
                    key={idx} 
                    to={item.path!} 
                    className="flex-1 flex flex-col items-center justify-center h-full active:scale-90 transition-transform duration-200 group"
                  >
                    <div className={`p-1.5 rounded-2xl transition-all duration-300 relative ${
                        active 
                        ? 'text-primary dark:text-blue-400 -translate-y-1' 
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                    }`}>
                        {/* Active Background Glow Pill */}
                        {active && (
                            <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-2xl -z-10 scale-110"></div>
                        )}
                        
                        {/* Icon with fill effect on active */}
                        {React.cloneElement(item.icon as React.ReactElement, { 
                            fill: active ? "currentColor" : "none",
                            fillOpacity: active ? 0.2 : 0,
                            strokeWidth: active ? 2.5 : 2
                        })}
                    </div>
                    <span className={`text-[10px] mt-0.5 transition-all duration-300 ${
                        active 
                        ? 'font-bold text-primary dark:text-blue-400 scale-100' 
                        : 'font-medium text-gray-400 dark:text-gray-500 scale-90 opacity-80'
                    }`}>
                        {item.label}
                    </span>
                  </Link>
                )
              })}
            </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;
