import type { QuizQuestion } from '../../types';
import { toBengaliNumber } from '../../utils/numberUtils';

/*
 * Progress records for the question bank.
 *
 * Every answer a student gives in the bank is remembered per question
 * (right/wrong, when, how many tries) and every sitting is kept as a session.
 * The store lives in localStorage per user so it works offline and instantly;
 * sessions that are long enough are also pushed to the backend + Firestore
 * (see persist.ts) so points, streak, the mistake book and exam history pick
 * them up — and the marks can be rebuilt on another device from those docs.
 *
 * This module is pure apart from the two storage helpers at the bottom.
 */

export const bn = (value: number | string | null | undefined): string => toBengaliNumber(value);

export interface QuestionMark {
  /** 1 when the most recent attempt was correct. */
  r: 0 | 1;
  /** Timestamp of the most recent attempt. */
  t: number;
  /** Number of attempts. */
  n: number;
  /** Chosen option index of the most recent attempt. */
  a: number;
}

export type SourceKind = 'paper' | 'chapter' | 'subject' | 'search' | 'exam' | 'mixed';

export interface SessionSource {
  kind: SourceKind;
  /** Stable id for the source: the examRef, "paper|chapter" or the search text. */
  id: string;
  title: string;
  subject?: string;
}

export interface AnsweredItem {
  /** Question key (Mongo id, or a content hash for bundled papers). */
  k: string;
  /** Chosen option index. */
  a: number;
  /** Correct? */
  c: 0 | 1;
  /** Subject of the question (for breakdowns). */
  s?: string;
  /** Chapter, kept so a sitting restored from storage can still be reported. */
  ch?: string;
  /** Correct option index (same reason). */
  ci?: number;
}

export interface SessionRecord {
  id: string;
  startedAt: number;
  endedAt: number;
  source: SessionSource;
  items: AnsweredItem[];
  /** True once it has been mirrored to the backend/Firestore (or was too small to bother). */
  synced?: boolean;
}

export interface SourceProgress {
  title: string;
  kind: SourceKind;
  subject?: string;
  /** Distinct questions answered from this source. */
  answered: number;
  /** Of those, how many are currently marked correct. */
  correct: number;
  /** Known size of the source (paper length / chapter count), when we have it. */
  total?: number;
  lastAt: number;
}

export interface ProgressStore {
  v: 1;
  marks: Record<string, QuestionMark>;
  sessions: SessionRecord[];
  sources: Record<string, SourceProgress>;
  /** A sitting that is still open (page not left yet). */
  pending: SessionRecord | null;
}

export const emptyStore = (): ProgressStore => ({ v: 1, marks: {}, sessions: [], sources: {}, pending: null });

const MAX_SESSIONS = 200;
const MAX_MARKS = 20000;

/* ── question keys ────────────────────────────────────────────────────── */

const hash = (text: string): string => {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
};

/** Mongo id when present, otherwise a stable content hash (bundled papers have no ids). */
export const questionKey = (q: Pick<QuizQuestion, '_id' | 'id' | 'question' | 'options'>): string =>
  q._id || q.id || `h:${hash(`${q.question}|${(q.options || []).join('|')}`)}`;

export const sourceId = (source: Pick<SessionSource, 'kind' | 'id'>): string => `${source.kind}:${source.id}`;

/* ── recording ────────────────────────────────────────────────────────── */

const newSessionId = (now: number): string => `qb_${now.toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

/**
 * Records one answer: updates the per-question mark and appends to the open
 * session (starting one — or switching sources — as needed). Returns a new store.
 */
export const recordAnswer = (store: ProgressStore, source: SessionSource, q: QuizQuestion, chosen: number, now: number = Date.now()): ProgressStore => {
  const key = questionKey(q);
  const correct: 0 | 1 = chosen === q.correctAnswerIndex ? 1 : 0;
  const prev = store.marks[key];
  const marks = { ...store.marks, [key]: { r: correct, t: now, n: (prev?.n ?? 0) + 1, a: chosen } };

  let pending = store.pending;
  let sessions = store.sessions;
  if (pending && sourceId(pending.source) !== sourceId(source)) {
    sessions = appendSession(sessions, pending);
    pending = null;
  }
  const base: SessionRecord = pending ?? { id: newSessionId(now), startedAt: now, endedAt: now, source, items: [] };
  const item: AnsweredItem = { k: key, a: chosen, c: correct, s: q.subject, ch: q.chapter, ci: q.correctAnswerIndex };
  const items = base.items.some((i) => i.k === key) ? base.items.map((i) => (i.k === key ? item : i)) : [...base.items, item];
  const next: ProgressStore = {
    ...store,
    marks,
    sessions,
    pending: { ...base, endedAt: now, items },
    sources: bumpSource(store.sources, source, key, correct, prev?.r, now),
  };
  return trim(next);
};

const bumpSource = (
  sources: Record<string, SourceProgress>,
  source: SessionSource,
  _key: string,
  correct: 0 | 1,
  previous: 0 | 1 | undefined,
  now: number,
): Record<string, SourceProgress> => {
  const id = sourceId(source);
  const cur = sources[id] ?? { title: source.title, kind: source.kind, subject: source.subject, answered: 0, correct: 0, lastAt: 0 };
  const firstTime = previous === undefined;
  const answered = cur.answered + (firstTime ? 1 : 0);
  const correctCount = Math.max(0, cur.correct + (correct ? 1 : 0) - (previous === 1 ? 1 : 0));
  return {
    ...sources,
    [id]: { ...cur, title: source.title, subject: source.subject ?? cur.subject, answered, correct: Math.min(answered, correctCount), lastAt: now },
  };
};

/** Tell the store how big a source is (so progress can show "১২/১০০"). */
export const setSourceTotal = (store: ProgressStore, source: SessionSource, total: number): ProgressStore => {
  const id = sourceId(source);
  const cur = store.sources[id];
  if (cur && cur.total === total) return store;
  const base = cur ?? { title: source.title, kind: source.kind, subject: source.subject, answered: 0, correct: 0, lastAt: 0 };
  return { ...store, sources: { ...store.sources, [id]: { ...base, total } } };
};

const appendSession = (sessions: SessionRecord[], s: SessionRecord): SessionRecord[] =>
  s.items.length === 0 ? sessions : [s, ...sessions.filter((x) => x.id !== s.id)].slice(0, MAX_SESSIONS);

/** Closes the open sitting (if any) and returns it so the caller can persist it remotely. */
export const closeSession = (store: ProgressStore, now: number = Date.now()): { store: ProgressStore; session: SessionRecord | null } => {
  if (!store.pending) return { store, session: null };
  const session = { ...store.pending, endedAt: Math.max(store.pending.endedAt, Math.min(now, store.pending.endedAt + 5 * 60_000)) };
  return { store: { ...store, pending: null, sessions: appendSession(store.sessions, session) }, session: session.items.length ? session : null };
};

export const markSynced = (store: ProgressStore, sessionId: string): ProgressStore => ({
  ...store,
  sessions: store.sessions.map((s) => (s.id === sessionId ? { ...s, synced: true } : s)),
});

const trim = (store: ProgressStore): ProgressStore => {
  const keys = Object.keys(store.marks);
  if (keys.length <= MAX_MARKS) return store;
  const keep = keys
    .map((k) => [k, store.marks[k].t] as const)
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_MARKS);
  const marks: Record<string, QuestionMark> = {};
  keep.forEach(([k]) => (marks[k] = store.marks[k]));
  return { ...store, marks };
};

/* ── reading ──────────────────────────────────────────────────────────── */

export type MarkState = 'unseen' | 'correct' | 'wrong';

export const markState = (store: ProgressStore, q: QuizQuestion): MarkState => {
  const m = store.marks[questionKey(q)];
  return m ? (m.r ? 'correct' : 'wrong') : 'unseen';
};

export type MarkFilter = 'all' | 'unseen' | 'wrong' | 'correct';

export const filterByMark = (store: ProgressStore, questions: QuizQuestion[], filter: MarkFilter): QuizQuestion[] =>
  filter === 'all' ? questions : questions.filter((q) => markState(store, q) === filter);

export const countMarks = (store: ProgressStore, questions: QuizQuestion[]): Record<MarkState, number> => {
  const out: Record<MarkState, number> = { unseen: 0, correct: 0, wrong: 0 };
  questions.forEach((q) => (out[markState(store, q)] += 1));
  return out;
};

export interface SessionSummary {
  answered: number;
  correct: number;
  wrong: number;
  accuracy: number;
  seconds: number;
  bySubject: { subject: string; answered: number; correct: number }[];
}

export const summarizeSession = (s: Pick<SessionRecord, 'items' | 'startedAt' | 'endedAt'>): SessionSummary => {
  const answered = s.items.length;
  const correct = s.items.filter((i) => i.c === 1).length;
  const map = new Map<string, { answered: number; correct: number }>();
  s.items.forEach((i) => {
    const key = i.s || 'অন্যান্য';
    const cur = map.get(key) ?? { answered: 0, correct: 0 };
    map.set(key, { answered: cur.answered + 1, correct: cur.correct + i.c });
  });
  return {
    answered,
    correct,
    wrong: answered - correct,
    accuracy: answered ? Math.round((correct / answered) * 100) : 0,
    seconds: Math.max(0, Math.round((s.endedAt - s.startedAt) / 1000)),
    bySubject: Array.from(map.entries())
      .map(([subject, v]) => ({ subject, ...v }))
      .sort((a, b) => b.answered - a.answered),
  };
};

export const progressOf = (store: ProgressStore, source: Pick<SessionSource, 'kind' | 'id'>): SourceProgress | null => store.sources[sourceId(source)] ?? null;

export interface OverallStats {
  solved: number;
  correct: number;
  accuracy: number;
  sessions: number;
  /** Distinct Dhaka-calendar days with at least one answer in the last 7 days. */
  activeDays7: number;
  answeredThisWeek: number;
}

const dayKey = (ts: number): string => new Date(ts).toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });

export const overallStats = (store: ProgressStore, now: number = Date.now()): OverallStats => {
  const marks = Object.values(store.marks);
  const solved = marks.length;
  const correct = marks.filter((m) => m.r === 1).length;
  const weekAgo = now - 7 * 86_400_000;
  const recent = [...store.sessions, ...(store.pending ? [store.pending] : [])].filter((s) => s.endedAt >= weekAgo);
  const days = new Set(recent.map((s) => dayKey(s.endedAt)));
  return {
    solved,
    correct,
    accuracy: solved ? Math.round((correct / solved) * 100) : 0,
    sessions: store.sessions.length + (store.pending ? 1 : 0),
    activeDays7: days.size,
    answeredThisWeek: recent.reduce((sum, s) => sum + s.items.length, 0),
  };
};

export const recentSessions = (store: ProgressStore, limit = 8): SessionRecord[] =>
  [...(store.pending ? [store.pending] : []), ...store.sessions].sort((a, b) => b.endedAt - a.endedAt).slice(0, limit);

export const recentSources = (store: ProgressStore, limit = 6): (SourceProgress & { id: string })[] =>
  Object.entries(store.sources)
    .map(([id, p]) => ({ id, ...p }))
    .filter((p) => p.answered > 0)
    .sort((a, b) => b.lastAt - a.lastAt)
    .slice(0, limit);

/** Keys of questions the student got wrong most recently — for "ভুলগুলো আবার". */
export const wrongKeys = (store: ProgressStore, questions: QuizQuestion[]): Set<string> =>
  new Set(questions.map(questionKey).filter((k) => store.marks[k]?.r === 0));

/* ── sync thresholds ──────────────────────────────────────────────────── */

/** Sessions shorter than this stay on the device; longer ones become real records (points, streak, mistake book, history). */
export const REMOTE_MIN_ANSWERS = 5;
/** From here on a sitting also counts towards the daily "পরীক্ষা দাও" quest. */
export const QUEST_MIN_ANSWERS = 10;

export const shouldSyncRemotely = (session: Pick<SessionRecord, 'items'>): boolean => session.items.length >= REMOTE_MIN_ANSWERS;

/* ── payloads for the backend / Firestore ─────────────────────────────── */

export interface ResultPayload {
  examId: string;
  subject: string;
  totalQuestions: number;
  correct: number;
  wrong: number;
  skipped: number;
  score: number;
  topicStats: unknown[];
  mistakes: QuizQuestion[];
  userAnswers: (number | null)[];
  questions: QuizQuestion[];
  config: {
    title: string;
    type: 'QBANK_PRACTICE';
    mode: 'PRACTICE';
    timeLimit: number;
    negativeMarking: number;
    qbankSource: SessionSource;
    durationSec: number;
  };
}

/** Shapes a closed session like an exam result so the existing endpoints can absorb it. */
const isMongoKey = (key: string): boolean => /^[a-f0-9]{24}$/i.test(key);

/** Rebuilds a question object for a sitting whose questions are no longer in memory. */
const minimalQuestion = (item: AnsweredItem): QuizQuestion => ({
  _id: isMongoKey(item.k) ? item.k : undefined,
  question: '',
  options: [],
  correctAnswerIndex: item.ci ?? -1,
  explanation: '',
  subject: item.s,
  chapter: item.ch,
});

export const buildResultPayload = (session: SessionRecord, questionsByKey: Map<string, QuizQuestion>): ResultPayload => {
  const items = session.items;
  const questions = items.map((i) => questionsByKey.get(i.k) ?? minimalQuestion(i));
  const userAnswers = items.map((i) => i.a);
  const correct = items.filter((i) => i.c === 1).length;
  const summary = summarizeSession(session);
  const subject = summary.bySubject[0]?.subject || session.source.subject || 'General';
  return {
    examId: `qbank_${session.id}`,
    subject,
    totalQuestions: items.length,
    correct,
    wrong: items.length - correct,
    skipped: 0,
    score: correct,
    topicStats: [],
    mistakes: questions.filter((q, i) => items[i].c === 0 && !!q._id),
    userAnswers,
    questions,
    config: {
      title: session.source.title,
      type: 'QBANK_PRACTICE',
      mode: 'PRACTICE',
      timeLimit: 0,
      negativeMarking: 0,
      qbankSource: session.source,
      durationSec: summary.seconds,
    },
  };
};

/** Trimmed copy for the Firestore `attempts` mirror (what the history page reads). */
export const buildAttemptDoc = (uid: string, payload: ResultPayload, timestamp: number) => ({
  userId: uid,
  examId: payload.examId,
  subject: payload.subject,
  totalQuestions: payload.totalQuestions,
  correct: payload.correct,
  wrong: payload.wrong,
  skipped: 0,
  score: payload.score,
  topicStats: [],
  mistakes: payload.mistakes.map((q) => ({ _id: q._id || q.id || '', subject: q.subject || '', chapter: q.chapter || '' })),
  userAnswers: payload.userAnswers,
  questions: payload.questions.map((q) => ({
    _id: q._id || q.id || '',
    subject: q.subject || '',
    chapter: q.chapter || '',
    correctAnswerIndex: q.correctAnswerIndex ?? 0,
  })),
  config: payload.config,
  timestamp,
});

/* ── rebuilding from remote attempts (other devices) ──────────────────── */

interface AttemptLike {
  examId?: string;
  timestamp?: number;
  userAnswers?: (number | null)[];
  questions?: { _id?: string; id?: string; subject?: string; correctAnswerIndex?: number }[];
  config?: { type?: string; title?: string; qbankSource?: SessionSource; examRef?: string; durationSec?: number };
}

/** Merges question-bank attempts stored in Firestore into the local store without clobbering newer local marks. */
export const mergeFromAttempts = (store: ProgressStore, attempts: AttemptLike[]): ProgressStore => {
  let next = store;
  const known = new Set(store.sessions.map((s) => s.id));
  attempts.forEach((a) => {
    const type = a.config?.type || '';
    if (!type.startsWith('QBANK')) return;
    const questions = Array.isArray(a.questions) ? a.questions : [];
    const answers = Array.isArray(a.userAnswers) ? a.userAnswers : [];
    const at = Number(a.timestamp) || 0;
    const items: AnsweredItem[] = [];
    questions.forEach((q, i) => {
      const chosen = answers[i];
      const key = q._id || q.id;
      if (!key || chosen === null || chosen === undefined) return;
      const correct: 0 | 1 = chosen === q.correctAnswerIndex ? 1 : 0;
      items.push({ k: key, a: chosen, c: correct, s: q.subject });
      const cur = next.marks[key];
      if (!cur || cur.t < at) next = { ...next, marks: { ...next.marks, [key]: { r: correct, t: at, n: (cur?.n ?? 0) + 1, a: chosen } } };
    });
    if (items.length === 0) return;
    const id = a.examId ? a.examId.replace(/^qbank_/, '') : `remote_${at}`;
    if (known.has(id)) return;
    known.add(id);
    const source: SessionSource = a.config?.qbankSource ?? {
      kind: type === 'QBANK_EXAM' ? 'exam' : 'mixed',
      id: a.config?.examRef || a.examId || 'remote',
      title: a.config?.title || 'প্রশ্নব্যাংক',
    };
    const startedAt = at - (a.config?.durationSec ?? 0) * 1000;
    next = { ...next, sessions: appendSession(next.sessions, { id, startedAt, endedAt: at, source, items, synced: true }) };
  });
  return next;
};

/** Called by the exam player after a question-bank exam is submitted. */
export const recordExamAttempt = (
  store: ProgressStore,
  source: SessionSource,
  questions: QuizQuestion[],
  userAnswers: (number | null)[],
  now: number = Date.now(),
  durationSec = 0,
): ProgressStore => {
  const items: AnsweredItem[] = [];
  let marks = store.marks;
  questions.forEach((q, i) => {
    const chosen = userAnswers[i];
    if (chosen === null || chosen === undefined) return;
    const key = questionKey(q);
    const correct: 0 | 1 = chosen === q.correctAnswerIndex ? 1 : 0;
    items.push({ k: key, a: chosen, c: correct, s: q.subject, ch: q.chapter, ci: q.correctAnswerIndex });
    marks = { ...marks, [key]: { r: correct, t: now, n: (marks[key]?.n ?? 0) + 1, a: chosen } };
  });
  if (items.length === 0) return store;
  const session: SessionRecord = { id: newSessionId(now), startedAt: now - durationSec * 1000, endedAt: now, source, items, synced: true };
  let sources = store.sources;
  items.forEach((it) => {
    const prev = store.marks[it.k]?.r;
    sources = bumpSource(sources, source, it.k, it.c, prev, now);
  });
  return trim({ ...store, marks, sources, sessions: appendSession(store.sessions, session) });
};

/* ── formatting ───────────────────────────────────────────────────────── */

export const formatSeconds = (seconds: number): string => {
  if (seconds < 60) return `${bn(seconds)} সেকেন্ড`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return s ? `${bn(m)} মি ${bn(s)} সে` : `${bn(m)} মিনিট`;
  const h = Math.floor(m / 60);
  return `${bn(h)} ঘ ${bn(m % 60)} মি`;
};

export const relativeDay = (ts: number, now: number = Date.now()): string => {
  const today = dayKey(now);
  const day = dayKey(ts);
  if (day === today) return 'আজ';
  if (day === dayKey(now - 86_400_000)) return 'গতকাল';
  const days = Math.round((now - ts) / 86_400_000);
  if (days < 7) return `${bn(days)} দিন আগে`;
  return bn(new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'Asia/Dhaka' }));
};

/* ── storage ──────────────────────────────────────────────────────────── */

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const storeKey = (uid: string): string => `pk_qbank_progress_v1:${uid || 'guest'}`;

export const readStore = (uid: string, storage: StorageLike | null): ProgressStore => {
  if (!storage) return emptyStore();
  try {
    const raw = storage.getItem(storeKey(uid));
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<ProgressStore>;
    if (parsed.v !== 1) return emptyStore();
    return {
      v: 1,
      marks: parsed.marks && typeof parsed.marks === 'object' ? parsed.marks : {},
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      sources: parsed.sources && typeof parsed.sources === 'object' ? parsed.sources : {},
      pending: parsed.pending ?? null,
    };
  } catch {
    return emptyStore();
  }
};

export const writeStore = (uid: string, storage: StorageLike | null, store: ProgressStore): void => {
  if (!storage) return;
  try {
    storage.setItem(storeKey(uid), JSON.stringify(store));
  } catch {
    /* quota — progress simply is not persisted this time */
  }
};
