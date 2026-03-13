import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShieldCheck, Lock, Calendar, Clock, ArrowRight, 
  AlertTriangle, CheckCircle, Send, FileText, 
  Trophy, User, Copy, ExternalLink, Play
} from 'lucide-react';
import { useToast } from './Toast';

// --- MOCK EXAM BATCH DATA ---
const MOCK_EXAM_BATCHES: Record<string, any> = {
  'gst-super-focus': {
    id: 'gst-super-focus',
    title: 'GST Super Focus Challenge',
    subtitle: '45 Days Intensive Exam Batch',
    telegramLink: 'https://t.me/+example_invite_link',
    exams: [
      { id: 'exam-01', title: 'Physics 1st Paper: Vector', date: '2026-02-27', time: '08:30 PM', status: 'UPCOMING', marks: 25 },
      { id: 'exam-02', title: 'Biology 1st Paper: Cell', date: '2026-02-28', time: '08:30 PM', status: 'LOCKED', marks: 25 },
      { id: 'exam-03', title: 'Chemistry 1st Paper: Lab Safety', date: '2026-03-01', time: '08:30 PM', status: 'LOCKED', marks: 25 },
      { id: 'exam-04', title: 'Math 1st Paper: Matrix', date: '2026-03-02', time: '08:30 PM', status: 'LOCKED', marks: 25 },
    ]
  },
  'med-final-24': {
    id: 'med-final-24',
    title: 'Medical Final Model Test 2024',
    subtitle: 'Last Moment Preparation',
    telegramLink: 'https://t.me/+example_med_link',
    exams: [
        { id: 'med-01', title: 'Subject Final: Biology', date: '2025-12-10', time: '10:00 AM', status: 'COMPLETED', marks: 100, score: 85 },
        { id: 'med-02', title: 'Subject Final: Chemistry', date: '2025-12-12', time: '10:00 AM', status: 'COMPLETED', marks: 100, score: 72 },
        { id: 'med-03', title: 'Subject Final: Physics', date: '2025-12-14', time: '10:00 AM', status: 'MISSED', marks: 100 },
        { id: 'med-04', title: 'Full Model Test 01', date: '2026-02-27', time: '10:00 AM', status: 'UPCOMING', marks: 100 },
    ]
  }
};

const ExamBatchPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { enrolledCourses, currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [courseData, setCourseData] = useState<any>(null);
  const [userRoll, setUserRoll] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check if user is enrolled
    const enrollment = enrolledCourses.find(c => c.id === courseId);
    
    if (!enrollment) {
      // Not enrolled -> Redirect to course details or show error
      showToast("আপনি এই কোর্সে এনরোল করা নেই!", "error");
      navigate('/courses'); 
      return;
    }

    // 2. Load Course Data (Mock)
    // In real app, fetch from API using courseId
    const data = MOCK_EXAM_BATCHES[courseId || ''] || {
        id: courseId,
        title: enrollment.title,
        subtitle: 'Exam Batch',
        telegramLink: enrollment.telegramGroupLink || '#',
        exams: []
    };

    setCourseData(data);
    
    // 3. Set Roll ID (Mock or from Enrollment)
    // If enrollment doesn't have rollId, generate a mock one for display
    setUserRoll(enrollment.rollId || `GST-${currentUser?.uid.substring(0, 6).toUpperCase()}`);
    
    setLoading(false);
  }, [courseId, enrolledCourses, currentUser, navigate, showToast]);

  const copyRoll = () => {
    navigator.clipboard.writeText(userRoll);
    showToast("Roll ID কপি করা হয়েছে", "success");
  };

  const handleJoinTelegram = () => {
    if (courseData?.telegramLink) {
        window.open(courseData.telegramLink, '_blank');
    } else {
        showToast("টেলিগ্রাম লিংক পাওয়া যায়নি", "error");
    }
  };

  const handleStartExam = (examId: string, status: string) => {
    if (status === 'LOCKED') {
        showToast("এই এক্সামটি এখনো শুরু হয়নি", "info");
        return;
    }
    if (status === 'COMPLETED') {
        // Show Result
        navigate(`/exam/${examId}/result`); // Assuming result page exists or logic handles it
        return;
    }
    
    // Start Exam
    // Pass rollId via state or verify in backend
    navigate(`/exam/${examId}`, { state: { rollId: userRoll, courseId: courseId } });
  };

  if (loading) {
      return <div className="h-full flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  if (!courseData) return <div>Course not found</div>;

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-6 pb-20">
        
        {/* Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
                            EXAM BATCH
                        </span>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">{courseData.title}</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{courseData.subtitle}</p>
                    </div>
                    
                    {/* Roll ID Card */}
                    <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center min-w-[160px]">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Your Roll ID</p>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-mono font-black text-primary tracking-wider">{userRoll}</span>
                            <button onClick={copyRoll} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Telegram Join CTA */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shrink-0">
                            <Send size={20} className="-ml-0.5 mt-0.5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Join Private Telegram Group</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Get routine updates, solve sheets, and mentor support.</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleJoinTelegram}
                        className="w-full md:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                        Join Now <ExternalLink size={14}/>
                    </button>
                </div>
            </div>
        </div>

        {/* Access Warning */}
        <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-xl">
            <AlertTriangle className="text-yellow-600 shrink-0 mt-0.5" size={18} />
            <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300">
                <span className="font-bold">সতর্কতা:</span> আপনার রোল আইডিটি ইউনিক। এটি অন্য কারো সাথে শেয়ার করবেন না। একই রোল দিয়ে একাধিক ডিভাইস থেকে এক্সাম দেওয়ার চেষ্টা করলে আপনার একাউন্ট <span className="font-bold text-red-500">ব্যান</span> হতে পারে।
            </p>
        </div>

        {/* Exams List */}
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="text-primary"/> Upcoming & Past Exams
            </h2>

            <div className="grid gap-3">
                {courseData.exams.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-gray-500">No exams scheduled yet.</p>
                    </div>
                ) : (
                    courseData.exams.map((exam: any, idx: number) => (
                        <div key={idx} className={`bg-white dark:bg-gray-800 p-4 rounded-xl border ${exam.status === 'UPCOMING' ? 'border-primary/30 shadow-md shadow-primary/5' : 'border-gray-200 dark:border-gray-700'} flex flex-col md:flex-row items-center justify-between gap-4 transition-all hover:border-primary/50`}>
                            
                            {/* Left: Info */}
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg
                                    ${exam.status === 'COMPLETED' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 
                                      exam.status === 'MISSED' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                      exam.status === 'LOCKED' ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500' :
                                      'bg-primary/10 text-primary'
                                    }
                                `}>
                                    {exam.status === 'LOCKED' ? <Lock size={20}/> : 
                                     exam.status === 'COMPLETED' ? <CheckCircle size={20}/> :
                                     <span className="text-sm">{idx + 1}</span>
                                    }
                                </div>
                                <div>
                                    <h3 className={`font-bold text-sm md:text-base ${exam.status === 'LOCKED' ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                        {exam.title}
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        <span className="flex items-center gap-1"><Calendar size={12}/> {exam.date}</span>
                                        <span className="flex items-center gap-1"><Clock size={12}/> {exam.time}</span>
                                        <span className="flex items-center gap-1"><Trophy size={12}/> {exam.marks} Marks</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Action */}
                            <div className="w-full md:w-auto flex items-center justify-end gap-3">
                                {exam.status === 'COMPLETED' && (
                                    <div className="text-right mr-2">
                                        <p className="text-xs font-bold text-gray-400 uppercase">Score</p>
                                        <p className="text-lg font-black text-green-500">{exam.score || 0}/{exam.marks}</p>
                                    </div>
                                )}
                                
                                <button 
                                    onClick={() => handleStartExam(exam.id, exam.status)}
                                    disabled={exam.status === 'LOCKED'}
                                    className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all w-full md:w-auto justify-center
                                        ${exam.status === 'LOCKED' ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600' : 
                                          exam.status === 'COMPLETED' ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300' :
                                          'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20'
                                        }
                                    `}
                                >
                                    {exam.status === 'LOCKED' ? 'Locked' : 
                                     exam.status === 'COMPLETED' ? 'View Result' :
                                     exam.status === 'MISSED' ? 'Retake Exam' :
                                     <>Start Exam <Play size={14} fill="currentColor"/></>
                                    }
                                </button>
                            </div>

                        </div>
                    ))
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default ExamBatchPage;
