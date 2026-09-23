import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GraduationCap, School } from 'lucide-react';
import type { QuizQuestion } from '../../types';
import { logger } from '../../utils/logger';
import { displaySubject } from '../exam/model';
import { ADMISSION_CATEGORIES, BOARDS, COLLEGES, type AdmissionCategory } from './catalog';
import { loadBankPage } from './data';
import { chapterSource, levelLabel, searchSource, type Level } from './nav';
import PracticeView from './PracticeView';
import { questionKey } from './records';
import { Pill, Scroller } from './ui';

/*
 * Questions pulled from the bank by subject/chapter or by search text,
 * 25 at a time, with the HSC board/college filters (এইচএসসি) or the
 * institution-kind filter (ভর্তি).
 */

const PAGE = 25;

export interface BankViewProps {
  level: Level | null;
  subject: string | null;
  chapter: string | null;
  search: string | null;
  /** Initial ভর্তি category (from the URL's admissionCategory). */
  category: AdmissionCategory | null;
  onBack: () => void;
}

type AcademicFilter = 'all' | 'board' | 'college';

const BankView: React.FC<BankViewProps> = ({ level, subject, chapter, search, category: initialCategory, onBack }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AcademicFilter>('all');
  const [board, setBoard] = useState<string | null>(null);
  const [college, setCollege] = useState<string | null>(null);
  const [category, setCategory] = useState<AdmissionCategory | null>(initialCategory);
  const requestId = useRef(0);

  const academic = level === 'ACADEMIC' && !search;
  const admission = level === 'ADMISSION' && !search;
  const boardParam = academic && filter === 'board' ? board || 'ANY' : null;
  const collegeParam = academic && filter === 'college' ? college || 'ANY' : null;
  const categoryParam = admission ? category : null;

  const fetchPage = useCallback(
    async (p: number, append: boolean) => {
      const id = ++requestId.current;
      if (append) setLoadingMore(true);
      else {
        setLoading(true);
        setError(null);
      }
      try {
        const res = await loadBankPage({
          level,
          subject,
          chapter,
          search,
          board: boardParam,
          college: collegeParam,
          admissionCategory: categoryParam,
          page: p,
          limit: PAGE,
        });
        if (id !== requestId.current) return;
        setQuestions((prev) => {
          if (!append) return res.questions;
          const seen = new Set(prev.map(questionKey));
          return [...prev, ...res.questions.filter((q) => !seen.has(questionKey(q)))];
        });
        setTotal(res.total || null);
        setHasMore(res.hasMore);
        setPage(p);
      } catch (e) {
        logger.error('qbank: bank page failed', e);
        if (id === requestId.current) setError('প্রশ্ন আনা যায়নি — ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করো।');
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [level, subject, chapter, search, boardParam, collegeParam, categoryParam],
  );

  useEffect(() => {
    setQuestions([]);
    void fetchPage(1, false);
  }, [fetchPage]);

  const source = useMemo(
    () => (search ? searchSource(search, level) : chapterSource(level ?? 'ADMISSION', subject || '', chapter)),
    [search, level, subject, chapter],
  );

  const exam = useMemo(
    () => ({ negative: level === 'ADMISSION' ? 0.25 : 0, perQuestion: 1, subject: subject || undefined, chapter: chapter || undefined }),
    [level, subject, chapter],
  );
  const title = search ? `“${search}”` : chapter || 'সব অধ্যায়';
  const eyebrow = search ? 'খোঁজার ফলাফল' : `${levelLabel(level)} · ${displaySubject(subject || '')}`;

  const toolbar = admission ? (
    <Scroller className="mt-3">
      <Pill active={!category} onClick={() => setCategory(null)}>
        সব ক্যাটাগরি
      </Pill>
      {ADMISSION_CATEGORIES.map((c) => (
        <Pill key={c.id} active={category === c.id} onClick={() => setCategory(category === c.id ? null : c.id)}>
          {c.name}
        </Pill>
      ))}
    </Scroller>
  ) : academic ? (
    <div className="mt-3 space-y-2.5">
      <Scroller>
        <Pill active={filter === 'all'} onClick={() => setFilter('all')}>
          সব প্রশ্ন
        </Pill>
        <Pill active={filter === 'board'} onClick={() => setFilter(filter === 'board' ? 'all' : 'board')}>
          <GraduationCap className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" /> বোর্ড
        </Pill>
        <Pill active={filter === 'college'} onClick={() => setFilter(filter === 'college' ? 'all' : 'college')}>
          <School className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" /> কলেজ
        </Pill>
      </Scroller>
      {filter === 'board' && (
        <Scroller>
          <Pill active={!board} onClick={() => setBoard(null)} className="h-8 text-[12px]">
            সব বোর্ড
          </Pill>
          {BOARDS.map((b) => (
            <Pill key={b.id} active={board === b.id} onClick={() => setBoard(board === b.id ? null : b.id)} className="h-8 text-[12px]">
              {b.name}
            </Pill>
          ))}
        </Scroller>
      )}
      {filter === 'college' && (
        <Scroller>
          <Pill active={!college} onClick={() => setCollege(null)} className="h-8 text-[12px]">
            সব কলেজ
          </Pill>
          {COLLEGES.map((c) => (
            <Pill key={c} active={college === c} onClick={() => setCollege(college === c ? null : c)} className="h-8 font-body text-[12px]">
              {c}
            </Pill>
          ))}
        </Scroller>
      )}
    </div>
  ) : null;

  return (
    <PracticeView
      source={source}
      title={title}
      eyebrow={eyebrow}
      examTitle={search ? `খোঁজ: ${title}` : `${displaySubject(subject || '')} · ${title}`}
      questions={questions}
      total={total}
      loading={loading}
      error={error}
      onRetryLoad={() => fetchPage(1, false)}
      hasMore={hasMore}
      loadingMore={loadingMore}
      onLoadMore={() => fetchPage(page + 1, true)}
      onBack={onBack}
      toolbar={toolbar}
      exam={exam}
      showSource
      showChapter={!chapter}
      emptyTitle={search ? 'কিছু পাওয়া যায়নি' : 'এই অধ্যায়ে এখনো প্রশ্ন নেই'}
      emptyBody={
        search ? 'অন্য কোনো শব্দ দিয়ে খুঁজে দেখো।' : filter !== 'all' || category ? 'ফিল্টার বদলে দেখো।' : 'শিগগিরই প্রশ্ন যোগ হবে — অন্য অধ্যায় দেখো।'
      }
    />
  );
};

export default BankView;
