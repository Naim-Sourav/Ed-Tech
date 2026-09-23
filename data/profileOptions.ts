/**
 * Single source of truth for the student-profile vocabulary used by the
 * sign-up → profile-setup flow and the profile editor.
 *
 * Stored values stay English (they are what the backend / leaderboard /
 * profile page already persist and display); labels are Bangla for the UI.
 */

export type StudyLevel = 'SSC' | 'HSC' | 'Admission';

export interface OptionMeta<T extends string = string> {
  id: T;
  label: string;
  /** one-line helper shown under the label */
  hint?: string;
}

export const LEVELS: OptionMeta<StudyLevel>[] = [
  { id: 'SSC', label: 'SSC পরীক্ষার্থী', hint: 'ক্লাস ৯–১০' },
  { id: 'HSC', label: 'HSC পরীক্ষার্থী', hint: 'ক্লাস ১১–১২' },
  { id: 'Admission', label: 'ভর্তি পরীক্ষার্থী', hint: 'HSC শেষ, এখন অ্যাডমিশন' },
];

export const DEPARTMENTS: OptionMeta[] = [
  { id: 'Science', label: 'বিজ্ঞান' },
  { id: 'Humanities', label: 'মানবিক' },
  { id: 'Business Studies', label: 'ব্যবসায় শিক্ষা' },
];

export const TARGETS: OptionMeta[] = [
  { id: 'Medical', label: 'মেডিকেল', hint: 'MBBS · BDS' },
  { id: 'Engineering', label: 'ইঞ্জিনিয়ারিং', hint: 'বুয়েট · কুয়েট · রুয়েট · চুয়েট' },
  { id: 'Varsity', label: 'বিশ্ববিদ্যালয়', hint: 'ঢাবি · জাবি · রাবি · চবি · GST' },
  { id: 'Agriculture', label: 'কৃষি', hint: 'কৃষি গুচ্ছ · শেকৃবি · বাকৃবি' },
];

export const STUDY_GOALS: OptionMeta[] = [
  { id: '১-২ ঘণ্টা', label: '১–২ ঘণ্টা', hint: 'হালকা, প্রতিদিন' },
  { id: '২-৪ ঘণ্টা', label: '২–৪ ঘণ্টা', hint: 'নিয়মিত রুটিন' },
  { id: '৪-৬ ঘণ্টা', label: '৪–৬ ঘণ্টা', hint: 'সিরিয়াস প্রস্তুতি' },
  { id: '৬+ ঘণ্টা', label: '৬+ ঘণ্টা', hint: 'ফুল-টাইম মোড' },
];

/** Label lookup that falls back to the raw id (older free-text data). */
export const labelOf = (options: OptionMeta[], id?: string | null): string =>
  options.find((o) => o.id === id)?.label || id || '';

/**
 * Batch choices for a level, relative to `now`.
 *
 * Bangladesh calendar: SSC exams run roughly Feb–Apr, HSC roughly Jun–Aug.
 * Once a cohort has sat its exam it drops off and the next cohort appears, so
 * the list never offers a batch that has already finished.
 *
 *  - SSC / HSC   → the three cohorts currently in school / college
 *  - Admission   → this year's HSC batch and last year's (second-timers)
 */
export const batchOptions = (level: StudyLevel, now: Date = new Date()): string[] => {
  const y = now.getFullYear();
  const m = now.getMonth() + 1; // 1–12
  if (level === 'Admission') return [`HSC ${y}`, `HSC ${y - 1}`];
  const examDone = level === 'SSC' ? m > 4 : m > 8;
  const first = examDone ? y + 1 : y;
  return [0, 1, 2].map((i) => `${level} ${first + i}`);
};

/**
 * Split a stored batch string ("HSC 2027", "SSC 2028", legacy "2024") into
 * level + year so an existing profile can pre-fill the wizard.
 */
export const parseBatch = (batch?: string | null): { level: StudyLevel | ''; batch: string } => {
  if (!batch) return { level: '', batch: '' };
  const trimmed = batch.trim();
  if (/^SSC\s+\d{4}$/i.test(trimmed)) return { level: 'SSC', batch: trimmed.toUpperCase() };
  if (/^HSC\s+\d{4}$/i.test(trimmed)) return { level: 'HSC', batch: trimmed.toUpperCase() };
  if (/^\d{4}$/.test(trimmed)) return { level: 'HSC', batch: `HSC ${trimmed}` };
  return { level: 'HSC', batch: trimmed };
};
