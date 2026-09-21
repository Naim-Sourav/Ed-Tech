import { motion } from "motion/react";
import {
  Radio,
  BrainCircuit,
  Database,
  Archive,
  Swords,
  WifiOff,
  Check,
  Crown,
  Download,
  ArrowUpRight,
  Users,
} from "lucide-react";
import { Reveal, SectionTag, staggerParent, staggerChild } from "./ui";

/* ── Mini visual: live exam bubbles ── */
function LiveVisual() {
  return (
    <div className="relative mt-6 overflow-hidden rounded-2xl bg-paper p-4 ring-1 ring-ink/8 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-lime">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute h-full w-full rounded-full bg-lime animate-pulse-ring" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-lime" />
          </span>
          Live
        </span>
        <span className="font-display text-[13px] font-bold tabular-nums text-mist">00:12:44</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2" aria-hidden="true">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 + i * 0.05, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            className={`grid h-8 w-8 place-items-center rounded-full text-[11px] font-bold ring-1 ${
              i < 9
                ? "bg-brand text-white ring-brand"
                : i === 9
                  ? "bg-white text-ink ring-brand/50 shadow-[0_0_0_4px_rgba(255,82,0,0.12)]"
                  : "bg-white text-ink/30 ring-ink/10"
            }`}
          >
            {i + 1}
          </motion.span>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-ink/6 pt-3.5">
        <span className="flex items-center gap-2 text-[12.5px] font-semibold text-mist">
          <Users className="h-4 w-4 text-brand" />
          <span className="font-bold text-ink">২,৩৪১ জন</span> এখন একই এক্সাম দিচ্ছে
        </span>
        <span className="rounded-full bg-mint px-2.5 py-1 text-[11px] font-bold text-brand-deep">মেধা #২</span>
      </div>
    </div>
  );
}

/* ── Mini visual: weakness analytics ── */
function AnalyticsVisual() {
  const rows = [
    { label: "গতি", w: 86, weak: false },
    { label: "বল", w: 38, weak: true },
    { label: "শক্তি", w: 71, weak: false },
    { label: "তাপ", w: 64, weak: false },
  ];
  return (
    <div className="mt-6 space-y-2.5 rounded-2xl bg-paper p-4 ring-1 ring-ink/8 sm:p-5">
      {rows.map((r, i) => (
        <div key={r.label} className="flex items-center gap-3">
          <span className={`w-10 text-[12.5px] font-bold ${r.weak ? "text-flag" : "text-ink/70"}`}>{r.label}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink/[0.06]">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${r.w}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className={`h-full rounded-full ${r.weak ? "bg-flag" : "bg-brand"}`}
            />
          </div>
          <span className="w-9 text-right font-display text-[12px] font-bold tabular-nums text-mist">{r.w}%</span>
        </div>
      ))}
      <div className="mt-3 flex items-center justify-between rounded-xl bg-ink px-3.5 py-2.5 text-paper">
        <span className="text-[12px] font-semibold">“বল” অধ্যায়ের রিভিশন প্ল্যান</span>
        <ArrowUpRight className="h-4 w-4 text-lime" />
      </div>
    </div>
  );
}

/* ── Mini visual: question bank ── */
function BankVisual() {
  const cards = [
    { tag: "গণিত", q: "সেট ও ফাংশন · MCQ", c: "৮২০" },
    { tag: "ICT", q: "নেটওয়ার্কিং · MCQ", c: "৪৪০" },
    { tag: "English", q: "Right form of verbs", c: "৬১৫" },
  ];
  return (
    <div className="relative mt-6 space-y-2" aria-hidden="true">
      {cards.map((k, i) => (
        <motion.div
          key={k.tag}
          initial={{ opacity: 0, x: -18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + i * 0.12, duration: 0.5 }}
          className={`flex items-center gap-3 rounded-xl bg-white px-3.5 py-2.5 ring-1 ring-ink/8 ${i === 1 ? "ml-5" : i === 2 ? "ml-9" : ""}`}
        >
          <span className="rounded-lg bg-mint px-2 py-0.5 text-[11px] font-bold text-brand-deep">{k.tag}</span>
          <span className="flex-1 truncate text-[13px] font-semibold text-ink">{k.q}</span>
          <span className="font-display text-[11.5px] font-bold tabular-nums text-mist">{k.c}টি</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Mini visual: board archive ── */
function ArchiveVisual() {
  const years = ["'১৫", "'১৭", "'১৯", "'২১", "'২৩", "'২৫"];
  return (
    <div className="mt-6 grid grid-cols-3 gap-2" aria-hidden="true">
      {years.map((y, i) => (
        <motion.div
          key={y}
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + i * 0.08, duration: 0.45 }}
          className="flex items-center justify-between rounded-xl bg-paper px-3 py-2.5 ring-1 ring-ink/8 transition-colors group-hover:bg-mint"
        >
          <span className="font-display text-[14px] font-bold text-ink">২০{y.slice(1)}</span>
          <span className="grid h-5 w-5 place-items-center rounded-full bg-brand text-white">
            <Check className="h-3 w-3" strokeWidth={3.5} />
          </span>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Mini visual: podium ── */
function PodiumVisual() {
  const rows = [
    { name: "সাদিয়া", h: "h-24", pts: "২,৮৪০", crown: true, bg: "bg-gold/25 text-gold ring-gold/40" },
    { name: "তুমি", h: "h-16", pts: "২,৭১৫", crown: false, bg: "bg-lime/40 text-ink ring-lime" },
    { name: "মেহরাব", h: "h-12", pts: "২,৬৯০", crown: false, bg: "bg-amber-soft text-ink/70 ring-amber-soft" },
  ];
  return (
    <div className="mt-6 flex items-end justify-center gap-3 rounded-2xl bg-paper p-4 pt-6 ring-1 ring-ink/8" aria-hidden="true">
      {[rows[1], rows[0], rows[2]].map((p, i) => (
        <div key={p.name} className="flex flex-col items-center gap-1.5">
          {p.crown && <Crown className="h-4 w-4 text-gold" fill="currentColor" />}
          <span className="text-[11px] font-bold text-mist">{p.pts}</span>
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: "auto" }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 + i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className={`grid w-20 place-items-center rounded-t-xl ring-1 ${p.bg} ${p.h}`}
          >
            <span className="font-bangla text-[12px] font-bold">{p.name}</span>
          </motion.div>
        </div>
      ))}
    </div>
  );
}

/* ── Mini visual: offline pack ── */
function OfflineVisual() {
  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch">
      <div className="flex flex-1 items-center gap-3.5 rounded-2xl bg-paper px-4 py-3.5 ring-1 ring-ink/8">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-lime">
          <WifiOff className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <p className="text-[13px] font-bold text-ink">পদার্থ অধ্যায় ১–৩</p>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/[0.07]">
            <motion.div
              className="h-full rounded-full bg-brand"
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-mint px-2.5 py-1 text-[11px] font-bold text-brand-deep">
          <Check className="h-3 w-3" strokeWidth={3.5} /> ডাউনলোডড
        </span>
      </div>
      <div className="flex flex-1 items-center gap-3.5 rounded-2xl bg-paper px-4 py-3.5 ring-1 ring-ink/8">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-white">
          <Download className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[13px] font-bold text-ink">সমাধান — বাংলায়</p>
          <p className="text-[12px] font-medium text-mist">চিত্রসহ ধাপে ধাপে ব্যাখ্যা</p>
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    icon: Radio,
    title: "লাইভ মক এক্সাম",
    desc: "রিয়েল এক্সামের ইন্টারফেস, টাইমার আর OMR-স্টাইল বাবল — প্রতিদিন হাজারো শিক্ষার্থীর সাথে একই এক্সামে বসে instant রেজাল্ট আর merit পজিশন।",
    span: "lg:col-span-7",
    visual: <LiveVisual />,
  },
  {
    icon: BrainCircuit,
    title: "AI দুর্বলতা রিপোর্ট",
    desc: "প্রতিটি ভুল উত্তর থেকে AI বের করে কোন অধ্যায়ের কোন টপিকে তুমি পিছিয়ে — তারপর সাজিয়ে দেয় পার্সোনাল রিভিশন প্ল্যান।",
    span: "lg:col-span-5",
    visual: <AnalyticsVisual />,
  },
  {
    icon: Database,
    title: "স্মার্ট প্রশ্ন ব্যাংক",
    desc: "১,২০,০০০+ প্রশ্ন — অধ্যায়, টপিক ও কঠিনতা অনুযায়ী সাজানো। যে প্রশ্ন একবার পেরেছ, সেটা আর ঘুরিয়ে দেখায় না।",
    span: "lg:col-span-4",
    visual: <BankVisual />,
  },
  {
    icon: Archive,
    title: "বোর্ড প্রশ্ন আর্কাইভ",
    desc: "গত ১৫ বছরের সব বোর্ড ও টপ কলেজের টেস্ট পেপার — প্রতিটা প্রশ্নে বোর্ড-স্ট্যান্ডার্ড সমাধান ও মার্কিং হিন্টস।",
    span: "lg:col-span-4",
    visual: <ArchiveVisual />,
  },
  {
    icon: Swords,
    title: "ব্যাটল ও লিডারবোর্ড",
    desc: "বন্ধুকে ১v১ ব্যাটলে ডাকো, জাতীয় লিডারবোর্ডে নাম তোলো। প্রস্তুতির গেমিফিকেশন যা তোমাকে প্রতিদিন ফিরিয়ে আনবে।",
    span: "lg:col-span-4",
    visual: <PodiumVisual />,
  },
  {
    icon: WifiOff,
    title: "অফলাইন প্যাক + বাংলা সমাধান",
    desc: "নেট নেই? সমস্যা নেই। পুরো অধ্যায়ের প্রশ্ন অফলাইনে নামিয়ে চর্চা করো — স্কোর অটো-সিংক হবে নেট আসলেই। প্রতিটা সমাধান বাংলায়, চিত্র ও শর্টকাট ট্রিকসহ।",
    span: "lg:col-span-12",
    visual: <OfflineVisual />,
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <Reveal className="max-w-2xl">
            <SectionTag>সুপারপাওয়ার · Features</SectionTag>
            <h2 className="mt-5 font-display text-[34px] font-bold leading-[1.05] tracking-[-0.02em] text-ink sm:text-[52px]">
              Everything you need.
              <br />
              <span className="bg-gradient-to-r from-brand-deep to-brand-bright bg-clip-text text-transparent">
                Nothing you don't.
              </span>
            </h2>
          </Reveal>
          <Reveal delay={0.15} className="max-w-md">
            <p className="font-bangla text-[17px] font-semibold text-brand-deep">৬টি সুপারপাওয়ার, একটাই অ্যাপে</p>
            <p className="mt-2 text-[15.5px] leading-relaxed text-mist">
              প্রশ্ন ব্যাংক থেকে শুরু করে AI অ্যানালিটিক্স — প্রতিটা ফিচার বানানো হয়েছে একটাই উদ্দেশ্যে: কম সময়ে বেশি নম্বর।
            </p>
          </Reveal>
        </div>

        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-12 grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12"
        >
          {features.map((f) => (
            <motion.article
              key={f.title}
              variants={staggerChild}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
              }}
              className={`group relative overflow-hidden rounded-[26px] bg-white p-6 ring-1 ring-ink/8 transition-shadow duration-500 hover:shadow-[0_32px_64px_-28px_rgba(22,18,16,0.3)] hover:ring-brand/25 sm:p-7 ${f.span}`}
            >
              <span
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(360px circle at var(--mx, 50%) var(--my, 50%), rgba(255,82,0,0.08), transparent 65%)",
                }}
                aria-hidden="true"
              />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-grid h-11 w-11 place-items-center rounded-xl bg-mint text-brand-deep ring-1 ring-brand/15 transition-colors duration-500 group-hover:bg-ink group-hover:text-lime">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-bangla text-[21px] font-bold tracking-tight text-ink">{f.title}</h3>
                  <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed text-mist">{f.desc}</p>
                </div>
                <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-ink/20 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
              </div>
              {f.visual}
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
