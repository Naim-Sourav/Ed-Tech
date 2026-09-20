import React, { useEffect, useMemo, useRef, useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Shared primitives for the Porikkhangon landing page redesign.      */
/*  Everything here is SSR-safe (crawlers / no-rAF environments always */
/*  see the FINAL value or the FINAL visible state, never a blank).    */
/* ------------------------------------------------------------------ */

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

/** Convert latin digits inside any string to Bangla digits. */
export const bnDigits = (value: string | number): string =>
  String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);

/** Indian-style grouping (last 3 digits, then pairs) — 120000 -> 1,20,000 */
export const groupIndian = (n: number): string => {
  const s = Math.abs(Math.floor(n)).toString();
  if (s.length <= 3) return s;
  const last3 = s.slice(-3);
  let rest = s.slice(0, -3);
  const parts: string[] = [];
  while (rest.length > 2) {
    parts.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }
  if (rest) parts.unshift(rest);
  return `${parts.join(',')},${last3}`;
};

/** 50000 -> "৫০,০০০" */
export const bn = (n: number): string => bnDigits(groupIndian(n));

export const usePrefersReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return reduced;
};

/** Observe an element once; returns [ref, inView]. SSR-safe: starts false. */
export function useInView<T extends HTMLElement>(threshold = 0.2, once = true) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) io.unobserve(entry.target);
          } else if (!once) {
            setInView(false);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);
  return [ref, inView] as const;
}

/** Scroll-reveal wrapper: fades + lifts children when they enter the viewport. */
export const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}> = ({ children, delay = 0, y = 22, className = '' }) => {
  const [ref, inView] = useInView<HTMLDivElement>(0.12);
  return (
    <div
      ref={ref}
      className={`lk-reveal ${inView ? 'lk-reveal-in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ['--lk-rise' as any]: `${y}px` }}
    >
      {children}
    </div>
  );
};

/**
 * Animated counter that is crawler-safe: the initial render already contains
 * the FINAL value (so crawlers / screenshots never capture "0"), and real
 * browsers then replay 0 → end for the visual effect.
 */
export const Counter: React.FC<{
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}> = ({ end, suffix = '', prefix = '', duration = 1600, format, className = '' }) => {
  const [ref, inView] = useInView<HTMLSpanElement>(0.4);
  const reduced = usePrefersReducedMotion();
  const fmt = format ?? ((n: number) => bn(n));
  const [value, setValue] = useState(end);

  useEffect(() => {
    if (!inView || reduced) {
      setValue(end);
      return;
    }
    if (typeof window.requestAnimationFrame !== 'function') return;
    let start: number | null = null;
    let raf = 0;
    setValue(0);
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * end));
      if (p < 1) raf = window.requestAnimationFrame(step);
    };
    raf = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(raf);
  }, [inView, end, duration, reduced]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {fmt(value)}
      {suffix}
    </span>
  );
};

/** Infinite horizontal marquee. `reverse` scrolls right-wards. */
export const Marquee: React.FC<{
  children: React.ReactNode;
  duration?: number;
  reverse?: boolean;
  className?: string;
  pauseOnHover?: boolean;
}> = ({ children, duration = 40, reverse = false, className = '', pauseOnHover = true }) => (
  <div
    className={`lk-marquee-wrap ${pauseOnHover ? 'lk-marquee-hover' : ''} ${className}`}
    style={{ ['--lk-marquee-duration' as any]: `${duration}s` }}
  >
    <div className={`lk-marquee-track ${reverse ? 'lk-marquee-rev' : ''}`} aria-hidden="false">
      <div className="lk-marquee-group">{children}</div>
      <div className="lk-marquee-group" aria-hidden="true">
        {children}
      </div>
    </div>
  </div>
);

/** Small uppercase-ish kicker pill used above section titles. */
export const Eyebrow: React.FC<{ children: React.ReactNode; tone?: 'light' | 'dark' }> = ({
  children,
  tone = 'light',
}) => (
  <span
    className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12px] md:text-[13px] font-bold tracking-wide ${
      tone === 'dark'
        ? 'border-white/15 bg-white/5 text-orange-300'
        : 'border-[#EADFD0] bg-white/70 text-[#B34700] dark:border-white/10 dark:bg-white/5 dark:text-orange-300'
    }`}
  >
    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#FF5200]" aria-hidden="true" />
    {children}
  </span>
);

/** Section heading block: big Bangla display line + supporting sentence. */
export const SectionHead: React.FC<{
  eyebrow: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  tone?: 'light' | 'dark';
  align?: 'left' | 'center';
  className?: string;
}> = ({ eyebrow, title, sub, tone = 'light', align = 'left', className = '' }) => (
  <div
    className={`${align === 'center' ? 'mx-auto text-center' : ''} max-w-3xl ${className}`}
  >
    <Reveal>
      <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
    </Reveal>
    <Reveal delay={80}>
      <h2
        className={`mt-5 text-[2rem] leading-[1.15] md:text-[3.25rem] md:leading-[1.08] font-bold tracking-tight text-balance ${
          tone === 'dark' ? 'text-white' : 'text-[#171310] dark:text-[#F7F1E8]'
        }`}
      >
        {title}
      </h2>
    </Reveal>
    {sub ? (
      <Reveal delay={160}>
        <p
          className={`mt-5 text-[15px] md:text-lg leading-relaxed ${
            tone === 'dark' ? 'text-white/60' : 'text-[#5C544B] dark:text-[#B7ADA1]'
          }`}
        >
          {sub}
        </p>
      </Reveal>
    ) : null}
  </div>
);

/** Monogram avatar (used for social-proof rows & testimonials). */
export const Monogram: React.FC<{ label: string; className?: string }> = ({
  label,
  className = '',
}) => {
  const palette = useMemo(
    () => [
      'from-orange-500 to-rose-500',
      'from-emerald-500 to-teal-600',
      'from-sky-500 to-indigo-600',
      'from-amber-400 to-orange-600',
      'from-fuchsia-500 to-purple-600',
    ],
    []
  );
  const idx = (label.charCodeAt(0) + label.length) % palette.length;
  return (
    <span
      className={`inline-flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-gradient-to-br ${palette[idx]} text-white text-sm font-bold ring-2 ring-white/80 dark:ring-[#171310] ${className}`}
      aria-hidden="true"
    >
      {label.trim().charAt(0)}
    </span>
  );
};

/** Smooth-scroll helper that respects the document scroll container. */
export const scrollToId = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
