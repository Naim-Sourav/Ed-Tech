import React, { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring } from "motion/react";

/* ── Scroll reveal wrapper ─────────────────────────────── */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className = "",
  once = true,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ── Staggered container / item ────────────────────────── */
export const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.06 } },
};

export const staggerChild = {
  hidden: { opacity: 0, y: 26, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

/* ── Eyebrow tag above headings ────────────────────────── */
export function SectionTag({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-semibold tracking-wide ${
        dark
          ? "bg-white/8 text-lime ring-1 ring-white/12"
          : "bg-mint text-brand-deep ring-1 ring-brand/15"
      }`}
    >
      <span className={`relative flex h-1.5 w-1.5`}>
        <span className={`absolute inline-flex h-full w-full rounded-full ${dark ? "bg-lime" : "bg-brand"} animate-pulse-ring`} />
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${dark ? "bg-lime" : "bg-brand"}`} />
      </span>
      {children}
    </span>
  );
}

/* ── Bengali digit helper ──────────────────────────────── */
export const toBn = (s: string) =>
  s.replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);

/* ── Animated counter ──────────────────────────────────── */
export function Counter({
  value,
  decimals = 0,
  suffix = "",
  className = "",
  bn = false,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
  bn?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 46, damping: 18 });

  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, value, mv]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => {
      const out = v.toFixed(decimals) + suffix;
      if (ref.current) ref.current.textContent = bn ? toBn(out) : out;
    });
    return unsub;
  }, [spring, decimals, suffix, bn]);

  return (
    <span ref={ref} className={className}>
      {bn ? toBn((0).toFixed(decimals) + suffix) : (0).toFixed(decimals) + suffix}
    </span>
  );
}

/* ── Infinite marquee ──────────────────────────────────── */
export function Marquee({
  children,
  className = "",
  slow = false,
}: {
  children: React.ReactNode;
  className?: string;
  slow?: boolean;
}) {
  return (
    <div className={`group relative overflow-hidden ${className}`}>
      <div className={`flex w-max ${slow ? "animate-marquee-slow" : "animate-marquee"} group-hover:[animation-play-state:paused]`}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Brand logo ────────────────────────────────────────── */
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <span
      className="ring-conic relative grid shrink-0 place-items-center rounded-[30%] shadow-[0_8px_20px_-6px_rgba(224,68,0,0.5)]"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span className="text-white font-bangla font-bold leading-none" style={{ fontSize: size * 0.52, marginTop: -size * 0.04 }}>
        প
      </span>
      <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-lime ring-2 ring-paper" />
    </span>
  );
}

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <a href="#top" className="focus-ring group flex items-center gap-2.5" aria-label="Porikkhangon — home">
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className={`font-bangla text-[21px] font-bold tracking-tight ${dark ? "text-white" : "text-ink"}`}>
          পরীক্ষাঙ্গন
        </span>
        <span className={`text-[9.5px] font-bold uppercase tracking-[0.24em] ${dark ? "text-white/50" : "text-mist"}`}>
          Porikkhangon
        </span>
      </span>
    </a>
  );
}
