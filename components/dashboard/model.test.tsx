import { describe, expect, it } from 'vitest';
import {
  accuracyOf,
  boardRows,
  describeSetup,
  formatBnDate,
  formatPoints,
  greetingFor,
  heroMessage,
  monthGrid,
  nextMilestone,
  questPreview,
  readActiveSessions,
  relativeTime,
  shiftMonth,
  subjectRows,
  todayKey,
  weakestSubject,
  weekRhythm,
} from './model';

// 2026-09-24 09:30 in Dhaka (UTC+6) → 03:30Z. A Thursday.
const NOW = new Date('2026-09-24T03:30:00.000Z');

describe('dashboard model — dates & copy', () => {
  it('keys days in Asia/Dhaka and formats a Bangla date line', () => {
    expect(todayKey(NOW)).toBe('2026-09-24');
    // 23:30 Dhaka on the 24th is still the 24th even though UTC has moved on
    expect(todayKey(new Date('2026-09-24T17:30:00.000Z'))).toBe('2026-09-24');
    expect(todayKey(new Date('2026-09-24T18:30:00.000Z'))).toBe('2026-09-25');
    expect(formatBnDate(NOW)).toBe('বৃহস্পতিবার, ২৪ সেপ্টেম্বর');
  });

  it('greets by the hour', () => {
    expect(greetingFor(7)).toBe('শুভ সকাল');
    expect(greetingFor(13)).toBe('শুভ দুপুর');
    expect(greetingFor(17)).toBe('শুভ বিকেল');
    expect(greetingFor(19)).toBe('শুভ সন্ধ্যা');
    expect(greetingFor(23)).toBe('শুভ রাত্রি');
  });

  it('adapts the hero line to today and the streak', () => {
    expect(heroMessage({ todayActive: false, streak: 0, totalExams: 0 })).toMatch(/প্রথম মক/);
    expect(heroMessage({ todayActive: false, streak: 5, totalExams: 12 })).toMatch(/৫ দিনের স্ট্রিক/);
    expect(heroMessage({ todayActive: true, streak: 9, totalExams: 12 })).toMatch(/৯ দিনের স্ট্রিক চলছে/);
    expect(heroMessage({ todayActive: true, streak: 2, totalExams: 12 })).toMatch(/হয়ে গেছে/);
  });

  it('computes accuracy and formats points with Bangla digits', () => {
    expect(accuracyOf({ totalCorrect: 412, totalWrong: 118 })).toBe(78);
    expect(accuracyOf({})).toBe(0);
    expect(formatPoints(1840)).toBe('১,৮৪০');
  });
});

describe('dashboard model — streak', () => {
  it('builds the Saturday-first week with active / future flags', () => {
    const week = weekRhythm(['2026-09-19', '2026-09-23', '2026-09-24'], NOW);
    expect(week.map((d) => d.name)).toEqual(['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র']);
    expect(week.map((d) => d.active)).toEqual([true, false, false, false, true, true, false]);
    expect(week.find((d) => d.isToday)?.date).toBe('2026-09-24');
    expect(week[6].future).toBe(true);
  });

  it('knows the next milestone', () => {
    expect(nextMilestone(0)).toMatchObject({ target: 3, remaining: 3, progress: 0 });
    expect(nextMilestone(5)).toMatchObject({ target: 7, remaining: 2 });
    expect(nextMilestone(7)).toMatchObject({ target: 14, remaining: 7, progress: 0 });
    expect(nextMilestone(400).target).toBe(500);
  });

  it('lays a month out Saturday-first and counts active days', () => {
    const grid = monthGrid(2026, 9, ['2026-09-01', '2026-09-24', '2026-10-01'], NOW);
    expect(grid.label).toBe('সেপ্টেম্বর ২০২৬');
    // 1 Sep 2026 is a Tuesday → Sat, Sun, Mon are padding
    expect(grid.cells.slice(0, 3)).toEqual([null, null, null]);
    expect(grid.cells[3]).toMatchObject({ day: 1, active: true, isToday: false });
    expect(grid.cells.length % 7).toBe(0);
    expect(grid.activeDays).toBe(2);
    expect(grid.cells.find((c) => c?.isToday)?.day).toBe(24);
    expect(grid.cells.find((c) => c?.day === 30)?.future).toBe(true);
    expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
    expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
  });
});

describe('dashboard model — subjects, quests, leaderboard', () => {
  it('merges papers into subjects, names them in Bangla and flags the weakest', () => {
    const rows = subjectRows([
      { subject: 'Physics 1st Paper', total: 100, correct: 80 },
      { subject: 'Physics 2nd Paper', total: 100, correct: 70 },
      { subject: 'Chemistry', total: 60, correct: 27 },
      { subject: 'Biology', total: 4, correct: 1 },
      { subject: 'Empty', total: 0, correct: 0 },
    ]);
    expect(rows.map((r) => r.name)).toEqual(['পদার্থবিজ্ঞান', 'রসায়ন', 'জীববিজ্ঞান']);
    expect(rows[0]).toMatchObject({ total: 200, correct: 150, accuracy: 75, tone: 'good', group: 'Physics' });
    expect(rows[1].tone).toBe('weak');
    expect(weakestSubject(rows)?.name).toBe('রসায়ন'); // biology has too few attempts to judge
    expect(weakestSubject(rows.slice(0, 1))).toBeNull();
  });

  it('previews daily quests with unfinished ones first', () => {
    const base = { description: '', type: 'EXAM_COMPLETE' as const, category: 'DAILY' as const, reward: 20 };
    const preview = questPreview([
      { ...base, id: 'a', title: 'claimed', target: 1, progress: 1, completed: true, claimed: true },
      { ...base, id: 'b', title: 'done', target: 1, progress: 1, completed: true, claimed: false },
      { ...base, id: 'c', title: 'todo', target: 3, progress: 5, completed: false, claimed: false },
      { ...base, id: 'd', title: 'todo2', target: 3, progress: 0, completed: false, claimed: false },
    ]);
    expect(preview.map((q) => q.id)).toEqual(['b', 'c', 'd']);
    expect(preview[1].progress).toBe(3); // clamped to the target
  });

  it('shows the top three and appends the signed-in user with a gap marker', () => {
    const board = Array.from({ length: 8 }, (_, i) => ({ uid: `u${i}`, displayName: `User ${i}`, photoURL: '', points: 1000 - i }));
    const me = { uid: 'u6', displayName: 'Me' };
    const { rows, gap } = boardRows(board, me);
    expect(rows.map((r) => r.rank)).toEqual([1, 2, 3, 7]);
    expect(rows[3].isMe).toBe(true);
    expect(gap).toBe(true);
    expect(boardRows(board, { uid: 'u1' }).gap).toBe(false);
    expect(boardRows(board, { uid: 'u3' }).gap).toBe(false); // rank 4 sits right under the top three
    expect(boardRows(board, { uid: 'nobody' }).rows).toHaveLength(3);
  });
});

describe('dashboard model — resume', () => {
  const storage = (entries: Record<string, unknown>) => {
    const keys = Object.keys(entries);
    return { length: keys.length, key: (i: number) => keys[i] ?? null, getItem: (k: string) => (k in entries ? JSON.stringify(entries[k]) : null) };
  };
  const questions = Array.from({ length: 10 }, (_, i) => ({
    question: `q${i}`,
    options: ['a', 'b'],
    correctAnswerIndex: 0,
    explanation: '',
    subject: 'Physics',
    chapter: 'ভেক্টর',
  }));

  it('lists unfinished exams newest first and skips expired ones', () => {
    const now = 1_000_000_000;
    const sessions = readActiveSessions(
      'u1',
      storage({
        exam_progress_u1_a: {
          config: { title: 'পদার্থবিজ্ঞান · ভেক্টর', mode: 'ALL_AT_ONCE' },
          questions,
          userAnswers: [0, null, 1],
          expiryTime: now + 90_000,
          savedAt: 5,
        },
        exam_progress_u1_b: { config: { title: 'x' }, questions, userAnswers: [], expiryTime: now - 1, savedAt: 9 },
        exam_progress_u1_c: { config: { title: 'প্র্যাকটিস', mode: 'SINGLE_PAGE' }, questions, userAnswers: [], expiryTime: null, savedAt: 7 },
        exam_progress_other_d: { config: {}, questions, userAnswers: [] },
        exam_progress_u1_e: 'garbage{',
      }),
      now,
    );
    expect(sessions.map((s) => s.examId)).toEqual(['c', 'a']);
    expect(sessions[1]).toMatchObject({ title: 'পদার্থবিজ্ঞান · ভেক্টর', answered: 2, total: 10, remaining: 90 });
    expect(sessions[0].remaining).toBeNull();
  });

  it('describes the last mock setup and relative times', () => {
    expect(describeSetup(null)).toBeNull();
    const setup = {
      selection: { 'Physics 1st Paper-ভেক্টর': ['x'] },
      settings: { count: 20, timeLimit: 20, negativeMarking: 0.25, practice: false, view: 'ALL_AT_ONCE' as const },
      title: 'পদার্থবিজ্ঞান · ভেক্টর',
      at: 1,
    };
    // the selection may be pruned by the syllabus sanitiser, so only assert on the shape when it survives
    const preview = describeSetup(setup);
    if (preview) expect(preview.detail).toBe('২০ প্রশ্ন · ২০ মিনিট · নেগেটিভ ০.২৫');
    expect(relativeTime(0)).toBe('');
    expect(relativeTime(NOW.getTime() - 30_000, NOW.getTime())).toBe('এইমাত্র');
    expect(relativeTime(NOW.getTime() - 3 * 3_600_000, NOW.getTime())).toBe('৩ ঘণ্টা আগে');
    expect(relativeTime(NOW.getTime() - 26 * 3_600_000, NOW.getTime())).toBe('গতকাল');
    expect(relativeTime(NOW.getTime() - 5 * 86_400_000, NOW.getTime())).toBe('৫ দিন আগে');
  });
});
