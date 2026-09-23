import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Check, History, PartyPopper, Sparkles, Zap } from 'lucide-react';
import type { SubjectGroup } from './catalog';
import { paperLabel } from './catalog';
import type { LastSetup } from './launch';
import { describeSettings } from './presets';
import { countChaptersInGroup, type Selection } from './selection';
import { countForSubject, type SyllabusStats } from './stats';
import { bn, EASE, Skeleton, SubjectTile } from './ui';

interface Props {
  featured: SubjectGroup[];
  rest: SubjectGroup[];
  /** Label for the personalised section, e.g. "মেডিকেল টার্গেট". */
  featuredLabel?: string;
  stats: SyllabusStats | null;
  statsLoading: boolean;
  selection: Selection;
  flash: boolean;
  welcome: boolean;
  lastSetup: LastSetup | null;
  onResume: () => void;
  onPick: (group: SubjectGroup) => void;
}

const STAGGER = 0.045;

export default function SubjectStep({ featured, rest, featuredLabel, stats, statsLoading, selection, flash, welcome, lastSetup, onResume, onPick }: Props) {
  const hasStats = !!stats && Object.keys(stats).length > 0;

  const renderCard = (group: SubjectGroup, index: number, recommended: boolean) => {
    const picked = flash ? 0 : countChaptersInGroup(selection, group);
    const total = hasStats ? countForSubject(stats, group.name) : 0;
    return (
      <motion.button
        key={group.name}
        type="button"
        onClick={() => onPick(group)}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: Math.min(index, 8) * STAGGER, ease: EASE }}
        whileTap={{ scale: 0.98 }}
        className={`focus-ring group relative flex flex-col gap-3.5 rounded-[24px] border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-28px_rgba(22,18,16,0.4)] ${
          picked > 0 ? 'border-brand bg-mint shadow-[0_18px_40px_-24px_rgba(255,82,0,0.55)]' : 'border-ink/8 bg-white'
        }`}
        aria-label={`${group.display}${picked > 0 ? `, ${bn(picked)}টি অধ্যায় বাছাই করা` : ''}`}
      >
        <div className="flex items-start justify-between gap-2">
          <SubjectTile group={group} className="h-12 w-12 rounded-2xl sm:h-14 sm:w-14 sm:rounded-[18px]" />
          {picked > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2 py-1 text-[11px] font-bold text-white">
              <Check className="h-3 w-3" strokeWidth={3.5} /> {bn(picked)}টি অধ্যায়
            </span>
          )}
          {picked === 0 && recommended && index === 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-lime px-2 py-1 text-[11px] font-bold text-ink-950">
              <Sparkles className="h-3 w-3" /> শুরু করো এটা দিয়ে
            </span>
          )}
        </div>

        <div className="min-w-0">
          <p className={`font-bangla text-[16.5px] font-bold leading-snug sm:text-[17.5px] ${picked > 0 ? 'text-brand-deep' : 'text-ink'}`}>{group.display}</p>
          <p className="mt-0.5 text-[12px] font-semibold text-mist">
            {group.subDisplay}
            {group.papers.length > 1 && <span> · {group.papers.map(paperLabel).join(' + ')}</span>}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          {statsLoading && !hasStats ? (
            <Skeleton className="h-4 w-20" />
          ) : hasStats ? (
            <span className="text-[12.5px] font-bold tabular-nums text-ink/70">{bn(total)} প্রশ্ন</span>
          ) : (
            <span className="text-[12.5px] font-bold text-mist">{bn(group.papers.length)}টি পত্র</span>
          )}
          <span
            className={`grid h-8 w-8 place-items-center rounded-full transition-all duration-300 group-hover:bg-brand group-hover:text-white ${
              picked > 0 ? 'bg-brand/15 text-brand-deep' : 'bg-ink/5 text-ink/60'
            }`}
            aria-hidden="true"
          >
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.5} />
          </span>
        </div>
      </motion.button>
    );
  };

  const grid = 'grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4';

  return (
    <div className="space-y-7">
      {welcome && !flash && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex items-start gap-3 rounded-[22px] bg-ink p-4 text-white shadow-[0_24px_50px_-28px_rgba(22,18,16,0.7)]"
          role="status"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/10 text-lime">
            <PartyPopper className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="font-bangla text-[15.5px] font-bold">প্রোফাইল রেডি — এবার প্রথম মকটা দিয়ে ফেলো!</p>
            <p className="mt-0.5 text-[13px] text-white/65">
              {featured.length > 0
                ? 'তোমার টার্গেট অনুযায়ী বিষয়গুলো আগে সাজিয়ে দিলাম। একটা বিষয় বেছে নাও, তারপর অধ্যায়।'
                : 'একটা বিষয় বেছে নাও, তারপর অধ্যায় — ৩ ধাপেই পরীক্ষা শুরু।'}
            </p>
          </div>
        </motion.div>
      )}

      {!flash && lastSetup && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="flex flex-col gap-3 rounded-[22px] border border-ink/8 bg-white p-4 sm:flex-row sm:items-center"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cream text-brand">
            <History className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-mist">আগের মক</p>
            <p className="truncate font-bangla text-[15.5px] font-bold text-ink">{lastSetup.title}</p>
            <p className="truncate text-[12.5px] text-mist">{describeSettings(lastSetup.settings)}</p>
          </div>
          <button
            type="button"
            onClick={onResume}
            className="focus-ring inline-flex items-center justify-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-[13.5px] font-bold text-white transition-colors hover:bg-brand"
          >
            <Zap className="h-4 w-4" /> আবার দাও
          </button>
        </motion.div>
      )}

      {featured.length > 0 ? (
        <>
          <section aria-labelledby="featured-subjects">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="featured-subjects" className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.18em] text-mist">
                <Sparkles className="h-3.5 w-3.5 text-brand" /> তোমার জন্য সাজানো
              </h2>
              {featuredLabel && <span className="rounded-full bg-mint px-2.5 py-1 text-[11.5px] font-bold text-brand-deep">{featuredLabel}</span>}
            </div>
            <div className={grid}>{featured.map((g, i) => renderCard(g, i, true))}</div>
          </section>
          {rest.length > 0 && (
            <section aria-labelledby="other-subjects">
              <h2 id="other-subjects" className="mb-3 text-[12px] font-bold uppercase tracking-[0.18em] text-mist">
                অন্যান্য বিষয়
              </h2>
              <div className={grid}>{rest.map((g, i) => renderCard(g, featured.length + i, false))}</div>
            </section>
          )}
        </>
      ) : (
        <section aria-labelledby="all-subjects">
          <h2 id="all-subjects" className="mb-3 text-[12px] font-bold uppercase tracking-[0.18em] text-mist">
            সব বিষয়
          </h2>
          <div className={grid}>{rest.map((g, i) => renderCard(g, i, false))}</div>
        </section>
      )}
    </div>
  );
}
