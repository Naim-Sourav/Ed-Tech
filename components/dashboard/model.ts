import type { Quest, LeaderboardUser } from '../../types';
import { bn, displaySubject, examTitle, weekDays, type ExamConfig, type WeekDay } from '../exam/model';
import { SUBJECT_GROUPS } from '../quiz/catalog';
import { readLastSetup, type LastSetup } from '../quiz/launch';
import { autoTitle, selectedChapters } from '../quiz/selection';

/*
 * Pure helpers behind the home dashboard. Everything here is side-effect
 * free (storage access is injected) so the copy, streak maths and layout
 * decisions can be unit-tested without React.
 */

export { bn };

/* ── stats payload (GET /users/:uid/stats) ─────────────────────────────── */

export interface SubjectBreakdown {
  subject: string;
  total?: number;
  correct?: number;
  wrong?: number;
  accuracy?: number;
}

export interface DashboardStats {
  points?: number;
  totalExams?: number;
  totalCorrect?: number;
  totalWrong?: number;
  currentStreak?: number;
  longestStreak?: number;
  /** "YYYY-MM-DD" keys of days with activity. */
  activityLog?: string[];
  subjectBreakdown?: SubjectBreakdown[];
  quests?: Quest[];
  weeklyQuests?: Quest[];
  college?: string;
  user?: { college?: string; hscBatch?: string; department?: string; target?: string } | null;
}

export const accuracyOf = (stats: DashboardStats | null | undefined): number => {
  const correct = stats?.totalCorrect || 0;
  const total = correct + (stats?.totalWrong || 0);
  return total > 0 ? Math.round((correct / total) * 100) : 0;
};

/* ── dates (Asia/Dhaka, matching the activity log keys) ────────────────── */

const DHAKA = 'Asia/Dhaka';
const BN_MONTHS = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
const BN_WEEKDAYS = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
/** Saturday-first, matching `weekDays()` in the exam model. */
export const WEEK_LABELS = ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র'];

interface DhakaParts {
  year: number;
  month: number; // 1-12
  day: number;
  weekday: number; // 0 = Sunday
  hour: number;
}

export const dhakaParts = (now: Date = new Date()): DhakaParts => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: DHAKA,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { year: Number(get('year')), month: Number(get('month')), day: Number(get('day')), weekday: Math.max(0, weekday), hour: Number(get('hour')) % 24 };
};

const pad = (n: number) => String(n).padStart(2, '0');
export const dateKey = (year: number, month: number, day: number): string => `${year}-${pad(month)}-${pad(day)}`;
export const todayKey = (now: Date = new Date()): string => {
  const p = dhakaParts(now);
  return dateKey(p.year, p.month, p.day);
};

/** "বুধবার, ২৪ সেপ্টেম্বর" */
export const formatBnDate = (now: Date = new Date()): string => {
  const p = dhakaParts(now);
  return `${BN_WEEKDAYS[p.weekday]}, ${bn(p.day)} ${BN_MONTHS[p.month - 1]}`;
};

export const greetingFor = (hour: number): string => {
  if (hour < 4) return 'শুভ রাত্রি';
  if (hour < 12) return 'শুভ সকাল';
  if (hour < 16) return 'শুভ দুপুর';
  if (hour < 18) return 'শুভ বিকেল';
  if (hour < 21) return 'শুভ সন্ধ্যা';
  return 'শুভ রাত্রি';
};

export const firstName = (displayName?: string | null): string => {
  const name = (displayName || '').trim();
  if (!name) return 'শিক্ষার্থী';
  return name.split(/\s+/)[0];
};

/* ── hero copy ─────────────────────────────────────────────────────────── */

export interface HeroContext {
  todayActive: boolean;
  streak: number;
  totalExams: number;
}

export const heroMessage = ({ todayActive, streak, totalExams }: HeroContext): string => {
  if (totalExams === 0 && !todayActive) return 'প্রথম মকটা দিয়েই শুরু হোক — ১০টা প্রশ্ন, ১০ মিনিট। বাকিটা আমরা সাজিয়ে দেব।';
  if (todayActive) {
    if (streak >= 7) return `আজকের প্র্যাকটিস হয়ে গেছে — ${bn(streak)} দিনের স্ট্রিক চলছে। এই ছন্দটা ধরে রাখো।`;
    return 'আজকের প্র্যাকটিস হয়ে গেছে। হাতে সময় থাকলে আরেকটা ছোট মক দিয়ে ভুলগুলো ঝালাই করে নাও।';
  }
  if (streak > 0) return `আজ এখনো কিছু দাওনি — একটা ছোট মক দিলেই ${bn(streak)} দিনের স্ট্রিকটা টিকে যাবে।`;
  return 'আজ থেকে আবার শুরু — একটা মক দিলেই নতুন স্ট্রিক গড়ে উঠবে।';
};

/* ── streak & rhythm ───────────────────────────────────────────────────── */

export interface RhythmDay extends WeekDay {
  active: boolean;
  future: boolean;
}

export const weekRhythm = (activityLog: string[] = [], now: Date = new Date()): RhythmDay[] => {
  const today = todayKey(now);
  const log = new Set(activityLog);
  return weekDays(now).map((d) => ({ ...d, active: log.has(d.date), future: d.date > today }));
};

const MILESTONES = [3, 7, 14, 30, 60, 100, 200, 365];

export const nextMilestone = (streak: number): { target: number; remaining: number; progress: number } => {
  const target = MILESTONES.find((m) => m > streak) ?? Math.ceil((streak + 1) / 100) * 100;
  const prev = [...MILESTONES].reverse().find((m) => m <= streak) ?? 0;
  const span = Math.max(1, target - prev);
  return { target, remaining: target - streak, progress: Math.min(1, Math.max(0, (streak - prev) / span)) };
};

export interface MonthCell {
  day: number;
  key: string;
  active: boolean;
  isToday: boolean;
  future: boolean;
}

export interface MonthGrid {
  year: number;
  month: number;
  label: string;
  /** Saturday-first weeks, padded with nulls. */
  cells: Array<MonthCell | null>;
  activeDays: number;
}

export const monthGrid = (year: number, month: number, activityLog: string[] = [], now: Date = new Date()): MonthGrid => {
  const today = todayKey(now);
  const log = new Set(activityLog);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay(); // 0 = Sunday
  const leading = (firstWeekday + 1) % 7; // shift so Saturday is column 0
  const cells: Array<MonthCell | null> = Array.from({ length: leading }, () => null);
  let activeDays = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const key = dateKey(year, month, day);
    const active = log.has(key);
    if (active) activeDays++;
    cells.push({ day, key, active, isToday: key === today, future: key > today });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return { year, month, label: `${BN_MONTHS[month - 1]} ${bn(year)}`, cells, activeDays };
};

export const shiftMonth = (year: number, month: number, delta: number): { year: number; month: number } => {
  const idx = year * 12 + (month - 1) + delta;
  return { year: Math.floor(idx / 12), month: (idx % 12) + 1 };
};

/* ── subjects ──────────────────────────────────────────────────────────── */

export type Tone = 'good' | 'ok' | 'weak';

export interface SubjectRow {
  key: string;
  name: string;
  /** SubjectGroup.name understood by the mock builder, when known. */
  group: string | null;
  total: number;
  correct: number;
  accuracy: number;
  tone: Tone;
}

export const toneFor = (accuracy: number): Tone => (accuracy >= 70 ? 'good' : accuracy >= 50 ? 'ok' : 'weak');

const groupIdFor = (subject: string): string | null => {
  const display = displaySubject(subject);
  const hit = SUBJECT_GROUPS.find((g) => g.display === display || display.startsWith(g.display) || g.name.toLowerCase() === subject.trim().toLowerCase());
  return hit ? hit.name : null;
};

/** Merges paper-level rows ("Physics 1st Paper" + "Physics 2nd Paper") into one subject row each. */
export const subjectRows = (breakdown: SubjectBreakdown[] = []): SubjectRow[] => {
  const merged = new Map<string, SubjectRow>();
  breakdown.forEach((raw) => {
    if (!raw || !raw.subject) return;
    const total = Number(raw.total) || 0;
    const correct = Number(raw.correct) || 0;
    if (total <= 0 && correct <= 0) return;
    const name = displaySubject(raw.subject).replace(/ (১ম|২য়) পত্র$/, '');
    const row = merged.get(name) ?? { key: name, name, group: groupIdFor(raw.subject), total: 0, correct: 0, accuracy: 0, tone: 'ok' as Tone };
    row.total += total;
    row.correct += correct;
    merged.set(name, row);
  });
  return Array.from(merged.values())
    .map((row) => {
      const accuracy = row.total > 0 ? Math.round((row.correct / row.total) * 100) : 0;
      return { ...row, accuracy, tone: toneFor(accuracy) };
    })
    .sort((a, b) => b.accuracy - a.accuracy || b.total - a.total);
};

/** The subject that most needs work — only once there is enough signal. */
export const weakestSubject = (rows: SubjectRow[], minTotal = 10): SubjectRow | null => {
  const eligible = rows.filter((r) => r.total >= minTotal);
  if (eligible.length < 2) return null;
  const weakest = eligible[eligible.length - 1];
  return weakest.accuracy < 75 ? weakest : null;
};

/* ── quests ────────────────────────────────────────────────────────────── */

export interface QuestPreview {
  id: string;
  title: string;
  progress: number;
  target: number;
  reward: number;
  completed: boolean;
  claimed: boolean;
  link?: string;
}

/** Up to `limit` daily quests: unfinished first, then finished-but-unclaimed, then claimed. */
export const questPreview = (quests: Quest[] = [], limit = 3): QuestPreview[] => {
  const rank = (q: Quest) => (q.claimed ? 2 : q.completed ? 0 : 1);
  return [...quests]
    .filter((q) => q && q.id && q.title)
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, limit)
    .map((q) => ({
      id: q.id,
      title: q.title,
      progress: Math.min(Number(q.progress) || 0, Number(q.target) || 0),
      target: Number(q.target) || 0,
      reward: Number(q.reward) || 0,
      completed: !!q.completed,
      claimed: !!q.claimed,
      link: q.link,
    }));
};

export const questsDone = (quests: Quest[] = []): number => quests.filter((q) => q.completed).length;

/* ── leaderboard ───────────────────────────────────────────────────────── */

export const rankOf = (leaderboard: LeaderboardUser[], uid?: string | null): number | null => {
  if (!uid) return null;
  const idx = leaderboard.findIndex((u) => u.uid === uid);
  return idx === -1 ? null : idx + 1;
};

export interface BoardRow {
  user: Pick<LeaderboardUser, 'uid' | 'displayName' | 'photoURL' | 'points' | 'college'>;
  rank: number;
  isMe: boolean;
}

/** Top three plus the signed-in user (separated by `gap`) when they sit lower. */
export const boardRows = (
  leaderboard: LeaderboardUser[],
  me: { uid: string; displayName?: string | null; photoURL?: string | null; points?: number; college?: string } | null,
  top = 3,
): { rows: BoardRow[]; gap: boolean } => {
  const rows: BoardRow[] = leaderboard.slice(0, top).map((user, i) => ({ user, rank: i + 1, isMe: !!me && user.uid === me.uid }));
  if (!me || rows.some((r) => r.isMe)) return { rows, gap: false };
  const myRank = rankOf(leaderboard, me.uid);
  if (!myRank) return { rows, gap: false };
  const mine = leaderboard[myRank - 1];
  rows.push({
    user: {
      uid: me.uid,
      displayName: mine.displayName || me.displayName || 'তুমি',
      photoURL: mine.photoURL || me.photoURL || '',
      points: mine.points ?? me.points ?? 0,
      college: mine.college || me.college,
    },
    rank: myRank,
    isMe: true,
  });
  return { rows, gap: myRank > top + 1 };
};

/* ── resume: unfinished exams & last setup ─────────────────────────────── */

export interface ActiveSession {
  examId: string;
  title: string;
  answered: number;
  total: number;
  /** Seconds left for timed exams, null when untimed. */
  remaining: number | null;
  savedAt: number;
}

interface StorageLike {
  length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
}

/** Unfinished exams saved by the exam player (`exam_progress_<uid>_<examId>`), newest first. */
export const readActiveSessions = (uid: string, storage: StorageLike | null, now: number = Date.now()): ActiveSession[] => {
  if (!uid || !storage) return [];
  const prefix = `exam_progress_${uid}_`;
  const out: ActiveSession[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key || !key.startsWith(prefix)) continue;
    try {
      const raw = JSON.parse(storage.getItem(key) || 'null');
      const questions = Array.isArray(raw?.questions) ? raw.questions : [];
      if (questions.length === 0) continue;
      const answers: unknown[] = Array.isArray(raw?.userAnswers) ? raw.userAnswers : [];
      const expiry = typeof raw?.expiryTime === 'number' ? raw.expiryTime : null;
      const remaining = expiry ? Math.floor((expiry - now) / 1000) : null;
      if (remaining !== null && remaining <= 0) continue; // the player will auto-submit this one
      const config = (raw?.config ?? {}) as ExamConfig;
      out.push({
        examId: key.slice(prefix.length),
        title: examTitle(config, questions, config.mode || 'ALL_AT_ONCE'),
        answered: answers.filter((a) => a !== null && a !== undefined).length,
        total: questions.length,
        remaining,
        savedAt: typeof raw?.savedAt === 'number' ? raw.savedAt : 0,
      });
    } catch {
      /* corrupt entry — ignore */
    }
  }
  return out.sort((a, b) => b.savedAt - a.savedAt);
};

export interface SetupPreview {
  title: string;
  detail: string;
  at: number;
}

/** Human summary of the last mock-test setup, e.g. "পদার্থবিজ্ঞান · ভেক্টর" / "২০ প্রশ্ন · ২০ মিনিট · নেগেটিভ ০.২৫". */
export const describeSetup = (setup: LastSetup | null): SetupPreview | null => {
  if (!setup) return null;
  const chapters = selectedChapters(setup.selection);
  if (chapters.length === 0) return null;
  const s = setup.settings;
  const bits = [
    `${bn(s.count)} প্রশ্ন`,
    s.timeLimit > 0 ? `${bn(s.timeLimit)} মিনিট` : 'সময় নেই',
    s.practice ? 'প্র্যাকটিস' : s.negativeMarking > 0 ? `নেগেটিভ ${bn(s.negativeMarking)}` : null,
  ].filter(Boolean) as string[];
  return { title: setup.title || autoTitle(setup.selection), detail: bits.join(' · '), at: setup.at };
};

export const readSetupPreview = (): SetupPreview | null => describeSetup(readLastSetup());

/** "এইমাত্র" / "৩ ঘণ্টা আগে" / "গতকাল" / "৫ দিন আগে" */
export const relativeTime = (at: number, now: number = Date.now()): string => {
  if (!at) return '';
  const diff = Math.max(0, now - at);
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return 'এইমাত্র';
  if (mins < 60) return `${bn(mins)} মিনিট আগে`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${bn(hours)} ঘণ্টা আগে`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'গতকাল';
  if (days < 30) return `${bn(days)} দিন আগে`;
  return `${bn(Math.floor(days / 30))} মাস আগে`;
};

export const formatPoints = (points: number): string => bn(Math.max(0, Math.round(points || 0)).toLocaleString('en-US'));
