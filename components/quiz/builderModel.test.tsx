import { describe, expect, it } from 'vitest';
import { SYLLABUS_DB } from '../../services/syllabusData';
import type { QuizQuestion } from '../../types';
import { chaptersOf, flattenTopics, paperLabel, partitionSubjects, recommendedSubjects, SUBJECT_GROUPS } from './catalog';
import { pickQuestions, readLastSetup, rememberLastSetup } from './launch';
import { applyPreset, clampCount, DEFAULT_SETTINGS, defaultSettingsFor, describeSettings, matchPreset, PRESETS, sanitizeSettings } from './presets';
import {
  autoTitle,
  chapterState,
  countChapters,
  isPaperFullySelected,
  keyOf,
  parseKey,
  sanitizeSelection,
  selectedGroups,
  toConfigs,
  toggleChapter,
  toggleGroup,
  togglePaper,
  toggleTopic,
} from './selection';
import { countForChapter, countForSelection, countForSubject } from './stats';

/* Pure model behind the mock-test builder: selection, presets, catalogue, launch helpers. */

const PHY1 = 'Physics 1st Paper';
const phyChapters = chaptersOf(PHY1);
const ch0 = phyChapters[0];
const ch1 = phyChapters[1];

describe('catalog', () => {
  it('every subject paper exists in the syllabus', () => {
    SUBJECT_GROUPS.forEach((g) => g.papers.forEach((p) => expect(SYLLABUS_DB[p], p).toBeDefined()));
  });

  it('labels papers in Bangla', () => {
    expect(paperLabel(PHY1)).toBe('১ম পত্র');
    expect(paperLabel('Physics 2nd Paper')).toBe('২য় পত্র');
    expect(paperLabel('English')).toBe('ইংরেজি');
  });

  it('recommends by target first, then department, else nothing', () => {
    expect(recommendedSubjects({ target: 'Medical' })[0]).toBe('Biology');
    expect(recommendedSubjects({ target: 'Engineering' })[0]).toBe('Physics');
    expect(recommendedSubjects({ department: 'Humanities' })).toContain('Bangla');
    expect(recommendedSubjects({ department: 'Humanities' })).not.toContain('Physics');
    expect(recommendedSubjects(null)).toEqual([]);
    const { featured, rest } = partitionSubjects({ target: 'Medical' });
    expect(featured.map((g) => g.name)).toEqual(['Biology', 'Chemistry', 'Physics', 'English', 'General Knowledge']);
    expect(featured.length + rest.length).toBe(SUBJECT_GROUPS.length);
    expect(partitionSubjects(null).rest.length).toBe(SUBJECT_GROUPS.length);
  });
});

describe('selection', () => {
  it('round-trips keys even when chapter names contain dashes', () => {
    expect(parseKey(keyOf(PHY1, 'ভেক্টর - টেস্ট'))).toEqual({ paper: PHY1, chapter: 'ভেক্টর - টেস্ট' });
    expect(parseKey('Nope-x')).toBeNull();
  });

  it('toggles whole chapters and reports tri-state', () => {
    let sel = toggleChapter({}, PHY1, ch0);
    expect(chapterState(sel, PHY1, ch0)).toBe('full');
    expect(sel[keyOf(PHY1, ch0)]).toEqual(flattenTopics(PHY1, ch0));

    const firstTopic = flattenTopics(PHY1, ch0)[0];
    sel = toggleTopic(sel, PHY1, ch0, firstTopic);
    expect(chapterState(sel, PHY1, ch0)).toBe('partial');

    sel = toggleChapter(sel, PHY1, ch0); // partial → full
    expect(chapterState(sel, PHY1, ch0)).toBe('full');
    sel = toggleChapter(sel, PHY1, ch0); // full → cleared
    expect(sel[keyOf(PHY1, ch0)]).toBeUndefined();
    expect(countChapters(sel)).toBe(0);
  });

  it('removes the key when the last topic is deselected', () => {
    const t = flattenTopics(PHY1, ch0)[0];
    const sel = toggleTopic(toggleTopic({}, PHY1, ch0, t), PHY1, ch0, t);
    expect(sel).toEqual({});
  });

  it('toggles topic groups (title + sub-topics) as one unit', () => {
    // the syllabus is currently flat, so exercise the group path with a synthetic node
    const node = { title: 'তরঙ্গ', subTopics: ['অগ্রগামী তরঙ্গ', 'স্থির তরঙ্গ'] };
    let sel = toggleGroup({}, PHY1, ch0, node);
    expect(sel[keyOf(PHY1, ch0)]).toEqual([node.title, ...node.subTopics]);
    sel = toggleTopic(sel, PHY1, ch0, node.subTopics[0]);
    expect(sel[keyOf(PHY1, ch0)]).toEqual([node.title, node.subTopics[1]]);
    sel = toggleGroup(sel, PHY1, ch0, node); // partial → full
    expect(sel[keyOf(PHY1, ch0)]).toHaveLength(3);
    sel = toggleGroup(sel, PHY1, ch0, node); // full → cleared
    expect(sel).toEqual({});
  });

  it('selects / clears a whole paper', () => {
    const sel = togglePaper({}, PHY1);
    expect(isPaperFullySelected(sel, PHY1)).toBe(true);
    expect(countChapters(sel)).toBe(phyChapters.length);
    expect(togglePaper(sel, PHY1)).toEqual({});
  });

  it('builds API configs with topics:[] for whole chapters', () => {
    const t = flattenTopics(PHY1, ch1)[0];
    const sel = toggleTopic(toggleChapter({}, PHY1, ch0), PHY1, ch1, t);
    expect(toConfigs(sel)).toEqual([
      { subject: PHY1, chapter: ch0, topics: [] },
      { subject: PHY1, chapter: ch1, topics: [t] },
    ]);
  });

  it('writes human titles', () => {
    expect(autoTitle({})).toBe('কাস্টম মক টেস্ট');
    expect(autoTitle(toggleChapter({}, PHY1, ch0))).toBe(`পদার্থবিজ্ঞান · ${ch0}`);
    expect(autoTitle(toggleChapter(toggleChapter({}, PHY1, ch0), PHY1, ch1))).toBe('পদার্থবিজ্ঞান মক (২টি অধ্যায়)');
    const mixed = toggleChapter(toggleChapter({}, PHY1, ch0), 'Chemistry 1st Paper', chaptersOf('Chemistry 1st Paper')[0]);
    expect(autoTitle(mixed)).toBe('মিশ্র মক (২টি বিষয়)');
    expect(selectedGroups(mixed).map((g) => g.name)).toEqual(['Chemistry', 'Physics']);
  });

  it('sanitises stored selections', () => {
    const t = flattenTopics(PHY1, ch0)[0];
    expect(sanitizeSelection({ [keyOf(PHY1, ch0)]: [t, 'ghost topic', 42], 'Bogus-Chapter': ['x'], junk: 'no' })).toEqual({ [keyOf(PHY1, ch0)]: [t] });
    expect(sanitizeSelection(null)).toEqual({});
  });
});

describe('presets', () => {
  it('matches and applies presets', () => {
    expect(matchPreset(DEFAULT_SETTINGS)).toBe('admission');
    const quick = PRESETS.find((p) => p.id === 'quick')!;
    const s = applyPreset(DEFAULT_SETTINGS, quick);
    expect(s).toMatchObject({ count: 10, timeLimit: 0, negativeMarking: 0, practice: true, view: 'ALL_AT_ONCE' });
    expect(matchPreset({ ...s, count: 15 })).toBeNull();
  });

  it('clamps counts to 5–50 in steps of 5', () => {
    expect(clampCount(3)).toBe(5);
    expect(clampCount(23)).toBe(25);
    expect(clampCount(999)).toBe(50);
    expect(clampCount(NaN)).toBe(DEFAULT_SETTINGS.count);
  });

  it('describes settings in Bangla and derives defaults from the profile', () => {
    expect(describeSettings(DEFAULT_SETTINGS)).toBe('২০ প্রশ্ন · ২০ মিনিট · নেগেটিভ ০.২৫');
    expect(describeSettings({ ...DEFAULT_SETTINGS, timeLimit: 0, negativeMarking: 0, practice: true })).toBe(
      '২০ প্রশ্ন · সময় নেই · নেগেটিভ নেই · প্র্যাকটিস মোড',
    );
    expect(defaultSettingsFor({ target: 'Medical' }).negativeMarking).toBe(0.25);
    expect(defaultSettingsFor({ target: null }).negativeMarking).toBe(0);
    expect(sanitizeSettings({ count: 999, negativeMarking: 0.3, view: 'nope' })).toMatchObject({ count: 50, negativeMarking: 0.25, view: 'ALL_AT_ONCE' });
  });
});

describe('stats', () => {
  const stats = {
    'Physics 1st Paper': { total: 120, chapters: { [ch0]: { total: 40, topics: { [flattenTopics(PHY1, ch0)[0]]: 7 } }, [ch1]: { total: 30 } } },
    'Physics 2nd Paper': { total: 80 },
  };

  it('sums subject groups and looks up chapters after normalisation', () => {
    expect(countForSubject(stats, 'Physics')).toBe(200);
    expect(countForSubject(stats, PHY1)).toBe(120);
    expect(countForChapter(stats, PHY1, ch0)).toBe(40);
    expect(countForChapter(stats, PHY1, `${ch0} `)).toBe(40);
    expect(countForSubject(null, 'Physics')).toBe(0);
  });

  it('estimates the pool for a selection (topics for partial chapters)', () => {
    const t = flattenTopics(PHY1, ch0)[0];
    const sel = toggleTopic(toggleChapter({}, PHY1, ch1), PHY1, ch0, t);
    expect(countForSelection(stats, sel)).toBe(30 + 7);
  });
});

describe('launch', () => {
  const q = (id: string, extra: Partial<QuizQuestion> = {}): QuizQuestion => ({
    id,
    question: `Q${id}`,
    options: ['a', 'b', 'c', 'd'],
    correctAnswerIndex: 0,
    explanation: '',
    ...extra,
  });

  it('de-duplicates and keeps stimulus sets whole', () => {
    const pool = [q('1'), q('1'), q('2', { contextText: 'P' }), q('3', { contextText: 'P' }), q('4'), q('5'), q('6')];
    const picked = pickQuestions(pool, 4, () => 0.42);
    expect(picked).toHaveLength(4);
    const ids = picked.map((x) => x.id);
    expect(new Set(ids).size).toBe(4);
    expect(ids.includes('2')).toBe(ids.includes('3')); // never half a passage
  });

  it('never returns more than asked and tolerates tiny pools', () => {
    expect(pickQuestions([q('1'), q('2')], 10)).toHaveLength(2);
    expect(pickQuestions([], 10)).toEqual([]);
  });

  it('remembers and validates the last setup', () => {
    localStorage.clear();
    expect(readLastSetup()).toBeNull();
    rememberLastSetup({ selection: toggleChapter({}, PHY1, ch0), settings: DEFAULT_SETTINGS, title: 'x' });
    const last = readLastSetup();
    expect(last?.selection[keyOf(PHY1, ch0)]).toEqual(flattenTopics(PHY1, ch0));
    expect(last?.settings).toEqual(DEFAULT_SETTINGS);
    localStorage.setItem('pk_quiz_last_setup_v1', JSON.stringify({ selection: { 'Bogus-x': ['a'] } }));
    expect(readLastSetup()).toBeNull();
  });
});
