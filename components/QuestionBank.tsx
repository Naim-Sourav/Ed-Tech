
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Archive, 
  ChevronLeft, 
  FileText, 
  Clock, 
  Play, 
  ChevronRight,
  Stethoscope,
  BookOpen,
  Calendar,
  Dna,
  Atom,
  Beaker,
  Globe,
  Languages,
  ChevronDown,
  ChevronUp,
  Activity,
  BrainCircuit,
  Cpu,
  Loader2,
  Calculator,
  Book,
  LayoutGrid,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  RefreshCw,
  Bookmark
} from 'lucide-react';
import { SYLLABUS_DB } from '../services/syllabusData';
import { fetchQuestionPapersAPI, fetchQuestionsByExamRefAPI, generateQuizFromDB, saveQuestionAPI, unsaveQuestionAPI, fetchSavedQuestionsAPI } from '../services/api';
import { QuestionPaperMetadata, QuizQuestion } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import { useCache } from '../contexts/CacheContext';

interface Category {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  papers: QuestionPaperMetadata[];
}

// 1. All Available Subject Groups
const SUBJECT_GROUPS = [
  {
    name: 'জীববিজ্ঞান (Biology)',
    key: 'Biology', 
    icon: Dna,
    color: 'text-green-600 bg-green-100',
    papers: ['Biology 1st Paper', 'Biology 2nd Paper']
  },
  {
    name: 'রসায়ন (Chemistry)',
    key: 'Chemistry',
    icon: Beaker,
    color: 'text-orange-600 bg-orange-100',
    papers: ['Chemistry 1st Paper', 'Chemistry 2nd Paper']
  },
  {
    name: 'পদার্থবিজ্ঞান (Physics)',
    key: 'Physics',
    icon: Atom,
    color: 'text-purple-600 bg-purple-100',
    papers: ['Physics 1st Paper', 'Physics 2nd Paper']
  },
  {
    name: 'উচ্চতর গণিত (Higher Math)',
    key: 'Math',
    icon: Calculator,
    color: 'text-red-600 bg-red-100',
    papers: ['Higher Math 1st Paper', 'Higher Math 2nd Paper']
  },
  {
    name: 'ইংরেজি (English)',
    key: 'English',
    icon: Languages,
    color: 'text-blue-600 bg-blue-100',
    papers: ['English']
  },
  {
    name: 'বাংলা (Bangla)',
    key: 'Bangla',
    icon: Book,
    color: 'text-pink-600 bg-pink-100',
    papers: ['Bangla 1st Paper', 'Bangla 2nd Paper']
  },
  {
    name: 'সাধারণ জ্ঞান (GK)',
    key: 'General Knowledge',
    icon: Globe,
    color: 'text-cyan-600 bg-cyan-100',
    papers: ['General Knowledge']
  },
  {
    name: 'আইসিটি (ICT)',
    key: 'ICT',
    icon: Cpu,
    color: 'text-indigo-600 bg-indigo-100',
    papers: ['ICT']
  },
  {
    name: 'মানসিক দক্ষতা (IQ)',
    key: 'Mental Ability',
    icon: BrainCircuit,
    color: 'text-gray-600 bg-gray-100',
    papers: ['Mental Ability']
  }
];

const SOURCE_CONFIG: Record<string, { icon: any, color: string, bg: string, title: string }> = {
    'Medical': { icon: Stethoscope, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', title: 'মেডিকেল প্রশ্নব্যাংক' },
    'Dental': { icon: Activity, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-900/20', title: 'ডেন্টাল প্রশ্নব্যাংক' },
    'BUET': { icon: Cpu, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', title: 'বুয়েট প্রশ্নব্যাংক' },
    'Dhaka_University_A': { icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', title: 'ঢাবি (ক) প্রশ্নব্যাংক' },
    'Guccho_A': { icon: LayoutGrid, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', title: 'গুচ্ছ (GST) প্রশ্নব্যাংক' },
    'BUTEX_Affiliated': { icon: Cpu, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', title: 'বুটেক্স অধিভুক্ত কলেজ' },
    'DEFAULT': { icon: Archive, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', title: 'অন্যান্য প্রশ্নব্যাংক' }
};

// Helper to normalize subject names for display
const getDisplaySubject = (subject: string = '') => {
    const s = subject.toLowerCase();
    if (s.includes('physics')) return 'Physics (পদার্থবিজ্ঞান)';
    if (s.includes('chemistry')) return 'Chemistry (রসায়ন)';
    if (s.includes('math')) return 'Higher Math (উচ্চতর গণিত)';
    if (s.includes('biology')) return 'Biology (জীববিজ্ঞান)';
    if (s.includes('english')) return 'English (ইংরেজি)';
    if (s.includes('bangla')) return 'Bangla (বাংলা)';
    if (s.includes('knowledge') || s.includes('gk')) return 'General Knowledge (সাধারণ জ্ঞান)';
    if (s.includes('ict')) return 'ICT (তথ্য ও যোগাযোগ প্রযুক্তি)';
    return subject || 'General';
};

// --- OPTIMIZED CHILD COMPONENT ---
interface RevisionQuestionCardProps {
    q: QuizQuestion;
    idx: number;
    userSelected: number | undefined;
    showAllAnswers: boolean;
    isSaved: boolean;
    onOptionClick: (qIdx: number, oIdx: number) => void;
    onToggleSave: (question: QuizQuestion) => void;
}

const RevisionQuestionCard = React.memo(({ q, idx, userSelected, showAllAnswers, isSaved, onOptionClick, onToggleSave }: RevisionQuestionCardProps) => {
    const isRevealed = showAllAnswers || userSelected !== undefined;
    const correctIdx = q.correctAnswerIndex;

    const getFont = (text: string = '') => {
        const isBangla = /[\u0980-\u09FF]/.test(text);
        return isBangla ? 'font-tiro' : 'font-sans';
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm relative group">
            {/* Bookmark Button */}
            <button 
                onClick={() => onToggleSave(q)}
                className="absolute top-3 right-3 md:top-4 md:right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-primary transition-colors z-10"
                title="Save Question"
            >
                <Bookmark size={18} className={isSaved ? 'fill-primary text-primary' : ''}/>
            </button>

            <div className="flex gap-3 md:gap-4 mb-3 md:mb-4">
                <span className="font-bold text-gray-300 font-mono text-base md:text-lg">{String(idx+1).padStart(2,'0')}</span>
                <div className="flex-1 pr-6">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded text-[9px] md:text-[10px] font-bold border border-blue-100 dark:border-blue-800">{q.subject}</span>
                        {q.chapter && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded text-[9px] md:text-[10px] font-bold">{q.chapter}</span>}
                    </div>
                    <h3 className={`font-extrabold text-gray-900 dark:text-white text-base md:text-xl leading-relaxed ${getFont(q.question)}`}>{q.question}</h3>
                    {q.questionImage && (
                        <img src={q.questionImage} alt="Question" className="mt-2 max-h-32 md:max-h-40 rounded-lg object-contain border border-gray-100 dark:border-gray-700" />
                    )}
                </div>
            </div>

            <div className="grid gap-2">
                {q.options.map((opt, oIdx) => {
                    let btnClass = "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800";
                    
                    if (isRevealed) {
                        if (oIdx === correctIdx) {
                            btnClass = "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400 font-bold ring-1 ring-green-500";
                        } else if (userSelected === oIdx) {
                            btnClass = "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400 font-bold ring-1 ring-red-500";
                        } else {
                            btnClass = "opacity-50 grayscale border-gray-200 dark:border-gray-700";
                        }
                    }

                    return (
                        <button 
                            key={oIdx}
                            onClick={() => onOptionClick(idx, oIdx)}
                            disabled={showAllAnswers} // If globally revealed, disable interaction to prevent state thrashing
                            className={`w-full text-left p-2.5 md:p-3 rounded-xl border text-xs md:text-sm transition-all flex items-start gap-3 ${btnClass}`}
                        >
                            <div className="w-4 h-4 md:w-5 md:h-5 rounded-full border border-current flex items-center justify-center text-[9px] md:text-[10px] opacity-70 shrink-0 mt-0.5 font-sans font-bold">
                                {['A','B','C','D'][oIdx]}
                            </div>
                            <div className="flex-1">
                                <span className={getFont(opt)}>{opt}</span>
                                {q.optionsImages?.[oIdx] && (
                                    <img src={q.optionsImages[oIdx]} alt={`Option ${oIdx}`} className="mt-2 max-h-16 md:max-h-20 rounded object-contain border border-gray-200 dark:border-gray-600" />
                                )}
                            </div>
                            {isRevealed && oIdx === correctIdx && <CheckCircle size={16} className="ml-auto text-green-600 shrink-0"/>}
                            {isRevealed && userSelected === oIdx && userSelected !== correctIdx && <XCircle size={16} className="ml-auto text-red-600 shrink-0"/>}
                        </button>
                    )
                })}
            </div>

            {/* Explanation Block - Rendered but hidden with CSS to preserve MathJax layout calculations */}
            <div className={`mt-3 bg-gray-50 dark:bg-gray-900/50 p-3 md:p-4 rounded-xl text-xs md:text-sm text-gray-700 dark:text-gray-300 border-l-4 border-blue-400 dark:border-blue-600 overflow-hidden break-words max-w-full ${isRevealed ? 'block animate-in fade-in slide-in-from-top-2' : 'hidden'}`}>
                <p className="font-bold mb-1 flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400"><BookOpen size={12}/> ব্যাখ্যা</p>
                <p className={`whitespace-pre-wrap leading-relaxed ${getFont(q.explanation)}`}>{q.explanation || "কোনো ব্যাখ্যা নেই।"}</p>
                {q.explanationImage && (
                    <img src={q.explanationImage} alt="Explanation" className="mt-2 max-h-32 rounded object-contain border border-gray-200 dark:border-gray-700" />
                )}
            </div>
        </div>
    );
}, (prev, next) => {
    // Custom comparison for React.memo to ensure minimal re-renders
    return (
        prev.userSelected === next.userSelected && 
        prev.showAllAnswers === next.showAllAnswers &&
        prev.isSaved === next.isSaved &&
        prev.q === next.q // Shallow check for q is usually enough as questions don't change
    );
});

const QuestionBank: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { getCache, setCache } = useCache();
  
  const cacheKey = 'qbank_state';
  const cachedData = getCache(cacheKey) || {};

  // State
  const [papers, setPapers] = useState<QuestionPaperMetadata[]>(cachedData.papers || []);
  
  // Use URL Search Params for selected Category (To support hardware back button)
  const selectedCategoryId = searchParams.get('category');

  const [viewMode, setViewMode] = useState<'YEAR' | 'CHAPTER'>(cachedData.viewMode || 'YEAR');
  
  const [loading, setLoading] = useState(!cachedData.papers);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  // Revision Mode State
  const [isRevisionMode, setIsRevisionMode] = useState(false);
  const [revisionQuestions, setRevisionQuestions] = useState<QuizQuestion[]>([]);
  const [revisionTitle, setRevisionTitle] = useState('');
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const [userSelections, setUserSelections] = useState<Record<number, number>>({});
  const [savedQuestionIds, setSavedQuestionIds] = useState<Set<string>>(new Set());

  // Update Cache when state changes
  useEffect(() => {
      setCache(cacheKey, { papers, viewMode }); // We don't cache selectedCategoryId as it is in URL
  }, [papers, viewMode, setCache]);

  useEffect(() => {
      const loadPapers = async () => {
          if (!cachedData.papers) setLoading(true);
          try {
              const data = await fetchQuestionPapersAPI();
              setPapers(data);
          } catch (e) {
              console.error("Failed to load papers", e);
          } finally {
              setLoading(false);
          }
      };
      loadPapers();
  }, []);

  // Optimized MathJax: Runs ONCE when revision mode starts.
  useEffect(() => {
    if (isRevisionMode && window.MathJax && window.MathJax.typesetPromise) {
      // Small timeout to allow DOM to settle
      const timer = setTimeout(() => {
        window.MathJax.typesetPromise().catch((err: any) => console.error('MathJax error:', err));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isRevisionMode, revisionQuestions]);

  const categories = useMemo(() => {
      const groups: Record<string, QuestionPaperMetadata[]> = {};
      papers.forEach(p => {
          const key = p.source;
          if (!groups[key]) groups[key] = [];
          groups[key].push(p);
      });
      return Object.keys(groups).map(key => {
          const config = SOURCE_CONFIG[key] || { ...SOURCE_CONFIG['DEFAULT'], title: key };
          return {
              id: key,
              title: config.title,
              icon: config.icon,
              color: config.color,
              bg: config.bg,
              papers: groups[key]
          };
      });
  }, [papers]);

  const selectedCategory = useMemo(() => {
      return categories.find(c => c.id === selectedCategoryId) || null;
  }, [categories, selectedCategoryId]);

  const filteredSubjectGroups = useMemo(() => {
      if (!selectedCategory) return [];
      const availableSubjects = new Set<string>();
      selectedCategory.papers.forEach(p => {
          if (p.subjects && Array.isArray(p.subjects)) {
              p.subjects.forEach(s => availableSubjects.add(s));
          }
      });
      if (availableSubjects.size === 0) return SUBJECT_GROUPS;
      return SUBJECT_GROUPS.filter(group => {
          return group.papers.some(paperName => availableSubjects.has(paperName));
      });
  }, [selectedCategory]);

  const handleStartExam = (title: string, mode: 'YEAR' | 'CHAPTER', extraData?: any) => {
    const examId = `past_paper_${Date.now()}`;
    const config = {
      title: title,
      questions: [], 
      timeLimit: 60,
      mode: 'ALL_AT_ONCE',
      type: 'PAST_PAPER',
      ...extraData
    };
    
    localStorage.setItem(`exam_config_${examId}`, JSON.stringify(config));
    navigate(`/exam/${examId}`);
  };

  const handleStartRevision = async (title: string, type: 'YEAR' | 'CHAPTER', refId: string, subject?: string, chapter?: string) => {
      setLoading(true);
      try {
          let questions: QuizQuestion[] = [];
          if (type === 'YEAR') {
              questions = (await fetchQuestionsByExamRefAPI(refId)) as QuizQuestion[];
          } else if (type === 'CHAPTER' && subject && chapter) {
              questions = (await generateQuizFromDB({
                  subject,
                  chapter,
                  topics: [],
                  count: 50
              })) as QuizQuestion[];
          }

          if (questions.length > 0) {
              setRevisionQuestions(questions);
              setRevisionTitle(title);
              setIsRevisionMode(true);
              setShowAllAnswers(false);
              setUserSelections({});
              
              if (currentUser) {
                  try {
                      const saved = (await fetchSavedQuestionsAPI(currentUser.uid)) as any[];
                      const ids = new Set(saved.map((s: any) => s.questionId?._id).filter(Boolean));
                      setSavedQuestionIds(ids);
                  } catch (e) {
                      console.error("Failed to sync saved questions", e);
                  }
              }
          } else {
              alert("দুঃখিত, এই অংশের জন্য কোনো প্রশ্ন পাওয়া যায়নি।");
          }
      } catch (e) {
          console.error(e);
          alert("প্রশ্ন লোড করতে সমস্যা হয়েছে।");
      } finally {
          setLoading(false);
      }
  };

  // useCallback ensures the function reference stays stable, crucial for React.memo child
  const handleOptionClick = useCallback((qIdx: number, oIdx: number) => {
      setUserSelections(prev => {
          // If already selected, do nothing (optional optimization)
          if (prev[qIdx] === oIdx) return prev;
          return { ...prev, [qIdx]: oIdx };
      });
  }, []);

  const toggleSaveQuestion = useCallback(async (question: QuizQuestion) => {
      if (!currentUser) { showToast("লগইন প্রয়োজন", "warning"); return; }
      // @ts-ignore
      const qId = question._id;
      if (!qId) return;

      setSavedQuestionIds(prev => {
          const newSet = new Set(prev);
          if (newSet.has(qId)) {
              newSet.delete(qId);
              unsaveQuestionAPI(currentUser.uid, qId).catch(() => {});
              showToast("বুকমার্ক রিমুভ করা হয়েছে", "info");
          } else {
              newSet.add(qId);
              saveQuestionAPI(currentUser.uid, qId).catch(() => {});
              showToast("প্রশ্নটি বুকমার্ক করা হয়েছে", "success");
          }
          return newSet;
      });
  }, [currentUser, showToast]);

  // Grouping logic for Revision Mode
  const groupedRevisionQuestions = useMemo(() => {
      if (!isRevisionMode) return {} as Record<string, { q: QuizQuestion, originalIdx: number }[]>;
      const groups: Record<string, { q: QuizQuestion, originalIdx: number }[]> = {};
      
      revisionQuestions.forEach((q, idx) => {
          // Normalize grouping using getDisplaySubject to handle 'Physics 1st' & 'Physics 2nd' as 'Physics' etc.
          const groupKey = getDisplaySubject(q.subject);
          if(!groups[groupKey]) groups[groupKey] = [];
          groups[groupKey].push({ q, originalIdx: idx });
      });
      return groups;
  }, [isRevisionMode, revisionQuestions]);

  // Skeleton Loader for Categories
  const CategoriesSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-200 dark:border-gray-700 h-40">
                <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 mb-4"></div>
                <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
        ))}
    </div>
  );

  // Helper to handle category selection
  const handleCategorySelect = (categoryId: string) => {
      setSearchParams({ category: categoryId });
  };

  // Helper to handle back navigation
  const handleBackToCategories = () => {
      // Clear category param to go back to list
      setSearchParams(prev => {
          const newParams = new URLSearchParams(prev);
          newParams.delete('category');
          return newParams;
      });
  };

  // --- REVISION MODE UI ---
  if (isRevisionMode) {
      return (
          <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
              {/* Revision Header */}
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 md:p-4 sticky top-0 z-20 shadow-sm">
                  <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
                      <div className="flex items-center gap-3 w-full md:w-auto">
                          <button 
                              onClick={() => setIsRevisionMode(false)}
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
                          >
                              <ChevronLeft size={20} />
                          </button>
                          <div>
                              <h1 className="text-base md:text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{revisionTitle}</h1>
                              <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">
                                  {revisionQuestions.length} টি প্রশ্ন | রিভিশন মোড
                              </p>
                          </div>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto">
                          <button 
                              onClick={() => {
                                  setShowAllAnswers(prev => !prev);
                                  // NOTE: We don't clear userSelections here to allow toggling back and forth without losing progress
                              }}
                              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${showAllAnswers ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}
                          >
                              {showAllAnswers ? <EyeOff size={14}/> : <Eye size={14}/>} 
                              {showAllAnswers ? 'উত্তর লুকান' : 'উত্তর দেখুন'}
                          </button>
                          
                          <button 
                              onClick={() => {
                                  setUserSelections({});
                                  setShowAllAnswers(false);
                              }}
                              className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200"
                              title="Reset"
                          >
                              <RefreshCw size={16}/>
                          </button>
                      </div>
                  </div>
              </div>

              {/* Questions List */}
              <div className="flex-1 overflow-y-auto p-3 md:p-6 scroll-smooth">
                  <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 pb-20">
                      {Object.entries(groupedRevisionQuestions).map(([subject, items]) => {
                          const questionsList = items as { q: QuizQuestion, originalIdx: number }[];
                          return (
                          <div key={subject} className="space-y-3">
                              {/* Subject Header - Removed sticky class */}
                              <div className="flex items-center justify-center my-4 md:my-6">
                                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-1.5 md:px-6 md:py-2 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm animate-in zoom-in">
                                      <span className="font-black text-gray-800 dark:text-white text-xs md:text-base">
                                          {subject} <span className="text-primary ml-1 font-mono">({questionsList.length})</span>
                                      </span>
                                  </div>
                              </div>

                              {/* Questions for this subject */}
                              <div className="space-y-4">
                                  {questionsList.map(({ q, originalIdx }) => {
                                      // @ts-ignore
                                      const isSaved = savedQuestionIds.has(q._id);
                                      return (
                                          <RevisionQuestionCard
                                              key={originalIdx}
                                              idx={originalIdx}
                                              q={q}
                                              userSelected={userSelections[originalIdx]}
                                              showAllAnswers={showAllAnswers}
                                              isSaved={isSaved}
                                              onOptionClick={handleOptionClick}
                                              onToggleSave={toggleSaveQuestion}
                                          />
                                      );
                                  })}
                              </div>
                          </div>
                      )})}
                  </div>
              </div>
          </div>
      );
  }

  // --- REGULAR VIEW ---
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 md:p-4 sticky top-0 z-10 shadow-sm shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            {selectedCategoryId ? (
              <button 
                onClick={handleBackToCategories}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
            ) : (
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-primary dark:text-blue-400">
                <Archive size={20} />
              </div>
            )}
            
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                {selectedCategory ? selectedCategory.title : 'প্রশ্নব্যাংক আর্কাইভ'}
              </h1>
              <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">
                {selectedCategory ? 'বিগত বছরের প্রশ্ন সমাধান' : 'বিগত বছরের প্রশ্ন ও অধ্যায়ভিত্তিক অনুশীলন'}
              </p>
            </div>
          </div>

          {/* Tabs (Only visible when a category is selected) */}
          {selectedCategoryId && (
            <div className="flex p-1 bg-gray-100 dark:bg-gray-700/50 rounded-xl">
              <button 
                onClick={() => setViewMode('YEAR')}
                className={`flex-1 py-2 text-[10px] md:text-sm font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  viewMode === 'YEAR' 
                    ? 'bg-white dark:bg-gray-600 text-primary dark:text-white shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                <Calendar size={14} /> সাল ভিত্তিক
              </button>
              <button 
                onClick={() => setViewMode('CHAPTER')}
                className={`flex-1 py-2 text-[10px] md:text-sm font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  viewMode === 'CHAPTER' 
                    ? 'bg-white dark:bg-gray-600 text-primary dark:text-white shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                <BookOpen size={14} /> অধ্যায় ভিত্তিক
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 md:p-6 pb-32">
        <div className="max-w-4xl mx-auto">
          
          {loading ? (
              <CategoriesSkeleton />
          ) : !selectedCategoryId ? (
            /* --- MAIN CATEGORY GRID --- */
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-4">
              {categories.length > 0 ? categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary shadow-sm hover:shadow-md transition-all group text-left flex flex-col h-full"
                >
                  <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full ${cat.bg} ${cat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <cat.icon size={20} className="md:w-7 md:h-7" />
                  </div>
                  <h3 className="text-sm md:text-lg font-bold text-gray-800 dark:text-white mb-0.5 group-hover:text-primary transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-[10px] md:text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {cat.papers.length} টি প্রশ্নপত্র উপলব্ধ
                  </p>
                  <div className="mt-auto flex items-center text-[10px] md:text-xs font-bold text-primary dark:text-blue-400">
                    ব্রাউজ করুন <ChevronRight size={12} className="ml-1" />
                  </div>
                </button>
              )) : (
                  <div className="col-span-full text-center py-10 text-gray-500">
                      কোনো প্রশ্নব্যাংক আপলোড করা হয়নি।
                  </div>
              )}
            </div>
          ) : (
            /* --- INSIDE CATEGORY --- */
            <>
              {viewMode === 'YEAR' && selectedCategory && (
                <div className="space-y-3 md:space-y-4 animate-in fade-in slide-in-from-right-8">
                  {selectedCategory.papers.map((paper) => (
                    <div 
                      key={paper.id}
                      className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl md:rounded-[1.5rem] border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-[10px] md:text-xs shrink-0">
                          {paper.year.split('-')[0]}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm md:text-base">
                            {paper.title}
                          </h3>
                          <div className="flex items-center gap-3 text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span className="flex items-center gap-1"><FileText size={10}/> {paper.totalQuestions} প্রশ্ন</span>
                            <span className="flex items-center gap-1"><Clock size={10}/> {paper.time} মিনিট</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleStartRevision(paper.title, 'YEAR', paper.id)}
                            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-bold text-[10px] md:text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center gap-1.5"
                          >
                            <Eye size={14}/> রিভিশন দিন
                          </button>
                          <button 
                            onClick={() => handleStartExam(paper.title, 'YEAR', { timeLimit: paper.time, examRef: paper.id })}
                            className="px-3 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg font-bold text-[10px] md:text-sm shadow-lg shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                          >
                            <Play size={14} fill="currentColor" /> পরীক্ষা দিন
                          </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {viewMode === 'CHAPTER' && selectedCategory && (
                <div className="space-y-3 md:space-y-4 animate-in fade-in slide-in-from-right-8">
                  {filteredSubjectGroups.map((subject, idx) => {
                    const isExpanded = expandedSubject === subject.name;
                    
                    return (
                      <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-[1.5rem] border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                        <button 
                          onClick={() => setExpandedSubject(isExpanded ? null : subject.name)}
                          className={`w-full p-3 md:p-4 flex items-center justify-between transition-colors ${isExpanded ? 'bg-gray-50 dark:bg-gray-700/50' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${subject.color.split(' ')[1]} dark:bg-opacity-20`}>
                              <subject.icon size={20} className={`${subject.color.split(' ')[0]} dark:text-white md:w-6 md:h-6`} />
                            </div>
                            <div className="text-left">
                              <h3 className="font-bold text-gray-900 dark:text-white text-sm md:text-base">{subject.name}</h3>
                              <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                অধ্যায়ভিত্তিক প্রশ্ন
                              </p>
                            </div>
                          </div>
                          {isExpanded ? <ChevronUp size={18} className="text-gray-400"/> : <ChevronDown size={18} className="text-gray-400"/>}
                        </button>

                        {isExpanded && (
                          <div className="border-t border-gray-100 dark:border-gray-700">
                            {subject.papers.map(paperName => {
                              const chapters = SYLLABUS_DB[paperName] ? Object.keys(SYLLABUS_DB[paperName]) : [];
                              if (chapters.length === 0) return null;

                              return (
                                <div key={paperName} className="p-2">
                                  <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-900/30 rounded">
                                    {paperName}
                                  </div>
                                  <div className="mt-1 space-y-1">
                                    {chapters.map((chapter, cIdx) => (
                                      <div
                                        key={cIdx}
                                        className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg group transition-colors"
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-primary transition-colors"></div>
                                          <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-white">
                                            {chapter}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleStartRevision(chapter, 'CHAPTER', '', paperName, chapter)}
                                                className="p-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-500"
                                                title="Revise"
                                            >
                                                <Eye size={12}/>
                                            </button>
                                            <button 
                                                onClick={() => handleStartExam(`${chapter} (${selectedCategory.title})`, 'CHAPTER', { 
                                                    timeLimit: 20, 
                                                    subject: subject.key,
                                                    chapter: chapter,
                                                    source: selectedCategory.id,
                                                    type: 'CHAPTER_WISE'
                                                })}
                                                className="p-1 bg-primary text-white rounded hover:bg-blue-700"
                                                title="Exam"
                                            >
                                                <Play size={12} fill="currentColor"/>
                                            </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {filteredSubjectGroups.length === 0 && (
                      <div className="text-center py-8 text-gray-500 text-xs">
                          এই ক্যাটাগরির জন্য কোনো অধ্যায় পাওয়া যায়নি (অথবা কোনো প্রশ্ন ট্যাগ করা নেই)।
                      </div>
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default QuestionBank;
