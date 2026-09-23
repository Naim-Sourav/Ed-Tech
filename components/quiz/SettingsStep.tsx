import React from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  AlignJustify,
  Clock,
  Eye,
  FileText,
  Gauge,
  LayoutList,
  ListChecks,
  Minus,
  MinusCircle,
  Pencil,
  Plus,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { paperLabel, type SubjectGroup } from './catalog';
import {
  applyPreset,
  clampCount,
  COUNT_OPTIONS,
  COUNT_STEP,
  formatMinutes,
  matchPreset,
  MAX_COUNT,
  MIN_COUNT,
  NEGATIVE_OPTIONS,
  PRESETS,
  TIME_OPTIONS,
  type ExamSettings,
} from './presets';
import { autoTitle, countChapters, selectedChapters, selectedGroups, type Selection } from './selection';
import { bn, Card, EASE, Pill, SectionLabel, Segmented } from './ui';

interface Props {
  settings: ExamSettings;
  onSettingsChange: (next: ExamSettings) => void;
  /** When true, the time limit tracks the question count (1 minute per question). */
  timeFollowsCount: boolean;
  onTimeFollowsCountChange: (v: boolean) => void;
  selection: Selection;
  onRemoveChapter: (paper: string, chapter: string) => void;
  onEditSubject: (group: SubjectGroup) => void;
  onAddSubject: () => void;
  /** Approximate pool size for the selection (0 = unknown). */
  available: number;
  title: string;
  onTitleChange: (v: string) => void;
}

export default function SettingsStep({
  settings,
  onSettingsChange,
  timeFollowsCount,
  onTimeFollowsCountChange,
  selection,
  onRemoveChapter,
  onEditSubject,
  onAddSubject,
  available,
  title,
  onTitleChange,
}: Props) {
  const activePreset = matchPreset(settings);
  const chapters = selectedChapters(selection);
  const groups = selectedGroups(selection);
  const nChapters = countChapters(selection);
  const lowPool = available > 0 && available < settings.count;

  const setCount = (raw: number) => {
    const count = clampCount(raw);
    onSettingsChange({ ...settings, count, timeLimit: timeFollowsCount ? count : settings.timeLimit });
  };
  const setTime = (timeLimit: number, follows = false) => {
    onTimeFollowsCountChange(follows);
    onSettingsChange({ ...settings, timeLimit: follows ? settings.count : timeLimit });
  };

  const summary = (
    <Card className="lg:sticky lg:top-0">
      <SectionLabel icon={<FileText className="h-3.5 w-3.5" />}>তোমার মক</SectionLabel>

      <label className="block">
        <span className="sr-only">পরীক্ষার নাম</span>
        <span className="flex items-center gap-2 rounded-2xl border border-ink/10 bg-paper/60 px-3.5 py-2.5 transition-colors focus-within:border-brand focus-within:bg-white">
          <Pencil className="h-4 w-4 shrink-0 text-mist" />
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={autoTitle(selection)}
            maxLength={80}
            className="min-w-0 flex-1 bg-transparent font-bangla text-[15px] font-bold text-ink outline-none placeholder:font-bold placeholder:text-ink/60"
          />
        </span>
        <span className="mt-1 block text-[11.5px] text-mist">নাম না দিলে এটাই থাকবে — ইতিহাসে এই নামে খুঁজে পাবে।</span>
      </label>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-paper/60 p-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-mist">অধ্যায়</p>
          <p className="mt-0.5 font-bangla text-[22px] font-extrabold leading-none text-ink">{bn(nChapters)}</p>
        </div>
        <div className="rounded-2xl bg-paper/60 p-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-mist">প্রশ্ন আছে</p>
          <p className="mt-0.5 font-bangla text-[22px] font-extrabold leading-none text-ink">{available > 0 ? `~${bn(available)}` : '—'}</p>
        </div>
      </div>

      <ul className="mt-4 space-y-3">
        {groups.map((g) => {
          const own = chapters.filter((c) => c.group?.name === g.name);
          return (
            <li key={g.name}>
              <div className="flex items-center justify-between gap-2">
                <p className="font-bangla text-[14px] font-bold text-ink">
                  {g.display} <span className="text-[12px] font-semibold text-mist">· {bn(own.length)}টি অধ্যায়</span>
                </p>
                <button
                  type="button"
                  onClick={() => onEditSubject(g)}
                  className="focus-ring rounded-full px-2 py-1 text-[12px] font-bold text-brand-deep hover:bg-mint"
                >
                  বদলাও
                </button>
              </div>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {own.map((c) => (
                  <li
                    key={`${c.paper}-${c.chapter}`}
                    className="inline-flex max-w-full items-center gap-1 rounded-full bg-ink/5 py-1 pl-2.5 pr-1 text-[12.5px] font-semibold text-ink/80"
                  >
                    <span className="truncate">
                      {g.papers.length > 1 && <span className="text-mist">{paperLabel(c.paper)} · </span>}
                      {c.chapter}
                      {!c.all && <span className="text-brand-deep"> ({bn(c.topics.length)} টপিক)</span>}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveChapter(c.paper, c.chapter)}
                      aria-label={`${c.chapter} বাদ দাও`}
                      className="focus-ring grid h-5 w-5 shrink-0 place-items-center rounded-full text-mist transition-colors hover:bg-white hover:text-flag"
                    >
                      <X className="h-3 w-3" strokeWidth={3} />
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={onAddSubject}
        className="focus-ring mt-4 inline-flex items-center gap-1.5 rounded-full border border-dashed border-ink/20 px-3.5 py-2 text-[13px] font-bold text-ink/70 transition-colors hover:border-brand hover:text-brand-deep"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} /> আরও বিষয় যোগ করো
      </button>
    </Card>
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
      <div className="space-y-4">
        {/* Presets */}
        <div>
          <SectionLabel
            icon={<Sparkles className="h-3.5 w-3.5" />}
            aside={!activePreset && <span className="rounded-full bg-ink/5 px-2.5 py-1 text-[11.5px] font-bold text-ink/70">কাস্টম সেটিংস</span>}
          >
            এক ট্যাপে সেট করো
          </SectionLabel>
          <div className="-mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 xl:grid-cols-4">
            {PRESETS.map((p) => {
              const active = activePreset === p.id;
              return (
                <motion.button
                  key={p.id}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  aria-pressed={active}
                  onClick={() => {
                    onTimeFollowsCountChange(p.settings.timeLimit === p.settings.count);
                    onSettingsChange(applyPreset(settings, p));
                  }}
                  className={`focus-ring min-w-[180px] snap-start rounded-[20px] border p-3.5 text-left transition-all duration-300 sm:min-w-0 ${
                    active ? 'border-brand bg-mint shadow-[0_16px_34px_-20px_rgba(255,82,0,0.6)]' : 'border-ink/8 bg-white hover:border-brand/40'
                  }`}
                >
                  <p className={`font-bangla text-[14.5px] font-bold ${active ? 'text-brand-deep' : 'text-ink'}`}>{p.title}</p>
                  <p className="mt-0.5 text-[12px] leading-snug text-mist">{p.hint}</p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Count */}
        <Card>
          <SectionLabel
            icon={<ListChecks className="h-3.5 w-3.5" />}
            aside={
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCount(settings.count - COUNT_STEP)}
                  disabled={settings.count <= MIN_COUNT}
                  aria-label="৫টি কমাও"
                  className="focus-ring grid h-8 w-8 place-items-center rounded-full bg-ink/5 text-ink/70 transition-colors hover:bg-ink/10 disabled:opacity-30"
                >
                  <Minus className="h-4 w-4" strokeWidth={2.5} />
                </button>
                <motion.span
                  key={settings.count}
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="min-w-[3.5rem] text-center font-bangla text-[22px] font-extrabold tabular-nums text-ink"
                >
                  {bn(settings.count)}
                </motion.span>
                <button
                  type="button"
                  onClick={() => setCount(settings.count + COUNT_STEP)}
                  disabled={settings.count >= MAX_COUNT}
                  aria-label="৫টি বাড়াও"
                  className="focus-ring grid h-8 w-8 place-items-center rounded-full bg-ink/5 text-ink/70 transition-colors hover:bg-ink/10 disabled:opacity-30"
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </div>
            }
          >
            প্রশ্ন সংখ্যা
          </SectionLabel>
          <div className="flex flex-wrap gap-2">
            {COUNT_OPTIONS.map((n) => (
              <Pill key={n} selected={settings.count === n} onClick={() => setCount(n)}>
                {bn(n)}
              </Pill>
            ))}
          </div>
          {lowPool ? (
            <p className="mt-3 flex items-start gap-1.5 rounded-2xl bg-amber-50/80 px-3 py-2 text-[12.5px] font-semibold text-amber-900">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              বাছাই করা অংশে এখন প্রায় {bn(available)}টি প্রশ্ন আছে — যতটা পাওয়া যায় ততটা দিয়েই মক হবে। আরও অধ্যায় যোগ করলে পুরো {bn(settings.count)}টি
              পাবে।
            </p>
          ) : available > 0 ? (
            <p className="mt-3 text-[12.5px] text-mist">বাছাই করা অংশে প্রায় {bn(available)}টি প্রশ্ন আছে — প্রতিবার নতুন সেট পাবে।</p>
          ) : null}
        </Card>

        {/* Time */}
        <Card>
          <SectionLabel
            icon={<Clock className="h-3.5 w-3.5" />}
            aside={<span className="text-[13px] font-bold text-ink/70">{formatMinutes(settings.timeLimit)}</span>}
          >
            সময়
          </SectionLabel>
          <div className="flex flex-wrap gap-2">
            <Pill selected={timeFollowsCount} onClick={() => setTime(settings.count, true)} hint={`${bn(settings.count)} মি.`}>
              প্রশ্নপ্রতি ১ মিনিট
            </Pill>
            {TIME_OPTIONS.map((m) => (
              <Pill key={m} selected={!timeFollowsCount && settings.timeLimit === m} onClick={() => setTime(m)}>
                {formatMinutes(m)}
              </Pill>
            ))}
          </div>
          <p className="mt-3 text-[12.5px] text-mist">ভর্তি পরীক্ষার গতি ধরতে প্রশ্নপ্রতি ১ মিনিটই সবচেয়ে কাজের। শুরুতে চাপ লাগলে সময় খুলে রাখো।</p>
        </Card>

        {/* Negative marking */}
        <Card>
          <SectionLabel icon={<MinusCircle className="h-3.5 w-3.5" />}>নেগেটিভ মার্কিং</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {NEGATIVE_OPTIONS.map((n) => (
              <Pill key={n} selected={settings.negativeMarking === n} onClick={() => onSettingsChange({ ...settings, negativeMarking: n })}>
                {n === 0 ? 'নেই' : `−${bn(String(n))}`}
              </Pill>
            ))}
          </div>
          <p className="mt-3 text-[12.5px] text-mist">প্রতিটি ভুল উত্তরে এই নম্বর কাটা যাবে। বেশিরভাগ ভর্তি পরীক্ষায় ০.২৫ কাটা হয়।</p>
        </Card>

        {/* Mode + view */}
        <Card>
          <SectionLabel icon={<Gauge className="h-3.5 w-3.5" />}>কীভাবে দেবে?</SectionLabel>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <ModeCard
              selected={!settings.practice}
              onClick={() => onSettingsChange({ ...settings, practice: false })}
              icon={<Target className="h-5 w-5" />}
              title="পরীক্ষা মোড"
              hint="আসল পরীক্ষার মতো — ফলাফল আর ব্যাখ্যা শেষে একসাথে।"
            />
            <ModeCard
              selected={settings.practice}
              onClick={() => onSettingsChange({ ...settings, practice: true })}
              icon={<Eye className="h-5 w-5" />}
              title="প্র্যাকটিস মোড"
              hint="প্রতিটি উত্তরের সাথে সাথে সঠিক উত্তর ও ব্যাখ্যা।"
            />
          </div>
          <div className="mt-4">
            <p className="mb-2 text-[12.5px] font-bold text-ink/70">প্রশ্ন দেখার ধরন</p>
            <div className="sm:max-w-sm">
              <Segmented
                ariaLabel="প্রশ্ন দেখার ধরন"
                value={settings.view}
                onChange={(view) => onSettingsChange({ ...settings, view })}
                options={[
                  {
                    value: 'ALL_AT_ONCE',
                    label: (
                      <>
                        <AlignJustify className="h-4 w-4" /> সব একসাথে
                      </>
                    ),
                  },
                  {
                    value: 'SINGLE_PAGE',
                    label: (
                      <>
                        <LayoutList className="h-4 w-4" /> একটা করে
                      </>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </Card>
      </div>

      {summary}
    </div>
  );
}

function ModeCard({ selected, onClick, icon, title, hint }: { selected: boolean; onClick: () => void; icon: React.ReactNode; title: string; hint: string }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      whileTap={{ scale: 0.98 }}
      className={`focus-ring flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all duration-300 ${
        selected ? 'border-brand bg-mint shadow-[0_14px_30px_-18px_rgba(255,82,0,0.6)]' : 'border-ink/10 bg-paper/60 hover:border-brand/30'
      }`}
    >
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors duration-300 ${selected ? 'bg-brand text-white' : 'bg-ink/5 text-ink/60'}`}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className={`block font-bangla text-[14.5px] font-bold ${selected ? 'text-brand-deep' : 'text-ink'}`}>{title}</span>
        <span className="mt-0.5 block text-[12px] leading-snug text-mist">{hint}</span>
      </span>
    </motion.button>
  );
}
