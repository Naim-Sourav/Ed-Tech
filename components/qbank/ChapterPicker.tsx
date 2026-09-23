import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Layers } from 'lucide-react';
import { normalizeBangla } from '../../utils/normalization';
import { displaySubject } from '../exam/model';
import { chaptersOf, groupForPaper } from '../quiz/catalog';
import type { SyllabusStats } from './data';
import { hrefs, levelLabel, type Level } from './nav';
import { bn, progressOf } from './records';
import { useQbank } from './store';
import { Card, PageHeader, Row, Track } from './ui';

/*
 * Chapter list of one paper ("Physics 1st Paper") for a level, with question
 * counts from the syllabus stats and the student's progress.
 */

export interface ChapterPickerProps {
  level: Level;
  subject: string;
  stats: SyllabusStats | null;
  onBack: () => void;
}

const findStats = (stats: SyllabusStats | null, subject: string) => {
  if (!stats) return null;
  const norm = normalizeBangla(subject).toLowerCase();
  const key = Object.keys(stats).find((k) => normalizeBangla(k).toLowerCase() === norm);
  return key ? stats[key] : null;
};

const chapterCount = (paperStats: SyllabusStats[string] | null, chapter: string): number | null => {
  if (!paperStats) return null;
  const norm = normalizeBangla(chapter);
  let total = 0;
  Object.entries(paperStats.chapters ?? {}).forEach(([k, v]) => {
    if (normalizeBangla(k) === norm) total += Number(v?.total) || 0;
  });
  return total;
};

const ChapterPicker: React.FC<ChapterPickerProps> = ({ level, subject, stats, onBack }) => {
  const navigate = useNavigate();
  const { store } = useQbank();
  const chapters = useMemo(() => chaptersOf(subject), [subject]);
  const paperStats = useMemo(() => findStats(stats, subject), [stats, subject]);
  const total = paperStats ? Number(paperStats.total) || 0 : null;
  const group = groupForPaper(subject);

  const rows = useMemo(
    () =>
      chapters.map((chapter) => {
        const count = chapterCount(paperStats, chapter);
        const prog = progressOf(store, { kind: 'chapter', id: `${level}|${subject}|${chapter}` });
        return { chapter, count, prog };
      }),
    [chapters, paperStats, store, level, subject],
  );

  const allProg = progressOf(store, { kind: 'subject', id: `${level}|${subject}|` });

  return (
    <div className="pb-28 md:pb-12">
      <PageHeader
        title={displaySubject(subject)}
        eyebrow={levelLabel(level)}
        subtitle={`${bn(chapters.length)}টি অধ্যায়${total ? ` · ${bn(total.toLocaleString('en-US'))} প্রশ্ন` : ''}`}
        onBack={onBack}
      />
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <Card className="mt-4 p-1">
          <Row
            onClick={() => navigate(hrefs.chapter(level, subject, null))}
            lead={
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
                style={{ background: `hsl(${group?.hue ?? 20} 90% 94%)`, color: `hsl(${group?.hue ?? 20} 60% 32%)` }}
                aria-hidden="true"
              >
                <Layers className="h-5 w-5" strokeWidth={2.2} />
              </span>
            }
            title="সব অধ্যায় মিলিয়ে"
            meta={
              <span className="font-body tabular-nums">
                {total ? `${bn(total.toLocaleString('en-US'))} প্রশ্ন` : 'পুরো বিষয়ের প্রশ্ন'}
                {allProg && allProg.answered > 0 ? ` · ${bn(allProg.answered)} সমাধান` : ''}
              </span>
            }
          />
        </Card>

        <h2 className="mb-2 mt-5 px-1 text-[12px] font-bold tracking-[0.03em] text-mist dark:text-white/45">অধ্যায় অনুযায়ী</h2>
        <Card className="divide-y divide-ink/[0.06] p-1 dark:divide-white/[0.06]">
          {rows.map(({ chapter, count, prog }, i) => (
            <Row
              key={chapter}
              onClick={() => navigate(hrefs.chapter(level, subject, chapter))}
              lead={
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-ink/[0.05] font-body text-[13px] font-extrabold tabular-nums text-ink/70 dark:bg-white/[0.08] dark:text-white/70"
                  aria-hidden="true"
                >
                  {bn(i + 1)}
                </span>
              }
              className={count === 0 ? 'opacity-60' : ''}
              title={chapter}
              meta={
                <span className="flex items-center gap-2">
                  {prog && prog.answered > 0 && (
                    <Track value={count ? prog.answered / count : 0.1} className="w-16" tone={prog.correct / prog.answered >= 0.7 ? 'brand' : 'gold'} />
                  )}
                  <span className="font-body tabular-nums">
                    {count === null ? '' : count > 0 ? `${bn(count)} প্রশ্ন` : 'প্রশ্ন নেই'}
                    {prog && prog.answered > 0
                      ? `${count === null ? '' : ' · '}${bn(prog.answered)} সমাধান · ${bn(Math.round((prog.correct / prog.answered) * 100))}%`
                      : ''}
                  </span>
                </span>
              }
            />
          ))}
          {rows.length === 0 && (
            <div className="flex items-center gap-3 p-5 text-[13px] font-semibold text-mist dark:text-white/50">
              <BookOpen className="h-5 w-5" strokeWidth={2.2} aria-hidden="true" /> এই বিষয়ের অধ্যায় তালিকা পাওয়া যায়নি।
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ChapterPicker;
