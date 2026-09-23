import { describe, expect, it } from 'vitest';
import {
  BUILTIN_PAPERS,
  buildPapers,
  builtinPaper,
  examDefaultsFor,
  extractSession,
  groupPapers,
  groupsInCategory,
  normalizeRefList,
  paperShort,
  paperTitle,
  parseExamRef,
  sessionsOf,
  unitLabel,
} from './catalog';

describe('extractSession', () => {
  it.each([
    ["DU-A '23-24", '2023-24', 2023],
    ['Medical 2024-25', '2024-25', 2024],
    ['gst_a_23_24', '2023-24', 2023],
    ['BUET 2023', '2023', 2023],
    ['CKRUET-Ka 2022-2023', '2022-23', 2022],
    ["JU-A '19", '2019', 2019],
  ])('%s → %s', (ref, session, year) => {
    const r = extractSession(ref);
    expect(r.session).toBe(session);
    expect(r.year).toBe(year);
  });

  it('returns null when there is no year', () => {
    expect(extractSession('DU-A').session).toBeNull();
  });
});

describe('parseExamRef', () => {
  it('recognises institution, unit and session', () => {
    const p = parseExamRef("DU-A '23-24");
    expect(p.institution.id).toBe('du');
    expect(p.unitLabel).toBe('ক ইউনিট');
    expect(p.session).toBe('2023-24');
    expect(paperTitle(p)).toBe('ঢাকা বিশ্ববিদ্যালয় · ক ইউনিট · ২০২৩-২৪');
    expect(paperShort(p)).toBe('DU · ক · ২০২৩-২৪');
  });

  it('prefers the longest alias so CKRUET does not become RUET and DUET does not become DU', () => {
    expect(parseExamRef("CKRUET-Ka '23-24").institution.id).toBe('ckruet');
    expect(parseExamRef('DUET 2022').institution.id).toBe('duet');
    expect(parseExamRef('Dhaka University B 2021').institution.id).toBe('du');
  });

  it('handles papers without a unit', () => {
    const p = parseExamRef("Medical '23-24");
    expect(p.institution.id).toBe('medical');
    expect(p.unit).toBeNull();
    expect(paperTitle(p)).toBe('মেডিকেল ভর্তি পরীক্ষা (MBBS) · ২০২৩-২৪');
  });

  it('falls back to an "others" institution for unknown refs', () => {
    const p = parseExamRef('Dhaka Board 2023');
    expect(p.institution.category).toBe('others');
    expect(p.institution.name).toBe('Dhaka Board');
    expect(p.session).toBe('2023');
  });

  it('maps unit spellings to Bangla labels', () => {
    expect(unitLabel('Ka')).toBe('ক ইউনিট');
    expect(unitLabel('D')).toBe('ঘ ইউনিট');
    expect(unitLabel('IBA')).toBe('IBA');
    expect(unitLabel(null)).toBeNull();
  });
});

describe('groupPapers', () => {
  const papers = buildPapers(["DU-A '23-24", "DU-A '22-23", "DU-B '23-24", "Medical '23-24", 'BUET 2023', "GST-A '23-24"]);

  it('groups by institution, newest session first, and orders categories varsity → medical → engineering', () => {
    const groups = groupPapers(papers);
    expect(groups.map((g) => g.institution.id)).toEqual(['du', 'gst', 'medical', 'buet']);
    const du = groups[0];
    expect(du.papers.map((p) => p.ref)).toEqual(["DU-A '23-24", "DU-B '23-24", "DU-A '22-23"]);
    expect(du.units).toEqual(['ক ইউনিট', 'খ ইউনিট']);
  });

  it('drops a bundled paper when the API already has the same paper', () => {
    const gst = groupPapers(papers).find((g) => g.institution.id === 'gst')!;
    expect(gst.papers).toHaveLength(1);
    expect(gst.papers[0].builtin).toBeUndefined();
  });

  it('keeps bundled papers that the API lacks', () => {
    const groups = groupPapers(buildPapers([]));
    expect(groups.map((g) => g.institution.id).sort()).toEqual(['gst', 'medical']);
    expect(groups.every((g) => g.papers.every((p) => p.builtin))).toBe(true);
  });

  it('filters by category', () => {
    const groups = groupPapers(papers);
    expect(groupsInCategory(groups, 'engineering').map((g) => g.institution.id)).toEqual(['buet']);
    expect(groupsInCategory(groups, 'all')).toHaveLength(4);
  });

  it('buckets papers by session', () => {
    const du = groupPapers(papers)[0];
    const sessions = sessionsOf(du);
    expect(sessions.map((s) => s.label)).toEqual(['২০২৩-২৪', '২০২২-২৩']);
    expect(sessions[0].papers.map((p) => p.unitLabel)).toEqual(['ক ইউনিট', 'খ ইউনিট']);
  });
});

describe('examDefaultsFor', () => {
  it('scales time by the institution pace and rounds up to 5 minutes', () => {
    expect(examDefaultsFor(parseExamRef("DU-A '23-24"), 60)).toEqual({ minutes: 45, negative: 0.25 });
    expect(examDefaultsFor(parseExamRef('BUET 2023'), 40)).toEqual({ minutes: 80, negative: 0 });
    expect(examDefaultsFor(parseExamRef("Medical '23-24"), 100)).toEqual({ minutes: 60, negative: 0.25 });
  });
});

describe('normalizeRefList', () => {
  it('accepts strings, objects and wrapped lists', () => {
    expect(normalizeRefList(['A', ' B ', 'A'])).toEqual(['A', 'B']);
    expect(normalizeRefList([{ examRef: 'X' }, { ref: 'Y' }, { name: 'Z' }])).toEqual(['X', 'Y', 'Z']);
    expect(normalizeRefList({ refs: ['Q'] })).toEqual(['Q']);
    expect(normalizeRefList(null)).toEqual([]);
  });
});

describe('builtin papers', () => {
  it('describe the bundled JSON files', () => {
    const list = BUILTIN_PAPERS.map(builtinPaper);
    expect(list.map((p) => p.institution.id)).toEqual(['gst', 'medical']);
    expect(list[0].count).toBe(147);
    expect(list[1].sessionLabel).toBe('২০২৪-২৫');
  });
});
