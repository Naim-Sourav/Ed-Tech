import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Play, Flame, Trophy, Medal, Sparkle, BookMarked, Radio, Activity, GraduationCap, Globe } from 'lucide-react';
import { subjects } from './data';
import QuestionDemo from './QuestionDemo';
import { EASE_OUT_EXPO, EASE_SPRING, formatBn } from './ui';

const line = {
  hidden: { y: '112%' },
  show: (i: number) => ({
    y: '0%',
    transition: { duration: 1, ease: EASE_OUT_EXPO, delay: 0.24 + i * 0.14 },
  }),
};

const rise = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  show: (d: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: EASE_OUT_EXPO, delay: d },
  }),
};

const AccuracyRing: React.FC = () => {
  const r = 15.5;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 40 40" className="h-10 w-10 -rotate-90" aria-hidden="true">
      <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(22,18,16,0.08)" strokeWidth="4.5" />
      <motion.circle
        cx="20"
        cy="20"
        r={r}
        fill="none"
        stroke="#ff5200"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - 0.92) }}
        transition={{ duration: 1.6, ease: EASE_OUT_EXPO, delay: 1.6 }}
      />
    </svg>
  );
};

const Hero: React.FC<{ onLoginClick: () => void }> = ({ onLoginClick }) => {
  return (
    <section id="top" className="relative overflow-hidden pt-32 sm:pt-36 lg:pt-40">
      {/* ── Ambient warm washes + brand watermark ── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-44 left-1/2 h-[620px] w-[960px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,82,0,0.11),transparent)] blur-3xl" />
        <div className="absolute top-56 -right-44 h-[460px] w-[460px] rounded-full bg-[radial-gradient(closest-side,rgba(255,185,46,0.18),transparent)] blur-3xl" />
        <div className="absolute top-[560px] -left-52 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(255,122,53,0.09),transparent)] blur-3xl" />
        <span
          className="absolute left-1/2 top-[58%] -translate-x-1/2 select-none whitespace-nowrap font-bangla font-extrabold leading-none"
          style={{ fontSize: '21vw', WebkitTextStroke: '1.5px rgba(22,18,16,0.05)', color: 'transparent' }}
        >
          পরীক্ষাঙ্গন
        </span>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* ── Editorial eyebrow ── */}
        <motion.p
          variants={rise}
          initial="hidden"
          animate="show"
          custom={0.05}
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[13.5px] font-semibold text-mist sm:text-[14.5px]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
          HSC থেকে ভর্তি — তিনটা লড়াই, একটাই অঙ্গন
          <span className="hidden h-px w-10 bg-ink/20 sm:block" aria-hidden="true" />
          <span className="font-display text-[12.5px] font-bold uppercase tracking-[0.22em] text-ink/60">
            HSC · Admission · GST
          </span>
        </motion.p>

        {/* ── Headline — Bangla first ── */}
        <h1 className="mt-6 text-center font-bangla font-extrabold leading-[1.12] tracking-[-0.01em] text-ink">
          <span className="block overflow-hidden pb-2">
            <motion.span
              variants={line}
              custom={0}
              initial="hidden"
              animate="show"
              className="block text-[13vw] sm:text-[10.5vw] lg:text-[84px]"
            >
              চর্চাই জয়ের
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-3">
            <motion.span
              variants={line}
              custom={1}
              initial="hidden"
              animate="show"
              className="block text-[13vw] sm:text-[10.5vw] lg:text-[84px]"
            >
              সবচেয়ে বড়{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-brand-deep via-brand to-brand-bright bg-clip-text text-transparent">
                  অঙ্গন
                </span>
                <svg viewBox="0 0 220 24" className="absolute -bottom-1 left-0 w-full sm:-bottom-2" aria-hidden="true">
                  <motion.path
                    d="M8 16 C 66 8, 152 6, 212 14"
                    fill="none"
                    stroke="#ff5200"
                    strokeWidth="7"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.15, ease: EASE_OUT_EXPO }}
                  />
                </svg>
              </span>
            </motion.span>
          </span>
        </h1>

        {/* ── Paragraph ── */}
        <motion.p
          variants={rise}
          initial="hidden"
          animate="show"
          custom={0.78}
          className="mx-auto mt-6 max-w-2xl text-balance text-center text-[16px] leading-relaxed text-mist sm:text-[17.5px]"
        >
          <span className="font-semibold text-ink">{formatBn(20000)}+ প্রশ্ন</span>, এক্সাম জোনে মডেল টেস্ট আর ২৪/৭ AI টিউটর — সব মিলিয়ে একটাই লক্ষ্য: পরীক্ষা হলে তোমার নিজের সেরা ভার্সন।
        </motion.p>

        {/* ── CTAs ── */}
        <motion.div
          variants={rise}
          initial="hidden"
          animate="show"
          custom={0.88}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <button
            type="button"
            onClick={onLoginClick}
            className="focus-ring group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-ink px-8 py-4 text-[16px] font-bold text-paper shadow-[0_18px_40px_-14px_rgba(22,18,16,0.6)] transition-all duration-300 hover:-translate-y-1 hover:bg-brand-deep hover:shadow-[0_24px_48px_-14px_rgba(224,68,0,0.55)] sm:w-auto"
          >
            ফ্রিতে চর্চা শুরু করো
            <span className="grid h-6 w-6 place-items-center rounded-full bg-brand text-white transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
          </button>
          <a
            href="#showcase"
            className="focus-ring group inline-flex w-full items-center justify-center gap-3 rounded-full bg-white/70 px-8 py-4 text-[16px] font-bold text-ink ring-1 ring-ink/10 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:ring-brand/40 sm:w-auto"
          >
            <span className="relative grid h-8 w-8 place-items-center rounded-full bg-brand text-white">
              <span className="absolute inset-0 rounded-full bg-brand animate-pulse-ring" aria-hidden="true" />
              <Play className="relative h-3.5 w-3.5" fill="currentColor" />
            </span>
            প্রোডাক্ট ট্যুর দেখো
          </a>
        </motion.div>

        {/* ── Trust row ── */}
        <motion.div
          variants={rise}
          initial="hidden"
          animate="show"
          custom={0.98}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
        >
          <div className="flex items-center -space-x-2.5" aria-hidden="true">
            {['HSC', 'DU', 'MED', 'GST'].map((t, i) => (
              <span
                key={t}
                className={`grid h-9 w-9 place-items-center rounded-full text-[10px] font-bold text-white ring-[2.5px] ring-paper ${
                  ['bg-brand', 'bg-ink', 'bg-gold', 'bg-flag'][i]
                }`}
              >
                {t}
              </span>
            ))}
          </div>
          <p className="text-[14px] font-medium text-mist">
            <span className="font-bold text-ink">৪ মেজর টার্গেট</span> · HSC, ঢাবি, মেডিকেল ও গুচ্ছ ভর্তি — একই অ্যাপে
          </p>
        </motion.div>

        {/* ── Product mockup ── */}
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.15, ease: EASE_OUT_EXPO, delay: 0.9 }}
          className="relative mx-auto mt-16 max-w-5xl sm:mt-20"
        >
          {/* warm glow behind */}
          <div
            className="absolute -inset-x-8 -top-10 bottom-1/3 rounded-[48px] bg-[radial-gradient(50%_60%_at_50%_0%,rgba(255,82,0,0.16),transparent)] blur-2xl"
            aria-hidden="true"
          />

          <div className="relative overflow-hidden rounded-2xl bg-white shadow-[0_40px_90px_-30px_rgba(22,18,16,0.4)] ring-1 ring-ink/10 sm:rounded-[26px]">
            {/* Chrome bar */}
            <div className="flex items-center gap-3 border-b border-ink/6 bg-cream/60 px-4 py-3 sm:px-5">
              <span className="flex gap-1.5" aria-hidden="true">
                <span className="h-3 w-3 rounded-full bg-flag/70" />
                <span className="h-3 w-3 rounded-full bg-gold/80" />
                <span className="h-3 w-3 rounded-full bg-brand/80" />
              </span>
              <span className="mx-auto flex items-center gap-2 rounded-full bg-ink/[0.05] px-4 py-1 text-[12px] font-semibold text-ink/60 ring-1 ring-ink/5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                porikkhangon.app/exams
              </span>
              <Globe className="h-4 w-4 text-ink/30" />
            </div>

            <div className="grid bg-paper lg:grid-cols-[178px_1fr] xl:grid-cols-[188px_1fr_222px]">
              {/* Sidebar */}
              <aside className="hidden flex-col gap-1 border-r border-ink/6 p-3.5 lg:flex" aria-label="অ্যাপ নেভিগেশন প্রিভিউ">
                {[
                  { icon: BookMarked, label: 'প্রশ্ন ব্যাংক', active: false },
                  { icon: Radio, label: 'এক্সাম জোন', active: true },
                  { icon: Activity, label: 'অ্যানালিটিক্স', active: false },
                  { icon: GraduationCap, label: 'ভর্তি তথ্য', active: false },
                ].map((item) => (
                  <span
                    key={item.label}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold ${
                      item.active ? 'bg-mint text-brand-deep ring-1 ring-brand/15' : 'text-mist'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {item.active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />}
                  </span>
                ))}
                <div className="mt-auto rounded-xl bg-ink p-3.5 text-paper">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-lime">পরীক্ষা বাকি</p>
                  <p className="mt-1 font-display text-[26px] font-bold leading-none">
                    ৪২ <span className="text-[13px] font-semibold text-white/60">দিন</span>
                  </p>
                  <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/15">
                    <motion.div
                      className="h-full rounded-full bg-lime"
                      initial={{ width: 0 }}
                      animate={{ width: '68%' }}
                      transition={{ duration: 1.4, delay: 1.8, ease: EASE_OUT_EXPO }}
                    />
                  </div>
                </div>
              </aside>

              {/* Main: interactive question */}
              <div className="bg-white">
                <QuestionDemo />
              </div>

              {/* Leaderboard */}
              <aside className="hidden flex-col border-l border-ink/6 p-4 xl:flex" aria-label="লিডারবোর্ড প্রিভিউ">
                <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-mist">
                  <Trophy className="h-3.5 w-3.5 text-gold" /> লিডারবোর্ড
                </p>
                <div className="mt-3 space-y-2">
                  {[
                    { name: 'সাদিয়া রহমান', pts: '২,৮৪০', rank: 1, medal: 'bg-gold text-ink' },
                    { name: 'তুমি', pts: '২,৭১৫', rank: 2, medal: 'bg-lime text-ink', you: true },
                    { name: 'মেহরাব হক', pts: '২,৬৯০', rank: 3, medal: 'bg-amber-soft text-ink' },
                  ].map((row) => (
                    <div
                      key={row.name}
                      className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 ${
                        row.you ? 'bg-mint ring-1 ring-brand/25' : 'bg-white ring-1 ring-ink/6'
                      }`}
                    >
                      <span className={`grid h-6 w-6 place-items-center rounded-full font-display text-[11px] font-bold ${row.medal}`}>
                        {row.rank}
                      </span>
                      <span className="truncate text-[13px] font-semibold">{row.name}</span>
                      <span className="ml-auto font-display text-[12px] font-bold tabular-nums text-mist">{row.pts}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-ink/6">
                  <div className="flex items-center gap-3">
                    <AccuracyRing />
                    <div>
                      <p className="font-display text-[19px] font-bold leading-none">৯২%</p>
                      <p className="mt-1 text-[11.5px] font-semibold text-mist">সাপ্তাহিক অ্যাকুরেসি</p>
                    </div>
                  </div>
                  <p className="mt-3 rounded-lg bg-mint px-2.5 py-1.5 text-[11.5px] font-bold text-brand-deep">
                    ↑ গত সপ্তাহের চেয়ে +৬%
                  </p>
                </div>
              </aside>
            </div>
          </div>

          {/* ── Floating chips ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: -5 }}
            transition={{ duration: 0.7, delay: 1.9, ease: EASE_SPRING }}
            className="absolute -left-3 top-10 z-10 hidden md:block lg:-left-14"
          >
            <div className="glass animate-float flex items-center gap-3 rounded-2xl px-4 py-3 shadow-[0_20px_44px_-18px_rgba(22,18,16,0.4)]">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold/20 text-gold" aria-hidden="true">
                <Flame className="h-5 w-5" fill="currentColor" />
              </span>
              <div>
                <p className="font-display text-[16px] font-bold leading-none text-ink">১৪ দিন</p>
                <p className="mt-1 text-[11.5px] font-semibold text-mist">লাগাতার স্ট্রিক!</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotate: 10 }}
            animate={{ opacity: 1, scale: 1, rotate: 4 }}
            transition={{ duration: 0.7, delay: 2.05, ease: EASE_SPRING }}
            className="absolute -right-3 top-1/3 z-10 hidden md:block lg:-right-12"
          >
            <div
              className="glass animate-float-slow flex items-center gap-3 rounded-2xl px-4 py-3 shadow-[0_20px_44px_-18px_rgba(22,18,16,0.4)]"
              style={{ animationDelay: '1.2s' }}
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand" aria-hidden="true">
                <Medal className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[13px] font-bold text-ink">নতুন ব্যাজ আনলকড</p>
                <p className="mt-0.5 flex items-center gap-1 text-[11.5px] font-semibold text-brand-deep">
                  <Sparkle className="h-3 w-3" fill="currentColor" /> Physics Ninja
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: -3 }}
            transition={{ duration: 0.7, delay: 2.2, ease: EASE_SPRING }}
            className="absolute -bottom-6 left-8 z-10 hidden md:block lg:left-24"
          >
            <div
              className="glass animate-float rounded-2xl px-4 py-3 shadow-[0_20px_44px_-18px_rgba(22,18,16,0.4)]"
              style={{ animationDelay: '2.4s' }}
            >
              <div className="flex items-center gap-2.5">
                <Trophy className="h-5 w-5 text-gold" fill="currentColor" />
                <p className="text-[13px] font-bold text-ink">
                  লিডারবোর্ডে <span className="font-display text-[15px] text-brand-deep">#২</span>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Subject marquee ── */}
      <div className="relative mt-20 border-y border-ink/8 bg-white/50 py-5 backdrop-blur-sm sm:mt-24">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-paper to-transparent" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-paper to-transparent" aria-hidden="true" />
        <div className="flex w-max animate-marquee">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
              {subjects.map((s) => (
                <span key={s + dup} className="flex items-center gap-6 pr-6 text-[15px] font-semibold text-ink/45">
                  {s}
                  <Sparkle className="h-3.5 w-3.5 text-brand/50" fill="currentColor" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
