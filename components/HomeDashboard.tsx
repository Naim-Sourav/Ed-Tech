
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Bot, Search, PieChart, Swords, Library,
  FileCheck, Sparkles, Trophy, Target, Zap, Clock,
  ChevronRight, Archive, Star
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
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 via-primary/5 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 relative z-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-primary dark:text-green-400 bg-primary/10 dark:bg-primary/20 px-3 py-1 rounded-full border border-primary/10">
                    {t(greetingKey)}
                </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600 dark:from-green-400 dark:to-emerald-300">{(currentUser?.displayName || 'User').split(' ')[0]}</span> <span className="animate-wave inline-block origin-[70%_70%]">👋</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base mt-2 max-w-md">{t('greeting_sub')}</p>
          </div>
          
          {/* Quick Profile Stats */}
          <div className="w-full md:w-auto flex items-center bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 backdrop-blur-sm">

             {/* Stats Group */}
             <div className="flex items-center gap-1 pr-4 mr-4 border-r border-gray-100 dark:border-gray-700">
                {/* Rank */}
                <button
                    onClick={() => navigate('/leaderboard')}
                    className="flex flex-col items-center justify-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all group"
                >
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-primary transition-colors">{t('stat_rank')}</span>
                    <div className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-white text-lg">
                        <Trophy size={18} className="text-yellow-500 fill-yellow-500" />
                        <span>#{rank || '--'}</span>
                    </div>
                </button>

                {/* Points */}
                <button
                    onClick={() => navigate('/challenges')}
                    className="flex flex-col items-center justify-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all group"
                >
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-orange-500 transition-colors">{t('stat_points')}</span>
                    <div className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-white text-lg">
                        <Zap size={18} className="text-orange-500 fill-orange-500" />
                        <span>{stats?.points || 0}</span>
                    </div>
                </button>
             </div>

             {/* Avatar */}
             <button
                onClick={() => navigate('/profile')}
                className="relative group mr-2"
             >
                <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white dark:border-gray-700 shadow-md group-hover:scale-105 transition-transform">
                    <img src={userAvatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            {/* Main Hero: Exam Focus */}
            <div className="lg:col-span-8 xl:col-span-9">
                <section 
                    className="h-full relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-gray-900 via-gray-800 to-black dark:from-black dark:via-gray-900 dark:to-gray-900 text-white p-6 md:p-10 shadow-2xl shadow-gray-900/20 group cursor-pointer transition-all hover:scale-[1.01]"
                    onClick={() => navigate('/quiz')}
                >
                    {/* Abstract Background Elements */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] -mr-20 -mt-20 group-hover:bg-primary/25 transition-all duration-700 animate-pulse-slow"></div>
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[80px] -ml-10 -mb-10"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 h-full">
                        <div className="space-y-6 max-w-xl flex flex-col justify-center h-full text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-green-300 backdrop-blur-md w-fit mx-auto md:mx-0">
                                <Sparkles size={14} className="text-yellow-300" />
                                <span className="uppercase tracking-wider">{t('hero_tag')}</span>
                            </div>

                            <h2 className="text-3xl md:text-5xl font-bold leading-[1.1] tracking-tight">
                                {t('hero_title_1')} <br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-200">{t('hero_title_2')}</span>
                            </h2>

                            <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-md mx-auto md:mx-0">
                                {t('hero_desc')}
                            </p>

                            <div className="pt-2">
                                <button className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold flex items-center justify-center md:justify-start gap-2 transition-all shadow-xl shadow-white/10 group-hover:shadow-white/20 hover:-translate-y-1 w-full md:w-auto">
                                    {t('hero_btn')} <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Visual Element - Right Side */}
                        <div className="relative hidden md:flex flex-col items-center justify-center w-full max-w-xs">
                            <div className="relative w-full bg-gray-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 transform rotate-3 group-hover:rotate-6 transition-transform duration-500 shadow-2xl">
                                <div className="absolute -top-3 -right-3 px-3 py-1 bg-red-500 rounded-full flex items-center gap-1 text-white font-bold text-xs shadow-lg animate-bounce">
                                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                    LIVE
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-white shadow-lg shadow-green-900/20">
                                            <Clock size={24}/>
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-white">Daily Physics Quiz</p>
                                            <p className="text-xs text-gray-400 font-medium">Chapter 5: Motion</p>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-black/20 rounded-xl space-y-2">
                                        <div className="flex justify-between text-xs text-gray-300">
                                            <span>Time Remaining</span>
                                            <span className="text-white font-mono">14:20</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-primary to-green-400 w-[60%]"></div>
                                        </div>
                                    </div>

                                    <div className="flex -space-x-2 pt-1">
                                        {[1,2,3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-gray-800 bg-gray-700 flex items-center justify-center text-[10px] text-white">
                                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="" className="w-full h-full rounded-full" />
                                            </div>
                                        ))}
                                        <div className="w-8 h-8 rounded-full border-2 border-gray-800 bg-gray-700 flex items-center justify-center text-[10px] text-white font-bold">
                                            +42
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Daily Goal / Challenge Banner */}
            <div className="lg:col-span-4 xl:col-span-3">
                <div 
                    onClick={() => navigate('/challenges')}
                    className="h-full bg-white dark:bg-gray-800 rounded-[2rem] p-6 md:p-8 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-xl transition-all group relative overflow-hidden flex flex-col"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-[0.02] group-hover:scale-110 transition-transform duration-500">
                        <Target size={120} />
                    </div>

                    <div className="mb-auto">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-lg">
                                <Target size={20}/>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('goal_title')}</span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                            Complete Today's Challenges
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2">
                            {t('goal_desc')}
                        </p>
                    </div>

                    <div className="space-y-4 relative z-10 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-end justify-between mb-1">
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.quests?.filter((q:any) => q.claimed).length || 0}<span className="text-lg text-gray-400 font-medium">/5</span></span>
                            <span className="text-xs font-bold text-green-500 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-md">
                                {Math.round(((stats?.quests?.filter((q:any) => q.claimed).length || 0) / 5) * 100)}%
                            </span>
                        </div>

                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                                style={{ width: `${stats?.quests ? (stats.quests.filter((q:any) => q.claimed).length / 5) * 100 : 0}%` }}
                            ></div>
                        </div>

                        <div className="flex items-center justify-between text-xs font-medium pt-1">
                            <span className="text-gray-400">{t('goal_completed')}</span>
                            <div className="flex items-center gap-1 text-primary group-hover:translate-x-1 transition-transform">
                                {t('view_all')} <ArrowRight size={12}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Feature Grid */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 px-1 flex items-center gap-2">
            <Star className="text-yellow-400 fill-yellow-400" size={20} />
            Explore Features
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
           {/* Question Bank */}
           <div 
             onClick={() => navigate('/qbank')}
             className="col-span-1 md:col-span-2 bg-white dark:bg-gray-800 rounded-[2rem] p-6 md:p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all group cursor-pointer relative overflow-hidden"
           >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                 <Archive size={80} />
              </div>
              <div className="relative z-10">
                 <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform shadow-sm">
                    <Archive size={28} />
                 </div>
                 <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('feat_qbank_title')}</h3>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm leading-relaxed">
                    {t('feat_qbank_desc')}
                 </p>
                 <div className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                    {t('feat_qbank_btn')} <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                 </div>
              </div>
           </div>

           {/* Model Test Pack */}
           <div 
             onClick={() => navigate('/exams')}
             className="col-span-1 md:col-span-2 bg-white dark:bg-gray-800 rounded-[2rem] p-6 md:p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all group cursor-pointer relative overflow-hidden"
           >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                 <FileCheck size={80} />
              </div>
              <div className="relative z-10">
                 <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform shadow-sm">
                    <Library size={28} />
                 </div>
                 <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('feat_exam_title')}</h3>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm leading-relaxed">
                    {t('feat_exam_desc')}
                 </p>
                 <div className="inline-flex items-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-xl group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 transition-colors">
                    {t('feat_exam_btn')} <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                 </div>
              </div>
           </div>

           {/* Battle Mode */}
           <div 
             onClick={() => navigate('/battle')}
             className="col-span-2 md:col-span-2 bg-gradient-to-br from-orange-500 via-red-500 to-red-600 rounded-[2rem] p-6 md:p-8 text-white shadow-lg hover:shadow-orange-500/30 hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden group"
           >
              <div className="absolute -bottom-10 -right-10 text-white/10 transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-700">
                 <Swords size={180} />
              </div>

              <div className="relative z-10 flex flex-row items-center justify-between h-full">
                 <div className="flex flex-col justify-between h-full max-w-sm">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/20 uppercase tracking-wide">{t('feat_battle_tag')}</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold mb-3">{t('feat_battle_title')}</h3>
                        <p className="text-orange-50 text-sm md:text-base opacity-90 mb-6 leading-relaxed">{t('feat_battle_desc')}</p>
                    </div>
                    <button className="bg-white text-orange-600 px-6 py-3 rounded-xl text-sm font-bold hover:bg-orange-50 transition-colors w-fit shadow-lg shadow-black/10">
                        {t('feat_battle_btn')}
                    </button>
                 </div>
              </div>
           </div>

           {/* Small Feature Cards */}
           {[
               { icon: Trophy, color: 'yellow', title: t('feat_leaderboard_title'), desc: t('feat_leaderboard_desc'), link: '/leaderboard' },
               { icon: PieChart, color: 'blue', title: t('feat_tracker_title'), desc: t('feat_tracker_desc'), link: '/tracker' },
               { icon: Search, color: 'cyan', title: t('feat_info_title'), desc: t('feat_info_desc'), link: '/admission' },
           ].map((item, idx) => (
                <div
                    key={idx}
                    onClick={() => navigate(item.link)}
                    className={`col-span-1 bg-white dark:bg-gray-800 rounded-[2rem] p-5 md:p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:border-${item.color}-400 dark:hover:border-${item.color}-600 transition-all cursor-pointer group hover:-translate-y-1 hover:shadow-lg hover:shadow-${item.color}-500/10 flex flex-col`}
                >
                    <div className="mb-auto">
                        <div className={`w-12 h-12 bg-${item.color}-50 dark:bg-${item.color}-900/20 text-${item.color}-600 dark:text-${item.color}-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <item.icon size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-base md:text-lg mb-2">{item.title}</h3>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                    </div>
                </div>
           ))}

           {/* AI Tutor */}
           <div 
             onClick={openSynapse}
             className="col-span-1 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] p-5 md:p-6 text-white shadow-md hover:shadow-xl hover:shadow-emerald-500/20 hover:-translate-y-1 transition-all cursor-pointer group flex flex-col"
           >
                <div className="mb-auto">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                        <Bot size={24} />
                    </div>
                    <h3 className="font-bold text-white text-base md:text-lg mb-2">{t('feat_ai_title')}</h3>
                    <p className="text-xs md:text-sm text-emerald-50 leading-relaxed opacity-90">{t('feat_ai_desc')}</p>
                </div>
           </div>

        </div>

      </div>
    </div>
  );
};

export default HomeDashboard;
