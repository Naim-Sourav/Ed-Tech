
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchLeaderboardAPI, normalizeText } from '../services/api';
import { LeaderboardUser } from '../types';
import { toBengaliNumber } from '../utils/numberUtils';
import { Crown, Zap, ChevronRight, ArrowRight, Medal, Search, RefreshCw, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCache } from '../contexts/CacheContext';
import { motion, AnimatePresence } from 'motion/react';
import EmptyState from './EmptyState';

const LeaderboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { getCache, setCache } = useCache();
  
  const cacheKey = 'leaderboard_state_v2';
  const cachedData = getCache(cacheKey) || {};

  const [users, setUsers] = useState<LeaderboardUser[]>(cachedData.users || []);
  const [loading, setLoading] = useState(!cachedData.users);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFloatingRank, setShowFloatingRank] = useState(false);
  const lastScrollY = React.useRef(0);

  // Update Cache when state changes
  useEffect(() => {
      setCache(cacheKey, { users });
  }, [users, setCache]);

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (!cachedData.users) setLoading(true);
      
      const data = await fetchLeaderboardAPI();
      // Sort by points descending
      const sortedData = [...data].sort((a, b) => b.points - a.points);
      setUsers(sortedData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Handle scroll to show/hide floating rank
  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (!mainContent) return;

    const handleScroll = () => {
      const currentScrollY = mainContent.scrollTop;
      const isScrollingUp = currentScrollY < lastScrollY.current;
      
      // Show floating rank if scrolling up and not at the top
      if (isScrollingUp && currentScrollY > 300) {
        setShowFloatingRank(true);
      } else if (currentScrollY <= 300 || !isScrollingUp) {
        setShowFloatingRank(false);
      }
      
      lastScrollY.current = currentScrollY;
    };

    mainContent.addEventListener('scroll', handleScroll);
    return () => mainContent.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to user's rank on load if they are not in top 10
  useEffect(() => {
    if (!loading && users.length > 0 && currentUser) {
      const myIndex = users.findIndex(u => u.uid === currentUser.uid);
      if (myIndex > 10) {
        setTimeout(() => {
          const mainContent = document.querySelector('main');
          if (mainContent) {
            mainContent.scrollTo({
              top: mainContent.scrollHeight,
              behavior: 'smooth'
            });
          }
        }, 500);
      }
    }
  }, [loading, users, currentUser]);

  // Filter users based on search
  const filteredUsers = useMemo(() => {
      if (!searchQuery.trim()) return users;
      const sQuery = normalizeText(searchQuery).toLowerCase();
      return users.filter(u => 
        normalizeText(u.displayName || '').toLowerCase().includes(sQuery) ||
        normalizeText(u.college || '').toLowerCase().includes(sQuery)
      );
  }, [users, searchQuery]);

  const top3 = filteredUsers.slice(0, 3);
  const others = filteredUsers.slice(3);
  
  const myData = users.find(u => u.uid === currentUser?.uid);
  const myRank = users.findIndex(u => u.uid === currentUser?.uid) + 1;

  const handleUserClick = (uid: string) => navigate(`/profile/${uid}`);

  // Skeleton Loader Component (matches HomeDashboard patterns)
  const LeaderboardSkeleton = () => (
    <div className="space-y-4 w-full animate-pulse">
      <div className="flex justify-center items-end gap-3 mb-6 md:mb-10 h-32 md:h-48 bg-white dark:bg-black p-4 rounded-3xl border border-gray-200 dark:border-white/[0.05]">
         <div className="w-20 h-[50%] bg-gray-200 dark:bg-white/[0.05] rounded-t-2xl"></div>
         <div className="w-24 h-[90%] bg-gray-200 dark:bg-white/[0.05] rounded-t-2xl"></div>
         <div className="w-20 h-[35%] bg-gray-200 dark:bg-white/[0.05] rounded-t-2xl"></div>
      </div>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center p-4 rounded-2xl border border-gray-155 dark:border-white/[0.05] bg-white dark:bg-black">
           <div className="w-8 h-6 bg-gray-200 dark:bg-white/[0.05] rounded mr-4"></div>
           <div className="w-12 h-12 bg-gray-200 dark:bg-white/[0.05] rounded-xl mr-4"></div>
           <div className="flex-1 space-y-1.55">
              <div className="h-4 w-32 bg-gray-200 dark:bg-white/[0.05] rounded mb-1"></div>
              <div className="h-3 w-20 bg-gray-200 dark:bg-white/[0.05] rounded"></div>
           </div>
           <div className="w-16 h-6 bg-gray-200 dark:bg-white/[0.05] rounded"></div>
        </div>
      ))}
    </div>
  );

  const renderAvatar = (user: LeaderboardUser, className: string, isRanked = false) => {
    if (user.photoURL && user.photoURL !== 'false') {
      return <img src={user.photoURL} className={className} alt={user.displayName} referrerPolicy="no-referrer" />;
    }
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 text-white font-bold uppercase ${isRanked ? 'text-2xl' : 'text-lg'}`}>
        {user.displayName?.charAt(0) || 'U'}
      </div>
    );
  };

  return (
    <div 
      className="min-h-full bg-[#F8F9FE] dark:bg-black text-gray-900 dark:text-white relative transition-colors duration-500"
    >
      {/* Premium Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[60%] h-[60%] bg-red-500/5 dark:bg-red-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-12 md:pt-8 relative z-10">
        
        {/* Top Action Bar */}
        <div className="flex justify-between items-center mb-4 md:mb-8">
           <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-900/50 backdrop-blur-xl shadow-sm border border-gray-100 dark:border-white/5">
              <Users size={14} className="text-primary" />
              <span className="text-[12px] font-bold text-gray-500 dark:text-zinc-400">{toBengaliNumber(users.length)} জন অংশগ্রহণকারী</span>
           </div>
           <motion.button 
             whileTap={{ scale: 0.9 }}
             onClick={() => loadData(true)}
             disabled={refreshing}
             className="p-2 rounded-full bg-white dark:bg-zinc-900/50 backdrop-blur-xl shadow-sm border border-gray-100 dark:border-white/5 text-gray-500 hover:text-primary transition-colors disabled:opacity-50"
           >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
           </motion.button>
        </div>

        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-2 md:mb-6"
        >
           <h1 className="text-xl md:text-4xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">লিডারবোর্ড</h1>
           <p className="hidden md:block text-gray-500 dark:text-gray-400 text-xs font-medium">পরীক্ষাঙ্গনের সেরা পারফর্মার</p>
        </motion.div>

        {/* Sticky Search Bar Container */}
        <div className="sticky top-0 z-30 py-1 md:py-4 bg-[#F8F9FE]/80 dark:bg-black/80 backdrop-blur-2xl -mx-4 px-4 mb-2 md:mb-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input 
              type="text"
              placeholder="খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 md:py-4 bg-white dark:bg-zinc-900/20 backdrop-blur-2xl border border-gray-200 dark:border-white/5 rounded-xl md:rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-xs md:text-sm font-medium"
            />
          </motion.div>
        </div>

        {loading ? (
           <LeaderboardSkeleton />
        ) : filteredUsers.length === 0 ? (
           <EmptyState
             icon={<Search size={28} className="text-gray-400" />}
             message="কোনো ব্যবহারকারী পাওয়া যায়নি! আপনার সার্চের সাথে মিল আছে এমন কেউ লিডারবোর্ডে অংশ নেয়নি।"
             actionText={searchQuery ? "সার্চ মুছুন" : undefined}
             onActionClick={searchQuery ? () => setSearchQuery('') : undefined}
           />
        ) : (
           <>
             {/* Podium (Top 3) - Only show if not searching or if search results include them */}
             {!searchQuery && (
               <div className="flex justify-center items-end gap-2 md:gap-8 mb-4 md:mb-16 px-2 min-h-[160px] md:min-h-[300px]">
                  {/* 2nd Place */}
                  {top3[1] && (
                    <motion.div 
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                      whileHover={{ y: -5 }}
                      className="flex flex-col items-center w-1/3 max-w-[120px] cursor-pointer" 
                      onClick={() => handleUserClick(top3[1].uid)}
                    >
                        <div className="relative mb-1 md:mb-4">
                          <div className="w-10 h-10 md:w-20 md:h-20 rounded-full p-0.5 md:p-1 bg-gradient-to-br from-slate-300 to-slate-500 shadow-xl relative z-10">
                              {renderAvatar(top3[1], "w-full h-full object-cover rounded-full border-2 border-white dark:border-black", true)}
                          </div>
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-slate-600 text-white text-[8px] md:text-[12px] font-black px-2 py-0.5 rounded-full shadow-lg border border-white/20">2</div>
                        </div>
                        <p className="font-bold text-[8px] md:text-xs text-gray-600 dark:text-gray-300 text-center mb-0.5 md:mb-2 line-clamp-1">{top3[1].displayName}</p>
                        <div className="w-full h-10 md:h-24 bg-white dark:bg-zinc-900/30 backdrop-blur-2xl rounded-t-xl md:rounded-t-2xl border-t border-x border-gray-100 dark:border-white/5 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-slate-400/30"></div>
                            <span className="text-slate-600 dark:text-slate-400 font-black text-[12px] md:text-xs">{top3[1].points}</span>
                            <span className="text-[6px] md:text-[8px] font-bold text-slate-400 uppercase">PTS</span>
                        </div>
                    </motion.div>
                  )}

                  {/* 1st Place */}
                  {top3[0] && (
                    <motion.div 
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      whileHover={{ y: -5 }}
                      className="flex flex-col items-center w-1/3 max-w-[140px] z-20 cursor-pointer" 
                      onClick={() => handleUserClick(top3[0].uid)}
                    >
                        <div className="mb-1 md:mb-4 relative">
                          <motion.div
                            animate={{ y: [0, -3, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute -top-5 md:-top-10 left-1/2 -translate-x-1/2"
                          >
                            <Crown size={16} className="md:size-32 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" fill="currentColor" />
                          </motion.div>
                          <div className="w-14 h-14 md:w-24 md:h-24 rounded-full p-1 md:p-1.5 bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 shadow-2xl shadow-yellow-500/30 relative z-10">
                              {renderAvatar(top3[0], "w-full h-full object-cover rounded-full border-2 border-white dark:border-black", true)}
                          </div>
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-[12px] md:text-xs font-black px-3 md:px-4 py-0.5 md:py-1 rounded-full shadow-xl border border-white/20">1</div>
                        </div>
                        <p className="font-bold text-[12px] md:text-sm text-yellow-600 dark:text-yellow-400 text-center mb-0.5 md:mb-2 line-clamp-1">{top3[0].displayName}</p>
                        <div className="w-full h-16 md:h-36 bg-white dark:bg-zinc-900/30 backdrop-blur-2xl rounded-t-2xl md:rounded-t-3xl border-t border-x border-yellow-100 dark:border-white/5 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 md:h-1.5 bg-yellow-400"></div>
                            <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/5 to-transparent"></div>
                            <span className="text-yellow-600 dark:text-yellow-500 font-black text-xs md:text-sm relative z-10">{top3[0].points}</span>
                            <span className="text-[7px] md:text-[9px] font-bold text-yellow-500/60 uppercase relative z-10">PTS</span>
                        </div>
                    </motion.div>
                  )}

                  {/* 3rd Place */}
                  {top3[2] && (
                    <motion.div 
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      whileHover={{ y: -5 }}
                      className="flex flex-col items-center w-1/3 max-w-[120px] cursor-pointer" 
                      onClick={() => handleUserClick(top3[2].uid)}
                    >
                        <div className="relative mb-1 md:mb-4">
                          <div className="w-8 h-8 md:w-16 md:h-16 rounded-full p-0.5 md:p-1 bg-gradient-to-br from-amber-600 to-amber-800 shadow-xl relative z-10">
                              {renderAvatar(top3[2], "w-full h-full object-cover rounded-full border-2 border-white dark:border-black", true)}
                          </div>
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-amber-700 text-white text-[8px] md:text-[12px] font-black px-2 py-0.5 rounded-full shadow-lg border border-white/20">3</div>
                        </div>
                        <p className="font-bold text-[8px] md:text-xs text-amber-700 dark:text-amber-500 text-center mb-0.5 md:mb-2 line-clamp-1">{top3[2].displayName}</p>
                        <div className="w-full h-8 md:h-20 bg-white dark:bg-zinc-900/30 backdrop-blur-2xl rounded-t-xl md:rounded-t-2xl border-t border-x border-gray-100 dark:border-white/5 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-amber-600/30"></div>
                            <span className="text-amber-700 dark:text-amber-600 font-black text-[12px] md:text-xs">{top3[2].points}</span>
                            <span className="text-[6px] md:text-[8px] font-bold text-amber-600/60 uppercase">PTS</span>
                        </div>
                    </motion.div>
                  )}
               </div>
             )}

             {/* List Section */}
             <div className="space-y-1 md:space-y-3 mb-32">
                <AnimatePresence mode="popLayout">
                  {(searchQuery ? filteredUsers : others).map((u, idx) => {
                    const isMe = currentUser?.uid === u.uid;
                    const rank = searchQuery ? users.findIndex(user => user.uid === u.uid) + 1 : idx + 4;
                    
                    return (
                      <motion.div 
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          whileTap={{ scale: 0.98 }}
                          key={u.uid} 
                          onClick={() => handleUserClick(u.uid)}
                          className={`flex items-center p-2 md:p-4 rounded-xl md:rounded-2xl border transition-all duration-300 cursor-pointer group ${
                              isMe 
                              ? 'bg-primary/5 dark:bg-primary/10 border-primary/30 shadow-md ring-1 ring-primary/20' 
                              : 'bg-white dark:bg-zinc-900/20 backdrop-blur-2xl border-gray-100 dark:border-white/5 hover:bg-white dark:hover:bg-zinc-900/40 hover:shadow-md'
                          }`}
                      >
                          <div className="w-8 md:w-10 flex flex-col items-center justify-center mr-1 md:mr-2">
                             {rank === 1 ? <Crown size={16} className="text-yellow-500" fill="currentColor" /> :
                              rank === 2 ? <Medal size={16} className="text-slate-400" fill="currentColor" /> :
                              rank === 3 ? <Medal size={16} className="text-amber-600" fill="currentColor" /> :
                              <span className="font-mono font-black text-gray-400 dark:text-zinc-600 text-xs md:text-sm">{toBengaliNumber(rank)}</span>}
                          </div>

                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl overflow-hidden mr-3 md:mr-4 shadow-sm border border-gray-100 dark:border-white/5">
                              {renderAvatar(u, "w-full h-full object-cover")}
                          </div>

                          <div className="flex-1 min-w-0">
                              <p className={`font-bold text-xs md:text-base truncate ${isMe ? 'text-primary dark:text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                                 {u.displayName}
                              </p>
                              <p className="text-[8px] md:text-[12px] text-gray-400 dark:text-gray-500 font-medium truncate">{u.college || 'Institution Info Missing'}</p>
                          </div>

                          <div className="flex items-center gap-2 md:gap-4 ml-1 md:ml-2">
                              <div className="text-right">
                                 <span className={`font-black text-xs md:text-base block ${isMe ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                                     {toBengaliNumber(u.points)}
                                 </span>
                                 <span className="text-[6px] md:text-[8px] font-bold text-gray-400 uppercase tracking-tighter">পয়েন্ট</span>
                              </div>
                              <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors"/>
                          </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
                
                {others.length === 0 && top3.length > 0 && !searchQuery && (
                   <div className="text-center py-12 opacity-40">
                      <p className="text-[12px] font-bold uppercase tracking-[0.3em]">End of list</p>
                   </div>
                )}
             </div>
           </>
        )}
      </div>

      {/* Floating Personal Rank Card */}
      <AnimatePresence>
        {myData && !loading && showFloatingRank && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-10 left-4 right-4 md:left-auto md:right-8 md:w-72 z-50"
          >
              <motion.div 
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/profile')}
                className="bg-white/90 dark:bg-black/90 backdrop-blur-2xl border border-gray-200 dark:border-white/5 rounded-2xl p-2.5 shadow-xl flex items-center gap-3 group cursor-pointer"
              >
                  <div className="relative">
                      {renderAvatar(myData, "w-9 h-9 rounded-xl object-cover border-2 border-primary shadow-sm")}
                      <div className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-lg border border-white/20">#{toBengaliNumber(myRank)}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">আপনার র‍্যাঙ্ক</p>
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{myData.displayName}</p>
                  </div>
                  <div className="text-right">
                      <p className="text-sm font-black text-primary flex items-center justify-end gap-1">
                          <Zap size={12} className="fill-current"/> {toBengaliNumber(myData.points)}
                      </p>
                      <div className="text-[8px] font-bold text-gray-400 group-hover:text-primary transition-colors uppercase flex items-center gap-1 justify-end">প্রোফাইল <ArrowRight size={8}/></div>
                  </div>
              </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeaderboardPage;
