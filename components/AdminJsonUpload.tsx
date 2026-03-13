
import React, { useState, useMemo, useEffect } from 'react';
import { saveQuestionsToBankAPI } from '../services/api';
import { QuizQuestion, QuestionPaperMetadata } from '../types';
import { useToast } from './Toast';
import { Loader2, Save, FileText, CheckCircle, Trash2, Info, Upload, Calendar, Tag, Eye, ListChecks, Hash, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    MathJax: any;
  }
}

const EXAM_SOURCES = [
    { id: 'Medical', label: 'মেডিকেল ভর্তি পরীক্ষা (Medical)' },
    { id: 'Dental', label: 'ডেন্টাল ভর্তি পরীক্ষা (Dental)' },
    { id: 'Dhaka_University_A', label: 'ঢাকা বিশ্ববিদ্যালয় (ক ইউনিট)' },
    { id: 'BUET', label: 'বুয়েট (BUET)' },
    { id: 'Engineering_Guccho', label: 'ইঞ্জিনিয়ারিং গুচ্ছ (CKRUET)' },
    { id: 'BUTEX_Affiliated', label: 'বুটেক্স অধিভুক্ত ইঞ্জিনিয়ারিং কলেজ' },
    { id: 'Guccho_A', label: 'গুচ্ছ (GST) ক ইউনিট' },
    { id: 'Agriculture', label: 'কৃষি গুচ্ছ' },
    { id: 'AFMC', label: 'আর্মড ফোর্সেস মেডিকেল (AFMC)' }
];

const generateYears = () => {
    const years = [];
    for (let i = 2024; i >= 2011; i--) {
        years.push(`${i}-${(i+1).toString().slice(2)}`);
    }
    return years;
};

const YEARS = generateYears();

const AdminJsonUpload: React.FC = () => {
  const { showToast } = useToast();
  const [rawInput, setRawInput] = useState('');
  const [processedQuestions, setProcessedQuestions] = useState<QuizQuestion[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedSource, setSelectedSource] = useState(EXAM_SOURCES[0].id);
  const [selectedYear, setSelectedYear] = useState(YEARS[0]);

  // Handle MathJax rendering in preview
  useEffect(() => {
    if (processedQuestions.length > 0 && window.MathJax) {
      setTimeout(() => {
        window.MathJax.typesetPromise().catch((err: any) => console.error('MathJax error:', err));
      }, 200);
    }
  }, [processedQuestions]);

  const examRef = useMemo(() => {
      const sourcePart = selectedSource.toLowerCase().replace(/\s+/g, '_');
      const yearPart = selectedYear.replace(/-/g, '_');
      return `${sourcePart}_${yearPart}`;
  }, [selectedSource, selectedYear]);

  // --- SMART TEXT PARSER ---
  const handleParseText = () => {
    if (!rawInput.trim()) return showToast("অনুগ্রহ করে টেক্সট পেস্ট করুন", "warning");
    
    // METHOD 1: Try Native JSON Parse first (Handles Nested Brackets/LaTeX correctly)
    try {
        const parsed = JSON.parse(rawInput);
        if (Array.isArray(parsed)) {
            const extracted: QuizQuestion[] = parsed.map((item: any) => ({
                question: item.question || "",
                options: Array.isArray(item.options) ? item.options : [],
                correctAnswerIndex: Number(item.correctAnswerIndex) || 0,
                explanation: item.explanation || "",
                subject: item.subject || "General",
                chapter: item.chapter || "General",
                topic: item.topic || undefined,
                examRef: examRef,
                questionImage: item.questionImage,
                explanationImage: item.explanationImage,
                optionsImages: item.optionsImages
            })).filter(q => q.question && q.options.length > 0);

            if (extracted.length > 0) {
                setProcessedQuestions(extracted);
                showToast(`${extracted.length} টি প্রশ্ন সফলভাবে প্রসেস করা হয়েছে! (JSON Mode)`, "success");
                return;
            }
        }
    } catch (jsonError) {
        console.log("JSON parse failed, falling back to regex parser...");
    }

    // METHOD 2: Regex Fallback (For unstructured text or partial objects)
    try {
        // Find all blocks within curly braces { ... }
        // Updated Regex to be slightly more permissive but still might struggle with nested braces
        const regex = /{[^{}]*}/g; 
        const matches = rawInput.match(regex);
        
        if (!matches) {
            throw new Error("কোনো বৈধ অবজেক্ট খুঁজে পাওয়া যায়নি। ফরম্যাট চেক করুন।");
        }
        
        const extracted: QuizQuestion[] = [];

        matches.forEach(block => {
            const qMatch = block.match(/(?:"question"|question)\s*:\s*"(.*?)"/s);
            const oMatch = block.match(/(?:"options"|options)\s*:\s*\[(.*?)\]/s);
            const ansMatch = block.match(/(?:"correctAnswerIndex"|correctAnswerIndex)\s*:\s*(\d+)/);
            const expMatch = block.match(/(?:"explanation"|explanation)\s*:\s*"(.*?)"/s);
            const subMatch = block.match(/(?:"subject"|subject)\s*:\s*"(.*?)"/s);
            const chapMatch = block.match(/(?:"chapter"|chapter)\s*:\s*"(.*?)"/s);
            
            // Note: Regex fallback typically doesn't support the image fields robustly. 
            // Users should use valid JSON for complex data including images.

            if (qMatch && oMatch && ansMatch) {
                const optionsStr = oMatch[1];
                const options = optionsStr.split(/",\s*"/).map(o => o.replace(/^"|"$/g, '').trim());
                
                extracted.push({
                    question: qMatch[1].trim(),
                    options: options,
                    correctAnswerIndex: parseInt(ansMatch[1]),
                    explanation: expMatch ? expMatch[1].trim() : '',
                    subject: subMatch ? subMatch[1].trim() : 'General',
                    chapter: chapMatch ? chapMatch[1].trim() : 'General',
                    examRef: examRef
                });
            }
        });

        if (extracted.length === 0) {
            throw new Error("প্রশ্ন পার্স করা সম্ভব হয়নি। JSON ফরম্যাট চেক করুন।");
        }

        setProcessedQuestions(extracted);
        showToast(`${extracted.length} টি প্রশ্ন প্রসেস করা হয়েছে (Regex Mode)`, "info");
    } catch (e: any) {
        showToast("Error: " + e.message, "error");
    }
  };

  const handleSaveToDB = async () => {
    if (processedQuestions.length === 0) return;
    setIsSaving(true);
    try {
      const sourceLabel = EXAM_SOURCES.find(s => s.id === selectedSource)?.label || selectedSource;
      const metadata: QuestionPaperMetadata = {
          id: examRef,
          title: `${sourceLabel} ${selectedYear}`,
          year: selectedYear,
          source: selectedSource,
          totalQuestions: processedQuestions.length,
          time: 60
      };

      await saveQuestionsToBankAPI(processedQuestions, metadata);
      showToast("সফলভাবে প্রশ্নব্যাংক সেভ করা হয়েছে!", "success");
      setProcessedQuestions([]);
      setRawInput('');
    } catch (e) {
      showToast("সেভ করতে সমস্যা হয়েছে", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (index: number) => {
    setProcessedQuestions(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl p-4 md:p-8 animate-in fade-in transition-all">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-gray-100 dark:border-gray-700 pb-8">
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-inner">
                    <Upload size={28} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Smart Question Uploader</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">কোটেশনসহ (JSON) বা কোটেশন ছাড়া—যেকোনো প্লেইন টেক্সট ফরম্যাট এখন সাপোর্টেড।</p>
                </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3">
                <div className="relative group">
                    <Tag size={14} className="absolute left-3 top-3 text-gray-400" />
                    <select value={selectedSource} onChange={(e) => setSelectedSource(e.target.value)} className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 text-sm font-bold outline-none focus:ring-2 ring-primary/20">
                        {EXAM_SOURCES.map(src => <option key={src.id} value={src.id}>{src.label}</option>)}
                    </select>
                </div>
                <div className="relative group">
                    <Calendar size={14} className="absolute left-3 top-3 text-gray-400" />
                    <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 text-sm font-bold outline-none focus:ring-2 ring-primary/20">
                        {YEARS.map(yr => <option key={yr} value={yr}>{yr}</option>)}
                    </select>
                </div>
            </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Input Side (40%) */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
                <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <FileText size={14}/> Raw Text / JSON Input
                    </label>
                    <div className="flex items-center gap-1.5 text-[10px] text-green-500 font-bold bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full border border-green-100 dark:border-green-800">
                        <CheckCircle size={10}/> All Keys Supported
                    </div>
                </div>
                
                <textarea 
                    value={rawInput}
                    onChange={(e) => setRawInput(e.target.value)}
                    className="w-full h-[500px] p-5 rounded-3xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900 font-mono text-[11px] leading-relaxed focus:ring-4 focus:ring-primary/5 outline-none resize-none shadow-inner dark:text-orange-300"
                    placeholder={`[
  {
    "question": "বলের একক কী?",
    "questionImage": "https://example.com/image.png",
    "options": ["নিউটন", "জুল", "ওয়াট", "প্যাসকেল"],
    "correctAnswerIndex": 0,
    "explanation": "স্যার আইজ্যাক নিউটনের নামানুসারে বলের একক নিউটন।",
    "subject": "Physics 1st Paper",
    "chapter": "নিউটনিয়ান বলবিদ্যা"
  }
]`}
                />
                
                <button 
                    onClick={handleParseText} 
                    className="w-full py-4 bg-gray-900 dark:bg-primary text-white rounded-2xl font-black shadow-xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                    <ListChecks size={20}/> প্রসেস ও প্রিভিউ দেখুন
                </button>
            </div>

            {/* Preview Side (60%) */}
            <div className="lg:col-span-7 flex flex-col h-[610px] bg-gray-50/50 dark:bg-gray-900/50 rounded-[2.5rem] border border-gray-200 dark:border-gray-700 overflow-hidden shadow-inner">
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-50 dark:bg-orange-900/30 text-orange-600 rounded-lg">
                            <Eye size={18}/>
                        </div>
                        <h3 className="font-black text-gray-800 dark:text-white text-sm tracking-tight">
                            Live Preview <span className="ml-2 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full">{processedQuestions.length}</span>
                        </h3>
                    </div>
                    {processedQuestions.length > 0 && (
                        <button 
                            onClick={handleSaveToDB} 
                            disabled={isSaving} 
                            className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>} 
                            SAVE ALL TO DB
                        </button>
                    )}
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar" id="upload-preview-container">
                    {processedQuestions.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-40 space-y-3">
                            <Hash size={64} strokeWidth={1} />
                            <p className="font-bold text-sm">বামপাশে টেক্সট পেস্ট করে প্রসেস করুন</p>
                        </div>
                    ) : (
                        processedQuestions.map((q, idx) => (
                            <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-200 dark:border-gray-700 relative group animate-in slide-in-from-bottom-2 shadow-sm hover:shadow-md transition-all">
                                <button onClick={() => handleDelete(idx)} className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"><Trash2 size={16}/></button>
                                
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="px-2.5 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-black rounded-lg border border-orange-100 dark:border-orange-800">{q.subject}</span>
                                    <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-black rounded-lg border border-purple-100 dark:border-purple-800">{q.chapter}</span>
                                </div>
                                
                                <h4 className="font-bold text-gray-800 dark:text-gray-200 leading-relaxed text-sm md:text-base pr-8 mb-4 font-tiro">
                                    {idx + 1}. {q.question}
                                </h4>
                                {q.questionImage && <img src={q.questionImage} alt="Question" className="max-h-48 rounded-lg mb-4 object-contain border border-gray-200 dark:border-gray-700"/>}
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                                    {q.options.map((opt, i) => (
                                        <div key={i} className={`text-xs p-3 rounded-xl border flex items-center gap-3 transition-colors ${i === q.correctAnswerIndex ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold' : 'bg-gray-50/50 dark:bg-gray-700/30 border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}>
                                            <span className="w-5 h-5 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-[10px] border border-inherit shadow-sm">{String.fromCharCode(65+i)}</span>
                                            <span className="flex-1 font-tiro">{opt}</span>
                                            {q.optionsImages?.[i] && <img src={q.optionsImages[i]} alt={`Option ${i}`} className="mt-2 max-h-24 rounded border border-gray-200 dark:border-gray-600" />}
                                            {i === q.correctAnswerIndex && <CheckCircle size={14}/>}
                                        </div>
                                    ))}
                                </div>
                                
                                {q.explanation && (
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl text-[11px] text-gray-500 dark:text-gray-400 border-l-4 border-primary font-tiro">
                                        <div className="flex items-center gap-1.5 font-black text-[10px] uppercase tracking-wider mb-1 text-primary">
                                            <Info size={12}/> Explanation
                                        </div>
                                        {q.explanation}
                                        {q.explanationImage && <img src={q.explanationImage} alt="Explanation" className="mt-2 max-h-40 rounded border border-gray-200 dark:border-gray-600" />}
                                    </div>
                                )}
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

export default AdminJsonUpload;
