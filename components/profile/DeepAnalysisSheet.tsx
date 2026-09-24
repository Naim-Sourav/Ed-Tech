import React, { useMemo, useState } from 'react';
import { BookOpen, Target, BarChart3, Play, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Sheet, SheetHeader, Btn, Chip, Track } from '../qbank/ui';
import { Card, SectionHeader, EASE, cx } from '../dashboard/ui';
import { bn } from './model';
import type { SubjectRow, ChapterStat } from './model';
import { accuracyOf } from '../dashboard/model';

const TONE_TEXT = { good: 'text-emerald-700 dark:text-emerald-300', ok: 'text-amber-700 dark:text-amber-200', weak: 'text-flag dark:text-red-300' } as const;
const TONE_BAR = { good: 'brand', ok: 'gold', weak: 'flag' } as const;

function toneFor(acc: number): 'good' | 'ok' | 'weak' {
  return acc >= 70 ? 'good' : acc >= 50 ? 'ok' : 'weak';
}

export default function DeepAnalysisSheet({
  open,
  onClose,
  subject,
  chapterStats,
  loading,
  onPracticeSubject,
  onPracticeChapter,
  onOpenQbank,
}: {
  open: boolean;
  onClose: () => void;
  subject: SubjectRow | null;
  chapterStats: ChapterStat[];
  loading?: boolean;
  onPracticeSubject: (row: SubjectRow) => void;
  onPracticeChapter: (chapter: string, subject: string) => void;
  onOpenQbank: (subject: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const filtered = useMemo(() => {
    if (!subject) return chapterStats;
    return chapterStats.filter((c) => c.subject === subject.key || c.subject === subject.group || c.subject === subject.name);
  }, [chapterStats, subject]);

  // If no chapter stats (no exam results fetched), fallback to subject-only view
  const hasChapters = filtered.length > 0;
  const shown = showAll ? filtered : filtered.slice(0, 6);
  const weak = filtered.filter((c) => c.total >= 3 && c.accuracy < 50).sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);

  if (!subject) return null;

  return (
    <Sheet open={open} onClose={onClose} label={`${subject.name} বিশ্লেষণ`} size="md">
      <div className="space-y-5">
        <SheetHeader icon={BarChart3} title={`${subject.name} — গভীর বিশ্লেষণ`} description={`মোট ${bn(subject.total)} প্রশ্নে ${bn(subject.accuracy)}% নির্ভুলতা`} onClose={onClose} tone="brand" />

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-ink/[0.04] px-3 py-3 dark:bg-white/[0.06]">
            <p className="text-[11px] font-bold text-mist dark:text-white/50">মোট প্রশ্ন</p>
            <p className="mt-1 font-body text-[20px] font-bold tabular-nums text-ink dark:text-paper">{bn(subject.total)}</p>
          </div>
          <div className="rounded-2xl bg-emerald-500/10 px-3 py-3 dark:bg-emerald-400/10">
            <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">সঠিক</p>
            <p className="mt-1 font-body text-[20px] font-bold tabular-nums text-emerald-700 dark:text-emerald-300">{bn(subject.correct)}</p>
          </div>
          <div className="rounded-2xl bg-flag/10 px-3 py-3 dark:bg-flag/15">
            <p className="text-[11px] font-bold text-flag dark:text-red-300">ভুল/স্কিপ</p>
            <p className="mt-1 font-body text-[20px] font-bold tabular-nums text-flag dark:text-red-300">{bn(subject.total - subject.correct)}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-paper p-3 ring-1 ring-ink/6 dark:bg-white/5 dark:ring-white/10">
          <div className="flex items-center justify-between gap-2 text-[12px] font-bold">
            <span className="text-ink dark:text-paper">{subject.name}</span>
            <span className={cx('tabular-nums', TONE_TEXT[subject.tone])}>{bn(subject.accuracy)}%</span>
          </div>
          <Track value={subject.accuracy / 100} tone={TONE_BAR[subject.tone]} className="mt-2" />
        </div>

        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-2xl bg-ink/5 dark:bg-white/10" />
            ))}
          </div>
        ) : hasChapters ? (
          <>
            <Card className="p-4" as="div">
              <SectionHeader icon={BookOpen} title="অধ্যায়ভিত্তিক বিশ্লেষণ" subtitle={`${bn(filtered.length)}টি অধ্যায়ে পরীক্ষা দিয়েছ`} />
              <ul className="mt-3 space-y-3">
                {shown.map((ch) => (
                  <li key={ch.key} className="rounded-2xl bg-ink/[0.03] p-3 dark:bg-white/[0.04]">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-[13.5px] font-bold text-ink dark:text-paper">{ch.chapter}</span>
                      <span className={cx('shrink-0 font-body text-[13px] font-bold tabular-nums', TONE_TEXT[toneFor(ch.accuracy)])}>{bn(ch.accuracy)}%</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 text-[11px] font-semibold text-mist dark:text-white/50">
                      <span>{bn(ch.correct)}/{bn(ch.total)} সঠিক</span>
                      <span>·</span>
                      <span>{bn(ch.wrong)} ভুল</span>
                      {ch.skipped > 0 && (
                        <>
                          <span>·</span>
                          <span>{bn(ch.skipped)} স্কিপ</span>
                        </>
                      )}
                    </div>
                    <Track value={ch.accuracy / 100} tone={TONE_BAR[toneFor(ch.accuracy)]} className="mt-2" />
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => onPracticeChapter(ch.chapter, ch.subject)}
                        className="focus-ring text-[12px] font-extrabold text-brand-deep hover:underline dark:text-brand-bright"
                      >
                        এই অধ্যায়ে মক দাও
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              {filtered.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowAll((v) => !v)}
                  className="focus-ring mt-3 inline-flex items-center gap-1 text-[13px] font-extrabold text-brand-deep dark:text-brand-bright"
                >
                  {showAll ? (
                    <>
                      কম দেখো <ChevronUp className="h-4 w-4" strokeWidth={2.6} />
                    </>
                  ) : (
                    <>
                      সব {bn(filtered.length)}টি অধ্যায় দেখো <ChevronDown className="h-4 w-4" strokeWidth={2.6} />
                    </>
                  )}
                </button>
              )}
            </Card>

            {weak.length > 0 && (
              <Card className="p-4" as="div">
                <SectionHeader icon={Target} title="যেখানে কাজ দরকার" subtitle="৫০% এর নিচে নির্ভুলতা" />
                <ul className="mt-3 space-y-2">
                  {weak.map((w) => (
                    <li key={w.key} className="flex items-center justify-between gap-3 rounded-xl bg-flag/5 px-3 py-2.5 ring-1 ring-flag/10 dark:bg-flag/10">
                      <span className="truncate text-[13px] font-bold text-ink dark:text-paper">{w.chapter}</span>
                      <span className="shrink-0 text-[12px] font-bold text-flag dark:text-red-300">{bn(w.accuracy)}%</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </>
        ) : (
          <div className="rounded-2xl bg-ink/[0.03] px-4 py-6 text-center dark:bg-white/[0.04]">
            <p className="text-[13.5px] font-bold text-ink dark:text-paper">এই বিষয়ে অধ্যায়ভিত্তিক ডেটা এখনো নেই</p>
            <p className="mt-1 text-[12px] font-semibold text-mist dark:text-white/50">পরীক্ষা দিলে এখানে অধ্যায় অনুযায়ী দুর্বলতা দেখা যাবে। এখন মিশ্র পরীক্ষাও সঠিক বিষয়ে ভাগ হয়।</p>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Btn variant="brand" icon={Play} onClick={() => onPracticeSubject(subject)} full>
            {subject.name} নিয়ে মক দাও
          </Btn>
          <Btn variant="soft" icon={ExternalLink} onClick={() => onOpenQbank(subject.group || subject.key)} full>
            প্রশ্নব্যাংক দেখো
          </Btn>
        </div>

        <p className="text-center text-[11px] font-semibold text-mist dark:text-white/40">ডেটা এখন বিষয় অনুযায়ী সঠিকভাবে ভাগ হয় — উপরের মোট সঠিকের যোগফল বিষয়ভিত্তিক তালিকার সাথে মিলবে।</p>
      </div>
    </Sheet>
  );
}
