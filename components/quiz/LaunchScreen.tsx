import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Lightbulb } from 'lucide-react';
import LogoMark from '../landing/Logo';
import { EASE } from './ui';

/* Full-screen "building your paper" state shown while questions are fetched. */

const TIPS = [
  'প্রথমে যেগুলো পারো সেগুলো দাও — কঠিনগুলো শেষে ফিরে দেখো।',
  'নেগেটিভ মার্কিং থাকলে একদম অনুমানে উত্তর দিও না।',
  'রেজাল্টের পর প্রতিটি ভুলের ব্যাখ্যা পড়ো — ওখানেই আসল শেখা।',
  'ভুল প্রশ্নগুলো “ভুল প্রশ্ন” তালিকায় জমা থাকবে, পরে আবার প্র্যাকটিস করতে পারবে।',
  'সময় শেষ হওয়ার আগে একবার সব উত্তর মিলিয়ে নিও।',
];

interface Props {
  title: string;
  detail?: string;
}

export default function LaunchScreen({ title, detail }: Props) {
  const [tip, setTip] = useState(() => Math.floor(Math.random() * TIPS.length));

  useEffect(() => {
    const id = window.setInterval(() => setTip((t) => (t + 1) % TIPS.length), 3200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className="pk-landing relative flex h-full flex-col items-center justify-center overflow-hidden bg-paper px-6 font-body text-ink"
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,82,0,0.14),transparent)] blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative flex w-full max-w-sm flex-col items-center text-center"
      >
        <span className="relative grid h-24 w-24 place-items-center">
          <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand/25" aria-hidden="true" />
          <motion.span
            className="absolute inset-0 rounded-full border-[3px] border-brand/15 border-t-brand"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
            aria-hidden="true"
          />
          <span className="grid h-16 w-16 place-items-center rounded-full bg-white shadow-[0_20px_44px_-20px_rgba(255,82,0,0.5)] ring-1 ring-ink/8">
            <LogoMark className="size-9" />
          </span>
        </span>

        <h1 className="mt-7 font-bangla text-[24px] font-extrabold tracking-tight text-ink">{title}</h1>
        {detail && <p className="mt-1.5 text-[14px] text-mist">{detail}</p>}

        <div className="mt-8 w-full rounded-[22px] bg-white p-4 text-left ring-1 ring-ink/8">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-mist">
            <Lightbulb className="h-3.5 w-3.5 text-lime" /> টিপস
          </p>
          <div className="relative mt-2 min-h-[44px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={tip}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="text-[14px] font-semibold leading-relaxed text-ink/80"
              >
                {TIPS[tip]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
