
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchSavedQuestionsAPI, deleteSavedQuestionAPI, updateSavedQuestionFolderAPI } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bookmark, Trash2, ChevronLeft, 
  FolderPlus, Folder, Search,
  Zap, ChevronDown, ChevronUp,
  Filter, Eye, EyeOff,
  Save, CheckCircle
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
  const [showFilters, setShowFilters] = useState(false);
  const [isRevisionMode, setIsRevisionMode] = useState(false);
  const [expandedExplanations, setExpandedExplanations] = useState<Record<string, boolean>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
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

  const toggleExplanation = (id: string) => {
    setExpandedExplanations(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getFont = (text: string = '') => {
    const isBangla = /[\u0980-\u09FF]/.test(text);
    return isBangla ? 'font-tiro' : 'font-sans';
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
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
              onClick={() => setIsRevisionMode(!isRevisionMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isRevisionMode ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}
            >
              {isRevisionMode ? <EyeOff size={14} /> : <Eye size={14} />}
              <span className="hidden sm:inline">রিভিশন মোড</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
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
              onClick={() => setActiveFolder(folder)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all flex items-center gap-2 ${
                activeFolder === folder 
                ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' 
                : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              <Folder size={14} fill={activeFolder === folder ? 'currentColor' : 'none'} />
              {folder}
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${activeFolder === folder ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {savedQuestions.filter(sq => (sq.folder || 'General') === folder).length}
              </span>
            </button>
          ))}
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

        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="সংগ্রহশালায় খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-200 outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 text-xs font-bold ${showFilters ? 'bg-slate-100 border-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}
          >
            <Filter size={16} />
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">বিষয়</label>
                  <select 
                    value={filterSubject}
                    onChange={(e) => { setFilterSubject(e.target.value); setFilterChapter('ALL'); }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-400"
                  >
                    <option value="ALL">সব বিষয়</option>
                    {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">অধ্যায়</label>
                  <select 
                    value={filterChapter}
                    onChange={(e) => setFilterChapter(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-400"
                  >
                    <option value="ALL">সব অধ্যায়</option>
                    {uniqueChapters.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Questions List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">লোড হচ্ছে...</p>
            </div>
          ) : displayedItems.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl p-12 text-center border border-dashed border-slate-200">
              <Bookmark size={40} className="mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">খালি সংগ্রহশালা!</h3>
              <p className="text-slate-500 text-sm">আপনার সেভ করা প্রশ্নগুলো এখানে জমা হবে।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {displayedItems.map((item) => {
                const q = item.questionId;
                if (!q) return null;
                const isExpanded = expandedExplanations[item._id];

                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={item._id}
                    onClick={() => isSelectionMode && toggleSelect(item._id)}
                    className={`bg-white p-4 rounded-2xl border transition-all relative overflow-hidden ${
                      selectedIds.has(item._id) ? 'border-slate-900 ring-2 ring-slate-900/5' : 'border-slate-100 shadow-sm'
                    } ${isSelectionMode ? 'cursor-pointer' : ''}`}
                  >
                    {isSelectionMode && (
                      <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedIds.has(item._id) ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'
                      }`}>
                        {selectedIds.has(item._id) && <CheckCircle size={12} className="text-white" />}
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-wrap gap-2">
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-50 text-slate-500 rounded-full border border-slate-100">
                          {q.subject} • {q.chapter}
                        </span>
                      </div>
                      {!isSelectionMode && (
                        <div className="flex gap-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setMovingQuestionId(movingQuestionId === item._id ? null : item._id); }}
                            className="p-1.5 text-slate-400 hover:text-slate-900 transition-all"
                          >
                            <Save size={14} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className={`text-[15px] font-bold text-slate-800 leading-relaxed mb-3 ${getFont(q.question)}`}>
                      <div dangerouslySetInnerHTML={{ __html: q.question }} />
                    </div>

                    <div className="grid grid-cols-1 gap-1.5 mb-3">
                      {q.options.map((opt: string, i: number) => {
                        const isCorrect = i === q.correctAnswerIndex;
                        const userAns = userAnswers[item._id];
                        const hasAnswered = userAns !== undefined;
                        
                        let optionStyle = 'bg-slate-50 border-slate-100 text-slate-600';
                        let iconStyle = 'bg-white border-slate-200 text-slate-400';

                        if (isRevisionMode) {
                          if (hasAnswered) {
                            if (isCorrect) {
                              optionStyle = 'bg-emerald-50 border-emerald-200 text-emerald-700';
                              iconStyle = 'bg-emerald-500 border-emerald-400 text-white';
                            } else if (userAns === i) {
                              optionStyle = 'bg-red-50 border-red-200 text-red-700';
                              iconStyle = 'bg-red-500 border-red-400 text-white';
                            }
                          }
                        } else {
                          if (isCorrect) {
                            optionStyle = 'bg-emerald-50 border-emerald-200 text-emerald-700';
                            iconStyle = 'bg-emerald-500 border-emerald-400 text-white';
                          }
                        }

                        return (
                          <div 
                            key={i}
                            onClick={(e) => {
                              if (isRevisionMode && !hasAnswered && !isSelectionMode) {
                                e.stopPropagation();
                                setUserAnswers(prev => ({ ...prev, [item._id]: i }));
                              }
                            }}
                            className={`p-2.5 rounded-xl border transition-all flex items-center gap-3 ${optionStyle} ${
                              isRevisionMode && !hasAnswered && !isSelectionMode ? 'cursor-pointer hover:border-slate-300' : ''
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold border ${iconStyle}`}>
                              {String.fromCharCode(65 + i)}
                            </span>
                            <div className={`text-sm font-medium ${getFont(opt)}`} dangerouslySetInnerHTML={{ __html: opt }} />
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="border-t border-slate-100 pt-3">
                        <button 
                          onClick={() => toggleExplanation(item._id)}
                          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-all"
                        >
                          <Zap size={14} className="text-orange-500" />
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
                              <div className="mt-2 text-sm text-slate-600 leading-relaxed p-3 bg-slate-50 rounded-xl" dangerouslySetInnerHTML={{ __html: q.explanation }} />
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
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">ফোল্ডার পরিবর্তন করুন</p>
                            <div className="flex flex-wrap gap-2">
                              {availableFolders.map(f => (
                                <button
                                  key={f}
                                  onClick={() => handleMoveToFolder(item._id, f)}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
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
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
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
