
import React, { useState, useEffect } from 'react';
import { FileCheck, ShoppingBag, ArrowRight, Copy, Loader2, X, Check, CheckCircle2, AlertCircle, ChevronLeft, Play, Timer, CheckCircle } from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { useAuth } from '../contexts/AuthContext';
import { ExamPack } from '../types';
import { fetchExamPacksAPI } from '../services/api';

const ExamPackSection: React.FC = () => {
  const [packs, setPacks] = useState<ExamPack[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation State
  const [viewMode, setViewMode] = useState<'LIST' | 'PLAYER'>('LIST');
  const [activePack, setActivePack] = useState<ExamPack | null>(null);

  // Payment State
  const [selectedPack, setSelectedPack] = useState<ExamPack | null>(null);
  const [paymentStep, setPaymentStep] = useState<'INFO' | 'FORM' | 'SUCCESS'>('INFO');
  const [trxId, setTrxId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { submitPaymentRequest } = useAdmin();
  const { currentUser, isEnrolled } = useAuth();

  useEffect(() => {
    const loadPacks = async () => {
      try {
        const data = await fetchExamPacksAPI();
        setPacks(data);
      } catch (err) {
        console.error("Failed to load exam packs", err);
      } finally {
        setLoading(false);
      }
    };
    loadPacks();
  }, []);

  const handleBuyClick = (pack: ExamPack) => {
    setSelectedPack(pack);
    setPaymentStep('INFO');
    setTrxId('');
    setSenderNumber('');
    setErrorMsg('');
  };

  const openPack = (pack: ExamPack) => {
      setActivePack(pack);
      setViewMode('PLAYER');
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText('01622190454');
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxId || !senderNumber || !selectedPack || !currentUser) return;

    setIsVerifying(true);
    setErrorMsg('');
    
    try {
      await submitPaymentRequest({
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Unknown',
        userEmail: currentUser.email || '',
        courseId: selectedPack.id,
        courseTitle: selectedPack.title, // Treating Pack as Course in DB for now
        amount: selectedPack.price,
        trxId: trxId,
        senderNumber: senderNumber
      });
      setPaymentStep('SUCCESS');
    } catch (error: any) {
      console.error("Submission failed:", error);
      setErrorMsg(error.message || "পেমেন্ট সাবমিট করতে সমস্যা হয়েছে।");
    } finally {
      setIsVerifying(false);
    }
  };

  const closePaymentModal = () => {
    setSelectedPack(null);
    setPaymentStep('INFO');
    setErrorMsg('');
  };

  // Theme helper
  const getThemeColor = (theme: string) => {
    switch (theme) {
      case 'emerald': return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-800';
      case 'blue': return 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-800';
      case 'purple': return 'text-purple-600 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-900/30 dark:border-purple-800';
      case 'orange': return 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900/30 dark:border-orange-800';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700';
    }
  };

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
          <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between shadow-sm z-20">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setViewMode('LIST')} 
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
                          <div key={exam.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between group hover:border-primary/50 transition-all">
                              <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${exam.status === 'COMPLETED' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
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
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${exam.status === 'COMPLETED' ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-primary text-white hover:bg-green-700 shadow-sm'}`}
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
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-40">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
                    <ShoppingBag size={32} className="text-primary dark:text-green-400" />
                    এক্সাম প্যাক সমূহ
                </h1>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
                    ভর্তি পরীক্ষার শেষ মুহূর্তের প্রস্তুতির জন্য সেরা এক্সাম প্যাকগুলো সংগ্রহ করুন।
                </p>
            </header>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary"/></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
                    {packs.map(pack => {
                        const themeClass = getThemeColor(pack.theme);
                        const isOwned = isEnrolled(pack.id); 

                        return (
                            <div key={pack.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col hover:shadow-xl transition-all group">
                                <div className={`p-6 border-b border-gray-100 dark:border-gray-700 bg-opacity-10 dark:bg-opacity-10 ${themeClass.split(' ')[1]}`}>
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

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
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
                                                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-200 dark:shadow-none transition-all active:scale-95"
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

        {/* Payment Modal */}
        {selectedPack && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 dark:text-white">পেমেন্ট ফর্ম</h3>
                        <button onClick={closePaymentModal}><X size={20} className="text-gray-500" /></button>
                    </div>
                    
                    <div className="p-6">
                        {errorMsg && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-800 flex items-start gap-2">
                                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        {paymentStep === 'INFO' && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">আপনি কিনছেন</p>
                                    <h2 className="text-xl font-bold text-primary dark:text-green-400">{selectedPack.title}</h2>
                                    <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">৳{selectedPack.price}</p>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 font-medium">নিচের নাম্বারে <strong>Send Money</strong> করুন:</p>
                                    <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                                        <span className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">01622190454</span>
                                        <button onClick={handleCopyNumber} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500"><Copy size={18} /></button>
                                    </div>
                                    <div className="flex gap-2 mt-3 justify-center">
                                        <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs font-bold rounded">bKash</span>
                                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded">Nagad</span>
                                    </div>
                                </div>

                                <button onClick={() => setPaymentStep('FORM')} className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors">পেমেন্ট সম্পন্ন করেছি</button>
                            </div>
                        )}

                        {paymentStep === 'FORM' && (
                            <form onSubmit={handleSubmitPayment} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">প্রেরক নম্বর</label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="01XXXXXXXXX"
                                        value={senderNumber}
                                        onChange={(e) => setSenderNumber(e.target.value)}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">TrxID</label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="Example: 9H7XXXXX"
                                        value={trxId}
                                        onChange={(e) => setTrxId(e.target.value)}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white uppercase"
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={isVerifying}
                                    className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    {isVerifying ? <Loader2 className="animate-spin" /> : 'জমা দিন'}
                                </button>
                            </form>
                        )}

                        {paymentStep === 'SUCCESS' && (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">রিকোয়েস্ট জমা হয়েছে!</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                                    অ্যাডমিন কনফার্ম করলে প্যাকটি আপনার অ্যাকাউন্টে যুক্ত হবে।
                                </p>
                                <button onClick={closePaymentModal} className="mt-6 px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-lg">ঠিক আছে</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default ExamPackSection;
