import { motion } from "motion/react";
import {
  Activity,
  Archive,
  ArrowRight,
  BadgeCheck,
  BookMarked,
  ChevronDown,
  Play,
  Radio,
  Share2,
  Star,
  Trophy,
} from "lucide-react";
import QuestionDemo from "./QuestionDemo";
import { EASE } from "./helpers";

/* ------------------------------------------------------------------ */
/*  Hero — copy on top, previous landing's live-exam app window below  */
/*  (chrome bar + sidebar + question card + leaderboard)               */
/* ------------------------------------------------------------------ */

function AccuracyRing() {
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
        transition={{ duration: 1.6, ease: EASE, delay: 1.4 }}
      />
    </svg>
  );
}

export default function Hero({ onStart }: { onStart?: () => void }) {
  return (
    <section id="top" className="relative overflow-hidden pb-16 pt-32 sm:pt-40 lg:pb-24">
      {/* ambient background */}
      <div className="dot-grid absolute inset-0 -z-20 [mask-image:radial-gradient(75%_60%_at_50%_35%,black,transparent)]" />
      <div className="animate-pulse-soft absolute -left-40 top-24 -z-10 size-[34rem] rounded-full bg-brand-300/35 blur-3xl" />
      <div className="animate-pulse-soft absolute -right-48 top-72 -z-10 size-[30rem] rounded-full bg-amber-300/30 blur-3xl [animation-delay:1.4s]" />
      <div className="animate-pulse-soft absolute left-1/3 top-[38rem] -z-10 size-[26rem] rounded-full bg-gold-300/30 blur-3xl [animation-delay:2.6s]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* ------------ copy ------------ */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-white/80 py-1.5 pl-1.5 pr-4 text-sm font-semibold text-brand-700 shadow-sm backdrop-blur"
          >
            <span className="rounded-full bg-gradient-to-r from-brand-600 to-amber-500 px-2.5 py-0.5 text-xs font-bold text-white">
              নতুন
            </span>
            লাইভ মক টেস্ট ও র‍্যাংকিং এখন চালু
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 34, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.12, ease: EASE }}
            className="font-display mx-auto mt-6 max-w-4xl text-[2.6rem] font-bold leading-[1.08] tracking-tight text-ink-950 sm:text-6xl lg:text-[4.15rem]"
          >
            পরীক্ষা প্রস্তুতির বিস্তৃত{" "}
            <span className="relative inline-block">
              <span className="text-gradient">অঙ্গন</span>
              <svg viewBox="0 0 220 14" className="absolute -bottom-1.5 left-0 w-full" fill="none" aria-hidden>
                <motion.path
                  d="M4 10 C 60 2, 160 2, 216 8"
                  stroke="#ff7a36"
                  strokeWidth="5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.1, delay: 0.9, ease: EASE }}
                />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.28, ease: EASE }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-600"
          >
            এসএসসি ও এইচএসসি বোর্ড, ঢাবি-চাবি-রাবি, বুয়েট ও মেডিকেল ভর্তি —{" "}
            <span className="font-semibold text-ink-800">৫২,০০০+ নির্ভুল প্রশ্ন</span>, অধ্যায়ভিত্তিক লাইভ মক,
            বই-রেফারেন্সসহ ব্যাখ্যা আর রিয়েল-টাইম মেধাতালিকা — সবটাই একটাই অ্যাপে।
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.42, ease: EASE }}
            className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <button
              type="button"
              onClick={onStart}
              className="btn-shine group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-brand-500/35 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-500/50 sm:w-auto"
            >
              ফ্রিতে পরীক্ষা শুরু করো
              <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1.5" />
            </button>
            <a
              href="#showcase"
              className="group inline-flex w-full items-center justify-center gap-3 rounded-full border border-ink-200 bg-white/80 px-7 py-4 text-base font-bold text-ink-800 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:text-brand-700 hover:shadow-lg sm:w-auto"
            >
              <span className="grid size-9 place-items-center rounded-full bg-ink-950 text-white transition-colors duration-300 group-hover:bg-brand-600">
                <Play className="size-4 fill-current" />
              </span>
              প্রশ্ন দেখে বুঝো
            </a>
          </motion.div>

          {/* social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.56, ease: EASE }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4"
          >
            <div className="flex -space-x-3">
              {[
                ["তা", "from-brand-500 to-brand-700"],
                ["নু", "from-amber-400 to-orange-600"],
                ["রা", "from-orange-500 to-red-500"],
                ["মে", "from-emerald-500 to-teal-600"],
                ["সা", "from-rose-400 to-rose-600"],
              ].map(([ch, grad], i) => (
                <span
                  key={ch}
                  className={`grid size-10 place-items-center rounded-full border-2 border-white bg-gradient-to-br ${grad} text-sm font-bold text-white shadow-md`}
                  style={{ zIndex: 5 - i }}
                >
                  {ch}
                </span>
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-gold-400 text-gold-400" />
                ))}
                <span className="ml-1 text-sm font-bold text-ink-900">৪.৯/৫</span>
              </div>
              <p className="text-sm font-medium text-ink-500">২,৩৪,০০০+ শিক্ষার্থীর ভরসার নাম</p>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 sm:flex">
              <BadgeCheck className="size-4 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-700">৯২% প্রশ্ন বোর্ড-সিলেবাস মিলিয়ে যাচাইকৃত</span>
            </div>
          </motion.div>
        </div>

        {/* ------------ live-exam app window (previous landing's question card) ------------ */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.7, ease: EASE }}
          className="relative mx-auto mt-14 max-w-5xl sm:mt-16"
        >
          {/* warm glow behind */}
          <div
            className="absolute -inset-x-8 -top-10 bottom-1/3 rounded-[48px] bg-[radial-gradient(50%_60%_at_50%_0%,rgba(255,82,0,0.16),transparent)] blur-2xl"
            aria-hidden="true"
          />

          <div className="relative overflow-hidden rounded-2xl bg-white shadow-[0_40px_90px_-30px_rgba(22,18,16,0.4)] ring-1 ring-ink/10 sm:rounded-[26px]">
            {/* chrome bar — the "link" strip on top of the card */}
            <div className="flex items-center gap-3 border-b border-ink/6 bg-cream/60 px-4 py-3 sm:px-5">
              <span className="flex gap-1.5" aria-hidden="true">
                <span className="h-3 w-3 rounded-full bg-flag/70" />
                <span className="h-3 w-3 rounded-full bg-gold-400/80" />
                <span className="h-3 w-3 rounded-full bg-brand-500/80" />
              </span>
              <span className="mx-auto flex items-center gap-2 rounded-full bg-ink-950/[0.05] px-4 py-1 text-[12px] font-semibold text-ink-500 ring-1 ring-ink-950/5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                porikkhangon.app/live-exam
              </span>
              <Share2 className="h-4 w-4 text-ink-300" />
            </div>

            <div className="grid bg-ink-50/60 lg:grid-cols-[178px_1fr] xl:grid-cols-[188px_1fr_222px]">
              {/* Sidebar */}
              <aside className="hidden flex-col gap-1 border-r border-ink/6 p-3.5 lg:flex" aria-label="অ্যাপ নেভিগেশন প্রিভিউ">
                {[
                  { icon: BookMarked, label: "প্রশ্ন ব্যাংক", active: false },
                  { icon: Radio, label: "লাইভ এক্সাম", active: true },
                  { icon: Activity, label: "অ্যানালিটিক্স", active: false },
                  { icon: Archive, label: "বোর্ড আর্কাইভ", active: false },
                ].map((item) => (
                  <span
                    key={item.label}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold ${
                      item.active ? "bg-mint text-brand-700 ring-1 ring-brand-500/15" : "text-ink-500 hover:bg-ink-950/[0.03]"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {item.active && <span className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" />}
                  </span>
                ))}
                <div className="mt-auto rounded-xl bg-ink-950 p-3.5 text-white">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-lime">পরীক্ষা বাকি</p>
                  <p className="font-display mt-1 text-[26px] font-bold leading-none">
                    ৪২ <span className="text-[13px] font-semibold text-white/60">দিন</span>
                  </p>
                  <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/15">
                    <motion.div
                      className="h-full rounded-full bg-lime"
                      initial={{ width: 0 }}
                      animate={{ width: "68%" }}
                      transition={{ duration: 1.4, delay: 1.6, ease: EASE }}
                    />
                  </div>
                </div>
              </aside>

              {/* Main: interactive question card */}
              <div className="bg-white">
                <QuestionDemo />
              </div>

              {/* Leaderboard */}
              <aside className="hidden flex-col border-l border-ink/6 p-4 xl:flex" aria-label="লিডারবোর্ড প্রিভিউ">
                <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-ink-500">
                  <Trophy className="h-3.5 w-3.5 text-gold-400" /> জাতীয় লিডারবোর্ড
                </p>
                <div className="mt-3 space-y-2">
                  {[
                    { name: "সাদিয়া রহমান", pts: "২,৮৪০", rank: 1, medal: "bg-gold-400 text-ink-950" },
                    { name: "তুমি", pts: "২,৭১৫", rank: 2, medal: "bg-lime text-ink-950", you: true },
                    { name: "মেহরাব হক", pts: "২,৬৯০", rank: 3, medal: "bg-amber-100 text-ink-950" },
                  ].map((row) => (
                    <div
                      key={row.name}
                      className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 ${
                        row.you ? "bg-mint ring-1 ring-brand-500/25" : "bg-white ring-1 ring-ink/6"
                      }`}
                    >
                      <span className={`font-display grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold ${row.medal}`}>
                        {row.rank}
                      </span>
                      <span className="truncate text-[13px] font-semibold">{row.name}</span>
                      <span className="font-display ml-auto text-[12px] font-bold tabular-nums text-ink-500">{row.pts}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-ink/6">
                  <div className="flex items-center gap-3">
                    <AccuracyRing />
                    <div>
                      <p className="font-display text-[19px] font-bold leading-none">৯২%</p>
                      <p className="mt-1 text-[11.5px] font-semibold text-ink-500">সাপ্তাহিক অ্যাকুরেসি</p>
                    </div>
                  </div>
                  <p className="mt-3 rounded-lg bg-mint px-2.5 py-1.5 text-[11.5px] font-bold text-brand-700">
                    ↑ গত সপ্তাহের চেয়ে +৬%
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </motion.div>

        <a
          href="#trust"
          aria-label="নিচে আরও দেখুন"
          className="mx-auto mt-8 hidden w-11 place-items-center rounded-full border border-ink-200 bg-white/80 py-2 text-ink-500 backdrop-blur transition-colors hover:border-brand-400 hover:text-brand-600 sm:flex"
        >
          <motion.span animate={{ y: [0, 5, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
            <ChevronDown className="size-5" />
          </motion.span>
        </a>
      </div>
    </section>
  );
}
