
import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import SafeHtml from './SafeHtml';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Swords, Zap, UserPlus, Loader2, Copy, Clock, XCircle, 
  Crown, Eye, CheckCircle, X, Check, Share2, Smile,
  Flame, MoveRight, ArrowLeft,
  Atom, Beaker, Calculator, Dna, Brain, Layers, Globe, BookOpen, Book, Hash
} from 'lucide-react';
import { toBengaliNumber } from '../utils/numberUtils';
import { useAuth } from '../contexts/AuthContext';
import { SYLLABUS_DB } from '../services/syllabusData';
import { useToast } from './Toast';
import Confetti from './Confetti';
import { PlayerAvatar, OnlinePlayersInvitePanel } from './BattleInvitePanel';
import { usePreferences } from '../contexts/PreferencesContext';
import { 
  createRTDBRoom, 
  joinRTDBRoom, 
  leaveRTDBRoom,
  startRTDBBattle, 
  submitAnswerRTDB, 
  listenToBattleRoom, 
  finishRTDBBattle,
  rematchRTDBRoom,
  deleteRTDBRoom,
  listenToServerOffset,
  BattleRoom,
  BattlePlayer,
  sendReactionRTDB,
} from '../services/battleService';
import { generateQuizFromDB, sendNotificationAPI, fetchUserStatsAPI } from '../services/api'; 
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

const getActualSubjectKeys = (broadSubject: string): string[] => {
  if (broadSubject === 'Physics') return ['Physics 1st Paper', 'Physics 2nd Paper'];
  if (broadSubject === 'Chemistry') return ['Chemistry 1st Paper', 'Chemistry 2nd Paper'];
  if (broadSubject === 'Math') return ['Higher Math 1st Paper', 'Higher Math 2nd Paper'];
  if (broadSubject === 'Biology') return ['Biology 1st Paper', 'Biology 2nd Paper'];
  if (broadSubject === 'Bangla') return ['Bangla 1st Paper', 'Bangla 2nd Paper'];
  if (broadSubject === 'ICT') return ['ICT'];
  if (broadSubject === 'English') return ['English'];
  if (broadSubject === 'General Knowledge') return ['General Knowledge'];
  return [broadSubject];
};

const BATTLE_SUBJECTS = [
    { id: 'Physics', label: 'পদার্থবিজ্ঞান', icon: Atom, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800' },
    { id: 'Chemistry', label: 'রসায়ন', icon: Beaker, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20', border: 'border-teal-200 dark:border-teal-800' },
    { id: 'Math', label: 'উচ্চতর গণিত', icon: Calculator, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' },
    { id: 'Biology', label: 'জীববিজ্ঞান', icon: Dna, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800' },
    { id: 'ICT', label: 'আইসিটি', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800' },
    { id: 'English', label: 'ইংরেজি', icon: BookOpen, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20', border: 'border-pink-200 dark:border-pink-800' },
    { id: 'Bangla', label: 'বাংলা', icon: Book, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-800' },
    { id: 'General Knowledge', label: 'সাধারণ জ্ঞান', icon: Globe, color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800' },
];

// Consistent player avatar with graceful initial fallback (no external placeholder images)
const QuizBattlePrototype: React.FC = () => {
  const { currentUser, userAvatar } = useAuth();
  const { showToast } = useToast();
  const { questionFont } = usePreferences();
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
  const [serverTimeOffset, setServerTimeOffset] = useState(0);
  const [floatingPoints, setFloatingPoints] = useState<{id: number, pts: number} | null>(null);
  const [streak, setStreak] = useState(0);
  const [activeReactions, setActiveReactions] = useState<{id: number, emoji: string, sender: string}[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  const [disabledOptions, setDisabledOptions] = useState<number[]>([]);
  const [showVersus, setShowVersus] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [powerUpsUsed, setPowerUpsUsed] = useState<string[]>([]);

  const usePowerUp = (type: string) => {
    if (type === '50-50') {
      const currentQ = battleState?.questions[currentQIndex];
      if (!currentQ) return;
      const correctIdx = currentQ.correctAnswerIndex;
      const wrongIndices = [0, 1, 2, 3].filter(i => i !== correctIdx);
      const toDisable = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);
      setDisabledOptions(toDisable);
      setPowerUpsUsed(prev => [...prev, '50-50']);
    }
  };

  // Haptic Feedback Helper
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error') => {
    if (!navigator.vibrate) return;
    switch (type) {
      case 'light': navigator.vibrate(10); break;
      case 'medium': navigator.vibrate(20); break;
      case 'heavy': navigator.vibrate(50); break;
      case 'success': navigator.vibrate([10, 30, 10]); break;
      case 'error': navigator.vibrate([50, 50, 50]); break;
    }
  };

  // Helper function to generate questions for battle
  const generateBattleQuestions = async (subjects: string[], chapters: string[], questionCount: number) => {
    const broadSubject = subjects[0];
    if (!broadSubject) return [];
    const selectedChapter = chapters[0] || 'Full Syllabus';
    
    const actualKeys = getActualSubjectKeys(broadSubject);
    let qResult: any[] = [];
    
    if (selectedChapter === 'Full Syllabus') {
        const promises = actualKeys.map(subjKey => 
            generateQuizFromDB({
                subject: subjKey,
                chapter: 'Full Syllabus',
                topics: [],
                count: questionCount
            })
        );
        const results = await Promise.all(promises);
        const combined = results.flat();
        qResult = combined.sort(() => 0.5 - Math.random()).slice(0, questionCount);
    } else {
        const foundKey = actualKeys.find(key => SYLLABUS_DB[key] && SYLLABUS_DB[key][selectedChapter]);
        const querySubject = foundKey || broadSubject;
        qResult = await generateQuizFromDB({
            subject: querySubject,
            chapter: selectedChapter,
            topics: [],
            count: questionCount
        });
    }
    return qResult;
  };

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
    const isBangla = /[\u0980-\u09FF]/.test(text);
    return isBangla ? questionFont : 'font-sans';
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
              } catch (_e) {
                  logger.error("Failed to load stats", _e);
              }
          };
          loadStats();
      }
  }, [currentUser, phase]);

  // Auto-join accepted invitations from localStorage or route state
  useEffect(() => {
    if (location.state?.directRoomId) {
      setRoomId(location.state.directRoomId);
      setPhase('LOBBY');
      window.history.replaceState({}, document.title);
    } else {
      const pendingRoomId = localStorage.getItem('pending_battle_room_id');
      if (pendingRoomId) {
        localStorage.removeItem('pending_battle_room_id');
        setRoomId(pendingRoomId);
        setPhase('LOBBY');
      }
    }
  }, [location.state]);


  // MathJax Effect - Optimized to be less aggressive
  useEffect(() => {
    if (!(phase === 'GAME' || phase === 'RESULT' || showComparison)) return;

    let isMounted = true;
    const triggerTypeset = async () => {
      if (window.MathJax && window.MathJax.typesetPromise) {
        try {
          await window.MathJax.typesetPromise();
        } catch (err) {
          logger.debug('MathJax typeset failed:', err);
        }
      }
    };

    // Initial trigger
    triggerTypeset();

    // Small delay trigger to catch late renders
    const timer = setTimeout(() => {
      if (isMounted) triggerTypeset();
    }, 1000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [currentQIndex, phase, showComparison]);

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
            if (data.status === 'ACTIVE' && phase !== 'GAME') {
                setShowVersus(true);
                setTimeout(() => {
                    setShowVersus(false);
                    setPhase('GAME');
                }, 2500);
            }
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
              // setStartCountdown(Math.ceil((startTime - now) / 1000));
          } else {
              // setStartCountdown(null);
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
          animationFrame = requestAnimationFrame(updateLoop);
      }
    };
    if (battleState?.status === 'ACTIVE' && phase === 'GAME') {
      animationFrame = requestAnimationFrame(updateLoop);
    }
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [battleState, currentQIndex, phase, serverTimeOffset, roomId, currentUser?.uid]);

  // Handle Result Phase Entry
  useEffect(() => {
    if (phase === 'RESULT') {
      // Delay confetti to allow smooth transition
      const timer = setTimeout(() => setShowConfetti(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowConfetti(false);
    }
  }, [phase]);

  // Sync local answer state from RTDB (for reconnections)
  useEffect(() => {
    if (battleState?.status === 'ACTIVE' && currentUser && phase === 'GAME') {
        const myPlayer = battleState.players[currentUser.uid];
        if (myPlayer?.answers && myPlayer.answers[currentQIndex] !== undefined) {
            setHasAnswered(true);
            setSelectedOption(myPlayer.answers[currentQIndex]);
        }
    }
  }, [battleState, currentQIndex, currentUser, phase]);

  // --- ACTIONS ---
  const handleAnswer = (idx: number) => {
      if (hasAnswered || !battleState || !currentUser) return;
      
      const q = battleState.questions[currentQIndex];
      const isCorrect = idx === Number(q.correctAnswerIndex);
      
      if (isCorrect) triggerHaptic('success');
      else triggerHaptic('error');

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

  const sendReaction = (emoji: string) => {
      if (!roomId || !currentUser) return;
      sendReactionRTDB(roomId, emoji, currentUser.displayName || 'Learner');
  };

  const handleRematch = async () => {
    if (!roomId || !battleState || !currentUser) return;
    if (battleState.hostId !== currentUser.uid) {
        showToast("Only host can start rematch", "warning");
        return;
    }
    
    setLoading(true);
    try {
        const qResult = await generateBattleQuestions(
            battleState.config.subjects,
            battleState.config.chapters,
            battleState.config.questionCount
        );
        
        if (qResult.length === 0) {
            showToast("Failed to generate new questions", "error");
            setLoading(false);
            return;
        }

        await rematchRTDBRoom(roomId, qResult);
        setPhase('LOBBY');
    } catch (_e: any) {
        showToast(_e.message, "error");
    } finally {
        setLoading(false);
    }
  };

  const resetToMenu = () => {
      setPhase('MENU');
      setRoomId('');
      setBattleState(null);
      setStreak(0);
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
      } catch (_e) {
          logger.error(_e);
      } finally {
          resetToMenu();
      }
  };

  const handleCreate = async () => {
    if (!currentUser) return;
    if (config.subjects.length === 0) {
        showToast("অনুগ্রহ করে একটি বিষয় সিলেক্ট করুন", "warning");
        return;
    }
    
    setLoading(true);
    try {
      const qResult = await generateBattleQuestions(
          config.subjects,
          config.chapters,
          config.questionCount
      );
      
      if (qResult.length === 0) {
          showToast("এই বিষয়ে পর্যাপ্ত প্রশ্ন নেই। অন্য বিষয় চেষ্টা করুন।", "warning");
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
    } catch (_e: any) { showToast(_e.message, "error"); }
    finally { setLoading(false); }
  };

  const handleJoin = async () => {
    if (!inputRoomId) return;
    setLoading(true);
    try {
      await joinRTDBRoom(inputRoomId, { uid: currentUser!.uid, name: currentUser!.displayName || 'Guest', avatar: userAvatar });
      setRoomId(inputRoomId);
    } catch (_e: any) { showToast("Room not found", "error"); }
    finally { setLoading(false); }
  };

  // --- SUB-RENDERERS ---

  const VersusOverlay = () => {
    if (!battleState) return null;
    const players = Object.values(battleState.players) as BattlePlayer[];
    const host = players.find(p => p.uid === battleState.hostId);
    const guest = players.find(p => p.uid !== battleState.hostId);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-[#0F172A] flex flex-col items-center justify-center overflow-hidden"
        >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-24 w-80 h-80 bg-primary/20 rounded-full blur-[110px]"></div>
                <div className="absolute bottom-1/4 -right-24 w-80 h-80 bg-red-500/15 rounded-full blur-[110px]"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center w-full max-w-lg px-6">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 14 }}
                    className="mb-12 text-center"
                >
                    <h2 className="text-primary font-black text-xs uppercase tracking-[0.3em] mb-2">Battle Starting</h2>
                    <p className="text-white text-2xl font-black">ব্যাটল শুরু হচ্ছে</p>
                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-4"></div>
                </motion.div>

                <div className="flex items-center justify-between w-full gap-4">
                    <motion.div 
                        initial={{ x: -60, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.15, type: 'spring' }}
                        className="flex flex-col items-center flex-1 min-w-0"
                    >
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-white/20 p-1 shadow-2xl bg-white/5">
                            <PlayerAvatar src={host?.avatar || userAvatar} name={host?.name} className="w-full h-full rounded-full" />
                        </div>
                        <p className="mt-4 font-black text-white text-base truncate max-w-full">{host?.name || 'হোস্ট'}</p>
                    </motion.div>

                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.35, type: 'spring', damping: 12 }}
                        className="relative shrink-0"
                    >
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-red-600 rounded-2xl rotate-6 flex items-center justify-center border-2 border-white/80 shadow-2xl shadow-primary/40 relative z-10">
                            <span className="text-xl font-black text-white italic -rotate-6">VS</span>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ x: 60, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.15, type: 'spring' }}
                        className="flex flex-col items-center flex-1 min-w-0"
                    >
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-white/20 p-1 shadow-2xl bg-white/5">
                            <PlayerAvatar src={guest?.avatar || userAvatar} name={guest?.name} className="w-full h-full rounded-full" />
                        </div>
                        <p className="mt-4 font-black text-white text-base truncate max-w-full">{guest?.name || 'অপেক্ষায়'}</p>
                    </motion.div>
                </div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-14 flex gap-2"
                >
                    {[1, 2, 3].map(i => (
                        <motion.div 
                            key={i}
                            animate={{ opacity: [0.25, 1, 0.25] }}
                            transition={{ repeat: Infinity, duration: 1.1, delay: i * 0.18 }}
                            className="w-1.5 h-1.5 bg-primary rounded-full"
                        />
                    ))}
                </motion.div>
            </div>
        </motion.div>
    );
  };

  const renderHome = () => (
    <div className="space-y-6 pb-32">
      {/* Header */}
      <div className="pt-2">
        <p className="text-[11px] font-black text-primary uppercase tracking-[0.25em] mb-1">Quiz Battle</p>
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">কুইজ ব্যাটল</h2>
        <p className="text-sm text-gray-400 dark:text-zinc-500 font-medium mt-1">বন্ধুর সাথে লড়াইয়ে যাচাই করো নিজের প্রস্তুতি</p>
      </div>

      {/* Player Card */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-[#8b5cf6] to-red-600 p-6 text-white shadow-xl shadow-primary/20">
        <div aria-hidden className="absolute -top-16 -right-12 w-52 h-52 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-white/40 p-0.5 shrink-0">
            <PlayerAvatar src={userAvatar} name={currentUser?.displayName} className="w-full h-full rounded-full" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-black truncate">{currentUser?.displayName || 'শিক্ষার্থী'}</h1>
            <p className="text-xs font-medium text-purple-100/90 mt-0.5">রুম খুলো বা কোড দিয়ে ঢুকো — লড়াই শুরু করো</p>
          </div>
        </div>

        <div className="relative grid grid-cols-3 gap-2.5 mt-5">
          {[
            { label: 'মোট ম্যাচ', value: toBengaliNumber(myStats.totalMatches) },
            { label: 'জয়ের হার', value: `${toBengaliNumber(myStats.winRate)}%` },
            { label: 'পয়েন্ট', value: toBengaliNumber(myStats.totalPoints) },
          ].map((chip, i) => (
            <div key={i} className="rounded-2xl bg-black/15 border border-white/10 backdrop-blur-sm px-3 py-2.5 text-center">
              <p className="text-lg font-black leading-none tabular-nums truncate">{chip.value}</p>
              <p className="text-[10px] font-bold text-purple-100/80 mt-1">{chip.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Actions */}
      <div className="grid gap-3.5">
        <motion.button 
          whileTap={{ scale: 0.97 }}
          onClick={() => { triggerHaptic('medium'); setPhase('CREATE'); }}
          className="group bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border-2 border-primary/70 hover:border-primary hover:bg-purple-50/40 dark:hover:bg-purple-950/10 transition-all text-left relative overflow-hidden shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-purple-50 dark:bg-purple-950/30 text-primary rounded-2xl flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-900/40">
              <UserPlus size={24} />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">নতুন ব্যাটল তৈরি করুন</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium mt-1 leading-relaxed">বিষয় ও অধ্যায় বেছে নিয়ে রুম খুলুন, কোড শেয়ার করুন</p>
            </div>
            <div className="ml-auto p-2 rounded-full bg-purple-50 dark:bg-purple-950/30 text-primary shrink-0 transition-transform group-hover:translate-x-0.5">
              <MoveRight size={16} />
            </div>
          </div>
        </motion.button>

        <motion.button 
          whileTap={{ scale: 0.97 }}
          onClick={() => { triggerHaptic('medium'); setPhase('JOIN'); }}
          className="group bg-gray-900 dark:bg-white p-6 rounded-[2rem] text-white dark:text-gray-900 hover:shadow-xl transition-all text-left relative overflow-hidden"
        >
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-white/10 dark:bg-gray-100 rounded-2xl flex items-center justify-center shrink-0">
              <Swords size={24} />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-black">রুম কোড দিয়ে যোগ দিন</h3>
              <p className="text-xs opacity-60 font-medium mt-1 leading-relaxed">বন্ধুর শেয়ার করা কোড লিখে সরাসরি ব্যাটলে ঢুকুন</p>
            </div>
            <div className="ml-auto p-2 rounded-full bg-white/10 dark:bg-gray-200 opacity-80 shrink-0 transition-transform group-hover:translate-x-0.5">
              <MoveRight size={16} />
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );

  const renderLobbyPlayers = () => {
    if (!battleState) return null;
    const players = Object.values(battleState.players) as BattlePlayer[];
    const host = players.find(p => p.uid === battleState.hostId);
    const guest = players.find(p => p.uid !== battleState.hostId);

    return (
      <div className="flex items-start justify-around gap-4 md:gap-8 py-10 relative">
        {/* VS badge */}
        <div className="absolute top-9 left-1/2 -translate-x-1/2 z-20">
          <motion.div 
            initial={{ scale: 0, rotate: -12 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12 }}
            className="w-14 h-14 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center shadow-xl border-2 border-primary"
          >
            <span className="text-xl font-black italic text-primary">VS</span>
          </motion.div>
        </div>

        {/* Host */}
        <div className="flex flex-col items-center gap-4 relative z-10">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="w-28 h-28 md:w-36 md:h-36 rounded-[2.5rem] border-2 border-blue-500/80 p-1.5 bg-white dark:bg-zinc-900 shadow-xl shadow-blue-500/10"
          >
            <PlayerAvatar src={host?.avatar || userAvatar} name={host?.name} className="w-full h-full rounded-[2rem]" />
          </motion.div>
          <div className="text-center max-w-[140px]">
            <p className="font-black text-gray-900 dark:text-white text-base truncate">{host?.name || 'আপনি'}</p>
            <span className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[11px] font-black rounded-full border border-blue-100 dark:border-blue-900/40">
                <Crown size={11} /> হোস্ট
            </span>
          </div>
        </div>

        {/* Challenger */}
        <div className="flex flex-col items-center gap-4 relative z-10">
          {guest ? (
            <>
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 0.6 }}
                className="w-28 h-28 md:w-36 md:h-36 rounded-[2.5rem] border-2 border-primary p-1.5 bg-white dark:bg-zinc-900 shadow-xl shadow-primary/10"
              >
                <PlayerAvatar src={guest.avatar} name={guest.name} className="w-full h-full rounded-[2rem]" />
              </motion.div>
              <div className="text-center max-w-[140px]">
                <p className="font-black text-gray-900 dark:text-white text-base truncate">{guest.name}</p>
                <span className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 bg-purple-50 dark:bg-purple-950/30 text-primary dark:text-purple-400 text-[11px] font-black rounded-full border border-purple-100 dark:border-purple-900/40">
                    <Swords size={11} /> চ্যালেঞ্জার
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-zinc-700 flex items-center justify-center bg-gray-50/60 dark:bg-zinc-900/40 overflow-hidden">
                    <motion.div
                        animate={{ opacity: [0.15, 0.35, 0.15] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 bg-primary/20"
                    />
                    <UserPlus size={28} strokeWidth={1.5} className="text-gray-300 dark:text-zinc-600 relative" />
                </div>
                <div className="text-center">
                    <p className="font-bold text-gray-400 dark:text-zinc-500 text-sm">অপোনেন্টের অপেক্ষায়…</p>
                    <div className="mt-1.5 flex justify-center gap-1">
                        {[0, 1, 2].map(i => (
                            <motion.div 
                                key={i}
                                animate={{ opacity: [0.2, 1, 0.2] }}
                                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                className="w-1.5 h-1.5 bg-primary rounded-full"
                            />
                        ))}
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCreate = () => {
    // Find chapters based on selected subject (supports multiple papers)
    const actualKeys = config.subjects[0] ? getActualSubjectKeys(config.subjects[0]) : [];
    const chapters = actualKeys.flatMap(key => SYLLABUS_DB[key] ? Object.keys(SYLLABUS_DB[key]) : []);

    return (
        <div className="space-y-7 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
            {/* 1. Subject Selection */}
            <div>
                <label className="text-xs font-black text-gray-500 dark:text-zinc-400 mb-3 flex items-center gap-1.5">
                    <Layers size={14} className="text-primary" /> বিষয় নির্বাচন করুন
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                    {BATTLE_SUBJECTS.map(subj => {
                        const isSelected = config.subjects.includes(subj.id);
                        return (
                            <button
                                key={subj.id}
                                onClick={() => {
                                  triggerHaptic('light');
                                  setConfig({ ...config, subjects: [subj.id], chapters: ['Full Syllabus'] });
                                }}
                                className={`relative p-3.5 rounded-2xl border-2 transition-all flex items-center gap-3 group ${isSelected ? `${subj.bg} ${subj.border} ring-2 ring-primary/15` : 'bg-gray-50/60 dark:bg-white/[0.02] border-transparent hover:border-gray-200 dark:hover:border-zinc-700'}`}
                            >
                                <div className={`p-2.5 rounded-xl bg-white dark:bg-zinc-900 shadow-sm transition-transform group-hover:scale-105 ${isSelected ? 'scale-105' : ''}`}>
                                    <subj.icon className={subj.color} size={19} />
                                </div>
                                <span className={`text-[13px] font-black text-left leading-tight ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-zinc-400'}`}>{subj.label}</span>
                                {isSelected && (
                                    <span className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-sm">
                                        <Check size={12} strokeWidth={3.5} className="text-white" />
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* 2. Chapter Selection */}
            {config.subjects.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <label className="text-xs font-black text-gray-500 dark:text-zinc-400 mb-3 flex items-center gap-1.5">
                        <BookOpen size={14} className="text-primary" /> অধ্যায়
                    </label>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => { triggerHaptic('light'); setConfig({ ...config, chapters: ['Full Syllabus'] }); }}
                            className={`px-4 py-2.5 rounded-xl text-xs font-black border transition-all ${config.chapters.includes('Full Syllabus') ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white' : 'bg-white dark:bg-zinc-900 text-gray-500 border-gray-100 dark:border-zinc-800 hover:border-gray-300'}`}
                        >
                            সম্পূর্ণ সিলেবাস
                        </button>
                        {chapters.map((chap, idx) => {
                            const isChapSelected = config.chapters.includes(chap);
                            return (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        triggerHaptic('light');
                                        setConfig({ ...config, chapters: [chap] });
                                    }}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-black border transition-all ${isChapSelected ? 'bg-purple-50 dark:bg-purple-950/30 text-primary dark:text-purple-400 border-purple-200 dark:border-purple-900/50' : 'bg-white dark:bg-zinc-900 text-gray-500 border-gray-100 dark:border-zinc-800 hover:border-gray-300'}`}
                                >
                                    {chap}
                                </button>
                            )
                        })}
                    </div>
                </motion.div>
            )}

            {/* 3. Game Settings */}
            <div className="bg-gray-50/70 dark:bg-white/[0.02] p-5 rounded-3xl border border-gray-100 dark:border-white/5 space-y-6">
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-black text-gray-500 dark:text-zinc-400 flex items-center gap-1.5"><Hash size={13} /> প্রশ্নসংখ্যা</span>
                        <span className="text-sm font-black text-primary tabular-nums">{toBengaliNumber(config.questionCount)} টি</span>
                    </div>
                    <input 
                        type="range" min="5" max="20" step="5"
                        value={config.questionCount}
                        onChange={(e) => setConfig({...config, questionCount: parseInt(e.target.value)})}
                        className="w-full h-2 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-black text-gray-500 dark:text-zinc-400 flex items-center gap-1.5"><Clock size={13} /> প্রতি প্রশ্নের সময়</span>
                        <span className="text-sm font-black text-primary tabular-nums">{toBengaliNumber(config.timePerQuestion)} সেকেন্ড</span>
                    </div>
                    <input 
                        type="range" min="10" max="60" step="5"
                        value={config.timePerQuestion}
                        onChange={(e) => setConfig({...config, timePerQuestion: parseInt(e.target.value)})}
                        className="w-full h-2 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                </div>
            </div>

            <button 
                onClick={handleCreate} 
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-red-600 text-white font-black text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2.5"
            >
                <Zap size={20} fill="currentColor" /> ব্যাটল রুম তৈরি করুন
            </button>
        </div>
    );
  };

  const renderJoin = () => (
    <div className="space-y-7">
        <div>
            <label className="block text-xs font-black text-gray-500 dark:text-zinc-400 mb-1.5 text-center">রুম কোড দিন</label>
            <p className="block text-[11px] font-medium text-gray-400 dark:text-zinc-500 mb-5 text-center">বন্ধুর শেয়ার করা ৬-ডিজিটের কোডটি লিখুন</p>
            <input 
                type="text" 
                inputMode="numeric"
                autoFocus
                value={inputRoomId}
                onChange={e => setInputRoomId(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="৬-ডিজিটের কোড"
                maxLength={6}
                className="w-full p-7 text-4xl font-mono text-center tracking-[0.25em] rounded-3xl bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-zinc-800 focus:border-primary focus:bg-white dark:focus:bg-zinc-900 outline-none dark:text-white placeholder:tracking-normal placeholder:text-base placeholder:font-sans dark:placeholder:text-zinc-600 transition-all"
            />
        </div>
        <button 
          onClick={handleJoin} 
          disabled={inputRoomId.length < 4}
          className="w-full py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black text-lg shadow-xl hover:bg-gray-800 dark:hover:bg-gray-100 active:scale-[0.98] transition-all disabled:opacity-40 disabled:scale-100"
        >
          ব্যাটলে যোগ দিন
        </button>
    </div>
  );

  if (phase === 'MENU' || phase === 'CREATE' || phase === 'JOIN') return (
    <div className="h-full bg-gray-50 dark:bg-black relative overflow-hidden">
      <div className="h-full overflow-y-auto p-5 md:p-8 max-w-4xl mx-auto no-scrollbar">
        {renderHome()}
      </div>

      {/* Create Bottom Sheet */}
      <AnimatePresence>
        {phase === 'CREATE' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end justify-center"
            onClick={() => setPhase('MENU')}
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              className="w-full md:max-w-xl bg-white dark:bg-zinc-900 rounded-t-[2.5rem] p-6 md:p-8 shadow-2xl relative max-h-[92dvh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full mx-auto mb-6"></div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">নতুন ব্যাটল</h2>
                <button onClick={() => setPhase('MENU')} className="p-2.5 bg-gray-100 dark:bg-zinc-800 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
                  <X size={20} />
                </button>
              </div>
              {loading ? (
                <div className="py-20 flex justify-center">
                  <Loader2 className="animate-spin text-primary" size={40} />
                </div>
              ) : renderCreate()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Bottom Sheet */}
            <AnimatePresence>
        {phase === 'JOIN' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end justify-center"
            onClick={() => setPhase('MENU')}
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              className="w-full md:max-w-xl bg-white dark:bg-zinc-900 rounded-t-[2.5rem] p-6 md:p-8 shadow-2xl relative max-h-[92dvh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full mx-auto mb-6"></div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">রুম কোড দিয়ে যোগ দিন</h2>
                <button onClick={() => setPhase('MENU')} className="p-2.5 bg-gray-100 dark:bg-zinc-800 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
                  <X size={20} />
                </button>
              </div>
              {loading ? (
                <div className="py-20 flex justify-center">
                  <Loader2 className="animate-spin text-primary" size={40} />
                </div>
              ) : renderJoin()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (phase === 'LOBBY') return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-gray-50 dark:bg-black overflow-hidden">
        {/* Ambient */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]"></div>
            <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]"></div>
        </div>

        <AnimatePresence>
            {showVersus && <VersusOverlay />}
        </AnimatePresence>

        {/* Header */}
        <div className="p-5 pt-5 text-center relative z-10">
            <button
                onClick={() => { triggerHaptic('light'); handleLeave(); }}
                className="absolute left-4 top-4 w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm flex items-center justify-center text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white active:scale-90 transition-all"
                title="রুম ছেড়ে ফিরে যান"
            >
                <ArrowLeft size={18} />
            </button>
            <p className="text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.25em] mb-3">Battle Room</p>
            <button 
                onClick={() => { 
                    triggerHaptic('medium');
                    navigator.clipboard.writeText(roomId); 
                    showToast("কোড কপি হয়েছে!", "success"); 
                }}
                className="group inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg shadow-black/5 border border-gray-100 dark:border-white/5 active:scale-95 transition-all"
            >
                <span className="text-3xl font-mono font-black text-primary tracking-[0.15em] tabular-nums">{roomId}</span>
                <span className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                    <Copy size={17} />
                </span>
            </button>
            <p className="text-[11px] font-medium text-gray-400 dark:text-zinc-500 mt-2.5">কোডে ট্যাপ করে কপি করুন</p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 relative z-10 pb-4 space-y-5 custom-scrollbar">
            {renderLobbyPlayers()}

            {battleState && battleState.hostId === currentUser?.uid && Object.keys(battleState.players).length < 2 && (
                <OnlinePlayersInvitePanel 
                    roomId={roomId} 
                    battleConfig={battleState.config} 
                    currentUser={currentUser} 
                    userAvatar={userAvatar} 
                    showToast={showToast} 
                />
            )}
        </div>

        <div className="p-5 pb-24 text-center space-y-4 relative z-10">
            {battleState?.hostId === currentUser?.uid ? (
                <motion.button 
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                        triggerHaptic('heavy');
                        startRTDBBattle(roomId);
                    }} 
                    disabled={!battleState || Object.keys(battleState.players).length < 2} 
                    className="w-full max-w-md mx-auto py-4 bg-gradient-to-r from-primary to-red-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/25 flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                    {(!battleState || Object.keys(battleState.players).length < 2) ? (
                        <div className="flex items-center gap-2.5">
                            <Loader2 className="animate-spin" size={20} />
                            <span className="text-base">অপোনেন্টের অপেক্ষায়…</span>
                        </div>
                    ) : (
                        <><Swords size={22} /> ব্যাটল শুরু করুন</>
                    )}
                </motion.button>
            ) : (
                <div className="max-w-md mx-auto bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-5 rounded-3xl border border-gray-100 dark:border-white/5 flex items-center justify-center gap-3 shadow-sm">
                    <Loader2 className="animate-spin text-primary shrink-0" size={20} />
                    <p className="font-bold text-gray-500 dark:text-zinc-400 text-sm">হোস্ট শুরু করলেই ব্যাটল শুরু হবে…</p>
                </div>
            )}
            <button 
                onClick={() => {
                    triggerHaptic('light');
                    handleLeave();
                }} 
                className="px-6 py-2 text-gray-400 dark:text-zinc-500 text-xs font-black uppercase tracking-widest hover:text-red-500 transition-colors"
            >
                রুম ছেড়ে দিন
            </button>
        </div>
    </div>
  );

  if (phase === 'GAME') {
    const question = battleState?.questions[currentQIndex];
    if (!question) return null;

    const players = (Object.values(battleState?.players || {}) as BattlePlayer[]).sort((a,b) => b.score - a.score);
    const opponent = players.find(p => p.uid !== currentUser?.uid);
    const me = players.find(p => p.uid === currentUser?.uid);
    const bothAnswered = hasAnswered && opponent?.answers?.[currentQIndex] !== undefined;
    const timerText = String(toBengaliNumber(timeLeft)).padStart(2, '০');

    return (
        <div className="fixed inset-0 z-[200] flex flex-col bg-gray-50 dark:bg-black overflow-hidden relative">
            {/* Timer Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-zinc-800 z-[70]">
                <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timeLeft / battleState.config.timePerQuestion) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'linear' }}
                    className={`h-full ${timeLeft < 5 ? 'bg-red-500' : 'bg-primary'}`}
                />
            </div>

            {/* Reactions Overlay */}
            <div className="fixed inset-0 pointer-events-none z-[60]">
                {activeReactions.map(r => (
                    <div key={r.id} className="absolute bottom-24 left-1/2 -translate-x-1/2 animate-[reactionFly_2s_ease-out_forwards] text-5xl">
                        {r.emoji}
                    </div>
                ))}
            </div>

            {/* Top Bar */}
            <div className="p-4 pt-6 flex items-center justify-between gap-3 relative z-10">
                <div className="flex items-center gap-2 min-w-0">
                    <button
                        onClick={() => {
                            if (window.confirm('ব্যাটল ছেড়ে যেতে চান? হোস্ট হলে রুমটিও বন্ধ হয়ে যাবে।')) handleLeave();
                        }}
                        className="w-9 h-9 rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 active:scale-90 transition-all shrink-0"
                        title="ব্যাটল ছেড়ে যান"
                    >
                        <X size={17} />
                    </button>
                    <div className="flex items-center gap-2.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl px-4 py-2 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                        <span className="text-base font-black text-gray-900 dark:text-white tabular-nums">
                            {toBengaliNumber(currentQIndex + 1)}<span className="text-gray-400 dark:text-zinc-500">/{toBengaliNumber(battleState.questions.length)}</span>
                        </span>
                        <span className="text-[11px] font-bold text-gray-400 dark:text-zinc-500">প্রশ্ন</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {streak >= 3 && (
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="px-3 py-2 bg-primary text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-primary/20"
                        >
                            <Flame size={14} fill="currentColor" /> {toBengaliNumber(streak)}
                        </motion.div>
                    )}
                    <div className="flex items-center gap-1.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl px-3 py-2 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm" title="আপনার স্কোর">
                        <Zap size={13} className="text-primary" fill="currentColor" />
                        <span className="text-sm font-black text-gray-800 dark:text-white tabular-nums">{toBengaliNumber(me?.score || 0)}</span>
                    </div>
                    <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl px-3.5 py-2 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm min-w-[3.5rem] text-center">
                        <span className={`text-xl font-mono font-black tabular-nums ${timeLeft < 5 ? 'text-red-500' : 'text-gray-800 dark:text-white'}`}>
                            {timerText}
                        </span>
                    </div>
                </div>
            </div>

            {/* Question & Options */}
            <div className="flex-1 overflow-y-auto px-4 pb-44 no-scrollbar relative z-10">
                <motion.div 
                    key={currentQIndex}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 mb-6 relative overflow-hidden"
                >
                    {question.contextText && (
                        <div className={`mb-5 p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl border border-purple-100/60 dark:border-purple-900/30 text-sm md:text-base leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap ${getFont(question.contextText)}`}>
                            <SafeHtml html={question.contextText} />
                            {question.contextImage && (
                                <img src={question.contextImage} alt="Context" className="mt-4 rounded-xl max-h-48 object-contain mx-auto border bg-white" referrerPolicy="no-referrer" />
                            )}
                        </div>
                    )}
                    
                    <h2 className={`text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-relaxed text-center whitespace-pre-wrap ${getFont(question.question)}`}>
                        <SafeHtml html={question.question} />
                    </h2>
                    
                    {question.questionImage && (
                        <img src={question.questionImage} alt="Question" className="mt-5 rounded-xl max-h-48 object-contain mx-auto border bg-white" referrerPolicy="no-referrer" />
                    )}
                </motion.div>

                <div className="grid gap-3">
                    <AnimatePresence mode="popLayout">
                        {question.options.map((opt, idx) => {
                            const isSelected = selectedOption === idx;
                            const isCorrect = idx === Number(question.correctAnswerIndex);
                            const isDisabled = disabledOptions.includes(idx);
                            
                            let btnClass = "bg-white dark:bg-zinc-900 border-2 border-gray-100 dark:border-zinc-800 text-gray-700 dark:text-gray-200 shadow-sm";
                            
                            if (hasAnswered) {
                                if (isSelected) {
                                    btnClass = isCorrect 
                                        ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/25" 
                                        : "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/25";
                                } else if (isCorrect) {
                                    btnClass = "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-700 dark:text-emerald-400";
                                } else {
                                    btnClass = "opacity-40";
                                }
                            } else if (isDisabled) {
                                btnClass = "opacity-20 grayscale pointer-events-none";
                            }

                            return (
                                <motion.button
                                    key={idx}
                                    layout
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.06 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => {
                                        triggerHaptic('medium');
                                        handleAnswer(idx);
                                    }}
                                    disabled={hasAnswered || isDisabled}
                                    className={`w-full p-4 md:p-5 rounded-2xl transition-all flex items-center justify-between group ${btnClass}`}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black border-2 shrink-0 ${
                                            hasAnswered && isSelected
                                                ? 'bg-white/20 border-white/60 text-white'
                                                : hasAnswered && isCorrect
                                                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                                                    : 'bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400'
                                        }`}>
                                            {['ক','খ','গ','ঘ'][idx]}
                                        </div>
                                        <div className="flex flex-col gap-2 min-w-0 text-left">
                                            <span className={`text-[15px] md:text-base font-medium whitespace-pre-wrap ${getFont(opt)}`}><SafeHtml html={opt} /></span>
                                            {question.optionsImages?.[idx] && (
                                                <img src={question.optionsImages[idx]} alt={`Option ${idx}`} className="h-16 w-fit object-contain rounded border self-start bg-white" referrerPolicy="no-referrer" />
                                            )}
                                        </div>
                                    </div>
                                    {hasAnswered && isSelected && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="shrink-0 ml-2">
                                            {isCorrect ? <CheckCircle size={22} className="text-white"/> : <XCircle size={22} className="text-white"/>}
                                        </motion.div>
                                    )}
                                </motion.button>
                            )
                        })}
                    </AnimatePresence>
                </div>

                {/* Status Indicator */}
                {hasAnswered && opponent && !opponent.answers?.[currentQIndex] && (
                    <div className="text-center mt-6 p-3.5 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-white/5">
                        <p className="text-xs font-bold text-gray-400 dark:text-zinc-500">অপোনেন্টের উত্তরের অপেক্ষায়…</p>
                    </div>
                )}

                {/* Host Control: Next Question */}
                {bothAnswered && battleState?.hostId === currentUser?.uid && (
                    <div className="flex justify-center mt-6 mb-2">
                        <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                triggerHaptic('medium');
                                skipToNextQuestion();
                            }}
                            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3.5 rounded-2xl font-black shadow-lg flex items-center gap-2.5 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                        >
                            পরের প্রশ্ন <MoveRight size={18}/>
                        </motion.button>
                    </div>
                )}
            </div>

            {/* Bottom HUD: Opponent & Power-ups */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-gray-50 via-gray-50/90 dark:from-black dark:via-black/90 to-transparent z-50">
                <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
                    {/* Opponent Status */}
                    <div className="flex-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl p-3 rounded-2xl border border-gray-100 dark:border-white/5 shadow-lg flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                            <PlayerAvatar src={opponent?.avatar || userAvatar} name={opponent?.name} className="w-10 h-10 rounded-full border-2 border-primary/60" />
                            {opponent?.answers?.[currentQIndex] !== undefined && (
                                <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-white dark:border-zinc-900">
                                    <Check size={8} className="text-white" strokeWidth={4}/>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider truncate">{opponent?.name || 'অপোনেন্ট'}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <motion.div 
                                        animate={{ width: `${(opponent?.score || 0) / 5000 * 100}%` }}
                                        className="h-full bg-primary"
                                    />
                                </div>
                                <span className="text-xs font-black text-primary tabular-nums">{toBengaliNumber(opponent?.score || 0)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Power-ups */}
                    <div className="flex gap-2 shrink-0">
                        <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={() => { triggerHaptic('medium'); usePowerUp('50-50'); }}
                            disabled={hasAnswered || powerUpsUsed.includes('50-50')}
                            title="দুটি ভুল উত্তর বাদ দিন"
                            className="w-13 h-13 min-w-[3.25rem] h-[3.25rem] bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 dark:border-white/5 disabled:opacity-30 transition-opacity"
                        >
                            <span className="text-xs font-black text-primary">৫০:৫০</span>
                        </motion.button>
                        <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={() => { triggerHaptic('medium'); setShowReactions(!showReactions); }}
                            title="রিঅ্যাকশন পাঠান"
                            className="w-[3.25rem] h-[3.25rem] bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 dark:border-white/5 transition-opacity"
                        >
                            <Smile size={22} className="text-blue-500" />
                        </motion.button>
                    </div>
                </div>

                {/* Reactions Picker */}
                <AnimatePresence>
                    {showReactions && (
                        <motion.div 
                            initial={{ opacity: 0, y: 16, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 16, scale: 0.9 }}
                            className="absolute bottom-full right-4 mb-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl p-3.5 rounded-3xl shadow-2xl border border-gray-100 dark:border-white/10 flex gap-2.5"
                        >
                            {['🔥', '😎', '🤔', '😂', '👏', '💔'].map(emoji => (
                                <button 
                                    key={emoji} 
                                    onClick={() => {
                                        triggerHaptic('light');
                                        sendReaction(emoji);
                                        setShowReactions(false);
                                    }}
                                    className="text-2xl w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 hover:scale-110 active:scale-90 transition-all"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {/* Floating Points Animation */}
            {floatingPoints && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-black text-emerald-500 drop-shadow-sm animate-[pointsPop_0.8s_ease-out_forwards] z-[100]">
                    +{toBengaliNumber(floatingPoints.pts)}
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
    const isWinner = winner?.uid === currentUser?.uid;

    const handleShareResult = () => {
        const shareText = `কুইজ ব্যাটলে ${isWinner ? 'আমি জিতেছি!' : 'আমি খেলেছি!'} স্কোর: ${winner?.score || 0} — চলো তুমিও লড়ো! (Porikkhangon)`;
        if (navigator.share) {
            navigator.share({ title: 'Porikkhangon Quiz Battle', text: shareText }).catch(() => {});
        } else {
            navigator.clipboard.writeText(shareText);
            showToast('শেয়ার টেক্সট কপি হয়েছে!', 'success');
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex flex-col bg-[#0F172A] text-white p-6 items-center justify-center overflow-y-auto relative pb-20">
            {/* Ambient glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[120px] ${isWinner ? 'bg-violet-500/15' : 'bg-primary/15'}`}></div>
                <div className="absolute -bottom-24 -right-16 w-72 h-72 bg-primary/10 rounded-full blur-[100px]"></div>
            </div>
            
            {isWinner && showConfetti && <Confetti />}
            
            <AnimatePresence mode="wait">
                {!showComparison ? (
                    <motion.div 
                        key="results"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="relative z-10 w-full max-w-sm text-center"
                    >
                        {/* Winner Avatar */}
                        <motion.div 
                            initial={{ y: 16, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="relative inline-block mb-8"
                        >
                            <div className={`absolute inset-0 blur-[50px] opacity-30 ${isWinner ? 'bg-violet-400' : 'bg-primary'}`}></div>
                            {isWinner && <Crown size={42} className="absolute -top-9 left-1/2 -translate-x-1/2 text-violet-400 fill-violet-400 z-20" />}
                            <div className={`w-28 h-28 rounded-full p-1 shadow-2xl relative z-10 ${isWinner ? 'bg-gradient-to-tr from-violet-300 via-violet-500 to-purple-500' : 'bg-white/20'}`}>
                                <PlayerAvatar src={winner?.avatar} name={winner?.name} className="w-full h-full rounded-full border-4 border-[#0F172A]" />
                            </div>
                            <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full font-black text-[11px] uppercase tracking-widest shadow-lg border-2 border-[#0F172A] whitespace-nowrap ${isWinner ? 'bg-violet-400 text-[#0F172A]' : 'bg-white/20 text-white'}`}>
                                {isWinner ? 'বিজয়ী' : `${toBengaliNumber(2)}য় স্থান`}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ y: 16, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.35 }}
                        >
                            <h1 className="text-3xl font-black mb-2">{isWinner ? 'চমৎকার জয়!' : 'খেলা শেষ'}</h1>
                            <p className="text-gray-400 text-sm mb-8">{isWinner ? 'আপনি এই ব্যাটলের চ্যাম্পিয়ন' : 'পরের ব্যাটলে আবার চেষ্টা করুন'}</p>
                        </motion.div>

                        {/* Scoreboard */}
                        <motion.div 
                            initial={{ y: 16, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white/[0.06] backdrop-blur-md rounded-3xl p-4 border border-white/10 mb-8 space-y-1.5"
                        >
                            {sorted.map((p, idx) => (
                                <div key={p.uid} className={`flex items-center justify-between p-3 rounded-2xl ${p.uid === currentUser?.uid ? 'bg-white/10 border border-white/20' : 'border border-transparent'}`}>
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="font-mono font-bold text-gray-500 text-sm w-6">{toBengaliNumber(idx+1)}</span>
                                        <PlayerAvatar src={p.avatar} name={p.name} className="w-8 h-8 rounded-full shrink-0" />
                                        <span className="font-bold text-sm truncate max-w-[140px]">{p.name}{p.uid === currentUser?.uid ? ' (আপনি)' : ''}</span>
                                    </div>
                                    <span className="font-black font-mono text-violet-400 tabular-nums">{toBengaliNumber(p.score)}</span>
                                </div>
                            ))}
                        </motion.div>

                        <motion.div 
                            initial={{ y: 16, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.65 }}
                            className="flex flex-col gap-3"
                        >
                            <button onClick={() => setShowComparison(true)} className="w-full py-4 bg-primary hover:bg-primary/90 rounded-2xl font-black text-sm transition-colors shadow-lg shadow-primary/25 flex items-center justify-center gap-2">
                                <Eye size={18} /> প্রশ্ন ও উত্তর দেখুন
                            </button>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={resetToMenu} className="py-4 bg-white/[0.06] hover:bg-white/10 rounded-2xl font-black text-sm transition-colors border border-white/10">মূল মেনু</button>
                                <button 
                                    onClick={handleRematch} 
                                    disabled={loading}
                                    className="py-4 bg-white text-gray-900 hover:bg-gray-100 rounded-2xl font-black text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18}/> : <><Swords size={16} /> রিম্যাচ</>}
                                </button>
                            </div>
                            <button onClick={handleShareResult} className="w-full py-4 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white rounded-2xl font-bold text-sm transition-colors border border-white/10 flex items-center justify-center gap-2">
                                <Share2 size={17} /> ফলাফল শেয়ার করুন
                            </button>
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="analysis"
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 60 }}
                        className="fixed inset-0 z-[210] bg-[#0F172A] flex flex-col"
                    >
                        {/* Analysis Header */}
                        <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center bg-[#0F172A] z-10">
                            <div>
                                <h2 className="text-lg font-black text-white">ম্যাচ বিশ্লেষণ</h2>
                                <p className="text-xs text-gray-500 mt-0.5">কোন প্রশ্নে কে কী উত্তর দিয়েছে</p>
                            </div>
                            <button onClick={() => setShowComparison(false)} className="p-2.5 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/10">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Questions List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-5">
                            {battleState?.questions.map((q, idx) => (
                                <motion.div 
                                    key={idx} 
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="bg-white/[0.04] p-5 rounded-3xl border border-white/10"
                                >
                                    <div className="flex gap-3 mb-4">
                                        <span className="font-black text-white/20 text-xl font-mono shrink-0">{String(idx+1).padStart(2,'0')}</span>
                                        <div className="flex-1 min-w-0">
                                            {q.contextText && (
                                                <div className={`mb-3 p-3 bg-white/5 rounded-2xl border border-white/10 text-sm opacity-80 whitespace-pre-wrap ${getFont(q.contextText)}`}>
                                                    <SafeHtml html={q.contextText} />
                                                    {q.contextImage && (
                                                        <img src={q.contextImage} alt="Context" className="mt-3 rounded-lg max-h-32 object-contain border bg-white" referrerPolicy="no-referrer" />
                                                    )}
                                                </div>
                                            )}
                                            <h3 className={`font-bold text-white text-base leading-relaxed whitespace-pre-wrap ${getFont(q.question)}`}>
                                                <SafeHtml html={q.question} />
                                            </h3>
                                            {q.questionImage && (
                                                <img src={q.questionImage} alt="Question" className="mt-3 rounded-lg max-h-40 object-contain border bg-white" referrerPolicy="no-referrer" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {q.options.map((opt, oIdx) => {
                                            const isCorrect = oIdx === Number(q.correctAnswerIndex);
                                            // Find players who selected this option
                                            const selectors = sorted.filter(p => p.answers && p.answers[idx] === oIdx);
                                            const isSelectedBySomeone = selectors.length > 0;
                                            
                                            let borderClass = "border-white/10";
                                            let bgClass = "bg-white/[0.03]";
                                            
                                            if (isCorrect) {
                                                borderClass = "border-emerald-500/40";
                                                bgClass = "bg-emerald-500/10";
                                            } else if (isSelectedBySomeone) {
                                                borderClass = "border-red-500/40";
                                                bgClass = "bg-red-500/10";
                                            }

                                            return (
                                                <div key={oIdx} className={`relative p-3.5 rounded-2xl border ${borderClass} ${bgClass} flex justify-between items-center gap-3`}>
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black border shrink-0 ${isCorrect ? 'border-emerald-500 text-emerald-400' : 'border-white/20 text-white/40'}`}>
                                                            {['ক','খ','গ','ঘ'][oIdx]}
                                                        </div>
                                                        <div className="flex flex-col gap-2 min-w-0">
                                                            <span className={`text-sm whitespace-pre-wrap ${isCorrect ? 'text-emerald-400 font-bold' : 'text-gray-300'} ${getFont(opt)}`}>
                                                                <SafeHtml html={opt} />
                                                            </span>
                                                            {q.optionsImages?.[oIdx] && (
                                                                <img src={q.optionsImages[oIdx]} alt={`Option ${oIdx}`} className="h-12 w-fit object-contain rounded border self-start bg-white" referrerPolicy="no-referrer" />
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Avatars of players who picked this */}
                                                    <div className="flex -space-x-2 shrink-0">
                                                        {selectors.map(p => (
                                                            <PlayerAvatar 
                                                                key={p.uid} 
                                                                src={p.avatar} 
                                                                name={p.name}
                                                                className={`w-7 h-7 rounded-full border-2 ${isCorrect ? 'border-emerald-500' : 'border-red-500'} bg-gray-800`} 
                                                            />
                                                        ))}
                                                        {isCorrect && selectors.length === 0 && (
                                                            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500">
                                                                <Check size={13} className="text-emerald-500" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </motion.div>
                            ))}
                            
                            <div className="text-center pt-6 pb-4 text-white/25 text-[11px] font-bold uppercase tracking-widest">
                                — বিশ্লেষণ শেষ —
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-black">
        {loading ? <Loader2 className="animate-spin text-primary" size={48} /> : renderCreate()}
    </div>
  );
};

export default QuizBattlePrototype;
