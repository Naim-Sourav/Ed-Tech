import { motion } from "motion/react";
import { ArrowRight, Sparkle, Smartphone } from "lucide-react";
import { Reveal, toBn } from "./ui";

const words = ["প্র্যাকটিস", "মক এক্সাম", "অ্যানালাইজ", "রিভিশন", "জয়"];

export default function CTA() {
  return (
    <section id="cta" className="relative pb-24 pt-4 sm:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="noise relative overflow-hidden rounded-[32px] bg-ink shadow-[0_60px_120px_-50px_rgba(22,18,16,0.9)] sm:rounded-[44px]">
            {/* Ambient */}
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl animate-spin-slow"
              style={{
                background:
                  "conic-gradient(from 90deg, rgba(255,82,0,0.0), rgba(255,82,0,0.38), rgba(255,185,46,0.3), rgba(255,82,0,0.0))",
              }}
              aria-hidden="true"
            />

            <div className="relative px-6 pb-24 pt-20 text-center sm:px-12 sm:pt-28">
              <motion.span
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                className="mx-auto inline-flex items-center gap-2 rounded-full bg-lime/12 px-4 py-1.5 text-[12.5px] font-bold uppercase tracking-[0.18em] text-lime ring-1 ring-lime/25"
              >
                <Sparkle className="h-3.5 w-3.5" fill="currentColor" />
                পরীক্ষা হল দেখবে তোমার নতুন রূপ
              </motion.span>

              <h2 className="mx-auto mt-7 max-w-3xl text-balance font-display text-[38px] font-bold leading-[1.02] tracking-[-0.025em] text-white sm:text-[64px]">
                Your GPA-5 era
                <br />
                starts <span className="bg-gradient-to-r from-lime to-brand-bright bg-clip-text text-transparent">tonight.</span>
              </h2>

              <p className="mx-auto mt-5 max-w-xl font-bangla text-[18px] font-semibold leading-relaxed text-white/75 sm:text-[21px]">
                আজ রাতেই প্রথম ১০টা প্রশ্ন শেষ করো — আগামীকাল সকালে তুমি আজকের চেয়ে এগিয়ে।
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href="#/signup"
                  className="focus-ring group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-lime px-9 py-4.5 text-[16.5px] font-extrabold text-ink shadow-[0_24px_54px_-16px_rgba(255,185,46,0.5)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_64px_-16px_rgba(255,185,46,0.65)] sm:w-auto"
                >
                  ফ্রি অ্যাকাউন্ট খোলো
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-lime transition-transform duration-300 group-hover:translate-x-1">
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                </a>
                <a
                  href="#top"
                  className="focus-ring group inline-flex w-full items-center justify-center gap-3 rounded-full bg-white/8 px-9 py-4.5 text-[16.5px] font-bold text-white ring-1 ring-white/15 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-white/12 sm:w-auto"
                >
                  <Smartphone className="h-5 w-5 text-lime" />
                  অ্যাপ ডাউনলোড করো
                </a>
              </div>

              <p className="mt-6 text-[13px] font-medium text-white/45">
                <span className="font-bold text-lime">{toBn("2,40,000")}+</span> শিক্ষার্থী ইতিমধ্যে অঙ্গনে · কোনো কার্ড লাগবে না
              </p>
            </div>

            {/* Outline marquee */}
            <div className="relative overflow-hidden pb-8" aria-hidden="true">
              <div className="flex w-max animate-marquee-slow opacity-80">
                {[0, 1].map((dup) => (
                  <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
                    {[...words, ...words].map((w, i) => (
                      <span
                        key={w + i + dup}
                        className="flex items-center gap-6 whitespace-nowrap pr-6 font-bangla text-[42px] font-extrabold leading-none sm:text-[56px]"
                        style={{ WebkitTextStroke: "1px rgba(255,255,255,0.16)", color: "transparent" }}
                      >
                        {w}
                        <Sparkle className="h-5 w-5 text-lime/30" fill="currentColor" />
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
