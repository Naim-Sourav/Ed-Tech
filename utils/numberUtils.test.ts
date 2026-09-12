import { describe, it, expect } from 'vitest';
import { toBengaliNumber } from './numberUtils';

describe('toBengaliNumber', () => {
  it('converts digits to Bengali numerals', () => {
    expect(toBengaliNumber(1234567890)).toBe('১২৩৪৫৬৭৮৯০');
  });

  it('handles string input with mixed content', () => {
    expect(toBengaliNumber('Q25 of 100')).toBe('Q২৫ of ১০০');
  });

  it('returns empty string for null/undefined', () => {
    expect(toBengaliNumber(null)).toBe('');
    expect(toBengaliNumber(undefined)).toBe('');
  });

  it('keeps negative sign and decimals', () => {
    expect(toBengaliNumber(-25.5)).toBe('-২৫.৫');
  });
});
