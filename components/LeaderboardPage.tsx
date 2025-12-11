
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchLeaderboardAPI } from '../services/api';
import { LeaderboardUser } from '../types';
import { Trophy, Crown, Shield, Star, Award, Zap, Flame, Hexagon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LEAGUES = [
  { id: 'NOVICE', name: 'Novice', min: 0, max: 999, color: 'text-slate-500', gradient: 'from-slate-600 to-slate-800', icon: Shield },
  { id: 'APPRENTICE', name: 'Apprentice', min: 1000, max: 3999, color: 'text-emerald-500', gradient: 'from-emerald-600 to-teal-800', icon: Shield },
  { id: 'SCHOLAR', name: 'Scholar', min: 4000, max: 9999, color: 'text-blue-500', gradient: 'from-blue-600 to-indigo-900', icon: Star },
  { id: 'ELITE', name: 'Elite', min: 10000, max: 24999, color: 'text-violet-500', gradient: 'from-violet-600 to-purple-900', icon: Award },
  { id: 'MASTER', name: 'Master', min: 25000, max: 49999, color: 'text-rose-500', gradient: 'from-rose-600 to-red-900', icon: Crown },
  { id: 'GRANDMASTER', name: 'Grandmaster', min: 50000, max: 99999, color: 'text-amber-500', gradient: 'from-amber-500 to-orange-700', icon: Trophy },
  { id: 'TITAN', name: 'Titan', min: 100000, max: Infinity, color: 'text-cyan-400', gradient: 'from-cyan-500 via-blue-600 to-purple-900', icon: Hexagon }, // Ultimate League
];

const LeaderboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLeagueId, setActiveLeagueId] = useState('NOVICE');

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchLeaderboardAPI();
        setUsers(data);
        
        // Auto-select league based on user's points
        if (currentUser) {
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
  
  const filteredUsers = users.filter(u => u.points >= activeLeague.min && u.points <= activeLeague.max);
  // Sort specifically for this view to ensure ordering is correct within the filtered subset
  filteredUsers.sort((a, b) => b.points - a.points);
  
  const top3 = filteredUsers.slice(0, 3);
  const others = filteredUsers.slice(3);

  const handleUserClick = (uid: string) => {
      navigate(`/profile/${uid}`);
  };

  return (
    <div className="h-full overflow-y-auto bg-[#0f172a] text-white p-0 relative">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b ${activeLeague.gradient} opacity-20 blur-[100px] transition-all duration-700`}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto pb-20 px-4 md:px-8">
        
        {/* Header */}
        <div className="text-center pt-8 mb-8">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4 animate-in fade-in slide-in-from-top-4">
              <Flame size={14} className="text-orange-500 animate-pulse" />
              <span className="text-xs font-bold tracking-widest uppercase text-slate-300">Season 1 Ranking</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 drop-shadow-sm mb-2">
             Leaderboard
           </h1>
           <p className="text-slate-400 text-sm">Be consistent to reach the <span className="text-cyan-400 font-bold">Titan</span> league.</p>
        </div>

        {/* League Tabs */}
        <div className="flex justify-center mb-10">
            <div className="flex overflow-x-auto p-1.5 gap-2 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 no-scrollbar max-w-full">
            {LEAGUES.map(league => {
                const Icon = league.icon;
                const isActive = activeLeagueId === league.id;
                return (
                <button
                    key={league.id}
                    onClick={() => setActiveLeagueId(league.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] md:text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                        isActive 
                        ? `bg-gradient-to-r ${league.gradient} text-white shadow-lg ring-1 ring-white/20` 
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
           <div className="text-center py-20">
               <div className="w-12 h-12 border-4 border-slate-700 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
               <p className="text-slate-500 text-sm">Loading ranks...</p>
           </div>
        ) : filteredUsers.length === 0 ? (
           <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 text-slate-500">
              <Trophy size={48} className="mx-auto mb-4 opacity-20" />
              <p>No players have reached the {activeLeague.name} league yet.</p>
              <p className="text-xs mt-2">Earn {activeLeague.min} points to enter!</p>
           </div>
        ) : (
           <>
             {/* Podium (Top 3) */}
             {top3.length > 0 && (
                <div className="flex justify-center items-end gap-3 md:gap-6 mb-12 min-h-[280px]">
                   {/* 2nd Place */}
                   {top3[1] && (
                      <div className="flex flex-col items-center w-1/3 md:w-32 animate-in slide-in-from-bottom-10 delay-100 cursor-pointer" onClick={() => handleUserClick(top3[1].uid)}>
                         <div className="relative mb-3 group">
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full p-1 bg-gradient-to-br from-slate-300 to-slate-500 shadow-xl relative z-10 group-hover:scale-105 transition-transform duration-300">
                                <img src={top3[1].photoURL} className="w-full h-full object-cover rounded-full border-2 border-slate-900" alt={top3[1].displayName} />
                            </div>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg border border-slate-600">#2</div>
                         </div>
                         <div className="text-center mb-2">
                            <p className="font-bold text-xs md:text-sm text-slate-200 truncate w-20">{top3[1].displayName.split(' ')[0]}</p>
                            <p className="text-[10px] md:text-xs text-slate-400 font-bold">{top3[1].points} pts</p>
                         </div>
                         <div className="w-full h-24 md:h-28 bg-gradient-to-t from-slate-800/80 to-slate-700/30 rounded-t-2xl border-t border-slate-500/20 backdrop-blur-sm relative overflow-hidden group">
                             <div className="absolute inset-0 bg-slate-400/5 group-hover:bg-slate-400/10 transition-colors"></div>
                         </div>
                      </div>
                   )}

                   {/* 1st Place */}
                   {top3[0] && (
                      <div className="flex flex-col items-center w-1/3 md:w-36 z-10 animate-in slide-in-from-bottom-10 cursor-pointer" onClick={() => handleUserClick(top3[0].uid)}>
                         <div className="mb-2 relative group">
                            <Crown size={32} className="text-yellow-400 animate-bounce absolute -top-10 left-1/2 -translate-x-1/2 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]" fill="currentColor" />
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full p-1 bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 shadow-2xl shadow-yellow-900/50 relative z-10 group-hover:scale-105 transition-transform duration-300">
                                <img src={top3[0].photoURL} className="w-full h-full object-cover rounded-full border-2 border-slate-900" alt={top3[0].displayName} />
                            </div>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-yellow-950 text-xs font-bold px-3 py-0.5 rounded shadow-lg border border-yellow-400">#1</div>
                         </div>
                         <div className="text-center mb-3 mt-1">
                            <p className="font-bold text-sm md:text-base text-yellow-100 truncate w-28">{top3[0].displayName.split(' ')[0]}</p>
                            <p className="text-xs text-yellow-500 font-bold">{top3[0].points} pts</p>
                         </div>
                         <div className="w-full h-32 md:h-40 bg-gradient-to-t from-yellow-900/40 to-yellow-600/10 rounded-t-2xl border-t border-yellow-500/20 backdrop-blur-md relative overflow-hidden group shadow-[0_-10px_40px_-15px_rgba(234,179,8,0.1)]">
                             <div className="absolute inset-0 bg-yellow-400/5 group-hover:bg-yellow-400/10 transition-colors"></div>
                             <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                                <Trophy size={32} className="text-yellow-500/30" />
                             </div>
                         </div>
                      </div>
                   )}

                   {/* 3rd Place */}
                   {top3[2] && (
                      <div className="flex flex-col items-center w-1/3 md:w-32 animate-in slide-in-from-bottom-10 delay-200 cursor-pointer" onClick={() => handleUserClick(top3[2].uid)}>
                         <div className="relative mb-3 group">
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full p-1 bg-gradient-to-br from-amber-600 to-amber-800 shadow-xl relative z-10 group-hover:scale-105 transition-transform duration-300">
                                <img src={top3[2].photoURL} className="w-full h-full object-cover rounded-full border-2 border-slate-900" alt={top3[2].displayName} />
                            </div>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-800 text-amber-100 text-[10px] font-bold px-2 py-0.5 rounded shadow-lg border border-amber-700">#3</div>
                         </div>
                         <div className="text-center mb-2">
                            <p className="font-bold text-xs md:text-sm text-slate-200 truncate w-20">{top3[2].displayName.split(' ')[0]}</p>
                            <p className="text-[10px] md:text-xs text-amber-600 font-bold">{top3[2].points} pts</p>
                         </div>
                         <div className="w-full h-20 md:h-24 bg-gradient-to-t from-amber-900/60 to-amber-800/20 rounded-t-2xl border-t border-amber-600/20 backdrop-blur-sm relative overflow-hidden group">
                             <div className="absolute inset-0 bg-amber-600/5 group-hover:bg-amber-600/10 transition-colors"></div>
                         </div>
                      </div>
                   )}
                </div>
             )}

             {/* Ranking List */}
             <div className="space-y-3 pb-10">
                {others.length > 0 ? (
                   others.map((u, idx) => {
                      const isMe = currentUser?.uid === u.uid;
                      const globalRank = idx + 4; // Since we sliced top 3
                      return (
                        <div 
                            key={u.uid} 
                            onClick={() => handleUserClick(u.uid)}
                            className={`flex items-center p-3 md:p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                                isMe 
                                ? 'bg-indigo-600/20 border-indigo-500/50 shadow-[0_0_20px_rgba(79,70,229,0.15)]' 
                                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                            }`}
                        >
                            <div className="w-8 font-mono font-bold text-slate-500 text-center mr-4">
                                {globalRank}
                            </div>
                            <div className={`w-10 h-10 rounded-full p-0.5 mr-4 ${isMe ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                                <img src={u.photoURL} alt="User" className="w-full h-full object-cover rounded-full bg-slate-900" />
                            </div>
                            <div className="flex-1">
                                <p className={`font-bold text-sm ${isMe ? 'text-white' : 'text-slate-300'}`}>
                                {u.displayName}
                                {isMe && <span className="ml-2 text-[9px] bg-indigo-500 text-white px-1.5 py-0.5 rounded font-bold tracking-wide uppercase">YOU</span>}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap size={14} className={isMe ? 'text-indigo-400' : 'text-slate-600'} fill="currentColor" />
                                <span className={`font-mono font-bold ${isMe ? 'text-white' : 'text-slate-400'}`}>
                                    {u.points}
                                </span>
                            </div>
                        </div>
                      )
                   })
                ) : top3.length > 0 ? (
                   <p className="text-center py-8 text-slate-600 text-xs uppercase tracking-widest">End of List</p>
                ) : null}
             </div>
           </>
        )}

      </div>
    </div>
  );
};

export default LeaderboardPage;
