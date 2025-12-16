
import React, { useState, useEffect, useRef } from 'react';
import { Swords, Zap, Trophy, UserPlus, Loader2, Play, Copy, Clock, Users, XCircle, Crown, Eye, CheckCircle, X, ChevronDown, Check, Settings, ArrowRight, Timer, Share2, LogOut } from 'lucide-react';
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
  BattleRoom,
  BattlePlayer
} from '../services/battleService';
import { generateQuiz } from '../services/geminiService'; 
import { updateQuestProgressAPI, saveExamResultAPI, sendNotificationAPI } from '../services/api'; 
import { useLocation } from 'react-router-dom';

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
  const opponentInfo = location.state?.opponent; // Check for challenge data
  
  // --- STATE ---
  const [phase, setPhase] = useState<Phase>('MENU');
  const [loading, setLoading] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [battleState, setBattleState] = useState<BattleRoom | null>(null);
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

  // Effect to auto-switch to create mode if challenging someone
  useEffect(() => {
      if (opponentInfo && phase === 'MENU') {
          setPhase('CREATE');
          // Optionally auto-select a subject or show a message
          showToast(`Challenging ${opponentInfo.name}. Configure your battle!`, "info");
      }
  }, [opponentInfo]);

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
  
  // --- REALTIME LISTENER ---
  useEffect(() => {
    let unsubscribe: () => void;

    if (roomId) {
      setLoading(true);
      unsubscribe = listenToBattleRoom(roomId, (data) => {
        setLoading(false);
        if (data) {
          setBattleState(data);
          
          // Phase Management based on RTDB Status
          if (data.status === 'WAITING' && phase !== 'LOBBY') setPhase('LOBBY');
          if (data.status === 'ACTIVE' && phase !== 'GAME') setPhase('GAME');
          if (data.status === 'FINISHED' && phase !== 'RESULT') setPhase('RESULT');
        } else {
          // Room deleted or null
          if (phase === 'GAME' || phase === 'LOBBY') {
             showToast("রুমটি হোস্ট দ্বারা বন্ধ করা হয়েছে।", "info");
             resetToMenu();
          }
        }
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [roomId]);

  // --- GAME TIMER LOGIC (Client Side Sync) ---
  useEffect(() => {
    let timer: any;
    if (battleState && battleState.status === 'ACTIVE' && phase === 'GAME') {
        const now = Date.now();
        // Wait for start time (buffer)
        if (now < battleState.startTime) {
            setTimeLeft(Math.ceil((battleState.startTime - now) / 1000));
            return;
        }

        const elapsedSeconds = (now - battleState.startTime) / 1000;
        const durationPerQ = battleState.config.timePerQuestion;
        const calculatedIndex = Math.floor(elapsedSeconds / durationPerQ);
        
        // Check if game over
        if (calculatedIndex >= battleState.questions.length) {
           if (battleState.hostId === currentUser?.uid) {
               finishRTDBBattle(roomId);
           }
        } else {
           const timeInCurrentQ = elapsedSeconds % durationPerQ;
           const remaining = Math.max(0, Math.floor(durationPerQ - timeInCurrentQ));
           
           if (calculatedIndex !== currentQIndex) {
               // New Question Started
               setCurrentQIndex(calculatedIndex);
               setHasAnswered(false);
               setSelectedOption(null);
               setTimeLeft(durationPerQ);
           } else {
               setTimeLeft(remaining);
           }
        }

        // Ticking effect for UI smoothness
        timer = setInterval(() => {
             setTimeLeft(prev => Math.max(0, prev - 1));
        }, 1000);
    }
    return () => clearInterval(timer);
  }, [battleState, currentQIndex, phase]);

  // --- SYNC RESULTS TO MONGODB (ONCE ON FINISH) ---
  const hasSyncedRef = useRef(false);
  useEffect(() => {
      if (phase === 'RESULT' && battleState && currentUser && !hasSyncedRef.current) {
          hasSyncedRef.current = true;
          
          // Calculate Result
          const players = Object.values(battleState.players) as BattlePlayer[];
          const me = players.find(p => p.uid === currentUser.uid);
          const opponent = players.find(p => p.uid !== currentUser.uid);
          
          if (me) {
              const isWin = me.score > (opponent?.score || 0);
              
              // 1. Save Result to MongoDB (Stats)
              const resultData = {
                  subject: battleState.config.subjects[0] || 'General',
                  totalQuestions: battleState.questions.length,
                  correct: me.score / 50, // Assuming 50 pts per q
                  wrong: 0, // Simplified for battle
                  skipped: 0,
                  score: me.score,
                  topicStats: []
              };
              saveExamResultAPI(currentUser.uid, resultData).catch(err => console.error(err));

              // 2. Update Quests
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
  };

  const toggleSelection = (item: string, list: string[], setList: (l: string[]) => void) => {
      if (list.includes(item)) setList(list.filter(i => i !== item));
      else setList([...list, item]);
  };

  const handleCreate = async () => {
    if (!currentUser) return;
    if (config.subjects.length === 0) return showToast("অন্তত একটি বিষয় নির্বাচন করুন", "warning");
    
    setLoading(true);
    try {
      // 1. Generate Questions First (Using existing Gemini Service)
      const qConfig = config.subjects.map(sub => ({
          subject: sub,
          chapter: config.chapters[0] || 'Random', // Simplification
          topics: [],
          questionCount: 1 // Distribute later
      }));
      
      // Generate questions or fetch from DB. For now using GenAI hook wrapper logic or mock
      const questions = await generateQuiz(qConfig, 'HSC Academic' as any, config.questionCount);
      
      // 2. Create Room in RTDB
      const newRoomId = await createRTDBRoom(
          { uid: currentUser.uid, name: currentUser.displayName || 'Host', avatar: userAvatar },
          config,
          questions
      );
      
      setRoomId(newRoomId);

      // 3. If challenged opponent exists, send notification invite
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

      // Listener will auto-switch phase to LOBBY
    } catch (e: any) {
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
      // Listener will auto-switch
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
      
      // Optimistic UI update handled by local state, real logic sent to DB
      submitAnswerRTDB(roomId, currentUser.uid, currentQIndex, idx, isCorrect);
  };

  const handleLeaveAndCleanup = async () => {
      if (battleState?.hostId === currentUser?.uid) {
          // Host cleans up
          await deleteRTDBRoom(roomId);
      }
      resetToMenu();
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
            রিয়েল-টাইম কুইজ খেলো। (ফ্রি টায়ারে একই সাথে ৫০টি ব্যাটল সম্ভব)
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
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {opponentInfo ? `ব্যাটল কনফিগারেশন vs ${opponentInfo.name}` : 'ব্যাটল কনফিগারেশন'}
                </h2>
            </div>
            
            <div className="space-y-6">
                {/* Subject Selection */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2"><Settings size={12}/> বিষয় নির্বাচন</h3>
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
                        </select>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">প্রশ্ন সংখ্যা: {config.questionCount}</label>
                        <input 
                            type="range" 
                            min="3" max="10" 
                            value={config.questionCount}
                            onChange={(e) => setConfig({...config, questionCount: Number(e.target.value)})}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-t border-gray-200 dark:border-gray-800 flex justify-center md:static md:bg-transparent md:border-none md:mt-8">
                <button 
                    onClick={handleCreate}
                    disabled={loading}
                    className="w-full max-w-md py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-base shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <><Zap size={18} fill="currentColor"/> {opponentInfo ? 'চ্যালেঞ্জ পাঠান' : 'ব্যাটল শুরু করুন'}</>}
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
            
            <input 
                type="text" 
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                onKeyDown={(e) => { if (e.key === 'Enter' && inputRoomId.length === 6) handleJoin(); }}
                placeholder="000000"
                className="w-full p-4 text-center text-4xl font-mono font-bold tracking-[0.5em] border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none mb-6 bg-gray-50 dark:bg-gray-700 dark:text-white"
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
    const players = Object.values(battleState.players) as BattlePlayer[];

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
                        <Users size={16}/> {players.length} Players
                    </div>
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
                            onClick={handleStartGame}
                            disabled={players.length < 2}
                            className="w-full md:w-auto px-8 md:px-12 py-3 md:py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-lg md:text-xl shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 transition-all active:scale-95"
                        >
                            <Play fill="currentColor" /> ব্যাটল শুরু করুন
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
    const totalQ = battleState.questions.length;
    const players = (Object.values(battleState.players) as BattlePlayer[]).sort((a, b) => b.score - a.score);

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
                </div>
            </div>

            {/* Live Leaderboard */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 shrink-0 z-20">
                <div className="flex overflow-x-auto gap-3 no-scrollbar max-w-2xl mx-auto">
                    {players.map((p, idx) => (
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
    const sortedPlayers = (Object.values(battleState.players) as BattlePlayer[]).sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];
    const isWinner = winner.uid === currentUser?.uid;

    if (showComparison) {
        // ... (Reuse comparison logic from previous implementation if needed, adapting to RTDB structure)
        return (
            <div className="h-full bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto">
                <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <button onClick={() => setShowComparison(false)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                        <ArrowRight size={18} className="rotate-180"/> Back to Result
                    </button>
                    <h2 className="text-base font-bold text-gray-800 dark:text-white">Question Analysis</h2>
                </div>
                {/* Simplified analysis view */}
                <div className="p-4 text-center text-gray-500">Analysis Mode Coming Soon for Realtime Battles</div>
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
