import { DEPARTMENTS, TARGETS, labelOf, parseBatch } from '../../data/profileOptions';
import { toBanglaDigits } from '../../utils/phone';
import { accuracyOf, bn, dateKey, dhakaParts, rankOf, subjectRows, todayKey, type DashboardStats, type SubjectRow } from '../dashboard/model';

/*
 * Pure helpers behind the profile page: the activity heat-map, achievement
 * badges, "member since" copy and the study summary. Nothing here touches
 * React or the network so it can be unit-tested directly.
 */

export { accuracyOf, bn, rankOf, subjectRows, type SubjectRow };

/* ── payload (GET /users/:uid/stats) ───────────────────────────────────── */

export interface TopicStat {
  topic: string;
  accuracy?: number;
  total?: number;
}

export interface ProfileUser {
  uid?: string;
  displayName?: string;
  photoURL?: string;
  email?: string;
  college?: string;
  hscBatch?: string;
  department?: string;
  target?: string;
  phoneNumber?: string;
  dailyStudyGoal?: string;
  createdAt?: number | string;
  currentStreak?: number;
}

export interface ProfileStats extends Omit<DashboardStats, 'user'> {
  strongestTopics?: TopicStat[];
  weakestTopics?: TopicStat[];
  user?: ProfileUser | null;
}

/** What the header + study card show; merged from auth, extended profile and the stats payload. */
export interface ProfileIdentity {
  name: string;
  email: string;
  photoURL: string;
  college: string;
  hscBatch: string;
  department: string;
  target: string;
  phoneNumber: string;
  dailyStudyGoal: string;
  createdAt?: number | string | null;
}

export const emptyIdentity = (): ProfileIdentity => ({
  name: '',
  email: '',
  photoURL: '',
  college: '',
  hscBatch: '',
  department: '',
  target: '',
  phoneNumber: '',
  dailyStudyGoal: '',
  createdAt: null,
});

/* ── dates ─────────────────────────────────────────────────────────────── */

const BN_MONTHS = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
const BN_MONTHS_SHORT = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];

const toDate = (value?: number | string | null): Date | null => {
  if (value === undefined || value === null || value === '') return null;
  const n = typeof value === 'number' ? value : /^\d+$/.test(value) ? Number(value) : Date.parse(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  const d = new Date(n);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** "মে ২০২৫" — when the account was created; '' when unknown. */
export const memberSince = (...candidates: Array<number | string | null | undefined>): string => {
  for (const c of candidates) {
    const d = toDate(c);
    if (d) {
      const p = dhakaParts(d);
      return `${BN_MONTHS[p.month - 1]} ${bn(p.year)}`;
    }
  }
  return '';
};

/* ── activity heat-map ─────────────────────────────────────────────────── */

export interface HeatCell {
  key: string;
  active: boolean;
  isToday: boolean;
  future: boolean;
}

export interface HeatColumn {
  /** Saturday → Friday, matching the rest of the app. */
  cells: HeatCell[];
  /** Short month name when a month starts inside this column. */
  label: string | null;
}

export interface Heatmap {
  columns: HeatColumn[];
  /** Active days inside the window (future days excluded). */
  activeDays: number;
  /** Elapsed days inside the window. */
  days: number;
}

const DAY = 86_400_000;
const utcDay = (key: string): number => {
  const [y, m, d] = key.split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / DAY);
};
const keyOfUtcDay = (n: number): string => {
  const d = new Date(n * DAY);
  return dateKey(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
};

/**
 * `weeks` Saturday-first columns ending with the current week. Today is
 * resolved in Asia/Dhaka so the grid agrees with the server's activity keys.
 */
export const heatmap = (activityLog: string[] = [], weeks = 26, now: Date = new Date()): Heatmap => {
  const log = new Set(activityLog);
  const today = todayKey(now);
  const todayN = utcDay(today);
  const p = dhakaParts(now); // weekday 0 = Sunday → Saturday-first index
  const satIndex = (p.weekday + 1) % 7;
  const weekEnd = todayN + (6 - satIndex); // this week's Friday
  const start = weekEnd - weeks * 7 + 1;
  const columns: HeatColumn[] = [];
  let activeDays = 0;
  let days = 0;
  let lastLabelCol = -3;
  for (let c = 0; c < weeks; c++) {
    const cells: HeatCell[] = [];
    let label: string | null = null;
    for (let r = 0; r < 7; r++) {
      const n = start + c * 7 + r;
      const key = keyOfUtcDay(n);
      const future = n > todayN;
      const active = !future && log.has(key);
      if (!future) days++;
      if (active) activeDays++;
      if (key.endsWith('-01') && c - lastLabelCol >= 3) {
        label = BN_MONTHS_SHORT[Number(key.slice(5, 7)) - 1];
        lastLabelCol = c;
      }
      cells.push({ key, active, isToday: key === today, future });
    }
    columns.push({ cells, label });
  }
  return { columns, activeDays, days };
};

/** Longest run of consecutive active days in the whole log. */
export const longestStreak = (activityLog: string[] = []): number => {
  const nums = Array.from(new Set(activityLog.filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(k)).map(utcDay))).sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  for (let i = 0; i < nums.length; i++) {
    run = i > 0 && nums[i] === nums[i - 1] + 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return best;
};

/** Days active counting back from today (or yesterday, if today is still open). */
export const streakFromLog = (activityLog: string[] = [], now: Date = new Date()): number => {
  const log = new Set(activityLog);
  let n = utcDay(todayKey(now));
  if (!log.has(keyOfUtcDay(n))) n -= 1;
  let streak = 0;
  while (log.has(keyOfUtcDay(n))) {
    streak++;
    n -= 1;
  }
  return streak;
};

/* ── achievements ──────────────────────────────────────────────────────── */

export type AchievementIcon = 'flag' | 'exams' | 'marathon' | 'streak' | 'calendar' | 'target' | 'points' | 'bullseye' | 'trophy';

export interface Achievement {
  id: string;
  title: string;
  hint: string;
  icon: AchievementIcon;
  unlocked: boolean;
  /** 0–1 toward unlocking. */
  progress: number;
  /** Short status: "৩/১০", "৭৬%", "#১২". */
  status: string;
  /** "আর ৭টি পরীক্ষা" — what is left, for the "next up" line. */
  remaining: string | null;
}

interface AchievementInput {
  stats: ProfileStats | null | undefined;
  rank: number | null;
  longest: number;
}

const counted = (
  id: string,
  title: string,
  hint: string,
  icon: AchievementIcon,
  value: number,
  target: number,
  unit: string,
): Achievement => ({
  id,
  title,
  hint,
  icon,
  unlocked: value >= target,
  progress: Math.min(1, Math.max(0, value / target)),
  status: value >= target ? '✓' : `${bn(Math.min(value, target))}/${bn(target)}`,
  remaining: value >= target ? null : `আর ${bn(target - value)}${unit}`,
});

export const achievements = ({ stats, rank, longest }: AchievementInput): Achievement[] => {
  const exams = stats?.totalExams || 0;
  const correct = stats?.totalCorrect || 0;
  const answered = correct + (stats?.totalWrong || 0);
  const points = stats?.points || 0;
  const accuracy = accuracyOf(stats ?? undefined);
  const streak = Math.max(longest, stats?.currentStreak || 0);

  const sharp: Achievement = {
    id: 'accuracy-80',
    title: 'নিখুঁত নিশানা',
    hint: '১০০+ উত্তরে ৮০% নির্ভুলতা',
    icon: 'bullseye',
    unlocked: answered >= 100 && accuracy >= 80,
    progress: Math.min(1, answered / 100) * Math.min(1, accuracy / 80),
    status: answered >= 100 && accuracy >= 80 ? '✓' : answered > 0 ? `${bn(accuracy)}%` : '০%',
    remaining: answered < 100 ? `আর ${bn(100 - answered)}টি উত্তর` : accuracy < 80 ? `আরও ${bn(80 - accuracy)}% নির্ভুলতা` : null,
  };
  const topTen: Achievement = {
    id: 'rank-10',
    title: 'শীর্ষ দশ',
    hint: 'লিডারবোর্ডে সেরা ১০-এ',
    icon: 'trophy',
    unlocked: !!rank && rank <= 10,
    progress: rank ? Math.min(1, 10 / rank) : 0,
    status: rank ? `#${bn(rank)}` : '—',
    remaining: rank && rank > 10 ? `আর ${bn(rank - 10)} ধাপ` : rank ? null : 'র‍্যাঙ্ক পেতে পরীক্ষা দাও',
  };

  return [
    counted('exam-1', 'প্রথম ধাপ', 'প্রথম পরীক্ষা শেষ', 'flag', exams, 1, 'টি পরীক্ষা'),
    counted('exam-10', 'নিয়মিত', '১০টি পরীক্ষা', 'exams', exams, 10, 'টি পরীক্ষা'),
    counted('exam-50', 'ম্যারাথনার', '৫০টি পরীক্ষা', 'marathon', exams, 50, 'টি পরীক্ষা'),
    counted('streak-7', 'এক সপ্তাহ টানা', '৭ দিনের স্ট্রিক', 'streak', streak, 7, ' দিন'),
    counted('streak-30', 'এক মাস টানা', '৩০ দিনের স্ট্রিক', 'calendar', streak, 30, ' দিন'),
    counted('correct-500', 'পাঁচশো সঠিক', '৫০০টি সঠিক উত্তর', 'target', correct, 500, 'টি সঠিক'),
    counted('points-1000', 'হাজারি', '১,০০০ পয়েন্ট', 'points', points, 1000, ' পয়েন্ট'),
    sharp,
    topTen,
  ];
};

/** The locked badge closest to unlocking — for the "পরের অর্জন" line. */
export const nextAchievement = (list: Achievement[]): Achievement | null => {
  const locked = list.filter((a) => !a.unlocked && a.remaining);
  if (!locked.length) return null;
  return locked.sort((a, b) => b.progress - a.progress)[0];
};

/* ── study summary ─────────────────────────────────────────────────────── */

/** "HSC ২০২৬" from "HSC 2026" / legacy "2026"; '' when unset. */
export const batchLabel = (hscBatch?: string | null): string => {
  const { batch } = parseBatch(hscBatch);
  return batch ? toBanglaDigits(batch) : '';
};

export const departmentLabel = (id?: string | null): string => labelOf(DEPARTMENTS, id);
export const targetLabel = (id?: string | null): string => labelOf(TARGETS, id);

/** "HSC ২০২৬ · বিজ্ঞান · মেডিকেল" (whatever is known). */
export const studyLine = (p: Pick<ProfileIdentity, 'hscBatch' | 'department' | 'target'>): string =>
  [batchLabel(p.hscBatch), departmentLabel(p.department), targetLabel(p.target)].filter(Boolean).join(' · ');

/** How much of the study profile is filled in, for the "সম্পূর্ণ করো" nudge. */
export const profileCompletion = (p: ProfileIdentity): { done: number; total: number; missing: string[] } => {
  const fields: Array<[string, string]> = [
    ['নাম', p.name],
    ['মোবাইল', p.phoneNumber],
    ['ব্যাচ', p.hscBatch],
    ['বিভাগ', p.department],
    ['লক্ষ্য', p.target],
    ['কলেজ', p.college],
    ['দৈনিক লক্ষ্য', p.dailyStudyGoal],
  ];
  const missing = fields.filter(([, v]) => !v || !v.trim()).map(([k]) => k);
  return { done: fields.length - missing.length, total: fields.length, missing };
};

/* ── topics ────────────────────────────────────────────────────────────── */

export interface TopicRow {
  topic: string;
  accuracy: number;
  total: number;
}

const cleanTopics = (list: TopicStat[] = [], minTotal: number): TopicRow[] => {
  const seen = new Set<string>();
  return list
    .filter((t) => t && t.topic && (t.total || 0) >= minTotal && Number.isFinite(Number(t.accuracy)))
    .map((t) => ({ topic: t.topic.trim(), accuracy: Math.round(Number(t.accuracy)), total: Number(t.total) || 0 }))
    .filter((t) => (seen.has(t.topic) ? false : (seen.add(t.topic), true)));
};

/** Up to three strong (≥70%) and three weak (<60%) topics, never overlapping. */
export const topicRows = (stats: ProfileStats | null | undefined, limit = 3): { strong: TopicRow[]; weak: TopicRow[] } => {
  const strong = cleanTopics(stats?.strongestTopics, 5)
    .filter((t) => t.accuracy >= 70)
    .sort((a, b) => b.accuracy - a.accuracy || b.total - a.total)
    .slice(0, limit);
  const names = new Set(strong.map((t) => t.topic));
  const weak = cleanTopics(stats?.weakestTopics, 5)
    .filter((t) => t.accuracy < 60 && !names.has(t.topic))
    .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total)
    .slice(0, limit);
  return { strong, weak };
};

/* ── misc ──────────────────────────────────────────────────────────────── */

/* ── chapter deep analysis ─────────────────────────────────────────────── */

export interface ChapterStat {
  key: string; // subject::chapter
  subject: string;
  chapter: string;
  total: number;
  correct: number;
  wrong: number;
  skipped: number;
  accuracy: number;
}

export interface ExamResultLike {
  questions?: Array<{ subject?: string; chapter?: string; topic?: string; correctAnswerIndex?: number; correctAnswer?: number; _id?: string }>;
  userAnswers?: Array<number | null>;
  subject?: string;
  timestamp?: number;
}

export const chapterStatsFromResults = (results: ExamResultLike[] = [], subjectFilter?: string | null): ChapterStat[] => {
  const map = new Map<string, ChapterStat>();
  results.forEach((r) => {
    const qs = Array.isArray(r.questions) ? r.questions : [];
    const ans = Array.isArray(r.userAnswers) ? r.userAnswers : [];
    qs.forEach((q, idx) => {
      if (!q) return;
      const subj = (q.subject || r.subject || 'General').trim() || 'General';
      if (subjectFilter && subj !== subjectFilter) {
        // Also allow matching by display name grouping — check if filter is a group name that contains this subject
        // For simplicity, if filter is provided we still include only exact subject matches;
        // the caller can pass null to get all.
        if (subjectFilter !== subj) return;
      }
      const chap = (q.chapter || q.topic || 'অন্যান্য').trim() || 'অন্যান্য';
      const key = `${subj}::${chap}`;
      const cur = map.get(key) || { key, subject: subj, chapter: chap, total: 0, correct: 0, wrong: 0, skipped: 0, accuracy: 0 };
      cur.total += 1;
      const a = ans[idx];
      const cIdx = (q as any).correctAnswerIndex ?? (q as any).correctAnswer ?? -1;
      if (a === null || a === undefined) cur.skipped += 1;
      else if (a === cIdx) cur.correct += 1;
      else cur.wrong += 1;
      map.set(key, cur);
    });
  });
  return Array.from(map.values())
    .map((s) => ({ ...s, accuracy: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0 }))
    .sort((a, b) => b.total - a.total || a.chapter.localeCompare(b.chapter, 'bn'));
};

export const weakChaptersFromStats = (stats: ChapterStat[], minTotal = 3): ChapterStat[] =>
  stats.filter((s) => s.total >= minTotal && s.accuracy < 50).sort((a, b) => a.accuracy - b.accuracy || b.total - a.total);

/** Sum of correct across subject rows — used to detect backend inconsistency. */
export const sumCorrectFromSubjectRows = (rows: SubjectRow[]): number => rows.reduce((sum, r) => sum + (r.correct || 0), 0);
export const sumTotalFromSubjectRows = (rows: SubjectRow[]): number => rows.reduce((sum, r) => sum + (r.total || 0), 0);

/** Stable hue for the monogram, so the same student always gets the same colour. */
export const hueFor = (seed: string): number => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return h;
};

export const initialOf = (name?: string | null): string => (name || '').trim().charAt(0).toUpperCase() || 'শ';

export const isHttpUrl = (url?: string | null): boolean => !!url && url !== 'false' && /^https?:\/\//.test(url);

/** Public profile URL for the share button. */
export const profileUrl = (uid: string, origin: string): string => `${origin.replace(/\/$/, '')}/profile/${encodeURIComponent(uid)}`;
