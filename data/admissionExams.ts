/**
 * Admission exam catalogue shared by
 *   • scripts/generate-seo-pages.mjs  → static /admission-questions/** pages
 *   • components/PastPaperPage.tsx    → in-app (runtime) fallback for the same URLs
 *
 * Questions of a specific exam sitting are filtered server-side through the
 * question bank's `board` param, which is an exact tag match. Tags follow the
 * scheme `<tagPrefix> 'YY-YY`, e.g. "Medical '21-22".
 */

export type AdmissionCategory = 'medical' | 'varsity' | 'engineering' | 'krishi' | 'others';

export interface AdmissionExamDef {
  /** URL slug → /admission-questions/<id>/ */
  id: string;
  /** Tag prefix used in the database, e.g. "Medical" → "Medical '21-22" */
  tagPrefix: string;
  /** Full Bengali name used in headings, e.g. "মেডিকেল (MBBS) ভর্তি পরীক্ষা" */
  nameBn: string;
  /** English name for bilingual titles / search phrases */
  nameEn: string;
  /** Short label for chips & breadcrumbs */
  shortBn: string;
  category: AdmissionCategory;
  /** Neutral one-paragraph intro (no invented statistics) */
  descriptionBn: string;
  /** Well-known, stable exam format facts; omitted when not certain */
  formatBn?: string[];
  /** Preferred subject order for grouping a paper */
  subjectOrder?: string[];
  /** Ordering weight in the hub (lower = earlier) */
  priority: number;
}

/** Oldest academic session we probe for (inclusive): 2010-11. */
export const SESSION_START_YEAR = 2010;
/** Newest academic session we probe for: the current calendar year (e.g. 2026 → "2026-27"). */
export const sessionEndYear = (now = new Date()): number => now.getFullYear();

const yy = (year: number) => String(year).slice(-2);

/** "Medical" + 2021 → "Medical '21-22" (exact DB tag) */
export const sessionTag = (tagPrefix: string, startYear: number): string =>
  `${tagPrefix} '${yy(startYear)}-${yy(startYear + 1)}`;

/** 2021 → "2021-22" (URL segment) */
export const sessionSlug = (startYear: number): string => `${startYear}-${yy(startYear + 1)}`;

/** "2021-22" → 2021, or null when the segment is malformed */
export const parseSessionSlug = (slug: string): number | null => {
  const m = /^(\d{4})-(\d{2})$/.exec(String(slug || ''));
  if (!m) return null;
  const start = Number(m[1]);
  return yy(start + 1) === m[2] ? start : null;
};

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
export const toBnDigits = (value: string | number): string =>
  String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);

/** 2021 → "২০২১-২২" */
export const sessionLabelBn = (startYear: number): string => toBnDigits(sessionSlug(startYear));

/** All candidate sessions, newest first. */
export const candidateSessions = (now = new Date()): number[] => {
  const out: number[] = [];
  for (let y = sessionEndYear(now); y >= SESSION_START_YEAR; y--) out.push(y);
  return out;
};

export const CATEGORY_LABELS_BN: Record<AdmissionCategory, string> = {
  medical: 'মেডিকেল ও ডেন্টাল',
  varsity: 'বিশ্ববিদ্যালয়',
  engineering: 'ইঞ্জিনিয়ারিং',
  krishi: 'কৃষি',
  others: 'অন্যান্য',
};

const MEDICAL_FORMAT = [
  '১০০টি MCQ, মোট ১০০ নম্বর, সময় ১ ঘণ্টা।',
  'বিষয়ভিত্তিক মানবণ্টন: জীববিজ্ঞান ৩০, রসায়ন ২৫, পদার্থবিজ্ঞান ২০, ইংরেজি ১৫, সাধারণ জ্ঞান ১০।',
  'প্রতিটি ভুল উত্তরের জন্য ০.২৫ নম্বর কাটা যায়।',
];

const SCIENCE_ORDER = ['Physics', 'Chemistry', 'Higher Math', 'Biology', 'Bangla', 'English', 'ICT', 'General Knowledge'];
const ENGINEERING_ORDER = ['Higher Math', 'Physics', 'Chemistry', 'English', 'Bangla'];
const MEDICAL_ORDER = ['Biology', 'Chemistry', 'Physics', 'English', 'General Knowledge'];
const KRISHI_ORDER = ['Biology', 'Chemistry', 'Physics', 'Higher Math', 'English', 'Bangla'];

export const ADMISSION_EXAMS: AdmissionExamDef[] = [
  {
    id: 'medical',
    tagPrefix: 'Medical',
    nameBn: 'মেডিকেল (MBBS) ভর্তি পরীক্ষা',
    nameEn: 'Medical (MBBS) Admission Test',
    shortBn: 'মেডিকেল',
    category: 'medical',
    descriptionBn:
      'সরকারি ও বেসরকারি মেডিকেল কলেজে MBBS কোর্সে ভর্তির জন্য স্বাস্থ্য শিক্ষা অধিদপ্তরের অধীনে প্রতি বছর একটি কেন্দ্রীয় MCQ পরীক্ষা অনুষ্ঠিত হয়। বিগত বছরের প্রশ্ন সলভ করলে প্রশ্নের ধরন, বারবার আসা টপিক ও সময় ব্যবস্থাপনা — তিনটাই আয়ত্তে আসে।',
    formatBn: MEDICAL_FORMAT,
    subjectOrder: MEDICAL_ORDER,
    priority: 1,
  },
  {
    id: 'dental',
    tagPrefix: 'Dental',
    nameBn: 'ডেন্টাল (BDS) ভর্তি পরীক্ষা',
    nameEn: 'Dental (BDS) Admission Test',
    shortBn: 'ডেন্টাল',
    category: 'medical',
    descriptionBn:
      'সরকারি ও বেসরকারি ডেন্টাল কলেজ/ইউনিটে BDS কোর্সে ভর্তির কেন্দ্রীয় MCQ পরীক্ষা। সিলেবাস ও প্রশ্নের ধরন মেডিকেল ভর্তি পরীক্ষার মতোই, তাই দুটি পরীক্ষার বিগত প্রশ্ন একসাথে অনুশীলন করা সবচেয়ে কার্যকর।',
    formatBn: MEDICAL_FORMAT,
    subjectOrder: MEDICAL_ORDER,
    priority: 2,
  },
  {
    id: 'du-a',
    tagPrefix: 'DU-A',
    nameBn: 'ঢাকা বিশ্ববিদ্যালয় ক-ইউনিট (বিজ্ঞান) ভর্তি পরীক্ষা',
    nameEn: 'Dhaka University A Unit (Science) Admission Test',
    shortBn: 'ঢাবি ক-ইউনিট',
    category: 'varsity',
    descriptionBn:
      'ঢাকা বিশ্ববিদ্যালয়ের বিজ্ঞান ইউনিটে (ক-ইউনিট) ভর্তির জন্য পদার্থবিজ্ঞান, রসায়ন, গণিত ও জীববিজ্ঞানভিত্তিক প্রশ্ন করা হয়। বিগত বছরের প্রশ্ন সলভ করে প্রশ্নের গভীরতা ও ধরন বুঝে নাও।',
    subjectOrder: SCIENCE_ORDER,
    priority: 3,
  },
  {
    id: 'buet',
    tagPrefix: 'BUET',
    nameBn: 'বুয়েট (BUET) ভর্তি পরীক্ষা',
    nameEn: 'BUET Admission Test',
    shortBn: 'বুয়েট',
    category: 'engineering',
    descriptionBn:
      'বাংলাদেশ প্রকৌশল বিশ্ববিদ্যালয়ে (BUET) ভর্তির জন্য গণিত, পদার্থবিজ্ঞান ও রসায়নের গভীর ধারণা যাচাই করা হয়। বিগত বছরের প্রশ্ন সমাধান করে প্রস্তুতির মান যাচাই করো।',
    subjectOrder: ENGINEERING_ORDER,
    priority: 4,
  },
  {
    id: 'ckruet',
    tagPrefix: 'CKRUET-Ka',
    nameBn: 'চুয়েট-কুয়েট-রুয়েট (CKRUET) সমন্বিত ভর্তি পরীক্ষা — ক গ্রুপ',
    nameEn: 'CKRUET Combined Engineering Admission Test (Group Ka)',
    shortBn: 'CKRUET',
    category: 'engineering',
    descriptionBn:
      'চট্টগ্রাম, খুলনা ও রাজশাহী প্রকৌশল ও প্রযুক্তি বিশ্ববিদ্যালয়ের সমন্বিত ভর্তি পরীক্ষার (ক গ্রুপ) বিগত বছরের প্রশ্ন ও সমাধান।',
    subjectOrder: ENGINEERING_ORDER,
    priority: 5,
  },
  {
    id: 'gst-a',
    tagPrefix: 'GST-A',
    nameBn: 'গুচ্ছ (GST) ক-ইউনিট ভর্তি পরীক্ষা',
    nameEn: 'GST (Cluster) A Unit Admission Test',
    shortBn: 'গুচ্ছ ক-ইউনিট',
    category: 'varsity',
    descriptionBn:
      'সাধারণ ও বিজ্ঞান-প্রযুক্তি বিশ্ববিদ্যালয়সমূহের গুচ্ছভুক্ত (GST) সমন্বিত ভর্তি পরীক্ষার বিজ্ঞান শাখার (ক-ইউনিট) বিগত বছরের প্রশ্ন ও ব্যাখ্যাসহ সমাধান।',
    subjectOrder: SCIENCE_ORDER,
    priority: 6,
  },
  {
    id: 'ruet',
    tagPrefix: 'RUET',
    nameBn: 'রুয়েট (RUET) ভর্তি পরীক্ষা',
    nameEn: 'RUET Admission Test',
    shortBn: 'রুয়েট',
    category: 'engineering',
    descriptionBn: 'রাজশাহী প্রকৌশল ও প্রযুক্তি বিশ্ববিদ্যালয়ের (RUET) বিগত বছরের ভর্তি পরীক্ষার প্রশ্ন ও সমাধান।',
    subjectOrder: ENGINEERING_ORDER,
    priority: 7,
  },
  {
    id: 'butex',
    tagPrefix: 'BUTex',
    nameBn: 'বুটেক্স (BUTex) ভর্তি পরীক্ষা',
    nameEn: 'BUTex Admission Test',
    shortBn: 'বুটেক্স',
    category: 'engineering',
    descriptionBn: 'বাংলাদেশ টেক্সটাইল বিশ্ববিদ্যালয়ের (BUTex) বিগত বছরের ভর্তি পরীক্ষার প্রশ্ন ও সমাধান।',
    subjectOrder: ENGINEERING_ORDER,
    priority: 8,
  },
  {
    id: 'jnu-a',
    tagPrefix: 'JnU-A',
    nameBn: 'জগন্নাথ বিশ্ববিদ্যালয় ক-ইউনিট ভর্তি পরীক্ষা',
    nameEn: 'Jagannath University A Unit Admission Test',
    shortBn: 'জবি ক-ইউনিট',
    category: 'varsity',
    descriptionBn: 'জগন্নাথ বিশ্ববিদ্যালয়ের বিজ্ঞান শাখার (ক-ইউনিট) বিগত বছরের ভর্তি পরীক্ষার প্রশ্ন ও সমাধান।',
    subjectOrder: SCIENCE_ORDER,
    priority: 9,
  },
  {
    id: 'cu-a',
    tagPrefix: 'CU-A',
    nameBn: 'চট্টগ্রাম বিশ্ববিদ্যালয় ক-ইউনিট ভর্তি পরীক্ষা',
    nameEn: 'Chittagong University A Unit Admission Test',
    shortBn: 'চবি ক-ইউনিট',
    category: 'varsity',
    descriptionBn: 'চট্টগ্রাম বিশ্ববিদ্যালয়ের বিজ্ঞান শাখার (ক-ইউনিট) বিগত বছরের ভর্তি পরীক্ষার প্রশ্ন ও সমাধান।',
    subjectOrder: SCIENCE_ORDER,
    priority: 10,
  },
  {
    id: 'ku-a',
    tagPrefix: 'KU-A',
    nameBn: 'খুলনা বিশ্ববিদ্যালয় ক-ইউনিট ভর্তি পরীক্ষা',
    nameEn: 'Khulna University A Unit Admission Test',
    shortBn: 'খুবি ক-ইউনিট',
    category: 'varsity',
    descriptionBn: 'খুলনা বিশ্ববিদ্যালয়ের বিজ্ঞান, প্রকৌশল ও প্রযুক্তি স্কুলের (ক-ইউনিট) বিগত বছরের ভর্তি পরীক্ষার প্রশ্ন ও সমাধান।',
    subjectOrder: SCIENCE_ORDER,
    priority: 11,
  },
  {
    id: 'ru-c',
    tagPrefix: 'RU-C',
    nameBn: 'রাজশাহী বিশ্ববিদ্যালয় সি-ইউনিট (বিজ্ঞান) ভর্তি পরীক্ষা',
    nameEn: 'Rajshahi University C Unit (Science) Admission Test',
    shortBn: 'রাবি সি-ইউনিট',
    category: 'varsity',
    descriptionBn: 'রাজশাহী বিশ্ববিদ্যালয়ের বিজ্ঞান শাখার (সি-ইউনিট) বিগত বছরের ভর্তি পরীক্ষার প্রশ্ন ও সমাধান।',
    subjectOrder: SCIENCE_ORDER,
    priority: 12,
  },
  {
    id: 'just-c',
    tagPrefix: 'JUST-C',
    nameBn: 'যশোর বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় (JUST) সি-ইউনিট ভর্তি পরীক্ষা',
    nameEn: 'JUST C Unit Admission Test',
    shortBn: 'যবিপ্রবি সি-ইউনিট',
    category: 'varsity',
    descriptionBn: 'যশোর বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের সি-ইউনিটের বিগত বছরের ভর্তি পরীক্ষার প্রশ্ন ও সমাধান।',
    subjectOrder: SCIENCE_ORDER,
    priority: 13,
  },
  {
    id: 'sust-b',
    tagPrefix: 'SUST-B',
    nameBn: 'শাহজালাল বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় (SUST) বি-ইউনিট ভর্তি পরীক্ষা',
    nameEn: 'SUST B Unit Admission Test',
    shortBn: 'শাবিপ্রবি বি-ইউনিট',
    category: 'varsity',
    descriptionBn: 'শাহজালাল বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের বি-ইউনিটের বিগত বছরের ভর্তি পরীক্ষার প্রশ্ন ও সমাধান।',
    subjectOrder: SCIENCE_ORDER,
    priority: 14,
  },
  {
    id: 'mbstu-a',
    tagPrefix: 'MBSTU-A',
    nameBn: 'মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় (MBSTU) ক-ইউনিট ভর্তি পরীক্ষা',
    nameEn: 'MBSTU A Unit Admission Test',
    shortBn: 'মাভাবিপ্রবি ক-ইউনিট',
    category: 'varsity',
    descriptionBn: 'মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের ক-ইউনিটের বিগত বছরের ভর্তি পরীক্ষার প্রশ্ন ও সমাধান।',
    subjectOrder: SCIENCE_ORDER,
    priority: 15,
  },
  {
    id: 'hstu-a',
    tagPrefix: 'HSTU-A',
    nameBn: 'হাজী মোহাম্মদ দানেশ বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় (HSTU) এ-ইউনিট ভর্তি পরীক্ষা',
    nameEn: 'HSTU A Unit Admission Test',
    shortBn: 'হাবিপ্রবি এ-ইউনিট',
    category: 'varsity',
    descriptionBn: 'হাজী মোহাম্মদ দানেশ বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের এ-ইউনিটের বিগত বছরের ভর্তি পরীক্ষার প্রশ্ন ও সমাধান।',
    subjectOrder: SCIENCE_ORDER,
    priority: 16,
  },
  {
    id: 'hstu-b',
    tagPrefix: 'HSTU-B',
    nameBn: 'হাজী মোহাম্মদ দানেশ বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় (HSTU) বি-ইউনিট ভর্তি পরীক্ষা',
    nameEn: 'HSTU B Unit Admission Test',
    shortBn: 'হাবিপ্রবি বি-ইউনিট',
    category: 'varsity',
    descriptionBn: 'হাজী মোহাম্মদ দানেশ বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের বি-ইউনিটের বিগত বছরের ভর্তি পরীক্ষার প্রশ্ন ও সমাধান।',
    subjectOrder: SCIENCE_ORDER,
    priority: 17,
  },
  {
    id: 'bsmrstu-b',
    tagPrefix: 'BSMRSTU-B',
    nameBn: 'বঙ্গবন্ধু শেখ মুজিবুর রহমান বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় (BSMRSTU) বি-ইউনিট ভর্তি পরীক্ষা',
    nameEn: 'BSMRSTU B Unit Admission Test',
    shortBn: 'বশেমুরবিপ্রবি বি-ইউনিট',
    category: 'varsity',
    descriptionBn: 'বঙ্গবন্ধু শেখ মুজিবুর রহমান বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের বি-ইউনিটের বিগত বছরের ভর্তি পরীক্ষার প্রশ্ন ও সমাধান।',
    subjectOrder: SCIENCE_ORDER,
    priority: 18,
  },
  {
    id: 'sau',
    tagPrefix: 'SAU',
    nameBn: 'সিলেট কৃষি বিশ্ববিদ্যালয় (SAU) ভর্তি পরীক্ষা',
    nameEn: 'Sylhet Agricultural University (SAU) Admission Test',
    shortBn: 'সিকৃবি (SAU)',
    category: 'krishi',
    descriptionBn: 'সিলেট কৃষি বিশ্ববিদ্যালয়ের বিগত বছরের ভর্তি পরীক্ষার প্রশ্ন ও সমাধান।',
    subjectOrder: KRISHI_ORDER,
    priority: 19,
  },
  {
    id: 'sbau',
    tagPrefix: 'SBAU',
    nameBn: 'শেরেবাংলা কৃষি বিশ্ববিদ্যালয় (SBAU) ভর্তি পরীক্ষা',
    nameEn: 'Sher-e-Bangla Agricultural University (SBAU) Admission Test',
    shortBn: 'শেকৃবি (SBAU)',
    category: 'krishi',
    descriptionBn: 'শেরেবাংলা কৃষি বিশ্ববিদ্যালয়ের বিগত বছরের ভর্তি পরীক্ষার প্রশ্ন ও সমাধান।',
    subjectOrder: KRISHI_ORDER,
    priority: 20,
  },
];

export const findAdmissionExam = (id: string): AdmissionExamDef | undefined =>
  ADMISSION_EXAMS.find((e) => e.id === String(id || '').toLowerCase());

/** Bundled offline papers (data/*.json) that stand in when the API is unreachable at build time. */
export const BUNDLED_PAPERS: { examId: string; startYear: number; file: string }[] = [
  { examId: 'medical', startYear: 2024, file: 'data/medical_24_25_questions.json' },
  { examId: 'gst-a', startYear: 2023, file: 'data/gst_a_23_24_questions.json' },
];

const SUBJECT_BN: [RegExp, string][] = [
  [/^biology/i, 'জীববিজ্ঞান'],
  [/^chemistry/i, 'রসায়ন'],
  [/^physics/i, 'পদার্থবিজ্ঞান'],
  [/^higher\s*math/i, 'উচ্চতর গণিত'],
  [/^math/i, 'গণিত'],
  [/^english/i, 'ইংরেজি'],
  [/^bangla/i, 'বাংলা'],
  [/^general\s*knowledge/i, 'সাধারণ জ্ঞান'],
  [/^ict/i, 'তথ্য ও যোগাযোগ প্রযুক্তি'],
  [/^mental\s*ability/i, 'মানসিক দক্ষতা'],
];

/** "Chemistry 2nd Paper" → "রসায়ন ২য় পত্র" (falls back to the raw name). */
export const subjectLabelBn = (subject: string): string => {
  const s = String(subject || '').trim();
  const hit = SUBJECT_BN.find(([re]) => re.test(s));
  if (!hit) return s;
  const paper = /1st/i.test(s) ? ' ১ম পত্র' : /2nd/i.test(s) ? ' ২য় পত্র' : '';
  return hit[1] + paper;
};

/** Base subject (paper stripped): "Chemistry 2nd Paper" → "Chemistry". */
export const subjectBase = (subject: string): string =>
  String(subject || '')
    .replace(/\s*(1st|2nd)\s*paper.*$/i, '')
    .trim();

/** Sort key so a paper renders in the exam's natural subject order. */
export const subjectRank = (subject: string, order: string[] = SCIENCE_ORDER): number => {
  const base = subjectBase(subject).toLowerCase();
  const i = order.findIndex((o) => base.startsWith(o.toLowerCase()));
  const paperBump = /2nd/i.test(subject) ? 0.5 : 0;
  return (i === -1 ? order.length : i) + paperBump;
};
