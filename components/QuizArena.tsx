
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateQuizFromDB, fetchSyllabusStatsAPI, saveQuestionsToBankAPI, saveQuestionAPI, unsaveQuestionAPI, saveExamResultAPI, updateQuestProgressAPI, fetchQuestionsByExamRefAPI } from '../services/api';
import { generateQuiz } from '../services/geminiService';
import { QuizQuestion, ExamStandard, QuizConfig, DifficultyLevel } from '../types';
import { SYLLABUS_DB } from '../services/syllabusData';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from './Toast';
import Confetti from './Confetti'; 
import { 
  Loader2, CheckCircle, XCircle, RefreshCw, Trophy, 
  Clock, Play, Settings, BookOpen, ChevronRight, Check,
  ArrowRight, Atom, Activity, Calculator, Globe, Book, Beaker, Dna, 
  Library, ChevronDown, ChevronUp, Layers, MousePointer2, CheckSquare,
  AlertTriangle, FileText, LayoutList, AlignJustify, GraduationCap, Flame, HelpCircle, Database,
  Filter, Home, MinusCircle, PieChart as PieChartIcon, Bookmark, Archive, Zap, Eye, LayoutGrid, Download, X,
  BrainCircuit, Cpu, Languages, Stethoscope, PlusCircle, CheckCircle2, ListChecks
} from 'lucide-react';

// --- PRESET DATABASE ---
interface Preset {
  id: string;
  title: string;
  subtitle: string;
  standard: ExamStandard;
  duration: number; // minutes
  negativeMark: number;
  distribution: { subject: string; count: number }[];
  totalMarks: number;
  color: string;
}

const PRESET_DB: Preset[] = [
  {
    id: 'medical',
    title: 'মেডিকেল ভর্তি পরীক্ষা',
    subtitle: 'মেডিকেল ভর্তি পরীক্ষা (পূর্ণাঙ্গ)',
    standard: ExamStandard.MEDICAL,
    duration: 60,
    negativeMark: 0.25,
    totalMarks: 100,
    color: 'bg-green-100 text-green-700 border-green-300',
    distribution: [
      { subject: 'Biology', count: 30 },
      { subject: 'Chemistry', count: 25 },
      { subject: 'Physics', count: 20 },
      { subject: 'English', count: 15 },
      { subject: 'General Knowledge', count: 10 }
    ]
  },
  {
    id: 'du_a',
    title: 'ঢাকা বিশ্ববিদ্যালয় (ক-ইউনিট)',
    subtitle: 'ক-ইউনিট ভর্তি পরীক্ষা',
    standard: ExamStandard.VARSITY,
    duration: 60,
    negativeMark: 0.25,
    totalMarks: 100,
    color: 'bg-red-100 text-red-700 border-red-300',
    distribution: [
      { subject: 'Physics', count: 25 },
      { subject: 'Chemistry', count: 25 },
      { subject: 'Higher Math', count: 25 },
      { subject: 'Biology', count: 25 }
    ]
  },
  {
    id: 'engineering',
    title: 'ইঞ্জিনিয়ারিং (BUET/CKRUET)',
    subtitle: 'ইঞ্জিনিয়ারিং প্রিলি স্ট্যান্ডার্ড',
    standard: ExamStandard.ENGINEERING,
    duration: 60,
    negativeMark: 0.50,
    totalMarks: 100, 
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    distribution: [
      { subject: 'Physics', count: 35 },
      { subject: 'Chemistry', count: 35 },
      { subject: 'Higher Math', count: 30 }
    ]
  },
  {
    id: 'gst',
    title: 'GST (গুচ্ছ)',
    subtitle: 'সমন্বিত ভর্তি পরীক্ষা',
    standard: ExamStandard.VARSITY,
    duration: 60,
    negativeMark: 0.25,
    totalMarks: 100,
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    distribution: [
      { subject: 'Physics', count: 25 },
      { subject: 'Chemistry', count: 25 },
      { subject: 'Higher Math', count: 25 },
      { subject: 'Biology', count: 25 }
    ]
  }
];

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

type QuizStep = 'SELECTION' | 'LOADING' | 'EXAM' | 'RESULT';
type ExamViewMode = 'SINGLE_PAGE' | 'ALL_AT_ONCE';
type TabMode = 'CUSTOM' | 'PRESET' | 'MISTAKE_REVISION';
// New View State for Custom Selection
type SelectionView = 'SUBJECT_GRID' | 'CHAPTER_DRILLDOWN';

const QuizArena: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  
  // --- STATE ---
  const [step, setStep] = useState<QuizStep>('SELECTION');
  const [tabMode, setTabMode] = useState<TabMode>('CUSTOM');
  
  // Custom Selection Logic
  const [selectionView, setSelectionView] = useState<SelectionView>('SUBJECT_GRID');
  const [activeSubjectGroup, setActiveSubjectGroup] = useState<string | null>(null);
  const [expandedChapterIds, setExpandedChapterIds] = useState<Set<string>>(new Set());
  
  const [topicSelection, setTopicSelection] = useState<Record<string, string[]>>({});
  
  // Config State (Custom)
  const [examStandard, setExamStandard] = useState<ExamStandard>(ExamStandard.HSC);
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState<number>(0);
  const [negativeMarking, setNegativeMarking] = useState<number>(0);
  const [examViewMode, setExamViewMode] = useState<ExamViewMode>('SINGLE_PAGE');
  const [isPracticeMode, setIsPracticeMode] = useState(false);

  // Preset State
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  
  // Exam State
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(0); 
  const [examDuration, setExamDuration] = useState(0);
  const [customTitle, setCustomTitle] = useState<string | undefined>(undefined);
  
  // Saved Questions State
  const [savedQuestionIndices, setSavedQuestionIndices] = useState<Set<number>>(new Set());

  // Result View Filter
  const [reviewFilter, setReviewFilter] = useState<'ALL' | 'CORRECT' | 'WRONG' | 'SKIPPED'>('ALL');

  // DB Stats State
  const [syllabusStats, setSyllabusStats] = useState<any>(null);
  
  // Micro-interaction State
  const [showConfetti, setShowConfetti] = useState(false);
  const [animatingOption, setAnimatingOption] = useState<number | null>(null);
  const [shakeIndex, setShakeIndex] = useState<number | null>(null);

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

    const mistakeConfig = localStorage.getItem('mistake_exam_config');
    if (mistakeConfig) {
        const parsedConfig = JSON.parse(mistakeConfig);
        const parsedQuestions = parsedConfig.questions;
        if (parsedQuestions && parsedQuestions.length > 0) {
            setTabMode('MISTAKE_REVISION');
            setQuestions(parsedQuestions);
            setUserAnswers(new Array(parsedQuestions.length).fill(null));
            setCurrentQIndex(0);
            setTimeLimit(parsedConfig.time || 0);
            setTimeLeft(parsedConfig.time ? parsedConfig.time * 60 : 0);
            setExamViewMode(parsedConfig.mode || 'SINGLE_PAGE');
            setNegativeMarking(0);
            setIsPracticeMode(true);
            setCustomTitle('ভুল থেকে শিক্ষা (Mistake Revision)');
            setStep('EXAM');
            localStorage.removeItem('mistake_exam_config');
        }
    }

    const launchConfig = localStorage.getItem('quiz_launch_config');
    if (launchConfig) {
        const config = JSON.parse(launchConfig);
        
        // Scenario 1: Questions are already present
        if (config.questions && config.questions.length > 0) {
            startConfiguredExam(config, config.questions);
        } 
        // Scenario 2: Questions need to be fetched (e.g. Past Paper by ID)
        else if (config.type === 'PAST_PAPER' && config.examRef) {
            fetchAndStartExam(config);
        }
        
        localStorage.removeItem('quiz_launch_config');
    }
  }, []);

  const fetchAndStartExam = async (config: any) => {
      setStep('LOADING');
      try {
          const questions = await fetchQuestionsByExamRefAPI(config.examRef);
          if (questions && questions.length > 0) {
              startConfiguredExam(config, questions);
          } else {
              showToast("দুঃখিত, এই সালের প্রশ্ন এখনও ডাটাবেজে নেই।", "warning");
              setStep('SELECTION');
          }
      } catch (e) {
          console.error(e);
          showToast("প্রশ্ন লোড করা যাচ্ছে না।", "error");
          setStep('SELECTION');
      }
  };

  const startConfiguredExam = (config: any, qs: QuizQuestion[]) => {
      setQuestions(qs);
      setUserAnswers(new Array(qs.length).fill(null));
      setCurrentQIndex(0);
      setTimeLimit(config.time || 0);
      setTimeLeft(config.time ? config.time * 60 : 0);
      setExamViewMode(config.mode || 'ALL_AT_ONCE');
      setNegativeMarking(0.25);
      setIsPracticeMode(config.type === 'PRACTICE');
      setCustomTitle(config.title);
      setStep('EXAM');
  };

  const resetAll = () => {
    setStep('SELECTION');
    setTabMode('CUSTOM');
    setSelectionView('SUBJECT_GRID');
    setTopicSelection({});
    setQuestions([]);
    setUserAnswers([]);
    setTimeLeft(0);
    setExamDuration(0);
    setSelectedPreset(null);
    setShowSubmitModal(false);
    setReviewFilter('ALL');
    setSavedQuestionIndices(new Set());
    setIsPracticeMode(false);
    setShowMobileNav(false);
    setCustomTitle(undefined);
    setShowConfetti(false);
  };

  const goHome = () => {
    navigate('/dashboard');
  };

  // Helper to normalize strings for comparison (Aggressive normalization for deduplication)
  const normalizeText = (text: string) => {
      if (!text) return '';
      return text
          .normalize('NFC')
          .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero width chars
          .replace(/[\s\t\n\r]/g, '') // Remove all whitespace
          .replace(/[.,;:"'’|।]/g, '') // Remove punctuation
          .toLowerCase();
  };

  // --- Dynamic Topic Helper ---
  const getTopicsForChapter = (subject: string, chapter: string) => {
      const staticTopics = SYLLABUS_DB[subject]?.[chapter] || [];
      let dynamicTopics: string[] = [];
      
      // Attempt to find dynamic topics even if chapter name has slight mismatch
      let chapterData = syllabusStats?.[subject]?.chapters?.[chapter];
      if (!chapterData && syllabusStats?.[subject]?.chapters) {
          // Fuzzy search for chapter
          const normChapter = normalizeText(chapter);
          const matchedChapterKey = Object.keys(syllabusStats[subject].chapters).find(k => normalizeText(k) === normChapter);
          if (matchedChapterKey) {
              chapterData = syllabusStats[subject].chapters[matchedChapterKey];
          }
      }

      if (chapterData?.topics) {
          dynamicTopics = Object.keys(chapterData.topics);
      }
      
      // Smart Merge: Deduplicate based on normalized text
      const topicMap = new Map<string, string>();
      
      // 1. Add Static Topics (Priority for display name)
      staticTopics.forEach(t => topicMap.set(normalizeText(t), t));
      
      // 2. Add Dynamic Topics only if normalized key doesn't exist
      dynamicTopics.forEach(t => {
          const norm = normalizeText(t);
          if (!topicMap.has(norm)) {
              topicMap.set(norm, t);
          }
      });
      
      return Array.from(topicMap.values());
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
    const allTopics = getTopicsForChapter(subject, chapter); 
    setTopicSelection(prev => {
      const current = prev[key] || [];
      // If ANY topic is unselected, select all. If ALL are selected, deselect all.
      // Logic change: Click body to select all if not fully selected. If fully selected, deselect.
      
      if (current.length === allTopics.length) {
         const newState = { ...prev };
         delete newState[key];
         return newState;
      } else {
         return { ...prev, [key]: [...allTopics] };
      }
    });
  };

  const toggleChapterExpansion = (chapterKey: string) => {
      setExpandedChapterIds(prev => {
          const newSet = new Set(prev);
          if (newSet.has(chapterKey)) {
              newSet.delete(chapterKey);
          } else {
              newSet.add(chapterKey);
          }
          return newSet;
      });
  };

  // --- Stats Helper for Group or Paper ---
  const getStatsFor = (subjectKeyOrGroup: string, chapter?: string, topic?: string) => {
      // Check if it's a group name
      const group = SUBJECT_GROUPS.find(g => g.name === subjectKeyOrGroup);
      
      if (!syllabusStats) return 0;

      if (group && !chapter) {
          // Aggregate total for the group
          return group.papers.reduce((sum, paper) => {
              return sum + (syllabusStats[paper]?.total || 0);
          }, 0);
      }

      // Existing logic for specific paper
      if (!syllabusStats[subjectKeyOrGroup]) return 0;
      if (!chapter) return syllabusStats[subjectKeyOrGroup].total || 0;
      
      // Fuzzy match chapter
      let chapterData = syllabusStats[subjectKeyOrGroup].chapters?.[chapter];
      if (!chapterData && syllabusStats[subjectKeyOrGroup].chapters) {
          const normChapter = normalizeText(chapter);
          const matchedKey = Object.keys(syllabusStats[subjectKeyOrGroup].chapters).find(k => normalizeText(k) === normChapter);
          if (matchedKey) chapterData = syllabusStats[subjectKeyOrGroup].chapters[matchedKey];
      }

      if (!chapterData) return 0;
      if (!topic) return chapterData.total || 0;
      
      // Topic Level Stats - Smart Aggregation
      // Sum up counts for all DB topics that normalize to the same string
      const normTopic = normalizeText(topic);
      let totalCount = 0;
      if (chapterData.topics) {
          Object.keys(chapterData.topics).forEach(dbTopic => {
              if (normalizeText(dbTopic) === normTopic) {
                  totalCount += chapterData.topics[dbTopic];
              }
          });
      }
      
      return totalCount;
  };

  // Helper to count selected topics for a Subject Group
  const getSelectedTopicCountForGroup = (papers: string[]) => {
      let count = 0;
      Object.keys(topicSelection).forEach(key => {
          // Check if key starts with any paper name from the group
          // Key format: "Paper Name-Chapter Name"
          for (const paper of papers) {
              if (key.startsWith(paper + '-')) {
                  count += topicSelection[key].length;
                  break; // Found the paper, move to next key
              }
          }
      });
      return count;
  };

  // --- QUIZ START LOGIC ---

  const startCustomQuiz = async () => {
    // Generate config from topicSelection
    const configs: QuizConfig[] = [];
    
    const allSubjects = Object.keys(SYLLABUS_DB);
    for (const subject of allSubjects) {
        for (const chapter of Object.keys(SYLLABUS_DB[subject])) {
            const key = `${subject}-${chapter}`;
            if (topicSelection[key] && topicSelection[key].length > 0) {
                configs.push({
                    subject,
                    chapter,
                    topics: topicSelection[key]
                });
            }
        }
    }

    if (configs.length === 0) {
        showToast("অনুগ্রহ করে অন্তত একটি টপিক সিলেক্ট করুন", 'warning');
        return;
    }
    
    if (timeLimit > 0) {
      setTimeLeft(timeLimit * 60);
    } else {
      setTimeLeft(0);
    }
    
    initiateQuizGeneration(configs, examStandard, questionCount);
  };

  const startPresetQuiz = async (difficulty: DifficultyLevel) => {
    if (!selectedPreset) return;
    setShowDifficultyModal(false);

    const configs: QuizConfig[] = selectedPreset.distribution.map(dist => ({
      subject: dist.subject,
      chapter: 'Full Syllabus',
      topics: ['পূর্ণাঙ্গ প্রস্তুতি (Full Syllabus)'],
      questionCount: dist.count
    }));

    setTimeLimit(selectedPreset.duration);
    setNegativeMarking(selectedPreset.negativeMark);
    setExamStandard(selectedPreset.standard);
    setExamViewMode('ALL_AT_ONCE'); 
    setIsPracticeMode(false); 
    
    setTimeLeft(selectedPreset.duration * 60);

    initiateQuizGeneration(configs, selectedPreset.standard, selectedPreset.totalMarks, difficulty, true);
  };

  const initiateQuizGeneration = async (configs: QuizConfig[], standard: ExamStandard, count: number, difficulty?: DifficultyLevel, isPreset = false) => {
    setStep('LOADING');
    try {
      let qs: QuizQuestion[] = [];
      let isAiGenerated = false;

      if (!isPreset && tabMode === 'CUSTOM') {
         const allPromises = configs.map(cfg => 
            generateQuizFromDB({
                subject: cfg.subject,
                chapter: cfg.chapter,
                topics: cfg.topics,
                count: Math.ceil(count / configs.length)
            })
         );
         
         const results = await Promise.all(allPromises);
         qs = results.flat();
         
         if (qs.length === 0) {
             console.log("DB returned 0 questions, falling back to AI.");
             qs = await generateQuiz(configs, standard, count, difficulty);
             isAiGenerated = true;
         }
      } else {
         qs = await generateQuiz(configs, standard, count, difficulty);
         isAiGenerated = true;
      }

      if (!qs || qs.length === 0) throw new Error("No questions generated");
      
      qs = qs.sort(() => 0.5 - Math.random()).slice(0, count);
      
      if (isAiGenerated) {
         saveQuestionsToBankAPI(qs).catch(e => console.log("Auto-harvest failed", e));
      }

      setQuestions(qs);
      setUserAnswers(new Array(qs.length).fill(null));
      setCurrentQIndex(0);
      
      setExamDuration(0);
      setStep('EXAM');
    } catch (e) {
      console.error(e);
      showToast("দুঃখিত, প্রশ্ন লোড করা যায়নি। সার্ভার ব্যস্ত থাকতে পারে।", "error");
      setStep('SELECTION');
    }
  };

  const submitExam = async () => {
    setShowSubmitModal(false);
    setStep('RESULT');

    const correctCount = userAnswers.filter((ans, idx) => ans === questions[idx]?.correctAnswerIndex).length;
    const wrongCount = userAnswers.filter((ans, idx) => ans !== null && ans !== questions[idx]?.correctAnswerIndex).length;
    const skippedCount = questions.length - (correctCount + wrongCount);
    const penalty = wrongCount * negativeMarking;
    const rawScore = correctCount - penalty;
    const finalScore = Math.max(0, rawScore);
    const percentage = Math.round((finalScore / questions.length) * 100);
    
    if (percentage >= 90) {
        setShowConfetti(true);
    }

    const lastExamData = {
        subject: customTitle || questions[0]?.subject || 'Mixed Quiz',
        score: finalScore,
        totalQuestions: questions.length,
        percentage: percentage,
        date: Date.now()
    };
    localStorage.setItem('dopamine_last_exam', JSON.stringify(lastExamData));

    const topicStats: { [topic: string]: { correct: number, total: number } } = {};
    const mistakes: QuizQuestion[] = [];
    
    questions.forEach((q, idx) => {
        const topic = q.topic || 'General';
        if (!topicStats[topic]) topicStats[topic] = { correct: 0, total: 0 };
        topicStats[topic].total += 1;
        
        if (userAnswers[idx] === q.correctAnswerIndex) {
            topicStats[topic].correct += 1;
        } else if (userAnswers[idx] !== null) {
            mistakes.push(q);
        }
    });

    const topicStatsArray = Object.keys(topicStats).map(t => ({
        topic: t,
        correct: topicStats[t].correct,
        total: topicStats[t].total
    }));

    if (currentUser) {
        try {
            await saveExamResultAPI(currentUser.uid, {
                subject: questions[0]?.subject || 'General', 
                totalQuestions: questions.length,
                correct: correctCount,
                wrong: wrongCount,
                skipped: skippedCount,
                score: finalScore,
                topicStats: topicStatsArray,
                mistakes: mistakes
            });
            
            updateQuestProgressAPI(currentUser.uid, 'EXAM_COMPLETE', 1);
            if (percentage >= 80) {
                updateQuestProgressAPI(currentUser.uid, 'HIGH_SCORE', 1);
            }
            showToast("ফলাফল সংরক্ষণ করা হয়েছে", "success");
        } catch (e) {
            console.error("Failed to save result", e);
            showToast("ফলাফল সংরক্ষণ ব্যর্থ হয়েছে", "warning");
        }
    }
  };

  const toggleSaveQuestion = async (index: number) => {
    if (!currentUser) {
      showToast("প্রশ্ন সেভ করতে লগইন করুন", "warning");
      return;
    }
    
    const newSet = new Set(savedQuestionIndices);
    try {
      const q = questions[index];
      if (!(q as any)._id) return;

      if (newSet.has(index)) {
        newSet.delete(index);
        setSavedQuestionIndices(newSet);
        await unsaveQuestionAPI(currentUser.uid, (q as any)._id);
        showToast("বুকমার্ক রিমুভ করা হয়েছে", "info");
      } else {
        newSet.add(index);
        setSavedQuestionIndices(newSet);
        await saveQuestionAPI(currentUser.uid, (q as any)._id);
        updateQuestProgressAPI(currentUser.uid, 'SAVE_QUESTION', 1);
        showToast("প্রশ্নটি বুকমার্ক করা হয়েছে", "success");
      }
    } catch (e) {
      console.error("Failed to update save status", e);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      setSavedQuestionIndices(newSet);
      showToast("বুকমার্ক আপডেট করতে সমস্যা হয়েছে", "error");
    }
  };

  const handleOptionSelect = (qIndex: number, optionIndex: number) => {
      if (isPracticeMode && userAnswers[qIndex] !== null) return;
      
      const newAns = [...userAnswers];
      newAns[qIndex] = optionIndex;
      setUserAnswers(newAns);
      
      setAnimatingOption(optionIndex);
      setTimeout(() => setAnimatingOption(null), 300);

      if (isPracticeMode) {
          const isCorrect = optionIndex === questions[qIndex].correctAnswerIndex;
          if (!isCorrect) {
              setShakeIndex(optionIndex);
              setTimeout(() => setShakeIndex(null), 500);
          }
      }
  };

  useEffect(() => {
    let interval: any;
    if (step === 'EXAM' && (!isPracticeMode || timeLimit > 0)) {
      interval = setInterval(() => {
        setExamDuration(prev => prev + 1);
        if (timeLimit > 0) {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              submitExam();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timeLimit, isPracticeMode]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getSubjectIcon = (subject: string) => {
    if (subject.includes('Physics')) return <Atom size={18} className="text-purple-600 dark:text-purple-400" />;
    if (subject.includes('Chemistry')) return <Beaker size={18} className="text-orange-600 dark:text-orange-400" />;
    if (subject.includes('Math')) return <Calculator size={18} className="text-blue-600 dark:text-blue-400" />;
    if (subject.includes('Biology')) return <Dna size={18} className="text-green-600 dark:text-green-400" />;
    if (subject.includes('English') || subject.includes('Bangla')) return <Book size={18} className="text-pink-600 dark:text-pink-400" />;
    if (subject.includes('ICT')) return <Activity size={18} className="text-teal-600 dark:text-teal-400" />;
    if (subject.includes('IQ') || subject.includes('Mental')) return <BrainCircuit size={18} className="text-pink-600 dark:text-pink-400" />;
    return <Globe size={18} className="text-gray-600 dark:text-gray-400" />;
  };

  const renderStatsBadge = (count: number) => {
      return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-1 rounded text-[9px] font-medium bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
              <Database size={10} className="opacity-60" /> 
              {count}
          </span>
      );
  };

  const handleDownloadPDF = () => {
    const correctCount = userAnswers.filter((ans, idx) => ans === questions[idx]?.correctAnswerIndex).length;
    const wrongCount = userAnswers.filter((ans, idx) => ans !== null && ans !== questions[idx]?.correctAnswerIndex).length;
    const score = Math.max(0, correctCount - (wrongCount * negativeMarking));

    const htmlContent = `
      <html>
      <head>
        <title>Exam Result - Dhrubok</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          .q-container { margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          .correct { color: green; font-weight: bold; }
          .wrong { color: red; }
        </style>
      </head>
      <body>
        <h1>Exam Report</h1>
        <p>Score: ${score.toFixed(2)} / ${questions.length}</p>
        ${questions.map((q, i) => `
          <div class="q-container">
            <p><strong>${i+1}. ${q.question}</strong></p>
            <p>Your Answer: ${userAnswers[i] !== null ? q.options[userAnswers[i]!] : 'Skipped'}</p>
            <p class="correct">Correct: ${q.options[q.correctAnswerIndex]}</p>
          </div>
        `).join('')}
      </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  const renderBreadcrumbs = () => (
    <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 dark:text-gray-400 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
       <button onClick={resetAll} className="hover:text-primary dark:hover:text-blue-400 font-bold flex items-center gap-1">
         <Library size={14} /> {t('nav_quiz')}
       </button>
       <ChevronRight size={12} />
       <span className={step === 'SELECTION' ? 'text-primary dark:text-blue-400 font-bold' : ''}>
         {tabMode === 'CUSTOM' ? t('quiz_custom') : tabMode === 'MISTAKE_REVISION' ? t('quiz_mistake') : t('quiz_preset')}
       </span>
       {selectionView === 'CHAPTER_DRILLDOWN' && (
           <>
            <ChevronRight size={12} />
            <span className="text-primary dark:text-blue-400 font-bold">{SUBJECT_GROUPS.find(g => g.name === activeSubjectGroup)?.display || activeSubjectGroup}</span>
           </>
       )}
    </div>
  );

  // --- VIEWS ---

  if (step === 'SELECTION') {
    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors relative">
        <div className="flex-1 overflow-y-auto overflow-x-hidden md:flex md:flex-col">
            <div className="p-4 flex-none bg-gray-50 dark:bg-gray-900">
                <div className="mb-2">{renderBreadcrumbs()}</div>
                <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm max-w-lg mb-4 overflow-x-auto mx-auto md:mx-0 no-scrollbar">
                   <button onClick={() => { setTabMode('CUSTOM'); setSelectionView('SUBJECT_GRID'); }} className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all whitespace-nowrap ${tabMode === 'CUSTOM' ? 'bg-primary text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}><Settings size={14} /> {t('quiz_custom')}</button>
                   <button onClick={() => { setTabMode('PRESET'); setSelectionView('SUBJECT_GRID'); }} className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all whitespace-nowrap ${tabMode === 'PRESET' ? 'bg-primary text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}><GraduationCap size={14} /> {t('quiz_preset')}</button>
                </div>
            </div>
            
            <div className="flex-1 md:overflow-hidden md:flex md:flex-col md:border-t border-gray-200 dark:border-gray-700">
                {tabMode === 'CUSTOM' ? (
                    <div className="h-full flex flex-col">
                        {selectionView === 'SUBJECT_GRID' ? (
                            <div className="overflow-y-auto p-4 md:p-6 pb-24 md:pb-32 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {SUBJECT_GROUPS.map((subject, idx) => {
                                    const groupTotalQ = getStatsFor(subject.name);
                                    const selectedCount = getSelectedTopicCountForGroup(subject.papers);
                                    
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setActiveSubjectGroup(subject.name);
                                                setSelectionView('CHAPTER_DRILLDOWN');
                                            }}
                                            className={`relative bg-white dark:bg-gray-800 rounded-xl border p-6 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all group ${selectedCount > 0 ? 'border-primary dark:border-blue-500 ring-1 ring-primary/20' : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'}`}
                                        >
                                            {selectedCount > 0 && (
                                                <div className="absolute top-2 right-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm animate-in zoom-in">
                                                    <Check size={10} /> {selectedCount}
                                                </div>
                                            )}
                                            
                                            <div className={`p-4 rounded-full ${subject.color.split(' ')[1]} group-hover:scale-110 transition-transform duration-300`}>
                                                <subject.icon size={32} className={`${subject.color.split(' ')[0]} dark:text-white`} />
                                            </div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-sm md:text-base text-center">
                                                {subject.display}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                {subject.subDisplay}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            // --- CHAPTER DRILL DOWN VIEW ---
                            <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900">
                                <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 flex justify-between items-center sticky top-0 z-10 backdrop-blur-sm">
                                    <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                                        {activeSubjectGroup && React.createElement(SUBJECT_GROUPS.find(g => g.name === activeSubjectGroup)?.icon || BookOpen, { size: 20, className: "text-primary" })}
                                        {SUBJECT_GROUPS.find(g => g.name === activeSubjectGroup)?.display}
                                    </h3>
                                    <button 
                                        onClick={() => setSelectionView('SUBJECT_GRID')} 
                                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1"
                                    >
                                        <PlusCircle size={14}/> বিষয় যোগ করুন
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-40">
                                    {SUBJECT_GROUPS.find(g => g.name === activeSubjectGroup)?.papers.map(paperName => {
                                        const chapters = SYLLABUS_DB[paperName] ? Object.keys(SYLLABUS_DB[paperName]) : [];
                                        if (chapters.length === 0) return null;
                                        
                                        // Paper name localization
                                        const displayPaperName = paperName.includes('1st') ? '১ম পত্র (1st Paper)' : paperName.includes('2nd') ? '২য় পত্র (2nd Paper)' : paperName;

                                        return (
                                            <div key={paperName}>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                                        {displayPaperName}
                                                    </span>
                                                    <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    {chapters.map((chapter, cIdx) => {
                                                        const chapKey = `${paperName}-${chapter}`;
                                                        const availableTopics = getTopicsForChapter(paperName, chapter);
                                                        const selectedTopics = topicSelection[chapKey] || [];
                                                        const isFullySelected = selectedTopics.length === availableTopics.length && availableTopics.length > 0;
                                                        const isPartiallySelected = selectedTopics.length > 0 && !isFullySelected;
                                                        const isExpanded = expandedChapterIds.has(chapKey);
                                                        const chapQ = getStatsFor(paperName, chapter);

                                                        return (
                                                            <div key={cIdx} className={`rounded-xl border transition-all ${isFullySelected || isPartiallySelected ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                                                                <div className="flex items-center p-1">
                                                                    {/* Main Click Area - Selects All */}
                                                                    <button
                                                                        onClick={() => toggleAllTopicsInChapter(paperName, chapter)}
                                                                        className="flex-1 flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                                                    >
                                                                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${isFullySelected ? 'bg-primary border-primary' : isPartiallySelected ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700'}`}>
                                                                            {isFullySelected && <Check size={14} className="text-white" />}
                                                                            {isPartiallySelected && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <span className={`text-sm font-bold block truncate ${isFullySelected || isPartiallySelected ? 'text-primary dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                                                                {chapter}
                                                                            </span>
                                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                                {renderStatsBadge(chapQ)}
                                                                                {selectedTopics.length > 0 && (
                                                                                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                                                                                        {selectedTopics.length}/{availableTopics.length} topics
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </button>

                                                                    {/* Expand Arrow */}
                                                                    <button 
                                                                        onClick={() => toggleChapterExpansion(chapKey)}
                                                                        className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border-l border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                                                                    >
                                                                        {isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                                                                    </button>
                                                                </div>

                                                                {/* Expanded Topics */}
                                                                {isExpanded && (
                                                                    <div className="border-t border-gray-100 dark:border-gray-700 p-3 bg-gray-50/50 dark:bg-gray-900/30 animate-in slide-in-from-top-2">
                                                                        <div className="grid grid-cols-1 gap-2 pl-8">
                                                                            {availableTopics.map(topic => {
                                                                                const isTopicSelected = selectedTopics.includes(topic);
                                                                                return (
                                                                                    <label key={topic} className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-colors">
                                                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${isTopicSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'}`}>
                                                                                            {isTopicSelected && <Check size={10} className="text-white" />}
                                                                                        </div>
                                                                                        <input 
                                                                                            type="checkbox" 
                                                                                            className="hidden" 
                                                                                            checked={isTopicSelected} 
                                                                                            onChange={() => toggleTopic(paperName, chapter, topic)}
                                                                                        />
                                                                                        <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">{topic}</span>
                                                                                    </label>
                                                                                )
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
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // ... Preset View remains the same ...
                    <div className="p-4 md:p-6 pb-28 bg-gray-50 dark:bg-gray-900">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto">
                            {PRESET_DB.map(preset => (<div key={preset.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all overflow-hidden group"><div className={`p-4 border-b ${preset.color} bg-opacity-20`}><div className="flex justify-between items-start"><div><h3 className="text-base md:text-xl font-bold text-gray-800 dark:text-white">{preset.title}</h3><p className="text-xs opacity-80">{preset.subtitle}</p></div><div className="p-2 bg-white/50 dark:bg-black/20 rounded-lg backdrop-blur-sm"><Trophy size={16} className="text-gray-700 dark:text-white" /></div></div></div><div className="p-4 md:p-6"><div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400 mb-4"><span className="flex items-center gap-1"><Clock size={12}/> {preset.duration} Min</span><span className="flex items-center gap-1"><CheckSquare size={12}/> {preset.totalMarks} Marks</span><span className="flex items-center gap-1 text-red-500"><AlertTriangle size={12}/> -{preset.negativeMark}</span></div><div className="space-y-2 mb-4"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider"> Marks Distribution:</p><div className="flex flex-wrap gap-2">{preset.distribution.map((d, idx) => (<span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] rounded">{d.subject}: {d.count}</span>))}</div></div><button onClick={() => { setSelectedPreset(preset); setShowDifficultyModal(true); }} className="w-full py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-colors flex items-center justify-center gap-2 text-sm">{t('quiz_start')} <ArrowRight size={16} /></button></div></div>))}
                        </div>
                    </div>
                )}
            </div>
        </div>
        
        {(tabMode === 'CUSTOM') && (
            <div className="fixed bottom-0 left-0 md:left-64 right-0 p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-40">
                <div className="flex justify-between items-center max-w-6xl mx-auto">
                    {selectionView === 'CHAPTER_DRILLDOWN' ? (
                        <div className="text-xs text-gray-500">
                            {Object.values(topicSelection).flat().length} টি টপিক সিলেক্টেড
                        </div>
                    ) : (
                        <div className="text-xs text-gray-500">
                            মোট {Object.values(topicSelection).flat().length} টি টপিক সিলেক্ট করা হয়েছে
                        </div>
                    )}
                    
                    <button 
                        onClick={() => {
                            if(Object.values(topicSelection).flat().length === 0) {
                                showToast("অনুগ্রহ করে অন্তত একটি টপিক সিলেক্ট করুন", "warning");
                                return;
                            }
                            setStep('TOPIC_CONFIG'); 
                        }} 
                        disabled={Object.values(topicSelection).flat().length === 0} 
                        className="bg-primary hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95 text-sm"
                    >
                        {t('quiz_next_step')} <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        )}
        
        {showDifficultyModal && selectedPreset && (<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"><div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in-95"><div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-gray-900 dark:text-white">কঠিন্য স্তর নির্বাচন করুন</h3><button onClick={() => setShowDifficultyModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><XCircle size={20} className="text-gray-400" /></button></div><div className="space-y-3">{[DifficultyLevel.EASY, DifficultyLevel.MEDIUM, DifficultyLevel.HARD].map((level) => { let color = 'bg-gray-100 hover:bg-blue-100 border-transparent hover:border-blue-500'; let icon = <CheckCircle size={18} />; if (level === DifficultyLevel.HARD) { color = 'bg-gray-100 hover:bg-red-100 border-transparent hover:border-red-500'; icon = <Flame size={18} />; } return (<button key={level} onClick={() => startPresetQuiz(level)} className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${color} dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600`}><div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">{icon}</div><div><p className="font-bold text-sm text-gray-800 dark:text-white">{level}</p></div></button>) })}</div></div></div>)}
      </div>
    );
  }

  // TOPIC CONFIG STEP (Settings) - Slightly modified to show review of selections
  if (step === 'TOPIC_CONFIG') {
    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="p-4 pb-2">{renderBreadcrumbs()}</div>
        <div className="flex-1 overflow-y-auto px-4 pb-40">
            <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
                {/* Selection Review */}
                <div className="md:col-span-2 space-y-4">
                    <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-3 text-sm">
                        <ListChecks size={16} className="text-green-500"/> নির্বাচিত টপিকসমূহ (রিভিউ)
                    </h3>
                    
                    {Object.keys(topicSelection).length === 0 ? (
                        <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-500">
                            কোনো টপিক সিলেক্ট করা হয়নি। দয়া করে ফিরে যান।
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {Object.entries(topicSelection).map(([key, rawTopics]) => {
                                const topics = rawTopics as string[];
                                // Extract Subject & Chapter from key "Subject-Chapter"
                                let subjectName = "";
                                let chapterName = "";
                                
                                // Iterate to find match (safer)
                                for(const s of Object.keys(SYLLABUS_DB)) {
                                    if (key.startsWith(s)) {
                                        subjectName = s;
                                        chapterName = key.substring(s.length + 1);
                                        break;
                                    }
                                }
                                
                                if (topics.length === 0) return null;

                                return (
                                    <div key={key} className="p-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-[10px] font-bold rounded text-gray-600 dark:text-gray-300">{subjectName}</span>
                                            <h4 className="font-bold text-gray-800 dark:text-white text-sm">{chapterName}</h4>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {topics.map(t => (
                                                <span key={t} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-[10px] rounded border border-blue-100 dark:border-blue-800">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                
                {/* Settings Panel */}
                <div className="md:col-span-1 space-y-4">
                    <div className="md:sticky md:top-0 space-y-4">
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-3 text-sm"><Settings size={16} className="text-primary dark:text-blue-400" /> {t('quiz_settings')}</h3>
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm space-y-4">
                                {/* Practice Mode Toggle */}
                                <div 
                                    onClick={() => setIsPracticeMode(!isPracticeMode)}
                                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isPracticeMode ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-lg ${isPracticeMode ? 'bg-white text-blue-600 dark:bg-blue-800 dark:text-white' : 'bg-white text-gray-400 dark:bg-gray-600 dark:text-gray-300'}`}>
                                            <Zap size={16} fill={isPracticeMode ? "currentColor" : "none"} />
                                        </div>
                                        <div>
                                            <p className={`font-bold text-xs ${isPracticeMode ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>{t('quiz_practice_mode')}</p>
                                            <p className="text-[9px] text-gray-500 dark:text-gray-400">উত্তর সাথে সাথে দেখা যাবে</p>
                                        </div>
                                    </div>
                                    <div className={`w-8 h-5 rounded-full relative transition-colors ${isPracticeMode ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-500'}`}>
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isPracticeMode ? 'left-4' : 'left-1'}`}></div>
                                    </div>
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
        <div className="fixed bottom-0 left-0 md:left-64 right-0 p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-40 flex justify-between items-center transition-colors"><button onClick={() => setStep('SELECTION')} className="text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2.5 rounded-xl text-xs md:text-sm transition-colors">{t('quiz_prev')}</button><button onClick={startCustomQuiz} className="bg-primary hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-2.5 md:px-8 md:py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95 text-xs md:text-sm"><Play fill="currentColor" size={14} className="md:w-4 md:h-4" /> <span className="md:hidden">Start</span><span className="hidden md:inline">{t('quiz_start')}</span></button></div>
      </div>
    );
  }

  // LOADING, EXAM, RESULT steps omitted for brevity (same as previous)
  if (step === 'LOADING') {
    return (<div className="h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center p-6 transition-colors"><div className="relative"><div className="absolute inset-0 bg-primary/20 dark:bg-primary/40 rounded-full blur-xl animate-pulse"></div><Loader2 size={48} className="text-primary dark:text-blue-400 animate-spin relative z-10" /></div><h3 className="mt-6 text-lg font-bold text-gray-800 dark:text-white">{t('common_loading')}</h3><p className="text-gray-500 dark:text-gray-400 mt-1 text-xs max-w-sm">প্রশ্ন তৈরি করা হচ্ছে...</p></div>);
  }

  // EXAM STEP
  if (step === 'EXAM') {
    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors relative">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div>
            <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-wider">{customTitle ? customTitle : tabMode === 'MISTAKE_REVISION' ? t('quiz_mistake') : selectedPreset ? selectedPreset.title : t('quiz_custom')}</p>
            <div className="flex items-center gap-2">
              <span className="text-base md:text-lg font-bold text-primary dark:text-blue-400">{examViewMode === 'SINGLE_PAGE' ? currentQIndex + 1 : userAnswers.filter(a => a !== null).length}</span><span className="text-gray-400 text-xs md:text-sm">/ {questions.length}</span>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono font-bold text-xs md:text-sm ${timeLimit > 0 && timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>
            <Clock size={14} className="md:w-[16px] md:h-[16px]" /> {timeLimit > 0 ? formatTime(timeLeft) : formatTime(examDuration)}
          </div>
        </div>
        
        {examViewMode === 'SINGLE_PAGE' && (<div className="h-1 bg-gray-100 dark:bg-gray-700 w-full"><div className="h-full bg-primary dark:bg-blue-500 transition-all duration-300" style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}></div></div>)}
        
        <div className="flex-1 overflow-y-auto p-4 scroll-smooth" id="quiz-scroll-container">
          <div className={`mx-auto pb-20 relative ${examViewMode === 'ALL_AT_ONCE' ? 'max-w-6xl' : 'max-w-3xl'}`}>
            {examViewMode === 'SINGLE_PAGE' ? (
              <div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4 relative">
                  <h2 className="text-sm md:text-lg font-bold text-gray-800 dark:text-white leading-relaxed pr-8">{questions[currentQIndex]?.question}</h2>
                  <button 
                    onClick={() => toggleSaveQuestion(currentQIndex)}
                    className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Save Question"
                  >
                    <Bookmark size={18} className={`md:w-5 md:h-5 ${savedQuestionIndices.has(currentQIndex) ? "fill-primary text-primary" : "text-gray-400"}`} />
                  </button>
                </div>
                
                <div className="grid gap-2.5">
                  {questions[currentQIndex]?.options.map((option, idx) => {
                    const isAnswered = userAnswers[currentQIndex] !== null;
                    const isSelected = userAnswers[currentQIndex] === idx;
                    const isCorrect = idx === questions[currentQIndex]?.correctAnswerIndex;
                    
                    let buttonClass = "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700";
                    
                    if (isPracticeMode && isAnswered) {
                        if (isCorrect) buttonClass = "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-300";
                        else if (isSelected) buttonClass = "bg-red-100 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-300";
                        else buttonClass = "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500";
                    } else if (isSelected) {
                        buttonClass = "bg-primary border-primary text-white shadow-md";
                    }

                    const animateClass = animatingOption === idx ? 'scale-95' : '';
                    const shakeClass = shakeIndex === idx ? 'animate-[shake_0.5s_ease-in-out]' : '';

                    return (
                        <button 
                            key={idx} 
                            onClick={() => handleOptionSelect(currentQIndex, idx)}
                            disabled={isPracticeMode && isAnswered}
                            className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between group active:scale-[0.98] ${buttonClass} ${animateClass} ${shakeClass}`}
                        >
                        <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full border flex items-center justify-center font-bold text-xs ${isSelected && !isPracticeMode ? 'bg-white text-primary border-white' : 'bg-transparent border-current opacity-70'}`}>{['A', 'B', 'C', 'D'][idx]}</div>
                            <span className="text-xs md:text-sm">{option}</span>
                        </div>
                        {isPracticeMode && isAnswered && isCorrect && <CheckCircle size={18} className="text-green-600 dark:text-green-400" />}
                        {isPracticeMode && isAnswered && isSelected && !isCorrect && <XCircle size={18} className="text-red-600 dark:text-red-400" />}
                        {!isPracticeMode && isSelected && <CheckCircle size={18} />}
                        </button>
                    );
                  })}
                </div>

                {isPracticeMode && userAnswers[currentQIndex] !== null && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800 animate-in slide-in-from-top-2 fade-in duration-300">
                        <h4 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-1.5 text-sm">
                            <BookOpen size={16} /> {t('quiz_explanation')}:
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
                            {questions[currentQIndex]?.explanation || 'No explanation available.'}
                        </p>
                    </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="flex-1 w-full space-y-4">
                  {questions.map((q, qIdx) => (
                    <div key={qIdx} id={`question-${qIdx}`} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative scroll-mt-24">
                      <button 
                        onClick={() => toggleSaveQuestion(qIdx)}
                        className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Bookmark size={16} className={`${savedQuestionIndices.has(qIdx) ? "fill-primary text-primary" : "text-gray-400"}`} />
                      </button>
                      <h3 className="text-sm md:text-base font-bold text-gray-800 dark:text-white mb-3 flex gap-2 pr-8">
                        <span className="text-gray-400 min-w-[20px]">{qIdx + 1}.</span>{q.question}
                      </h3>
                      <div className="grid gap-2">
                        {q.options.map((option, oIdx) => (
                          <button key={oIdx} onClick={() => { const newAns = [...userAnswers]; newAns[qIdx] = oIdx; setUserAnswers(newAns); }} className={`w-full p-2.5 rounded-lg border text-left transition-all flex items-center justify-between active:scale-[0.98] ${userAnswers[qIdx] === oIdx ? 'bg-primary/10 border-primary text-primary dark:text-blue-400 font-semibold' : 'bg-gray-50 dark:bg-gray-700/30 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${userAnswers[qIdx] === oIdx ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-400'}`}>{['A', 'B', 'C', 'D'][oIdx]}</div>
                              <span className="text-xs">{option}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden lg:block w-64 shrink-0 sticky top-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-3 overflow-hidden">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-gray-700 dark:text-gray-300 text-xs flex items-center gap-2">
                                <LayoutGrid size={14}/> প্রশ্ন তালিকা
                            </h3>
                            <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-500">
                                {userAnswers.filter(a => a !== null).length}/{questions.length}
                            </span>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                            {questions.map((_, idx) => {
                                const isAnswered = userAnswers[idx] !== null;
                                const isSaved = savedQuestionIndices.has(idx);
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            document.getElementById(`question-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        }}
                                        className={`relative h-8 rounded text-[10px] font-bold transition-all border ${isAnswered ? 'bg-primary text-white border-primary' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-primary'}`}
                                    >
                                        {idx + 1}
                                        {isSaved && <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-orange-500 rounded-full border border-white"></div>}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          {examViewMode === 'SINGLE_PAGE' ? (
            <>
              <button onClick={() => setCurrentQIndex(prev => prev - 1)} disabled={currentQIndex === 0} className="px-4 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 text-xs md:text-sm">{t('quiz_prev')}</button>
              {currentQIndex === questions.length - 1 ? (
                <button onClick={() => setShowSubmitModal(true)} className="px-6 py-2.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 shadow-lg shadow-red-200 dark:shadow-none transition-all text-xs md:text-sm">{t('quiz_submit')}</button>
              ) : (
                <button onClick={() => setCurrentQIndex(prev => prev + 1)} className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all flex items-center gap-2 text-xs md:text-sm">{t('quiz_next')} <ChevronRight size={16} /></button>
              )}
            </>
          ) : (
            <div className="w-full flex gap-3 max-w-4xl mx-auto">
                <button 
                    onClick={() => setShowMobileNav(true)} 
                    className="lg:hidden px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    <LayoutGrid size={18} />
                </button>
                <button onClick={() => setShowSubmitModal(true)} className="flex-1 px-6 py-2.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 shadow-lg shadow-red-200 dark:shadow-none transition-all text-xs md:text-sm">
                    {t('quiz_submit')} ({userAnswers.filter(a => a !== null).length}/{questions.length})
                </button>
            </div>
          )}
        </div>
        
        {showMobileNav && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl p-4 shadow-xl border border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom-5">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800 dark:text-white text-base">প্রশ্ন তালিকা</h3>
                        <button onClick={() => setShowMobileNav(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20} className="text-gray-500"/></button>
                    </div>
                    <div className="grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto p-1">
                        {questions.map((_, idx) => {
                            const isAnswered = userAnswers[idx] !== null;
                            const isSaved = savedQuestionIndices.has(idx);
                            return (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        document.getElementById(`question-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        setShowMobileNav(false);
                                    }}
                                    className={`relative h-10 rounded-lg text-xs font-bold transition-all border ${isAnswered ? 'bg-primary text-white border-primary' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600'}`}
                                >
                                    {idx + 1}
                                    {isSaved && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-orange-500 rounded-full border border-white"></div>}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        )}

        {showSubmitModal && (<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"><div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in-95"><div className="text-center mb-6"><div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4"><HelpCircle size={24} /></div><h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">আপনি কি নিশ্চিত?</h3><p className="text-gray-500 dark:text-gray-400 text-xs">আপনি {questions.length} টির মধ্যে {userAnswers.filter(a => a !== null).length} টি প্রশ্নের উত্তর দিয়েছেন।</p></div><div className="flex gap-3"><button onClick={() => setShowSubmitModal(false)} className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs">বাতিল</button><button onClick={submitExam} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-200 dark:shadow-none transition-colors text-xs">{t('quiz_submit')}</button></div></div></div>)}
      </div>
    );
  }

  // --- RESULT STEP ---
  if (step === 'RESULT') {
    const correctCount = userAnswers.filter((ans, idx) => ans === questions[idx]?.correctAnswerIndex).length;
    const wrongCount = userAnswers.filter((ans, idx) => ans !== null && ans !== questions[idx]?.correctAnswerIndex).length;
    const skippedCount = questions.length - (correctCount + wrongCount);
    
    const penalty = wrongCount * negativeMarking;
    const rawScore = correctCount - penalty;
    const finalScore = Math.max(0, rawScore);
    const percentage = Math.round((finalScore / questions.length) * 100);
    const earnedPoints = finalScore > 0 ? (correctCount * 5) + 10 : 0;
    
    const filteredQuestions = questions.map((q, idx) => ({ q, idx })).filter(({ q, idx }) => {
       const isCorrect = userAnswers[idx] === q.correctAnswerIndex;
       const isSkipped = userAnswers[idx] === null;
       const isWrong = !isCorrect && !isSkipped;

       if (reviewFilter === 'CORRECT') return isCorrect;
       if (reviewFilter === 'WRONG') return isWrong;
       if (reviewFilter === 'SKIPPED') return isSkipped;
       return true;
    });

    const subjectStats: { [subject: string]: { correct: number, total: number } } = {};
    questions.forEach((q, idx) => {
        const sub = q.subject || 'General';
        if (!subjectStats[sub]) subjectStats[sub] = { correct: 0, total: 0 };
        subjectStats[sub].total++;
        if (userAnswers[idx] === q.correctAnswerIndex) {
            subjectStats[sub].correct++;
        }
    });

    return (
      <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors">
         {showConfetti && <Confetti />}
         
         <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 pb-20 relative z-10">
            
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 md:p-8 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col gap-6">
               <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="text-center md:text-left flex-1 w-full">
                       <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full font-bold text-[10px] md:text-xs mb-3">
                          <Trophy size={14} fill="currentColor" /> {t('quiz_result')}
                       </div>
                       <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                          {finalScore.toFixed(2)} <span className="text-lg md:text-2xl text-gray-400 dark:text-gray-500 font-medium">/ {questions.length}</span>
                       </h1>
                       
                       <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-4 my-4">
                           <div className="text-center px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800 min-w-[70px]">
                               <span className="block text-lg md:text-xl font-bold text-green-600 dark:text-green-400">{correctCount}</span>
                               <span className="text-[10px] text-green-700 dark:text-green-300 font-medium">{t('quiz_correct')}</span>
                           </div>
                           <div className="text-center px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800 min-w-[70px]">
                               <span className="block text-lg md:text-xl font-bold text-red-600 dark:text-red-400">{wrongCount}</span>
                               <span className="text-[10px] text-red-700 dark:text-red-300 font-medium">{t('quiz_wrong')}</span>
                           </div>
                           <div className="text-center px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 min-w-[70px]">
                               <span className="block text-lg md:text-xl font-bold text-gray-600 dark:text-gray-300">{skippedCount}</span>
                               <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{t('quiz_skipped')}</span>
                           </div>
                           <div className="text-center px-3 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800 min-w-[70px]">
                               <span className="block text-lg md:text-xl font-bold text-orange-600 dark:text-orange-400 flex items-center justify-center gap-1"><Zap size={14} fill="currentColor"/>{earnedPoints}</span>
                               <span className="text-[10px] text-orange-700 dark:text-orange-300 font-medium">{t('quiz_points')}</span>
                           </div>
                       </div>

                       <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                          <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-lg">
                             <Clock size={12} className="md:w-3 md:h-3" /> সময়: {formatTime(examDuration)}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2.5 py-1 rounded-lg font-medium">
                             <AlertTriangle size={12} className="md:w-3 md:h-3" /> পেনাল্টি: -{penalty.toFixed(2)}
                          </div>
                       </div>
                   </div>

                   <div className="relative w-32 h-32 md:w-48 md:h-48 shrink-0">
                       <div 
                         className="w-full h-full rounded-full"
                         style={{
                            background: `conic-gradient(
                               #10b981 0% ${correctCount / questions.length * 100}%, 
                               #ef4444 ${correctCount / questions.length * 100}% ${(correctCount + wrongCount) / questions.length * 100}%, 
                               #e5e7eb ${(correctCount + wrongCount) / questions.length * 100}% 100%
                            )`
                         }}
                       ></div>
                       <div className="absolute inset-3 md:inset-4 bg-white dark:bg-gray-800 rounded-full flex flex-col items-center justify-center shadow-inner">
                          <span className="text-xl md:text-3xl font-bold text-gray-800 dark:text-white">{percentage}%</span>
                          <span className="text-[9px] md:text-[10px] text-gray-500 uppercase font-bold">{t('quiz_accuracy')}</span>
                       </div>
                   </div>
               </div>

                {Object.keys(subjectStats).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">বিষয়ভিত্তিক পারফরম্যান্স</h4>
                        <div className="space-y-3">
                            {Object.entries(subjectStats).map(([sub, stats]) => {
                                const subPercent = Math.round((stats.correct / stats.total) * 100);
                                return (
                                    <div key={sub}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-bold text-gray-700 dark:text-gray-300">{sub}</span>
                                            <span className="text-gray-500">{stats.correct}/{stats.total} ({subPercent}%)</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${subPercent >= 80 ? 'bg-green-500' : subPercent >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                                style={{ width: `${subPercent}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

               <div className="flex flex-col md:flex-row gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                    <button 
                      onClick={handleDownloadPDF}
                      className="flex-1 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-xs md:text-sm border border-blue-200 dark:border-blue-800"
                    >
                       <Download size={16} className="md:w-4 md:h-4" /> PDF ডাউনলোড
                    </button>
                    <button 
                      onClick={resetAll}
                      className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-xs md:text-sm"
                    >
                       <RefreshCw size={16} className="md:w-4 md:h-4" /> {t('quiz_retry')}
                    </button>
                    <button 
                      onClick={goHome}
                      className="flex-1 px-6 py-2.5 bg-primary hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-900/20 text-xs md:text-sm"
                    >
                       <Home size={16} className="md:w-4 md:h-4" /> {t('quiz_home')}
                    </button>
               </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center md:justify-start bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700 w-full md:w-fit mx-auto md:mx-0 overflow-x-auto no-scrollbar">
               <button onClick={() => setReviewFilter('ALL')} className={`px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${reviewFilter === 'ALL' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                  <LayoutList size={12} /> {t('common_all')} ({questions.length})
               </button>
               <button onClick={() => setReviewFilter('CORRECT')} className={`px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${reviewFilter === 'CORRECT' ? 'bg-green-100 text-green-700 border border-green-200' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                  <CheckCircle size={12} /> {t('quiz_correct')} ({correctCount})
               </button>
               <button onClick={() => setReviewFilter('WRONG')} className={`px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${reviewFilter === 'WRONG' ? 'bg-red-100 text-red-700 border border-red-200' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                  <XCircle size={12} /> {t('quiz_wrong')} ({wrongCount})
               </button>
               <button onClick={() => setReviewFilter('SKIPPED')} className={`px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${reviewFilter === 'SKIPPED' ? 'bg-gray-200 text-gray-800 border border-gray-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                  <MinusCircle size={12} /> {t('quiz_skipped')} ({skippedCount})
               </button>
            </div>

            <div className="space-y-4">
                {filteredQuestions.map(({ q, idx }) => {
                    const userAns = userAnswers[idx];
                    const isCorrect = userAns === q.correctAnswerIndex;
                    const isSkipped = userAns === null;
                    const isWrong = !isCorrect && !isSkipped;
                    
                    let statusColor = isCorrect ? 'border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-900/10' 
                                    : isWrong ? 'border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-900/10'
                                    : 'border-gray-200 dark:border-gray-700';

                    return (
                        <div key={idx} className={`bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl border ${statusColor} shadow-sm`}>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex gap-3">
                                    <span className="font-bold text-gray-400 text-xs md:text-sm">{idx + 1}.</span>
                                    <div>
                                        <h3 className="font-bold text-gray-800 dark:text-white text-xs md:text-sm leading-relaxed mb-2">{q.question}</h3>
                                        <div className="flex gap-2">
                                            {isCorrect && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">সঠিক</span>}
                                            {isWrong && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">ভুল</span>}
                                            {isSkipped && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">স্কিপড</span>}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => toggleSaveQuestion(idx)} className="text-gray-400 hover:text-primary">
                                    <Bookmark size={16} className={savedQuestionIndices.has(idx) ? "fill-primary text-primary" : ""} />
                                </button>
                            </div>

                            <div className="grid gap-2 mb-3">
                                {q.options.map((opt, oIdx) => {
                                    const isSelected = userAns === oIdx;
                                    const isAnswer = oIdx === q.correctAnswerIndex;
                                    let optClass = "border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300";
                                    
                                    if (isAnswer) optClass = "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-300 font-bold";
                                    else if (isSelected && !isCorrect) optClass = "bg-red-100 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-300 font-bold";
                                    
                                    return (
                                        <div key={oIdx} className={`p-2.5 rounded-xl border flex items-center gap-3 text-xs md:text-sm ${optClass}`}>
                                            <div className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] opacity-70">{['A','B','C','D'][oIdx]}</div>
                                            <span className="flex-1">{opt}</span>
                                            {isAnswer && <CheckCircle size={14} className="text-green-600 dark:text-green-400"/>}
                                            {isSelected && !isCorrect && <XCircle size={14} className="text-red-600 dark:text-red-400"/>}
                                        </div>
                                    )
                                })}
                            </div>
                            
                            {q.explanation && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl text-[10px] md:text-xs text-gray-700 dark:text-gray-300 border border-blue-100 dark:border-blue-800">
                                    <p className="font-bold text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-1"><BookOpen size={12}/> {t('quiz_explanation')}:</p>
                                    {q.explanation}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
         </div>
      </div>
    );
  }

  return null;
};

export default QuizArena;
