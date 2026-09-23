import { describe, expect, it } from 'vitest';
import type { QuizQuestion } from '../../types';
import {
  buildAttemptDoc,
  buildResultPayload,
  closeSession,
  countMarks,
  emptyStore,
  filterByMark,
  formatSeconds,
  markState,
  mergeFromAttempts,
  overallStats,
  questionKey,
  readStore,
  recentSessions,
  recentSources,
  recordAnswer,
  recordExamAttempt,
  setSourceTotal,
  shouldSyncRemotely,
  summarizeSession,
  writeStore,
  type SessionSource,
  type StorageLike,
} from './records';

const q = (i: number, extra: Partial<QuizQuestion> = {}): QuizQuestion => ({
  _id: `${i}`.padStart(24, 'a'),
  question: `Question ${i}`,
  options: ['A', 'B', 'C', 'D'],
  correctAnswerIndex: i % 4,
  explanation: '',
  subject: i % 2 ? 'Physics' : 'Chemistry',
  chapter: 'Vector',
  ...extra,
});

const PAPER: SessionSource = { kind: 'paper', id: "DU-A '23-24", title: 'ঢাবি ক ২০২৩-২৪' };
const CHAPTER: SessionSource = { kind: 'chapter', id: 'ADMISSION|Physics 1st Paper|Vector', title: 'পদার্থ · ভেক্টর', subject: 'Physics 1st Paper' };

const memoryStorage = (): StorageLike & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
};

describe('questionKey', () => {
  it('uses the Mongo id when present and a stable content hash otherwise', () => {
    expect(questionKey(q(1))).toBe(q(1)._id);
    const a = questionKey({ question: 'x', options: ['1', '2'] });
    expect(a).toMatch(/^h:/);
    expect(questionKey({ question: 'x', options: ['1', '2'] })).toBe(a);
    expect(questionKey({ question: 'x', options: ['1', '3'] })).not.toBe(a);
  });
});

describe('recordAnswer', () => {
  it('opens a sitting, marks the question and tracks source progress', () => {
    let s = recordAnswer(emptyStore(), PAPER, q(1), 1, 1000);
    expect(s.pending?.items).toEqual([{ k: q(1)._id, a: 1, c: 1, s: 'Physics', ch: 'Vector', ci: 1 }]);
    expect(markState(s, q(1))).toBe('correct');
    s = recordAnswer(s, PAPER, q(2), 0, 2000);
    expect(markState(s, q(2))).toBe('wrong');
    expect(s.pending?.items).toHaveLength(2);
    expect(s.sources["paper:DU-A '23-24"]).toMatchObject({ answered: 2, correct: 1, lastAt: 2000, title: PAPER.title });
  });

  it('replaces the answer when the same question is retried inside a sitting', () => {
    let s = recordAnswer(emptyStore(), PAPER, q(2), 0, 1000);
    s = recordAnswer(s, PAPER, q(2), 2, 2000);
    expect(s.pending?.items).toHaveLength(1);
    expect(s.pending?.items[0]).toMatchObject({ a: 2, c: 1 });
    expect(s.marks[q(2)._id!]).toMatchObject({ r: 1, n: 2, a: 2 });
    expect(s.sources["paper:DU-A '23-24"]).toMatchObject({ answered: 1, correct: 1 });
  });

  it('closes the open sitting when a different source is answered', () => {
    let s = recordAnswer(emptyStore(), PAPER, q(1), 1, 1000);
    s = recordAnswer(s, CHAPTER, q(5), 1, 5000);
    expect(s.sessions).toHaveLength(1);
    expect(s.sessions[0].source).toEqual(PAPER);
    expect(s.pending?.source).toEqual(CHAPTER);
  });
});

describe('closeSession', () => {
  it('moves the pending sitting into history and returns it', () => {
    const open = recordAnswer(emptyStore(), PAPER, q(1), 1, 1000);
    const { store, session } = closeSession(open, 61_000);
    expect(store.pending).toBeNull();
    expect(store.sessions[0].id).toBe(session?.id);
    expect(session?.endedAt).toBe(61_000);
  });

  it('caps the end time when the tab was left idle', () => {
    const open = recordAnswer(emptyStore(), PAPER, q(1), 1, 1000);
    const { session } = closeSession(open, 1000 + 3 * 3600_000);
    expect(session?.endedAt).toBe(1000 + 5 * 60_000);
  });

  it('is a no-op without a sitting', () => {
    const s = emptyStore();
    expect(closeSession(s)).toEqual({ store: s, session: null });
  });
});

describe('filters and summaries', () => {
  const s = [1, 2, 3, 4].reduce((acc, i) => recordAnswer(acc, PAPER, q(i), i % 2 ? i % 4 : 0, i * 1000), emptyStore());
  const list = [1, 2, 3, 4, 5, 6].map((i) => q(i));

  it('filters by mark state', () => {
    expect(filterByMark(s, list, 'unseen').map((x) => x.question)).toEqual(['Question 5', 'Question 6']);
    expect(filterByMark(s, list, 'wrong').map((x) => x.question)).toEqual(['Question 2']);
    expect(filterByMark(s, list, 'correct')).toHaveLength(3);
    expect(countMarks(s, list)).toEqual({ unseen: 2, correct: 3, wrong: 1 });
  });

  it('summarises a sitting with per-subject rows', () => {
    const sum = summarizeSession(s.pending!);
    expect(sum).toMatchObject({ answered: 4, correct: 3, wrong: 1, accuracy: 75, seconds: 3 });
    expect(sum.bySubject).toEqual([
      { subject: 'Physics', answered: 2, correct: 2 },
      { subject: 'Chemistry', answered: 2, correct: 1 },
    ]);
  });

  it('computes overall stats and recent lists', () => {
    const closed = closeSession(s, 5000).store;
    const stats = overallStats(closed, 10_000);
    expect(stats).toMatchObject({ solved: 4, correct: 3, accuracy: 75, sessions: 1, activeDays7: 1, answeredThisWeek: 4 });
    expect(recentSessions(closed)).toHaveLength(1);
    expect(recentSources(closed)[0]).toMatchObject({ id: "paper:DU-A '23-24", answered: 4 });
  });

  it('remembers a source total', () => {
    const withTotal = setSourceTotal(s, PAPER, 60);
    expect(withTotal.sources["paper:DU-A '23-24"].total).toBe(60);
    expect(setSourceTotal(withTotal, PAPER, 60)).toBe(withTotal);
  });
});

describe('remote payloads', () => {
  const s = [1, 2, 3, 4, 5].reduce((acc, i) => recordAnswer(acc, PAPER, q(i), i === 4 ? 1 : i % 4, i * 1000), emptyStore());
  const { session } = closeSession(s, 6000);
  const byKey = new Map([1, 2, 3, 4, 5].map((i) => [questionKey(q(i)), q(i)]));

  it('only syncs sittings with enough answers', () => {
    expect(shouldSyncRemotely({ items: [1, 2, 3, 4].map(() => ({ k: 'x', a: 0, c: 1 })) })).toBe(false);
    expect(shouldSyncRemotely(session!)).toBe(true);
  });

  it('shapes a session like an exam result', () => {
    const payload = buildResultPayload(session!, byKey);
    expect(payload).toMatchObject({ totalQuestions: 5, correct: 4, wrong: 1, skipped: 0, score: 4, subject: 'Physics' });
    expect(payload.examId).toBe(`qbank_${session!.id}`);
    expect(payload.userAnswers).toEqual([1, 2, 3, 1, 1]);
    expect(payload.mistakes.map((m) => m.question)).toEqual(['Question 4']);
    expect(payload.config).toMatchObject({ type: 'QBANK_PRACTICE', mode: 'PRACTICE', title: PAPER.title, qbankSource: PAPER, durationSec: 5 });
  });

  it('rebuilds minimal questions when the originals are not in memory, and skips hashed ids in mistakes', () => {
    const hashed = q(9, { _id: undefined, correctAnswerIndex: 0 });
    const open = recordAnswer(recordAnswer(emptyStore(), PAPER, q(4), 1, 1000), PAPER, hashed, 2, 2000);
    const payload = buildResultPayload(closeSession(open, 3000).session!, new Map());
    expect(payload.totalQuestions).toBe(2);
    expect(payload.questions[0]).toMatchObject({ _id: q(4)._id, subject: 'Chemistry', chapter: 'Vector', correctAnswerIndex: 0 });
    expect(payload.mistakes.map((m) => m._id)).toEqual([q(4)._id]);
  });

  it('trims the Firestore mirror', () => {
    const doc = buildAttemptDoc('u1', buildResultPayload(session!, byKey), 123);
    expect(doc).toMatchObject({ userId: 'u1', timestamp: 123, totalQuestions: 5 });
    expect(doc.questions[0]).toEqual({ _id: q(1)._id, subject: 'Physics', chapter: 'Vector', correctAnswerIndex: 1 });
    expect(Object.keys(doc.questions[0])).not.toContain('question');
  });
});

describe('mergeFromAttempts', () => {
  const attempt = (overrides: Record<string, unknown> = {}) => ({
    examId: 'qbank_remote1',
    timestamp: 5000,
    userAnswers: [1, 0],
    questions: [
      { _id: q(1)._id, subject: 'Physics', correctAnswerIndex: 1 },
      { _id: q(2)._id, subject: 'Chemistry', correctAnswerIndex: 2 },
    ],
    config: { type: 'QBANK_PRACTICE', title: 'ঢাবি', qbankSource: PAPER },
    ...overrides,
  });

  it('imports question-bank attempts as synced sessions and marks', () => {
    const merged = mergeFromAttempts(emptyStore(), [attempt()]);
    expect(merged.sessions).toHaveLength(1);
    expect(merged.sessions[0]).toMatchObject({ id: 'remote1', synced: true, source: PAPER });
    expect(markState(merged, q(1))).toBe('correct');
    expect(markState(merged, q(2))).toBe('wrong');
  });

  it('ignores non-bank attempts and never overwrites newer local marks', () => {
    const local = recordAnswer(emptyStore(), PAPER, q(2), 2, 9000);
    const merged = mergeFromAttempts(local, [attempt(), attempt({ examId: 'mock1', config: { type: 'CHAPTER_WISE' } })]);
    expect(merged.sessions.map((s) => s.id)).toEqual(['remote1']);
    expect(merged.marks[q(2)._id!]).toMatchObject({ r: 1, t: 9000 });
  });

  it('does not duplicate a session it already knows', () => {
    const once = mergeFromAttempts(emptyStore(), [attempt()]);
    expect(mergeFromAttempts(once, [attempt()]).sessions).toHaveLength(1);
  });
});

describe('recordExamAttempt', () => {
  it('folds a finished exam into marks, sources and history', () => {
    const exam: SessionSource = { kind: 'exam', id: "DU-A '23-24", title: 'ঢাবি ক পরীক্ষা' };
    const s = recordExamAttempt(emptyStore(), exam, [q(1), q(2), q(3)], [1, null, 0], 50_000, 600);
    expect(s.sessions).toHaveLength(1);
    expect(s.sessions[0]).toMatchObject({ startedAt: 50_000 - 600_000, endedAt: 50_000, synced: true });
    expect(s.sessions[0].items).toHaveLength(2);
    expect(markState(s, q(2))).toBe('unseen');
    expect(markState(s, q(3))).toBe('wrong');
    expect(s.sources["exam:DU-A '23-24"]).toMatchObject({ answered: 2, correct: 1 });
  });

  it('returns the same store when nothing was answered', () => {
    const s = emptyStore();
    expect(recordExamAttempt(s, PAPER, [q(1)], [null])).toBe(s);
  });
});

describe('storage', () => {
  it('round-trips through storage and survives garbage', () => {
    const storage = memoryStorage();
    const s = recordAnswer(emptyStore(), PAPER, q(1), 1, 1000);
    writeStore('u1', storage, s);
    expect(readStore('u1', storage)).toEqual(s);
    expect(readStore('u2', storage)).toEqual(emptyStore());
    storage.setItem('pk_qbank_progress_v1:u1', '{not json');
    expect(readStore('u1', storage)).toEqual(emptyStore());
    expect(readStore('u1', null)).toEqual(emptyStore());
  });
});

describe('formatting', () => {
  it('formats durations in Bangla', () => {
    expect(formatSeconds(42)).toBe('৪২ সেকেন্ড');
    expect(formatSeconds(125)).toBe('২ মি ৫ সে');
    expect(formatSeconds(600)).toBe('১০ মিনিট');
    expect(formatSeconds(3700)).toBe('১ ঘ ১ মি');
  });
});
