
import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, CheckCircle, Clock, Trophy, Target, 
  FileCheck, Swords, Bot, Bookmark, Play, 
  Calendar, Crown, Star, Medal, Lock, Timer
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserStatsAPI, claimQuestAPI } from '../services/api';
import { Quest } from '../types';
import { useToast } from './Toast';
import Confetti from './Confetti';
import { MILESTONE_QUESTS } from '../services/questData';

interface DailyChallengePageProps {
  openBot: () => void;
}

const DailyChallengePage: React.FC<DailyChallengePageProps> = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  // State
  const [dailyQuests, setDailyQuests] = useState<Quest[]>([]);
  const [weeklyQuests, setWeeklyQuests] = useState<Quest[]>([]);
  const [lifetimeQuests, setLifetimeQuests] = useState<Quest[]>(MILESTONE_QUESTS);
  
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'DAILY' | 'WEEKLY' | 'LIFETIME'>('DAILY');
  const [timeLeft, setTimeLeft] = useState('');

  // Countdown Logic
  useEffect(() => {
      const calculateTimeLeft = () => {
          const now = new Date();
          const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          const diff = tomorrow.getTime() - now.getTime();
          
          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((diff / (1000 * 60)) % 60);
          const seconds = Math.floor((diff / 1000) % 60);
          
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      };
      
      calculateTimeLeft();
      const timer = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(timer);
  }, []);

  // Load Data
  const loadData = async () => {
    if (currentUser) {
      try {
        const stats = await fetchUserStatsAPI(currentUser.uid);
        if (stats) {
            if (stats.quests) setDailyQuests(stats.quests);
            if (stats.weeklyQuests) setWeeklyQuests(stats.weeklyQuests);
            
            // Merge User Progress with Static Lifetime Quests
            const updatedLifetime = MILESTONE_QUESTS.map(q => {
                let currentProgress = 0;
                const isClaimed = false; // Mock, in real app check against stats.claimedLifetimeIds
                
                if (q.type === 'EXAM_COMPLETE') currentProgress = stats.totalExams || 0;
                else if (q.type === 'HIGH_SCORE') currentProgress = stats.totalCorrect > 0 ? Math.floor(stats.totalCorrect / 10) : 0; 
                else if (q.type === 'EARN_POINTS') currentProgress = stats.points || 0;
                
                const isCompleted = currentProgress >= q.target;
                
                return {
                    ...q,
                    progress: currentProgress,
                    completed: isCompleted,
                    claimed: isClaimed 
                };
            });
            setLifetimeQuests(updatedLifetime);
        }
      } catch (e) {
        logger.error("Failed to load quests", e);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleClaim = async (questId: string, category: 'DAILY' | 'WEEKLY' | 'LIFETIME') => {
      if (!currentUser) return;
      setClaimingId(questId);
      try {
          if (category === 'LIFETIME') {
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 3000);
              showToast("Milestone recorded! (Demo)", "success");
              setLifetimeQuests(prev => prev.map(q => q.id === questId ? { ...q, claimed: true } : q));
          } else {
              const res = await claimQuestAPI(currentUser.uid, questId, category);
              if (res.success) {
                  setShowConfetti(true);
                  setTimeout(() => setShowConfetti(false), 3000);
                  showToast(`অভিনন্দন! পয়েন্ট অর্জিত হয়েছে!`, "success");
                  loadData(); 
              }
          }
      } catch (_e) {
          showToast("ক্লেইম করতে সমস্যা হয়েছে", "error");
      } finally {
          setClaimingId(null);
      }
  };

  const handleStart = (quest: any) => { 
      if (quest.type === 'ASK_AI') navigate('/bot');
      else if (quest.type === 'EXAM_COMPLETE') navigate('/quiz');
      else if (quest.type === 'PLAY_BATTLE') navigate('/battle');
      else if (quest.type === 'STUDY_TIME') navigate('/history');
      else navigate('/quiz');
  };

  const getIcon = (iconName?: string) => {
      const size = 20;
      switch(iconName) {
          case 'Target': return <Target size={size} className="text-red-500" />;
          case 'FileCheck': return <FileCheck size={size} className="text-blue-500" />;
          case 'Clock': return <Clock size={size} className="text-purple-500" />;
          case 'Swords': return <Swords size={size} className="text-orange-700 dark:text-orange-400" />;
          case 'Bot': return <Bot size={size} className="text-green-500" />;
          case 'Bookmark': return <Bookmark size={size} className="text-yellow-500" />;
          case 'Crown': return <Crown size={size} className="text-amber-500" />;
          case 'Star': return <Star size={size} className="text-yellow-400" />;
          default: return <Trophy size={size} className="text-primary" />;
      }
  };

  const getDifficultyColor = (diff?: string) => {
      switch(diff) {
          case 'NOVICE': return 'border-l-4 border-l-gray-400';
          case 'APPRENTICE': return 'border-l-4 border-l-green-500';
          case 'ELITE': return 'border-l-4 border-l-blue-500';
          case 'MASTER': return 'border-l-4 border-l-purple-500';
          case 'LEGEND': return 'border-l-4 border-l-orange-500 bg-orange-50/10';
          default: return '';
      }
  };

  const questsToRender = activeTab === 'DAILY' ? dailyQuests : activeTab === 'WEEKLY' ? weeklyQuests : lifetimeQuests;

  // Quest List Skeleton
  const QuestSkeleton = () => (
    <div className="space-y-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    <div className="flex-1">
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                        <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
            </div>
        ))}
    </div>
  );

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-black p-4 md:p-8 transition-colors">
      {showConfetti && <Confetti />}
      
      <div className="max-w-3xl mx-auto pb-20">
         
         <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
                <Target className="text-red-500"/> চ্যালেঞ্জ জোন
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto mb-4">
                নিয়মিত চ্যালেঞ্জ কমপ্লিট করে ব্যাজ ও পয়েন্ট জিতো।
            </p>
            {activeTab === 'DAILY' && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold font-mono">
                    <Timer size={14}/> রিসেট হতে বাকি: {timeLeft}
                </div>
            )}
         </div>

         {/* Tab Switcher */}
         <div className="flex bg-white dark:bg-zinc-900 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 mb-6 w-full overflow-x-auto no-scrollbar">
             <button 
                onClick={() => setActiveTab('DAILY')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'DAILY' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
             >
                 <Zap size={16}/> Daily
             </button>
             <button 
                onClick={() => setActiveTab('WEEKLY')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'WEEKLY' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
             >
                 <Calendar size={16}/> Weekly
             </button>
             <button 
                onClick={() => setActiveTab('LIFETIME')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'LIFETIME' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
             >
                 <Medal size={16}/> Achievements
             </button>
         </div>

         {loading ? (
             <QuestSkeleton />
         ) : questsToRender.length === 0 ? (
             <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                 <p className="text-gray-500">কোনো চ্যালেঞ্জ লোড করা যাচ্ছে না।</p>
             </div>
         ) : (
             <div className="space-y-4">
                 {questsToRender.map((quest) => {
                     const percent = Math.min(100, (quest.progress / quest.target) * 100);
                     const isReady = quest.completed && !quest.claimed;
                     const isCompleted = quest.claimed;
                     const diffColor = getDifficultyColor(quest.difficulty);

                     return (
                         <div key={quest.id} className={`bg-white dark:bg-zinc-900 p-4 rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md ${diffColor} ${isCompleted ? 'border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-black/30 opacity-70' : 'border-gray-200 dark:border-zinc-800'}`}>
                             <div className="flex items-center gap-4">
                                 
                                 {/* Icon */}
                                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 relative ${isCompleted ? 'bg-gray-100 dark:bg-gray-700 grayscale' : 'bg-gray-50 dark:bg-gray-700'}`}>
                                     {getIcon(quest.icon)}
                                     {isCompleted && (
                                         <div className="absolute inset-0 bg-white/50 dark:bg-black/50 rounded-xl flex items-center justify-center">
                                             <CheckCircle size={20} className="text-green-600"/>
                                         </div>
                                     )}
                                 </div>

                                 {/* Info */}
                                 <div className="flex-1 min-w-0">
                                     <div className="flex justify-between items-center mb-1">
                                         <div className="flex items-center gap-2">
                                            <h3 className={`text-sm md:text-base font-bold truncate ${isCompleted ? 'text-gray-500 dark:text-gray-500' : 'text-gray-800 dark:text-white'}`}>{quest.title}</h3>
                                            {/* Only show difficulty badge for lifetime */}
                                            {activeTab === 'LIFETIME' && (
                                                <span className="text-[9px] bg-gray-100 dark:bg-gray-700 text-gray-500 px-1.5 py-0.5 rounded">{quest.difficulty}</span>
                                            )}
                                         </div>
                                         <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isCompleted ? 'bg-gray-100 text-gray-500 dark:bg-gray-700' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                             {isCompleted ? 'Collected' : `+${quest.reward} Pts`}
                                         </span>
                                     </div>
                                     <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">{quest.description}</p>
                                     
                                     {/* Progress */}
                                     <div className="flex items-center gap-3">
                                         <div className="flex-1 bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                             <div className={`h-full rounded-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${percent}%` }}></div>
                                         </div>
                                         <span className="text-[12px] font-bold text-gray-400 whitespace-nowrap">{quest.progress >= quest.target ? quest.target : quest.progress}/{quest.target}</span>
                                     </div>
                                 </div>

                                 {/* Action */}
                                 <div className="shrink-0">
                                     {isReady ? (
                                         <button 
                                             onClick={() => handleClaim(quest.id, activeTab)}
                                             disabled={claimingId === quest.id}
                                             className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-green-200 dark:shadow-none animate-pulse flex items-center gap-1"
                                         >
                                             {claimingId === quest.id ? <Clock size={14} className="animate-spin"/> : <Gift size={14}/>} Claim
                                         </button>
                                     ) : !isCompleted && activeTab !== 'LIFETIME' ? (
                                         // Only show 'Start' button for daily/weekly, Lifetime is passive
                                         <button 
                                             onClick={() => handleStart(quest)}
                                             className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-primary hover:text-white dark:hover:bg-primary rounded-full transition-colors"
                                         >
                                             <Play size={14} fill="currentColor"/>
                                         </button>
                                     ) : isCompleted ? (
                                         null // Nothing for completed
                                     ) : (
                                         // Locked / In Progress state for Lifetime
                                         <div className="w-8 h-8 flex items-center justify-center text-gray-300 dark:text-gray-600">
                                             <Lock size={16} />
                                         </div>
                                     )}
                                 </div>
                             </div>
                         </div>
                     )
                 })}
             </div>
         )}
      </div>
    </div>
  );
};

// Helper for icon
const Gift = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect width="20" height="5" x="2" y="7"/><line x1="12" x2="12" y1="22" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>;

export default DailyChallengePage;
