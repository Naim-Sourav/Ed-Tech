import { motion } from "motion/react";
import { ArrowRight, Heart, ShieldCheck, Sparkles } from "lucide-react";
import { Reveal } from "./helpers";

export default function CTA({ onStart }: { onStart?: () => void }) {
  return (
    <section id="cta" className="relative px-4 pb-24 pt-6 sm:px-6" aria-label="শুরু করুন">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="noise relative overflow-hidden rounded-[2.5rem] bg-ink-950 px-6 py-16 text-center text-white sm:px-12 sm:py-24">
            {/* ambience */}
            <div className="dot-grid-dark absolute inset-0 opacity-60" />
            <div className="absolute -left-24 -top-28 size-96 rounded-full bg-brand-600/45 blur-3xl" />
            <div className="absolute -bottom-32 -right-16 size-[26rem] rounded-full bg-amber-600/35 blur-3xl" />
            <div className="absolute left-1/2 top-1/2 size-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/15 blur-3xl" />
            <motion.span
              animate={{ y: [0, -14, 0], rotate: [0, 14, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-[12%] top-[18%] text-gold-400/70"
            >
              <Sparkles className="size-8" />
            </motion.span>
            <motion.span
              animate={{ y: [0, 12, 0], rotate: [0, -12, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
              className="absolute right-[14%] top-[24%] text-brand-300/70"
            >
              <Sparkles className="size-6" />
            </motion.span>
            <motion.span
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              className="absolute bottom-[20%] right-[22%] text-amber-300/60"
            >
              <Sparkles className="size-5" />
            </motion.span>

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-semibold text-brand-200 backdrop-blur">
                <ShieldCheck className="size-4 text-emerald-400" /> শুরু করা সম্পূর্ণ ফ্রি · ৩০ সেকেন্ডে সাইন আপ
              </span>

              <h2 className="font-display mx-auto mt-7 max-w-3xl text-4xl font-bold leading-[1.12] tracking-tight sm:text-6xl">
                আজই প্রথম প্রশ্নটা সলভ করো —
                <br />
                <span className="text-gradient-dark">বোর্ড আর ভর্তি লড়াইয়ে এগিয়ে থাকো</span>
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/60">
                ২,৩৪,০০০+ শিক্ষার্থী প্রতিদিন সকালে পরীক্ষাঙ্গন খুলে। আজ থেকেই তুমি আর একা নও — পুরো কমিউনিটি তোমার সাথে।
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={onStart}
                  className="btn-shine group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-brand-500 to-amber-500 px-9 py-4.5 text-lg font-bold text-white shadow-2xl shadow-brand-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-brand-400/60 sm:w-auto"
                >
                  ফ্রি অ্যাকাউন্ট খোলো
                  <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                </button>
              </div>

              <p className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold text-white/45">
                <span className="inline-flex items-center gap-1.5">
                  <Heart className="size-4 fill-rose-400 text-rose-400" /> Made with love for students
                </span>
                <span className="hidden size-1 rounded-full bg-white/25 sm:block" />
                <span>দৈনিক ৫০ প্রশ্ন চিরকাল ফ্রি</span>
                <span className="hidden size-1 rounded-full bg-white/25 sm:block" />
                <span>ফোনেই সম্পূর্ণ প্রস্তুতি — আলাদা অ্যাপ লাগবে না</span>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
