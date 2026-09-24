import { toBanglaDigits } from '../../utils/phone';

/*
 * Exam settings for the mock-test builder + the one-tap presets shown on the
 * settings step. Kept free of React so the matching logic can be unit tested.
 */

export type ExamView = 'ALL_AT_ONCE' | 'SINGLE_PAGE';

export interface ExamSettings {
  /** Number of questions to draw (5–50). */
  count: number;
  /** Minutes; 0 = no limit. */
  timeLimit: number;
  /** Marks deducted per wrong answer. */
  negativeMarking: number;
  /** Practice mode reveals the answer + explanation right after each question. */
  practice: boolean;
  view: ExamView;
}

export const MIN_COUNT = 5;
export const MAX_COUNT = 50;
export const COUNT_STEP = 5;

export const COUNT_OPTIONS = [10, 20, 25, 30, 40, 50];
export const TIME_OPTIONS = [0, 10, 15, 20, 30, 45, 60];
export const NEGATIVE_OPTIONS = [0, 0.25, 0.5, 1];

export const DEFAULT_SETTINGS: ExamSettings = {
  count: 20,
  timeLimit: 20,
  negativeMarking: 0.25,
  practice: false,
  view: 'ALL_AT_ONCE',
};

export interface Preset {
  id: string;
  title: string;
  hint: string;
  settings: Omit<ExamSettings, 'view'>;
}

export const PRESETS: Preset[] = [
  {
    id: 'admission',
    title: 'ভর্তি স্ট্যান্ডার্ড',
    hint: 'প্রশ্নপ্রতি ১ মিনিট, নেগেটিভ ০.২৫',
    settings: { count: 20, timeLimit: 20, negativeMarking: 0.25, practice: false },
  },
  {
    id: 'board',
    title: 'বোর্ড স্ট্যান্ডার্ড',
    hint: 'নেগেটিভ নেই, সময় ধরে',
    settings: { count: 25, timeLimit: 25, negativeMarking: 0, practice: false },
  },
  {
    id: 'quick',
    title: 'ঝটপট রিভিশন',
    hint: 'সাথে সাথে ব্যাখ্যা, সময়ের চাপ নেই',
    settings: { count: 10, timeLimit: 0, negativeMarking: 0, practice: true },
  },
  {
    id: 'full',
    title: 'ফুল মক',
    hint: '৫০ প্রশ্ন · ৫০ মিনিট · নেগেটিভ ০.২৫',
    settings: { count: 50, timeLimit: 50, negativeMarking: 0.25, practice: false },
  },
];

/** Which preset (if any) the current settings correspond to. */
export const matchPreset = (s: ExamSettings): string | null => {
  const hit = PRESETS.find(
    (p) =>
      p.settings.count === s.count &&
      p.settings.timeLimit === s.timeLimit &&
      p.settings.negativeMarking === s.negativeMarking &&
      p.settings.practice === s.practice,
  );
  return hit?.id ?? null;
};

export const applyPreset = (s: ExamSettings, preset: Preset): ExamSettings => ({ ...s, ...preset.settings });

export const clampCount = (n: number): number => {
  if (!Number.isFinite(n)) return DEFAULT_SETTINGS.count;
  const stepped = Math.round(n / COUNT_STEP) * COUNT_STEP;
  return Math.min(MAX_COUNT, Math.max(MIN_COUNT, stepped));
};

/** Sensible defaults per student profile: admission candidates get the admission preset, everyone else the board one. */
export const defaultSettingsFor = (profile?: { target?: string | null } | null): ExamSettings => {
  const preset = PRESETS.find((p) => p.id === (profile?.target ? 'admission' : 'board'));
  return preset ? { ...DEFAULT_SETTINGS, ...preset.settings } : DEFAULT_SETTINGS;
};

export const formatMinutes = (m: number): string => {
  if (m <= 0) return 'সময় নেই';
  if (m % 60 === 0) return `${toBanglaDigits(m / 60)} ঘণ্টা`;
  return `${toBanglaDigits(m)} মিনিট`;
};

export const formatNegative = (n: number): string => (n <= 0 ? 'নেগেটিভ নেই' : `নেগেটিভ ${toBanglaDigits(String(n))}`);

/** "২০ প্রশ্ন · ২০ মিনিট · নেগেটিভ ০.২৫" */
export const describeSettings = (s: ExamSettings): string => {
  const parts = [`${toBanglaDigits(s.count)} প্রশ্ন`, formatMinutes(s.timeLimit), formatNegative(s.negativeMarking)];
  if (s.practice) parts.push('প্র্যাকটিস মোড');
  return parts.join(' · ');
};

/** Validates settings loaded from storage. */
export const sanitizeSettings = (raw: unknown, fallback: ExamSettings = DEFAULT_SETTINGS): ExamSettings => {
  if (!raw || typeof raw !== 'object') return fallback;
  const r = raw as Partial<Record<keyof ExamSettings, unknown>>;
  const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : d);
  return {
    count: clampCount(num(r.count, fallback.count)),
    timeLimit: Math.min(180, num(r.timeLimit, fallback.timeLimit)),
    negativeMarking: NEGATIVE_OPTIONS.includes(num(r.negativeMarking, -1)) ? (r.negativeMarking as number) : fallback.negativeMarking,
    practice: typeof r.practice === 'boolean' ? r.practice : fallback.practice,
    view: r.view === 'SINGLE_PAGE' || r.view === 'ALL_AT_ONCE' ? r.view : fallback.view,
  };
};
