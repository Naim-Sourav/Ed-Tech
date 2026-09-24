import { describe, expect, it } from 'vitest';
import {
  achievements,
  chapterStatsFromResults,
  emptyIdentity,
  heatmap,
  initialOf,
  isHttpUrl,
  longestStreak,
  memberSince,
  nextAchievement,
  profileCompletion,
  profileUrl,
  streakFromLog,
  studyLine,
  sumCorrectFromSubjectRows,
  sumTotalFromSubjectRows,
  topicRows,
  type ProfileStats,
} from './model';

// 2026-09-24 10:00 Dhaka (UTC+6) — a Thursday.
const NOW = new Date('2026-09-24T04:00:00.000Z');

const dayKey = (offset: number) => {
  const d = new Date(Date.UTC(2026, 8, 24) + offset * 86_400_000);
  return d.toISOString().slice(0, 10);
};

describe('memberSince', () => {
  it('formats the first usable candidate in Bengali (Dhaka month/year)', () => {
    expect(memberSince(Date.UTC(2025, 4, 15))).toBe('মে ২০২৫');
    expect(memberSince(undefined, null, '', '2025-05-15T10:00:00.000Z')).toBe('মে ২০২৫');
    expect(memberSince(String(Date.UTC(2025, 11, 31, 20)))).toBe('জানুয়ারি ২০২৬'); // 02:00 Dhaka on 1 Jan
  });
  it('returns an empty string when nothing parses', () => {
    expect(memberSince(undefined, 'not a date', 0, -5)).toBe('');
  });
});

describe('heatmap', () => {
  it('builds Saturday-first columns ending with the current week and marks today/future', () => {
    const heat = heatmap([dayKey(0), dayKey(-1), dayKey(-1), dayKey(-40), dayKey(3)], 4, NOW);
    expect(heat.columns).toHaveLength(4);
    heat.columns.forEach((c) => expect(c.cells).toHaveLength(7));
    const last = heat.columns[3].cells;
    // Thursday 24 Sep sits at index 5 of a Saturday-first week (Sat 19 → Fri 25).
    expect(last[0].key).toBe('2026-09-19');
    expect(last[5].key).toBe('2026-09-24');
    expect(last[5].isToday).toBe(true);
    expect(last[5].active).toBe(true);
    expect(last[6].future).toBe(true);
    expect(last[6].active).toBe(false); // future keys never count, even when present
    expect(heat.activeDays).toBe(2); // today + yesterday; -40 days is outside a 4-week window
    expect(heat.days).toBe(27); // 4 weeks minus the one remaining day (Friday)
  });
  it('labels a column when a month starts inside it, at most every third column', () => {
    const heat = heatmap([], 26, NOW);
    const labels = heat.columns.map((c) => c.label).filter(Boolean);
    expect(labels).toEqual(['এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে']);
    const idx = heat.columns.map((c, i) => (c.label ? i : -1)).filter((i) => i >= 0);
    for (let i = 1; i < idx.length; i++) expect(idx[i] - idx[i - 1]).toBeGreaterThanOrEqual(3);
  });
});

describe('streaks', () => {
  it('longestStreak finds the longest consecutive run, ignoring duplicates and junk', () => {
    expect(longestStreak([])).toBe(0);
    expect(longestStreak(['2026-09-01', '2026-09-02', '2026-09-02', '2026-09-03', '2026-09-10', '2026-09-11', 'garbage'])).toBe(3);
  });
  it('streakFromLog counts back from today, or from yesterday when today is still open', () => {
    expect(streakFromLog([dayKey(0), dayKey(-1), dayKey(-2), dayKey(-4)], NOW)).toBe(3);
    expect(streakFromLog([dayKey(-1), dayKey(-2)], NOW)).toBe(2);
    expect(streakFromLog([dayKey(-2)], NOW)).toBe(0);
  });
});

describe('achievements', () => {
  const stats: ProfileStats = { totalExams: 12, totalCorrect: 312, totalWrong: 96, points: 1250, currentStreak: 4 };

  it('unlocks counted badges from the stats and reports progress on the rest', () => {
    const list = achievements({ stats, rank: 3, longest: 6 });
    expect(list.map((a) => a.id)).toEqual(['exam-1', 'exam-10', 'exam-50', 'streak-7', 'streak-30', 'correct-500', 'points-1000', 'accuracy-80', 'rank-10']);
    const byId = Object.fromEntries(list.map((a) => [a.id, a]));
    expect(byId['exam-1'].unlocked).toBe(true);
    expect(byId['exam-10'].unlocked).toBe(true);
    expect(byId['exam-50']).toMatchObject({ unlocked: false, status: '১২/৫০', remaining: 'আর ৩৮টি পরীক্ষা' });
    expect(byId['streak-7']).toMatchObject({ unlocked: false, status: '৬/৭', remaining: 'আর ১ দিন' });
    expect(byId['points-1000'].unlocked).toBe(true);
    expect(byId['rank-10']).toMatchObject({ unlocked: true, status: '#৩' });
    // 312/408 = 76% → short of 80 with enough answers
    expect(byId['accuracy-80']).toMatchObject({ unlocked: false, status: '৭৬%', remaining: 'আরও ৪% নির্ভুলতা' });
    expect(list.filter((a) => a.unlocked).map((a) => a.id)).toEqual(['exam-1', 'exam-10', 'points-1000', 'rank-10']);
  });

  it('handles a brand-new account without a rank', () => {
    const list = achievements({ stats: null, rank: null, longest: 0 });
    expect(list.every((a) => !a.unlocked)).toBe(true);
    expect(list.find((a) => a.id === 'rank-10')).toMatchObject({ status: '—', remaining: 'র‍্যাঙ্ক পেতে পরীক্ষা দাও' });
    expect(list.find((a) => a.id === 'accuracy-80')).toMatchObject({ status: '০%', remaining: 'আর ১০০টি উত্তর' });
  });

  it('nextAchievement picks the locked badge closest to unlocking', () => {
    const list = achievements({ stats, rank: 3, longest: 6 });
    expect(nextAchievement(list)?.id).toBe('accuracy-80'); // 0.95 progress beats streak-7 (6/7 ≈ 0.86)
    expect(nextAchievement(list.map((a) => ({ ...a, unlocked: true })))).toBeNull();
  });
});

describe('study summary', () => {
  it('studyLine joins whatever is known, in Bengali', () => {
    expect(studyLine({ hscBatch: 'HSC 2026', department: 'Science', target: 'Medical' })).toBe('HSC ২০২৬ · বিজ্ঞান · মেডিকেল');
    expect(studyLine({ hscBatch: '', department: 'Humanities', target: '' })).toBe('মানবিক');
    expect(studyLine({ hscBatch: '', department: '', target: '' })).toBe('');
  });

  it('profileCompletion counts the seven study fields and names the missing ones', () => {
    const full = { ...emptyIdentity(), name: 'নাবিলা', phoneNumber: '01712345678', hscBatch: 'HSC 2026', department: 'Science', target: 'Medical', college: 'ঢাকা কলেজ', dailyStudyGoal: '৪-৬ ঘণ্টা' };
    expect(profileCompletion(full)).toEqual({ done: 7, total: 7, missing: [] });
    expect(profileCompletion({ ...full, college: '  ', phoneNumber: '' })).toEqual({ done: 5, total: 7, missing: ['মোবাইল', 'কলেজ'] });
  });
});

describe('topicRows', () => {
  it('keeps strong ≥70% and weak <60% topics with enough attempts, without overlap', () => {
    const stats: ProfileStats = {
      strongestTopics: [
        { topic: 'কোষ বিভাজন', accuracy: 94, total: 18 },
        { topic: 'ভেক্টর', accuracy: 90.4, total: 11 },
        { topic: 'তাপ', accuracy: 100, total: 2 }, // too few attempts
        { topic: 'অম্ল', accuracy: 65, total: 20 }, // not strong enough
        { topic: 'জৈব যৌগ', accuracy: 86, total: 9 },
        { topic: 'তরঙ্গ', accuracy: 80, total: 30 },
      ],
      weakestTopics: [
        { topic: 'কোষ বিভাজন', accuracy: 40, total: 10 }, // overlaps a strong topic
        { topic: 'সরলরেখা', accuracy: 42, total: 12 },
        { topic: 'মৌলের পর্যায়বৃত্ত ধর্ম', accuracy: 55, total: 9 },
        { topic: 'ভালো টপিক', accuracy: 75, total: 9 }, // not weak
      ],
    };
    const { strong, weak } = topicRows(stats);
    expect(strong.map((t) => t.topic)).toEqual(['কোষ বিভাজন', 'ভেক্টর', 'জৈব যৌগ']);
    expect(strong[1].accuracy).toBe(90);
    expect(weak.map((t) => t.topic)).toEqual(['সরলরেখা', 'মৌলের পর্যায়বৃত্ত ধর্ম']);
  });
  it('is empty for missing stats', () => {
    expect(topicRows(null)).toEqual({ strong: [], weak: [] });
  });
});

describe('chapter deep analysis', () => {
  it('aggregates per-chapter correct/wrong/skipped from mixed-subject results', () => {
    const results = [
      {
        subject: 'Physics',
        questions: [
          { subject: 'Physics', chapter: 'ভেক্টর', correctAnswerIndex: 1 },
          { subject: 'Physics', chapter: 'নিউটনিয়ান বলবিদ্যা', correctAnswerIndex: 0 },
          { subject: 'Chemistry', chapter: 'গুণগত রসায়ন', correctAnswerIndex: 2 },
        ],
        userAnswers: [1, 2, 2],
      },
      {
        subject: 'Physics',
        questions: [
          { subject: 'Physics', chapter: 'ভেক্টর', correctAnswerIndex: 0 },
          { subject: 'Physics', chapter: 'ভেক্টর', correctAnswerIndex: 1 },
        ],
        userAnswers: [0, null],
      },
    ];
    const stats = chapterStatsFromResults(results as any);
    expect(stats).toHaveLength(3);
    const vec = stats.find((s) => s.chapter === 'ভেক্টর')!;
    expect(vec).toMatchObject({ subject: 'Physics', total: 3, correct: 2, skipped: 1, accuracy: 67 });
    const chem = stats.find((s) => s.chapter === 'গুণগত রসায়ন')!;
    expect(chem).toMatchObject({ subject: 'Chemistry', total: 1, correct: 1 });
  });

  it('sum helpers keep top numbers consistent with subject rows', () => {
    const rows = [
      { key: 'Physics', name: 'পদার্থবিজ্ঞান', group: 'Physics', total: 136, correct: 107, accuracy: 79, tone: 'good' as const },
      { key: 'Biology', name: 'জীববিজ্ঞান', group: 'Biology', total: 134, correct: 113, accuracy: 84, tone: 'good' as const },
    ];
    expect(sumCorrectFromSubjectRows(rows as any)).toBe(220);
    expect(sumTotalFromSubjectRows(rows as any)).toBe(270);
  });
});

describe('misc', () => {
  it('isHttpUrl rejects data URIs and the literal "false"', () => {
    expect(isHttpUrl('https://x.y/a.png')).toBe(true);
    expect(isHttpUrl('data:image/svg+xml;base64,AAA')).toBe(false);
    expect(isHttpUrl('false')).toBe(false);
    expect(isHttpUrl(undefined)).toBe(false);
  });
  it('initialOf falls back to শ and profileUrl encodes the uid', () => {
    expect(initialOf(' নাবিলা রহমান')).toBe('ন');
    expect(initialOf('')).toBe('শ');
    expect(profileUrl('u/1', 'https://porikkhangon.app/')).toBe('https://porikkhangon.app/profile/u%2F1');
  });
});
