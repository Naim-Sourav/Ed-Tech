import { Quote, Star } from "lucide-react";
import { Reveal, SectionTag } from "./helpers";

import type { Testimonial } from "./data";
import { testimonials } from "./data";

const GRADS = [
  "from-brand-500 to-brand-700",
  "from-amber-400 to-orange-600",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-orange-500",
];

type TM = Testimonial & { grad: string };

const ROWS: TM[][] = [
  testimonials.slice(0, 3).map((t, i) => ({ ...t, grad: GRADS[i % GRADS.length] })),
  testimonials.slice(3).map((t, i) => ({ ...t, grad: GRADS[(i + 3) % GRADS.length] })),
];

function TCard({ t }: { t: TM }) {
  return (
    <figure className="card-shine group relative mx-2.5 w-[21rem] shrink-0 rounded-3xl border border-ink-100 bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/15 sm:w-[24rem]">
      <Quote className="absolute right-6 top-6 size-8 text-brand-100 transition-colors duration-500 group-hover:text-brand-200" />
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="size-4 fill-gold-400 text-gold-400" />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-brand-50 px-3 py-1 text-[11.5px] font-bold text-brand-700 ring-1 ring-brand-500/15">
          {t.result}
        </span>
        <span className="rounded-full bg-ink-50 px-3 py-1 text-[11.5px] font-semibold text-ink-600 ring-1 ring-ink-200/70">
          {t.exam}
        </span>
      </div>
      <blockquote className="mt-4 min-h-[7.5rem] text-[14.5px] leading-relaxed text-ink-700">“{t.quote}”</blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-ink-100 pt-4">
        <span className={`grid size-11 place-items-center rounded-2xl bg-gradient-to-br ${t.grad} font-display text-base font-bold text-white shadow-md`}>
          {t.name.slice(0, 1)}
        </span>
        <span>
          <span className="block text-[15px] font-bold text-ink-900">{t.name}</span>
          <span className="block text-[12.5px] font-medium text-ink-500">{t.org}</span>
        </span>
      </figcaption>
    </figure>
  );
}

function Row({ items, reverse }: { items: TM[]; reverse?: boolean }) {
  return (
    <div className="flex w-max">
      <div className={`flex ${reverse ? "marquee-third-slow marquee-third-reverse" : "marquee-third-slow"}`}>
        {[0, 1, 2].flatMap((dup) =>
          items.map((t, i) => <TCard key={`${t.name}-${dup}-${i}`} t={t} />),
        )}
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section id="reviews" className="relative overflow-hidden py-20 sm:py-28" aria-label="শিক্ষার্থীদের মতামত">
      <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-brand-50/80 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <SectionTag icon={<Star className="size-4 fill-current" />} label="সাক্ষাৎ সাফল্য" />
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display mt-5 text-4xl font-bold leading-[1.15] tracking-tight text-ink-950 sm:text-5xl">
              যারা জিতেছে, <span className="text-gradient">তারাই বলছে</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-5 text-lg leading-relaxed text-ink-600">
              এসএসসি, এইচএসসি আর ভর্তি যোদ্ধাদের প্রতিদিনের সাথী — শোনো তাদের নিজের মুখেই।
            </p>
          </Reveal>
        </div>
      </div>

      <Reveal delay={0.15} className="marquee-paused mt-14">
        <div className="space-y-5 [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]">
          <Row items={ROWS[0]} />
          <Row items={ROWS[1]} reverse />
        </div>
      </Reveal>
    </section>
  );
}
