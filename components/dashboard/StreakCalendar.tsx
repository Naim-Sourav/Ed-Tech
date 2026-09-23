import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronLeft, ChevronRight, Flame, X, Zap } from 'lucide-react';
import Lottie from 'lottie-react';
import fireAnimation from '../../assets/lottie/fire.json';
import { bn, dhakaParts, monthGrid, nextMilestone, shiftMonth, WEEK_LABELS } from './model';
import { EASE, cx } from './ui';

/*
 * Month-by-month view of the activity log. Rendered on the warm ink surface
 * in both themes so the flame artwork always sits on a dark background.
 */

export default function StreakCalendar({
  open,
  onClose,
  streak,
  longest,
  activityLog,
  todayActive,
  onPractice,
  now = new Date(),
}: {
  open: boolean;
  onClose: () => void;
  streak: number;
  longest: number;
  activityLog: string[];
  todayActive: boolean;
  onPractice: () => void;
  now?: Date;
}) {
  const today = useMemo(() => dhakaParts(now), [now]);
  const [cursor, setCursor] = useState({ year: today.year, month: today.month });

  useEffect(() => {
    if (open) setCursor({ year: today.year, month: today.month });
  }, [open, today.year, today.month]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const grid = useMemo(() => monthGrid(cursor.year, cursor.month, activityLog, now), [cursor, activityLog, now]);
  const isCurrentMonth = cursor.year === today.year && cursor.month === today.month;
  const milestone = nextMilestone(streak);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-end justify-center bg-ink/70 p-0 font-body backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="ধারাবাহিকতার ক্যালেন্ডার"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="noise relative max-h-[92dvh] w-full overflow-y-auto overflow-x-hidden rounded-t-[30px] bg-ink text-white shadow-[0_40px_90px_-40px_rgba(0,0,0,0.8)] ring-1 ring-white/10 sm:max-w-md sm:rounded-[30px]"
            style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full blur-3xl"
              style={{ background: 'conic-gradient(from 120deg, rgba(255,82,0,0), rgba(255,82,0,0.5), rgba(255,185,46,0.35), rgba(255,82,0,0))' }}
            />

            <div className="sticky top-0 z-10 flex items-center justify-between bg-ink/80 px-5 pb-2 pt-4 backdrop-blur-md">
              <h2 className="text-[16px] font-extrabold">ধারাবাহিকতা</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="বন্ধ করো"
                className="focus-ring grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <X className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />
              </button>
            </div>

            <div className="relative px-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className={cx('text-[72px] font-bold leading-none tabular-nums', streak > 0 ? 'text-lime' : 'text-white/40')}>{bn(streak)}</p>
                  <p className="mt-1 text-[15px] font-extrabold text-white/85">দিনের ধারাবাহিকতা</p>
                  <p className="mt-0.5 text-[12.5px] font-semibold text-white/55">
                    সেরা {bn(Math.max(longest, streak))} দিন · {bn(milestone.target)} দিনের ব্যাজে আর {bn(milestone.remaining)} দিন
                  </p>
                </div>
                <div className="relative h-28 w-28 shrink-0" aria-hidden="true">
                  {streak > 0 ? (
                    <Lottie animationData={fireAnimation} loop className="h-full w-full scale-[1.3] drop-shadow-[0_0_30px_rgba(255,150,0,0.55)]" />
                  ) : (
                    <span className="grid h-full w-full place-items-center rounded-full bg-white/5 text-white/30">
                      <Flame className="h-12 w-12" strokeWidth={1.8} />
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/6 p-4">
                <p className="text-[13.5px] font-bold leading-relaxed text-white/85">
                  {todayActive
                    ? 'দারুণ! আজকের প্র্যাকটিস হয়ে গেছে — কাল আবার এসে স্ট্রিকটা বাড়িয়ে নিও।'
                    : streak > 0
                      ? 'আজ এখনো কিছু দাওনি। একটা ছোট মক দিলেই স্ট্রিকটা টিকে যাবে।'
                      : 'আজ একটা মক দাও — সেটাই হবে নতুন স্ট্রিকের প্রথম দিন।'}
                </p>
                {!todayActive && (
                  <button
                    type="button"
                    onClick={onPractice}
                    className="focus-ring mt-3 inline-flex h-10 items-center gap-2 rounded-full bg-lime px-4 text-[13px] font-black text-ink-950"
                  >
                    <Zap className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />
                    আজকের মক দাও
                  </button>
                )}
              </div>

              <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCursor((c) => shiftMonth(c.year, c.month, -1))}
                    aria-label="আগের মাস"
                    className="focus-ring grid h-9 w-9 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <ChevronLeft className="h-5 w-5" strokeWidth={2.4} aria-hidden="true" />
                  </button>
                  <div className="text-center">
                    <p className="text-[15px] font-extrabold">{grid.label}</p>
                    <p className="text-[11.5px] font-semibold text-white/50">এই মাসে {bn(grid.activeDays)} দিন সক্রিয়</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCursor((c) => shiftMonth(c.year, c.month, 1))}
                    disabled={isCurrentMonth}
                    aria-label="পরের মাস"
                    className="focus-ring grid h-9 w-9 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronRight className="h-5 w-5" strokeWidth={2.4} aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-7 gap-y-2 text-center">
                  {WEEK_LABELS.map((d) => (
                    <span key={d} className="text-[10.5px] font-black uppercase tracking-wider text-white/45">
                      {d}
                    </span>
                  ))}
                  {grid.cells.map((cell, i) =>
                    cell ? (
                      <span key={cell.key} className="flex justify-center">
                        <span
                          title={cell.key}
                          className={cx(
                            'relative grid h-9 w-9 place-items-center rounded-full text-[13px] font-extrabold tabular-nums transition-colors',
                            cell.active
                              ? cell.isToday
                                ? 'bg-lime text-ink-950 shadow-[0_0_18px_rgba(255,185,46,0.55)] ring-4 ring-lime/25'
                                : 'bg-brand/20 text-lime ring-1 ring-brand/50'
                              : cell.isToday
                                ? 'border-2 border-dashed border-lime/70 text-lime'
                                : cell.future
                                  ? 'text-white/20'
                                  : 'text-white/45',
                          )}
                        >
                          {bn(cell.day)}
                          {cell.active && (
                            <span className="absolute -bottom-0.5 -right-0.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-ink">
                              <span className="grid h-3 w-3 place-items-center rounded-full bg-brand text-white">
                                <Check className="h-2 w-2" strokeWidth={4} aria-hidden="true" />
                              </span>
                            </span>
                          )}
                        </span>
                      </span>
                    ) : (
                      <span key={`pad-${i}`} />
                    ),
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
