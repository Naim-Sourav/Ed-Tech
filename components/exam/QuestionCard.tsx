import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Bookmark, Check, Flag, Lightbulb, X } from 'lucide-react';
import type { QuizQuestion } from '../../types';
import SafeHtml from '../SafeHtml';
import { Chip } from './ui';
import { bn, displaySubject, isAnswered, optionLabel, type Answer } from './model';

export type FontSizeStep = 'text-sm' | 'text-base' | 'text-lg' | 'text-xl';

const TYPE_SCALE: Record<FontSizeStep, { question: string; body: string }> = {
  'text-sm': { question: 'text-[17px] md:text-[19px]', body: 'text-[14px] md:text-[15px]' },
  'text-base': { question: 'text-[19px] md:text-[22px]', body: 'text-[15px] md:text-[16px]' },
  'text-lg': { question: 'text-[21px] md:text-[24px]', body: 'text-[16px] md:text-[17.5px]' },
  'text-xl': { question: 'text-[23px] md:text-[27px]', body: 'text-[17px] md:text-[19px]' },
};

type OptionState = 'idle' | 'selected' | 'correct' | 'wrong' | 'dim';

const OPTION_STYLES: Record<OptionState, { row: string; bubble: string }> = {
  idle: {
    row: 'border-ink/10 bg-white hover:border-brand/50 hover:bg-mint/60',
    bubble: 'border-ink/15 bg-paper/60 text-ink/70 group-hover:border-brand/50 group-hover:text-brand-deep',
  },
  selected: {
    row: 'border-brand bg-mint shadow-[0_14px_30px_-20px_rgba(255,82,0,0.7)]',
    bubble: 'border-brand bg-brand text-white',
  },
  correct: {
    row: 'border-emerald-500/60 bg-emerald-500/10',
    bubble: 'border-emerald-600 bg-emerald-600 text-white',
  },
  wrong: {
    row: 'border-flag/60 bg-flag/10',
    bubble: 'border-flag bg-flag text-white',
  },
  dim: {
    row: 'border-ink/8 bg-white opacity-60',
    bubble: 'border-ink/10 bg-paper/60 text-ink/60',
  },
};

export interface QuestionCardProps {
  q: QuizQuestion;
  index: number;
  total: number;
  answer: Answer;
  /** `single`: focused card (one per screen), `list`: all-at-once list, `review`: result review. */
  variant: 'single' | 'list' | 'review';
  /** Show right/wrong colouring (practice after answering, rapid fire after the correct pick, review). */
  reveal: boolean;
  /** Rapid fire: the option that was just tried and was wrong. */
  rapidWrong?: number | null;
  disabled?: boolean;
  onSelect?: (optionIndex: number) => void;
  saved: boolean;
  onToggleSave?: () => void;
  flagged?: boolean;
  onToggleFlag?: () => void;
  fontFor: (text?: string) => string;
  fontSize: FontSizeStep;
  /** 1-based range when this card should show its stimulus block. */
  stimulus?: { start: number; end: number } | null;
  showExplanation?: boolean;
  id?: string;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  q,
  index,
  total,
  answer,
  variant,
  reveal,
  rapidWrong = null,
  disabled = false,
  onSelect,
  saved,
  onToggleSave,
  flagged = false,
  onToggleFlag,
  fontFor,
  fontSize,
  stimulus,
  showExplanation = false,
  id,
}) => {
  const scale = TYPE_SCALE[fontSize] ?? TYPE_SCALE['text-base'];
  const answered = isAnswered(answer);
  const isReview = variant === 'review';

  const stateFor = (optionIndex: number): OptionState => {
    const isKey = optionIndex === q.correctAnswerIndex;
    const isMine = answer === optionIndex;
    if (reveal) {
      if (isKey) return 'correct';
      if (isMine) return 'wrong';
      return answered || isReview ? 'dim' : 'idle';
    }
    if (rapidWrong === optionIndex) return 'wrong';
    if (isMine) return 'selected';
    return 'idle';
  };

  const showStimulus = !!stimulus && (!!q.contextText || !!q.contextImage);
  const chapter = (q.chapter || '').trim();
  const subject = q.subject ? displaySubject(q.subject) : '';

  return (
    <article
      id={id}
      className={`scroll-mt-28 overflow-hidden rounded-[26px] bg-white ring-1 shadow-[0_18px_44px_-30px_rgba(22,18,16,0.35)] ${
        isReview && reveal ? (answered ? (answer === q.correctAnswerIndex ? 'ring-emerald-500/30' : 'ring-flag/30') : 'ring-ink/8') : 'ring-ink/8'
      }`}
      aria-label={`প্রশ্ন ${bn(index + 1)}`}
    >
      {showStimulus && (
        <div className="border-b border-ink/8 bg-ink/[0.03] px-5 py-4 sm:px-6">
          <Chip tone="gold" className="mb-2.5">
            {stimulus!.start === stimulus!.end
              ? `${bn(stimulus!.start)} নং প্রশ্নের উদ্দীপক`
              : `${bn(stimulus!.start)}–${bn(stimulus!.end)} নং প্রশ্নের উদ্দীপক`}
          </Chip>
          {q.contextText && (
            <SafeHtml
              html={q.contextText}
              className={`tex2jax_process whitespace-pre-wrap font-semibold leading-relaxed text-ink ${scale.body} ${fontFor(q.contextText)}`}
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

      <div className={variant === 'single' ? 'p-5 sm:p-7' : 'p-5 sm:p-6'}>
        {/* Meta row */}
        <div className="mb-3.5 flex items-center gap-2">
          <span className="font-body text-[13px] font-extrabold tabular-nums text-brand-deep">
            প্রশ্ন {bn(index + 1)}
            <span className="text-ink/35"> / {bn(total)}</span>
          </span>
          {chapter && <Chip className="hidden sm:inline-flex">{chapter}</Chip>}
          {!chapter && subject && <Chip className="hidden sm:inline-flex">{subject}</Chip>}
          <span className="flex-1" />
          {onToggleFlag && !isReview && (
            <button
              type="button"
              onClick={onToggleFlag}
              aria-pressed={flagged}
              aria-label={flagged ? 'ফ্ল্যাগ তুলে নাও' : 'পরে দেখব বলে ফ্ল্যাগ করো'}
              title="পরে দেখব (F)"
              className={`focus-ring grid h-9 w-9 place-items-center rounded-full transition-colors ${flagged ? 'bg-lime text-ink-950' : 'text-ink/60 hover:bg-ink/5 hover:text-ink'}`}
            >
              <Flag className="h-[17px] w-[17px]" strokeWidth={2.3} fill={flagged ? 'currentColor' : 'none'} />
            </button>
          )}
          {onToggleSave && (
            <button
              type="button"
              onClick={onToggleSave}
              aria-pressed={saved}
              aria-label={saved ? 'বুকমার্ক সরাও' : 'প্রশ্নটি বুকমার্ক করো'}
              title="বুকমার্ক"
              className={`focus-ring grid h-9 w-9 place-items-center rounded-full transition-colors ${saved ? 'bg-brand/10 text-brand' : 'text-ink/60 hover:bg-ink/5 hover:text-ink'}`}
            >
              <Bookmark className="h-[17px] w-[17px]" strokeWidth={2.3} fill={saved ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>

        {/* Question */}
        <h2 className={`tex2jax_process whitespace-pre-wrap font-bold leading-[1.55] text-ink ${scale.question} ${fontFor(q.question)}`}>
          <SafeHtml html={q.question} as="span" />
        </h2>
        {q.questionImage && (
          <div className="mt-4 overflow-hidden rounded-2xl bg-paper/60 p-2 ring-1 ring-ink/8">
            <img
              src={q.questionImage}
              alt="প্রশ্নের ছবি"
              className="mx-auto h-auto max-h-[300px] max-w-full rounded-xl object-contain"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          </div>
        )}
        {(chapter || subject) && (
          <div className="mt-3 flex flex-wrap gap-1.5 sm:hidden">
            {chapter && <Chip>{chapter}</Chip>}
            {!chapter && subject && <Chip>{subject}</Chip>}
          </div>
        )}

        {/* Options */}
        <div className="mt-5 space-y-2.5" role={isReview ? undefined : 'group'} aria-label="উত্তরের অপশন">
          {q.options.map((opt, oIdx) => {
            const state = stateFor(oIdx);
            const style = OPTION_STYLES[state];
            const image = q.optionsImages?.[oIdx];
            const interactive = !isReview && !!onSelect;
            const Tag: 'button' | 'div' = interactive ? 'button' : 'div';
            const isKey = oIdx === q.correctAnswerIndex;
            const isMine = answer === oIdx;
            return (
              <motion.div key={oIdx} whileTap={interactive && !disabled ? { scale: 0.99 } : undefined}>
                <Tag
                  type={interactive ? 'button' : undefined}
                  onClick={interactive ? () => onSelect?.(oIdx) : undefined}
                  disabled={interactive ? disabled : undefined}
                  aria-pressed={interactive ? isMine : undefined}
                  className={`group flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3 text-left transition-all duration-200 ${style.row} ${
                    interactive ? 'focus-ring disabled:cursor-not-allowed' : ''
                  }`}
                >
                  <span
                    className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border font-body text-[13px] font-extrabold transition-colors ${style.bubble}`}
                    aria-hidden="true"
                  >
                    {optionLabel(oIdx)}
                  </span>
                  <span className="min-w-0 flex-1 pt-1">
                    {opt && (
                      <SafeHtml
                        html={opt}
                        as="span"
                        className={`tex2jax_process block whitespace-pre-wrap leading-relaxed text-ink ${scale.body} ${fontFor(opt)}`}
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
                    {reveal && isReview && (isKey || isMine) && (
                      <span className="mt-1.5 flex flex-wrap gap-1.5">
                        {isKey && <Chip tone="emerald">সঠিক উত্তর</Chip>}
                        {isMine && !isKey && <Chip tone="flag">তোমার উত্তর</Chip>}
                        {isMine && isKey && <Chip tone="emerald">তুমি ঠিক দিয়েছ</Chip>}
                      </span>
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
                  {state === 'selected' && (
                    <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-white" aria-label="নির্বাচিত">
                      <Check className="h-3.5 w-3.5" strokeWidth={4} />
                    </span>
                  )}
                </Tag>
              </motion.div>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <motion.div
            id={`explanation-${index}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-5 rounded-2xl bg-amber-50/80 p-4 ring-1 ring-amber-200/70 sm:p-5"
          >
            <div className="mb-2 flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-wider text-brand-deep">
              <Lightbulb className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" /> ব্যাখ্যা
            </div>
            {q.explanation ? (
              <SafeHtml
                html={q.explanation}
                className={`tex2jax_process max-w-full overflow-x-auto whitespace-pre-wrap break-words leading-relaxed text-ink ${scale.body} ${fontFor(q.explanation)}`}
              />
            ) : (
              <p className="text-[14px] text-mist">এই প্রশ্নের ব্যাখ্যা এখনো যোগ করা হয়নি।</p>
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
