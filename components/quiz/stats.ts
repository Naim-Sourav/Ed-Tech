import { normalizeBangla } from '../../utils/normalization';
import { findGroup } from './catalog';
import { selectedChapters, type Selection } from './selection';

/*
 * Question-count lookups against the `/quiz/syllabus-stats` payload.
 * Keys in the payload are paper names → { total, chapters: { [chapter]: { total, topics: { [topic]: n } } } }.
 * Names are matched after normalisation because the DB and the static syllabus
 * differ in punctuation / Unicode composition.
 */

export interface ChapterStats {
  total?: number;
  topics?: Record<string, number>;
}

export interface PaperStats {
  total?: number;
  chapters?: Record<string, ChapterStats>;
}

export type SyllabusStats = Record<string, PaperStats>;

const norm = (text: string | undefined | null): string =>
  normalizeBangla(text ?? '')
    .replace(/[.,;:"'’|।]/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();

const paperEntries = (stats: SyllabusStats, paper: string): PaperStats[] => {
  const target = norm(paper);
  return Object.keys(stats)
    .filter((k) => norm(k) === target)
    .map((k) => stats[k])
    .filter(Boolean);
};

/** Total questions for a subject group ("Physics") or a single paper. */
export const countForSubject = (stats: SyllabusStats | null, subjectOrPaper: string): number => {
  if (!stats) return 0;
  const group = findGroup(subjectOrPaper);
  const papers = group ? group.papers : [subjectOrPaper];
  return papers.reduce((sum, p) => sum + paperEntries(stats, p).reduce((s, e) => s + (e.total ?? 0), 0), 0);
};

export const countForChapter = (stats: SyllabusStats | null, paper: string, chapter: string): number => {
  if (!stats) return 0;
  const target = norm(chapter);
  let total = 0;
  paperEntries(stats, paper).forEach((entry) => {
    Object.entries(entry.chapters ?? {}).forEach(([name, data]) => {
      if (norm(name) === target) total += data?.total ?? 0;
    });
  });
  return total;
};

export const countForTopic = (stats: SyllabusStats | null, paper: string, chapter: string, topic: string): number => {
  if (!stats) return 0;
  const chapterNorm = norm(chapter);
  const topicNorm = norm(topic);
  let total = 0;
  paperEntries(stats, paper).forEach((entry) => {
    Object.entries(entry.chapters ?? {}).forEach(([name, data]) => {
      if (norm(name) !== chapterNorm) return;
      Object.entries(data?.topics ?? {}).forEach(([t, n]) => {
        if (norm(t) === topicNorm) total += n ?? 0;
      });
    });
  });
  return total;
};

/**
 * Rough pool size for the current selection: whole chapters count fully,
 * partial chapters sum their picked topics (falling back to the chapter total
 * when the API has no per-topic breakdown).
 */
export const countForSelection = (stats: SyllabusStats | null, sel: Selection): number => {
  if (!stats) return 0;
  return selectedChapters(sel).reduce((sum, c) => {
    if (c.all) return sum + countForChapter(stats, c.paper, c.chapter);
    const topicSum = c.topics.reduce((s, t) => s + countForTopic(stats, c.paper, c.chapter, t), 0);
    return sum + (topicSum > 0 ? topicSum : countForChapter(stats, c.paper, c.chapter));
  }, 0);
};
