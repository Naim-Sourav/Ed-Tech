
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchLeaderboardAPI } from '../services/api';
import { LeaderboardUser } from '../types';
import { Trophy, Crown, Shield, Star, Award, Zap, Flame, Hexagon, ChevronRight, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCache } from '../contexts/CacheContext';

// --- LEAGUE CONFIGURATION ---
const LEAGUES = [
  { id: 'NOVICE', name: 'Novice', min: 0, max: 999, color: 'text-slate-400', gradient: 'from-slate-500 to-slate-700', icon: Shield, glow: 'shadow-slate-500/20', border: 'border-slate-500/50' },
  { id: 'APPRENTICE', name: 'Apprentice', min: 1000, max: 2999, color: 'text-emerald-400', gradient: 'from-emerald-500 to-teal-700', icon: Shield, glow: 'shadow-emerald-500/20', border: 'border-emerald-500/50' },
  { id: 'SCHOLAR', name: 'Scholar', min: 3000, max: 6999, color: 'text-orange-400', gradient: 'from-orange-500 to-orange-700', icon: Star, glow: 'shadow-orange-500/20', border: 'border-orange-500/50' },
  { id: 'MASTER', name: 'Master', min: 7000, max: 14999, color: 'text-rose-400', gradient: 'from-rose-500 to-red-700', icon: Award, glow: 'shadow-rose-500/20', border: 'border-rose-500/50' },
  { id: 'GRANDMASTER', name: 'Grandmaster', min: 15000, max: 29999, color: 'text-amber-400', gradient: 'from-amber-400 to-orange-600', icon: Crown, glow: 'shadow-amber-500/30', border: 'border-amber-500/50' },
  { id: 'TITAN', name: 'Titan', min: 30000, max: Infinity, color: 'text-orange-400', gradient: 'from-orange-400 via-orange-500 to-orange-600', icon: Hexagon, glow: 'shadow-orange-500/40', border: 'border-orange-500/50' },
];

const LeaderboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { getCache, setCache } = useCache();
  
  const cacheKey = 'leaderboard_state';
  const cachedData = getCache(cacheKey) || {};

  const [users, setUsers] = useState<LeaderboardUser[]>(cachedData.users || []);
  const [loading, setLoading] = useState(!cachedData.users);
  const [activeLeagueId, setActiveLeagueId] = useState(cachedData.activeLeagueId || 'NOVICE');

  // Update Cache when state changes
  useEffect(() => {
      setCache(cacheKey, { users, activeLeagueId });
  }, [users, activeLeagueId, setCache]);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!cachedData.users) setLoading(true);
        
        const data = await fetchLeaderboardAPI();
        setUsers(data);
        
        // Auto-select user's current league ONLY if no cache or first load
        if (currentUser && !cachedData.activeLeagueId) {
           const myData = data.find(u => u.uid === currentUser.uid);
           if (myData) {
              const myLeague = LEAGUES.find(l => myData.points >= l.min && myData.points <= l.max);
              if (myLeague) setActiveLeagueId(myLeague.id);
           }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentUser]);

  const activeLeague = LEAGUES.find(l => l.id === activeLeagueId)!;
  
  // Filter and Rank users
  const filteredUsers = useMemo(() => {
      const list = users
        .filter(u => u.points >= activeLeague.min && u.points <= activeLeague.max)
        .sort((a, b) => b.points - a.points);
      return list;
  }, [users, activeLeagueId]);

  const top3 = filteredUsers.slice(0, 3);
  const others = filteredUsers.slice(3);
  const myData = users.find(u => u.uid === currentUser?.uid);
  const myRank = users.findIndex(u => u.uid === currentUser?.uid) + 1;

  const handleUserClick = (uid: string) => navigate(`/profile/${uid}`);

  // Skeleton Loader Component
  const LeaderboardSkeleton = () => (
    <div className="space-y-4 w-full">
      {/* Podium Skeleton */}
      <div className="flex justify-center items-end gap-4 mb-10 h-48">
         <div className="w-20 h-32 bg-gray-200 dark:bg-gray-800 rounded-t-2xl animate-pulse"></div>
         <div className="w-24 h-40 bg-gray-300 dark:bg-gray-700 rounded-t-2xl animate-pulse"></div>
         <div className="w-20 h-24 bg-gray-200 dark:bg-gray-800 rounded-t-2xl animate-pulse"></div>
      </div>
      {/* List Skeletons */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 animate-pulse">
           <div className="w-8 h-6 bg-gray-200 dark:bg-gray-700 rounded mr-4"></div>
           <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl mr-4"></div>
           <div className="flex-1">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded"></div>
           </div>
           <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ))}
    </div>
  );

  // Helper to render Avatar
  const renderAvatar = (user: LeaderboardUser, className: string, isRanked = false) => {
    if (user.photoURL && user.photoURL !== 'false') {
      return <img src={user.photoURL} className={className} alt={user.displayName} />;
    }
    return (
      <div className={`${className} flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 font-bold uppercase ${isRanked ? 'text-2xl' : 'text-lg'}`}>
        {user.displayName?.charAt(0) || 'U'}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white relative custom-scrollbar pb-48 md:pb-32 transition-colors duration-500 overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-10">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/40 dark:border-white/10 mb-4 animate-in fade-in slide-in-from-top-4 shadow-sm">
              <Flame size={14} className="text-orange-500 fill-orange-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-widest uppercase text-gray-500 dark:text-gray-300">Season 1 Ranking</span>
           </div>
           <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter drop-shadow-sm">Leaderboard</h1>
           <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium">Check your rank among the best</p>
        </div>

        {/* League Navigation */}
        <div className="flex justify-center mb-12">
            <div className="flex overflow-x-auto p-1.5 gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/40 dark:border-white/10 no-scrollbar max-w-full shadow-lg">
            {LEAGUES.map(league => {
                const Icon = league.icon;
                const isActive = activeLeagueId === league.id;
                return (
                <button
                    key={league.id}
                    onClick={() => setActiveLeagueId(league.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] md:text-xs font-black whitespace-nowrap transition-all duration-300 ${
                        isActive 
                        ? `bg-gradient-to-r ${league.gradient} text-white shadow-lg ${league.glow} ring-1 ring-white/20 scale-105` 
                        : 'text-gray-500 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-slate-300'
                    }`}
                >
                    <Icon size={14} fill={isActive ? "currentColor" : "none"} />
                    {league.name}
                </button>
                )
            })}
            </div>
        </div>

        {loading ? (
           <LeaderboardSkeleton />
        ) : filteredUsers.length === 0 ? (
           <div className="text-center py-24 bg-white/50 dark:bg-white/5 rounded-[2.5rem] border border-gray-200 dark:border-white/5 backdrop-blur-sm animate-in zoom-in">
              <Trophy size={64} className="mx-auto mb-4 text-gray-300 dark:text-slate-800" />
              <h3 className="text-xl font-bold text-gray-400 dark:text-slate-400">No one here yet</h3>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-2 font-medium">Earn at least {activeLeague.min} points to reach this league!</p>
           </div>
        ) : (
           <>
             {/* Podium (Top 3) */}
             <div className="flex justify-center items-end gap-2 md:gap-6 mb-16 px-2 min-h-[300px]">
                {/* 2nd Place */}
                {top3[1] && (
                   <div className="flex flex-col items-center w-1/3 max-w-[120px] animate-in slide-in-from-bottom-12 duration-700 delay-200 cursor-pointer" onClick={() => handleUserClick(top3[1].uid)}>
                      <div className="relative mb-4 group">
                         <div className="w-16 h-16 md:w-20 md:h-20 rounded-full p-1 bg-gradient-to-br from-slate-300 to-slate-500 shadow-xl relative z-10 group-hover:scale-110 transition-all">
                             {renderAvatar(top3[1], "w-full h-full object-cover rounded-full border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800", true)}
                         </div>
                         <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-[10px] font-black px-3 py-0.5 rounded-full shadow-lg border border-slate-500">#2</div>
                      </div>
                      <p className="font-black text-[10px] md:text-xs text-gray-600 dark:text-slate-200 text-center mb-1 line-clamp-1 w-full">{top3[1].displayName}</p>
                      <div className="w-full h-24 md:h-32 bg-gradient-to-t from-slate-200/80 to-slate-100/20 dark:from-slate-800/80 dark:to-slate-700/20 rounded-t-[2rem] border-t border-slate-300 dark:border-slate-500/20 backdrop-blur-md relative overflow-hidden group">
                          <div className="absolute inset-0 bg-slate-400/5 group-hover:bg-slate-400/10 transition-colors"></div>
                          <div className="absolute bottom-4 left-0 right-0 text-center font-black text-slate-500 dark:text-slate-400 text-xs">{top3[1].points}</div>
                      </div>
                   </div>
                )}

                {/* 1st Place */}
                {top3[0] && (
                   <div className="flex flex-col items-center w-1/3 max-w-[140px] z-20 animate-in slide-in-from-bottom-12 duration-700 cursor-pointer" onClick={() => handleUserClick(top3[0].uid)}>
                      <div className="mb-4 relative group">
                         <Crown size={32} className="text-yellow-400 animate-bounce absolute -top-10 left-1/2 -translate-x-1/2 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]" fill="currentColor" />
                         <div className="w-20 h-20 md:w-24 md:h-24 rounded-full p-1.5 bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 shadow-2xl shadow-yellow-500/40 relative z-10 group-hover:scale-110 transition-all">
                             {renderAvatar(top3[0], "w-full h-full object-cover rounded-full border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800", true)}
                         </div>
                         <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-yellow-950 text-xs font-black px-4 py-1 rounded-full shadow-xl border-2 border-yellow-300">#1</div>
                      </div>
                      <p className="font-black text-xs md:text-sm text-yellow-600 dark:text-yellow-100 text-center mb-1 line-clamp-1 w-full">{top3[0].displayName}</p>
                      <div className="w-full h-32 md:h-44 bg-gradient-to-t from-yellow-100/80 to-yellow-50/20 dark:from-yellow-900/40 dark:to-yellow-600/10 rounded-t-[2.5rem] border-t border-yellow-300 dark:border-yellow-500/30 backdrop-blur-md relative overflow-hidden group shadow-[0_-10px_40px_-15px_rgba(234,179,8,0.2)]">
                          <div className="absolute inset-0 bg-yellow-400/5 group-hover:bg-yellow-400/10 transition-colors"></div>
                          <div className="absolute bottom-6 left-0 right-0 text-center font-black text-yellow-600 dark:text-yellow-500 text-sm">{top3[0].points}</div>
                      </div>
                   </div>
                )}

                {/* 3rd Place */}
                {top3[2] && (
                   <div className="flex flex-col items-center w-1/3 max-w-[120px] animate-in slide-in-from-bottom-12 duration-700 delay-300 cursor-pointer" onClick={() => handleUserClick(top3[2].uid)}>
                      <div className="relative mb-4 group">
                         <div className="w-14 h-14 md:w-16 md:h-16 rounded-full p-1 bg-gradient-to-br from-amber-600 to-amber-800 shadow-xl relative z-10 group-hover:scale-110 transition-all">
                             {renderAvatar(top3[2], "w-full h-full object-cover rounded-full border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800", true)}
                         </div>
                         <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-800 text-white text-[10px] font-black px-3 py-0.5 rounded-full shadow-lg border border-amber-600">#3</div>
                      </div>
                      <p className="font-black text-[10px] md:text-xs text-amber-700 dark:text-amber-200 text-center mb-1 line-clamp-1 w-full">{top3[2].displayName}</p>
                      <div className="w-full h-16 md:h-24 bg-gradient-to-t from-amber-100/80 to-amber-50/20 dark:from-amber-900/60 dark:to-amber-800/20 rounded-t-[2rem] border-t border-amber-300 dark:border-amber-600/20 backdrop-blur-sm relative overflow-hidden group">
                          <div className="absolute inset-0 bg-amber-600/5 group-hover:bg-amber-600/10 transition-colors"></div>
                          <div className="absolute bottom-4 left-0 right-0 text-center font-black text-amber-700 dark:text-amber-600 text-xs">{top3[2].points}</div>
                      </div>
                   </div>
                )}
             </div>

             {/* Other Users List */}
             <div className="space-y-3 mb-10">
                {others.map((u, idx) => {
                   const isMe = currentUser?.uid === u.uid;
                   const rank = idx + 4;
                   return (
                     <div 
                         key={u.uid} 
                         onClick={() => handleUserClick(u.uid)}
                         className={`flex items-center p-3 md:p-4 rounded-2xl border transition-all duration-300 cursor-pointer group active-scale ${
                             isMe 
                             ? 'bg-primary/10 dark:bg-primary/20 border-primary/50 shadow-[0_0_25px_rgba(21,101,192,0.1)]' 
                             : 'bg-white/60 dark:bg-gray-800/40 border-white/40 dark:border-white/5 hover:bg-white/80 dark:hover:bg-gray-800/60 hover:border-white/60 dark:hover:border-white/10 shadow-sm backdrop-blur-md'
                         }`}
                     >
                         <div className="w-8 font-mono font-black text-gray-400 dark:text-slate-500 text-center mr-4 group-hover:text-gray-600 dark:group-hover:text-white transition-colors">
                             {rank}
                         </div>
                         <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl p-0.5 mr-4 transition-transform group-hover:scale-105 ${isMe ? 'bg-primary shadow-lg' : 'bg-gray-200 dark:bg-slate-800'}`}>
                             {renderAvatar(u, "w-full h-full object-cover rounded-lg bg-gray-100 dark:bg-slate-900")}
                         </div>
                         <div className="flex-1 min-w-0">
                             <p className={`font-black text-sm md:text-base truncate ${isMe ? 'text-primary dark:text-white' : 'text-gray-800 dark:text-slate-200'}`}>
                                {u.displayName}
                             </p>
                             <p className="text-[9px] md:text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase truncate">{u.college || 'Institution Info Missing'}</p>
                         </div>
                         <div className="flex items-center gap-3 ml-2">
                             <div className="text-right">
                                <span className={`font-mono font-black text-sm md:text-lg block ${isMe ? 'text-primary' : 'text-gray-700 dark:text-slate-300'}`}>
                                    {u.points}
                                </span>
                                <span className="text-[8px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-tighter">POINTS</span>
                             </div>
                             <ChevronRight size={16} className="text-gray-400 dark:text-slate-700 group-hover:text-gray-600 dark:group-hover:text-slate-400 transition-colors"/>
                         </div>
                     </div>
                   )
                })}
                {others.length === 0 && top3.length > 0 && (
                   <p className="text-center py-10 text-gray-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">No one else on the list</p>
                )}
             </div>
           </>
        )}
      </div>

      {/* Floating Personal Rank Card */}
      {myData && (
        <div className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-8 md:w-80 z-50">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-gray-200 dark:border-white/20 rounded-[2rem] p-4 shadow-2xl flex items-center gap-4 group animate-in slide-in-from-bottom-10 duration-700 hover:scale-105 transition-transform cursor-pointer" onClick={() => navigate('/profile')}>
                <div className="relative">
                    {renderAvatar(myData, "w-12 h-12 rounded-2xl object-cover border-2 border-primary")}
                    <div className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-lg">#{myRank}</div>
                </div>
                <div className="flex-1">
                    <p className="text-xs font-black text-gray-400 dark:text-white/50 uppercase tracking-widest">Your Rank</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white truncate">{myData.displayName}</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-black text-primary flex items-center justify-end gap-1">
                        <Zap size={14} className="fill-current"/> {myData.points}
                    </p>
                    <div className="text-[10px] font-black text-gray-400 dark:text-white/40 group-hover:text-primary dark:group-hover:text-white transition-colors uppercase flex items-center gap-1 justify-end">Profile <ArrowRight size={10}/></div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
