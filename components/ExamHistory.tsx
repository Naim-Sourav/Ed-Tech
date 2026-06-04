import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import { deleteExamResultAPI } from '../services/api';
import { 
  Trash2, Loader2, FileQuestion
} from 'lucide-react';
import SavedQuestions from './SavedQuestions';
import WrongQuestions from './WrongQuestions';

const ExamHistory: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  // Tab configuration
  const [activeTab, setActiveTab] = useState<'EXAMS' | 'SAVED' | 'WRONG'>('SAVED');

  // Exam attempts state
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);
  const [deletingAttemptId, setDeletingAttemptId] = useState<string | null>(null);

  // Load past exams (attempts)
  useEffect(() => {
    if (currentUser) {
      setLoadingAttempts(true);
      const localAttemptsKey = `porikkhangon_attempts_${currentUser.uid}`;
      const localAttemptsRaw = localStorage.getItem(localAttemptsKey);
      const localAttempts = localAttemptsRaw ? JSON.parse(localAttemptsRaw) : [];
      const sortedAttempts = localAttempts.sort((a: any, b: any) => {
        return (b.timestamp || 0) - (a.timestamp || 0);
      });
      setAttempts(sortedAttempts);
      setLoadingAttempts(false);
    } else {
      setLoadingAttempts(false);
    }
  }, [currentUser]);

  const handleDeleteAttempt = async (examId: string) => {
    if (!currentUser) return;
    if (!window.confirm("আপনি কি নিশ্চিত যে এই পরীক্ষাটি আপনার ইতিহাস থেকে মুছে ফেলতে চান?")) {
      return;
    }
    
    setDeletingAttemptId(examId);
    try {
      await deleteExamResultAPI(currentUser.uid, examId);
      
      const localAttemptsKey = `porikkhangon_attempts_${currentUser.uid}`;
      const localAttemptsRaw = localStorage.getItem(localAttemptsKey);
      const localAttempts = localAttemptsRaw ? JSON.parse(localAttemptsRaw) : [];
      const updatedAttempts = localAttempts.filter((a: any) => a.examId !== examId);
      localStorage.setItem(localAttemptsKey, JSON.stringify(updatedAttempts));
      
      setAttempts(updatedAttempts.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0)));
      showToast("পরীক্ষাটি ইতিহাস থেকে মুছে ফেলা হয়েছে", "success");
    } catch (e) {
      console.error(e);
      showToast("মুছে ফেলা সম্ভব হয়নি", "error");
    } finally {
      setDeletingAttemptId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-black text-slate-900 dark:text-zinc-100 pb-24 md:pb-6 font-sans">
      {/* Sticky, Sleek and Clean Top Tab Bar inspired by Chorca */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-gray-150 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto flex w-full">
          <button
            onClick={() => setActiveTab('SAVED')}
            className={`flex-1 py-4 text-center text-sm font-bold relative transition-colors ${
              activeTab === 'SAVED' 
                ? 'text-primary dark:text-orange-400 font-extrabold' 
                : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
            }`}
          >
            সেভ্ড প্রশ্ন
            {activeTab === 'SAVED' && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary dark:bg-orange-500"
                transition={{ type: 'spring', damping: 25, stiffness: 380 }}
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('WRONG')}
            className={`flex-1 py-4 text-center text-sm font-bold relative transition-colors ${
              activeTab === 'WRONG' 
                ? 'text-primary dark:text-orange-400' 
                : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
            }`}
          >
            পূর্বের ভুল
            {activeTab === 'WRONG' && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary dark:bg-orange-500"
                transition={{ type: 'spring', damping: 25, stiffness: 380 }}
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('EXAMS')}
            className={`flex-1 py-4 text-center text-sm font-bold relative transition-colors ${
              activeTab === 'EXAMS' 
                ? 'text-primary dark:text-orange-400' 
                : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
            }`}
          >
            পরীক্ষা
            {activeTab === 'EXAMS' && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary dark:bg-orange-500"
                transition={{ type: 'spring', damping: 25, stiffness: 380 }}
              />
            )}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'EXAMS' && (
              <motion.div
                key="exams-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                {loadingAttempts ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Loader2 size={32} className="animate-spin text-primary mb-3" />
                    <p className="text-xs font-semibold">ফলাফল লোড করা হচ্ছে...</p>
                  </div>
                ) : attempts.length === 0 ? (
                  <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-gray-150 dark:border-zinc-800 shadow-sm">
                    <div className="w-16 h-16 bg-orange-50 dark:bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                      <FileQuestion size={32} className="text-orange-500" />
                    </div>
                    <p className="text-gray-900 dark:text-white font-bold text-base mb-1">কোনো পরীক্ষার রেকর্ড নেই</p>
                    <p className="text-gray-400 text-xs max-w-xs mx-auto leading-relaxed">আপনি এখনও কোনো পরীক্ষায় অংশ নেননি। পরীক্ষা দেওয়ার পর আপনার সকল ফলাফলের বিস্তারিত বিবরণ এখানে দেখতে পাবেন।</p>
                    <div className="mt-6">
                      <button
                        onClick={() => navigate('/exams')}
                        className="px-6 py-3 bg-gradient-to-r from-primary to-orange-500 text-white font-bold rounded-xl shadow-md hover:scale-102 active:scale-98 transition-all text-xs"
                      >
                        পরীক্ষা দেওয়া শুরু করুন
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {attempts.map((attempt) => {
                      const totalQ = attempt.totalQuestions || 20;
                      const correct = attempt.correct || 0;
                      const percent = Math.min(100, Math.round((correct / totalQ) * 100));
                      const percentClamped = Math.max(8, Math.min(92, percent));

                      const subjectName = attempt.subject || attempt.config?.subject || 'সাধারণ';
                      const paperName = attempt.config?.paper || (attempt.config?.title?.includes('1st') || attempt.examId?.includes('1st') ? '১ম পত্র' : attempt.config?.title?.includes('2nd') || attempt.examId?.includes('2nd') ? '২য় পত্র' : null);
                      const chapterName = attempt.config?.chapter || null;
                      const examTitle = attempt.config?.title || (attempt.examId?.replace(/_/g, ' ') || 'নামহীন পরীক্ষা');

                      const examDate = attempt.timestamp 
                        ? new Date(attempt.timestamp).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })
                        : '-';

                      return (
                        <motion.div 
                          key={attempt.examId}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-gray-150/80 dark:border-zinc-800 shadow-sm relative overflow-hidden"
                        >
                          {/* Top row */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="space-y-1">
                              <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                {subjectName}
                              </h3>
                              {paperName && (
                                <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400">
                                  {paperName}
                                </p>
                              )}
                              {chapterName ? (
                                <p className="text-xs font-medium text-gray-400 dark:text-zinc-500">
                                  {chapterName}
                                </p>
                              ) : (
                                examTitle !== subjectName && (
                                  <p className="text-xs font-medium text-gray-400 dark:text-zinc-500">
                                    {examTitle}
                                  </p>
                                )
                              )}
                            </div>
                            <span className="text-xs text-gray-400 dark:text-zinc-500 font-bold whitespace-nowrap">
                              {examDate}
                            </span>
                          </div>

                          {/* Progress slider bar */}
                          <div className="relative pt-4 pb-5 my-2">
                            <div className="h-1.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full relative">
                              <div 
                                className="h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-300" 
                                style={{ width: `${percent}%` }}
                              />
                              <div 
                                className="absolute top-1/2 flex items-center justify-center bg-white dark:bg-zinc-950 border-2 border-emerald-500 dark:border-emerald-400 text-[10px] font-bold tracking-tight text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full shadow-sm select-none"
                                style={{ left: `${percentClamped}%`, transform: 'translate(-50%, -50%)' }}
                              >
                                {correct}/{totalQ}
                              </div>
                            </div>
                          </div>

                          {/* Botton Controls */}
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 dark:border-zinc-800/30">
                            <div className="flex items-center gap-1.5">
                              <span className="inline-block px-2.5 py-1 bg-gray-100 dark:bg-zinc-800 text-[10px] font-bold text-gray-400 dark:text-zinc-500 rounded-lg">
                                {attempt.config?.examType || 'HSC'}
                              </span>
                              {attempt.config?.duration && (
                                <span className="inline-block px-2.5 py-1 bg-gray-100 dark:bg-zinc-800 text-[10px] font-bold text-gray-400 dark:text-zinc-500 rounded-lg">
                                  {attempt.config.duration} মি.
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => navigate(`/exam/${attempt.examId}`)}
                                className="px-4 py-1.5 bg-gray-900 hover:bg-gray-850 dark:bg-white dark:hover:bg-gray-50 text-white dark:text-gray-900 rounded-xl text-xs font-bold transition-colors shadow-sm active:scale-95 whitespace-nowrap"
                              >
                                ফলাফল দেখুন
                              </button>
                              <button 
                                onClick={() => handleDeleteAttempt(attempt.examId)} 
                                disabled={deletingAttemptId === attempt.examId}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-900/20 rounded-lg transition-all active:scale-90"
                                title="ভুক্তি মুছুন"
                              >
                                {deletingAttemptId === attempt.examId ? (
                                  <Loader2 size={14} className="animate-spin text-red-500" />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'SAVED' && (
              <motion.div
                key="saved-questions-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <SavedQuestions embedded={true} />
              </motion.div>
            )}

            {activeTab === 'WRONG' && (
              <motion.div
                key="wrong-questions-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <WrongQuestions embedded={true} />
              </motion.div>
            )}
          </AnimatePresence>
      </div>
    </div>
  );
};

export default ExamHistory;
