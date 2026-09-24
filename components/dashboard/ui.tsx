import React from 'react';
import { ChevronRight, type LucideIcon } from 'lucide-react';

/*
 * Small presentational primitives shared by the dashboard sections. The
 * dashboard opts into dark mode explicitly (`.pk-landing.dash`), so every
 * primitive carries its own `dark:` variants.
 */

export const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export const cx = (...parts: Array<string | false | null | undefined>): string => parts.filter(Boolean).join(' ');

export function Card({
  children,
  className = '',
  as: Tag = 'section',
  ...rest
}: React.HTMLAttributes<HTMLElement> & { as?: 'section' | 'div' | 'article' | 'button'; children: React.ReactNode }) {
  const Component = Tag as React.ElementType;
  return (
    <Component
      className={cx(
        'relative rounded-[26px] bg-white ring-1 ring-ink/8 shadow-[0_18px_44px_-32px_rgba(22,18,16,0.35)] dark:bg-ink-2 dark:ring-white/10 dark:shadow-none',
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

export function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  action,
  onAction,
  className = '',
}: {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div className={cx('flex items-center gap-3', className)}>
      {Icon && (
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand-deep dark:bg-brand/20 dark:text-brand-bright">
          <Icon className="h-[18px] w-[18px]" strokeWidth={2.4} aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-[15px] font-extrabold tracking-tight text-ink dark:text-paper sm:text-[16px]">{title}</h2>
        {subtitle && <p className="truncate text-[12px] font-semibold text-mist dark:text-white/50">{subtitle}</p>}
      </div>
      {action && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="focus-ring inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-1 text-[12.5px] font-extrabold text-brand-deep transition-colors hover:bg-brand/10 dark:text-brand-bright"
        >
          {action}
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.8} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export function Track({ value, tone = 'brand', className = '' }: { value: number; tone?: 'brand' | 'gold' | 'flag' | 'lime' | 'white'; className?: string }) {
  const fill = { brand: 'bg-brand', gold: 'bg-gold', flag: 'bg-flag', lime: 'bg-lime', white: 'bg-white' }[tone];
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className={cx('h-1.5 w-full overflow-hidden rounded-full bg-ink/8 dark:bg-white/10', className)} role="presentation">
      <div className={cx('h-full rounded-full transition-[width] duration-700 ease-out', fill)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Avatar({
  src,
  name,
  className = '',
  textClassName = 'text-[15px]',
}: {
  src?: string | null;
  name?: string | null;
  className?: string;
  textClassName?: string;
}) {
  const initial = (name || '').trim().charAt(0).toUpperCase() || 'শ';
  if (src && src !== 'false' && /^https?:/.test(src)) {
    return (
      <img src={src} alt="" className={cx('rounded-full bg-ink/5 object-cover dark:bg-white/10', className)} referrerPolicy="no-referrer" draggable={false} />
    );
  }
  return (
    <span className={cx('ring-conic grid place-items-center rounded-full font-extrabold text-white', textClassName, className)} aria-hidden="true">
      {initial}
    </span>
  );
}

export function Eyebrow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={cx('text-[11px] font-bold tracking-[0.04em]', className)}>{children}</p>;
}

/** Skeleton shimmer used while the first stats request is in flight. */
export function Bone({ className = '' }: { className?: string }) {
  return <div className={cx('animate-pulse rounded-2xl bg-ink/8 dark:bg-white/10', className)} aria-hidden="true" />;
}
