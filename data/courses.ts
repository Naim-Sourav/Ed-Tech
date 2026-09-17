import { Swords } from 'lucide-react';

export interface ContentItem {
  id: string;
  title: string;
  duration: string;
  type: 'LIVE' | 'EXAM' | 'NOTE';
  isLocked: boolean;
}

export interface Module {
  title: string;
  items: ContentItem[];
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  originalPrice: number;
  features: string[];
  theme: 'blue' | 'purple' | 'emerald' | 'orange';
  badge?: string;
  students: number | string;
  syllabus?: Module[];
  // properties added for exam batches
  exams?: number;
  icon?: any;
  image?: string;
  color?: string;
  tags?: string[];
  isExamBatch?: boolean;
}

export const SHARED_COURSES: Course[] = [
    {
        id: 'the-warriors',
        title: 'The Warriors',
        subtitle: 'সেকেন্ড টাইম এডমিশন প্রিপারেশন',
        students: '১,২০০+',
        exams: 100,
        icon: Swords,
        image: 'https://i.ibb.co/5x2fVrHC/Chat-GPT-Image-Jun-9-2026-12-43-54-AM.png',
        color: 'from-purple-500 to-red-600',
        tags: ['Second Timer', 'University Admission'],
        price: 2500,
        originalPrice: 4000,
        features: ['১০০+ লাইভ এক্সাম', 'ডেইলি ও উইকলি মক টেস্ট', 'এডমিশন পূর্ণাঙ্গ গাইডলাইন'],
        theme: 'orange',
        badge: 'NEW BATCH',
        syllabus: [],
        isExamBatch: true
    }
];
