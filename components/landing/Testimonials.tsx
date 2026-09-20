import React from 'react';
import { Quote } from 'lucide-react';
import { Reveal, SectionHead, Monogram } from './primitives';

/* ------------------------------------------------------------------ */
/*  TESTIMONIALS — quote cards with monogram avatars.                  */
/*  NOTE: copy here is placeholder marketing text — replace with real, */
/*  consented student stories before any paid campaign.                */
/* ------------------------------------------------------------------ */

const QUOTES = [
  {
    tag: 'এইচএসসি ’২৫',
    name: 'তানভীর',
    quote:
      'অ্যানালিটিক্স ড্যাশবোর্ড দেখে জানলাম পদার্থের “চুম্বক” অধ্যায়ে আমার বেশিরভাগ ভুল। এক সপ্তাহ শুধু সেটা ঠিক করলাম — বাকিটা ইতিহাস।',
  },
  {
    tag: 'এসএসসি ’২৫',
    name: 'সাদিয়া',
    quote:
      'মডেল টেস্টের ইন্টারফেস এতটাই চেনা লেগেছিল যে বোর্ড পরীক্ষার MCQ খাতায় চাপটাই অনুভব করিনি।',
  },
  {
    tag: 'ভর্তি প্রস্তুতি',
    name: 'মেহরাব',
    quote:
      'টাইম-অ্যাটাক মোডে মাসের পর মাস প্র্যাকটিস করেছি — হলে প্রশ্ন শেষ করে হাতে সময় বেঁচেছিল।',
  },
  {
    tag: 'গ্রাম থেকে প্রস্তুতি',
    name: 'রিয়া',
    quote:
      'এলাকায় ভালো কোচিং নেই। ফোন আর পরীক্ষাঙ্গন-ই আমার পুরো প্রস্তুতি — অফলাইন প্যাক নামিয়ে রাতে চর্চা করতাম।',
  },
  {
    tag: 'ব্যাটল প্রেমী',
    name: 'নাবিল',
    quote:
      'বন্ধুদের সাথে ১v১ ব্যাটল করতে করতে বুঝতেই পারিনি কত হাজার প্রশ্ন প্র্যাকটিস হয়ে গেছে।',
  },
];

export const Testimonials: React.FC = () => (
  <section className="lk-cream py-20 md:py-28 border-b border-[#EFE7DA] dark:border-white/8">
    <div className="mx-auto max-w-7xl px-5 md:px-8">
      <SectionHead
        eyebrow="রেজাল্ট বলেই কথা"
        title={
          <>
            প্রতিশ্রুতি নয়, <span className="text-[#FF5200] dark:text-orange-400">ফলাফল</span> কথা বলুক
          </>
        }
        sub="ভিকারুননিসা থেকে ময়মনসিংহ ক্যাডেট, ঢাবি থেকে ডিএমসি — শিক্ষার্থীদের গল্পই আমাদের সেরা পরিচয়।"
      />

      <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {QUOTES.map((q, i) => (
          <Reveal key={q.name} delay={(i % 3) * 90} className={i === 0 ? 'lg:col-span-2' : i === 4 ? 'md:col-span-2 lg:col-span-1' : ''}>
            <figure className="lk-card h-full rounded-[1.4rem] md:rounded-[1.6rem] p-5 md:p-7 shadow-[0_16px_40px_-26px_rgba(23,19,16,0.3)] transition-all duration-300 hover:-translate-y-1">
              <Quote size={18} className="text-[#FF5200]" aria-hidden="true" />
              <blockquote className="mt-4 text-[14px] md:text-[15px] leading-relaxed text-[#3A332C] dark:text-white/75">
                {q.quote}
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <Monogram label={q.name} />
                <div>
                  <p className="text-[13px] md:text-[14px] font-bold text-[#171310] dark:text-white">{q.name}</p>
                  <p className="text-[11px] md:text-[12px] font-semibold text-[#A79C8D] dark:text-white/40">{q.tag}</p>
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
