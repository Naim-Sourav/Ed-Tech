
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Swords, Zap, Trophy, UserPlus, Loader2, Play, Copy, Clock, Users, XCircle, 
  Crown, Eye, CheckCircle, X, ChevronDown, Check, Settings, ArrowRight, 
  Timer, Share2, LogOut, Grid, User, BarChart2, Smile, Flame, Target, 
  Shield, Lightbulb, FastForward, Heart, MessageCircle, AlertTriangle, MoveRight,
  History, Percent, Atom, Beaker, Calculator, Dna, Brain, Layers, Globe, BookOpen, Book, Hash, Meh
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SYLLABUS_DB } from '../services/syllabusData';
import { useToast } from './Toast';
import Confetti from './Confetti';
import { 
  createRTDBRoom, 
  joinRTDBRoom, 
  leaveRTDBRoom,
  startRTDBBattle, 
  submitAnswerRTDB, 
  listenToBattleRoom, 
  finishRTDBBattle,
  deleteRTDBRoom,
  listenToServerOffset,
  BattleRoom,
  BattlePlayer,
  sendReactionRTDB
} from '../services/battleService';
import { generateQuizFromDB, updateQuestProgressAPI, saveExamResultAPI, sendNotificationAPI, fetchUserStatsAPI } from '../services/api'; 
import { QuizQuestion } from '../types';
import { ref, update } from "firebase/database";
import { rtdb } from "../services/firebase";

// --- TYPES ---
interface BattleConfig {
  subjects: string[]; 
  chapters: string[];
  mode: '1v1' | '2v2' | 'FFA';
  questionCount: number;
  timePerQuestion: number;
  maxPlayers: number;
}

interface BattleStats {
    totalMatches: number;
    wins: number;
    totalPoints: number;
    winRate: number;
}

type Phase = 'MENU' | 'CREATE' | 'JOIN' | 'LOBBY' | 'GAME' | 'RESULT';

const REACTION_EMOJIS = [
    { label: 'Fire', icon: '🔥' },
    { label: 'Clap', icon: '👏' },
    { label: 'Shocked', icon: '😮' },
    { label: 'Think', icon: '🤔' },
    { label: 'GG', icon: '💪' }
];

const BATTLE_SUBJECTS = [
    { id: 'Physics', label: 'পদার্থবিজ্ঞান', icon: Atom, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800' },
    { id: 'Chemistry', label: 'রসায়ন', icon: Beaker, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800' },
    { id: 'Math', label: 'উচ্চতর গণিত', icon: Calculator, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' },
    { id: 'Biology', label: 'জীববিজ্ঞান', icon: Dna, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800' },
    { id: 'ICT', label: 'আইসিটি', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800' },
    { id: 'English', label: 'ইংরেজি', icon: BookOpen, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20', border: 'border-teal-200 dark:border-teal-800' },
    { id: 'Bangla', label: 'বাংলা', icon: Book, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20', border: 'border-pink-200 dark:border-pink-800' },
    { id: 'General Knowledge', label: 'সাধারণ জ্ঞান', icon: Globe, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20', border: 'border-cyan-200 dark:border-cyan-800' },
];

const QuizBattlePrototype: React.FC = () => {
  const { currentUser, userAvatar } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const opponentInfo = location.state?.opponent; 
  
  // --- STATE ---
  const [phase, setPhase] = useState<Phase>('MENU');
  const [loading, setLoading] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [battleState, setBattleState] = useState<BattleRoom | null>(null);
  const [inputRoomId, setInputRoomId] = useState('');
  const [showComparison, setShowComparison] = useState(false);
  
  // Stats State
  const [myStats, setMyStats] = useState<BattleStats>({
      totalMatches: 0,
      wins: 0,
      totalPoints: 0,
      winRate: 0
  });
  
  // Gameplay States
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [startCountdown, setStartCountdown] = useState<number | null>(null);
  const [serverTimeOffset, setServerTimeOffset] = useState(0);
  const [floatingPoints, setFloatingPoints] = useState<{id: number, pts: number} | null>(null);
  const [streak, setStreak] = useState(0);
  const [activeReactions, setActiveReactions] = useState<{id: number, emoji: string, sender: string}[]>([]);

  // Power Ups
  const [powerUps, setPowerUps] = useState({
      fiftyFifty: 1,
      extraTime: 1
  });
  const [disabledOptions, setDisabledOptions] = useState<number[]>([]);

  // Config
  const [config, setConfig] = useState<BattleConfig>({
    subjects: [], // Initially empty, user must select
    chapters: ['Full Syllabus'], 
    mode: '1v1',
    questionCount: 5,
    timePerQuestion: 15,
    maxPlayers: 2
  });

  // Helper function to determine font class based on language
  const getFont = (text: string = '') => {
    // Check if text contains any Bengali characters (Unicode range U+0980 to U+09FF)
    const isBangla = /[\u0980-\u09FF]/.test(text);
    return isBangla ? 'font-tiro' : 'font-sans';
  };

  // --- SYNC WITH SERVER ---
  useEffect(() => {
      const unsub = listenToServerOffset(setServerTimeOffset);
      return () => unsub();
  }, []);

  useEffect(() => {
      if (opponentInfo && phase === 'MENU') {
          setPhase('CREATE');
          setConfig(prev => ({ ...prev, mode: '1v1', maxPlayers: 2 }));
      }
  }, [opponentInfo]);

  // Load User Stats on Mount
  useEffect(() => {
      if (currentUser && phase === 'MENU') {
          const loadStats = async () => {
              try {
                  // In a real app, fetch battle specific stats. Here we mock/derive from general stats
                  const stats = await fetchUserStatsAPI(currentUser.uid);
                  setMyStats({
                      totalMatches: Math.floor((stats.totalExams || 0) / 3), // Mock derivation
                      wins: Math.floor((stats.totalExams || 0) / 5),
                      totalPoints: stats.points || 0,
                      winRate: stats.totalExams > 0 ? Math.round(((stats.totalExams/5) / (stats.totalExams/3)) * 100) : 0
                  });
              } catch (e) {
                  console.error("Failed to load stats", e);
              }
          };
          loadStats();
      }
  }, [currentUser, phase]);

  // MathJax Effect - Runs when question changes to render LaTeX
  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise && (phase === 'GAME' || phase === 'RESULT' || showComparison)) {
      setTimeout(() => {
        window.MathJax.typesetPromise().catch((err: any) => console.error('MathJax error:', err));
      }, 100);
    }
  }, [currentQIndex, phase, battleState, showComparison]);

  // Realtime Listeners
  useEffect(() => {
    let unsubscribe: () => void;
    if (roomId) {
      unsubscribe = listenToBattleRoom(roomId, (data) => {
          if (data) {
            setBattleState(data);
            
            // Sync Reactions from RTDB
            if (data.lastReaction && data.lastReaction.timestamp > Date.now() - 3000) {
                const rid = data.lastReaction.timestamp;
                setActiveReactions(prev => {
                    if (prev.some(r => r.id === rid)) return prev;
                    const newReaction = { id: rid, emoji: data.lastReaction!.emoji, sender: data.lastReaction!.sender };
                    setTimeout(() => setActiveReactions(p => p.filter(r => r.id !== rid)), 2500);
                    return [...prev, newReaction];
                });
            }

            if (data.status === 'WAITING' && phase !== 'LOBBY') setPhase('LOBBY');
            if (data.status === 'ACTIVE' && phase !== 'GAME') setPhase('GAME');
            if (data.status === 'FINISHED' && phase !== 'RESULT') setPhase('RESULT');
          } else {
            // Room deleted or unavailable
            if (phase === 'GAME' || phase === 'LOBBY') resetToMenu();
          }
      });
    }
    return () => unsubscribe?.();
  }, [roomId, phase]);

  // Game Loop & Timer
  useEffect(() => {
    let animationFrame: number;
    const updateLoop = () => {
      if (battleState?.status === 'ACTIVE' && phase === 'GAME') {
          const now = Date.now() + serverTimeOffset;
          const startTime = battleState.startTime;
          
          if (now < startTime) {
              setStartCountdown(Math.ceil((startTime - now) / 1000));
          } else {
              setStartCountdown(null);
              const elapsed = (now - startTime) / 1000;
              const durationPerQ = battleState.config.timePerQuestion;
              const calcIdx = Math.floor(elapsed / durationPerQ);
              
              if (calcIdx >= battleState.questions.length) {
                 if (battleState.hostId === currentUser?.uid) finishRTDBBattle(roomId);
              } else {
                 if (calcIdx !== currentQIndex) {
                    setCurrentQIndex(calcIdx);
                    setHasAnswered(false);
                    setSelectedOption(null);
                    setDisabledOptions([]);
                 }
                 setTimeLeft(Math.max(0, Math.ceil(durationPerQ - (elapsed % durationPerQ))));
              }
          }
      }
      animationFrame = requestAnimationFrame(updateLoop);
    };
    animationFrame = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animationFrame);
  }, [battleState, currentQIndex, phase, serverTimeOffset, roomId, currentUser?.uid]);

  // --- ACTIONS ---
  const handleAnswer = (idx: number) => {
      if (hasAnswered || !battleState || !currentUser) return;
      
      const q = battleState.questions[currentQIndex];
      const isCorrect = idx === Number(q.correctAnswerIndex);
      
      // Speed Bonus Calculation
      let points = 50;
      if (isCorrect) {
          if (timeLeft > 10) points = 60;
          else if (timeLeft < 5) points = 40;
          
          const newStreak = streak + 1;
          setStreak(newStreak);
          if (newStreak >= 3) points += 10;
          
          setFloatingPoints({ id: Date.now(), pts: points });
          setTimeout(() => setFloatingPoints(null), 1000);
      } else {
          setStreak(0);
      }

      setHasAnswered(true);
      setSelectedOption(idx);
      submitAnswerRTDB(roomId, currentUser.uid, currentQIndex, idx, isCorrect, points);
  };

  const skipToNextQuestion = async () => {
    if (!battleState || battleState.hostId !== currentUser?.uid) return;
    
    // Calculate how much we need to shift the start time
    // We want the new currentQIndex to be currentQIndex + 1 immediately
    const durationPerQ = battleState.config.timePerQuestion;
    const targetStartTime = Date.now() + serverTimeOffset - (currentQIndex + 1) * durationPerQ * 1000;
    
    const roomRef = ref(rtdb, `battles/${roomId}`);
    await update(roomRef, {
        startTime: targetStartTime
    });
  };

  const useFiftyFifty = () => {
      if (powerUps.fiftyFifty <= 0 || hasAnswered) return;
      const q = battleState!.questions[currentQIndex];
      const correctIdx = Number(q.correctAnswerIndex);
      const wrongIndices = [0, 1, 2, 3].filter(i => i !== correctIdx);
      const toDisable = wrongIndices.sort(() => 0.5 - Math.random()).slice(0, 2);
      setDisabledOptions(toDisable);
      setPowerUps(prev => ({ ...prev, fiftyFifty: 0 }));
      showToast("50-50 Used!", "info");
  };

  const sendReaction = (emoji: string) => {
      if (!roomId || !currentUser) return;
      sendReactionRTDB(roomId, emoji, currentUser.displayName || 'Learner');
  };

  const resetToMenu = () => {
      setPhase('MENU');
      setRoomId('');
      setBattleState(null);
      setStreak(0);
      setPowerUps({ fiftyFifty: 1, extraTime: 1 });
  };

  const handleLeave = async () => {
      if (!roomId || !currentUser) {
          resetToMenu();
          return;
      }
      try {
          if (battleState?.hostId === currentUser.uid) {
              await deleteRTDBRoom(roomId);
          } else {
              await leaveRTDBRoom(roomId, currentUser.uid);
          }
      } catch (e) {
          console.error(e);
      } finally {
          resetToMenu();
      }
  };

  const handleCreate = async () => {
    if (!currentUser) return;
    if (config.subjects.length === 0) {
        showToast("অনুগ্রহ করে একটি বিষয় সিলেক্ট করুন", "warning");
        return;
    }
    
    setLoading(true);
    try {
      const qResult = await generateQuizFromDB({
          subject: config.subjects[0],
          chapter: config.chapters[0] || 'Full Syllabus',
          topics: [], count: config.questionCount
      });
      
      if (qResult.length === 0) {
          showToast("এই বিষয়ে পর্যাপ্ত প্রশ্ন নেই। অন্য বিষয় চেষ্টা করুন।", "warning");
          setLoading(false);
          return;
      }

      const newRoomId = await createRTDBRoom(
          { uid: currentUser.uid, name: currentUser.displayName || 'Host', avatar: userAvatar },
          config, qResult
      );
      setRoomId(newRoomId);
      if (opponentInfo) {
          sendNotificationAPI({
              title: "⚔️ Battle Challenge!",
              message: `${currentUser.displayName} is challenging you!`,
              type: "BATTLE_CHALLENGE",
              target: opponentInfo.uid,
              actionLink: "/battle",
              metadata: { roomId: newRoomId }
          });
      }
    } catch (e: any) { showToast(e.message, "error"); }
    finally { setLoading(false); }
  };

  const handleJoin = async () => {
    if (!inputRoomId) return;
    setLoading(true);
    try {
      await joinRTDBRoom(inputRoomId, { uid: currentUser!.uid, name: currentUser!.displayName || 'Guest', avatar: userAvatar });
      setRoomId(inputRoomId);
    } catch (e: any) { showToast("Room not found", "error"); }
    finally { setLoading(false); }
  };

  // --- SUB-RENDERERS ---

  const renderLobbyPlayers = () => {
    if (!battleState) return null;
    const players = Object.values(battleState.players) as BattlePlayer[];
    
    const host = players.find(p => p.uid === battleState.hostId);
    const guest = players.find(p => p.uid !== battleState.hostId);

    return (
        <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-2xl mx-auto gap-8 mt-8">
            {/* Host Card */}
            <div className="flex flex-col items-center animate-in slide-in-from-left-8 duration-500">
                <div className="relative">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-orange-500 p-1 shadow-lg shadow-orange-500/20">
                        <img src={host?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Host"} className="w-full h-full rounded-full object-cover bg-gray-100" alt="Host"/>
                    </div>
                    <Crown size={24} className="absolute -top-3 -right-2 text-yellow-500 fill-yellow-500 drop-shadow-md rotate-12"/>
                </div>
                <p className="mt-3 font-black text-lg text-gray-800 dark:text-white">{host?.name}</p>
                <span className="px-3 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full mt-1">HOST</span>
            </div>

            {/* VS Badge */}
            <div className="relative z-10">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-900 shadow-xl animate-pulse">
                    <span className="text-2xl font-black text-white italic">VS</span>
                </div>
            </div>

            {/* Guest Card */}
            <div className="flex flex-col items-center animate-in slide-in-from-right-8 duration-500">
                {guest ? (
                    <>
                        <div className="relative">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-blue-500 p-1 shadow-lg shadow-blue-500/20">
                                <img src={guest.avatar} className="w-full h-full rounded-full object-cover bg-gray-100" alt="Guest"/>
                            </div>
                        </div>
                        <p className="mt-3 font-black text-lg text-gray-800 dark:text-white">{guest.name}</p>
                        <span className="px-3 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mt-1">CHALLENGER</span>
                    </>
                ) : (
                    <div className="flex flex-col items-center opacity-50 animate-pulse">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                            <UserPlus size={32} className="text-gray-400"/>
                        </div>
                        <p className="mt-3 font-bold text-sm text-gray-500">Waiting...</p>
                    </div>
                )}
            </div>
        </div>
    );
  };

  const renderTimer = () => {
      const circumference = 2 * Math.PI * 18;
      const progress = (timeLeft / battleState!.config.timePerQuestion) * circumference;
      const colorClass = timeLeft > 10 ? 'text-emerald-500' : timeLeft > 5 ? 'text-yellow-500' : 'text-red-500';
      
      return (
          <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                  <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-gray-200 dark:text-gray-700" />
                  <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="3" fill="transparent" 
                    strokeDasharray={circumference} strokeDashoffset={circumference - progress}
                    className={`${colorClass} transition-all duration-1000 ease-linear`} strokeLinecap="round" />
              </svg>
              <span className={`absolute text-xs font-black font-mono ${colorClass} ${timeLeft <= 5 ? 'animate-pulse' : ''}`}>{timeLeft}</span>
          </div>
      );
  };

  const renderCreate = () => {
    // Find chapters based on selected subject
    const selectedSubjectKey = Object.keys(SYLLABUS_DB).find(key => key.includes(config.subjects[0]));
    const chapters = selectedSubjectKey ? Object.keys(SYLLABUS_DB[selectedSubjectKey]) : [];

    return (
        <div className="max-w-4xl w-full p-6 md:p-8 bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl border border-gray-200 dark:border-gray-700 animate-in zoom-in h-full md:h-auto overflow-y-auto pb-32">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-gray-700 pb-4">
                <h2 className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white flex items-center gap-3">
                    <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-2xl">
                        <Settings size={28} />
                    </div>
                    ব্যাটল কনফিগারেশন
                </h2>
                <button onClick={() => setPhase('MENU')} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors text-sm">
                    বাতিল
                </button>
            </div>

            <div className="space-y-8">
                
                {/* 1. Subject Selection Grid */}
                <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 block flex items-center gap-2">
                        <Layers size={14}/> বিষয় নির্বাচন করুন
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {BATTLE_SUBJECTS.map(subj => {
                            const isSelected = config.subjects.includes(subj.id);
                            return (
                                <button
                                    key={subj.id}
                                    onClick={() => setConfig({ ...config, subjects: [subj.id], chapters: ['Full Syllabus'] })}
                                    className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 group ${isSelected ? `${subj.bg} ${subj.border} ring-2 ring-offset-2 dark:ring-offset-gray-900 ring-primary` : 'bg-gray-50 dark:bg-gray-900 border-transparent hover:border-gray-200 dark:hover:border-gray-700'}`}
                                >
                                    <div className={`p-3 rounded-full bg-white dark:bg-gray-800 shadow-sm transition-transform group-hover:scale-110 ${isSelected ? 'scale-110' : ''}`}>
                                        <subj.icon className={subj.color} size={24} />
                                    </div>
                                    <span className={`text-sm font-bold ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{subj.label}</span>
                                    {isSelected && <div className="absolute top-2 right-2 text-primary"><CheckCircle size={16} fill="currentColor" className="text-white"/></div>}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* 2. Chapter Selection (Scrollable Chips) */}
                {config.subjects.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-top-4">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block flex items-center gap-2">
                            <BookOpen size={14}/> অধ্যায় (Chapter)
                        </label>
                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1 custom-scrollbar">
                            <button
                                onClick={() => setConfig({ ...config, chapters: ['Full Syllabus'] })}
                                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${config.chapters.includes('Full Syllabus') ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-black dark:border-white' : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-gray-400'}`}
                            >
                                সম্পূর্ণ সিলেবাস
                            </button>
                            {chapters.map((chap, idx) => {
                                const isChapSelected = config.chapters.includes(chap);
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            // Single Select Logic for simplicity in Battle
                                            setConfig({ ...config, chapters: [chap] });
                                        }}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${isChapSelected ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-gray-400'}`}
                                    >
                                        {chap}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* 3. Game Settings (Grid) */}
                <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 block flex items-center gap-2">
                        <Settings size={14}/> গেম সেটিংস
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
                        {/* Question Count */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2"><Hash size={16}/> প্রশ্ন সংখ্যা</span>
                                <span className="text-sm font-black text-primary">{config.questionCount}</span>
                            </div>
                            <input 
                                type="range" 
                                min="5" max="20" step="5"
                                value={config.questionCount}
                                onChange={(e) => setConfig({...config, questionCount: parseInt(e.target.value)})}
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-bold">
                                <span>5</span><span>10</span><span>15</span><span>20</span>
                            </div>
                        </div>

                        {/* Time Per Question */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2"><Clock size={16}/> সময় (সেকেন্ড)</span>
                                <span className="text-sm font-black text-orange-500">{config.timePerQuestion}s</span>
                            </div>
                            <input 
                                type="range" 
                                min="10" max="60" step="5"
                                value={config.timePerQuestion}
                                onChange={(e) => setConfig({...config, timePerQuestion: parseInt(e.target.value)})}
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                            <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-bold">
                                <span>10s</span><span>30s</span><span>60s</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4">
                    <button 
                        onClick={handleCreate} 
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-black text-lg shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                        <Zap fill="currentColor"/> ব্যাটল রুম তৈরি করুন
                    </button>
                </div>
            </div>
        </div>
    );
  };

  const renderJoin = () => (
    <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 animate-in zoom-in">
        <h2 className="text-2xl font-black mb-6 text-gray-800 dark:text-white">রুম জয়েন করুন</h2>
        <div className="space-y-6">
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">রুম কোড দিন</label>
                <input 
                    type="text" 
                    value={inputRoomId}
                    onChange={e => setInputRoomId(e.target.value)}
                    placeholder="e.g. 123456"
                    className="w-full p-5 text-3xl font-mono text-center tracking-[0.5em] rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700 focus:border-orange-500 outline-none dark:text-white"
                />
            </div>
            <div className="flex gap-3">
                <button onClick={() => setPhase('MENU')} className="px-6 py-4 rounded-xl bg-gray-100 dark:bg-gray-700 font-bold dark:text-white">পিছনে</button>
                <button onClick={handleJoin} className="flex-1 py-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black shadow-lg">জয়েন ব্যাটল</button>
            </div>
        </div>
    </div>
  );

  if (phase === 'CREATE') return (
    <div className="flex flex-col items-center justify-center h-full p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
        {loading ? <Loader2 className="animate-spin text-primary" size={48} /> : renderCreate()}
    </div>
  );

  if (phase === 'JOIN') return (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-gray-50 dark:bg-gray-900">
        {loading ? <Loader2 className="animate-spin text-primary" size={48} /> : renderJoin()}
    </div>
  );

  if (phase === 'MENU') return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8 pb-24">
            
            {/* Header / Profile Card */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-24 h-24 p-1 bg-white/20 rounded-full backdrop-blur-md">
                        <img src={userAvatar} className="w-full h-full rounded-full object-cover bg-white" alt="Avatar"/>
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                            <h1 className="text-2xl font-black">{currentUser?.displayName}</h1>
                            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Warrior</span>
                        </div>
                        <p className="text-orange-100 text-sm opacity-90">Ready to conquer the arena?</p>
                        <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                            <div className="flex items-center gap-1.5 text-xs font-bold bg-black/20 px-3 py-1.5 rounded-lg">
                                <Trophy size={14} className="text-yellow-300"/> Rank #42
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-bold bg-black/20 px-3 py-1.5 rounded-lg">
                                <Zap size={14} className="text-blue-300"/> {myStats.totalPoints} XP
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center gap-1">
                    <Swords size={24} className="text-orange-500 mb-1"/>
                    <span className="text-2xl font-black text-gray-800 dark:text-white">{myStats.totalMatches}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ম্যাচ খেলেছেন</span>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center gap-1">
                    <Crown size={24} className="text-yellow-500 mb-1"/>
                    <span className="text-2xl font-black text-gray-800 dark:text-white">{myStats.wins}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">জয়লাভ</span>
                </div>
                <div className="col-span-2 md:col-span-1 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center gap-1">
                    <Percent size={24} className="text-green-500 mb-1"/>
                    <span className="text-2xl font-black text-gray-800 dark:text-white">{myStats.winRate}%</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">জয়ের হার</span>
                </div>
            </div>

            {/* Actions */}
            <div className="grid md:grid-cols-2 gap-4">
                <button 
                    onClick={() => setPhase('CREATE')}
                    className="group bg-white dark:bg-gray-800 p-6 rounded-[2rem] border-2 border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all text-left relative overflow-hidden shadow-lg shadow-orange-500/10"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Zap size={80} />
                    </div>
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-4">
                        <UserPlus size={24}/>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">রুম তৈরি করুন</h3>
                    <p className="text-sm text-gray-500 mt-1">বন্ধুদের ইনভাইট করুন এবং কাস্টম কুইজ খেলুন।</p>
                </button>

                <button 
                    onClick={() => setPhase('JOIN')}
                    className="group bg-gray-900 dark:bg-white p-6 rounded-[2rem] text-white dark:text-gray-900 hover:shadow-2xl transition-all text-left relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Swords size={80} />
                    </div>
                    <div className="w-12 h-12 bg-white/20 dark:bg-gray-200 rounded-2xl flex items-center justify-center mb-4">
                        <Swords size={24}/>
                    </div>
                    <h3 className="text-xl font-black">জয়েন করুন</h3>
                    <p className="text-sm opacity-70 mt-1">কোড ব্যবহার করে বিদ্যমান রুমে প্রবেশ করুন।</p>
                </button>
            </div>

            {/* Recent History Mock */}
            <div>
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                    <History size={16}/> রিসেন্ট অ্যাক্টিভিটি
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                <Trophy size={18}/>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800 dark:text-white">Victory vs Tahmid</p>
                                <p className="text-[10px] text-gray-500">Physics • 5 Questions</p>
                            </div>
                        </div>
                        <span className="text-green-600 font-bold text-sm">+50 XP</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                <XCircle size={18}/>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800 dark:text-white">Defeat vs Sarah</p>
                                <p className="text-[10px] text-gray-500">Biology • 10 Questions</p>
                            </div>
                        </div>
                        <span className="text-red-500 font-bold text-sm">-10 XP</span>
                    </div>
                </div>
            </div>

        </div>
    </div>
  );

  if (phase === 'LOBBY') return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-gray-50 dark:bg-gray-900 animate-in fade-in pb-10">
        {/* Header */}
        <div className="p-6 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">ROOM CODE</p>
            <button 
                onClick={() => { navigator.clipboard.writeText(roomId); showToast("Code Copied!", "success"); }}
                className="inline-flex items-center gap-2 text-4xl font-mono font-black text-orange-600 dark:text-orange-500 tracking-wider hover:scale-105 transition-transform"
            >
                {roomId} <Copy size={24} className="opacity-50"/>
            </button>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6">
            {renderLobbyPlayers()}
        </div>

        <div className="p-6 pb-20 text-center space-y-4">
            {battleState?.hostId === currentUser?.uid ? (
                <button 
                    onClick={() => startRTDBBattle(roomId)} 
                    disabled={Object.keys(battleState.players).length < 2} 
                    className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl font-black text-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
                >
                    {Object.keys(battleState.players).length < 2 ? 'Waiting for Opponent...' : <><Swords size={24}/> START BATTLE</>}
                </button>
            ) : (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-3 animate-pulse">
                    <Loader2 className="animate-spin text-orange-500" size={20} />
                    <p className="font-bold text-gray-500">Waiting for host to start...</p>
                </div>
            )}
            <button onClick={handleLeave} className="text-gray-400 text-sm font-bold hover:text-gray-600 dark:hover:text-white">Leave Room</button>
        </div>
    </div>
  );

  if (phase === 'GAME') {
    const question = battleState?.questions[currentQIndex];
    if (!question) return null;

    const players = (Object.values(battleState?.players || {}) as BattlePlayer[]).sort((a,b) => b.score - a.score);
    const opponent = players.find(p => p.uid !== currentUser?.uid);
    const bothAnswered = hasAnswered && opponent?.answers?.[currentQIndex] !== undefined;

    return (
        <div className="fixed inset-0 z-[200] flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden relative">
            {/* Reactions Overlay */}
            <div className="fixed inset-0 pointer-events-none z-[60]">
                {activeReactions.map(r => (
                    <div key={r.id} className="absolute bottom-24 left-1/2 -translate-x-1/2 animate-[reactionFly_2s_ease-out_forwards] text-6xl">
                        {r.emoji}
                    </div>
                ))}
            </div>

            {/* Top Bar: Progress & Timer */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm font-black text-gray-500 border border-gray-100 dark:border-gray-700">
                        {currentQIndex + 1}/{battleState?.questions.length}
                    </div>
                    {streak >= 3 && (
                        <div className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                            <Flame size={12} fill="currentColor"/> {streak}
                        </div>
                    )}
                </div>
                <div className="flex flex-col items-end">
                    <span className={`text-2xl font-mono font-black ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-gray-800 dark:text-white'}`}>{timeLeft}s</span>
                </div>
            </div>

            {/* Question Area */}
            <div className="flex-1 overflow-y-auto px-4 pb-32">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                    <h2 className={`text-lg md:text-xl font-bold text-gray-800 dark:text-white leading-relaxed text-center ${getFont(question.question)}`}>
                        {question.question}
                    </h2>
                </div>

                <div className="grid gap-3">
                    {question.options.map((opt, idx) => {
                        const isSelected = selectedOption === idx;
                        const isCorrect = idx === Number(question.correctAnswerIndex);
                        const isDisabled = disabledOptions.includes(idx);
                        
                        let btnClass = "bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 shadow-sm";
                        
                        if (hasAnswered) {
                            if (isSelected) {
                                btnClass = isCorrect 
                                    ? "bg-green-500 border-green-500 text-white shadow-green-500/30" 
                                    : "bg-red-500 border-red-500 text-white animate-shake";
                            } else if (isCorrect) {
                                btnClass = "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400";
                            } else {
                                btnClass = "opacity-40";
                            }
                        } else if (isDisabled) {
                            btnClass = "opacity-20 grayscale pointer-events-none";
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                disabled={hasAnswered || isDisabled}
                                className={`w-full p-4 rounded-xl font-bold text-base transition-all active:scale-95 flex items-center justify-between ${btnClass}`}
                            >
                                <span className={getFont(opt)}>{opt}</span>
                                {hasAnswered && isSelected && (isCorrect ? <CheckCircle size={20}/> : <XCircle size={20}/>)}
                            </button>
                        )
                    })}
                </div>

                {/* Status Indicator */}
                {hasAnswered && opponent && !opponent.answers?.[currentQIndex] && (
                    <div className="text-center mt-6 animate-pulse">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Waiting for opponent...</p>
                    </div>
                )}

                {/* Host Control: Next Question */}
                {bothAnswered && battleState.hostId === currentUser?.uid && (
                    <div className="fixed bottom-24 left-0 right-0 flex justify-center z-50 animate-in slide-in-from-bottom-4">
                        <button 
                            onClick={skipToNextQuestion}
                            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3 rounded-full font-black shadow-xl flex items-center gap-2 hover:scale-105 transition-transform"
                        >
                            Next <MoveRight size={18}/>
                        </button>
                    </div>
                )}
            </div>

            {/* Bottom Bar: Controls & Opponent Status */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 p-4 pb-6 z-50">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    {/* Reactions */}
                    <div className="flex gap-2">
                        {REACTION_EMOJIS.slice(0,3).map(r => (
                            <button key={r.label} onClick={() => sendReaction(r.icon)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl hover:scale-110 transition-transform shadow-sm">
                                {r.icon}
                            </button>
                        ))}
                    </div>

                    {/* Opponent Mini Score */}
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Opponent</p>
                            <p className="text-sm font-black text-gray-800 dark:text-white">{opponent?.score || 0}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-full border-2 p-0.5 ${opponent?.answers?.[currentQIndex] !== undefined ? 'border-green-500' : 'border-gray-200 dark:border-gray-600'}`}>
                            <img src={opponent?.avatar} className="w-full h-full rounded-full object-cover" alt="Opponent"/>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Floating Points Animation */}
            {floatingPoints && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-black text-green-500 drop-shadow-sm animate-[pointsPop_0.8s_ease-out_forwards] z-[100]">
                    +{floatingPoints.pts}
                </div>
            )}

            <style>{`
                @keyframes reactionFly {
                    0% { transform: translate(-50%, 0) scale(0.5); opacity: 0; }
                    20% { opacity: 1; transform: translate(-50%, -50px) scale(1.2); }
                    100% { transform: translate(-50%, -300px) scale(1); opacity: 0; }
                }
                @keyframes pointsPop {
                    0% { transform: translate(-50%, 0) scale(0.5); opacity: 0; }
                    50% { opacity: 1; transform: translate(-50%, -50px) scale(1.2); }
                    100% { transform: translate(-50%, -100px) scale(1); opacity: 0; }
                }
            `}</style>
        </div>
    );
  }

  if (phase === 'RESULT') {
    const sorted = (Object.values(battleState?.players || {}) as BattlePlayer[]).sort((a,b) => b.score - a.score);
    const winner = sorted[0];
    const isWinner = winner.uid === currentUser?.uid;

    return (
        <div className="fixed inset-0 z-[200] flex flex-col bg-[#0F172A] text-white p-6 items-center justify-center overflow-y-auto relative pb-20">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
            
            {isWinner && <Confetti />}
            
            {!showComparison ? (
                <div className="relative z-10 w-full max-w-sm text-center animate-in zoom-in duration-300">
                    {/* Winner Avatar */}
                    <div className="relative inline-block mb-8">
                        <div className="absolute inset-0 bg-yellow-500 blur-[60px] opacity-40 animate-pulse"></div>
                        <Crown size={48} className="absolute -top-10 left-1/2 -translate-x-1/2 text-yellow-400 fill-yellow-400 animate-bounce" />
                        <div className="w-32 h-32 rounded-full p-1.5 bg-gradient-to-tr from-yellow-300 via-yellow-500 to-orange-500 shadow-2xl relative z-10">
                            <img src={winner.avatar} className="w-full h-full rounded-full object-cover border-4 border-[#0F172A]" alt={winner.name} />
                        </div>
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-[#0F172A] px-4 py-1 rounded-full font-black text-xs uppercase tracking-widest shadow-lg border-2 border-[#0F172A]">
                            Winner
                        </div>
                    </div>

                    <h1 className="text-3xl font-black mb-2">{isWinner ? 'Victory!' : 'Game Over'}</h1>
                    <p className="text-gray-400 text-sm mb-10">{isWinner ? 'You conquered the arena!' : 'Better luck next time!'}</p>

                    {/* Stats Card */}
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 mb-8">
                        {sorted.map((p, idx) => (
                            <div key={p.uid} className={`flex items-center justify-between p-3 rounded-xl mb-2 last:mb-0 ${p.uid === currentUser?.uid ? 'bg-white/10 border border-white/20' : 'border border-transparent'}`}>
                                <div className="flex items-center gap-3">
                                    <span className="font-mono font-bold text-gray-500">#{idx+1}</span>
                                    <img src={p.avatar} className="w-8 h-8 rounded-full bg-black/20 object-cover" alt=""/>
                                    <span className="font-bold text-sm">{p.name}</span>
                                </div>
                                <span className="font-black font-mono text-yellow-400">{p.score}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-3">
                        <button onClick={() => setShowComparison(true)} className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold text-sm transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                            <Eye size={18} /> প্রশ্ন ও উত্তর দেখুন (Analysis)
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={resetToMenu} className="py-4 bg-gray-800 hover:bg-gray-700 rounded-2xl font-bold text-sm transition-colors border border-gray-700">Main Menu</button>
                            <button onClick={() => setPhase('LOBBY')} className="py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-sm transition-colors border border-white/10">Rematch</button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="fixed inset-0 z-[210] bg-[#0F172A] flex flex-col animate-in slide-in-from-bottom-10">
                    {/* Analysis Header */}
                    <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-[#0F172A] z-10">
                        <div>
                            <h2 className="text-lg font-black text-white">ম্যাচ এনালাইসিস</h2>
                            <p className="text-xs text-gray-400">কে কি উত্তর দিয়েছে দেখুন</p>
                        </div>
                        <button onClick={() => setShowComparison(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Questions List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {battleState?.questions.map((q, idx) => (
                            <div key={idx} className="bg-white/5 p-5 rounded-3xl border border-white/10">
                                <div className="flex gap-3 mb-4">
                                    <span className="font-black text-white/20 text-xl font-mono">{String(idx+1).padStart(2,'0')}</span>
                                    <h3 className={`font-bold text-white text-base leading-relaxed ${getFont(q.question)}`}>
                                        {q.question}
                                    </h3>
                                </div>

                                <div className="space-y-2">
                                    {q.options.map((opt, oIdx) => {
                                        const isCorrect = oIdx === Number(q.correctAnswerIndex);
                                        // Find players who selected this option
                                        const selectors = sorted.filter(p => p.answers && p.answers[idx] === oIdx);
                                        const isSelectedBySomeone = selectors.length > 0;
                                        
                                        let borderClass = "border-white/10";
                                        let bgClass = "bg-white/5";
                                        
                                        if (isCorrect) {
                                            borderClass = "border-green-500/50";
                                            bgClass = "bg-green-500/10";
                                        } else if (isSelectedBySomeone) {
                                            borderClass = "border-red-500/50";
                                            bgClass = "bg-red-500/10";
                                        }

                                        return (
                                            <div key={oIdx} className={`relative p-3.5 rounded-xl border ${borderClass} ${bgClass} flex justify-between items-center gap-4`}>
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${isCorrect ? 'border-green-500 text-green-400' : 'border-white/20 text-white/40'}`}>
                                                        {['A','B','C','D'][oIdx]}
                                                    </div>
                                                    <span className={`text-sm ${isCorrect ? 'text-green-400 font-bold' : 'text-gray-300'} ${getFont(opt)}`}>{opt}</span>
                                                </div>
                                                
                                                {/* Avatars of players who picked this */}
                                                <div className="flex -space-x-2 shrink-0">
                                                    {selectors.map(p => (
                                                        <img 
                                                            key={p.uid} 
                                                            src={p.avatar} 
                                                            title={`${p.name} selected this`}
                                                            className={`w-8 h-8 rounded-full border-2 ${isCorrect ? 'border-green-500' : 'border-red-500'} object-cover bg-gray-800`} 
                                                            alt={p.name}
                                                        />
                                                    ))}
                                                    {/* Show checkmark if correct answer even if no one picked it */}
                                                    {isCorrect && selectors.length === 0 && (
                                                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500">
                                                            <Check size={14} className="text-green-500" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                        
                        {/* Footer in Modal */}
                        <div className="text-center pt-8 pb-4 text-white/20 text-xs font-mono uppercase tracking-widest">
                            End of Analysis
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        {loading ? <Loader2 className="animate-spin text-primary" size={48} /> : renderCreate()}
    </div>
  );
};

export default QuizBattlePrototype;
