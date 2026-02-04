
import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudyTracker: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 max-w-md w-full flex flex-col items-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-6 text-yellow-600 dark:text-yellow-500">
          <Construction size={40} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">কাজ চলছে...</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium leading-relaxed">
          স্টাডি প্ল্যানার ফিচারটি বর্তমানে ডেভেলপমেন্টে আছে। শীঘ্রই নতুন সব ফিচার নিয়ে আসছি! সাথে থাকার জন্য ধন্যবাদ।
        </p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200 dark:shadow-none"
        >
          <ArrowLeft size={18} /> ড্যাশবোর্ডে ফিরে যান
        </button>
      </div>
    </div>
  );
};

export default StudyTracker;
