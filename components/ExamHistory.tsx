import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import { deleteExamResultAPI } from '../services/api';
import { collection, query, where, getDocs, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { 
  Trash2, Loader2, FileQuestion, ChevronLeft, ChevronRight
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

  // Pagination for exams history
  const [currentHistoryPage, setCurrentHistoryPage] = useState(1);
  const itemsPerHistoryPage = 10;

  // Load past exams (attempts)
  useEffect(() => {
    let active = true;
    
    setLoadingAttempts(true);

    const fetchAndSync = async () => {
      if (!currentUser) {
        if (active) setLoadingAttempts(false);
        return;
      }
      try {
        // 1. Fetch from Firestore asynchronously
        const attemptsCol = collection(db, 'attempts');
        const q = query(attemptsCol, where('userId', '==', currentUser.uid));
        const snapshot = await getDocs(q);
        const firestoreAttempts: any[] = [];
        snapshot.forEach((docSnapshot) => {
          firestoreAttempts.push({ id: docSnapshot.id, ...docSnapshot.data() });
        });

        const sorted = firestoreAttempts.sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0));
        const deduplicated: any[] = [];
        for (const item of sorted) {
          const isDup = deduplicated.some(existing => 
            existing.examId === item.examId && 
            Math.abs(Number(existing.timestamp || 0) - Number(item.timestamp || 0)) < 60000
          );
          if (!isDup) deduplicated.push(item);
        }

        if (active) {
          setAttempts(deduplicated);
        }
      } catch (err) {
        logger.error("Failed to sync attempts with Firestore:", err);
      } finally {
        if (active) {
          setLoadingAttempts(false);
        }
      }
    };

    fetchAndSync();

    return () => {
      active = false;
    };
  }, [currentUser]);

  const handleDeleteAttempt = async (examId: string, attemptDocId?: string) => {
    if (!currentUser) return;
    if (!window.confirm("আপনি কি নিশ্চিত যে এই পরীক্ষাটি আপনার ইতিহাস থেকে মুছে ফেলতে চান?")) {
      return;
    }
    
    setDeletingAttemptId(examId);
    try {
      // 1. Delete from external API (MongoDB node server)
      await deleteExamResultAPI(currentUser.uid, examId);
      
      // 2. Delete from Firebase Firestore
      if (attemptDocId) {
        try {
          await deleteDoc(doc(db, 'attempts', attemptDocId));
        } catch (fErr) {
          logger.error("Failed to delete from Firestore:", fErr);
        }
      } else {
        try {
          const q = query(
            collection(db, 'attempts'), 
            where('userId', '==', currentUser.uid),
            where('examId', '==', examId)
          );
          const snap = await getDocs(q);
          const promises: Promise<void>[] = [];
          snap.forEach((d) => {
            promises.push(deleteDoc(doc(db, 'attempts', d.id)));
          });
          await Promise.all(promises);
        } catch (fErr) {
          logger.error("Failed to delete from Firestore via query:", fErr);
        }
      }

      // 3. Update state
      const updatedAttempts = attempts.filter((a: any) => a.examId !== examId);
      
      setAttempts(updatedAttempts.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0)));
      showToast("পরীক্ষাটি ইতিহাস থেকে মুছে ফেলা হয়েছে", "success");
    } catch (e) {
      logger.error(e);
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
                ? 'text-primary dark:text-purple-400 font-extrabold' 
                : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
            }`}
          >
            সেভ্ড প্রশ্ন
            {activeTab === 'SAVED' && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary dark:bg-purple-500"
                transition={{ type: 'spring', damping: 25, stiffness: 380 }}
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('WRONG')}
            className={`flex-1 py-4 text-center text-sm font-bold relative transition-colors ${
              activeTab === 'WRONG' 
                ? 'text-primary dark:text-purple-400' 
                : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
            }`}
          >
            ভুলের খাতা
            {activeTab === 'WRONG' && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary dark:bg-purple-500"
                transition={{ type: 'spring', damping: 25, stiffness: 380 }}
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('EXAMS')}
            className={`flex-1 py-4 text-center text-sm font-bold relative transition-colors ${
              activeTab === 'EXAMS' 
                ? 'text-primary dark:text-purple-400' 
                : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
            }`}
          >
            পরীক্ষা
            {activeTab === 'EXAMS' && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary dark:bg-purple-500"
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
                    <div className="w-16 h-16 bg-purple-50 dark:bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                      <FileQuestion size={32} className="text-purple-700 dark:text-purple-400" />
                    </div>
                    <p className="text-gray-900 dark:text-white font-bold text-base mb-1">কোনো পরীক্ষার রেকর্ড নেই</p>
                    <p className="text-gray-400 text-xs max-w-xs mx-auto leading-relaxed">আপনি এখনও কোনো পরীক্ষায় অংশ নেননি। পরীক্ষা দেওয়ার পর আপনার সকল ফলাফলের বিস্তারিত বিবরণ এখানে দেখতে পাবেন।</p>
                    <div className="mt-6">
                      <button
                        onClick={() => navigate('/exams')}
                        className="px-6 py-3 bg-gradient-to-r from-primary to-purple-500 text-white font-bold rounded-xl shadow-md hover:scale-102 active:scale-98 transition-all text-xs"
                      >
                        পরীক্ষা দেওয়া শুরু করুন
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {attempts
                      .slice((currentHistoryPage - 1) * itemsPerHistoryPage, currentHistoryPage * itemsPerHistoryPage)
                      .map((attempt, idx) => {
                      const totalQ = attempt.totalQuestions || 20;
                      const correct = attempt.correct || 0;
                      const percent = Math.min(100, Math.round((correct / totalQ) * 100));
                      const percentClamped = Math.max(8, Math.min(92, percent));

                      const subjectName = attempt.subject || attempt.config?.subject || 'সাধারণ';
                      const paperName = attempt.config?.paper || (attempt.config?.title?.includes('1st') || attempt.examId?.includes('1st') ? '১ম পত্র' : attempt.config?.title?.includes('2nd') || attempt.examId?.includes('2nd') ? '২য় পত্র' : null);
                      const chapterName = attempt.config?.chapter || null;
                      const examTitle = attempt.config?.title || (attempt.examId?.replace(/_/g, ' ') || 'নামহীন পরীক্ষা');

                      const serialNumber = idx + 1 + (currentHistoryPage - 1) * itemsPerHistoryPage;
                      const bnSerial = serialNumber.toString().replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d)]);

                      const examDate = attempt.timestamp 
                        ? new Date(attempt.timestamp).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })
                        : '-';

                      return (
                        <motion.div 
                          key={attempt.id || `${attempt.examId}_${attempt.timestamp || 0}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-gray-150/80 dark:border-zinc-800 shadow-sm relative overflow-hidden flex gap-4"
                        >
                          {/* Serial Number Bubble */}
                          <div className="shrink-0 pt-1">
                              <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-sm font-bold text-gray-500 dark:text-zinc-400">
                                  {bnSerial}
                              </div>
                          </div>

                          <div className="flex-1 min-w-0">
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
                              <span className="text-xs text-gray-400 dark:text-zinc-500 font-bold whitespace-nowrap pl-2 text-right">
                                {examDate}
                              </span>
                            </div>

                            {/* Progress slider bar */}
                            <div className="relative pt-4 pb-5 my-2">
                              <div className="h-1.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full relative">
                                <div 
                                  className="h-1.5 bg-primary rounded-full transition-all duration-300" 
                                  style={{ width: `${percent}%` }}
                                />
                                <div 
                                  className="absolute top-1/2 flex items-center justify-center bg-white dark:bg-zinc-950 border-2 border-primary text-[10px] font-bold tracking-tight text-primary px-2 py-0.5 rounded-full shadow-sm select-none"
                                  style={{ left: `${percentClamped}%`, transform: 'translate(-50%, -50%)' }}
                                >
                                  {correct}/{totalQ}
                                </div>
                              </div>
                            </div>

                            {/* Bottom Controls */}
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
                                  onClick={() => handleDeleteAttempt(attempt.examId, attempt.id)} 
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
                          </div>
                        </motion.div>
                      );
                    })}

                    {/* Pagination Controls */}
                    {Math.ceil(attempts.length / itemsPerHistoryPage) > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8 mb-4">
                            <button
                                onClick={() => setCurrentHistoryPage(prev => Math.max(1, prev - 1))}
                                disabled={currentHistoryPage === 1}
                                className="p-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm font-bold text-gray-600 dark:text-zinc-400 px-3">
                                {currentHistoryPage.toString().replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d)])} 
                                / 
                                {Math.ceil(attempts.length / itemsPerHistoryPage).toString().replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d)])}
                            </span>
                            <button
                                onClick={() => setCurrentHistoryPage(prev => Math.min(Math.ceil(attempts.length / itemsPerHistoryPage), prev + 1))}
                                disabled={currentHistoryPage === Math.ceil(attempts.length / itemsPerHistoryPage)}
                                className="p-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
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
