import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Archive,
  Flame,
  Settings,
  Brain,
  Crown,
  X,
  Target,
  LogOut,
  Moon,
  Sun,
  Share2,
  Sparkles,
  Clock,
  ChevronRight,
  Settings as SettingsIcon,
  Check,
  Shield,
  FileText,
  RefreshCcw,
  Type,
  Laptop,
  Bookmark,
  ChevronDown,
  User,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { usePreferences } from "../contexts/PreferencesContext";
import { useLanguage } from "../contexts/LanguageContext";
import { fetchUserStatsAPI, fetchLeaderboardAPI } from "../services/api";
import { useCache } from "../contexts/CacheContext";
import { LeaderboardUser } from "../types";
import { toBengaliNumber } from "../utils/numberUtils";
import BottomSheet from "./BottomSheet";
import Lottie from "lottie-react";
import fireAnimation from "../assets/lottie/fire.json";

// --- CONSTANTS & MOCK DATA ---

// Custom SVG Icon Component for Dashboard Stats

const HomeDashboard: React.FC<{
  themeMode?: "light" | "dark" | "system";
  toggleTheme?: (mode?: "light" | "dark" | "system") => void;
}> = ({ themeMode = "system", toggleTheme }) => {
  const navigate = useNavigate();
  const { currentUser, userAvatar, logout } = useAuth();
  const { getCache, setCache } = useCache();
  const { questionFont, setQuestionFont, questionFontSize, setQuestionFontSize } = usePreferences();
  const { language, setLanguage } = useLanguage();
  const [isQuestionDisplayExpanded, setIsQuestionDisplayExpanded] = useState(false);

  const cacheKey = `dashboard_${currentUser?.uid}`;
  const cachedData = getCache(cacheKey) || {};

  const [stats, setStats] = useState<any>(cachedData.stats || null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [rank, setRank] = useState<number | null>(cachedData.rank || null);

  const [isLoading, setIsLoading] = useState(!cachedData.stats);

  const [showStreakModal, setShowStreakModal] = useState(false);

  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showDevNotice, setShowDevNotice] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("hide_dev_notice") !== "true";
    }
    return true;
  });

  const loadData = async () => {
    if (currentUser) {
      if (!stats) setIsLoading(true);
      try {
        const [statsData, leaderboardData] = await Promise.all([
          fetchUserStatsAPI(currentUser.uid).catch(() => null),
          fetchLeaderboardAPI().catch(() => []),
        ]);

        if (statsData) setStats(statsData);
        if (leaderboardData) setLeaderboard(leaderboardData);

        let userRank = null;
        if (leaderboardData && Array.isArray(leaderboardData)) {
          const r = leaderboardData.findIndex((u) => u.uid === currentUser.uid);
          if (r !== -1) {
            userRank = r + 1;
            setRank(userRank);
          }
        }

        setCache(cacheKey, {
          stats: statsData,
          rank: userRank,
          greetingKey: getGreeting(),
        });
      } catch (e) {
        console.error("Dashboard data load error", e);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "greeting_morning";
    else if (hour < 17) return "greeting_afternoon";
    else return "greeting_evening";
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const currentStreak = stats?.currentStreak || 0;

  const topLearners = useMemo(() => {
    if (!leaderboard.length) return [];
    return leaderboard.slice(0, 5);
  }, [leaderboard]);

  const renderHeaderAvatar = () => {
    if (userAvatar && userAvatar.startsWith("http")) {
      return (
        <img
          src={userAvatar}
          alt="Profile"
          className="w-full h-full rounded-full object-cover"
        />
      );
    }
    return (
      <div className="w-full h-full rounded-full flex items-center justify-center bg-primary text-white font-bold text-2xl">
        {currentUser?.displayName?.charAt(0).toUpperCase() || "U"}
      </div>
    );
  };

  const DashboardSkeleton = () => (
    <div className="max-w-5xl mx-auto px-3 pt-4 pb-20 space-y-4 animate-pulse">
      <div className="bg-white dark:bg-black rounded-3xl p-4 border border-gray-200 dark:border-white/[0.05]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gray-200 dark:bg-white/[0.05] rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-gray-200 dark:bg-white/[0.05] rounded"></div>
            <div className="h-3 w-24 bg-gray-200 dark:bg-white/[0.05] rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="h-16 bg-gray-200 dark:bg-white/[0.05] rounded-2xl"></div>
          <div className="h-16 bg-gray-200 dark:bg-white/[0.05] rounded-2xl"></div>
          <div className="h-16 bg-gray-200 dark:bg-white/[0.05] rounded-2xl"></div>
        </div>
      </div>
      <div className="w-full h-32 bg-gray-200 dark:bg-white/[0.05] rounded-3xl"></div>
    </div>
  );

  if (isLoading && !stats) return <DashboardSkeleton />;

  return (
    <div className="min-h-full bg-gray-50 dark:bg-black transition-colors pb-32 md:pb-40 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 pt-2 md:px-6 md:pt-4 space-y-4 md:space-y-6 animate-page-enter relative z-10">
        {/* --- CUSTOM CHORCHA TOP BAR --- */}
        <div className="relative flex items-center justify-between mb-2 md:mb-4">
          <div
            className="flex items-center gap-1.5 cursor-pointer z-10 hover:opacity-80 transition-opacity"
            onClick={() => setShowStreakModal(true)}
          >
            <div className="text-orange-500 dark:text-orange-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                id="fire"
                fill="currentColor"
                className="w-6 h-6 md:w-7 md:h-7"
              >
                <rect width="256" height="256" fill="none"></rect>
                <path d="M197.12793,66.60449c-13.07471-20.82129-29.90967-38.67578-44.65332-53.39355a7.99863,7.99863,0,0,0-12.87451,2.22168L108.74951,80.21875,76.47363,58.70117a7.99925,7.99925,0,0,0-11.104,2.23438C45.88135,90.31348,36,116.915,36,140a92,92,0,0,0,184,0C220,115.12207,212.51855,91.11426,197.12793,66.60449Zm-9.8335,82.61621a59.69692,59.69692,0,0,1-50.07275,50.07422,8.11543,8.11543,0,0,1-1.231.09473,8.00055,8.00055,0,0,1-1.21142-15.90723,44.31739,44.31739,0,0,0,36.70263-36.70312,7.99993,7.99993,0,1,1,15.8125,2.4414Z"></path>
              </svg>
            </div>
            <span className="font-black text-gray-800 dark:text-gray-200 text-lg md:text-xl tracking-tight mt-0.5">
              {toBengaliNumber(currentStreak)}
            </span>
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img
              src="/letterlogo.svg"
              alt="Porikkhangon Logo"
              className="h-10 md:h-12 logo-dark-mode"
            />
          </div>

          <motion.div
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full cursor-pointer overflow-hidden border-2 border-gray-200 dark:border-white/10 z-10 bg-white dark:bg-zinc-900"
            onClick={() => setShowProfileMenu(true)}
          >
            {renderHeaderAvatar()}
          </motion.div>
        </div>

        {/* --- PROMO BANNER --- */}
        <div className="mb-6 relative w-full rounded-[20px] overflow-hidden shadow-lg border border-gray-100 dark:border-white/5">
          <img
            src="/banner.png"
            alt="Promo Banner"
            className="w-full h-auto object-cover block"
            draggable={false}
          />
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex flex-wrap justify-center gap-y-10 gap-x-4 md:gap-x-12">
            <div
              onClick={() => navigate("/qbank")}
              className="flex flex-col items-center gap-2 cursor-pointer group active-scale transition-all w-[70px] md:w-[100px]"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                <img
                  src="/icons/question-bank.svg"
                  alt="QBank"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-bold text-gray-800 dark:text-gray-200 text-[11px] md:text-sm text-center leading-tight">
                প্রশ্ন ব্যাংক
              </span>
            </div>
            <div
              onClick={() =>
                navigate("/quiz", { state: { mode: "RAPID_FIRE" } })
              }
              className="flex flex-col items-center gap-2 cursor-pointer group active-scale transition-all w-[70px] md:w-[100px]"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                <img
                  src="/icons/flash-card.svg"
                  alt="Flash Cards"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-bold text-gray-800 dark:text-gray-200 text-[11px] md:text-sm text-center leading-tight">
                ফ্ল্যাশ কার্ড
              </span>
            </div>
            <div
              onClick={() => navigate("/quiz")}
              className="flex flex-col items-center gap-2 cursor-pointer group active-scale transition-all w-[70px] md:w-[100px]"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                <img
                  src="/icons/model-test.svg"
                  alt="Model Test"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-bold text-gray-800 dark:text-gray-200 text-[11px] md:text-sm text-center leading-tight">
                মডেল টেস্ট
              </span>
            </div>
            <div
              onClick={() => navigate("/battle")}
              className="flex flex-col items-center gap-2 cursor-pointer group active-scale transition-all w-[70px] md:w-[100px]"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                <img
                  src="/icons/battle-new.svg"
                  alt="Battle"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-bold text-gray-800 dark:text-gray-200 text-[11px] md:text-sm text-center leading-tight">
                ব্যাটল
              </span>
            </div>
            <div
              onClick={() => navigate("/saved-questions")}
              className="flex flex-col items-center gap-2 cursor-pointer group active-scale transition-all w-[70px] md:w-[100px]"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                <img
                  src="/icons/saved-questions.svg"
                  alt="Saved Questions"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-bold text-gray-800 dark:text-gray-200 text-[11px] md:text-sm text-center leading-tight">
                সেভ্ড
              </span>
            </div>
            <div
              onClick={() => navigate("/wrong-questions")}
              className="flex flex-col items-center gap-2 cursor-pointer group active-scale transition-all w-[70px] md:w-[100px]"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                <img
                  src="/icons/wrong-questions.svg"
                  alt="Wrong Questions"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-bold text-gray-800 dark:text-gray-200 text-[11px] md:text-sm text-center leading-tight">
                ভুল প্রশ্ন
              </span>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showDevNotice && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
              className="w-full bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-500/10 dark:to-blue-500/5 rounded-3xl p-5 md:p-6 border border-indigo-100 dark:border-indigo-500/20 flex items-start gap-4 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

              <button
                onClick={() => {
                  setShowDevNotice(false);
                  localStorage.setItem("hide_dev_notice", "true");
                }}
                className="absolute top-4 right-4 p-1.5 text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors z-10"
              >
                <X size={18} />
              </button>

              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400">
                <Sparkles size={24} />
              </div>
              <div className="space-y-1 pr-6">
                <h3 className="text-base md:text-lg font-black text-indigo-900 dark:text-indigo-100 font-tiro">
                  আমরা এখনো গড়ে উঠছি!
                </h3>
                <p className="text-xs md:text-sm text-indigo-700/80 dark:text-indigo-300/70 font-medium leading-relaxed font-tiro">
                  আমাদের প্ল্যাটফর্মটি বর্তমানে ডেভেলপমেন্ট (Beta) পর্যায়ে
                  রয়েছে। সব ফিচার এখনও পরিপূর্ণ নয়, তবে আমরা দিনরাত কাজ করছি
                  আপনার পড়াশোনাকে আরও সহজ করতে। খুব শীঘ্রই এটি আপনার জন্য একটি
                  পূর্ণাঙ্গ ডিজিটাল টিউটর হয়ে উঠবে। আমাদের সাথে থাকার জন্য
                  ধন্যবাদ!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden mb-8 group cursor-pointer transition-all hover:shadow-md hover:border-gray-200 dark:hover:border-white/20"
          onClick={() => navigate("/leaderboard")}
        >
          <div className="px-5 py-4 md:px-6 md:py-5 border-b border-gray-50 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 shadow-sm">
                <Trophy size={18} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                  লিডারবোর্ড
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium tracking-wide">
                  শীর্ষ পারফর্মার
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl md:text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                {rank ? `#${toBengaliNumber(rank)}` : "-"}
              </div>
              <div className="text-[10px] text-gray-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                আপনার র‍্যাঙ্ক
              </div>
            </div>
          </div>

          <div className="p-3 md:p-4 space-y-2">
            {topLearners.length === 0 ? (
              <div className="text-center text-gray-400 dark:text-zinc-500 text-xs py-8 font-medium">
                No data available
              </div>
            ) : (
              (() => {
                const displayUsers: any[] = [];
                const top3 = topLearners.slice(0, 3);
                let currentUserInTop3 = false;
                
                top3.forEach((u, idx) => {
                  displayUsers.push({ user: u, currentRank: idx + 1, isMe: currentUser?.uid === u.uid });
                  if (currentUser?.uid === u.uid) currentUserInTop3 = true;
                });
                
                if (!currentUserInTop3 && currentUser && rank && rank > 0) {
                   const myStats = { 
                     uid: currentUser.uid, 
                     displayName: currentUser.displayName, 
                     photoURL: currentUser.photoURL || userAvatar, 
                     college: stats?.college || "Student",
                     points: stats?.points || 0
                   };
                   displayUsers.push({ isDivider: true });
                   displayUsers.push({ user: myStats, currentRank: rank, isMe: true });
                }

                return displayUsers.map((item, idx) => {
                  if (item.isDivider) {
                    return (
                      <div key={`divider-${idx}`} className="flex justify-center py-2 opacity-50">
                        <div className="flex gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-zinc-600"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-zinc-600"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-zinc-600"></div>
                        </div>
                      </div>
                    );
                  }

                  const { user: u, currentRank, isMe } = item;
                  
                  let rankBadge = "bg-gray-100 text-gray-500 border-gray-200 dark:bg-white/5 dark:text-zinc-400 dark:border-white/5";
                  if (currentRank === 1) rankBadge = "bg-yellow-50 text-yellow-600 border-yellow-200 shadow-sm dark:bg-yellow-500/10 dark:text-yellow-500 dark:border-yellow-500/20";
                  else if (currentRank === 2) rankBadge = "bg-slate-50 text-slate-600 border-slate-200 shadow-sm dark:bg-zinc-500/10 dark:text-zinc-300 dark:border-white/10";
                  else if (currentRank === 3) rankBadge = "bg-orange-50 text-orange-600 border-orange-200 shadow-sm dark:bg-orange-500/10 dark:text-orange-500 dark:border-orange-500/20";
                  else if (isMe) rankBadge = "bg-blue-50 text-blue-600 border-blue-200 shadow-sm dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";

                  return (
                    <div
                      key={`user-${currentRank}-${idx}`}
                      className={`flex items-center justify-between p-3 rounded-2xl transition-all border ${isMe ? "bg-blue-50/50 dark:bg-blue-500/5 border-blue-100 dark:border-blue-500/10 shadow-sm" : "bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-white/[0.02]"}`}
                    >
                      <div className="flex items-center gap-3 md:gap-4">
                        <div
                          className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center text-[13px] md:text-sm font-bold border ${rankBadge}`}
                        >
                          {toBengaliNumber(currentRank)}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {u.photoURL && u.photoURL !== "false" ? (
                              <img
                                src={u.photoURL}
                                alt=""
                                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-100 dark:bg-zinc-800 object-cover shadow-sm ring-2 ring-white dark:ring-zinc-900"
                              />
                            ) : (
                              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold shadow-sm ring-2 ring-white dark:ring-zinc-900">
                                {u.displayName?.charAt(0) || "U"}
                              </div>
                            )}
                            {currentRank === 1 && (
                              <div className="absolute -top-1.5 -right-1.5 text-yellow-500 drop-shadow-sm bg-white dark:bg-zinc-900 rounded-full p-0.5">
                                <Crown size={12} fill="currentColor" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span
                              className={`text-sm md:text-base font-semibold ${isMe ? "text-blue-700 dark:text-blue-400" : "text-gray-800 dark:text-gray-200"}`}
                            >
                              {isMe ? (u.displayName ? `${u.displayName} (আপনি)` : "আপনি") : u.displayName}
                            </span>
                            <span className="text-[11px] text-gray-500 dark:text-zinc-500 font-medium truncate max-w-[120px]">
                              {u.college || "Student"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm md:text-base font-bold text-gray-900 dark:text-gray-100 block tabular-nums">
                          {toBengaliNumber(u.points || 0)}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-zinc-500 uppercase tracking-wider">
                          পয়েন্ট
                        </span>
                      </div>
                    </div>
                  );
                });
              })()
            )}
          </div>
        </div>
      </div>

      {/* PORTAL: Streak Modal */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {showStreakModal && (
              <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm h-[100dvh] overflow-hidden">
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="bg-[#131F24] w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:rounded-[2rem] relative overflow-y-auto overflow-x-hidden no-scrollbar block pb-[2rem]"
                >
                  {/* Header */}
                  <div className="w-full flex items-center justify-between p-4 sm:p-6 mb-2 sticky top-0 bg-[#131F24] z-50">
                    <button
                      onClick={() => setShowStreakModal(false)}
                      className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                      <X size={28} strokeWidth={2.5} />
                    </button>
                    <h2 className="text-xl font-bold text-white tracking-wide">
                      ধারাবাহিকতা
                    </h2>
                    <button className="p-2 -mr-2 text-white hover:bg-white/10 rounded-full transition-colors">
                      <Share2 size={24} strokeWidth={2} />
                    </button>
                  </div>

                  {/* Huge Number & Flame */}
                  <div className="w-full px-8 mt-4 relative mb-12 flex justify-between items-start">
                    <div className="relative z-10 flex flex-col items-start mt-4">
                      <span
                        className={`text-[6rem] leading-none font-black tracking-tighter drop-shadow-xl ${stats?.currentStreak ? "text-[#FF9600]" : "text-gray-500"}`}
                        style={{ WebkitTextStroke: "3px rgba(255,150,0,0.2)" }}
                      >
                        {toBengaliNumber(stats?.currentStreak || 0)}
                      </span>
                      <span
                        className={`text-2xl font-bold mt-2 ${stats?.currentStreak ? "text-[#FF9600]" : "text-gray-500/80"}`}
                      >
                        দিনের ধারাবাহিকতা
                      </span>
                    </div>

                    {/* Giant Background Flame Graphic */}
                    <div className="absolute right-0 top-0 w-48 h-48 pointer-events-none translate-x-4 -translate-y-4">
                      {stats?.currentStreak ? (
                        <div className="w-full h-full scale-[1.35] origin-top-right translate-x-4">
                          <Lottie
                            animationData={fireAnimation}
                            loop={true}
                            className="w-full h-full drop-shadow-[0_0_30px_rgba(255,150,0,0.6)]"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-full h-full opacity-50 bg-gray-700"
                          style={{
                            maskImage: "url(/icons/streak.svg)",
                            WebkitMaskImage: "url(/icons/streak.svg)",
                            maskSize: "contain",
                            maskRepeat: "no-repeat",
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <div className="w-full px-4 sm:px-6 z-20">
                    {/* Motivational Box */}
                    <div className="bg-gradient-to-br from-[#202F36] to-[#1A262C] rounded-2xl p-5 mb-8 flex items-start gap-4 shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-[#FF9600]/20 relative overflow-hidden">
                      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#FF9600]/10 rounded-full blur-3xl pointer-events-none"></div>
                      <div className="shrink-0 mt-1 relative z-10">
                        {stats?.currentStreak ? (
                          <div className="w-12 h-12 -ml-1 -mt-1 flex items-center justify-center">
                            <Lottie
                              animationData={fireAnimation}
                              loop={true}
                              className="w-full h-full drop-shadow-[0_0_15px_rgba(255,150,0,0.8)] scale-150"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center text-white">
                            <Target size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 relative z-10">
                        <p className="text-white font-bold leading-snug text-[15px]">
                          {stats?.currentStreak
                            ? "দুর্দান্ত! আজকের প্র্যাকটিস সম্পন্ন করে আপনার ধারাবাহিকতা ধরে রাখুন! এভাবেই এগিয়ে যান!"
                            : "ধারাবাহিকতাকে এগিয়ে যেতে আজই একটি লেসন শেষ করুন!"}
                        </p>
                        {!stats?.currentStreak && (
                          <button
                            onClick={() => {
                              setShowStreakModal(false);
                              navigate("/quiz");
                            }}
                            className="text-[#38BDF8] font-bold text-left tracking-wide uppercase text-sm mt-1"
                          >
                            লেসন শুরু করুন
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Calendar Header */}
                    <h3 className="text-2xl font-black text-white mb-4 drop-shadow-md">
                      ধারাবাহিকতার ক্যালেন্ডার
                    </h3>

                    {/* Calendar Card */}
                    <div className="bg-gradient-to-b from-[#202F36] to-[#162127] rounded-3xl p-5 md:p-6 border border-[#FF9600]/20 shadow-[0_8px_30px_rgba(0,0,0,0.5)] mb-8 relative overflow-hidden">
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#FF9600] to-transparent"></div>
                      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#FF9600]/10 rounded-full blur-[80px] pointer-events-none"></div>

                      <div className="flex justify-between items-center mb-6 px-2 relative z-10">
                        <button className="text-gray-400 hover:text-white transition-colors">
                          <ChevronRight size={24} className="rotate-180" />
                        </button>
                        <span className="text-lg font-bold text-white tracking-wide">
                          জুন ২০২৬
                        </span>
                        <button className="text-gray-400 hover:text-white transition-colors">
                          <ChevronRight size={24} />
                        </button>
                      </div>

                      {/* Calendar Grid Header */}
                      <div className="grid grid-cols-7 gap-2 mb-4 text-center relative z-10">
                        {[
                          "রবি",
                          "সোম",
                          "মঙ্গল",
                          "বুধ",
                          "বৃহঃ",
                          "শুক্র",
                          "শনি",
                        ].map((day) => (
                          <span
                            key={day}
                            className="text-[11px] font-black text-gray-400 uppercase tracking-wider"
                          >
                            {day}
                          </span>
                        ))}
                      </div>

                      {/* 35 days grid placeholder */}
                      <div className="grid grid-cols-7 gap-y-5 gap-x-2 text-center pb-2 relative z-10">
                        {Array.from({ length: 30 }).map((_, i) => {
                          const dayStr = String(i + 1).padStart(2, "0");
                          const dateKey = `2026-06-${dayStr}`;
                          const isActive =
                            stats?.activityLog?.includes(dateKey) || i === 6; // Mock active for visualization as per image
                          const isToday = i === 6;

                          return (
                            <div
                              key={i}
                              className="flex flex-col items-center justify-center"
                            >
                              {isActive ? (
                                <div
                                  className={`relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shadow-sm transition-all duration-300 ${isToday ? "bg-gradient-to-br from-[#FFB800] to-[#FF9600] text-black ring-4 ring-[#FF9600]/30 shadow-[0_0_15px_rgba(255,150,0,0.6)] scale-110" : "bg-[#FF9600]/15 text-[#FFB800] border border-[#FF9600]/50 shadow-[0_0_10px_rgba(255,150,0,0.2)]"}`}
                                >
                                  {toBengaliNumber(i + 1)}
                                  <div className="absolute -bottom-1 -right-1 bg-[#162127] rounded-full p-0.5">
                                    <div className="bg-[#FF9600] text-black rounded-full w-3.5 h-3.5 flex items-center justify-center">
                                      <Check size={10} strokeWidth={4} />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-gray-500 hover:text-white hover:bg-gray-800 transition-colors">
                                  {toBengaliNumber(i + 1)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}

      {/* PORTAL: Action Sheet (Bottom Sheet) */}
      {typeof document !== "undefined" &&
        showActionSheet &&
        createPortal(
          <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-end justify-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowActionSheet(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 100) setShowActionSheet(false);
                }}
                className="relative w-full md:max-w-xl bg-white dark:bg-black rounded-t-[2.5rem] p-6 pb-[2.5rem] border-t border-gray-100 dark:border-white/5 shadow-2xl overflow-y-auto max-h-[90dvh]"
              >
                <div className="w-12 h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full mx-auto mb-6 shrink-0" />
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 text-center">
                  কুইক মেনু
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: Settings, label: "সেটিংস", path: "/settings" },
                    { icon: Clock, label: "ইতিহাস", path: "/history" },
                    { icon: Target, label: "লক্ষ্য", path: "/profile" },
                  ].map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setShowActionSheet(false);
                        navigate(item.path);
                      }}
                      className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors"
                    >
                      <item.icon size={20} />
                      <span className="text-xs font-bold">{item.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          </AnimatePresence>,
          document.body,
        )}

      {/* --- ADVANCED PROFILE & SETTINGS BOTTOM SHEET --- */}
      <BottomSheet
        isOpen={showProfileMenu}
        onClose={() => setShowProfileMenu(false)}
        title="অ্যাকাউন্ট ও সেটিংস"
      >
        <div className="space-y-5 pb-6">
          {/* User Info Header Section (No nested card, just a beautiful clean section) */}
          <div className="flex items-center justify-between gap-4 p-1.5">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20 dark:border-primary/40 shadow-sm shrink-0 bg-primary/5 flex items-center justify-center">
                  {renderHeaderAvatar()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-950 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-emerald-100 dark:bg-emerald-300 rounded-full animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-lg text-gray-900 dark:text-zinc-100 tracking-tight leading-tight">
                  {currentUser?.displayName || "শিক্ষার্থী"}
                </span>
                <span className="text-xs text-gray-400 dark:text-zinc-500 truncate mt-0.5 font-medium">
                  {currentUser?.email || ""}
                </span>
                <div className="flex items-center mt-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-black text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border border-orange-200/50 dark:border-orange-900/30 px-2.5 py-0.5 rounded-full shadow-2xs">
                    <Flame size={12} className="fill-orange-500 text-orange-500" />
                    {toBengaliNumber(currentStreak)} দিনের স্ট্রিক
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowProfileMenu(false);
                navigate("/profile");
              }}
              className="shrink-0 px-3.5 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary dark:text-primary-400 text-xs font-black transition-all"
            >
              প্রোফাইল দেখুন
            </button>
          </div>

          <div className="h-px bg-gray-100 dark:bg-zinc-800/80" />

          {/* Core Menu Actions (Sleek List - Borderless, separated by subtle lines) */}
          <div className="space-y-0.5">
            {[
              {
                icon: Bookmark,
                label: "সেভ করা প্রশ্নসমূহ",
                desc: "আপনার বুকমার্ক করা গুরুত্বপূর্ণ প্রশ্ন",
                path: "/saved-questions",
                color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30",
              },
              {
                icon: AlertCircle,
                label: "ভুল প্রশ্নের তালিকা",
                desc: "পুনরায় অনুশীলনের জন্য ভুল উত্তরসমূহ",
                path: "/wrong-questions",
                color: "text-rose-500 bg-rose-50 dark:bg-rose-950/30",
              },
              {
                icon: Clock,
                label: "পরীক্ষার ইতিহাস ও রেজাল্ট",
                desc: "পূর্ববর্তী পরীক্ষার ফলাফল ও বিশ্লেষণ",
                path: "/history",
                color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30",
              },
            ].map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate(item.path);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-all text-left group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-transparent ${item.color}`}>
                    <item.icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800 dark:text-zinc-200 group-hover:text-primary dark:group-hover:text-primary-400 transition-colors">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-zinc-500 truncate mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300 dark:text-zinc-600 group-hover:text-gray-600 dark:group-hover:text-zinc-400 shrink-0 ml-2 transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>

          <div className="h-px bg-gray-100 dark:bg-zinc-800/80" />

          {/* Preferences Group */}
          <div className="space-y-4">
            {/* Theme Selector */}
            <div className="flex items-center justify-between gap-4 py-1">
              <div className="flex flex-col">
                <span className="text-xs font-black text-gray-800 dark:text-zinc-200">
                  অ্যাপ থিম
                </span>
                <span className="text-[10px] text-gray-400 dark:text-zinc-500">
                  আপনার পছন্দের ইন্টারফেস থিম নির্বাচন করুন
                </span>
              </div>
              <div className="flex bg-gray-100 dark:bg-zinc-800/80 p-0.5 rounded-full border border-gray-200/40 dark:border-zinc-700/40">
                {[
                  { mode: "light" as const, icon: Sun, label: "লাইট" },
                  { mode: "dark" as const, icon: Moon, label: "ডার্ক" },
                  { mode: "system" as const, icon: Laptop, label: "সিস্টেম" },
                ].map((item) => (
                  <button
                    key={item.mode}
                    type="button"
                    onClick={() => toggleTheme && toggleTheme(item.mode)}
                    className={`flex items-center gap-1 py-1.5 px-3 rounded-full text-[10px] font-black transition-all ${
                      themeMode === item.mode
                        ? "bg-white dark:bg-zinc-700 text-primary dark:text-white shadow-xs border border-gray-200/50"
                        : "text-gray-400 hover:text-gray-600 dark:text-zinc-400 dark:hover:text-zinc-200"
                    }`}
                  >
                    <item.icon size={11} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex items-center justify-between gap-4 py-1">
              <div className="flex flex-col">
                <span className="text-xs font-black text-gray-800 dark:text-zinc-200">
                  ভাষা (Language)
                </span>
                <span className="text-[10px] text-gray-400 dark:text-zinc-500">
                  সিলেক্ট করুন আপনার ভাষা
                </span>
              </div>
              <div className="flex bg-gray-100 dark:bg-zinc-800/80 p-0.5 rounded-full border border-gray-200/40 dark:border-zinc-700/40">
                {[
                  { lang: "bn" as const, label: "বাংলা" },
                  { lang: "en" as const, label: "English" },
                ].map((item) => (
                  <button
                    key={item.lang}
                    type="button"
                    onClick={() => setLanguage(item.lang)}
                    className={`py-1.5 px-3 rounded-full text-[10px] font-black transition-all ${
                      language === item.lang
                        ? "bg-white dark:bg-zinc-700 text-primary dark:text-white shadow-xs border border-gray-200/50"
                        : "text-gray-400 hover:text-gray-600 dark:text-zinc-400"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Typography & Display Font */}
            <div className="border-t border-gray-100 dark:border-zinc-800/80 pt-3">
              <button
                type="button"
                onClick={() => setIsQuestionDisplayExpanded(!isQuestionDisplayExpanded)}
                className="w-full flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Type size={15} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-800 dark:text-zinc-200">
                      প্রশ্ন ডিসপ্লে ও ফন্ট সেটিংস
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">
                      {questionFont === "font-noto" ? "আধুনিক (Noto Sans)" : "ক্লাসিক (Tiro)"} •{" "}
                      {questionFontSize === "text-sm" ? "ছোট" : questionFontSize === "text-base" ? "স্বাভাবিক" : questionFontSize === "text-lg" ? "বড়" : "অতিরিক্ত বড়"}
                    </p>
                  </div>
                </div>
                <div className={`p-1 text-gray-400 transition-transform duration-200 ${isQuestionDisplayExpanded ? "rotate-180" : ""}`}>
                  <ChevronDown size={14} />
                </div>
              </button>

              {isQuestionDisplayExpanded && (
                <div className="pt-3.5 space-y-3 pl-11">
                  {/* Font Choice */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                      ফন্ট স্টাইল
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {(["font-noto", "font-tiro"] as const).map((fontOption) => (
                        <button
                          key={fontOption}
                          type="button"
                          onClick={() => setQuestionFont(fontOption)}
                                                    className={`py-2 px-3 rounded-xl border text-center transition-all ${
                            questionFont === fontOption
                              ? "bg-purple-50 dark:bg-purple-950/40 border-purple-300 text-purple-700 dark:text-purple-300 font-bold shadow-xs"
                              : "bg-gray-50/50 dark:bg-zinc-800/40 border-gray-100 dark:border-zinc-800 text-gray-500"
                          }`}
                        >
                          <span className={`text-xs block ${fontOption}`}>পরীক্ষাঙ্গন</span>
                          <span className="text-[9px] opacity-70">
                            {fontOption === "font-noto" ? "Modern Noto" : "Classic Tiro"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Size */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                      টেক্সট সাইজ
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { size: "text-sm" as const, label: "ছোট" },
                        { size: "text-base" as const, label: "স্বাভাবিক" },
                        { size: "text-lg" as const, label: "বড়" },
                        { size: "text-xl" as const, label: "অতিরিক্ত" },
                      ].map((item) => (
                        <button
                          key={item.size}
                          type="button"
                          onClick={() => setQuestionFontSize(item.size)}
                          className={`py-1.5 text-[10px] font-black rounded-lg border text-center transition-all ${
                            questionFontSize === item.size
                              ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                              : "bg-gray-50/50 dark:bg-zinc-800/40 border-gray-100 dark:border-zinc-800 text-gray-500"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-gray-100 dark:bg-zinc-800/80" />

          {/* Legal and App Info Footer */}
          <div className="flex flex-col gap-3.5 pt-1">
            <div className="flex items-center justify-center gap-3 text-[11px] font-semibold text-gray-400 dark:text-zinc-500">
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate("/privacy");
                }}
                className="hover:text-primary dark:hover:text-zinc-300 transition-colors"
              >
                প্রাইভেসি পলিসি
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate("/terms");
                }}
                className="hover:text-primary dark:hover:text-zinc-300 transition-colors"
              >
                ব্যবহারের শর্তাবলী
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate("/refund");
                }}
                className="hover:text-primary dark:hover:text-zinc-300 transition-colors"
              >
                রিফান্ড পলিসি
              </button>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={async () => {
                setShowProfileMenu(false);
                await logout();
              }}
              className="w-full py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100/60 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-black text-xs flex items-center justify-center gap-2 transition-all border border-rose-100 dark:border-rose-950/50 shadow-2xs"
            >
              <LogOut size={13} />
              <span>লগআউট করুন</span>
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};

export default HomeDashboard;
