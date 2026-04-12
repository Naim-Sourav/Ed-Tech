
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import { saveExamResultAPI, updateQuestProgressAPI, saveQuestionAPI, unsaveQuestionAPI, fetchQuestionsByExamRefAPI, recordUserActivityAPI, clearMistakesAPI, fetchExamResultAPI, generateQuizFromDB, fetchQuestionPapersAPI, syncUserToMongoDB, fetchSavedQuestionsAPI } from '../services/api';
import { fetchPublicExamLeaderboard, getUserRank, submitGuestExamResult, fetchPublicExam } from '../services/publicExamService';
import { 
  Clock, ChevronRight, CheckCircle, XCircle,
  BookOpen, Bookmark, LayoutGrid, HelpCircle, 
  Trophy, RefreshCw, Home, LayoutList, X, Flame, ArrowRight, Check, AlertTriangle, Loader2,
  User, Mail, Lock
} from 'lucide-react';
import { QuizQuestion } from '../types';
import { useCache } from '../contexts/CacheContext';
import Confetti from './Confetti'; // Use existing confetti instead of Lottie to be safe
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../services/firebase';

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
    return isBangla ? 'font-tiro' : 'font-sans';
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
                console.error("Failed to check exam status", e);
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
                console.error("Failed to fetch public exam", e);
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
                    console.error(e);
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
                    console.error(e);
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
          }).catch((err: any) => console.error("Failed to sync saved questions", err));
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
        console.error(err);
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
          .catch((err: any) => console.log('MathJax typeset failed:', err));
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
        .catch(err => console.error(err))
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
        console.error(_e);
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

  const renderTimer = () => {
    if (!config) return null;
    
    if (config?.timeLimit === 0) {
       return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
            <Clock size={16} /> {formatTime(examDuration)}
          </div>
       );
    }
    const totalSeconds = config.timeLimit * 60;
    const percentage = (timeLeft / totalSeconds) * 100;
    
    return (
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700/50 rounded-full px-3 py-1 border border-gray-200 dark:border-gray-600">
            <div className="relative w-4 h-4">
                 <svg className="w-full h-full transform -rotate-90">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-gray-300 dark:text-gray-600" />
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" fill="transparent" strokeDasharray={44} strokeDashoffset={44 - (percentage / 100) * 44} className={`${percentage <= 20 ? 'text-red-500' : percentage <= 50 ? 'text-orange-500' : 'text-orange-600'} transition-all duration-1000 ease-linear`} strokeLinecap="round" />
                </svg>
            </div>
            <span className={`font-mono font-bold text-xs ${percentage <= 20 ? 'text-red-500 animate-pulse' : 'text-gray-700 dark:text-gray-300'}`}>
                {formatTime(timeLeft)}
            </span>
        </div>
    );
  };

  if (loading || isSubmitting) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
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
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
              <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                  
                  {/* Minimal Header */}
                  <div className="bg-white dark:bg-gray-800 p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
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
                              <HelpCircle size={14} className="text-orange-500" />
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
                              className="w-full bg-primary hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-70 mt-4"
                          >
                              {authLoading ? <Loader2 size={18} className="animate-spin" /> : (authMode === 'LOGIN' ? 'শুরু করুন' : 'রেজিস্টার করুন')} <ArrowRight size={18} />
                          </button>
                      </form>
                      
                      <p className="text-[10px] text-center text-gray-400 mt-4">
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
            <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="mt-6 text-sm font-bold text-gray-500 dark:text-gray-400 animate-pulse">
                    প্রশ্নপত্র লোড হচ্ছে...
                </p>
            </div>
          );
      }
      
      return (
        <div id="exam-container" className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors relative">
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 py-2 flex justify-between items-center sticky top-0 z-30 shadow-sm h-14 shrink-0">
                <div className="flex items-center gap-2">
                    <button onClick={handleExit} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400">
                        <X size={18}/>
                    </button>
                    <div>
                        <h1 className="text-xs font-bold text-gray-800 dark:text-white line-clamp-1 flex items-center gap-1">
                            {config?.title || 'Exam'} {isRapidFire && <Flame size={14} className="text-red-500 fill-current animate-pulse"/>}
                        </h1>
                        <p className="text-[9px] text-gray-500 font-bold">
                            {viewMode === 'SINGLE_PAGE' || isRapidFire ? `Q ${currentQIndex + 1}/${questions.length}` : `${userAnswers.filter(a => a !== null).length}/${questions.length} Done`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {!isRapidFire && (
                        <button 
                            onClick={() => setViewMode(prev => prev === 'SINGLE_PAGE' ? 'ALL_AT_ONCE' : 'SINGLE_PAGE')}
                            className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-[10px] font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            {viewMode === 'SINGLE_PAGE' ? <LayoutList size={14}/> : <LayoutGrid size={14}/>}
                            {viewMode === 'SINGLE_PAGE' ? 'All Questions' : 'Single View'}
                        </button>
                    )}
                    {renderTimer()}
                </div>
            </div>

            {(viewMode === 'SINGLE_PAGE' || isRapidFire) && (
                <div className="h-0.5 bg-gray-100 dark:bg-gray-700 w-full shrink-0">
                    <div className={`h-full transition-all duration-300 ${isRapidFire ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}></div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-3 md:p-6 scroll-smooth bg-gray-50 dark:bg-gray-900">
                <div className={`mx-auto pb-24 h-full flex flex-col ${viewMode === 'ALL_AT_ONCE' ? 'max-w-4xl' : 'max-w-xl'}`}>
                    {viewMode === 'SINGLE_PAGE' || isRapidFire ? (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col h-full">
                            {/* Question Card */}
                            <div className="bg-white dark:bg-gray-800 p-4 md:p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm mb-3 relative overflow-hidden shrink-0">
                                <div className="flex justify-between items-start gap-3 mb-2 relative z-10">
                                    <span className="text-3xl font-black select-none text-gray-100 dark:text-gray-700/50 font-mono tracking-tighter">
                                        {String(currentQIndex + 1).padStart(2, '0')}
                                    </span>
                                    
                                    <button 
                                        onClick={() => toggleSaveQuestion(currentQIndex)} 
                                        className={`p-2 rounded-full transition-all duration-300 ${savedQuestionIndices.has(currentQIndex) ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-gray-50 dark:bg-gray-700 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-primary'}`}
                                    >
                                        <Bookmark size={16} className={savedQuestionIndices.has(currentQIndex) ? 'fill-current' : ''} strokeWidth={2.5}/>
                                    </button>
                                </div>

                                <div className="relative z-10">
                                    <h2 className={`text-[15px] md:text-xl font-bold text-gray-800 dark:text-white leading-snug mb-2 ${getFont(questions[currentQIndex].question)}`}>
                                        {questions[currentQIndex].question}
                                    </h2>
                                    {questions[currentQIndex].questionImage && (
                                        <div className="mt-2 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-1">
                                            <img src={questions[currentQIndex].questionImage} alt="Question" className="w-full max-h-40 object-contain rounded" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Options List - Scrollable if needed */}
                            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                {questions[currentQIndex].options.map((opt, idx) => {
                                    const isSelected = userAnswers[currentQIndex] === idx;
                                    const isPractice = config?.isPracticeMode;
                                    const isCorrect = idx === questions[currentQIndex].correctAnswerIndex;
                                    const optImage = questions[currentQIndex].optionsImages?.[idx];
                                    
                                    let btnClass = "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700";
                                    
                                    if (isRapidFire) {
                                        if (isRapidFireCorrect && isCorrect) btnClass = "bg-green-500 border-green-500 text-white";
                                        else if (rapidFireWrongAttempt === idx) btnClass = "bg-red-500 border-red-500 text-white";
                                    } 
                                    else if (isPractice && userAnswers[currentQIndex] !== null) {
                                        if (isCorrect) btnClass = "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400";
                                        else if (isSelected) btnClass = "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400";
                                        else btnClass = "opacity-50 grayscale";
                                    } else if (isSelected) {
                                        btnClass = "bg-primary border-primary text-white shadow-md shadow-primary/20";
                                    }

                                    return (
                                        <button 
                                            key={idx}
                                            onClick={() => handleOptionSelect(currentQIndex, idx)}
                                            disabled={(isPractice && userAnswers[currentQIndex] !== null && !isRapidFire) || isRapidFireCorrect}
                                            className={`w-full p-3 rounded-xl border text-left transition-all active:scale-[0.98] flex items-center justify-between group ${btnClass}`}
                                        >
                                            <div className="flex items-center gap-3 w-full">
                                                <div className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-[10px] shrink-0 ${isSelected && !isPractice && !isRapidFire ? 'border-white bg-white/20' : 'border-gray-300 dark:border-gray-600'}`}>
                                                    {['A','B','C','D'][idx]}
                                                </div>
                                                <div className="flex-1">
                                                    {opt && <span className={`text-xs md:text-sm font-medium ${getFont(opt)}`}>{opt}</span>}
                                                    {optImage && <img src={optImage} alt={`Option ${idx}`} className="mt-1 max-h-16 rounded object-contain border border-white/20" />}
                                                </div>
                                            </div>
                                            {isPractice && (userAnswers[currentQIndex] !== null || isRapidFire) && (
                                                (isCorrect && (userAnswers[currentQIndex] !== null || isRapidFireCorrect)) ? <CheckCircle size={16}/> : 
                                                ((isSelected || rapidFireWrongAttempt === idx) && <XCircle size={16}/>)
                                            )}
                                        </button>
                                    )
                                })}
                            </div>

                            {((config?.isPracticeMode && !isRapidFire && userAnswers[currentQIndex] !== null) || (isRapidFire && isRapidFireCorrect)) && (
                                <div id={`explanation-${currentQIndex}`} className="mt-6 p-5 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-800 animate-in slide-in-from-bottom-2 overflow-hidden break-words max-w-full">
                                    <div className="flex items-center gap-2 mb-2 font-bold text-orange-700 dark:text-orange-300 text-sm">
                                        <BookOpen size={16}/> ব্যাখ্যা
                                    </div>
                                    <p className={`text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap ${getFont(questions[currentQIndex].explanation)}`}>
                                        {questions[currentQIndex].explanation || "No explanation available."}
                                    </p>
                                    {questions[currentQIndex].explanationImage && (
                                        <img src={questions[currentQIndex].explanationImage} alt="Explanation" className="mt-2 max-h-48 rounded object-contain border border-orange-200 dark:border-orange-800" />
                                    )}
                                </div>
                            )}

                            {isRapidFire && isRapidFireCorrect && (
                                <div className="mt-6 flex justify-center animate-in slide-in-from-bottom-2">
                                    <button 
                                        onClick={handleRapidFireNext}
                                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-red-200 dark:shadow-none transition-all active:scale-95"
                                    >
                                        {currentQIndex < questions.length - 1 ? 'পরবর্তী প্রশ্ন' : 'ফলাফল দেখুন'} <ArrowRight size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-6">
                            <div className="flex-1 space-y-8">
                                <div className="space-y-6">
                                    {questions.map((q, idx) => (
                                        <div key={idx} id={`q-${idx}`} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm scroll-mt-32">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex gap-3">
                                                    <span className="font-bold text-gray-400 font-mono text-lg">{String(idx+1).padStart(2,'0')}</span>
                                                    <div className="flex-1">
                                                        <h3 className={`font-extrabold text-gray-900 dark:text-white text-base md:text-xl ${getFont(q.question)}`}>{q.question}</h3>
                                                        {q.questionImage && <img src={q.questionImage} alt="Question" className="mt-2 max-h-40 rounded object-contain border border-gray-100 dark:border-gray-700" />}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => toggleSaveQuestion(idx)} className={`p-2 rounded-lg transition-colors ${savedQuestionIndices.has(idx) ? 'text-primary bg-primary/10' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`} title="Bookmark">
                                                        <Bookmark size={18} className={savedQuestionIndices.has(idx) ? 'fill-primary' : ''}/>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                {q.options.map((opt, oIdx) => (
                                                    <button 
                                                        key={oIdx}
                                                        onClick={() => handleOptionSelect(idx, oIdx)}
                                                        className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex items-start gap-2 ${userAnswers[idx] === oIdx ? 'bg-primary/10 border-primary text-primary font-bold' : 'bg-gray-50 dark:bg-gray-900 border-transparent hover:border-gray-200 dark:text-gray-300'}`}
                                                    >
                                                        <span className="font-mono text-gray-400 mt-0.5">({['A','B','C','D'][oIdx]})</span>
                                                        <div className="flex-1">
                                                            {opt && <span className={getFont(opt)}>{opt}</span>}
                                                            {q.optionsImages?.[oIdx] && <img src={q.optionsImages[oIdx]} alt={`Option ${oIdx}`} className="mt-1 max-h-20 rounded object-contain border border-gray-200 dark:border-gray-700" />}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="hidden lg:block w-72 shrink-0">
                                <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm max-h-[80vh] overflow-y-auto">
                                    <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-3 text-sm flex items-center gap-2"><LayoutGrid size={16}/> প্রশ্ন তালিকা</h3>
                                    <div className="grid grid-cols-5 gap-2">
                                        {questions.map((_, i) => (
                                            <button 
                                                key={i} 
                                                onClick={() => document.getElementById(`q-${i}`)?.scrollIntoView({behavior: 'smooth'})}
                                                className={`h-8 rounded-lg text-xs font-bold transition-all ${userAnswers[i] !== null ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}
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
                <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 z-30">
                    <div className="max-w-4xl mx-auto flex justify-between items-center">
                        {viewMode === 'SINGLE_PAGE' ? (
                            <>
                                <button 
                                    onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                                    disabled={currentQIndex === 0}
                                    className="px-5 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors text-sm"
                                >
                                    Previous
                                </button>
                                
                                {currentQIndex === questions.length - 1 ? (
                                    <button 
                                        onClick={() => setShowSubmitModal(true)}
                                        className="px-8 py-2.5 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 dark:shadow-none hover:bg-red-700 transition-all text-sm"
                                    >
                                        Finish Exam
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => setCurrentQIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                        className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-orange-200 dark:shadow-none hover:bg-orange-700 transition-all text-sm flex items-center gap-2"
                                    >
                                        Next <ChevronRight size={16}/>
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="flex w-full gap-3">
                                <button onClick={() => setShowMobileNav(true)} className="lg:hidden px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl">
                                    <LayoutGrid size={20}/>
                                </button>
                                <button 
                                    onClick={() => setShowSubmitModal(true)}
                                    className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-bold shadow-lg hover:bg-red-700 transition-all"
                                >
                                    Submit Answer Script
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showMobileNav && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={() => setShowMobileNav(false)}>
                    <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-10" onClick={e => e.stopPropagation()}>
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
                    <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700 animate-in zoom-in-95">
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
              <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden text-center animate-in zoom-in-95 duration-500">
                  <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-orange-100 to-transparent dark:from-orange-900/20 dark:to-transparent pointer-events-none"></div>
                  
                  <div className="relative z-10">
                      <div className="w-32 h-32 mx-auto mb-4">
                          <Confetti /> {/* Confetti fallback if Lottie breaks */}
                          <Flame size={80} className="text-orange-500 fill-orange-500 mx-auto animate-pulse" />
                      </div>
                      
                      <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
                          {streakData.streak} <span className="text-2xl font-bold text-orange-500">Days</span>
                      </h2>
                      <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-8">
                          Streak on Fire! 🔥
                      </p>

                      <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 mb-8">
                          <div className="flex justify-between items-center">
                              {weekDays.map((day, idx) => {
                                  const isActive = streakData.activityLog.includes(day.date);
                                  const isToday = day.isToday;
                                  
                                  return (
                                      <div key={idx} className="flex flex-col items-center gap-2">
                                          <span className={`text-[10px] font-bold ${isToday ? 'text-orange-500' : 'text-gray-400'}`}>{day.name}</span>
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 ${
                                              isActive 
                                              ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/30 scale-110' 
                                              : isToday 
                                                  ? 'border-dashed border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/10 text-orange-200' 
                                                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-300'
                                          }`}>
                                              {isActive ? (
                                                  <Check size={18} strokeWidth={4} className="text-white"/>
                                              ) : isToday ? (
                                                  <div className="relative flex items-center justify-center">
                                                      <CheckCircle size={22} className="text-orange-500/30" strokeWidth={2} />
                                                      <Check size={12} className="absolute text-orange-500/20" strokeWidth={4} />
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
            <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors">
                <div className="max-w-3xl mx-auto space-y-8 pb-20">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-200 dark:border-gray-700 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] -mt-20"></div>
                        
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-32 h-32 mb-6">
                                <Flame size={80} className="text-orange-500 fill-orange-500 animate-pulse mx-auto" />
                            </div>
                            <h1 className="text-2xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">
                                অভিনন্দন! 🔥
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm md:text-base max-w-md mx-auto mb-8">
                                আপনি সফলভাবে {resultQuestions.length} টি প্রশ্নের সবগুলো সঠিক উত্তর দিয়ে র‍্যাপিড ফায়ার চ্যালেঞ্জ শেষ করেছেন।
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                                <button onClick={handleRetake} className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2">
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
                            <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                                <div className="flex gap-4">
                                    <span className="font-bold text-gray-300 font-mono">{String(idx+1).padStart(2,'0')}</span>
                                    <div className="flex-1">
                                        <h3 className={`font-bold text-gray-800 dark:text-gray-200 text-sm mb-2 ${getFont(q.question)}`}>{q.question}</h3>
                                        {q.questionImage && <img src={q.questionImage} alt="Question" className="max-h-24 rounded object-contain mb-2 border border-gray-100 dark:border-gray-700" />}
                                        <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 rounded-lg">
                                            <p className={`text-xs text-green-700 dark:text-green-400 font-bold flex items-center gap-2 ${getFont(q.options[q.correctAnswerIndex])}`}>
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
        <div id="exam-container" className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors">
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

                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-gray-200 dark:border-gray-700 relative overflow-hidden">
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
                                        #F59E0B ${correctP + wrongP}% 100%
                                    )`
                                }}
                            ></div>
                            <div className="absolute inset-4 bg-white dark:bg-gray-800 rounded-full flex flex-col items-center justify-center shadow-sm">
                                <span className="text-2xl md:text-5xl font-black text-gray-900 dark:text-white">{percentage}%</span>
                                <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Accuracy</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
                        <button onClick={handleRetake} className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 font-bold text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2 text-sm">
                            <RefreshCw size={18}/> আবার পরীক্ষা দিন
                        </button>
                        <button onClick={() => navigate('/dashboard')} className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:bg-orange-700 flex items-center justify-center gap-2 text-sm shadow-lg shadow-orange-200 dark:shadow-none">
                            <Home size={18}/> ড্যাশবোর্ড
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Leaderboard Section - Only for Public Exams */}
                    {config?.type === 'PUBLIC_EXAM' && (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
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
                                                <tr className="border-b border-gray-100 dark:border-gray-700">
                                                    <th className="py-2 px-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
                                                    <th className="py-2 px-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                                    <th className="py-2 px-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Score</th>
                                                    <th className="py-2 px-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Correct</th>
                                                    <th className="py-2 px-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Wrong</th>
                                                    <th className="py-2 px-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Time</th>
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
                                                        <tr key={entry.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${isCurrentUser ? 'bg-orange-50 dark:bg-orange-900/20' : ''}`}>
                                                            <td className="py-2 px-3">
                                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                                                    rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                                                                    rank === 2 ? 'bg-gray-200 text-gray-700' :
                                                                    rank === 3 ? 'bg-orange-100 text-orange-700' :
                                                                    'text-gray-500'
                                                                }`}>
                                                                    {rank}
                                                                </div>
                                                            </td>
                                                            <td className="py-2 px-3">
                                                                <div className="font-medium text-xs text-gray-900 dark:text-white truncate max-w-[120px]">
                                                                    {name}
                                                                    {isCurrentUser && <span className="ml-1 text-[9px] bg-orange-100 text-orange-600 px-1 py-0.5 rounded font-bold">YOU</span>}
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
                                                            <td className="py-2 px-3 text-right text-gray-500 text-[10px] font-mono">
                                                                {formatDuration(timeTaken)}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}

                                                {!isUserInView && userRank && (
                                                    <>
                                                        <tr className="border-t-2 border-dashed border-gray-200 dark:border-gray-700">
                                                            <td colSpan={6} className="py-1 text-center text-[10px] text-gray-400">...</td>
                                                        </tr>
                                                        <tr className="bg-orange-50 dark:bg-orange-900/20 border-t border-orange-100 dark:border-orange-800">
                                                            <td className="py-2 px-3">
                                                                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-orange-600 bg-orange-100">
                                                                    {userRank}
                                                                </div>
                                                            </td>
                                                            <td className="py-2 px-3">
                                                                <div className="font-medium text-xs text-gray-900 dark:text-white truncate max-w-[120px]">
                                                                    {currentUser?.displayName || 'Anonymous'}
                                                                    <span className="ml-1 text-[9px] bg-orange-100 text-orange-600 px-1 py-0.5 rounded font-bold">YOU</span>
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
                                                            <td className="py-2 px-3 text-right text-gray-500 text-[10px] font-mono">
                                                                {formatDuration(examDuration)}
                                                            </td>
                                                        </tr>
                                                    </>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
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
                                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${reviewFilter === filter ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'}`}
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
                            <div key={idx} className={`bg-white dark:bg-gray-800 p-6 rounded-2xl border ${isCorrect ? 'border-green-200 dark:border-green-900/50' : isSkipped ? 'border-gray-200 dark:border-gray-700' : 'border-red-200 dark:border-red-900/50'} shadow-sm`}>
                                <div className="flex gap-4 mb-4">
                                    <span className="font-bold text-gray-400 font-mono text-lg">{String(idx+1).padStart(2,'0')}</span>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className={`font-extrabold text-gray-900 dark:text-white text-base md:text-lg pr-4 ${getFont(q.question)}`}>{q.question}</h3>
                                            <button 
                                                onClick={() => toggleSaveQuestion(idx)} 
                                                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-primary transition-colors shrink-0"
                                            >
                                                <Bookmark size={18} className={savedQuestionIndices.has(idx) ? 'fill-primary text-primary' : ''}/>
                                            </button>
                                        </div>
                                        {q.questionImage && <img src={q.questionImage} alt="Question" className="max-h-32 rounded object-contain mb-3 border border-gray-100 dark:border-gray-700" />}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {isCorrect ? 
                                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold">সঠিক উত্তর</span> :
                                                isSkipped ? 
                                                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">এড়িয়ে গেছেন</span> :
                                                <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold">ভুল উত্তর</span>
                                            }
                                            <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded text-[10px] font-bold">{q.chapter || 'General'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-2 mb-4">
                                    {q.options.map((opt, oIdx) => {
                                        let style = "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400";
                                        if (oIdx === q.correctAnswerIndex) style = "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400 font-bold";
                                        else if (userAnswer === oIdx) style = "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400 font-bold";

                                        return (
                                            <div key={oIdx} className={`p-3 rounded-lg border text-sm flex items-start gap-3 ${style}`}>
                                                <div className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] opacity-70 shrink-0 mt-0.5">{['A','B','C','D'][oIdx]}</div>
                                                <div className="flex-1">
                                                    <span className={getFont(opt)}>{opt}</span>
                                                    {q.optionsImages?.[oIdx] && <img src={q.optionsImages[oIdx]} alt={`Option ${oIdx}`} className="mt-2 max-h-20 rounded object-contain" />}
                                                </div>
                                                {oIdx === q.correctAnswerIndex && <CheckCircle size={16} className="ml-auto mt-0.5"/>}
                                                {userAnswer === oIdx && userAnswer !== q.correctAnswerIndex && <XCircle size={16} className="ml-auto mt-0.5"/>}
                                            </div>
                                        )
                                    })}
                                </div>

                                {q.explanation && (
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl text-sm text-gray-700 dark:text-gray-300 border-l-4 border-gray-300 dark:border-gray-600 overflow-hidden break-words max-w-full">
                                        <p className="font-bold mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500"><BookOpen size={12}/> ব্যাখ্যা</p>
                                        <p className={`whitespace-pre-wrap ${getFont(q.explanation)}`}>{q.explanation}</p>
                                        {q.explanationImage && <img src={q.explanationImage} alt="Explanation" className="mt-2 max-h-40 rounded object-contain border border-gray-200 dark:border-gray-700" />}
                                    </div>
                                )}
                            </div>
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
