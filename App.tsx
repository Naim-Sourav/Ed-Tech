
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomeDashboard from './components/HomeDashboard';
import QuizArena from './components/QuizArena';
import AdmissionSearch from './components/AdmissionSearch';
import StudyTracker from './components/StudyTracker';
import SynapseBot from './components/SynapseBot';
import QuizBattlePrototype from './components/QuizBattlePrototype';
import CourseSection from './components/CourseSection';
import ExamPackSection from './components/ExamPackSection';
import QuestionBank from './components/QuestionBank';
import AuthPage from './components/AuthPage';
import LandingPage from './components/LandingPage';
import ProfilePage from './components/ProfilePage';
import AdminPage from './components/AdminPage';
import LeaderboardPage from './components/LeaderboardPage';
import DailyChallengePage from './components/DailyChallengePage';
import { Menu, Loader2, ArrowLeft, GraduationCap, Brain } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';

// Layout Component to handle Navigation and Common UI
const MainLayout: React.FC<{ 
  themeMode: 'light' | 'dark' | 'system', 
  toggleTheme: () => void,
  children: React.ReactNode,
  openSynapse: () => void
}> = ({ themeMode, toggleTheme, children, openSynapse }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Map paths to Titles
  const getTitle = (pathname: string) => {
    if (pathname.startsWith('/profile/')) return 'প্রোফাইল'; // Handle dynamic profile title
    switch (pathname) {
      case '/dashboard': return 'ডোপামিন';
      case '/quiz': return 'কুইজ চ্যালেঞ্জ';
      case '/battle': return 'ব্যাটল জোন';
      case '/admission': return 'ভর্তি তথ্য';
      case '/tracker': return 'স্টাডি ট্র্যাকার';
      case '/courses': return 'কোর্সসমূহ';
      case '/exams': return 'মডেল টেস্ট';
      case '/qbank': return 'প্রশ্ন ব্যাংক';
      case '/profile': return 'প্রোফাইল';
      case '/admin': return 'অ্যাডমিন প্যানেল';
      case '/leaderboard': return 'লিডারবোর্ড';
      case '/challenges': return 'ডেইলি চ্যালেঞ্জ';
      default: return 'ডোপামিন';
    }
  };

  return (
    <div className="flex h-[100dvh] bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-200 text-gray-900 dark:text-gray-100">
      <Navigation 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        themeMode={themeMode}
        toggleTheme={toggleTheme}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between transition-colors sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
              <Brain size={20} />
            </div>
            <span className="font-bold text-gray-800 dark:text-white text-lg tracking-tight">
              {getTitle(location.pathname)}
            </span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden p-0 md:p-6 bg-gray-50 dark:bg-gray-900 transition-colors relative">
          {children}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [isSynapseOpen, setIsSynapseOpen] = useState(false);
  
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

  const openSynapse = () => setIsSynapseOpen(true);

  // Use HashRouter instead of BrowserRouter to avoid path issues on different environments
  return (
    <AdminProvider>
      <HashRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={!currentUser ? <LandingPage onLoginClick={() => window.location.hash = '#/auth'} /> : <Navigate to="/dashboard" />} />
          <Route path="/auth" element={!currentUser ? <AuthPage onBack={() => window.location.hash = '#/'} /> : <Navigate to="/dashboard" />} />

          {/* Protected Routes */}
          <Route path="/*" element={
             currentUser ? (
               <MainLayout themeMode={themeMode} toggleTheme={toggleTheme} openSynapse={openSynapse}>
                  <Routes>
                    <Route path="/dashboard" element={<HomeDashboard openSynapse={openSynapse} />} />
                    <Route path="/courses" element={<CourseSection />} />
                    <Route path="/qbank" element={<QuestionBank />} />
                    <Route path="/exams" element={<ExamPackSection />} />
                    <Route path="/quiz" element={<QuizArena />} />
                    <Route path="/battle" element={<QuizBattlePrototype />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                    <Route path="/tracker" element={<StudyTracker />} />
                    <Route path="/admission" element={<AdmissionSearch />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/profile/:userId" element={<ProfilePage />} /> {/* New Dynamic Route */}
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/challenges" element={<DailyChallengePage openSynapse={openSynapse} />} />
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                  </Routes>
               </MainLayout>
             ) : (
               <Navigate to="/auth" />
             )
          } />
        </Routes>
        <SynapseBot isOpen={isSynapseOpen} onClose={() => setIsSynapseOpen(false)} />
      </HashRouter>
    </AdminProvider>
  );
};

export default App;
