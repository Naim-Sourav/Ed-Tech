import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, ChevronRight, History, Layers, Play, Search, Sparkles } from 'lucide-react';
import { SUBJECT_GROUPS, paperLabel } from '../quiz/catalog';
import type { SyllabusStats } from './data';
import { hrefForSource, hrefs, LEVELS, parseSourceId, type Level } from './nav';
import { bn, overallStats, recentSources, relativeDay, type ProgressStore } from './records';
import { useQbank } from './store';
import { Card, cx, EASE, SectionHeader, Track } from './ui';

/*
 * Landing screen of the question bank: search, resume, the three tabs
 * (ভর্তি / এইচএসসি / অনুশীলনী), the subject tiles and a glimpse of the
 * student's records.
 */

const SECTION_COPY: Record<Level, { title: string; subtitle: string }> = {
  ADMISSION: { title: 'বিষয় বেছে নাও', subtitle: 'ঢাবি, মেডিকেল, গুচ্ছ, ইঞ্জিনিয়ারিং — সব ভর্তি পরীক্ষার প্রশ্ন, অধ্যায় ধরে' },
  ACADEMIC: { title: 'বোর্ড ও কলেজের প্রশ্ন', subtitle: 'বিষয় বেছে নাও — ভেতরে বোর্ড আর কলেজ ফিল্টার আছে' },
  MAINBOOK: { title: 'পাঠ্যবইয়ের অনুশীলনী', subtitle: 'বই ধরে ধরে অধ্যায়ের প্রশ্ন' },
};

/** Questions answered under a paper (all its chapters + the "সব অধ্যায়" view). */
const subjectAnswered = (store: ProgressStore, level: Level, paper: string): number => {
  const prefixes = [`chapter:${level}|${paper}|`, `subject:${level}|${paper}|`];
  return Object.entries(store.sources).reduce((sum, [id, p]) => (prefixes.some((pre) => id.startsWith(pre)) ? sum + p.answered : sum), 0);
};

const statsFor = (stats: SyllabusStats | null, paper: string): number | null => {
  if (!stats) return null;
  const hit = stats[paper] ?? Object.entries(stats).find(([k]) => k.toLowerCase() === paper.toLowerCase())?.[1];
  return hit ? Number(hit.total) || 0 : 0;
};

export interface HomeProps {
  level: Level;
  stats: SyllabusStats | null;
}

const Home: React.FC<HomeProps> = ({ level, stats }) => {
  const navigate = useNavigate();
  const { store } = useQbank();
  const [query, setQuery] = useState('');
  const overall = useMemo(() => overallStats(store), [store]);

  const resume = useMemo(() => {
    const list = recentSources(store, 4).filter((s) => s.kind !== 'exam');
    const open = store.pending ? list.find((s) => s.id === `${store.pending!.source.kind}:${store.pending!.source.id}`) : null;
    const pick = open ?? list.find((s) => !s.total || s.answered < s.total) ?? list[0];
    if (!pick) return null;
    const parsed = parseSourceId(pick.id);
    const href = parsed ? hrefForSource(parsed) : null;
    return href ? { ...pick, href } : null;
  }, [store]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    navigate(hrefs.search(q, level));
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pt-3 md:px-6 md:pt-6">
      {/* Title row */}
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[28px] font-extrabold leading-none tracking-tight text-ink dark:text-paper md:text-[34px]">প্রশ্নব্যাংক</h1>
          <p className="mt-1.5 text-[13px] font-semibold text-mist dark:text-white/50 md:text-[14px]">
            ঢাবি, মেডিকেল, গুচ্ছ, বোর্ড — বিগত বছরের সব প্রশ্ন অধ্যায় ধরে, উত্তর ও ব্যাখ্যাসহ।
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(hrefs.records())}
          className="focus-ring flex shrink-0 items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3.5 ring-1 ring-ink/10 transition-colors hover:bg-ink/[0.03] dark:bg-white/[0.06] dark:ring-white/10 dark:hover:bg-white/10"
          aria-label="তোমার রেকর্ড"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-white dark:bg-paper dark:text-ink">
            <History className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />
          </span>
          <span className="text-left leading-tight">
            <span className="block font-body text-[13px] font-extrabold tabular-nums text-ink dark:text-paper">{bn(overall.solved)}</span>
            <span className="block text-[10px] font-bold text-mist dark:text-white/50">সমাধান</span>
          </span>
        </button>
      </div>

      {/* Search */}
      <form onSubmit={submitSearch} role="search" className="mt-4">
        <label className="relative block">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink/40 dark:text-white/40"
            strokeWidth={2.4}
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="প্রশ্ন, টপিক বা কিওয়ার্ড খোঁজো…"
            aria-label="প্রশ্ন খোঁজো"
            className="focus-ring h-12 w-full rounded-full bg-white pl-11 pr-24 text-[14.5px] font-semibold text-ink placeholder:text-ink/35 ring-1 ring-ink/10 dark:bg-white/[0.06] dark:text-paper dark:placeholder:text-white/35 dark:ring-white/10"
          />
          <button
            type="submit"
            className="focus-ring absolute right-1.5 top-1/2 inline-flex h-9 -translate-y-1/2 items-center gap-1 rounded-full bg-ink px-3.5 text-[12.5px] font-extrabold text-white transition-colors hover:bg-ink-2 disabled:opacity-40 dark:bg-paper dark:text-ink"
            disabled={query.trim().length < 2}
          >
            খোঁজো
          </button>
        </label>
      </form>

      {/* Resume */}
      {resume && (
        <motion.button
          type="button"
          onClick={() => navigate(resume.href)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="focus-ring mt-4 flex w-full items-center gap-3.5 rounded-[22px] bg-ink p-3.5 text-left text-white shadow-[0_24px_50px_-28px_rgba(22,18,16,0.7)] dark:bg-paper dark:text-ink"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand text-white">
            <Play className="ml-0.5 h-5 w-5" strokeWidth={2.6} fill="currentColor" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-bold tracking-[0.03em] text-white/55 dark:text-ink/50">
              {store.pending && `${store.pending.source.kind}:${store.pending.source.id}` === resume.id ? 'চলমান সেশন' : 'চালিয়ে যাও'} ·{' '}
              {relativeDay(resume.lastAt)}
            </span>
            <span className="block truncate text-[14.5px] font-extrabold">{resume.title}</span>
            <span className="mt-1.5 flex items-center gap-2">
              <Track value={resume.total ? resume.answered / resume.total : 0.08} tone="white" className="flex-1 bg-white/15 dark:bg-ink/10" />
              <span className="shrink-0 font-body text-[11.5px] font-bold tabular-nums text-white/70 dark:text-ink/60">
                {resume.total ? `${bn(resume.answered)}/${bn(resume.total)}` : `${bn(resume.answered)} সমাধান`} ·{' '}
                {bn(resume.answered ? Math.round((resume.correct / resume.answered) * 100) : 0)}% সঠিক
              </span>
            </span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-white/50 dark:text-ink/40" strokeWidth={2.6} aria-hidden="true" />
        </motion.button>
      )}

      {/* Tabs */}
      <div role="tablist" aria-label="প্রশ্নের ধরন" className="mt-5 grid grid-cols-3 gap-1 rounded-full bg-ink/[0.05] p-1 dark:bg-white/[0.07]">
        {LEVELS.map((l) => {
          const active = l.id === level;
          return (
            <button
              key={l.id}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => navigate(hrefs.home(l.id), { replace: true })}
              className={cx(
                'focus-ring relative h-10 rounded-full text-[13.5px] font-extrabold transition-colors',
                active ? 'text-white dark:text-ink' : 'text-ink/60 hover:text-ink dark:text-white/60 dark:hover:text-white',
              )}
            >
              {active && (
                <motion.span
                  layoutId="qbank-tab"
                  className="absolute inset-0 rounded-full bg-ink shadow dark:bg-paper"
                  transition={{ duration: 0.35, ease: EASE }}
                />
              )}
              <span className="relative">{l.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 space-y-8">
        <section>
          <SectionHeader icon={Layers} title={SECTION_COPY[level].title} subtitle={SECTION_COPY[level].subtitle} />
          <div className="mt-3 grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-4">
            {SUBJECT_GROUPS.flatMap((g) =>
              g.papers.map((paper) => {
                const count = statsFor(stats, paper);
                const done = subjectAnswered(store, level, paper);
                return (
                  <button
                    key={paper}
                    type="button"
                    onClick={() => navigate(hrefs.subject(level, paper))}
                    className="focus-ring group flex items-center gap-3 rounded-[20px] bg-white p-3 text-left ring-1 ring-ink/8 transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(22,18,16,0.5)] dark:bg-ink-2 dark:ring-white/10 dark:hover:shadow-none"
                  >
                    <span
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
                      style={{ background: `hsl(${g.hue} 90% 94%)`, color: `hsl(${g.hue} 60% 32%)` }}
                      aria-hidden="true"
                    >
                      <g.icon className="h-5 w-5" strokeWidth={2.2} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-extrabold leading-tight text-ink dark:text-paper">{g.display}</span>
                      <span className="mt-0.5 block text-[11.5px] font-bold text-mist dark:text-white/50">
                        {g.papers.length > 1 ? paperLabel(paper) : g.subDisplay}
                        {count === null ? '' : count > 0 ? ` · ${bn(count.toLocaleString('en-US'))} প্রশ্ন` : ''}
                        {done > 0 ? ` · ${bn(done)} সমাধান` : ''}
                      </span>
                    </span>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-ink/25 transition-transform group-hover:translate-x-0.5 dark:text-white/25"
                      strokeWidth={2.6}
                      aria-hidden="true"
                    />
                  </button>
                );
              }),
            )}
          </div>
        </section>

        {/* Records glimpse */}
        <section>
          <SectionHeader
            icon={Sparkles}
            title="তোমার রেকর্ড"
            subtitle="প্রশ্নব্যাংকে যা যা সমাধান করেছ"
            action={overall.solved > 0 ? 'সব দেখো' : undefined}
            onAction={() => navigate(hrefs.records())}
          />
          {overall.solved > 0 ? (
            <Card className="mt-3 grid grid-cols-3 divide-x divide-ink/8 p-1 dark:divide-white/10">
              {[
                { v: bn(overall.solved), l: 'মোট সমাধান' },
                { v: `${bn(overall.accuracy)}%`, l: 'সঠিকতা' },
                { v: bn(overall.answeredThisWeek), l: 'এই সপ্তাহে' },
              ].map((s) => (
                <div key={s.l} className="px-3 py-3 text-center">
                  <div className="font-body text-[20px] font-bold tabular-nums text-ink dark:text-paper">{s.v}</div>
                  <div className="text-[11px] font-bold text-mist dark:text-white/50">{s.l}</div>
                </div>
              ))}
            </Card>
          ) : (
            <Card className="mt-3 flex items-center gap-3 p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand-deep dark:bg-brand/20 dark:text-brand-bright">
                <ArrowRight className="h-5 w-5" strokeWidth={2.4} aria-hidden="true" />
              </span>
              <p className="text-[13px] font-semibold leading-relaxed text-mist dark:text-white/55">
                প্রশ্ন সমাধান করলেই এখানে রেকর্ড জমবে — কোন অধ্যায়ে কতটুকু হলো, কোথায় ভুল হচ্ছে, সব একসাথে।
              </p>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;
