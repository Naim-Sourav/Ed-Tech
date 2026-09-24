import React, { memo, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowDown, Bookmark, Check, Eye, Lightbulb, RotateCcw, X } from 'lucide-react';
import type { QuizQuestion } from '../../types';
import SafeHtml from '../SafeHtml';
import { displaySubject, optionLabel } from '../exam/model';
import { bn, questionKey, type MarkState } from './records';
import { Chip, cx } from './ui';
import { useMathJax } from './useMathJax';

/** DOM id of a question's card, so views can scroll to it. */
export const cardDomId = (q: Pick<QuizQuestion, '_id' | 'id' | 'question' | 'options'>): string => `qbank-q-${questionKey(q)}`;

export type FontSizeStep = 'text-sm' | 'text-base' | 'text-lg' | 'text-xl';

const TYPE_SCALE: Record<FontSizeStep, { question: string; body: string }> = {
  'text-sm': { question: 'text-[16px] md:text-[18px]', body: 'text-[14px] md:text-[15px]' },
  'text-base': { question: 'text-[17.5px] md:text-[20px]', body: 'text-[15px] md:text-[16px]' },
  'text-lg': { question: 'text-[20px] md:text-[23px]', body: 'text-[16px] md:text-[17.5px]' },
  'text-xl': { question: 'text-[22px] md:text-[26px]', body: 'text-[17px] md:text-[19px]' },
};

type OptionState = 'idle' | 'correct' | 'wrong' | 'dim';

const OPTION_STYLES: Record<OptionState, { row: string; bubble: string }> = {
  idle: {
    row: 'border-ink/10 bg-white hover:border-brand/50 hover:bg-mint/60 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-brand/60 dark:hover:bg-brand/10',
    bubble:
      'border-ink/15 bg-paper/60 text-ink/70 group-hover:border-brand/50 group-hover:text-brand-deep dark:border-white/15 dark:bg-white/[0.05] dark:text-white/70 dark:group-hover:text-brand-bright',
  },
  correct: {
    row: 'border-emerald-500/60 bg-emerald-500/10 dark:border-emerald-400/50 dark:bg-emerald-400/10',
    bubble: 'border-emerald-600 bg-emerald-600 text-white',
  },
  wrong: {
    row: 'border-flag/60 bg-flag/10 dark:border-flag/60 dark:bg-flag/15',
    bubble: 'border-flag bg-flag text-white',
  },
  dim: {
    row: 'border-ink/8 bg-white opacity-60 dark:border-white/8 dark:bg-white/[0.02]',
    bubble: 'border-ink/10 bg-paper/60 text-ink/60 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/60',
  },
};

export interface QuestionCardProps {
  q: QuizQuestion;
  /** 1-based number shown on the card. */
  number: number;
  /** Chosen option in this sitting, if any. */
  answer: number | null;
  /** Show the key (after answering, after "উত্তর দেখাও", or in reading mode). */
  revealed: boolean;
  /** Reading mode: answers shown for every card, no answering. */
  reading: boolean;
  /** What the student did with this question earlier (from the records). */
  mark: MarkState;
  onSelect: (optionIndex: number) => void;
  onReveal: () => void;
  onRetry?: () => void;
  /** Offered once the question is answered: jump to the next question. */
  onNext?: () => void;
  saved: boolean;
  onToggleSave?: () => void;
  fontFor: (text?: string) => string;
  fontSize: FontSizeStep;
  /** Show the paper the question came from (bank/chapter/search views). */
  showSource?: boolean;
  /** Show the chapter chip (paper views, where chapter is the useful tag). */
  showChapter?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  q,
  number,
  answer,
  revealed,
  reading,
  mark,
  onSelect,
  onReveal,
  onRetry,
  onNext,
  saved,
  onToggleSave,
  fontFor,
  fontSize,
  showSource = false,
  showChapter = true,
}) => {
  const scale = TYPE_SCALE[fontSize] ?? TYPE_SCALE['text-base'];
  const answered = answer !== null;
  const locked = reading || revealed;
  const rootRef = useRef<HTMLElement>(null);
  // Question/options render on mount; the explanation appears once `locked` flips.
  useMathJax(rootRef, [q, locked]);
  const chapter = (q.chapter || '').trim();
  const subject = q.subject ? displaySubject(q.subject) : '';
  const source = (q.examRef || '').trim();
  const isRight = answered && answer === q.correctAnswerIndex;

  const stateFor = (optionIndex: number): OptionState => {
    if (!locked) return 'idle';
    if (optionIndex === q.correctAnswerIndex) return 'correct';
    if (answer === optionIndex) return 'wrong';
    return 'dim';
  };

  return (
    <article
      ref={rootRef}
      id={cardDomId(q)}
      className={cx(
        'qbank-math scroll-mt-32 overflow-hidden rounded-[26px] bg-white ring-1 shadow-[0_18px_44px_-30px_rgba(22,18,16,0.35)] dark:bg-ink-2 dark:shadow-none',
        answered ? (isRight ? 'ring-emerald-500/40' : 'ring-flag/40') : 'ring-ink/8 dark:ring-white/10',
      )}
      aria-label={`প্রশ্ন ${bn(number)}`}
      data-testid="qbank-question"
    >
      {(q.contextText || q.contextImage) && (
        <div className="border-b border-ink/8 bg-ink/[0.03] px-5 py-4 dark:border-white/8 dark:bg-white/[0.03] sm:px-6">
          <Chip tone="gold" className="mb-2.5">
            উদ্দীপক
          </Chip>
          {q.contextText && (
            <SafeHtml
              html={q.contextText}
              className={cx('tex2jax_process whitespace-pre-wrap font-semibold leading-relaxed text-ink dark:text-paper', scale.body, fontFor(q.contextText))}
            />
          )}
          {q.contextImage && (
            <div className="mt-3 overflow-hidden rounded-2xl bg-white p-1.5 ring-1 ring-ink/8">
              <img
                src={q.contextImage}
                alt="উদ্দীপক"
                className="mx-auto h-auto max-h-[360px] max-w-full rounded-xl object-contain"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </div>
          )}
        </div>
      )}

      <div className="p-4.5 sm:p-6">
        {/* Meta row */}
        <div className="mb-3 flex items-center gap-2">
          <span className="font-body text-[13px] font-extrabold tabular-nums text-brand-deep dark:text-brand-bright">প্রশ্ন {bn(number)}</span>
          {mark === 'wrong' && !answered && (
            <Chip tone="flag" className="hidden sm:inline-flex">
              আগে ভুল হয়েছিল
            </Chip>
          )}
          {mark === 'correct' && !answered && (
            <Chip tone="emerald" icon={Check} className="hidden sm:inline-flex">
              আগে সঠিক
            </Chip>
          )}
          <span className="flex-1" />
          {onToggleSave && (
            <button
              type="button"
              onClick={onToggleSave}
              aria-pressed={saved}
              aria-label={saved ? 'বুকমার্ক সরাও' : 'প্রশ্নটি বুকমার্ক করো'}
              title="বুকমার্ক"
              className={cx(
                'focus-ring grid h-9 w-9 place-items-center rounded-full transition-colors',
                saved
                  ? 'bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-bright'
                  : 'text-ink/55 hover:bg-ink/5 hover:text-ink dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white',
              )}
            >
              <Bookmark className="h-[17px] w-[17px]" strokeWidth={2.3} fill={saved ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>

        {/* Question */}
        <h2 className={cx('tex2jax_process whitespace-pre-wrap font-bold leading-[1.55] text-ink dark:text-paper', scale.question, fontFor(q.question))}>
          <SafeHtml html={q.question} as="span" />
        </h2>
        {q.questionImage && (
          <div className="mt-4 overflow-hidden rounded-2xl bg-paper/60 p-2 ring-1 ring-ink/8 dark:bg-white/[0.04] dark:ring-white/10">
            <img
              src={q.questionImage}
              alt="প্রশ্নের ছবি"
              className="mx-auto h-auto max-h-[300px] max-w-full rounded-xl object-contain"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          </div>
        )}

        {/* Options */}
        <div className="mt-4 space-y-2.5" role="group" aria-label="উত্তরের অপশন">
          {q.options.map((opt, oIdx) => {
            const state = stateFor(oIdx);
            const style = OPTION_STYLES[state];
            const image = q.optionsImages?.[oIdx];
            const isMine = answer === oIdx;
            return (
              <motion.div key={oIdx} whileTap={!locked ? { scale: 0.99 } : undefined}>
                <button
                  type="button"
                  onClick={() => onSelect(oIdx)}
                  disabled={locked}
                  aria-pressed={isMine}
                  className={cx(
                    'group flex w-full items-start gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition-all duration-200 focus-ring',
                    style.row,
                    locked && 'cursor-default',
                  )}
                >
                  <span
                    className={cx(
                      'mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border font-body text-[13px] font-extrabold transition-colors',
                      style.bubble,
                    )}
                    aria-hidden="true"
                  >
                    {optionLabel(oIdx)}
                  </span>
                  <span className="min-w-0 flex-1 pt-1">
                    {opt && (
                      <SafeHtml
                        html={opt}
                        as="span"
                        className={cx('tex2jax_process block whitespace-pre-wrap leading-relaxed text-ink dark:text-paper', scale.body, fontFor(opt))}
                      />
                    )}
                    {image && (
                      <img
                        src={image}
                        alt={`অপশন ${optionLabel(oIdx)}`}
                        className="mt-2 max-h-24 rounded-xl bg-white object-contain ring-1 ring-ink/8"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    )}
                  </span>
                  {state === 'correct' && (
                    <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-600 text-white" aria-label="সঠিক">
                      <Check className="h-3.5 w-3.5" strokeWidth={4} />
                    </span>
                  )}
                  {state === 'wrong' && (
                    <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-flag text-white" aria-label="ভুল">
                      <X className="h-3.5 w-3.5" strokeWidth={4} />
                    </span>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Footer: verdict / actions / tags */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {answered ? (
            <span
              className={cx(
                'inline-flex items-center gap-1.5 text-[13px] font-extrabold',
                isRight ? 'text-emerald-700 dark:text-emerald-300' : 'text-flag dark:text-red-300',
              )}
            >
              {isRight ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" /> : <X className="h-4 w-4" strokeWidth={3} aria-hidden="true" />}
              {isRight ? 'সঠিক!' : `ভুল — সঠিক উত্তর ${optionLabel(q.correctAnswerIndex)}`}
            </span>
          ) : revealed && !reading ? (
            <span className="inline-flex items-center gap-1.5 text-[13px] font-extrabold text-ink/60 dark:text-white/60">
              <Eye className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" /> উত্তর দেখা হয়েছে
            </span>
          ) : !reading ? (
            <button
              type="button"
              onClick={onReveal}
              className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-extrabold text-ink/65 ring-1 ring-ink/10 transition-colors hover:bg-ink/[0.04] hover:text-ink dark:text-white/65 dark:ring-white/12 dark:hover:bg-white/[0.06] dark:hover:text-white"
            >
              <Eye className="h-3.5 w-3.5" strokeWidth={2.6} aria-hidden="true" /> উত্তর দেখাও
            </button>
          ) : null}
          {answered && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="focus-ring inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-[12px] font-extrabold text-ink/55 hover:bg-ink/[0.04] hover:text-ink dark:text-white/55 dark:hover:bg-white/[0.06] dark:hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={2.6} aria-hidden="true" /> আবার
            </button>
          )}
          {answered && onNext && (
            <button
              type="button"
              onClick={onNext}
              className="focus-ring inline-flex h-8 items-center gap-1 rounded-full bg-ink/[0.05] px-3 text-[12px] font-extrabold text-ink transition-colors hover:bg-ink/[0.09] dark:bg-white/[0.08] dark:text-white dark:hover:bg-white/[0.12]"
            >
              পরের প্রশ্ন <ArrowDown className="h-3.5 w-3.5" strokeWidth={2.8} aria-hidden="true" />
            </button>
          )}
          <span className="flex-1" />
          <span className="flex flex-wrap items-center justify-end gap-1.5">
            {showSource && source && <Chip tone="brand">{source}</Chip>}
            {showChapter && chapter && <Chip>{chapter}</Chip>}
            {!chapter && subject && <Chip>{subject}</Chip>}
            {mark === 'wrong' && !answered && (
              <Chip tone="flag" className="sm:hidden">
                আগে ভুল
              </Chip>
            )}
          </span>
        </div>

        {/* Explanation */}
        {locked && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 rounded-2xl bg-amber-50/80 p-4 ring-1 ring-amber-200/70 dark:bg-amber-400/[0.07] dark:ring-amber-300/20"
          >
            <div className="mb-1.5 flex items-center gap-1.5 text-[12px] font-extrabold tracking-[0.03em] text-brand-deep dark:text-amber-200">
              <Lightbulb className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" /> ব্যাখ্যা
            </div>
            {q.explanation ? (
              <SafeHtml
                html={q.explanation}
                className={cx(
                  'tex2jax_process max-w-full overflow-x-auto whitespace-pre-wrap break-words leading-relaxed text-ink dark:text-paper/90',
                  scale.body,
                  fontFor(q.explanation),
                )}
              />
            ) : (
              <p className="text-[13.5px] font-semibold text-mist dark:text-white/50">এই প্রশ্নের ব্যাখ্যা এখনো যোগ করা হয়নি।</p>
            )}
            {q.explanationImage && (
              <div className="mt-3 overflow-hidden rounded-2xl bg-white p-1.5 ring-1 ring-ink/8">
                <img
                  src={q.explanationImage}
                  alt="ব্যাখ্যার ছবি"
                  className="mx-auto max-h-64 rounded-xl object-contain"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
            )}
          </motion.div>
        )}
      </div>
    </article>
  );
};

export default memo(QuestionCard);
