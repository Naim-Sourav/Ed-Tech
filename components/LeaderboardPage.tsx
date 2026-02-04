
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchLeaderboardAPI } from '../services/api';
import { LeaderboardUser } from '../types';
import { Trophy, Crown, Shield, Star, Award, Zap, Flame, Hexagon, ChevronRight, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCache } from '../contexts/CacheContext';

// --- LEAGUE CONFIGURATION ---
const LEAGUES = [
  { id: 'NOVICE', name: 'Novice', min: 0, max: 999, color: 'text-slate-400', gradient: 'from-slate-500 to-slate-700', icon: Shield, glow: 'shadow-slate-500/20' },
  { id: 'APPRENTICE', name: 'Apprentice', min: 1000, max: 2999, color: 'text-emerald-400', gradient: 'from-emerald-500 to-teal-700', icon: Shield, glow: 'shadow-emerald-500/20' },
  { id: 'SCHOLAR', name: 'Scholar', min: 3000, max: 6999, color: 'text-blue-400', gradient: 'from-blue-500 to-indigo-700', icon: Star, glow: 'shadow-blue-500/20' },
  { id: 'MASTER', name: 'Master', min: 7000, max: 14999, color: 'text-rose-400', gradient: 'from-rose-500 to-red-700', icon: Award, glow: 'shadow-rose-500/20' },
  { id: 'GRANDMASTER', name: 'Grandmaster', min: 15000, max: 29999, color: 'text-amber-400', gradient: 'from-amber-400 to-orange-600', icon: Crown, glow: 'shadow-amber-500/30' },
  { id: 'TITAN', name: 'Titan', min: 30000, max: Infinity, color: 'text-cyan-400', gradient: 'from-cyan-400 via-blue-500 to-purple-600', icon: Hexagon, glow: 'shadow-cyan-500/40' },
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
         <div className="w-20 h-32 bg-white/5 rounded-t-2xl animate-pulse"></div>
         <div className="w-24 h-40 bg-white/10 rounded-t-2xl animate-pulse"></div>
         <div className="w-20 h-24 bg-white/5 rounded-t-2xl animate-pulse"></div>
      </div>
      {/* List Skeletons */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center p-4 rounded-2xl border border-white/5 bg-white/5 animate-pulse">
           <div className="w-8 h-6 bg-white/10 rounded mr-4"></div>
           <div className="w-12 h-12 bg-white/10 rounded-xl mr-4"></div>
           <div className="flex-1">
              <div className="h-4 w-32 bg-white/10 rounded mb-2"></div>
              <div className="h-3 w-20 bg-white/5 rounded"></div>
           </div>
           <div className="w-16 h-6 bg-white/10 rounded"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-full overflow-y-auto bg-gray-950 text-white relative custom-scrollbar pb-48 md:pb-32">
      {/* Background Dynamic Glow */}
      <div className={`fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b ${activeLeague.gradient} opacity-10 blur-[120px] transition-all duration-1000 pointer-events-none`}></div>

      <div className="max-w-4xl mx-auto px-4 pt-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-10">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 mb-4 animate-in fade-in slide-in-from-top-4">
              <Flame size={14} className="text-orange-500 fill-orange-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-widest uppercase text-slate-300">Season 1 Ranking</span>
           </div>
           <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tighter">Leaderboard</h1>
           <p className="text-slate-400 text-xs md:text-sm font-medium">Check your rank among the best</p>
        </div>

        {/* League Navigation */}
        <div className="flex justify-center mb-12">
            <div className="flex overflow-x-auto p-1.5 gap-2 bg-black/40 backdrop-blur-2xl rounded-2xl border border-white/5 no-scrollbar max-w-full">
            {LEAGUES.map(league => {
                const Icon = league.icon;
                const isActive = activeLeagueId === league.id;
                return (
                <button
                    key={league.id}
                    onClick={() => setActiveLeagueId(league.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] md:text-xs font-black whitespace-nowrap transition-all duration-300 ${
                        isActive 
                        ? `bg-gradient-to-r ${league.gradient} text-white shadow-xl ${league.glow} ring-1 ring-white/20` 
                        : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
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
           <div className="text-center py-24 bg-white/5 rounded-[2.5rem] border border-white/5 backdrop-blur-sm animate-in zoom-in">
              <Trophy size={64} className="mx-auto mb-4 text-slate-800" />
              <h3 className="text-xl font-bold text-slate-400">No one here yet</h3>
              <p className="text-xs text-slate-500 mt-2 font-medium">Earn at least {activeLeague.min} points to reach this league!</p>
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
                             <img src={top3[1].photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[1].uid}`} className="w-full h-full object-cover rounded-full border-2 border-gray-900 bg-gray-800" alt="" />
                         </div>
                         <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-[10px] font-black px-3 py-0.5 rounded-full shadow-lg border border-slate-500">#2</div>
                      </div>
                      <p className="font-black text-[10px] md:text-xs text-slate-200 text-center mb-1 line-clamp-1 w-full">{top3[1].displayName}</p>
                      <div className="w-full h-24 md:h-32 bg-gradient-to-t from-slate-800/80 to-slate-700/20 rounded-t-[2rem] border-t border-slate-500/20 backdrop-blur-md relative overflow-hidden group">
                          <div className="absolute inset-0 bg-slate-400/5 group-hover:bg-slate-400/10 transition-colors"></div>
                          <div className="absolute bottom-4 left-0 right-0 text-center font-black text-slate-400 text-xs">{top3[1].points}</div>
                      </div>
                   </div>
                )}

                {/* 1st Place */}
                {top3[0] && (
                   <div className="flex flex-col items-center w-1/3 max-w-[140px] z-20 animate-in slide-in-from-bottom-12 duration-700 cursor-pointer" onClick={() => handleUserClick(top3[0].uid)}>
                      <div className="mb-4 relative group">
                         <Crown size={32} className="text-yellow-400 animate-bounce absolute -top-10 left-1/2 -translate-x-1/2 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]" fill="currentColor" />
                         <div className="w-20 h-20 md:w-24 md:h-24 rounded-full p-1.5 bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 shadow-2xl shadow-yellow-500/40 relative z-10 group-hover:scale-110 transition-all">
                             <img src={top3[0].photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[0].uid}`} className="w-full h-full object-cover rounded-full border-2 border-gray-900 bg-gray-800" alt="" />
                         </div>
                         <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-yellow-950 text-xs font-black px-4 py-1 rounded-full shadow-xl border-2 border-yellow-300">#1</div>
                      </div>
                      <p className="font-black text-xs md:text-sm text-yellow-100 text-center mb-1 line-clamp-1 w-full">{top3[0].displayName}</p>
                      <div className="w-full h-32 md:h-44 bg-gradient-to-t from-yellow-900/40 to-yellow-600/10 rounded-t-[2.5rem] border-t border-yellow-500/30 backdrop-blur-md relative overflow-hidden group shadow-[0_-10px_40px_-15px_rgba(234,179,8,0.2)]">
                          <div className="absolute inset-0 bg-yellow-400/5 group-hover:bg-yellow-400/10 transition-colors"></div>
                          <div className="absolute bottom-6 left-0 right-0 text-center font-black text-yellow-500 text-sm">{top3[0].points}</div>
                      </div>
                   </div>
                )}

                {/* 3rd Place */}
                {top3[2] && (
                   <div className="flex flex-col items-center w-1/3 max-w-[120px] animate-in slide-in-from-bottom-12 duration-700 delay-300 cursor-pointer" onClick={() => handleUserClick(top3[2].uid)}>
                      <div className="relative mb-4 group">
                         <div className="w-14 h-14 md:w-16 md:h-16 rounded-full p-1 bg-gradient-to-br from-amber-600 to-amber-800 shadow-xl relative z-10 group-hover:scale-110 transition-all">
                             <img src={top3[2].photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3[2].uid}`} className="w-full h-full object-cover rounded-full border-2 border-gray-900 bg-gray-800" alt="" />
                         </div>
                         <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-800 text-white text-[10px] font-black px-3 py-0.5 rounded-full shadow-lg border border-amber-600">#3</div>
                      </div>
                      <p className="font-black text-[10px] md:text-xs text-amber-200 text-center mb-1 line-clamp-1 w-full">{top3[2].displayName}</p>
                      <div className="w-full h-16 md:h-24 bg-gradient-to-t from-amber-900/60 to-amber-800/20 rounded-t-[2rem] border-t border-amber-600/20 backdrop-blur-sm relative overflow-hidden group">
                          <div className="absolute inset-0 bg-amber-600/5 group-hover:bg-amber-600/10 transition-colors"></div>
                          <div className="absolute bottom-4 left-0 right-0 text-center font-black text-amber-600 text-xs">{top3[2].points}</div>
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
                         className={`flex items-center p-3 md:p-4 rounded-2xl border transition-all duration-300 cursor-pointer group ${
                             isMe 
                             ? 'bg-primary/20 border-primary/50 shadow-[0_0_25px_rgba(21,101,192,0.2)]' 
                             : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                         }`}
                     >
                         <div className="w-8 font-mono font-black text-slate-500 text-center mr-4 group-hover:text-white transition-colors">
                             {rank}
                         </div>
                         <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl p-0.5 mr-4 transition-transform group-hover:scale-105 ${isMe ? 'bg-primary shadow-lg' : 'bg-slate-800'}`}>
                             <img src={u.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`} alt="" className="w-full h-full object-cover rounded-lg bg-slate-900" />
                         </div>
                         <div className="flex-1 min-w-0">
                             <p className={`font-black text-sm md:text-base truncate ${isMe ? 'text-white' : 'text-slate-200'}`}>
                                {u.displayName}
                             </p>
                             <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase truncate">{u.college || 'Institution Info Missing'}</p>
                         </div>
                         <div className="flex items-center gap-3 ml-2">
                             <div className="text-right">
                                <span className={`font-mono font-black text-sm md:text-lg block ${isMe ? 'text-primary' : 'text-slate-300'}`}>
                                    {u.points}
                                </span>
                                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">POINTS</span>
                             </div>
                             <ChevronRight size={16} className="text-slate-700 group-hover:text-slate-400 transition-colors"/>
                         </div>
                     </div>
                   )
                })}
                {others.length === 0 && top3.length > 0 && (
                   <p className="text-center py-10 text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">No one else on the list</p>
                )}
             </div>
           </>
        )}
      </div>

      {/* Floating Personal Rank Card */}
      {myData && (
        <div className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-8 md:w-80 z-50">
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-4 shadow-2xl flex items-center gap-4 group animate-in slide-in-from-bottom-10 duration-700">
                <div className="relative">
                    <img src={myData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${myData.uid}`} className="w-12 h-12 rounded-2xl object-cover border-2 border-primary" alt=""/>
                    <div className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-lg">#{myRank}</div>
                </div>
                <div className="flex-1">
                    <p className="text-xs font-black text-white/50 uppercase tracking-widest">Your Rank</p>
                    <p className="text-sm font-black text-white truncate">{myData.displayName}</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-black text-primary flex items-center justify-end gap-1">
                        <Zap size={14} className="fill-current"/> {myData.points}
                    </p>
                    <button onClick={() => navigate('/profile')} className="text-[10px] font-black text-white/40 hover:text-white transition-colors uppercase flex items-center gap-1">Profile <ArrowRight size={10}/></button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

const ArrowRight = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;

export default LeaderboardPage;
