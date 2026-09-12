
import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { generateQuizFromDB, fetchSyllabusStatsAPI, saveQuestionsToBankAPI } from '../services/api';
import { generateQuiz } from '../services/geminiService';
import { QuizQuestion, ExamStandard, QuizConfig, DifficultyLevel } from '../types';
import { SYLLABUS_DB, SyllabusItem, TopicNode } from '../services/syllabusData';
import { useToast } from './Toast';
import { normalizeBangla, uniqueByNormalization } from '../utils/normalization';
import { 
  Loader2, 
  Play, Check,
  ArrowRight, Atom, Calculator, Globe, Book, Beaker, Dna, 
  ChevronDown, ChevronUp,
  LayoutList, AlignJustify, Layers,
  Zap, BrainCircuit, Cpu, Languages, ChevronLeft,
  Clock, Target, CheckCircle2
} from 'lucide-react';

// --- SUBJECT GROUPING FOR UI (Question Bank Style) ---
const SUBJECT_GROUPS = [
  {
    name: 'Biology',
    display: 'জীববিজ্ঞান',
    subDisplay: 'Biology',
    icon: Dna,
    color: 'text-orange-700 dark:text-orange-400 bg-orange-100',
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
    color: 'text-orange-700 dark:text-orange-400 bg-orange-50',
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
    color: 'text-orange-700 dark:text-orange-400 bg-orange-100',
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
  const [examViewMode, setExamViewMode] = useState<ExamViewMode>('ALL_AT_ONCE');
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
        logger.error("Failed to load syllabus stats", err);
      }
    };
    loadStats();
  }, []);

  // 

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
          title: `ফ্ল্যাশ কার্ড: ${chapter}`,
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
      
      const normalizeText = (text: string) => {
          if (!text) return '';
          return normalizeBangla(text).replace(/[.,;:"'’|।]/g, '').replace(/\s+/g, '').toLowerCase();
      };

      // Case 1: Just a subject group (e.g., 'Physics')
      const groupMatch = SUBJECT_GROUPS.find(g => g.name === subjectKeyOrGroup);
      if (groupMatch && !chapter) {
          const papers = groupMatch.papers;
          return papers.reduce((sum, paperName) => {
              const paperNorm = normalizeText(paperName);
              // Sum up all variants for this paper
              let paperSum = 0;
              Object.keys(syllabusStats).forEach(k => {
                  if (normalizeText(k) === paperNorm) {
                      paperSum += syllabusStats[k]?.total || 0;
                  }
              });
              return sum + paperSum;
          }, 0);
      }

      // Case 2: Specific subject paper or chapter drilldown
      const subjectNorm = normalizeText(subjectKeyOrGroup);
      
      // Collect all paper data that matches this subject
      const matchingPaperKeys = Object.keys(syllabusStats).filter(k => normalizeText(k) === subjectNorm);
      if (matchingPaperKeys.length === 0) return 0;

      let totalCount = 0;

      matchingPaperKeys.forEach(paperKey => {
          const paperData = syllabusStats[paperKey];
          if (!chapter) {
              totalCount += paperData.total || 0;
              return;
          }

          const chapterNorm = normalizeText(chapter);
          if (paperData.chapters) {
              Object.keys(paperData.chapters).forEach(cKey => {
                  if (normalizeText(cKey) === chapterNorm) {
                      const chapterData = paperData.chapters[cKey];
                      if (!topic) {
                          totalCount += chapterData.total || 0;
                      } else {
                          const topicNorm = normalizeText(topic);
                          if (chapterData.topics) {
                              Object.keys(chapterData.topics).forEach(tKey => {
                                  if (normalizeText(tKey) === topicNorm) {
                                      totalCount += chapterData.topics[tKey] || 0;
                                  }
                              });
                          }
                      }
                  }
              });
          }
      });

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
    }, { replace: true });

    try {
        const { fetchUserMistakesAPI } = await import('../services/api');
        const mistakes = await fetchUserMistakesAPI(currentUser.uid);
        
        if (!mistakes || mistakes.length === 0) {
            showToast("আপনার কোনো ভুল প্রশ্নের রেকর্ড নেই", 'info');
            setSearchParams({ step: 'SELECTION' }, { replace: true });
            return;
        }

        // Map mistakes to QuizQuestion structure
        // The question object is stored in questionId field in the mistake record
        const qs: QuizQuestion[] = mistakes.map((m: any) => m.questionId || m.question || m);

        initiateQuizGeneration([], ExamStandard.HSC, qs.length, undefined, false, {
            questions: qs,
            title: 'ভুল প্রশ্ন প্র্যাকটিস',
            mode: 'ALL_AT_ONCE',
            timeLimit: 0,
            negativeMarking: 0,
            isPracticeMode: true
        });
    } catch (err) {
        logger.error("Failed to load mistakes", err);
        showToast("ভুল প্রশ্ন লোড করা যায়নি", 'error');
        setSearchParams({ step: 'SELECTION' }, { replace: true });
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
    }, { replace: true });

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
             }, { replace: true });
             return;
         }
      } else {
         // Fallback for any preset logic if needed in future (though feature removed)
         qs = await generateQuiz(configs, standard, count, difficulty);
         isAiGenerated = true;
      }
      
      if (!qs || qs.length === 0) throw new Error("No questions generated");

      // --- UNIQUE QUESTION FILTERING ---
      // Filter out duplicate questions that might come from multiple topics
      const seenQuestions = new Set<string>();
      const uniqueQs = qs.filter(q => {
          const key = q.id || q.question;
          if (seenQuestions.has(key)) return false;
          seenQuestions.add(key);
          return true;
      });
      
      // --- STIMULUS-AWARE SELECTION LOGIC ---
      // 1. Group questions by stimulus to prevent splitting them during shuffle/slice
      const groupedQs: Record<string, QuizQuestion[]> = {};
      const individualQs: QuizQuestion[] = [];

      uniqueQs.forEach(q => {
          const stimulusKey = q.contextText || q.contextImage || null;
          if (stimulusKey) {
              if (!groupedQs[stimulusKey]) groupedQs[stimulusKey] = [];
              groupedQs[stimulusKey].push(q);
          } else {
              individualQs.push(q);
          }
      });

      // 2. Shuffle groups and individuals separately
      const groups = Object.values(groupedQs).sort(() => 0.5 - Math.random());
      const singles = individualQs.sort(() => 0.5 - Math.random());

      // 3. Reconstruct list by interspersing groups and singles, then taking EXACTLY the count
      // This part ensures that if we take a stimulus, we take ALL questions under it.
      const finalQs: QuizQuestion[] = [];
      
      // First, prioritize groups if available, then fill with singles
      groups.forEach(group => {
          if (finalQs.length + group.length <= count) {
              finalQs.push(...group);
          }
      });

      // Fill remaining slots with individual questions
      singles.forEach(q => {
          if (finalQs.length < count) {
              finalQs.push(q);
          }
      });

      // If we still have room (unlikely if DB is large), take from leftover groups but slice them (last resort)
      if (finalQs.length < count) {
          groups.forEach(group => {
              if (finalQs.length < count) {
                  const needed = count - finalQs.length;
                  const alreadyIncluded = group.every(gq => finalQs.some(fq => fq.question === gq.question));
                  if (!alreadyIncluded) {
                      finalQs.push(...group.slice(0, needed));
                  }
              }
          });
      }

      qs = finalQs;
      
      if (isAiGenerated) saveQuestionsToBankAPI(qs).catch(e => logger.debug("Auto-harvest failed", e));

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
      logger.error(e);
      showToast("দুঃখিত, প্রশ্ন লোড করা যায়নি।", "error");
      setSearchParams(prev => {
        const newP = new URLSearchParams(prev);
        newP.set('step', 'TOPIC_CONFIG');
        return newP;
      }, { replace: true });
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
            mode: 'ALL_AT_ONCE',
            timeLimit: time,
            negativeMarking: 0.25,
            isPracticeMode: false // Model tests are exams
        });
    }
  }, [location.state]);

  // --- NAVIGATION HANDLERS ---
  const handleSubjectClick = (subjectName: string, paperName: string) => {
      setSearchParams({
          view: 'CHAPTER_DRILLDOWN',
          subject: subjectName,
          paper: paperName
      }, { replace: true });
  };

  const handleNextStep = () => {
      setSearchParams(prev => {
          const newP = new URLSearchParams(prev);
          newP.set('step', 'TOPIC_CONFIG');
          return newP;
      }, { replace: true });
  };

  const handlePrevStep = () => {
      setSearchParams(prev => {
          const newP = new URLSearchParams(prev);
          newP.set('step', 'SELECTION');
          return newP;
      }, { replace: true });
  };

  const handlePaperTabChange = (paper: string) => {
      setSearchParams(prev => {
          const newP = new URLSearchParams(prev);
          newP.set('paper', paper);
          return newP;
      }, { replace: true });
  };

  // --- VIEWS ---

  if (currentStep === 'SELECTION') {
    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-black overflow-hidden transition-colors relative">
        {/* Custom Header (Since global one is hidden) */}
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-100 dark:border-zinc-800 px-4 py-3 flex justify-between items-center sticky top-0 z-30 shrink-0">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => {
                        if (selectionView === 'CHAPTER_DRILLDOWN') {
                            setSearchParams(prev => {
                                const newP = new URLSearchParams(prev);
                                newP.delete('view');
                                newP.delete('subject');
                                newP.delete('paper');
                                return newP;
                            }, { replace: true });
                        } else {
                            navigate('/dashboard', { replace: true });
                        }
                    }} 
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors"
                >
                    <ChevronLeft size={20} strokeWidth={3}/>
                </button>
                <h1 className="text-base font-black text-gray-800 dark:text-white uppercase tracking-tight">
                    {selectionView === 'SUBJECT_GRID' ? 'Quiz Zone' : SUBJECT_GROUPS.find(g => g.name === activeSubjectGroup)?.display}
                </h1>
            </div>
            
            {selectionView === 'CHAPTER_DRILLDOWN' && !isRapidFire && (
                <button 
                    onClick={() => {
                        const paper = activePaperTab || SUBJECT_GROUPS.find(g => g.name === activeSubjectGroup)?.papers[0] || '';
                        if(paper) toggleAllInPaper(paper);
                    }}
                    className="text-[12px] font-black text-primary uppercase tracking-widest bg-orange-50 dark:bg-orange-950/20 px-3 py-1.5 rounded-full border border-orange-100 dark:border-orange-900/30"
                >
                    {isPaperFullySelected(activePaperTab || SUBJECT_GROUPS.find(g => g.name === activeSubjectGroup)?.papers[0] || '') ? 'Unselect All' : 'Select All'}
                </button>
            )}
        </div>

        {/* Background Ambient Glow */}
        <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-500/5 rounded-full blur-[120px]"></div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden md:flex md:flex-col relative z-10">
            
            <div className="flex-1 md:overflow-hidden md:flex md:flex-col">
                
                    <div className="h-full flex flex-col">
                        {selectionView === 'SUBJECT_GRID' ? (
                            <div className="overflow-y-auto p-4 md:p-8 pb-48 md:pb-48 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                                {SUBJECT_GROUPS.map((subject, idx) => {
                                    const selectedCount = getSelectedTopicCountForGroup(subject.papers);
                                    const availableCount = getStatsFor(subject.name);
                                    
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleSubjectClick(subject.name, subject.papers[0])}
                                            className={`relative bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 flex flex-col items-center justify-center gap-4 transition-all duration-500 group active:scale-[0.98] border-2 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] ${selectedCount > 0 ? 'border-primary ring-4 ring-primary/5 shadow-primary/10 scale-[1.02]' : 'border-gray-50 dark:border-zinc-800/50 hover:border-orange-100 dark:hover:border-orange-900/30'}`}
                                        >
                                            {!isRapidFire && selectedCount > 0 && (
                                                <div className="absolute -top-1 -right-1 bg-white dark:bg-zinc-900 p-1 rounded-full shadow-lg z-20">
                                                    <div className="bg-primary text-white text-[12px] font-black w-8 h-8 rounded-full flex items-center justify-center shadow-lg shadow-primary/30 animate-in zoom-in duration-500">
                                                        {selectedCount}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[2rem] flex items-center justify-center ${subject.color.split(' ')[1]} group-hover:scale-110 transition-all duration-500 shadow-inner group-hover:rotate-6`}>
                                                <subject.icon size={32} className={`${subject.color.split(' ')[0]} dark:text-white md:w-10 md:h-10`} strokeWidth={2.5} />
                                            </div>
                                            
                                            <div className="text-center w-full">
                                                <h3 className="font-black text-gray-900 dark:text-white text-sm md:text-xl tracking-tight leading-tight">
                                                    {subject.display}
                                                </h3>
                                                <p className="text-[12px] md:text-xs text-gray-400 dark:text-gray-500 mt-1 font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                                                    {subject.subDisplay}
                                                </p>
                                                
                                                <div className="mt-4 pt-4 border-t border-gray-50 dark:border-zinc-800/50 w-full flex items-center justify-center">
                                                    <span className={`text-[12px] md:text-xs font-black px-3 py-1 rounded-full bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-all`}>
                                                        {availableCount.toLocaleString()} Questions
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col h-full bg-white/50 dark:bg-black/50 backdrop-blur-sm shadow-inner rounded-t-[2.5rem] overflow-hidden">
                                
                                {/* Paper Selection Segmented Control */}
                                {(SUBJECT_GROUPS.find(g => g.name === activeSubjectGroup)?.papers.length || 0) > 1 && (
                                    <div className="px-4 py-3 bg-white/80 dark:bg-black/80 border-b border-gray-100 dark:border-zinc-800 backdrop-blur-md sticky top-0 z-20">
                                        <div className="flex p-1 bg-gray-100 dark:bg-zinc-900 rounded-xl">
                                            {SUBJECT_GROUPS.find(g => g.name === activeSubjectGroup)?.papers.map(paper => (
                                                <button
                                                    key={paper}
                                                    onClick={() => handlePaperTabChange(paper)}
                                                    className={`flex-1 py-1.5 px-3 text-[11px] font-black rounded-lg transition-all uppercase tracking-tighter ${
                                                        activePaperTab === paper 
                                                        ? 'bg-white dark:bg-gray-700 text-primary dark:text-orange-400 shadow-sm' 
                                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                                    }`}
                                                >
                                                    {paper.includes('1st') ? '১ম পত্র' : paper.includes('2nd') ? '২য় পত্র' : paper}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-60 custom-scrollbar">
                                    {(() => {
                                        const paperName = activePaperTab || SUBJECT_GROUPS.find(g => g.name === activeSubjectGroup)?.papers[0];
                                        if (!paperName) return null;
                                        
                                        const chapters = SYLLABUS_DB[paperName] ? Object.keys(SYLLABUS_DB[paperName]) : [];
                                        if (chapters.length === 0) return <div className="text-center text-gray-400 py-20 text-sm font-medium uppercase tracking-widest">No chapters available</div>;

                                        return (
                                            <div key={paperName} className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-3">
                                                {uniqueByNormalization(chapters).map((chapter, cIdx) => {
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

                                                    // Rapid Fire Mode Card (Compact Immersive Style)
                                                    if (isRapidFire) {
                                                        return (
                                                            <motion.button
                                                                key={cIdx}
                                                                whileTap={{ scale: 0.98 }}
                                                                onClick={() => handleStartRapidFire(paperName, chapter)}
                                                                className="w-full flex items-center justify-between p-4 rounded-3xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all group text-left"
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 group-hover:rotate-6 transition-all">
                                                                        <Layers size={20} strokeWidth={2.5} />
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-sm font-black text-gray-800 dark:text-white block tracking-tighter uppercase leading-tight">{chapter}</span>
                                                                        <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{chapQ} QUESTIONS</span>
                                                                    </div>
                                                                </div>
                                                                <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                                                    <Play size={14} fill="currentColor" strokeWidth={0}/>
                                                                </div>
                                                            </motion.button>
                                                        );
                                                    }

                                                    // Standard Selection Mode Card (Compact Style)
                                                    return (
                                                        <div key={cIdx} className={`rounded-3xl border transition-all duration-300 overflow-hidden ${isFullySelected || isPartiallySelected ? 'bg-orange-50/20 dark:bg-orange-950/20 border-primary/30 ring-2 ring-primary/5' : 'bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 shadow-sm'}`}>
                                                            <div className="flex items-center p-1.5">
                                                                <button
                                                                    onClick={() => toggleAllTopicsInChapter(paperName, chapter)}
                                                                    className="flex-1 flex items-center gap-4 p-3 text-left rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                                                                >
                                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all duration-300 shrink-0 ${isFullySelected ? 'bg-primary border-primary shadow-sm' : isPartiallySelected ? 'bg-white dark:bg-zinc-900 border-primary' : 'border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-zinc-900'}`}>
                                                                        {isFullySelected && <Check size={16} className="text-white" strokeWidth={4} />}
                                                                        {isPartiallySelected && <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <span className={`text-sm font-black block truncate whitespace-normal leading-tight uppercase tracking-tight ${isFullySelected || isPartiallySelected ? 'text-primary dark:text-orange-400' : 'text-gray-800 dark:text-white'}`}>
                                                                            {chapter}
                                                                        </span>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{chapQ} Q</span>
                                                                            {selectedTopics.length > 0 && (
                                                                                <span className="text-[9px] text-primary dark:text-orange-400 font-black bg-white dark:bg-zinc-900 px-2 py-0.5 rounded-full border border-orange-100 dark:border-orange-900/30">
                                                                                    {selectedTopics.length}/{totalItemsCount} SELECTED
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </button>
                                                                <button onClick={() => toggleChapterExpansion(chapKey)} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all mr-1.5 ${isExpanded ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-gray-700 text-gray-400'}`}>
                                                                    {isExpanded ? <ChevronUp size={18} strokeWidth={3}/> : <ChevronDown size={18} strokeWidth={3}/>}
                                                                </button>
                                                            </div>
                                                            
                                                            {isExpanded && (
                                                                <div className="px-4 pb-4 pt-1 animate-in slide-in-from-top-2 duration-300">
                                                                    <div className="grid grid-cols-1 gap-2 pl-4 border-l-2 border-gray-100 dark:border-zinc-800">
                                                                        {availableTopics.map((item, idx) => {
                                                                            if (typeof item === 'string') {
                                                                                const topic = item;
                                                                                const isTopicSelected = selectedTopics.includes(topic);
                                                                                const topicCount = getStatsFor(paperName, chapter, topic);
                                                                                return (
                                                                                    <label key={idx} className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border ${isTopicSelected ? 'bg-orange-50/50 dark:bg-orange-950/20 border-primary/10' : 'bg-white dark:bg-zinc-900 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                                                                                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${isTopicSelected ? 'bg-primary border-primary' : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-zinc-900'}`}>
                                                                                            {isTopicSelected && <Check size={12} className="text-white" strokeWidth={4} />}
                                                                                        </div>
                                                                                        <input type="checkbox" className="hidden" checked={isTopicSelected} onChange={() => toggleTopic(paperName, chapter, topic)} />
                                                                                        <span className={`text-[13px] font-bold flex-1 ${isTopicSelected ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{topic}</span>
                                                                                        {topicCount > 0 && (
                                                                                            <span className="text-[9px] font-black text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded-lg border border-gray-100 dark:border-gray-600">
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
                                                                                    <div key={idx} className={`rounded-2xl border transition-all ${isGroupFullySelected || isGroupPartiallySelected ? 'bg-white dark:bg-zinc-900 border-primary/20' : 'bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800'}`}>
                                                                                        <div className="flex items-center p-1.5">
                                                                                            <button onClick={() => toggleTopicGroup(paperName, chapter, item)} className="p-2 mr-1 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-xl transition-all">
                                                                                                <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${isGroupFullySelected ? 'bg-primary border-primary' : isGroupPartiallySelected ? 'border-primary' : 'border-gray-200 dark:border-gray-600'}`}>
                                                                                                    {isGroupFullySelected && <Check size={10} className="text-white" strokeWidth={4} />}
                                                                                                    {isGroupPartiallySelected && <div className="w-1.5 h-1.5 bg-primary rounded-full" />}
                                                                                                </div>
                                                                                            </button>
                                                                                            <button onClick={() => toggleTopicExpansion(topicKey)} className="flex-1 text-left flex justify-between items-center text-[13px] font-black text-gray-700 dark:text-gray-200 hover:text-primary transition-colors py-1.5">
                                                                                                <span className="uppercase tracking-tighter">{item.title}</span>
                                                                                                <div className={`p-1.5 rounded-lg transition-all ${isTopicExpanded ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-gray-700 text-gray-400'}`}>
                                                                                                    {isTopicExpanded ? <ChevronUp size={14} strokeWidth={3}/> : <ChevronDown size={14} strokeWidth={3}/>}
                                                                                                </div>
                                                                                            </button>
                                                                                        </div>
                                                                                        {isTopicExpanded && (
                                                                                            <div className="p-3 pt-0 space-y-1.5 animate-in slide-in-from-top-2">
                                                                                                {item.subTopics.map((sub, sIdx) => {
                                                                                                    const isSubSelected = selectedTopics.includes(sub);
                                                                                                    return (
                                                                                                        <label key={sIdx} className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border ${isSubSelected ? 'bg-orange-50/50 dark:bg-orange-950/10 border-primary/10' : 'bg-gray-50/30 dark:bg-gray-700/30 border-transparent hover:bg-white dark:hover:bg-gray-700'}`}>
                                                                                                            <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${isSubSelected ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600'}`}>
                                                                                                                {isSubSelected && <Check size={10} className="text-white" strokeWidth={4} />}
                                                                                                            </div>
                                                                                                            <input type="checkbox" className="hidden" checked={isSubSelected} onChange={() => toggleTopic(paperName, chapter, sub)} />
                                                                                                            <span className={`text-[12px] font-bold ${isSubSelected ? 'text-gray-800 dark:text-white' : 'text-gray-500'}`}>{sub}</span>
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
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-black/90 backdrop-blur-2xl border-t border-gray-100 dark:border-zinc-800 z-50">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 relative">
                    <div className="absolute inset-y-0 left-0 bg-primary/5 transition-all duration-700 pointer-events-none rounded-xl" style={{ width: `${Math.min(100, (Object.values(topicSelection).flat().length / 50) * 100)}%` }}></div>
                    
                    <div className="flex flex-col justify-center shrink-0 w-24">
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">নির্বাচিত টপিক</p>
                        <p className="text-2xl font-black text-gray-800 dark:text-white leading-none">{Object.values(topicSelection).flat().length}</p>
                    </div>
                    
                    <div className="flex-1 max-w-sm">
                        <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                if(Object.values(topicSelection).flat().length === 0) {
                                    showToast("অনুগ্রহ করে অন্তত একটি টপিক সিলেক্ট করুন", "warning");
                                    return;
                                }
                                handleNextStep(); 
                            }} 
                            disabled={Object.values(topicSelection).flat().length === 0} 
                            className="w-full bg-primary hover:bg-orange-700 text-white py-3.5 px-6 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-30 disabled:grayscale transition-all shadow-md group"
                        >
                            <span>পরবর্তী ধাপ</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                        </motion.button>
                    </div>
                </div>
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

    // Settings Step UI Redesign
    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-black transition-colors relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-[100px]"></div>
        </div>

        {/* Header */}
        <div className="px-4 py-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-100 dark:border-zinc-800 relative z-30 flex items-center justify-between shrink-0">
            <button onClick={handlePrevStep} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 transition-all">
                <ChevronLeft size={20} strokeWidth={3}/>
            </button>
            <h2 className="text-base font-black text-gray-800 dark:text-white uppercase tracking-tight">
                {"পরীক্ষার সেটিংস"}
            </h2>
            <div className="w-10"></div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-48 relative z-10 custom-scrollbar">
            <div className="max-w-2xl mx-auto space-y-4">
                
                {/* Settings Grid */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-5 space-y-6 shadow-sm">
                    
                    {/* Question Count Slider */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Layers size={16} className="text-primary" />
                                <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                    {"প্রশ্ন সংখ্যা"}
                                </label>
                            </div>
                            <span className="text-sm font-black text-primary dark:text-orange-400 bg-orange-50 dark:bg-black px-3 py-1 rounded-full border border-orange-100 dark:border-orange-900/30">
                                {questionCount} Quality Questions
                            </span>
                        </div>
                        <input 
                            type="range" 
                            min="5" 
                            max="50" 
                            step="5" 
                            value={questionCount} 
                            onChange={(e) => setQuestionCount(parseInt(e.target.value))} 
                            className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-[12px] font-black text-gray-400 px-1">
                            <span>05</span>
                            <span>50</span>
                        </div>
                    </div>

                    <div className="h-px bg-gray-50 dark:bg-gray-700/50"></div>

                    {/* Time & Negative Marking */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Clock size={14} className="text-gray-400" />
                                <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest">সময়</label>
                            </div>
                            <div className="relative">
                                <select 
                                    value={timeLimit} 
                                    onChange={(e) => setTimeLimit(parseInt(e.target.value))} 
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-[13px] font-black text-gray-800 dark:text-white appearance-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                >
                                    <option value="0">আনলিমিটেড</option>
                                    <option value="5">৫ মিনিট</option>
                                    <option value="10">১০ মিনিট</option>
                                    <option value="15">১৫ মিনিট</option>
                                    <option value="20">২০ মিনিট</option>
                                    <option value="30">৩০ মিনিট</option>
                                    <option value="60">১ ঘণ্টা</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Target size={14} className="text-gray-400" />
                                <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest">নেগেটিভ</label>
                            </div>
                            <div className="relative">
                                <select 
                                    value={negativeMarking} 
                                    onChange={(e) => setNegativeMarking(parseFloat(e.target.value))} 
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border-none rounded-2xl text-[13px] font-black text-gray-800 dark:text-white appearance-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                >
                                    <option value="0">নেই</option>
                                    <option value="0.25">০.২৫</option>
                                    <option value="0.50">০.৫০</option>
                                    <option value="1.00">১.০০</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-50 dark:bg-gray-700/50"></div>

                    {/* View Mode */}
                    <div className="space-y-3">
                        <label className="text-[12px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            {"ভিউ মোড"}
                        </label>
                        <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-700/50 p-1.5 rounded-2xl">
                            <button 
                                onClick={() => setExamViewMode('SINGLE_PAGE')} 
                                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-[11px] font-black transition-all uppercase tracking-tighter ${examViewMode === 'SINGLE_PAGE' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary' : 'text-gray-500'}`}
                            >
                                <LayoutList size={14}/> একটি করে
                            </button>
                            <button 
                                onClick={() => setExamViewMode('ALL_AT_ONCE')} 
                                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-[11px] font-black transition-all uppercase tracking-tighter ${examViewMode === 'ALL_AT_ONCE' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary' : 'text-gray-500'}`}
                            >
                                <AlignJustify size={14}/> সব একসাথে
                            </button>
                        </div>
                    </div>
                </div>

                {/* Selection Summary */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-5 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-green-500" />
                            <h3 className="font-black text-gray-800 dark:text-white text-[11px] uppercase tracking-widest">
                                নির্বাচিত টপিকসমূহ
                            </h3>
                         </div>
                         <button onClick={() => setIsReviewExpanded(!isReviewExpanded)} className="text-[12px] font-black text-primary uppercase tracking-tighter bg-primary/5 px-2 py-1 rounded-lg">
                            {isReviewExpanded ? 'Hide' : 'Review'}
                         </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {Object.keys(groupedSelection).map(subject => (
                            <span key={subject} className="px-2.5 py-1 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-[9px] font-black rounded-lg uppercase tracking-tight border border-gray-100 dark:border-gray-600">
                                {subject}
                            </span>
                        ))}
                    </div>

                    {isReviewExpanded && (
                        <div className="pt-2 space-y-3 max-h-60 overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2 duration-300">
                            {Object.entries(groupedSelection).map(([subject, chapters]) => (
                                <div key={subject} className="space-y-2">
                                    <div className="flex items-center gap-2 px-1">
                                        <div className="w-1 h-3 bg-primary rounded-full"></div>
                                        <p className="text-[12px] font-black text-gray-800 dark:text-white uppercase tracking-tighter">{subject}</p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-1.5">
                                        {Object.entries(chapters).map(([chapter, topics]) => (
                                            <div key={chapter} className="bg-gray-50/50 dark:bg-gray-700/30 p-2.5 rounded-2xl border border-gray-100 dark:border-zinc-800">
                                                <p className="text-[11px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-tighter leading-tight mb-1">{chapter}</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {topics.map(t => (
                                                        <span key={t} className="text-[9px] text-gray-500 font-bold bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded-md border border-gray-100 dark:border-zinc-800">{t}</span>
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

            </div>
        </div>

        {/* Start Button - Sticky Bottom */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-gray-100 dark:border-zinc-800 z-40">
             <div className="max-w-2xl mx-auto flex items-center gap-4">
                <div className="shrink-0 flex flex-col justify-center">
                    <p className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">TOTAL QUESTIONS</p>
                    <p className="text-2xl font-black text-gray-800 dark:text-white tracking-tighter">{questionCount}</p>
                </div>
                <button 
                    onClick={startCustomQuiz} 
                    className="flex-1 bg-primary hover:bg-orange-700 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg shadow-primary/20 active:scale-95 transition-all uppercase tracking-widest text-sm"
                >
                    <span>{"মক টেস্ট শুরু করুন"}</span>
                    <Play fill="currentColor" size={16} strokeWidth={0}/>
                </button>
            </div>
        </div>
      </div>
    );
  }

  // LOADING STEP
  if (currentStep === 'LOADING') {
    return (
        <div className="h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-black text-center p-6 transition-colors relative overflow-hidden">
            {/* Background Ambient Glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-primary/5 rounded-full blur-[100px] animate-pulse"></div>
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-primary/30 dark:bg-orange-500/30 rounded-full blur-2xl animate-pulse"></div>
                    <div className="relative bg-white dark:bg-zinc-900 p-6 rounded-full shadow-xl border border-gray-100 dark:border-white/10">
                        <Loader2 size={48} className="text-primary dark:text-orange-400 animate-spin" strokeWidth={2.5} />
                    </div>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white mb-2 tracking-tight">
                    {"লোড হচ্ছে..."}
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
