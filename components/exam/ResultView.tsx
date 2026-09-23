import React, { useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { BarChart3, CheckCircle2, ChevronLeft, ChevronRight, Home, Layers, RotateCcw, Sparkles, Timer, TrendingDown, Trophy, XCircle } from 'lucide-react';
import type { QuizQuestion } from '../../types';
import { useCelebration } from './useCelebration';
import QuestionCard, { type FontSizeStep } from './QuestionCard';
import { Button, Chip, EASE, Stat, Surface } from './ui';
import {
  averageSecondsPerQuestion,
  bn,
  chapterBreakdown,
  filterForReview,
  formatDurationBn,
  formatScore,
  isStimulusHead,
  stimulusRange,
  summarize,
  verdictFor,
  weakChapters,
  type Answer,
  type ExamConfig,
  type ReviewFilter,
} from './model';

export interface LeaderboardEntry {
  id?: string;
  userId?: string;
  name?: string;
  guestInfo?: { name?: string };
  score?: number;
  correct?: number;
  wrong?: number;
  timeTaken?: number;
  result?: { score?: number; correct?: number; wrong?: number };
}

export interface LeaderboardProps {
  entries: LeaderboardEntry[];
  loading: boolean;
  page: number;
  pageSize: number;
  onPage: (page: number) => void;
  userRank: number | null;
  currentUserId?: string;
  currentUserName?: string;
  mine: { score: number; correct: number; wrong: number; duration: number };
}

export interface ResultViewProps {
  questions: QuizQuestion[];
  answers: Answer[];
  config: ExamConfig | null;
  duration: number;
  flagged: ReadonlySet<number>;
  saved: ReadonlySet<number>;
  onToggleSave: (index: number) => void;
  fontFor: (text?: string) => string;
  fontSize: FontSizeStep;
  clearedMistakes: number;
  reviewFilter: ReviewFilter;
  onReviewFilter: (filter: ReviewFilter) => void;
  onRetake: () => void;
  onDashboard: () => void;
  /** Fire the confetti burst for high scores (parent turns it off while another celebration is up). */
  celebrate?: boolean;
  leaderboard?: LeaderboardProps;
}

const FILTERS: Array<{ id: ReviewFilter; label: string }> = [
  { id: 'ALL', label: 'সব' },
  { id: 'CORRECT', label: 'সঠিক' },
  { id: 'WRONG', label: 'ভুল' },
  { id: 'SKIPPED', label: 'বাদ' },
  { id: 'FLAGGED', label: 'ফ্ল্যাগ' },
];

const ResultView: React.FC<ResultViewProps> = ({
  questions,
  answers,
  config,
  duration,
  flagged,
  saved,
  onToggleSave,
  fontFor,
  fontSize,
  clearedMistakes,
  reviewFilter,
  onReviewFilter,
  onRetake,
  onDashboard,
  celebrate = true,
  leaderboard,
}) => {
  const isRapid = config?.mode === 'RAPID_FIRE';
  const summary = useMemo(() => summarize(questions, answers, config?.negativeMarking || 0), [questions, answers, config?.negativeMarking]);
  const chapters = useMemo(() => chapterBreakdown(questions, answers), [questions, answers]);
  const weak = useMemo(() => weakChapters(chapters), [chapters]);
  const verdict = verdictFor(summary.percentage);
  const avg = averageSecondsPerQuestion(duration, summary.total);
  const reviewRef = useRef<HTMLDivElement>(null);
  useCelebration(celebrate && !isRapid && summary.percentage >= 80);

  const filtered = useMemo(() => filterForReview(questions, answers, reviewFilter, flagged), [questions, answers, reviewFilter, flagged]);
  const counts: Record<ReviewFilter, number> = {
    ALL: summary.total,
    CORRECT: summary.correct,
    WRONG: summary.wrong,
    SKIPPED: summary.skipped,
    FLAGGED: flagged.size,
  };

  const jumpToReview = (filter: ReviewFilter) => {
    onReviewFilter(filter);
    window.setTimeout(() => reviewRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }), 0);
  };

  const correctP = summary.total ? (summary.correct / summary.total) * 100 : 0;
  const wrongP = summary.total ? (summary.wrong / summary.total) * 100 : 0;
  const ring = `conic-gradient(#059669 0 ${correctP}%, #e63b2e ${correctP}% ${correctP + wrongP}%, rgba(128,128,128,0.22) ${correctP + wrongP}% 100%)`;

  return (
    <div id="exam-container" className="pk-landing relative h-[100dvh] overflow-y-auto overflow-x-hidden bg-paper font-body text-ink">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 right-[-160px] h-[480px] w-[480px] rounded-full bg-[radial-gradient(closest-side,rgba(255,82,0,0.12),transparent)] blur-3xl" />
        <div className="absolute -left-40 top-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(255,185,46,0.16),transparent)] blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl px-4 pb-24 pt-5 sm:px-6 sm:pt-8">
        {clearedMistakes > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 flex items-start gap-3 rounded-[22px] bg-emerald-500/10 p-4 ring-1 ring-emerald-500/20"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" strokeWidth={2.4} aria-hidden="true" />
            <p className="text-[14px] font-semibold leading-relaxed text-emerald-700">
              দারুণ! তুমি <span className="font-extrabold">{bn(clearedMistakes)}</span> টি আগের ভুল প্রশ্ন এবার ঠিক করেছ — সেগুলো তোমার ভুলের তালিকা থেকে সরিয়ে
              দেওয়া হলো।
            </p>
          </motion.div>
        )}

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE }}>
          <Surface className="relative overflow-hidden p-6 sm:p-8">
            <div
              className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(closest-side,rgba(255,82,0,0.14),transparent)]"
              aria-hidden="true"
            />
            <div className="relative flex flex-col gap-8 md:flex-row md:items-center">
              <div className="min-w-0 flex-1">
                <Chip tone={isRapid ? 'gold' : 'brand'} icon={isRapid ? Layers : Trophy}>
                  {isRapid ? 'র‍্যাপিড ফায়ার শেষ' : 'পরীক্ষার ফলাফল'}
                </Chip>
                <h1 className="mt-3 font-bangla text-[28px] font-extrabold leading-tight text-ink sm:text-[34px]">
                  {isRapid ? 'সবগুলো কার্ড শেষ! ✨' : verdict.title}
                </h1>
                <p className="mt-1.5 max-w-md text-[15px] leading-relaxed text-mist">
                  {isRapid ? `${bn(summary.total)} টি প্রশ্নের প্রতিটির সঠিক উত্তর তুমি খুঁজে বের করেছ।` : verdict.subtitle}
                </p>

                {!isRapid && (
                  <div className="mt-5 flex items-end gap-2">
                    <span className="font-bangla text-[56px] font-extrabold leading-none tabular-nums text-ink sm:text-[68px]">
                      {formatScore(summary.score)}
                    </span>
                    <span className="pb-2 font-bangla text-[20px] font-bold text-ink/35">/ {bn(summary.total)}</span>
                  </div>
                )}

                <div className="mt-5 grid grid-cols-3 gap-2 sm:max-w-md">
                  <Stat value={bn(summary.correct)} label="সঠিক" tone="emerald" />
                  <Stat value={bn(summary.wrong)} label="ভুল" tone="flag" />
                  <Stat value={bn(summary.skipped)} label="বাদ" tone="neutral" />
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {duration > 0 && <Chip icon={Timer}>সময় লেগেছে {formatDurationBn(duration)}</Chip>}
                  {avg !== null && <Chip>গড়ে প্রশ্নপ্রতি {bn(avg)} সে</Chip>}
                  {summary.answered > 0 && !isRapid && <Chip>সঠিকতা {bn(summary.accuracy)}%</Chip>}
                  {summary.negativeMarking > 0 && (
                    <Chip tone="flag">
                      নেগেটিভ −{bn(summary.negativeMarking)} · কাটা গেছে {formatScore(summary.wrong * summary.negativeMarking)}
                    </Chip>
                  )}
                </div>
              </div>

              {!isRapid && (
                <div className="mx-auto shrink-0 md:mx-0">
                  <div className="relative h-44 w-44 sm:h-52 sm:w-52">
                    <div className="h-full w-full rounded-full" style={{ background: ring }} aria-hidden="true" />
                    <div className="absolute inset-[14px] flex flex-col items-center justify-center rounded-full bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] ring-1 ring-ink/8">
                      <span className="font-bangla text-[38px] font-extrabold leading-none tabular-nums text-ink sm:text-[44px]">
                        {bn(summary.percentage)}%
                      </span>
                      <span className="mt-1 text-[11px] font-bold uppercase tracking-widest text-mist">স্কোর</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative mt-7 flex flex-col gap-2 border-t border-ink/8 pt-6 sm:flex-row">
              {summary.wrong > 0 && !isRapid && (
                <Button variant="primary" onClick={() => jumpToReview('WRONG')} icon={XCircle} className="flex-1">
                  ভুলগুলো দেখো ({bn(summary.wrong)})
                </Button>
              )}
              <Button variant="ghost" onClick={onRetake} icon={RotateCcw} className="flex-1">
                {isRapid ? 'আবার প্র্যাকটিস করো' : 'আবার পরীক্ষা দাও'}
              </Button>
              <Button variant="ink" onClick={onDashboard} icon={Home} className="flex-1">
                ড্যাশবোর্ড
              </Button>
            </div>
          </Surface>
        </motion.div>

        {/* Chapter breakdown */}
        {!isRapid && chapters.length > 1 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE, delay: 0.08 }} className="mt-5">
            <Surface className="p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand/10 text-brand" aria-hidden="true">
                  <BarChart3 className="h-5 w-5" strokeWidth={2.3} />
                </span>
                <div>
                  <h2 className="font-bangla text-[18px] font-bold text-ink">অধ্যায়ভিত্তিক বিশ্লেষণ</h2>
                  <p className="text-[13px] text-mist">কোন অধ্যায়ে তুমি শক্ত, কোথায় আরেকটু সময় দিতে হবে।</p>
                </div>
              </div>
              <ul className="mt-5 space-y-3.5">
                {chapters.map((c) => (
                  <li key={c.key}>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-[13.5px]">
                      <span className="min-w-0 truncate font-bold text-ink">{c.label}</span>
                      <span className="shrink-0 font-extrabold tabular-nums text-ink/70">
                        {bn(c.correct)}/{bn(c.total)} <span className="text-mist">· {bn(c.pct)}%</span>
                      </span>
                    </div>
                    <div className="flex h-2 w-full overflow-hidden rounded-full bg-ink/8" aria-hidden="true">
                      <motion.span
                        className="h-full bg-emerald-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${(c.correct / c.total) * 100}%` }}
                        transition={{ duration: 0.8, ease: EASE }}
                      />
                      <motion.span
                        className="h-full bg-flag"
                        initial={{ width: 0 }}
                        animate={{ width: `${(c.wrong / c.total) * 100}%` }}
                        transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
              {weak.length > 0 && (
                <div className="mt-5 flex items-start gap-3 rounded-2xl bg-amber-50/80 p-4 ring-1 ring-amber-200/70">
                  <TrendingDown className="mt-0.5 h-5 w-5 shrink-0 text-brand-deep" strokeWidth={2.3} aria-hidden="true" />
                  <p className="text-[14px] leading-relaxed text-ink">
                    <span className="font-extrabold">আগে ঝালাই করো:</span> {weak.map((w) => w.label).join(', ')} — এখানে অর্ধেকের কম সঠিক হয়েছে।
                  </p>
                </div>
              )}
            </Surface>
          </motion.div>
        )}

        {leaderboard && <Leaderboard {...leaderboard} />}

        {/* Review */}
        <div ref={reviewRef} className="mt-8 scroll-mt-4">
          <div className="sticky top-0 z-20 -mx-4 bg-paper/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
            <div className="flex items-center gap-2">
              <h2 className="mr-1 hidden font-bangla text-[18px] font-bold text-ink sm:block">উত্তর মিলিয়ে দেখো</h2>
              <div className="-mx-1 flex min-w-0 flex-1 gap-1.5 overflow-x-auto px-1 py-0.5 [scrollbar-width:none]">
                {FILTERS.filter((f) => f.id !== 'FLAGGED' || flagged.size > 0).map((f) => {
                  const active = reviewFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => onReviewFilter(f.id)}
                      aria-pressed={active}
                      className={`focus-ring inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-bold transition-all ${
                        active ? 'bg-ink text-white shadow-[0_10px_24px_-12px_rgba(22,18,16,0.6)]' : 'bg-white text-ink/70 ring-1 ring-ink/10 hover:text-ink'
                      }`}
                    >
                      {f.label}
                      <span className={`rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${active ? 'bg-white/15 text-white' : 'bg-ink/5 text-ink/60'}`}>
                        {bn(counts[f.id])}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-4 rounded-[22px] bg-white p-8 text-center ring-1 ring-ink/8">
              <Sparkles className="mx-auto h-6 w-6 text-brand" strokeWidth={2.2} aria-hidden="true" />
              <p className="mt-2 font-bold text-ink">এই তালিকায় কোনো প্রশ্ন নেই</p>
              <p className="mt-1 text-[13.5px] text-mist">অন্য একটা ফিল্টার বেছে নাও।</p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {filtered.map(({ q, idx }) => (
                <QuestionCard
                  key={idx}
                  q={q}
                  index={idx}
                  total={questions.length}
                  answer={answers[idx]}
                  variant="review"
                  reveal
                  saved={saved.has(idx)}
                  onToggleSave={() => onToggleSave(idx)}
                  fontFor={fontFor}
                  fontSize={fontSize}
                  stimulus={isStimulusHead(questions, idx) || reviewFilter !== 'ALL' ? stimulusRange(questions, idx) : null}
                  showExplanation
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── public exam merit list ─────────────────────────────────────────── */

const MEDAL: Record<number, string> = {
  1: 'bg-lime text-ink-950',
  2: 'bg-ink/10 text-ink',
  3: 'bg-brand/15 text-brand-deep',
};

function Leaderboard({ entries, loading, page, pageSize, onPage, userRank, currentUserId, currentUserName, mine }: LeaderboardProps) {
  const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const slice = entries.slice((safePage - 1) * pageSize, safePage * pageSize);
  const userInView = slice.some((e) => e.userId && e.userId === currentUserId);

  const Row = ({
    rank,
    name,
    score,
    correct,
    wrong,
    time,
    mineRow,
  }: {
    rank: number;
    name: string;
    score: React.ReactNode;
    correct: React.ReactNode;
    wrong: React.ReactNode;
    time: string;
    mineRow: boolean;
  }) => (
    <tr className={`border-t border-ink/8 ${mineRow ? 'bg-brand/10' : ''}`}>
      <td className="py-2.5 pl-4 pr-2">
        <span className={`inline-grid h-7 w-7 place-items-center rounded-full text-[12px] font-extrabold tabular-nums ${MEDAL[rank] ?? 'text-ink/60'}`}>
          {bn(rank)}
        </span>
      </td>
      <td className="max-w-[160px] truncate py-2.5 px-2 text-[13.5px] font-bold text-ink">
        {name}
        {mineRow && <span className="ml-1.5 rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-extrabold text-white">তুমি</span>}
      </td>
      <td className="py-2.5 px-2 text-center text-[13.5px] font-extrabold tabular-nums text-ink">{score}</td>
      <td className="py-2.5 px-2 text-center text-[13px] font-bold tabular-nums text-emerald-700">{correct}</td>
      <td className="py-2.5 px-2 text-center text-[13px] font-bold tabular-nums text-flag">{wrong}</td>
      <td className="py-2.5 pl-2 pr-4 text-right text-[12.5px] font-semibold tabular-nums text-mist">{time}</td>
    </tr>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE, delay: 0.12 }} className="mt-5">
      <Surface className="overflow-hidden">
        <div className="flex items-center gap-3 p-5 pb-4 sm:p-6 sm:pb-4">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-lime text-ink-950" aria-hidden="true">
            <Trophy className="h-5 w-5" strokeWidth={2.3} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-bangla text-[18px] font-bold text-ink">মেধাতালিকা</h2>
            <p className="text-[13px] text-mist">{userRank ? `তোমার অবস্থান ${bn(userRank)} নম্বরে` : 'এই লাইভ পরীক্ষায় অংশ নেওয়া সবার ফলাফল'}</p>
          </div>
          {userRank && <Chip tone="gold">#{bn(userRank)}</Chip>}
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 px-6 pb-8 pt-2 text-[13.5px] font-semibold text-mist">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand/20 border-t-brand" aria-hidden="true" /> মেধাতালিকা আনা হচ্ছে…
          </div>
        ) : entries.length === 0 ? (
          <p className="px-6 pb-8 pt-2 text-[14px] text-mist">এখনো কেউ জমা দেয়নি — তুমিই প্রথম!</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left">
                <thead>
                  <tr className="text-[11.5px] font-extrabold uppercase tracking-wider text-mist">
                    <th className="py-2 pl-4 pr-2 font-extrabold">র‍্যাঙ্ক</th>
                    <th className="py-2 px-2 font-extrabold">নাম</th>
                    <th className="py-2 px-2 text-center font-extrabold">স্কোর</th>
                    <th className="py-2 px-2 text-center font-extrabold">সঠিক</th>
                    <th className="py-2 px-2 text-center font-extrabold">ভুল</th>
                    <th className="py-2 pl-2 pr-4 text-right font-extrabold">সময়</th>
                  </tr>
                </thead>
                <tbody>
                  {slice.map((entry, i) => {
                    const rank = (safePage - 1) * pageSize + i + 1;
                    const score = entry.score !== undefined ? entry.score : entry.result?.score;
                    const correct = entry.correct !== undefined ? entry.correct : entry.result?.correct;
                    const wrong = entry.wrong !== undefined ? entry.wrong : entry.result?.wrong;
                    return (
                      <Row
                        key={entry.id ?? `${rank}`}
                        rank={rank}
                        name={entry.name || entry.guestInfo?.name || 'অজ্ঞাতনামা'}
                        score={typeof score === 'number' ? formatScore(score) : '—'}
                        correct={correct !== undefined ? bn(correct) : '—'}
                        wrong={wrong !== undefined ? bn(wrong) : '—'}
                        time={formatDurationBn(entry.timeTaken)}
                        mineRow={!!entry.userId && entry.userId === currentUserId}
                      />
                    );
                  })}
                  {!userInView && userRank && (
                    <>
                      <tr className="border-t border-dashed border-ink/15">
                        <td colSpan={6} className="py-1 text-center text-[12px] text-ink/35">
                          ⋯
                        </td>
                      </tr>
                      <Row
                        rank={userRank}
                        name={currentUserName || 'তুমি'}
                        score={formatScore(mine.score)}
                        correct={bn(mine.correct)}
                        wrong={bn(mine.wrong)}
                        time={formatDurationBn(mine.duration)}
                        mineRow
                      />
                    </>
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-ink/8 px-4 py-3">
                <button
                  type="button"
                  onClick={() => onPage(Math.max(1, safePage - 1))}
                  disabled={safePage === 1}
                  className="focus-ring inline-flex h-9 items-center gap-1 rounded-full px-3 text-[13px] font-bold text-ink/70 hover:bg-ink/5 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={2.4} /> আগের
                </button>
                <span className="text-[13px] font-semibold tabular-nums text-mist">
                  পাতা {bn(safePage)} / {bn(totalPages)}
                </span>
                <button
                  type="button"
                  onClick={() => onPage(Math.min(totalPages, safePage + 1))}
                  disabled={safePage === totalPages}
                  className="focus-ring inline-flex h-9 items-center gap-1 rounded-full px-3 text-[13px] font-bold text-ink/70 hover:bg-ink/5 disabled:opacity-40"
                >
                  পরের <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
                </button>
              </div>
            )}
          </>
        )}
      </Surface>
    </motion.div>
  );
}

export default ResultView;
