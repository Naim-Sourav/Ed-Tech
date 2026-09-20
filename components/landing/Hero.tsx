import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Play, Flame, Trophy, CheckCircle2, XCircle, Radio } from 'lucide-react';
import { Reveal, bnDigits, scrollToId, Monogram, usePrefersReducedMotion } from './primitives';

/* ------------------------------------------------------------------ */
/*  HERO — headline + CTAs on the left, a LIVE, tappable exam           */
/*  simulator (the product itself) on the right.                        */
/* ------------------------------------------------------------------ */

interface SimQuestion {
  subject: string;
  q: string;
  options: string[];
  correct: number;
  explain: string;
}

const SIM_QUESTIONS: SimQuestion[] = [
  {
    subject: 'পদার্থবিজ্ঞান · ২য় অধ্যায়',
    q: 'নিচের কোনটি ভেক্টর রাশি?',
    options: ['দ্রুতি', 'ভর', 'সরণ', 'তাপমাত্রা'],
    correct: 2,
    explain: 'সরণের মান ও দিক দুটোই আছে — তাই এটি ভেক্টর রাশি।',
  },
  {
    subject: 'জীববিজ্ঞান · ১ম অধ্যায়',
    q: 'কোষের “পাওয়ার হাউস” বলা হয় কোনটি?',
    options: ['রাইবোজোম', 'মাইটোকন্ড্রিয়া', 'নিউক্লিয়াস', 'লাইসোজোম'],
    correct: 1,
    explain: 'মাইটোকন্ড্রিয়া ATP আকারে শক্তি তৈরি করে — তাই পাওয়ার হাউস।',
  },
  {
    subject: 'উচ্চতর গণিত · ত্রিকোণমিতি',
    q: 'sin ৩০° এর মান কত?',
    options: ['১', '০.৭১', '০.৫', '০.৮৬'],
    correct: 2,
    explain: 'একক বৃত্ত থেকে মনে রাখো — sin ৩০° = ০.৫।',
  },
];

const OPTION_LETTERS = ['ক', 'খ', 'গ', 'ঘ'];

const LiveExamSim: React.FC = () => {
  const reduced = usePrefersReducedMotion();
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [seconds, setSeconds] = useState(25 * 60);
  const advanceTimer = useRef<number | null>(null);

  const question = SIM_QUESTIONS[idx];

  /* countdown clock */
  useEffect(() => {
    if (reduced) return;
    const t = window.setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 25 * 60)), 1000);
    return () => window.clearInterval(t);
  }, [reduced]);

  /* auto-advance after feedback */
  useEffect(() => {
    if (picked === null) return;
    advanceTimer.current = window.setTimeout(() => {
      setPicked(null);
      setIdx((i) => (i + 1) % SIM_QUESTIONS.length);
    }, 2200);
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    };
  }, [picked]);

  const answer = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === question.correct) setScore((s) => s + 10);
  };

  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  const clock = `${bnDigits(String(mm).padStart(2, '0'))}:${bnDigits(String(ss).padStart(2, '0'))}`;

  return (
    <div className="relative">
      {/* browser-ish frame */}
      <div className="lk-card dark:bg-[#1a1613] rounded-[1.4rem] md:rounded-[1.8rem] shadow-[0_30px_80px_-30px_rgba(23,19,16,0.35)] overflow-hidden">
        {/* top bar */}
        <div className="flex items-center gap-3 px-4 md:px-5 py-3 border-b border-[#EFE7DA] dark:border-white/8 bg-[#FBF8F2] dark:bg-[#151210]">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          </div>
          <span className="lk-eng text-[11px] md:text-xs text-[#8A8074] dark:text-white/40 truncate">
            porikkhangon.app/live-exam
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[#FF5200]/10 px-2.5 py-1 text-[10px] md:text-[11px] font-bold text-[#D64500] dark:text-orange-300">
            <span className="lk-live-dot h-1.5 w-1.5 rounded-full bg-[#FF5200]" /> লাইভ
          </span>
        </div>

        <div className="p-4 md:p-6">
          {/* meta row */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-[12px] md:text-[13px] font-bold text-[#5C544B] dark:text-white/60">
              HSC · {question.subject}
            </span>
            <span className="lk-eng tabular-nums rounded-lg bg-[#171310] dark:bg-white/10 px-2.5 py-1 text-[12px] md:text-[13px] font-bold text-white">
              {clock}
            </span>
          </div>

          {/* progress */}
          <div className="mt-4 flex items-center gap-3">
            <div className="h-1.5 flex-1 rounded-full bg-[#EFE7DA] dark:bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FF5200] to-[#FF8A3D] transition-all duration-500"
                style={{ width: `${((idx + (picked !== null ? 1 : 0)) / SIM_QUESTIONS.length) * 100}%` }}
              />
            </div>
            <span className="text-[11px] md:text-[12px] font-bold text-[#8A8074] dark:text-white/40">
              প্রশ্ন {bnDigits(idx + 1)}/{bnDigits(SIM_QUESTIONS.length)}
            </span>
          </div>

          {/* question */}
          <h3 className="mt-4 text-[17px] md:text-xl font-bold leading-snug text-[#171310] dark:text-white">
            {bnDigits(idx + 1)}। {question.q}
          </h3>

          {/* options */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5" role="group" aria-label="উত্তরসমূহ">
            {question.options.map((opt, i) => {
              const isPicked = picked === i;
              const isCorrect = i === question.correct;
              const reveal = picked !== null;
              let state = 'idle';
              if (reveal && isCorrect) state = 'correct';
              else if (reveal && isPicked) state = 'wrong';
              return (
                <button
                  key={opt}
                  onClick={() => answer(i)}
                  disabled={reveal}
                  className={`lk-focus group flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left text-[13px] md:text-[15px] font-semibold transition-all duration-200 ${
                    state === 'correct'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 lk-pop'
                      : state === 'wrong'
                      ? 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 lk-shake'
                      : 'border-[#E8DDCD] dark:border-white/10 bg-white dark:bg-white/5 text-[#3A332C] dark:text-white/80 hover:border-[#FF5200]/60 hover:bg-[#FF5200]/5 active:scale-[0.98]'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 md:h-7 md:w-7 flex-shrink-0 items-center justify-center rounded-full border text-[11px] md:text-[12px] font-bold ${
                      state === 'correct'
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : state === 'wrong'
                        ? 'border-rose-500 bg-rose-500 text-white'
                        : 'border-[#D9CDBB] dark:border-white/20 text-[#8A8074] dark:text-white/50'
                    }`}
                  >
                    {OPTION_LETTERS[i]}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {state === 'correct' && <CheckCircle2 size={17} className="text-emerald-500" />}
                  {state === 'wrong' && <XCircle size={17} className="text-rose-500" />}
                </button>
              );
            })}
          </div>

          {/* feedback / hint */}
          <div className="mt-4 min-h-[46px] flex items-center">
            {picked !== null ? (
              <p className="lk-pop flex items-start gap-2 text-[12px] md:text-[13px] leading-relaxed text-[#5C544B] dark:text-white/60">
                {picked === question.correct ? (
                  <span className="mt-0.5 inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-300">
                    সঠিক +১০
                  </span>
                ) : (
                  <span className="mt-0.5 inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-300">
                    ভুল
                  </span>
                )}
                {question.explain}
              </p>
            ) : (
              <p className="text-[12px] md:text-[13px] text-[#A79C8D] dark:text-white/35">
                যেকোনো উত্তরে ট্যাপ করো — সাথে সাথে রেজাল্ট ও ব্যাখ্যা
              </p>
            )}
          </div>
        </div>

        {/* footer bar */}
        <div className="flex items-center justify-between border-t border-[#EFE7DA] dark:border-white/8 px-4 md:px-5 py-3 bg-[#FBF8F2] dark:bg-[#151210]">
          <span className="text-[11px] md:text-[12px] font-bold text-[#8A8074] dark:text-white/40">
            স্কোর <span className="lk-eng text-[#D64500] dark:text-orange-300">{bnDigits(score)}</span>
          </span>
          <span className="text-[11px] md:text-[12px] font-bold text-[#8A8074] dark:text-white/40">
            নেগেটিভ মার্কিং চালু
          </span>
        </div>
      </div>

      {/* floating proof cards */}
      <div
        className="lk-float absolute -top-6 -right-2 md:-right-8 hidden sm:block rounded-2xl border border-[#E8DDCD] dark:border-white/10 bg-white/90 dark:bg-[#1a1613]/90 backdrop-blur px-3.5 py-2.5 shadow-xl"
        style={{ ['--lk-tilt' as any]: '3deg' }}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF5200]/12 text-[#D64500] dark:text-orange-300">
            <Flame size={16} />
          </span>
          <div>
            <p className="text-[12px] md:text-[13px] font-bold text-[#171310] dark:text-white">১৪ দিনের স্ট্রিক</p>
            <p className="text-[10px] md:text-[11px] text-[#8A8074] dark:text-white/40">চর্চা থামিও না!</p>
          </div>
        </div>
      </div>
      <div
        className="lk-float-slow absolute -bottom-7 -left-2 md:-left-10 hidden sm:block rounded-2xl border border-[#E8DDCD] dark:border-white/10 bg-white/90 dark:bg-[#1a1613]/90 backdrop-blur px-3.5 py-2.5 shadow-xl"
        style={{ ['--lk-tilt' as any]: '-3deg' }}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/15 text-amber-600 dark:text-amber-300">
            <Trophy size={16} />
          </span>
          <div>
            <p className="text-[12px] md:text-[13px] font-bold text-[#171310] dark:text-white">লিডারবোর্ডে #২</p>
            <p className="text-[10px] md:text-[11px] text-[#8A8074] dark:text-white/40">এই সপ্তাহে +৩৪০ পয়েন্ট</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Hero: React.FC<{ onLoginClick: () => void }> = ({ onLoginClick }) => (
  <section id="top" className="lk-cream lk-noise relative overflow-hidden">
    <div className="lk-grid-paper absolute inset-0 pointer-events-none" aria-hidden="true" />
    <div
      className="absolute -top-32 right-[-10%] h-[420px] w-[420px] md:h-[560px] md:w-[560px] rounded-full bg-[#FF5200]/14 blur-[110px] pointer-events-none"
      aria-hidden="true"
    />
    <div
      className="absolute bottom-[-20%] left-[-8%] h-[380px] w-[380px] rounded-full bg-amber-400/12 blur-[110px] pointer-events-none"
      aria-hidden="true"
    />

    <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-8 pt-14 md:pt-24 pb-20 md:pb-28">
      <div className="grid grid-cols-1 lg:grid-cols-[1.02fr_0.98fr] gap-14 lg:gap-16 items-center">
        {/* left: copy */}
        <div className="text-center lg:text-left">
          <Reveal>
            <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E8DDCD] dark:border-white/10 bg-white/70 dark:bg-white/5 px-3.5 py-1.5 text-[12px] md:text-[13px] font-bold text-[#5C544B] dark:text-white/60">
                <Radio size={13} className="text-[#FF5200]" />
                ঢাকা থেকে রাঙামাটি — তিন লড়াই, এক অঙ্গন
              </span>
              {['SSC', 'HSC', 'Admission'].map((t) => (
                <span
                  key={t}
                  className="lk-eng rounded-full bg-[#171310] dark:bg-white/10 px-3 py-1.5 text-[11px] md:text-[12px] font-bold tracking-wide text-white"
                >
                  {t}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={90}>
            <h1 className="lk-display mt-7 text-[2.6rem] leading-[1.12] md:text-[4.2rem] md:leading-[1.06] font-bold tracking-tight text-[#171310] dark:text-white">
              পড়া মুখস্থ নয়,
              <br />
              <span className="text-[#FF5200] dark:text-orange-400">চর্চাই</span> আসল প্রস্তুতি
            </h1>
          </Reveal>

          <Reveal delay={170}>
            <p className="mt-6 mx-auto lg:mx-0 max-w-xl text-[15px] md:text-[17px] leading-relaxed text-[#5C544B] dark:text-white/60">
              ৫০,০০০+ সলভড প্রশ্ন, প্রতিদিন লাইভ মডেল টেস্ট, AI দুর্বলতা-রিপোর্ট আর বাংলায় ধাপে ধাপে
              সমাধান — SSC, HSC ও ভর্তি, তিন লড়াইয়ের একটাই অঙ্গন।
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3">
              <button
                onClick={onLoginClick}
                className="lk-focus group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FF5200] px-7 py-4 text-[15px] md:text-base font-bold text-white shadow-[0_18px_40px_-14px_rgba(255,82,0,0.55)] transition-all hover:bg-[#E64A00] hover:-translate-y-0.5 active:scale-[0.98]"
              >
                ফ্রিতে চর্চা শুরু করো
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => scrollToId('showcase')}
                className="lk-focus group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-[#E0D5C3] dark:border-white/12 bg-white/70 dark:bg-white/5 px-7 py-4 text-[15px] md:text-base font-bold text-[#3A332C] dark:text-white/85 transition-all hover:border-[#FF5200]/50 hover:text-[#D64500] dark:hover:text-orange-300 active:scale-[0.98]"
              >
                <Play size={17} className="text-[#FF5200]" />
                ২ মিনিটের ডেমো
              </button>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className="mt-9 flex flex-col sm:flex-row items-center lg:items-start gap-4">
              <div className="flex -space-x-2.5">
                {['ত', 'স', 'ম', 'র', 'ন'].map((m) => (
                  <Monogram key={m} label={m} className="h-8 w-8 md:h-9 md:w-9 text-[12px]" />
                ))}
              </div>
              <p className="text-[13px] md:text-[14px] font-semibold text-[#5C544B] dark:text-white/55 text-center lg:text-left">
                প্রতিদিন হাজারো শিক্ষার্থী চর্চা করছে এখানে
                <span className="mx-2 text-[#C9BDA9] dark:text-white/20">·</span>
                কার্ড লাগবে না
              </p>
            </div>
          </Reveal>
        </div>

        {/* right: live simulator */}
        <Reveal delay={150} y={30} className="relative">
          <LiveExamSim />
        </Reveal>
      </div>
    </div>
  </section>
);

export default Hero;
