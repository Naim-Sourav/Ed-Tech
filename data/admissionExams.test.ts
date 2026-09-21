import { describe, it, expect } from 'vitest';
import {
  ADMISSION_EXAMS,
  candidateSessions,
  findAdmissionExam,
  parseSessionSlug,
  sessionLabelBn,
  sessionSlug,
  sessionTag,
  subjectBase,
  subjectLabelBn,
  subjectRank,
} from './admissionExams';

describe('admission exam catalogue', () => {
  it('builds the exact DB tag for a sitting', () => {
    expect(sessionTag('Medical', 2021)).toBe("Medical '21-22");
    expect(sessionTag('DU-A', 2023)).toBe("DU-A '23-24");
    expect(sessionTag('Medical', 2009)).toBe("Medical '09-10");
  });

  it('round-trips URL session segments', () => {
    expect(sessionSlug(2021)).toBe('2021-22');
    expect(parseSessionSlug('2021-22')).toBe(2021);
    expect(parseSessionSlug('2021-23')).toBeNull();
    expect(parseSessionSlug('21-22')).toBeNull();
    expect(parseSessionSlug('')).toBeNull();
  });

  it('renders Bengali session labels', () => {
    expect(sessionLabelBn(2021)).toBe('২০২১-২২');
  });

  it('lists candidate sessions newest first, back to 2010-11', () => {
    const years = candidateSessions(new Date('2026-09-21'));
    expect(years[0]).toBe(2026);
    expect(years[years.length - 1]).toBe(2010);
    expect(years).toEqual([...years].sort((a, b) => b - a));
  });

  it('has unique ids and tag prefixes', () => {
    const ids = ADMISSION_EXAMS.map((e) => e.id);
    const tags = ADMISSION_EXAMS.map((e) => e.tagPrefix);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(tags).size).toBe(tags.length);
    ids.forEach((id) => expect(id).toMatch(/^[a-z0-9-]+$/));
    expect(findAdmissionExam('MEDICAL')?.tagPrefix).toBe('Medical');
    expect(findAdmissionExam('nope')).toBeUndefined();
  });

  it('maps DB subject names to Bengali labels', () => {
    expect(subjectLabelBn('Chemistry 2nd Paper')).toBe('রসায়ন ২য় পত্র');
    expect(subjectLabelBn('Biology 1st Paper')).toBe('জীববিজ্ঞান ১ম পত্র');
    expect(subjectLabelBn('General Knowledge')).toBe('সাধারণ জ্ঞান');
    expect(subjectLabelBn('Something Else')).toBe('Something Else');
    expect(subjectBase('Physics 1st Paper')).toBe('Physics');
  });

  it('orders a medical paper Biology → Chemistry → Physics → English → GK', () => {
    const medical = findAdmissionExam('medical')!;
    const order = ['Biology 2nd Paper', 'English', 'Physics 1st Paper', 'Chemistry 1st Paper', 'General Knowledge', 'Biology 1st Paper']
      .sort((a, b) => subjectRank(a, medical.subjectOrder) - subjectRank(b, medical.subjectOrder));
    expect(order).toEqual(['Biology 1st Paper', 'Biology 2nd Paper', 'Chemistry 1st Paper', 'Physics 1st Paper', 'English', 'General Knowledge']);
  });
});
