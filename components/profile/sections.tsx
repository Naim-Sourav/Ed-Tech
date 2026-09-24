import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  Camera,
  ChevronRight,
  ClipboardList,
  Coins,
  Crosshair,
  Flag,
  Flame,
  GraduationCap,
  LogOut,
  Mail,
  Medal,
  Pencil,
  Play,
  School,
  Settings,
  Share2,
  Smartphone,
  Sparkles,
  Swords,
  Target,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import type { EnrolledCourse } from '../../contexts/AuthContext';
import { formatBdPhone } from '../../utils/phone';
import { Bone, Card, EASE, Eyebrow, SectionHeader, Track, cx } from '../dashboard/ui';
import { formatPoints } from '../dashboard/model';
import { Btn, Chip, IconBtn, Row } from '../qbank/ui';
import {
  accuracyOf,
  batchLabel,
  bn,
  departmentLabel,
  hueFor,
  initialOf,
  isHttpUrl,
  memberSince,
  nextAchievement,
  profileCompletion,
  studyLine,
  targetLabel,
  type Achievement,
  type AchievementIcon,
  type Heatmap,
  type ProfileIdentity,
  type ProfileStats,
  type SubjectRow,
  type TopicRow,
} from './model';

/*
 * Presentational sections of the profile page — now aligned with the
 * dashboard's language: dark hero for identity, white rounded-[26px] cards
 * for everything else, explicit dark: variants, motion with EASE.
 */

const enter = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: EASE, delay },
});

/* ── avatar ────────────────────────────────────────────────────────────── */

export function ProfileAvatar({
  src,
  name,
  seed,
  className = '',
  textClassName = 'text-[30px]',
}: {
  src?: string | null;
  name?: string | null;
  seed: string;
  className?: string;
  textClassName?: string;
}) {
  const hue = hueFor(seed);
  if (isHttpUrl(src)) {
    return <img src={src as string} alt="" className={cx('rounded-full bg-ink/5 object-cover dark:bg-white/10', className)} referrerPolicy="no-referrer" draggable={false} />;
  }
  return (
    <span
      className={cx('grid place-items-center rounded-full font-bangla font-extrabold', textClassName, className)}
      style={{ background: `linear-gradient(140deg, hsl(${hue} 90% 92%), hsl(${(hue + 30) % 360} 85% 80%))`, color: `hsl(${hue} 55% 28%)` }}
      aria-hidden="true"
    >
      {initialOf(name)}
    </span>
  );
}

/* ── top bar ───────────────────────────────────────────────────────────── */

export function ProfileTopBar({ title, eyebrow, right, onBack }: { title: string; eyebrow?: string; right?: React.ReactNode; onBack?: () => void }) {
  return (
    <div className="flex items-center gap-2.5">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="পেছনে যাও"
          className="focus-ring -ml-2 grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink/70 hover:bg-ink/[0.05] hover:text-ink dark:text-white/70 dark:hover:bg-white/[0.08] dark:hover:text-white"
        >
          <ChevronRight className="h-5 w-5 rotate-180" strokeWidth={2.4} aria-hidden="true" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        {eyebrow && <p className="text-[11px] font-bold tracking-[0.03em] text-brand-deep dark:text-brand-bright">{eyebrow}</p>}
        <h1 className="truncate font-bangla text-[22px] font-extrabold leading-tight tracking-tight text-ink dark:text-paper md:text-[26px]">{title}</h1>
      </div>
      {right && <div className="flex shrink-0 items-center gap-1.5">{right}</div>}
    </div>
  );
}

/* ── identity card — dark hero like dashboard ─────────────────────────── */

export function IdentityCard({
  identity,
  uid,
  own,
  streak,
  rank,
  onEdit,
  onShare,
  onChallenge,
  onPickPhoto,
  uploading = false,
}: {
  identity: ProfileIdentity;
  uid: string;
  own: boolean;
  streak: number;
  rank?: number | null;
  onEdit?: () => void;
  onShare?: () => void;
  onChallenge?: () => void;
  onPickPhoto?: () => void;
  uploading?: boolean;
}) {
  const line = studyLine(identity);
  const since = memberSince(identity.createdAt);
  return (
    <motion.div {...enter(0)}>
      <section
        className="noise relative overflow-hidden rounded-[28px] bg-ink p-5 text-white shadow-[0_40px_80px_-40px_rgba(22,18,16,0.7)] dark:bg-ink-2 dark:ring-1 dark:ring-white/10 sm:p-7"
        aria-label="পরিচয়"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full blur-3xl"
          style={{ background: 'conic-gradient(from 120deg, rgba(255,82,0,0), rgba(255,82,0,0.5), rgba(255,185,46,0.35), rgba(255,82,0,0))' }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/4 h-48 w-48 rounded-full bg-lime/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-20 top-10 h-32 w-32 rounded-full bg-white/5 blur-2xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="relative shrink-0">
              <ProfileAvatar src={identity.photoURL} name={identity.name} seed={uid} className="h-[84px] w-[84px] shadow-lg ring-2 ring-white/20 sm:h-[96px] sm:w-[96px]" />
              {own && onPickPhoto && (
                <button
                  type="button"
                  onClick={onPickPhoto}
                  disabled={uploading}
                  aria-label="প্রোফাইল ছবি বদলাও"
                  className="focus-ring absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-white text-ink ring-2 ring-ink shadow-md transition-transform hover:scale-105 disabled:opacity-60"
                >
                  {uploading ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Camera className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />}
                </button>
              )}
            </div>
            <div className="min-w-0 pt-1">
              <Eyebrow className="flex items-center gap-1.5 text-lime">
                <Sparkles className="h-3.5 w-3.5 shrink-0" strokeWidth={2.6} aria-hidden="true" />
                <span className="truncate">{own ? 'তোমার প্রোফাইল' : 'শিক্ষার্থী'}</span>
              </Eyebrow>
              <h2 className="mt-1.5 truncate font-bangla text-[26px] font-extrabold leading-tight tracking-tight sm:text-[30px]">{identity.name || 'শিক্ষার্থী'}</h2>
              <p className="mt-1 max-w-[32ch] text-[13.5px] font-medium leading-relaxed text-white/70 sm:text-[14px]">{line || (own ? 'পড়াশোনার তথ্য এখনো যোগ করা হয়নি — এডিট করে যোগ করো।' : 'পড়াশোনার তথ্য নেই')}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {identity.college && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11.5px] font-bold ring-1 ring-white/10">
                    <School className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden="true" />
                    {identity.college}
                  </span>
                )}
                {streak > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-lime/15 px-2.5 py-1 text-[11.5px] font-bold text-lime ring-1 ring-lime/20">
                    <Flame className="h-3.5 w-3.5" fill="currentColor" strokeWidth={2} aria-hidden="true" />
                    {bn(streak)} দিনের স্ট্রিক
                  </span>
                )}
                {since && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/8 px-2.5 py-1 text-[11.5px] font-bold text-white/70 ring-1 ring-white/10">
                    <CalendarDays className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden="true" />
                    {since} থেকে
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-center gap-2">
            <div className="flex h-[68px] w-[68px] flex-col items-center justify-center rounded-[22px] border border-white/15 bg-white/8 shadow-lg backdrop-blur-sm sm:h-20 sm:w-20">
              <Trophy className="mb-0.5 h-4 w-4 text-lime" strokeWidth={2.4} aria-hidden="true" />
              <span className="text-[18px] font-black leading-none tabular-nums sm:text-[20px]">{rank ? `#${bn(rank)}` : '—'}</span>
              <span className="mt-1 text-[9px] font-bold text-white/50">র‍্যাঙ্ক</span>
            </div>
          </div>
        </div>

        <div className="relative mt-5 flex flex-wrap items-center gap-2.5">
          {own ? (
            <>
              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="focus-ring inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[14px] font-black text-ink shadow-[0_16px_36px_-14px_rgba(255,255,255,0.5)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Pencil className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
                  এডিট প্রোফাইল
                </button>
              )}
              {onShare && (
                <button
                  type="button"
                  onClick={onShare}
                  className="focus-ring inline-flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 text-[13.5px] font-extrabold text-white/90 backdrop-blur-sm transition-colors hover:bg-white/15"
                >
                  <Share2 className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
                  শেয়ার
                </button>
              )}
            </>
          ) : (
            onChallenge && (
              <button
                type="button"
                onClick={onChallenge}
                className="focus-ring inline-flex h-12 items-center gap-2 rounded-full bg-lime px-6 text-[14px] font-black text-ink-950 shadow-[0_16px_36px_-14px_rgba(255,185,46,0.6)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Swords className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
                চ্যালেঞ্জ করো
              </button>
            )
          )}
        </div>
      </section>
    </motion.div>
  );
}

/* ── numbers ───────────────────────────────────────────────────────────── */

export function StatsCard({ stats, rank, onStart, own = true }: { stats: ProfileStats | null; rank: number | null; onStart: () => void; own?: boolean }) {
  const points = stats?.points || 0;
  const exams = stats?.totalExams || 0;
  const correct = stats?.totalCorrect || 0;
  const wrong = stats?.totalWrong || 0;
  const answered = correct + wrong;
  const accuracy = accuracyOf(stats ?? undefined);
  const tiles: Array<{ icon: LucideIcon; label: string; value: string; tint: string }> = [
    { icon: Award, label: 'পয়েন্ট', value: formatPoints(points), tint: 'bg-brand/10 text-brand-deep dark:bg-brand/20 dark:text-brand-bright' },
    { icon: Trophy, label: 'র‍্যাঙ্ক', value: rank ? `#${bn(rank)}` : '—', tint: 'bg-gold/20 text-amber-800 dark:bg-gold/20 dark:text-amber-200' },
    { icon: ClipboardList, label: 'পরীক্ষা', value: bn(exams), tint: 'bg-ink/[0.05] text-ink/70 dark:bg-white/[0.08] dark:text-white/70' },
    { icon: Target, label: 'নির্ভুলতা', value: answered ? `${bn(accuracy)}%` : '—', tint: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300' },
  ];
  return (
    <motion.div {...enter(0.05)}>
      <Card className="p-4 sm:p-5" aria-label="সংখ্যায় অগ্রগতি">
        <SectionHeader icon={BarChart3} title="সংখ্যায় অগ্রগতি" subtitle={answered ? `${bn(answered)}টি উত্তর বিশ্লেষণ করা হয়েছে` : own ? 'এখনো যাত্রা শুরু হয়নি' : 'এই শিক্ষার্থীর পরিসংখ্যান'} />
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {tiles.map((t) => (
            <div key={t.label} className="rounded-2xl bg-ink/[0.03] px-3.5 py-3 ring-1 ring-ink/[0.05] dark:bg-white/[0.04] dark:ring-white/[0.06]">
              <span className={cx('grid h-8 w-8 place-items-center rounded-xl', t.tint)}>
                <t.icon className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
              </span>
              <p className="mt-2.5 font-body text-[22px] font-bold leading-none tabular-nums text-ink dark:text-paper">{t.value}</p>
              <p className="mt-1 text-[11.5px] font-bold text-mist dark:text-white/50">{t.label}</p>
            </div>
          ))}
        </div>

        {answered > 0 ? (
          <div className="mt-4 rounded-2xl bg-paper p-3 ring-1 ring-ink/6 dark:bg-white/5 dark:ring-white/10">
            <div className="flex items-center justify-between text-[12px] font-bold">
              <span className="text-emerald-700 dark:text-emerald-300">{bn(correct)} সঠিক</span>
              <span className="text-mist dark:text-white/50">মোট {bn(answered)} উত্তর</span>
              <span className="text-flag dark:text-red-300">{bn(wrong)} ভুল</span>
            </div>
            <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-ink/8 dark:bg-white/10" role="presentation">
              <div className="h-full bg-emerald-500 transition-[width] duration-700" style={{ width: `${(correct / answered) * 100}%` }} />
              <div className="h-full bg-flag/80 transition-[width] duration-700" style={{ width: `${(wrong / answered) * 100}%` }} />
            </div>
            <p className="mt-2 text-[11px] font-semibold text-mist dark:text-white/45">বিষয়ভিত্তিক মোট সঠিকের যোগফল উপরের সঠিকের সাথে মিলবে — এখন মিশ্র পরীক্ষাও বিষয় অনুযায়ী ভাগ হয়।</p>
          </div>
        ) : own ? (
          <div className="mt-4 flex flex-col items-start gap-3 rounded-2xl bg-cream px-4 py-3.5 dark:bg-brand/10 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13.5px] font-bold text-ink dark:text-paper">এখনো কোনো উত্তর নেই — প্রথম মক দিয়ে শুরু করো।</p>
            <Btn size="sm" variant="brand" icon={Play} onClick={onStart}>
              মক টেস্ট দাও
            </Btn>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl bg-ink/[0.03] px-4 py-4 text-center dark:bg-white/[0.04]">
            <p className="text-[13.5px] font-bold text-ink dark:text-paper">এই শিক্ষার্থী এখনো কোনো পরীক্ষা দেয়নি</p>
            <p className="mt-1 text-[12px] font-semibold text-mist dark:text-white/50">পরীক্ষা দিলে এখানে পরিসংখ্যান দেখা যাবে</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

/* ── activity heat-map ─────────────────────────────────────────────────── */

const ROW_LABELS = ['শনি', '', 'সোম', '', 'বুধ', '', 'শুক্র'];

export function ActivityCard({ heat, current, longest }: { heat: Heatmap; current: number; longest: number }) {
  const cols = heat.columns.length;
  const template = { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` };
  return (
    <motion.div {...enter(0.1)}>
      <Card className="p-4 sm:p-5" aria-label="সক্রিয়তা">
        <SectionHeader icon={Activity} title="সক্রিয়তা" subtitle={`গত ${bn(Math.round(heat.days / 30))} মাসে ${bn(heat.activeDays)} দিন অনুশীলন`} />
        <div className="mt-4 flex gap-2">
          <div className="grid shrink-0 grid-rows-7 gap-[3px] pt-[18px] text-[9.5px] font-bold leading-none text-mist dark:text-white/40" aria-hidden="true">
            {ROW_LABELS.map((l, i) => (
              <span key={i} className="flex items-center">
                {l}
              </span>
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <div className="grid h-[14px] gap-[3px] text-[9.5px] font-bold leading-none text-mist dark:text-white/40" style={template} aria-hidden="true">
              {heat.columns.map((c, i) => (
                <span key={i} className="whitespace-nowrap">
                  {c.label || ''}
                </span>
              ))}
            </div>
            <div className="mt-1 grid gap-[3px]" style={template} role="img" aria-label={`${bn(heat.activeDays)} দিন সক্রিয়`}>
              {heat.columns.map((c, i) => (
                <div key={i} className="grid grid-rows-7 gap-[3px]">
                  {c.cells.map((cell) => (
                    <span
                      key={cell.key}
                      title={cell.key}
                      className={cx(
                        'aspect-square w-full rounded-[3px]',
                        cell.future ? 'bg-transparent ring-1 ring-inset ring-ink/[0.05] dark:ring-white/[0.06]' : cell.active ? 'bg-brand' : 'bg-ink/[0.07] dark:bg-white/[0.09]',
                        cell.isToday && 'ring-2 ring-inset ring-ink dark:ring-paper',
                      )}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <Chip icon={Flame} tone="brand">
            চলতি স্ট্রিক {bn(current)} দিন
          </Chip>
          <Chip icon={Sparkles} tone="gold">
            সেরা স্ট্রিক {bn(longest)} দিন
          </Chip>
        </div>
      </Card>
    </motion.div>
  );
}

/* ── subjects ──────────────────────────────────────────────────────────── */

const TONE_TEXT = { good: 'text-emerald-700 dark:text-emerald-300', ok: 'text-amber-700 dark:text-amber-200', weak: 'text-flag dark:text-red-300' } as const;
const TONE_BAR = { good: 'brand', ok: 'gold', weak: 'flag' } as const;

export function SubjectsCard({
  rows,
  onPractice,
  onAnalysis,
  own = true,
}: {
  rows: SubjectRow[];
  onPractice: (row: SubjectRow) => void;
  onAnalysis: (row: SubjectRow) => void;
  own?: boolean;
}) {
  const [all, setAll] = useState(false);
  const shown = all ? rows : rows.slice(0, 5);
  return (
    <motion.div {...enter(0.15)}>
      <Card className="p-4 sm:p-5" aria-label="বিষয়ভিত্তিক দক্ষতা">
        <SectionHeader icon={BookOpen} title="বিষয়ভিত্তিক দক্ষতা" subtitle={own ? 'ট্যাপ করলে গভীর বিশ্লেষণ খুলবে' : 'বিষয় অনুযায়ী দক্ষতা'} />
        {rows.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-ink/[0.03] px-4 py-5 text-center text-[13px] font-semibold text-mist dark:bg-white/[0.04] dark:text-white/50">
            পরীক্ষা দিলে এখানে বিষয় অনুযায়ী দক্ষতা দেখা যাবে।
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-ink/[0.05] dark:divide-white/[0.06]">
            {shown.map((row) => (
              <li key={row.key}>
                <button
                  type="button"
                  onClick={() => onAnalysis(row)}
                  className="focus-ring group flex w-full items-center gap-3 rounded-xl py-2.5 text-left"
                  aria-label={`${row.name} বিশ্লেষণ দেখো`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-[14px] font-bold text-ink dark:text-paper">{row.name}</span>
                      <span className="shrink-0 text-[12px] font-semibold text-mist dark:text-white/50">
                        <span className={cx('font-body text-[14px] font-bold tabular-nums', TONE_TEXT[row.tone])}>{bn(row.accuracy)}%</span> · {bn(row.total)} প্রশ্ন
                      </span>
                    </div>
                    <Track value={row.accuracy / 100} tone={TONE_BAR[row.tone]} className="mt-1.5" />
                    <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold text-mist dark:text-white/45">
                      <span className="font-body tabular-nums">{bn(row.correct)} সঠিক</span>
                      <span>·</span>
                      <span>{bn(row.total - row.correct)} ভুল/স্কিপ</span>
                      {own && <span className="ml-auto inline-flex items-center gap-0.5 text-brand-deep dark:text-brand-bright">বিস্তারিত <ChevronRight className="h-3 w-3" strokeWidth={2.6} /></span>}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-ink/25 transition-transform group-hover:translate-x-0.5 dark:text-white/25" strokeWidth={2.6} aria-hidden="true" />
                </button>
                {own && (
                  <div className="pb-2 pl-1">
                    <button
                      type="button"
                      onClick={() => onPractice(row)}
                      className="focus-ring text-[12px] font-bold text-mist hover:text-brand-deep dark:text-white/50 dark:hover:text-brand-bright"
                    >
                      এই বিষয়ে মক দাও
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        {rows.length > 5 && (
          <button type="button" onClick={() => setAll((v) => !v)} className="focus-ring mt-2 text-[13px] font-extrabold text-brand-deep hover:underline dark:text-brand-bright">
            {all ? 'কম দেখো' : `সব ${bn(rows.length)}টি বিষয় দেখো`}
          </button>
        )}
      </Card>
    </motion.div>
  );
}

/* ── topics ────────────────────────────────────────────────────────────── */

function TopicList({ title, rows, tone }: { title: string; rows: TopicRow[]; tone: 'good' | 'weak' }) {
  return (
    <div className="min-w-0 flex-1 rounded-2xl bg-ink/[0.03] p-3.5 dark:bg-white/[0.04]">
      <p className={cx('text-[11.5px] font-extrabold', tone === 'good' ? 'text-emerald-700 dark:text-emerald-300' : 'text-flag dark:text-red-300')}>{title}</p>
      {rows.length === 0 ? (
        <p className="mt-2 text-[12.5px] font-semibold text-mist dark:text-white/45">{tone === 'good' ? 'আরও অনুশীলনে শক্তি স্পষ্ট হবে।' : 'এখনো কোনো দুর্বল টপিক ধরা পড়েনি।'}</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {rows.map((t) => (
            <li key={t.topic} className="flex items-baseline justify-between gap-3 text-[13px]">
              <span className="truncate font-bold text-ink dark:text-paper">{t.topic}</span>
              <span className={cx('shrink-0 font-body text-[13px] font-bold tabular-nums', tone === 'good' ? 'text-emerald-700 dark:text-emerald-300' : 'text-flag dark:text-red-300')}>{bn(t.accuracy)}%</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function TopicsCard({ strong, weak, own = true, onPractice }: { strong: TopicRow[]; weak: TopicRow[]; own?: boolean; onPractice?: () => void }) {
  if (!strong.length && !weak.length) return null;
  return (
    <motion.div {...enter(0.2)}>
      <Card className="p-4 sm:p-5" aria-label="শক্তি ও দুর্বলতা">
        <SectionHeader icon={Crosshair} title="শক্তি ও দুর্বলতা" subtitle="টপিক অনুযায়ী" action={onPractice && weak.length ? 'ঝালাই করো' : undefined} onAction={onPractice} />
        <div className="mt-3.5 flex flex-col gap-2.5 sm:flex-row">
          <TopicList title={own ? 'যেখানে তুমি শক্ত' : 'শক্তিশালী টপিক'} rows={strong} tone="good" />
          <TopicList title={own ? 'যেখানে কাজ দরকার' : 'দুর্বল টপিক'} rows={weak} tone="weak" />
        </div>
      </Card>
    </motion.div>
  );
}

/* ── achievements ──────────────────────────────────────────────────────── */

const BADGE_ICON: Record<AchievementIcon, LucideIcon> = {
  flag: Flag,
  exams: ClipboardList,
  marathon: Medal,
  streak: Flame,
  calendar: CalendarDays,
  target: Target,
  points: Coins,
  bullseye: Crosshair,
  trophy: Trophy,
};

export function AchievementsCard({ list }: { list: Achievement[] }) {
  const unlocked = list.filter((a) => a.unlocked).length;
  const next = nextAchievement(list);
  return (
    <motion.div {...enter(0.25)}>
      <Card className="p-4 sm:p-5" aria-label="অর্জন">
        <SectionHeader icon={Medal} title="অর্জন" subtitle={`${bn(unlocked)}/${bn(list.length)} ব্যাজ আনলক`} />
        <ul className="mt-4 grid grid-cols-3 gap-2">
          {list.map((a) => {
            const Icon = BADGE_ICON[a.icon];
            return (
              <li
                key={a.id}
                title={a.hint}
                className={cx(
                  'flex flex-col items-center rounded-2xl px-2 py-3 text-center ring-1',
                  a.unlocked ? 'bg-gold/10 ring-gold/40 dark:bg-gold/10 dark:ring-gold/30' : 'bg-ink/[0.02] ring-ink/[0.05] dark:bg-white/[0.03] dark:ring-white/[0.06]',
                )}
                data-unlocked={a.unlocked ? 'true' : 'false'}
              >
                <span
                  className={cx(
                    'grid h-11 w-11 place-items-center rounded-full',
                    a.unlocked ? 'bg-[linear-gradient(140deg,#ffb92e,#ff7a36)] text-white shadow-[0_10px_20px_-10px_rgba(255,120,40,0.8)]' : 'bg-ink/[0.05] text-ink/30 dark:bg-white/[0.07] dark:text-white/30',
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={2.3} aria-hidden="true" />
                </span>
                <span className={cx('mt-2 text-[12px] font-extrabold leading-tight', a.unlocked ? 'text-ink dark:text-paper' : 'text-ink/55 dark:text-white/50')}>{a.title}</span>
                <span className={cx('mt-0.5 font-body text-[11px] font-bold tabular-nums', a.unlocked ? 'text-amber-800 dark:text-amber-200' : 'text-mist dark:text-white/40')}>
                  {a.unlocked ? 'অর্জিত' : a.status}
                </span>
              </li>
            );
          })}
        </ul>
        {next && (
          <div className="mt-4 rounded-2xl bg-ink/[0.03] px-3.5 py-3 dark:bg-white/[0.04]">
            <div className="flex items-baseline justify-between gap-3 text-[12.5px]">
              <span className="font-bold text-ink dark:text-paper">
                পরের ব্যাজ: {next.title} <span className="font-semibold text-mist dark:text-white/50">— {next.hint}</span>
              </span>
              <span className="shrink-0 font-bold text-brand-deep dark:text-brand-bright">{next.remaining}</span>
            </div>
            <Track value={next.progress} tone="gold" className="mt-2" />
          </div>
        )}
      </Card>
    </motion.div>
  );
}

/* ── courses ───────────────────────────────────────────────────────────── */

export function CoursesCard({ courses, onOpen, onAll }: { courses: EnrolledCourse[]; onOpen: (course: EnrolledCourse) => void; onAll: () => void }) {
  if (!courses.length) return null;
  return (
    <motion.div {...enter(0.3)}>
      <Card className="p-2 sm:p-3" aria-label="আমার কোর্স">
        <SectionHeader icon={GraduationCap} title="আমার কোর্স" subtitle={`${bn(courses.length)}টি কোর্সে এনরোল করা`} action="সব কোর্স" onAction={onAll} className="px-2 pt-2" />
        <ul className="mt-1">
          {courses.map((c) => (
            <li key={c.id}>
              <Row
                title={c.title}
                meta={
                  <span className="flex items-center gap-2">
                    <Track value={(c.progress || 0) / 100} className="w-24" />
                    <span className="font-body tabular-nums">{bn(c.progress || 0)}%</span>
                  </span>
                }
                lead={
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand-deep dark:bg-brand/20 dark:text-brand-bright">
                    <BookOpen className="h-[18px] w-[18px]" strokeWidth={2.4} aria-hidden="true" />
                  </span>
                }
                onClick={() => onOpen(c)}
              />
            </li>
          ))}
        </ul>
      </Card>
    </motion.div>
  );
}

/* ── study info ────────────────────────────────────────────────────────── */

export function StudyInfoCard({ identity, onEdit }: { identity: ProfileIdentity; onEdit: () => void }) {
  const completion = profileCompletion(identity);
  const rows: Array<{ icon: LucideIcon; label: string; value: string }> = [
    { icon: GraduationCap, label: 'লেভেল ও ব্যাচ', value: batchLabel(identity.hscBatch) },
    { icon: BookOpen, label: 'বিভাগ', value: departmentLabel(identity.department) },
    { icon: Target, label: 'লক্ষ্য', value: targetLabel(identity.target) },
    { icon: School, label: 'কলেজ', value: identity.college },
    { icon: Flame, label: 'দৈনিক পড়ার লক্ষ্য', value: identity.dailyStudyGoal },
    { icon: Smartphone, label: 'মোবাইল', value: identity.phoneNumber ? formatBdPhone(identity.phoneNumber) : '' },
    { icon: Mail, label: 'ইমেইল', value: identity.email },
  ];
  return (
    <motion.div {...enter(0.3)}>
      <Card className="p-4 sm:p-5" aria-label="পড়াশোনার তথ্য">
        <SectionHeader icon={GraduationCap} title="পড়াশোনার তথ্য" subtitle={completion.missing.length ? `${bn(completion.done)}/${bn(completion.total)} সম্পূর্ণ` : 'প্রোফাইল সম্পূর্ণ'} action="এডিট" onAction={onEdit} />
        {completion.missing.length > 0 && <Track value={completion.done / completion.total} className="mt-3" />}
        <dl className="mt-3 divide-y divide-ink/[0.05] dark:divide-white/[0.06]">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-3 py-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-ink/[0.04] text-ink/60 dark:bg-white/[0.06] dark:text-white/60">
                <r.icon className="h-4 w-4" strokeWidth={2.3} aria-hidden="true" />
              </span>
              <dt className="w-[110px] shrink-0 text-[12.5px] font-semibold text-mist dark:text-white/50">{r.label}</dt>
              <dd className="min-w-0 flex-1 text-right">
                {r.value ? (
                  <span className={cx('block truncate text-[14px] font-bold text-ink dark:text-paper', r.label === 'ইমেইল' && 'font-normal')} dir="auto">
                    {r.value}
                  </span>
                ) : r.label === 'ইমেইল' ? (
                  <span className="text-[13px] font-semibold text-mist dark:text-white/40">—</span>
                ) : (
                  <button type="button" onClick={onEdit} className="focus-ring text-[13px] font-extrabold text-brand-deep hover:underline dark:text-brand-bright">
                    যোগ করো
                  </button>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </Card>
    </motion.div>
  );
}

/* ── account shortcuts ─────────────────────────────────────────────────── */

export function AccountCard({ onSettings, onLeaderboard, onLogout }: { onSettings: () => void; onLeaderboard: () => void; onLogout: () => void }) {
  const tile = (cls: string, Icon: LucideIcon) => (
    <span className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-xl', cls)}>
      <Icon className="h-[18px] w-[18px]" strokeWidth={2.4} aria-hidden="true" />
    </span>
  );
  return (
    <motion.div {...enter(0.35)}>
      <Card className="p-2 sm:p-3" aria-label="অ্যাকাউন্ট">
        <Row lead={tile('bg-ink/[0.05] text-ink/70 dark:bg-white/[0.08] dark:text-white/70', Settings)} title="সেটিংস" meta="থিম, প্রশ্নের ফন্ট, অ্যাকাউন্ট" onClick={onSettings} />
        <Row lead={tile('bg-gold/20 text-amber-800 dark:bg-gold/20 dark:text-amber-200', Trophy)} title="লিডারবোর্ড" meta="সবার মধ্যে তোমার অবস্থান" onClick={onLeaderboard} />
        <Row lead={tile('bg-flag/10 text-flag dark:bg-flag/20 dark:text-red-300', LogOut)} title={<span className="text-flag dark:text-red-300">লগআউট</span>} onClick={onLogout} />
      </Card>
    </motion.div>
  );
}

/* ── skeleton ──────────────────────────────────────────────────────────── */

export function ProfileSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="লোড হচ্ছে">
      <Bone className="h-[280px] rounded-[28px]" />
      <Bone className="h-[210px] rounded-[26px]" />
      <Bone className="h-[220px] rounded-[26px]" />
    </div>
  );
}
