import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { ArrowLeft, ChevronRight, X } from 'lucide-react';
import { EASE, cx } from '../dashboard/ui';

export { Card, SectionHeader, Track, Eyebrow, Bone, EASE, cx } from '../dashboard/ui';

/*
 * Small dark-aware primitives for the question bank. The exam primitives are
 * light-only; the bank lives inside the dashboard shell which supports dark
 * mode, so everything here carries explicit `dark:` variants.
 */

export type Tone = 'neutral' | 'brand' | 'emerald' | 'flag' | 'gold' | 'ink';

const CHIP_TONES: Record<Tone, string> = {
  neutral: 'bg-ink/[0.05] text-ink/70 dark:bg-white/[0.07] dark:text-white/70',
  brand: 'bg-brand/10 text-brand-deep dark:bg-brand/20 dark:text-brand-bright',
  emerald: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300',
  flag: 'bg-flag/10 text-flag dark:bg-flag/20 dark:text-red-300',
  gold: 'bg-gold/15 text-amber-800 dark:bg-gold/20 dark:text-amber-200',
  ink: 'bg-ink text-white dark:bg-paper dark:text-ink',
};

export function Chip({
  children,
  tone = 'neutral',
  icon: Icon,
  className = '',
}: {
  children: React.ReactNode;
  tone?: Tone;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-bold', CHIP_TONES[tone], className)}>
      {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={2.6} aria-hidden="true" />}
      {children}
    </span>
  );
}

/** Selectable pill used in filter rows. */
export function Pill({
  active,
  onClick,
  children,
  count,
  className = '',
  tone = 'ink',
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number | string;
  className?: string;
  tone?: 'ink' | 'flag' | 'emerald';
}) {
  const on = {
    ink: 'bg-ink text-white ring-ink dark:bg-paper dark:text-ink dark:ring-paper',
    flag: 'bg-flag text-white ring-flag',
    emerald: 'bg-emerald-600 text-white ring-emerald-600',
  }[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        'focus-ring inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[13px] font-bold ring-1 transition-colors',
        active ? on : 'bg-white text-ink/75 ring-ink/10 hover:bg-ink/[0.04] dark:bg-white/[0.06] dark:text-white/75 dark:ring-white/10 dark:hover:bg-white/10',
        className,
      )}
    >
      {children}
      {count !== undefined && (
        <span className={cx('text-[11px] font-extrabold tabular-nums', active ? 'opacity-80' : 'text-mist dark:text-white/45')}>{count}</span>
      )}
    </button>
  );
}

export function IconBtn({
  icon: Icon,
  label,
  onClick,
  active = false,
  className = '',
  disabled = false,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  active?: boolean;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      className={cx(
        'focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-full ring-1 transition-colors disabled:opacity-40',
        active
          ? 'bg-ink text-white ring-ink dark:bg-paper dark:text-ink dark:ring-paper'
          : 'bg-white text-ink/70 ring-ink/10 hover:bg-ink/[0.04] hover:text-ink dark:bg-white/[0.06] dark:text-white/70 dark:ring-white/10 dark:hover:bg-white/10 dark:hover:text-white',
        className,
      )}
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={2.4} aria-hidden="true" />
    </button>
  );
}

export function Btn({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  trailing: Trailing,
  className = '',
  disabled = false,
  type = 'button',
  full = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'brand' | 'soft' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  trailing?: LucideIcon;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
  full?: boolean;
}) {
  const variants = {
    primary: 'bg-ink text-white hover:bg-ink-2 dark:bg-paper dark:text-ink dark:hover:bg-white',
    brand: 'bg-brand text-white hover:bg-brand-deep shadow-[0_14px_30px_-16px_rgba(255,120,60,0.8)]',
    soft: 'bg-ink/[0.05] text-ink hover:bg-ink/[0.09] dark:bg-white/[0.08] dark:text-white dark:hover:bg-white/[0.14]',
    ghost: 'bg-transparent text-ink/70 hover:bg-ink/[0.05] hover:text-ink dark:text-white/70 dark:hover:bg-white/[0.08] dark:hover:text-white',
    danger: 'bg-flag/10 text-flag hover:bg-flag/15 dark:bg-flag/20 dark:text-red-200',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
  }[variant];
  const sizes = { sm: 'h-9 px-3.5 text-[13px] gap-1.5', md: 'h-11 px-4.5 text-[14px] gap-2', lg: 'h-12 px-5 text-[15px] gap-2' }[size];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'focus-ring inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full font-extrabold transition-colors disabled:cursor-not-allowed disabled:opacity-45',
        variants,
        sizes,
        full && 'w-full',
        className,
      )}
    >
      {Icon && <Icon className={size === 'sm' ? 'h-4 w-4' : 'h-[18px] w-[18px]'} strokeWidth={2.6} aria-hidden="true" />}
      {children}
      {Trailing && <Trailing className={size === 'sm' ? 'h-4 w-4' : 'h-[18px] w-[18px]'} strokeWidth={2.6} aria-hidden="true" />}
    </button>
  );
}

/** Sticky page header used by inner views (paper, chapter, records…). */
export function PageHeader({
  title,
  subtitle,
  onBack,
  right,
  eyebrow,
  narrow = false,
}: {
  title: string;
  subtitle?: React.ReactNode;
  onBack: () => void;
  right?: React.ReactNode;
  eyebrow?: string;
  /** Match a reading-width body (question lists). */
  narrow?: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/[0.06] bg-paper/85 backdrop-blur-xl dark:border-white/[0.06] dark:bg-ink/85">
      <div className={cx('mx-auto flex items-center gap-2.5 px-3 py-2.5 md:px-6', narrow ? 'max-w-3xl' : 'max-w-5xl')}>
        <button
          type="button"
          onClick={onBack}
          aria-label="পেছনে যাও"
          className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink/70 hover:bg-ink/[0.05] hover:text-ink dark:text-white/70 dark:hover:bg-white/[0.08] dark:hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2.4} aria-hidden="true" />
        </button>
        <div className="min-w-0 flex-1">
          {eyebrow && <p className="truncate text-[11px] font-bold tracking-[0.03em] text-brand-deep dark:text-brand-bright">{eyebrow}</p>}
          <h1 className="truncate text-[16px] font-extrabold leading-tight tracking-tight text-ink dark:text-paper md:text-[18px]">{title}</h1>
          {subtitle && <div className="truncate text-[12px] font-semibold text-mist dark:text-white/50">{subtitle}</div>}
        </div>
        {right && <div className="flex shrink-0 items-center gap-1.5">{right}</div>}
      </div>
    </header>
  );
}

/** A tappable list row with a leading tile, title/meta and a chevron. */
export function Row({
  lead,
  title,
  meta,
  trailing,
  onClick,
  className = '',
  ariaLabel,
}: {
  lead?: React.ReactNode;
  title: React.ReactNode;
  meta?: React.ReactNode;
  trailing?: React.ReactNode;
  onClick: () => void;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cx(
        'focus-ring group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-ink/[0.035] active:bg-ink/[0.06] dark:hover:bg-white/[0.05] dark:active:bg-white/[0.08]',
        className,
      )}
    >
      {lead}
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14.5px] font-bold leading-snug text-ink dark:text-paper">{title}</div>
        {meta && <div className="mt-0.5 truncate text-[12px] font-semibold text-mist dark:text-white/50">{meta}</div>}
      </div>
      {trailing}
      <ChevronRight
        className="h-4 w-4 shrink-0 text-ink/30 transition-transform group-hover:translate-x-0.5 dark:text-white/30"
        strokeWidth={2.6}
        aria-hidden="true"
      />
    </button>
  );
}

/** Rounded monogram tile ("DU", "GST"…) tinted per category. */
export function Monogram({ text, hue, className = '' }: { text: string; hue: number; className?: string }) {
  return (
    <span
      className={cx('grid shrink-0 place-items-center rounded-2xl font-display text-[13px] font-extrabold tracking-tight ring-1 ring-inset', className)}
      style={{
        background: `hsl(${hue} 90% 95%)`,
        color: `hsl(${hue} 60% 30%)`,
        boxShadow: `inset 0 0 0 1px hsl(${hue} 60% 60% / 0.35)`,
      }}
      aria-hidden="true"
    >
      {text}
    </span>
  );
}

export function Stat({
  value,
  label,
  className = '',
  tone = 'neutral',
}: {
  value: React.ReactNode;
  label: string;
  className?: string;
  tone?: 'neutral' | 'emerald' | 'flag' | 'brand';
}) {
  const color = {
    neutral: 'text-ink dark:text-paper',
    emerald: 'text-emerald-700 dark:text-emerald-300',
    flag: 'text-flag dark:text-red-300',
    brand: 'text-brand-deep dark:text-brand-bright',
  }[tone];
  return (
    <div className={cx('rounded-2xl bg-ink/[0.04] px-3 py-2.5 dark:bg-white/[0.06]', className)}>
      <div className={cx('font-body text-[20px] font-bold leading-none tabular-nums', color)}>{value}</div>
      <div className="mt-1 text-[11px] font-bold text-mist dark:text-white/50">{label}</div>
    </div>
  );
}

export function Empty({ icon: Icon, title, body, action }: { icon: LucideIcon; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ink/[0.05] text-ink/50 dark:bg-white/[0.07] dark:text-white/50">
        <Icon className="h-7 w-7" strokeWidth={2} aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-[16px] font-extrabold text-ink dark:text-paper">{title}</h3>
      {body && <p className="mt-1 max-w-xs text-[13px] font-semibold leading-relaxed text-mist dark:text-white/50">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Bottom sheet on phones, centred dialog on larger screens. Dark aware. */
export function Sheet({
  open,
  onClose,
  label,
  children,
  size = 'sm',
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
  size?: 'sm' | 'md';
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/60 p-0 font-body backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.34, ease: EASE }}
            className={cx(
              'w-full overflow-y-auto rounded-t-[28px] bg-white p-5 text-ink shadow-[0_40px_90px_-40px_rgba(22,18,16,0.7)] ring-1 ring-ink/8 dark:bg-ink-2 dark:text-paper dark:ring-white/10 sm:rounded-[28px] sm:p-6',
              size === 'md' ? 'sm:max-w-lg' : 'sm:max-w-md',
              'max-h-[92dvh]',
            )}
            style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SheetHeader({
  icon: Icon,
  title,
  description,
  onClose,
  tone = 'brand',
}: {
  icon: LucideIcon;
  title: string;
  description?: React.ReactNode;
  onClose: () => void;
  tone?: 'brand' | 'emerald' | 'flag' | 'ink';
}) {
  const tones = {
    brand: 'bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-bright',
    emerald: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300',
    flag: 'bg-flag/10 text-flag dark:bg-flag/20 dark:text-red-300',
    ink: 'bg-ink text-white dark:bg-paper dark:text-ink',
  }[tone];
  return (
    <div className="flex items-start gap-3.5">
      <span className={cx('grid h-12 w-12 shrink-0 place-items-center rounded-2xl', tones)} aria-hidden="true">
        <Icon className="h-6 w-6" strokeWidth={2.2} />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <h2 className="text-[18px] font-extrabold leading-snug tracking-tight text-ink dark:text-paper">{title}</h2>
        {description && <div className="mt-1 text-[13.5px] font-semibold leading-relaxed text-mist dark:text-white/55">{description}</div>}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="বন্ধ করো"
        className="focus-ring -mr-1 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink/60 hover:bg-ink/5 hover:text-ink dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <X className="h-[18px] w-[18px]" strokeWidth={2.4} />
      </button>
    </div>
  );
}

/** Horizontal scroller that hides its scrollbar. */
export function Scroller({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={cx('no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0', className)}>{children}</div>;
}
