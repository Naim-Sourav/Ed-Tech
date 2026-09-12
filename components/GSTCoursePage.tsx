
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, AlertTriangle, FileText, Upload, 
  Trophy, Target, Calendar, ArrowRight, ShieldAlert,
  Flame, BookOpen, CheckSquare, Download, ChevronDown, ChevronUp
} from 'lucide-react';
import { useToast } from './Toast';

// --- ROUTINE DATA ---
const PHASE_1_ROUTINE = [
    { day: '01', sub1: 'Physics: ভেক্টর', sub2: 'Biology: কোষ ও এর গঠন' },
    { day: '02', sub1: 'Chemistry: ল্যাবরেটরির নিরাপদ ব্যবহার', sub2: 'Math: ম্যাট্রিক্স ও নির্ণায়ক' },
    { day: '03', sub1: 'Physics: গতিবিদ্যা', sub2: 'Biology: কোষ বিভাজন' },
    { day: '04', sub1: 'Chemistry: গুণগত রসায়ন (আংশিক)', sub2: 'Math: সরলরেখা' },
    { day: '05', sub1: 'Physics: নিউটনিয়ান বলবিদ্যা', sub2: 'Biology: কোষ রসায়ন' },
    { day: '06', sub1: 'Weekly Revision & Buffer Day', sub2: 'X' },
    { day: '07', sub1: 'Chemistry: গুণগত রসায়ন (শেষ অংশ)', sub2: 'Math: বৃত্ত' },
    { day: '08', sub1: 'Physics: কাজ, ক্ষমতা ও শক্তি', sub2: 'Biology: অণুজীব' },
    { day: '09', sub1: 'Chemistry: মৌলের পর্যায়বৃত্ত ধর্ম', sub2: 'Math: ত্রিকোণমিতি' },
    { day: '10', sub1: 'Physics: মহাকর্ষ ও অভিকর্ষ', sub2: 'Biology: উদ্ভিদ শারীরতত্ত্ব' },
    { day: '11', sub1: 'Chemistry: রাসায়নিক পরিবর্তন', sub2: 'Math: অন্তরীকরণ' },
    { day: '12', sub1: 'Physics: পদার্থের গাঠনিক ধর্ম', sub2: 'Biology: টিস্যু ও টিস্যুতন্ত্র' },
    { day: '13', sub1: 'Weekly Revision & Buffer Day', sub2: 'X' },
    { day: '14', sub1: 'Chemistry: পরিবেশ রসায়ন', sub2: 'Math: যোগজীকরণ' },
    { day: '15', sub1: 'Physics: পর্যাবৃত্ত গতি', sub2: 'Biology: নগ্নবীজী ও আবৃতবীজী' },
    { day: '16', sub1: 'Chemistry: জৈব রসায়ন ( হাইড্রোকার্বন )', sub2: 'Math: বহুপদী ও সমীকরণ' },
    { day: '17', sub1: 'Physics: আদর্শ গ্যাস ও গতিতত্ত্ব', sub2: 'Biology: প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস' },
    { day: '18', sub1: 'Chemistry: জৈব রসায়ন ( অ্যালকোহল-এসিড )', sub2: 'Math: কণিক' },
    { day: '19', sub1: 'Physics: তাপগতিবিদ্যা', sub2: 'Biology: হাইড্রা ও ঘাসফড়িং' },
    { day: '20', sub1: 'Weekly Revision & Buffer Day', sub2: 'X' },
    { day: '21', sub1: 'Chemistry: পরিমাণগত রসায়ন', sub2: 'Math: স্থিতিবিদ্যা' },
    { day: '22', sub1: 'Physics: স্থির তড়িৎ', sub2: 'Biology: রুই মাছ' },
    { day: '23', sub1: 'Chemistry: তড়িৎ রসায়ন', sub2: 'Math: গতিবিদ্যা' },
    { day: '24', sub1: 'Physics: চল তড়িৎ', sub2: 'Biology: পরিপাক ও শোষণ' },
    { day: '25', sub1: 'Chemistry: অর্থনৈতিক রসায়ন', sub2: 'Math: বিপরীত ত্রিকোণমিতি' },
    { day: '26', sub1: 'Physics: ভৌত আলোকবিজ্ঞান', sub2: 'Biology: রক্ত ও সঞ্চালন' },
    { day: '27', sub1: 'Weekly Revision & Buffer Day', sub2: 'X' },
    { day: '28', sub1: 'Physics: আধুনিক পদার্থবিজ্ঞান', sub2: 'Biology: জিনতত্ত্ব ও বিবর্তন' },
    { day: '29', sub1: 'Physics: সেমিকন্ডাক্টর', sub2: 'Biology: মানবদেহের প্রতিরক্ষা' },
    { day: '30', sub1: 'Physics: জ্যোতির্বিজ্ঞান (আংশিক)', sub2: 'Math: বিস্তার ও সম্ভাবনা' },
];

const PHASE_2_ROUTINE = [
    { day: '31', exam: 'Physics 1st Paper Final (50 Marks)' },
    { day: '32', exam: 'Chemistry 1st Paper Final (50 Marks)' },
    { day: '33', exam: 'Math 1st Paper Final (50 Marks)' },
    { day: '34', exam: 'Biology 1st Paper Final (50 Marks)' },
    { day: '35', exam: 'Physics 2nd Paper Final (50 Marks)' },
    { day: '36', exam: 'Chemistry 2nd Paper Final (50 Marks)' },
    { day: '37', exam: 'Math 2nd Paper Final (50 Marks)' },
    { day: '38', exam: 'Biology 2nd Paper Final (50 Marks)' },
];

const PHASE_3_ROUTINE = [
    { day: '39', exam: 'SUBJECT FINAL: PHYSICS (100 Marks)' },
    { day: '40', exam: 'SUBJECT FINAL: CHEMISTRY (100 Marks)' },
    { day: '41', exam: 'SUBJECT FINAL: MATH (100 Marks)' },
    { day: '42', exam: 'SUBJECT FINAL: BIOLOGY (100 Marks)' },
];

const PHASE_4_ROUTINE = [
    { day: '43', exam: 'GST MODEL TEST - 01 (100 Marks)' },
    { day: '44', exam: 'GST MODEL TEST - 02 (100 Marks)' },
    { day: '45', exam: 'GST MODEL TEST - 03 (100 Marks)' },
];

const GSTCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [showFullRoutine, setShowFullRoutine] = useState(false);

  const handleEnroll = () => {
      // In a real app, this would open the payment modal directly for this package
      navigate('/courses');
      showToast("কোর্স সেকশন থেকে 'GST সুপার ফোকাস' প্যাকটি সিলেক্ট করুন।", "info");
  };

  const downloadRoutine = () => {
      showToast("রুটিন ডাউনলোড হচ্ছে...", "success");
      
      const routineText = `
PORAR TABLE - GST SUPER FOCUS CHALLENGE ROUTINE
-------------------------------------------
Phase 1: Chapter Wise (Day 01 - 30)
${PHASE_1_ROUTINE.map(r => `Day ${r.day}: ${r.sub1} | ${r.sub2}`).join('\n')}

Phase 2: Paper Final (Day 31 - 38)
${PHASE_2_ROUTINE.map(r => `Day ${r.day}: ${r.exam}`).join('\n')}

Phase 3: Subject Final (Day 39 - 42)
${PHASE_3_ROUTINE.map(r => `Day ${r.day}: ${r.exam}`).join('\n')}

Phase 4: Final Model Test (Day 43 - 45)
${PHASE_4_ROUTINE.map(r => `Day ${r.day}: ${r.exam}`).join('\n')}

STRICT GUIDELINES:
1. Three Strike Rule: Miss 3 days = BAN.
2. Deadline: 07:00 PM for tasks.
3. Pass Mark: 40%.
-------------------------------------------
Discipline • Dedication • Domination
      `;

      const blob = new Blob([routineText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'PorarTable_GST_Routine.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-black transition-colors">
      <Helmet>
        <title>GST সুপার ফোকাস চ্যালেঞ্জ - Porikkhangon | GST Admission Preparation</title>
        <meta name="description" content="GST গুচ্ছ ভর্তি পরীক্ষার জন্য ৪৫ দিনের স্পেশাল চ্যালেঞ্জ। চ্যাপ্টার ওয়াইজ মিশন, পেপার ফাইনাল এবং পূর্ণাঙ্গ মডেল টেস্টের মাধ্যমে নিশ্চিত করো তোমার চান্স।" />
        <meta property="og:title" content="GST সুপার ফোকাস চ্যালেঞ্জ - Porikkhangon" />
        <meta property="og:description" content="GST গুচ্ছ ভর্তি পরীক্ষার ৪৫ দিনের সেরা রুটিন ও এক্সাম কোর্স।" />
        <link rel="canonical" href="https://www.porikkhangon.app/#/gst-challenge" />
      </Helmet>
      
      {/* 1. Hero Section - Aggressive & Motivating */}
      <div className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-600/20 rounded-full blur-[100px]"></div>
        
        <div className="max-w-4xl mx-auto px-6 py-16 md:py-24 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/20 border border-red-500/50 text-red-400 font-bold text-xs uppercase tracking-widest mb-6 animate-pulse">
                <Flame size={14} fill="currentColor"/> Discipline • Dedication • Domination
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                GST সুপার ফোকাস <span className="text-red-500">চ্যালেঞ্জ</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                ৪৫ দিনের ফিক্সড রুটিন। দৈনিক টার্গেট, দৈনিক এক্সাম। 
                <br/><span className="text-white font-bold">নিজে পড়বেন, আমরা শুধু আপনার ডিসিপ্লিন এবং প্র্যাকটিস নিশ্চিত করব।</span>
            </p>
            <button 
                onClick={handleEnroll}
                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-red-600/30 flex items-center justify-center gap-3 mx-auto transition-all active:scale-95"
            >
                চ্যালেঞ্জ গ্রহণ করুন <ArrowRight size={20}/>
            </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-12 pb-32">
        
        {/* 2. The Routine (Visual Timeline) */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-zinc-800 shadow-sm">
            <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2">আপনার প্রতিদিনের রুটিন</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">আগামী ৪৫ দিন এই রুটিনই আপনার জীবন।</p>
            </div>

            <div className="relative pl-8 md:pl-0">
                {/* Vertical Line */}
                <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-1 bg-gray-100 dark:bg-gray-700 -ml-[2.5px] md:-ml-[0.5px]"></div>

                {/* 06:00 AM */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 relative group">
                    <div className="md:w-1/2 md:pr-12 md:text-right text-left pl-6 md:pl-0 mb-2 md:mb-0">
                        <h4 className="text-lg font-bold text-primary">সকাল ০৬:০০</h4>
                        <p className="text-sm font-bold text-gray-800 dark:text-white">টাস্ক ড্রপ (Task Drop)</p>
                        <p className="text-xs text-gray-500">গ্রুপে এবং অ্যাপে আজকের পড়ার টপিক দেওয়া হবে।</p>
                    </div>
                    <div className="absolute left-0 md:left-1/2 w-6 h-6 bg-white dark:bg-zinc-900 border-4 border-primary rounded-full -ml-[14px] md:-ml-[12px] z-10"></div>
                    <div className="md:w-1/2 md:pl-12 hidden md:block">
                        <Target className="text-primary opacity-50" size={32}/>
                    </div>
                </div>

                {/* ALL DAY */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 relative group">
                    <div className="md:w-1/2 md:pr-12 hidden md:flex justify-end">
                        <BookOpen className="text-orange-700 dark:text-orange-400 opacity-50" size={32}/>
                    </div>
                    <div className="absolute left-0 md:left-1/2 w-6 h-6 bg-white dark:bg-zinc-900 border-4 border-orange-500 rounded-full -ml-[14px] md:-ml-[12px] z-10"></div>
                    <div className="md:w-1/2 md:pl-12 text-left pl-6">
                        <h4 className="text-lg font-bold text-orange-700 dark:text-orange-400">সারাদিন</h4>
                        <p className="text-sm font-bold text-gray-800 dark:text-white">সেলফ স্টাডি (Study Time)</p>
                        <p className="text-xs text-gray-500">বই এবং প্রশ্নব্যাংক থেকে টপিকগুলো শেষ করবেন।</p>
                    </div>
                </div>

                {/* 07:00 PM */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 relative group">
                    <div className="md:w-1/2 md:pr-12 md:text-right text-left pl-6 md:pl-0 mb-2 md:mb-0">
                        <h4 className="text-lg font-bold text-purple-600">সন্ধ্যা ০৭:০০</h4>
                        <p className="text-sm font-bold text-gray-800 dark:text-white">টাস্ক সাবমিশন (Deadline)</p>
                        <p className="text-xs text-gray-500">নোট বা ম্যাথ সলভের ছবি অ্যাপে আপলোড করতে হবে।</p>
                    </div>
                    <div className="absolute left-0 md:left-1/2 w-6 h-6 bg-white dark:bg-zinc-900 border-4 border-purple-600 rounded-full -ml-[14px] md:-ml-[12px] z-10"></div>
                    <div className="md:w-1/2 md:pl-12 hidden md:block">
                        <Upload className="text-purple-600 opacity-50" size={32}/>
                    </div>
                </div>

                {/* 08:30 PM */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 relative group">
                    <div className="md:w-1/2 md:pr-12 hidden md:flex justify-end">
                        <FileText className="text-red-500 opacity-50" size={32}/>
                    </div>
                    <div className="absolute left-0 md:left-1/2 w-6 h-6 bg-white dark:bg-zinc-900 border-4 border-red-500 rounded-full -ml-[14px] md:-ml-[12px] z-10 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                    <div className="md:w-1/2 md:pl-12 text-left pl-6">
                        <h4 className="text-lg font-bold text-red-500 flex items-center gap-2"><Clock size={16}/> রাত ০৮:৩০</h4>
                        <p className="text-sm font-bold text-gray-800 dark:text-white">ডেইলি এক্সাম (Exam Time)</p>
                        <p className="text-xs text-gray-500">২৫-৩০ মার্কের লাইভ এক্সাম (নেগেটিভ মার্কিং সহ)।</p>
                    </div>
                </div>

                {/* 10:00 PM */}
                <div className="flex flex-col md:flex-row items-center justify-between relative group">
                    <div className="md:w-1/2 md:pr-12 md:text-right text-left pl-6 md:pl-0 mb-2 md:mb-0">
                        <h4 className="text-lg font-bold text-green-500">রাত ১০:০০</h4>
                        <p className="text-sm font-bold text-gray-800 dark:text-white">রেজাল্ট ও মেরিট লিস্ট</p>
                        <p className="text-xs text-gray-500">সলভ শিট এবং নিজের পজিশন চেক করুন।</p>
                    </div>
                    <div className="absolute left-0 md:left-1/2 w-6 h-6 bg-white dark:bg-zinc-900 border-4 border-green-500 rounded-full -ml-[14px] md:-ml-[12px] z-10"></div>
                    <div className="md:w-1/2 md:pl-12 hidden md:block">
                        <Trophy className="text-green-500 opacity-50" size={32}/>
                    </div>
                </div>
            </div>
        </div>

        {/* 3. The 45 Day Roadmap (Graph) */}
        <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white text-center">৪৫ দিনের কমপ্লিট প্ল্যান</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-orange-50 dark:bg-orange-900/20 p-5 rounded-2xl border border-orange-100 dark:border-orange-800">
                    <div className="flex justify-between items-center mb-2">
                        <span className="bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-200 text-xs font-bold px-3 py-1 rounded-full">Phase 1</span>
                        <span className="text-orange-600 dark:text-orange-400 font-black text-xl">৩০ দিন</span>
                    </div>
                    <h3 className="font-bold text-gray-800 dark:text-white text-lg">চ্যাপ্টার ওয়াইজ মিশন</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">প্রতিদিন ২টি ভিন্ন বিষয়ের ২য়টি চ্যাপ্টার শেষ করা হবে।</p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-2xl border border-purple-100 dark:border-purple-800">
                    <div className="flex justify-between items-center mb-2">
                        <span className="bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-200 text-xs font-bold px-3 py-1 rounded-full">Phase 2</span>
                        <span className="text-purple-600 dark:text-purple-400 font-black text-xl">০৮ দিন</span>
                    </div>
                    <h3 className="font-bold text-gray-800 dark:text-white text-lg">পেপার ফাইনাল</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Physics 1st, 2nd... এভাবে প্রতিটি পেপারের ওপর ৫০ মার্কের এক্সাম।</p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 p-5 rounded-2xl border border-orange-100 dark:border-orange-800">
                    <div className="flex justify-between items-center mb-2">
                        <span className="bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-200 text-xs font-bold px-3 py-1 rounded-full">Phase 3</span>
                        <span className="text-orange-600 dark:text-orange-400 font-black text-xl">০৪ দিন</span>
                    </div>
                    <h3 className="font-bold text-gray-800 dark:text-white text-lg">সাবজেক্ট ফাইনাল</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">সম্পূর্ণ পদার্থবিজ্ঞান, রসায়ন... ১০০ মার্কের মেগা এক্সাম।</p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-2xl border border-green-100 dark:border-green-800">
                    <div className="flex justify-between items-center mb-2">
                        <span className="bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 text-xs font-bold px-3 py-1 rounded-full">Phase 4</span>
                        <span className="text-green-600 dark:text-green-400 font-black text-xl">০৩ দিন</span>
                    </div>
                    <h3 className="font-bold text-gray-800 dark:text-white text-lg">ফাইনাল মডেল টেস্ট</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">GST স্ট্যান্ডার্ড ১০০ মার্কের পূর্ণাঙ্গ ভর্তি পরীক্ষা।</p>
                </div>
            </div>
        </div>

        {/* 4. Detailed Routine Table Section (New) */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-lg">
            <div className="p-6 bg-gray-50 dark:bg-black/50 flex justify-between items-center cursor-pointer" onClick={() => setShowFullRoutine(!showFullRoutine)}>
                <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar className="text-primary"/> বিস্তারিত রুটিন (Syllabus)
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">কোন দিন কী পড়বেন তার পূর্ণাঙ্গ তালিকা</p>
                </div>
                <button className="p-2 bg-white dark:bg-zinc-900 rounded-full shadow-sm">
                    {showFullRoutine ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                </button>
            </div>
            
            {showFullRoutine && (
                <div className="animate-in slide-in-from-top-4 duration-300">
                    <div className="p-4 flex justify-end">
                        <button onClick={downloadRoutine} className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">
                            <Download size={14}/> PDF ডাউনলোড করুন
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                <tr>
                                    <th className="p-4 font-bold whitespace-nowrap">দিন</th>
                                    <th className="p-4 font-bold whitespace-nowrap">বিষয় - ১ (Subject 1)</th>
                                    <th className="p-4 font-bold whitespace-nowrap">বিষয় - ২ (Subject 2)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {/* Phase 1 */}
                                <tr className="bg-orange-50/50 dark:bg-orange-900/10"><td colSpan={3} className="p-2 text-center text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-widest">Phase 1: Chapter Wise</td></tr>
                                {PHASE_1_ROUTINE.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <td className="p-4 font-bold text-gray-500">Day {row.day}</td>
                                        <td className="p-4 font-medium text-gray-800 dark:text-gray-200">{row.sub1}</td>
                                        <td className="p-4 font-medium text-gray-800 dark:text-gray-200">{row.sub2}</td>
                                    </tr>
                                ))}
                                
                                {/* Phase 2 */}
                                <tr className="bg-purple-50/50 dark:bg-purple-900/10"><td colSpan={3} className="p-2 text-center text-xs font-bold text-purple-600 uppercase tracking-widest">Phase 2: Paper Final</td></tr>
                                {PHASE_2_ROUTINE.map((row, idx) => (
                                    <tr key={`p2-${idx}`} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <td className="p-4 font-bold text-gray-500">Day {row.day}</td>
                                        <td colSpan={2} className="p-4 font-bold text-purple-600 dark:text-purple-400">{row.exam}</td>
                                    </tr>
                                ))}

                                {/* Phase 3 */}
                                <tr className="bg-orange-50/50 dark:bg-orange-900/10"><td colSpan={3} className="p-2 text-center text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-widest">Phase 3: Subject Final</td></tr>
                                {PHASE_3_ROUTINE.map((row, idx) => (
                                    <tr key={`p3-${idx}`} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <td className="p-4 font-bold text-gray-500">Day {row.day}</td>
                                        <td colSpan={2} className="p-4 font-black text-orange-700 dark:text-orange-400">{row.exam}</td>
                                    </tr>
                                ))}

                                {/* Phase 4 */}
                                <tr className="bg-green-50/50 dark:bg-green-900/10"><td colSpan={3} className="p-2 text-center text-xs font-bold text-green-600 uppercase tracking-widest">Phase 4: Final Model Test</td></tr>
                                {PHASE_4_ROUTINE.map((row, idx) => (
                                    <tr key={`p4-${idx}`} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <td className="p-4 font-bold text-gray-500">Day {row.day}</td>
                                        <td colSpan={2} className="p-4 font-black text-green-600 dark:text-green-400 text-lg">{row.exam}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>

        {/* 5. Strict Guidelines (Warning) */}
        <div className="bg-red-50 dark:bg-red-900/10 p-6 md:p-8 rounded-3xl border-2 border-red-100 dark:border-red-900/30">
            <div className="flex items-center gap-3 mb-4">
                <ShieldAlert size={32} className="text-red-600"/>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">কঠোর নিয়মাবলী</h2>
            </div>
            <ul className="space-y-3">
                <li className="flex items-start gap-3">
                    <AlertTriangle size={18} className="text-red-500 mt-1 shrink-0"/>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        <span className="font-bold text-red-600">Three Strike Rule:</span> পরপর ৩ দিন টাস্ক জমা না দিলে বা এক্সাম মিস করলে গ্রুপ থেকে <span className="underline">ব্যান</span> করা হবে।
                    </p>
                </li>
                <li className="flex items-start gap-3">
                    <Clock size={18} className="text-red-500 mt-1 shrink-0"/>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        সন্ধ্যা ৭:০০ টার পর কোনো টাস্ক জমা নেওয়া হবে না। সময়ের কাজ সময়ে করতে হবে।
                    </p>
                </li>
                <li className="flex items-start gap-3">
                    <CheckSquare size={18} className="text-red-500 mt-1 shrink-0"/>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        পাস মার্ক ৪০%। এর কম পেলে পরদিন ডাবল হোমওয়ার্ক করতে হবে।
                    </p>
                </li>
            </ul>
        </div>

        {/* 6. Sticky Bottom CTA */}
        <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 md:w-auto z-50 flex justify-center">
            <button 
                onClick={handleEnroll}
                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3.5 rounded-full font-bold text-sm md:text-base shadow-2xl flex items-center gap-2 hover:scale-105 transition-transform"
            >
                🔥 সিট সীমিত! বিনামূল্যে জয়েন করুন
            </button>
        </div>

      </div>
    </div>
  );
};

export default GSTCoursePage;
