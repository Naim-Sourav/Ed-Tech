/* ─────────────────────────────────────────────────────────────────────────
   পরীক্ষাঙ্গন (Porikkhangon) — landing page content
   Single source of truth for the copy/marketing data rendered by
   components/landing/*.tsx. Edit here, not inside the components.
   ───────────────────────────────────────────────────────────────────────── */

export const navLinks = [
  { label: "ফিচার", en: "Features", href: "#features" },
  { label: "ট্র্যাক", en: "Tracks", href: "#showcase" },
  { label: "কেন আমরা", en: "Why us", href: "#benefits" },
  { label: "রেজাল্ট", en: "Results", href: "#testimonials" },
  { label: "কোর্স", en: "Courses", href: "#pricing" },
  { label: "জিজ্ঞাসা", en: "FAQ", href: "#faq" },
];

/* ── Subject marquee under the hero ── */
export const subjects = [
  "Physics পদার্থবিজ্ঞান",
  "Chemistry রসায়ন",
  "Higher Math উচ্চতর গণিত",
  "Biology জীববিজ্ঞান",
  "Bangla বাংলা",
  "English ইংরেজি",
  "ICT তথ্য ও যোগাযোগ প্রযুক্তি",
  "General Knowledge সাধারণ জ্ঞান",
  "Accounting হিসাববিজ্ঞান",
  "Economics অর্থনীতি",
  "Statistics পরিসংখ্যান",
];

/* ── Social proof counters (same numbers the previous landing used) ── */
export const stats = [
  { value: 20000, decimals: 0, suffix: "+", labelBn: "প্রশ্ন সম্ভার", label: "Question bank" },
  { value: 24, decimals: 0, suffix: "/৭", labelBn: "AI টিউটর সাপোর্ট", label: "AI support" },
  { value: 10, decimals: 0, suffix: "+ বছর", labelBn: "পুরনো প্রশ্ন আর্কাইভ", label: "Years of archive" },
  { value: 4, decimals: 0, suffix: "টি", labelBn: "মেজর টার্গেট", label: "Major targets" },
];

export const schools = [
  "Notre Dame College",
  "Dhaka College",
  "Rajuk Uttara Model College",
  "Viqarunnisa Noon College",
  "Holy Cross College",
  "Adamjee Cantonment College",
  "Chittagong College",
  "Govt. Science College",
  "BAF Shaheen College",
  "Milestone College",
];

/* ── Interactive question demo on the hero ── */
export interface DemoQuestion {
  subject: string;
  tagBn: string;
  question: string;
  options: string[];
  answer: number;
  solution: string;
}

export const demoQuestions: DemoQuestion[] = [
  {
    subject: "HSC",
    tagBn: "পদার্থবিজ্ঞান · ভৌত রাশি",
    question: "নিচের কোনটি ভেক্টর রাশি?",
    options: ["বেগ", "দ্রুতি", "তাপমাত্রা", "কাজ"],
    answer: 0,
    solution: "বেগের মান ও দিক দুই-ই আছে, তাই এটি ভেক্টর রাশি। দ্রুতি, তাপমাত্রা ও কাজ স্কেলার।",
  },
  {
    subject: "Admission",
    tagBn: "রসায়ন · অ্যাসিড-ক্ষার",
    question: "pH = 4 দ্রবণে H⁺ আয়নের ঘনমাত্রা কত?",
    options: ["10⁻³ M", "10⁻⁴ M", "10⁻⁵ M", "4 M"],
    answer: 1,
    solution: "pH = −log[H⁺], তাই [H⁺] = 10⁻⁴ মোল/লিটার।",
  },
  {
    subject: "HSC",
    tagBn: "উচ্চতর গণিত · যোগজীকরণ",
    question: "∫ x dx = ?",
    options: ["x² + C", "x²/2 + C", "2x + C", "x + C"],
    answer: 1,
    solution: "∫xⁿ dx = xⁿ⁺¹/(n+1) + C ⇒ ∫x dx = x²/2 + C।",
  },
  {
    subject: "Admission",
    tagBn: "ইংরেজি · Vocabulary",
    question: "Choose the correct synonym of “Candid” —",
    options: ["Rude", "Frank", "Silent", "Clever"],
    answer: 1,
    solution: "Candid অর্থ স্পষ্টভাষী (frank) — ভর্তি পরীক্ষায় বারবার আসা শব্দ।",
  },
  {
    subject: "Admission",
    tagBn: "সাধারণ জ্ঞান · বাংলাদেশ",
    question: "বাংলাদেশের সংবিধান কত সালে কার্যকর হয়?",
    options: ["১৯৭১", "১৯৭২", "১৯৭৩", "১৯৭৫"],
    answer: 1,
    solution: "সংবিধান ১৯৭২ সালের ৪ নভেম্বর গৃহীত হয় এবং ১৬ ডিসেম্বর ১৯৭২-এ কার্যকর হয়।",
  },
];

/* ── Feature bento cards → real app routes ── */
export interface FeatureCopy {
  title: string;
  desc: string;
  href: string;
  cta: string;
  span: string;
}

export const featureCopy: FeatureCopy[] = [
  {
    title: "লাইভ মক এক্সাম",
    desc: "রিয়েল এক্সামের ইন্টারফেস, টাইমার আর নেগেটিভ মার্কিং — এক্সাম জোনে প্রতিদিন নতুন মডেল টেস্ট, সাথে সাথে রেজাল্ট ও ব্যাখ্যা।",
    href: "/exams",
    cta: "এক্সাম জোন",
    span: "lg:col-span-7",
  },
  {
    title: "AI টিউটর ও দুর্বলতা রিপোর্ট",
    desc: "Porikkhangon AI প্রতিটি ভুল উত্তর থেকে বের করে কোন অধ্যায়ে তুমি পিছিয়ে, আর ভুল প্রশ্নগুলো আলাদা করে রাখে পরের রিভিশনের জন্য।",
    href: "/bot",
    cta: "AI টিউটর",
    span: "lg:col-span-5",
  },
  {
    title: "স্মার্ট প্রশ্ন ব্যাংক",
    desc: "২০,০০০+ প্রশ্ন — অধ্যায়, টপিক ও কঠিনতা অনুযায়ী সাজানো, প্রতিটিতে বাংলায় ব্যাখ্যা।",
    href: "/qbank",
    cta: "প্রশ্ন ব্যাংক",
    span: "lg:col-span-4",
  },
  {
    title: "ভর্তি তথ্য ও আর্কাইভ",
    desc: "ঢাবি, মেডিকেল, BUET, GST — ইউনিট ভিত্তিক পুরনো প্রশ্ন, কাট-অফ আর সিট-প্ল্যান এক জায়গায়।",
    href: "/admission",
    cta: "ভর্তি তথ্য",
    span: "lg:col-span-4",
  },
  {
    title: "কুইজ ব্যাটল ও লিডারবোর্ড",
    desc: "বন্ধুকে ১v১ ব্যাটলে ডাকো, জাতীয় লিডারবোর্ডে নাম তোলো — প্রস্তুতি যখন খেলা, তখন বোর হওয়ার সুযোগ নেই।",
    href: "/battle",
    cta: "ব্যাটল খেলো",
    span: "lg:col-span-4",
  },
  {
    title: "ডেইলি চ্যালেঞ্জ + অফলাইন অ্যাপ",
    desc: "প্রতিদিনের চ্যালেঞ্জ আর স্ট্রিক তোমাকে ফিরিয়ে আনবে। অ্যাপটি PWA — হোম স্ক্রিনে ইনস্টল করলে অ্যাপ-শেল অফলাইনেও লোড হয়, নেট আসলেই স্কোর সিংক।",
    href: "/challenges",
    cta: "চ্যালেঞ্জ দেখো",
    span: "lg:col-span-12",
  },
];

/* ── Showcase tabs (preparation tracks) ── */
export interface ShowcaseTab {
  id: string;
  label: string;
  labelBn: string;
  headline: string;
  copy: string;
  bullets: { title: string; desc: string }[];
  mock: {
    exam: string;
    chip: string;
    rows: { name: string; progress: number; accent?: boolean }[];
    statLabel: string;
    statValue: string;
    statDelta: string;
  };
}

export const showcaseTabs: ShowcaseTab[] = [
  {
    id: "hsc",
    label: "HSC",
    labelBn: "এইচএসসি",
    headline: "বোর্ডের আগেই বোর্ড-রেডি",
    copy: "অধ্যায়ভিত্তিক চর্চা, কলেজ টেস্ট পেপার আর ফুল-লেন্থ মডেল টেস্ট — বোর্ডের ইন্টারফেস ও সময় ধরেই প্র্যাকটিস।",
    bullets: [
      { title: "অধ্যায়ভিত্তিক চর্চা", desc: "NCTB সিলেবাসের প্রতিটি অধ্যায় থেকে সহজ থেকে কঠিন — ধাপে ধাপে MCQ।" },
      { title: "পুরনো প্রশ্ন আর্কাইভ", desc: "১০+ বছরের বোর্ড ও কলেজ টেস্ট প্রশ্ন, ব্যাখ্যাসহ সমাধান।" },
      { title: "দুর্বল অধ্যায়ের ম্যাপ", desc: "প্রতিটি মকের পর কোন অধ্যায়ে কতটুকু পিছিয়ে — চার্টসহ রিপোর্ট।" },
    ],
    mock: {
      exam: "HSC মডেল টেস্ট — পদার্থবিজ্ঞান ১ম পত্র",
      chip: "২৫ মিনিট",
      rows: [
        { name: "ভৌত রাশি ও পরিমাপ", progress: 92, accent: true },
        { name: "গতি", progress: 74 },
        { name: "বল", progress: 51 },
        { name: "কাজ, ক্ষমতা ও শক্তি", progress: 63 },
      ],
      statLabel: "সিলেবাস কভারড",
      statValue: "৭৮%",
      statDelta: "গত সপ্তাহের চেয়ে +৯%",
    },
  },
  {
    id: "admission",
    label: "Admission",
    labelBn: "ভর্তি",
    headline: "একটা সিটের লড়াই, প্রস্তুতি সবার জন্য",
    copy: "ঢাবি ক-খ-গ, মেডিকেল, BUET ও ইঞ্জিনিয়ারিং — ইউনিট ভিত্তিক প্রশ্ন ব্যাংক, নেগেটিভ মার্কিং আর সময় ধরে প্র্যাকটিস।",
    bullets: [
      { title: "ইউনিট-ভিত্তিক ব্যাংক", desc: "ঢাবি, চাবি, রাবি, জাবি, মেডিকেল, BUET — ইউনিট ধরে পুরনো প্রশ্ন।" },
      { title: "টাইম-অ্যাটাক মোড", desc: "প্রতি প্রশ্নে নির্দিষ্ট সময় — হলের চাপকে আগে থেকেই অভ্যাসে পরিণত করো।" },
      { title: "ভর্তি তথ্য ডেস্ক", desc: "সার্কুলার, কাট-অফ, সিট ও ফলাফল বিশ্লেষণ এক স্ক্রিনে।" },
    ],
    mock: {
      exam: "ঢাবি ক-ইউনিট সিমুলেশন",
      chip: "৬০ সেকেন্ড/প্রশ্ন",
      rows: [
        { name: "Physics", progress: 84, accent: true },
        { name: "Chemistry", progress: 71 },
        { name: "Math", progress: 58 },
        { name: "English", progress: 76 },
      ],
      statLabel: "মক স্কোর",
      statValue: "৭২.৫",
      statDelta: "গতবারের কাট-অফ ৬৫",
    },
  },
  {
    id: "gst",
    label: "GST",
    labelBn: "গুচ্ছ",
    headline: "গুচ্ছ ভর্তির আলাদা ট্র্যাক",
    copy: "GST ক্লাস্টারের সিলেবাস, প্রশ্নের ধরন আর মার্কস ডিস্ট্রিবিউশন ধরে তৈরি কোর্স — গেস্ট হিসেবেও মডেল টেস্ট দেওয়া যায়।",
    bullets: [
      { title: "গুচ্ছ মডেল টেস্ট", desc: "ক্লাস্টার প্যাটার্নে তৈরি সেট, উত্তরপত্র ও মার্কস বিশ্লেষণসহ।" },
      { title: "লগইন ছাড়াই ডেমো", desc: "গেস্ট মোডে GST মডেল টেস্ট দিয়ে দেখো প্ল্যাটফর্মটা কেমন কাজ করে।" },
      { title: "কোর্স ও ব্যাচ", desc: "স্ট্রাকচারড কোর্স, এক্সাম ব্যাচ আর লাইভ সলভ ক্লাস একসাথে।" },
    ],
    mock: {
      exam: "GST ক্লাস্টার মডেল টেস্ট — সেট ক",
      chip: "৪৫ মিনিট",
      rows: [
        { name: "পদার্থবিজ্ঞান", progress: 80, accent: true },
        { name: "রসায়ন", progress: 68 },
        { name: "জীববিজ্ঞান", progress: 73 },
        { name: "গণিত", progress: 55 },
      ],
      statLabel: "গড় স্কোর",
      statValue: "৬৯",
      statDelta: "১,২০০+ শিক্ষার্থীর সাথে তুলনা",
    },
  },
];

/* ── Why-us rows ── */
export const benefits = [
  {
    titleBn: "দুর্বলতার X-ray",
    title: "Know exactly what you don't know",
    desc: "প্রতিটি ভুল উত্তর অধ্যায় ও টপিক ধরে সেভ হয়। ভুল প্রশ্নের আলাদা ব্যাংক থেকে শুধু সেই দুর্বল অংশটাই বারবার ফেরত আসে।",
  },
  {
    titleBn: "হল-টেস্টড ইন্টারফেস",
    title: "The exam hall, rehearsed",
    desc: "টাইমার, উত্তরপত্রের বাবল, নেগেটিভ মার্কিং — সবকিছু রিয়েল এক্সামের মতো। পরীক্ষা হলে প্রথমবারের মতো কিছুই লাগবে না।",
  },
  {
    titleBn: "বাংলায় ব্যাখ্যা",
    title: "Solutions that actually teach",
    desc: "প্রতিটি প্রশ্নে বাংলায় ধাপে ধাপে সমাধান, আর বুঝতে অসুবিধা হলে Porikkhangon AI-কে সরাসরি জিজ্ঞেস করো — ২৪/৭।",
  },
  {
    titleBn: "প্রতিদিনের অভ্যাস",
    title: "Streaks that turn prep into a game",
    desc: "ডেইলি চ্যালেঞ্জ, স্ট্রিক, ১v১ কুইজ ব্যাটল আর লিডারবোর্ড — প্রস্তুতি হয় অভ্যাস, বাধ্য করা নয়।",
  },
];

export const comparisonRows = [
  { label: "প্রশ্নের পরিমাণ", old: "গাইডবুকে ২-৩ হাজার", neo: "২০,০০০+ প্রশ্ন, অধ্যায় ধরে সাজানো" },
  { label: "ভুলের বিশ্লেষণ", old: "নিজে খাতায় হিসাব", neo: "AI দুর্বলতা রিপোর্ট + ভুল প্রশ্নের ব্যাংক" },
  { label: "মক এক্সাম", old: "মাসে ১-২টা, খাতায়", neo: "এক্সাম জোনে প্রতিদিন নতুন মক" },
  { label: "সমাধান", old: "ছাপা সমাধান, সন্দেহ থাকলেও উপায় নেই", neo: "বাংলায় ব্যাখ্যা + AI টিউটরকে প্রশ্ন করো" },
  { label: "খরচ", old: "কোচিং + গাইড = মাসে হাজার টাকা", neo: "বেসিক ফিচার ফ্রি, ব্যাচ এককালীন" },
];

/* ── Testimonials ─────────────────────────────────────────────────────────
   TODO: এগুলো প্লেসহোল্ডার কপি — আসল শিক্ষার্থীদের অনুমতিসহ রিভিউ
   দিয়ে বদলে দাও (নাম, প্রতিষ্ঠান, রেজাল্ট) প্রকাশের আগে।
   ───────────────────────────────────────────────────────────────────────── */
export const testimonials = [
  {
    quote: "ভুল প্রশ্নের ব্যাংকটা আমার জন্য গেম চেঞ্জার। একই ভুল দুইবার করছি কি না, সেটা আর মুখস্থ রাখতে হয় না — অ্যাপই মনে করিয়ে দেয়।",
    name: "নুসরাত জাহান",
    org: "নটর ডেম কলেজ",
    result: "HSC প্রিপারেশন",
    exam: "HSC '26",
    initials: "NJ",
    featured: true,
  },
  {
    quote: "মডেল টেস্টের ইন্টারফেস আর নেগেটিভ মার্কিং একদম আসল এক্সামের মতো, তাই হলে গিয়ে চাপটাই কম লেগেছিল।",
    name: "আরিফুল ইসলাম",
    org: "ঢাকা কলেজ",
    result: "ভর্তি প্রস্তুতি",
    exam: "Admission '25",
    initials: "AI",
  },
  {
    quote: "AI টিউটরকে রাত ২টায়ও প্রশ্ন করা যায়। কোচিংয়ের স্যারের কাছে যা জিজ্ঞেস করতে লজ্জা লাগত, সেটাও এখানে করেছি।",
    name: "সাদমান সাকিব",
    org: "রাজউক উত্তরা মডেল কলেজ",
    result: "গুচ্ছ ভর্তি",
    exam: "GST '25",
    initials: "SS",
  },
  {
    quote: "গ্রামে ভালো কোচিং নেই। ফোন আর পরীক্ষাঙ্গনই আমার পুরো প্রস্তুতি — ডেইলি চ্যালেঞ্জের স্ট্রিকটা ভাঙতে মন চায় না।",
    name: "তানিয়া আক্তার",
    org: "ময়মনসিংহ",
    result: "HSC প্রিপারেশন",
    exam: "HSC '26",
    initials: "TA",
  },
];

/* ── Pricing ──────────────────────────────────────────────────────────────
   দাম data/courses.ts (The Warriors ব্যাচ) থেকে নেওয়া — বদলালে দুই জায়গায়
   বদলাতে হবে।
   ───────────────────────────────────────────────────────────────────────── */
export interface Plan {
  name: string;
  nameEn: string;
  price: number | null;
  originalPrice?: number;
  unit: string;
  tagline: string;
  cta: string;
  href: string;
  popular?: boolean;
  features: string[];
}

export const plans: Plan[] = [
  {
    name: "ফ্রি",
    nameEn: "Free",
    price: 0,
    unit: "চিরকালের জন্য",
    tagline: "চর্চা শুরু করার জন্য যথেষ্ট",
    cta: "ফ্রিতে শুরু করো",
    href: "/auth",
    features: [
      "২০,০০০+ প্রশ্নের ব্যাংক",
      "এক্সাম জোনে মডেল টেস্ট",
      "ডেইলি চ্যালেঞ্জ ও স্ট্রিক",
      "কুইজ ব্যাটল ও লিডারবোর্ড",
      "AI টিউটরের সাথে প্রশ্নোত্তর",
      "ভর্তি তথ্য ও সিলেবাস",
    ],
  },
  {
    name: "The Warriors",
    nameEn: "Batch",
    price: 2500,
    originalPrice: 4000,
    unit: "/ ব্যাচ",
    tagline: "সেকেন্ড টাইমার এডমিশন প্রিপারেশন",
    cta: "ব্যাচে ভর্তি হও",
    href: "/courses",
    popular: true,
    features: [
      "১০০+ লাইভ এক্সাম",
      "ডেইলি ও উইকলি মক টেস্ট",
      "এডমিশন পূর্ণাঙ্গ গাইডলাইন",
      "ব্যাচ গ্রুপ ও আপডেট",
      "ফ্রি প্ল্যানের সবকিছু",
    ],
  },
  {
    name: "কোর্সসমূহ",
    nameEn: "Courses",
    price: null,
    unit: "কোর্সভিত্তিক",
    tagline: "GST, মেডিকেল ও ইঞ্জিনিয়ারিং ট্র্যাক",
    cta: "সব কোর্স দেখো",
    href: "/courses",
    features: [
      "GST ক্লাস্টার কোর্স ও মডেল টেস্ট",
      "গেস্ট মোডে ডেমো এক্সাম",
      "এক্সাম ব্যাচ ও সলভ ক্লাস",
      "কোর্সভিত্তিক সিলেবাস ট্র্যাকিং",
    ],
  },
];

/* ── FAQ ── */
export const faqs = [
  {
    q: "পরীক্ষাঙ্গন কি সত্যিই ফ্রি?",
    a: "হ্যাঁ — প্রশ্ন ব্যাংক, এক্সাম জোন, ডেইলি চ্যালেঞ্জ, কুইজ ব্যাটল, লিডারবোর্ড, ভর্তি তথ্য আর AI টিউটরের বেসিক ব্যবহার ফ্রি। নম্বর বা Google অ্যাকাউন্ট দিয়ে সাইন আপ করলেই শুরু। স্ট্রাকচারড ব্যাচ/কোর্সগুলো পেইড।",
  },
  {
    q: "কোন কোন পরীক্ষার প্রস্তুতি আছে?",
    a: "HSC একাডেমিক এবং বিশ্ববিদ্যালয় ভর্তি — ঢাবি ক/খ/গ, মেডিকেল, BUET ও ইঞ্জিনিয়ারিং, GST ক্লাস্টার। প্রতিটি ট্র্যাকের জন্য আলাদা প্রশ্ন ব্যাংক ও মডেল টেস্ট।",
  },
  {
    q: "AI টিউটর কীভাবে কাজ করে?",
    a: "Porikkhangon AI-কে যেকোনো প্রশ্ন বা সমাধানের ধাপ জিজ্ঞেস করতে পারো বাংলায়। এছাড়া প্রতিটি ভুল উত্তর অধ্যায় ও টপিক ধরে ট্র্যাক হয়, তাই দুর্বল জায়গাগুলো রিপোর্টে স্পষ্ট দেখা যায়।",
  },
  {
    q: "ইন্টারনেট ছাড়া কাজ করবে?",
    a: "অ্যাপটি PWA — হোম স্ক্রিনে ইনস্টল করলে অ্যাপ-শেল অফলাইনেও লোড হয়। নতুন প্রশ্ন লোড ও স্কোর সিংক করার জন্য ইন্টারনেট লাগবে।",
  },
  {
    q: "পেমেন্ট কীভাবে করব?",
    a: "bKash ও Nagad — দুইভাবেই পেমেন্ট করা যায়। পেমেন্টের পর কোর্স/ব্যাচ অ্যাক্সেস অটোমেটিক চালু হয়ে যায়। সমস্যা হলে টেলিগ্রামে নক দাও।",
  },
  {
    q: "আমার ভুল প্রশ্নগুলো কি হারিয়ে যাবে?",
    a: "না। ভুল করা প্রশ্নগুলো 'ভুল প্রশ্ন' তালিকায় আর সেভ করা প্রশ্নগুলো 'সেভড' তালিকায় জমা থাকে — পরে এক ক্লিকে রিভিশন দেওয়া যায়।",
  },
  {
    q: "মোবাইলে নাকি ল্যাপটপে — কোনটা ভালো?",
    a: "দুটোতেই। ডিজাইন মোবাইল-ফার্স্ট, তাই ফোনেই পূর্ণ অভিজ্ঞতা; ল্যাপটপে বড় স্ক্রিনে এক্সাম দেওয়া আরও আরামদায়ক।",
  },
];

/* ── Footer ── */
export interface FooterCol {
  title: string;
  links: { label: string; href: string }[];
}

export const footerCols: FooterCol[] = [
  {
    title: "প্রোডাক্ট",
    links: [
      { label: "প্রশ্ন ব্যাংক", href: "/qbank" },
      { label: "এক্সাম জোন", href: "/exams" },
      { label: "AI টিউটর", href: "/bot" },
      { label: "কুইজ ব্যাটল", href: "/battle" },
      { label: "লিডারবোর্ড", href: "/leaderboard" },
    ],
  },
  {
    title: "প্রস্তুতি",
    links: [
      { label: "ভর্তি তথ্য", href: "/admission" },
      { label: "কোর্সসমূহ", href: "/courses" },
      { label: "ডেইলি চ্যালেঞ্জ", href: "/challenges" },
      { label: "স্টাডি প্ল্যানার", href: "/planner" },
      { label: "এক্সাম ইতিহাস", href: "/history" },
    ],
  },
  {
    title: "সাপোর্ট",
    links: [
      { label: "টেলিগ্রাম কমিউনিটি", href: "https://t.me/porikkhangon" },
      { label: "প্রাইভেসি পলিসি", href: "/privacy" },
      { label: "টার্মস অব সার্ভিস", href: "/terms" },
      { label: "রিফান্ড পলিসি", href: "/refund" },
    ],
  },
];
