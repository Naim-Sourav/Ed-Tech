import React, { useLayoutEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { LandingThemeProvider } from './landing/useLandingTheme';
import Navbar from './landing/Navbar';
import Hero from './landing/Hero';
import Trust from './landing/Trust';
import Features from './landing/Features';
import Showcase from './landing/Showcase';
import Benefits from './landing/Benefits';
import Testimonials from './landing/Testimonials';
import Pricing from './landing/Pricing';
import FAQ from './landing/FAQ';
import CTA from './landing/CTA';
import Footer from './landing/Footer';

interface LandingPageProps {
  onLoginClick: () => void;
  /** "ফ্রি শুরু করো" CTAs — opens /auth on the sign-up tab (falls back to onLoginClick) */
  onSignupClick?: () => void;
}

/**
 * Public landing page (route "/").
 *
 * Pixel-faithful port of the design shipped in
 * `premium-edtech-landing-page.zip` (src/): Navbar → Hero → Trust → Features
 * → Showcase → Benefits → Testimonials → Pricing → FAQ → CTA → Footer.
 *
 * Integration glue only:
 *  - `motion/react` instead of `framer-motion` (the repo already depends on `motion`)
 *  - "লগ ইন" calls `onLoginClick` → /auth; every "ফ্রি শুরু করো" style CTA
 *    calls `onSignupClick` → /auth?mode=signup (sign-up tab pre-selected)
 *  - styling scoped under `.pk-landing`, and while the landing is mounted the
 *    document root is switched to the design's 16px base (the app shell uses
 *    15px / 13.5px density) so type & spacing match the source design
 */
const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onSignupClick }) => {
  const onStart = onSignupClick || onLoginClick;
  // The app shell sets `html { font-size: 15px }` (13.5px on phones) for dense
  // app screens. The landing design is authored against a 16px base, so scope
  // that back to 16px only while this page is on screen.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add('pk-landing-root');
    return () => root.classList.remove('pk-landing-root');
  }, []);

  return (
    <LandingThemeProvider>
      <div className="pk-landing min-h-screen overflow-x-clip bg-paper font-body text-ink-950 antialiased">
      <Helmet>
        <title>পরীক্ষাঙ্গন Porikkhangon | SSC, HSC ও ভর্তি পরীক্ষার AI প্রস্তুতি প্ল্যাটফর্ম</title>
        <meta
          name="description"
          content="পরীক্ষাঙ্গন (Porikkhangon) — SSC, HSC এবং ঢাবি, বুয়েট, মেডিকেল, GST সহ বিশ্ববিদ্যালয় ভর্তি পরীক্ষার AI-চালিত প্রস্তুতি প্ল্যাটফর্ম। ৫২,০০০+ নির্ভুল প্রশ্ন, বই-রেফারেন্সসহ ব্যাখ্যা, লাইভ মক ও স্মার্ট অ্যানালিটিক্স — শুরু সম্পূর্ণ ফ্রি।"
        />
        <meta
          name="keywords"
          content="Porikkhangon, পরীক্ষাঙ্গন, SSC প্রস্তুতি, HSC প্রস্তুতি, HSC Preparation, University Admission, BUET Admission, Medical Admission, DU Admission, চট্টগ্রাম বিশ্ববিদ্যালয় ভর্তি, GST ভর্তি, প্রশ্ন ব্যাংক, মডেল টেস্ট, MCQ Practice, Question Bank Bangladesh, বোর্ড প্রশ্ন আর্কাইভ"
        />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        <link rel="canonical" href="https://www.porikkhangon.app/" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.porikkhangon.app/" />
        <meta property="og:locale" content="bn_BD" />
        <meta property="og:title" content="পরীক্ষাঙ্গন Porikkhangon | SSC, HSC ও ভর্তি পরীক্ষার AI প্রস্তুতি প্ল্যাটফর্ম" />
        <meta
          property="og:description"
          content="SSC ও HSC বোর্ড, ঢাবি-চাবি-রাবি, বুয়েট, মেডিকেল ও GST ভর্তি — ৫২,০০০+ নির্ভুল প্রশ্ন, পূর্ণ ব্যাখ্যা, লাইভ মক আর রিয়েল-টাইম মেধাতালিকা এক জায়গায়।"
        />
        <meta property="og:image" content="https://www.porikkhangon.app/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="পরীক্ষাঙ্গন Porikkhangon | SSC, HSC ও ভর্তি পরীক্ষার AI প্রস্তুতি প্ল্যাটফর্ম" />
        <meta
          name="twitter:description"
          content="৫২,০০০+ নির্ভুল প্রশ্ন, বই-রেফারেন্সসহ ব্যাখ্যা, লাইভ এক্সাম ও স্মার্ট অ্যানালিটিক্স — শুরু সম্পূর্ণ ফ্রি।"
        />
        <meta name="twitter:image" content="https://www.porikkhangon.app/og-image.jpg" />
      </Helmet>

      <a
        href="#features"
        className="sr-only z-[60] rounded-full bg-ink-950 px-5 py-2.5 text-sm font-bold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        মূল কনটেন্টে যাও
      </a>

      <Navbar onStart={onStart} onLogin={onLoginClick} />
      <main>
        <Hero onStart={onStart} />
        <Trust />
        <Features />
        <Showcase />
        <Benefits />
        <Testimonials />
        <Pricing onStart={onStart} />
        <FAQ />
        <CTA onStart={onStart} />
      </main>
      <Footer />
      </div>
    </LandingThemeProvider>
  );
};

export default LandingPage;
