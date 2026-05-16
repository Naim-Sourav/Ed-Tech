import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { GoogleGenAI } from "@google/genai";
import { saveQuestionsToBankAPI } from '../services/api';
import { QuizQuestion } from '../types';
import { SYLLABUS_DB } from '../services/syllabusData';
import { useToast } from './Toast';
import { 
    Loader2, 
    Upload, 
    FileText, 
    CheckCircle, 
    Trash2, 
    Save, 
    Brain, 
    Layers, 
    ChevronDown, 
    Atom, 
    Beaker, 
    Calculator, 
    Dna, 
    Book, 
    Activity, 
    Globe 
} from 'lucide-react';

// Initialize PDF.js worker using CDN to avoid local build issues
// using a fixed version that matches the installed package major version or a generally stable one
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const AdminPdfUpload: React.FC = () => {
    const { showToast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [processedQuestions, setProcessedQuestions] = useState<QuizQuestion[]>([]);
    const [progress, setProgress] = useState('');

    // Selection State
    const [subject, setSubject] = useState('');
    const [chapter, setChapter] = useState('');
    const [topic, setTopic] = useState('');
    const [examRef, setExamRef] = useState('');
    const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);

    // Derived Data
    const subjects = Object.keys(SYLLABUS_DB);
    const chapters = subject ? Object.keys(SYLLABUS_DB[subject] || {}) : [];
    
    // Flatten topics if they are nested
    const flatTopics: string[] = [];
    if (subject && chapter) {
        const availableTopics = SYLLABUS_DB[subject][chapter] || [];
        availableTopics.forEach(t => {
            if (typeof t === 'string') flatTopics.push(t);
            else flatTopics.push(...t.subTopics);
        });
    }

    const getSubjectIcon = (subject: string) => {
        if (subject.includes('Physics')) return <Atom size={18} className="text-orange-600 dark:text-orange-400" />;
        if (subject.includes('Chemistry')) return <Beaker size={18} className="text-orange-600 dark:text-orange-400" />;
        if (subject.includes('Math')) return <Calculator size={18} className="text-orange-600 dark:text-orange-400" />;
        if (subject.includes('Biology')) return <Dna size={18} className="text-green-600 dark:text-green-400" />;
        if (subject.includes('English') || subject.includes('Bangla')) return <Book size={18} className="text-teal-600 dark:text-teal-400" />;
        if (subject.includes('ICT')) return <Activity size={18} className="text-orange-600 dark:text-orange-400" />;
        return <Globe size={18} className="text-gray-600 dark:text-gray-400" />;
    };

    const [pdfText, setPdfText] = useState('');
    const [estimatedCount, setEstimatedCount] = useState(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setProcessedQuestions([]);
            setPdfText('');
            setEstimatedCount(0);
            
            // Auto-analyze text
            setIsAnalyzing(true);
            try {
                const text = await extractTextFromPdf(selectedFile);
                setPdfText(text);
                
                // Improved Regex for Estimation
                // Matches:
                // 1. "1. ", "01. ", "1) ", "(1) " at start of line
                // 2. Bengali numerals "১. ", "০১. "
                const questionPattern = /(?:^|\n)\s*(?:\d+|[০-৯]+)\s*[.|)]\s+/g;
                const matches = text.match(questionPattern);
                setEstimatedCount(matches ? matches.length : 0);
            } catch (error) {
                console.error("Analysis failed:", error);
                showToast("Failed to analyze PDF. Please try a different file.", "error");
            } finally {
                setIsAnalyzing(false);
                setProgress('');
            }
        }
    };

    const extractTextFromPdf = async (file: File): Promise<string> => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            setProgress(`Reading page ${i} of ${pdf.numPages}...`);
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            // Add a newline after each item to better preserve structure for regex
            const pageText = textContent.items.map((item: any) => item.str).join(' '); 
            fullText += pageText + '\n\n';
        }

        return fullText;
    };

    const processChunk = async (chunkText: string, chunkIndex: number, totalChunks: number) => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            
            const prompt = `
                You are an expert exam question extractor for the Bangladeshi education system. 
                Your task is to extract multiple-choice questions (MCQs) from the provided text, which was extracted from a PDF.
                The text contains questions in BENGALI and ENGLISH.
                
                Context:
                Subject: ${subject}
                Chapter: ${chapter}
                Topic: ${topic || 'General'}
                
                Instructions:
                1.  **Identify Questions:** Look for questions numbered with English (1, 2, 3) or Bengali (১, ২, ৩) numerals.
                2.  **Identify Options:** Look for options labeled with:
                    - English: (a), (b), (c), (d) OR A, B, C, D
                    - Bengali: (ক), (খ), (গ), (ঘ) OR ক, খ, গ, ঘ
                3.  **Math/LaTeX Rule:** Any mathematical expressions, equations, symbols MUST be wrapped inside $...$ or $$...$$ (e.g., $\sin \theta$, $\frac{1}{2}$). 
                4.  **Fix OCR Errors:** 
                    - Correct broken Bengali words.
                    - Fix spacing issues (e.g., "ques tion" -> "question").
                5.  **Determine Correct Answer:** 
                    - If the answer is explicitly marked (bold, checkmark, or answer key at bottom), use it.
                    - If NO answer is marked, YOU MUST SOLVE THE QUESTION and provide the correct answer index (0-3).
                6.  **Output Format:** Return a STRICT JSON array.
                
                Output JSON Structure:
                [
                    {
                        "question": "The question text (keep original language)",
                        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                        "correctAnswerIndex": 0, // 0 for A/k, 1 for B/kh, etc.
                        "explanation": "Short explanation in Bengali or English",
                        "difficulty": "Medium" 
                    }
                ]

                Text Chunk (${chunkIndex + 1}/${totalChunks}):
                ${chunkText}
            `;

            setProgress(`Analyzing chunk ${chunkIndex + 1}/${totalChunks} with AI...`);
            
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: prompt,
                config: {
                    responseMimeType: "application/json"
                }
            });

            const textResponse = response.text;
            if (!textResponse) return [];

            // Extract JSON from response
            let escapedResponse = textResponse.replace(/(?<!\\)\\(?!["\\/bfnrtu])/g, '\\\\');
            const jsonMatch = escapedResponse.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return parsed;
            }
            
            try {
                const parsed = JSON.parse(escapedResponse);
                if (Array.isArray(parsed)) return parsed;
            } catch (_e) {
                // Ignore
            }

            return [];

        } catch (error) {
            console.error("Gemini Error:", error);
            return [];
        }
    };

    const handleProcess = async () => {
        if (!pdfText) return showToast("No text to process", "warning");
        if (!subject || !chapter) return showToast("Please select Subject and Chapter", "warning");

        setIsProcessing(true);
        try {
            // Split text into chunks of ~15000 characters (approx 3-5 pages) to avoid token limits
            const chunkSize = 15000;
            const chunks = [];
            for (let i = 0; i < pdfText.length; i += chunkSize) {
                chunks.push(pdfText.substring(i, i + chunkSize));
            }

            let allQuestions: any[] = [];

            for (let i = 0; i < chunks.length; i++) {
                const chunkQuestions = await processChunk(chunks[i], i, chunks.length);
                allQuestions = [...allQuestions, ...chunkQuestions];
            }
            
            if (allQuestions.length === 0) {
                showToast("No questions detected", "warning");
            } else {
                const formattedQuestions = allQuestions.map((q: any) => ({
                    ...q,
                    subject,
                    chapter,
                    topic: topic || 'General',
                    examRef: examRef || undefined
                }));
                setProcessedQuestions(formattedQuestions);
                showToast(`Successfully extracted ${formattedQuestions.length} questions!`, "success");
            }

        } catch (error: any) {
            showToast(error.message, "error");
        } finally {
            setIsProcessing(false);
            setProgress('');
        }
    };

    const handleSave = async () => {
        if (processedQuestions.length === 0) return;
        setIsSaving(true);
        try {
            await saveQuestionsToBankAPI(processedQuestions);
            showToast("Questions saved successfully!", "success");
            setProcessedQuestions([]);
            setFile(null);
        } catch (error: any) {
            showToast("Failed to save: " + error.message, "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = (index: number) => {
        setProcessedQuestions(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 animate-in fade-in">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="text-center border-b border-gray-100 dark:border-gray-700 pb-6">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm rotate-3">
                        <FileText size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">PDF Question Extractor</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Upload a PDF question bank and let AI extract the questions for you.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    
                    {/* Left: Controls */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-5">
                            
                            {/* Subject Select */}
                            <div className="relative">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Subject</label>
                                <button 
                                    onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
                                    className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-600 flex items-center justify-between bg-white dark:text-white shadow-sm"
                                >
                                    <div className="flex items-center gap-2">
                                        {subject ? getSubjectIcon(subject) : <Layers size={18} className="text-gray-400"/>}
                                        <span className={`text-sm font-bold ${subject ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                                            {subject ? subject.split('(')[0] : 'Select Subject...'}
                                        </span>
                                    </div>
                                    <ChevronDown size={16} className="text-gray-500"/>
                                </button>
                                
                                {isSubjectDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                                        {subjects.map(s => (
                                            <button
                                                key={s}
                                                onClick={() => {
                                                    setSubject(s);
                                                    setChapter('');
                                                    setTopic('');
                                                    setIsSubjectDropdownOpen(false);
                                                }}
                                                className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                                            >
                                                {getSubjectIcon(s)}
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{s.split('(')[0]}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Chapter Select */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Chapter</label>
                                <select 
                                    value={chapter} 
                                    onChange={(e) => { setChapter(e.target.value); setTopic(''); }} 
                                    disabled={!subject} 
                                    className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-600 text-sm font-bold shadow-sm outline-none focus:ring-2 ring-primary/20"
                                >
                                    <option value="">Select Chapter...</option>
                                    {chapters.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            {/* Topic Select */}
                            {chapter && (
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Topic (Optional)</label>
                                    <select 
                                        value={topic} 
                                        onChange={(e) => setTopic(e.target.value)} 
                                        className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-600 text-sm font-bold shadow-sm outline-none focus:ring-2 ring-primary/20"
                                    >
                                        <option value="">General / All Topics</option>
                                        {flatTopics.map((t, idx) => <option key={idx} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            )}

                            {/* Exam Ref Input */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Exam Reference (Optional)</label>
                                <input 
                                    type="text" 
                                    value={examRef}
                                    onChange={(e) => setExamRef(e.target.value)}
                                    placeholder="e.g., DU_2023, MAT_2022"
                                    className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-600 text-sm font-bold shadow-sm outline-none focus:ring-2 ring-primary/20"
                                />
                            </div>

                        </div>
                    </div>

                    {/* Right: Upload & Preview */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Upload Area */}
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors bg-white dark:bg-gray-800">
                            <input 
                                type="file" 
                                accept=".pdf" 
                                onChange={handleFileChange} 
                                className="hidden" 
                                id="pdf-upload"
                            />
                            <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
                                <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center mb-4">
                                    <Upload size={28} />
                                </div>
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                    {file ? file.name : "Click to Upload PDF"}
                                </span>
                                <span className="text-sm text-gray-500 mt-2">
                                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Supported format: PDF (Text-based)"}
                                </span>
                            </label>

                            {file && (
                                <div className="mt-6 space-y-4 w-full max-w-md">
                                    {isAnalyzing ? (
                                        <div className="flex flex-col items-center gap-2 text-orange-600">
                                            <Loader2 className="animate-spin" />
                                            <span className="text-sm font-bold">Analyzing PDF structure...</span>
                                        </div>
                                    ) : (
                                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800">
                                            <p className="text-orange-800 dark:text-orange-300 font-bold text-sm mb-1">
                                                Analysis Complete
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-400 text-xs">
                                                Detected approximately <span className="font-bold text-orange-600 dark:text-orange-400 text-lg">{estimatedCount}</span> questions.
                                            </p>
                                        </div>
                                    )}

                                    <button 
                                        onClick={handleProcess}
                                        disabled={isProcessing || isAnalyzing || !subject || !chapter || estimatedCount === 0}
                                        className="w-full px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {isProcessing ? <Loader2 className="animate-spin" /> : <Brain />}
                                        {isProcessing ? "Generating..." : "Start Generation"}
                                    </button>
                                </div>
                            )}
                            
                            {isProcessing && (
                                <p className="mt-4 text-sm font-bold text-orange-600 animate-pulse">{progress}</p>
                            )}
                        </div>

                        {/* Preview Area */}
                        {processedQuestions.length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 animate-in slide-in-from-bottom-5">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        <CheckCircle className="text-green-500"/> 
                                        Extracted Questions ({processedQuestions.length})
                                    </h3>
                                    <button 
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-green-200 dark:shadow-none transition-all"
                                    >
                                        {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
                                        Save to Database
                                    </button>
                                </div>

                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {processedQuestions.map((q, idx) => (
                                        <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 relative group">
                                            <button 
                                                onClick={() => handleDelete(idx)}
                                                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={18}/>
                                            </button>
                                            
                                            <div className="flex gap-2 mb-2">
                                                <span className="px-2 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-700 text-xs font-bold rounded">{q.topic}</span>
                                                {q.examRef && <span className="px-2 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 text-xs font-bold rounded">{q.examRef}</span>}
                                            </div>

                                            <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3">{idx + 1}. {q.question}</h4>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                                {q.options.map((opt, i) => (
                                                    <div key={i} className={`p-2 rounded-lg text-xs border flex items-center gap-2 ${i === Number(q.correctAnswerIndex) ? 'bg-green-50 border-green-300 text-green-700 font-bold' : 'border-gray-200 dark:border-gray-700 text-gray-600'}`}>
                                                        <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">{String.fromCharCode(65+i)}</span>
                                                        {opt}
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            {q.explanation && (
                                                <p className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border-l-2 border-gray-300">
                                                    <span className="font-bold">Explanation:</span> {q.explanation}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPdfUpload;
