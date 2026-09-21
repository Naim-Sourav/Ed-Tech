import { Heart, Mail, MapPin, Phone, Send } from "lucide-react";
import { useState, type SVGProps } from "react";
import LogoMark from "./Logo";

const IconFacebook = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.3-.04-1.3-.13-2.45-.13-2.4 0-4.05 1.47-4.05 4.17v2.32H7.5v3.1h2.7v8h3.3Z" />
  </svg>
);
const IconYoutube = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.9 4.75 12 4.75 12 4.75s-5.9 0-7.6.47a2.8 2.8 0 0 0-2 2A29.3 29.3 0 0 0 2 12a29.3 29.3 0 0 0 .45 4.8 2.8 2.8 0 0 0 2 2c1.7.45 7.55.45 7.55.45s5.9 0 7.6-.47a2.8 2.8 0 0 0 2-2A29.3 29.3 0 0 0 22 12a29.3 29.3 0 0 0-.4-4.8ZM10 15.25v-6.5L15.5 12 10 15.25Z" />
  </svg>
);
const IconInstagram = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);
const IconLinkedin = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M6.5 8.75H3.75V20h2.75V8.75ZM5.1 3.5a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Zm7.15 6.7c-.65-.55-1.6-.95-2.7-.95-2.35 0-3.8 1.6-3.8 4.9V20h2.75v-5.35c0-1.85.6-3.15 2.2-3.15 1.5 0 2.05 1.1 2.05 3.15V20h2.75v-5.9c0-3.6-1.45-5.3-4.25-5.3Z" />
  </svg>
);

const COLS = [
  {
    title: "প্রোডাক্ট",
    links: [
      { label: "প্রশ্ন ব্যাংক", href: "#showcase" },
      { label: "লাইভ এক্সাম", href: "#showcase" },
      { label: "স্মার্ট অ্যানালিটিক্স", href: "#features" },
      { label: "ভুল বুক", href: "#features" },
      { label: "অফলাইন মোড", href: "#features" },
      { label: "প্রিমিয়াম", href: "#pricing" },
    ],
  },
  {
    title: "পরীক্ষা",
    links: [
      { label: "SSC ২০২৬", href: "#showcase" },
      { label: "HSC ২০২৬", href: "#showcase" },
      { label: "ঢাবি ‘ক-খ-গ’", href: "#showcase" },
      { label: "মেডিকেল ভর্তি", href: "#showcase" },
      { label: "GST ক্লাস্টার", href: "#showcase" },
      { label: "বুয়েট ও ইঞ্জিনিয়ারিং", href: "#showcase" },
    ],
  },
  {
    title: "কোম্পানি",
    links: [
      { label: "আমাদের গল্প", href: "#top" },
      { label: "ক্যারিয়ার", href: "#footer" },
      { label: "প্রেস কিট", href: "#footer" },
      { label: "ব্লগ", href: "#faq" },
      { label: "অ্যাফিলিয়েট", href: "#pricing" },
      { label: "যোগাযোগ", href: "#footer" },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <footer id="footer" className="relative overflow-hidden bg-ink-950 pt-16 text-white" aria-label="ফুটার">
      <div className="dot-grid-dark absolute inset-0 opacity-40" />
      <div className="absolute -top-32 left-1/3 size-80 rounded-full bg-brand-600/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 pb-14 lg:grid-cols-[1.3fr_2fr]">
          {/* brand */}
          <div>
            <a href="#top" className="flex items-center gap-2.5">
              <LogoMark className="size-12" tile={false} />
              <span className="font-display text-2xl font-bold tracking-tight">
                পরীক্ষা<span className="text-gradient-dark">ঙ্গন</span>
              </span>
            </a>
            <p className="mt-5 max-w-sm leading-relaxed text-white/55">
              বাংলাদেশের সবচেয়ে সুন্দর প্রশ্ন প্রদর্শনের প্ল্যাটফর্ম — নির্ভুল প্রশ্ন, পূর্ণ ব্যাখ্যা আর প্রতিযোগিতার আনন্দ এক জায়গায়।
            </p>
            <div className="mt-6 space-y-2.5 text-sm text-white/55">
              <p className="flex items-center gap-2.5">
                <MapPin className="size-4 shrink-0 text-brand-300" /> লেভেল ৮, হাউস ৪২, গুলশান অ্যাভেনিউ, ঢাকা ১২১২
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-brand-300" /> ০৯৬৩৮-১২৩৪৫৬ (সকাল ৯টা – রাত ১০টা)
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-brand-300" /> support@porikkhangon.app
              </p>
            </div>
            <div className="mt-6 flex gap-2.5">
              {[
                { icon: IconFacebook, label: "ফেসবুক", href: "https://www.facebook.com/porikkhangon.app", external: true },
                { icon: IconYoutube, label: "ইউটিউব", href: "https://www.youtube.com/@porikkhangon", external: true },
                { icon: IconInstagram, label: "ইনস্টাগ্রাম", href: "https://www.instagram.com/porikkhangon.app", external: true },
                { icon: IconLinkedin, label: "লিংকডইন", href: "https://www.linkedin.com/company/porikkhangon", external: true },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  {...(s.external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                  className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition-all duration-300 hover:-translate-y-1 hover:border-brand-400 hover:bg-brand-500/20 hover:text-white"
                >
                  <s.icon className="size-4.5" />
                </a>
              ))}
            </div>
          </div>

          {/* links + newsletter */}
          <div className="grid gap-10 sm:grid-cols-3">
            {COLS.map((c) => (
              <nav key={c.title} aria-label={c.title}>
                <p className="text-sm font-bold uppercase tracking-widest text-white/40">{c.title}</p>
                <ul className="mt-5 space-y-3">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} className="text-[15px] text-white/60 transition-colors duration-300 hover:text-white">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            <div className="sm:col-span-3 lg:col-span-3">
              <div className="flex flex-col items-start justify-between gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur sm:flex-row sm:items-center">
                <div>
                  <p className="font-display text-lg font-bold">প্রতি শুক্রবার ফ্রি মকের নোটিফিকেশন চাও?</p>
                  <p className="mt-1 text-sm text-white/50">সিলেবাস টিপস + সেরা সেট সরাসরি ইনবক্সে। স্প্যাম নয় — প্রতিশ্রুতি।</p>
                </div>
                {sent ? (
                  <p className="whitespace-nowrap rounded-full bg-emerald-500/15 px-5 py-3 text-sm font-bold text-emerald-300 ring-1 ring-emerald-400/30">
                    ধন্যবাদ! শুক্রবারে দেখা হচ্ছে
                  </p>
                ) : (
                  <form
                    className="flex w-full gap-2 sm:w-auto"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (email.trim()) setSent(true);
                    }}
                  >
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="তোমার ইমেইল"
                      className="w-full min-w-0 rounded-full border border-white/15 bg-black/30 px-5 py-3 text-sm text-white placeholder:text-white/35 focus:border-brand-400 focus:outline-none sm:w-56"
                    />
                    <button
                      type="submit"
                      className="grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-r from-brand-500 to-amber-500 text-white shadow-lg shadow-brand-500/40 transition hover:scale-105"
                      aria-label="সাবস্ক্রাইব"
                    >
                      <Send className="size-4.5" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/8 py-7 text-sm text-white/40 sm:flex-row">
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center sm:text-left">
          <span>© ২০২৬ পরীক্ষাঙ্গন — সর্বস্বত্ব সংরক্ষিত</span>
            <span className="hidden size-1 rounded-full bg-white/25 sm:block" />
            <span className="inline-flex items-center gap-1.5 text-white/55">
              <Heart className="size-3.5 fill-rose-400 text-rose-400" /> Made with love for students
            </span>
          </p>
          <div className="flex gap-6">
            {[
              { label: "গোপনীয়তা নীতি", href: "/privacy" },
              { label: "ব্যবহারের শর্ত", href: "/terms" },
              { label: "রিফান্ড নীতি", href: "/refund" },
            ].map((l) => (
              <a key={l.label} href={l.href} className="transition-colors hover:text-white">
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
