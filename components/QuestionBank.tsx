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
} from "lucide-react";
import { QuizQuestion } from "../types";
import { SYLLABUS_DB } from "../services/syllabusData";
import { useToast } from "./Toast";
import { normalizeBangla } from "../utils/normalization";
import { motion, AnimatePresence } from "motion/react";
import EmptyState from "./EmptyState";

// --- BOARD & COLLEGE CONSTANTS FOR ACADEMIC ---
const BOARDS = [
  { id: "AB", name: "সকল" },
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
    let borderClasses = "border border-gray-150 dark:border-gray-800";
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
        className={`p-5 md:p-6 transition-all duration-300 relative group bg-white dark:bg-gray-900 shadow-sm hover:shadow-md ${roundedClasses} ${borderClasses} ${marginClass}`}
      >
        {/* Question Text & Stimulus */}
        <div className="relative z-10">
          {(q.contextText || q.contextImage) && !isRepeatStimulus && (
            <div className="p-4 md:p-5 bg-sky-50/50 dark:bg-sky-950/10 rounded-2xl border-l-4 border-l-sky-500 border border-sky-100/50 dark:border-sky-800/30 text-sm md:text-base text-gray-800 dark:text-gray-200 font-tiro leading-relaxed mb-5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 bg-sky-500/5 rounded-full blur-xl" />
              {stimulusStart && stimulusEnd ? (
                <div className="mb-3 pb-2 border-b border-sky-100 dark:border-sky-800/20 flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                    নিচের উদ্দীপকের আলোকে {toBengaliNumber(stimulusStart)} ও{" "}
                    {toBengaliNumber(stimulusEnd)} নং প্রশ্নের উত্তর দাও:
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[12px] font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400 font-sans">
                    উদ্দীপক (Context)
                  </span>
                </div>
              )}
              {q.contextText && (
                <div
                  className="whitespace-pre-wrap leading-loose"
                  dangerouslySetInnerHTML={{ __html: q.contextText }}
                />
              )}
              {q.contextImage && (
                <div className="mt-4 rounded-xl overflow-hidden bg-white/50 dark:bg-black/10 border border-sky-200/30 p-2 shadow-sm">
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

          <div className="flex items-start gap-3 md:gap-4 mb-4">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-primary flex items-center justify-center font-black text-sm shrink-0 border border-orange-500/10 shadow-inner">
              {toBengaliNumber(idx + 1)}
            </div>
            <div className="flex-1 space-y-4 pt-0.5">
              <h3
                className="text-base md:text-lg font-bold text-gray-900 dark:text-white leading-relaxed font-tiro whitespace-pre-wrap"
                id={`q-title-${idx}`}
              >
                <div dangerouslySetInnerHTML={{ __html: q.question }} />
              </h3>
              {q.questionImage && (
                <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-2 max-w-sm">
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
                {q.examRef && (
                  <span className="text-[12px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-lg border border-blue-100/50 dark:border-blue-800/30">
                    {q.examRef}
                  </span>
                )}
                {q.tags &&
                  q.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[12px] font-medium bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-lg border border-orange-100/50 dark:border-orange-800/30"
                    >
                      {tag}
                    </span>
                  ))}
                {showChapter && q.chapter && (
                  <span className="text-[12px] font-semibold bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-lg border border-purple-100/50 dark:border-purple-800/30">
                    {q.chapter}
                  </span>
                )}
                {isRepeatStimulus && (
                  <span className="text-[12px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-400 px-2 py-0.5 rounded-lg border border-gray-200/50 dark:border-gray-700/50 font-sans">
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
                  : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
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
        <div className="flex flex-col gap-2.5 relative z-10 w-full pl-0 md:pl-13 mt-5">
          {q.options.map((option, oIdx) => {
            const isSelected = userSelected === oIdx;
            const isRight = oIdx === q.correctAnswerIndex;

            let variant = "default";
            if (showFeedback) {
              if (isRight) variant = "correct";
              else if (isSelected) variant = "wrong";
            } else if (isSelected) {
              variant = "selected";
            }

            return (
              <button
                key={oIdx}
                disabled={showFeedback}
                onClick={() => onOptionClick(idx, oIdx)}
                className={`p-3 md:p-3.5 rounded-xl text-left text-sm md:text-base font-normal transition-all duration-300 border flex flex-col gap-2 group/opt ${
                  variant === "correct"
                    ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-sm"
                    : variant === "wrong"
                      ? "bg-rose-50/60 dark:bg-rose-950/20 border-rose-500 text-rose-800 dark:text-rose-300 shadow-sm"
                      : variant === "selected"
                        ? "bg-orange-50/40 dark:bg-orange-950/10 border-primary text-gray-900 dark:text-white font-medium shadow-sm"
                        : "bg-gray-50/50 hover:bg-white dark:bg-gray-800/55 dark:hover:bg-gray-800 border-gray-150 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="flex items-center gap-3 w-full">
                  <span
                    className={`w-7 h-7 flex items-center justify-center font-bold text-xs rounded-lg shrink-0 transition-all duration-300 ${
                      variant === "correct"
                        ? "bg-emerald-500 text-white shadow-md"
                        : variant === "wrong"
                          ? "bg-rose-500 text-white shadow-md"
                          : variant === "selected"
                            ? "bg-primary text-white shadow-md"
                            : "bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 group-hover/opt:bg-orange-500/10 group-hover/opt:text-primary group-hover/opt:border-primary/20"
                    }`}
                  >
                    {String.fromCharCode(65 + oIdx)}
                  </span>
                  <span
                    className="flex-1 font-tiro whitespace-pre-wrap leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: option }}
                  ></span>

                  {variant === "correct" && (
                    <div className="shrink-0 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 p-1 rounded-full border border-emerald-150">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  )}
                  {variant === "wrong" && (
                    <div className="shrink-0 text-rose-500 bg-rose-50 dark:bg-rose-900/30 p-1 rounded-full border border-rose-150">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </div>
                  )}
                </div>
                {q.optionsImages?.[oIdx] && (
                  <img
                    src={q.optionsImages[oIdx]}
                    alt={`Option ${oIdx}`}
                    className="h-16 w-fit object-contain rounded self-center mt-1 select-none"
                    referrerPolicy="no-referrer"
                  />
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
                <div className="text-sm text-gray-800 dark:text-gray-200 leading-loose font-tiro whitespace-pre-wrap pl-1">
                  <div dangerouslySetInnerHTML={{ __html: q.explanation }} />
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
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const [userSelections, setUserSelections] = useState<Record<number, number>>(
    {},
  );
  const [savedQuestionIds, setSavedQuestionIds] = useState<Set<string>>(
    new Set(),
  );

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

    const currentParams = {
      level: selectedLevel || "",
      subject: selectedSubject || "",
      chapter: selectedChapter || "",
      topic: "",
      examRef: selectedExamRef || "",
      search: debouncedSearch,
      board: academicFilterType === "board" ? (selectedBoardTag || "") : "",
      college: academicFilterType === "college" ? (selectedCollegeTag || "") : "",
    };

    const isFilterChange =
      lastFetchParams.current.level !== currentParams.level ||
      lastFetchParams.current.subject !== currentParams.subject ||
      lastFetchParams.current.chapter !== currentParams.chapter ||
      (lastFetchParams.current as any).examRef !== currentParams.examRef ||
      lastFetchParams.current.search !== currentParams.search ||
      (lastFetchParams.current as any).board !== currentParams.board ||
      (lastFetchParams.current as any).college !== currentParams.college;

    if (isFilterChange) {
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
            50,
            selectedSubject ?? undefined,
            selectedChapter ?? undefined,
            undefined, // topic
            undefined, // examRef
            debouncedSearch || undefined, // search query
            selectedLevel ?? undefined, // level
            academicFilterType === "board" ? (selectedBoardTag || undefined) : undefined,
            academicFilterType === "college" ? (selectedCollegeTag || undefined) : undefined,
          );
        }

        if (ignore) return;

        const fetchedQuestions = res.questions || [];

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

        if (page === 1) {
          setQuestions(sortedFetched);
        } else {
          setQuestions((prev: any[]) => {
            const existingIds = new Set(prev.map((q) => q._id || q.id));
            const newUnique = sortedFetched.filter(
              (q: any) => !existingIds.has(q._id || q.id),
            );
            return [...prev, ...newUnique];
          });
        }

        setHasMore(fetchedQuestions.length >= 50);
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
      
      // If we seek Board questions
      if (academicFilterType === "board") {
        const isCg = !!q.college || COLLEGES.some(col => examRefStr.toUpperCase().includes(col.toUpperCase()));
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
        const hasCollege = !!q.college || COLLEGES.some(col => examRefStr.toUpperCase().includes(col.toUpperCase()));
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
    setSearchParams({ level });
  };

  const handleSubjectSelect = (subject: string) => {
    setSearchParams({ level: selectedLevel || "", subject });
  };

  const handleChapterSelect = (chapter: string) => {
    if (selectedChapter === chapter) {
      setSearchParams({
        level: selectedLevel || "",
        subject: selectedSubject || "",
      });
    } else {
      setSearchParams({
        level: selectedLevel || "",
        subject: selectedSubject || "",
        chapter,
      });
    }
  };

  const _handleInstitutionSelect = (instId: string) => {
    const inst = ADMISSION_INSTITUTIONS.find((i) => i.id === instId);
    if (inst && inst.units && inst.units.length === 1) {
      setSearchParams({
        level: "ADMISSION",
        institution: instId,
        unit: inst.units[0].id,
      });
    } else {
      setSearchParams({ level: "ADMISSION", institution: instId });
    }
  };

  const handleUnitSelect = (unitId: string) => {
    setSearchParams({
      level: "ADMISSION",
      institution: selectedInstitution || "",
      unit: unitId,
    });
  };

  const handleExamPaperSelect = (examRef: string) => {
    setSearchParams({
      level: "ADMISSION",
      institution: selectedInstitution || "",
      unit: selectedUnit || "",
      examRef,
    });
  };

  const handleBack = () => {
    if (selectedExamRef) {
      setSearchParams({
        level: "ADMISSION",
        institution: selectedInstitution || "",
        unit: selectedUnit || "",
      });
    } else if (selectedUnit) {
      const inst = ADMISSION_INSTITUTIONS.find(
        (i) => i.id === selectedInstitution,
      );
      if (inst && inst.units.length === 1) {
        setSearchParams({ level: "ADMISSION" });
      } else {
        setSearchParams({
          level: "ADMISSION",
          institution: selectedInstitution || "",
        });
      }
    } else if (selectedInstitution) {
      setSearchParams({ level: "ADMISSION" });
    } else if (selectedChapter) {
      setSearchParams({
        level: selectedLevel || "",
        subject: selectedSubject || "",
      });
    } else if (selectedSubject) {
      setSearchParams({ level: selectedLevel || "" });
    } else if (selectedLevel) {
      setSearchParams({});
    } else {
      navigate(-1);
    }
  };

  const handleStartRevision = () => {
    if (filteredQuestions.length === 0) {
      showToast("কোনো প্রশ্ন পাওয়া যায়নি", "warning");
      return;
    }
    setIsRevisionMode(true);
    setShowAllAnswers(false);
    setUserSelections({});
  };

  const handleStartExam = () => {
    if (filteredQuestions.length === 0) {
      showToast("কোনো প্রশ্ন পাওয়া যায়নি", "warning");
      return;
    }
    const examId = `qbank_exam_${Date.now()}`;

    // Stimulus-aware selection
    const grouped: Record<string, QuizQuestion[]> = {};
    const singles: QuizQuestion[] = [];
    const shuffledRaw = [...filteredQuestions].sort(() => 0.5 - Math.random());

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
      if (selectedQs.length + group.length <= 25) {
        selectedQs.push(...group);
      }
    });

    singlesShuffled.forEach((q) => {
      if (selectedQs.length < 25) {
        selectedQs.push(q);
      }
    });

    // Fallback
    if (selectedQs.length < 25) {
      groups.forEach((group) => {
        if (selectedQs.length < 25) {
          const needed = 25 - selectedQs.length;
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
      timeLimit: 20,
      mode: "ALL_AT_ONCE",
      type: "QBANK_EXAM",
      isPracticeMode: false,
    };
    localStorage.setItem(`exam_config_${examId}`, JSON.stringify(config));
    navigate(`/exam/${examId}`);
  };

  const handleOptionClick = useCallback((qIdx: number, oIdx: number) => {
    setUserSelections((prev) => ({ ...prev, [qIdx]: oIdx }));
  }, []);

  const toggleSaveQuestion = useCallback(
    async (question: QuizQuestion) => {
      if (!currentUser) {
        showToast("লগইন প্রয়োজন", "warning");
        return;
      }
      const qId = question._id || question.id;
      if (!qId) return;

      setSavedQuestionIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(qId)) {
          newSet.delete(qId);
          unsaveQuestionAPI(currentUser.uid, qId).catch(console.error);
          showToast("বুকমার্ক রিমুভ করা হয়েছে", "info");
        } else {
          newSet.add(qId);
          saveQuestionAPI(currentUser.uid, qId).catch(console.error);
          showToast("প্রশ্নটি বুকমার্ক করা হয়েছে", "success");
        }
        return newSet;
      });
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

  if (isRevisionMode) {
    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors">
        {/* Premium revision portal header */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-150 dark:border-gray-800 p-4 sticky top-0 z-20 shadow-sm">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsRevisionMode(false)}
                className="p-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700 transition-all duration-300"
                id="btn-back-rev"
              >
                <ChevronLeft size={18} />
              </button>
              <div>
                <span className="text-[12px] font-bold text-primary dark:text-primary uppercase tracking-widest flex items-center gap-1 font-sans">
                  <Sparkles size={10} /> রিভিশন স্টাডি মোড
                </span>
                <h1 className="text-base md:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  {selectedSubject
                    ? SUBJECT_DEFINITIONS[selectedSubject]?.display ||
                      selectedSubject
                    : "রিভিশন"}
                </h1>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAllAnswers(!showAllAnswers)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-300 border ${
                  showAllAnswers
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200/50"
                }`}
                id="btn-toggle-ans-rev"
              >
                {showAllAnswers ? <EyeOff size={13} /> : <Eye size={13} />}
                {showAllAnswers ? "উত্তর লুকান" : "সব উত্তর দেখুন"}
              </button>
            </div>
          </div>
        </div>

        {/* Revision Cards Feed */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24">
          <div className="max-w-3xl mx-auto flex flex-col space-y-4">
            {questions.map((q, idx) => {
              const isRepeatStimulus =
                idx > 0 &&
                q.contextText &&
                q.contextText === questions[idx - 1].contextText &&
                q.contextImage === questions[idx - 1].contextImage;

              let stimulusRange = null;
              let isGroupStart = false;
              let isGroupMiddle = false;
              let isGroupEnd = false;

              if (!isRepeatStimulus && (q.contextText || q.contextImage)) {
                let endIndex = idx;
                for (let i = idx + 1; i < questions.length; i++) {
                  if (
                    questions[i].contextText === q.contextText &&
                    questions[i].contextImage === q.contextImage
                  ) {
                    endIndex = i;
                  } else {
                    break;
                  }
                }
                if (endIndex > idx) {
                  stimulusRange = { start: idx + 1, end: endIndex + 1 };
                  isGroupStart = true;
                }
              } else if (isRepeatStimulus) {
                const hasNextMatch =
                  idx + 1 < questions.length &&
                  questions[idx + 1].contextText === q.contextText &&
                  questions[idx + 1].contextImage === q.contextImage;
                if (hasNextMatch) {
                  isGroupMiddle = true;
                } else {
                  isGroupEnd = true;
                }
              }

              return (
                <RevisionQuestionCard
                  key={idx}
                  idx={idx}
                  q={q}
                  userSelected={userSelections[idx]}
                  showAllAnswers={showAllAnswers}
                  isSaved={savedQuestionIds.has(q._id || q.id || "")}
                  onOptionClick={handleOptionClick}
                  onToggleSave={toggleSaveQuestion}
                  showChapter={!selectedChapter}
                  isGroupStart={isGroupStart}
                  isGroupMiddle={isGroupMiddle}
                  isGroupEnd={isGroupEnd}
                  stimulusStart={stimulusRange?.start}
                  stimulusEnd={stimulusRange?.end}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50/50 dark:bg-gray-950 transition-colors">
      {/* Premium Header Bar */}
      <div className="bg-white/95 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-150 dark:border-gray-800 p-4 sticky top-0 z-10 shadow-sm shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {(selectedLevel || selectedSubject) && (
              <button
                onClick={handleBack}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-150 dark:border-gray-800 transition-all duration-300"
                id="btn-header-back"
              >
                <ChevronLeft size={18} />
              </button>
            )}
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
                {selectedExamRef
                  ? selectedExamRef
                  : selectedSubject
                    ? SUBJECT_DEFINITIONS[selectedSubject]?.display ||
                      selectedSubject
                    : "স্মার্ট প্রশ্নব্যাংক"}
              </h1>
            </div>
          </div>
          {/* Quick study metrics or buttons */}
          {(selectedSubject || selectedExamRef) && (
            <div className="hidden md:flex gap-2">
              <button
                onClick={handleStartRevision}
                className="px-4 py-2 bg-gray-50 border border-gray-150 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-300"
                id="btn-rev-desktop"
              >
                <Eye size={14} /> রিভিশন মোড
              </button>
              <button
                onClick={handleStartExam}
                className="px-4 py-2 bg-primary hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 active:translate-y-0.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-300"
                id="btn-exam-desktop"
              >
                <Play size={12} fill="currentColor" /> পরীক্ষা দিন
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="max-w-4xl mx-auto p-4 md:p-6 pb-40">
          {!selectedLevel ? (
            /* LEVEL 1: ACADEMIC vs ADMISSION vs MAINBOOK */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 py-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLevelSelect("ACADEMIC")}
                className="p-6 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-150 dark:border-gray-800 hover:border-primary/20 shadow-md hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 group text-center relative overflow-hidden"
                id="btn-select-academic"
              >
                {/* Glowing Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-2xl mx-auto flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                  <BookOpen size={28} />
                </div>
                <h2 className="text-lg md:text-xl font-black text-gray-900 dark:text-white mb-2 font-tiro">
                  একাডেমিক প্রশ্নব্যাংক
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                  বোর্ড পরীক্ষা, কলেজের নির্বাচনী ও গুরুত্বপূর্ণ মডেল টেস্টের
                  অধ্যায়ভিত্তিক প্রশ্ন ও সমাধান
                </p>

                <div className="inline-flex items-center gap-1.5 text-[12px] font-bold text-blue-500 mt-5 bg-blue-500/10 px-3 py-1.5 rounded-full">
                  <Compass size={12} /> প্রবেশ করুন
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLevelSelect("ADMISSION")}
                className="p-6 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-150 dark:border-gray-800 hover:border-primary/20 shadow-md hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 group text-center relative overflow-hidden"
                id="btn-select-admission"
              >
                {/* Glowing Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-orange-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="w-16 h-16 bg-orange-500/10 dark:bg-orange-500/20 text-primary rounded-2xl mx-auto flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                  <Stethoscope size={28} />
                </div>
                <h2 className="text-lg md:text-xl font-black text-gray-900 dark:text-white mb-2 font-tiro">
                  ভর্তি পরীক্ষার প্রশ্নব্যাংক
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                  মেডিকেল, ডেন্টাল, ঢাবি ও জিএসটি গুচ্ছ বিশ্ববিদ্যালয়ের বিগত
                  বছরের প্রশ্নাবলী
                </p>

                <div className="inline-flex items-center gap-1.5 text-[12px] font-bold text-primary mt-5 bg-orange-500/10 px-3 py-1.5 rounded-full">
                  <Compass size={12} /> প্রবেশ করুন
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLevelSelect("MAINBOOK")}
                className="p-6 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-150 dark:border-gray-800 hover:border-primary/20 shadow-md hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 group text-center relative overflow-hidden"
                id="btn-select-mainbook"
              >
                {/* Glowing Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-emerald-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-2xl mx-auto flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                  <BookMarked size={28} />
                </div>
                <h2 className="text-lg md:text-xl font-black text-gray-900 dark:text-white mb-2 font-tiro">
                  অনুশীলনীর প্রশ্নব্যাংক
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                  বিভিন্ন স্বনামধন্য স্যারদের বইয়ের অনুশীলনী ও অধ্যায়ভিত্তিক
                  গুরুত্বপূর্ণ MCQ সমাধান (Mainbook MCQ)
                </p>

                <div className="inline-flex items-center gap-1.5 text-[12px] font-bold text-emerald-500 mt-5 bg-emerald-500/10 px-3 py-1.5 rounded-full">
                  <Compass size={12} /> প্রবেশ করুন
                </div>
              </motion.button>
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
                        className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-150 dark:border-gray-800 text-left hover:border-blue-500 transition-all duration-300 group flex items-start gap-4 shadow-sm"
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
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1 h-5 bg-orange-500 rounded-full" />
                  <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest font-sans">
                    বিষয় ভিত্তিক প্রশ্নব্যাংক
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {Object.entries(SUBJECT_DEFINITIONS).map(
                    ([key, subject], idx) => {
                      const count = getStatsFor(key);
                      return (
                        <motion.button
                          whileHover={{ y: -3, scale: 1.01 }}
                          key={idx}
                          onClick={() => handleSubjectSelect(key)}
                          className="bg-white dark:bg-gray-900 p-4.5 rounded-2xl border border-gray-150 dark:border-gray-800 text-left hover:border-primary transition-all duration-300 group flex items-center justify-between shadow-sm relative overflow-hidden"
                          id={`btn-sub-${idx}`}
                        >
                          {/* Left Content */}
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div
                              className={`w-11 h-11 rounded-xl ${subject.bg} ${subject.color} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-115 transition-transform duration-300`}
                            >
                              <subject.icon size={20} />
                            </div>
                            <div className="min-w-0 pr-1">
                              <h3 className="text-sm md:text-base font-extrabold text-gray-900 dark:text-white truncate font-tiro">
                                {subject.display}
                              </h3>
                              <span className="text-[12px] text-gray-400 lowercase block font-sans">
                                Syllabus Chapter Analysis
                              </span>
                            </div>
                          </div>

                          {/* Question badge count */}
                          <div className="flex items-center gap-2shrink-0">
                            {count > 0 ? (
                              <span className="text-[11px] font-black bg-orange-500/10 text-primary dark:bg-orange-500/15 px-2.5 py-1 rounded-lg border border-orange-500/10">
                                {toBengaliNumber(count.toLocaleString())} প্রশ্ন
                              </span>
                            ) : (
                              <span className="text-[12px] text-gray-400 italic">
                                প্রস্তুত হচ্ছে
                              </span>
                            )}
                          </div>
                        </motion.button>
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
                    className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-150 dark:border-gray-800 hover:border-blue-500 hover:shadow-md transition-all flex items-center justify-between group text-left shadow-sm"
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
                      className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-150 dark:border-gray-800 hover:border-blue-500 text-left hover:shadow-md transition-all duration-300 flex flex-col justify-between shadow-sm relative overflow-hidden group"
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
            <div className="space-y-6">
              {/* HERO STATS WIDGET PANEL (BENTO EXCEL) */}
              <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-5 shadow-sm relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-56 h-56 -mr-20 -mt-20 bg-orange-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/3 w-32 h-32 -ml-16 -mb-16 bg-blue-500/5 rounded-full blur-2xl" />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-black text-primary uppercase tracking-widest bg-orange-500/5 dark:bg-orange-500/15 border border-orange-500/10 px-2.5 py-1 rounded-full font-sans mb-2">
                      <Sparkles size={11} /> স্টাডি ড্যাশবোর্ড
                    </span>
                    <h2 className="text-lg font-black text-gray-900 dark:text-white leading-tight">
                      {selectedSubject
                        ? SUBJECT_DEFINITIONS[selectedSubject]?.display ||
                          selectedSubject
                        : selectedExamRef}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                      <Clock size={12} /> {filteredQuestions.length} টি প্রশ্ন এই বিভাগে
                      লোড হয়েছে
                    </p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto self-stretch sm:self-auto pt-2 sm:pt-0">
                    <button
                      onClick={handleStartRevision}
                      className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 dark:text-gray-300 transition-all duration-300 hover:bg-slate-100"
                      id="btn-stats-rev"
                    >
                      <Eye size={13} /> রিভিশন দিন
                    </button>
                    <button
                      onClick={handleStartExam}
                      className="flex-1 sm:flex-initial px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-orange-600 transition-all duration-300 shadow-md shadow-orange-500/10"
                      id="btn-stats-exam"
                    >
                      <Play size={11} fill="currentColor" /> এক্সাম দিন
                    </button>
                  </div>
                </div>
              </div>

              {/* SLIDER 1: CHAPTERS BADGES ROW */}
              {selectedSubject && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                    অধ্যায়সমূহ (Chapters)
                  </h3>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 pt-1">
                    <button
                      onClick={() => handleChapterSelect("")}
                      className={`px-4 py-1.8 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border duration-300 ${!selectedChapter ? "bg-primary text-white border-primary shadow-sm shadow-orange-500/20" : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-150 dark:border-gray-800 hover:border-gray-300"}`}
                      id="btn-chap-all"
                    >
                      সব অধ্যায়
                    </button>
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
                          className={`px-4 py-1.8 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border duration-300 flex items-center gap-2 ${isSelected ? "bg-primary text-white border-primary shadow-sm shadow-orange-500/20" : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-150 dark:border-gray-800 hover:border-primary/40"}`}
                          id={`btn-chap-${idx}`}
                        >
                          {chapter}
                          <span
                            className={`px-1.5 py-0.5 rounded-lg text-[12px] ${selectedChapter === chapter ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-800 font-bold text-gray-500 dark:text-gray-400"}`}
                          >
                            {toBengaliNumber(count)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* LEVEL-SPECIFIC ACADEMIC CATEGORY FILTERS (BOARD VS COLLEGE TEST EXAMS) */}
              {selectedLevel === "ACADEMIC" && (
                <div className="bg-white dark:bg-gray-900 duration-300 p-4 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm space-y-3.5 relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-primary/10 text-primary rounded-lg shrink-0">
                        <Layers size={14} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-gray-850 dark:text-gray-250 uppercase tracking-wider">
                          পরীক্ষার ধরণ ফিল্টার (Exam Category)
                        </h4>
                        <p className="text-[12px] text-gray-400 font-medium">ক্যাটাগরি ভিত্তিক প্রশ্নগুলো আলাদা করুন</p>
                      </div>
                    </div>
                    <div className="flex bg-gray-50 dark:bg-gray-800 p-0.5.5 rounded-xl border border-gray-200/60 dark:border-gray-700/80 self-start sm:self-auto shrink-0">
                      <button
                        onClick={() => {
                          setAcademicFilterType("all");
                          setSelectedBoardTag("");
                          setSelectedCollegeTag("");
                        }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          academicFilterType === "all"
                            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs"
                            : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        }`}
                      >
                        সকল প্রশ্ন
                      </button>
                      <button
                        onClick={() => {
                          setAcademicFilterType("board");
                          setSelectedBoardTag("");
                          setSelectedCollegeTag("");
                        }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          academicFilterType === "board"
                            ? "bg-purple-600 text-white shadow-sm shadow-purple-500/15"
                            : "text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        }`}
                      >
                        বোর্ড প্রশ্ন
                      </button>
                      <button
                        onClick={() => {
                          setAcademicFilterType("college");
                          setSelectedBoardTag("");
                          setSelectedCollegeTag("");
                        }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          academicFilterType === "college"
                            ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/15"
                            : "text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        }`}
                      >
                        কলেজ টেস্ট
                      </button>
                    </div>
                  </div>

                  {/* CONDITIONAL BOARDS SELECTION */}
                  {academicFilterType === "board" && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-1.5">
                      <span className="text-[12px] font-black tracking-widest text-purple-600 dark:text-purple-400 uppercase block pl-0.5">
                        নির্দিষ্ট শিক্ষা বোর্ড চয়ন করুন (Select Board)
                      </span>
                      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                        <button
                          onClick={() => setSelectedBoardTag("")}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                            !selectedBoardTag
                              ? "bg-purple-500 text-white border-purple-500 shadow-sm"
                              : "bg-white dark:bg-gray-900 border-gray-150 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-purple-300"
                          }`}
                        >
                          সকল বোর্ড
                        </button>
                        {BOARDS.map((b) => (
                          <button
                            key={b.id}
                            onClick={() => setSelectedBoardTag(b.id)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                              selectedBoardTag === b.id
                                ? "bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-500/20"
                                : "bg-white dark:bg-gray-900 border-gray-150 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-purple-400/40"
                            }`}
                          >
                            {b.name} ({b.id})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  { academicFilterType === "college" && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-1.5">
                      <span className="text-[12px] font-black tracking-widest text-emerald-600 dark:text-emerald-400 uppercase block pl-0.5">
                        কলেজ নির্বাচন করুন (Select College Tag)
                      </span>
                      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                        <button
                          onClick={() => setSelectedCollegeTag("")}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                            !selectedCollegeTag
                              ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                              : "bg-white dark:bg-gray-900 border-gray-150 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-emerald-300"
                          }`}
                        >
                          সকল কলেজ
                        </button>
                        {COLLEGES.map((c) => (
                          <button
                            key={c}
                            onClick={() => setSelectedCollegeTag(c)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                              selectedCollegeTag === c
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/20"
                                : "bg-white dark:bg-gray-900 border-gray-150 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-emerald-400/40"
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SMART SEARCH, VIEW MODE TOGGLES, AND COMPACT CHANGER PANEL */}
              <div className="bg-white dark:bg-gray-900 p-3.5 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 relative z-10">
                {/* Search Field */}
                <div className="relative w-full md:max-w-md">
                  <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="প্রশ্ন সার্চ করুন (যেমন: ভরবেগ, ডিএনএ)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-sm rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-gray-900 dark:text-white placeholder-gray-400 transition-all duration-300"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600 bg-gray-200/50 dark:bg-gray-700 px-1.5 py-0.5 rounded-md"
                    >
                      ক্লিয়ার
                    </button>
                  )}
                </div>

                {/* Compact vs Detailed Layout Mode Toggles */}
                <div className="flex gap-2 self-stretch md:self-auto justify-end w-full md:w-auto">
                  <div className="flex p-0.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shrink-0">
                    <button
                      onClick={() => setLayoutMode("detailed")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all duration-300 ${layoutMode === "detailed" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                      id="btn-layout-detailed"
                    >
                      <SlidersHorizontal size={12} /> বিস্তারিত
                    </button>
                    <button
                      onClick={() => setLayoutMode("compact")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all duration-300 ${layoutMode === "compact" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                      id="btn-layout-compact"
                    >
                      <Archive size={12} /> কম্প্যাক্ট
                    </button>
                  </div>
                </div>
              </div>

              {/* MAIN QUESTIONS CONTAINER */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h2 className="text-base md:text-lg font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 font-sans">
                    <BookMarked size={16} className="text-primary" />
                    {selectedChapter ? `${selectedChapter}` : "সব প্রশ্নাবলী"}
                    <span className="text-xs bg-slate-100 dark:bg-gray-800 px-2 py-0.5 rounded-md text-gray-500 font-bold ml-1 font-sans">
                      {filteredQuestions.length} loaded
                    </span>
                  </h2>
                </div>

                {loading && questions.length === 0 ? (
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
                        const isSaved = savedQuestionIds.has(
                          q._id || q.id || "",
                        );
                        const isRevealed = userSelections[idx] !== undefined;

                        return (
                          <motion.div
                            layout
                            key={q._id || q.id || idx}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.28, ease: "easeOut" }}
                            className="bg-white dark:bg-gray-950 p-5 md:p-6 rounded-3xl border border-gray-150 dark:border-gray-850 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden"
                          >
                            {/* Glowing card graphic background */}
                            <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-orange-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                            {/* Top corner share & save tools */}
                            <div className="absolute top-4 right-4 flex gap-1 z-10">
                              <button
                                id={`btn-save-item-${idx}`}
                                onClick={() => toggleSaveQuestion(q)}
                                className={`p-2 rounded-xl transition-all ${
                                  isSaved
                                    ? "bg-orange-500/10 text-primary"
                                    : "bg-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                }`}
                              >
                                <Bookmark
                                  size={15}
                                  fill={isSaved ? "currentColor" : "none"}
                                />
                              </button>
                              <button
                                onClick={() => handleShare(q)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl transition-colors"
                              >
                                <Share2 size={15} />
                              </button>
                            </div>

                            {/* Body Wrapper */}
                            <div className="flex gap-3 md:gap-4 relative z-10">
                              {/* Left serial line indicator */}
                              <div className="flex flex-col items-center gap-1.5 shrink-0">
                                <span className="text-lg font-black text-gray-200 dark:text-gray-800 font-mono leading-none pt-0.5">
                                  {String(idx + 1).padStart(2, "0")}
                                </span>
                                <div className="w-0.5 h-full bg-slate-100 dark:bg-gray-850 min-h-[22px] rounded-full" />
                              </div>

                              <div className="flex-1 space-y-3 pr-10">
                                {/* Stimulus Segment */}
                                {(q.contextText || q.contextImage) && (
                                  <div className="p-3.5 bg-sky-500/5 dark:bg-sky-500/5 rounded-2xl border border-sky-100/50 dark:border-sky-900/15 leading-relaxed relative overflow-hidden font-tiro text-sm">
                                    <div className="text-[9px] font-black tracking-widest text-sky-500 uppercase mb-2 font-sans flex items-center gap-1.5">
                                      <span className="w-1 h-1 rounded-full bg-sky-500" />{" "}
                                      উদ্দীপক context
                                    </div>
                                    {q.contextText && (
                                      <div
                                        className="text-gray-800 dark:text-gray-200 leading-relaxed max-w-full font-tiro whitespace-pre-wrap font-book"
                                        dangerouslySetInnerHTML={{
                                          __html: q.contextText,
                                        }}
                                      />
                                    )}
                                    {q.contextImage && (
                                      <img
                                        src={q.contextImage}
                                        alt="Context"
                                        className="mt-2 text-center max-h-36 mx-auto object-contain rounded border pr-1 bg-white"
                                        referrerPolicy="no-referrer"
                                      />
                                    )}
                                  </div>
                                )}

                                {/* Actual Question */}
                                <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white leading-relaxed font-tiro whitespace-pre-wrap">
                                  {q.question}
                                </h3>
                                {q.questionImage && (
                                  <div className="rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900/50 p-2 max-w-xs border border-gray-100 dark:border-gray-800">
                                    <img
                                      src={q.questionImage}
                                      alt="Question"
                                      className="max-h-48 object-contain"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                )}

                                {/* TAG FLAGS */}
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {q.examRef && (
                                    <span className="px-2 py-0.5 bg-orange-500/10 text-primary dark:bg-orange-500/15 rounded-lg text-[9px] font-bold tracking-tight border border-orange-500/10 font-sans">
                                      {q.examRef}
                                    </span>
                                  )}
                                  {!selectedChapter && q.chapter && (
                                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-[9px] font-semibold border border-blue-500/10 font-sans">
                                      {q.chapter}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* OPTIONS BLOCK (REPRESENTATION CHANGES BY LAYOUT PRESTIGE) */}
                            {layoutMode === "detailed" ? (
                              /* DETAILED OPTION PREVIEW WITH FILLS */
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 pl-0 md:pl-8.5 relative z-10">
                                {q.options.map((option, optIdx) => {
                                  const isCorrect =
                                    optIdx === q.correctAnswerIndex;
                                  return (
                                    <div
                                      key={optIdx}
                                      className={`p-3 rounded-2xl border text-xs md:text-sm transition-all flex items-center gap-2.5 font-tiro ${
                                        isRevealed && isCorrect
                                          ? "bg-emerald-500/5 border-emerald-400 text-emerald-800 dark:text-emerald-300 font-bold"
                                          : "bg-slate-50/50 dark:bg-gray-900 border-gray-150 dark:border-gray-850 text-gray-700 dark:text-gray-300"
                                      }`}
                                    >
                                      <span
                                        className={`w-5.5 h-5.5 rounded-lg flex items-center justify-center font-bold font-sans text-[12px] shrink-0 border ${
                                          isRevealed && isCorrect
                                            ? "bg-emerald-500 text-white border-transparent"
                                            : "bg-white dark:bg-gray-800 text-gray-400 border-gray-200"
                                        }`}
                                      >
                                        {String.fromCharCode(65 + optIdx)}
                                      </span>
                                      <span
                                        className="flex-1 truncate"
                                        dangerouslySetInnerHTML={{
                                          __html: option,
                                        }}
                                      ></span>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : null}

                            {/* BOTTOM ACTION WRAPPER */}
                            <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-50 dark:border-gray-900 relative z-10 pl-0 md:pl-8.5">
                              <span className="text-[12px] uppercase font-bold text-gray-400 tracking-wider font-sans">
                                {layoutMode === "compact"
                                  ? "কম্প্যাক্ট মোড"
                                  : "বিস্তারিত ভিউ"}
                              </span>
                              <button
                                id={`btn-reveal-ans-${idx}`}
                                onClick={() => {
                                  if (isRevealed) {
                                    // Toggle/hide
                                    setUserSelections((prev) => {
                                      const update = { ...prev };
                                      delete update[idx];
                                      return update;
                                    });
                                  } else {
                                    setUserSelections((prev) => ({
                                      ...prev,
                                      [idx]: 99,
                                    }));
                                  }
                                }}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1 hover:scale-[1.02] active:scale-[0.98] transition-all border ${
                                  isRevealed
                                    ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200"
                                    : "bg-gray-900 text-white dark:bg-white dark:text-gray-950 border-transparent font-medium shadow-gray-900/10"
                                }`}
                              >
                                {isRevealed ? (
                                  <>উত্তর লুকান</>
                                ) : (
                                  <>উত্তর দেখুন</>
                                )}
                              </button>
                            </div>

                            {/* COLLAPSED EXPANDABLE DETAILED DRAWER WRAPPER */}
                            <AnimatePresence>
                              {isRevealed && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.28 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-4 p-5 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/5 dark:to-gray-900 border border-emerald-500/10 dark:border-emerald-500/5 rounded-2xl">
                                    {/* correct ans line */}
                                    <div className="flex items-center gap-2 mb-3.5">
                                      <CheckCircle
                                        className="text-emerald-500 shrink-0"
                                        size={16}
                                      />
                                      <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-sans">
                                        সঠিক উত্তর মডিউল
                                      </span>
                                    </div>

                                    <div className="flex gap-3 pl-1 mb-4">
                                      <div className="w-6.5 h-6.5 bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0 rounded-lg shadow-sm">
                                        {String.fromCharCode(
                                          65 + q.correctAnswerIndex,
                                        )}
                                      </div>
                                      <p
                                        className="text-sm md:text-base font-extrabold text-gray-900 dark:text-white leading-relaxed font-tiro whitespace-pre-wrap pt-0.5"
                                        dangerouslySetInnerHTML={{
                                          __html:
                                            q.options[q.correctAnswerIndex],
                                        }}
                                      />
                                    </div>

                                    {/* Explanations block */}
                                    {q.explanation && (
                                      <div className="pl-4 border-l-2 border-dashed border-gray-200 dark:border-gray-800 mt-2">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1.5 font-sans">
                                          ব্যখ্যা (Explanation)
                                        </p>
                                        <p
                                          className="text-xs md:text-sm text-gray-600 dark:text-gray-400 italic font-tiro leading-loose whitespace-pre-wrap select-text"
                                          dangerouslySetInnerHTML={{
                                            __html: q.explanation,
                                          }}
                                        />
                                        {q.explanationImage && (
                                          <img
                                            src={q.explanationImage}
                                            alt="Explanation"
                                            className="mt-3 select-none text-center max-h-36 object-contain rounded border p-1"
                                            referrerPolicy="no-referrer"
                                          />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
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

              {/* BOTTOM HASMORE CONTAINER */}
              {hasMore && questions.length > 0 && (
                <div className="pt-2 text-center">
                  <button
                    onClick={() => setPage(page + 1)}
                    className="px-6 py-3 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-primary text-xs font-black text-gray-500 dark:text-gray-400 hover:text-primary rounded-xl transition-all duration-300 uppercase tracking-widest active:scale-98 shadow-sm"
                    id="btn-load-more"
                  >
                    আরো প্রশ্ন লোড করুন
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionBank;
