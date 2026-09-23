import React, { useEffect, useRef } from 'react';
import { motion, MotionConfig } from 'motion/react';
import { ArrowLeft, Check } from 'lucide-react';
import { toBanglaDigits } from '../../utils/phone';
import { EASE } from './ui';

/*
 * Chrome shared by every step of the mock-test builder: ambient background,
 * glass header with back button + step rail, scrollable body and an optional
 * sticky footer. The page sits inside MainLayout's <main> (h-full, overflow
 * hidden) so the shell owns its own scroll container.
 */

export const BUILDER_STEPS = [
  { id: 'subject', title: 'বিষয়' },
  { id: 'chapter', title: 'অধ্যায়' },
  { id: 'settings', title: 'সেটিংস' },
] as const;

interface Props {
  /** Index of the active step (0–2). */
  step: number;
  /** Steps the student may jump to from the rail. */
  canJumpTo?: (index: number) => boolean;
  onJump?: (index: number) => void;
  eyebrow: string;
  title: string;
  subtitle?: React.ReactNode;
  onBack: () => void;
  backLabel: string;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  /** Hide the step rail (flash cards / loading). */
  hideRail?: boolean;
  children: React.ReactNode;
  /** Key that re-triggers the content enter animation. */
  contentKey: string;
}

export default function BuilderShell({
  step,
  canJumpTo,
  onJump,
  eyebrow,
  title,
  subtitle,
  onBack,
  backLabel,
  headerAction,
  footer,
  hideRail,
  children,
  contentKey,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Each step starts at the top with focus on its heading (screen readers announce the new step).
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    titleRef.current?.focus({ preventScroll: true });
  }, [contentKey]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="pk-landing relative flex h-full flex-col overflow-hidden bg-paper font-body text-ink">
        {/* Ambient */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -top-40 right-[-160px] h-[480px] w-[480px] rounded-full bg-[radial-gradient(closest-side,rgba(255,82,0,0.12),transparent)] blur-3xl" />
          <div className="absolute bottom-[-180px] left-[-160px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(255,185,46,0.16),transparent)] blur-3xl" />
        </div>

        {/* Header */}
        <header className="relative z-20 shrink-0 border-b border-ink/8 bg-white/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={onBack}
              aria-label={backLabel}
              title={backLabel}
              className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink/5 text-ink/70 transition-colors hover:bg-ink/10 hover:text-ink"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={2.4} />
            </button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-bold uppercase tracking-[0.2em] text-mist">{eyebrow}</p>
              <h1
                ref={titleRef}
                tabIndex={-1}
                className="truncate font-bangla text-[19px] font-extrabold leading-tight tracking-tight text-ink outline-none sm:text-[21px]"
              >
                {title}
              </h1>
            </div>

            {headerAction}

            {!hideRail && (
              <ol className="hidden items-center gap-1 md:flex" aria-label="ধাপসমূহ">
                {BUILDER_STEPS.map((s, i) => {
                  const state = i < step ? 'done' : i === step ? 'active' : 'todo';
                  const clickable = !!onJump && !!canJumpTo?.(i) && i !== step;
                  return (
                    <li key={s.id} className="flex items-center">
                      <button
                        type="button"
                        disabled={!clickable}
                        onClick={() => onJump?.(i)}
                        aria-current={state === 'active' ? 'step' : undefined}
                        className={`focus-ring flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 text-[13px] font-bold transition-all duration-300 ${
                          state === 'active'
                            ? 'bg-ink text-white shadow-[0_10px_24px_-12px_rgba(22,18,16,0.6)]'
                            : state === 'done'
                              ? 'text-brand-deep hover:bg-mint disabled:hover:bg-transparent'
                              : 'text-mist'
                        } disabled:cursor-default`}
                      >
                        <span
                          className={`grid h-6 w-6 place-items-center rounded-full text-[11.5px] ${
                            state === 'done' ? 'bg-brand text-white' : state === 'active' ? 'bg-white/15 text-white' : 'bg-ink/8 text-mist'
                          }`}
                        >
                          {state === 'done' ? <Check className="h-3.5 w-3.5" strokeWidth={3.5} /> : toBanglaDigits(i + 1)}
                        </span>
                        {s.title}
                      </button>
                      {i < BUILDER_STEPS.length - 1 && <span className={`mx-0.5 h-px w-4 ${i < step ? 'bg-brand' : 'bg-ink/15'}`} aria-hidden="true" />}
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          {/* Mobile progress */}
          {!hideRail && (
            <div className="mx-auto max-w-5xl px-4 pb-2.5 sm:px-6 md:hidden">
              <div className="flex gap-1.5" aria-hidden="true">
                {BUILDER_STEPS.map((s, i) => (
                  <span key={s.id} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= step ? 'bg-brand' : 'bg-ink/10'}`} />
                ))}
              </div>
              <p className="mt-1.5 text-[11.5px] font-bold text-mist">
                ধাপ {toBanglaDigits(step + 1)}/৩ · <span className="text-brand-deep">{BUILDER_STEPS[step]?.title}</span>
              </p>
            </div>
          )}
        </header>

        {/* Body */}
        <div ref={scrollRef} className="relative z-10 min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          <motion.div
            key={contentKey}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className={`mx-auto w-full min-w-0 max-w-5xl px-4 pt-5 sm:px-6 ${footer ? 'pb-44' : 'pb-16'}`}
          >
            {subtitle && <div className="mb-5 text-[14px] leading-relaxed text-mist">{subtitle}</div>}
            {children}
          </motion.div>
        </div>

        {/* Footer */}
        {footer && (
          <motion.footer
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="absolute inset-x-0 bottom-0 z-20 border-t border-ink/8 bg-white/85 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 backdrop-blur-xl"
          >
            <div className="mx-auto max-w-5xl px-4 sm:px-6">{footer}</div>
          </motion.footer>
        )}
      </div>
    </MotionConfig>
  );
}
