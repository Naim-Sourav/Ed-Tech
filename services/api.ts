
// ... (imports from types.ts)
import { PaymentRequest, Notification, LeaderboardUser, ExamPack, Quest, QuestType, QuestTemplate, QuestionPaperMetadata } from "../types";

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
    { 
        subject: 'Physics', 
        accuracy: 85,
        total: 50,
        correct: 42,
        wrong: 8,
        skipped: 0,
        chapters: {
            'Vector': { total: 20, correct: 18, wrong: 2, skipped: 0 },
            'Dynamics': { total: 15, correct: 12, wrong: 3, skipped: 0 },
            'Work & Energy': { total: 15, correct: 12, wrong: 3, skipped: 0 }
        }
    },
    { 
        subject: 'Biology', 
        accuracy: 75,
        total: 40,
        correct: 30,
        wrong: 8,
        skipped: 2,
        chapters: {
            'Cell Structure': { total: 20, correct: 15, wrong: 4, skipped: 1 },
            'Genetics': { total: 20, correct: 15, wrong: 4, skipped: 1 }
        }
    },
    { 
        subject: 'Chemistry', 
        accuracy: 60,
        total: 30,
        correct: 18,
        wrong: 10,
        skipped: 2,
        chapters: {
            'Organic Chemistry': { total: 15, correct: 8, wrong: 6, skipped: 1 },
            'Periodic Table': { total: 15, correct: 10, wrong: 4, skipped: 1 }
        }
    }
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
    { id: '1', title: 'Welcome', message: 'Welcome to Dhrubok! (Offline Mode)', type: 'INFO', date: Date.now() },
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
        // Log as info instead of warn to reduce noise for expected 404s
        console.info(`[API Fallback] ${endpoint}: ${error.message}`);
        return fallback;
    }
    throw error;
  }
};

// --- API EXPORTS ---

// Quest APIs
export const updateQuestProgressAPI = async (userId: string, actionType: QuestType, value: number = 1) => {
    return fetchWithFallback('/quests/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, actionType, value })
    }, { success: true });
};

export const claimQuestAPI = async (userId: string, questId: string, category: 'DAILY' | 'WEEKLY' = 'DAILY') => {
    return fetchWithFallback('/quests/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, questId, category })
    }, { success: false });
};

// Admin Quest Management APIs
export const fetchAdminQuestsAPI = async (): Promise<QuestTemplate[]> => {
    return fetchWithFallback('/admin/quests', {}, []);
};

export const createAdminQuestAPI = async (questData: Partial<QuestTemplate>) => {
    return fetchWithFallback('/admin/quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questData)
    }, { success: true });
};

export const deleteAdminQuestAPI = async (id: string) => {
    return fetchWithFallback(`/admin/quests/${id}`, {
        method: 'DELETE'
    }, { success: true });
};

// User & Sync APIs
export const syncUserToMongoDB = async (user: any, additionalData?: any) => {
  return fetchWithFallback('/users/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        phoneNumber: additionalData?.phoneNumber || user.phoneNumber || '',
        college: user.college,
        hscBatch: user.hscBatch,
        department: user.department,
        target: user.target,
        ...additionalData
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

export const fetchExamResultAPI = async (userId: string, examId: string) => {
    return fetchWithFallback(`/users/${userId}/exam-results/${examId}`, {}, null);
};

export const fetchUserStatsAPI = async (userId: string) => {
  return fetchWithFallback(`/users/${userId}/stats`, {}, MOCK_STATS);
};

export const recordUserActivityAPI = async (userId: string) => {
    return fetchWithFallback('/users/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
    }, { success: true, streak: 1, activityLog: [], streakUpdated: false });
};

export const fetchUserMistakesAPI = async (userId: string) => {
  return fetchWithFallback(`/users/${userId}/mistakes`, {}, []);
};

export const deleteUserMistakeAPI = async (userId: string, mistakeId: string) => {
  return fetchWithFallback(`/users/${userId}/mistakes/${mistakeId}`, {
    method: 'DELETE'
  }, { success: true });
};

export const clearMistakesAPI = async (userId: string, questionIds: string[]) => {
  return fetchWithFallback(`/users/${userId}/mistakes/clear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionIds })
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

// Fixed: Maps _id to id for frontend compatibility
export const fetchPaymentsFromAPI = async (): Promise<PaymentRequest[]> => {
  const data = await fetchWithFallback('/admin/payments', {}, []);
  return Array.isArray(data) ? data.map((p: any) => ({ ...p, id: p.id || p._id })) : [];
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

export const saveQuestionsToBankAPI = async (questions: any[], metadata?: QuestionPaperMetadata) => {
  return fetchWithFallback('/admin/questions/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions, metadata })
  }, { success: true });
};

export const fetchQuestionPapersAPI = async (): Promise<QuestionPaperMetadata[]> => {
  return fetchWithFallback('/question-papers', {}, []);
};

export const fetchQuestionsFromBankAPI = async (page: number, limit: number, subject?: string, chapter?: string, search?: string) => {
  let url = `/admin/questions?page=${page}&limit=${limit}`;
  if (subject && subject !== 'ALL') url += `&subject=${encodeURIComponent(subject)}`;
  if (chapter && chapter !== 'ALL') url += `&chapter=${encodeURIComponent(chapter)}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  return fetchWithFallback(url, {}, { questions: [], total: 0 });
};

export const updateQuestionInBankAPI = async (id: string, questionData: any) => {
  return fetchWithFallback(`/admin/questions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(questionData)
  }, { success: true });
};

export const fetchQuestionsByExamRefAPI = async (examRef: string) => {
  // If examRef is gst_a_23_24, we load from our newly added JSON
  if (examRef === 'gst_a_23_24') {
     try {
       const response = await fetch('/data/gst_a_23_24_questions.json');
       return await response.json();
     } catch (e) {
       return fetchWithFallback(`/quiz/past-paper/${encodeURIComponent(examRef)}`, {}, []);
     }
  }
  return fetchWithFallback(`/quiz/past-paper/${encodeURIComponent(examRef)}`, {}, []);
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

// Fixed: Maps _id to id for frontend compatibility
export const fetchNotificationsAPI = async (): Promise<Notification[]> => {
  const data = await fetchWithFallback('/notifications', {}, MOCK_NOTIFICATIONS);
  return Array.isArray(data) ? data.map((n: any) => ({ ...n, id: n.id || n._id })) : MOCK_NOTIFICATIONS;
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
