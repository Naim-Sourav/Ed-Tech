import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    PenTool, 
    Layers, 
    Swords, 
    BookOpen, 
    RotateCcw,
    ChevronRight,
    Users,
    GraduationCap,
    FlaskConical,
    Activity,
    BookMarked
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { SHARED_COURSES } from '../data/courses';

const EXAM_FEATURES = [
    { id: 'mock', title: 'মক টেস্ট', desc: 'পূর্ণাঙ্গ প্রস্তুতি', icon: PenTool, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', path: '/mock-test' },
    { id: 'flashcard', title: 'ফ্ল্যাশ কার্ড', desc: 'দ্রুত রিভিশন', icon: Layers, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', path: '/flashcards' },
    { id: 'battle', title: 'কুইজ ব্যাটল', desc: 'বন্ধুদের সাথে', icon: Swords, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10', path: '/battle' },
    { id: 'qbank', title: 'প্রশ্নব্যাংক', desc: 'বিগত সালের প্রশ্ন', icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', path: '/qbank' },
    { id: 'retake', title: 'রিটেক', desc: 'ভুলগুলো শুধরে', icon: RotateCcw, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10', path: '/wrong-questions' },
];

const EXAM_BATCHES = SHARED_COURSES.filter(course => course.isExamBatch);

const ExamHub: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'features' | 'batches'>('features');

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-black text-gray-900 dark:text-gray-100 pb-24 overflow-x-hidden font-sans">
            <div className="max-w-2xl mx-auto px-4 pt-2 md:pt-4 w-full flex flex-col gap-4 md:gap-6">
                {/* Header Tabs */}
                <div className="flex items-center justify-center gap-8 border-b border-gray-200 dark:border-zinc-800 pb-2">
                    <button 
                        onClick={() => setActiveTab('features')}
                        className={`text-[17px] md:text-[19px] font-bold pb-2 relative transition-colors ${activeTab === 'features' ? 'text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                        এক্সাম ফিচার্স
                        {activeTab === 'features' && (
                            <motion.div 
                                layoutId="exam-tab-indicator"
                                className="absolute bottom-[-9px] left-0 right-0 h-[3px] bg-primary rounded-t-full"
                            />
                        )}
                    </button>
                    <button 
                        onClick={() => setActiveTab('batches')}
                        className={`text-[17px] md:text-[19px] font-bold pb-2 relative transition-colors ${activeTab === 'batches' ? 'text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                        এক্সাম ব্যাচ
                        {activeTab === 'batches' && (
                            <motion.div 
                                layoutId="exam-tab-indicator"
                                className="absolute bottom-[-9px] left-0 right-0 h-[3px] bg-primary rounded-t-full"
                            />
                        )}
                    </button>
                </div>

                {/* Content Area */}
                <div className="pt-2">
                    <AnimatePresence mode="wait">
                        {activeTab === 'features' ? (
                            <motion.div 
                                key="features"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4"
                            >
                                {EXAM_FEATURES.map((feat) => (
                                    <motion.div 
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        key={feat.id}
                                        onClick={() => navigate(feat.path)}
                                        className="aspect-square bg-white dark:bg-[#121212] p-4 rounded-[24px] md:rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm cursor-pointer hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 md:gap-4 group"
                                    >
                                        <div className={`w-14 h-14 md:w-16 md:h-16 rounded-[20px] flex items-center justify-center ${feat.bg} text-gray-800 dark:text-white group-hover:scale-110 transition-transform shadow-sm`}>
                                            <feat.icon size={28} strokeWidth={2.5} className={feat.color} />
                                        </div>
                                        <div className="flex flex-col items-center text-center">
                                            <span className="font-bold text-[15px] md:text-[17px] text-gray-800 dark:text-gray-100 group-hover:text-primary transition-colors">
                                                {feat.title}
                                            </span>
                                            <span className="text-[11px] md:text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                                                {feat.desc}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="batches"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col gap-3.5 md:gap-4"
                            >
                                {SHARED_COURSES.map((batch) => (
                                    <motion.div 
                                        whileHover={{ y: -2 }}
                                        key={batch.id}
                                        onClick={() => navigate(`/exam-batch/${batch.id}`)}
                                        className="w-full bg-white dark:bg-[#121212] p-4 md:p-5 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm cursor-pointer hover:shadow-md hover:border-gray-200 dark:hover:border-white/10 transition-all group overflow-hidden relative flex flex-col"
                                    >
                                        {/* Gradient Blob */}
                                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${batch.color} opacity-5 blur-2xl -mr-10 -mt-10 rounded-full group-hover:opacity-10 transition-opacity duration-500`}></div>

                                        {batch.image && (
                                            <div className="w-full aspect-[2/1] md:aspect-[2.5/1] rounded-2xl mb-5 overflow-hidden relative border border-gray-100 dark:border-white/5 shrink-0 bg-gray-100 dark:bg-zinc-900">
                                                <img src={batch.image} alt={batch.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                <div className="absolute inset-0 border border-black/5 dark:border-white/5 rounded-2xl pointer-events-none"></div>
                                            </div>
                                        )}

                                        <div className="flex items-start gap-4 relative z-10 flex-col md:flex-row">
                                            {!batch.image && (
                                                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br ${batch.color} text-white shadow-md group-hover:scale-105 transition-transform`}>
                                                    <batch.icon size={24} strokeWidth={2} className="opacity-95 md:w-8 md:h-8" />
                                                </div>
                                            )}
                                            
                                            {/* Content */}
                                            <div className="flex flex-col flex-1 min-w-0 pt-0.5">
                                                <h4 className="text-[18px] md:text-[20px] font-bold text-gray-900 dark:text-gray-100 leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-1">
                                                    {batch.title}
                                                </h4>
                                                <p className="text-[14px] md:text-[15px] text-gray-500 dark:text-gray-400 font-medium tracking-wide mb-4">
                                                    {batch.subtitle}
                                                </p>
                                                
                                                {/* Tags */}
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {batch.tags?.map(tag => (
                                                        <span key={tag} className="px-2.5 py-1 bg-gray-50 dark:bg-zinc-900 text-gray-600 dark:text-gray-300 text-[11px] md:text-[12px] font-bold rounded-[8px] whitespace-nowrap border border-gray-100 dark:border-zinc-800/50">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>

                                                {/* Bottom Stats */}
                                                <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                                                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-900/50 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-zinc-800">
                                                        <Users size={15} className="text-gray-400 dark:text-gray-500" />
                                                        <span className="text-[12px] md:text-[13px] font-bold">{batch.students} ভর্তি</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-900/50 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-zinc-800">
                                                        <BookMarked size={15} className="text-gray-400 dark:text-gray-500" />
                                                        <span className="text-[12px] md:text-[13px] font-bold">{batch.exams} এক্সাম</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
};

export default ExamHub;

