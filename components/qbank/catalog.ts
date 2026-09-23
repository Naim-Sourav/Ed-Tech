import { toBengaliNumber } from '../../utils/numberUtils';

/*
 * Catalogue for the question bank's institution view.
 *
 * Admission questions are stored with a free-form `examRef` such as
 * "DU-A '23-24", "Medical 2024-25" or "gst_a_23_24". Nothing else describes
 * the paper, so this module turns those strings into structured papers
 * (institution · unit · session) and groups them for the UI. Everything here
 * is pure and side-effect free.
 */

export const bn = (value: number | string | null | undefined): string => toBengaliNumber(value);

export type Category = 'medical' | 'varsity' | 'engineering' | 'krishi' | 'others';

export const CATEGORIES: { id: Category; name: string; blurb: string }[] = [
  { id: 'varsity', name: 'বিশ্ববিদ্যালয়', blurb: 'ঢাবি, গুচ্ছ, রাবি, জাবি…' },
  { id: 'medical', name: 'মেডিকেল ও ডেন্টাল', blurb: 'MBBS, BDS, AFMC' },
  { id: 'engineering', name: 'ইঞ্জিনিয়ারিং', blurb: 'বুয়েট, চুয়েট-কুয়েট-রুয়েট…' },
  { id: 'krishi', name: 'কৃষি গুচ্ছ', blurb: 'বাকৃবি, শেকৃবি, সিকৃবি…' },
  { id: 'others', name: 'অন্যান্য', blurb: 'বাকি সব প্রতিষ্ঠান' },
];

export interface InstitutionDef {
  id: string;
  /** Bangla display name. */
  name: string;
  /** Short code shown next to the name (also the most common examRef prefix). */
  code: string;
  category: Category;
  /** Upper-cased prefixes that identify this institution inside an examRef. */
  aliases: string[];
  /** Typical negative marking per wrong answer. */
  negative: number;
  /** Rough exam pace, used to suggest a time limit for a full paper. */
  minutesPerQuestion: number;
}

const inst = (id: string, name: string, code: string, category: Category, aliases: string[], negative = 0.25, minutesPerQuestion = 1): InstitutionDef => ({
  id,
  name,
  code,
  category,
  aliases: aliases.map((a) => a.toUpperCase()),
  negative,
  minutesPerQuestion,
});

export const INSTITUTIONS: InstitutionDef[] = [
  inst('du', 'ঢাকা বিশ্ববিদ্যালয়', 'DU', 'varsity', ['DU', 'DHAKA UNIVERSITY', 'ঢাবি'], 0.25, 0.75),
  inst('gst', 'গুচ্ছ ভর্তি পরীক্ষা', 'GST', 'varsity', ['GST', 'GUCCHO', 'গুচ্ছ'], 0.25, 0.6),
  inst('ru', 'রাজশাহী বিশ্ববিদ্যালয়', 'RU', 'varsity', ['RU', 'RAJSHAHI'], 0.2, 1),
  inst('ju', 'জাহাঙ্গীরনগর বিশ্ববিদ্যালয়', 'JU', 'varsity', ['JU', 'JAHANGIRNAGAR'], 0.2, 1),
  inst('cu', 'চট্টগ্রাম বিশ্ববিদ্যালয়', 'CU', 'varsity', ['CU', 'CHITTAGONG'], 0.25, 1),
  inst('jnu', 'জগন্নাথ বিশ্ববিদ্যালয়', 'JnU', 'varsity', ['JNU', 'JAGANNATH'], 0.25, 1),
  inst('ku', 'খুলনা বিশ্ববিদ্যালয়', 'KU', 'varsity', ['KU', 'KHULNA'], 0.25, 1),
  inst('sust', 'শাহজালাল বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়', 'SUST', 'varsity', ['SUST', 'SHAHJALAL'], 0.25, 1),
  inst('just', 'যশোর বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়', 'JUST', 'varsity', ['JUST'], 0.25, 1),
  inst('mbstu', 'মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়', 'MBSTU', 'varsity', ['MBSTU'], 0.25, 1),
  inst('hstu', 'হাজী মোহাম্মদ দানেশ বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়', 'HSTU', 'varsity', ['HSTU'], 0.25, 1),
  inst('bsmrstu', 'বঙ্গবন্ধু শেখ মুজিবুর রহমান বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়', 'BSMRSTU', 'varsity', ['BSMRSTU'], 0.25, 1),
  inst('iu', 'ইসলামী বিশ্ববিদ্যালয়', 'IU', 'varsity', ['IU', 'ISLAMIC UNIVERSITY'], 0.25, 1),
  inst('bup', 'বাংলাদেশ ইউনিভার্সিটি অব প্রফেশনালস', 'BUP', 'varsity', ['BUP'], 0.25, 1),
  inst('nstu', 'নোয়াখালী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়', 'NSTU', 'varsity', ['NSTU'], 0.25, 1),
  inst('pust', 'পাবনা বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়', 'PUST', 'varsity', ['PUST'], 0.25, 1),
  inst('brur', 'বেগম রোকেয়া বিশ্ববিদ্যালয়', 'BRUR', 'varsity', ['BRUR'], 0.25, 1),
  inst('cou', 'কুমিল্লা বিশ্ববিদ্যালয়', 'CoU', 'varsity', ['COU', 'COMILLA UNIVERSITY'], 0.25, 1),
  inst('bu', 'বরিশাল বিশ্ববিদ্যালয়', 'BU', 'varsity', ['BU', 'BARISHAL UNIVERSITY'], 0.25, 1),
  inst('nu', 'জাতীয় বিশ্ববিদ্যালয়', 'NU', 'varsity', ['NU', 'NATIONAL UNIVERSITY'], 0, 1),

  inst('medical', 'মেডিকেল ভর্তি পরীক্ষা (MBBS)', 'Medical', 'medical', ['MEDICAL', 'MBBS', 'MEDI', 'মেডিকেল'], 0.25, 0.6),
  inst('dental', 'ডেন্টাল ভর্তি পরীক্ষা (BDS)', 'Dental', 'medical', ['DENTAL', 'BDS', 'ডেন্টাল'], 0.25, 0.6),
  inst('afmc', 'আর্মড ফোর্সেস মেডিকেল কলেজ', 'AFMC', 'medical', ['AFMC', 'AMC'], 0.25, 0.6),

  inst('buet', 'বাংলাদেশ প্রকৌশল বিশ্ববিদ্যালয়', 'BUET', 'engineering', ['BUET'], 0, 2),
  inst('ckruet', 'চুয়েট-কুয়েট-রুয়েট সমন্বিত', 'CKRUET', 'engineering', ['CKRUET', 'CUET-KUET-RUET'], 0, 1.5),
  inst('ruet', 'রাজশাহী প্রকৌশল ও প্রযুক্তি বিশ্ববিদ্যালয়', 'RUET', 'engineering', ['RUET'], 0, 1.5),
  inst('kuet', 'খুলনা প্রকৌশল ও প্রযুক্তি বিশ্ববিদ্যালয়', 'KUET', 'engineering', ['KUET'], 0, 1.5),
  inst('cuet', 'চট্টগ্রাম প্রকৌশল ও প্রযুক্তি বিশ্ববিদ্যালয়', 'CUET', 'engineering', ['CUET'], 0, 1.5),
  inst('butex', 'বাংলাদেশ টেক্সটাইল বিশ্ববিদ্যালয়', 'BUTex', 'engineering', ['BUTEX'], 0, 1),
  inst('iut', 'ইসলামিক ইউনিভার্সিটি অব টেকনোলজি', 'IUT', 'engineering', ['IUT'], 0, 1.5),
  inst('mist', 'মিলিটারি ইনস্টিটিউট অব সায়েন্স অ্যান্ড টেকনোলজি', 'MIST', 'engineering', ['MIST'], 0, 1.5),
  inst('duet', 'ঢাকা প্রকৌশল ও প্রযুক্তি বিশ্ববিদ্যালয়', 'DUET', 'engineering', ['DUET'], 0, 1.5),

  inst('agri', 'কৃষি গুচ্ছ ভর্তি পরীক্ষা', 'Agri', 'krishi', ['AGRI', 'AGRICULTURE', 'KRISHI', 'কৃষি'], 0.25, 1),
  inst('bau', 'বাংলাদেশ কৃষি বিশ্ববিদ্যালয়', 'BAU', 'krishi', ['BAU'], 0.25, 1),
  inst('sau', 'শেরেবাংলা কৃষি বিশ্ববিদ্যালয়', 'SAU', 'krishi', ['SAU'], 0.25, 1),
  inst('sbau', 'শেরেবাংলা কৃষি বিশ্ববিদ্যালয় (SBAU)', 'SBAU', 'krishi', ['SBAU'], 0.25, 1),
  inst('syau', 'সিলেট কৃষি বিশ্ববিদ্যালয়', 'SylAU', 'krishi', ['SYLAU', 'SYAU'], 0.25, 1),
  inst('pstu', 'পটুয়াখালী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়', 'PSTU', 'krishi', ['PSTU'], 0.25, 1),
  inst('cvasu', 'চট্টগ্রাম ভেটেরিনারি ও এনিম্যাল সাইন্সেস বিশ্ববিদ্যালয়', 'CVASU', 'krishi', ['CVASU'], 0.25, 1),
];

export const findInstitution = (id: string): InstitutionDef | undefined => INSTITUTIONS.find((i) => i.id === id);

/* ── units ────────────────────────────────────────────────────────────── */

const UNIT_LABELS: Record<string, string> = {
  A: 'ক ইউনিট',
  KA: 'ক ইউনিট',
  ক: 'ক ইউনিট',
  B: 'খ ইউনিট',
  KHA: 'খ ইউনিট',
  খ: 'খ ইউনিট',
  C: 'গ ইউনিট',
  GA: 'গ ইউনিট',
  গ: 'গ ইউনিট',
  D: 'ঘ ইউনিট',
  GHA: 'ঘ ইউনিট',
  ঘ: 'ঘ ইউনিট',
  E: 'ঙ ইউনিট',
  CHA: 'চ ইউনিট',
  চ: 'চ ইউনিট',
  IBA: 'IBA',
  SCIENCE: 'বিজ্ঞান',
  ARTS: 'মানবিক',
  COMMERCE: 'ব্যবসায় শিক্ষা',
  ENGINEERING: 'ইঞ্জিনিয়ারিং',
};

const UNIT_ORDER = ['ক ইউনিট', 'খ ইউনিট', 'গ ইউনিট', 'ঘ ইউনিট', 'ঙ ইউনিট', 'চ ইউনিট'];

export const unitLabel = (raw: string | null): string | null => {
  if (!raw) return null;
  const key = raw.replace(/unit/i, '').trim().toUpperCase();
  if (!key) return null;
  return UNIT_LABELS[key] ?? `${raw.trim()} ইউনিট`;
};

/* ── sessions ─────────────────────────────────────────────────────────── */

const toFullYear = (y: string): number => {
  const n = parseInt(y, 10);
  return y.length === 4 ? n : 2000 + n;
};

/** "2023-24" → "২০২৩-২৪", "2019" → "২০১৯". */
export const sessionLabel = (session: string | null): string => (session ? bn(session) : 'সেশন অজানা');

interface SessionMatch {
  session: string | null;
  year: number;
  rest: string;
}

/**
 * Pulls the session/year out of an examRef. Handles "'23-24", "23-24",
 * "2023-24", "2023-2024", "23_24", a bare "2019" and "'19".
 */
export const extractSession = (ref: string): SessionMatch => {
  const text = ref.replace(/_/g, ' ');
  const range = /'?(\d{4}|\d{2})\s*[-–/]\s*(\d{4}|\d{2})\b/.exec(text);
  if (range) {
    const start = toFullYear(range[1]);
    const end = range[2].length === 4 ? parseInt(range[2], 10) : toFullYear(range[2]);
    if (start >= 1990 && start <= 2100 && end >= start) {
      return { session: `${start}-${String(end).slice(2)}`, year: start, rest: text.replace(range[0], ' ') };
    }
  }
  const spaced = /'?(\d{4}|\d{2})\s+(\d{2})\b/.exec(text);
  if (spaced) {
    const start = toFullYear(spaced[1]);
    const end = toFullYear(spaced[2]);
    if (end === start + 1) return { session: `${start}-${String(end).slice(2)}`, year: start, rest: text.replace(spaced[0], ' ') };
  }
  const full = /\b((?:19|20)\d{2})\b/.exec(text);
  if (full) {
    const year = parseInt(full[1], 10);
    return { session: String(year), year, rest: text.replace(full[0], ' ') };
  }
  const short = /'(\d{2})\b/.exec(text);
  if (short) {
    const year = toFullYear(short[1]);
    return { session: String(year), year, rest: text.replace(short[0], ' ') };
  }
  return { session: null, year: 0, rest: text };
};

/* ── papers ───────────────────────────────────────────────────────────── */

export interface Paper {
  /** The raw examRef — the only key the API understands. */
  ref: string;
  institution: InstitutionDef;
  /** Raw unit token from the ref (e.g. "A", "Ka"), if any. */
  unit: string | null;
  unitLabel: string | null;
  /** "2023-24" / "2019" / null. */
  session: string | null;
  sessionLabel: string;
  /** Start year used for sorting; 0 when unknown. */
  year: number;
  /** Bundled with the app (works offline, no MongoDB ids). */
  builtin?: boolean;
  /** Question count when known up-front (builtin papers). */
  count?: number;
}

const slug = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09FF]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'unknown';

const unknownInstitution = (label: string): InstitutionDef => ({
  id: `x-${slug(label)}`,
  name: label,
  code: label,
  category: 'others',
  aliases: [label.toUpperCase()],
  negative: 0.25,
  minutesPerQuestion: 1,
});

const cleanTokens = (rest: string): string[] =>
  rest
    .replace(/\b(admission|test|exam|question|paper|session|unit|full)\b/gi, ' ')
    .replace(/[()'"]/g, ' ')
    .split(/[\s-]+/)
    .map((t) => t.trim())
    .filter(Boolean);

/** Longest alias match wins, so "CKRUET" beats "RUET" and "DUET" beats "DU". */
const matchInstitution = (tokens: string[]): { def: InstitutionDef; used: number } | null => {
  const upper = tokens.map((t) => t.toUpperCase());
  let best: { def: InstitutionDef; used: number; len: number } | null = null;
  for (const def of INSTITUTIONS) {
    for (const alias of def.aliases) {
      const parts = alias.split(' ');
      const fits = parts.every((p, i) => upper[i] === p);
      if (fits && (!best || alias.length > best.len)) best = { def, used: parts.length, len: alias.length };
    }
  }
  return best ? { def: best.def, used: best.used } : null;
};

export const parseExamRef = (ref: string): Paper => {
  const { session, year, rest } = extractSession(ref);
  const tokens = cleanTokens(rest);
  const hit = matchInstitution(tokens);
  const institution = hit ? hit.def : unknownInstitution(tokens.length ? tokens.join(' ') : ref.trim());
  const unitTokens = hit ? tokens.slice(hit.used) : [];
  const unit = unitTokens.length ? unitTokens.join(' ') : null;
  return { ref, institution, unit, unitLabel: unitLabel(unit), session, sessionLabel: sessionLabel(session), year };
};

/** "ঢাকা বিশ্ববিদ্যালয় · ক ইউনিট · ২০২৩-২৪" */
export const paperTitle = (p: Paper): string => [p.institution.name, p.unitLabel, p.session ? sessionLabel(p.session) : null].filter(Boolean).join(' · ');

/** Compact label for chips/lists: "DU · ক · ২০২৩-২৪". */
export const paperShort = (p: Paper): string =>
  [p.institution.code, p.unitLabel ? p.unitLabel.replace(' ইউনিট', '') : null, p.session ? sessionLabel(p.session) : null].filter(Boolean).join(' · ');

export interface InstitutionGroup {
  institution: InstitutionDef;
  papers: Paper[];
  /** Distinct unit labels in this institution (sorted ক→ঘ, then alphabetically). */
  units: string[];
  /** Newest session start year. */
  latest: number;
}

const sortUnits = (a: string, b: string): number => {
  const ia = UNIT_ORDER.indexOf(a);
  const ib = UNIT_ORDER.indexOf(b);
  if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  return a.localeCompare(b);
};

export const sortPapers = (papers: Paper[]): Paper[] =>
  [...papers].sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    return sortUnits(a.unitLabel ?? '', b.unitLabel ?? '');
  });

/** De-duplicates a builtin paper when the API already has the same institution · unit · session. */
const paperKey = (p: Paper): string => `${p.institution.id}|${(p.unitLabel ?? '').toLowerCase()}|${p.session ?? ''}`;

export const groupPapers = (papers: Paper[]): InstitutionGroup[] => {
  const seen = new Map<string, Paper>();
  papers.forEach((p) => {
    const key = paperKey(p);
    const existing = seen.get(key);
    if (!existing || (existing.builtin && !p.builtin)) seen.set(key, p);
  });
  const byInst = new Map<string, Paper[]>();
  seen.forEach((p) => {
    const list = byInst.get(p.institution.id) ?? [];
    list.push(p);
    byInst.set(p.institution.id, list);
  });
  const groups: InstitutionGroup[] = [];
  byInst.forEach((list) => {
    const sorted = sortPapers(list);
    const units = Array.from(new Set(sorted.map((p) => p.unitLabel).filter((u): u is string => !!u))).sort(sortUnits);
    groups.push({ institution: sorted[0].institution, papers: sorted, units, latest: sorted[0].year });
  });
  const catOrder = CATEGORIES.map((c) => c.id);
  return groups.sort((a, b) => {
    const ca = catOrder.indexOf(a.institution.category) - catOrder.indexOf(b.institution.category);
    if (ca !== 0) return ca;
    if (b.papers.length !== a.papers.length) return b.papers.length - a.papers.length;
    return b.latest - a.latest;
  });
};

export const groupsInCategory = (groups: InstitutionGroup[], category: Category | 'all'): InstitutionGroup[] =>
  category === 'all' ? groups : groups.filter((g) => g.institution.category === category);

/** Papers of one institution bucketed by session (newest first) with their units. */
export const sessionsOf = (group: InstitutionGroup): { session: string | null; label: string; papers: Paper[] }[] => {
  const buckets = new Map<string, Paper[]>();
  group.papers.forEach((p) => {
    const key = p.session ?? '';
    const list = buckets.get(key) ?? [];
    list.push(p);
    buckets.set(key, list);
  });
  return Array.from(buckets.entries())
    .map(([key, list]) => ({ session: key || null, label: sessionLabel(key || null), papers: sortPapers(list) }))
    .sort((a, b) => (b.papers[0]?.year ?? 0) - (a.papers[0]?.year ?? 0));
};

/* ── exam defaults ────────────────────────────────────────────────────── */

export interface ExamDefaults {
  minutes: number;
  negative: number;
}

/** Suggested time + negative marking for sitting a paper as a timed exam. */
export const examDefaultsFor = (p: Pick<Paper, 'institution'>, questionCount: number): ExamDefaults => {
  const raw = Math.round(questionCount * p.institution.minutesPerQuestion);
  const minutes = Math.max(5, Math.min(180, Math.ceil(raw / 5) * 5));
  return { minutes, negative: p.institution.negative };
};

/* ── builtin papers (bundled JSON) ────────────────────────────────────── */

export interface BuiltinPaper {
  ref: string;
  /** Overrides for the parsed result (the file names are not great examRefs). */
  institutionId: string;
  unit: string | null;
  session: string;
  count: number;
}

export const BUILTIN_PAPERS: BuiltinPaper[] = [
  { ref: 'gst_a_23_24', institutionId: 'gst', unit: 'A', session: '2023-24', count: 147 },
  { ref: 'builtin:medical_24_25', institutionId: 'medical', unit: null, session: '2024-25', count: 100 },
];

export const builtinPaper = (b: BuiltinPaper): Paper => {
  const institution = findInstitution(b.institutionId)!;
  return {
    ref: b.ref,
    institution,
    unit: b.unit,
    unitLabel: unitLabel(b.unit),
    session: b.session,
    sessionLabel: sessionLabel(b.session),
    year: parseInt(b.session.slice(0, 4), 10),
    builtin: true,
    count: b.count,
  };
};

export const isBuiltinRef = (ref: string): boolean => BUILTIN_PAPERS.some((b) => b.ref === ref);

/** Accepts the exam-refs endpoint in any of the shapes it has had: string[] or {examRef|ref|name}[] (optionally wrapped). */
export const normalizeRefList = (data: unknown): string[] => {
  const list = Array.isArray(data)
    ? data
    : data && typeof data === 'object'
      ? ((data as { refs?: unknown; examRefs?: unknown }).refs ?? (data as { examRefs?: unknown }).examRefs)
      : null;
  if (!Array.isArray(list)) return [];
  const out = new Set<string>();
  list.forEach((item) => {
    const value =
      typeof item === 'string'
        ? item
        : item && typeof item === 'object'
          ? ((item as { examRef?: unknown }).examRef ?? (item as { ref?: unknown }).ref ?? (item as { name?: unknown }).name ?? (item as { _id?: unknown })._id)
          : null;
    if (typeof value === 'string' && value.trim()) out.add(value.trim());
  });
  return Array.from(out);
};

/** Builds the full paper list from API refs plus the bundled papers (deduped inside groupPapers). */
export const buildPapers = (refs: string[]): Paper[] => [...refs.map(parseExamRef), ...BUILTIN_PAPERS.map(builtinPaper)];

/* ── HSC boards & colleges (academic filters) ─────────────────────────── */

export const BOARDS: { id: string; name: string }[] = [
  { id: 'DB', name: 'ঢাকা' },
  { id: 'RB', name: 'রাজশাহী' },
  { id: 'CB', name: 'কুমিল্লা' },
  { id: 'JB', name: 'যশোর' },
  { id: 'ChB', name: 'চট্টগ্রাম' },
  { id: 'BB', name: 'বরিশাল' },
  { id: 'SB', name: 'সিলেট' },
  { id: 'DiB', name: 'দিনাজপুর' },
  { id: 'MSB', name: 'ময়মনসিংহ' },
  { id: 'MB', name: 'মাদ্রাসা' },
];

export const COLLEGES: string[] = [
  'ACPSCD',
  'AMCM',
  'APBPSC',
  'BAFSC',
  'BAFSCJ',
  'BBGC',
  'BCC',
  'BCPSCB',
  'BGC',
  'BGCB',
  'BNMPC',
  'CCC',
  'CCJ',
  'CC',
  'CPSCM',
  'CPSCR',
  'CWC',
  'DC',
  'DCC',
  'DGC',
  'DRMC',
  'FCC',
  'FGC',
  'FGCC',
  'GAHC',
  'GAMCJ',
  'GBCG',
  'GCC',
  'GECP',
  'GGMC',
  'GHMMCC',
  'GSCD',
  'HLC',
  'ICD',
  'IPSCC',
  'ISCM',
  'ITHSC',
  'JCCJ',
  'JCPSC',
  'LGC',
  'MCC',
  'MCD',
  'MGCC',
  'MUVCD',
  'NDC',
  'NGC',
  'NGCN',
  'NGDCR',
  'NGVC',
  'NICK',
  'PGMC',
  'PGWC',
  'QCSC',
  'RC',
  'RCC',
  'RUMC',
  'SBULAGC',
  'SCPSC',
  'SHS',
  'SMC',
  'SSAC',
  'VNSC',
];
