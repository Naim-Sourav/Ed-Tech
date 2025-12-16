
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Bot, Brain, Search, PieChart, Swords, Library, 
  FileCheck, Sparkles, Trophy, Flame, Target, Zap, Clock, 
  ChevronRight, Star, TrendingUp, Activity, Archive
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchUserStatsAPI, fetchLeaderboardAPI } from '../services/api';

interface HomeDashboardProps {
  openSynapse: () => void;
}

const HomeDashboard: React.FC<HomeDashboardProps> = ({ openSynapse }) => {
  const navigate = useNavigate();
  const { currentUser, userAvatar } = useAuth();
  const { t } = useLanguage();
  const [greetingKey, setGreetingKey] = useState<any>('greeting_morning');
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
    if (hour < 12) setGreetingKey('greeting_morning');
    else if (hour < 17) setGreetingKey('greeting_afternoon');
    else setGreetingKey('greeting_evening');

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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {t(greetingKey)}, <span className="text-primary dark:text-green-400">{(currentUser?.displayName || 'User').split(' ')[0]}</span> <span className="text-xl md:text-xl">👋</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('greeting_sub')}</p>
          </div>
          
          {/* Quick Profile Stats */}
          <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-2 md:gap-3 bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
             {/* Rank - Clickable */}
             <div 
                onClick={() => navigate('/leaderboard')}
                className="flex-1 md:flex-none px-3 md:px-4 py-1 md:py-2 border-r border-gray-100 dark:border-gray-700 text-center md:text-left cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors group"
             >
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider group-hover:text-primary transition-colors">{t('stat_rank')}</p>
                <p className="font-bold text-gray-800 dark:text-white flex items-center justify-center md:justify-start gap-1 text-base">
                   <Trophy size={16} className="text-yellow-500" /> #{rank || '--'}
                </p>
             </div>

             {/* Points - Clickable */}
             <div 
                onClick={() => navigate('/challenges')}
                className="flex-1 md:flex-none px-3 md:px-4 py-1 md:py-2 text-center md:text-left cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors group"
             >
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider group-hover:text-orange-500 transition-colors">{t('stat_points')}</p>
                <p className="font-bold text-gray-800 dark:text-white flex items-center justify-center md:justify-start gap-1 text-base">
                   <Zap size={16} className="text-orange-500" /> {stats?.points || 0}
                </p>
             </div>

             {/* Avatar - Clickable */}
             <div 
                onClick={() => navigate('/profile')}
                className="w-10 h-10 md:w-10 md:h-10 rounded-xl overflow-hidden border-2 border-primary/20 shrink-0 cursor-pointer hover:opacity-80 transition-opacity hover:ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-800"
             >
                <img src={userAvatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt="Profile" className="w-full h-full object-cover" />
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="lg:col-span-2">
                {/* Main Hero: Exam Focus */}
                <section 
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 text-white p-6 md:p-10 shadow-xl group cursor-pointer" 
                    onClick={() => navigate('/quiz')}
                >
                    {/* Abstract Background Elements */}
                    <div className="absolute top-0 right-0 w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-primary/20 rounded-full blur-[80px] md:blur-[100px] -mr-10 -mt-10 group-hover:bg-primary/30 transition-all duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-[150px] md:w-[200px] h-[150px] md:h-[200px] bg-blue-500/10 rounded-full blur-[60px] md:blur-[80px] -ml-5 -mb-5"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                        <div className="space-y-4 max-w-lg text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-green-300 backdrop-blur-md">
                                <Sparkles size={14} /> {t('hero_tag')}
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                                {t('hero_title_1')} <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">{t('hero_title_2')}</span>
                            </h2>
                            <p className="text-gray-300 text-sm md:text-base leading-relaxed hidden md:block">
                                {t('hero_desc')}
                            </p>
                            <p className="text-gray-300 text-sm leading-relaxed md:hidden">
                                {t('hero_desc')}
                            </p>
                            <button className="mt-2 md:mt-4 bg-primary hover:bg-green-600 text-white px-6 py-3.5 md:px-8 md:py-3.5 rounded-xl font-bold flex items-center justify-center md:justify-start gap-2 transition-all shadow-lg shadow-green-900/20 group-hover:scale-105 active:scale-95 text-base w-full md:w-auto">
                                {t('hero_btn')} <ArrowRight size={18} />
                            </button>
                        </div>

                        {/* Visual Element */}
                        <div className="relative w-full md:w-auto flex justify-center hidden sm:flex">
                            <div className="relative w-56 md:w-64 h-40 md:h-48 bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 transform rotate-3 group-hover:rotate-6 transition-transform duration-500 shadow-2xl">
                                <div className="absolute -top-3 -right-3 w-8 h-8 md:w-10 md:h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-[10px] md:text-xs shadow-lg animate-bounce">{t('live_badge')}</div>
                                <div className="h-full flex flex-col justify-between">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary"><Clock size={20}/></div>
                                    <div>
                                        <p className="text-sm font-bold text-white">Physics Quiz</p>
                                        <p className="text-xs text-gray-400">Time: 20 Mins</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary w-[70%]"></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>Progress</span>
                                        <span>1500+ Participants</span>
                                    </div>
                                </div>
                                <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-colors text-white">
                                    {t('join_now')}
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
                    className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-3xl p-6 border border-yellow-200 dark:border-yellow-800/30 cursor-pointer hover:shadow-lg transition-all group relative overflow-hidden h-full flex flex-col justify-between"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap size={80} className="text-yellow-600" fill="currentColor"/>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-3 text-base">
                            <Target size={20} className="text-red-500"/> {t('goal_title')}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                            {t('goal_desc')}
                        </p>
                    </div>
                    <div>
                        <div className="w-full bg-white dark:bg-gray-700 h-2.5 rounded-full overflow-hidden mb-3 border border-yellow-100 dark:border-transparent">
                            <div 
                                className="bg-yellow-500 h-full rounded-full transition-all duration-1000" 
                                style={{ width: `${stats?.quests ? (stats.quests.filter((q:any) => q.claimed).length / 5) * 100 : 0}%` }}
                            ></div>
                        </div>
                        <div className="flex items-center justify-between text-sm font-bold text-yellow-700 dark:text-yellow-500">
                            <span>{stats?.quests?.filter((q:any) => q.claimed).length || 0} / 5 {t('goal_completed')}</span>
                            <span className="flex items-center gap-1 group-hover:gap-2 transition-all">{t('view_all')} <ArrowRight size={14}/></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
           {/* Question Bank */}
           <div 
             onClick={() => navigate('/qbank')}
             className="col-span-1 md:col-span-2 bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl p-5 md:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all group cursor-pointer relative overflow-hidden active:scale-95 duration-200"
           >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
                 <Archive size={60} />
              </div>
              <div className="relative z-10">
                 <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                    <Archive size={24} />
                 </div>
                 <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">{t('feat_qbank_title')}</h3>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 md:mb-6 max-w-xs line-clamp-2 md:line-clamp-none">
                    {t('feat_qbank_desc')}
                 </p>
                 <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:gap-3 transition-all">
                    {t('feat_qbank_btn')} <ChevronRight size={16} />
                 </div>
              </div>
           </div>

           {/* Model Test Pack */}
           <div 
             onClick={() => navigate('/exams')}
             className="col-span-1 md:col-span-2 bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl p-5 md:p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all group cursor-pointer relative overflow-hidden active:scale-95 duration-200"
           >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
                 <FileCheck size={60} />
              </div>
              <div className="relative z-10">
                 <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                    <Library size={24} />
                 </div>
                 <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">{t('feat_exam_title')}</h3>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 md:mb-6 max-w-xs line-clamp-2 md:line-clamp-none">
                    {t('feat_exam_desc')}
                 </p>
                 <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-purple-600 dark:text-purple-400 group-hover:gap-3 transition-all">
                    {t('feat_exam_btn')} <ChevronRight size={16} />
                 </div>
              </div>
           </div>

           {/* Battle Mode */}
           <div 
             onClick={() => navigate('/battle')}
             className="col-span-2 md:col-span-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl md:rounded-3xl p-5 md:p-6 text-white shadow-lg hover:shadow-orange-500/30 hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden group active:scale-95 duration-200"
           >
              <div className="absolute -bottom-4 -right-4 text-white/10 transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
                 <Swords size={100} />
              </div>
              <div className="relative z-10 flex flex-row items-center justify-between">
                 <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">{t('feat_battle_tag')}</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-2">{t('feat_battle_title')}</h3>
                    <p className="text-orange-100 text-sm opacity-90 mb-4">{t('feat_battle_desc')}</p>
                    <button className="bg-white text-orange-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-orange-50 transition-colors">
                        {t('feat_battle_btn')}
                    </button>
                 </div>
                 <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl hidden sm:block">
                    <Swords size={32} className="text-white" />
                 </div>
              </div>
           </div>

           {/* Leaderboard */}
           <div 
             onClick={() => navigate('/leaderboard')}
             className="col-span-1 bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl p-4 md:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:border-yellow-400 transition-all cursor-pointer group active:scale-95 duration-200 flex flex-col justify-between"
           >
              <div className="flex justify-between items-start mb-2">
                 <div className="p-2.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-xl">
                    <Trophy size={20} />
                 </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white text-base md:text-lg mb-1">{t('feat_leaderboard_title')}</h3>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{t('feat_leaderboard_desc')}</p>
              </div>
           </div>

           {/* Study Tracker */}
           <div 
             onClick={() => navigate('/tracker')}
             className="col-span-1 bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl p-4 md:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:border-blue-400 transition-all cursor-pointer group active:scale-95 duration-200 flex flex-col justify-between"
           >
              <div className="flex justify-between items-start mb-2">
                 <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                    <PieChart size={20} />
                 </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white text-base md:text-lg mb-1">{t('feat_tracker_title')}</h3>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{t('feat_tracker_desc')}</p>
              </div>
           </div>

           {/* Admission Info */}
           <div 
             onClick={() => navigate('/admission')}
             className="col-span-1 bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl p-4 md:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:border-cyan-400 transition-all cursor-pointer group active:scale-95 duration-200 flex flex-col justify-between"
           >
              <div className="flex justify-between items-start mb-2">
                 <div className="p-2.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-xl">
                    <Search size={20} />
                 </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white text-base md:text-lg mb-1">{t('feat_info_title')}</h3>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{t('feat_info_desc')}</p>
              </div>
           </div>

           {/* AI Tutor */}
           <div 
             onClick={openSynapse}
             className="col-span-1 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl md:rounded-3xl p-4 md:p-5 text-white shadow-md hover:shadow-lg transition-all cursor-pointer group active:scale-95 duration-200 flex flex-col justify-between"
           >
              <div className="flex justify-between items-start mb-2">
                 <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
                    <Bot size={20} />
                 </div>
              </div>
              <div>
                <h3 className="font-bold text-white text-base md:text-lg mb-1">{t('feat_ai_title')}</h3>
                <p className="text-xs md:text-sm text-emerald-100">{t('feat_ai_desc')}</p>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
};

export default HomeDashboard;
