import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { X } from 'lucide-react';

/* Presentational primitives shared by the exam screens (paper / ink / brand-orange language). */

export const EASE = [0.16, 1, 0.3, 1] as const;

export type Tone = 'neutral' | 'brand' | 'emerald' | 'flag' | 'gold' | 'ink';

const CHIP_TONES: Record<Tone, string> = {
  neutral: 'bg-ink/5 text-ink/70',
  brand: 'bg-brand/10 text-brand-deep',
  emerald: 'bg-emerald-500/10 text-emerald-700',
  flag: 'bg-flag/10 text-flag',
  gold: 'bg-lime text-ink-950',
  ink: 'bg-ink text-white',
};

export function Chip({
  tone = 'neutral',
  icon: Icon,
  children,
  className = '',
}: {
  tone?: Tone;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1 rounded-full px-2.5 py-1 font-body text-[11.5px] font-bold leading-none ${CHIP_TONES[tone]} ${className}`}
    >
      {Icon && <Icon className="h-3 w-3 shrink-0" strokeWidth={2.6} aria-hidden="true" />}
      <span className="truncate">{children}</span>
    </span>
  );
}

export function Surface({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <div id={id} className={`rounded-[26px] bg-white ring-1 ring-ink/8 shadow-[0_18px_44px_-30px_rgba(22,18,16,0.35)] ${className}`}>
      {children}
    </div>
  );
}

export function IconButton({
  label,
  icon: Icon,
  onClick,
  active = false,
  disabled = false,
  className = '',
  size = 'md',
}: {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}) {
  const dims = size === 'sm' ? 'h-9 w-9' : 'h-10 w-10';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={`focus-ring grid ${dims} shrink-0 place-items-center rounded-full border transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? 'border-brand bg-brand/10 text-brand' : 'border-ink/10 bg-white text-ink/70 hover:border-ink/20 hover:text-ink'
      } ${className}`}
    >
      <Icon className={size === 'sm' ? 'h-4 w-4' : 'h-[18px] w-[18px]'} strokeWidth={2.2} aria-hidden="true" />
    </button>
  );
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
  type = 'button',
  icon: Icon,
  iconRight: IconRight,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ink' | 'ghost' | 'danger';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  ariaLabel?: string;
}) {
  const styles: Record<string, string> = {
    primary: 'bg-brand text-white shadow-[0_14px_30px_-14px_rgba(255,82,0,0.75)] hover:bg-brand-deep',
    ink: 'bg-ink text-white shadow-[0_14px_30px_-16px_rgba(22,18,16,0.7)] hover:bg-ink/80',
    ghost: 'border border-ink/12 bg-white text-ink hover:border-ink/25 hover:bg-paper/60',
    danger: 'bg-flag text-white shadow-[0_14px_30px_-14px_rgba(230,59,46,0.7)] hover:brightness-95',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-body text-[15px] font-bold leading-none transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {Icon && <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2.4} aria-hidden="true" />}
      <span className="min-w-0 truncate">{children}</span>
      {IconRight && <IconRight className="h-[18px] w-[18px] shrink-0" strokeWidth={2.4} aria-hidden="true" />}
    </button>
  );
}

/** Thin progress hairline. */
export function ProgressTrack({
  value,
  tone = 'brand',
  className = 'h-1 rounded-full bg-ink/8',
  label,
}: {
  value: number;
  tone?: 'brand' | 'flag' | 'gold';
  /** Track box classes (height / radius / background). */
  className?: string;
  label?: string;
}) {
  const fill = tone === 'flag' ? 'bg-flag' : tone === 'gold' ? 'bg-lime' : 'bg-brand';
  return (
    <div
      className={`w-full overflow-hidden ${className}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
    >
      <motion.div
        className={`h-full rounded-full ${fill}`}
        initial={false}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ ease: 'linear', duration: 0.6 }}
      />
    </div>
  );
}

/** Centered modal (desktop) / bottom sheet (phones). Closes on backdrop click and Escape. */
export function Dialog({
  open,
  onClose,
  children,
  label,
  size = 'sm',
  dismissible = true,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  label: string;
  size?: 'sm' | 'md';
  dismissible?: boolean;
}) {
  useEffect(() => {
    if (!open || !dismissible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, dismissible]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/60 p-3 font-body text-ink backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={dismissible ? onClose : undefined}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.36, ease: EASE }}
            className={`w-full ${size === 'md' ? 'max-w-lg' : 'max-w-sm'} max-h-[88dvh] overflow-y-auto rounded-[28px] bg-white p-5 shadow-[0_40px_90px_-40px_rgba(22,18,16,0.7)] ring-1 ring-ink/8 sm:p-6`}
            style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DialogHeader({
  icon: Icon,
  tone = 'brand',
  title,
  description,
  onClose,
}: {
  icon: LucideIcon;
  tone?: Tone;
  title: string;
  description?: React.ReactNode;
  onClose?: () => void;
}) {
  const tones: Record<Tone, string> = {
    neutral: 'bg-ink/5 text-ink',
    brand: 'bg-brand/10 text-brand',
    emerald: 'bg-emerald-500/10 text-emerald-700',
    flag: 'bg-flag/10 text-flag',
    gold: 'bg-lime text-ink-950',
    ink: 'bg-ink text-white',
  };
  return (
    <div className="flex items-start gap-3.5">
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${tones[tone]}`} aria-hidden="true">
        <Icon className="h-6 w-6" strokeWidth={2.2} />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <h2 className="font-bangla text-[19px] font-bold leading-snug text-ink">{title}</h2>
        {description && <div className="mt-1 text-[14px] leading-relaxed text-mist">{description}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="বন্ধ করো"
          className="focus-ring -mr-1 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink/60 hover:bg-ink/5 hover:text-ink"
        >
          <X className="h-[18px] w-[18px]" strokeWidth={2.4} />
        </button>
      )}
    </div>
  );
}

/** Tiny stat block used in dialogs and the result hero. */
export function Stat({ value, label, tone = 'neutral', className = '' }: { value: React.ReactNode; label: string; tone?: Tone; className?: string }) {
  const tones: Record<Tone, string> = {
    neutral: 'bg-paper/60 ring-ink/8 text-ink',
    brand: 'bg-brand/10 ring-brand/20 text-brand-deep',
    emerald: 'bg-emerald-500/10 ring-emerald-500/20 text-emerald-700',
    flag: 'bg-flag/10 ring-flag/20 text-flag',
    gold: 'bg-lime/25 ring-lime/40 text-ink',
    ink: 'bg-ink ring-ink text-white',
  };
  return (
    <div className={`rounded-2xl px-3 py-2.5 ring-1 ${tones[tone]} ${className}`}>
      <p className="font-bangla text-[22px] font-extrabold leading-none tabular-nums">{value}</p>
      <p className="mt-1.5 text-[11.5px] font-bold uppercase tracking-wide opacity-70">{label}</p>
    </div>
  );
}

/** Full-screen state (loading / submitting) in the same visual language. */
export function StateScreen({ title, subtitle, icon: Icon }: { title: string; subtitle?: string; icon?: LucideIcon }) {
  return (
    <div
      className="pk-landing relative flex h-[100dvh] flex-col items-center justify-center overflow-hidden bg-paper px-6 font-body text-ink"
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,82,0,0.12),transparent)] blur-2xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="relative flex flex-col items-center text-center"
      >
        <span className="relative grid h-20 w-20 place-items-center rounded-full bg-white shadow-[0_20px_44px_-20px_rgba(255,82,0,0.5)] ring-1 ring-ink/8">
          <span className="absolute inset-0 rounded-full border-[3px] border-brand/15 border-t-brand animate-spin" aria-hidden="true" />
          {Icon && <Icon className="h-8 w-8 text-brand" strokeWidth={2} aria-hidden="true" />}
        </span>
        <h1 className="mt-6 font-bangla text-[22px] font-bold text-ink">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-xs text-[14px] leading-relaxed text-mist">{subtitle}</p>}
      </motion.div>
    </div>
  );
}
