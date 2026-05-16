
import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchSavedQuestionsAPI, deleteSavedQuestionAPI, fetchUserStatsAPI, fetchUserMistakesAPI, deleteUserMistakeAPI, updateSavedQuestionFolderAPI } from '../services/api';
import { uploadImageToCloudinary } from '../services/imageUpload';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Edit2, X, BookOpen, Award, Calendar, Bookmark, Trash2, ChevronRight, LayoutGrid, List, BarChart3, Filter, GraduationCap, Briefcase, Target, PieChart, RefreshCw, AlertTriangle, Play, FolderPlus, Folder, MoveRight, Upload, Loader2, Lock, Swords, CheckCircle, ChevronDown, FileQuestion, ChevronLeft, Sparkles, Check } from 'lucide-react';
import { useToast } from './Toast';
import { useCache } from '../contexts/CacheContext';
import { normalizeBangla, uniqueByNormalization } from '../utils/normalization';


const AVATARS: string[] = [];

const ITEMS_PER_PAGE = 10; // Limits items per page to prevent full-page PDF saves

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>(); // Get userID from URL params
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, userAvatar, enrolledCourses, extendedProfile, updateUserProfile } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { getCache, setCache } = useCache();
  
  // Logic to determine if you viewing own profile
  const isOwnProfile = !userId || (currentUser && currentUser.uid === userId);
  const viewingUserId = isOwnProfile ? currentUser?.uid : userId;
  const cacheKey = `profile_${viewingUserId}`;

  // Cache Initialization
  const cachedData = getCache(cacheKey) || {};

  // Tab State derived from URL
  const activeTab = (searchParams.get('tab') as 'INFO' | 'COURSES' | 'SAVED' | 'MISTAKES') || 'INFO';
  
  const setActiveTab = (tab: string) => {
      setSearchParams({ tab });
  };
  
  // Profile Data State
  const [profileData, setProfileData] = useState<any>(cachedData.profileData || {
      displayName: '',
      photoURL: '',
      email: '',
      college: '',
      hscBatch: '',
      department: 'Science',
      target: 'Medical',
      stats: null
  });

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [editCollege, setEditCollege] = useState('');
  const [editHscBatch, setEditHscBatch] = useState('');
  const [editDepartment, setEditDepartment] = useState('Science');
  const [editTarget, setEditTarget] = useState('Medical');

  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  const [loading, setLoading] = useState(!cachedData.profileData); // Only load if no cache
  
  // Image Upload State
  const [isUploading, setIsUploading] = useState(false);

  // Saved Questions State
  const [savedQuestions, setSavedQuestions] = useState<any[]>(cachedData.savedQuestions || []);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [activeFolder, setActiveFolder] = useState<string>(cachedData.activeFolder || 'General');
  const [newFolderName, setNewFolderName] = useState('');
  const [customFolders, setCustomFolders] = useState<string[]>(cachedData.customFolders || []); 
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [movingQuestionId, setMovingQuestionId] = useState<string | null>(null);

  // Mistakes State
  const [mistakes, setMistakes] = useState<any[]>(cachedData.mistakes || []);
  const [loadingMistakes, setLoadingMistakes] = useState(false);
  
  // Separate Filter States for Saved and Mistakes
  const [savedFilterSubject, setSavedFilterSubject] = useState<string>(cachedData.savedFilterSubject || 'ALL');
  const [savedFilterChapter, setSavedFilterChapter] = useState<string>(cachedData.savedFilterChapter || 'ALL');

  const [mistakeFilterSubject, setMistakeFilterSubject] = useState<string>(cachedData.mistakeFilterSubject || 'ALL');
  const [mistakeFilterChapter, setMistakeFilterChapter] = useState<string>(cachedData.mistakeFilterChapter || 'ALL');

  // Helpers to get current filter based on active tab
  const currentFilterSubject = activeTab === 'SAVED' ? savedFilterSubject : mistakeFilterSubject;
  const currentFilterChapter = activeTab === 'SAVED' ? savedFilterChapter : mistakeFilterChapter;

  const setCurrentFilterSubject = (val: string) => {
      if (activeTab === 'SAVED') setSavedFilterSubject(val);
      else if (activeTab === 'MISTAKES') setMistakeFilterSubject(val);
  };

  const setCurrentFilterChapter = (val: string) => {
      if (activeTab === 'SAVED') setSavedFilterChapter(val);
      else if (activeTab === 'MISTAKES') setMistakeFilterChapter(val);
  };

  const resetCurrentFilters = () => {
      setCurrentFilterSubject('ALL');
      setCurrentFilterChapter('ALL');
  };

  // Pagination State
  const [currentPage, setCurrentPage] = useState(cachedData.currentPage || 1);

  // Stats Expansion State
  const [expandedSubjectStats, setExpandedSubjectStats] = useState<Set<string>>(new Set());

  // Exam Config Modal
  const [showExamConfig, setShowExamConfig] = useState(false);
  const [examTimeLimit, setExamTimeLimit] = useState(0);
  const [examViewMode, _setExamViewMode] = useState<'SINGLE' | 'LIST'>('SINGLE');

  // Scroll Restoration
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (scrollContainerRef.current && cachedData.scrollTop) {
        scrollContainerRef.current.scrollTop = cachedData.scrollTop;
    }
  }, []);

  // Save State to Cache on Unmount or Change
  useEffect(() => {
    const saveState = () => {
        setCache(cacheKey, {
            activeTab, // Note: activeTab is now derived from URL, but cached for init if needed
            profileData,
            savedQuestions,
            mistakes,
            activeFolder,
            customFolders,
            // Save separated filters
            savedFilterSubject,
            savedFilterChapter,
            mistakeFilterSubject,
            mistakeFilterChapter,
            currentPage,
            scrollTop: scrollContainerRef.current?.scrollTop || 0
        });
    };
    saveState(); // Save on every change
    return saveState; // And on unmount
  }, [activeTab, profileData, savedQuestions, mistakes, activeFolder, customFolders, savedFilterSubject, savedFilterChapter, mistakeFilterSubject, mistakeFilterChapter, currentPage, setCache, cacheKey]);

  // Reset pagination when filter changes
  useEffect(() => {
      setCurrentPage(1);
  }, [currentFilterSubject, currentFilterChapter, activeFolder, activeTab]);


  // --- DATA LOADING ---
  useEffect(() => {
    const loadProfileData = async () => {
        if (!viewingUserId) return;
        
        // Use cache if available, but fetch background update if needed (Stale-While-Revalidate could be implemented, but here we just fetch if empty)
        if (!cachedData.profileData) {
            setLoading(true);
        }

        try {
            if (isOwnProfile) {
                // Initialize edit fields
                setNewName(currentUser?.displayName || '');
                setSelectedAvatar(userAvatar || AVATARS[0]);
                setEditCollege(extendedProfile?.college || '');
                setEditHscBatch(extendedProfile?.hscBatch || '');
                setEditDepartment(extendedProfile?.department || 'Science');
                setEditTarget(extendedProfile?.target || 'Medical');

                // If we don't have stats or want to refresh
                if (!profileData.stats) {
                    const data = await fetchUserStatsAPI(viewingUserId);
                    setProfileData((prev: any) => ({ 
                        ...prev, 
                        displayName: currentUser?.displayName || '',
                        photoURL: userAvatar,
                        email: currentUser?.email || '',
                        college: extendedProfile?.college || '',
                        hscBatch: extendedProfile?.hscBatch || '',
                        department: extendedProfile?.department || 'Science',
                        target: extendedProfile?.target || 'Medical',
                        stats: data 
                    }));
                }
            } else {
                const data = await fetchUserStatsAPI(viewingUserId);
                if (data) {
                    setProfileData({
                        displayName: data.user?.displayName || 'Unknown User',
                        photoURL: data.user?.photoURL || AVATARS[0],
                        email: '',
                        college: data.user?.college || '',
                        hscBatch: data.user?.hscBatch || '',
                        department: data.user?.department || '',
                        target: data.user?.target || '',
                        stats: data
                    });
                }
            }
        } catch (e) {
            console.error("Profile load error", e);
        } finally {
            setLoading(false);
        }
    };
    loadProfileData();
  }, [viewingUserId, isOwnProfile, currentUser, userAvatar, extendedProfile]);

  useEffect(() => {
    if (activeTab === 'SAVED' && isOwnProfile && viewingUserId && savedQuestions.length === 0) {
      loadSavedQuestions();
    }
    // MISTAKES Tab Logic: Always fetch to ensure freshness, even if cache exists (Silent Refresh)
    if (activeTab === 'MISTAKES' && isOwnProfile && viewingUserId) {
      loadMistakes(!!mistakes.length); // Pass true if we have cached data to suppress loading spinner
    }
  }, [activeTab, viewingUserId, isOwnProfile]);

  const loadSavedQuestions = async () => {
    if (!viewingUserId) return;
    setLoadingSaved(true);
    try {
      const data = await fetchSavedQuestionsAPI(viewingUserId);
      const sortedData = data.sort((a: any, b: any) => {
          const dateA = a.savedAt ? new Date(a.savedAt).getTime() : 0;
          const dateB = b.savedAt ? new Date(b.savedAt).getTime() : 0;
          return dateB - dateA;
      });
      setSavedQuestions(sortedData);
    } catch (e) { console.error(e); } finally { setLoadingSaved(false); }
  };

  const loadMistakes = async (silent = false) => {
    if (!viewingUserId) return;
    if (!silent) setLoadingMistakes(true);
    try {
      const data = await fetchUserMistakesAPI(viewingUserId);
      setMistakes(data);
    } catch (e) { 
        console.error(e); 
    } finally { 
        setLoadingMistakes(false); 
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateUserProfile(newName, selectedAvatar, {
          college: editCollege, 
          hscBatch: editHscBatch, 
          department: editDepartment, 
          target: editTarget
      });
      
      // FIX: Manually update local state to reflect changes immediately
      // This bypasses the need for a refresh as the cache is also updated by the existing useEffect
      setProfileData((prev: any) => ({
          ...prev,
          displayName: newName,
          photoURL: selectedAvatar,
          college: editCollege,
          hscBatch: editHscBatch,
          department: editDepartment,
          target: editTarget
      }));

      setIsEditing(false);
      setShowAvatarSelector(false);
      showToast("প্রোফাইল আপডেট হয়েছে", "success");
    } catch (error) {
      console.error(error);
      showToast("আপডেট ব্যর্থ হয়েছে", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
        const url = await uploadImageToCloudinary(file);
        setSelectedAvatar(url);
        setShowAvatarSelector(false);
    } catch (_e) { showToast("Upload Failed", "error"); } finally { setIsUploading(false); }
  };

  const handleDeleteSaved = async (id: string) => {
    if (!currentUser) return;
    await deleteSavedQuestionAPI(currentUser.uid, id);
    setSavedQuestions(prev => prev.filter(sq => sq._id !== id));
    showToast("ডিলিট করা হয়েছে", "info");
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
          setCustomFolders((prev: string[]) => {
              if (prev.includes(name)) return prev;
              return [...prev, name];
          });
          setActiveFolder(name);
          setNewFolderName('');
          setIsCreatingFolder(false);
          showToast("নতুন ফোল্ডার তৈরি হয়েছে", "success");
      }
  };

  const handleDeleteMistake = async (id: string) => {
    if (!currentUser) return;
    await deleteUserMistakeAPI(currentUser.uid, id);
    setMistakes(prev => prev.filter(m => m._id !== id));
    showToast("ডিলিট করা হয়েছে", "info");
  };

  const handleChallenge = () => {
      if (!viewingUserId) return;
      navigate('/battle', { 
          state: { 
              opponent: {
                  uid: viewingUserId,
                  name: profileData.displayName,
                  avatar: profileData.photoURL
              }
          } 
      });
  };

  const toggleSubjectStats = (subject: string) => {
      setExpandedSubjectStats((prev: Set<string>) => {
          const newSet = new Set(prev);
          if (newSet.has(subject)) newSet.delete(subject);
          else newSet.add(subject);
          return newSet;
      });
  };

  // --- Filtering Logic ---
  const { uniqueSubjects, uniqueChapters, availableFolders } = useMemo(() => {
    const subjects = new Set<string>();
    const chapters = new Set<string>();
    
    // Initial standard folders + custom created ones (Removed 'All')
    const folders = new Set<string>(['General', ...customFolders]);
    
    const sourceData = activeTab === 'SAVED' ? savedQuestions : mistakes;

    sourceData.forEach(item => {
        // Both SAVED and MISTAKES now use nested questionId reference
        const q = item.questionId;
        if (!q) return;
        
        if (q.subject) subjects.add(q.subject);
        if (q.chapter) {
            // Use currentFilterSubject to determine chapters available
            if (currentFilterSubject === 'ALL' || q.subject === currentFilterSubject) {
                chapters.add(q.chapter);
            }
        }
        if (activeTab === 'SAVED' && item.folder) {
            folders.add(item.folder);
        }
    });

    return {
        uniqueSubjects: uniqueByNormalization(Array.from(subjects)),
        uniqueChapters: uniqueByNormalization(Array.from(chapters)),
        availableFolders: Array.from(folders)
    };
  }, [activeTab, savedQuestions, mistakes, currentFilterSubject, customFolders]);

  const filteredItems = useMemo(() => {
      let sourceData = activeTab === 'SAVED' ? savedQuestions : mistakes;
      
      // Apply Folder Filter First (only for saved)
      if (activeTab === 'SAVED') {
          sourceData = sourceData.filter(item => (item.folder || 'General') === activeFolder);
      }

      // Apply Subject & Chapter Filter using separate states
      return sourceData.filter(item => {
          const q = item.questionId;
          if (!q) return false;
          
          const matchSubject = currentFilterSubject === 'ALL' || normalizeBangla(q.subject) === normalizeBangla(currentFilterSubject);
          const matchChapter = currentFilterChapter === 'ALL' || normalizeBangla(q.chapter) === normalizeBangla(currentFilterChapter);
          
          return matchSubject && matchChapter;
      });
  }, [activeTab, savedQuestions, mistakes, currentFilterSubject, currentFilterChapter, activeFolder]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const displayedItems = filteredItems.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  // MathJax Effect - Robust polling to ensure rendering
  useEffect(() => {
    let attempts = 0;
    
    const intervalId = setInterval(() => {
      attempts++;
      const savedContainer = document.getElementById('saved-questions-container');
      const mistakesContainer = document.getElementById('mistakes-container');
      
      if (window.MathJax && window.MathJax.typesetPromise && (savedContainer || mistakesContainer)) {
        const targets = [];
        if (savedContainer) targets.push(savedContainer);
        if (mistakesContainer) targets.push(mistakesContainer);
        
        window.MathJax.typesetPromise(targets)
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
  }, [activeTab, displayedItems, loadingSaved, loadingMistakes]);

  // Exam Logic for Mistakes
  const launchExam = () => {
    if (activeTab !== 'MISTAKES') return;
    const examQuestions = filteredItems.map(m => {
        const q = m.questionId;
        if (!q) return null;
        return {
            _id: q._id, // IMPORTANT: Pass ID for clearing logic
            question: q.question,
            options: q.options,
            correctAnswerIndex: q.correctAnswerIndex,
            explanation: q.explanation,
            subject: q.subject,
            chapter: q.chapter,
            topic: q.topic
        };
    }).filter(q => q !== null);
    
    if (examQuestions.length === 0) return;
    
    const examId = `mistake_retry_${Date.now()}`;
    const config = {
        questions: examQuestions,
        timeLimit: examTimeLimit,
        mode: examViewMode,
        title: 'Mistake Revision',
        isPracticeMode: true,
        isMistakeRetake: true // Enable mistake clearing feature
    };
    
    localStorage.setItem(`exam_config_${examId}`, JSON.stringify(config));
    setShowExamConfig(false);
    navigate(`/exam/${examId}`);
  };

  const getLevel = (points: number) => {
    if (points < 100) return { name: 'Novice', color: 'bg-gray-400' };
    if (points < 500) return { name: 'Apprentice', color: 'bg-orange-500' };
    if (points < 1000) return { name: 'Scholar', color: 'bg-orange-600' };
    if (points < 2000) return { name: 'Master', color: 'bg-orange-700' };
    return { name: 'Grandmaster', color: 'bg-orange-500' };
  };

  const currentLevel = getLevel(profileData.stats?.points || 0);

  // Helper to render Avatar
  const renderProfileAvatar = () => {
    const avatarUrl = isEditing ? selectedAvatar : profileData.photoURL;
    const content = (avatarUrl && avatarUrl.startsWith('http') && avatarUrl !== 'false') ? (
        <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover bg-white" />
    ) : (
        <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold text-2xl md:text-3xl">
            {profileData.displayName?.charAt(0).toUpperCase() || 'U'}
        </div>
    );

    return (
        <>
            {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                    <Loader2 className="animate-spin text-white" size={24} />
                </div>
            )}
            {content}
        </>
    );
  };

  // Skeleton Loader for Profile
  const ProfileSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-[2.5rem] p-8 border border-gray-200 dark:border-gray-700 h-72 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gray-200/50 dark:bg-gray-700/50"></div>
            <div className="relative flex flex-col md:flex-row items-center gap-8 mt-12">
                <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-600 border-4 border-white dark:border-gray-800 shadow-xl"></div>
                <div className="space-y-4 flex-1 w-full text-center md:text-left">
                    <div className="h-8 w-1/2 bg-gray-300 dark:bg-gray-600 rounded-2xl mx-auto md:mx-0"></div>
                    <div className="flex gap-3 justify-center md:justify-start">
                        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    </div>
                </div>
            </div>
        </div>
        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-[2rem] border border-gray-200 dark:border-gray-700"></div>
            ))}
        </div>
    </div>
  );

  if (loading && !profileData.stats) {
      return <div className="h-full p-4 md:p-8"><ProfileSkeleton /></div>;
  }

  // Helper component for Filters
  const FilterSection = () => (
      <div className="flex flex-wrap items-center gap-3 bg-gray-50/50 dark:bg-gray-900/50 p-2 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-inner animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-center text-gray-400 px-2"><Filter size={16}/></div>
          <select 
              value={currentFilterSubject} 
              onChange={(e) => { setCurrentFilterSubject(e.target.value); setCurrentFilterChapter('ALL'); }}
              className="flex-1 min-w-[100px] px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border-none text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary shadow-sm truncate"
          >
              <option value="ALL">সকল বিষয়</option>
              {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select 
              value={currentFilterChapter} 
              onChange={(e) => setCurrentFilterChapter(e.target.value)}
              className="flex-1 min-w-[100px] px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border-none text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary shadow-sm truncate"
          >
              <option value="ALL">সকল অধ্যায়</option>
              {uniqueChapters.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button 
            onClick={resetCurrentFilters}
            className="text-[10px] text-red-500 hover:text-red-600 font-bold px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors whitespace-nowrap"
          >
            রিসেট
          </button>
      </div>
  );

  // Pagination Component
  const PaginationControls = () => {
      if (totalPages <= 1) return null;
      return (
          <div className="flex justify-center items-center gap-4 mt-8">
              <button 
                  onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-90"
              >
                  <ChevronLeft size={20} />
              </button>
              <span className="text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-6 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
                  Page <span className="text-primary">{currentPage}</span> of {totalPages}
              </span>
              <button 
                  onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-90"
              >
                  <ChevronRight size={20} />
              </button>
          </div>
      );
  };

  return (
    <div 
        ref={scrollContainerRef}
        className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors no-scrollbar"
    >
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-10 pb-24">
        
        {/* Header Section - Native App Style */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-10 border border-gray-200 dark:border-white/5 shadow-sm relative overflow-hidden group">
          {/* Enhanced Background Pattern */}
          <div className="absolute top-0 left-0 w-full h-full opacity-40 dark:opacity-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-br from-primary/30 via-orange-500/20 to-transparent"></div>
            <div className="absolute top-10 right-10 w-64 h-64 bg-primary/20 rounded-full blur-[100px]"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px]"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
          </div>
          
          {/* Top Corner Edit Button - Native Style */}
          <div className="absolute top-6 right-6 z-30">
             {isOwnProfile && !isEditing && (
               <motion.button 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsEditing(true)}
                  className="p-3.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl text-primary hover:shadow-primary/20 transition-all flex items-center justify-center"
               >
                  <Edit2 size={18} strokeWidth={2.5} />
               </motion.button>
             )}
          </div>

          <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 mt-4 md:mt-8">
            {/* Avatar & User Info */}
            <div className="relative">
               <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="w-28 h-28 md:w-40 md:h-40 rounded-[2.5rem] border-4 border-white dark:border-gray-800 shadow-2xl overflow-hidden bg-gray-100 dark:bg-zinc-800 flex items-center justify-center relative z-10"
               >
                  {renderProfileAvatar()}
               </motion.div>
               {isEditing && isOwnProfile && (
                 <motion.button 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                    className="absolute -bottom-2 -right-2 p-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl hover:scale-110 transition-transform shadow-xl z-20 border-2 border-white dark:border-gray-800"
                 >
                    <Camera size={18} />
                 </motion.button>
               )}
               {showAvatarSelector && (
                   <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 mt-4 bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 z-50 w-72 backdrop-blur-xl"
                   >
                       <p className="text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-4">প্রোফাইল ছবি</p>

                       <label className="flex items-center justify-center gap-3 w-full py-4 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl text-sm font-bold cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors border border-dashed border-gray-200 dark:border-white/10">
                           <Upload size={18} className="text-primary"/> ছবি আপলোড করুন
                           <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                       </label>
                   </motion.div>
               )}
            </div>

            <div className="flex-1 text-center md:text-left space-y-3 w-full">
               {isEditing && isOwnProfile ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full bg-gray-50/50 dark:bg-zinc-900/30 p-5 rounded-3xl border border-gray-100 dark:border-white/5">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] md:text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{t('auth_name')}</label>
                      <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-zinc-800 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"/>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] md:text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider">College</label>
                      <input type="text" value={editCollege} onChange={(e) => setEditCollege(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-zinc-800 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"/>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] md:text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Batch</label>
                      <input type="text" value={editHscBatch} onChange={(e) => setEditHscBatch(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-zinc-800 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"/>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] md:text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Department</label>
                      <select value={editDepartment} onChange={(e) => setEditDepartment(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-zinc-800 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"><option>Science</option><option>Arts</option><option>Commerce</option></select>
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="block text-[10px] md:text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Target</label>
                      <select value={editTarget} onChange={(e) => setEditTarget(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-zinc-800 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"><option>Medical</option><option>Engineering</option><option>University</option><option>Guccho</option></select>
                    </div>
                 </div>
               ) : (
                 <div className="space-y-4">
                    <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 justify-center md:justify-start">
                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">{profileData.displayName}</h1>
                        {profileData.stats && (
                            <motion.span 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`px-4 py-1 rounded-full text-[10px] md:text-xs font-black text-white uppercase tracking-widest shadow-lg ${currentLevel.color.replace('bg-', 'bg-')}`}
                            >
                                {currentLevel.name}
                            </motion.span>
                        )}
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3 text-[11px] md:text-sm text-gray-600 dark:text-gray-300 mt-2">
                       {profileData.college && <div className="flex items-center gap-2 bg-gray-100/80 dark:bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200/50 dark:border-white/5 font-bold"><GraduationCap size={16} className="text-primary"/> {profileData.college}</div>}
                       {profileData.hscBatch && <div className="flex items-center gap-2 bg-gray-100/80 dark:bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200/50 dark:border-white/5 font-bold"><Calendar size={16} className="text-orange-500"/> Batch: {profileData.hscBatch}</div>}
                       {profileData.department && <div className="flex items-center gap-2 bg-gray-100/80 dark:bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200/50 dark:border-white/5 font-bold"><Briefcase size={16} className="text-orange-500"/> {profileData.department}</div>}
                       {profileData.target && <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-xl font-black border border-primary/20"><Target size={16}/> {profileData.target} Aspirant</div>}
                    </div>
                 </div>
               )}
            </div>

            <div className="w-full md:w-auto self-center md:self-end">
               {isOwnProfile ? (
                   isEditing && (
                     <div className="flex gap-3 flex-col md:flex-row w-full">
                        <button onClick={() => setIsEditing(false)} className="px-6 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"><X size={18}/> Cancel</button>
                        <button onClick={handleSaveProfile} className="px-8 py-3 bg-primary text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"><Check size={18}/> Save Changes</button>
                     </div>
                   )
               ) : (
                   <button onClick={handleChallenge} className="px-8 py-4 bg-gradient-to-r from-primary to-orange-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 w-full md:w-auto text-base"><Swords size={20}/> Challenge Now</button>
               )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Segmented Control Style */}
        <div className="flex p-1.5 bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl rounded-[1.5rem] border border-gray-200 dark:border-white/5 w-full md:w-fit mx-auto md:mx-0 overflow-x-auto no-scrollbar shadow-sm">
           <button onClick={() => setActiveTab('INFO')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-2xl text-[11px] md:text-sm font-black flex items-center justify-center gap-2.5 transition-all whitespace-nowrap ${activeTab === 'INFO' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xl' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}><LayoutGrid size={16}/> Analysis</button>
           {isOwnProfile ? (
               <>
                   <button onClick={() => setActiveTab('COURSES')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-2xl text-[11px] md:text-sm font-black flex items-center justify-center gap-2.5 transition-all whitespace-nowrap ${activeTab === 'COURSES' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xl' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}><BookOpen size={16}/> Courses</button>
                   <button onClick={() => setActiveTab('SAVED')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-2xl text-[11px] md:text-sm font-black flex items-center justify-center gap-2.5 transition-all whitespace-nowrap ${activeTab === 'SAVED' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xl' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                       <Bookmark size={16}/> {t('profile_saved')}
                   </button>
                   <button onClick={() => setActiveTab('MISTAKES')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-2xl text-[11px] md:text-sm font-black flex items-center justify-center gap-2.5 transition-all whitespace-nowrap ${activeTab === 'MISTAKES' ? 'bg-red-600 text-white shadow-xl shadow-red-500/20' : 'text-gray-500 hover:text-red-600 dark:hover:text-red-400'}`}>
                       <AlertTriangle size={16}/> {t('profile_mistakes')}
                   </button>
               </>
           ) : (
               <div className="flex items-center gap-2 px-6 text-xs text-gray-400 italic font-bold"><Lock size={14}/> Private Data Hidden</div>
           )}
        </div>

        {/* --- TAB CONTENT --- */}

        {/* INFO TAB */}
        {activeTab === 'INFO' && profileData.stats && (
            <div className="space-y-4 md:space-y-6 animate-in fade-in">
                {/* Stats Grid - Redesigned for Native Feel */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {[
                        { label: 'Total Points', value: profileData.stats.points, icon: Award, color: 'primary', bg: 'bg-primary/10', text: 'text-primary' },
                        { label: 'Exams Taken', value: profileData.stats.totalExams, icon: FileQuestion, color: 'orange', bg: 'bg-orange-500/10', text: 'text-orange-600' },
                        { label: 'Correct Ans', value: profileData.stats.totalCorrect, icon: CheckCircle, color: 'orange', bg: 'bg-orange-500/10', text: 'text-orange-600' },
                        { label: 'Wrong Ans', value: profileData.stats.totalWrong, icon: X, color: 'red', bg: 'bg-red-500/10', text: 'text-red-600' }
                    ].map((stat, i) => (
                        <motion.div 
                            key={i}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/40 dark:shadow-none flex flex-col items-center justify-center gap-4 relative overflow-hidden group"
                        >
                            <div className={`absolute -right-6 -bottom-6 w-28 h-28 ${stat.bg.replace('/10', '/5')} rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500`}></div>
                            <div className={`p-4.5 rounded-[1.5rem] ${stat.bg} ${stat.text} shadow-inner relative z-10`}>
                                <stat.icon size={28} strokeWidth={2.5} />
                            </div>
                            <div className="text-center relative z-10">
                                <p className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">{stat.value}</p>
                                <p className="text-[10px] md:text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.15em] mt-2">{stat.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Subject Performance Detailed - Native App Style */}
                <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-[2.5rem] border border-gray-200 dark:border-white/5 shadow-2xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-black text-gray-900 dark:text-white flex items-center gap-3 text-lg md:text-2xl tracking-tight">
                            <PieChart size={28} className="text-primary"/> এনালাইসিস
                        </h3>
                        <div className="px-4 py-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full text-[10px] font-black text-gray-500 dark:text-zinc-500 uppercase tracking-widest">
                            Detailed View
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        {profileData.stats.subjectBreakdown?.map((sub: any, idx: number) => {
                            const isExpanded = expandedSubjectStats.has(sub.subject);
                            
                            const correct = sub.correct || 0;
                            const total = sub.total || 0;
                            const wrong = sub.wrong !== undefined ? sub.wrong : (total - correct > 0 ? total - correct : 0);
                            const skipped = sub.skipped !== undefined ? sub.skipped : 0;
                            const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

                            // Determine Color based on accuracy
                            let statusColor = "text-red-500";
                            let statusBg = "bg-red-50 dark:bg-red-900/20";
                            let statusGlow = "shadow-red-500/20";
                            
                            if (accuracy >= 80) {
                                statusColor = "text-emerald-500";
                                statusBg = "bg-emerald-50 dark:bg-emerald-900/20";
                                statusGlow = "shadow-emerald-500/20";
                            } else if (accuracy >= 60) {
                                statusColor = "text-orange-500";
                                statusBg = "bg-orange-50 dark:bg-orange-900/20";
                                statusGlow = "shadow-orange-500/20";
                            } else if (accuracy >= 40) {
                                statusColor = "text-yellow-500";
                                statusBg = "bg-yellow-50 dark:bg-yellow-900/20";
                                statusGlow = "shadow-yellow-500/20";
                            }

                            return (
                                <motion.div 
                                    key={idx} 
                                    layout
                                    className="border border-gray-100 dark:border-white/5 rounded-[2rem] overflow-hidden transition-all bg-gray-50/50 dark:bg-zinc-900/30"
                                >
                                    {/* Subject Header Card */}
                                    <div 
                                        className="p-5 cursor-pointer bg-white dark:bg-gray-800 flex flex-col md:flex-row gap-5 md:items-center justify-between group"
                                        onClick={() => toggleSubjectStats(sub.subject)}
                                    >
                                        {/* Left: Info */}
                                        <div className="flex items-center gap-4 md:w-1/3">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${statusBg} ${statusColor} shadow-lg ${statusGlow} transition-transform group-hover:scale-110`}>
                                                <BookOpen size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-gray-900 dark:text-white text-base md:text-xl tracking-tight">{sub.subject}</h4>
                                                <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">{total} Questions</p>
                                            </div>
                                        </div>

                                        {/* Middle: Progress Bar */}
                                        <div className="flex-1 md:px-6">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                                <span className="text-emerald-600">Correct: {correct}</span>
                                                <span className="text-red-500">Wrong: {wrong}</span>
                                                <span className="text-gray-400">Skip: {skipped}</span>
                                            </div>
                                            <div className="h-3 w-full bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden flex shadow-inner">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${(correct/total)*100}%` }} className="bg-emerald-500 h-full rounded-full" />
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${(wrong/total)*100}%` }} className="bg-red-500 h-full" />
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${(skipped/total)*100}%` }} className="bg-gray-300 dark:bg-gray-600 h-full" />
                                            </div>
                                        </div>

                                        {/* Right: Accuracy & Toggle */}
                                        <div className="flex items-center justify-between md:justify-end gap-6 md:w-1/4 mt-2 md:mt-0">
                                            <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                                                <svg className="w-full h-full -rotate-90">
                                                    <circle
                                                        cx="50%" cy="50%" r="40%"
                                                        className="stroke-gray-100 dark:stroke-zinc-700 fill-none"
                                                        strokeWidth="6"
                                                    />
                                                    <motion.circle
                                                        cx="50%" cy="50%" r="40%"
                                                        className={`fill-none ${statusColor.replace('text-', 'stroke-')}`}
                                                        strokeWidth="6"
                                                        strokeLinecap="round"
                                                        initial={{ strokeDasharray: "0 100" }}
                                                        animate={{ strokeDasharray: `${accuracy} 100` }}
                                                        pathLength="100"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className={`text-sm md:text-base font-black ${statusColor} tracking-tighter`}>{accuracy}%</span>
                                                </div>
                                            </div>
                                            <div className={`p-2.5 rounded-xl bg-gray-100 dark:bg-zinc-700 text-gray-500 transition-all duration-300 ${isExpanded ? 'rotate-180 bg-primary/10 text-primary' : ''}`}>
                                                <ChevronDown size={20} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Chapters */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-6 bg-gray-50/50 dark:bg-zinc-900/50 border-t border-gray-100 dark:border-white/5">
                                                    <h5 className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                                                        <List size={14}/> অধ্যায়ভিত্তিক বিশ্লেষণ
                                                    </h5>
                                                    
                                                    {sub.chapters && Object.keys(sub.chapters).length > 0 ? (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {Object.entries(sub.chapters).map(([chapName, chapData]: [string, any], cIdx: number) => {
                                                                const cTotal = chapData.total || 0;
                                                                const cCorrect = chapData.correct || 0;
                                                                const cWrong = chapData.wrong !== undefined ? chapData.wrong : (cTotal - cCorrect);
                                                                const cAccuracy = cTotal > 0 ? Math.round((cCorrect / cTotal) * 100) : 0;
                                                                
                                                                let cColor = "bg-red-500";
                                                                if (cAccuracy >= 80) cColor = "bg-emerald-500";
                                                                else if (cAccuracy >= 60) cColor = "bg-orange-500";
                                                                else if (cAccuracy >= 40) cColor = "bg-yellow-500";

                                                                return (
                                                                    <motion.div 
                                                                        key={cIdx} 
                                                                        initial={{ opacity: 0, x: -10 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        transition={{ delay: cIdx * 0.05 }}
                                                                        className="bg-white dark:bg-gray-800 p-5 rounded-[1.5rem] border border-gray-100 dark:border-white/5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow group"
                                                                    >
                                                                        <div className="flex items-center justify-between gap-4">
                                                                            <div className="flex-1 min-w-0">
                                                                                <h6 className="text-sm md:text-base font-black text-gray-900 dark:text-white truncate" title={chapName}>{chapName}</h6>
                                                                                <div className="flex items-center gap-3 mt-1.5 text-[10px] font-black uppercase tracking-wider">
                                                                                    <span className="bg-gray-100 dark:bg-zinc-700 px-2.5 py-1 rounded-lg text-gray-500">{cTotal} Questions</span>
                                                                                    <span className="text-emerald-600">{cCorrect} Correct</span>
                                                                                    <span className="text-red-500">{cWrong} Wrong</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <span className={`text-lg font-black ${cColor.replace('bg-', 'text-')} tracking-tighter`}>{cAccuracy}%</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="h-2.5 w-full bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden shadow-inner">
                                                                            <motion.div initial={{ width: 0 }} animate={{ width: `${cAccuracy}%` }} className={`h-full ${cColor} rounded-full`} />
                                                                        </div>
                                                                    </motion.div>
                                                                )
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-8 text-xs text-gray-400 dark:text-zinc-500 italic font-bold">
                                                            কোনো অধ্যায়ভিত্তিক ডাটা পাওয়া যায়নি
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )
                        })}
                        
                        {(!profileData.stats.subjectBreakdown || profileData.stats.subjectBreakdown.length === 0) && (
                             <div className="text-center py-16 bg-gray-50/50 dark:bg-zinc-900/30 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-white/5">
                                 <BarChart3 size={48} className="mx-auto text-gray-300 dark:text-zinc-700 mb-4"/>
                                 <p className="text-gray-500 dark:text-zinc-500 font-black text-sm uppercase tracking-widest">কোনো এনালাইসিস ডাটা নেই</p>
                                 <p className="text-xs text-gray-400 dark:text-zinc-600 mt-2">কুইজ বা এক্সাম দিলে এখানে বিস্তারিত দেখা যাবে</p>
                             </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* COURSES TAB */}
        {activeTab === 'COURSES' && isOwnProfile && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                {enrolledCourses.length === 0 ? (
                    <div className="text-center py-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-[2.5rem] border border-gray-200 dark:border-gray-700 shadow-xl">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <BookOpen size={40} className="text-gray-400"/>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 font-bold text-lg mb-2">কোনো কোর্স এনরোল করা নেই</p>
                        <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">আমাদের চমৎকার কোর্সগুলো দেখে নিন এবং আপনার প্রস্তুতি শুরু করুন।</p>
                        <button 
                            onClick={() => navigate('/courses')} 
                            className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl text-sm font-bold shadow-lg hover:scale-105 transition-transform active:scale-95"
                        >
                            কোর্স দেখুন
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {enrolledCourses.map(course => (
                            <motion.div 
                                key={course.id} 
                                whileHover={{ y: -5 }}
                                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-[2rem] border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary transition-colors leading-tight">{course.title}</h3>
                                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                        <BookOpen size={18} />
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progress</p>
                                            <span className="text-xs font-bold text-primary">{course.progress}%</span>
                                        </div>
                                        <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${course.progress}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                                            ></motion.div>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => {
                                            if (course.id === 'gst-super-focus' || course.id === 'med-final-24') {
                                                navigate(`/exam-batch/${course.id}`);
                                            } else {
                                                navigate(`/courses`);
                                            }
                                        }}
                                        className="w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-white text-gray-900 dark:text-white hover:text-white dark:hover:text-gray-900 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                                    >
                                        চালিয়ে যান <MoveRight size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        )}

        {/* SAVED QUESTIONS TAB */}
        {activeTab === 'SAVED' && isOwnProfile && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                {/* Folder & Filter Management */}
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl p-4 rounded-[2rem] border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
                        {availableFolders.map(f => (
                            <button 
                                key={f} 
                                onClick={() => setActiveFolder(f)}
                                className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shadow-sm ${
                                    activeFolder === f 
                                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' 
                                    : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 border border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                                }`}
                            >
                                <Folder size={14} className={activeFolder === f ? 'text-primary' : 'text-gray-400'}/> {f}
                            </button>
                        ))}
                        
                        {isCreatingFolder ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-2 bg-white dark:bg-gray-700 p-1 rounded-2xl border border-primary/30"
                            >
                                <input 
                                    type="text" 
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    placeholder="Folder Name"
                                    className="px-3 py-1.5 text-xs rounded-xl bg-transparent dark:text-white focus:outline-none w-32"
                                    autoFocus
                                />
                                <button onClick={handleCreateFolder} className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-sm"><Check size={14}/></button>
                                <button onClick={() => setIsCreatingFolder(false)} className="p-2 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors shadow-sm"><X size={14}/></button>
                            </motion.div>
                        ) : (
                            <button 
                                onClick={() => setIsCreatingFolder(true)} 
                                className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-all flex items-center gap-2 whitespace-nowrap border border-primary/20"
                            >
                                <FolderPlus size={14}/> New Folder
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Section */}
                {savedQuestions.length > 0 && (
                    <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl p-4 rounded-[2rem] border border-gray-200 dark:border-gray-700 shadow-sm">
                        <FilterSection />
                    </div>
                )}

                {loadingSaved ? (
                    <div className="space-y-4 animate-pulse">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-40 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-[2rem] border border-gray-200 dark:border-gray-700"></div>
                        ))}
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-[2.5rem] border border-gray-200 dark:border-gray-700 shadow-xl">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Bookmark size={40} className="text-gray-400"/>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 font-bold text-lg mb-2">কোনো সেভ করা প্রশ্ন পাওয়া যায়নি</p>
                        <p className="text-gray-400 text-sm">আপনার প্রিয় প্রশ্নগুলো সেভ করে এখানে জমা রাখুন।</p>
                    </div>
                ) : (
                    <div id="saved-questions-container" className="space-y-4">
                        {displayedItems.map((item) => {
                            const q = item.questionId;
                            if (!q) return null;
                            return (
                                <motion.div 
                                    key={item._id} 
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-[2rem] border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <span className="px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-[10px] font-bold rounded-xl border border-orange-100 dark:border-orange-800/50">{q.subject}</span>
                                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold rounded-xl flex items-center gap-2 border border-gray-200 dark:border-gray-600">
                                                <Folder size={12} className="text-primary"/> {item.folder || 'General'}
                                            </span>
                                            
                                            {/* Move To Dropdown Trigger */}
                                            <div className="relative">
                                                <button 
                                                    onClick={() => setMovingQuestionId(movingQuestionId === item._id ? null : item._id)}
                                                    className="text-[10px] flex items-center gap-2 text-gray-400 hover:text-primary transition-colors font-bold px-2 py-1 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
                                                >
                                                    <MoveRight size={12}/> Move
                                                </button>
                                                
                                                <AnimatePresence>
                                                    {movingQuestionId === item._id && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-20 w-40 py-2 overflow-hidden"
                                                        >
                                                            <div className="px-3 py-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 mb-1">Move to folder</div>
                                                            {availableFolders.filter(f => f !== (item.folder || 'General')).map(f => (
                                                                <button 
                                                                    key={f}
                                                                    onClick={() => handleMoveToFolder(item._id, f)}
                                                                    className="block w-full text-left px-4 py-2 text-xs hover:bg-primary/10 hover:text-primary text-gray-700 dark:text-gray-300 transition-colors"
                                                                >
                                                                    {f}
                                                                </button>
                                                            ))}
                                                            <button onClick={() => setMovingQuestionId(null)} className="block w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border-t border-gray-100 dark:border-gray-800 mt-1 font-bold">Cancel</button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteSaved(item._id)} 
                                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-xl transition-all active:scale-90"
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                    </div>
                                    
                                    <h4 className="font-bold text-gray-800 dark:text-white text-sm md:text-base mb-4 leading-relaxed">{q.question}</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                        {q.options.map((opt: string, i: number) => (
                                            <div 
                                                key={i} 
                                                className={`p-3 rounded-2xl border text-xs transition-all ${
                                                    i === q.correctAnswerIndex 
                                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 font-bold shadow-sm' 
                                                    : 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                                                }`}
                                            >
                                                <span className="inline-block w-6 h-6 rounded-lg bg-white/50 dark:bg-gray-800/50 text-center leading-6 mr-2 font-bold shadow-inner">
                                                    {String.fromCharCode(65 + i)}
                                                </span>
                                                {opt}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-[1.5rem] border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/40"></div>
                                        <span className="font-bold text-primary text-[10px] uppercase tracking-widest block mb-2">Explanation</span>
                                        <p className="font-tiro text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                            {q.explanation || 'No explanation available.'}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                        
                        <PaginationControls />
                    </div>
                )}
            </motion.div>
        )}

        {/* MISTAKES TAB */}
        {activeTab === 'MISTAKES' && isOwnProfile && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl p-4 rounded-[2rem] border border-gray-200 dark:border-gray-700 shadow-sm">
                   <div className="flex items-center gap-4">
                       <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-2xl text-red-500">
                           <AlertTriangle size={24} />
                       </div>
                       <div>
                           <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                              {t('profile_mistakes')}
                           </h2>
                           <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total {filteredItems.length} questions to review</p>
                       </div>
                       <button 
                           onClick={() => loadMistakes(false)} 
                           className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-all active:rotate-180 duration-500"
                           title="Refresh"
                       >
                           <RefreshCw size={18} className={loadingMistakes ? "animate-spin" : ""} />
                       </button>
                   </div>
                   
                   {filteredItems.length > 0 && (
                       <button 
                         onClick={() => setShowExamConfig(true)}
                         className="w-full md:w-auto px-8 py-3 bg-red-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-red-700 shadow-xl shadow-red-200 dark:shadow-none transition-all active:scale-95 group"
                       >
                          <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" /> 
                          {t('quiz_retry')} ({filteredItems.length})
                       </button>
                   )}
               </div>

               {/* Filter Section */}
               {mistakes.length > 0 && (
                   <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl p-4 rounded-[2rem] border border-gray-200 dark:border-gray-700 shadow-sm">
                       <FilterSection />
                   </div>
               )}
               
               {loadingMistakes ? (
                   <div className="space-y-4 animate-pulse">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-40 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-[2rem] border border-gray-200 dark:border-gray-700"></div>
                        ))}
                   </div>
               ) : filteredItems.length === 0 ? (
                   <div className="text-center py-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-[2.5rem] border border-gray-200 dark:border-gray-700 shadow-xl">
                       <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                           <CheckCircle size={40} className="text-green-500"/>
                       </div>
                       <p className="text-gray-600 dark:text-gray-300 font-bold text-lg mb-2">কোনো ভুল পাওয়া যায়নি</p>
                       <p className="text-gray-400 text-sm">চমৎকার! আপনার কোনো ভুল প্রশ্ন নেই।</p>
                   </div>
               ) : (
                   <div id="mistakes-container" className="space-y-4">
                     {displayedItems.map((m) => {
                        const q = m.questionId;
                        if (!q) return null;
                        
                        return (
                        <motion.div 
                            key={m._id} 
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-[2rem] border border-red-100 dark:border-red-900/30 shadow-lg hover:shadow-xl transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-[10px] font-bold rounded-xl text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600">{q.subject}</span>
                                    {q.chapter && <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-[10px] font-bold rounded-xl text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600">{q.chapter}</span>}
                                    {m.wrongCount > 1 && (
                                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold rounded-xl flex items-center gap-2 border border-red-200 dark:border-red-800/50 shadow-sm">
                                            <X size={12} className="stroke-[3px]"/> Missed {m.wrongCount} times
                                        </span>
                                    )}
                                </div>
                                <button 
                                    onClick={() => handleDeleteMistake(m._id)} 
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all active:scale-90"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            
                            <h3 className="font-bold text-gray-800 dark:text-white mb-4 text-sm md:text-base leading-relaxed relative z-10 pr-6">{q.question}</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 relative z-10">
                                {q.options.map((opt: string, i: number) => (
                                    <div 
                                        key={i} 
                                        className={`p-3 rounded-2xl border text-xs transition-all ${
                                            i === q.correctAnswerIndex 
                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 font-bold shadow-sm' 
                                            : 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400'
                                        }`}
                                    >
                                        <span className="inline-block w-6 h-6 rounded-lg bg-white/50 dark:bg-gray-800/50 text-center leading-6 mr-2 font-bold shadow-inner">
                                            {String.fromCharCode(65 + i)}
                                        </span>
                                        {opt}
                                    </div>
                                ))}
                            </div>
                            
                            <div className="bg-red-50/50 dark:bg-red-900/10 p-4 rounded-[1.5rem] border border-red-100/50 dark:border-red-900/30 relative overflow-hidden z-10">
                                <div className="absolute top-0 left-0 w-1 h-full bg-red-500/40"></div>
                                <span className="font-bold text-red-500 text-[10px] uppercase tracking-widest block mb-2">Explanation</span>
                                <p className="font-tiro text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {q.explanation || 'No explanation available.'}
                                </p>
                            </div>
                        </motion.div>
                     )})}
                     
                     <PaginationControls />
                   </div>
               )}
            </motion.div>
        )}

      </div>

      {/* Exam Config Modal */}
      <AnimatePresence>
        {showExamConfig && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowExamConfig(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white dark:bg-gray-800 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 border border-gray-200 dark:border-gray-700 relative z-10 overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-500"></div>
                    
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl text-red-500">
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">Retake Config</h3>
                        </div>
                        <button 
                            onClick={() => setShowExamConfig(false)} 
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-colors text-gray-400"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Mistake Clearance Tip */}
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-[2rem] border border-emerald-100 dark:border-emerald-800/50 flex gap-4 relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
                             <div className="p-3 bg-emerald-100 dark:bg-emerald-800 rounded-2xl h-fit text-emerald-600 dark:text-emerald-400 shadow-sm">
                                <Sparkles size={20} />
                             </div>
                             <div className="relative z-10">
                                <h4 className="font-black text-emerald-800 dark:text-emerald-300 text-sm md:text-base mb-1">ভুল শুধরানোর সুযোগ!</h4>
                                <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 leading-relaxed font-medium">
                                   সঠিক উত্তর দিলে সেগুলো অটোমেটিকলি আপনার 'ভুল' তালিকা থেকে মুছে যাবে।
                                </p>
                             </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-xs md:text-sm font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest ml-1">{t('quiz_time_limit')}</label>
                            <div className="grid grid-cols-4 gap-3">
                                {[0, 10, 20, 30].map(t => (
                                    <button 
                                        key={t} 
                                        onClick={() => setExamTimeLimit(t)} 
                                        className={`py-3 rounded-2xl text-xs font-black transition-all border-2 ${
                                            examTimeLimit === t 
                                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-xl' 
                                            : 'bg-white dark:bg-gray-700 border-gray-100 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-500'
                                        }`}
                                    >
                                        {t === 0 ? 'No Limit' : `${t} Min`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={launchExam} 
                            className="w-full py-5 bg-red-600 hover:bg-red-700 text-white rounded-[1.5rem] font-black flex items-center justify-center gap-3 shadow-2xl shadow-red-500/30 transition-all hover:scale-[1.02] active:scale-95 text-base md:text-lg"
                        >
                            <Play size={20} fill="currentColor"/> Start Retake Exam
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ProfilePage;
