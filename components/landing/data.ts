/* ─────────────────────────────────────────────────────────────
   Porikkhangon (পরীক্ষাঙ্গন) — landing content
   SSC · HSC · Admission ONLY — the landing never talks about
   government-job exams (no BCS / bank / NTRCA / primary-teacher copy).

   The question + showcase + testimonial content comes from the previous
   landing page (`git show HEAD:components/landing/data.ts`); the design
   layer that renders it comes from premium-edtech-landing-page.zip.
   ───────────────────────────────────────────────────────────── */

/* ── Exam strip: the marquee right under the hero ── */
export const EXAM_STRIP = [
  "এসএসসি বোর্ড প্রস্তুতি",
  "এইচএসসি বোর্ড প্রস্তুতি",
  "ঢাবি ‘ক’ ইউনিট",
  "ঢাবি ‘খ’ ইউনিট",
  "চট্টগ্রাম বিশ্ববিদ্যালয়",
  "রাজশাহী বিশ্ববিদ্যালয়",
  "জাহাঙ্গীরনগর ‘ক’ ইউনিট",
  "মেডিকেল ভর্তি পরীক্ষা",
  "বুয়েট প্রশ্ন প্রস্তুতি",
  "ইঞ্জিনিয়ারিং ভর্তি",
  "GST গুচ্ছ ভর্তি",
  "কৃষি গুচ্ছ ভর্তি",
];

/* ── Subjects that scroll under the exam strip ── */
export const subjects = [
  "Physics পদার্থবিজ্ঞান",
  "Chemistry রসায়ন",
  "Higher Math উচ্চতর গণিত",
  "Biology জীববিজ্ঞান",
  "Bangla বাংলা",
  "English ইংরেজি",
  "ICT তথ্য ও যোগাযোগ প্রযুক্তি",
  "Botany উদ্ভিদবিজ্ঞান",
  "Zoology প্রাণিবিজ্ঞান",
  "General Knowledge সাধারণ জ্ঞান",
];

/* ── Institutions our students come from ── */
export const schools = [
  "Notre Dame College",
  "Dhaka Residential Model",
  "Viqarunnisa Noon School",
  "Rajuk Uttara Model College",
  "Holy Cross College",
  "Adamjee Cantonment College",
  "Ideal School & College",
  "Chittagong College",
  "Govt. Science College",
  "BAF Shaheen College",
];

/* ── Interactive question demo (hero) ── */
export interface DemoQuestion {
  tag: string;
  tagBn: string;
  subject: string;
  question: string;
  options: string[];
  answer: number;
  solution: string;
}

export const demoQuestions: DemoQuestion[] = [
  {
    tag: "SSC · Physics",
    tagBn: "পদার্থবিজ্ঞান · ১ম অধ্যায়",
    subject: "SSC",
    question: "নিচের কোনটি ভেক্টর রাশি?",
    options: ["দ্রুতি", "বেগ", "তাপমাত্রা", "কাজ"],
    answer: 1,
    solution: "বেগের মান ও দিক — দুটোই আছে, তাই এটি ভেক্টর রাশি। দ্রুতি, তাপমাত্রা ও কাজ স্কেলার রাশি।",
  },
  {
    tag: "HSC · Chemistry",
    tagBn: "রসায়ন · অ্যাসিড-ক্ষার",
    subject: "HSC",
    question: "pH = 4 দ্রবণে H⁺ আয়নের ঘনমাত্রা কত?",
    options: ["10⁻³ M", "10⁻⁴ M", "10⁻⁵ M", "4 M"],
    answer: 1,
    solution: "pH = −log[H⁺] বলে [H⁺] = 10⁻⁴ মোল/লিটার।",
  },
  {
    tag: "Admission · English",
    tagBn: "ইংরেজি · Vocabulary",
    subject: "DU-Ka",
    question: "Choose the correct synonym of “Candid” —",
    options: ["Rude", "Frank", "Silent", "Clever"],
    answer: 1,
    solution: "Candid অর্থ স্পষ্টভাষী (frank) — ঢাবি ‘ক’ ইউনিট ২০২২-২৩ ভর্তি পরীক্ষার প্রশ্ন।",
  },
  {
    tag: "SSC · Bangla",
    tagBn: "বাংলা · শব্দার্থ",
    subject: "SSC",
    question: "“অগ্নি” শব্দের সমার্থক কোনটি?",
    options: ["নগেন্দ্র", "পাবক", "বরুণ", "পবন"],
    answer: 1,
    solution: "পাবক অর্থ অগ্নি। নগেন্দ্র = পাহাড়, বরুণ = সমুদ্র, পবন = বাতাস।",
  },
];

/* ── Showcase tabs: SSC · HSC · Admission ── */
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
    id: "ssc",
    label: "SSC",
    labelBn: "এসএসসি",
    headline: "Board-ready before the board knows it",
    copy: "Chapter-wise practice, school test papers and full-length মডেল টেস্ট that mirror every board's interface and timing.",
    bullets: [
      { title: "অধ্যায়ভিত্তিক অনুশীলন", desc: "NCTB-ভিত্তিক প্রতিটি অধ্যায় থেকে হাজারো MCQ, সহজ থেকে কঠিন — ধাপে ধাপে।" },
      { title: "১৫ বছরের বোর্ড প্রশ্ন", desc: "সব বোর্ডের পুরনো প্রশ্ন, ব্যাখ্যাসহ সমাধান ও চিত্র-সহ ধাপে ধাপে বোর্ড উত্তর।" },
      { title: "GPA ক্যালকুলেটর", desc: "প্রতিটি মকের পর অনুমান করা GPA, subject-wise দুর্বলতার ম্যাপসহ।" },
    ],
    mock: {
      exam: "SSC Model Test — পদার্থবিজ্ঞান",
      chip: "২৫ মিনিট",
      rows: [
        { name: "ভৌত রাশি ও পরিমাপ", progress: 92, accent: true },
        { name: "গতি", progress: 74 },
        { name: "বল", progress: 51 },
        { name: "কাজ, ক্ষমতা ও শক্তি", progress: 63 },
      ],
      statLabel: "Predicted GPA",
      statValue: "5.00",
      statDelta: "+0.42 এই মাসে",
    },
  },
  {
    id: "hsc",
    label: "HSC",
    labelBn: "এইচএসসি",
    headline: "Turn huge syllabus into tiny daily wins",
    copy: "Paper-1 ও Paper-2 আলাদা ট্র্যাক, কলেজ টেস্ট পেপার আর MCQ+লিখিত কম্বো প্র্যাকটিস — syllabus শেষ হবে সময়ের আগেই।",
    bullets: [
      { title: "MCQ + লিখিত কম্বো", desc: "একই অধ্যায়ে দুই ফরম্যাটে অনুশীলন — CQ গঠন মনে রাখার স্মার্ট নোটসহ।" },
      { title: "টপ কলেজ টেস্ট পেপার", desc: "নটর ডেম, ঢাকা কলেজ, হলি ক্রস-সহ ৫০+ কলেজের টেস্ট পেপার এক জায়গায়।" },
      { title: "সংক্ষিপ্ত সিলেবাস মোড", desc: "সিলেবাস কমলে অটো-আপডেট — কোন প্রশ্ন বাদ যাবে সেটাও চিহ্নিত।" },
    ],
    mock: {
      exam: "HSC রেডিনেস — উচ্চতর গণিত ১ম পত্র",
      chip: "৪০ মিনিট",
      rows: [
        { name: "ম্যাট্রিক্স ও নির্ণায়ক", progress: 88, accent: true },
        { name: "জটিল সংখ্যা", progress: 66 },
        { name: "বীজগাণিতীয় রাশি", progress: 79 },
        { name: "সরলরেখা", progress: 45 },
      ],
      statLabel: "সিলেবাস কভারড",
      statValue: "81%",
      statDelta: "পরিকল্পনা অনুযায়ী",
    },
  },
  {
    id: "admission",
    label: "Admission",
    labelBn: "অ্যাডমিশন",
    headline: "Fight for one seat. Train for all of them",
    copy: "ঢাবি ক-খ-গ, মেডিকেল, ইঞ্জিনিয়ারিং — unit-wise প্রশ্ন ব্যাংক, negative marking আর time-attack মোডে প্রস্তুতি।",
    bullets: [
      { title: "ইউনিট-ভিত্তিক ব্যাংক", desc: "ঢাবি, চাবি, রাবি, জাবি, মেডিকেল, GST — প্রতিটি ইউনিটের ১০ বছরের প্রশ্ন।" },
      { title: "টাইম-অ্যাটাক মোড", desc: "প্রতি প্রশ্নে ৪৫ সেকেন্ড — রিয়েল অ্যাডমিশন হলের চাপকে অভ্যাসে পরিণত করো।" },
      { title: "Merit সিমুলেটর", desc: "তোমার স্কোর দিয়ে পুরনো merit list-এ কততম হতে, সেটার live সিমুলেশন।" },
    ],
    mock: {
      exam: "DU ক-ইউনিট সিমুলেশন",
      chip: "৪৫ সেকেন্ড/প্রশ্ন",
      rows: [
        { name: "Physics", progress: 84, accent: true },
        { name: "Chemistry", progress: 71 },
        { name: "Math", progress: 58 },
        { name: "English", progress: 76 },
      ],
      statLabel: "Merit স্কোর",
      statValue: "112.5",
      statDelta: "গতবারের কাট-অফ ৯৮",
    },
  },
];

/* ── Guidebook comparison (previous landing page's fair-comparison table) ── */
export const comparisonRows = [
  { label: "প্রশ্নের পরিমাণ", old: "গাইডবুকে ২–৩ হাজার প্রশ্ন", new: "৫২,০০০+ যাচাই করা প্রশ্ন" },
  { label: "ভুলের বিশ্লেষণ", old: "নিজে খাতায় হিসাব রাখা", new: "AI অধ্যায়-ভিত্তিক রিপোর্ট" },
  { label: "মক এক্সাম", old: "মাসে ১–২টা, খাতায়", new: "প্রতিদিন live, instant রেজাল্ট" },
  { label: "সমাধান", old: "সিরিয়াল ভুলসহ ছাপা উত্তর", new: "বই-রেফারেন্সসহ বাংলায় ধাপে ধাপে" },
  { label: "খরচ", old: "গাইড + কোচিং = ৳৫০০০+/মাস", new: "ফ্রিতেই শুরু, Pro মাত্র ৳২৯৯" },
];

/* ── Testimonials (SSC / HSC / Admission students only) ── */
export interface Testimonial {
  quote: string;
  name: string;
  org: string;
  result: string;
  exam: string;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "অ্যানালিটিক্স ড্যাশবোর্ড দেখে জানলাম পদার্থের 'চুম্বক' অধ্যায়ে আমার ৬৮% ভুল। এক সপ্তাহ শুধু সেটা ঠিক করলাম — বাকিটা ইতিহাস।",
    name: "নুসরাত জাহান মিম",
    org: "ভিকারুননিসা নুন স্কুল",
    result: "GPA-5 · Golden",
    exam: "SSC '25",
  },
  {
    quote:
      "Porikkhangon-এর মক টেস্টের ইন্টারফেস দেখে বোর্ড পরীক্ষার MCQ খাতা একদম চেনা চেনা লেগেছিল। চাপটাই কমে গিয়েছিল।",
    name: "আরিফুল ইসলাম",
    org: "নটর ডেম কলেজ",
    result: "GPA-5",
    exam: "HSC '24",
  },
  {
    quote: "টাইম-অ্যাটাক মোডে ৪ মাস প্র্যাকটিস করেছি। হলে ১২০ প্রশ্ন শেষ করে আমার ৯ মিনিট বাকি ছিল।",
    name: "সাদমান সাকিব",
    org: "ঢাকা বিশ্ববিদ্যালয়",
    result: "ক-ইউনিট · Merit ৩৭",
    exam: "Admission '25",
  },
  {
    quote: "মফস্বলে ভালো কোচিং নেই। ফোন আর Porikkhangon-ই আমার পুরো প্রস্তুতি — অফলাইন প্যাক নামিয়ে রাতে অনুশীলন করতাম।",
    name: "তানিয়া আক্তার",
    org: "ময়মনসিংহ গার্লস ক্যাডেট",
    result: "A+ · সব বিষয়ে",
    exam: "SSC '25",
  },
  {
    quote: "বন্ধুদের সাথে ১v১ ব্যাটল করতে করতে বুঝতেই পারিনি ৪০ হাজার প্রশ্ন প্র্যাকটিস হয়ে গেছে।",
    name: "রিফাত হাসান",
    org: "ঢাকা মেডিকেল কলেজ",
    result: "MBBS · Merit ২১১",
    exam: "Medical '25",
  },
];

/* ── Pricing (previous landing page's plans & amounts) ── */
export interface Plan {
  name: string;
  nameEn: string;
  monthly: number;
  yearly: number;
  tagline: string;
  cta: string;
  popular?: boolean;
  features: string[];
}

export const plans: Plan[] = [
  {
    name: "ফ্রি",
    nameEn: "Free",
    monthly: 0,
    yearly: 0,
    tagline: "অনুশীলন শুরু করার জন্যে সব",
    cta: "ফ্রিতে শুরু করো",
    features: [
      "প্রতিদিন ৫০টি প্রশ্ন প্র্যাকটিস",
      "সপ্তাহে ২টি লাইভ মক এক্সাম",
      "বেসিক স্কোর অ্যানালিটিক্স",
      "সব বিষয়ের স্যাম্পল চ্যাপ্টার",
      "কমিউনিটি লিডারবোর্ড",
    ],
  },
  {
    name: "প্রো",
    nameEn: "Pro",
    monthly: 299,
    yearly: 2490,
    tagline: "GPA-5 সেরা অস্ত্র",
    cta: "প্রো নিয়ে এগিয়ে যাও",
    popular: true,
    features: [
      "আনলিমিটেড প্রশ্ন ও মক এক্সাম",
      "AI দুর্বলতা রিপোর্ট + রিভিশন প্ল্যান",
      "১৫ বছরের বোর্ড আর্কাইভ (সলভড)",
      "বাংলায় ধাপে ধাপে সমাধান ও চিত্র",
      "অফলাইন প্রশ্ন প্যাক ডাউনলোড",
      "জাতীয় merit list-এ র‍্যাংক",
      "বিজ্ঞাপন-মুক্ত, সব ডিভাইসে",
    ],
  },
  {
    name: "অ্যাডমিশন বান্ডেল",
    nameEn: "Admission",
    monthly: 499,
    yearly: 3990,
    tagline: "ভার্সিটি যুদ্ধের ফুল আর্মারি",
    cta: "বান্ডেল নাও",
    features: [
      "Pro-এর সবকিছু, প্লাস —",
      "ক/খ/গ ইউনিট + মেডিকেল প্রশ্ন ব্যাংক",
      "১০ বছরের ভার্সিটি প্রশ্ন সলভড",
      "টাইম-অ্যাটাক ও merit সিমুলেটর",
      "মাসে ২টি লাইভ সলভ ক্লাস",
    ],
  },
];

/* ── FAQ ── */
export interface Faq {
  q: string;
  a: string;
}

export const faqs: Faq[] = [
  {
    q: "Porikkhangon কি সত্যিই ফ্রি?",
    a: "হ্যাঁ! ফ্রি প্ল্যানে প্রতিদিন ৫০টি প্রশ্ন, সাপ্তাহিক লাইভ মক আর বেসিক অ্যানালিটিক্স চিরকালের জন্য ফ্রি। শুরু করা সম্পূর্ণ ফ্রি — ইমেইল দিয়ে সাইন আপ করলেই শুরু।",
  },
  {
    q: "কোন বোর্ড ও সিলেবাস কভার করা আছে?",
    a: "ঢাকা, রাজশাহী, দিনাজপুর, কুমিল্লা, চট্টগ্রাম, বরিশাল, সিলেট, যশোর ও ময়মনসিংহ — সব ৯টি সাধারণ বোর্ড এবং মাদ্রাসা ও কারিগরি বোর্ডের NCTB সিলেবাস অধ্যায়ভিত্তিকভাবে ম্যাপ করা।",
  },
  {
    q: "প্রশ্নগুলো কি NCTB বই অনুযায়ী?",
    a: "পুরোপুরি। প্রতিটি প্রশ্নে NCTB অধ্যায় ও টপিক ট্যাগ করা থাকে, আর সিলেবাস বা শর্ট-সিলেবাস বদলালে ৭২ ঘণ্টার মধ্যে প্রশ্ন ব্যাংক আপডেট হয়।",
  },
  {
    q: "ইন্টারনেট না থাকলে অনুশীলন করা যাবে?",
    a: "Pro প্ল্যানে যেকোনো অধ্যায়ের প্রশ্ন প্যাক অফলাইনে ডাউনলোড করা যায়। অনুশীলন শেষে নেট আসলে স্কোর ও অ্যানালিটিক্স অটো-সিংক হয়ে যাবে।",
  },
  {
    q: "অ্যাডমিশন বান্ডেলে কোন কোন ইউনিট আছে?",
    a: "ঢাবি ক-খ-গ, চাবি, রাবি, জাবি, ঢাবি-অ্যাফিলিয়েট, GST ক্লাস্টার, মেডিকেল, ডেন্টাল, BUET-রো প্রস্তুতি ট্র্যাক — সব ইউনিটের ১০ বছরের প্রশ্ন সলভড।",
  },
  {
    q: "বাবা-মা কি আমার প্রোগ্রেস দেখতে পারবেন?",
    a: "পারবেন! প্রতি শুক্রবার অভিভাবকের মেইলে সাপ্তাহিক প্রোগ্রেস রিপোর্ট যায় — সাপ্তাহিক স্কোর, দুর্বল অধ্যায় আর স্ট্রিক সহ।",
  },
  {
    q: "সাবস্ক্রিপশন বাতিল করা যায়?",
    a: "যেকোনো সময় এক ট্যাপে বাতিল। বাকি দিনগুলোও পুরো Pro এক্সেস থাকবে, আর ৭ দিনের মধ্যে বাতিল করলে সম্পূর্ণ টাকা ফেরত।",
  },
];
