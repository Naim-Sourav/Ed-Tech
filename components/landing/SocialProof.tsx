import React from 'react';
import { GraduationCap } from 'lucide-react';
import { stats, schools } from './data';
import { BnCounter, Reveal } from './ui';

/** Dark stat band + institution marquee right under the hero. */
const SocialProof: React.FC = () => {
  return (
    <section className="relative py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="noise relative overflow-hidden rounded-[28px] bg-ink px-6 py-10 shadow-[0_40px_80px_-40px_rgba(22,18,16,0.7)] sm:rounded-[36px] sm:px-12 sm:py-12">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/25 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-lime/12 blur-3xl" aria-hidden="true" />

            <div className="relative grid grid-cols-2 gap-y-10 lg:grid-cols-4">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className={`flex flex-col items-center text-center ${i > 0 ? 'lg:border-l lg:border-white/10' : ''} ${
                    i % 2 === 1 ? 'border-l border-white/10 lg:border-l' : ''
                  }`}
                >
                  <BnCounter
                    value={s.value}
                    decimals={s.decimals}
                    suffix={s.suffix}
                    className="font-bangla text-[40px] font-extrabold leading-none text-lime sm:text-[52px]"
                  />
                  <p className="mt-3 text-[14px] font-semibold text-white/85">{s.labelBn}</p>
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/40">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15} className="mt-12">
          <p className="text-center text-[12px] font-bold uppercase tracking-[0.22em] text-mist">
            দেশের সেরা প্রতিষ্ঠানের শিক্ষার্থীদের আস্থা
          </p>
          <div className="relative mt-6 overflow-hidden" aria-label="যেসব প্রতিষ্ঠানের শিক্ষার্থীরা ব্যবহার করে">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-paper to-transparent" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-paper to-transparent" aria-hidden="true" />
            <div className="flex w-max animate-marquee-slow">
              {[0, 1].map((dup) => (
                <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
                  {schools.map((s) => (
                    <span
                      key={s + dup}
                      className="flex items-center gap-3 whitespace-nowrap pr-10 font-display text-[19px] font-semibold text-ink/35 transition-colors hover:text-ink/60"
                    >
                      {s}
                      <GraduationCap className="h-4 w-4 text-brand/40" />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default SocialProof;
