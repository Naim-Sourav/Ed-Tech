import React, { useEffect, useState } from 'react';
import { Radio, BrainCircuit, Library, Archive, Swords, Download, Users } from 'lucide-react';
import { Reveal, SectionHead, bnDigits, useInView, usePrefersReducedMotion } from './primitives';

/* ------------------------------------------------------------------ */
/*  FEATURES — bento grid where every card contains a tiny LIVE        */
/*  product visual instead of a static icon.                           */
/* ------------------------------------------------------------------ */

/* -- 1. live model test visual: OMR bubbles + ticking timer --------- */
const LiveTestVisual: React.FC = () => {
  const reduced = usePrefersReducedMotion();
  const [sec, setSec] = useState(12 * 60 + 44);
  const [filled, setFilled] = useState<number[]>([1, 2, 4, 5, 8, 9, 10]);
  useEffect(() => {
    if (reduced) return;
    const t = window.setInterval(() => {
      setSec((s) => (s > 0 ? s - 1 : 25 * 60));
      setFilled((f) => {
        const next = f.length >= 15 ? [1] : [...f, f.length + 1];
        return next;
      });
    }, 1400);
    return () => window.clearInterval(t);
  }, [reduced]);
  const mm = String(Math.floor(sec / 60)).padStart(2, '0');
  const ss = String(sec % 60).padStart(2, '0');
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF5200]/15 px-2.5 py-1 text-[10px] md:text-[11px] font-bold text-orange-300">
          <span className="lk-live-dot h-1.5 w-1.5 rounded-full bg-[#FF5200]" /> চলমান
        </span>
        <span className="lk-eng tabular-nums text-[13px] md:text-[15px] font-bold text-white">
          {bnDigits(mm)}:{bnDigits(ss)}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-8 gap-1.5 md:gap-2" aria-hidden="true">
        {Array.from({ length: 16 }, (_, i) => (
          <span
            key={i}
            className={`flex h-6 md:h-7 items-center justify-center rounded-full text-[10px] md:text-[11px] font-bold transition-colors duration-300 ${
              filled.includes(i + 1)
                ? 'bg-[#FF5200] text-white'
                : 'border border-white/15 text-white/40'
            }`}
          >
            {bnDigits(i + 1)}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-[11px] md:text-[12px] font-semibold text-white/50">
        <span className="inline-flex items-center gap-1.5">
          <Users size={13} className="text-orange-300" /> হাজারো শিক্ষার্থী একই এক্সামে
        </span>
        <span>OMR স্টাইল</span>
      </div>
    </div>
  );
};

/* -- 2. AI weakness report: animated bars --------------------------- */
const AIReportVisual: React.FC = () => {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const rows = [
    { t: 'গতি', v: 86 },
    { t: 'বল', v: 38 },
    { t: 'শক্তি', v: 71 },
    { t: 'তাপ', v: 64 },
  ];
  return (
    <div ref={ref} className="space-y-2.5">
      {rows.map((r, i) => (
        <div key={r.t} className="flex items-center gap-3">
          <span className="w-12 flex-shrink-0 text-[12px] font-bold text-white/70">{r.t}</span>
          <div className="h-2 flex-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full ${r.v < 50 ? 'bg-rose-400' : 'bg-emerald-400'} ${inView ? 'lk-bar-grow' : ''}`}
              style={{ width: `${r.v}%`, animationDelay: `${i * 120}ms` }}
            />
          </div>
          <span className="lk-eng w-9 text-right text-[12px] font-bold text-white/60 tabular-nums">{bnDigits(r.v)}%</span>
        </div>
      ))}
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#FF5200]/15 px-2.5 py-1.5 text-[11px] font-bold text-orange-300">
        <BrainCircuit size={13} /> “বল” অধ্যায়ের রিভিশন প্ল্যান তৈরি
      </div>
    </div>
  );
};

/* -- 3. smart question bank rows ------------------------------------ */
const BankVisual: React.FC = () => {
  const rows = [
    { s: 'গণিত', c: 'সেট ও ফাংশন · MCQ', n: '৮২টি' },
    { s: 'ICT', c: 'নেটওয়ার্কিং · MCQ', n: '৪০টি' },
    { s: 'English', c: 'Right form of verbs', n: '৬১৫টি' },
  ];
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.s} className="flex items-center justify-between rounded-xl border border-[#E8DDCD] dark:border-white/10 bg-white dark:bg-white/5 px-3.5 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold text-[#171310] dark:text-white">
              <span className="text-[#D64500] dark:text-orange-300">{r.s}</span>
              <span className="mx-1.5 text-[#D9CDBB] dark:text-white/20">·</span>
              <span className="text-[#5C544B] dark:text-white/60">{r.c}</span>
            </p>
          </div>
          <span className="lk-eng ml-3 flex-shrink-0 text-[12px] font-bold text-[#8A8074] dark:text-white/40">{r.n}</span>
        </div>
      ))}
    </div>
  );
};

/* -- 4. board archive year chips ------------------------------------ */
const ArchiveVisual: React.FC = () => {
  const years = ['২০১৫', '২০১৭', '২০১৯', '২০২১', '২০২৩', '২০২৫'];
  return (
    <div>
      <div className="relative flex items-center justify-between">
        <span className="absolute left-0 right-0 top-1/2 h-px bg-[#E8DDCD] dark:bg-white/12" aria-hidden="true" />
        {years.map((y, i) => (
          <span
            key={y}
            className={`relative z-10 rounded-full px-2.5 py-1.5 text-[11px] md:text-[12px] font-bold transition-colors ${
              i === years.length - 1
                ? 'bg-[#FF5200] text-white shadow-[0_8px_20px_-8px_rgba(255,82,0,0.7)]'
                : 'border border-[#E8DDCD] dark:border-white/12 bg-white dark:bg-[#1a1613] text-[#5C544B] dark:text-white/60'
            }`}
          >
            {y}
          </span>
        ))}
      </div>
      <p className="mt-4 text-[12px] md:text-[13px] leading-relaxed text-[#8A8074] dark:text-white/40">
        প্রতিটি প্রশ্নে বোর্ড-স্ট্যান্ডার্ড সমাধান ও মার্কিং হিন্টস।
      </p>
    </div>
  );
};

/* -- 5. battle scores ------------------------------------------------ */
const BattleVisual: React.FC = () => (
  <div className="space-y-2">
    {[
      { n: 'তুমি', p: 2715, me: true },
      { n: 'সাদিয়া', p: 2840, me: false },
      { n: 'মেহরাব', p: 2690, me: false },
    ].map((r) => (
      <div
        key={r.n}
        className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 border ${
          r.me
            ? 'border-[#FF5200]/50 bg-[#FF5200]/10'
            : 'border-[#E8DDCD] dark:border-white/10 bg-white dark:bg-white/5'
        }`}
      >
        <span className="text-[13px] font-bold text-[#171310] dark:text-white">{r.n}</span>
        <span className="lk-eng text-[13px] font-bold tabular-nums text-[#5C544B] dark:text-white/60">{bnDigits(r.p)}</span>
      </div>
    ))}
  </div>
);

/* -- 6. offline pack + bangla solution -------------------------------- */
const OfflineVisual: React.FC = () => (
  <div className="flex flex-col md:flex-row gap-3">
    <div className="flex-1 rounded-xl border border-white/10 bg-white/5 p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-[12px] md:text-[13px] font-bold text-white">পদার্থ অধ্যায় ১–৩</span>
        <Download size={14} className="text-orange-300" />
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full w-4/5 rounded-full bg-emerald-400" />
      </div>
      <p className="mt-2 text-[11px] font-semibold text-emerald-300">ডাউনলোড সম্পন্ন</p>
    </div>
    <div className="flex-1 rounded-xl border border-white/10 bg-white/5 p-3.5">
      <p className="text-[12px] md:text-[13px] font-bold text-white">সমাধান — বাংলায়</p>
      <div className="mt-2.5 space-y-1.5" aria-hidden="true">
        <div className="h-1.5 w-full rounded-full bg-white/15" />
        <div className="h-1.5 w-5/6 rounded-full bg-white/15" />
        <div className="h-1.5 w-2/3 rounded-full bg-white/15" />
      </div>
      <p className="mt-2 text-[11px] font-semibold text-white/45">চিত্রসহ ধাপে ধাপে ব্যাখ্যা</p>
    </div>
  </div>
);

type Card = {
  icon: React.ReactNode;
  title: string;
  desc: string;
  visual: React.ReactNode;
  span: string;
  dark?: boolean;
};

const CARDS: Card[] = [
  {
    icon: <Radio size={16} />,
    title: 'লাইভ মডেল টেস্ট',
    desc: 'রিয়েল এক্সামের ইন্টারফেস, টাইমার আর OMR-স্টাইল বাবল — প্রতিদিন হাজারো শিক্ষার্থীর সাথে একই এক্সামে বসো, সাথে সাথে রেজাল্ট ও মেধা পজিশন।',
    visual: <LiveTestVisual />,
    span: 'md:col-span-4',
    dark: true,
  },
  {
    icon: <BrainCircuit size={16} />,
    title: 'AI দুর্বলতা রিপোর্ট',
    desc: 'প্রতিটি ভুল থেকে AI বের করে কোন অধ্যায়ের কোন টপিকে তুমি পিছিয়ে — তারপর সাজিয়ে দেয় পার্সোনাল রিভিশন প্ল্যান।',
    visual: <AIReportVisual />,
    span: 'md:col-span-2',
    dark: true,
  },
  {
    icon: <Library size={16} />,
    title: 'স্মার্ট প্রশ্নব্যাংক',
    desc: 'অধ্যায়, টপিক ও কঠিনতা অনুযায়ী সাজানো প্রশ্ন — যেটা একবার পেরেছ, সেটা আর ঘুরিয়ে দেখায় না।',
    visual: <BankVisual />,
    span: 'md:col-span-2',
  },
  {
    icon: <Archive size={16} />,
    title: 'বোর্ড প্রশ্ন আর্কাইভ',
    desc: 'বিগত ১০+ বছরের বোর্ড ও টপ কলেজের টেস্ট পেপার — সলভড।',
    visual: <ArchiveVisual />,
    span: 'md:col-span-2',
  },
  {
    icon: <Swords size={16} />,
    title: 'ব্যাটল ও লিডারবোর্ড',
    desc: 'বন্ধুকে ১v১ ব্যাটলে ডাকো, জাতীয় লিডারবোর্ডে নাম তোলো — প্রস্তুতি হবে খেলা।',
    visual: <BattleVisual />,
    span: 'md:col-span-2',
  },
  {
    icon: <Download size={16} />,
    title: 'অফলাইন প্যাক + বাংলা সমাধান',
    desc: 'নেট নেই? সমস্যা নেই। পুরো অধ্যায়ের প্রশ্ন অফলাইনে নামিয়ে চর্চা করো — স্কোর অটো-সিংক হবে নেট আসলেই। প্রতিটা সমাধান বাংলায়, চিত্র ও শর্টকাট ট্রিকসহ।',
    visual: <OfflineVisual />,
    span: 'md:col-span-6',
    dark: true,
  },
];

export const Features: React.FC = () => (
  <section id="features" className="lk-cream lk-noise relative py-20 md:py-28 border-b border-[#EFE7DA] dark:border-white/8">
    <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-8">
      <SectionHead
        eyebrow="সুপারপাওয়ার"
        title={
          <>
            সব দরকারি কিছু এক অ্যাপে —<br className="hidden md:block" />
            <span className="text-[#FF5200] dark:text-orange-400"> বাড়তি কিছুই নয়</span>
          </>
        }
        sub="প্রশ্নব্যাংক থেকে AI অ্যানালিটিক্স — প্রতিটা ফিচার বানানো একটাই উদ্দেশ্যে: কম সময়ে বেশি নম্বর।"
      />

      <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-5">
        {CARDS.map((c, i) => (
          <Reveal key={c.title} delay={(i % 3) * 90} className={c.span}>
            <article
              className={`group h-full rounded-[1.4rem] md:rounded-[1.7rem] p-5 md:p-7 transition-all duration-300 hover:-translate-y-1 ${
                c.dark
                  ? 'lk-card-night text-white shadow-[0_24px_60px_-30px_rgba(0,0,0,0.6)]'
                  : 'lk-card shadow-[0_16px_40px_-24px_rgba(23,19,16,0.25)]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    c.dark ? 'bg-[#FF5200]/15 text-orange-300' : 'bg-[#FF5200]/10 text-[#D64500] dark:text-orange-300'
                  }`}
                >
                  {c.icon}
                </span>
                <h3 className={`text-[17px] md:text-[19px] font-bold ${c.dark ? 'text-white' : 'text-[#171310] dark:text-white'}`}>
                  {c.title}
                </h3>
              </div>
              <p className={`mt-3.5 text-[13px] md:text-[14px] leading-relaxed ${c.dark ? 'text-white/55' : 'text-[#5C544B] dark:text-white/55'}`}>
                {c.desc}
              </p>
              <div className="mt-5">{c.visual}</div>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
