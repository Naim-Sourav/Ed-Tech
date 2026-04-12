
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserMistakesAPI, deleteUserMistakeAPI } from '../services/api';
import { motion } from 'motion/react';
import { 
  AlertTriangle, Trash2, ChevronLeft, 
  Play, Search, CheckCircle
} from 'lucide-react';
import { useToast } from './Toast';
import { useCache } from '../contexts/CacheContext';

const ITEMS_PER_PAGE = 10;

const WrongQuestions: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { getCache, setCache } = useCache();
  
  const cacheKey = `wrong_questions_${currentUser?.uid}`;
  const cachedData = getCache(cacheKey) || {};

  const [mistakes, setMistakes] = useState<any[]>(cachedData.mistakes || []);
  const [loading, setLoading] = useState(!cachedData.mistakes);
  const [filterSubject, setFilterSubject] = useState<string>('ALL');
  const [filterChapter, setFilterChapter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (currentUser) {
      loadMistakes();
    }
  }, [currentUser]);

  useEffect(() => {
    setCache(cacheKey, {
      mistakes
    });
  }, [mistakes]);

  const loadMistakes = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await fetchUserMistakesAPI(currentUser.uid);
      setMistakes(data);
    } catch (_e) {
      console.error(_e);
      showToast("লোড করা যায়নি", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!currentUser) return;
    try {
      await deleteUserMistakeAPI(currentUser.uid, id);
      setMistakes(prev => prev.filter(m => m._id !== id));
      showToast("ডিলিট করা হয়েছে", "info");
    } catch (_e) {
      showToast("ডিলিট করা যায়নি", "error");
    }
  };

  const { uniqueSubjects, uniqueChapters } = useMemo(() => {
    const subjects = new Set<string>();
    const chapters = new Set<string>();
    
    mistakes.forEach(item => {
      const q = item.questionId;
      if (!q) return;
      if (q.subject) subjects.add(q.subject);
      if (q.chapter && (filterSubject === 'ALL' || q.subject === filterSubject)) {
        chapters.add(q.chapter);
      }
    });

    return {
      uniqueSubjects: Array.from(subjects),
      uniqueChapters: Array.from(chapters)
    };
  }, [mistakes, filterSubject]);

  const filteredItems = useMemo(() => {
    return mistakes.filter(item => {
      const q = item.questionId;
      if (!q) return false;
      
      const matchSubject = filterSubject === 'ALL' || q.subject === filterSubject;
      const matchChapter = filterChapter === 'ALL' || q.chapter === filterChapter;
      const matchSearch = searchQuery === '' || 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.explanation?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchSubject && matchChapter && matchSearch;
    });
  }, [mistakes, filterSubject, filterChapter, searchQuery]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const displayedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise();
    }
  }, [displayedItems]);

  const startPractice = () => {
    if (filteredItems.length === 0) {
      showToast("কোনো প্রশ্ন নেই", "info");
      return;
    }
    navigate('/quiz', { state: { mode: 'WRONG_QUESTIONS' } });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-600 dark:text-gray-300" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">ভুল প্রশ্ন</h1>
            <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">ভুল থেকে শিক্ষা নিন</p>
          </div>
          <button 
            onClick={startPractice}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-black text-xs shadow-lg shadow-red-500/20 active:scale-95"
          >
            <Play size={16} fill="currentColor" /> প্র্যাকটিস
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Banner */}
        <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-[2.5rem] p-6 text-white shadow-xl shadow-red-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">মোট ভুল প্রশ্ন</p>
              <h2 className="text-4xl font-black tracking-tighter">{mistakes.length}টি</h2>
            </div>
            <div className="p-4 bg-white/20 backdrop-blur-md rounded-[1.5rem] border border-white/20">
              <AlertTriangle size={32} />
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="ভুল প্রশ্ন খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
            />
          </div>
          
          <div className="flex gap-2">
            <select 
              value={filterSubject}
              onChange={(e) => { setFilterSubject(e.target.value); setFilterChapter('ALL'); }}
              className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 outline-none"
            >
              <option value="ALL">সকল বিষয়</option>
              {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select 
              value={filterChapter}
              onChange={(e) => setFilterChapter(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 outline-none"
            >
              <option value="ALL">সকল অধ্যায়</option>
              {uniqueChapters.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Mistakes List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-sm font-bold text-gray-400">লোড হচ্ছে...</p>
            </div>
          ) : displayedItems.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-12 text-center border border-dashed border-gray-200 dark:border-white/10">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">কোনো ভুল প্রশ্ন নেই!</h3>
              <p className="text-sm text-gray-400">আপনি দারুণ করছেন, এভাবেই চালিয়ে যান</p>
            </div>
          ) : (
            displayedItems.map((item, idx) => {
              const q = item.questionId;
              if (!q) return null;
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={item._id}
                  className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-red-500/10 text-red-600 text-[10px] font-black rounded-full uppercase tracking-wider">{q.subject}</span>
                      <span className="px-3 py-1 bg-orange-500/10 text-orange-600 text-[10px] font-black rounded-full uppercase tracking-wider">{q.chapter}</span>
                    </div>
                    <button 
                      onClick={() => handleDelete(item._id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-200 leading-relaxed mb-4">
                    <div dangerouslySetInnerHTML={{ __html: q.question }} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {q.options.map((opt: string, i: number) => (
                      <div 
                        key={i}
                        className={`p-3 rounded-xl text-xs font-medium border ${
                          i === q.correctAnswerIndex 
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400' 
                          : 'bg-gray-50 dark:bg-zinc-900/50 border-gray-100 dark:border-white/5 text-gray-600 dark:text-zinc-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-[10px] font-black border border-inherit">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <div dangerouslySetInnerHTML={{ __html: opt }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {q.explanation && (
                    <div className="mt-4 p-4 bg-blue-50/50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-500/10">
                      <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">ব্যাখ্যা</p>
                      <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: q.explanation }} />
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 py-8">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 text-gray-600 dark:text-gray-300 disabled:opacity-50 shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-xs font-bold text-gray-500">
            পৃষ্ঠা <span className="text-primary">{currentPage}</span> / {totalPages || 1}
          </span>
          <button 
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 text-gray-600 dark:text-gray-300 disabled:opacity-50 shadow-sm"
          >
            <ChevronLeft size={20} className="rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WrongQuestions;
