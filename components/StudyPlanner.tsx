import React, { useState, useEffect, useRef } from 'react';
import { logger } from '../utils/logger';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, Edit3, 
  BookOpen, X, Check, Play, Pause,
  Coffee, Zap, AlertCircle, GripVertical,
  Timer as TimerIcon, Volume2, VolumeX,
  CloudRain, Wind, Trees, Bird, Flame, Waves,
  CheckSquare, BarChart2, Settings, Home,
  Clock, Target, TrendingUp,
  User, Trash
} from 'lucide-react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'motion/react';
import { useToast } from './Toast';
import * as d3 from 'd3';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  date: number;
}

interface StudySession {
  id: string;
  subjectId: string;
  subjectName: string;
  duration: number; // in minutes
  timestamp: number;
}

const FOCUS_SOUNDS = [
  { id: 'rain', name: 'বৃষ্টি', icon: CloudRain, url: 'https://assets.mixkit.co/active_storage/sfx/2437/2437-preview.mp3' },
  { id: 'birds', name: 'পাখি', icon: Bird, url: 'https://assets.mixkit.co/active_storage/sfx/2438/2438-preview.mp3' },
  { id: 'fire', name: 'আগুন', icon: Flame, url: 'https://assets.mixkit.co/active_storage/sfx/2439/2439-preview.mp3' },
  { id: 'forest', name: 'বন', icon: Trees, url: 'https://assets.mixkit.co/active_storage/sfx/2441/2441-preview.mp3' },
  { id: 'waves', name: 'ঢেউ', icon: Waves, url: 'https://assets.mixkit.co/active_storage/sfx/2440/2440-preview.mp3' },
  { id: 'wind', name: 'বাতাস', icon: Wind, url: 'https://www.soundjay.com/nature/wind-01.mp3' },
];

interface Subject {
  id: string;
  name: string;
  duration: number; // in minutes
  color: string;
}

const COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 
  'bg-orange-500', 'bg-pink-500', 'bg-indigo-500',
  'bg-cyan-500', 'bg-rose-500'
];

// ইউটিলিটি ফাংশন বাইরে নিয়ে আসা হয়েছে
const formatDuration = (mins: number) => {
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  let result = '';
  if (hours > 0) result += `${hours} ঘণ্টা `;
  if (minutes > 0 || hours === 0) result += `${minutes} মিনিট`;
  return result;
};

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h > 0 ? h.toString().padStart(2, '0') + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// Circular Picker কম্পোনেন্ট রিঅ্যাক্ট নেটিভ SVG দিয়ে রিবিল্ড করা হয়েছে (স্মুথ ড্র্যাগিং এর জন্য)
const CircularPicker = ({ value, onChange }: { value: number, onChange: (val: number) => void }) => {
  const size = 320; 
  const center = size / 2;
  const radius = size / 2 - 50;
  const isDragging = useRef(false);

  const handlePointerEvent = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - center;
    const y = e.clientY - rect.top - center;
    
    let newAngle = Math.atan2(x, -y);
    if (newAngle < 0) newAngle += 2 * Math.PI;
    
    const rawMinutes = (newAngle / (2 * Math.PI)) * 60;
    const steppedMinutes = Math.round(rawMinutes);
    
    if (steppedMinutes !== value && steppedMinutes >= 0 && steppedMinutes <= 60) {
      if (navigator.vibrate) navigator.vibrate(8);
      onChange(steppedMinutes);
    }
  };

  const angle = (value / 60) * 2 * Math.PI; 
  const arcGenerator = d3.arc()
    .innerRadius(radius - 8)
    .outerRadius(radius + 8)
    .startAngle(0)
    .endAngle(angle)
    .cornerRadius(10);
  
  const arcPath = arcGenerator({} as any) || "";
  const handleX = radius * Math.sin(angle);
  const handleY = -radius * Math.cos(angle);

  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute inset-0 bg-primary/10 rounded-full blur-[100px] scale-75 pointer-events-none" />
      
      <svg width={size} height={size} className="overflow-visible touch-none">
        <g transform={`translate(${center},${center})`}>
          {/* Background Track */}
          <circle r={radius} fill="none" stroke="currentColor" strokeWidth={16} className="text-gray-100 dark:text-zinc-900" />
          
          {/* Progress Arc */}
          <path d={arcPath} fill="currentColor" className="text-primary drop-shadow-[0_0_12px_rgba(var(--primary-rgb),0.4)]" />

          {/* Ticks */}
          {Array.from({ length: 60 }).map((_, i) => {
            const tickAngle = (i / 60) * 2 * Math.PI;
            const isMajor = i % 5 === 0;
            const isQuarter = i % 15 === 0;
            
            const x1 = (radius - (isMajor ? 20 : 10)) * Math.sin(tickAngle);
            const y1 = -(radius - (isMajor ? 20 : 10)) * Math.cos(tickAngle);
            const x2 = (radius - 2) * Math.sin(tickAngle);
            const y2 = -(radius - 2) * Math.cos(tickAngle);

            return (
              <g key={i}>
                <line 
                  x1={x1} y1={y1} x2={x2} y2={y2} 
                  stroke="currentColor" 
                  strokeWidth={isMajor ? 3 : 1} 
                  className={isMajor ? "text-gray-400 dark:text-zinc-600" : "text-gray-200 dark:text-zinc-800"} 
                />
                {isMajor && (
                  <text
                    x={(radius - 42) * Math.sin(tickAngle)}
                    y={-(radius - 42) * Math.cos(tickAngle)}
                    dy="0.35em"
                    textAnchor="middle"
                    fontSize={isQuarter ? "16px" : "12px"}
                    fontWeight="900"
                    className={isQuarter ? "fill-gray-700 dark:fill-zinc-300" : "fill-gray-400 dark:fill-zinc-600"}
                  >
                    {i === 0 ? "60" : i}
                  </text>
                )}
              </g>
            );
          })}

          {/* Visual Handle */}
          <g transform={`translate(${handleX},${handleY})`} className="pointer-events-none">
            <circle r={24} fill="white" className="shadow-2xl" />
            <circle r={20} fill="currentColor" className="text-primary" />
            <circle r={8} fill="white" />
          </g>
        </g>

        {/* Full SVG drag overlay for 360 rotation */}
        <rect
          width={size}
          height={size}
          fill="transparent"
          className="cursor-pointer touch-none"
          onPointerDown={(e) => {
            isDragging.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            handlePointerEvent(e);
          }}
          onPointerMove={(e) => {
            if (isDragging.current) handlePointerEvent(e);
          }}
          onPointerUp={(e) => {
            isDragging.current = false;
            e.currentTarget.releasePointerCapture(e.pointerId);
          }}
          onPointerCancel={(e) => {
            isDragging.current = false;
            e.currentTarget.releasePointerCapture(e.pointerId);
          }}
        />
      </svg>

      <div className="absolute flex flex-col items-center pointer-events-none">
        <motion.div 
          key={value}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <span className="text-8xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">
            {value}
          </span>
          <span className="text-sm font-black text-primary uppercase tracking-[0.4em] mt-3">মিনিট</span>
        </motion.div>
      </div>
    </div>
  );
};

// SubjectItem কম্পোনেন্ট মেইন ফাংশনের বাইরে আনা হয়েছে ড্র্যাগিং গ্লিচ ফিক্স করার জন্য
interface SubjectItemProps {
  subject: Subject;
  onStartSession: (subject: Subject) => void;
  onEdit: (subject: Subject) => void;
  onDelete: (id: string) => void;
}

const SubjectItem = React.memo(({ subject, onStartSession, onEdit, onDelete }: SubjectItemProps) => {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={subject}
      dragListener={false}
      dragControls={controls}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
      whileDrag={{ 
        scale: 1.05, 
        boxShadow: "0 30px 60px -12px rgb(0 0 0 / 0.3)",
        zIndex: 100,
        backgroundColor: "rgba(var(--primary-rgb), 0.05)"
      }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="group relative bg-white dark:bg-zinc-900 rounded-[2.5rem] p-4 shadow-sm border border-gray-100 dark:border-white/[0.05] flex items-center justify-between overflow-hidden cursor-pointer active:cursor-grabbing"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-2 ${subject.color}`} />
      
      <div className="flex items-center gap-3 flex-1">
        <div 
          className="p-3 -ml-2 text-gray-300 dark:text-zinc-700 cursor-grab active:cursor-grabbing touch-none"
          onPointerDown={(e) => {
            if (navigator.vibrate) navigator.vibrate(20);
            controls.start(e);
          }}
        >
          <GripVertical size={22} />
        </div>

        <div 
          onClick={() => onStartSession(subject)}
          className="flex items-center gap-3 flex-1"
        >
          <div className={`w-14 h-14 ${subject.color} bg-opacity-10 dark:bg-opacity-20 rounded-[1.5rem] flex items-center justify-center text-white`}>
            <div className={`w-10 h-10 ${subject.color} rounded-2xl flex items-center justify-center shadow-lg`}>
              <span className="text-sm font-black">{subject.name.charAt(0)}</span>
            </div>
          </div>
          
          <div>
            <h3 className="font-black text-gray-900 dark:text-white text-lg leading-tight">{subject.name}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-gray-500 dark:text-zinc-500">{formatDuration(subject.duration)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onEdit(subject);
          }}
          className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl text-gray-400 hover:text-primary transition-all active:scale-90"
        >
          <Edit3 size={18} />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(subject.id);
          }}
          className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl text-gray-400 hover:text-red-500 transition-all active:scale-90"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </Reorder.Item>
  );
});

// মেইন StudyPlanner কম্পোনেন্ট
const StudyPlanner: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'home' | 'todo' | 'analytics' | 'profile'>('home');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [studyHistory, setStudyHistory] = useState<StudySession[]>([]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectDuration, setNewSubjectDuration] = useState('');

  // Todo State
  const [newTodoText, setNewTodoText] = useState('');

  // Session State
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [sessionMode, setSessionMode] = useState<'setup' | 'running' | 'break' | 'finished'>('setup');
  const [timerType, setTimerType] = useState<'timer' | 'stopwatch'>('timer');

  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [initialTime, setInitialTime] = useState(0); // in seconds
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  const [selectedHours, setSelectedHours] = useState(0);
  const [selectedMinutes, setSelectedMinutes] = useState(25);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const [selectedBgm, setSelectedBgm] = useState<string | null>(null);
  const [isBgmEnabled, setIsBgmEnabled] = useState(true);

  useEffect(() => {
    // Initialize alarm sound
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audioRef.current.loop = true;

    // Initialize BGM audio element
    bgmRef.current = new Audio();
    bgmRef.current.loop = true;

    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (bgmRef.current) bgmRef.current.pause();
    };
  }, []);

  useEffect(() => {
    if (bgmRef.current) {
      if (selectedBgm && isBgmEnabled && sessionMode === 'running' && !isPaused) {
        const sound = FOCUS_SOUNDS.find(s => s.id === selectedBgm);
        if (sound && bgmRef.current.src !== sound.url) {
          bgmRef.current.src = sound.url;
        }
        bgmRef.current.play().catch(e => logger.debug("BGM play failed:", e));
      } else {
        bgmRef.current.pause();
      }
    }
  }, [selectedBgm, isBgmEnabled, sessionMode, isPaused]);

  const playAlarm = () => {
    if (bgmRef.current) bgmRef.current.pause(); // Stop BGM when alarm starts
    if (audioRef.current) {
      audioRef.current.play().catch(e => logger.debug("Audio play failed:", e));
    }
    if (navigator.vibrate) {
      navigator.vibrate([500, 200, 500, 200, 500]);
    }
  };

  const stopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (navigator.vibrate) {
      navigator.vibrate(0);
    }
  };

  // Load from localStorage
  useEffect(() => {
    const savedSubjects = localStorage.getItem('porikkhangon_study_planner');
    const savedTodos = localStorage.getItem('porikkhangon_study_todos');
    const savedHistory = localStorage.getItem('porikkhangon_study_history');

    if (savedSubjects) {
      try { setSubjects(JSON.parse(savedSubjects)); } catch (e) { logger.error(e); }
    } else {
      const defaults: Subject[] = [
        { id: '1', name: 'পদার্থবিজ্ঞান', duration: 120, color: 'bg-blue-500' },
        { id: '2', name: 'রসায়ন', duration: 90, color: 'bg-emerald-500' },
        { id: '3', name: 'উচ্চতর গণিত', duration: 150, color: 'bg-indigo-500' },
      ];
      setSubjects(defaults);
      localStorage.setItem('porikkhangon_study_planner', JSON.stringify(defaults));
    }

    if (savedTodos) {
      try { setTodos(JSON.parse(savedTodos)); } catch (e) { logger.error(e); }
    }

    if (savedHistory) {
      try { setStudyHistory(JSON.parse(savedHistory)); } catch (e) { logger.error(e); }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (subjects.length > 0) localStorage.setItem('porikkhangon_study_planner', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('porikkhangon_study_todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('porikkhangon_study_history', JSON.stringify(studyHistory));
  }, [studyHistory]);

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionMode === 'running' && !isPaused) {
      interval = setInterval(() => {
        if (timerType === 'timer') {
          setTimeLeft(prev => {
            if (prev <= 1) {
              setSessionMode('finished');
              playAlarm();
              return 0;
            }
            return prev - 1;
          });
        }
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionMode, isPaused, timerType]);

  const handleAddOrEdit = () => {
    if (!newSubjectName.trim()) {
      showToast("বিষয় এর নাম দিন", "error");
      return;
    }
    const duration = parseInt(newSubjectDuration) || 0;

    if (editingSubject) {
      setSubjects(prev => prev.map(s => s.id === editingSubject.id ? { ...s, name: newSubjectName, duration } : s));
      showToast("আপডেট করা হয়েছে", "success");
    } else {
      const newSub: Subject = {
        id: Date.now().toString(),
        name: newSubjectName,
        duration,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      };
      setSubjects(prev => [...prev, newSub]);
      showToast("নতুন বিষয় যোগ করা হয়েছে", "success");
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("আপনি কি নিশ্চিতভাবে এটি ডিলিট করতে চান?")) {
      setSubjects(prev => prev.filter(s => s.id !== id));
      showToast("ডিলিট করা হয়েছে", "info");
    }
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setNewSubjectName(subject.name);
    setNewSubjectDuration(subject.duration.toString());
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingSubject(null);
    setNewSubjectName('');
    setNewSubjectDuration('');
  };

  const startSession = (subject: Subject) => {
    setActiveSubject(subject);
    setSessionMode('setup');
    setSelectedHours(0);
    setSelectedMinutes(25);
    setTimeLeft(60 * 25);
    setInitialTime(60 * 25);
    setElapsedSeconds(0);
    setIsPaused(false);
  };

  const handleStartStudy = () => {
    const totalSeconds = (selectedHours * 3600) + (selectedMinutes * 60);

    if (timerType === 'timer' && totalSeconds === 0) {
      showToast("সময় সেট করুন", "error");
      return;
    }
    if (timerType === 'timer') {
      setTimeLeft(totalSeconds);
      setInitialTime(totalSeconds);
    }
    setSessionMode('running');
  };

  const handleFinishSession = () => {
    if (!activeSubject) return;

    stopAlarm();
    const addedMinutes = Math.floor(elapsedSeconds / 60);
    
    // Update subject duration
    setSubjects(prev => prev.map(s => 
      s.id === activeSubject.id 
        ? { ...s, duration: s.duration + addedMinutes } 
        : s
    ));

    // Save to history
    if (addedMinutes > 0) {
      const newSession: StudySession = {
        id: Date.now().toString(),
        subjectId: activeSubject.id,
        subjectName: activeSubject.name,
        duration: addedMinutes,
        timestamp: Date.now()
      };
      setStudyHistory(prev => [...prev, newSession]);
    }

    showToast(`${addedMinutes} মিনিট পড়ার সময় যোগ করা হয়েছে`, "success");
    setActiveSubject(null);
    setSessionMode('setup');
  };

  const totalMinutes = subjects.reduce((acc, s) => acc + s.duration, 0);

  // Todo Handlers
  const addTodo = () => {
    if (!newTodoText.trim()) return;
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: newTodoText,
      completed: false,
      date: Date.now()
    };
    setTodos(prev => [newTodo, ...prev]);
    setNewTodoText('');
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    if (navigator.vibrate) navigator.vibrate(5);
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
    if (navigator.vibrate) navigator.vibrate(5);
  };

  // Analytics Data
  const getChartData = () => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString('bn-BD', { weekday: 'short' });
    }).reverse();

    const dataMap = new Map();
    last7Days.forEach(day => dataMap.set(day, 0));

    studyHistory.forEach(session => {
      const date = new Date(session.timestamp);
      const dayName = date.toLocaleDateString('bn-BD', { weekday: 'short' });
      if (dataMap.has(dayName)) {
        dataMap.set(dayName, dataMap.get(dayName) + session.duration);
      }
    });

    return last7Days.map(day => ({
      name: day,
      duration: dataMap.get(day)
    }));
  };

  const getSubjectDistribution = () => {
    const distMap = new Map();
    studyHistory.forEach(session => {
      distMap.set(session.subjectName, (distMap.get(session.subjectName) || 0) + session.duration);
    });

    return Array.from(distMap.entries()).map(([name, value]) => ({ name, value }));
  };

  const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

  return (
    <div className="min-h-full bg-gray-50 dark:bg-black flex flex-col pb-24 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-xl p-6 rounded-b-[2.5rem] shadow-sm border-b border-gray-200 dark:border-white/[0.05] sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 -ml-2 rounded-full active:bg-gray-100 dark:active:bg-white/[0.05] text-gray-600 dark:text-zinc-400"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                {activeTab === 'home' ? 'স্টাডি প্ল্যানার' : 
                 activeTab === 'todo' ? 'টাস্ক লিস্ট' : 
                 activeTab === 'analytics' ? 'অগ্রগতি' : 'প্রোফাইল'}
              </h1>
              <p className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
                {activeTab === 'home' ? 'আপনার পড়ার হিসাব' : 
                 activeTab === 'todo' ? 'আজকের লক্ষ্যগুলো' : 
                 activeTab === 'analytics' ? 'আপনার স্টাডি স্ট্যাটস' : 'সেটিংস ও তথ্য'}
              </p>
            </div>
          </div>
          
          {activeTab === 'home' && (
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 active:scale-90 transition-transform"
            >
              <Plus size={24} />
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6 space-y-6"
            >
              <div className="p-4 bg-primary/10 dark:bg-primary/5 rounded-3xl border border-primary/20 dark:border-primary/10 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <Zap size={24} fill="currentColor" />
                </div>
                <div>
                  <p className="text-[12px] font-black text-primary uppercase tracking-widest">মোট পড়ার সময়</p>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">{formatDuration(totalMinutes)}</h2>
                </div>
              </div>

              <div className="space-y-4">
                {subjects.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4 text-gray-400">
                      <BookOpen size={32} />
                    </div>
                    <p className="text-gray-500 dark:text-zinc-500 font-bold">কোনো বিষয় যোগ করা হয়নি</p>
                    <button 
                      onClick={() => setIsAddModalOpen(true)}
                      className="mt-4 text-primary font-bold text-sm flex items-center gap-1"
                    >
                      <Plus size={16} /> নতুন বিষয় যোগ করুন
                    </button>
                  </div>
                ) : (
                  <Reorder.Group axis="y" values={subjects} onReorder={setSubjects} className="space-y-4">
                    {subjects.map((subject) => (
                      <SubjectItem 
                        key={subject.id} 
                        subject={subject} 
                        onStartSession={startSession}
                        onEdit={openEditModal}
                        onDelete={handleDelete}
                      />
                    ))}
                  </Reorder.Group>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'todo' && (
            <motion.div 
              key="todo"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6 space-y-6"
            >
              <div className="relative group">
                <input 
                  type="text" 
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                  placeholder="নতুন টাস্ক লিখুন..."
                  className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/[0.05] rounded-2xl px-5 py-4 pr-14 font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                <button 
                  onClick={addTodo}
                  className="absolute right-2 top-2 bottom-2 w-10 bg-primary text-white rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="space-y-3">
                {todos.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center justify-center opacity-50">
                    <CheckSquare size={48} className="text-gray-300 dark:text-zinc-700 mb-4" />
                    <p className="font-bold text-gray-400">আপনার কোনো টাস্ক নেই</p>
                  </div>
                ) : (
                  todos.map((todo) => (
                    <motion.div 
                      key={todo.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-100 dark:border-white/[0.05] shadow-sm"
                    >
                      <button 
                        onClick={() => toggleTodo(todo.id)}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${todo.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-200 dark:border-zinc-700'}`}
                      >
                        {todo.completed && <Check size={14} strokeWidth={4} />}
                      </button>
                      <span className={`flex-1 font-bold text-sm transition-all ${todo.completed ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-zinc-300'}`}>
                        {todo.text}
                      </span>
                      <button 
                        onClick={() => deleteTodo(todo.id)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6 space-y-8"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-gray-100 dark:border-white/[0.05] shadow-sm">
                  <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-3">
                    <Clock size={20} />
                  </div>
                  <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">আজকের পড়া</p>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mt-1">
                    {Math.floor(studyHistory.filter(s => new Date(s.timestamp).toDateString() === new Date().toDateString()).reduce((acc, s) => acc + s.duration, 0))} <span className="text-xs">মিনিট</span>
                  </h3>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-gray-100 dark:border-white/[0.05] shadow-sm">
                  <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center mb-3">
                    <TrendingUp size={20} />
                  </div>
                  <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">গড় পড়া</p>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mt-1">
                    {Math.round(totalMinutes / (Math.max(1, subjects.length)))} <span className="text-xs">মিনিট</span>
                  </h3>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-white/[0.05] shadow-sm">
                <h3 className="font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <BarChart2 size={18} className="text-primary" />
                  সাপ্তাহিক রিপোর্ট
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)', fontWeight: 700 }}
                        cursor={{ fill: '#88888811' }}
                      />
                      <Bar dataKey="duration" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-white/[0.05] shadow-sm">
                <h3 className="font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Target size={18} className="text-primary" />
                  বিষয় ভিত্তিক ডিস্ট্রিবিউশন
                </h3>
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
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 700 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6 space-y-6"
            >
              <div className="flex flex-col items-center py-8 bg-white dark:bg-zinc-900 rounded-[3rem] border border-gray-100 dark:border-white/[0.05] shadow-sm">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 relative">
                  <User size={48} className="text-primary" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 border-4 border-white dark:border-zinc-900 rounded-full flex items-center justify-center">
                    <Check size={14} className="text-white" strokeWidth={4} />
                  </div>
                </div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white">স্টুডেন্ট প্রোফাইল</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Porikkhangon User</p>
              </div>

              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-white/[0.05] active:scale-[0.98] transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center">
                      <Flame size={20} />
                    </div>
                    <span className="font-bold text-gray-700 dark:text-zinc-300">স্টাডি স্ট্রিক</span>
                  </div>
                  <span className="font-black text-orange-500">🔥 ৫ দিন</span>
                </button>

                <button 
                  onClick={() => {
                    if (window.confirm("সব ডাটা মুছে ফেলতে চান? এটি আর ফিরে পাওয়া যাবে না।")) {
                      localStorage.removeItem('porikkhangon_study_planner');
                      localStorage.removeItem('porikkhangon_study_todos');
                      localStorage.removeItem('porikkhangon_study_history');
                      window.location.reload();
                    }
                  }}
                  className="w-full flex items-center justify-between p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-white/[0.05] active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center">
                      <Trash size={20} />
                    </div>
                    <span className="font-bold text-gray-700 dark:text-zinc-300">সব ডাটা মুছুন</span>
                  </div>
                </button>
              </div>

              <div className="pt-8 text-center">
                <p className="text-[12px] font-black text-gray-300 dark:text-zinc-700 uppercase tracking-[0.3em]">Porikkhangon Study Planner v2.0</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 inset-x-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-white/[0.05] px-6 py-4 flex items-center justify-between z-40">
        {[
          { id: 'home', icon: Home, label: 'হোম' },
          { id: 'todo', icon: CheckSquare, label: 'টাস্ক' },
          { id: 'analytics', icon: BarChart2, label: 'রিপোর্ট' },
          { id: 'profile', icon: Settings, label: 'সেটিংস' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(5);
              setActiveTab(tab.id as any);
            }}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === tab.id ? 'text-primary' : 'text-gray-400 dark:text-zinc-600'}`}
          >
            <div className={`p-2 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-primary/10' : ''}`}>
              <tab.icon size={22} strokeWidth={activeTab === tab.id ? 3 : 2} />
            </div>
            <span className={`text-[12px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'opacity-100' : 'opacity-0'}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Study Session Modal */}
      <AnimatePresence>
        {activeSubject && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white dark:bg-black z-[200] flex flex-col overflow-hidden"
          >
            {/* Session Header */}
            <div className="p-6 flex items-center justify-between">
              <button 
                onClick={() => {
                  if (sessionMode === 'running' || sessionMode === 'break') {
                    if (window.confirm("সেশন বন্ধ করতে চান? প্রগ্রেস সেভ হবে না।")) setActiveSubject(null);
                  } else {
                    setActiveSubject(null);
                  }
                }}
                className="p-2 bg-gray-100 dark:bg-zinc-900 rounded-full text-gray-500"
              >
                <X size={24} />
              </button>
              <div className="flex flex-col items-center">
                <span className="text-[12px] font-black text-primary uppercase tracking-widest">পড়ছেন</span>
                <h2 className="text-xl font-black text-gray-900 dark:text-white">{activeSubject.name}</h2>
              </div>
              <div className="w-10" />
            </div>

            {/* Session Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              {sessionMode === 'setup' ? (
                <div className="w-full flex flex-col items-center">
                  <div className="flex bg-gray-100 dark:bg-zinc-900 p-1 rounded-2xl mb-8">
                    <button 
                      onClick={() => setTimerType('timer')}
                      className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${timerType === 'timer' ? 'bg-white dark:bg-zinc-800 text-primary shadow-sm' : 'text-gray-500'}`}
                    >
                      টাইমার
                    </button>
                    <button 
                      onClick={() => setTimerType('stopwatch')}
                      className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${timerType === 'stopwatch' ? 'bg-white dark:bg-zinc-800 text-primary shadow-sm' : 'text-gray-500'}`}
                    >
                      স্টপওয়াচ
                    </button>
                  </div>

                  {timerType === 'timer' ? (
                    <div className="flex flex-col items-center">
                      {/* Hour Picker */}
                      <div className="flex items-center gap-4 mb-8 bg-gray-50 dark:bg-zinc-900 px-6 py-3 rounded-3xl border border-gray-100 dark:border-white/[0.05]">
                        <button 
                          onClick={() => setSelectedHours(Math.max(0, selectedHours - 1))}
                          className="w-10 h-10 flex items-center justify-center bg-white dark:bg-zinc-800 rounded-full shadow-sm text-gray-400 active:scale-90"
                        >
                          -
                        </button>
                        <div className="flex flex-col items-center min-w-[60px]">
                          <span className="text-2xl font-black text-gray-900 dark:text-white">{selectedHours}</span>
                          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">ঘণ্টা</span>
                        </div>
                        <button 
                          onClick={() => setSelectedHours(Math.min(12, selectedHours + 1))}
                          className="w-10 h-10 flex items-center justify-center bg-white dark:bg-zinc-800 rounded-full shadow-sm text-gray-400 active:scale-90"
                        >
                          +
                        </button>
                      </div>

                      <CircularPicker 
                        value={selectedMinutes} 
                        onChange={setSelectedMinutes} 
                      />
                    </div>
                  ) : (
                    <div className="w-64 h-64 rounded-full border-4 border-dashed border-gray-200 dark:border-zinc-800 flex items-center justify-center">
                      <TimerIcon size={64} className="text-gray-300 dark:text-zinc-700" />
                    </div>
                  )}

                  <button 
                    onClick={handleStartStudy}
                    className="mt-16 w-full max-w-xs bg-primary text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Play size={24} fill="currentColor" />
                    শুরু করুন
                  </button>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  {/* Timer Display */}
                  <div className="relative w-72 h-72 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle 
                        cx="144" cy="144" r="130" 
                        fill="none" stroke="currentColor" 
                        strokeWidth="8" className="text-gray-100 dark:text-zinc-900" 
                      />
                      {timerType === 'timer' && (
                        <motion.circle 
                          cx="144" cy="144" r="130" 
                          fill="none" stroke="currentColor" 
                          strokeWidth="8" strokeLinecap="round"
                          className="text-primary"
                          initial={{ pathLength: 1 }}
                          animate={{ pathLength: timeLeft / initialTime }}
                          transition={{ duration: 1, ease: "linear" }}
                        />
                      )}
                    </svg>
                    
                    <div className="flex flex-col items-center">
                      <span className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter">
                        {timerType === 'timer' ? formatTime(timeLeft) : formatTime(elapsedSeconds)}
                      </span>
                      <span className="text-xs font-bold text-primary uppercase tracking-widest mt-2">
                        {sessionMode === 'break' ? 'ব্রেক চলছে' : 'পড়া চলছে'}
                      </span>
                    </div>
                  </div>

                  {/* Session Stats */}
                  <div className="mt-12 w-full max-w-xs">
                    <div className="bg-gray-50 dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-white/[0.05] text-center">
                      <p className="text-[12px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1">অতিক্রান্ত সময়</p>
                      <p className="text-3xl font-black text-gray-900 dark:text-white">{Math.floor(elapsedSeconds / 60)} <span className="text-sm">মিনিট</span></p>
                    </div>
                  </div>

                  {/* Controls */}
                  {sessionMode === 'finished' ? (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="mt-12 text-center"
                    >
                      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-6 py-3 rounded-2xl font-black text-lg mb-6 animate-bounce">
                        সময় শেষ! পড়ার হিসাব সেভ করুন।
                      </div>
                    </motion.div>
                  ) : (
                    <div className="mt-8 w-full flex flex-col items-center">
                      {/* BGM Selector */}
                      <div className="w-full max-w-xs mb-8">
                        <div className="flex items-center justify-between mb-3 px-1">
                          <span className="text-[12px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Focus Sounds</span>
                          <button 
                            onClick={() => setIsBgmEnabled(!isBgmEnabled)}
                            className={`p-1.5 rounded-lg transition-all ${isBgmEnabled ? 'text-primary bg-primary/10' : 'text-gray-400 bg-gray-100 dark:bg-zinc-800'}`}
                          >
                            {isBgmEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                          </button>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                          {FOCUS_SOUNDS.map((sound) => (
                            <button
                              key={sound.id}
                              onClick={() => {
                                if (selectedBgm === sound.id) setSelectedBgm(null);
                                else {
                                  setSelectedBgm(sound.id);
                                  setIsBgmEnabled(true);
                                }
                              }}
                              className={`flex flex-col items-center gap-1.5 min-w-[60px] p-2 rounded-2xl transition-all border ${
                                selectedBgm === sound.id 
                                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                                  : 'bg-gray-50 dark:bg-zinc-900 border-gray-100 dark:border-white/[0.05] text-gray-500'
                              }`}
                            >
                              <sound.icon size={18} />
                              <span className="text-[8px] font-black uppercase">{sound.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <button 
                          onClick={() => setIsPaused(!isPaused)}
                          className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-90 ${isPaused ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white border border-gray-100 dark:border-white/[0.05]'}`}
                        >
                          {isPaused ? <Play size={32} fill="currentColor" /> : <Pause size={32} fill="currentColor" />}
                        </button>

                        <button 
                          onClick={() => {
                            if (sessionMode === 'running') setSessionMode('break');
                            else setSessionMode('running');
                          }}
                          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-90 ${sessionMode === 'break' ? 'bg-orange-500 text-white shadow-orange-500/30' : 'bg-gray-100 dark:bg-zinc-900 text-gray-500'}`}
                        >
                          <Coffee size={24} />
                        </button>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={handleFinishSession}
                    className="mt-12 px-12 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-sm active:scale-95 transition-all"
                  >
                    পড়া শেষ করুন
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Motivation */}
            <div className="p-8 pb-12 text-center">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Zap size={16} fill="currentColor" />
                <span className="text-xs font-bold uppercase tracking-widest">Keep Going, You're doing great!</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 bg-white dark:bg-zinc-900 rounded-t-[3rem] z-[110] p-8 pb-12 shadow-2xl border-t border-gray-100 dark:border-white/[0.05]"
            >
              <div className="w-12 h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full mx-auto mb-8" />
              
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                  {editingSubject ? 'বিষয় এডিট করুন' : 'নতুন বিষয় যোগ করুন'}
                </h2>
                <button 
                  onClick={closeModal}
                  className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[12px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-2 ml-1">বিষয় এর নাম</label>
                  <input 
                    type="text"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    placeholder="যেমন: পদার্থবিজ্ঞান"
                    className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-white/[0.05] rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-2 ml-1">পড়ার সময় (মিনিট এ)</label>
                  <div className="relative">
                    <input 
                      type="number"
                      value={newSubjectDuration}
                      onChange={(e) => setNewSubjectDuration(e.target.value)}
                      placeholder="যেমন: ৬০"
                      className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-white/[0.05] rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs uppercase">মিনিট</div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleAddOrEdit}
                    className="w-full bg-primary text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Check size={24} />
                    {editingSubject ? 'আপডেট করুন' : 'সেভ করুন'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Tips Section */}
      <div className="px-6 mt-4">
        <div className="bg-orange-50 dark:bg-orange-900/10 rounded-[2rem] p-5 border border-orange-100 dark:border-orange-900/20 flex gap-4">
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <h4 className="font-black text-orange-800 dark:text-orange-300 text-sm">টিপস</h4>
            <p className="text-xs font-bold text-orange-700/70 dark:text-orange-400/60 leading-relaxed mt-0.5">
              সাবজেক্ট এ ক্লিক করে টাইমার সেট করুন এবং পড়াশোনা শুরু করুন। সেশন শেষে অটোমেটিক সময় যোগ হয়ে যাবে।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyPlanner;