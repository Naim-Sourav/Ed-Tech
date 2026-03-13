
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Bot, Search, PieChart, Swords, Library, 
  Sparkles, Trophy, Zap, Clock, 
  ChevronRight, Star, Archive, 
  Flame, CheckCircle, HelpCircle, XCircle, Lightbulb, Play, 
  Settings, Target, Calendar, Atom, Beaker, Calculator, Dna,
  BookOpen, Brain, Sun, Moon, CloudSun, Crown, X, LayoutGrid, BarChart2, Medal, TrendingUp, FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchUserStatsAPI, fetchLeaderboardAPI } from '../services/api';
import { useCache } from '../contexts/CacheContext';
import { LeaderboardUser } from '../types';
import LottieAnim from './LottieAnim';
import { fireAnimData } from '../assets/lottie/fireData';
import { rankAnimData } from '../assets/lottie/rankData';
import { pointsAnimData } from '../assets/lottie/pointsData';

// --- CONSTANTS & MOCK DATA ---

const SUBJECTS = [
    { name: 'Physics', group: 'Physics', icon: Atom, color: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/40 dark:to-orange-800/40 text-primary dark:text-orange-400', border: 'border-orange-200 dark:border-orange-700/50' },
    { name: 'Chemistry', group: 'Chemistry', icon: Beaker, color: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/40 dark:to-orange-800/40 text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-700/50' },
    { name: 'Math', group: 'Higher Math', icon: Calculator, color: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/40 dark:to-red-800/40 text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-700/50' },
    { name: 'Biology', group: 'Biology', icon: Dna, color: 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/40 dark:to-emerald-800/40 text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-700/50' },
    { name: 'ICT', group: 'ICT', icon:  Brain, color: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/40 dark:to-purple-800/40 text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-700/50' },
];

const MODEL_TESTS = [
    {
        id: 'mt1',
        subject: 'Physics',
        chapter: 'ভেক্টর',
        title: 'ভেক্টর - মডেল টেস্ট ১',
        count: 20,
        time: 20,
        icon: Atom,
        color: 'text-primary dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800'
    },
    {
        id: 'mt2',
        subject: 'Chemistry',
        chapter: 'গুণগত রসায়ন',
        title: 'গুণগত রসায়ন - মডেল টেস্ট ১',
        count: 20,
        time: 20,
        icon: Beaker,
        color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800'
    },
    {
        id: 'mt3',
        subject: 'Biology',
        chapter: 'কোষ ও এর গঠন',
        title: 'কোষ ও এর গঠন - মডেল টেস্ট ১',
        count: 20,
        time: 20,
        icon: Dna,
        color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800'
    },
    {
        id: 'mt4',
        subject: 'Higher Math',
        chapter: 'ম্যাট্রিক্স ও নির্ণায়ক',
        title: 'ম্যাট্রিক্স - মডেল টেস্ট ১',
        count: 20,
        time: 20,
        icon: Calculator,
        color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'
    }
];

// Pool of high-quality questions with LaTeX
const QOD_POOL = [
    {
        id: 1,
        subject: "Physics",
        chapter: "ভেক্টর",
        question: "দুটি ভেক্টরের মান সমান। এদের লব্ধির মান যেকোনো একটি ভেক্টরের মানের সমান হলে, ভেক্টরদ্বয়ের মধ্যবর্তী কোণ কত?",
        options: ["$60^\\circ$", "$90^\\circ$", "$120^\\circ$", "$180^\\circ$"],
        correct: 2,
        explanation: "ধরি ভেক্টরদ্বয় $P$ ও $P$ এবং লব্ধি $R=P$। সুত্র: $R^2 = P^2 + P^2 + 2P^2\\cos\\alpha$। সমাধান করলে $\\cos\\alpha = -1/2$, তাই $\\alpha = 120^\\circ$।"
    },
    {
        id: 2,
        subject: "Chemistry",
        chapter: "গুণগত রসায়ন",
        question: "নিচের কোন অরবিটালটি সম্ভব নয়?",
        options: ["$2d$", "$3f$", "$1p$", "সবগুলো"],
        correct: 3,
        explanation: "$n=2$ হলে $l=0,1$ ($d$ সম্ভব না), $n=3$ হলে $l=0,1,2$ ($f$ সম্ভব না), $n=1$ হলে $l=0$ ($p$ সম্ভব না)। তাই সবগুলোই অসম্ভব।"
    },
    {
        id: 3,
        subject: "Higher Math",
        chapter: "ম্যাট্রিক্স ও নির্ণায়ক",
        question: "কোনো ম্যাট্রিক্স $A$ এর ক্রম $m \\times n$ এবং $B$ এর ক্রম $n \\times p$ হলে, $AB$ ম্যাট্রিক্সের ক্রম কত?",
        options: ["$m \\times p$", "$n \\times n$", "$p \\times m$", "$m \\times n$"],
        correct: 0,
        explanation: "দুটি ম্যাট্রিক্স গুণের শর্ত হলো ১ম টির কলাম = ২য় টির সারি। গুণফল ম্যাট্রিক্সের ক্রম হবে (১ম টির সারি $\\times$ ২য় টির কলাম)।"
    },
    {
        id: 4,
        subject: "Biology",
        chapter: "কোষ ও এর গঠন",
        question: "DNA থেকে mRNA তৈরি করার প্রক্রিয়াকে কী বলে?",
        options: ["Replication", "Transcription", "Translation", "Transduction"],
        correct: 1,
        explanation: "DNA থেকে mRNA তৈরির প্রক্রিয়া হলো Transcription। mRNA থেকে প্রোটিন তৈরি হলো Translation।"
    }
];

const LEAGUES = [
  { id: 'NOVICE', name: 'Novice', min: 0, max: 999, color: 'text-gray-500' },
  { id: 'APPRENTICE', name: 'Apprentice', min: 1000, max: 2999, color: 'text-emerald-500' },
  { id: 'SCHOLAR', name: 'Scholar', min: 3000, max: 6999, color: 'text-orange-500' },
  { id: 'MASTER', name: 'Master', min: 7000, max: 14999, color: 'text-purple-500' },
  { id: 'GRANDMASTER', name: 'Grandmaster', min: 15000, max: 30000, color: 'text-orange-500' }
];

const HomeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userAvatar } = useAuth();
  const { t } = useLanguage();
  const { getCache, setCache } = useCache();
  
  const cacheKey = `dashboard_${currentUser?.uid}`;
  const cachedData = getCache(cacheKey) || {};

  const [greetingKey, setGreetingKey] = useState<any>(cachedData.greetingKey || 'greeting_morning');
  const [stats, setStats] = useState<any>(cachedData.stats || null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [rank, setRank] = useState<number | null>(cachedData.rank || null);
  
  const [isLoading, setIsLoading] = useState(!cachedData.stats); 
  
  // Daily Question State
  const [dailyQ, setDailyQ] = useState(QOD_POOL[0]);
  const [qodStatus, setQodStatus] = useState<'UNANSWERED' | 'CORRECT' | 'WRONG'>('UNANSWERED');
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [pollStats, setPollStats] = useState<number[]>([0,0,0,0]);
  
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Determine Daily Question based on Date
  useEffect(() => {
      const today = new Date().getDate(); // Day of month (1-31)
      const qIndex = today % QOD_POOL.length;
      setDailyQ(QOD_POOL[qIndex]);
      
      // Generate Fake Poll Stats (Deterministic based on ID)
      const correctIdx = QOD_POOL[qIndex].correct;
      const baseStats = [15, 10, 10, 15]; // Noise
      baseStats[correctIdx] = 50; // Correct answer gets majority
      setPollStats(baseStats);
  }, []);

  const loadData = async () => {
      if (currentUser) {
        if (!stats) setIsLoading(true);
        try {
            const [statsData, leaderboardData] = await Promise.all([
                fetchUserStatsAPI(currentUser.uid).catch(e => null),
                fetchLeaderboardAPI().catch(e => [])
            ]);

            if (statsData) setStats(statsData);
            if (leaderboardData) setLeaderboard(leaderboardData);
            
            let userRank = null;
            if (leaderboardData && Array.isArray(leaderboardData)) {
                const r = leaderboardData.findIndex(u => u.uid === currentUser.uid);
                if (r !== -1) {
                    userRank = r + 1;
                    setRank(userRank);
                }
            }

            setCache(cacheKey, {
                stats: statsData,
                rank: userRank,
                greetingKey: getGreeting()
            });

        } catch (e) { 
            console.error("Dashboard data load error", e); 
        } finally {
            setIsLoading(false);
        }
      }
  };

  const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'greeting_morning';
      else if (hour < 17) return 'greeting_afternoon';
      else return 'greeting_evening';
  }

  // --- ROBUST MATHJAX LOADING ---
  // This effect polls for MathJax until it is ready, ensuring it renders even if the script loads late
  useEffect(() => {
      // eslint-disable-next-line prefer-const
      let intervalId: any;
      let attempts = 0;

      const renderMath = () => {
          const qContainer = document.getElementById('qod-container');
          if (window.MathJax && window.MathJax.typesetPromise && qContainer) {
              window.MathJax.typesetPromise([qContainer])
                  .then(() => {
                      // Success: Clear interval
                      if(intervalId) clearInterval(intervalId);
                  })
                  .catch((err: any) => console.log('MathJax typeset failed: ', err));
          }
      };

      // Initial attempt
      renderMath();

      // Set up polling (check every 500ms for 10 seconds)
      intervalId = setInterval(() => {
          attempts++;
          if (window.MathJax) {
              renderMath();
          }
          if (attempts > 20) { // Stop after 10 seconds
              clearInterval(intervalId);
          }
      }, 500);

      return () => {
          if (intervalId) clearInterval(intervalId);
      };
  }, [dailyQ, qodStatus]); // Re-run when question or status changes

  useEffect(() => {
    setGreetingKey(getGreeting());
    loadData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [currentUser]);

  const handleQodSubmit = (idx: number) => {
      if (qodStatus !== 'UNANSWERED') return;
      setSelectedOpt(idx);
      if (idx === dailyQ.correct) {
          setQodStatus('CORRECT');
      } else {
          setQodStatus('WRONG');
      }
  };

  const startSubjectPractice = (groupName: string) => {
      navigate('/quiz', { state: { subject: groupName } });
  };

  const handlePracticeMore = () => {
      // Use the subject of the daily question
      const groupName = SUBJECTS.find(s => s.name === dailyQ.subject)?.group || 'Physics';
      startSubjectPractice(groupName);
  };

  // Rank Calculation
  const currentPoints = stats?.points || 0;
  const currentStreak = stats?.currentStreak || 0;
  
  // League Logic
  const getLeague = (points: number) => {
      return LEAGUES.find(l => points >= l.min && points <= l.max) || LEAGUES[LEAGUES.length-1];
  };
  const myLeague = getLeague(currentPoints);
  
  // Filter Leaderboard for "My League" View
  const nearbyLearners = useMemo(() => {
      if (!leaderboard.length) return [];
      // Filter users in same league range
      const leagueUsers = leaderboard.filter(u => u.points >= myLeague.min && u.points <= myLeague.max);
      
      // If user is in top 3 of their league, show top 3. 
      // If user is lower, show users around them.
      const myIndex = leagueUsers.findIndex(u => u.uid === currentUser?.uid);
      
      if (myIndex === -1) return leagueUsers.slice(0, 3); // Fallback
      
      // Simplified: Just show Top 3 of current league to motivate
      return leagueUsers.slice(0, 3);
  }, [leaderboard, myLeague, currentUser]);

  const progressPercent = Math.min(100, Math.max(0, ((currentPoints - myLeague.min) / (myLeague.max - myLeague.min)) * 100));
  
  const getWeekDays = () => {
      const getDhakaDateString = (d: Date) => {
          return new Intl.DateTimeFormat('en-CA', { 
              timeZone: 'Asia/Dhaka', 
              year: 'numeric', 
              month: '2-digit', 
              day: '2-digit' 
          }).format(d);
      };

      const today = new Date();
      const todayStr = getDhakaDateString(today);
      
      const currentDay = today.getDay(); 
      const diff = currentDay === 6 ? 0 : -(currentDay + 1);
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() + diff);
      
      const days = [];
      const banglaDays = ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র'];
      
      for (let i = 0; i < 7; i++) {
          const d = new Date(startOfWeek);
          d.setDate(startOfWeek.getDate() + i);
          const dateStr = getDhakaDateString(d);
          days.push({
              name: banglaDays[i],
              date: dateStr,
              isToday: dateStr === todayStr
          });
      }
      return days;
  };

  const renderHeaderAvatar = () => {
    if (userAvatar && userAvatar.startsWith('http')) {
        return <img src={userAvatar} alt="Profile" className="w-full h-full rounded-full object-cover" />;
    }
    return (
        <div className="w-full h-full rounded-full flex items-center justify-center bg-primary text-white font-bold text-2xl">
            {currentUser?.displayName?.charAt(0).toUpperCase() || 'U'}
        </div>
    );
  };

  // --- SKELETON LOADER ---
  const DashboardSkeleton = () => (
    <div className="max-w-5xl mx-auto px-3 pt-4 pb-20 space-y-4 animate-pulse">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            </div>
        </div>
        <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-3xl"></div>
    </div>
  );

  if (isLoading && !stats) return <DashboardSkeleton />;

  return (
    <div className="min-h-full bg-white dark:bg-gray-900 transition-colors pb-6 md:pb-10 relative overflow-hidden">
      {/* Ambient Background Glows Removed */}
      
      <div className="max-w-5xl mx-auto px-3 pt-4 md:px-4 md:pt-6 space-y-4 md:space-y-6 animate-page-enter relative z-10">
        
        {/* --- HEADER SECTION (PLAIN WHITE) --- */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl p-3 md:p-4 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
            {/* Ambient Glow Removed */}
            
            <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4 relative z-10">
                <div className="relative group">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full p-0.5 border-2 border-white/50 dark:border-gray-600 shadow-lg shadow-indigo-500/20 overflow-hidden transition-transform group-hover:scale-105">
                        {renderHeaderAvatar()}
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-emerald-500 border-2 border-white dark:border-gray-800 rounded-full shadow-sm animate-pulse"></div>
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-base md:text-lg font-black text-gray-900 dark:text-white leading-tight mb-0.5 tracking-tight">
                        {t(greetingKey)}, <span className="text-primary dark:text-orange-400">{currentUser?.displayName?.split(' ')[0] || 'Learner'}</span> 👋
                    </h1>
                    <div className="max-w-[180px]">
                        <div className="flex justify-between items-center text-[9px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                            <span className={`flex items-center gap-1 ${myLeague.color}`}>
                                <Crown size={10} fill="currentColor" /> {myLeague.name}
                            </span>
                            <span className="font-mono opacity-80">{currentPoints} / {myLeague.max}</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                            <div 
                                className="h-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,82,0,0.5)]"
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-3">
                <div onClick={() => navigate('/leaderboard')} className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 border border-amber-100/50 dark:border-amber-700/30 p-2 rounded-xl flex flex-col items-center justify-center gap-0.5 cursor-pointer hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-0.5 transition-all group">
                    <div className="w-6 h-6 md:w-8 md:h-8 drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                        <LottieAnim 
                            animationData={rankAnimData} 
                            fallback={<Trophy size={24} className="text-amber-500 fill-amber-500" />}
                            className="w-full h-full" 
                        />
                    </div>
                    <p className="text-[9px] font-bold text-amber-600/70 dark:text-amber-400/70 uppercase tracking-wider">Rank</p>
                    <p className="text-sm md:text-base font-black text-gray-900 dark:text-white">#{rank || '-'}</p>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 border border-orange-100/50 dark:border-orange-700/30 p-2 rounded-xl flex flex-col items-center justify-center gap-0.5 cursor-pointer hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-0.5 transition-all group">
                    <div className="w-6 h-6 md:w-8 md:h-8 drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                        <LottieAnim 
                            animationData={pointsAnimData} 
                            fallback={<Zap size={24} className="text-orange-500 fill-current" />}
                            className="w-full h-full" 
                        />
                    </div>
                    <p className="text-[9px] font-bold text-orange-600/70 dark:text-orange-400/70 uppercase tracking-wider">Points</p>
                    <p className="text-sm md:text-base font-black text-gray-900 dark:text-white">{stats?.points || 0}</p>
                </div>

                <div onClick={() => setShowStreakModal(true)} className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/10 border border-emerald-100/50 dark:border-emerald-700/30 p-2 rounded-xl flex flex-col items-center justify-center gap-0.5 cursor-pointer hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-0.5 transition-all group">
                    <div className="w-6 h-6 md:w-8 md:h-8 drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                        <LottieAnim 
                            animationData={fireAnimData} 
                            fallback={<Flame size={24} className="text-orange-500 fill-orange-500" />}
                            className="w-full h-full" 
                        />
                    </div>
                    <p className="text-[9px] font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-wider">Streak</p>
                    <p className="text-sm md:text-base font-black text-gray-900 dark:text-white">{currentStreak} <span className="text-sm">🔥</span></p>
                </div>
            </div>
        </div>

        {/* 1. Featured Banner (GST) - Cyberpunk Style */}
        <div 
            onClick={() => navigate('/gst-special')}
            className="w-full relative bg-gray-900 dark:bg-black rounded-3xl md:rounded-[2.5rem] p-5 md:p-8 text-white overflow-hidden shadow-2xl shadow-red-900/20 cursor-pointer group border border-gray-800 active-scale transition-all duration-300 hover:shadow-red-500/10"
        >
            {/* Cyberpunk Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(20,20,20,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,20,0.8)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/40"></div>
            
            {/* Neon Glows */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/20 rounded-full blur-[80px] -mr-10 -mt-10 group-hover:bg-red-600/30 transition-all duration-700 animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-600/10 rounded-full blur-[60px] -ml-10 -mb-10"></div>
            
            <div className="relative z-10 flex flex-col gap-2 md:gap-4">
                <div className="flex items-center gap-2">
                    <span className="bg-red-600 text-white text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-[0_0_15px_rgba(220,38,38,0.6)] animate-pulse border border-red-400/50">Live</span>
                    <span className="text-red-300 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-1.5"><Target size={12} className="text-red-400"/> Admission</span>
                </div>
                <h2 className="text-2xl md:text-5xl font-black leading-tight tracking-tight drop-shadow-lg">
                    GST <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 animate-gradient-x">সুপার ফোকাস</span>
                </h2>
                <p className="text-xs md:text-sm text-gray-300 max-w-sm font-medium leading-relaxed border-l-2 border-red-500/50 pl-3">৪৫ দিনের ফিক্সড রুটিন। ডিসিপ্লিন, ডেডিকেশন, ডমিনেশন।</p>
                <div className="mt-2 flex items-center gap-2 text-[10px] md:text-xs font-bold text-white group-hover:gap-3 transition-all">
                    <span className="border-b-2 border-red-500 pb-0.5">রুটিন দেখুন</span> <ArrowRight size={14} className="text-red-400"/>
                </div>
            </div>
        </div>

        {/* 2. Main Menu Grid - Glassmorphism */}
        <div>
            <h3 className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 mb-4 px-1 flex items-center gap-2 uppercase tracking-wider"><LayoutGrid size={14}/> কুইক অ্যাক্সেস</h3>
            <div className="grid grid-cols-2 gap-3 md:gap-5">
                {/* Rapid Fire */}
                <div 
                    onClick={() => navigate('/quiz', { state: { mode: 'RAPID_FIRE' } })}
                    className="bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-gray-800 p-4 md:p-6 rounded-3xl border border-red-100 dark:border-red-900/30 hover:border-red-300 dark:hover:border-red-500/50 transition-all cursor-pointer group relative overflow-hidden h-32 md:h-44 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-red-500/10 active-scale"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500"><Flame size={80} /></div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 dark:bg-red-900/40 rounded-2xl flex items-center justify-center text-red-500 shadow-inner group-hover:scale-110 transition-transform duration-300 ring-1 ring-red-500/20">
                        <Flame size={20} fill="currentColor" />
                    </div>
                    <div>
                        <h4 className="font-black text-gray-900 dark:text-white text-base md:text-lg tracking-tight group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">র‍্যাপিড ফায়ার</h4>
                        <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">দ্রুত কুইজ প্র্যাকটিস</p>
                    </div>
                </div>

                {/* Custom Quiz (Model Test) */}
                <div 
                    onClick={() => navigate('/quiz')}
                    className="bg-gradient-to-br from-violet-50 to-white dark:from-violet-900/20 dark:to-gray-800 p-4 md:p-6 rounded-3xl border border-violet-100 dark:border-violet-900/30 hover:border-violet-300 dark:hover:border-violet-500/50 transition-all cursor-pointer group relative overflow-hidden h-32 md:h-44 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-violet-500/10 active-scale"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500"><Settings size={80} /></div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-violet-100 dark:bg-violet-900/40 rounded-2xl flex items-center justify-center text-violet-600 shadow-inner group-hover:scale-110 transition-transform duration-300 ring-1 ring-violet-500/20">
                        <Settings size={20} />
                    </div>
                    <div>
                        <h4 className="font-black text-gray-900 dark:text-white text-base md:text-lg tracking-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">কাস্টম কুইজ</h4>
                        <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">নিজের মতো এক্সাম সাজান</p>
                    </div>
                </div>

                {/* Question Bank */}
                <div 
                    onClick={() => navigate('/qbank')}
                    className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-gray-800 p-4 md:p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all cursor-pointer group relative overflow-hidden h-32 md:h-44 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 active-scale"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500"><Archive size={80} /></div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner group-hover:scale-110 transition-transform duration-300 ring-1 ring-emerald-500/20">
                        <Archive size={20} />
                    </div>
                    <div>
                        <h4 className="font-black text-gray-900 dark:text-white text-base md:text-lg tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">প্রশ্ন ব্যাংক</h4>
                        <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">বিগত বছরের প্রশ্ন</p>
                    </div>
                </div>

                {/* Battle */}
                <div 
                    onClick={() => navigate('/battle')}
                    className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-gray-800 p-4 md:p-6 rounded-3xl border border-amber-100 dark:border-amber-900/30 hover:border-amber-300 dark:hover:border-amber-500/50 transition-all cursor-pointer group relative overflow-hidden h-32 md:h-44 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-amber-500/10 active-scale"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500"><Swords size={80} /></div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 dark:bg-amber-900/40 rounded-2xl flex items-center justify-center text-amber-600 shadow-inner group-hover:scale-110 transition-transform duration-300 ring-1 ring-amber-500/20">
                        <Swords size={20} />
                    </div>
                    <div>
                        <h4 className="font-black text-gray-900 dark:text-white text-base md:text-lg tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">কুইজ ব্যাটল</h4>
                        <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">বন্ধুদের সাথে লড়াই</p>
                    </div>
                </div>
            </div>
        </div>

        {/* 3. Model Test Section (New) */}
        <div>
            <h3 className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 mb-4 px-1 flex items-center gap-2 uppercase tracking-wider">
                <FileText size={14}/> মডেল টেস্ট (ফ্রি)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {MODEL_TESTS.map((test, idx) => (
                    <div 
                        key={idx}
                        onClick={() => navigate('/quiz', { state: { modelTest: test } })}
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 hover:border-primary/50 transition-all cursor-pointer group shadow-sm hover:shadow-lg active-scale relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-gray-100 dark:to-gray-700/30 rounded-bl-full opacity-50 transition-all group-hover:scale-110"></div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${test.color} group-hover:scale-110 transition-transform shadow-sm ring-1 ring-black/5 dark:ring-white/5`}>
                                <test.icon size={28} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-black text-gray-900 dark:text-white text-sm md:text-base leading-tight mb-1.5 truncate">{test.title}</h4>
                                <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-600"><HelpCircle size={10}/> {test.count} প্রশ্ন</span>
                                    <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-600"><Clock size={10}/> {test.time} মি.</span>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm border border-gray-200 dark:border-gray-600 group-hover:border-primary">
                                <Play size={16} fill="currentColor" className="ml-0.5 text-gray-400 group-hover:text-white dark:text-gray-300 transition-colors"/>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* 3. Subject Bubbles - Compact */}
        <div>
            <h3 className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 mb-4 px-1 flex items-center gap-2 uppercase tracking-wider"><BookOpen size={14}/> বিষয়ভিত্তিক অনুশীলন</h3>
            <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 no-scrollbar px-1">
                {SUBJECTS.map((sub, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => startSubjectPractice(sub.group)}
                        className={`min-w-[90px] md:min-w-[110px] bg-white dark:bg-gray-800 p-3 md:p-5 rounded-3xl border ${sub.border} dark:border-gray-700 flex flex-col items-center gap-3 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden`}
                    >
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity ${sub.color.split(' ')[0].replace('bg-', 'bg-')}`}></div>
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center ${sub.color.split(' ')[0]} ${sub.color.split(' ')[1]} group-hover:scale-110 transition-transform shadow-sm ring-1 ring-black/5 dark:ring-white/5`}>
                            <sub.icon size={20} className="md:w-[22px] md:h-[22px]" />
                        </div>
                        <span className="text-[11px] md:text-xs font-bold text-gray-700 dark:text-gray-200 text-center truncate w-full group-hover:text-primary transition-colors">{sub.name}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* 4. LEADERBOARD PREVIEW - Cyberpunk Glass */}
        <div 
            className="rounded-3xl md:rounded-[2.5rem] relative overflow-hidden group cursor-pointer shadow-xl shadow-blue-900/10 hover:shadow-2xl hover:shadow-blue-900/20 active-scale transition-all border border-gray-100 dark:border-gray-700" 
            onClick={() => navigate('/leaderboard')}
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 via-orange-950 to-gray-900 dark:from-black dark:via-gray-900 dark:to-black p-5 md:p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -mr-10 -mt-10 animate-pulse-slow"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500/20 rounded-full blur-2xl -ml-8 -mb-8"></div>
                
                <div className="flex justify-between items-center relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Trophy size={20} className="text-yellow-400 fill-yellow-400 animate-bounce-slow" />
                            <h3 className="text-lg md:text-2xl font-black text-white tracking-tight uppercase drop-shadow-md">লিডারবোর্ড</h3>
                        </div>
                        <p className="text-[10px] md:text-xs font-bold text-orange-200 tracking-[0.15em] uppercase flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
                            {myLeague.name} League
                        </p>
                    </div>
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-white/20 transition-all group-hover:scale-110 border border-white/10">
                        <ChevronRight size={20} className="text-white"/>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-3 md:p-4 space-y-2">
                {nearbyLearners.length === 0 ? (
                    <div className="text-center text-gray-400 text-xs py-6 font-medium">No data available</div>
                ) : (
                    nearbyLearners.map((u, idx) => {
                        const isMe = currentUser?.uid === u.uid;
                        let rankBadge = "bg-gray-100 text-gray-500 border-gray-200";
                        if (idx === 0) rankBadge = "bg-yellow-100 text-yellow-700 border-yellow-200 shadow-sm shadow-yellow-200/50";
                        else if (idx === 1) rankBadge = "bg-gray-200 text-gray-700 border-gray-300 shadow-sm";
                        else if (idx === 2) rankBadge = "bg-orange-100 text-orange-700 border-orange-200 shadow-sm shadow-orange-200/50";

                        return (
                            <div key={idx} className={`flex items-center justify-between p-3 rounded-2xl transition-all border ${isMe ? 'bg-blue-50/80 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700/50 shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30 border-transparent hover:border-gray-100 dark:hover:border-gray-700'}`}>
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center text-xs md:text-sm font-black border ${rankBadge} dark:bg-opacity-20 dark:border-opacity-30`}>
                                        {idx + 1}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            {(u.photoURL && u.photoURL !== 'false') ? (
                                                <img src={u.photoURL} alt="" className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-gray-100 object-cover border-2 border-white dark:border-gray-700 shadow-sm" />
                                            ) : (
                                                <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold border-2 border-white dark:border-gray-700 shadow-sm">
                                                    {u.displayName?.charAt(0) || 'U'}
                                                </div>
                                            )}
                                            {idx === 0 && <div className="absolute -top-1.5 -right-1.5 text-yellow-500 drop-shadow-sm"><Crown size={14} fill="currentColor"/></div>}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-bold ${isMe ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>{isMe ? 'আপনি' : u.displayName}</span>
                                            <span className="text-[10px] text-gray-400 font-medium truncate max-w-[100px] uppercase tracking-wide">{u.college || 'Student'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm md:text-base font-black text-gray-900 dark:text-white block tabular-nums tracking-tight">{u.points}</span>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Pts</span>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>

        {/* 5. Daily Learning Zone - Glassmorphism */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {/* Question of the Day */}
            <div id="qod-container" className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl p-5 md:p-6 rounded-3xl md:rounded-[2.5rem] border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-orange-500/5 flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-orange-500/20"></div>
                
                <div className="flex justify-between items-center mb-4 relative z-10">
                    <span className="text-[10px] md:text-xs font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wider shadow-sm"><Star size={12} fill="currentColor"/> আজকের প্রশ্ন</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{dailyQ.subject}</span>
                </div>
                
                <div className="flex-1 mb-6 relative z-10" key={dailyQ.id}>
                    <p className={`text-sm md:text-base font-bold text-gray-800 dark:text-gray-100 leading-loose font-tiro`}>
                        {dailyQ.question}
                    </p>
                </div>

                <div className="space-y-2.5 relative z-10" key={`opts-${dailyQ.id}`}>
                    {dailyQ.options.map((opt, idx) => {
                        let btnStyle = "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600";
                        let percentage = 0;
                        let showBar = false;

                        if (qodStatus !== 'UNANSWERED') {
                            showBar = true;
                            percentage = pollStats[idx];
                            if (idx === dailyQ.correct) {
                                btnStyle = "border-green-500 bg-green-50/50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-bold ring-1 ring-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]";
                            } else if (idx === selectedOpt) {
                                btnStyle = "border-red-500 bg-red-50/50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-bold shadow-[0_0_10px_rgba(239,68,68,0.2)]";
                            } else {
                                btnStyle = "opacity-50 grayscale border-gray-100 dark:border-gray-800";
                            }
                        }

                        return (
                            <button 
                                key={idx}
                                onClick={() => handleQodSubmit(idx)}
                                disabled={qodStatus !== 'UNANSWERED'}
                                className={`w-full p-3.5 rounded-2xl border text-xs md:text-sm text-left transition-all relative overflow-hidden group active-scale ${btnStyle}`}
                            >
                                {showBar && (
                                    <div 
                                        className={`absolute top-0 bottom-0 left-0 transition-all duration-1000 ease-out opacity-10 ${idx === dailyQ.correct ? 'bg-green-500' : 'bg-gray-500'}`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                )}
                                
                                <div className="flex justify-between items-center relative z-10">
                                    <span className="font-tiro text-gray-700 dark:text-gray-200">{opt}</span>
                                    {showBar && <span className="text-[10px] font-bold opacity-80">{percentage}%</span>}
                                </div>
                            </button>
                        )
                    })}
                </div>

                {qodStatus !== 'UNANSWERED' && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50 animate-in slide-in-from-bottom-2 fade-in duration-500">
                        <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl text-xs text-blue-800 dark:text-blue-300 mb-3 border border-blue-100 dark:border-blue-800/30">
                            <span className="font-bold uppercase tracking-wider text-[10px] block mb-1 opacity-70">Explanation</span> 
                            <span className="font-tiro leading-relaxed">{dailyQ.explanation}</span>
                        </div>
                        <button 
                            onClick={handlePracticeMore}
                            className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active-scale transition-all uppercase tracking-wider"
                        >
                            আরও প্রশ্ন <ArrowRight size={14}/>
                        </button>
                    </div>
                )}
            </div>

            {/* AI Card - Cyberpunk Style */}
            <div 
                onClick={() => navigate('/bot')}
                className="bg-gray-900 dark:bg-black p-6 rounded-3xl md:rounded-[2.5rem] border border-gray-800 shadow-2xl shadow-indigo-900/20 relative overflow-hidden group cursor-pointer active-scale transition-all hover:shadow-indigo-500/20"
            >
                {/* Cyberpunk Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.1)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20"></div>
                
                {/* AI Animation Fallback */}
                <div className="absolute top-0 right-0 w-40 h-40 opacity-40 pointer-events-none mix-blend-screen">
                    <LottieAnim 
                        url="https://assets2.lottiefiles.com/packages/lf20_m2igjux7.json" 
                        fallback={<Bot size={80} className="text-indigo-400 animate-pulse" />}
                        className="w-full h-full" 
                    />
                </div>
                
                <div className="relative z-10 h-full flex flex-col justify-between gap-6">
                    <div>
                        <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-4 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.3)] group-hover:scale-110 transition-transform duration-300">
                            <Bot size={24} />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2 tracking-tight">Synapse <span className="text-indigo-400">AI</span></h3>
                        <p className="text-sm text-gray-400 leading-relaxed max-w-[200px]">তোমার পার্সোনাল টিউটর। যেকোনো প্রশ্ন বা ডাউট ক্লিয়ার করো নিমেষেই।</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-widest group-hover:gap-3 transition-all">
                        <span>চ্যাট শুরু করুন</span> 
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                            <ChevronRight size={12}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>

      {/* Streak Modal - Cyberpunk Glass */}
      {showStreakModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-gray-900/90 dark:bg-black/90 w-full max-w-sm rounded-[2.5rem] shadow-2xl shadow-orange-500/20 p-6 relative overflow-hidden animate-modal-enter border border-gray-800">
                  {/* Ambient Glows */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500"></div>
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="absolute top-0 right-0 p-4 z-20">
                      <button onClick={() => setShowStreakModal(false)} className="p-2 bg-gray-800/50 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors border border-gray-700">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="text-center mt-6 mb-8 relative z-10">
                      <div className="w-40 h-40 mx-auto mb-4 drop-shadow-[0_0_25px_rgba(249,115,22,0.4)]">
                          <LottieAnim 
                              animationData={fireAnimData} 
                              className="w-full h-full" 
                          />
                      </div>
                      <h2 className="text-6xl font-black text-white tracking-tighter drop-shadow-lg mb-1">{currentStreak}</h2>
                      <p className="text-sm font-bold text-orange-400 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                          <span className="w-8 h-px bg-orange-500/50"></span>
                          Days Streak
                          <span className="w-8 h-px bg-orange-500/50"></span>
                      </p>
                      <p className="text-xs text-gray-400 mt-4 max-w-[240px] mx-auto leading-relaxed font-medium">প্রতিদিন অন্তত একটি কুইজ বা প্র্যাকটিস করে স্ট্রিক ধরে রাখুন!</p>
                  </div>

                  <div className="bg-gray-800/50 rounded-3xl p-5 border border-gray-700/50 backdrop-blur-sm">
                      <div className="flex justify-between items-center text-center">
                          {getWeekDays().map((day, idx) => {
                              const isActive = stats?.activityLog?.includes(day.date);
                              return (
                                  <div key={idx} className="flex flex-col items-center gap-3">
                                      <span className={`text-[10px] font-bold uppercase tracking-wider ${day.isToday ? 'text-orange-400' : 'text-gray-500'}`}>{day.name}</span>
                                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold border transition-all duration-300 ${
                                          isActive 
                                          ? 'bg-gradient-to-br from-orange-500 to-red-600 border-orange-400 text-white shadow-[0_0_10px_rgba(249,115,22,0.4)] scale-110' 
                                          : day.isToday 
                                              ? 'border-dashed border-gray-600 text-gray-400 bg-gray-800/50' 
                                              : 'border-gray-800 bg-gray-900/50 text-gray-600'
                                      }`}>
                                          {isActive ? <CheckCircle size={16} fill="currentColor" className="text-white"/> : day.isToday ? <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div> : ''}
                                      </div>
                                  </div>
                              )
                          })}
                      </div>
                  </div>
                  
                  <div className="mt-8">
                      <button onClick={() => { setShowStreakModal(false); navigate('/quiz'); }} className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-black rounded-2xl shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-sm flex items-center justify-center gap-2 group">
                          স্ট্রিক বজায় রাখুন <Flame size={16} className="group-hover:animate-pulse"/>
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default HomeDashboard;
