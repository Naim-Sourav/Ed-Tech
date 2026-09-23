import { describe, expect, it } from 'vitest';
import type { QuizQuestion } from '../../types';
import {
  chapterBreakdown,
  displaySubject,
  examTitle,
  filterForReview,
  formatClock,
  formatDurationBn,
  formatScore,
  isStimulusHead,
  shortcutFor,
  stimulusRange,
  summarize,
  verdictFor,
  weakChapters,
  weekDays,
} from './model';

const q = (over: Partial<QuizQuestion> = {}): QuizQuestion => ({
  question: 'প্রশ্ন',
  options: ['ক', 'খ', 'গ', 'ঘ'],
  correctAnswerIndex: 0,
  explanation: '',
  ...over,
});

describe('summarize', () => {
  const qs = [q(), q(), q(), q()];

  it('counts correct / wrong / skipped and applies negative marking', () => {
    const s = summarize(qs, [0, 1, null, 0], 0.25);
    expect(s).toMatchObject({ total: 4, correct: 2, wrong: 1, skipped: 1, answered: 3, rawScore: 1.75, score: 1.75 });
    expect(s.percentage).toBe(44); // 1.75 / 4
    expect(s.accuracy).toBe(67); // 2 / 3
  });

  it('never goes below zero and copes with empty input', () => {
    expect(summarize(qs, [1, 1, 1, 1], 1).score).toBe(0);
    expect(summarize(qs, [1, 1, 1, 1], 1).rawScore).toBe(-4);
    expect(summarize([], [], 0.25)).toMatchObject({ total: 0, percentage: 0, accuracy: 0 });
  });

  it('treats undefined answers (short arrays) as skipped', () => {
    expect(summarize(qs, [0], 0)).toMatchObject({ correct: 1, skipped: 3 });
  });
});

describe('formatting', () => {
  it('formats scores in Bangla digits without trailing zeros', () => {
    expect(formatScore(18)).toBe('১৮');
    expect(formatScore(18.75)).toBe('১৮.৭৫');
    expect(formatScore(17.5)).toBe('১৭.৫');
    expect(formatScore(1 / 3)).toBe('০.৩৩');
  });

  it('formats the clock and human durations', () => {
    expect(formatClock(65)).toBe('০১:০৫');
    expect(formatClock(3725)).toBe('১:০২:০৫');
    expect(formatClock(-3)).toBe('০০:০০');
    expect(formatDurationBn(45)).toBe('৪৫ সে');
    expect(formatDurationBn(303)).toBe('৫ মি ৩ সে');
    expect(formatDurationBn(120)).toBe('২ মি');
    expect(formatDurationBn(3900)).toBe('১ ঘ ৫ মি');
    expect(formatDurationBn(undefined)).toBe('—');
  });

  it('maps subjects to Bangla names with paper suffixes', () => {
    expect(displaySubject('Physics 1st Paper')).toBe('পদার্থবিজ্ঞান ১ম পত্র');
    expect(displaySubject('Chemistry 2nd Paper')).toBe('রসায়ন ২য় পত্র');
    expect(displaySubject('Higher Math')).toBe('উচ্চতর গণিত');
    expect(displaySubject('GK')).toBe('সাধারণ জ্ঞান');
    expect(displaySubject('Astronomy')).toBe('Astronomy');
    expect(displaySubject('')).toBe('সাধারণ');
  });

  it('picks a verdict by score band', () => {
    expect(verdictFor(95).tone).toBe('great');
    expect(verdictFor(80).tone).toBe('great');
    expect(verdictFor(50).tone).toBe('good');
    expect(verdictFor(10).tone).toBe('push');
  });
});

describe('stimulus grouping', () => {
  const ctx = 'উদ্দীপক';
  const qs = [q(), q({ contextText: ctx }), q({ contextText: ctx }), q({ contextText: ctx }), q({ contextText: 'অন্য' }), q()];

  it('finds the 1-based range of a contiguous run and its head', () => {
    expect(stimulusRange(qs, 2)).toEqual({ start: 2, end: 4 });
    expect(stimulusRange(qs, 1)).toEqual({ start: 2, end: 4 });
    expect(stimulusRange(qs, 4)).toEqual({ start: 5, end: 5 });
    expect(stimulusRange(qs, 0)).toBeNull();
    expect(isStimulusHead(qs, 1)).toBe(true);
    expect(isStimulusHead(qs, 2)).toBe(false);
    expect(isStimulusHead(qs, 4)).toBe(true);
    expect(isStimulusHead(qs, 5)).toBe(false);
  });
});

describe('examTitle', () => {
  const qs = [q({ subject: 'Physics 1st Paper', chapter: 'ভেক্টর' }), q({ subject: 'Physics 1st Paper', chapter: 'ভেক্টর' })];

  it('does not repeat a chapter the builder title already names', () => {
    expect(examTitle({ title: 'পদার্থবিজ্ঞান · ভেক্টর' }, qs, 'ALL_AT_ONCE')).toBe('পদার্থবিজ্ঞান · ভেক্টর');
    expect(examTitle({ title: 'সাপ্তাহিক মডেল টেস্ট' }, qs, 'ALL_AT_ONCE')).toBe('সাপ্তাহিক মডেল টেস্ট : ভেক্টর');
  });

  it('prettifies legacy English launch titles', () => {
    expect(examTitle({ title: 'Mistake Revision' }, qs, 'SINGLE_PAGE')).toBe('ভুল প্রশ্ন রিভিশন');
    expect(examTitle({ title: 'Physics 1st Paper - All Chapters' }, [], 'ALL_AT_ONCE')).toBe('পদার্থবিজ্ঞান ১ম পত্র · সব অধ্যায়');
    expect(examTitle({ title: 'Chemistry 2nd Paper - জৈব রসায়ন' }, [], 'ALL_AT_ONCE')).toBe('রসায়ন ২য় পত্র · জৈব রসায়ন');
    expect(examTitle({ title: 'পদার্থবিজ্ঞান · ভেক্টর' }, qs, 'SINGLE_PAGE')).toBe('পদার্থবিজ্ঞান · ভেক্টর');
  });

  it('falls back to subjects / generic names', () => {
    expect(examTitle({ title: 'Custom Exam' }, qs, 'ALL_AT_ONCE')).toBe('পদার্থবিজ্ঞান ১ম পত্র : ভেক্টর');
    expect(examTitle({ title: 'Custom Exam' }, qs, 'SINGLE_PAGE')).toBe('পদার্থবিজ্ঞান ১ম পত্র');
    expect(examTitle(null, [q()], 'ALL_AT_ONCE')).toBe('যৌথ পরীক্ষা');
    expect(examTitle({ title: 'ডেইলি চ্যালেঞ্জ' }, [q()], 'SINGLE_PAGE')).toBe('ডেইলি চ্যালেঞ্জ');
  });
});

describe('chapter breakdown', () => {
  const qs = [
    q({ chapter: 'ভেক্টর' }),
    q({ chapter: 'ভেক্টর' }),
    q({ chapter: 'ভেক্টর' }),
    q({ chapter: 'গতিবিদ্যা' }),
    q({ chapter: 'গতিবিদ্যা' }),
    q({ subject: 'Chemistry 1st Paper' }),
  ];
  const answers = [0, 1, null, 0, 0, 1];

  it('tallies per chapter (subject fallback), biggest first', () => {
    const stats = chapterBreakdown(qs, answers);
    expect(stats.map((s) => s.label)).toEqual(['ভেক্টর', 'গতিবিদ্যা', 'রসায়ন ১ম পত্র']);
    expect(stats[0]).toMatchObject({ total: 3, correct: 1, wrong: 1, skipped: 1, pct: 33 });
    expect(stats[1]).toMatchObject({ total: 2, correct: 2, pct: 100 });
  });

  it('flags weak chapters only when enough questions were asked', () => {
    const weak = weakChapters(chapterBreakdown(qs, answers));
    expect(weak.map((w) => w.label)).toEqual(['ভেক্টর']);
  });
});

describe('review filters & shortcuts', () => {
  const qs = [q(), q(), q()];
  const answers = [0, 1, null];

  it('filters by outcome and by flag', () => {
    expect(filterForReview(qs, answers, 'CORRECT').map((x) => x.idx)).toEqual([0]);
    expect(filterForReview(qs, answers, 'WRONG').map((x) => x.idx)).toEqual([1]);
    expect(filterForReview(qs, answers, 'SKIPPED').map((x) => x.idx)).toEqual([2]);
    expect(filterForReview(qs, answers, 'FLAGGED', new Set([2])).map((x) => x.idx)).toEqual([2]);
    expect(filterForReview(qs, answers, 'ALL')).toHaveLength(3);
  });

  it('maps keys to actions (Latin and Bangla digits)', () => {
    expect(shortcutFor('1', 4)).toEqual({ type: 'option', index: 0 });
    expect(shortcutFor('৪', 4)).toEqual({ type: 'option', index: 3 });
    expect(shortcutFor('5', 4)).toBeNull();
    expect(shortcutFor('ArrowRight', 4)).toEqual({ type: 'next' });
    expect(shortcutFor('f', 4)).toEqual({ type: 'flag' });
    expect(shortcutFor('x', 4)).toBeNull();
  });
});

describe('weekDays', () => {
  it('returns a Saturday-first week that contains today', () => {
    const days = weekDays(new Date());
    expect(days).toHaveLength(7);
    expect(days[0].name).toBe('শনি');
    expect(days.filter((d) => d.isToday)).toHaveLength(1);
    expect(days.every((d) => /^\d{4}-\d{2}-\d{2}$/.test(d.date))).toBe(true);
  });
});
