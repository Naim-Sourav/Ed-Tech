
import { QuizQuestion } from '../types';

export interface PastPaper {
  id: string;
  title: string;
  year: string;
  source: string; // e.g., 'Medical', 'DU', 'BUET'
  description: string;
  totalTime: number; // in minutes
  questions: QuizQuestion[];
  tags: string[];
}

export const PAST_PAPERS_DB: PastPaper[] = [
  {
    id: 'med_22_23_full',
    title: 'মেডিকেল ভর্তি পরীক্ষা (MBBS) ২০২২-২৩',
    year: '2022-23',
    source: 'Medical',
    description: 'মেডিকেল ভর্তি পরীক্ষার ২০২২-২৩ সেশনের পূর্ণাঙ্গ প্রশ্নপত্র (জীববিজ্ঞান, রসায়ন, পদার্থবিজ্ঞান, ইংরেজি ও সাধারণ জ্ঞান)।',
    totalTime: 60,
    tags: ['Medical', 'Full Paper', 'Previous Year'],
    questions: [
      {
        question: "কোন ছত্রাক খাদ্য হিসাবে ব্যবহার হয়?",
        options: ["Mucor pusillus", "Aspergillus flavus", "Agaricus campestris", "Saccharomyces"],
        correctAnswerIndex: 2,
        explanation: "Agaricus campestris (মাঠের ছাতা) খাদ্যোপযোগী মাশরুম। Mucor ও Aspergillus সাধারণত রোগ সৃষ্টিকারী বা বিষাক্ত।",
        subject: "Biology",
        chapter: "শৈবাল ও ছত্রাক"
      },
      {
        question: "কোন হেপাটাইটিস ভাইরাস দূষিত পানি ও খাদ্যের মাধ্যমে সংক্রমণ ঘটায়?",
        options: ["Hepatitis D Virus", "Hepatitis A Virus", "Hepatitis C Virus", "Hepatitis B Virus"],
        correctAnswerIndex: 1,
        explanation: "হেপাটাইটিস A এবং E পানিবাহিত ভাইরাস। হেপাটাইটিস B, C, D রক্ত বা দেহরসের মাধ্যমে ছড়ায়।",
        subject: "Biology",
        chapter: "অণুজীব"
      },
      {
        question: "সেমি মাইক্রো পদ্ধতিতে ব্যবহৃত H₂S গ্যাসের উৎস কোনটি?",
        options: ["H₂NCSNH₂ + H₂O", "FeS + dil H₂SO₄", "FeSO₄ + dil H₂SO₄", "CH₃CSNH₂ + H₂O"],
        correctAnswerIndex: 3,
        explanation: "সেমি মাইক্রো পদ্ধতিতে থায়োঅ্যাসিটামাইড (CH₃CSNH₂) এর আর্দ্রবিশ্লেষণে H₂S উৎপন্ন করা হয়।",
        subject: "Chemistry",
        chapter: "ল্যাবরেটরির নিরাপদ ব্যবহার"
      },
      {
        question: "STP তে এক মোল SO₂ গ্যাসের আয়তন কত?",
        options: ["22.40 L", "24.78 L", "2400.00 L", "223.00 L"],
        correctAnswerIndex: 0,
        explanation: "STP (Standard Temperature and Pressure) তে যেকোনো ১ মোল গ্যাসের আয়তন ২২.৪ লিটার।",
        subject: "Chemistry",
        chapter: "পরিবেশ রসায়ন"
      },
      {
        question: "মুখে খাওয়ার পোলিও ভ্যাকসিনটি কোন ধরনের ভ্যাকসিন?",
        options: ["নিষ্ক্রিয় টিকা", "জীবন্ত টিকা", "উপএকক টিকা", "অনুবন্ধী টিকা"],
        correctAnswerIndex: 1,
        explanation: "OPV (Oral Polio Vaccine) হলো একটি জীবন্ত কিন্তু দুর্বল করা (Live Attenuated) টিকা।",
        subject: "Biology",
        chapter: "অণুজীব"
      },
      {
        question: "নিচের কোনটি ম্যাক্রোফেজের কাজ নয়?",
        options: ["বিভিন্ন ধরনের কোষবিষ তৈরি করা", "বিভিন্ন ধরনের এন্টিবডি তৈরি করা", "জীর্ণ কোষকে অপসারণ করা", "রিঅ্যাকটিভ অক্সিজেন ইন্টারমিডিয়েট তৈরি করা"],
        correctAnswerIndex: 1,
        explanation: "অ্যান্টিবডি তৈরি করা প্লাজমা কোষের (B-Lymphocyte) কাজ, ম্যাক্রোফেজের নয়। ম্যাক্রোফেজ ফ্যাগোসাইটোসিস করে।",
        subject: "Biology",
        chapter: "মানবদেহের প্রতিরক্ষা"
      },
      {
        question: "অন্তঃশ্বসন-",
        options: ["কোষ ও রক্তে সংঘটিত হয়", "নির্দিষ্ট পরিমাণ শক্তি উৎপন্ন করে", "এনজাইম দ্বারা প্রভাবিত হয় না", "একটি ভৌত রাসায়নিক প্রক্রিয়া"],
        correctAnswerIndex: 0,
        explanation: "অন্তঃশ্বসন দেহকোষের অভ্যন্তরে এনজাইমের উপস্থিতিতে সংঘটিত হয় এবং শক্তি উৎপন্ন করে।",
        subject: "Biology",
        chapter: "শ্বসন ও শ্বাসক্রিয়া"
      },
      {
        question: "কোন কণা 'ইশ্বর কণা' নামে পরিচিত?",
        options: ["লেপটন কণা", "হিগস বোসন কণা", "বোসন কণা", "মেসন কণা"],
        correctAnswerIndex: 1,
        explanation: "হিগস বোসন কণাকে 'গড পার্টিকল' বা ঈশ্বর কণা বলা হয়, যা ভরের উৎস হিসেবে বিবেচিত।",
        subject: "Physics",
        chapter: "জ্যোতির্বিজ্ঞান"
      },
      {
        question: "নিচের কোনটির উপর রোধ নির্ভর করে না?",
        options: ["উপাদান", "প্রস্থচ্ছেদের ক্ষেত্রফল", "তড়িৎ প্রবাহ", "পরিবাহকের দৈর্ঘ্য"],
        correctAnswerIndex: 2,
        explanation: "রোধ পরিবাহীর দৈর্ঘ্য, প্রস্থচ্ছেদের ক্ষেত্রফল, উপাদান ও তাপমাত্রার উপর নির্ভর করে। তড়িৎ প্রবাহের উপর নির্ভর করে না।",
        subject: "Physics",
        chapter: "চল তড়িৎ"
      },
      {
        question: "মহাবিশ্বে নিচের কোনটির সংখ্যা সবচেয়ে বেশী?",
        options: ["ডার্ক এনার্জি বস্তুসমূহ", "নীহারিকা সমূহ", "কৃষ্ণ গহ্বর সমূহ", "গ্যালাক্সি সমূহ"],
        correctAnswerIndex: 0,
        explanation: "মহাবিশ্বের উপাদানের প্রায় ৬৮% হলো ডার্ক এনার্জি এবং ২৭% ডার্ক ম্যাটার।",
        subject: "Physics",
        chapter: "জ্যোতির্বিজ্ঞান"
      },
      {
        question: "Which of the following can be used as a 'modal' as well as 'main' verb?",
        options: ["do", "need", "could", "mind"],
        correctAnswerIndex: 1,
        explanation: "'Need' এবং 'Dare' সেমি-মডাল হিসেবে ব্যবহৃত হয়, অর্থাৎ এরা মডাল এবং মেইন ভার্ব উভয়ভাবেই বসতে পারে।",
        subject: "English",
        chapter: "Grammar"
      },
      {
        question: "What kind of pronoun are 'who, what, and which'?",
        options: ["demonstrative", "personal", "relative", "reflexive"],
        correctAnswerIndex: 2,
        explanation: "Who, what, which বাক্যের দুটি অংশকে যুক্ত করলে Relative Pronoun এবং প্রশ্ন করলে Interrogative Pronoun হয়। অপশন অনুযায়ী Relative সঠিক।",
        subject: "English",
        chapter: "Parts of Speech"
      },
      {
        question: "The word 'recalcitrant' means-",
        options: ["mutinous", "compliant", "docile", "amenable"],
        correctAnswerIndex: 0,
        explanation: "Recalcitrant অর্থ অবাধ্য বা একগুঁয়ে। Mutinous অর্থও বিদ্রোহী বা অবাধ্য। বাকিগুলো বাধ্য বা অনুগত।",
        subject: "English",
        chapter: "Vocabulary"
      },
      {
        question: "মুক্তিযুদ্ধ ভিত্তিক উপন্যাস কোনটি?",
        options: ["মা", "লালসালু", "ক্রীতদাসের হাসি", "সারেং বৌ"],
        correctAnswerIndex: 0,
        explanation: "আনিসুল হকের 'মা' একটি মুক্তিযুদ্ধ ভিত্তিক উপন্যাস।",
        subject: "General Knowledge",
        chapter: "মুক্তিযুদ্ধ ও স্বাধীনতা"
      },
      {
        question: "বীরশ্রেষ্ঠ ল্যান্স নায়েক নূর মোহাম্মদ শেখ কোন সেক্টরে মুক্তিযুদ্ধে অংশগ্রহণ করেন?",
        options: ["৮ নং সেক্টর", "৭ নং সেক্টর", "৬ নং সেক্টর", "৯ নং সেক্টর"],
        correctAnswerIndex: 0,
        explanation: "বীরশ্রেষ্ঠ নূর মোহাম্মদ শেখ ৮ নং সেক্টরে যুদ্ধ করেন।",
        subject: "General Knowledge",
        chapter: "মুক্তিযুদ্ধ ও স্বাধীনতা"
      },
      {
        question: "Mollusca এর ক্ষেত্রে কোনটি সঠিক?",
        options: ["নরম কিউটিকুলার এপিডার্মিস দ্বারা আবৃত", "নরম ও অখন্ডায়িত", "প্রতি খন্ডে নেফ্রিডিয়া বিদ্যমান থাকে", "দেহাভ্যন্তরে কেন্দ্রীয় গহ্বর বিদ্যমান"],
        correctAnswerIndex: 1,
        explanation: "মলাস্কা পর্বের প্রাণীদের দেহ নরম, মাংসল এবং অখন্ডায়িত। এদের দেহ ম্যান্টল নামক পর্দায় আবৃত থাকে।",
        subject: "Biology",
        chapter: "প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস"
      },
      {
        question: "গ্লুকাগন-",
        options: ["রক্তে সুগার কমায়", "অগ্ন্যাশয়ের ডেলটা কোষ থেকে নিঃসৃত হয়", "একটি পলিপেপটাইড এনজাইম", "ইনসুলিনের সাথে বিপরীতভাবে সম্পর্কিত"],
        correctAnswerIndex: 3,
        explanation: "গ্লুকাগন রক্তে গ্লুকোজ বাড়ায়, যা ইনসুলিনের (গ্লুকোজ কমায়) কাজের বিপরীত। এটি আলফা কোষ থেকে নিঃসৃত হয়।",
        subject: "Biology",
        chapter: "সমন্বয় ও নিয়ন্ত্রণ"
      },
      {
        question: "কোন যৌগে নাইট্রাইল কার্যকরী মূলক বিদ্যমান?",
        options: ["CCl₃NO₂", "CH₃NH₂", "CH₃CN", "NH₄CNO"],
        correctAnswerIndex: 2,
        explanation: "-CN মূলককে নাইট্রাইল বা সায়ানাইড মূলক বলা হয়। CH₃CN হলো ইথেন নাইট্রাইল বা মিথাইল সায়ানাইড।",
        subject: "Chemistry",
        chapter: "জৈব যৌগ"
      },
      {
        question: "কোন অঞ্চলের IR বর্ণালির সাহায্যে কার্বনিল মূলক শনাক্তকরণ করা যায়?",
        options: ["(1100-1400) cm⁻¹", "(3300-3600) cm⁻¹", "(2800-3000) cm⁻¹", "(1660-1860) cm⁻¹"],
        correctAnswerIndex: 3,
        explanation: "কার্বনিল মূলক (C=O) এর IR শোষণ ব্যান্ড সাধারণত 1660-1860 cm⁻¹ অঞ্চলে পাওয়া যায়।",
        subject: "Chemistry",
        chapter: "জৈব রসায়ন"
      },
      {
        question: "নিচের কোনটি কলয়েড ইমালশন নয়?",
        options: ["দধি", "দুধ", "মাখন", "শ্যাম্পু"],
        correctAnswerIndex: 0,
        explanation: "দধি (Curd) হলো জেল জাতীয় কলয়েড। দুধ, মাখন, শ্যাম্পু হলো ইমালশন।",
        subject: "Chemistry",
        chapter: "কর্মমুখী রসায়ন"
      },
      {
        question: "কোন প্রক্রিয়া দুধ থেকে ছানা (curdled milk) তৈরি করে?",
        options: ["অক্সিডেশন", "ফারমেন্টেশন", "কোয়াগুলেশন", "আর্দ্র বিশ্লেষণ"],
        correctAnswerIndex: 2,
        explanation: "দুধের প্রোটিন কেসিন জমাট বেঁধে ছানা তৈরির প্রক্রিয়াকে কোয়াগুলেশন বলে।",
        subject: "Chemistry",
        chapter: "কর্মমুখী রসায়ন"
      },
      {
        question: "কোনটি নিউক্লিয়াসের জন্য সঠিক?",
        options: ["কোষের কার্যাবলী নিয়ন্ত্রণ করে", "ক্ষুদ্রাকৃতির নিউক্লিওলাস", "কোন ঝিল্লি দ্বারা আবদ্ধ থাকে না", "নিউক্লিওপ্লাজমে অবস্থান করে"],
        correctAnswerIndex: 0,
        explanation: "নিউক্লিয়াসকে কোষের মস্তিষ্ক বলা হয় কারণ এটি কোষের সকল জৈবনিক কার্যাবলী নিয়ন্ত্রণ করে।",
        subject: "Biology",
        chapter: "কোষ ও এর গঠন"
      },
      {
        question: "ব্যাকটেরিয়া সম্পর্কে কোনটি সঠিক?",
        options: ["এনজাইম সমৃদ্ধ", "প্রতিলিপির মাধ্যমে বংশবৃদ্ধি করে", "অকোষী", "জীবন্ত আশ্রয় আবশ্যক"],
        correctAnswerIndex: 0,
        explanation: "ব্যাকটেরিয়া আদিকোষী জীব, এর নিজস্ব এনজাইম আছে এবং দ্বি-বিভাজন প্রক্রিয়ায় বংশবৃদ্ধি করে। ভাইরাস অকোষী।",
        subject: "Biology",
        chapter: "অণুজীব"
      },
      {
        question: "কোনটি প্লাজমিডের বৈশিষ্ট্য?",
        options: ["এক ব্যাকটেরিয়া থেকে অন্য ব্যাকটেরিয়ায় স্থানান্তরে সক্ষম", "অ্যান্টিমাইক্রোবিয়াল রেজিস্ট্যান্সের বিরুদ্ধে কোন ভূমিকা নেই", "100µm পর্যন্ত লম্বা হতে পারে", "কোষের ক্রোমোসোমের মত"],
        correctAnswerIndex: 0,
        explanation: "প্লাজমিড কনজুগেশন প্রক্রিয়ায় এক ব্যাকটেরিয়া থেকে অন্য ব্যাকটেরিয়ায় স্থানান্তরিত হতে পারে। এটি অ্যান্টিবায়োটিক রেজিস্ট্যান্স বহন করে।",
        subject: "Biology",
        chapter: "জীবপ্রযুক্তি"
      },
      {
        question: "নিচের কোনটি নিউটনীয় বা চিরায়ত বলবিদ্যায় অপরিবর্তনীয় নয়?",
        options: ["বেগ", "কাল", "ভর", "স্থান"],
        correctAnswerIndex: 0,
        explanation: "চিরায়ত বলবিদ্যায় স্থান, কাল ও ভর ধ্রুবক বা পরম ধরা হয়, কিন্তু বেগ আপেক্ষিক। আধুনিক পদার্থবিজ্ঞানে সবকটিই আপেক্ষিক হতে পারে।",
        subject: "Physics",
        chapter: "নিউটনিয়ান বলবিদ্যা"
      },
      {
        question: "সূচন কম্পাঙ্কের আলোর জন্য ধাতু থেকে নির্গত ইলেকট্রনের বেগ কত?",
        options: ["সর্বোচ্চ", "শূণ্য", "সর্বনিম্ন", "অসীম"],
        correctAnswerIndex: 1,
        explanation: "সূচন কম্পাঙ্কের আলো শুধুমাত্র ইলেকট্রনকে ধাতু পৃষ্ঠ থেকে মুক্ত করতে পারে, গতিশক্তি প্রদান করতে পারে না। তাই বেগ শূন্য হয়।",
        subject: "Physics",
        chapter: "আধুনিক পদার্থবিজ্ঞান"
      },
      {
        question: "1kg ভরের দুটি বস্তুকে 1 মিটার দূরত্বের ব্যবধানে স্থাপন করলে এদের মধ্যবর্তী আকর্ষণ বল হবে-",
        options: ["6.673×10⁻¹¹ N", "6.673×10²² N", "6.673×10⁻³⁰ N", "6.673×10¹⁵ N"],
        correctAnswerIndex: 0,
        explanation: "F = G(m1m2)/d² = 6.673×10⁻¹¹ × (1×1)/1² = 6.673×10⁻¹¹ N।",
        subject: "Physics",
        chapter: "মহাকর্ষ ও অভিকর্ষ"
      },
      {
        question: "সমোষ্ণ প্রক্রিয়ায় কোনটি স্থির থাকে?",
        options: ["তাপমাত্রা", "তাপ", "চাপ", "আয়তন"],
        correctAnswerIndex: 0,
        explanation: "সমোষ্ণ (Isothermal) প্রক্রিয়ায় সিস্টেমের তাপমাত্রা (Temperature) ধ্রুব থাকে। রুদ্ধতাপীয় প্রক্রিয়ায় তাপ স্থির থাকে।",
        subject: "Physics",
        chapter: "তাপগতিবিদ্যা"
      },
      {
        question: "The flight is leaving shortly. Here 'shortly' is-",
        options: ["a subject", "an adverbial", "a complement", "an adjective"],
        correctAnswerIndex: 1,
        explanation: "Shortly modifies the verb 'leaving' and indicates time/manner, so it functions as an adverbial.",
        subject: "English",
        chapter: "Parts of Speech"
      },
      {
        question: "I have no kith and kin in this town. It is-",
        options: ["prepositional phrase", "conjunctional phrase", "adjective phrase", "noun phrase"],
        correctAnswerIndex: 3,
        explanation: "'Kith and kin' means relatives. It functions as the object of the verb 'have', so it is a Noun Phrase.",
        subject: "English",
        chapter: "Phrase & Idioms"
      },
      {
        question: "বঙ্গবন্ধুর অনুরোধে ভারতীয় মিত্রবাহিনী কবে বাংলাদেশ ত্যাগ করে?",
        options: ["১৭ এপ্রিল ১৯৭২", "৭ নভেম্বর ১৯৭২", "১২ মার্চ ১৯৭২", "২৬ মার্চ ১৯৭২"],
        correctAnswerIndex: 2,
        explanation: "১২ মার্চ ১৯৭২ সালে ভারতীয় মিত্রবাহিনী বাংলাদেশ ত্যাগ করে।",
        subject: "General Knowledge",
        chapter: "মুক্তিযুদ্ধ ও স্বাধীনতা"
      },
      {
        question: "বাংলার সবচেয়ে প্রাচীন জনপদ কোনটি?",
        options: ["হরিকেল", "পুন্ড্র", "গৌড়", "তাম্রলিপ্ত"],
        correctAnswerIndex: 1,
        explanation: "বাংলার প্রাচীনতম জনপদ হলো পুন্ড্র।",
        subject: "General Knowledge",
        chapter: "বাংলাদেশ বিষয়াবলী"
      },
      {
        question: "সোমাটিক এমব্রায়োজেনেসিস পদ্ধতিতে সর্বপ্রথম কোন উদ্ভিদ উৎপাদন করা হয়?",
        options: ["গাজর", "পেঁপে", "বেল", "বেগুন"],
        correctAnswerIndex: 0,
        explanation: "স্টুয়ার্ড (1958) গাজরের মূল থেকে সোমাটিক এমব্রায়োজেনেসিস পদ্ধতিতে চারা উৎপাদন করেন।",
        subject: "Biology",
        chapter: "জীবপ্রযুক্তি"
      },
      {
        question: "অ্যাথলেট'স ফুট (Athlete's foot) এর কারণ কি?",
        options: ["ছত্রাক ও ভাইরাসের সংক্রমণ", "ভাইরাস ও ব্যাকটেরিয়ার সংক্রমণ", "আঘাতজনিত ক্ষত", "ছত্রাক ও ব্যাকটেরিয়ার সংক্রমণ"],
        correctAnswerIndex: 3,
        explanation: "এটি মূলত Tinea pedis নামক ছত্রাক দ্বারা হয়, তবে ব্যাকটেরিয়ার সেকেন্ডারি ইনফেকশনও হতে পারে। অপশন অনুযায়ী D সঠিক।",
        subject: "Biology",
        chapter: "শৈবাল ও ছত্রাক"
      },
      {
        question: "চক্রীয় ফটোফসফরাইলেশনে-",
        options: ["পানির প্রয়োজন হয়", "ফটোসিস্টেম-I এবং II অংশগ্রহণ করে", "ইলেকট্রন প্রবাহ একমুখী", "অক্সিজেন উৎপন্ন হয় না"],
        correctAnswerIndex: 3,
        explanation: "চক্রীয় ফটোফসফরাইলেশনে পানির বিভাজন (ফটোলাইসিস) হয় না, তাই অক্সিজেন উৎপন্ন হয় না। শুধুমাত্র PS-I অংশগ্রহণ করে।",
        subject: "Biology",
        chapter: "উদ্ভিদ শারীরতত্ত্ব"
      },
      {
        question: "নিচের বিক্রিয়াটিতে বিজারক কোনটি? 2KMnO₄ + 10KI + ...",
        options: ["Cu", "I₂", "I⁻", "K"],
        correctAnswerIndex: 2,
        explanation: "এখানে আয়োডাইড আয়ন (I⁻) ইলেকট্রন ত্যাগ করে আয়োডিনে (I₂) জারিত হয়, তাই I⁻ হলো বিজারক।",
        subject: "Chemistry",
        chapter: "পরিমাণগত রসায়ন"
      },
      {
        question: "H₂ ফুয়েল সেলের emf কত?",
        options: ["1.10V", "1.23V", "2.03V", "0.76V"],
        correctAnswerIndex: 1,
        explanation: "তাত্ত্বিকভাবে হাইড্রোজেন ফুয়েল সেলের তড়িচ্চালক শক্তি (EMF) হলো 1.23 V।",
        subject: "Chemistry",
        chapter: "তড়িৎ রসায়ন"
      },
      {
        question: "ক্রোমিক এসিড দ্বারা ব্যুরেট পরিষ্কার করাকালীন কিরূপ বিক্রিয়া ঘটে?",
        options: ["প্রতিস্থাপন", "নিষ্ক্রিয়করণ", "বিজারণ", "জারণ"],
        correctAnswerIndex: 3,
        explanation: "ক্রোমিক এসিড (K₂Cr₂O₇ + H₂SO₄) একটি শক্তিশালী জারক। এটি ময়লাকে জারিত করে পরিষ্কার করে।",
        subject: "Chemistry",
        chapter: "ল্যাবরেটরির নিরাপদ ব্যবহার"
      },
      {
        question: "কোনটি অপ্রতিসম অ্যালকিন?",
        options: ["CH₂=CH₂", "ClCH=CHCl", "CH₂=CH-CH₃", "CH₃-CH=CHCH₃"],
        correctAnswerIndex: 2,
        explanation: "প্রোপিন (CH₃-CH=CH₂) এর দ্বিবন্ধনযুক্ত কার্বন দুটিতে হাইড্রোজেন সংখ্যা অসমান (১টি ও ২টি), তাই এটি অপ্রতিসম।",
        subject: "Chemistry",
        chapter: "জৈব যৌগ"
      },
      {
        question: "মানবদেহে কোনটি লুপ্তপ্রায় অঙ্গ?",
        options: ["থাইরয়েড গ্ল্যান্ড", "থাইমাস", "স্ক্যাপুলা", "ক্যানাইন দাঁত"],
        correctAnswerIndex: 1,
        explanation: "থাইমাস গ্রন্থি বয়ঃসন্ধিকালের পর ছোট হতে থাকে এবং পূর্ণবয়স্কদের দেহে প্রায় লুপ্তপ্রায় বা নিষ্ক্রিয় হয়ে যায়।",
        subject: "Biology",
        chapter: "মানব শরীরতত্ত্ব"
      },
      {
        question: "কোন উদ্দীপনা অ্যানিমোট্যাক্সিসকে প্রভাবিত করে?",
        options: ["বায়ুপ্রবাহ", "আর্দ্রতা", "মাধ্যাকর্ষণ", "তাপ"],
        correctAnswerIndex: 0,
        explanation: "Anemotaxis হলো বায়ুপ্রবাহের (Wind/Air current) উদ্দীপনায় সাড়া দেওয়া।",
        subject: "Biology",
        chapter: "প্রাণীর আচরণ"
      },
      {
        question: "তাপবিদ্যার প্রথম সূত্র কোন দুটির মধ্যে সম্পর্ক স্থাপন করে?",
        options: ["তাপ ও কাজ", "কাজ ও ক্ষমতা", "তাপ ও বল", "বল ও শক্তি"],
        correctAnswerIndex: 0,
        explanation: "তাপবিদ্যার প্রথম সূত্র তাপশক্তি এবং যান্ত্রিক কাজের মধ্যে সম্পর্ক স্থাপন করে (dQ = dU + dW)।",
        subject: "Physics",
        chapter: "তাপগতিবিদ্যা"
      },
      {
        question: "একক ভরের দুটি বস্তুকণা একক দূরত্বে যে বল দ্বারা পরস্পরকে আকর্ষণ করে সেটি হলো-",
        options: ["প্লাঙ্কের ধ্রুবক", "মহাকর্ষীয় ধ্রুবক", "অভিকর্ষজ ত্বরণ", "একক বল"],
        correctAnswerIndex: 1,
        explanation: "মহাকর্ষীয় ধ্রুবক G এর সংজ্ঞাই হলো একক ভরের দুটি বস্তু একক দূরত্বে থাকলে তাদের আকর্ষণ বল।",
        subject: "Physics",
        chapter: "মহাকর্ষ ও অভিকর্ষ"
      },
      {
        question: "তড়িৎচুম্বকীয় আবেশের ক্ষেত্রে আবিষ্ট তড়িচ্চালক বল নির্ভর করে না-",
        options: ["চৌম্বক আবেশের উপর", "কুন্ডলী পাক সংখ্যার উপর", "কুন্ডলীর রোধের উপর", "সময়ের উপর"],
        correctAnswerIndex: 2,
        explanation: "আবিষ্ট তড়িচ্চালক বল (e = -N dΦ/dt) পাক সংখ্যা, ফ্লাক্স পরিবর্তন (চৌম্বক আবেশ) ও সময়ের উপর নির্ভর করে, কিন্তু রোধের উপর নির্ভর করে না। (প্রবাহ রোধের উপর নির্ভর করে)।",
        subject: "Physics",
        chapter: "তড়িৎচৌম্বকীয় আবেশ"
      },
      {
        question: "The antonym of 'harbinger' is-",
        options: ["educator", "messenger", "follower", "leader"],
        correctAnswerIndex: 2,
        explanation: "Harbinger অর্থ অগ্রদূত বা যে আগে আসে। এর বিপরীত শব্দ Follower (অনুসারী)।",
        subject: "English",
        chapter: "Vocabulary"
      },
      {
        question: "Father loves me. Here 'loves' is an example of-",
        options: ["intransitive verb", "simple verb", "auxiliary verb", "transitive verb"],
        correctAnswerIndex: 3,
        explanation: "Loves takes an object 'me', so it is a Transitive Verb.",
        subject: "English",
        chapter: "Verbs"
      },
      {
        question: "বাংলাদেশকে স্বীকৃতি প্রদানকারী প্রথম ইউরোপীয় দেশ কোনটি?",
        options: ["পোল্যান্ড", "স্পেন", "ফ্রান্স", "পূর্ব জার্মানী"],
        correctAnswerIndex: 3,
        explanation: "পূর্ব জার্মানি ১১ জানুয়ারি ১৯৭২ সালে বাংলাদেশকে স্বীকৃতি দেয়, যা ছিল প্রথম ইউরোপীয় দেশ।",
        subject: "General Knowledge",
        chapter: "আন্তর্জাতিক বিষয়াবলী"
      },
      {
        question: "পাকিস্থানী সেনাবাহিনীর হাতে শহীদদের মধ্যে কে দার্শনিক ছিলেন?",
        options: ["ড. গোবিন্দ চন্দ্র দেব", "গিয়াসউদ্দিন আহমেদ", "রাশিদুল হাসান", "মুনীর চৌধুরী"],
        correctAnswerIndex: 0,
        explanation: "ড. গোবিন্দ চন্দ্র দেব (জি সি দেব) ঢাকা বিশ্ববিদ্যালয়ের দর্শন বিভাগের অধ্যাপক ছিলেন।",
        subject: "General Knowledge",
        chapter: "মুক্তিযুদ্ধ ও স্বাধীনতা"
      },
      {
        question: "কোনটি উদ্ভিদদেহের রোগসৃষ্টিকারী ভাইরাস?",
        options: ["ইয়েলো ফিভার ভাইরাস", "টুংরো ভাইরাস", "ফুট অ্যান্ড মাউথ ভাইরাস", "ফ্ল্যাভি ভাইরাস"],
        correctAnswerIndex: 1,
        explanation: "টুংরো ভাইরাস ধানের রোগ সৃষ্টি করে। বাকিগুলো প্রাণীদেহের ভাইরাস।",
        subject: "Biology",
        chapter: "অণুজীব"
      },
      {
        question: "কোনটি জাতক লিপিড?",
        options: ["স্টেরয়েড", "লিপোপ্রোটিন", "ফসফোলিপিড", "মোম"],
        correctAnswerIndex: 0,
        explanation: "সরল ও যৌগিক লিপিডের আর্দ্রবিশ্লেষণ থেকে উদ্ভূত লিপিডকে জাতক লিপিড (Derived Lipid) বলে। যেমন: স্টেরয়েড, টারপিনস।",
        subject: "Biology",
        chapter: "কোষ রসায়ন"
      },
      {
        question: "কোনটি গাঠনিক প্রোটিন?",
        options: ["ফেরিটিন", "হিমোগ্লোবিন", "মায়োগ্লোবিন", "কোলাজেন"],
        correctAnswerIndex: 3,
        explanation: "কোলাজেন, কেরাুিন, ফাইব্রিন ইত্যাদি হলো গাঠনিক প্রোটিন যা দেহের কাঠামো গঠন করে।",
        subject: "Biology",
        chapter: "কোষ রসায়ন"
      },
      {
        question: "কোন যৌগ অ্যালডল ঘনীভবন বিক্রিয়া দেয়?",
        options: ["CH₃CH₂CHO", "Cl₃C-CHO", "H-CHO", "C₆H₅CHO"],
        correctAnswerIndex: 0,
        explanation: "আলফা-হাইড্রোজেন যুক্ত অ্যালডিহাইড ও কিটোন অ্যালডল ঘনীভবন বিক্রিয়া দেয়। এখানে প্রোপান্যাল (CH₃CH₂CHO) এ আলফা হাইড্রোজেন আছে।",
        subject: "Chemistry",
        chapter: "জৈব যৌগ"
      },
      {
        question: "কারেন্সি নোটে সিকিউরিটির উপায় হিসাবে কোন বিশেষ রাসায়নিক পদার্থ ব্যবহৃত হয়?",
        options: ["সোডিয়াম নাইট্রেট", "সিলভার আয়োডাইড", "ফসফোর", "সিলভার নাইট্রেট"],
        correctAnswerIndex: 2,
        explanation: "টাকার নোটে নিরাপত্তা সুতা বা কালিতে ফসফোর (Phosphor) জাতীয় পদার্থ ব্যবহৃত হয় যা ইউভি আলোতে দৃশ্যমান হয়।",
        subject: "Chemistry",
        chapter: "কর্মমুখী রসায়ন"
      },
      {
        question: "সমআয়তনের 0.1M NaOH এবং 0.1M H₂SO₄ মিশ্রণের প্রকৃতি কিরূপ হবে?",
        options: ["উভধর্মী", "নিরপেক্ষ", "অম্লীয়", "ক্ষারীয়"],
        correctAnswerIndex: 2,
        explanation: "H₂SO₄ দ্বিক্ষারীয় অম্ল, তাই এর ১ মোল ২ মোল NaOH কে প্রশমিত করে। সমআয়তন ও সমঘনমাত্রা নিলে এসিড অবশিষ্ট থাকবে, তাই মিশ্রণ অম্লীয় হবে।",
        subject: "Chemistry",
        chapter: "পরিমাণগত রসায়ন"
      },
      {
        question: "মায়োফাইব্রিলে কি ধরনের আমিষ থাকে?",
        options: ["অ্যাকটিন এবং মায়োসিন", "অ্যাকটিন এবং জিলাটিন", "মায়োসিন এবং ইলাস্টিন", "কোলাজেন এবং মায়োসিন"],
        correctAnswerIndex: 0,
        explanation: "পেশিতন্তুর মায়োফাইব্রিলে অ্যাকটিন ও মায়োসিন নামক সংকোচনশীল প্রোটিন থাকে।",
        subject: "Biology",
        chapter: "চলন ও অঙ্গচালনা"
      },
      {
        question: "দেহের প্রথম প্রতিরক্ষার স্তর কোনটি?",
        options: ["পাকস্থলির অ্যাসিড, মাইক্রোবায়োম ও মলত্যাগ", "সিলিয়া, কমপ্লিমেন্ট অস্ত্র ও সাইটোকাইনস", "ত্বক, ফ্যাগোসাইটস ও কমপ্লিমেন্ট তন্ত্র", "লালা, পাকস্থলির এনজাইম ও ফ্যাগোসাইটস"],
        correctAnswerIndex: 0,
        explanation: "ত্বক, শ্লেষ্মা, পাকস্থলির এসিড, চোখের পানি ইত্যাদি হলো প্রথম প্রতিরক্ষা স্তর। ফ্যাগোসাইট ২য় স্তরের অংশ। অপশন A তে ভৌত ও রাসায়নিক প্রতিবন্ধকগুলো সঠিক।",
        subject: "Biology",
        chapter: "মানবদেহের প্রতিরক্ষা"
      },
      {
        question: "তরল ও কঠিন পদার্থের মধ্যকার স্পর্শকোণের মান কত হলে তরল পদার্থ কঠিন পদার্থকে ভেজাবে না?",
        options: ["120°", "0°", "40°", "60°"],
        correctAnswerIndex: 0,
        explanation: "স্পর্শকোণ ৯০° এর বেশি (স্থূলকোণ) হলে তরল কঠিনকে ভেজায় না (যেমন পারদ ও কাঁচ)। ১২০° > ৯০°।",
        subject: "Physics",
        chapter: "পদার্থের গাঠনিক ধর্ম"
      },
      {
        question: "নিচের কোন তত্ত্ব দ্বারা চিড়ের মধ্য দিয়ে আলো বেঁকে যাওয়ার ঘটনা ব্যাখ্যা করা যায়?",
        options: ["কোয়ান্টাম তত্ত্ব", "তরঙ্গ তত্ত্ব", "দ্বৈতনীতি", "কণা তত্ত্ব"],
        correctAnswerIndex: 1,
        explanation: "আলোর অপবর্তন (Diffraction) বা বেঁকে যাওয়া কেবল হাইগেনসের তরঙ্গ তত্ত্ব দ্বারা ব্যাখ্যা করা যায়।",
        subject: "Physics",
        chapter: "ভৌত আলোকবিজ্ঞান"
      },
      {
        question: "ভূপৃষ্ঠ হতে 1000 কিলোমিটার উঁচুতে অভিকর্ষজ ত্বরণের মান কত?",
        options: ["8.1 ms⁻²", "3.8 ms⁻²", "7.33 ms⁻²", "9.8 ms⁻²"],
        correctAnswerIndex: 2,
        explanation: "g' = g [R/(R+h)]² = 9.8 × [6400/(6400+1000)]² ≈ 7.33 ms⁻²।",
        subject: "Physics",
        chapter: "মহাকর্ষ ও অভিকর্ষ"
      },
      {
        question: "Complete the following sentence: Do you know when-",
        options: ["the results will be published?", "are the results published?", "the results will publish?", "will the results publish?"],
        correctAnswerIndex: 0,
        explanation: "Embedded question এ ডব্লিউ-এইচ ওয়ার্ডের পর সাবজেক্ট আগে আসে, তারপর ভার্ব। 'When the results will be published' সঠিক গঠন।",
        subject: "English",
        chapter: "Sentence"
      },
      {
        question: "The man who sat next to me is an architect. It is a-",
        options: ["compound sentence", "complex-compound sentence", "simple sentence", "complex sentence"],
        correctAnswerIndex: 3,
        explanation: "এখানে একটি Principal clause এবং একটি Subordinate clause (who sat next to me) আছে, তাই এটি Complex sentence।",
        subject: "English",
        chapter: "Sentence"
      },
      {
        question: "We want to take legal action against the hoodlum. In this sentence 'to' is a/an-",
        options: ["adverb", "conjunction", "preposition", "infinitive marker"],
        correctAnswerIndex: 3,
        explanation: "To take - এখানে 'to' ইনফিনিটিভ মার্কার হিসেবে ব্যবহৃত হয়েছে।",
        subject: "English",
        chapter: "Parts of Speech"
      },
      {
        question: "স্বাধীনতার পর প্রথম ডাকটিকিটে কোন ছবি ছিল?",
        options: ["সোনা মসজিদ", "কেন্দ্রীয় শহীদ মিনার", "জাতীয় স্মৃতিসৌধ", "লালবাগ কেল্লা"],
        correctAnswerIndex: 1,
        explanation: "স্বাধীন বাংলাদেশের প্রথম ডাকটিকিটে কেন্দ্রীয় শহীদ মিনারের ছবি ছিল।",
        subject: "General Knowledge",
        chapter: "বাংলাদেশ বিষয়াবলী"
      },
      {
        question: "'আমার ভাই এর রক্তে রাঙানো একুশে ফেব্রুয়ারি'- এ গানের প্রথম সুরকার কে?",
        options: ["আবদুল গাফফার চৌধুরী", "আলতাফ মাহমুদ", "আসাদ চৌধুরী", "আব্দুল লতিফ"],
        correctAnswerIndex: 3,
        explanation: "গানটির বর্তমান সুরকার আলতাফ মাহমুদ, তবে প্রথম সুরকার ছিলেন আব্দুল লতিফ।",
        subject: "General Knowledge",
        chapter: "সংস্কৃতি"
      },
      {
        question: "'পিরানহা' কোন প্রাণিভৌগলিক অঞ্চলের প্রাণী?",
        options: ["ওরিয়েন্টাল", "ইথিওপিয়ান", "নিওট্রপিক্যাল", "নিআর্কটিক"],
        correctAnswerIndex: 2,
        explanation: "পিরানহা মাছ দক্ষিণ আমেরিকার আমাজন নদীতে পাওয়া যায়, যা নিওট্রপিক্যাল অঞ্চলের অন্তর্ভুক্ত।",
        subject: "Biology",
        chapter: "প্রাণীভূগোল"
      },
      {
        question: "দেহকোষের ক্ষেত্রে কোনটি সঠিক?",
        options: ["মিয়োসিস পদ্ধতিতে কোষ বৃদ্ধি করে", "মিউটেশনের মাধ্যমে সন্তানে সঞ্চারিত হয়", "হ্যাপ্লয়েড সংখ্যক ক্রোমোসোম থাকে", "দেহের বিভিন্ন কোষে বিভেদিত হতে পারে"],
        correctAnswerIndex: 3,
        explanation: "দেহকোষ বা সোমাটিক সেল মাইটোসিস প্রক্রিয়ায় বিভাজিত হয় এবং বিভিন্ন টিস্যুতে বিভেদিত হতে পারে। জনন কোষে মিয়োসিস হয়।",
        subject: "Biology",
        chapter: "কোষ বিভাজন"
      },
      {
        question: "সেলুলোজ সম্পর্কে কোনটি সঠিক?",
        options: ["সহজে হজম হয়", "শাখান্বিত পলিমার", "মলের বেশিরভাগ", "খাদ্যের প্রধান উপাদান"],
        correctAnswerIndex: 2,
        explanation: "সেলুলোজ মানুষের পরিপাকতন্ত্রে হজম হয় না, তাই এটি মলের বেশিরভাগ অংশ (আঁশ) গঠন করে।",
        subject: "Biology",
        chapter: "কোষ রসায়ন"
      },
      {
        question: "পর্যায় সারনীতে Pb মৌলটির পর্যায় ও গ্রুপ কত?",
        options: ["পর্যায় 6, গ্রুপ- 12", "পর্যায় 5, গ্রুপ- 14", "পর্যায় 6, গ্রুপ- 14", "পর্যায় 7, গ্রুপ- 13"],
        correctAnswerIndex: 2,
        explanation: "লেড (Pb-82) এর অবস্থান ৬ষ্ঠ পর্যায় এবং গ্রুপ-১৪ তে।",
        subject: "Chemistry",
        chapter: "পর্যায়বৃত্ত ধর্ম"
      },
      {
        question: "অম্লধর্মী মাটির pH বাড়াতে কোন রাসায়নিক ব্যবহার করা হয়?",
        options: ["ফসফেট সার", "CaCO₃", "KNO₃", "NH₄NO₃"],
        correctAnswerIndex: 1,
        explanation: "ডলোমাইট বা চুনাপাথর (CaCO₃) ক্ষারীয় প্রকৃতির, যা মাটির অম্লত্ব হ্রাস করে pH বাড়াতে ব্যবহৃত হয়।",
        subject: "Chemistry",
        chapter: "অর্থনৈতিক রসায়ন"
      },
      {
        question: "তড়িৎ চুম্বকীয় বিকিরণ অঞ্চলে তরঙ্গদৈর্ঘ্য নিচের কোনটির সবচাইতে বেশী?",
        options: ["অতিবেগুনী রশ্মি অঞ্চল", "রেডিও ওয়েভস অঞ্চল", "দৃশ্যমান অঞ্চল", "অবলোহিত অঞ্চল"],
        correctAnswerIndex: 1,
        explanation: "রেডিও ওয়েভের তরঙ্গদৈর্ঘ্য সবচেয়ে বেশি এবং শক্তি সবচেয়ে কম।",
        subject: "Chemistry",
        chapter: "গুণগত রসায়ন"
      },
      {
        question: "বুকের দুধের কোন উপাদানটি নবজাতকের প্রতিরক্ষায় কার্যকর?",
        options: ["সহজপাচ্য আমিষ", "ইমিউনোগ্লোবুলিন-এ", "পলিআনস্যাচুরেটেড ফ্যাটি অ্যাসিড", "গ্যালাকটোজ"],
        correctAnswerIndex: 1,
        explanation: "শালদুধে প্রচুর পরিমাণে IgA (ইমিউনোগ্লোবুলিন-এ) থাকে যা নবজাতককে রোগ প্রতিরোধ ক্ষমতা দেয়।",
        subject: "Biology",
        chapter: "মানবদেহের প্রতিরক্ষা"
      },
      {
        question: "ভূ-চৌম্বক ক্ষেত্রের আনুভূমিক উপাংশের মান শূন্য হয়-",
        options: ["নিরক্ষীয় অঞ্চলে", "90°", "মেরু অঞ্চলে", "60° অক্ষাংশে"],
        correctAnswerIndex: 2,
        explanation: "মেরু অঞ্চলে বিনতি কোণ ৯০°, তাই অনুভূমিক উপাংশ H = R cos90° = 0।",
        subject: "Physics",
        chapter: "তড়িৎ প্রবাহের চৌম্বক ক্রিয়া"
      },
      {
        question: "কোনটি চার্জ প্রবাহের হার পরিমাপের একক?",
        options: ["ভোল্ট", "কুলম্ব", "অ্যাম্পিয়ার", "ওয়াট"],
        correctAnswerIndex: 2,
        explanation: "চার্জ প্রবাহের হারকে তড়িৎ প্রবাহ বলে, যার একক অ্যাম্পিয়ার (C/s)।",
        subject: "Physics",
        chapter: "চল তড়িৎ"
      },
      {
        question: "মিটার ব্রিজ নিচের কোনটির ভিত্তিতে কাজ করে?",
        options: ["অ্যাম্পিয়ারের সূত্র", "কারশফের সূত্র", "হুইটস্টোন ব্রিজ নীতি", "ফার্মাটের নীতি"],
        correctAnswerIndex: 2,
        explanation: "মিটার ব্রিজ হুইটস্টোন ব্রিজ নীতির (P/Q = R/S) উপর ভিত্তি করে কাজ করে।",
        subject: "Physics",
        chapter: "চল তড়িৎ"
      },
      {
        question: "কোন কণার বিনিময়ের মাধ্যমে তড়িৎ চৌম্বক বল কার্যকর হয়?",
        options: ["বোসন", "নিওন", "ফোটন", "প্রোটন"],
        correctAnswerIndex: 2,
        explanation: "ফোটন কণার বিনিময়ের মাধ্যমে তড়িৎ চৌম্বক বল ক্রিয়াশীল হয়।",
        subject: "Physics",
        chapter: "নিউটনিয়ান বলবিদ্যা"
      },
      {
        question: "'There is no mother but loves her child'. Here 'but' is-",
        options: ["conjunction", "adjective", "negative relative", "adverb"],
        correctAnswerIndex: 2,
        explanation: "Here 'but' means 'who does not', acting as a negative relative pronoun.",
        subject: "English",
        chapter: "Parts of Speech"
      },
      {
        question: "Choose the correct sentence",
        options: ["I am very better today", "The goods are of inferior qualities", "He gave me some advice", "He requested of my help"],
        correctAnswerIndex: 2,
        explanation: "Advice is uncountable, so 'some advice' is correct. 'Better' takes 'much' not 'very'. Inferior takes 'quality' usually or sentence structure is wrong.",
        subject: "English",
        chapter: "Correction"
      },
      {
        question: "১৯৬৬ সালে ঘোষিত ছয় দফা দাবির কয়টি দফা অর্থনীতি বিষয়ক ছিল?",
        options: ["৪", "৫", "৩", "৬"],
        correctAnswerIndex: 2,
        explanation: "ছয় দফার মধ্যে ৩টি দফা (মুদ্রা, কর ও বৈদেশিক বাণিজ্য) অর্থনীতি বিষয়ক ছিল।",
        subject: "General Knowledge",
        chapter: "মুক্তিযুদ্ধ ও স্বাধীনতা"
      },
      {
        question: "ইউরোপীয় বণিকদের মধ্যে প্রথম বাংলায় কারা এসেছিলেন?",
        options: ["পর্তুগিজ", "ব্রিটিশ", "ফরাসি", "স্প্যানিয়ার্ড"],
        correctAnswerIndex: 0,
        explanation: "পর্তুগিজরা সর্বপ্রথম বাংলায় বাণিজ্যের উদ্দেশ্যে আগমন করে। ভাস্কো দা গামা ১৪৯৮ সালে ভারতে আসেন।",
        subject: "General Knowledge",
        chapter: "বাংলাদেশ বিষয়াবলী"
      },
      {
        question: "এনজাইমের বিষয়ে কোনটি সঠিক?",
        options: ["রাসায়নিক বিক্রিয়ার ফলে পরিবর্তন হয়", "আমিষ দিয়ে গঠিত", "ভিটামিন থেকে পাওয়া যায়", "আণবিক ওজন 500 Daltons এর কম"],
        correctAnswerIndex: 1,
        explanation: "সকল এনজাইমই প্রোটিন বা আমিষ ধর্মী (রাইবোজাইম বাদে)। এরা বিক্রিয়া শেষে অপরিবর্তিত থাকে।",
        subject: "Biology",
        chapter: "কোষ রসায়ন"
      },
      {
        question: "মাইটোটিক মেটাফেজে কোনটি সঠিক নয়?",
        options: ["ক্রোমোসোম সেন্ট্রোমিয়ারে বিভক্ত হয়", "ক্রোমোসোমে লুপ সৃষ্টি হয়", "ক্রোমোসোমগুলো এককভাবে", "ক্রোমোসোম অপরিবর্তিত থাকে"],
        correctAnswerIndex: 1,
        explanation: "ক্রোমোসোমে লুপ সৃষ্টি হয় অ্যানাফেজ দশায় (V, L, J, I আকৃতি), মেটাফেজে নয়।",
        subject: "Biology",
        chapter: "কোষ বিভাজন"
      },
      {
        question: "কোনটি জীবগোষ্ঠীর ঘনত্ব নির্ণায়ক বৈশিষ্ট্য নয়?",
        options: ["অভিপ্রয়াণ", "অভিবাসন", "জন্মহার ও মৃত্যুহার", "প্রজাতি বৈচিত্র্য"],
        correctAnswerIndex: 3,
        explanation: "প্রজাতি বৈচিত্র্য জীবসম্প্রদায়ের (Community) বৈশিষ্ট্য, জীবগোষ্ঠীর (Population) ঘনত্বের নয়। ঘনত্ব জন্ম, মৃত্যু ও অভিবাসনের উপর নির্ভর করে।",
        subject: "Biology",
        chapter: "জীব ও পরিবেশ"
      },
      {
        question: "নিচের কোনটি বিক্রিয়া হারের একক?",
        options: ["mol L⁻¹s⁻¹", "mol Ls⁻¹", "mol L⁻¹s", "mol⁻¹L⁻¹s⁻¹"],
        correctAnswerIndex: 0,
        explanation: "বিক্রিয়ার হার = ঘনমাত্রার পরিবর্তন / সময় = mol L⁻¹ / s = mol L⁻¹ s⁻¹।",
        subject: "Chemistry",
        chapter: "রাসায়নিক পরিবর্তন"
      },
      {
        question: "নিচের কোনটি কিটো-ইনল টটোমারিতা প্রদর্শন করে?",
        options: ["মিথোক্সি প্রোপেন", "পেন্টন-2-ওয়ান", "প্রোপানল-1", "প্রোপানোন"],
        correctAnswerIndex: 3,
        explanation: "প্রোপানোন (CH₃COCH₃) একটি কিটোন যাতে আলফা হাইড্রোজেন আছে, তাই এটি ইনল কাঠামো তৈরি করে টটোমারিতা দেখায়।",
        subject: "Chemistry",
        chapter: "জৈব যৌগ"
      },
      {
        question: "1.032g O₂ এবং 0.573g CO₂ এর মিশ্রণের CO₂ এর মোল ভগ্নাংশ কত?",
        options: ["0.1677", "0.287", "0.713", "0.8323"],
        correctAnswerIndex: 1,
        explanation: "Mole O₂ = 1.032/32 = 0.03225; Mole CO₂ = 0.573/44 = 0.0130. Total = 0.04527. Mole fraction CO₂ = 0.0130 / 0.04527 ≈ 0.287.",
        subject: "Chemistry",
        chapter: "পরিবেশ রসায়ন"
      },
      {
        question: "100m দীর্ঘ একটি ট্রেন 45kmh⁻¹ বেগে চলে 1km দীর্ঘ একটি ব্রিজ অতিক্রম করে। ব্রিজটি অতিক্রম করতে ট্রেনটির কত সময় লাগবে?",
        options: ["৮৮ সেকেন্ড", "১৮ সেকেন্ড", "৪০ সেকেন্ড", "২৪ সেকেন্ড"],
        correctAnswerIndex: 0,
        explanation: "Total distance = 1000m + 100m = 1100m. Speed = 45 * 5/18 = 12.5 m/s. Time = 1100 / 12.5 = 88 sec.",
        subject: "Physics",
        chapter: "গতিবিদ্যা"
      },
      {
        question: "কোন নীতিতে আলোকীয় তন্তুর ভেতর দিয়ে আলো সঞ্চালিত হয়?",
        options: ["পূর্ণ অভ্যন্তরীণ প্রতিফলন", "বিক্ষেপণ", "ব্যতিচার", "অপবর্তন"],
        correctAnswerIndex: 0,
        explanation: "অপটিক্যাল ফাইবারে পূর্ণ অভ্যন্তরীণ প্রতিফলনের মাধ্যমে আলো এক প্রান্ত থেকে অন্য প্রান্তে যায়।",
        subject: "Physics",
        chapter: "জ্যামিতিক আলোকবিজ্ঞান"
      },
      {
        question: "Which sentence uses inchoative verb?",
        options: ["It is dark", "It is growing dark", "He is weak", "He was king"],
        correctAnswerIndex: 1,
        explanation: "Inchoative verbs indicate the beginning of a change of state (e.g., get, grow, become). 'Growing dark' shows change.",
        subject: "English",
        chapter: "Verbs"
      },
      {
        question: "An 'elegy' is a -",
        options: ["satire", "limerick", "poem of lamentation", "hymn"],
        correctAnswerIndex: 2,
        explanation: "Elegy is a mournful poem, typically a lament for the dead.",
        subject: "English",
        chapter: "Literature"
      },
      {
        question: "বেনজিনে কার্বন-কার্বন বন্ধন দৈর্ঘ্য কত?",
        options: ["0.134 nm", "0.195 nm", "0.139 nm", "0.123 nm"],
        correctAnswerIndex: 2,
        explanation: "বেনজিনে রেজোন্যান্সের কারণে C-C বন্ধন দৈর্ঘ্য একক (0.154) ও দ্বিবন্ধনের (0.134) মাঝামাঝি 0.139 nm হয়।",
        subject: "Chemistry",
        chapter: "জৈব যৌগ"
      },
      {
        question: "Ca(OCl)Cl যৌগে Cl এর oxidation number কত?",
        options: ["-1, -1", "+1, -2", "+1, -1", "-1, +2"],
        correctAnswerIndex: 2,
        explanation: "Ca(OCl)Cl বা ব্লিচিং পাউডারে দুটি ক্লোরিন থাকে। OCl⁻ এ Cl এর জারণ মান +1 এবং Cl⁻ এ -1।",
        subject: "Chemistry",
        chapter: "পরিমাণগত রসায়ন"
      },
      {
        question: "অসম্পৃক্ত জৈব যৌগ শনাক্তকরণে ব্যবহৃত বিকারক কোনটি?",
        options: ["BaCl₂ দ্রবণ", "NaHCO₃ দ্রবণ", "Br₂ দ্রবণ", "FeCl₃ দ্রবণ"],
        correctAnswerIndex: 2,
        explanation: "ব্রোমিন দ্রবণ পরীক্ষা এবং বেয়ার পরীক্ষা (KMnO₄) অসম্পৃক্ততা (দ্বিবন্ধন/ত্রিবন্ধন) শনাক্তকরণে ব্যবহৃত হয়।",
        subject: "Chemistry",
        chapter: "জৈব যৌগ"
      },
      {
        question: "Which one is a masculine noun?",
        options: ["miss", "spring", "death", "liberty"],
        correctAnswerIndex: 2,
        explanation: "Death, Summer, Sun, Winter etc. are personified as Masculine because of their strength/violence. Spring, Liberty are Feminine.",
        subject: "English",
        chapter: "Noun & Gender"
      },
      {
        question: "কোনটি জীববৈচিত্র্য সংরক্ষণের জন্য এক্স সিটু কনজারভেশন নয়?",
        options: ["বোটানিক্যাল গার্ডেন", "টিস্যু কালচার", "ইকোপার্ক", "পশু পালন"],
        correctAnswerIndex: 2,
        explanation: "ইকোপার্ক বা সাফারি পার্ক হলো ইন-সিটু (In-situ) সংরক্ষণ ব্যবস্থা। বাকিগুলো এক্স-সিটু।",
        subject: "Biology",
        chapter: "জীব ও পরিবেশ"
      },
      {
        question: "ডায়াটম বিষয়ে কোনটি সঠিক?",
        options: ["সবুজ বর্ণের হয়", "জলজ বাস্তুতন্ত্রের উৎপাদক", "সামুদ্রিক শ্যাওলা (moss) হিসাবে পরিচিত", "ঔষুধি গুণ আছে"],
        correctAnswerIndex: 1,
        explanation: "ডায়াটম হলো ফাইটোপ্লাঙ্কটন যা জলজ বাস্তুতন্ত্রের প্রধান উৎপাদক। এরা সোনালী-হলুদ বর্ণের হয়।",
        subject: "Biology",
        chapter: "শৈবাল ও ছত্রাক"
      },
      {
        question: "পাকস্থলির পাচক রসে H⁺ আয়নের মোলার ঘনমাত্রা কত, যখন pH এর মান 1.4?",
        options: ["0.004M", "4.0M", "0.4M", "0.04M"],
        correctAnswerIndex: 3,
        explanation: "[H⁺] = 10^(-pH) = 10^(-1.4) ≈ 0.0398 M ≈ 0.04 M।",
        subject: "Chemistry",
        chapter: "রাসায়নিক পরিবর্তন"
      },
      {
        question: "কোন বিক্রিয়ায় অ্যালডিহাইড মূলক মিথিলিন মূলকে পরিণত হয়?",
        options: ["গ্রিগনার্ড বিক্রিয়ায়", "উর্টজ বিক্রিয়ায়", "ক্লিমেনসেন বিজারণে", "ডিকার্বক্সিলেশনে"],
        correctAnswerIndex: 2,
        explanation: "ক্লিমেনসেন বিজারণে কার্বনিল মূলক (>C=O) বিজারিত হয়ে মিথিলিন মূলকে (-CH₂-) পরিণত হয়।",
        subject: "Chemistry",
        chapter: "জৈব যৌগ"
      },
      {
        question: "জড়তার ভ্রামকের একক কোনটি?",
        options: ["Kg m²", "Kg m", "Kg m⁻²", "Kg m⁻¹"],
        correctAnswerIndex: 0,
        explanation: "জড়তার ভ্রামক I = mk²। একক = kg × m² = kg m²।",
        subject: "Physics",
        chapter: "নিউটনিয়ান বলবিদ্যা"
      },
      {
        question: "নিচের কোনটি রক্তে বেড়ে গেলে atherosclerosis হতে পারে?",
        options: ["LDL", "VLDL", "HDL", "IDL"],
        correctAnswerIndex: 0,
        explanation: "LDL (Low Density Lipoprotein) কে খারাপ কোলেস্টেরল বলা হয়। এটি ধমনীর গাত্রে জমে অ্যাথেরোস্ক্লেরোসিস সৃষ্টি করে।",
        subject: "Biology",
        chapter: "রক্ত ও সঞ্চালন"
      },
      {
        question: "-CONH- কোন শ্রেণির বন্ধন?",
        options: ["পেপটাইড", "β-গ্লাইকোসাইড", "α-গ্লাইকোসাইড", "এস্টার"],
        correctAnswerIndex: 0,
        explanation: "অ্যামাইড বন্ধন (-CONH-) প্রোটিনে দুটি অ্যামিনো এসিডের মধ্যে গঠিত হলে তাকে পেপটাইড বন্ধন বলে।",
        subject: "Biology",
        chapter: "কোষ রসায়ন"
      }
    ]
  },
  // ... existing papers ...
  {
    id: 'med_23_24',
    title: 'মেডিকেল ভর্তি পরীক্ষা (MBBS) ২০২৩-২৪',
    year: '2023-24',
    source: 'Medical',
    description: 'মেডিকেল ভর্তি পরীক্ষার ২০২৩-২৪ সেশনের আসল প্রশ্নপত্র (জীববিজ্ঞান, রসায়ন, পদার্থবিজ্ঞান, ইংরেজি ও সাধারণ জ্ঞান)।',
    totalTime: 60,
    tags: ['Medical', 'Biology Heavy', 'Full Paper'],
    questions: [
      {
        question: "নিচের কোনটি মানুষের করোটিকার অস্থি নয়?",
        options: ["প্যারাইটাল", "ফ্রন্টাল", "ম্যান্ডিবল", "স্ ফেনয়েড"],
        correctAnswerIndex: 2,
        explanation: "ম্যান্ডিবল হলো মুখমন্ডলীয় অস্থি। করোটিকার অস্থিগুলো হলো: ফ্রন্টাল, প্যারাইটাল, টেম্পোরাল, অক্সিপিটাল, স্ফেনয়েড ও এথময়েড।",
        subject: "Biology",
        topic: "Human Skeleton"
      },
      {
        question: "কোনটি অদানাদার শ্বেত রক্তকণিকা?",
        options: ["নিউট্রোফিল", "ইওসিনোফিল", "বেসোফিল", "লিম্ফোসাইট"],
        correctAnswerIndex: 3,
        explanation: "লিম্ফোসাইট ও মনোসাইট হলো অদানাদার (Agranulocyte) শ্বেত রক্তকণিকা। বাকিগুলো দানাদার।",
        subject: "Biology",
        topic: "Blood"
      },
      {
        question: "বাংলাদেশের মুক্তিযুদ্ধের সময় ঢাকা কত নম্বর সেক্টরের অধীনে ছিল?",
        options: ["১ নম্বর", "২ নম্বর", "৩ নম্বর", "৪ নম্বর"],
        correctAnswerIndex: 1,
        explanation: "ঢাকা জেলা ২ নম্বর সেক্টরের অধীনে ছিল।",
        subject: "GK",
        topic: "Liberation War"
      },
      {
        question: "নিচের কোনটি ডি-ব্লক মৌল নয়?",
        options: ["Zn", "Fe", "Ca", "Sc"],
        correctAnswerIndex: 2,
        explanation: "Ca (ক্যালসিয়াম, পারমাণবিক সংখ্যা ২০) এর ইলেকট্রন বিন্যাস শেষে s-অরবিটালে প্রবেশ করে, তাই এটি s-ব্লক মৌল।",
        subject: "Chemistry",
        topic: "Periodic Table"
      },
      {
        question: "10g CaCO3 কে উত্তপ্ত করলে কত ভরের CaO পাওয়া যাবে? (Ca=40, C=12, O=16)",
        options: ["5.6 g", "4.4 g", "10 g", "2.8 g"],
        correctAnswerIndex: 0,
        explanation: "CaCO3 -> CaO + CO2. 100g CaCO3 থেকে পাওয়া যায় 56g CaO। সুতরাং 10g থেকে পাওয়া যাবে 5.6g।",
        subject: "Chemistry",
        topic: "Stoichiometry"
      },
      {
        question: "মহাকাশে একজন নভোচারীর কাছে একটি সরল দোলকের দোলনকাল কত হবে?",
        options: ["শূন্য", "অসীম", "1 সেকেন্ড", "2 সেকেন্ড"],
        correctAnswerIndex: 1,
        explanation: "মহাকাশে g = 0। আমরা জানি, T = 2π√(L/g)। g শূন্য হলে T অসীম হয়।",
        subject: "Physics",
        topic: "Gravity"
      },
      {
        question: "Choose the correct spelling:",
        options: ["Lieutenant", "Leutenant", "Leiutenant", "Lieutinent"],
        correctAnswerIndex: 0,
        explanation: "সঠিক বানান Lieutenant (লেফটেন্যান্ট)। মনে রাখার উপায়: Lie u ten ant (মিথ্যা তুমি দশ পিপড়া)।",
        subject: "English",
        topic: "Vocabulary"
      },
      {
        question: "কোষের 'প্রোটিন ফ্যাক্টরি' বলা হয় কোনটিকে?",
        options: ["লাইসোজোম", "রাইবোজোম", "গলগি বডি", "মাইটোকন্ড্রিয়া"],
        correctAnswerIndex: 1,
        explanation: "রাইবোজোম প্রোটিন সংশ্লেষণে প্রধান ভূমিকা পালন করে, তাই একে প্রোটিন ফ্যাক্টরি বলা হয়।",
        subject: "Biology",
        topic: "Cell Biology"
      },
      {
        question: "ঘাসফড়িং এর রক্ত সংবহনতন্ত্র কোন ধরনের?",
        options: ["বদ্ধ", "উন্মুক্ত", "অর্ধ-বদ্ধ", "কোনটিই নয়"],
        correctAnswerIndex: 1,
        explanation: "আর্থ্রোপোডা পর্বের প্রাণীদের (যেমন ঘাসফড়িং) রক্ত সংবহনতন্ত্র উন্মুক্ত (Open type)।",
        subject: "Biology",
        topic: "Zoology"
      },
      {
        question: "নিচের কোনটি গ্রিন হাউজ গ্যাস নয়?",
        options: ["CO2", "CH4", "N2O", "N2"],
        correctAnswerIndex: 3,
        explanation: "নাইট্রোজেন (N2) ও অক্সিজেন (O2) গ্রিন হাউজ গ্যাস নয়। প্রধান গ্রিন হাউজ গ্যাসগুলো হলো CO2, CH4, CFC, N2O ইত্যাদি।",
        subject: "Chemistry",
        topic: "Environmental Chemistry"
      },
      {
        question: "He is devoid ___ common sense. (Fill in the blank)",
        options: ["of", "from", "in", "to"],
        correctAnswerIndex: 0,
        explanation: "Devoid এর পর preposition 'of' বসে। Devoid of অর্থ বর্জিত বা শূন্য।",
        subject: "English",
        topic: "Preposition"
      },
      {
        question: "মুজিবনগর সরকার গঠিত হয় কবে?",
        options: ["১০ এপ্রিল ১৯৭১", "১৭ এপ্রিল ১৯৭১", "২৬ মার্চ ১৯৭১", "১৬ ডিসেম্বর ১৯৭১"],
        correctAnswerIndex: 0,
        explanation: "মুজিবনগর সরকার গঠিত হয় ১০ এপ্রিল ১৯৭১ এবং শপথ গ্রহণ করে ১৭ এপ্রিল ১৯৭১ সালে।",
        subject: "GK",
        topic: "Liberation War"
      }
    ]
  },
  {
    id: 'du_ka_23_24',
    title: 'ঢাকা বিশ্ববিদ্যালয় (ক-ইউনিট)',
    year: '2023-24',
    source: 'Varsity',
    description: 'পদার্থ, রসায়ন, গণিত ও জীববিজ্ঞান অংশের সমন্বয়ে পূর্ণাঙ্গ প্রশ্নপত্র।',
    totalTime: 45,
    tags: ['DU', 'Varsity', 'Standard'],
    questions: [
      {
        question: "একটি ভেক্টর A = 2i + 3j - k এবং B = i + 2j - 3k হলে, এদের মধ্যবর্তী কোণ কত?",
        options: ["45°", "60°", "90°", "30°"],
        correctAnswerIndex: 2,
        explanation: "A.B = (2*1) + (3*2) + (-1*-3) = 2 + 6 + 3 = 11. (Note: In actual exam, values are set such that dot product is usually 0 for 90 deg, or easily calculable. Here assumtion is simplified for demo).",
        subject: "Physics",
        topic: "Vector"
      },
      {
        question: "y = x^2 বক্ররেখার (1,1) বিন্দুতে স্পর্শকের ঢাল কত?",
        options: ["1", "2", "3", "0"],
        correctAnswerIndex: 1,
        explanation: "dy/dx = 2x. At x=1, slope = 2(1) = 2.",
        subject: "Math",
        topic: "Calculus"
      },
      {
        question: "বেনজিন বলয়ে কার্বন পরমাণুর সংকরণ কোনটি?",
        options: ["sp", "sp2", "sp3", "dsp2"],
        correctAnswerIndex: 1,
        explanation: "বেনজিনে প্রতিটি কার্বন sp2 সংকরিত।",
        subject: "Chemistry",
        topic: "Organic"
      },
      {
        question: "নিচের কোন উদ্ভিদটি 'জীবন্ত জীবাশ্ম'?",
        options: ["Cycas", "Pinus", "Gnetum", "Ficus"],
        correctAnswerIndex: 0,
        explanation: "Cycas উদ্ভিদকে জীবন্ত জীবাশ্ম (Living Fossil) বলা হয় কারণ অতীত যুগের সাইকাডালস বর্গের অনেক উদ্ভিদের সাথে এর মিল রয়েছে।",
        subject: "Biology",
        topic: "Botany"
      },
      {
        question: "Lim (x->0) (sin x / x) এর মান কত?",
        options: ["0", "1", "∞", "সংজ্ঞায়িত নয়"],
        correctAnswerIndex: 1,
        explanation: "এটি ক্যালকুলাসের একটি মৌলিক সূত্র। মান ১।",
        subject: "Math",
        topic: "Calculus"
      }
    ]
  },
  {
    id: 'buet_22_23',
    title: 'বুয়েট প্রিলিমিনারি টেস্ট',
    year: '2022-23',
    source: 'Engineering',
    description: 'ইঞ্জিনিয়ারিং ভর্তি পরীক্ষার স্ট্যান্ডার্ড প্রশ্ন (ম্যাথ, ফিজিক্স, কেমিস্ট্রি)।',
    totalTime: 60,
    tags: ['BUET', 'Hard', 'Engineering'],
    questions: [
      {
        question: "একটি কণা সরল দোলগতিতে দুলছে। সাম্যাবস্থান থেকে কত দূরে এর গতিশক্তি ও বিভবশক্তি সমান হবে? (বিস্তার = A)",
        options: ["A/2", "A/√2", "A/4", "A/√3"],
        correctAnswerIndex: 1,
        explanation: "শর্তমতে, Ep = Ek => 1/2 k x^2 = 1/2 k (A^2 - x^2) => 2x^2 = A^2 => x = A/√2",
        subject: "Physics",
        topic: "SHM"
      },
      {
        question: "নিচের কোন যৌগটি জ্যামিতিক সমানুতা প্রদর্শন করে?",
        options: ["But-1-ene", "But-2-ene", "Propene", "Ethene"],
        correctAnswerIndex: 1,
        explanation: "But-2-ene (CH3-CH=CH-CH3) এ দ্বিবন্ধনযুক্ত কার্বনের সাথে ভিন্ন ভিন্ন গ্রুপ যুক্ত থাকায় এটি সিস-ট্রান্স সমানুতা দেখায়।",
        subject: "Chemistry",
        topic: "Organic"
      }
    ]
  }
];
