
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Sparkles, User as UserIcon } from 'lucide-react';
import { useToast } from './Toast';

const OnboardingModal: React.FC = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    if (currentUser?.displayName) {
        setName(currentUser.displayName);
    }
  }, [currentUser]);

  const handleSave = async () => {
    if (!name.trim()) {
        showToast("আপনার নাম লিখুন", "warning");
        return;
    }

    setLoading(true);
    try {
        await updateUserProfile(name.trim(), currentUser?.photoURL || '');
        showToast("প্রোফাইল সেটআপ সম্পন্ন! 🎉", "success");
    } catch (error) {
        console.error(error);
        showToast("সেভ করতে সমস্যা হয়েছে", "error");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/95 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white dark:bg-black w-full max-w-lg rounded-3xl shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden relative flex flex-col max-h-[90vh]">
        
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

        {/* Header */}
        <div className="px-6 pt-6 pb-2 relative z-10">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                স্বাগতম! আপনার নাম লিখুন
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                অন্যান্য তথ্য আপনি পরে প্রোফাইল পেজ থেকে আপডেট করতে পারবেন।
            </p>
        </div>

        <div className="px-6 py-6 custom-scrollbar relative z-10">
            <div className="space-y-5 animate-in slide-in-from-right-8 duration-300">
                <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wider flex items-center gap-2">
                        <UserIcon size={14} className="text-primary"/> আপনার নাম
                    </label>
                    <input 
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-medium shadow-sm transition-all"
                        placeholder="আপনার পূর্ণ নাম লিখুন..."
                        autoFocus
                    />
                </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white dark:bg-black border-t border-gray-100 dark:border-zinc-800 flex gap-4 relative z-20">
            <button 
                onClick={handleSave}
                disabled={loading}
                className="flex-1 py-3.5 bg-primary hover:bg-orange-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
            >
                {loading ? <Loader2 className="animate-spin" /> : <>যাত্রা শুরু করুন <Sparkles size={18} className="fill-yellow-400 text-yellow-400 animate-pulse"/></>}
            </button>
        </div>

      </div>
    </div>
  );
};

export default OnboardingModal;
