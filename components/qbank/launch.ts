import type { QuizQuestion } from '../../types';
import { readStore, recordExamAttempt, writeStore, type SessionSource } from './records';

/*
 * Turning a set of bank questions into a timed exam (handled by ExamPage) and
 * folding the finished exam back into the bank's records.
 */

export interface ExamLaunchConfig {
  title: string;
  questions: QuizQuestion[];
  /** Minutes; 0 = untimed. */
  timeLimit: number;
  negativeMarking: number;
  mode: 'ALL_AT_ONCE';
  type: 'QBANK_EXAM';
  isPracticeMode: false;
  shuffle: boolean;
  /** Where in the bank the exam was launched from (feeds the bank's records). */
  qbankSource: SessionSource;
  examRef?: string;
  subject?: string;
  chapter?: string;
}

const shuffle = <T>(list: T[], rand: () => number): T[] => {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.max(0, Math.floor(rand() * (i + 1))));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

/**
 * Picks `count` questions. Stimulus groups (shared contextText/contextImage)
 * are kept together so a passage never loses its questions. With `keepOrder`
 * the paper's original order is preserved (full-paper exams).
 */
export const pickExamQuestions = (questions: QuizQuestion[], count: number, keepOrder: boolean, rand: () => number = Math.random): QuizQuestion[] => {
  if (count >= questions.length) return keepOrder ? [...questions] : shuffle(questions, rand);
  if (keepOrder) return questions.slice(0, count);
  const groups: QuizQuestion[][] = [];
  const byStimulus = new Map<string, QuizQuestion[]>();
  questions.forEach((q) => {
    const key = q.contextText || q.contextImage || '';
    if (!key) {
      groups.push([q]);
      return;
    }
    const list = byStimulus.get(key);
    if (list) list.push(q);
    else {
      const fresh = [q];
      byStimulus.set(key, fresh);
      groups.push(fresh);
    }
  });
  const picked: QuizQuestion[] = [];
  shuffle(groups, rand).forEach((group) => {
    if (picked.length + group.length <= count) picked.push(...group);
  });
  if (picked.length < count) {
    shuffle(groups, rand).forEach((group) => {
      if (picked.length >= count) return;
      if (group.some((q) => picked.includes(q))) return;
      picked.push(...group.slice(0, count - picked.length));
    });
  }
  return picked;
};

export interface ExamSetup {
  count: number;
  minutes: number;
  negative: number;
}

export const buildExamConfig = (
  opts: { title: string; source: SessionSource; examRef?: string; subject?: string; chapter?: string; keepOrder: boolean },
  questions: QuizQuestion[],
  setup: ExamSetup,
  rand: () => number = Math.random,
): ExamLaunchConfig => ({
  title: opts.title,
  questions: pickExamQuestions(questions, setup.count, opts.keepOrder, rand),
  timeLimit: Math.max(0, Math.round(setup.minutes)),
  negativeMarking: setup.negative,
  mode: 'ALL_AT_ONCE',
  type: 'QBANK_EXAM',
  isPracticeMode: false,
  shuffle: false,
  qbankSource: opts.source,
  examRef: opts.examRef,
  subject: opts.subject,
  chapter: opts.chapter,
});

export const newExamId = (now: number = Date.now()): string => `qbank_exam_${now}`;

export const storeExamConfig = (examId: string, config: ExamLaunchConfig): void => {
  localStorage.setItem(`exam_config_${examId}`, JSON.stringify(config));
};

/** Count presets offered in the setup sheet, capped by what is available. */
export const countPresets = (available: number): number[] => {
  const presets = [10, 20, 30, 50, 100].filter((n) => n < available);
  return [...presets, available].filter((n, i, arr) => n > 0 && arr.indexOf(n) === i);
};

/* ── ExamPage bridge ──────────────────────────────────────────────────── */

const storage = (): Storage | null => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
};

/** Called by ExamPage after a QBANK_EXAM is submitted so the bank's marks, sources and sessions include it. */
export const recordQbankExam = (
  uid: string,
  config: { type?: string; qbankSource?: SessionSource; title?: string; examRef?: string; subject?: string } | null | undefined,
  questions: QuizQuestion[],
  userAnswers: (number | null)[],
  durationSec: number = 0,
): boolean => {
  if (!uid || !config || !(config.type || '').startsWith('QBANK')) return false;
  const source: SessionSource = config.qbankSource ?? {
    kind: 'exam',
    id: config.examRef || config.title || 'exam',
    title: config.title || 'প্রশ্নব্যাংক পরীক্ষা',
    subject: config.subject,
  };
  const s = storage();
  const store = readStore(uid, s);
  const next = recordExamAttempt(store, source, questions, userAnswers, Date.now(), durationSec);
  if (next === store) return false;
  writeStore(uid, s, next);
  return true;
};
