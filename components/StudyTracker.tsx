
import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, CheckCircle, Circle, Clock, 
  Play, Pause, RotateCcw, Calendar, TrendingUp,
  Brain, Coffee, Focus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  subject: string;
}

const SUBJECT_COLORS: Record<string, string> = {
  'Physics': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'Chemistry': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'Math': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  'Biology': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'English': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  'General': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
};

const StudyTracker: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  // --- STATE ---
  // Timer State
  const [timerMode, setTimerMode] = useState<'FOCUS' | 'BREAK'>('FOCUS');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  
  // Task State
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tracker_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTask, setNewTask] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('General');

  // --- EFFECTS ---
  
  // Persist Tasks
  useEffect(() => {
    localStorage.setItem('tracker_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Timer Logic
  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      showToast(timerMode === 'FOCUS' ? "ফোকাস সেশন শেষ! বিরতি নিন।" : "বিরতি শেষ! পড়ায় ফিরুন।", "success");
      // Auto switch mode
      if (timerMode === 'FOCUS') {
          setTimerMode('BREAK');
          setTimeLeft(5 * 60);
      } else {
          setTimerMode('FOCUS');
          setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, timerMode, showToast]);

  // --- HANDLERS ---

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(timerMode === 'FOCUS' ? 25 * 60 : 5 * 60);
  };

  const setMode = (mode: 'FOCUS' | 'BREAK') => {
      setTimerMode(mode);
      setIsActive(false);
      setTimeLeft(mode === 'FOCUS' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const task: Task = {
        id: Date.now().toString(),
        title: newTask,
        completed: false,
        subject: selectedSubject
    };
    setTasks([task, ...tasks]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Calculations
  const completedTasks = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="text-primary"/> স্টাডি ট্র্যাকার
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">আপনার পড়ার রুটিন এবং সময় ম্যানেজ করুন</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-3">
                <div className="text-right">
                    <p className="text-xs font-bold text-gray-500 uppercase">Daily Progress</p>
                    <p className="text-lg font-black text-primary">{Math.round(progress)}%</p>
                </div>
                <div className="w-10 h-10 rounded-full border-4 border-gray-100 dark:border-gray-700 relative flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent" style={{transform: `rotate(${progress * 3.6}deg)`}}></div>
                    <Calendar size={16} className="text-gray-400"/>
                </div>
            </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 md:gap-8">
            
            {/* Left: Pomodoro Timer (5 Columns) */}
            <div className="lg:col-span-5 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-200 dark:border-gray-700 shadow-sm text-center relative overflow-hidden">
                    {/* Background Glow */}
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-[80px] -mt-10 transition-colors duration-700 ${isActive ? 'bg-primary/20' : 'bg-gray-200/20 dark:bg-gray-700/20'}`}></div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-center gap-2 mb-8 bg-gray-100 dark:bg-gray-700/50 p-1.5 rounded-2xl w-fit mx-auto">
                            <button 
                                onClick={() => setMode('FOCUS')}
                                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${timerMode === 'FOCUS' ? 'bg-white dark:bg-gray-600 text-primary dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                            >
                                <Brain size={14}/> ফোকাস
                            </button>
                            <button 
                                onClick={() => setMode('BREAK')}
                                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${timerMode === 'BREAK' ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                            >
                                <Coffee size={14}/> বিরতি
                            </button>
                        </div>

                        <div className="text-7xl md:text-8xl font-black font-mono tracking-tighter text-gray-800 dark:text-white mb-8 tabular-nums">
                            {formatTime(timeLeft)}
                        </div>

                        <div className="flex items-center justify-center gap-4">
                            <button 
                                onClick={toggleTimer}
                                className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 transition-all active:scale-95 ${isActive ? 'bg-amber-500 hover:bg-amber-600' : 'bg-primary hover:bg-blue-700'}`}
                            >
                                {isActive ? <Pause size={28} fill="currentColor"/> : <Play size={28} fill="currentColor" className="ml-1"/>}
                            </button>
                            <button 
                                onClick={resetTimer}
                                className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                <RotateCcw size={20}/>
                            </button>
                        </div>
                        
                        <p className="mt-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
                            {isActive ? 'Timer is Running...' : 'Ready to Start?'}
                        </p>
                    </div>
                </div>

                {/* Quick Tips */}
                <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex gap-4 items-start">
                    <div className="p-2.5 bg-blue-100 dark:bg-blue-800 rounded-xl text-blue-600 dark:text-blue-300 shrink-0">
                        <Focus size={20}/>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-1">পোমোডোরো টেকনিক</h4>
                        <p className="text-xs text-blue-700/70 dark:text-blue-400/70 leading-relaxed">
                            ২৫ মিনিট একটানা পড়ুন, এরপর ৫ মিনিট বিরতি নিন। এটি মস্তিষ্কের কার্যক্ষমতা বাড়ায় এবং ক্লান্তি কমায়।
                        </p>
                    </div>
                </div>
            </div>

            {/* Right: Task List (7 Columns) */}
            <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-[600px]">
                <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">আজকের টাস্ক লিস্ট</h2>
                    
                    <form onSubmit={addTask} className="flex gap-2">
                        <div className="flex-1 relative">
                            <input 
                                type="text" 
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                placeholder="নতুন টাস্ক লিখুন..."
                                className="w-full pl-4 pr-32 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white text-sm"
                            />
                            <select 
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="absolute right-1 top-1 bottom-1 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 rounded-r-lg px-2 text-xs font-bold text-gray-500 focus:outline-none cursor-pointer hover:bg-gray-50"
                            >
                                {Object.keys(SUBJECT_COLORS).map(sub => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                            </select>
                        </div>
                        <button 
                            type="submit"
                            disabled={!newTask.trim()}
                            className="bg-primary hover:bg-blue-700 text-white p-3 rounded-xl disabled:opacity-50 transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
                        >
                            <Plus size={20}/>
                        </button>
                    </form>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                    {tasks.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 opacity-60">
                            <Clock size={48} className="mb-3" strokeWidth={1.5}/>
                            <p className="text-sm font-medium">আজকের কোনো টাস্ক নেই</p>
                            <p className="text-xs">উপরের বক্সে আপনার টাস্ক যোগ করুন</p>
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <div 
                                key={task.id}
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all group ${task.completed ? 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-60' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary/30'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => toggleTask(task.id)}
                                        className={`shrink-0 transition-colors ${task.completed ? 'text-green-500' : 'text-gray-300 hover:text-primary'}`}
                                    >
                                        {task.completed ? <CheckCircle size={22} fill="currentColor" className="text-white dark:text-gray-900"/> : <Circle size={22}/>}
                                    </button>
                                    <div>
                                        <p className={`text-sm font-bold transition-all ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-gray-200'}`}>
                                            {task.title}
                                        </p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-block mt-1 ${SUBJECT_COLORS[task.subject] || SUBJECT_COLORS['General']}`}>
                                            {task.subject}
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => deleteTask(task.id)}
                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default StudyTracker;
    