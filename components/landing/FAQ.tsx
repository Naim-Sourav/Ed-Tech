import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, MessageCircle, Clock } from "lucide-react";
import { faqs } from "./data";
import { Reveal, SectionTag, toBn } from "./ui";

function FaqItem({ q, a, open, onToggle, index }: { q: string; a: string; open: boolean; onToggle: () => void; index: number }) {
  return (
    <div className="border-b border-ink/10">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="focus-ring group flex w-full items-center justify-between gap-4 py-5 text-left sm:py-6"
      >
        <span className="flex items-baseline gap-4">
          <span className={`font-display text-[13px] font-bold tabular-nums transition-colors ${open ? "text-brand" : "text-ink/25"}`}>
            {toBn(String(index + 1).padStart(2, "0"))}
          </span>
          <span className={`font-bangla text-[16.5px] font-bold transition-colors duration-300 sm:text-[18px] ${open ? "text-ink" : "text-ink/70 group-hover:text-ink"}`}>
            {q}
          </span>
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ring-1 transition-colors duration-300 ${
            open ? "bg-brand text-white ring-brand" : "bg-white text-ink ring-ink/12 group-hover:ring-brand/40"
          }`}
        >
          <Plus className="h-4.5 w-4.5" strokeWidth={2.5} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl pb-6 pl-10 text-[14.5px] leading-relaxed text-mist sm:pl-11">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <SectionTag>জিজ্ঞাসা · FAQ</SectionTag>
              <h2 className="mt-5 font-display text-[34px] font-bold leading-[1.06] tracking-[-0.02em] text-ink sm:text-[46px]">
                Questions?
                <br />
                <span className="bg-gradient-to-r from-brand-deep to-brand-bright bg-clip-text text-transparent">
                  Answered. সাবলীলভাবে।
                </span>
              </h2>
              <p className="mt-4 max-w-sm text-[15.5px] leading-relaxed text-mist">
                যে প্রশ্নগুলো শিক্ষার্থীরা সবচেয়ে বেশি করে — সবগুলোর উত্তর একসাথে। না পেলে সরাসরি জিজ্ঞেস করো।
              </p>
            </Reveal>

            <Reveal delay={0.15} className="mt-8">
              <div className="rounded-[22px] bg-mint p-6 ring-1 ring-brand/15">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-white">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-bangla text-[16px] font-bold text-ink">এখনও প্রশ্ন আছে?</p>
                    <p className="text-[13px] font-medium text-brand-deep">মেসেঞ্জারে নক করো — মানুষ উত্তর দেবে</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href="#cta"
                    className="focus-ring inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[13px] font-bold text-paper transition-transform hover:-translate-y-0.5"
                  >
                    হেল্প চ্যাট খোলো
                  </a>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-2 text-[12.5px] font-semibold text-ink/70 ring-1 ring-ink/8">
                    <Clock className="h-3.5 w-3.5" /> প্রতিদিন সকাল ৯টা – রাত ১১টা
                  </span>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div className="border-t border-ink/10">
              {faqs.map((f, i) => (
                <FaqItem
                  key={f.q}
                  q={f.q}
                  a={f.a}
                  index={i}
                  open={open === i}
                  onToggle={() => setOpen(open === i ? null : i)}
                />
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
