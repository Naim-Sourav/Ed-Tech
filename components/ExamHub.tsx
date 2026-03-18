
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, ArrowRight, Settings, Archive, Swords, 
  Atom, Beaker, Calculator, Dna, Brain, ChevronRight, Flame 
} from 'lucide-react';

const SUBJECTS = [
    { name: 'Physics', group: 'Physics', icon: Atom, color: 'bg-orange-100 text-primary dark:bg-orange-900/30 dark:text-orange-400' },
    { name: 'Chemistry', group: 'Chemistry', icon: Beaker, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
    { name: 'Math', group: 'Higher Math', icon: Calculator, color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
    { name: 'Biology', group: 'Biology', icon: Dna, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
    { name: 'ICT', group: 'ICT', icon:  Brain, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
];

import questions from '../data/gst_a_23_24_questions.json';

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

  const startFreeModelTest = (testId: string, title: string, subjectFilter: string, questionCount: number = 25, time: number = 20) => {
      const examId = `fmt_${testId}_${Date.now()}`;
      
      // Filter questions based on subject
      let filteredQuestions = questions.filter(q => q.subject.includes(subjectFilter));
      
      // If not enough questions, take what we have, or fallback to all
      if (filteredQuestions.length < questionCount) {
          filteredQuestions = questions;
      }
      
      // Shuffle and slice
      const selectedQuestions = filteredQuestions.sort(() => 0.5 - Math.random()).slice(0, questionCount);

      const config = {
          title: title,
          timeLimit: time,
          negativeMarking: 0.25,
          mode: 'ALL_AT_ONCE',
          questions: selectedQuestions,
          isPracticeMode: false
      };
      
      localStorage.setItem(`exam_config_${examId}`, JSON.stringify(config));
      navigate(`/exam/${examId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors pb-20 relative overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-6 space-y-8 relative z-10">
        
        {/* Header Title */}
        <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-4xl font-black text-gray-800 dark:text-white tracking-tight">
                এক্সাম <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">জোন</span>
            </h1>
            <div className="w-10 h-10 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-white/10 flex items-center justify-center shadow-lg">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(255,82,0,0.5)]"></div>
            </div>
        </div>

        {/* 1. Live Exam Banner (Cyberpunk Card) */}
        <div 
            onClick={startLiveExam}
            className="w-full relative bg-[#0f172a] dark:bg-black rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 text-white overflow-hidden shadow-2xl shadow-orange-900/20 cursor-pointer group border border-white/10"
        >
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-[80px] -mr-10 -mt-10 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-600/20 rounded-full blur-[60px] -ml-5 -mb-5"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

            <div className="relative z-10 flex flex-col gap-4 md:gap-6">
                <div className="flex justify-between items-start">
                    <span className="px-3 py-1 bg-red-500/20 backdrop-blur-md rounded-full text-[10px] md:text-xs font-bold border border-red-500/30 flex items-center gap-1.5 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> Live Now
                    </span>
                    <Clock size={20} className="text-gray-400 group-hover:text-white transition-colors"/>
                </div>
                <div>
                    <h2 className="text-2xl md:text-4xl font-black mb-2 tracking-tight">মেডিকেল ভর্তি পরীক্ষা</h2>
                    <p className="text-xs md:text-sm text-gray-400 font-medium">মডেল টেস্ট - ০৫ | পূর্ণমান: ১০০ | সময়: ১ ঘণ্টা</p>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs md:text-sm font-bold text-white/90 group-hover:gap-3 transition-all">
                    পরীক্ষা শুরু করুন <ArrowRight size={16} className="text-purple-400"/>
                </div>
            </div>
        </div>

        {/* 2. Quick Access Grid */}
        <div>
            <h3 className="text-sm md:text-base font-black text-gray-500 dark:text-gray-400 mb-4 px-1 uppercase tracking-wider">কুইক অ্যাক্সেস</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {/* Rapid Fire */}
                <div 
                    onClick={() => navigate('/quiz', { state: { mode: 'RAPID_FIRE' } })}
                    className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl p-5 md:p-6 rounded-[1.8rem] md:rounded-[2rem] border border-white/40 dark:border-white/5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                        <Flame size={60} />
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform shadow-sm">
                        <Flame size={20} fill="currentColor" className="md:w-6 md:h-6" />
                    </div>
                    <h4 className="font-bold text-gray-800 dark:text-white text-sm md:text-lg">র‍্যাপিড ফায়ার</h4>
                    <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">১৫টি প্রশ্ন, দ্রুত সমাধান</p>
                </div>

                {/* Custom Quiz */}
                <div 
                    onClick={() => navigate('/quiz')}
                    className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl p-5 md:p-6 rounded-[1.8rem] md:rounded-[2rem] border border-white/40 dark:border-white/5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                >
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform shadow-sm">
                        <Settings size={20} className="md:w-6 md:h-6" />
                    </div>
                    <h4 className="font-bold text-gray-800 dark:text-white text-sm md:text-lg">কাস্টম কুইজ</h4>
                    <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">নিজের মতো এক্সাম সাজান</p>
                </div>

                {/* Question Bank */}
                <div 
                    onClick={() => navigate('/qbank')}
                    className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl p-5 md:p-6 rounded-[1.8rem] md:rounded-[2rem] border border-white/40 dark:border-white/5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                >
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 dark:bg-orange-500/20 text-primary dark:text-orange-400 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform shadow-sm">
                        <Archive size={20} className="md:w-6 md:h-6" />
                    </div>
                    <h4 className="font-bold text-gray-800 dark:text-white text-sm md:text-lg">প্রশ্ন ব্যাংক</h4>
                    <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">বিগত বছরের প্রশ্ন</p>
                </div>

                {/* Battle */}
                <div 
                    onClick={() => navigate('/battle')}
                    className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl p-5 md:p-6 rounded-[1.8rem] md:rounded-[2rem] border border-white/40 dark:border-white/5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                >
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform shadow-sm">
                        <Swords size={20} className="md:w-6 md:h-6" />
                    </div>
                    <h4 className="font-bold text-gray-800 dark:text-white text-sm md:text-lg">কুইজ ব্যাটল</h4>
                    <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">বন্ধুদের চ্যালেঞ্জ করুন</p>
                </div>
            </div>
        </div>

        {/* 3. Free Model Tests */}
        <div>
            <h3 className="text-sm md:text-base font-black text-gray-500 dark:text-gray-400 mb-4 px-1 uppercase tracking-wider">ফ্রী মডেল টেস্ট</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                    onClick={() => startFreeModelTest('01', 'ফ্রী মডেল টেস্ট - ০১ (Physics)', 'Physics')}
                    className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-md p-5 rounded-[2rem] border border-white/40 dark:border-white/5 shadow-sm hover:border-orange-400 dark:hover:border-orange-500/50 transition-all cursor-pointer group"
                >
                    <div className="flex justify-between items-start mb-3">
                        <div className="w-10 h-10 bg-orange-50 dark:bg-orange-500/20 text-primary dark:text-orange-400 rounded-xl flex items-center justify-center shadow-sm">
                            <Atom size={20} />
                        </div>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700/50 text-[10px] font-bold rounded text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600">20 min</span>
                    </div>
                    <h4 className="font-bold text-gray-800 dark:text-white mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Physics: ভেক্টর ও গতিবিদ্যা</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">২৫টি প্রশ্ন | ২৫ মার্কস</p>
                </div>

                <div 
                    onClick={() => startFreeModelTest('02', 'ফ্রী মডেল টেস্ট - ০২ (Chemistry)', 'Chemistry')}
                    className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-md p-5 rounded-[2rem] border border-white/40 dark:border-white/5 shadow-sm hover:border-orange-400 dark:hover:border-orange-500/50 transition-all cursor-pointer group"
                >
                    <div className="flex justify-between items-start mb-3">
                        <div className="w-10 h-10 bg-orange-50 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center shadow-sm">
                            <Beaker size={20} />
                        </div>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700/50 text-[10px] font-bold rounded text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600">20 min</span>
                    </div>
                    <h4 className="font-bold text-gray-800 dark:text-white mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Chemistry: গুণগত রসায়ন</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">২৫টি প্রশ্ন | ২৫ মার্কস</p>
                </div>

                <div 
                    onClick={() => startFreeModelTest('03', 'ফ্রী মডেল টেস্ট - ০৩ (Math)', 'Math')}
                    className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-md p-5 rounded-[2rem] border border-white/40 dark:border-white/5 shadow-sm hover:border-red-400 dark:hover:border-red-500/50 transition-all cursor-pointer group"
                >
                    <div className="flex justify-between items-start mb-3">
                        <div className="w-10 h-10 bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center shadow-sm">
                            <Calculator size={20} />
                        </div>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700/50 text-[10px] font-bold rounded text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600">20 min</span>
                    </div>
                    <h4 className="font-bold text-gray-800 dark:text-white mb-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">Math: ম্যাট্রিক্স ও নির্ণায়ক</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">২৫টি প্রশ্ন | ২৫ মার্কস</p>
                </div>
            </div>
        </div>

        {/* 4. Featured Exams */}
        <div>
            <h3 className="text-sm md:text-base font-black text-gray-500 dark:text-gray-400 mb-4 px-1 uppercase tracking-wider">জনপ্রিয় প্রশ্ন ব্যাংক</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                    onClick={() => {
                        const examId = `gst_a_23_24_${Date.now()}`;
                        const config = {
                            title: "GST ক ইউনিট ২০২৩-২৪",
                            timeLimit: 60,
                            negativeMarking: 0.25,
                            mode: 'ALL_AT_ONCE',
                            type: 'PAST_PAPER',
                            examRef: 'gst_a_23_24',
                            isPracticeMode: true
                        };
                        localStorage.setItem(`exam_config_${examId}`, JSON.stringify(config));
                        navigate(`/exam/${examId}`);
                    }}
                    className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-md p-5 rounded-[2rem] border border-white/40 dark:border-white/5 shadow-sm hover:border-blue-500/50 transition-all cursor-pointer flex items-center justify-between group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                            <Archive size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">GST ক ইউনিট</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">২০২৩-২৪ সেশন | ১০০ প্রশ্ন</p>
                        </div>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-full group-hover:bg-blue-500 group-hover:text-white transition-all">
                        <ChevronRight size={20} />
                    </div>
                </div>

                <div 
                    onClick={() => {
                        const examId = `medical_24_25_${Date.now()}`;
                        const config = {
                            title: "মেডিকেল ভর্তি পরীক্ষা ২০২৪-২৫",
                            timeLimit: 60,
                            negativeMarking: 0.25,
                            mode: 'ALL_AT_ONCE',
                            type: 'PAST_PAPER',
                            examRef: 'medical_24_25',
                            isPracticeMode: true
                        };
                        localStorage.setItem(`exam_config_${examId}`, JSON.stringify(config));
                        navigate(`/exam/${examId}`);
                    }}
                    className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-md p-5 rounded-[2rem] border border-white/40 dark:border-white/5 shadow-sm hover:border-red-500/50 transition-all cursor-pointer flex items-center justify-between group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-50 dark:bg-red-500/20 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 shadow-sm">
                            <Archive size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">মেডিকেল ভর্তি পরীক্ষা</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">২০২৪-২৫ সেশন | ১০০ প্রশ্ন</p>
                        </div>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-full group-hover:bg-red-500 group-hover:text-white transition-all">
                        <ChevronRight size={20} />
                    </div>
                </div>
            </div>
        </div>

        {/* 5. Subject Horizontal Scroll */}
        <div>
            <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="text-sm md:text-base font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">বিষয়ভিত্তিক অনুশীলন</h3>
                <button onClick={() => navigate('/quiz')} className="text-xs font-bold text-primary dark:text-blue-400 flex items-center gap-1 hover:underline">সব দেখুন <ChevronRight size={12}/></button>
            </div>
            
            <div className="flex md:grid md:grid-cols-5 gap-3 md:gap-4 overflow-x-auto md:overflow-visible pb-4 md:pb-0 no-scrollbar">
                {SUBJECTS.map((sub, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => startSubjectPractice(sub.group)}
                        className="min-w-[100px] md:min-w-0 bg-white/70 dark:bg-gray-800/60 backdrop-blur-md p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-white/40 dark:border-white/5 flex flex-col items-center gap-3 cursor-pointer hover:border-gray-300 dark:hover:border-white/20 transition-all shadow-sm hover:shadow-lg hover:-translate-y-1"
                    >
                        <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-sm ${sub.color}`}>
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
