
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { generateQuizFromDB, fetchSyllabusStatsAPI, saveQuestionsToBankAPI } from '../services/api';
import { generateQuiz } from '../services/geminiService';
import { QuizQuestion, ExamStandard, QuizConfig, DifficultyLevel } from '../types';
import { SYLLABUS_DB, SyllabusItem, TopicNode } from '../services/syllabusData';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from './Toast';
import { 
  Loader2, 
  Play, Settings, Check,
  ArrowRight, Atom, Calculator, Globe, Book, Beaker, Dna, 
  ChevronDown, ChevronUp,
  LayoutList, AlignJustify, Flame, Database,
  Zap, BrainCircuit, Cpu, Languages, ListChecks, ChevronLeft, Archive
} from 'lucide-react';

// --- SUBJECT GROUPING FOR UI (Question Bank Style) ---
const SUBJECT_GROUPS = [
  {
    name: 'Biology',
    display: 'জীববিজ্ঞান',
    subDisplay: 'Biology',
    icon: Dna,
    color: 'text-orange-600 bg-orange-100',
    papers: ['Biology 1st Paper', 'Biology 2nd Paper']
  },
  {
    name: 'Chemistry',
    display: 'রসায়ন',
    subDisplay: 'Chemistry',
    icon: Beaker,
    color: 'text-amber-600 bg-amber-100',
    papers: ['Chemistry 1st Paper', 'Chemistry 2nd Paper']
  },
  {
    name: 'Physics',
    display: 'পদার্থবিজ্ঞান',
    subDisplay: 'Physics',
    icon: Atom,
    color: 'text-orange-700 bg-orange-100',
    papers: ['Physics 1st Paper', 'Physics 2nd Paper']
  },
  {
    name: 'Higher Math',
    display: 'উচ্চতর গণিত',
    subDisplay: 'Higher Math',
    icon: Calculator,
    color: 'text-amber-700 bg-amber-100',
    papers: ['Higher Math 1st Paper', 'Higher Math 2nd Paper']
  },
  {
    name: 'English',
    display: 'ইংরেজি',
    subDisplay: 'English',
    icon: Languages,
    color: 'text-orange-500 bg-orange-50',
    papers: ['English']
  },
  {
    name: 'Bangla',
    display: 'বাংলা',
    subDisplay: 'Bangla',
    icon: Book,
    color: 'text-red-600 bg-red-100',
    papers: ['Bangla 1st Paper', 'Bangla 2nd Paper']
  },
  {
    name: 'ICT',
    display: 'তথ্য ও যোগাযোগ প্রযুক্তি',
    subDisplay: 'ICT',
    icon: Cpu,
    color: 'text-orange-600 bg-orange-100',
    papers: ['ICT']
  },
  {
    name: 'General Knowledge',
    display: 'সাধারণ জ্ঞান',
    subDisplay: 'GK',
    icon: Globe,
    color: 'text-amber-600 bg-amber-100',
    papers: ['General Knowledge']
  },
  {
    name: 'Mental Ability',
    display: 'মানসিক দক্ষতা',
    subDisplay: 'Mental Ability',
    icon: BrainCircuit,
    color: 'text-red-500 bg-red-100',
    papers: ['Mental Ability']
  },
];

type QuizStep = 'SELECTION' | 'TOPIC_CONFIG' | 'LOADING';
type ExamViewMode = 'SINGLE_PAGE' | 'ALL_AT_ONCE';
type SelectionView = 'SUBJECT_GRID' | 'CHAPTER_DRILLDOWN';

const QuizArena: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // --- NAVIGATION STATE FROM URL ---
  const currentStep = (searchParams.get('step') as QuizStep) || 'SELECTION';
  const selectionView = (searchParams.get('view') as SelectionView) || 'SUBJECT_GRID';
  const activeSubjectGroup = searchParams.get('subject') || null;
  const activePaperTab = searchParams.get('paper') || '';
  
  // Custom Selection Logic (Local State, preserved as long as component mounts)
  const [expandedChapterIds, setExpandedChapterIds] = useState<Set<string>>(new Set());
  const [expandedTopicIds, setExpandedTopicIds] = useState<Set<string>>(new Set());
  const [topicSelection, setTopicSelection] = useState<Record<string, string[]>>({});
  
  // Config State (Custom)
  const [examStandard] = useState<ExamStandard>(ExamStandard.HSC);
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState<number>(0);
  const [negativeMarking, setNegativeMarking] = useState<number>(0);
  const [examViewMode, setExamViewMode] = useState<ExamViewMode>('SINGLE_PAGE');
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [isReviewExpanded, setIsReviewExpanded] = useState(false);

  // DB Stats State
  const [syllabusStats, setSyllabusStats] = useState<any>(null);

  // Mode Detection State
  const [isRapidFire, setIsRapidFire] = useState(false);

  // Handle auto-selection from navigation state or URL updates
  useEffect(() => {
    // Mode Logic (Rapid Fire)
    if (location.state?.mode === 'RAPID_FIRE') {
        setIsRapidFire(true);
    } else {
        setIsRapidFire(false);
    }

    // Mode Logic (Wrong Questions)
    if (location.state?.mode === 'WRONG_QUESTIONS' && currentStep !== 'LOADING') {
        startWrongQuestionsQuiz();
    }

    // Auto-Navigation Logic from location state (One-time push to URL)
    if (location.state?.subject && !activeSubjectGroup) {
        const targetSubject = location.state.subject;
        const validGroup = SUBJECT_GROUPS.find(g => g.name === targetSubject);
        if (validGroup) {
            // Update URL to trigger the view change
            setSearchParams({
                view: 'CHAPTER_DRILLDOWN',
                subject: targetSubject,
                paper: validGroup.papers[0]
            }, { replace: true });
        }
    }
  }, [location.state, activeSubjectGroup, setSearchParams, currentStep]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await fetchSyllabusStatsAPI();
        setSyllabusStats(stats);
      } catch (err) {
        console.error("Failed to load syllabus stats", err);
      }
    };
    loadStats();
  }, []);

  // Helper to normalize strings for comparison
  const normalizeText = (text: string) => {
      if (!text) return '';
      return text.normalize('NFC').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/[\s\t\n\r]/g, '').replace(/[.,;:"'’|।]/g, '').toLowerCase();
  };

  const getTopicsForChapter = (subject: string, chapter: string): SyllabusItem[] => {
      const staticTopics = SYLLABUS_DB[subject]?.[chapter] || [];
      return staticTopics;
  };

  // Helper to get flattened string list of all topics in a chapter
  const getFlattenedTopics = (subject: string, chapter: string): string[] => {
      const rawItems = getTopicsForChapter(subject, chapter);
      const allTopics: string[] = [];
      rawItems.forEach(item => {
          if (typeof item === 'string') allTopics.push(item);
          else {
              allTopics.push(item.title);
              item.subTopics.forEach(sub => allTopics.push(sub));
          }
      });
      return allTopics;
  };

  const toggleTopic = (subject: string, chapter: string, topic: string) => {
    const key = `${subject}-${chapter}`;
    setTopicSelection(prev => {
      const currentTopics = prev[key] || [];
      const newTopics = currentTopics.includes(topic)
        ? currentTopics.filter(t => t !== topic)
        : [...currentTopics, topic];
      const newState = { ...prev, [key]: newTopics };
      if (newTopics.length === 0) delete newState[key];
      return newState;
    });
  };

  const toggleAllTopicsInChapter = (subject: string, chapter: string) => {
    const key = `${subject}-${chapter}`;
    const allTopics = getFlattenedTopics(subject, chapter);

    setTopicSelection(prev => {
      const current = prev[key] || [];
      if (current.length === allTopics.length) {
         const newState = { ...prev };
         delete newState[key];
         return newState;
      } else {
         return { ...prev, [key]: [...allTopics] };
      }
    });
  };

  // Select/Unselect All for Paper
  const toggleAllInPaper = (paperName: string) => {
      const chapters = SYLLABUS_DB[paperName] ? Object.keys(SYLLABUS_DB[paperName]) : [];
      let isAllSelected = true;

      // Check if all are selected
      for (const chapter of chapters) {
          const key = `${paperName}-${chapter}`;
          const currentSelected = topicSelection[key] || [];
          const allTopics = getFlattenedTopics(paperName, chapter);
          if (currentSelected.length !== allTopics.length) {
              isAllSelected = false;
              break;
          }
      }

      setTopicSelection(prev => {
          const newState = { ...prev };
          if (isAllSelected) {
              // Unselect All
              chapters.forEach(c => delete newState[`${paperName}-${c}`]);
          } else {
              // Select All
              chapters.forEach(c => {
                  newState[`${paperName}-${c}`] = getFlattenedTopics(paperName, c);
              });
          }
          return newState;
      });
  };

  const isPaperFullySelected = (paperName: string) => {
      const chapters = SYLLABUS_DB[paperName] ? Object.keys(SYLLABUS_DB[paperName]) : [];
      if (chapters.length === 0) return false;
      
      for (const chapter of chapters) {
          const key = `${paperName}-${chapter}`;
          const currentSelected = topicSelection[key] || [];
          const allTopics = getFlattenedTopics(paperName, chapter);
          if (currentSelected.length === 0 || currentSelected.length !== allTopics.length) {
              return false;
          }
      }
      return true;
  };

  const handleStartRapidFire = (subject: string, chapter: string) => {
      const config: QuizConfig[] = [{
          subject,
          chapter,
          topics: [] // Empty means all topics in chapter
      }];
      
      initiateQuizGeneration(config, ExamStandard.MEDICAL, 15, undefined, false, {
          title: `Rapid Fire: ${chapter}`,
          mode: 'RAPID_FIRE',
          timeLimit: 0, // No specific limit per question, tracking overall
          negativeMarking: 0,
          isPracticeMode: true
      });
  };

  const toggleTopicGroup = (subject: string, chapter: string, group: TopicNode) => {
      const key = `${subject}-${chapter}`;
      const groupItems = [group.title, ...group.subTopics];
      
      setTopicSelection(prev => {
          const currentSelection = prev[key] || [];
          const isGroupFullySelected = groupItems.every(item => currentSelection.includes(item));
          
          let newSelection: string[];
          if (isGroupFullySelected) {
              newSelection = currentSelection.filter(item => !groupItems.includes(item));
          } else {
              newSelection = Array.from(new Set([...currentSelection, ...groupItems]));
          }
          const newState = { ...prev, [key]: newSelection };
          if (newSelection.length === 0) delete newState[key];
          return newState;
      });
  };

  const toggleChapterExpansion = (chapterKey: string) => {
      setExpandedChapterIds(prev => {
          const newSet = new Set(prev);
          if (newSet.has(chapterKey)) newSet.delete(chapterKey);
          else newSet.add(chapterKey);
          return newSet;
      });
  };

  const toggleTopicExpansion = (topicKey: string) => {
      setExpandedTopicIds(prev => {
          const newSet = new Set(prev);
          if (newSet.has(topicKey)) newSet.delete(topicKey);
          else newSet.add(topicKey);
          return newSet;
      });
  }

  // --- STATS HELPER ---
  const getStatsFor = (subjectKeyOrGroup: string, chapter?: string, topic?: string) => {
      if (!syllabusStats) return 0;
      const group = SUBJECT_GROUPS.find(g => g.name === subjectKeyOrGroup);
      if (group && !chapter) {
          return group.papers.reduce((sum, paper) => {
              const paperNorm = normalizeText(paper);
              const matchedKey = Object.keys(syllabusStats).find(k => normalizeText(k) === paperNorm);
              return sum + (matchedKey ? (syllabusStats[matchedKey]?.total || 0) : 0);
          }, 0);
      }
      const subjectNorm = normalizeText(subjectKeyOrGroup);
      const paperKey = Object.keys(syllabusStats).find(k => normalizeText(k) === subjectNorm);
      if (!paperKey) return 0;
      const paperData = syllabusStats[paperKey];
      if (!chapter) return paperData.total || 0;
      const chapterNorm = normalizeText(chapter);
      const chapterKey = paperData.chapters ? Object.keys(paperData.chapters).find(k => normalizeText(k) === chapterNorm) : null;
      if (!chapterKey) return 0;
      const chapterData = paperData.chapters[chapterKey];
      if (!topic) return chapterData.total || 0;
      const topicNorm = normalizeText(topic);
      let totalCount = 0;
      if (chapterData.topics) {
          Object.keys(chapterData.topics).forEach(dbTopic => {
              if (normalizeText(dbTopic) === topicNorm) {
                  totalCount += chapterData.topics[dbTopic];
              }
          });
      }
      return totalCount;
  };

  const getSelectedTopicCountForGroup = (papers: string[]) => {
      let count = 0;
      Object.keys(topicSelection).forEach(key => {
          for (const paper of papers) {
              if (key.startsWith(paper + '-')) {
                  count += topicSelection[key].length;
                  break; 
              }
          }
      });
      return count;
  };

  const startWrongQuestionsQuiz = async () => {
    if (!currentUser) {
        showToast("অনুগ্রহ করে লগইন করুন", 'error');
        return;
    }

    setSearchParams(prev => {
        const newP = new URLSearchParams(prev);
        newP.set('step', 'LOADING');
        return newP;
    });

    try {
        const { fetchUserMistakesAPI } = await import('../services/api');
        const mistakes = await fetchUserMistakesAPI(currentUser.uid);
        
        if (!mistakes || mistakes.length === 0) {
            showToast("আপনার কোনো ভুল প্রশ্নের রেকর্ড নেই", 'info');
            setSearchParams({ step: 'SELECTION' });
            return;
        }

        // Map mistakes to QuizQuestion structure
        // The question object is stored in questionId field in the mistake record
        const qs: QuizQuestion[] = mistakes.map((m: any) => m.questionId || m.question || m);

        initiateQuizGeneration([], ExamStandard.HSC, qs.length, undefined, false, {
            questions: qs,
            title: 'ভুল প্রশ্ন প্র্যাকটিস',
            mode: 'SINGLE_PAGE',
            timeLimit: 0,
            negativeMarking: 0,
            isPracticeMode: true
        });
    } catch (err) {
        console.error("Failed to load mistakes", err);
        showToast("ভুল প্রশ্ন লোড করা যায়নি", 'error');
        setSearchParams({ step: 'SELECTION' });
    }
  };

  const startCustomQuiz = async () => {
    const configs: QuizConfig[] = [];
    const allSubjects = Object.keys(SYLLABUS_DB);
    for (const subject of allSubjects) {
        for (const chapter of Object.keys(SYLLABUS_DB[subject])) {
            const key = `${subject}-${chapter}`;
            if (topicSelection[key] && topicSelection[key].length > 0) {
                // Check if ALL topics are selected
                const allTopics = getFlattenedTopics(subject, chapter);
                const selectedTopics = topicSelection[key];
                const isAllSelected = selectedTopics.length === allTopics.length;

                configs.push({ 
                    subject, 
                    chapter, 
                    topics: isAllSelected ? [] : selectedTopics 
                });
            }
        }
    }
    if (configs.length === 0) {
        showToast("অনুগ্রহ করে অন্তত একটি টপিক সিলেক্ট করুন", 'warning');
        return;
    }
    
    // Launch Generation
    initiateQuizGeneration(configs, examStandard, questionCount);
  };

  const initiateQuizGeneration = async (configs: QuizConfig[], standard: ExamStandard, count: number, difficulty?: DifficultyLevel, isPreset = false, presetConfigOverride?: any) => {
    setSearchParams(prev => {
        const newP = new URLSearchParams(prev);
        newP.set('step', 'LOADING');
        return newP;
    });

    try {
      let qs: QuizQuestion[] = [];
      let isAiGenerated = false;

      // Logic to fetch questions (Mixed DB + AI)
      if (presetConfigOverride?.questions) {
          qs = presetConfigOverride.questions;
      } else if (!isPreset) {
          // Ask for 'count' questions from EACH config chunk.
         const allPromises = configs.map(cfg => 
            generateQuizFromDB({
                subject: cfg.subject,
                chapter: cfg.chapter,
                topics: cfg.topics,
                count: count // Request full count to ensure large enough pool
            })
         );
         const results = await Promise.all(allPromises);
         qs = results.flat();
         
         // NO AI Fallback for Custom Quiz as per user request
         if (qs.length === 0) {
             showToast("ডাটাবেজে এই টপিকের উপর পর্যাপ্ত প্রশ্ন নেই।", "warning");
             // Go back to config
             setSearchParams(prev => {
                const newP = new URLSearchParams(prev);
                newP.set('step', 'TOPIC_CONFIG');
                return newP;
             });
             return;
         }
      } else {
         // Fallback for any preset logic if needed in future (though feature removed)
         qs = await generateQuiz(configs, standard, count, difficulty);
         isAiGenerated = true;
      }
      
      if (!qs || qs.length === 0) throw new Error("No questions generated");
      
      // Shuffle and Slice to exact requested count
      qs = qs.sort(() => 0.5 - Math.random()).slice(0, count);
      
      if (isAiGenerated) saveQuestionsToBankAPI(qs).catch(e => console.log("Auto-harvest failed", e));

      // SAVE CONFIG AND REDIRECT TO EXAM PAGE WITH UNIQUE ID
      const examId = `exam_${Date.now()}_${Math.floor(Math.random()*1000)}`;
      
      const finalConfig = {
          questions: qs,
          timeLimit: presetConfigOverride?.timeLimit ?? timeLimit,
          negativeMarking: presetConfigOverride?.negativeMarking ?? negativeMarking,
          mode: presetConfigOverride?.mode ?? examViewMode,
          title: presetConfigOverride?.title ?? 'Custom Exam',
          isPracticeMode: presetConfigOverride?.isPracticeMode ?? isPracticeMode,
          shuffle: true
      };

      // Save to localStorage with unique ID key
      localStorage.setItem(`exam_config_${examId}`, JSON.stringify(finalConfig));
      
      // Navigate to the dynamic route
      navigate(`/exam/${examId}`);

    } catch (e) {
      console.error(e);
      showToast("দুঃখিত, প্রশ্ন লোড করা যায়নি।", "error");
      setSearchParams(prev => {
        const newP = new URLSearchParams(prev);
        newP.set('step', 'TOPIC_CONFIG');
        return newP;
      });
    }
  };

  // --- AUTO-START MODEL TEST ---
  useEffect(() => {
    if (location.state?.modelTest) {
        const { subject, chapter, title, count, time } = location.state.modelTest;
        
        // Construct config
        const config: QuizConfig[] = [{
            subject,
            chapter,
            topics: [] // All topics
        }];

        // Launch
        initiateQuizGeneration(config, ExamStandard.HSC, count, undefined, false, {
            title: title,
            mode: 'SINGLE_PAGE',
            timeLimit: time,
            negativeMarking: 0.25,
            isPracticeMode: false // Model tests are exams
        });
    }
  }, [location.state]);

  const renderStatsBadge = (count: number) => {
      return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-1 rounded text-[9px] md:text-[10px] font-bold bg-orange-50 dark:bg-orange-900/30 border border-orange-100 dark:border-orange-800 text-orange-600 dark:text-orange-400">
              <Database size={10} className="opacity-60" /> 
              {count} প্রশ্ন
          </span>
      );
  };

  // --- NAVIGATION HANDLERS ---
  const handleSubjectClick = (subjectName: string, paperName: string) => {
      setSearchParams({
          view: 'CHAPTER_DRILLDOWN',
          subject: subjectName,
          paper: paperName
      });
  };

  const handleBackToGrid = () => {
      setSearchParams({ view: 'SUBJECT_GRID' });
  };

  const handleNextStep = () => {
      setSearchParams(prev => {
          const newP = new URLSearchParams(prev);
          newP.set('step', 'TOPIC_CONFIG');
          return newP;
      });
  };

  const handlePrevStep = () => {
      setSearchParams(prev => {
          const newP = new URLSearchParams(prev);
          newP.set('step', 'SELECTION');
          return newP;
      });
  };

  const handlePaperTabChange = (paper: string) => {
      setSearchParams(prev => {
          const newP = new URLSearchParams(prev);
          newP.set('paper', paper);
          return newP;
      });
  };

  // --- VIEWS ---

  if (currentStep === 'SELECTION') {
    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors relative">
        {/* Background Ambient Glow */}
        <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-500/5 rounded-full blur-[120px]"></div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden md:flex md:flex-col relative z-10">
            
            <div className="flex-1 md:overflow-hidden md:flex md:flex-col">
                
                    <div className="h-full flex flex-col">
                        {selectionView === 'SUBJECT_GRID' ? (
                            <div className="overflow-y-auto p-3 md:p-6 pb-32 md:pb-32 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6">
                                {SUBJECT_GROUPS.map((subject, idx) => {
                                    const selectedCount = getSelectedTopicCountForGroup(subject.papers);
                                    const availableCount = getStatsFor(subject.name);
                                    
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleSubjectClick(subject.name, subject.papers[0])}
                                            className={`relative bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl rounded-[1.8rem] md:rounded-[2rem] p-4 md:p-6 flex flex-col items-center justify-center gap-2 md:gap-3 shadow-sm hover:shadow-xl transition-all duration-300 group active:scale-[0.98] ${isRapidFire ? 'hover:border-red-500/50 hover:shadow-red-500/20' : 'hover:border-primary/50 hover:shadow-primary/20'} ${selectedCount > 0 ? 'border-primary dark:border-orange-500 ring-1 ring-primary/20' : 'border-gray-200 dark:border-white/5'}`}
                                        >
                                            {!isRapidFire && selectedCount > 0 && (
                                                <div className="absolute top-2.5 right-2.5 bg-primary text-white text-[9px] md:text-[10px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg shadow-primary/30 animate-in zoom-in">
                                                    <Check size={9} strokeWidth={3} className="md:w-2.5 md:h-2.5" /> {selectedCount}
                                                </div>
                                            )}
                                            
                                            <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl ${subject.color.split(' ')[1]} group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                                                <subject.icon size={24} className={`${subject.color.split(' ')[0]} dark:text-white md:w-8 md:h-8`} strokeWidth={2.5} />
                                            </div>
                                            <div className="text-center">
                                                <h3 className="font-black text-gray-900 dark:text-white text-xs md:text-lg tracking-tight">
                                                    {subject.display}
                                                </h3>
                                                {availableCount > 0 && (
                                                    <p className={`text-[9px] md:text-[10px] font-bold mt-0.5 md:mt-1 ${isRapidFire ? 'text-red-500' : 'text-primary dark:text-orange-400'}`}>
                                                        {availableCount.toLocaleString()} টি প্রশ্ন
                                                    </p>
                                                )}
                                                <p className="text-[8px] md:text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 hidden md:block font-medium uppercase tracking-wider">
                                                    {subject.subDisplay}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col h-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                                {/* Header - Glassmorphic & Sticky */}
                                <div className="p-4 border-b border-gray-200/50 dark:border-white/5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl sticky top-0 z-20">
                                    <div className="relative flex items-center justify-between">
                                        
                                        {/* Left: Back Button */}
                                        <button 
                                            onClick={handleBackToGrid}
                                            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-xs font-black uppercase tracking-wider bg-gray-100/50 dark:bg-white/5 px-3 py-1.5 rounded-lg hover:bg-gray-200/50 dark:hover:bg-white/10"
                                        >
                                            <ChevronLeft size={14} strokeWidth={3} /> Back
                                        </button>

                                        {/* Center: Title */}
                                        <h3 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-black text-base md:text-lg text-gray-800 dark:text-white flex items-center gap-2 whitespace-nowrap">
                                            {SUBJECT_GROUPS.find(g => g.name === activeSubjectGroup)?.display}
                                        </h3>

                                        {/* Right: Select All Button */}
                                        {!isRapidFire && (
                                            <button 
                                                onClick={() => {
                                                    const paper = activePaperTab || SUBJECT_GROUPS.find(g => g.name === activeSubjectGroup)?.papers[0] || '';
                                                    if(paper) toggleAllInPaper(paper);
                                                }}
                                                className="text-[10px] md:text-xs font-black text-primary dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors uppercase tracking-wider bg-primary/10 dark:bg-orange-500/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 dark:hover:bg-orange-500/20"
                                            >
                                                {isPaperFullySelected(activePaperTab || SUBJECT_GROUPS.find(g => g.name === activeSubjectGroup)?.papers[0] || '') ? 'Unselect All' : 'Select All'}
                                            </button>
                                        )}
                                        {isRapidFire && <div className="w-16"></div>} 
                                    </div>
                                </div>

                                {(SUBJECT_GROUPS.find(g => g.name === activeSubjectGroup)?.papers.length || 0) > 1 && (
                                    <div className="flex p-3 gap-3 overflow-x-auto no-scrollbar bg-white/50 dark:bg-gray-900/50 border-b border-gray-200/50 dark:border-white/5 backdrop-blur-sm">
                                        {SUBJECT_GROUPS.find(g => g.name === activeSubjectGroup)?.papers.map(paper => (
                                            <button
                                                key={paper}
                                                onClick={() => handlePaperTabChange(paper)}
                                                className={`flex-1 py-2.5 px-4 text-xs md:text-sm font-bold rounded-xl transition-all border shadow-sm whitespace-nowrap ${
                                                    activePaperTab === paper 
                                                    ? 'bg-primary text-white border-primary shadow-primary/30' 
                                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5'
                                                }`}
                                            >
                                                {paper.includes('1st') ? '১ম পত্র' : paper.includes('2nd') ? '২য় পত্র' : paper}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-40 custom-scrollbar">
                                    {(() => {
                                        const paperName = activePaperTab || SUBJECT_GROUPS.find(g => g.name === activeSubjectGroup)?.papers[0];
                                        if (!paperName) return null;
                                        
                                        const chapters = SYLLABUS_DB[paperName] ? Object.keys(SYLLABUS_DB[paperName]) : [];
                                        if (chapters.length === 0) return <div className="text-center text-gray-400 py-20 text-sm font-medium">কোনো অধ্যায় পাওয়া যায়নি</div>;

                                        return (
                                            <div key={paperName} className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-3">
                                                {chapters.map((chapter, cIdx) => {
                                                    const chapKey = `${paperName}-${chapter}`;
                                                    const availableTopics = getTopicsForChapter(paperName, chapter);
                                                    const selectedTopics = topicSelection[chapKey] || [];
                                                    let totalItemsCount = 0;
                                                    availableTopics.forEach(t => {
                                                        if (typeof t === 'string') totalItemsCount++;
                                                        else totalItemsCount += (1 + t.subTopics.length);
                                                    });
                                                    const isFullySelected = selectedTopics.length === totalItemsCount && totalItemsCount > 0;
                                                    const isPartiallySelected = selectedTopics.length > 0 && !isFullySelected;
                                                    const isExpanded = expandedChapterIds.has(chapKey);
                                                    const chapQ = getStatsFor(paperName, chapter);

                                                    // Rapid Fire Mode Card
                                                    if (isRapidFire) {
                                                        return (
                                                            <button
                                                                key={cIdx}
                                                                onClick={() => handleStartRapidFire(paperName, chapter)}
                                                                className="w-full flex items-center justify-between p-5 rounded-2xl border border-gray-200 dark:border-white/5 hover:border-red-500/50 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all group text-left bg-white dark:bg-gray-800/40 shadow-sm hover:shadow-red-500/10 backdrop-blur-sm"
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                                                        <Flame size={20} fill="currentColor" className="animate-pulse"/>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-base font-bold text-gray-800 dark:text-white block group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">{chapter}</span>
                                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{chapQ} Questions</span>
                                                                    </div>
                                                                </div>
                                                                <div className="bg-red-600 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 shadow-lg shadow-red-600/30">
                                                                    <Play size={16} fill="currentColor"/>
                                                                </div>
                                                            </button>
                                                        );
                                                    }

                                                    // Standard Selection Mode Card
                                                    return (
                                                        <div key={cIdx} className={`rounded-2xl border transition-all duration-300 overflow-hidden ${isFullySelected || isPartiallySelected ? 'bg-orange-50/50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-500/30 shadow-orange-500/5' : 'bg-white dark:bg-gray-800/40 border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10'}`}>
                                                            <div className="flex items-center p-1">
                                                                <button
                                                                    onClick={() => toggleAllTopicsInChapter(paperName, chapter)}
                                                                    className="flex-1 flex items-center gap-4 p-3 text-left rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                                                                >
                                                                    <div className={`w-5 h-5 md:w-6 md:h-6 rounded-lg flex items-center justify-center border transition-all duration-300 ${isFullySelected ? 'bg-primary border-primary shadow-lg shadow-primary/30 scale-110' : isPartiallySelected ? 'bg-primary border-primary shadow-lg shadow-primary/30' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 group-hover:border-primary/50'}`}>
                                                                        {isFullySelected && <Check size={14} className="text-white" strokeWidth={4} />}
                                                                        {isPartiallySelected && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <span className={`text-sm md:text-base font-bold block truncate whitespace-normal transition-colors ${isFullySelected || isPartiallySelected ? 'text-primary dark:text-orange-400' : 'text-gray-700 dark:text-gray-200'}`}>
                                                                            {chapter}
                                                                        </span>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            {renderStatsBadge(chapQ)}
                                                                            {selectedTopics.length > 0 && (
                                                                                <span className="text-[10px] text-orange-600 dark:text-orange-400 font-black bg-orange-100 dark:bg-orange-900/40 px-2 py-0.5 rounded-md">
                                                                                    {selectedTopics.length}/{totalItemsCount} SELECTED
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </button>
                                                                <button onClick={() => toggleChapterExpansion(chapKey)} className="p-3 m-1 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all">
                                                                    {isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                                                                </button>
                                                            </div>
                                                            
                                                            {isExpanded && (
                                                                <div className="border-t border-gray-100 dark:border-white/5 p-3 md:p-4 bg-gray-50/50 dark:bg-black/20 animate-in slide-in-from-top-2">
                                                                    <div className="grid grid-cols-1 gap-2 pl-2 md:pl-4 border-l-2 border-gray-200 dark:border-white/10 ml-3">
                                                                        {availableTopics.map((item, idx) => {
                                                                            if (typeof item === 'string') {
                                                                                const topic = item;
                                                                                const isTopicSelected = selectedTopics.includes(topic);
                                                                                const topicCount = getStatsFor(paperName, chapter, topic);
                                                                                return (
                                                                                    <label key={idx} className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-white dark:hover:bg-white/5 transition-all group">
                                                                                        <div className={`w-4 h-4 md:w-5 md:h-5 rounded-md border flex items-center justify-center transition-all ${isTopicSelected ? 'bg-orange-500 border-orange-500 shadow-md shadow-orange-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 group-hover:border-orange-400'}`}>
                                                                                            {isTopicSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                                                                                        </div>
                                                                                        <input type="checkbox" className="hidden" checked={isTopicSelected} onChange={() => toggleTopic(paperName, chapter, topic)} />
                                                                                        <span className={`text-xs md:text-sm font-medium flex-1 whitespace-normal transition-colors ${isTopicSelected ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{topic}</span>
                                                                                        {topicCount > 0 && (
                                                                                            <span className="text-[9px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700">
                                                                                                {topicCount}
                                                                                            </span>
                                                                                        )}
                                                                                    </label>
                                                                                )
                                                                            } else {
                                                                                // Sub-topic Group Logic (kept similar structure but updated styles)
                                                                                const topicKey = `${chapKey}-${item.title}`;
                                                                                const isTopicExpanded = expandedTopicIds.has(topicKey);
                                                                                const groupItems = [item.title, ...item.subTopics];
                                                                                const isGroupFullySelected = groupItems.every(t => selectedTopics.includes(t));
                                                                                const isGroupPartiallySelected = groupItems.some(t => selectedTopics.includes(t)) && !isGroupFullySelected;
                                                                                return (
                                                                                    <div key={idx} className="border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden bg-white dark:bg-gray-800/50 mb-2 shadow-sm">
                                                                                        <div className="flex items-center p-2 bg-gray-50/50 dark:bg-white/5">
                                                                                            <button onClick={() => toggleTopicGroup(paperName, chapter, item)} className="flex items-center justify-center p-2 mr-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors">
                                                                                                <div className={`w-4 h-4 md:w-5 md:h-5 rounded-md border flex items-center justify-center transition-all ${isGroupFullySelected ? 'bg-orange-500 border-orange-500 shadow-md' : isGroupPartiallySelected ? 'bg-orange-500 border-orange-500 shadow-md' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50'}`}>
                                                                                                    {isGroupFullySelected && <Check size={12} className="text-white" strokeWidth={3} />}
                                                                                                    {isGroupPartiallySelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                                                                                                </div>
                                                                                            </button>
                                                                                            <button onClick={() => toggleTopicExpansion(topicKey)} className="flex-1 text-left flex justify-between items-center text-xs md:text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-orange-400 transition-colors py-1">
                                                                                                <span className="whitespace-normal">{item.title}</span>
                                                                                                {isTopicExpanded ? <ChevronUp size={16} className="text-gray-400 ml-2 shrink-0"/> : <ChevronDown size={16} className="text-gray-400 ml-2 shrink-0"/>}
                                                                                            </button>
                                                                                        </div>
                                                                                        {isTopicExpanded && (
                                                                                            <div className="p-2 pl-10 border-t border-gray-100 dark:border-white/5 space-y-1 bg-white dark:bg-black/20">
                                                                                                {item.subTopics.map((sub, sIdx) => {
                                                                                                    const isSubSelected = selectedTopics.includes(sub);
                                                                                                    return (
                                                                                                        <label key={sIdx} className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                                                                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${isSubSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                                                                                                {isSubSelected && <Check size={10} className="text-white" strokeWidth={3} />}
                                                                                                            </div>
                                                                                                            <input type="checkbox" className="hidden" checked={isSubSelected} onChange={() => toggleTopic(paperName, chapter, sub)} />
                                                                                                            <span className={`text-[11px] md:text-xs font-medium whitespace-normal ${isSubSelected ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{sub}</span>
                                                                                                        </label>
                                                                                                    )
                                                                                                })}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                )
                                                                            }
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
            </div>
        </div>
        {(!isRapidFire) && (
            <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:w-96 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-gray-200 dark:border-white/10 shadow-2xl rounded-[2rem] z-40 animate-in slide-in-from-bottom-10 duration-500">
                <div className="flex justify-between items-center mb-3">
                    <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Selected Topics
                    </div>
                    <div className="text-lg font-black text-primary dark:text-white">
                        {Object.values(topicSelection).flat().length}
                    </div>
                </div>
                <button 
                    onClick={() => {
                        if(Object.values(topicSelection).flat().length === 0) {
                                showToast("অনুগ্রহ করে অন্তত একটি টপিক সিলেক্ট করুন", "warning");
                                return;
                            }
                            handleNextStep(); 
                        }} 
                        disabled={Object.values(topicSelection).flat().length === 0} 
                        className="w-full bg-primary hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-200 dark:shadow-none transition-all active:scale-95 text-xs md:text-sm"
                    >
                        {t('quiz_next_step')} <ArrowRight size={14} className="md:w-4 md:h-4" />
                    </button>
            </div>
        )}
      </div>
    );
  }

  // TOPIC CONFIG STEP
  if (currentStep === 'TOPIC_CONFIG') {
    // Grouping logic
    const groupedSelection: Record<string, Record<string, string[]>> = {};
    Object.entries(topicSelection).forEach(([key, rawTopics]) => {
        const topics = rawTopics as string[];
        if (topics.length === 0) return;
        
        let subjectName = "";
        let chapterName = "";
        for(const s of Object.keys(SYLLABUS_DB)) {
            if (key.startsWith(s)) {
                subjectName = s;
                chapterName = key.substring(s.length + 1);
                break;
            }
        }
        
        if (subjectName) {
            if (!groupedSelection[subjectName]) groupedSelection[subjectName] = {};
            groupedSelection[subjectName][chapterName] = topics;
        }
    });

    const totalSelectedTopics = Object.values(topicSelection).flat().length;

    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-500/5 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[120px]"></div>
        </div>

        {/* Header */}
        <div className="p-4 pb-2 relative z-10 flex items-center justify-between">
            <button onClick={handlePrevStep} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center gap-2 text-sm font-bold bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-xl backdrop-blur-md transition-all hover:bg-white/80 dark:hover:bg-gray-800/80 shadow-sm">
                <ChevronLeft size={18}/> {t('quiz_prev')}
            </button>
            <h2 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tight">
                {t('quiz_settings')}
            </h2>
            <div className="w-20"></div> {/* Spacer for centering */}
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-32 relative z-10 custom-scrollbar">
            <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-6">
                
                {/* Right Column: Exam Settings (Order 1 on Mobile) */}
                <div className="lg:col-span-1 space-y-5 order-1 lg:order-2">
                    <div className="flex items-center gap-2 mb-2">
                         <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                            <Settings size={20} />
                         </div>
                         <h3 className="font-bold text-gray-800 dark:text-white text-lg">
                            {t('quiz_settings')}
                         </h3>
                    </div>

                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-100 dark:border-white/5 p-5 md:p-6 shadow-lg shadow-gray-200/50 dark:shadow-none space-y-5 md:space-y-6 lg:sticky lg:top-4">
                        
                        {/* Practice Mode */}
                        <div 
                            onClick={() => setIsPracticeMode(!isPracticeMode)} 
                            className={`relative overflow-hidden p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 group ${isPracticeMode ? 'bg-orange-50/50 border-orange-500 dark:bg-orange-900/10 dark:border-orange-500' : 'bg-gray-50 border-transparent dark:bg-gray-700/30 hover:border-gray-200 dark:hover:border-gray-600'}`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl ${isPracticeMode ? 'bg-orange-500 text-white' : 'bg-white dark:bg-gray-600 text-gray-400'}`}>
                                        <Zap size={20} fill={isPracticeMode ? "currentColor" : "none"} />
                                    </div>
                                    <div>
                                        <p className={`font-bold text-sm ${isPracticeMode ? 'text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-gray-200'}`}>
                                            {t('quiz_practice_mode')}
                                        </p>
                                        <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                                            তাৎক্ষণিক উত্তর ও ব্যাখ্যা
                                        </p>
                                    </div>
                                </div>
                                <div className={`w-12 h-7 rounded-full relative transition-colors duration-300 ${isPracticeMode ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm ${isPracticeMode ? 'left-6' : 'left-1'}`}></div>
                                </div>
                            </div>
                        </div>

                        {/* Question Count */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {t('quiz_question_count')}
                                </label>
                                <span className="text-sm font-black text-primary dark:text-orange-400 bg-primary/10 dark:bg-orange-500/10 px-3 py-1 rounded-lg">
                                    {questionCount}
                                </span>
                            </div>
                            <input 
                                type="range" 
                                min="5" 
                                max="50" 
                                step="5" 
                                value={questionCount} 
                                onChange={(e) => setQuestionCount(parseInt(e.target.value))} 
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary dark:accent-orange-500"
                            />
                            <div className="flex justify-between text-[10px] font-bold text-gray-400">
                                <span>5</span>
                                <span>50</span>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100 dark:bg-gray-700/50"></div>

                        {/* Time & Negative Marking */}
                        <div className="grid grid-cols-2 gap-4 md:gap-5">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {t('quiz_time_limit')}
                                </label>
                                <div className="relative">
                                    <select 
                                        value={timeLimit} 
                                        onChange={(e) => setTimeLimit(parseInt(e.target.value))} 
                                        className="w-full p-2.5 md:p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-bold text-gray-800 dark:text-white appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    >
                                        <option value="0">আনলিমিটেড</option>
                                        <option value="5">৫ মিনিট</option>
                                        <option value="10">১০ মিনিট</option>
                                        <option value="15">১৫ মিনিট</option>
                                        <option value="20">২০ মিনিট</option>
                                        <option value="30">৩০ মিনিট</option>
                                        <option value="45">৪৫ মিনিট</option>
                                        <option value="60">১ ঘণ্টা</option>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {t('quiz_negative_mark')}
                                </label>
                                <div className="relative">
                                    <select 
                                        value={negativeMarking} 
                                        onChange={(e) => setNegativeMarking(parseFloat(e.target.value))} 
                                        className="w-full p-2.5 md:p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-bold text-gray-800 dark:text-white appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    >
                                        <option value="0">নেই</option>
                                        <option value="0.25">০.২৫</option>
                                        <option value="0.50">০.৫০</option>
                                        <option value="1.00">১.০০</option>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100 dark:bg-gray-700/50"></div>

                        {/* View Mode */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('quiz_view_mode')}
                            </label>
                            <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-700/50 p-1.5 rounded-xl">
                                <button 
                                    onClick={() => setExamViewMode('SINGLE_PAGE')} 
                                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${examViewMode === 'SINGLE_PAGE' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    <LayoutList size={16}/> একটি করে
                                </button>
                                <button 
                                    onClick={() => setExamViewMode('ALL_AT_ONCE')} 
                                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${examViewMode === 'ALL_AT_ONCE' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    <AlignJustify size={16}/> সব একসাথে
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Left Column: Selected Topics Review (Order 2 on Mobile) */}
                <div className="lg:col-span-2 space-y-5 order-2 lg:order-1">
                    <div 
                        className="flex items-center justify-between cursor-pointer lg:cursor-default" 
                        onClick={() => setIsReviewExpanded(!isReviewExpanded)}
                    >
                        <div className="flex items-center gap-2">
                             <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                                <ListChecks size={20} />
                             </div>
                             <h3 className="font-bold text-gray-800 dark:text-white text-lg">
                                নির্বাচিত টপিকসমূহ
                             </h3>
                             <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold px-2 py-1 rounded-md">
                                {totalSelectedTopics}
                             </span>
                        </div>
                        <div className="lg:hidden text-gray-500">
                            {isReviewExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                    </div>

                    <div className={`space-y-4 transition-all duration-300 ${isReviewExpanded ? 'block' : 'hidden lg:block'}`}>
                        {Object.keys(groupedSelection).length === 0 ? (
                            <div className="p-12 text-center bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-500">
                                <Archive size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="font-medium">কোনো টপিক সিলেক্ট করা হয়নি</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {Object.entries(groupedSelection).map(([subject, chapters]) => (
                                    <div key={subject} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                        <div className="bg-gray-50/50 dark:bg-white/5 px-5 py-3 border-b border-gray-100 dark:border-white/5 flex items-center gap-3">
                                            <div className="w-2 h-8 bg-primary rounded-full"></div>
                                            <h4 className="font-black text-gray-800 dark:text-white text-base uppercase tracking-wide">
                                                {subject}
                                            </h4>
                                        </div>
                                        <div className="p-5 space-y-4">
                                            {Object.entries(chapters).map(([chapter, topics]) => (
                                                <div key={chapter} className="relative pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                                                    <h5 className="font-bold text-gray-700 dark:text-gray-200 text-sm mb-2">
                                                        {chapter}
                                                    </h5>
                                                    <div className="flex flex-wrap gap-2">
                                                        {topics.map(t => (
                                                            <span key={t} className="px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-300 text-xs font-semibold rounded-lg border border-orange-100 dark:border-orange-500/20">
                                                                {t}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {!isReviewExpanded && (
                        <div 
                            className="lg:hidden p-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-center text-sm font-medium text-gray-500 cursor-pointer hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors"
                            onClick={() => setIsReviewExpanded(true)}
                        >
                            টপিকগুলো দেখতে ক্লিক করুন
                        </div>
                    )}
                </div>

            </div>
        </div>

        {/* Floating Bottom Bar - Sticky above bottom nav */}
        <div className="fixed bottom-[calc(80px+env(safe-area-inset-bottom))] left-4 right-4 md:left-auto md:right-8 md:w-auto z-50 animate-in slide-in-from-bottom-10 duration-500">
             <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border border-gray-200 dark:border-white/10 shadow-2xl rounded-[2rem] p-2 pl-6 flex justify-between items-center gap-4 max-w-2xl mx-auto md:mx-0">
                <div className="hidden sm:block">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">মোট প্রশ্ন</p>
                    <p className="text-lg font-black text-gray-800 dark:text-white">{questionCount} টি</p>
                </div>
                <div className="block sm:hidden">
                     <p className="text-xs font-bold text-gray-500 dark:text-gray-400">প্রশ্ন</p>
                     <p className="text-base font-black text-gray-800 dark:text-white">{questionCount}</p>
                </div>
                <div className="flex items-center gap-3 flex-1 justify-end">
                    <button 
                        onClick={startCustomQuiz} 
                        className="bg-primary hover:bg-orange-700 text-white px-6 py-3 md:px-8 md:py-4 rounded-[1.5rem] font-bold flex items-center gap-3 shadow-lg shadow-orange-500/30 transition-all hover:scale-105 active:scale-95 text-sm md:text-base"
                    >
                        <span>{t('quiz_start')}</span>
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                            <Play fill="currentColor" size={12} /> 
                        </div>
                    </button>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // LOADING STEP
  if (currentStep === 'LOADING') {
    return (
        <div className="h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center p-6 transition-colors relative overflow-hidden">
            {/* Background Ambient Glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-primary/5 rounded-full blur-[100px] animate-pulse"></div>
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-primary/30 dark:bg-orange-500/30 rounded-full blur-2xl animate-pulse"></div>
                    <div className="relative bg-white dark:bg-gray-800 p-6 rounded-full shadow-xl border border-gray-100 dark:border-white/10">
                        <Loader2 size={48} className="text-primary dark:text-orange-400 animate-spin" strokeWidth={2.5} />
                    </div>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white mb-2 tracking-tight">
                    {t('common_loading')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium max-w-xs mx-auto animate-pulse">
                    প্রশ্ন তৈরি করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...
                </p>
            </div>
        </div>
    );
  }

  return null;
};

export default QuizArena;
