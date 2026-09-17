
import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import SafeHtml from './SafeHtml';
import { saveExamResultAPI, updateQuestProgressAPI, saveQuestionAPI, unsaveQuestionAPI, fetchQuestionsByExamRefAPI, recordUserActivityAPI, clearMistakesAPI, fetchExamResultAPI, generateQuizFromDB, fetchQuestionPapersAPI, syncUserToMongoDB, fetchSavedQuestionsAPI } from '../services/api';
import { fetchPublicExamLeaderboard, getUserRank, submitGuestExamResult, fetchPublicExam } from '../services/publicExamService';
import { 
  Clock, CheckCircle,
  BookOpen, Bookmark, LayoutGrid, HelpCircle, 
  Trophy, RefreshCw, Home, LayoutList, X, Flame, Layers, ArrowRight, Check, AlertTriangle, Loader2,
  User, Mail, Lock, ChevronLeft, ChevronRight
} from 'lucide-react';
import { QuizQuestion } from '../types';
import { useCache } from '../contexts/CacheContext';
import { motion } from 'motion/react';
import { toBengaliNumber } from '../utils/numberUtils';
import { usePreferences } from '../contexts/PreferencesContext';
import Confetti from './Confetti'; // Use existing confetti instead of Lottie to be safe
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';

// Helper to normalize subject names for display (Same as QuestionBank)
const getDisplaySubject = (subject: string = '') => {
    const s = subject.toLowerCase();
    if (s.includes('physics')) return 'Physics (পদার্থবিজ্ঞান )';
    if (s.includes('chemistry')) return 'Chemistry ( রসায়ন )';
    if (s.includes('math')) return 'Higher Math ( উচ্চতর গণিত )';
    if (s.includes('biology')) return 'Biology ( জীববিজ্ঞান )';
    if (s.includes('english')) return 'English ( ইংরেজি )';
    if (s.includes('bangla')) return 'Bangla ( বাংলা )';
    if (s.includes('knowledge') || s.includes('gk')) return 'General Knowledge ( সাধারণ জ্ঞান )';
    if (s.includes('ict')) return 'ICT ( তথ্য ও যোগাযোগ প্রযুক্তি )';
    return subject || 'General';
};

const ExamPage: React.FC = () => {
  const navigate = useNavigate();
  const { examId } = useParams<{ examId: string }>();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { questionFont, questionFontSize } = usePreferences();
  const { clearCache } = useCache(); 

  const uid = currentUser?.uid || 'guest';
  const CONFIG_KEY = `exam_config_${examId}`; 
  const SESSION_KEY = `exam_progress_${uid}_${examId}`; 

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'EXAM' | 'RESULT'>('EXAM');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [config, setConfig] = useState<any>(null);
  
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(0); 
  const [examDuration, setExamDuration] = useState(0);
  const [savedQuestionIndices, setSavedQuestionIndices] = useState<Set<number>>(new Set());
  const [expiryTimestamp, setExpiryTimestamp] = useState<number | null>(null);
  
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'ALL' | 'CORRECT' | 'WRONG' | 'SKIPPED'>('ALL');
  
  const [rapidFireWrongAttempt, setRapidFireWrongAttempt] = useState<number | null>(null);
  const [isRapidFireCorrect, setIsRapidFireCorrect] = useState(false);

  const [showStreakModal, setShowStreakModal] = useState(false);
  const [streakData, setStreakData] = useState<{ streak: number, activityLog: string[] } | null>(null);
  const [clearedMistakesCount, setClearedMistakesCount] = useState(0);

  // Leaderboard State
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [userRank, setUserRank] = useState<number | null>(null);
  const ITEMS_PER_PAGE = 5;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View Mode State
  const [viewMode, setViewMode] = useState<'SINGLE_PAGE' | 'ALL_AT_ONCE'>('SINGLE_PAGE');

  // Guest Auth State
  const [guestExamInfo, setGuestExamInfo] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPassword, setGuestPassword] = useState('');
  const [guestName, setGuestName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const getFont = (text: string = '') => {
    const isBangla = /[\u0980-\u09FF]/.test(text);
    return isBangla ? questionFont : 'font-sans';
  };

  const renderStimulusBox = (q: QuizQuestion, idx: number, allQs: QuizQuestion[]) => {
    if (!q || (!q.contextText && !q.contextImage)) return null;
    
    // Check if this is the first question with this stimulus
    const isFirst = idx === 0 || 
        q.contextText !== allQs[idx-1]?.contextText || 
        q.contextImage !== allQs[idx-1]?.contextImage;
        
    if (!isFirst) return null;
    
    // Calculate range
    let endIdx = idx;
    for (let i = idx + 1; i < allQs.length; i++) {
        if (allQs[i].contextText === q.contextText && allQs[i].contextImage === q.contextImage) {
            endIdx = i;
        } else {
            break;
        }
    }
    
    const range = endIdx > idx ? { start: idx + 1, end: endIdx + 1 } : null;
    
    return (
        <div className="mb-4 bg-sky-50 dark:bg-sky-900/10 border-l-4 border-sky-400 p-4 md:p-6 rounded-r-3xl shadow-sm animate-in fade-in slide-in-from-left-2 duration-500">
            {range && (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-800 text-[12px] font-bold text-sky-600 dark:text-sky-300 uppercase tracking-wider mb-2">
                    <BookOpen size={10}/>
                    নিচের উদ্দীপকের আলোকে {range.start} নং থেকে {range.end} নং প্রশ্নের উত্তর দাও
                </div>
            )}
            {q.contextText && (
                <div className={`text-sm md:text-[17px] text-gray-800 dark:text-gray-200 leading-relaxed font-semibold mb-2 tex2jax_process ${getFont(q.contextText)}`}>
                    {q.contextText}
                </div>
            )}
            {q.contextImage && (
                <div className="mt-3 rounded-xl overflow-hidden border border-sky-100 dark:border-sky-800 bg-white dark:bg-black/20 p-1 md:p-2 shadow-inner">
                    <img src={q.contextImage} alt="Context" className="max-w-full h-auto max-h-[400px] mx-auto object-contain rounded-lg" />
                </div>
            )}
        </div>
    );
  };

  const getWeekDays = () => {
      const today = new Date();
      const todayStr = today.toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });
      const currentDay = today.getDay(); 
      const diff = currentDay === 6 ? 0 : -(currentDay + 1);
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() + diff);
      const days = [];
      const banglaDays = ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র'];
      for (let i = 0; i < 7; i++) {
          const d = new Date(startOfWeek);
          d.setDate(startOfWeek.getDate() + i);
          const dateStr = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });
          days.push({ name: banglaDays[i], date: dateStr, isToday: dateStr === todayStr });
      }
      return days;
  };

  // Sync viewMode with config
  useEffect(() => {
    if (config?.mode) {
      setViewMode(config.mode as 'SINGLE_PAGE' | 'ALL_AT_ONCE');
    }
  }, [config?.mode]);

  useEffect(() => {
    if (!examId) {
        navigate('/dashboard');
        return;
    }

    const initExam = async () => {
        setLoading(true);
        
        // If user is logged in, check for existing result
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
                logger.error("Failed to check exam status", e);
            }
        }

        const savedSession = localStorage.getItem(SESSION_KEY);
        const storedConfig = localStorage.getItem(CONFIG_KEY);

        // If no session/config, try fetching public exam
        if (!storedConfig && !savedSession) {
            try {
                const publicExam = await fetchPublicExam(examId);
                if (publicExam) {
                    // If guest, just show the landing page with info
                    if (!currentUser) {
                        setGuestExamInfo(publicExam);
                        setLoading(false);
                        return;
                    }

                    const newConfig = {
                        title: publicExam.title,
                        timeLimit: publicExam.duration,
                        totalMarks: publicExam.totalMarks,
                        negativeMarking: publicExam.negativeMarking,
                        mode: 'ALL_AT_ONCE',
                        type: 'PUBLIC_EXAM',
                        isPracticeMode: false
                    };
                    setConfig(newConfig);
                    
                    // Normalize questions to ensure correctAnswerIndex exists and _id is set
                    const normalizedQuestions = publicExam.questions.map((q: any) => ({
                        ...q,
                        correctAnswerIndex: q.correctAnswerIndex ?? q.correctAnswer,
                        _id: q._id || q.id // Ensure _id exists if id is present
                    }));
                    
                    setQuestions(normalizedQuestions);
                    setUserAnswers(new Array(normalizedQuestions.length).fill(null));
                    setCurrentQIndex(0);
                    
                    const seconds = publicExam.duration * 60;
                    setTimeLeft(seconds);
                    setExpiryTimestamp(Date.now() + (seconds * 1000));
                    setLoading(false);
                    return;
                }
            } catch (e) {
                logger.error("Failed to fetch public exam", e);
            }

            if (!currentUser) {
                // If failed to fetch public exam and no user, redirect
                showToast("এই এক্সাম আইডি পাওয়া যায়নি বা মেয়াদোত্তীর্ণ।", "error");
                navigate('/auth');
                return;
            }

            showToast("এই এক্সাম আইডি পাওয়া যায়নি বা মেয়াদোত্তীর্ণ।", "error");
            navigate('/dashboard');
            return;
        }

        if (savedSession) {
            const session = JSON.parse(savedSession);
            setConfig(session.config);
            setQuestions(session.questions);
            setUserAnswers(session.userAnswers);
            setCurrentQIndex(session.currentQIndex);
            // Don't rely solely on session for saved indices, we'll sync with DB
            setExamDuration(session.duration || 0);
            
            if (session.expiryTime) {
                setExpiryTimestamp(session.expiryTime);
                const remaining = Math.floor((session.expiryTime - Date.now()) / 1000);
                if (remaining <= 0) setTimeLeft(0); else setTimeLeft(remaining);
            } else {
                setTimeLeft(0); 
            }
            setLoading(false);
            return; 
        }

        if (storedConfig) {
            const parsedConfig = JSON.parse(storedConfig);
            setConfig(parsedConfig);
            let qs: QuizQuestion[] = [];
            if (parsedConfig.questions && parsedConfig.questions.length > 0) {
                qs = parsedConfig.questions;
            } else if (parsedConfig.type === 'PAST_PAPER' && parsedConfig.examRef) {
                try {
                    qs = await fetchQuestionsByExamRefAPI(parsedConfig.examRef);
                } catch (e) {
                    logger.error(e);
                    showToast("প্রশ্ন লোড করা যাচ্ছে না।", "error");
                    navigate('/dashboard');
                    return;
                }
            } else if (parsedConfig.type === 'CHAPTER_WISE') {
                try {
                    // Fetch papers to filter by source if provided
                    const allowedExamRefs = new Set<string>();
                    if (parsedConfig.source) {
                        const papers = await fetchQuestionPapersAPI();
                        papers
                            .filter(p => p.source === parsedConfig.source)
                            .forEach(p => allowedExamRefs.add(p.id));
                    }

                    // Fetch questions (mixed sources)
                    const rawQuestions = (await generateQuizFromDB({
                        subject: parsedConfig.subject,
                        chapter: parsedConfig.chapter,
                        topics: [],
                        count: 100 // Fetch more to allow filtering
                    })) as QuizQuestion[];

                    // Filter by source
                    if (parsedConfig.source && allowedExamRefs.size > 0) {
                        qs = rawQuestions.filter(q => q.examRef && allowedExamRefs.has(q.examRef));
                    } else {
                        qs = rawQuestions;
                    }
                    
                    // Limit to 20
                    qs = qs.slice(0, 20);
                    
                } catch (e) {
                    logger.error(e);
                    showToast("অধ্যায়ভিত্তিক প্রশ্ন লোড করা যাচ্ছে না।", "error");
                }
            }

            if (qs.length === 0) {
                showToast("কোনো প্রশ্ন পাওয়া যায়নি।", "warning");
                navigate('/dashboard');
                return;
            }

            if (parsedConfig.shuffle) {
                qs = qs.sort(() => 0.5 - Math.random());
            }

            setQuestions(qs);
            setUserAnswers(new Array(qs.length).fill(null));
            setCurrentQIndex(0);
            
            let expiry: number | null = null;
            if (parsedConfig.timeLimit > 0) {
                const seconds = parsedConfig.timeLimit * 60;
                setTimeLeft(seconds);
                expiry = Date.now() + (seconds * 1000);
                setExpiryTimestamp(expiry);
            } else {
                setTimeLeft(0);
            }
            setLoading(false);
        }
    };
    initExam();
  }, [examId, currentUser]); 

  // Sync Saved Questions from DB
  useEffect(() => {
      if (currentUser && questions.length > 0) {
          fetchSavedQuestionsAPI(currentUser.uid).then((savedQs: any[]) => {
              const savedIds = new Set(savedQs.map((sq: any) => {
                  // Handle populated questionId object
                  if (sq.questionId && typeof sq.questionId === 'object') {
                      return sq.questionId._id || sq.questionId.id;
                  }
                  // Handle string ID or direct object
                  return sq.questionId || sq.id || sq._id;
              }));
              
              const indices = new Set<number>();
              questions.forEach((q, index) => {
                  const qId = q._id || q.id;
                  if (qId && savedIds.has(qId)) {
                      indices.add(index);
                  }
              });
              setSavedQuestionIndices(indices);
          }).catch((err: any) => logger.error("Failed to sync saved questions", err));
      }
  }, [currentUser, questions]); 

  const handleGuestAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
        if (authMode === 'LOGIN') {
            await signInWithEmailAndPassword(auth, guestEmail, guestPassword);
        } else {
            const userCredential = await createUserWithEmailAndPassword(auth, guestEmail, guestPassword);
            await updateProfile(userCredential.user, {
                displayName: guestName,
                photoURL: "" 
            });
            await syncUserToMongoDB({
                ...userCredential.user,
                displayName: guestName,
                photoURL: ""
            }, { phoneNumber: "" });
        }
        // Auth state change will trigger useEffect to re-run initExam
    } catch (err: any) {
        logger.error(err);
        if (err.code === 'auth/invalid-credential') {
            setAuthError('ইমেইল বা পাসওয়ার্ড ভুল হয়েছে।');
        } else if (err.code === 'auth/email-already-in-use') {
            setAuthError('এই ইমেইল দিয়ে ইতিমধ্যে একাউন্ট খোলা আছে।');
        } else if (err.code === 'auth/weak-password') {
            setAuthError('পাসওয়ার্ড অত্যন্ত দুর্বল (অন্তত ৬ অক্ষর দিন)।');
        } else {
            setAuthError('লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
        }
    } finally {
        setAuthLoading(false);
    }
  };

  useEffect(() => {
      if (config?.mode) {
          setViewMode(config.mode);
      }
  }, [config]);

  useEffect(() => {
    if (!loading && questions.length > 0 && step === 'EXAM' && examId && currentUser) {
          const sessionData = {
              config, questions, userAnswers, currentQIndex,
              savedIndices: Array.from(savedQuestionIndices),
              expiryTime: expiryTimestamp, duration: examDuration
          };
          localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      }
  }, [userAnswers, currentQIndex, savedQuestionIndices, examDuration, questions, step, loading, expiryTimestamp, examId, currentUser]);

  // MathJax Effect - Robust polling to ensure rendering
  useEffect(() => {
    let attempts = 0;

    const intervalId = setInterval(() => {
      attempts++;
      const container = document.getElementById('exam-container');
      if (window.MathJax && window.MathJax.typesetPromise && container) {
        window.MathJax.typesetPromise([container])
          .then(() => {
            clearInterval(intervalId);
          })
          .catch((err: any) => logger.debug('MathJax typeset failed:', err));
      }
      if (attempts > 20) {
        clearInterval(intervalId);
      }
    }, 500);

    return () => clearInterval(intervalId);
  }, [loading, currentQIndex, step, reviewFilter, isRapidFireCorrect]);

  useEffect(() => {
    let interval: any;
    if (!loading && step === 'EXAM' && (!config?.isPracticeMode || config?.timeLimit > 0)) {
      interval = setInterval(() => {
        setExamDuration(prev => prev + 1);
        if (config?.timeLimit > 0) {
          if (expiryTimestamp) {
              const now = Date.now();
              const diff = Math.ceil((expiryTimestamp - now) / 1000);
              if (diff <= 0) {
                  setTimeLeft(0);
                  clearInterval(interval);
                  handleSubmitExam(true); 
              } else {
                  setTimeLeft(diff);
              }
          } else {
              setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading, step, config, expiryTimestamp]);

  useEffect(() => {
    if (step === 'RESULT' && examId && config?.type === 'PUBLIC_EXAM') {
      setLeaderboardLoading(true);
      fetchPublicExamLeaderboard(examId)
        .then((data: any[]) => {
            setLeaderboard(data);
            
            // Find user in fetched leaderboard
            const userIndex = data.findIndex(entry => 
                (entry.userId && entry.userId === currentUser?.uid)
            );

            if (userIndex !== -1) {
                setUserRank(userIndex + 1);
            } else {
                // If not in fetched list, try to fetch specific rank
                // We need the score. But score is calculated in render or handleSubmit.
                // We should probably store score in state or calculate it here.
                // But wait, score is not in state in ExamPage, it's calculated on the fly in render.
                // That's bad design in ExamPage, but I have to work with it.
                // Actually, handleSubmit calculates it.
                // Let's look at handleSubmit. It calculates score but doesn't set it to a state variable accessible here easily unless I add one.
                // Or I can recalculate it here.
                const correctCount = userAnswers.filter((ans, idx) => ans === questions[idx]?.correctAnswerIndex).length;
                const wrongCount = userAnswers.filter((ans, idx) => ans !== null && ans !== questions[idx]?.correctAnswerIndex).length;
                const negativeMark = config?.negativeMarking || 0;
                const rawScore = correctCount - (wrongCount * negativeMark);
                const finalScore = Math.max(0, rawScore);
                
                getUserRank(examId, finalScore, examDuration).then(rank => {
                    if (rank) setUserRank(rank);
                });
            }
        })
        .catch(err => logger.error(err))
        .finally(() => setLeaderboardLoading(false));
    }
  }, [step, examId, currentUser, config, userAnswers, questions, examDuration]);

  const handleOptionSelect = (qIndex: number, optionIndex: number) => {
      if (config?.mode === 'RAPID_FIRE') {
          if (isRapidFireCorrect) return; 
          const correctIndex = questions[qIndex].correctAnswerIndex;
          if (optionIndex === correctIndex) {
              setIsRapidFireCorrect(true);
              setRapidFireWrongAttempt(null);
              const newAns = [...userAnswers];
              newAns[qIndex] = optionIndex;
              setUserAnswers(newAns);
          } else {
              setRapidFireWrongAttempt(optionIndex);
              showToast("ভুল উত্তর, আবার চেষ্টা করুন!", "error");
          }
          return;
      }
      if (config?.isPracticeMode && userAnswers[qIndex] !== null) return;
      const newAns = [...userAnswers];
      newAns[qIndex] = optionIndex;
      setUserAnswers(newAns);
      if (config?.isPracticeMode && window.MathJax) {
          setTimeout(() => {
              const expBox = document.getElementById(`explanation-${qIndex}`);
              if (expBox) window.MathJax.typesetPromise([expBox]);
          }, 100);
      }
  };

  const handleRapidFireNext = () => {
      setIsRapidFireCorrect(false);
      setRapidFireWrongAttempt(null);
      if (currentQIndex < questions.length - 1) {
          setCurrentQIndex(prev => prev + 1);
      } else {
          handleSubmitExam();
      }
  };

  const toggleSaveQuestion = async (index: number) => {
    if (!currentUser) { showToast("লগইন প্রয়োজন", "warning"); return; }
    const q = questions[index];
    
    // Check if question has a valid ID
    const questionId = q._id || q.id;
    if (!questionId) {
        showToast("প্রশ্নটি সেভ করা যাচ্ছে না (ID নেই)", "error");
        return;
    }

    const isCurrentlySaved = savedQuestionIndices.has(index);
    
    // Optimistic Update
    setSavedQuestionIndices(prev => {
        const newSet = new Set(prev);
        if (isCurrentlySaved) {
            newSet.delete(index);
        } else {
            newSet.add(index);
        }
        return newSet;
    });

    try {
      if (isCurrentlySaved) {
        await unsaveQuestionAPI(currentUser.uid, questionId);
        showToast("বুকমার্ক রিমুভ করা হয়েছে", "info");
      } else {
        await saveQuestionAPI(currentUser.uid, questionId);
        updateQuestProgressAPI(currentUser.uid, 'SAVE_QUESTION', 1);
        showToast("প্রশ্নটি বুকমার্ক করা হয়েছে", "success");
      }
    } catch (_e) {
      // Revert on error
      setSavedQuestionIndices(prev => {
          const newSet = new Set(prev);
          if (isCurrentlySaved) {
              newSet.add(index);
          } else {
              newSet.delete(index);
          }
          return newSet;
      });
      showToast("বুকমার্ক আপডেট করা যায়নি", "error");
    }
  };

  const handleSubmitExam = async (autoSubmit = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
        const correctCount = userAnswers.filter((ans, idx) => ans === questions[idx]?.correctAnswerIndex).length;
        const wrongCount = userAnswers.filter((ans, idx) => ans !== null && ans !== questions[idx]?.correctAnswerIndex).length;
        const skippedCount = questions.length - (correctCount + wrongCount);
        const negativeMark = config?.negativeMarking || 0;
        const rawScore = correctCount - (wrongCount * negativeMark);
        const finalScore = Math.max(0, rawScore);
        const percentage = Math.round((finalScore / questions.length) * 100);

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
                examId: examId,
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
                config
            });

            // Save to Firebase Firestore for permanent persistence (strictly optimized to save space)
            try {
                await addDoc(collection(db, 'attempts'), {
                    userId: currentUser.uid,
                    examId: examId,
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
                        correctAnswerIndex: q.correctAnswerIndex ?? q.correctAnswer ?? 0
                    })),
                    config,
                    timestamp: submissionTimestamp
                });
            } catch (err) {
                logger.error("Failed to store attempt in Firebase Firestore:", err);
            }

            // If Public Exam, also save to public leaderboard
            if (config?.type === 'PUBLIC_EXAM') {
                const answersMap: Record<number, number> = {};
                userAnswers.forEach((ans, idx) => {
                    if (ans !== null) answersMap[idx] = ans;
                });

                await submitGuestExamResult(examId, {
                    name: currentUser.displayName || 'User',
                    email: currentUser.email || '',
                    phone: currentUser.phoneNumber || ''
                }, {
                    score: finalScore,
                    correct: correctCount,
                    wrong: wrongCount,
                    skipped: skippedCount,
                    total: questions.length,
                    answers: answersMap
                }, examDuration, currentUser.uid);
            }
            
            clearCache(`profile_${currentUser.uid}`);
            clearCache(`dashboard_${currentUser.uid}`);
            
            updateQuestProgressAPI(currentUser.uid, 'EXAM_COMPLETE', 1);
            if (percentage >= 80) updateQuestProgressAPI(currentUser.uid, 'HIGH_SCORE', 1);
            
            if (autoSubmit) showToast("সময় শেষ! অটো সাবমিট হয়েছে।", "info");

            if (config?.isMistakeRetake) {
                // @ts-ignore
                const solvedIds = questions.filter((q, i) => userAnswers[i] === q.correctAnswerIndex && q._id).map(q => q._id as string);
                if (solvedIds.length > 0) {
                    await clearMistakesAPI(currentUser.uid, solvedIds);
                    setClearedMistakesCount(solvedIds.length);
                    clearCache(`profile_${currentUser.uid}`);
                }
            }
        }
    } catch (_e) {
        logger.error(_e);
        showToast("সাবমিট করতে সমস্যা হয়েছে", "error");
    } finally {
        localStorage.removeItem(SESSION_KEY);
        setShowSubmitModal(false);
        setStep('RESULT');
        setIsSubmitting(false);
    }
  };

  const handleExit = () => {
      if (step === 'EXAM') {
          if (window.confirm("আপনি কি নিশ্চিত যে এক্সাম থেকে বের হতে চান?")) {
              localStorage.removeItem(SESSION_KEY);
              navigate(-1);
          }
      } else {
          navigate(-1);
      }
  };

  const handleRetake = () => {
      if (window.confirm("আবার পরীক্ষা দিতে চান?")) {
          localStorage.removeItem(SESSION_KEY);
          setStep('EXAM');
          setUserAnswers(new Array(questions.length).fill(null));
          setCurrentQIndex(0);
          setTimeLeft(config?.timeLimit ? config.timeLimit * 60 : 0);
          setExamDuration(0);
      }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    if (seconds === undefined || seconds === null) return '-';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const renderTimer = (isHeader = true) => {
    if (!config) return null;
    
    const isNoLimit = config?.timeLimit === 0;
    const time = isNoLimit ? examDuration : timeLeft;
    const totalSeconds = isNoLimit ? 3600 : config.timeLimit * 60; 
    const percentage = isNoLimit ? 100 : (timeLeft / totalSeconds) * 100;

    if (!isHeader) {
        return (
            <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100 dark:text-gray-700" />
                    <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="283" strokeDashoffset={283 - (percentage / 100) * 283} className={`${!isNoLimit && percentage <= 20 ? 'text-red-500' : 'text-primary'} transition-all duration-1000 ease-linear`} strokeLinecap="round" />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className={`font-mono font-black text-[12px] md:text-sm ${!isNoLimit && percentage <= 20 ? 'text-red-500 animate-pulse' : 'text-gray-800 dark:text-white'}`}>
                        {formatTime(time)}
                    </span>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-full px-3 py-1.5 border border-gray-100 dark:border-gray-600">
            <Clock size={14} className="text-gray-400" />
            <span className={`font-mono font-bold text-xs ${!isNoLimit && percentage <= 20 ? 'text-red-500 animate-pulse' : 'text-gray-700 dark:text-gray-300'}`}>
                {formatTime(time)}
            </span>
        </div>
    );
  };

  if (loading || isSubmitting) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-black">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="mt-6 text-sm font-bold text-gray-500 dark:text-gray-400 animate-pulse">
                {isSubmitting ? "ফলাফল সাবমিট হচ্ছে..." : "প্রশ্নপত্র লোড হচ্ছে..."}
            </p>
        </div>
      );
  }

  // --- GUEST LANDING VIEW ---
  if (!currentUser && guestExamInfo) {
      return (
          <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col items-center justify-center p-4">
              <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-zinc-800">
                  
                  {/* Minimal Header */}
                  <div className="bg-white dark:bg-zinc-900 p-6 pb-4 border-b border-gray-100 dark:border-zinc-800">
                      <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                          <Trophy size={14} /> Public Exam
                      </div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-1">
                          {guestExamInfo.title}
                      </h1>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                          {getDisplaySubject(guestExamInfo.subject)}
                      </p>

                      {/* Quick Stats Row */}
                      <div className="flex items-center gap-4 mt-4 text-xs font-medium text-gray-600 dark:text-gray-300">
                          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-2.5 py-1.5 rounded-lg">
                              <Clock size={14} className="text-primary" />
                              {guestExamInfo.duration} Min
                          </div>
                          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-2.5 py-1.5 rounded-lg">
                              <CheckCircle size={14} className="text-emerald-500" />
                              {guestExamInfo.totalMarks} Marks
                          </div>
                          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-2.5 py-1.5 rounded-lg">
                              <HelpCircle size={14} className="text-purple-700 dark:text-purple-400" />
                              {guestExamInfo.questions?.length || 0} Qs
                          </div>
                      </div>
                  </div>

                  {/* Auth Section */}
                  <div className="p-6 pt-6">
                      {/* Auth Tabs */}
                      <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-xl mb-6">
                          <button
                              onClick={() => setAuthMode('LOGIN')}
                              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${authMode === 'LOGIN' ? 'bg-white dark:bg-gray-600 text-primary shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                          >
                              লগইন
                          </button>
                          <button
                              onClick={() => setAuthMode('REGISTER')}
                              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${authMode === 'REGISTER' ? 'bg-white dark:bg-gray-600 text-primary shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                          >
                              রেজিস্ট্রেশন
                          </button>
                      </div>

                      {authError && (
                          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium rounded-lg flex items-center gap-2">
                              <AlertTriangle size={14} /> {authError}
                          </div>
                      )}

                      <form onSubmit={handleGuestAuth} className="space-y-3">
                          {authMode === 'REGISTER' && (
                              <>
                                  <div>
                                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 ml-1">আপনার নাম</label>
                                      <div className="relative">
                                          <User size={16} className="absolute left-3 top-3 text-gray-400" />
                                          <input
                                              type="text"
                                              required
                                              value={guestName}
                                              onChange={(e) => setGuestName(e.target.value)}
                                              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white text-sm transition-all"
                                              placeholder="সম্পূর্ণ নাম"
                                          />
                                      </div>
                                  </div>
                              </>
                          )}

                          <div>
                              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 ml-1">ইমেইল</label>
                              <div className="relative">
                                  <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                                  <input
                                      type="email"
                                      required
                                      value={guestEmail}
                                      onChange={(e) => setGuestEmail(e.target.value)}
                                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white text-sm transition-all"
                                      placeholder="example@mail.com"
                                  />
                              </div>
                          </div>

                          <div>
                              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 ml-1">পাসওয়ার্ড</label>
                              <div className="relative">
                                  <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                                  <input
                                      type="password"
                                      required
                                      value={guestPassword}
                                      onChange={(e) => setGuestPassword(e.target.value)}
                                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white text-sm transition-all"
                                      placeholder="******"
                                  />
                              </div>
                          </div>

                          <button
                              type="submit"
                              disabled={authLoading}
                              className="w-full bg-primary hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 active:scale-95 disabled:opacity-70 mt-4"
                          >
                              {authLoading ? <Loader2 size={18} className="animate-spin" /> : (authMode === 'LOGIN' ? 'শুরু করুন' : 'রেজিস্টার করুন')} <ArrowRight size={18} />
                          </button>
                      </form>
                      
                      <p className="text-[12px] text-center text-gray-400 mt-4">
                          এক্সাম শুরু করার মাধ্যমে আপনি আমাদের শর্তাবলীতে সম্মত হচ্ছেন।
                      </p>
                  </div>
              </div>
          </div>
      );
  }

  // --- EXAM VIEW ---
  if (step === 'EXAM') {
      const isRapidFire = config?.mode === 'RAPID_FIRE';
      
      // Safety check to prevent crash if questions are missing or index is out of bounds
      if (!questions || questions.length === 0 || !questions[currentQIndex]) {
          return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-black">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="mt-6 text-sm font-bold text-gray-500 dark:text-gray-400 animate-pulse">
                    প্রশ্নপত্র লোড হচ্ছে...
                </p>
            </div>
          );
      }

      const currentQ = questions[currentQIndex];
      
      // Calculate stimulus range for single page view
      let stimulusRange = null;
      if (currentQ.contextText || currentQ.contextImage) {
          let startIdx = currentQIndex;
          while (startIdx > 0 && 
                 questions[startIdx - 1].contextText === currentQ.contextText && 
                 questions[startIdx - 1].contextImage === currentQ.contextImage) {
              startIdx--;
          }
          let endIdx = currentQIndex;
          while (endIdx < questions.length - 1 && 
                 questions[endIdx + 1].contextText === currentQ.contextText && 
                 questions[endIdx + 1].contextImage === currentQ.contextImage) {
              endIdx++;
          }
          if (endIdx > startIdx) {
              stimulusRange = { start: startIdx + 1, end: endIdx + 1 };
          }
      }

      const isNoLimit = !config?.timeLimit || config?.timeLimit === 0;
      const totalSeconds = isNoLimit ? 0 : config.timeLimit * 60;
      const elapsedPercentage = isNoLimit 
          ? 0 
          : Math.min(100, Math.max(0, ((totalSeconds - timeLeft) / totalSeconds) * 100));

      const renderProgressIndicator = () => {
          if (questions.length < 30) {
              return (
                  <div className="flex gap-1.5 overflow-x-auto max-w-[180px] scrollbar-none items-center py-1">
                      {questions.map((_, i) => (
                          <button
                              key={i}
                              onClick={() => setCurrentQIndex(i)}
                              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 shrink-0 ${
                                  i === currentQIndex 
                                      ? 'bg-primary w-4' 
                                      : userAnswers[i] !== null 
                                          ? 'bg-primary/40' 
                                          : 'bg-gray-200 dark:bg-gray-750'
                              }`}
                          />
                      ))}
                  </div>
              );
          } else {
              return (
                  <div className="flex items-center gap-2">
                      <span className="text-[12px] font-bold text-gray-400 dark:text-gray-500 font-mono">
                          {toBengaliNumber(currentQIndex + 1)}/{toBengaliNumber(questions.length)}
                      </span>
                      <div className="w-16 h-1.5 bg-gray-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                          <div 
                              className="h-full bg-primary"
                              style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
                          />
                      </div>
                  </div>
              );
          }
      };

      const getExamTitle = () => {
          const subjects = Array.from(new Set(questions.map(q => q.subject).filter(Boolean))) as string[];
          const chapters = Array.from(new Set(questions.map(q => q.chapter).filter(Boolean))) as string[];
          
          const subjectsStr = subjects.map(s => getDisplaySubject(s)).join(', ');
          const chaptersStr = chapters.join(', ');
          
          if (viewMode === 'ALL_AT_ONCE') {
              if (config?.title && config.title !== 'Custom Exam' && config.title !== 'Exam') {
                  return config.title + (chaptersStr ? ` : ${chaptersStr}` : '');
              }
              return subjectsStr + (chaptersStr ? ` : ${chaptersStr}` : '') || 'যৌথ পরীক্ষা';
          } else {
              if (config?.title && config.title !== 'Custom Exam' && config.title !== 'Exam') {
                  return subjectsStr || config.title;
              }
              return subjectsStr || 'বিষয়ভিত্তিক পরীক্ষা';
          }
      };

      return (
        <div id="exam-container" className="h-full flex flex-col bg-slate-50/50 dark:bg-black transition-colors relative">
            {/* Linear Progress Bar Timer (Full Width at the very top) */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gray-100 dark:bg-gray-700 z-50 overflow-hidden">
                <motion.div 
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${elapsedPercentage}%` }}
                    transition={{ ease: 'linear', duration: 1 }}
                />
            </div>

            {/* Header */}
            <div className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 px-4 py-3 flex justify-between items-center sticky top-[2px] z-30 shadow-sm shrink-0">
                <div className="flex items-center gap-2.5 max-w-[50%]">
                    <button onClick={handleExit} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-550 dark:text-gray-400 transition-colors" title="Exit">
                        <X size={20}/>
                    </button>
                    <h1 className="text-sm font-bold text-gray-850 dark:text-gray-100 truncate" title={getExamTitle()}>
                        {getExamTitle()}
                    </h1>
                </div>

                <div className="flex items-center gap-2.5">
                    {!isRapidFire && (
                        <button 
                            onClick={() => setViewMode(prev => prev === 'SINGLE_PAGE' ? 'ALL_AT_ONCE' : 'SINGLE_PAGE')}
                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-700 text-[11px] font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-100 dark:border-gray-600"
                        >
                            {viewMode === 'SINGLE_PAGE' ? <LayoutList size={14}/> : <LayoutGrid size={14}/>}
                            {viewMode === 'SINGLE_PAGE' ? 'All View' : 'Single View'}
                        </button>
                    )}

                    {renderTimer(true)}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto w-full">
                <div className={`mx-auto p-4 md:p-8 flex flex-col min-h-full ${viewMode === 'ALL_AT_ONCE' ? 'max-w-5xl pb-32 md:pb-44' : 'max-w-3xl pb-24'}`}>
                    
                    {/* Compact/Subtle progress bar just to show reading index */}
                    {(viewMode === 'SINGLE_PAGE' || isRapidFire) && (
                        <div className="mb-4 h-[2px] bg-gray-105 dark:bg-zinc-900 rounded-full w-full overflow-hidden shrink-0">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
                                transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                                className={`h-full ${isRapidFire ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]' : 'bg-primary shadow-[0_0_8px_rgba(139,92,246,0.3)]'}`}
                            />
                        </div>
                    )}

                    {viewMode === 'SINGLE_PAGE' || isRapidFire ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full">
                            
                            {/* Question Card */}
                            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-gray-750 shadow-sm mb-6 relative overflow-hidden shrink-0 transition-all hover:shadow-md">
                                
                                {/* Stimulus Part (Softer Background) */}
                                {(currentQ.contextText || currentQ.contextImage) && (
                                    <div className="p-5 md:p-8 pb-0 bg-sky-50/50 dark:bg-sky-500/5 border-b border-gray-50 dark:border-zinc-800/50">
                                        {stimulusRange && (
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-900/40 text-[11px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-tighter mb-3">
                                                <BookOpen size={10}/> {toBengaliNumber(stimulusRange.start)} - {toBengaliNumber(stimulusRange.end)} নং প্রশ্নের উদ্দীপক
                                            </div>
                                        )}
                                        {currentQ.contextText && (
                                            <SafeHtml html={currentQ.contextText} className={`text-base md:text-[17px] text-gray-800 dark:text-gray-200 leading-relaxed font-semibold mb-3 tex2jax_process whitespace-pre-wrap ${getFont(currentQ.contextText)}`} />
                                        )}
                                        {currentQ.contextImage && (
                                            <div className="mb-4 rounded-xl overflow-hidden border border-white dark:border-sky-800/50 bg-white dark:bg-black/20 p-1 shadow-sm">
                                                <img src={currentQ.contextImage} alt="Context" className="max-w-full h-auto max-h-[300px] mx-auto object-contain rounded-lg" referrerPolicy="no-referrer" />
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="p-6 md:p-8">
                                    <div className="flex justify-between items-center mb-4">
                                        {/* Question number label (Reduced to text-base, styled like a tiny label) */}
                                        <div className="text-xs md:text-sm font-bold text-gray-400 dark:text-gray-500 font-mono tracking-wider">
                                            প্রশ্ন {toBengaliNumber(currentQIndex + 1)}/{toBengaliNumber(questions.length)}
                                        </div>

                                        {/* Bookmark button beside question */}
                                        <button 
                                            onClick={() => toggleSaveQuestion(currentQIndex)} 
                                            className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                                                savedQuestionIndices.has(currentQIndex) 
                                                    ? 'text-primary bg-purple-50 dark:bg-purple-950/20' 
                                                    : 'text-gray-400 hover:text-primary dark:text-gray-500'
                                            }`}
                                            title="Bookmark Question"
                                        >
                                            <Bookmark size={18} className={savedQuestionIndices.has(currentQIndex) ? 'fill-current' : ''} strokeWidth={2}/>
                                        </button>
                                    </div>

                                    {/* Question Text (the biggest thing on screen, text-xl to text-2xl) */}
                                    <h2 className={`text-[22px] md:text-3xl font-black text-gray-905 dark:text-gray-50 leading-snug tex2jax_process whitespace-pre-wrap ${getFont(currentQ.question)}`}>
                                        <SafeHtml html={currentQ.question} as="span" />
                                    </h2>

                                    {currentQ.questionImage && (
                                        <div className="mt-4 rounded-xl overflow-hidden border border-gray-50 dark:border-gray-750 bg-gray-50 dark:bg-black/50 p-2 shadow-inner">
                                            <img src={currentQ.questionImage} alt="Question" className="w-full max-h-[250px] object-contain rounded-lg mx-auto" referrerPolicy="no-referrer" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Options List */}
                            <div className="space-y-2 mb-24 mt-4">
                                {questions[currentQIndex].options.map((opt, idx) => {
                                    const isSelected = userAnswers[currentQIndex] === idx;
                                    const isPractice = config?.isPracticeMode;
                                    const isCorrect = idx === questions[currentQIndex].correctAnswerIndex;
                                    const optImage = questions[currentQIndex].optionsImages?.[idx];
                                    
                                    // Row wrapper classes base
                                    let rowClass = "w-full p-2.5 text-left flex items-center justify-between transition-all group cursor-pointer disabled:cursor-not-allowed rounded-xl border outline-none focus:outline-none focus:ring-0";
                                    // Circle container classes base
                                    let circleClass = "w-7 h-7 rounded-full flex items-center justify-center font-bold text-[12px] shrink-0 transition-all border select-none";

                                    if (isRapidFire) {
                                        if (isRapidFireCorrect && isCorrect) {
                                            rowClass += " bg-emerald-50 border-emerald-250 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-500/50 dark:text-emerald-400 font-medium";
                                            circleClass += " bg-emerald-500 border-emerald-400 text-white";
                                        } else if (rapidFireWrongAttempt === idx) {
                                            rowClass += " bg-red-50 border-red-253 text-red-700 dark:bg-red-950/20 dark:border-red-500/50 dark:text-red-400 font-medium";
                                            circleClass += " bg-red-500 border-red-400 text-white";
                                        } else {
                                            rowClass += " bg-slate-50 border-slate-100 text-slate-700 dark:bg-zinc-900/40 dark:border-zinc-800/80 dark:text-zinc-300 hover:border-slate-350 dark:hover:border-zinc-700";
                                            circleClass += " bg-white border-slate-200 text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-500";
                                        }
                                    } 
                                    else if (isPractice && userAnswers[currentQIndex] !== null) {
                                        if (isCorrect) {
                                            rowClass += " bg-emerald-50 border-emerald-250 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-500/50 dark:text-emerald-400 font-medium";
                                            circleClass += " bg-emerald-500 border-emerald-400 text-white";
                                        } else if (isSelected) {
                                            rowClass += " bg-red-50 border-red-253 text-red-700 dark:bg-red-950/20 dark:border-red-500/50 dark:text-red-400 font-medium";
                                            circleClass += " bg-red-500 border-red-400 text-white";
                                        } else {
                                            rowClass += " bg-slate-50/40 border-slate-100/40 opacity-40 grayscale text-slate-400 dark:bg-zinc-900/20 dark:border-zinc-800/40";
                                            circleClass += " bg-white border-slate-205 text-slate-400 dark:bg-zinc-805 dark:border-zinc-700";
                                        }
                                    } else {
                                        if (isSelected) {
                                            rowClass += " bg-purple-50 border-primary text-primary font-bold dark:bg-purple-950/10 dark:text-purple-400";
                                            circleClass += " bg-primary border-primary text-white";
                                        } else {
                                            rowClass += " bg-slate-50 border-slate-100 text-slate-700 dark:bg-zinc-900/40 dark:border-zinc-800/80 dark:text-zinc-300 hover:border-slate-350 dark:hover:border-zinc-700";
                                            circleClass += " bg-white border-slate-202 text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-500";
                                        }
                                    }

                                    return (
                                        <motion.button 
                                            key={idx}
                                            whileTap={{ scale: 0.99 }}
                                            onClick={() => handleOptionSelect(currentQIndex, idx)}
                                            disabled={(isPractice && userAnswers[currentQIndex] !== null && !isRapidFire) || isRapidFireCorrect}
                                            className={rowClass}
                                        >
                                            <div className="flex items-center gap-3 w-full">
                                                <div className={circleClass}>
                                                    {['ক','খ','গ','ঘ'][idx] || String.fromCharCode(65 + idx)}
                                                </div>
                                                <div className="flex-1 text-left min-w-0 pr-2">
                                                    {opt && <span className={`text-[15px] md:text-[17px] font-normal leading-relaxed tex2jax_process ${getFont(opt)}`}>{opt}</span>}
                                                    {optImage && <img src={optImage} alt={`Option ${idx}`} className="mt-2 max-h-20 rounded-lg object-contain border border-gray-100 bg-white dark:border-gray-755" />}
                                                </div>
                                            </div>
                                            {(isPractice && (userAnswers[currentQIndex] !== null || isRapidFire)) && (
                                                <div className="ml-2 shrink-0">
                                                    {(isCorrect && (userAnswers[currentQIndex] !== null || isRapidFireCorrect)) ? 
                                                        <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center"><Check size={14} strokeWidth={4}/></div> : 
                                                        ((isSelected || rapidFireWrongAttempt === idx) && <div className="w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center"><X size={14} strokeWidth={4}/></div>)
                                                    }
                                                </div>
                                            )}
                                        </motion.button>
                                    )
                                })}
                            </div>

                            {((config?.isPracticeMode && !isRapidFire && userAnswers[currentQIndex] !== null) || (isRapidFire && isRapidFireCorrect)) && (
                                <div id={`explanation-${currentQIndex}`} className="mb-24 p-6 md:p-8 bg-violet-50/50 dark:bg-violet-900/10 rounded-[2rem] border border-violet-100 dark:border-violet-800/50 animate-in slide-in-from-bottom-2 duration-500 overflow-hidden">
                                    <div className="flex items-center gap-2 mb-4 font-black text-violet-600 dark:text-violet-400 text-xs uppercase tracking-widest">
                                        <BookOpen size={16}/> Explanation
                                    </div>
                                    <p className={`text-base md:text-[17px] text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap tex2jax_process overflow-x-auto max-w-full break-words py-1 scrollbar-thin ${getFont(questions[currentQIndex].explanation)}`}>
                                        {questions[currentQIndex].explanation || "অফিসিয়াল ব্যাখ্যা পাওয়া যায়নি।"}
                                    </p>
                                    {questions[currentQIndex].explanationImage && (
                                        <div className="mt-4 rounded-xl overflow-hidden border border-violet-100 dark:border-violet-800/50 bg-white dark:bg-black/20 p-1">
                                            <img src={questions[currentQIndex].explanationImage} alt="Explanation" className="max-h-56 rounded-lg object-contain mx-auto" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {isRapidFire && isRapidFireCorrect && (
                                <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-white/80 dark:bg-black/80 backdrop-blur-md z-40 border-t border-gray-100 dark:border-zinc-800 animate-in slide-in-from-bottom-full duration-500">
                                    <div className="max-w-2xl mx-auto">
                                        <button 
                                            onClick={handleRapidFireNext}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-3xl font-black text-base flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95"
                                        >
                                            {currentQIndex < questions.length - 1 ? 'পরবর্তী প্রশ্ন' : 'ফলাফল দেখুন'} <ArrowRight size={22} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-6">
                            <div className="flex-1 space-y-8">
                                <div className="space-y-6">
                                    {questions.map((q, idx) => {
                                        const showSubjectHeader = idx > 0 && q.subject !== questions[idx - 1]?.subject;
                                        return (
                                            <React.Fragment key={idx}>
                                                {showSubjectHeader && q.subject && (
                                                    <div className="sticky top-[58px] z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md py-2.5 px-4 mb-4 rounded-xl border border-gray-100 dark:border-zinc-800 flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 shadow-sm">
                                                        <BookOpen size={14} className="text-primary" />
                                                        <span className="uppercase tracking-wider">বিষয়: {getDisplaySubject(q.subject)}</span>
                                                    </div>
                                                )}
                                                {renderStimulusBox(q, idx, questions)}
                                                <div id={`q-${idx}`} className="bg-white dark:bg-zinc-950 p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm scroll-mt-32">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex items-start gap-3 w-full">
                                                            <span className="font-bold text-gray-400 font-mono text-lg shrink-0 pt-0.5 leading-6 select-none">{String(idx+1).padStart(2,'0')}.</span>
                                                            <div className="flex-1 min-w-0 pt-0.5">
                                                                <h3 className={`font-semibold text-slate-905 dark:text-gray-50 text-[17px] md:text-[19px] leading-relaxed tex2jax_process ${getFont(q.question)}`}>
                                                                    <SafeHtml html={q.question} as="span" />
                                                                </h3>
                                                                {q.questionImage && (
                                                                    <div className="mt-4 rounded-xl overflow-hidden border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-gray-950 p-2 max-w-sm">
                                                                        <img src={q.questionImage} alt="Question" className="max-h-56 w-auto rounded object-contain mx-auto" referrerPolicy="no-referrer" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 shrink-0 ml-2">
                                                            <button onClick={() => toggleSaveQuestion(idx)} className={`p-1.5 rounded-lg transition-colors ${savedQuestionIndices.has(idx) ? 'text-primary bg-primary/10' : 'text-gray-400 hover:bg-gray-55 dark:hover:bg-gray-700'}`} title="Bookmark font">
                                                                <Bookmark size={18} className={savedQuestionIndices.has(idx) ? 'fill-primary' : ''}/>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2 mt-4">
                                                        {q.options.map((opt, oIdx) => {
                                                            const isSelected = userAnswers[idx] === oIdx;
                                                            const isPractice = config?.isPracticeMode;
                                                            const isCorrect = oIdx === q.correctAnswerIndex;
                                                            const optImage = q.optionsImages?.[oIdx];
                                                            
                                                            // Row wrapper classes base
                                                            let rowClass = "w-full p-2.5 text-left flex items-center justify-between transition-all group cursor-pointer disabled:cursor-not-allowed rounded-xl border outline-none focus:outline-none focus:ring-0";
                                                            // Circle container classes base
                                                            let circleClass = "w-7 h-7 rounded-full flex items-center justify-center font-bold text-[12px] shrink-0 transition-all border select-none";

                                                            if (isPractice && userAnswers[idx] !== null) {
                                                                if (isCorrect) {
                                                                    rowClass += " bg-emerald-50 border-emerald-250 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-500/50 dark:text-emerald-400 font-medium";
                                                                    circleClass += " bg-emerald-500 border-emerald-400 text-white";
                                                                } else if (isSelected) {
                                                                    rowClass += " bg-red-50 border-red-253 text-red-700 dark:bg-red-950/20 dark:border-red-500/50 dark:text-red-400 font-medium";
                                                                    circleClass += " bg-red-500 border-red-400 text-white";
                                                                } else {
                                                                    rowClass += " bg-slate-50/40 border-slate-100/40 opacity-40 grayscale text-slate-400 dark:bg-zinc-900/20 dark:border-zinc-800/40";
                                                                    circleClass += " bg-white border-slate-205 text-slate-400 dark:bg-zinc-805 dark:border-zinc-700";
                                                                }
                                                            } else {
                                                                if (isSelected) {
                                                                    rowClass += " bg-purple-50 border-primary text-primary font-bold dark:bg-purple-950/10 dark:text-purple-400";
                                                                    circleClass += " bg-primary border-primary text-white";
                                                                } else {
                                                                    rowClass += " bg-slate-50 border-slate-100 text-slate-700 dark:bg-zinc-900/40 dark:border-zinc-800/80 dark:text-zinc-300 hover:border-slate-350 dark:hover:border-zinc-700";
                                                                    circleClass += " bg-white border-slate-202 text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-500";
                                                                }
                                                            }

                                                            return (
                                                                <button 
                                                                    key={oIdx}
                                                                    onClick={() => handleOptionSelect(idx, oIdx)}
                                                                    disabled={isPractice && userAnswers[idx] !== null}
                                                                    className={rowClass}
                                                                >
                                                                    <div className="flex items-center gap-3 w-full">
                                                                        <div className={circleClass}>
                                                                            {['ক','খ','গ','ঘ'][oIdx] || String.fromCharCode(65 + oIdx)}
                                                                        </div>
                                                                        <div className="flex-1 text-left min-w-0 pr-2">
                                                                            {opt && <span className={`text-[15px] md:text-[17px] font-normal leading-relaxed tex2jax_process ${getFont(opt)}`}>{opt}</span>}
                                                                            {optImage && <img src={optImage} alt={`Option ${oIdx}`} className="mt-2 max-h-20 rounded-lg object-contain border border-gray-100 bg-white dark:border-gray-755" />}
                                                                        </div>
                                                                    </div>
                                                                    {(isPractice && userAnswers[idx] !== null) && (
                                                                        <div className="ml-2 shrink-0">
                                                                            {isCorrect ? 
                                                                                <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center"><Check size={14} strokeWidth={4}/></div> : 
                                                                                (isSelected && <div className="w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center"><X size={14} strokeWidth={4}/></div>)
                                                                            }
                                                                        </div>
                                                                    )}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            <div className="hidden lg:block w-72 shrink-0">
                                <div className="sticky top-24 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-4 shadow-sm max-h-[80vh] overflow-y-auto">
                                    <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-3 text-sm flex items-center gap-2"><LayoutGrid size={16}/> প্রশ্ন তালিকা</h3>
                                    <div className="grid grid-cols-5 gap-2 font-mono">
                                        {questions.map((_, i) => (
                                            <button 
                                                key={i} 
                                                onClick={() => document.getElementById(`q-${i}`)?.scrollIntoView({behavior: 'smooth'})}
                                                className={`h-8 rounded-lg text-xs font-bold transition-all ${userAnswers[i] !== null ? 'bg-primary text-white animate-pulse' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-250 dark:hover:bg-gray-650'}`}
                                            >
                                                {i+1}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {!isRapidFire && (
                <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-t border-gray-100 dark:border-zinc-800 p-2.5 md:p-4 z-40 transition-all">
                    <div className="max-w-3xl mx-auto flex justify-between items-center gap-3">
                        {viewMode === 'SINGLE_PAGE' ? (
                            <>
                                <button 
                                    onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                                    disabled={currentQIndex === 0}
                                    className="p-3 rounded-full border border-gray-100 dark:border-zinc-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-755 transition-all disabled:opacity-30 disabled:hover:bg-transparent shrink-0"
                                    title="পূর্ববর্তী"
                                >
                                    <ChevronLeft size={22} />
                                </button>
                                
                                <div className="flex-1 flex justify-center overflow-hidden">
                                    {renderProgressIndicator()}
                                </div>
                                
                                {currentQIndex === questions.length - 1 ? (
                                    <button 
                                        onClick={() => setShowSubmitModal(true)}
                                        className="py-3 px-5 sm:px-6 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-black shadow-md transition-all text-sm md:text-base active:scale-95 shrink-0"
                                    >
                                        পরীক্ষা শেষ করুন
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => setCurrentQIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                        className="py-3 px-5 sm:px-6 bg-primary hover:bg-purple-600 text-white rounded-full font-black shadow-md transition-all text-sm md:text-base flex items-center justify-center gap-1 shrink-0 active:scale-95"
                                    >
                                        <span>পরবর্তী</span>
                                        <ChevronRight size={18} />
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="flex w-full gap-3">
                                <button onClick={() => setShowMobileNav(true)} className="lg:hidden p-3.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-2xl border border-gray-200/40 dark:border-gray-600 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 shrink-0">
                                    <LayoutGrid size={20}/>
                                </button>
                                <button 
                                    onClick={() => setShowSubmitModal(true)}
                                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all text-sm md:text-base active:scale-95 text-center leading-none tracking-wide"
                                >
                                    Submit
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showMobileNav && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={() => setShowMobileNav(false)}>
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-10" onClick={e => e.stopPropagation()}>
                        <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto">
                            {questions.map((_, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => {
                                        document.getElementById(`q-${i}`)?.scrollIntoView({behavior: 'smooth'});
                                        setShowMobileNav(false);
                                    }}
                                    className={`h-10 rounded-lg text-xs font-bold transition-all ${userAnswers[i] !== null ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}
                                >
                                    {i+1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {showSubmitModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-zinc-800 animate-in zoom-in-95">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HelpCircle size={32}/>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">এক্সাম শেষ করবেন?</h3>
                            <p className="text-gray-500 text-sm">
                                আপনি {questions.length} টির মধ্যে {userAnswers.filter(a => a !== null).length} টি প্রশ্নের উত্তর দিয়েছেন।
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowSubmitModal(false)} className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm">না, ফিরে যাব</button>
                            <button onClick={() => handleSubmitExam()} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-sm shadow-lg hover:bg-red-700">হ্যাঁ, সাবমিট</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      );
  }

  // --- STREAK CELEBRATION MODAL ---
  if (showStreakModal && streakData) {
      const weekDays = getWeekDays();
      
      return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-500">
              <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden text-center animate-in zoom-in-95 duration-500">
                  <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-100 to-transparent dark:from-purple-900/20 dark:to-transparent pointer-events-none"></div>
                  
                  <div className="relative z-10">
                      <div className="w-32 h-32 mx-auto mb-4">
                          <Confetti /> {/* Confetti fallback if Lottie breaks */}
                          <Flame size={80} className="text-purple-700 dark:text-purple-400 fill-purple-500 mx-auto animate-pulse" />
                      </div>
                      
                      <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
                          {streakData.streak} <span className="text-2xl font-bold text-purple-700 dark:text-purple-400">Days</span>
                      </h2>
                      <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-8">
                          Streak on Fire! 🔥
                      </p>

                      <div className="bg-gray-50 dark:bg-black rounded-2xl p-4 border border-gray-100 dark:border-zinc-800 mb-8">
                          <div className="flex justify-between items-center">
                              {weekDays.map((day, idx) => {
                                  const isActive = streakData.activityLog.includes(day.date);
                                  const isToday = day.isToday;
                                  
                                  return (
                                      <div key={idx} className="flex flex-col items-center gap-2">
                                          <span className={`text-[12px] font-bold ${isToday ? 'text-purple-700 dark:text-purple-400' : 'text-gray-400'}`}>{day.name}</span>
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 ${
                                              isActive 
                                              ? 'bg-purple-500 border-purple-500 text-white shadow-md shadow-purple-500/30 scale-110' 
                                              : isToday 
                                                  ? 'border-dashed border-purple-200 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-900/10 text-purple-200' 
                                                  : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-300'
                                          }`}>
                                              {isActive ? (
                                                  <Check size={18} strokeWidth={4} className="text-white"/>
                                              ) : isToday ? (
                                                  <div className="relative flex items-center justify-center">
                                                      <CheckCircle size={22} className="text-purple-700 dark:text-purple-400/30" strokeWidth={2} />
                                                      <Check size={12} className="absolute text-purple-700 dark:text-purple-400/20" strokeWidth={4} />
                                                  </div>
                                              ) : (
                                                  ''
                                              )}
                                          </div>
                                      </div>
                                  )
                              })}
                          </div>
                      </div>

                      <button 
                          onClick={() => setShowStreakModal(false)}
                          className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl shadow-xl transition-transform active:scale-95 flex items-center justify-center gap-2"
                      >
                          ফলাফল দেখুন <ArrowRight size={18}/>
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  // --- RESULT VIEW ---
  if (step === 'RESULT') {
      const isRapidFire = config?.mode === 'RAPID_FIRE';
      const resultQuestions = questions as QuizQuestion[];

      // Leaderboard Pagination Logic
      const paginatedLeaderboard = leaderboard.slice((leaderboardPage - 1) * ITEMS_PER_PAGE, leaderboardPage * ITEMS_PER_PAGE);
      const totalPages = Math.ceil(leaderboard.length / ITEMS_PER_PAGE);
      const isUserInView = paginatedLeaderboard.some(entry => 
          (entry.userId && entry.userId === currentUser?.uid)
      );

      if (isRapidFire) {
          return (
            <div className="h-full overflow-y-auto bg-gray-50 dark:bg-black p-4 md:p-8 transition-colors">
                <div className="max-w-3xl mx-auto space-y-8 pb-20">
                    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-200 dark:border-zinc-800 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mt-20"></div>
                        
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-32 h-32 mb-6">
                                <Layers size={80} className="text-indigo-500 fill-indigo-200 animate-pulse mx-auto" />
                            </div>
                            <h1 className="text-2xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">
                                অভিনন্দন! ✨
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm md:text-base max-w-md mx-auto mb-8">
                                আপনি সফলভাবে {resultQuestions.length} টি প্রশ্নের সবগুলো সঠিক উত্তর দিয়ে ফ্ল্যাশ কার্ড রিভিশন শেষ করেছেন।
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                                <button onClick={handleRetake} className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2">
                                    <RefreshCw size={18}/> আবার প্র্যাকটিস করুন
                                </button>
                                <button onClick={() => navigate('/dashboard')} className="px-8 py-3.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2">
                                    <Home size={18}/> ড্যাশবোর্ড
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-extrabold text-gray-900 dark:text-white text-lg px-2">প্রশ্নগুলোর ওভারভিউ</h3>
                        {resultQuestions.map((q, idx) => (
                            <div key={idx} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                                <div className="flex gap-4">
                                    <span className="font-bold text-gray-300 font-mono">{String(idx+1).padStart(2,'0')}</span>
                                    <div className="flex-1">
                                        <h3 className={`font-bold text-gray-800 dark:text-gray-200 text-sm mb-2 tex2jax_process ${getFont(q.question)}`}>{q.question}</h3>
                                        {q.questionImage && <img src={q.questionImage} alt="Question" className="max-h-24 rounded object-contain mb-2 border border-gray-100 dark:border-zinc-800" />}
                                        <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 rounded-lg">
                                            <p className={`text-xs text-green-700 dark:text-green-400 font-bold flex items-center gap-2 tex2jax_process ${getFont(q.options[q.correctAnswerIndex])}`}>
                                                <CheckCircle size={14}/> {q.options[q.correctAnswerIndex]}
                                            </p>
                                            {q.optionsImages?.[q.correctAnswerIndex] && <img src={q.optionsImages[q.correctAnswerIndex]} alt="Answer" className="mt-1 max-h-16 rounded object-contain" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          );
      }

      const correctCount = userAnswers.filter((ans, idx) => ans === resultQuestions[idx]?.correctAnswerIndex).length;
      const wrongCount = userAnswers.filter((ans, idx) => ans !== null && ans !== resultQuestions[idx]?.correctAnswerIndex).length;
      const skippedCount = resultQuestions.length - (correctCount + wrongCount);
      const negativeMark = config?.negativeMarking || 0;
      const rawScore = correctCount - (wrongCount * negativeMark);
      const finalScore = Math.max(0, rawScore);
      const percentage = Math.round((finalScore / resultQuestions.length) * 100);

      const correctP = (correctCount / resultQuestions.length) * 100;
      const wrongP = (wrongCount / resultQuestions.length) * 100;

      const filteredQuestions = resultQuestions.map((q, idx) => ({ q, idx })).filter(({ q, idx }) => {
        if (reviewFilter === 'CORRECT') return userAnswers[idx] === q.correctAnswerIndex;
        if (reviewFilter === 'WRONG') return userAnswers[idx] !== null && userAnswers[idx] !== q.correctAnswerIndex;
        if (reviewFilter === 'SKIPPED') return userAnswers[idx] === null;
        return true;
      });

      return (
        <div id="exam-container" className="h-full overflow-y-auto bg-gray-50 dark:bg-black p-4 md:p-8 transition-colors">
            <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 pb-20">
                {clearedMistakesCount > 0 && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800 text-center mb-6 animate-in zoom-in relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-800/50 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600 dark:text-emerald-300">
                                <CheckCircle size={24} strokeWidth={3} />
                            </div>
                            <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mb-2">
                                অভিনন্দন!
                            </h3>
                            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                আপনি সফলভাবে <span className="font-black text-lg bg-white dark:bg-emerald-900 px-2 rounded mx-1 shadow-sm">{clearedMistakesCount}</span> টি ভুল প্রশ্ন শুধরে নিয়েছেন। <br/>এগুলো আপনার ভুলের তালিকা থেকে মুছে ফেলা হয়েছে।
                            </p>
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-gray-200 dark:border-zinc-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-20 -mt-20"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="text-center md:text-left space-y-2 flex-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold uppercase tracking-wider mb-2">
                                <Trophy size={14}/> Exam Result
                            </div>
                            <h1 className="text-3xl md:text-6xl font-black text-gray-900 dark:text-white">
                                {finalScore.toFixed(2)} <span className="text-lg md:text-3xl text-gray-400 font-bold">/ {resultQuestions.length}</span>
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">
                                {percentage >= 80 ? "অসাধারণ পারফরম্যান্স! 🎉" : percentage >= 50 ? "ভালো হয়েছে, আরও প্র্যাকটিস প্রয়োজন। 👍" : "হতাশ হবেন না, আবার চেষ্টা করুন। 💪"}
                            </p>
                            
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
                                <div className="px-4 py-3 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800 min-w-[100px]">
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{correctCount}</p>
                                    <p className="text-xs font-bold text-green-700/60 dark:text-green-300/60 uppercase">Correct</p>
                                </div>
                                <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800 min-w-[100px]">
                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{wrongCount}</p>
                                    <p className="text-xs font-bold text-red-700/60 dark:text-red-300/60 uppercase">Wrong</p>
                                </div>
                                <div className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600 min-w-[100px]">
                                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">{skippedCount}</p>
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Skipped</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative w-40 h-40 md:w-56 md:h-56 shrink-0">
                            <div 
                                className="w-full h-full rounded-full shadow-inner"
                                style={{
                                    background: `conic-gradient(
                                        #10B981 0% ${correctP}%, 
                                        #EF4444 ${correctP}% ${correctP + wrongP}%, 
                                        #8b5cf6 ${correctP + wrongP}% 100%
                                    )`
                                }}
                            ></div>
                            <div className="absolute inset-4 bg-white dark:bg-zinc-900 rounded-full flex flex-col items-center justify-center shadow-sm">
                                <span className="text-2xl md:text-5xl font-black text-gray-900 dark:text-white">{percentage}%</span>
                                <span className="text-[9px] md:text-[12px] font-bold text-gray-400 uppercase tracking-widest">Accuracy</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-8 border-t border-gray-100 dark:border-zinc-800">
                        <button onClick={handleRetake} className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 font-bold text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2 text-sm">
                            <RefreshCw size={18}/> আবার পরীক্ষা দিন
                        </button>
                        <button onClick={() => navigate('/dashboard')} className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:bg-purple-700 flex items-center justify-center gap-2 text-sm shadow-lg shadow-purple-200 dark:shadow-none">
                            <Home size={18}/> ড্যাশবোর্ড
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Leaderboard Section - Only for Public Exams */}
                    {config?.type === 'PUBLIC_EXAM' && (
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-zinc-800">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-600 dark:text-yellow-400">
                                    <Trophy size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Merit List</h2>
                            </div>

                            {leaderboardLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="animate-spin text-primary" size={32} />
                                </div>
                            ) : leaderboard.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No attempts yet. Be the first!
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-gray-100 dark:border-zinc-800">
                                                    <th className="py-2 px-3 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
                                                    <th className="py-2 px-3 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                                    <th className="py-2 px-3 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Score</th>
                                                    <th className="py-2 px-3 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Correct</th>
                                                    <th className="py-2 px-3 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Wrong</th>
                                                    <th className="py-2 px-3 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Time</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                                {paginatedLeaderboard.map((entry, index) => {
                                                    const rank = (leaderboardPage - 1) * ITEMS_PER_PAGE + index + 1;
                                                    const name = entry.name || entry.guestInfo?.name || 'Anonymous';
                                                    const score = entry.score !== undefined ? entry.score : entry.result?.score;
                                                    const correct = entry.correct !== undefined ? entry.correct : entry.result?.correct;
                                                    const wrong = entry.wrong !== undefined ? entry.wrong : entry.result?.wrong;
                                                    const timeTaken = entry.timeTaken;
                                                    
                                                    const isCurrentUser = (entry.userId && entry.userId === currentUser?.uid);

                                                    return (
                                                        <tr key={entry.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${isCurrentUser ? 'bg-purple-50 dark:bg-purple-900/20' : ''}`}>
                                                            <td className="py-2 px-3">
                                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[12px] font-bold ${
                                                                    rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                                                                    rank === 2 ? 'bg-gray-200 text-gray-700' :
                                                                    rank === 3 ? 'bg-purple-100 text-purple-700' :
                                                                    'text-gray-500'
                                                                }`}>
                                                                    {rank}
                                                                </div>
                                                            </td>
                                                            <td className="py-2 px-3">
                                                                <div className="font-medium text-xs text-gray-900 dark:text-white truncate max-w-[120px]">
                                                                    {name}
                                                                    {isCurrentUser && <span className="ml-1 text-[9px] bg-purple-100 text-purple-700 dark:text-purple-400 px-1 py-0.5 rounded font-bold">YOU</span>}
                                                                </div>
                                                            </td>
                                                            <td className="py-2 px-3 text-center font-bold text-xs text-gray-900 dark:text-white">
                                                                {score}
                                                            </td>
                                                            <td className="py-2 px-3 text-center text-green-600 font-medium text-xs">
                                                                {correct}
                                                            </td>
                                                            <td className="py-2 px-3 text-center text-red-500 font-medium text-xs">
                                                                {wrong}
                                                            </td>
                                                            <td className="py-2 px-3 text-right text-gray-500 text-[12px] font-mono">
                                                                {formatDuration(timeTaken)}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}

                                                {!isUserInView && userRank && (
                                                    <>
                                                        <tr className="border-t-2 border-dashed border-gray-200 dark:border-zinc-800">
                                                            <td colSpan={6} className="py-1 text-center text-[12px] text-gray-400">...</td>
                                                        </tr>
                                                        <tr className="bg-purple-50 dark:bg-purple-900/20 border-t border-purple-100 dark:border-purple-800">
                                                            <td className="py-2 px-3">
                                                                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[12px] font-bold text-purple-700 dark:text-purple-400 bg-purple-100">
                                                                    {userRank}
                                                                </div>
                                                            </td>
                                                            <td className="py-2 px-3">
                                                                <div className="font-medium text-xs text-gray-900 dark:text-white truncate max-w-[120px]">
                                                                    {currentUser?.displayName || 'Anonymous'}
                                                                    <span className="ml-1 text-[9px] bg-purple-100 text-purple-700 dark:text-purple-400 px-1 py-0.5 rounded font-bold">YOU</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-2 px-3 text-center font-bold text-xs text-gray-900 dark:text-white">
                                                                {finalScore}
                                                            </td>
                                                            <td className="py-2 px-3 text-center text-green-600 font-medium text-xs">
                                                                {correctCount}
                                                            </td>
                                                            <td className="py-2 px-3 text-center text-red-500 font-medium text-xs">
                                                                {wrongCount}
                                                            </td>
                                                            <td className="py-2 px-3 text-right text-gray-500 text-[12px] font-mono">
                                                                {formatDuration(examDuration)}
                                                            </td>
                                                        </tr>
                                                    </>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-zinc-800">
                                            <button
                                                onClick={() => setLeaderboardPage(p => Math.max(1, p - 1))}
                                                disabled={leaderboardPage === 1}
                                                className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Previous
                                            </button>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                Page {leaderboardPage} of {totalPages}
                                            </span>
                                            <button
                                                onClick={() => setLeaderboardPage(p => Math.min(totalPages, p + 1))}
                                                disabled={leaderboardPage === totalPages}
                                                className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {(['ALL', 'CORRECT', 'WRONG', 'SKIPPED'] as const).map(filter => (
                            <button
                                key={filter}
                                onClick={() => setReviewFilter(filter)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${reviewFilter === filter ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'bg-white dark:bg-zinc-900 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-zinc-800'}`}
                            >
                                {filter === 'ALL' ? 'সব প্রশ্ন' : filter} ({
                                    filter === 'CORRECT' ? correctCount : filter === 'WRONG' ? wrongCount : filter === 'SKIPPED' ? skippedCount : resultQuestions.length
                                })
                            </button>
                        ))}
                    </div>

                    {filteredQuestions.map(({q, idx}) => {
                        const userAnswer = userAnswers[idx];
                        const isCorrect = userAnswer === q.correctAnswerIndex;
                        const isSkipped = userAnswer === null;
                        
                        return (
                            <React.Fragment key={idx}>
                                {renderStimulusBox(q, idx, resultQuestions)}
                                <div className={`bg-white dark:bg-zinc-950 p-5 md:p-6 rounded-2xl border ${isCorrect ? 'border-emerald-250 dark:border-emerald-805/50' : isSkipped ? 'border-gray-200 dark:border-zinc-800/80' : 'border-rose-253 dark:border-red-500/30'} shadow-sm relative group`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-start gap-3 w-full">
                                            <span className="font-bold text-gray-400 font-mono text-lg shrink-0 pt-0.5 leading-6 select-none">{String(idx+1).padStart(2,'0')}.</span>
                                            <div className="flex-1 min-w-0 pt-0.5">
                                                <h3 className={`font-semibold text-slate-905 dark:text-gray-50 text-[17px] md:text-[19px] leading-relaxed tex2jax_process ${getFont(q.question)}`}>
                                                    <SafeHtml html={q.question} as="span" />
                                                </h3>
                                                {q.questionImage && (
                                                    <div className="mt-4 rounded-xl overflow-hidden border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-gray-950 p-2 max-w-sm">
                                                        <img src={q.questionImage} alt="Question" className="max-h-56 w-auto rounded object-contain mx-auto" referrerPolicy="no-referrer" />
                                                    </div>
                                                )}
                                                
                                                {/* Tags list */}
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {q.chapter && (
                                                        <span className="bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-lg text-[11px] font-bold border border-purple-100/50 dark:border-purple-900/30">
                                                            {q.chapter}
                                                        </span>
                                                    )}
                                                    {q.subject && (
                                                        <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-lg text-[11px] font-bold border border-blue-100/50 dark:border-blue-800/30">
                                                            {getDisplaySubject(q.subject)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 shrink-0 ml-2">
                                            <button onClick={() => toggleSaveQuestion(idx)} className={`p-1.5 rounded-lg transition-colors ${savedQuestionIndices.has(idx) ? 'text-primary bg-primary/10' : 'text-gray-400 hover:bg-gray-55 dark:hover:bg-gray-700'}`} title="Bookmark text">
                                                <Bookmark size={18} className={savedQuestionIndices.has(idx) ? 'fill-primary text-primary' : ''}/>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mt-4">
                                        {q.options.map((opt, oIdx) => {
                                            const isCorrectAnswer = oIdx === q.correctAnswerIndex;
                                            const isUserChoice = userAnswer === oIdx;

                                            let optionStyle = "";
                                            let iconStyle = "";

                                            if (isCorrectAnswer) {
                                                optionStyle = "bg-emerald-50 border-emerald-250 text-emerald-700 dark:bg-emerald-950/15 dark:border-emerald-500/30 dark:text-emerald-400 font-medium";
                                                iconStyle = "bg-emerald-500 border-emerald-400 text-white";
                                            } else if (isUserChoice) {
                                                optionStyle = "bg-red-50 border-red-253 text-red-700 dark:bg-red-950/15 dark:border-red-500/30 dark:text-red-400 font-medium";
                                                iconStyle = "bg-red-500 border-red-400 text-white";
                                            } else {
                                                if (userAnswer !== null) {
                                                    optionStyle = "bg-slate-50/40 border-slate-100/40 opacity-40 grayscale text-slate-400 dark:bg-zinc-900/10 dark:border-zinc-800/20";
                                                    iconStyle = "bg-white border-slate-205 text-slate-405 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-500";
                                                } else {
                                                    optionStyle = "bg-slate-50 border-slate-100 text-slate-705 dark:bg-zinc-900/40 dark:border-zinc-800/80 dark:text-zinc-300";
                                                    iconStyle = "bg-white border-slate-202 text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-500";
                                                }
                                            }

                                            return (
                                                <div 
                                                    key={oIdx} 
                                                    className={`w-full p-2.5 text-left flex items-center justify-between transition-all rounded-xl border outline-none ${optionStyle}`}
                                                >
                                                    <div className="flex items-center gap-3 w-full min-w-0">
                                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[12px] shrink-0 transition-all border select-none ${iconStyle}`}>
                                                            {['ক','খ','গ','ঘ'][oIdx] || String.fromCharCode(65 + oIdx)}
                                                        </div>
                                                        <div className="flex-1 text-left min-w-0 pr-2">
                                                            {opt && <span className={`text-[15px] md:text-[17px] font-normal leading-relaxed tex2jax_process ${getFont(opt)}`}>{opt}</span>}
                                                            {q.optionsImages?.[oIdx] && <img src={q.optionsImages[oIdx]} alt={`Option ${oIdx}`} className="mt-2 max-h-20 rounded-lg object-contain border border-gray-100 bg-white dark:border-gray-755 shadow-sm" />}
                                                        </div>
                                                    </div>
                                                    {isCorrectAnswer && (
                                                        <div className="shrink-0 ml-2">
                                                            <div className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                                                                <Check size={12} strokeWidth={4}/>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {!isCorrectAnswer && isUserChoice && (
                                                        <div className="shrink-0 ml-2">
                                                            <div className="w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center">
                                                                <X size={12} strokeWidth={4}/>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {q.explanation && (
                                        <div className="mt-5 p-5 md:p-6 bg-violet-50/40 dark:bg-violet-950/10 rounded-2xl border border-violet-100 dark:border-violet-900/30">
                                            <div className="flex items-center gap-2 mb-3 font-extrabold text-violet-600 dark:text-violet-400 text-[11px] uppercase tracking-widest">
                                                <BookOpen size={14}/> ব্যাখ্যা
                                            </div>
                                            <p className={`text-[15px] md:text-[17px] text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap tex2jax_process overflow-x-auto max-w-full break-words py-1 scrollbar-thin ${getFont(q.explanation)}`}>
                                                {q.explanation}
                                            </p>
                                            {q.explanationImage && (
                                                <div className="mt-3 rounded-xl overflow-hidden border border-violet-100/50 dark:border-violet-900/20 bg-white dark:bg-black/20 p-1.5 max-w-md">
                                                    <img src={q.explanationImage} alt="Explanation" className="max-h-56 rounded-lg object-contain mx-auto" referrerPolicy="no-referrer" />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </React.Fragment>
                        )
                    })}
                </div>
            </div>
        </div>
      );
  }

  return null;
};

export default ExamPage;
