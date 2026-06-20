import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  saveQuestionAPI,
  unsaveQuestionAPI,
  fetchSavedQuestionsAPI,
  fetchQuestionsFromBankAPI,
  fetchSyllabusStatsAPI,
  fetchQuestionsByExamRefAPI,
} from "../services/api";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Archive,
  Play,
  Eye,
  EyeOff,
  Dna,
  Beaker,
  Atom,
  Calculator,
  Languages,
  Book,
  Globe,
  Cpu,
  BrainCircuit,
  Bookmark,
  Share2,
  BookOpen,
  Stethoscope,
  Syringe,
  Shield,
  Search,
  Sparkles,
  SlidersHorizontal,
  Compass,
  CheckCircle,
  Clock,
  BookMarked,
  Layers,
  X,
  Settings2,
  Plus
} from "lucide-react";
import { QuizQuestion } from "../types";
import { SYLLABUS_DB } from "../services/syllabusData";
import { useToast } from "./Toast";
import { normalizeBangla } from "../utils/normalization";
import { motion, AnimatePresence } from "motion/react";
import EmptyState from "./EmptyState";

// --- BOARD & COLLEGE CONSTANTS FOR ACADEMIC ---
const BOARDS = [
  { id: "DB", name: "ঢাকা" },
  { id: "RB", name: "রাজশাহী" },
  { id: "CB", name: "কুমিল্লা" },
  { id: "JB", name: "যশোর" },
  { id: "ChB", name: "চট্টগ্রাম" },
  { id: "BB", name: "বরিশাল" },
  { id: "SB", name: "সিলেট" },
  { id: "DiB", name: "দিনাজপুর" },
  { id: "MB", name: "মাদ্রাসা" },
  { id: "MSB", name: "ময়মনসিংহ" },
];

const COLLEGES = [
  "ACPSCD", "AMCM", "APBPSC", "BAFSC", "BAFSCJ", "BBGC", "BCC", "BCPSCB", "BGC", "BGCB", 
  "BNMPC", "CCC", "CCJ", "CC", "CPSCM", "CPSCR", "CWC", "DC", "DCC", "DGC", "DRMC", "FCC", 
  "FGC", "FGCC", "GAHC", "GAMCJ", "GBCG", "GCC", "GECP", "GGMC", "GHMMCC", "GSCD", "HLC", 
  "ICD", "IPSCC", "ISCM", "ITHSC", "JCCJ", "JCPSC", "LGC", "MCC", "MCD", "MGCC", "MUVCD", 
  "NDC", "NGC", "NGCN", "NGDCR", "NGVC", "NICK", "PGMC", "PGWC", "QCSC", "RC", "RCC", "RUMC", 
  "SBULAGC", "SCPSC", "SHS", "SMC", "SSAC", "VNSC"
];

// --- BENGALI NUMBER UTILITY ---
const toBengaliNumber = (num: string | number) => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .replace(/\d/g, (match) => bengaliDigits[parseInt(match)]);
};

// --- MULTI-USE COMPONENT: REVISION QUESTION CARD ---
const RevisionQuestionCard = React.memo(
  ({
    q,
    idx,
    userSelected,
    showAllAnswers,
    isSaved,
    onOptionClick,
    onToggleSave,
    showChapter = false,
    isGroupStart = false,
    isGroupMiddle = false,
    isGroupEnd = false,
    stimulusStart,
    stimulusEnd,
  }: {
    q: QuizQuestion;
    idx: number;
    userSelected: number | undefined;
    showAllAnswers: boolean;
    isSaved: boolean;
    onOptionClick: (qIdx: number, oIdx: number) => void;
    onToggleSave: (q: QuizQuestion) => void;
    showChapter?: boolean;
    isGroupStart?: boolean;
    isGroupMiddle?: boolean;
    isGroupEnd?: boolean;
    stimulusStart?: number;
    stimulusEnd?: number;
  }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const isAnswered = userSelected !== undefined;
    const showFeedback = isAnswered || showAllAnswers;
    const isRepeatStimulus = isGroupMiddle || isGroupEnd;

    // Targeted MathJax rendering to prevent global lag
    useEffect(() => {
      if (window.MathJax && cardRef.current) {
        const timer = setTimeout(() => {
          if (cardRef.current) {
            window.MathJax.typesetPromise([cardRef.current]).catch((err: any) =>
              console.error("MathJax card typeset:", err),
            );
          }
        }, 50);
        return () => clearTimeout(timer);
      }
    }, [showFeedback, q.question]);

    let roundedClasses = "rounded-3xl";
    let borderClasses = "border border-gray-150 dark:border-zinc-800";
    let marginClass = "mt-5";

    if (isGroupStart) {
      roundedClasses = "rounded-t-3xl rounded-b-none";
      borderClasses =
        "border border-b-dashed border-b-gray-200 dark:border-b-gray-800";
    } else if (isGroupMiddle) {
      roundedClasses = "rounded-none";
      borderClasses =
        "border-l border-r border-b-dashed border-b-gray-200 dark:border-b-gray-800 border-t-0";
      marginClass = "mt-0";
    } else if (isGroupEnd) {
      roundedClasses = "rounded-b-3xl rounded-t-none";
      borderClasses = "border border-t-0";
      marginClass = "mt-0";
    }

    return (
      <motion.div
        ref={cardRef}
        layout="position"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`p-4 pt-5 pb-4 md:px-5 transition-all duration-300 relative group bg-white dark:bg-zinc-950 shadow-sm hover:shadow-md ${roundedClasses} ${borderClasses} ${marginClass}`}
      >
        {/* Question Text & Stimulus */}
        <div className="relative z-10">
          {(q.contextText || q.contextImage) && !isRepeatStimulus && (
            <div className="mb-4 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/30">
              {stimulusStart && stimulusEnd ? (
                <div className="mb-2 pb-1 border-b border-blue-100/30 dark:border-blue-800/20 flex flex-col sm:flex-row items-center justify-between gap-1">
                  <span className="text-[10px] font-black tracking-widest text-blue-500 uppercase font-sans flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    নিচের উদ্দীপকের আলোকে {toBengaliNumber(stimulusStart)} ও{" "}
                    {toBengaliNumber(stimulusEnd)} নং প্রশ্নের উত্তর দাও:
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[9px] font-black tracking-widest text-blue-600 dark:text-blue-400 font-sans uppercase">
                    উদ্দীপক
                  </span>
                </div>
              )}
              {q.contextText && (
                <div
                  className="text-base md:text-[17px] font-semibold text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: q.contextText }}
                />
              )}
              {q.contextImage && (
                <div className="mt-2 rounded-xl overflow-hidden bg-white/50 dark:bg-black/10 border border-blue-200/30 p-2 shadow-sm">
                  <img
                    src={q.contextImage}
                    alt="Context"
                    className="rounded-lg max-h-48 object-contain mx-auto"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex items-start gap-1.5 mb-3">
            <span className="text-slate-950 dark:text-zinc-100 font-extrabold text-sm md:text-base shrink-0 select-none pt-0.5 min-w-[1.25rem]">
              {toBengaliNumber(idx + 1)}.
            </span>
            <div className="flex-1 min-w-0">
              <h3
                className="text-base md:text-[18px] font-medium text-slate-900 dark:text-white leading-relaxed font-tiro whitespace-pre-wrap"
                id={`q-title-${idx}`}
              >
                <div dangerouslySetInnerHTML={{ __html: q.question }} />
              </h3>
              {q.questionImage && (
                <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-gray-950 p-2 max-w-sm mt-2">
                  <img
                    src={q.questionImage}
                    alt="Question"
                    className="max-h-64 object-contain mr-auto"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Tags list */}
              <div className="flex flex-wrap gap-1.5 items-center mt-2">
                {q.tags &&
                  q.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-medium bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-lg border border-orange-100/50 dark:border-orange-800/30"
                    >
                      {tag}
                    </span>
                  ))}
                {showChapter && q.chapter && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border ${q.subject && SUBJECT_DEFINITIONS[q.subject] ? `${SUBJECT_DEFINITIONS[q.subject].bg} ${SUBJECT_DEFINITIONS[q.subject].color} border-current/10` : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100/50 dark:border-purple-800/30'}`}>
                    {q.chapter}
                  </span>
                )}
                {isRepeatStimulus && (
                  <span className="text-[10px] font-medium bg-gray-100 dark:bg-gray-805 text-gray-400 px-2 py-0.5 rounded-lg border border-gray-200/50 dark:border-zinc-800/50 font-sans">
                    পূর্বের উদ্দীপক
                  </span>
                )}
              </div>
            </div>

            <button
              id={`btn-save-rev-${idx}`}
              onClick={() => onToggleSave(q)}
              className={`p-2 rounded-xl border transition-all duration-300 ${
                isSaved
                  ? "bg-orange-500/10 text-primary border-orange-500/20"
                  : "bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-gray-700 border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              }`}
            >
              <Bookmark
                size={18}
                fill={isSaved ? "currentColor" : "none"}
                strokeWidth={2}
              />
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-1.5 mb-2 pl-0 md:pl-6 mt-4">
          {q.options.map((option, oIdx) => {
            const isSelected = userSelected === oIdx;
            const isRight = oIdx === q.correctAnswerIndex;

            let optionStyle = "bg-slate-50 border-slate-100 text-slate-700 dark:bg-zinc-900/40 dark:border-zinc-800/80 dark:text-zinc-300";
            let iconStyle = "bg-white border-slate-200 text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-500";

            if (showFeedback) {
              if (isRight) {
                optionStyle = "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-500/50 dark:text-emerald-400 font-medium";
                iconStyle = "bg-emerald-500 border-emerald-400 text-white";
              } else if (isSelected) {
                optionStyle = "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-500/50 dark:text-red-400";
                iconStyle = "bg-red-500 border-red-400 text-white";
              }
            } else if (isSelected) {
              optionStyle = "bg-orange-50 border-primary text-primary font-bold dark:bg-orange-950/10 dark:text-orange-400";
              iconStyle = "bg-primary border-primary text-white";
            }

            return (
              <button
                key={oIdx}
                disabled={showFeedback}
                onClick={() => onOptionClick(idx, oIdx)}
                className={`p-2 rounded-xl text-left text-sm md:text-base font-normal transition-all duration-200 border flex items-center gap-3 w-full ${optionStyle} ${
                  !showFeedback ? "cursor-pointer hover:border-slate-350 dark:hover:border-zinc-700" : ""
                }`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold border shrink-0 transition-colors ${iconStyle}`}>
                  {["ক", "খ", "গ", "ঘ"][oIdx] || String.fromCharCode(65 + oIdx)}
                </span>
                <div className="flex flex-col gap-1 flex-1">
                  <span
                    className="text-[15px] md:text-base font-normal whitespace-pre-wrap leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: option }}
                  ></span>
                  {q.optionsImages?.[oIdx] && (
                    <img
                      src={q.optionsImages[oIdx]}
                      alt={`Option ${oIdx}`}
                      className="h-16 w-fit object-contain rounded border self-start bg-white select-none mt-1"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
                {showFeedback && (
                  <div className="shrink-0 ml-auto">
                    {isRight ? (
                      <div className="shrink-0 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 p-1 rounded-full border border-emerald-150">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    ) : (
                      isSelected && (
                        <div className="shrink-0 text-rose-500 bg-rose-50 dark:bg-rose-900/30 p-1 rounded-full border border-rose-150">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </div>
                      )
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback / Explanation */}
        <AnimatePresence>
          {showFeedback && q.explanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-5 ml-0 md:ml-13 p-4 bg-orange-500/5 dark:bg-orange-500/5 rounded-2xl border border-orange-200/20 shadow-inner flex flex-col gap-2.5">
                <div className="flex items-center gap-1.5 pb-2 border-b border-orange-500/10">
                  <BookOpen size={15} className="text-primary" />
                  <h4 className="text-[11px] font-bold text-primary uppercase tracking-widest font-sans">
                    ব্যাখ্যা ও তথ্যাবলী
                  </h4>
                </div>
                <div className="text-[15px] md:text-base text-gray-800 dark:text-gray-200 leading-loose font-tiro whitespace-pre-wrap pl-1 overflow-hidden">
                  <div className="overflow-x-auto max-w-full break-words py-1 scrollbar-thin" dangerouslySetInnerHTML={{ __html: q.explanation }} />
                  {q.explanationImage && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-orange-200/20 p-1 max-w-sm bg-white dark:bg-black/20 self-start">
                      <img
                        src={q.explanationImage}
                        alt="Explanation"
                        className="max-h-48 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  },
);

RevisionQuestionCard.displayName = "RevisionQuestionCard";

// --- ALL AVAILABLE SUBJECTS (MATCHING SYLLABUS_DB KEYS) ---
const SUBJECT_DEFINITIONS: Record<
  string,
  { display: string; icon: any; color: string; bg: string }
> = {
  "Biology 1st Paper": {
    display: "জীববিজ্ঞান ১ম পত্র",
    icon: Dna,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/20",
  },
  "Biology 2nd Paper": {
    display: "জীববিজ্ঞান ২য় পত্র",
    icon: Dna,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/20",
  },
  "Physics 1st Paper": {
    display: "পদার্থবিজ্ঞান ১ম পত্র",
    icon: Atom,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/20",
  },
  "Physics 2nd Paper": {
    display: "পদার্থবিজ্ঞান ২য় পত্র",
    icon: Atom,
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-950/20",
  },
  "Chemistry 1st Paper": {
    display: "রসায়ন ১ম পত্র",
    icon: Beaker,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
  },
  "Chemistry 2nd Paper": {
    display: "রসায়ন ২য় পত্র",
    icon: Beaker,
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950/20",
  },
  "Higher Math 1st Paper": {
    display: "উচ্চতর গণিত ১ম পত্র",
    icon: Calculator,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/20",
  },
  "Higher Math 2nd Paper": {
    display: "উচ্চতর গণিত ২য় পত্র",
    icon: Calculator,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/20",
  },
  "Bangla 1st Paper": {
    display: "বাংলা ১ম পত্র",
    icon: Book,
    color: "text-red-500 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/20",
  },
  "Bangla 2nd Paper": {
    display: "বাংলা ২য় পত্র",
    icon: Book,
    color: "text-pink-500 dark:text-pink-400",
    bg: "bg-pink-50 dark:bg-pink-950/20",
  },
  English: {
    display: "ইংরেজি",
    icon: Languages,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/20",
  },
  ICT: {
    display: "আইসিটি",
    icon: Cpu,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/20",
  },
  "General Knowledge": {
    display: "সাধারণ জ্ঞান",
    icon: Globe,
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-50 dark:bg-slate-950/20",
  },
  "Mental Ability": {
    display: "মানসিক দক্ষতা",
    icon: BrainCircuit,
    color: "text-fuchsia-600 dark:text-fuchsia-400",
    bg: "bg-fuchsia-50 dark:bg-fuchsia-950/20",
  },
};

// --- ADMISSION INSTITUTIONS ---
const generateExamsForTag = (tag: string, yearsCount = 7) => {
  return Array.from({ length: yearsCount }, (_, i) => {
    const startYear = 2024 - i;
    const endYear = startYear + 1;
    const session = `${startYear.toString().substring(2)}-${endYear.toString().substring(2)}`;
    return {
      name: `${tag} '${session}`,
      examRef: `${tag} '${session}`,
    };
  });
};

const NEW_ADMISSION_TAGS = [
  {
    id: "du-a",
    name: "DU-A",
    icon: BookOpen,
    color:
      "text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-950/20",
  },
  {
    id: "medical",
    name: "Medical",
    icon: Stethoscope,
    color: "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/20",
  },
  {
    id: "dental",
    name: "Dental",
    icon: Syringe,
    color:
      "text-emerald-500 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20",
  },
  {
    id: "buet",
    name: "BUET",
    icon: Cpu,
    color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20",
  },
  {
    id: "ckruet-ka",
    name: "CKRUET-Ka",
    icon: Shield,
    color: "text-sky-600 bg-sky-50 dark:text-sky-400 dark:bg-sky-950/20",
  },
  {
    id: "gst-a",
    name: "GST-A",
    icon: Globe,
    color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20",
  },
  {
    id: "mbstu-a",
    name: "MBSTU-A",
    icon: Cpu,
    color: "text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-950/20",
  },
  {
    id: "ru-c",
    name: "RU-C",
    icon: BookMarked,
    color:
      "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/20",
  },
  {
    id: "just-c",
    name: "JUST-C",
    icon: Sparkles,
    color: "text-cyan-600 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-950/20",
  },
  {
    id: "sau",
    name: "SAU",
    icon: Compass,
    color: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/20",
  },
  {
    id: "sbau",
    name: "SBAU",
    icon: Compass,
    color: "text-lime-600 bg-lime-50 dark:text-lime-400 dark:bg-lime-950/20",
  },
  {
    id: "ruet",
    name: "RUET",
    icon: Shield,
    color:
      "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/20",
  },
  {
    id: "jnu-a",
    name: "JnU-A",
    icon: BookOpen,
    color:
      "text-fuchsia-600 bg-fuchsia-50 dark:text-fuchsia-400 dark:bg-fuchsia-950/20",
  },
  {
    id: "cu-a",
    name: "CU-A",
    icon: Book,
    color:
      "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20",
  },
  {
    id: "ku-a",
    name: "KU-A",
    icon: Globe,
    color: "text-blue-500 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20",
  },
  {
    id: "butex",
    name: "BUTex",
    icon: Cpu,
    color: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/20",
  },
  {
    id: "hstu-b",
    name: "HSTU-B",
    icon: BookMarked,
    color: "text-pink-600 bg-pink-50 dark:text-pink-400 dark:bg-pink-950/20",
  },
  {
    id: "hstu-a",
    name: "HSTU-A",
    icon: BookMarked,
    color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20",
  },
  {
    id: "sust-b",
    name: "SUST-B",
    icon: Sparkles,
    color: "text-cyan-500 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-950/20",
  },
  {
    id: "bsmrstu-b",
    name: "BSMRSTU-B",
    icon: Cpu,
    color:
      "text-violet-500 bg-violet-50 dark:text-violet-400 dark:bg-violet-950/20",
  },
];

const ADMISSION_INSTITUTIONS = NEW_ADMISSION_TAGS.map((tag) => ({
  id: tag.id,
  name: tag.name,
  icon: tag.icon,
  color: tag.color,
  units: [
    {
      id: "all",
      name: "সকল সেশন",
      exams: generateExamsForTag(tag.name, 12),
    },
  ],
}));

const MAIN_CATEGORIES = [
    { id: 'medical', name: 'মেডিকেল ও ডেন্টাল' },
    { id: 'varsity', name: 'বিশ্ববিদ্যালয়' },
    { id: 'engineering', name: 'ইঞ্জিনিয়ারিং' },
    { id: 'krishi', name: 'কৃষি গুচ্ছ' },
    { id: 'others', name: 'অন্যান্য' }
];

const QuestionBank: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  // Navigation State from URL
  const selectedLevel = searchParams.get("level") as
    | "ACADEMIC"
    | "ADMISSION"
    | "MAINBOOK"
    | null;
  const selectedSubject = searchParams.get("subject"); // Exact DB key
  const selectedChapter = searchParams.get("chapter");
  const selectedInstitution = searchParams.get("institution");
  const selectedUnit = searchParams.get("unit");
  const selectedExamRef = searchParams.get("examRef");
  const selectedAdmissionCategory = searchParams.get("admissionCategory");

  // Question State
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [syllabusStats, setSyllabusStats] = useState<any>(null);

  // Design Layout state (Compact vs Detailed)
  const [layoutMode, setLayoutMode] = useState<"compact" | "detailed">(
    "detailed",
  );

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Sub-filtering for ACADEMIC level (Board VS College)
  const [academicFilterType, setAcademicFilterType] = useState<"all" | "board" | "college">("all");
  const [selectedBoardTag, setSelectedBoardTag] = useState<string>("");
  const [selectedCollegeTag, setSelectedCollegeTag] = useState<string>("");

  // Track last fetched filters to detect when to reset page
  const lastFetchParams = useRef({
    subject: "",
    chapter: "",
    topic: "",
    level: "",
    search: "",
  });

  // Revision/Exam Mode State
  const [isRevisionMode, setIsRevisionMode] = useState(false);
  const [isLiveQuizMode, setIsLiveQuizMode] = useState(false);
  const [liveQuizStats, setLiveQuizStats] = useState({ correct: 0, wrong: 0, totalAnswered: 0 });
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const [expandedExplanations, setExpandedExplanations] = useState<Record<string, boolean>>({});
  const [userAnswers, setUserAnswers] = useState<Record<string, number[]>>({});
  const [savedQuestionIds, setSavedQuestionIds] = useState<Set<string>>(
    new Set(),
  );

  // Exam Config Sheet State
  const [showExamTypeSelect, setShowExamTypeSelect] = useState(false);
  const [showExamConfig, setShowExamConfig] = useState(false);
  const [examConfigState, setExamConfigState] = useState({
    numQuestions: 25,
    timeLimit: 20,
    negativeMark: 0.25,
  });

  // Debounced search logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Trigger MathJax rendering globally only when the main list is loaded
  useEffect(() => {
    if (window.MathJax) {
      setTimeout(() => {
        window.MathJax.typesetPromise().catch((err: any) =>
          console.error("MathJax typeset failed:", err),
        );
      }, 100);
    }
  }, [questions, isRevisionMode, layoutMode]);

  // Load Stats when level changes
  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await fetchSyllabusStatsAPI(selectedLevel || undefined);
        setSyllabusStats(stats);
      } catch (err) {
        console.error("Failed to load syllabus stats", err);
      }
    };
    loadStats();
  }, [selectedLevel]);

  // Fetch Questions when filters, search, or page change
  useEffect(() => {
    if (!selectedSubject && !selectedExamRef) return;

    let ignore = false;

    if (isFilterDirty) {
      lastFetchParams.current = { ...currentParams } as any;
      if (page !== 1) {
        setPage(1);
        setQuestions([]);
        return;
      } else {
        setQuestions([]);
      }
    }

    const loadQuestions = async () => {
      setLoading(true);
      try {
        let res: any;
        if (selectedExamRef) {
          const data = await fetchQuestionsByExamRefAPI(selectedExamRef);
          res = {
            questions: Array.isArray(data) ? data : data.questions || [],
            total: Array.isArray(data) ? data.length : data.total || 0,
          };
        } else {
          res = await fetchQuestionsFromBankAPI(
            page,
            25,
            selectedSubject ?? undefined,
            selectedChapter ?? undefined,
            undefined, // topic
            undefined, // examRef
            debouncedSearch || undefined, // search query
            selectedLevel ?? undefined, // level
            academicFilterType === "board" ? (selectedBoardTag || "ANY") : undefined,
            academicFilterType === "college" ? (selectedCollegeTag || "ANY") : undefined,
            false, // randomise
            selectedAdmissionCategory ?? undefined // admissionCategory
          );
        }

        if (ignore) return;

        const fetchedQuestions = res.questions || [];
        const totalCount = res.total || 0; // if available from API

        const extractYear = (ref: string) => {
          const match = ref?.match(/\d{2,4}/);
          if (!match) return 0;
          const y = parseInt(match[0]);
          return y < 100 ? 2000 + y : y;
        };

        const sortedFetched = [...fetchedQuestions].sort((a, b) => {
          const yearA = extractYear(a.examRef || "");
          const yearB = extractYear(b.examRef || "");
          if (yearA !== yearB) return yearB - yearA;
          return (a.orderIndex || 0) - (b.orderIndex || 0);
        });

        // Always replace questions for pagination
        setQuestions(sortedFetched);
        setHasMore(fetchedQuestions.length >= 25);
      } catch (err) {
        console.error(err);
        if (!ignore) showToast("প্রশ্ন লোড করতে সমস্যা হয়েছে", "error");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadQuestions();

    return () => {
      ignore = true;
    };
  }, [
    selectedSubject,
    selectedChapter,
    selectedLevel,
    selectedExamRef,
    page,
    debouncedSearch,
    academicFilterType,
    selectedBoardTag,
    selectedCollegeTag,
    selectedAdmissionCategory,
    showToast,
  ]);

  // Sync saved questions
  useEffect(() => {
    if (currentUser) {
      fetchSavedQuestionsAPI(currentUser.uid)
        .then((saved: any[]) => {
          const ids = new Set(
            saved.map((s: any) => s.questionId?._id).filter(Boolean),
          );
          setSavedQuestionIds(ids);
        })
        .catch(console.error);
    }
  }, [currentUser]);

  const normalizeText = normalizeBangla;

  // Filter questions on client side to keep dynamic filters smooth & responsive

  const currentParams = {
    level: selectedLevel || "",
    subject: selectedSubject || "",
    chapter: selectedChapter || "",
    topic: "",
    examRef: selectedExamRef || "",
    search: debouncedSearch,
    academicFilterType: academicFilterType,
    board: academicFilterType === "board" ? (selectedBoardTag || "") : "",
    college: academicFilterType === "college" ? (selectedCollegeTag || "") : "",
  };

  const isFilterDirty =
    lastFetchParams.current.level !== currentParams.level ||
    lastFetchParams.current.subject !== currentParams.subject ||
    lastFetchParams.current.chapter !== currentParams.chapter ||
    (lastFetchParams.current as any).examRef !== currentParams.examRef ||
    lastFetchParams.current.search !== currentParams.search ||
    (lastFetchParams.current as any).academicFilterType !== currentParams.academicFilterType ||
    (lastFetchParams.current as any).board !== currentParams.board ||
    (lastFetchParams.current as any).college !== currentParams.college;

  const filteredQuestions = useMemo(() => {
    if (selectedLevel !== "ACADEMIC") return questions;
    
    // Board mapping for flexible matching (compares en/bn variants inside examRef string)
    const BOARD_NAME_MAP: Record<string, { bn: string; en: string }> = {
      DB: { bn: "ঢাকা", en: "dhaka" },
      RB: { bn: "রাজশাহী", en: "rajshahi" },
      CB: { bn: "কুমিল্লা", en: "comilla" },
      JB: { bn: "যশোর", en: "jessore" },
      ChB: { bn: "চট্টগ্রাম", en: "chittagong" },
      BB: { bn: "বরিশাল", en: "barisal" },
      SB: { bn: "সিলেট", en: "sylhet" },
      DiB: { bn: "দিনাজপুর", en: "dinajpur" },
      MB: { bn: "মাদ্রাসা", en: "madrasah" },
      MSB: { bn: "ময়মনসিংহ", en: "mymensingh" },
    };

    return questions.filter((q) => {
      const examRefStr = q.examRef || "";
      const tagsStr = (q.tags || []).join(" ");
      const combinedRefStr = `${examRefStr} ${tagsStr}`.toUpperCase();
      
      // If we seek Board questions
      if (academicFilterType === "board") {
        const checkArr = [...COLLEGES, "কলেজ", "COLLEGE"];
        const isCg = !!q.college || checkArr.some(col => combinedRefStr.includes(col.toUpperCase()));
        if (isCg) return false;
        
        // Since it's Academic level and not a College question, it's considered a Board question
        if (selectedBoardTag && selectedBoardTag !== "AB") {
          const qBoard = q.board || "";
          const boardInfo = BOARD_NAME_MAP[selectedBoardTag];
          const tagsLower = (q.tags || []).map(t => String(t).toLowerCase());
          const tagsContains = tagsLower.some(t => 
            t.includes(selectedBoardTag.toLowerCase()) || 
            (boardInfo && (t.includes(boardInfo.en) || t.includes(boardInfo.bn)))
          );
          
          const refContains =
            examRefStr.toLowerCase().includes(selectedBoardTag.toLowerCase()) ||
            (boardInfo && (
              examRefStr.toLowerCase().includes(boardInfo.en) ||
              examRefStr.includes(boardInfo.bn)
            )) ||
            tagsContains;

          if (qBoard !== selectedBoardTag && !refContains) return false;
        }
        return true;
      }
      
      // If we seek College test questions
      if (academicFilterType === "college") {
        const checkArr = [...COLLEGES, "কলেজ", "COLLEGE"];
        const hasCollege = !!q.college || checkArr.some(col => combinedRefStr.includes(col.toUpperCase()));
        if (!hasCollege) return false;
        
        if (selectedCollegeTag) {
          const qCollege = q.college || "";
          const tagsLower = (q.tags || []).map(t => String(t).toLowerCase());
          const tagsContains = tagsLower.some(t => t.includes(selectedCollegeTag.toLowerCase()));
          const refContains = examRefStr.toUpperCase().includes(selectedCollegeTag.toUpperCase()) || tagsContains;
          if (qCollege !== selectedCollegeTag && !refContains) return false;
        }
        return true;
      }
      
      return true;
    });
  }, [questions, selectedLevel, academicFilterType, selectedBoardTag, selectedCollegeTag]);

  const getStatsFor = (subjectKey: string, chapter?: string) => {
    if (!syllabusStats) return 0;

    const subjectNorm = normalizeText(subjectKey);
    const matchedSubjectKey = Object.keys(syllabusStats).find(
      (k) => normalizeText(k) === subjectNorm,
    );
    if (!matchedSubjectKey || !syllabusStats[matchedSubjectKey]) return 0;

    const paperData = syllabusStats[matchedSubjectKey];
    if (!chapter) return paperData.total || 0;

    const chapterNorm = normalizeText(chapter);
    let totalCount = 0;

    Object.keys(paperData.chapters || {}).forEach((k) => {
      if (normalizeText(k) === chapterNorm) {
        const chapterData = paperData.chapters[k];
        totalCount += chapterData.total || 0;
      }
    });

    return totalCount;
  };

  const handleLevelSelect = (level: "ACADEMIC" | "ADMISSION" | "MAINBOOK") => {
    setSearchParams({ level }, { replace: true });
  };

  const handleSubjectSelect = (subject: string) => {
    const params: Record<string, string> = { level: selectedLevel || "", subject };
    if (selectedAdmissionCategory) params.admissionCategory = selectedAdmissionCategory;
    setSearchParams(params, { replace: true });
  };

  const handleChapterSelect = (chapter: string) => {
    if (selectedChapter === chapter) {
      const params: Record<string, string> = { level: selectedLevel || "", subject: selectedSubject || "" };
      if (selectedAdmissionCategory) params.admissionCategory = selectedAdmissionCategory;
      setSearchParams(params, { replace: true });
    } else {
      const params: Record<string, string> = {
        level: selectedLevel || "",
        subject: selectedSubject || "",
        chapter,
      };
      if (selectedAdmissionCategory) params.admissionCategory = selectedAdmissionCategory;
      setSearchParams(params, { replace: true });
    }
  };

  const _handleInstitutionSelect = (instId: string) => {
    const inst = ADMISSION_INSTITUTIONS.find((i) => i.id === instId);
    if (inst && inst.units && inst.units.length === 1) {
      setSearchParams({
        level: "ADMISSION",
        institution: instId,
        unit: inst.units[0].id,
      }, { replace: true });
    } else {
      setSearchParams({ level: "ADMISSION", institution: instId }, { replace: true });
    }
  };

  const handleUnitSelect = (unitId: string) => {
    setSearchParams({
      level: "ADMISSION",
      institution: selectedInstitution || "",
      unit: unitId,
    }, { replace: true });
  };

  const handleExamPaperSelect = (examRef: string) => {
    setSearchParams({
      level: "ADMISSION",
      institution: selectedInstitution || "",
      unit: selectedUnit || "",
      examRef,
    }, { replace: true });
  };

  const toggleExplanation = (id: string) => {
    setExpandedExplanations(prev => {
      const isNowExpanded = !prev[id];
      if (isNowExpanded) {
        setTimeout(() => {
          if (window.MathJax && window.MathJax.typesetPromise) {
            const el = document.getElementById(`explanation-${id}`);
            if (el) {
              window.MathJax.typesetPromise([el]).catch((err: any) => console.error(err));
            } else {
              window.MathJax.typesetPromise().catch((err: any) => console.error(err));
            }
          }
        }, 80);
      }
      return { ...prev, [id]: isNowExpanded };
    });
  };

  const getFont = (text: string = '') => {
    const isBangla = /[\u0980-\u09FF]/.test(text);
    return isBangla ? 'font-tiro' : 'font-sans';
  };

  const handleBack = () => {
    const keepCategory = (base: Record<string, string>) => {
      if (selectedAdmissionCategory) base.admissionCategory = selectedAdmissionCategory;
      return base;
    };

    if (selectedExamRef) {
      setSearchParams(keepCategory({
        level: "ADMISSION",
        institution: selectedInstitution || "",
        unit: selectedUnit || "",
      }), { replace: true });
    } else if (selectedUnit) {
      const inst = ADMISSION_INSTITUTIONS.find(
        (i) => i.id === selectedInstitution,
      );
      if (inst && inst.units.length === 1) {
        setSearchParams(keepCategory({ level: "ADMISSION" }), { replace: true });
      } else {
        setSearchParams(keepCategory({
          level: "ADMISSION",
          institution: selectedInstitution || "",
        }), { replace: true });
      }
    } else if (selectedInstitution) {
      setSearchParams(keepCategory({ level: "ADMISSION" }), { replace: true });
    } else if (selectedChapter) {
      setSearchParams(keepCategory({
        level: selectedLevel || "",
        subject: selectedSubject || "",
      }), { replace: true });
    } else if (selectedSubject) {
      setSearchParams(keepCategory({ level: selectedLevel || "" }), { replace: true });
    } else if (selectedLevel) {
      setSearchParams({}, { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleStartExam = () => {
    if (filteredQuestions.length === 0) {
      showToast("কোনো প্রশ্ন পাওয়া যায়নি", "warning");
      return;
    }
    setShowExamTypeSelect(!showExamTypeSelect);
  };

  const handleStartLiveQuiz = () => {
    setShowExamTypeSelect(false);
    setShowExamConfig(false);
    setIsLiveQuizMode(true);
    setUserAnswers({});
    setLiveQuizStats({ correct: 0, wrong: 0, totalAnswered: 0 });
    document.getElementById("qbank-scroll-container")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirmExamStart = async () => {
    setShowExamConfig(false);

    let examQuestions = [...filteredQuestions];
    const { numQuestions, timeLimit, negativeMark } = examConfigState;

    if (examQuestions.length < numQuestions && hasMore) {
      showToast("অপেক্ষা করুন, প্রশ্ন লোড হচ্ছে...", "info");
      try {
        let res;
        if (selectedExamRef) {
          const data = await fetchQuestionsByExamRefAPI(selectedExamRef);
          res = {
            questions: Array.isArray(data) ? data : data.questions || [],
            total: Array.isArray(data) ? data.length : data.total || 0,
          };
          if (res?.questions?.length > 0) {
            examQuestions = res.questions;
          }
        } else {
          // Fetch randomly from the entire matching pool
          res = await fetchQuestionsFromBankAPI(
            1,
            numQuestions * 2, // Fetch enough to shuffle and pick
            selectedSubject ?? undefined,
            selectedChapter ?? undefined,
            undefined, // topic
            undefined, // examRef
            debouncedSearch,
            selectedLevel ?? undefined,
            academicFilterType === "board" ? (selectedBoardTag || "ANY") : undefined,
            academicFilterType === "college" ? (selectedCollegeTag || "ANY") : undefined,
            true // randomise = true
          );
          
          if (res?.questions && res.questions.length > 0) {
             examQuestions = res.questions;
          }
        }
      } catch (err) {
        console.error(err);
      }
    }

    const examId = `qbank_exam_${Date.now()}`;

    // Stimulus-aware selection
    const grouped: Record<string, QuizQuestion[]> = {};
    const singles: QuizQuestion[] = [];
    const shuffledRaw = [...examQuestions].sort(() => 0.5 - Math.random());

    shuffledRaw.forEach((q) => {
      const key = q.contextText || q.contextImage || null;
      if (key) {
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(q);
      } else {
        singles.push(q);
      }
    });

    const selectedQs: QuizQuestion[] = [];
    const groups = Object.values(grouped).sort(() => 0.5 - Math.random());
    const singlesShuffled = singles.sort(() => 0.5 - Math.random());

    groups.forEach((group) => {
      if (selectedQs.length + group.length <= numQuestions) {
        selectedQs.push(...group);
      }
    });

    singlesShuffled.forEach((q) => {
      if (selectedQs.length < numQuestions) {
        selectedQs.push(q);
      }
    });

    // Fallback
    if (selectedQs.length < numQuestions) {
      groups.forEach((group) => {
        if (selectedQs.length < numQuestions) {
          const needed = numQuestions - selectedQs.length;
          const alreadyIn = group.every((gq) =>
            selectedQs.some((sq) => sq.question === gq.question),
          );
          if (!alreadyIn) {
            selectedQs.push(...group.slice(0, needed));
          }
        }
      });
    }

    const config = {
      title: `${selectedSubject} - ${selectedChapter || "All Chapters"}`,
      questions: selectedQs,
      timeLimit: timeLimit,
      negativeMarking: negativeMark,
      mode: "ALL_AT_ONCE",
      type: "QBANK_EXAM",
      isPracticeMode: false,
    };
    localStorage.setItem(`exam_config_${examId}`, JSON.stringify(config));
    navigate(`/exam/${examId}`);
  };

  const toggleSaveQuestion = useCallback(
    async (question: QuizQuestion) => {
      if (!currentUser) {
        showToast("লগইন প্রয়োজন", "warning");
        return;
      }
      const qId = question._id || question.id;
      if (!qId) return;

      let wasSaved = false;

      setSavedQuestionIds((prev) => {
        const newSet = new Set(prev);
        wasSaved = newSet.has(qId);
        if (wasSaved) {
          newSet.delete(qId);
        } else {
          newSet.add(qId);
        }
        return newSet;
      });

      // Side effects moved OUTSIDE the setState updater function to prevent double invocation in React StrictMode
      // and "Cannot update a component while rendering a different component" warnings.
      setTimeout(() => {
        if (wasSaved) {
          unsaveQuestionAPI(currentUser.uid, qId).catch(console.error);
          showToast("বুকমার্ক রিমুভ করা হয়েছে", "info");
        } else {
          saveQuestionAPI(currentUser.uid, qId).catch(console.error);
          showToast("প্রশ্নটি বুকমার্ক করা হয়েছে", "success");
        }
      }, 0);
    },
    [currentUser, showToast],
  );

  const handleShare = useCallback(
    (question: QuizQuestion) => {
      const url = `${window.location.origin}/#/question/${question.slug || question.id}`;
      if (navigator.share) {
        navigator.share({ title: question.question, url }).catch(console.error);
      } else {
        navigator.clipboard
          .writeText(url)
          .then(() => showToast("লিংক কপি করা হয়েছে!", "success"));
      }
    },
    [showToast],
  );

  const chapters = useMemo(() => {
    if (!selectedSubject || !SYLLABUS_DB[selectedSubject]) return [];
    return Object.keys(SYLLABUS_DB[selectedSubject]);
  }, [selectedSubject]);

  // --- RENDERING VIEWS ---



  return (
    <div className="h-full flex flex-col bg-slate-50/50 dark:bg-gray-950 transition-colors">
      {/* Premium Header Bar (Hidden in detailed view) */}
      {(!selectedSubject && !selectedExamRef) && (
        <div className="bg-white/95 dark:bg-black/90 backdrop-blur-xl border-b border-gray-150 dark:border-zinc-800 p-4 sticky top-0 z-10 shadow-sm shrink-0">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-150 dark:border-zinc-800 transition-all duration-300"
                id="btn-header-back"
              >
                <ChevronLeft size={18} />
              </button>
              <div>
                <span className="text-[12px] font-black tracking-widest text-primary uppercase pb-0.5 block font-sans">
                  {selectedLevel === "ADMISSION"
                    ? "ভর্তি পরীক্ষা (ADMISSION)"
                    : selectedLevel === "ACADEMIC"
                      ? "এইচএসসি পরীক্ষা (ACADEMIC)"
                      : selectedLevel === "MAINBOOK"
                        ? "অনুশীলনীর প্রশ্ন (MAINBOOK)"
                        : "STUDY HUB"}
                </span>
                <h1 className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-white leading-tight">
                  স্মার্ট প্রশ্নব্যাংক
                </h1>
              </div>
            </div>
          </div>
        </div>
      )}

      <div id="qbank-scroll-container" className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <div className="max-w-4xl mx-auto p-4 md:p-6 pb-24">
          {!selectedLevel ? (
            /* LEVEL 1: ACADEMIC vs ADMISSION vs MAINBOOK */
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 py-4 md:py-6 max-w-4xl mx-auto">
              {[
                { id: "ACADEMIC", title: "একাডেমিক", subtitle: "বোর্ড ও কলেজ সংক্রান্ত", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10", borderHover: "hover:border-blue-500" },
                { id: "ADMISSION", title: "ভর্তি পরীক্ষা", subtitle: "ভার্সিটি, মেডিকেল", icon: Stethoscope, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10", borderHover: "hover:border-orange-500" },
                { id: "MAINBOOK", title: "অনুশীলনী", subtitle: "মেইন বইয়ের প্রশ্ন", icon: BookMarked, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10", borderHover: "hover:border-emerald-500" }
              ].map(item => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleLevelSelect(item.id as any)}
                  className="aspect-square bg-white dark:bg-[#121212] p-4 rounded-[24px] md:rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm cursor-pointer hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 md:gap-4 group"
                  id={`btn-select-${item.id.toLowerCase()}`}
                >
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-[20px] flex items-center justify-center ${item.bg} text-gray-800 dark:text-white group-hover:scale-110 transition-transform shadow-sm`}>
                    <item.icon size={28} strokeWidth={2.5} className={item.color} />
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <span className="font-bold text-[15px] md:text-[17px] text-gray-800 dark:text-gray-100 group-hover:text-primary transition-colors">
                      {item.title}
                    </span>
                    <span className="text-[11px] md:text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                      {item.subtitle}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : !selectedSubject && !selectedInstitution && !selectedExamRef ? (
            /* LEVEL 2: COMPACT OR CHOOSE SUBJECT/INSTITUTION */
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* selectedLevel === "ADMISSION" && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-1 h-5 bg-blue-500 rounded-full" />
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest font-sans">
                      প্রতিষ্ঠান অনুযায়ী প্রশ্নপত্র
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                    {ADMISSION_INSTITUTIONS.map((inst, idx) => (
                      <motion.button
                        whileHover={{ y: -4, scale: 1.01 }}
                        key={idx}
                        onClick={() => handleInstitutionSelect(inst.id)}
                        className="bg-white dark:bg-black p-5 rounded-2xl border border-gray-150 dark:border-zinc-800 text-left hover:border-blue-500 transition-all duration-300 group flex items-start gap-4 shadow-sm"
                        id={`btn-inst-${inst.id}`}
                      >
                        <div
                          className={`w-11 h-11 rounded-xl ${inst.color} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300`}
                        >
                          <inst.icon size={20} />
                        </div>
                        <div className="flex-1 min-w-0 pr-1">
                          <h3 className="text-sm md:text-base font-extrabold text-gray-950 dark:text-white mb-0.5 truncate font-tiro">
                            {inst.name}
                          </h3>
                          <p className="text-[11px] text-gray-500">
                            বিগত বছরের সব ইউনিট
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </section>
              ) */}

              <section>
                <div className="flex items-center gap-2 mb-4 px-2">
                  <span className="w-1 h-5 bg-orange-500 rounded-full" />
                  <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest font-sans">
                    বিষয় নির্বাচন করুন
                  </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {Object.entries(SUBJECT_DEFINITIONS).map(
                    ([key, subject], idx) => {
                      const count = getStatsFor(key);
                      return (
                        <motion.div
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          key={idx}
                          onClick={() => handleSubjectSelect(key)}
                          className="aspect-square bg-white dark:bg-[#121212] p-4 rounded-[24px] md:rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm cursor-pointer hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 md:gap-4 group"
                          id={`btn-sub-${idx}`}
                        >
                          <div className={`w-14 h-14 md:w-16 md:h-16 rounded-[20px] flex items-center justify-center ${subject.bg} ${subject.color} group-hover:scale-110 transition-transform shadow-sm`}>
                            <subject.icon size={28} strokeWidth={2.5} />
                          </div>
                          <div className="flex flex-col items-center text-center">
                            <span className="font-bold text-[15px] md:text-[17px] text-gray-800 dark:text-gray-100 group-hover:text-primary transition-colors font-tiro p-0.5">
                              {subject.display}
                            </span>
                            <span className="text-[11px] md:text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                              {count > 0 ? `${toBengaliNumber(count.toLocaleString())} প্রশ্ন` : "প্রস্তুত হচ্ছে"}
                            </span>
                          </div>
                        </motion.div>
                      );
                    },
                  )}
                </div>
              </section>
            </div>
          ) : selectedInstitution && !selectedUnit && !selectedExamRef ? (
            /* LEVEL 2.1: CHOOSE UNIT */
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1 h-5 bg-blue-500 rounded-full" />
                <h2 className="text-sm font-black text-gray-400 tracking-widest font-sans uppercase">
                  ইউনিট নির্বাচন করুন
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ADMISSION_INSTITUTIONS.find(
                  (i) => i.id === selectedInstitution,
                )?.units.map((unit, idx) => (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    key={idx}
                    onClick={() => handleUnitSelect(unit.id)}
                    className="bg-white dark:bg-black p-5 rounded-2xl border border-gray-150 dark:border-zinc-800 hover:border-blue-500 hover:shadow-md transition-all flex items-center justify-between group text-left shadow-sm"
                    id={`btn-unit-${unit.id}`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-900/30 text-blue-500 rounded-xl flex items-center justify-center font-extrabold text-sm">
                        {unit.id}
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-gray-950 dark:text-white font-tiro">
                          {unit.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          ভর্তি পরীক্ষার বিগত প্রশ্নপত্রসমূহ
                        </p>
                      </div>
                    </div>
                    <Play
                      size={16}
                      className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"
                    />
                  </motion.button>
                ))}
              </div>
            </div>
          ) : selectedInstitution && selectedUnit && !selectedExamRef ? (
            /* LEVEL 2.2: EXAM PAPER LISTING (PREMIUM CARDS) */
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1 h-5 bg-blue-500 rounded-full" />
                <h2 className="text-sm font-black text-gray-400 tracking-widest font-sans uppercase">
                  বিগত বছরের প্রশ্নপত্রসমূহ
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ADMISSION_INSTITUTIONS.find(
                  (i) => i.id === selectedInstitution,
                )
                  ?.units.find((u) => u.id === selectedUnit)
                  ?.exams.map((exam, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ y: -3, scale: 1.01 }}
                      onClick={() => handleExamPaperSelect(exam.examRef)}
                      className="bg-white dark:bg-black p-5 rounded-2xl border border-gray-150 dark:border-zinc-800 hover:border-blue-500 text-left hover:shadow-md transition-all duration-300 flex flex-col justify-between shadow-sm relative overflow-hidden group"
                      id={`btn-exampaper-${idx}`}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors" />
                      <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-lg">
                          <Archive size={18} />
                        </div>
                        <span className="text-[9px] font-black tracking-widest bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/20 px-2.5 py-1 rounded-full uppercase">
                          পূর্ণাঙ্গ প্রশ্নপত্র
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-gray-900 dark:text-white mb-1 leading-snug font-tiro">
                        {exam.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-sans tracking-wide">
                        সার্বিক সমাধান এবং ব্যাখ্যা সহ বিস্তারিত পরীক্ষা দিন
                      </p>
                    </motion.button>
                  ))}
              </div>
            </div>
          ) : (
            /* LEVEL 3: DETAILED QUESTIONS BROWSER (THE HIGH-END PORTAL SHELL) */
            <div className="space-y-5 flex flex-col pt-2">
              {/* HEADER INFO */}
              <div className="relative flex items-center justify-center min-h-[60px] mb-2 mt-2">
                <button
                  onClick={handleBack}
                  className="absolute left-0 p-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors shadow-sm"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex flex-col items-center text-center gap-1 px-12">
                  <h2 className="text-[26px] md:text-[30px] font-extrabold text-gray-900 dark:text-gray-100 leading-tight break-words">
                    {selectedSubject
                      ? SUBJECT_DEFINITIONS[selectedSubject]?.display ||
                        selectedSubject
                      : selectedExamRef}
                  </h2>
                  <span className="text-[14px] font-bold text-gray-500 dark:text-gray-400">
                    {selectedLevel === "ADMISSION"
                      ? "ভর্তি পরীক্ষা (ADMISSION)"
                      : selectedLevel === "ACADEMIC"
                        ? "এইচএসসি পরীক্ষা (ACADEMIC)"
                        : selectedLevel === "MAINBOOK"
                          ? "অনুশীলনীর প্রশ্ন (MAINBOOK)"
                          : "STUDY HUB"}
                  </span>
                </div>
              </div>

              {/* SLIDER 1: CHAPTERS BADGES ROW */}
              {selectedSubject && (
                <div className="pt-2 border-t border-gray-100 dark:border-[#222]">
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {chapters.map((chapter, idx) => {
                      const count = getStatsFor(selectedSubject, chapter);
                      const isSelected =
                        selectedChapter &&
                        normalizeBangla(selectedChapter) ===
                          normalizeBangla(chapter);
                      return (
                        <button
                          key={idx}
                          onClick={() => handleChapterSelect(chapter)}
                          className={`px-4 py-2 rounded-2xl text-[13px] font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${isSelected ? "bg-orange-500/10 text-primary border-orange-500/20 shadow-sm" : "bg-white dark:bg-[#121212] border-gray-200 dark:border-[#222] text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-[#333]"}`}
                        >
                          {chapter}
                          <span
                            className={`px-1.5 py-0.5 rounded-lg text-[11px] ${selectedChapter === chapter ? "bg-orange-500/20 text-primary" : "bg-gray-100 dark:bg-[#222] text-gray-500"}`}
                          >
                            {toBengaliNumber(count)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* LEVEL-SPECIFIC ACADEMIC CATEGORY FILTERS */}
              {selectedLevel === "ACADEMIC" && (
                <div className="pt-2 border-t border-gray-100 dark:border-[#222]">
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    <button
                      onClick={() => {
                        if (academicFilterType === "board") {
                          setAcademicFilterType("all");
                        } else {
                          setAcademicFilterType("board");
                        }
                        setSelectedBoardTag("");
                        setSelectedCollegeTag("");
                      }}
                      className={`px-4 py-2 rounded-2xl text-[13px] font-bold transition-all whitespace-nowrap border ${
                        academicFilterType === "board"
                          ? "bg-purple-600 border-purple-600 text-white shadow-sm"
                          : "bg-white dark:bg-[#121212] border-gray-200 dark:border-[#222] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]"
                      }`}
                    >
                      বোর্ড প্রশ্ন
                    </button>
                    <button
                      onClick={() => {
                        if (academicFilterType === "college") {
                          setAcademicFilterType("all");
                        } else {
                          setAcademicFilterType("college");
                        }
                        setSelectedBoardTag("");
                        setSelectedCollegeTag("");
                      }}
                      className={`px-4 py-2 rounded-2xl text-[13px] font-bold transition-all whitespace-nowrap border ${
                        academicFilterType === "college"
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                          : "bg-white dark:bg-[#121212] border-gray-200 dark:border-[#222] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]"
                      }`}
                    >
                      কলেজ টেস্ট
                    </button>
                  </div>

                  {/* CONDITIONAL BOARDS SELECTION */}
                  {academicFilterType === "board" && (
                    <div className="flex gap-2 overflow-x-auto no-scrollbar mt-2 pb-1">
                      {BOARDS.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => {
                            if (selectedBoardTag === b.id) {
                              setSelectedBoardTag("");
                            } else {
                              setSelectedBoardTag(b.id);
                            }
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all border shrink-0 ${
                            selectedBoardTag === b.id
                              ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                              : "bg-white dark:bg-[#121212] border-gray-200 dark:border-[#222] text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {b.name} ({b.id})
                        </button>
                      ))}
                    </div>
                  )}

                  {/* CONDITIONAL COLLEGES SELECTION */}
                  {academicFilterType === "college" && (
                    <div className="flex gap-2 overflow-x-auto no-scrollbar mt-2 pb-1">
                      {COLLEGES.map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            if (selectedCollegeTag === c) {
                              setSelectedCollegeTag("");
                            } else {
                              setSelectedCollegeTag(c);
                            }
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all border shrink-0 ${
                            selectedCollegeTag === c
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                              : "bg-white dark:bg-[#121212] border-gray-200 dark:border-[#222] text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* LEVEL-SPECIFIC ADMISSION CATEGORY FILTERS */}
              {selectedLevel === "ADMISSION" && (
                <div className="pt-2 border-t border-gray-100 dark:border-[#222]">
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                       <button
                         onClick={() => setSearchParams(p => { p.delete('admissionCategory'); return p; }, {replace: true})}
                         className={`px-4 py-2 rounded-2xl text-[13px] font-bold transition-all whitespace-nowrap border ${
                           !selectedAdmissionCategory 
                             ? "bg-orange-500 border-orange-500 text-white shadow-sm" 
                             : "bg-white dark:bg-[#121212] border-gray-200 dark:border-[#222] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]"
                         }`}
                       >
                         সব ক্যাটাগরি
                       </button>
                       {MAIN_CATEGORIES.map(cat => (
                           <button
                             key={cat.id}
                             onClick={() => setSearchParams(p => { p.set('admissionCategory', cat.id); return p; }, {replace: true})}
                             className={`px-4 py-2 rounded-2xl text-[13px] font-bold transition-all whitespace-nowrap border ${
                               selectedAdmissionCategory === cat.id 
                                 ? "bg-orange-500 border-orange-500 text-white shadow-sm" 
                                 : "bg-white dark:bg-[#121212] border-gray-200 dark:border-[#222] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]"
                             }`}
                           >
                               {cat.name}
                           </button>
                       ))}
                  </div>
                </div>
              )}



              {/* MAIN QUESTIONS CONTAINER */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[15px] font-bold text-gray-900 dark:text-white flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="truncate">{selectedChapter ? `${selectedChapter}` : "সব প্রশ্নাবলী"}</span>
                  </h2>
                </div>

                {loading && questions.length === 0 || isFilterDirty ? (
                  <div className="space-y-4 animate-pulse">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-white dark:bg-black rounded-3xl p-5 border border-gray-200 dark:border-white/[0.05]"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-gray-200 dark:bg-white/[0.05] rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-32 bg-gray-200 dark:bg-white/[0.05] rounded"></div>
                            <div className="h-3 w-24 bg-gray-200 dark:bg-white/[0.05] rounded"></div>
                          </div>
                        </div>
                        <div className="space-y-3 pl-1 md:pl-15">
                          <div className="h-5 w-5/6 bg-gray-200 dark:bg-white/[0.05] rounded-lg"></div>
                          <div className="h-4 w-2/3 bg-gray-200 dark:bg-white/[0.05] rounded-lg"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-5 pl-1 md:pl-15">
                          <div className="h-11 bg-gray-200 dark:bg-white/[0.05] rounded-2xl"></div>
                          <div className="h-11 bg-gray-200 dark:bg-white/[0.05] rounded-2xl"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredQuestions.length > 0 ? (
                  <AnimatePresence mode="popLayout">
                    <div className="space-y-4">
                      {filteredQuestions.map((q, idx) => {
                        const itemIndexInTotal = (page - 1) * 25 + idx + 1;
                        const isSaved = savedQuestionIds.has(q._id || q.id || "");
                        const isExpanded = expandedExplanations[q._id || q.id || `${idx}`] || false;
                        const itemId = q._id || q.id || `${idx}`;

                        return (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={itemId}
                            className="bg-white px-4 pt-5 pb-4 md:px-5 rounded-2xl border transition-all relative overflow-hidden dark:bg-zinc-950 dark:border-zinc-800/80 border-slate-200/60 dark:border-zinc-800 shadow-sm"
                          >
                            <div className="absolute top-4 right-4 flex gap-1 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-xl">
                              <button
                                onClick={() => toggleSaveQuestion(q)}
                                className={`p-2 rounded-xl transition-all ${
                                  isSaved
                                    ? "bg-orange-500/10 text-primary"
                                    : "bg-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 pointer-events-auto"
                                }`}
                              >
                                <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} />
                              </button>
                            </div>
                            
                            {(q.contextText || q.contextImage) && (
                              <div className="mb-4 p-4 bg-sky-50/50 dark:bg-sky-900/10 rounded-2xl border border-sky-100/50 dark:border-sky-800/30 mr-12">
                                <span className="text-[9px] font-black text-sky-600/50 dark:text-sky-400/50 uppercase tracking-widest mb-1 block">উদ্দীপক</span>
                                {q.contextText && <div className="text-base md:text-[17px] font-semibold text-gray-800 dark:text-gray-200 leading-relaxed mb-2 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: q.contextText }} />}
                                {q.contextImage && (
                                  <img src={q.contextImage} alt="Context" className="mt-2 rounded-xl max-h-48 object-contain mx-auto border bg-white dark:bg-black/20 p-1" referrerPolicy="no-referrer" />
                                )}
                              </div>
                            )}
                            
                            <div className="flex items-start gap-1.5 mb-3 pr-10">
                                <span className="text-slate-950 dark:text-zinc-100 font-extrabold text-sm md:text-base shrink-0 select-none pt-0.5 min-w-[1.25rem]">
                                    {toBengaliNumber(itemIndexInTotal)}.
                                </span>
                                <div className="flex-1">
                                    <div className={`text-base md:text-[18px] font-medium text-slate-900 dark:text-white leading-relaxed whitespace-pre-wrap ${getFont(q.question)}`}>
                                      <div dangerouslySetInnerHTML={{ __html: q.question }} />
                                      {q.questionImage && (
                                        <img src={q.questionImage} alt="Question" className="mt-2 rounded-lg max-h-48 object-contain mr-auto border bg-transparent shadow-sm" referrerPolicy="no-referrer" />
                                      )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5 mb-2 pl-0 md:pl-6">
                              {q.options.map((opt: string, i: number) => {
                                const isCorrect = i === q.correctAnswerIndex;
                                const clickedList = userAnswers[itemId] || [];
                                const isClicked = clickedList.includes(i);
                                const isQuestionResolved = clickedList.includes(q.correctAnswerIndex);
                                
                                let optionStyle = 'bg-slate-50 border-slate-100 text-slate-700 dark:bg-zinc-900/40 dark:border-zinc-800/80 dark:text-zinc-300';
                                let iconStyle = 'bg-white border-slate-200 text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-500';

                                if (showAllAnswers) {
                                  if (isCorrect) {
                                    optionStyle = 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-500/50 dark:text-emerald-400';
                                    iconStyle = 'bg-emerald-500 border-emerald-400 text-white';
                                  } else if (isClicked) {
                                    optionStyle = 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-500/50 dark:text-red-400';
                                    iconStyle = 'bg-red-500 border-red-400 text-white';
                                  }
                                } else {
                                  if (isClicked) {
                                    if (isCorrect) {
                                      optionStyle = 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-500/50 dark:text-emerald-400';
                                      iconStyle = 'bg-emerald-500 border-emerald-400 text-white';
                                    } else {
                                      optionStyle = 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-500/50 dark:text-red-400';
                                      iconStyle = 'bg-red-500 border-red-400 text-white';
                                    }
                                  }
                                }

                                return (
                                  <div 
                                    key={i}
                                    onClick={(e) => {
                                      if (!isQuestionResolved) {
                                        if (isLiveQuizMode && clickedList.length > 0) return;

                                        e.stopPropagation();
                                        
                                        if (isLiveQuizMode) {
                                          setLiveQuizStats(prev => ({
                                            correct: prev.correct + (isCorrect ? 1 : 0),
                                            wrong: prev.wrong + (isCorrect ? 0 : 1),
                                            totalAnswered: prev.totalAnswered + 1
                                          }));
                                          setUserAnswers(prev => ({
                                            ...prev,
                                            [itemId]: isCorrect ? [i] : [i, q.correctAnswerIndex]
                                          }));
                                        } else {
                                          setUserAnswers(prev => {
                                            const current = prev[itemId] || [];
                                            if (current.includes(i)) return prev;
                                            return { ...prev, [itemId]: [...current, i] };
                                          });
                                        }
                                      }
                                    }}
                                    className={`p-2 rounded-xl border transition-all flex items-center gap-3 ${optionStyle} ${
                                      !isQuestionResolved ? 'cursor-pointer hover:border-slate-350 dark:hover:border-zinc-700' : ''
                                    }`}
                                  >
                                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 transition-colors ${iconStyle}`}>
                                      {['ক', 'খ', 'গ', 'ঘ'][i] || String.fromCharCode(65 + i)}
                                    </span>
                                    <div className="flex flex-col gap-1 flex-1">
                                      <div className={`text-[15px] md:text-base font-normal whitespace-pre-wrap ${getFont(opt)}`} dangerouslySetInnerHTML={{ __html: opt }} />
                                      {q.optionsImages?.[i] && (
                                        <img src={q.optionsImages[i]} alt={`Option ${i}`} className="h-16 w-fit object-contain rounded self-start bg-transparent mix-blend-multiply dark:mix-blend-normal" referrerPolicy="no-referrer" />
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {q.explanation && (
                              <div className="border-t border-slate-100 dark:border-zinc-800 pt-2 mt-3 block">
                                <button 
                                  onClick={() => toggleExplanation(itemId)}
                                  className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all ml-0 md:ml-10"
                                >
                                  <span>ব্যাখ্যা</span>
                                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>
                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div 
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div id={`explanation-${itemId}`} className="mt-2 ml-0 md:ml-10 p-3 bg-orange-50/50 dark:bg-orange-900/10 rounded-xl border border-orange-100/50 dark:border-orange-900/30 flex flex-col gap-2 shadow-sm overflow-hidden">
                                        <div className="text-[15px] md:text-base text-slate-800 dark:text-gray-200 leading-relaxed font-tiro whitespace-pre-wrap overflow-x-auto max-w-full break-words py-1 scrollbar-thin" dangerouslySetInnerHTML={{ __html: q.explanation }} />
                                        {q.explanationImage && (
                                          <img src={q.explanationImage} alt="Explanation" className="mt-2 rounded-lg max-h-40 object-contain border bg-transparent mr-auto" referrerPolicy="no-referrer" />
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}

                            <div className="mt-3 pt-3 border-t border-slate-55 dark:border-zinc-800 flex items-center justify-between">
                              <div className="flex flex-wrap gap-2">
                                {q.tags && q.tags.length > 0 && q.tags.map((tag) => (
                                  <span key={tag} className="px-2 py-1 bg-orange-500/10 text-primary dark:bg-orange-500/15 rounded-lg text-[9px] font-bold tracking-tight border border-orange-500/10 font-sans">
                                    {tag}
                                  </span>
                                ))}
                                {!selectedChapter && q.chapter && (
                                  <span className={`text-[9px] font-black px-2 py-1 rounded-lg ${q.subject && SUBJECT_DEFINITIONS[q.subject] ? `${SUBJECT_DEFINITIONS[q.subject].bg} ${SUBJECT_DEFINITIONS[q.subject].color}` : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400'}`}>
                                    {q.chapter}
                                  </span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </AnimatePresence>
                ) : (
                  <EmptyState
                    icon={<Archive size={28} className="text-gray-400" />}
                    message="কোনো প্রশ্ন মেলাতে পারা যায়নি। দয়া করে অন্য ক্যাটাগরি ট্রাই করুন বা আপনার সার্চ কুয়েরি পুনরায় চেক করুন।"
                    actionText={searchQuery ? "সার্চ রিসেট করুন" : undefined}
                    onActionClick={searchQuery ? () => setSearchQuery("") : undefined}
                  />
                )}
              </div>

              {/* PAGINATION CONTROLS */}
              {questions.length > 0 && (page > 1 || hasMore) && (
                <div className="pt-8 pb-24 flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setPage((p) => Math.max(1, p - 1));
                      document.getElementById("qbank-scroll-container")?.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    disabled={page === 1}
                    className="p-3 border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#121212] disabled:opacity-30 disabled:pointer-events-none text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all shadow-sm active:scale-95"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="px-5 py-2.5 bg-white dark:bg-[#121212] border border-gray-200 dark:border-zinc-800 rounded-xl font-black text-gray-800 dark:text-gray-200 text-sm shadow-sm min-w-[3rem] text-center">
                    {page}
                  </div>
                  <button
                    onClick={() => {
                      setPage((p) => p + 1);
                      document.getElementById("qbank-scroll-container")?.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    disabled={!hasMore}
                    className="p-3 border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#121212] disabled:opacity-30 disabled:pointer-events-none text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all shadow-sm active:scale-95"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}

              {/* FLOATING ACTION EXAM BUTTON */}
              {!isLiveQuizMode && !isRevisionMode && (
                <>
                  <AnimatePresence>
                    {showExamTypeSelect && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowExamTypeSelect(false)}
                        className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm z-[55] block"
                      />
                    )}
                  </AnimatePresence>
                  
                  <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3 pointer-events-none">
                    <AnimatePresence>
                      {showExamTypeSelect && (
                        <>
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => {
                              setShowExamTypeSelect(false);
                              setShowExamConfig(true);
                            }}
                            className="flex items-center gap-3 active:scale-95 transition-transform pointer-events-auto group"
                          >
                            <span className="bg-white dark:bg-zinc-800 px-4 py-2 rounded-2xl text-[14px] font-bold text-gray-700 dark:text-gray-200 shadow-md border border-gray-100 dark:border-zinc-700">মডেল টেস্ট</span>
                            <div className="w-14 h-14 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-lg border border-gray-100 dark:border-zinc-700 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                              <Play size={20} fill="currentColor" />
                            </div>
                          </motion.button>

                          <motion.button
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            transition={{ duration: 0.2, delay: 0.05 }}
                            onClick={handleStartLiveQuiz}
                            className="flex items-center gap-3 active:scale-95 transition-transform pointer-events-auto group"
                          >
                            <span className="bg-white dark:bg-zinc-800 px-4 py-2 rounded-2xl text-[14px] font-bold text-gray-700 dark:text-gray-200 shadow-md border border-gray-100 dark:border-zinc-700">লাইভ কুইজ</span>
                            <div className="w-14 h-14 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-lg border border-gray-100 dark:border-zinc-700 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                              <CheckCircle size={24} className="group-hover:fill-current" />
                            </div>
                          </motion.button>
                        </>
                      )}
                    </AnimatePresence>

                    <button
                      onClick={handleStartExam}
                      className="bg-primary text-white font-bold rounded-full flex items-center justify-center shadow-xl hover:bg-orange-600 hover:shadow-orange-500/20 active:scale-95 transition-all w-16 h-16 relative pointer-events-auto"
                    >
                      <motion.div animate={{ rotate: showExamTypeSelect ? 45 : 0 }} className="flex items-center justify-center absolute inset-0">
                        {showExamTypeSelect ? <Plus size={32} /> : (
                            <div
                              className="w-7 h-7 bg-white"
                              style={{
                                maskImage: "url(/icons/exam.svg)",
                                WebkitMaskImage: "url(/icons/exam.svg)",
                                maskSize: "contain",
                                WebkitMaskSize: "contain",
                                maskRepeat: "no-repeat",
                                WebkitMaskRepeat: "no-repeat",
                                maskPosition: "center",
                                WebkitMaskPosition: "center",
                              }}
                            />
                        )}
                      </motion.div>
                    </button>
                  </div>
                </>
              )}

              {/* LIVE QUIZ BOTTOM BAR */}
              <AnimatePresence>
                {isLiveQuizMode && (
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#121212] border-t border-gray-100 dark:border-zinc-800 p-4 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-none"
                  >
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                      <div className="flex gap-6 items-center">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] md:text-[11px] font-black text-gray-400 mt-0.5">সঠিক</span>
                          <span className="text-emerald-500 font-black text-lg md:text-xl leading-none">{toBengaliNumber(liveQuizStats.correct)}</span>
                        </div>
                        <div className="w-px h-8 bg-gray-200 dark:bg-zinc-800" />
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] md:text-[11px] font-black text-gray-400 mt-0.5">ভুল</span>
                          <span className="text-rose-500 font-black text-lg md:text-xl leading-none">{toBengaliNumber(liveQuizStats.wrong)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setIsLiveQuizMode(false);
                          setUserAnswers({});
                          setLiveQuizStats({ correct: 0, wrong: 0, totalAnswered: 0 });
                        }}
                        className="px-5 py-2.5 bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 font-bold rounded-xl active:scale-95 transition-all text-sm flex items-center gap-2"
                      >
                        <X size={16} strokeWidth={3} /> কুইজ শেষ করুন
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* EXAM CONFIG SHEET CONTENT */}
      <AnimatePresence>
        {showExamConfig && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center pointer-events-none md:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExamConfig(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
            />
            
            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full md:max-w-xl bg-white dark:bg-[#121212] rounded-t-[32px] md:rounded-3xl p-6 md:p-8 relative pointer-events-auto border-t md:border border-gray-100 dark:border-zinc-800 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-none"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold dark:text-white">মডেল টেস্ট কনফিগারেশন</h3>
                  <p className="text-[13px] md:text-[14px] text-gray-500 mt-1">আপনার পছন্দমতো সেটিং বেছে নিন</p>
                </div>
                <button
                  onClick={() => setShowExamConfig(false)}
                  className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Number of Questions */}
                <div>
                  <label className="text-[13px] md:text-[14px] font-bold text-gray-600 dark:text-gray-400 mb-3 block">
                    প্রশ্ন সংখ্যা
                  </label>
                  <div className="flex gap-2">
                    <div className="flex bg-gray-100 dark:bg-zinc-900/80 p-1 rounded-xl flex-1">
                      {[10, 15, 25, 50].map(n => (
                        <button
                          key={n}
                          onClick={() => setExamConfigState(s => ({ ...s, numQuestions: n }))}
                          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${examConfigState.numQuestions === n ? 'bg-white dark:bg-black text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <input 
                      type="number"
                      max={100}
                      min={1}
                      value={examConfigState.numQuestions}
                      onChange={(e) => {
                         let val = parseInt(e.target.value) || 0;
                         if(val > 100) val = 100;
                         setExamConfigState(s => ({...s, numQuestions: val}))
                      }}
                      className="w-16 md:w-24 bg-gray-100 dark:bg-zinc-900/80 border-none rounded-xl text-center text-[15px] font-bold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                  </div>
                </div>

                {/* Time Limit */}
                <div>
                  <label className="text-[13px] md:text-[14px] font-bold text-gray-600 dark:text-gray-400 mb-3 block">
                    সময় (মিনিট)
                  </label>
                  <div className="flex gap-2">
                    <div className="flex bg-gray-100 dark:bg-zinc-900/80 p-1 rounded-xl flex-1">
                      {[10, 15, 20, 30].map(t => (
                        <button
                          key={t}
                          onClick={() => setExamConfigState(s => ({ ...s, timeLimit: t }))}
                          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${examConfigState.timeLimit === t ? 'bg-white dark:bg-black text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <input 
                      type="number"
                      min={1}
                      value={examConfigState.timeLimit}
                      onChange={(e) => {
                         const val = parseInt(e.target.value) || 0;
                         setExamConfigState(s => ({...s, timeLimit: val}))
                      }}
                      className="w-16 md:w-24 bg-gray-100 dark:bg-zinc-900/80 border-none rounded-xl text-center text-[15px] font-bold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                  </div>
                </div>

                {/* Negative Marking Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-gray-100 dark:border-zinc-800">
                  <div>
                    <label className="text-[14px] font-bold text-gray-800 dark:text-gray-200 block">
                      নেগেটিভ মার্কিং
                    </label>
                    <p className="text-[11px] text-gray-500 mt-0.5">ভুল উত্তরের জন্য -০.২৫ নম্বর কাটা যাবে</p>
                  </div>
                  <button
                    onClick={() => setExamConfigState(s => ({ ...s, negativeMark: s.negativeMark > 0 ? 0 : 0.25 }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      examConfigState.negativeMark > 0 ? 'bg-primary' : 'bg-gray-300 dark:bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        examConfigState.negativeMark > 0 ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <button
                  onClick={handleConfirmExamStart}
                  className="w-full py-4 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/25 active:scale-95"
                >
                  <Play size={18} fill="currentColor" /> পরীক্ষা শুরু করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuestionBank;
