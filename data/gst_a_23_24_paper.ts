
import { QuizQuestion } from '../types';
import questions from './gst_a_23_24_questions.json';

export const GST_A_23_24 = {
  id: 'gst_a_23_24',
  title: 'গুচ্ছ (GST) ক ইউনিট ভর্তি পরীক্ষা ২০২৩-২৪',
  year: '2023-24',
  source: 'GST',
  description: 'গুচ্ছ প্রকৌশল ও সাধারণ বিশ্ববিদ্যালয় ভর্তি পরীক্ষার (ক ইউনিট) পূর্ণাঙ্গ প্রশ্নপত্র।',
  totalTime: 60,
  tags: ['GST', 'Engineering', 'Varsity', 'Full Paper'],
  questions: questions as QuizQuestion[]
};
