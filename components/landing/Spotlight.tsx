import { motion } from "motion/react";
import { ArrowRight, Bot, CalendarCheck2, Camera, Flame, MessageSquareText, Sparkles, Target, TrendingUp } from "lucide-react";
import { Reveal, SectionTag, staggerParent, staggerChild } from "./ui";
import LazyLottie from "./LazyLottie";

/**
 * Spotlight — two alternating feature rows that re-home the illustrated
 * Lottie scenes from the previous landing page:
 *
 *   • learning.json  (student at a laptop, chat bubbles)  → পরীক্ষাঙ্গন AI টিউটর
 *   • CALENDER.json  (calendar, clock, sticky notes)      → ডেইলি চ্যালেঞ্জ, স্ট্রিক ও প্রোগ্রেস
 *
 * Both animations are lazy-loaded (see LazyLottie) so the landing bundle
 * does not grow.
 */

const rows = [
  {
    id: "ai-tutor",
    tag: "AI টিউটর · 24/7",
    titleA: "A tutor that never",
    titleB: "sleeps.",
    lead: "পরীক্ষাঙ্গন AI টিউটর — যেকোনো প্রশ্নের ছবি তুলে বা লিখে পাঠাও, মুহূর্তেই ধাপে ধাপে ব্যাখ্যা।",
    body: "রাত ২টায় ফিজিক্সের অঙ্কে আটকে গেছো? স্যারকে না জ্বালিয়ে AI টিউটরকে জিজ্ঞেস করো — বাংলায়, তোমার সিলেবাস ধরে, যতবার খুশি।",
    bullets: [
      { icon: Camera, text: "ছবি তুলে পাঠাও — হাতে লেখা অঙ্কও বোঝে" },
      { icon: MessageSquareText, text: "ধাপে ধাপে ব্যাখ্যা, শুধু উত্তর নয়" },
      { icon: Sparkles, text: "কনসেপ্ট না বুঝলে আরও সহজ করে বলে" },
    ],
    cta: { label: "AI টিউটর ব্যবহার করো", href: "/bot" },
    lottie: () => import("../../assets/lottie/learning.json"),
    label: "একজন শিক্ষার্থী ল্যাপটপে AI টিউটরের সাথে চ্যাট করছে",
    glow: "rgba(59,130,246,0.16)",
    aspect: "aspect-[1330/920]",
    reverse: false,
  },
  {
    id: "habit",
    tag: "অভ্যাস · Streaks & challenges",
    titleA: "Small daily wins,",
    titleB: "big exam day.",
    lead: "প্রতিদিনের ডেইলি চ্যালেঞ্জ, স্ট্রিক আর কোয়েস্ট — অভ্যাসটাই তোমাকে এগিয়ে রাখে।",
    body: "প্রতিদিন একটা নতুন চ্যালেঞ্জ সেট, স্ট্রিক ধরে রাখার তাগিদ, আর সপ্তাহ শেষে প্রোগ্রেস রিপোর্ট — কোন অধ্যায়ে দুর্বল, কোথায় এগিয়ে, এক নজরে।",
    bullets: [
      { icon: CalendarCheck2, text: "ডেইলি চ্যালেঞ্জ — প্রতিদিন নতুন প্রশ্ন সেট" },
      { icon: Flame, text: "স্ট্রিক ও XP — ধারাবাহিকতার পুরস্কার" },
      { icon: TrendingUp, text: "প্রোগ্রেস ট্র্যাকিং — অধ্যায়ভিত্তিক দুর্বলতা রিপোর্ট" },
    ],
    cta: { label: "আজকের চ্যালেঞ্জ নাও", href: "/challenges" },
    lottie: () => import("../../assets/lottie/CALENDER.json"),
    label: "ক্যালেন্ডার, ঘড়ি ও স্টিকি নোটসহ একজন শিক্ষার্থী পড়ার রুটিন ঠিক করছে",
    glow: "rgba(45,212,191,0.18)",
    aspect: "aspect-square",
    reverse: true,
  },
] as const;

export default function Spotlight() {
  return (
    <section id="spotlight" className="relative overflow-hidden py-20 sm:py-28">
      <div
        className="pointer-events-none absolute -left-48 top-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(255,185,46,0.14),transparent)] blur-2xl"
        aria-hidden="true"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionTag>প্রতিদিনের সঙ্গী · Beyond the question bank</SectionTag>
          <h2 className="mt-5 font-display text-[34px] font-bold leading-[1.06] tracking-[-0.02em] text-ink sm:text-[46px]">
            Practice is half the story.
            <br />
            <span className="bg-gradient-to-r from-brand-deep to-brand-bright bg-clip-text text-transparent">Here's the other half.</span>
          </h2>
        </Reveal>

        <div className="mt-16 space-y-24 sm:mt-20 sm:space-y-32">
          {rows.map((row, i) => {
            const Icon = i === 0 ? Bot : Target;
            return (
              <div key={row.id} className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
                {/* Visual */}
                <Reveal
                  delay={0.1}
                  className={`lg:col-span-6 ${row.reverse ? "lg:order-2" : ""}`}
                >
                  <div className="relative mx-auto w-full max-w-[560px]">
                    <div
                      className="absolute inset-4 rounded-[44px] blur-2xl"
                      style={{ background: `radial-gradient(closest-side, ${row.glow}, transparent)` }}
                      aria-hidden="true"
                    />
                    <div className="relative overflow-hidden rounded-[32px] bg-white/70 p-4 ring-1 ring-ink/8 shadow-[0_36px_80px_-36px_rgba(22,18,16,0.45)] backdrop-blur sm:p-6">
                      <LazyLottie load={row.lottie} className={`${row.aspect} w-full`} label={row.label} />
                    </div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.45, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                      className={`glass absolute -bottom-4 rounded-2xl px-4 py-3 shadow-lg ${row.reverse ? "left-2 sm:-left-4" : "right-2 sm:-right-4"}`}
                    >
                      <p className="flex items-center gap-2 text-[12px] font-bold text-ink">
                        <Icon className="h-4 w-4 text-brand" />
                        {i === 0 ? "উত্তর এলো ৩ সেকেন্ডে" : "১৪ দিনের স্ট্রিক 🔥"}
                      </p>
                    </motion.div>
                  </div>
                </Reveal>

                {/* Copy */}
                <div className={`lg:col-span-6 ${row.reverse ? "lg:order-1" : ""}`}>
                  <Reveal>
                    <SectionTag>{row.tag}</SectionTag>
                    <h3 className="mt-5 font-display text-[30px] font-bold leading-[1.08] tracking-[-0.02em] text-ink sm:text-[40px]">
                      {row.titleA}
                      <br />
                      <span className="bg-gradient-to-r from-brand-deep to-brand-bright bg-clip-text text-transparent">{row.titleB}</span>
                    </h3>
                    <p className="mt-5 max-w-lg font-bangla text-[17px] font-semibold text-brand-deep">{row.lead}</p>
                    <p className="mt-3 max-w-lg text-[15.5px] leading-relaxed text-mist">{row.body}</p>
                  </Reveal>

                  <motion.ul
                    variants={staggerParent}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-60px" }}
                    className="mt-7 space-y-3"
                  >
                    {row.bullets.map((b) => (
                      <motion.li key={b.text} variants={staggerChild} className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-mint text-brand-deep ring-1 ring-brand/15">
                          <b.icon className="h-4.5 w-4.5" />
                        </span>
                        <span className="text-[15px] font-semibold text-ink/85">{b.text}</span>
                      </motion.li>
                    ))}
                  </motion.ul>

                  <Reveal delay={0.2}>
                    <a
                      href={row.cta.href}
                      className="focus-ring group mt-8 inline-flex items-center gap-2.5 rounded-full bg-ink px-6 py-3.5 text-[15px] font-bold text-paper shadow-[0_18px_40px_-18px_rgba(22,18,16,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-deep"
                    >
                      {row.cta.label}
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-lime text-ink transition-transform duration-300 group-hover:translate-x-1">
                        <ArrowRight className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                    </a>
                  </Reveal>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
