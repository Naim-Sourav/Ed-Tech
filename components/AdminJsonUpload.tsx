
import React, { useState, useMemo } from 'react';
import { saveQuestionsToBankAPI } from '../services/api';
import { QuizQuestion, QuestionPaperMetadata } from '../types';
import { SYLLABUS_DB } from '../services/syllabusData';
import { useToast } from './Toast';
import { Loader2, Save, FileJson, CheckCircle, Trash2, Info, Copy, Upload, Edit2, Archive, Calendar, Tag } from 'lucide-react';

interface RawUploadQuestion extends QuizQuestion {
  // examRef logic is handled by component
}

const EXAM_SOURCES = [
    { id: 'Medical', label: 'মেডিকেল ভর্তি পরীক্ষা (Medical)' },
    { id: 'Dental', label: 'ডেন্টাল ভর্তি পরীক্ষা (Dental)' },
    { id: 'Dhaka_University_A', label: 'ঢাকা বিশ্ববিদ্যালয় (ক ইউনিট)' },
    { id: 'BUET', label: 'বুয়েট (BUET)' },
    { id: 'Engineering_Guccho', label: 'ইঞ্জিনিয়ারিং গুচ্ছ (CKRUET)' },
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
  
  const [jsonInput, setJsonInput] = useState('');
  const [processedQuestions, setProcessedQuestions] = useState<RawUploadQuestion[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // QB Metadata State
  const [selectedSource, setSelectedSource] = useState(EXAM_SOURCES[0].id);
  const [selectedYear, setSelectedYear] = useState(YEARS[0]);

  // Derived examRef
  const examRef = useMemo(() => {
      const sourcePart = selectedSource.toLowerCase().replace(/\s+/g, '_');
      const yearPart = selectedYear.replace(/-/g, '_');
      return `${sourcePart}_${yearPart}`;
  }, [selectedSource, selectedYear]);

  const [editingField, setEditingField] = useState<{ index: number; field: 'subject' | 'chapter' } | null>(null);

  const handlePreview = () => {
    if (!jsonInput.trim()) return showToast("অনুগ্রহ করে JSON পেস্ট করুন", "warning");
    
    try {
      const rawData = JSON.parse(jsonInput);
      
      if (!Array.isArray(rawData)) {
        throw new Error("JSON অবশ্যই একটি Array [...] হতে হবে।");
      }

      // Basic Validation
      const isValid = rawData.every(q => 
        q.question && 
        Array.isArray(q.options) && 
        q.options.length === 4 &&
        typeof q.correctAnswerIndex === 'number' &&
        q.subject && 
        q.chapter
      );

      if (!isValid) {
        throw new Error("JSON ফরম্যাট সঠিক নয়। প্রতিটি প্রশ্নে question, options (4টি), correctAnswerIndex, subject এবং chapter থাকতে হবে।");
      }

      // Automatically inject the examRef into previewed questions
      const enhancedData = rawData.map(q => ({
          ...q,
          examRef: examRef
      }));

      setProcessedQuestions(enhancedData);
      showToast(`${rawData.length} টি প্রশ্ন লোড হয়েছে!`, "success");
    } catch (e: any) {
      showToast(e.message || "Invalid JSON", "error");
    }
  };

  const handleSaveToDB = async () => {
    if (processedQuestions.length === 0) return;

    setIsSaving(true);
    try {
      const finalQuestions = processedQuestions.map(q => ({
          question: q.question,
          options: q.options,
          correctAnswerIndex: q.correctAnswerIndex,
          explanation: q.explanation,
          subject: q.subject, 
          chapter: q.chapter, 
          topic: '', 
          difficulty: q.difficulty || 'MEDIUM',
          examRef: examRef // Ensure examRef is set
      }));

      const sourceLabel = EXAM_SOURCES.find(s => s.id === selectedSource)?.label || selectedSource;
      
      const metadata: QuestionPaperMetadata = {
          id: examRef,
          title: `${sourceLabel} ${selectedYear}`,
          year: selectedYear,
          source: selectedSource,
          totalQuestions: finalQuestions.length,
          time: 60 // Default time
      };

      await saveQuestionsToBankAPI(finalQuestions, metadata);
      
      showToast("সফলভাবে প্রশ্নব্যাংক তৈরি ও সেভ করা হয়েছে!", "success");
      setProcessedQuestions([]);
      setJsonInput('');
    } catch (e) {
      console.error(e);
      showToast("ডাটাবেজ সেভ ব্যর্থ হয়েছে", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (index: number) => {
    const updated = processedQuestions.filter((_, i) => i !== index);
    setProcessedQuestions(updated);
  };

  const handleUpdateField = (index: number, field: 'subject' | 'chapter', value: string) => {
      const updated = [...processedQuestions];
      updated[index] = { ...updated[index], [field]: value };
      
      if (field === 'subject') {
          updated[index].chapter = ''; 
      }
      
      setProcessedQuestions(updated);
      setEditingField(null);
  };

  const copySampleFormat = () => {
      const sample = `[
  {
    "question": "মানবদেহের দীর্ঘতম অস্থি কোনটি?",
    "options": ["ফিমার", "হিউমেরাস", "টিবিয়া", "ফিবুলা"],
    "correctAnswerIndex": 0,
    "explanation": "ফিমার হলো মানবদেহের সবচেয়ে বড় অস্থি।",
    "subject": "Biology 2nd Paper",
    "chapter": "চলন ও অঙ্গচালনা"
  }
]`;
      navigator.clipboard.writeText(sample);
      showToast("স্যাম্পল ফরম্যাট কপি হয়েছে!", "info");
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 animate-in fade-in">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
             <Archive size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Question Bank</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">পরীক্ষার ধরণ ও সাল নির্বাচন করে JSON আপলোড করুন।</p>
        </div>

        {/* Configuration Panel */}
        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 grid md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Tag size={16}/> পরীক্ষার ধরণ (Exam Type)
                </label>
                <select 
                    value={selectedSource} 
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                    {EXAM_SOURCES.map(src => (
                        <option key={src.id} value={src.id}>{src.label}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Calendar size={16}/> শিক্ষাবর্ষ (Session)
                </label>
                <select 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                    {YEARS.map(yr => (
                        <option key={yr} value={yr}>{yr}</option>
                    ))}
                </select>
            </div>
            
            <div className="md:col-span-2">
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
                    <Info size={16}/>
                    <span>
                        <strong>Generated Exam Ref ID:</strong> <span className="font-mono bg-white dark:bg-black/20 px-2 py-0.5 rounded">{examRef}</span>
                        (This ID links all questions to this specific paper)
                    </span>
                </div>
            </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 h-[600px]">
            
            {/* Input Side */}
            <div className="flex flex-col space-y-4 h-full">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <FileJson size={16}/> JSON Input
                    </label>
                    <button onClick={copySampleFormat} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                        <Copy size={12}/> Copy Format
                    </button>
                </div>
                <textarea 
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    className="flex-1 w-full p-4 rounded-xl border bg-gray-50 dark:bg-gray-900 dark:border-gray-700 font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder='Paste your JSON array here...'
                />
                <button 
                    onClick={handlePreview}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    <CheckCircle size={18}/> প্রিভিউ ও প্রসেস করুন
                </button>
            </div>

            {/* Preview Side */}
            <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center sticky top-0 z-10">
                    <h3 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        Preview List <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">{processedQuestions.length}</span>
                    </h3>
                    {processedQuestions.length > 0 && (
                        <button 
                            onClick={handleSaveToDB}
                            disabled={isSaving}
                            className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-700 shadow-md disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} Save Question Bank
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {processedQuestions.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <Info size={40} className="mb-2 opacity-50"/>
                            <p>JSON পেস্ট করে প্রিভিউ বাটনে ক্লিক করুন</p>
                        </div>
                    ) : (
                        processedQuestions.map((q, idx) => {
                            const isEditingSubject = editingField?.index === idx && editingField?.field === 'subject';
                            const isEditingChapter = editingField?.index === idx && editingField?.field === 'chapter';
                            const availableChapters = q.subject && SYLLABUS_DB[q.subject] ? Object.keys(SYLLABUS_DB[q.subject]) : [];

                            return (
                                <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 relative group hover:border-blue-300 transition-colors">
                                    <button onClick={() => handleDelete(idx)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={16}/>
                                    </button>
                                    
                                    {/* Editable Metadata Badges */}
                                    <div className="flex flex-wrap gap-2 mb-3 pr-8">
                                        {/* Subject Badge */}
                                        {isEditingSubject ? (
                                            <select 
                                                autoFocus
                                                value={q.subject}
                                                onChange={(e) => handleUpdateField(idx, 'subject', e.target.value)}
                                                onBlur={() => setEditingField(null)}
                                                className="px-2 py-0.5 text-[10px] rounded border border-blue-300 bg-white dark:bg-gray-700 dark:text-white outline-none"
                                            >
                                                <option value="">Select Subject</option>
                                                {Object.keys(SYLLABUS_DB).map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span 
                                                onClick={() => setEditingField({ index: idx, field: 'subject' })}
                                                className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded border border-blue-100 cursor-pointer hover:bg-blue-100 flex items-center gap-1 group/badge"
                                            >
                                                {q.subject} <Edit2 size={8} className="opacity-0 group-hover/badge:opacity-100"/>
                                            </span>
                                        )}

                                        {/* Chapter Badge */}
                                        {isEditingChapter ? (
                                            <select 
                                                autoFocus
                                                value={q.chapter}
                                                onChange={(e) => handleUpdateField(idx, 'chapter', e.target.value)}
                                                onBlur={() => setEditingField(null)}
                                                className="px-2 py-0.5 text-[10px] rounded border border-purple-300 bg-white dark:bg-gray-700 dark:text-white outline-none max-w-[150px]"
                                            >
                                                <option value="">Select Chapter</option>
                                                {availableChapters.length > 0 ? (
                                                    availableChapters.map(c => <option key={c} value={c}>{c}</option>)
                                                ) : (
                                                    <option disabled>No chapters found for subject</option>
                                                )}
                                            </select>
                                        ) : (
                                            <span 
                                                onClick={() => setEditingField({ index: idx, field: 'chapter' })}
                                                className={`px-2 py-0.5 text-[10px] font-bold rounded border cursor-pointer flex items-center gap-1 group/badge ${!q.chapter || !availableChapters.includes(q.chapter) ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100'}`}
                                            >
                                                {q.chapter || 'Set Chapter'} <Edit2 size={8} className="opacity-0 group-hover/badge:opacity-100"/>
                                            </span>
                                        )}

                                        {examRef && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-mono rounded">ID: {examRef}</span>}
                                    </div>

                                    <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-2">{idx + 1}. {q.question}</h4>
                                    
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        {q.options.map((opt, i) => (
                                            <div key={i} className={`text-xs p-2 rounded border ${i === q.correctAnswerIndex ? 'bg-green-50 border-green-200 text-green-700 font-bold' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                                                {opt}
                                            </div>
                                        ))}
                                    </div>

                                    {q.explanation && (
                                        <p className="text-xs text-gray-500 bg-blue-50/50 p-2 rounded italic border-l-2 border-blue-200">
                                            <span className="font-bold not-italic text-blue-600">ব্যাখ্যা:</span> {q.explanation}
                                        </p>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminJsonUpload;
