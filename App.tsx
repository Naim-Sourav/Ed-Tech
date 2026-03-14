import React, { useState, useEffect, Suspense, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import AuthPage from './components/AuthPage';
import LandingPage from './components/LandingPage';
import { Menu, Brain, ArrowLeft, Bell } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import { LanguageProvider } from './contexts/LanguageContext';
import SynapseBot from './components/SynapseBot';
import OnboardingModal from './components/OnboardingModal';
import { fetchNotificationsAPI } from './services/api';
import { Notification } from './types';

import ErrorBoundary from './components/ErrorBoundary';

// --- Lazy Load Components ---
const HomeDashboard = React.lazy(() => import('./components/HomeDashboard'));
const QuizArena = React.lazy(() => import('./components/QuizArena'));
const ExamPage = React.lazy(() => import('./components/ExamPage'));
const AdmissionSearch = React.lazy(() => import('./components/AdmissionSearch'));
const StudyTracker = React.lazy(() => import('./components/StudyTracker'));
const QuizBattlePrototype = React.lazy(() => import('./components/QuizBattlePrototype'));
const CourseSection = React.lazy(() => import('./components/CourseSection'));
const QuestionBank = React.lazy(() => import('./components/QuestionBank'));
const ProfilePage = React.lazy(() => import('./components/ProfilePage'));
const AdminPage = React.lazy(() => import('./components/AdminPage'));
const LeaderboardPage = React.lazy(() => import('./components/LeaderboardPage'));
const DailyChallengePage = React.lazy(() => import('./components/DailyChallengePage'));
const ExamHub = React.lazy(() => import('./components/ExamHub'));
const GSTCoursePage = React.lazy(() => import('./components/GSTCoursePage'));
const ExamBatchPage = React.lazy(() => import('./components/ExamBatchPage'));
const PaymentPage = React.lazy(() => import('./components/PaymentPage'));

const PageLoader = () => (
  <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-400">
    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
    <p className="text-[10px] font-bold tracking-wider uppercase">Loading...</p>
  </div>
);

const MainLayout: React.FC<{ 
  themeMode: 'light' | 'dark' | 'system', 
  toggleTheme: () => void,
  children: React.ReactNode,
}> = ({ themeMode, toggleTheme, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  const [showTopNav, setShowTopNav] = useState(true);
  const lastScrollY = useRef(0);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isProfileComplete, profileLoading } = useAuth(); 
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
        if (!mainContentRef.current) return;
        const currentScrollY = mainContentRef.current.scrollTop;
        const diff = currentScrollY - lastScrollY.current;

        // Show header if:
        // 1. At the very top (buffer of 50px)
        // 2. Scrolling UP significantly (diff < -5)
        if (currentScrollY < 50) {
            setShowTopNav(true);
        } else if (diff > 5) {
            // Scrolling DOWN significantly -> Hide
            setShowTopNav(false);
        } else if (diff < -5) {
            // Scrolling UP significantly -> Show
            setShowTopNav(true);
        }
        
        lastScrollY.current = currentScrollY;
    };

    const scrollContainer = mainContentRef.current;
    if (scrollContainer) {
        scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => scrollContainer?.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
      const storedReads = localStorage.getItem('read_notifications_v2');
      if (storedReads) {
          try { 
            setReadNotificationIds(new Set(JSON.parse(storedReads))); 
          } catch (e) {
            console.error("Failed to parse notifications", e);
          }
      }
  }, []);

  useEffect(() => {
      localStorage.setItem('read_notifications_v2', JSON.stringify(Array.from(readNotificationIds)));
  }, [readNotificationIds]);

  useEffect(() => {
    if (!currentUser) return;
    const loadNotifications = async () => {
       try {
         const allNotifs = await fetchNotificationsAPI();
         const userNotifs = allNotifs.filter(n => !n.target || n.target === 'ALL' || n.target === currentUser.uid);
         userNotifs.sort((a, b) => b.date - a.date);
         setNotifications(userNotifs);
       } catch (error) { console.error(error); }
    };
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const unreadCount = notifications.filter(n => !readNotificationIds.has(n.id)).length;

  const isExamPage = location.pathname.startsWith('/exam/');
  const isPaymentPage = location.pathname.startsWith('/payment');
  const isTrackerPage = location.pathname === '/tracker';
  const hideNav = isExamPage || isPaymentPage || isTrackerPage;

  // Main tabs where back button should NOT appear
  const mainTabs = ['/dashboard', '/courses', '/bot', '/profile', '/tracker'];
  const showBackButton = !mainTabs.includes(location.pathname) && location.pathname !== '/';

  const getTitle = (pathname: string) => {
    if (pathname.startsWith('/profile/')) return 'Profile';
    if (pathname.startsWith('/exam/')) return 'Exam Active';
    if (pathname.startsWith('/payment')) return 'Checkout';
    if (pathname.startsWith('/battle')) return 'Battle Arena';
    switch (pathname) {
      case '/dashboard': return 'Porikkhangon';
      case '/exams': return 'Exam Zone';
      case '/quiz': return 'Quiz Zone';
      case '/admission': return 'Admission';
      case '/tracker': return 'Planner';
      case '/courses': return 'Courses';
      case '/qbank': return 'Archives';
      case '/profile': return 'Profile';
      case '/leaderboard': return 'Rankings';
      case '/bot': return 'Synapse AI';
      default: return 'Porikkhangon';
    }
  };

  return (
    <div className="flex h-[100dvh] bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 overflow-hidden selection:bg-primary/30">
      {!profileLoading && !isProfileComplete && !location.pathname.startsWith('/exam/') && <OnboardingModal />}

      {!hideNav && (
        <Navigation 
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            themeMode={themeMode}
            toggleTheme={toggleTheme}
            notifications={notifications}
            readNotificationIds={readNotificationIds}
            setReadNotificationIds={setReadNotificationIds}
            isNotificationOpen={isNotificationOpen}
            setIsNotificationOpen={setIsNotificationOpen}
        />
      )}

      <div className="flex-1 flex flex-col h-full relative w-full">
        {!hideNav && (
            <div className={`md:hidden fixed top-0 left-0 right-0 z-[60] bg-white dark:bg-gray-900 px-4 py-3 pt-safe-area grid grid-cols-3 items-center transition-transform duration-300 ease-in-out ${showTopNav ? 'translate-y-0' : '-translate-y-full'}`}>
                
                {/* বাম পাশের অংশ: Menu অথবা Back বাটন */}
                <div className="flex justify-start">
                    {showBackButton ? (
                        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full active:bg-gray-100 dark:active:bg-gray-800 text-gray-800 dark:text-gray-200 transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                    ) : (
                        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 rounded-full active:bg-gray-100 dark:active:bg-gray-800 text-gray-800 dark:text-gray-200 transition-colors">
                            <Menu size={24} />
                        </button>
                    )}
                </div>

                {/* মাঝখানের অংশ: লোগো অথবা পেজের নাম */}
                <div className="flex justify-center items-center">
                    {showBackButton ? (
                        <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight line-clamp-1 text-center">
                            {getTitle(location.pathname)}
                        </span>
                    ) : (
                        <div className="flex items-center gap-1.5">
                            <img src="./Pshape.svg" alt="Porikkhangon Logo" className="h-8 w-auto object-contain drop-shadow-sm" />
                            <img src="./letterlogo.svg" alt="Porikkhangon Letter Logo" className="h-5 w-auto object-contain" />
                        </div>
                    )}
                </div>
                
                {/* ডান পাশের অংশ: Notification বাটন */}
                <div className="flex justify-end">
                    <button onClick={() => setIsNotificationOpen(true)} className="p-2 -mr-2 rounded-full active:bg-gray-100 dark:active:bg-gray-800 text-gray-800 dark:text-gray-200 relative transition-colors">
                        <Bell size={24} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>
                        )}
                    </button>
                </div>
            </div>
        )}

        {/* -webkit-overflow-scrolling:touch যুক্ত করা হয়েছে নেটিভ স্মুথ স্ক্রলিংয়ের জন্য */}
        <main 
            ref={mainContentRef}
            className={`flex-1 overflow-y-auto overflow-x-hidden [-webkit-overflow-scrolling:touch] transition-colors relative scroll-smooth ${hideNav ? 'p-0' : 'pt-[calc(60px+env(safe-area-inset-top))] pb-[calc(100px+env(safe-area-inset-bottom))] md:pt-6 md:pb-6 md:px-6'}`}
        >
          {/* Key on location.pathname forces a re-render/animation on route change */}
          <div key={location.pathname} className="h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
             <Suspense fallback={<PageLoader />}>
                {children}
             </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

const AuthRoute = ({ children }: { children: JSX.Element }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  // @ts-ignore
  const from = location.state?.from?.pathname || "/dashboard";

  if (currentUser && !currentUser.isAnonymous) {
    return <Navigate to={from} replace />;
  }
  return children;
};

const App: React.FC = () => {
  const { currentUser, loading } = useAuth();
  
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('themeMode');
      return (saved as 'light' | 'dark' | 'system') || 'system';
    }
    return 'system';
  });

  useEffect(() => {
    const applyTheme = () => {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark = themeMode === 'dark' || (themeMode === 'system' && isSystemDark);
      if (shouldBeDark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    };
    applyTheme();
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-primary">
        <PageLoader />
      </div>
    );
  }

  return (
    <LanguageProvider>
      <AdminProvider>
        <HashRouter>
          <ErrorBoundary>
             <Suspense fallback={<PageLoader />}>
                <AppRoutes themeMode={themeMode} toggleTheme={toggleTheme} currentUser={currentUser} />
             </Suspense>
          </ErrorBoundary>
        </HashRouter>
      </AdminProvider>
    </LanguageProvider>
  );
};

const AppRoutes: React.FC<{
    themeMode: 'light' | 'dark' | 'system';
    toggleTheme: () => void;
    currentUser: any;
}> = ({ themeMode, toggleTheme, currentUser }) => {
    const location = useLocation();

    return (
          <Routes>
            <Route path="/" element={!currentUser ? <LandingPage onLoginClick={() => window.location.hash = '#/auth'} /> : <Navigate to="/dashboard" />} />
            <Route path="/auth" element={<AuthRoute><AuthPage onBack={() => window.location.hash = '#/'} /></AuthRoute>} />
            
            {/* Public Exam Route - Accessible to guests */}
            <Route path="/exam/:examId" element={<ExamPage />} />

            <Route path="/*" element={
              currentUser ? (
                <MainLayout themeMode={themeMode} toggleTheme={toggleTheme}>
                    <Routes>
                      <Route path="/dashboard" element={<HomeDashboard />} />
                      <Route path="/courses" element={<CourseSection />} />
                      <Route path="/qbank" element={<QuestionBank />} />
                      <Route path="/exams" element={<ExamHub />} />
                      <Route path="/quiz" element={<QuizArena />} />
                      {/* ExamPage removed from here as it is now top-level */}
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
                      <Route path="/exam-batch/:courseId" element={<ExamBatchPage />} />
                      <Route path="/payment" element={<PaymentPage />} />
                      <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                </MainLayout>
              ) : (
                <Navigate to="/auth" state={{ from: location }} replace />
              )
            } />
          </Routes>
    );
}

export default App;
