
import React, { useState, useRef } from 'react';
import { generateQuiz } from '../services/geminiService';
import { saveQuestionsToBankAPI } from '../services/api';
import { ExamStandard, QuizQuestion } from '../types';
import { SYLLABUS_DB, TopicNode } from '../services/syllabusData';
import { Sparkles, Save, Trash2, Brain, CheckCircle, Loader2, RefreshCw, Layers, BookOpen, Hash, CheckSquare, Square, Upload, Download, XCircle, PieChart, Atom, Beaker, Calculator, Dna, Activity, Globe, ChevronDown, Book, ListFilter, Check } from 'lucide-react';
import { useToast } from './Toast';

// --- BLOOM'S TAXONOMY & QUESTION STRATEGIES ---
interface BatchStrategy {
    label: string;
    temp: number;
    instruction: string;
    color: string;
}

const BATCH_STRATEGIES: BatchStrategy[] = [
    {
        label: "Knowledge (জ্ঞানমূলক)",
        temp: 0.3,
        instruction: "Focus on: Knowledge & Memory. Ask direct questions about definitions, specific dates, scientific names, SI units, formulas, and fundamental facts from the textbook.",
        color: "bg-orange-100 text-orange-700 border-orange-200"
    },
    {
        label: "Comprehension (অনুধাবনমূলক)",
        temp: 0.4,
        instruction: "Focus on: Comprehension. Ask 'Why' and 'How' type questions. Focus on explaining concepts, distinguishing between similar terms, characteristics, and underlying principles.",
        color: "bg-green-100 text-green-700 border-green-200"
    },
    {
        label: "Application (প্রয়োগমূলক/গাণিতিক)",
        temp: 0.5,
        instruction: "Focus on: Application & Problem Solving. Create mathematical problems (for Physics/Chem/Math) or scenario-based questions where the student must apply a specific law or formula.",
        color: "bg-yellow-100 text-yellow-700 border-yellow-200"
    },
    {
        label: "Higher Order (উচ্চতর দক্ষতা)",
        temp: 0.7,
        instruction: "Focus on: Analysis & Evaluation. Create complex, multi-step questions that require linking multiple concepts. Ask to analyze a statement or evaluate a conclusion.",
        color: "bg-purple-100 text-purple-700 border-purple-200"
    },
    {
        label: "Admission Standard (ভর্তি যুদ্ধ)",
        temp: 0.6,
        instruction: "Focus on: University Admission Standard. Create tricky, confusing questions often found in Medical/Engineering exams. Use 'Which is NOT true?', and exception-based questions.",
        color: "bg-red-100 text-red-700 border-red-200"
    },
    {
        label: "Deep Dive (গভীর তথ্য)",
        temp: 0.8,
        instruction: "Focus on: Obscure & Deep Details. Find specific lines from standard textbooks that students often skip. Ask about specific values, exceptions, or minor details.",
        color: "bg-gray-100 text-gray-700 border-gray-200"
    }
];

const AdminQuestionGenerator: React.FC = () => {
  // Input State
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [standard, setStandard] = useState<ExamStandard>(ExamStandard.HSC);
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const { showToast } = useToast();
  
  // Custom Distribution State: Index of Strategy -> Count
  const [distribution, setDistribution] = useState<number[]>([5, 3, 2, 0, 0, 0]); 
  
  // Logic State
  const [generatedQuestions, setGeneratedQuestions] = useState<QuizQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState('');
  
  // New State for Smart Upload
  const [mode, setMode] = useState<'AI' | 'MANUAL'>('AI');
  const [manualInput, setManualInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived Data
  const subjects = Object.keys(SYLLABUS_DB);
  const chapters = subject ? Object.keys(SYLLABUS_DB[subject] || {}) : [];
  const availableTopics = (subject && chapter) ? SYLLABUS_DB[subject][chapter] || [] : [];
  const totalQuestionsToGenerate = distribution.reduce((a, b) => a + b, 0);

  const getSubjectIcon = (subject: string) => {
    if (subject.includes('Physics')) return <Atom size={18} className="text-orange-600 dark:text-orange-400" />;
    if (subject.includes('Chemistry')) return <Beaker size={18} className="text-orange-600 dark:text-orange-400" />;
    if (subject.includes('Math')) return <Calculator size={18} className="text-orange-600 dark:text-orange-400" />;
    if (subject.includes('Biology')) return <Dna size={18} className="text-green-600 dark:text-green-400" />;
    if (subject.includes('English') || subject.includes('Bangla')) return <Book size={18} className="text-teal-600 dark:text-teal-400" />;
    if (subject.includes('ICT')) return <Activity size={18} className="text-orange-600 dark:text-orange-400" />;
    return <Globe size={18} className="text-gray-600 dark:text-gray-400" />;
  };

  const handleSubjectSelection = (val: string) => {
    setSubject(val);
    setChapter(''); 
    setSelectedTopics([]);
    setIsSubjectDropdownOpen(false);
  };

  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setChapter(e.target.value);
    setSelectedTopics([]);
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]);
  };

  // Helper to check if a group (TopicNode) is fully selected
  const isGroupFullySelected = (node: TopicNode) => {
      return node.subTopics.every(sub => selectedTopics.includes(sub));
  };

  // Toggle entire group
  const toggleGroup = (node: TopicNode) => {
      if (isGroupFullySelected(node)) {
          // Deselect all
          setSelectedTopics(prev => prev.filter(t => !node.subTopics.includes(t)));
      } else {
          // Select all (merge)
          setSelectedTopics(prev => {
              const newSet = new Set(prev);
              node.subTopics.forEach(t => newSet.add(t));
              return Array.from(newSet);
          });
      }
  };

  const selectAllTopics = () => {
    const allLeafLabels: string[] = [];
    
    // Flatten logic
    availableTopics.forEach(t => {
        if (typeof t === 'string') {
            allLeafLabels.push(t);
        } else {
            allLeafLabels.push(...t.subTopics);
        }
    });

    // Toggle Logic
    if (selectedTopics.length === allLeafLabels.length) {
        setSelectedTopics([]);
    } else {
        setSelectedTopics(allLeafLabels);
    }
  };

  const updateDistribution = (index: number, val: number) => {
      const newDist = [...distribution];
      newDist[index] = Math.max(0, val);
      setDistribution(newDist);
  };

  const handleSmartUpload = () => {
    if (!subject || !chapter) return showToast("বিষয় এবং অধ্যায় নির্বাচন করুন।", "warning");
    if (!manualInput.trim()) return showToast("অনুগ্রহ করে টেক্সট পেস্ট করুন", "warning");

    try {
        // Try JSON Parse first
        let extracted: QuizQuestion[] = [];
        try {
            const parsed = JSON.parse(manualInput);
            if (Array.isArray(parsed)) {
                extracted = parsed.map((item: any) => ({
                    question: item.question || "",
                    options: Array.isArray(item.options) ? item.options : [],
                    correctAnswerIndex: Number(item.correctAnswerIndex) || 0,
                    explanation: item.explanation || "",
                    subject: subject, // Force selected subject
                    chapter: chapter, // Force selected chapter
                    topic: item.topic || selectedTopics[0] || "General", // Use item topic or first selected or General
                    examRef: item.examRef,
                    questionImage: item.questionImage,
                    explanationImage: item.explanationImage,
                    optionsImages: item.optionsImages,
                    difficulty: item.difficulty || "Manual Upload"
                })).filter(q => q.question && q.options.length > 0);
            }
        } catch (jsonError) {
            // Fallback to Regex (similar to AdminJsonUpload)
             const regex = /{[^{}]*}/g; 
             const matches = manualInput.match(regex);
             
             if (matches) {
                 matches.forEach(block => {
                     const qMatch = block.match(/(?:"question"|question)\s*:\s*"(.*?)"/s);
                     const oMatch = block.match(/(?:"options"|options)\s*:\s*\[(.*?)\]/s);
                     const ansMatch = block.match(/(?:"correctAnswerIndex"|correctAnswerIndex)\s*:\s*(\d+)/);
                     const expMatch = block.match(/(?:"explanation"|explanation)\s*:\s*"(.*?)"/s);
                     
                     if (qMatch && oMatch && ansMatch) {
                         const optionsStr = oMatch[1];
                         const options = optionsStr.split(/",\s*"/).map(o => o.replace(/^"|"$/g, '').trim());
                         
                         extracted.push({
                             question: qMatch[1].trim(),
                             options: options,
                             correctAnswerIndex: parseInt(ansMatch[1]),
                             explanation: expMatch ? expMatch[1].trim() : '',
                             subject: subject,
                             chapter: chapter,
                             topic: selectedTopics[0] || "General",
                             difficulty: "Manual Upload"
                         });
                     }
                 });
             }
        }

        if (extracted.length > 0) {
            setGeneratedQuestions(prev => [...prev, ...extracted]);
            showToast(`${extracted.length} টি প্রশ্ন সফলভাবে প্রসেস করা হয়েছে!`, "success");
            setManualInput('');
        } else {
            showToast("কোনো বৈধ প্রশ্ন পাওয়া যায়নি। ফরম্যাট চেক করুন।", "error");
        }

    } catch (e: any) {
        showToast("Error: " + e.message, "error");
    }
  };

  const handleGenerate = async () => {
    if (!subject || !chapter) return showToast("বিষয় এবং অধ্যায় নির্বাচন করুন।", "warning");
    if (selectedTopics.length === 0) return showToast("অন্তত একটি টপিক নির্বাচন করুন।", "warning");
    if (totalQuestionsToGenerate === 0) return showToast("অন্তত একটি প্রশ্নের সংখ্যা দিন।", "warning");

    setIsGenerating(true);
    
    try {
      // Loop through selected topics
      for (let tIndex = 0; tIndex < selectedTopics.length; tIndex++) {
        const currentTopic = selectedTopics[tIndex];
        
        // Loop through distribution types
        for (let sIndex = 0; sIndex < BATCH_STRATEGIES.length; sIndex++) {
            const count = distribution[sIndex];
            if (count > 0) {
                const strategy = BATCH_STRATEGIES[sIndex];
                
                setProgress(`Topic: ${currentTopic} | Generating ${count} ${strategy.label}`);
                
                const config = [{
                    subject, chapter, topics: [currentTopic]
                }];

                // Generate specific batch
                try {
                    // Split into chunks of 10 max to ensure quality
                    let remaining = count;
                    while (remaining > 0) {
                        const batchSize = Math.min(remaining, 10);
                        const questions = await generateQuiz(
                            config,
                            standard,
                            batchSize,
                            undefined,
                            strategy.instruction,
                            strategy.temp
                        );

                        if (questions && questions.length > 0) {
                            const enhanced = questions.map(q => ({
                                ...q,
                                subject, chapter, topic: currentTopic,
                                difficulty: strategy.label
                            }));
                            setGeneratedQuestions(prev => [...prev, ...enhanced]);
                        }
                        remaining -= batchSize;
                        await new Promise(r => setTimeout(r, 1500)); // Rate limit pause
                    }
                } catch (err) {
                    console.error("Batch failed", err);
                }
            }
        }
      }

      setProgress('Generation Complete!');
      setTimeout(() => setProgress(''), 3000);

    } catch (error) {
      console.error(error);
      showToast("সমস্যা হয়েছে।", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToDB = async () => {
    if (generatedQuestions.length === 0) return;
    setIsSaving(true);
    try {
      const sanitized = generatedQuestions.map(q => ({
        ...q,
        correctAnswerIndex: Number(q.correctAnswerIndex),
        options: q.options || []
      }));
      await saveQuestionsToBankAPI(sanitized);
      showToast(`সফলভাবে ${generatedQuestions.length} টি প্রশ্ন সেভ হয়েছে!`, "success");
      setTimeout(() => { setGeneratedQuestions([]); }, 2000);
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQ = (index: number) => {
    setGeneratedQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const parsed = JSON.parse(ev.target?.result as string);
            if (Array.isArray(parsed)) {
                setGeneratedQuestions(prev => [...prev, ...parsed]);
                showToast("Imported successfully", "success");
            }
        } catch (e) { showToast("Invalid JSON", "error"); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 animate-in fade-in">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
             <Brain size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">স্মার্ট প্রশ্ন জেনারেটর</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">AI দিয়ে প্রশ্ন তৈরি করুন অথবা ম্যানুয়ালি আপলোড করুন</p>
          
          {/* Mode Toggle */}
          <div className="flex justify-center mt-6">
              <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-xl inline-flex">
                  <button 
                      onClick={() => setMode('AI')}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${mode === 'AI' ? 'bg-white dark:bg-gray-600 shadow-sm text-orange-600 dark:text-orange-300' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                      <Sparkles size={16}/> AI Generator
                  </button>
                  <button 
                      onClick={() => setMode('MANUAL')}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${mode === 'MANUAL' ? 'bg-white dark:bg-gray-600 shadow-sm text-green-600 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                      <Upload size={16}/> Smart Upload
                  </button>
              </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
           
           {/* Left: Topic Selection */}
           <div className="lg:col-span-1 space-y-6">
               <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-5">
                   <div className="relative">
                        <label className="block text-sm font-bold mb-2">বিষয়</label>
                        <button 
                          onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
                          className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-600 flex items-center justify-between bg-white dark:text-white"
                        >
                           <div className="flex items-center gap-2">
                              {subject ? getSubjectIcon(subject) : <Layers size={18} className="text-gray-400"/>}
                              <span className={subject ? 'text-gray-900 dark:text-white' : 'text-gray-500'}>
                                {subject ? subject.split('(')[0] : 'নির্বাচন করুন...'}
                              </span>
                           </div>
                           <ChevronDown size={16} className="text-gray-500"/>
                        </button>
                        
                        {isSubjectDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                                {subjects.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => handleSubjectSelection(s)}
                                        className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                                    >
                                        {getSubjectIcon(s)}
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{s.split('(')[0]}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                   </div>
                   
                   <div>
                        <label className="block text-sm font-bold mb-2">অধ্যায়</label>
                        <select value={chapter} onChange={handleChapterChange} disabled={!subject} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-600">
                            <option value="">নির্বাচন করুন...</option>
                            {chapters.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                   </div>
                   {chapter && (
                       <div>
                           <div className="flex justify-between items-center mb-2">
                               <label className="text-sm font-bold flex items-center gap-1"><ListFilter size={14}/> টপিক</label>
                               <button onClick={selectAllTopics} className="text-xs text-primary font-bold hover:underline">সব সিলেক্ট করুন</button>
                           </div>
                           <div className="max-h-[400px] overflow-y-auto grid gap-2 pr-1 custom-scrollbar">
                               {availableTopics.map((t, idx) => {
                                   if (typeof t === 'string') {
                                       // Standard Topic
                                       return (
                                           <button key={idx} onClick={() => toggleTopic(t)} className={`text-left p-3 rounded-xl text-xs font-medium border transition-all ${selectedTopics.includes(t) ? 'bg-orange-50 border-orange-500 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-orange-300'}`}>
                                               {t}
                                           </button>
                                       );
                                   } else {
                                       // Topic with Subtopics
                                       const isSelected = isGroupFullySelected(t);
                                       const selectedCount = t.subTopics.filter(sub => selectedTopics.includes(sub)).length;
                                       
                                       return (
                                           <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
                                               <div 
                                                   onClick={() => toggleGroup(t)}
                                                   className={`p-3 flex justify-between items-center cursor-pointer transition-colors ${isSelected ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                               >
                                                   <span className={`text-xs font-bold ${isSelected ? 'text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-gray-300'}`}>{t.title}</span>
                                                   <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedCount > 0 ? 'bg-orange-100 text-orange-700 dark:bg-orange-800 dark:text-orange-200' : 'bg-gray-200 text-gray-500 dark:bg-gray-700'}`}>
                                                       {selectedCount}/{t.subTopics.length}
                                                   </span>
                                               </div>
                                               <div className="p-2 space-y-1 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                                                   {t.subTopics.map((sub, sIdx) => (
                                                       <button 
                                                           key={sIdx} 
                                                           onClick={() => toggleTopic(sub)}
                                                           className={`w-full text-left px-3 py-2 rounded-lg text-[11px] border transition-all flex items-center gap-2 ${selectedTopics.includes(sub) ? 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/10 dark:border-orange-800 dark:text-orange-300' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                                                       >
                                                           <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${selectedTopics.includes(sub) ? 'bg-orange-500 border-orange-500' : 'border-gray-400'}`}>
                                                               {selectedTopics.includes(sub) && <Check size={8} className="text-white"/>}
                                                           </div>
                                                           {sub}
                                                       </button>
                                                   ))}
                                               </div>
                                           </div>
                                       );
                                   }
                               })}
                           </div>
                           <p className="text-xs text-gray-500 mt-2 text-right">{selectedTopics.length} selected</p>
                       </div>
                   )}
               </div>
           </div>

           {/* Right: Distribution & Generate OR Smart Upload */}
           <div className="lg:col-span-2 space-y-6">
              {mode === 'AI' ? (
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="font-bold flex items-center gap-2"><PieChart size={18}/> প্রশ্ন বন্টন (প্রতি টপিক)</h3>
                          <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">Total: {totalQuestionsToGenerate}</span>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-4">
                          {BATCH_STRATEGIES.map((strategy, idx) => (
                              <div key={idx} className={`p-3 rounded-xl border ${strategy.color} bg-opacity-10 dark:bg-opacity-10 flex items-center justify-between`}>
                                  <div>
                                      <p className="font-bold text-sm">{strategy.label.split('(')[0]}</p>
                                      <p className="text-[10px] opacity-80">{strategy.label.split('(')[1]?.replace(')', '')}</p>
                                  </div>
                                  <input 
                                    type="number" 
                                    min="0" 
                                    max="50"
                                    value={distribution[idx]} 
                                    onChange={(e) => updateDistribution(idx, parseInt(e.target.value))}
                                    className="w-16 p-1 text-center font-bold rounded border-gray-300 focus:ring-2 focus:ring-orange-500 text-gray-800"
                                  />
                              </div>
                          ))}
                      </div>

                      <div className="mt-8 flex gap-4">
                          <div className="flex-1">
                              <label className="block text-xs font-bold mb-1">Exam Standard</label>
                              <select value={standard} onChange={(e) => setStandard(e.target.value as ExamStandard)} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-600 text-sm">
                                  {Object.values(ExamStandard).map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                          </div>
                          <button 
                            onClick={handleGenerate}
                            disabled={isGenerating || totalQuestionsToGenerate === 0}
                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {isGenerating ? <Loader2 className="animate-spin"/> : <Sparkles/>} 
                            {isGenerating ? 'Generating...' : 'Start Generation'}
                          </button>
                      </div>
                      {isGenerating && <p className="text-center text-xs mt-2 text-orange-600 animate-pulse">{progress}</p>}
                  </div>
              ) : (
                  // MANUAL MODE
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold flex items-center gap-2"><Upload size={18}/> Smart Upload (Paste Text/JSON)</h3>
                          <div className="text-xs text-gray-500">
                              Selected: <span className="font-bold text-gray-800 dark:text-white">{subject ? subject.split('(')[0] : 'None'}</span> / <span className="font-bold text-gray-800 dark:text-white">{chapter || 'None'}</span>
                          </div>
                      </div>
                      
                      <textarea 
                          value={manualInput}
                          onChange={(e) => setManualInput(e.target.value)}
                          className="w-full h-[300px] p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-mono text-xs focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                          placeholder={`Paste your questions here (JSON or Object format)...
Example:
[
  {
    "question": "Example Question?",
    "options": ["A", "B", "C", "D"],
    "correctAnswerIndex": 0,
    "explanation": "Explanation here..."
  }
]`}
                      />

                      <div className="mt-4 flex justify-end">
                          <button 
                              onClick={handleSmartUpload}
                              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-green-200 dark:shadow-none"
                          >
                              <CheckCircle size={18}/> Process & Add to List
                          </button>
                      </div>
                  </div>
              )}

              {/* Import/Export (Common) */}
              <div className="flex justify-end gap-2">
                  <input type="file" ref={fileInputRef} accept=".json" onChange={handleFileUpload} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="text-xs font-bold text-gray-500 hover:text-orange-600 flex items-center gap-1"><Upload size={12}/> Import JSON</button>
              </div>
           </div>
        </div>

        {/* Results Preview */}
        {generatedQuestions.length > 0 && (
          <div className="pt-8 border-t border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom-5">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl flex items-center gap-2"><CheckCircle className="text-green-500"/> জেনারেটেড প্রশ্ন ({generatedQuestions.length})</h3>
                <div className="flex gap-2">
                    <button onClick={() => setGeneratedQuestions([])} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-bold flex items-center gap-2 hover:bg-red-200"><Trash2 size={16}/> Clear</button>
                    <button onClick={handleSaveToDB} disabled={isSaving} className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-green-700">
                        {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Save to DB
                    </button>
                </div>
             </div>

             <div className="grid gap-4">
                {generatedQuestions.slice().reverse().map((q, idx) => (
                   <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 relative group">
                      <button onClick={() => handleDeleteQ(generatedQuestions.length - 1 - idx)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500"><Trash2 size={18}/></button>
                      <div className="flex gap-2 mb-2">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs font-bold rounded">{q.topic}</span>
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded border border-orange-200">{q.difficulty}</span>
                      </div>
                      <h4 className="font-bold mb-3">{q.question}</h4>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                         {q.options.map((opt, i) => (
                             <div key={i} className={`p-2 rounded text-xs border ${i === Number(q.correctAnswerIndex) ? 'bg-green-50 border-green-300 text-green-700 font-bold' : 'border-gray-200'}`}>
                                 {opt}
                             </div>
                         ))}
                      </div>
                      <p className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-900 p-2 rounded">Note: {q.explanation}</p>
                   </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminQuestionGenerator;
