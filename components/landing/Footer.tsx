import { Heart, MapPin } from "lucide-react";
import { footerCols } from "./data";
import { Logo } from "./ui";

/* ── Inline brand icons (lucide no longer ships brand marks) ── */
function FacebookIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.47H15.2c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.9h-2.33V22c4.78-.76 8.43-4.92 8.43-9.94Z" />
    </svg>
  );
}

function YoutubeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.5 6.5a3.02 3.02 0 0 0-2.12-2.14C19.5 3.86 12 3.86 12 3.86s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.5 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.5 3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.5ZM9.6 15.6V8.4l6.27 3.6-6.27 3.6Z" />
    </svg>
  );
}

function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function XIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3l13.3 17.41Z" />
    </svg>
  );
}

function PlayStoreIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#34d399" d="M3 2.5v19c0 .63.68 1 1.2.68L16.6 15 5.5 4.8 3.55 2.9c-.34-.33-.55-.02-.55-.4Z" opacity=".9" />
      <path fill="#a3e635" d="M16.6 15 3.9 2.7c.24-.14.53-.14.87.06L17.5 9.9c.86.5.86 1.8 0 2.3L16.6 15Z" />
      <path fill="#22d3ee" d="m3.9 21.3-.35-.17c-.34-.2-.55-.56-.55-.93v-.4L16.6 15l-12.7 6.3Z" opacity=".85" />
    </svg>
  );
}

function AppStoreIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.05 12.54c-.03-2.9 2.37-4.3 2.48-4.37-1.35-1.98-3.46-2.25-4.21-2.28-1.8-.18-3.5 1.06-4.42 1.06-.91 0-2.32-1.03-3.8-1.01-1.96.03-3.77 1.14-4.78 2.88-2.04 3.54-.52 8.79 1.47 11.67.97 1.4 2.12 2.97 3.63 2.91 1.46-.06 2.01-.94 3.77-.94s2.26.94 3.8.91c1.57-.03 2.57-1.42 3.53-2.83 1.11-1.62 1.57-3.19 1.6-3.27-.03-.02-3.06-1.18-3.07-4.73ZM14.16 4.06c.8-.98 1.34-2.33 1.2-3.69-1.16.05-2.56.77-3.39 1.75-.75.86-1.4 2.25-1.22 3.58 1.29.1 2.61-.66 3.41-1.64Z" />
    </svg>
  );
}

const socials = [
  { Icon: FacebookIcon, label: "Facebook" },
  { Icon: YoutubeIcon, label: "YouTube" },
  { Icon: InstagramIcon, label: "Instagram" },
  { Icon: XIcon, label: "X" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink pb-10 pt-16 text-white sm:pt-20" aria-label="Footer">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[620px] -translate-x-1/2 rounded-full bg-brand/15 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          {/* Brand */}
          <div>
            <Logo dark />
            <p className="mt-5 max-w-xs text-[14.5px] leading-relaxed text-white/55">
              বাংলাদেশের স্মার্টেস্ট এক্সাম প্রিপারেশন প্ল্যাটফর্ম — SSC, HSC ও Admission প্রস্তুতির একমাত্র অঙ্গন যেখানে চর্চাই জয়ের রাস্তা।
            </p>

            <div className="mt-6 flex gap-2.5">
              {socials.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#top"
                  aria-label={label}
                  className="focus-ring grid h-10 w-10 place-items-center rounded-full bg-white/8 text-white/70 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:bg-lime hover:text-ink hover:ring-lime"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>

            {/* App badges */}
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#top"
                className="flex items-center gap-3 rounded-2xl bg-white/8 px-4 py-2.5 ring-1 ring-white/12 transition-all duration-300 hover:bg-white/12 hover:ring-lime/40"
              >
                <PlayStoreIcon className="h-6 w-6" />
                <span className="leading-tight">
                  <span className="block text-[10px] font-medium uppercase tracking-wider text-white/50">ডাউনলোড করুন</span>
                  <span className="block text-[14px] font-bold">Google Play</span>
                </span>
              </a>
              <a
                href="#top"
                className="flex items-center gap-3 rounded-2xl bg-white/8 px-4 py-2.5 ring-1 ring-white/12 transition-all duration-300 hover:bg-white/12 hover:ring-lime/40"
              >
                <AppStoreIcon className="h-6 w-6 text-white" />
                <span className="leading-tight">
                  <span className="block text-[10px] font-medium uppercase tracking-wider text-white/50">ডাউনলোড করুন</span>
                  <span className="block text-[14px] font-bold">App Store</span>
                </span>
              </a>
            </div>
          </div>

          {/* Link columns */}
          <nav className="grid grid-cols-2 gap-8 sm:grid-cols-4" aria-label="Footer links">
            {footerCols.map((col) => (
              <div key={col.title}>
                <h3 className="font-bangla text-[14px] font-bold text-lime/90">{col.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="focus-ring text-[13.5px] font-medium text-white/55 transition-colors hover:text-white"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 sm:flex-row">
          <p className="text-[13px] font-medium text-white/45">
            © ২০২৬ পরীক্ষাঙ্গন EdTech Ltd. · সর্বস্বত্ব সংরক্ষিত
          </p>
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
}
