import React, { useState, useEffect, useRef } from 'react';
import { Swords, Zap, Trophy, UserPlus, Loader2, Play, Copy, Clock, Users, XCircle, Crown, Eye, CheckCircle, X, ChevronDown, Check, Settings, ArrowRight, Share2, Timer } from 'lucide-react';
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
  totalTimeTaken: number; // New field for tie-breaking
  team: 'A' | 'B' | 'NONE';
  answers: Record<string, number>; 
}

interface BattleConfig {
  subjects: string[]; 
  chapters: string[];
  mode: '1v1' | '2v2' | 'FFA';
  questionCount: number;
  timePerQuestion: number;
  maxPlayers: number;
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
  const [showComparison, setShowComparison] = useState(false);
  
  // Config State
  const [config, setConfig] = useState<BattleConfig>({
    subjects: [],
    chapters: [], 
    mode: '1v1',
    questionCount: 5,
    timePerQuestion: 15,
    maxPlayers: 2
  });

  // Derived Data
  const availableChapters = React.useMemo(() => {
      let chapters: string[] = [];
      config.subjects.forEach(sub => {
          if (SYLLABUS_DB[sub]) {
              chapters = [...chapters, ...Object.keys(SYLLABUS_DB[sub])];
          }
      });
      return [...new Set(chapters)]; 
  }, [config.subjects]);

  // Game Play State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isQuestionReady, setIsQuestionReady] = useState(false);
  
  // Timing State for Tie Breaker
  const questionStartTimeRef = useRef<number>(0);
  
  // --- POLLING EFFECT ---
  useEffect(() => {
    let interval: any;
    const fetchLoop = async () => {
        if (!roomId) return;
        try {
            const state = await getBattleState(roomId);
            setBattleState(state);
            if (state.questions && state.questions.length > 0) setIsQuestionReady(true);
        } catch (e) { console.error("Polling error", e); }
    };
    if (roomId && (phase === 'LOBBY' || phase === 'GAME' || phase === 'RESULT')) {
        fetchLoop();
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
            
            if (calculatedIndex >= battleState.questions.length) {
               setTimeLeft(0);
            } else {
               const timeInCurrentQ = elapsedSeconds % durationPerQ;
               const remaining = Math.max(0, Math.floor(durationPerQ - timeInCurrentQ));
               setTimeLeft(remaining);
               if (calculatedIndex !== currentQIndex) {
                   setCurrentQIndex(calculatedIndex);
                   setHasAnswered(false);
                   setSelectedOption(null);
                   // Record when new question started
                   questionStartTimeRef.current = Date.now();
               } else if (questionStartTimeRef.current === 0) {
                   // Initial start
                   questionStartTimeRef.current = Date.now();
               }
            }
        }
    } else if (battleState.status === 'FINISHED') {
        if (phase !== 'RESULT') {
            setPhase('RESULT');
            setShowComparison(false);
        }
    }
  }, [battleState, currentQIndex, phase]); 

  // --- HANDLERS ---
  const toggleSelection = (item: string, list: string[], setList: (l: string[]) => void) => {
      if (list.includes(item)) setList(list.filter(i => i !== item));
      else setList([...list, item]);
  };

  const handleCreate = async () => {
    if (!currentUser) return;
    if (config.subjects.length === 0) return showToast("অন্তত একটি বিষয় নির্বাচন করুন", "warning");
    if (config.chapters.length === 0) return showToast("অন্তত একটি অধ্যায় নির্বাচন করুন", "warning");

    setLoading(true);
    try {
      const res = await createBattleRoom(currentUser.uid, currentUser.displayName || 'Host', userAvatar, config);
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
    try { await startBattle(roomId, currentUser.uid); } 
    catch (e) { showToast("গেম শুরু করতে সমস্যা হয়েছে।", "error"); }
  };

  const handleAnswer = async (idx: number) => {
    if (hasAnswered || !battleState || !currentUser) return;
    setHasAnswered(true); 
    setSelectedOption(idx);
    
    // Calculate time taken (seconds)
    const timeTaken = (Date.now() - questionStartTimeRef.current) / 1000;

    const currentQ = battleState.questions[currentQIndex];
    if (!currentQ) return;
    const isCorrect = idx === Number(currentQ.correctAnswerIndex);
    try {
      await submitBattleAnswer(roomId, currentUser.uid, isCorrect, currentQIndex, idx, timeTaken);
    } catch (e: any) { console.error("Answer submit failed", e); }
  };

  // --- UI RENDERERS ---

  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 animate-in fade-in bg-gray-50 dark:bg-gray-900">
        <div className="relative mb-6">
            <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-20 rounded-full"></div>
            <Swords size={64} className="text-orange-600 dark:text-orange-500 relative z-10" />
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 text-center">কুইজ ব্যাটল</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-center max-w-xs text-sm">
            বন্ধুদের চ্যালেঞ্জ জানাও, রিয়েল-টাইম কুইজ খেলো এবং জ্ঞান যাচাই করো।
        </p>

        <div className="w-full max-w-xs space-y-3">
            <button 
                onClick={() => setPhase('CREATE')}
                className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold text-base shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
                <Zap size={18} fill="currentColor" /> নতুন রুম তৈরি করুন
            </button>
            <button 
                onClick={() => setPhase('JOIN')}
                className="w-full py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white rounded-xl font-bold text-base hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
            >
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
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">ব্যাটল কনফিগারেশন</h2>
            </div>
            
            <div className="space-y-6">
                {/* Subject Selection */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2"><Settings size={12}/> বিষয় নির্বাচন (একাধিক সম্ভব)</h3>
                    <div className="flex flex-wrap gap-2">
                        {Object.keys(SYLLABUS_DB).map(s => {
                            const isSelected = config.subjects.includes(s);
                            return (
                                <button 
                                    key={s} 
                                    onClick={() => toggleSelection(s, config.subjects, (l) => setConfig({...config, subjects: l, chapters: []}))}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${isSelected ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-500 text-orange-700 dark:text-orange-400' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}
                                >
                                    {s.split('(')[0]}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Chapter Selection */}
                {config.subjects.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xs font-bold text-gray-500 uppercase">অধ্যায় নির্বাচন</h3>
                            <button onClick={() => setConfig({...config, chapters: availableChapters})} className="text-xs text-orange-600 font-bold hover:underline">সব সিলেক্ট</button>
                        </div>
                        <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto custom-scrollbar p-1">
                            {availableChapters.map(c => {
                                const isSelected = config.chapters.includes(c);
                                return (
                                    <button 
                                        key={c} 
                                        onClick={() => toggleSelection(c, config.chapters, (l) => setConfig({...config, chapters: l}))}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border text-left transition-all ${isSelected ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-400 text-orange-700 dark:text-orange-300' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}
                                    >
                                        {c}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Settings Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">সময় (সেকেন্ড)</label>
                        <select 
                            value={config.timePerQuestion}
                            onChange={(e) => setConfig({...config, timePerQuestion: Number(e.target.value)})}
                            className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-bold dark:text-white outline-none"
                        >
                            <option value="10">১০ সেকেন্ড</option>
                            <option value="15">১৫ সেকেন্ড</option>
                            <option value="20">২০ সেকেন্ড</option>
                            <option value="30">৩০ সেকেন্ড</option>
                        </select>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">প্লেয়ার সংখ্যা: {config.maxPlayers}</label>
                        <input 
                            type="range" 
                            min="2" max="10" 
                            value={config.maxPlayers}
                            onChange={(e) => setConfig({...config, maxPlayers: Number(e.target.value)})}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-t border-gray-200 dark:border-gray-800 flex justify-center md:static md:bg-transparent md:border-none md:mt-8">
                <button 
                    onClick={handleCreate}
                    disabled={loading || config.chapters.length === 0}
                    className="w-full max-w-md py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-base shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <><Zap size={18} fill="currentColor"/> ব্যাটল শুরু করুন</>}
                </button>
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
    const requiredPlayers = 2; 

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
                        Topics: {battleState.config.chapters.length > 1 ? `${battleState.config.chapters.length} Chapters` : battleState.config.chapters[0]}
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
    if (!battleState || !battleState.questions[currentQIndex]) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-orange-500"/></div>;

    const question = battleState.questions[currentQIndex];
    const totalQ = battleState.config.questionCount;
    // Sort logic handled in result, just standard sort here
    const sortedPlayers = [...battleState.players].sort((a, b) => b.score - a.score);

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* Compact Header */}
            <div className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-sm z-10 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">{currentQIndex + 1}/{totalQ}</span>
                    <span className="text-xs font-bold text-orange-600 truncate max-w-[100px]">{battleState.config.subjects[0].split('(')[0]}</span>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${timeLeft <= 5 ? 'bg-red-50 border-red-500 text-red-600 animate-pulse' : 'bg-gray-100 dark:bg-gray-700 border-transparent text-gray-700 dark:text-gray-200'}`}>
                    <Clock size={14}/> <span className="font-mono font-bold text-sm">{timeLeft}s</span>
                </div>
            </div>

            {/* Question Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20">
                <div className="max-w-2xl mx-auto">
                    {/* Progress Bar */}
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
                                else if (isCorrect) btnClass = "bg-green-50 border-green-300 text-green-700"; // Show correct answer slightly
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
                </div>
            </div>

            {/* Compact Leaderboard Bottom Sheet */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 shrink-0 z-20">
                <div className="flex overflow-x-auto gap-3 no-scrollbar max-w-2xl mx-auto">
                    {sortedPlayers.map((p, idx) => (
                        <div key={p.uid} className={`flex items-center gap-2 p-1.5 pr-3 rounded-full border min-w-[120px] ${p.uid === currentUser?.uid ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800' : 'bg-gray-50 border-gray-100 dark:bg-gray-700 dark:border-gray-600'}`}>
                            <div className="relative">
                                <img src={p.avatar} className="w-8 h-8 rounded-full bg-gray-200" />
                                <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full border border-white">{idx+1}</span>
                            </div>
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
    
    // Improved Sorting Logic: Score DESC, then Time ASC
    const sortedPlayers = [...battleState.players].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (a.totalTimeTaken || 0) - (b.totalTimeTaken || 0); // Less time is better
    });
    
    const winner = sortedPlayers[0];
    const isWinner = winner.uid === currentUser?.uid;

    if (showComparison) {
        return (
            <div className="h-full bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto">
                {/* Visual Analysis Header */}
                <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <button onClick={() => setShowComparison(false)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                        <ArrowRight size={18} className="rotate-180"/> Back to Result
                    </button>
                    <h2 className="text-base font-bold text-gray-800 dark:text-white">Question Analysis</h2>
                </div>

                <div className="max-w-xl mx-auto p-4 pb-20 space-y-6">
                    {battleState.questions.map((q, qIdx) => (
                        <div key={qIdx} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                                <span className="text-xs font-bold text-gray-400 mb-1 block">Question {qIdx + 1}</span>
                                <p className="font-bold text-gray-800 dark:text-white text-sm leading-relaxed">{q.question}</p>
                            </div>
                            <div className="p-2 space-y-2">
                                {q.options.map((opt: string, optIdx: number) => {
                                    const isCorrect = optIdx === Number(q.correctAnswerIndex);
                                    
                                    // Find who picked this option
                                    const pickers = battleState.players.filter(p => {
                                        // @ts-ignore
                                        const ans = p.answers[qIdx.toString()];
                                        return ans === optIdx;
                                    });

                                    return (
                                        <div key={optIdx} className={`relative p-3 rounded-xl border flex items-center justify-between ${isCorrect ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'}`}>
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isCorrect ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                                    {['A','B','C','D'][optIdx]}
                                                </div>
                                                <span className={`text-sm truncate ${isCorrect ? 'font-bold text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>{opt}</span>
                                            </div>
                                            
                                            {/* Avatars of pickers */}
                                            <div className="flex -space-x-2 shrink-0 ml-2">
                                                {pickers.map(p => (
                                                    <img 
                                                        key={p.uid} 
                                                        src={p.avatar} 
                                                        title={p.name}
                                                        className={`w-6 h-6 rounded-full border-2 ${isCorrect ? 'border-green-100' : 'border-white'} shadow-sm object-cover`}
                                                    />
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
        <div className="h-full flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
            {isWinner && <Confetti />}
            
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
                    <span>•</span>
                    <span className="flex items-center gap-1"><Timer size={14}/> {winner.totalTimeTaken?.toFixed(1)}s</span>
                </div>
            </div>

            <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden mb-6">
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <span>Rank</span>
                    <span>Score (Time)</span>
                </div>
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
                                <span className="text-[10px] text-gray-400">{p.totalTimeTaken?.toFixed(1)}s</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs">
                <button 
                    onClick={() => setShowComparison(true)} 
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-200 dark:shadow-none"
                >
                    <Eye size={16}/> View Analysis
                </button>
                <button 
                    onClick={() => window.location.reload()} 
                    className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-bold hover:scale-105 transition-transform text-sm"
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
