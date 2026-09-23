import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, CalendarDays, FileText, Timer } from 'lucide-react';
import { CATEGORIES, sessionsOf, type InstitutionGroup, type Paper } from './catalog';
import { hueFor } from './Home';
import { hrefs } from './nav';
import { bn, progressOf, relativeDay } from './records';
import { useQbank } from './store';
import { Bone, Card, Chip, Empty, Monogram, PageHeader, Pill, Row, Scroller, Track } from './ui';

/*
 * Papers of one institution, grouped by session (newest first), with the
 * student's progress on each.
 */

export interface InstitutionViewProps {
  group: InstitutionGroup | null;
  loading: boolean;
  unit: string | null;
  onUnit: (unit: string | null) => void;
  onBack: () => void;
}

const InstitutionView: React.FC<InstitutionViewProps> = ({ group, loading, unit, onUnit, onBack }) => {
  const navigate = useNavigate();
  const { store } = useQbank();

  const sessions = useMemo(() => {
    if (!group) return [];
    const filtered = unit ? { ...group, papers: group.papers.filter((p) => p.unitLabel === unit) } : group;
    return sessionsOf(filtered);
  }, [group, unit]);

  const totals = useMemo(() => {
    if (!group) return { papers: 0, answered: 0, correct: 0, touched: 0 };
    let answered = 0;
    let correct = 0;
    let touched = 0;
    group.papers.forEach((p) => {
      const prog = progressOf(store, { kind: 'paper', id: p.ref });
      if (prog && prog.answered > 0) {
        answered += prog.answered;
        correct += prog.correct;
        touched += 1;
      }
    });
    return { papers: group.papers.length, answered, correct, touched };
  }, [group, store]);

  const inst = group?.institution;
  const category = inst ? CATEGORIES.find((c) => c.id === inst.category)?.name : undefined;
  const years = group ? group.papers.map((p) => p.year).filter(Boolean) : [];
  const span = years.length ? (Math.min(...years) === Math.max(...years) ? bn(Math.max(...years)) : `${bn(Math.min(...years))}–${bn(Math.max(...years))}`) : '';

  return (
    <div className="pb-28 md:pb-12">
      <PageHeader
        title={inst?.name ?? 'প্রতিষ্ঠান'}
        eyebrow={category}
        subtitle={group ? `${bn(group.papers.length)}টি প্রশ্নপত্র${span ? ` · ${span}` : ''}` : undefined}
        onBack={onBack}
      />

      <div className="mx-auto max-w-5xl px-4 md:px-6">
        {loading && !group && (
          <div className="mt-4 space-y-3">
            <Bone className="h-24 rounded-[24px]" />
            <Bone className="h-56 rounded-[24px]" />
          </div>
        )}

        {!loading && !group && (
          <Card className="mt-4">
            <Empty icon={Building2} title="এই প্রতিষ্ঠানের প্রশ্নপত্র পাওয়া যায়নি" body="প্রশ্নপত্র যোগ হলে এখানে সাল ও ইউনিট ধরে দেখা যাবে।" />
          </Card>
        )}

        {group && inst && (
          <>
            {/* Overview */}
            <Card className="mt-4 flex items-center gap-3.5 p-4">
              <Monogram text={inst.code} hue={hueFor(inst.category)} className="h-14 min-w-14 px-3 text-[15px]" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Chip icon={FileText}>{bn(group.papers.length)} প্রশ্নপত্র</Chip>
                  {group.units.length > 1 && <Chip>{bn(group.units.length)} ইউনিট</Chip>}
                  <Chip icon={Timer} tone="gold">
                    নেগেটিভ {inst.negative ? `−${bn(inst.negative)}` : 'নেই'}
                  </Chip>
                </div>
                <p className="mt-2 text-[12.5px] font-semibold text-mist dark:text-white/55">
                  {totals.answered > 0
                    ? `${bn(totals.touched)}টি প্রশ্নপত্রে ${bn(totals.answered)}টি প্রশ্ন সমাধান · ${bn(Math.round((totals.correct / totals.answered) * 100))}% সঠিক`
                    : 'যেকোনো প্রশ্নপত্র খুলে সমাধান শুরু করো — অগ্রগতি এখানে জমা হবে।'}
                </p>
              </div>
            </Card>

            {/* Unit filter */}
            {group.units.length > 1 && (
              <Scroller className="mt-4">
                <Pill active={!unit} onClick={() => onUnit(null)}>
                  সব ইউনিট
                </Pill>
                {group.units.map((u) => (
                  <Pill key={u} active={unit === u} onClick={() => onUnit(unit === u ? null : u)}>
                    {u}
                  </Pill>
                ))}
              </Scroller>
            )}

            {/* Sessions */}
            <div className="mt-4 space-y-5">
              {sessions.map((s) => (
                <section key={s.session ?? 'unknown'} aria-label={s.label}>
                  <div className="mb-2 flex items-center gap-2 px-1">
                    <CalendarDays className="h-4 w-4 text-ink/40 dark:text-white/40" strokeWidth={2.4} aria-hidden="true" />
                    <h2 className="font-body text-[13px] font-extrabold tabular-nums text-ink/70 dark:text-white/65">{s.label}</h2>
                    <span className="text-[11.5px] font-bold text-mist dark:text-white/40">· {bn(s.papers.length)}টি</span>
                  </div>
                  <Card className="divide-y divide-ink/[0.06] p-1 dark:divide-white/[0.06]">
                    {s.papers.map((p) => (
                      <PaperRow key={p.ref} paper={p} onOpen={() => navigate(hrefs.paper(p.ref))} />
                    ))}
                  </Card>
                </section>
              ))}
              {sessions.length === 0 && (
                <Card>
                  <Empty icon={FileText} title="এই ইউনিটের প্রশ্নপত্র নেই" body="অন্য ইউনিট বেছে নাও।" />
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InstitutionView;

function PaperRow({ paper, onOpen }: { paper: Paper; onOpen: () => void }) {
  const { store } = useQbank();
  const prog = progressOf(store, { kind: 'paper', id: paper.ref });
  const total = prog?.total ?? paper.count ?? null;
  const answered = prog?.answered ?? 0;
  const pct = answered ? Math.round((prog!.correct / answered) * 100) : 0;
  const label = paper.unitLabel ?? 'পূর্ণাঙ্গ প্রশ্নপত্র';
  const short = paper.unitLabel ? paper.unitLabel.replace(' ইউনিট', '') : '—';
  return (
    <Row
      onClick={onOpen}
      ariaLabel={`${label} ${paper.sessionLabel}`}
      lead={
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-ink/[0.05] font-display text-[15px] font-extrabold text-ink dark:bg-white/[0.08] dark:text-paper"
          aria-hidden="true"
        >
          {short}
        </span>
      }
      title={
        <span className="flex items-center gap-2">
          {label}
          {paper.builtin && (
            <Chip tone="gold" className="!py-0.5 !text-[10.5px]">
              অফলাইন
            </Chip>
          )}
        </span>
      }
      meta={
        answered > 0 ? (
          <span className="flex items-center gap-2">
            <Track value={total ? answered / total : 0.1} className="w-20 sm:w-28" tone={pct >= 70 ? 'brand' : pct >= 50 ? 'gold' : 'flag'} />
            <span className="font-body tabular-nums">
              {total ? `${bn(answered)}/${bn(total)}` : `${bn(answered)}`} সমাধান · {bn(pct)}% সঠিক · {relativeDay(prog!.lastAt)}
            </span>
          </span>
        ) : (
          <span className="font-body tabular-nums">{total ? `${bn(total)} প্রশ্ন · ` : ''}এখনো শুরু করোনি</span>
        )
      }
    />
  );
}
