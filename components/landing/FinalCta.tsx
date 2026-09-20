import React from 'react';
import { ArrowRight, Download } from 'lucide-react';
import { Reveal, bnDigits } from './primitives';

/* ------------------------------------------------------------------ */
/*  FINAL CTA — big closer above the footer.                           */
/* ------------------------------------------------------------------ */

export const FinalCta: React.FC<{ onLoginClick: () => void }> = ({ onLoginClick }) => (
  <section id="cta" className="lk-night relative overflow-hidden py-24 md:py-32">
    <div
      className="absolute inset-0 opacity-70 pointer-events-none"
      style={{
        background:
          'radial-gradient(60% 55% at 50% 40%, rgba(255,82,0,0.22) 0%, rgba(255,82,0,0.06) 45%, transparent 75%)',
      }}
      aria-hidden="true"
    />
    <div className="lk-grid-paper absolute inset-0 opacity-60 pointer-events-none" aria-hidden="true" />

    <div className="relative z-10 mx-auto max-w-4xl px-5 md:px-8 text-center">
      <Reveal>
        <p className="lk-eng text-[12px] md:text-[13px] font-bold uppercase tracking-[0.22em] text-orange-300/80">
          পরীক্ষা হলো দেখবে তোমার নতুন রূপ
        </p>
      </Reveal>
      <Reveal delay={90}>
        <h2 className="lk-display mt-6 text-[2.4rem] leading-[1.1] md:text-[4rem] md:leading-[1.05] font-bold tracking-tight text-white">
          তোমার জয়ের যুগ<br />
          <span className="text-[#FF5200]">শুরু হোক আজ রাতেই</span>
        </h2>
      </Reveal>
      <Reveal delay={170}>
        <p className="mx-auto mt-6 max-w-xl text-[15px] md:text-[17px] leading-relaxed text-white/55">
          আজ রাতেই প্রথম ১০টা প্রশ্ন শেষ করো — আগামীকাল সকালে তুমি আজকের চেয়ে এগিয়ে।
        </p>
      </Reveal>
      <Reveal delay={240}>
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onLoginClick}
            className="lk-focus group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FF5200] px-8 py-4 text-[15px] md:text-base font-bold text-white shadow-[0_20px_50px_-16px_rgba(255,82,0,0.7)] transition-all hover:bg-[#E64A00] hover:-translate-y-0.5 active:scale-[0.98]"
          >
            ফ্রি অ্যাকাউন্ট খোলো
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={onLoginClick}
            className="lk-focus w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-[15px] md:text-base font-bold text-white/85 transition-all hover:border-white/35 hover:text-white active:scale-[0.98]"
          >
            <Download size={17} />
            অ্যাপ হিসেবে সেভ করো
          </button>
        </div>
      </Reveal>
      <Reveal delay={320}>
        <p className="mt-7 text-[12px] md:text-[13px] font-semibold text-white/40">
          হাজারো শিক্ষার্থী ইতিমধ্যে অঙ্গনে · কোনো কার্ড লাগবে না · স্ট্রিক শুরু হবে আজ থেকেই ({bnDigits(0)} খরচ)
        </p>
      </Reveal>
    </div>
  </section>
);

export default FinalCta;
