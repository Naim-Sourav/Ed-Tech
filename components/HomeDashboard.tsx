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
import { DURATION, EASE } from "../utils/motionTokens";
import Lottie from "lottie-react";
import fireAnimation from "../assets/lottie/fire.json";
import LogoMark from "./landing/Logo";

// --- QUICK ACCESS CONFIG (warm editorial tints; dark surfaces appended) ---
const DARK_TILE = "dark:bg-white/[0.06] dark:border-white/10";

const QUICK_LINKS = [
  { icon: "/icons/question-bank.svg", label: "প্রশ্ন ব্যাংক", path: "/qbank", tint: `bg-mint/70 border-brand/15 ${DARK_TILE}` },
  { icon: "/icons/flash-card.svg", label: "ফ্ল্যাশ কার্ড", path: "/quiz", state: { mode: "RAPID_FIRE" }, tint: `bg-lime-soft/70 border-lime/25 ${DARK_TILE}` },
  { icon: "/icons/model-test.svg", label: "মডেল টেস্ট", path: "/quiz", tint: `bg-cream border-brand/15 ${DARK_TILE}` },
  { icon: "/icons/battle-new.svg", label: "ব্যাটল", path: "/battle", tint: `bg-amber-soft/80 border-gold/25 ${DARK_TILE}` },
  { icon: "/icons/saved-questions.svg", label: "সেভ্ড", path: "/saved-questions", tint: `bg-mint/70 border-brand/15 ${DARK_TILE}` },
  { icon: "/icons/wrong-questions.svg", label: "ভুল প্রশ্ন", path: "/wrong-questions", tint: `bg-cream border-brand/15 ${DARK_TILE}` },
];



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

  // --- Streak calendar (real data; the month grid used to be hardcoded to
  // "জুন ২০২৬" with a fixed 30 cells and `isToday = i === 6`) ---
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const shiftCalendarMonth = (delta: number) =>
    setCalendarMonth((prev) => {
      const d = new Date(prev.year, prev.month + delta, 1);
      const now = new Date();
      // never navigate past the current month
      if (d.getFullYear() > now.getFullYear() || (d.getFullYear() === now.getFullYear() && d.getMonth() > now.getMonth())) {
        return prev;
      }
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const isViewingCurrentMonth = useMemo(() => {
    const now = new Date();
    return calendarMonth.year === now.getFullYear() && calendarMonth.month === now.getMonth();
  }, [calendarMonth]);

  const calendarLabel = useMemo(() => {
    const MONTHS = [
      "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
      "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
    ];
    return `${MONTHS[calendarMonth.month]} ${toBengaliNumber(calendarMonth.year)}`;
  }, [calendarMonth]);

  const calendarCells = useMemo(() => {
    const { year, month } = calendarMonth;
    const log: string[] = stats?.activityLog || [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leadingBlanks = new Date(year, month, 1).getDay(); // 0 = Sunday
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const cells: ({ day: number; dateKey: string; active: boolean; isToday: boolean } | null)[] =
      Array.from({ length: leadingBlanks }, () => null);

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      cells.push({ day, dateKey, active: log.includes(dateKey), isToday: dateKey === todayKey });
    }
    return cells;
  }, [calendarMonth, stats]);

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
      <div className="bg-ink/90 dark:bg-ink-2 rounded-panel p-6 md:p-7">
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
          <div key={i} className="bg-white dark:bg-ink-2 border border-ink/8 dark:border-white/10 rounded-3xl p-4 space-y-3">
            <div className="w-12 h-12 bg-mint dark:bg-white/10 rounded-2xl"></div>
            <div className="h-3 w-3/4 bg-ink/10 dark:bg-white/10 rounded"></div>
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

          {/* Shared brand lockup — same mark + wordmark as the landing navbar,
              so the logo does not change between the public site and the app. */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="flex items-center gap-2" aria-label="পরীক্ষাঙ্গন" role="img">
              <LogoMark className="size-9 md:size-10" />
              <span className="font-display text-xl md:text-2xl font-bold tracking-tight text-ink dark:text-paper">
                পরীক্ষা<span className="text-gradient">ঙ্গন</span>
              </span>
            </span>
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
          transition={{ duration: DURATION.base, ease: EASE }}
          className="noise relative overflow-hidden rounded-panel bg-ink dark:bg-ink-2 p-5 md:p-7 text-white shadow-[0_40px_80px_-40px_rgba(22,18,16,0.7)] dark:ring-1 dark:ring-white/10"
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
              <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] text-lime flex items-center gap-1.5">
                <Sparkles size={13} className="shrink-0" />
                {getGreeting()}
              </p>
              <h1 className="mt-1.5 font-display text-2xl md:text-3xl font-bold tracking-tight leading-tight truncate">
                {currentUser?.displayName || "শিক্ষার্থী"}
              </h1>
              <p className="mt-1 text-xs md:text-sm font-medium text-white/75 leading-relaxed">
                {"আজকের প্রস্তুতি শুরু হোক একটি পরীক্ষা দিয়ে!"}
              </p>
            </div>

            {/* Rank medallion */}
            <div className="shrink-0 flex flex-col items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-white/8 backdrop-blur-sm border border-white/15 shadow-lg">
              <Trophy size={16} className="text-lime mb-0.5" />
              <span className="font-display text-lg md:text-xl font-bold leading-none">
                {rank ? `#${toBengaliNumber(rank)}` : "-"}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/75 mt-0.5">র‍্যাঙ্ক</span>
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
                  <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-white/75 mt-1">{chip.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate("/quiz")}
            className="focus-ring btn-shine group relative mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-brand-500/35 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-500/50 active:translate-y-0"
          >
            <Play size={15} fill="currentColor" />
            মডেল টেস্ট দিন
            <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </motion.section>

        {/* --- PROMO BANNER --- */}
        <div className="relative w-full rounded-card overflow-hidden shadow-md ring-1 ring-ink/10 dark:ring-white/10 group">
          <img
            src={`${import.meta.env.BASE_URL}banner.png`}
            alt="পরীক্ষাঙ্গনের নতুন ফিচার ও অফারের ঘোষণা"
            className="w-full h-auto object-cover block transition-transform duration-500 group-hover:scale-[1.02]"
            draggable={false}
          />
        </div>

        {/* --- QUICK ACCESS --- */}
        <section>
          <div className="flex items-center justify-between mb-2.5 md:mb-3 px-1">
            <h2 className="font-display text-sm md:text-base font-bold text-ink dark:text-paper tracking-tight flex items-center gap-2">
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
                className={`focus-ring group flex flex-col items-center gap-2.5 rounded-3xl border p-3 md:p-4 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_-24px_rgba(255,82,0,0.35)] hover:ring-1 hover:ring-brand/25 active:scale-95 ${item.tint}`}
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white dark:bg-ink-3 shadow-sm flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-105">
                  <img
                    src={item.icon}
                    alt={item.label}
                    className="w-9 h-9 md:w-11 md:h-11 object-contain"
                    referrerPolicy="no-referrer"
                    draggable={false}
                  />
                </div>
                <span className="font-bold text-ink/80 dark:text-white/80 text-[11px] md:text-xs text-center leading-tight">
                  {item.label}
                </span>
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
                <h3 className="font-display text-base md:text-lg font-bold text-ink dark:text-paper">
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
                <h2 className="font-display text-base md:text-lg font-bold text-ink dark:text-paper tracking-tight">
                  লিডারবোর্ড
                </h2>
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
              <div className="pk-landing dash fixed inset-0 z-[9999] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-ink/60 backdrop-blur-sm h-[100dvh] overflow-hidden">
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="bg-paper dark:bg-ink-2 text-ink dark:text-paper w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:rounded-panel relative overflow-y-auto overflow-x-hidden no-scrollbar block pb-8 sm:ring-1 sm:ring-ink/10 dark:sm:ring-white/10"
                  role="dialog"
                  aria-modal="true"
                  aria-label="ধারাবাহিকতা"
                >
                  {/* Header */}
                  <div className="w-full flex items-center justify-between p-4 sm:p-6 mb-2 sticky top-0 bg-paper/95 dark:bg-ink-2/95 backdrop-blur z-50 border-b border-ink/6 dark:border-white/10">
                    <button
                      onClick={() => setShowStreakModal(false)}
                      className="focus-ring p-2 -ml-2 text-ink dark:text-paper hover:bg-ink/5 dark:hover:bg-white/10 rounded-full transition-colors"
                      aria-label="বন্ধ করো"
                    >
                      <X size={26} strokeWidth={2.5} />
                    </button>
                    <h2 className="font-display text-lg font-bold text-ink dark:text-paper tracking-tight">
                      ধারাবাহিকতা
                    </h2>
                    <button
                      className="focus-ring p-2 -mr-2 text-ink dark:text-paper hover:bg-ink/5 dark:hover:bg-white/10 rounded-full transition-colors"
                      aria-label="শেয়ার"
                    >
                      <Share2 size={22} strokeWidth={2} />
                    </button>
                  </div>

                  {/* Huge Number & Flame */}
                  <div className="w-full px-6 sm:px-8 mt-2 relative mb-10 flex justify-between items-start">
                    <div className="relative z-10 flex flex-col items-start mt-4">
                      <span
                        className={`font-display text-[5.5rem] leading-none font-bold tracking-tighter tabular-nums ${
                          currentStreak ? "text-gradient" : "text-ink-400 dark:text-white/35"
                        }`}
                      >
                        {toBengaliNumber(currentStreak)}
                      </span>
                      <span
                        className={`text-xl font-bold mt-2 ${
                          currentStreak ? "text-brand-deep dark:text-brand-bright" : "text-mist"
                        }`}
                      >
                        দিনের ধারাবাহিকতা
                      </span>
                    </div>

                    <div className="absolute right-0 top-0 w-44 h-44 pointer-events-none translate-x-2 -translate-y-4">
                      {currentStreak ? (
                        <div className="w-full h-full scale-[1.3] origin-top-right">
                          <Lottie
                            animationData={fireAnimation}
                            loop
                            className="w-full h-full drop-shadow-[0_0_30px_rgba(255,82,0,0.45)]"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-full h-full opacity-40 bg-ink/30 dark:bg-white/20"
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
                    <div className="bg-mint dark:bg-white/[0.06] rounded-3xl p-5 mb-8 flex items-start gap-4 shadow-sm ring-1 ring-brand/15 dark:ring-white/10 relative overflow-hidden">
                      <div aria-hidden className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand/10 rounded-full blur-3xl pointer-events-none" />
                      <div className="shrink-0 mt-0.5 relative z-10">
                        {currentStreak ? (
                          <div className="w-12 h-12 -ml-1 -mt-1 flex items-center justify-center">
                            <Lottie
                              animationData={fireAnimation}
                              loop
                              className="w-full h-full drop-shadow-[0_0_15px_rgba(255,82,0,0.5)] scale-150"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-2xl ring-conic flex items-center justify-center text-white shadow-[0_10px_24px_-8px_rgba(224,68,0,0.5)]">
                            <Flame size={22} />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 relative z-10">
                        <p className="text-ink dark:text-paper font-semibold leading-snug text-[15px]">
                          {currentStreak
                            ? "দুর্দান্ত! আজকের প্র্যাকটিস সম্পন্ন করে আপনার ধারাবাহিকতা ধরে রাখুন! এভাবেই এগিয়ে যান!"
                            : "ধারাবাহিকতাকে এগিয়ে যেতে আজই একটি লেসন শেষ করুন!"}
                        </p>
                        {!currentStreak && (
                          <button
                            onClick={() => {
                              setShowStreakModal(false);
                              navigate("/quiz");
                            }}
                            className="focus-ring text-brand-deep dark:text-brand-bright font-bold text-left tracking-wide uppercase text-sm mt-1"
                          >
                            লেসন শুরু করুন
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Calendar Header */}
                    <h3 className="font-display text-xl font-bold text-ink dark:text-paper mb-4 tracking-tight">
                      ধারাবাহিকতার ক্যালেন্ডার
                    </h3>

                    {/* Calendar Card */}
                    <div className="bg-white dark:bg-white/[0.04] rounded-3xl p-5 md:p-6 ring-1 ring-ink/8 dark:ring-white/10 shadow-sm mb-8 relative overflow-hidden">
                      <div aria-hidden className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-brand to-transparent opacity-60" />
                      <div aria-hidden className="absolute -top-24 -right-24 w-48 h-48 bg-brand/10 rounded-full blur-[80px] pointer-events-none" />

                      <div className="flex justify-between items-center mb-6 px-2 relative z-10">
                        <button
                          onClick={() => shiftCalendarMonth(-1)}
                          className="focus-ring p-1 rounded-full text-mist hover:text-ink dark:hover:text-paper transition-colors"
                          aria-label="আগের মাস"
                        >
                          <ChevronRight size={22} className="rotate-180" />
                        </button>
                        <span className="font-display text-base font-bold text-ink dark:text-paper tracking-tight tabular-nums">
                          {calendarLabel}
                        </span>
                        <button
                          onClick={() => shiftCalendarMonth(1)}
                          disabled={isViewingCurrentMonth}
                          className="focus-ring p-1 rounded-full text-mist hover:text-ink dark:hover:text-paper transition-colors disabled:opacity-30 disabled:hover:text-mist"
                          aria-label="পরের মাস"
                        >
                          <ChevronRight size={22} />
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-2 mb-4 text-center relative z-10">
                        {["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"].map((day) => (
                          <span key={day} className="text-[11px] font-bold text-mist uppercase tracking-wider">
                            {day}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center pb-2 relative z-10">
                        {calendarCells.map((cell, i) => {
                          if (!cell) return <div key={`pad-${i}`} aria-hidden />;

                          return (
                            <div key={cell.dateKey} className="flex flex-col items-center justify-center">
                              {cell.active ? (
                                <div
                                  className={`relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold tabular-nums transition-all duration-300 ${
                                    cell.isToday
                                      ? "bg-gradient-to-br from-brand-500 to-brand-600 text-white ring-4 ring-brand/25 shadow-[0_0_15px_rgba(255,82,0,0.4)] scale-110"
                                      : "bg-brand/10 text-brand-deep dark:text-brand-bright ring-1 ring-brand/30"
                                  }`}
                                >
                                  {toBengaliNumber(cell.day)}
                                  <div className="absolute -bottom-1 -right-1 bg-white dark:bg-ink-2 rounded-full p-0.5">
                                    <div className="bg-brand text-white rounded-full w-3.5 h-3.5 flex items-center justify-center">
                                      <Check size={10} strokeWidth={4} />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium tabular-nums transition-colors ${
                                    cell.isToday
                                      ? "text-ink dark:text-paper ring-2 ring-brand/40"
                                      : "text-mist hover:bg-ink/5 dark:hover:bg-white/10"
                                  }`}
                                >
                                  {toBengaliNumber(cell.day)}
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
