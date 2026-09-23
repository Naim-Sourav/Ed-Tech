import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Award,
  BarChart3,
  Check,
  ChevronRight,
  ClipboardList,
  Crown,
  Flame,
  Hourglass,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import { formatClock } from '../exam/model';
import {
  bn,
  formatPoints,
  nextMilestone,
  type ActiveSession,
  type BoardRow,
  type QuestPreview,
  type RhythmDay,
  type SetupPreview,
  type SubjectRow,
} from './model';
import { Avatar, Card, EASE, Eyebrow, SectionHeader, Track, cx } from './ui';

/* ── top bar (phones; the desktop sidebar already carries the brand) ───── */

export function TopBar({
  streak,
  avatar,
  name,
  onStreak,
  onAccount,
}: {
  streak: number;
  avatar?: string | null;
  name?: string | null;
  onStreak: () => void;
  onAccount: () => void;
}) {
  return (
    <div className="relative flex items-center justify-between md:hidden">
      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        onClick={onStreak}
        aria-label={`স্ট্রিক ${bn(streak)} দিন`}
        className="focus-ring relative z-10 flex items-center gap-1.5 rounded-full bg-white/80 py-1.5 pl-2 pr-3 ring-1 ring-ink/10 backdrop-blur-md dark:bg-white/10 dark:ring-white/15"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-brand/12 text-brand-deep dark:bg-brand/25 dark:text-brand-bright">
          <Flame className="h-[15px] w-[15px]" fill="currentColor" strokeWidth={2} aria-hidden="true" />
        </span>
        <span className="text-[14px] font-black tabular-nums text-ink dark:text-paper">{bn(streak)}</span>
      </motion.button>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
        <img src={`${import.meta.env.BASE_URL}letterlogo.svg`} alt="" className="h-9 dark:hidden" />
        <img src={`${import.meta.env.BASE_URL}letterlogo-white.svg`} alt="" className="hidden h-9 dark:block" />
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={onAccount}
        aria-label="অ্যাকাউন্ট"
        className="focus-ring relative z-10 h-10 w-10 overflow-hidden rounded-full bg-white ring-2 ring-brand/40 dark:bg-ink-2"
      >
        <Avatar src={avatar} name={name} className="h-full w-full" />
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-paper bg-lime dark:border-ink" />
      </motion.button>
    </div>
  );
}

/* ── hero ──────────────────────────────────────────────────────────────── */

export interface HeroStat {
  label: string;
  value: string;
  icon: React.ElementType;
}

export function HeroCard({
  greeting,
  dateLine,
  name,
  message,
  rank,
  stats,
  onStart,
  onSecondary,
  secondaryLabel,
}: {
  greeting: string;
  dateLine: string;
  name: string;
  message: string;
  rank: number | null;
  stats: HeroStat[];
  onStart: () => void;
  onSecondary: () => void;
  secondaryLabel: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="noise relative overflow-hidden rounded-[28px] bg-ink p-5 text-white shadow-[0_40px_80px_-40px_rgba(22,18,16,0.7)] dark:bg-ink-2 dark:ring-1 dark:ring-white/10 sm:p-7"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full blur-3xl"
        style={{ background: 'conic-gradient(from 120deg, rgba(255,82,0,0), rgba(255,82,0,0.5), rgba(255,185,46,0.35), rgba(255,82,0,0))' }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/4 h-48 w-48 rounded-full bg-lime/10 blur-3xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Eyebrow className="flex items-center gap-1.5 text-lime">
            <Sparkles className="h-3.5 w-3.5 shrink-0" strokeWidth={2.6} aria-hidden="true" />
            <span className="truncate normal-case tracking-[0.04em]">
              {greeting} · {dateLine}
            </span>
          </Eyebrow>
          <h1 className="mt-1.5 truncate font-bangla text-[26px] font-extrabold leading-tight tracking-tight sm:text-[32px]">{name}</h1>
          <p className="mt-2 max-w-lg text-[13.5px] font-medium leading-relaxed text-white/70 sm:text-[14.5px]">{message}</p>
        </div>

        <div className="flex h-[68px] w-[68px] shrink-0 flex-col items-center justify-center rounded-[22px] border border-white/15 bg-white/8 shadow-lg backdrop-blur-sm sm:h-20 sm:w-20">
          <Trophy className="mb-0.5 h-4 w-4 text-lime" strokeWidth={2.4} aria-hidden="true" />
          <span className="text-[18px] font-black leading-none tabular-nums sm:text-[20px]">{rank ? `#${bn(rank)}` : '—'}</span>
          <span className="mt-1 text-[9px] font-bold text-white/50">র‍্যাঙ্ক</span>
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-3 gap-2 sm:gap-3">
        {stats.map((chip) => (
          <div
            key={chip.label}
            className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/8 px-3 py-2.5 backdrop-blur-sm sm:gap-3 sm:py-3"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-brand/25 text-lime sm:h-9 sm:w-9">
              <chip.icon className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[16px] font-black leading-none tabular-nums sm:text-[18px]">{chip.value}</p>
              <p className="mt-1 text-[9.5px] font-bold uppercase tracking-wider text-white/50 sm:text-[10px]">{chip.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="relative mt-5 flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={onStart}
          className="focus-ring inline-flex h-12 items-center gap-2 rounded-full bg-lime px-5 text-[14px] font-black text-ink-950 shadow-[0_16px_36px_-14px_rgba(255,185,46,0.6)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Play className="h-4 w-4" fill="currentColor" strokeWidth={2} aria-hidden="true" />
          মক টেস্ট দাও
          <ArrowRight className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onSecondary}
          className="focus-ring inline-flex h-12 items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 text-[13.5px] font-extrabold text-white/90 backdrop-blur-sm transition-colors hover:bg-white/15"
        >
          <RotateCcw className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
          {secondaryLabel}
        </button>
      </div>
    </motion.section>
  );
}

export const heroStats = (points: number, exams: number, accuracy: number): HeroStat[] => [
  { icon: Award, label: 'পয়েন্ট', value: formatPoints(points) },
  { icon: ClipboardList, label: 'পরীক্ষা', value: bn(exams) },
  { icon: Target, label: 'নির্ভুলতা', value: `${bn(accuracy)}%` },
];

/* ── resume strip: unfinished exam or last setup ───────────────────────── */

export function ResumeStrip({
  session,
  setup,
  onResume,
  onRepeat,
}: {
  session: ActiveSession | null;
  setup: SetupPreview | null;
  onResume: (id: string) => void;
  onRepeat: () => void;
}) {
  if (session) {
    const pct = session.total > 0 ? session.answered / session.total : 0;
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE, delay: 0.05 }}>
        <Card className="flex items-center gap-3.5 p-4 ring-brand/25 sm:gap-4 sm:p-5">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cream text-brand-deep dark:bg-brand/20 dark:text-brand-bright">
            <Hourglass className="h-5 w-5" strokeWidth={2.3} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <Eyebrow className="text-brand-deep dark:text-brand-bright">চলমান পরীক্ষা</Eyebrow>
            <p className="mt-0.5 truncate text-[14.5px] font-extrabold text-ink dark:text-paper">{session.title}</p>
            <div className="mt-2 flex items-center gap-2">
              <Track value={pct} className="max-w-[160px]" />
              <span className="shrink-0 text-[12px] font-bold tabular-nums text-mist dark:text-white/55">
                {bn(session.answered)}/{bn(session.total)} উত্তর{session.remaining !== null ? ` · ${formatClock(session.remaining)} বাকি` : ''}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onResume(session.examId)}
            className="focus-ring inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 text-[13px] font-extrabold text-white transition-transform hover:-translate-y-0.5 dark:bg-paper dark:text-ink"
          >
            চালিয়ে যাও
            <ArrowRight className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />
          </button>
        </Card>
      </motion.div>
    );
  }
  if (!setup) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE, delay: 0.05 }}>
      <button type="button" onClick={onRepeat} className="focus-ring group block w-full text-left">
        <Card as="div" className="flex items-center gap-3.5 p-4 transition-shadow group-hover:shadow-[0_24px_50px_-28px_rgba(22,18,16,0.4)] sm:gap-4 sm:p-5">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-mint text-brand-deep dark:bg-brand/20 dark:text-brand-bright">
            <RotateCcw className="h-5 w-5" strokeWidth={2.3} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <Eyebrow className="text-mist dark:text-white/50">আগেরবারের সেটআপে আবার</Eyebrow>
            <p className="mt-0.5 truncate text-[14.5px] font-extrabold text-ink dark:text-paper">{setup.title}</p>
            <p className="truncate text-[12px] font-semibold text-mist dark:text-white/55">{setup.detail}</p>
          </div>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink/5 text-ink transition-transform group-hover:translate-x-0.5 dark:bg-white/10 dark:text-paper">
            <ChevronRight className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />
          </span>
        </Card>
      </button>
    </motion.div>
  );
}

/* ── quick access ──────────────────────────────────────────────────────── */

export interface QuickLink {
  icon: string;
  label: string;
  path: string;
  state?: Record<string, unknown>;
  tint: string;
}

export const QUICK_LINKS: QuickLink[] = [
  { icon: '/icons/question-bank.svg', label: 'প্রশ্ন ব্যাংক', path: '/qbank', tint: 'bg-mint' },
  { icon: '/icons/model-test.svg', label: 'মডেল টেস্ট', path: '/quiz', tint: 'bg-cream' },
  { icon: '/icons/flash-card.svg', label: 'ফ্ল্যাশ কার্ড', path: '/quiz', state: { mode: 'RAPID_FIRE' }, tint: 'bg-lime-soft' },
  { icon: '/icons/battle-new.svg', label: 'ব্যাটল', path: '/battle', tint: 'bg-amber-soft' },
  { icon: '/icons/saved-questions.svg', label: 'সেভ করা', path: '/saved-questions', tint: 'bg-mint' },
  { icon: '/icons/wrong-questions.svg', label: 'ভুল প্রশ্ন', path: '/wrong-questions', tint: 'bg-cream' },
];

export function QuickAccess({ onOpen, onAll }: { onOpen: (link: QuickLink) => void; onAll: () => void }) {
  return (
    <section>
      <SectionHeader title="দ্রুত অ্যাক্সেস" action="পরীক্ষা জোন" onAction={onAll} className="mb-3 px-1" />
      <div className="grid grid-cols-3 gap-2.5 md:grid-cols-6 md:gap-3">
        {QUICK_LINKS.map((item, i) => (
          <motion.button
            key={item.label}
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.06 + i * 0.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onOpen(item)}
            className="focus-ring group flex flex-col items-center gap-2.5 rounded-3xl bg-white p-3 ring-1 ring-ink/8 shadow-[0_18px_44px_-32px_rgba(22,18,16,0.35)] transition-all hover:-translate-y-1 hover:ring-brand/30 dark:bg-ink-2 dark:ring-white/10 dark:shadow-none dark:hover:ring-brand/40 md:p-4"
          >
            <span className={cx('grid h-14 w-14 place-items-center rounded-2xl transition-transform group-hover:scale-105 dark:bg-white/[0.07]', item.tint)}>
              <img src={item.icon} alt="" className="h-9 w-9 object-contain md:h-10 md:w-10" draggable={false} />
            </span>
            <span className="text-center text-[12px] font-extrabold leading-tight text-ink/85 dark:text-white/85 md:text-[12.5px]">{item.label}</span>
          </motion.button>
        ))}
      </div>
    </section>
  );
}

/* ── streak ────────────────────────────────────────────────────────────── */

export function StreakCard({
  streak,
  longest,
  week,
  todayActive,
  onCalendar,
  onPractice,
}: {
  streak: number;
  longest: number;
  week: RhythmDay[];
  todayActive: boolean;
  onCalendar: () => void;
  onPractice: () => void;
}) {
  const milestone = nextMilestone(streak);
  return (
    <Card className="overflow-hidden p-5">
      <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-brand/10 blur-2xl" />
      <SectionHeader
        icon={Flame}
        title="ধারাবাহিকতা"
        subtitle={longest > streak ? `সেরা স্ট্রিক ${bn(longest)} দিন` : 'প্রতিদিন একটা মক — এটুকুই'}
        action="ক্যালেন্ডার"
        onAction={onCalendar}
      />

      <div className="mt-4 flex items-end gap-3">
        <span className="text-[42px] font-bold leading-none tabular-nums text-ink dark:text-paper">{bn(streak)}</span>
        <div className="pb-1">
          <p className="text-[14px] font-extrabold text-ink dark:text-paper">দিন টানা</p>
          <p className="text-[12px] font-semibold text-mist dark:text-white/55">
            {todayActive ? 'আজকেরটা হয়ে গেছে ✓' : streak > 0 ? 'আজ একটা মক দিলে স্ট্রিক বাঁচবে' : 'আজ থেকে শুরু করো'}
          </p>
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-7 gap-1.5" aria-label="এই সপ্তাহের কার্যকলাপ">
        {week.map((d) => (
          <li key={d.date} className="flex flex-col items-center gap-1.5">
            <span className={cx('text-[10.5px] font-bold', d.isToday ? 'text-brand-deep dark:text-brand-bright' : 'text-mist dark:text-white/45')}>
              {d.name}
            </span>
            <span
              title={d.date}
              className={cx(
                'grid h-9 w-9 place-items-center rounded-full text-[12px] font-extrabold transition-colors',
                d.active
                  ? 'bg-brand text-white shadow-[0_8px_18px_-8px_rgba(255,82,0,0.7)]'
                  : d.isToday
                    ? 'border-2 border-dashed border-brand/60 text-brand-deep dark:text-brand-bright'
                    : d.future
                      ? 'bg-ink/[0.04] text-ink/25 dark:bg-white/5 dark:text-white/25'
                      : 'bg-ink/[0.06] text-ink/40 dark:bg-white/8 dark:text-white/40',
              )}
            >
              {d.active ? <Check className="h-4 w-4" strokeWidth={3.2} aria-hidden="true" /> : d.isToday ? '•' : ''}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-2xl bg-paper p-3 ring-1 ring-ink/6 dark:bg-white/5 dark:ring-white/10">
        <div className="flex items-center justify-between gap-3 text-[12px] font-bold">
          <span className="text-ink/75 dark:text-white/75">{bn(milestone.target)} দিনের ব্যাজ</span>
          <span className="tabular-nums text-mist dark:text-white/55">আর {bn(milestone.remaining)} দিন</span>
        </div>
        <Track value={milestone.progress} tone="gold" className="mt-2" />
      </div>

      {!todayActive && (
        <button
          type="button"
          onClick={onPractice}
          className="focus-ring mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-ink text-[13px] font-extrabold text-white transition-transform hover:-translate-y-0.5 dark:bg-paper dark:text-ink"
        >
          <Zap className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
          আজকের মকটা দিয়ে ফেলো
        </button>
      )}
    </Card>
  );
}

/* ── subjects ──────────────────────────────────────────────────────────── */

const TONE_BAR = { good: 'brand', ok: 'gold', weak: 'flag' } as const;
const TONE_TEXT = { good: 'text-brand-deep dark:text-brand-bright', ok: 'text-gold-600 dark:text-gold', weak: 'text-flag' } as const;

export function SubjectsCard({ rows, weakest, onPractice }: { rows: SubjectRow[]; weakest: SubjectRow | null; onPractice: (row: SubjectRow) => void }) {
  if (rows.length === 0) return null;
  return (
    <Card className="p-5">
      <SectionHeader icon={BarChart3} title="বিষয়ভিত্তিক দক্ষতা" subtitle="সব পরীক্ষা মিলিয়ে সঠিক উত্তরের হার" />
      <ul className="mt-4 space-y-3.5">
        {rows.slice(0, 5).map((row) => (
          <li key={row.key}>
            <div className="flex items-center justify-between gap-3 text-[13px]">
              <span className="truncate font-extrabold text-ink dark:text-paper">{row.name}</span>
              <span className="shrink-0 tabular-nums">
                <span className={cx('font-black', TONE_TEXT[row.tone])}>{bn(row.accuracy)}%</span>
                <span className="ml-1.5 text-[11.5px] font-semibold text-mist dark:text-white/50">{bn(row.total)} প্রশ্ন</span>
              </span>
            </div>
            <Track value={row.accuracy / 100} tone={TONE_BAR[row.tone]} className="mt-1.5" />
          </li>
        ))}
      </ul>
      {weakest && (
        <button
          type="button"
          onClick={() => onPractice(weakest)}
          className="focus-ring mt-4 flex w-full items-center gap-3 rounded-2xl bg-cream p-3 text-left ring-1 ring-brand/15 transition-colors hover:bg-mint dark:bg-brand/10 dark:ring-brand/25 dark:hover:bg-brand/15"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-brand-deep dark:bg-ink-2 dark:text-brand-bright">
            <Target className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-extrabold text-ink dark:text-paper">{weakest.name}-এ একটু বেশি ভুল হচ্ছে</span>
            <span className="block text-[12px] font-semibold text-mist dark:text-white/55">এই বিষয়ের একটা মক দিয়ে ঝালাই করে নাও</span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-brand-deep dark:text-brand-bright" strokeWidth={2.6} aria-hidden="true" />
        </button>
      )}
    </Card>
  );
}

/* ── quests ────────────────────────────────────────────────────────────── */

export function QuestsCard({ quests, done, total, onAll }: { quests: QuestPreview[]; done: number; total: number; onAll: () => void }) {
  if (quests.length === 0) return null;
  return (
    <Card className="p-5">
      <SectionHeader icon={Sparkles} title="আজকের চ্যালেঞ্জ" subtitle={`${bn(done)}/${bn(total)} সম্পন্ন`} action="সব দেখো" onAction={onAll} />
      <ul className="mt-4 space-y-3">
        {quests.map((q) => {
          const pct = q.target > 0 ? q.progress / q.target : 0;
          return (
            <li key={q.id} className="flex items-center gap-3">
              <span
                className={cx(
                  'grid h-9 w-9 shrink-0 place-items-center rounded-xl',
                  q.completed ? 'bg-brand text-white' : 'bg-ink/5 text-mist dark:bg-white/8 dark:text-white/50',
                )}
              >
                {q.completed ? (
                  <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                ) : (
                  <Zap className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={cx('truncate text-[13px] font-extrabold', q.claimed ? 'text-mist line-through dark:text-white/40' : 'text-ink dark:text-paper')}
                  >
                    {q.title}
                  </p>
                  <span className="shrink-0 rounded-full bg-lime-soft px-2 py-0.5 text-[11px] font-black tabular-nums text-ink-950 dark:bg-lime dark:text-ink-950">
                    +{bn(q.reward)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <Track value={pct} tone={q.completed ? 'brand' : 'gold'} />
                  <span className="shrink-0 text-[11px] font-bold tabular-nums text-mist dark:text-white/50">
                    {bn(q.progress)}/{bn(q.target)}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/* ── leaderboard ───────────────────────────────────────────────────────── */

const RANK_STYLE: Record<number, string> = {
  1: 'bg-gold/25 text-ink ring-gold/50 dark:text-white',
  2: 'bg-ink/8 text-ink ring-ink/15 dark:bg-white/10 dark:text-white dark:ring-white/15',
  3: 'bg-brand/10 text-brand-deep ring-brand/25 dark:bg-brand/20 dark:text-brand-bright dark:ring-brand/30',
};

export function LeaderboardCard({ rows, gap, rank, onOpen }: { rows: BoardRow[]; gap: boolean; rank: number | null; onOpen: () => void }) {
  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={onOpen}
        className="focus-ring flex w-full items-center gap-3 bg-gradient-to-r from-mint/70 to-transparent px-5 py-4 text-left dark:from-white/5"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-ink text-lime dark:bg-lime dark:text-ink">
          <Trophy className="h-[18px] w-[18px]" strokeWidth={2.5} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-extrabold tracking-tight text-ink dark:text-paper sm:text-[16px]">লিডারবোর্ড</span>
          <span className="block text-[12px] font-semibold text-mist dark:text-white/50">শীর্ষ পারফর্মাররা — তুমি কোথায়?</span>
        </span>
        <span className="text-right">
          <span className="block text-[20px] font-black leading-none tabular-nums text-brand-deep dark:text-brand-bright">{rank ? `#${bn(rank)}` : '—'}</span>
          <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-mist dark:text-white/50">তোমার র‍্যাঙ্ক</span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-mist dark:text-white/50" strokeWidth={2.6} aria-hidden="true" />
      </button>

      {rows.length === 0 ? (
        <p className="px-5 py-8 text-center text-[13px] font-semibold text-mist dark:text-white/50">এখনো কেউ পয়েন্ট পায়নি — প্রথম হওয়ার সুযোগটা তোমার।</p>
      ) : (
        <ul className="space-y-1 p-2.5">
          {rows.map((row, i) => (
            <React.Fragment key={`${row.rank}-${row.user.uid}`}>
              {gap && i === rows.length - 1 && (
                <li aria-hidden="true" className="flex justify-center gap-1.5 py-1.5">
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="h-1.5 w-1.5 rounded-full bg-ink/15 dark:bg-white/20" />
                  ))}
                </li>
              )}
              <li
                className={cx(
                  'flex items-center gap-3 rounded-2xl px-2.5 py-2.5 ring-1',
                  row.isMe ? 'bg-mint/60 ring-brand/20 dark:bg-brand/10 dark:ring-brand/30' : 'ring-transparent',
                )}
              >
                <span
                  className={cx(
                    'grid h-8 w-8 shrink-0 place-items-center rounded-xl text-[13px] font-black tabular-nums ring-1',
                    RANK_STYLE[row.rank] ??
                      (row.isMe
                        ? 'bg-white text-brand-deep ring-brand/25 dark:bg-ink-2 dark:text-brand-bright'
                        : 'bg-ink/5 text-mist ring-ink/10 dark:bg-white/5 dark:text-white/60 dark:ring-white/10'),
                  )}
                >
                  {bn(row.rank)}
                </span>
                <span className="relative shrink-0">
                  <Avatar
                    src={row.user.photoURL}
                    name={row.user.displayName}
                    className="h-10 w-10 ring-2 ring-paper dark:ring-ink-2"
                    textClassName="text-[14px]"
                  />
                  {row.rank === 1 && (
                    <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-white text-gold shadow-sm dark:bg-ink-2">
                      <Crown className="h-3 w-3" fill="currentColor" strokeWidth={2} aria-hidden="true" />
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cx(
                      'block truncate text-[14px] font-extrabold',
                      row.isMe ? 'text-brand-deep dark:text-brand-bright' : 'text-ink dark:text-white/90',
                    )}
                  >
                    {row.user.displayName || 'শিক্ষার্থী'}
                    {row.isMe && <span className="ml-1 text-[11px] font-bold text-mist dark:text-white/50">(তুমি)</span>}
                  </span>
                  <span className="block truncate text-[11.5px] font-semibold text-mist dark:text-white/50">{row.user.college || 'শিক্ষার্থী'}</span>
                </span>
                <span className="text-right">
                  <span className="block text-[14px] font-black tabular-nums text-ink dark:text-paper">{formatPoints(row.user.points || 0)}</span>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-mist dark:text-white/50">পয়েন্ট</span>
                </span>
              </li>
            </React.Fragment>
          ))}
        </ul>
      )}
    </Card>
  );
}

/* ── beta notice ───────────────────────────────────────────────────────── */

export function BetaNotice({ onDismiss, className = '' }: { onDismiss: () => void; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.4, ease: EASE }}
      className={cx(
        'relative flex items-start gap-3.5 overflow-hidden rounded-[22px] bg-mint p-4 ring-1 ring-brand/15 dark:bg-white/5 dark:ring-white/10',
        className,
      )}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand text-white shadow-[0_10px_24px_-8px_rgba(224,68,0,0.5)]">
        <Sparkles className="h-5 w-5" strokeWidth={2.4} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1 pr-6">
        <p className="text-[14px] font-extrabold text-ink dark:text-paper">আমরা এখনো গড়ে উঠছি</p>
        <p className="mt-0.5 text-[12.5px] font-medium leading-relaxed text-ink/70 dark:text-white/65">
          পরীক্ষাঙ্গন এখনো বেটা পর্যায়ে — সব ফিচার এখনো পুরোপুরি তৈরি হয়নি, তবে প্রতিদিনই নতুন কিছু যোগ হচ্ছে। সাথে থাকার জন্য ধন্যবাদ!
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="বন্ধ করো"
        className="focus-ring absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-ink/50 transition-colors hover:bg-white/70 hover:text-ink dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <X className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
      </button>
    </motion.div>
  );
}

/* ── skeleton ──────────────────────────────────────────────────────────── */

export function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-4 pb-32 pt-4 md:px-6 md:pt-6" aria-busy="true" aria-label="লোড হচ্ছে">
      <div className="flex items-center justify-between md:hidden">
        <div className="h-9 w-16 animate-pulse rounded-full bg-ink/8 dark:bg-white/10" />
        <div className="h-9 w-28 animate-pulse rounded-xl bg-ink/8 dark:bg-white/10" />
        <div className="h-10 w-10 animate-pulse rounded-full bg-ink/8 dark:bg-white/10" />
      </div>
      <div className="rounded-[28px] bg-ink/90 p-6 dark:bg-ink-2 sm:p-7">
        <div className="h-3.5 w-40 rounded bg-white/20" />
        <div className="mt-3 h-8 w-56 rounded bg-white/20" />
        <div className="mt-2 h-3.5 w-72 max-w-full rounded bg-white/10" />
        <div className="mt-6 grid grid-cols-3 gap-2.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-white/10" />
          ))}
        </div>
        <div className="mt-5 h-12 w-44 rounded-full bg-white/15" />
      </div>
      <div className="grid grid-cols-3 gap-2.5 md:grid-cols-6 md:gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-3xl bg-white ring-1 ring-ink/8 dark:bg-ink-2 dark:ring-white/10" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="h-56 animate-pulse rounded-[26px] bg-white ring-1 ring-ink/8 dark:bg-ink-2 dark:ring-white/10" />
        <div className="h-56 animate-pulse rounded-[26px] bg-white ring-1 ring-ink/8 dark:bg-ink-2 dark:ring-white/10" />
      </div>
    </div>
  );
}
