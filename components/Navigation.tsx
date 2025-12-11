
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, ClipboardList, Home, PieChart, Moon, Sun, Swords, Library, LogOut, User, ShieldCheck, Bell, Trophy, FileCheck, Archive, Monitor, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
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
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Notification Listener (Fetch from API on mount/user change)
  useEffect(() => {
    if (!currentUser) return;

    const loadNotifications = async () => {
       try {
         const notifs = await fetchNotificationsAPI();
         setNotifications(notifs);
         
         const lastRead = parseInt(localStorage.getItem('last_notif_read') || '0');
         const unread = notifs.filter(n => n.date > lastRead).length;
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
     if (!showNotifications) {
        setUnreadCount(0);
        localStorage.setItem('last_notif_read', Date.now().toString());
     }
  };

  const navItems = [
    { path: '/dashboard', label: 'হোম (Home)', icon: <Home size={20} /> },
    { path: '/challenges', label: 'ডেইলি চ্যালেঞ্জ (Quests)', icon: <Zap size={20} /> },
    { path: '/courses', label: 'কোর্সসমূহ (Courses)', icon: <Library size={20} /> },
    { path: '/qbank', label: 'প্রশ্ন ব্যাংক (Q-Bank)', icon: <Archive size={20} /> },
    { path: '/exams', label: 'মডেল টেস্ট (Exams)', icon: <FileCheck size={20} /> },
    { path: '/quiz', label: 'কুইজ জোন (Quiz)', icon: <ClipboardList size={20} /> },
    { path: '/battle', label: 'কুইজ ব্যাটল (Battle)', icon: <Swords size={20} /> },
    { path: '/leaderboard', label: 'লিডারবোর্ড (Rank)', icon: <Trophy size={20} /> },
    { path: '/tracker', label: 'পড়ার রুটিন (Tracker)', icon: <PieChart size={20} /> },
    { path: '/admission', label: 'ভর্তি তথ্য (Info)', icon: <GraduationCap size={20} /> },
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
    if (themeMode === 'dark') return <Moon size={18} />;
    if (themeMode === 'system') return <Monitor size={18} />;
    return <Sun size={18} />;
  };

  const getThemeLabel = () => {
    if (themeMode === 'dark') return 'ডার্ক মোড';
    if (themeMode === 'system') return 'অটো (সিস্টেম)';
    return 'লাইট মোড';
  };

  const isActive = (path: string) => location.pathname === path;

  if (!currentUser) return null;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 transition duration-200 ease-in-out
        w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 flex flex-col shadow-lg md:shadow-none
      `}>
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl mr-3 shadow-lg shadow-blue-900/20">
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white hidden md:block leading-none">শিক্ষা সহায়ক</h1>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium hidden md:block">এডমিশন প্রস্তুতি</p>
            </div>
          </div>
          
          {/* Notification Bell */}
          <div className="relative">
             <button onClick={handleNotificationClick} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative">
                <Bell size={20} className="text-gray-600 dark:text-gray-300"/>
                {unreadCount > 0 && (
                   <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                )}
             </button>
             
             {/* Notification Dropdown */}
             {showNotifications && (
               <div className="absolute left-10 top-0 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-[60] overflow-hidden">
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                     <h4 className="text-xs font-bold uppercase text-gray-500">নোটিফিকেশন</h4>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                     {notifications.length === 0 ? (
                        <p className="p-4 text-xs text-center text-gray-400">কোনো নতুন নোটিফিকেশন নেই</p>
                     ) : (
                        notifications.map(n => (
                           <div key={n.id} className="p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <p className={`text-xs font-bold mb-1 ${n.type === 'WARNING' ? 'text-red-500' : 'text-primary'}`}>{n.title}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{n.message}</p>
                              <p className="text-[10px] text-gray-400 mt-1">{new Date(n.date).toLocaleDateString()}</p>
                           </div>
                        ))
                     )}
                  </div>
               </div>
             )}
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <Link 
            to="/profile"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`w-full p-3 rounded-xl flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left ${isActive('/profile') ? 'bg-gray-50 dark:bg-gray-700/80' : 'bg-gray-50 dark:bg-gray-700/50'}`}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 dark:bg-green-400/10 flex-shrink-0">
               {userAvatar && userAvatar !== 'default' ? (
                 <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-primary dark:text-green-400 font-bold">
                   <User size={20} />
                 </div>
               )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-800 dark:text-white truncate">
                {currentUser.displayName || 'Learner'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">প্রোফাইল দেখুন</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                isActive(item.path)
                  ? 'bg-green-50 dark:bg-primary/20 text-primary dark:text-green-400 border border-green-100 dark:border-primary/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
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
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium mt-4 ${
              isActive('/admin')
                ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-800'
                : 'text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:text-orange-600 dark:hover:text-orange-400'
            }`}
          >
            <ShieldCheck size={20} />
            <span>অ্যাডমিন প্যানেল</span>
          </Link>
        </nav>

        {/* Theme & Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-4">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center space-x-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors active:scale-95"
          >
            {getThemeIcon()}
            <span className="text-sm font-medium">{getThemeLabel()}</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-bold">লগআউট</span>
          </button>

          <div className="text-xs text-center text-gray-400 dark:text-gray-500">
            <p>© 2024 Shikkha Shohayok</p>
            <p>Made with ❤️ in Bangladesh</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;
