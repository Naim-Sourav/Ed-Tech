import React, { lazy, useState, useEffect, Suspense, useRef } from 'react';
import { logger } from './utils/logger';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Navigation from './components/Navigation';
import PageLoader from './components/PageLoader';
import AuthPage from './components/AuthPage';
import AuthSuccessOverlay from './components/AuthSuccessOverlay';
import LandingPage from './components/LandingPage';
import { Menu, ArrowLeft, Bell, Swords } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import { PreferencesProvider } from './contexts/PreferencesContext';
import PorikkhangonAI from './components/PorikkhangonAI';
import ProfileSetup from './components/onboarding/ProfileSetup';
import TelegramModal from './components/TelegramModal'; // ADDED Import
import NotificationPrompt from './components/NotificationPrompt';
import OfflineBanner from './components/OfflineBanner';
import { useToast } from './components/Toast';
import { fetchNotificationsAPI } from './services/api';
import { Notification } from './types';
import { subscribeToPushNotifications, onForegroundMessage, checkSubscription } from './services/notificationService';
import { listenToInvites, deleteInvite, joinRTDBRoom } from './services/battleService';

import ErrorBoundary from './components/ErrorBoundary';

// --- Lazy Load Helper - simplified to avoid dispatcher null race ---
// Previous version did window.location.reload() + return dummy () => null during render,
// which could cause ReactCurrentDispatcher null (useContext/useState) if a navigation
// happened while the dummy was mounted. Now we just lazy-load directly; chunk load
// failures will be caught by ErrorBoundary and user can refresh via its button.
const lazyWithRetry = (componentImport: () => Promise<any>) => lazy(componentImport);

// --- Lazy Load Components ---
const HomeDashboard = lazyWithRetry(() => import('./components/HomeDashboard'));
const AccountMenu = lazyWithRetry(() => import('./components/AccountMenu'));
const QuizArena = lazyWithRetry(() => import('./components/QuizArena'));
const ExamPage = lazyWithRetry(() => import('./components/ExamPage'));
const AdmissionSearch = lazyWithRetry(() => import('./components/AdmissionSearch'));
const QuizBattlePrototype = lazyWithRetry(() => import('./components/QuizBattlePrototype'));
const CourseSection = lazyWithRetry(() => import('./components/CourseSection'));
const QuestionBank = lazyWithRetry(() => import('./components/QuestionBank'));
const ProfilePage = lazyWithRetry(() => import('./components/ProfilePage'));
const SavedQuestions = lazyWithRetry(() => import('./components/SavedQuestions'));
const WrongQuestions = lazyWithRetry(() => import('./components/WrongQuestions'));
const ExamHistory = lazyWithRetry(() => import('./components/ExamHistory'));
const AdminPage = lazyWithRetry(() => import('./components/AdminPage'));
const LeaderboardPage = lazyWithRetry(() => import('./components/LeaderboardPage'));
const DailyChallengePage = lazyWithRetry(() => import('./components/DailyChallengePage'));
const ExamHub = lazyWithRetry(() => import('./components/ExamHub'));
const ExamBatchPage = lazyWithRetry(() => import('./components/ExamBatchPage'));
const PaymentPage = lazyWithRetry(() => import('./components/PaymentPage'));
const QuestionPage = lazyWithRetry(() => import('./components/QuestionPage'));
const PrivacyPolicy = lazyWithRetry(() => import('./components/LegalPages').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazyWithRetry(() => import('./components/LegalPages').then(m => ({ default: m.TermsOfService })));
const RefundPolicy = lazyWithRetry(() => import('./components/LegalPages').then(m => ({ default: m.RefundPolicy })));



const MainLayout: React.FC<{ 
  themeMode: 'light' | 'dark' | 'system', 
  toggleTheme: () => void,
  setThemeMode?: (mode: 'light' | 'dark' | 'system') => void,
  children: React.ReactNode,
}> = ({ themeMode, toggleTheme, setThemeMode, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  // True while the first-run profile setup wizard is on screen — secondary
  // pop-ups (Telegram invite, push prompt) wait until it is finished.
  const [profileSetupOpen, setProfileSetupOpen] = useState(false);
  
  const lastScrollY = useRef(0);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set());

  // Battle Invitations State and Handlers
  const [activeInvite, setActiveInvite] = useState<any | null>(null);
  const [inviteTimeLeft, setInviteTimeLeft] = useState(45);

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = listenToInvites(currentUser.uid, (invites) => {
      if (invites && invites.length > 0) {
        const latestInvite = invites[invites.length - 1];
        if (Date.now() - latestInvite.timestamp < 45000) {
          setActiveInvite(latestInvite);
        } else {
          setActiveInvite(null);
        }
      } else {
        setActiveInvite(null);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (!activeInvite || !currentUser) return;
    const currentUid = currentUser.uid;
    const elapsed = Math.floor((Date.now() - activeInvite.timestamp) / 1000);
    const initialLeft = Math.max(0, 45 - elapsed);
    setInviteTimeLeft(initialLeft);

    const interval = setInterval(() => {
      setInviteTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setActiveInvite(null);
          deleteInvite(currentUid, activeInvite.roomId).catch(() => {});
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeInvite, currentUser]);

  const handleAcceptInvite = async () => {
    if (!activeInvite || !currentUser) return;
    try {
      await joinRTDBRoom(activeInvite.roomId, {
        uid: currentUser.uid,
        name: currentUser.displayName || 'Guest',
        avatar: currentUser.photoURL || ''
      });
      await deleteInvite(currentUser.uid, activeInvite.roomId);
      const targetRoomId = activeInvite.roomId;
      setActiveInvite(null);
      
      // Store in local storage as a fallback to ensure we load it
      localStorage.setItem('pending_battle_room_id', targetRoomId);
      navigate('/battle', { state: { directRoomId: targetRoomId } });
    } catch (error: any) {
      logger.error("Failed to accept invite:", error);
      showToast("ব্যাটেল রুমে যোগ দেওয়া সম্ভব হয়নি। হয়তো রুমটি ইতিমধ্যে বন্ধ বা শুরু হয়ে গেছে।", "error");
      setActiveInvite(null);
    }
  };

  const handleDeclineInvite = async () => {
    if (!activeInvite || !currentUser) return;
    try {
      await deleteInvite(currentUser.uid, activeInvite.roomId);
    } catch (error) {
      logger.error(error);
    }
    setActiveInvite(null);
  };

  const getSubjectBanglaName = (subject: string) => {
    const map: Record<string, string> = {
      'Physics': 'পদার্থবিজ্ঞান',
      'Chemistry': 'রসায়ন',
      'Math': 'উচ্চতর গণিত',
      'Biology': 'জীববিজ্ঞান',
      'ICT': 'আইসিটি',
      'English': 'ইংরেজি',
      'Bangla': 'বাংলা',
      'General Knowledge': 'সাধারণ জ্ঞান'
    };
    return map[subject] || subject;
  };

  useEffect(() => {
    const handleScroll = () => {
        if (!mainContentRef.current) return;
        const currentScrollY = mainContentRef.current.scrollTop;

        // Scroll logic preserved for lastScrollY update
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
            logger.error("Failed to parse notifications", e);
          }
      }
  }, []);

  useEffect(() => {
      localStorage.setItem('read_notifications_v2', JSON.stringify(Array.from(readNotificationIds)));
  }, [readNotificationIds]);

  useEffect(() => {
    if (!currentUser) return;
    
    // Check if already subscribed, if not, we can prompt later or auto-subscribe if permission exists
    const initPush = async () => {
      const isSubscribed = await checkSubscription();
      if (isSubscribed) {
        await subscribeToPushNotifications(currentUser);
      }
    };
    initPush();

    // Listen for foreground messages
    const unsubscribeForeground = onForegroundMessage((payload) => {
      // You can show a toast or update notifications state here
      logger.debug('Foreground message payload:', payload);
      if (payload.notification) {
        // Optionally add to notifications list
        const newNotif: Notification = {
          id: Date.now().toString(),
          title: payload.notification.title || 'New Notification',
          message: payload.notification.body || '',
          type: 'INFO',
          date: Date.now()
        };
        setNotifications(prev => [newNotif, ...prev]);
      }
    });

    return () => {
      unsubscribeForeground();
    };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const loadNotifications = async () => {
       try {
         const allNotifs = await fetchNotificationsAPI();
         const userNotifs = allNotifs.filter(n => !n.target || n.target === 'ALL' || n.target === currentUser.uid);
         userNotifs.sort((a, b) => b.date - a.date);
         setNotifications(userNotifs);
       } catch (error) { logger.error(error); }
    };
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const unreadCount = notifications.filter(n => !readNotificationIds.has(n.id)).length;

  const isExamPage = location.pathname.startsWith('/exam/');
  const isPaymentPage = location.pathname.startsWith('/payment');
  const isBotPage = location.pathname === '/bot';
  const isLeaderboard = location.pathname === '/leaderboard';
  const isSavedQuestions = location.pathname === '/saved-questions';
  const isWrongQuestions = location.pathname === '/wrong-questions';
  const isQuizPage = location.pathname === '/quiz';
  const isQbankPage = location.pathname === '/qbank';
  const isDashboard = location.pathname === '/dashboard';
  const isQbankInnerPage = isQbankPage && /[?&](subject|q)=/.test(location.search);
  const hideNav = isExamPage || isPaymentPage || isBotPage || isSavedQuestions || isWrongQuestions || isQuizPage || isQbankInnerPage;
  const hideTopNav = hideNav || isQbankPage || isDashboard;

  // Main tabs where back button should NOT appear
  const mainTabs = ['/dashboard', '/courses', '/bot', '/profile', '/planner', '/history', '/qbank'];
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
      case '/planner': return 'History';
      case '/history': return 'History';
      case '/courses': return 'Courses';
      case '/qbank': return 'Archives';
      case '/profile': return 'Profile';
      case '/leaderboard': return 'Rankings';
      case '/bot': return 'Porikkhangon AI';
      default: return 'Porikkhangon';
    }
  };

  return (
    <div className="flex h-[100dvh] bg-gray-50 dark:bg-black font-sans text-gray-900 dark:text-gray-100 overflow-hidden selection:bg-primary/30">
      {!location.pathname.startsWith('/exam/') && <ProfileSetup onVisibilityChange={setProfileSetupOpen} />}
      {!profileSetupOpen && <TelegramModal />}
      {!profileSetupOpen && <NotificationPrompt />}

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
        <OfflineBanner />
        <main
            ref={mainContentRef}
            className={`flex-1 transition-colors relative scroll-smooth ${
              (isQuizPage || isExamPage || isBotPage || isPaymentPage) 
                ? 'h-full overflow-hidden flex flex-col p-0' 
                : `overflow-y-auto overflow-x-hidden p-0 md:px-6`
            }`}
        >
          <Suspense fallback={<PageLoader />}>
              {children}
          </Suspense>
        </main>
      </div>

      {/* Global Battle Invite Popup - plain div to avoid useContext null race from AnimatePresence exit */}
      {activeInvite && (
        <div className="fixed top-6 left-4 right-4 md:left-auto md:right-6 md:w-96 bg-white dark:bg-zinc-900 border-2 border-orange-500 rounded-3xl shadow-2xl p-5 z-[9999] overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-xl pointer-events-none" />
            {/* Ambient fire glow in background */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-xl pointer-events-none"></div>
            
            <div className="flex items-start gap-4">
              <div className="relative">
                <img 
                  src={activeInvite.senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-orange-500" 
                  alt="Sender"
                />
                <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white p-1 rounded-lg">
                  <Swords size={12} fill="currentColor"/>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-gray-900 dark:text-white text-base truncate">
                  {activeInvite.senderName}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  আপনাকে একটি ব্যাটেল চ্যালেঞ্জ পাঠিয়েছেন!
                </p>
                
                <div className="mt-3 bg-orange-500/5 dark:bg-orange-500/10 p-2.5 rounded-xl border border-orange-500/10 text-xs space-y-1">
                  <p className="text-gray-700 dark:text-gray-300 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                    বিষয়: {getSubjectBanglaName(activeInvite.subject)}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 font-medium truncate flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    অধ্যায়: {activeInvite.chapter}
                  </p>
                </div>
              </div>
            </div>

            {/* Countdown / Time Limit indicator - plain div to avoid motion */}
            <div className="mt-4 h-1 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 transition-all duration-1000 ease-linear" style={{ width: `${(inviteTimeLeft / 45) * 100}%` }} />
            </div>
            
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={handleDeclineInvite}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 font-bold text-xs transition-colors"
              >
                বর্জন করুন
              </button>
              <button
                onClick={handleAcceptInvite}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-black text-xs shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Swords size={14} fill="currentColor"/>
                গ্রহণ করুন ({inviteTimeLeft}s)
              </button>
            </div>
          </div>
        )}
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

  // NOTE: App renders the <BrowserRouter>, so useLocation()/useNavigate() can only
  // be used inside child components (see AppRoutes below), not here.
  
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
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-black text-primary">
        <PageLoader />
      </div>
    );
  }

  return (
    <PreferencesProvider>
      <AdminProvider>
        <BrowserRouter>
          <ErrorBoundary>
             <Suspense fallback={<PageLoader />}>
                <AppRoutes themeMode={themeMode} toggleTheme={toggleTheme} setThemeMode={setThemeMode} currentUser={currentUser} />
             </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </AdminProvider>
    </PreferencesProvider>
  );
};

import ThemeColorManager from './components/ThemeColorManager';

/**
 * Backwards compatibility for old HashRouter links (e.g. /#/privacy shared
 * before the BrowserRouter migration): rewrite them to clean URLs.
 */
const HashCompatRedirect: React.FC = () => {
    const loc = useLocation();
    if (loc.hash && loc.hash.startsWith('#/')) {
        return <Navigate to={loc.hash.slice(1)} replace />;
    }
    return null;
};

const AppRoutes: React.FC<{
    themeMode: 'light' | 'dark' | 'system';
    toggleTheme: () => void;
    setThemeMode?: (mode: 'light' | 'dark' | 'system') => void;
    currentUser: any;
}> = ({ themeMode, toggleTheme, setThemeMode, currentUser }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { profileLoading } = useAuth();

    if (profileLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-black">
                <PageLoader />
            </div>
        );
    }

    return (
          <>
          <ThemeColorManager themeMode={themeMode} />
          <AuthSuccessOverlay />
          <HashCompatRedirect />
          <Routes>
            <Route
              path="/"
              element={
                !currentUser ? (
                  <LandingPage onLoginClick={() => navigate('/auth')} onSignupClick={() => navigate('/auth?mode=signup')} />
                ) : (
                  <Navigate to="/dashboard" />
                )
              }
            />
            <Route path="/auth" element={<AuthRoute><AuthPage onBack={() => navigate('/')} /></AuthRoute>} />

                        {/* Public Exam Route - Accessible to guests */}
            <Route path="/exam/:examId" element={<ExamPage />} />

            {/* Public question viewer - backs /q/<slug> share links & SEO pages.
                The `/*` splat also accepts trailing-slash URLs (/q/<slug>/) so
                canonical static-style links resolve in-app instead of falling
                through to the authenticated catch-all (which redirects to /dashboard). */}
            <Route path="/question/:slug/*" element={<QuestionPage />} />
            {/* Short alias: static /q/<slug>/ files serve first when they exist;
                this catches share links for questions without a static page. */}
            <Route path="/q/:slug/*" element={<QuestionPage />} />

            {/* Legal pages are PUBLIC (trust + SEO): no login required. */}
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/refund" element={<RefundPolicy />} />

            <Route path="/*" element={
              currentUser ? (
                <MainLayout themeMode={themeMode} toggleTheme={toggleTheme} setThemeMode={setThemeMode}>
                    <Routes location={location}>
                      <Route path="/dashboard" element={<HomeDashboard toggleTheme={toggleTheme} themeMode={themeMode} setThemeMode={setThemeMode} />} />
                      <Route path="/account" element={<AccountMenu key={location.pathname} themeMode={themeMode} toggleTheme={toggleTheme} />} />
                      <Route path="/courses" element={<CourseSection />} />
                      <Route path="/qbank" element={<QuestionBank />} />
                      <Route path="/exams" element={<ExamHub />} />
                      <Route path="/quiz" element={<QuizArena />} />
                      {/* ExamPage removed from here as it is now top-level */}
                      <Route path="/battle" element={<QuizBattlePrototype />} />
                      <Route path="/leaderboard" element={<LeaderboardPage />} />
                      <Route path="/planner" element={<ExamHistory />} />
                      <Route path="/history" element={<ExamHistory />} />
                      <Route path="/admission" element={<AdmissionSearch />} />
                      <Route path="/profile" element={<ProfilePage key={location.pathname} themeMode={themeMode} toggleTheme={toggleTheme} setThemeMode={setThemeMode} />} />
                      <Route path="/profile/:userId" element={<ProfilePage key={location.pathname} themeMode={themeMode} toggleTheme={toggleTheme} setThemeMode={setThemeMode} />} />
                      <Route path="/saved-questions" element={<SavedQuestions />} />
                      <Route path="/wrong-questions" element={<WrongQuestions />} />
                      <Route path="/settings" element={<ProfilePage key={location.pathname} themeMode={themeMode} toggleTheme={toggleTheme} setThemeMode={setThemeMode} />} />
                      <Route path="/admin" element={<AdminPage />} />
                      <Route path="/challenges" element={<DailyChallengePage openBot={() => {}} />} />
                      <Route path="/bot" element={<PorikkhangonAI />} />
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
          </>
    );
}

export default App;
