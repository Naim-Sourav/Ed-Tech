import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from './landing/Navbar';
import Hero from './landing/Hero';
import SocialProof from './landing/SocialProof';
import Features from './landing/Features';
import PastPapers from './landing/PastPapers';
import Showcase from './landing/Showcase';
import Spotlight from './landing/Spotlight';
import Benefits from './landing/Benefits';
import Testimonials from './landing/Testimonials';
import Pricing from './landing/Pricing';
import FAQ from './landing/FAQ';
import CTA from './landing/CTA';
import Footer from './landing/Footer';

interface LandingPageProps {
  onLoginClick: () => void;
}

/**
 * Public landing page (route "/").
 *
 * Pixel-faithful port of the design shipped in
 * `premium-ed-tech-landing-page.zip` (src/). All sections, copy and
 * typography come straight from the zip; only integration glue differs
 * (framer-motion → motion/react, auth bridge, hash CTAs resolved by the
 * app's HashCompatRedirect). Styling is scoped under `.pk-landing`.
 *
 * Two sections were added on top of the zip design to re-home the Lottie
 * illustrations of the previous landing page (lazy-loaded, see LazyLottie):
 *   - PastPapers (hero-animation.json) → links to /admission-questions/… SEO pages
 *   - Spotlight  (learning.json + CALENDER.json) → AI টিউটর / ডেইলি চ্যালেঞ্জ
 */
const LandingPage: React.FC<LandingPageProps> = (_props) => {
  return (
    <div className="pk-landing min-h-screen bg-paper font-body text-ink antialiased">
      <Helmet>
        <title>পরীক্ষাঙ্গন Porikkhangon | HSC ও Admission প্রস্তুতির AI প্ল্যাটফর্ম</title>
        <meta
          name="description"
          content="পরীক্ষাঙ্গন (Porikkhangon) — HSC, ভর্তি পরীক্ষা ও MCQ প্রস্তুতির AI-চালিত প্ল্যাটফর্ম। ২০,০০০+ প্রশ্ন, মডেল টেস্ট, AI টিউটর, কুইজ ব্যাটল ও স্মার্ট ট্র্যাকিং — সব ফ্রিতে।"
        />
        <meta
          name="keywords"
          content="Porikkhangon, পরীক্ষাঙ্গন, HSC প্রস্তুতি, HSC Preparation, University Admission, BUET Admission, Medical Admission, DU Admission, GST ভর্তি, AI Tutor Bangladesh, HSC MCQ Practice, Question Bank Bangladesh, Admission Test Bangladesh, মডেল টেস্ট, প্রশ্নব্যাংক"
        />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        <link rel="canonical" href="https://www.porikkhangon.app/" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.porikkhangon.app/" />
        <meta property="og:locale" content="bn_BD" />
        <meta property="og:title" content="পরীক্ষাঙ্গন Porikkhangon | HSC ও Admission প্রস্তুতির AI প্ল্যাটফর্ম" />
        <meta
          property="og:description"
          content="HSC ও ভর্তি পরীক্ষার পূর্ণাঙ্গ প্রস্তুতি এক জায়গায় — ২০,০০০+ প্রশ্ন, মডেল টেস্ট, AI টিউটর, কুইজ ব্যাটল ও স্মার্ট ট্র্যাকিং।"
        />
        <meta property="og:image" content="https://www.porikkhangon.app/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="পরীক্ষাঙ্গন Porikkhangon | HSC ও Admission প্রস্তুতির AI প্ল্যাটফর্ম" />
        <meta
          name="twitter:description"
          content="HSC ও ভর্তি পরীক্ষার পূর্ণাঙ্গ প্রস্তুতি এক জায়গায় — ২০,০০০+ প্রশ্ন, মডেল টেস্ট, AI টিউটর, কুইজ ব্যাটল ও স্মার্ট ট্র্যাকিং।"
        />
        <meta name="twitter:image" content="https://www.porikkhangon.app/og-image.jpg" />
      </Helmet>

      <a
        href="#features"
        className="sr-only z-[60] rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <Features />
        <PastPapers />
        <Showcase />
        <Spotlight />
        <Benefits />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
