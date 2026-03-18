
import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import { Sparkles, GraduationCap, ArrowRight, Trophy, Swords, Zap, Crown, Rocket, Play, Activity, BookOpen, Clock, Archive, ShieldCheck, RotateCcw, Bookmark, ChevronDown } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
}

// --- SUB-COMPONENTS ---

const AnimatedCounter = ({ end, duration = 2000, suffix = "" }: { end: number, duration?: number, suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

const UniversityMarquee = () => {
  const unis = ["BUET", "DMC", "Dhaka University", "RUET", "KUET", "CUET", "SUST", "Jahangirnagar", "Rajshahi University", "Chittagong University", "GST", "AFMC"];
  return (
    <div className="w-full overflow-hidden bg-gray-50/50 dark:bg-gray-900/50 py-4 border-y border-gray-100 dark:border-gray-800">
      <div className="flex w-[200%] animate-marquee whitespace-nowrap">
        {unis.concat(unis).map((uni, i) => (
          <div key={i} className="mx-8 flex items-center gap-2 text-gray-400 font-bold text-lg uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity cursor-default">
            <GraduationCap size={20} /> {uni}
          </div>
        ))}
      </div>
      <style>{`
        .animate-marquee { animation: marquee 30s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
};

const QuestionPaperCard = ({ title, sub, icon, color }: any) => (
  <div className="mx-3 relative group w-64 h-32 flex-shrink-0 cursor-pointer">
      <div className={`absolute inset-0 bg-gradient-to-r ${color} rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity`}></div>
      <div className="absolute inset-0 border border-gray-100 dark:border-gray-700 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 flex flex-col justify-between transition-transform group-hover:-translate-y-1 duration-300">
          <div className="flex justify-between items-start">
              <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-700 ${color.replace('from-', 'text-').split(' ')[0]}`}>
                  {icon}
              </div>
              <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">Exam</span>
          </div>
          <div>
              <h4 className="font-bold text-gray-800 dark:text-white text-sm line-clamp-1">{title}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub}</p>
          </div>
      </div>
  </div>
);

const QuestionPaperMarquee = () => {
  const row1 = [
    { title: "মেডিকেল ভর্তি পরীক্ষা", sub: "২০২৩-২৪ | সেট ক", icon: <Activity size={18}/>, color: "from-green-500 to-emerald-500" },
    { title: "ঢাকা বিশ্ববিদ্যালয় (ক)", sub: "২০২২-২৩ | পদার্থবিজ্ঞান", icon: <GraduationCap size={18}/>, color: "from-orange-500 to-red-500" },
    { title: "বুয়েট প্রিলিমিনারি", sub: "২০২১-২২ | শিফট ১", icon: <Zap size={18}/>, color: "from-blue-500 to-indigo-500" },
    { title: "রাজশাহী বিশ্ববিদ্যালয়", sub: "২০২৩-২৪ | ইউনিট সি", icon: <BookOpen size={18}/>, color: "from-purple-500 to-pink-500" },
    { title: "জাহাঙ্গীরনগর ঢ ইউনিট", sub: "২০২২-২৩ | জীববিজ্ঞান", icon: <Dna size={18}/>, color: "from-green-600 to-teal-500" },
  ];

  const row2 = [
    { title: "গুচ্ছ (GST) ক ইউনিট", sub: "২০২৩-২৪ | রসায়ন", icon: <Beaker size={18}/>, color: "from-cyan-500 to-blue-500" },
    { title: "আর্মড ফোর্সেস মেডিকেল", sub: "২০২২-২৩ | সাধারণ জ্ঞান", icon: <ShieldCheck size={18}/>, color: "from-red-500 to-rose-500" },
    { title: "কৃষি গুচ্ছ ভর্তি পরীক্ষা", sub: "২০২৩ | উদ্ভিদবিজ্ঞান", icon: <Leaf size={18}/>, color: "from-lime-500 to-green-600" },
    { title: "চুয়েট কুয়েট রুয়েট", sub: "২০২১-২২ | গণিত", icon: <Calculator size={18}/>, color: "from-violet-500 to-purple-600" },
    { title: "ডেন্টাল ভর্তি পরীক্ষা", sub: "২০২৩-২৪ | ইংরেজি", icon: <Activity size={18}/>, color: "from-sky-500 to-blue-600" },
  ];

  return (
    <div className="w-full overflow-hidden py-10 relative space-y-6">
      {/* Gradient Masks */}
      <div className="absolute top-0 left-0 h-full w-32 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10 pointer-events-none"></div>

      {/* Row 1: Left */}
      <div className="flex w-[200%] animate-marquee-left whitespace-nowrap">
        {row1.concat(row1).concat(row1).map((paper, i) => (
           <QuestionPaperCard key={`r1-${i}`} {...paper} />
        ))}
      </div>

      {/* Row 2: Right */}
      <div className="flex w-[200%] animate-marquee-right whitespace-nowrap">
        {row2.concat(row2).concat(row2).map((paper, i) => (
           <QuestionPaperCard key={`r2-${i}`} {...paper} />
        ))}
      </div>

      <style>{`
        .animate-marquee-left { animation: marquee-left 60s linear infinite; }
        .animate-marquee-right { animation: marquee-right 60s linear infinite; }
        @keyframes marquee-left { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes marquee-right { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
      `}</style>
    </div>
  );
};

// --- ICONS ---
const Beaker = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 3h15"/><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3"/><path d="M6 14h12"/></svg>;
const Calculator = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>;
const Dna = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/><path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/><path d="M17 6l-2.5-2.5"/><path d="M14 8l-1-1"/><path d="M7 18l2.5 2.5"/><path d="M3.5 14.5l1-1"/><path d="M20 9l2.5 2.5"/><path d="M14.5 16.5l1-1"/><path d="M10 2l-2.5 2.5"/><path d="M3 8l1-1"/><path d="M9 20l1-1"/><path d="M17 18l-2.5 2.5"/><path d="M7.5 10.5l-1-1"/></svg>;
const Leaf = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 13-11 19Z"/><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 13-11 19Z"/></svg>;

// --- MAIN COMPONENT ---

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  const [animationData, setAnimationData] = useState<any>(null);
  const [aiAnimationData, setAiAnimationData] = useState<any>(null);

  useEffect(() => {
    fetch('/Exams Preparation..json')
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(err => console.error('Error loading animation:', err));

    fetch('/learning.json')
      .then(res => res.json())
      .then(data => setAiAnimationData(data))
      .catch(err => console.error('Error loading AI animation:', err));
  }, []);

  return (
    <main className="h-screen w-full overflow-y-auto bg-white dark:bg-gray-900 font-sans text-gray-900 dark:text-white transition-colors scroll-smooth selection:bg-primary/30">
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 md:h-20 flex items-center justify-between">
          
          {/* Left Side - Brand Logo */}
          <div className="flex items-center cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="flex items-center gap-1.5 transform group-hover:scale-105 transition-transform">
                  <img src="./Pshape.svg" alt="Porikkhangon - HSC & Admission Preparation Logo" className="h-10 md:h-12 w-auto object-contain logo-dark-mode" />
                  <img src="./letterlogo.svg" alt="Porikkhangon Typography" className="h-6 md:h-7 w-auto object-contain logo-dark-mode" />
              </div>
          </div>

          {/* Right Side - Buttons */}
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={onLoginClick}
              className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-orange-400 hidden sm:block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              লগইন
            </button>
            <button 
              onClick={onLoginClick}
              className="px-4 py-2 md:px-6 md:py-2.5 bg-primary hover:bg-orange-600 text-white font-bold text-sm md:text-base rounded-xl transition-all shadow-lg shadow-orange-900/20 active:scale-95 flex items-center gap-2 group border border-transparent hover:border-orange-400/30"
            >
              রেজিস্ট্রেশন <ArrowRight size={16} className="md:w-[18px] md:h-[18px] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-24 md:pb-32 px-4 md:px-6 overflow-hidden">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white dark:from-gray-900 to-transparent pointer-events-none"></div>
        
        {/* Moving Blobs */}
        <div className="absolute top-20 left-10 w-48 h-48 md:w-72 md:h-72 bg-orange-500/20 rounded-full blur-[80px] md:blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 md:w-96 md:h-96 bg-orange-500/10 rounded-full blur-[100px] md:blur-[120px] animate-pulse delay-1000"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-16">
            
            {/* Left Column: Text & Buttons */}
            <div className="text-center lg:text-left space-y-6 md:space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white">
                পরীক্ষা প্রস্তুতির বিশেষ <span className="text-primary dark:text-orange-400">অঙ্গন</span>
              </h1>
              
              <p className="text-base md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                এইচএসসি একাডেমিক কিংবা এডমিশন —সবকিছুর পূর্ণাঙ্গ প্রস্তুতি এখন এক জায়গায়। আনলিমিটেড এক্সাম, মডেল টেস্ট, প্রশ্নব্যাংক সলভ, AI টিউটর, কুইজ ব্যাটল এবং স্মার্ট ট্র্যাকিং ছাড়াও দারুণ সব ফিচারের মাধ্যমে নিজেকে গড়ে তোলো সেরাদের সেরা হিসেবে।
              </p>
              
              <div className="flex flex-col sm:flex-row lg:flex-col items-center lg:items-start justify-center lg:justify-start gap-4 w-full sm:w-auto">
                <button 
                  onClick={onLoginClick}
                  className="w-full sm:w-72 lg:w-80 px-6 py-3.5 md:px-8 md:py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl md:rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg shadow-xl shadow-gray-500/20"
                >
                  <Zap size={20} className="fill-yellow-400 text-yellow-400 md:w-[22px] md:h-[22px]" /> পরীক্ষা শুরু করো
                </button>
                <button 
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-72 lg:w-80 px-6 py-3.5 md:px-8 md:py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 font-bold rounded-xl md:rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2 group"
                >
                  <Play size={18} className="group-hover:text-primary transition-colors md:w-5 md:h-5" /> ডেমো দেখুন
                </button>
              </div>
            </div>

            {/* Right Column: Lottie Animation */}
            <div className="flex justify-center lg:justify-end animate-in fade-in zoom-in duration-1000 delay-200">
              <div className="w-72 h-72 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px] drop-shadow-2xl">
                {animationData && <Lottie animationData={animationData} loop={true} />}
              </div>
            </div>

          </div>

          {/* Animated Stats - REPLACED WITH CAPABILITIES */}
          <div className="mt-16 md:mt-24 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm max-w-5xl mx-auto animate-in fade-in zoom-in duration-1000 delay-500">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                  <div className="text-center">
                      <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-1"><AnimatedCounter end={20000} suffix="+" /></p>
                      <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider">প্রশ্ন সম্ভার</p>
                  </div>
                  <div className="text-center border-l border-gray-200 dark:border-gray-700">
                      <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-1"><AnimatedCounter end={24} suffix="/7" /></p>
                      <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider">AI সাপোর্ট</p>
                  </div>
                  <div className="text-center border-l-0 md:border-l border-gray-200 dark:border-gray-700 pt-4 md:pt-0 border-t md:border-t-0">
                      <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-1"><AnimatedCounter end={10} suffix="+" /></p>
                      <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider">বছরের প্রশ্ন</p>
                  </div>
                  <div className="text-center border-l border-gray-200 dark:border-gray-700 pt-4 md:pt-0 border-t md:border-t-0">
                      <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-1"><AnimatedCounter end={4} suffix="টি" /></p>
                      <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider flex items-center justify-center gap-1">মেজর টার্গেট</p>
                  </div>
              </div>
          </div>
        </div>
      </section>

      {/* Infinite Scroll Marquee */}
      <UniversityMarquee />

      {/* Bento Grid Features */}
      <section id="features" className="py-16 md:py-24 px-4 md:px-6 relative">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 md:mb-16 space-y-3 md:space-y-4">
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white">কেন <span className="text-primary dark:text-orange-400">পরীক্ষাঙ্গন</span>?</h2>
                <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    ভর্তি যুদ্ধের এই কঠিন সময়ে প্রয়োজন একজন নির্ভরযোগ্য গাইড। পরীক্ষাঙ্গন তোমাকে দিচ্ছে পার্সোনালাইজড কেয়ার, কম্পিটিটিভ এনভায়রনমেন্ট এবং লেটেস্ট টেকনোলজি—যা তোমাকে অন্যদের চেয়ে এক ধাপ এগিয়ে রাখবে।
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 gap-4 md:gap-6 md:grid-rows-2 h-auto md:h-[600px]">
                
                {/* Feature 1: Live Exam (Big Card - Focus) - UPDATED TO MATCH HOME PAGE */}
                <div className="md:col-span-4 md:row-span-2 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 text-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group min-h-[400px] cursor-pointer" onClick={onLoginClick}>
                    {/* Abstract Background Elements from HomeDashboard */}
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px] -mr-20 -mt-20 group-hover:bg-primary/30 transition-all duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-cyan-500/10 rounded-full blur-[80px] -ml-10 -mb-10"></div>

                    <div className="relative z-10 h-full flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-4 max-w-lg flex-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-orange-300 backdrop-blur-md">
                                <Sparkles size={12} /> ডেইলি চ্যালেঞ্জ
                            </div>
                            <h3 className="text-3xl md:text-5xl font-bold leading-tight">
                                নিজেকে যাচাই করো <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-300">লাইভ কুইজ</span> দিয়ে
                            </h3>
                            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                                প্রতিদিন নতুন নতুন টপিকের উপর মডেল টেস্ট দাও এবং তোমার অবস্থান যাচাই করো। ভুলগুলো থেকে শেখো।
                            </p>
                            <button className="mt-4 bg-primary hover:bg-orange-700 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-900/20 group-hover:scale-105 active:scale-95 w-fit">
                                পরীক্ষা শুরু করুন <ArrowRight size={18} />
                            </button>
                        </div>

                        {/* Visual Element from HomeDashboard */}
                        <div className="relative w-full md:w-auto flex justify-center mt-8 md:mt-0">
                            <div className="relative w-64 h-48 bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 transform rotate-3 group-hover:rotate-6 transition-transform duration-500 shadow-2xl">
                                <div className="absolute -top-3 -right-3 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg animate-bounce">Live</div>
                                <div className="h-full flex flex-col justify-between">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary"><Clock size={20}/></div>
                                        <div>
                                            <p className="text-sm font-bold text-white">Physics Quiz</p>
                                            <p className="text-[10px] text-gray-400">Time: 20 Mins</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary w-[70%]"></div>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-gray-400">
                                            <span>Progress</span>
                                            <span>1500+ Participants</span>
                                        </div>
                                    </div>
                                    <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-colors text-white">
                                        Join Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feature 3: Quiz Battle (Medium) */}
                <div className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-orange-500 to-orange-700 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 text-white shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between min-h-[300px]" onClick={onLoginClick}>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6 md:mb-10">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <Swords size={24} className="md:w-10 md:h-10 text-white" />
                            </div>
                            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm animate-pulse">MULTIPLAYER</span>
                        </div>
                        <h3 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">কুইজ ব্যাটল</h3>
                        <p className="text-orange-100 text-sm md:text-lg leading-relaxed">বন্ধুদের চ্যালেঞ্জ করো এবং লাইভ ১ বনাম ১ কুইজ খেলে পয়েন্ট জিতো। মেধার লড়াইয়ে নিজেকে প্রমাণ করো সবার মাঝে।</p>
                    </div>
                    <div className="relative z-10 mt-8">
                        <button className="w-full py-3 bg-white text-primary rounded-xl font-bold text-sm md:text-base hover:bg-orange-50 transition-colors shadow-lg">ব্যাটল শুরু করো</button>
                    </div>
                    <div className="absolute -bottom-10 -right-10 text-white/10 transform rotate-12 group-hover:rotate-0 transition-transform duration-700">
                        <Swords size={120} className="md:w-[200px] md:h-[200px]" />
                    </div>
                </div>


            </div>
        </div>
      </section>

      {/* AI Bot Feature Section - Redesigned */}
      <section className="py-10 md:py-32 px-4 md:px-6 bg-gray-50 dark:bg-gray-800/20 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-24">
            
            {/* Animation Side */}
            <div className="w-full md:w-1/2 flex justify-center animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="w-56 h-56 md:w-80 md:h-80 lg:w-[500px] lg:h-[500px] drop-shadow-2xl relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-[60px] animate-pulse"></div>
                {aiAnimationData && <Lottie animationData={aiAnimationData} loop={true} />}
              </div>
            </div>

            {/* Content Side */}
            <div className="w-full md:w-1/2 space-y-6 md:space-y-8 text-center md:text-left animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
              <div className="space-y-2 md:space-y-4">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
                  পরীক্ষাঙ্গন <span className="text-primary">AI টিউটর</span>
                </h2>
                <div className="h-1.5 w-32 bg-gradient-to-r from-primary to-orange-400 rounded-full mx-auto md:mx-0"></div>
              </div>
              
              <hr className="border-gray-200 dark:border-gray-700 w-full hidden md:block" />
              
              <div className="space-y-6">
                <p className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  ২৪/৭ পার্সোনাল টিউটর। যেকোনো কঠিন টপিক বা ম্যাথ ছবি তুলে পাঠাও, মুহূর্তেই সমাধান বুঝে নাও। আমাদের উন্নত AI প্রযুক্তি তোমাকে প্রতিটি প্রশ্নের গভীরে গিয়ে ব্যাখ্যা প্রদান করবে, যেন তোমার শেখা হয় আরও সহজ ও কার্যকর।
                </p>
                
                <div className="hidden md:block">
                    <ul className="space-y-4">
                    {[
                        "যেকোনো প্রশ্নের তাৎক্ষণিক সমাধান",
                        "ধাপে ধাপে ব্যাখ্যা ও কনসেপ্ট ক্লিয়ারিং",
                        "২৪ ঘণ্টা এভেইলঅ্যাবল সাপোর্ট"
                    ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-200 font-medium">
                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0">
                            <Zap size={14} fill="currentColor" />
                        </div>
                        {item}
                        </li>
                    ))}
                    </ul>
                </div>
              </div>

              <div className="flex justify-center md:justify-start">
                <button onClick={onLoginClick} className="bg-primary hover:bg-orange-600 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-lg transition-all shadow-xl shadow-orange-900/20 hover:scale-105 active:scale-95 flex items-center gap-3">
                    AI টিউটর ব্যবহার করো <ArrowRight size={20} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Gamification Section */}
      <section className="py-10 md:py-24 px-4 md:px-6 bg-[#0f172a] text-white relative overflow-hidden">
         {/* Background Effect */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-orange-600/20 to-orange-900/20 opacity-30 blur-[100px]"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px]"></div>
         </div>

         <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-20">
                <div className="flex-1 space-y-4 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-yellow-400 font-bold text-xs md:text-sm backdrop-blur-md animate-in fade-in slide-in-from-left-4">
                        <Crown size={16} className="md:w-4 md:h-4" /> সিজন ১ র‍্যাঙ্কিং
                    </div>
                    <h2 className="text-3xl md:text-6xl font-extrabold tracking-tight">
                        সেরাদের তালিকায়<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-600">তুমি কোথায়?</span>
                    </h2>
                    <p className="text-slate-400 text-sm md:text-lg leading-relaxed max-w-xl">
                        শুধুমাত্র পড়াশোনা নয়, শেখাটাকে আমরা করেছি গেমের মতো মজাদার। কুইজ দিয়ে পয়েন্ট অর্জন করো, লেভেল আপ করো এবং ব্রোঞ্জ থেকে লিজেন্ড লিগে প্রমোশন নাও।
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <button onClick={onLoginClick} className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-6 md:px-8 py-3 md:py-3.5 rounded-2xl font-bold hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all hover:scale-105 active:scale-95 text-sm md:text-base flex items-center gap-2">
                            <Trophy size={18}/> লিডারবোর্ড দেখুন
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 relative w-full flex justify-center pt-6 md:pt-0">
                    {/* Modern Glass Podium */}
                    <div className="relative z-10 grid grid-cols-3 gap-2 md:gap-4 items-end max-w-md w-full text-center">
                        {/* Silver - Left (Sadia) */}
                        <div className="flex flex-col items-center transform translate-y-4 md:translate-y-8 animate-in slide-in-from-bottom-8 duration-700 delay-100">
                            <div className="relative mb-2 group">
                                <div className="w-14 h-14 md:w-20 md:h-20 rounded-full p-1 bg-gradient-to-br from-slate-300 to-slate-500 shadow-[0_0_20px_rgba(148,163,184,0.3)] relative z-10 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                                    <div className="w-full h-full rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-slate-200 font-bold text-xl md:text-3xl">S</div>
                                </div>
                                <div className="absolute -bottom-2 md:-bottom-3 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-200 text-[10px] md:text-xs font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full shadow-lg border border-slate-600 flex items-center gap-1">
                                    <span className="text-slate-400">#</span>2
                                </div>
                            </div>
                            <div className="mb-2">
                                <p className="text-[10px] md:text-xs font-bold text-slate-200">Sadia Afrin</p>
                                <p className="text-[8px] md:text-[10px] text-slate-400">Viqarunnisa Noon</p>
                            </div>
                            <div className="w-full h-24 md:h-32 bg-gradient-to-t from-slate-800/80 to-slate-700/30 rounded-t-2xl border-t border-slate-500/30 backdrop-blur-xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-slate-400/5 group-hover:bg-slate-400/10 transition-colors"></div>
                            </div>
                        </div>

                        {/* Gold - Center (Tahmid) */}
                        <div className="flex flex-col items-center z-20 -mt-6 md:mt-0 animate-in slide-in-from-bottom-8 duration-700">
                            <div className="mb-2 relative group">
                                <Crown size={32} className="text-yellow-400 animate-bounce absolute -top-8 md:-top-14 left-1/2 -translate-x-1/2 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] md:w-12 md:h-12" fill="currentColor" />
                                <div className="w-16 h-16 md:w-24 md:h-24 rounded-full p-1 bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 shadow-[0_0_30px_rgba(234,179,8,0.4)] relative z-10 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                                    <div className="w-full h-full rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-yellow-500 font-bold text-2xl md:text-4xl">T</div>
                                </div>
                                <div className="absolute -bottom-2 md:-bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-yellow-950 text-xs md:text-sm font-bold px-3 md:px-4 py-0.5 md:py-1 rounded-full shadow-lg border border-yellow-400 flex items-center gap-1">
                                    <span className="text-yellow-800/70">#</span>1
                                </div>
                            </div>
                            <div className="mb-2">
                                <p className="text-xs md:text-sm font-bold text-yellow-100">Tahmid Khan</p>
                                <p className="text-[9px] md:text-[10px] text-yellow-500/80">Notre Dame College</p>
                            </div>
                            <div className="w-full h-36 md:h-48 bg-gradient-to-t from-yellow-900/40 to-yellow-600/10 rounded-t-2xl border-t border-yellow-500/30 backdrop-blur-xl relative overflow-hidden shadow-[0_-10px_40px_-15px_rgba(234,179,8,0.2)] group">
                                <div className="absolute inset-0 bg-yellow-400/5 group-hover:bg-yellow-400/10 transition-colors"></div>
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                                    <Trophy size={32} className="text-yellow-500/20 group-hover:text-yellow-500/40 transition-colors md:w-10 md:h-10" />
                                </div>
                            </div>
                        </div>

                        {/* Bronze - Right (Rafi) */}
                        <div className="flex flex-col items-center transform translate-y-6 md:translate-y-12 animate-in slide-in-from-bottom-8 duration-700 delay-200">
                            <div className="relative mb-2 group">
                                <div className="w-14 h-14 md:w-20 md:h-20 rounded-full p-1 bg-gradient-to-br from-amber-600 to-amber-800 shadow-[0_0_20px_rgba(180,83,9,0.3)] relative z-10 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                                    <div className="w-full h-full rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-amber-500 font-bold text-xl md:text-3xl">R</div>
                                </div>
                                <div className="absolute -bottom-2 md:-bottom-3 left-1/2 -translate-x-1/2 bg-amber-900 text-amber-100 text-[10px] md:text-xs font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full shadow-lg border border-amber-700 flex items-center gap-1">
                                    <span className="text-amber-400/70">#</span>3
                                </div>
                            </div>
                            <div className="mb-2">
                                <p className="text-[10px] md:text-xs font-bold text-amber-100">Rafi Ahmed</p>
                                <p className="text-[8px] md:text-[10px] text-amber-500/80">Dhaka College</p>
                            </div>
                            <div className="w-full h-16 md:h-24 bg-gradient-to-t from-amber-900/60 to-amber-800/20 rounded-t-2xl border-t border-amber-600/30 backdrop-blur-xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-amber-600/5 group-hover:bg-amber-600/10 transition-colors"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
         </div>
      </section>

      {/* Question Bank Section (Revised with Marquee) */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-white dark:bg-gray-900 overflow-hidden">
         <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 md:mb-14">
               <div className="space-y-3 w-full md:w-auto">
                  <div className="flex items-center gap-2 text-primary font-bold tracking-wider uppercase text-xs md:text-sm">
                      <Archive size={14} className="md:w-4 md:h-4"/> ফ্রি এক্সেস
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                      আনলিমিটেড <br className="md:hidden"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">প্রশ্নব্যাংক সলভ</span>
                  </h2>
                  <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed">
                      টাকা খরচ করে মডেল টেস্ট নয়। পরীক্ষাঙ্গনে মেডিকেল, ইঞ্জিনিয়ারিং ও ভার্সিটির বিগত বছরের সকল প্রশ্ন সলভ করো সম্পূর্ণ ফ্রিতে।
                  </p>
               </div>
               <button onClick={onLoginClick} className="text-gray-900 dark:text-white font-bold hover:text-primary mt-6 md:mt-0 flex items-center gap-2 group border-b-2 border-gray-200 dark:border-gray-700 hover:border-primary transition-all text-sm md:text-base pb-1">
                  প্রশ্ন ব্যাংক এক্সপ্লোর করুন <ArrowRight size={16} className="md:w-[18px] md:h-[18px] group-hover:translate-x-1 transition-transform"/>
               </button>
            </div>

            {/* NEW: Auto-scrolling Question Papers */}
            <QuestionPaperMarquee />
            
         </div>
      </section>

      {/* Additional Features Section */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-gray-50 dark:bg-gray-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">সব ফিচার এক নজরে</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">পরীক্ষাঙ্গন শুধুমাত্র একটি অ্যাপ নয়, এটি তোমার প্রস্তুতির পূর্ণাঙ্গ ডিজিটাল পার্টনার।</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: <Clock className="text-blue-500" />, title: "স্মার্ট স্টাডি প্ল্যানার", desc: "তোমার সময় অনুযায়ী অটোমেটিক রুটিন তৈরি করে দেবে আমাদের সিস্টেম।" },
              { icon: <Archive className="text-red-500" />, title: "ভুল সেভ রাখা", desc: "পরীক্ষায় করা ভুলগুলো আলাদাভাবে সেভ থাকবে যাতে পরে রিভিশন দিতে পারো।" },
              { icon: <RotateCcw className="text-green-500" />, title: "আনলিমিটেড রিটেক", desc: "যেকোনো পরীক্ষা যতবার খুশি ততবার দিয়ে নিজেকে শুধরে নেওয়ার সুযোগ।" },
              { icon: <Bookmark className="text-purple-500" />, title: "কোশ্চেন সেভ ব্যবস্থা", desc: "গুরুত্বপূর্ণ প্রশ্নগুলো বুকমার্ক করে রাখো এবং যেকোনো সময় প্র্যাকটিস করো।" },
              { icon: <Swords className="text-orange-500" />, title: "লাইভ কুইজ ব্যাটল", desc: "বন্ধুদের সাথে রিয়েল-টাইম লড়াইয়ে মেতে ওঠো এবং নিজের মেধা যাচাই করো।" },
              { icon: <Activity className="text-cyan-500" />, title: "স্মার্ট প্রোগ্রেস ট্র্যাকিং", desc: "গ্রাফ এবং চার্টের মাধ্যমে তোমার উন্নতির গ্রাফ দেখো প্রতিদিন।" }
            ].map((feature, i) => (
              <div key={i} className="p-6 md:p-8 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">সাধারণ জিজ্ঞাসা (FAQ)</h2>
            <p className="text-gray-500 dark:text-gray-400">পরীক্ষাঙ্গন সম্পর্কে আপনার মনে থাকা কিছু প্রশ্নের উত্তর।</p>
          </div>
          
          <div className="space-y-4">
            {[
              { q: "পরীক্ষাঙ্গন কি সবার জন্য ফ্রি?", a: "হ্যাঁ, আমাদের অনেক ফিচার সবার জন্য উন্মুক্ত। তবে বিশেষ কিছু প্রিমিয়াম ফিচারের জন্য সাবস্ক্রিপশন প্রয়োজন হতে পারে।" },
              { q: "এখানে কি কি বিষয়ের প্রস্তুতি নেওয়া যায়?", a: "এখানে বিজ্ঞান বিভাগের সকল বিষয়সহ HSC একাডেমিক এবং এডমিশন প্রস্তুতির সব রিসোর্স রয়েছে।" },
              { q: "AI টিউটর কিভাবে কাজ করে?", a: "যেকোনো প্রশ্নের ছবি তুলে বা টেক্সট লিখে পাঠালে আমাদের AI টিউটর মুহূর্তেই তার ব্যাখ্যাসহ সমাধান দিয়ে দেয়।" },
              { q: "কুইজ ব্যাটল কি?", a: "কুইজ ব্যাটল হলো একটি রিয়েল-টাইম মাল্টিপ্লেয়ার গেম যেখানে আপনি অন্য শিক্ষার্থীদের সাথে সরাসরি প্রতিযোগিতায় অংশ নিতে পারেন।" }
            ].map((faq, i) => (
              <details key={i} className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-gray-900 dark:text-white list-none">
                  {faq.q}
                  <span className="transition-transform group-open:rotate-180">
                    <ChevronDown size={20} />
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-500 dark:text-gray-400 text-sm md:text-base leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20 px-4 md:px-6">
         <div className="max-w-5xl mx-auto bg-gradient-to-r from-primary to-orange-800 rounded-[2rem] md:rounded-[3rem] p-8 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-orange-500/20">
            {/* Abstract Shapes */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
               <h2 className="text-3xl md:text-6xl font-extrabold mb-4 md:mb-6 tracking-tight">দেরি করছো কেন?</h2>
               <p className="text-base md:text-xl text-orange-100 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
                  হাজারো শিক্ষার্থী ইতিমধ্যে তাদের প্রস্তুতি শুরু করে দিয়েছে। তুমি কি পিছিয়ে থাকবে? আজই জয়েন করো পরীক্ষাঙ্গন পরিবারে।
               </p>
               <button 
                 onClick={onLoginClick}
                 className="bg-white text-primary px-8 py-3.5 md:px-10 md:py-4 rounded-xl md:rounded-2xl font-bold text-lg md:text-xl hover:bg-orange-50 hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-2 md:gap-3 mx-auto w-full sm:w-auto"
               >
                 <Rocket size={20} className="md:w-6 md:h-6" /> একাউন্ট তৈরি করুন
               </button>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-8 md:py-12 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-center">
        <div className="flex items-center justify-center mb-4 md:mb-6 opacity-80 gap-1.5">
           <img src="./Pshape.svg" alt="Porikkhangon - HSC & Admission Preparation Logo" className="h-10 md:h-12 w-auto object-contain logo-dark-mode" />
           <img src="./letterlogo.svg" alt="Porikkhangon Typography" className="h-6 md:h-7 w-auto object-contain logo-dark-mode" />
        </div>
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-6 md:mb-8 text-sm text-gray-500">
            <a href="#" className="hover:text-primary transition-colors">আমাদের সম্পর্কে</a>
            <a href="#" className="hover:text-primary transition-colors">কোর্সসমূহ</a>
            <a href="#" className="hover:text-primary transition-colors">যোগাযোগ</a>
            <a href="#" className="hover:text-primary transition-colors">প্রাইভেসি পলিসি</a>
        </div>
        <p className="text-gray-400 text-xs md:text-sm">© 2024 Porikkhangon. Made with ❤️ for Students in Bangladesh.</p>
      </footer>
    </main>
  );
};

export default LandingPage;
