import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Play, Pause, Square, CheckCircle, Circle, 
  Clock, Settings, Trash2, 
  Flame, X, ChevronRight, Target, 
  ArrowLeft,
  LayoutDashboard, ListTodo, PieChart as PieChartIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCache } from '../contexts/CacheContext';
import { useToast } from './Toast';
import confetti from 'canvas-confetti';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';

// --- Types ---
type TaskType = 'STUDY' | 'NAMAZ' | 'COACHING' | 'BREAK' | 'OTHER';

interface Task {
  id: string;
  title: string;
  subject: string;
  type: TaskType;
  estimatedMinutes: number;
  completed: boolean;
  recurring: boolean; // Daily repeat
  createdAt: number;
}

interface StudySession {
  id: string;
  taskId: string;
  subject: string;
  durationSeconds: number;
  timestamp: number;
}

interface DailyGoal {
  hours: number;
}

// --- Constants ---
const SUBJECTS = [
  { name: 'Physics', color: '#3B82F6' },
  { name: 'Chemistry', color: '#14B8A6' },
  { name: 'Math', color: '#EF4444' },
  { name: 'Biology', color: '#22C55E' },
  { name: 'ICT', color: '#A855F7' },
  { name: 'English', color: '#EC4899' },
  { name: 'Bangla', color: '#6366F1' },
  { name: 'GK', color: '#EAB308' },
];

const SPECIAL_CATEGORIES = [
  { name: 'Namaz', type: 'NAMAZ', color: '#059669', icon: '🕌' },
  { name: 'Coaching', type: 'COACHING', color: '#D97706', icon: '🏫' },
  { name: 'Break', type: 'BREAK', color: '#6B7280', icon: '☕' },
];

const QUOTES = [
  "আজকের পরিশ্রম, আগামীকালের সফলতা।",
  "স্বপ্ন সেটা নয় যা তুমি ঘুমিয়ে দেখো, স্বপ্ন সেটা যা তোমাকে ঘুমাতে দেয় না।",
  "সাফল্যের কোনো শর্টকাট নেই।",
  "ধৈর্য ধরো, তোমার সময় আসবেই।",
  "নিজের ওপর বিশ্বাস রাখো, তুমি পারবে।",
];

// --- Helper Functions ---
const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'শুভ সকাল';
  if (hour < 17) return 'শুভ দুপুর';
  return 'শুভ সন্ধ্যা';
};

const StudyTracker: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { getCache, setCache } = useCache();
  const navigate = useNavigate();
  
  // --- State ---
  const [view, setView] = useState<'DASHBOARD' | 'PLANNER' | 'ANALYTICS'>('DASHBOARD');
  const [tasks, setTasks] = useState<Task[]>(getCache('tracker_tasks') || []);
  const [sessions, setSessions] = useState<StudySession[]>(getCache('tracker_sessions') || []);
  const [dailyGoal, setDailyGoal] = useState<DailyGoal>(getCache('tracker_goal') || { hours: 6 });
  
  // Timer State
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerMode, setTimerMode] = useState<'STOPWATCH' | 'POMODORO'>('STOPWATCH');
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60); // 25 mins
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  
  // UI State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState(SUBJECTS[0].name);
  const [newTaskType, setNewTaskType] = useState<TaskType>('STUDY');
  const [newTaskHours, setNewTaskHours] = useState(1);
  const [newTaskMinutes, setNewTaskMinutes] = useState(0);
  const [isRecurring, setIsRecurring] = useState(false);
  const [quote, setQuote] = useState(QUOTES[0]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Effects ---
  
  // Load Data from Cache and LocalStorage
  useEffect(() => {
    const cachedTasks = getCache('tracker_tasks');
    const cachedSessions = getCache('tracker_sessions');
    const cachedGoal = getCache('tracker_goal');

    if (!cachedTasks) {
      const savedTasks = localStorage.getItem('tracker_tasks');
      if (savedTasks) {
        const parsed = JSON.parse(savedTasks);
        setTasks(parsed);
        setCache('tracker_tasks', parsed);
      }
    }
    
    if (!cachedSessions) {
      const savedSessions = localStorage.getItem('tracker_sessions');
      if (savedSessions) {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed);
        setCache('tracker_sessions', parsed);
      }
    }

    if (!cachedGoal) {
      const savedGoal = localStorage.getItem('tracker_goal');
      if (savedGoal) {
        const parsed = JSON.parse(savedGoal);
        setDailyGoal(parsed);
        setCache('tracker_goal', parsed);
      }
    }
    
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, [getCache, setCache]);

  // Save Data to Cache and LocalStorage
  useEffect(() => {
    localStorage.setItem('tracker_tasks', JSON.stringify(tasks));
    setCache('tracker_tasks', tasks);
  }, [tasks, setCache]);

  useEffect(() => {
    localStorage.setItem('tracker_sessions', JSON.stringify(sessions));
    setCache('tracker_sessions', sessions);
  }, [sessions, setCache]);

  useEffect(() => {
    localStorage.setItem('tracker_goal', JSON.stringify(dailyGoal));
    setCache('tracker_goal', dailyGoal);
  }, [dailyGoal, setCache]);

  // Timer Logic
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        if (timerMode === 'STOPWATCH') {
          setElapsedTime(prev => prev + 1);
        } else {
          setPomodoroTime(prev => {
            if (prev <= 1) {
              setIsTimerRunning(false);
              showToast("Pomodoro session finished!", "success");
              return 0;
            }
            return prev - 1;
          });
          setElapsedTime(prev => prev + 1); // Track total study time anyway
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timerMode]);

  // --- Actions ---

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const totalMinutes = (newTaskHours * 60) + newTaskMinutes;
    if (totalMinutes === 0) {
      showToast("Duration must be at least 1 minute", "error");
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      subject: newTaskType === 'STUDY' ? newTaskSubject : newTaskType,
      type: newTaskType,
      estimatedMinutes: totalMinutes,
      completed: false,
      recurring: isRecurring,
      createdAt: Date.now(),
    };
    
    setTasks(prev => [newTask, ...prev]);
    setShowAddModal(false);
    setNewTaskTitle('');
    setNewTaskHours(1);
    setNewTaskMinutes(0);
    setIsRecurring(false);
    showToast("Task added successfully", "success");
  };

  const toggleTaskComplete = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      // Trigger confetti for satisfaction
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1565C0', '#4CAF50', '#FFC107', '#E91E63']
      });
    }
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const startTimer = (task: Task) => {
    setActiveTask(task);
    setIsTimerRunning(true);
    setElapsedTime(0);
    setPomodoroTime(25 * 60);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const resumeTimer = () => {
    setIsTimerRunning(true);
  };

  const handleStopClick = () => {
    if (elapsedTime > 10) { // Only warn if session is longer than 10 seconds
      setIsTimerRunning(false);
      setShowStopConfirm(true);
    } else {
      stopTimer();
    }
  };

  const stopTimer = () => {
    if (activeTask && elapsedTime > 60) { // Only save if > 1 min
      const session: StudySession = {
        id: Date.now().toString(),
        taskId: activeTask.id,
        subject: activeTask.subject,
        durationSeconds: elapsedTime,
        timestamp: Date.now(),
      };
      setSessions(prev => [...prev, session]);
      showToast(`Session saved: ${Math.floor(elapsedTime / 60)} mins`, "success");
    }
    setIsTimerRunning(false);
    setActiveTask(null);
    setElapsedTime(0);
    setShowStopConfirm(false);
  };

  // --- Analytics Calculations ---
  
  const getTodaySessions = () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return sessions.filter(s => s.timestamp >= startOfDay.getTime());
  };

  const getTodayStudyTime = () => {
    return getTodaySessions().reduce((acc, curr) => acc + curr.durationSeconds, 0);
  };

  const getSubjectDistribution = () => {
    const dist: Record<string, number> = {};
    sessions.forEach(s => {
      dist[s.subject] = (dist[s.subject] || 0) + s.durationSeconds;
    });
    return Object.entries(dist).map(([name, value]) => ({ name, value: Math.round(value / 60) })); // in mins
  };

  const getWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = days.map(d => ({ name: d, hours: 0 }));
    
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0,0,0,0);

    sessions.forEach(s => {
      if (s.timestamp >= startOfWeek.getTime()) {
        const dayIndex = new Date(s.timestamp).getDay();
        data[dayIndex].hours += s.durationSeconds / 3600;
      }
    });
    return data;
  };

  // --- Render Components ---

  const renderProgressRing = () => {
    const totalSeconds = getTodayStudyTime();
    const goalSeconds = dailyGoal.hours * 3600;
    const percentage = Math.min(100, (totalSeconds / goalSeconds) * 100);
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center w-40 h-40 mx-auto my-6">
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-primary transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-bold text-gray-800 dark:text-white">
            {Math.floor(percentage)}%
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatTime(totalSeconds)} / {dailyGoal.hours}h
          </span>
        </div>
      </div>
    );
  };

  // --- Focus Mode Overlay ---
  if (activeTask) {
    return (
      <div className="fixed inset-0 z-[200] bg-gray-900 text-white flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
        {/* Stop Confirmation Modal */}
        {showStopConfirm && (
          <div className="absolute inset-0 z-[210] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-gray-800 p-6 rounded-2xl max-w-sm w-full border border-gray-700 shadow-2xl animate-in zoom-in-95">
              <h3 className="text-xl font-bold mb-2">Stop Session?</h3>
              <p className="text-gray-400 mb-6">Are you sure you want to stop? If less than 1 minute, progress won't be saved.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => { setShowStopConfirm(false); setIsTimerRunning(true); }}
                  className="flex-1 py-3 bg-gray-700 rounded-xl font-bold text-gray-300"
                >
                  Resume
                </button>
                <button 
                  onClick={stopTimer}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold"
                >
                  Stop Session
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="absolute top-6 right-6">
          <button onClick={handleStopClick} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="mb-10 text-center">
          <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
            Focus Mode
          </span>
          <h2 className="text-3xl font-bold mb-2">{activeTask.title}</h2>
          <p className="text-gray-400 text-lg">{activeTask.subject}</p>
        </div>

        <div className="relative mb-12">
          <div className="text-8xl font-mono font-bold tracking-tighter tabular-nums">
            {timerMode === 'STOPWATCH' ? formatTime(elapsedTime) : formatTime(pomodoroTime)}
          </div>
          {timerMode === 'POMODORO' && (
            <p className="text-center text-gray-500 mt-2">Pomodoro Timer</p>
          )}
        </div>

        <div className="flex items-center gap-6">
          {!isTimerRunning ? (
            <button 
              onClick={resumeTimer}
              className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 hover:scale-105 transition-transform"
            >
              <Play size={32} fill="currentColor" />
            </button>
          ) : (
            <button 
              onClick={pauseTimer}
              className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30 hover:scale-105 transition-transform"
            >
              <Pause size={32} fill="currentColor" />
            </button>
          )}
          
          <button 
            onClick={handleStopClick}
            className="w-14 h-14 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500/30 transition-colors"
          >
            <Square size={24} fill="currentColor" />
          </button>
        </div>

        <div className="mt-12 flex gap-4">
          <button 
            onClick={() => setTimerMode('STOPWATCH')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${timerMode === 'STOPWATCH' ? 'bg-white text-gray-900' : 'bg-gray-800 text-gray-400'}`}
          >
            Stopwatch
          </button>
          <button 
            onClick={() => setTimerMode('POMODORO')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${timerMode === 'POMODORO' ? 'bg-white text-gray-900' : 'bg-gray-800 text-gray-400'}`}
          >
            Pomodoro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full pb-32 bg-gray-50 dark:bg-black relative">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-b-[2.5rem] shadow-sm border-b border-gray-200 dark:border-zinc-800 mb-6 sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
             <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full active:bg-gray-100 dark:active:bg-gray-700 text-gray-600 dark:text-gray-300">
                <ArrowLeft size={24} />
             </button>
             <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{getGreeting()}</p>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">{currentUser?.displayName?.split(' ')[0]}</h1>
             </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSettingsModal(true)}
              className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Settings size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Flame size={20} className="text-orange-700 dark:text-orange-400" fill="currentColor" />
            </div>
          </div>
        </div>
        
        <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-2xl border border-primary/10">
          <p className="text-sm font-medium text-primary dark:text-orange-300 italic text-center">
            "{quote}"
          </p>
        </div>

        {view === 'DASHBOARD' && renderProgressRing()}
      </div>

      {/* Content */}
      <div className="px-4 md:px-6 space-y-6">
        
        {view === 'DASHBOARD' && (
          <>
            <div className="flex justify-between items-center px-2">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Target size={18} /> আজকের টাস্ক
              </h3>
              <button 
                onClick={() => setView('PLANNER')}
                className="text-xs font-bold text-primary flex items-center gap-1"
              >
                সব দেখুন <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-3">
              {tasks.filter(t => !t.completed).length === 0 ? (
                <div className="text-center py-10 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-gray-300 dark:border-zinc-800">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle size={32} className="text-green-500" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">সব কাজ শেষ! দারুণ!</p>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/30"
                  >
                    নতুন টাস্ক যোগ করুন
                  </button>
                </div>
              ) : (
                tasks.filter(t => !t.completed).slice(0, 5).map(task => (
                  <div key={task.id} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center gap-4 group active:scale-[0.98] transition-transform">
                    <button onClick={() => toggleTaskComplete(task.id)} className="text-gray-300 hover:text-green-500 transition-colors">
                      <Circle size={24} />
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 dark:text-white truncate">{task.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[12px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                          task.type === 'NAMAZ' ? 'bg-emerald-100 text-emerald-700' :
                          task.type === 'COACHING' ? 'bg-amber-100 text-amber-700' :
                          'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                        }`}>
                          {task.subject}
                        </span>
                        <span className="text-[12px] text-gray-400 flex items-center gap-1">
                          <Clock size={10} /> {task.estimatedMinutes}m
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => startTimer(task)}
                      className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                      <Play size={18} fill="currentColor" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {view === 'PLANNER' && (
          <div className="space-y-6">
            {/* Active Tasks */}
            <div>
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">Pending Tasks</h3>
              <div className="space-y-3">
                {tasks.filter(t => !t.completed).map(task => (
                  <div key={task.id} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center gap-4">
                    <button onClick={() => toggleTaskComplete(task.id)} className="text-gray-300 hover:text-green-500 transition-colors">
                      <Circle size={24} />
                    </button>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 dark:text-white">{task.title}</h4>
                      <p className="text-xs text-gray-500">{task.subject} • {task.estimatedMinutes}m</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => startTimer(task)} className="p-2 bg-primary/10 text-primary rounded-lg">
                        <Play size={16} fill="currentColor" />
                      </button>
                      <button onClick={() => deleteTask(task.id)} className="p-2 bg-red-50 text-red-500 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Completed Tasks */}
            {tasks.some(t => t.completed) && (
              <div>
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">Completed</h3>
                <div className="space-y-3 opacity-60">
                  {tasks.filter(t => t.completed).map(task => (
                    <div key={task.id} className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 flex items-center gap-4">
                      <button onClick={() => toggleTaskComplete(task.id)} className="text-green-500">
                        <CheckCircle size={24} fill="currentColor" className="text-white dark:text-gray-900" />
                      </button>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-600 dark:text-gray-400 line-through">{task.title}</h4>
                      </div>
                      <button onClick={() => deleteTask(task.id)} className="text-gray-400 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'ANALYTICS' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800">
                <p className="text-xs text-gray-500 uppercase">Today</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{Math.floor(getTodayStudyTime() / 60)} <span className="text-sm font-normal text-gray-400">mins</span></p>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800">
                <p className="text-xs text-gray-500 uppercase">Sessions</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{getTodaySessions().length}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
              <h3 className="font-bold text-gray-800 dark:text-white mb-6">Subject Distribution</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getSubjectDistribution()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {getSubjectDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SUBJECTS.find(s => s.name === entry.name)?.color || '#8884d8'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {getSubjectDistribution().map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SUBJECTS.find(s => s.name === entry.name)?.color || '#8884d8' }}></span>
                    {entry.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
              <h3 className="font-bold text-gray-800 dark:text-white mb-6">Weekly Progress</h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getWeeklyData()}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="hours" fill="#1565C0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 z-50">
        <div className="flex justify-around items-center h-16 px-2 relative">
          
          <button 
            onClick={() => setView('DASHBOARD')}
            className={`flex flex-col items-center justify-center w-16 h-full space-y-1 ${view === 'DASHBOARD' ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}
          >
            <LayoutDashboard size={24} strokeWidth={view === 'DASHBOARD' ? 2.5 : 2} />
            <span className="text-[12px] font-bold">Dashboard</span>
          </button>

          <button 
            onClick={() => setView('PLANNER')}
            className={`flex flex-col items-center justify-center w-16 h-full space-y-1 ${view === 'PLANNER' ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}
          >
            <ListTodo size={24} strokeWidth={view === 'PLANNER' ? 2.5 : 2} />
            <span className="text-[12px] font-bold">Planner</span>
          </button>

          {/* Center FAB */}
          <div className="relative -top-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all border-4 border-gray-50 dark:border-gray-900"
            >
              <Plus size={28} />
            </button>
          </div>

          <button 
            onClick={() => setView('ANALYTICS')}
            className={`flex flex-col items-center justify-center w-16 h-full space-y-1 ${view === 'ANALYTICS' ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}
          >
            <PieChartIcon size={24} strokeWidth={view === 'ANALYTICS' ? 2.5 : 2} />
            <span className="text-[12px] font-bold">Analytics</span>
          </button>

          <button 
            onClick={() => setShowSettingsModal(true)}
            className="flex flex-col items-center justify-center w-16 h-full space-y-1 text-gray-400 dark:text-gray-500"
          >
            <Settings size={24} />
            <span className="text-[12px] font-bold">Settings</span>
          </button>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">New Task</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Task Title</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="What do you want to study?"
                  className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black border-none focus:ring-2 focus:ring-primary font-bold text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Category</label>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  <button
                    onClick={() => setNewTaskType('STUDY')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${newTaskType === 'STUDY' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}
                  >
                    Study
                  </button>
                  {SPECIAL_CATEGORIES.map(cat => (
                    <button
                      key={cat.type}
                      onClick={() => setNewTaskType(cat.type as TaskType)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${newTaskType === cat.type ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {newTaskType === 'STUDY' && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Subject</label>
                  <select
                    value={newTaskSubject}
                    onChange={(e) => setNewTaskSubject(e.target.value)}
                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-black border-none focus:ring-2 focus:ring-primary font-bold text-sm"
                  >
                    {SUBJECTS.map(s => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Duration</label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <select
                      value={newTaskHours}
                      onChange={(e) => setNewTaskHours(parseInt(e.target.value))}
                      className="w-full p-3 rounded-xl bg-gray-50 dark:bg-black border-none focus:ring-2 focus:ring-primary font-bold text-sm"
                    >
                      {[0, 1, 2, 3, 4, 5, 6].map(h => (
                        <option key={h} value={h}>{h} Hours</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <select
                      value={newTaskMinutes}
                      onChange={(e) => setNewTaskMinutes(parseInt(e.target.value))}
                      className="w-full p-3 rounded-xl bg-gray-50 dark:bg-black border-none focus:ring-2 focus:ring-primary font-bold text-sm"
                    >
                      {[0, 15, 30, 45].map(m => (
                        <option key={m} value={m}>{m} Mins</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                <button 
                  onClick={() => setIsRecurring(!isRecurring)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${isRecurring ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${isRecurring ? 'left-7' : 'left-1'}`}></div>
                </button>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Daily Repeat</span>
              </div>

              <button
                onClick={addTask}
                className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/30 mt-4 active:scale-[0.98] transition-transform"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h3>
              <button onClick={() => setShowSettingsModal(false)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">Daily Study Goal</label>
                <div className="flex items-center justify-between bg-gray-50 dark:bg-black p-4 rounded-xl">
                  <button 
                    onClick={() => setDailyGoal(prev => ({ ...prev, hours: Math.max(1, prev.hours - 1) }))}
                    className="w-10 h-10 bg-white dark:bg-zinc-900 rounded-full shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    -
                  </button>
                  <span className="text-2xl font-black text-primary">{dailyGoal.hours}h</span>
                  <button 
                    onClick={() => setDailyGoal(prev => ({ ...prev, hours: Math.min(16, prev.hours + 1) }))}
                    className="w-10 h-10 bg-white dark:bg-zinc-900 rounded-full shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">Recommended: 6-8 hours for admission prep.</p>
              </div>

              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold shadow-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyTracker;
