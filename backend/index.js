
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// --- MongoDB Connection Setup ---
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://user:pass@cluster0.mongodb.net/shikkha-shohayok?retryWrites=true&w=majority';

// In-Memory Fallback Storage
const memoryDb = {
  users: [],
  payments: [],
  notifications: [
    { _id: '1', title: 'System', message: 'Running in fallback mode (Database disconnected)', type: 'WARNING', date: Date.now() }
  ],
  battles: [],
  questions: [],
  savedQuestions: [],
  mistakes: [],
  examResults: [],
  questTemplates: [], // Admin templates
  examPacks: [],
  questionPapers: [], // NEW: Stores list of available question banks
  studySessions: [], // NEW: Study Planner Sessions
  studyTargets: []   // NEW: Study Planner Targets
};

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000, 
  socketTimeoutMS: 45000,
})
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('⚠️ MongoDB Connection Failed. Switching to In-Memory Fallback mode.'));

// Helper to check DB status
const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Returns an array containing both NFC and NFD variants of a string for Unicode-insensitive matching.
 */
const normalizeBangla = (str) => {
    if (!str) return "";
    return str.normalize('NFC')
              .replace(/\u09AF\u09BC/g, '\u09DF') // য + ় -> য়
              .replace(/\u09A1\u09BC/g, '\u09DC') // ড + ় -> ড়
              .replace(/\u09A2\u09BC/g, '\u09DD') // ঢ + ় -> ঢ়
              .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero width chars
              .replace(/[\s\t\n\r]/g, ' ')           // Standardize whitespace
              .trim();
};

const normalizeForComparison = (str) => {
    if (!str) return "";
    return normalizeBangla(str)
              .replace(/[.,;:"'’|।]/g, '')           // Punctuation
              .replace(/\s+/g, '')                  // Remove all spaces
              .toLowerCase();
};

const getEditDistance = (a, b) => {
    if (!a) a = "";
    if (!b) b = "";
    if (a.length === 0) return b.length; 
    if (b.length === 0) return a.length; 

    if (Math.abs(a.length - b.length) > 10) return 999; 

    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i-1) === a.charAt(j-1)) {
                matrix[i][j] = matrix[i-1][j-1];
            } else {
                matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, 
                                        Math.min(matrix[i][j-1] + 1, 
                                                 matrix[i-1][j] + 1)); 
            }
        }
    }
    return matrix[b.length][a.length];
};

const areQuestionsSimilar = (qNorm1, optsNorm1, qNorm2, optsNorm2) => {
    if (qNorm1 === qNorm2 && optsNorm1 === optsNorm2) return true;
    
    const qDist = getEditDistance(qNorm1, qNorm2);
    const qAllowedDist = Math.max(2, Math.floor(Math.min(qNorm1.length, qNorm2.length) * 0.1));
    if (qDist > qAllowedDist) return false;

    const optDist = getEditDistance(optsNorm1, optsNorm2);
    const optAllowedDist = Math.max(3, Math.floor(Math.min(optsNorm1.length, optsNorm2.length) * 0.1));
    if (optDist > optAllowedDist) return false;

    return true;
};

const getUnicodeVariants = (text) => {
    if (!text || typeof text !== 'string') return [text]; // Return original if not a string
    const nfc = text.normalize('NFC');
    const nfd = text.normalize('NFD');
    if (nfc === nfd) return [nfc];
    return [nfc, nfd];
};

const getExamRefVariants = (ref) => {
    if (!ref) return [];
    const variants = new Set([ref]);
    
    // Check if ref has a short format like "DU-A '19-20"
    const duMatch = ref.match(/DU-([A-D])\s+'(\d{2}-\d{2})/i);
    if (duMatch) {
         const unit = duMatch[1].toUpperCase();
         const shortYear = duMatch[2]; // e.g. "19-20"
         variants.add(`DU ${unit} Unit 20${shortYear}`);
         variants.add(`DU ${unit} Unit ${shortYear}`);
         variants.add(`DU ${unit} unit 20${shortYear}`);
         variants.add(`DU ${unit} unit ${shortYear}`);
    }
    
    // Check if ref has old DU format like "DU A Unit 19-20"
    const duOldMatch = ref.match(/DU\s+([A-D])\s+Unit\s+(20)?(\d{2}-\d{2})/i);
    if (duOldMatch) {
         const unit = duOldMatch[1].toUpperCase();
         const shortYear = duOldMatch[3];
         variants.add(`DU-${unit} '${shortYear}`);
    }
    
    // "Medical '18-19" <-> "MAT 18-19"
    const medicalMatch = ref.match(/Medical\s+'(\d{2}-\d{2})/i);
    if (medicalMatch) {
         const shortYear = medicalMatch[1];
         variants.add(`MAT 20${shortYear}`);
         variants.add(`MAT ${shortYear}`);
    }
    const matMatch = ref.match(/MAT\s+(20)?(\d{2}-\d{2})/i);
    if (matMatch) {
         const shortYear = matMatch[2];
         variants.add(`Medical '${shortYear}`);
    }
    
    // "Dental '18-19" <-> "DAT 18-19"
    const dentalMatch = ref.match(/Dental\s+'(\d{2}-\d{2})/i);
    if (dentalMatch) {
         const shortYear = dentalMatch[1];
         variants.add(`DAT 20${shortYear}`);
         variants.add(`DAT ${shortYear}`);
    }
    const datMatch = ref.match(/DAT\s+(20)?(\d{2}-\d{2})/i);
    if (datMatch) {
         const shortYear = datMatch[2];
         variants.add(`Dental '${shortYear}`);
    }

    // "AFMC '18-19" <-> "AFMC 18-19"
    const afmcMatch = ref.match(/AFMC\s+'?(\d{2}-\d{2})/i);
    if (afmcMatch) {
         const shortYear = afmcMatch[1];
         variants.add(`AFMC 20${shortYear}`);
         variants.add(`AFMC ${shortYear}`);
         variants.add(`AFMC '${shortYear}`);
    }
    
    // "GST-A '18-19" <-> "GST (গুচ্ছ) A Unit 2018-19"
    const gstMatch = ref.match(/GST-([A-D])\s+'(\d{2}-\d{2})/i);
    if (gstMatch) {
         const unit = gstMatch[1].toUpperCase();
         const shortYear = gstMatch[2];
         variants.add(`GST (গুচ্ছ) ${unit} Unit 20${shortYear}`);
         variants.add(`GST (গুচ্ছ) ${unit} Unit ${shortYear}`);
    }
    const gstOldMatch = ref.match(/GST\s*(?:\(গুচ্ছ\))?\s*([A-D])\s*Unit\s*(20)?(\d{2}-\d{2})/i);
    if (gstOldMatch) {
         const unit = gstOldMatch[1].toUpperCase();
         const shortYear = gstOldMatch[3];
         variants.add(`GST-${unit} '${shortYear}`);
    }
    
    // For general unicode conversion and stuff
    const finalVariants = [];
    variants.forEach(v => {
        const nfc = v.normalize('NFC');
        const nfd = v.normalize('NFD');
        if (nfc === nfd) {
            finalVariants.push(nfc);
        } else {
            finalVariants.push(nfc, nfd);
        }
    });
    return finalVariants;
};

// --- UTILS: ROBUST DATE HELPER ---
// Get current date in Dhaka Timezone as YYYY-MM-DD string
const getDhakaDateString = () => {
    return new Intl.DateTimeFormat('en-CA', { 
        timeZone: 'Asia/Dhaka', 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    }).format(new Date());
};

// Get Yesterday's date string relative to a given YYYY-MM-DD string
const getPreviousDayString = (dateStr) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() - 1);
    return new Intl.DateTimeFormat('en-CA', { 
        timeZone: 'Asia/Dhaka', 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    }).format(date);
};

// --- UTILS: QUEST GENERATOR ---
const QUEST_TYPES = [
    { type: 'EXAM_COMPLETE', title: 'মডেল টেস্ট হিরো', desc: '১টি মডেল টেস্ট সম্পন্ন করো', target: 1, reward: 50, icon: 'FileCheck' },
    { type: 'EXAM_COMPLETE', title: 'এক্সাম ম্যারাথন', desc: '৩টি মডেল টেস্ট সম্পন্ন করো', target: 3, reward: 100, icon: 'FileCheck' },
    { type: 'HIGH_SCORE', title: 'পারফেকশনিস্ট', desc: '১টি পরীক্ষায় ৮০% নম্বর পাও', target: 1, reward: 80, icon: 'Target' },
    { type: 'STUDY_TIME', title: 'পড়ুয়া', desc: '২০ মিনিট পড়াশোনা ট্র্যাক করো', target: 20, reward: 60, icon: 'Clock' },
    { type: 'PLAY_BATTLE', title: 'ব্যাটল ওয়ারিয়র', desc: '১টি কুইজ ব্যাটল খেলো', target: 1, reward: 50, icon: 'Swords' },
    { type: 'WIN_BATTLE', title: 'বিজয় উল্লাস', desc: '১টি কুইজ ব্যাটল জেতো', target: 1, reward: 100, icon: 'Trophy' },
    { type: 'ASK_AI', title: 'কৌতুহলী', desc: 'AI কে ২ বার প্রশ্ন করো', target: 2, reward: 40, icon: 'Bot' },
    { type: 'SAVE_QUESTION', title: 'সংগ্রাহক', desc: '৩টি প্রশ্ন সেভ করো', target: 3, reward: 30, icon: 'Bookmark' }
];

const generateDailyQuests = () => {
    // Shuffle and pick 3 random quests
    const shuffled = [...QUEST_TYPES].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    
    return selected.map((q, idx) => ({
        id: `dq_${Date.now()}_${idx}`,
        title: q.title,
        description: q.desc,
        type: q.type,
        target: q.target,
        progress: 0,
        reward: q.reward,
        completed: false,
        claimed: false,
        icon: q.icon,
        category: 'DAILY'
    }));
};

// --- Schemas & Models (Mongoose) ---

const questTemplateSchema = new mongoose.Schema({
  title: String,
  description: String,
  type: String, 
  target: Number,
  reward: Number,
  icon: String,
  link: String,
  category: { type: String, enum: ['DAILY', 'WEEKLY'], default: 'DAILY' },
  isActive: { type: Boolean, default: true }
});
const QuestTemplate = mongoose.model('QuestTemplate', questTemplateSchema);

const questSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  type: String,
  target: Number,
  progress: { type: Number, default: 0 },
  reward: Number,
  completed: { type: Boolean, default: false },
  claimed: { type: Boolean, default: false },
  icon: String,
  link: String,
  category: String
}, { _id: false });

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: String,
  displayName: String,
  photoURL: String,
  role: { type: String, default: 'student' },
  college: String,
  hscBatch: String,
  department: String,
  target: String,
  points: { type: Number, default: 0 },
  totalExams: { type: Number, default: 0 },
  lastLogin: { type: Number, default: Date.now },
  createdAt: { type: Number, default: Date.now },
  // STREAK FIELDS
  currentStreak: { type: Number, default: 0 },
  lastActivityDate: { type: String, default: '' }, // YYYY-MM-DD (Asia/Dhaka)
  activityLog: { type: [String], default: [] }, // Array of YYYY-MM-DD
  stats: {
    totalCorrect: { type: Number, default: 0 },
    totalWrong: { type: Number, default: 0 },
    totalSkipped: { type: Number, default: 0 },
    subjectStats: { type: Map, of: new mongoose.Schema({ correct: Number, total: Number }, { _id: false }), default: {} },
    topicStats: { type: Map, of: new mongoose.Schema({ correct: Number, total: Number }, { _id: false }), default: {} }
  },
  dailyQuests: [questSchema],
  weeklyQuests: [questSchema],
  lastQuestReset: { type: Number, default: 0 },
  lastWeeklyQuestReset: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

const paymentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: String,
  userEmail: String,
  courseId: String,
  courseTitle: String,
  amount: Number,
  trxId: { type: String, required: true },
  senderNumber: { type: String, required: true },
  status: { type: String, default: 'PENDING', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
  timestamp: { type: Number, default: Date.now }
});
const Payment = mongoose.model('Payment', paymentSchema);

const notificationSchema = new mongoose.Schema({
  title: String,
  message: String,
  type: { type: String, enum: ['INFO', 'WARNING', 'SUCCESS', 'BATTLE_CHALLENGE', 'BATTLE_RESULT'] },
  date: { type: Number, default: Date.now },
  target: { type: String, default: 'ALL' },
  actionLink: String,
  metadata: Object
});
const Notification = mongoose.model('Notification', notificationSchema);

const battleSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  hostId: String,
  createdAt: { type: Number, default: Date.now },
  status: { type: String, enum: ['WAITING', 'ACTIVE', 'FINISHED'], default: 'WAITING' },
  startTime: Number,
  questions: Array,
  config: {
    subjects: [String], 
    chapters: [String], 
    mode: { type: String, enum: ['1v1', '2v2', 'FFA'], default: '1v1' },
    questionCount: { type: Number, default: 5 },
    timePerQuestion: { type: Number, default: 15 },
    maxPlayers: { type: Number, default: 2 }
  },
  players: [{
    uid: String,
    name: String,
    avatar: String,
    score: { type: Number, default: 0 },
    totalTimeTaken: { type: Number, default: 0 }, 
    team: { type: String, enum: ['A', 'B', 'NONE'], default: 'NONE' },
    answers: { type: Map, of: Number, default: {} } 
  }]
});
const Battle = mongoose.model('Battle', battleSchema);

const questionBankSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  chapter: { type: String, required: true },
  topic: String,
  contextText: String, 
  contextImage: String,
  question: { type: String, required: true },
  questionImage: { type: String },
  options: { type: [String], required: true },
  optionsImages: { type: [String] },
  correctAnswerIndex: { type: Number, required: true },
  explanation: String,
  explanationImage: { type: String },
  examRef: { type: String },
  level: { type: String, default: 'GENERAL' },
  board: String,
  college: String,
  admissionCategory: { type: String, default: null, index: true },
  tags: { type: [String], default: [] },
  slug: { type: String, unique: true, sparse: true },
  year: { type: Number, index: true },
  orderIndex: Number,
  createdAt: { type: Number, default: Date.now }
});
questionBankSchema.index({ subject: 1, chapter: 1, topic: 1 });
questionBankSchema.index({ examRef: 1, orderIndex: 1 });
// Text index for searching
questionBankSchema.index({ question: 'text', explanation: 'text' }); 
const QuestionBank = mongoose.model('QuestionBank', questionBankSchema);

// --- SEO Slug Generation ---
function generateSlug(text) {
    if (!text) return '';
    // Remove HTML tags
    let slug = text.replace(/<[^>]*>?/gm, '');
    // Remove MathJax markers
    slug = slug.replace(/(\$\$|\$|\\\[|\\\]|\\\(|\\\))/g, '');
    // Keep Bengali, English alphanumeric, and spaces
    slug = slug.replace(/[^\u0980-\u09FFa-zA-Z0-9\s-]/g, '');
    // Replace multiple spaces/hyphens with a single hyphen
    slug = slug.trim().replace(/[\s-]+/g, '-').toLowerCase();
    // Limit length to 80 chars
    slug = slug.substring(0, 80).replace(/-$/, '');
    return slug;
}

const normalizeToNFC = (text) => {
    if (!text || typeof text !== 'string') return text;
    return text.normalize('NFC').replace(/[\u200B-\u200D\uFEFF]/g, '');
};

async function generateUniqueSlug(questionText) {
    let baseSlug = generateSlug(questionText);
    if (!baseSlug) baseSlug = 'question';
    let slug = baseSlug;
    
    // Check if it already exists
    let existing = await QuestionBank.findOne({ slug });
    if (!existing) return slug;

    // If it exists, add 5 random chars
    const randomStr = Math.random().toString(36).substring(2, 7);
    return `${baseSlug}-${randomStr}`;
}

// NEW: Stores metadata about uploaded Question Banks (Papers)
const questionPaperSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // e.g. medical_23_24
  title: { type: String, required: true },
  year: { type: String, required: true },
  source: { type: String, required: true }, // Medical, Engineering, etc.
  totalQuestions: { type: Number, default: 0 },
  time: { type: Number, default: 60 }
});
const QuestionPaper = mongoose.model('QuestionPaper', questionPaperSchema);

const savedQuestionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuestionBank' },
  folder: { type: String, default: 'General' },
  savedAt: { type: Number, default: Date.now }
});
savedQuestionSchema.index({ userId: 1, questionId: 1 }, { unique: true }); // Prevent duplicates in MongoDB
const SavedQuestion = mongoose.model('SavedQuestion', savedQuestionSchema);

// OPTIMIZED MISTAKE SCHEMA: Now uses reference instead of full copy
const mistakeSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuestionBank', required: true },
  wrongCount: { type: Number, default: 1 },
  lastMissed: { type: Number, default: Date.now },
  category: { type: String, default: null }
});
mistakeSchema.index({ userId: 1 });
const Mistake = mongoose.model('Mistake', mistakeSchema);

const examResultSchema = new mongoose.Schema({
  examId: { type: String, index: true }, // Added examId index for fast lookup
  userId: { type: String, required: true },
  subject: { type: String, required: true },
  totalQuestions: Number,
  correct: Number,
  wrong: Number,
  skipped: Number,
  score: Number,
  topicStats: [{ topic: String, correct: Number, total: Number }],
  // NEW: Store full exam context to restore state
  userAnswers: [Number], // Array of selected option indices (or null)
  questions: Array, // Store the question objects to render review later
  config: Object, // Store config like title, timeLimit etc.
  timestamp: { type: Number, default: Date.now }
});
examResultSchema.index({ userId: 1 }); 
const ExamResult = mongoose.model('ExamResult', examResultSchema);

const examPackSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  subtitle: String,
  price: Number,
  originalPrice: Number,
  totalExams: Number,
  features: [String],
  theme: String,
  tag: String
});
const ExamPack = mongoose.model('ExamPack', examPackSchema);

// --- NEW SCHEMAS FOR STUDY TRACKER ---
const studySessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  subject: { type: String, required: true },
  duration: { type: Number, required: true }, // in seconds
  timestamp: { type: Number, default: Date.now }
});
studySessionSchema.index({ userId: 1 });
const StudySession = mongoose.model('StudySession', studySessionSchema);

const studyTargetSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: String,
  subject: String,
  type: { type: String, enum: ['TIME', 'CHAPTER'] },
  targetValue: Number,
  currentValue: { type: Number, default: 0 },
  deadline: String, // ISO date string
  completed: { type: Boolean, default: false },
  createdAt: { type: Number, default: Date.now }
});
studyTargetSchema.index({ userId: 1 });
const StudyTarget = mongoose.model('StudyTarget', studyTargetSchema);

// --- ROUTES ---

app.get('/', (req, res) => {
  res.send(`🚀 Porikkhangon API Running! Mode: ${isDbConnected() ? 'MongoDB' : 'Memory'}`);
});

// --- STREAK & ACTIVITY ROUTE (RE-WRITTEN) ---
app.post('/api/users/activity', async (req, res) => {
    try {
        const { userId } = req.body;
        
        // 1. Get exact dates in Dhaka timezone as strings
        const todayStr = getDhakaDateString();
        const yesterdayStr = getPreviousDayString(todayStr);
        
        let user;
        if (isDbConnected()) {
            user = await User.findOne({ uid: userId });
        } else {
            user = memoryDb.users.find(u => u.uid === userId);
        }

        if (!user) return res.status(404).json({ error: 'User not found' });

        const lastActive = user.lastActivityDate; // stored as YYYY-MM-DD
        let streakUpdated = false;

        // 3. Robust String Comparison Logic
        if (lastActive === todayStr) {
            // Already active today, streak count remains same
            streakUpdated = false;
        } else if (lastActive === yesterdayStr) {
            // Consecutive Day: Increment
            user.currentStreak = (user.currentStreak || 0) + 1;
            user.lastActivityDate = todayStr;
            streakUpdated = true;
        } else {
            // Missed a day or first time: Reset to 1
            user.currentStreak = 1;
            user.lastActivityDate = todayStr;
            streakUpdated = true;
        }

        // 4. Update Activity Log (Ensure Today is added)
        if (!user.activityLog.includes(todayStr)) {
            user.activityLog.push(todayStr);
        }

        if (isDbConnected()) await user.save();
        
        res.json({ 
            success: true, 
            streak: user.currentStreak, 
            activityLog: user.activityLog,
            streakUpdated
        });

    } catch (e) {
        console.error("Streak Error:", e);
        res.status(500).json({ error: e.message });
    }
});

// --- STUDY TRACKER API ROUTES ---

// Get all study sessions for a user
app.get('/api/study/sessions/:userId', async (req, res) => {
    try {
        if (isDbConnected()) {
            const sessions = await StudySession.find({ userId: req.params.userId }).sort({ timestamp: -1 });
            res.json(sessions);
        } else {
            res.json(memoryDb.studySessions.filter(s => s.userId === req.params.userId).sort((a,b) => b.timestamp - a.timestamp));
        }
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Create a new study session
app.post('/api/study/sessions', async (req, res) => {
    try {
        const { userId, subject, duration, timestamp } = req.body;
        if (isDbConnected()) {
            const session = await StudySession.create({ userId, subject, duration, timestamp });
            res.json(session);
        } else {
            const session = { _id: Date.now().toString(), userId, subject, duration, timestamp };
            memoryDb.studySessions.push(session);
            res.json(session);
        }
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get all targets for a user
app.get('/api/study/targets/:userId', async (req, res) => {
    try {
        if (isDbConnected()) {
            const targets = await StudyTarget.find({ userId: req.params.userId }).sort({ createdAt: -1 });
            res.json(targets);
        } else {
            res.json(memoryDb.studyTargets.filter(t => t.userId === req.params.userId));
        }
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Create a new target
app.post('/api/study/targets', async (req, res) => {
    try {
        const targetData = req.body;
        if (isDbConnected()) {
            const target = await StudyTarget.create(targetData);
            res.json(target);
        } else {
            const target = { _id: Date.now().toString(), ...targetData, createdAt: Date.now() };
            memoryDb.studyTargets.push(target);
            res.json(target);
        }
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update target progress
app.patch('/api/study/targets/:id', async (req, res) => {
    try {
        const { currentValue, completed } = req.body;
        if (isDbConnected()) {
            const target = await StudyTarget.findByIdAndUpdate(
                req.params.id, 
                { currentValue, completed }, 
                { new: true }
            );
            res.json(target);
        } else {
            const target = memoryDb.studyTargets.find(t => t._id === req.params.id);
            if (target) {
                target.currentValue = currentValue;
                target.completed = completed;
                res.json(target);
            } else {
                res.status(404).json({ error: "Target not found" });
            }
        }
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete target
app.delete('/api/study/targets/:id', async (req, res) => {
    try {
        if (isDbConnected()) {
            await StudyTarget.findByIdAndDelete(req.params.id);
        } else {
            memoryDb.studyTargets = memoryDb.studyTargets.filter(t => t._id !== req.params.id);
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});


// --- ADMIN DUPLICATES FINDER ---
app.get('/api/admin/duplicates', async (req, res) => {
    try {
        if (!isDbConnected()) return res.json({ duplicates: [] });
        
        const duplicatesAgg = await QuestionBank.aggregate([
            {
                $group: {
                    _id: "$question",
                    count: { $sum: 1 },
                    questions: { $push: "$$ROOT" }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
        
        res.json({ duplicates: duplicatesAgg });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch duplicates' });
    }
});

app.post('/api/admin/duplicates/merge', async (req, res) => {
    try {
        const { primaryId, secondaryIds } = req.body;
        if (!primaryId || !secondaryIds || !secondaryIds.length) {
            return res.status(400).json({ error: 'Missing primaryId or secondaryIds' });
        }
        if (!isDbConnected()) return res.status(500).json({ error: 'DB not connected' });

        const primaryQ = await QuestionBank.findById(primaryId);
        const secondaryQs = await QuestionBank.find({ _id: { $in: secondaryIds } });

        if (!primaryQ) return res.status(404).json({ error: 'Primary question not found' });

        const allTags = new Set(primaryQ.tags || []);
        let allExamRefs = primaryQ.examRef ? primaryQ.examRef.split(',').map(s => s.trim()) : [];
        
        for (const q of secondaryQs) {
            if (q.tags) q.tags.forEach(t => allTags.add(t));
            if (q.examRef) {
                const refs = q.examRef.split(',').map(s => s.trim());
                refs.forEach(r => {
                    if (r && !allExamRefs.includes(r)) allExamRefs.push(r);
                });
            }
        }

        // Merge explanation if primary lacks it
        if (!primaryQ.explanation && !primaryQ.explanationImage) {
            const secondaryWithExp = secondaryQs.find(q => q.explanation || q.explanationImage);
            if (secondaryWithExp) {
                primaryQ.explanation = secondaryWithExp.explanation;
                primaryQ.explanationImage = secondaryWithExp.explanationImage;
            }
        }

        primaryQ.tags = Array.from(allTags);
        primaryQ.examRef = allExamRefs.join(', ');

        await primaryQ.save();
        
        await QuestionBank.deleteMany({ _id: { $in: secondaryIds } });

        res.json({ success: true, message: 'Duplicates merged successfully' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/admin/auto-duplicates/scan', async (req, res) => {
    try {
        if (!isDbConnected()) return res.status(500).json({ error: 'DB not connected' });
        
        const allQuestionsCursor = QuestionBank.find({}).cursor();
        const partitionedGroups = {};
        
        let duplicateGroupsCount = 0;
        let totalDuplicatesToMerge = 0;
        let totalQuestions = 0;

        for await (const q of allQuestionsCursor) {
            totalQuestions++;
            if (!q.subject || !q.chapter) continue; // Skip if basic structural info is missing
            
            const normSubject = normalizeForComparison(q.subject);
            const normChapter = normalizeForComparison(q.chapter);
            const normQ = normalizeForComparison(q.question);
            const normOpts = (q.options || []).map(o => normalizeForComparison(o)).sort().join('_|OP|_');
            
            const partitionKey = `${normSubject}_|S|_${normChapter}`;
            if (!partitionedGroups[partitionKey]) {
                partitionedGroups[partitionKey] = [];
            }
            
            let foundGroup = false;
            for (const group of partitionedGroups[partitionKey]) {
                if (areQuestionsSimilar(normQ, normOpts, group.qNorm, group.optsNorm)) {
                    group.questions.push(q._id.toString());
                    foundGroup = true;
                    break;
                }
            }
            
            if (!foundGroup) {
                partitionedGroups[partitionKey].push({
                    qNorm: normQ,
                    optsNorm: normOpts,
                    questions: [q._id.toString()]
                });
            }
        }

        for (const pk in partitionedGroups) {
            for (const group of partitionedGroups[pk]) {
                if (group.questions.length > 1) {
                    duplicateGroupsCount++;
                    totalDuplicatesToMerge += (group.questions.length - 1);
                }
            }
        }

        res.json({
            success: true,
            totalQuestions,
            duplicateGroupsCount,
            totalDuplicatesToMerge
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/admin/auto-duplicates/merge', async (req, res) => {
    try {
        if (!isDbConnected()) return res.status(500).json({ error: 'DB not connected' });
        
        const allQuestionsCursor = QuestionBank.find({}).cursor();
        const partitionedGroups = {}; // key -> array of groups
        
        for await (const q of allQuestionsCursor) {
            if (!q.subject || !q.chapter) continue;
            
            const normSubject = normalizeForComparison(q.subject);
            const normChapter = normalizeForComparison(q.chapter);
            const normQ = normalizeForComparison(q.question);
            const normOpts = (q.options || []).map(o => normalizeForComparison(o)).sort().join('_|OP|_');
            
            const partitionKey = `${normSubject}_|S|_${normChapter}`;
            if (!partitionedGroups[partitionKey]) {
                partitionedGroups[partitionKey] = [];
            }
            
            let foundGroup = false;
            for (const group of partitionedGroups[partitionKey]) {
                if (areQuestionsSimilar(normQ, normOpts, group.qNorm, group.optsNorm)) {
                    group.questions.push(q);
                    foundGroup = true;
                    break;
                }
            }
            
            if (!foundGroup) {
                partitionedGroups[partitionKey].push({
                    qNorm: normQ,
                    optsNorm: normOpts,
                    questions: [q]
                });
            }
        }

        let totalMerged = 0;
        let totalDeleted = 0;

        for (const pk in partitionedGroups) {
            for (const group of partitionedGroups[pk]) {
                const qs = group.questions;
            if (qs.length > 1) {
                // Find primary question (prefer one with explanation, or just the first)
                let primaryQ = qs.find(q => q.explanation || q.explanationImage);
                if (!primaryQ) primaryQ = qs[0];

                const secondaryQs = qs.filter(q => q._id.toString() !== primaryQ._id.toString());
                const secondaryIds = secondaryQs.map(q => q._id);

                if (secondaryIds.length === 0) continue;

                const allTags = new Set(primaryQ.tags || []);
                let allExamRefs = primaryQ.examRef ? primaryQ.examRef.split(',').map(s => s.trim()) : [];
                
                // Track correct answers to find most common if they differ
                const answersMap = {};
                if (primaryQ.options && primaryQ.correctAnswerIndex != null && primaryQ.options[primaryQ.correctAnswerIndex]) {
                    const ansNorm = normalizeForComparison(primaryQ.options[primaryQ.correctAnswerIndex]);
                    answersMap[ansNorm] = (answersMap[ansNorm] || 0) + 2; // Weight primary heavier
                }

                for (const q of secondaryQs) {
                    if (q.tags) q.tags.forEach(t => allTags.add(t));
                    if (q.examRef) {
                        const refs = q.examRef.split(',').map(s => s.trim());
                        refs.forEach(r => {
                            if (r && !allExamRefs.includes(r)) allExamRefs.push(r);
                        });
                    }
                    if (q.options && q.correctAnswerIndex != null && q.options[q.correctAnswerIndex]) {
                        const ansNorm = normalizeForComparison(q.options[q.correctAnswerIndex]);
                        let weight = 1;
                        if (q.explanation || q.explanationImage) weight = 3; // Weight ones with explanation higher
                        answersMap[ansNorm] = (answersMap[ansNorm] || 0) + weight;
                    }

                    if (!primaryQ.explanation && !primaryQ.explanationImage) {
                        if (q.explanation || q.explanationImage) {
                            primaryQ.explanation = q.explanation;
                            primaryQ.explanationImage = q.explanationImage;
                        }
                    }
                }

                // Determine final correct answer text based on max weight
                let bestAnswerNorm = null;
                let maxWeight = 0;
                for (const a in answersMap) {
                    if (answersMap[a] > maxWeight) {
                        maxWeight = answersMap[a];
                        bestAnswerNorm = a;
                    }
                }

                if (bestAnswerNorm && primaryQ.options) {
                    const newCorrectIndex = primaryQ.options.findIndex(opt => normalizeForComparison(opt) === bestAnswerNorm);
                    if (newCorrectIndex !== -1) {
                        primaryQ.correctAnswerIndex = newCorrectIndex;
                    }
                }

                primaryQ.tags = Array.from(allTags);
                primaryQ.examRef = allExamRefs.join(', ');
                primaryQ.level = detectLevel(primaryQ.examRef, primaryQ.tags);

                await QuestionBank.updateOne(
                    { _id: primaryQ._id },
                    { 
                        $set: { 
                            tags: primaryQ.tags, 
                            examRef: primaryQ.examRef, 
                            level: primaryQ.level,
                            explanation: primaryQ.explanation, 
                            explanationImage: primaryQ.explanationImage, 
                            correctAnswerIndex: primaryQ.correctAnswerIndex 
                        } 
                    }
                );
                
                await QuestionBank.deleteMany({ _id: { $in: secondaryIds } });

                totalMerged++;
                totalDeleted += secondaryIds.length;
            }
        }

        }
        res.json({ success: true, totalMerged, totalDeleted, message: 'Automated merge completed' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// --- ADMIN TAG MAPPER (ADMISSION) ---
app.get('/api/admin/tags/admission', async (req, res) => {
    try {
        if (!isDbConnected()) return res.json({ tags: [] });
        
        // Find all unique tags for admission questions
        const distinctTags = await QuestionBank.distinct('tags', {
            level: { $regex: 'ADMISSION', $options: 'i' },
            admissionCategory: { $in: [null, "", undefined] }
        });
        
        // Also we might want to get distinct examRefs since they act as tags
        const distinctExamRefsRaw = await QuestionBank.distinct('examRef', {
            level: { $regex: 'ADMISSION', $options: 'i' },
            admissionCategory: { $in: [null, "", undefined] }
        });

        // Function to strip year mentions like '11-12, '19, 2020, 2021-22
        const stripYear = (str) => {
            if (!str) return null;
            return str.replace(/\s*['’]\s*\d{2,4}(?:\s*-\s*\d{2,4})?\s*(?:Unit|ইউনিট)?\s*$/gi, '')
                      .replace(/\s*\b20\d{2}(?:\s*-\s*\d{2,4})?\s*$/g, '')
                      .trim();
        };

        const cleanTags = distinctTags.map(stripYear).filter(Boolean);
        const cleanExamRefs = distinctExamRefsRaw.map(stripYear).filter(Boolean);

        const allUniqueTags = new Set([...cleanTags, ...cleanExamRefs]);
        
        res.json({ tags: Array.from(allUniqueTags).sort() });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});

app.post('/api/admin/tags/map', async (req, res) => {
    try {
        const { category, tags } = req.body;
        if (!category || !tags || !tags.length) {
            return res.status(400).json({ error: 'Missing category or tags' });
        }
        
        if (!isDbConnected()) return res.status(500).json({ error: 'DB not connected' });

        // Update all admission questions that have these tags or examRefs to have this category
        
        // Escape string for regex and match as prefix + boundary/year
        const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        const result = await QuestionBank.updateMany(
            { 
                level: { $regex: 'ADMISSION', $options: 'i' },
                $or: [
                    ...tags.map(t => ({ tags: { $regex: '^' + escapeRegex(t) + '(?:\\s|[\'’]|$|\\b)', $options: 'i' } })),
                    ...tags.map(t => ({ examRef: { $regex: '^' + escapeRegex(t) + '(?:\\s|[\'’]|$|\\b)', $options: 'i' } }))
                ]
            },
            { $set: { admissionCategory: category } }
        );

        res.json({ success: true, matchedCount: result.matchedCount, modifiedCount: result.modifiedCount });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// --- ADMIN STATS AGGREGATION ---
app.get('/api/admin/stats', async (req, res) => {
  try {
    const stats = {
        totalUsers: 0,
        totalRevenue: 0,
        totalQuestions: 0,
        totalExams: 0,
        pendingPayments: 0,
        approvedEnrollments: 0
    };

    if (isDbConnected()) {
        stats.totalUsers = await User.countDocuments();
        stats.totalQuestions = await QuestionBank.countDocuments();
        
        const totalExamsAgg = await User.aggregate([{ $group: { _id: null, total: { $sum: "$totalExams" } } }]);
        stats.totalExams = totalExamsAgg[0]?.total || 0;

        stats.pendingPayments = await Payment.countDocuments({ status: 'PENDING' });
        stats.approvedEnrollments = await Payment.countDocuments({ status: 'APPROVED' });
        
        const revenueAgg = await Payment.aggregate([
            { $match: { status: 'APPROVED' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        stats.totalRevenue = revenueAgg[0]?.total || 0;
    } else {
        // Memory Fallback
        stats.totalUsers = memoryDb.users.length;
        stats.totalQuestions = memoryDb.questions.length;
        stats.totalExams = memoryDb.users.reduce((sum, u) => sum + (u.totalExams || 0), 0);
        stats.pendingPayments = memoryDb.payments.filter(p => p.status === 'PENDING').length;
        stats.approvedEnrollments = memoryDb.payments.filter(p => p.status === 'APPROVED').length;
        stats.totalRevenue = memoryDb.payments.filter(p => p.status === 'APPROVED').reduce((sum, p) => sum + (p.amount || 0), 0);
    }
    res.json(stats);
  } catch (e) {
      res.status(500).json({ error: 'Stats failed' });
  }
});

// --- QUESTS ---

const checkAndResetUserQuests = async (user) => {
    const now = new Date();
    // Reset based on local time logic or approximate 24h
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    if (!user.lastQuestReset || user.lastQuestReset < todayStart) {
        user.dailyQuests = generateDailyQuests();
        user.lastQuestReset = Date.now();
    }
    return user;
};

app.post('/api/quests/update', async (req, res) => {
    try {
        const { userId, actionType, value } = req.body;
        let user;
        let isUpdated = false;
        if (isDbConnected()) {
            user = await User.findOne({ uid: userId });
        } else {
            user = memoryDb.users.find(u => u.uid === userId);
        }
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (!user.dailyQuests || user.dailyQuests.length === 0) {
            user.dailyQuests = generateDailyQuests();
            isUpdated = true;
        }
        const processQuests = (questList) => {
            questList.forEach(quest => {
                if (quest.type === actionType && !quest.completed) {
                    quest.progress = Math.min(quest.target, (quest.progress || 0) + Number(value));
                    if (quest.progress >= quest.target) quest.completed = true;
                    isUpdated = true;
                }
            });
        };
        if (user.dailyQuests) processQuests(user.dailyQuests);
        if (user.weeklyQuests) processQuests(user.weeklyQuests);
        if (isUpdated && isDbConnected()) await user.save();
        res.json({ success: true, quests: user.dailyQuests });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/quests/claim', async (req, res) => {
    try {
        const { userId, questId, category } = req.body;
        let user;
        if (isDbConnected()) {
            user = await User.findOne({ uid: userId });
        } else {
            user = memoryDb.users.find(u => u.uid === userId);
        }
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (category === 'LIFETIME') return res.json({ success: true, points: user.points }); 
        const list = category === 'WEEKLY' ? user.weeklyQuests : user.dailyQuests;
        const quest = list.find(q => q.id === questId);
        if (quest && quest.completed && !quest.claimed) {
            quest.claimed = true;
            user.points = (user.points || 0) + quest.reward;
            if (isDbConnected()) await user.save();
            res.json({ success: true, points: user.points });
        } else {
            res.status(400).json({ error: 'Quest not eligible or already claimed' });
        }
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- USERS ---

app.post('/api/users/sync', async (req, res) => {
    try {
        const userData = req.body;
        if (isDbConnected()) {
            let user = await User.findOne({ uid: userData.uid });
            if (!user) {
                user = new User({
                    ...userData,
                    dailyQuests: generateDailyQuests(),
                    lastQuestReset: Date.now()
                });
                await user.save();
            } else {
                await User.findOneAndUpdate({ uid: userData.uid }, { $set: userData }, { new: true });
            }
        } else {
            const idx = memoryDb.users.findIndex(u => u.uid === userData.uid);
            if (idx >= 0) memoryDb.users[idx] = { ...memoryDb.users[idx], ...userData };
            else {
                memoryDb.users.push({
                    ...userData, 
                    dailyQuests: generateDailyQuests(),
                    points: 0,
                    totalExams: 0,
                    stats: { totalCorrect: 0, totalWrong: 0, totalSkipped: 0, subjectStats: {}, topicStats: {} }
                });
            }
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/users/:userId/stats', async (req, res) => {
    try {
        let user;
        if (isDbConnected()) {
            user = await User.findOne({ uid: req.params.userId });
            if (user) {
                const updatedUser = await checkAndResetUserQuests(user);
                if (updatedUser !== user) { await updatedUser.save(); user = updatedUser; }
            }
        } else {
            user = memoryDb.users.find(u => u.uid === req.params.userId);
            if (user) {
                 const now = new Date();
                 const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
                 if (!user.lastQuestReset || user.lastQuestReset < todayStart) {
                     user.dailyQuests = generateDailyQuests();
                     user.lastQuestReset = Date.now();
                 }
            }
        }
        if (user) {
            // --- STREAK VALIDATION LOGIC START ---
            // Ensure streak is reset if a day was missed
            const todayStr = getDhakaDateString();
            const lastActiveStr = user.lastActivityDate;
            
            if (lastActiveStr && lastActiveStr !== todayStr) {
                const todayDate = new Date(todayStr);
                const lastDate = new Date(lastActiveStr);
                const diffTime = todayDate - lastDate; 
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                
                // If diff > 1 (e.g. 2 days ago), streak is broken (0)
                if (diffDays > 1) {
                    user.currentStreak = 0;
                    if (isDbConnected()) await user.save();
                }
            }
            // --- STREAK VALIDATION LOGIC END ---

            const subjStatsObj = user.stats.subjectStats instanceof Map 
                ? Object.fromEntries(user.stats.subjectStats) 
                : (user.stats.subjectStats || {});
            const topicStatsObj = user.stats.topicStats instanceof Map
                ? Object.fromEntries(user.stats.topicStats)
                : (user.stats.topicStats || {});

            const subjectBreakdown = Object.keys(subjStatsObj).map(s => {
                const total = subjStatsObj[s].total || 0;
                const correct = subjStatsObj[s].correct || 0;
                return {
                    subject: s,
                    total: total,
                    correct: correct,
                    wrong: Math.max(0, total - correct),
                    skipped: 0,
                    accuracy: total > 0 ? (correct / total) * 100 : 0
                };
            }).sort((a,b) => b.accuracy - a.accuracy);

            const topicBreakdown = Object.keys(topicStatsObj).map(t => ({
                topic: t,
                accuracy: (topicStatsObj[t].correct / topicStatsObj[t].total) * 100,
                total: topicStatsObj[t].total
            })).sort((a,b) => b.accuracy - a.accuracy);

            res.json({ 
                points: user.points, 
                totalExams: user.totalExams,
                totalCorrect: user.stats.totalCorrect,
                totalWrong: user.stats.totalWrong,
                subjectBreakdown,
                strongestTopics: topicBreakdown.slice(0, 5),
                weakestTopics: topicBreakdown.slice().reverse().slice(0, 5),
                quests: user.dailyQuests || [],
                weeklyQuests: user.weeklyQuests || [],
                user: user,
                // Add Streak Data
                currentStreak: user.currentStreak || 0,
                lastActivityDate: user.lastActivityDate || '',
                activityLog: user.activityLog || []
            });
        } else { res.json({ points: 0, totalExams: 0, quests: generateDailyQuests(), currentStreak: 0, activityLog: [] }); }
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/users/:userId/exam-results', async (req, res) => {
    try {
        const { userId } = req.params;
        const resultData = req.body;
        
        // --- DB Logic to save Exam Result ---
        if (isDbConnected()) {
            // Save the detailed exam result
            await ExamResult.create({ 
                userId, 
                ...resultData // Contains examId, userAnswers, questions, config, stats
            });

            // Update user global stats
            const user = await User.findOne({ uid: userId });
            if (user) {
                user.totalExams += 1;
                user.points += (resultData.score > 0 ? (resultData.correct * 5) + 10 : 0);
                if (!user.stats) user.stats = { totalCorrect:0, totalWrong:0, totalSkipped:0, subjectStats: {}, topicStats: {} };
                user.stats.totalCorrect += resultData.correct;
                user.stats.totalWrong += resultData.wrong;
                user.stats.totalSkipped += resultData.skipped;
                const subjStat = user.stats.subjectStats.get(resultData.subject) || { correct: 0, total: 0 };
                subjStat.correct += resultData.correct;
                subjStat.total += resultData.totalQuestions;
                user.stats.subjectStats.set(resultData.subject, subjStat);
                resultData.topicStats.forEach(t => {
                    const topicStat = user.stats.topicStats.get(t.topic) || { correct: 0, total: 0 };
                    topicStat.correct += t.correct;
                    topicStat.total += t.total;
                    user.stats.topicStats.set(t.topic, topicStat);
                });
                await user.save();
            }
            
            // Efficient Mistake Tracking: Use Reference
            if (resultData.mistakes && resultData.mistakes.length > 0) {
                for (const m of resultData.mistakes) {
                    if (m._id) { // Only track if question exists in DB
                        await Mistake.findOneAndUpdate(
                            { userId, questionId: m._id },
                            { 
                                $inc: { wrongCount: 1 },
                                $set: { lastMissed: Date.now() }
                            },
                            { upsert: true }
                        );
                    }
                }
            }
        } else {
            // Memory Fallback
            memoryDb.examResults.push({ userId, ...resultData, _id: Date.now().toString() });
            // Simplified User Update for Memory
            const uIdx = memoryDb.users.findIndex(u => u.uid === userId);
            if (uIdx >= 0) {
                memoryDb.users[uIdx].totalExams = (memoryDb.users[uIdx].totalExams || 0) + 1;
                memoryDb.users[uIdx].points = (memoryDb.users[uIdx].points || 0) + (resultData.score > 0 ? (resultData.correct * 5) + 10 : 0);
            }
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// NEW: Get All Exam Results for a User
app.get('/api/users/:userId/exam-results', async (req, res) => {
    try {
        const { userId } = req.params;
        if (isDbConnected()) {
            const results = await ExamResult.find({ userId }).sort({ timestamp: -1 });
            res.json(results);
        } else {
            // Memory Fallback
            const results = memoryDb.examResults.filter(r => r.userId === userId);
            res.json(results.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// NEW: Get Specific Exam Result (For Persistence)
app.get('/api/users/:userId/exam-results/:examId', async (req, res) => {
    try {
        const { userId, examId } = req.params;
        if (isDbConnected()) {
            const result = await ExamResult.findOne({ userId, examId });
            if (result) {
                res.json(result);
            } else {
                res.status(404).json({ error: "Exam result not found" });
            }
        } else {
            // Memory Fallback
            const result = memoryDb.examResults.find(r => r.userId === userId && r.examId === examId);
            if (result) res.json(result);
            else res.status(404).json({ error: "Result not found" });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// NEW: Delete Specific Exam Result (Database cleanup)
app.delete('/api/users/:userId/exam-results/:examId', async (req, res) => {
    try {
        const { userId, examId } = req.params;
        if (isDbConnected()) {
            const result = await ExamResult.findOneAndDelete({ userId, examId });
            if (result) {
                // Optionally update user's totalExams (decrement by 1)
                const user = await User.findOne({ uid: userId });
                if (user && user.totalExams > 0) {
                    user.totalExams = Math.max(0, user.totalExams - 1);
                    await user.save();
                }
                res.json({ success: true, message: "Exam result deleted successfully" });
            } else {
                res.status(404).json({ error: "Exam result not found" });
            }
        } else {
            // Memory Fallback
            const index = memoryDb.examResults.findIndex(r => r.userId === userId && r.examId === examId);
            if (index !== -1) {
                memoryDb.examResults.splice(index, 1);
                const uIdx = memoryDb.users.findIndex(u => u.uid === userId);
                if (uIdx >= 0 && memoryDb.users[uIdx].totalExams > 0) {
                    memoryDb.users[uIdx].totalExams -= 1;
                }
                res.json({ success: true, message: "Exam result deleted from memory" });
            } else {
                res.status(404).json({ error: "Result not found" });
            }
        }
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- CACHING FOR STATS ---
let statsCache = {
    data: null,
    level: null,
    lastFetched: 0
};
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// GET: SYLLABUS STATS (NESTED QUESTION COUNTS)
app.get('/api/quiz/syllabus-stats', async (req, res) => {
    try {
        const { level } = req.query;
        const now = Date.now();

        // Return cached data if valid
        if (statsCache.data && statsCache.level === level && (now - statsCache.lastFetched) < CACHE_TTL) {
            return res.json(statsCache.data);
        }

        let stats = {};
        const query = {};
        if (level && level !== 'ALL') query.level = { $regex: level, $options: 'i' };

        if (isDbConnected()) {
            const matchQuery = { ...query };
            if (matchQuery.subject) matchQuery.subject = { $in: getUnicodeVariants(matchQuery.subject) };
            if (matchQuery.chapter) matchQuery.chapter = { $in: getUnicodeVariants(matchQuery.chapter) };

            const agg = await QuestionBank.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: { subject: "$subject", chapter: "$chapter", topic: "$topic" },
                        count: { $sum: 1 }
                    }
                }
            ]);
            agg.forEach(item => {
                const { subject, chapter, topic } = item._id;
                const count = item.count;
                if (!stats[subject]) stats[subject] = { total: 0, chapters: {} };
                stats[subject].total += count;
                if (!stats[subject].chapters[chapter]) stats[subject].chapters[chapter] = { total: 0, topics: {} };
                stats[subject].chapters[chapter].total += count;
                if (topic) {
                    stats[subject].chapters[chapter].topics[topic] = count;
                }
            });
        } else {
            // Memory Fallback
            memoryDb.questions.forEach(q => {
                // Apply filters
                if (level && level !== 'ALL' && !(q.level || "").toLowerCase().includes(level.toLowerCase())) return;

                const { subject, chapter, topic } = q;
                if (!stats[subject]) stats[subject] = { total: 0, chapters: {} };
                stats[subject].total++;
                if (!stats[subject].chapters[chapter]) stats[subject].chapters[chapter] = { total: 0, topics: {} };
                stats[subject].chapters[chapter].total++;
                if (topic) stats[subject].chapters[chapter].topics[topic] = (stats[subject].chapters[chapter].topics[topic] || 0) + 1;
            });
        }

        // Update cache
        statsCache = {
            data: stats,
            level: level,
            lastFetched: now
        };

        res.json(stats);
    } catch (e) {
        console.error("Stats Error:", e);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// --- QUESTION BANK ADMIN ---

// GET: Single Question by Slug (Public)
app.get('/api/questions/slug/:slug', async (req, res) => {
    try {
        const question = await QuestionBank.findOne({ slug: req.params.slug });
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        res.json(question);
    } catch (error) {
        console.error("Error fetching question by slug:", error);
        res.status(500).json({ error: 'Failed to fetch question' });
    }
});

// GET: All Questions (Admin Viewer with Search)
app.get('/api/admin/questions', async (req, res) => {
    try {
        const { page = 1, limit = 10, subject, chapter, topic, examRef, search, level, board, college, admissionCategory } = req.query;
        const query = {};
        if(subject && subject !== 'ALL') {
            query.subject = { $in: getUnicodeVariants(subject) };
        }
        if(chapter && chapter !== 'ALL') {
            query.chapter = { $in: getUnicodeVariants(chapter) };
        }
        if(topic && topic !== 'ALL') {
            query.topic = { $in: getUnicodeVariants(topic) };
        }
        if(examRef && examRef !== 'ALL') query.examRef = { $in: getExamRefVariants(examRef) };
        if(level && level !== 'ALL') query.level = { $regex: level, $options: 'i' };
        if(admissionCategory && admissionCategory !== 'ALL') query.admissionCategory = admissionCategory;

        if (board && board !== 'ALL' && board !== 'AB') {
            if (board === 'ANY') {
                const BOARD_KEYS = ["DB", "RB", "CB", "JB", "ChB", "BB", "SB", "DiB", "MB", "MSB"];
                const bnNames = ["ঢাকা", "রাজশাহী", "কুমিল্লা", "যশোর", "চট্টগ্রাম", "বরিশাল", "সিলেট", "দিনাজপুর", "মাদ্রাসা", "ময়মনসিংহ", "বোর্ড"];
                
                const orConditions = BOARD_KEYS.map(b => ({ board: b }))
                                    .concat(BOARD_KEYS.map(b => ({ examRef: { $regex: b, $options: 'i' } })))
                                    .concat(BOARD_KEYS.map(b => ({ tags: { $regex: b, $options: 'i' } })))
                                    .concat(bnNames.map(b => ({ examRef: { $regex: b, $options: 'i' } })))
                                    .concat(bnNames.map(b => ({ tags: { $regex: b, $options: 'i' } })));
                
                query.$and = query.$and || [];
                query.$and.push({ $or: orConditions });
            } else {
                const BOARD_NAMES_BN = {
                    DB: "ঢাকা",
                    RB: "রাজশাহী",
                    CB: "কুমিল্লা",
                    JB: "যশোর",
                    ChB: "চট্টগ্রাম",
                    BB: "বরিশাল",
                    SB: "সিলেট",
                    DiB: "দিনাজপুর",
                    MB: "মাদ্রাসা",
                    MSB: "ময়মনসিংহ"
                };
                const bnName = BOARD_NAMES_BN[board];
                const orConditions = [
                    { board: board },
                    { examRef: { $regex: board, $options: 'i' } },
                    { tags: { $regex: board, $options: 'i' } }
                ];
                if (bnName) {
                    orConditions.push({ examRef: { $regex: bnName, $options: 'i' } });
                    orConditions.push({ tags: { $regex: bnName, $options: 'i' } });
                }
                query.$and = query.$and || [];
                query.$and.push({ $or: orConditions });
            }
        }

        if (college && college !== 'ALL') {
            if (college === 'ANY') {
                 const COLLEGES = [
                    "ACPSCD", "AMCM", "APBPSC", "BAFSC", "BAFSCJ", "BBGC", "BCC", "BCPSCB", "BGC", "BGCB", 
                    "BNMPC", "CCC", "CCJ", "CC", "CPSCM", "CPSCR", "CWC", "DC", "DCC", "DGC", "DRMC", "FCC", 
                    "FGC", "FGCC", "GAHC", "GAMCJ", "GBCG", "GCC", "GECP", "GGMC", "GHMMCC", "GSCD", "HLC", 
                    "ICD", "IPSCC", "ISCM", "ITHSC", "JCCJ", "JCPSC", "LGC", "MCC", "MCD", "MGCC", "MUVCD", 
                    "NDC", "NGC", "NGCN", "NGDCR", "NGVC", "NICK", "PGMC", "PGWC", "QCSC", "RC", "RCC", "RUMC", 
                    "SBULAGC", "SCPSC", "SHS", "SMC", "SSAC", "VNSC", "কলেজ", "College"
                 ];
                 const orConditions = [
                     { college: { $exists: true, $ne: "" } }
                 ].concat(COLLEGES.map(c => ({ examRef: { $regex: c, $options: 'i' } })))
                  .concat(COLLEGES.map(c => ({ tags: { $regex: c, $options: 'i' } })));

                 query.$and = query.$and || [];
                 query.$and.push({ $or: orConditions });
            } else {
                query.$and = query.$and || [];
                query.$and.push({
                    $or: [
                        { college: college },
                        { examRef: { $regex: college, $options: 'i' } },
                        { tags: { $regex: college, $options: 'i' } }
                    ]
                });
            }
        }
        
        if (search) {
            query.$text = { $search: search };
        }

        if(isDbConnected()) {
            if (req.query.randomise === 'true') {
                const questions = await QuestionBank.aggregate([
                    { $match: query },
                    { $sample: { size: Number(limit) } }
                ]);
                const total = await QuestionBank.countDocuments(query);
                return res.json({ questions, total });
            }

            let sort = { year: -1, orderIndex: 1, createdAt: 1 };
            if (examRef && examRef !== 'ALL') {
                sort = { orderIndex: 1, createdAt: 1 };
            }
            const questions = await QuestionBank.find(query).skip((page-1)*limit).limit(Number(limit)).sort(sort);
            const total = await QuestionBank.countDocuments(query);
            res.json({ questions, total });
        } else {
            // Memory Fallback Search
            let qs = memoryDb.questions;
            if (subject && subject !== 'ALL') qs = qs.filter(q => q.subject === subject);
            if (chapter && chapter !== 'ALL') qs = qs.filter(q => q.chapter === chapter);
            if (topic && topic !== 'ALL') qs = qs.filter(q => q.topic === topic);
            if (examRef && examRef !== 'ALL') qs = qs.filter(q => getExamRefVariants(examRef).includes(q.examRef));
            if (level && level !== 'ALL') qs = qs.filter(q => (q.level || "").toLowerCase().includes(level.toLowerCase()));

            if (board && board !== 'ALL' && board !== 'AB') {
                const lowerBoard = board.toLowerCase();
                const BOARD_NAMES_BN = {
                    DB: "ঢাকা", RB: "রাজশাহী", CB: "কুমিল্লা", JB: "যশোর", 
                    ChB: "চট্টগ্রাম", BB: "বরিশাল", SB: "সিলেট", DiB: "দিনাজপুর", 
                    MB: "মাদ্রাসা", MSB: "ময়মনসিংহ"
                };
                const bnName = BOARD_NAMES_BN[board];
                qs = qs.filter(q => {
                    const examRefStr = q.examRef || "";
                    const qBoard = q.board || "";
                    const tagsList = (q.tags || []).map(t => String(t).toLowerCase());
                    const hasRef = examRefStr.toLowerCase().includes(lowerBoard) || (bnName && examRefStr.includes(bnName));
                    const hasTag = tagsList.some(t => t.includes(lowerBoard) || (bnName && t.includes(bnName)));
                    return qBoard === board || hasRef || hasTag;
                });
            }
            if (college && college !== 'ALL') {
                const lowerColl = college.toLowerCase();
                qs = qs.filter(q => {
                    const examRefStr = q.examRef || "";
                    const qColl = q.college || "";
                    const tagsList = (q.tags || []).map(t => String(t).toLowerCase());
                    const hasRef = examRefStr.toLowerCase().includes(lowerColl);
                    const hasTag = tagsList.some(t => t.includes(lowerColl));
                    return qColl === college || hasRef || hasTag;
                });
            }
            
            if (search) {
                const lowerSearch = search.toLowerCase();
                qs = qs.filter(q => q.question.toLowerCase().includes(lowerSearch) || (q.explanation && q.explanation.toLowerCase().includes(lowerSearch)));
            }

            if (req.query.randomise === 'true') {
                qs = qs.sort(() => 0.5 - Math.random());
                return res.json({ questions: qs.slice(0, limit), total: qs.length });
            }

            if (examRef && examRef !== 'ALL') {
                qs = [...qs].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
            } else {
                qs = [...qs].sort((a, b) => {
                    const yearA = extractYearFromRef(a.examRef);
                    const yearB = extractYearFromRef(b.examRef);
                    if (yearA !== yearB) return yearB - yearA;
                    return (b.createdAt || 0) - (a.createdAt || 0);
                });
            }
            
            res.json({ questions: qs.slice((page-1)*limit, page*limit), total: qs.length });
        }
    } catch(e) { res.status(500).json({error: e.message}); }
});

// POST: Bulk Upload
// --- SEO Migration Route ---
app.post('/api/admin/generate-slugs', async (req, res) => {
    try {
        if (!isDbConnected()) return res.status(500).json({ error: "DB not connected" });
        
        const questions = await QuestionBank.find({ slug: { $exists: false } });
        let count = 0;
        for (let q of questions) {
            q.slug = await generateUniqueSlug(q.question);
            await q.save();
            count++;
        }
        res.json({ success: true, message: `Generated slugs for ${count} questions.` });
    } catch (error) {
        console.error("Error generating slugs:", error);
        res.status(500).json({ error: error.message });
    }
});

const extractYearFromRef = (ref) => {
    if (!ref) return 0;
    const match = ref.match(/\d{2,4}/);
    if (!match) return 0;
    let year = parseInt(match[0]);
    if (year < 100) {
        // Handle 2-digit years (assuming 2000s)
        year += 2000;
    }
    return year;
};

// Helper for data refinement
function detectLevel(examRef, tags = []) {
    const ref = (examRef || "").toLowerCase();
    const tagsLower = (tags || []).map(t => String(t || "").toLowerCase());
    
    // 1. "দাঁড়িকমা" or "darikoma" is strictly GENERAL (overrides everything)
    const isDarikoma = /দাঁড়িকমা|darikoma/i.test(ref) || tagsLower.some(t => /দাঁড়িকমা|darikoma/i.test(t));
    if (isDarikoma) {
        return 'GENERAL';
    }

    // 2. Authors are strictly MAINBOOK
    const isMainbook = tagsLower.some(t => {
        const authors = ["গিয়াস উদ্দিন", "প্রামাণিক", "তফাজ্জল", "তপন", "ইসহাক", "হাসান", "আজিবুর", "আলীম", "ফজলুল হক", "আজমল", "গিয়াসউদ্দিন", "ফজলুল", "সার", "স্যার"];
        return authors.some(author => t.includes(author.toLowerCase()));
    });

    // 3. Admission: contains university/medical/dental keywords OR a session format (like '20-21, 20-21, 15-16, etc.)
    const isAdmissionKeyword = /medical|dental|university|du|buet|varsity|gst|guccho|admission|mat|dmat|kuet|ruet|cuet|iut|butex|afat|mpsc|bpsc|nsu|ewu|brac|aiub|sust|pstu|hstu|jnu|ju|ru|cu|cou|jkknu|sau|bsmrau|cvasu|nstu|just|mbstu|pust|pstu|bsmrstu|hstu|bau|sau|bsmrau|cvasu|শাবিপ্রবি|পাবিপ্রবি|যবিপ্রবি|রাবি|চবি|ঢাবি|বুয়েট|মেডিকেল|ভর্তি|এডমিশন|গুচ্ছ|ইঞ্জিনিয়ারিং|বিশ্ববিদ্যালয়|বিশ্ববিদ্যালয়|ডেন্টাল|নার্সিং/i.test(ref) ||
                               tagsLower.some(t => /medical|dental|university|du|buet|varsity|gst|guccho|admission|mat|dmat|kuet|ruet|cuet|iut|butex|afat|mpsc|bpsc|nsu|ewu|brac|aiub|sust|pstu|hstu|jnu|ju|ru|cu|cou|jkknu|sau|bsmrau|cvasu|nstu|just|mbstu|pust|pstu|bsmrstu|hstu|bau|sau|bsmrau|cvasu|শাবিপ্রবি|পাবিপ্রবি|যবিপ্রবি|রাবি|চবি|ঢাবি|বুয়েট|মেডিকেল|ভর্তি|এডমিশন|গুচ্ছ|ইঞ্জিনিয়ারিং|বিশ্ববিদ্যালয়|বিশ্ববিদ্যালয়|ডেন্টাল|নার্সিং/i.test(t));
                               
    const hasSessionPattern = /\d{2}-\d{2}/.test(ref) || tagsLower.some(t => /\d{2}-\d{2}/.test(t));
    
    const isAdmission = isAdmissionKeyword || hasSessionPattern;

    // 4. Academic: board/academic keyword, or board designation, or contains a single year (like '2022, 2021) without a session hyphen
    const isAcademicKeyword = /board|hsc|ssc|alim|jsc|psc|বোর্ড|এইচএসসি|এসএসসি|আলিম|দাখিল|জেএসসি|পিইসি|স্কুল|কলেজ|রাজউক|রাইফেলস|অর্ডন্যান্স/i.test(ref) || 
                              tagsLower.some(t => /board|hsc|ssc|alim|jsc|psc|বোর্ড|এইচএসসি|এসএসসি|আলিম|দাখিল|জেএসসি|পিইসি|স্কুল|কলেজ|রাজউক|রাইফেলস|অর্ডন্যান্স/i.test(t));
                              
    const isBoardTag = tagsLower.some(t => {
        const boardsShort = ["db", "rb", "cb", "jb", "chb", "bb", "sb", "dib", "mb", "msb"];
        return boardsShort.some(b => t === b || t.startsWith(b + "'") || t.startsWith(b + " "));
    });

    const isSingleYearExam = tagsLower.some(t => {
        const has4DigitYear = /\b20\d{2}\b/.test(t);
        const hasSessionHyphen = /\d{2}-\d{2}/.test(t);
        return has4DigitYear && !hasSessionHyphen;
    });

    const isAcademic = isAcademicKeyword || isBoardTag || isSingleYearExam;

    const levels = [];
    if (isAcademic) levels.push('ACADEMIC');
    if (isAdmission) levels.push('ADMISSION');
    if (isMainbook) levels.push('MAINBOOK');

    if (levels.length > 0) {
        return levels.join(',');
    }
    
    return 'GENERAL';
};

// POST: Refine All Questions (Admin)
app.post('/api/admin/questions/refine', async (req, res) => {
    try {
        if (isDbConnected()) {
            const questions = await QuestionBank.find({});
            let updatedCount = 0;
            
            for (let q of questions) {
                const level = detectLevel(q.examRef, q.tags);
                const year = extractYearFromRef(q.examRef);
                
                let tagsChanged = false;
                let newTags = q.tags;
                if (Array.isArray(q.tags)) {
                    const filtered = q.tags.filter(t => t && !/দাঁড়িকমা|darikoma/i.test(String(t).trim()));
                    if (filtered.length !== q.tags.length) {
                        newTags = filtered;
                        tagsChanged = true;
                    }
                }
                
                // Only update if changed or missing
                if (q.level !== level || q.year !== year || tagsChanged) {
                    q.level = level;
                    q.year = year;
                    q.tags = newTags;
                    await q.save();
                    updatedCount++;
                }
            }
            res.json({ success: true, message: `Refined ${updatedCount} questions.`, totalSynced: questions.length });
        } else {
            memoryDb.questions.forEach(q => {
                const level = detectLevel(q.examRef, q.tags);
                q.level = level;
                if (Array.isArray(q.tags)) {
                    q.tags = q.tags.filter(t => t && !/দাঁড়িকমা|darikoma/i.test(String(t).trim()));
                }
            });
            res.json({ success: true, message: "Refined in-memory questions." });
        }
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST: Cleanup Questions (Admin)
app.post('/api/admin/questions/cleanup', async (req, res) => {
    try {
        const { type } = req.query;
        if (!isDbConnected()) return res.status(500).json({ error: "DB not connected" });

        if (type === 'remove-difficulty') {
            const result = await QuestionBank.updateMany({}, { $unset: { difficulty: "" } });
            return res.json({ success: true, message: `Difficulty field removed from ${result.modifiedCount} questions.` });
        }

        res.status(400).json({ error: "Invalid cleanup type" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST: Create Single Question (Admin Manual Entry)
app.post('/api/admin/questions', async (req, res) => {
    try {
        const qData = req.body;
        if (!qData.level) {
            qData.level = detectLevel(qData.examRef, qData.tags);
        }
        if (Array.isArray(qData.tags)) {
            qData.tags = qData.tags.filter(t => t && !/দাঁড়িকমা|darikoma/i.test(String(t).trim()));
        }
        if (isDbConnected()) {
            if (!qData.slug) {
                qData.slug = await generateUniqueSlug(qData.question);
            }
            const newQ = new QuestionBank(qData);
            await newQ.save();

            // If examRef is provided, update/upsert QuestionPaper
            if (qData.examRef) {
                const count = await QuestionBank.countDocuments({ examRef: qData.examRef });
                await QuestionPaper.findOneAndUpdate(
                    { id: qData.examRef },
                    { 
                        id: qData.examRef,
                        title: qData.examRef.replace(/_/g, ' '),
                        totalQuestions: count
                    },
                    { upsert: true, new: true }
                );
            }
            res.json({ success: true, question: newQ });
        } else {
            const enrichedQ = { ...qData, _id: Date.now() + Math.random() };
            memoryDb.questions.push(enrichedQ);
            res.json({ success: true, question: enrichedQ });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/admin/questions/bulk', async (req, res) => {
    try {
        let { questions, metadata } = req.body;
        
        if(isDbConnected()) {
            const batchSlugs = new Set();
            for (let i = 0; i < questions.length; i++) {
                // Force Normalization
                questions[i].subject = normalizeToNFC(questions[i].subject);
                questions[i].chapter = normalizeToNFC(questions[i].chapter);
                questions[i].topic = normalizeToNFC(questions[i].topic);

                if (!questions[i].slug) {
                    let baseSlug = generateSlug(questions[i].question);
                    if (!baseSlug) baseSlug = 'question';
                    
                    let slug = baseSlug;
                    let attempt = 0;
                    while (batchSlugs.has(slug)) {
                        attempt++;
                        slug = `${baseSlug}-${Math.random().toString(36).substring(2, 5)}-${attempt}`;
                    }
                    
                    const dbSlug = await generateUniqueSlug(questions[i].question);
                    let finalSlug = dbSlug;
                    if (batchSlugs.has(finalSlug)) {
                        finalSlug = `${finalSlug}-${Math.random().toString(36).substring(2, 5)}`;
                    }
                    
                    questions[i].slug = finalSlug;
                    batchSlugs.add(finalSlug);
                }
                // Auto-detect level and year
                const level = detectLevel(questions[i].examRef, questions[i].tags);
                questions[i].level = questions[i].level || level;
                questions[i].year = questions[i].year || extractYearFromRef(questions[i].examRef);

                // Filter out "দাঁড়িকমা" or "darikoma" tags
                if (Array.isArray(questions[i].tags)) {
                    questions[i].tags = questions[i].tags.filter(t => t && !/দাঁড়িকমা|darikoma/i.test(String(t).trim()));
                }
            }
            
            // Use ordered: false to allow partial success if some questions fail (e.g. unique constraint)
            try {
                await QuestionBank.insertMany(questions, { ordered: false });
            } catch (error) {
                if (error.name !== 'MongoBulkWriteError') throw error;
                console.warn(`Bulk write partial success: ${error.insertedDocs?.length} inserted, ${error.writeErrors?.length} failed.`);
            }
            
            if (metadata) {
                // FIX: Instead of blindly updating with metadata.totalQuestions (which is just the batch size),
                // we count the actual total questions in the DB for this examRef.
                const realTotalCount = await QuestionBank.countDocuments({ examRef: metadata.id });

                await QuestionPaper.findOneAndUpdate(
                    { id: metadata.id },
                    { 
                        ...metadata,
                        totalQuestions: realTotalCount // Update with the actual cumulative count
                    },
                    { upsert: true, new: true }
                );
            }
        } else {
            // Memory Fallback Logic
            questions.forEach(q => {
                const level = detectLevel(q.examRef, q.tags);
                const enrichedQ = {
                    ...q,
                    _id: Date.now() + Math.random(),
                    level: q.level || level
                };
                if (Array.isArray(enrichedQ.tags)) {
                    enrichedQ.tags = enrichedQ.tags.filter(t => t && !/দাঁড়িকমা|darikoma/i.test(String(t).trim()));
                }
                memoryDb.questions.push(enrichedQ);
            });
            
            if (metadata) {
                const existingIdx = memoryDb.questionPapers.findIndex(p => p.id === metadata.id);
                if (existingIdx >= 0) {
                    // If paper exists, update details and increment count
                    const existingPaper = memoryDb.questionPapers[existingIdx];
                    memoryDb.questionPapers[existingIdx] = {
                        ...metadata,
                        totalQuestions: (existingPaper.totalQuestions || 0) + questions.length
                    };
                } else {
                    // New paper
                    memoryDb.questionPapers.push(metadata);
                }
            }
        }
        res.json({ success: true });
    } catch(e) { res.status(500).json({error: e.message}); }
});

// PUT: Update Question (NEW)
app.put('/api/admin/questions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        if (isDbConnected()) {
            const existingQuestion = await QuestionBank.findById(id);
            if (existingQuestion && !existingQuestion.slug) {
                updateData.slug = await generateUniqueSlug(updateData.question || existingQuestion.question);
            }
            
            // Recalculate level if examRef or tags changed
            const finalExamRef = updateData.examRef !== undefined ? updateData.examRef : (existingQuestion ? existingQuestion.examRef : undefined);
            const finalTags = updateData.tags !== undefined ? updateData.tags : (existingQuestion ? existingQuestion.tags : []);
            updateData.level = detectLevel(finalExamRef, finalTags);

            const updated = await QuestionBank.findByIdAndUpdate(id, updateData, { new: true });
            res.json({ success: true, question: updated });
        } else {
            const index = memoryDb.questions.findIndex(q => q._id.toString() === id);
            if (index !== -1) {
                const existingQuestion = memoryDb.questions[index];
                const finalExamRef = updateData.examRef !== undefined ? updateData.examRef : existingQuestion.examRef;
                const finalTags = updateData.tags !== undefined ? updateData.tags : existingQuestion.tags;
                updateData.level = detectLevel(finalExamRef, finalTags);

                memoryDb.questions[index] = { ...existingQuestion, ...updateData };
                res.json({ success: true, question: memoryDb.questions[index] });
            } else {
                res.status(404).json({ error: "Question not found in memory" });
            }
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// DELETE: Delete Question
app.delete('/api/admin/questions/:id', async (req, res) => {
    try {
        if(isDbConnected()) {
            await QuestionBank.findByIdAndDelete(req.params.id);
        } else {
            memoryDb.questions = memoryDb.questions.filter(q => q._id.toString() !== req.params.id);
        }
        res.json({ success: true });
    } catch(e) { res.status(500).json({error: e.message}); }
});

// GET: Question Papers (Updated with Dynamic Subject Detection)
app.get('/api/question-papers', async (req, res) => {
    try {
        if (isDbConnected()) {
            // 1. Get all papers metadata
            let papers = await QuestionPaper.find().sort({ year: -1 }).lean();

            // 2. Aggregate Question Counts
            const counts = await QuestionBank.aggregate([
                { $group: { _id: "$examRef", total: { $sum: 1 } } }
            ]);

            // 3. Aggregate Unique Subjects per Paper (This is the new part)
            const subjectAgg = await QuestionBank.aggregate([
                { $group: { _id: { examRef: "$examRef", subject: "$subject" } } },
                { $group: { _id: "$_id.examRef", subjects: { $push: "$_id.subject" } } }
            ]);

            // Create Maps for fast lookup
            const countMap = {};
            counts.forEach(c => {
                if (c._id) countMap[c._id] = c.total;
            });

            const subjectMap = {};
            subjectAgg.forEach(s => {
                if (s._id) subjectMap[s._id] = s.subjects;
            });

            // 4. Merge data
            papers = papers.map(p => ({
                ...p,
                totalQuestions: countMap[p.id] || p.totalQuestions || 0,
                subjects: subjectMap[p.id] || [] // Attach the detected subjects
            }));

            res.json(papers);
        } else {
            // Memory Fallback
            const papers = memoryDb.questionPapers.map(p => {
                const relatedQuestions = memoryDb.questions.filter(q => q.examRef === p.id);
                const count = relatedQuestions.length;
                const subjects = [...new Set(relatedQuestions.map(q => q.subject))]; // Unique subjects
                return { ...p, totalQuestions: count, subjects };
            }).sort((a, b) => b.year.localeCompare(a.year));
            res.json(papers);
        }
    } catch(e) { 
        console.error("Error fetching papers:", e);
        res.status(500).json({error: e.message}); 
    }
});

// Get all unique examRef values for questions missing subject/chapter/topic
app.get('/api/admin/incomplete-exam-refs', async (req, res) => {
    try {
        if (isDbConnected()) {
            const query = {
                $or: [
                    { subject: { $in: [null, "", undefined] } },
                    { chapter: { $in: [null, "", undefined] } },
                    { topic: { $in: [null, "", undefined] } }
                ]
            };
            const refs = await QuestionBank.distinct('examRef', query);
            res.json(refs.filter(r => r)); // Filter out null/empty values
        } else {
            const qs = memoryDb.questions.filter(q => !q.subject || !q.chapter || !q.topic);
            const refs = [...new Set(qs.map(q => q.examRef))];
            res.json(refs.filter(r => r));
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get all unique examRef values
app.get('/api/question-bank/exam-refs', async (req, res) => {
    try {
        const { level } = req.query;
        let query = {};
        if (level && level !== 'ALL') query.level = { $regex: level, $options: 'i' };

        if (isDbConnected()) {
            const refs = await QuestionBank.distinct('examRef', query);
            const sortedRefs = refs.filter(r => r).sort((a, b) => {
                const yearA = extractYearFromRef(a);
                const yearB = extractYearFromRef(b);
                if (yearA !== yearB) return yearB - yearA;
                return a.localeCompare(b);
            });
            res.json(sortedRefs);
        } else {
            const qs = level && level !== 'ALL' ? memoryDb.questions.filter(q => (q.level || "").toLowerCase().includes(level.toLowerCase())) : memoryDb.questions;
            const refs = [...new Set(qs.map(q => q.examRef))].filter(r => r).sort((a, b) => {
                const yearA = extractYearFromRef(a);
                const yearB = extractYearFromRef(b);
                if (yearA !== yearB) return yearB - yearA;
                return a.localeCompare(b);
            });
            res.json(refs);
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/quiz/past-paper/:examRef', async (req, res) => {
    try {
        const { examRef } = req.params;
        if (isDbConnected()) {
            const questions = await QuestionBank.find({ examRef: { $in: getExamRefVariants(examRef) } }).sort({ orderIndex: 1 });
            res.json(questions);
        } else {
            const questions = memoryDb.questions
                .filter(q => getExamRefVariants(examRef).includes(q.examRef))
                .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
            res.json(questions);
        }
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/quiz/generate-from-db', async (req, res) => {
    try {
        const { subject, chapter, topics, count } = req.body;
        if (isDbConnected()) {
            const matchQuery = {
                subject: { $in: getUnicodeVariants(subject) }
            };
            
            if (chapter !== 'Full Syllabus') {
                matchQuery.chapter = { $in: getUnicodeVariants(chapter) };
            } else {
                matchQuery.chapter = { $exists: true };
            }

            if (topics && topics.length > 0 && topics[0] !== 'Full Syllabus') {
                // For topics, since it is an array of strings, we need to handle each topic's variants
                const allTopicVariants = topics.flatMap(t => getUnicodeVariants(t));
                // Add 'General' so that questions uploaded without a specific topic still show up when filtering by specific topics
                matchQuery.topic = { $in: [...allTopicVariants, 'General'] };
            }

            const pipeline = [
                { $match: matchQuery },
                { $sample: { size: count } }
            ];
            const questions = await QuestionBank.aggregate(pipeline);
            res.json(questions);
        } else {
            const filtered = memoryDb.questions.filter(q => q.subject === subject && (chapter === 'Full Syllabus' || q.chapter === chapter));
            const shuffled = filtered.sort(() => 0.5 - Math.random()).slice(0, count);
            res.json(shuffled);
        }
    } catch (e) { res.status(500).json({error: e.message}); }
});

// --- OTHER ROUTES ---

app.get('/api/users/:userId/enrollments', async (req, res) => {
    try {
        const { userId } = req.params;
        let enrollments = [];
        if (isDbConnected()) {
            const payments = await Payment.find({ userId, status: 'APPROVED' });
            enrollments = payments.map(p => ({ id: p.courseId, title: p.courseTitle, progress: 0 }));
        } else {
            const payments = memoryDb.payments.filter(p => p.userId === userId && p.status === 'APPROVED');
            enrollments = payments.map(p => ({ id: p.courseId, title: p.courseTitle, progress: 0 }));
        }
        res.json(enrollments);
    } catch (e) { res.status(500).json({ error: 'Fetch enrollments failed' }); }
});

app.get('/api/users/:userId/saved-questions', async (req, res) => {
    try {
        if (isDbConnected()) {
            const saved = await SavedQuestion.find({ userId: req.params.userId }).populate('questionId').sort({ savedAt: -1 });
            res.json(saved.filter(s => s.questionId));
        } else { 
            const saved = memoryDb.savedQuestions.filter(s => s.userId === req.params.userId).sort((a,b) => b.savedAt - a.savedAt);
            res.json(saved); 
        }
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.post('/api/users/:userId/saved-questions', async (req, res) => {
    try {
        const { questionId, folder } = req.body;
        const userId = req.params.userId;

        if (isDbConnected()) { 
            // Use findOneAndUpdate with upsert to create or update if exists, updating savedAt to bring to top
            await SavedQuestion.findOneAndUpdate(
                { userId, questionId },
                { folder, savedAt: Date.now() },
                { upsert: true, new: true }
            );
        } else { 
            const existingIdx = memoryDb.savedQuestions.findIndex(s => s.userId === userId && s.questionId === questionId);
            if (existingIdx !== -1) {
                // Update existing
                memoryDb.savedQuestions[existingIdx].savedAt = Date.now();
                memoryDb.savedQuestions[existingIdx].folder = folder;
            } else {
                // Create new
                memoryDb.savedQuestions.push({ _id: Date.now().toString(), userId, questionId, folder, savedAt: Date.now() }); 
            }
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.patch('/api/users/:userId/saved-questions/:id', async (req, res) => {
    try {
        const { folder } = req.body;
        if (isDbConnected()) { await SavedQuestion.findByIdAndUpdate(req.params.id, { folder }); }
        res.json({ success: true });
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.delete('/api/users/:userId/saved-questions/:id', async (req, res) => {
    try {
        if (isDbConnected()) { await SavedQuestion.findByIdAndDelete(req.params.id); }
        else { memoryDb.savedQuestions = memoryDb.savedQuestions.filter(s => s._id !== req.params.id); }
        res.json({ success: true });
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.delete('/api/users/:userId/saved-questions/by-q/:questionId', async (req, res) => {
    try {
        if (isDbConnected()) { await SavedQuestion.findOneAndDelete({ userId: req.params.userId, questionId: req.params.questionId }); }
        res.json({ success: true });
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.get('/api/users/:userId/mistakes', async (req, res) => {
    try {
        if (isDbConnected()) {
            const mistakes = await Mistake.find({ userId: req.params.userId }).populate('questionId').sort({ lastMissed: -1 });
            // Filter out any where questionId might be null (e.g. deleted questions)
            res.json(mistakes.filter(m => m.questionId));
        } else { res.json(memoryDb.mistakes.filter(m => m.userId === req.params.userId)); }
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.post('/api/users/:userId/mistakes/clear', async (req, res) => {
    try {
        const { userId } = req.params;
        const { questionIds } = req.body; // Array of question IDs to remove

        if (isDbConnected()) {
            await Mistake.deleteMany({
                userId: userId,
                questionId: { $in: questionIds }
            });
        } else {
            memoryDb.mistakes = memoryDb.mistakes.filter(m => 
                m.userId !== userId || !questionIds.includes(m.questionId.toString())
            );
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/users/:userId/mistakes/:id', async (req, res) => {
    try {
        if (isDbConnected()) { await Mistake.findByIdAndDelete(req.params.id); }
        else { memoryDb.mistakes = memoryDb.mistakes.filter(m => m._id !== req.params.id); }
        res.json({ success: true });
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.put('/api/users/:userId/mistakes/:id/category', async (req, res) => {
    try {
        const { category } = req.body;
        if (isDbConnected()) {
            await Mistake.findByIdAndUpdate(req.params.id, { category });
        } else {
            const m = memoryDb.mistakes.find(x => x._id === req.params.id);
            if (m) m.category = category;
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({error: e.message}); }
});

app.get('/api/admin/payments', async (req, res) => {
    try {
        if(isDbConnected()) {
            const payments = await Payment.find().sort({ timestamp: -1 });
            res.json(payments);
        } else { res.json(memoryDb.payments); }
    } catch(e) { res.status(500).json({error: e.message}); }
});

app.post('/api/payments', async (req, res) => {
    try {
        if(isDbConnected()) { await Payment.create(req.body); }
        else { memoryDb.payments.push({ ...req.body, _id: Date.now().toString(), status: 'PENDING', timestamp: Date.now() }); }
        res.json({ success: true });
    } catch(e) { res.status(500).json({error: e.message}); }
});

app.put('/api/admin/payments/:id', async (req, res) => {
    try {
        const { status } = req.body;
        if(isDbConnected()) { await Payment.findByIdAndUpdate(req.params.id, { status }); }
        else { const p = memoryDb.payments.find(x => x._id === req.params.id); if(p) p.status = status; }
        res.json({ success: true });
    } catch(e) { res.status(500).json({error: e.message}); }
});

app.delete('/api/admin/payments/:id', async (req, res) => {
    try {
        if(isDbConnected()) { await Payment.findByIdAndDelete(req.params.id); }
        else { memoryDb.payments = memoryDb.payments.filter(p => p._id !== req.params.id); }
        res.json({ success: true });
    } catch(e) { res.status(500).json({error: e.message}); }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        if(isDbConnected()) {
            const users = await User.find({}, 'uid displayName photoURL points college hscBatch target department currentStreak').sort({ points: -1 });
            res.json(users);
        } else { res.json(memoryDb.users.sort((a,b) => (b.points||0) - (a.points||0))); }
    } catch(e) { res.status(500).json({error: e.message}); }
});

app.get('/api/notifications', async (req, res) => {
    try {
        if(isDbConnected()) {
            const notifs = await Notification.find().sort({ date: -1 }).limit(50);
            res.json(notifs);
        } else { res.json(memoryDb.notifications); }
    } catch(e) { res.status(500).json({error: e.message}); }
});

app.post('/api/admin/notifications', async (req, res) => {
    try {
        if(isDbConnected()) { await Notification.create(req.body); }
        else { memoryDb.notifications.unshift({ ...req.body, _id: Date.now().toString(), date: Date.now() }); }
        res.json({ success: true });
    } catch(e) { res.status(500).json({error: e.message}); }
});

app.delete('/api/admin/notifications/:id', async (req, res) => {
    try {
        if(isDbConnected()) { await Notification.findByIdAndDelete(req.params.id); }
        else { memoryDb.notifications = memoryDb.notifications.filter(n => n._id !== req.params.id); }
        res.json({ success: true });
    } catch(e) { res.status(500).json({error: e.message}); }
});

app.get('/api/exam-packs', async (req, res) => {
    try {
        if(isDbConnected()) {
            const packs = await ExamPack.find();
            res.json(packs);
        } else {
            res.json(memoryDb.examPacks);
        }
    } catch(e) { res.status(500).json({error: e.message}); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
