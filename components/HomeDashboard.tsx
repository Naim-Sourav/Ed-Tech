
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Bot, Search, PieChart, Swords, Library, 
  Sparkles, Trophy, Zap, Clock, 
  ChevronRight, Star, Archive, 
  Flame, CheckCircle, HelpCircle, XCircle, Lightbulb, Play, 
  Settings, Target, Calendar, Atom, Beaker, Calculator, Dna,
  BookOpen, Brain, Sun, Moon, CloudSun, Crown, X, LayoutGrid, BarChart2, Medal, TrendingUp
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
    { name: 'Physics', group: 'Physics', icon: Atom, color: 'bg-blue-100 text-blue-600', border: 'border-blue-200' },
    { name: 'Chemistry', group: 'Chemistry', icon: Beaker, color: 'bg-orange-100 text-orange-600', border: 'border-orange-200' },
    { name: 'Math', group: 'Higher Math', icon: Calculator, color: 'bg-red-100 text-red-600', border: 'border-red-200' },
    { name: 'Biology', group: 'Biology', icon: Dna, color: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-200' },
    { name: 'ICT', group: 'ICT', icon:  Brain, color: 'bg-purple-100 text-purple-600', border: 'border-purple-200' },
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
  { id: 'SCHOLAR', name: 'Scholar', min: 3000, max: 6999, color: 'text-blue-500' },
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
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors pb-24 md:pb-10">
      
      <div className="max-w-5xl mx-auto px-3 pt-4 md:px-4 md:pt-6 pb-20 space-y-4 md:space-y-6">
        
        {/* --- HEADER SECTION (COMPACT) --- */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl md:rounded-[2.5rem] p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-8">
                <div className="relative">
                    <div className="w-12 h-12 md:w-[72px] md:h-[72px] rounded-full p-0.5 border-2 md:border-[3px] border-[#E3F2FD] dark:border-blue-900 overflow-hidden">
                        {renderHeaderAvatar()}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 md:w-5 md:h-5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-base md:text-[22px] font-bold text-gray-900 dark:text-white leading-tight mb-0.5">
                        {t(greetingKey)}, <span className="text-primary">{currentUser?.displayName?.split(' ')[0] || 'Learner'}</span> 👋
                    </h1>
                    <div className="max-w-[180px] md:max-w-[200px]">
                        <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">
                            <span className={`flex items-center gap-1 ${myLeague.color}`}>
                                <Crown size={10} fill="currentColor" /> {myLeague.name}
                            </span>
                            <span className="font-mono">{currentPoints} / {myLeague.max}</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-3">
                <div onClick={() => navigate('/leaderboard')} className="bg-[#FFFDE7] dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 p-2 md:p-4 rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center gap-0.5 md:gap-2 cursor-pointer hover:bg-yellow-50 transition-colors">
                    {/* Rank Lottie */}
                    <div className="w-8 h-8 md:w-10 md:h-10">
                        <LottieAnim 
                            animationData={rankAnimData} // Using imported Rank Data
                            fallback={<Trophy size={32} className="text-yellow-500 fill-yellow-500 animate-bounce" />}
                            className="w-full h-full" 
                        />
                    </div>
                    <p className="text-[9px] md:text-xs font-bold text-gray-500 dark:text-gray-400">র‍্যাংক</p>
                    <p className="text-sm md:text-xl font-black text-gray-900 dark:text-white">#{rank || '-'}</p>
                </div>
                <div className="bg-[#E3F2FD] dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-2 md:p-4 rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center gap-0.5 md:gap-2">
                    {/* Points Lottie */}
                    <div className="w-8 h-8 md:w-10 md:h-10">
                        <LottieAnim 
                            animationData={pointsAnimData} // Using imported Points Data
                            fallback={<Zap size={32} className="text-[#2979FF] fill-current animate-pulse" />}
                            className="w-full h-full" 
                        />
                    </div>
                    <p className="text-[9px] md:text-xs font-bold text-gray-500 dark:text-gray-400">পয়েন্ট</p>
                    <p className="text-sm md:text-xl font-black text-gray-900 dark:text-white">{stats?.points || 0}</p>
                </div>
                <div onClick={() => setShowStreakModal(true)} className="bg-[#E8F5E9] dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 p-2 md:p-4 rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center gap-0.5 md:gap-2 cursor-pointer hover:bg-green-50 transition-colors group">
                    {/* Fire Lottie */}
                    <div className="w-8 h-8 md:w-10 md:h-10">
                        <LottieAnim 
                            animationData={fireAnimData} 
                            fallback={<Flame size={32} className="text-orange-500 fill-orange-500 animate-pulse" />}
                            className="w-full h-full" 
                        />
                    </div>
                    <p className="text-[9px] md:text-xs font-bold text-gray-500 dark:text-gray-400">স্ট্রিক</p>
                    <p className="text-sm md:text-xl font-black text-gray-900 dark:text-white">{currentStreak} 🔥</p>
                </div>
            </div>
        </div>

        {/* 1. Featured Banner (GST) - Compact */}
        <div 
            onClick={() => navigate('/gst-special')}
            className="w-full relative bg-gray-900 dark:bg-black rounded-3xl md:rounded-[2.5rem] p-5 md:p-8 text-white overflow-hidden shadow-lg cursor-pointer group border border-gray-800"
        >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 bg-red-600/30 rounded-full blur-[60px] md:blur-[80px] -mr-10 -mt-10 group-hover:bg-red-600/40 transition-all duration-700"></div>
            
            <div className="relative z-10 flex flex-col gap-2 md:gap-3">
                <div className="flex items-center gap-2">
                    <span className="bg-red-600 text-white text-[9px] md:text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-lg shadow-red-600/40 animate-pulse">Live</span>
                    <span className="text-red-300 text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-1"><Target size={12}/> Admission</span>
                </div>
                <h2 className="text-xl md:text-4xl font-black leading-tight">
                    GST <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">সুপার ফোকাস</span>
                </h2>
                <p className="text-xs md:text-sm text-gray-300 max-w-sm font-medium leading-snug">৪৫ দিনের ফিক্সড রুটিন। ডিসিপ্লিন, ডেডিকেশন, ডমিনেশন।</p>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-white group-hover:gap-2 transition-all">
                    <span className="border-b border-red-500 pb-0.5">রুটিন দেখুন</span> <ArrowRight size={14}/>
                </div>
            </div>
        </div>

        {/* 2. Main Menu Grid - Compact */}
        <div>
            <h3 className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 px-1 flex items-center gap-2"><LayoutGrid size={14}/> কুইক অ্যাক্সেস</h3>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
                {/* Rapid Fire */}
                <div 
                    onClick={() => navigate('/quiz', { state: { mode: 'RAPID_FIRE' } })}
                    className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl md:rounded-[2rem] border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 transition-all cursor-pointer group relative overflow-hidden h-28 md:h-40 flex flex-col justify-between shadow-sm"
                >
                    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity"><Flame size={60} /></div>
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-red-50 dark:bg-red-900/30 rounded-xl flex items-center justify-center text-red-500 shadow-sm group-hover:scale-110 transition-transform">
                        <Flame size={18} fill="currentColor" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm md:text-base">র‍্যাপিড ফায়ার</h4>
                        <p className="text-[9px] md:text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">দ্রুত কুইজ প্র্যাকটিস</p>
                    </div>
                </div>

                {/* Model Test */}
                <div 
                    onClick={() => navigate('/quiz')}
                    className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl md:rounded-[2rem] border border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-700 transition-all cursor-pointer group relative overflow-hidden h-28 md:h-40 flex flex-col justify-between shadow-sm"
                >
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-violet-50 dark:bg-violet-900/30 rounded-xl flex items-center justify-center text-violet-600 shadow-sm group-hover:scale-110 transition-transform">
                        <Settings size={18} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm md:text-base">মডেল টেস্ট</h4>
                        <p className="text-[9px] md:text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">কাস্টম এক্সাম দিন</p>
                    </div>
                </div>

                {/* Question Bank */}
                <div 
                    onClick={() => navigate('/qbank')}
                    className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl md:rounded-[2rem] border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group relative overflow-hidden h-28 md:h-40 flex flex-col justify-between shadow-sm"
                >
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                        <Archive size={18} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm md:text-base">প্রশ্ন ব্যাংক</h4>
                        <p className="text-[9px] md:text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">বিগত বছরের প্রশ্ন</p>
                    </div>
                </div>

                {/* Battle */}
                <div 
                    onClick={() => navigate('/battle')}
                    className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl md:rounded-[2rem] border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-700 transition-all cursor-pointer group relative overflow-hidden h-28 md:h-40 flex flex-col justify-between shadow-sm"
                >
                    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity"><Swords size={60} /></div>
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 shadow-sm group-hover:scale-110 transition-transform">
                        <Swords size={18} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm md:text-base">কুইজ ব্যাটল</h4>
                        <p className="text-[9px] md:text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">বন্ধুদের সাথে লড়াই</p>
                    </div>
                </div>
            </div>
        </div>

        {/* 3. Subject Bubbles - Compact */}
        <div>
            <h3 className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 px-1 flex items-center gap-2"><BookOpen size={14}/> বিষয়ভিত্তিক অনুশীলন</h3>
            <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 no-scrollbar">
                {SUBJECTS.map((sub, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => startSubjectPractice(sub.group)}
                        className={`min-w-[85px] md:min-w-[100px] bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl md:rounded-[2rem] border ${sub.border} dark:border-gray-700 flex flex-col items-center gap-2 cursor-pointer hover:shadow-md transition-all group`}
                    >
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${sub.color.split(' ')[0]} ${sub.color.split(' ')[1]} group-hover:scale-110 transition-transform`}>
                            <sub.icon size={16} className="md:w-[18px] md:h-[18px]" />
                        </div>
                        <span className="text-[10px] md:text-[11px] font-bold text-gray-700 dark:text-gray-200 text-center truncate w-full">{sub.name}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* 4. LEADERBOARD PREVIEW - Compact */}
        <div 
            className="rounded-3xl md:rounded-[2.5rem] relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700" 
            onClick={() => navigate('/leaderboard')}
        >
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 p-4 md:p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
                <div className="flex justify-between items-center relative z-10">
                    <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <Trophy size={16} className="text-yellow-400 fill-yellow-400 animate-pulse" />
                            <h3 className="text-base md:text-xl font-black text-white tracking-tight uppercase">লিডারবোর্ড</h3>
                        </div>
                        <p className="text-[10px] md:text-xs font-bold text-gray-400 tracking-wide uppercase">{myLeague.name} League</p>
                    </div>
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <ChevronRight size={16} className="text-white"/>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 md:p-4 space-y-1.5 md:space-y-2">
                {nearbyLearners.length === 0 ? (
                    <div className="text-center text-gray-400 text-xs py-4">No data available</div>
                ) : (
                    nearbyLearners.map((u, idx) => {
                        const isMe = currentUser?.uid === u.uid;
                        let rankBadge = "bg-gray-100 text-gray-500";
                        if (idx === 0) rankBadge = "bg-yellow-100 text-yellow-700 border border-yellow-200";
                        else if (idx === 1) rankBadge = "bg-gray-100 text-gray-700 border border-gray-300";
                        else if (idx === 2) rankBadge = "bg-orange-50 text-orange-700 border border-orange-200";

                        return (
                            <div key={idx} className={`flex items-center justify-between p-2.5 md:p-3 rounded-xl transition-all ${isMe ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30 border border-transparent'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-xs font-black ${rankBadge} dark:bg-opacity-20`}>
                                        {idx + 1}
                                    </div>
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="relative">
                                            <img src={u.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`} alt="" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 object-cover border border-white dark:border-gray-700 shadow-sm" />
                                            {idx === 0 && <div className="absolute -top-1 -right-1 text-yellow-500"><Crown size={10} fill="currentColor"/></div>}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-xs md:text-sm font-bold ${isMe ? 'text-primary' : 'text-gray-800 dark:text-white'}`}>{isMe ? 'আপনি' : u.displayName}</span>
                                            <span className="text-[9px] md:text-[10px] text-gray-400 font-medium truncate max-w-[80px] md:max-w-[120px]">{u.college || 'Student'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs md:text-sm font-black text-gray-800 dark:text-white block">{u.points}</span>
                                    <span className="text-[8px] font-bold text-gray-400 uppercase">Pts</span>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>

        {/* 5. Daily Learning Zone - Compact */}
        <div className="grid md:grid-cols-2 gap-4">
            {/* Question of the Day */}
            <div id="qod-container" className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-3xl md:rounded-[2.5rem] border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-full flex items-center gap-1"><Star size={10} fill="currentColor"/> আজকের প্রশ্ন</span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase">{dailyQ.subject}</span>
                </div>
                
                <div className="flex-1 mb-4" key={dailyQ.id}>
                    <p className={`text-sm font-bold text-gray-800 dark:text-gray-200 leading-relaxed font-tiro`}>
                        {dailyQ.question}
                    </p>
                </div>

                <div className="space-y-1.5 relative z-10" key={`opts-${dailyQ.id}`}>
                    {dailyQ.options.map((opt, idx) => {
                        let btnStyle = "border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700";
                        let percentage = 0;
                        let showBar = false;

                        if (qodStatus !== 'UNANSWERED') {
                            showBar = true;
                            percentage = pollStats[idx];
                            if (idx === dailyQ.correct) {
                                btnStyle = "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-bold ring-1 ring-green-500";
                            } else if (idx === selectedOpt) {
                                btnStyle = "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-bold";
                            } else {
                                btnStyle = "opacity-60 grayscale border-gray-100 dark:border-gray-800";
                            }
                        }

                        return (
                            <button 
                                key={idx}
                                onClick={() => handleQodSubmit(idx)}
                                disabled={qodStatus !== 'UNANSWERED'}
                                className={`w-full p-2.5 rounded-xl border text-xs text-left transition-all relative overflow-hidden group ${btnStyle}`}
                            >
                                {showBar && (
                                    <div 
                                        className={`absolute top-0 bottom-0 left-0 transition-all duration-1000 ease-out opacity-20 ${idx === dailyQ.correct ? 'bg-green-500' : 'bg-gray-400'}`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                )}
                                
                                <div className="flex justify-between items-center relative z-10">
                                    <span className="font-tiro text-gray-700 dark:text-gray-300">{opt}</span>
                                    {showBar && <span className="text-[9px] font-bold opacity-70">{percentage}%</span>}
                                </div>
                            </button>
                        )
                    })}
                </div>

                {qodStatus !== 'UNANSWERED' && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 animate-in slide-in-from-bottom-2">
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-[10px] md:text-xs text-blue-800 dark:text-blue-300 mb-2">
                            <span className="font-bold">ব্যাখ্যা: </span> 
                            <span className="font-tiro">{dailyQ.explanation}</span>
                        </div>
                        <button 
                            onClick={handlePracticeMore}
                            className="w-full py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                        >
                            আরও প্রশ্ন <ArrowRight size={12}/>
                        </button>
                    </div>
                )}
            </div>

            {/* AI Card */}
            <div 
                onClick={() => navigate('/bot')}
                className="bg-white dark:bg-gray-800 p-5 rounded-3xl md:rounded-[2.5rem] border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group cursor-pointer"
            >
                {/* AI Animation Fallback */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-20 pointer-events-none">
                    <LottieAnim 
                        url="https://assets2.lottiefiles.com/packages/lf20_m2igjux7.json" 
                        fallback={<Bot size={64} className="text-indigo-500/50" />}
                        className="w-full h-full" 
                    />
                </div>
                
                <div className="relative z-10 h-full flex flex-col justify-between gap-4">
                    <div>
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl flex items-center justify-center mb-3">
                            <Bot size={20} />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Synapse AI</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">তোমার পার্সোনাল টিউটর। যেকোনো প্রশ্ন বা ডাউট ক্লিয়ার করো।</p>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:gap-2 transition-all">চ্যাট শুরু করুন <ChevronRight size={12}/></span>
                </div>
            </div>
        </div>

      </div>

      {/* Streak Modal */}
      {showStreakModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-[2rem] shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95">
                  <div className="absolute top-0 right-0 p-4">
                      <button onClick={() => setShowStreakModal(false)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="text-center mt-4 mb-8">
                      <div className="w-32 h-32 mx-auto mb-4">
                          <LottieAnim 
                              animationData={fireAnimData} // Use local JSON here too
                              className="w-full h-full" 
                          />
                      </div>
                      <h2 className="text-4xl font-black text-gray-800 dark:text-white">{currentStreak}</h2>
                      <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Days Streak</p>
                      <p className="text-xs text-gray-400 mt-2 max-w-[200px] mx-auto">প্রতিদিন অন্তত একটি কুইজ বা প্র্যাকটিস করে স্ট্রিক ধরে রাখুন!</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                      <div className="flex justify-between items-center text-center">
                          {getWeekDays().map((day, idx) => {
                              const isActive = stats?.activityLog?.includes(day.date);
                              return (
                                  <div key={idx} className="flex flex-col items-center gap-2">
                                      <span className={`text-[10px] font-bold ${day.isToday ? 'text-primary' : 'text-gray-400'}`}>{day.name}</span>
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                                          isActive 
                                          ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-200' 
                                          : day.isToday 
                                              ? 'border-dashed border-gray-300 dark:border-gray-600 text-gray-300' 
                                              : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-300'
                                      }`}>
                                          {isActive ? <CheckCircle size={14} fill="currentColor" className="text-white"/> : day.isToday ? <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div> : ''}
                                      </div>
                                  </div>
                              )
                          })}
                      </div>
                  </div>
                  
                  <div className="mt-6">
                      <button onClick={() => { setShowStreakModal(false); navigate('/quiz'); }} className="w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl shadow-lg transition-transform active:scale-95">
                          স্ট্রিক বজায় রাখুন
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default HomeDashboard;
