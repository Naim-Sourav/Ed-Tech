import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'motion/react';

/* ─────────────────────────────────────────────────────────────
   Shared building blocks for the landing page
   (components/LandingPage.tsx + siblings)
   ───────────────────────────────────────────────────────────── */

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as [number, number, number, number];
export const EASE_SPRING = [0.34, 1.56, 0.64, 1] as [number, number, number, number];

/* ── Scroll reveal wrapper ─────────────────────────────── */
export const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}> = ({ children, delay = 0, y = 28, className = '', once = true }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y, filter: 'blur(6px)' }}
    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    viewport={{ once, margin: '-60px' }}
    transition={{ duration: 0.85, delay, ease: EASE_OUT_EXPO }}
  >
    {children}
  </motion.div>
);

/* ── Staggered container / item ────────────────────────── */
export const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.06 } },
};

export const staggerChild = {
  hidden: { opacity: 0, y: 26, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: EASE_OUT_EXPO },
  },
};

/* ── Eyebrow tag above headings ────────────────────────── */
export const SectionTag: React.FC<{ children: React.ReactNode; dark?: boolean }> = ({ children, dark = false }) => (
  <span
    className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-semibold tracking-wide ${
      dark ? 'bg-white/8 text-lime ring-1 ring-white/12' : 'bg-mint text-brand-deep ring-1 ring-brand/15'
    }`}
  >
    <span className="relative flex h-1.5 w-1.5">
      <span className={`absolute inline-flex h-full w-full rounded-full ${dark ? 'bg-lime' : 'bg-brand'} animate-pulse-ring`} />
      <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${dark ? 'bg-lime' : 'bg-brand'}`} />
    </span>
    {children}
  </span>
);

/* ── Bengali digit helper ──────────────────────────────── */
export const toBn = (s: string) => s.replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

/** Format a number the Bangladeshi way (lakh/crore grouping) in Bangla digits. */
export const formatBn = (n: number) => toBn(n.toLocaleString('en-IN'));

/* ── Animated counter ──────────────────────────────────────
   SEO-safe: the server/first paint shows the FINAL number so crawlers and
   no-JS environments never capture "০+" — browsers then animate up to it.
   ─────────────────────────────────────────────────────────── */
export const BnCounter: React.FC<{
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}> = ({ value, decimals = 0, suffix = '', className = '' }) => {
  const render = (v: number) => toBn(v.toFixed(decimals)) + suffix;
  const [text, setText] = useState(() => render(value));
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 46, damping: 18 });

  useEffect(() => {
    if (!inView) return;
    mv.set(value);
  }, [inView, value, mv]);

  useEffect(() => {
    const unsub = spring.on('change', (v) => {
      // Stop at the exact target so the DOM ends on the true value.
      setText(v >= value ? render(value) : render(v));
    });
    return unsub;
  }, [spring, value, decimals, suffix]);

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
};

/* ── Brand logo ────────────────────────────────────────── */
export const LogoMark: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <span
    className="ring-conic relative grid shrink-0 place-items-center rounded-[30%] shadow-[0_8px_20px_-6px_rgba(224,68,0,0.5)]"
    style={{ width: size, height: size }}
    aria-hidden="true"
  >
    <span
      className="font-bangla font-bold leading-none text-white"
      style={{ fontSize: size * 0.52, marginTop: -size * 0.04 }}
    >
      প
    </span>
    <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-lime ring-2 ring-paper" />
  </span>
);

export const Logo: React.FC<{ dark?: boolean }> = ({ dark = false }) => (
  <a href="#top" className="focus-ring group flex items-center gap-2.5" aria-label="পরীক্ষাঙ্গন — হোম">
    <LogoMark />
    <span className="flex flex-col leading-none">
      <span className={`font-bangla text-[21px] font-bold tracking-tight ${dark ? 'text-white' : 'text-ink'}`}>
        পরীক্ষাঙ্গন
      </span>
      <span className={`text-[9.5px] font-bold uppercase tracking-[0.24em] ${dark ? 'text-white/50' : 'text-mist'}`}>
        Porikkhangon
      </span>
    </span>
  </a>
);
