
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Bot, Search, PieChart, Swords, Library, 
  Sparkles, Trophy, Zap, Clock, 
  ChevronRight, Star, Archive, 
  Flame, CheckCircle, HelpCircle, XCircle, Lightbulb, Play, 
  Settings, Target, Calendar, Atom, Beaker, Calculator, Dna,
  BookOpen, Brain, Sun, Moon, CloudSun, Crown, X, LayoutGrid
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchUserStatsAPI, fetchLeaderboardAPI } from '../services/api';
import { useCache } from '../contexts/CacheContext';

const DAILY_QUESTION = {
    id: 1,
    question: "নিচের কোনটি ভেক্টর রাশি নয়?",
    options: ["তড়িৎ প্রাবল্য", "তড়িৎ বিভব", "চৌম্বক ভ্রামক", "মহাকর্ষীয় প্রাবল্য"],
    correct: 1, // Index
    explanation: "তড়িৎ বিভব (Electric Potential) একটি স্কেলার রাশি, কারণ এটি কাজ বা শক্তির সাথে সম্পর্কিত। বাকি সব ভেক্টর রাশি।"
};

const SUBJECTS = [
    { name: 'Physics', group: 'Physics', icon: Atom, color: 'bg-blue-100 text-blue-600', border: 'border-blue-200' },
    { name: 'Chemistry', group: 'Chemistry', icon: Beaker, color: 'bg-orange-100 text-orange-600', border: 'border-orange-200' },
    { name: 'Math', group: 'Higher Math', icon: Calculator, color: 'bg-red-100 text-red-600', border: 'border-red-200' },
    { name: 'Biology', group: 'Biology', icon: Dna, color: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-200' },
    { name: 'ICT', group: 'ICT', icon:  Brain, color: 'bg-purple-100 text-purple-600', border: 'border-purple-200' },
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
  const [rank, setRank] = useState<number | null>(cachedData.rank || null);
  
  // Only show loading if we have NO cached data. 
  // If we have cache, we show that while fetching new data in background (Stale-While-Revalidate).
  const [isLoading, setIsLoading] = useState(!cachedData.stats); 
  
  // Interactive States
  const [qodStatus, setQodStatus] = useState<'UNANSWERED' | 'CORRECT' | 'WRONG'>('UNANSWERED');
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [showStreakModal, setShowStreakModal] = useState(false);
  
  // Time State
  const [currentTime, setCurrentTime] = useState(new Date());

  const loadData = async () => {
      if (currentUser) {
        // If no cache, set loading true. If cache exists, keep loading false (silent update)
        if (!stats) setIsLoading(true);
        
        try {
            // Load stats and leaderboard in parallel
            const [statsData, leaderboardData] = await Promise.all([
                fetchUserStatsAPI(currentUser.uid).catch(e => null),
                fetchLeaderboardAPI().catch(e => [])
            ]);

            if (statsData) {
                setStats(statsData);
            }
            
            let userRank = null;
            if (leaderboardData && Array.isArray(leaderboardData)) {
                const r = leaderboardData.findIndex(u => u.uid === currentUser.uid);
                if (r !== -1) {
                    userRank = r + 1;
                    setRank(userRank);
                }
            }

            // Update Cache with fresh data
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

  useEffect(() => {
    setGreetingKey(getGreeting());
    loadData();
    
    // Timer
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [currentUser]);

  const handleQodSubmit = (idx: number) => {
      if (qodStatus !== 'UNANSWERED') return;
      setSelectedOpt(idx);
      if (idx === DAILY_QUESTION.correct) {
          setQodStatus('CORRECT');
      } else {
          setQodStatus('WRONG');
      }
  };

  const startSubjectPractice = (groupName: string) => {
      navigate('/quiz', { state: { subject: groupName } });
  };

  // Rank Calculation Logic
  const getRankDetails = (points: number) => {
      if (points < 1000) return { name: 'Novice', min: 0, max: 1000, color: 'text-gray-500' };
      if (points < 3000) return { name: 'Apprentice', min: 1000, max: 3000, color: 'text-emerald-500' };
      if (points < 7000) return { name: 'Scholar', min: 3000, max: 7000, color: 'text-blue-500' };
      if (points < 15000) return { name: 'Master', min: 7000, max: 15000, color: 'text-purple-500' };
      return { name: 'Grandmaster', min: 15000, max: 30000, color: 'text-orange-500' };
  };

  const currentPoints = stats?.points || 0;
  const currentStreak = stats?.currentStreak || 0;
  const rankInfo = getRankDetails(currentPoints);
  const progressPercent = Math.min(100, Math.max(0, ((currentPoints - rankInfo.min) / (rankInfo.max - rankInfo.min)) * 100));
  
  // Calculate Week Days (Sat to Fri) - Timezone Aware
  // Matches Backend Logic
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
      
      const currentDay = today.getDay(); // 0=Sun, 6=Sat
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
        return (
            <img 
                src={userAvatar} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover" 
            />
        );
    }
    return (
        <div className="w-full h-full rounded-full flex items-center justify-center bg-primary text-white font-bold text-2xl">
            {currentUser?.displayName?.charAt(0).toUpperCase() || 'U'}
        </div>
    );
  };

  // --- SKELETON LOADER COMPONENT ---
  const DashboardSkeleton = () => (
    <div className="max-w-5xl mx-auto px-4 pt-4 md:pt-6 pb-20 space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-3">
                    <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-[1.5rem]"></div>
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-[1.5rem]"></div>
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-[1.5rem]"></div>
            </div>
        </div>

        {/* Banner Skeleton */}
        <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-[2rem]"></div>

        {/* Menu Grid Skeleton */}
        <div className="grid grid-cols-2 gap-4">
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-[2rem]"></div>
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-[2rem]"></div>
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-[2rem]"></div>
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-[2rem]"></div>
        </div>
    </div>
  );

  if (isLoading && !stats) return <DashboardSkeleton />;

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors pb-24 md:pb-10">
      
      <div className="max-w-5xl mx-auto px-4 pt-4 md:pt-6 pb-20 space-y-6">
        
        {/* --- HEADER SECTION START (UNCHANGED) --- */}
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-8">
                <div className="relative">
                    <div className="w-14 h-14 md:w-[72px] md:h-[72px] rounded-full p-1 border-[2px] md:border-[3px] border-[#E3F2FD] dark:border-blue-900 overflow-hidden">
                        {renderHeaderAvatar()}
                    </div>
                    <div className="absolute bottom-0.5 right-0.5 md:bottom-1 md:right-1 w-3.5 h-3.5 md:w-5 md:h-5 bg-green-500 border-[2px] md:border-[3px] border-white dark:border-gray-800 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg md:text-[22px] font-bold text-gray-900 dark:text-white leading-tight mb-1">
                        {t(greetingKey)}, <span className="text-primary">{currentUser?.displayName?.split(' ')[0] || 'Learner'}</span> 👋
                    </h1>
                    <div className="max-w-[200px]">
                        <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">
                            <span className={`flex items-center gap-1 ${rankInfo.color}`}>
                                <Crown size={12} fill="currentColor" /> {rankInfo.name}
                            </span>
                            <span className="font-mono">{currentPoints} / {rankInfo.max}</span>
                        </div>
                        <div className="w-full h-1.5 md:h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-3">
                <div onClick={() => navigate('/leaderboard')} className="bg-[#FFFDE7] dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 p-2.5 md:p-4 rounded-[1.5rem] md:rounded-[2rem] flex flex-col items-center justify-center gap-1 md:gap-2 cursor-pointer hover:bg-yellow-50 transition-colors">
                    <Trophy className="text-[#FBC02D] mb-0.5 w-[18px] h-[18px] md:w-[22px] md:h-[22px]" strokeWidth={2.5} />
                    <p className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400">র‍্যাংক</p>
                    <p className="text-base md:text-xl font-black text-gray-900 dark:text-white">#{rank || '-'}</p>
                </div>
                <div className="bg-[#E3F2FD] dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-2.5 md:p-4 rounded-[1.5rem] md:rounded-[2rem] flex flex-col items-center justify-center gap-1 md:gap-2">
                    <Zap className="text-[#2979FF] mb-0.5 w-[18px] h-[18px] md:w-[22px] md:h-[22px]" fill="currentColor" />
                    <p className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400">পয়েন্ট</p>
                    <p className="text-base md:text-xl font-black text-gray-900 dark:text-white">{stats?.points || 0}</p>
                </div>
                <div onClick={() => setShowStreakModal(true)} className="bg-[#E8F5E9] dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 p-2.5 md:p-4 rounded-[1.5rem] md:rounded-[2rem] flex flex-col items-center justify-center gap-1 md:gap-2 cursor-pointer hover:bg-green-50 transition-colors">
                    <Flame className="text-[#00C853] mb-0.5 w-[18px] h-[18px] md:w-[22px] md:h-[22px]" fill="currentColor"/>
                    <p className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400">স্ট্রিক</p>
                    <p className="text-base md:text-xl font-black text-gray-900 dark:text-white">{currentStreak} 🔥</p>
                </div>
            </div>
        </div>
        {/* --- HEADER SECTION END --- */}

        {/* --- NEW MODERN BODY DESIGN --- */}

        {/* 1. Featured Banner (GST) */}
        <div 
            onClick={() => navigate('/gst-special')}
            className="w-full relative bg-gray-900 dark:bg-black rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-white overflow-hidden shadow-2xl shadow-red-900/20 cursor-pointer group border border-gray-800"
        >
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/30 rounded-full blur-[80px] -mr-10 -mt-10 group-hover:bg-red-600/40 transition-all duration-700"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/20 rounded-full blur-[60px] -ml-5 -mb-5"></div>

            <div className="relative z-10 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-lg shadow-red-600/40 animate-pulse">Live</span>
                    <span className="text-red-300 text-xs font-bold uppercase tracking-widest flex items-center gap-1"><Target size={14}/> Admission 2025</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-black leading-tight">
                    GST <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">সুপার ফোকাস</span>
                </h2>
                <p className="text-sm text-gray-300 max-w-sm font-medium">ডিসিপ্লিন, ডেডিকেশন, ডমিনেশন। ৪৫ দিনের কমপ্লিট টাস্ক ও এক্সাম রুটিন।</p>
                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-white group-hover:gap-3 transition-all">
                    <span className="border-b-2 border-red-500 pb-0.5">রুটিন দেখুন</span> <ArrowRight size={16}/>
                </div>
            </div>
        </div>

        {/* 2. Main Menu Grid (Bento Style) */}
        <div>
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-4 px-1 flex items-center gap-2"><LayoutGrid size={16}/> কুইক অ্যাক্সেস</h3>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
                
                {/* Rapid Fire */}
                <div 
                    onClick={() => navigate('/quiz', { state: { mode: 'RAPID_FIRE' } })}
                    className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 transition-all cursor-pointer group relative overflow-hidden h-32 md:h-40 flex flex-col justify-between shadow-sm"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Flame size={80} />
                    </div>
                    <div className="w-10 h-10 bg-red-50 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-red-500 shadow-sm group-hover:scale-110 transition-transform">
                        <Flame size={20} fill="currentColor" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-base">র‍্যাপিড ফায়ার</h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">দ্রুত কুইজ প্র্যাকটিস</p>
                    </div>
                </div>

                {/* Model Test */}
                <div 
                    onClick={() => navigate('/quiz')}
                    className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] border border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-700 transition-all cursor-pointer group relative overflow-hidden h-32 md:h-40 flex flex-col justify-between shadow-sm"
                >
                    <div className="w-10 h-10 bg-violet-50 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center text-violet-600 shadow-sm group-hover:scale-110 transition-transform">
                        <Settings size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-base">মডেল টেস্ট</h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">কাস্টম এক্সাম দিন</p>
                    </div>
                </div>

                {/* Question Bank */}
                <div 
                    onClick={() => navigate('/qbank')}
                    className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group relative overflow-hidden h-32 md:h-40 flex flex-col justify-between shadow-sm"
                >
                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                        <Archive size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-base">প্রশ্ন ব্যাংক</h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">বিগত বছরের প্রশ্ন</p>
                    </div>
                </div>

                {/* Battle */}
                <div 
                    onClick={() => navigate('/battle')}
                    className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-700 transition-all cursor-pointer group relative overflow-hidden h-32 md:h-40 flex flex-col justify-between shadow-sm"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Swords size={80} />
                    </div>
                    <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm group-hover:scale-110 transition-transform">
                        <Swords size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-base">কুইজ ব্যাটল</h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">বন্ধুদের সাথে লড়াই</p>
                    </div>
                </div>
            </div>
        </div>

        {/* 3. Subject Bubbles (Horizontal) */}
        <div>
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-4 px-1 flex items-center gap-2"><BookOpen size={16}/> বিষয়ভিত্তিক অনুশীলন</h3>
            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                {SUBJECTS.map((sub, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => startSubjectPractice(sub.group)}
                        className={`min-w-[100px] bg-white dark:bg-gray-800 p-4 rounded-[2rem] border ${sub.border} dark:border-gray-700 flex flex-col items-center gap-3 cursor-pointer hover:shadow-md transition-all group`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${sub.color.split(' ')[0]} ${sub.color.split(' ')[1]} group-hover:scale-110 transition-transform`}>
                            <sub.icon size={18} />
                        </div>
                        <span className="text-[11px] font-bold text-gray-700 dark:text-gray-200 text-center">{sub.name}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* 4. Daily Learning Zone */}
        <div className="grid md:grid-cols-2 gap-4">
            {/* AI Card */}
            <div 
                onClick={() => navigate('/bot')}
                className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group cursor-pointer"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-indigo-500/20 transition-all"></div>
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                        <Bot size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Synapse AI</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">তোমার পার্সোনাল টিউটর। যেকোনো প্রশ্ন বা ডাউট ক্লিয়ার করো।</p>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">চ্যাট শুরু করুন <ChevronRight size={14}/></span>
                </div>
            </div>

            {/* Question of the Day */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full flex items-center gap-1"><Star size={12} fill="currentColor"/> আজকের প্রশ্ন</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Physics</span>
                </div>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 flex-1 leading-relaxed">
                    {DAILY_QUESTION.question}
                </p>
                <div className="space-y-2">
                    {DAILY_QUESTION.options.slice(0, 2).map((opt, idx) => {
                        let style = "bg-gray-50 dark:bg-gray-700/30 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700";
                        if (qodStatus !== 'UNANSWERED') {
                            if (idx === DAILY_QUESTION.correct) style = "bg-green-100 dark:bg-green-900/30 border-green-200 text-green-700 dark:text-green-400 font-bold";
                            else if (idx === selectedOpt) style = "bg-red-100 dark:bg-red-900/30 border-red-200 text-red-700 dark:text-red-400";
                        }
                        return (
                            <button 
                                key={idx}
                                onClick={() => handleQodSubmit(idx)}
                                disabled={qodStatus !== 'UNANSWERED'}
                                className={`w-full p-3 rounded-xl border text-xs font-bold text-left transition-all ${style}`}
                            >
                                {opt}
                            </button>
                        )
                    })}
                    {qodStatus === 'UNANSWERED' && <p className="text-center text-[10px] text-gray-400 mt-1 italic">আরও অপশন আছে...</p>}
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
                      <div className="inline-block p-4 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-500 mb-4 animate-bounce">
                          <Flame size={48} fill="currentColor" />
                      </div>
                      <h2 className="text-4xl font-black text-gray-800 dark:text-white">{currentStreak}</h2>
                      <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Days Streak</p>
                      <p className="text-xs text-gray-400 mt-2 max-w-[200px] mx-auto">প্রতিদিন অন্তত একটি কুইজ বা প্র্যাকটিস করে স্ট্রিক ধরে রাখুন!</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                      <div className="flex justify-between items-center text-center">
                          {getWeekDays().map((day, idx) => {
                              // Ensure date formats match YYYY-MM-DD from API
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
