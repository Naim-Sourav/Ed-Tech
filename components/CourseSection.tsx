
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, Users, ArrowRight, X, Check, FileText, Lock, ChevronLeft, Activity, PlayCircle, ShoppingBag, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface ContentItem {
  id: string;
  title: string;
  duration: string;
  type: 'LIVE' | 'EXAM' | 'NOTE';
  isLocked: boolean;
}

interface Module {
  title: string;
  items: ContentItem[];
}

interface Course {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  originalPrice: number;
  features: string[];
  theme: 'blue' | 'purple' | 'emerald' | 'orange';
  badge?: string;
  students: number;
  syllabus?: Module[];
}

// --- MOCK DATA ---

const GST_SYLLABUS: Module[] = [
  {
    title: 'Phase 1: Chapter Wise Mission (30 Days)',
    items: [
      { id: 'gst-routine', title: 'Complete 45 Days Routine', duration: 'PDF', type: 'NOTE', isLocked: false },
      { id: 'gst-d1', title: 'Day 01: Physics Vector & Bio Cell', duration: 'Task', type: 'NOTE', isLocked: false },
      { id: 'gst-e1', title: 'Daily Exam 01', duration: '25 Marks', type: 'EXAM', isLocked: false },
    ]
  },
  {
    title: 'Phase 2: Paper Final (08 Days)',
    items: [
      { id: 'gst-e31', title: 'Physics 1st Paper Final', duration: '50 Marks', type: 'EXAM', isLocked: true },
    ]
  }
];

const COURSES: Course[] = [
  {
    id: 'gst-super-focus',
    title: 'GST সুপার ফোকাস চ্যালেঞ্জ',
    subtitle: '৪৫ দিনের চ্যালেঞ্জ। ডিসিপ্লিন, ডেডিকেশন, ডমিনেশন।',
    price: 500,
    originalPrice: 1500,
    students: 1540,
    theme: 'orange',
    badge: 'Special Batch',
    features: [
      '৪৫ দিনের ফিক্সড রুটিন',
      'প্রতিদিন টার্গেট ও এক্সাম',
      'সলভ শিট ও মেরিট লিস্ট',
      'ফেজ-ভিত্তিক পূর্ণাঙ্গ প্রস্তুতি',
      'নেগেটিভ মার্কিং প্র্যাকটিস'
    ],
    syllabus: GST_SYLLABUS
  }
];

const CourseSection: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // Main Views: LIST, PLAYER
  const [viewMode, setViewMode] = useState<'LIST' | 'PLAYER'>('LIST');
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  
  // Contexts
  const { isEnrolled } = useAuth();

  // Player State
  const [activeContentId, setActiveContentId] = useState<string>('gst-routine');

  // Filter Courses
  const myCourses = COURSES.filter(c => isEnrolled(c.id));
  const availableCourses = COURSES.filter(c => !isEnrolled(c.id));

  // --- ACTIONS ---

  const handleEnrollClick = (course: Course) => {
      navigate('/payment', { state: { item: course, type: 'COURSE' } });
  };

  const handleViewDetails = (courseId: string) => {
      if (courseId === 'gst-super-focus') {
          navigate('/gst-special');
      } else {
          // Future courses navigation
          console.log("Details for", courseId);
      }
  };

  const openPlayer = (course: Course) => {
      setActiveCourse(course);
      setViewMode('PLAYER');
  }

  // --- STYLES HELPER ---
  const getThemeStyles = (theme: string) => {
    switch (theme) {
      case 'blue': return {
        bg: 'bg-blue-50 dark:bg-blue-900/10',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-100 dark:border-blue-800',
        button: 'bg-blue-600 hover:bg-blue-700',
        badge: 'bg-blue-100 text-blue-700'
      };
      case 'purple': return {
        bg: 'bg-purple-50 dark:bg-purple-900/10',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-100 dark:border-purple-800',
        button: 'bg-purple-600 hover:bg-purple-700',
        badge: 'bg-purple-100 text-purple-700'
      };
      case 'emerald': return {
        bg: 'bg-emerald-50 dark:bg-emerald-900/10',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-100 dark:border-emerald-800',
        button: 'bg-emerald-600 hover:bg-emerald-700',
        badge: 'bg-emerald-100 text-emerald-700'
      };
      case 'orange': return {
        bg: 'bg-orange-50 dark:bg-orange-900/10',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-100 dark:border-orange-800',
        button: 'bg-orange-600 hover:bg-orange-700',
        badge: 'bg-orange-100 text-orange-700'
      };
      default: return {
        bg: 'bg-gray-50',
        text: 'text-gray-600',
        border: 'border-gray-200',
        button: 'bg-gray-800',
        badge: 'bg-gray-100 text-gray-700'
      };
    }
  };

  const renderCourseCard = (course: Course, isOwned: boolean) => {
      const themeStyles = getThemeStyles(course.theme);
      return (
        <div key={course.id} className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col hover:shadow-xl transition-all group">
            <div className={`p-6 border-b border-gray-100 dark:border-gray-700 ${themeStyles.bg}`}>
                <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${themeStyles.badge}`}>
                        {course.badge}
                    </span>
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                        <Users size={16}/> {course.students}
                    </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{course.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{course.subtitle}</p>
            </div>

            <div className="p-6 flex-1 flex flex-col">
                <div className="space-y-3 mb-6 flex-1">
                    {course.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                            <CheckCircle size={16} className={`mt-0.5 shrink-0 ${themeStyles.text}`}/>
                            <span className="text-sm text-gray-600 dark:text-gray-300">{feat}</span>
                        </div>
                    ))}
                </div>

                {/* View Details Button */}
                <button
                    onClick={() => handleViewDetails(course.id)}
                    className="w-full mb-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 group"
                >
                    <Info size={16} className="group-hover:text-primary transition-colors"/> বিস্তারিত জানুন
                </button>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div>
                        {isOwned ? (
                            <span className="text-green-600 font-bold text-sm flex items-center gap-1"><CheckCircle size={14}/> {t('course_active')}</span>
                        ) : (
                            <>
                                <span className="text-xs text-gray-400 line-through block">৳{course.originalPrice}</span>
                                <span className="text-xl font-bold text-gray-900 dark:text-white">৳{course.price}</span>
                            </>
                        )}
                    </div>
                    {isOwned ? (
                        <button 
                            onClick={() => openPlayer(course)}
                            className={`px-6 py-2.5 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95 ${themeStyles.button}`}
                        >
                            {t('course_enroll')} <ArrowRight size={16}/>
                        </button>
                    ) : (
                        <button 
                            onClick={() => handleEnrollClick(course)}
                            className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-100 rounded-xl font-bold transition-all shadow-lg active:scale-95"
                        >
                            {t('course_buy')}
                        </button>
                    )}
                </div>
            </div>
        </div>
      );
  };

  // --- RENDER: COURSE PLAYER ---
  if (viewMode === 'PLAYER' && activeCourse) {
    const activeItem = activeCourse.syllabus?.flatMap(m => m.items).find(i => i.id === activeContentId);

    return (
      <div className="h-full flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between shadow-sm z-20">
           <div className="flex items-center gap-3">
             <button 
               onClick={() => setViewMode('LIST')} 
               className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
             >
               <ChevronLeft size={18} className="text-gray-600 dark:text-gray-300" />
             </button>
             <div>
               <h3 className="font-bold text-gray-800 dark:text-white text-sm md:text-base line-clamp-1">{activeCourse.title}</h3>
             </div>
           </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Player Area */}
            <div className="flex-1 bg-black flex items-center justify-center relative">
                {activeItem?.type === 'LIVE' ? (
                    <div className="text-center text-white p-4">
                        <PlayCircle size={48} className="mx-auto mb-2 opacity-50" />
                        <p>Video Player Placeholder</p>
                        <p className="text-sm text-gray-400">{activeItem.title}</p>
                    </div>
                ) : activeItem?.type === 'NOTE' ? (
                    <div className="text-center text-white p-4">
                        <FileText size={48} className="mx-auto mb-2 opacity-50" />
                        <p>PDF Viewer Placeholder</p>
                    </div>
                ) : (
                    <div className="text-center text-white p-4">
                        <Activity size={48} className="mx-auto mb-2 opacity-50" />
                        <p>Quiz Interface Placeholder</p>
                    </div>
                )}
            </div>

            {/* Sidebar Syllabus */}
            <div className="w-full md:w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
                {activeCourse.syllabus?.map((module, idx) => (
                    <div key={idx} className="border-b border-gray-100 dark:border-gray-700">
                        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 font-bold text-xs md:text-sm text-gray-700 dark:text-gray-300 sticky top-0">
                            {module.title}
                        </div>
                        <div>
                            {module.items.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => !item.isLocked && setActiveContentId(item.id)}
                                    className={`w-full text-left p-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${activeContentId === item.id ? 'bg-blue-50 dark:bg-blue-900/20 text-primary dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
                                >
                                    <div className="mt-0.5">
                                        {item.isLocked ? <Lock size={14} className="text-gray-400"/> : 
                                         item.type === 'LIVE' ? <PlayCircle size={14}/> :
                                         item.type === 'NOTE' ? <FileText size={14}/> : <Activity size={14}/>}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs md:text-sm font-medium line-clamp-2">{item.title}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{item.duration}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
  }

  // --- RENDER: LIST VIEW ---
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-40">
            
            {/* Section: Active Courses */}
            <div className="mb-10">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="text-green-500" size={24}/> আপনার কোর্সসমূহ
                </h2>
                
                {myCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {myCourses.map(course => renderCourseCard(course, true))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-dashed border-gray-300 dark:border-gray-700">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <BookOpen size={32}/>
                        </div>
                        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-2">কোনো এক্টিভ কোর্স নেই</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                            আপনার প্রস্তুতি শুরু করতে নিচের তালিকা থেকে পছন্দের কোর্সে এনরোল করুন।
                        </p>
                        <button 
                            onClick={() => document.getElementById('available-courses')?.scrollIntoView({ behavior: 'smooth'})} 
                            className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg hover:bg-blue-700 transition-colors"
                        >
                            কোর্স দেখুন
                        </button>
                    </div>
                )}
            </div>

            {/* Section: Available Courses */}
            <div id="available-courses">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <ShoppingBag className="text-orange-500" size={24}/> চলমান ও আপকামিং কোর্স
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-5xl">
                    {availableCourses.map(course => renderCourseCard(course, false))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default CourseSection;
