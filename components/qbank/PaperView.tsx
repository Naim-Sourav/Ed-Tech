import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { QuizQuestion } from '../../types';
import { logger } from '../../utils/logger';
import { examDefaultsFor, parseExamRef, paperTitle, type Paper } from './catalog';
import { loadPaperQuestions } from './data';
import { paperSource } from './nav';
import PracticeView from './PracticeView';

/*
 * One institution paper (an examRef) solved in its original order.
 */

export interface PaperViewProps {
  examRef: string;
  /** Parsed paper when the catalogue knows it (gives nicer titles / exam defaults). */
  paper?: Paper | null;
  onBack: () => void;
}

const PaperView: React.FC<PaperViewProps> = ({ examRef, paper, onBack }) => {
  const parsed = useMemo(() => paper ?? parseExamRef(examRef), [paper, examRef]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    loadPaperQuestions(examRef)
      .then((list) => {
        if (cancelled) return;
        setQuestions(list);
        if (list.length === 0) setError(null);
      })
      .catch((e) => {
        logger.error('qbank: paper load failed', e);
        if (!cancelled) setError('ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করো।');
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [examRef, attempt]);

  const title = paperTitle(parsed);
  const source = useMemo(() => paperSource(examRef, title), [examRef, title]);
  const count = questions.length || parsed.count || 100;
  const exam = useMemo(() => {
    const defaults = examDefaultsFor(parsed, count);
    return { negative: defaults.negative, minutes: defaults.minutes, perQuestion: parsed.institution.minutesPerQuestion, keepOrder: true, examRef };
  }, [parsed, count, examRef]);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return (
    <PracticeView
      source={source}
      title={parsed.unitLabel ? `${parsed.unitLabel} · ${parsed.sessionLabel}` : parsed.sessionLabel}
      eyebrow={parsed.institution.name}
      examTitle={title}
      questions={questions}
      total={questions.length || parsed.count || null}
      loading={loading}
      error={error}
      onRetryLoad={retry}
      onBack={onBack}
      exam={exam}
      showSource={false}
      showChapter
      emptyTitle="এই প্রশ্নপত্রের প্রশ্ন এখনো যোগ হয়নি"
      emptyBody="শিগগিরই যোগ হবে — আপাতত অন্য সেশন দেখো।"
    />
  );
};

export default PaperView;
