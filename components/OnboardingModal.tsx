
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Calendar, CheckCircle, ChevronRight, GraduationCap, Sparkles, Users, Target, Smartphone } from 'lucide-react';
import { useToast } from './Toast';

const TARGETS = [
  { id: 'Medical', label: 'মেডিকেল', sub: 'MBBS/BDS', icon: '🩺', color: 'bg-red-50 border-red-200 text-red-700' },
  { id: 'Engineering', label: 'ইঞ্জিনিয়ারিং', sub: 'BUET/CKRUET', icon: '⚙️', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { id: 'University', label: 'ভার্সিটি (ক)', sub: 'DU/JU/RU', icon: '🎓', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { id: 'Guccho', label: 'গুচ্ছ (GST)', sub: 'Science Unit', icon: '📚', color: 'bg-amber-50 border-amber-200 text-amber-700' }
];

const GROUPS = [
    { id: 'Science', label: 'সায়েন্স', icon: '🧬' },
    { id: 'Business', label: 'বিজনেস', icon: '📊' },
    { id: 'Humanities', label: 'মানবিক', icon: '🎨' }
];

const OnboardingModal: React.FC = () => {
  const { currentUser, updateUserProfile, extendedProfile } = useAuth();
  const { showToast } = useToast();
  
  // Step 1: Academic (College, Group, Batch, Version)
  // Step 2: Goals (Target, Study Goal)
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [college, setCollege] = useState('');
  const [batch, setBatch] = useState('HSC-24');
  const [group, setGroup] = useState('Science');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [target, setTarget] = useState('');

  // Load existing data once
  useEffect(() => {
    if (extendedProfile) {
        setCollege(extendedProfile.college || '');
        setBatch(extendedProfile.hscBatch || 'HSC-24');
        setGroup(extendedProfile.department || 'Science');
        setPhoneNumber(extendedProfile.phoneNumber || '');
        setTarget(extendedProfile.target || '');
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

    if (!phoneNumber || !/^01[3-9]\d{8}$/.test(phoneNumber)) {
        showToast("সঠিক মোবাইল নাম্বার দিন (যেমন: 017...)", "warning");
        return;
    }

    setLoading(true);
    try {
        // We use existing displayName and photoURL, only updating extended profile
        await updateUserProfile(currentUser?.displayName || 'User', currentUser?.photoURL || '', {
            college,
            hscBatch: batch,
            department: group,
            phoneNumber,
            target
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
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden relative flex flex-col max-h-[90vh]">
        
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

        {/* Header */}
        <div className="px-6 pt-6 pb-2 flex justify-between items-center relative z-10">
            <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {step === 1 && 'একাডেমিক তথ্য'}
                    {step === 2 && 'লক্ষ্য নির্ধারণ'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {step === 1 && 'আপনার শিক্ষাগত যোগ্যতা ও বিভাগ'}
                    {step === 2 && 'আপনার প্রস্তুতি ও টার্গেট'}
                </p>
            </div>
            
            {/* Circular Progress */}
            <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100 dark:text-gray-800" />
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * progress) / 100} className="text-primary transition-all duration-500" strokeLinecap="round" />
                </svg>
                <span className="absolute text-xs font-bold text-primary">{step}/{totalSteps}</span>
            </div>
        </div>

        <div className="px-6 py-4 overflow-y-auto custom-scrollbar flex-1 relative z-10">
            
            {/* STEP 1: ACADEMIC */}
            {step === 1 && (
                <div className="space-y-5 animate-in slide-in-from-right-8 duration-300">
                    
                    {/* College Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wider flex items-center gap-2">
                            <GraduationCap size={14} className="text-primary"/> কলেজ / প্রতিষ্ঠান
                        </label>
                        <input 
                            type="text"
                            value={college}
                            onChange={(e) => setCollege(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-medium shadow-sm transition-all"
                            placeholder="আপনার কলেজের নাম লিখুন..."
                            autoFocus
                        />
                    </div>

                    {/* Group Selection */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wider flex items-center gap-2">
                            <Users size={14} className="text-primary"/> গ্রুপ (Group)
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {GROUPS.map(g => (
                                <button
                                    key={g.id}
                                    onClick={() => setGroup(g.id)}
                                    className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 border ${group === g.id ? 'bg-primary/10 border-primary text-primary' : 'bg-gray-50 dark:bg-gray-800 border-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    <span className="text-lg">{g.icon}</span>
                                    {g.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Batch Selection */}
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

                        {/* Phone Number Input */}
                        <div>
                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wider flex items-center gap-2">
                                <Smartphone size={14} className="text-primary"/> মোবাইল নাম্বার
                            </label>
                            <input 
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-medium shadow-sm transition-all"
                                placeholder="017..."
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 2: GOALS */}
            {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                    
                    {/* Target Selection */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                            <Target size={14} className="text-primary"/> আপনার প্রধান লক্ষ্য (Target)
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {TARGETS.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setTarget(t.id)}
                                    className={`relative p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] active:scale-95 ${target === t.id ? `${t.color} border-current shadow-md` : 'bg-gray-50 dark:bg-gray-800 border-transparent hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm text-gray-500 dark:text-gray-400'}`}
                                >
                                    <div className="text-2xl mb-2">{t.icon}</div>
                                    <h4 className="font-bold text-sm">{t.label}</h4>
                                    <p className="text-[12px] opacity-70 font-bold uppercase mt-1">{t.sub}</p>
                                    {target === t.id && (
                                        <div className="absolute top-3 right-3 bg-white/20 p-1 rounded-full">
                                            <CheckCircle size={14} className="fill-current text-white"/>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
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
                    className="flex-1 py-3.5 bg-primary hover:bg-orange-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
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
