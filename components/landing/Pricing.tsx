import React, { useState } from 'react';
import { Check, Sparkles, GraduationCap, Gift, ShieldCheck } from 'lucide-react';
import { Reveal, SectionHead, bnDigits } from './primitives';

/* ------------------------------------------------------------------ */
/*  PRICING — monthly/yearly toggle, 3 plans, local payment methods.   */
/*  NOTE: plan prices are placeholders agreed with the product owner;  */
/*  wire to the real payment backend before launch.                    */
/* ------------------------------------------------------------------ */

type Plan = {
  id: string;
  icon: React.ReactNode;
  name: string;
  tagline: string;
  monthly: number;
  yearly: number;
  yearlyNote: string;
  features: string[];
  cta: string;
  highlight?: boolean;
};

const PLANS: Plan[] = [
  {
    id: 'free',
    icon: <Gift size={16} />,
    name: 'ফ্রি',
    tagline: 'চর্চা শুরু করার জন্য যা লাগে',
    monthly: 0,
    yearly: 0,
    yearlyNote: 'চিরকালের ফ্রি',
    features: [
      'প্রতিদিন প্রশ্ন প্র্যাকটিস',
      'সাপ্তাহিক লাইভ মডেল টেস্ট',
      'বেসিক স্কোর অ্যানালিটিক্স',
      'সব বিষয়ের স্যাম্পল অধ্যায়',
      'কমিউনিটি লিডারবোর্ড',
    ],
    cta: 'ফ্রিতে শুরু করো',
  },
  {
    id: 'pro',
    icon: <Sparkles size={16} />,
    name: 'প্রো',
    tagline: 'GPA-৫ এর সেরা অস্ত্র',
    monthly: 299,
    yearly: 2490,
    yearlyNote: 'মাসে মাত্র ২০৮ টাকা',
    features: [
      'আনলিমিটেড প্রশ্ন ও মডেল টেস্ট',
      'AI দুর্বলতা রিপোর্ট + রিভিশন প্ল্যান',
      '১০+ বছরের বোর্ড আর্কাইভ (সলভড)',
      'বাংলায় ধাপে ধাপে সমাধান ও চিত্র',
      'অফলাইন প্রশ্ন প্যাক ডাউনলোড',
      'জাতীয় মেধা তালিকায় র‍্যাংক',
      'বিজ্ঞাপন-মুক্ত, সব ডিভাইসে',
    ],
    cta: 'প্রো নিয়ে এগিয়ে যাও',
    highlight: true,
  },
  {
    id: 'admission',
    icon: <GraduationCap size={16} />,
    name: 'অ্যাডমিশন বান্ডেল',
    tagline: 'ভর্তির যুদ্ধের ফুল আর্মারি',
    monthly: 499,
    yearly: 3990,
    yearlyNote: 'মাসে মাত্র ৩৩৩ টাকা',
    features: [
      'প্রো-এর সবকিছু, প্লাস —',
      'কা / খ / গ ইউনিট + মেডিকেল প্রশ্নব্যাংক',
      'বিগত ১০ বছরের ভর্তি প্রশ্ন সলভড',
      'টাইম-অ্যাটাক ও মেরিট সিমুলেটর',
      'মাসে ২টি লাইভ সলভ ক্লাস',
    ],
    cta: 'বান্ডেল নাও',
  },
];

const PAYMENTS = ['bKash', 'Nagad', 'Rocket', 'Upay', 'কার্ড'];

export const Pricing: React.FC<{ onLoginClick: () => void }> = ({ onLoginClick }) => {
  const [yearly, setYearly] = useState(true);
  return (
    <section id="pricing" className="lk-cream lk-noise relative py-20 md:py-28 border-b border-[#EFE7DA] dark:border-white/8">
      <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <SectionHead
            eyebrow="সাধ্যের মধ্যে"
            title={
              <>
                একটা গাইডবইয়ের দামে<br />
                <span className="text-[#FF5200] dark:text-orange-400">মাসভর অঙ্গন</span>
              </>
            }
            sub="অভ্যাসের একটা গাইডের দামে — আনলিমিটেড চর্চা, লাইভ মডেল টেস্ট আর AI অ্যানালিটিক্স।"
          />

          {/* toggle */}
          <Reveal delay={120}>
            <div className="inline-flex items-center rounded-full border border-[#E8DDCD] dark:border-white/12 bg-white dark:bg-white/5 p-1.5">
              <button
                onClick={() => setYearly(false)}
                className={`lk-focus rounded-full px-5 py-2.5 text-[13px] font-bold transition-all ${
                  !yearly ? 'bg-[#171310] dark:bg-white text-white dark:text-[#171310]' : 'text-[#8A8074] dark:text-white/50'
                }`}
              >
                মাসিক
              </button>
              <button
                onClick={() => setYearly(true)}
                className={`lk-focus rounded-full px-5 py-2.5 text-[13px] font-bold transition-all inline-flex items-center gap-2 ${
                  yearly ? 'bg-[#171310] dark:bg-white text-white dark:text-[#171310]' : 'text-[#8A8074] dark:text-white/50'
                }`}
              >
                বাৎসরিক
                <span className="rounded-full bg-[#FF5200] px-2 py-0.5 text-[10px] font-bold text-white">−৩০%</span>
              </button>
            </div>
          </Reveal>
        </div>

        <div className="mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
          {PLANS.map((p, i) => {
            const price = yearly ? p.yearly : p.monthly;
            return (
              <Reveal key={p.id} delay={i * 100}>
                <article
                  className={`relative h-full rounded-[1.5rem] md:rounded-[1.8rem] p-6 md:p-8 flex flex-col transition-all duration-300 hover:-translate-y-1.5 ${
                    p.highlight
                      ? 'lk-card-night text-white shadow-[0_36px_90px_-40px_rgba(255,82,0,0.45)] ring-1 ring-[#FF5200]/50'
                      : 'lk-card shadow-[0_16px_40px_-26px_rgba(23,19,16,0.3)]'
                  }`}
                >
                  {p.highlight && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#FF5200] px-4 py-1.5 text-[11px] font-bold text-white shadow-lg">
                      সবচেয়ে জনপ্রিয়
                    </span>
                  )}
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        p.highlight ? 'bg-[#FF5200]/15 text-orange-300' : 'bg-[#FF5200]/10 text-[#D64500] dark:text-orange-300'
                      }`}
                    >
                      {p.icon}
                    </span>
                    <div>
                      <h3 className={`text-[17px] md:text-[19px] font-bold ${p.highlight ? 'text-white' : 'text-[#171310] dark:text-white'}`}>
                        {p.name}
                      </h3>
                      <p className={`text-[12px] font-semibold ${p.highlight ? 'text-white/45' : 'text-[#A79C8D] dark:text-white/40'}`}>
                        {p.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className={`lk-eng text-[2.4rem] md:text-[2.8rem] leading-none font-bold tabular-nums ${p.highlight ? 'text-white' : 'text-[#171310] dark:text-white'}`}>
                      {price === 0 ? '৳০' : `৳${bnDigits(price.toLocaleString('en-IN'))}`}
                      {price !== 0 && (
                        <span className={`text-[14px] font-bold ${p.highlight ? 'text-white/45' : 'text-[#A79C8D] dark:text-white/40'}`}>
                          /{yearly ? 'বছর' : 'মাস'}
                        </span>
                      )}
                    </p>
                    <p className={`mt-2 text-[12px] font-bold ${p.highlight ? 'text-orange-300' : 'text-[#D64500] dark:text-orange-300'}`}>
                      {price === 0 ? p.yearlyNote : yearly ? p.yearlyNote : 'যেকোনো সময় বাতিলযোগ্য'}
                    </p>
                  </div>

                  <ul className="mt-6 space-y-3 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className={`flex items-start gap-2.5 text-[13px] md:text-[14px] leading-relaxed ${p.highlight ? 'text-white/70' : 'text-[#5C544B] dark:text-white/60'}`}>
                        <Check size={15} className={`mt-0.5 flex-shrink-0 ${p.highlight ? 'text-orange-300' : 'text-[#FF5200]'}`} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={onLoginClick}
                    className={`lk-focus mt-7 w-full rounded-xl py-3.5 text-[14px] md:text-[15px] font-bold transition-all active:scale-[0.98] ${
                      p.highlight
                        ? 'bg-[#FF5200] text-white hover:bg-[#E64A00] shadow-[0_16px_36px_-14px_rgba(255,82,0,0.7)]'
                        : 'border border-[#E0D5C3] dark:border-white/12 bg-white dark:bg-white/5 text-[#171310] dark:text-white hover:border-[#FF5200]/60 hover:text-[#D64500] dark:hover:text-orange-300'
                    }`}
                  >
                    {p.cta}
                  </button>
                </article>
              </Reveal>
            );
          })}
        </div>

        {/* payment + guarantee strip */}
        <Reveal delay={120}>
          <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-5 rounded-[1.3rem] border border-[#E8DDCD] dark:border-white/10 bg-white/70 dark:bg-white/5 px-5 md:px-7 py-5">
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {PAYMENTS.map((m) => (
                <span key={m} className="lk-eng rounded-lg border border-[#E8DDCD] dark:border-white/12 bg-white dark:bg-white/5 px-3.5 py-2 text-[12px] font-bold text-[#5C544B] dark:text-white/60">
                  {m}
                </span>
              ))}
            </div>
            <p className="flex items-center gap-2 text-[12px] md:text-[13px] font-bold text-[#5C544B] dark:text-white/55">
              <ShieldCheck size={16} className="text-emerald-500" />
              কার্ড ছাড়াই শুরু করো · ৩ দিনের রিফান্ড পলিসি
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default Pricing;
