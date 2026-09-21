import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Send, Download } from 'lucide-react';
import { footerCols } from './data';
import { Logo } from './ui';

/* ── Footer brand icons ── */
const TelegramIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M9.04 15.51 8.9 19.4c.36 0 .52-.15.71-.34l1.7-1.62 3.53 2.58c.65.36 1.11.17 1.29-.6l2.34-10.96c.23-.94-.34-1.31-.95-1.08L4.2 12.6c-.94.36-.92.88-.16 1.12l3.52 1.1 8.18-5.16c.39-.24.74-.11.45.13l-7.15 5.72Z" />
  </svg>
);

const FooterLink: React.FC<{ href: string; label: string }> = ({ href, label }) => {
  const external = href.startsWith('http');
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className="focus-ring text-[13.5px] font-medium text-white/55 transition-colors hover:text-white"
      >
        {label}
      </a>
    );
  }
  return (
    <Link to={href} className="focus-ring text-[13.5px] font-medium text-white/55 transition-colors hover:text-white">
      {label}
    </Link>
  );
};

const LandingFooter: React.FC = () => {
  return (
    <footer className="relative overflow-hidden bg-ink pb-10 pt-16 text-white sm:pt-20" aria-label="ফুটার">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[620px] -translate-x-1/2 rounded-full bg-brand/15 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          {/* Brand */}
          <div>
            <Logo dark />
            <p className="mt-5 max-w-xs text-[14.5px] leading-relaxed text-white/55">
              বাংলাদেশের স্মার্ট এক্সাম প্রিপারেশন প্ল্যাটফর্ম — HSC ও ভর্তি প্রস্তুতির একমাত্র অঙ্গন যেখানে চর্চাই জয়ের রাস্তা।
            </p>

            <div className="mt-6 flex gap-2.5">
              <a
                href="https://t.me/porikkhangon"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="টেলিগ্রাম"
                className="focus-ring grid h-10 w-10 place-items-center rounded-full bg-white/8 text-white/70 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:bg-lime hover:text-ink hover:ring-lime"
              >
                <TelegramIcon className="h-[18px] w-[18px]" />
              </a>
            </div>

            {/* PWA badge */}
            <div className="mt-7 flex flex-wrap gap-3">
              <span className="flex items-center gap-3 rounded-2xl bg-white/8 px-4 py-2.5 ring-1 ring-white/12">
                <Download className="h-5 w-5 text-lime" />
                <span className="leading-tight text-left">
                  <span className="block text-[10px] font-medium uppercase tracking-wider text-white/50">ইনস্টল করুন</span>
                  <span className="block text-[14px] font-bold">হোম স্ক্রিনে (PWA)</span>
                </span>
              </span>
              <a
                href="https://t.me/porikkhangon"
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-3 rounded-2xl bg-white/8 px-4 py-2.5 ring-1 ring-white/12 transition-all duration-300 hover:bg-white/12 hover:ring-lime/40"
              >
                <Send className="h-5 w-5 text-lime" />
                <span className="leading-tight text-left">
                  <span className="block text-[10px] font-medium uppercase tracking-wider text-white/50">যোগ দাও</span>
                  <span className="block text-[14px] font-bold">টেলিগ্রাম চ্যানেল</span>
                </span>
              </a>
            </div>
          </div>

          {/* Link columns */}
          <nav className="grid grid-cols-2 gap-8 sm:grid-cols-3" aria-label="ফুটার লিংক">
            {footerCols.map((col) => (
              <div key={col.title}>
                <h3 className="font-bangla text-[14px] font-bold text-lime/90">{col.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <FooterLink href={l.href} label={l.label} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 sm:flex-row">
          <p className="text-[13px] font-medium text-white/45">© ২০২৬ পরীক্ষাঙ্গন · সর্বস্বত্ব সংরক্ষিত</p>
          <p className="flex items-center gap-1.5 text-[13px] font-medium text-white/45">
            <MapPin className="h-3.5 w-3.5 text-lime/70" />
            ঢাকায়
            <Heart className="h-3.5 w-3.5 text-flag" fill="currentColor" />
            দিয়ে তৈরি
          </p>
          <div className="flex items-center gap-1 rounded-full bg-white/8 p-1 ring-1 ring-white/10">
            <span className="rounded-full bg-lime px-3 py-1 text-[11.5px] font-bold text-ink">বাংলা</span>
            <span className="px-3 py-1 text-[11.5px] font-bold text-white/50">EN</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
