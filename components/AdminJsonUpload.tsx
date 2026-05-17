
import React, { useState, useMemo, useEffect } from 'react';
import { saveQuestionsToBankAPI, normalizeText } from '../services/api';
import { SYLLABUS_DB, TopicNode } from '../services/syllabusData';
import { QuizQuestion, QuestionPaperMetadata } from '../types';
import { useToast } from './Toast';
import { Loader2, CheckCircle, Trash2, Info, Eye, Bookmark, Image as ImageIcon, Link as LinkIcon, Copy, Terminal, Sparkles } from 'lucide-react';

declare global {
  interface Window {
    MathJax: any;
  }
}

const BOARDS = [
    "ঢাকা বোর্ড", "চট্টগ্রাম বোর্ড", "রাজশাহী বোর্ড", "কুমিল্লা বোর্ড", 
    "যশোর বোর্ড", "বরিশাল বোর্ড", "সিলেট বোর্ড", "দিনাজপুর বোর্ড", 
    "ময়মনসিংহ বোর্ড", "মাদ্রাসা বোর্ড"
];

const toBengaliNumber = (num: string) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.split('').map(digit => bengaliDigits[parseInt(digit)] || digit).join('');
};

const YEARS = Array.from({length: 15}, (_, i) => {
    const year = (new Date().getFullYear() - i).toString();
    const shortYear = year.substring(2);
    return { english: year, bengaliSuffix: toBengaliNumber(shortYear) };
});

const ImageInput = ({ value, label, onChange }: { value: string, label: string, onChange: (val: string) => void }) => {
    const isMissing = value === "IMAGE_REQUIRED";
    if (!value) return null;

    return (
        <div className="flex flex-col gap-1 w-full scale-95 origin-left">
            <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1.5">
                <ImageIcon size={10} /> {label}
                {isMissing && <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md animate-pulse">Required</span>}
            </label>
            <div className="relative group">
              <input 
                  type="text" 
                  value={value === "IMAGE_REQUIRED" ? "" : value} 
                  onChange={e => onChange(e.target.value)}
                  className={`w-full p-2 pl-7 pr-3 rounded-xl border text-[10px] font-mono transition-all ${isMissing ? 'bg-red-50 border-red-200 text-red-600 focus:ring-red-100' : 'bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 focus:ring-primary/10 border-gray-100'}`}
                  placeholder={isMissing ? "Paste URL here..." : "URL here..."}
                  onFocus={(e) => {
                      if (e.target.value === "") {
                          // Allow typing even if it was IMAGE_REQUIRED
                      }
                  }}
              />
              <LinkIcon size={12} className={`absolute left-2.5 top-2.5 ${isMissing ? 'text-red-400' : 'text-gray-400'}`} />
            </div>
        </div>
    );
};

const TARGETS = [
    'GST (গুচ্ছ)',
    'মেডিকেল ভর্তি পরীক্ষা',
    'ডেন্টাল ভর্তি পরীক্ষা',
    'AFMC ও AMC',
    'ঢাকা বিশ্ববিদ্যালয়'
];

const UNITS = ['A Unit', 'B Unit', 'C Unit', 'D Unit'];

const COLLEGES = [
    "Notre Dame College", "Viqarunnisa Noon College", "Rajuk Uttara Model College", 
    "Dhaka College", "Ideal College", "Holy Cross College", "City College", "Adamjee Cantonment College"
];

const SESSIONS = Array.from({length: 16}, (_, i) => {
    const startYear = 2025 - i;
    const endYear = startYear + 1;
    return `${startYear}-${endYear.toString().substring(2)}`;
});

const AdminJsonUpload: React.FC = () => {
  const { showToast } = useToast();
  const [rawInput, setRawInput] = useState('');
  const [processedQuestions, setProcessedQuestions] = useState<QuizQuestion[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Basic Categorization
  const [selectedLevel, setSelectedLevel] = useState<'ACADEMIC' | 'ADMISSION' | 'GENERAL'>('ACADEMIC');
  
  // Smart Fields State
  const [selectedBoard, setSelectedBoard] = useState(BOARDS[0]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(YEARS[0].english);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedTarget, setSelectedTarget] = useState(TARGETS[0]);
  const [selectedUnit, setSelectedUnit] = useState(UNITS[0]);
  const [selectedSession, setSelectedSession] = useState(SESSIONS[0]);
  
  // Subject & Chapter selection
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');

  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [showAllFieldsIndex, setShowAllFieldsIndex] = useState<number | null>(null);
  const [renderMode, setRenderMode] = useState<'RENDERED' | 'RAW'>('RENDERED');

  const subjects = Object.keys(SYLLABUS_DB);
  const chapters = selectedSubject ? Object.keys(SYLLABUS_DB[selectedSubject] || {}) : [];

  // Handle MathJax rendering in preview
  useEffect(() => {
    if (processedQuestions.length > 0 && window.MathJax && renderMode === 'RENDERED') {
      const timer = setTimeout(() => {
        try {
          window.MathJax.typesetClear();
          window.MathJax.typesetPromise().catch((err: any) => console.error('MathJax error:', err));
        } catch (e) {
          console.error("MathJax trigger error:", e);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [processedQuestions, renderMode]);

  const autoExamRef = useMemo(() => {
      if (selectedLevel === 'ACADEMIC') {
          if (selectedCollege) return `${selectedCollege} ${selectedAcademicYear}`;
          if (selectedBoard) return `${selectedBoard} ${selectedAcademicYear}`;
          return `${selectedAcademicYear}`;
      } else if (selectedLevel === 'ADMISSION') {
          if (selectedTarget === 'মেডিকেল ভর্তি পরীক্ষা') {
              return `MAT ${selectedSession.replace('20', '')}`;
          }
          if (selectedTarget === 'ডেন্টাল ভর্তি পরীক্ষা') {
              return `DAT ${selectedSession.replace('20', '')}`;
          }
          if (selectedTarget === 'AFMC ও AMC') {
              return `AFMC ${selectedSession.replace('20', '')}`;
          }
          if (selectedTarget === 'ঢাকা বিশ্ববিদ্যালয়') {
              return `DU ${selectedUnit} ${selectedSession}`;
          }
          return `${selectedTarget} ${selectedUnit} ${selectedSession}`;
      } else {
          return `${selectedSubject} ${selectedChapter}`.trim() || 'General';
      }
  }, [selectedBoard, selectedAcademicYear, selectedLevel, selectedCollege, selectedTarget, selectedUnit, selectedSession, selectedSubject, selectedChapter]);

  const condensedSyllabus = useMemo(() => {
      const simplified: any = {};
      Object.keys(SYLLABUS_DB).forEach(subject => {
          simplified[subject] = {};
          const subjectData = SYLLABUS_DB[subject];
          Object.keys(subjectData).forEach(chapter => {
              const topics = subjectData[chapter].map(item => {
                  if (typeof item === 'string') return item;
                  return (item as TopicNode).title;
              });
              simplified[subject][chapter] = topics;
          });
      });
      return JSON.stringify(simplified, null, 2);
  }, []);

  const expectedJsonStructure = useMemo(() => {
      const isEnglish = selectedSubject && (selectedSubject.toLowerCase().includes('english') || selectedSubject.includes('ইংরেজি'));
      const structure: any = {
          "orderIndex": 1,
          "question": "প্রশ্ন এখানে লিখুন",
          "options": isEnglish ? ["A", "B", "C", "D"] : ["ক", "খ", "গ", "ঘ"],
          "correctAnswerIndex": 0,
          "explanation": "ব্যাখ্যা (ঐচ্ছিক)",
          "topic": "টপিকের নাম (ঐচ্ছিক)"
      };

      if (!selectedSubject) {
          structure.subject = "সাবজেক্ট এর নাম";
      }
      if (!selectedChapter) {
          structure.chapter = "অধ্যায়ের নাম";
      }

      // Add a comment to help user understand the structure. JSON doesn't support comments but we can write a pseudo comment string.
      structure["_Comment"] = "correctAnswerIndex হলো options array এর সঠিক উত্তরের index (0 থেকে শুরু)";
      structure["_LatexNote"] = "যেকোনো Math বা LaTeX ইকুয়েশন অবশ্যই $...$ অথবা $$...$$ এর ভেতর লিখতে হবে। যেমন: $\\sin \\theta$";

      return `[\n  ${JSON.stringify(structure, null, 4).replace(/\n/g, '\n  ')}\n]`;
  }, [selectedSubject, selectedChapter, selectedLevel]);

  const copyStructureToClipboard = () => {
    navigator.clipboard.writeText(expectedJsonStructure);
    setCopiedPrompt(true);
    showToast("JSON স্ট্রাকচার কপি হয়েছে!", "success");
    setTimeout(() => setCopiedPrompt(false), 3000);
  };

  const applyStimulusToAll = (stimulusText: string, stimulusImage: string) => {
    if (!confirm("আপনি কি প্রথম প্রশ্নের উদ্দীপকটি নিচের সবগুলোতে অ্যাপ্লাই করতে চান?")) return;
    setProcessedQuestions(prev => prev.map(q => ({
      ...q,
      contextText: stimulusText,
      contextImage: stimulusImage
    })));
    showToast("উদ্দীপক সফলভাবে সবগুলোতে যুক্ত হয়েছে", "success");
  };

  const handleParseText = () => {
    if (!rawInput.trim()) return showToast("অনুগ্রহ করে টেক্সট পেস্ট করুন", "warning");
    const cleanInput = rawInput.replace(/```json|```/g, '').trim();
    // Fix invalid single backslashes in JSON string (from latex)
    const escapedInput = cleanInput.replace(/(?<!\\)\\(?!["\\/bfnrtu])/g, '\\\\');

    const ensureLatexWrapped = (text: string) => {
        if (!text || typeof text !== 'string') return text;
        if (text.includes('$') || text.includes('\\(') || text.includes('\\[')) return text;
        
        // ফিক্স: যদি শূন্যস্থান পূরণের জন্য ২ বা ততোধিক আন্ডারস্কোর (____) থাকে,
        // তবে এটিকে সাধারণ টেক্সট হিসেবেই রিটার্ন করবে, Math বানাবে না।
        if (/_{2,}/.test(text)) {
            return text;
        }

        // Check if string contains common latex commands but no $
        if (/\\(frac|sqrt|sin|cos|tan|log|ln|theta|alpha|beta|gamma|pi|pm|therefore|implies|text\{|sec|cosec|cot)|[\^_]/.test(text)) {
            return `$${text}$`;
        }
        return text;
    };

    try {
        const parsed = JSON.parse(escapedInput);
        if (Array.isArray(parsed)) {
            const extracted: QuizQuestion[] = parsed.map((item: any, index: number) => ({
                orderIndex: item.orderIndex || (index + 1),
                question: ensureLatexWrapped(item.question || ""),
                options: Array.isArray(item.options) ? item.options.map((opt: any) => ensureLatexWrapped(String(opt))) : [],
                correctAnswerIndex: Number(item.correctAnswerIndex) || 0,
                explanation: ensureLatexWrapped(item.explanation || ""),
                subject: item.subject || selectedSubject || "General",
                chapter: item.chapter || selectedChapter || "General",
                topic: item.topic || "General",
                examRef: item.examRef || autoExamRef,
                level: item.level || selectedLevel,
                questionImage: item.questionImage || "",
                explanationImage: item.explanationImage || "",
                optionsImages: Array.isArray(item.optionsImages) ? item.optionsImages : ["", "", "", ""],
                contextText: ensureLatexWrapped(item.contextText || item.stimulusText || ""),
                contextImage: item.contextImage || item.stimulusImage || ""
            })).filter(q => q.question && q.options.length > 0);

            if (extracted.length > 0) {
                setProcessedQuestions(extracted);
                showToast(`${extracted.length} টি প্রশ্ন প্রসেস করা হয়েছে!`, "success");
                return;
            }
        }
    } catch (_jsonError) {
        showToast("JSON পার্স এরর। ফরম্যাট চেক করুন।", "error");
    }
  };

  const handleDelete = (index: number) => {
    setProcessedQuestions(prev => {
        const updated = prev.filter((_, i) => i !== index);
        return updated;
    });
    showToast("প্রশ্ন মুছে ফেলা হয়েছে", "info");
  };

  const updateFieldInPreview = (index: number, field: keyof QuizQuestion, value: any) => {
      setProcessedQuestions(prev => {
          const updated = [...prev];
          updated[index] = { ...updated[index], [field]: value };
          return updated;
      });
  };

  const updateOptionImageInPreview = (qIdx: number, oIdx: number, value: string) => {
      setProcessedQuestions(prev => {
          const updated = [...prev];
          const newImages = [...(updated[qIdx].optionsImages || ["", "", "", ""])];
          newImages[oIdx] = value;
          updated[qIdx] = { ...updated[qIdx], optionsImages: newImages };
          return updated;
      });
  };

  const handleSaveToDB = async () => {
    if (processedQuestions.length === 0) return;
    
    const hasMissingImages = processedQuestions.some(q => 
        q.questionImage === "IMAGE_REQUIRED" || 
        q.contextImage === "IMAGE_REQUIRED" || 
        q.explanationImage === "IMAGE_REQUIRED" ||
        (q.optionsImages && q.optionsImages.some(img => img === "IMAGE_REQUIRED"))
    );

    if (hasMissingImages && !window.confirm("কিছু জায়গায় 'IMAGE_REQUIRED' রয়ে গেছে। সেভ করবেন?")) return;

    setIsSaving(true);
    try {
      const metadata: QuestionPaperMetadata = {
          id: autoExamRef,
          title: autoExamRef,
          year: selectedLevel === 'ACADEMIC' ? selectedAcademicYear : selectedSession,
          source: selectedLevel === 'ACADEMIC' ? selectedBoard : selectedTarget,
          totalQuestions: processedQuestions.length,
          time: 60
      };

      const normalizedQuestions = processedQuestions.map((q, qIdx) => {
          const item: any = {
              ...q,
              orderIndex: q.orderIndex || (qIdx + 1),
              question: normalizeText(q.question),
              options: q.options.map(o => normalizeText(o)),
              explanation: normalizeText(q.explanation || ''),
              subject: normalizeText(q.subject || selectedSubject || ''),
              chapter: normalizeText(q.chapter || selectedChapter || ''),
              topic: q.topic ? normalizeText(q.topic) : undefined,
              contextText: q.contextText ? normalizeText(q.contextText) : undefined,
              examRef: q.examRef || autoExamRef,
              level: q.level || selectedLevel,
              // Map state fields to question object
              board: selectedLevel === 'ACADEMIC' ? selectedBoard : undefined,
              college: selectedLevel === 'ACADEMIC' ? selectedCollege : undefined,
              target: selectedLevel === 'ADMISSION' ? selectedTarget : undefined,
              unit: selectedLevel === 'ADMISSION' ? selectedUnit : undefined,
              session: selectedLevel === 'ADMISSION' ? selectedSession : selectedLevel === 'ACADEMIC' ? selectedAcademicYear : undefined
          };

          ['contextImage', 'questionImage', 'explanationImage', 'contextText', 'topic', 'board', 'college', 'target', 'unit', 'session'].forEach(f => {
              if (!item[f] || item[f] === "" || item[f] === "IMAGE_REQUIRED") delete item[f];
          });

          if (item.optionsImages && item.optionsImages.every((img: string) => !img || img === "" || img === "IMAGE_REQUIRED")) {
              delete item.optionsImages;
          }

          if (item.orderIndex !== undefined) {
            item.orderIndex = Number(item.orderIndex);
          }

          return item;
      });

      await saveQuestionsToBankAPI(normalizedQuestions, metadata);
      showToast("সফলভাবে সেভ হয়েছে!", "success");
      setProcessedQuestions([]);
      setRawInput('');
    } catch (_e) {
      showToast("সেভ এরর", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 shadow-xl p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b pb-8">
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl flex items-center justify-center shadow-inner">
                    <Sparkles size={28} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">Smart Upload</h2>
                    <p className="text-gray-500 text-sm font-medium">Auto-Tag: <span className="font-bold text-gray-900 dark:text-gray-200">{autoExamRef}</span></p>
                </div>
            </div>
            
            <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
                {/* Level Priority Selector */}
                <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-xl flex gap-1">
                    {(['ACADEMIC', 'ADMISSION', 'GENERAL'] as const).map(lvl => (
                        <button
                            key={lvl}
                            onClick={() => setSelectedLevel(lvl)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${selectedLevel === lvl ? 'bg-white dark:bg-gray-600 text-primary shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                            {lvl}
                        </button>
                    ))}
                </div>

                {/* Conditional Selectors based on Level */}
                <div className="flex flex-wrap gap-2">
                    {selectedLevel === 'ACADEMIC' && (
                        <>
                            <select value={selectedBoard} onChange={(e) => { setSelectedBoard(e.target.value); setSelectedCollege(''); }} className="p-2.5 rounded-xl border font-tiro text-xs font-bold bg-white dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 ring-primary/20">
                                <option value="">কোন বোর্ড নয়</option>
                                {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                            <span className="self-center text-xs text-gray-400 font-bold">OR</span>
                            <select value={selectedCollege} onChange={(e) => { setSelectedCollege(e.target.value); setSelectedBoard(''); }} className="p-2.5 rounded-xl border text-xs font-bold bg-white dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 ring-primary/20">
                                <option value="">কোন কলেজ নয়</option>
                                {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <select value={selectedAcademicYear} onChange={(e) => setSelectedAcademicYear(e.target.value)} className="p-2.5 rounded-xl border text-xs font-bold bg-white dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 ring-primary/20">
                                {YEARS.map(yr => <option key={yr.english} value={yr.english}>{yr.english}</option>)}
                            </select>
                        </>
                    )}

                    {selectedLevel === 'ADMISSION' && (
                        <>
                            <select value={selectedTarget} onChange={(e) => {
                                setSelectedTarget(e.target.value);
                                if (e.target.value === 'মেডিকেল ভর্তি পরীক্ষা') setSelectedUnit('MBBS/BDS');
                                else if (e.target.value === 'ডেন্টাল ভর্তি পরীক্ষা') setSelectedUnit('BDS');
                                else if (e.target.value === 'AFMC ও AMC') setSelectedUnit('AFMC & AMC');
                            }} className="p-2.5 rounded-xl border font-tiro text-xs font-bold bg-white dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 ring-primary/20">
                                {TARGETS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            {selectedTarget !== 'মেডিকেল ভর্তি পরীক্ষা' && selectedTarget !== 'ডেন্টাল ভর্তি পরীক্ষা' && selectedTarget !== 'AFMC ও AMC' && (
                                <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} className="p-2.5 rounded-xl border text-xs font-bold bg-white dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 ring-primary/20">
                                    {selectedTarget === 'GST (গুচ্ছ)' ? (
                                        <>
                                            <option value="A Unit">A Unit</option>
                                            <option value="B Unit">B Unit</option>
                                            <option value="C Unit">C Unit</option>
                                        </>
                                    ) : (
                                        <>
                                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                        </>
                                    )}
                                </select>
                            )}
                            <select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)} className="p-2.5 rounded-xl border text-xs font-bold bg-white dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 ring-primary/20">
                                <option value="">Year/Session</option>
                                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </>
                    )}

                    {/* Subject and Chapter selections */}
                    <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
                        <select value={selectedSubject} onChange={(e) => { setSelectedSubject(e.target.value); setSelectedChapter(''); }} className="p-2 rounded-lg border-0 text-xs font-bold bg-white dark:bg-gray-800 dark:text-white outline-none shadow-sm min-w-[140px]">
                            <option value="">Select Subject</option>
                            {subjects.map(s => <option key={s} value={s}>{s.split('(')[0]}</option>)}
                        </select>
                        <select value={selectedChapter} disabled={!selectedSubject} onChange={(e) => setSelectedChapter(e.target.value)} className="p-2 rounded-lg border-0 text-xs font-bold bg-white dark:bg-gray-800 dark:text-white outline-none shadow-sm min-w-[140px] disabled:opacity-50">
                            <option value="">Select Chapter</option>
                            {chapters.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
            </div>
        </div>

        {/* Gemini Helper */}
        <div className="bg-indigo-50 dark:bg-indigo-950/20 p-6 rounded-[2rem] border border-indigo-100 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <Terminal className="text-indigo-600" size={32} />
                    <div>
                        <h3 className="text-lg font-black text-indigo-900 dark:text-indigo-300">JSON Structure format</h3>
                        <p className="text-indigo-700 text-sm">বর্তমান সেটিংস অনুযায়ী নিচের স্ট্রাকচার কপি করুন</p>
                    </div>
                </div>
                <button onClick={copyStructureToClipboard} className={`px-8 py-4 ${copiedPrompt ? 'bg-green-600' : 'bg-indigo-600'} text-white font-black rounded-2xl transition-all flex items-center gap-3`}>
                    {copiedPrompt ? <CheckCircle size={20}/> : <Copy size={20}/>} {copiedPrompt ? 'Copied' : 'Copy JSON Format'}
                </button>
            </div>
            <pre className="bg-white dark:bg-gray-900 border border-indigo-100 dark:border-gray-700 p-4 rounded-xl text-xs font-mono overflow-auto text-indigo-900 dark:text-indigo-300">
                {expectedJsonStructure}
            </pre>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-4">
                <textarea 
                    value={rawInput}
                    onChange={(e) => setRawInput(e.target.value)}
                    className="w-full h-[500px] p-5 rounded-3xl border bg-gray-50 dark:bg-gray-900 font-mono text-[11px] outline-none"
                    placeholder="জেমিনির JSON এখানে পেস্ট করুন..."
                />
                <button onClick={handleParseText} className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black shadow-lg">Validate & Preview</button>
            </div>

            <div className="lg:col-span-7 flex flex-col h-[610px] bg-gray-50/50 dark:bg-gray-900/50 rounded-[2.5rem] border overflow-hidden">
                <div className="p-5 border-b bg-white dark:bg-gray-800 flex justify-between items-center sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <h3 className="font-black text-sm">Preview ({processedQuestions.length})</h3>
                        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl border border-gray-200 dark:border-gray-600">
                            <button 
                                onClick={() => setRenderMode('RENDERED')}
                                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${renderMode === 'RENDERED' ? 'bg-white dark:bg-gray-600 text-primary shadow-sm' : 'text-gray-400'}`}
                            >
                                <Eye size={12} className="inline mr-1" /> View
                            </button>
                            <button 
                                onClick={() => setRenderMode('RAW')}
                                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${renderMode === 'RAW' ? 'bg-white dark:bg-gray-600 text-primary shadow-sm' : 'text-gray-400'}`}
                            >
                                <Terminal size={12} className="inline mr-1" /> Edit
                            </button>
                        </div>
                        {processedQuestions.length > 1 && (
                            <button 
                                onClick={() => applyStimulusToAll(processedQuestions[0].contextText || '', processedQuestions[0].contextImage || '')}
                                className="px-3 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg border border-blue-100 hover:bg-blue-100 transition-all flex items-center gap-1.5"
                                title="Apply the first question's stimulus to all others"
                            >
                                <Bookmark size={12}/> Bulk Stimulus
                            </button>
                        )}
                    </div>
                    {processedQuestions.length > 0 && (
                        <button onClick={handleSaveToDB} disabled={isSaving} className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black transition-all">
                            {isSaving ? <Loader2 size={14} className="animate-spin"/> : 'FINAL UPLOAD'}
                        </button>
                    )}
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                    {processedQuestions.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-40">
                            <Sparkles size={64} className="mb-2" />
                            <p className="font-bold">JSON পেস্ট করে কন্টেন্ট চেক করুন</p>
                        </div>
                    ) : (
                        processedQuestions.map((q, idx) => {
                            const isMissing = q.questionImage === "IMAGE_REQUIRED" || q.contextImage === "IMAGE_REQUIRED" || q.explanationImage === "IMAGE_REQUIRED" || (q.optionsImages && q.optionsImages.some(img => img === "IMAGE_REQUIRED"));
                            const hasTopImages = q.contextImage || q.questionImage || q.explanationImage;
                            const forceAll = showAllFieldsIndex === idx;
                            const isRepeatStimulus = idx > 0 && q.contextText && q.contextText === processedQuestions[idx - 1].contextText && q.contextImage === processedQuestions[idx - 1].contextImage;

                            // Find group range for a new stimulus
                            let stimulusRange = null;
                            if (!isRepeatStimulus && (q.contextText || q.contextImage)) {
                                let endIndex = idx;
                                for (let i = idx + 1; i < processedQuestions.length; i++) {
                                    if (processedQuestions[i].contextText === q.contextText && processedQuestions[i].contextImage === q.contextImage) {
                                        endIndex = i;
                                    } else {
                                        break;
                                    }
                                }
                                if (endIndex > idx) {
                                    stimulusRange = { start: idx + 1, end: endIndex + 1 };
                                }
                            }

                            return (
                                <div key={idx} className={`bg-white dark:bg-gray-800 p-6 rounded-3xl border shadow-sm relative transition-all ${isMissing ? 'border-red-300 ring-4 ring-red-500/5' : 'border-gray-200'} ${isRepeatStimulus ? 'border-dashed border-t-0 rounded-t-none -mt-6' : ''}`}>
                                    <button onClick={() => handleDelete(idx)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                                    
                                    {/* Stimulus Instruction Header */}
                                    {stimulusRange && (
                                        <div className="mb-4 text-center border-y border-gray-100 dark:border-gray-700 py-1 bg-gray-50/50 dark:bg-gray-900/30">
                                            <p className="text-[10px] font-bold text-gray-400 font-tiro italic">
                                                নিচের উদ্দীপকের আলোকে {toBengaliNumber(stimulusRange.start.toString())} ও {toBengaliNumber(stimulusRange.end.toString())} নং প্রশ্নের উত্তর দাও:
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="px-2 py-1 bg-purple-50 text-purple-600 text-[9px] font-black rounded-lg border border-purple-100">{q.examRef}</span>
                                        <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-lg border border-indigo-100">{q.subject}</span>
                                        <span className="px-2 py-1 bg-gray-50 text-gray-500 text-[9px] font-black rounded-lg border border-gray-100">{q.chapter}</span>
                                        <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-lg border border-emerald-100 italic">{q.topic}</span>
                                        {isMissing && <span className="px-2 py-1 bg-red-500 text-white text-[9px] font-black rounded-lg animate-pulse">IMAGE REQUIRED</span>}
                                    </div>
                                    
                                    {renderMode === 'RENDERED' ? (
                                        <div className="space-y-4">
                                            {q.contextText && (
                                                <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border-l-4 border-blue-200 dark:border-blue-800 text-xs font-tiro leading-relaxed tex2jax_process">
                                                    <span className="text-[10px] font-black text-blue-500 uppercase mb-1 block">উদ্দীপক (Context)</span>
                                                    {q.contextText}
                                                    {q.contextImage && q.contextImage !== "IMAGE_REQUIRED" && (
                                                        <img src={q.contextImage} alt="Context" className="mt-2 max-h-32 rounded-lg object-contain border border-blue-100 dark:border-blue-800/30" referrerPolicy="no-referrer" />
                                                    )}
                                                </div>
                                            )}
                                            <div className="flex justify-between items-start gap-4 mb-4">
                                                <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm font-tiro tex2jax_process leading-relaxed flex-1">
                                                    {idx + 1}. {q.question}
                                                </h4>
                                                <button
                                                    onClick={() => setShowAllFieldsIndex(showAllFieldsIndex === idx ? null : idx)}
                                                    className={`p-1.5 rounded-lg border flex-shrink-0 transition-all ${showAllFieldsIndex === idx ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 shadow-sm'}`}
                                                    title="Add/Edit Images"
                                                >
                                                    <ImageIcon size={14} />
                                                </button>
                                            </div>
                                            {q.questionImage && q.questionImage !== "IMAGE_REQUIRED" && (
                                                <img src={q.questionImage} alt="Question" className="max-h-48 rounded-lg object-contain border border-gray-100 dark:border-gray-700 mb-4" referrerPolicy="no-referrer" />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-3 mb-4">
                                            <textarea 
                                                value={q.contextText || ''}
                                                onChange={e => updateFieldInPreview(idx, 'contextText', e.target.value)}
                                                className="w-full p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 rounded-xl text-xs font-tiro outline-none min-h-[40px]"
                                                placeholder="উদ্দীপক থাকলে এখানে লিখুন..."
                                            />
                                            <textarea 
                                                value={q.question}
                                                onChange={e => updateFieldInPreview(idx, 'question', e.target.value)}
                                                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-xl text-xs font-tiro leading-relaxed outline-none min-h-[60px]"
                                                placeholder="প্রশ্নটি এখানে এডিট করুন..."
                                            />
                                        </div>
                                    )}

                                    {(hasTopImages || forceAll) && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-gray-100/50 dark:bg-gray-900/50 rounded-2xl mb-4">
                                            <ImageInput value={forceAll ? (q.contextImage || " ") : (q.contextImage || "")} label="Uddipok Image" onChange={v => updateFieldInPreview(idx, 'contextImage', v)} />
                                            <ImageInput value={forceAll ? (q.questionImage || " ") : (q.questionImage || "")} label="Question Image" onChange={v => updateFieldInPreview(idx, 'questionImage', v)} />
                                            <ImageInput value={forceAll ? (q.explanationImage || " ") : (q.explanationImage || "")} label="Explanation Image" onChange={v => updateFieldInPreview(idx, 'explanationImage', v)} />
                                        </div>
                                    )}
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                        {q.options.map((opt, i) => {
                                            const hasOptImg = q.optionsImages && q.optionsImages[i];
                                            return (
                                                <div key={i} className={`text-[11px] p-4 rounded-3xl border flex flex-col gap-2 transition-all ${i === q.correctAnswerIndex ? 'bg-emerald-50 border-emerald-200' : 'bg-white dark:bg-gray-700 border-gray-100 shadow-sm'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <button 
                                                            onClick={() => updateFieldInPreview(idx, 'correctAnswerIndex', i)}
                                                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${i === q.correctAnswerIndex ? 'bg-emerald-500 text-white shadow-emerald-200 shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                                        >
                                                            {String.fromCharCode(65+i)}
                                                        </button>
                                                        {renderMode === 'RENDERED' ? (
                                                            <span className={`flex-1 font-tiro tex2jax_process ${i === q.correctAnswerIndex ? 'text-emerald-800 font-bold' : 'text-gray-600 dark:text-gray-300'}`}>{opt}</span>
                                                        ) : (
                                                            <input 
                                                                type="text"
                                                                value={opt}
                                                                onChange={e => {
                                                                    const newOpts = [...q.options];
                                                                    newOpts[i] = e.target.value;
                                                                    updateFieldInPreview(idx, 'options', newOpts);
                                                                }}
                                                                className="flex-1 bg-transparent border-b border-dashed border-gray-200 dark:border-gray-600 outline-none focus:border-primary px-1 font-tiro text-xs"
                                                            />
                                                        )}
                                                    </div>
                                                    {(hasOptImg || forceAll) && (
                                                        <div className="space-y-2">
                                                            <ImageInput 
                                                                value={forceAll ? ((q.optionsImages && q.optionsImages[i]) || " ") : ((q.optionsImages && q.optionsImages[i]) || "")} 
                                                                label={`Opt ${String.fromCharCode(65+i)} Image`} 
                                                                onChange={v => updateOptionImageInPreview(idx, i, v)} 
                                                            />
                                                            {hasOptImg && q.optionsImages?.[i] !== "IMAGE_REQUIRED" && renderMode === 'RENDERED' && (
                                                                <img src={q.optionsImages?.[i]} alt={`Option ${i}`} className="h-12 object-contain rounded border border-gray-100 self-center" referrerPolicy="no-referrer" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Explanation Editor */}
                                    <div className="mt-6 p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                                        <label className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <Info size={12}/> Explanation / ব্যাখ্যা
                                        </label>
                                        
                                        {renderMode === 'RENDERED' ? (
                                            <div className="space-y-3">
                                                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-xs font-tiro leading-relaxed tex2jax_process">
                                                    {q.explanation || 'No explanation provided.'}
                                                </div>
                                                {q.explanationImage && q.explanationImage !== "IMAGE_REQUIRED" && (
                                                    <img src={q.explanationImage} alt="Explanation" className="max-h-32 rounded-lg object-contain border border-gray-100 dark:border-gray-700" referrerPolicy="no-referrer" />
                                                )}
                                            </div>
                                        ) : (
                                            <textarea 
                                                value={q.explanation || ''}
                                                onChange={e => updateFieldInPreview(idx, 'explanation', e.target.value)}
                                                className="w-full p-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl text-xs font-tiro leading-relaxed focus:ring-2 ring-primary/10 outline-none min-h-[100px]"
                                                placeholder="ব্যাখ্যা এখানে লিখুন বা এডিট করুন..."
                                            />
                                        )}
                                        <div className="mt-3">
                                            <ImageInput value={forceAll ? (q.explanationImage || " ") : (q.explanationImage || "")} label="Explanation Image" onChange={v => updateFieldInPreview(idx, 'explanationImage', v)} />
                                        </div>
                                    </div>
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
