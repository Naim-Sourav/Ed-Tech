import type { QuizQuestion } from '../../types';
import { fetchQuestionsFromBankAPI, fetchSyllabusStatsAPI } from '../../services/api';

/*
 * Data access for the question bank (backend/index.js: /admin/questions and
 * /quiz/syllabus-stats), with a small in-memory cache for the per-level
 * question counts so moving between screens does not refetch them.
 */

const normalizeQuestions = (data: unknown): QuizQuestion[] => {
  const list = Array.isArray(data) ? data : data && typeof data === 'object' ? (data as { questions?: unknown }).questions : null;
  if (!Array.isArray(list)) return [];
  return (list as QuizQuestion[]).filter((q) => q && typeof q.question === 'string' && Array.isArray(q.options));
};

/* ── the bank (subject / chapter / search) ────────────────────────────── */

export interface BankQuery {
  level?: string | null;
  subject?: string | null;
  chapter?: string | null;
  search?: string | null;
  board?: string | null;
  college?: string | null;
  admissionCategory?: string | null;
  page: number;
  limit: number;
  randomise?: boolean;
}

export interface BankPage {
  questions: QuizQuestion[];
  total: number;
  hasMore: boolean;
}

export async function loadBankPage(q: BankQuery): Promise<BankPage> {
  const res = (await fetchQuestionsFromBankAPI(
    q.page,
    q.limit,
    q.subject ?? undefined,
    q.chapter ?? undefined,
    undefined,
    undefined,
    q.search ?? undefined,
    q.level ?? undefined,
    q.board ?? undefined,
    q.college ?? undefined,
    q.randomise ?? false,
    q.admissionCategory ?? undefined,
  )) as { questions?: QuizQuestion[]; total?: number } | QuizQuestion[];
  const questions = normalizeQuestions(res).map((x, i) => ({ ...x, orderIndex: (q.page - 1) * q.limit + i + 1 }));
  const total = Array.isArray(res) ? res.length : Number(res?.total) || 0;
  return { questions, total, hasMore: questions.length >= q.limit };
}

/* ── syllabus stats (question counts per paper / chapter) ─────────────── */

export type SyllabusStats = Record<string, { total?: number; chapters?: Record<string, { total?: number }> }>;

const statsMemory = new Map<string, SyllabusStats>();

/** Drops the in-memory cache. Used by tests. */
export const resetDataCaches = (): void => {
  statsMemory.clear();
};

export async function loadSyllabusStats(level?: string | null): Promise<SyllabusStats> {
  const key = level || 'ALL';
  const hit = statsMemory.get(key);
  if (hit) return hit;
  const stats = ((await fetchSyllabusStatsAPI(level || undefined)) || {}) as SyllabusStats;
  statsMemory.set(key, stats);
  return stats;
}
