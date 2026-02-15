
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { generateQuizFromDB, fetchSyllabusStatsAPI, saveQuestionsToBankAPI } from '../services/api';
import { generateQuiz } from '../services/geminiService';
import { QuizQuestion, ExamStandard, QuizConfig, DifficultyLevel } from '../types';
import { SYLLABUS_DB, SyllabusItem, TopicNode } from '../services/syllabusData';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from './Toast';
import { 
  Loader2, CheckCircle, XCircle, Trophy, 
  Clock, Play, Settings, BookOpen, ChevronRight, Check,
  ArrowRight, ArrowLeft, Atom, Calculator, Globe, Book, Beaker, Dna, 
  Library, ChevronDown, ChevronUp, CheckSquare,
  AlertTriangle, LayoutList, AlignJustify, GraduationCap, Flame, Database,
  PieChart as PieChartIcon, Zap, BrainCircuit, Cpu, Languages, PlusCircle, ListChecks, LayoutGrid, ChevronLeft
} from 'lucide-react';

// --- SUBJECT GROUPING FOR UI (Question Bank Style) ---
const SUBJECT_GROUPS = [
  {
    name: 'Biology',
    display: 'জীববিজ্ঞান',
    subDisplay: 'Biology',
    icon: Dna,
    color: 'text-green-600 bg-green-100',
    papers: ['Biology 1st Paper', 'Biology 2nd Paper']
  },
  {
    name: 'Chemistry',
    display: 'রসায়ন',
    subDisplay: 'Chemistry',
    icon: Beaker,
    color: 'text-orange-600 bg-orange-100',
    papers: ['Chemistry 1st Paper', 'Chemistry 2nd Paper']
  },
  {
    name: 'Physics',
    display: 'পদার্থবিজ্ঞান',
    subDisplay: 'Physics',
    icon: Atom,
    color: 'text-purple-600 bg-purple-100',
    papers: ['Physics 1st Paper', 'Physics 2nd Paper']
  },
  {
    name: 'Higher Math',
    display: 'উচ্চতর গণিত',
    subDisplay: 'Higher Math',
    icon: Calculator,
    color: 'text-blue-600 bg-blue-100',
    papers: ['Higher Math 1st Paper', 'Higher Math 2nd Paper']
  },
  {
    name: 'English',
    display: 'ইংরেজি',
    subDisplay: 'English',
    icon: Languages,
    color: 'text-indigo-600 bg-indigo-100',
    papers: ['English']
  },
  {
    name: 'Bangla',
    display: 'বাংলা',
    subDisplay: 'Bangla',
    icon: Book,
    color: 'text-pink-600 bg-pink-100',
    papers: ['Bangla 1st Paper', 'Bangla 2nd Paper']
  },
  {
    name: 'ICT',
    display: 'তথ্য ও যোগাযোগ প্রযুক্তি',
    subDisplay: 'ICT',
    icon: Cpu,
    color: 'text-teal-600 bg-teal-100',
    papers: ['ICT']
  },
  {
    name: 'General Knowledge',
    display: 'সাধারণ জ্ঞান',
    subDisplay: 'GK',
    icon: Globe,
    color: 'text-cyan-600 bg-cyan-100',
    papers: ['General Knowledge']
  },
  {
    name: 'Mental Ability',
    display: 'মানসিক দক্ষতা',
    subDisplay: 'Mental Ability',
    icon: BrainCircuit,
    color: 'text-rose-600 bg-rose-100',
    papers: ['Mental Ability']
  },
];

type QuizStep = 'SELECTION' | 'TOPIC_CONFIG' | 'LOADING';
type ExamViewMode = 'SINGLE_PAGE' | 'ALL_AT_ONCE';
type SelectionView = 'SUBJECT_GRID' | 'CHAPTER_DRILLDOWN';

const QuizArena: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [examStandard, setExamStandard] = useState<ExamStandard>(ExamStandard.HSC);
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState<number>(0);
  const [negativeMarking, setNegativeMarking] = useState<number>(0);
  const [examViewMode, setExamViewMode] = useState<ExamViewMode>('SINGLE_PAGE');
  const [isPracticeMode, setIsPracticeMode] = useState(false);

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
  }, [location.state, activeSubjectGroup, setSearchParams]);

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

  const startCustomQuiz = async () => {
    const configs: QuizConfig[] = [];
    const allSubjects = Object.keys(SYLLABUS_DB);
    for (const subject of allSubjects) {
        for (const chapter of Object.keys(SYLLABUS_DB[subject])) {
            const key = `${subject}-${chapter}`;
            if (topicSelection[key] && topicSelection[key].length > 0) {
                configs.push({ subject, chapter, topics: topicSelection[key] });
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
      if (!isPreset) {
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

  const renderStatsBadge = (count: number) => {
      return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-1 rounded text-[9px] md:text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400">
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
        <div className="flex-1 overflow-y-auto overflow-x-hidden md:flex md:flex-col">
            
            <div className="flex-1 md:overflow-hidden md:flex md:flex-col">
                
                    <div className="h-full flex flex-col">
                        {selectionView === 'SUBJECT_GRID' ? (
                            <div className="overflow-y-auto p-3 md:p-6 pb-24 md:pb-32 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                                {SUBJECT_GROUPS.map((subject, idx) => {
                                    const selectedCount = getSelectedTopicCountForGroup(subject.papers);
                                    const availableCount = getStatsFor(subject.name);
                                    
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleSubjectClick(subject.name, subject.papers[0])}
                                            className={`relative bg-white dark:bg-gray-800 rounded-2xl border p-4 md:p-5 flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all group ${isRapidFire ? 'hover:border-red-500/50' : 'hover:border-primary/50'} ${selectedCount > 0 ? 'border-primary dark:border-blue-500 ring-1 ring-primary/20' : 'border-gray-200 dark:border-gray-700'}`}
                                        >
                                            {!isRapidFire && selectedCount > 0 && (
                                                <div className="absolute top-2 right-2 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm animate-in zoom-in">
                                                    <Check size={8} /> {selectedCount}
                                                </div>
                                            )}
                                            
                                            <div className={`p-3 md:p-4 rounded-full ${subject.color.split(' ')[1]} group-hover:scale-110 transition-transform duration-300`}>
                                                <subject.icon size={24} className={`${subject.color.split(' ')[0]} dark:text-white md:w-8 md:h-8`} />
                                            </div>
                                            <div className="text-center">
                                                <h3 className="font-bold text-gray-900 dark:text-white text-xs md:text-base">
                                                    {subject.display}
                                                </h3>
                                                {availableCount > 0 && (
                                                    <p className={`text-[9px] md:text-[10px] font-bold opacity-80 ${isRapidFire ? 'text-red-500' : 'text-primary dark:text-blue-400'}`}>
                                                        {availableCount.toLocaleString()} টি প্রশ্ন
                                                    </p>
                                                )}
                                                <p className="text-[8px] md:text-[9px] text-gray-400 mt-0.5 hidden md:block">
                                                    {subject.subDisplay}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900">
                                {/* Header - Not Sticky, Centered Title */}
                                <div className="p-3 md:p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                                    <div className="relative flex items-center justify-between">
                                        
                                        {/* Left: Back Button with Text */}
                                        <button 
                                            onClick={handleBackToGrid}
                                            className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-xs font-bold"
                                        >
                                            <ChevronLeft size={16} /> আরো বিষয়
                                        </button>

                                        {/* Center: Absolute Centered Title */}
                                        <h3 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-base md:text-lg text-gray-800 dark:text-white flex items-center gap-2 whitespace-nowrap">
                                            {SUBJECT_GROUPS.find(g => g.name === activeSubjectGroup)?.display}
                                        </h3>

                                        {/* Right: Select All Button */}
                                        {!isRapidFire && (
                                            <button 
                                                onClick={() => {
                                                    const paper = activePaperTab || SUBJECT_GROUPS.find(g => g.name === activeSubjectGroup)?.papers[0] || '';
                                                    if(paper) toggleAllInPaper(paper);
                                                }}
                                                className="text-[10px] md:text-xs font-bold text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                            >
                                                {isPaperFullySelected(activePaperTab || SUBJECT_GROUPS.find(g => g.name === activeSubjectGroup)?.papers[0] || '') ? 'Unselect All' : 'Select All'}
                                            </button>
                                        )}
                                        {isRapidFire && <div className="w-8"></div>} {/* Spacer for centering if RapidFire */}
                                    </div>
                                </div>

                                {SUBJECT_GROUPS.find(g => g.name === activeSubjectGroup)?.papers.length! > 1 && (
                                    <div className="flex p-2 md:p-3 gap-2 md:gap-3 overflow-x-auto no-scrollbar bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                                        {SUBJECT_GROUPS.find(g => g.name === activeSubjectGroup)?.papers.map(paper => (
                                            <button
                                                key={paper}
                                                onClick={() => handlePaperTabChange(paper)}
                                                className={`flex-1 py-1.5 md:py-2 px-3 md:px-4 text-xs md:text-sm font-bold rounded-xl transition-all border shadow-sm whitespace-nowrap ${
                                                    activePaperTab === paper 
                                                    ? 'bg-primary text-white border-primary' 
                                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                            >
                                                {paper.includes('1st') ? '১ম পত্র' : paper.includes('2nd') ? '২য় পত্র' : paper}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 md:space-y-4 pb-40">
                                    {(() => {
                                        const paperName = activePaperTab || SUBJECT_GROUPS.find(g => g.name === activeSubjectGroup)?.papers[0];
                                        if (!paperName) return null;
                                        
                                        const chapters = SYLLABUS_DB[paperName] ? Object.keys(SYLLABUS_DB[paperName]) : [];
                                        if (chapters.length === 0) return <div className="text-center text-gray-400 py-10 text-xs">কোনো অধ্যায় পাওয়া যায়নি</div>;

                                        return (
                                            <div key={paperName} className="animate-in fade-in slide-in-from-right-4 duration-300">
                                                <div className="space-y-2">
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

                                                        // If Rapid Fire, simple click triggers start
                                                        if (isRapidFire) {
                                                            return (
                                                                <button
                                                                    key={cIdx}
                                                                    onClick={() => handleStartRapidFire(paperName, chapter)}
                                                                    className="w-full flex items-center justify-between p-3 md:p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all group text-left bg-white dark:bg-gray-800 shadow-sm"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500">
                                                                            <Flame size={16} fill="currentColor"/>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-sm font-bold text-gray-800 dark:text-white block">{chapter}</span>
                                                                            <span className="text-[10px] text-gray-500">{chapQ} Questions Available</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="bg-red-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <Play size={14} fill="currentColor"/>
                                                                    </div>
                                                                </button>
                                                            );
                                                        }

                                                        return (
                                                            <div key={cIdx} className={`rounded-xl border transition-all ${isFullySelected || isPartiallySelected ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                                                                <div className="flex items-center p-1">
                                                                    <button
                                                                        onClick={() => toggleAllTopicsInChapter(paperName, chapter)}
                                                                        className="flex-1 flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                                                    >
                                                                        <div className={`w-4 h-4 md:w-5 md:h-5 rounded flex items-center justify-center border transition-all ${isFullySelected ? 'bg-primary border-primary' : isPartiallySelected ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700'}`}>
                                                                            {isFullySelected && <Check size={12} className="text-white md:w-[14px] md:h-[14px]" />}
                                                                            {isPartiallySelected && <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-white rounded-sm" />}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <span className={`text-xs md:text-sm font-bold block truncate whitespace-normal ${isFullySelected || isPartiallySelected ? 'text-primary dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                                                                {chapter}
                                                                            </span>
                                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                                {renderStatsBadge(chapQ)}
                                                                                {selectedTopics.length > 0 && (
                                                                                    <span className="text-[9px] md:text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                                                                                        {selectedTopics.length}/{totalItemsCount} নির্বাচিত
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </button>
                                                                    <button onClick={() => toggleChapterExpansion(chapKey)} className="p-2 md:p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border-l border-transparent hover:border-gray-200 dark:hover:border-gray-600">
                                                                        {isExpanded ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                                                                    </button>
                                                                </div>
                                                                {isExpanded && (
                                                                    <div className="border-t border-gray-100 dark:border-gray-700 p-2 md:p-3 bg-gray-50/50 dark:bg-gray-900/30 animate-in slide-in-from-top-2">
                                                                        <div className="grid grid-cols-1 gap-1 md:gap-2 pl-2 md:pl-8">
                                                                            {availableTopics.map((item, idx) => {
                                                                                if (typeof item === 'string') {
                                                                                    const topic = item;
                                                                                    const isTopicSelected = selectedTopics.includes(topic);
                                                                                    const topicCount = getStatsFor(paperName, chapter, topic);
                                                                                    return (
                                                                                        <label key={idx} className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-colors group">
                                                                                            <div className={`w-3.5 h-3.5 md:w-4 md:h-4 rounded border flex items-center justify-center transition-colors ${isTopicSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'}`}>
                                                                                                {isTopicSelected && <Check size={10} className="text-white" />}
                                                                                            </div>
                                                                                            <input type="checkbox" className="hidden" checked={isTopicSelected} onChange={() => toggleTopic(paperName, chapter, topic)} />
                                                                                            <span className="text-[11px] md:text-xs text-gray-600 dark:text-gray-300 font-medium flex-1 whitespace-normal">{topic}</span>
                                                                                            {topicCount > 0 && (
                                                                                                <span className="text-[9px] md:text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                                                                                                    {topicCount}
                                                                                                </span>
                                                                                            )}
                                                                                        </label>
                                                                                    )
                                                                                } else {
                                                                                    const topicKey = `${chapKey}-${item.title}`;
                                                                                    const isTopicExpanded = expandedTopicIds.has(topicKey);
                                                                                    const groupItems = [item.title, ...item.subTopics];
                                                                                    const isGroupFullySelected = groupItems.every(t => selectedTopics.includes(t));
                                                                                    const isGroupPartiallySelected = groupItems.some(t => selectedTopics.includes(t)) && !isGroupFullySelected;
                                                                                    return (
                                                                                        <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 mb-1">
                                                                                            <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-800/80">
                                                                                                <button onClick={() => toggleTopicGroup(paperName, chapter, item)} className="flex items-center justify-center p-1 mr-2">
                                                                                                    <div className={`w-3.5 h-3.5 md:w-4 md:h-4 rounded border flex items-center justify-center transition-colors ${isGroupFullySelected ? 'bg-blue-500 border-blue-500' : isGroupPartiallySelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'}`}>
                                                                                                        {isGroupFullySelected && <Check size={10} className="text-white" />}
                                                                                                        {isGroupPartiallySelected && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                                                                                                    </div>
                                                                                                </button>
                                                                                                <button onClick={() => toggleTopicExpansion(topicKey)} className="flex-1 text-left flex justify-between items-center text-[11px] md:text-xs font-bold text-gray-700 dark:text-gray-200">
                                                                                                    <span className="whitespace-normal">{item.title}</span>
                                                                                                    {isTopicExpanded ? <ChevronUp size={14} className="text-gray-400 ml-2 shrink-0"/> : <ChevronDown size={14} className="text-gray-400 ml-2 shrink-0"/>}
                                                                                                </button>
                                                                                            </div>
                                                                                            {isTopicExpanded && (
                                                                                                <div className="p-2 pl-8 border-t border-gray-100 dark:border-gray-700 space-y-1 bg-white dark:bg-gray-900/20">
                                                                                                    {item.subTopics.map((sub, sIdx) => {
                                                                                                        const isSubSelected = selectedTopics.includes(sub);
                                                                                                        return (
                                                                                                            <label key={sIdx} className="flex items-center gap-3 p-1.5 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                                                                                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${isSubSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                                                                                                    {isSubSelected && <Check size={8} className="text-white" />}
                                                                                                                </div>
                                                                                                                <input type="checkbox" className="hidden" checked={isSubSelected} onChange={() => toggleTopic(paperName, chapter, sub)} />
                                                                                                                <span className="text-[10px] md:text-[11px] text-gray-600 dark:text-gray-400 whitespace-normal">{sub}</span>
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
            <div className="fixed bottom-[60px] md:bottom-0 left-0 md:left-64 right-0 p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-40">
                <div className="flex justify-between items-center max-w-6xl mx-auto">
                    <div className="text-[10px] md:text-xs text-gray-500 font-bold">
                        মোট {Object.values(topicSelection).flat().length} টি টপিক সিলেক্টেড
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
                        className="bg-primary hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95 text-xs md:text-sm"
                    >
                        {t('quiz_next_step')} <ArrowRight size={14} className="md:w-4 md:h-4" />
                    </button>
                </div>
            </div>
        )}
      </div>
    );
  }

  // TOPIC CONFIG STEP
  if (currentStep === 'TOPIC_CONFIG') {
    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="p-4 pb-2">
            <button onClick={handlePrevStep} className="text-gray-500 hover:text-gray-800 dark:hover:text-white flex items-center gap-1 text-xs md:text-sm font-bold">
                <ChevronLeft size={16}/> পিছনে যান
            </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-40">
            <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-4 md:gap-6">
                <div className="md:col-span-2 space-y-4">
                    <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-3 text-sm">
                        <ListChecks size={16} className="text-green-500"/> নির্বাচিত টপিকসমূহ (রিভিউ)
                    </h3>
                    {Object.keys(topicSelection).length === 0 ? (
                        <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 text-xs">কোনো টপিক সিলেক্ট করা হয়নি।</div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {Object.entries(topicSelection).map(([key, rawTopics]) => {
                                const topics = rawTopics as string[];
                                let subjectName = "";
                                let chapterName = "";
                                for(const s of Object.keys(SYLLABUS_DB)) {
                                    if (key.startsWith(s)) {
                                        subjectName = s;
                                        chapterName = key.substring(s.length + 1);
                                        break;
                                    }
                                }
                                if (topics.length === 0) return null;
                                return (
                                    <div key={key} className="p-3 md:p-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-[9px] md:text-[10px] font-bold rounded text-gray-600 dark:text-gray-300">{subjectName}</span>
                                            <h4 className="font-bold text-gray-800 dark:text-white text-xs md:text-sm whitespace-normal">{chapterName}</h4>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {topics.map(t => (<span key={t} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-[10px] rounded border border-blue-100 dark:border-blue-800 whitespace-normal">{t}</span>))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="md:col-span-1 space-y-4">
                    <div className="md:sticky md:top-0 space-y-4">
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-3 text-sm"><Settings size={16} className="text-primary dark:text-blue-400" /> {t('quiz_settings')}</h3>
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm space-y-4">
                                <div onClick={() => setIsPracticeMode(!isPracticeMode)} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isPracticeMode ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-lg ${isPracticeMode ? 'bg-white text-blue-600 dark:bg-blue-800 dark:text-white' : 'bg-white text-gray-400 dark:bg-gray-600 dark:text-gray-300'}`}><Zap size={16} fill={isPracticeMode ? "currentColor" : "none"} /></div>
                                        <div><p className={`font-bold text-xs ${isPracticeMode ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>{t('quiz_practice_mode')}</p><p className="text-[9px] text-gray-500 dark:text-gray-400">উত্তর সাথে সাথে দেখা যাবে</p></div>
                                    </div>
                                    <div className={`w-8 h-5 rounded-full relative transition-colors ${isPracticeMode ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-500'}`}><div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isPracticeMode ? 'left-4' : 'left-1'}`}></div></div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Standard (মান)</label>
                                    <select value={examStandard} onChange={(e) => setExamStandard(e.target.value as ExamStandard)} className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl font-medium text-xs text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary">{Object.values(ExamStandard).map(std => (<option key={std} value={std}>{std}</option>))}</select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t('quiz_question_count')}: <span className="text-primary dark:text-blue-400">{questionCount}</span></label>
                                    <input type="range" min="5" max="50" step="5" value={questionCount} onChange={(e) => setQuestionCount(parseInt(e.target.value))} className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary dark:accent-blue-500"/><div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>5</span><span>50</span></div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t('quiz_time_limit')}</label>
                                        <select value={timeLimit} onChange={(e) => setTimeLimit(parseInt(e.target.value))} className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-800 dark:text-white focus:outline-none"><option value="0">আনলিমিটেড</option><option value="5">৫ মিনিট</option><option value="10">১০ মিনিট</option><option value="15">১৫ মিনিট</option><option value="20">২০ মিনিট</option><option value="30">৩০ মিনিট</option><option value="45">৪৫ মিনিট</option><option value="60">১ ঘণ্টা</option></select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t('quiz_negative_mark')}</label>
                                        <select value={negativeMarking} onChange={(e) => setNegativeMarking(parseFloat(e.target.value))} className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-800 dark:text-white focus:outline-none"><option value="0">0</option><option value="0.25">0.25</option><option value="0.50">0.50</option><option value="1.00">1.00</option></select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t('quiz_view_mode')}</label>
                                    <div className="flex bg-gray-50 dark:bg-gray-700 p-1 rounded-lg"><button onClick={() => setExamViewMode('SINGLE_PAGE')} className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${examViewMode === 'SINGLE_PAGE' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary dark:text-white' : 'text-gray-500'}`}><LayoutList size={12}/> একটি করে</button><button onClick={() => setExamViewMode('ALL_AT_ONCE')} className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${examViewMode === 'ALL_AT_ONCE' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary dark:text-white' : 'text-gray-500'}`}><AlignJustify size={12}/> সব একসাথে</button></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="fixed bottom-[60px] md:bottom-0 left-0 md:left-64 right-0 p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-40 flex justify-between items-center transition-colors"><button onClick={handlePrevStep} className="text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2.5 rounded-xl text-xs md:text-sm transition-colors">{t('quiz_prev')}</button><button onClick={startCustomQuiz} className="bg-primary hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-2.5 md:px-8 md:py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95 text-xs md:text-sm"><Play fill="currentColor" size={14} className="md:w-4 md:h-4" /> <span className="md:hidden">Start</span><span className="hidden md:inline">{t('quiz_start')}</span></button></div>
      </div>
    );
  }

  if (currentStep === 'LOADING') {
    return (<div className="h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center p-6 transition-colors"><div className="relative"><div className="absolute inset-0 bg-primary/20 dark:bg-primary/40 rounded-full blur-xl animate-pulse"></div><Loader2 size={40} className="text-primary dark:text-blue-400 animate-spin relative z-10" /></div><h3 className="mt-6 text-base md:text-lg font-bold text-gray-800 dark:text-white">{t('common_loading')}</h3><p className="text-gray-500 dark:text-gray-400 mt-1 text-xs max-w-sm">প্রশ্ন তৈরি করা হচ্ছে...</p></div>);
  }

  return null;
};

export default QuizArena;
