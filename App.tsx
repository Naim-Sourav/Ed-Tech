
import React, { useState, useEffect, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import AuthPage from './components/AuthPage';
import LandingPage from './components/LandingPage';
import { Menu, Loader2, Brain, User, ArrowLeft, Bell } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import { LanguageProvider } from './contexts/LanguageContext';
import SynapseBot from './components/SynapseBot';
import OnboardingModal from './components/OnboardingModal';
import { fetchNotificationsAPI } from './services/api';
import { Notification } from './types';

// --- Lazy Load Components ---
const HomeDashboard = React.lazy(() => import('./components/HomeDashboard'));
const QuizArena = React.lazy(() => import('./components/QuizArena'));
const ExamPage = React.lazy(() => import('./components/ExamPage'));
const AdmissionSearch = React.lazy(() => import('./components/AdmissionSearch'));
const StudyTracker = React.lazy(() => import('./components/StudyTracker'));
const QuizBattlePrototype = React.lazy(() => import('./components/QuizBattlePrototype'));
const CourseSection = React.lazy(() => import('./components/CourseSection'));
const ExamPackSection = React.lazy(() => import('./components/ExamPackSection'));
const QuestionBank = React.lazy(() => import('./components/QuestionBank'));
const ProfilePage = React.lazy(() => import('./components/ProfilePage'));
const AdminPage = React.lazy(() => import('./components/AdminPage'));
const LeaderboardPage = React.lazy(() => import('./components/LeaderboardPage'));
const DailyChallengePage = React.lazy(() => import('./components/DailyChallengePage'));
const ExamHub = React.lazy(() => import('./components/ExamHub'));
const GSTCoursePage = React.lazy(() => import('./components/GSTCoursePage'));
const PaymentPage = React.lazy(() => import('./components/PaymentPage')); // New Page

// Loading Fallback Component
const PageLoader = () => (
  <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-400">
    <Loader2 size={40} className="animate-spin text-primary mb-4" />
    <p className="text-xs font-bold tracking-wider">লোড হচ্ছে...</p>
  </div>
);

// Layout Component to handle Navigation and Common UI
const MainLayout: React.FC<{ 
  themeMode: 'light' | 'dark' | 'system', 
  toggleTheme: () => void,
  children: React.ReactNode,
}> = ({ themeMode, toggleTheme, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isProfileComplete, profileLoading, userAvatar } = useAuth(); // Check profile status & loading state

  // Notification State (Lifted from Navigation)
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set());

  // Load Read IDs from LocalStorage
  useEffect(() => {
      const storedReads = localStorage.getItem('read_notifications_v2');
      if (storedReads) {
          try {
              setReadNotificationIds(new Set(JSON.parse(storedReads)));
          } catch (e) { console.error("Failed to parse read notifications"); }
      }
  }, []);

  // Sync Read IDs to LocalStorage
  useEffect(() => {
      localStorage.setItem('read_notifications_v2', JSON.stringify(Array.from(readNotificationIds)));
  }, [readNotificationIds]);

  // Fetch Notifications
  useEffect(() => {
    if (!currentUser) return;

    const loadNotifications = async () => {
       try {
         const allNotifs = await fetchNotificationsAPI();
         // Filter target specific
         const userNotifs = allNotifs.filter(n => !n.target || n.target === 'ALL' || n.target === currentUser.uid);
         // Sort by date desc
         userNotifs.sort((a, b) => b.date - a.date);
         setNotifications(userNotifs);
       } catch (error) {
         console.error("Error loading notifications:", error);
       }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const unreadCount = notifications.filter(n => !readNotificationIds.has(n.id)).length;

  // Hide Navigation on Exam Page, Payment Page.
  // NOTE: Battle Page navigation is handled internally (Full screen overlays for Game/Lobby, Regular layout for Menu)
  const isExamPage = location.pathname.startsWith('/exam/');
  const isPaymentPage = location.pathname.startsWith('/payment');
  const isDashboard = location.pathname === '/dashboard';

  // Map paths to Titles
  const getTitle = (pathname: string) => {
    if (pathname.startsWith('/profile/')) return 'প্রোফাইল';
    if (pathname.startsWith('/exam/')) return 'পরীক্ষা চলছে';
    if (pathname.startsWith('/payment')) return 'পেমেন্ট';
    if (pathname.startsWith('/battle')) return 'ব্যাটল অ্যারেনা';
    switch (pathname) {
      case '/dashboard': return 'ধ্রুবক';
      case '/exams': return 'এক্সাম জোন';
      case '/quiz': return 'কুইজ জোন';
      case '/admission': return 'ভর্তি তথ্য';
      case '/tracker': return 'রুটিন';
      case '/courses': return 'কোর্সসমূহ';
      case '/qbank': return 'প্রশ্ন ব্যাংক';
      case '/profile': return 'প্রোফাইল';
      case '/admin': return 'অ্যাডমিন';
      case '/leaderboard': return 'লিডারবোর্ড';
      case '/challenges': return 'চ্যালেঞ্জ';
      case '/bot': return 'Synapse AI';
      case '/gst-special': return 'GST চ্যালেঞ্জ';
      default: return 'ধ্রুবক';
    }
  };

  const handleBack = () => {
      navigate(-1);
  };

  const hideNav = isExamPage || isPaymentPage;

  return (
    <div className="flex h-[100dvh] bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-200 text-gray-900 dark:text-gray-100">
      {/* Onboarding Overlay: Only show if NOT loading AND profile is incomplete */}
      {!profileLoading && !isProfileComplete && <OnboardingModal />}

      {!hideNav && (
        <Navigation 
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            themeMode={themeMode}
            toggleTheme={toggleTheme}
            // Props for Notification Drawer
            notifications={notifications}
            readNotificationIds={readNotificationIds}
            setReadNotificationIds={setReadNotificationIds}
            isNotificationOpen={isNotificationOpen}
            setIsNotificationOpen={setIsNotificationOpen}
        />
      )}

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header - Compact Version (Hide on Exam, Payment) */}
        {!hideNav && (
            <div className="md:hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between transition-colors z-[60]">
            <div className="flex items-center gap-3">
                {isDashboard ? (
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                        <Brain size={18} />
                    </div>
                ) : (
                    <button onClick={handleBack} className="p-1.5 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <ArrowLeft size={22} className="text-gray-600 dark:text-gray-300" />
                    </button>
                )}
                <span className="font-bold text-gray-800 dark:text-white text-lg tracking-tight">
                    {getTitle(location.pathname)}
                </span>
            </div>
            
            <div className="flex items-center gap-2">
                {/* Notification Bell */}
                <button 
                    onClick={() => setIsNotificationOpen(true)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors relative"
                    aria-label="Notifications"
                >
                    <Bell size={24} />
                    {unreadCount > 0 && (
                       <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800 animate-pulse"></span>
                    )}
                </button>

                {/* Menu Trigger */}
                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                    aria-label="Menu"
                >
                    <Menu size={24} />
                </button>
            </div>
            </div>
        )}

        {/* Main Content Area with Suspense - Adjusted padding for Bottom Nav */}
        <main className={`flex-1 overflow-hidden transition-colors relative ${hideNav ? 'p-0' : 'p-0 pb-20 md:p-6 md:pb-6'}`}>
          <Suspense fallback={<PageLoader />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { currentUser, loading } = useAuth();
  
  // Theme State
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('themeMode');
      return (saved as 'light' | 'dark' | 'system') || 'system';
    }
    return 'system';
  });

  // Apply Theme Effect
  useEffect(() => {
    const applyTheme = () => {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark = themeMode === 'dark' || (themeMode === 'system' && isSystemDark);

      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();
    localStorage.setItem('themeMode', themeMode);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (themeMode === 'system') applyTheme();
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  };

  // Loading State
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-primary">
        <Loader2 size={48} className="animate-spin" />
      </div>
    );
  }

  // Use HashRouter instead of BrowserRouter to avoid path issues on different environments
  return (
    <LanguageProvider>
      <AdminProvider>
        <HashRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={!currentUser ? <LandingPage onLoginClick={() => window.location.hash = '#/auth'} /> : <Navigate to="/dashboard" />} />
            <Route path="/auth" element={!currentUser ? <AuthPage onBack={() => window.location.hash = '#/'} /> : <Navigate to="/dashboard" />} />

            {/* Protected Routes */}
            <Route path="/*" element={
              currentUser ? (
                <MainLayout themeMode={themeMode} toggleTheme={toggleTheme}>
                    <Routes>
                      <Route path="/dashboard" element={<HomeDashboard />} />
                      <Route path="/courses" element={<CourseSection />} />
                      <Route path="/qbank" element={<QuestionBank />} />
                      <Route path="/exams" element={<ExamHub />} />
                      <Route path="/quiz" element={<QuizArena />} />
                      <Route path="/exam/:examId" element={<ExamPage />} />
                      <Route path="/battle" element={<QuizBattlePrototype />} />
                      <Route path="/leaderboard" element={<LeaderboardPage />} />
                      <Route path="/tracker" element={<StudyTracker />} />
                      <Route path="/admission" element={<AdmissionSearch />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/profile/:userId" element={<ProfilePage />} />
                      <Route path="/admin" element={<AdminPage />} />
                      <Route path="/challenges" element={<DailyChallengePage openSynapse={() => {}} />} />
                      <Route path="/bot" element={<SynapseBot />} />
                      <Route path="/gst-special" element={<GSTCoursePage />} /> 
                      <Route path="/payment" element={<PaymentPage />} />
                      <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                </MainLayout>
              ) : (
                <Navigate to="/auth" />
              )
            } />
          </Routes>
        </HashRouter>
      </AdminProvider>
    </LanguageProvider>
  );
};

export default App;
