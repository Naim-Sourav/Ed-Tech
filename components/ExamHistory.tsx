import React, { useEffect, useState, useMemo } from 'react';
import { logger } from '../utils/logger';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import { deleteExamResultAPI } from '../services/api';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Trash2, Loader2, FileQuestion, ChevronLeft, ChevronRight, Bookmark, AlertTriangle, Play, History, BookOpen } from 'lucide-react';
import { Card, SectionHeader, Track, Eyebrow, Bone, EASE, cx } from './dashboard/ui';
import { Pill, Btn, Chip, Empty } from './qbank/ui';
import { ProfileTopBar } from './profile/sections';
import SavedQuestions from './SavedQuestions';
import WrongQuestions from './WrongQuestions';
import { bn } from './profile/model';

const toBn = bn;

type Tab = 'EXAMS' | 'SAVED' | 'WRONG';

const ExamHistory: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<Tab>('SAVED');
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);
  const [deletingAttemptId, setDeletingAttemptId] = useState<string | null>(null);
  const [currentHistoryPage, setCurrentHistoryPage] = useState(1);
  const itemsPerHistoryPage = 10;

  useEffect(() => {
    let active = true;
    setLoadingAttempts(true);
    const fetchAndSync = async () => {
      if (!currentUser) {
        if (active) setLoadingAttempts(false);
        return;
      }
      try {
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
          const isDup = deduplicated.some(
            (existing) => existing.examId === item.examId && Math.abs(Number(existing.timestamp || 0) - Number(item.timestamp || 0)) < 60000
          );
          if (!isDup) deduplicated.push(item);
        }
        if (active) setAttempts(deduplicated);
      } catch (err) {
        logger.error('Failed to sync attempts with Firestore:', err);
      } finally {
        if (active) setLoadingAttempts(false);
      }
    };
    fetchAndSync();
    return () => {
      active = false;
    };
  }, [currentUser]);

  const handleDeleteAttempt = async (examId: string, attemptDocId?: string) => {
    if (!currentUser) return;
    if (!window.confirm('আপনি কি নিশ্চিত যে এই পরীক্ষাটি আপনার ইতিহাস থেকে মুছে ফেলতে চান?')) return;
    setDeletingAttemptId(examId);
    try {
      await deleteExamResultAPI(currentUser.uid, examId);
      if (attemptDocId) {
        try {
          await deleteDoc(doc(db, 'attempts', attemptDocId));
        } catch (fErr) {
          logger.error('Failed to delete from Firestore:', fErr);
        }
      } else {
        try {
          const q = query(collection(db, 'attempts'), where('userId', '==', currentUser.uid), where('examId', '==', examId));
          const snap = await getDocs(q);
          const promises: Promise<void>[] = [];
          snap.forEach((d) => {
            promises.push(deleteDoc(doc(db, 'attempts', d.id)));
          });
          await Promise.all(promises);
        } catch (fErr) {
          logger.error('Failed to delete from Firestore via query:', fErr);
        }
      }
      const updatedAttempts = attempts.filter((a: any) => a.examId !== examId);
      setAttempts(updatedAttempts.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0)));
      showToast('পরীক্ষাটি ইতিহাস থেকে মুছে ফেলা হয়েছে', 'success');
    } catch (e) {
      logger.error(e);
      showToast('মুছে ফেলা সম্ভব হয়নি', 'error');
    } finally {
      setDeletingAttemptId(null);
    }
  };

  const totalPages = Math.ceil(attempts.length / itemsPerHistoryPage);
  const pagedAttempts = useMemo(
    () => attempts.slice((currentHistoryPage - 1) * itemsPerHistoryPage, currentHistoryPage * itemsPerHistoryPage),
    [attempts, currentHistoryPage]
  );

  const shell = 'pk-landing dash relative min-h-full bg-paper pb-28 text-ink dark:bg-ink dark:text-paper md:pb-12';
  const inner = 'mx-auto w-full max-w-6xl px-4 pt-3 md:px-6 md:pt-6';

  return (
    <div className={shell}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(255,82,0,0.10),transparent)] blur-2xl dark:opacity-70" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(255,185,46,0.16),transparent)] blur-3xl dark:opacity-60" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-28 top-72 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(255,122,53,0.10),transparent)] blur-3xl dark:opacity-70" />

      <div className={inner + ' relative z-10'}>
        <ProfileTopBar title="ইতিহাস" eyebrow="তোমার সব সংরক্ষণ এক জায়গায়" onBack={() => navigate(-1)} />

        {/* Tabs - Pill style matching dashboard */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Pill active={activeTab === 'SAVED'} onClick={() => setActiveTab('SAVED')}>
            <Bookmark className="h-4 w-4" strokeWidth={2.4} /> সেভ্ড প্রশ্ন
          </Pill>
          <Pill active={activeTab === 'WRONG'} onClick={() => setActiveTab('WRONG')}>
            <AlertTriangle className="h-4 w-4" strokeWidth={2.4} /> ভুলের খাতা
          </Pill>
          <Pill active={activeTab === 'EXAMS'} onClick={() => setActiveTab('EXAMS')}>
            <History className="h-4 w-4" strokeWidth={2.4} /> পরীক্ষা {attempts.length > 0 && `· ${toBn(attempts.length)}`}
          </Pill>
        </div>

        <div className="mt-5">
          {activeTab === 'EXAMS' && (
            <div className="space-y-4">
              {loadingAttempts ? (
                <div className="space-y-3">
                  <Bone className="h-24 rounded-[26px]" />
                  <Bone className="h-24 rounded-[26px]" />
                  <Bone className="h-24 rounded-[26px]" />
                </div>
              ) : attempts.length === 0 ? (
                <Card className="p-0 overflow-hidden">
                  <div className="p-6 sm:p-8 text-center">
                    <span className="mx-auto grid h-16 w-16 place-items-center rounded-[20px] bg-cream text-brand-deep ring-1 ring-brand/10 dark:bg-brand/10 dark:text-brand-bright dark:ring-brand/20">
                      <FileQuestion className="h-8 w-8" strokeWidth={2} />
                    </span>
                    <h3 className="mt-4 text-[18px] font-extrabold tracking-tight text-ink dark:text-paper">কোনো পরীক্ষার রেকর্ড নেই</h3>
                    <p className="mx-auto mt-1.5 max-w-sm text-[13.5px] font-semibold leading-relaxed text-mist dark:text-white/50">
                      তুমি এখনো কোনো পরীক্ষায় অংশ নাওনি। পরীক্ষা দিলে এখানে বিস্তারিত ফলাফল, সময় আর অধ্যায়ভিত্তিক বিশ্লেষণ দেখতে পাবে।
                    </p>
                    <div className="mt-5 flex justify-center">
                      <Btn variant="brand" icon={Play} onClick={() => navigate('/quiz')}>
                        প্রথম মক দাও
                      </Btn>
                    </div>
                  </div>
                </Card>
              ) : (
                <>
                  <Card className="p-4 sm:p-5">
                    <SectionHeader icon={History} title="পরীক্ষার ইতিহাস" subtitle={`${toBn(attempts.length)}টি পরীক্ষা · সর্বশেষ আগে`} />
                    <ul className="mt-4 space-y-3">
                      {pagedAttempts.map((attempt, idx) => {
                        const totalQ = attempt.totalQuestions || 20;
                        const correct = attempt.correct || 0;
                        const percent = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;
                        const clamped = Math.max(8, Math.min(92, percent));
                        const subjectName = attempt.subject || attempt.config?.subject || 'সাধারণ';
                        const paperName =
                          attempt.config?.paper ||
                          (attempt.config?.title?.includes('1st') || attempt.examId?.includes('1st')
                            ? '১ম পত্র'
                            : attempt.config?.title?.includes('2nd') || attempt.examId?.includes('2nd')
                            ? '২য় পত্র'
                            : null);
                        const chapterName = attempt.config?.chapter || null;
                        const examTitle = attempt.config?.title || (attempt.examId?.replace(/_/g, ' ') || 'নামহীন পরীক্ষা');
                        const serialNumber = idx + 1 + (currentHistoryPage - 1) * itemsPerHistoryPage;
                        const examDate = attempt.timestamp
                          ? new Date(attempt.timestamp).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })
                          : '-';
                        const tone = percent >= 70 ? 'brand' : percent >= 50 ? 'gold' : 'flag';

                        return (
                          <li
                            key={attempt.id || `${attempt.examId}_${attempt.timestamp || 0}`}
                            className="group rounded-[20px] bg-ink/[0.03] p-4 ring-1 ring-ink/[0.04] transition-colors hover:bg-ink/[0.05] dark:bg-white/[0.04] dark:ring-white/[0.06] dark:hover:bg-white/[0.06]"
                          >
                            <div className="flex items-start gap-3.5">
                              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[13px] font-black tabular-nums text-ink ring-1 ring-ink/10 dark:bg-ink-2 dark:text-paper dark:ring-white/10">
                                {toBn(serialNumber)}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <h3 className="truncate text-[15px] font-extrabold tracking-tight text-ink dark:text-paper">{subjectName}</h3>
                                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11.5px] font-bold">
                                      {paperName && <span className="rounded-full bg-white px-2 py-0.5 text-ink/70 ring-1 ring-ink/10 dark:bg-white/10 dark:text-white/70 dark:ring-white/10">{paperName}</span>}
                                      {chapterName ? (
                                        <span className="text-mist dark:text-white/50">{chapterName}</span>
                                      ) : (
                                        examTitle !== subjectName && <span className="truncate text-mist dark:text-white/50">{examTitle}</span>
                                      )}
                                    </div>
                                  </div>
                                  <span className="shrink-0 text-[11px] font-bold text-mist dark:text-white/40">{examDate}</span>
                                </div>

                                <div className="relative mt-3 pt-4">
                                  <Track value={percent / 100} tone={tone as any} />
                                  <div className="pointer-events-none absolute top-0 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-black tabular-nums text-ink shadow-sm ring-1 ring-ink/10 dark:bg-ink-2 dark:text-paper dark:ring-white/10" style={{ left: `${clamped}%` }}>
                                    {toBn(correct)}/{toBn(totalQ)} · {toBn(percent)}%
                                  </div>
                                </div>

                                <div className="mt-3 flex items-center justify-between gap-2 border-t border-ink/[0.06] pt-3 dark:border-white/[0.06]">
                                  <div className="flex items-center gap-1.5">
                                    <Chip tone="neutral" className="text-[11px]">
                                      {attempt.config?.examType || 'HSC'}
                                    </Chip>
                                    {attempt.config?.duration && (
                                      <Chip tone="neutral" className="text-[11px]">
                                        {toBn(attempt.config.duration)} মি.
                                      </Chip>
                                    )}
                                    <span className={cx('text-[11px] font-bold', percent >= 70 ? 'text-emerald-700 dark:text-emerald-300' : percent >= 50 ? 'text-amber-700 dark:text-amber-200' : 'text-flag dark:text-red-300')}>
                                      {percent >= 70 ? 'ভালো' : percent >= 50 ? 'মোটামুটি' : 'আরও চর্চা দরকার'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Btn size="sm" variant="primary" onClick={() => navigate(`/exam/${attempt.examId}`)}>
                                      ফলাফল
                                    </Btn>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteAttempt(attempt.examId, attempt.id)}
                                      disabled={deletingAttemptId === attempt.examId}
                                      aria-label="মুছুন"
                                      className="focus-ring grid h-9 w-9 place-items-center rounded-full bg-white text-mist ring-1 ring-ink/10 transition-colors hover:bg-flag/10 hover:text-flag disabled:opacity-40 dark:bg-white/10 dark:text-white/50 dark:ring-white/10 dark:hover:bg-flag/20 dark:hover:text-red-300"
                                    >
                                      {deletingAttemptId === attempt.examId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" strokeWidth={2.2} />}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>

                    {totalPages > 1 && (
                      <div className="mt-6 flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCurrentHistoryPage((p) => Math.max(1, p - 1))}
                          disabled={currentHistoryPage === 1}
                          className="focus-ring grid h-10 w-10 place-items-center rounded-full bg-white text-ink ring-1 ring-ink/10 hover:bg-ink/[0.04] disabled:opacity-40 dark:bg-white/10 dark:text-white dark:ring-white/10 dark:hover:bg-white/10"
                        >
                          <ChevronLeft className="h-5 w-5" strokeWidth={2.4} />
                        </button>
                        <span className="rounded-full bg-ink px-3.5 py-1.5 text-[13px] font-bold tabular-nums text-white dark:bg-paper dark:text-ink">
                          {toBn(currentHistoryPage)} / {toBn(totalPages)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentHistoryPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentHistoryPage === totalPages}
                          className="focus-ring grid h-10 w-10 place-items-center rounded-full bg-white text-ink ring-1 ring-ink/10 hover:bg-ink/[0.04] disabled:opacity-40 dark:bg-white/10 dark:text-white dark:ring-white/10 dark:hover:bg-white/10"
                        >
                          <ChevronRight className="h-5 w-5" strokeWidth={2.4} />
                        </button>
                      </div>
                    )}
                  </Card>
                </>
              )}
            </div>
          )}

          {activeTab === 'SAVED' && (
            <Card className="p-0 overflow-hidden">
              <div className="border-b border-ink/6 bg-cream/60 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <SectionHeader icon={Bookmark} title="সেভ্ড প্রশ্ন" subtitle="পরে দেখার জন্য সংরক্ষণ করেছ" />
              </div>
              <div className="p-2 sm:p-3">
                <SavedQuestions embedded={true} />
              </div>
            </Card>
          )}

          {activeTab === 'WRONG' && (
            <Card className="p-0 overflow-hidden">
              <div className="border-b border-ink/6 bg-cream/60 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <SectionHeader icon={AlertTriangle} title="ভুলের খাতা" subtitle="যেখানে ভুল হয়েছে, সেখানেই শেখা" />
              </div>
              <div className="p-2 sm:p-3">
                <WrongQuestions embedded={true} />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamHistory;
