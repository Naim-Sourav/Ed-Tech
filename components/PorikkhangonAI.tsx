
import React, { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Send, Sparkles, Bot, ExternalLink, ArrowLeft, Trash2, StopCircle, Loader2, CheckCircle, XCircle, HelpCircle, Settings, Key } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useNavigate } from 'react-router-dom';
import { useCache } from '../contexts/CacheContext';

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

    // Only update UI for user message on first attempt
    if (modelIndex === 0) {
        const newUserMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: userQuery,
            imageUrl: previewUrl || undefined
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
                sources: sources.length > 0 ? sources : undefined
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
                text: "দুঃখিত, কোনো মডেলে উত্তর দেওয়া সম্ভব হয়নি। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।" 
            }]);
            setLoading(false);
        }
    }
  };

  const handleSuggestion = (text: string) => {
      setInput(text);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 relative">
      
      {/* Header */}
      <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between sticky top-0 z-20 shadow-sm shrink-0 pt-safe-area">
         <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300"/>
            </button>
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white shadow-md">
                <Bot size={20} />
            </div>
            <div>
                <h3 className="font-bold text-base md:text-lg text-gray-800 dark:text-white flex items-center gap-2">
                    Porikkhangon AI <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded text-[10px] font-medium border border-orange-200 dark:border-orange-800">BETA</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">তোমার HSC পার্সোনাল টিউটর</p>
            </div>
         </div>
         
         <div className="flex items-center gap-1">
             <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-full transition-colors" title="Settings">
                <Settings size={18} />
             </button>
             <button onClick={clearChat} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors" title="Clear Chat">
                <Trash2 size={18} />
             </button>
         </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                          <Settings size={20} className="text-orange-500"/> AI সেটিংস
                      </h3>
                      <button onClick={() => setIsSettingsOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="p-5 overflow-y-auto">
                      <div className="mb-6">
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
                              <span className="flex items-center gap-2"><Key size={16} className="text-orange-500"/> Custom API Key (Optional)</span>
                              {apiStatus === 'valid' && <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle size={12}/> Active</span>}
                              {apiStatus === 'invalid' && <span className="text-xs text-red-600 flex items-center gap-1"><XCircle size={12}/> Invalid</span>}
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
                                  className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all text-sm text-gray-800 dark:text-white"
                              />
                              <button 
                                  onClick={testApiKey}
                                  disabled={apiStatus === 'testing' || !customApiKey.trim()}
                                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[70px]"
                              >
                                  {apiStatus === 'testing' ? <Loader2 size={16} className="animate-spin"/> : 'Test'}
                              </button>
                          </div>
                          {apiStatus === 'invalid' && (
                              <p className="text-xs text-red-500 mt-2">{apiErrorMessage}</p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              আপনার নিজস্ব API Key ব্যবহার করলে আপনি আনলিমিটেড ডাউট সলভ করতে পারবেন। এটি আপনার ব্রাউজারেই সেভ থাকবে।
                          </p>

                          {/* Stats Section */}
                          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                              <h4 className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">API Usage Stats (Today)</h4>
                              <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm text-gray-700 dark:text-gray-300">Requests Made:</span>
                                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{requestStats.count}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-700 dark:text-gray-300">Free Tier Limit:</span>
                                  <span className="text-sm font-bold text-gray-600 dark:text-gray-400">1,500 / day</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2 overflow-hidden">
                                  <div className="bg-orange-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min((requestStats.count / 1500) * 100, 100)}%` }}></div>
                              </div>
                          </div>
                      </div>

                      <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800 rounded-xl p-4">
                          <h4 className="font-bold text-sm text-orange-800 dark:text-orange-300 mb-2 flex items-center gap-1.5">
                              <HelpCircle size={16}/> API Key কী এবং কীভাবে পাবেন?
                          </h4>
                          <p className="text-xs text-orange-700/80 dark:text-orange-200/70 leading-relaxed mb-3">
                              API Key হলো একটি গোপন কোড যা দিয়ে আপনি Google এর AI (Gemini) সার্ভিস ব্যবহার করতে পারবেন। 
                          </p>
                          <ol className="text-xs text-orange-700/80 dark:text-orange-200/70 space-y-2 list-decimal list-inside mb-4">
                              <li>নিচের বাটনে ক্লিক করে Google AI Studio তে যান।</li>
                              <li>আপনার Google অ্যাকাউন্ট দিয়ে লগইন করুন।</li>
                              <li>"Get API key" বাটনে ক্লিক করুন।</li>
                              <li>"Create API key" এ ক্লিক করে নতুন কি (Key) তৈরি করুন এবং কপি করে এখানে পেস্ট করুন।</li>
                          </ol>
                          <a 
                              href="https://aistudio.google.com/app/apikey" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-700 text-orange-600 dark:text-orange-400 rounded-lg text-xs font-bold hover:bg-orange-100 dark:hover:bg-gray-700 transition-colors"
                          >
                              Get API Key <ExternalLink size={14}/>
                          </a>
                      </div>
                  </div>
                  
                  <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
                      <button 
                          onClick={() => setIsSettingsOpen(false)}
                          className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-colors shadow-md"
                      >
                          Save & Close
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Chat Area - Updated scroll logic */}
      <div 
        id="porikkhangon-chat-container" 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-50/50 dark:bg-gray-900 scroll-smooth"
      >
         {messages.length === 0 && (
             <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-0 animate-in fade-in zoom-in duration-500 delay-100">
                <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-orange-100 dark:border-gray-700">
                    <Sparkles size={40} className="text-orange-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Porikkhangon AI-এ স্বাগতম!</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[250px] leading-relaxed mb-8">
                    আমি তোমার গণিত, পদার্থবিদ্যা, রসায়ন এবং জীববিজ্ঞানের যেকোনো ডাউট সমাধান করতে পারি।
                </p>
                
                <div className="flex flex-wrap justify-center gap-2">
                    {['নিউটনের ৩য় সূত্র কী?', 'DNA এর গঠন', 'Organic Chemistry টিপস', 'Vector Math Solve'].map((s, i) => (
                        <button 
                            key={i} 
                            onClick={() => handleSuggestion(s)}
                            className="px-4 py-2 bg-white dark:bg-gray-800 border border-orange-100 dark:border-gray-700 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-orange-400 dark:hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-all shadow-sm"
                        >
                            {s}
                        </button>
                    ))}
                </div>
             </div>
         )}

         {messages.map((msg) => (
             <div key={msg.id} className={`mb-6 flex flex-col ${msg.role === 'user' ? 'ml-auto items-end max-w-[85%]' : 'mr-auto items-start max-w-full md:max-w-[85%]'}`}>
                 {msg.imageUrl && (
                     <div className="mb-2 p-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                         <img src={msg.imageUrl} className="max-w-[200px] max-h-[200px] rounded-lg object-cover" alt="Upload" />
                     </div>
                 )}
                 
                 <div className={`px-4 py-3 rounded-2xl text-[13px] md:text-sm leading-relaxed shadow-sm ${
                     msg.role === 'user' 
                     ? 'bg-orange-500 text-white rounded-tr-none' 
                     : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-none shadow-none p-0 w-full'
                 }`}>
                     {msg.role === 'user' ? (
                         msg.text
                     ) : (
                         <div className="font-tiro w-full">
                             {/* Render Parsed Content */}
                             {parseMessageContent(msg.text).map((part, pIdx) => {
                                 if (part.type === 'text') {
                                     // Enhanced Text Formatting for Bold and Line Breaks
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
                                         <div key={pIdx} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 my-3 shadow-sm">
                                             <p className="font-bold text-gray-800 dark:text-white mb-3 border-b border-blue-200 dark:border-blue-800 pb-2 border-dashed">{mcq.question}</p>
                                             <div className="space-y-2">
                                                 {mcq.options.map((opt, oIdx) => {
                                                     const isSelected = state.selected === opt.label;
                                                     const isCorrect = opt.label === mcq.correct;
                                                     
                                                     let btnClass = "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20";
                                                     
                                                     if (state.selected) {
                                                         if (isCorrect) btnClass = "bg-green-500 text-white border-green-600 shadow-md";
                                                         else if (isSelected) btnClass = "bg-red-100 text-red-700 border-red-200";
                                                         else btnClass = "opacity-60 grayscale bg-gray-100 dark:bg-gray-800";
                                                     }

                                                     return (
                                                         <button 
                                                             key={oIdx}
                                                             onClick={() => handleMCQOptionClick(msg.id, pIdx, opt.label, mcq.correct)}
                                                             disabled={!!state.selected}
                                                             className={`w-full text-left p-3 rounded-lg border text-sm transition-all flex items-start gap-3 ${btnClass}`}
                                                         >
                                                             <span className="font-bold min-w-[20px]">{opt.label})</span>
                                                             <span>{opt.text}</span>
                                                             {state.selected && isCorrect && <CheckCircle size={16} className="ml-auto"/>}
                                                             {state.selected && isSelected && !isCorrect && <XCircle size={16} className="ml-auto"/>}
                                                         </button>
                                                     );
                                                 })}
                                             </div>
                                             {state.selected && (
                                                 <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/10 border-l-4 border-green-500 rounded-r-lg text-xs md:text-sm text-green-800 dark:text-green-200 animate-in fade-in slide-in-from-top-2">
                                                     <strong>ব্যাখ্যা:</strong> {mcq.explanation}
                                                 </div>
                                             )}
                                         </div>
                                     );
                                 }
                                 return null;
                             })}

                             {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><ExternalLink size={10}/> তথ্যসূত্র:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {msg.sources.map((source, sIdx) => (
                                            <a key={sIdx} href={source.uri} target="_blank" rel="noopener noreferrer" className="px-2 py-1 bg-gray-50 dark:bg-gray-700/50 rounded-md text-[10px] text-emerald-600 hover:text-emerald-700 hover:underline truncate max-w-[150px] border border-gray-100 dark:border-gray-700">
                                                {source.title}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                             )}
                         </div>
                     )}
                 </div>
             </div>
         ))}
         
         {loading && (
             <div className="flex items-center gap-2 mr-auto ml-2 mb-4">
                 <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center shadow-sm">
                     <Loader2 size={16} className="animate-spin text-orange-500" />
                 </div>
                 <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                 </div>
             </div>
         )}
      </div>

      {/* Input Area - Improved */}
      <div className="p-3 md:p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-20 shrink-0 relative pb-safe-area">
         {previewUrl && (
             <div className="absolute bottom-full left-4 mb-2 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom-2 z-30">
                 <div className="relative">
                     <img src={previewUrl} className="h-20 w-20 object-cover rounded-lg border border-gray-100 dark:border-gray-700" alt="Preview"/>
                     <button onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm hover:bg-red-600 border-2 border-white dark:border-gray-800 transition-colors">
                         <X size={12}/>
                     </button>
                 </div>
             </div>
         )}
         
         <div className="flex items-end gap-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-[24px] border border-gray-200 dark:border-gray-700 focus-within:ring-2 ring-orange-500/20 focus-within:border-orange-500 transition-all shadow-sm">
            <label className="p-3 text-gray-400 hover:text-orange-500 cursor-pointer transition-colors rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 shrink-0">
                <ImageIcon size={22} />
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            
            <textarea 
                rows={1}
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
                placeholder="আপনার প্রশ্ন লিখুন..." 
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm md:text-base text-gray-800 dark:text-white placeholder-gray-400 font-medium py-3 resize-none max-h-[120px]"
                autoComplete="off"
            />
            
            <button 
                onClick={() => sendBotMessage()} 
                disabled={loading || (!input.trim() && !selectedImage)} 
                className={`p-3 rounded-full shadow-md transition-all active:scale-95 shrink-0 ${
                    loading || (!input.trim() && !selectedImage)
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg'
                }`}
            >
                {loading ? <StopCircle size={20} className="animate-pulse"/> : <Send size={20} className="ml-0.5" />}
            </button>
         </div>
      </div>
    </div>
  );
};

export default PorikkhangonAI;
