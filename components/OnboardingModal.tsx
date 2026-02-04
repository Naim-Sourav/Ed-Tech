
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Calendar, Target, CheckCircle, ChevronRight, GraduationCap, Sparkles, Clock, Globe } from 'lucide-react';
import { useToast } from './Toast';

const TARGETS = [
  { id: 'Medical', label: 'মেডিকেল', sub: 'MBBS/BDS', icon: '🩺', color: 'bg-green-50 border-green-200 text-green-700' },
  { id: 'Engineering', label: 'ইঞ্জিনিয়ারিং', sub: 'BUET/CKRUET', icon: '⚙️', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { id: 'University', label: 'ভার্সিটি (ক)', sub: 'DU/JU/RU', icon: '🎓', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { id: 'Guccho', label: 'গুচ্ছ (GST)', sub: 'Science Unit', icon: '📚', color: 'bg-purple-50 border-purple-200 text-purple-700' }
];

const STUDY_GOALS = [
    { id: '2-4', label: '২-৪ ঘণ্টা', sub: 'ব্যাস্ত শিডিউল' },
    { id: '4-6', label: '৪-৬ ঘণ্টা', sub: 'স্ট্যান্ডার্ড' },
    { id: '6-8', label: '৬-৮ ঘণ্টা', sub: 'সিরিয়াস' },
    { id: '8+', label: '৮+ ঘণ্টা', sub: 'হার্ডকোর' },
];

const OnboardingModal: React.FC = () => {
  const { currentUser, updateUserProfile, extendedProfile } = useAuth();
  const { showToast } = useToast();
  
  // Step 1 is now Academic, Step 2 is Goals
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [college, setCollege] = useState('');
  const [batch, setBatch] = useState('HSC-24');
  const [version, setVersion] = useState('Bangla'); // Bangla or English
  
  const [target, setTarget] = useState('');
  const [studyGoal, setStudyGoal] = useState('4-6');

  // Load existing data once
  useEffect(() => {
    if (extendedProfile) {
        setCollege(extendedProfile.college || '');
        setBatch(extendedProfile.hscBatch || 'HSC-24');
        setTarget(extendedProfile.target || '');
        setVersion(extendedProfile.version || 'Bangla');
        setStudyGoal(extendedProfile.dailyStudyGoal || '4-6');
    }
  }, [extendedProfile]);

  const handleNext = () => {
      if (step === 1) {
          if (!college.trim()) {
              showToast("কলেজের নাম আবশ্যক", "warning");
              return;
          }
          setStep(prev => prev + 1);
      }
  };

  const handleSave = async () => {
    if (!target) {
        showToast("অনুগ্রহ করে একটি টার্গেট সিলেক্ট করুন", "warning");
        return;
    }

    setLoading(true);
    try {
        // We use existing displayName and photoURL, only updating extended profile
        await updateUserProfile(currentUser?.displayName || 'User', currentUser?.photoURL || '', {
            college,
            hscBatch: batch,
            target,
            version,
            dailyStudyGoal: studyGoal,
            department: 'Science' // Default for this platform
        });
        showToast("প্রোফাইল সেটআপ সম্পন্ন! 🎉", "success");
    } catch (error) {
        console.error(error);
        showToast("সেভ করতে সমস্যা হয়েছে", "error");
    } finally {
        setLoading(false);
    }
  };

  const totalSteps = 2;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/95 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden relative flex flex-col max-h-[90vh]">
        
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-center relative z-10">
            <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {step === 1 && 'একাডেমিক তথ্য'}
                    {step === 2 && 'লক্ষ্য নির্ধারণ'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {step === 1 && 'আমরা আপনার সিলেবাস কাস্টমাইজ করব'}
                    {step === 2 && 'আপনার প্রস্তুতি হোক গোছানো'}
                </p>
            </div>
            
            {/* Circular Progress */}
            <div className="relative w-14 h-14 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100 dark:text-gray-800" />
                    <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={150.8} strokeDashoffset={150.8 - (150.8 * progress) / 100} className="text-primary transition-all duration-500" strokeLinecap="round" />
                </svg>
                <span className="absolute text-xs font-bold text-primary">{step}/{totalSteps}</span>
            </div>
        </div>

        <div className="px-8 py-4 overflow-y-auto custom-scrollbar flex-1 relative z-10">
            
            {/* STEP 1: ACADEMIC */}
            {step === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wider flex items-center gap-2">
                                <GraduationCap size={14} className="text-primary"/> কলেজ / প্রতিষ্ঠান
                            </label>
                            <input 
                                type="text"
                                value={college}
                                onChange={(e) => setCollege(e.target.value)}
                                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-medium shadow-sm"
                                placeholder="আপনার কলেজের নাম (যেমন: ঢাকা কলেজ)"
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wider flex items-center gap-2">
                                    <Calendar size={14} className="text-primary"/> ব্যাচ (Batch)
                                </label>
                                <div className="relative">
                                    <select 
                                        value={batch}
                                        onChange={(e) => setBatch(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-medium appearance-none"
                                    >
                                        <option value="HSC-24">HSC-24</option>
                                        <option value="HSC-25">HSC-25</option>
                                        <option value="HSC-26">HSC-26</option>
                                    </select>
                                    <div className="absolute right-4 top-3.5 pointer-events-none text-gray-400">▼</div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wider flex items-center gap-2">
                                    <Globe size={14} className="text-primary"/> ভার্সন (Version)
                                </label>
                                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                                    {['Bangla', 'English'].map(v => (
                                        <button
                                            key={v}
                                            onClick={() => setVersion(v)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${version === v ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300 shrink-0">
                                <Sparkles size={18}/>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-800 dark:text-white">সায়েন্স স্পেশালিস্ট</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                    ধ্রুবক বর্তমানে শুধুমাত্র বিজ্ঞান বিভাগের শিক্ষার্থীদের জন্য অপ্টিমাইজড। আপনার সিলেবাস স্বয়ংক্রিয়ভাবে সেট করা হবে।
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 2: GOALS */}
            {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-3 uppercase tracking-wider">
                            আপনার প্রধান লক্ষ্য (Primary Target)
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {TARGETS.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setTarget(t.id)}
                                    className={`relative p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] ${target === t.id ? `${t.color} border-current shadow-md` : 'bg-gray-50 dark:bg-gray-800 border-transparent hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm text-gray-500 dark:text-gray-400'}`}
                                >
                                    <div className="text-2xl mb-2">{t.icon}</div>
                                    <h4 className="font-bold text-sm">{t.label}</h4>
                                    <p className="text-[10px] opacity-70 font-bold uppercase mt-1">{t.sub}</p>
                                    {target === t.id && (
                                        <div className="absolute top-3 right-3 bg-white/20 p-1 rounded-full">
                                            <CheckCircle size={14} className="fill-current text-white"/>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                            <Clock size={14} className="text-primary"/> দৈনিক পড়ার লক্ষ্য (Daily Goal)
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {STUDY_GOALS.map(goal => (
                                <button
                                    key={goal.id}
                                    onClick={() => setStudyGoal(goal.id)}
                                    className={`py-2 rounded-xl border-2 text-xs font-bold transition-all ${studyGoal === goal.id ? 'border-primary bg-primary text-white' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'}`}
                                >
                                    {goal.label}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-center mt-2 text-gray-400">
                            {STUDY_GOALS.find(g => g.id === studyGoal)?.sub} মোড সিলেক্টেড
                        </p>
                    </div>
                </div>
            )}

        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-4 relative z-20">
            {step > 1 && (
                <button 
                    onClick={() => setStep(prev => prev - 1)}
                    className="px-6 py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    পেছনে
                </button>
            )}
            
            {step < totalSteps ? (
                <button 
                    onClick={handleNext}
                    className="flex-1 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
                >
                    পরবর্তী <ChevronRight size={18} />
                </button>
            ) : (
                <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 py-3.5 bg-primary hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <>যাত্রা শুরু করুন <Sparkles size={18} className="fill-yellow-400 text-yellow-400 animate-pulse"/></>}
                </button>
            )}
        </div>

      </div>
    </div>
  );
};

export default OnboardingModal;
