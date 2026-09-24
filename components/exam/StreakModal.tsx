import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Check, Flame } from 'lucide-react';
import { Button, Dialog } from './ui';
import { bn, weekDays } from './model';
import { useCelebration } from './useCelebration';

/* Shown once after submitting when the day's activity extended the streak. */

const StreakModal: React.FC<{ open: boolean; streak: number; activityLog: string[]; onContinue: () => void }> = ({ open, streak, activityLog, onContinue }) => {
  const days = useMemo(() => weekDays(), []);
  useCelebration(open);

  return (
    <Dialog open={open} onClose={onContinue} label="স্ট্রিক আপডেট">
      <div className="relative overflow-hidden text-center">
        <div
          className="pointer-events-none absolute -top-10 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,82,0,0.22),transparent)]"
          aria-hidden="true"
        />
        <motion.div
          initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="relative mx-auto grid h-20 w-20 place-items-center rounded-full bg-lime text-ink-950 shadow-[0_20px_44px_-18px_rgba(255,185,46,0.8)]"
        >
          <Flame className="h-10 w-10" strokeWidth={2.2} fill="currentColor" aria-hidden="true" />
        </motion.div>
        <p className="relative mt-4 font-bangla text-[40px] font-extrabold leading-none tabular-nums text-ink">
          {bn(streak)} <span className="text-[20px] font-bold text-brand-deep">দিন</span>
        </p>
        <p className="relative mt-2 text-[14px] font-bold uppercase tracking-widest text-mist">স্ট্রিক চলছে 🔥</p>

        <div className="relative mt-6 rounded-2xl bg-paper/60 p-4 ring-1 ring-ink/8">
          <div className="flex items-center justify-between">
            {days.map((day) => {
              const active = activityLog.includes(day.date);
              return (
                <div key={day.date} className="flex flex-col items-center gap-2">
                  <span className={`text-[11.5px] font-bold ${day.isToday ? 'text-brand-deep' : 'text-mist'}`}>{day.name}</span>
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-full border-2 text-xs font-bold transition-all duration-500 ${
                      active
                        ? 'scale-110 border-brand bg-brand text-white shadow-[0_8px_18px_-8px_rgba(255,82,0,0.8)]'
                        : day.isToday
                          ? 'border-dashed border-brand/40 bg-brand/10 text-brand/60'
                          : 'border-ink/10 bg-white text-ink/30'
                    }`}
                    aria-label={active ? `${day.name}: সক্রিয়` : day.name}
                  >
                    {active ? <Check className="h-4 w-4" strokeWidth={4} /> : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <Button variant="ink" onClick={onContinue} className="relative mt-6 h-12 w-full" iconRight={ArrowRight}>
          ফলাফল দেখো
        </Button>
      </div>
    </Dialog>
  );
};

export default StreakModal;
