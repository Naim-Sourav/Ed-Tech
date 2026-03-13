
import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth, EnrolledCourse } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchSavedQuestionsAPI, deleteSavedQuestionAPI, fetchUserStatsAPI, fetchUserMistakesAPI, deleteUserMistakeAPI, updateSavedQuestionFolderAPI } from '../services/api';
import { uploadImageToCloudinary } from '../services/imageUpload';
import getCroppedImg from '../utils/canvasUtils';
import { Camera, Edit2, LogOut, MapPin, Save, User, X, BookOpen, Clock, Award, Calendar, Bookmark, Trash2, ChevronRight, LayoutGrid, List, TrendingUp, BarChart3, AlertCircle, Zap, Filter, GraduationCap, Briefcase, Target, PieChart, Layers, RefreshCw, AlertTriangle, Play, AlignJustify, LayoutList, FolderPlus, Folder, MoveRight, Upload, Loader2, ZoomIn, ZoomOut, Lock, Swords, CheckCircle, ChevronDown, ChevronUp, CircleDot, HelpCircle, FileQuestion, ChevronLeft, Sparkles, Check } from 'lucide-react';
import { useToast } from './Toast';
import { useCache } from '../contexts/CacheContext';


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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [examViewMode, setExamViewMode] = useState<'SINGLE_PAGE' | 'ALL_AT_ONCE'>('SINGLE_PAGE');

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
    } catch (e) { showToast("Upload Failed", "error"); } finally { setIsUploading(false); }
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
      } catch (e) {
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
        uniqueSubjects: Array.from(subjects),
        uniqueChapters: Array.from(chapters),
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
          
          const matchSubject = currentFilterSubject === 'ALL' || q.subject === currentFilterSubject;
          const matchChapter = currentFilterChapter === 'ALL' || q.chapter === currentFilterChapter;
          
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
    if (points < 500) return { name: 'Apprentice', color: 'bg-green-500' };
    if (points < 1000) return { name: 'Scholar', color: 'bg-orange-500' };
    if (points < 2000) return { name: 'Master', color: 'bg-orange-600' };
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
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 h-64 relative">
            <div className="absolute top-0 left-0 w-full h-24 bg-gray-200 dark:bg-gray-700 rounded-t-3xl"></div>
            <div className="relative flex flex-col md:flex-row items-center gap-6 mt-10">
                <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-600 border-4 border-white dark:border-gray-800"></div>
                <div className="space-y-3 flex-1 w-full text-center md:text-left">
                    <div className="h-6 w-1/2 bg-gray-300 dark:bg-gray-600 rounded mx-auto md:mx-0"></div>
                    <div className="flex gap-2 justify-center md:justify-start">
                        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                </div>
            </div>
        </div>
        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"></div>
            ))}
        </div>
    </div>
  );

  if (loading && !profileData.stats) {
      return <div className="h-full p-4 md:p-8"><ProfileSkeleton /></div>;
  }

  // Helper component for Filters
  const FilterSection = () => (
      <div className="flex flex-wrap items-center gap-2 mb-4 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-center text-gray-500 px-1"><Filter size={16}/></div>
          <select 
              value={currentFilterSubject} 
              onChange={(e) => { setCurrentFilterSubject(e.target.value); setCurrentFilterChapter('ALL'); }}
              className="flex-1 min-w-[90px] px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700 border-none text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary truncate"
          >
              <option value="ALL">সকল বিষয়</option>
              {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select 
              value={currentFilterChapter} 
              onChange={(e) => setCurrentFilterChapter(e.target.value)}
              className="flex-1 min-w-[90px] px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700 border-none text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary truncate"
          >
              <option value="ALL">সকল অধ্যায়</option>
              {uniqueChapters.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button 
            onClick={resetCurrentFilters}
            className="text-[10px] text-red-500 hover:text-red-600 font-bold px-2 whitespace-nowrap"
          >
            রিসেট
          </button>
      </div>
  );

  // Pagination Component
  const PaginationControls = () => {
      if (totalPages <= 1) return null;
      return (
          <div className="flex justify-center items-center gap-4 mt-6">
              <button 
                  onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                  <ChevronLeft size={18} />
              </button>
              <span className="text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  Page {currentPage} of {totalPages}
              </span>
              <button 
                  onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                  <ChevronRight size={18} />
              </button>
          </div>
      );
  };

  return (
    <div 
        ref={scrollContainerRef}
        className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 p-3 md:p-8 transition-colors"
    >
      <div className="max-w-5xl mx-auto space-y-4 md:space-y-8 pb-20">
        
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl md:rounded-[2rem] p-4 md:p-8 border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-20 md:h-32 bg-gradient-to-r from-primary to-orange-600 opacity-10"></div>
          
          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8 mt-2 md:mt-4">
            {/* Avatar & User Info */}
            <div className="relative group">
               <div className="w-20 h-20 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                  {renderProfileAvatar()}
               </div>
               {isEditing && isOwnProfile && (
                 <button 
                    onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                    className="absolute bottom-0 right-0 p-2 bg-gray-900 text-white rounded-full hover:bg-black transition-colors shadow-lg"
                 >
                    <Camera size={14} className="md:w-5 md:h-5" />
                 </button>
               )}
               {showAvatarSelector && (
                   <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 w-64 animate-in fade-in slide-in-from-top-2">
                       <p className="text-xs font-bold text-gray-500 mb-3">প্রোফাইল ছবি পরিবর্তন করুন</p>

                       <label className="flex items-center justify-center gap-2 w-full py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-bold cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">
                           <Upload size={14}/> ছবি আপলোড করুন
                           <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                       </label>
                   </div>
               )}
            </div>

            <div className="flex-1 text-center md:text-left space-y-2 w-full">
               {isEditing && isOwnProfile ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full">
                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-gray-500 mb-1">{t('auth_name')}</label>
                      <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-sm"/>
                    </div>
                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-gray-500 mb-1">College</label>
                      <input type="text" value={editCollege} onChange={(e) => setEditCollege(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-sm"/>
                    </div>
                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-gray-500 mb-1">Batch</label>
                      <input type="text" value={editHscBatch} onChange={(e) => setEditHscBatch(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-sm"/>
                    </div>
                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-gray-500 mb-1">Department</label>
                      <select value={editDepartment} onChange={(e) => setEditDepartment(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-sm"><option>Science</option><option>Arts</option><option>Commerce</option></select>
                    </div>
                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-gray-500 mb-1">Target</label>
                      <select value={editTarget} onChange={(e) => setEditTarget(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-sm"><option>Medical</option><option>Engineering</option><option>University</option><option>Guccho</option></select>
                    </div>
                 </div>
               ) : (
                 <>
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 justify-center md:justify-start">
                        <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">{profileData.displayName}</h1>
                        {profileData.stats && (
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-bold text-white ${currentLevel.color}`}>
                                {currentLevel.name}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 text-[10px] md:text-sm text-gray-600 dark:text-gray-300 mt-1">
                       {profileData.college && <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"><GraduationCap size={12}/> {profileData.college}</div>}
                       {profileData.hscBatch && <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"><Calendar size={12}/> Batch: {profileData.hscBatch}</div>}
                       {profileData.department && <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"><Briefcase size={12}/> {profileData.department}</div>}
                       {profileData.target && <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded font-bold"><Target size={12}/> {profileData.target} Aspirant</div>}
                    </div>
                 </>
               )}
            </div>

            <div className="w-full md:w-auto">
               {isOwnProfile ? (
                   isEditing ? (
                     <div className="flex gap-2 flex-col md:flex-row w-full text-xs md:text-sm">
                        <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-bold flex items-center justify-center gap-2"><X size={16}/> Cancel</button>
                        <button onClick={handleSaveProfile} className="px-4 py-2 bg-primary text-white rounded-lg font-bold flex items-center justify-center gap-2"><Check size={16}/> Save</button>
                     </div>
                   ) : (
                     <button onClick={() => setIsEditing(true)} className="px-4 py-2 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-bold flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 transition-colors w-full md:w-auto text-xs md:text-sm"><Edit2 size={14}/> Edit Profile</button>
                   )
               ) : (
                   <button onClick={handleChallenge} className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-200 dark:shadow-none transition-all active:scale-95 w-full md:w-auto text-xs md:text-sm"><Swords size={16}/> Challenge</button>
               )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex p-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 w-full md:w-fit mx-auto md:mx-0 overflow-x-auto no-scrollbar">
           <button onClick={() => setActiveTab('INFO')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[10px] md:text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'INFO' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}><LayoutGrid size={14}/> Analysis</button>
           {isOwnProfile ? (
               <>
                   <button onClick={() => setActiveTab('COURSES')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[10px] md:text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'COURSES' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}><BookOpen size={14}/> Courses</button>
                   <button onClick={() => setActiveTab('SAVED')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[10px] md:text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'SAVED' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                       <Bookmark size={14}/> {t('profile_saved')} ({savedQuestions.length})
                   </button>
                   <button onClick={() => setActiveTab('MISTAKES')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[10px] md:text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'MISTAKES' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50' : 'text-gray-500 hover:text-red-600 dark:hover:text-red-400'}`}>
                       <AlertTriangle size={14}/> {t('profile_mistakes')} ({mistakes.length})
                   </button>
               </>
           ) : (
               <div className="flex items-center gap-2 px-4 text-xs text-gray-400 italic"><Lock size={12}/> Private Data Hidden</div>
           )}
        </div>

        {/* --- TAB CONTENT --- */}

        {/* INFO TAB */}
        {activeTab === 'INFO' && profileData.stats && (
            <div className="space-y-4 md:space-y-6 animate-in fade-in">
                {/* Stats Grid - Redesigned */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center gap-2 relative overflow-hidden group hover:border-primary/50 transition-all">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="p-2.5 rounded-full bg-primary/10 text-primary">
                            <Award size={20} />
                        </div>
                        <div className="text-center relative z-10">
                            <p className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white">{profileData.stats.points}</p>
                            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">Total Points</p>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center gap-2 relative overflow-hidden group hover:border-orange-500/50 transition-all">
                        <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="p-2.5 rounded-full bg-orange-500/10 text-orange-600">
                            <FileQuestion size={20} />
                        </div>
                        <div className="text-center relative z-10">
                            <p className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white">{profileData.stats.totalExams}</p>
                            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">Exams Taken</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center gap-2 relative overflow-hidden group hover:border-green-500/50 transition-all">
                        <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="p-2.5 rounded-full bg-green-500/10 text-green-600">
                            <CheckCircle size={20} />
                        </div>
                        <div className="text-center relative z-10">
                            <p className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white">{profileData.stats.totalCorrect}</p>
                            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">Correct Ans</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center gap-2 relative overflow-hidden group hover:border-red-500/50 transition-all">
                        <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="p-2.5 rounded-full bg-red-500/10 text-red-600">
                            <X size={20} />
                        </div>
                        <div className="text-center relative z-10">
                            <p className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white">{profileData.stats.totalWrong}</p>
                            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">Wrong Ans</p>
                        </div>
                    </div>
                </div>

                {/* Subject Performance Detailed */}
                {/* Subject Performance Detailed - Redesigned */}
                <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 text-base md:text-lg">
                        <PieChart size={20} className="text-primary"/> বিষয় ও অধ্যায়ভিত্তিক এনালাইসিস
                    </h3>
                    
                    <div className="space-y-4">
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
                            let statusLabel = "Weak";
                            
                            if (accuracy >= 80) {
                                statusColor = "text-green-500";
                                statusBg = "bg-green-50 dark:bg-green-900/20";
                                statusLabel = "Strong";
                            } else if (accuracy >= 60) {
                                statusColor = "text-orange-500";
                                statusBg = "bg-orange-50 dark:bg-orange-900/20";
                                statusLabel = "Good";
                            } else if (accuracy >= 40) {
                                statusColor = "text-yellow-500";
                                statusBg = "bg-yellow-50 dark:bg-yellow-900/20";
                                statusLabel = "Average";
                            }

                            return (
                                <div key={idx} className="border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden transition-all hover:shadow-md bg-gray-50/50 dark:bg-gray-800/50">
                                    {/* Subject Header Card */}
                                    <div 
                                        className="p-4 cursor-pointer bg-white dark:bg-gray-800 flex flex-col md:flex-row gap-4 md:items-center justify-between"
                                        onClick={() => toggleSubjectStats(sub.subject)}
                                    >
                                        {/* Left: Info */}
                                        <div className="flex items-center gap-3 md:w-1/4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusBg} ${statusColor}`}>
                                                <BookOpen size={18} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white text-sm md:text-base">{sub.subject}</h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{total} Questions</p>
                                            </div>
                                        </div>

                                        {/* Middle: Progress Bar */}
                                        <div className="flex-1 md:px-4">
                                            <div className="flex justify-between text-xs font-bold mb-1.5">
                                                <span className="text-green-600">Correct: {correct}</span>
                                                <span className="text-red-500">Wrong: {wrong}</span>
                                                <span className="text-gray-400">Skip: {skipped}</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
                                                <div style={{ width: `${(correct/total)*100}%` }} className="bg-green-500 h-full" />
                                                <div style={{ width: `${(wrong/total)*100}%` }} className="bg-red-500 h-full" />
                                                <div style={{ width: `${(skipped/total)*100}%` }} className="bg-gray-300 dark:bg-gray-600 h-full" />
                                            </div>
                                        </div>

                                        {/* Right: Accuracy & Toggle */}
                                        <div className="flex items-center justify-between md:justify-end gap-4 md:w-1/4 mt-2 md:mt-0">
                                            <div className="text-right">
                                                <span className={`text-lg font-black ${statusColor}`}>{accuracy}%</span>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Accuracy</p>
                                            </div>
                                            <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                                <ChevronDown size={16} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Chapters */}
                                    {isExpanded && (
                                        <div className="p-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700">
                                            <h5 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                                <List size={12}/> অধ্যায়ভিত্তিক বিশ্লেষণ
                                            </h5>
                                            
                                            {sub.chapters && Object.keys(sub.chapters).length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {Object.entries(sub.chapters).map(([chapName, chapData]: [string, any], cIdx: number) => {
                                                        const cTotal = chapData.total || 0;
                                                        const cCorrect = chapData.correct || 0;
                                                        const cWrong = chapData.wrong !== undefined ? chapData.wrong : (cTotal - cCorrect);
                                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                        const cSkipped = chapData.skipped !== undefined ? chapData.skipped : 0;
                                                        const cAccuracy = cTotal > 0 ? Math.round((cCorrect / cTotal) * 100) : 0;
                                                        
                                                        let cColor = "bg-red-500";
                                                        if (cAccuracy >= 80) cColor = "bg-green-500";
                                                        else if (cAccuracy >= 60) cColor = "bg-orange-500";
                                                        else if (cAccuracy >= 40) cColor = "bg-yellow-500";

                                                        return (
                                                            <div key={cIdx} className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between shadow-sm">
                                                                <div className="flex-1 min-w-0 pr-3">
                                                                    <h6 className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate mb-1" title={chapName}>{chapName}</h6>
                                                                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                                                        <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{cTotal} Q</span>
                                                                        <span className="text-green-600">{cCorrect} ✓</span>
                                                                        <span className="text-red-500">{cWrong} ✕</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col items-end gap-1">
                                                                    <span className="text-xs font-black text-gray-700 dark:text-gray-300">{cAccuracy}%</span>
                                                                    <div className="w-12 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                        <div style={{ width: `${cAccuracy}%` }} className={`h-full ${cColor}`} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 text-xs text-gray-400 italic">
                                                    কোনো অধ্যায়ভিত্তিক ডাটা পাওয়া যায়নি
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                        
                        {(!profileData.stats.subjectBreakdown || profileData.stats.subjectBreakdown.length === 0) && (
                             <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                                 <BarChart3 size={40} className="mx-auto text-gray-300 mb-3"/>
                                 <p className="text-gray-500 font-medium text-sm">কোনো এনালাইসিস ডাটা নেই</p>
                                 <p className="text-xs text-gray-400 mt-1">কুইজ বা এক্সাম দিলে এখানে বিস্তারিত দেখা যাবে</p>
                             </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* COURSES TAB */}
        {activeTab === 'COURSES' && isOwnProfile && (
            <div className="animate-in fade-in">
                {enrolledCourses.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                        <BookOpen size={40} className="mx-auto text-gray-300 mb-3"/>
                        <p className="text-gray-500 font-medium text-sm">কোনো কোর্স এনরোল করা নেই</p>
                        <button onClick={() => navigate('/courses')} className="mt-4 px-5 py-2 bg-primary text-white rounded-lg text-xs font-bold">কোর্স দেখুন</button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        {enrolledCourses.map(course => (
                            <div key={course.id} className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                                <h3 className="font-bold text-sm md:text-lg text-gray-900 dark:text-white mb-2">{course.title}</h3>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] md:text-xs text-gray-500 mb-1">Progress</p>
                                        <div className="h-1.5 w-24 md:w-32 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary" style={{width: `${course.progress}%`}}></div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if (course.id === 'gst-super-focus' || course.id === 'med-final-24') {
                                                navigate(`/exam-batch/${course.id}`);
                                            } else {
                                                navigate(`/courses`); // Fallback for now, or specific player page
                                            }
                                        }}
                                        className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-100 dark:bg-gray-700 hover:bg-primary hover:text-white dark:hover:bg-primary rounded-lg text-[10px] md:text-xs font-bold transition-all"
                                    >
                                        চালিয়ে যান
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* SAVED QUESTIONS TAB */}
        {activeTab === 'SAVED' && isOwnProfile && (
            <div className="animate-in fade-in space-y-4">
                
                {/* Folder & Filter Management */}
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-between items-start md:items-center">
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                        {availableFolders.map(f => (
                            <button 
                                key={f} 
                                onClick={() => setActiveFolder(f)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${activeFolder === f ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700'}`}
                            >
                                <Folder size={12}/> {f}
                            </button>
                        ))}
                        {isCreatingFolder ? (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                                <input 
                                    type="text" 
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    placeholder="Folder Name"
                                    className="px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:border-primary w-24"
                                    autoFocus
                                />
                                <button onClick={handleCreateFolder} className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600"><Check size={10}/></button>
                                <button onClick={() => setIsCreatingFolder(false)} className="p-1.5 bg-gray-300 dark:bg-gray-600 text-black dark:text-white rounded hover:bg-gray-400"><X size={10}/></button>
                            </div>
                        ) : (
                            <button onClick={() => setIsCreatingFolder(true)} className="px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-1 whitespace-nowrap">
                                <FolderPlus size={12}/> New Folder
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Section */}
                {savedQuestions.length > 0 && <FilterSection />}

                {loadingSaved ? (
                    <div className="space-y-3 animate-pulse">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-24 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"></div>
                        ))}
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                        <Bookmark size={40} className="mx-auto text-gray-300 mb-2"/>
                        <p className="text-gray-500 font-medium text-xs">কোনো সেভ করা প্রশ্ন পাওয়া যায়নি</p>
                    </div>
                ) : (
                    <div id="saved-questions-container" className="space-y-3">
                        {displayedItems.map((item) => {
                            const q = item.questionId;
                            if (!q) return null;
                            return (
                                <div key={item._id} className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[9px] font-bold rounded">{q.subject}</span>
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[9px] font-bold rounded flex items-center gap-1">
                                                <Folder size={10}/> {item.folder || 'General'}
                                            </span>
                                            
                                            {/* Move To Dropdown Trigger */}
                                            <div className="relative">
                                                <button 
                                                    onClick={() => setMovingQuestionId(movingQuestionId === item._id ? null : item._id)}
                                                    className="text-[9px] flex items-center gap-1 text-gray-400 hover:text-primary transition-colors font-bold px-1"
                                                >
                                                    <MoveRight size={10}/> Move
                                                </button>
                                                
                                                {movingQuestionId === item._id && (
                                                    <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 w-32 py-1 animate-in fade-in zoom-in-95">
                                                        {availableFolders.filter(f => f !== (item.folder || 'General')).map(f => (
                                                            <button 
                                                                key={f}
                                                                onClick={() => handleMoveToFolder(item._id, f)}
                                                                className="block w-full text-left px-3 py-1.5 text-[10px] hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                            >
                                                                {f}
                                                            </button>
                                                        ))}
                                                        <button onClick={() => setMovingQuestionId(null)} className="block w-full text-left px-3 py-1.5 text-[10px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border-t border-gray-100 dark:border-gray-800 mt-1">Cancel</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteSaved(item._id)} className="text-gray-400 hover:text-red-500 transition-colors p-1"><Trash2 size={14}/></button>
                                    </div>
                                    <h4 className="font-bold text-gray-800 dark:text-white text-xs md:text-sm mb-2">{q.question}</h4>
                                    <div className="grid grid-cols-2 gap-2 text-[10px] md:text-xs text-gray-600 dark:text-gray-400">
                                        {q.options.map((opt: string, i: number) => (
                                            <div key={i} className={`p-1.5 rounded border ${i === q.correctAnswerIndex ? 'bg-green-50 border-green-200 text-green-700 font-bold' : 'border-gray-100 dark:border-gray-700'}`}>{opt}</div>
                                        ))}
                                    </div>
                                    <div className="mt-2 text-[10px] text-gray-500 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <span className="font-bold text-primary block mb-0.5">Explanation:</span>
                                        <span className="font-tiro">{q.explanation || 'No explanation available.'}</span>
                                    </div>
                                </div>
                            );
                        })}
                        
                        <PaginationControls />
                    </div>
                )}
            </div>
        )}

        {/* MISTAKES TAB */}
        {activeTab === 'MISTAKES' && isOwnProfile && (
            <div className="space-y-4 md:space-y-6 animate-in fade-in">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                   <div className="flex items-center gap-3">
                       <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <AlertTriangle size={18} className="text-red-500" /> {t('profile_mistakes')} ({filteredItems.length})
                       </h2>
                       <button 
                           onClick={() => loadMistakes(false)} 
                           className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                           title="Refresh"
                       >
                           <RefreshCw size={14} className={loadingMistakes ? "animate-spin" : ""} />
                       </button>
                   </div>
                   {filteredItems.length > 0 && (
                       <button 
                         onClick={() => setShowExamConfig(true)}
                         className="w-full md:w-auto px-5 py-2 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 shadow-lg shadow-red-200 dark:shadow-none transition-all active:scale-95 text-xs md:text-sm"
                       >
                          <RefreshCw size={14} /> {t('quiz_retry')} ({filteredItems.length})
                       </button>
                   )}
               </div>

               {/* Filter Section */}
               {mistakes.length > 0 && <FilterSection />}
               
               {loadingMistakes ? (
                   <div className="space-y-3 animate-pulse">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-24 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"></div>
                        ))}
                   </div>
               ) : filteredItems.length === 0 ? (
                   <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                       <CheckCircle size={40} className="mx-auto text-green-300 mb-2"/>
                       <p className="text-gray-500 font-medium text-xs">কোনো ভুল পাওয়া যায়নি (ফিল্টার অনুযায়ী)।</p>
                   </div>
               ) : (
                   <div id="mistakes-container" className="space-y-3">
                     {displayedItems.map((m) => {
                        const q = m.questionId;
                        if (!q) return null;
                        
                        return (
                        <div key={m._id} className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm relative group">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex gap-2 mb-1">
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-[9px] font-bold rounded text-gray-500">{q.subject}</span>
                                    {q.chapter && <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-[9px] font-bold rounded text-gray-500">{q.chapter}</span>}
                                    {m.wrongCount > 1 && (
                                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 text-[9px] font-bold rounded flex items-center gap-1">
                                            <X size={8}/> Missed {m.wrongCount} times
                                        </span>
                                    )}
                                </div>
                                <button onClick={() => handleDeleteMistake(m._id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={14} /></button>
                            </div>
                            
                            <h3 className="font-bold text-gray-800 dark:text-white mb-3 text-xs md:text-sm pr-4">{q.question}</h3>
                            <div className="grid grid-cols-2 gap-2 text-[10px] md:text-xs mb-2">
                                {q.options.map((opt: string, i: number) => (
                                    <div key={i} className={`p-1.5 rounded border ${i === q.correctAnswerIndex ? 'bg-green-50 border-green-200 text-green-700 font-bold' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 text-gray-500'}`}>{opt}</div>
                                ))}
                            </div>
                            <div className="text-[10px] text-gray-500 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-xl border border-gray-100 dark:border-gray-700">
                                <span className="font-bold text-red-500 block mb-0.5">Explanation:</span>
                                {q.explanation || 'No explanation available.'}
                            </div>
                        </div>
                     )})}
                     
                     <PaginationControls />
                   </div>
               )}
            </div>
        )}

      </div>

      {/* Exam Config Modal */}
      {showExamConfig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><AlertTriangle size={20} className="text-red-500"/> Retake Configuration</h3>
                      <button onClick={() => setShowExamConfig(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={18} className="text-gray-500"/></button>
                  </div>
                  <div className="space-y-5">
                      {/* Mistake Clearance Tip (Moved here) */}
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800 flex gap-3">
                           <div className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-full h-fit text-emerald-600 dark:text-emerald-400">
                              <Sparkles size={16} />
                           </div>
                           <div>
                              <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-xs md:text-sm">ভুল শুধরানোর সুযোগ!</h4>
                              <p className="text-[10px] md:text-xs text-emerald-700 dark:text-emerald-400 mt-1 leading-relaxed">
                                 এই এক্সামে যেসব প্রশ্নের সঠিক উত্তর দিবেন, সেগুলো অটোমেটিকলি আপনার 'ভুল' তালিকা থেকে মুছে যাবে।
                              </p>
                           </div>
                      </div>

                      <div>
                          <label className="block text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('quiz_time_limit')}</label>
                          <div className="grid grid-cols-4 gap-2">
                              {[0, 10, 20, 30].map(t => (
                                  <button key={t} onClick={() => setExamTimeLimit(t)} className={`py-2 rounded-lg text-xs font-bold border transition-all ${examTimeLimit === t ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}>{t === 0 ? 'No Limit' : `${t} Min`}</button>
                              ))}
                          </div>
                      </div>
                      <button onClick={launchExam} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-200 dark:shadow-none transition-all active:scale-95 text-sm"><Play size={16} fill="currentColor"/> {t('hero_btn')}</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default ProfilePage;
