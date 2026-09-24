import { displaySubject } from '../exam/model';
import type { SessionSource } from './records';

/*
 * URL contract of the question bank (kept backwards compatible with the
 * links other pages and the SEO build emit):
 *
 *   /qbank                                   home (ভর্তি tab)
 *   /qbank?level=ACADEMIC|ADMISSION|MAINBOOK home with that tab open
 *   /qbank?level=X&subject=<paper>            chapter picker
 *   /qbank?level=X&subject=<paper>&chapter=<c>   questions of a chapter
 *   /qbank?level=X&subject=<paper>&scope=all  every chapter of a paper
 *   /qbank?…&admissionCategory=medical        (ভর্তি) only that kind of institution
 *   /qbank?q=<text>                           search
 *   /qbank?view=records                       records
 */

export type Level = 'ACADEMIC' | 'ADMISSION' | 'MAINBOOK';

export const LEVELS: { id: Level; label: string; blurb: string }[] = [
  { id: 'ADMISSION', label: 'ভর্তি পরীক্ষা', blurb: 'বিশ্ববিদ্যালয়, মেডিকেল, ইঞ্জিনিয়ারিং' },
  { id: 'ACADEMIC', label: 'এইচএসসি', blurb: 'বোর্ড ও কলেজ পরীক্ষা' },
  { id: 'MAINBOOK', label: 'অনুশীলনী', blurb: 'পাঠ্যবইয়ের প্রশ্ন' },
];

export const levelLabel = (level: string | null | undefined): string => LEVELS.find((l) => l.id === level)?.label ?? 'প্রশ্নব্যাংক';

export const asLevel = (value: string | null | undefined): Level => (value === 'ACADEMIC' || value === 'MAINBOOK' ? value : 'ADMISSION');

const build = (params: Record<string, string | null | undefined>): string => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) sp.set(k, v);
  });
  const qs = sp.toString();
  return `/qbank${qs ? `?${qs}` : ''}`;
};

export const hrefs = {
  home: (level?: Level | null) => build({ level: level && level !== 'ADMISSION' ? level : null }),
  subject: (level: Level, subject: string) => build({ level, subject }),
  chapter: (level: Level, subject: string, chapter: string | null) => build({ level, subject, chapter: chapter || null, scope: chapter ? null : 'all' }),
  search: (q: string, level?: Level | null) => build({ q, level: level && level !== 'ADMISSION' ? level : null }),
  records: () => build({ view: 'records' }),
};

/* ── sources ──────────────────────────────────────────────────────────── */

export const chapterSource = (level: Level, subject: string, chapter: string | null): SessionSource => ({
  kind: chapter ? 'chapter' : 'subject',
  id: `${level}|${subject}|${chapter ?? ''}`,
  title: chapter ? `${displaySubject(subject)} · ${chapter}` : `${displaySubject(subject)} · সব অধ্যায়`,
  subject,
});

export const searchSource = (q: string, level: Level | null): SessionSource => ({
  kind: 'search',
  id: `${level ?? ''}|${q}`,
  title: `খোঁজ: “${q}”`,
});

/** Where a recorded source lives, for "চালিয়ে যাও" links. */
export const hrefForSource = (source: Pick<SessionSource, 'kind' | 'id'>): string | null => {
  switch (source.kind) {
    case 'chapter':
    case 'subject': {
      const [level, subject, chapter] = source.id.split('|');
      if (!subject) return null;
      return hrefs.chapter(asLevel(level), subject, chapter || null);
    }
    case 'search': {
      const idx = source.id.indexOf('|');
      const level = idx === -1 ? '' : source.id.slice(0, idx);
      const q = idx === -1 ? source.id : source.id.slice(idx + 1);
      return q ? hrefs.search(q, level ? asLevel(level) : null) : null;
    }
    default:
      return null;
  }
};

/** "chapter:ACADEMIC|Physics 1st Paper|ভেক্টর" (a stored source id) → SessionSource-ish for hrefForSource. */
export const parseSourceId = (id: string): Pick<SessionSource, 'kind' | 'id'> | null => {
  const idx = id.indexOf(':');
  if (idx === -1) return null;
  return { kind: id.slice(0, idx) as SessionSource['kind'], id: id.slice(idx + 1) };
};
