import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Layers, Play } from 'lucide-react';
import type { TopicNode } from '../../services/syllabusData';
import { chaptersOf, paperLabel, topicsOf, type SubjectGroup } from './catalog';
import { chapterState, countChaptersInPaper, groupState, keyOf, toggleChapter, toggleGroup, toggleTopic, type Selection } from './selection';
import { countForChapter, countForTopic, type SyllabusStats } from './stats';
import { bn, CheckSquare, EASE, Pill, Segmented } from './ui';

interface Props {
  group: SubjectGroup;
  paper: string;
  onPaperChange: (paper: string) => void;
  selection: Selection;
  onSelectionChange: (next: Selection) => void;
  stats: SyllabusStats | null;
  /** Flash-card mode: tapping a chapter starts a rapid-fire round immediately. */
  flash: boolean;
  onStartFlash: (paper: string, chapter: string) => void;
}

export default function ChapterStep({ group, paper, onPaperChange, selection, onSelectionChange, stats, flash, onStartFlash }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const hasStats = !!stats && Object.keys(stats).length > 0;
  const chapters = chaptersOf(paper);

  const toggleExpanded = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div className="space-y-4">
      {group.papers.length > 1 && (
        <div className="sm:max-w-sm">
          <Segmented
            ariaLabel="পত্র"
            value={paper}
            onChange={onPaperChange}
            options={group.papers.map((p) => {
              const n = flash ? 0 : countChaptersInPaper(selection, p);
              return {
                value: p,
                label: paperLabel(p),
                badge: n > 0 ? <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10.5px] font-bold text-white">{bn(n)}</span> : undefined,
              };
            })}
          />
        </div>
      )}

      {chapters.length === 0 ? (
        <div className="rounded-[22px] border border-dashed border-ink/15 p-10 text-center text-[14px] text-mist">
          এই পত্রে এখনো কোনো অধ্যায় যোগ করা হয়নি।
        </div>
      ) : (
        <motion.ol
          key={paper}
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.035 } } }}
          className="space-y-2.5"
        >
          {chapters.map((chapter, index) => {
            const key = keyOf(paper, chapter);
            const items = topicsOf(paper, chapter);
            const total = hasStats ? countForChapter(stats, paper, chapter) : 0;
            const topicCount = items.reduce((n, it) => n + (typeof it === 'string' ? 1 : 1 + it.subTopics.length), 0);

            if (flash) {
              return (
                <motion.li key={key} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } } }}>
                  <button
                    type="button"
                    onClick={() => onStartFlash(paper, chapter)}
                    className="focus-ring group flex w-full items-center gap-3.5 rounded-[20px] border border-ink/8 bg-white p-3.5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_20px_44px_-28px_rgba(22,18,16,0.4)]"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cream text-brand">
                      <Layers className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bangla text-[15.5px] font-bold leading-snug text-ink">{chapter}</span>
                      <span className="mt-0.5 block text-[12.5px] text-mist">
                        {bn(index + 1)} নং অধ্যায়{hasStats && ` · ${bn(total)} প্রশ্ন`} · ১৫টি কার্ড
                      </span>
                    </span>
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-white transition-colors duration-300 group-hover:bg-brand"
                      aria-hidden="true"
                    >
                      <Play className="ml-0.5 h-4 w-4" fill="currentColor" strokeWidth={0} />
                    </span>
                  </button>
                </motion.li>
              );
            }

            const state = chapterState(selection, paper, chapter);
            const picked = (selection[key] ?? []).length;
            const isOpen = expanded.has(key);
            const on = state !== 'none';

            return (
              <motion.li
                key={key}
                variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } } }}
                className={`rounded-[20px] border transition-colors duration-300 ${on ? 'border-brand/50 bg-white shadow-[0_18px_40px_-28px_rgba(255,82,0,0.5)]' : 'border-ink/8 bg-white'}`}
              >
                <div className="flex items-center gap-2 p-2 pl-3 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => onSelectionChange(toggleChapter(selection, paper, chapter))}
                    aria-pressed={state === 'full'}
                    aria-label={`${chapter} ${state === 'full' ? 'বাদ দাও' : 'বাছাই করো'}`}
                    className="focus-ring flex min-w-0 flex-1 items-center gap-3 rounded-2xl py-2 text-left"
                  >
                    <CheckSquare state={state} />
                    <span className="min-w-0 flex-1">
                      <span className={`block font-bangla text-[15.5px] font-bold leading-snug ${on ? 'text-ink' : 'text-ink/85'}`}>{chapter}</span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12.5px] text-mist">
                        {topicCount > 0 && <span>{bn(topicCount)}টি টপিক</span>}
                        {hasStats && <span className="tabular-nums">{bn(total)} প্রশ্ন</span>}
                        {state === 'partial' && (
                          <span className="font-bold text-brand-deep">
                            {bn(picked)}/{bn(topicCount)} টপিক বাছাই
                          </span>
                        )}
                        {state === 'full' && <span className="font-bold text-brand-deep">পুরো অধ্যায়</span>}
                      </span>
                    </span>
                  </button>

                  {topicCount > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleExpanded(key)}
                      aria-expanded={isOpen}
                      aria-controls={`topics-${index}`}
                      className={`focus-ring inline-flex h-9 shrink-0 items-center gap-1 rounded-full px-3 text-[12.5px] font-bold transition-colors duration-300 ${
                        isOpen ? 'bg-ink text-white' : 'bg-ink/5 text-ink/70 hover:bg-ink/10'
                      }`}
                    >
                      টপিক
                      <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
                    </button>
                  )}
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`topics-${index}`}
                      key="topics"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-ink/8 px-3 pb-3 pt-3 sm:px-4">
                        <p className="mb-2.5 text-[12px] font-semibold text-mist">
                          নির্দিষ্ট টপিকে মক দিতে চাইলে এখান থেকে বেছে নাও — না বাছলে পুরো অধ্যায় ধরা হবে।
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {items.map((item) =>
                            typeof item === 'string' ? (
                              <TopicPill
                                key={item}
                                label={item}
                                count={hasStats ? countForTopic(stats, paper, chapter, item) : 0}
                                selected={(selection[key] ?? []).includes(item)}
                                onClick={() => onSelectionChange(toggleTopic(selection, paper, chapter, item))}
                              />
                            ) : (
                              <TopicGroupPanel
                                key={item.title}
                                node={item}
                                state={groupState(selection, paper, chapter, item)}
                                picked={selection[key] ?? []}
                                onToggleGroup={() => onSelectionChange(toggleGroup(selection, paper, chapter, item))}
                                onToggleTopic={(t) => onSelectionChange(toggleTopic(selection, paper, chapter, t))}
                                countOf={(t) => (hasStats ? countForTopic(stats, paper, chapter, t) : 0)}
                              />
                            ),
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </motion.ol>
      )}
    </div>
  );
}

function TopicPill({ label, count, selected, onClick }: { label: string; count: number; selected: boolean; onClick: () => void }) {
  return (
    <Pill selected={selected} onClick={onClick} hint={count > 0 ? bn(count) : undefined} className="max-w-full">
      <span className="line-clamp-1 text-left">{label}</span>
    </Pill>
  );
}

function TopicGroupPanel({
  node,
  state,
  picked,
  onToggleGroup,
  onToggleTopic,
  countOf,
}: {
  node: TopicNode;
  state: ReturnType<typeof groupState>;
  picked: string[];
  onToggleGroup: () => void;
  onToggleTopic: (topic: string) => void;
  countOf: (topic: string) => number;
}) {
  return (
    <div className={`w-full rounded-2xl border p-2.5 ${state !== 'none' ? 'border-brand/30 bg-mint/60' : 'border-ink/8 bg-paper/60'}`}>
      <button
        type="button"
        onClick={onToggleGroup}
        aria-pressed={state === 'full'}
        className="focus-ring flex w-full items-center gap-2.5 rounded-xl py-1 text-left"
      >
        <CheckSquare state={state} className="h-5 w-5 rounded-md" />
        <span className="flex-1 text-[13.5px] font-bold text-ink">{node.title}</span>
        <span className="text-[11.5px] font-semibold text-mist">{bn(node.subTopics.length)}টি উপ-টপিক</span>
      </button>
      <div className="mt-2 flex flex-wrap gap-1.5 pl-7">
        {node.subTopics.map((sub) => (
          <TopicPill key={sub} label={sub} count={countOf(sub)} selected={picked.includes(sub)} onClick={() => onToggleTopic(sub)} />
        ))}
      </div>
    </div>
  );
}
