import React, { useState } from 'react';
import { Plus, MessageCircle } from 'lucide-react';
import { Reveal, SectionHead, bnDigits, scrollToId } from './primitives';

/* ------------------------------------------------------------------ */
/*  FAQ — numbered accordion. Keep index.html FAQPage JSON-LD in sync  */
/*  with this list (same order, same wording).                         */
/* ------------------------------------------------------------------ */

export const FAQS: { q: string; a: string }[] = [
  {
    q: 'পরীক্ষাঙ্গন কি সত্যিই ফ্রি?',
    a: 'হ্যাঁ! ফ্রি প্ল্যানে প্রতিদিন প্রশ্ন প্র্যাকটিস, সাপ্তাহিক লাইভ মডেল টেস্ট আর বেসিক অ্যানালিটিক্স চিরকালের জন্য ফ্রি। কোনো কার্ড লাগবে না — মোবাইল নম্বর দিয়ে সাইন আপ করলেই শুরু।',
  },
  {
    q: 'কোন কোন পরীক্ষার প্রস্তুতি আছে?',
    a: 'SSC ও HSC বোর্ড, মেডিকেল ভর্তি, BUET ও ইঞ্জিনিয়ারিং গুচ্ছ, ঢাবি কা/খ/গ এবং GST গুচ্ছ — সব ট্র্যাকের আলাদা সিলেবাস-ভিত্তিক প্রশ্নরুট আছে।',
  },
  {
    q: 'প্রশ্নগুলো কি সিলেবাস অনুযায়ী?',
    a: 'হ্যাঁ। NCTB ও বোর্ড সিলেবাস ধরে অধ্যায়-টপিক ভিত্তিক প্রশ্ন, সাথে বিগত ১০+ বছরের বোর্ড ও ভর্তি প্রশ্নের সলভড আর্কাইভ।',
  },
  {
    q: 'ইন্টারনেট না থাকলে চর্চা করা যাবে?',
    a: 'যাবে। প্রো প্ল্যানে পুরো অধ্যায়ের অফলাইন প্রশ্ন প্যাক নামিয়ে নিতে পারো — নেট এলে স্কোর অটো-সিংক হয়ে যাবে।',
  },
  {
    q: 'AI টিউটর কীভাবে কাজ করে?',
    a: 'যেকোনো প্রশ্নের ছবি তুলে বা টেক্সট লিখে পাঠাও — AI টিউটর বাংলায় ধাপে ধাপে সমাধান, চিত্র ও কনসেপ্ট ব্যাখ্যা দেয়, ২৪/৭।',
  },
  {
    q: 'সাবস্ক্রিপশন বাতিল বা রিফান্ড করা যায়?',
    a: 'হ্যাঁ। যেকোনো সময় এক ট্যাপে বাতিল করা যায়, আর কেনার পর ৩ দিনের মধ্যে রিফান্ড পলিসি প্রযোজ্য — বিস্তারিত রিফান্ড পলিসি পেজে।',
  },
  {
    q: 'কুইজ ব্যাটল আসলে কী?',
    a: 'বন্ধুকে ১v১ চ্যালেঞ্জ জানিয়ে রিয়েল-টাইমে কুইজ খেলা — পয়েন্ট, স্ট্রিক আর জাতীয় লিডারবোর্ডসহ, যেন প্রস্তুতিটা খেলার মতো লাগে।',
  },
];

export const Faq: React.FC = () => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="lk-cream py-20 md:py-28 border-b border-[#EFE7DA] dark:border-white/8">
      <div className="mx-auto max-w-7xl px-5 md:px-8 grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16">
        <div>
          <SectionHead
            eyebrow="জিজ্ঞাসা"
            title={
              <>
                প্রশ্ন? উত্তর<br />
                <span className="text-[#FF5200] dark:text-orange-400">সাবলীলভাবে।</span>
              </>
            }
            sub="শিক্ষার্থীরা যে প্রশ্নগুলো সবচেয়ে বেশি করে — সব উত্তর এক জায়গায়। না পেলে সরাসরি জিজ্ঞেস করো।"
          />
          <Reveal delay={200}>
            <div className="mt-8 rounded-[1.3rem] border border-[#E8DDCD] dark:border-white/10 bg-white/70 dark:bg-white/5 p-5">
              <p className="flex items-center gap-2 text-[14px] font-bold text-[#171310] dark:text-white">
                <MessageCircle size={16} className="text-[#FF5200]" /> এখনও প্রশ্ন আছে?
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-[#5C544B] dark:text-white/55">
                হেল্প চ্যাটে নক করো — মানুষ উত্তর দেবে, প্রতিদিন সকাল ৯টা থেকে রাত ১১টা।
              </p>
              <button
                onClick={() => scrollToId('cta')}
                className="lk-focus mt-4 rounded-xl border border-[#E0D5C3] dark:border-white/12 bg-white dark:bg-white/5 px-5 py-2.5 text-[13px] font-bold text-[#D64500] dark:text-orange-300 transition-all hover:border-[#FF5200]/60"
              >
                হেল্প চ্যাট খোলো
              </button>
            </div>
          </Reveal>
        </div>

        <div className="space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 60}>
                <div
                  className={`rounded-[1.2rem] border transition-all duration-300 ${
                    isOpen
                      ? 'border-[#FF5200]/40 bg-white dark:bg-[#1A1613] shadow-[0_18px_44px_-28px_rgba(255,82,0,0.45)]'
                      : 'border-[#E8DDCD] dark:border-white/10 bg-white/60 dark:bg-white/4 hover:border-[#FF5200]/30'
                  }`}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="lk-focus flex w-full items-center gap-4 px-5 md:px-6 py-4 md:py-5 text-left"
                  >
                    <span className="lk-eng flex-shrink-0 text-[13px] font-bold text-[#C9BDA9] dark:text-white/25">
                      {bnDigits(String(i + 1).padStart(2, '0'))}
                    </span>
                    <span className="flex-1 text-[14px] md:text-[16px] font-bold text-[#171310] dark:text-white">{f.q}</span>
                    <span
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                        isOpen
                          ? 'rotate-45 border-[#FF5200] bg-[#FF5200] text-white'
                          : 'border-[#E0D5C3] dark:border-white/15 text-[#8A8074] dark:text-white/50'
                      }`}
                    >
                      <Plus size={15} />
                    </span>
                  </button>
                  <div
                    className="grid transition-all duration-300 ease-out"
                    style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 md:px-6 pb-5 md:pb-6 pl-[3.4rem] md:pl-[3.9rem] text-[13px] md:text-[14px] leading-relaxed text-[#5C544B] dark:text-white/60">
                        {f.a}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Faq;
