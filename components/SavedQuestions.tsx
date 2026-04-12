
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchSavedQuestionsAPI, deleteSavedQuestionAPI, updateSavedQuestionFolderAPI } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bookmark, Trash2, ChevronLeft, 
  FolderPlus, Folder, MoreVertical, Search
} from 'lucide-react';
import { useToast } from './Toast';
import { useCache } from '../contexts/CacheContext';

const ITEMS_PER_PAGE = 10;

const SavedQuestions: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { getCache, setCache } = useCache();
  
  const cacheKey = `saved_questions_${currentUser?.uid}`;
  const cachedData = getCache(cacheKey) || {};

  const [savedQuestions, setSavedQuestions] = useState<any[]>(cachedData.savedQuestions || []);
  const [loading, setLoading] = useState(!cachedData.savedQuestions);
  const [activeFolder, setActiveFolder] = useState<string>(cachedData.activeFolder || 'General');
  const [customFolders, setCustomFolders] = useState<string[]>(cachedData.customFolders || []);
  const [filterSubject, setFilterSubject] = useState<string>('ALL');
  const [filterChapter, setFilterChapter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [movingQuestionId, setMovingQuestionId] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      loadSavedQuestions();
    }
  }, [currentUser]);

  useEffect(() => {
    setCache(cacheKey, {
      savedQuestions,
      activeFolder,
      customFolders
    });
  }, [savedQuestions, activeFolder, customFolders]);

  const loadSavedQuestions = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await fetchSavedQuestionsAPI(currentUser.uid);
      const sortedData = data.sort((a: any, b: any) => {
        const dateA = a.savedAt ? new Date(a.savedAt).getTime() : 0;
        const dateB = b.savedAt ? new Date(b.savedAt).getTime() : 0;
        return dateB - dateA;
      });
      setSavedQuestions(sortedData);
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
      await deleteSavedQuestionAPI(currentUser.uid, id);
      setSavedQuestions(prev => prev.filter(sq => sq._id !== id));
      showToast("ডিলিট করা হয়েছে", "info");
    } catch (_e) {
      showToast("ডিলিট করা যায়নি", "error");
    }
  };

  const handleMoveToFolder = async (savedId: string, folder: string) => {
    if (!currentUser) return;
    try {
      await updateSavedQuestionFolderAPI(currentUser.uid, savedId, folder);
      setSavedQuestions(prev => prev.map(sq => sq._id === savedId ? { ...sq, folder } : sq));
      setMovingQuestionId(null);
      showToast(`${folder} ফোল্ডারে সরানো হয়েছে`, "success");
    } catch (_e) {
      showToast("মুভ করা যায়নি", "error");
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const name = newFolderName.trim();
      setCustomFolders(prev => {
        if (prev.includes(name)) return prev;
        return [...prev, name];
      });
      setActiveFolder(name);
      setNewFolderName('');
      setIsCreatingFolder(false);
      showToast("নতুন ফোল্ডার তৈরি হয়েছে", "success");
    }
  };

  const { uniqueSubjects, uniqueChapters, availableFolders } = useMemo(() => {
    const subjects = new Set<string>();
    const chapters = new Set<string>();
    const folders = new Set<string>(['General', ...customFolders]);
    
    savedQuestions.forEach(item => {
      const q = item.questionId;
      if (!q) return;
      if (q.subject) subjects.add(q.subject);
      if (q.chapter && (filterSubject === 'ALL' || q.subject === filterSubject)) {
        chapters.add(q.chapter);
      }
      if (item.folder) folders.add(item.folder);
    });

    return {
      uniqueSubjects: Array.from(subjects),
      uniqueChapters: Array.from(chapters),
      availableFolders: Array.from(folders)
    };
  }, [savedQuestions, filterSubject, customFolders]);

  const filteredItems = useMemo(() => {
    return savedQuestions.filter(item => {
      const q = item.questionId;
      if (!q) return false;
      
      const matchFolder = (item.folder || 'General') === activeFolder;
      const matchSubject = filterSubject === 'ALL' || q.subject === filterSubject;
      const matchChapter = filterChapter === 'ALL' || q.chapter === filterChapter;
      const matchSearch = searchQuery === '' || 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.explanation?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchFolder && matchSubject && matchChapter && matchSearch;
    });
  }, [savedQuestions, activeFolder, filterSubject, filterChapter, searchQuery]);

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
            <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">সেভ্ড কোশ্চেন</h1>
            <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">আপনার সংগ্রহশালা</p>
          </div>
          <button 
            onClick={() => setIsCreatingFolder(true)}
            className="p-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors"
          >
            <FolderPlus size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Folders Scroll */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {availableFolders.map(folder => (
            <button
              key={folder}
              onClick={() => setActiveFolder(folder)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                activeFolder === folder 
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent shadow-lg scale-105' 
                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-zinc-400 border-gray-100 dark:border-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <Folder size={14} fill={activeFolder === folder ? 'currentColor' : 'none'} />
                {folder}
              </div>
            </button>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="প্রশ্ন খুঁজুন..."
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

        {/* Questions List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-sm font-bold text-gray-400">লোড হচ্ছে...</p>
            </div>
          ) : displayedItems.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-12 text-center border border-dashed border-gray-200 dark:border-white/10">
              <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <Bookmark size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">কোনো প্রশ্ন পাওয়া যায়নি</h3>
              <p className="text-sm text-gray-400">আপনার সেভ করা প্রশ্নগুলো এখানে জমা হবে</p>
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
                      <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-wider">{q.subject}</span>
                      <span className="px-3 py-1 bg-orange-500/10 text-orange-600 text-[10px] font-black rounded-full uppercase tracking-wider">{q.chapter}</span>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => setMovingQuestionId(movingQuestionId === item._id ? null : item._id)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item._id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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

                  <AnimatePresence>
                    {movingQuestionId === item._id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                          <p className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest">ফোল্ডার পরিবর্তন করুন</p>
                          <div className="flex flex-wrap gap-2">
                            {availableFolders.map(f => (
                              <button
                                key={f}
                                onClick={() => handleMoveToFolder(item._id, f)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                                  (item.folder || 'General') === f
                                  ? 'bg-primary text-white border-transparent'
                                  : 'bg-gray-50 dark:bg-zinc-900 text-gray-500 border-gray-200 dark:border-white/5'
                                }`}
                              >
                                {f}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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

      {/* Create Folder Modal */}
      <AnimatePresence>
        {isCreatingFolder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 dark:border-white/5"
            >
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">নতুন ফোল্ডার</h3>
              <p className="text-xs text-gray-400 mb-6">আপনার প্রশ্নগুলো গুছিয়ে রাখতে ফোল্ডার তৈরি করুন</p>
              
              <input 
                type="text"
                placeholder="ফোল্ডারের নাম..."
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-white/5 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none mb-6"
              />
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsCreatingFolder(false)}
                  className="flex-1 py-4 bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 rounded-2xl font-bold text-sm"
                >
                  বাতিল
                </button>
                <button 
                  onClick={handleCreateFolder}
                  className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20"
                >
                  তৈরি করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SavedQuestions;
