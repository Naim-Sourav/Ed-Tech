
import { QuizQuestion } from '../types';
import { GST_A_23_24 } from '../data/gst_a_23_24_paper';

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

// Aggregating all papers here
export const PAST_PAPERS_DB: PastPaper[] = [
  GST_A_23_24,
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
        subject: "Biology 1st Paper",
        chapter: "শৈবাল ও ছত্রাক"
      },
      {
        question: "কোন হেপাটাইটিস ভাইরাস দূষিত পানি ও খাদ্যের মাধ্যমে সংক্রমণ ঘটায়?",
        options: ["Hepatitis D Virus", "Hepatitis A Virus", "Hepatitis C Virus", "Hepatitis B Virus"],
        correctAnswerIndex: 1,
        explanation: "হেপাটাইটিস A এবং E পানিবাহিত ভাইরাস। হেপাটাইটিস B, C, D রক্ত বা দেহরসের মাধ্যমে ছড়ায়।",
        subject: "Biology 1st Paper",
        chapter: "অণুজীব"
      }
    ]
  }
];
