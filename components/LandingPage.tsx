import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence, useInView } from 'motion/react';
import {
  ArrowRight, ArrowUpRight, Play, Star, Check, X, Lightbulb, ChevronRight,
  Flame, Trophy, Medal, Target, BotMessageSquare, Swords,
  CalendarCheck, Users, Timer, ShieldCheck, Sparkles, Menu,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   পরীক্ষাঙ্গন — Landing (brand: #ff5200)
   Public logged-out page; feature CTAs funnel to /auth
   ───────────────────────────────────────────── */

const EASE = [0.16, 1, 0.3, 1] as const;

const toBn = (s: string) => s.replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

interface LandingPageProps { onLoginClick: () => void }

/* ── Crawler-friendly counter (starts at final value, animates in browsers) ── */
const BnCounter = ({ end, suffix = '', duration = 1600 }: { end: number; duration?: number; suffix?: string }) => {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(end);
  useEffect(() => {
    if (!inView || typeof window.requestAnimationFrame !== 'function') return;
    let raf = 0;
    let start: number | null = null;
    const step = (t: number) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * end));
      if (p < 1) raf = window.requestAnimationFrame(step);
    };
    setVal(0);
    raf = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(raf);
  }, [inView, end, duration]);
  return <span ref={ref}>{toBn(val.toLocaleString('en-IN'))}{suffix}</span>;
};

/* ── Reveal on scroll ── */
const Reveal = ({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 26, filter: 'blur(5px)' }}
    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.8, delay, ease: EASE }}
  >
    {children}
  </motion.div>
);

/* ══════════ Interactive question demo ══════════ */
const demoQuestions = [
  {
    tag: 'পদার্থবিজ্ঞান · HSC',
    q: 'নিচের কোনটি ভেক্টর রাশি?',
    options: ['দ্রুতি', 'দূরত্ব', 'তাপমাত্রা', 'কাজ'],
    answer: 0,
    why: 'দ্রুতির মান ও দিক উভয়ই আছে — তাই এটি ভেক্টর রাশি।',
  },
  {
    tag: 'রসায়ন · অ্যাসিড-ক্ষার',
    q: 'pH = 4 দ্রবণে H⁺ আয়নের ঘনমাত্রা কত?',
    options: ['10⁻³ M', '10⁻⁴ M', '10⁻⁵ M', '4 M'],
    answer: 1,
    why: 'pH = −log[H⁺], তাই [H⁺] = 10⁻⁴ মোল/লিটার।',
  },
  {
    tag: 'Admission · English',
    q: 'Choose the correct synonym of “Candid” —',
    options: ['Rude', 'Frank', 'Silent', 'Clever'],
    answer: 1,
    why: 'Candid অর্থ স্পষ্টভাষী (frank) — ঢাবি ক-ইউনিট ২০২২-২৩।',
  },
];
const LETTERS = ['ক', 'খ', 'গ', 'ঘ'];

const QuestionDemo = () => {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const q = demoQuestions[idx];
  const answered = picked !== null;
  const correct = picked === q.answer;

  const next = () => {
    setStreak((s) => s + 1);
    setIdx((i) => (i + 1) % demoQuestions.length);
    setPicked(null);
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white text-left shadow-[0_30px_70px_-28px_rgba(22,18,16,0.35)] ring-1 ring-black/10">
      <div className="flex items-center justify-between border-b border-black/5 px-5 py-3.5">
        <span className="rounded-lg bg-[#161210] px-2.5 py-1 font-display text-[11px] font-bold uppercase tracking-wider text-[#ffb92e]">
          লাইভ ট্রাই করো
        </span>
        <span className="text-[12px] font-semibold text-stone-500">{q.tag}</span>
      </div>
      <div className="px-5 py-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <p className="font-tiro text-[19px] font-bold leading-snug text-[#161210]">
              {idx + 1}. {q.q}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {q.options.map((opt, i) => {
                const isAns = i === q.answer;
                const isPick = i === picked;
                const cls = !answered
                  ? 'border-black/10 bg-white hover:border-brand-orange/50 hover:bg-[#ffede3] hover:shadow-[0_10px_24px_-12px_rgba(255,82,0,0.35)]'
                  : isAns
                    ? 'border-brand-orange bg-[#ffede3] shadow-[0_10px_26px_-12px_rgba(255,82,0,0.45)]'
                    : isPick
                      ? 'border-red-500/60 bg-red-50'
                      : 'border-black/10 bg-white opacity-45';
                return (
                  <button
                    key={opt}
                    disabled={answered}
                    onClick={() => setPicked(i)}
                    className={`group flex items-center gap-2.5 rounded-2xl border px-3.5 py-3 text-left transition-all duration-300 ${cls}`}
                  >
                    <span
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg font-tiro text-[13px] font-bold transition-colors ${
                        answered && isAns
                          ? 'bg-brand-orange text-white'
                          : answered && isPick
                            ? 'bg-red-500 text-white'
                            : 'bg-black/5 text-stone-500 group-hover:bg-brand-orange group-hover:text-white'
                      }`}
                    >
                      {answered && isAns ? <Check className="h-4 w-4" strokeWidth={3} /> : answered && isPick ? <X className="h-4 w-4" strokeWidth={3} /> : LETTERS[i]}
                    </span>
                    <span className="text-[14px] font-semibold text-[#161210]">{opt}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="border-t border-black/5 px-5 py-3.5">
        <AnimatePresence mode="wait">
          {answered ? (
            <motion.div
              key="sol"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="flex items-center justify-between gap-3 overflow-hidden"
            >
              <div className="flex items-start gap-2.5">
                <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${correct ? 'bg-brand-orange' : 'bg-red-500'} text-white`}>
                  {correct ? <Check className="h-3.5 w-3.5" strokeWidth={3.5} /> : <X className="h-3.5 w-3.5" strokeWidth={3.5} />}
                </span>
                <div>
                  <p className={`text-[12.5px] font-bold ${correct ? 'text-brand-orange' : 'text-red-500'}`}>
                    {correct ? 'একদম ঠিক!' : 'ভুল হয়েছে — সঠিকটা দেখো'}
                  </p>
                  <p className="mt-0.5 flex items-start gap-1.5 text-[12px] leading-relaxed text-stone-500">
                    <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ffb92e]" />
                    {q.why}
                  </p>
                </div>
              </div>
              <button
                onClick={next}
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#161210] px-4 py-2 text-[12.5px] font-bold text-white transition-transform hover:scale-105"
              >
                পরের প্রশ্ন <ChevronRight className="h-4 w-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-between">
              <p className="text-[12px] font-medium text-stone-500">
                যেকোনো উত্তরে ট্যাপ করো — <span className="font-bold text-brand-orange">সাথে সাথে রেজাল্ট</span>
              </p>
              <div className="flex gap-1.5" aria-hidden="true">
                {demoQuestions.map((_, i) => (
                  <span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === idx ? 'w-5 bg-brand-orange' : 'w-1.5 bg-black/15'}`} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <span className="sr-only">{`এ পর্যন্ত ${streak} টি প্রশ্ন সমাধান করেছেন`}</span>
      </div>
    </div>
  );
};

/* ══════════ Data ══════════ */
const subjects = ['পদার্থবিজ্ঞান', 'রসায়ন', 'উচ্চতর গণিত', 'জীববিজ্ঞান', 'বাংলা', 'ইংরেজি', 'ICT', 'সাধারণ জ্ঞান', 'এইচএসসি', 'ঢাবি ক-খ-গ', 'মেডিকেল', 'GST ক্লাস্টার'];

const stats = [
  { end: 240, suffix: ' হাজার+', label: 'সক্রিয় শিক্ষার্থী' },
  { end: 120, suffix: ' হাজার+', label: 'সলভড প্রশ্ন' },
  { end: 38, suffix: ' লাখ+', label: 'মক এক্সাম সম্পন্ন' },
];

const features = [
  {
    icon: Target,
    title: 'প্রশ্ন ব্যাংক',
    desc: 'অধ্যায়ভিত্তিক ১ লাখ+ প্রশ্ন — বোর্ড, টেস্ট পেপার আর অ্যাডমিশন স্ট্যান্ডার্ডে সাজানো।',
    tag: '/qbank',
    chips: ['১,২০,০০০+ প্রশ্ন', 'ব্যাখ্যাসহ সমাধান'],
  },
  {
    icon: Timer,
    title: 'মক ও মডেল টেস্ট',
    desc: 'টাইমার, নেগেটিভ মার্কিং, instant রেজাল্ট — রিয়েল এক্সাম হলের পুরো অনুভূতি।',
    tag: '/exams',
    chips: ['লাইভ মক', 'জাতীয় মেধা তালিকা'],
  },
  {
    icon: BotMessageSquare,
    title: 'পরীক্ষাঙ্গন AI টিউটর',
    desc: 'আটকে গেলে প্রশ্নের ছবি তুলো — ধাপে ধাপে বাংলা ব্যাখ্যা সেকেন্ডেই।',
    tag: '/bot',
    chips: ['২৪/৭ ডাউট সলভিং', 'ফটো → সমাধান'],
  },
  {
    icon: Swords,
    title: 'কুইজ ব্যাটল',
    desc: 'বন্ধুকে ১v১ চ্যালেঞ্জে ডাকো — পয়েন্ট জিতে নাম তোলো জাতীয় বোর্ডে।',
    tag: '/battle',
    chips: ['রিয়েল-টাইম ব্যাটল', 'রিভ্যাঞ্চ মোড'],
  },
  {
    icon: Trophy,
    title: 'লিডারবোর্ড ও স্ট্রিক',
    desc: 'দেশজুড়ে র‍্যাংক, দৈনিক স্ট্রিক আর ব্যাজ — প্রস্তুতি হোক প্রতিদিনের অভ্যাস।',
    tag: '/leaderboard',
    chips: ['সাপ্তাহিক রিসেট', 'ব্যাজ কালেকশন'],
  },
  {
    icon: CalendarCheck,
    title: 'স্টাডি প্ল্যানার',
    desc: 'পরীক্ষার দিনক্ষণ দাও — অ্যাপ নিজে সাজিয়ে দেবে কোন অধ্যায় কবে পড়বে।',
    tag: '/planner',
    chips: ['অটো রিভিশন', 'ডেইলি টার্গেট'],
  },
];

const steps = [
  { n: '০১', t: 'ফ্রিতে অ্যাকাউন্ট খোলো', d: 'মোবাইল নম্বর বা ইমেইল — ৩০ সেকেন্ডেই ঢুকে যাবে অঙ্গনে।', icon: Users },
  { n: '০২', t: 'দুর্বলতা বুঝে নাও', d: 'প্রথম কয়েকটা মক দিলেই অ্যানালিটিক্স বলে দেবে কোথায় হারাচ্ছে নম্বর।', icon: Medal },
  { n: '০৩', t: 'দিনে দিনে এগিয়ে যাও', d: 'স্ট্রিক ধরো, ব্যাটল জিতো — পরীক্ষার আগে syllabus শেষ।', icon: Trophy },
];

/* ══════════ Main ══════════ */
const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    fn();
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#faf9f6] font-sans text-[#161210] antialiased">
      <Helmet>
        <title>পরীক্ষাঙ্গন — HSC ও Admission প্রস্তুতির স্মার্ট অঙ্গন</title>
        <meta
          name="description"
          content="১ লাখ+ সলভড প্রশ্ন, লাইভ মক এক্সাম, AI টিউটর আর কুইজ ব্যাটল — HSC ও বিশ্ববিদ্যালয় ভর্তি প্রস্তুতির সবকিছু এক প্ল্যাটফর্মে।"
        />
      </Helmet>

      <style>{`
        @keyframes pk-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes pk-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        .pk-marquee { animation: pk-marquee 36s linear infinite; }
        .pk-float { animation: pk-float 7s ease-in-out infinite; }
        .pk-float-slow { animation: pk-float 10s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .pk-marquee, .pk-float, .pk-float-slow { animation: none !important; } }
      `}</style>

      {/* ══ Navbar ══ */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/70 shadow-[0_12px_40px_-20px_rgba(22,18,16,0.25)] backdrop-blur-xl' : 'bg-transparent'}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <a href="/" className="flex items-center gap-2.5" aria-label="পরীক্ষাঙ্গন হোম">
            <img src="/Pshape.svg" alt="" className="h-9 w-9 rounded-xl" />
            <span className="font-tiro text-[21px] font-bold tracking-tight">পরীক্ষাঙ্গন</span>
          </a>
          <nav className="hidden items-center gap-7 text-[14px] font-semibold text-stone-500 md:flex" aria-label="প্রধান">
            <a href="#features" className="transition-colors hover:text-[#161210]">ফিচার</a>
            <a href="#how" className="transition-colors hover:text-[#161210]">কীভাবে কাজ করে</a>
            <a href="#stats" className="transition-colors hover:text-[#161210]">রেজাল্ট</a>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <button onClick={onLoginClick} className="rounded-full px-4 py-2 text-[14px] font-bold text-stone-500 transition-colors hover:text-brand-orange">
              লগইন
            </button>
            <button
              onClick={onLoginClick}
              className="group inline-flex items-center gap-2 rounded-full bg-[#161210] px-5 py-2.5 text-[14px] font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-orange hover:shadow-[0_16px_34px_-12px_rgba(224,68,0,0.5)]"
            >
              শুরু করো
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="grid h-10 w-10 place-items-center rounded-full bg-white ring-1 ring-black/10 md:hidden" aria-label="মেনু" aria-expanded={mobileOpen}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="mx-4 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-black/10 md:hidden"
              aria-label="মোবাইল"
            >
              <a href="#features" onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 text-[15px] font-bold hover:bg-[#faf9f6]">ফিচার</a>
              <a href="#how" onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 text-[15px] font-bold hover:bg-[#faf9f6]">কীভাবে কাজ করে</a>
              <a href="#stats" onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 text-[15px] font-bold hover:bg-[#faf9f6]">রেজাল্ট</a>
              <button onClick={onLoginClick} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#161210] py-3 text-[15px] font-bold text-white">
                ফ্রিতে শুরু করো <ArrowRight className="h-4 w-4" />
              </button>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* ══ Hero — no grid, editorial ══ */}
      <section className="relative overflow-hidden pt-32 sm:pt-36">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,82,0,0.11),transparent)] blur-3xl" />
          <div className="absolute right-[-140px] top-48 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(255,185,46,0.18),transparent)] blur-3xl" />
          <span
            className="absolute left-1/2 top-[62%] -translate-x-1/2 select-none whitespace-nowrap font-tiro font-bold leading-none"
            style={{ fontSize: '20vw', WebkitTextStroke: '1.5px rgba(22,18,16,0.05)', color: 'transparent' }}
          >
            পরীক্ষাঙ্গন
          </span>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[13.5px] font-semibold text-stone-500"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" aria-hidden="true" />
            HSC ও Admission প্রস্তুতির AI প্ল্যাটফর্ম
            <span className="hidden h-px w-10 bg-black/20 sm:block" aria-hidden="true" />
            <span className="font-display text-[12px] font-bold uppercase tracking-[0.22em]">প্রশ্নব্যাংক · মক · AI টিউটর · ব্যাটল</span>
          </motion.p>

          <h1 className="mt-6 text-center font-tiro font-bold leading-[1.14] tracking-[-0.01em]">
            <span className="block overflow-hidden pb-2">
              <motion.span
                initial={{ y: '112%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 1, delay: 0.15, ease: EASE }}
                className="block text-[13vw] sm:text-[10vw] lg:text-[76px]"
              >
                চর্চাই জয়ের
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-3">
              <motion.span
                initial={{ y: '112%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 1, delay: 0.28, ease: EASE }}
                className="block text-[13vw] sm:text-[10vw] lg:text-[76px]"
              >
                সবচেয়ে বড়{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-[#e04400] via-brand-orange to-[#ff7a35] bg-clip-text text-transparent">অঙ্গন</span>
                  <svg viewBox="0 0 220 24" className="absolute -bottom-1 left-0 w-full sm:-bottom-2" aria-hidden="true">
                    <motion.path
                      d="M8 16 C 66 8, 152 6, 212 14"
                      fill="none"
                      stroke="#ff5200"
                      strokeWidth="7"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 1.1, ease: EASE }}
                    />
                  </svg>
                </span>
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
            className="mx-auto mt-5 max-w-2xl text-balance text-center text-[16px] leading-relaxed text-stone-500 sm:text-[17px]"
          >
            প্রশ্ন ব্যাংক, লাইভ মক, AI টিউটর আর কুইজ ব্যাটল — সব মিলিয়ে একটাই লক্ষ্য:
            <span className="font-bold text-[#161210]"> পরীক্ষা হলে তোমার নিজের সেরা ভার্সন।</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65, ease: EASE }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <button
              onClick={onLoginClick}
              className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-[#161210] px-8 py-4 text-[16px] font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-brand-orange hover:shadow-[0_22px_44px_-14px_rgba(224,68,0,0.55)] sm:w-auto"
            >
              ফ্রিতে চর্চা শুরু করো
              <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-orange text-white transition-transform duration-300 group-hover:translate-x-1">
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
            </button>
            <a
              href="#features"
              className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-white/80 px-8 py-4 text-[16px] font-bold ring-1 ring-black/10 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:ring-brand-orange/40 sm:w-auto"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-orange text-white">
                <Play className="h-3.5 w-3.5" fill="currentColor" />
              </span>
              ফিচারগুলো দেখো
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.75 }}
            className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13.5px] font-semibold text-stone-500"
          >
            <span className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 text-[#ffb92e]" fill="currentColor" />
              ))}
              <span className="font-display font-bold text-[#161210]">4.9</span>
            </span>
            <span className="h-4 w-px bg-black/15" aria-hidden="true" />
            <span>
              <b className="text-[#161210]">{toBn('2,40,000+')}</b> শিক্ষার্থীর প্রতিদিনের অঙ্গন
            </span>
          </motion.div>

          {/* Demo card + floating chips */}
          <div className="relative mx-auto mt-14 max-w-3xl sm:mt-16">
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.7, ease: EASE }}
              className="relative"
            >
              <div className="absolute -inset-x-8 -top-8 bottom-1/3 rounded-[40px] bg-[radial-gradient(50%_60%_at_50%_0%,rgba(255,82,0,0.15),transparent)] blur-2xl" aria-hidden="true" />
              <QuestionDemo />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: -5 }}
              transition={{ duration: 0.6, delay: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="pk-float absolute -left-3 top-8 z-10 hidden md:block lg:-left-16"
            >
              <div className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-[0_18px_40px_-16px_rgba(22,18,16,0.4)] ring-1 ring-black/5 backdrop-blur">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff1d6] text-[#ffb92e]">
                  <Flame className="h-5 w-5" fill="currentColor" />
                </span>
                <div>
                  <p className="font-display text-[15px] font-bold leading-none">১৪ দিন</p>
                  <p className="mt-1 text-[11px] font-semibold text-stone-500">লাগাতার স্ট্রিক</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.7, rotate: 8 }}
              animate={{ opacity: 1, scale: 1, rotate: 4 }}
              transition={{ duration: 0.6, delay: 1.65, ease: [0.34, 1.56, 0.64, 1] }}
              className="pk-float-slow absolute -right-3 bottom-10 z-10 hidden md:block lg:-right-14"
            >
              <div className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-[0_18px_40px_-16px_rgba(22,18,16,0.4)] ring-1 ring-black/5 backdrop-blur">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-orange/10 text-brand-orange">
                  <Trophy className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[13px] font-bold">জাতীয় মেধা তালিকা</p>
                  <p className="mt-0.5 font-display text-[14px] font-bold text-brand-orange">#২ সাপ্তাহিক</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Subject marquee */}
        <div className="relative mt-16 border-y border-black/5 bg-white/60 py-4 backdrop-blur sm:mt-20">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#faf9f6] to-transparent" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#faf9f6] to-transparent" aria-hidden="true" />
          <div className="pk-marquee flex w-max">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
                {subjects.map((s) => (
                  <span key={s + dup} className="flex items-center gap-5 pr-5 text-[14px] font-bold text-stone-400">
                    {s}
                    <Sparkles className="h-3.5 w-3.5 text-brand-orange/50" fill="currentColor" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Stats band ══ */}
      <section id="stats" className="px-4 py-16 sm:px-6">
        <Reveal>
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-[#161210] px-6 py-10 shadow-[0_40px_80px_-40px_rgba(22,18,16,0.8)] sm:rounded-[36px] sm:px-12 sm:py-12">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-orange/30 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-[#ffb92e]/15 blur-3xl" aria-hidden="true" />
            <div className="relative grid grid-cols-2 gap-y-10 lg:grid-cols-3">
              {stats.map((s, i) => (
                <div key={s.label} className={`flex flex-col items-center text-center ${i > 0 ? 'border-l border-white/10' : ''}`}>
                  <span className="font-tiro text-[38px] font-bold leading-none text-[#ffb92e] sm:text-[48px]">
                    <BnCounter end={s.end} suffix={s.suffix} />
                  </span>
                  <p className="mt-3 text-[13.5px] font-semibold text-white/85">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ══ Features ══ */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
          <Reveal className="max-w-xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#ffede3] px-4 py-1.5 text-[12.5px] font-bold text-brand-orange ring-1 ring-brand-orange/15">
              <Sparkles className="h-3.5 w-3.5" /> যা যা আছে অঙ্গনে
            </p>
            <h2 className="mt-5 font-tiro text-[30px] font-bold leading-[1.15] tracking-[-0.01em] sm:text-[42px]">
              এত কিছুর মাঝেও,
              <br />
              <span className="bg-gradient-to-r from-[#e04400] to-[#ff7a35] bg-clip-text text-transparent">খুঁজে পাবে ঠিক তোমারটা।</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12} className="max-w-md">
            <p className="text-[15px] leading-relaxed text-stone-500">
              প্রতিটা টুল তৈরি হয়েছে শিক্ষার্থীদের রিয়েল ব্যবহার দেখে — গিমিক নয়, যা স্কোরে কাজ দেয় শুধু তাই।
            </p>
          </Reveal>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={0.06 * (i % 3)}>
              <motion.button
                onClick={onLoginClick}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="group flex h-full w-full flex-col rounded-[24px] bg-white p-6 text-left ring-1 ring-black/8 transition-shadow duration-500 hover:shadow-[0_28px_56px_-28px_rgba(255,82,0,0.35)] hover:ring-brand-orange/30"
              >
                <div className="flex items-start justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#ffede3] text-brand-orange ring-1 ring-brand-orange/15 transition-colors duration-500 group-hover:bg-[#161210] group-hover:text-[#ffb92e]">
                    <f.icon className="h-6 w-6" />
                  </span>
                  <span className="flex items-center gap-1 font-display text-[11px] font-bold uppercase tracking-wider text-stone-400 transition-colors group-hover:text-brand-orange">
                    {f.tag}
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
                <h3 className="mt-4 font-tiro text-[20px] font-bold">{f.title}</h3>
                <p className="mt-2 flex-1 text-[14px] leading-relaxed text-stone-500">{f.desc}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {f.chips.map((c) => (
                    <span key={c} className="rounded-full bg-[#faf9f6] px-2.5 py-1 text-[11px] font-bold text-stone-500 ring-1 ring-black/8 transition-colors group-hover:bg-[#ffede3] group-hover:text-brand-orange">
                      {c}
                    </span>
                  ))}
                </div>
              </motion.button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══ How it works ══ */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <Reveal className="mx-auto max-w-xl text-center">
          <h2 className="font-tiro text-[30px] font-bold leading-[1.15] sm:text-[42px]">
            মাত্র <span className="bg-gradient-to-r from-[#e04400] to-[#ff7a35] bg-clip-text text-transparent">তিনটা স্টেপে</span> শুরু
          </h2>
          <p className="mt-3 text-[15px] text-stone-500">কোনো লম্বা ফর্ম, কোনো কার্ড — কিছুই লাগবে না।</p>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1}>
              <div className="relative h-full rounded-[24px] bg-white p-6 ring-1 ring-black/8">
                <span className="pointer-events-none absolute right-5 top-4 select-none font-display text-[52px] font-extrabold leading-none text-brand-orange/10" aria-hidden="true">
                  {s.n}
                </span>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#161210] text-[#ffb92e]">
                  <s.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-tiro text-[19px] font-bold">{s.t}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-stone-500">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="px-4 pb-20 pt-4 sm:px-6">
        <Reveal>
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-[#161210] text-center shadow-[0_56px_110px_-50px_rgba(22,18,16,0.9)] sm:rounded-[40px]">
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
              style={{ background: 'conic-gradient(from 90deg, rgba(255,82,0,0), rgba(255,82,0,0.4), rgba(255,185,46,0.3), rgba(255,82,0,0))' }}
              aria-hidden="true"
            />
            <div className="relative px-6 py-20 sm:px-12 sm:py-24">
              <p className="mx-auto inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11.5px] font-bold uppercase tracking-[0.2em] text-[#ffb92e] ring-1 ring-white/15">
                <ShieldCheck className="h-3.5 w-3.5" /> ফ্রি প্ল্যান চিরকাল ফ্রি
              </p>
              <h2 className="mx-auto mt-6 max-w-2xl text-balance font-tiro text-[32px] font-bold leading-[1.15] text-white sm:text-[52px]">
                আজ রাতেই প্রথম
                <br />
                প্রশ্নটা <span className="bg-gradient-to-r from-[#ffb92e] to-brand-orange bg-clip-text text-transparent">শেষ করো।</span>
              </h2>
              <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/60">
                আগামীকাল সকালে তুমি আজকের চেয়ে এগিয়ে থাকবে — এটাই প্রতিজ্ঞা।
              </p>
              <button
                onClick={onLoginClick}
                className="group mt-8 inline-flex items-center gap-2.5 rounded-full bg-[#ffb92e] px-9 py-4 text-[16px] font-extrabold text-[#161210] shadow-[0_24px_50px_-16px_rgba(255,185,46,0.6)] transition-all duration-300 hover:-translate-y-1"
              >
                অ্যাকাউন্ট খোলো — ফ্রি
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={3} />
              </button>
              <p className="mt-5 text-[12.5px] font-medium text-white/40">কোনো কার্ড লাগবে না · যেকোনো সময় বাতিল</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ══ Footer strip ══ */}
      <footer className="border-t border-black/5 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-[13px] font-semibold text-stone-400 sm:flex-row sm:px-6">
          <p className="flex items-center gap-2">
            <img src="/Pshape.svg" alt="" className="h-6 w-6 rounded-md" />
            © {toBn('২০২৬')} পরীক্ষাঙ্গন — ঢাকায় তৈরি
          </p>
          <nav className="flex items-center gap-5" aria-label="লিগ্যাল">
            <Link to="/privacy" className="transition-colors hover:text-[#161210]">প্রাইভেসি</Link>
            <Link to="/terms" className="transition-colors hover:text-[#161210]">টার্মস</Link>
            <Link to="/refund" className="transition-colors hover:text-[#161210]">রিফান্ড</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
