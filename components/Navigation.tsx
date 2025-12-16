
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  GraduationCap, ClipboardList, Home, PieChart, Moon, Sun, Swords, 
  Library, LogOut, User, ShieldCheck, Bell, Trophy, FileCheck, Archive, 
  Monitor, Zap, Brain, Info, AlertTriangle, CheckCircle, Check, Globe 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchNotificationsAPI } from '../services/api';
import { Notification } from '../types';

interface NavigationProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  themeMode?: 'light' | 'dark' | 'system';
  toggleTheme: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  isMobileMenuOpen, 
  setIsMobileMenuOpen,
  themeMode,
  toggleTheme
}) => {
  const { currentUser, logout, userAvatar } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notification Listener (Fetch from API on mount/user change)
  useEffect(() => {
    if (!currentUser) return;

    const loadNotifications = async () => {
       try {
         // Pass currentUser.uid to the API
         const allNotifs = await fetchNotificationsAPI();
         
         // Client-side filtering for user-specific notifications (temporary fix until backend fully supports target filtering per request)
         const userNotifs = allNotifs.filter(n => !n.target || n.target === 'ALL' || n.target === currentUser.uid);
         
         setNotifications(userNotifs);
         
         const lastRead = parseInt(localStorage.getItem('last_notif_read') || '0');
         const unread = userNotifs.filter(n => n.date > lastRead).length;
         setUnreadCount(unread);
       } catch (error) {
         console.error("Error loading notifications:", error);
       }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleNotificationClick = () => {
     setShowNotifications(!showNotifications);
     if (!showNotifications && unreadCount > 0) {
         handleMarkAllRead();
     }
  };

  const handleMarkAllRead = () => {
      setUnreadCount(0);
      localStorage.setItem('last_notif_read', Date.now().toString());
  };

  const navItems = [
    { path: '/dashboard', label: t('nav_home'), icon: <Home size={18} /> },
    { path: '/challenges', label: t('nav_challenges'), icon: <Zap size={18} /> },
    { path: '/courses', label: t('nav_courses'), icon: <Library size={18} /> },
    { path: '/qbank', label: t('nav_qbank'), icon: <Archive size={18} /> },
    { path: '/exams', label: t('nav_exams'), icon: <FileCheck size={18} /> },
    { path: '/quiz', label: t('nav_quiz'), icon: <ClipboardList size={18} /> },
    { path: '/battle', label: t('nav_battle'), icon: <Swords size={18} /> },
    { path: '/leaderboard', label: t('nav_leaderboard'), icon: <Trophy size={18} /> },
    { path: '/tracker', label: t('nav_tracker'), icon: <PieChart size={18} /> },
    { path: '/admission', label: t('nav_admission'), icon: <GraduationCap size={18} /> },
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
    // Only Bengali labels now
    if (themeMode === 'dark') return 'ডার্ক';
    if (themeMode === 'system') return 'অটো';
    return 'লাইট';
  };

  const getNotificationIcon = (type: string) => {
      switch(type) {
          case 'WARNING': return <AlertTriangle size={16} className="text-yellow-500" />;
          case 'SUCCESS': return <CheckCircle size={16} className="text-green-500" />;
          case 'BATTLE_CHALLENGE': return <Swords size={16} className="text-orange-500" />;
          case 'BATTLE_RESULT': return <Trophy size={16} className="text-yellow-500" />;
          default: return <Info size={16} className="text-blue-500" />;
      }
  };

  const isActive = (path: string) => location.pathname === path;

  if (!currentUser) return null;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[60] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 transition duration-200 ease-in-out
        w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-[70] flex flex-col shadow-lg md:shadow-none h-full
      `}>
        {/* Header - Compact Padding */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 relative">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
              ধ্রু
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800 dark:text-white leading-none">ধ্রুবক</h1>
              <p className="text-[9px] text-gray-500 dark:text-gray-400 font-medium">{t('nav_prep')}</p>
            </div>
          </div>
          
          {/* Notification Bell with Dropdown Container */}
          <div className="relative" ref={dropdownRef}>
             <button 
                onClick={handleNotificationClick} 
                className={`p-2 rounded-lg relative transition-all ${showNotifications ? 'bg-blue-50 dark:bg-blue-900/30 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'}`}
             >
                <Bell size={20}/>
                {unreadCount > 0 && (
                   <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></span>
                )}
             </button>
             
             {/* Notification Dropdown Menu */}
             {showNotifications && (
               <div className="absolute left-0 md:left-auto md:right-[-120px] top-12 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 origin-top-left md:origin-top-right">
                    {/* Header */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                       <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-2">
                           <Bell size={12}/> নোটিফিকেশন
                       </h4>
                       <button onClick={handleMarkAllRead} className="text-[10px] text-primary hover:underline font-bold flex items-center gap-1 transition-colors">
                           <Check size={12}/> সব পঠিত করুন
                       </button>
                    </div>
                    
                    {/* List */}
                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                       {notifications.length === 0 ? (
                          <div className="p-8 text-center flex flex-col items-center justify-center text-gray-400">
                              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                                <Bell size={20} className="opacity-50"/>
                              </div>
                              <p className="text-sm font-medium">কোনো নোটিফিকেশন নেই</p>
                              <p className="text-[10px] opacity-70">গুরুত্বপূর্ণ আপডেট এখানে আসবে।</p>
                          </div>
                       ) : (
                          notifications.map(n => (
                             <div 
                                key={n.id} 
                                onClick={() => {
                                    if(n.actionLink) {
                                        // Store partial data for battle if present
                                        if(n.type === 'BATTLE_CHALLENGE' && n.metadata && n.metadata.roomId) {
                                            // Directly inject room ID into input if redirecting to join page (conceptual)
                                            // For now, let's just use localStorage to pass this "intent"
                                            localStorage.setItem('battle_join_room', n.metadata.roomId);
                                        }
                                        navigate(n.actionLink);
                                        setShowNotifications(false);
                                    }
                                }}
                                className={`p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group ${unreadCount > 0 ? 'bg-blue-50/10' : ''}`}
                             >
                                <div className="flex gap-3">
                                    <div className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${n.type === 'SUCCESS' ? 'bg-green-100 dark:bg-green-900/30' : n.type === 'WARNING' ? 'bg-yellow-100 dark:bg-yellow-900/30' : n.type === 'BATTLE_CHALLENGE' ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                                        {getNotificationIcon(n.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <p className={`text-xs font-bold text-gray-800 dark:text-gray-200 truncate pr-2`}>{n.title}</p>
                                            <span className="text-[9px] text-gray-400 whitespace-nowrap">{new Date(n.date).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">{n.message}</p>
                                        
                                        {n.actionLink && (
                                            <div className="mt-2 text-[10px] font-bold text-primary flex items-center gap-1 group-hover:underline">
                                                {n.type === 'BATTLE_CHALLENGE' ? 'জয়েন ব্যাটল' : 'বিস্তারিত'} <CheckCircle size={10}/>
                                            </div>
                                        )}
                                    </div>
                                </div>
                             </div>
                          ))
                       )}
                    </div>
               </div>
             )}
          </div>
        </div>

        {/* User Profile - Compact */}
        <div className="p-3 border-b border-gray-100 dark:border-gray-700">
          <Link 
            to="/profile"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`w-full p-2.5 rounded-lg flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left ${isActive('/profile') ? 'bg-gray-50 dark:bg-gray-700/80' : ''}`}
          >
            <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0 border border-gray-200 dark:border-gray-600">
               {userAvatar && userAvatar !== 'default' ? (
                 <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-400">
                   <User size={16} />
                 </div>
               )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-800 dark:text-white truncate">
                {currentUser.displayName || 'Learner'}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{t('nav_profile_view')}</p>
            </div>
          </Link>
        </div>

        {/* Navigation Items - Scrollable area */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm ${
                isActive(item.path)
                  ? 'bg-blue-50 dark:bg-primary/10 text-primary dark:text-blue-300 border border-blue-100 dark:border-primary/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white border border-transparent'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
          
          {/* Admin Button */}
          <Link
            to="/admin"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg transition-all duration-200 font-medium mt-4 text-sm ${
              isActive('/admin')
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                : 'text-gray-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 border border-transparent'
            }`}
          >
            <ShieldCheck size={18} />
            <span>{t('nav_admin')}</span>
          </Link>
        </nav>

        {/* Theme & Footer - Compact */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-700 space-y-2 bg-white dark:bg-gray-800">
          <div className="grid grid-cols-2 gap-2">
            <button
                onClick={toggleTheme}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-xs font-bold border border-gray-100 dark:border-gray-600"
            >
                {getThemeIcon()} {getThemeLabel()}
            </button>
            <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-xs font-bold border border-red-100 dark:border-red-900/30"
            >
                <LogOut size={14} /> {t('nav_logout')}
            </button>
          </div>

          <div className="text-[10px] text-center text-gray-400 dark:text-gray-500 pb-1">
            <p>© ২০২৪ ধ্রুবক</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;
