
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Loader2
} from 'lucide-react';
import { SYLLABUS_DB } from '../services/syllabusData';
import { fetchQuestionPapersAPI } from '../services/api';
import { QuestionPaperMetadata } from '../types';

interface Category {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  papers: QuestionPaperMetadata[];
}

// Subject Mapping for Chapter-wise view
const SUBJECT_GROUPS = [
  {
    name: 'জীববিজ্ঞান (Biology)',
    icon: Dna,
    color: 'text-green-600 bg-green-100',
    papers: ['Biology 1st Paper', 'Biology 2nd Paper']
  },
  {
    name: 'রসায়ন (Chemistry)',
    icon: Beaker,
    color: 'text-orange-600 bg-orange-100',
    papers: ['Chemistry 1st Paper', 'Chemistry 2nd Paper']
  },
  {
    name: 'পদার্থবিজ্ঞান (Physics)',
    icon: Atom,
    color: 'text-purple-600 bg-purple-100',
    papers: ['Physics 1st Paper', 'Physics 2nd Paper']
  },
  {
    name: 'ইংরেজি (English)',
    icon: Languages,
    color: 'text-blue-600 bg-blue-100',
    papers: ['English']
  },
  {
    name: 'সাধারণ জ্ঞান (GK)',
    icon: Globe,
    color: 'text-cyan-600 bg-cyan-100',
    papers: ['General Knowledge']
  },
  {
    name: 'মানসিক দক্ষতা (IQ)',
    icon: BrainCircuit,
    color: 'text-pink-600 bg-pink-100',
    papers: ['Mental Ability']
  },
  {
    name: 'আইসিটি (ICT)',
    icon: Cpu,
    color: 'text-indigo-600 bg-indigo-100',
    papers: ['ICT']
  }
];

const SOURCE_CONFIG: Record<string, { icon: any, color: string, bg: string, title: string }> = {
    'Medical': { icon: Stethoscope, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', title: 'মেডিকেল প্রশ্নব্যাংক' },
    'Dental': { icon: Activity, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-900/20', title: 'ডেন্টাল প্রশ্নব্যাংক' },
    'BUET': { icon: Cpu, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', title: 'বুয়েট প্রশ্নব্যাংক' },
    'Dhaka_University_A': { icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', title: 'ঢাবি (ক) প্রশ্নব্যাংক' },
    // Default fallback
    'DEFAULT': { icon: Archive, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', title: 'অন্যান্য প্রশ্নব্যাংক' }
};

const QuestionBank: React.FC = () => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState<QuestionPaperMetadata[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [viewMode, setViewMode] = useState<'YEAR' | 'CHAPTER'>('YEAR');
  const [loading, setLoading] = useState(true);
  
  // Chapter View State
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  useEffect(() => {
      const loadPapers = async () => {
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

  const categories: Category[] = React.useMemo(() => {
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

  const handleStartExam = (title: string, mode: 'YEAR' | 'CHAPTER', extraData?: any) => {
    // Navigate to QuizArena with config
    const config = {
      title: title,
      questions: [], // Initially empty, will fetch in QuizArena
      time: 60, 
      mode: 'ALL_AT_ONCE',
      type: 'PAST_PAPER',
      ...extraData
    };
    
    localStorage.setItem('quiz_launch_config', JSON.stringify(config));
    navigate('/quiz');
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-10 shadow-sm shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            {selectedCategory ? (
              <button 
                onClick={() => setSelectedCategory(null)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
            ) : (
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-primary dark:text-blue-400">
                <Archive size={24} />
              </div>
            )}
            
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedCategory ? selectedCategory.title : 'প্রশ্নব্যাংক আর্কাইভ'}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {selectedCategory ? 'বিগত বছরের প্রশ্ন সমাধান' : 'বিগত বছরের প্রশ্ন ও অধ্যায়ভিত্তিক অনুশীলন'}
              </p>
            </div>
          </div>

          {/* Tabs (Only visible when a category is selected) */}
          {selectedCategory && (
            <div className="flex p-1 bg-gray-100 dark:bg-gray-700/50 rounded-xl">
              <button 
                onClick={() => setViewMode('YEAR')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  viewMode === 'YEAR' 
                    ? 'bg-white dark:bg-gray-600 text-primary dark:text-white shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                <Calendar size={16} /> সাল ভিত্তিক
              </button>
              <button 
                onClick={() => setViewMode('CHAPTER')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  viewMode === 'CHAPTER' 
                    ? 'bg-white dark:bg-gray-600 text-primary dark:text-white shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                <BookOpen size={16} /> অধ্যায় ভিত্তিক
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-32">
        <div className="max-w-4xl mx-auto">
          
          {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary"/></div>
          ) : !selectedCategory ? (
            /* --- MAIN CATEGORY GRID --- */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4">
              {categories.length > 0 ? categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary shadow-sm hover:shadow-md transition-all group text-left flex flex-col h-full"
                >
                  <div className={`w-14 h-14 rounded-full ${cat.bg} ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <cat.icon size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1 group-hover:text-primary transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {cat.papers.length} টি প্রশ্নপত্র উপলব্ধ
                  </p>
                  <div className="mt-auto flex items-center text-xs font-bold text-primary dark:text-blue-400">
                    ব্রাউজ করুন <ChevronRight size={14} className="ml-1" />
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
              {viewMode === 'YEAR' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-8">
                  {selectedCategory.papers.map((paper) => (
                    <div 
                      key={paper.id}
                      className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-xs shrink-0">
                          {paper.year.split('-')[0]}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            {paper.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span className="flex items-center gap-1"><FileText size={12}/> {paper.totalQuestions} প্রশ্ন</span>
                            <span className="flex items-center gap-1"><Clock size={12}/> {paper.time} মিনিট</span>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleStartExam(paper.title, 'YEAR', { time: paper.time, examRef: paper.id })}
                        className="px-5 py-2.5 bg-primary hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <Play size={16} fill="currentColor" /> পরীক্ষা দিন
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {viewMode === 'CHAPTER' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-8">
                  {SUBJECT_GROUPS.map((subject, idx) => {
                    const isExpanded = expandedSubject === subject.name;
                    
                    return (
                      <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                        <button 
                          onClick={() => setExpandedSubject(isExpanded ? null : subject.name)}
                          className={`w-full p-4 flex items-center justify-between transition-colors ${isExpanded ? 'bg-gray-50 dark:bg-gray-700/50' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-lg ${subject.color.split(' ')[1]} dark:bg-opacity-20`}>
                              <subject.icon size={24} className={`${subject.color.split(' ')[0]} dark:text-white`} />
                            </div>
                            <div className="text-left">
                              <h3 className="font-bold text-gray-900 dark:text-white">{subject.name}</h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                অধ্যায়ভিত্তিক প্রশ্ন
                              </p>
                            </div>
                          </div>
                          {isExpanded ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
                        </button>

                        {isExpanded && (
                          <div className="border-t border-gray-100 dark:border-gray-700">
                            {subject.papers.map(paperName => {
                              const chapters = SYLLABUS_DB[paperName] ? Object.keys(SYLLABUS_DB[paperName]) : [];
                              if (chapters.length === 0) return null;

                              return (
                                <div key={paperName} className="p-2">
                                  <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-900/30 rounded">
                                    {paperName}
                                  </div>
                                  <div className="mt-1 space-y-1">
                                    {chapters.map((chapter, cIdx) => (
                                      <button
                                        key={cIdx}
                                        // TODO: Pass specific config to filter ONLY questions from this chapter AND the current selectedCategory source
                                        // Currently passing a placeholder filter concept
                                        onClick={() => handleStartExam(`${chapter} (${selectedCategory.title})`, 'CHAPTER', { 
                                            time: 20, 
                                            // The backend needs to support filtering by both chapter AND source (examRef prefix) for this to work perfectly.
                                            // For now, this will load random questions from that chapter.
                                            // Ideally: filter: { chapter: chapter, source: selectedCategory.id } 
                                        })}
                                        className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg group transition-colors"
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-primary transition-colors"></div>
                                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-white">
                                            {chapter}
                                          </span>
                                        </div>
                                        <div className="flex items-center text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                          পরীক্ষা দিন <ChevronRight size={14}/>
                                        </div>
                                      </button>
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
