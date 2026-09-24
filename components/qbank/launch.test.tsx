import { describe, expect, it } from 'vitest';
import type { QuizQuestion } from '../../types';
import { asLevel, chapterSource, hrefForSource, hrefs, parseSourceId, searchSource } from './nav';
import { buildExamConfig, countPresets, pickExamQuestions, recordQbankExam } from './launch';
import { readStore, type StorageLike } from './records';

const q = (i: number, extra: Partial<QuizQuestion> = {}): QuizQuestion => ({
  _id: `${i}`.padStart(24, 'b'),
  question: `Q${i}`,
  options: ['A', 'B', 'C', 'D'],
  correctAnswerIndex: i % 4,
  explanation: '',
  subject: 'Physics',
  ...extra,
});

/** Deterministic "random" so shuffles are reproducible. */
const seq = (values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

describe('pickExamQuestions', () => {
  const pool = [q(1), q(2, { contextText: 'passage' }), q(3, { contextText: 'passage' }), q(4), q(5), q(6)];

  it('keeps the original order for full papers', () => {
    expect(pickExamQuestions(pool, 4, true).map((x) => x.question)).toEqual(['Q1', 'Q2', 'Q3', 'Q4']);
    expect(pickExamQuestions(pool, 10, true)).toHaveLength(6);
  });

  it('never splits a stimulus group and returns exactly the requested count', () => {
    for (let seed = 0; seed < 20; seed++) {
      const rand = seq([(seed % 10) / 10, 0.7, 0.3, 0.9, 0.5]);
      const picked = pickExamQuestions(pool, 3, false, rand);
      expect(picked).toHaveLength(3);
      const hasQ2 = picked.some((x) => x.question === 'Q2');
      const hasQ3 = picked.some((x) => x.question === 'Q3');
      expect(hasQ2).toBe(hasQ3);
    }
  });

  it('shuffles when asked for everything without order', () => {
    const picked = pickExamQuestions(pool, 6, false, seq([0.9, 0.1, 0.5, 0.2, 0.8, 0.4]));
    expect(picked).toHaveLength(6);
    expect(new Set(picked.map((x) => x.question)).size).toBe(6);
  });
});

describe('countPresets', () => {
  it('offers the standard sizes below the pool plus the whole pool', () => {
    expect(countPresets(60)).toEqual([10, 20, 30, 50, 60]);
    expect(countPresets(12)).toEqual([10, 12]);
    expect(countPresets(10)).toEqual([10]);
    expect(countPresets(0)).toEqual([]);
  });
});

describe('buildExamConfig', () => {
  it('produces the launch contract ExamPage expects', () => {
    const source = { ...chapterSource('ADMISSION', 'Physics 1st Paper', 'ভেক্টর'), kind: 'exam' as const };
    const config = buildExamConfig(
      { title: 'পদার্থবিজ্ঞান · ভেক্টর', source, subject: 'Physics 1st Paper', chapter: 'ভেক্টর', keepOrder: true },
      [q(1), q(2), q(3)],
      {
        count: 3,
        minutes: 45,
        negative: 0.25,
      },
    );
    expect(config).toMatchObject({
      type: 'QBANK_EXAM',
      mode: 'ALL_AT_ONCE',
      timeLimit: 45,
      negativeMarking: 0.25,
      isPracticeMode: false,
      subject: 'Physics 1st Paper',
      chapter: 'ভেক্টর',
      qbankSource: source,
    });
    expect(config.questions.map((x) => x.question)).toEqual(['Q1', 'Q2', 'Q3']);
  });
});

describe('recordQbankExam', () => {
  const memory = (): StorageLike => {
    const data = new Map<string, string>();
    return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
  };

  it('writes the exam into the bank store for QBANK configs only', () => {
    const storage = memory();
    const g = globalThis as unknown as { localStorage: StorageLike };
    const original = g.localStorage;
    g.localStorage = storage;
    try {
      const source = { ...chapterSource('ADMISSION', 'Physics 1st Paper', 'ভেক্টর'), kind: 'exam' as const };
      expect(recordQbankExam('u1', { type: 'QBANK_EXAM', qbankSource: source, title: 'ভেক্টর' }, [q(1), q(2)], [1, 3], 120)).toBe(true);
      const store = readStore('u1', storage);
      expect(store.sessions).toHaveLength(1);
      expect(store.sessions[0].items.map((i) => i.c)).toEqual([1, 0]);
      expect(recordQbankExam('u1', { type: 'CHAPTER_WISE' }, [q(1)], [1])).toBe(false);
      expect(recordQbankExam('', { type: 'QBANK_EXAM' }, [q(1)], [1])).toBe(false);
    } finally {
      g.localStorage = original;
    }
  });
});

describe('nav', () => {
  it('builds and reads back source links', () => {
    expect(hrefs.home()).toBe('/qbank');
    expect(hrefs.home('ACADEMIC')).toBe('/qbank?level=ACADEMIC');
    expect(hrefs.chapter('ACADEMIC', 'Physics 1st Paper', null)).toBe('/qbank?level=ACADEMIC&subject=Physics+1st+Paper&scope=all');
    expect(hrefForSource(chapterSource('ACADEMIC', 'Physics 1st Paper', null))).toBe('/qbank?level=ACADEMIC&subject=Physics+1st+Paper&scope=all');
    expect(hrefForSource(chapterSource('ADMISSION', 'Physics 1st Paper', 'ভেক্টর'))).toBe(hrefs.chapter('ADMISSION', 'Physics 1st Paper', 'ভেক্টর'));
    expect(hrefForSource(searchSource('নিউটন', 'ACADEMIC'))).toBe('/qbank?q=%E0%A6%A8%E0%A6%BF%E0%A6%89%E0%A6%9F%E0%A6%A8&level=ACADEMIC');
    expect(hrefForSource({ kind: 'exam', id: 'x' })).toBeNull();
  });

  it('parses stored source ids (refs may contain colons)', () => {
    expect(parseSourceId('search:ACADEMIC|a:b')).toEqual({ kind: 'search', id: 'ACADEMIC|a:b' });
    expect(parseSourceId('nonsense')).toBeNull();
    expect(asLevel('MAINBOOK')).toBe('MAINBOOK');
    expect(asLevel('bogus')).toBe('ADMISSION');
  });
});
