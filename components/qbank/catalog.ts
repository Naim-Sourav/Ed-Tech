/*
 * Static filter catalogues for the question bank. Everything here mirrors
 * the values the backend understands on /admin/questions (admissionCategory,
 * board, college) — see backend/index.js.
 */

export type AdmissionCategory = 'medical' | 'varsity' | 'engineering' | 'krishi' | 'others';

/** Admission-level filter: which kind of institution a question was set by. */
export const ADMISSION_CATEGORIES: { id: AdmissionCategory; name: string }[] = [
  { id: 'varsity', name: 'বিশ্ববিদ্যালয়' },
  { id: 'medical', name: 'মেডিকেল ও ডেন্টাল' },
  { id: 'engineering', name: 'ইঞ্জিনিয়ারিং' },
  { id: 'krishi', name: 'কৃষি গুচ্ছ' },
  { id: 'others', name: 'অন্যান্য' },
];

export const isAdmissionCategory = (value: string | null | undefined): value is AdmissionCategory => ADMISSION_CATEGORIES.some((c) => c.id === value);

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
