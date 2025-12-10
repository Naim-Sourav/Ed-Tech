import React, { useState, useEffect, useRef } from 'react';
import { Swords, Zap, Trophy, UserPlus, Loader2, Play, Copy, Clock, Users, XCircle, Crown, Eye, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createBattleRoom, joinBattleRoom, getBattleState, submitBattleAnswer, startBattle } from '../services/api';
import { SYLLABUS_DB } from '../services/syllabusData';
import { useToast } from './Toast';
import Confetti from './Confetti';

// --- TYPES ---
interface BattlePlayer {
  uid: string;
  name: string;
  avatar: string;
  score: number;
  team: 'A' | 'B' | 'NONE';
  answers: Record<string, number>; 
}

interface BattleConfig {
  subject: string;
  chapter: string; 
  mode: '1v1' | '2v2' | 'FFA';
  questionCount: number;
  timePerQuestion: number;
}

interface BattleState {
  roomId: string;
  hostId: string;
  status: 'WAITING' | 'ACTIVE' | 'FINISHED';
  config: BattleConfig;
  questions: any[];
  players: BattlePlayer[];
  startTime?: number;
}

type Phase = 'MENU' | 'CREATE' | 'JOIN' | 'LOBBY' | 'GAME' | 'RESULT';

const QuizBattlePrototype: React.FC = () => {
  const { currentUser, userAvatar } = useAuth();
  const { showToast } = useToast();
  
  // --- STATE ---
  const [phase, setPhase] = useState<Phase>('MENU');
  const [loading, setLoading] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [inputRoomId, setInputRoomId] = useState('');
  const [showComparison, setShowComparison] = useState(false); // Result state
  
  // Config State
  const [config, setConfig] = useState<BattleConfig>({
    subject: Object.keys(SYLLABUS_DB)[0],
    chapter: '', 
    mode: '1v1',
    questionCount: 5,
    timePerQuestion: 15
  });

  const chapters = config.subject ? Object.keys(SYLLABUS_DB[config.subject] || {}) : [];

  useEffect(() => {
      if (chapters.length > 0) {
          // Default to Random or first chapter
          setConfig(prev => ({ ...prev, chapter: 'Random' }));
      }
  }, [config.subject]);

  // Game Play State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isQuestionReady, setIsQuestionReady] = useState(false);
  
  // --- POLLING EFFECT ---
  // Fetches fresh state every second if we are in a room
  useEffect(() => {
    let interval: any;
    
    const fetchLoop = async () => {
        if (!roomId) return;
        try {
            const state = await getBattleState(roomId);
            setBattleState(state);
            
            // Check questions loaded
            if (state.questions && state.questions.length > 0) {
                setIsQuestionReady(true);
            }
        } catch (e) {
            console.error("Polling error", e);
        }
    };

    if (roomId && (phase === 'LOBBY' || phase === 'GAME' || phase === 'RESULT')) {
        fetchLoop(); // Immediate call
        interval = setInterval(fetchLoop, 1000);
    }

    return () => clearInterval(interval);
  }, [roomId, phase]);

  // --- GAME LOGIC EFFECT ---
  useEffect(() => {
    if (!battleState) return;

    if (battleState.status === 'ACTIVE') {
        if (phase !== 'GAME') setPhase('GAME');
        
        if (battleState.startTime && battleState.questions.length > 0) {
            const now = Date.now();
            const safeStartTime = Math.min(now, battleState.startTime);
            const elapsedSeconds = (now - safeStartTime) / 1000;
            const durationPerQ = battleState.config.timePerQuestion;
            
            const calculatedIndex = Math.floor(elapsedSeconds / durationPerQ);
            
            // Check if game ended locally based on index
            if (calculatedIndex >= battleState.questions.length) {
               setTimeLeft(0);
               // Wait for server to set status to FINISHED (handled by backend now)
            } else {
               // Sync Time
               const timeInCurrentQ = elapsedSeconds % durationPerQ;
               const remaining = Math.max(0, Math.floor(durationPerQ - timeInCurrentQ));
               setTimeLeft(remaining);

               // Sync Question Index
               if (calculatedIndex !== currentQIndex) {
                   setCurrentQIndex(calculatedIndex);
                   // Reset for new question
                   setHasAnswered(false);
                   setSelectedOption(null);
               }
            }
        }
    } else if (battleState.status === 'FINISHED') {
        if (phase !== 'RESULT') {
            setPhase('RESULT');
            setShowComparison(false); // Reset view logic
        }
    }
  }, [battleState, currentQIndex, phase]); 

  // --- ACTIONS ---

  const handleCreate = async () => {
    if (!currentUser) return;
    if (!config.subject || !config.chapter) {
        showToast("বিষয় এবং অধ্যায় নির্বাচন করুন", "warning");
        return;
    }

    setLoading(true);
    try {
      // Handle Random Chapter Selection
      let finalChapter = config.chapter;
      if (finalChapter === 'Random') {
          const availableChapters = Object.keys(SYLLABUS_DB[config.subject]);
          finalChapter = availableChapters[Math.floor(Math.random() * availableChapters.length)];
      }

      const res = await createBattleRoom(currentUser.uid, currentUser.displayName || 'Host', userAvatar, { ...config, chapter: finalChapter });
      if (res && res.roomId) {
        setRoomId(res.roomId);
        setPhase('LOBBY');
      }
    } catch (e: any) {
      showToast(e.message || "রুম তৈরি করতে সমস্যা হয়েছে।", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!currentUser || !inputRoomId) return;
    setLoading(true);
    try {
      await joinBattleRoom(inputRoomId, currentUser.uid, currentUser.displayName || 'Player', userAvatar);
      setRoomId(inputRoomId);
      setPhase('LOBBY');
    } catch (e) {
      showToast("রুম খুঁজে পাওয়া যায়নি।", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    if (!currentUser || !roomId) return;
    try {
      await startBattle(roomId, currentUser.uid);
    } catch (e) {
      showToast("গেম শুরু করতে সমস্যা হয়েছে।", "error");
    }
  };

  const handleAnswer = async (idx: number) => {
    if (hasAnswered || !battleState || !currentUser) return;
    
    setHasAnswered(true); 
    setSelectedOption(idx);
    
    const currentQ = battleState.questions[currentQIndex];
    if (!currentQ) return;

    const isCorrect = idx === Number(currentQ.correctAnswerIndex);
    
    try {
      // Send selectedOption for comparison
      await submitBattleAnswer(roomId, currentUser.uid, isCorrect, currentQIndex, idx);
    } catch (e: any) {
      console.error("Answer submit failed", e);
    }
  };

  // --- RENDERERS ---

  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 animate-in fade-in">
        <div className="relative mb-8">
            <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 rounded-full"></div>
            <Swords size={80} className="text-orange-600 dark:text-orange-500 relative z-10" />
        </div>
        
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 text-center">কুইজ ব্যাটল</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10 text-center max-w-sm">
            বন্ধুদের সাথে লাইভ প্রতিযোগিতা। ডাটাবেস থেকে প্রশ্ন, রিয়েল-টাইম স্কোর।
        </p>

        <div className="w-full max-w-sm space-y-4">
            <button 
                onClick={() => setPhase('CREATE')}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
            >
                <Zap size={24} fill="currentColor" /> নতুন রুম তৈরি করুন
            </button>
            
            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">অথবা</span>
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
            </div>

            <button 
                onClick={() => setPhase('JOIN')}
                className="w-full py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white rounded-2xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-3"
            >
                <UserPlus size={24} /> জয়েন করুন
            </button>
        </div>
    </div>
  );

  const renderCreate = () => (
    <div className="max-w-2xl mx-auto p-6 animate-in slide-in-from-right-10">
        <button onClick={() => setPhase('MENU')} className="mb-6 text-gray-500 hover:text-gray-900 dark:hover:text-white font-bold flex items-center gap-2">
            <XCircle size={20} /> ফিরে যান
        </button>
        
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b pb-4 border-gray-100 dark:border-gray-700">ব্যাটল কনফিগারেশন</h2>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-500 uppercase mb-2">বিষয় (Subject)</label>
                    <select 
                        value={config.subject}
                        onChange={(e) => setConfig({...config, subject: e.target.value})}
                        className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                    >
                        {Object.keys(SYLLABUS_DB).map(s => (
                            <option key={s} value={s}>{s.split('(')[0]}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-500 uppercase mb-2">অধ্যায় (Chapter)</label>
                    <select 
                        value={config.chapter}
                        onChange={(e) => setConfig({...config, chapter: e.target.value})}
                        className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                    >
                        <option value="Random">🎲 Random Chapter (যেকোনো অধ্যায়)</option>
                        {chapters.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-500 uppercase mb-2">মোড</label>
                        <div className="flex gap-2">
                            {['1v1', '2v2', 'FFA'].map(m => (
                                <button
                                    key={m}
                                    onClick={() => setConfig({...config, mode: m as any})}
                                    className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${config.mode === m ? 'bg-orange-100 border-orange-500 text-orange-600' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-500 uppercase mb-2">সময় (সেকেন্ড)</label>
                        <select 
                            value={config.timePerQuestion}
                            onChange={(e) => setConfig({...config, timePerQuestion: Number(e.target.value)})}
                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
                        >
                            <option value="10">১০ সেকেন্ড</option>
                            <option value="15">১৫ সেকেন্ড</option>
                            <option value="20">২০ সেকেন্ড</option>
                            <option value="30">৩০ সেকেন্ড</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4">
                    <button 
                        onClick={handleCreate}
                        disabled={loading}
                        className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'রুম তৈরি করুন'}
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-2">বি:দ্র: ডাটাবেসে প্রশ্ন না থাকলে ব্যাটল তৈরি হবে না</p>
                </div>
            </div>
        </div>
    </div>
  );

  const renderJoin = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 animate-in slide-in-from-right-10">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700">
            <button onClick={() => setPhase('MENU')} className="mb-6 text-gray-400 hover:text-gray-900 dark:hover:text-white font-bold text-sm">← ফিরে যান</button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">কোড দিয়ে জয়েন করুন</h2>
            <p className="text-gray-500 text-sm mb-6">আপনার বন্ধুর শেয়ার করা ৬ ডিজিটের কোডটি লিখুন</p>
            
            <input 
                type="text" 
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full p-4 text-center text-4xl font-mono font-bold tracking-[0.5em] border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none mb-6 bg-gray-50 dark:bg-gray-700 dark:text-white placeholder-gray-300"
            />
            
            <button 
                onClick={handleJoin}
                disabled={loading || inputRoomId.length < 6}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin" /> : 'জয়েন রুম'}
            </button>
        </div>
    </div>
  );

  const renderLobby = () => {
    if (!battleState) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" size={40}/></div>;
    
    const isHost = battleState.hostId === currentUser?.uid;
    const players = battleState.players;
    const requiredPlayers = 2; // Fixed for prototype

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 animate-in fade-in h-full flex flex-col">
            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4 mb-6 md:mb-8">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 text-center md:text-left">ROOM CODE</p>
                    <div className="flex items-center gap-3">
                        <span className="text-4xl md:text-5xl font-mono font-bold text-orange-600 dark:text-orange-500">{roomId}</span>
                        <button onClick={() => { navigator.clipboard.writeText(roomId); showToast("Copied!"); }} className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-lg hover:bg-orange-100">
                            <Copy size={20}/>
                        </button>
                    </div>
                </div>
                <div className="text-center md:text-right">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-bold text-sm">
                        <Users size={16}/> {players.length} Players Joined
                    </div>
                    <p className="text-xs text-gray-400 mt-2 font-medium">
                        Topic: {battleState.config.chapter}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10 flex-1 content-start">
                {players.map((p) => (
                    <div key={p.uid} className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col items-center shadow-sm relative overflow-hidden group">
                        <div className="relative">
                            <img src={p.avatar} alt={p.name} className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-200 border-4 border-white dark:border-gray-700 shadow-md mb-3 object-cover" />
                            {p.uid === battleState.hostId && (
                                <div className="absolute -top-1 -right-1 bg-yellow-400 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Host">
                                    <Crown size={12} fill="currentColor"/>
                                </div>
                            )}
                        </div>
                        <p className="font-bold text-gray-800 dark:text-white text-center truncate w-full text-sm md:text-base">{p.name}</p>
                        {p.uid === currentUser?.uid && <span className="text-[10px] uppercase font-bold text-gray-400 mt-1">You</span>}
                    </div>
                ))}
                
                {Array.from({length: Math.max(0, 2 - players.length)}).map((_, i) => (
                    <div key={i} className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex items-center justify-center p-6 min-h-[140px]">
                        <p className="text-gray-400 text-sm font-bold animate-pulse">Waiting...</p>
                    </div>
                ))}
            </div>

            <div className="p-4 md:p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 sticky bottom-0 rounded-t-2xl md:static md:bg-transparent md:border-none">
                <div className="max-w-4xl mx-auto flex justify-center">
                    {isHost ? (
                        <button 
                            onClick={handleStart}
                            disabled={players.length < requiredPlayers || !isQuestionReady}
                            className="w-full md:w-auto px-8 md:px-12 py-3 md:py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-lg md:text-xl shadow-xl shadow-orange-600/30 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
                        >
                            {!isQuestionReady ? <Loader2 className="animate-spin"/> : <Play fill="currentColor" />} 
                            {!isQuestionReady ? 'Preparing Questions...' : 'ব্যাটল শুরু করুন'}
                        </button>
                    ) : (
                        <div className="flex items-center gap-3 text-gray-500">
                            <Loader2 className="animate-spin" />
                            <span className="font-bold">হোস্টের জন্য অপেক্ষা করা হচ্ছে...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
  };

  const renderGame = () => {
    if (!battleState || !battleState.questions || battleState.questions.length === 0 || !battleState.questions[currentQIndex]) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
                <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">Syncing...</h2>
                <p className="text-sm text-gray-500 mt-2">প্রশ্ন লোড হতে সময় নিচ্ছে, দয়া করে অপেক্ষা করুন।</p>
            </div>
        );
    }

    const question = battleState.questions[currentQIndex];
    const totalQ = battleState.config.questionCount;
    const sortedPlayers = [...battleState.players].sort((a, b) => b.score - a.score);

    return (
        <div className="h-full flex flex-col max-w-5xl mx-auto p-4 md:p-6 pb-20 md:pb-6">
            
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-4 md:mb-6">
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300">
                        {currentQIndex + 1} / {totalQ}
                    </span>
                    <span className="text-sm font-bold text-orange-600 hidden md:block">
                        {battleState.config.chapter}
                    </span>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-mono font-bold text-lg md:text-xl border-2 ${timeLeft <= 5 ? 'bg-red-50 border-red-500 text-red-600 animate-pulse' : 'bg-white dark:bg-gray-800 border-orange-500 text-gray-800 dark:text-white'}`}>
                    <Clock size={18} className="md:w-5 md:h-5"/> {timeLeft}s
                </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4 md:gap-6 flex-1 h-full overflow-hidden">
                {/* Main Question Area */}
                <div className="md:col-span-3 flex flex-col justify-center h-full overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 p-5 md:p-10 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden mb-4 md:mb-6 shrink-0">
                        {/* Progress Bar */}
                        <div className="absolute top-0 left-0 h-1.5 bg-orange-500 transition-all duration-1000 ease-linear" style={{ width: `${(timeLeft / battleState.config.timePerQuestion) * 100}%` }}></div>
                        
                        <h2 className="text-lg md:text-3xl font-bold text-gray-800 dark:text-white leading-relaxed">
                            {question.question}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 pb-20 md:pb-0">
                        {question.options.map((opt: string, idx: number) => {
                            const isSelected = selectedOption === idx;
                            const isCorrect = idx === Number(question.correctAnswerIndex);
                            
                            // Visual Feedback Logic
                            let btnClass = 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-orange-400 hover:shadow-md';
                            if (hasAnswered) {
                                if (isSelected) {
                                    btnClass = isCorrect 
                                        ? 'bg-green-600 border-green-600 text-white shadow-lg' 
                                        : 'bg-red-500 border-red-500 text-white shadow-lg';
                                } else if (isCorrect && isSelected) {
                                     // Optional: Show correct answer even if wrong selected? Usually in Battle mode we show what user clicked immediately.
                                } else {
                                    btnClass = 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed opacity-60';
                                }
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(idx)}
                                    disabled={hasAnswered}
                                    className={`p-4 md:p-5 rounded-2xl border-2 text-left font-bold text-base md:text-lg transition-all transform active:scale-95 flex items-center gap-3 ${btnClass}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border shrink-0 ${isSelected ? 'border-white' : 'border-gray-300'}`}>
                                        {['A','B','C','D'][idx]}
                                    </div>
                                    <span>{opt}</span>
                                    {hasAnswered && isSelected && (isCorrect ? <CheckCircle size={20}/> : <XCircle size={20}/>)}
                                </button>
                            )
                        })}
                    </div>
                    {hasAnswered && (
                        <div className="mt-4 text-center text-gray-500 font-bold animate-pulse text-sm">
                            Waiting for next question...
                        </div>
                    )}
                </div>

                {/* Live Leaderboard Sidebar (Mobile Bottom / Desktop Side) */}
                <div className="fixed md:static bottom-0 left-0 right-0 bg-white dark:bg-gray-800 md:rounded-3xl border-t md:border border-gray-200 dark:border-gray-700 p-4 h-auto md:h-fit z-20">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2"><Trophy size={14}/> Live Rank</h3>
                    <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible no-scrollbar">
                        {sortedPlayers.map((p, idx) => (
                            <div key={p.uid} className={`flex items-center gap-3 p-2 rounded-xl transition-all min-w-[150px] md:min-w-0 ${p.uid === currentUser?.uid ? 'bg-orange-50 dark:bg-orange-900/20 ring-1 ring-orange-200 dark:ring-orange-800' : ''}`}>
                                <div className="font-bold text-gray-400 w-4 text-center text-xs">{idx + 1}</div>
                                <img src={p.avatar} className="w-8 h-8 rounded-full bg-gray-200" />
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{p.name}</p>
                                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                                        <div className="h-full bg-orange-500" style={{ width: `${Math.min(100, (p.score / (totalQ * 10)) * 100)}%` }}></div>
                                    </div>
                                </div>
                                <div className="font-mono font-bold text-orange-600 text-xs">{p.score}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
  };

  const renderResult = () => {
    if (!battleState) return null;
    const sortedPlayers = [...battleState.players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];
    const isWinner = winner.uid === currentUser?.uid;

    if (showComparison) {
        return (
            <div className="h-full bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto">
                <div className="max-w-3xl mx-auto pb-20">
                    <div className="flex items-center justify-between mb-6">
                        <button onClick={() => setShowComparison(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-bold">← Back to Score</button>
                        <h2 className="text-xl font-bold dark:text-white">Battle Analysis</h2>
                    </div>
                    
                    <div className="space-y-6">
                        {battleState.questions.map((q, idx) => (
                            <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                <p className="font-bold text-gray-800 dark:text-white mb-3 text-sm md:text-base"><span className="text-gray-400 mr-2">{idx+1}.</span>{q.question}</p>
                                
                                {/* Comparison Table */}
                                <div className="grid grid-cols-3 gap-2 text-xs md:text-sm bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg">
                                    <div className="text-gray-500 font-bold border-b pb-1 col-span-3 mb-1">Players' Answers:</div>
                                    {battleState.players.map(p => {
                                        // Answers logic depends on backend structure
                                        // Assuming answers map: { "0": 1, "1": 3 } (questionIndex: optionIndex)
                                        let ansIndex = -1;
                                        if (p.answers && typeof p.answers === 'object') {
                                            // Handle both Map and Object from JSON
                                            ansIndex = (p.answers as any)[idx.toString()]; 
                                        }
                                        
                                        const isCorrect = ansIndex === Number(q.correctAnswerIndex);
                                        const hasAnswered = ansIndex !== undefined && ansIndex !== -1;

                                        return (
                                            <div key={p.uid} className="flex flex-col items-center p-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <img src={p.avatar} className="w-4 h-4 rounded-full"/>
                                                    <span className="truncate max-w-[50px] font-bold">{p.name}</span>
                                                </div>
                                                {hasAnswered ? (
                                                    <div className={`font-bold ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                                                        {q.options[ansIndex]}
                                                    </div>
                                                ) : <span className="text-gray-400">-</span>}
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="mt-3 text-xs text-green-600 dark:text-green-400 font-bold">
                                    Correct: {q.options[Number(q.correctAnswerIndex)]}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
            {isWinner && <Confetti />}
            
            <div className="text-center mb-10 animate-in zoom-in duration-500">
                <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-30 rounded-full animate-pulse"></div>
                    <img src={winner.avatar} className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-yellow-400 shadow-2xl relative z-10 object-cover" />
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-6 py-1.5 rounded-full font-bold text-sm shadow-lg z-20 flex items-center gap-1 whitespace-nowrap">
                        <Trophy size={16} fill="currentColor"/> WINNER
                    </div>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{winner.name}</h2>
                <p className="text-xl font-mono font-bold text-orange-600">{winner.score} Points</p>
            </div>

            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden animate-in slide-in-from-bottom-10 delay-200 mb-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <span className="font-bold text-gray-500 text-sm uppercase">Leaderboard</span>
                    <span className="text-xs font-bold bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">Final</span>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {sortedPlayers.map((p, idx) => (
                        <div key={p.uid} className={`flex items-center justify-between p-4 ${p.uid === currentUser?.uid ? 'bg-orange-50 dark:bg-orange-900/10' : ''}`}>
                            <div className="flex items-center gap-4">
                                <span className={`font-bold w-6 text-center ${idx === 0 ? 'text-yellow-500 text-xl' : idx === 1 ? 'text-gray-400 text-lg' : idx === 2 ? 'text-orange-700 text-lg' : 'text-gray-400'}`}>
                                    {idx + 1}
                                </span>
                                <div className="flex items-center gap-3">
                                    <img src={p.avatar} className="w-10 h-10 rounded-full bg-gray-200" />
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-white text-sm">{p.name}</p>
                                        {p.uid === currentUser?.uid && <p className="text-[10px] text-orange-600 font-bold">YOU</p>}
                                    </div>
                                </div>
                            </div>
                            <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{p.score}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs">
                <button 
                    onClick={() => setShowComparison(true)} 
                    className="w-full px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                    <Eye size={18}/> ব্যাটল অ্যানালাইসিস
                </button>
                <button 
                    onClick={() => window.location.reload()} 
                    className="w-full px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:scale-105 transition-transform"
                >
                    Back to Menu
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
