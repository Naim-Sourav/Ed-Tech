
import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchSavedQuestionsAPI, deleteSavedQuestionAPI, fetchUserStatsAPI, fetchUserMistakesAPI, deleteUserMistakeAPI, updateSavedQuestionFolderAPI, deleteExamResultAPI, fetchSyllabusStatsAPI } from '../services/api';
import { uploadImageToCloudinary } from '../services/imageUpload';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Edit2, X, BookOpen, Award, Calendar, Bookmark, Trash2, ChevronRight, LayoutGrid, List, BarChart3, Filter, GraduationCap, Briefcase, Target, PieChart, RefreshCw, AlertTriangle, Play, FolderPlus, Folder, MoveRight, Upload, Loader2, Lock, Swords, CheckCircle, ChevronDown, FileQuestion, ChevronLeft, Sparkles, Check, AlertCircle, Settings, LogOut, Sun, Moon, Laptop, Type, Flame, TrendingUp, ArrowRight, HelpCircle } from 'lucide-react';
import { useToast } from './Toast';
import { useCache } from '../contexts/CacheContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { normalizeBangla, uniqueByNormalization, normalizeForComparison } from '../utils/normalization';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart as ReChartsPieChart, Pie, Cell } from 'recharts';


import { db } from '../services/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';

const AVATARS: string[] = [];

const ITEMS_PER_PAGE = 10; // Limits items per page to prevent full-page PDF saves

// Helper to dynamically aggregate client-side and server-side stats
const VALID_SUBJECTS: Record<string, string> = {
  "Biology 1st Paper": "জীববিজ্ঞান ১ম পত্র",
  "Biology 2nd Paper": "জীববিজ্ঞান ২য় পত্র",
  "Physics 1st Paper": "পদার্থবিজ্ঞান ১ম পত্র",
  "Physics 2nd Paper": "পদার্থবিজ্ঞান ২য় পত্র",
  "Chemistry 1st Paper": "রসায়ন ১ম পত্র",
  "Chemistry 2nd Paper": "রসায়ন ২য় পত্র",
  "Higher Math 1st Paper": "উচ্চতর গণিত ১ম পত্র",
  "Higher Math 2nd Paper": "উচ্চতর গণিত ২য় পত্র",
  "Bangla 1st Paper": "বাংলা ১ম পত্র",
  "Bangla 2nd Paper": "বাংলা ২য় পত্র",
  "English": "ইংরেজি",
  "English 1st Paper": "ইংরেজি ১ম পত্র",
  "English 2nd Paper": "ইংরেজি ২য় পত্র",
  "ICT": "তথ্য ও যোগাযোগ প্রযুক্তি",
  "General Knowledge": "সাধারণ জ্ঞান"
};

const aggregateStatsFromAttempts = (attempts: any[], serverStats: any) => {
  const stats = {
      points: serverStats?.points || 0,
      totalExams: serverStats?.totalExams || 0,
      totalCorrect: serverStats?.totalCorrect || 0,
      totalWrong: serverStats?.totalWrong || 0,
      subjectBreakdown: [] as any[],
      strongestTopics: serverStats?.strongestTopics || [],
      weakestTopics: serverStats?.weakestTopics || [],
      quests: serverStats?.quests || [],
      weeklyQuests: serverStats?.weeklyQuests || [],
      currentStreak: serverStats?.currentStreak || 0,
      activityLog: serverStats?.activityLog || [],
      user: serverStats?.user || null
  };

  const subjectsMap: Record<string, any> = {};

  // First, populate from server stats
  if (serverStats?.subjectBreakdown && Array.isArray(serverStats.subjectBreakdown)) {
      serverStats.subjectBreakdown.forEach((sub: any) => {
          let correct = sub.correct || 0;
          let total = sub.total || 0;

          // Back-extract from server stats.user if possible
          if ((total === 0 || total === undefined) && serverStats.user?.stats?.subjectStats) {
              const uStats = serverStats.user.stats.subjectStats;
              const matching = uStats[sub.subject] || (typeof uStats.get === 'function' ? uStats.get(sub.subject) : null);
              if (matching) {
                  correct = matching.correct || 0;
                  total = matching.total || 0;
              }
          }

          subjectsMap[sub.subject] = {
              subject: sub.subject,
              correct: correct,
              total: total,
              wrong: sub.wrong !== undefined ? sub.wrong : Math.max(0, total - correct - (sub.skipped !== undefined ? sub.skipped : 0)),
              skipped: sub.skipped !== undefined ? sub.skipped : 0,
              accuracy: sub.accuracy !== undefined ? Math.round(sub.accuracy) : (total > 0 ? Math.round((correct / total) * 100) : 0),
              chapters: {} as Record<string, any>
          };
      });
  }

  // Next, enrich with local attempts details (chapter-level)
  attempts.forEach((attempt: any) => {
      const defaultSubject = attempt.subject || 'General';
      if (attempt.questions && Array.isArray(attempt.questions) && attempt.userAnswers && Array.isArray(attempt.userAnswers)) {
          attempt.questions.forEach((q: any, idx: number) => {
              if (!q) return;
              const qSubject = q.subject || defaultSubject || 'General';
              const qChapter = q.chapter || 'অন্যান্য অধ্যায়';
              
              const answer = attempt.userAnswers[idx];
              const isCorrect = answer === q.correctAnswerIndex;
              const isSkipped = answer === null || answer === undefined;
              const isWrong = !isCorrect && !isSkipped;

              if (!subjectsMap[qSubject]) {
                  subjectsMap[qSubject] = {
                      subject: qSubject,
                      correct: 0,
                      total: 0,
                      wrong: 0,
                      skipped: 0,
                      accuracy: 0,
                      chapters: {}
                  };
              }

              const sub = subjectsMap[qSubject];
              if (!sub.localQuestionsTracked) {
                  sub.localQuestionsTracked = new Set();
              }
              const qId = q._id || `${q.question}_${idx}`;
              const attemptIdTrack = `${attempt.examId}_${qId}`;
              
              if (!sub.localQuestionsTracked.has(attemptIdTrack)) {
                  sub.localQuestionsTracked.add(attemptIdTrack);
                  
                  sub.total++;
                  if (isCorrect) sub.correct++;
                  else if (isWrong) sub.wrong++;
                  else if (isSkipped) sub.skipped++;

                  if (!sub.chapters[qChapter]) {
                      sub.chapters[qChapter] = {
                          total: 0,
                          correct: 0,
                          wrong: 0,
                          skipped: 0
                      };
                  }
                  const chap = sub.chapters[qChapter];
                  chap.total++;
                  if (isCorrect) chap.correct++;
                  else if (isWrong) chap.wrong++;
                  else if (isSkipped) chap.skipped++;
              }
          });
      }
  });

  // Calculate accuracies, remove tracking references, and sort
  stats.subjectBreakdown = Object.values(subjectsMap)
      .filter((sub: any) => VALID_SUBJECTS[sub.subject])
      .map((sub: any) => {
          if (sub.localQuestionsTracked) {
              delete sub.localQuestionsTracked;
          }
          sub.accuracy = sub.total > 0 ? Math.round((sub.correct / sub.total) * 100) : sub.accuracy || 0;
          return sub;
      }).sort((a: any, b: any) => b.accuracy - a.accuracy);

  // Sync global stats numbers to match aggregated correct/wrong counts
  if (attempts.length > 0) {
      let calcCorrect = 0;
      let calcWrong = 0;
      const calcExams = serverStats?.totalExams || 0;

      const uniqueAttemptsMap = new Map();
      attempts.forEach(a => uniqueAttemptsMap.set(a.examId, a));
      const uniqueAttempts = Array.from(uniqueAttemptsMap.values());
      
      uniqueAttempts.forEach(a => {
          calcCorrect += (a.correct || 0);
          calcWrong += (a.wrong || 0);
      });

      stats.totalCorrect = Math.max(serverStats?.totalCorrect || 0, calcCorrect);
      stats.totalWrong = Math.max(serverStats?.totalWrong || 0, calcWrong);
      stats.totalExams = Math.max(calcExams, uniqueAttempts.length);
  }

  return stats;
};

const ProfilePage: React.FC<{ themeMode?: 'light' | 'dark' | 'system'; toggleTheme?: () => void }> = ({ themeMode, toggleTheme }) => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>(); // Get userID from URL params
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, userAvatar, enrolledCourses, extendedProfile, updateUserProfile, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { questionFont, setQuestionFont, questionFontSize, setQuestionFontSize } = usePreferences();
  const { showToast } = useToast();
  const { getCache, setCache } = useCache();
  
  // Logic to determine if you viewing own profile
  const isOwnProfile = !userId || (currentUser && currentUser.uid === userId);
  const viewingUserId = isOwnProfile ? currentUser?.uid : userId;
  const cacheKey = `profile_${viewingUserId}`;

  // Cache Initialization
  const cachedData = getCache(cacheKey) || {};

  // Tab State derived from URL
  const activeTab = (searchParams.get('tab') as 'INFO' | 'COURSES' | 'SAVED' | 'MISTAKES' | 'HISTORY' | 'SETTINGS') || (window.location.hash.includes('/settings') ? 'SETTINGS' : 'INFO');
  
  const setActiveTab = (tab: string) => {
      setSearchParams({ tab });
  };

  // Exam Attempts State
  const [attempts, setAttempts] = useState<any[]>([]);
  const [deletingAttemptId, setDeletingAttemptId] = useState<string | null>(null);

  // Load attempts from Firestore
  useEffect(() => {
    if (viewingUserId) {
      const fetchAttempts = async () => {
          const attemptsRef = collection(db, 'attempts');
          const q = query(attemptsRef, where('userId', '==', viewingUserId));
          try {
              const snap = await getDocs(q);
              const fetchedAttempts: any[] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              
              // Sort descending by timestamp and deduplicate extremely close timestamp duplicates (e.g. within 1 minute)
              const sortedAttempts = fetchedAttempts.sort((a: any, b: any) => {
                  const aTime = a.timestamp?.seconds ? a.timestamp.seconds * 1000 : (a.timestamp || 0);
                  const bTime = b.timestamp?.seconds ? b.timestamp.seconds * 1000 : (b.timestamp || 0);
                  return bTime - aTime;
              });
              const deduplicated: any[] = [];
              for (const item of sortedAttempts) {
                  const itemTime = item.timestamp?.seconds ? item.timestamp.seconds * 1000 : (item.timestamp || 0);
                  const isDup = deduplicated.some(existing => {
                      const existingTime = existing.timestamp?.seconds ? existing.timestamp.seconds * 1000 : (existing.timestamp || 0);
                      return existing.examId === item.examId && Math.abs(existingTime - itemTime) < 60000;
                  });
                  if (!isDup) {
                      deduplicated.push(item);
                  }
              }
              setAttempts(deduplicated);
          } catch (err) {
              console.error('Failed to load attempts from Firebase', err);
          }
      };
      fetchAttempts();
    }
  }, [viewingUserId]);
  
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
  const [syllabusStats, setSyllabusStats] = useState<any>({});

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  
  const handleDeleteAttempt = async (examId: string) => {
    if (!window.confirm(currentUser ? "আপনি কি নিশ্চিত যে এই পরীক্ষাটি আপনার ইতিহাস থেকে মুছে ফেলতে চান?" : "Are you sure you want to delete this attempt from history?")) {
      return;
    }
    
    setDeletingAttemptId(examId);
    try {
      if (currentUser) {
        await deleteExamResultAPI(currentUser.uid, examId);
        try {
          const q = query(
            collection(db, 'attempts'), 
            where('userId', '==', currentUser.uid),
            where('examId', '==', examId)
          );
          const snap = await getDocs(q);
          const promises: Promise<void>[] = [];
          snap.forEach((d) => {
            promises.push(deleteDoc(doc(db, 'attempts', d.id)));
          });
          await Promise.all(promises);
        } catch (fErr) {
          console.error("Failed to delete from Firestore:", fErr);
        }
      }
      
      const updatedAttempts = attempts.filter((a: any) => a.examId !== examId);
      setAttempts(updatedAttempts.sort((a: any, b: any) => {
          const aTime = a.timestamp?.seconds ? a.timestamp.seconds * 1000 : (a.timestamp || 0);
          const bTime = b.timestamp?.seconds ? b.timestamp.seconds * 1000 : (b.timestamp || 0);
          return bTime - aTime;
      }));
      
      setProfileData((prev: any) => {
        if (!prev || !prev.stats) return prev;
        const calcExams = Math.max(0, prev.stats.totalExams - 1);
        return {
          ...prev,
          stats: {
            ...prev.stats,
            totalExams: calcExams
          }
        };
      });

      showToast("পরীক্ষাটি সফলভাবে মুছে ফেলা হয়েছে", "success");
    } catch (err) {
      console.error("Failed to delete exam result", err);
      showToast("মুছে ফেলতে ব্যর্থ হয়েছে", "error");
    } finally {
      setDeletingAttemptId(null);
    }
  };

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

  // Recharts Visual Analytics data hooks
  const pieData = useMemo(() => {
      if (!profileData?.stats) return [];
      const correct = profileData.stats.totalCorrect || 0;
      const wrong = profileData.stats.totalWrong || 0;
      
      let skipped = 0;
      if (profileData.stats.subjectBreakdown) {
          profileData.stats.subjectBreakdown.forEach((sub: any) => {
              skipped += (sub.skipped || 0);
          });
      }
      
      return [
          { name: 'সঠিক উত্তর', value: correct, color: '#ff5200' }, 
          { name: 'ভুল উত্তর', value: wrong, color: '#fdba74' }, 
          { name: 'উত্তরিহীন', value: skipped, color: '#d1d5db' }
      ].filter(item => item.value > 0);
  }, [profileData?.stats]);

  const subjectChartData = useMemo(() => {
      if (!profileData?.stats?.subjectBreakdown) return [];
      return profileData.stats.subjectBreakdown.map((sub: any) => {
          const correct = sub.correct || 0;
          const total = sub.total || 0;
          const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
          return {
              name: VALID_SUBJECTS[sub.subject] || sub.subject,
              'অ্যাকুরেসি (%)': accuracy,
              'মোট প্রশ্ন': total,
              'সঠিক': correct
          };
      });
  }, [profileData?.stats]);

  const motherSubjects = useMemo(() => {
      if (!profileData?.stats?.subjectBreakdown) return [];
      
      const getMotherSubject = (subjectName: string) => {
          return subjectName.replace(/\s*(১ম|২য়)\s*পত্র/g, '').trim();
      }

      const map = new Map();
      profileData.stats.subjectBreakdown.forEach((sub: any) => {
          const motherSubjectName = getMotherSubject(VALID_SUBJECTS[sub.subject] || sub.subject);
          if (!map.has(motherSubjectName)) {
              map.set(motherSubjectName, {
                 name: motherSubjectName,
                 total: 0,
                 correct: 0,
                 wrong: 0,
                 skipped: 0,
                 available: 0,
                 papers: []
              });
          }
          const mother = map.get(motherSubjectName);
          mother.total += sub.total || 0;
          mother.correct += sub.correct || 0;
          const skipped = sub.skipped !== undefined ? sub.skipped : 0;
          mother.skipped += skipped;
          const wrong = sub.wrong !== undefined ? sub.wrong : Math.max(0, (sub.total || 0) - (sub.correct || 0) - skipped);
          mother.wrong += wrong;
          mother.papers.push(sub);
      });
      
      Array.from(map.values()).forEach((mother: any) => {
         let available = 0;
         Object.keys(syllabusStats || {}).forEach(sKey => {
             const motherName = getMotherSubject(VALID_SUBJECTS[sKey] || sKey);
             if (motherName === mother.name) {
                 available += syllabusStats[sKey]?.total || 0;
             }
         });
         mother.available = available > 0 ? available : Math.max(mother.total, 1);
      });
      
      return Array.from(map.values());
  }, [profileData?.stats, syllabusStats]);

  // Keep the analysis useful at a glance: these values power the learning nudge
  // and give learners a clear next action instead of presenting numbers alone.
  const performanceSummary = useMemo(() => {
      const stats = profileData?.stats;
      const correct = stats?.totalCorrect || 0;
      const wrong = stats?.totalWrong || 0;
      const answered = correct + wrong;
      const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
      const weakestSubject = [...motherSubjects]
          .filter((subject: any) => subject.total > 0)
          .sort((a: any, b: any) => (a.correct / a.total) - (b.correct / b.total))[0];

      return { accuracy, answered, weakestSubject };
  }, [profileData?.stats, motherSubjects]);

  const scrollToSubjectAnalysis = () => {
      document.getElementById('subject-analysis')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
  const [selectedDeepAnalysisSubject, setSelectedDeepAnalysisSubject] = useState<string | null>(null);
  const [examViewMode, _setExamViewMode] = useState<'SINGLE' | 'LIST'>('SINGLE');

  // History Pagination
  const [currentHistoryPage, setCurrentHistoryPage] = useState(1);
  const [isQuestionDisplayExpanded, setIsQuestionDisplayExpanded] = useState(false);
  const itemsPerHistoryPage = 10;

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
            fetchSyllabusStatsAPI().then(stats => {
                if (stats) setSyllabusStats(stats);
            }).catch(console.error);

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
                    let currentAttempts = attempts;
                    if (currentAttempts.length === 0) {
                        try {
                            const attemptsRef = collection(db, 'attempts');
                            const q = query(attemptsRef, where('userId', '==', viewingUserId));
                            const snap = await getDocs(q);
                            const fetchedAttempts: any[] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                            const sortedAttempts = fetchedAttempts.sort((a: any, b: any) => {
                                const aTime = a.timestamp?.seconds ? a.timestamp.seconds * 1000 : (a.timestamp || 0);
                                const bTime = b.timestamp?.seconds ? b.timestamp.seconds * 1000 : (b.timestamp || 0);
                                return bTime - aTime;
                            });
                            const deduplicated: any[] = [];
                            for (const item of sortedAttempts) {
                                const itemTime = item.timestamp?.seconds ? item.timestamp.seconds * 1000 : (item.timestamp || 0);
                                const isDup = deduplicated.some(existing => {
                                    const existingTime = existing.timestamp?.seconds ? existing.timestamp.seconds * 1000 : (existing.timestamp || 0);
                                    return existing.examId === item.examId && Math.abs(existingTime - itemTime) < 60000;
                                });
                                if (!isDup) deduplicated.push(item);
                            }
                            currentAttempts = deduplicated;
                        } catch(e) {}
                    }
                    const aggregatedStats = aggregateStatsFromAttempts(currentAttempts, data);

                    setProfileData((prev: any) => ({ 
                        ...prev, 
                        displayName: currentUser?.displayName || '',
                        photoURL: userAvatar,
                        email: currentUser?.email || '',
                        college: extendedProfile?.college || '',
                        hscBatch: extendedProfile?.hscBatch || '',
                        department: extendedProfile?.department || 'Science',
                        target: extendedProfile?.target || 'Medical',
                        stats: aggregatedStats 
                    }));
                }
            } else {
                const data = await fetchUserStatsAPI(viewingUserId);
                if (data) {
                    let currentAttempts = attempts;
                    if (currentAttempts.length === 0) {
                        try {
                            const attemptsRef = collection(db, 'attempts');
                            const q = query(attemptsRef, where('userId', '==', viewingUserId));
                            const snap = await getDocs(q);
                            const fetchedAttempts: any[] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                            const sortedAttempts = fetchedAttempts.sort((a: any, b: any) => {
                                const aTime = a.timestamp?.seconds ? a.timestamp.seconds * 1000 : (a.timestamp || 0);
                                const bTime = b.timestamp?.seconds ? b.timestamp.seconds * 1000 : (b.timestamp || 0);
                                return bTime - aTime;
                            });
                            const deduplicated: any[] = [];
                            for (const item of sortedAttempts) {
                                const itemTime = item.timestamp?.seconds ? item.timestamp.seconds * 1000 : (item.timestamp || 0);
                                const isDup = deduplicated.some(existing => {
                                    const existingTime = existing.timestamp?.seconds ? existing.timestamp.seconds * 1000 : (existing.timestamp || 0);
                                    return existing.examId === item.examId && Math.abs(existingTime - itemTime) < 60000;
                                });
                                if (!isDup) deduplicated.push(item);
                            }
                            currentAttempts = deduplicated;
                        } catch(e) {}
                    }
                    const aggregatedStats = aggregateStatsFromAttempts(currentAttempts, data);

                    setProfileData({
                        displayName: data.user?.displayName || 'Unknown User',
                        photoURL: data.user?.photoURL || AVATARS[0],
                        email: '',
                        college: data.user?.college || '',
                        hscBatch: data.user?.hscBatch || '',
                        department: data.user?.department || '',
                        target: data.user?.target || '',
                        stats: aggregatedStats
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
        <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl rounded-[2.5rem] p-8 border border-gray-200 dark:border-zinc-800 h-72 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gray-200/50 dark:bg-gray-700/50"></div>
            <div className="relative flex flex-col md:flex-row items-center gap-8 mt-12">
                <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-600 border-4 border-white dark:border-zinc-800 shadow-xl"></div>
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
                <div key={i} className="h-24 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl rounded-[2rem] border border-gray-200 dark:border-zinc-800"></div>
            ))}
        </div>
    </div>
  );

  if (loading && !profileData.stats) {
      return <div className="h-full p-4 md:p-8"><ProfileSkeleton /></div>;
  }

  // Helper component for Filters
  const FilterSection = () => (
      <div className="flex flex-wrap items-center gap-3 bg-gray-50/50 dark:bg-black/50 p-2 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-inner animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-center text-gray-400 px-2"><Filter size={16}/></div>
          <select 
              value={currentFilterSubject} 
              onChange={(e) => { setCurrentFilterSubject(e.target.value); setCurrentFilterChapter('ALL'); }}
              className="flex-1 min-w-[100px] px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border-none text-[12px] md:text-xs font-bold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary shadow-sm truncate"
          >
              <option value="ALL">সকল বিষয়</option>
              {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select 
              value={currentFilterChapter} 
              onChange={(e) => setCurrentFilterChapter(e.target.value)}
              className="flex-1 min-w-[100px] px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border-none text-[12px] md:text-xs font-bold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary shadow-sm truncate"
          >
              <option value="ALL">সকল অধ্যায়</option>
              {uniqueChapters.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button 
            onClick={resetCurrentFilters}
            className="text-[12px] text-red-500 hover:text-red-600 font-bold px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors whitespace-nowrap"
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
                  className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-90"
              >
                  <ChevronLeft size={20} />
              </button>
              <span className="text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-900 px-6 py-3 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-lg">
                  Page <span className="text-primary">{currentPage}</span> of {totalPages}
              </span>
              <button 
                  onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-90"
              >
                  <ChevronRight size={20} />
              </button>
          </div>
      );
  };

  return (
    <div 
        ref={scrollContainerRef}
        className="h-full overflow-y-auto bg-gray-50 dark:bg-black p-4 md:p-8 transition-colors no-scrollbar"
    >
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-10 pb-24">
        
        {/* Header Section - Native App Style */}
        <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-10 border border-gray-200 dark:border-white/5 shadow-sm relative overflow-hidden group">
          {/* Enhanced Background Pattern */}
          <div className="absolute inset-0 opacity-60 dark:opacity-30 pointer-events-none overflow-hidden rounded-[2.5rem]">
            <div className="absolute -top-32 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[80px]"></div>
            <div className="absolute top-10 -right-20 w-[30rem] h-[30rem] bg-orange-400/20 rounded-full blur-[100px]"></div>
            <div className="absolute -bottom-40 left-20 w-[25rem] h-[25rem] bg-orange-500/10 rounded-full blur-[100px]"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
          </div>
          
          {/* Top Corner Edit Button - Native Style */}
          <div className="absolute top-6 right-6 z-30">
             {isOwnProfile && !isEditing && (
               <motion.button 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsEditing(true)}
                  className="p-3.5 bg-white/90 dark:bg-black/90 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl text-primary hover:shadow-primary/20 transition-all flex items-center justify-center"
               >
                  <Edit2 size={18} strokeWidth={2.5} />
               </motion.button>
             )}
          </div>

          <div className="relative flex flex-col items-center gap-6 md:gap-8 mt-4 md:mt-8">
            {/* Avatar & User Info */}
            <div className="relative">
               <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="w-28 h-28 md:w-40 md:h-40 rounded-full border-[6px] border-white dark:border-zinc-900 shadow-2xl overflow-hidden bg-gray-100 dark:bg-zinc-800 flex items-center justify-center relative z-10"
               >
                  {renderProfileAvatar()}
               </motion.div>
               {isEditing && isOwnProfile && (
                 <motion.button 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                    className="absolute bottom-0 right-0 p-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full hover:scale-110 transition-transform shadow-xl z-20 border-[3px] border-white dark:border-zinc-900"
                 >
                    <Camera size={18} />
                 </motion.button>
               )}
               {showAvatarSelector && (
                   <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-white dark:bg-zinc-900 p-5 rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 z-50 w-72 backdrop-blur-xl"
                   >
                       <p className="text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-4 text-center">প্রোফাইল ছবি</p>

                       <label className="flex items-center justify-center gap-3 w-full py-4 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl text-sm font-bold cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors border border-dashed border-gray-200 dark:border-white/10">
                           <Upload size={18} className="text-primary"/> ছবি আপলোড করুন
                           <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                       </label>
                   </motion.div>
               )}
            </div>

            <div className="flex-1 text-center space-y-4 w-full flex flex-col items-center">
               {isEditing && isOwnProfile ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl bg-gray-50/50 dark:bg-zinc-900/30 p-5 rounded-3xl border border-gray-100 dark:border-white/5 text-left">
                    <div className="space-y-1.5">
                      <label className="block text-[12px] md:text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{t('auth_name')}</label>
                      <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-zinc-800 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"/>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[12px] md:text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider">College</label>
                      <input type="text" value={editCollege} onChange={(e) => setEditCollege(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-zinc-800 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"/>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[12px] md:text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Batch</label>
                      <input type="text" value={editHscBatch} onChange={(e) => setEditHscBatch(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-zinc-800 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"/>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[12px] md:text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Department</label>
                      <select value={editDepartment} onChange={(e) => setEditDepartment(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-zinc-800 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"><option>Science</option><option>Arts</option><option>Commerce</option></select>
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="block text-[12px] md:text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Target</label>
                      <select value={editTarget} onChange={(e) => setEditTarget(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-zinc-800 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"><option>Medical</option><option>Engineering</option><option>University</option><option>Guccho</option></select>
                    </div>
                 </div>
               ) : (
                 <div className="space-y-4 w-full">
                    <div className="flex flex-col items-center justify-center">
                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">{profileData.displayName}</h1>
                    </div>

                    {/*
                                 ""
                             </p>
                         </div>
                     */}

                    <div className="flex flex-wrap justify-center gap-2 md:gap-3 text-[11px] md:text-sm text-gray-600 dark:text-gray-300">
                       {profileData.college && <div className="flex items-center justify-center gap-2 bg-gray-100/80 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl border border-gray-200/50 dark:border-white/5 font-bold shadow-sm"><GraduationCap size={16} className="text-primary"/> {profileData.college}</div>}
                       {profileData.hscBatch && <div className="flex items-center justify-center gap-2 bg-gray-100/80 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl border border-gray-200/50 dark:border-white/5 font-bold shadow-sm"><Calendar size={16} className="text-orange-500"/> Batch: {profileData.hscBatch}</div>}
                       {profileData.department && <div className="flex items-center justify-center gap-2 bg-gray-100/80 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl border border-gray-200/50 dark:border-white/5 font-bold shadow-sm"><Briefcase size={16} className="text-orange-500"/> {profileData.department}</div>}
                       {profileData.target && <div className="flex items-center justify-center gap-2 bg-orange-100/50 dark:bg-white/5 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-2xl font-black border border-orange-200 dark:border-white/5 shadow-sm"><Target size={16}/> {profileData.target} Aspirant</div>}
                    </div>
                 </div>
               )}
            </div>

            <div className="w-full flex justify-center mt-2">
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
        <div className="flex p-1.5 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-xl rounded-[1.5rem] border border-gray-200 dark:border-white/5 w-full md:w-fit mx-auto md:mx-0 overflow-x-auto no-scrollbar shadow-sm">
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
                   <button onClick={() => setActiveTab('HISTORY')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-2xl text-[11px] md:text-sm font-black flex items-center justify-center gap-2.5 transition-all whitespace-nowrap ${activeTab === 'HISTORY' ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' : 'text-gray-500 hover:text-orange-500'}`}>
                       <Calendar size={16}/> {t('profile_history')}
                   </button>
                   <button onClick={() => setActiveTab('SETTINGS')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-2xl text-[11px] md:text-sm font-black flex items-center justify-center gap-2.5 transition-all whitespace-nowrap ${activeTab === 'SETTINGS' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xl' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                       <Settings size={16}/> Settings
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
                {/* Learning pulse: turns the profile from a static report into a useful next step. */}
                <section className="relative overflow-hidden rounded-[2rem] border border-orange-200/70 dark:border-orange-400/15 bg-gradient-to-br from-orange-500 via-primary to-orange-600 p-5 md:p-7 text-white shadow-xl shadow-orange-500/20">
                    <div className="absolute -right-12 -top-14 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -bottom-20 left-1/3 h-36 w-36 rounded-full bg-yellow-200/20 blur-2xl" />
                    <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                            <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-orange-100">
                                <TrendingUp size={16} /> আজকের লার্নিং পালস
                            </div>
                            <h2 className="text-xl font-black tracking-tight md:text-2xl">
                                {performanceSummary.answered > 0 ? `${performanceSummary.accuracy}% নির্ভুলতায় এগিয়ে যাচ্ছেন` : 'প্রথম অনুশীলন শুরু করুন'}
                            </h2>
                            <p className="mt-1.5 text-sm font-medium leading-6 text-orange-50/90">
                                {performanceSummary.weakestSubject
                                    ? `${performanceSummary.weakestSubject.name} বিষয়ে আরেকটু চর্চা করলে ফল দ্রুত উন্নত হবে।`
                                    : 'প্রতিদিন অল্প করে অনুশীলন করুন—আপনার প্রগ্রেস এখানে দেখা যাবে।'}
                            </p>
                        </div>
                        <div className="grid grid-cols-3 divide-x divide-white/20 rounded-2xl border border-white/20 bg-black/10 px-2 py-3 text-center backdrop-blur-sm md:min-w-[300px]">
                            <div className="px-3"><p className="text-xl font-black">{performanceSummary.accuracy}%</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-orange-100">নির্ভুলতা</p></div>
                            <div className="px-3"><p className="text-xl font-black">{performanceSummary.answered}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-orange-100">উত্তর</p></div>
                            <div className="px-3"><p className="text-xl font-black">{profileData.stats.currentStreak || 0}</p><p className="mt-1 flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-orange-100"><Flame size={11}/> দিন স্ট্রিক</p></div>
                        </div>
                    </div>
                    <div className="relative mt-5 flex flex-col gap-2 sm:flex-row">
                        <button onClick={() => navigate('/qbank')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-orange-600 shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0"><Play size={16} fill="currentColor"/> অনুশীলন শুরু করুন <ArrowRight size={16}/></button>
                        {performanceSummary.weakestSubject && <button onClick={scrollToSubjectAnalysis} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-black text-white transition-colors hover:bg-white/20"><HelpCircle size={16}/> দুর্বল বিষয় দেখুন</button>}
                    </div>
                </section>

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
                            className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/40 dark:shadow-none flex flex-col items-center justify-center gap-4 relative overflow-hidden group"
                        >
                            <div className={`absolute -right-6 -bottom-6 w-28 h-28 ${stat.bg.replace('/10', '/5')} rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500`}></div>
                            <div className={`p-4.5 rounded-[1.5rem] ${stat.bg} ${stat.text} shadow-inner relative z-10`}>
                                <stat.icon size={28} strokeWidth={2.5} />
                            </div>
                            <div className="text-center relative z-10">
                                <p className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">{stat.value}</p>
                                <p className="text-[12px] md:text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.15em] mt-2">{stat.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Performance Visualization Dashboard */}
                {profileData.stats && profileData.stats.subjectBreakdown && profileData.stats.subjectBreakdown.length > 0 && (
                    <div className="flex animate-in fade-in duration-300">
                        {/* Pie Chart: Answer Breakdown */}
                        <div className="w-full lg:w-3/5 mx-auto bg-white dark:bg-zinc-950 p-6 md:p-8 rounded-[2.5rem] border border-gray-150 dark:border-zinc-850 shadow-sm min-h-[360px] flex flex-col">
                            <div className="mb-4">
                                <h4 className="text-sm font-extrabold text-gray-950 dark:text-zinc-100 flex items-center justify-center gap-2.5">
                                    <PieChart size={18} className="text-orange-500"/> সামগ্রিক প্রগ্রেস
                                </h4>
                            </div>

                            <div className="flex-1 w-full min-h-[220px] flex items-center justify-center relative">
                                <ResponsiveContainer width="100%" height={220}>
                                    <ReChartsPieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ background: '#1F2937', border: 'none', borderRadius: '16px', color: '#FFF', fontSize: '11px' }}
                                        />
                                    </ReChartsPieChart>
                                </ResponsiveContainer>
                                
                                <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-3xl font-black text-gray-900 dark:text-white leading-none">
                                        {pieData.reduce((acc, curr) => acc + curr.value, 0)}
                                    </span>
                                    <span className="text-[10px] font-extrabold text-gray-400 dark:text-zinc-550 mt-1 uppercase tracking-wider font-sans">মোট উত্তর</span>
                                </div>
                            </div>

                            {/* Legend Labels */}
                            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
                                {pieData.map((item, index) => (
                                    <div key={index} className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span>{item.name}: {item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Subject Performance Detailed - Loose Layout */}
                <div id="subject-analysis" className="mt-8 scroll-mt-6">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h3 className="font-extrabold text-gray-950 dark:text-zinc-100 flex items-center gap-2.5 text-base md:text-lg tracking-tight">
                            <BarChart3 size={20} className="text-orange-500"/> বিষয়ভিত্তিক বিশ্লেষণ
                        </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {motherSubjects.map((mother: any, idx: number) => {
                                const isExpanded = expandedSubjectStats.has(mother.name);
                                
                                const correct = mother.correct || 0;
                                const total = mother.total || 0;
                                const skipped = mother.skipped || 0;
                                const wrong = mother.wrong || 0;
                                const available = mother.available || Math.max(total, 1);
                                const completionPercent = Math.round(Math.min((total / available) * 100, 100));

                                return (
                                    <motion.div 
                                        key={idx} 
                                        layout
                                        className="border border-gray-150 dark:border-zinc-850 rounded-[1.8rem] overflow-hidden transition-all shadow-sm bg-white dark:bg-zinc-950 flex flex-col justify-between"
                                    >
                                        <div 
                                            className="p-4 cursor-pointer flex flex-col gap-3 group"
                                            onClick={() => toggleSubjectStats(mother.name)}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <h4 className="font-extrabold text-gray-900 dark:text-zinc-100 text-sm md:text-base tracking-tight leading-none truncate" title={mother.name}>
                                                        {mother.name}
                                                    </h4>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className={`text-sm md:text-base font-black ${
                                                        completionPercent >= 80 ? 'text-primary' : completionPercent >= 60 ? 'text-orange-400' : 'text-gray-400 dark:text-zinc-500'
                                                    }`}>
                                                        {completionPercent}%
                                                    </span>
                                                    <div className={`p-1 text-gray-400 dark:text-zinc-600 transition-all ${isExpanded ? 'rotate-180 text-orange-500 dark:text-orange-400' : ''}`}>
                                                        <ChevronDown size={14} />
                                                    </div>
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="flex flex-col gap-3 mt-1 overflow-hidden"
                                                    >
                                                        <div className="w-full mt-1">
                                                            <div className="h-1.5 w-full bg-gray-100 dark:bg-zinc-855 rounded-full overflow-hidden">
                                                                <div className="h-full flex transition-all duration-500 w-full">
                                                                    {correct > 0 && <div title={`সঠিক: ${correct}`} style={{ width: `${(correct / Math.max(total, available)) * 100}%` }} className="bg-primary h-full rounded-l-full" />}
                                                                    {wrong > 0 && <div title={`ভুল: ${wrong}`} style={{ width: `${(wrong / Math.max(total, available)) * 100}%` }} className="bg-orange-300 dark:bg-orange-800 h-full" />}
                                                                    {skipped > 0 && <div title={`বাদ দেওয়া: ${skipped}`} style={{ width: `${(skipped / Math.max(total, available)) * 100}%` }} className="bg-gray-300 dark:bg-zinc-600 h-full rounded-r-full" />}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between mt-1">
                                                            <div className="text-[11px] font-medium text-gray-500 dark:text-zinc-400 flex items-center flex-wrap gap-2.5">
                                                                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary" /><span>{correct} সঠিক</span></div>
                                                                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-300 dark:bg-orange-800" /><span>{wrong} ভুল</span></div>
                                                                {skipped > 0 && <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-zinc-600" /><span>{skipped} স্কিপ</span></div>}
                                                                {(available - total) > 0 && <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-zinc-700" /><span>{(available - total)} বাকি</span></div>}
                                                            </div>

                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedDeepAnalysisSubject(mother.name);
                                                                }}
                                                                className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-800 text-[11px] font-bold text-gray-700 dark:text-zinc-300 rounded-lg transition-all border border-gray-200 dark:border-zinc-800 flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
                                                            >
                                                                <img src="/analysis-icon.png" alt="analysis" className="w-5 h-5 object-contain mix-blend-multiply dark:invert dark:mix-blend-screen" />
                                                                Deep Analysis
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                )
                            })}
                            
                            {(!motherSubjects || motherSubjects.length === 0) && (
                                 <div className="text-center py-16 bg-gray-50/50 dark:bg-zinc-900/30 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-white/5 col-span-1 md:col-span-2">
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
                    <div className="text-center py-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2.5rem] border border-gray-200 dark:border-zinc-800 shadow-xl">
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
                                className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-6 rounded-[2rem] border border-gray-200 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-all group"
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
                <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl p-4 rounded-[2rem] border border-gray-200 dark:border-zinc-800 shadow-sm">
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
                    <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl p-4 rounded-[2rem] border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <FilterSection />
                    </div>
                )}

                {loadingSaved ? (
                    <div className="space-y-4 animate-pulse">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-40 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl rounded-[2rem] border border-gray-200 dark:border-zinc-800"></div>
                        ))}
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2.5rem] border border-gray-200 dark:border-zinc-800 shadow-xl">
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
                                    className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-6 rounded-[2rem] border border-gray-200 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <span className="px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-[12px] font-bold rounded-xl border border-orange-100 dark:border-orange-800/50">{q.subject}</span>
                                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[12px] font-bold rounded-xl flex items-center gap-2 border border-gray-200 dark:border-gray-600">
                                                <Folder size={12} className="text-primary"/> {item.folder || 'General'}
                                            </span>
                                            
                                            {/* Move To Dropdown Trigger */}
                                            <div className="relative">
                                                <button 
                                                    onClick={() => setMovingQuestionId(movingQuestionId === item._id ? null : item._id)}
                                                    className="text-[12px] flex items-center gap-2 text-gray-400 hover:text-primary transition-colors font-bold px-2 py-1 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
                                                >
                                                    <MoveRight size={12}/> Move
                                                </button>
                                                
                                                <AnimatePresence>
                                                    {movingQuestionId === item._id && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            className="absolute top-full left-0 mt-2 bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-20 w-40 py-2 overflow-hidden"
                                                        >
                                                            <div className="px-3 py-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-zinc-800 mb-1">Move to folder</div>
                                                            {availableFolders.filter(f => f !== (item.folder || 'General')).map(f => (
                                                                <button 
                                                                    key={f}
                                                                    onClick={() => handleMoveToFolder(item._id, f)}
                                                                    className="block w-full text-left px-4 py-2 text-xs hover:bg-primary/10 hover:text-primary text-gray-700 dark:text-gray-300 transition-colors"
                                                                >
                                                                    {f}
                                                                </button>
                                                            ))}
                                                            <button onClick={() => setMovingQuestionId(null)} className="block w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border-t border-gray-100 dark:border-zinc-800 mt-1 font-bold">Cancel</button>
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
                                                    : 'bg-gray-50 dark:bg-black/50 border-gray-100 dark:border-zinc-800 text-gray-600 dark:text-gray-400'
                                                }`}
                                            >
                                                <span className="inline-block w-6 h-6 rounded-lg bg-white/50 dark:bg-zinc-900/50 text-center leading-6 mr-2 font-bold shadow-inner">
                                                    {String.fromCharCode(65 + i)}
                                                </span>
                                                {opt}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="bg-gray-50 dark:bg-black/50 p-4 rounded-[1.5rem] border border-gray-100 dark:border-zinc-800 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/40"></div>
                                        <span className="font-bold text-primary text-[12px] uppercase tracking-widest block mb-2">Explanation</span>
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
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl p-4 rounded-[2rem] border border-gray-200 dark:border-zinc-800 shadow-sm">
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
                   <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl p-4 rounded-[2rem] border border-gray-200 dark:border-zinc-800 shadow-sm">
                       <FilterSection />
                   </div>
               )}
               
               {loadingMistakes ? (
                   <div className="space-y-4 animate-pulse">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-40 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl rounded-[2rem] border border-gray-200 dark:border-zinc-800"></div>
                        ))}
                   </div>
               ) : filteredItems.length === 0 ? (
                   <div className="text-center py-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2.5rem] border border-gray-200 dark:border-zinc-800 shadow-xl">
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
                            className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-6 rounded-[2rem] border border-red-100 dark:border-red-900/30 shadow-lg hover:shadow-xl transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-[12px] font-bold rounded-xl text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600">{q.subject}</span>
                                    {q.chapter && <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-[12px] font-bold rounded-xl text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600">{q.chapter}</span>}
                                    {m.wrongCount > 1 && (
                                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[12px] font-bold rounded-xl flex items-center gap-2 border border-red-200 dark:border-red-800/50 shadow-sm">
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
                                            : 'bg-gray-50 dark:bg-black/50 border-gray-100 dark:border-zinc-800 text-gray-500 dark:text-gray-400'
                                        }`}
                                    >
                                        <span className="inline-block w-6 h-6 rounded-lg bg-white/50 dark:bg-zinc-900/50 text-center leading-6 mr-2 font-bold shadow-inner">
                                            {String.fromCharCode(65 + i)}
                                        </span>
                                        {opt}
                                    </div>
                                ))}
                            </div>
                            
                            <div className="bg-red-50/50 dark:bg-red-900/10 p-4 rounded-[1.5rem] border border-red-100/50 dark:border-red-900/30 relative overflow-hidden z-10">
                                <div className="absolute top-0 left-0 w-1 h-full bg-red-500/40"></div>
                                <span className="font-bold text-red-500 text-[12px] uppercase tracking-widest block mb-2">Explanation</span>
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

        {/* HISTORY TAB */}
        {activeTab === 'HISTORY' && isOwnProfile && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                {/* Header Information Card */}
                <div className="flex justify-between items-center bg-white/40 dark:bg-zinc-900/30 backdrop-blur-xl p-5 rounded-[2rem] border border-gray-150 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-orange-50 dark:bg-orange-500/10 rounded-2xl text-orange-500">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                                {t('profile_history')}
                            </h2>
                            <p className="text-xs text-gray-400 dark:text-zinc-500 font-semibold mt-0.5">
                                {attempts.length > 0 ? `মোট ${attempts.length}টি পরীক্ষা সম্পন্ন হয়েছে` : "কোনো পরীক্ষার রেকর্ড পাওয়া যায়নি"}
                            </p>
                        </div>
                    </div>
                </div>

                {attempts.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-gray-150 dark:border-zinc-800 shadow-sm">
                        <div className="w-16 h-16 bg-orange-50 dark:bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                            <FileQuestion size={32} className="text-orange-500"/>
                        </div>
                        <p className="text-gray-900 dark:text-white font-bold text-base mb-1">কোনো পরীক্ষার রেকর্ড নেই</p>
                        <p className="text-gray-400 text-xs max-w-xs mx-auto leading-relaxed">আপনি এখনও কোনো পরীক্ষায় অংশ নেননি। পরীক্ষা দেওয়ার পর আপনার সকল ফলাফলের বিস্তারিত বিবরণ এখানে দেখতে পাবেন।</p>
                        <div className="mt-6">
                            <button
                                onClick={() => navigate('/exams')}
                                className="px-6 py-3 bg-gradient-to-r from-primary to-orange-500 text-white font-bold rounded-xl shadow-md hover:scale-102 active:scale-98 transition-all text-xs"
                            >
                                পরীক্ষা দেওয়া শুরু করুন
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {attempts
                            .slice((currentHistoryPage - 1) * itemsPerHistoryPage, currentHistoryPage * itemsPerHistoryPage)
                            .map((attempt, idx) => {
                            if (!attempt) return null;
                            const totalQ = attempt.totalQuestions || 20;
                            const correct = attempt.correct || 0;
                            const percent = totalQ > 0 ? Math.min(100, Math.round((correct / totalQ) * 100)) : 0;
                            const percentClamped = Math.max(8, Math.min(92, percent));

                            // Safe strings to prevent crashes (.includes or .replace on non-strings)
                            const safeExamId = String(attempt.examId || '');
                            const safeTitle = String(attempt.config?.title || '');

                            // Determine subject name
                            const subjectName = attempt.subject || attempt.config?.subject || 'সাধারণ';
                            const paperName = attempt.config?.paper || (safeTitle.includes('1st') || safeExamId.includes('1st') ? '১ম পত্র' : safeTitle.includes('2nd') || safeExamId.includes('2nd') ? '২য় পত্র' : null);
                            const chapterName = attempt.config?.chapter || null;
                            const examTitle = attempt.config?.title || (safeExamId.replace(/_/g, ' ') || 'নামহীন পরীক্ষা');

                            // Serial numbering
                            const serialNumber = idx + 1 + (currentHistoryPage - 1) * itemsPerHistoryPage;
                            const bnSerial = serialNumber.toString().replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d)]);

                            // Safe date parsing
                            let examDate = '-';
                            try {
                                if (attempt.timestamp) {
                                    const d = attempt.timestamp?.toDate ? attempt.timestamp.toDate() : new Date(
                                        typeof attempt.timestamp === 'object' && attempt.timestamp.seconds 
                                            ? attempt.timestamp.seconds * 1000 
                                            : attempt.timestamp
                                    );
                                    if (!isNaN(d.getTime())) {
                                        examDate = d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
                                    }
                                }
                            } catch (e) {
                                // Ignore date parsing errors
                            }

                            return (
                                <motion.div 
                                    key={attempt.examId || `history-${idx}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-gray-150/80 dark:border-zinc-800 shadow-sm relative overflow-hidden flex gap-4"
                                >
                                    {/* Serial Number Bubble */}
                                    <div className="shrink-0 pt-1">
                                        <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-sm font-bold text-gray-500 dark:text-zinc-400">
                                            {bnSerial}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        {/* Minimal Header (Subject, Paper, Chapter & Date) */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="space-y-1">
                                                <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                                    {subjectName}
                                                </h3>
                                                {paperName && (
                                                    <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400">
                                                        {paperName}
                                                    </p>
                                                )}
                                                {chapterName ? (
                                                    <p className="text-xs font-medium text-gray-400 dark:text-zinc-500">
                                                        {chapterName}
                                                    </p>
                                                ) : (
                                                    examTitle !== subjectName && (
                                                        <p className="text-xs font-medium text-gray-400 dark:text-zinc-500">
                                                            {examTitle}
                                                        </p>
                                                    )
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-400 dark:text-zinc-500 font-bold whitespace-nowrap pl-2 text-right">
                                                {examDate}
                                            </span>
                                        </div>

                                        {/* Minimalist Progress Meter with score overlay */}
                                        <div className="relative pt-4 pb-5 my-2">
                                            <div className="h-1.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full relative">
                                                <div 
                                                    className="h-1.5 bg-primary rounded-full transition-all duration-300" 
                                                    style={{ width: `${percent}%` }}
                                                />
                                                {/* Floating Pill Over Progress Bar */}
                                                <div 
                                                    className="absolute top-1/2 flex items-center justify-center bg-white dark:bg-zinc-950 border-2 border-primary text-[10px] font-bold tracking-tight text-primary px-2 py-0.5 rounded-full shadow-sm select-none"
                                                    style={{ left: `${percentClamped}%`, transform: 'translate(-50%, -50%)' }}
                                                >
                                                    {correct}/{totalQ}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action row at bottom */}
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 dark:border-zinc-800/30">
                                            <div className="flex items-center gap-1.5">
                                                <span className="inline-block px-2.5 py-1 bg-gray-100 dark:bg-zinc-800 text-[10px] font-bold text-gray-400 dark:text-zinc-500 rounded-lg">
                                                    {attempt.config?.examType || 'HSC'}
                                                </span>
                                                {attempt.config?.duration && (
                                                    <span className="inline-block px-2.5 py-1 bg-gray-100 dark:bg-zinc-800 text-[10px] font-bold text-gray-400 dark:text-zinc-500 rounded-lg">
                                                        {attempt.config.duration} মি.
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => navigate(`/exam/${attempt.examId}`)}
                                                    className="px-4 py-1.5 bg-gray-900 hover:bg-gray-850 dark:bg-white dark:hover:bg-gray-50 text-white dark:text-gray-900 rounded-xl text-xs font-bold transition-colors shadow-sm active:scale-95 whitespace-nowrap"
                                                >
                                                    ফলাফল দেখুন
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteAttempt(attempt.examId)} 
                                                    disabled={deletingAttemptId === attempt.examId}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-900/20 rounded-lg transition-all active:scale-90"
                                                    title="ভুক্তি মুছুন"
                                                >
                                                    {deletingAttemptId === attempt.examId ? (
                                                        <Loader2 size={14} className="animate-spin text-red-500" />
                                                    ) : (
                                                        <Trash2 size={14} />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* Pagination Controls */}
                        {Math.ceil(attempts.length / itemsPerHistoryPage) > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8 mb-4">
                                <button
                                    onClick={() => setCurrentHistoryPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentHistoryPage === 1}
                                    className="p-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-sm font-bold text-gray-600 dark:text-zinc-400 px-3">
                                    {currentHistoryPage.toString().replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d)])} 
                                    / 
                                    {Math.ceil(attempts.length / itemsPerHistoryPage).toString().replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d)])}
                                </span>
                                <button
                                    onClick={() => setCurrentHistoryPage(prev => Math.min(Math.ceil(attempts.length / itemsPerHistoryPage), prev + 1))}
                                    disabled={currentHistoryPage === Math.ceil(attempts.length / itemsPerHistoryPage)}
                                    className="p-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'SETTINGS' && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 max-w-2xl mx-auto"
            >
                <div className="relative">
                     <div className="space-y-8">
                         <div className="flex items-center gap-3 border-b border-gray-100 dark:border-zinc-800 pb-6">
                            <div className="p-3 bg-gray-100 dark:bg-zinc-800 rounded-2xl text-gray-500 dark:text-zinc-400">
                                <Settings size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">Settings</h2>
                                <p className="text-xs text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-widest mt-1">App Preferences</p>
                            </div>
                         </div>
                         
                         {/* Settings Options */}
                         <div className="space-y-4">
                             
                             {/* Theme Mode */}
                             {toggleTheme && (
                                 <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-4 md:p-5 border border-blue-100 dark:border-blue-800/30 flex flex-col md:flex-row md:items-center justify-between gap-4 group transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center text-blue-500 dark:text-blue-400 shrink-0">
                                            {themeMode === 'light' ? <Sun size={20}/> : themeMode === 'dark' ? <Moon size={20}/> : <Laptop size={20}/>}
                                        </div>
                                        <div>
                                            <p className="text-sm md:text-base font-bold text-gray-900 dark:text-white">Appearance</p>
                                            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">Choose your visual theme</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={toggleTheme}
                                        className="w-full md:w-auto px-5 py-2.5 bg-white dark:bg-blue-950 hover:bg-blue-50 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 font-bold text-xs md:text-sm rounded-xl transition-all shadow-sm border border-blue-100 dark:border-blue-800/50"
                                    >
                                        {themeMode === 'light' ? 'Light Mode' : themeMode === 'dark' ? 'Dark Mode' : 'System'}
                                    </button>
                                 </div>
                             )}

                             {/* Language Selection */}
                             <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl p-4 md:p-5 border border-emerald-100 dark:border-emerald-800/30 flex flex-col md:flex-row md:items-center justify-between gap-4 group transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-lg shrink-0">
                                        অ
                                    </div>
                                    <div>
                                        <p className="text-sm md:text-base font-bold text-gray-900 dark:text-white">Language</p>
                                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">Select preferred language</p>
                                    </div>
                                </div>
                                <div className="flex bg-white dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-800/50 rounded-xl p-1 shadow-inner w-full md:w-auto">
                                    <button 
                                         onClick={() => setLanguage('bn')}
                                        className={`flex-1 md:flex-none px-6 py-2 text-xs md:text-sm font-bold rounded-lg transition-all ${language === 'bn' ? 'bg-emerald-100 dark:bg-emerald-800/60 text-emerald-700 dark:text-emerald-300 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-zinc-300'}`}
                                    >
                                        বাংলা
                                    </button>
                                    <button 
                                         onClick={() => setLanguage('en')}
                                        className={`flex-1 md:flex-none px-6 py-2 text-xs md:text-sm font-bold rounded-lg transition-all ${language === 'en' ? 'bg-emerald-100 dark:bg-emerald-800/60 text-emerald-700 dark:text-emerald-300 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-zinc-300'}`}
                                    >
                                        English
                                    </button>
                                </div>
                             </div>

                             {/* Question Card Font Settings */}
                             <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-800/30 overflow-hidden transition-colors">
                                <button 
                                    onClick={() => setIsQuestionDisplayExpanded(!isQuestionDisplayExpanded)}
                                    className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-purple-50 dark:hover:bg-purple-800/20 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-800/50 flex items-center justify-center text-purple-600 dark:text-purple-400 transition-colors shrink-0">
                                            <Type size={20} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm md:text-base font-bold text-gray-900 dark:text-white">কোশ্চেন ডিসপ্লে</p>
                                            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">Customize font style and size</p>
                                        </div>
                                    </div>
                                    <div className={`p-2 rounded-xl bg-purple-100/50 dark:bg-purple-800/30 text-purple-500 transition-transform duration-300 ${isQuestionDisplayExpanded ? 'rotate-180' : ''}`}>
                                        <ChevronDown size={18} />
                                    </div>
                                </button>
                                
                                {isQuestionDisplayExpanded && (
                                    <div className="px-4 md:px-5 pb-5 pt-2 border-t border-purple-100 dark:border-purple-800/30">
                                        <div className="space-y-6">
                                            {/* Preview */}
                                            <div className="bg-white dark:bg-zinc-950 p-5 md:p-6 rounded-2xl border border-purple-100 dark:border-purple-800/30 shadow-sm relative overflow-hidden pointer-events-none">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-start gap-3 w-full">
                                                        <span className="font-bold text-gray-400 font-mono text-lg shrink-0 pt-0.5 leading-6 select-none">01.</span>
                                                        <div className="flex-1 min-w-0 pt-0.5">
                                                            <h3 className={`font-semibold text-slate-900 dark:text-gray-50 leading-relaxed transition-all duration-300 ease-out ${questionFontSize === 'text-xl' ? 'text-[20px] md:text-[22px]' : questionFontSize === 'text-lg' ? 'text-[18px] md:text-[20px]' : 'text-[17px] md:text-[19px]'} ${questionFont}`}>
                                                                নিচের কোনটি সঠিক?
                                                            </h3>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 shrink-0 ml-2">
                                                        <button className="p-1.5 rounded-lg transition-colors text-gray-400">
                                                            <Bookmark size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-0 md:pl-10 mt-6">
                                                    <div className="p-3 md:p-4 rounded-xl border border-gray-200 dark:border-zinc-800 flex items-center gap-3 bg-gray-50 dark:bg-zinc-900/50">
                                                        <div className="w-8 h-8 rounded-full border border-gray-300 dark:border-zinc-600 flex items-center justify-center text-sm font-bold shrink-0 text-gray-500 bg-white dark:bg-zinc-800">ক</div>
                                                        <div className={`flex-1 text-gray-700 dark:text-gray-300 font-medium transition-all duration-300 ease-out ${questionFontSize === 'text-xl' ? 'text-[17px]' : questionFontSize === 'text-lg' ? 'text-[16px]' : 'text-[15px]'} ${questionFont}`}>প্রথম অপশনটি</div>
                                                    </div>
                                                    <div className="p-3 md:p-4 rounded-xl border border-gray-200 dark:border-zinc-800 flex items-center gap-3 bg-gray-50 dark:bg-zinc-900/50">
                                                        <div className="w-8 h-8 rounded-full border border-gray-300 dark:border-zinc-600 flex items-center justify-center text-sm font-bold shrink-0 text-gray-500 bg-white dark:bg-zinc-800">খ</div>
                                                        <div className={`flex-1 text-gray-700 dark:text-gray-300 font-medium transition-all duration-300 ease-out ${questionFontSize === 'text-xl' ? 'text-[17px]' : questionFontSize === 'text-lg' ? 'text-[16px]' : 'text-[15px]'} ${questionFont}`}>দ্বিতীয় অপশনটি</div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Font Style Selector */}
                                            <div className="space-y-3 pt-2">
                                                <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">Font Style</p>
                                                <div className="flex gap-3">
                                                    {(['font-noto', 'font-tiro'] as const).map((fontOption) => (
                                                        <button
                                                            key={fontOption}
                                                            onClick={() => setQuestionFont(fontOption)}
                                                            className={`flex-1 py-3 px-2 flex flex-col items-center justify-center gap-1 rounded-xl transition-all border-2 ${questionFont === fontOption ? 'bg-purple-100 dark:bg-purple-900/40 border-purple-400 text-purple-700 dark:text-purple-300 shadow-sm' : 'bg-white dark:bg-zinc-800 border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-zinc-300 shadow-sm hover:shadow border-gray-100 dark:border-zinc-700'}`}
                                                        >
                                                            <span className={`text-lg font-medium ${fontOption}`}>পরীক্ষাঙ্গন</span>
                                                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                                                                {fontOption === 'font-noto' ? 'Modern' : 'Classic'}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Size Selector */}
                                            <div className="space-y-4 pt-2">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">Text Size</p>
                                                    <span className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800/50">
                                                        {questionFontSize === 'text-sm' ? 'Small' : questionFontSize === 'text-base' ? 'Normal' : questionFontSize === 'text-lg' ? 'Large' : 'Extra Large'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 bg-white dark:bg-zinc-800/50 p-4 rounded-xl border border-purple-100 dark:border-purple-800/30 shadow-sm">
                                                    <span className="text-sm font-medium text-gray-400 select-none">A</span>
                                                    <input 
                                                        type="range" 
                                                        min="0" max="3" 
                                                        value={questionFontSize === 'text-sm' ? 0 : questionFontSize === 'text-base' ? 1 : questionFontSize === 'text-lg' ? 2 : 3}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value);
                                                            setQuestionFontSize(val === 0 ? 'text-sm' : val === 1 ? 'text-base' : val === 2 ? 'text-lg' : 'text-xl');
                                                        }}
                                                        className="w-full h-1.5 bg-purple-200 dark:bg-purple-900/50 rounded-lg appearance-none cursor-pointer"
                                                        style={{ accentColor: '#a855f7' }}
                                                    />
                                                    <span className="text-xl font-medium text-gray-400 select-none">A</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                             </div>

                             {/* Logout */}
                             <div className="pt-2">
                                 <button 
                                     onClick={async () => {
                                         await logout();
                                         navigate('/auth');
                                     }}
                                     className="w-full flex items-center justify-center gap-3 py-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 font-black text-sm rounded-2xl transition-colors"
                                 >
                                     <LogOut size={18} strokeWidth={2.5}/>
                                     {t('nav_logout')}
                                 </button>
                             </div>
                         </div>
                     </div>
                </div>
            </motion.div>
        )}
      </div>
      {/* Deep Analysis Modal */}
      <AnimatePresence>
          {selectedDeepAnalysisSubject && (
              <div className="fixed inset-0 z-[100] bg-black/20 dark:bg-black/60 backdrop-blur-sm overflow-hidden flex flex-col items-center">
                  <motion.div
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ type: "spring", damping: 25, stiffness: 200 }}
                      className="w-full h-full md:h-[90vh] md:max-w-4xl md:mt-auto bg-white dark:bg-zinc-950 md:rounded-t-[2.5rem] shadow-2xl flex flex-col border-t border-gray-200/50 dark:border-zinc-800/50 overflow-hidden"
                  >
                      {/* Header */}
                      <div className="shrink-0 bg-white dark:bg-zinc-950 border-b border-gray-100 dark:border-zinc-900 px-4 py-4 md:px-6 md:py-6 flex items-center gap-4">
                          <button 
                              onClick={() => setSelectedDeepAnalysisSubject(null)}
                              className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-zinc-900/50 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer border border-gray-200 dark:border-zinc-800 active:scale-95"
                          >
                              <ChevronLeft size={20} />
                          </button>
                          <div>
                              <h2 className="text-lg md:text-xl font-black text-gray-900 dark:text-white leading-none mb-1">
                                  {selectedDeepAnalysisSubject}
                              </h2>
                              <p className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-primary">Deep Analysis Report</p>
                          </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 overflow-y-auto w-full bg-gray-50/50 dark:bg-zinc-900/10">
                          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                              {(() => {
                                  const mother = motherSubjects.find((m: any) => m.name === selectedDeepAnalysisSubject);
                                  if (!mother) return null;
                                  return mother.papers.map((sub: any, idx: number) => {
                                      const total = sub.total || 0;
                                      const correct = sub.correct || 0;
                                      const skipped = sub.skipped !== undefined ? sub.skipped : 0;
                                      const wrong = sub.wrong !== undefined ? sub.wrong : Math.max(0, total - correct - skipped);
                                      const available = syllabusStats[sub.subject]?.total || Math.max(total, 1);
                                      const completionPercent = Math.round(Math.min((total / available) * 100, 100));
                                      
                                      return (
                                          <div key={idx} className="bg-white dark:bg-zinc-950 rounded-[2rem] border border-gray-150 dark:border-zinc-850 p-4 md:p-5 shadow-sm">
                                              <div className="flex items-center justify-between gap-2 mb-4">
                                                  <div className="flex items-center gap-2 min-w-0">
                                                      <h4 className="font-extrabold text-gray-900 dark:text-zinc-100 text-sm md:text-base tracking-tight leading-none truncate" title={VALID_SUBJECTS[sub.subject] || sub.subject}>
                                                          {VALID_SUBJECTS[sub.subject] || sub.subject}
                                                      </h4>
                                                  </div>
                                                  <div className="flex items-center gap-2 shrink-0">
                                                      <span className={`text-sm md:text-base font-black ${
                                                          completionPercent >= 80 ? 'text-primary' : completionPercent >= 60 ? 'text-orange-400' : 'text-gray-400 dark:text-zinc-500'
                                                      }`}>
                                                          {total}/{available}
                                                      </span>
                                                  </div>
                                              </div>
                                              <div className="w-full mb-3">
                                                  <div className="h-1.5 w-full bg-gray-100 dark:bg-zinc-855 rounded-full overflow-hidden">
                                                      <div className="h-full flex transition-all w-full">
                                                          {correct > 0 && <div title={`সঠিক: ${correct}`} style={{ width: `${(correct / available) * 100}%` }} className="bg-primary h-full rounded-l-full" />}
                                                          {wrong > 0 && <div title={`ভুল: ${wrong}`} style={{ width: `${(wrong / available) * 100}%` }} className="bg-orange-300 dark:bg-orange-800 h-full" />}
                                                          {skipped > 0 && <div title={`বাদ দেওয়া: ${skipped}`} style={{ width: `${(skipped / available) * 100}%` }} className="bg-gray-300 dark:bg-zinc-600 h-full rounded-r-full" />}
                                                      </div>
                                                  </div>
                                              </div>
                                              <div className="text-[11px] font-medium text-gray-500 dark:text-zinc-400 flex items-center flex-wrap gap-2.5 mb-5 pb-5 border-b border-gray-100 dark:border-zinc-850">
                                                  <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary" /><span>{correct} সঠিক</span></div>
                                                  <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-300 dark:bg-orange-800" /><span>{wrong} ভুল</span></div>
                                                  {skipped > 0 && <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-zinc-600" /><span>{skipped} স্কিপ</span></div>}
                                                  {(available - total) > 0 && <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-zinc-700" /><span>{(available - total)} বাকি</span></div>}
                                              </div>

                                              <div>
                                                  <h5 className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-1.5 leading-none">
                                                      অধ্যায়ভিত্তিক ডাটা
                                                  </h5>
                                                  
                                                  {sub.chapters && Object.keys(sub.chapters).length > 0 ? (
                                                      <div className="space-y-4">
                                                          {Object.entries(sub.chapters).map(([chapName, chapData]: [string, any], cIdx: number) => {
                                                              const cTotal = chapData.total || 0;
                                                              const cCorrect = chapData.correct || 0;
                                                              const cSkipped = chapData.skipped || 0;
                                                              const cWrong = chapData.wrong !== undefined ? chapData.wrong : Math.max(0, cTotal - cCorrect - cSkipped);
                                                              const matchingChapterKey = syllabusStats[sub.subject]?.chapters ? Object.keys(syllabusStats[sub.subject].chapters).find(k => {
                                                                  const normK = normalizeForComparison(k);
                                                                  const normC = normalizeForComparison(chapName);
                                                                  const stripChap = (s: string) => s.replace(/^(অধ্যায়|অধ্যায়|অধ্যা|অধ্যায়া)[০-৯0-9]*/, '');
                                                                  return stripChap(normK) === stripChap(normC) || normK.includes(normC) || normC.includes(normK);
                                                              }) || chapName : chapName;
                                                              
                                                              const cAvailable = syllabusStats[sub.subject]?.chapters?.[matchingChapterKey]?.total || Math.max(cTotal, 1);
                                                              const cCompletion = Math.round(cAvailable > 0 ? Math.min((cTotal / cAvailable) * 100, 100) : 0);
                                                              
                                                              let cColor = "text-gray-400 dark:text-zinc-500";
                                                              if (cCompletion >= 80) { cColor = "text-primary"; } 
                                                              else if (cCompletion >= 60) { cColor = "text-orange-400"; } 
                                                              else if (cCompletion >= 40) { cColor = "text-orange-300 dark:text-orange-600"; }

                                                              return (
                                                                  <div key={cIdx} className="space-y-2 bg-gray-50 dark:bg-zinc-900/30 p-3 rounded-xl border border-gray-100 dark:border-zinc-900">
                                                                      <div className="flex items-center justify-between gap-2">
                                                                          <span className="text-[12px] font-bold text-gray-700 dark:text-zinc-300 truncate" title={chapName}>
                                                                              {chapName}
                                                                          </span>
                                                                          <span className={`text-[11px] font-black ${cColor}`}>
                                                                              {cTotal}/{cAvailable}
                                                                          </span>
                                                                      </div>
                                                                      <div className="h-1.5 w-full bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                                          <div className="h-full flex transition-all w-full">
                                                                              {cCorrect > 0 && <div title={`সঠিক: ${cCorrect}`} style={{ width: `${(cCorrect / cAvailable) * 100}%` }} className="bg-primary h-full rounded-l-full" />}
                                                                              {cWrong > 0 && <div title={`ভুল: ${cWrong}`} style={{ width: `${(cWrong / cAvailable) * 100}%` }} className="bg-orange-300 dark:bg-orange-800 h-full" />}
                                                                              {cSkipped > 0 && <div title={`বাদ দেওয়া: ${cSkipped}`} style={{ width: `${(cSkipped / cAvailable) * 100}%` }} className="bg-gray-300 dark:bg-zinc-600 h-full rounded-r-full" />}
                                                                          </div>
                                                                      </div>
                                                                      <div className="text-[10px] font-medium text-gray-500 dark:text-zinc-500 flex items-center flex-wrap gap-2.5 mt-1">
                                                                          <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary" /><span>{cCorrect} সঠিক</span></div>
                                                                          <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-300 dark:bg-orange-800" /><span>{cWrong} ভুল</span></div>
                                                                          {cSkipped > 0 && <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-zinc-600" /><span>{cSkipped} স্কিপ</span></div>}
                                                                          {(cAvailable - cTotal) > 0 && <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-zinc-700" /><span>{(cAvailable - cTotal)} বাকি</span></div>}
                                                                      </div>
                                                                  </div>
                                                              )
                                                          })}
                                                      </div>
                                                  ) : (
                                                      <div className="text-center py-4 text-[10px] text-gray-400 dark:text-zinc-500 italic font-medium">কোনো ডাটা পাওয়া যায়নি</div>
                                                  )}
                                              </div>
                                          </div>
                                      );
                                  });
                              })()}
                          </div>
                      </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>

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
                    className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 border border-gray-200 dark:border-zinc-800 relative z-10 overflow-hidden"
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
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-5 rounded-[2rem] border border-orange-100 dark:border-orange-800/50 flex gap-4 relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                             <div className="p-3 bg-orange-100 dark:bg-orange-800 rounded-2xl h-fit text-primary dark:text-orange-400 shadow-sm">
                                <Sparkles size={20} />
                             </div>
                             <div className="relative z-10">
                                <h4 className="font-black text-orange-800 dark:text-orange-300 text-sm md:text-base mb-1">ভুল শুধরানোর সুযোগ!</h4>
                                <p className="text-xs text-orange-700/80 dark:text-orange-400/80 leading-relaxed font-medium">
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
