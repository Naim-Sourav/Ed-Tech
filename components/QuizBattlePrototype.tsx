
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Swords, Zap, Trophy, UserPlus, Loader2, Copy, Clock, XCircle, 
  Crown, Eye, CheckCircle, X, Check, Share2, Smile,
  Flame, MoveRight, Home, Search,
  History, Percent, Atom, Beaker, Calculator, Dna, Brain, Layers, Globe, BookOpen, Book, Hash
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
  rematchRTDBRoom,
  deleteRTDBRoom,
  listenToServerOffset,
  BattleRoom,
  BattlePlayer,
  sendReactionRTDB
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

const BATTLE_SUBJECTS = [
    { id: 'Physics', label: 'পদার্থবিজ্ঞান', icon: Atom, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800' },
    { id: 'Chemistry', label: 'রসায়ন', icon: Beaker, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20', border: 'border-teal-200 dark:border-teal-800' },
    { id: 'Math', label: 'উচ্চতর গণিত', icon: Calculator, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' },
    { id: 'Biology', label: 'জীববিজ্ঞান', icon: Dna, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800' },
    { id: 'ICT', label: 'আইসিটি', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800' },
    { id: 'English', label: 'ইংরেজি', icon: BookOpen, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20', border: 'border-pink-200 dark:border-pink-800' },
    { id: 'Bangla', label: 'বাংলা', icon: Book, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-800' },
    { id: 'General Knowledge', label: 'সাধারণ জ্ঞান', icon: Globe, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800' },
];

const QuizBattlePrototype: React.FC = () => {
  const { currentUser, userAvatar } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const opponentInfo = location.state?.opponent; 
  
  // --- STATE ---
  const [phase, setPhase] = useState<Phase>('MENU');
  const [subPhase, setSubPhase] = useState<'HOME' | 'HISTORY' | 'LEADERBOARD'>('HOME');
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
              } catch (_e) {
                  console.error("Failed to load stats", _e);
              }
          };
          loadStats();
      }
  }, [currentUser, phase]);

  // MathJax Effect - Optimized to be less aggressive
  useEffect(() => {
    if (!(phase === 'GAME' || phase === 'RESULT' || showComparison)) return;

    let isMounted = true;
    const triggerTypeset = async () => {
      if (window.MathJax && window.MathJax.typesetPromise) {
        try {
          await window.MathJax.typesetPromise();
        } catch (err) {
          console.log('MathJax typeset failed:', err);
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
        const qResult = await generateQuizFromDB({
            subject: battleState.config.subjects[0],
            chapter: battleState.config.chapters[0] || 'Full Syllabus',
            topics: [], count: battleState.config.questionCount
        });
        
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
          console.error(_e);
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
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-orange-500/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-red-500/20 rounded-full blur-[100px] animate-pulse delay-700"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center w-full max-w-lg px-6">
                <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 12 }}
                    className="mb-12"
                >
                    <h2 className="text-orange-500 font-black text-sm uppercase tracking-[0.3em] mb-2 text-center">Battle Starting</h2>
                    <div className="h-1 w-24 bg-gradient-to-r from-transparent via-orange-500 to-transparent mx-auto"></div>
                </motion.div>

                <div className="flex items-center justify-between w-full gap-4">
                    {/* Host */}
                    <motion.div 
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="flex flex-col items-center flex-1"
                    >
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-orange-500 p-1 shadow-2xl shadow-orange-500/40">
                            <img src={host?.avatar} className="w-full h-full rounded-full object-cover bg-white" alt=""/>
                        </div>
                        <p className="mt-4 font-black text-white text-lg truncate w-full text-center">{host?.name}</p>
                    </motion.div>

                    {/* VS */}
                    <motion.div 
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.5, type: 'spring', damping: 10 }}
                        className="relative"
                    >
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center border-4 border-white shadow-2xl z-10 relative">
                            <span className="text-2xl font-black text-white italic">VS</span>
                        </div>
                        <div className="absolute inset-0 bg-red-600 rounded-full blur-xl animate-ping opacity-50"></div>
                    </motion.div>

                    {/* Guest */}
                    <motion.div 
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="flex flex-col items-center flex-1"
                    >
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-orange-500 p-1 shadow-2xl shadow-orange-500/40">
                            <img src={guest?.avatar} className="w-full h-full rounded-full object-cover bg-white" alt=""/>
                        </div>
                        <p className="mt-4 font-black text-white text-lg truncate w-full text-center">{guest?.name}</p>
                    </motion.div>
                </div>

                <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-16 flex flex-col items-center"
                >
                    <div className="flex gap-2">
                        {[1, 2, 3].map(i => (
                            <motion.div 
                                key={i}
                                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                className="w-2 h-2 bg-orange-500 rounded-full"
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
  };

  const renderBottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-gray-100 dark:border-zinc-800 px-6 py-3 flex justify-between items-center z-[150] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {[
        { id: 'HOME', icon: Home, label: 'Home' },
        { id: 'HISTORY', icon: History, label: 'History' },
        { id: 'LEADERBOARD', icon: Trophy, label: 'Leaderboard' }
      ].map((tab) => {
        const isActive = subPhase === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              triggerHaptic('light');
              setSubPhase(tab.id as any);
            }}
            className={`flex flex-col items-center gap-1 transition-all relative ${isActive ? 'text-orange-600' : 'text-gray-400'}`}
          >
            <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-orange-100/50 dark:bg-orange-900/30 scale-110' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <tab.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[12px] font-black uppercase tracking-widest transition-all ${isActive ? 'opacity-100 translate-y-0' : 'opacity-60'}`}>{tab.label}</span>
            {isActive && (
              <motion.div 
                layoutId="activeTab"
                className="absolute -bottom-1 w-1 h-1 bg-orange-600 rounded-full"
              />
            )}
          </button>
        );
      })}
    </div>
  );

  const renderHome = () => (
    <div className="space-y-8 pb-32">
      {/* Native-style Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Welcome back,</p>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">{currentUser?.displayName?.split(' ')[0]} 👋</h2>
        </div>
        <button className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
          <Search size={20} className="text-gray-400" />
        </button>
      </div>

      {/* Header / Profile Card */}
      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-orange-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="relative">
            <div className="w-24 h-24 p-1.5 bg-white/20 rounded-full backdrop-blur-md mb-4 shadow-xl">
              <img src={userAvatar} className="w-full h-full rounded-full object-cover bg-white" alt="Avatar"/>
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 border-4 border-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Zap size={12} fill="white" className="text-white" />
            </div>
          </div>
          
          <h1 className="text-2xl font-black mb-1">{currentUser?.displayName}</h1>
          <div className="flex items-center gap-2 mb-6">
            <span className="bg-white/20 px-3 py-1 rounded-full text-[12px] font-black uppercase tracking-widest backdrop-blur-sm">Warrior</span>
            <div className="w-1 h-1 bg-white/40 rounded-full"></div>
            <span className="text-orange-100 text-xs font-bold">Level 12</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            <div className="bg-black/20 backdrop-blur-md p-4 rounded-[1.5rem] border border-white/10">
              <p className="text-[12px] font-black text-orange-200 uppercase tracking-widest mb-1">Rank</p>
              <p className="text-xl font-black">#42</p>
            </div>
            <div className="bg-black/20 backdrop-blur-md p-4 rounded-[1.5rem] border border-white/10">
              <p className="text-[12px] font-black text-orange-200 uppercase tracking-widest mb-1">Points</p>
              <p className="text-xl font-black">{myStats.totalPoints}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bento */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-2xl">
            <Swords size={24}/>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-gray-800 dark:text-white">{myStats.totalMatches}</p>
            <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Matches</p>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-2xl">
            <Percent size={24}/>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-gray-800 dark:text-white">{myStats.winRate}%</p>
            <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Win Rate</p>
          </div>
        </div>
      </div>

      {/* Main Actions */}
      <div className="grid gap-4">
        <motion.button 
          whileTap={{ scale: 0.96 }}
          onClick={() => { triggerHaptic('medium'); setPhase('CREATE'); }}
          className="group bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border-2 border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all text-left relative overflow-hidden shadow-xl shadow-orange-500/10"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
            <Zap size={100} />
          </div>
          <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <UserPlus size={28}/>
          </div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white">Create Battle</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">Challenge friends with custom quiz settings and dominate the arena.</p>
          <div className="mt-6 flex items-center gap-2 text-orange-600 font-black text-xs uppercase tracking-widest">
            Start Now <MoveRight size={14} />
          </div>
        </motion.button>

        <motion.button 
          whileTap={{ scale: 0.96 }}
          onClick={() => { triggerHaptic('medium'); setPhase('JOIN'); }}
          className="group bg-gray-900 dark:bg-white p-8 rounded-[2.5rem] text-white dark:text-gray-900 hover:shadow-2xl transition-all text-left relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
            <Swords size={100} />
          </div>
          <div className="w-14 h-14 bg-white/20 dark:bg-gray-200 rounded-2xl flex items-center justify-center mb-6">
            <Swords size={28}/>
          </div>
          <h3 className="text-2xl font-black">Join Room</h3>
          <p className="text-sm opacity-70 mt-2 leading-relaxed">Enter a room code to join an existing battle and prove your skills.</p>
          <div className="mt-6 flex items-center gap-2 text-white dark:text-gray-900 font-black text-xs uppercase tracking-widest opacity-80">
            Enter Code <MoveRight size={14} />
          </div>
        </motion.button>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="flex flex-col h-full space-y-6 pb-32">
        <div className="flex justify-between items-center pt-2">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Match History</h2>
            <button className="p-2 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
                <Search size={20} className="text-gray-400" />
            </button>
        </div>
        
        <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white dark:bg-zinc-900 p-5 rounded-[2rem] border border-gray-100 dark:border-zinc-800 flex items-center justify-between hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all cursor-pointer active:scale-[0.98] shadow-sm"
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${i % 2 === 0 ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>
                            {i % 2 === 0 ? <Trophy size={20} /> : <XCircle size={20} />}
                        </div>
                        <div>
                            <h3 className="font-black text-sm text-gray-900 dark:text-white">Physics Battle</h3>
                            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">21 Mar, 2024 • 10:30 AM</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className={`text-sm font-black ${i % 2 === 0 ? 'text-orange-500' : 'text-red-500'}`}>
                            {i % 2 === 0 ? '+25 XP' : '-10 XP'}
                        </span>
                        <p className="text-[12px] text-gray-500 font-mono uppercase tracking-widest">Rank #1</p>
                    </div>
                </motion.div>
            ))}
        </div>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="flex flex-col h-full pb-32">
        <div className="bg-gradient-to-b from-orange-500/10 to-transparent rounded-b-[3rem] mb-4 pt-2">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Leaderboard</h2>
                <div className="bg-orange-500/20 p-2 rounded-xl">
                    <Trophy size={24} className="text-orange-500" />
                </div>
            </div>
            
            {/* Top 3 Podium */}
            <div className="flex items-end justify-center gap-4 py-4">
                <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                        <img src="https://picsum.photos/seed/p2/100" className="w-14 h-14 rounded-full border-2 border-gray-300 p-0.5" alt=""/>
                        <div className="absolute -bottom-1 -right-1 bg-gray-400 text-white text-[12px] font-bold w-5 h-5 rounded-full flex items-center justify-center">2</div>
                    </div>
                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
                </div>
                <div className="flex flex-col items-center gap-2 -mt-4">
                    <div className="relative">
                        <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-500 animate-bounce" size={24} />
                        <img src="https://picsum.photos/seed/p1/100" className="w-20 h-20 rounded-full border-4 border-yellow-500 p-1" alt=""/>
                        <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-black text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">1</div>
                    </div>
                    <div className="h-16 w-16 bg-yellow-500/20 rounded-t-xl"></div>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                        <img src="https://picsum.photos/seed/p3/100" className="w-14 h-14 rounded-full border-2 border-orange-600 p-0.5" alt=""/>
                        <div className="absolute -bottom-1 -right-1 bg-orange-600 text-white text-[12px] font-bold w-5 h-5 rounded-full flex items-center justify-center">3</div>
                    </div>
                    <div className="h-10 w-12 bg-orange-600/20 rounded-t-lg"></div>
                </div>
            </div>
        </div>

        <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-5 rounded-[2rem] flex items-center justify-between transition-all ${i === 1 ? 'bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800' : 'bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm'}`}
                >
                    <div className="flex items-center gap-4">
                        <span className="font-mono font-bold text-gray-400 w-4">{i}</span>
                        <img src={`https://picsum.photos/seed/user${i}/100`} className="w-10 h-10 rounded-full bg-gray-100 object-cover" alt=""/>
                        <div>
                            <h3 className="font-black text-sm text-gray-900 dark:text-white">Player {i}</h3>
                            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Level {10 + i}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-sm font-black text-orange-600">{2500 - i * 100} pts</span>
                    </div>
                </motion.div>
            ))}
        </div>
    </div>
  );

  const renderLobbyPlayers = () => {
    if (!battleState) return null;
    const players = Object.values(battleState.players) as BattlePlayer[];
    const host = players.find(p => p.uid === battleState.hostId);
    const guest = players.find(p => p.uid !== battleState.hostId);

    return (
      <div className="flex items-center justify-around gap-8 py-16 relative">
        {/* VS Badge in middle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <motion.div 
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            className="w-20 h-20 bg-white dark:bg-zinc-900 rounded-[1.5rem] flex items-center justify-center shadow-2xl border-4 border-orange-500 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent"></div>
            <span className="text-3xl font-black italic text-orange-600 relative z-10">VS</span>
            <motion.div 
                animate={{ x: [-100, 100] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
            />
          </motion.div>
        </div>

        {/* Host Card */}
        <div className="flex flex-col items-center gap-6 group relative z-10">
          <div className="relative">
            <motion.div 
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 2, 0]
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-32 h-32 md:w-40 md:h-40 rounded-[3rem] border-4 border-blue-500 p-2 shadow-2xl shadow-blue-500/30 bg-white dark:bg-zinc-900 relative overflow-hidden"
            >
              <img src={host?.avatar || userAvatar} className="w-full h-full rounded-[2.5rem] object-cover" alt="Host"/>
              <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent"></div>
            </motion.div>
            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="absolute -top-4 -right-4 bg-blue-500 text-white p-3 rounded-2xl shadow-xl z-20"
            >
              <Crown size={20} fill="currentColor"/>
            </motion.div>
          </div>
          <div className="text-center">
            <p className="font-black text-gray-900 dark:text-white text-xl mb-1">{host?.name || 'You'}</p>
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[12px] font-black uppercase tracking-[0.15em] rounded-full border border-blue-100 dark:border-blue-800/50">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                Host
            </div>
          </div>
        </div>

        {/* Guest Card */}
        <div className="flex flex-col items-center gap-6 relative z-10">
          {guest ? (
            <>
              <motion.div 
                initial={{ opacity: 0, x: 40, rotate: 5 }}
                transition={{ 
                    y: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 },
                    rotate: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }
                }}
                animate={{ 
                    opacity: 1, 
                    x: 0,
                    y: [0, -10, 0],
                    rotate: [0, -2, 0]
                }}
                className="w-32 h-32 md:w-40 md:h-40 rounded-[3rem] border-4 border-orange-500 p-2 shadow-2xl shadow-orange-500/30 bg-white dark:bg-zinc-900 relative overflow-hidden"
              >
                <img src={guest.avatar} className="w-full h-full rounded-[2.5rem] object-cover" alt="Guest"/>
                <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent"></div>
              </motion.div>
              <div className="text-center">
                <p className="font-black text-gray-900 dark:text-white text-xl mb-1">{guest.name}</p>
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[12px] font-black uppercase tracking-[0.15em] rounded-full border border-orange-100 dark:border-orange-800/50">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
                    Challenger
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.1, 1],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 bg-orange-500 rounded-full blur-2xl"
                    ></motion.div>
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-[3rem] border-4 border-dashed border-gray-300 dark:border-zinc-800 flex items-center justify-center bg-gray-50/50 dark:bg-zinc-900/50 backdrop-blur-sm relative z-10">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                            <UserPlus size={32} strokeWidth={1.5} className="animate-pulse"/>
                            <span className="text-[12px] font-black uppercase tracking-widest">Waiting</span>
                        </div>
                    </div>
                </div>
                <div className="text-center">
                    <p className="font-black text-gray-300 dark:text-gray-600 text-xl">Searching...</p>
                    <div className="mt-2 flex justify-center gap-1">
                        {[0, 1, 2].map(i => (
                            <motion.div 
                                key={i}
                                animate={{ opacity: [0.2, 1, 0.2] }}
                                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                className="w-1.5 h-1.5 bg-orange-500 rounded-full"
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
    // Find chapters based on selected subject
    const selectedSubjectKey = Object.keys(SYLLABUS_DB).find(key => key.includes(config.subjects[0]));
    const chapters = selectedSubjectKey ? Object.keys(SYLLABUS_DB[selectedSubjectKey]) : [];

    return (
        <div className="space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
            {/* 1. Subject Selection Grid */}
            <div>
                <label className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block flex items-center gap-2">
                    <Layers size={14}/> Choose Subject
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {BATTLE_SUBJECTS.map(subj => {
                        const isSelected = config.subjects.includes(subj.id);
                        return (
                            <button
                                key={subj.id}
                                onClick={() => {
                                  triggerHaptic('light');
                                  setConfig({ ...config, subjects: [subj.id], chapters: ['Full Syllabus'] });
                                }}
                                className={`relative p-4 rounded-3xl border-2 transition-all flex items-center gap-4 group ${isSelected ? `${subj.bg} ${subj.border} ring-4 ring-orange-500/10` : 'bg-gray-50 dark:bg-black/50 border-transparent hover:border-gray-200 dark:hover:border-gray-700'}`}
                            >
                                <div className={`p-3 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm transition-transform group-hover:scale-110 ${isSelected ? 'scale-110' : ''}`}>
                                    <subj.icon className={subj.color} size={20} />
                                </div>
                                <span className={`text-sm font-black ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{subj.label}</span>
                                {isSelected && <div className="absolute top-2 right-2 text-orange-600"><CheckCircle size={16} fill="currentColor" className="text-white"/></div>}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* 2. Chapter Selection */}
            {config.subjects.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <label className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block flex items-center gap-2">
                        <BookOpen size={14}/> Select Chapters
                    </label>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => { triggerHaptic('light'); setConfig({ ...config, chapters: ['Full Syllabus'] }); }}
                            className={`px-5 py-3 rounded-2xl text-xs font-black border transition-all ${config.chapters.includes('Full Syllabus') ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white' : 'bg-white dark:bg-zinc-900 text-gray-500 border-gray-100 dark:border-zinc-800 hover:border-gray-300'}`}
                        >
                            Full Syllabus
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
                                    className={`px-5 py-3 rounded-2xl text-xs font-black border transition-all ${isChapSelected ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800' : 'bg-white dark:bg-zinc-900 text-gray-500 border-gray-100 dark:border-zinc-800 hover:border-gray-300'}`}
                                >
                                    {chap}
                                </button>
                            )
                        })}
                    </div>
                </motion.div>
            )}

            {/* 3. Game Settings */}
            <div className="bg-gray-50 dark:bg-black/50 p-6 rounded-[2rem] border border-gray-100 dark:border-zinc-800 space-y-6">
                <div>
                    <div className="flex justify-between mb-4">
                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2"><Hash size={14}/> Questions</span>
                        <span className="text-sm font-black text-orange-600">{config.questionCount}</span>
                    </div>
                    <input 
                        type="range" min="5" max="20" step="5"
                        value={config.questionCount}
                        onChange={(e) => setConfig({...config, questionCount: parseInt(e.target.value)})}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                </div>

                <div>
                    <div className="flex justify-between mb-4">
                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2"><Clock size={14}/> Time Limit</span>
                        <span className="text-sm font-black text-orange-600">{config.timePerQuestion}s</span>
                    </div>
                    <input 
                        type="range" min="10" max="60" step="5"
                        value={config.timePerQuestion}
                        onChange={(e) => setConfig({...config, timePerQuestion: parseInt(e.target.value)})}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                </div>
            </div>

            <button 
                onClick={handleCreate} 
                className="w-full py-5 rounded-[2rem] bg-gradient-to-r from-orange-600 to-red-600 text-white font-black text-lg shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
                <Zap fill="currentColor"/> Create Battle Room
            </button>
        </div>
    );
  };

  const renderJoin = () => (
    <div className="space-y-8">
        <div>
            <label className="block text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 text-center">Enter 6-Digit Room Code</label>
            <input 
                type="text" 
                value={inputRoomId}
                onChange={e => setInputRoomId(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="w-full p-8 text-5xl font-mono text-center tracking-[0.3em] rounded-[2.5rem] bg-gray-50 dark:bg-black border-4 border-dashed border-gray-200 dark:border-zinc-800 focus:border-orange-500 focus:bg-white outline-none dark:text-white transition-all"
            />
        </div>
        <button 
          onClick={handleJoin} 
          disabled={inputRoomId.length < 4}
          className="w-full py-5 rounded-[2rem] bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black text-lg shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
        >
          Join Arena
        </button>
    </div>
  );

  if (phase === 'MENU' || phase === 'CREATE' || phase === 'JOIN') return (
    <div className="h-full bg-gray-50 dark:bg-black relative overflow-hidden">
      <div className="h-full overflow-y-auto p-6 md:p-8 max-w-4xl mx-auto no-scrollbar">
        <AnimatePresence mode="wait">
          {subPhase === 'HOME' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              {renderHome()}
            </motion.div>
          )}
          {subPhase === 'HISTORY' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              {renderHistory()}
            </motion.div>
          )}
          {subPhase === 'LEADERBOARD' && (
            <motion.div 
              key="leaderboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              {renderLeaderboard()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {renderBottomNav()}

      {/* Create Bottom Sheet Overlay */}
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
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full md:max-w-xl bg-white dark:bg-zinc-900 rounded-t-[3rem] p-8 shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-8"></div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white">Create Battle</h2>
                <button onClick={() => setPhase('MENU')} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500">
                  <X size={24} />
                </button>
              </div>
              {loading ? (
                <div className="py-20 flex justify-center">
                  <Loader2 className="animate-spin text-orange-500" size={48} />
                </div>
              ) : renderCreate()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Bottom Sheet Overlay */}
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
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full md:max-w-xl bg-white dark:bg-zinc-900 rounded-t-[3rem] p-8 shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-8"></div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white">Join Battle</h2>
                <button onClick={() => setPhase('MENU')} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500">
                  <X size={24} />
                </button>
              </div>
              {loading ? (
                <div className="py-20 flex justify-center">
                  <Loader2 className="animate-spin text-orange-500" size={48} />
                </div>
              ) : renderJoin()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (phase === 'LOBBY') return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-gray-50 dark:bg-black animate-in fade-in pb-10 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <AnimatePresence>
            {showVersus && <VersusOverlay />}
        </AnimatePresence>

        {/* Header */}
        <div className="p-6 text-center relative z-10">
            <div className="inline-block px-4 py-1.5 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-full border border-white/20 dark:border-zinc-800/30 mb-4">
                <p className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">Battle Room</p>
            </div>
            <h1 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">ROOM CODE</h1>
            <button 
                onClick={() => { 
                    triggerHaptic('medium');
                    navigator.clipboard.writeText(roomId); 
                    showToast("Code Copied!", "success"); 
                }}
                className="group relative inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl shadow-black/5 border border-gray-100 dark:border-zinc-800 active:scale-95 transition-all"
            >
                <span className="text-3xl font-mono font-black text-orange-600 dark:text-orange-500 tracking-wider">{roomId}</span>
                <Copy size={20} className="text-gray-400 group-hover:text-orange-500 transition-colors"/>
            </button>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 relative z-10">
            {renderLobbyPlayers()}
        </div>

        <div className="p-6 pb-20 text-center space-y-6 relative z-10">
            {battleState?.hostId === currentUser?.uid ? (
                <motion.button 
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                        triggerHaptic('heavy');
                        startRTDBBattle(roomId);
                    }} 
                    disabled={!battleState || Object.keys(battleState.players).length < 2} 
                    className="w-full py-5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-orange-500/30 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed transition-all"
                >
                    {(!battleState || Object.keys(battleState.players).length < 2) ? (
                        <div className="flex items-center gap-3">
                            <Loader2 className="animate-spin" size={24} />
                            <span>WAITING FOR OPPONENT</span>
                        </div>
                    ) : (
                        <><Swords size={26} className="animate-bounce"/> START BATTLE</>
                    )}
                </motion.button>
            ) : (
                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/20 dark:border-zinc-800/30 flex flex-col items-center justify-center gap-4 shadow-xl">
                    <div className="relative">
                        <div className="absolute inset-0 bg-orange-500 rounded-full blur-lg opacity-20 animate-pulse"></div>
                        <Loader2 className="animate-spin text-orange-500 relative z-10" size={32} />
                    </div>
                    <p className="font-black text-gray-500 dark:text-gray-400 tracking-wide">WAITING FOR HOST TO START...</p>
                </div>
            )}
            <button 
                onClick={() => {
                    triggerHaptic('light');
                    handleLeave();
                }} 
                className="px-6 py-2 text-gray-400 text-sm font-black uppercase tracking-widest hover:text-red-500 transition-colors active:scale-95"
            >
                Leave Room
            </button>
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
        <div className="fixed inset-0 z-[200] flex flex-col bg-gray-50 dark:bg-black overflow-hidden relative">
            {/* Timer Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-100 dark:bg-zinc-900 z-[70]">
                <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timeLeft / battleState.config.timePerQuestion) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'linear' }}
                    className={`h-full ${timeLeft < 5 ? 'bg-red-500' : 'bg-orange-500'}`}
                />
            </div>

            {/* Reactions Overlay */}
            <div className="fixed inset-0 pointer-events-none z-[60]">
                {activeReactions.map(r => (
                    <div key={r.id} className="absolute bottom-24 left-1/2 -translate-x-1/2 animate-[reactionFly_2s_ease-out_forwards] text-6xl">
                        {r.emoji}
                    </div>
                ))}
            </div>

            {/* Top Bar: Players & Stats */}
            <div className="p-4 pt-8 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/20 dark:border-zinc-800/30 shadow-lg">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 font-black text-white">
                        {currentQIndex + 1}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Question</span>
                        <span className="text-sm font-black text-gray-900 dark:text-white">of {battleState?.questions.length}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {streak >= 3 && (
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="px-4 py-2 bg-orange-500 text-white rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg shadow-orange-500/20"
                        >
                            <Flame size={16} fill="currentColor" className="animate-bounce"/> {streak} STREAK
                        </motion.div>
                    )}
                    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl px-5 py-2 rounded-2xl border border-white/20 dark:border-zinc-800/30 shadow-lg">
                        <span className={`text-2xl font-mono font-black ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-gray-800 dark:text-white'}`}>
                            {timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                        </span>
                    </div>
                </div>
            </div>

            {/* Question Area */}
            <div className="flex-1 overflow-y-auto px-4 pb-40 no-scrollbar relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-zinc-800 mb-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500 opacity-50"></div>
                    
                    {question.contextText && (
                        <div className={`mb-6 p-4 bg-orange-50/50 dark:bg-orange-900/10 rounded-2xl border border-orange-100/50 dark:border-orange-800/30 text-sm md:text-base leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap ${getFont(question.contextText)}`}>
                            <div dangerouslySetInnerHTML={{ __html: question.contextText }} />
                            {question.contextImage && (
                                <img src={question.contextImage} alt="Context" className="mt-4 rounded-xl max-h-48 object-contain mx-auto border bg-white" referrerPolicy="no-referrer" />
                            )}
                        </div>
                    )}
                    
                    <h2 className={`text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-relaxed text-center whitespace-pre-wrap ${getFont(question.question)}`}>
                        <div dangerouslySetInnerHTML={{ __html: question.question }} />
                    </h2>
                    
                    {question.questionImage && (
                        <img src={question.questionImage} alt="Question" className="mt-6 rounded-xl max-h-48 object-contain mx-auto border bg-white" referrerPolicy="no-referrer" />
                    )}
                </motion.div>

                <div className="grid gap-4">
                    <AnimatePresence mode="popLayout">
                        {question.options.map((opt, idx) => {
                            const isSelected = selectedOption === idx;
                            const isCorrect = idx === Number(question.correctAnswerIndex);
                            const isDisabled = disabledOptions.includes(idx);
                            
                            let btnClass = "bg-white dark:bg-zinc-900 border-2 border-gray-100 dark:border-zinc-800 text-gray-700 dark:text-gray-200 shadow-md";
                            
                            if (hasAnswered) {
                                if (isSelected) {
                                    btnClass = isCorrect 
                                        ? "bg-green-500 border-green-500 text-white shadow-xl shadow-green-500/30 scale-[1.02]" 
                                        : "bg-red-500 border-red-500 text-white shadow-xl shadow-red-500/30 scale-[1.02]";
                                } else if (isCorrect) {
                                    btnClass = "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400";
                                } else {
                                    btnClass = "opacity-40 scale-95";
                                }
                            } else if (isDisabled) {
                                btnClass = "opacity-20 grayscale pointer-events-none";
                            }

                            return (
                                <motion.button
                                    key={idx}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.08 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => {
                                        triggerHaptic('medium');
                                        handleAnswer(idx);
                                    }}
                                    disabled={hasAnswered || isDisabled}
                                    className={`w-full p-5 rounded-[1.5rem] font-black text-lg transition-all flex items-center justify-between group ${btnClass} ${hasAnswered && isSelected && !isCorrect ? 'animate-shake' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black border-2 ${isSelected ? 'bg-white/20 border-white' : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <div className={`flex flex-col gap-2`}>
                                            <span className={`text-[15px] md:text-base whitespace-pre-wrap ${getFont(opt)}`}><div dangerouslySetInnerHTML={{ __html: opt }} /></span>
                                            {question.optionsImages?.[idx] && (
                                                <img src={question.optionsImages[idx]} alt={`Option ${idx}`} className="h-16 w-fit object-contain rounded border self-start bg-white" referrerPolicy="no-referrer" />
                                            )}
                                        </div>
                                    </div>
                                    {hasAnswered && isSelected && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                            {isCorrect ? <CheckCircle size={24} className="text-white"/> : <XCircle size={24} className="text-white"/>}
                                        </motion.div>
                                    )}
                                </motion.button>
                            )
                        })}
                    </AnimatePresence>
                </div>

                {/* Status Indicator */}
                {hasAnswered && opponent && !opponent.answers?.[currentQIndex] && (
                    <div className="text-center mt-8 p-4 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-zinc-800/30 animate-pulse">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Waiting for opponent...</p>
                    </div>
                )}

                {/* Host Control: Next Question */}
                {bothAnswered && battleState?.hostId === currentUser?.uid && (
                    <div className="fixed bottom-32 left-0 right-0 flex justify-center z-50 animate-in slide-in-from-bottom-4">
                        <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                triggerHaptic('medium');
                                skipToNextQuestion();
                            }}
                            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-10 py-4 rounded-[2rem] font-black shadow-2xl flex items-center gap-3 hover:scale-105 transition-all"
                        >
                            NEXT QUESTION <MoveRight size={20}/>
                        </motion.button>
                    </div>
                )}
            </div>

            {/* Bottom HUD: Opponent & Power-ups */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent z-50">
                <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
                    {/* Opponent Status */}
                    <div className="flex-1 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-3 rounded-[2rem] border border-white/20 dark:border-zinc-800/30 shadow-xl flex items-center gap-3">
                        <div className="relative">
                            <img src={opponent?.avatar || userAvatar} className="w-10 h-10 rounded-full border-2 border-orange-500 p-0.5" alt=""/>
                            {opponent?.answers?.[currentQIndex] !== undefined && (
                                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white dark:border-zinc-800">
                                    <Check size={8} className="text-white" strokeWidth={4}/>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest truncate">{opponent?.name || 'Opponent'}</p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <motion.div 
                                        animate={{ width: `${(opponent?.score || 0) / 5000 * 100}%` }}
                                        className="h-full bg-orange-500"
                                    />
                                </div>
                                <span className="text-xs font-black text-orange-600">{opponent?.score || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Power-ups */}
                    <div className="flex gap-2">
                        <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={() => { triggerHaptic('medium'); usePowerUp('50-50'); }}
                            disabled={hasAnswered || powerUpsUsed.includes('50-50')}
                            className="w-14 h-14 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 dark:border-zinc-800 disabled:opacity-30 active:bg-orange-50 transition-colors"
                        >
                            <Zap size={24} className="text-orange-500" />
                        </motion.button>
                        <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={() => { triggerHaptic('medium'); setShowReactions(!showReactions); }}
                            className="w-14 h-14 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 dark:border-zinc-800 active:bg-orange-50 transition-colors"
                        >
                            <Smile size={24} className="text-blue-500" />
                        </motion.button>
                    </div>
                </div>

                {/* Reactions Picker */}
                <AnimatePresence>
                    {showReactions && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.8 }}
                            className="absolute bottom-24 right-6 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl p-4 rounded-[2rem] shadow-2xl border border-white/20 dark:border-zinc-800/30 flex gap-3"
                        >
                            {['🔥', '😎', '🤔', '😂', '👏', '💔'].map(emoji => (
                                <button 
                                    key={emoji} 
                                    onClick={() => {
                                        triggerHaptic('light');
                                        sendReaction(emoji);
                                        setShowReactions(false);
                                    }}
                                    className="text-3xl hover:scale-125 active:scale-90 transition-transform"
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
    const sorted = React.useMemo(() => {
        return (Object.values(battleState?.players || {}) as BattlePlayer[]).sort((a,b) => b.score - a.score);
    }, [battleState?.players]);
    
    const winner = sorted[0];
    const isWinner = winner?.uid === currentUser?.uid;

    return (
        <div className="fixed inset-0 z-[200] flex flex-col bg-[#0F172A] text-white p-6 items-center justify-center overflow-y-auto relative pb-20 will-change-transform">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
            
            {isWinner && showConfetti && <Confetti />}
            
            <AnimatePresence mode="wait">
                {!showComparison ? (
                    <motion.div 
                        key="results"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="relative z-10 w-full max-w-sm text-center"
                    >
                        {/* Winner Avatar */}
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="relative inline-block mb-8"
                        >
                            <div className="absolute inset-0 bg-yellow-500 blur-[60px] opacity-40 animate-pulse"></div>
                            <Crown size={48} className="absolute -top-10 left-1/2 -translate-x-1/2 text-yellow-400 fill-yellow-400 animate-bounce" />
                            <div className="w-32 h-32 rounded-full p-1.5 bg-gradient-to-tr from-yellow-300 via-yellow-500 to-orange-500 shadow-2xl relative z-10">
                                <img src={winner.avatar} className="w-full h-full rounded-full object-cover border-4 border-[#0F172A]" alt={winner.name} />
                            </div>
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-[#0F172A] px-4 py-1 rounded-full font-black text-xs uppercase tracking-widest shadow-lg border-2 border-[#0F172A]">
                                Winner
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h1 className="text-3xl font-black mb-2">{isWinner ? 'Victory!' : 'Game Over'}</h1>
                            <p className="text-gray-400 text-sm mb-10">{isWinner ? 'You conquered the arena!' : 'Better luck next time!'}</p>
                        </motion.div>

                        {/* Stats Card */}
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 mb-8"
                        >
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
                        </motion.div>

                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="flex flex-col gap-3"
                        >
                            <button onClick={() => setShowComparison(true)} className="w-full py-4 bg-orange-600 hover:bg-orange-500 rounded-2xl font-bold text-sm transition-colors shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2">
                                <Eye size={18} /> প্রশ্ন ও উত্তর দেখুন (Analysis)
                            </button>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={resetToMenu} className="py-4 bg-gray-800 hover:bg-gray-700 rounded-2xl font-bold text-sm transition-colors border border-gray-700">Main Menu</button>
                                <button 
                                    onClick={handleRematch} 
                                    disabled={loading}
                                    className="py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-sm transition-colors border border-white/10 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin mx-auto" size={18}/> : 'Rematch'}
                                </button>
                            </div>
                            <button className="w-full py-4 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-2xl font-bold text-sm transition-colors border border-blue-500/30 flex items-center justify-center gap-2">
                                <Share2 size={18} /> বন্ধুদের সাথে শেয়ার করুন
                            </button>
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="analysis"
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed inset-0 z-[210] bg-[#0F172A] flex flex-col"
                    >
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
                                <motion.div 
                                    key={idx} 
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="bg-white/5 p-5 rounded-3xl border border-white/10"
                                >
                                    <div className="flex gap-3 mb-4">
                                        <span className="font-black text-white/20 text-xl font-mono">{String(idx+1).padStart(2,'0')}</span>
                                        <div className="flex-1">
                                            {q.contextText && (
                                                <div className={`mb-3 p-3 bg-white/5 rounded-xl border border-white/10 text-sm opacity-80 whitespace-pre-wrap ${getFont(q.contextText)}`}>
                                                    <div dangerouslySetInnerHTML={{ __html: q.contextText }} />
                                                    {q.contextImage && (
                                                        <img src={q.contextImage} alt="Context" className="mt-3 rounded-lg max-h-32 object-contain border bg-white" referrerPolicy="no-referrer" />
                                                    )}
                                                </div>
                                            )}
                                            <h3 className={`font-bold text-white text-base leading-relaxed whitespace-pre-wrap ${getFont(q.question)}`}>
                                                <div dangerouslySetInnerHTML={{ __html: q.question }} />
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
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold border ${isCorrect ? 'border-green-500 text-green-400' : 'border-white/20 text-white/40'}`}>
                                                            {['A','B','C','D'][oIdx]}
                                                        </div>
                                                        <div className={`flex flex-col gap-2 w-full pr-4`}>
                                                            <span className={`text-sm whitespace-pre-wrap ${isCorrect ? 'text-green-400 font-bold' : 'text-gray-300'} ${getFont(opt)}`}>
                                                                <div dangerouslySetInnerHTML={{ __html: opt }} />
                                                            </span>
                                                            {q.optionsImages?.[oIdx] && (
                                                                <img src={q.optionsImages[oIdx]} alt={`Option ${oIdx}`} className="h-12 w-fit object-contain rounded border self-start bg-white" referrerPolicy="no-referrer" />
                                                            )}
                                                        </div>
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
                                </motion.div>
                            ))}
                            
                            {/* Footer in Modal */}
                            <div className="text-center pt-8 pb-4 text-white/20 text-xs font-mono uppercase tracking-widest">
                                End of Analysis
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
