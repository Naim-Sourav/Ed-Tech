import React from 'react';
import { scrollToId } from './primitives';

/* ------------------------------------------------------------------ */
/*  FOOTER — brand, quick links, legal.                                */
/* ------------------------------------------------------------------ */

const PRODUCT_LINKS: { label: string; id: string }[] = [
  { label: 'ফিচারসমূহ', id: 'features' },
  { label: 'প্রোডাক্ট ট্যুর', id: 'showcase' },
  { label: 'কেন পরীক্ষাঙ্গন', id: 'why' },
  { label: 'মূল্য', id: 'pricing' },
  { label: 'জিজ্ঞাসা', id: 'faq' },
];

const LEGAL_LINKS: { label: string; href: string }[] = [
  { label: 'প্রাইভেসি পলিসি', href: '/privacy' },
  { label: 'টার্মস অব সার্ভিস', href: '/terms' },
  { label: 'রিফান্ড পলিসি', href: '/refund' },
];

export const Footer: React.FC = () => (
  <footer className="lk-night border-t border-white/8">
    <div className="mx-auto max-w-7xl px-5 md:px-8 py-14 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-10 md:gap-8">
        <div>
          <div className="flex items-center gap-1.5">
            <img src="./Pshape.svg" alt="পরীক্ষাঙ্গন লোগো" className="h-10 w-auto object-contain logo-dark-mode" />
            <img src="./letterlogo.svg" alt="Porikkhangon" className="h-6 w-auto object-contain logo-dark-mode" />
          </div>
          <p className="mt-5 max-w-sm text-[13px] md:text-[14px] leading-relaxed text-white/45">
            বাংলাদেশের শিক্ষার্থীদের জন্য বানানো প্রস্তুতির অঙ্গন — প্রশ্নব্যাংক, লাইভ মডেল টেস্ট,
            AI টিউটর আর চর্চার অভ্যাস, এক জায়গায়।
          </p>
          <p className="lk-eng mt-5 text-[12px] font-semibold tracking-wide text-white/30">
            porikkhangon.app
          </p>
        </div>

        <nav aria-label="প্রোডাক্ট লিংক">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-white/35">প্রোডাক্ট</p>
          <ul className="mt-4 space-y-2.5">
            {PRODUCT_LINKS.map((l) => (
              <li key={l.id}>
                <button
                  onClick={() => scrollToId(l.id)}
                  className="lk-focus text-[13px] md:text-[14px] font-semibold text-white/60 transition-colors hover:text-orange-300"
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="লিগাল লিংক">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-white/35">লিগাল ও সাপোর্ট</p>
          <ul className="mt-4 space-y-2.5">
            {LEGAL_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="lk-focus text-[13px] md:text-[14px] font-semibold text-white/60 transition-colors hover:text-orange-300">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a href="/sitemap.xml" className="lk-focus text-[13px] md:text-[14px] font-semibold text-white/60 transition-colors hover:text-orange-300">
                সাইটম্যাপ
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-3 border-t border-white/8 pt-7">
        <p className="text-[12px] md:text-[13px] text-white/35">
          © ২০২৬ পরীক্ষাঙ্গন (Porikkhangon) · বাংলাদেশের শিক্ষার্থীদের জন্য ভালোবাসা দিয়ে বানানো
        </p>
        <p className="lk-eng text-[11px] md:text-[12px] font-semibold tracking-wide text-white/25">
          Made in Bangladesh 🇧🇩
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
