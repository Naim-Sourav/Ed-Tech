import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Sparkles, User as UserIcon, GraduationCap, Target, ChevronLeft, Clock } from 'lucide-react';
import { useToast } from './Toast';

const BATCHES = ['HSC 2025', 'HSC 2026', 'HSC 2027', 'HSC 2028'];
const DEPARTMENTS = ['Science', 'Humanities', 'Business Studies'];
const TARGETS = ['Medical', 'Engineering', 'Varsity', 'Agriculture'];
const GOALS = ['১-২ ঘণ্টা', '২-৪ ঘণ্টা', '৪-৬ ঘণ্টা', '৬+ ঘণ্টা'];

const Chip: React.FC<{
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ selected, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all active:scale-95 ${
      selected
        ? 'bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/25'
        : 'bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-800'
    }`}
  >
    {children}
  </button>
);

const OnboardingModal: React.FC = () => {
  const { currentUser, extendedProfile, updateUserProfile, dismissOnboarding } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState(() => (currentUser?.displayName ? 1 : 0));
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(currentUser?.displayName || '');
  const [batch, setBatch] = useState(extendedProfile?.hscBatch || '');
  const [department, setDepartment] = useState(extendedProfile?.department || '');
  const [target, setTarget] = useState(extendedProfile?.target || '');
  const [college, setCollege] = useState(extendedProfile?.college || '');
  const [goal, setGoal] = useState(extendedProfile?.dailyStudyGoal || '');

  useEffect(() => {
    if (currentUser?.displayName && !name) setName(currentUser.displayName);
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  // ESC skips (the flow always offers an explicit Skip too — nobody gets trapped)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismissOnboarding();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dismissOnboarding]);

  const nextFromName = () => {
    if (!name.trim()) {
      showToast('আপনার নাম লিখুন', 'warning');
      return;
    }
    setStep(1);
  };

  const nextFromStudy = () => {
    if (!batch || !department || !target) {
      showToast('ব্যাচ, বিভাগ ও লক্ষ্য নির্বাচন করুন', 'warning');
      return;
    }
    setStep(2);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await updateUserProfile(name.trim() || currentUser?.displayName || 'শিক্ষার্থী', currentUser?.photoURL || '', {
        hscBatch: batch || undefined,
        department: department || undefined,
        target: target || undefined,
        college: college.trim() || undefined,
        dailyStudyGoal: goal || undefined,
      });
      showToast('প্রোফাইল সেটআপ সম্পন্ন! 🎉', 'success');
    } catch (error) {
      logger.error(error);
      showToast('সেভ করতে সমস্যা হয়েছে', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/95 backdrop-blur-md animate-in fade-in duration-500">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="bg-white dark:bg-black w-full max-w-lg rounded-3xl shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden relative flex flex-col max-h-[90vh]"
      >
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

        {/* Header */}
        <div className="px-6 pt-6 pb-2 relative z-10">
          <div className="flex items-center justify-between">
            <h1 id="onboarding-title" className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {step === 0 ? 'স্বাগতম! 👋' : step === 1 ? 'পড়াশোনার তথ্য 📚' : 'লক্ষ্য ঠিক করুন 🎯'}
            </h1>
            <button
              onClick={dismissOnboarding}
              className="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              পরে করব
            </button>
          </div>
          {/* Progress */}
          <div className="flex gap-1.5 mt-4" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-purple-500' : 'bg-gray-200 dark:bg-zinc-800'}`}
              />
            ))}
          </div>
        </div>

        <div className="px-6 py-6 custom-scrollbar relative z-10 overflow-y-auto">
          {/* STEP 0 — Name */}
          {step === 0 && (
            <div className="space-y-5 animate-in slide-in-from-right-8 duration-300">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                আপনার নাম লিখুন — লিডারবোর্ড ও ব্যাটলে এটাই দেখাবে।
              </p>
              <div>
                <label htmlFor="onboarding-name" className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wider flex items-center gap-2">
                  <UserIcon size={14} className="text-primary" /> আপনার নাম
                </label>
                <input
                  id="onboarding-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') nextFromName(); }}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-medium shadow-sm transition-all"
                  placeholder="আপনার পূর্ণ নাম লিখুন..."
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* STEP 1 — Study profile */}
          {step === 1 && (
            <div className="space-y-5 animate-in slide-in-from-right-8 duration-300">
              <div>
                <span className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wider flex items-center gap-2">
                  <GraduationCap size={14} className="text-primary" /> HSC ব্যাচ
                </span>
                <div className="flex flex-wrap gap-2">
                  {BATCHES.map((b) => (
                    <Chip key={b} selected={batch === b} onClick={() => setBatch(b)}>{b}</Chip>
                  ))}
                </div>
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wider">বিভাগ</span>
                <div className="flex flex-wrap gap-2">
                  {DEPARTMENTS.map((d) => (
                    <Chip key={d} selected={department === d} onClick={() => setDepartment(d)}>{d}</Chip>
                  ))}
                </div>
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wider flex items-center gap-2">
                  <Target size={14} className="text-primary" /> ভর্তি লক্ষ্য
                </span>
                <div className="flex flex-wrap gap-2">
                  {TARGETS.map((tg) => (
                    <Chip key={tg} selected={target === tg} onClick={() => setTarget(tg)}>{tg}</Chip>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="onboarding-college" className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  কলেজ <span className="normal-case font-medium text-gray-400">(ঐচ্ছিক)</span>
                </label>
                <input
                  id="onboarding-college"
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-medium shadow-sm transition-all"
                  placeholder="আপনার কলেজের নাম..."
                />
              </div>
            </div>
          )}

          {/* STEP 2 — Daily goal */}
          {step === 2 && (
            <div className="space-y-5 animate-in slide-in-from-right-8 duration-300">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                প্রতিদিন কতক্ষণ পড়তে চান? এই লক্ষ্য অনুযায়ী স্টাডি প্ল্যানার সাজানো হবে।
              </p>
              <div>
                <span className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wider flex items-center gap-2">
                  <Clock size={14} className="text-primary" /> দৈনিক পড়ার লক্ষ্য
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {GOALS.map((g) => (
                    <Chip key={g} selected={goal === g} onClick={() => setGoal(g)}>{g}</Chip>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white dark:bg-black border-t border-gray-100 dark:border-zinc-800 flex gap-3 relative z-20">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-5 py-3.5 bg-gray-100 dark:bg-zinc-900 hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-200 rounded-xl font-bold flex items-center justify-center gap-1 transition-all active:scale-95"
              aria-label="পেছনে যান"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          {step === 0 && (
            <button
              onClick={nextFromName}
              className="flex-1 py-3.5 bg-primary hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/20 active:scale-95 hover:-translate-y-0.5"
            >
              পরবর্তী ধাপ
            </button>
          )}
          {step === 1 && (
            <button
              onClick={nextFromStudy}
              className="flex-1 py-3.5 bg-primary hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/20 active:scale-95 hover:-translate-y-0.5"
            >
              পরবর্তী ধাপ
            </button>
          )}
          {step === 2 && (
            <button
              onClick={handleFinish}
              disabled={loading}
              className="flex-1 py-3.5 bg-primary hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>যাত্রা শুরু করুন <Sparkles size={18} className="fill-yellow-400 text-yellow-400 animate-pulse" /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
