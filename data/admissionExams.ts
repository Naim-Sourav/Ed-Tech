/**
 * admissionExams.ts
 * ---------------------------------------------------------------------------
 * Single source of truth for the "বিগত বছরের ভর্তি পরীক্ষার প্রশ্ন" (previous
 * year admission question) pages.
 *
 * The question bank stores the exam a question appeared in inside the `tags`
 * array using the pattern `<Institution> 'YY-YY` (e.g. `Medical '21-22`).
 * The API filters on that array via `GET /admin/questions?board=<tag>`, so
 * every paper page can be fetched straight from the database — nothing is
 * hard-coded here except the human-readable names and URL slugs.
 *
 * Used by:
 *   - scripts/generate-seo-pages.mjs  (static /admission-questions/… pages)
 *   - components/PastPaperPage.tsx     (in-app, client-rendered twin)
 *   - components/landing/*             (links from the landing page)
 */

export type AdmissionCategory = 'medical' | 'varsity' | 'engineering' | 'agri' | 'others';

export interface ExamFormatRow {
  label: string;
  value: string;
}

export interface AdmissionInstitution {
  /** URL segment: /admission-questions/<id>/ */
  id: string;
  /** Tag prefix used in the question bank, e.g. `Medical` → `Medical '21-22`. */
  tag: string;
  /** Bangla display name (used in H1/titles). */
  name: string;
  /** English display name (used in titles/meta for English queries). */
  nameEn: string;
  /** Short English label for <title> tags, e.g. "Medical Admission Test". */
  shortEn: string;
  /** Short Bangla label for chips/cards. */
  short: string;
  category: AdmissionCategory;
  /** `institution` query param understood by the in-app QuestionBank. */
  qbankInstitution: string;
  /** One paragraph intro shown on the institution page. */
  description: string;
  /** Optional, only where the format is well established. */
  format?: ExamFormatRow[];
  /** Preferred subject order on a paper page (subject "family" keys). */
  subjectOrder?: string[];
  /** Curated FAQs for the institution page (kept factual & short). */
  faqs?: { q: string; a: string }[];
}

export const ADMISSION_HUB_PATH = '/admission-questions/';

export const ADMISSION_CATEGORY_LABELS: Record<AdmissionCategory, string> = {
  medical: 'মেডিকেল ও ডেন্টাল',
  varsity: 'বিশ্ববিদ্যালয় (বিজ্ঞান)',
  engineering: 'ইঞ্জিনিয়ারিং',
  agri: 'কৃষি বিশ্ববিদ্যালয়',
  others: 'অন্যান্য',
};

export const ADMISSION_INSTITUTIONS: AdmissionInstitution[] = [
  {
    id: 'medical',
    tag: 'Medical',
    name: 'মেডিকেল ভর্তি পরীক্ষা',
    nameEn: 'Medical (MBBS) Admission Test',
    shortEn: 'Medical Admission Test',
    short: 'মেডিকেল',
    category: 'medical',
    qbankInstitution: 'medical',
    description:
      'বাংলাদেশের সরকারি ও বেসরকারি মেডিকেল কলেজে MBBS ভর্তির জন্য স্বাস্থ্য শিক্ষা অধিদপ্তরের অধীনে প্রতি বছর একটি কেন্দ্রীয় ভর্তি পরীক্ষা হয়। ১০০ নম্বরের এই MCQ পরীক্ষায় জীববিজ্ঞান, রসায়ন, পদার্থবিজ্ঞান, ইংরেজি ও সাধারণ জ্ঞান থেকে প্রশ্ন আসে। বিগত বছরের প্রশ্ন সলভ করলে প্রশ্নের ধরন, গুরুত্বপূর্ণ অধ্যায় আর সময় ব্যবস্থাপনা — তিনটিই একসাথে আয়ত্তে আসে।',
    format: [
      { label: 'প্রশ্নের ধরন', value: 'MCQ (১০০টি প্রশ্ন, ১০০ নম্বর)' },
      { label: 'সময়', value: '১ ঘণ্টা' },
      { label: 'নেগেটিভ মার্কিং', value: 'প্রতিটি ভুল উত্তরে ০.২৫ নম্বর কাটা' },
      { label: 'পাস মার্ক', value: '৪০' },
      { label: 'বিষয়ভিত্তিক নম্বর (সাধারণত)', value: 'জীববিজ্ঞান ৩০ · রসায়ন ২৫ · পদার্থবিজ্ঞান ২০ · ইংরেজি ১৫ · সাধারণ জ্ঞান ১০' },
      { label: 'মেধাতালিকা', value: 'মোট ৩০০ নম্বর = লিখিত ১০০ + SSC GPA×১৫ (৭৫) + HSC GPA×২৫ (১২৫)' },
    ],
    subjectOrder: ['Biology', 'Chemistry', 'Physics', 'English', 'General Knowledge'],
    faqs: [
      {
        q: 'মেডিকেল ভর্তি পরীক্ষায় কোন বিষয় থেকে কত নম্বর থাকে?',
        a: 'সাধারণত জীববিজ্ঞান ৩০, রসায়ন ২৫, পদার্থবিজ্ঞান ২০, ইংরেজি ১৫ এবং সাধারণ জ্ঞান (বাংলাদেশ ও আন্তর্জাতিক বিষয়াবলি) ১০ নম্বর — মোট ১০০ নম্বরের MCQ।',
      },
      {
        q: 'মেডিকেল ভর্তি পরীক্ষায় নেগেটিভ মার্কিং আছে?',
        a: 'হ্যাঁ। প্রতিটি ভুল উত্তরের জন্য ০.২৫ নম্বর কাটা যায়, তাই অনুমানে উত্তর দেওয়ার আগে ভেবে নেওয়া জরুরি।',
      },
      {
        q: 'বিগত বছরের প্রশ্ন সলভ করা কেন জরুরি?',
        a: 'মেডিকেল ভর্তি পরীক্ষায় প্রতি বছর একই ধাঁচের এবং অনেক ক্ষেত্রে একই অধ্যায় থেকে প্রশ্ন আসে। বিগত ৫–১০ বছরের প্রশ্ন ব্যাখ্যাসহ সলভ করলে গুরুত্বপূর্ণ টপিক চেনা যায় এবং ১ ঘণ্টায় ১০০ প্রশ্নের সময় ব্যবস্থাপনার অভ্যাস তৈরি হয়।',
      },
      {
        q: 'এই প্রশ্নগুলো কি ফ্রিতে প্র্যাকটিস করা যায়?',
        a: 'হ্যাঁ। পরীক্ষাঙ্গনে প্রতিটি সেশনের প্রশ্ন সঠিক উত্তর ও ব্যাখ্যাসহ ফ্রিতে দেখা যায়, আর অ্যাপে টাইমার সহ পুরো প্রশ্নপত্রে মডেল টেস্ট দেওয়া যায়।',
      },
    ],
  },
  {
    id: 'dental',
    tag: 'Dental',
    name: 'ডেন্টাল ভর্তি পরীক্ষা',
    nameEn: 'Dental (BDS) Admission Test',
    shortEn: 'Dental Admission Test',
    short: 'ডেন্টাল',
    category: 'medical',
    qbankInstitution: 'dental',
    description:
      'BDS (ডেন্টাল) ভর্তি পরীক্ষাও মেডিকেলের মতো ১০০ নম্বরের MCQ পদ্ধতিতে হয় — জীববিজ্ঞান, রসায়ন, পদার্থবিজ্ঞান, ইংরেজি ও সাধারণ জ্ঞান থেকে প্রশ্ন আসে এবং ভুল উত্তরে নম্বর কাটা যায়। প্রশ্নের মান ও ধরন MBBS পরীক্ষার খুব কাছাকাছি, তাই বিগত বছরের ডেন্টাল প্রশ্ন সলভ করলে মেডিকেলের প্রস্তুতিও একসাথে এগোয়।',
    format: [
      { label: 'প্রশ্নের ধরন', value: 'MCQ (১০০টি প্রশ্ন, ১০০ নম্বর)' },
      { label: 'সময়', value: '১ ঘণ্টা' },
      { label: 'নেগেটিভ মার্কিং', value: 'প্রতিটি ভুল উত্তরে ০.২৫ নম্বর কাটা' },
      { label: 'বিষয়', value: 'জীববিজ্ঞান, রসায়ন, পদার্থবিজ্ঞান, ইংরেজি, সাধারণ জ্ঞান' },
    ],
    subjectOrder: ['Biology', 'Chemistry', 'Physics', 'English', 'General Knowledge'],
    faqs: [
      {
        q: 'ডেন্টাল ভর্তি পরীক্ষার প্রশ্ন কি মেডিকেলের মতোই?',
        a: 'হ্যাঁ, ধরন একই — ১০০ নম্বরের MCQ, একই বিষয় বণ্টন ও নেগেটিভ মার্কিং। তাই মেডিকেল প্রস্তুতির অংশ হিসেবে ডেন্টালের বিগত প্রশ্নও সলভ করা উচিত।',
      },
    ],
  },
  {
    id: 'du-a',
    tag: 'DU-A',
    name: 'ঢাকা বিশ্ববিদ্যালয় ক ইউনিট',
    nameEn: 'Dhaka University A Unit (Science)',
    shortEn: 'DU A Unit',
    short: 'ঢাবি ক ইউনিট',
    category: 'varsity',
    qbankInstitution: 'du-a',
    description:
      'ঢাকা বিশ্ববিদ্যালয়ের বিজ্ঞান ইউনিট (ক ইউনিট) ভর্তি পরীক্ষায় পদার্থবিজ্ঞান, রসায়ন, উচ্চতর গণিত ও জীববিজ্ঞান (বা বাংলা/ইংরেজি) থেকে প্রশ্ন আসে। MCQ-এর পাশাপাশি লিখিত অংশ থাকায় কনসেপ্ট ও গতি — দুটোই দরকার। বিগত বছরের প্রশ্ন সলভ করলে ঢাবির প্রশ্নের নিজস্ব ধাঁচটা পরিষ্কার হয়।',
    subjectOrder: ['Physics', 'Chemistry', 'Higher Math', 'Biology', 'Bangla', 'English'],
  },
  {
    id: 'buet',
    tag: 'BUET',
    name: 'বুয়েট ভর্তি পরীক্ষা',
    nameEn: 'BUET Admission Test',
    shortEn: 'BUET Admission',
    short: 'বুয়েট',
    category: 'engineering',
    qbankInstitution: 'buet',
    description:
      'বুয়েট ভর্তি পরীক্ষা দুই ধাপে হয় — প্রাক-নির্বাচনী (MCQ) এবং মূল লিখিত পরীক্ষা; দুটিতেই গণিত, পদার্থবিজ্ঞান ও রসায়ন থেকে প্রশ্ন আসে। প্রশ্নগুলো গাণিতিক ও প্রয়োগমুখী, তাই বিগত বছরের প্রশ্ন সলভ করাই সবচেয়ে কার্যকর প্রস্তুতি।',
    subjectOrder: ['Higher Math', 'Physics', 'Chemistry'],
  },
  {
    id: 'ckruet-ka',
    tag: 'CKRUET-Ka',
    name: 'চুয়েট-কুয়েট-রুয়েট (CKRUET) ক গ্রুপ',
    nameEn: 'CKRUET (CUET-KUET-RUET) Ka Group',
    shortEn: 'CKRUET Ka Group',
    short: 'CKRUET ক',
    category: 'engineering',
    qbankInstitution: 'ckruet-ka',
    description:
      'চুয়েট, কুয়েট ও রুয়েটের সমন্বিত ভর্তি পরীক্ষার ক গ্রুপে গণিত, পদার্থবিজ্ঞান, রসায়ন ও ইংরেজি থেকে MCQ প্রশ্ন আসে। বিগত বছরের প্রশ্ন সলভ করলে প্রশ্নের মান ও সময় বণ্টনের ধারণা পাওয়া যায়।',
    subjectOrder: ['Higher Math', 'Physics', 'Chemistry', 'English'],
  },
  {
    id: 'gst-a',
    tag: 'GST-A',
    name: 'GST গুচ্ছ ভর্তি পরীক্ষা (ক ইউনিট)',
    nameEn: 'GST Cluster Admission Test A Unit',
    shortEn: 'GST A Unit',
    short: 'GST ক ইউনিট',
    category: 'varsity',
    qbankInstitution: 'gst-a',
    description:
      'সাধারণ ও বিজ্ঞান-প্রযুক্তি বিশ্ববিদ্যালয়গুলোর গুচ্ছ (GST) ভর্তি পরীক্ষার ক ইউনিট বিজ্ঞান বিভাগের শিক্ষার্থীদের জন্য। পদার্থবিজ্ঞান, রসায়ন, গণিত/জীববিজ্ঞান এবং বাংলা/ইংরেজি থেকে ১০০ নম্বরের MCQ হয়। একটি পরীক্ষাতেই অনেকগুলো বিশ্ববিদ্যালয়ে আবেদন করা যায় বলে এটি সবচেয়ে বড় ভর্তি পরীক্ষাগুলোর একটি।',
    subjectOrder: ['Physics', 'Chemistry', 'Higher Math', 'Biology', 'Bangla', 'English', 'ICT'],
  },
  {
    id: 'ruet',
    tag: 'RUET',
    name: 'রুয়েট ভর্তি পরীক্ষা',
    nameEn: 'RUET Admission Test',
    shortEn: 'RUET Admission',
    short: 'রুয়েট',
    category: 'engineering',
    qbankInstitution: 'ruet',
    description: 'রাজশাহী প্রকৌশল ও প্রযুক্তি বিশ্ববিদ্যালয়ের (রুয়েট) বিগত বছরের ভর্তি পরীক্ষার প্রশ্ন — গণিত, পদার্থবিজ্ঞান, রসায়ন ও ইংরেজি।',
    subjectOrder: ['Higher Math', 'Physics', 'Chemistry', 'English'],
  },
  {
    id: 'butex',
    tag: 'BUTex',
    name: 'বুটেক্স ভর্তি পরীক্ষা',
    nameEn: 'BUTEX Admission Test',
    shortEn: 'BUTEX Admission',
    short: 'বুটেক্স',
    category: 'engineering',
    qbankInstitution: 'butex',
    description: 'বাংলাদেশ টেক্সটাইল বিশ্ববিদ্যালয়ের (বুটেক্স) ভর্তি পরীক্ষায় গণিত, পদার্থবিজ্ঞান, রসায়ন ও ইংরেজি থেকে প্রশ্ন আসে। বিগত বছরের প্রশ্ন সলভ করে প্রস্তুতি যাচাই করো।',
    subjectOrder: ['Higher Math', 'Physics', 'Chemistry', 'English'],
  },
  {
    id: 'ru-c',
    tag: 'RU-C',
    name: 'রাজশাহী বিশ্ববিদ্যালয় C ইউনিট',
    nameEn: 'Rajshahi University C Unit (Science)',
    shortEn: 'RU C Unit',
    short: 'রাবি C ইউনিট',
    category: 'varsity',
    qbankInstitution: 'ru-c',
    description: 'রাজশাহী বিশ্ববিদ্যালয়ের বিজ্ঞান (C) ইউনিটের বিগত বছরের ভর্তি পরীক্ষার MCQ প্রশ্ন ও ব্যাখ্যাসহ সমাধান।',
  },
  {
    id: 'cu-a',
    tag: 'CU-A',
    name: 'চট্টগ্রাম বিশ্ববিদ্যালয় A ইউনিট',
    nameEn: 'Chittagong University A Unit (Science)',
    shortEn: 'CU A Unit',
    short: 'চবি A ইউনিট',
    category: 'varsity',
    qbankInstitution: 'cu-a',
    description: 'চট্টগ্রাম বিশ্ববিদ্যালয়ের বিজ্ঞান (A) ইউনিটের বিগত বছরের ভর্তি পরীক্ষার প্রশ্ন ও সমাধান।',
  },
  {
    id: 'ku-a',
    tag: 'KU-A',
    name: 'খুলনা বিশ্ববিদ্যালয় A ইউনিট',
    nameEn: 'Khulna University A Unit (Science)',
    shortEn: 'KU A Unit',
    short: 'খুবি A ইউনিট',
    category: 'varsity',
    qbankInstitution: 'ku-a',
    description: 'খুলনা বিশ্ববিদ্যালয়ের বিজ্ঞান, প্রকৌশল ও প্রযুক্তি স্কুলের (A ইউনিট) বিগত বছরের ভর্তি পরীক্ষার প্রশ্ন ও সমাধান।',
  },
  {
    id: 'jnu-a',
    tag: 'JnU-A',
    name: 'জগন্নাথ বিশ্ববিদ্যালয় A ইউনিট',
    nameEn: 'Jagannath University A Unit (Science)',
    shortEn: 'JnU A Unit',
    short: 'জবি A ইউনিট',
    category: 'varsity',
    qbankInstitution: 'jnu-a',
    description: 'জগন্নাথ বিশ্ববিদ্যালয়ের বিজ্ঞান (A) ইউনিটের বিগত বছরের ভর্তি পরীক্ষার প্রশ্ন ও সমাধান।',
  },
  {
    id: 'just-c',
    tag: 'JUST-C',
    name: 'যশোর বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় C ইউনিট',
    nameEn: 'JUST C Unit',
    shortEn: 'JUST C Unit',
    short: 'যবিপ্রবি C ইউনিট',
    category: 'varsity',
    qbankInstitution: 'just-c',
    description: 'যশোর বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের (যবিপ্রবি) C ইউনিটের বিগত বছরের ভর্তি পরীক্ষার প্রশ্ন ও সমাধান।',
  },
  {
    id: 'mbstu-a',
    tag: 'MBSTU-A',
    name: 'মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় A ইউনিট',
    nameEn: 'MBSTU A Unit',
    shortEn: 'MBSTU A Unit',
    short: 'মাভাবিপ্রবি A ইউনিট',
    category: 'varsity',
    qbankInstitution: 'mbstu-a',
    description: 'মাওলানা ভাসানী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের (মাভাবিপ্রবি) A ইউনিটের বিগত বছরের ভর্তি পরীক্ষার প্রশ্ন ও সমাধান।',
  },
  {
    id: 'sust-b',
    tag: 'SUST-B',
    name: 'শাহজালাল বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় B ইউনিট',
    nameEn: 'SUST B Unit',
    shortEn: 'SUST B Unit',
    short: 'শাবিপ্রবি B ইউনিট',
    category: 'varsity',
    qbankInstitution: 'sust-b',
    description: 'শাহজালাল বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের (শাবিপ্রবি) B ইউনিটের বিগত বছরের ভর্তি পরীক্ষার প্রশ্ন ও সমাধান।',
  },
  {
    id: 'hstu-a',
    tag: 'HSTU-A',
    name: 'হাজী মোহাম্মদ দানেশ বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় A ইউনিট',
    nameEn: 'HSTU A Unit',
    shortEn: 'HSTU A Unit',
    short: 'হাবিপ্রবি A ইউনিট',
    category: 'varsity',
    qbankInstitution: 'hstu-a',
    description: 'হাজী মোহাম্মদ দানেশ বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের (হাবিপ্রবি) A ইউনিটের বিগত বছরের ভর্তি পরীক্ষার প্রশ্ন ও সমাধান।',
  },
  {
    id: 'hstu-b',
    tag: 'HSTU-B',
    name: 'হাজী মোহাম্মদ দানেশ বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় B ইউনিট',
    nameEn: 'HSTU B Unit',
    shortEn: 'HSTU B Unit',
    short: 'হাবিপ্রবি B ইউনিট',
    category: 'varsity',
    qbankInstitution: 'hstu-b',
    description: 'হাজী মোহাম্মদ দানেশ বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের (হাবিপ্রবি) B ইউনিটের বিগত বছরের ভর্তি পরীক্ষার প্রশ্ন ও সমাধান।',
  },
  {
    id: 'bsmrstu-b',
    tag: 'BSMRSTU-B',
    name: 'বঙ্গবন্ধু শেখ মুজিবুর রহমান বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় B ইউনিট',
    nameEn: 'BSMRSTU B Unit',
    shortEn: 'BSMRSTU B Unit',
    short: 'বশেমুরবিপ্রবি B ইউনিট',
    category: 'varsity',
    qbankInstitution: 'bsmrstu-b',
    description: 'বঙ্গবন্ধু শেখ মুজিবুর রহমান বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের (বশেমুরবিপ্রবি) B ইউনিটের বিগত বছরের ভর্তি পরীক্ষার প্রশ্ন ও সমাধান।',
  },
  {
    id: 'sau',
    tag: 'SAU',
    name: 'SAU কৃষি ভর্তি পরীক্ষা',
    nameEn: 'SAU Admission Test',
    shortEn: 'SAU Admission',
    short: 'SAU',
    category: 'agri',
    qbankInstitution: 'sau',
    description: 'SAU ভর্তি পরীক্ষার বিগত বছরের প্রশ্ন — জীববিজ্ঞান, রসায়ন, পদার্থবিজ্ঞান, গণিত ও ইংরেজি থেকে MCQ।',
  },
  {
    id: 'sbau',
    tag: 'SBAU',
    name: 'SBAU কৃষি ভর্তি পরীক্ষা',
    nameEn: 'SBAU Admission Test',
    shortEn: 'SBAU Admission',
    short: 'SBAU',
    category: 'agri',
    qbankInstitution: 'sbau',
    description: 'SBAU ভর্তি পরীক্ষার বিগত বছরের প্রশ্ন — জীববিজ্ঞান, রসায়ন, পদার্থবিজ্ঞান, গণিত ও ইংরেজি থেকে MCQ।',
  },
];

/** Order in which categories are listed on the hub page. */
export const ADMISSION_CATEGORY_ORDER: AdmissionCategory[] = ['medical', 'varsity', 'engineering', 'agri', 'others'];

// ---------------------------------------------------------------------------
// Helpers (pure, shared by node + browser)
// ---------------------------------------------------------------------------

const BN_DIGIT = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

/** 2021 → "২০২১" */
export function toBanglaDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => BN_DIGIT[Number(d)]);
}

/** `"21-22"` → `"২০২১-২২"` (full first year, short second year — how students write it). */
export function sessionToBangla(session: string): string {
  const m = /^(\d{2})-(\d{2})$/.exec(session);
  if (!m) return toBanglaDigits(session);
  return `${toBanglaDigits(`20${m[1]}`)}-${toBanglaDigits(m[2])}`;
}

/** `"21-22"` → `"2021-22"` (URL segment). */
export function sessionToSlug(session: string): string {
  const m = /^(\d{2})-(\d{2})$/.exec(session);
  return m ? `20${m[1]}-${m[2]}` : session;
}

/** `"2021-22"` → `"21-22"`; returns null for anything that is not a session slug. */
export function slugToSession(slug: string): string | null {
  const m = /^(?:20)?(\d{2})-(\d{2})$/.exec(String(slug || '').trim());
  return m ? `${m[1]}-${m[2]}` : null;
}

/** `"Medical '21-22"` → `{ prefix: 'Medical', session: '21-22' }` */
export function parseExamTag(tag: string): { prefix: string; session: string } | null {
  const m = /^([A-Za-z][A-Za-z0-9 .&-]*?)\s*'(\d{2})-(\d{2})$/.exec(String(tag || '').trim());
  if (!m) return null;
  return { prefix: m[1].trim(), session: `${m[2]}-${m[3]}` };
}

export function buildExamTag(prefix: string, session: string): string {
  return `${prefix} '${session}`;
}

export function findInstitutionById(id: string): AdmissionInstitution | undefined {
  return ADMISSION_INSTITUTIONS.find((i) => i.id === id);
}

export function findInstitutionByTag(prefix: string): AdmissionInstitution | undefined {
  const p = String(prefix || '').toLowerCase();
  return ADMISSION_INSTITUTIONS.find((i) => i.tag.toLowerCase() === p);
}

/** Paper title in Bangla, e.g. "মেডিকেল ভর্তি পরীক্ষা ২০২১-২২". */
export function paperTitle(inst: AdmissionInstitution, session: string): string {
  return `${inst.name} ${sessionToBangla(session)}`;
}

export function paperPath(inst: AdmissionInstitution, session: string): string {
  return `${ADMISSION_HUB_PATH}${inst.id}/${sessionToSlug(session)}/`;
}

export function institutionPath(inst: AdmissionInstitution): string {
  return `${ADMISSION_HUB_PATH}${inst.id}/`;
}

/** Deep link into the in-app question bank for the whole paper (timed practice). */
export function qbankPaperLink(inst: AdmissionInstitution, session: string): string {
  const tag = buildExamTag(inst.tag, session);
  return `/qbank?level=ADMISSION&institution=${encodeURIComponent(inst.qbankInstitution)}&unit=all&examRef=${encodeURIComponent(tag)}`;
}

/** Sort sessions newest first ("24-25" before "23-24"). */
export function compareSessionsDesc(a: string, b: string): number {
  return b.localeCompare(a);
}

// ---------------------------------------------------------------------------
// Subject "families" (Biology 1st + 2nd Paper → Biology) for grouping
// ---------------------------------------------------------------------------

export interface SubjectFamily {
  key: string;
  bn: string;
  en: string;
}

export const SUBJECT_FAMILIES: SubjectFamily[] = [
  { key: 'Physics', bn: 'পদার্থবিজ্ঞান', en: 'Physics' },
  { key: 'Chemistry', bn: 'রসায়ন', en: 'Chemistry' },
  { key: 'Biology', bn: 'জীববিজ্ঞান', en: 'Biology' },
  { key: 'Higher Math', bn: 'উচ্চতর গণিত', en: 'Higher Math' },
  { key: 'English', bn: 'ইংরেজি', en: 'English' },
  { key: 'Bangla', bn: 'বাংলা', en: 'Bangla' },
  { key: 'ICT', bn: 'তথ্য ও যোগাযোগ প্রযুক্তি', en: 'ICT' },
  { key: 'General Knowledge', bn: 'সাধারণ জ্ঞান', en: 'General Knowledge' },
  { key: 'Mental Ability', bn: 'মানসিক দক্ষতা', en: 'Mental Ability' },
];

export function subjectFamilyOf(subject: string): SubjectFamily {
  const s = String(subject || '').toLowerCase();
  for (const fam of SUBJECT_FAMILIES) {
    if (s.startsWith(fam.key.toLowerCase())) return fam;
  }
  if (s.includes('math')) return SUBJECT_FAMILIES[3];
  if (s.includes('gk') || s.includes('general')) return SUBJECT_FAMILIES[7];
  return { key: subject || 'Others', bn: subject || 'অন্যান্য', en: subject || 'Others' };
}

/** Bangla label for a full DB subject name, e.g. "Biology 1st Paper" → "জীববিজ্ঞান ১ম পত্র". */
export function subjectToBangla(subject: string): string {
  const fam = subjectFamilyOf(subject);
  const s = String(subject || '');
  if (/1st/i.test(s)) return `${fam.bn} ১ম পত্র`;
  if (/2nd/i.test(s)) return `${fam.bn} ২য় পত্র`;
  return fam.bn;
}

/** Family order for a given institution (falls back to the global order). */
export function subjectOrderFor(inst: AdmissionInstitution | undefined): string[] {
  const base = SUBJECT_FAMILIES.map((f) => f.key);
  if (!inst?.subjectOrder) return base;
  return [...inst.subjectOrder, ...base.filter((k) => !inst.subjectOrder!.includes(k))];
}
