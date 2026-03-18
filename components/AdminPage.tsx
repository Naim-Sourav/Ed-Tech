
import React, { useState, useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { Check, X, Search, Trash2, User, Phone, CreditCard, ShieldCheck, Users, DollarSign, Bell, Send, BarChart3, TrendingUp, AlertCircle, Database, ChevronLeft, ChevronRight, Layers, Activity, FileText, FileJson, Edit2, Save, Image as ImageIcon, Loader2, Lock, Bookmark, Link as LinkIcon } from 'lucide-react';
import AdminQuestionGenerator from './AdminQuestionGenerator';
import AdminJsonUpload from './AdminJsonUpload';
import AdminPdfUpload from './AdminPdfUpload';
import AdminPublicExam from './AdminPublicExam';
import { fetchQuestionsFromBankAPI, deleteQuestionFromBankAPI, updateQuestionInBankAPI, fetchNotificationsAPI, deleteNotificationAPI, generateSlugsAPI } from '../services/api';
import { SYLLABUS_DB } from '../services/syllabusData';
import { useToast } from './Toast';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    MathJax: any;
  }
}

const AdminPage: React.FC = () => {
  const { paymentRequests, stats, approvePayment, rejectPayment, deletePaymentRequest, sendNotification, refreshRequests, isAdmin } = useAdmin();
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'PAYMENTS' | 'NOTIFICATIONS' | 'Q_BANK' | 'DATABASE' | 'JSON_UPLOAD' | 'PDF_UPLOAD' | 'PUBLIC_EXAM'>('DASHBOARD');
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  // Payment Filters
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Confirmation Modal State
  const [confirmAction, setConfirmAction] = useState<{ type: 'APPROVE' | 'REJECT' | 'DELETE', id: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Notification Form
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [notifType, setNotifType] = useState<'INFO' | 'SUCCESS' | 'WARNING'>('INFO');
  const [sendingNotif, setSendingNotif] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // Question Manager State
  const [questions, setQuestions] = useState<any[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [qPage, setQPage] = useState(1);
  const [qSubject, setQSubject] = useState('');
  const [qChapter, setQChapter] = useState('');
  const [qTopic, setQTopic] = useState('');
  const [qExamRef, setQExamRef] = useState('');
  const [qSearch, setQSearch] = useState('');
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);

  useEffect(() => {
      // Access Control
      if (!isAdmin) {
          const timer = setTimeout(() => {
             navigate('/dashboard');
             showToast("Access Denied: Admins Only", "error");
          }, 3000);
          return () => clearTimeout(timer);
      } else {
          // Auto refresh on mount if admin
          refreshRequests();
      }
  }, [isAdmin, navigate, refreshRequests, showToast]);

  // Load Questions for Viewer
  useEffect(() => {
    if (activeTab === 'DATABASE' && isAdmin) {
        const timeout = setTimeout(() => {
            loadQuestions();
        }, 500); // Debounce search
        return () => clearTimeout(timeout);
    }
  }, [activeTab, qPage, qSubject, qChapter, qTopic, qExamRef, qSearch, isAdmin]);

  // MathJax Trigger on Question Load
  useEffect(() => {
    if (activeTab === 'DATABASE' && questions.length > 0 && window.MathJax) {
        setTimeout(() => {
            window.MathJax.typesetPromise().catch((err: any) => console.error('MathJax error:', err));
        }, 200);
    }
  }, [questions, activeTab]);

  const loadQuestions = async () => {
      setLoadingQuestions(true);
      try {
          const data = await fetchQuestionsFromBankAPI(qPage, 10, qSubject, qChapter, qTopic, qExamRef, qSearch);
          setQuestions(data.questions);
          setTotalQuestions(data.total);
      } catch (error) {
          console.error(error);
      } finally {
          setLoadingQuestions(false);
      }
  };

  const generateSlugs = async () => {
      try {
          showToast("Generating slugs... This may take a while.", "info");
          const data = await generateSlugsAPI();
          if (data.success) {
              showToast(data.message, "success");
              loadQuestions();
          } else {
              showToast(data.error || "Failed to generate slugs", "error");
          }
      } catch (error) {
          console.error(error);
          showToast("Error generating slugs", "error");
      }
  };

  const loadNotifications = async () => {
      setLoadingNotifs(true);
      try {
          const data = await fetchNotificationsAPI();
          setNotifications(data);
      } catch (error) {
          console.error(error);
      } finally {
          setLoadingNotifs(false);
      }
  };

  useEffect(() => {
    if (activeTab === 'NOTIFICATIONS' && isAdmin) {
        loadNotifications();
    }
  }, [activeTab, isAdmin]);

  const handleDeleteNotification = async (id: string) => {
      if(!confirm("Delete this notification?")) return;
      try {
          await deleteNotificationAPI(id);
          setNotifications(prev => prev.filter(n => (n.id || n._id) !== id));
          showToast("Notification deleted", "success");
      } catch (_e) {
          showToast("Failed to delete", "error");
      }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
      e.preventDefault();
      setSendingNotif(true);
      try {
          await sendNotification(notifTitle, notifMsg, notifType);
          showToast("নোটিফিকেশন পাঠানো হয়েছে!", "success");
          setNotifTitle('');
          setNotifMsg('');
          loadNotifications();
      } catch (_e) {
          showToast("পাঠাতে সমস্যা হয়েছে", "error");
      } finally {
          setSendingNotif(false);
      }
  };

  const handleDeleteQuestion = async (id: string) => {
      if(!confirm("Are you sure you want to delete this question?")) return;
      try {
          await deleteQuestionFromBankAPI(id);
          setQuestions(prev => prev.filter(q => q._id !== id));
          showToast("Question deleted", "success");
      } catch (_e) {
          showToast("Failed to delete", "error");
      }
  };

  const handleUpdateQuestion = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingQuestion) return;
      try {
          // Clean data before sending
          const updatedData = {
              ...editingQuestion,
              correctAnswerIndex: Number(editingQuestion.correctAnswerIndex)
          };
          await updateQuestionInBankAPI(editingQuestion._id, updatedData);
          setQuestions(prev => prev.map(q => q._id === editingQuestion._id ? updatedData : q));
          setEditingQuestion(null);
          showToast("প্রশ্ন সফলভাবে আপডেট হয়েছে!", "success");
      } catch (_e) {
          showToast("আপডেট করতে সমস্যা হয়েছে", "error");
      }
  };

  const filteredRequests = paymentRequests.filter(req => {
    const matchesFilter = filter === 'ALL' || req.status === filter;
    
    const userName = req.userName || '';
    const trxId = req.trxId || '';
    const senderNumber = req.senderNumber || '';
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch = 
      userName.toLowerCase().includes(searchLower) ||
      trxId.toLowerCase().includes(searchLower) ||
      senderNumber.toLowerCase().includes(searchLower);
      
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'APPROVED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'REJECTED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  // --- Payment Action Handlers ---
  const executeConfirmAction = async () => {
      if (!confirmAction) return;
      
      setActionLoading(true);
      try {
          if (confirmAction.type === 'APPROVE') {
              await approvePayment(confirmAction.id);
              showToast("পেমেন্ট অ্যাপ্রুভ করা হয়েছে ✅", "success");
          } else if (confirmAction.type === 'REJECT') {
              await rejectPayment(confirmAction.id);
              showToast("পেমেন্ট রিজেক্ট করা হয়েছে ❌", "warning");
          } else if (confirmAction.type === 'DELETE') {
              await deletePaymentRequest(confirmAction.id);
              showToast("এন্ট্রি ডিলিট করা হয়েছে", "info");
          }
      } catch (_e) {
          showToast("অ্যাকশন সম্পন্ন হয়নি", "error");
      } finally {
          setActionLoading(false);
          setConfirmAction(null);
      }
  };

  // --- Sub-Component: Question Edit Modal ---
  const QuestionEditModal = () => {
      if (!editingQuestion) return null;

      const handleOptionChange = (idx: number, val: string) => {
          const newOptions = [...editingQuestion.options];
          newOptions[idx] = val;
          setEditingQuestion({ ...editingQuestion, options: newOptions });
      };

      const handleOptionImageChange = (idx: number, val: string) => {
          const newImages = [...(editingQuestion.optionsImages || [null, null, null, null])];
          newImages[idx] = val;
          setEditingQuestion({ ...editingQuestion, optionsImages: newImages });
      };

      return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh] animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <Edit2 size={20} className="text-primary"/> প্রশ্ন সম্পাদনা (Edit Question)
                      </h2>
                      <button onClick={() => setEditingQuestion(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><X size={20}/></button>
                  </div>
                  
                  <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 space-y-6">
                      {/* Meta Data */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Subject</label>
                              <select 
                                  value={editingQuestion.subject || ''} 
                                  onChange={e => setEditingQuestion({...editingQuestion, subject: e.target.value})}
                                  className="w-full p-2.5 rounded-xl border bg-white dark:bg-gray-700 dark:border-gray-600 text-sm"
                              >
                                  <option value="">Select Subject</option>
                                  {Object.keys(SYLLABUS_DB).map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Chapter</label>
                              <input 
                                  type="text" 
                                  value={editingQuestion.chapter || ''}
                                  onChange={e => setEditingQuestion({...editingQuestion, chapter: e.target.value})}
                                  className="w-full p-2.5 rounded-xl border bg-white dark:bg-gray-700 dark:border-gray-600 text-sm"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Topic</label>
                              <input 
                                  type="text" 
                                  value={editingQuestion.topic || ''}
                                  onChange={e => setEditingQuestion({...editingQuestion, topic: e.target.value})}
                                  className="w-full p-2.5 rounded-xl border bg-white dark:bg-gray-700 dark:border-gray-600 text-sm"
                                  list="topic-suggestions"
                              />
                              <datalist id="topic-suggestions">
                                  {editingQuestion.subject && editingQuestion.chapter && (SYLLABUS_DB[editingQuestion.subject]?.[editingQuestion.chapter] || []).map((t: any) => {
                                      const topicName = typeof t === 'string' ? t : t.title;
                                      return <option key={topicName} value={topicName} />
                                  })}
                              </datalist>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Exam Ref (Question Bank)</label>
                              <input 
                                  type="text" 
                                  value={editingQuestion.examRef || ''}
                                  onChange={e => setEditingQuestion({...editingQuestion, examRef: e.target.value})}
                                  className="w-full p-2.5 rounded-xl border bg-white dark:bg-gray-700 dark:border-gray-600 text-sm placeholder-gray-400"
                                  placeholder="e.g. medical_23_24"
                              />
                          </div>
                      </div>

                      {/* Question Body */}
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Question Text</label>
                          <textarea 
                              rows={3}
                              value={editingQuestion.question || ''}
                              onChange={e => setEditingQuestion({...editingQuestion, question: e.target.value})}
                              className="w-full p-3 rounded-xl border bg-white dark:bg-gray-700 dark:border-gray-600 text-sm font-tiro"
                          />
                          <div className="mt-2">
                              <label className="block text-[10px] font-bold text-gray-400 mb-1 flex items-center gap-1"><ImageIcon size={10}/> Question Image URL (Optional)</label>
                              <input 
                                  type="text" 
                                  value={editingQuestion.questionImage || ''}
                                  onChange={e => setEditingQuestion({...editingQuestion, questionImage: e.target.value})}
                                  className="w-full p-2 rounded-lg border bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-xs"
                                  placeholder="https://example.com/image.png"
                              />
                          </div>
                      </div>

                      {/* Options */}
                      <div className="space-y-3">
                          <label className="block text-xs font-bold text-gray-500">Options</label>
                          {[0, 1, 2, 3].map(idx => (
                              <div key={idx} className="flex gap-2 items-start">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 shrink-0 font-bold text-xs mt-1">
                                      {String.fromCharCode(65 + idx)}
                                  </div>
                                  <div className="flex-1 space-y-2">
                                      <input 
                                          type="text" 
                                          value={editingQuestion.options[idx] || ''}
                                          onChange={e => handleOptionChange(idx, e.target.value)}
                                          className={`w-full p-2.5 rounded-xl border text-sm font-tiro ${Number(editingQuestion.correctAnswerIndex) === idx ? 'border-green-500 ring-1 ring-green-500 bg-green-50 dark:bg-green-900/20' : 'bg-white dark:bg-gray-700 dark:border-gray-600'}`}
                                          placeholder={`Option ${idx + 1}`}
                                      />
                                      <input 
                                          type="text" 
                                          value={editingQuestion.optionsImages?.[idx] || ''}
                                          onChange={e => handleOptionImageChange(idx, e.target.value)}
                                          className="w-full p-2 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[10px]"
                                          placeholder="Option Image URL (Optional)"
                                      />
                                  </div>
                                  <input 
                                      type="radio" 
                                      name="correctAnswer"
                                      checked={Number(editingQuestion.correctAnswerIndex) === idx}
                                      onChange={() => setEditingQuestion({...editingQuestion, correctAnswerIndex: idx})}
                                      className="mt-3 w-4 h-4 accent-green-500 cursor-pointer"
                                  />
                              </div>
                          ))}
                      </div>

                      {/* Explanation */}
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Explanation</label>
                          <textarea 
                              rows={3}
                              value={editingQuestion.explanation || ''}
                              onChange={e => setEditingQuestion({...editingQuestion, explanation: e.target.value})}
                              className="w-full p-3 rounded-xl border bg-white dark:bg-gray-700 dark:border-gray-600 text-sm font-tiro"
                          />
                          <div className="mt-2">
                              <label className="block text-[10px] font-bold text-gray-400 mb-1 flex items-center gap-1"><ImageIcon size={10}/> Explanation Image URL (Optional)</label>
                              <input 
                                  type="text" 
                                  value={editingQuestion.explanationImage || ''}
                                  onChange={e => setEditingQuestion({...editingQuestion, explanationImage: e.target.value})}
                                  className="w-full p-2 rounded-lg border bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-xs"
                                  placeholder="https://example.com/expl-image.png"
                              />
                          </div>
                      </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 mt-4">
                      <button onClick={() => setEditingQuestion(null)} className="px-5 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                      <button onClick={handleUpdateQuestion} className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-lg flex items-center gap-2">
                          <Save size={18}/> Update Question
                      </button>
                  </div>
              </div>
          </div>
      );
  };

  // Card Skeleton for questions
  const QuestionCardSkeleton = () => (
    <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 h-48"></div>
        ))}
    </div>
  );

  // --- CONFIRMATION MODAL ---
  const ConfirmationModal = () => {
      if (!confirmAction) return null;
      
      const isApprove = confirmAction.type === 'APPROVE';
      const isReject = confirmAction.type === 'REJECT';
      const isDelete = confirmAction.type === 'DELETE';

      return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700 text-center relative overflow-hidden animate-in zoom-in-95">
                  <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isApprove ? 'bg-green-100 text-green-600' : isReject ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                      {isApprove && <Check size={32} strokeWidth={3}/>}
                      {isReject && <X size={32} strokeWidth={3}/>}
                      {isDelete && <Trash2 size={32} strokeWidth={3}/>}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {isApprove ? 'পেমেন্ট অ্যাপ্রুভ করবেন?' : isReject ? 'পেমেন্ট রিজেক্ট করবেন?' : 'ডিলিট করতে চান?'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                      {isApprove ? 'ব্যবহারকারী কোর্সে এক্সেস পেয়ে যাবেন।' : isReject ? 'ব্যবহারকারী অ্যাক্সেস পাবেন না।' : 'এই তথ্যটি আর ফিরিয়ে আনা যাবে না।'}
                  </p>

                  <div className="flex gap-3">
                      <button 
                          disabled={actionLoading}
                          onClick={() => setConfirmAction(null)} 
                          className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                          বাতিল
                      </button>
                      <button 
                          disabled={actionLoading}
                          onClick={executeConfirmAction}
                          className={`flex-1 py-3 rounded-xl text-white font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${isApprove ? 'bg-green-600 hover:bg-green-700 shadow-green-200 dark:shadow-none' : 'bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none'}`}
                      >
                          {actionLoading ? <Loader2 className="animate-spin" size={18}/> : 'নিশ্চিত করুন'}
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  // --- ACCESS DENIED VIEW ---
  if (!isAdmin) {
      return (
          <div className="h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center border border-red-200 dark:border-red-900">
                  <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock size={40} className="text-red-500" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">This area is restricted to administrators only.</p>
                  <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-gray-100 dark:bg-gray-700 font-bold rounded-xl">Back to Home</button>
              </div>
          </div>
      );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        
        {/* Header & Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
           <div className="p-6 pb-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div>
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <ShieldCheck size={28} className="text-primary dark:text-green-400" /> অ্যাডমিন প্যানেল
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">সিস্টেম ওভারভিউ ও ম্যানেজমেন্ট</p>
               </div>
               
               <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl overflow-x-auto max-w-full">
                   <button onClick={() => setActiveTab('DASHBOARD')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'DASHBOARD' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                      <BarChart3 size={16} /> ড্যাশবোর্ড
                   </button>
                   <button onClick={() => setActiveTab('PAYMENTS')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'PAYMENTS' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                      <DollarSign size={16} /> পেমেন্টস
                   </button>
                   <button onClick={() => setActiveTab('JSON_UPLOAD')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'JSON_UPLOAD' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                      <FileJson size={16} /> Smart Upload
                   </button>
                   <button onClick={() => setActiveTab('PDF_UPLOAD')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'PDF_UPLOAD' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                      <FileText size={16} /> PDF Upload
                   </button>
                   <button onClick={() => setActiveTab('PUBLIC_EXAM')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'PUBLIC_EXAM' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                      <LinkIcon size={16} /> Public Exam
                   </button>
                   <button onClick={() => setActiveTab('Q_BANK')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'Q_BANK' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                      <Database size={16} /> Generator
                   </button>
                   <button onClick={() => setActiveTab('DATABASE')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'DATABASE' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                      <Layers size={16} /> Manager
                   </button>
                   <button onClick={() => setActiveTab('NOTIFICATIONS')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'NOTIFICATIONS' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                      <Bell size={16} /> নোটিফিকেশন
                   </button>
               </div>
           </div>
           
           {/* Tab Content Divider */}
           <div className="h-6"></div>
        </div>

        {/* --- TAB: PUBLIC EXAM --- */}
        {activeTab === 'PUBLIC_EXAM' && (
           <AdminPublicExam />
        )}

        {/* --- TAB: DASHBOARD --- */}
        {activeTab === 'DASHBOARD' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Users size={64}/></div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">মোট ইউজার</p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.activeUsers}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-green-500 font-bold"><TrendingUp size={12}/> Registered</div>
                 </div>

                 <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><DollarSign size={64}/></div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">মোট আয়</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">৳{stats.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-2">Verified Revenue</p>
                 </div>

                 <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><FileText size={64}/></div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">মোট এক্সাম</p>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.totalExams}</p>
                    <p className="text-xs text-gray-400 mt-2">Quizzes Taken</p>
                 </div>

                 <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><AlertCircle size={64}/></div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">পেন্ডিং রিকোয়েস্ট</p>
                    <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingRequests}</p>
                    <p className="text-xs text-yellow-600/70 mt-2 font-medium">Action Required</p>
                 </div>
              </div>

              {/* System Stats & Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Activity size={20} className="text-primary"/> সিস্টেম স্ট্যাটাস
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Question Bank</p>
                            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.totalQuestions}</p>
                            <p className="text-xs text-purple-600/70 mt-1">Total Questions</p>
                        </div>
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Enrollments</p>
                            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.totalEnrollments}</p>
                            <p className="text-xs text-orange-600/70 mt-1">Active Students</p>
                        </div>
                    </div>
                    <div className="mt-6">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-gray-600 dark:text-gray-300">Server Status</span>
                            <span className="font-bold text-green-500">Operational</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full w-full animate-pulse"></div>
                        </div>
                    </div>
                 </div>
                 
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-4">রিসেন্ট পেমেন্টস</h3>
                    <div className="space-y-3">
                       {paymentRequests.length === 0 ? <p className="text-gray-400 text-sm">কোনো পেমেন্ট নেই</p> : paymentRequests.slice(0, 4).map(req => (
                          <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                             <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${req.status === 'APPROVED' ? 'bg-green-100 text-green-600' : req.status === 'REJECTED' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                   {req.status[0]}
                                </div>
                                <div>
                                   <p className="text-sm font-bold text-gray-800 dark:text-white line-clamp-1">{req.userName || 'Unknown'}</p>
                                   <p className="text-[10px] text-gray-500">{req.courseTitle}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">৳{req.amount}</p>
                                <span className="text-[10px] font-mono text-gray-400">{new Date(req.timestamp).toLocaleDateString()}</span>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* --- TAB: PAYMENTS --- */}
        {activeTab === 'PAYMENTS' && (
           <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
               {/* Controls */}
               <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between gap-4 bg-gray-50 dark:bg-gray-900/50">
                   <div className="relative">
                       <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                       <input 
                         type="text" 
                         placeholder="অনুসন্ধান করুন..." 
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:text-white text-sm"
                       />
                   </div>
                   <div className="flex bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-600">
                       {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(f => (
                         <button
                           key={f}
                           onClick={() => setFilter(f)}
                           className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filter === f ? 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                         >
                           {f === 'ALL' ? 'সব' : f}
                         </button>
                       ))}
                   </div>
               </div>

               {/* Table */}
               <div className="overflow-x-auto">
                   <table className="w-full text-left">
                     <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                       <tr>
                         <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ব্যবহারকারী</th>
                         <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">কোর্স</th>
                         <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">পেমেন্ট তথ্য</th>
                         <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">স্ট্যাটাস</th>
                         <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">অ্যাকশন</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                       {filteredRequests.length === 0 ? (
                           <tr>
                               <td colSpan={5} className="p-12 text-center text-gray-500">কোনো তথ্য পাওয়া যায়নি</td>
                           </tr>
                       ) : filteredRequests.map((req) => (
                         <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                           <td className="p-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                                    <User size={20} />
                                 </div>
                                 <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{req.userName || 'Unknown'}</p>
                                    <p className="text-xs text-gray-500">{req.userEmail || 'No Email'}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="p-4">
                              <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{req.courseTitle}</p>
                              <p className="text-xs text-primary dark:text-green-400 font-bold">৳{req.amount}</p>
                           </td>
                           <td className="p-4">
                              <div className="space-y-1">
                                 <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                                    <CreditCard size={14} className="text-gray-400"/> 
                                    <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">{req.trxId}</span>
                                 </div>
                                 <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                                    <Phone size={14} className="text-gray-400"/> 
                                    <span className="font-mono">{req.senderNumber}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(req.status)}`}>
                                 {req.status}
                              </span>
                           </td>
                           <td className="p-4 text-right">
                              <div className="flex justify-end gap-2">
                                {req.status === 'PENDING' && (
                                   <>
                                    <button 
                                        onClick={() => setConfirmAction({ type: 'APPROVE', id: req.id })} 
                                        className="px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors text-xs font-bold flex items-center gap-1 shadow-sm"
                                        title="Approve"
                                    >
                                       <Check size={14} /> অ্যাপ্রুভ
                                    </button>
                                    <button 
                                        onClick={() => setConfirmAction({ type: 'REJECT', id: req.id })} 
                                        className="px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors text-xs font-bold flex items-center gap-1"
                                        title="Reject"
                                    >
                                       <X size={14} /> রিজেক্ট
                                    </button>
                                   </>
                                )}
                                <button 
                                    onClick={() => setConfirmAction({ type: 'DELETE', id: req.id })} 
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" 
                                    title="Delete"
                                >
                                   <Trash2 size={16} />
                                </button>
                              </div>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
               </div>
           </div>
        )}

        {/* --- TAB: SMART JSON UPLOAD --- */}
        {activeTab === 'JSON_UPLOAD' && (
           <AdminJsonUpload />
        )}

        {/* --- TAB: PDF UPLOAD --- */}
        {activeTab === 'PDF_UPLOAD' && (
           <AdminPdfUpload />
        )}

        {/* --- TAB: QUESTION BANK GENERATOR --- */}
        {activeTab === 'Q_BANK' && (
           <AdminQuestionGenerator />
        )}

        {/* --- TAB: DATABASE VIEWER (UPDATED TO MANAGER) --- */}
        {activeTab === 'DATABASE' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden animate-in fade-in">
                {/* Manager Header & Filters */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col xl:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search size={16} className="absolute left-3 top-3 text-gray-400"/>
                            <input 
                                type="text" 
                                placeholder="Search questions..." 
                                value={qSearch}
                                onChange={e => { setQSearch(e.target.value); setQPage(1); }}
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 dark:border-gray-600 focus:ring-2 ring-primary outline-none"
                            />
                        </div>
                        <select 
                            value={qSubject} 
                            onChange={e => { setQSubject(e.target.value); setQChapter(''); setQPage(1); }}
                            className="p-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 dark:border-gray-600 focus:ring-2 ring-primary outline-none min-w-[150px]"
                        >
                            <option value="">All Subjects</option>
                            {Object.keys(SYLLABUS_DB).map(s => <option key={s} value={s}>{s.split('(')[0]}</option>)}
                        </select>
                        <select 
                            value={qChapter} 
                            onChange={e => { setQChapter(e.target.value); setQPage(1); }}
                            disabled={!qSubject}
                            className="p-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 dark:border-gray-600 focus:ring-2 ring-primary outline-none min-w-[150px]"
                        >
                            <option value="">All Chapters</option>
                            {qSubject && Object.keys(SYLLABUS_DB[qSubject] || {}).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select 
                            value={qTopic} 
                            onChange={e => { setQTopic(e.target.value); setQPage(1); }}
                            disabled={!qChapter}
                            className="p-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 dark:border-gray-600 focus:ring-2 ring-primary outline-none min-w-[150px]"
                        >
                            <option value="">All Topics</option>
                            {qSubject && qChapter && (SYLLABUS_DB[qSubject]?.[qChapter] || []).map((t: any) => {
                                const topicName = typeof t === 'string' ? t : t.title;
                                return <option key={topicName} value={topicName}>{topicName}</option>
                            })}
                        </select>
                        <input 
                            type="text" 
                            placeholder="Exam Ref..." 
                            value={qExamRef}
                            onChange={e => { setQExamRef(e.target.value); setQPage(1); }}
                            className="p-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 dark:border-gray-600 focus:ring-2 ring-primary outline-none min-w-[150px]"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={generateSlugs}
                            className="text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap transition-colors"
                        >
                            Generate Slugs (SEO)
                        </button>
                        <div className="text-sm font-bold text-gray-500 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm whitespace-nowrap">
                            Total: {totalQuestions}
                        </div>
                    </div>
                </div>

                {/* Professional Question List (Cards) */}
                <div className="overflow-y-auto min-h-[400px] p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/30">
                    {loadingQuestions ? (
                        <div className="p-4"><QuestionCardSkeleton /></div>
                    ) : questions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <Database size={48} className="opacity-20 mb-3"/>
                            No questions found matching criteria
                        </div>
                    ) : (
                        questions.map(q => (
                            <div key={q._id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all group relative">
                                {/* Top Badges */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-2.5 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-[10px] font-bold rounded-lg border border-orange-100 dark:border-orange-800">
                                            {q.subject?.split('(')[0]}
                                        </span>
                                        {q.examRef && (
                                            <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[10px] font-bold rounded-lg border border-purple-100 dark:border-purple-800 flex items-center gap-1">
                                                <Bookmark size={10} fill="currentColor"/> {q.examRef}
                                            </span>
                                        )}
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold rounded-lg">
                                            {q.chapter}
                                        </span>
                                    </div>
                                    
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => setEditingQuestion(q)}
                                            className="p-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/40 rounded-lg transition-colors" 
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteQuestion(q._id)} 
                                            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Question Content */}
                                <div className="mb-4">
                                    <h3 
                                        className="text-lg font-bold text-gray-900 dark:text-white font-tiro leading-relaxed mb-2"
                                        dangerouslySetInnerHTML={{ __html: q.question }}
                                    ></h3>
                                    {q.questionImage && (
                                        <img src={q.questionImage} alt="Question" className="max-h-32 rounded-lg object-contain border border-gray-100 dark:border-gray-700"/>
                                    )}
                                </div>

                                {/* Options Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                                    {q.options.map((opt: string, idx: number) => (
                                        <div 
                                            key={idx} 
                                            className={`p-2.5 rounded-lg border text-sm flex items-center gap-3 ${idx === Number(q.correctAnswerIndex) ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' : 'bg-gray-50/50 dark:bg-gray-700/30 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
                                        >
                                            <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold border ${idx === Number(q.correctAnswerIndex) ? 'border-green-500 bg-white dark:bg-gray-800' : 'border-gray-300 bg-white dark:bg-gray-800'}`}>
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            <span className="font-tiro" dangerouslySetInnerHTML={{ __html: opt }}></span>
                                            {idx === Number(q.correctAnswerIndex) && <Check size={14} className="ml-auto text-green-600"/>}
                                        </div>
                                    ))}
                                </div>

                                {/* Explanation */}
                                {q.explanation && (
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border-l-4 border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300">
                                        <span className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-1 block">Explanation</span>
                                        <span className="font-tiro leading-relaxed" dangerouslySetInnerHTML={{ __html: q.explanation }}></span>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
                    <span className="text-xs text-gray-500 font-medium">Showing page {qPage}</span>
                    <div className="flex gap-2">
                        <button 
                            disabled={qPage === 1} 
                            onClick={() => setQPage(p => p - 1)}
                            className="p-2 bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 shadow-sm"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            disabled={questions.length < 10} 
                            onClick={() => setQPage(p => p + 1)}
                            className="p-2 bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 shadow-sm"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
                
                {/* Modal Render */}
                <QuestionEditModal />
            </div>
        )}

        {/* --- TAB: NOTIFICATIONS --- */}
        {activeTab === 'NOTIFICATIONS' && (
           <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 md:p-10 animate-in fade-in slide-in-from-bottom-2">
               <div className="max-w-2xl mx-auto">
                   <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                         <Send size={32} />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">গ্লোবাল নোটিফিকেশন</h2>
                      <p className="text-gray-500 dark:text-gray-400 mt-2">সকল ইউজারদের কাছে গুরুত্বপূর্ণ বার্তা বা ঘোষণা পাঠান।</p>
                   </div>

                   <form onSubmit={handleSendNotification} className="space-y-6">
                      <div>
                         <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">শিরোনাম (Title)</label>
                         <input 
                           required
                           type="text" 
                           value={notifTitle}
                           onChange={e => setNotifTitle(e.target.value)}
                           className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                           placeholder="যেমন: নতুন কুইজ আপলোড হয়েছে!"
                         />
                      </div>
                      
                      <div>
                         <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">বার্তা (Message)</label>
                         <textarea 
                           required
                           rows={4}
                           value={notifMsg}
                           onChange={e => setNotifMsg(e.target.value)}
                           className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                           placeholder="বিস্তারিত লিখুন..."
                         />
                      </div>

                      <div>
                         <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">নোটিফিকেশন টাইপ</label>
                         <div className="flex gap-4">
                            {(['INFO', 'SUCCESS', 'WARNING'] as const).map(type => (
                               <button 
                                 key={type}
                                 type="button"
                                 onClick={() => setNotifType(type)}
                                 className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all ${notifType === type ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}
                               >
                                  {type}
                               </button>
                            ))}
                         </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={sendingNotif}
                        className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
                      >
                         {sendingNotif ? 'পাঠানো হচ্ছে...' : 'সেন্ড করুন'} <Send size={20} />
                      </button>
                   </form>

                   <div className="mt-12 border-t border-gray-100 dark:border-gray-700 pt-8">
                       <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Sent Notifications</h3>
                       {loadingNotifs ? (
                           <div className="text-center py-4 text-gray-500">Loading...</div>
                       ) : notifications.length === 0 ? (
                           <div className="text-center py-4 text-gray-500">No notifications sent yet.</div>
                       ) : (
                           <div className="space-y-3">
                               {notifications.map(n => (
                                   <div key={n.id || n._id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 flex justify-between items-start">
                                       <div>
                                           <div className="flex items-center gap-2 mb-1">
                                               <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                                                   n.type === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                                                   n.type === 'WARNING' ? 'bg-yellow-100 text-yellow-700' :
                                                   'bg-orange-100 text-orange-700'
                                               }`}>{n.type}</span>
                                               <span className="text-xs text-gray-400">{new Date(n.date).toLocaleDateString()}</span>
                                           </div>
                                           <h4 className="font-bold text-gray-800 dark:text-white text-sm">{n.title}</h4>
                                           <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{n.message}</p>
                                       </div>
                                       <button 
                                           onClick={() => handleDeleteNotification(n.id || n._id)}
                                           className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                       >
                                           <Trash2 size={16} />
                                       </button>
                                   </div>
                               ))}
                           </div>
                       )}
                   </div>
               </div>
           </div>
        )}

      </div>
      
      {/* Confirmation Modal Render */}
      <ConfirmationModal />
    </div>
  );
};

export default AdminPage;
