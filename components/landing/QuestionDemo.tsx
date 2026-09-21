import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, Lightbulb, ChevronRight, Zap, Timer } from "lucide-react";
import { demoQuestions } from "./LandingContent";

const OPTION_LETTERS = ["ক", "খ", "গ", "ঘ"];

export default function QuestionDemo() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(1500);
  const [solved, setSolved] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const q = demoQuestions[index];
  const answered = selected !== null;
  const isCorrect = selected === q.answer;

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSeconds((s) => (answered ? s : Math.max(0, s - 1)));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [answered, index]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const next = () => {
    setSolved((v) => v + 1);
    setIndex((i) => (i + 1) % demoQuestions.length);
    setSelected(null);
    setSeconds(1500);
  };

  const optionStyle = useMemo(
    () => (i: number) => {
      if (!answered)
        return "border-ink/10 bg-white hover:border-brand/50 hover:bg-mint/60 hover:shadow-[0_10px_24px_-12px_rgba(255,82,0,0.3)]";
      if (i === q.answer) return "border-brand bg-mint shadow-[0_10px_28px_-12px_rgba(255,82,0,0.4)]";
      if (i === selected) return "border-flag/60 bg-flag/8";
      return "border-ink/8 bg-white opacity-45";
    },
    [answered, q.answer, selected],
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ink/6 px-5 py-3.5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="rounded-lg bg-ink px-2.5 py-1 font-display text-[11px] font-bold uppercase tracking-wider text-lime">
            {q.subject}
          </span>
          <span className="hidden text-[12.5px] font-medium text-mist sm:block">{q.tagBn}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-soft px-3 py-1 text-[12px] font-bold text-ink">
            <Zap className="h-3.5 w-3.5 text-gold" fill="currentColor" />
            <span className="font-display tabular-nums">x{solved}</span>
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-display text-[12px] font-bold tabular-nums ring-1 ${
              seconds < 60 ? "bg-flag/10 text-flag ring-flag/20" : "bg-ink/[0.04] text-ink ring-ink/8"
            }`}
          >
            <Timer className="h-3.5 w-3.5" />
            {mm}:{ss}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 px-5 py-5 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-bangla text-[19px] font-bold leading-snug text-ink sm:text-[21px]">
              {index + 1}. {q.question}
            </p>

            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {q.options.map((opt, i) => (
                <motion.button
                  key={opt + i}
                  whileTap={{ scale: 0.97 }}
                  disabled={answered}
                  onClick={() => setSelected(i)}
                  className={`focus-ring group flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-300 ${optionStyle(i)}`}
                >
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg font-bangla text-[13px] font-bold transition-colors ${
                      answered && i === q.answer
                        ? "bg-brand text-white"
                        : answered && i === selected
                          ? "bg-flag text-white"
                          : "bg-ink/[0.05] text-ink/70 group-hover:bg-brand group-hover:text-white"
                    }`}
                  >
                    {answered && i === q.answer ? (
                      <Check className="h-4 w-4" strokeWidth={3} />
                    ) : answered && i === selected ? (
                      <X className="h-4 w-4" strokeWidth={3} />
                    ) : (
                      OPTION_LETTERS[i]
                    )}
                  </span>
                  <span className="text-[15px] font-semibold text-ink">{opt}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Solution / footer */}
      <div className="border-t border-ink/6 px-5 py-3.5 sm:px-6">
        <AnimatePresence mode="wait">
          {answered ? (
            <motion.div
              key="solution"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                    isCorrect ? "bg-brand text-white" : "bg-flag text-white"
                  }`}
                >
                  {isCorrect ? <Check className="h-3.5 w-3.5" strokeWidth={3.5} /> : <X className="h-3.5 w-3.5" strokeWidth={3.5} />}
                </span>
                <div>
                  <p className={`text-[13px] font-bold ${isCorrect ? "text-brand-deep" : "text-flag"}`}>
                    {isCorrect ? "একদম ঠিক! +৭ পয়েন্ট" : "ভুল হয়েছে — সঠিক উত্তর দেখো"}
                  </p>
                  <p className="mt-0.5 flex items-start gap-1.5 text-[12.5px] leading-relaxed text-mist">
                    <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                    {q.solution}
                  </p>
                </div>
              </div>
              <motion.button
                onClick={next}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[13px] font-bold text-paper"
              >
                পরের প্রশ্ন
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between"
            >
              <p className="text-[12.5px] font-medium text-mist">
                যেকোনো একটি উত্তরে ট্যাপ করো — <span className="font-bold text-brand-deep">সাথে সাথেই রেজাল্ট</span>
              </p>
              <div className="flex items-center gap-1.5" aria-hidden="true">
                {demoQuestions.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === index ? "w-5 bg-brand" : "w-1.5 bg-ink/15"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
