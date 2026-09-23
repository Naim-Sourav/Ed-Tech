import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Flag,
  LayoutList,
  Loader2,
  RotateCcw,
  SkipForward,
  Timer,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import type { QuizQuestion } from '../../types';
import { displaySubject } from '../exam/model';
import QuestionCard, { cardDomId } from './QuestionCard';
import { useQbank } from './store';
import { buildExamConfig, countPresets, newExamId, storeExamConfig, type ExamSetup } from './launch';
import {
  bn,
  countMarks,
  filterByMark,
  formatSeconds,
  markState,
  questionKey,
  REMOTE_MIN_ANSWERS,
  sourceId,
  summarizeSession,
  type MarkFilter,
  type SessionRecord,
  type SessionSource,
} from './records';
import { Btn, Bone, Card, cx, EASE, Empty, PageHeader, Pill, Scroller, Sheet, SheetHeader, Stat, Track } from './ui';

/*
 * The screen where questions are actually solved. One component serves
 * chapters, whole subjects and search results — the caller supplies the
 * questions and describes the source; this view owns the sitting.
 *
 * Two ways to work through the list:
 *   – the list itself: answer any card, one attempt each, result shown in place;
 *   – লাইভ কুইজ: one question at a time, the result stays on screen until the
 *     student moves on with "পরের প্রশ্ন" (nothing advances by itself).
 * Both feed the same sitting/records.
 */

export interface ExamOptions {
  /** Negative marking suggested for this level. */
  negative: number;
  /** Suggested minutes per question (default 1). */
  perQuestion?: number;
  subject?: string;
  chapter?: string;
}

export interface PracticeViewProps {
  source: SessionSource;
  title: string;
  subtitle?: React.ReactNode;
  eyebrow?: string;
  /** Full title used for exam configs / history (defaults to `title`). */
  examTitle?: string;
  questions: QuizQuestion[];
  /** Known size of the whole source (API total). */
  total: number | null;
  loading: boolean;
  error?: string | null;
  onRetryLoad?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  onBack: () => void;
  /** Extra filter rows rendered under the header (board/college pickers…). */
  toolbar?: React.ReactNode;
  exam: ExamOptions;
  showSource?: boolean;
  showChapter?: boolean;
  emptyTitle?: string;
  emptyBody?: string;
}

const MARK_FILTERS: { id: MarkFilter; label: string }[] = [
  { id: 'all', label: 'সব' },
  { id: 'unseen', label: 'বাকি' },
  { id: 'wrong', label: 'ভুল করা' },
  { id: 'correct', label: 'সঠিক করা' },
];

interface QuizState {
  /** Question keys in the order they are asked. */
  queue: string[];
  index: number;
}

const scrollToCard = (q: QuizQuestion, block: ScrollLogicalPosition = 'start'): void => {
  const el = typeof document === 'undefined' ? null : document.getElementById(cardDomId(q));
  el?.scrollIntoView?.({ behavior: 'smooth', block });
};

const PracticeView: React.FC<PracticeViewProps> = ({
  source,
  title,
  subtitle,
  eyebrow,
  examTitle,
  questions,
  total,
  loading,
  error = null,
  onRetryLoad,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  onBack,
  toolbar,
  exam,
  showSource = false,
  showChapter = true,
  emptyTitle = 'কোনো প্রশ্ন পাওয়া যায়নি',
  emptyBody = 'অন্য কোনো ফিল্টার বা অধ্যায় দেখো।',
}) => {
  const navigate = useNavigate();
  const { store, answer, finish, setTotal, remember, saved, toggleSave, fontFor, fontSize, uid } = useQbank();
  const sid = sourceId(source);

  useEffect(() => remember(questions), [questions, remember]);
  useEffect(() => {
    if (total && total > 0) setTotal(source, total);
  }, [total, source, setTotal]);

  /* ── sitting state ─────────────────────────────────────────────────── */
  const pending = store.pending && sourceId(store.pending.source) === sid ? store.pending : null;
  const [retried, setRetried] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [reading, setReading] = useState(false);
  const [markFilter, setMarkFilter] = useState<MarkFilter>('all');
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);

  const sessionAnswers = useMemo(() => {
    const map = new Map<string, number>();
    pending?.items.forEach((i) => {
      if (!retried.has(i.k)) map.set(i.k, i.a);
    });
    return map;
  }, [pending, retried]);

  /* ── filters ───────────────────────────────────────────────────────── */
  const subjects = useMemo(() => {
    const counts = new Map<string, number>();
    questions.forEach((q) => {
      const s = (q.subject || '').trim();
      if (s) counts.set(s, (counts.get(s) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [questions]);

  const bySubject = useMemo(
    () => (subjectFilter ? questions.filter((q) => (q.subject || '').trim() === subjectFilter) : questions),
    [questions, subjectFilter],
  );
  const markCounts = useMemo(() => countMarks(store, bySubject), [store, bySubject]);
  const numbers = useMemo(() => new Map(questions.map((q, i) => [questionKey(q), q.orderIndex ?? i + 1])), [questions]);
  const byKey = useMemo(() => new Map(questions.map((q) => [questionKey(q), q])), [questions]);

  /*
   * The mark filter is applied when it is chosen (or when more questions
   * arrive), not after every answer: a card answered under "বাকি" stays on
   * screen with its result instead of vanishing the moment it is no longer
   * unanswered. Tapping the active chip re-applies it.
   */
  const storeRef = useRef(store);
  storeRef.current = store;
  const held = useRef<{ filter: MarkFilter; keys: Set<string> } | null>(null);
  const [filterEpoch, setFilterEpoch] = useState(0);
  const visible = useMemo(() => {
    if (markFilter === 'all') {
      held.current = null;
      return bySubject;
    }
    const keys = new Set(filterByMark(storeRef.current, bySubject, markFilter).map(questionKey));
    if (held.current?.filter === markFilter) held.current.keys.forEach((k) => keys.add(k));
    held.current = { filter: markFilter, keys };
    return bySubject.filter((q) => keys.has(questionKey(q)));
  }, [markFilter, bySubject, filterEpoch]);

  const applyFilter = (f: MarkFilter) => {
    if (f === markFilter) {
      held.current = null;
      setFilterEpoch((n) => n + 1);
    } else setMarkFilter(f);
  };

  /* ── handlers ──────────────────────────────────────────────────────── */
  const onSelect = useCallback(
    (q: QuizQuestion, idx: number) => {
      if (reading) return;
      const key = questionKey(q);
      answer(source, q, idx);
      setRetried((prev) => {
        if (!prev.has(key)) return prev;
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    },
    [answer, source, reading],
  );

  const onReveal = useCallback((q: QuizQuestion) => setRevealed((prev) => new Set(prev).add(questionKey(q))), []);
  const onRetry = useCallback((q: QuizQuestion) => {
    const key = questionKey(q);
    setRetried((prev) => new Set(prev).add(key));
    setRevealed((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  /** List mode: scroll to the next card that has not been answered in this sitting. */
  const jumpFrom = useCallback(
    (q: QuizQuestion) => {
      const at = visible.findIndex((x) => questionKey(x) === questionKey(q));
      const next = visible.slice(at + 1).find((x) => !sessionAnswers.has(questionKey(x))) ?? visible[at + 1];
      if (next) scrollToCard(next);
    },
    [visible, sessionAnswers],
  );

  /* ── finishing ─────────────────────────────────────────────────────── */
  const [summary, setSummary] = useState<{ session: SessionRecord; synced: boolean | null } | null>(null);
  const onFinish = useCallback(() => {
    const { session, remote } = finish();
    if (!session) return;
    setRetried(new Set());
    setSummary({ session, synced: session.items.length >= REMOTE_MIN_ANSWERS && uid ? null : false });
    remote.then((outcome) => setSummary((cur) => (cur && cur.session.id === session.id ? { ...cur, synced: outcome !== null } : cur)));
  }, [finish, uid]);

  /* ── লাইভ কুইজ ─────────────────────────────────────────────────────── */
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const quizCandidates = useMemo(() => visible.filter((q) => !sessionAnswers.has(questionKey(q))), [visible, sessionAnswers]);

  const startQuiz = () => {
    if (quizCandidates.length === 0) return;
    setReading(false);
    setQuiz({ queue: quizCandidates.map(questionKey), index: 0 });
    stageRef.current?.scrollIntoView?.({ block: 'start' });
  };
  const stopQuiz = useCallback(() => setQuiz(null), []);

  const current = quiz ? (byKey.get(quiz.queue[quiz.index]) ?? null) : null;
  const currentAnswered = !!current && sessionAnswers.has(questionKey(current));
  const isLast = !!quiz && quiz.index >= quiz.queue.length - 1;

  const advance = useCallback(() => {
    if (!quiz) return;
    if (isLast) {
      setQuiz(null);
      onFinish();
      return;
    }
    setQuiz({ queue: quiz.queue, index: quiz.index + 1 });
    stageRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }, [quiz, isLast, onFinish]);

  // A question that disappeared from the list (filters, reload) is skipped.
  useEffect(() => {
    if (quiz && !current) {
      if (isLast) setQuiz(null);
      else setQuiz({ queue: quiz.queue, index: quiz.index + 1 });
    }
  }, [quiz, current, isLast]);

  // Keyboard: 1–4 answers, Enter/→ moves on once answered.
  useEffect(() => {
    if (!quiz || !current) return undefined;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if ((e.key === 'Enter' || e.key === 'ArrowRight') && currentAnswered) {
        e.preventDefault();
        advance();
      } else if (/^[1-4]$/.test(e.key) && !currentAnswered) {
        const idx = Number(e.key) - 1;
        if (idx < current.options.length) onSelect(current, idx);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [quiz, current, currentAnswered, advance, onSelect]);

  /* ── exam sheet ────────────────────────────────────────────────────── */
  const [examOpen, setExamOpen] = useState(false);
  const pool = visible.length ? visible : bySubject;
  const startExam = useCallback(
    (setup: ExamSetup) => {
      const config = buildExamConfig(
        {
          title: examTitle || title,
          source: { ...source, kind: 'exam', title: examTitle || title },
          subject: exam.subject,
          chapter: exam.chapter,
        },
        pool,
        setup,
      );
      const id = newExamId();
      storeExamConfig(id, config);
      setExamOpen(false);
      navigate(`/exam/${id}`);
    },
    [navigate, title, examTitle, source, exam, pool],
  );

  /* ── derived header bits ───────────────────────────────────────────── */
  const known = total ?? questions.length;
  const doneCount = useMemo(() => questions.filter((q) => markState(store, q) !== 'unseen').length, [questions, store]);
  const wrongCount = markCounts.wrong;
  const liveCorrect = pending ? pending.items.filter((i) => i.c === 1).length : 0;
  const liveWrong = pending ? pending.items.length - liveCorrect : 0;
  const showBar = !summary && (quiz !== null || (pending !== null && pending.items.length > 0));

  const renderCard = (q: QuizQuestion, withNext: boolean) => {
    const key = questionKey(q);
    const mine = sessionAnswers.get(key);
    return (
      <QuestionCard
        key={key}
        q={q}
        number={numbers.get(key) ?? 0}
        answer={mine ?? null}
        revealed={mine !== undefined || revealed.has(key)}
        reading={reading}
        mark={markState(store, q)}
        onSelect={(idx) => onSelect(q, idx)}
        onReveal={() => onReveal(q)}
        onRetry={() => onRetry(q)}
        onNext={withNext ? () => jumpFrom(q) : undefined}
        saved={!!(q._id && saved.has(q._id))}
        onToggleSave={q._id || q.id ? () => toggleSave(q) : undefined}
        fontFor={fontFor}
        fontSize={fontSize}
        showSource={showSource}
        showChapter={showChapter}
      />
    );
  };

  return (
    <div className="relative min-h-full pb-36 md:pb-28">
      <PageHeader
        title={title}
        eyebrow={quiz ? 'লাইভ কুইজ' : eyebrow}
        onBack={quiz ? stopQuiz : onBack}
        narrow
        subtitle={
          quiz ? (
            <span className="font-body tabular-nums">
              প্রশ্ন {bn(quiz.index + 1)} / {bn(quiz.queue.length)}
            </span>
          ) : (
            (subtitle ?? (
              <span className="font-body tabular-nums">
                {known ? `${bn(known.toLocaleString('en-US'))} প্রশ্ন` : ''}
                {known && questions.length < known ? ` · ${bn(questions.length)}টি লোড হয়েছে` : ''}
                {doneCount > 0 && known ? ` · ${bn(doneCount)} সমাধান` : ''}
              </span>
            ))
          )
        }
        right={
          quiz ? (
            <Btn size="sm" variant="soft" icon={LayoutList} onClick={stopQuiz}>
              তালিকা
            </Btn>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setReading((r) => !r)}
                aria-pressed={reading}
                className={cx(
                  'focus-ring inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-extrabold ring-1 transition-colors',
                  reading
                    ? 'bg-ink text-white ring-ink dark:bg-paper dark:text-ink dark:ring-paper'
                    : 'bg-white text-ink/70 ring-ink/10 hover:bg-ink/[0.04] dark:bg-white/[0.06] dark:text-white/70 dark:ring-white/10',
                )}
                title={reading ? 'উত্তর লুকাও' : 'সব উত্তর দেখাও'}
              >
                {reading ? (
                  <EyeOff className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />
                )}
                <span className="hidden sm:inline">{reading ? 'উত্তর লুকাও' : 'সব উত্তর'}</span>
              </button>
              <Btn size="sm" variant="brand" icon={Timer} onClick={() => setExamOpen(true)} disabled={questions.length === 0}>
                পরীক্ষা
              </Btn>
            </>
          )
        }
      />

      {/* ── quiz stage ─────────────────────────────────────────────────── */}
      {quiz && (
        <div ref={stageRef} className="mx-auto max-w-3xl scroll-mt-20 px-4 md:px-6">
          <div className="mt-4 flex items-center gap-3">
            <Track value={(quiz.index + (currentAnswered ? 1 : 0)) / Math.max(1, quiz.queue.length)} className="flex-1" />
            <span className="inline-flex items-center gap-2 font-body text-[12.5px] font-extrabold tabular-nums">
              <span className="inline-flex items-center gap-0.5 text-emerald-700 dark:text-emerald-300">
                <Check className="h-3.5 w-3.5" strokeWidth={3.5} aria-hidden="true" /> {bn(liveCorrect)}
              </span>
              <span className="inline-flex items-center gap-0.5 text-flag dark:text-red-300">
                <X className="h-3.5 w-3.5" strokeWidth={3.5} aria-hidden="true" /> {bn(liveWrong)}
              </span>
            </span>
          </div>
          <div className="mt-4" data-testid="qbank-quiz-stage">
            <AnimatePresence mode="wait" initial={false}>
              {current && (
                <motion.div
                  key={questionKey(current)}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.22, ease: EASE }}
                >
                  {renderCard(current, false)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <p className="mt-3 text-center text-[12px] font-semibold text-mist dark:text-white/45">
            {currentAnswered
              ? isLast
                ? 'এটাই শেষ প্রশ্ন ছিল — ফলাফল দেখতে নিচের বোতাম চাপো।'
                : 'উত্তর ও ব্যাখ্যা দেখে নাও — তৈরি হলে “পরের প্রশ্ন” চাপো।'
              : 'একটা অপশন বেছে নাও — সাথে সাথে সঠিক/ভুল দেখাবে।'}
          </p>
        </div>
      )}

      {/* ── list ───────────────────────────────────────────────────────── */}
      {!quiz && (
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          {/* Filters */}
          {toolbar}
          {subjects.length > 1 && (
            <Scroller className="mt-3">
              <Pill active={!subjectFilter} onClick={() => setSubjectFilter(null)} count={bn(questions.length)}>
                সব বিষয়
              </Pill>
              {subjects.map(([s, n]) => (
                <Pill key={s} active={subjectFilter === s} onClick={() => setSubjectFilter(subjectFilter === s ? null : s)} count={bn(n)}>
                  {displaySubject(s)}
                </Pill>
              ))}
            </Scroller>
          )}
          {questions.length > 0 && (
            <Scroller className="mt-2.5">
              {MARK_FILTERS.map((f) => {
                const count = f.id === 'all' ? bySubject.length : markCounts[f.id];
                if (f.id !== 'all' && f.id !== 'unseen' && count === 0) return null;
                return (
                  <Pill
                    key={f.id}
                    active={markFilter === f.id}
                    onClick={() => applyFilter(f.id)}
                    count={bn(count)}
                    tone={f.id === 'wrong' ? 'flag' : f.id === 'correct' ? 'emerald' : 'ink'}
                  >
                    {f.label}
                  </Pill>
                );
              })}
            </Scroller>
          )}

          {/* Reading-mode notice / wrong nudge */}
          <AnimatePresence initial={false}>
            {reading && (
              <motion.div
                key="reading"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="mt-3 flex items-center gap-2 rounded-2xl bg-ink px-4 py-2.5 text-[12.5px] font-bold text-white dark:bg-paper dark:text-ink">
                  <BookOpen className="h-4 w-4 shrink-0" strokeWidth={2.4} aria-hidden="true" />
                  পড়ার মোড — সব উত্তর ও ব্যাখ্যা খোলা, এখন উত্তর দেওয়া যাবে না।
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!reading && wrongCount > 0 && markFilter !== 'wrong' && !pending && (
            <button
              type="button"
              onClick={() => applyFilter('wrong')}
              className="focus-ring mt-3 flex w-full items-center gap-3 rounded-2xl bg-flag/[0.07] px-4 py-3 text-left ring-1 ring-flag/15 transition-colors hover:bg-flag/[0.1] dark:bg-flag/10 dark:ring-flag/25"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-flag/15 text-flag dark:text-red-300">
                <RotateCcw className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-extrabold text-ink dark:text-paper">এখানে {bn(wrongCount)}টি প্রশ্নে আগে ভুল করেছিলে</span>
                <span className="block text-[12px] font-semibold text-mist dark:text-white/50">শুধু সেগুলো আবার সমাধান করো</span>
              </span>
              <span className="inline-flex items-center gap-0.5 text-[12.5px] font-extrabold text-flag dark:text-red-300">
                দেখাও <ChevronRight className="h-4 w-4" strokeWidth={2.8} aria-hidden="true" />
              </span>
            </button>
          )}

          {/* লাইভ কুইজ entry */}
          {!reading && !loading && quizCandidates.length > 0 && (
            <button
              type="button"
              onClick={startQuiz}
              className="focus-ring mt-3 flex w-full items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-left text-white shadow-[0_20px_44px_-26px_rgba(22,18,16,0.7)] transition-colors hover:bg-ink-2 dark:bg-paper dark:text-ink dark:shadow-none dark:hover:bg-white"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand text-white">
                <Zap className="h-4 w-4" strokeWidth={2.6} fill="currentColor" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-extrabold">{pending && pending.items.length > 0 ? 'লাইভ কুইজ চালিয়ে যাও' : 'লাইভ কুইজ'}</span>
                <span className="block text-[12px] font-semibold text-white/60 dark:text-ink/60">
                  একটা করে প্রশ্ন, সাথে সাথে সঠিক/ভুল · <span className="font-body tabular-nums">{bn(quizCandidates.length)}</span>টি প্রশ্ন
                </span>
              </span>
              <span className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-white/10 px-3.5 text-[12.5px] font-extrabold dark:bg-ink/10">
                শুরু <ChevronRight className="h-4 w-4" strokeWidth={2.8} aria-hidden="true" />
              </span>
            </button>
          )}

          {/* Body */}
          <div className="mt-4 space-y-4">
            {loading && questions.length === 0 && (
              <>
                <Bone className="h-52 rounded-[26px]" />
                <Bone className="h-52 rounded-[26px]" />
                <Bone className="h-52 rounded-[26px]" />
              </>
            )}
            {!loading && error && questions.length === 0 && (
              <Card className="p-6">
                <Empty
                  icon={AlertTriangle}
                  title="প্রশ্ন আনা যায়নি"
                  body={error}
                  action={
                    onRetryLoad && (
                      <Btn variant="soft" onClick={onRetryLoad} icon={RotateCcw}>
                        আবার চেষ্টা করো
                      </Btn>
                    )
                  }
                />
              </Card>
            )}
            {!loading && !error && questions.length === 0 && (
              <Card className="p-6">
                <Empty icon={BookOpen} title={emptyTitle} body={emptyBody} />
              </Card>
            )}
            {!loading && questions.length > 0 && visible.length === 0 && (
              <Card className="p-6">
                <Empty
                  icon={markFilter === 'wrong' ? Trophy : Check}
                  title={
                    markFilter === 'wrong' ? 'ভুল করা কোনো প্রশ্ন নেই' : markFilter === 'unseen' ? 'সব প্রশ্ন সমাধান করা হয়ে গেছে!' : 'এই ফিল্টারে কিছু নেই'
                  }
                  body={markFilter === 'unseen' ? 'দারুণ! এবার পরীক্ষা দিয়ে নিজেকে যাচাই করো।' : undefined}
                  action={
                    <Btn variant="soft" onClick={() => applyFilter('all')}>
                      সব প্রশ্ন দেখাও
                    </Btn>
                  }
                />
              </Card>
            )}

            {visible.map((q, i) => renderCard(q, i < visible.length - 1))}

            {hasMore && onLoadMore && questions.length > 0 && markFilter === 'all' && !subjectFilter && (
              <div className="flex justify-center pt-2">
                <Btn
                  variant="soft"
                  size="lg"
                  onClick={onLoadMore}
                  disabled={loadingMore}
                  icon={loadingMore ? Loader2 : ChevronDown}
                  className={loadingMore ? '[&_svg]:animate-spin' : ''}
                >
                  {loadingMore ? 'আনা হচ্ছে…' : 'আরও প্রশ্ন দেখাও'}
                </Btn>
              </div>
            )}
            {hasMore && (markFilter !== 'all' || subjectFilter) && (
              <p className="text-center text-[12px] font-semibold text-mist dark:text-white/45">
                ফিল্টার শুধু লোড হওয়া {bn(questions.length)}টি প্রশ্নে কাজ করছে।{' '}
                <button type="button" className="font-extrabold text-brand-deep underline-offset-2 hover:underline dark:text-brand-bright" onClick={onLoadMore}>
                  আরও আনো
                </button>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Live sitting bar */}
      <AnimatePresence>
        {showBar && (
          <motion.div
            key="bar"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="pointer-events-none fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 px-3 md:bottom-6"
          >
            <div className="pointer-events-auto mx-auto flex max-w-xl items-center gap-2 rounded-full bg-ink py-2 pl-4 pr-2 text-white shadow-[0_24px_60px_-24px_rgba(22,18,16,0.7)] ring-1 ring-white/10 dark:bg-paper dark:text-ink dark:ring-ink/10">
              <span className="inline-flex items-center gap-1 font-body text-[13px] font-extrabold tabular-nums text-emerald-300 dark:text-emerald-700">
                <Check className="h-3.5 w-3.5" strokeWidth={3.5} aria-hidden="true" /> {bn(liveCorrect)}
              </span>
              <span className="inline-flex items-center gap-1 font-body text-[13px] font-extrabold tabular-nums text-red-300 dark:text-red-600">
                <X className="h-3.5 w-3.5" strokeWidth={3.5} aria-hidden="true" /> {bn(liveWrong)}
              </span>
              {pending && <Elapsed since={pending.startedAt} />}
              <span className="flex-1" />
              {quiz ? (
                <>
                  {pending && pending.items.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuiz(null);
                        onFinish();
                      }}
                      aria-label="কুইজ শেষ করো"
                      title="শেষ করো"
                      className="focus-ring grid h-9 w-9 shrink-0 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white dark:text-ink/60 dark:hover:bg-ink/10 dark:hover:text-ink"
                    >
                      <Flag className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />
                    </button>
                  )}
                  {currentAnswered ? (
                    <button
                      type="button"
                      onClick={advance}
                      className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-full bg-brand px-4 text-[13px] font-extrabold text-white transition-colors hover:bg-brand-deep"
                    >
                      {isLast ? (
                        <>
                          <Trophy className="h-3.5 w-3.5" strokeWidth={2.8} aria-hidden="true" /> ফলাফল দেখো
                        </>
                      ) : (
                        <>
                          পরের প্রশ্ন <ChevronRight className="h-4 w-4" strokeWidth={2.8} aria-hidden="true" />
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={advance}
                      className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-full bg-white/10 px-4 text-[13px] font-extrabold text-white/80 transition-colors hover:bg-white/15 hover:text-white dark:bg-ink/10 dark:text-ink/70 dark:hover:bg-ink/15 dark:hover:text-ink"
                    >
                      {isLast ? 'শেষ করো' : 'এড়িয়ে যাও'} <SkipForward className="h-3.5 w-3.5" strokeWidth={2.6} aria-hidden="true" />
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={onFinish}
                  className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-full bg-brand px-4 text-[13px] font-extrabold text-white transition-colors hover:bg-brand-deep"
                >
                  <Flag className="h-3.5 w-3.5" strokeWidth={2.8} aria-hidden="true" /> শেষ করো
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ExamSheet
        open={examOpen}
        onClose={() => setExamOpen(false)}
        available={pool.length}
        defaults={exam}
        onStart={startExam}
        note={hasMore ? `লোড হওয়া ${bn(pool.length)}টি প্রশ্ন থেকে` : undefined}
      />

      <SummarySheet
        summary={summary}
        onClose={() => setSummary(null)}
        onRetryWrong={() => {
          setSummary(null);
          setQuiz(null);
          applyFilter('wrong');
        }}
        onExam={() => {
          setSummary(null);
          setExamOpen(true);
        }}
      />
    </div>
  );
};

export default PracticeView;

/* ── pieces ───────────────────────────────────────────────────────────── */

const Elapsed: React.FC<{ since: number }> = ({ since }) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const s = Math.max(0, Math.floor((now - since) / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return (
    <span className="ml-1 font-body text-[12.5px] font-bold tabular-nums text-white/60 dark:text-ink/50" aria-label="সময়">
      {bn(`${mm}:${ss}`)}
    </span>
  );
};

const NEGATIVES = [0, 0.25, 0.5];

function ExamSheet({
  open,
  onClose,
  available,
  defaults,
  onStart,
  note,
}: {
  open: boolean;
  onClose: () => void;
  available: number;
  defaults: ExamOptions;
  onStart: (setup: ExamSetup) => void;
  note?: string;
}) {
  const presets = useMemo(() => countPresets(available), [available]);
  const [count, setCount] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [negative, setNegative] = useState(defaults.negative);
  const [touchedTime, setTouchedTime] = useState(false);

  const suggestMinutes = useCallback((n: number) => Math.max(5, Math.ceil((n * (defaults.perQuestion ?? 1)) / 5) * 5), [defaults]);

  // Reset the form each time the sheet opens (latest defaults via refs, so re-renders while open do not reset it).
  const latest = useRef({ available, defaults, presets, suggestMinutes });
  latest.current = { available, defaults, presets, suggestMinutes };
  useEffect(() => {
    if (!open) return;
    const { available: n, defaults: d, presets: p, suggestMinutes: suggest } = latest.current;
    const initial = Math.min(n, p.includes(30) ? 30 : (p[p.length - 1] ?? n));
    setCount(initial);
    setMinutes(suggest(initial));
    setNegative(d.negative);
    setTouchedTime(false);
  }, [open]);

  const pickCount = (n: number) => {
    setCount(n);
    if (!touchedTime) setMinutes(suggestMinutes(n));
  };

  return (
    <Sheet open={open} onClose={onClose} label="পরীক্ষার সেটআপ">
      <SheetHeader icon={Timer} title="পরীক্ষা দাও" description="সময় ধরে, উত্তর লুকানো — শেষে ফলাফল, ভুলের তালিকা ও রেকর্ড।" onClose={onClose} />

      <div className="mt-5 space-y-5">
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-[13px] font-extrabold text-ink dark:text-paper">প্রশ্ন সংখ্যা</span>
            {note && <span className="text-[11.5px] font-semibold text-mist dark:text-white/45">{note}</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((n) => (
              <Pill key={n} active={count === n} onClick={() => pickCount(n)}>
                {n === available && presets.length > 1 ? `সব (${bn(n)})` : bn(n)}
              </Pill>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-[13px] font-extrabold text-ink dark:text-paper">সময়</span>
            <span className="text-[11.5px] font-semibold text-mist dark:text-white/45">
              {minutes === 0 ? 'সময়সীমা নেই' : `প্রতি প্রশ্নে ~${bn(Math.round((minutes * 60) / Math.max(1, count)))} সে`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="৫ মিনিট কমাও"
              onClick={() => {
                setTouchedTime(true);
                setMinutes((m) => Math.max(0, m - 5));
              }}
              className="focus-ring grid h-11 w-11 place-items-center rounded-full bg-ink/[0.05] text-[18px] font-extrabold text-ink hover:bg-ink/[0.09] dark:bg-white/[0.08] dark:text-white"
            >
              −
            </button>
            <div className="flex h-11 flex-1 items-center justify-center rounded-full bg-ink/[0.04] font-body text-[16px] font-bold tabular-nums text-ink dark:bg-white/[0.06] dark:text-paper">
              {minutes === 0 ? 'আনলিমিটেড' : `${bn(minutes)} মিনিট`}
            </div>
            <button
              type="button"
              aria-label="৫ মিনিট বাড়াও"
              onClick={() => {
                setTouchedTime(true);
                setMinutes((m) => Math.min(240, m + 5));
              }}
              className="focus-ring grid h-11 w-11 place-items-center rounded-full bg-ink/[0.05] text-[18px] font-extrabold text-ink hover:bg-ink/[0.09] dark:bg-white/[0.08] dark:text-white"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <div className="mb-2 text-[13px] font-extrabold text-ink dark:text-paper">নেগেটিভ মার্কিং</div>
          <div className="flex flex-wrap gap-2">
            {NEGATIVES.map((n) => (
              <Pill key={n} active={negative === n} onClick={() => setNegative(n)}>
                {n === 0 ? 'নেই' : `−${bn(n)}`}
              </Pill>
            ))}
          </div>
        </div>

        <Btn variant="brand" size="lg" full icon={Timer} onClick={() => onStart({ count, minutes, negative })} disabled={count === 0}>
          {bn(count)}টি প্রশ্নে পরীক্ষা শুরু করো
        </Btn>
      </div>
    </Sheet>
  );
}

function SummarySheet({
  summary,
  onClose,
  onRetryWrong,
  onExam,
}: {
  summary: { session: SessionRecord; synced: boolean | null } | null;
  onClose: () => void;
  onRetryWrong: () => void;
  onExam: () => void;
}) {
  const s = summary ? summarizeSession(summary.session) : null;
  const tone = !s ? 'brand' : s.accuracy >= 80 ? 'emerald' : s.accuracy >= 50 ? 'brand' : 'flag';
  const headline = !s ? '' : s.accuracy >= 80 ? 'দারুণ হয়েছে!' : s.accuracy >= 50 ? 'ভালো চেষ্টা!' : 'আরেকবার দেখে নাও';
  return (
    <Sheet open={!!summary} onClose={onClose} label="সেশনের সারাংশ">
      {summary && s && (
        <>
          <SheetHeader icon={Trophy} tone={tone} title={headline} description={summary.session.source.title} onClose={onClose} />
          <div className="mt-5 grid grid-cols-3 gap-2">
            <Stat value={`${bn(s.accuracy)}%`} label="সঠিকতা" tone={tone === 'brand' ? 'neutral' : tone} />
            <Stat value={`${bn(s.correct)}/${bn(s.answered)}`} label="সঠিক" tone="emerald" />
            <Stat value={formatSeconds(s.seconds)} label="সময়" />
          </div>
          {s.bySubject.length > 1 && (
            <div className="mt-4 space-y-2">
              {s.bySubject.slice(0, 5).map((row) => (
                <div key={row.subject} className="flex items-center gap-3 text-[12.5px] font-bold">
                  <span className="w-28 truncate text-ink/70 dark:text-white/60">{displaySubject(row.subject)}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/8 dark:bg-white/10">
                    <span className="block h-full rounded-full bg-emerald-500" style={{ width: `${Math.round((row.correct / row.answered) * 100)}%` }} />
                  </span>
                  <span className="w-12 text-right font-body tabular-nums text-ink dark:text-paper">
                    {bn(row.correct)}/{bn(row.answered)}
                  </span>
                </div>
              ))}
            </div>
          )}
          <p className="mt-4 text-[12px] font-semibold text-mist dark:text-white/45">
            {summary.synced === null
              ? 'রেকর্ড সেভ হচ্ছে…'
              : summary.synced
                ? 'রেকর্ড সেভ হয়েছে — পয়েন্ট, স্ট্রিক আর ভুলের খাতায় যোগ হয়েছে।'
                : s.answered < REMOTE_MIN_ANSWERS
                  ? `${bn(REMOTE_MIN_ANSWERS)}টির কম উত্তর — এই সেশন শুধু এই ডিভাইসে থাকল।`
                  : 'রেকর্ড এই ডিভাইসে সেভ হয়েছে।'}
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            {s.wrong > 0 && (
              <Btn variant="danger" icon={RotateCcw} onClick={onRetryWrong} className="flex-1">
                ভুলগুলো আবার ({bn(s.wrong)})
              </Btn>
            )}
            <Btn variant="soft" icon={Timer} onClick={onExam} className="flex-1">
              পরীক্ষা দাও
            </Btn>
            <Btn variant="primary" onClick={onClose} className="flex-1">
              ঠিক আছে
            </Btn>
          </div>
        </>
      )}
    </Sheet>
  );
}
