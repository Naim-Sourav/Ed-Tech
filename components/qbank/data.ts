import type { QuizQuestion } from '../../types';
import { logger } from '../../utils/logger';
import { fetchQuestionBankExamRefsAPI, fetchQuestionsByExamRefAPI, fetchQuestionsFromBankAPI, fetchSyllabusStatsAPI } from '../../services/api';
import { BUILTIN_PAPERS, buildPapers, normalizeRefList, type Paper } from './catalog';

/*
 * Data access for the question bank with small session caches, so moving
 * between the home, an institution and a paper does not refetch everything.
 */

const REFS_KEY = 'pk_qbank_refs_v1';
const REFS_TTL = 30 * 60_000;
const PAPER_KEY = 'pk_qbank_paper_v1:';
const PAPER_CACHE_LIMIT = 6;

const session = (): Storage | null => {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  } catch {
    return null;
  }
};

const readJson = <T>(key: string): T | null => {
  try {
    const raw = session()?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const writeJson = (key: string, value: unknown): void => {
  try {
    session()?.setItem(key, JSON.stringify(value));
  } catch {
    /* quota — fine */
  }
};

/* ── papers (examRefs) ────────────────────────────────────────────────── */

export async function loadPapers(force = false): Promise<Paper[]> {
  const cached = force ? null : readJson<{ at: number; refs: string[] }>(REFS_KEY);
  if (cached && Date.now() - cached.at < REFS_TTL) return buildPapers(cached.refs);
  let refs: string[] = [];
  try {
    refs = normalizeRefList(await fetchQuestionBankExamRefsAPI('ADMISSION'));
    if (refs.length === 0) refs = normalizeRefList(await fetchQuestionBankExamRefsAPI());
  } catch (e) {
    logger.info('qbank: exam refs unavailable', e);
  }
  writeJson(REFS_KEY, { at: Date.now(), refs });
  return buildPapers(refs);
}

/* ── one paper's questions ────────────────────────────────────────────── */

const memory = new Map<string, QuizQuestion[]>();

const normalizeQuestions = (data: unknown): QuizQuestion[] => {
  const list = Array.isArray(data) ? data : data && typeof data === 'object' ? (data as { questions?: unknown }).questions : null;
  if (!Array.isArray(list)) return [];
  return (list as QuizQuestion[])
    .filter((q) => q && typeof q.question === 'string' && Array.isArray(q.options))
    .map((q, i) => ({ ...q, orderIndex: typeof q.orderIndex === 'number' ? q.orderIndex : i + 1 }))
    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
};

async function loadBuiltin(ref: string): Promise<QuizQuestion[]> {
  if (ref === 'gst_a_23_24') {
    const mod = await import('../../data/gst_a_23_24_questions.json');
    return normalizeQuestions(mod.default).map((q) => ({ ...q, examRef: "GST-A '23-24" }));
  }
  if (ref === 'builtin:medical_24_25') {
    const mod = await import('../../data/medical_24_25_questions.json');
    return normalizeQuestions(mod.default).map((q) => ({ ...q, examRef: "Medical '24-25" }));
  }
  return [];
}

export async function loadPaperQuestions(ref: string): Promise<QuizQuestion[]> {
  const hit = memory.get(ref);
  if (hit) return hit;
  const cached = readJson<QuizQuestion[]>(PAPER_KEY + ref);
  if (cached && cached.length) {
    memory.set(ref, cached);
    return cached;
  }
  const questions = BUILTIN_PAPERS.some((b) => b.ref === ref) ? await loadBuiltin(ref) : normalizeQuestions(await fetchQuestionsByExamRefAPI(ref));
  memory.set(ref, questions);
  if (questions.length) {
    writeJson(PAPER_KEY + ref, questions);
    trimPaperCache(ref);
  }
  return questions;
}

const RECENT_KEY = 'pk_qbank_paper_recent_v1';
const trimPaperCache = (ref: string): void => {
  const store = session();
  if (!store) return;
  const recent = (readJson<string[]>(RECENT_KEY) ?? []).filter((r) => r !== ref);
  recent.unshift(ref);
  recent.slice(PAPER_CACHE_LIMIT).forEach((old) => store.removeItem(PAPER_KEY + old));
  writeJson(RECENT_KEY, recent.slice(0, PAPER_CACHE_LIMIT));
};

/* ── the bank (subject / chapter / search) ────────────────────────────── */

export interface BankQuery {
  level?: string | null;
  subject?: string | null;
  chapter?: string | null;
  search?: string | null;
  board?: string | null;
  college?: string | null;
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
    undefined,
  )) as { questions?: QuizQuestion[]; total?: number } | QuizQuestion[];
  const questions = normalizeQuestions(res).map((x, i) => ({ ...x, orderIndex: (q.page - 1) * q.limit + i + 1 }));
  const total = Array.isArray(res) ? res.length : Number(res?.total) || 0;
  return { questions, total, hasMore: questions.length >= q.limit };
}

/* ── syllabus stats (question counts per paper / chapter) ─────────────── */

export type SyllabusStats = Record<string, { total?: number; chapters?: Record<string, { total?: number }> }>;

const statsMemory = new Map<string, SyllabusStats>();

/** Drops the in-memory caches (session storage is left alone). Used by tests. */
export const resetDataCaches = (): void => {
  memory.clear();
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
