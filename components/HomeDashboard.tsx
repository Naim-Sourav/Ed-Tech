
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Bot, Brain, Search, PieChart, Swords, Library, 
  FileCheck, Sparkles, Trophy, Flame, Target, Zap, Clock, 
  ChevronRight, Star, TrendingUp, Activity, Archive
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserStatsAPI, fetchLeaderboardAPI } from '../services/api';

interface HomeDashboardProps {
  openSynapse: () => void;
}

const HomeDashboard: React.FC<HomeDashboardProps> = ({ openSynapse }) => {
  const navigate = useNavigate();
  const { currentUser, userAvatar } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [lastExam, setLastExam] = useState<any>(null);

  const loadData = async () => {
      if (currentUser) {
        // Fetch User Stats
        try {
            const data = await fetchUserStatsAPI(currentUser.uid);
            setStats(data);
        } catch (e) { console.error("Stats error", e); }

        // Fetch Leaderboard for Rank
        try {
            const leaderboard = await fetchLeaderboardAPI();
            const userRank = leaderboard.findIndex(u => u.uid === currentUser.uid);
            if (userRank !== -1) {
                setRank(userRank + 1);
            }
        } catch (e) { console.error("Leaderboard error", e); }

        // Fetch Last Exam from LocalStorage
        try {
            const savedLastExam = localStorage.getItem('dopamine_last_exam');
            if (savedLastExam) {
                setLastExam(JSON.parse(savedLastExam));
            }
        } catch (e) { console.error("Last exam load error", e); }
      }
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('শুভ সকাল');
    else if (hour < 17) setGreeting('শুভ দুপুর');
    else setGreeting('শুভ সন্ধ্যা');

    loadData();
  }, [currentUser]);
  
  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors pb-24 md:pb-8">
      {/* Top Decoration */}
      <div className="absolute top-0 left-0 w-full h-48 md:h-64 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>

      <div className="max-w-6xl mx-auto p-4 md:p-8 relative z-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {greeting}, <span className="text-primary dark:text-green-400">{currentUser?.displayName?.split(' ')[0]}</span> <span className="text-lg md:text-xl">👋</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-1">আজকের প্রস্তুতি শুরু হোক একটি পরীক্ষা দিয়ে!</p>
          </div>
          
          {/* Quick Profile Stats */}
          <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-2 md:gap-3 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
             <div className="flex-1 md:flex-none px-3 md:px-4 py-1 md:py-2 border-r border-gray-100 dark:border-gray-700 text-center md:text-left">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Rank</p>
                <p className="font-bold text-gray-800 dark:text-white flex items-center justify-center md:justify-start gap-1 text-sm md:text-base">
                   <Trophy size={14} className="text-yellow-500" /> #{rank || '--'}
                </p>
             </div>
             <div className="flex-1 md:flex-none px-3 md:px-4 py-1 md:py-2 text-center md:text-left">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Points</p>
                <p className="font-bold text-gray-800 dark:text-white flex items-center justify-center md:justify-start gap-1 text-sm md:text-base">
                   <Zap size={14} className="text-orange-500" /> {stats?.points || 0}
                </p>
             </div>
             <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl overflow-hidden border-2 border-primary/20 shrink-0">
                <img src={userAvatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt="Profile" className="w-full h-full object-cover" />
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="lg:col-span-2">
                {/* Main Hero: Exam Focus */}
                <section 
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 text-white p-5 md:p-10 shadow-xl group cursor-pointer" 
                    onClick={() => navigate('/quiz')}
                >
                    {/* Abstract Background Elements */}
                    <div className="absolute top-0 right-0 w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-primary/20 rounded-full blur-[80px] md:blur-[100px] -mr-10 -mt-10 group-hover:bg-primary/30 transition-all duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-[150px] md:w-[200px] h-[150px] md:h-[200px] bg-blue-500/10 rounded-full blur-[60px] md:blur-[80px] -ml-5 -mb-5"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                        <div className="space-y-3 md:space-y-4 max-w-lg text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] md:text-xs font-bold text-green-300 backdrop-blur-md">
                                <Sparkles size={12} /> ডেইলি চ্যালেঞ্জ
                            </div>
                            <h2 className="text-2xl md:text-5xl font-bold leading-tight">
                                নিজেকে যাচাই করো <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">লাইভ কুইজ</span> দিয়ে
                            </h2>
                            <p className="text-gray-400 text-xs md:text-base leading-relaxed hidden md:block">
                                প্রতিদিন নতুন নতুন টপিকের উপর মডেল টেস্ট দাও এবং তোমার অবস্থান যাচাই করো। ভুলগুলো থেকে শেখো।
                            </p>
                            <p className="text-gray-400 text-xs leading-relaxed md:hidden">
                                প্রতিদিন মডেল টেস্ট দিয়ে নিজের অবস্থান যাচাই করো।
                            </p>
                            <button className="mt-2 md:mt-4 bg-primary hover:bg-green-600 text-white px-6 py-3 md:px-8 md:py-3.5 rounded-xl font-bold flex items-center justify-center md:justify-start gap-2 transition-all shadow-lg shadow-green-900/20 group-hover:scale-105 active:scale-95 text-sm md:text-base w-full md:w-auto">
                                পরীক্ষা শুরু করুন <ArrowRight size={18} />
                            </button>
                        </div>

                        {/* Visual Element */}
                        <div className="relative w-full md:w-auto flex justify-center hidden sm:flex">
                            <div className="relative w-56 md:w-64 h-40 md:h-48 bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 transform rotate-3 group-hover:rotate-6 transition-transform duration-500 shadow-2xl">
                                <div className="absolute -top-3 -right-3 w-8 h-8 md:w-10 md:h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-[10px] md:text-xs shadow-lg animate-bounce">Live</div>
                                <div className="h-full flex flex-col justify-between">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary"><Clock size={18}/></div>
                                    <div>
                                        <p className="text-xs md:text-sm font-bold text-white">Physics Quiz</p>
                                        <p className="text-[9px] md:text-[10px] text-gray-400">Time: 20 Mins</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-1.5 md:h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary w-[70%]"></div>
                                    </div>
                                    <div className="flex justify-between text-[9px] md:text-[10px] text-gray-400">
                                        <span>Progress</span>
                                        <span>1500+ Participants</span>
                                    </div>
                                </div>
                                <button className="w-full py-1.5 md:py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] md:text-xs font-bold transition-colors text-white">
                                    Join Now
                                </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Daily Goal / Challenge Banner */}
            <div className="lg:col-span-1">
                <div 
                    onClick={() => navigate('/challenges')}
                    className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-3xl p-5 md:p-6 border border-yellow-200 dark:border-yellow-800/30 cursor-pointer hover:shadow-lg transition-all group relative overflow-hidden h-full flex flex-col justify-between"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap size={80} className="text-yellow-600" fill="currentColor"/>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-2 text-sm md:text-base">
                            <Target size={18} className="text-red-500"/> ডেইলি গোল
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                            আজকের ৫টি চ্যালেঞ্জ সম্পন্ন করে জিতে নাও বোনাস পয়েন্ট!
                        </p>
                    </div>
                    <div>
                        <div className="w-full bg-white dark:bg-gray-700 h-2 rounded-full overflow-hidden mb-3 border border-yellow-100 dark:border-transparent">
                            <div 
                                className="bg-yellow-500 h-full rounded-full transition-all duration-1000" 
                                style={{ width: `${stats?.quests ? (stats.quests.filter((q:any) => q.claimed).length / 5) * 100 : 0}%` }}
                            ></div>
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold text-yellow-700 dark:text-yellow-500">
                            <span>{stats?.quests?.filter((q:any) => q.claimed).length || 0} / 5 Completed</span>
                            <span className="flex items-center gap-1 group-hover:gap-2 transition-all">View All <ArrowRight size={12}/></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
           {/* Question Bank */}
           <div 
             onClick={() => navigate('/qbank')}
             className="col-span-1 md:col-span-2 bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all group cursor-pointer relative overflow-hidden active:scale-95 duration-200"
           >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
                 <Archive size={60} />
              </div>
              <div className="relative z-10">
                 <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 group-hover:rotate-12 transition-transform">
                    <Archive size={20} className="md:w-6 md:h-6" />
                 </div>
                 <h3 className="text-sm md:text-xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">প্রশ্ন ব্যাংক</h3>
                 <p className="text-[10px] md:text-sm text-gray-500 dark:text-gray-400 mb-3 md:mb-6 max-w-xs line-clamp-2 md:line-clamp-none">
                    বিগত বছরের প্রশ্ন সমাধান করো।
                 </p>
                 <div className="flex items-center gap-2 text-[10px] md:text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:gap-3 transition-all">
                    অনুশীলন করুন <ChevronRight size={14} className="md:w-4 md:h-4" />
                 </div>
              </div>
           </div>

           {/* Model Test Pack */}
           <div 
             onClick={() => navigate('/exams')}
             className="col-span-1 md:col-span-2 bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all group cursor-pointer relative overflow-hidden active:scale-95 duration-200"
           >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
                 <FileCheck size={60} />
              </div>
              <div className="relative z-10">
                 <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 group-hover:rotate-12 transition-transform">
                    <Library size={20} className="md:w-6 md:h-6" />
                 </div>
                 <h3 className="text-sm md:text-xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">মডেল টেস্ট</h3>
                 <p className="text-[10px] md:text-sm text-gray-500 dark:text-gray-400 mb-3 md:mb-6 max-w-xs line-clamp-2 md:line-clamp-none">
                    শেষ মুহূর্তের প্রস্তুতির জন্য পূর্ণাঙ্গ মডেল টেস্ট।
                 </p>
                 <div className="flex items-center gap-2 text-[10px] md:text-sm font-bold text-purple-600 dark:text-purple-400 group-hover:gap-3 transition-all">
                    প্যাক কিনুন <ChevronRight size={14} className="md:w-4 md:h-4" />
                 </div>
              </div>
           </div>

           {/* Battle Mode */}
           <div 
             onClick={() => navigate('/battle')}
             className="col-span-2 md:col-span-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl md:rounded-3xl p-4 md:p-6 text-white shadow-lg hover:shadow-orange-500/30 hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden group active:scale-95 duration-200"
           >
              <div className="absolute -bottom-4 -right-4 text-white/10 transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
                 <Swords size={80} className="md:w-[100px] md:h-[100px]" />
              </div>
              <div className="relative z-10 flex flex-row items-center justify-between">
                 <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-white/20 px-2 py-0.5 rounded text-[8px] md:text-[10px] font-bold">MULTIPLAYER</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold mb-1">কুইজ ব্যাটল</h3>
                    <p className="text-orange-100 text-xs md:text-sm opacity-90 mb-3 md:mb-4">বন্ধুদের সাথে লাইভ যুদ্ধ!</p>
                    <button className="bg-white text-orange-600 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold hover:bg-orange-50 transition-colors">
                        চ্যালেঞ্জ জানাও
                    </button>
                 </div>
                 <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl md:rounded-2xl">
                    <Swords size={24} className="text-white md:w-8 md:h-8" />
                 </div>
              </div>
           </div>

           {/* Leaderboard */}
           <div 
             onClick={() => navigate('/leaderboard')}
             className="col-span-1 bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl p-4 md:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:border-yellow-400 transition-all cursor-pointer group active:scale-95 duration-200 flex flex-col justify-between"
           >
              <div className="flex justify-between items-start mb-2">
                 <div className="p-2 md:p-2.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg md:rounded-xl">
                    <Trophy size={18} className="md:w-5 md:h-5" />
                 </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white text-xs md:text-sm mb-0.5">লিডারবোর্ড</h3>
                <p className="text-[9px] md:text-[10px] text-gray-500 dark:text-gray-400">র‍্যাংক চেক করো</p>
              </div>
           </div>

           {/* Study Tracker */}
           <div 
             onClick={() => navigate('/tracker')}
             className="col-span-1 bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl p-4 md:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:border-blue-400 transition-all cursor-pointer group active:scale-95 duration-200 flex flex-col justify-between"
           >
              <div className="flex justify-between items-start mb-2">
                 <div className="p-2 md:p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg md:rounded-xl">
                    <PieChart size={18} className="md:w-5 md:h-5" />
                 </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white text-xs md:text-sm mb-0.5">প্রোগ্রেস</h3>
                <p className="text-[9px] md:text-[10px] text-gray-500 dark:text-gray-400">রুটিন ও পরিসংখ্যান</p>
              </div>
           </div>

           {/* Admission Info */}
           <div 
             onClick={() => navigate('/admission')}
             className="col-span-1 bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl p-4 md:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:border-cyan-400 transition-all cursor-pointer group active:scale-95 duration-200 flex flex-col justify-between"
           >
              <div className="flex justify-between items-start mb-2">
                 <div className="p-2 md:p-2.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-lg md:rounded-xl">
                    <Search size={18} className="md:w-5 md:h-5" />
                 </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white text-xs md:text-sm mb-0.5">ভর্তি তথ্য</h3>
                <p className="text-[9px] md:text-[10px] text-gray-500 dark:text-gray-400">সার্কুলার ও ডেডলাইন</p>
              </div>
           </div>

           {/* AI Tutor */}
           <div 
             onClick={openSynapse}
             className="col-span-1 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl md:rounded-3xl p-4 md:p-5 text-white shadow-md hover:shadow-lg transition-all cursor-pointer group active:scale-95 duration-200 flex flex-col justify-between"
           >
              <div className="flex justify-between items-start mb-2">
                 <div className="p-2 md:p-2.5 bg-white/20 rounded-lg md:rounded-xl backdrop-blur-md">
                    <Bot size={18} className="md:w-5 md:h-5" />
                 </div>
              </div>
              <div>
                <h3 className="font-bold text-white text-xs md:text-sm mb-0.5">AI টিউটর</h3>
                <p className="text-[9px] md:text-[10px] text-emerald-100">যেকোনো প্রশ্ন করো</p>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
};

export default HomeDashboard;
