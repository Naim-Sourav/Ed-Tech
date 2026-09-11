import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Flame,
  Trophy,
  ChevronRight,
  Settings as SettingsIcon,
  User,
  Bookmark,
  AlertCircle,
  Clock,
  Shield,
  FileText,
  RefreshCw,
  LogOut,
} from "lucide-react";
import { motion } from "motion/react";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../contexts/AuthContext";
import { useCache } from "../contexts/CacheContext";
import { fetchUserStatsAPI, fetchLeaderboardAPI } from "../services/api";
import { toBengaliNumber } from "../utils/numberUtils";

type ThemeMode = "light" | "dark" | "system";

const AccountMenu: React.FC<{
  themeMode?: ThemeMode;
  toggleTheme?: () => void;
}> = ({ themeMode = "system", toggleTheme }) => {
  const navigate = useNavigate();
  const { currentUser, userAvatar, logout } = useAuth();
  const { getCache } = useCache();

  // Seed from the dashboard cache so badges render instantly — the menu
  // never blocks on network. The fetch below just refreshes the numbers.
  const cached = (currentUser && getCache(`dashboard_${currentUser.uid}`)) || {};
  const [stats, setStats] = useState<any>(cached.stats || null);
  const [rank, setRank] = useState<number | null>(cached.rank || null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!currentUser) return;
      const [statsData, leaderboardData] = await Promise.all([
        fetchUserStatsAPI(currentUser.uid).catch(() => null),
        fetchLeaderboardAPI().catch(() => []),
      ]);
      if (!mounted) return;
      if (statsData) setStats(statsData);
      if (Array.isArray(leaderboardData)) {
        const r = leaderboardData.findIndex((u) => u.uid === currentUser.uid);
        if (r !== -1) setRank(r + 1);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [currentUser]);

  const currentStreak = stats?.currentStreak || 0;

  const renderAvatar = (size: string) => {
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
      <div className={`w-full h-full rounded-full flex items-center justify-center bg-primary text-white font-bold ${size}`}>
        {currentUser?.displayName?.charAt(0).toUpperCase() || "U"}
      </div>
    );
  };

  const Row: React.FC<{
    icon: any;
    tile: string;
    label: string;
    badge?: string | null;
    onClick: () => void;
  }> = ({ icon: Icon, tile, label, badge, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3.5 p-4 hover:bg-gray-50/70 dark:hover:bg-white/[0.03] transition-colors text-left group"
    >
      <div className={`w-11 h-11 rounded-2xl ${tile} flex items-center justify-center shrink-0 shadow-sm`}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="text-[15px] font-black text-gray-900 dark:text-white flex-1 min-w-0">{label}</p>
      {badge && (
        <span className="min-w-7 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[11px] font-black text-center tabular-nums">
          {badge}
        </span>
      )}
      <ChevronRight size={17} className="text-gray-300 dark:text-zinc-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
    </button>
  );

  const go = (path: string) => navigate(path);

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="min-h-full bg-gray-50 dark:bg-black pb-32 md:pb-40"
    >
      <div className="max-w-2xl mx-auto px-4 md:px-6 pt-4 md:pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm flex items-center justify-center text-gray-600 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white active:scale-90 transition-all"
            title="ফিরে যান"
          >
            <ArrowLeft size={20} />
          </button>
          {toggleTheme && (
            <ThemeToggle themeMode={themeMode} onToggle={toggleTheme} />
          )}
        </div>

        {/* User card */}
        <div className="flex flex-col items-center text-center pb-6">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary/15 shadow-md bg-primary/5">
              {renderAvatar("text-3xl")}
            </div>
            <div className="absolute bottom-0.5 right-0.5 w-5 h-5 bg-emerald-500 rounded-full border-[3px] border-white dark:border-black" />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
            {currentUser?.displayName || "শিক্ষার্থী"}
          </h2>
          <p className="text-sm text-gray-400 dark:text-zinc-500 font-medium mt-0.5">
            {currentUser?.email || ""}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-black text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border border-orange-200/60 dark:border-orange-900/40 px-3 py-1 rounded-full">
              <Flame size={12} className="fill-orange-500 text-orange-500" />
              {toBengaliNumber(currentStreak)} দিনের স্ট্রিক
            </span>
            {rank && (
              <span className="inline-flex items-center gap-1 text-[11px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 px-3 py-1 rounded-full">
                <Trophy size={12} />
                র‍্যাঙ্ক {toBengaliNumber(rank)}
              </span>
            )}
          </div>
        </div>

        {/* Account group */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden divide-y divide-gray-50 dark:divide-white/5">
          <Row icon={User} tile="bg-emerald-500" label="প্রোফাইল ও পার্সোনাল ইনফো" onClick={() => go("/profile")} />
          <Row icon={SettingsIcon} tile="bg-teal-500" label="অ্যাপ সেটিংস" onClick={() => go("/settings")} />
        </div>

        {/* Study group */}
        <div className="mt-3.5 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden divide-y divide-gray-50 dark:divide-white/5">
          <Row icon={Bookmark} tile="bg-amber-500" label="সেভ করা প্রশ্ন" onClick={() => go("/saved-questions")} />
          <Row icon={AlertCircle} tile="bg-rose-500" label="ভুল প্রশ্ন" onClick={() => go("/wrong-questions")} />
          <Row
            icon={Clock}
            tile="bg-blue-500"
            label="পরীক্ষার ইতিহাস"
            badge={stats?.totalExams ? toBengaliNumber(stats.totalExams) : null}
            onClick={() => go("/history")}
          />
          <Row
            icon={Trophy}
            tile="bg-indigo-500"
            label="লিডারবোর্ড"
            badge={rank ? toBengaliNumber(rank) : null}
            onClick={() => go("/leaderboard")}
          />
        </div>

        {/* Legal group */}
        <div className="mt-3.5 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden divide-y divide-gray-50 dark:divide-white/5">
          <Row icon={Shield} tile="bg-cyan-500" label="প্রাইভেসি পলিসি" onClick={() => go("/privacy")} />
          <Row icon={FileText} tile="bg-pink-500" label="ব্যবহারের শর্তাবলী" onClick={() => go("/terms")} />
          <Row icon={RefreshCw} tile="bg-orange-500" label="রিফান্ড পলিসি" onClick={() => go("/refund")} />
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={async () => {
            await logout();
          }}
          className="mt-3.5 w-full flex items-center gap-3.5 p-4 bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100 dark:border-rose-950/40 hover:bg-rose-50/50 dark:hover:bg-rose-950/10 transition-colors text-left shadow-sm"
        >
          <div className="w-11 h-11 rounded-2xl bg-red-500 flex items-center justify-center shrink-0 shadow-sm">
            <LogOut size={20} className="text-white" />
          </div>
          <p className="text-[15px] font-black text-red-600 dark:text-rose-400 flex-1">লগআউট</p>
          <ChevronRight size={17} className="text-gray-300 dark:text-zinc-600 shrink-0" />
        </button>
      </div>
    </motion.div>
  );
};

export default AccountMenu;
