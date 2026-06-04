
import React, { useState } from 'react';
import { Trophy, CheckCircle, Zap, Target, Bookmark, Swords, Bot, Clock, FileCheck } from 'lucide-react';
import { Quest } from '../types';
import { claimQuestAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import Confetti from './Confetti';

interface QuestWidgetProps {
  quests: Quest[];
  onQuestUpdate: () => void; // Callback to refresh data after claim
}

const QuestWidget: React.FC<QuestWidgetProps> = ({ quests, onQuestUpdate }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [showConfetti, setShowConfetti] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);

  const getIcon = (iconName?: string) => {
      switch(iconName) {
          case 'Target': return <Target size={18} className="text-red-500" />;
          case 'FileCheck': return <FileCheck size={18} className="text-orange-500" />;
          case 'Clock': return <Clock size={18} className="text-purple-500" />;
          case 'Swords': return <Swords size={18} className="text-orange-500" />;
          case 'Bot': return <Bot size={18} className="text-green-500" />;
          case 'Bookmark': return <Bookmark size={18} className="text-yellow-500" />;
          default: return <Trophy size={18} className="text-primary" />;
      }
  };

  const handleClaim = async (questId: string) => {
      if (!currentUser) return;
      setClaiming(questId);
      try {
          const res = await claimQuestAPI(currentUser.uid, questId);
          if (res.success) {
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 3000);
              showToast(`অভিনন্দন! ${res.points - (currentUser as any).points || 0} পয়েন্ট অর্জিত হয়েছে!`, "success");
              onQuestUpdate();
          }
      } catch (_e) {
          showToast("ক্লেইম করতে সমস্যা হয়েছে", "error");
      } finally {
          setClaiming(null);
      }
  };

  if (!quests || quests.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm mb-6 relative overflow-hidden">
        {showConfetti && <Confetti />}
        
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Zap size={20} className="text-yellow-500 fill-yellow-500"/> ডেইলি চ্যালেঞ্জ
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">প্রতিদিন রিসেট হয়</span>
        </div>

        <div className="space-y-3">
            {quests.map(quest => {
                const percent = Math.min(100, (quest.progress / quest.target) * 100);
                const isReady = quest.completed && !quest.claimed;
                
                return (
                    <div key={quest.id} className={`p-3 rounded-xl border transition-all ${quest.claimed ? 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-60' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary/30'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex gap-3">
                                <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-700`}>
                                    {getIcon(quest.icon)}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-800 dark:text-white">{quest.title}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{quest.description}</p>
                                </div>
                            </div>
                            
                            {quest.claimed ? (
                                <span className="text-green-500 text-xs font-bold flex items-center gap-1"><CheckCircle size={14}/> সম্পন্ন</span>
                            ) : isReady ? (
                                <button 
                                    onClick={() => handleClaim(quest.id)}
                                    disabled={claiming === quest.id}
                                    className="bg-primary hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg animate-pulse shadow-lg shadow-green-500/20"
                                >
                                    {claiming === quest.id ? 'Claiming...' : 'Claim Points'}
                                </button>
                            ) : (
                                <span className="text-xs font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded">+{quest.reward} Pts</span>
                            )}
                        </div>

                        {/* Progress Bar */}
                        {!quest.claimed && (
                            <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden mt-1">
                                <div 
                                    className="bg-primary h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${percent}%` }}
                                ></div>
                            </div>
                        )}
                        {!quest.claimed && (
                            <div className="text-right mt-1">
                                <span className="text-[12px] text-gray-400 font-bold">{quest.progress} / {quest.target}</span>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    </div>
  );
};

export default QuestWidget;
