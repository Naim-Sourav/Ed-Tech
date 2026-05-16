
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Archive, 
  Flame, CheckCircle, Circle,
  Settings, Atom, Beaker, Calculator, Dna,
  BookOpen, Brain, Crown, X, 
  Target, 
  TrendingUp, MoreHorizontal, Sparkles, PieChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchUserStatsAPI, fetchLeaderboardAPI } from '../services/api';
import { useCache } from '../contexts/CacheContext';
import { LeaderboardUser } from '../types';
import { toBengaliNumber } from '../utils/numberUtils';

// --- CONSTANTS & MOCK DATA ---

const SUBJECTS = [
    { name: 'Physics', group: 'Physics', icon: Atom, color: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-500/10 dark:to-orange-500/5 text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-500/10' },
    { name: 'Chemistry', group: 'Chemistry', icon: Beaker, color: 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-500/10 dark:to-amber-500/5 text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/10' },
    { name: 'Math', group: 'Higher Math', icon: Calculator, color: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-500/10 dark:to-red-500/5 text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-500/10' },
    { name: 'Biology', group: 'Biology', icon: Dna, color: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-500/10 dark:to-orange-500/5 text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-500/10' },
    { name: 'ICT', group: 'ICT', icon:  Brain, color: 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-500/10 dark:to-amber-500/5 text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/10' },
];

// Custom SVG Icon Component for Dashboard Stats
const StatIcon = ({ src, className }: { src: string, className?: string }) => (
  <div 
    className={`w-8 h-8 md:w-10 md:h-10 transition-all duration-300 ${className}`}
    style={{ 
      maskImage: `url(${src})`, 
      WebkitMaskImage: `url(${src})`,
      maskRepeat: 'no-repeat',
      WebkitMaskRepeat: 'no-repeat',
      maskPosition: 'center',
      WebkitMaskPosition: 'center',
      maskSize: 'contain',
      WebkitMaskSize: 'contain',
      backgroundColor: 'currentColor'
    }}
  />
);

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
  
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'week'>('today');
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showDevNotice, setShowDevNotice] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hide_dev_notice') !== 'true';
    }
    return true;
  });
  
  const isCheckedIn = useMemo(() => {
    if (!stats?.activityLog) return false;
    const todayStr = new Intl.DateTimeFormat('en-CA', { 
        timeZone: 'Asia/Dhaka', 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    }).format(new Date());
    return stats.activityLog.includes(todayStr);
  }, [stats]);

  const loadData = async () => {
      if (currentUser) {
        if (!stats) setIsLoading(true);
        try {
            const [statsData, leaderboardData] = await Promise.all([
                fetchUserStatsAPI(currentUser.uid).catch(() => null),
                fetchLeaderboardAPI().catch(() => [])
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

  useEffect(() => {
    setGreetingKey(getGreeting());
    loadData();
  }, [currentUser]);

  const startSubjectPractice = (groupName: string) => {
      navigate('/quiz', { state: { subject: groupName } });
  };

  // Rank Calculation
  const currentStreak = stats?.currentStreak || 0;
  
  // Filter Leaderboard for Preview
  const topLearners = useMemo(() => {
      if (!leaderboard.length) return [];
      return leaderboard.slice(0, 5);
  }, [leaderboard]);

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
        <div className="bg-white dark:bg-black rounded-3xl p-4 border border-gray-200 dark:border-white/[0.05]">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gray-200 dark:bg-white/[0.05] rounded-full"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-gray-200 dark:bg-white/[0.05] rounded"></div>
                    <div className="h-3 w-24 bg-gray-200 dark:bg-white/[0.05] rounded"></div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
                <div className="h-16 bg-gray-200 dark:bg-white/[0.05] rounded-2xl"></div>
                <div className="h-16 bg-gray-200 dark:bg-white/[0.05] rounded-2xl"></div>
                <div className="h-16 bg-gray-200 dark:bg-white/[0.05] rounded-2xl"></div>
            </div>
        </div>
        <div className="w-full h-32 bg-gray-200 dark:bg-white/[0.05] rounded-3xl"></div>
    </div>
  );

  if (isLoading && !stats) return <DashboardSkeleton />;

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900 transition-colors pb-32 md:pb-40 relative overflow-hidden">
      {/* Background glows removed for solid look */}
      
      <div className="max-w-5xl mx-auto px-4 pt-4 md:px-6 md:pt-8 space-y-6 md:space-y-8 animate-page-enter relative z-10">
        
        {/* --- HEADER SECTION --- */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-3 md:p-6 border border-gray-100 dark:border-white/5 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-4 md:mb-6 relative z-10">
                <div className="flex items-center gap-3 md:gap-4">
                    <motion.div 
                        whileTap={{ scale: 0.9 }}
                        className="relative group cursor-pointer"
                        onClick={() => navigate('/profile')}
                    >
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full p-0.5 border-2 border-primary/20 dark:border-white/10 shadow-lg overflow-hidden transition-transform">
                            {renderHeaderAvatar()}
                        </div>
                        <div className="absolute bottom-0.5 right-0.5 w-3 h-3 md:w-4 md:h-4 bg-emerald-500 border-2 border-white dark:border-black rounded-full shadow-sm"></div>
                    </motion.div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg md:text-xl font-black text-gray-900 dark:text-gray-100 leading-tight mb-0.5 tracking-tight">
                            {t(greetingKey)}, <span className="text-primary dark:text-orange-500">{currentUser?.displayName?.split(' ')[0] || 'Learner'}</span>
                        </h1>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                            <TrendingUp size={12} /> আপনার আজকের প্রগতি
                        </p>
                    </div>
                </div>
                <motion.button 
                    whileTap={{ scale: 0.9, rotate: 15 }}
                    onClick={() => setShowActionSheet(true)}
                    className="p-2.5 bg-gray-50 dark:bg-white/5 rounded-2xl text-gray-400 dark:text-zinc-500 hover:text-primary transition-colors border border-gray-100 dark:border-white/5"
                >
                    <MoreHorizontal size={22} />
                </motion.button>
            </div>

            {/* Segmented Control */}
            <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-2xl mb-4 md:mb-6 relative">
                <motion.div 
                    layoutId="tabIndicator"
                    className="absolute inset-y-1 bg-white dark:bg-gray-700/50 rounded-xl shadow-sm z-0 border border-transparent dark:border-white/5"
                    style={{ width: 'calc(50% - 4px)', left: activeTab === 'today' ? '4px' : 'calc(50%)' }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
                <button 
                    onClick={() => setActiveTab('today')}
                    className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider relative z-10 transition-colors ${activeTab === 'today' ? 'text-primary dark:text-orange-400' : 'text-gray-400 dark:text-zinc-500'}`}
                >
                    আজকের আপডেট
                </button>
                <button 
                    onClick={() => setActiveTab('week')}
                    className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider relative z-10 transition-colors ${activeTab === 'week' ? 'text-primary dark:text-orange-400' : 'text-gray-400 dark:text-zinc-500'}`}
                >
                    সাপ্তাহিক রিপোর্ট
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'today' ? (
                    <motion.div 
                        key="today"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="grid grid-cols-3 gap-3 md:gap-4"
                    >
                        <motion.div 
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/leaderboard')} 
                            className="bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-white/5 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all shadow-sm hover:shadow-md"
                        >
                            <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-amber-500">
                                <StatIcon 
                                    src="/icons/ranking.svg" 
                                    className="w-full h-full drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" 
                                />
                            </div>
                            <p className="text-[9px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">র‍্যাঙ্ক</p>
                            <p className="text-sm md:text-lg font-black text-gray-900 dark:text-gray-100">#{toBengaliNumber(rank) || '-'}</p>
                        </motion.div>
                        
                        <motion.div 
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-white/5 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all shadow-sm hover:shadow-md"
                        >
                            <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-orange-500">
                                <StatIcon 
                                    src="/icons/points.svg" 
                                    className="w-full h-full drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" 
                                />
                            </div>
                            <p className="text-[9px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">পয়েন্টস</p>
                            <p className="text-sm md:text-lg font-black text-gray-900 dark:text-gray-100">{toBengaliNumber(stats?.points) || '০'}</p>
                        </motion.div>
 
                        <motion.div 
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowStreakModal(true)} 
                            className="bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-white/5 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all shadow-sm hover:shadow-md"
                        >
                            <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-red-500">
                                <StatIcon 
                                    src="/icons/streak.svg" 
                                    className="w-full h-full drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]" 
                                />
                            </div>
                            <p className="text-[9px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">স্ট্রিক</p>
                            <p className="text-sm md:text-lg font-black text-gray-900 dark:text-gray-100">{toBengaliNumber(currentStreak)}</p>
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="week"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="bg-gray-50 dark:bg-zinc-900 rounded-2xl p-5 border border-gray-100 dark:border-white/5 flex items-center justify-between"
                    >
                        <div className="flex flex-col gap-1.5">
                            <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">সাপ্তাহিক লক্ষ্য</p>
                            <h4 className="text-xl font-black text-gray-900 dark:text-white">৮৫% সম্পন্ন</h4>
                            <p className="text-[11px] text-emerald-500 font-bold flex items-center gap-1.5">
                                <TrendingUp size={14} /> গত সপ্তাহের চেয়ে ১২% বেশি
                            </p>
                        </div>
                        <div className="relative w-20 h-20">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="40"
                                    cy="40"
                                    r="34"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    className="text-gray-200 dark:text-zinc-800"
                                />
                                <motion.circle
                                    cx="40"
                                    cy="40"
                                    r="34"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeDasharray={213.6}
                                    initial={{ strokeDashoffset: 213.6 }}
                                    animate={{ strokeDashoffset: 213.6 * (1 - 0.85) }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="text-primary"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-gray-900 dark:text-white">
                                85%
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Development Notice Banner */}
        <AnimatePresence>
          {showDevNotice && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
                className="w-full bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-500/10 dark:to-blue-500/5 rounded-3xl p-5 md:p-6 border border-indigo-100 dark:border-indigo-500/20 flex items-start gap-4 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                
                <button 
                  onClick={() => {
                    setShowDevNotice(false);
                    localStorage.setItem('hide_dev_notice', 'true');
                  }}
                  className="absolute top-4 right-4 p-1.5 text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors z-10"
                >
                  <X size={18} />
                </button>

                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400">
                    <Sparkles size={24} />
                </div>
                <div className="space-y-1 pr-6">
                    <h3 className="text-base md:text-lg font-black text-indigo-900 dark:text-indigo-100 font-tiro">আমরা এখনো গড়ে উঠছি!</h3>
                    <p className="text-xs md:text-sm text-indigo-700/80 dark:text-indigo-300/70 font-medium leading-relaxed font-tiro">
                        আমাদের প্ল্যাটফর্মটি বর্তমানে ডেভেলপমেন্ট (Beta) পর্যায়ে রয়েছে। সব ফিচার এখনও পরিপূর্ণ নয়, তবে আমরা দিনরাত কাজ করছি আপনার পড়াশোনাকে আরও সহজ করতে। খুব শীঘ্রই এটি আপনার জন্য একটি পূর্ণাঙ্গ ডিজিটাল টিউটর হয়ে উঠবে। আমাদের সাথে থাকার জন্য ধন্যবাদ!
                    </p>
                </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. Main Menu Grid - Chorcha Style UI (Unified Sizes) */}
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 border border-gray-100 dark:border-white/5 shadow-sm">
            <div className="flex flex-wrap justify-center gap-y-10 gap-x-4 md:gap-x-12">
                {/* Question Bank */}
                <div 
                    onClick={() => navigate('/qbank')}
                    className="flex flex-col items-center gap-2 cursor-pointer group active-scale transition-all w-[70px] md:w-[100px]"
                >
                    <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                        <img src="/icons/qbank_bn.png" alt="QBank" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <span className="font-bold text-gray-800 dark:text-gray-200 text-[11px] md:text-sm text-center leading-tight">প্রশ্ন ব্যাংক</span>
                </div>

                {/* Rapid Fire */}
                <div 
                    onClick={() => navigate('/quiz', { state: { mode: 'RAPID_FIRE' } })}
                    className="flex flex-col items-center gap-2 cursor-pointer group active-scale transition-all w-[70px] md:w-[100px]"
                >
                    <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                        <img src="/icons/flash.png" alt="Rapid Fire" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <span className="font-bold text-gray-800 dark:text-gray-200 text-[11px] md:text-sm text-center leading-tight">র‍্যাপিড ফায়ার</span>
                </div>

                {/* Model Test (Custom Quiz) */}
                <div 
                    onClick={() => navigate('/quiz')}
                    className="flex flex-col items-center gap-2 cursor-pointer group active-scale transition-all w-[70px] md:w-[100px]"
                >
                    <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                        <div 
                            className="w-full h-full bg-gradient-to-br from-amber-400 via-orange-500 to-primary" 
                            style={{ 
                                maskImage: 'url(/icons/customize.svg)', 
                                WebkitMaskImage: 'url(/icons/customize.svg)', 
                                maskSize: 'contain', 
                                WebkitMaskSize: 'contain', 
                                maskRepeat: 'no-repeat', 
                                WebkitMaskRepeat: 'no-repeat', 
                                maskPosition: 'center', 
                                WebkitMaskPosition: 'center' 
                            }} 
                        />
                    </div>
                    <span className="font-bold text-gray-800 dark:text-gray-200 text-[11px] md:text-sm text-center leading-tight">মডেল টেস্ট</span>
                </div>

                {/* Battle */}
                <div 
                    onClick={() => navigate('/battle')}
                    className="flex flex-col items-center gap-2 cursor-pointer group active-scale transition-all w-[70px] md:w-[100px]"
                >
                    <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                        <img src="/icons/battle.png" alt="Battle" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <span className="font-bold text-gray-800 dark:text-gray-200 text-[11px] md:text-sm text-center leading-tight">ব্যাটল</span>
                </div>

                {/* Saved */}
                <div 
                    onClick={() => navigate('/saved-questions')}
                    className="flex flex-col items-center gap-2 cursor-pointer group active-scale transition-all w-[70px] md:w-[100px]"
                >
                    <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                        <div 
                            className="w-full h-full bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600" 
                            style={{ 
                                maskImage: 'url(/icons/save.png)', 
                                WebkitMaskImage: 'url(/icons/save.png)', 
                                maskSize: 'contain', 
                                WebkitMaskSize: 'contain', 
                                maskRepeat: 'no-repeat', 
                                WebkitMaskRepeat: 'no-repeat', 
                                maskPosition: 'center', 
                                WebkitMaskPosition: 'center' 
                            }} 
                        />
                    </div>
                    <span className="font-bold text-gray-800 dark:text-gray-200 text-[11px] md:text-sm text-center leading-tight">সেভ্ড</span>
                </div>

                {/* Wrong Questions */}
                <div 
                    onClick={() => navigate('/wrong-questions')}
                    className="flex flex-col items-center gap-2 cursor-pointer group active-scale transition-all w-[70px] md:w-[100px]"
                >
                    <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                        <div 
                            className="w-full h-full bg-gradient-to-br from-rose-500 via-red-600 to-orange-700" 
                            style={{ 
                                maskImage: 'url(/icons/wrong.svg)', 
                                WebkitMaskImage: 'url(/icons/wrong.svg)', 
                                maskSize: 'contain', 
                                WebkitMaskSize: 'contain', 
                                maskRepeat: 'no-repeat', 
                                WebkitMaskRepeat: 'no-repeat', 
                                maskPosition: 'center', 
                                WebkitMaskPosition: 'center' 
                            }} 
                        />
                    </div>
                    <span className="font-bold text-gray-800 dark:text-gray-200 text-[11px] md:text-sm text-center leading-tight">ভুল প্রশ্ন</span>
                </div>
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
                        className={`min-w-[90px] md:min-w-[110px] bg-white dark:bg-[#121212] p-3 md:p-5 rounded-3xl border ${sub.border} dark:border-white/[0.03] flex flex-col items-center gap-3 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden`}
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
            className="rounded-[2.5rem] relative overflow-hidden group cursor-pointer shadow-2xl shadow-orange-900/10 hover:shadow-orange-500/10 active-scale transition-all border border-gray-100 dark:border-white/5" 
            onClick={() => navigate('/leaderboard')}
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 via-orange-950 to-gray-900 dark:from-gray-900 dark:via-zinc-900 dark:to-gray-900 p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/20 rounded-full blur-[80px] -mr-10 -mt-10 animate-pulse-slow"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[60px] -ml-8 -mb-8"></div>
                
                <div className="flex justify-between items-center relative z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-1.5">
                            <Trophy size={24} className="text-yellow-400 fill-yellow-400 animate-bounce-slow" />
                            <h3 className="text-xl md:text-3xl font-black text-white tracking-tight uppercase drop-shadow-md">লিডারবোর্ড</h3>
                        </div>
                        <p className="text-[10px] md:text-xs text-orange-200 font-bold uppercase tracking-[0.2em] opacity-80">সেরা ৫ পারফর্মার</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">#{toBengaliNumber(rank) || '-'}</div>
                        <div className="text-[10px] text-orange-200 font-bold uppercase tracking-widest opacity-80">আপনার র‍্যাঙ্ক</div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-zinc-900 p-4 md:p-6 space-y-3">
                {topLearners.length === 0 ? (
                    <div className="text-center text-gray-400 dark:text-zinc-500 text-xs py-8 font-medium">No data available</div>
                ) : (
                    topLearners.map((u, idx) => {
                        const isMe = currentUser?.uid === u.uid;
                        let rankBadge = "bg-gray-100 text-gray-500 border-gray-200 dark:bg-white/5 dark:text-zinc-400 dark:border-white/5";
                        if (idx === 0) rankBadge = "bg-yellow-100 text-yellow-700 border-yellow-200 shadow-sm shadow-yellow-200/50 dark:bg-yellow-500/10 dark:text-yellow-500 dark:border-yellow-500/20";
                        else if (idx === 1) rankBadge = "bg-gray-200 text-gray-700 border-gray-300 shadow-sm dark:bg-zinc-500/10 dark:text-zinc-300 dark:border-white/10";
                        else if (idx === 2) rankBadge = "bg-orange-100 text-orange-700 border-orange-200 shadow-sm shadow-orange-200/50 dark:bg-orange-500/10 dark:text-orange-500 dark:border-orange-500/20";

                        return (
                            <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${isMe ? 'bg-orange-50/80 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20 shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-white/5 border-transparent hover:border-gray-100 dark:hover:border-white/5'}`}>
                                <div className="flex items-center gap-4 md:gap-5">
                                    <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-xs md:text-sm font-black border ${rankBadge}`}>
                                        {toBengaliNumber(idx + 1)}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            {(u.photoURL && u.photoURL !== 'false') ? (
                                                <img src={u.photoURL} alt="" className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-100 dark:bg-zinc-800 object-cover border-2 border-white dark:border-white/10 shadow-sm" />
                                            ) : (
                                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold border-2 border-white dark:border-white/10 shadow-sm">
                                                    {u.displayName?.charAt(0) || 'U'}
                                                </div>
                                            )}
                                            {idx === 0 && <div className="absolute -top-2 -right-2 text-yellow-500 drop-shadow-sm"><Crown size={16} fill="currentColor"/></div>}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-sm md:text-base font-bold ${isMe ? 'text-orange-600 dark:text-orange-400' : 'text-gray-800 dark:text-gray-200'}`}>{isMe ? 'আপনি' : u.displayName}</span>
                                            <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium truncate max-w-[120px] uppercase tracking-wide">{u.college || 'Student'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-base md:text-lg font-black text-gray-900 dark:text-gray-100 block tabular-nums tracking-tight">{toBengaliNumber(u.points)}</span>
                                    <span className="text-[9px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">পয়েন্ট</span>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>

      </div>

      {/* Streak Modal - Reverted Calendar + Video Fire Animation */}
      <AnimatePresence>
        {showStreakModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#1a0f0a] w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden border border-orange-900/20"
                >
                    {/* Background Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-600/10 rounded-full blur-[100px] pointer-events-none"></div>
                    
                    <div className="absolute top-0 right-0 p-6 z-20">
                        <button onClick={() => setShowStreakModal(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="text-center mt-4 mb-10 relative z-10">
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", damping: 15, stiffness: 100, delay: 0.2 }}
                            className="w-40 h-40 mx-auto mb-6 flex items-center justify-center text-orange-500 relative"
                        >
                            <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
                            <StatIcon 
                                src="/icons/streak.svg" 
                                className="w-full h-full drop-shadow-[0_0_30px_rgba(249,115,22,0.8)] relative z-10" 
                            />
                        </motion.div>

                        <AnimatePresence mode="wait">
                            {!isCheckedIn ? (
                                <motion.div
                                    key="unchecked-text"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-2"
                                >
                                    <h2 className="text-3xl font-black text-white leading-tight tracking-tight">Keep the fire alive!</h2>
                                    <p className="text-lg font-bold text-orange-200/80">আজকের প্র্যাকটিস সম্পন্ন করে স্ট্রিক ধরে রাখুন</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="checked-text"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-1"
                                >
                                    <h2 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-orange-400 to-red-600 tracking-tighter drop-shadow-2xl">{toBengaliNumber(stats?.currentStreak)}</h2>
                                    <p className="text-2xl font-black text-orange-100 uppercase tracking-widest">দিনের স্ট্রিক</p>
                                    <div className="flex items-center justify-center gap-2 mt-2">
                                        <Sparkles size={16} className="text-yellow-400" />
                                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">You're on fire!</span>
                                        <Sparkles size={16} className="text-yellow-400" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Reverted Calendar Design */}
                    <div className="bg-gray-800/30 rounded-3xl p-5 border border-white/5 backdrop-blur-sm mb-8">
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
                                                ? 'border-dashed border-orange-500/50 text-orange-500/50 bg-orange-500/5' 
                                                : 'border-gray-800 bg-gray-900/50 text-gray-600'
                                        }`}>
                                            {isActive ? (
                                                <CheckCircle size={18} fill="currentColor" className="text-white"/>
                                            ) : day.isToday ? (
                                                <Circle size={18} className="text-orange-500/40 border-dashed" strokeWidth={2.5} />
                                            ) : (
                                                <div className="w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    
                    <div className="relative z-10">
                        {!isCheckedIn ? (
                            <motion.button 
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setShowStreakModal(false);
                                    navigate('/quiz');
                                }}
                                className="w-full py-5 bg-orange-500 text-white rounded-3xl font-black text-lg transition-all duration-500 shadow-xl shadow-orange-600/20 hover:bg-orange-600 flex items-center justify-center gap-2"
                            >
                                প্র্যাকটিস শুরু করো <Flame size={20} />
                            </motion.button>
                        ) : (
                            <motion.button 
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowStreakModal(false)}
                                className="w-full py-5 bg-white/5 text-orange-200 rounded-3xl font-black text-lg transition-all duration-500 border border-white/10 hover:bg-white/10"
                            >
                                অসাধারণ! বন্ধ করো
                            </motion.button>
                        )}
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Action Sheet (Bottom Sheet) */}
      <AnimatePresence>
        {showActionSheet && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowActionSheet(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) setShowActionSheet(false);
              }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-[2.5rem] z-[110] p-6 pb-[calc(2.5rem+env(safe-area-inset-bottom))] border-t border-gray-100 dark:border-white/5 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full mx-auto mb-6" />
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 text-center">কুইক মেনু</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Settings, label: 'সেটিংস', path: '/settings' },
                  { icon: PieChart, label: 'প্ল্যানার', path: '/planner' },
                  { icon: Target, label: 'লক্ষ্য', path: '/profile' },
                  { icon: Archive, label: 'আর্কাইভ', path: '/qbank' },
                  { icon: Trophy, label: 'অ্যাচিভমেন্ট', path: '/leaderboard' },
                  { icon: Brain, label: 'এআই টিউটর', path: '/bot' },
                ].map((item, i) => (
                  <motion.button 
                    key={i}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { 
                      setShowActionSheet(false); 
                      // Small delay to allow ActionSheet exit animation to start
                      // and prevent race conditions with the main page transition
                      setTimeout(() => navigate(item.path), 50);
                    }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-14 h-14 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-white/5">
                      <item.icon size={24} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomeDashboard;
