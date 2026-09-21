import { motion } from "motion/react";
import { BookOpenCheck, GraduationCap, ShieldCheck, Star } from "lucide-react";
import { EXAM_STRIP, schools, subjects } from "./data";
import { CountUp, Reveal } from "./helpers";

const STATS = [
  { icon: BookOpenCheck, value: 52000, suffix: "+", label: "নির্ভুল প্রশ্ন ও রেফারেন্সসহ ব্যাখ্যা", grad: "from-brand-500 to-brand-700" },
  { icon: GraduationCap, value: 234000, suffix: "+", label: "সক্রিয় শিক্ষার্থী প্রতিদিন অনুশীলন করে", grad: "from-amber-500 to-brand-800" },
  { icon: Star, value: 95, suffix: "%", label: "শিক্ষার্থী ১ মাসে স্কোর উন্নত করেছে", grad: "from-amber-400 to-orange-600" },
  { icon: ShieldCheck, value: 92, suffix: "%", label: "বোর্ড পরীক্ষায় পরিচিতধর্মী প্রশ্ন কমন পড়েছে", grad: "from-emerald-500 to-teal-600" },
];

function StripRow({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const group = (
    <div className="flex items-center gap-3 pr-3">
      {items.map((t) => (
        <span
          key={t}
          className="flex items-center gap-3 whitespace-nowrap rounded-full border border-brand-500/15 bg-white/80 px-5 py-2.5 text-sm font-semibold text-ink-700 shadow-sm backdrop-blur transition-colors hover:border-brand-400 hover:text-brand-700"
        >
          <span className="size-1.5 rounded-full bg-gradient-to-r from-brand-500 to-amber-500" />
          {t}
        </span>
      ))}
    </div>
  );
  return (
    <div className="flex w-max py-1">
      <div className={`flex ${reverse ? "marquee-third marquee-third-reverse" : "marquee-third"}`}>
        {[0, 1, 2].map((k) => (
          <div key={k} className="flex shrink-0" aria-hidden={k > 0}>
            {group}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Trust() {
  return (
    <section id="trust" className="relative py-14 sm:py-20" aria-label="বিশ্বাস ও পরিসংখ্যান">
      {/* exam strip — SSC · HSC · Admission only */}
      <div className="marquee-paused relative -mx-4 space-y-3 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        <StripRow items={EXAM_STRIP} />
        <div className="-ml-16">
          <StripRow items={subjects} reverse />
        </div>
      </div>

      {/* stats band */}
      <div className="mx-auto mt-14 max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="card-ring relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-2 backdrop-blur-xl">
            <div className="dot-grid absolute inset-0 opacity-60" />
            <div className="relative grid grid-cols-2 divide-x divide-y divide-ink-100/80 lg:grid-cols-4 lg:divide-y-0">
              {STATS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="group flex flex-col items-center gap-3 px-4 py-8 text-center transition-colors duration-500 hover:bg-brand-50/60"
                >
                  <span
                    className={`grid size-12 place-items-center rounded-2xl bg-gradient-to-br ${s.grad} text-white shadow-lg transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110`}
                  >
                    <s.icon className="size-5" strokeWidth={2.2} />
                  </span>
                  <CountUp
                    to={s.value}
                    suffix={s.suffix}
                    className="font-display text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl"
                  />
                  <p className="text-sm font-medium leading-snug text-ink-500">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* institutions marquee (previous landing page) */}
        <Reveal delay={0.15} className="mt-14">
          <p className="text-center text-xs font-bold uppercase tracking-[0.22em] text-ink-400">
            দেশের সেরা প্রতিষ্ঠানের শিক্ষার্থীদের আস্থা
          </p>
          <div className="mt-6 overflow-hidden" aria-label="Institutions our students come from">
            <div className="flex w-max marquee-third-slow">
              {[0, 1, 2].map((dup) => (
                <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup > 0}>
                  {schools.map((s) => (
                    <span
                      key={s + dup}
                      className="flex items-center gap-3 whitespace-nowrap pr-10 font-display text-[19px] font-semibold text-ink-300 transition-colors hover:text-brand-600"
                    >
                      {s}
                      <GraduationCap className="size-4 text-brand-400/60" />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
