import React, { useState, useEffect, useMemo } from "react";
import { logger } from '../utils/logger';
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Flame,
  Crown,
  X,
  Share2,
  Sparkles,
  ChevronRight,
  Check,
  Award,
  ClipboardList,
  Target,
  Play,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { fetchUserStatsAPI, fetchLeaderboardAPI } from "../services/api";
import { useCache } from "../contexts/CacheContext";
import { LeaderboardUser } from "../types";
import { toBengaliNumber } from "../utils/numberUtils";
import Lottie from "lottie-react";
import fireAnimation from "../assets/lottie/fire.json";

// --- QUICK ACCESS CONFIG (warm editorial tints; dark surfaces appended) ---
// Each item is presented as a polished "app tile": the colourful illustration
// fills a rounded app-icon surface, framed by a soft warm card + tinted hover glow.

const DARK_TILE = "dark:bg-white/[0.06] dark:border-white/10";

const QUICK_LINKS = [
  {
    icon: "/icons/question-bank.svg",
    label: "প্রশ্ন ব্যাংক",
    path: "/qbank",
    tint: `bg-mint/70 border-brand/15 ${DARK_TILE}`,
    glow: "hover:shadow-[0_18px_36px_-14px_rgba(255,82,0,0.45)]",
  },
  {
    icon: "/icons/flash-card.svg",
    label: "ফ্ল্যাশ কার্ড",
    path: "/quiz",
    state: { mode: "RAPID_FIRE" },
    tint: `bg-lime-soft/70 border-lime/25 ${DARK_TILE}`,
    glow: "hover:shadow-[0_18px_36px_-14px_rgba(255,185,46,0.5)]",
  },
  {
    icon: "/icons/model-test.svg",
    label: "মডেল টেস্ট",
    path: "/quiz",
    tint: `bg-cream border-brand/15 ${DARK_TILE}`,
    glow: "hover:shadow-[0_18px_36px_-14px_rgba(255,82,0,0.4)]",
  },
  {
    icon: "/icons/battle-new.svg",
    label: "ব্যাটল",
    path: "/battle",
    tint: `bg-amber-soft/80 border-gold/25 ${DARK_TILE}`,
    glow: "hover:shadow-[0_18px_36px_-14px_rgba(230,59,46,0.45)]",
  },
  {
    icon: "/icons/saved-questions.svg",
    label: "সেভ্ড",
    path: "/saved-questions",
    tint: `bg-mint/70 border-brand/15 ${DARK_TILE}`,
    glow: "hover:shadow-[0_18px_36px_-14px_rgba(255,82,0,0.4)]",
  },
  {
    icon: "/icons/wrong-questions.svg",
    label: "ভুল প্রশ্ন",
    path: "/wrong-questions",
    tint: `bg-cream border-brand/15 ${DARK_TILE}`,
    glow: "hover:shadow-[0_18px_36px_-14px_rgba(230,59,46,0.4)]",
  },
];

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const HomeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userAvatar } = useAuth();
  const { getCache, setCache } = useCache();

  const cacheKey = `dashboard_${currentUser?.uid}`;
  const cachedData = getCache(cacheKey) || {};

  const [stats, setStats] = useState<any>(cachedData.stats || null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [rank, setRank] = useState<number | null>(cachedData.rank || null);

  const [isLoading, setIsLoading] = useState(!cachedData.stats);

  const [showStreakModal, setShowStreakModal] = useState(false);

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
        logger.error("Dashboard data load error", e);
      } finally {
        setIsLoading(false);
      }
    }
  };


  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "শুভ সকাল";
    else if (hour < 17) return "শুভ দুপুর";
    else return "শুভ সন্ধ্যা";
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const currentStreak = stats?.currentStreak || 0;

  // Accuracy derived from real stats
  const accuracy = useMemo(() => {
    const total = (stats?.totalCorrect || 0) + (stats?.totalWrong || 0);
    return total > 0 ? Math.round(((stats?.totalCorrect || 0) / total) * 100) : 0;
  }, [stats]);

  // Last 7 days activity dots (from activityLog "YYYY-MM-DD" entries)
  const last7Days = useMemo(() => {
    const log: string[] = stats?.activityLog || [];
    const days: { key: string; active: boolean }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      days.push({ key, active: log.includes(key) });
    }
    return days;
  }, [stats]);

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
      <div className="w-full h-full rounded-full flex items-center justify-center ring-conic text-white font-bold text-2xl">
        {currentUser?.displayName?.charAt(0).toUpperCase() || "U"}
      </div>
    );
  };

  const DashboardSkeleton = () => (
    <div className="max-w-5xl mx-auto px-4 pt-4 pb-20 md:px-6 md:pt-6 space-y-4 md:space-y-5 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="w-16 h-8 bg-ink/10 dark:bg-white/10 rounded-full"></div>
        <div className="w-28 h-10 bg-ink/10 dark:bg-white/10 rounded-xl"></div>
        <div className="w-11 h-11 bg-ink/10 dark:bg-white/10 rounded-full"></div>
      </div>
      <div className="bg-ink/90 dark:bg-ink-2 rounded-[2rem] p-6 md:p-7">
        <div className="h-4 w-28 bg-white/20 rounded mb-3"></div>
        <div className="h-7 w-48 bg-white/20 rounded mb-2"></div>
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="h-16 bg-white/10 rounded-2xl"></div>
          <div className="h-16 bg-white/10 rounded-2xl"></div>
          <div className="h-16 bg-white/10 rounded-2xl"></div>
        </div>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-ink-2 border border-ink/8 dark:border-white/10 rounded-[1.4rem] p-2.5 space-y-2">
            <div className="w-full aspect-square bg-mint dark:bg-white/10 rounded-[1rem]"></div>
            <div className="h-3 w-3/4 mx-auto bg-ink/10 dark:bg-white/10 rounded"></div>
          </div>
        ))}
      </div>
      <div className="bg-ink/10 dark:bg-white/10 rounded-3xl h-24"></div>
      <div className="bg-white dark:bg-ink-2 rounded-3xl border border-ink/8 dark:border-white/10 p-4 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <div className="w-9 h-9 bg-ink/10 dark:bg-white/10 rounded-xl"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-32 bg-ink/10 dark:bg-white/10 rounded"></div>
              <div className="h-2.5 w-20 bg-ink/10 dark:bg-white/10 rounded"></div>
            </div>
            <div className="h-3.5 w-10 bg-ink/10 dark:bg-white/10 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading && !stats)
    return (
      <div className="pk-landing dash min-h-full bg-paper dark:bg-ink text-ink dark:text-paper">
        {<DashboardSkeleton />}
      </div>
    );

  return (
    <div className="pk-landing dash min-h-full bg-paper dark:bg-ink text-ink dark:text-paper pb-32 md:pb-40 relative overflow-hidden">
      {/* Ambient warm washes */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(255,82,0,0.10),transparent)] dark:opacity-70 blur-2xl" />
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-[radial-gradient(closest-side,rgba(255,185,46,0.16),transparent)] dark:opacity-60 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute top-72 -left-28 w-72 h-72 bg-[radial-gradient(closest-side,rgba(255,122,53,0.10),transparent)] dark:opacity-70 blur-3xl" />

      <div className="max-w-5xl mx-auto px-4 pt-3 md:px-6 md:pt-5 space-y-4 md:space-y-5 animate-page-enter relative z-10">
        {/* --- TOP BAR: Streak | Logo | Avatar --- */}
        <div className="relative flex items-center justify-between mb-1 md:mb-2">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setShowStreakModal(true)}
            className="focus-ring flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-full bg-white/70 dark:bg-white/10 backdrop-blur-md ring-1 ring-ink/10 dark:ring-white/15 shadow-sm hover:shadow transition-all z-10"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-brand/10 text-brand-deep dark:bg-brand/20 dark:text-brand-bright">
              <Flame size={15} fill="currentColor" />
            </span>
            <span className="font-black text-ink dark:text-paper text-sm md:text-base tracking-tight tabular-nums">
              {toBengaliNumber(currentStreak)}
            </span>
          </motion.button>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Light wordmark (black text + orange mark) for light mode */}
            <img
              src={`${import.meta.env.BASE_URL}letterlogo.svg`}
              alt="Porikkhangon Logo"
              className="h-10 md:h-12 dark:hidden"
            />
            {/* Warm-white wordmark (orange mark kept) so it stays visible on dark */}
            <img
              src={`${import.meta.env.BASE_URL}letterlogo-white.svg`}
              alt=""
              aria-hidden="true"
              className="h-10 md:h-12 hidden dark:block"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            className="focus-ring relative w-10 h-10 md:w-12 md:h-12 rounded-full cursor-pointer overflow-hidden shadow-md ring-2 ring-brand/40 z-10 bg-white dark:bg-ink-2"
            onClick={() => navigate("/account")}
            aria-label="অ্যাকাউন্ট"
          >
            {renderHeaderAvatar()}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-lime rounded-full border-2 border-paper dark:border-ink" />
          </motion.button>
        </div>

        {/* --- HERO: Greeting + Stats (dark editorial panel) --- */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="noise relative overflow-hidden rounded-[2rem] bg-ink dark:bg-ink-2 p-5 md:p-7 text-white shadow-[0_40px_80px_-40px_rgba(22,18,16,0.7)] dark:ring-1 dark:ring-white/10"
        >
          {/* conic glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
            style={{ background: "conic-gradient(from 120deg, rgba(255,82,0,0.0), rgba(255,82,0,0.45), rgba(255,185,46,0.3), rgba(255,82,0,0.0))" }}
          />
          <div aria-hidden className="pointer-events-none absolute -bottom-20 left-1/4 w-44 h-44 rounded-full bg-lime/10 blur-3xl" />
          <svg aria-hidden className="absolute right-3 top-3 w-16 h-16 md:w-20 md:h-20 text-white/10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 17.75l-6.172 3.245 1.179-6.873-4.993-4.867 6.9-1.002L12 2l3.086 6.253 6.9 1.002-4.993 4.867 1.179 6.873z" />
          </svg>

          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] md:text-xs font-black uppercase tracking-[0.18em] text-lime flex items-center gap-1.5">
                <Sparkles size={13} className="shrink-0" />
                {getGreeting()}
              </p>
              <h1 className="mt-1.5 font-bangla text-2xl md:text-3xl font-extrabold tracking-tight leading-tight truncate">
                {currentUser?.displayName || "শিক্ষার্থী"}
              </h1>
              <p className="mt-1 text-xs md:text-sm font-medium text-white/60 leading-relaxed">
                {"আজকের প্রস্তুতি শুরু হোক একটি পরীক্ষা দিয়ে!"}
              </p>
            </div>

            {/* Rank medallion */}
            <div className="shrink-0 flex flex-col items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-white/8 backdrop-blur-sm border border-white/15 shadow-lg">
              <Trophy size={16} className="text-lime mb-0.5" />
              <span className="font-display text-lg md:text-xl font-bold leading-none">
                {rank ? `#${toBengaliNumber(rank)}` : "-"}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/50 mt-0.5">র‍্যাঙ্ক</span>
            </div>
          </div>

          {/* Stat chips */}
          <div className="relative grid grid-cols-3 gap-2.5 md:gap-3 mt-5">
            {[
              { icon: Award, label: "পয়েন্ট", value: toBengaliNumber(stats?.points || 0) },
              { icon: ClipboardList, label: "পরীক্ষা", value: toBengaliNumber(stats?.totalExams || 0) },
              { icon: Target, label: "নির্ভুলতা", value: `${toBengaliNumber(accuracy)}%` },
            ].map((chip, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 md:gap-3 rounded-2xl bg-white/8 backdrop-blur-sm border border-white/10 px-3 py-2.5 md:py-3"
              >
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-brand/20 text-lime flex items-center justify-center shrink-0">
                  <chip.icon size={15} />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-base md:text-lg font-bold leading-none tabular-nums truncate">{chip.value}</p>
                  <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-white/50 mt-1">{chip.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate("/quiz")}
            className="focus-ring relative mt-4 inline-flex items-center gap-2 rounded-full bg-lime px-5 py-3 text-sm font-black text-ink shadow-[0_16px_36px_-14px_rgba(255,185,46,0.5)] transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Play size={15} fill="currentColor" />
            মডেল টেস্ট দিন
            <ArrowRight size={15} />
          </button>
        </motion.section>

        {/* --- PROMO BANNER --- */}
        <div className="relative w-full rounded-[1.75rem] overflow-hidden shadow-md ring-1 ring-ink/10 dark:ring-white/10 group">
          <img
            src={`${import.meta.env.BASE_URL}banner.png`}
            alt="Promo Banner"
            className="w-full h-auto object-cover block transition-transform duration-500 group-hover:scale-[1.02]"
            draggable={false}
          />
        </div>

        {/* --- QUICK ACCESS --- */}
        <section>
          <div className="flex items-center justify-between mb-2.5 md:mb-3 px-1">
            <h2 className="text-sm md:text-base font-black text-ink dark:text-paper tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-4 md:h-5 rounded-full bg-gradient-to-b from-brand to-gold" />
              দ্রুত অ্যাক্সেস
            </h2>
            <button
              onClick={() => navigate("/exams")}
              className="focus-ring text-[11px] md:text-xs font-black text-brand-deep hover:text-brand dark:text-brand-bright flex items-center gap-1 transition-colors"
            >
              পরীক্ষা জোন <ChevronRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5 md:gap-3">
            {QUICK_LINKS.map((item, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(item.path, { state: (item as any).state })}
                className={`focus-ring group relative overflow-hidden rounded-[1.4rem] border p-2 md:p-2.5 shadow-sm transition-all duration-300 hover:-translate-y-1 active:scale-95 ${item.tint} ${item.glow}`}
              >
                {/* App-tile surface: the illustration fills a rounded icon, like a launcher tile */}
                <div className="relative w-full aspect-square overflow-hidden rounded-[1rem] bg-white dark:bg-ink-3 shadow-sm ring-1 ring-ink/5 dark:ring-white/10 transition-transform duration-300 group-hover:scale-[1.06]">
                  <img
                    src={item.icon}
                    alt={item.label}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    draggable={false}
                  />
                  {/* soft top-light sheen */}
                  <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="pt-2 pb-0.5 text-center">
                  <span className="font-bold text-ink/80 dark:text-white/80 text-[11px] md:text-xs leading-tight transition-colors group-hover:text-brand-deep dark:group-hover:text-brand-bright">
                    {item.label}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* --- STREAK STRIP --- */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowStreakModal(true)}
          className="focus-ring w-full relative overflow-hidden rounded-3xl ring-1 ring-brand/15 dark:ring-white/10 bg-gradient-to-r from-cream via-amber-soft to-white dark:from-ink-2 dark:via-ink-2 dark:to-ink-3 p-4 md:p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all text-left group"
        >
          <div aria-hidden className="absolute -right-8 -top-10 w-36 h-36 bg-brand/10 rounded-full blur-2xl group-hover:bg-brand/20 transition-colors" />
          <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-2xl ring-conic flex items-center justify-center shadow-[0_10px_24px_-8px_rgba(224,68,0,0.5)] shrink-0">
            <Flame size={26} className="text-white fill-white/30" />
          </div>
          <div className="flex-1 min-w-0 relative">
            <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] text-brand-deep dark:text-brand-bright">
              ধারাবাহিকতা
            </p>
            <p className="text-sm md:text-base font-black text-ink dark:text-paper mt-0.5 leading-tight">
              <span className="font-display text-lg md:text-xl tabular-nums">{toBengaliNumber(currentStreak)}</span> দিন ধরে নিয়মিত প্র্যাকটিস করছেন!
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              {last7Days.map((d) => (
                <span
                  key={d.key}
                  title={d.key}
                  className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-colors ${
                    d.active ? "bg-brand shadow-[0_0_6px_rgba(255,82,0,0.5)]" : "bg-ink/15 dark:bg-white/20"
                  }`}
                />
              ))}
              <span className="text-[9px] md:text-[10px] font-bold text-mist ml-1.5 uppercase tracking-wider">
                গত ৭ দিন
              </span>
            </div>
          </div>
          <div className="relative p-2 rounded-full bg-white/80 dark:bg-white/10 text-brand-deep dark:text-brand-bright group-hover:translate-x-0.5 transition-transform shrink-0">
            <ChevronRight size={18} />
          </div>
        </motion.button>

        {/* --- DEV NOTICE --- */}
        <AnimatePresence>
          {showDevNotice && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
              className="w-full bg-mint dark:bg-ink-2 rounded-3xl p-5 md:p-6 ring-1 ring-brand/15 dark:ring-white/10 flex items-start gap-4 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

              <button
                onClick={() => {
                  setShowDevNotice(false);
                  localStorage.setItem("hide_dev_notice", "true");
                }}
                className="focus-ring absolute top-4 right-4 p-1.5 text-brand-deep/60 hover:text-brand-deep dark:text-white/40 dark:hover:text-white transition-colors z-10"
                aria-label="বন্ধ করো"
              >
                <X size={18} />
              </button>

              <div className="w-12 h-12 bg-brand text-white rounded-2xl flex items-center justify-center shrink-0 shadow-[0_10px_24px_-8px_rgba(224,68,0,0.5)]">
                <Sparkles size={24} />
              </div>
              <div className="space-y-1 pr-6">
                <h3 className="text-base md:text-lg font-black text-ink dark:text-paper font-bangla">
                  আমরা এখনো গড়ে উঠছি!
                </h3>
                <p className="text-xs md:text-sm text-ink/70 dark:text-white/70 font-medium leading-relaxed">
                  আমাদের প্ল্যাটফর্মটি বর্তমানে ডেভেলপমেন্ট (Beta) পর্যায়ে
                  রয়েছে। সব ফিচার এখনও পরিপূর্ণ নয়, তবে আমরা দিনরাত কাজ করছি
                  আপনার পড়াশোনাকে আরও সহজ করতে। খুব শীঘ্রই এটি আপনার জন্য একটি
                  পূর্ণাঙ্গ ডিজিটাল টিউটর হয়ে উঠবে। আমাদের সাথে থাকার জন্য
                  ধন্যবাদ!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- LEADERBOARD --- */}
        <div
          className="bg-white dark:bg-ink-2 rounded-3xl ring-1 ring-ink/8 dark:ring-white/10 shadow-sm overflow-hidden mb-6 group cursor-pointer transition-all hover:shadow-[0_24px_50px_-24px_rgba(22,18,16,0.3)] hover:ring-brand/20"
          onClick={() => navigate("/leaderboard")}
        >
          <div className="px-5 py-4 md:px-6 md:py-5 border-b border-ink/6 dark:border-white/10 flex justify-between items-center bg-gradient-to-r from-mint/60 to-transparent dark:from-white/5 dark:to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-ink dark:bg-lime text-lime dark:text-ink flex items-center justify-center shadow-md">
                <Trophy size={18} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-bold text-ink dark:text-paper tracking-tight font-bangla">
                  লিডারবোর্ড
                </h3>
                <p className="text-[11px] text-mist font-medium tracking-wide">
                  শীর্ষ পারফর্মার
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-display text-xl md:text-2xl font-bold text-brand-deep dark:text-brand-bright tracking-tight tabular-nums">
                  {rank ? `#${toBengaliNumber(rank)}` : "-"}
                </div>
                <div className="text-[10px] text-mist font-bold uppercase tracking-wider">
                  আপনার র‍্যাঙ্ক
                </div>
              </div>
              <div className="p-2 rounded-full bg-mint dark:bg-white/10 text-brand-deep dark:text-brand-bright group-hover:translate-x-0.5 transition-transform">
                <ChevronRight size={16} />
              </div>
            </div>
          </div>

          <div className="p-3 md:p-4 space-y-2">
            {topLearners.length === 0 ? (
              <div className="text-center text-mist text-xs py-8 font-medium">
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
                          <div className="w-1.5 h-1.5 rounded-full bg-ink/20 dark:bg-white/20"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-ink/20 dark:bg-white/20"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-ink/20 dark:bg-white/20"></div>
                        </div>
                      </div>
                    );
                  }

                  const { user: u, currentRank, isMe } = item;

                  let rankBadge = "bg-ink/5 text-mist border-ink/10 dark:bg-white/5 dark:border-white/10";
                  if (currentRank === 1) rankBadge = "bg-gold/20 text-ink border-gold/40 shadow-sm dark:bg-gold/20 dark:text-white dark:border-gold/40";
                  else if (currentRank === 2) rankBadge = "bg-ink/8 text-ink border-ink/15 shadow-sm dark:bg-white/10 dark:text-white dark:border-white/15";
                  else if (currentRank === 3) rankBadge = "bg-brand/10 text-brand-deep border-brand/25 shadow-sm dark:bg-brand/20 dark:text-brand-bright dark:border-brand/30";
                  else if (isMe) rankBadge = "bg-mint text-brand-deep border-brand/25 shadow-sm dark:bg-brand/20 dark:text-brand-bright dark:border-brand/30";

                  return (
                    <div
                      key={`user-${currentRank}-${idx}`}
                      className={`flex items-center justify-between p-3 rounded-2xl transition-all border ${isMe ? "bg-mint/60 border-brand/20 shadow-sm dark:bg-white/5 dark:border-brand/30" : "bg-transparent border-transparent hover:bg-paper dark:hover:bg-white/5"}`}
                    >
                      <div className="flex items-center gap-3 md:gap-4">
                        <div
                          className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center text-[13px] md:text-sm font-bold border tabular-nums ${rankBadge}`}
                        >
                          {toBengaliNumber(currentRank)}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {u.photoURL && u.photoURL !== "false" ? (
                              <img
                                src={u.photoURL}
                                alt=""
                                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-ink/5 dark:bg-white/10 object-cover shadow-sm ring-2 ring-paper dark:ring-ink-2"
                              />
                            ) : (
                              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full ring-conic flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-paper dark:ring-ink-2">
                                {u.displayName?.charAt(0) || "U"}
                              </div>
                            )}
                            {currentRank === 1 && (
                              <div className="absolute -top-1.5 -right-1.5 text-gold drop-shadow-sm bg-white dark:bg-ink-2 rounded-full p-0.5">
                                <Crown size={12} fill="currentColor" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span
                              className={`text-sm md:text-base font-semibold ${isMe ? "text-brand-deep dark:text-brand-bright" : "text-ink/85 dark:text-white/85"}`}
                            >
                              {isMe ? (u.displayName ? `${u.displayName} (আপনি)` : "আপনি") : u.displayName}
                            </span>
                            <span className="text-[11px] text-mist font-medium truncate max-w-[120px]">
                              {u.college || "Student"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-display text-sm md:text-base font-bold text-ink dark:text-paper block tabular-nums">
                          {toBengaliNumber(u.points || 0)}
                        </span>
                        <span className="text-[10px] text-mist uppercase tracking-wider">
                          পয়েন্ট
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
                      aria-label="বন্ধ করো"
                    >
                      <X size={28} strokeWidth={2.5} />
                    </button>
                    <h2 className="text-xl font-bold text-white tracking-wide">
                      ধারাবাহিকতা
                    </h2>
                    <button className="p-2 -mr-2 text-white hover:bg-white/10 rounded-full transition-colors" aria-label="শেয়ার">
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
                            <Flame size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 relative z-10">
                        <p className="text-white font-bold leading-snug text-[15px]">
                          {stats?.currentStreak
                            ? "দুর্দান্ত! আজকের প্র্যাকটিস সম্পন্ন করে আপনার ধারাবাহিকতা ধরে রাখুন! এভাবেই এগিয়ে যান!"
                            : "ধারাবাহিকতাকে এগিয়ে যেতে আজই একটি লেসন শেষ করুন!"}
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
                        <button className="text-gray-400 hover:text-white transition-colors" aria-label="আগের মাস">
                          <ChevronRight size={24} className="rotate-180" />
                        </button>
                        <span className="text-lg font-bold text-white tracking-wide">
                          জুন ২০২৬
                        </span>
                        <button className="text-gray-400 hover:text-white transition-colors" aria-label="পরের মাস">
                          <ChevronRight size={24} />
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-2 mb-4 text-center relative z-10">
                        {["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"].map((day) => (
                          <span key={day} className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                            {day}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-y-5 gap-x-2 text-center pb-2 relative z-10">
                        {Array.from({ length: 30 }).map((_, i) => {
                          const dayStr = String(i + 1).padStart(2, "0");
                          const dateKey = `2026-06-${dayStr}`;
                          const isActive = stats?.activityLog?.includes(dateKey) || i === 6;
                          const isToday = i === 6;

                          return (
                            <div key={i} className="flex flex-col items-center justify-center">
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
    </div>
  );
};

export default HomeDashboard;
