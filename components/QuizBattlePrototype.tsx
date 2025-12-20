
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Swords, Zap, Trophy, UserPlus, Loader2, Play, Copy, Clock, Users, XCircle, Crown, Eye, CheckCircle, X, ChevronDown, Check, Settings, ArrowRight, Timer, Share2, LogOut, Grid, User, BarChart2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SYLLABUS_DB } from '../services/syllabusData';
import { useToast } from './Toast';
import Confetti from './Confetti';
import { 
  createRTDBRoom, 
  joinRTDBRoom, 
  startRTDBBattle, 
  submitAnswerRTDB, 
  listenToBattleRoom, 
  finishRTDBBattle,
  deleteRTDBRoom,
  listenToServerOffset,
  BattleRoom,
  BattlePlayer
} from '../services/battleService';
import { generateQuizFromDB, updateQuestProgressAPI, saveExamResultAPI, sendNotificationAPI } from '../services/api'; 
import { useLocation } from 'react-router-dom';
import { QuizQuestion } from '../types';

// --- TYPES ---
interface BattleConfig {
  subjects: string[]; 
  chapters: string[];
  mode: '1v1' | '2v2' | 'FFA';
  questionCount: number;
  timePerQuestion: number;
  maxPlayers: number;
}

type Phase = 'MENU' | 'CREATE' | 'JOIN' | 'LOBBY' | 'GAME' | 'RESULT';

const QuizBattlePrototype: React.FC = () => {
  const { currentUser, userAvatar } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const opponentInfo = location.state?.opponent; 
  
  // --- STATE ---
  const [phase, setPhase] = useState<Phase>('MENU');
  const [loading, setLoading] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [battleState, setBattleState] = useState<BattleRoom | null>(null);
  const [inputRoomId, setInputRoomId] = useState('');
  const [showComparison, setShowComparison] = useState(false);
  
  // Time Sync State
  const [serverTimeOffset, setServerTimeOffset] = useState(0);

  // Config State
  const [config, setConfig] = useState<BattleConfig>({
    subjects: [],
    chapters: [], 
    mode: '1v1',
    questionCount: 5,
    timePerQuestion: 15,
    maxPlayers: 2
  });

  // --- SYNC WITH SERVER CLOCK ---
  useEffect(() => {
      // This calculates the difference between device time and server time
      const unsub = listenToServerOffset((offset) => {
          setServerTimeOffset(offset);
      });
      return () => unsub();
  }, []);

  useEffect(() => {
      if (opponentInfo && phase === 'MENU') {
          setPhase('CREATE');
          setConfig(prev => ({ ...prev, mode: '1v1', maxPlayers: 2 }));
      }
  }, [opponentInfo]);

  const availableChapters = useMemo(() => {
      if (config.subjects.length !== 1) return [];
      const subject = config.subjects[0];
      return SYLLABUS_DB[subject] ? Object.keys(SYLLABUS_DB[subject]) : [];
  }, [config.subjects]);

  // Game Play State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [startCountdown, setStartCountdown] = useState<number | null>(null);
  const [waitingForOthers, setWaitingForOthers] = useState(false);
  
  // --- REALTIME LISTENER ---
  useEffect(() => {
    let unsubscribe: () => void;

    if (roomId) {
      setLoading(true);
      unsubscribe = listenToBattleRoom(
        roomId, 
        (data) => {
          setLoading(false);
          if (data) {
            setBattleState(data);
            
            // Phase Management
            if (data.status === 'WAITING' && phase !== 'LOBBY') setPhase('LOBBY');
            if (data.status === 'ACTIVE' && phase !== 'GAME') setPhase('GAME');
            if (data.status === 'FINISHED' && phase !== 'RESULT') setPhase('RESULT');
          } else {
            if (phase === 'GAME' || phase === 'LOBBY') {
              showToast("রুমটি হোস্ট দ্বারা বন্ধ করা হয়েছে।", "info");
              resetToMenu();
            }
          }
        },
        (error) => {
          setLoading(false);
          if (error.message.includes("permission_denied")) {
             showToast("ডাটাবেজ পারমিশন সমস্যা (Firebase Rules চেক করুন)", "error");
          } else {
             showToast("কানেকশন সমস্যা: " + error.message, "error");
          }
          resetToMenu();
        }
      );
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [roomId]);

  // --- WAITING LOGIC (Removed Auto-Skip) ---
  useEffect(() => {
    if (!battleState || battleState.status !== 'ACTIVE' || !currentUser) return;
    
    // Safety check for players
    const players = battleState.players ? Object.values(battleState.players) as BattlePlayer[] : [];
    const allAnswered = players.every(p => p.answers && p.answers[currentQIndex] !== undefined);

    if (hasAnswered && !allAnswered) {
        setWaitingForOthers(true);
    } else {
        setWaitingForOthers(false);
    }
  }, [battleState, currentQIndex, hasAnswered, currentUser]);


  // --- TIMER LOGIC (SYNCHRONIZED) ---
  useEffect(() => {
    let animationFrame: number;

    const updateGameLoop = () => {
      if (battleState && battleState.status === 'ACTIVE' && phase === 'GAME') {
          // KEY FIX: Use server corrected time
          const now = Date.now() + serverTimeOffset;
          const startTime = battleState.startTime;
          
          if (now < startTime) {
              const diff = Math.ceil((startTime - now) / 1000);
              setStartCountdown(diff > 0 ? diff : null);
              animationFrame = requestAnimationFrame(updateGameLoop);
              return;
          }
          setStartCountdown(null);

          const elapsedSeconds = (now - startTime) / 1000;
          const durationPerQ = battleState.config.timePerQuestion;
          const totalQuestions = battleState.questions.length;
          
          const calculatedIndex = Math.floor(elapsedSeconds / durationPerQ);
          
          if (calculatedIndex >= totalQuestions) {
             if (battleState.hostId === currentUser?.uid) {
                 finishRTDBBattle(roomId);
             }
          } else {
             const timeInCurrentQ = elapsedSeconds % durationPerQ;
             const remaining = Math.max(0, Math.ceil(durationPerQ - timeInCurrentQ));
             
             if (calculatedIndex !== currentQIndex) {
                 setCurrentQIndex(calculatedIndex);
                 setHasAnswered(false);
                 setSelectedOption(null);
                 setWaitingForOthers(false);
             }
             setTimeLeft(remaining);
          }
      }
      animationFrame = requestAnimationFrame(updateGameLoop);
    };

    animationFrame = requestAnimationFrame(updateGameLoop);
    return () => cancelAnimationFrame(animationFrame);
  }, [battleState, currentQIndex, phase, roomId, serverTimeOffset]);

  // --- SYNC RESULTS ---
  const hasSyncedRef = useRef(false);
  useEffect(() => {
      if (phase === 'RESULT' && battleState && currentUser && !hasSyncedRef.current) {
          hasSyncedRef.current = true;
          
          const players = battleState.players ? Object.values(battleState.players) as BattlePlayer[] : [];
          const me = players.find(p => p.uid === currentUser.uid);
          const opponent = players.find(p => p.uid !== currentUser.uid);
          
          if (me) {
              const isWin = me.score > (opponent?.score || 0);
              const resultData = {
                  subject: battleState.config.subjects[0] || 'General',
                  totalQuestions: battleState.questions.length,
                  correct: me.score / 50, 
                  wrong: 0, 
                  skipped: 0,
                  score: me.score,
                  topicStats: []
              };
              saveExamResultAPI(currentUser.uid, resultData).catch(err => console.error(err));
              updateQuestProgressAPI(currentUser.uid, 'PLAY_BATTLE', 1);
              if (isWin) updateQuestProgressAPI(currentUser.uid, 'WIN_BATTLE', 1);
          }
      }
  }, [phase, battleState]);

  // --- HANDLERS ---

  const resetToMenu = () => {
      setPhase('MENU');
      setRoomId('');
      setBattleState(null);
      setHasAnswered(false);
      setCurrentQIndex(0);
      hasSyncedRef.current = false;
      setShowComparison(false);
  };

  const toggleSelection = (item: string, list: string[], setList: (l: string[]) => void) => {
      let newList: string[];
      if (list.includes(item)) {
          newList = list.filter(i => i !== item);
      } else {
          newList = [...list, item];
      }
      setList(newList);
      if (newList.length !== 1) {
          setConfig(prev => ({ ...prev, subjects: newList, chapters: [] }));
      } else {
          setConfig(prev => ({ ...prev, subjects: newList }));
      }
  };

  const handleCreate = async () => {
    if (!currentUser) return;
    if (config.subjects.length === 0) return showToast("অন্তত একটি বিষয় নির্বাচন করুন", "warning");
    
    setLoading(true);
    try {
      let questions: QuizQuestion[] = [];
      const countPerSubject = Math.ceil(config.questionCount / config.subjects.length);
      
      const promises = config.subjects.map(subject => {
          let targetChapter = 'Full Syllabus';
          if (config.subjects.length === 1 && config.chapters.length > 0) {
              targetChapter = config.chapters[0];
          }
          return generateQuizFromDB({
              subject: subject,
              chapter: targetChapter,
              topics: [], 
              count: countPerSubject
          });
      });

      const results = await Promise.all(promises);
      questions = results.flat();
      questions = questions.sort(() => 0.5 - Math.random()).slice(0, config.questionCount);

      if (questions.length === 0) {
          throw new Error("প্রশ্ন ডাটাবেজে পাওয়া যায়নি। অন্য বিষয় বা অধ্যায় চেষ্টা করুন।");
      }
      
      const newRoomId = await createRTDBRoom(
          { uid: currentUser.uid, name: currentUser.displayName || 'Host', avatar: userAvatar },
          config,
          questions
      );
      
      setRoomId(newRoomId);

      if (opponentInfo) {
          await sendNotificationAPI({
              title: "⚔️ কুইজ ব্যাটল চ্যালেঞ্জ!",
              message: `${currentUser.displayName || 'একজন'} আপনাকে একটি ব্যাটল চ্যালেঞ্জ পাঠিয়েছে। কোড: ${newRoomId}`,
              type: "BATTLE_CHALLENGE",
              target: opponentInfo.uid,
              actionLink: "/battle",
              metadata: { roomId: newRoomId, mode: config.mode }
          });
          showToast(`${opponentInfo.name}-কে ইনভাইট পাঠানো হয়েছে!`, "success");
      }
    } catch (e: any) {
      console.error(e);
      showToast(e.message || "Failed to create room", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!currentUser || !inputRoomId) return;
    setLoading(true);
    try {
      await joinRTDBRoom(inputRoomId, {
          uid: currentUser.uid, 
          name: currentUser.displayName || 'Guest', 
          avatar: userAvatar
      });
      setRoomId(inputRoomId);
    } catch (e: any) {
      showToast(e.message || "রুম জয়েন করা যাচ্ছে না", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = async () => {
      if (!roomId) return;
      try {
          await startRTDBBattle(roomId);
      } catch (e) { showToast("শুরু করা যাচ্ছে না", "error"); }
  };

  const handleAnswer = (idx: number) => {
      if (hasAnswered || !battleState || !currentUser) return;
      setHasAnswered(true);
      setSelectedOption(idx);
      
      const q = battleState.questions[currentQIndex];
      const isCorrect = idx === Number(q.correctAnswerIndex);
      
      submitAnswerRTDB(roomId, currentUser.uid, currentQIndex, idx, isCorrect);
  };

  const handleLeaveAndCleanup = async () => {
      if (battleState?.hostId === currentUser?.uid) {
          await deleteRTDBRoom(roomId);
      }
      resetToMenu();
  };

  // --- RENDERERS ---

  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 animate-in fade-in bg-gray-50 dark:bg-gray-900">
        <div className="relative mb-6">
            <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-20 rounded-full"></div>
            <Swords size={64} className="text-orange-600 dark:text-orange-500 relative z-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 text-center">কুইজ ব্যাটল</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-center max-w-xs text-sm">রিয়েল-টাইম কুইজ খেলো। (ডাটাবেজ ভিত্তিক প্রশ্ন)</p>
        <div className="w-full max-w-xs space-y-3">
            <button onClick={() => setPhase('CREATE')} className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold text-base shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                <Zap size={18} fill="currentColor" /> নতুন রুম তৈরি করুন
            </button>
            <button onClick={() => setPhase('JOIN')} className="w-full py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white rounded-xl font-bold text-base hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2">
                <UserPlus size={18} /> জয়েন করুন
            </button>
        </div>
    </div>
  );

  const renderCreate = () => (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-6 animate-in slide-in-from-right-5">
        <div className="max-w-2xl mx-auto pb-20">
            <div className="flex items-center gap-2 mb-6">
                <button onClick={() => setPhase('MENU')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"><XCircle size={20} className="text-gray-500"/></button>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{opponentInfo ? `ব্যাটল কনফিগারেশন vs ${opponentInfo.name}` : 'ব্যাটল কনফিগারেশন'}</h2>
            </div>
            
            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2"><Trophy size={12}/> গেম মোড</h3>
                    <div className="grid grid-cols-3 gap-3">
                        <button onClick={() => setConfig({...config, mode: '1v1', maxPlayers: 2})} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${config.mode === '1v1' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-500'}`}><User size={20} /><span className="text-xs font-bold">1 vs 1</span></button>
                        <button onClick={() => setConfig({...config, mode: '2v2', maxPlayers: 4})} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${config.mode === '2v2' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-500'}`}><Users size={20} /><span className="text-xs font-bold">2 vs 2</span></button>
                        <button onClick={() => setConfig({...config, mode: 'FFA', maxPlayers: 10})} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${config.mode === 'FFA' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-500'}`}><Grid size={20} /><span className="text-xs font-bold">Free For All</span></button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2"><Settings size={12}/> বিষয় নির্বাচন</h3>
                    <div className="flex flex-wrap gap-2">
                        {Object.keys(SYLLABUS_DB).map(s => {
                            const isSelected = config.subjects.includes(s);
                            return (
                                <button key={s} onClick={() => toggleSelection(s, config.subjects, (l) => setConfig({...config, subjects: l}))} className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${isSelected ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-500 text-orange-700 dark:text-orange-400' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}>{s.split('(')[0]}</button>
                            )
                        })}
                    </div>
                </div>

                {config.subjects.length === 1 && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm animate-in fade-in">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">অধ্যায় (ঐচ্ছিক)</label>
                        <select className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-bold dark:text-white outline-none" onChange={(e) => setConfig({...config, chapters: [e.target.value]})} value={config.chapters[0] || 'Full Syllabus'}>
                            <option value="Full Syllabus">সম্পূর্ণ সিলেবাস (Full Syllabus)</option>
                            {availableChapters.map(c => (<option key={c} value={c}>{c}</option>))}
                        </select>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-center mb-2"><label className="text-xs font-bold text-gray-500 uppercase">সময় (প্রতি প্রশ্ন)</label><span className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">{config.timePerQuestion}s</span></div>
                        <input type="range" min="10" max="30" step="5" value={config.timePerQuestion} onChange={(e) => setConfig({...config, timePerQuestion: Number(e.target.value)})} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"/>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-center mb-2"><label className="text-xs font-bold text-gray-500 uppercase">প্রশ্ন সংখ্যা</label><span className="text-sm font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded">{config.questionCount}</span></div>
                        <input type="range" min="5" max="20" step="5" value={config.questionCount} onChange={(e) => setConfig({...config, questionCount: Number(e.target.value)})} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"/>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-t border-gray-200 dark:border-gray-800 flex justify-center md:static md:bg-transparent md:border-none md:mt-8">
                <button onClick={handleCreate} disabled={loading || config.subjects.length === 0} className="w-full max-w-md py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-base shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95">{loading ? <Loader2 className="animate-spin" /> : <><Zap size={18} fill="currentColor"/> {opponentInfo ? 'চ্যালেঞ্জ পাঠান' : 'ব্যাটল শুরু করুন'}</>}</button>
            </div>
        </div>
    </div>
  );

  const renderJoin = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 animate-in slide-in-from-right-10">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700">
            <button onClick={() => setPhase('MENU')} className="mb-6 text-gray-400 hover:text-gray-900 dark:hover:text-white font-bold text-sm">← ফিরে যান</button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">কোড দিয়ে জয়েন করুন</h2>
            <input type="text" value={inputRoomId} onChange={(e) => setInputRoomId(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} onKeyDown={(e) => { if (e.key === 'Enter' && inputRoomId.length === 6) handleJoin(); }} placeholder="000000" className="w-full p-4 text-center text-4xl font-mono font-bold tracking-[0.5em] border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none mb-6 bg-gray-50 dark:bg-gray-700 dark:text-white"/>
            <button onClick={handleJoin} disabled={loading || inputRoomId.length < 6} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">{loading ? <Loader2 className="animate-spin" /> : 'জয়েন রুম'}</button>
        </div>
    </div>
  );

  const renderLobby = () => {
    if (!battleState) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" size={40}/></div>;
    const isHost = battleState.hostId === currentUser?.uid;
    const players = battleState.players ? Object.values(battleState.players) as BattlePlayer[] : [];

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 animate-in fade-in h-full flex flex-col">
            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4 mb-6 md:mb-8">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 text-center md:text-left">ROOM CODE</p>
                    <div className="flex items-center gap-3">
                        <span className="text-4xl md:text-5xl font-mono font-bold text-orange-600 dark:text-orange-500">{roomId}</span>
                        <button onClick={() => { navigator.clipboard.writeText(roomId); showToast("Copied!"); }} className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-lg hover:bg-orange-100"><Copy size={20}/></button>
                    </div>
                </div>
                <div className="text-center md:text-right">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-bold text-sm"><Users size={16}/> {players.length} Players</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10 flex-1 content-start">
                {players.map((p) => (
                    <div key={p.uid} className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col items-center shadow-sm relative overflow-hidden group">
                        <div className="relative">
                            <img src={p.avatar} alt={p.name} className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-200 border-4 border-white dark:border-gray-700 shadow-md mb-3 object-cover" />
                            {p.uid === battleState.hostId && (<div className="absolute -top-1 -right-1 bg-yellow-400 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Host"><Crown size={12} fill="currentColor"/></div>)}
                        </div>
                        <p className="font-bold text-gray-800 dark:text-white text-center truncate w-full text-sm md:text-base">{p.name}</p>
                    </div>
                ))}
                {Array.from({length: Math.max(0, 2 - players.length)}).map((_, i) => (
                    <div key={i} className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex items-center justify-center p-6 min-h-[140px]"><p className="text-gray-400 text-sm font-bold animate-pulse">Waiting...</p></div>
                ))}
            </div>

            <div className="p-4 md:p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 sticky bottom-0 rounded-t-2xl md:static md:bg-transparent md:border-none">
                <div className="max-w-4xl mx-auto flex justify-center">
                    {isHost ? (
                        <button onClick={handleStartGame} disabled={players.length < 2} className="w-full md:w-auto px-8 md:px-12 py-3 md:py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-lg md:text-xl shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 transition-all active:scale-95"><Play fill="currentColor" /> ব্যাটল শুরু করুন</button>
                    ) : (
                        <div className="flex items-center gap-3 text-gray-500"><Loader2 className="animate-spin" /><span className="font-bold">হোস্টের জন্য অপেক্ষা করা হচ্ছে...</span></div>
                    )}
                </div>
            </div>
        </div>
    );
  };

  const renderGame = () => {
    if (!battleState || !battleState.questions[currentQIndex]) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-orange-500"/></div>;

    if (startCountdown !== null) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-gray-900 z-50">
                <div className="text-9xl font-bold text-white animate-ping">{startCountdown}</div>
                <div className="text-2xl text-gray-400 mt-4 font-bold">Battle Starting...</div>
            </div>
        )
    }

    const question = battleState.questions[currentQIndex];
    const totalQ = battleState.questions.length;
    const players = battleState.players ? (Object.values(battleState.players) as BattlePlayer[]).sort((a, b) => b.score - a.score) : [];

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
            <div className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-sm z-10 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">{currentQIndex + 1}/{totalQ}</span>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${timeLeft <= 5 ? 'bg-red-50 border-red-500 text-red-600 animate-pulse' : 'bg-gray-100 dark:bg-gray-700 border-transparent text-gray-700 dark:text-gray-200'}`}>
                    <Clock size={14}/> <span className="font-mono font-bold text-sm">{timeLeft}s</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20">
                <div className="max-w-2xl mx-auto">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mb-6 overflow-hidden">
                        <div className="h-full bg-orange-500 transition-all duration-1000 ease-linear" style={{ width: `${(timeLeft / battleState.config.timePerQuestion) * 100}%` }}></div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                        <h2 className="text-base md:text-lg font-bold text-gray-800 dark:text-white leading-relaxed">{question.question}</h2>
                    </div>

                    <div className="grid gap-3">
                        {question.options.map((opt: string, idx: number) => {
                            const isSelected = selectedOption === idx;
                            const isCorrect = idx === Number(question.correctAnswerIndex);
                            
                            let btnClass = "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200";
                            if (hasAnswered) {
                                if (isSelected) btnClass = isCorrect ? "bg-green-100 border-green-500 text-green-800" : "bg-red-100 border-red-500 text-red-800";
                                else if (isCorrect) btnClass = "bg-green-50 border-green-300 text-green-700";
                                else btnClass = "opacity-50 grayscale";
                            } else if (isSelected) {
                                btnClass = "bg-orange-600 text-white border-orange-600";
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(idx)}
                                    disabled={hasAnswered}
                                    className={`w-full p-4 rounded-xl border-2 text-left font-medium text-sm md:text-base flex items-center justify-between transition-all active:scale-[0.98] ${btnClass} shadow-sm`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${isSelected ? 'border-current' : 'border-gray-300 opacity-50'}`}>{['A','B','C','D'][idx]}</div>
                                        <span>{opt}</span>
                                    </div>
                                    {hasAnswered && isSelected && (isCorrect ? <CheckCircle size={18}/> : <XCircle size={18}/>)}
                                </button>
                            )
                        })}
                    </div>
                    {/* Waiting Message */}
                    {waitingForOthers && (
                        <div className="mt-6 text-center animate-in fade-in">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-bold text-gray-500 dark:text-gray-400">
                                <Loader2 className="animate-spin" size={14}/> অন্যদের জন্য অপেক্ষা করা হচ্ছে...
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Live Leaderboard */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 shrink-0 z-20">
                <div className="flex overflow-x-auto gap-3 no-scrollbar max-w-2xl mx-auto">
                    {players.map((p) => (
                        <div key={p.uid} className={`flex items-center gap-2 p-1.5 pr-3 rounded-full border min-w-[120px] ${p.uid === currentUser?.uid ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800' : 'bg-gray-50 border-gray-100 dark:bg-gray-700 dark:border-gray-600'}`}>
                            <img src={p.avatar} className="w-8 h-8 rounded-full bg-gray-200" />
                            <div className="flex flex-col leading-none">
                                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-200 truncate w-14">{p.name}</span>
                                <span className="text-xs font-bold text-orange-600">{p.score}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
  };

  const renderResult = () => {
    if (!battleState) return null;
    const sortedPlayers = battleState.players ? (Object.values(battleState.players) as BattlePlayer[]).sort((a, b) => b.score - a.score) : [];
    const winner = sortedPlayers[0];
    const isWinner = winner.uid === currentUser?.uid;

    if (showComparison) {
        return (
            <div className="h-full bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto">
                <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center mb-4">
                    <button onClick={() => setShowComparison(false)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                        <ArrowRight size={18} className="rotate-180"/> Back to Result
                    </button>
                    <h2 className="text-base font-bold text-gray-800 dark:text-white">Detailed Analysis</h2>
                </div>
                
                <div className="space-y-6 pb-20">
                    {battleState.questions.map((q, qIdx) => (
                        <div key={qIdx} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold text-gray-800 dark:text-white mb-3 text-sm">
                                <span className="text-gray-400 mr-2">{qIdx + 1}.</span> {q.question}
                            </h3>
                            <div className="space-y-2">
                                {q.options.map((opt, oIdx) => {
                                    const isCorrect = oIdx === Number(q.correctAnswerIndex);
                                    // Find who picked this option
                                    const pickers = sortedPlayers.filter(p => p.answers && p.answers[qIdx] === oIdx);
                                    
                                    return (
                                        <div key={oIdx} className={`p-3 rounded-lg border text-xs flex justify-between items-center ${isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800'}`}>
                                            <span className={`${isCorrect ? 'font-bold text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                                {opt} {isCorrect && <Check size={14} className="inline ml-1"/>}
                                            </span>
                                            <div className="flex -space-x-2">
                                                {pickers.map(p => (
                                                    <img key={p.uid} src={p.avatar} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800" title={p.name} />
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {isWinner && <Confetti />}
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-32">
                <div className="text-center mb-8 animate-in zoom-in duration-500">
                    <div className="relative inline-block mb-4">
                        <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-40 rounded-full animate-pulse"></div>
                        <img src={winner.avatar} className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-yellow-400 shadow-xl relative z-10 object-cover bg-white" />
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full font-bold text-xs shadow-lg z-20 flex items-center gap-1 whitespace-nowrap">
                            <Trophy size={12} fill="currentColor"/> WINNER
                        </div>
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-1">{winner.name}</h2>
                    <div className="flex items-center justify-center gap-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <span className="text-orange-600 font-bold">{winner.score} Pts</span>
                    </div>
                </div>

                <div className="w-full max-w-sm mx-auto bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden mb-6">
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {sortedPlayers.map((p, idx) => (
                            <div key={p.uid} className={`flex items-center justify-between p-4 ${p.uid === currentUser?.uid ? 'bg-orange-50 dark:bg-orange-900/10' : ''}`}>
                                <div className="flex items-center gap-3">
                                    <span className={`font-bold w-5 text-center text-sm ${idx === 0 ? 'text-yellow-500 text-lg' : 'text-gray-400'}`}>#{idx + 1}</span>
                                    <div className="flex items-center gap-2">
                                        <img src={p.avatar} className="w-8 h-8 rounded-full bg-gray-200" />
                                        <div>
                                            <p className="font-bold text-gray-800 dark:text-white text-xs">{p.name}</p>
                                            {p.uid === currentUser?.uid && <p className="text-[9px] text-orange-600 font-bold uppercase">You</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="font-mono font-bold text-gray-800 dark:text-white text-sm block">{p.score}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="flex justify-center">
                    <button 
                        onClick={() => setShowComparison(true)}
                        className="px-6 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                        <BarChart2 size={16}/> View Question Analysis
                    </button>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-t border-gray-200 dark:border-gray-800 md:static md:bg-transparent md:border-none flex flex-col gap-3 items-center">
                <button 
                    onClick={handleLeaveAndCleanup} 
                    className="w-full max-w-xs px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-200 dark:shadow-none transition-all active:scale-95"
                >
                    <LogOut size={18}/> Leave & Close Room
                </button>
            </div>
        </div>
    );
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 overflow-y-auto transition-colors">
        {phase === 'MENU' && renderMenu()}
        {phase === 'CREATE' && renderCreate()}
        {phase === 'JOIN' && renderJoin()} 
        {phase === 'LOBBY' && renderLobby()} 
        {phase === 'GAME' && renderGame()}
        {phase === 'RESULT' && renderResult()}
    </div>
  );
};

export default QuizBattlePrototype;
