import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { navLinks } from './LandingContent';
import { Logo } from './ui';

interface LandingNavbarProps {
  onLoginClick: () => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export default function LandingNavbar({ onLoginClick }: LandingNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div className={`relative mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-500 sm:px-6 ${scrolled ? 'py-2.5' : 'py-4'}`}>
          <div className={`pointer-events-none absolute inset-0 transition-all duration-500 ${scrolled ? 'glass shadow-[0_12px_40px_-16px_rgba(22,18,16,0.22)]' : 'opacity-0'}`} aria-hidden="true" />
          <div className="relative z-10">
            <Logo />
          </div>

          <nav className="relative z-10 hidden items-center gap-1 lg:flex" aria-label="প্রধান">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="focus-ring group relative rounded-full px-4 py-2 text-[14.5px] font-medium text-ink/75 transition-colors hover:text-ink">
                {link.label}
                <span className="pointer-events-none absolute inset-x-4 -bottom-px h-px origin-left scale-x-0 bg-brand transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          <div className="relative z-10 hidden items-center gap-3 lg:flex">
            <button onClick={onLoginClick} className="focus-ring rounded-full px-4 py-2 text-[14.5px] font-medium text-ink/75 transition-colors hover:text-brand">
              লগইন
            </button>
            <button onClick={onLoginClick} className="focus-ring group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[14.5px] font-semibold text-paper shadow-[0_10px_26px_-10px_rgba(22,18,16,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-deep hover:shadow-[0_16px_34px_-10px_rgba(224,68,0,0.5)]">
              শুরু করো
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>

          <button onClick={() => setOpen((value) => !value)} className="focus-ring relative z-10 grid h-11 w-11 place-items-center rounded-full bg-white/70 ring-1 ring-ink/8 lg:hidden" aria-expanded={open} aria-label={open ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন'}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)}>
            <motion.nav initial={{ y: -24, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -24, opacity: 0, scale: 0.98 }} transition={{ duration: 0.45, ease: EASE }} className="mx-4 mt-20 rounded-3xl bg-paper p-4 shadow-2xl ring-1 ring-ink/8" aria-label="মোবাইল" onClick={(event) => event.stopPropagation()}>
              <ul className="flex flex-col">
                {navLinks.map((link, i) => (
                  <motion.li key={link.href} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 + i * 0.05, duration: 0.4 }}>
                    <a href={link.href} onClick={() => setOpen(false)} className="flex items-center justify-between border-b border-ink/6 px-3 py-4 text-[17px] font-semibold text-ink">
                      {link.label}
                      <span className="font-bangla text-sm font-medium text-mist">{link.bn}</span>
                    </a>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-4 grid gap-2.5">
                <button onClick={() => { setOpen(false); onLoginClick(); }} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-3.5 text-[15px] font-bold text-paper">
                  ফ্রিতে চর্চা শুরু করো <ArrowUpRight className="h-4 w-4" />
                </button>
                <button onClick={() => { setOpen(false); onLoginClick(); }} className="flex items-center justify-center rounded-2xl bg-white py-3 text-[14.5px] font-bold text-ink ring-1 ring-ink/10">
                  লগইন
                </button>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
