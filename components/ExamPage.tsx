import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion, useAnimation } from 'motion/react';
import { addDoc, collection } from 'firebase/firestore';
import { BookOpen, BookOpenCheck, Keyboard, LayoutGrid, Send, Sparkles } from 'lucide-react';
import { logger } from '../utils/logger';
import { useAuth } from '../contexts/AuthContext';
import { useCache } from '../contexts/CacheContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { useToast } from './Toast';
import { db } from '../services/firebase';
import {
  clearMistakesAPI,
  fetchExamResultAPI,
  fetchQuestionPapersAPI,
  fetchQuestionsByExamRefAPI,
  fetchSavedQuestionsAPI,
  generateQuizFromDB,
  recordUserActivityAPI,
  saveExamResultAPI,
  saveQuestionAPI,
  unsaveQuestionAPI,
  updateQuestProgressAPI,
} from '../services/api';
import { fetchPublicExam, fetchPublicExamLeaderboard, getUserRank, submitGuestExamResult } from '../services/publicExamService';
import type { QuizQuestion } from '../types';
import QuestionCard, { type FontSizeStep } from './exam/QuestionCard';
import { BottomBar, ExamHeader, MobileToolbar, Palette, PaletteSheet, type TimerState } from './exam/ExamChrome';
import { ExitDialog, RetakeDialog, SubmitDialog } from './exam/Dialogs';
import ResultView, { type LeaderboardEntry } from './exam/ResultView';
import StreakModal from './exam/StreakModal';
import GuestGate, { type GuestExamInfo } from './exam/GuestGate';
import { recordQbankExam } from './qbank/launch';
import { Chip, EASE, StateScreen } from './exam/ui';
import {
  bn,
  displaySubject,
  examTitle,
  hasBangla,
  isAnswered,
  isStimulusHead,
  modeLabel,
  shortcutFor,
  stimulusRange,
  summarize,
  type Answer,
  type ExamConfig,
  type ExamMode,
  type ReviewFilter,
} from './exam/model';

/*
 * /exam/:examId — the exam player + result screen.
 *
 * Bootstraps from (in order): an already-saved result → a resumable session
 * (`exam_progress_<uid>_<id>`) → a launch config (`exam_config_<id>`, see
 * components/quiz/launch.ts) → a public exam document (guests get a sign-in gate).
 * Modes: SINGLE_PAGE (one question per screen), ALL_AT_ONCE (paper view),
 * RAPID_FIRE (flash cards); `isPracticeMode` reveals answers instantly.
 */

const FONT_STEPS: FontSizeStep[] = ['text-sm', 'text-base', 'text-lg', 'text-xl'];
const FONT_STEP_LABELS: Record<FontSizeStep, string> = { 'text-sm': 'ছোট', 'text-base': 'স্বাভাবিক', 'text-lg': 'বড়', 'text-xl': 'আরও বড়' };
const LEADERBOARD_PAGE_SIZE = 5;

const ExamPage: React.FC = () => {
  const navigate = useNavigate();
  const { examId } = useParams<{ examId: string }>();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { questionFont, questionFontSize, setQuestionFontSize } = usePreferences();
  const { clearCache } = useCache();

  const uid = currentUser?.uid || 'guest';
  const CONFIG_KEY = `exam_config_${examId}`;
  const SESSION_KEY = `exam_progress_${uid}_${examId}`;

  /* ── state ─────────────────────────────────────────────────────────── */
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'EXAM' | 'RESULT'>('EXAM');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [config, setConfig] = useState<ExamConfig | null>(null);

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Answer[]>([]);
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [examDuration, setExamDuration] = useState(0);
  const [savedQuestionIndices, setSavedQuestionIndices] = useState<Set<number>>(new Set());
  const [expiryTimestamp, setExpiryTimestamp] = useState<number | null>(null);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showRetakeDialog, setShowRetakeDialog] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('ALL');
  const [navDirection, setNavDirection] = useState<1 | -1>(1);

  const [rapidFireWrongAttempt, setRapidFireWrongAttempt] = useState<number | null>(null);
  const [isRapidFireCorrect, setIsRapidFireCorrect] = useState(false);
  const shake = useAnimation();

  const [showStreakModal, setShowStreakModal] = useState(false);
  const [streakData, setStreakData] = useState<{ streak: number; activityLog: string[] } | null>(null);
  const [clearedMistakesCount, setClearedMistakesCount] = useState(0);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [viewMode, setViewMode] = useState<'SINGLE_PAGE' | 'ALL_AT_ONCE'>('SINGLE_PAGE');
  const [guestExamInfo, setGuestExamInfo] = useState<GuestExamInfo | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const isRapidFire = config?.mode === 'RAPID_FIRE';
  const isPractice = !!config?.isPracticeMode;
  const mode: ExamMode = isRapidFire ? 'RAPID_FIRE' : viewMode;
  const total = questions.length;
  const fontSize = (FONT_STEPS.includes(questionFontSize as FontSizeStep) ? questionFontSize : 'text-base') as FontSizeStep;

  const fontFor = useCallback((text: string = '') => (hasBangla(text) ? questionFont : 'font-sans'), [questionFont]);

  const summary = useMemo(() => summarize(questions, userAnswers, config?.negativeMarking || 0), [questions, userAnswers, config?.negativeMarking]);

  /* ── bootstrap ─────────────────────────────────────────────────────── */
  useEffect(() => {
    if (config?.mode === 'SINGLE_PAGE' || config?.mode === 'ALL_AT_ONCE') setViewMode(config.mode);
  }, [config?.mode]);

  useEffect(() => {
    if (!examId) {
      navigate('/dashboard');
      return;
    }

    const initExam = async () => {
      setLoading(true);

      // A finished attempt for this id → straight to the result.
      if (currentUser) {
        try {
          const existingResult = await fetchExamResultAPI(currentUser.uid, examId);
          if (existingResult) {
            setConfig(existingResult.config || {});
            setQuestions(existingResult.questions || []);
            setUserAnswers(existingResult.userAnswers || []);
            setStep('RESULT');
            setLoading(false);
            return;
          }
        } catch (e) {
          logger.error('Failed to check exam status', e);
        }
      }

      const savedSession = localStorage.getItem(SESSION_KEY);
      const storedConfig = localStorage.getItem(CONFIG_KEY);

      // Nothing local → maybe a shared public exam link.
      if (!storedConfig && !savedSession) {
        try {
          const publicExam = await fetchPublicExam(examId);
          if (publicExam) {
            if (!currentUser) {
              setGuestExamInfo(publicExam as GuestExamInfo);
              setLoading(false);
              return;
            }

            const newConfig: ExamConfig = {
              title: publicExam.title,
              timeLimit: publicExam.duration,
              totalMarks: publicExam.totalMarks,
              negativeMarking: publicExam.negativeMarking,
              mode: 'ALL_AT_ONCE',
              type: 'PUBLIC_EXAM',
              isPracticeMode: false,
            };
            setConfig(newConfig);

            // Older documents store `correctAnswer` / `id` — normalise.
            const normalizedQuestions: QuizQuestion[] = (publicExam.questions as any[]).map((q: any) => ({
              ...q,
              correctAnswerIndex: q.correctAnswerIndex ?? q.correctAnswer,
              _id: q._id || q.id,
            }));

            setQuestions(normalizedQuestions);
            setUserAnswers(new Array(normalizedQuestions.length).fill(null));
            setCurrentQIndex(0);

            const seconds = publicExam.duration * 60;
            setTimeLeft(seconds);
            setExpiryTimestamp(Date.now() + seconds * 1000);
            setLoading(false);
            return;
          }
        } catch (e) {
          logger.error('Failed to fetch public exam', e);
        }

        showToast('এই পরীক্ষার লিংকটা পাওয়া যায়নি বা মেয়াদ শেষ।', 'error');
        navigate(currentUser ? '/dashboard' : '/auth');
        return;
      }

      if (savedSession) {
        const session = JSON.parse(savedSession);
        setConfig(session.config);
        setQuestions(session.questions);
        setUserAnswers(session.userAnswers);
        setCurrentQIndex(session.currentQIndex || 0);
        setFlagged(new Set<number>(Array.isArray(session.flaggedIndices) ? session.flaggedIndices : []));
        setExamDuration(session.duration || 0);

        if (session.expiryTime) {
          setExpiryTimestamp(session.expiryTime);
          const remaining = Math.floor((session.expiryTime - Date.now()) / 1000);
          setTimeLeft(remaining > 0 ? remaining : 0);
        } else {
          setTimeLeft(0);
        }
        setLoading(false);
        return;
      }

      if (storedConfig) {
        const parsedConfig: ExamConfig = JSON.parse(storedConfig);
        setConfig(parsedConfig);
        let qs: QuizQuestion[] = [];
        if (parsedConfig.questions && parsedConfig.questions.length > 0) {
          qs = parsedConfig.questions;
        } else if (parsedConfig.type === 'PAST_PAPER' && parsedConfig.examRef) {
          try {
            qs = await fetchQuestionsByExamRefAPI(parsedConfig.examRef);
          } catch (e) {
            logger.error(e);
            showToast('প্রশ্ন লোড করা যাচ্ছে না।', 'error');
            navigate('/dashboard');
            return;
          }
        } else if (parsedConfig.type === 'CHAPTER_WISE') {
          try {
            const allowedExamRefs = new Set<string>();
            if (parsedConfig.source) {
              const papers = await fetchQuestionPapersAPI();
              papers.filter((p) => p.source === parsedConfig.source).forEach((p) => allowedExamRefs.add(p.id));
            }
            const rawQuestions = (await generateQuizFromDB({
              subject: parsedConfig.subject || '',
              chapter: parsedConfig.chapter || '',
              topics: [],
              count: 100,
            })) as QuizQuestion[];
            qs = parsedConfig.source && allowedExamRefs.size > 0 ? rawQuestions.filter((q) => q.examRef && allowedExamRefs.has(q.examRef)) : rawQuestions;
            qs = qs.slice(0, 20);
          } catch (e) {
            logger.error(e);
            showToast('অধ্যায়ভিত্তিক প্রশ্ন লোড করা যাচ্ছে না।', 'error');
          }
        }

        if (qs.length === 0) {
          showToast('কোনো প্রশ্ন পাওয়া যায়নি।', 'warning');
          navigate('/dashboard');
          return;
        }

        if (parsedConfig.shuffle) {
          qs = [...qs].sort(() => 0.5 - Math.random());
        }

        setQuestions(qs);
        setUserAnswers(new Array(qs.length).fill(null));
        setCurrentQIndex(0);

        if ((parsedConfig.timeLimit || 0) > 0) {
          const seconds = (parsedConfig.timeLimit as number) * 60;
          setTimeLeft(seconds);
          setExpiryTimestamp(Date.now() + seconds * 1000);
        } else {
          setTimeLeft(0);
        }
        setLoading(false);
      }
    };
    initExam();
    // eslint: only re-bootstrap when the exam id or the signed-in user changes
  }, [examId, currentUser]);

  /* bookmarks are synced from the server so they survive across devices */
  useEffect(() => {
    if (!currentUser || questions.length === 0) return;
    fetchSavedQuestionsAPI(currentUser.uid)
      .then((savedQs: any[]) => {
        const savedIds = new Set(
          savedQs.map((sq: any) => {
            if (sq.questionId && typeof sq.questionId === 'object') return sq.questionId._id || sq.questionId.id;
            return sq.questionId || sq.id || sq._id;
          }),
        );
        const indices = new Set<number>();
        questions.forEach((q, index) => {
          const qId = q._id || q.id;
          if (qId && savedIds.has(qId)) indices.add(index);
        });
        setSavedQuestionIndices(indices);
      })
      .catch((err: any) => logger.error('Failed to sync saved questions', err));
  }, [currentUser, questions]);

  /* resumable session */
  useEffect(() => {
    if (!loading && questions.length > 0 && step === 'EXAM' && examId && currentUser) {
      const sessionData = {
        config,
        questions,
        userAnswers,
        currentQIndex,
        savedIndices: Array.from(savedQuestionIndices),
        flaggedIndices: Array.from(flagged),
        expiryTime: expiryTimestamp,
        duration: examDuration,
        savedAt: Date.now(),
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    }
  }, [
    userAnswers,
    currentQIndex,
    savedQuestionIndices,
    flagged,
    examDuration,
    questions,
    step,
    loading,
    expiryTimestamp,
    examId,
    currentUser,
    config,
    SESSION_KEY,
  ]);

  /* MathJax — poll until the library is ready, then typeset the visible container */
  useEffect(() => {
    let attempts = 0;
    const intervalId = setInterval(() => {
      attempts++;
      const container = document.getElementById('exam-container');
      if (window.MathJax && window.MathJax.typesetPromise && container) {
        window.MathJax.typesetPromise([container])
          .then(() => clearInterval(intervalId))
          .catch((err: any) => logger.debug('MathJax typeset failed:', err));
      }
      if (attempts > 20) clearInterval(intervalId);
    }, 500);
    return () => clearInterval(intervalId);
  }, [loading, currentQIndex, step, reviewFilter, isRapidFireCorrect, viewMode]);

  /* ── submit ─────────────────────────────────────────────────────────── */
  const handleSubmitExam = async (autoSubmit = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const {
        correct: correctCount,
        wrong: wrongCount,
        skipped: skippedCount,
        score: finalScore,
        percentage,
      } = summarize(questions, userAnswers, config?.negativeMarking || 0);

      if (currentUser && examId) {
        const topicStats: any[] = [];
        const mistakes = questions.filter((_, i) => userAnswers[i] !== null && userAnswers[i] !== questions[i].correctAnswerIndex);

        const activityRes = await recordUserActivityAPI(currentUser.uid);
        if (activityRes.success && activityRes.streakUpdated) {
          setStreakData({ streak: activityRes.streak, activityLog: activityRes.activityLog });
          setShowStreakModal(true);
        }

        const submissionTimestamp = Date.now();

        await saveExamResultAPI(currentUser.uid, {
          examId,
          subject: questions[0]?.subject || 'General',
          totalQuestions: questions.length,
          correct: correctCount,
          wrong: wrongCount,
          skipped: skippedCount,
          score: finalScore,
          topicStats,
          mistakes,
          userAnswers,
          questions,
          config,
        });

        // Firestore copy (trimmed) for permanent history
        try {
          await addDoc(collection(db, 'attempts'), {
            userId: currentUser.uid,
            examId,
            subject: questions[0]?.subject || 'General',
            totalQuestions: questions.length,
            correct: correctCount,
            wrong: wrongCount,
            skipped: skippedCount,
            score: finalScore,
            topicStats,
            mistakes,
            userAnswers,
            questions: questions.map((q: any) => ({
              _id: q._id || q.id || '',
              subject: q.subject || '',
              chapter: q.chapter || '',
              correctAnswerIndex: q.correctAnswerIndex ?? q.correctAnswer ?? 0,
            })),
            config,
            timestamp: submissionTimestamp,
          });
        } catch (err) {
          logger.error('Failed to store attempt in Firebase Firestore:', err);
        }

        if (config?.type === 'PUBLIC_EXAM') {
          const answersMap: Record<number, number> = {};
          userAnswers.forEach((ans, idx) => {
            if (ans !== null) answersMap[idx] = ans;
          });
          await submitGuestExamResult(
            examId,
            { name: currentUser.displayName || 'User', email: currentUser.email || '', phone: currentUser.phoneNumber || '' },
            { score: finalScore, correct: correctCount, wrong: wrongCount, skipped: skippedCount, total: questions.length, answers: answersMap },
            examDuration,
            currentUser.uid,
          );
        }

        clearCache(`profile_${currentUser.uid}`);
        clearCache(`dashboard_${currentUser.uid}`);

        // Question-bank exams also feed the bank's own progress records.
        try {
          recordQbankExam(currentUser.uid, config, questions, userAnswers, examDuration);
        } catch (err) {
          logger.error('Failed to record question-bank exam locally:', err);
        }

        updateQuestProgressAPI(currentUser.uid, 'EXAM_COMPLETE', 1);
        if (percentage >= 80) updateQuestProgressAPI(currentUser.uid, 'HIGH_SCORE', 1);

        if (autoSubmit) showToast('সময় শেষ! উত্তরপত্র নিজে থেকেই জমা হয়ে গেছে।', 'info');

        if (config?.isMistakeRetake) {
          const solvedIds = questions.filter((q, i) => userAnswers[i] === q.correctAnswerIndex && q._id).map((q) => q._id as string);
          if (solvedIds.length > 0) {
            await clearMistakesAPI(currentUser.uid, solvedIds);
            setClearedMistakesCount(solvedIds.length);
            clearCache(`profile_${currentUser.uid}`);
          }
        }
      }
    } catch (e) {
      logger.error(e);
      showToast('জমা দিতে সমস্যা হয়েছে', 'error');
    } finally {
      localStorage.removeItem(SESSION_KEY);
      setShowSubmitModal(false);
      setShowPalette(false);
      setReviewFilter('ALL');
      setLeaderboardPage(1);
      setStep('RESULT');
      setIsSubmitting(false);
    }
  };

  // The timer tick must always call the *latest* submit (with the latest answers).
  const submitRef = useRef(handleSubmitExam);
  submitRef.current = handleSubmitExam;

  /* ── clock ─────────────────────────────────────────────────────────── */
  const timeLimit = config?.timeLimit || 0;
  useEffect(() => {
    if (loading || step !== 'EXAM' || !config) return;
    const timed = timeLimit > 0;
    const interval = setInterval(() => {
      setExamDuration((prev) => prev + 1);
      if (!timed) return;
      if (expiryTimestamp) {
        const diff = Math.ceil((expiryTimestamp - Date.now()) / 1000);
        if (diff <= 0) {
          setTimeLeft(0);
          clearInterval(interval);
          submitRef.current(true);
        } else {
          setTimeLeft(diff);
        }
      } else {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, step, config, timeLimit, expiryTimestamp]);

  /* ── merit list (public exams) ─────────────────────────────────────── */
  useEffect(() => {
    if (step !== 'RESULT' || !examId || config?.type !== 'PUBLIC_EXAM') return;
    setLeaderboardLoading(true);
    fetchPublicExamLeaderboard(examId)
      .then((data: any[]) => {
        setLeaderboard(data);
        const userIndex = data.findIndex((entry) => entry.userId && entry.userId === currentUser?.uid);
        if (userIndex !== -1) {
          setUserRank(userIndex + 1);
        } else {
          const { score } = summarize(questions, userAnswers, config?.negativeMarking || 0);
          getUserRank(examId, score, examDuration).then((rank) => {
            if (rank) setUserRank(rank);
          });
        }
      })
      .catch((err) => logger.error(err))
      .finally(() => setLeaderboardLoading(false));
  }, [step, examId, currentUser, config, userAnswers, questions, examDuration]);

  /* ── answering ─────────────────────────────────────────────────────── */
  const handleOptionSelect = (qIndex: number, optionIndex: number) => {
    if (isRapidFire) {
      if (isRapidFireCorrect || userAnswers[qIndex] !== null) return;
      const correctIndex = questions[qIndex].correctAnswerIndex;
      if (optionIndex === correctIndex) {
        setIsRapidFireCorrect(true);
        setRapidFireWrongAttempt(null);
        setUserAnswers((prev) => {
          const next = [...prev];
          next[qIndex] = optionIndex;
          return next;
        });
      } else {
        setRapidFireWrongAttempt(optionIndex);
        shake.start({ x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.4 } });
      }
      return;
    }
    if (isPractice && userAnswers[qIndex] !== null) return;
    setUserAnswers((prev) => {
      const next = [...prev];
      next[qIndex] = optionIndex;
      return next;
    });
    if (isPractice && window.MathJax) {
      setTimeout(() => {
        const expBox = document.getElementById(`explanation-${qIndex}`);
        if (expBox) window.MathJax.typesetPromise([expBox]);
      }, 100);
    }
  };

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(total - 1, index));
    if (clamped === currentQIndex) return;
    setNavDirection(clamped > currentQIndex ? 1 : -1);
    setCurrentQIndex(clamped);
    setIsRapidFireCorrect(false);
    setRapidFireWrongAttempt(null);
    scrollRef.current?.scrollTo?.({ top: 0, behavior: 'smooth' });
  };

  const rapidReady = isRapidFire && (isRapidFireCorrect || isAnswered(userAnswers[currentQIndex]));

  const handleRapidFireNext = () => {
    if (!rapidReady) return;
    if (currentQIndex < total - 1) goTo(currentQIndex + 1);
    else handleSubmitExam();
  };

  const toggleFlag = (index: number) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const jumpTo = (index: number) => {
    setShowPalette(false);
    if (mode === 'ALL_AT_ONCE') {
      document.getElementById(`q-${index}`)?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    } else {
      goTo(index);
    }
  };

  const toggleSaveQuestion = async (index: number) => {
    if (!currentUser) {
      showToast('বুকমার্ক করতে লগইন লাগবে', 'warning');
      return;
    }
    const q = questions[index];
    const questionId = q._id || q.id;
    if (!questionId) {
      showToast('প্রশ্নটি সেভ করা যাচ্ছে না (আইডি নেই)', 'error');
      return;
    }
    const isCurrentlySaved = savedQuestionIndices.has(index);
    setSavedQuestionIndices((prev) => {
      const next = new Set(prev);
      if (isCurrentlySaved) next.delete(index);
      else next.add(index);
      return next;
    });
    try {
      if (isCurrentlySaved) {
        await unsaveQuestionAPI(currentUser.uid, questionId);
        showToast('বুকমার্ক সরানো হয়েছে', 'info');
      } else {
        await saveQuestionAPI(currentUser.uid, questionId);
        updateQuestProgressAPI(currentUser.uid, 'SAVE_QUESTION', 1);
        showToast('প্রশ্নটি বুকমার্ক হয়েছে', 'success');
      }
    } catch (_e) {
      setSavedQuestionIndices((prev) => {
        const next = new Set(prev);
        if (isCurrentlySaved) next.add(index);
        else next.delete(index);
        return next;
      });
      showToast('বুকমার্ক আপডেট করা যায়নি', 'error');
    }
  };

  const cycleFontSize = () => {
    const next = FONT_STEPS[(FONT_STEPS.indexOf(fontSize) + 1) % FONT_STEPS.length];
    setQuestionFontSize(next);
    showToast(`লেখার আকার: ${FONT_STEP_LABELS[next]}`, 'info');
  };

  const goBack = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate('/dashboard');
  };

  const confirmExit = () => {
    localStorage.removeItem(SESSION_KEY);
    setShowExitDialog(false);
    goBack();
  };

  const startRetake = () => {
    localStorage.removeItem(SESSION_KEY);
    setShowRetakeDialog(false);
    setUserAnswers(new Array(total).fill(null));
    setFlagged(new Set());
    setCurrentQIndex(0);
    setReviewFilter('ALL');
    setClearedMistakesCount(0);
    setIsRapidFireCorrect(false);
    setRapidFireWrongAttempt(null);
    setExamDuration(0);
    const seconds = timeLimit > 0 ? timeLimit * 60 : 0;
    setTimeLeft(seconds);
    setExpiryTimestamp(seconds > 0 ? Date.now() + seconds * 1000 : null);
    setStep('EXAM');
  };

  /* ── keyboard shortcuts (desktop) ──────────────────────────────────── */
  const latest = useRef({ handleOptionSelect, goTo, handleRapidFireNext, toggleFlag, currentQIndex, total, questions, mode, dialogOpen: false });
  latest.current = {
    handleOptionSelect,
    goTo,
    handleRapidFireNext,
    toggleFlag,
    currentQIndex,
    total,
    questions,
    mode,
    dialogOpen: showSubmitModal || showExitDialog || showPalette || showRetakeDialog,
  };

  useEffect(() => {
    if (loading || step !== 'EXAM') return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const s = latest.current;
      if (s.dialogOpen) return;
      const action = shortcutFor(e.key, s.questions[s.currentQIndex]?.options.length ?? 0);
      if (!action) return;
      if (s.mode === 'ALL_AT_ONCE') {
        if (action.type === 'palette') {
          e.preventDefault();
          setShowPalette(true);
        }
        return;
      }
      e.preventDefault();
      if (action.type === 'option') s.handleOptionSelect(s.currentQIndex, action.index);
      else if (action.type === 'prev') s.goTo(s.currentQIndex - 1);
      else if (action.type === 'next') {
        if (s.mode === 'RAPID_FIRE') s.handleRapidFireNext();
        else s.goTo(s.currentQIndex + 1);
      } else if (action.type === 'flag') s.toggleFlag(s.currentQIndex);
      else if (action.type === 'palette') setShowPalette(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [loading, step]);

  /* ── screens ───────────────────────────────────────────────────────── */
  if (loading) return <StateScreen title="প্রশ্নপত্র সাজানো হচ্ছে…" subtitle="একটু অপেক্ষা করো, তোমার প্রশ্নগুলো গুছিয়ে আনছি।" icon={BookOpenCheck} />;
  if (isSubmitting) return <StateScreen title="উত্তরপত্র জমা হচ্ছে…" subtitle="ফলাফল আর ব্যাখ্যা তৈরি হচ্ছে — কয়েক সেকেন্ড।" icon={Send} />;

  if (!currentUser && guestExamInfo) {
    return <GuestGate exam={guestExamInfo} onHome={() => navigate('/')} />;
  }

  if (step === 'RESULT') {
    const isPublic = config?.type === 'PUBLIC_EXAM';
    return (
      <MotionConfig reducedMotion="user">
        <ResultView
          questions={questions}
          answers={userAnswers}
          config={config}
          duration={examDuration}
          flagged={flagged}
          saved={savedQuestionIndices}
          onToggleSave={toggleSaveQuestion}
          fontFor={fontFor}
          fontSize={fontSize}
          clearedMistakes={clearedMistakesCount}
          reviewFilter={reviewFilter}
          onReviewFilter={setReviewFilter}
          onRetake={() => setShowRetakeDialog(true)}
          onDashboard={() => navigate('/dashboard')}
          celebrate={!showStreakModal}
          leaderboard={
            isPublic
              ? {
                  entries: leaderboard,
                  loading: leaderboardLoading,
                  page: leaderboardPage,
                  pageSize: LEADERBOARD_PAGE_SIZE,
                  onPage: setLeaderboardPage,
                  userRank,
                  currentUserId: currentUser?.uid,
                  currentUserName: currentUser?.displayName || undefined,
                  mine: { score: summary.score, correct: summary.correct, wrong: summary.wrong, duration: examDuration },
                }
              : undefined
          }
        />
        {streakData && (
          <StreakModal open={showStreakModal} streak={streakData.streak} activityLog={streakData.activityLog} onContinue={() => setShowStreakModal(false)} />
        )}
        <RetakeDialog open={showRetakeDialog} onClose={() => setShowRetakeDialog(false)} onConfirm={startRetake} />
      </MotionConfig>
    );
  }

  if (!config || total === 0) return null;

  /* ── exam view ─────────────────────────────────────────────────────── */
  const currentQ = questions[currentQIndex];
  const timed = timeLimit > 0;
  const totalSeconds = timeLimit * 60;
  const timer: TimerState = timed
    ? { seconds: timeLeft, timed: true, low: timeLeft <= Math.max(60, totalSeconds * 0.2) }
    : { seconds: examDuration, timed: false, low: false };
  const progress = timed
    ? Math.min(100, Math.max(0, ((totalSeconds - timeLeft) / totalSeconds) * 100))
    : mode === 'ALL_AT_ONCE'
      ? (summary.answered / total) * 100
      : ((currentQIndex + 1) / total) * 100;
  const negative = config.negativeMarking || 0;
  const chips = [
    modeLabel(config),
    `${bn(total)} টি প্রশ্ন`,
    timed ? `${bn(timeLimit)} মিনিট` : 'সময়ের সীমা নেই',
    negative > 0 ? `নেগেটিভ −${bn(negative)}` : null,
  ].filter(Boolean) as string[];
  const answeredCurrent = isAnswered(userAnswers[currentQIndex]);
  const revealCurrent = isRapidFire ? rapidReady : isPractice && answeredCurrent;
  const firstFlagged = Array.from(flagged).sort((a, b) => a - b)[0];

  return (
    <MotionConfig reducedMotion="user">
      <div className="pk-landing relative flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-paper font-body text-ink">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -top-40 right-[-160px] h-[480px] w-[480px] rounded-full bg-[radial-gradient(closest-side,rgba(255,82,0,0.10),transparent)] blur-3xl" />
          <div className="absolute bottom-[-180px] left-[-160px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(255,185,46,0.14),transparent)] blur-3xl" />
        </div>

        <ExamHeader
          title={examTitle(config, questions, mode)}
          chips={chips}
          timer={timer}
          mode={mode}
          onToggleView={isRapidFire ? undefined : () => setViewMode((prev) => (prev === 'SINGLE_PAGE' ? 'ALL_AT_ONCE' : 'SINGLE_PAGE'))}
          onCycleFontSize={cycleFontSize}
          onExit={() => setShowExitDialog(true)}
          progress={progress}
        />

        <div id="exam-container" ref={scrollRef} className="relative z-10 min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          <div className={`mx-auto w-full min-w-0 px-4 pt-5 sm:px-6 ${mode === 'ALL_AT_ONCE' ? 'max-w-5xl pb-36' : 'max-w-3xl pb-40'}`}>
            {mode !== 'ALL_AT_ONCE' ? (
              <>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={currentQIndex}
                    initial={{ opacity: 0, x: navDirection * 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: navDirection * -28 }}
                    transition={{ duration: 0.28, ease: EASE }}
                  >
                    <motion.div animate={shake}>
                      <QuestionCard
                        q={currentQ}
                        index={currentQIndex}
                        total={total}
                        answer={userAnswers[currentQIndex]}
                        variant="single"
                        reveal={revealCurrent}
                        rapidWrong={isRapidFire ? rapidFireWrongAttempt : null}
                        disabled={isRapidFire ? rapidReady : isPractice && answeredCurrent}
                        onSelect={(optionIndex) => handleOptionSelect(currentQIndex, optionIndex)}
                        saved={savedQuestionIndices.has(currentQIndex)}
                        onToggleSave={() => toggleSaveQuestion(currentQIndex)}
                        flagged={flagged.has(currentQIndex)}
                        onToggleFlag={isRapidFire ? undefined : () => toggleFlag(currentQIndex)}
                        fontFor={fontFor}
                        fontSize={fontSize}
                        stimulus={stimulusRange(questions, currentQIndex)}
                        showExplanation={revealCurrent}
                      />
                    </motion.div>
                  </motion.div>
                </AnimatePresence>

                {isRapidFire && !rapidReady && (
                  <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[13px] font-semibold text-mist">
                    <Sparkles className="h-4 w-4 text-brand" strokeWidth={2.4} aria-hidden="true" />
                    {rapidFireWrongAttempt !== null ? 'হয়নি — আরেকবার ভাবো, সঠিকটা এখানেই আছে।' : 'সঠিক উত্তরটা না পাওয়া পর্যন্ত চেষ্টা করতে থাকো।'}
                  </p>
                )}

                <p className="mt-5 hidden items-center justify-center gap-2 text-[12px] font-semibold text-ink/35 md:flex">
                  <Keyboard className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
                  <span>
                    <kbd className="rounded-md bg-ink/5 px-1.5 py-0.5 font-body">১–৪</kbd> অপশন ·{' '}
                    <kbd className="rounded-md bg-ink/5 px-1.5 py-0.5 font-body">←</kbd> <kbd className="rounded-md bg-ink/5 px-1.5 py-0.5 font-body">→</kbd>{' '}
                    আগে/পরে
                    {!isRapidFire && (
                      <>
                        {' '}
                        · <kbd className="rounded-md bg-ink/5 px-1.5 py-0.5 font-body">F</kbd> ফ্ল্যাগ
                      </>
                    )}{' '}
                    · <kbd className="rounded-md bg-ink/5 px-1.5 py-0.5 font-body">G</kbd> তালিকা
                  </span>
                </p>
              </>
            ) : (
              <div className="flex gap-6 lg:items-start">
                <div className="min-w-0 flex-1 space-y-4">
                  {questions.map((q, idx) => {
                    const showSubjectHeader = idx > 0 && q.subject !== questions[idx - 1]?.subject && !!q.subject;
                    const answered = isAnswered(userAnswers[idx]);
                    return (
                      <React.Fragment key={idx}>
                        {showSubjectHeader && (
                          <div className="sticky top-0 z-20 -mx-1 px-1 pt-1">
                            <div className="flex items-center gap-2 rounded-2xl bg-white/85 px-4 py-2.5 text-[13px] font-extrabold text-ink ring-1 ring-ink/8 backdrop-blur-xl">
                              <BookOpen className="h-4 w-4 text-brand" strokeWidth={2.4} aria-hidden="true" />
                              বিষয়: {displaySubject(q.subject)}
                            </div>
                          </div>
                        )}
                        <QuestionCard
                          id={`q-${idx}`}
                          q={q}
                          index={idx}
                          total={total}
                          answer={userAnswers[idx]}
                          variant="list"
                          reveal={isPractice && answered}
                          disabled={isPractice && answered}
                          onSelect={(optionIndex) => handleOptionSelect(idx, optionIndex)}
                          saved={savedQuestionIndices.has(idx)}
                          onToggleSave={() => toggleSaveQuestion(idx)}
                          flagged={flagged.has(idx)}
                          onToggleFlag={() => toggleFlag(idx)}
                          fontFor={fontFor}
                          fontSize={fontSize}
                          stimulus={isStimulusHead(questions, idx) ? stimulusRange(questions, idx) : null}
                          showExplanation={isPractice && answered}
                        />
                      </React.Fragment>
                    );
                  })}
                </div>

                <aside className="hidden w-72 shrink-0 lg:block">
                  <div className="sticky top-0 max-h-[calc(100dvh-150px)] overflow-y-auto rounded-[26px] bg-white p-4 ring-1 ring-ink/8 shadow-[0_18px_44px_-30px_rgba(22,18,16,0.35)]">
                    <div className="mb-3 flex items-center gap-2">
                      <LayoutGrid className="h-4 w-4 text-brand" strokeWidth={2.4} aria-hidden="true" />
                      <h3 className="text-[14px] font-extrabold text-ink">প্রশ্ন তালিকা</h3>
                      <span className="flex-1" />
                      <Chip>
                        {bn(summary.answered)} / {bn(total)}
                      </Chip>
                    </div>
                    <Palette total={total} answers={userAnswers} flagged={flagged} current={null} onJump={jumpTo} />
                  </div>
                </aside>
              </div>
            )}
          </div>
        </div>

        <BottomBar
          mode={mode}
          current={currentQIndex}
          total={total}
          answers={userAnswers}
          flagged={flagged}
          onPrev={() => goTo(currentQIndex - 1)}
          onNext={() => goTo(currentQIndex + 1)}
          onOpenPalette={() => setShowPalette(true)}
          onSubmit={() => setShowSubmitModal(true)}
          onToggleFlag={() => toggleFlag(currentQIndex)}
          rapidReady={rapidReady}
          onRapidNext={handleRapidFireNext}
        />

        <PaletteSheet
          open={showPalette}
          onClose={() => setShowPalette(false)}
          total={total}
          answers={userAnswers}
          flagged={flagged}
          current={mode === 'ALL_AT_ONCE' ? null : currentQIndex}
          onJump={jumpTo}
          onSubmit={
            mode === 'ALL_AT_ONCE'
              ? undefined
              : () => {
                  setShowPalette(false);
                  setShowSubmitModal(true);
                }
          }
          toolbar={
            <MobileToolbar
              mode={mode}
              onToggleView={isRapidFire ? undefined : () => setViewMode((prev) => (prev === 'SINGLE_PAGE' ? 'ALL_AT_ONCE' : 'SINGLE_PAGE'))}
              onCycleFontSize={cycleFontSize}
              fontLabel={FONT_STEP_LABELS[fontSize]}
            />
          }
        />

        <SubmitDialog
          open={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          onConfirm={() => handleSubmitExam()}
          total={total}
          answered={summary.answered}
          flagged={flagged.size}
          submitting={isSubmitting}
          onReviewFlagged={
            firstFlagged !== undefined
              ? () => {
                  setShowSubmitModal(false);
                  jumpTo(firstFlagged);
                }
              : undefined
          }
        />

        <ExitDialog open={showExitDialog} onClose={() => setShowExitDialog(false)} onConfirm={confirmExit} />
      </div>
    </MotionConfig>
  );
};

export default ExamPage;
