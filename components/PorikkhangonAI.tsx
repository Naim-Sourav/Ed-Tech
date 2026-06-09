
import React, { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Send, Sparkles, Bot, ExternalLink, ArrowLeft, Trash2, Loader2, CheckCircle, XCircle, HelpCircle, Settings, Key, MoreVertical } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useNavigate } from 'react-router-dom';
import { useCache } from '../contexts/CacheContext';
import { motion, AnimatePresence } from 'motion/react';

declare global {
  interface Window {
    MathJax: any;
  }
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  imageUrl?: string;
  sources?: { title: string; uri: string }[];
  timestamp: number;
}

interface MCQData {
  question: string;
  options: { label: string; text: string }[];
  correct: string;
  explanation: string;
}

const BOT_MODELS = [
    "gemini-3-flash-preview", 
    "gemini-flash-lite-latest"
];

const SYSTEM_PROMPT = `তুমি হলে HSC পরীক্ষার প্রস্তুতিতে সাহায্য করার জন্য একজন অত্যন্ত জ্ঞানী, বন্ধুত্বপূর্ণ এবং স্মার্ট বড় ভাই (টিউটর)। তোমার সব উত্তর অবশ্যই নির্ভুল, সহজবোধ্য বাংলায় (বাংলা) দিতে হবে। তুমি সবসময় 'তুমি' করে সম্বোধন করবে এবং অনানুষ্ঠানিক, আন্তরিক ভাষায় কথা বলবে, যেন ছোট ভাই বা বন্ধুর সাথে কথা বলছো। তোমার লক্ষ্য হলো কঠিন বিষয়গুলো সরল ও সংক্ষিপ্তভাবে বোঝানো।

উত্তরগুলো অবশ্যই সংক্ষিপ্ত, সহজবোধ্য এবং শুধুমাত্র মূল ধারণার উপর মনোযোগ দিতে হবে। আউটপুট হবে শুধুমাত্র প্লেইন টেক্সট।

For ALL mathematical, physical, and chemical symbols/equations, ALWAYS use LaTeX syntax enclosed within single dollar signs ($). For example, use $\\vec{A} \\times \\vec{B}$ for vector product, $\\theta$ for theta, $\\frac{1}{2}$ for a half, and use subscripts/superscripts correctly (e.g., $H_2O$ for water). Ensure all LaTeX expressions are correctly formatted for MathJax rendering and appear INLINE within the text flow where needed.

You are ABSOLUTELY PROHIBITED from using ANY form of text formatting or structural Markdown symbols, including but not limited to: asterisks (*, **), hash symbols (#, ##, ###), pipe characters (|), lists (using * or -), or table markdown. ONLY use line breaks for paragraphs. Ensure the information is relevant to HSC subjects and use Google Search for accuracy and freshness.

**MCQ FEATURE:**
When you think a student needs practice or clarification on a topic, you can create an MCQ question. To do this, format your response with a special MCQ marker:

[MCQ_START]
Question: [Your question here]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Correct: [A/B/C/D]
Explanation: [Detailed explanation why the correct answer is right and why others are wrong]
[MCQ_END]

Use MCQs strategically when:
- Student seems confused about a concept
- After explaining a difficult topic to reinforce understanding
- Student asks for practice questions
- To check if student understood your explanation`;

const PorikkhangonAI: React.FC = () => {
  const navigate = useNavigate();
  const { getCache, setCache } = useCache();
  const cacheKey = 'porikkhangon_bot_state';
  const cachedState = getCache(cacheKey) || {};

  const [messages, setMessages] = useState<Message[]>(cachedState.messages || []);
  const [chatHistory, setChatHistory] = useState<{ role: string, parts: any[] }[]>(cachedState.chatHistory || []);
  const [mcqStates, setMcqStates] = useState<Record<string, { selected: string | null, isCorrect: boolean | null }>>(cachedState.mcqStates || {});

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ data: string, mimeType: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem('porikkhangon_custom_api_key') || '');
  const [apiStatus, setApiStatus] = useState<'idle' | 'testing' | 'valid' | 'invalid'>('idle');
  const [apiErrorMessage, setApiErrorMessage] = useState('');
  
  const [requestStats, setRequestStats] = useState(() => {
    const stored = localStorage.getItem('porikkhangon_api_stats');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (new Date().toDateString() === parsed.date) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing stats:', e);
      }
    }
    return { date: new Date().toDateString(), count: 0 };
  });

  // --- EFFECTS ---
  
  // Save to Cache on Update
  useEffect(() => {
      setCache(cacheKey, { messages, chatHistory, mcqStates });
  }, [messages, chatHistory, mcqStates, setCache, cacheKey]);

  useEffect(() => {
    scrollToBottom();
    
    // Robust MathJax rendering with polling
    let attempts = 0;
    const intervalId = setInterval(() => {
      attempts++;
      if (window.MathJax && window.MathJax.typesetPromise) {
        const chatContainer = document.getElementById('porikkhangon-chat-container');
        if (chatContainer) {
          window.MathJax.typesetPromise([chatContainer])
            .catch((err: any) => console.error('MathJax error:', err));
          clearInterval(intervalId);
        }
      }
      if (attempts >= 20) {
        clearInterval(intervalId);
      }
    }, 500);

    return () => clearInterval(intervalId);
  }, [messages, mcqStates]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  };

  // --- PARSING LOGIC ---
  const parseMessageContent = (text: string) => {
    const mcqRegex = /\[MCQ_START\]([\s\S]*?)\[MCQ_END\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mcqRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
      }
      
      const mcqContent = match[1].trim();
      const lines = mcqContent.split('\n').map(l => l.trim()).filter(l => l);
      const mcqData: MCQData = { question: '', options: [], correct: '', explanation: '' };
      
      lines.forEach(line => {
        if (line.startsWith('Question:')) mcqData.question = line.replace('Question:', '').trim();
        else if (/^[A-D]\)/.test(line)) {
          mcqData.options.push({ 
            label: line.charAt(0), 
            text: line.substring(2).trim() 
          });
        }
        else if (line.startsWith('Correct:')) mcqData.correct = line.replace('Correct:', '').trim();
        else if (line.startsWith('Explanation:')) mcqData.explanation = line.replace('Explanation:', '').trim();
      });

      parts.push({ type: 'mcq', data: mcqData });
      lastIndex = mcqRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.substring(lastIndex) });
    }
    
    return parts;
  };

  // --- HANDLERS ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = (ev.target?.result as string).split(',')[1];
        setSelectedImage({ data: base64, mimeType: file.type });
        setPreviewUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearChat = () => {
      if(window.confirm("চ্যাট হিস্ট্রি মুছে ফেলতে চান?")) {
          setMessages([]);
          setChatHistory([]);
          setMcqStates({});
          setCache(cacheKey, null); // Clear cache
          setShowMenu(false);
      }
  }

  const handleMCQOptionClick = (msgId: string, mcqIndex: number, optionLabel: string, correctLabel: string) => {
      const stateKey = `${msgId}_${mcqIndex}`;
      if (mcqStates[stateKey]) return; // Already answered

      const isCorrect = optionLabel === correctLabel;
      setMcqStates(prev => ({
          ...prev,
          [stateKey]: { selected: optionLabel, isCorrect }
      }));

      if (navigator.vibrate) {
        navigator.vibrate(isCorrect ? [10, 30, 10] : 50);
      }
  };

  const saveApiKey = (key: string) => {
      setCustomApiKey(key);
      localStorage.setItem('porikkhangon_custom_api_key', key);
  };

  const incrementRequestCount = () => {
    setRequestStats((prev: any) => {
      const newStats = { ...prev, count: prev.count + 1 };
      localStorage.setItem('porikkhangon_api_stats', JSON.stringify(newStats));
      return newStats;
    });
  };

  const testApiKey = async () => {
    const keyToTest = customApiKey.trim();
    if (!keyToTest) {
      setApiErrorMessage('দয়া করে একটি API Key দিন।');
      setApiStatus('invalid');
      return;
    }

    setApiStatus('testing');
    setApiErrorMessage('');

    try {
      const ai = new GoogleGenAI({ apiKey: keyToTest });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'hi',
        config: { maxOutputTokens: 5 }
      });
      
      if (response.text) {
        setApiStatus('valid');
      } else {
        throw new Error('Empty response');
      }
    } catch (error: any) {
      console.error('API Key test failed:', error);
      setApiStatus('invalid');
      setApiErrorMessage(error.message || 'API Key কাজ করছে না। দয়া করে সঠিক Key দিন।');
    }
  };

  const sendBotMessage = async (modelIndex = 0) => {
    const userQuery = input.trim();
    if (!userQuery && !selectedImage && modelIndex === 0) return;

    if (navigator.vibrate) navigator.vibrate(5);

    // Only update UI for user message on first attempt
    if (modelIndex === 0) {
        const newUserMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: userQuery,
            imageUrl: previewUrl || undefined,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, newUserMsg]);
        setLoading(true);
        setInput('');
        // Reset textarea height
        const textarea = document.querySelector('textarea');
        if (textarea) textarea.style.height = 'auto';
    }

    // Prepare history
    const currentHistory = [...chatHistory];
    if (modelIndex === 0) {
        const userParts: any[] = [{ text: userQuery }];
        if (selectedImage) {
            userParts.push({
                inlineData: {
                    mimeType: selectedImage.mimeType,
                    data: selectedImage.data
                }
            });
        }
        currentHistory.push({ role: "user", parts: userParts });
        setChatHistory(currentHistory);
        removeImage();
    }

    const currentModel = BOT_MODELS[modelIndex];
    // Use custom API key if provided, otherwise fallback to default env key
    const apiKeyToUse = customApiKey.trim() || process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ apiKey: apiKeyToUse });

    try {
        console.log(`Attempting API call with Model: ${currentModel}`);
        const response = await ai.models.generateContent({
            model: currentModel,
            contents: currentHistory,
            config: {
                systemInstruction: SYSTEM_PROMPT,
                temperature: 0.2,
                tools: [{ googleSearch: {} }]
            }
        });

        const botText = response.text;

        if (botText) {
            const sources: { title: string; uri: string }[] = [];
            const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (chunks) {
                chunks.forEach((chunk: any) => {
                    if (chunk.web) sources.push({ title: chunk.web.title, uri: chunk.web.uri });
                });
            }

            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: botText,
                sources: sources.length > 0 ? sources : undefined,
                timestamp: Date.now()
            }]);
            setChatHistory(prev => [...prev, { role: "model", parts: [{ text: botText }] }]);
            setLoading(false);
            incrementRequestCount();
        } else {
            throw new Error("Empty response");
        }

    } catch (error: any) {
        console.error(`Error with model ${currentModel}:`, error);
        
        // Failover Logic
        if (modelIndex < BOT_MODELS.length - 1) {
            console.log(`Switching to next model...`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay
            sendBotMessage(modelIndex + 1);
        } else {
            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: "দুঃখিত, কোনো মডেলে উত্তর দেওয়া সম্ভব হয়নি। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।",
                timestamp: Date.now()
            }]);
            setLoading(false);
        }
    }
  };

  const handleSuggestion = (text: string) => {
      setInput(text);
      if (navigator.vibrate) navigator.vibrate(5);
  };

  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] dark:bg-[#0F1115] relative overflow-hidden">
      
      {/* Header - Native App Style */}
      <div className="px-4 py-3 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-zinc-800/50 flex items-center justify-between sticky top-0 z-[60] shrink-0 shadow-sm">
         <div className="flex items-center gap-3">
            <button 
                onClick={() => {
                    if (window.history.length > 1) {
                        navigate(-1);
                    } else {
                        navigate('/dashboard', { replace: true });
                    }
                }} 
                className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors active:scale-90"
            >
                <ArrowLeft size={22} className="text-gray-700 dark:text-gray-200"/>
            </button>
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20 rotate-3">
                        <Bot size={22} />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                </div>
                <div>
                    <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2 leading-tight">
                        Porikkhangon AI 
                        <span className="px-1.5 py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-md text-[9px] font-bold tracking-wider uppercase border border-orange-500/20">BETA</span>
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Active Now</p>
                </div>
            </div>
         </div>
         
         <div className="flex items-center gap-1 relative">
             <button 
                onClick={() => setShowMenu(!showMenu)} 
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors active:scale-90"
             >
                <MoreVertical size={20} />
             </button>

             <AnimatePresence>
                {showMenu && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowMenu(false)}
                            className="fixed inset-0 z-[70]"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 z-[80] overflow-hidden"
                        >
                            <button 
                                onClick={() => { setIsSettingsOpen(true); setShowMenu(false); }}
                                className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                            >
                                <Settings size={18} className="text-gray-400" /> AI Settings
                            </button>
                            <button 
                                onClick={clearChat}
                                className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
                            >
                                <Trash2 size={18} /> Clear History
                            </button>
                        </motion.div>
                    </>
                )}
             </AnimatePresence>
         </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsSettingsOpen(false)}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white dark:bg-black rounded-3xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh] z-10"
                >
                    <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                            AI সেটিংস
                        </h3>
                        <button onClick={() => setIsSettingsOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto">
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center justify-between">
                                <span className="flex items-center gap-2"><Key size={16} className="text-orange-500"/> Custom API Key</span>
                                {apiStatus === 'valid' && <span className="text-[12px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-bold uppercase tracking-wider">Active</span>}
                            </label>
                            <div className="flex gap-2">
                                <input 
                                    type="password" 
                                    value={customApiKey}
                                    onChange={(e) => {
                                        saveApiKey(e.target.value);
                                        setApiStatus('idle');
                                    }}
                                    placeholder="AIzaSy..."
                                    className="flex-1 px-4 py-3.5 bg-gray-50 dark:bg-zinc-900 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none transition-all text-sm text-gray-800 dark:text-white"
                                />
                                <button 
                                    onClick={testApiKey}
                                    disabled={apiStatus === 'testing' || !customApiKey.trim()}
                                    className="px-5 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-2xl text-sm font-bold hover:bg-black transition-colors disabled:opacity-50"
                                >
                                    {apiStatus === 'testing' ? <Loader2 size={18} className="animate-spin"/> : 'Test'}
                                </button>
                            </div>
                            {apiStatus === 'invalid' && (
                                <p className="text-xs text-red-500 mt-2 font-medium">{apiErrorMessage}</p>
                            )}
                        </div>

                        <div className="p-4 bg-orange-500/5 dark:bg-orange-500/10 rounded-2xl border border-orange-500/10 mb-6">
                            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-widest">Usage Stats</h4>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-2xl font-black text-gray-900 dark:text-white">{requestStats.count} <span className="text-xs font-normal text-gray-500">requests</span></span>
                                <span className="text-xs font-bold text-orange-600">Daily Limit: 1,500</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((requestStats.count / 1500) * 100, 100)}%` }}
                                    className="bg-orange-500 h-full rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-2xl p-5 border border-gray-100 dark:border-zinc-800">
                            <h4 className="font-bold text-sm text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                                <HelpCircle size={18} className="text-orange-500"/> API Key কীভাবে পাবেন?
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                                Google AI Studio থেকে ফ্রিতে API Key তৈরি করে এখানে ব্যবহার করতে পারেন।
                            </p>
                            <a 
                                href="https://aistudio.google.com/app/apikey" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-white rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
                            >
                                Get API Key <ExternalLink size={16}/>
                            </a>
                        </div>
                    </div>
                    
                    <div className="p-5 bg-gray-50 dark:bg-zinc-900/50 flex justify-end">
                        <button 
                            onClick={() => setIsSettingsOpen(false)}
                            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold transition-all shadow-xl shadow-orange-500/20 active:scale-95"
                        >
                            Save Settings
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <div 
        id="porikkhangon-chat-container" 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scroll-smooth bg-[#F8F9FB] dark:bg-[#0F1115]"
      >
        <AnimatePresence initial={false}>
            {messages.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6"
                >
                    <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center text-orange-500 mb-6 animate-bounce">
                        <Bot size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">আসসালামু আলাইকুম!</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-[280px] leading-relaxed mb-8">
                        আমি তোমার HSC পার্সোনাল টিউটর। ফিজিক্স, কেমিস্ট্রি বা বায়োলজি - যেকোনো প্রশ্ন করতে পারো!
                    </p>
                    
                    <div className="grid grid-cols-1 gap-3 w-full max-w-xs">
                        {[
                            "কোষ বিভাজন কী?",
                            "নিউটনের দ্বিতীয় সূত্রটি বুঝিয়ে দাও",
                            "জৈব রসায়ন মনে রাখার টেকনিক বলো"
                        ].map((text, i) => (
                            <motion.button
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 + 0.2 }}
                                onClick={() => handleSuggestion(text)}
                                className="p-4 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl text-sm text-gray-700 dark:text-gray-300 text-left hover:border-orange-500 dark:hover:border-orange-500 transition-all active:scale-95 shadow-sm"
                            >
                                {text}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            ) : (
                messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}
                    >
                        <div className={`max-w-[85%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            {msg.role === 'model' && (
                                <div className="flex items-center gap-2 mb-1.5 ml-1">
                                    <div className="w-5 h-5 bg-orange-500 rounded-md flex items-center justify-center text-white">
                                        <Bot size={12} />
                                    </div>
                                    <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Porikkhangon AI</span>
                                </div>
                            )}
                            
                            <div className={`
                                relative px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm
                                ${msg.role === 'user' 
                                    ? 'bg-orange-500 text-white rounded-tr-none font-medium' 
                                    : 'bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-zinc-800'
                                }
                            `}>
                                {msg.imageUrl && (
                                    <img 
                                        src={msg.imageUrl} 
                                        alt="Uploaded" 
                                        className="max-w-full rounded-xl mb-3 border border-black/5" 
                                        referrerPolicy="no-referrer"
                                    />
                                )}
                                <div className="whitespace-pre-wrap break-words">
                                    {msg.role === 'user' ? (
                                        msg.text
                                    ) : (
                                        <div className="font-tiro w-full">
                                            {parseMessageContent(msg.text).map((part, pIdx) => {
                                                if (part.type === 'text') {
                                                    const formattedContent = (part.content || '')
                                                        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>')
                                                        .replace(/\n/g, '<br/>');

                                                    return (
                                                        <p key={pIdx} className="whitespace-pre-wrap mb-2 text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{__html: formattedContent}}></p>
                                                    );
                                                } else if (part.type === 'mcq' && part.data) {
                                                    const mcq = part.data;
                                                    const stateKey = `${msg.id}_${pIdx}`;
                                                    const state = mcqStates[stateKey] || { selected: null, isCorrect: null };
                                                    
                                                    return (
                                                        <div key={pIdx} className="bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/10 rounded-2xl p-4 my-4 shadow-sm">
                                                            <p className="font-bold text-sm mb-4 text-gray-900 dark:text-white leading-snug whitespace-pre-wrap">
                                                                <span className="text-orange-500 mr-2">Q.</span>
                                                                {mcq.question}
                                                            </p>
                                                            <div className="grid grid-cols-1 gap-2">
                                                                {mcq.options.map((opt) => {
                                                                    const isSelected = state.selected === opt.label;
                                                                    const isCorrect = opt.label === mcq.correct;
                                                                    const showResult = !!state.selected;

                                                                    let btnClass = "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300";
                                                                    if (showResult) {
                                                                        if (isCorrect) btnClass = "bg-green-500/10 border-green-500 text-green-700 dark:text-green-400";
                                                                        else if (isSelected) btnClass = "bg-red-500/10 border-red-500 text-red-700 dark:text-red-400";
                                                                        else btnClass = "opacity-50 grayscale";
                                                                    } else {
                                                                        btnClass += " hover:border-orange-500 active:bg-gray-50";
                                                                    }

                                                                    return (
                                                                        <button
                                                                            key={opt.label}
                                                                            disabled={showResult}
                                                                            onClick={() => handleMCQOptionClick(msg.id, pIdx, opt.label, mcq.correct)}
                                                                            className={`w-full p-3.5 text-left rounded-xl border-2 text-sm font-medium transition-all flex items-center justify-between ${btnClass}`}
                                                                        >
                                                                            <span className="flex items-center gap-3 whitespace-pre-wrap">
                                                                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[12px] font-bold border ${isSelected ? 'bg-current text-white border-transparent' : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}>
                                                                                    {opt.label}
                                                                                </span>
                                                                                {opt.text}
                                                                            </span>
                                                                            {showResult && isCorrect && <CheckCircle size={16} className="text-green-500" />}
                                                                            {showResult && isSelected && !isCorrect && <XCircle size={16} className="text-red-500" />}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                            {state.selected && (
                                                                <motion.div 
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800"
                                                                >
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <Sparkles size={14} className="text-orange-500" />
                                                                        <span className="text-[12px] font-bold uppercase tracking-widest text-orange-500">Explanation</span>
                                                                    </div>
                                                                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic whitespace-pre-wrap">
                                                                        {mcq.explanation}
                                                                    </p>
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })}
                                        </div>
                                    )}
                                </div>

                                {msg.sources && msg.sources.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800 flex flex-wrap gap-2">
                                        {msg.sources.map((src, i) => (
                                            <a 
                                                key={i} 
                                                href={src.uri} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-[12px] px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full hover:bg-orange-500 hover:text-white transition-colors"
                                            >
                                                <ExternalLink size={10} /> {src.title.length > 15 ? src.title.substring(0, 15) + '...' : src.title}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <span className="text-[9px] text-gray-400 mt-1 px-1 font-medium">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </motion.div>
                ))
            )}
            
            {loading && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                >
                    <div className="bg-white dark:bg-zinc-900 px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center gap-3">
                        <div className="flex gap-1">
                            <motion.div 
                                animate={{ scale: [1, 1.5, 1] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                                className="w-1.5 h-1.5 bg-orange-500 rounded-full"
                            />
                            <motion.div 
                                animate={{ scale: [1, 1.5, 1] }}
                                transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                                className="w-1.5 h-1.5 bg-orange-500 rounded-full"
                            />
                            <motion.div 
                                animate={{ scale: [1, 1.5, 1] }}
                                transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                                className="w-1.5 h-1.5 bg-orange-500 rounded-full"
                            />
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Thinking...</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Input Area - Floating Style */}
      <div className="p-4 bg-transparent shrink-0 z-50">
          <div className="max-w-3xl mx-auto relative">
              
              <AnimatePresence>
                {previewUrl && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute bottom-full left-0 mb-4 p-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 z-10"
                    >
                        <div className="relative group">
                            <img src={previewUrl} alt="Preview" className="h-32 w-auto rounded-xl object-cover" />
                            <button 
                                onClick={removeImage}
                                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </motion.div>
                )}
              </AnimatePresence>

              <div className="bg-white dark:bg-zinc-900 rounded-[28px] shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-200/50 dark:border-zinc-800/50 flex items-end p-1.5 gap-1.5">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-full transition-all active:scale-90"
                  >
                      <ImageIcon size={22} />
                  </button>
                  
                  <textarea
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendBotMessage();
                        }
                    }}
                    placeholder="আপনার প্রশ্নটি এখানে লিখুন..."
                    className="flex-1 bg-transparent py-3 px-2 text-sm text-gray-800 dark:text-white outline-none resize-none max-h-32 min-h-[44px]"
                    rows={1}
                  />

                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />

                  <button 
                    onClick={() => loading ? null : sendBotMessage()}
                    disabled={(!input.trim() && !selectedImage) || loading}
                    className={`
                        p-3 rounded-full transition-all active:scale-90 shadow-lg
                        ${(!input.trim() && !selectedImage) || loading
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-orange-500 text-white shadow-orange-500/30 hover:bg-orange-600'
                        }
                    `}
                  >
                      {loading ? <Loader2 size={22} className="animate-spin" /> : <Send size={22} />}
                  </button>
              </div>
              
              <p className="text-[12px] text-center text-gray-400 mt-3 font-medium tracking-wide">
                  AI can make mistakes. Check important info.
              </p>
          </div>
      </div>
    </div>
  );
};

export default PorikkhangonAI;
