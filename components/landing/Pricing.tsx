import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check, Crown, ShieldCheck, ArrowRight } from 'lucide-react';
import { plans } from './data';
import { Reveal, SectionTag, formatBn, staggerParent, staggerChild } from './ui';

/** Course/batch pricing using real figures from data/courses.ts. */
const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="relative overflow-hidden py-20 sm:py-28">
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,82,0,0.1),transparent)] blur-2xl"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionTag>সাধ্যের মধ্যে · Courses</SectionTag>
          <h2 className="mt-5 font-bangla text-[34px] font-extrabold leading-[1.1] tracking-[-0.01em] text-ink sm:text-[48px]">
            একটা গাইডবুকের দামে{' '}
            <span className="bg-gradient-to-r from-brand-deep to-brand-bright bg-clip-text text-transparent">
              মাসভর প্রস্তুতি।
            </span>
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-mist">
            বেসিক পুরোটাই ফ্রি — ব্যাচ আর কোর্সগুলোও কোচিংয়ের চেয়ে অনেক কম।
          </p>
        </Reveal>

        {/* Cards */}
        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-5 lg:grid-cols-3 lg:items-center"
        >
          {plans.map((plan) => {
            const dark = plan.popular;
            return (
              <motion.article
                key={plan.nameEn}
                variants={staggerChild}
                whileHover={{ y: -8 }}
                className={`relative flex flex-col rounded-[28px] p-7 sm:p-8 ${
                  dark
                    ? 'noise bg-ink text-white shadow-[0_48px_90px_-36px_rgba(22,18,16,0.85)] ring-1 ring-lime/30 lg:scale-[1.05] lg:z-10'
                    : 'bg-white ring-1 ring-ink/10 hover:ring-brand/25 hover:shadow-[0_32px_64px_-32px_rgba(22,18,16,0.3)]'
                }`}
              >
                {dark && (
                  <span className="absolute -top-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-lime px-4 py-1.5 text-[12px] font-bold text-ink shadow-lg">
                    <Crown className="h-3.5 w-3.5" fill="currentColor" /> সবচেয়ে জনপ্রিয়
                  </span>
                )}

                <div className="flex items-baseline justify-between">
                  <h3 className={`font-bangla text-[22px] font-bold ${dark ? 'text-white' : 'text-ink'}`}>{plan.name}</h3>
                  <span className={`text-[11px] font-bold uppercase tracking-[0.18em] ${dark ? 'text-lime/70' : 'text-mist'}`}>
                    {plan.nameEn}
                  </span>
                </div>
                <p className={`mt-1 text-[13.5px] font-medium ${dark ? 'text-white/55' : 'text-mist'}`}>{plan.tagline}</p>

                <div className="mt-6 flex h-[64px] items-end gap-2">
                  <span className={`font-display text-[46px] font-bold leading-none tracking-tight ${dark ? 'text-lime' : 'text-ink'}`}>
                    {plan.price === null ? 'কাস্টম' : `৳${formatBn(plan.price)}`}
                  </span>
                  {plan.originalPrice && (
                    <span className="pb-1.5 text-[15px] font-semibold text-white/40 line-through">৳{formatBn(plan.originalPrice)}</span>
                  )}
                  <span className={`pb-1.5 text-[13px] font-semibold ${dark ? 'text-white/50' : 'text-mist'}`}>
                    {plan.price === 0 ? 'চিরকালের ফ্রি' : plan.unit}
                  </span>
                </div>
                {plan.originalPrice && (
                  <p className={`mt-1 text-[12px] font-semibold ${dark ? 'text-lime/80' : 'text-brand-deep'}`}>
                    ৩৭% ছাড় — সীমিত সময়ের জন্য
                  </p>
                )}

                <ul className={`mt-7 flex-1 space-y-3 border-t pt-6 ${dark ? 'border-white/10' : 'border-ink/8'}`}>
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13.5px] leading-snug">
                      <span
                        className={`mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full ${
                          dark ? 'bg-lime/15 text-lime' : 'bg-mint text-brand-deep'
                        }`}
                        aria-hidden="true"
                      >
                        <Check className="h-2.5 w-2.5" strokeWidth={4} />
                      </span>
                      <span className={dark ? 'text-white/80' : 'text-ink/75'}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.href}
                  className={`focus-ring group mt-8 inline-flex items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-bold transition-all duration-300 hover:-translate-y-0.5 ${
                    dark
                      ? 'bg-lime text-ink shadow-[0_16px_36px_-14px_rgba(255,185,46,0.55)] hover:shadow-[0_20px_44px_-14px_rgba(255,185,46,0.65)]'
                      : 'bg-ink text-paper hover:bg-brand-deep'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </motion.article>
            );
          })}
        </motion.div>

        {/* Trust row */}
        <Reveal delay={0.1} className="mt-12 flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="flex items-center gap-2 text-[13px] font-semibold text-mist">
              <ShieldCheck className="h-4 w-4 text-brand" /> bKash · Nagad দিয়ে পেমেন্ট
            </span>
            <span className="hidden h-4 w-px bg-ink/15 sm:block" aria-hidden="true" />
            <div className="flex flex-wrap items-center justify-center gap-2">
              {['bKash', 'Nagad', 'কার্ড'].map((p) => (
                <span key={p} className="rounded-full bg-white px-3.5 py-1.5 text-[12px] font-bold text-ink/70 ring-1 ring-ink/10">
                  {p}
                </span>
              ))}
            </div>
          </div>
          <p className="text-center text-[12.5px] text-mist">কার্ড ছাড়াই শুরু করো · যেকোনো সময় সাপোর্টে যোগাযোগ</p>
        </Reveal>
      </div>
    </section>
  );
};


export default Pricing;
