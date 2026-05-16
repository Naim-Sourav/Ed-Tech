
import React, { useState, useEffect } from 'react';
import { createPublicExam } from '../services/publicExamService';
import { generateQuiz } from '../services/geminiService';
import { saveQuestionsToBankAPI } from '../services/api';
import { SYLLABUS_DB } from '../services/syllabusData';
import { ExamStandard } from '../types';
import { useToast } from './Toast';
import { Loader2, Plus, Trash2, Save, FileJson, Link as LinkIcon, Copy, Sparkles, Brain } from 'lucide-react';

import { generateObjectId } from '../utils/idGenerator';

const AdminPublicExam = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [examLink, setExamLink] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(30);
  const [totalMarks, setTotalMarks] = useState(50);
  const [negativeMarking, setNegativeMarking] = useState(0.25);
  
  // Manual Question Entry State
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswerIndex: 0
  });

  // AI Generation State
  const [aiSubject, setAiSubject] = useState('');
  const [aiChapter, setAiChapter] = useState('');
  const [aiTopic, setAiTopic] = useState('');
  const [aiCount, setAiCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  // JSON Upload State
  const [jsonFile, setJsonFile] = useState<File | null>(null);

  // --- ROBUST MATHJAX LOADING ---
  useEffect(() => {
    let attempts = 0;
    const intervalId = setInterval(() => {
      attempts++;
      const renderMath = () => {
        if (window.MathJax && window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise()
            .then(() => {
              if (intervalId) clearInterval(intervalId);
            })
            .catch((err: any) => console.log('MathJax typeset failed: ', err));
        }
      };

      renderMath();

      if (attempts > 10) { // Stop after 5 seconds
        clearInterval(intervalId);
      }
    }, 500);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [questions, isGenerating]);

  const subjects = Object.keys(SYLLABUS_DB);
  const chapters = aiSubject ? Object.keys(SYLLABUS_DB[aiSubject] || {}) : [];
  const topics = (aiSubject && aiChapter) ? SYLLABUS_DB[aiSubject][aiChapter] || [] : [];

  const handleAddQuestion = () => {
    if (!currentQ.question || currentQ.options.some(o => !o)) {
      showToast("Please fill all fields", "error");
      return;
    }
    setQuestions([...questions, { 
      ...currentQ,
      subject: aiSubject || 'General',
      chapter: aiChapter || 'General',
      topic: aiTopic || 'General'
    }]);
    setCurrentQ({
      question: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0
    });
  };

  const handleAiGenerate = async () => {
    if (!aiSubject || !aiChapter || !aiTopic) {
      showToast("Please select Subject, Chapter and Topic", "warning");
      return;
    }
    
    setIsGenerating(true);
    try {
      const config = [{
        subject: aiSubject,
        chapter: aiChapter,
        topics: [aiTopic]
      }];

      const generated = await generateQuiz(
        config,
        ExamStandard.HSC, // Default standard
        aiCount
      );

      if (generated && generated.length > 0) {
        const formatted = generated.map(q => ({
          question: q.question,
          options: q.options,
          correctAnswerIndex: Number(q.correctAnswerIndex),
          explanation: q.explanation,
          subject: aiSubject,
          chapter: aiChapter,
          topic: aiTopic
        }));
        setQuestions(prev => [...prev, ...formatted]);
        showToast(`Generated ${generated.length} questions!`, "success");
      } else {
        showToast("No questions generated. Try again.", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("AI Generation Failed", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setJsonFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const raw = event.target?.result as string;
          const escapedInput = raw.replace(/(?<!\\)\\(?!["\\/bfnrtu])/g, '\\\\');
          
          const ensureLatexWrapped = (text: string) => {
              if (!text || typeof text !== 'string') return text;
              if (text.includes('$') || text.includes('\\(') || text.includes('\\[')) return text;
              
              if (/_{2,}/.test(text)) {
                  return text;
              }

              if (/\\(frac|sqrt|sin|cos|tan|log|ln|theta|alpha|beta|gamma|pi|pm|therefore|implies|text\{|sec|cosec|cot)|[\^_]/.test(text)) {
                  return `$${text}$`;
              }
              return text;
          };

          const json = JSON.parse(escapedInput);
          if (Array.isArray(json)) {
            // Validate format roughly
            const valid = json.every(q => q.question && Array.isArray(q.options) && (typeof q.correctAnswerIndex === 'number' || typeof q.correctAnswer === 'number'));
            if (valid) {
              // Normalize
              const normalized = json.map((q: any) => ({
                  ...q,
                  question: ensureLatexWrapped(q.question),
                  options: (q.options || []).map((opt: any) => ensureLatexWrapped(String(opt))),
                  explanation: ensureLatexWrapped(q.explanation || ""),
                  contextText: ensureLatexWrapped(q.contextText || ""),
                  correctAnswerIndex: q.correctAnswerIndex ?? q.correctAnswer,
                  subject: q.subject || aiSubject || 'Imported',
                  chapter: q.chapter || aiChapter || 'Imported',
                  topic: q.topic || aiTopic || 'Imported'
              }));
              setQuestions(prev => [...prev, ...normalized]); // Append instead of replace
              showToast(`Loaded ${json.length} questions`, "success");
            } else {
              showToast("Invalid JSON format", "error");
            }
          }
        } catch (err) {
          console.error(err);
          showToast("Failed to parse JSON", "error");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCreateExam = async () => {
    if (!title || questions.length === 0) {
      showToast("Title and Questions are required", "error");
      return;
    }

    setLoading(true);
    try {
      // 1. Assign IDs to questions if missing (Crucial for bookmarking)
      const questionsWithIds = questions.map(q => ({
          ...q,
          _id: q._id || q.id || generateObjectId(),
          id: q.id || q._id || generateObjectId() // Ensure both exist for compatibility
      }));

      // 2. Save questions to Bank (MongoDB) for bookmarking/future use
      let finalQuestions = [...questionsWithIds];
      try {
        const response = await saveQuestionsToBankAPI(questionsWithIds);
        console.log("Questions saved to bank", response);
        
        // If backend returns the saved questions with IDs, use them
        if (response && Array.isArray(response.questions)) {
            finalQuestions = response.questions;
            showToast("প্রশ্নগুলো ব্যাংকে সেভ করা হয়েছে এবং এক্সাম তৈরি হচ্ছে...", "success");
        } else if (Array.isArray(response)) {
            finalQuestions = response;
            showToast("প্রশ্নগুলো ব্যাংকে সেভ করা হয়েছে এবং এক্সাম তৈরি হচ্ছে...", "success");
        } else {
            console.warn("Questions saved but no IDs returned (possibly offline mode). Using local IDs.");
            showToast("সতর্কতা: সার্ভার থেকে আইডি আসেনি, লোকাল আইডি ব্যবহার করা হচ্ছে।", "warning");
        }
      } catch (err) {
        console.error("Failed to save questions to bank", err);
        // Continue anyway, as we can still create the exam in Firebase
      }

      const examId = await createPublicExam({
        title,
        duration,
        totalMarks,
        negativeMarking,
        questions: finalQuestions,
        isPublic: true
      });
      
      const link = `${window.location.origin}/#/exam/${examId}`;
      setExamLink(link);
      showToast("Public Exam Created & Questions Saved to DB!", "success");
      
      // Reset form
      setTitle('');
      setQuestions([]);
      setJsonFile(null);
    } catch (e: any) {
      showToast(e.message || "Failed to create exam", "error");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (examLink) {
      navigator.clipboard.writeText(examLink);
      showToast("Link copied to clipboard", "success");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 animate-in fade-in">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
        <LinkIcon size={24} className="text-primary"/> Create Public Exam Link
      </h2>

      {examLink ? (
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 dark:text-green-300">
            <LinkIcon size={32} />
          </div>
          <h3 className="text-lg font-bold text-green-800 dark:text-green-300 mb-2">Exam Link Ready!</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Share this link on social media.</p>
          
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
            <input 
              readOnly 
              value={examLink} 
              className="flex-1 bg-transparent text-sm text-gray-600 dark:text-gray-300 outline-none"
            />
            <button onClick={copyLink} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-primary">
              <Copy size={18} />
            </button>
          </div>
          
          <button 
            onClick={() => setExamLink(null)}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Create Another
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Exam Title</label>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-900 dark:border-gray-700"
                placeholder="e.g. GST Special Model Test 01"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Duration (min)</label>
                <input 
                  type="number" 
                  value={duration}
                  onChange={e => setDuration(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-900 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Total Marks</label>
                <input 
                  type="number" 
                  value={totalMarks}
                  onChange={e => setTotalMarks(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-900 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Neg. Mark</label>
                <input 
                  type="number" 
                  step="0.05"
                  value={negativeMarking}
                  onChange={e => setNegativeMarking(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-900 dark:border-gray-700"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="font-bold text-gray-800 dark:text-white mb-4">Add Questions ({questions.length})</h3>
            
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* AI Generator */}
              <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-800">
                <h4 className="font-bold text-purple-800 dark:text-purple-300 mb-3 flex items-center gap-2">
                  <Sparkles size={16}/> AI Generator
                </h4>
                <div className="space-y-3">
                  <select 
                    value={aiSubject} 
                    onChange={e => { setAiSubject(e.target.value); setAiChapter(''); }}
                    className="w-full p-2 rounded-lg border text-sm dark:bg-gray-800 dark:border-gray-600"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  
                  <select 
                    value={aiChapter} 
                    onChange={e => setAiChapter(e.target.value)}
                    disabled={!aiSubject}
                    className="w-full p-2 rounded-lg border text-sm dark:bg-gray-800 dark:border-gray-600"
                  >
                    <option value="">Select Chapter</option>
                    {chapters.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  <select 
                    value={aiTopic} 
                    onChange={e => setAiTopic(e.target.value)}
                    disabled={!aiChapter}
                    className="w-full p-2 rounded-lg border text-sm dark:bg-gray-800 dark:border-gray-600"
                  >
                    <option value="">Select Topic</option>
                    {topics.map((t: any) => (
                      typeof t === 'string' ? 
                      <option key={t} value={t}>{t}</option> : 
                      <option key={t.title} value={t.title}>{t.title}</option>
                    ))}
                  </select>

                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={aiCount}
                      onChange={e => setAiCount(Number(e.target.value))}
                      className="w-20 p-2 rounded-lg border text-sm dark:bg-gray-800 dark:border-gray-600"
                      min="1" max="20"
                    />
                    <button 
                      onClick={handleAiGenerate}
                      disabled={isGenerating || !aiTopic}
                      className="flex-1 bg-purple-600 text-white font-bold rounded-lg text-sm hover:bg-purple-700 flex items-center justify-center gap-2"
                    >
                      {isGenerating ? <Loader2 className="animate-spin" size={16}/> : <Brain size={16}/>} Generate
                    </button>
                  </div>
                </div>
              </div>

              {/* JSON Upload */}
              <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-800">
                <h4 className="font-bold text-orange-800 dark:text-orange-300 mb-3 flex items-center gap-2">
                  <FileJson size={16}/> JSON Upload
                </h4>
                <div className="h-full flex flex-col justify-center">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-orange-300 border-dashed rounded-lg cursor-pointer bg-orange-50 dark:hover:bg-orange-800/30 dark:bg-orange-900/20 hover:bg-orange-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileJson className="w-8 h-8 mb-2 text-orange-500" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {jsonFile ? jsonFile.name : "Click to upload JSON"}
                      </p>
                    </div>
                    <input type="file" accept=".json" onChange={handleJsonUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            {/* Manual Entry */}
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
              <h4 className="font-bold text-gray-700 dark:text-gray-300 text-sm">Manual Entry</h4>
              <input 
                type="text" 
                value={currentQ.question}
                onChange={e => setCurrentQ({...currentQ, question: e.target.value})}
                placeholder="Question Text"
                className="w-full p-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800"
              />
              <div className="grid grid-cols-2 gap-2">
                {currentQ.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="correct" 
                      checked={currentQ.correctAnswerIndex === idx}
                      onChange={() => setCurrentQ({...currentQ, correctAnswerIndex: idx})}
                    />
                    <input 
                      type="text" 
                      value={opt}
                      onChange={e => {
                        const newOpts = [...currentQ.options];
                        newOpts[idx] = e.target.value;
                        setCurrentQ({...currentQ, options: newOpts});
                      }}
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1 p-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800 text-sm"
                    />
                  </div>
                ))}
              </div>
              <button 
                onClick={handleAddQuestion}
                className="w-full py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add Question
              </button>
            </div>

            {/* Question List Preview */}
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
              {questions.map((q, i) => (
                <div key={i} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-white line-clamp-1">{i + 1}. {q.question}</p>
                    <p className="text-xs text-gray-500">{q.options.length} options • Correct: {String.fromCharCode(65 + (q.correctAnswerIndex ?? q.correctAnswer ?? 0))}</p>
                  </div>
                  <button 
                    onClick={() => setQuestions(questions.filter((_, idx) => idx !== i))}
                    className="text-red-500 hover:bg-red-50 p-1 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={handleCreateExam}
            disabled={loading}
            className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-orange-700 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Create Exam & Generate Link</>}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPublicExam;
