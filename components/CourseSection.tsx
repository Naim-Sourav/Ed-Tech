
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, CheckCircle, Users, ArrowRight, FileText, Lock, ChevronLeft, Activity, PlayCircle, ShoppingBag, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SHARED_COURSES, Course, Module, ContentItem } from '../data/courses';

const COURSES: Course[] = SHARED_COURSES;

const CourseSection: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL Params State Logic
  const activeCourseId = searchParams.get('courseId');
  const activeCourse = activeCourseId ? COURSES.find(c => c.id === activeCourseId) || null : null;
  const viewMode = activeCourse ? 'PLAYER' : 'LIST';
  
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
      navigate(`/exam-batch/${courseId}`);
  };

  const openPlayer = (course: Course) => {
      setSearchParams({ courseId: course.id });
  }

  const closePlayer = () => {
      setSearchParams({});
  }

  // --- STYLES HELPER ---
  const getThemeStyles = (theme: string) => {
    switch (theme) {
      case 'blue': return {
        bg: 'bg-purple-50 dark:bg-purple-900/10',
        text: 'text-purple-700 dark:text-purple-400',
        border: 'border-purple-100 dark:border-purple-800',
        button: 'bg-purple-600 hover:bg-purple-700',
        badge: 'bg-purple-100 text-purple-700'
      };
      case 'purple': return {
        bg: 'bg-violet-50 dark:bg-violet-900/10',
        text: 'text-violet-600 dark:text-violet-400',
        border: 'border-violet-100 dark:border-violet-800',
        button: 'bg-violet-600 hover:bg-violet-700',
        badge: 'bg-violet-100 text-violet-700'
      };
      case 'emerald': return {
        bg: 'bg-red-50 dark:bg-red-900/10',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-100 dark:border-red-800',
        button: 'bg-red-600 hover:bg-red-700',
        badge: 'bg-red-100 text-red-700'
      };
      case 'orange': return {
        bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/10',
        text: 'text-fuchsia-700 dark:text-fuchsia-400',
        border: 'border-fuchsia-100 dark:border-fuchsia-800',
        button: 'bg-fuchsia-600 hover:bg-fuchsia-700',
        badge: 'bg-fuchsia-100 text-fuchsia-700'
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
        <div key={course.id} className="bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl rounded-3xl md:rounded-[2.5rem] border border-white/40 dark:border-white/10 shadow-xl shadow-purple-500/5 overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-purple-500/10 transition-all group active-scale">
            <div className={`p-5 md:p-6 border-b border-white/20 dark:border-white/5 ${themeStyles.bg} relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                {course.image && (
                    <div className="w-full aspect-[2/1] md:aspect-[2.5/1] rounded-2xl mb-4 overflow-hidden relative border border-white/20 dark:border-white/5 shadow-sm">
                        <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                )}
                <div className="flex justify-between items-start mb-3 md:mb-4 relative z-10">
                    <span className={`px-2.5 py-0.5 rounded-full text-[12px] md:text-xs font-bold uppercase tracking-wider shadow-sm ${themeStyles.badge}`}>
                        {course.badge}
                    </span>
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium">
                        <Users size={14} className="md:w-4 md:h-4"/> {course.students}
                    </div>
                </div>
                <h2 className="text-lg md:text-xl font-black text-gray-900 dark:text-white mb-1 tracking-tight relative z-10">{course.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm font-medium relative z-10">{course.subtitle}</p>
            </div>

            <div className="p-5 md:p-6 flex-1 flex flex-col bg-white/40 dark:bg-transparent">
                <div className="space-y-2 md:space-y-3 mb-4 md:mb-6 flex-1">
                    {course.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                            <CheckCircle size={14} className={`mt-0.5 shrink-0 ${themeStyles.text} md:w-4 md:h-4`}/>
                            <span className="text-xs md:text-sm text-gray-600 dark:text-gray-300 font-medium">{feat}</span>
                        </div>
                    ))}
                </div>

                {/* View Details Button */}
                <button
                    onClick={() => handleViewDetails(course.id)}
                    className="w-full mb-3 md:mb-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-200 font-bold text-xs md:text-sm hover:bg-white dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 group shadow-sm"
                >
                    <Info size={14} className="group-hover:text-primary transition-colors md:w-4 md:h-4"/> বিস্তারিত জানুন
                </button>

                <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-gray-200/50 dark:border-zinc-800/50">
                    <div>
                        {isOwned ? (
                            <span className="text-green-600 font-bold text-xs md:text-sm flex items-center gap-1"><CheckCircle size={12} className="md:w-3.5 md:h-3.5"/> {"Active Plan"}</span>
                        ) : (
                            <>
                                <span className="text-[12px] md:text-xs text-gray-400 line-through block font-bold">৳{course.originalPrice}</span>
                                {course.price === 0 ? (
                                    <span className="text-lg md:text-xl font-black text-green-600 dark:text-green-400 tracking-tight">FREE</span>
                                ) : (
                                    <span className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight">৳{course.price}</span>
                                )}
                            </>
                        )}
                    </div>
                    {isOwned ? (
                        <button 
                            onClick={() => openPlayer(course)}
                            className={`px-5 py-2 md:px-6 md:py-2.5 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95 text-xs md:text-sm uppercase tracking-wider ${themeStyles.button}`}
                        >
                            {"ভর্তি হোন"} <ArrowRight size={14} className="md:w-4 md:h-4"/>
                        </button>
                    ) : (
                        <button 
                            onClick={() => handleEnrollClick(course)}
                            className="px-5 py-2 md:px-6 md:py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-100 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 text-xs md:text-sm uppercase tracking-wider"
                        >
                            {course.price === 0 ? "ফ্রি এনরোল" : "কিনুন"}
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
      <div className="h-full flex flex-col bg-gray-100 dark:bg-black overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-4 py-2.5 md:py-3 flex items-center justify-between shadow-sm z-20">
           <div className="flex items-center gap-2 md:gap-3">
             <button 
               onClick={closePlayer} 
               className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
             >
               <ChevronLeft size={18} className="text-gray-600 dark:text-gray-300 md:w-5 md:h-5" />
             </button>
             <div>
               <h3 className="font-bold text-gray-800 dark:text-white text-xs md:text-base line-clamp-1">{activeCourse.title}</h3>
             </div>
           </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Player Area */}
            <div className="flex-1 bg-black flex items-center justify-center relative">
                {activeItem?.type === 'LIVE' ? (
                    <div className="text-center text-white p-4">
                        <PlayCircle size={40} className="mx-auto mb-2 opacity-50 md:w-12 md:h-12" />
                        <p className="text-sm">Video Player Placeholder</p>
                        <p className="text-xs text-gray-400 mt-1">{activeItem.title}</p>
                    </div>
                ) : activeItem?.type === 'NOTE' ? (
                    <div className="text-center text-white p-4">
                        <FileText size={40} className="mx-auto mb-2 opacity-50 md:w-12 md:h-12" />
                        <p className="text-sm">PDF Viewer Placeholder</p>
                    </div>
                ) : (
                    <div className="text-center text-white p-4">
                        <Activity size={40} className="mx-auto mb-2 opacity-50 md:w-12 md:h-12" />
                        <p className="text-sm">Quiz Interface Placeholder</p>
                    </div>
                )}
            </div>

            {/* Sidebar Syllabus */}
            <div className="w-full md:w-80 bg-white dark:bg-zinc-900 border-l border-gray-200 dark:border-zinc-800 overflow-y-auto">
                {activeCourse.syllabus?.map((module, idx) => (
                    <div key={idx} className="border-b border-gray-100 dark:border-zinc-800">
                        <div className="p-3 bg-gray-50 dark:bg-black/50 font-bold text-xs text-gray-700 dark:text-gray-300 sticky top-0">
                            {module.title}
                        </div>
                        <div>
                            {module.items.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => !item.isLocked && setActiveContentId(item.id)}
                                    className={`w-full text-left p-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${activeContentId === item.id ? 'bg-purple-50 dark:bg-purple-900/20 text-primary dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}`}
                                >
                                    <div className="mt-0.5">
                                        {item.isLocked ? <Lock size={14} className="text-gray-400"/> : 
                                         item.type === 'LIVE' ? <PlayCircle size={14}/> :
                                         item.type === 'NOTE' ? <FileText size={14}/> : <Activity size={14}/>}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium line-clamp-2">{item.title}</p>
                                        <p className="text-[12px] text-gray-400 mt-0.5">{item.duration}</p>
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
    <div className="flex flex-col bg-gray-50 dark:bg-black transition-colors min-h-full relative overflow-hidden pb-24">
        {/* Ambient Background Glows */}
        <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="flex-1 p-3 md:p-8 pb-4 relative z-10">
            
            {/* Section: Active Courses */}
            <div className="mb-8 md:mb-10">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-3 md:mb-4 flex items-center gap-2">
                    <CheckCircle className="text-green-500" size={20}/> আপনার কোর্সসমূহ
                </h2>
                
                {myCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
                        {myCourses.map(course => renderCourseCard(course, true))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 md:p-8 text-center border border-dashed border-gray-300 dark:border-zinc-800">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 text-gray-400">
                            <BookOpen size={24} className="md:w-8 md:h-8"/>
                        </div>
                        <h3 className="text-base md:text-lg font-bold text-gray-700 dark:text-gray-200 mb-1">কোনো এক্টিভ কোর্স নেই</h3>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto">
                            আপনার প্রস্তুতি শুরু করতে নিচের তালিকা থেকে পছন্দের কোর্সে এনরোল করুন।
                        </p>
                        <button 
                            onClick={() => document.getElementById('available-courses')?.scrollIntoView({ behavior: 'smooth'})} 
                            className="px-5 py-2 md:px-6 md:py-2.5 bg-primary text-white rounded-xl font-bold text-xs md:text-sm shadow-lg hover:bg-purple-700 transition-colors"
                        >
                            কোর্স দেখুন
                        </button>
                    </div>
                )}
            </div>

            {/* Section: Available Courses */}
            <div id="available-courses">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-3 md:mb-4 flex items-center gap-2">
                    <ShoppingBag className="text-purple-700 dark:text-purple-400" size={20}/> চলমান ও আপকামিং কোর্স
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6 max-w-5xl">
                    {availableCourses.map(course => renderCourseCard(course, false))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default CourseSection;
