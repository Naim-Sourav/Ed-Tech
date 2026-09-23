import React from 'react';
import { motion } from 'motion/react';
import { ALargeSmall, ChevronLeft, ChevronRight, Clock, Flag, LayoutGrid, LayoutList, Rows3, X, Zap } from 'lucide-react';
import { Button, Chip, Dialog, DialogHeader, IconButton, ProgressTrack } from './ui';
import { bn, formatClock, isAnswered, type Answer, type ExamMode } from './model';

/* Header, palette and bottom bar of the exam screen. */

export interface TimerState {
  /** Seconds left (timed) or elapsed (untimed). */
  seconds: number;
  timed: boolean;
  /** Under 20 % of the limit or under a minute. */
  low: boolean;
}

export function ExamHeader({
  title,
  chips,
  timer,
  mode,
  onToggleView,
  onCycleFontSize,
  onExit,
  progress,
}: {
  title: string;
  chips: string[];
  timer: TimerState | null;
  mode: ExamMode;
  onToggleView?: () => void;
  onCycleFontSize: () => void;
  onExit: () => void;
  progress: number;
}) {
  return (
    <header className="relative z-30 shrink-0 border-b border-ink/8 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center gap-2.5 px-3 py-2.5 sm:gap-3 sm:px-6">
        <IconButton label="পরীক্ষা থেকে বের হও" icon={X} onClick={onExit} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-bangla text-[15px] font-bold leading-tight text-ink sm:text-[17px]" title={title}>
            {title}
          </h1>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-[11.5px] font-semibold text-mist sm:text-[12px]">
            {chips.map((c, i) => (
              <React.Fragment key={c}>
                {i > 0 && <span aria-hidden="true">·</span>}
                <span className="min-w-0 shrink truncate">{c}</span>
              </React.Fragment>
            ))}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <IconButton label="লেখার আকার বদলাও" icon={ALargeSmall} onClick={onCycleFontSize} className="hidden sm:grid" />
          {onToggleView && mode !== 'RAPID_FIRE' && (
            <button
              type="button"
              onClick={onToggleView}
              className="focus-ring hidden h-10 items-center gap-1.5 rounded-full border border-ink/10 bg-white px-3.5 text-[12.5px] font-bold text-ink/70 transition-colors hover:border-ink/20 hover:text-ink sm:inline-flex"
              title={mode === 'SINGLE_PAGE' ? 'সব প্রশ্ন এক পাতায় দেখো' : 'একটা করে প্রশ্ন দেখো'}
            >
              {mode === 'SINGLE_PAGE' ? <Rows3 className="h-4 w-4" strokeWidth={2.3} /> : <LayoutList className="h-4 w-4" strokeWidth={2.3} />}
              {mode === 'SINGLE_PAGE' ? 'সব এক পাতায়' : 'একটা করে'}
            </button>
          )}
          {timer && <TimerPill timer={timer} />}
        </div>
      </div>
      <div className="absolute inset-x-0 -bottom-px">
        <ProgressTrack value={progress} tone={timer?.low ? 'flag' : 'brand'} className="h-[3px]" label={timer?.timed ? 'সময় অতিবাহিত' : 'অগ্রগতি'} />
      </div>
    </header>
  );
}

export function TimerPill({ timer }: { timer: TimerState }) {
  return (
    <div
      className={`flex h-10 items-center gap-1.5 rounded-full border px-3 font-body text-[14px] font-extrabold tabular-nums transition-colors ${
        timer.low ? 'border-flag/30 bg-flag/10 text-flag' : 'border-ink/10 bg-white text-ink'
      }`}
      role="timer"
      aria-live={timer.low ? 'polite' : 'off'}
      aria-label={timer.timed ? 'বাকি সময়' : 'অতিবাহিত সময়'}
      title={timer.timed ? 'বাকি সময়' : 'অতিবাহিত সময়'}
    >
      {timer.timed ? (
        <Clock className={`h-4 w-4 ${timer.low ? 'animate-pulse' : 'text-brand'}`} strokeWidth={2.4} aria-hidden="true" />
      ) : (
        <Zap className="h-4 w-4 text-brand" strokeWidth={2.4} aria-hidden="true" />
      )}
      <span>{formatClock(timer.seconds)}</span>
    </div>
  );
}

/* ── palette ─────────────────────────────────────────────────────────── */

export interface PaletteProps {
  total: number;
  answers: Answer[];
  flagged: ReadonlySet<number>;
  current: number | null;
  onJump: (index: number) => void;
  compact?: boolean;
}

const cellClass = (state: 'answered' | 'flagged' | 'idle', isCurrent: boolean): string => {
  const base = 'focus-ring grid h-10 place-items-center rounded-xl font-body text-[13px] font-extrabold tabular-nums transition-all duration-200';
  const tone =
    state === 'flagged' ? 'bg-lime text-ink-950' : state === 'answered' ? 'bg-ink text-white' : 'bg-white text-ink/70 ring-1 ring-ink/12 hover:ring-brand/50';
  return `${base} ${tone} ${isCurrent ? 'outline outline-2 outline-offset-2 outline-brand' : ''}`;
};

export function Palette({ total, answers, flagged, current, onJump, compact = false }: PaletteProps) {
  const answered = answers.filter(isAnswered).length;
  return (
    <div>
      <div className={`grid gap-2 ${compact ? 'grid-cols-6' : 'grid-cols-5'}`}>
        {Array.from({ length: total }, (_, i) => {
          const state = flagged.has(i) ? 'flagged' : isAnswered(answers[i]) ? 'answered' : 'idle';
          return (
            <button
              key={i}
              type="button"
              onClick={() => onJump(i)}
              className={cellClass(state, current === i)}
              aria-label={`প্রশ্ন ${bn(i + 1)}`}
              aria-current={current === i ? 'true' : undefined}
            >
              {bn(i + 1)}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] font-semibold text-mist">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-ink" aria-hidden="true" /> উত্তর দেওয়া {bn(answered)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-lime" aria-hidden="true" /> পরে দেখব {bn(flagged.size)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-white ring-1 ring-ink/15" aria-hidden="true" /> বাকি {bn(total - answered)}
        </span>
      </div>
    </div>
  );
}

export function PaletteSheet({
  open,
  onClose,
  toolbar,
  onSubmit,
  ...palette
}: PaletteProps & { open: boolean; onClose: () => void; toolbar?: React.ReactNode; onSubmit?: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} label="প্রশ্ন তালিকা" size="md">
      <DialogHeader icon={LayoutGrid} tone="neutral" title="প্রশ্ন তালিকা" description="যে প্রশ্নে যেতে চাও, তার নম্বরে চাপ দাও।" onClose={onClose} />
      <div className="mt-5 max-h-[48dvh] overflow-y-auto pr-1">
        <Palette {...palette} compact />
      </div>
      {(toolbar || onSubmit) && (
        <div className="mt-4 space-y-3 border-t border-ink/8 pt-4">
          {toolbar}
          {onSubmit && (
            <Button variant="ink" onClick={onSubmit} className="h-11 w-full">
              পরীক্ষা শেষ করো
            </Button>
          )}
        </div>
      )}
    </Dialog>
  );
}

/** Phone-only settings row (the header hides these controls below `sm`). */
export function MobileToolbar({
  mode,
  onToggleView,
  onCycleFontSize,
  fontLabel,
}: {
  mode: ExamMode;
  onToggleView?: () => void;
  onCycleFontSize: () => void;
  fontLabel: string;
}) {
  return (
    <div className="flex flex-wrap gap-2 sm:hidden">
      {onToggleView && mode !== 'RAPID_FIRE' && (
        <button
          type="button"
          onClick={onToggleView}
          className="focus-ring inline-flex h-10 items-center gap-1.5 rounded-full border border-ink/10 bg-white px-3.5 text-[12.5px] font-bold text-ink/70"
        >
          {mode === 'SINGLE_PAGE' ? <Rows3 className="h-4 w-4" strokeWidth={2.3} /> : <LayoutList className="h-4 w-4" strokeWidth={2.3} />}
          {mode === 'SINGLE_PAGE' ? 'সব এক পাতায় দেখো' : 'একটা করে দেখো'}
        </button>
      )}
      <button
        type="button"
        onClick={onCycleFontSize}
        className="focus-ring inline-flex h-10 items-center gap-1.5 rounded-full border border-ink/10 bg-white px-3.5 text-[12.5px] font-bold text-ink/70"
      >
        <ALargeSmall className="h-4 w-4" strokeWidth={2.3} /> লেখার আকার: {fontLabel}
      </button>
    </div>
  );
}

/* ── bottom bar ──────────────────────────────────────────────────────── */

export function BottomBar({
  mode,
  current,
  total,
  answers,
  flagged,
  onPrev,
  onNext,
  onOpenPalette,
  onSubmit,
  onToggleFlag,
  rapidReady,
  onRapidNext,
}: {
  mode: ExamMode;
  current: number;
  total: number;
  answers: Answer[];
  flagged: ReadonlySet<number>;
  onPrev: () => void;
  onNext: () => void;
  onOpenPalette: () => void;
  onSubmit: () => void;
  onToggleFlag: () => void;
  rapidReady: boolean;
  onRapidNext: () => void;
}) {
  const answered = answers.filter(isAnswered).length;
  const isLast = current === total - 1;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40">
      <div className="pointer-events-auto border-t border-ink/8 bg-white/85 backdrop-blur-xl" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3">
          {mode === 'RAPID_FIRE' ? (
            <>
              <button
                type="button"
                onClick={onOpenPalette}
                className="focus-ring inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-ink/10 bg-white px-3.5 text-[13px] font-extrabold tabular-nums text-ink/80 hover:border-ink/20"
              >
                <LayoutGrid className="h-4 w-4" strokeWidth={2.3} aria-hidden="true" />
                {bn(current + 1)} / {bn(total)}
              </button>
              <motion.div className="flex-1" initial={false} animate={{ opacity: rapidReady ? 1 : 0.55 }}>
                <Button onClick={onRapidNext} disabled={!rapidReady} variant="primary" className="h-11 w-full" iconRight={ChevronRight}>
                  {rapidReady ? (isLast ? 'ফলাফল দেখো' : 'পরের প্রশ্ন') : 'আগে সঠিক উত্তরটা বাছো'}
                </Button>
              </motion.div>
            </>
          ) : mode === 'SINGLE_PAGE' ? (
            <>
              <IconButton label="আগের প্রশ্ন" icon={ChevronLeft} onClick={onPrev} disabled={current === 0} className="h-11 w-11" />
              <button
                type="button"
                onClick={onOpenPalette}
                className="focus-ring inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-full border border-ink/10 bg-white px-3 text-[13px] font-extrabold tabular-nums text-ink/80 hover:border-ink/20 sm:flex-none sm:px-4"
                title="প্রশ্ন তালিকা (G)"
              >
                <LayoutGrid className="h-4 w-4 shrink-0" strokeWidth={2.3} aria-hidden="true" />
                <span className="truncate">
                  {bn(current + 1)} / {bn(total)}
                </span>
                <span className="hidden text-ink/35 sm:inline">·</span>
                <span className="hidden text-mist sm:inline">{bn(answered)} উত্তর</span>
              </button>
              <IconButton
                label={flagged.has(current) ? 'ফ্ল্যাগ তুলে নাও' : 'পরে দেখব'}
                icon={Flag}
                onClick={onToggleFlag}
                active={flagged.has(current)}
                className="hidden h-11 w-11 sm:grid"
              />
              <span className="hidden flex-1 sm:block" />
              {isLast ? (
                <Button onClick={onSubmit} variant="ink" className="h-11 shrink-0 px-5">
                  পরীক্ষা শেষ করো
                </Button>
              ) : (
                <Button onClick={onNext} variant="primary" className="h-11 shrink-0 px-5" iconRight={ChevronRight}>
                  পরের প্রশ্ন
                </Button>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onOpenPalette}
                className="focus-ring inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-ink/10 bg-white px-3.5 text-[13px] font-extrabold tabular-nums text-ink/80 hover:border-ink/20 lg:hidden"
                title="প্রশ্ন তালিকা (G)"
              >
                <LayoutGrid className="h-4 w-4" strokeWidth={2.3} aria-hidden="true" />
                {bn(answered)} / {bn(total)}
              </button>
              <div className="hidden min-w-0 flex-1 items-center gap-2 lg:flex">
                <Chip tone="neutral">
                  {bn(answered)} / {bn(total)} উত্তর দেওয়া
                </Chip>
                {flagged.size > 0 && <Chip tone="gold">{bn(flagged.size)} টি পরে দেখব</Chip>}
              </div>
              <Button onClick={onSubmit} variant="ink" className="h-11 flex-1 lg:flex-none lg:px-7">
                পরীক্ষা শেষ করো
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
