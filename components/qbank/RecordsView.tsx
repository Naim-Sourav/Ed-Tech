import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CalendarCheck, ChevronRight, ClipboardList, History, Play, Sparkles, Target } from 'lucide-react';
import { displaySubject } from '../exam/model';
import { hrefForSource, hrefs, parseSourceId } from './nav';
import { bn, formatSeconds, overallStats, recentSessions, recentSources, relativeDay, summarizeSession, type SessionRecord } from './records';
import { useQbank } from './store';
import { Btn, Card, Chip, cx, Empty, PageHeader, Row, SectionHeader, Track } from './ui';

/*
 * Everything the student has done in the bank: totals, sources in progress
 * and the sitting history.
 */

const KIND_LABEL: Record<string, string> = {
  paper: 'প্রশ্নপত্র',
  chapter: 'অধ্যায়',
  subject: 'বিষয়',
  search: 'খোঁজ',
  exam: 'পরীক্ষা',
  mixed: 'মিশ্র',
};

const RecordsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const navigate = useNavigate();
  const { store } = useQbank();
  const overall = useMemo(() => overallStats(store), [store]);
  const sources = useMemo(() => recentSources(store, 12), [store]);
  const sessions = useMemo(() => recentSessions(store, 30), [store]);

  const open = (id: string) => {
    const parsed = parseSourceId(id);
    const href = parsed ? hrefForSource(parsed) : null;
    if (href) navigate(href);
  };

  return (
    <div className="pb-28 md:pb-12">
      <PageHeader title="তোমার রেকর্ড" subtitle="প্রশ্নব্যাংকে যা যা সমাধান করেছ" onBack={onBack} />
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        {overall.solved === 0 ? (
          <Card className="mt-4">
            <Empty
              icon={ClipboardList}
              title="এখনো কিছু সমাধান করোনি"
              body="যেকোনো প্রশ্নপত্র বা অধ্যায় খুলে উত্তর দাও — প্রতিটি উত্তর, প্রতিটি সেশন এখানে জমা থাকবে।"
              action={
                <Btn variant="brand" icon={Play} onClick={() => navigate(hrefs.home())}>
                  সমাধান শুরু করো
                </Btn>
              }
            />
          </Card>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-2 gap-2.5 md:grid-cols-4">
              {[
                { icon: BookOpen, v: bn(overall.solved), l: 'মোট সমাধান' },
                {
                  icon: Target,
                  v: `${bn(overall.accuracy)}%`,
                  l: 'সঠিকতা',
                  tone: overall.accuracy >= 70 ? 'text-emerald-700 dark:text-emerald-300' : overall.accuracy >= 50 ? '' : 'text-flag dark:text-red-300',
                },
                { icon: History, v: bn(overall.sessions), l: 'সেশন' },
                { icon: CalendarCheck, v: `${bn(overall.activeDays7)}/৭`, l: 'সক্রিয় দিন (এই সপ্তাহে)' },
              ].map((s) => (
                <Card key={s.l} className="p-3.5">
                  <s.icon className="h-[18px] w-[18px] text-ink/40 dark:text-white/40" strokeWidth={2.4} aria-hidden="true" />
                  <div className={cx('mt-2 font-body text-[22px] font-bold leading-none tabular-nums text-ink dark:text-paper', s.tone)}>{s.v}</div>
                  <div className="mt-1 text-[11px] font-bold text-mist dark:text-white/50">{s.l}</div>
                </Card>
              ))}
            </div>

            {sources.length > 0 && (
              <section className="mt-7">
                <SectionHeader icon={Sparkles} title="যেখানে যেখানে সমাধান করেছ" subtitle="আবার খুলে চালিয়ে যাও" />
                <Card className="mt-3 divide-y divide-ink/[0.06] p-1 dark:divide-white/[0.06]">
                  {sources.map((s) => {
                    const pct = s.answered ? Math.round((s.correct / s.answered) * 100) : 0;
                    return (
                      <Row
                        key={s.id}
                        onClick={() => open(s.id)}
                        lead={
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-ink/[0.05] dark:bg-white/[0.08]" aria-hidden="true">
                            <span
                              className={cx(
                                'font-body text-[12px] font-extrabold tabular-nums',
                                pct >= 70
                                  ? 'text-emerald-700 dark:text-emerald-300'
                                  : pct >= 50
                                    ? 'text-ink/70 dark:text-white/70'
                                    : 'text-flag dark:text-red-300',
                              )}
                            >
                              {bn(pct)}%
                            </span>
                          </span>
                        }
                        title={s.title}
                        meta={
                          <span className="flex items-center gap-2">
                            {s.total ? <Track value={s.answered / s.total} className="w-16" /> : null}
                            <span className="font-body tabular-nums">
                              {s.total ? `${bn(s.answered)}/${bn(s.total)}` : bn(s.answered)} সমাধান · {relativeDay(s.lastAt)}
                            </span>
                          </span>
                        }
                        trailing={<Chip className="hidden sm:inline-flex">{KIND_LABEL[s.kind] ?? s.kind}</Chip>}
                      />
                    );
                  })}
                </Card>
              </section>
            )}

            {sessions.length > 0 && (
              <section className="mt-7">
                <SectionHeader icon={History} title="সেশনের ইতিহাস" subtitle="প্রতিবার বসে যা যা করেছ" />
                <Card className="mt-3 divide-y divide-ink/[0.06] p-1 dark:divide-white/[0.06]">
                  {sessions.map((s) => (
                    <SessionRow key={s.id} session={s} live={store.pending?.id === s.id} onOpen={() => open(`${s.source.kind}:${s.source.id}`)} />
                  ))}
                </Card>
              </section>
            )}
          </>
        )}

        <button
          type="button"
          onClick={() => navigate('/history')}
          className="focus-ring mt-7 flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-left ring-1 ring-ink/8 transition-colors hover:bg-ink/[0.02] dark:bg-ink-2 dark:ring-white/10 dark:hover:bg-white/[0.04]"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand-deep dark:bg-brand/20 dark:text-brand-bright">
            <ClipboardList className="h-[18px] w-[18px]" strokeWidth={2.4} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-extrabold text-ink dark:text-paper">সব পরীক্ষার ইতিহাস</span>
            <span className="block text-[12px] font-semibold text-mist dark:text-white/50">প্রশ্নব্যাংকের পরীক্ষা, মক টেস্ট — বিস্তারিত ফলাফলসহ</span>
          </span>
          <ChevronRight className="h-4 w-4 text-ink/30 dark:text-white/30" strokeWidth={2.6} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default RecordsView;

function SessionRow({ session, live, onOpen }: { session: SessionRecord; live: boolean; onOpen: () => void }) {
  const s = summarizeSession(session);
  const subjects = s.bySubject.slice(0, 2).map((r) => displaySubject(r.subject));
  return (
    <Row
      onClick={onOpen}
      lead={
        <span
          className={cx(
            'grid h-10 w-10 shrink-0 place-items-center rounded-2xl font-body text-[12px] font-extrabold tabular-nums',
            live
              ? 'bg-brand text-white'
              : s.accuracy >= 70
                ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300'
                : s.accuracy >= 50
                  ? 'bg-ink/[0.05] text-ink/70 dark:bg-white/[0.08] dark:text-white/70'
                  : 'bg-flag/10 text-flag dark:bg-flag/20 dark:text-red-300',
          )}
          aria-hidden="true"
        >
          {live ? '●' : `${bn(s.accuracy)}%`}
        </span>
      }
      title={
        <span className="flex items-center gap-2">
          <span className="truncate">{session.source.title}</span>
          {live && (
            <Chip tone="brand" className="!py-0.5 !text-[10.5px]">
              চলমান
            </Chip>
          )}
          {session.source.kind === 'exam' && (
            <Chip tone="gold" className="!py-0.5 !text-[10.5px]">
              পরীক্ষা
            </Chip>
          )}
        </span>
      }
      meta={
        <span className="font-body tabular-nums">
          {bn(s.correct)}/{bn(s.answered)} সঠিক · {formatSeconds(s.seconds)} · {relativeDay(session.endedAt)}
          {subjects.length ? ` · ${subjects.join(', ')}` : ''}
        </span>
      }
    />
  );
}
