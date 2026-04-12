
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Play, 
  User, 
  School, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Trophy, 
  ArrowRight,
  Home,
  RefreshCw,
  Loader2,
  Info,
  BookOpen
} from 'lucide-react';
import { useToast } from './Toast';
import { fetchQuestionsByExamRefAPI } from '../services/api';
import { QuizQuestion } from '../types';
import { submitGuestExamResult, fetchPublicExamLeaderboard } from '../services/publicExamService';
import Confetti from './Confetti';

const GST_EXAM_REF = 'gst_a_unit_2025_26';

const SUBJECT_COLORS: Record<string, string> = {
  'Physics': 'bg-blue-500',
  'Chemistry': 'bg-purple-500',
  'Math': 'bg-green-500',
  'Biology': 'bg-emerald-500',
  'Bangla': 'bg-red-500',
  'English': 'bg-indigo-500'
};

const GSTGuestExam: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { currentUser } = useAuth();
  
  // --- Flow State ---
  const [step, setStep] = useState<'INFO' | 'SUBJECTS' | 'EXAM' | 'RESULT' | 'REVIEW'>('INFO');
  const [loading, setLoading] = useState(true);
  const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  
  // --- User Info ---
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  
  // --- Subject Selection ---
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Physics', 'Chemistry']);
  const optionalSubjects = ['Math', 'Biology', 'Bangla', 'English'];
  
  // --- Exam State ---
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
  const [examStartTime, setExamStartTime] = useState<number>(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  
  // --- Result State ---
  const [result, setResult] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (currentUser && step === 'INFO') {
      setName(currentUser.displayName || '');
      setStep('SUBJECTS');
    }
  }, [currentUser, step]);

  // LaTeX Rendering Logic
  useEffect(() => {
    if ((step === 'EXAM' || step === 'REVIEW') && (window as any).MathJax) {
      // Use a small timeout to ensure DOM is ready
      const timer = setTimeout(() => {
        (window as any).MathJax.typesetPromise?.();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [step, questions]);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const data = await fetchQuestionsByExamRefAPI(GST_EXAM_REF);
        if (data && data.length > 0) {
          setAllQuestions(data);
        } else {
          showToast("প্রশ্ন পাওয়া যায়নি। দয়া করে পরে চেষ্টা করুন।", "error");
        }
      } catch (error) {
        console.error("Error loading questions:", error);
        showToast("সার্ভার ত্রুটি। দয়া করে পরে চেষ্টা করুন।", "error");
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, []);

  // Timer Logic
  useEffect(() => {
    if (step === 'EXAM' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, timeLeft]);

  const handleAutoSubmit = () => {
    showToast("সময় শেষ! আপনার উত্তরপত্র জমা দেওয়া হচ্ছে...", "info");
    handleSubmitExam();
  };

  const handleStartExam = () => {
    if (!name.trim() || !college.trim()) {
      showToast("দয়া করে নাম ও কলেজের নাম লিখুন", "warning");
      return;
    }
    setStep('SUBJECTS');
  };

  const toggleSubject = (subject: string) => {
    if (subject === 'Physics' || subject === 'Chemistry') return; // Mandatory

    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(prev => prev.filter(s => s !== subject));
    } else {
      // Constraint: Max 4 subjects total (2 optional)
      if (selectedSubjects.length >= 4) {
        showToast("আপনি সর্বোচ্চ ৪টি বিষয় সিলেক্ট করতে পারবেন", "warning");
        return;
      }
      // Constraint: Cannot choose both Bangla and English
      if (subject === 'Bangla' && selectedSubjects.includes('English')) {
        showToast("বাংলা ও ইংরেজি উভয়ই সিলেক্ট করা যাবে না", "warning");
        return;
      }
      if (subject === 'English' && selectedSubjects.includes('Bangla')) {
        showToast("বাংলা ও ইংরেজি উভয়ই সিলেক্ট করা যাবে না", "warning");
        return;
      }
      setSelectedSubjects(prev => [...prev, subject]);
    }
  };

  const startExamNow = () => {
    if (selectedSubjects.length < 4) {
      showToast("দয়া করে ৪টি বিষয় সিলেক্ট করুন", "warning");
      return;
    }
    
    // Filter questions based on selected subjects (more robust matching)
    const filteredQuestions = allQuestions.filter(q => {
      const qSub = (q.subject || '').toLowerCase();
      return selectedSubjects.some(s => {
        const sLow = s.toLowerCase();
        // Match if one contains the other (e.g. "Physics" matches "Physics (পদার্থবিজ্ঞান )")
        return qSub.includes(sLow) || sLow.includes(qSub);
      });
    });

    if (filteredQuestions.length === 0) {
      showToast("সিলেক্ট করা বিষয়ের কোনো প্রশ্ন পাওয়া যায়নি", "error");
      return;
    }
    
    setQuestions(filteredQuestions);
    setUserAnswers(new Array(filteredQuestions.length).fill(null));
    setExamStartTime(Date.now());
    setStep('EXAM');
  };

  const handleAnswer = (qIdx: number, optionIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[qIdx] = optionIndex;
    setUserAnswers(newAnswers);
  };

  const handleSubmitExam = async () => {
    const timeTaken = Math.floor((Date.now() - examStartTime) / 1000);
    
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    userAnswers.forEach((ans, idx) => {
      if (ans === null) {
        skipped++;
      } else if (ans === questions[idx].correctAnswerIndex) {
        correct++;
      } else {
        wrong++;
      }
    });

    const score = correct - (wrong * 0.25);
    const examResult = {
      score,
      correct,
      wrong,
      skipped,
      total: questions.length,
      pass: score >= 30
    };

    setResult(examResult);
    
    // Submit to guest leaderboard
    try {
      await submitGuestExamResult(
        GST_EXAM_REF,
        { name, college, email: `${name.replace(/\s+/g, '').toLowerCase()}@guest.com` },
        examResult,
        timeTaken
      );
      loadLeaderboard();
    } catch (error) {
      console.error("Error submitting result:", error);
    }

    setStep('RESULT');
  };

  const getFont = (text: string = '') => {
    const isBangla = /[\u0980-\u09FF]/.test(text);
    return isBangla ? 'font-tiro' : 'font-sans';
  };

  const loadLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      const data = await fetchPublicExamLeaderboard(GST_EXAM_REF);
      setLeaderboard(data);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
        <p className="text-gray-500 font-bold">প্রশ্ন লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <AnimatePresence mode="wait">
        {step === 'INFO' && (
          <motion.div 
            key="info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md mx-auto px-4 py-12"
          >
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-white/5">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mb-6">
                <Play className="text-orange-600" fill="currentColor" size={32} />
              </div>
              <h1 className="text-2xl font-black text-gray-800 dark:text-white mb-2">GST লাইভ এক্সাম</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 font-medium">
                আপনার প্রস্তুতি যাচাই করতে এখনই এক্সাম দিন। কোনো লগইন ছাড়াই আপনি আপনার মেধা যাচাই করতে পারবেন।
              </p>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">আপনার নাম</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="যেমন: তাসনিন আহমেদ"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-bold text-gray-800 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">কলেজের নাম</label>
                  <div className="relative">
                    <School className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="যেমন: ঢাকা কলেজ"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-bold text-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-500/20 mb-8">
                <div className="flex gap-3">
                  <Info className="text-blue-500 shrink-0" size={18} />
                  <div className="text-xs text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
                    <p className="font-black mb-1 uppercase tracking-wider">এক্সাম রুলস:</p>
                    <ul className="list-disc ml-4 space-y-1">
                      <li>সময়: ৬০ মিনিট</li>
                      <li>মোট প্রশ্ন: ১০০টি</li>
                      <li>নেগেটিভ মার্ক: ০.২৫</li>
                      <li>পাস মার্ক: ৩০</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleStartExam}
                className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-orange-500/20 transition-all active:scale-95"
              >
                পরবর্তী ধাপ <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'SUBJECTS' && (
          <motion.div 
            key="subjects"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-md mx-auto px-4 py-12"
          >
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-white/5">
              <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2">বিষয় নির্বাচন করুন</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 font-medium">
                GST A ইউনিটে ফিজিক্স ও কেমিস্ট্রি আবশ্যিক। বাকি ৪টি থেকে যেকোনো ২টি সিলেক্ট করুন।
              </p>

              <div className="space-y-3 mb-8">
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-500 rounded-2xl flex items-center justify-between">
                  <span className="font-bold text-orange-700 dark:text-orange-300">Physics (পদার্থবিজ্ঞান)</span>
                  <CheckCircle2 className="text-orange-500" size={20} />
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-500 rounded-2xl flex items-center justify-between">
                  <span className="font-bold text-orange-700 dark:text-orange-300">Chemistry (রসায়ন)</span>
                  <CheckCircle2 className="text-orange-500" size={20} />
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {optionalSubjects.map(sub => {
                    const isSelected = selectedSubjects.includes(sub);
                    const isDisabled = (sub === 'Bangla' && selectedSubjects.includes('English')) || 
                                     (sub === 'English' && selectedSubjects.includes('Bangla'));
                    
                    return (
                      <button
                        key={sub}
                        onClick={() => toggleSubject(sub)}
                        disabled={isDisabled && !isSelected}
                        className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                          isSelected 
                            ? 'bg-orange-50 border-orange-500 dark:bg-orange-900/20' 
                            : isDisabled 
                              ? 'bg-gray-100 border-transparent opacity-50 cursor-not-allowed' 
                              : 'bg-gray-50 border-transparent dark:bg-gray-700/30 hover:border-gray-200'
                        }`}
                      >
                        <span className={`font-bold ${isSelected ? 'text-orange-700 dark:text-orange-300' : 'text-gray-600 dark:text-gray-400'}`}>
                          {sub} {sub === 'Math' ? '(গণিত)' : sub === 'Biology' ? '(জীববিজ্ঞান)' : sub === 'Bangla' ? '(বাংলা)' : '(ইংরেজি)'}
                        </span>
                        {isSelected ? <CheckCircle2 className="text-orange-500" size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-gray-200"></div>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setStep('INFO')}
                  className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl font-black transition-all active:scale-95"
                >
                  পিছনে
                </button>
                <button 
                  onClick={startExamNow}
                  className="flex-[2] py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black shadow-xl shadow-orange-500/20 transition-all active:scale-95"
                >
                  এক্সাম শুরু করুন
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'EXAM' && (
          <motion.div 
            key="exam"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-3xl mx-auto px-4 py-6 pb-32"
          >
            {/* Exam Header */}
            <div className="sticky top-2 sm:top-4 z-30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-lg border border-gray-100 dark:border-white/5 mb-4 sm:mb-8 flex flex-col gap-3">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Clock className="text-orange-600" size={18} />
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">সময় বাকি</p>
                    <p className={`text-sm sm:text-lg font-black ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-gray-800 dark:text-white'}`}>
                      {formatTime(timeLeft)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">প্রগতি</p>
                  <p className="text-xs sm:text-sm font-black text-orange-600">
                    {userAnswers.filter(a => a !== null).length} / {questions.length}
                  </p>
                </div>

                <button 
                  onClick={() => setShowSubmitModal(true)}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-900 dark:bg-black text-white rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black hover:scale-105 transition-all active:scale-95 shadow-lg shadow-black/20"
                >
                  জমা দিন
                </button>
              </div>

              {/* Progress Bar (Slim) */}
              <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-orange-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(userAnswers.filter(a => a !== null).length / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Questions List Grouped by Subject */}
            <div className="space-y-8 sm:space-y-12">
              {selectedSubjects.map((subject) => {
                const subjectQuestions = questions.filter(q => {
                  const qSub = (q.subject || '').toLowerCase();
                  const sLow = subject.toLowerCase();
                  return qSub.includes(sLow) || sLow.includes(qSub);
                });

                if (subjectQuestions.length === 0) return null;

                return (
                  <div key={subject} id={`subject-section-${subject}`} className="space-y-4 sm:space-y-6 scroll-mt-24 sm:scroll-mt-32">
                    <div className="flex items-center gap-2 sm:gap-4 px-2">
                      <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
                      <h2 className="text-[10px] sm:text-sm font-black text-gray-400 uppercase tracking-[0.1em] sm:tracking-[0.2em] bg-gray-50 dark:bg-gray-900 px-2 sm:px-4">
                        {subject}
                      </h2>
                      <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
                    </div>

                    <div className="space-y-6 sm:space-y-8">
                      {subjectQuestions.map((q, subIdx) => {
                        const qIdx = questions.indexOf(q);
                        return (
                          <div 
                            key={qIdx} 
                            id={`question-${qIdx}`}
                            className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-10 shadow-xl border border-gray-100 dark:border-white/5 scroll-mt-20 sm:scroll-mt-24 transition-all hover:shadow-2xl hover:border-orange-500/20"
                          >
                            <div className="flex justify-between items-start mb-4 sm:mb-6">
                              <span className={`px-2 sm:px-3 py-0.5 sm:py-1 ${SUBJECT_COLORS[subject] || 'bg-orange-500'} text-white text-[8px] sm:text-[10px] font-black uppercase tracking-widest rounded-full`}>
                                {subject}
                              </span>
                              <span className="text-[10px] sm:text-xs font-bold text-gray-400">প্রশ্ন {subIdx + 1}</span>
                            </div>

                            <h3 className={`text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-8 leading-relaxed ${getFont(q.question)}`}>
                              {q.question}
                            </h3>

                            {q.questionImage && (
                              <div className="mb-8 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-50">
                                <img src={q.questionImage} alt="Question" className="w-full h-auto object-contain max-h-64" referrerPolicy="no-referrer" />
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {q.options.map((opt, i) => (
                                <button
                                  key={i}
                                  onClick={() => handleAnswer(qIdx, i)}
                                  className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all text-left group ${
                                    userAnswers[qIdx] === i 
                                      ? 'bg-orange-50 border-orange-500 dark:bg-orange-900/20' 
                                      : 'bg-gray-50 border-transparent dark:bg-gray-700/30 hover:border-gray-200'
                                  }`}
                                >
                                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                                    userAnswers[qIdx] === i 
                                      ? 'bg-orange-500 text-white' 
                                      : 'bg-white dark:bg-gray-600 text-gray-500 dark:text-gray-300 shadow-sm group-hover:scale-110'
                                  }`}>
                                    {String.fromCharCode(65 + i)}
                                  </span>
                                  <span className={`text-sm font-bold ${getFont(opt)} ${
                                    userAnswers[qIdx] === i ? 'text-orange-700 dark:text-orange-300' : 'text-gray-600 dark:text-gray-300'
                                  }`}>
                                    {opt}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit Button at Bottom */}
            <div className="mt-12 text-center">
              <button 
                onClick={() => setShowSubmitModal(true)}
                className="px-12 py-5 bg-orange-600 hover:bg-orange-700 text-white rounded-3xl font-black text-lg shadow-2xl shadow-orange-500/30 transition-all active:scale-95 flex items-center gap-3 mx-auto"
              >
                পরীক্ষা শেষ করুন <CheckCircle2 size={24} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'RESULT' && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto px-4 py-12"
          >
            {result?.pass && <Confetti />}
            
            <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-8 md:p-12 shadow-2xl border border-gray-100 dark:border-white/5 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
              
              <div className="relative z-10">
                <div className={`w-24 h-24 mx-auto rounded-3xl flex items-center justify-center mb-6 shadow-xl ${result?.pass ? 'bg-green-500 shadow-green-500/20' : 'bg-red-500 shadow-red-500/20'}`}>
                  {result?.pass ? <Trophy className="text-white" size={48} /> : <AlertCircle className="text-white" size={48} />}
                </div>

                <h2 className="text-3xl font-black text-gray-800 dark:text-white mb-2">
                  {result?.pass ? 'অভিনন্দন!' : 'আরও চেষ্টা করুন'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
                  {result?.pass ? 'আপনি সফলভাবে এক্সামটি পাস করেছেন।' : 'দুঃখিত, আপনি পাস মার্ক (৩০) অর্জন করতে পারেননি।'}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-500/20">
                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">স্কোর</p>
                    <p className="text-2xl font-black text-gray-800 dark:text-white">{result?.score.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-500/20">
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">সঠিক</p>
                    <p className="text-2xl font-black text-gray-800 dark:text-white">{result?.correct}</p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-500/20">
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">ভুল</p>
                    <p className="text-2xl font-black text-gray-800 dark:text-white">{result?.wrong}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">স্কিপ</p>
                    <p className="text-2xl font-black text-gray-800 dark:text-white">{result?.skipped}</p>
                  </div>
                </div>

                {/* Leaderboard Preview */}
                <div className="mb-10 text-left">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-lg font-black text-gray-800 dark:text-white flex items-center gap-2">
                      <Trophy className="text-yellow-500" size={20} /> লিডারবোর্ড
                    </h3>
                    <button onClick={loadLeaderboard} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all">
                      <RefreshCw size={16} className={leaderboardLoading ? 'animate-spin' : ''} />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {leaderboard.slice(0, 10).map((entry, idx) => {
                      const isMe = entry.name === name && (entry.college === college || !entry.college);
                      return (
                        <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                          isMe 
                            ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/20 scale-[1.02]' 
                            : 'bg-gray-50 dark:bg-gray-700/30 border-gray-100 dark:border-white/5'
                        }`}>
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                              idx === 0 ? 'bg-yellow-400 text-white' : isMe ? 'bg-white text-orange-500' : 'bg-gray-200 dark:bg-gray-600 text-gray-500'
                            }`}>
                              {idx + 1}
                            </span>
                            <div>
                              <p className={`text-sm font-bold ${isMe ? 'text-white' : 'text-gray-800 dark:text-white'}`}>{entry.name}</p>
                              <p className={`text-[10px] font-medium ${isMe ? 'text-orange-100' : 'text-gray-400'}`}>
                                {entry.college && entry.college !== 'Unknown' ? entry.college : 'কলেজ তথ্য নেই'}
                              </p>
                            </div>
                          </div>
                          <p className={`text-sm font-black ${isMe ? 'text-white' : 'text-orange-600'}`}>{entry.score.toFixed(2)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => setStep('REVIEW')}
                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                  >
                    <BookOpen size={20} /> উত্তরপত্র দেখুন
                  </button>
                  <button 
                    onClick={() => navigate('/')}
                    className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Home size={20} /> হোম পেজ
                  </button>
                  <button 
                    onClick={() => {
                      setStep('INFO');
                      setResult(null);
                      setUserAnswers([]);
                      setTimeLeft(3600);
                    }}
                    className="flex-1 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-orange-500/20 transition-all active:scale-95"
                  >
                    <RefreshCw size={20} /> আবার দিন
                  </button>
                </div>

                {/* CTA */}
                <div className="mt-12 p-6 bg-gray-900 dark:bg-black rounded-[2rem] text-white text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  <div className="relative z-10">
                    <h4 className="text-lg font-black mb-2">আরও ফিচার ট্রাই করতে চান?</h4>
                    <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                      আমাদের অ্যাপে আছে চ্যাপ্টার ভিত্তিক কুইজ, মডেল টেস্ট এবং AI মেন্টর। আজই জয়েন করুন!
                    </p>
                    <button 
                      onClick={() => navigate('/auth')}
                      className="px-8 py-3 bg-white text-black rounded-xl text-xs font-black hover:scale-105 transition-all active:scale-95"
                    >
                      লগইন করুন
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'REVIEW' && (
          <motion.div 
            key="review"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-3xl mx-auto px-4 py-12 pb-32"
          >
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={() => setStep('RESULT')}
                className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-white/5 text-gray-600 dark:text-gray-400 hover:scale-110 transition-all"
              >
                <ArrowRight className="rotate-180" size={24} />
              </button>
              <h2 className="text-2xl font-black text-gray-800 dark:text-white">উত্তরপত্র রিভিউ</h2>
              <div className="w-12"></div>
            </div>

            <div className="space-y-8">
              {questions.map((q, qIdx) => {
                const isCorrect = userAnswers[qIdx] === q.correctAnswerIndex;
                const isSkipped = userAnswers[qIdx] === null;

                return (
                  <div 
                    key={qIdx} 
                    className={`bg-white dark:bg-gray-800 rounded-[2.5rem] p-6 md:p-10 shadow-xl border-2 transition-all ${
                      isSkipped 
                        ? 'border-gray-100 dark:border-white/5' 
                        : isCorrect 
                          ? 'border-green-500/30' 
                          : 'border-red-500/30'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                        {q.subject}
                      </span>
                      <div className="flex items-center gap-2">
                        {isSkipped ? (
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">স্কিপ করা হয়েছে</span>
                        ) : isCorrect ? (
                          <span className="flex items-center gap-1 text-[10px] font-black text-green-500 uppercase tracking-widest">
                            <CheckCircle2 size={14} /> সঠিক
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-black text-red-500 uppercase tracking-widest">
                            <AlertCircle size={14} /> ভুল
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className={`text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-8 leading-relaxed ${getFont(q.question)}`}>
                      {q.question}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.options.map((opt, i) => {
                        const isUserAnswer = userAnswers[qIdx] === i;
                        const isCorrectAnswer = q.correctAnswerIndex === i;

                        return (
                          <div
                            key={i}
                            className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all text-left ${
                              isCorrectAnswer 
                                ? 'bg-green-50 border-green-500 dark:bg-green-900/20' 
                                : isUserAnswer 
                                  ? 'bg-red-50 border-red-500 dark:bg-red-900/20'
                                  : 'bg-gray-50 border-transparent dark:bg-gray-700/30'
                            }`}
                          >
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                              isCorrectAnswer 
                                ? 'bg-green-500 text-white' 
                                : isUserAnswer 
                                  ? 'bg-red-500 text-white'
                                  : 'bg-white dark:bg-gray-600 text-gray-500 dark:text-gray-300 shadow-sm'
                            }`}>
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span className={`text-sm font-bold ${getFont(opt)} ${
                              isCorrectAnswer ? 'text-green-700 dark:text-green-300' : isUserAnswer ? 'text-red-700 dark:text-red-300' : 'text-gray-600 dark:text-gray-300'
                            }`}>
                              {opt}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-500/20">
                        <div className="flex gap-3">
                          <Info className="text-blue-500 shrink-0" size={20} />
                          <div>
                            <p className="text-xs font-black text-blue-700 dark:text-blue-300 uppercase tracking-widest mb-2">ব্যাখ্যা:</p>
                            <p className={`text-sm font-medium text-blue-800 dark:text-blue-200 leading-relaxed ${getFont(q.explanation)}`}>
                              {q.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
              <button 
                onClick={() => setStep('RESULT')}
                className="px-12 py-4 bg-gray-900 dark:bg-black text-white rounded-2xl font-black shadow-2xl transition-all active:scale-95 flex items-center gap-3"
              >
                রেজাল্ট পেজে ফিরুন
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Confirmation Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSubmitModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-2xl relative z-10 max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="text-orange-600" size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-800 dark:text-white mb-2">আপনি কি নিশ্চিত?</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 font-medium">
                আপনি {userAnswers.filter(a => a !== null).length} টি প্রশ্নের উত্তর দিয়েছেন। আপনি কি এখনই জমা দিতে চান?
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl font-black transition-all active:scale-95"
                >
                  না, আরও বাকি
                </button>
                <button 
                  onClick={() => {
                    setShowSubmitModal(false);
                    handleSubmitExam();
                  }}
                  className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-black shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                >
                  হ্যাঁ, জমা দিন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GSTGuestExam;
