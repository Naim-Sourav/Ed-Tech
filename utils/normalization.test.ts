import { describe, it, expect } from 'vitest';
import { normalizeBangla, normalizeForComparison, getEditDistance } from './normalization';

describe('normalizeBangla', () => {
  it('returns empty string for nullish input', () => {
    expect(normalizeBangla(null)).toBe('');
    expect(normalizeBangla(undefined)).toBe('');
    expect(normalizeBangla('')).toBe('');
  });

  it('unifies precomposed vs decomposed Bangla spellings', () => {
    const composed = 'রসায়ন'; // with U+09DF য়
    const decomposed = 'রসা\u09AF\u09BCন'; // য + ় instead of য়
    expect(composed).not.toBe(decomposed); // sanity: inputs really differ
    expect(normalizeBangla(composed)).toBe(normalizeBangla(decomposed));
  });

  it('strips zero-width and invisible characters', () => {
    expect(normalizeBangla('পদার্থ​বিজ্ঞান')).toBe('পদার্থবিজ্ঞান'); // ZWSP inside
    expect(normalizeBangla('﻿রসায়ন')).toBe(normalizeBangla('রসায়ন')); // BOM
    expect(normalizeBangla('﻿abc')).toBe('abc'); // BOM, ascii
  });

  it('collapses whitespace and trims', () => {
    expect(normalizeBangla('  তাপ\tগতিবিদ্যা\n ')).toBe('তাপ গতিবিদ্যা');
  });
});

describe('normalizeForComparison', () => {
  it('removes punctuation, spaces and casing', () => {
    expect(normalizeForComparison('Vector, লব্ধি।')).toBe('vectorলব্ধি');
  });
});

describe('getEditDistance', () => {
  it('returns 0 for identical strings', () => {
    expect(getEditDistance('ভেক্টর', 'ভেক্টর')).toBe(0);
  });

  it('counts single edits', () => {
    expect(getEditDistance('abc', 'abd')).toBe(1);
    expect(getEditDistance('abc', 'abcd')).toBe(1);
  });

  it('handles empty strings', () => {
    expect(getEditDistance('', 'abc')).toBe(3);
    expect(getEditDistance('abc', '')).toBe(3);
  });

  it('short-circuits very different lengths', () => {
    expect(getEditDistance('a', 'abcdefghijklmnop')).toBe(999);
  });
});
