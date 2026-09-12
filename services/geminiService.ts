
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { logger } from '../utils/logger';
import { QuizQuestion, Subject, AdmissionResult, SearchSource, ExamStandard, QuizConfig, DifficultyLevel } from "../types";

// ============================================================
// 🔑 API KEY CONFIGURATION (SECURE)
// ============================================================
// ⚠️ NEVER hardcode API keys in this file. This repo is public and
// anything here ships inside the browser bundle where anyone can read it.
// Keys are resolved ONLY from, in priority order:
//   1. Build-time env vars  (VITE_GEMINI_API_KEY / VITE_API_KEY / GEMINI_API_KEY)
//   2. The end-user's OWN key saved in their browser (AI Settings screen)
// Long-term the AI calls should move to a backend proxy — see SECURITY.md.
const CUSTOM_KEY_STORAGE_KEY = 'porikkhangon_custom_api_key';

const readEnvKey = (): string => {
  // Vite browser build
  try {
    // @ts-ignore - import.meta.env is provided by Vite
    const viteEnv = typeof import.meta !== 'undefined' ? import.meta.env : undefined;
    const viteKey = viteEnv?.VITE_GEMINI_API_KEY || viteEnv?.VITE_API_KEY || viteEnv?.GEMINI_API_KEY;
    if (typeof viteKey === 'string' && viteKey.length > 10) return viteKey;
  } catch (_e) {
    // ignore
  }

  // AI Studio / Node-style runtimes (guarded: `process` does not exist in browsers)
  try {
    // @ts-ignore
    const nodeEnv = typeof process !== 'undefined' ? process.env : undefined;
    const nodeKey = nodeEnv?.GEMINI_API_KEY || nodeEnv?.VITE_GEMINI_API_KEY || nodeEnv?.VITE_API_KEY;
    if (typeof nodeKey === 'string' && nodeKey.length > 10) return nodeKey;
  } catch (_e) {
    // ignore
  }

  return '';
};

const readCustomKey = (): string => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return (localStorage.getItem(CUSTOM_KEY_STORAGE_KEY) || '').trim();
    }
  } catch (_e) {
    // localStorage unavailable (private mode etc.)
  }
  return '';
};

/** Resolve the Gemini API key. Returns "" when none is configured. */
export const getGeminiApiKey = (): string => {
  return readEnvKey() || readCustomKey();
};

/** True when at least one API key source is available. */
export const isGeminiConfigured = (): boolean => {
  return getGeminiApiKey().length > 10;
};

const getClient = () => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    logger.warn(
      "Gemini API Key is missing. Set VITE_GEMINI_API_KEY in .env (see .env.example) " +
      "or add your own key in the app's AI Settings screen."
    );
  }
  return new GoogleGenAI({ apiKey: apiKey || 'dummy_key' });
};

const cleanJsonString = (str: string) => {
  return str.replace(/```json/g, '').replace(/```/g, '').trim();
};

// --- MODELS CONFIG ---
const GENERATIVE_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-preview-09-2025",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite"
];

const PORIKKHANGON_MODELS = [
  "gemini-2.5-flash-preview-09-2025", 
  "gemini-2.5-flash-lite",           
  "gemini-2.0-flash",                
  "gemini-2.0-flash-lite",           
  "gemini-2.5-pro",                  
  "gemini-3-pro"                     
];

const PORIKKHANGON_SYSTEM_PROMPT = `তুমি হলে HSC পরীক্ষার প্রস্তুতিতে সাহায্য করার জন্য একজন অত্যন্ত জ্ঞানী, বন্ধুত্বপূর্ণ এবং স্মার্ট বড় ভাই (টিউটর)। তোমার সব উত্তর অবশ্যই নির্ভুল, সহজবোধ্য বাংলায় (বাংলা) দিতে হবে। তুমি সবসময় 'তুমি' করে সম্বোধন করবে এবং অনানুষ্ঠানিক, আন্তরিক ভাষায় কথা বলবে, যেন ছোট ভাই বা বন্ধুর সাথে কথা বলছো। তোমার লক্ষ্য হলো কঠিন বিষয়গুলো সরল ও সংক্ষিপ্তভাবে বোঝানো।

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

export interface PorikkhangonResponse {
  text: string;
  sources: SearchSource[];
}

export const generatePorikkhangonResponse = async (
  history: { role: string; parts: { text?: string; inlineData?: any }[] }[]
): Promise<PorikkhangonResponse> => {
  const client = getClient();
  let lastError: any = null;

  for (const model of PORIKKHANGON_MODELS) {
    try {
      const response = await client.models.generateContent({
        model: model,
        contents: history,
        config: {
          systemInstruction: PORIKKHANGON_SYSTEM_PROMPT,
          temperature: 0.2,
          tools: [{ googleSearch: {} }]
        }
      });

      if (response.text) {
        const sources: SearchSource[] = [];
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
          chunks.forEach((chunk: any) => {
            if (chunk.web) {
              sources.push({
                title: chunk.web.title,
                uri: chunk.web.uri
              });
            }
          });
        }
        return { text: response.text, sources };
      }
      throw new Error(`Empty response from ${model}`);
    } catch (error: any) {
      lastError = error;
    }
  }

  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
     const response = await client.models.generateContent({
        model: PORIKKHANGON_MODELS[0],
        contents: history,
        config: {
          systemInstruction: PORIKKHANGON_SYSTEM_PROMPT,
          temperature: 0.2,
          tools: [{ googleSearch: {} }]
        }
      });
      if (response.text) {
         return { text: response.text, sources: [] };
      }
  } catch (_e) {
    logger.error("Porikkhangon AI: Final backoff failed.");
  }

  throw lastError || new Error("Failed to generate response.");
};

export const explainConcept = async (
  topic: string, 
  subject: Subject, 
  history: { role: string; parts: { text: string }[] }[]
) => {
  try {
    const ai = getClient();
    const systemPrompt = `তুমি হলে একজন বিশেষজ্ঞ শিক্ষক। তোমার কাজ হলো "${subject}" বিষয়ের "${topic}" টপিকটি অত্যন্ত সহজভাবে বুঝিয়ে বলা। 
    
    ${LATEX_INSTRUCTION}
    
    নির্দেশনা:
    ১. ভাষা অবশ্যই সহজবোধ্য বাংলা হতে হবে।
    ২. উদাহরণ দিয়ে বোঝানোর চেষ্টা করবে।
    ৩. উত্তর খুব বেশি বড় করবে না, তবে মূল পয়েন্টগুলো যেন থাকে।
    ৪. শুধুমাত্র প্লেইন টেক্সট এবং ল্যাটেক্স ব্যবহার করবে। কোনো বোল্ড বা ইটালিক মার্কডাউন ব্যবহার করবে না।`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: history,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3
      }
    });

    return response.text || "দুঃখিত, আমি উত্তরটি তৈরি করতে পারিনি।";
  } catch (error) {
    logger.error("Error in explainConcept:", error);
    throw error;
  }
};

const LATEX_INSTRUCTION = `
For ALL mathematical, physical, and chemical symbols/equations, ALWAYS use LaTeX syntax enclosed within single dollar signs ($). 
For example, use $\\vec{A} \\times \\vec{B}$ for vector product, $\\theta$ for theta, $\\frac{1}{2}$ for a half, and use subscripts/superscripts correctly (e.g., $H_2O$ for water). 
Ensure all LaTeX expressions are correctly formatted for MathJax rendering and appear INLINE within the text flow where needed.
`;

export const generateQuiz = async (
  configs: QuizConfig[],
  standard: ExamStandard,
  count: number,
  difficulty?: DifficultyLevel,
  focusInstruction?: string,
  customTemperature?: number
): Promise<QuizQuestion[]> => {
  try {
    const ai = getClient();
    
    let contextStr = "";
    let isPresetMode = false;

    const distribution = configs.map(cfg => {
      if (cfg.questionCount) {
        isPresetMode = true;
        return `- Subject: ${cfg.subject}, Count: ${cfg.questionCount} questions.`;
      }
      return `- Subject: ${cfg.subject}, Chapter: ${cfg.chapter}, Topics: [${cfg.topics.join(', ')}]`;
    }).join('\n');

    contextStr = distribution;

    let prompt = `Generate exactly ${count} MCQ questions based on the following specific configuration:\n\n${contextStr}\n\nExam Standard: ${standard}\n`;
    
    if (focusInstruction) {
        prompt += `\n*** STRICT FOCUS INSTRUCTION FOR THIS BATCH ***\n${focusInstruction}\n`;
    }

    if (difficulty && !focusInstruction) {
      prompt += `Difficulty Level: ${difficulty}\n`;
      prompt += `Difficulty Instructions:
      - If Easy/Warm-up: Basic concepts, direct definitions, and formula-based simple math.
      - If Medium/Standard: Mix of conceptual, application, and standard admission test problems.
      - If Hard/Nightmare: Multi-step problems, tricky logic, deep conceptual traps, and advanced applications.
      \n`;
    }

    prompt += `Instructions:
    ${LATEX_INSTRUCTION}
    1. ${isPresetMode ? 'Strictly follow the question distribution per subject provided above.' : 'Distribute questions fairly among the topics.'}
    2. Questions MUST be derived strictly from the provided Chapter and Topics.
    3. Language: Bengali (Standard NCTB terminology).
    4. Output strictly in JSON format array.
    5. **CRITICAL**: You MUST populate the 'subject', 'chapter', and 'topic' fields for every single question.
       - 'subject': Must match the subject name provided in configuration (e.g. Physics 2nd Paper).
       - 'chapter': Must be the EXACT BENGALI NAME of the chapter provided in the configuration (e.g. তাপগতিবিদ্যা). Do NOT leave this empty.
       - 'topic': Must be the specific topic name in Bengali (e.g. কার্নো ইঞ্জিন).
    6. Return EXACTLY ${count} questions.`;

    let temp = 0.4;
    if (customTemperature !== undefined) {
        temp = customTemperature;
    } else if (difficulty === DifficultyLevel.HARD) {
        temp = 0.6;
    }

    const responseSchema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of 4 options"
          },
          correctAnswerIndex: { type: Type.INTEGER, description: "Index of the correct option (0-3)" },
          explanation: { type: Type.STRING, description: "Detailed explanation" },
          subject: { type: Type.STRING, description: "The subject this question belongs to" },
          chapter: { type: Type.STRING, description: "The specific chapter name in BENGALI (e.g. ভেক্টর). Must not be empty." },
          topic: { type: Type.STRING, description: "The specific topic name in BENGALI (e.g. লব্ধি). Must not be empty." }
        },
        required: ["question", "options", "correctAnswerIndex", "explanation", "subject", "chapter", "topic"]
      }
    };

    // Retry Loop with Model Rotation
    let lastError: any = null;
    for (const model of GENERATIVE_MODELS) {
      try {
        logger.debug(`Generating quiz with model: ${model}`);
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
            temperature: temp
          }
        });

        if (response.text) {
          const data = JSON.parse(cleanJsonString(response.text));
          const finalQuestions = (data as QuizQuestion[]);
          
          if (configs.length === 1 && !isPresetMode) {
             finalQuestions.forEach(q => {
                 if (!q.chapter) q.chapter = configs[0].chapter;
                 if (!q.subject) q.subject = configs[0].subject;
             });
          }

          return finalQuestions.slice(0, count);
        }
      } catch (error: any) {
        logger.warn(`Model ${model} failed:`, error.message);
        lastError = error;
      }
    }

    logger.error("All models failed to generate quiz.");
    throw lastError || new Error("Failed to generate quiz.");

  } catch (error) {
    logger.error("Error generating quiz:", error);
    throw error;
  }
};

export const searchAdmissionInfo = async (query: string): Promise<AdmissionResult> => {
  try {
    const ai = getClient();
    const prompt = `Find the latest information regarding: ${query}. 
    Target context: University Admissions in Bangladesh (BUET, Dhaka University, Medical, Engineering, GST, etc.).
    Summarize the key dates, requirements, or information clearly in Bengali.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "দুঃখিত, কোনো তথ্য পাওয়া যায়নি।";
    
    const sources: SearchSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      });
    }

    return { text, sources };
  } catch (error) {
    logger.error("Error searching admission info:", error);
    throw error;
  }
};

export const enrichQuestionList = async (
  rawQuestions: any[],
  examName: string,
  year: string
): Promise<QuizQuestion[]> => {
  const ai = getClient();
  const chunks = [];
  const chunkSize = 15;

  for (let i = 0; i < rawQuestions.length; i += chunkSize) {
    chunks.push(rawQuestions.slice(i, i + chunkSize));
  }

  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING },
        options: { type: Type.ARRAY, items: { type: Type.STRING } },
        correctAnswerIndex: { type: Type.INTEGER },
        explanation: { type: Type.STRING },
        subject: { type: Type.STRING },
        chapter: { type: Type.STRING },
        topic: { type: Type.STRING }
      },
      required: ["question", "options", "correctAnswerIndex", "explanation", "subject", "chapter", "topic"]
    }
  };

  let enrichedResults: QuizQuestion[] = [];

  for (const chunk of chunks) {
    const prompt = `
      I have a list of raw questions from the ${examName} (${year}) admission test. 
      Your task is to analyze each question and ENRICH it.
      
      Raw Data: ${JSON.stringify(chunk)}

      Requirements:
      ${LATEX_INSTRUCTION}
      1. **Subject & Chapter Detection**: Accurately detect the Subject (Physics 1st/2nd Paper, Chemistry 1st/2nd Paper, Biology 1st/2nd Paper, English, General Knowledge) and the specific Chapter Name in Bengali strictly following the NCTB HSC Syllabus.
      2. **Explanation**: Provide a detailed, high-quality explanation for the correct answer. Cite logic from standard textbooks (e.g., Gazi Ajmal, Hazari Nag, Tapan/Ishaq) where applicable. The explanation must be in Bengali.
      3. **Topic**: Identify a short specific topic (e.g. 'Vector', 'Organic Chemistry', 'Grammar').
      4. **Validation**: Correct any typos in the raw question or options. Ensure options are a list of 4 strings.
      
      Output strictly as a JSON array matching the schema.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          temperature: 0.2
        }
      });

      if (response.text) {
        const data = JSON.parse(cleanJsonString(response.text));
        enrichedResults = [...enrichedResults, ...data];
      }
      await new Promise(r => setTimeout(r, 1000));

    } catch (e) {
      logger.error("Batch processing failed:", e);
      const fallback = chunk.map((q: any) => ({
         question: q.question,
         options: q.options || [],
         correctAnswerIndex: q.correctAnswerIndex || 0,
         explanation: "AI processing failed. Please add explanation manually.",
         subject: "Unknown",
         chapter: "Unknown",
         topic: "Unknown"
      }));
      enrichedResults = [...enrichedResults, ...fallback];
    }
  }

  return enrichedResults;
};
