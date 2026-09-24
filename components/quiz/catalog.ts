import type { LucideIcon } from 'lucide-react';
import { Atom, Beaker, Book, BrainCircuit, Calculator, Cpu, Dna, Globe, Languages } from 'lucide-react';
import { SYLLABUS_DB, type SyllabusItem } from '../../services/syllabusData';
import { uniqueByNormalization } from '../../utils/normalization';

/*
 * Static catalogue for the mock-test builder: how the raw SYLLABUS_DB papers
 * are grouped into subjects, how they are labelled, and which subjects we
 * surface first for a given student profile.
 */

export interface SubjectGroup {
  /** Stable id used in URLs and `location.state.subject` (e.g. "Physics"). */
  name: string;
  /** Bangla display name. */
  display: string;
  /** Short English label shown under the Bangla name. */
  subDisplay: string;
  /** Accent hue (0–360) for the subject tile. */
  hue: number;
  icon: LucideIcon;
  /** Keys into SYLLABUS_DB. */
  papers: string[];
}

export const SUBJECT_GROUPS: SubjectGroup[] = [
  { name: 'Biology', display: 'জীববিজ্ঞান', subDisplay: 'Biology', hue: 150, icon: Dna, papers: ['Biology 1st Paper', 'Biology 2nd Paper'] },
  { name: 'Chemistry', display: 'রসায়ন', subDisplay: 'Chemistry', hue: 38, icon: Beaker, papers: ['Chemistry 1st Paper', 'Chemistry 2nd Paper'] },
  { name: 'Physics', display: 'পদার্থবিজ্ঞান', subDisplay: 'Physics', hue: 18, icon: Atom, papers: ['Physics 1st Paper', 'Physics 2nd Paper'] },
  {
    name: 'Higher Math',
    display: 'উচ্চতর গণিত',
    subDisplay: 'Higher Math',
    hue: 218,
    icon: Calculator,
    papers: ['Higher Math 1st Paper', 'Higher Math 2nd Paper'],
  },
  { name: 'English', display: 'ইংরেজি', subDisplay: 'English', hue: 262, icon: Languages, papers: ['English'] },
  { name: 'Bangla', display: 'বাংলা', subDisplay: 'Bangla', hue: 348, icon: Book, papers: ['Bangla 1st Paper', 'Bangla 2nd Paper'] },
  { name: 'ICT', display: 'তথ্য ও যোগাযোগ প্রযুক্তি', subDisplay: 'ICT', hue: 192, icon: Cpu, papers: ['ICT'] },
  { name: 'General Knowledge', display: 'সাধারণ জ্ঞান', subDisplay: 'GK', hue: 46, icon: Globe, papers: ['General Knowledge'] },
  { name: 'Mental Ability', display: 'মানসিক দক্ষতা', subDisplay: 'Mental Ability', hue: 290, icon: BrainCircuit, papers: ['Mental Ability'] },
];

export const findGroup = (name?: string | null): SubjectGroup | undefined => (name ? SUBJECT_GROUPS.find((g) => g.name === name) : undefined);

export const groupForPaper = (paper: string): SubjectGroup | undefined => SUBJECT_GROUPS.find((g) => g.papers.includes(paper));

/** "Physics 1st Paper" → "১ম পত্র"; single-paper subjects return the subject name. */
export const paperLabel = (paper: string): string => {
  if (/1st/i.test(paper)) return '১ম পত্র';
  if (/2nd/i.test(paper)) return '২য় পত্র';
  return groupForPaper(paper)?.display ?? paper;
};

/** Short label used inside summaries: "পদার্থবিজ্ঞান ১ম". */
export const paperShortLabel = (paper: string): string => {
  const group = groupForPaper(paper);
  const display = group?.display ?? paper;
  if (/1st/i.test(paper)) return `${display} ১ম`;
  if (/2nd/i.test(paper)) return `${display} ২য়`;
  return display;
};

export const chaptersOf = (paper: string): string[] => uniqueByNormalization(Object.keys(SYLLABUS_DB[paper] ?? {}));

export const topicsOf = (paper: string, chapter: string): SyllabusItem[] => SYLLABUS_DB[paper]?.[chapter] ?? [];

/** Every selectable topic string in a chapter (group titles + their sub-topics). */
export const flattenTopics = (paper: string, chapter: string): string[] => {
  const out: string[] = [];
  topicsOf(paper, chapter).forEach((item) => {
    if (typeof item === 'string') out.push(item);
    else {
      out.push(item.title);
      item.subTopics.forEach((s) => out.push(s));
    }
  });
  return out;
};

/* ── Personalised ordering ─────────────────────────────────────────────── */

const BY_TARGET: Record<string, string[]> = {
  Medical: ['Biology', 'Chemistry', 'Physics', 'English', 'General Knowledge'],
  Engineering: ['Physics', 'Higher Math', 'Chemistry', 'English'],
  Varsity: ['Physics', 'Chemistry', 'Higher Math', 'Biology', 'English', 'Bangla'],
  Agriculture: ['Biology', 'Chemistry', 'Physics', 'Higher Math', 'English'],
};

const BY_DEPARTMENT: Record<string, string[]> = {
  Science: ['Physics', 'Chemistry', 'Biology', 'Higher Math', 'English', 'Bangla', 'ICT'],
  Humanities: ['Bangla', 'English', 'ICT', 'General Knowledge', 'Mental Ability'],
  'Business Studies': ['Bangla', 'English', 'ICT', 'General Knowledge', 'Mental Ability'],
};

export interface ProfileHint {
  target?: string | null;
  department?: string | null;
}

/** Subject ids to surface first ("তোমার জন্য"), in priority order. */
export const recommendedSubjects = (profile?: ProfileHint | null): string[] => {
  if (!profile) return [];
  if (profile.target && BY_TARGET[profile.target]) return BY_TARGET[profile.target];
  if (profile.department && BY_DEPARTMENT[profile.department]) return BY_DEPARTMENT[profile.department];
  return [];
};

/** Splits the catalogue into a recommended list (ordered) and the rest. */
export const partitionSubjects = (profile?: ProfileHint | null): { featured: SubjectGroup[]; rest: SubjectGroup[] } => {
  const ids = recommendedSubjects(profile);
  const featured = ids.map((id) => findGroup(id)).filter((g): g is SubjectGroup => !!g);
  const rest = SUBJECT_GROUPS.filter((g) => !ids.includes(g.name));
  return { featured, rest };
};
