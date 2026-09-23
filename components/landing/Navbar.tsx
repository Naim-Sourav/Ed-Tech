import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { EASE } from "./helpers";
import LogoMark from "./Logo";
import { useLandingThemeContext } from "./useLandingTheme";

const LINKS = [
  { href: "#features", label: "ফিচারস" },
  { href: "#showcase", label: "প্রশ্ন প্রদর্শন" },
  { href: "#reviews", label: "রিভিউ" },
  { href: "#pricing", label: "মূল্য" },
  { href: "#faq", label: "জিজ্ঞাসা" },
];

/** Sun/moon switch — flips the landing between the light and warm-dark theme. */
function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useLandingThemeContext();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "লাইট মোডে যাও" : "ডার্ক মোডে যাও"}
      aria-pressed={dark}
      title={dark ? "লাইট মোডে যাও" : "ডার্ক মোডে যাও"}
      className={`focus-ring grid size-10 shrink-0 place-items-center rounded-xl border border-ink-200 bg-white/70 text-ink-800 backdrop-blur transition-colors duration-300 hover:border-brand-300 hover:text-brand-600 ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={dark ? "moon" : "sun"}
          initial={{ opacity: 0, rotate: -70, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 70, scale: 0.6 }}
          transition={{ duration: 0.28, ease: EASE }}
          className="grid place-items-center"
        >
          {dark ? <Moon className="size-[18px]" /> : <Sun className="size-[18px]" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export default function Navbar({ onStart, onLogin }: { onStart?: () => void; onLogin?: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* scroll progress */}
      <motion.div
        style={{ scaleX: progress }}
        className="absolute inset-x-0 top-0 h-[3px] origin-left bg-gradient-to-r from-brand-500 via-amber-500 to-gold-400"
      />
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-all duration-500 sm:px-6 ${
          scrolled ? "py-3" : "py-5"
        }`}
      >
        <div
          className={`absolute inset-0 -z-10 border-b transition-all duration-500 ${
            scrolled ? "glass border-brand-500/10 shadow-[0_10px_40px_-18px_rgba(255,82,0,0.35)]" : "border-transparent bg-transparent"
          }`}
        />

        {/* logo */}
        <a href="#top" className="group flex items-center gap-2.5">
          <span className="transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105">
            <LogoMark className="size-10" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">
            পরীক্ষা<span className="text-gradient">ঙ্গন</span>
          </span>
        </a>

        {/* desktop links */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="প্রধান মেনু">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative rounded-full px-4 py-2 text-[15px] font-medium text-ink-700 transition-colors duration-300 hover:bg-brand-50 hover:text-brand-700"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <button
            type="button"
            onClick={onLogin || onStart}
            className="rounded-full px-4 py-2 text-[15px] font-semibold text-ink-700 transition hover:text-brand-700"
          >
            লগ ইন
          </button>
          <button
            type="button"
            onClick={onStart}
            className="btn-shine group inline-flex items-center gap-2 rounded-full bg-ink-950 px-5 py-2.5 text-[15px] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/40"
          >
            ফ্রি শুরু করো
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </button>
        </div>

        {/* mobile: theme + menu */}
        <span className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-xl border border-ink-200 bg-white/70 text-ink-800"
            aria-label={open ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </span>
      </div>

      {/* mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -16, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
            transition={{ duration: 0.45, ease: EASE }}
            className="glass mx-4 rounded-3xl border border-white/60 p-3 shadow-xl shadow-brand-500/10 lg:hidden"
            aria-label="মোবাইল মেনু"
          >
            {LINKS.map((l, i) => (
              <motion.a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + i * 0.05, duration: 0.4, ease: EASE }}
                className="block rounded-2xl px-4 py-3 text-base font-medium text-ink-800 transition hover:bg-brand-50 hover:text-brand-700"
              >
                {l.label}
              </motion.a>
            ))}
            <motion.button
              type="button"
              onClick={() => {
                setOpen(false);
                onStart?.();
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.4, ease: EASE }}
              className="mt-2 block w-full rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-3 text-center text-base font-bold text-white shadow-lg shadow-brand-500/30"
            >
              ফ্রি শুরু করো →
            </motion.button>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4, ease: EASE }}
              className="mt-3 pb-1 text-center text-sm text-ink-600"
            >
              আগে থেকেই অ্যাকাউন্ট আছে?{" "}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  (onLogin || onStart)?.();
                }}
                className="font-bold text-brand-700 underline-offset-2 hover:underline"
              >
                লগ ইন
              </button>
            </motion.p>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
