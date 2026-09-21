import { AnimatePresence, motion } from "motion/react";
import { faqs } from "./data";
import { HelpCircle, MessageCircleQuestion, Plus } from "lucide-react";
import { useState } from "react";
import { EASE, Reveal, SectionTag } from "./helpers";

function Item({ q, a, open, onToggle, index }: { q: string; a: string; open: boolean; onToggle: () => void; index: number }) {
  return (
    <Reveal delay={index * 0.06}>
      <div
        className={`group overflow-hidden rounded-3xl border transition-all duration-500 ${
          open ? "border-brand-300 bg-white shadow-xl shadow-brand-500/10" : "border-ink-100 bg-white/70 hover:border-brand-200 hover:bg-white"
        }`}
      >
        <button
          onClick={onToggle}
          aria-expanded={open}
          className="flex w-full items-center gap-4 px-6 py-5 text-left sm:px-7"
        >
          <span
            className={`grid size-9 shrink-0 place-items-center rounded-xl transition-all duration-500 ${
              open ? "bg-gradient-to-br from-brand-500 to-amber-500 text-white shadow-lg shadow-brand-500/30" : "bg-brand-50 text-brand-600"
            }`}
          >
            <MessageCircleQuestion className="size-4.5" strokeWidth={2.2} />
          </span>
          <span className={`flex-1 text-[16.5px] font-bold transition-colors ${open ? "text-brand-700" : "text-ink-900"}`}>{q}</span>
          <motion.span
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className={`grid size-8 shrink-0 place-items-center rounded-full border transition-colors ${
              open ? "border-brand-300 bg-brand-50 text-brand-600" : "border-ink-200 text-ink-500 group-hover:border-brand-300 group-hover:text-brand-600"
            }`}
          >
            <Plus className="size-4" strokeWidth={2.5} />
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <p className="px-6 pb-6 pl-[4.75rem] leading-relaxed text-ink-600 sm:px-7 sm:pl-[5rem]">{a}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  );
}

export default function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="relative py-20 sm:py-28" aria-label="সচরাচর জিজ্ঞাসা">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center">
          <Reveal>
            <SectionTag icon={<HelpCircle className="size-4" />} label="সচরাচর জিজ্ঞাসা" />
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display mt-5 text-4xl font-bold leading-[1.15] tracking-tight text-ink-950 sm:text-5xl">
              মনে যা প্রশ্ন, <span className="text-gradient">উত্তর এখানেই</span>
            </h2>
          </Reveal>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map((f, i) => (
            <Item key={f.q} q={f.q} a={f.a} index={i} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          ))}
        </div>

        <Reveal delay={0.15} className="mt-10 text-center">
          <p className="text-ink-600">
            আরও কিছু জানতে চাও?{" "}
            <a href="mailto:support@porikkhangon.app" className="font-bold text-brand-600 underline decoration-brand-300 decoration-2 underline-offset-4 transition hover:text-brand-700">
              সাপোর্টে মেসেজ করো
            </a>{" "}
            — গড়ে ৩ মিনিটে রিপ্লাই পাবে।
          </p>
        </Reveal>
      </div>
    </section>
  );
}
