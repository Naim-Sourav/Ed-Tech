import type { QuizQuestion } from '../../types';
import type { ExamSettings } from './presets';
import { sanitizeSelection, type Selection } from './selection';
import { sanitizeSettings } from './presets';

/*
 * Turning a pool of fetched questions into an exam the ExamPage can open.
 * The localStorage contract (`exam_config_<examId>`) is shared with
 * components/ExamPage.tsx — keep the shape stable.
 */

export type ExamMode = 'ALL_AT_ONCE' | 'SINGLE_PAGE' | 'RAPID_FIRE';

export interface ExamLaunchConfig {
  questions: QuizQuestion[];
  timeLimit: number;
  negativeMarking: number;
  mode: ExamMode;
  title: string;
  isPracticeMode: boolean;
  shuffle: true;
}

const shuffle = <T>(arr: T[], rand: () => number): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * De-duplicates the pool and draws `count` questions while keeping questions
 * that share a stimulus (passage / image) together, so an exam never shows
 * half of a comprehension set.
 */
export const pickQuestions = (pool: QuizQuestion[], count: number, rand: () => number = Math.random): QuizQuestion[] => {
  const seen = new Set<string>();
  const unique = pool.filter((q) => {
    const key = q.id || q._id || q.question;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const grouped = new Map<string, QuizQuestion[]>();
  const singles: QuizQuestion[] = [];
  unique.forEach((q) => {
    const stimulus = q.contextText || q.contextImage || null;
    if (stimulus) {
      const list = grouped.get(stimulus) ?? [];
      list.push(q);
      grouped.set(stimulus, list);
    } else singles.push(q);
  });

  const groups = shuffle(Array.from(grouped.values()), rand);
  const loose = shuffle(singles, rand);
  const picked: QuizQuestion[] = [];

  // whole stimulus sets first, then loose questions, then (last resort) partial sets
  groups.forEach((g) => {
    if (picked.length + g.length <= count) picked.push(...g);
  });
  loose.forEach((q) => {
    if (picked.length < count) picked.push(q);
  });
  if (picked.length < count) {
    groups.forEach((g) => {
      if (picked.length >= count) return;
      if (g.some((q) => picked.includes(q))) return;
      picked.push(...g.slice(0, count - picked.length));
    });
  }
  return picked;
};

export const makeExamId = (): string => `exam_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

/** Persists the exam config where ExamPage expects it and returns the new exam id. */
export const saveExamConfig = (config: ExamLaunchConfig): string => {
  const examId = makeExamId();
  localStorage.setItem(`exam_config_${examId}`, JSON.stringify(config));
  return examId;
};

/* ── Remembering the student's last mock ─────────────────────────────── */

export interface LastSetup {
  selection: Selection;
  settings: ExamSettings;
  title: string;
  at: number;
}

export const LAST_SETUP_KEY = 'pk_quiz_last_setup_v1';

export const rememberLastSetup = (setup: Omit<LastSetup, 'at'>): void => {
  try {
    localStorage.setItem(LAST_SETUP_KEY, JSON.stringify({ ...setup, at: Date.now() }));
  } catch {
    /* storage full / disabled — not worth surfacing */
  }
};

export const readLastSetup = (): LastSetup | null => {
  try {
    const raw = localStorage.getItem(LAST_SETUP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LastSetup>;
    const selection = sanitizeSelection(parsed.selection);
    if (Object.keys(selection).length === 0) return null;
    return {
      selection,
      settings: sanitizeSettings(parsed.settings),
      title: typeof parsed.title === 'string' ? parsed.title : '',
      at: typeof parsed.at === 'number' ? parsed.at : 0,
    };
  } catch {
    return null;
  }
};

/* ── In-progress draft (survives a refresh mid-flow) ─────────────────── */

export const DRAFT_KEY = 'pk_quiz_builder_draft_v1';

export const readDraft = (): { selection: Selection; settings: ExamSettings | null } => {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return { selection: {}, settings: null };
    const parsed = JSON.parse(raw) as { selection?: unknown; settings?: unknown };
    return {
      selection: sanitizeSelection(parsed.selection),
      settings: parsed.settings ? sanitizeSettings(parsed.settings) : null,
    };
  } catch {
    return { selection: {}, settings: null };
  }
};

export const writeDraft = (selection: Selection, settings: ExamSettings): void => {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ selection, settings }));
  } catch {
    /* ignore */
  }
};

export const clearDraft = (): void => {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
};
