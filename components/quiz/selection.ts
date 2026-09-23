import { SYLLABUS_DB, type TopicNode } from '../../services/syllabusData';
import type { QuizConfig } from '../../types';
import { toBanglaDigits } from '../../utils/phone';
import { chaptersOf, flattenTopics, groupForPaper, SUBJECT_GROUPS, type SubjectGroup } from './catalog';

/*
 * Pure selection model for the mock-test builder.
 *
 * A selection maps `"<paper>-<chapter>"` → the topics picked inside that
 * chapter. Picking a chapter means picking every topic in it, which is what
 * lets the launcher send `topics: []` ("whole chapter") to the API.
 * Everything here is immutable and side-effect free so it is easy to test.
 */

export type Selection = Record<string, string[]>;

export const keyOf = (paper: string, chapter: string): string => `${paper}-${chapter}`;

const PAPERS_BY_LENGTH = Object.keys(SYLLABUS_DB).sort((a, b) => b.length - a.length);

export const parseKey = (key: string): { paper: string; chapter: string } | null => {
  const paper = PAPERS_BY_LENGTH.find((p) => key.startsWith(`${p}-`));
  if (!paper) return null;
  return { paper, chapter: key.slice(paper.length + 1) };
};

const without = (sel: Selection, key: string): Selection => {
  if (!(key in sel)) return sel;
  const next = { ...sel };
  delete next[key];
  return next;
};

const withTopics = (sel: Selection, key: string, topics: string[]): Selection => (topics.length === 0 ? without(sel, key) : { ...sel, [key]: topics });

export type ChapterState = 'none' | 'partial' | 'full';

export const chapterState = (sel: Selection, paper: string, chapter: string): ChapterState => {
  const picked = sel[keyOf(paper, chapter)] ?? [];
  if (picked.length === 0) return 'none';
  const all = flattenTopics(paper, chapter);
  return picked.length >= all.length ? 'full' : 'partial';
};

export const toggleTopic = (sel: Selection, paper: string, chapter: string, topic: string): Selection => {
  const key = keyOf(paper, chapter);
  const current = sel[key] ?? [];
  const next = current.includes(topic) ? current.filter((t) => t !== topic) : [...current, topic];
  return withTopics(sel, key, next);
};

/** Select the whole chapter, or clear it when it is already fully selected. */
export const toggleChapter = (sel: Selection, paper: string, chapter: string): Selection => {
  const key = keyOf(paper, chapter);
  const all = flattenTopics(paper, chapter);
  return chapterState(sel, paper, chapter) === 'full' ? without(sel, key) : { ...sel, [key]: [...all] };
};

export const removeChapter = (sel: Selection, paper: string, chapter: string): Selection => without(sel, keyOf(paper, chapter));

/** Toggle a topic group (title + its sub-topics) as a unit. */
export const toggleGroup = (sel: Selection, paper: string, chapter: string, group: TopicNode): Selection => {
  const key = keyOf(paper, chapter);
  const items = [group.title, ...group.subTopics];
  const current = sel[key] ?? [];
  const fully = items.every((t) => current.includes(t));
  const next = fully ? current.filter((t) => !items.includes(t)) : Array.from(new Set([...current, ...items]));
  return withTopics(sel, key, next);
};

export const groupState = (sel: Selection, paper: string, chapter: string, group: TopicNode): ChapterState => {
  const current = sel[keyOf(paper, chapter)] ?? [];
  const items = [group.title, ...group.subTopics];
  const n = items.filter((t) => current.includes(t)).length;
  return n === 0 ? 'none' : n === items.length ? 'full' : 'partial';
};

export const isPaperFullySelected = (sel: Selection, paper: string): boolean => {
  const chapters = chaptersOf(paper);
  return chapters.length > 0 && chapters.every((c) => chapterState(sel, paper, c) === 'full');
};

/** Select every chapter of a paper, or clear the paper when it is already complete. */
export const togglePaper = (sel: Selection, paper: string): Selection => {
  const chapters = chaptersOf(paper);
  if (isPaperFullySelected(sel, paper)) {
    let next = sel;
    chapters.forEach((c) => {
      next = without(next, keyOf(paper, c));
    });
    return next;
  }
  const next = { ...sel };
  chapters.forEach((c) => {
    next[keyOf(paper, c)] = flattenTopics(paper, c);
  });
  return next;
};

export const clearPaper = (sel: Selection, paper: string): Selection => {
  let next = sel;
  chaptersOf(paper).forEach((c) => {
    next = without(next, keyOf(paper, c));
  });
  return next;
};

export interface SelectedChapter {
  paper: string;
  chapter: string;
  topics: string[];
  /** True when every topic of the chapter is picked. */
  all: boolean;
  group?: SubjectGroup;
}

/** Selected chapters in syllabus order (paper, then chapter). */
export const selectedChapters = (sel: Selection): SelectedChapter[] => {
  const out: SelectedChapter[] = [];
  Object.keys(SYLLABUS_DB).forEach((paper) => {
    Object.keys(SYLLABUS_DB[paper]).forEach((chapter) => {
      const topics = sel[keyOf(paper, chapter)];
      if (!topics || topics.length === 0) return;
      out.push({
        paper,
        chapter,
        topics,
        all: topics.length >= flattenTopics(paper, chapter).length,
        group: groupForPaper(paper),
      });
    });
  });
  return out;
};

export const countChapters = (sel: Selection): number => Object.values(sel).filter((t) => t.length > 0).length;

export const countChaptersInPaper = (sel: Selection, paper: string): number => chaptersOf(paper).filter((c) => (sel[keyOf(paper, c)] ?? []).length > 0).length;

export const countChaptersInGroup = (sel: Selection, group: SubjectGroup): number => group.papers.reduce((sum, p) => sum + countChaptersInPaper(sel, p), 0);

/** Subject groups that have at least one chapter selected, in catalogue order. */
export const selectedGroups = (sel: Selection): SubjectGroup[] => {
  const present = new Set(selectedChapters(sel).map((c) => c.group?.name));
  return SUBJECT_GROUPS.filter((g) => present.has(g.name));
};

/** Request payload for the question API — whole chapters send `topics: []`. */
export const toConfigs = (sel: Selection): QuizConfig[] =>
  selectedChapters(sel).map(({ paper, chapter, topics, all }) => ({
    subject: paper,
    chapter,
    topics: all ? [] : topics,
  }));

/** A human title for the exam, e.g. "পদার্থবিজ্ঞান · ভেক্টর" or "মিশ্র মক (৩টি বিষয়)". */
export const autoTitle = (sel: Selection): string => {
  const chapters = selectedChapters(sel);
  if (chapters.length === 0) return 'কাস্টম মক টেস্ট';
  const groups = selectedGroups(sel);
  if (groups.length > 1) return `মিশ্র মক (${toBanglaDigits(groups.length)}টি বিষয়)`;
  const subject = groups[0]?.display ?? chapters[0].paper;
  if (chapters.length === 1) return `${subject} · ${chapters[0].chapter}`;
  return `${subject} মক (${toBanglaDigits(chapters.length)}টি অধ্যায়)`;
};

/** Validates a selection loaded from storage: drops unknown papers/chapters/topics. */
export const sanitizeSelection = (raw: unknown): Selection => {
  if (!raw || typeof raw !== 'object') return {};
  const out: Selection = {};
  Object.entries(raw as Record<string, unknown>).forEach(([key, topics]) => {
    const parsed = parseKey(key);
    if (!parsed || !Array.isArray(topics)) return;
    const valid = new Set(flattenTopics(parsed.paper, parsed.chapter));
    if (valid.size === 0) return;
    const kept = (topics as unknown[]).filter((t): t is string => typeof t === 'string' && valid.has(t));
    if (kept.length > 0) out[key] = Array.from(new Set(kept));
  });
  return out;
};
