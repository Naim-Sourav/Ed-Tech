
import React, { useState, useEffect, useMemo } from 'react';
import { logger } from '../utils/logger';
import SafeHtml from './SafeHtml';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchSavedQuestionsAPI, deleteSavedQuestionAPI, updateSavedQuestionFolderAPI } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bookmark, Trash2, ChevronLeft, 
  FolderPlus, Folder, Search,
  ChevronDown, ChevronUp,
  Eye, EyeOff,
  Save, CheckCircle
} from 'lucide-react';
import { useToast } from './Toast';
import { useCache } from '../contexts/CacheContext';
import { normalizeBangla, uniqueByNormalization } from '../utils/normalization';
import { usePreferences } from '../contexts/PreferencesContext';
import EmptyState from './EmptyState';

const ITEMS_PER_PAGE = 10;

const toBanglaDigits = (num: number | string): string => {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (digit) => banglaDigits[parseInt(digit, 10)]);
};

const getBanglaOptionChar = (i: number): string => {
  const chars = ['ক', 'খ', 'গ', 'ঘ'];
  return chars[i] || String.fromCharCode(65 + i);
};

interface SavedQuestionsProps {
  embedded?: boolean;
}

const SavedQuestions: React.FC<SavedQuestionsProps> = ({ embedded = false }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { questionFont, questionFontSize } = usePreferences();
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
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const [expandedExplanations, setExpandedExplanations] = useState<Record<string, boolean>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [userAnswers, setUserAnswers] = useState<Record<string, number[]>>({});
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const [pageInput, setPageInput] = useState(currentPage.toString());

  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    const main = document.querySelector('main');
    if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

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
      logger.error(_e);
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

  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  const handleBulkDelete = async () => {
    if (!currentUser || selectedIds.size === 0) return;
    
    setLoading(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => deleteSavedQuestionAPI(currentUser.uid, id)));
      setSavedQuestions(prev => prev.filter(sq => !selectedIds.has(sq._id)));
      setSelectedIds(new Set());
      setIsSelectionMode(false);
      showToast("নির্বাচিত প্রশ্নগুলো ডিলিট করা হয়েছে", "info");
    } catch (_e) {
      showToast("কিছু প্রশ্ন ডিলিট করা যায়নি", "error");
    } finally {
      setLoading(false);
      setIsDeletingBulk(false);
    }
  };

  const handleBulkMove = async (folder: string) => {
    if (!currentUser || selectedIds.size === 0) return;
    
    setLoading(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => updateSavedQuestionFolderAPI(currentUser.uid, id, folder)));
      setSavedQuestions(prev => prev.map(sq => selectedIds.has(sq._id) ? { ...sq, folder } : sq));
      setSelectedIds(new Set());
      setIsSelectionMode(false);
      showToast(`নির্বাচিত প্রশ্নগুলো ${folder} ফোল্ডারে সরানো হয়েছে`, "success");
    } catch (_e) {
      showToast("কিছু প্রশ্ন সরানো যায়নি", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const name = newFolderName.trim();
      setCustomFolders(prev => {
        if (prev.includes(name)) return prev;
        return [...prev, name];
      });
      setActiveFolder(name);
      setFilterSubject('ALL');
      setFilterChapter('ALL');
      setNewFolderName('');
      setIsCreatingFolder(false);
      showToast("নতুন ফোল্ডার তৈরি হয়েছে", "success");
    }
  };

  const { uniqueSubjects, uniqueChapters, availableFolders, subjectCounts, chapterCounts } = useMemo(() => {
    const subjects = new Set<string>();
    const chapters = new Set<string>();
    const folders = new Set<string>(['General', ...customFolders]);
    const subCounts: Record<string, number> = {};
    const chapCounts: Record<string, number> = {};
    
    savedQuestions.forEach(item => {
      const q = item.questionId;
      if (!q) return;
      if (item.folder) folders.add(item.folder);
      
      const itemFolder = item.folder || 'General';
      if (itemFolder === activeFolder) {
        if (q.subject) {
          subjects.add(q.subject);
          subCounts[q.subject] = (subCounts[q.subject] || 0) + 1;
        }
        if (q.chapter) {
          const matchesSubject = filterSubject === 'ALL' || normalizeBangla(q.subject) === normalizeBangla(filterSubject);
          if (matchesSubject) {
            chapters.add(q.chapter);
            chapCounts[q.chapter] = (chapCounts[q.chapter] || 0) + 1;
          }
        }
      }
    });

    return {
      uniqueSubjects: uniqueByNormalization(Array.from(subjects)),
      uniqueChapters: uniqueByNormalization(Array.from(chapters)),
      availableFolders: Array.from(folders),
      subjectCounts: subCounts,
      chapterCounts: chapCounts
    };
  }, [savedQuestions, filterSubject, activeFolder, customFolders]);

  const filteredItems = useMemo(() => {
    return savedQuestions.filter(item => {
      const q = item.questionId;
      if (!q) return false;
      
      const matchFolder = (item.folder || 'General') === activeFolder;
      const matchSubject = filterSubject === 'ALL' || normalizeBangla(q.subject) === normalizeBangla(filterSubject);
      const matchChapter = filterChapter === 'ALL' || normalizeBangla(q.chapter) === normalizeBangla(filterChapter);
      const matchSearch = searchQuery === '' || 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.explanation?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchFolder && matchSubject && matchChapter && matchSearch;
    });
  }, [savedQuestions, activeFolder, filterSubject, filterChapter, searchQuery]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const displayedItems = useMemo(() => {
    return filteredItems.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredItems, currentPage]);

  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise();
    }
  }, [displayedItems]);

  const toggleExplanation = (id: string) => {
    setExpandedExplanations(prev => {
      const isNowExpanded = !prev[id];
      if (isNowExpanded) {
        setTimeout(() => {
          if (window.MathJax && window.MathJax.typesetPromise) {
            const el = document.getElementById(`explanation-${id}`);
            if (el) {
              window.MathJax.typesetPromise([el]).catch((err: any) => logger.error(err));
            } else {
              window.MathJax.typesetPromise().catch((err: any) => logger.error(err));
            }
          }
        }, 80);
      }
      return { ...prev, [id]: isNowExpanded };
    });
  };

  const getFont = (text: string = '') => {
    const isBangla = /[\u0980-\u09FF]/.test(text);
    return isBangla ? questionFont : 'font-sans';
  };

  return (
    <div className={`${embedded ? 'bg-transparent text-slate-900 pb-4 dark:text-zinc-100' : 'min-h-screen bg-white text-slate-900 pb-24 dark:bg-black dark:text-zinc-100'} font-sans`}>
      {/* Header */}
      {!embedded && (
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 dark:bg-black/80 dark:border-zinc-800">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  if (window.history.length > 1) {
                    navigate(-1);
                  } else {
                    navigate('/dashboard', { replace: true });
                  }
                }}
                className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-full transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <h1 className="text-lg font-bold tracking-tight">বুকমার্ক</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                  setSelectedIds(new Set());
                }}
                className={`p-2 rounded-lg transition-all ${isSelectionMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
                title="Select Questions"
              >
                <CheckCircle size={18} />
              </button>
              <button 
                onClick={() => setShowAllAnswers(!showAllAnswers)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${showAllAnswers ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' : 'bg-slate-100 text-slate-600 dark:bg-zinc-900 dark:text-zinc-400'}`}
              >
                {showAllAnswers ? <EyeOff size={14} /> : <Eye size={14} />}
                <span className="hidden sm:inline">{showAllAnswers ? "উত্তর লুকান" : "সব উত্তর দেখুন"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`${embedded ? 'max-w-4xl mx-auto px-0 py-2 space-y-6' : 'max-w-4xl mx-auto px-4 py-6 space-y-6'}`}>
        
        {/* Folders */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          <button 
            onClick={() => setIsCreatingFolder(true)}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-100 transition-all"
          >
            <FolderPlus size={18} />
          </button>
          {availableFolders.map(folder => (
            <button
              key={folder}
              onClick={() => { setActiveFolder(folder); setFilterSubject('ALL'); setFilterChapter('ALL'); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all flex items-center gap-2 ${
                activeFolder === folder 
                ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' 
                : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              <Folder size={14} fill={activeFolder === folder ? 'currentColor' : 'none'} />
              {folder}
              <span className={`px-1.5 py-0.5 rounded-md text-[12px] ${activeFolder === folder ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {savedQuestions.filter(sq => (sq.folder || 'General') === folder).length}
              </span>
            </button>
          ))}
        </div>

        {/* Dynamic Subject & Chapter Summary under Folders */}
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button 
              onClick={() => { setFilterSubject('ALL'); setFilterChapter('ALL'); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${filterSubject === 'ALL' ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100' : 'bg-white text-slate-600 border-slate-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800'}`}
            >
              সব বিষয় ({savedQuestions.filter(sq => (sq.folder || 'General') === activeFolder).length})
            </button>
            {uniqueSubjects.map(subject => (
              <button 
                key={subject}
                onClick={() => { setFilterSubject(subject); setFilterChapter('ALL'); }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${filterSubject === subject ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100' : 'bg-white text-slate-600 border-slate-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800'}`}
              >
                {subject} ({subjectCounts[subject] || 0})
              </button>
            ))}
          </div>

          {/* Dynamic Chapter Badges List (Shown when a subject is filtered) */}
          <AnimatePresence>
            {filterSubject !== 'ALL' && uniqueChapters.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-1.5 pb-2">
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
                    <button 
                      onClick={() => setFilterChapter('ALL')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${
                        filterChapter === 'ALL' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-100 dark:shadow-none' 
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300 dark:bg-zinc-900/40 dark:text-zinc-400 dark:border-zinc-800'
                      }`}
                    >
                      সব অধ্যায় ({subjectCounts[filterSubject] || 0})
                    </button>
                    {uniqueChapters.map(chapter => {
                      const count = chapterCounts[chapter] || 0;
                      return (
                        <button 
                          key={chapter}
                          onClick={() => setFilterChapter(chapter)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${
                            filterChapter === chapter 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-100 dark:shadow-none' 
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300 dark:bg-zinc-900/40 dark:text-zinc-400 dark:border-zinc-800'
                          }`}
                        >
                          {chapter} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bulk Actions */}
        <AnimatePresence>
          {isSelectionMode && selectedIds.size > 0 && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="fixed bottom-24 left-4 right-4 z-50 max-w-4xl mx-auto"
            >
              <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full text-xs font-bold">
                    {selectedIds.size}
                  </span>
                  <span className="text-sm font-bold">নির্বাচিত</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative group">
                    <button className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all">
                      <Folder size={14} />
                      সরান
                    </button>
                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-100 hidden group-hover:block overflow-hidden">
                      {availableFolders.map(f => (
                        <button 
                          key={f}
                          onClick={() => handleBulkMove(f)}
                          className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-slate-50 border-b border-slate-50 last:border-0"
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsDeletingBulk(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-xs font-bold transition-all"
                  >
                    <Trash2 size={14} />
                    ডিলিট
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk Delete Confirmation Modal */}
        <AnimatePresence>
          {isDeletingBulk && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-xl border border-slate-100"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-2">নিশ্চিত করুন</h3>
                <p className="text-xs text-slate-500 mb-6">আপনি কি নিশ্চিতভাবে {selectedIds.size}টি প্রশ্ন ডিলিট করতে চান?</p>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsDeletingBulk(false)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs"
                  >
                    বাতিল
                  </button>
                  <button 
                    onClick={handleBulkDelete}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold text-xs"
                  >
                    ডিলিট
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Search & Answer Reveal */}
        <div className="flex gap-2">
          <div className="flex-1 relative font-sans">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" size={16} />
            <input 
              type="text"
              placeholder="সংগ্রহশালায় খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-slate-100 dark:focus:ring-zinc-800 outline-none transition-all dark:text-white"
            />
          </div>
          <button 
            onClick={() => setShowAllAnswers(!showAllAnswers)}
            className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 text-xs font-bold cursor-pointer select-none ${
              showAllAnswers 
              ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-105 dark:shadow-none' 
              : 'bg-white text-slate-600 border-slate-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
            }`}
            title={showAllAnswers ? "সব উত্তর লুকান" : "সব উত্তর দেখুন"}
          >
            {showAllAnswers ? <EyeOff size={16} /> : <Eye size={16} />}
            <span className="hidden sm:inline">{showAllAnswers ? "সব উত্তর লুকান" : "সব উত্তর দেখুন"}</span>
          </button>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-black rounded-3xl p-5 border border-gray-200 dark:border-white/[0.05]"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-white/[0.05] rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-gray-200 dark:bg-white/[0.05] rounded"></div>
                      <div className="h-3 w-24 bg-gray-200 dark:bg-white/[0.05] rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-3 pl-1">
                    <div className="h-5 w-5/6 bg-gray-200 dark:bg-white/[0.05] rounded-lg"></div>
                    <div className="h-4 w-2/3 bg-gray-200 dark:bg-white/[0.05] rounded-lg"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-5">
                    <div className="h-11 bg-gray-200 dark:bg-white/[0.05] rounded-2xl"></div>
                    <div className="h-11 bg-gray-200 dark:bg-white/[0.05] rounded-2xl"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : displayedItems.length === 0 ? (
            <EmptyState
              icon={<Bookmark size={28} className="text-gray-400" />}
              message="খালি সংগ্রহশালা! আপনার সেভ করা প্রশ্নগুলো এখানে জমা হবে।"
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {displayedItems.map((item, index) => {
                const q = item.questionId;
                if (!q) return null;
                const isExpanded = expandedExplanations[item._id];
                const itemIndexInTotal = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={item._id}
                    onClick={() => isSelectionMode && toggleSelect(item._id)}
                    className={`bg-white px-4 pt-5 pb-4 md:px-5 rounded-2xl border transition-all relative overflow-hidden dark:bg-zinc-950 dark:border-zinc-800/80 ${
                      selectedIds.has(item._id) ? 'border-slate-900 ring-2 ring-slate-900/5 dark:border-zinc-100' : 'border-slate-200/60 dark:border-zinc-800 shadow-sm'
                    } ${isSelectionMode ? 'cursor-pointer' : ''}`}
                  >
                    {isSelectionMode && (
                      <div className={`absolute top-2.5 right-2.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedIds.has(item._id) ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'
                      }`}>
                        {selectedIds.has(item._id) && <CheckCircle size={12} className="text-white" />}
                      </div>
                    )}


                    
                    {(q.contextText || q.contextImage) && (
                      <div className="mb-4 p-4 bg-sky-50/50 dark:bg-sky-900/10 rounded-2xl border border-sky-100/50 dark:border-sky-800/30">
                        <span className="text-[9px] font-black text-sky-600/50 dark:text-sky-400/50 uppercase tracking-widest mb-1 block">উদ্দীপক</span>
                        {q.contextText && <SafeHtml html={q.contextText} className="text-base md:text-[17px] font-semibold text-gray-800 dark:text-gray-200 leading-relaxed mb-2 whitespace-pre-wrap" />}
                        {q.contextImage && (
                          <img src={q.contextImage} alt="Context" className="mt-2 rounded-xl max-h-48 object-contain mx-auto border bg-white dark:bg-black/20 p-1" referrerPolicy="no-referrer" />
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-start gap-1.5 mb-3">
                        <span className="text-slate-950 dark:text-zinc-100 font-extrabold text-sm md:text-base shrink-0 select-none pt-0.5 min-w-[1.25rem]">
                            {toBanglaDigits(itemIndexInTotal)}.
                        </span>
                        <div className="flex-1">
                            <div className={`${questionFontSize} font-medium text-slate-900 dark:text-white leading-relaxed whitespace-pre-wrap ${getFont(q.question)}`}>
                              <SafeHtml html={q.question} />
                              {q.questionImage && (
                                <img src={q.questionImage} alt="Question" className="mt-2 rounded-lg max-h-48 object-contain mr-auto border bg-transparent shadow-sm" referrerPolicy="no-referrer" />
                              )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5 mb-2 pl-0 md:pl-6">
                      {q.options.map((opt: string, i: number) => {
                        const isCorrect = i === q.correctAnswerIndex;
                        const clickedList = userAnswers[item._id] || [];
                        const isClicked = clickedList.includes(i);
                        const isQuestionResolved = clickedList.includes(q.correctAnswerIndex);
                        
                        let optionStyle = 'bg-slate-50 border-slate-100 text-slate-700 dark:bg-zinc-900/40 dark:border-zinc-800/80 dark:text-zinc-300';
                        let iconStyle = 'bg-white border-slate-200 text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-500';

                        if (showAllAnswers) {
                          if (isCorrect) {
                            optionStyle = 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-500/50 dark:text-emerald-400';
                            iconStyle = 'bg-emerald-500 border-emerald-400 text-white';
                          } else if (isClicked) {
                            optionStyle = 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-500/50 dark:text-red-400';
                            iconStyle = 'bg-red-500 border-red-400 text-white';
                          }
                        } else {
                          if (isClicked) {
                            if (isCorrect) {
                              optionStyle = 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-500/50 dark:text-emerald-400';
                              iconStyle = 'bg-emerald-500 border-emerald-400 text-white';
                            } else {
                              optionStyle = 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-500/50 dark:text-red-400';
                              iconStyle = 'bg-red-500 border-red-400 text-white';
                            }
                          }
                        }

                        return (
                          <div 
                            key={i}
                            onClick={(e) => {
                              if (!isQuestionResolved && !isSelectionMode) {
                                e.stopPropagation();
                                setUserAnswers(prev => {
                                  const current = prev[item._id] || [];
                                  if (current.includes(i)) return prev;
                                  return { ...prev, [item._id]: [...current, i] };
                                });
                              }
                            }}
                            className={`p-2 rounded-xl border transition-all flex items-center gap-3 ${optionStyle} ${
                              !isQuestionResolved && !isSelectionMode ? 'cursor-pointer hover:border-slate-350 dark:hover:border-zinc-700' : ''
                            }`}
                          >
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 transition-colors ${iconStyle}`}>
                              {getBanglaOptionChar(i)}
                            </span>
                            <div className="flex flex-col gap-1 flex-1">
                              <SafeHtml html={opt} className={`${questionFontSize === 'text-xl' ? 'text-lg' : questionFontSize === 'text-lg' ? 'text-base' : 'text-sm'} font-normal whitespace-pre-wrap ${getFont(opt)}`} />
                              {q.optionsImages?.[i] && (
                                <img src={q.optionsImages[i]} alt={`Option ${i}`} className="h-16 w-fit object-contain rounded self-start bg-transparent mix-blend-multiply dark:mix-blend-normal" referrerPolicy="no-referrer" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {q.explanation && (
                      <div className="border-t border-slate-100 dark:border-zinc-800 pt-2 mt-3 block">
                        <button 
                          onClick={() => toggleExplanation(item._id)}
                          className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all ml-0 md:ml-10"
                        >
                          <span>ব্যাখ্যা</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div id={`explanation-${item._id}`} className="mt-2 ml-0 md:ml-10 p-3 bg-orange-50/50 dark:bg-orange-900/10 rounded-xl border border-orange-100/50 dark:border-orange-900/30 flex flex-col gap-2 shadow-sm overflow-hidden">
                                <SafeHtml html={q.explanation} className={`${questionFontSize === 'text-xl' ? 'text-lg' : questionFontSize === 'text-lg' ? 'text-base' : 'text-sm'} text-slate-800 dark:text-gray-200 leading-relaxed ${getFont(q.explanation)} whitespace-pre-wrap overflow-x-auto max-w-full break-words py-1 scrollbar-thin`} />
                                {q.explanationImage && (
                                  <img src={q.explanationImage} alt="Explanation" className="mt-2 rounded-lg max-h-40 object-contain border bg-transparent mr-auto" referrerPolicy="no-referrer" />
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
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
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <p className="text-[12px] font-bold text-slate-400 uppercase mb-2">ফোল্ডার পরিবর্তন করুন</p>
                            <div className="flex flex-wrap gap-2">
                              {availableFolders.map(f => (
                                <button
                                  key={f}
                                  onClick={() => handleMoveToFolder(item._id, f)}
                                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all ${
                                    (item.folder || 'General') === f
                                    ? 'bg-slate-900 text-white border-transparent'
                                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
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
                    <div className="mt-3 pt-3 border-t border-slate-55 dark:border-zinc-800 flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {q.subject && (
                          <span className="text-[9px] font-black px-2 py-1 bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-gray-400 rounded-lg uppercase tracking-tight">
                            {q.subject}
                          </span>
                        )}
                        {q.chapter && (
                          <span className="text-[9px] font-black px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 rounded-lg">
                            {q.chapter}
                          </span>
                        )}
                      </div>
                      {!isSelectionMode && (
                        <div className="flex gap-1 items-center shrink-0">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setMovingQuestionId(movingQuestionId === item._id ? null : item._id); }}
                            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all border border-transparent rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800"
                          >
                            <Save size={14} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition-all border border-transparent rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="flex items-center gap-4">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 disabled:opacity-20 hover:bg-slate-50 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <input 
                type="text"
                inputMode="numeric"
                value={pageInput}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d+$/.test(val)) {
                    setPageInput(val);
                    const num = parseInt(val);
                    if (!isNaN(num) && num >= 1 && num <= totalPages) {
                      setCurrentPage(num);
                    }
                  }
                }}
                onBlur={() => {
                  setPageInput(currentPage.toString());
                }}
                className="w-12 h-10 text-center bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-200"
              />
              <span className="text-sm font-bold text-slate-400">/ {totalPages || 1}</span>
            </div>
            <button 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 disabled:opacity-20 hover:bg-slate-50 transition-all"
            >
              <ChevronLeft size={20} className="rotate-180" />
            </button>
          </div>
          <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">
            মোট {filteredItems.length}টি প্রশ্ন
          </p>
        </div>
      </div>

      {/* Create Folder Modal */}
      <AnimatePresence>
        {isCreatingFolder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-xl border border-slate-100"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-2">নতুন ফোল্ডার</h3>
              <p className="text-xs text-slate-500 mb-4">ফোল্ডারের একটি নাম দিন।</p>
              
              <input 
                type="text"
                placeholder="নাম..."
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none mb-4 focus:ring-2 focus:ring-slate-100"
              />
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsCreatingFolder(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs"
                >
                  বাতিল
                </button>
                <button 
                  onClick={handleCreateFolder}
                  className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs"
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
