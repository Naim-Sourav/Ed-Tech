import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight, BadgeCheck, Clock3, FileText } from "lucide-react";
import { Reveal, SectionTag, staggerParent, staggerChild } from "./ui";
import LazyLottie from "./LazyLottie";
import { ADMISSION_HUB_PATH, ADMISSION_INSTITUTIONS, institutionPath } from "../../data/admissionExams";

/**
 * "বিগত বছরের প্রশ্ন" — links the landing page to the static, indexable
 * previous-year paper pages (/admission-questions/…). The student-solving-
 * MCQ-sheets Lottie from the previous landing page ("Exams preparation")
 * finally has a home that matches its subject — and its warm orange palette.
 *
 * Plain <a href> (not <Link>) on purpose: a full navigation serves the
 * pre-rendered HTML page, which is also what search engines index.
 */

const featured = ADMISSION_INSTITUTIONS.slice(0, 8);

export default function PastPapers() {
  return (
    <section id="past-papers" className="relative overflow-hidden py-20 sm:py-28">
      <div
        className="pointer-events-none absolute -right-40 top-10 h-[520px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(255,82,0,0.12),transparent)] blur-2xl"
        aria-hidden="true"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Copy */}
          <div className="lg:col-span-6">
            <Reveal>
              <SectionTag>বিগত বছরের প্রশ্ন · Past papers</SectionTag>
              <h2 className="mt-5 font-display text-[34px] font-bold leading-[1.06] tracking-[-0.02em] text-ink sm:text-[46px]">
                Solve the
                <span className="bg-gradient-to-r from-brand-deep to-brand-bright bg-clip-text text-transparent"> real papers </span>
                first.
              </h2>
              <p className="mt-5 max-w-lg font-bangla text-[17px] font-semibold text-brand-deep">
                মেডিকেল, ঢাবি, বুয়েট, GST — বিগত বছরের প্রতিটি প্রশ্ন, সঠিক উত্তর ও ব্যাখ্যাসহ। ফ্রি, লগইন ছাড়াই।
              </p>
              <p className="mt-3 max-w-lg text-[15.5px] leading-relaxed text-mist">
                প্রতিটি সেশনের পূর্ণাঙ্গ প্রশ্নপত্র বিষয় অনুযায়ী সাজানো — উত্তর লুকিয়ে নিজে সলভ করো, তারপর
                ব্যাখ্যা মিলিয়ে নাও। প্রশ্নগুলো সরাসরি পরীক্ষাঙ্গনের প্রশ্নব্যাংক থেকে।
              </p>
            </Reveal>

            {/* Featured paper */}
            <Reveal delay={0.12}>
              <a
                href={`${ADMISSION_HUB_PATH}medical/2024-25/`}
                className="focus-ring group mt-8 flex items-center gap-4 rounded-[24px] bg-white p-4 ring-1 ring-ink/8 shadow-[0_24px_54px_-30px_rgba(22,18,16,0.45)] transition-all duration-300 hover:-translate-y-1 hover:ring-brand/30 sm:p-5"
              >
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-mint text-brand-deep ring-1 ring-brand/15">
                  <FileText className="h-6 w-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bangla text-[17px] font-extrabold leading-snug text-ink">
                    মেডিকেল ভর্তি পরীক্ষা ২০২৪-২৫ — প্রশ্ন ও সমাধান
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] font-semibold text-mist">
                    <span className="inline-flex items-center gap-1"><BadgeCheck className="h-3.5 w-3.5 text-brand" /> ব্যাখ্যাসহ উত্তর</span>
                    <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5 text-brand" /> টাইমার সহ পরীক্ষা</span>
                  </span>
                </span>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-lime transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </span>
              </a>
            </Reveal>

            {/* Institutions */}
            <motion.div
              variants={staggerParent}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="mt-6 flex flex-wrap gap-2"
            >
              {featured.map((inst) => (
                <motion.a
                  key={inst.id}
                  variants={staggerChild}
                  href={institutionPath(inst)}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13.5px] font-bold text-ink ring-1 ring-ink/10 transition-all hover:-translate-y-0.5 hover:text-brand-deep hover:ring-brand/40"
                >
                  {inst.short}
                  <ArrowUpRight className="h-3.5 w-3.5 text-brand" />
                </motion.a>
              ))}
              <motion.a
                variants={staggerChild}
                href={ADMISSION_HUB_PATH}
                className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[13.5px] font-bold text-paper transition-all hover:-translate-y-0.5 hover:bg-brand-deep"
              >
                সব প্রশ্নপত্র দেখো
                <ArrowRight className="h-3.5 w-3.5" />
              </motion.a>
            </motion.div>
          </div>

          {/* Visual — the old hero Lottie (student solving MCQ sheets) */}
          <div className="lg:col-span-6">
            <Reveal delay={0.15} className="relative mx-auto w-full max-w-[540px]">
              <div
                className="absolute inset-6 rounded-[48px] bg-[radial-gradient(closest-side,rgba(255,185,46,0.22),rgba(255,82,0,0.06),transparent)] blur-2xl"
                aria-hidden="true"
              />
              <LazyLottie
                load={() => import("../../assets/lottie/hero-animation.json")}
                className="relative aspect-square w-full"
                label="একজন শিক্ষার্থী ডেস্কে বসে MCQ উত্তরপত্র সমাধান করছে — চারপাশে গণিতের সূত্র ও ঘড়ি"
              />

              {/* Floating stat chips, same language as the hero */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="glass absolute left-2 top-8 rounded-2xl px-4 py-3 shadow-lg animate-float-slow sm:left-0"
              >
                <p className="font-display text-[20px] font-bold leading-none text-ink">১০০ প্রশ্ন</p>
                <p className="mt-1 text-[11px] font-semibold text-mist">৬০ মিনিট · ০.২৫ নেগেটিভ</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.65, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="glass absolute bottom-10 right-2 rounded-2xl px-4 py-3 shadow-lg animate-float sm:right-0"
              >
                <p className="text-[11px] font-semibold text-mist">সূত্র ট্যাগ</p>
                <p className="mt-0.5 font-display text-[15px] font-bold leading-none text-brand-deep">Medical '24-25</p>
              </motion.div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
