import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, CheckCircle, Clock, Trophy, Target, ArrowRight, 
  FileCheck, Swords, Bot, Bookmark, Activity, Dna, Atom, 
  Beaker, Calculator, Database, Share2, AlertCircle, Play, 
  Calendar, Crown, Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserStatsAPI, claimQuestAPI } from '../services/api';
import { Quest } from '../types';
import { useToast } from './Toast';
import Confetti from './Confetti';

interface DailyChallengePageProps {
  openSynapse: () => void;
}

const DailyChallengePage: React.FC<DailyChallengePageProps> = ({ openSynapse }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [dailyQuests, setDailyQuests] = useState<Quest[]>([]);
  const [weeklyQuests, setWeeklyQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'DAILY' | 'WEEKLY'>('DAILY');

  const loadData = async () => {
    if (currentUser) {
      try {
        const stats = await fetchUserStatsAPI(currentUser.uid);
        if (stats) {
            if (stats.quests) setDailyQuests(stats.quests);
            if (stats.weeklyQuests) setWeeklyQuests(stats.weeklyQuests);
        }
      } catch (e) {
        console.error("Failed to load quests", e);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleClaim = async (questId: string, category: 'DAILY' | 'WEEKLY') => {
      if (!currentUser) return;
      setClaimingId(questId);
      try {
          const res = await claimQuestAPI(currentUser.uid, questId, category);
          if (res.success) {
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 3000);
              showToast(`অভিনন্দন! ${res.points - (currentUser as any).points || 0} পয়েন্ট অর্জিত হয়েছে!`, "success");
              loadData(); 
          }
      } catch (e) {
          showToast("ক্লেইম করতে সমস্যা হয়েছে", "error");
      } finally {
          setClaimingId(null);
      }
  };

  const handleStart = (quest: any) => { 
      if (quest.link === 'SYNAPSE') {
          openSynapse();
      } else if (quest.link === 'SHARE') {
          navigator.clipboard.writeText("Join Shikkha Shohayok: https://shikkha-shohayok.web.app");
          showToast("Link copied to clipboard!", "info");
      } else if (quest.link) {
          navigate(quest.link);
      }
  };

  const getIcon = (iconName?: string) => {
      const size = 20;
      switch(iconName) {
          case 'Target': return <Target size={size} className="text-red-500" />;
          case 'FileCheck': return <FileCheck size={size} className="text-blue-500" />;
          case 'Clock': return <Clock size={size} className="text-purple-500" />;
          case 'Swords': return <Swords size={size} className="text-orange-500" />;
          case 'Bot': return <Bot size={size} className="text-green-500" />;
          case 'Bookmark': return <Bookmark size={size} className="text-yellow-500" />;
          case 'Atom': return <Atom size={size} className="text-purple-600" />;
          case 'Beaker': return <Beaker size={size} className="text-orange-600" />;
          case 'Calculator': return <Calculator size={size} className="text-blue-600" />;
          case 'Dna': return <Dna size={size} className="text-green-600" />;
          case 'Crown': return <Crown size={size} className="text-amber-500" />;
          case 'Star': return <Star size={size} className="text-yellow-400" />;
          default: return <Trophy size={size} className="text-primary" />;
      }
  };

  const questsToRender = activeTab === 'DAILY' ? dailyQuests : weeklyQuests;

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors">
      {showConfetti && <Confetti />}
      
      <div className="max-w-3xl mx-auto pb-20">
         
         <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
                <Target className="text-red-500"/> চ্যালেঞ্জ জোন
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
                নিয়মিত চ্যালেঞ্জ কমপ্লিট করে পয়েন্ট জিতো এবং নিজেকে প্রস্তুত করো।
            </p>
         </div>

         {/* Tab Switcher */}
         <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 w-full max-w-sm mx-auto">
             <button 
                onClick={() => setActiveTab('DAILY')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'DAILY' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
             >
                 <Zap size={16}/> Daily
             </button>
             <button 
                onClick={() => setActiveTab('WEEKLY')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'WEEKLY' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
             >
                 <Calendar size={16}/> Weekly
             </button>
         </div>

         {loading ? (
             <div className="flex justify-center py-20">
                 <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
             </div>
         ) : questsToRender.length === 0 ? (
             <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
                 <p className="text-gray-500">কোনো চ্যালেঞ্জ লোড করা যাচ্ছে না।</p>
             </div>
         ) : (
             <div className="space-y-4">
                 {questsToRender.map((quest) => {
                     const percent = Math.min(100, (quest.progress / quest.target) * 100);
                     const isReady = quest.completed && !quest.claimed;
                     const isCompleted = quest.claimed;

                     return (
                         <div key={quest.id} className={`bg-white dark:bg-gray-800 p-4 rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md ${isCompleted ? 'border-green-200 dark:border-green-900/50 bg-green-50/20 opacity-80' : 'border-gray-200 dark:border-gray-700'}`}>
                             <div className="flex items-center gap-4">
                                 
                                 {/* Icon */}
                                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isCompleted ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                     {getIcon(quest.icon)}
                                 </div>

                                 {/* Info */}
                                 <div className="flex-1 min-w-0">
                                     <div className="flex justify-between items-center mb-1">
                                         <h3 className={`text-sm md:text-base font-bold truncate ${isCompleted ? 'text-green-700 dark:text-green-400' : 'text-gray-800 dark:text-white'}`}>{quest.title}</h3>
                                         <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isCompleted ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                             {isCompleted ? 'Done' : `+${quest.reward} Pts`}
                                         </span>
                                     </div>
                                     <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">{quest.description}</p>
                                     
                                     {/* Progress */}
                                     {!isCompleted && (
                                         <div className="flex items-center gap-3">
                                             <div className="flex-1 bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                                 <div className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${percent}%` }}></div>
                                             </div>
                                             <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">{quest.progress}/{quest.target}</span>
                                         </div>
                                     )}
                                 </div>

                                 {/* Action */}
                                 <div className="shrink-0">
                                     {isReady ? (
                                         <button 
                                             onClick={() => handleClaim(quest.id, activeTab)}
                                             disabled={claimingId === quest.id}
                                             className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-green-200 dark:shadow-none animate-pulse"
                                         >
                                             {claimingId === quest.id ? '...' : 'Claim'}
                                         </button>
                                     ) : !isCompleted ? (
                                         <button 
                                             onClick={() => handleStart(quest)}
                                             className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-primary hover:text-white dark:hover:bg-primary rounded-full transition-colors"
                                         >
                                             <Play size={14} fill="currentColor"/>
                                         </button>
                                     ) : (
                                         <div className="w-8 h-8 flex items-center justify-center bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full">
                                             <CheckCircle size={16} />
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

export default DailyChallengePage;