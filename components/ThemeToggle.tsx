import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sun, Moon, Laptop } from "lucide-react";

type ThemeMode = "light" | "dark" | "system";

/**
 * Animated day/night theme toggle.
 * Light: glowing sun with slowly rotating rays
 * Dark:  crescent moon with twinkling stars
 * System: laptop (auto) — same spring morph between all three
 */
const ThemeToggle: React.FC<{
  themeMode: ThemeMode;
  onToggle: () => void;
  className?: string;
  size?: "sm" | "md";
}> = ({ themeMode, onToggle, className = "", size = "md" }) => {
  const btnSize = size === "sm" ? "w-9 h-9" : "w-11 h-11";
  const iconSize = size === "sm" ? 17 : 20;

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileTap={{ scale: 0.8, rotate: -14 }}
      transition={{ type: "spring", stiffness: 420, damping: 14 }}
      aria-label="থিম পরিবর্তন করুন"
      title={
        themeMode === "light"
          ? "লাইট মোড — পরবর্তী: ডার্ক"
          : themeMode === "dark"
          ? "ডার্ক মোড — পরবর্তী: সিস্টেম"
          : "সিস্টেম মোড — পরবর্তী: লাইট"
      }
      className={`relative ${btnSize} rounded-full flex items-center justify-center overflow-hidden border transition-colors duration-500 shrink-0 ${
        themeMode === "light"
          ? "bg-gradient-to-br from-sky-100 via-violet-50 to-violet-100 border-violet-200/70 shadow-[0_2px_14px_rgba(167,139,250,0.4)]"
          : themeMode === "dark"
          ? "bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 border-indigo-900/60 shadow-[0_2px_16px_rgba(99,102,241,0.4)]"
          : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-800 dark:to-zinc-900 border-gray-200/80 dark:border-zinc-700/60"
      } ${className}`}
    >
      {/* Sun ambient glow */}
      <AnimatePresence>
        {themeMode === "light" && (
          <motion.span
            key="sun-glow"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 0.55, scale: 1 }}
            exit={{ opacity: 0, scale: 0.3 }}
            transition={{ duration: 0.4 }}
            className="absolute w-8 h-8 rounded-full bg-violet-300 blur-[6px] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Twinkling stars in dark mode */}
      <AnimatePresence>
        {themeMode === "dark" && (
          <motion.span
            key="stars"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 pointer-events-none"
          >
            {[
              { top: "22%", right: "20%", size: 3, delay: 0 },
              { top: "60%", right: "32%", size: 2, delay: 0.8 },
              { top: "34%", left: "20%", size: 2, delay: 1.4 },
            ].map((star, i) => (
              <motion.span
                key={i}
                animate={{ opacity: [0.15, 1, 0.15], scale: [0.7, 1.2, 0.7] }}
                transition={{ repeat: Infinity, duration: 2.4, delay: star.delay, ease: "easeInOut" }}
                className="absolute rounded-full bg-white"
                style={{ top: star.top, right: star.right, left: star.left, width: star.size, height: star.size }}
              />
            ))}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Icon morph */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={themeMode}
          initial={{ rotate: -120, scale: 0, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 120, scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 20 }}
          className="relative z-10 flex items-center justify-center"
        >
          {themeMode === "light" ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
              className="flex"
            >
              <Sun size={iconSize} className="text-violet-500" fill="currentColor" strokeWidth={1.2} />
            </motion.span>
          ) : themeMode === "dark" ? (
            <Moon size={iconSize - 1} className="text-indigo-100" fill="currentColor" strokeWidth={1.2} />
          ) : (
            <Laptop size={iconSize - 1} className="text-gray-500 dark:text-zinc-300" />
          )}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
};

export default ThemeToggle;
