import React from 'react';
import { motion } from 'motion/react';
import { Check, Minus } from 'lucide-react';
import { toBanglaDigits } from '../../utils/phone';
import type { SubjectGroup } from './catalog';
import type { ChapterState } from './selection';

/* Small presentational primitives shared by the mock-test builder steps. */

export const EASE = [0.16, 1, 0.3, 1] as const;

export const bn = (n: number | string): string => toBanglaDigits(typeof n === 'number' ? n.toLocaleString('en-US') : n);

/** Coloured icon tile for a subject (hue comes from the catalogue). */
export function SubjectTile({ group, className = 'h-12 w-12 rounded-2xl' }: { group: SubjectGroup; className?: string }) {
  const Icon = group.icon;
  return (
    <span className={`subject-tile grid shrink-0 place-items-center ${className}`} style={{ ['--hue' as string]: String(group.hue) }} aria-hidden="true">
      <Icon className="h-[55%] w-[55%]" strokeWidth={2.2} />
    </span>
  );
}

/** Tri-state checkbox visual (the parent button carries the semantics). */
export function CheckSquare({ state, className = 'h-6 w-6 rounded-lg' }: { state: ChapterState; className?: string }) {
  const on = state !== 'none';
  return (
    <span
      className={`grid shrink-0 place-items-center border-2 transition-all duration-300 ${className} ${
        on ? 'border-brand bg-brand text-white shadow-[0_6px_14px_-6px_rgba(255,82,0,0.7)]' : 'border-ink/20 bg-white text-transparent'
      }`}
      aria-hidden="true"
    >
      {state === 'partial' ? <Minus className="h-3.5 w-3.5" strokeWidth={4} /> : <Check className="h-3.5 w-3.5" strokeWidth={4} />}
    </span>
  );
}

/** Pill toggle used for topics and settings values. */
export function Pill({
  selected,
  onClick,
  children,
  hint,
  className = '',
  disabled,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      disabled={disabled}
      whileTap={{ scale: 0.96 }}
      className={`focus-ring inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13.5px] font-bold leading-none transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40 ${
        selected
          ? 'border-brand bg-brand text-white shadow-[0_10px_22px_-12px_rgba(255,82,0,0.8)]'
          : 'border-ink/10 bg-white text-ink/80 hover:border-brand/40 hover:text-ink'
      } ${className}`}
    >
      <span>{children}</span>
      {hint !== undefined && <span className={`text-[11.5px] font-semibold ${selected ? 'text-white/80' : 'text-mist'}`}>{hint}</span>}
    </motion.button>
  );
}

/** Two-way segmented control. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: React.ReactNode; badge?: React.ReactNode }[];
  ariaLabel: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex rounded-2xl bg-ink/5 p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="radio"
            type="button"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`focus-ring relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[13.5px] font-bold transition-all duration-300 ${
              active ? 'bg-white text-ink shadow-[0_6px_16px_-8px_rgba(22,18,16,0.35)] ring-1 ring-ink/8' : 'text-mist hover:text-ink'
            }`}
          >
            {o.label}
            {o.badge}
          </button>
        );
      })}
    </div>
  );
}

/** Section eyebrow with optional right-hand slot. */
export function SectionLabel({ icon, children, aside }: { icon?: React.ReactNode; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.18em] text-mist">
        {icon && <span className="text-brand">{icon}</span>}
        {children}
      </p>
      {aside}
    </div>
  );
}

/** Inline badge with a number, e.g. "৩৪০ প্রশ্ন". */
export function CountBadge({ n, suffix = 'প্রশ্ন', tone = 'muted' }: { n: number; suffix?: string; tone?: 'muted' | 'brand' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11.5px] font-bold tabular-nums ${
        tone === 'brand' ? 'bg-mint text-brand-deep' : 'bg-ink/5 text-ink/70'
      }`}
    >
      {bn(n)} {suffix}
    </span>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <span className={`inline-block animate-pulse rounded-full bg-ink/8 ${className}`} aria-hidden="true" />;
}

/** White card used across the steps. */
export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[24px] bg-white p-4 ring-1 ring-ink/8 shadow-[0_18px_44px_-30px_rgba(22,18,16,0.35)] sm:p-5 ${className}`}>{children}</div>;
}
