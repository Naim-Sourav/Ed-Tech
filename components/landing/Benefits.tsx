import React from 'react';
import { motion } from 'motion/react';
import { ScanEye, MonitorCheck, Languages, Gamepad2, X, Check, Quote } from 'lucide-react';
import { benefits, comparisonRows } from './data';
import { EASE_OUT_EXPO, EASE_SPRING, Reveal, SectionTag, staggerParent, staggerChild, toBn } from './ui';

const icons = [ScanEye, MonitorCheck, Languages, Gamepad2];

/** Sticky intro + photo collage on the left, numbered benefit rows + comparison table on the right. */
const Benefits: React.FC = () => {
  return (
    <section id="benefits" className="relative overflow-hidden py-20 sm:py-28">
      <div
        className="pointer-events-none absolute -left-40 top-1/3 h-[460px] w-[460px] rounded-full bg-[radial-gradient(closest-side,rgba(255,185,46,0.16),transparent)] blur-2xl"
        aria-hidden="true"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          {/* Sticky intro + photos */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <SectionTag>কেন পরীক্ষাঙ্গন · Why us</SectionTag>
                <h2 className="mt-5 font-bangla text-[34px] font-extrabold leading-[1.12] tracking-[-0.01em] text-ink sm:text-[44px]">
                  টপারদের{' '}
                  <span className="bg-gradient-to-r from-brand-deep to-brand-bright bg-clip-text text-transparent">
                    লুকানো শর্টকাট।
                  </span>
                </h2>
                <p className="mt-5 max-w-md font-bangla text-[17px] font-semibold text-brand-deep">
                  প্রতিদিন মাত্র ৩০ মিনিট — বসে দেখো, পরীক্ষা হয়ে যাবে তোমার হোম গ্রাউন্ড।
                </p>
              </Reveal>

              {/* Photo collage */}
              <Reveal delay={0.2} className="relative mt-10 pb-16">
                <div className="relative overflow-hidden rounded-[26px] shadow-[0_36px_70px_-30px_rgba(22,18,16,0.5)] ring-1 ring-ink/10">
                  <img
                    src="/images/student-hero.jpg"
                    alt="বই হাতে আত্মবিশ্বাসী একজন শিক্ষার্থী"
                    className="aspect-[4/5] w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink/70 to-transparent" aria-hidden="true" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                    <p className="text-[13px] font-bold text-white">“ফিজিক্সের ভয়টা এখানেই শেষ”</p>
                    <span className="rounded-full bg-lime px-2.5 py-1 text-[11px] font-bold text-ink">HSC '26</span>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 26, rotate: 8 }}
                  whileInView={{ opacity: 1, y: 0, rotate: 5 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.35, duration: 0.8, ease: EASE_OUT_EXPO }}
                  className="absolute -bottom-2 -right-2 w-[52%] overflow-hidden rounded-2xl shadow-[0_24px_50px_-20px_rgba(22,18,16,0.55)] ring-4 ring-paper sm:-right-6"
                >
                  <img
                    src="/images/students-study.jpg"
                    alt="একসাথে পড়াশোনারত শিক্ষার্থীরা"
                    className="aspect-[4/3] w-full object-cover"
                    loading="lazy"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.6, ease: EASE_SPRING }}
                  className="glass absolute -right-1 top-6 rounded-2xl px-4 py-3 shadow-lg sm:-right-4"
                >
                  <p className="font-display text-[22px] font-bold leading-none text-ink">২৪/৭</p>
                  <p className="mt-1 max-w-[110px] text-[11px] font-semibold leading-snug text-mist">
                    AI টিউটরের পাশে থাকার নিশ্চয়তা
                  </p>
                </motion.div>
              </Reveal>
            </div>
          </div>

          {/* Benefit rows */}
          <motion.div
            variants={staggerParent}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="lg:col-span-7"
          >
            {benefits.map((b, i) => {
              const Icon = icons[i];
              return (
                <motion.article
                  key={b.titleBn}
                  variants={staggerChild}
                  className="group relative border-t border-ink/10 py-8 transition-colors duration-500 first:border-t-0 first:pt-2 hover:border-brand/30 sm:py-10"
                >
                  <div className="flex gap-5 sm:gap-7">
                    <span
                      className="pointer-events-none absolute -left-1 top-6 select-none font-display text-[64px] font-extrabold leading-none text-ink/[0.05] transition-colors duration-500 group-hover:text-brand/15 sm:top-8 sm:text-[80px]"
                      aria-hidden="true"
                    >
                      {toBn(`0${i + 1}`)}
                    </span>
                    <span className="relative z-10 mt-1 grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ink text-lime shadow-[0_14px_28px_-12px_rgba(22,18,16,0.6)] transition-colors duration-500 group-hover:bg-brand">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="relative z-10">
                      <p className="font-bangla text-[21px] font-bold tracking-tight text-ink sm:text-[23px]">
                        {b.titleBn}
                      </p>
                      <p className="font-display text-[13px] font-bold uppercase tracking-[0.14em] text-brand">
                        {b.title}
                      </p>
                      <p className="mt-2.5 max-w-lg text-[15px] leading-relaxed text-mist">{b.desc}</p>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </div>

        {/* Comparison table */}
        <Reveal className="mt-20">
          <div className="overflow-hidden rounded-[26px] bg-white ring-1 ring-ink/8 shadow-[0_30px_60px_-34px_rgba(22,18,16,0.35)]">
            <div className="grid grid-cols-1 gap-y-2 bg-ink px-6 py-5 text-white sm:grid-cols-[150px_1fr_1fr] sm:px-9">
              <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.18em] text-white/50">
                <Quote className="h-3.5 w-3.5" /> ফেয়ার তুলনা
              </span>
              <span className="text-[14px] font-semibold text-white/55">গাইডবুক + কোচিং — পুরনো উপায়</span>
              <span className="inline-flex items-center gap-2 text-[14px] font-bold text-lime">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-lime text-ink" aria-hidden="true">
                  <Check className="h-3 w-3" strokeWidth={4} />
                </span>
                পরীক্ষাঙ্গনে
              </span>
            </div>
            {comparisonRows.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-1 gap-y-1.5 px-6 py-4.5 sm:grid-cols-[150px_1fr_1fr] sm:items-center sm:gap-6 sm:px-9 ${
                  i % 2 === 0 ? 'bg-white' : 'bg-paper/60'
                } border-t border-ink/6 first:border-t-0`}
              >
                <p className="font-bangla text-[14.5px] font-bold text-ink">{row.label}</p>
                <p className="flex items-center gap-2.5 text-[14px] text-mist">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ink/[0.06] text-ink/40" aria-hidden="true">
                    <X className="h-3 w-3" strokeWidth={3.5} />
                  </span>
                  {row.old}
                </p>
                <p className="flex items-center gap-2.5 text-[14px] font-semibold text-ink">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-mint text-brand-deep" aria-hidden="true">
                    <Check className="h-3 w-3" strokeWidth={3.5} />
                  </span>
                  {row.neo}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default Benefits;
