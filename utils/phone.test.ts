import { describe, expect, it } from 'vitest';
import { formatBdPhone, isValidBdPhone, normalizeBdPhone, toAsciiDigits, toBanglaDigits } from './phone';
import { batchOptions, parseBatch } from '../data/profileOptions';

describe('BD phone normalisation', () => {
  it('converts Bangla digits typed from a Bijoy/Avro keyboard', () => {
    expect(toAsciiDigits('০১৭১২৩৪৫৬৭৮')).toBe('01712345678');
    expect(normalizeBdPhone('০১৭১২-৩৪৫৬৭৮')).toBe('01712345678');
    expect(toBanglaDigits(2027)).toBe('২০২৭');
  });

  it('accepts the international forms students paste from WhatsApp', () => {
    expect(normalizeBdPhone('+880 1712 345678')).toBe('01712345678');
    expect(normalizeBdPhone('8801712345678')).toBe('01712345678');
    expect(normalizeBdPhone('1712345678')).toBe('01712345678');
  });

  it('validates operator prefixes 013–019 and exactly 11 digits', () => {
    expect(isValidBdPhone('01712345678')).toBe(true);
    expect(isValidBdPhone('01312345678')).toBe(true);
    expect(isValidBdPhone('01212345678')).toBe(false); // no 012 operator
    expect(isValidBdPhone('0171234567')).toBe(false); // too short
    expect(isValidBdPhone('017123456789')).toBe(false); // too long
  });

  it('formats for display without touching invalid input', () => {
    expect(formatBdPhone('01712345678')).toBe('017 1234 5678');
    expect(formatBdPhone('abc')).toBe('abc');
  });
});

describe('batch options follow the exam calendar', () => {
  it('drops a cohort once its exam is over', () => {
    // September 2026: HSC 2026 has sat its exam → next three cohorts
    expect(batchOptions('HSC', new Date(2026, 8, 24))).toEqual(['HSC 2027', 'HSC 2028', 'HSC 2029']);
    // March 2026: HSC 2026 still upcoming
    expect(batchOptions('HSC', new Date(2026, 2, 1))).toEqual(['HSC 2026', 'HSC 2027', 'HSC 2028']);
    // SSC exams end by April
    expect(batchOptions('SSC', new Date(2026, 1, 1))).toEqual(['SSC 2026', 'SSC 2027', 'SSC 2028']);
    expect(batchOptions('SSC', new Date(2026, 8, 24))).toEqual(['SSC 2027', 'SSC 2028', 'SSC 2029']);
  });

  it('offers this year and last year for admission candidates', () => {
    expect(batchOptions('Admission', new Date(2026, 8, 24))).toEqual(['HSC 2026', 'HSC 2025']);
  });

  it('parses stored batches (including legacy free text) for pre-fill', () => {
    expect(parseBatch('HSC 2027')).toEqual({ level: 'HSC', batch: 'HSC 2027' });
    expect(parseBatch('ssc 2028')).toEqual({ level: 'SSC', batch: 'SSC 2028' });
    expect(parseBatch('2024')).toEqual({ level: 'HSC', batch: 'HSC 2024' });
    expect(parseBatch('')).toEqual({ level: '', batch: '' });
  });
});
