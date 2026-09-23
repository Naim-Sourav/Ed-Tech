import { motion } from "motion/react";
import {
  CalendarCheck2,
  Check,
  ClipboardList,
  Compass,
  Gamepad2,
  Languages,
  MonitorCheck,
  Quote,
  ScanEye,
  TrendingUp,
  X,
} from "lucide-react";
import { comparisonRows } from "./data";
import { Reveal, SectionTag, Stagger, StaggerItem, toBn } from "./helpers";

const STEPS = [
  {
    icon: Compass,
    title: "টার্গেট ঠিক করো",
    text: "এসএসসি, এইচএসসি নাকি ঢাবি ‘ক’ ইউনিট? এক ট্যাপে পরীক্ষা বাছাই করলেই তোমার জন্য পার্সোনাল সিলেবাস-ম্যাপ তৈরি।",
    grad: "from-brand-500 to-brand-600",
  },
  {
    icon: CalendarCheck2,
    title: "প্রতিদিন স্মার্ট অনুশীলন",
    text: "অ্যাডাপ্টিভ অ্যালগরিদম তোমার দুর্বল টপিক থেকে প্রশ্ন বেছে দেয় — টাইমড সেট, ডেইলি গোল আর স্ট্রিকে প্রগতির অনুশীলন চলতে থাকে।",
    grad: "from-amber-500 to-rose-500",
  },
  {
    icon: TrendingUp,
    title: "মক দাও, র‍্যাংক জিতো",
    text: "সাপ্তাহিক লাইভ এক্সামে সেরাদের সাথে নিজেকে মাপো, ভুলগুলো রিভাইজ করো — পরীক্ষার হলে ঢুকবে পূর্ণ আত্মবিশ্বাস নিয়ে।",
    grad: "from-amber-400 to-orange-500",
  },
];

/* ── Why us (previous landing page's benefit rows) ── */
const WHY = [
  { icon: ScanEye, title: "দুর্বলতার X-ray", text: "প্রতিটি ভুল উত্তর AI অধ্যায়, টপিক আর ভুলের ধরন অনুযায়ী ম্যাপ করে — রিভিশনে শুধু দুর্বল অংশটাই ফেরত আসে।" },
  { icon: MonitorCheck, title: "হল-টেস্টড ইন্টারফেস", text: "টাইমার, OMR-স্টাইল বাবল, negative marking — সবকিছু রিয়েল পরীক্ষার মতো, তাই হলে প্রথমবারই সহজ লাগবে।" },
  { icon: Languages, title: "বাংলায় ব্যাখ্যা", text: "প্রায় সব প্রশ্নে বাংলায় ধাপে ধাপে সমাধান, চিত্র, শর্টকাট ট্রিক আর বোর্ড-স্ট্যান্ডার্ড উত্তরের ফরম্যাট।" },
  { icon: Gamepad2, title: "প্রতিদিনের অভ্যাস", text: "ডেইলি স্ট্রিক, সাপ্তাহিক লিডারবোর্ড আর বন্ধুদের সাথে ১v১ ব্যাটল — প্রস্তুতি হবে আনন্দের, বাধ্যতার নয়।" },
];

export default function Benefits() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28" aria-label="সুবিধা">
      <div className="absolute -left-40 top-40 -z-10 size-96 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="absolute -right-40 bottom-24 -z-10 size-96 rounded-full bg-gold-300/25 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <SectionTag icon={<ClipboardList className="size-4" />} label="যেভাবে এগিয়ে যাবে" />
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display mt-5 text-4xl font-bold leading-[1.15] tracking-tight text-ink-950 sm:text-5xl">
              পরীক্ষাজয়ের রুটম্যাপ, <span className="text-gradient">মাত্র ৩টা চরণে</span>
            </h2>
          </Reveal>
        </div>

        {/* steps */}
        <Stagger className="relative mt-16 grid gap-6 md:grid-cols-3" gap={0.15}>
          <div className="absolute left-[16%] right-[16%] top-12 hidden border-t-2 border-dashed border-brand-300/60 md:block" aria-hidden />
          {STEPS.map((s, i) => (
            <StaggerItem key={s.title} className="relative">
              <div className="card-shine group relative h-full rounded-card border border-ink-100 bg-white/85 p-7 backdrop-blur transition-all duration-500 hover:-translate-y-2 hover:border-brand-300 hover:shadow-[0_28px_60px_-28px_rgba(255,82,0,0.4)] sm:p-8">
                <div className="flex items-center justify-between">
                  <span
                    className={`grid size-14 place-items-center rounded-2xl bg-gradient-to-br ${s.grad} text-white shadow-xl transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110`}
                  >
                    <s.icon className="size-6" strokeWidth={2.2} />
                  </span>
                  <span className="font-display bg-gradient-to-b from-brand-200 to-transparent bg-clip-text text-6xl font-bold text-transparent">
                    {toBn(i + 1)}
                  </span>
                </div>
                <h3 className="font-display mt-6 text-2xl font-bold text-ink-950">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-ink-600">{s.text}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        {/* real students + why us (previous landing page) */}
        <div className="mt-20 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <Reveal>
            <div className="relative pb-14 sm:pb-16">
              <div className="relative overflow-hidden rounded-[1.8rem] ring-1 ring-ink-100 shadow-[0_36px_70px_-30px_rgba(22,18,16,0.45)]">
                <img
                  src={`${import.meta.env.BASE_URL}images/student-hero.jpg`}
                  alt="পরীক্ষার প্রস্তুতিতে ব্যস্ত একজন শিক্ষার্থী"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink-950/70 to-transparent" aria-hidden />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                  <p className="text-[13px] font-bold text-white">“ফিজিক্সে আমার ভয়টা এখানেই শেষ”</p>
                  <span className="rounded-full bg-gradient-to-r from-gold-300 to-amber-400 px-2.5 py-1 text-[11px] font-bold text-ink-950">
                    SSC '২৬
                  </span>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 26, rotate: 8 }}
                whileInView={{ opacity: 1, y: 0, rotate: 5 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute -bottom-2 -right-2 w-[52%] overflow-hidden rounded-2xl shadow-[0_24px_50px_-20px_rgba(22,18,16,0.55)] ring-4 ring-[#fafaf9] sm:-right-6"
              >
                <img
                  src={`${import.meta.env.BASE_URL}images/students-study.jpg`}
                  alt="ভর্তি পরীক্ষার প্রস্তুতিতে একসাথে পড়ছে শিক্ষার্থীরা"
                  className="aspect-[4/3] w-full object-cover"
                  loading="lazy"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.45, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                className="glass absolute -right-1 top-6 rounded-2xl px-4 py-3 shadow-lg sm:-right-4"
              >
                <p className="font-display text-[22px] font-bold leading-none text-ink-950">৯২%</p>
                <p className="mt-1 max-w-[110px] text-[11px] font-semibold leading-snug text-ink-500">
                  শিক্ষার্থী বলছে কনফিডেন্স বেড়েছে
                </p>
              </motion.div>
            </div>
          </Reveal>

          <Stagger className="grid gap-5 sm:grid-cols-2" gap={0.1}>
            {WHY.map((w) => (
              <StaggerItem key={w.title}>
                <div className="group h-full rounded-card border border-ink-100 bg-white/80 p-6 backdrop-blur transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-300/70 hover:shadow-[0_24px_60px_-24px_rgba(255,82,0,0.35)]">
                  <span className="inline-grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-ink-800 to-ink-950 text-white shadow-lg transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                    <w.icon className="size-5" strokeWidth={2.2} />
                  </span>
                  <h3 className="font-display mt-4 text-xl font-bold text-ink-950">{w.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-ink-600">{w.text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        {/* guidebook comparison — previous landing page's fair comparison */}
        <Reveal delay={0.1} className="mt-20">
          <div className="card-ring relative overflow-hidden rounded-panel border border-white/70 bg-white/85 backdrop-blur-xl">
            <div className="dot-grid absolute inset-0 opacity-40" aria-hidden />
            <div className="relative">
              <div className="grid grid-cols-1 gap-y-2 bg-ink-950 px-6 py-5 text-white sm:grid-cols-[150px_1fr_1fr] sm:items-center sm:gap-6 sm:px-9">
                <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.18em] text-white/50">
                  <Quote className="size-3.5" /> ফেয়ার তুলনা
                </span>
                <span className="flex items-center gap-2 text-[14px] font-semibold text-white/60">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-white/10 text-white/50">
                    <X className="size-3" strokeWidth={3.5} />
                  </span>
                  গাইডবুক + কোচিং — পুরনো পথ
                </span>
                <span className="inline-flex items-center gap-2 text-[14px] font-bold text-white">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-400 text-ink-950">
                    <Check className="size-3" strokeWidth={4} />
                  </span>
                  পরীক্ষাঙ্গনে
                </span>
              </div>

              {comparisonRows.map((row, i) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-1 gap-y-1.5 border-t border-ink-100/70 px-6 py-5 sm:grid-cols-[150px_1fr_1fr] sm:items-center sm:gap-6 sm:px-9 ${
                    i % 2 === 0 ? "bg-white/70" : "bg-brand-50/40"
                  }`}
                >
                  <p className="font-display text-[15px] font-bold text-ink-950">{row.label}</p>
                  <p className="flex items-center gap-2.5 text-[14px] text-ink-500">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-ink-100 text-rose-500">
                      <X className="size-3" strokeWidth={3.5} />
                    </span>
                    {row.old}
                  </p>
                  <p className="flex items-center gap-2.5 text-[14px] font-semibold text-ink-950">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                      <Check className="size-3" strokeWidth={3.5} />
                    </span>
                    {row.new}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
