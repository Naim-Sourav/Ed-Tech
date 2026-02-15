
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from './Toast';
import { saveExamResultAPI, updateQuestProgressAPI, saveQuestionAPI, unsaveQuestionAPI, fetchQuestionsByExamRefAPI, recordUserActivityAPI, clearMistakesAPI, fetchExamResultAPI } from '../services/api';
import { 
  Clock, ChevronRight, CheckCircle, XCircle, 
  BookOpen, Bookmark, LayoutGrid, HelpCircle, 
  Trophy, RefreshCw, Home, LayoutList, X, Flame, ArrowRight, Calendar, Check
} from 'lucide-react';
import { QuizQuestion } from '../types';
import { useCache } from '../contexts/CacheContext';
import Confetti from './Confetti'; // Use existing confetti instead of Lottie to be safe

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
  const { t } = useLanguage();
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
    if (!examId || !currentUser) {
        if (!examId) navigate('/dashboard');
        return;
    }

    const initExam = async () => {
        setLoading(true);
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

        const savedSession = localStorage.getItem(SESSION_KEY);
        const storedConfig = localStorage.getItem(CONFIG_KEY);

        if (!storedConfig && !savedSession) {
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
            setSavedQuestionIndices(new Set(session.savedIndices));
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

  useEffect(() => {
    if (!loading && window.MathJax && window.MathJax.typesetPromise) {
      setTimeout(() => {
        const container = document.getElementById('exam-container');
        if (container) {
          window.MathJax.typesetPromise([container]).catch((err: any) => console.error('MathJax error:', err));
        }
      }, 150);
    }
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
    const newSet = new Set(savedQuestionIndices);
    try {
      // @ts-ignore
      if (!q._id) return; 
      if (newSet.has(index)) {
        newSet.delete(index);
        setSavedQuestionIndices(newSet);
        // @ts-ignore
        await unsaveQuestionAPI(currentUser.uid, q._id);
        showToast("বুকমার্ক রিমুভ করা হয়েছে", "info");
      } else {
        newSet.add(index);
        setSavedQuestionIndices(newSet);
        // @ts-ignore
        await saveQuestionAPI(currentUser.uid, q._id);
        updateQuestProgressAPI(currentUser.uid, 'SAVE_QUESTION', 1);
        showToast("প্রশ্নটি বুকমার্ক করা হয়েছে", "success");
      }
    } catch (e) {
      if (newSet.has(index)) newSet.delete(index); else newSet.add(index);
      setSavedQuestionIndices(newSet);
      showToast("বুকমার্ক আপডেট করা যায়নি", "error");
    }
  };

  const handleSubmitExam = async (autoSubmit = false) => {
    localStorage.removeItem(SESSION_KEY);
    setShowSubmitModal(false);
    setStep('RESULT');
    
    const correctCount = userAnswers.filter((ans, idx) => ans === questions[idx]?.correctAnswerIndex).length;
    const wrongCount = userAnswers.filter((ans, idx) => ans !== null && ans !== questions[idx]?.correctAnswerIndex).length;
    const skippedCount = questions.length - (correctCount + wrongCount);
    const negativeMark = config?.negativeMarking || 0;
    const rawScore = correctCount - (wrongCount * negativeMark);
    const finalScore = Math.max(0, rawScore);
    const percentage = Math.round((finalScore / questions.length) * 100);

    if (currentUser && examId) {
        try {
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
            
            clearCache(`profile_${currentUser.uid}`);
            clearCache(`dashboard_${currentUser.uid}`);
            
            updateQuestProgressAPI(currentUser.uid, 'EXAM_COMPLETE', 1);
            if (percentage >= 80) updateQuestProgressAPI(currentUser.uid, 'HIGH_SCORE', 1);
            
            if (autoSubmit) showToast("সময় শেষ! অটো সাবমিট হয়েছে।", "info");

            if (config?.isMistakeRetake) {
                // @ts-ignore
                const solvedIds = questions.filter((q, i) => userAnswers[i] === q.correctAnswerIndex && q._id).map(q => q._id);
                if (solvedIds.length > 0) {
                    await clearMistakesAPI(currentUser.uid, solvedIds);
                    setClearedMistakesCount(solvedIds.length);
                    clearCache(`profile_${currentUser.uid}`);
                }
            }
        } catch (e) {
            console.error(e);
        }
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
          setTimeLeft(config.timeLimit * 60);
          setExamDuration(0);
      }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const renderTimer = () => {
    if (config?.timeLimit === 0) {
       return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
            <Clock size={16} /> {formatTime(examDuration)}
          </div>
       );
    }
    const totalSeconds = config.timeLimit * 60;
    const percentage = (timeLeft / totalSeconds) * 100;
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (timeLeft / totalSeconds) * circumference;
    let colorClass = 'text-emerald-500';
    if (percentage <= 20) colorClass = 'text-red-500';
    else if (percentage <= 50) colorClass = 'text-yellow-500';

    return (
        <div className="relative w-12 h-12 flex items-center justify-center group">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-sm">
                <circle cx="24" cy="24" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100 dark:text-gray-700" />
                <circle cx="24" cy="24" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className={`${colorClass} transition-all duration-1000 ease-linear`} strokeLinecap="round" />
            </svg>
            <span className={`absolute font-mono font-bold text-[10px] ${colorClass} ${timeLeft <= 60 ? 'animate-pulse' : ''}`}>{formatTime(timeLeft)}</span>
        </div>
    );
  };

  if (loading) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="mt-6 text-sm font-bold text-gray-500 dark:text-gray-400 animate-pulse">প্রশ্নপত্র লোড হচ্ছে...</p>
        </div>
      );
  }

  // --- EXAM VIEW ---
  if (step === 'EXAM') {
      const viewMode = config?.mode || 'SINGLE_PAGE';
      const isRapidFire = config?.mode === 'RAPID_FIRE';
      
      return (
        <div id="exam-container" className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors relative">
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex justify-between items-center sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={handleExit} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400">
                        <X size={20}/>
                    </button>
                    <div>
                        <h1 className="text-sm md:text-base font-bold text-gray-800 dark:text-white line-clamp-1 flex items-center gap-2">
                            {config?.title || 'Exam'} {isRapidFire && <Flame size={16} className="text-red-500 fill-current animate-pulse"/>}
                        </h1>
                        <p className="text-[10px] text-gray-500 font-bold">
                            {viewMode === 'SINGLE_PAGE' || isRapidFire ? `Question ${currentQIndex + 1}/${questions.length}` : `${userAnswers.filter(a => a !== null).length}/${questions.length} Answered`}
                        </p>
                    </div>
                </div>
                {renderTimer()}
            </div>

            {(viewMode === 'SINGLE_PAGE' || isRapidFire) && (
                <div className="h-1 bg-gray-200 dark:bg-gray-700 w-full">
                    <div className={`h-full transition-all duration-300 ${isRapidFire ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}></div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
                <div className={`mx-auto pb-20 ${viewMode === 'ALL_AT_ONCE' ? 'max-w-4xl' : 'max-w-2xl'}`}>
                    {viewMode === 'SINGLE_PAGE' || isRapidFire ? (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-white dark:bg-gray-800 p-5 md:p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6 relative">
                                <span className={`absolute top-4 left-4 text-4xl font-black select-none -z-0 ${isRapidFire ? 'text-red-50 dark:text-red-900/10' : 'text-gray-100 dark:text-gray-700'}`}>
                                    {String(currentQIndex + 1).padStart(2, '0')}
                                </span>
                                <div className="relative z-10">
                                    <h2 className={`text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white leading-relaxed mb-2 ${getFont(questions[currentQIndex].question)}`}>
                                        {questions[currentQIndex].question}
                                    </h2>
                                    {questions[currentQIndex].questionImage && (
                                        <img src={questions[currentQIndex].questionImage} alt="Question" className="max-h-64 rounded-lg object-contain mt-2 border border-gray-200 dark:border-gray-700" />
                                    )}
                                </div>
                                <button 
                                    onClick={() => toggleSaveQuestion(currentQIndex)} 
                                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-primary transition-colors"
                                >
                                    <Bookmark size={20} className={savedQuestionIndices.has(currentQIndex) ? 'fill-primary text-primary' : ''}/>
                                </button>
                            </div>

                            <div className="space-y-3">
                                {questions[currentQIndex].options.map((opt, idx) => {
                                    const isSelected = userAnswers[currentQIndex] === idx;
                                    const isPractice = config?.isPracticeMode;
                                    const isCorrect = idx === questions[currentQIndex].correctAnswerIndex;
                                    const optImage = questions[currentQIndex].optionsImages?.[idx];
                                    
                                    let btnClass = "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700";
                                    
                                    if (isRapidFire) {
                                        if (isRapidFireCorrect && isCorrect) btnClass = "bg-green-500 border-green-500 text-white animate-pulse";
                                        else if (rapidFireWrongAttempt === idx) btnClass = "bg-red-500 border-red-500 text-white animate-shake";
                                    } 
                                    else if (isPractice && userAnswers[currentQIndex] !== null) {
                                        if (isCorrect) btnClass = "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400";
                                        else if (isSelected) btnClass = "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400";
                                        else btnClass = "opacity-50 grayscale";
                                    } else if (isSelected) {
                                        btnClass = "bg-primary border-primary text-white shadow-lg shadow-primary/20";
                                    }

                                    return (
                                        <button 
                                            key={idx}
                                            onClick={() => handleOptionSelect(currentQIndex, idx)}
                                            disabled={(isPractice && userAnswers[currentQIndex] !== null && !isRapidFire) || isRapidFireCorrect}
                                            className={`w-full p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.99] flex items-center justify-between group ${btnClass}`}
                                        >
                                            <div className="flex items-center gap-3 w-full">
                                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs shrink-0 ${isSelected && !isPractice && !isRapidFire ? 'border-white bg-white/20' : 'border-gray-300 dark:border-gray-600'}`}>
                                                    {['A','B','C','D'][idx]}
                                                </div>
                                                <div className="flex-1">
                                                    {opt && <span className={`text-sm md:text-base font-medium ${getFont(opt)}`}>{opt}</span>}
                                                    {optImage && <img src={optImage} alt={`Option ${idx}`} className="mt-2 max-h-24 rounded object-contain border border-white/20" />}
                                                </div>
                                            </div>
                                            {isPractice && (userAnswers[currentQIndex] !== null || isRapidFire) && (
                                                (isCorrect && (userAnswers[currentQIndex] !== null || isRapidFireCorrect)) ? <CheckCircle size={20}/> : 
                                                ((isSelected || rapidFireWrongAttempt === idx) && <XCircle size={20}/>)
                                            )}
                                        </button>
                                    )
                                })}
                            </div>

                            {((config?.isPracticeMode && !isRapidFire && userAnswers[currentQIndex] !== null) || (isRapidFire && isRapidFireCorrect)) && (
                                <div id={`explanation-${currentQIndex}`} className="mt-6 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 animate-in slide-in-from-bottom-2 overflow-hidden break-words max-w-full">
                                    <div className="flex items-center gap-2 mb-2 font-bold text-blue-700 dark:text-blue-300 text-sm">
                                        <BookOpen size={16}/> ব্যাখ্যা
                                    </div>
                                    <p className={`text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap ${getFont(questions[currentQIndex].explanation)}`}>
                                        {questions[currentQIndex].explanation || "No explanation available."}
                                    </p>
                                    {questions[currentQIndex].explanationImage && (
                                        <img src={questions[currentQIndex].explanationImage} alt="Explanation" className="mt-2 max-h-48 rounded object-contain border border-blue-200 dark:border-blue-800" />
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
                                                        <h3 className={`font-extrabold text-gray-900 dark:text-white text-lg md:text-xl ${getFont(q.question)}`}>{q.question}</h3>
                                                        {q.questionImage && <img src={q.questionImage} alt="Question" className="mt-2 max-h-40 rounded object-contain border border-gray-100 dark:border-gray-700" />}
                                                    </div>
                                                </div>
                                                <button onClick={() => toggleSaveQuestion(idx)} className="text-gray-400 hover:text-primary"><Bookmark size={18} className={savedQuestionIndices.has(idx) ? 'fill-primary text-primary' : ''}/></button>
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
                                        className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all text-sm flex items-center gap-2"
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
                                                  ? 'border-orange-200 dark:border-orange-900/50 bg-white dark:bg-gray-800 text-orange-200' 
                                                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-300'
                                          }`}>
                                              {isActive ? <Check size={14} strokeWidth={4} /> : ''}
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
                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">
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
                            <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white">
                                {finalScore.toFixed(2)} <span className="text-xl md:text-3xl text-gray-400 font-bold">/ {resultQuestions.length}</span>
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
                                <span className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white">{percentage}%</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Accuracy</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
                        <button onClick={handleRetake} className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 font-bold text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2 text-sm">
                            <RefreshCw size={18}/> আবার পরীক্ষা দিন
                        </button>
                        <button onClick={() => navigate('/dashboard')} className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:bg-blue-700 flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-200 dark:shadow-none">
                            <Home size={18}/> ড্যাশবোর্ড
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
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
                                            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold">{q.chapter || 'General'}</span>
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
