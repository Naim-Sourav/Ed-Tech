
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, ArrowRight, Settings, Archive, Swords, PieChart, 
  Atom, Beaker, Calculator, Dna, Brain, ChevronRight, Flame 
} from 'lucide-react';

const SUBJECTS = [
    { name: 'Physics', group: 'Physics', icon: Atom, color: 'bg-blue-100 text-blue-600' },
    { name: 'Chemistry', group: 'Chemistry', icon: Beaker, color: 'bg-orange-100 text-orange-600' },
    { name: 'Math', group: 'Higher Math', icon: Calculator, color: 'bg-red-100 text-red-600' },
    { name: 'Biology', group: 'Biology', icon: Dna, color: 'bg-green-100 text-green-600' },
    { name: 'ICT', group: 'ICT', icon:  Brain, color: 'bg-purple-100 text-purple-600' },
];

const ExamHub: React.FC = () => {
  const navigate = useNavigate();

  const startLiveExam = () => {
      const examId = `live_exam_${Date.now()}`;
      const liveExamConfig = {
          title: "মেডিকেল ভর্তি পরীক্ষা ২০২৪-২৫",
          timeLimit: 60,
          negativeMarking: 0.25,
          mode: 'ALL_AT_ONCE',
          type: 'PAST_PAPER',
          examRef: 'medical_24_25',
          isPracticeMode: false
      };
      
      localStorage.setItem(`exam_config_${examId}`, JSON.stringify(liveExamConfig));
      navigate(`/exam/${examId}`);
  };

  const startSubjectPractice = (groupName: string) => {
      navigate('/quiz', { state: { subject: groupName } }); 
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors pb-24">
      <div className="max-w-5xl mx-auto px-4 pt-6 space-y-8">
        
        {/* Header Title */}
        <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white">এক্সাম জোন</h1>
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
            </div>
        </div>

        {/* 1. Live Exam Banner (Dark Card) */}
        <div 
            onClick={startLiveExam}
            className="w-full relative bg-[#1a1f2e] dark:bg-black rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 text-white overflow-hidden shadow-xl cursor-pointer group"
        >
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-white/5 rounded-full blur-2xl md:blur-3xl -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 md:w-48 md:h-48 bg-blue-500/10 rounded-full blur-xl md:blur-2xl -ml-5 -mb-5"></div>

            <div className="relative z-10 flex flex-col gap-4 md:gap-6">
                <div className="flex justify-between items-start">
                    <span className="px-3 py-1 bg-red-500/20 backdrop-blur-md rounded-full text-[10px] md:text-xs font-bold border border-red-500/30 flex items-center gap-1.5 text-red-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> Live Now
                    </span>
                    <Clock size={20} className="text-gray-400"/>
                </div>
                <div>
                    <h2 className="text-xl md:text-3xl font-bold mb-2">মেডিকেল ভর্তি পরীক্ষা</h2>
                    <p className="text-xs md:text-sm text-gray-400">মডেল টেস্ট - ০৫ | পূর্ণমান: ১০০ | সময়: ১ ঘণ্টা</p>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs md:text-sm font-bold text-white/90 group-hover:gap-3 transition-all">
                    পরীক্ষা শুরু করুন <ArrowRight size={16}/>
                </div>
            </div>
        </div>

        {/* 2. Quick Access Grid */}
        <div>
            <h3 className="text-sm md:text-base font-bold text-gray-500 dark:text-gray-400 mb-4 px-1">কুইক অ্যাক্সেস</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {/* Rapid Fire (NEW FEATURE) */}
                <div 
                    onClick={() => navigate('/quiz', { state: { mode: 'RAPID_FIRE' } })}
                    className="bg-white dark:bg-gray-800 p-5 md:p-6 rounded-[1.8rem] md:rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Flame size={60} />
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                        <Flame size={20} fill="currentColor" className="md:w-6 md:h-6" />
                    </div>
                    <h4 className="font-bold text-gray-800 dark:text-white text-sm md:text-lg">র‍্যাপিড ফায়ার</h4>
                    <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-1">১৫টি প্রশ্ন, দ্রুত সমাধান</p>
                </div>

                {/* Custom Quiz (Model Test) */}
                <div 
                    onClick={() => navigate('/quiz')}
                    className="bg-white dark:bg-gray-800 p-5 md:p-6 rounded-[1.8rem] md:rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                        <Settings size={20} className="md:w-6 md:h-6" />
                    </div>
                    <h4 className="font-bold text-gray-800 dark:text-white text-sm md:text-lg">মডেল টেস্ট</h4>
                    <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-1">কাস্টম এক্সাম দিন</p>
                </div>

                {/* Question Bank */}
                <div 
                    onClick={() => navigate('/qbank')}
                    className="bg-white dark:bg-gray-800 p-5 md:p-6 rounded-[1.8rem] md:rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                        <Archive size={20} className="md:w-6 md:h-6" />
                    </div>
                    <h4 className="font-bold text-gray-800 dark:text-white text-sm md:text-lg">প্রশ্ন ব্যাংক</h4>
                    <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-1">বিগত বছরের প্রশ্ন</p>
                </div>

                {/* Battle */}
                <div 
                    onClick={() => navigate('/battle')}
                    className="bg-white dark:bg-gray-800 p-5 md:p-6 rounded-[1.8rem] md:rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                        <Swords size={20} className="md:w-6 md:h-6" />
                    </div>
                    <h4 className="font-bold text-gray-800 dark:text-white text-sm md:text-lg">কুইজ ব্যাটল</h4>
                    <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-1">বন্ধুদের চ্যালেঞ্জ করুন</p>
                </div>
            </div>
        </div>

        {/* 3. Subject Horizontal Scroll (Grid on Desktop) */}
        <div>
            <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="text-sm md:text-base font-bold text-gray-500 dark:text-gray-400">বিষয়ভিত্তিক অনুশীলন</h3>
                <button onClick={() => navigate('/quiz')} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">সব দেখুন <ChevronRight size={12}/></button>
            </div>
            
            <div className="flex md:grid md:grid-cols-5 gap-3 md:gap-4 overflow-x-auto md:overflow-visible pb-4 md:pb-0 no-scrollbar">
                {SUBJECTS.map((sub, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => startSubjectPractice(sub.group)}
                        className="min-w-[100px] md:min-w-0 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-3 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors shadow-sm hover:shadow-md"
                    >
                        <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center ${sub.color.split(' ')[0]} ${sub.color.split(' ')[1]}`}>
                            <sub.icon size={20} className="md:w-7 md:h-7" />
                        </div>
                        <span className="text-xs md:text-sm font-bold text-gray-700 dark:text-gray-200 text-center">{sub.name}</span>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default ExamHub;
