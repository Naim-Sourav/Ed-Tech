import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ArrowRight, Timer, TrendingUp } from "lucide-react";
import { showcaseTabs } from "./LandingContent";
import { Reveal, SectionTag, toBn } from "./ui";

export default function Showcase() {
  const [active, setActive] = useState(showcaseTabs[0].id);
  const tab = showcaseTabs.find((t) => t.id === active)!;

  return (
    <section id="showcase" className="noise relative overflow-hidden bg-ink py-24 sm:py-32">
      {/* Ambient */}
      <div className="pointer-events-none absolute -top-40 left-1/3 h-[500px] w-[700px] rounded-full bg-brand/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-48 -right-32 h-[420px] w-[520px] rounded-full bg-lime/10 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <Reveal className="max-w-2xl">
            <SectionTag dark>লাইভ প্রোডাক্ট ট্যুর · Showcase</SectionTag>
            <h2 className="mt-5 font-display text-[34px] font-bold leading-[1.05] tracking-[-0.02em] text-white sm:text-[52px]">
              One app.
              <br />
              Every exam <span className="text-lime">you're fighting.</span>
            </h2>
          </Reveal>

          {/* Tabs */}
          <Reveal delay={0.15}>
            <div className="flex rounded-full bg-white/8 p-1.5 ring-1 ring-white/10" role="tablist" aria-label="Exam tracks">
              {showcaseTabs.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={active === t.id}
                  onClick={() => setActive(t.id)}
                  className="focus-ring relative rounded-full px-5 py-2.5 sm:px-7"
                >
                  {active === t.id && (
                    <motion.span
                      layoutId="tab-pill"
                      className="absolute inset-0 rounded-full bg-lime"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span
                    className={`relative z-10 flex flex-col items-center leading-none transition-colors duration-300 ${
                      active === t.id ? "text-ink" : "text-white/55 hover:text-white"
                    }`}
                  >
                    <span className="font-display text-[15px] font-bold">{t.label}</span>
                    <span className="mt-0.5 font-bangla text-[10.5px] font-semibold">{t.labelBn}</span>
                  </span>
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[1fr_1.08fr] lg:gap-16">
          {/* Left copy */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab.id + "-copy"}
              initial={{ opacity: 0, x: -26 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className="text-balance font-display text-[27px] font-bold leading-tight tracking-[-0.01em] text-white sm:text-[38px]">
                {tab.headline}
              </h3>
              <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-white/65">{tab.copy}</p>

              <ul className="mt-8 space-y-5">
                {tab.bullets.map((b, i) => (
                  <motion.li
                    key={b.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.1, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                    className="flex gap-4"
                  >
                    <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-lime/15 text-lime ring-1 ring-lime/25">
                      <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
                    </span>
                    <div>
                      <p className="font-bangla text-[16.5px] font-bold text-white">{b.title}</p>
                      <p className="mt-1 text-[14.5px] leading-relaxed text-white/60">{b.desc}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>

              <a
                href="#pricing"
                className="focus-ring group mt-9 inline-flex items-center gap-2.5 text-[16px] font-bold text-lime"
              >
                {tab.labelBn} প্রস্তুতি শুরু করো
                <span className="grid h-7 w-7 place-items-center rounded-full bg-lime text-ink transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowRight className="h-4 w-4" strokeWidth={3} />
                </span>
              </a>
            </motion.div>
          </AnimatePresence>

          {/* Right mock panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab.id + "-panel"}
              initial={{ opacity: 0, y: 36, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.98 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="glass-dark relative overflow-hidden rounded-[26px] p-6 shadow-[0_44px_90px_-30px_rgba(0,0,0,0.7)] sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate font-bangla text-[17px] font-bold text-white sm:text-[19px]">{tab.mock.exam}</p>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-lime/12 px-3 py-1 text-[12px] font-bold text-lime ring-1 ring-lime/20">
                    <Timer className="h-3.5 w-3.5" /> {tab.mock.chip}
                  </span>
                </div>

                <div className="mt-7 space-y-4">
                  {tab.mock.rows.map((r, i) => (
                    <div key={r.name}>
                      <div className="flex items-center justify-between text-[13px] font-semibold">
                        <span className={r.accent ? "text-lime" : "text-white/75"}>{r.name}</span>
                        <span className="font-display tabular-nums text-white/50">{toBn(String(r.progress))}%</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${r.progress}%` }}
                          transition={{ duration: 1.1, delay: 0.25 + i * 0.14, ease: [0.16, 1, 0.3, 1] }}
                          className={`h-full rounded-full ${
                            r.accent
                              ? "bg-gradient-to-r from-brand-bright to-lime"
                              : "bg-white/35"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/[0.07] p-5 ring-1 ring-white/10">
                    <p className="text-[12px] font-bold uppercase tracking-wider text-white/45">{tab.mock.statLabel}</p>
                    <p className="mt-1.5 font-display text-[38px] font-bold leading-none text-lime">{tab.mock.statValue}</p>
                  </div>
                  <div className="flex flex-col justify-center rounded-2xl bg-white/[0.07] p-5 ring-1 ring-white/10">
                    <p className="flex items-center gap-2 text-[13.5px] font-bold text-white">
                      <TrendingUp className="h-4 w-4 text-lime" /> {tab.mock.statDelta}
                    </p>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/50">
                      অ্যানালিটিক্স থেকে লাইভ আপডেটেড
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating live pill */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="glass-dark absolute -top-5 right-6 flex items-center gap-2.5 rounded-full px-4 py-2 shadow-xl sm:right-10"
                aria-hidden="true"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute h-full w-full rounded-full bg-lime animate-pulse-ring" />
                  <span className="relative h-2 w-2 rounded-full bg-lime" />
                </span>
                <span className="text-[12.5px] font-bold text-white">
                  <span className="font-display tabular-nums text-lime">{toBn(String(5230 + 117))}</span> জন এখন লাইভ
                </span>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
