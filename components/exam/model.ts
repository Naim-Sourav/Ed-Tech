import type { QuizQuestion } from '../../types';
import { toBengaliNumber } from '../../utils/numberUtils';

/*
 * Pure helpers behind the exam screen (components/ExamPage.tsx).
 * No React, no storage, no network — everything here is unit-testable.
 */

export type Answer = number | null;
export type ExamMode = 'SINGLE_PAGE' | 'ALL_AT_ONCE' | 'RAPID_FIRE';
export type ReviewFilter = 'ALL' | 'CORRECT' | 'WRONG' | 'SKIPPED' | 'FLAGGED';

/** Shape of `localStorage['exam_config_<id>']` (see components/quiz/launch.ts) and the public-exam config. */
export interface ExamConfig {
  title?: string;
  timeLimit?: number;
  negativeMarking?: number;
  mode?: ExamMode;
  type?: 'PAST_PAPER' | 'CHAPTER_WISE' | 'PUBLIC_EXAM' | string;
  isPracticeMode?: boolean;
  isMistakeRetake?: boolean;
  questions?: QuizQuestion[];
  shuffle?: boolean;
  subject?: string;
  chapter?: string;
  source?: string;
  examRef?: string;
  totalMarks?: number;
}

export const bn = (value: number | string | null | undefined): string => toBengaliNumber(value);

const OPTION_LABELS = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ'];
export const optionLabel = (index: number): string => OPTION_LABELS[index] ?? String.fromCharCode(65 + index);

export const hasBangla = (text: string = ''): boolean => /[\u0980-\u09FF]/.test(text);

/* ── time ─────────────────────────────────────────────────────────────── */

/** "মিমি:সেসে" (Bangla digits); hours are prefixed only when needed → "১:০৫:০৯". */
export const formatClock = (seconds: number): string => {
  const total = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return bn(h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`);
};

/** Human duration for the result screen / leaderboard: "৫ মি ৩ সে", "৪৫ সে", "১ ঘ ৫ মি". */
export const formatDurationBn = (seconds: number | null | undefined): string => {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) return '—';
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${bn(h)} ঘ ${bn(m)} মি`;
  if (m > 0) return s > 0 ? `${bn(m)} মি ${bn(s)} সে` : `${bn(m)} মি`;
  return `${bn(s)} সে`;
};

/** Average seconds per question, rounded; null when nothing sensible can be shown. */
export const averageSecondsPerQuestion = (durationSeconds: number, total: number): number | null => {
  if (!durationSeconds || durationSeconds <= 0 || total <= 0) return null;
  return Math.round(durationSeconds / total);
};

/* ── scoring ───────────────────────────────────────────────────────────── */

export interface ExamSummary {
  total: number;
  correct: number;
  wrong: number;
  skipped: number;
  answered: number;
  negativeMarking: number;
  rawScore: number;
  /** Floored at 0 — the number stored with the attempt. */
  score: number;
  /** score / total, 0–100, rounded. */
  percentage: number;
  /** correct / answered, 0–100, rounded (0 when nothing was answered). */
  accuracy: number;
}

export const isAnswered = (answer: Answer): answer is number => answer !== null && answer !== undefined;
export const isCorrect = (q: QuizQuestion | undefined, answer: Answer): boolean => isAnswered(answer) && answer === q?.correctAnswerIndex;
export const isWrong = (q: QuizQuestion | undefined, answer: Answer): boolean => isAnswered(answer) && answer !== q?.correctAnswerIndex;

/** Same arithmetic the legacy screen used (correct − wrong × negative, floored at 0) so stored scores stay comparable. */
export const summarize = (questions: QuizQuestion[], answers: Answer[], negativeMarking: number = 0): ExamSummary => {
  const total = questions.length;
  let correct = 0;
  let wrong = 0;
  questions.forEach((q, i) => {
    const a = answers[i];
    if (isCorrect(q, a)) correct += 1;
    else if (isWrong(q, a)) wrong += 1;
  });
  const answered = correct + wrong;
  const skipped = total - answered;
  const negative = Number(negativeMarking) || 0;
  const rawScore = correct - wrong * negative;
  const score = Math.max(0, rawScore);
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
  return { total, correct, wrong, skipped, answered, negativeMarking: negative, rawScore, score, percentage, accuracy };
};

/** "১৮", "১৮.৭৫" — no trailing zeros, Bangla digits. */
export const formatScore = (score: number): string => {
  const rounded = Math.round(score * 100) / 100;
  return bn(Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, '').replace(/\.$/, ''));
};

export interface Verdict {
  title: string;
  subtitle: string;
  tone: 'great' | 'good' | 'push';
}

export const verdictFor = (percentage: number): Verdict => {
  if (percentage >= 80) return { title: 'দুর্দান্ত! 🎉', subtitle: 'এই ধারাবাহিকতা ধরে রাখো — তুমি ঠিক পথেই আছো।', tone: 'great' };
  if (percentage >= 50) return { title: 'ভালো হয়েছে!', subtitle: 'ভুলগুলোর ব্যাখ্যা একবার দেখে নাও, পরেরবার আরও ভালো হবে।', tone: 'good' };
  return { title: 'চর্চা চালিয়ে যাও', subtitle: 'প্রতিটা ভুল থেকেই শেখা। নিচের ব্যাখ্যাগুলো মন দিয়ে পড়ো।', tone: 'push' };
};

/* ── review filters ─────────────────────────────────────────────────────── */

export interface IndexedQuestion {
  q: QuizQuestion;
  idx: number;
}

export const filterForReview = (
  questions: QuizQuestion[],
  answers: Answer[],
  filter: ReviewFilter,
  flagged: ReadonlySet<number> = new Set(),
): IndexedQuestion[] =>
  questions
    .map((q, idx) => ({ q, idx }))
    .filter(({ q, idx }) => {
      const a = answers[idx];
      if (filter === 'CORRECT') return isCorrect(q, a);
      if (filter === 'WRONG') return isWrong(q, a);
      if (filter === 'SKIPPED') return !isAnswered(a);
      if (filter === 'FLAGGED') return flagged.has(idx);
      return true;
    });

/* ── stimulus (উদ্দীপক) grouping ──────────────────────────────────────── */

const sameStimulus = (a: QuizQuestion | undefined, b: QuizQuestion | undefined): boolean =>
  !!a && !!b && (a.contextText || '') === (b.contextText || '') && (a.contextImage || '') === (b.contextImage || '');

export const hasStimulus = (q: QuizQuestion | undefined): boolean => !!q && (!!q.contextText || !!q.contextImage);

/** True when `idx` is the first question of a run that shares the same stimulus. */
export const isStimulusHead = (questions: QuizQuestion[], idx: number): boolean => {
  const q = questions[idx];
  if (!hasStimulus(q)) return false;
  return idx === 0 || !sameStimulus(q, questions[idx - 1]);
};

/** 1-based range of the contiguous run sharing this question's stimulus; null when the question has none. */
export const stimulusRange = (questions: QuizQuestion[], idx: number): { start: number; end: number } | null => {
  const q = questions[idx];
  if (!hasStimulus(q)) return null;
  let start = idx;
  while (start > 0 && sameStimulus(q, questions[start - 1])) start -= 1;
  let end = idx;
  while (end < questions.length - 1 && sameStimulus(q, questions[end + 1])) end += 1;
  return { start: start + 1, end: end + 1 };
};

/* ── subjects & titles ─────────────────────────────────────────────────── */

const SUBJECT_NAMES: Array<[RegExp, string]> = [
  [/physics|পদার্থ/i, 'পদার্থবিজ্ঞান'],
  [/chemistry|রসায়ন/i, 'রসায়ন'],
  [/math|গণিত/i, 'উচ্চতর গণিত'],
  [/biology|জীব/i, 'জীববিজ্ঞান'],
  [/english|ইংরেজি/i, 'ইংরেজি'],
  [/bangla|বাংলা/i, 'বাংলা'],
  [/knowledge|\bgk\b|সাধারণ/i, 'সাধারণ জ্ঞান'],
  [/ict|তথ্য/i, 'আইসিটি'],
  [/mental|মানসিক/i, 'মানসিক দক্ষতা'],
];

/** "Physics 1st Paper" → "পদার্থবিজ্ঞান ১ম পত্র"; unknown names pass through. */
export const displaySubject = (subject: string = ''): string => {
  const hit = SUBJECT_NAMES.find(([re]) => re.test(subject));
  const base = hit ? hit[1] : subject.trim() || 'সাধারণ';
  if (/1st|১ম/i.test(subject)) return `${base} ১ম পত্র`;
  if (/2nd|২য়/i.test(subject)) return `${base} ২য় পত্র`;
  return base;
};

const GENERIC_TITLES = new Set(['Custom Exam', 'Exam', '']);
const KNOWN_TITLES: Record<string, string> = { 'Mistake Revision': 'ভুল প্রশ্ন রিভিশন', 'Daily Challenge': 'ডেইলি চ্যালেঞ্জ' };

/** Normalises legacy English launch titles ("Physics 1st Paper - All Chapters", "Mistake Revision"). */
export const prettifyTitle = (title: string): string => {
  const t = title.trim();
  if (KNOWN_TITLES[t]) return KNOWN_TITLES[t];
  const m = /^(.+?)\s+-\s+(.+)$/.exec(t);
  if (m && displaySubject(m[1]) !== m[1].trim()) {
    const rest = /^all chapters$/i.test(m[2]) ? 'সব অধ্যায়' : m[2];
    return `${displaySubject(m[1])} · ${rest}`;
  }
  return t;
};

/** Title shown in the exam header. Builder titles already name the chapter, so it is not repeated. */
export const examTitle = (config: ExamConfig | null | undefined, questions: QuizQuestion[], mode: ExamMode): string => {
  const subjects = Array.from(new Set(questions.map((q) => q.subject).filter(Boolean))) as string[];
  const chapters = Array.from(new Set(questions.map((q) => q.chapter).filter(Boolean))) as string[];
  const subjectsStr = subjects.map((s) => displaySubject(s)).join(', ');
  const chaptersStr = chapters.join(', ');
  const rawTitle = (config?.title || '').trim();
  const hasTitle = !GENERIC_TITLES.has(rawTitle);
  const title = hasTitle ? prettifyTitle(rawTitle) : '';

  if (hasTitle) {
    if (mode !== 'ALL_AT_ONCE' || chapters.length === 0 || chapters.length > 2) return title;
    const alreadyNamed = chapters.every((c) => title.includes(c));
    return alreadyNamed ? title : `${title} : ${chaptersStr}`;
  }
  if (!subjectsStr) return mode === 'ALL_AT_ONCE' ? 'যৌথ পরীক্ষা' : 'বিষয়ভিত্তিক পরীক্ষা';
  if (mode === 'ALL_AT_ONCE' && chaptersStr && chapters.length <= 2) return `${subjectsStr} : ${chaptersStr}`;
  return subjectsStr;
};

export const modeLabel = (config: ExamConfig | null | undefined): string => {
  if (config?.mode === 'RAPID_FIRE') return 'র‍্যাপিড ফায়ার';
  if (config?.isPracticeMode) return 'প্র্যাকটিস মোড';
  if (config?.type === 'PUBLIC_EXAM') return 'লাইভ পরীক্ষা';
  if (config?.type === 'PAST_PAPER') return 'বিগত প্রশ্ন';
  return 'মক টেস্ট';
};

/* ── chapter breakdown (result analytics) ──────────────────────────────── */

export interface ChapterStat {
  key: string;
  label: string;
  total: number;
  correct: number;
  wrong: number;
  skipped: number;
  /** correct / total, 0–100, rounded. */
  pct: number;
}

/** Per-chapter tallies (falls back to subject, then "অন্যান্য"); biggest chapters first, ties by label. */
export const chapterBreakdown = (questions: QuizQuestion[], answers: Answer[]): ChapterStat[] => {
  const map = new Map<string, ChapterStat>();
  questions.forEach((q, i) => {
    const key = (q.chapter || '').trim() || (q.subject ? displaySubject(q.subject) : '') || 'অন্যান্য';
    const stat = map.get(key) ?? { key, label: key, total: 0, correct: 0, wrong: 0, skipped: 0, pct: 0 };
    stat.total += 1;
    const a = answers[i];
    if (isCorrect(q, a)) stat.correct += 1;
    else if (isWrong(q, a)) stat.wrong += 1;
    else stat.skipped += 1;
    map.set(key, stat);
  });
  return Array.from(map.values())
    .map((s) => ({ ...s, pct: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0 }))
    .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label, 'bn'));
};

/** Chapters worth revisiting: at least `minQuestions` asked and under 50 % correct, weakest first. */
export const weakChapters = (stats: ChapterStat[], minQuestions: number = 2): ChapterStat[] =>
  stats.filter((s) => s.total >= minQuestions && s.pct < 50).sort((a, b) => a.pct - b.pct || b.total - a.total);

/* ── streak week strip ─────────────────────────────────────────────────── */

export interface WeekDay {
  name: string;
  /** YYYY-MM-DD in Asia/Dhaka. */
  date: string;
  isToday: boolean;
}

const BN_DAYS = ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র'];
const dhakaDate = (d: Date): string => d.toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });

/** Saturday-first week containing `now`, matching the activity log's date keys. */
export const weekDays = (now: Date = new Date()): WeekDay[] => {
  const todayStr = dhakaDate(now);
  const currentDay = now.getDay();
  const diff = currentDay === 6 ? 0 : -(currentDay + 1);
  const start = new Date(now);
  start.setDate(now.getDate() + diff);
  return BN_DAYS.map((name, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const date = dhakaDate(d);
    return { name, date, isToday: date === todayStr };
  });
};

/* ── keyboard shortcuts ────────────────────────────────────────────────── */

export type ShortcutAction = { type: 'option'; index: number } | { type: 'prev' } | { type: 'next' } | { type: 'flag' } | { type: 'palette' };

/** Maps a key press to an exam action (null when the key is not a shortcut). */
export const shortcutFor = (key: string, optionCount: number): ShortcutAction | null => {
  if (/^[1-9]$/.test(key)) {
    const index = Number(key) - 1;
    return index < optionCount ? { type: 'option', index } : null;
  }
  const bangla = '১২৩৪৫৬৭৮৯'.indexOf(key);
  if (bangla >= 0) return bangla < optionCount ? { type: 'option', index: bangla } : null;
  if (key === 'ArrowLeft') return { type: 'prev' };
  if (key === 'ArrowRight') return { type: 'next' };
  if (key === 'f' || key === 'F') return { type: 'flag' };
  if (key === 'g' || key === 'G') return { type: 'palette' };
  return null;
};
