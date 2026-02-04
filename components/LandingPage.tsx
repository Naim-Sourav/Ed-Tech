
import React, { useState, useEffect } from 'react';
import { Bot, Brain, PieChart, Sparkles, GraduationCap, ArrowRight, CheckCircle2, Trophy, Swords, Zap, Users, Crown, Rocket, Star, ShieldCheck, Play, Activity, BookOpen, FileCheck, Clock, Archive, Database, FileText, Medal, TrendingUp } from 'lucide-react';

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

const TypewriterText = () => {
  const words = ["মেডিকেল", "ইঞ্জিনিয়ারিং", "ভার্সিটি 'ক'", "HSC একাডেমিক"];
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [blink, setBlink] = useState(true);
  const [reverse, setReverse] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setBlink(!blink), 500);
    return () => clearTimeout(timeout);
  }, [blink]);

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !reverse) {
      setTimeout(() => setReverse(true), 1000);
      return;
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, reverse ? 75 : 150);

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, words]);

  return (
    <span className="text-primary dark:text-blue-400">
      {words[index].substring(0, subIndex)}
      <span className={`${blink ? 'opacity-100' : 'opacity-0'} transition-opacity`}>|</span>
    </span>
  );
};

// --- ICONS ---
const Beaker = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 3h15"/><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3"/><path d="M6 14h12"/></svg>;
const Calculator = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>;
const Dna = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/><path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/><path d="M17 6l-2.5-2.5"/><path d="M14 8l-1-1"/><path d="M7 18l2.5 2.5"/><path d="M3.5 14.5l1-1"/><path d="M20 9l2.5 2.5"/><path d="M14.5 16.5l1-1"/><path d="M10 2l-2.5 2.5"/><path d="M3 8l1-1"/><path d="M9 20l1-1"/><path d="M17 18l-2.5 2.5"/><path d="M7.5 10.5l-1-1"/></svg>;
const Leaf = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 13-11 19Z"/><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 13-11 19Z"/></svg>;

// --- MAIN COMPONENT ---

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  return (
    <div className="h-screen w-full overflow-y-auto bg-white dark:bg-gray-900 font-sans text-gray-900 dark:text-white transition-colors scroll-smooth selection:bg-primary/30">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          
          {/* Left Side - Brand Logo */}
          <div className="flex items-center gap-2 md:gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="relative">
                  <div className="absolute inset-0 bg-primary/40 rounded-full blur-md group-hover:blur-lg transition-all"></div>
                  <div className="h-8 w-8 md:h-10 md:w-10 bg-gradient-to-br from-primary to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl relative z-10 shadow-inner border-2 border-white">
                   ধ্রু
                  </div>
              </div>
              <span className="text-lg md:text-xl font-bold tracking-tight block group-hover:text-primary transition-colors">ধ্রুবক</span>
          </div>

          {/* Right Side - Buttons */}
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={onLoginClick}
              className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 hidden sm:block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              লগইন
            </button>
            <button 
              onClick={onLoginClick}
              className="px-4 py-2 md:px-6 md:py-2.5 bg-primary hover:bg-blue-800 text-white font-bold text-sm md:text-base rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center gap-2 group border border-transparent hover:border-blue-400/30"
            >
              রেজিস্ট্রেশন <ArrowRight size={16} className="md:w-[18px] md:h-[18px] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-24 md:pb-32 px-4 md:px-6 overflow-hidden">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white dark:from-gray-900 to-transparent pointer-events-none"></div>
        
        {/* Moving Blobs */}
        <div className="absolute top-20 left-10 w-48 h-48 md:w-72 md:h-72 bg-blue-500/20 rounded-full blur-[80px] md:blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 md:w-96 md:h-96 bg-cyan-500/10 rounded-full blur-[100px] md:blur-[120px] animate-pulse delay-1000"></div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-primary dark:text-blue-400 font-bold text-[10px] md:text-sm mb-6 md:mb-8 border border-blue-200 dark:border-blue-800 animate-in fade-in slide-in-from-bottom-4 duration-700 hover:scale-105 transition-transform cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            তোমার প্রস্তুতির ধ্রুবক
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 md:mb-8 leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 text-gray-900 dark:text-white">
            স্বপ্ন এখন হাতের মুঠোয়<br/>
            <span className="block mt-2">প্রস্তুতি হোক <TypewriterText /></span>
          </h1>
          
          <p className="text-base md:text-xl text-gray-600 dark:text-gray-300 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 px-4">
            'ধ্রুবক' AI টিউটর, রিয়েল-টাইম কুইজ ব্যাটল এবং স্মার্ট প্রোগ্রেস ট্র্যাকিং এর সাথে নিজেকে প্রস্তুত করো বুয়েট, মেডিকেল বা ঢাকা ভার্সিটির জন্য।
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300 w-full sm:w-auto px-4">
            <button 
              onClick={onLoginClick}
              className="w-full sm:w-auto px-6 py-3.5 md:px-8 md:py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl md:rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg shadow-xl shadow-gray-500/20"
            >
              <Zap size={20} className="fill-yellow-400 text-yellow-400 md:w-[22px] md:h-[22px]" /> বিনামূল্যে শুরু করুন
            </button>
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-6 py-3.5 md:px-8 md:py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 font-bold rounded-xl md:rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2 group"
            >
              <Play size={18} className="group-hover:text-primary transition-colors md:w-5 md:h-5" /> ডেমো দেখুন
            </button>
          </div>

          {/* Animated Stats - REPLACED WITH CAPABILITIES */}
          <div className="mt-12 md:mt-20 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm max-w-4xl mx-auto animate-in fade-in zoom-in duration-1000 delay-500">
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
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white">কেন <span className="text-primary dark:text-blue-400">ধ্রুবক</span>?</h2>
                <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    ভর্তি যুদ্ধের এই কঠিন সময়ে প্রয়োজন একজন নির্ভরযোগ্য গাইড। ধ্রুবক তোমাকে দিচ্ছে পার্সোনালাইজড কেয়ার, কম্পিটিটিভ এনভায়রনমেন্ট এবং লেটেস্ট টেকনোলজি—যা তোমাকে অন্যদের চেয়ে এক ধাপ এগিয়ে রাখবে।
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 gap-4 md:gap-6 md:grid-rows-2 h-auto md:h-[600px]">
                
                {/* Feature 1: Live Exam (Big Card - Focus) - UPDATED TO MATCH HOME PAGE */}
                <div className="md:col-span-4 row-span-2 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 text-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group min-h-[400px] cursor-pointer" onClick={onLoginClick}>
                    {/* Abstract Background Elements from HomeDashboard */}
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px] -mr-20 -mt-20 group-hover:bg-primary/30 transition-all duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-cyan-500/10 rounded-full blur-[80px] -ml-10 -mb-10"></div>

                    <div className="relative z-10 h-full flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-4 max-w-lg flex-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-blue-300 backdrop-blur-md">
                                <Sparkles size={12} /> ডেইলি চ্যালেঞ্জ
                            </div>
                            <h3 className="text-3xl md:text-5xl font-bold leading-tight">
                                নিজেকে যাচাই করো <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">লাইভ কুইজ</span> দিয়ে
                            </h3>
                            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                                প্রতিদিন নতুন নতুন টপিকের উপর মডেল টেস্ট দাও এবং তোমার অবস্থান যাচাই করো। ভুলগুলো থেকে শেখো।
                            </p>
                            <button className="mt-4 bg-primary hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20 group-hover:scale-105 active:scale-95 w-fit">
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

                {/* Feature 2: Ostad AI (Medium) */}
                <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group cursor-pointer relative overflow-hidden min-h-[200px]" onClick={onLoginClick}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-all"></div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4">
                        <Bot size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Synapse AI টিউটর</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">
                        ২৪/৭ পার্সোনাল টিউটর। যেকোনো কঠিন টপিক বা ম্যাথ ছবি তুলে পাঠাও, মুহূর্তেই সমাধান বুঝে নাও।
                    </p>
                </div>

                {/* Feature 3: Quiz Battle (Medium) */}
                <div className="md:col-span-2 bg-gradient-to-br from-secondary to-cyan-600 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-white shadow-lg hover:shadow-cyan-500/30 hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden group min-h-[200px]" onClick={onLoginClick}>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4 md:mb-6">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-md rounded-xl md:rounded-2xl flex items-center justify-center">
                                <Swords size={20} className="md:w-7 md:h-7 text-white" />
                            </div>
                            <span className="bg-white/20 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold backdrop-blur-sm animate-pulse">MULTIPLAYER</span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">কুইজ ব্যাটল</h3>
                        <p className="text-blue-100 text-xs md:text-sm mb-2 md:mb-4">বন্ধুদের চ্যালেঞ্জ করো এবং লাইভ ১ বনাম ১ কুইজ খেলে পয়েন্ট জিতো।</p>
                    </div>
                    <div className="absolute -bottom-6 -right-6 text-white/10 transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
                        <Swords size={80} className="md:w-[120px] md:h-[120px]" />
                    </div>
                </div>

            </div>
        </div>
      </section>

      {/* Gamification Section */}
      <section className="py-10 md:py-24 px-4 md:px-6 bg-[#0f172a] text-white relative overflow-hidden">
         {/* Background Effect */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-blue-600/20 to-purple-900/20 opacity-30 blur-[100px]"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]"></div>
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
                                <div className="w-14 h-14 md:w-20 md:h-20 rounded-full p-1 bg-gradient-to-br from-slate-300 to-slate-500 shadow-[0_0_20px_rgba(148,163,184,0.3)] relative z-10 group-hover:scale-105 transition-transform duration-300">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sadia&mouth=smile&eyebrows=default" className="w-full h-full object-cover rounded-full border-2 border-slate-900 bg-slate-800" alt="Sadia" />
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
                                <div className="w-16 h-16 md:w-24 md:h-24 rounded-full p-1 bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 shadow-[0_0_30px_rgba(234,179,8,0.4)] relative z-10 group-hover:scale-105 transition-transform duration-300">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Tahmid&mouth=smile&eyebrows=default" className="w-full h-full object-cover rounded-full border-2 border-slate-900 bg-slate-800" alt="Tahmid" />
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
                                <div className="w-14 h-14 md:w-20 md:h-20 rounded-full p-1 bg-gradient-to-br from-amber-600 to-amber-800 shadow-[0_0_20px_rgba(180,83,9,0.3)] relative z-10 group-hover:scale-105 transition-transform duration-300">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rafi&mouth=smile&eyebrows=default" className="w-full h-full object-cover rounded-full border-2 border-slate-900 bg-slate-800" alt="Rafi" />
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
                      আনলিমিটেড <br className="md:hidden"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">প্রশ্নব্যাংক সলভ</span>
                  </h2>
                  <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed">
                      টাকা খরচ করে মডেল টেস্ট নয়। ধ্রুবক-এ মেডিকেল, ইঞ্জিনিয়ারিং ও ভার্সিটির বিগত বছরের সকল প্রশ্ন সলভ করো সম্পূর্ণ ফ্রিতে।
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

      {/* Final CTA */}
      <section className="py-16 md:py-20 px-4 md:px-6">
         <div className="max-w-5xl mx-auto bg-gradient-to-r from-primary to-blue-800 rounded-[2rem] md:rounded-[3rem] p-8 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
            {/* Abstract Shapes */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
               <h2 className="text-3xl md:text-6xl font-extrabold mb-4 md:mb-6 tracking-tight">দেরি করছো কেন?</h2>
               <p className="text-base md:text-xl text-blue-100 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
                  হাজারো শিক্ষার্থী ইতিমধ্যে তাদের প্রস্তুতি শুরু করে দিয়েছে। তুমি কি পিছিয়ে থাকবে? আজই জয়েন করো ধ্রুবক পরিবারে।
               </p>
               <button 
                 onClick={onLoginClick}
                 className="bg-white text-primary px-8 py-3.5 md:px-10 md:py-4 rounded-xl md:rounded-2xl font-bold text-lg md:text-xl hover:bg-blue-50 hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-2 md:gap-3 mx-auto w-full sm:w-auto"
               >
                 <Rocket size={20} className="md:w-6 md:h-6" /> একাউন্ট তৈরি করুন
               </button>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-8 md:py-12 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-center">
        <div className="flex items-center justify-center gap-2 mb-4 md:mb-6 opacity-80">
           <div className="h-7 w-7 md:h-8 md:w-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-sm md:text-base">
             ধ্রু
           </div>
           <span className="font-bold text-lg md:text-xl text-gray-800 dark:text-white">ধ্রুবক</span>
        </div>
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-6 md:mb-8 text-sm text-gray-500">
            <a href="#" className="hover:text-primary transition-colors">আমাদের সম্পর্কে</a>
            <a href="#" className="hover:text-primary transition-colors">কোর্সসমূহ</a>
            <a href="#" className="hover:text-primary transition-colors">যোগাযোগ</a>
            <a href="#" className="hover:text-primary transition-colors">প্রাইভেসি পলিসি</a>
        </div>
        <p className="text-gray-400 text-xs md:text-sm">© 2024 Dhrubok. Made with ❤️ for Students in Bangladesh.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
