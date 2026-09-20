import React from 'react';
import { GraduationCap, Stethoscope, Wrench, Landmark, BookOpen, Layers } from 'lucide-react';
import { Marquee, bnDigits } from './primitives';

/* ------------------------------------------------------------------ */
/*  Two scrolling bands: subjects + admission/board targets.           */
/* ------------------------------------------------------------------ */

const SUBJECTS = [
  { bn: 'পদার্থবিজ্ঞান', en: 'Physics' },
  { bn: 'রসায়ন', en: 'Chemistry' },
  { bn: 'উচ্চতর গণিত', en: 'Higher Math' },
  { bn: 'জীববিজ্ঞান', en: 'Biology' },
  { bn: 'বাংলা', en: 'Bangla' },
  { bn: 'ইংরেজি', en: 'English' },
  { bn: 'তথ্য ও যোগাযোগ প্রযুক্তি', en: 'ICT' },
  { bn: 'হিসাববিজ্ঞান', en: 'Accounting' },
  { bn: 'অর্থনীতি', en: 'Economics' },
  { bn: 'ভূগোল', en: 'Geography' },
  { bn: 'ইতিহাস', en: 'History' },
  { bn: 'সাধারণ জ্ঞান', en: 'GK' },
];

const TARGETS = [
  { icon: Stethoscope, label: 'মেডিকেল ভর্তি' },
  { icon: Wrench, label: 'BUET ও ইঞ্জিনিয়ারিং গুচ্ছ' },
  { icon: Landmark, label: 'ঢাবি কা / খ / গ ইউনিট' },
  { icon: Layers, label: 'GST গুচ্ছ ভর্তি' },
  { icon: BookOpen, label: 'SSC বোর্ড' },
  { icon: GraduationCap, label: 'HSC বোর্ড' },
  { icon: Layers, label: 'কৃষি গুচ্ছ' },
  { icon: GraduationCap, label: 'প্রাইভেট ভার্সিটি' },
];

export const SubjectBand: React.FC = () => (
  <div className="lk-night border-y border-white/8 py-5 md:py-6">
    <Marquee duration={46} className="lk-mask-x">
      {SUBJECTS.map((s) => (
        <span key={s.en} className="mx-2.5 md:mx-3 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 whitespace-nowrap">
          <span className="text-[13px] md:text-[14px] font-bold text-white/90">{s.bn}</span>
          <span className="lk-eng text-[11px] md:text-[12px] font-semibold tracking-wide text-white/35">{s.en}</span>
        </span>
      ))}
    </Marquee>
  </div>
);

export const TargetBand: React.FC = () => (
  <section className="lk-cream py-12 md:py-16 border-b border-[#EFE7DA] dark:border-white/8">
    <div className="mx-auto max-w-7xl px-5 md:px-8">
      <p className="text-center text-[12px] md:text-[13px] font-bold uppercase tracking-[0.18em] text-[#A79C8D] dark:text-white/35">
        যেসব লড়াই কভার করা আছে
      </p>
    </div>
    <div className="mt-6">
      <Marquee duration={38} reverse className="lk-mask-x">
        {TARGETS.map((t, i) => (
          <span key={i} className="mx-2 md:mx-2.5 inline-flex items-center gap-2 whitespace-nowrap px-1.5 py-1 text-[#5C544B] dark:text-white/55">
            <t.icon size={16} className="text-[#FF5200]" />
            <span className="text-[13px] md:text-[15px] font-bold">{t.label}</span>
            <span className="ml-3 h-1 w-1 rounded-full bg-[#D9CDBB] dark:bg-white/20" aria-hidden="true" />
          </span>
        ))}
      </Marquee>
    </div>
  </section>
);

/** Word ticker used above the footer (প্র্যাকটিস · মক টেস্ট · …). */
const WORDS = ['প্র্যাকটিস', 'মডেল টেস্ট', 'অ্যানালাইজ', 'রিভিশন', 'জয়'];

export const WordBand: React.FC = () => (
  <div className="bg-[#FF5200] py-3.5 md:py-4 overflow-hidden">
    <Marquee duration={26} pauseOnHover={false}>
      {WORDS.map((w) => (
        <span key={w} className="mx-5 md:mx-7 inline-flex items-center gap-5 md:gap-7 whitespace-nowrap">
          <span className="text-[14px] md:text-[16px] font-bold text-white">{w}</span>
          <span className="text-white/60" aria-hidden="true">✦</span>
        </span>
      ))}
    </Marquee>
  </div>
);

/** Small helper reused by Stats to render "৫০,০০+" style labels. */
export const bnPlus = (n: number) => `${bnDigits(n.toLocaleString('en-IN'))}+`;
