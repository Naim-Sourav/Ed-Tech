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
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
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
  toggleTheme?: () => void;
}> = ({ themeMode = "system", toggleTheme }) => {
  const navigate = useNavigate();
  const { currentUser, userAvatar, logout } = useAuth();
  const { getCache, setCache } = useCache();

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

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const banners = [
    {
      title: "ভুল করা প্রশ্নগুলো রিভিশন দিয়ে\nপ্রস্তুতি করো শতভাগ",
      tag: "SMART RETAKE 🔄",
      buttonText: "Review Now",
      bgGradient: "from-rose-950 to-red-900",
      image: "/icons/wrong.svg",
      onClick: () => navigate("/wrong-questions"),
      badgeGradient: "from-rose-500 to-red-600",
    },
    {
      title: "লিডারবোর্ডে নিজের অবস্থান\nযাচাই করো অন্যদের সাথে",
      tag: "LEADERBOARD 🏆",
      buttonText: "View Rank",
      bgGradient: "from-amber-950 to-orange-900",
      image: "/icons/ranking.svg",
      onClick: () => navigate("/leaderboard"),
      badgeGradient: "from-amber-500 to-orange-500",
    },
    {
      title: "বন্ধুদের সাথে লাইভ ব্যাটল\nকরে নিজেকে যাচাই করো",
      tag: "QUIZ BATTLE ⚔️",
      buttonText: "Join Battle",
      bgGradient: "from-indigo-950 to-blue-900",
      image: "/icons/battle.png",
      onClick: () => navigate("/battle"),
      badgeGradient: "from-indigo-500 to-blue-500",
    },
    {
      title: "কঠিন প্রশ্নগুলো সেভ করে রাখো\nপরবর্তীতে দেখার জন্য",
      tag: "SAVED ARCHIVE 📚",
      buttonText: "View Saved",
      bgGradient: "from-emerald-950 to-teal-900",
      image: "/icons/save.png",
      onClick: () => navigate("/saved-questions"),
      badgeGradient: "from-emerald-500 to-teal-500",
    },
  ];

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovered, banners.length]);

  const paginate = (newDirection: number) => {
    let nextIndex = currentBannerIndex + newDirection;
    if (nextIndex < 0) nextIndex = banners.length - 1;
    if (nextIndex >= banners.length) nextIndex = 0;
    setCurrentBannerIndex(nextIndex);
  };

  const currentBanner = banners[currentBannerIndex];

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

        {/* --- PROMO BANNER CAROUSEL --- */}
        <div
          className="mb-6 relative w-full touch-pan-y"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBannerIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = Math.abs(offset.x) * velocity.x;
                if (swipe < -10000 || offset.x < -50) {
                  paginate(1);
                } else if (swipe > 10000 || offset.x > 50) {
                  paginate(-1);
                }
              }}
              className={`bg-gradient-to-r ${currentBanner.bgGradient} rounded-[20px] p-5 text-white relative overflow-hidden flex items-center justify-between shadow-lg cursor-grab active:cursor-grabbing`}
            >
              <div
                className="z-10 relative space-y-2.5 flex-1 pr-2"
                onClick={currentBanner.onClick}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`bg-gradient-to-r ${currentBanner.badgeGradient} px-3 py-0.5 rounded text-[10px] sm:text-xs font-black italic tracking-wider shadow-sm uppercase border border-white/20 cursor-pointer`}
                  >
                    {currentBanner.tag}
                  </span>
                </div>
                <h2 className="text-sm md:text-base font-bold leading-tight whitespace-pre-line cursor-pointer">
                  {currentBanner.title}
                </h2>
                <button className="bg-white text-gray-900 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-gray-100 transition-colors cursor-pointer">
                  {currentBanner.buttonText}
                </button>
              </div>
              <div
                className="w-24 h-24 sm:w-28 sm:h-28 relative z-10 shrink-0 flex items-center justify-center cursor-pointer"
                onClick={currentBanner.onClick}
              >
                {currentBanner.image === "/icons/battle.png" ? (
                  <img
                    src={currentBanner.image}
                    alt={currentBanner.tag}
                    className="w-full h-full object-contain drop-shadow-lg select-none"
                    draggable={false}
                  />
                ) : (
                  <div
                    className={`w-full h-full bg-gradient-to-br ${currentBanner.badgeGradient}`}
                    style={{
                      maskImage: `url(${currentBanner.image})`,
                      WebkitMaskImage: `url(${currentBanner.image})`,
                      maskSize: "contain",
                      WebkitMaskSize: "contain",
                      maskRepeat: "no-repeat",
                      WebkitMaskRepeat: "no-repeat",
                      maskPosition: "center",
                      WebkitMaskPosition: "center",
                    }}
                  />
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none rounded-[20px]"></div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
            {banners.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentBannerIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === currentBannerIndex ? "w-4 bg-white" : "w-1.5 bg-white/40"}`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex flex-wrap justify-center gap-y-10 gap-x-4 md:gap-x-12">
            <div
              onClick={() => navigate("/qbank")}
              className="flex flex-col items-center gap-2 cursor-pointer group active-scale transition-all w-[70px] md:w-[100px]"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                <img
                  src="/icons/qbank_bn.png"
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
                  src="/icons/flash.png"
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
                <div
                  className="w-full h-full bg-gradient-to-br from-amber-400 via-orange-500 to-primary"
                  style={{
                    maskImage: "url(/icons/customize.svg)",
                    WebkitMaskImage: "url(/icons/customize.svg)",
                    maskSize: "contain",
                    WebkitMaskSize: "contain",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskPosition: "center",
                    WebkitMaskPosition: "center",
                  }}
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
                  src="/icons/battle.png"
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
                <div
                  className="w-full h-full bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600"
                  style={{
                    maskImage: "url(/icons/save.png)",
                    WebkitMaskImage: "url(/icons/save.png)",
                    maskSize: "contain",
                    WebkitMaskSize: "contain",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskPosition: "center",
                    WebkitMaskPosition: "center",
                  }}
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
                <div
                  className="w-full h-full bg-gradient-to-br from-rose-500 via-red-600 to-orange-700"
                  style={{
                    maskImage: "url(/icons/wrong.svg)",
                    WebkitMaskImage: "url(/icons/wrong.svg)",
                    maskSize: "contain",
                    WebkitMaskSize: "contain",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskPosition: "center",
                    WebkitMaskPosition: "center",
                  }}
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
          className="rounded-[2.5rem] relative overflow-hidden group cursor-pointer shadow-2xl shadow-orange-900/10 hover:shadow-orange-500/10 active-scale transition-all border border-gray-100 dark:border-white/5"
          onClick={() => navigate("/leaderboard")}
        >
          <div className="bg-gradient-to-r from-gray-900 via-orange-950 to-gray-900 dark:from-gray-900 dark:via-zinc-900 dark:to-gray-900 p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/20 rounded-full blur-[80px] -mr-10 -mt-10 animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[60px] -ml-8 -mb-8"></div>

            <div className="flex justify-between items-center relative z-10">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <Trophy
                    size={24}
                    className="text-yellow-400 fill-yellow-400 animate-bounce-slow"
                  />
                  <h3 className="text-xl md:text-3xl font-black text-white tracking-tight uppercase drop-shadow-md">
                    লিডারবোর্ড
                  </h3>
                </div>
                <p className="text-[12px] md:text-xs text-orange-200 font-bold uppercase tracking-[0.2em] opacity-80">
                  সেরা ৫ পারফর্মার
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">
                  #{toBengaliNumber(rank) || "-"}
                </div>
                <div className="text-[12px] text-orange-200 font-bold uppercase tracking-widest opacity-80">
                  আপনার র‍্যাঙ্ক
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-4 md:p-6 space-y-3">
            {topLearners.length === 0 ? (
              <div className="text-center text-gray-400 dark:text-zinc-500 text-xs py-8 font-medium">
                No data available
              </div>
            ) : (
              topLearners.slice(0, 5).map((u, idx) => {
                const isMe = currentUser?.uid === u.uid;
                let rankBadge =
                  "bg-gray-100 text-gray-500 border-gray-200 dark:bg-white/5 dark:text-zinc-400 dark:border-white/5";
                if (idx === 0)
                  rankBadge =
                    "bg-yellow-100 text-yellow-700 border-yellow-200 shadow-sm shadow-yellow-200/50 dark:bg-yellow-500/10 dark:text-yellow-500 dark:border-yellow-500/20";
                else if (idx === 1)
                  rankBadge =
                    "bg-gray-200 text-gray-700 border-gray-300 shadow-sm dark:bg-zinc-500/10 dark:text-zinc-300 dark:border-white/10";
                else if (idx === 2)
                  rankBadge =
                    "bg-orange-100 text-orange-700 border-orange-200 shadow-sm shadow-orange-200/50 dark:bg-orange-500/10 dark:text-orange-500 dark:border-orange-500/20";

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${isMe ? "bg-orange-50/80 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20 shadow-sm" : "hover:bg-gray-50 dark:hover:bg-white/5 border-transparent hover:border-gray-100 dark:hover:border-white/5"}`}
                  >
                    <div className="flex items-center gap-4 md:gap-5">
                      <div
                        className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-xs md:text-sm font-black border ${rankBadge}`}
                      >
                        {toBengaliNumber(idx + 1)}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {u.photoURL && u.photoURL !== "false" ? (
                            <img
                              src={u.photoURL}
                              alt=""
                              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-100 dark:bg-zinc-800 object-cover border-2 border-white dark:border-white/10 shadow-sm"
                            />
                          ) : (
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold border-2 border-white dark:border-white/10 shadow-sm">
                              {u.displayName?.charAt(0) || "U"}
                            </div>
                          )}
                          {idx === 0 && (
                            <div className="absolute -top-2 -right-2 text-yellow-500 drop-shadow-sm">
                              <Crown size={16} fill="currentColor" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span
                            className={`text-sm md:text-base font-bold ${isMe ? "text-orange-600 dark:text-orange-400" : "text-gray-800 dark:text-gray-200"}`}
                          >
                            {isMe ? "আপনি" : u.displayName}
                          </span>
                          <span className="text-[12px] text-gray-400 dark:text-zinc-500 font-medium truncate max-w-[120px] uppercase tracking-wide">
                            {u.college || "Student"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base md:text-lg font-black text-gray-900 dark:text-gray-100 block tabular-nums tracking-tight">
                        {toBengaliNumber(u.points)}
                      </span>
                      <span className="text-[9px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                        পয়েন্ট
                      </span>
                    </div>
                  </div>
                );
              })
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
        createPortal(
          <AnimatePresence>
            {showActionSheet && (
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
                      { icon: Archive, label: "আর্কাইভ", path: "/qbank" },
                      {
                        icon: Trophy,
                        label: "অ্যাচিভমেন্ট",
                        path: "/leaderboard",
                      },
                      { icon: Brain, label: "এআই টিউটর", path: "/bot" },
                    ].map((item, i) => (
                      <motion.button
                        key={i}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setShowActionSheet(false);
                          setTimeout(() => navigate(item.path), 50);
                        }}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className="w-14 h-14 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-white/5">
                          <item.icon size={24} />
                        </div>
                        <span className="text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">
                          {item.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}

      {/* --- ADVANCED PROFILE & SETTINGS BOTTOM SHEET --- */}
      <BottomSheet
        isOpen={showProfileMenu}
        onClose={() => setShowProfileMenu(false)}
        title="অ্যাকাউন্ট ও সেটিংস"
      >
        <div className="space-y-6">
          {/* User Info Header */}
          <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700/20 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white dark:border-zinc-800 shadow-md shrink-0 bg-primary flex items-center justify-center">
              {renderHeaderAvatar()}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                {currentUser?.displayName || "User"}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {currentUser?.email || ""}
              </span>
              <div className="flex items-center gap-1 mt-1 text-xs font-bold text-orange-500">
                <Flame size={12} fill="currentColor" />{" "}
                {toBengaliNumber(currentStreak)} দিনের স্ট্রিক
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-1">
            {[
              {
                image: "/icons/user.svg",
                label: "আমার প্রোফাইল",
                path: "/profile",
                bg: "bg-blue-50 dark:bg-blue-500/10",
              },
              {
                image: "/icons/save.png",
                label: "সেভ করা প্রশ্নসমূহ",
                path: "/saved-questions",
                bg: "bg-emerald-50 dark:bg-emerald-500/10",
              },
              {
                image: "/icons/wrong.svg",
                label: "ভুল প্রশ্নের তালিকা",
                path: "/wrong-questions",
                bg: "bg-rose-50 dark:bg-rose-500/10",
              },
              {
                image: "/icons/history.svg",
                label: "পরীক্ষার হিস্ট্রি",
                path: "/history",
                bg: "bg-indigo-50 dark:bg-indigo-500/10",
              },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate(item.path);
                }}
                className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group text-left"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${item.bg}`}
                >
                  <img
                    src={item.image}
                    alt={item.label}
                    className="w-5 h-5 object-contain"
                  />
                </div>
                <span className="font-bold text-gray-800 dark:text-gray-200 flex-1">
                  {item.label}
                </span>
                <ChevronRight
                  size={18}
                  className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                />
              </button>
            ))}
          </div>

          <div className="h-px w-full bg-gray-100 dark:bg-zinc-900 my-4" />

          <div className="space-y-1 pb-[1rem]">
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group text-left"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 bg-amber-50 dark:bg-indigo-500/10 text-amber-500 dark:text-indigo-400">
                  {themeMode === "dark" ||
                  (themeMode === "system" &&
                    window.matchMedia("(prefers-color-scheme: dark)")
                      .matches) ? (
                    <Sun size={20} strokeWidth={2.5} />
                  ) : (
                    <Moon size={20} strokeWidth={2.5} />
                  )}
                </div>
                <span className="font-bold text-gray-800 dark:text-gray-200 flex-1">
                  {themeMode === "dark" ||
                  (themeMode === "system" &&
                    window.matchMedia("(prefers-color-scheme: dark)").matches)
                    ? "লাইট মোড"
                    : "ডার্ক মোড"}
                </span>
              </button>
            )}
            
            <button
              onClick={() => {
                setShowProfileMenu(false);
                navigate("/settings");
              }}
              className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group text-left"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-gray-400">
                <SettingsIcon size={20} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-gray-800 dark:text-gray-200 flex-1">
                অ্যাপ সেটিংস
              </span>
              <ChevronRight size={18} className="text-gray-400" />
            </button>

            <button
              onClick={() => {
                setShowProfileMenu(false);
                navigate("/privacy");
              }}
              className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group text-left"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-gray-400">
                <Shield size={20} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-gray-800 dark:text-gray-200 flex-1">
                প্রাইভেসি পলিসি
              </span>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
            
            <button
              onClick={() => {
                setShowProfileMenu(false);
                navigate("/terms");
              }}
              className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group text-left"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-gray-400">
                <FileText size={20} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-gray-800 dark:text-gray-200 flex-1">
                ব্যবহারের শর্তাবলী
              </span>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
            
            <button
              onClick={() => {
                setShowProfileMenu(false);
                navigate("/refund");
              }}
              className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group text-left"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-gray-400">
                <RefreshCcw size={20} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-gray-800 dark:text-gray-200 flex-1">
                রিফান্ড পলিসি
              </span>
              <ChevronRight size={18} className="text-gray-400" />
            </button>

            <div className="h-px w-full bg-gray-100 dark:bg-zinc-900 my-4" />

            <button
              onClick={async () => {
                setShowProfileMenu(false);
                await logout();
              }}
              className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors group text-left"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 bg-red-50 dark:bg-red-500/10 text-red-500">
                <LogOut size={20} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-red-500 flex-1">
                লগআউট করুন
              </span>
              <ChevronRight size={18} className="text-red-300" />
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};

export default HomeDashboard;
