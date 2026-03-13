
export enum AppView {
  HOME = 'HOME',
  CONCEPT = 'CONCEPT',
  QUIZ = 'QUIZ',
  ADMISSION = 'ADMISSION',
  TRACKER = 'TRACKER',
  BATTLE = 'BATTLE',
  COURSE = 'COURSE',
  EXAM_PACK = 'EXAM_PACK',
  PROFILE = 'PROFILE',
  ADMIN = 'ADMIN',
  LEADERBOARD = 'LEADERBOARD',
  QUESTION_BANK = 'QUESTION_BANK'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  sources?: SearchSource[];
  imageUrl?: string;
}

export interface QuizQuestion {
  _id?: string; // MongoDB ID
  id?: string; // Alternative ID
  question: string;
  options: string[];
  correctAnswerIndex: number; // 0-3
  explanation: string;
  subject?: string;
  chapter?: string;
  topic?: string;
  difficulty?: string;
  examRef?: string;
  questionImage?: string;
  explanationImage?: string;
  optionsImages?: string[];
}

export interface QuestionPaperMetadata {
  id: string;
  title: string;
  year: string;
  source: string; // Medical, Engineering, etc.
  totalQuestions: number;
  time: number;
  subjects?: string[]; // Automatically detected subjects
}

export interface QuizConfig {
  subject: string;
  chapter: string;
  topics: string[];
  questionCount?: number;
}

export interface SearchSource {
  title: string;
  uri: string;
}

export interface AdmissionResult {
  text: string;
  sources: SearchSource[];
}

export interface StudySession {
  id: string;
  subject: Subject;
  topic: string;
  durationMinutes: number;
  timestamp: number;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export enum Subject {
  PHYSICS = 'Physics (পদার্থবিজ্ঞান)',
  CHEMISTRY = 'Chemistry (রসায়ন)',
  MATH = 'Higher Math (উচ্চতর গণিত)',
  BIOLOGY = 'Biology (জীববিজ্ঞান)',
  ICT = 'ICT (তথ্য ও যোগাযোগ প্রযুক্তি)',
  ENGLISH = 'English',
  BANGLA = 'Bangla (বাংলা)',
  GK = 'General Knowledge (সাধারণ জ্ঞান)'
}

export enum ExamStandard {
  HSC = 'HSC Academic (বোর্ড স্ট্যান্ডার্ড)',
  MEDICAL = 'Medical Admission (মেডিকেল)',
  ENGINEERING = 'Engineering (বুয়েট/ইঞ্জিনিয়ারিং)',
  VARSITY = 'Varsity A Unit (বিশ্ববিদ্যালয় ক ইউনিট)'
}

export enum DifficultyLevel {
  EASY = 'Warm-up (সহজ)',
  MEDIUM = 'Standard (স্ট্যান্ডার্ড)',
  HARD = 'Nightmare (কঠিন)'
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  trxId: string;
  senderNumber: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: number;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'BATTLE_CHALLENGE' | 'BATTLE_RESULT';
  read?: boolean;
  actionLink?: string;
  metadata?: any;
  target?: string;
}

export interface LeaderboardUser {
  uid: string;
  displayName: string;
  photoURL: string;
  points: number;
  rank?: number;
  college?: string;
  hscBatch?: string;
  target?: string;
  department?: string;
  currentStreak?: number; // New
}

export interface ExamPack {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  originalPrice: number;
  totalExams: number;
  features: string[];
  theme: 'blue' | 'purple' | 'emerald' | 'orange' | 'red';
  tag?: string;
}

// --- GAMIFICATION TYPES ---

export type QuestType = 'EXAM_COMPLETE' | 'HIGH_SCORE' | 'WIN_BATTLE' | 'PLAY_BATTLE' | 'STUDY_TIME' | 'ASK_AI' | 'SAVE_QUESTION' | 'EARN_POINTS' | 'VIEW_MISTAKES' | 'SHARE_APP' | 'LOGIN';

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
  claimed: boolean;
  icon?: string;
  link?: string;
  category: 'DAILY' | 'WEEKLY' | 'LIFETIME';
  difficulty?: 'NOVICE' | 'APPRENTICE' | 'ELITE' | 'MASTER' | 'LEGEND';
}

export interface QuestTemplate {
  _id?: string; // MongoDB ID
  title: string;
  description: string;
  type: QuestType;
  target: number;
  reward: number;
  icon: string;
  link: string;
  category: 'DAILY' | 'WEEKLY' | 'LIFETIME';
  isActive: boolean;
}