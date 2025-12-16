
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { uploadImageToCloudinary } from '../services/imageUpload';
import { Loader2, Camera, BookOpen, Calendar, Target, CheckCircle, ChevronRight, GraduationCap, Sparkles, User, Edit2 } from 'lucide-react';
import { useToast } from './Toast';

const AVATARS = [
  'https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Aneka&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Jack&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Mila&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Leo&backgroundColor=ffdfbf'
];

const TARGETS = [
  { id: 'Medical', label: 'মেডিকেল', icon: '🩺', color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 'Engineering', label: 'ইঞ্জিনিয়ারিং', icon: '⚙️', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'University', label: 'ভার্সিটি (ক)', icon: '🎓', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 'Guccho', label: 'গুচ্ছ (GST)', icon: '📚', color: 'bg-purple-100 text-purple-700 border-purple-200' }
];

const OnboardingModal: React.FC = () => {
  const { currentUser, updateUserProfile, extendedProfile } = useAuth();
  const { showToast } = useToast();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  // Form State
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState(AVATARS[0]);
  const [college, setCollege] = useState('');
  const [batch, setBatch] = useState('');
  const [target, setTarget] = useState('');
  const [department, setDepartment] = useState('Science');

  // Load existing data once
  useEffect(() => {
    if (currentUser) {
        setDisplayName(currentUser.displayName || '');
        setPhotoURL(currentUser.photoURL || AVATARS[0]);
    }
    if (extendedProfile) {
        setCollege(extendedProfile.college || '');
        setBatch(extendedProfile.hscBatch || '');
        setTarget(extendedProfile.target || '');
        setDepartment(extendedProfile.department || 'Science');
    }
  }, [currentUser, extendedProfile]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast("অনুগ্রহ করে একটি ছবি নির্বাচন করুন", "warning");
        return;
    }

    setUploading(true);
    try {
        const url = await uploadImageToCloudinary(file);
        setPhotoURL(url);
        showToast("ছবি আপলোড হয়েছে!", "success");
    } catch (error) {
        showToast("আপলোড ব্যর্থ হয়েছে", "error");
    } finally {
        setUploading(false);
    }
  };

  const handleNext = () => {
      if (step === 1 && !displayName.trim()) {
          showToast("নামের ঘরটি খালি রাখা যাবে না", "warning");
          return;
      }
      if (step === 2 && (!college.trim() || !batch.trim())) {
          showToast("কলেজ এবং ব্যাচ তথ্য আবশ্যক", "warning");
          return;
      }
      setStep(prev => prev + 1);
  };

  const handleSave = async () => {
    if (!target) {
        showToast("অনুগ্রহ করে একটি টার্গেট সিলেক্ট করুন", "warning");
        return;
    }

    setLoading(true);
    try {
        await updateUserProfile(displayName, photoURL, {
            college,
            hscBatch: batch,
            target,
            department
        });
        showToast("প্রোফাইল সেটআপ সম্পন্ন! 🎉", "success");
    } catch (error) {
        console.error(error);
        showToast("সেভ করতে সমস্যা হয়েছে", "error");
    } finally {
        setLoading(false);
    }
  };

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/90 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden relative flex flex-col max-h-[90vh]">
        
        {/* Progress Header */}
        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    {step === 1 ? 'পরিচয় পর্ব' : step === 2 ? 'অ্যাকাডেমিক তথ্য' : 'আপনার লক্ষ্য'}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">ধাপ {step} / {totalSteps}</p>
            </div>
            <div className="w-12 h-12 relative flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-200 dark:text-gray-700" />
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * progress) / 100} className="text-primary transition-all duration-500" strokeLinecap="round" />
                </svg>
                <span className="absolute text-[10px] font-bold text-primary">{Math.round(progress)}%</span>
            </div>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
            
            {/* STEP 1: IDENTITY */}
            {step === 1 && (
                <div className="space-y-8 animate-in slide-in-from-right-8 duration-300">
                    <div className="text-center">
                        <div className="inline-block relative group mb-4">
                            <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-primary to-blue-400 shadow-xl">
                                <img src={photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover bg-white border-2 border-white" />
                            </div>
                            <label className="absolute bottom-1 right-1 p-2 bg-gray-900 text-white rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg border-2 border-white">
                                {uploading ? <Loader2 size={14} className="animate-spin"/> : <Camera size={14} />}
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                            </label>
                        </div>
                        
                        <div className="flex flex-col items-center gap-2">
                            {!isEditingName ? (
                                <div className="flex items-center gap-2">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        হাই, <span className="text-primary">{displayName.split(' ')[0]}</span>! 👋
                                    </h2>
                                    <button onClick={() => setIsEditingName(true)} className="p-1 text-gray-400 hover:text-primary transition-colors">
                                        <Edit2 size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full max-w-xs animate-in fade-in zoom-in">
                                    <label className="block text-xs font-bold text-gray-500 mb-1 text-left">আপনার নাম</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primary outline-none"
                                            autoFocus
                                        />
                                        <button onClick={() => setIsEditingName(false)} className="px-3 py-2 bg-green-500 text-white rounded-lg text-xs font-bold">OK</button>
                                    </div>
                                </div>
                            )}
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                                আপনার প্রোফাইলটি সুন্দর করতে একটি ছবি আপলোড করুন অথবা নিচের অবতারগুলো থেকে বেছে নিন।
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-5 gap-3 justify-center max-w-xs mx-auto">
                        {AVATARS.map((avi, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => setPhotoURL(avi)}
                                className={`aspect-square rounded-full border-2 overflow-hidden transition-all ${photoURL === avi ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-transparent hover:border-gray-300 hover:scale-105'}`}
                            >
                                <img src={avi} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* STEP 2: ACADEMIC */}
            {step === 2 && (
                <div className="space-y-5 animate-in slide-in-from-right-8 duration-300">
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <GraduationCap size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">অ্যাকাডেমিক তথ্য</h3>
                        <p className="text-sm text-gray-500">আমরা আপনার সিলেবাস কাস্টমাইজ করব।</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wider">কলেজ / প্রতিষ্ঠান</label>
                            <div className="relative">
                                <BookOpen size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                <input 
                                    type="text"
                                    value={college}
                                    onChange={(e) => setCollege(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white text-sm transition-all"
                                    placeholder="আপনার কলেজের নাম লিখুন"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wider">HSC ব্যাচ</label>
                                <div className="relative">
                                    <Calendar size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                    <input 
                                        type="number"
                                        value={batch}
                                        onChange={(e) => setBatch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white text-sm transition-all"
                                        placeholder="2024"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wider">বিভাগ</label>
                                <select 
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="w-full px-3 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white text-sm transition-all appearance-none"
                                >
                                    <option>Science</option>
                                    <option>Humanities</option>
                                    <option>Business</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 3: TARGET */}
            {step === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                    <div className="text-center mb-4">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <Target size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">আপনার লক্ষ্য কী?</h3>
                        <p className="text-sm text-gray-500">এটি আমাদের কুইজ সাজাতে সাহায্য করবে।</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {TARGETS.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTarget(t.id)}
                                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all group text-left ${target === t.id ? `${t.color} border-current shadow-sm` : 'bg-white dark:bg-gray-700 border-transparent hover:border-gray-200 dark:hover:border-gray-600 text-gray-600 dark:text-gray-200'}`}
                            >
                                <div className="text-2xl group-hover:scale-110 transition-transform">{t.icon}</div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm md:text-base">{t.label}</h4>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${target === t.id ? 'border-current' : 'border-gray-300'}`}>
                                    {target === t.id && <div className="w-2.5 h-2.5 rounded-full bg-current" />}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex gap-3">
            {step > 1 && (
                <button 
                    onClick={() => setStep(prev => prev - 1)}
                    className="px-6 py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    পেছনে
                </button>
            )}
            
            {step < totalSteps ? (
                <button 
                    onClick={handleNext}
                    className="flex-1 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg active:scale-95"
                >
                    পরবর্তী <ChevronRight size={18} />
                </button>
            ) : (
                <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 py-3.5 bg-primary hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <>শুরু করি <Sparkles size={18} className="fill-yellow-400 text-yellow-400"/></>}
                </button>
            )}
        </div>

      </div>
    </div>
  );
};

export default OnboardingModal;
