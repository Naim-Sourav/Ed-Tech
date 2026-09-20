import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, TrendingUp, Activity } from 'lucide-react';
import { Reveal, SectionHead, bnDigits, useInView } from './primitives';

/* ------------------------------------------------------------------ */
/*  SHOWCASE — tabbed product tour (SSC / HSC / Admission) with a      */
/*  live-ish analytics panel on the right.                             */
/* ------------------------------------------------------------------ */

type Track = {
  id: string;
  tab: string;
  tabBn: string;
  title: string;
  bullets: { t: string; d: string }[];
  cta: string;
  panel: { subject: string; bars: { name: string; v: number }[]; gpa: string; live: number };
};

const TRACKS: Track[] = [
  {
    id: 'ssc',
    tab: 'SSC',
    tabBn: 'এসএসসি',
    title: 'বোর্ডের আগেই বোর্ড-রেডি',
    bullets: [
      { t: 'অধ্যায়ভিত্তিক চর্চা', d: 'NCTB-ভিত্তিক প্রতিটি অধ্যায় থেকে সহজ থেকে কঠিন — ধাপে ধাপে হাজারো MCQ।' },
      { t: 'বিগত বছরের বোর্ড প্রশ্ন', d: 'সব বোর্ডের পুরনো প্রশ্ন, ব্যাখ্যাসহ সমাধান ও চিত্রসহ ধাপে ধাপে উত্তর।' },
      { t: 'GPA ক্যালকুলেটর', d: 'প্রতিটি মকের পর অনুমান GPA, subject-wise দুর্বলতার ম্যাপসহ।' },
    ],
    cta: 'এসএসসি প্রস্তুতি শুরু করো',
    panel: {
      subject: 'SSC মডেল টেস্ট — পদার্থবিজ্ঞান',
      bars: [
        { name: 'ভৌত রাশি', v: 92 },
        { name: 'গতি', v: 74 },
        { name: 'বল', v: 51 },
        { name: 'কাজ ও শক্তি', v: 63 },
      ],
      gpa: '5.00',
      live: 5347,
    },
  },
  {
    id: 'hsc',
    tab: 'HSC',
    tabBn: 'এইচএসসি',
    title: 'এইচএসসি মানেই শেষ পরীক্ষা নয়',
    bullets: [
      { t: 'সিলেবাস-লকড প্রশ্ন', d: 'প্রথম ও দ্বিতীয় পত্রের প্রতিটি অধ্যায় — বোর্ড প্যাটার্নে MCQ ও সৃজনশীল চর্চা।' },
      { t: 'কলেজ টেস্ট পেপার', d: 'টপ কলেজের টেস্ট ও প্রি-টেস্ট প্রশ্নের আর্কাইভ, সলভড।' },
      { t: 'উইকলি মেগা মডেল টেস্ট', d: 'পুরো সিলেবাসের ফুল-লেন্থ মডেল টেস্ট, রিয়েল টাইমারে।' },
    ],
    cta: 'এইচএসসি প্রস্তুতি শুরু করো',
    panel: {
      subject: 'HSC মডেল টেস্ট — রসায়ন',
      bars: [
        { name: 'মৌল পর্যায়', v: 88 },
        { name: 'রাসায়নিক বন্ধন', v: 69 },
        { name: 'জৈব রসায়ন', v: 47 },
        { name: 'তড়িৎ রসায়ন', v: 72 },
      ],
      gpa: '4.92',
      live: 3912,
    },
  },
  {
    id: 'admission',
    tab: 'Admission',
    tabBn: 'অ্যাডমিশন',
    title: 'ভর্তির যুদ্ধে ফুল আর্মারি',
    bullets: [
      { t: 'ইউনিট-ভিত্তিক রুট', d: 'কা / খ / গ ইউনিট ও মেডিকেল — প্রতিটির সিলেবাস অনুযায়ী আলাদা প্রশ্ন রুট।' },
      { t: 'টাইম-অ্যাটাক মোড', d: 'রিয়েল পরীক্ষার চেয়ে কম সময়ে প্র্যাকটিস — হলে সময় উত্তবে না।' },
      { t: 'বিগত ১০ বছরের ভর্তি প্রশ্ন', d: 'ঢাবি, BUET গুচ্ছ, মেডিকেল — সলভড ও ব্যাখ্যাসহ।' },
    ],
    cta: 'ভর্তি প্রস্তুতি শুরু করো',
    panel: {
      subject: 'অ্যাডমিশন মডেল — ক ইউনিট',
      bars: [
        { name: 'পদার্থ', v: 81 },
        { name: 'গণিত', v: 66 },
        { name: 'রসায়ন', v: 73 },
        { name: 'বাংলা-ইংরেজি', v: 90 },
      ],
      gpa: '—',
      live: 6208,
    },
  },
];

const AnalyticsPanel: React.FC<{ track: Track }> = ({ track }) => {
  const [ref, inView] = useInView<HTMLDivElement>(0.25);
  return (
    <div ref={ref} className="lk-card-night rounded-[1.4rem] md:rounded-[1.7rem] p-5 md:p-7 text-white shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] md:text-[14px] font-bold text-white/85">{track.panel.subject}</p>
        <span className="lk-eng rounded-lg bg-white/10 px-2 py-1 text-[10px] md:text-[11px] font-bold text-white/60">২৫ মিনিট</span>
      </div>

      <div className="mt-5 space-y-3">
        {track.panel.bars.map((b, i) => (
          <div key={b.name} className="flex items-center gap-3">
            <span className="w-24 md:w-28 flex-shrink-0 truncate text-[12px] font-semibold text-white/60">{b.name}</span>
            <div className="h-2.5 flex-1 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r from-[#FF5200] to-[#FFA05C] ${inView ? 'lk-bar-grow' : ''}`}
                style={{ width: `${b.v}%`, animationDelay: `${i * 110}ms` }}
              />
            </div>
            <span className="lk-eng w-9 text-right text-[12px] font-bold text-white/70 tabular-nums">{bnDigits(b.v)}%</span>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
          <p className="text-[11px] font-semibold text-white/45">Predicted GPA</p>
          <p className="lk-eng mt-1 text-2xl md:text-3xl font-bold text-white tabular-nums">{track.panel.gpa}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300">
            <TrendingUp size={12} /> এই মাসে +০.৪২
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
          <p className="text-[11px] font-semibold text-white/45">এখন লাইভ</p>
          <p className="lk-eng mt-1 text-2xl md:text-3xl font-bold text-white tabular-nums">
            {bnDigits(track.panel.live.toLocaleString('en-IN'))}
          </p>
          <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-orange-300">
            <Activity size={12} /> <span className="lk-blink">অ্যানালিটিক্স লাইভ</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export const Showcase: React.FC<{ onLoginClick: () => void }> = ({ onLoginClick }) => {
  const [active, setActive] = useState(0);
  const track = TRACKS[active];
  return (
    <section id="showcase" className="lk-night relative overflow-hidden py-20 md:py-28">
      <div
        className="absolute top-[-20%] left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-[#FF5200]/10 blur-[130px] pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-8">
        <SectionHead
          tone="dark"
          eyebrow="লাইভ প্রোডাক্ট ট্যুর"
          title={
            <>
              এক অ্যাপ, তোমার সামনের<br className="hidden md:block" /> প্রতিটা পরীক্ষার জন্য
            </>
          }
          sub="নিচের ট্যাক থেকে তোমার ট্র্যাক বেছে নাও — দেখো অঙ্গনটা কেমন কাজ করে।"
        />

        {/* tabs */}
        <div className="mt-10 flex flex-wrap gap-2" role="tablist" aria-label="প্রস্তুতির ট্র্যাক">
          {TRACKS.map((t, i) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={`lk-focus rounded-full px-5 py-2.5 text-[13px] md:text-[14px] font-bold transition-all ${
                i === active
                  ? 'bg-[#FF5200] text-white shadow-[0_12px_30px_-12px_rgba(255,82,0,0.8)]'
                  : 'border border-white/12 bg-white/5 text-white/60 hover:text-white hover:border-white/25'
              }`}
            >
              <span className="lk-eng">{t.tab}</span>
              <span className="mx-1.5 text-white/30">·</span>
              {t.tabBn}
            </button>
          ))}
        </div>

        <div key={track.id} className="lk-pop mt-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <h3 className="text-[1.6rem] md:text-[2.3rem] leading-tight font-bold text-white">{track.title}</h3>
            <ul className="mt-7 space-y-5">
              {track.bullets.map((b) => (
                <li key={b.t} className="flex gap-3.5">
                  <CheckCircle2 size={19} className="mt-0.5 flex-shrink-0 text-[#FF7A33]" />
                  <div>
                    <p className="text-[15px] md:text-[16px] font-bold text-white">{b.t}</p>
                    <p className="mt-1 text-[13px] md:text-[14px] leading-relaxed text-white/50">{b.d}</p>
                  </div>
                </li>
              ))}
            </ul>
            <button
              onClick={onLoginClick}
              className="lk-focus group mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-[14px] md:text-[15px] font-bold text-[#171310] transition-all hover:bg-[#FFEDE2] active:scale-[0.98]"
            >
              {track.cta}
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
          <Reveal y={26}>
            <AnalyticsPanel track={track} />
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Showcase;
