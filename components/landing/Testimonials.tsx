import { motion } from "motion/react";
import { Star, Quote, BadgeCheck } from "lucide-react";
import { testimonials } from "./data";
import { Reveal, SectionTag, staggerParent, staggerChild } from "./ui";

const avatarColors = ["bg-brand", "bg-ink", "bg-gold", "bg-flag", "bg-brand-deep"];

export default function Testimonials() {
  const [featured, ...rest] = testimonials;

  return (
    <section id="testimonials" className="relative overflow-hidden bg-cream/50 py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-ink/8" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionTag>রেজাল্ট বলেই কথা · Testimonials</SectionTag>
          <h2 className="mt-5 font-display text-[34px] font-bold leading-[1.05] tracking-[-0.02em] text-ink sm:text-[52px]">
            Results speak
            <br />
            <span className="bg-gradient-to-r from-brand-deep to-brand-bright bg-clip-text text-transparent">
              louder than promises.
            </span>
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-mist">
            ভিকারুননিসা থেকে ময়মনসিংহ ক্যাডেট, ঢাবি ক-ইউনিট থেকে ঢামেক — তোমাদের গল্পই আমাদের সেরা মার্কেটিং।
          </p>
        </Reveal>

        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-14 grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3"
        >
          {/* Featured */}
          <motion.blockquote
            variants={staggerChild}
            whileHover={{ y: -6 }}
            className="noise relative flex flex-col justify-between overflow-hidden rounded-[26px] bg-ink p-7 text-white shadow-[0_40px_80px_-36px_rgba(22,18,16,0.8)] lg:col-span-2 sm:p-9"
          >
            <span
              className="pointer-events-none absolute -bottom-8 right-2 select-none font-bangla text-[150px] font-extrabold leading-none text-white/[0.045] sm:text-[200px]"
              aria-hidden="true"
            >
              GPA-5
            </span>
            <div className="relative">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-gold" fill="currentColor" />
                  ))}
                </span>
                <span className="rounded-full bg-lime px-3 py-1 text-[12px] font-bold text-ink">{featured.result}</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold text-white/70 ring-1 ring-white/15">
                  {featured.exam}
                </span>
              </div>
              <p className="mt-6 max-w-xl font-bangla text-[20px] font-semibold leading-relaxed text-white/95 sm:text-[24px]">
                “{featured.quote}”
              </p>
            </div>
            <footer className="relative mt-8 flex items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-lime font-display text-[15px] font-bold text-ink">
                {featured.initials}
              </span>
              <div>
                <p className="flex items-center gap-1.5 text-[15.5px] font-bold">
                  {featured.name}
                  <BadgeCheck className="h-4 w-4 text-lime" />
                </p>
                <p className="text-[13px] font-medium text-white/55">{featured.org}</p>
              </div>
            </footer>
          </motion.blockquote>

          {/* Rest */}
          {rest.map((t, i) => (
            <motion.blockquote
              key={t.name}
              variants={staggerChild}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className="group relative flex flex-col justify-between rounded-[26px] bg-white p-6 ring-1 ring-ink/8 transition-shadow duration-500 hover:shadow-[0_28px_56px_-28px_rgba(22,18,16,0.3)] sm:p-7"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-lime-soft px-3 py-1 text-[11.5px] font-bold text-ink">{t.result}</span>
                  <span className="rounded-full bg-paper px-3 py-1 text-[11.5px] font-semibold text-mist ring-1 ring-ink/8">
                    {t.exam}
                  </span>
                </div>
                <Quote className="mt-5 h-5 w-5 text-brand/30 transition-colors duration-500 group-hover:text-brand" fill="currentColor" />
                <p className="mt-3 font-bangla text-[15.5px] font-medium leading-relaxed text-ink/85">“{t.quote}”</p>
              </div>
              <footer className="mt-6 flex items-center gap-3 border-t border-ink/6 pt-5">
                <span className={`grid h-10 w-10 place-items-center rounded-full font-display text-[13px] font-bold text-white ${avatarColors[i % avatarColors.length]}`}>
                  {t.initials}
                </span>
                <div>
                  <p className="flex items-center gap-1.5 text-[14.5px] font-bold text-ink">
                    {t.name}
                    <BadgeCheck className="h-3.5 w-3.5 text-brand" />
                  </p>
                  <p className="text-[12.5px] font-medium text-mist">{t.org}</p>
                </div>
              </footer>
            </motion.blockquote>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
