
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth, EnrolledCourse } from '../contexts/AuthContext';
import { fetchSavedQuestionsAPI, deleteSavedQuestionAPI, fetchUserStatsAPI, fetchUserMistakesAPI, deleteUserMistakeAPI, updateSavedQuestionFolderAPI } from '../services/api';
import { uploadImageToCloudinary } from '../services/imageUpload';
import getCroppedImg from '../utils/canvasUtils';
import Cropper from 'react-easy-crop';
import { User, Mail, BookOpen, Edit2, Check, X, Camera, Award, Calendar, Bookmark, Trash2, ChevronRight, LayoutGrid, List, TrendingUp, BarChart2, AlertCircle, Zap, Filter, GraduationCap, Briefcase, Target, PieChart, Layers, RefreshCw, AlertTriangle, Clock, Play, AlignJustify, LayoutList, FolderPlus, Folder, MoveRight, Upload, Loader2, ZoomIn, ZoomOut, Lock } from 'lucide-react';
import { useToast } from './Toast';

const AVATARS = [
  'https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Aneka&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Bob&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Willow&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Jack&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Bella&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Oliver&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Sophie&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Leo&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Mila&backgroundColor=c0aede'
];

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>(); // Get userID from URL params
  const { currentUser, userAvatar, enrolledCourses, extendedProfile, updateUserProfile } = useAuth();
  const { showToast } = useToast();
  
  // Logic to determine if viewing own profile
  const isOwnProfile = !userId || (currentUser && currentUser.uid === userId);
  const viewingUserId = isOwnProfile ? currentUser?.uid : userId;

  const [activeTab, setActiveTab] = useState<'INFO' | 'COURSES' | 'SAVED' | 'MISTAKES'>('INFO');
  
  // Profile Data State (Might be current user's or fetched public user's)
  const [profileData, setProfileData] = useState<any>({
      displayName: '',
      photoURL: '',
      email: '',
      college: '',
      hscBatch: '',
      department: 'Science',
      target: 'Medical',
      stats: null
  });

  // Profile Edit State (Only for own profile)
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  
  // Edit Form Fields
  const [editCollege, setEditCollege] = useState('');
  const [editHscBatch, setEditHscBatch] = useState('');
  const [editDepartment, setEditDepartment] = useState('Science');
  const [editTarget, setEditTarget] = useState('Medical');

  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Image Upload & Crop State
  const [isUploading, setIsUploading] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Saved Questions State
  const [savedQuestions, setSavedQuestions] = useState<any[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [activeFolder, setActiveFolder] = useState<string>('All');
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [movingQuestionId, setMovingQuestionId] = useState<string | null>(null);

  // Mistakes State
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [loadingMistakes, setLoadingMistakes] = useState(false);
  
  // Filter State (Shared for Saved & Mistakes)
  const [filterSubject, setFilterSubject] = useState<string>('ALL');
  const [filterChapter, setFilterChapter] = useState<string>('ALL');

  // Exam Config Modal
  const [showExamConfig, setShowExamConfig] = useState(false);
  const [examTimeLimit, setExamTimeLimit] = useState(0);
  const [examViewMode, setExamViewMode] = useState<'SINGLE_PAGE' | 'ALL_AT_ONCE'>('SINGLE_PAGE');

  // --- DATA LOADING ---

  useEffect(() => {
    const loadProfileData = async () => {
        if (!viewingUserId) return;
        setLoading(true);
        try {
            if (isOwnProfile) {
                // Load form local context
                setProfileData({
                    displayName: currentUser?.displayName || '',
                    photoURL: userAvatar,
                    email: currentUser?.email || '',
                    college: extendedProfile?.college || '',
                    hscBatch: extendedProfile?.hscBatch || '',
                    department: extendedProfile?.department || 'Science',
                    target: extendedProfile?.target || 'Medical',
                    stats: null // Stats loaded separately
                });
                
                // Init edit form
                setNewName(currentUser?.displayName || '');
                setSelectedAvatar(userAvatar || AVATARS[0]);
                setEditCollege(extendedProfile?.college || '');
                setEditHscBatch(extendedProfile?.hscBatch || '');
                setEditDepartment(extendedProfile?.department || 'Science');
                setEditTarget(extendedProfile?.target || 'Medical');

                // Load Stats
                const data = await fetchUserStatsAPI(viewingUserId);
                setProfileData((prev: any) => ({ ...prev, stats: data }));

            } else {
                // Load from API for other user
                const data = await fetchUserStatsAPI(viewingUserId);
                if (data) {
                    setProfileData({
                        displayName: data.user?.displayName || 'Unknown User',
                        photoURL: data.user?.photoURL || AVATARS[0],
                        email: '', // Don't show email for others
                        college: data.user?.college || '',
                        hscBatch: data.user?.hscBatch || '',
                        department: data.user?.department || '',
                        target: data.user?.target || '',
                        stats: data // Includes points, exams etc
                    });
                }
            }
        } catch (e) {
            console.error("Profile load error", e);
            showToast("Failed to load profile.", "error");
        } finally {
            setLoading(false);
        }
    };
    loadProfileData();
  }, [viewingUserId, isOwnProfile, currentUser, userAvatar, extendedProfile]);

  useEffect(() => {
    // Only load private data if viewing own profile
    if (activeTab === 'SAVED' && isOwnProfile && viewingUserId) {
      loadSavedQuestions();
    }
    if (activeTab === 'MISTAKES' && isOwnProfile && viewingUserId) {
      loadMistakes();
    }
    setFilterSubject('ALL');
    setFilterChapter('ALL');
  }, [activeTab, viewingUserId, isOwnProfile]);

  const loadSavedQuestions = async () => {
    if (!viewingUserId) return;
    setLoadingSaved(true);
    try {
      const data = await fetchSavedQuestionsAPI(viewingUserId);
      setSavedQuestions(data);
    } catch (e) {
      console.error("Failed to load saved questions", e);
    } finally {
      setLoadingSaved(false);
    }
  };

  const loadMistakes = async () => {
    if (!viewingUserId) return;
    setLoadingMistakes(true);
    try {
      const data = await fetchUserMistakesAPI(viewingUserId);
      setMistakes(data);
    } catch (e) {
      console.error("Failed to load mistakes", e);
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
      setIsEditing(false);
      setShowAvatarSelector(false);
      showToast("প্রোফাইল সফলভাবে আপডেট হয়েছে", "success");
    } catch (error) {
      console.error("Failed to update profile", error);
      showToast("প্রোফাইল আপডেট করতে সমস্যা হয়েছে।", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- IMAGE UPLOAD & CROP LOGIC ---

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast("অনুগ্রহ করে একটি ইমেজ ফাইল নির্বাচন করুন", "warning");
        return;
    }
    
    // Read file as Data URL for cropping
    const reader = new FileReader();
    reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || '');
        setZoom(1);
        setShowAvatarSelector(false); // Close selector when file chosen
    });
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  const handleUploadCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    
    setIsUploading(true);
    try {
        // 1. Client-side Crop & Resize (This saves bandwidth)
        const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, 0); // 0 Rotation
        
        if (!croppedBlob) {
            throw new Error("Cropping failed");
        }

        // Convert Blob to File
        const file = new File([croppedBlob], "profile_pic.jpg", { type: "image/jpeg" });

        // 2. Upload the small, optimized file to Cloudinary
        const imageUrl = await uploadImageToCloudinary(file);
        
        setSelectedAvatar(imageUrl);
        setImageSrc(null); // Close cropper
        showToast("ছবি আপডেট সম্পন্ন হয়েছে!", "success");
    } catch (err) {
        console.error(err);
        showToast("আপলোড ব্যর্থ হয়েছে।", "error");
    } finally {
        setIsUploading(false);
    }
  };

  const cancelCrop = () => {
      setImageSrc(null);
      setZoom(1);
  };

  // ... (Existing CRUD functions remain same: handleDeleteSaved, handleMoveToFolder, etc.)
  const handleDeleteSaved = async (id: string) => {
    if (!currentUser) return;
    if (!confirm("আপনি কি নিশ্চিত এই প্রশ্নটি ডিলিট করতে চান?")) return;
    try {
      await deleteSavedQuestionAPI(currentUser.uid, id);
      setSavedQuestions(prev => prev.filter(sq => sq._id !== id));
      showToast("প্রশ্নটি ডিলিট করা হয়েছে", "info");
    } catch (e) {
      showToast("ডিলিট করতে সমস্যা হয়েছে।", "error");
    }
  };

  const handleMoveToFolder = async (savedId: string, folder: string) => {
      if (!currentUser) return;
      try {
          await updateSavedQuestionFolderAPI(currentUser.uid, savedId, folder);
          setSavedQuestions(prev => prev.map(sq => sq._id === savedId ? { ...sq, folder } : sq));
          setMovingQuestionId(null);
          showToast(`Moved to ${folder}`, "success");
      } catch (e) {
          showToast("Failed to move", "error");
      }
  };

  const handleDeleteMistake = async (id: string) => {
    if (!currentUser) return;
    if (!confirm("আপনি কি নিশ্চিত এই ভুলটি তালিকা থেকে মুছতে চান?")) return;
    try {
        await deleteUserMistakeAPI(currentUser.uid, id);
        setMistakes(prev => prev.filter(m => m._id !== id));
        showToast("তালিকা থেকে মুছে ফেলা হয়েছে", "info");
    } catch (e) {
        showToast("ডিলিট করতে সমস্যা হয়েছে।", "error");
    }
  };

  // --- Filtering Logic ---
  const { uniqueSubjects, uniqueChapters, availableFolders } = useMemo(() => {
    const subjects = new Set<string>();
    const chapters = new Set<string>();
    const folders = new Set<string>(['All', 'General']);
    
    const sourceData = activeTab === 'SAVED' ? savedQuestions : mistakes;

    sourceData.forEach(item => {
        const q = activeTab === 'SAVED' ? item.questionId : item;
        if (!q) return;
        if (q.subject) subjects.add(q.subject);
        if (q.chapter) {
            if (filterSubject === 'ALL' || q.subject === filterSubject) {
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
  }, [activeTab, savedQuestions, mistakes, filterSubject]);

  const filteredItems = useMemo(() => {
      let sourceData = activeTab === 'SAVED' ? savedQuestions : mistakes;
      if (activeTab === 'SAVED' && activeFolder !== 'All') {
          sourceData = sourceData.filter(item => (item.folder || 'General') === activeFolder);
      }
      return sourceData.filter(item => {
          const q = activeTab === 'SAVED' ? item.questionId : item;
          if (!q) return false;
          const matchSubject = filterSubject === 'ALL' || q.subject === filterSubject;
          const matchChapter = filterChapter === 'ALL' || q.chapter === filterChapter;
          return matchSubject && matchChapter;
      });
  }, [activeTab, savedQuestions, mistakes, filterSubject, filterChapter, activeFolder]);


  // --- Exam Logic ---
  const launchExam = () => {
    if (activeTab !== 'MISTAKES') return;
    const examQuestions = filteredItems.map(m => ({
        question: m.question,
        options: m.options,
        correctAnswerIndex: m.correctAnswerIndex,
        explanation: m.explanation,
        subject: m.subject,
        chapter: m.chapter,
        topic: m.topic
    }));
    if (examQuestions.length === 0) return;
    const config = {
        questions: examQuestions,
        time: examTimeLimit,
        mode: examViewMode
    };
    localStorage.setItem('mistake_exam_config', JSON.stringify(config));
    setShowExamConfig(false);
    navigate('/quiz');
  };

  const getLevel = (points: number) => {
    if (points < 100) return { name: 'Novice', color: 'bg-gray-400' };
    if (points < 500) return { name: 'Apprentice', color: 'bg-green-500' };
    if (points < 1000) return { name: 'Scholar', color: 'bg-blue-500' };
    if (points < 2000) return { name: 'Master', color: 'bg-indigo-500' };
    return { name: 'Grandmaster', color: 'bg-orange-500' };
  };

  const currentLevel = getLevel(profileData.stats?.points || 0);

  if (loading && !profileData.stats) {
      return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32}/></div>;
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors">
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 pb-20">
        
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl p-5 md:p-8 border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 md:h-32 bg-gradient-to-r from-primary to-blue-600 opacity-10"></div>
          
          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8 mt-2 md:mt-4">
            
            {/* Avatar */}
            <div className="relative group">
               <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img src={isEditing ? selectedAvatar : profileData.photoURL} alt="Profile" className="w-full h-full object-cover bg-white" />
               </div>
               {isEditing && isOwnProfile && (
                 <button 
                    onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                    className="absolute bottom-0 right-0 p-2 bg-gray-900 text-white rounded-full hover:bg-black transition-colors shadow-lg"
                 >
                    <Camera size={16} className="md:w-5 md:h-5" />
                 </button>
               )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left space-y-2 w-full">
               {isEditing && isOwnProfile ? (
                 <div className="grid md:grid-cols-2 gap-4 w-full">
                    {/* ... Form inputs ... */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">আপনার নাম</label>
                      <input 
                        type="text" 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">কলেজ</label>
                      <input 
                        type="text" 
                        value={editCollege}
                        onChange={(e) => setEditCollege(e.target.value)}
                        placeholder="আপনার কলেজের নাম"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">HSC ব্যাচ</label>
                      <input 
                        type="text" 
                        value={editHscBatch}
                        onChange={(e) => setEditHscBatch(e.target.value)}
                        placeholder="যেমন: 2024"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">বিভাগ</label>
                      <select value={editDepartment} onChange={(e) => setEditDepartment(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white">
                          <option>Science</option>
                          <option>Arts</option>
                          <option>Commerce</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">লক্ষ্য (Target)</label>
                      <select value={editTarget} onChange={(e) => setEditTarget(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white">
                          <option>Medical</option>
                          <option>Engineering (BUET/CKRUET)</option>
                          <option>University (A Unit)</option>
                          <option>Guccho</option>
                      </select>
                    </div>
                 </div>
               ) : (
                 <>
                    <div className="flex flex-col md:flex-row items-center gap-3 justify-center md:justify-start">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{profileData.displayName}</h1>
                        {profileData.stats && (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${currentLevel.color}`}>
                                {currentLevel.name}
                            </span>
                        )}
                        {!isOwnProfile && <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs px-2 py-1 rounded">Public View</span>}
                    </div>
                    
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-4 text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-2">
                       {profileData.college && (
                           <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                               <GraduationCap size={12} className="md:w-3.5 md:h-3.5" /> {profileData.college}
                           </div>
                       )}
                       {profileData.hscBatch && (
                           <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                               <Calendar size={12} className="md:w-3.5 md:h-3.5" /> Batch: {profileData.hscBatch}
                           </div>
                       )}
                       {profileData.department && (
                           <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                               <BookOpen size={12} className="md:w-3.5 md:h-3.5" /> {profileData.department}
                           </div>
                       )}
                       {profileData.target && (
                           <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded font-bold">
                               <Target size={12} className="md:w-3.5 md:h-3.5" /> {profileData.target} Aspirant
                           </div>
                       )}
                    </div>

                    {isOwnProfile && (
                        <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 dark:text-gray-400 text-xs mt-2">
                           <Mail size={12} /> {profileData.email}
                        </div>
                    )}
                 </>
               )}
            </div>

            {/* Action Buttons (Only for Own Profile) */}
            <div className="w-full md:w-auto">
               {isOwnProfile && (
                   isEditing ? (
                     <div className="flex gap-2 flex-col md:flex-row w-full">
                        <button 
                          onClick={() => { setIsEditing(false); }}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-bold flex items-center justify-center gap-2"
                          disabled={loading}
                        >
                           <X size={18} /> বাতিল
                        </button>
                        <button 
                          onClick={handleSaveProfile}
                          className="px-4 py-2 bg-primary text-white rounded-lg font-bold flex items-center justify-center gap-2"
                          disabled={loading}
                        >
                           <Check size={18} /> সেভ
                        </button>
                     </div>
                   ) : (
                     <button 
                       onClick={() => setIsEditing(true)}
                       className="px-4 py-2 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-bold flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 transition-colors w-full md:w-auto"
                     >
                        <Edit2 size={16} /> প্রোফাইল এডিট
                     </button>
                   )
               )}
            </div>
          </div>
        </div>

        {/* --- AVATAR SELECTOR MODAL --- */}
        {showAvatarSelector && isEditing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 dark:text-white">প্রোফাইল ছবি পরিবর্তন</h3>
                        <button onClick={() => setShowAvatarSelector(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20}/></button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto">
                        {/* Upload Section */}
                        <div className="mb-6 p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                ref={fileInputRef} 
                                onChange={handleFileSelect} 
                                disabled={isUploading}
                            />
                            <div className="mb-2 p-3 bg-white dark:bg-gray-700 rounded-full shadow-sm">
                                {isUploading ? <Loader2 size={24} className="animate-spin text-primary"/> : <Upload size={24} className="text-primary dark:text-blue-400"/>}
                            </div>
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">
                                ছবি আপলোড করুন
                            </p>
                            <p className="text-xs text-gray-500">গ্যালারি থেকে ছবি বাছাই করুন</p>
                        </div>

                        {/* Avatar Section */}
                        <p className="font-bold text-gray-500 dark:text-gray-400 mb-3 text-xs uppercase tracking-wider">অথবা একটি অবতার বেছে নিন:</p>
                        <div className="grid grid-cols-4 gap-3">
                           {AVATARS.map((avatar, idx) => (
                              <button 
                                key={idx}
                                onClick={() => {
                                    setSelectedAvatar(avatar);
                                    setShowAvatarSelector(false);
                                }}
                                className={`aspect-square rounded-full border-2 overflow-hidden transition-all bg-white hover:scale-105 ${selectedAvatar === avatar ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-gray-300'}`}
                              >
                                 <img src={avatar} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                              </button>
                           ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CROP MODAL --- */}
        {imageSrc && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                        <h3 className="font-bold text-gray-800 dark:text-white">প্রোফাইল ছবি এডিট</h3>
                        <button onClick={cancelCrop} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"><X size={20} className="text-gray-500"/></button>
                    </div>
                    
                    <div className="relative w-full h-[320px] bg-black">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            rotation={0}
                            aspect={1}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                            cropShape="round"
                            showGrid={false}
                        />
                    </div>

                    <div className="p-6 space-y-5 bg-white dark:bg-gray-800">
                        {/* Zoom Control */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <span>জুম (Zoom)</span>
                                <span>{Math.round((zoom - 1) * 100)}%</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <ZoomOut size={16} className="text-gray-400"/>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <ZoomIn size={16} className="text-gray-400"/>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 pt-2">
                            <button 
                                onClick={cancelCrop}
                                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                বাতিল
                            </button>
                            <button 
                                onClick={handleUploadCroppedImage}
                                disabled={isUploading}
                                className="flex-1 py-3 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                            >
                                {isUploading ? <Loader2 className="animate-spin" size={18}/> : <Check size={18}/>} 
                                সেভ করুন
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Navigation Tabs (Restricted for Public Profile) */}
        <div className="flex p-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 w-full md:w-fit mx-auto md:mx-0 overflow-x-auto no-scrollbar">
           <button onClick={() => setActiveTab('INFO')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'INFO' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
              <LayoutGrid size={16} /> এনালাইসিস
           </button>
           {isOwnProfile ? (
               <>
                   <button onClick={() => setActiveTab('COURSES')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'COURSES' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                      <BookOpen size={16} /> কোর্সসমূহ
                   </button>
                   <button onClick={() => setActiveTab('SAVED')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'SAVED' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                      <Bookmark size={16} /> বুকমার্ক
                   </button>
                   <button onClick={() => setActiveTab('MISTAKES')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'MISTAKES' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50' : 'text-gray-500 hover:text-red-600 dark:hover:text-red-400'}`}>
                      <AlertTriangle size={16} /> ভুলসমূহ
                   </button>
               </>
           ) : (
               // Disabled/Hidden tabs visual cue for public view
               <div className="flex items-center gap-2 px-4 text-xs text-gray-400 italic">
                   <Lock size={12}/> Private Data Hidden
               </div>
           )}
        </div>

        {activeTab === 'INFO' && profileData.stats && (
            <div className="space-y-4 md:space-y-6 animate-in fade-in">
               {/* Quick Stats Grid */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                   <div className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
                       <p className="text-gray-500 dark:text-gray-400 text-[10px] md:text-xs font-bold uppercase mb-1">মোট এক্সাম</p>
                       <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">{profileData.stats.totalExams}</p>
                   </div>
                   {/* ... other stats ... */}
                   <div className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
                       <p className="text-gray-500 dark:text-gray-400 text-[10px] md:text-xs font-bold uppercase mb-1">সঠিক</p>
                       <p className="text-xl md:text-2xl font-bold text-green-600">{profileData.stats.totalCorrect}</p>
                   </div>
                   <div className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
                       <p className="text-gray-500 dark:text-gray-400 text-[10px] md:text-xs font-bold uppercase mb-1">ভুল</p>
                       <p className="text-xl md:text-2xl font-bold text-red-600">{profileData.stats.totalWrong}</p>
                   </div>
                   <div className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm text-center bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10">
                       <p className="text-orange-600 dark:text-orange-400 text-[10px] md:text-xs font-bold uppercase mb-1 flex items-center justify-center gap-1"><Zap size={12} fill="currentColor"/> পয়েন্ট</p>
                       <p className="text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-400">{profileData.stats.points}</p>
                   </div>
               </div>

               {/* Advanced Analysis Grid */}
               <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                   {/* Weakness & Strength (Topic Wise) */}
                   <div className="bg-white dark:bg-gray-800 p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                       <h3 className="font-bold text-gray-800 dark:text-white mb-4 md:mb-6 flex items-center gap-2 text-sm md:text-base">
                           <TrendingUp size={18} className="text-primary"/> টপিক মাস্টারি
                       </h3>
                       
                       <div className="space-y-6">
                           {/* Strong Topics */}
                           <div>
                               <p className="text-xs font-bold text-green-600 uppercase mb-3 flex items-center gap-1"><Award size={12}/> শক্তিশালী টপিক</p>
                               <div className="space-y-2">
                                   {profileData.stats.strongestTopics && profileData.stats.strongestTopics.length > 0 ? (
                                       profileData.stats.strongestTopics.map((t: any) => (
                                           <div key={t.topic} className="flex justify-between items-center bg-green-50 dark:bg-green-900/10 px-3 py-2 rounded-lg">
                                               <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 truncate mr-2">{t.topic || 'Unknown'}</span>
                                               <span className="text-xs font-bold text-green-600 shrink-0">{t.accuracy.toFixed(0)}%</span>
                                           </div>
                                       ))
                                   ) : <p className="text-xs text-gray-400">পর্যাপ্ত ডেটা নেই</p>}
                               </div>
                           </div>

                           {/* Weak Topics */}
                           <div>
                               <p className="text-xs font-bold text-red-500 uppercase mb-3 flex items-center gap-1"><AlertCircle size={12}/> দুর্বল টপিক</p>
                               <div className="space-y-2">
                                   {profileData.stats.weakestTopics && profileData.stats.weakestTopics.length > 0 ? (
                                       profileData.stats.weakestTopics.map((t: any) => (
                                           <div key={t.topic} className="flex justify-between items-center bg-red-50 dark:bg-red-900/10 px-3 py-2 rounded-lg">
                                               <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 truncate mr-2">{t.topic || 'Unknown'}</span>
                                               <span className="text-xs font-bold text-red-500 shrink-0">{t.accuracy.toFixed(0)}%</span>
                                           </div>
                                       ))
                                   ) : <p className="text-xs text-gray-400">পর্যাপ্ত ডেটা নেই</p>}
                               </div>
                           </div>
                       </div>
                   </div>

                   {/* Subject Performance - BAR CHART */}
                   <div className="bg-white dark:bg-gray-800 p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
                       <h3 className="font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 text-sm md:text-base">
                           <BarChart2 size={18} className="text-blue-500"/> বিষয়ভিত্তিক দক্ষতা
                       </h3>
                       
                       <div className="flex-1 flex flex-col justify-end">
                           {(!profileData.stats.subjectBreakdown || profileData.stats.subjectBreakdown.length === 0) ? (
                               <div className="text-center py-10 text-gray-400">
                                   <PieChart size={48} className="mx-auto mb-2 opacity-20" />
                                   <p>কোনো ডেটা পাওয়া যায়নি</p>
                               </div>
                           ) : (
                               <div className="w-full">
                                   <div className="flex items-end gap-3 h-48 sm:h-56 pb-2 px-2">
                                      {profileData.stats.subjectBreakdown.map((subj: any) => {
                                          const height = Math.max(10, subj.accuracy); // Minimum height for visibility
                                          const colorClass = subj.accuracy >= 75 ? 'bg-green-500' : subj.accuracy >= 40 ? 'bg-yellow-500' : 'bg-red-500';
                                          
                                          return (
                                              <div key={subj.subject} className="flex-1 flex flex-col items-center gap-2 group relative">
                                                  {/* Tooltip */}
                                                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                                                      {subj.subject}: {subj.accuracy.toFixed(0)}%
                                                  </div>
                                                  
                                                  <div className="w-full max-w-[40px] bg-gray-100 dark:bg-gray-700 rounded-t-lg relative flex flex-col justify-end overflow-hidden h-full">
                                                      <div 
                                                        className={`w-full transition-all duration-1000 ease-out ${colorClass} opacity-80 group-hover:opacity-100`} 
                                                        style={{ height: `${height}%` }}
                                                      ></div>
                                                  </div>
                                              </div>
                                          )
                                      })}
                                   </div>
                                   {/* X-Axis Labels */}
                                   <div className="flex gap-3 px-2 border-t border-gray-200 dark:border-gray-700 pt-2">
                                      {profileData.stats.subjectBreakdown.map((subj: any) => (
                                          <div key={subj.subject} className="flex-1 text-center">
                                              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium truncate" title={subj.subject}>
                                                  {subj.subject.split(' ')[0]}
                                              </p>
                                          </div>
                                      ))}
                                   </div>
                               </div>
                           )}
                       </div>
                   </div>
               </div>
            </div>
        )}

        {/* ... Rest of tabs (COURSES, SAVED, MISTAKES) - ONLY SHOW IF OWN PROFILE ... */}
        {isOwnProfile && activeTab === 'COURSES' && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 shadow-sm animate-in fade-in">
               {/* ... Content from previous step ... */}
               <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <BookOpen size={20} className="text-primary md:w-6 md:h-6" /> আমার কোর্সসমূহ
               </h2>
               {enrolledCourses.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {enrolledCourses.map((course) => (
                       <div key={course.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:border-primary transition-colors">
                          <h3 className="font-bold text-gray-800 dark:text-white mb-2 text-sm md:text-base">{course.title}</h3>
                          <div className="flex justify-between items-end mb-1">
                             <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
                             <span className="text-xs font-bold text-primary dark:text-green-400">{course.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                             <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${course.progress}%` }}></div>
                          </div>
                       </div>
                    ))}
                 </div>
               ) : (
                 <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    <p>আপনি কোনো কোর্সে এনরোল করেননি।</p>
                 </div>
               )}
            </div>
        )}

        {isOwnProfile && activeTab === 'SAVED' && (
            <div className="space-y-6 animate-in fade-in">
               {/* Folder Nav */}
               <div className="flex flex-col gap-4">
                   <div className="flex flex-wrap gap-2 items-center">
                       {availableFolders.map(folder => (
                           <button
                               key={folder}
                               onClick={() => setActiveFolder(folder)}
                               className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border ${activeFolder === folder ? 'bg-purple-100 border-purple-300 text-purple-700 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                           >
                               <Folder size={14} fill={activeFolder === folder ? "currentColor" : "none"}/>
                               {folder}
                           </button>
                       ))}
                       {/* Add button logic */}
                       <div className="relative flex items-center">
                           {isCreatingFolder ? (
                               <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-1">
                                   <input 
                                     autoFocus
                                     className="w-24 text-xs p-1 outline-none bg-transparent"
                                     placeholder="Name..."
                                     value={newFolderName}
                                     onChange={(e) => setNewFolderName(e.target.value)}
                                     onKeyDown={(e) => {
                                         if (e.key === 'Enter' && newFolderName.trim()) {
                                             setIsCreatingFolder(false);
                                             showToast("To create a folder, move a question to 'New Folder'!", "info");
                                         }
                                     }}
                                   />
                                   <button onClick={() => setIsCreatingFolder(false)}><X size={12}/></button>
                               </div>
                           ) : (
                               <button 
                                 onClick={() => setIsCreatingFolder(true)} 
                                 className="px-2 py-1.5 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 hover:text-gray-700 hover:border-gray-400 text-xs flex items-center gap-1"
                               >
                                   <FolderPlus size={14}/> Add
                               </button>
                           )}
                       </div>
                   </div>
               </div>
               
               {/* Filters & Content for Saved */}
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                   <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Bookmark size={20} className="text-primary md:w-6 md:h-6" /> 
                      {activeFolder === 'All' ? 'All Saved Questions' : activeFolder} ({filteredItems.length})
                   </h2>
                   
                   <div className="flex gap-2 w-full md:w-auto">
                      <div className="relative flex-1 md:min-w-[150px]">
                         <select 
                           value={filterSubject}
                           onChange={(e) => { setFilterSubject(e.target.value); setFilterChapter('ALL'); }}
                           className="w-full pl-8 pr-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                         >
                            <option value="ALL">All Subjects</option>
                            {uniqueSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                         </select>
                         <Filter size={14} className="absolute left-3 top-3 text-gray-400" />
                      </div>
                      
                      <div className="relative flex-1 md:min-w-[150px]">
                         <select 
                           value={filterChapter}
                           onChange={(e) => setFilterChapter(e.target.value)}
                           className="w-full pl-3 pr-8 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                         >
                            <option value="ALL">All Chapters</option>
                            {uniqueChapters.map(chap => <option key={chap} value={chap}>{chap}</option>)}
                         </select>
                      </div>
                   </div>
               </div>

               {loadingSaved ? (
                  <div className="text-center py-12 text-gray-500">লোডিং...</div>
               ) : filteredItems.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-500">
                     <p>
                        {savedQuestions.length === 0 
                           ? "কোনো প্রশ্ন সেভ করা নেই। কুইজ চলাকালীন কঠিন প্রশ্নগুলো সেভ করুন!"
                           : "এই ফোল্ডার/ফিল্টারে কোনো প্রশ্ন পাওয়া যায়নি।"
                        }
                     </p>
                  </div>
               ) : (
                  <div className="space-y-4">
                     {filteredItems.map((sq) => {
                        const q = sq.questionId; 
                        if (!q) return null; 
                        return (
                           <div key={sq._id} className="bg-white dark:bg-gray-800 p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm relative group">
                              <div className="absolute top-4 right-4 flex items-center gap-2">
                                  {/* Move Button */}
                                  <div className="relative">
                                      <button 
                                        onClick={() => setMovingQuestionId(movingQuestionId === sq._id ? null : sq._id)}
                                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                      >
                                          <MoveRight size={18} />
                                      </button>
                                      {movingQuestionId === sq._id && (
                                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95">
                                              <div className="max-h-48 overflow-y-auto">
                                                  {availableFolders.filter(f => f !== 'All').map(folder => (
                                                      <button
                                                          key={folder}
                                                          onClick={() => handleMoveToFolder(sq._id, folder)}
                                                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                                      >
                                                          <Folder size={14}/> {folder}
                                                      </button>
                                                  ))}
                                                  <div className="p-2 border-t border-gray-100 dark:border-gray-700">
                                                      <input 
                                                        placeholder="New Folder..."
                                                        className="w-full text-sm border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleMoveToFolder(sq._id, (e.target as HTMLInputElement).value);
                                                        }}
                                                      />
                                                  </div>
                                              </div>
                                          </div>
                                      )}
                                  </div>
                                  <button onClick={() => handleDeleteSaved(sq._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                    <Trash2 size={18} />
                                  </button>
                              </div>
                              
                              <div className="flex flex-wrap gap-2 mb-3 pr-20">
                                 {q.subject && <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-[10px] rounded font-bold text-gray-600 dark:text-gray-300">{q.subject}</span>}
                                 {q.chapter && <span className="px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-[10px] rounded font-bold">{q.chapter}</span>}
                                 {sq.folder && sq.folder !== 'General' && <span className="px-2 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-[10px] rounded font-bold flex items-center gap-1"><Folder size={10}/> {sq.folder}</span>}
                              </div>

                              <h3 className="font-bold text-gray-800 dark:text-white mb-4 pr-4 text-base md:text-lg">{q.question}</h3>
                              
                              <div className="grid sm:grid-cols-2 gap-2 mb-4">
                                 {q.options.map((opt: string, idx: number) => (
                                    <div key={idx} className={`p-3 rounded-lg border text-sm flex items-center gap-2 ${idx === q.correctAnswerIndex ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 font-medium' : 'border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900'}`}>
                                       <span className="opacity-50 text-xs font-mono min-w-[20px]">({['A','B','C','D'][idx]})</span> 
                                       <span>{opt}</span>
                                       {idx === q.correctAnswerIndex && <Check size={16} className="ml-auto text-green-500" />}
                                    </div>
                                 ))}
                              </div>
                              {q.explanation && (
                                 <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl text-xs md:text-sm text-gray-700 dark:text-gray-300 border border-blue-100 dark:border-blue-800/50">
                                    <span className="font-bold block mb-1 text-blue-600 dark:text-blue-400 flex items-center gap-1"><BookOpen size={14}/> ব্যাখ্যা:</span> {q.explanation}
                                 </div>
                              )}
                           </div>
                        );
                     })}
                  </div>
               )}
            </div>
        )}

        {isOwnProfile && activeTab === 'MISTAKES' && (
            <div className="space-y-6 animate-in fade-in">
               {/* Controls */}
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                   <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <AlertTriangle size={20} className="text-red-500 md:w-6 md:h-6" /> ভুলের খাতা ({filteredItems.length})
                   </h2>
                   
                   <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:min-w-[150px]">
                            <select 
                            value={filterSubject}
                            onChange={(e) => { setFilterSubject(e.target.value); setFilterChapter('ALL'); }}
                            className="w-full pl-8 pr-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                            >
                                <option value="ALL">All Subjects</option>
                                {uniqueSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                            </select>
                            <Filter size={14} className="absolute left-3 top-3 text-gray-400" />
                        </div>
                        <div className="relative flex-1 md:min-w-[150px]">
                            <select 
                            value={filterChapter}
                            onChange={(e) => setFilterChapter(e.target.value)}
                            className="w-full pl-3 pr-8 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                            >
                                <option value="ALL">All Chapters</option>
                                {uniqueChapters.map(chap => <option key={chap} value={chap}>{chap}</option>)}
                            </select>
                        </div>
                   </div>

                   {filteredItems.length > 0 && (
                       <button 
                         onClick={() => setShowExamConfig(true)}
                         className="w-full md:w-auto px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 shadow-lg shadow-red-200 dark:shadow-none transition-all active:scale-95 text-sm"
                       >
                          <RefreshCw size={16} /> পুনরায় দিন ({filteredItems.length})
                       </button>
                   )}
               </div>

               {loadingMistakes ? (
                  <div className="text-center py-12 text-gray-500">লোডিং...</div>
               ) : mistakes.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-500">
                     <p>গ্রেট জব! আপনার কোনো রেকর্ডকৃত ভুল নেই।</p>
                  </div>
               ) : (
                  <div className="space-y-4">
                     {filteredItems.map((m) => (
                        <div key={m._id} className="bg-white dark:bg-gray-800 p-5 md:p-6 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm relative group">
                           <button 
                                onClick={() => handleDeleteMistake(m._id)}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors z-10"
                           >
                                <Trash2 size={18} />
                           </button>
                           <div className="absolute top-4 right-14 text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                              Missed {m.wrongCount} times
                           </div>
                           <div className="flex flex-wrap gap-2 mb-3 pr-24">
                               {m.subject && <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-[10px] rounded font-bold text-gray-600 dark:text-gray-300">{m.subject}</span>}
                               {m.topic && <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] rounded font-bold">{m.topic}</span>}
                           </div>
                           <h3 className="font-bold text-gray-800 dark:text-white mb-4 text-base md:text-lg">{m.question}</h3>
                           <div className="grid sm:grid-cols-2 gap-2 mb-4">
                              {m.options.map((opt: string, idx: number) => (
                                 <div key={idx} className={`p-3 rounded-lg border text-sm flex items-center gap-2 ${idx === m.correctAnswerIndex ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 font-medium' : 'border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900'}`}>
                                    <span className="opacity-50 text-xs font-mono min-w-[20px]">({['A','B','C','D'][idx]})</span> 
                                    <span>{opt}</span>
                                    {idx === m.correctAnswerIndex && <Check size={16} className="ml-auto text-green-500" />}
                                 </div>
                              ))}
                           </div>
                           {m.explanation && (
                              <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl text-xs md:text-sm text-gray-700 dark:text-gray-300 border border-red-100 dark:border-red-800/50">
                                 <span className="font-bold block mb-1 text-red-600 dark:text-red-400 flex items-center gap-1"><BookOpen size={14}/> ব্যাখ্যা:</span> {m.explanation}
                              </div>
                           )}
                        </div>
                     ))}
                  </div>
               )}
            </div>
        )}

      </div>

      {/* Exam Config Modal (Same as before) */}
      {showExamConfig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 border border-gray-200 dark:border-gray-700">
                  {/* ... Modal content ... */}
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <AlertTriangle size={24} className="text-red-500"/> Retake Configuration
                      </h3>
                      <button onClick={() => setShowExamConfig(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20} className="text-gray-500"/></button>
                  </div>
                  <div className="space-y-6">
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Selected Questions</p>
                          <div className="flex justify-between items-center">
                              <span className="text-2xl font-bold text-gray-900 dark:text-white">{filteredItems.length}</span>
                              <div className="text-xs text-right text-gray-500">
                                  {filterSubject !== 'ALL' ? filterSubject : 'All Subjects'} <br/>
                                  {filterChapter !== 'ALL' ? filterChapter : 'All Chapters'}
                              </div>
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Time Limit</label>
                          <div className="grid grid-cols-4 gap-2">
                              {[0, 10, 20, 30].map(t => (
                                  <button 
                                    key={t} 
                                    onClick={() => setExamTimeLimit(t)}
                                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${examTimeLimit === t ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}
                                  >
                                      {t === 0 ? 'No Limit' : `${t} Min`}
                                  </button>
                              ))}
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">View Mode</label>
                          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                              <button onClick={() => setExamViewMode('SINGLE_PAGE')} className={`flex-1 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-all ${examViewMode === 'SINGLE_PAGE' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary dark:text-white' : 'text-gray-500'}`}><LayoutList size={14} /> Single Page</button>
                              <button onClick={() => setExamViewMode('ALL_AT_ONCE')} className={`flex-1 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-all ${examViewMode === 'ALL_AT_ONCE' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary dark:text-white' : 'text-gray-500'}`}><AlignJustify size={14} /> All at Once</button>
                          </div>
                      </div>
                      <button 
                        onClick={launchExam}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-200 dark:shadow-none transition-all"
                      >
                          <Play size={18} fill="currentColor"/> Start Exam
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ProfilePage;
