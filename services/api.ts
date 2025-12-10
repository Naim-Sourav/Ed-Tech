
import { PaymentRequest, Notification, LeaderboardUser, ExamPack, Quest, QuestType } from "../types";

const API_BASE = 'https://mongodb-hb6b.onrender.com/api';

// --- MOCK DATA ---
const MOCK_STATS = {
  user: {
    college: 'Dhaka College',
    hscBatch: '2024',
    department: 'Science',
    target: 'Medical',
    points: 1250
  },
  points: 1250,
  totalExams: 15,
  totalCorrect: 120,
  totalWrong: 30,
  subjectBreakdown: [
    { subject: 'Physics', accuracy: 85 },
    { subject: 'Biology', accuracy: 75 },
    { subject: 'Chemistry', accuracy: 60 }
  ],
  strongestTopics: [{ topic: 'Vector', accuracy: 95 }],
  weakestTopics: [{ topic: 'Organic Chemistry', accuracy: 40 }]
};

const MOCK_PACKS: ExamPack[] = [
    {
      id: 'med-final-24',
      title: 'মেডিকেল ফাইনাল মডেল টেস্ট',
      subtitle: 'শেষ মুহূর্তের পূর্ণাঙ্গ প্রস্তুতি (১০০টি মডেল টেস্ট)',
      price: 500,
      originalPrice: 1500,
      totalExams: 100,
      features: ['সম্পূর্ণ সিলেবাসের ওপর পরীক্ষা', 'নেগেটিভ মার্কিং প্র্যাকটিস', 'মেডিকেল স্ট্যান্ডার্ড প্রশ্ন', 'সলভ শিট ও ব্যাখ্যা'],
      theme: 'emerald',
      tag: 'Best Seller'
    },
    {
      id: 'eng-qbank-solve',
      title: 'ইঞ্জিনিয়ারিং প্রশ্ন ব্যাংক সলভ',
      subtitle: 'বুয়েট, চুয়েট, কুয়েট, রুয়েট বিগত ২০ বছরের প্রশ্ন',
      price: 750,
      originalPrice: 2000,
      totalExams: 50,
      features: ['অধ্যায়ভিত্তিক এক্সাম', 'কঠিন প্রশ্নের সহজ সমাধান', 'শর্টকাট টেকনিক', 'আনলিমিটেড এটেম্পট'],
      theme: 'blue',
      tag: 'Premium'
    },
    {
      id: 'varsity-ka-boost',
      title: 'ভার্সিটি ক-ইউনিট বুস্টার',
      subtitle: 'ঢাবি, জাবি, রাবি ও গুচ্ছ প্রস্তুতির সেরা প্যাক',
      price: 450,
      originalPrice: 1200,
      totalExams: 60,
      features: ['টাইম ম্যানেজমেন্ট প্র্যাকটিস', 'বিষয়ভিত্তিক মডেল টেস্ট', 'পূর্ণাঙ্গ মডেল টেস্ট', 'লাইভ লিডারবোর্ড'],
      theme: 'orange',
      tag: 'Popular'
    }
];

const MOCK_NOTIFICATIONS: Notification[] = [
    { id: '1', title: 'Welcome', message: 'Welcome to Shikkha Shohayok! (Offline Mode)', type: 'INFO', date: Date.now() },
    { id: '2', title: 'Update', message: 'New Physics questions added.', type: 'SUCCESS', date: Date.now() - 86400000 }
];

const MOCK_LEADERBOARD: LeaderboardUser[] = [
    { uid: '1', displayName: 'Tahmid Khan', photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', points: 5200 },
    { uid: '2', displayName: 'Sarah Ahmed', photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', points: 4800 },
    { uid: '3', displayName: 'Rafiqul Islam', photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack', points: 4500 },
    { uid: '4', displayName: 'You', photoURL: '', points: 1250 }
];

// --- HELPER ---
const fetchWithFallback = async (endpoint: string, options: RequestInit = {}, fallback: any = null) => {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    
    // 1. Handle HTTP Errors (non-200)
    if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}`;
        try {
            const errorData = await response.json();
            if (errorData && errorData.error) errorMessage = errorData.error;
        } catch (e) {
            // Body wasn't JSON
        }
        throw new Error(errorMessage);
    }

    // 2. Handle Success (200)
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        throw new Error("Invalid JSON response (Server might be sending HTML)");
    }

  } catch (error: any) {
    // 3. Fallback Mechanism
    if (fallback !== null && fallback !== undefined) {
        console.warn(`API Error (${endpoint}): ${error.message}. Using Fallback Data.`);
        return fallback;
    }
    throw error;
  }
};

// --- API EXPORTS ---

export const updateQuestProgressAPI = async (userId: string, actionType: QuestType, value: number = 1) => {
    return fetchWithFallback('/quests/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, actionType, value })
    }, { success: true });
};

export const claimQuestAPI = async (userId: string, questId: string) => {
    return fetchWithFallback('/quests/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, questId })
    }, { success: false });
};

export const syncUserToMongoDB = async (user: any) => {
  return fetchWithFallback('/users/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        college: user.college,
        hscBatch: user.hscBatch,
        department: user.department,
        target: user.target
      })
  }, { success: true });
};

export const fetchUserEnrollments = async (userId: string) => {
  return fetchWithFallback(`/users/${userId}/enrollments`, {}, []);
};

export const saveExamResultAPI = async (userId: string, resultData: any) => {
  return fetchWithFallback(`/users/${userId}/exam-results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resultData)
  }, { success: true });
};

export const fetchUserStatsAPI = async (userId: string) => {
  return fetchWithFallback(`/users/${userId}/stats`, {}, MOCK_STATS);
};

export const fetchUserMistakesAPI = async (userId: string) => {
  return fetchWithFallback(`/users/${userId}/mistakes`, {}, []);
};

export const deleteUserMistakeAPI = async (userId: string, mistakeId: string) => {
  return fetchWithFallback(`/users/${userId}/mistakes/${mistakeId}`, {
    method: 'DELETE'
  }, { success: true });
};

export const fetchLeaderboardAPI = async (): Promise<LeaderboardUser[]> => {
  return fetchWithFallback('/leaderboard', {}, MOCK_LEADERBOARD);
};

export const toggleSaveQuestionAPI = async (userId: string, questionId: string) => {
  return saveQuestionAPI(userId, questionId);
};

export const saveQuestionAPI = async (userId: string, questionId: string, folder?: string) => {
  return fetchWithFallback(`/users/${userId}/saved-questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionId, folder })
  }, { status: 'SAVED' });
};

export const updateSavedQuestionFolderAPI = async (userId: string, savedId: string, folder: string) => {
  return fetchWithFallback(`/users/${userId}/saved-questions/${savedId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder })
  }, { success: true });
};

export const unsaveQuestionAPI = async (userId: string, questionId: string) => {
  return fetchWithFallback(`/users/${userId}/saved-questions/by-q/${questionId}`, {
    method: 'DELETE'
  }, { success: true });
};

export const fetchSavedQuestionsAPI = async (userId: string) => {
  return fetchWithFallback(`/users/${userId}/saved-questions`, {}, []);
};

export const deleteSavedQuestionAPI = async (userId: string, id: string) => {
  return fetchWithFallback(`/users/${userId}/saved-questions/${id}`, {
    method: 'DELETE'
  }, { success: true });
};

export const submitPaymentToAPI = async (data: any) => {
  return fetchWithFallback('/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }, { success: true });
};

export const fetchPaymentsFromAPI = async (): Promise<PaymentRequest[]> => {
  return fetchWithFallback('/admin/payments', {}, []);
};

export const fetchAdminStatsAPI = async () => {
  return fetchWithFallback('/admin/stats', {}, {
      totalRevenue: 5000,
      totalEnrollments: 120,
      pendingRequests: 5,
      activeUsers: 150,
      totalQuestions: 500,
      totalExams: 50
  });
};

export const updatePaymentStatusAPI = async (id: string, status: 'APPROVED' | 'REJECTED') => {
  return fetchWithFallback(`/admin/payments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  }, { success: true });
};

export const deletePaymentAPI = async (id: string) => {
  return fetchWithFallback(`/admin/payments/${id}`, {
    method: 'DELETE'
  }, { success: true });
};

export const saveQuestionsToBankAPI = async (questions: any[]) => {
  return fetchWithFallback('/admin/questions/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions })
  }, { success: true });
};

export const fetchQuestionsFromBankAPI = async (page: number, limit: number, subject?: string, chapter?: string) => {
  let url = `/admin/questions?page=${page}&limit=${limit}`;
  if (subject) url += `&subject=${encodeURIComponent(subject)}`;
  if (chapter) url += `&chapter=${encodeURIComponent(chapter)}`;
  return fetchWithFallback(url, {}, { questions: [], total: 0 });
};

export const deleteQuestionFromBankAPI = async (id: string) => {
  return fetchWithFallback(`/admin/questions/${id}`, {
    method: 'DELETE'
  }, { success: true });
};

export const generateQuizFromDB = async (config: { subject: string, chapter: string, topics: string[], count: number }) => {
  return fetchWithFallback('/quiz/generate-from-db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  }, []);
};

export const fetchSyllabusStatsAPI = async () => {
  return fetchWithFallback('/quiz/syllabus-stats', {}, {});
};

export const sendNotificationAPI = async (data: any) => {
  return fetchWithFallback('/admin/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }, { success: true });
};

export const fetchNotificationsAPI = async (): Promise<Notification[]> => {
  return fetchWithFallback('/notifications', {}, MOCK_NOTIFICATIONS);
};

export const fetchExamPacksAPI = async (): Promise<ExamPack[]> => {
  return fetchWithFallback('/exam-packs', {}, MOCK_PACKS);
};

// --- BATTLE API ---

export const createBattleRoom = async (userId: string, userName: string, avatar: string, config: any) => {
  return fetchWithFallback('/battles/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, userName, avatar, config })
  }, { roomId: '123456' }); 
};

export const joinBattleRoom = async (roomId: string, userId: string, userName: string, avatar: string) => {
  return fetchWithFallback('/battles/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, userId, userName, avatar })
  }, { success: true });
};

export const startBattle = async (roomId: string, userId: string) => {
  return fetchWithFallback('/battles/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, userId })
  }, { success: true });
};

export const getBattleState = async (roomId: string) => {
  // Return a mock active battle state if fetch fails
  const mockBattleState = {
      roomId,
      hostId: 'mock-host',
      status: 'ACTIVE',
      startTime: Date.now() - 10000,
      config: { timePerQuestion: 20, subjects: ['Physics'], chapters: ['Vector'] },
      questions: [
          { question: "Mock Q1: 2+2?", options: ["3","4","5","6"], correctAnswerIndex: 1 },
          { question: "Mock Q2: Capital of BD?", options: ["Dhaka","Ctg","Sylhet","Raj"], correctAnswerIndex: 0 }
      ],
      players: [
          { uid: 'mock-host', name: 'Host', score: 20, avatar: '', totalTimeTaken: 5, answers: { '0': 1, '1': 0 } },
          { uid: 'you', name: 'You', score: 10, avatar: '', totalTimeTaken: 8, answers: { '0': 1 } }
      ]
  };
  return fetchWithFallback(`/battles/${roomId}`, {}, mockBattleState);
};

export const submitBattleAnswer = async (roomId: string, userId: string, isCorrect: boolean, questionIndex: number, selectedOption: number, timeTaken?: number) => {
  return fetchWithFallback(`/battles/${roomId}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, isCorrect, questionIndex, selectedOption, timeTaken })
  }, { success: true });
};
