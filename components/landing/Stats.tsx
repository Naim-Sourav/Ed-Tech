import React from 'react';
import { Counter, Reveal, bn } from './primitives';

/* ------------------------------------------------------------------ */
/*  STATS — honest numbers, animated on scroll (crawler-safe).         */
/* ------------------------------------------------------------------ */

const STATS: {
  value: number;
  render: (n: number) => string;
  label: string;
  sub: string;
}[] = [
  {
    value: 50000,
    render: (n) => `${bn(n)}+`,
    label: 'সলভড প্রশ্ন',
    sub: 'অধ্যায় ও টপিকভিত্তিক প্রশ্নব্যাংক',
  },
  {
    value: 10,
    render: (n) => `${bn(n)}+`,
    label: 'বছরের আর্কাইভ',
    sub: 'বোর্ড ও ভর্তির বিগত বছরের প্রশ্ন',
  },
  {
    value: 24,
    render: (n) => `${bn(n)}/৭`,
    label: 'AI টিউটর',
    sub: 'ছবি বা টেক্সট পাঠাও, ব্যাখ্যা নাও',
  },
  {
    value: 100,
    render: (n) => `${bn(n)}+`,
    label: 'লাইভ মডেল টেস্ট',
    sub: 'প্রতি সিজনে, রিয়েল এক্সাম ইন্টারফেসে',
  },
];

export const Stats: React.FC = () => (
  <section aria-label="পরীক্ষাঙ্গনের পরিসংখ্যান" className="lk-cream border-b border-[#EFE7DA] dark:border-white/8">
    <div className="mx-auto max-w-7xl px-5 md:px-8 py-14 md:py-20">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 90}>
            <div className={`relative ${i > 0 ? 'lg:border-l lg:border-[#E8DDCD] lg:dark:border-white/10 lg:pl-8' : ''}`}>
              <p className="lk-eng text-[2.4rem] md:text-[3.4rem] leading-none font-bold tracking-tight text-[#171310] dark:text-white tabular-nums">
                <Counter end={s.value} format={s.render} />
              </p>
              <p className="mt-3 text-[14px] md:text-[15px] font-bold text-[#D64500] dark:text-orange-300">{s.label}</p>
              <p className="mt-1 text-[12px] md:text-[13px] leading-relaxed text-[#8A8074] dark:text-white/40">{s.sub}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default Stats;
