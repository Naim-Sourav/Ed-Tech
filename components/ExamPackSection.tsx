
import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { FileCheck, ShoppingBag, ArrowRight, CheckCircle2, ChevronLeft, Timer, CheckCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ExamPack } from '../types';
import { fetchExamPacksAPI } from '../services/api';

const ExamPackSection: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [packs, setPacks] = useState<ExamPack[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation State derived from URL
  const activePackId = searchParams.get('packId');
  const activePack = activePackId ? packs.find(p => p.id === activePackId) : null;
  const viewMode = activePack ? 'PLAYER' : 'LIST';

  const { isEnrolled } = useAuth();

  useEffect(() => {
    const loadPacks = async () => {
      try {
        const data = await fetchExamPacksAPI();
        setPacks(data);
      } catch (err) {
        logger.error("Failed to load exam packs", err);
      } finally {
        setLoading(false);
      }
    };
    loadPacks();
  }, []);

  const handleBuyClick = (pack: ExamPack) => {
    navigate('/payment', { state: { item: pack, type: 'PACK' } });
  };

  const openPack = (pack: ExamPack) => {
      setSearchParams({ packId: pack.id });
  };

  const closePack = () => {
      setSearchParams({});
  };

  // Theme helper
  const getThemeColor = (theme: string) => {
    switch (theme) {
      case 'emerald': return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/30 dark:border-red-800';
      case 'blue': return 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900/30 dark:border-orange-800';
      case 'purple': return 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/30 dark:border-amber-800';
      case 'orange': return 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900/30 dark:border-orange-800';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-zinc-900 dark:border-zinc-800';
    }
  };

  // Skeleton Loader
  const PacksSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl animate-pulse">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 h-64 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-zinc-800 h-24 bg-gray-50 dark:bg-black">
                    <div className="flex justify-between mb-4">
                        <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="p-6 space-y-4">
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-xl mt-4"></div>
                </div>
            </div>
        ))}
    </div>
  );

  // --- RENDER: PACK PLAYER (Exam List) ---
  if (viewMode === 'PLAYER' && activePack) {
      // Mock Exams for the pack (since we don't have real individual exam DB yet)
      const mockExams = Array.from({length: activePack.totalExams}, (_, i) => ({
          id: i + 1,
          title: `Model Test ${i + 1}`,
          duration: '60 Min',
          marks: 100,
          status: i < 2 ? 'COMPLETED' : 'AVAILABLE'
      }));

      return (
          <div className="h-full flex flex-col bg-gray-50 dark:bg-black overflow-hidden">
              <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between shadow-sm z-20">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={closePack} 
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-white text-sm md:text-base line-clamp-1">{activePack.title}</h3>
                        <p className="text-xs text-gray-500">{activePack.totalExams} Exams available</p>
                    </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-8">
                  <div className="max-w-4xl mx-auto grid gap-4">
                      {mockExams.map((exam) => (
                          <div key={exam.id} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm flex items-center justify-between group hover:border-primary/50 transition-all">
                              <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${exam.status === 'COMPLETED' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                                      {exam.status === 'COMPLETED' ? <CheckCircle size={20}/> : <span className="text-sm">{exam.id}</span>}
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-gray-800 dark:text-white">{exam.title}</h4>
                                      <div className="flex items-center gap-3 text-xs text-gray-500">
                                          <span className="flex items-center gap-1"><Timer size={12}/> {exam.duration}</span>
                                          <span className="flex items-center gap-1"><FileCheck size={12}/> {exam.marks} Marks</span>
                                      </div>
                                  </div>
                              </div>
                              <button 
                                onClick={() => alert("Starting Exam... (Demo)")}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${exam.status === 'COMPLETED' ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-primary text-white hover:bg-orange-700 shadow-sm'}`}
                              >
                                {exam.status === 'COMPLETED' ? 'Review' : 'Start'}
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      );
  }

  // --- RENDER: LIST VIEW ---
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-black transition-colors">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-40">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
                    <ShoppingBag size={32} className="text-primary dark:text-orange-400" />
                    এক্সাম প্যাক সমূহ
                </h1>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
                    ভর্তি পরীক্ষার শেষ মুহূর্তের প্রস্তুতির জন্য সেরা এক্সাম প্যাকগুলো সংগ্রহ করুন।
                </p>
            </header>

            {loading ? (
                <PacksSkeleton />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
                    {packs.map(pack => {
                        const themeClass = getThemeColor(pack.theme);
                        const isOwned = isEnrolled(pack.id); 

                        return (
                            <div key={pack.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col hover:shadow-xl transition-all group">
                                <div className={`p-6 border-b border-gray-100 dark:border-zinc-800 bg-opacity-10 dark:bg-opacity-10 ${themeClass.split(' ')[1]}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${themeClass.split(' ')[1]} border ${themeClass.split(' ')[2]}`}>
                                            {pack.tag}
                                        </span>
                                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                                            <FileCheck size={16}/> {pack.totalExams} Exams
                                        </div>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{pack.title}</h2>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">{pack.subtitle}</p>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="space-y-3 mb-6 flex-1">
                                        {pack.features.map((feat, idx) => (
                                            <div key={idx} className="flex items-start gap-2">
                                                <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0"/>
                                                <span className="text-sm text-gray-600 dark:text-gray-300">{feat}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-zinc-800">
                                        <div>
                                            {isOwned ? (
                                                <span className="text-green-600 font-bold text-sm flex items-center gap-1"><CheckCircle size={14}/> Purchased</span>
                                            ) : (
                                                <>
                                                    <span className="text-xs text-gray-400 line-through block">৳{pack.originalPrice}</span>
                                                    <span className="text-xl font-bold text-gray-900 dark:text-white">৳{pack.price}</span>
                                                </>
                                            )}
                                        </div>
                                        {isOwned ? (
                                            <button 
                                                onClick={() => openPack(pack)}
                                                className="px-6 py-2.5 bg-primary hover:bg-orange-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-200 dark:shadow-none transition-all active:scale-95"
                                            >
                                                ওপেন করুন <ArrowRight size={16}/>
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleBuyClick(pack)}
                                                className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-100 rounded-xl font-bold transition-all shadow-lg active:scale-95"
                                            >
                                                কিনুন
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    </div>
  );
};

export default ExamPackSection;
