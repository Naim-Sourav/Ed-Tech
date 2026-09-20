import React from 'react';
import { Reveal, SectionHead, bnDigits } from './primitives';

/* ------------------------------------------------------------------ */
/*  WHY US — documentary photos, 4 numbered differentiators and a     */
/*  fair comparison table (old way vs Porikkhangon).                  */
/* ------------------------------------------------------------------ */

const POINTS = [
  {
    n: '০১',
    t: 'দুর্বলতার এক্স-রে',
    en: 'Know exactly what you don’t know',
    d: 'প্রতিটি ভুল উত্তরকে AI অধ্যায়, টপিক আর ভুলের ধরন অনুযায়ী ম্যাপ করে। পরের রিভিশনে শুধু সেই দুর্বল অংশটাই ফেরত আসে।',
  },
  {
    n: '০২',
    t: 'হল-টেস্টেড ইন্টারফেস',
    en: 'The exam hall, rehearsed 100 times',
    d: 'টাইমার, OMR-স্টাইল বাবল, নেগেটিভ মার্কিং — সবকিছু রিয়েল এক্সামের মতো। পরীক্ষার হলে প্রথমবারের মতো কিছুই ঠেকবে না।',
  },
  {
    n: '০৩',
    t: 'বাংলায় ব্যাখ্যা',
    en: 'Solutions that actually teach',
    d: 'প্রশ্নে প্রশ্নে বাংলায় ধাপে ধাপে সমাধান, চিত্র, শর্টকাট ট্রিক আর বোর্ড-স্ট্যান্ডার্ড উত্তরের ফরম্যাট।',
  },
  {
    n: '০৪',
    t: 'প্রতিদিনের অভ্যাস',
    en: 'Streaks that turn prep into a game',
    d: 'ডেইলি স্ট্রিক, সাপ্তাহিক লিডারবোর্ড আর বন্ধুদের সাথে ১v১ ব্যাটল — প্রস্তুতি হবে আসক্তি, জোর নয়।',
  },
];

const COMPARE: { label: string; old: string; neu: string }[] = [
  { label: 'প্রশ্নের পরিমাণ', old: 'গাইডবইয়ে ২-৩ হাজার', neu: '৫০,০০০+ সলভড প্রশ্ন' },
  { label: 'ভুলের বিশ্লেষণ', old: 'নিজে খাতায় হিসাব', neu: 'AI অধ্যায়-ভিত্তিক রিপোর্ট' },
  { label: 'মডেল টেস্ট', old: 'মাসে ১-২টা, খাতায়', neu: 'প্রতিদিন লাইভ, সাথে সাথে রেজাল্ট' },
  { label: 'সমাধান', old: 'শেষে ছাপা, ভুলসহ', neu: 'বাংলায় ধাপে ধাপে, ট্রিকসহ' },
  { label: 'খরচ', old: 'গাইড + কোচিং = হাজার হাজার টাকা', neu: 'ফ্রিতেই শুরু, প্যাক শুধু দরকার হলে' },
];

export const WhyUs: React.FC<{ onLoginClick: () => void }> = ({ onLoginClick }) => (
  <section id="why" className="lk-cream relative py-20 md:py-28 border-b border-[#EFE7DA] dark:border-white/8">
    <div className="mx-auto max-w-7xl px-5 md:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr] gap-12 lg:gap-16 items-start">
        {/* photo collage */}
        <Reveal y={26}>
          <div className="relative">
            <div className="overflow-hidden rounded-[1.6rem] md:rounded-[2rem] shadow-[0_40px_90px_-40px_rgba(23,19,16,0.45)]">
              <img
                src="./images/student-hero.jpg"
                alt="বাংলাদেশি একজন শিক্ষার্থী ঘরে বসে ফোনে পরীক্ষাঙ্গনে চর্চা করছে"
                loading="lazy"
                className="h-[320px] md:h-[430px] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-10 -right-3 md:-right-8 w-44 md:w-60 overflow-hidden rounded-[1.2rem] md:rounded-[1.5rem] border-4 border-[#FBF8F2] dark:border-[#100E0C] shadow-2xl rotate-2">
              <img
                src="./images/night-study.jpg"
                alt="রাতের বেলায় গ্রামের বাড়িতে ফোন propped করে পড়ছে একজন শিক্ষার্থী"
                loading="lazy"
                className="h-32 md:h-44 w-full object-cover"
              />
            </div>
            <div className="lk-card absolute -top-5 -left-2 md:-left-6 rounded-2xl px-4 py-3 shadow-xl">
              <p className="lk-eng text-xl md:text-2xl font-bold text-[#D64500] dark:text-orange-300 tabular-nums">
                {bnDigits(100)}%
              </p>
              <p className="text-[11px] md:text-[12px] font-bold text-[#5C544B] dark:text-white/60">বাংলায় সমাধান</p>
            </div>
          </div>
        </Reveal>

        {/* numbered points */}
        <div>
          <SectionHead
            eyebrow="কেন পরীক্ষাঙ্গন"
            title={
              <>
                টপারদের গোপন শর্টকাট:<br />
                <span className="text-[#FF5200] dark:text-orange-400">প্রতিদিনের চর্চা</span>
              </>
            }
            sub="দিনে মাত্র ৩০ মিনিট — বসে যাও, পরীক্ষার হল হয়ে উঠবে তোমার হোম গ্রাউন্ড।"
          />
          <div className="mt-10 space-y-7">
            {POINTS.map((p, i) => (
              <Reveal key={p.n} delay={i * 80}>
                <div className="flex gap-4 md:gap-5">
                  <span className="lk-eng flex-shrink-0 text-[1.6rem] md:text-[2rem] leading-none font-bold text-[#E4D8C4] dark:text-white/15">
                    {p.n}
                  </span>
                  <div>
                    <h3 className="text-[16px] md:text-[19px] font-bold text-[#171310] dark:text-white">
                      {p.t}
                      <span className="lk-eng ml-2.5 hidden md:inline text-[12px] font-semibold tracking-wide text-[#A79C8D] dark:text-white/30">
                        {p.en}
                      </span>
                    </h3>
                    <p className="mt-1.5 text-[13px] md:text-[14px] leading-relaxed text-[#5C544B] dark:text-white/55">{p.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* comparison table */}
      <Reveal delay={120}>
        <div className="mt-20 md:mt-24 overflow-hidden rounded-[1.4rem] md:rounded-[1.7rem] border border-[#E8DDCD] dark:border-white/10 bg-white dark:bg-[#1A1613] shadow-[0_24px_60px_-30px_rgba(23,19,16,0.3)]">
          <div className="grid grid-cols-[1fr_1fr_1.15fr] md:grid-cols-[1fr_1.2fr_1.4fr] text-[12px] md:text-[14px] font-bold border-b border-[#EFE7DA] dark:border-white/8 bg-[#FBF8F2] dark:bg-[#151210]">
            <div className="px-4 md:px-6 py-3.5 text-[#8A8074] dark:text-white/40">ফেয়ার তুলনা</div>
            <div className="px-4 md:px-6 py-3.5 text-[#8A8074] dark:text-white/40">গাইডবই + কোচিং — পুরনো পথ</div>
            <div className="px-4 md:px-6 py-3.5 text-[#D64500] dark:text-orange-300">পরীক্ষাঙ্গনে</div>
          </div>
          {COMPARE.map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-[1fr_1fr_1.15fr] md:grid-cols-[1fr_1.2fr_1.4fr] text-[12px] md:text-[14px] ${
                i < COMPARE.length - 1 ? 'border-b border-[#F4EDE1] dark:border-white/6' : ''
              }`}
            >
              <div className="px-4 md:px-6 py-3.5 md:py-4 font-bold text-[#171310] dark:text-white/85">{row.label}</div>
              <div className="px-4 md:px-6 py-3.5 md:py-4 text-[#8A8074] dark:text-white/40 line-through decoration-[#D9CDBB]">
                {row.old}
              </div>
              <div className="px-4 md:px-6 py-3.5 md:py-4 font-bold text-[#171310] dark:text-white bg-[#FF5200]/6 dark:bg-[#FF5200]/10">
                {row.neu}
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* second photo strip */}
      <Reveal delay={80}>
        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-5 items-stretch">
          <div className="overflow-hidden rounded-[1.4rem] md:rounded-[1.7rem] relative">
            <img
              src="./images/students-study.jpg"
              alt="কলেজ ক্যাম্পাসে একসাথে বসে ফোনে পরীক্ষাঙ্গন ব্যবহার করছে তিন শিক্ষার্থী"
              loading="lazy"
              className="h-64 md:h-80 w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
              <p className="text-[14px] md:text-[16px] font-bold text-white">“ফিজিক্সের ভয়টা এখানেই শেষ”</p>
              <p className="text-[12px] text-white/60">— এইচএসসি ’২৬, একজন চর্চারত শিক্ষার্থী</p>
            </div>
          </div>
          <div className="lk-card-night rounded-[1.4rem] md:rounded-[1.7rem] p-6 md:p-7 text-white flex flex-col justify-between">
            <div>
              <p className="lk-eng text-[2.6rem] md:text-[3.2rem] leading-none font-bold text-white tabular-nums">
                {bnDigits(30)} <span className="text-[1rem] md:text-[1.2rem] text-white/50">মিনিট/দিন</span>
              </p>
              <p className="mt-3 text-[13px] md:text-[14px] leading-relaxed text-white/55">
                গড়ে এটুকু সময়ই যথেষ্ট — নিয়মিত চর্চা করলে বোর্ড ও ভর্তি, দুই লড়াইতেই এগিয়ে থাকবে।
              </p>
            </div>
            <button
              onClick={onLoginClick}
              className="lk-focus mt-6 w-full rounded-xl bg-[#FF5200] py-3.5 text-[14px] font-bold text-white transition-all hover:bg-[#E64A00] active:scale-[0.98]"
            >
              আজই শুরু করো
            </button>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

export default WhyUs;
