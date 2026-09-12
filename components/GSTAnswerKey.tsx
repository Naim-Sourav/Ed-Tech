
import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  CheckCircle2, 
  Info, 
  Play, 
  Share2, 
  Search,
  ArrowRight,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import { fetchQuestionsByExamRefAPI, normalizeText } from '../services/api';
import { QuizQuestion } from '../types';

declare global {
  interface Window {
    MathJax: any;
  }
}

// Sample Data Structure for GST A Unit 2025-26
// In a real scenario, this would be imported from a JSON file
const GST_A_UNIT_DATA = {
  examName: "GST A Unit Admission Exam 2025-26",
  date: "April 10, 2026",
  totalQuestions: 100,
  subjects: ["Physics", "Chemistry", "Biology", "Math", "Bangla", "English"],
  questions: [
    {
      id: "1",
      subject: "Physics",
      question: "What is the unit of magnetic flux?",
      options: ["Tesla", "Weber", "Henry", "Farad"],
      correctAnswerIndex: 1, // Index of "Weber"
      explanation: "Magnetic flux is measured in Weber (Wb). Tesla is for magnetic field density."
    },
    {
      id: "2",
      subject: "Chemistry",
      question: "Which of the following is an amphoteric oxide?",
      options: ["Na2O", "MgO", "Al2O3", "SO2"],
      correctAnswerIndex: 2, // Index of "Al2O3"
      explanation: "Al2O3 reacts with both acids and bases, making it amphoteric."
    },
    {
      id: "3",
      subject: "Biology",
      question: "Which organelle is known as the powerhouse of the cell?",
      options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi Body"],
      correctAnswerIndex: 2,
      explanation: "Mitochondria are responsible for ATP production through cellular respiration."
    },
    {
        id: "4",
        subject: "Math",
        question: "If f(x) = x^2 + 2x + 1, what is f'(1)?",
        options: ["2", "3", "4", "5"],
        correctAnswerIndex: 2,
        explanation: "f'(x) = 2x + 2. So f'(1) = 2(1) + 2 = 4."
    },
    {
        id: "5",
        subject: "Bangla",
        question: "'বিলাসী' গল্পটি কোন পত্রিকায় প্রথম প্রকাশিত হয়?",
        options: ["সবুজপত্র", "ভারতী", "প্রবাসী", "কল্লোল"],
        correctAnswerIndex: 1,
        explanation: "শরৎচন্দ্র চট্টোপাধ্যায়ের 'বিলাসী' গল্পটি ১৩২৫ বঙ্গাব্দের বৈশাখ সংখ্যায় 'ভারতী' পত্রিকায় প্রথম প্রকাশিত হয়।"
    },
    {
        id: "6",
        subject: "English",
        question: "Which one is the correct spelling?",
        options: ["Lieutenant", "Lieutunant", "Lieutanant", "Leutenant"],
        correctAnswerIndex: 0,
        explanation: "The correct spelling is 'Lieutenant'."
    }
  ]
};

const GSTAnswerKey: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const EXAM_REF = 'gst_a_unit_2025_26';

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const data = await fetchQuestionsByExamRefAPI(EXAM_REF);
        if (data && data.length > 0) {
          setQuestions(data);
        } else {
          // Fallback to sample data if nothing in DB yet
          setQuestions(GST_A_UNIT_DATA.questions);
        }
      } catch (error) {
        logger.error("Failed to load GST questions:", error);
        setQuestions(GST_A_UNIT_DATA.questions);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, []);

  const filteredQuestions = questions.filter(q => {
    const qText = normalizeText(q.question).toLowerCase();
    const sTerm = normalizeText(searchTerm).toLowerCase();
    const matchesSearch = qText.includes(sTerm);
    const matchesSubject = selectedSubject === 'All' || q.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  // Trigger MathJax rendering when questions change
  useEffect(() => {
    if (questions.length > 0 && window.MathJax) {
      setTimeout(() => {
        window.MathJax.typesetPromise().catch((err: any) => logger.error('MathJax error:', err));
      }, 200);
    }
  }, [questions, filteredQuestions]);

  const availableSubjects = ['All', ...Array.from(new Set(questions.map((q: QuizQuestion) => q.subject).filter((s): s is string => !!s)))];

  const handleTakeExam = () => {
    // Navigate to the specialized guest exam flow
    navigate('/gst-exam-live');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: GST_A_UNIT_DATA.examName,
        text: 'GST A Unit ২০২৫-২৬ এর প্রশ্ন ও উত্তরপত্র দেখে নিন আমাদের অ্যাপে!',
        url: window.location.href,
      }).catch(logger.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast("লিঙ্ক কপি করা হয়েছে", "success");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors pb-20">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-orange-600 to-red-600 pt-12 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <button 
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-white/80 hover:text-white font-bold transition-colors"
          >
            <ChevronLeft size={20} /> ফিরে যান
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold uppercase tracking-wider">
                <Sparkles size={14} className="text-yellow-300" /> Exclusive Answer Key
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
                GST A ইউনিট <br />
                <span className="text-yellow-300">২০২৫-২৬</span> প্রশ্ন ও সমাধান
              </h1>
              <p className="text-white/80 font-medium max-w-lg">
                GST A ইউনিটের ভর্তি পরীক্ষার নির্ভুল প্রশ্ন ও ব্যাখ্যাসহ সমাধান দেখে নিন। আপনার প্রস্তুতি যাচাই করতে এখনই পরীক্ষা দিন।
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={handleShare}
                className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-white transition-all active:scale-95"
                title="Share"
              >
                <Share2 size={24} />
              </button>
              <button 
                onClick={handleTakeExam}
                className="flex-1 md:flex-none px-8 py-4 bg-white text-orange-700 dark:text-orange-400 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-black/10 hover:scale-105 active:scale-95 transition-all"
              >
                <Play fill="currentColor" size={18} /> পরীক্ষা দিন
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats & Filters */}
      <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-20">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-white/5 p-4 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-500/20">
              <p className="text-[10px] font-bold text-orange-700 dark:text-orange-400 uppercase tracking-widest mb-1">মোট প্রশ্ন</p>
              <p className="text-2xl font-black text-gray-800 dark:text-white">{questions.length}</p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-500/20">
              <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">পরীক্ষার তারিখ</p>
              <p className="text-lg font-black text-gray-800 dark:text-white leading-tight">১০ এপ্রিল ২০২৬</p>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-500/20">
              <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-1">নেগেটিভ মার্ক</p>
              <p className="text-2xl font-black text-gray-800 dark:text-white">০.২৫</p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-500/20">
              <p className="text-[10px] font-bold text-orange-700 dark:text-orange-400 uppercase tracking-widest mb-1">সময়</p>
              <p className="text-2xl font-black text-gray-800 dark:text-white">৬০ মি.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="প্রশ্ন খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm font-medium"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
              {availableSubjects.map((subject: string) => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={`px-5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${selectedSubject === subject ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30' : 'bg-gray-50 dark:bg-gray-700/50 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  {subject === 'All' ? 'সব বিষয়' : subject}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="max-w-4xl mx-auto px-4 mt-8 space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-orange-700 dark:text-orange-400" size={40} />
            <p className="text-gray-500 font-bold">প্রশ্ন লোড হচ্ছে...</p>
          </div>
        ) : filteredQuestions.length > 0 ? (
          filteredQuestions.map((q, idx) => (
            <motion.div 
              key={q._id || q.id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-white/5 p-5 md:p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                  {q.subject}
                </span>
                <span className="text-xs font-bold text-gray-400">Q. {idx + 1}</span>
              </div>
              
              <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-white mb-6 leading-relaxed font-tiro">
                {q.question}
              </h3>

              {q.questionImage && (
                <div className="mb-6 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                  <img src={q.questionImage} alt="Question" className="w-full h-auto object-contain max-h-64" referrerPolicy="no-referrer" />
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {q.options.map((opt: string, i: number) => {
                  const isCorrect = q.correctAnswerIndex === i;
                  return (
                    <div 
                      key={i}
                      className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${isCorrect ? 'bg-green-50 border-green-500 dark:bg-green-900/20 dark:border-green-500/50' : 'bg-gray-50 border-transparent dark:bg-gray-700/30'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${isCorrect ? 'bg-green-500 text-white' : 'bg-white dark:bg-gray-600 text-gray-500 dark:text-gray-300 shadow-sm'}`}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className={`text-sm font-bold font-tiro ${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-300'}`}>
                          {opt}
                        </span>
                      </div>
                      {isCorrect && <CheckCircle2 size={20} className="text-green-500" />}
                    </div>
                  );
                })}
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-500/20 flex gap-3">
                <div className="mt-0.5">
                  <Info size={18} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">ব্যাখ্যা (Explanation)</p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed font-tiro">
                    {q.explanation}
                  </p>
                  {q.explanationImage && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <img src={q.explanationImage} alt="Explanation" className="w-full h-auto object-contain max-h-48" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">কোনো প্রশ্ন পাওয়া যায়নি</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">অনুগ্রহ করে অন্য কোনো কি-ওয়ার্ড দিয়ে চেষ্টা করুন।</p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 mt-12 mb-12">
        <div className="bg-gray-900 dark:bg-black rounded-[2.5rem] p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-[80px] -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/20 rounded-full blur-[80px] -ml-20 -mb-20"></div>
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-2xl md:text-4xl font-black text-white">
              আপনার প্রস্তুতি কি যথেষ্ট?
            </h2>
            <p className="text-gray-400 font-medium max-w-lg mx-auto">
              GST ভর্তি পরীক্ষার অনুরূপ হাজারো প্রশ্নের উপর পরীক্ষা দিন এবং আপনার মেধা যাচাই করুন। এখনই আমাদের অ্যাপে জয়েন করুন।
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button 
                onClick={handleTakeExam}
                className="w-full sm:w-auto px-10 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-orange-500/20 transition-all active:scale-95"
              >
                পরীক্ষা শুরু করুন <ArrowRight size={20} />
              </button>
              {!currentUser && (
                <button 
                  onClick={() => navigate('/auth')}
                  className="w-full sm:w-auto px-10 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl font-black transition-all active:scale-95"
                >
                  লগইন করুন
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GSTAnswerKey;
