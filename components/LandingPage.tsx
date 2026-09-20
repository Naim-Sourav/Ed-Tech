import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight } from 'lucide-react';

import Hero from './landing/Hero';
import { SubjectBand, TargetBand, WordBand } from './landing/MarqueeBand';
import Stats from './landing/Stats';
import Features from './landing/Features';
import Showcase from './landing/Showcase';
import WhyUs from './landing/WhyUs';
import Testimonials from './landing/Testimonials';
import Pricing from './landing/Pricing';
import Faq from './landing/Faq';
import FinalCta from './landing/FinalCta';
import Footer from './landing/Footer';
import { scrollToId } from './landing/primitives';

/* ------------------------------------------------------------------ */
/*  Landing page shell: sticky nav + section composition.             */
/*  Design v2 (editorial cream/ink, live product visuals, Bangla-first */
/*  display type). Sections live in ./landing/*.tsx                    */
/* ------------------------------------------------------------------ */

interface LandingPageProps {
  onLoginClick: () => void;
}

const NAV_LINKS: { label: string; id: string }[] = [
  { label: 'ফিচার', id: 'features' },
  { label: 'প্রোডাক্ট ট্যুর', id: 'showcase' },
  { label: 'কেন আমরা', id: 'why' },
  { label: 'মূল্য', id: 'pricing' },
  { label: 'জিজ্ঞাসা', id: 'faq' },
];

const LandingNav: React.FC<{ onLoginClick: () => void }> = ({ onLoginClick }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FBF8F2]/85 dark:bg-[#100E0C]/85 backdrop-blur-xl border-b border-[#EFE7DA] dark:border-white/8 shadow-[0_10px_30px_-18px_rgba(23,19,16,0.25)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8 h-16 md:h-[72px] flex items-center justify-between gap-4">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="lk-focus flex items-center gap-1.5 group"
          aria-label="পরীক্ষাঙ্গন — শুরুতে যাও"
        >
          <img src="./Pshape.svg" alt="পরীক্ষাঙ্গন লোগো" className="h-9 md:h-10 w-auto object-contain logo-dark-mode transition-transform group-hover:scale-105" />
          <img src="./letterlogo.svg" alt="Porikkhangon" className="h-5 md:h-6 w-auto object-contain logo-dark-mode hidden sm:block" />
        </button>

        <nav aria-label="প্রধান নেভিগেশন" className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollToId(l.id)}
              className="lk-focus rounded-full px-4 py-2 text-[13px] font-bold text-[#5C544B] dark:text-white/60 transition-colors hover:text-[#D64500] dark:hover:text-orange-300 hover:bg-[#FF5200]/8"
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2.5 md:gap-3">
          <button
            onClick={onLoginClick}
            className="lk-focus hidden sm:block rounded-xl px-4 py-2.5 text-[13px] md:text-[14px] font-bold text-[#5C544B] dark:text-white/70 transition-colors hover:text-[#D64500] dark:hover:text-orange-300 hover:bg-[#FF5200]/8"
          >
            লগইন
          </button>
          <button
            onClick={onLoginClick}
            className="lk-focus group inline-flex items-center gap-2 rounded-xl bg-[#171310] dark:bg-white px-4 md:px-5 py-2.5 md:py-3 text-[13px] md:text-[14px] font-bold text-white dark:text-[#171310] transition-all hover:bg-[#FF5200] dark:hover:bg-[#FF5200] hover:text-white dark:hover:text-white active:scale-[0.97]"
          >
            শুরু করো
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  return (
    <main className="min-h-screen w-full bg-[#FBF8F2] dark:bg-[#100E0C] font-sans text-[#171310] dark:text-[#F7F1E8] selection:bg-[#FF5200]/25">
      <Helmet>
        <title>পরীক্ষাঙ্গন Porikkhangon | SSC, HSC ও Admission প্রস্তুতির AI প্ল্যাটফর্ম</title>
        <meta
          name="description"
          content="পরীক্ষাঙ্গন (Porikkhangon) — SSC, HSC, ভর্তি পরীক্ষা ও MCQ প্রস্তুতির AI-চালিত প্ল্যাটফর্ম। ৫০,০০০+ প্রশ্ন, লাইভ মডেল টেস্ট, AI টিউটর, কুইজ ব্যাটল ও স্মার্ট ট্র্যাকিং — ফ্রিতে শুরু করো।"
        />
        <meta
          name="keywords"
          content="Porikkhangon, পরীক্ষাঙ্গন, HSC প্রস্তুতি, SSC প্রস্তুতি, University Admission, BUET Admission, Medical Admission, DU Admission, GST ভর্তি, AI Tutor Bangladesh, MCQ Practice, Question Bank Bangladesh, মডেল টেস্ট, প্রশ্নব্যাংক"
        />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        <link rel="canonical" href="https://www.porikkhangon.app/" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.porikkhangon.app/" />
        <meta property="og:locale" content="bn_BD" />
        <meta property="og:title" content="পরীক্ষাঙ্গন Porikkhangon | SSC, HSC ও Admission প্রস্তুতির AI প্ল্যাটফর্ম" />
        <meta
          property="og:description"
          content="৫০,০০০+ সলভড প্রশ্ন, লাইভ মডেল টেস্ট, AI দুর্বলতা-রিপোর্ট আর বাংলায় সমাধান — তিন লড়াইয়ের একটাই অঙ্গন।"
        />
        <meta property="og:image" content="https://www.porikkhangon.app/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="পরীক্ষাঙ্গন Porikkhangon | SSC, HSC ও Admission প্রস্তুতির AI প্ল্যাটফর্ম" />
        <meta
          name="twitter:description"
          content="৫০,০০০+ সলভড প্রশ্ন, লাইভ মডেল টেস্ট, AI দুর্বলতা-রিপোর্ট আর বাংলায় সমাধান — তিন লড়াইয়ের একটাই অঙ্গন।"
        />
        <meta name="twitter:image" content="https://www.porikkhangon.app/og-image.jpg" />
      </Helmet>

      <a
        href="#features"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-xl focus:bg-[#FF5200] focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white"
      >
        মূল কনটেন্টে যাও
      </a>

      <LandingNav onLoginClick={onLoginClick} />

      <Hero onLoginClick={onLoginClick} />
      <SubjectBand />
      <Stats />
      <TargetBand />
      <Features />
      <Showcase onLoginClick={onLoginClick} />
      <WhyUs onLoginClick={onLoginClick} />
      <Testimonials />
      <Pricing onLoginClick={onLoginClick} />
      <Faq />
      <FinalCta onLoginClick={onLoginClick} />
      <WordBand />
      <Footer />
    </main>
  );
};

export default LandingPage;
