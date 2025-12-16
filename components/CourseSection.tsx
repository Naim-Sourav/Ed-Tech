import React, { useState } from 'react';
import { BookOpen, CheckCircle, Star, Users, ArrowRight, Copy, CreditCard, Loader2, X, Check, FileText, Lock, ChevronLeft, Activity, PlayCircle, Download, AlertCircle } from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
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

const STANDARD_SYLLABUS: Module[] = [
  {
    title: 'অধ্যায় ১: ভেক্টর (Vector)',
    items: [
      { id: 'l1', title: 'লেকচার ১: ভেক্টর পরিচিতি ও লব্ধি', duration: '1h 20m', type: 'LIVE', isLocked: false },
      { id: 'n1', title: 'লেকচার নোট: ভেক্টর পার্ট-১', duration: 'PDF', type: 'NOTE', isLocked: false },
      { id: 'e1', title: 'কুইজ ১: ভেক্টর ব্যাসিক', duration: '20 Min', type: 'EXAM', isLocked: false },
    ]
  },
  {
    title: 'অধ্যায় ২: গতিবিদ্যা (Dynamics)',
    items: [
      { id: 'l2', title: 'লেকচার ২: প্রাসের গতি', duration: '1h 30m', type: 'LIVE', isLocked: true },
      { id: 'e2', title: 'কুইজ ২: গতির সমীকরণ', duration: '25 Min', type: 'EXAM', isLocked: true },
    ]
  }
];

const COURSES: Course[] = [
  {
    id: 'hsc-academic',
    title: 'HSC 2025 Academic Batch',
    subtitle: 'পদার্থ, রসায়ন, উচ্চতর গণিত ও জীববিজ্ঞান পূর্ণাঙ্গ প্রস্তুতি',
    price: 2500,
    originalPrice: 5000,
    students: 1250,
    theme: 'emerald',
    badge: 'Best Seller',
    features: [
      'লাইভ ক্লাস এবং রেকর্ডেড ভিডিও',
      'অধ্যায়ভিত্তিক লেকচার শিট ও নোট',
      'ডেইলি ও উইকলি কুইজ টেস্ট',
      'সরাসরি টিচারের সাথে প্রশ্নোত্তর',
      'প্রোফাইল ট্র্যাকিং ও প্রোগ্রেস রিপোর্ট'
    ],
    syllabus: STANDARD_SYLLABUS
  },
  {
    id: 'medical-admission',
    title: 'Medical Admission Mission',
    subtitle: 'মেডিকেল ভর্তি পরীক্ষার পূর্ণাঙ্গ গাইডলাইন ও প্রস্তুতি',
    price: 3500,
    originalPrice: 6000,
    students: 850,
    theme: 'purple',
    badge: 'Admission',
    features: [
      'মেডিকেল স্ট্যান্ডার্ড প্রশ্ন ব্যাংক সলভ',
      'জেনারেল নলেজ ও ইংরেজি ক্লাস',
      'মডেল টেস্ট এবং নেগেটিভ মার্কিং প্র্যাকটিস',
      'মেডিকেল শিক্ষার্থীদের মেন্টরশিপ',
      'ফাইনাল মডেল টেস্ট'
    ]
  },
  {
    id: 'engineering-admission',
    title: 'Engineering Masterclass',
    subtitle: 'বুয়েট, কুয়েট, রুয়েট, চুয়েট ভর্তি প্রস্তুতি',
    price: 4000,
    originalPrice: 8000,
    students: 620,
    theme: 'blue',
    badge: 'Advanced',
    features: [
      'অ্যাডভান্সড প্রবলেম সলভিং ক্লাস',
      'বুয়েট প্রশ্ন ব্যাংক এনালাইসিস',
      'কনসেপ্ট ক্লিয়ারিং সেশন',
      'ইঞ্জিনিয়ারিং স্ট্যান্ডার্ড এক্সাম',
      'স্পেশাল রিটেন এক্সাম প্রস্তুতি'
    ]
  },
  {
    id: 'varsity-ka',
    title: 'Varsity "A" Unit Care',
    subtitle: 'ঢাকা বিশ্ববিদ্যালয় ও অন্যান্য ভার্সিটি "ক" ইউনিট',
    price: 2000,
    originalPrice: 4000,
    students: 980,
    theme: 'orange',
    badge: 'Popular',
    features: [
      'বিশ্ববিদ্যালয় প্রশ্ন ব্যাংক সলভ',
      'শর্ট টেকনিক ও টিপস',
      'বিষয়ভিত্তিক এক্সাম ব্যাচ',
      'সাজেশন ভিত্তিক ক্লাস',
      'গুচ্ছ ভর্তি প্রস্তুতি'
    ]
  }
];

const CourseSection: React.FC = () => {
  const { t } = useLanguage();
  // Main Views: LIST, PAYMENT_MODAL, PLAYER
  const [viewMode, setViewMode] = useState<'LIST' | 'PLAYER'>('LIST');
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  
  // Payment State
  const [paymentCourse, setPaymentCourse] = useState<Course | null>(null);
  const [paymentStep, setPaymentStep] = useState<'INFO' | 'FORM' | 'SUCCESS'>('INFO');
  const [trxId, setTrxId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Contexts
  const { submitPaymentRequest } = useAdmin();
  const { currentUser, isEnrolled } = useAuth();

  // Player State
  const [activeContentId, setActiveContentId] = useState<string>('l1');

  // --- ACTIONS ---

  const handleEnrollClick = (course: Course) => {
      setPaymentCourse(course);
      setPaymentStep('INFO');
      setTrxId('');
      setSenderNumber('');
      setErrorMsg('');
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText('01622190454');
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxId || !senderNumber || !paymentCourse || !currentUser) return;

    setIsVerifying(true);
    setErrorMsg('');
    
    try {
      // Directly call the async submission logic
      await submitPaymentRequest({
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Unknown',
        userEmail: currentUser.email || '',
        courseId: paymentCourse.id,
        courseTitle: paymentCourse.title,
        amount: paymentCourse.price,
        trxId: trxId,
        senderNumber: senderNumber
      });
      setPaymentStep('SUCCESS');
    } catch (error: any) {
      console.error("Submission failed:", error);
      setErrorMsg(error.message || "পেমেন্ট সাবমিট করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    } finally {
      setIsVerifying(false);
    }
  };

  const closePaymentModal = () => {
    setPaymentCourse(null);
    setPaymentStep('INFO');
    setErrorMsg('');
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
                                        <p className="text-[10px] text-gray-400 mt-0.5">{item.duration}</p>
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
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
                    <BookOpen size={32} className="text-primary dark:text-green-400" />
                    {t('course_title')}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
                    {t('course_desc')}
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-5xl">
                {COURSES.map(course => {
                    const themeStyles = getThemeStyles(course.theme);
                    const isOwned = isEnrolled(course.id);

                    return (
                        <div key={course.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col hover:shadow-xl transition-all group">
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
                    )
                })}
            </div>
        </div>

        {/* Payment Modal */}
        {paymentCourse && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 dark:text-white">{t('payment_form')}</h3>
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
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">You are buying</p>
                                    <h2 className="text-xl font-bold text-primary dark:text-green-400">{paymentCourse.title}</h2>
                                    <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">৳{paymentCourse.price}</p>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 font-medium">Send Money to:</p>
                                    <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                                        <span className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">01622190454</span>
                                        <button onClick={handleCopyNumber} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500"><Copy size={18} /></button>
                                    </div>
                                    <div className="flex gap-2 mt-3 justify-center">
                                        <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs font-bold rounded">bKash</span>
                                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded">Nagad</span>
                                    </div>
                                </div>

                                <button onClick={() => setPaymentStep('FORM')} className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors">Complete Payment</button>
                            </div>
                        )}

                        {paymentStep === 'FORM' && (
                            <form onSubmit={handleSubmitPayment} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Sender Number</label>
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
                                    {isVerifying ? <Loader2 className="animate-spin" /> : t('payment_submit')}
                                </button>
                            </form>
                        )}

                        {paymentStep === 'SUCCESS' && (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Request Submitted!</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                                    Your enrollment will be active once approved by admin.
                                </p>
                                <button onClick={closePaymentModal} className="mt-6 px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-lg">Close</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default CourseSection;