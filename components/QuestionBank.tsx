import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { logger } from '../utils/logger';
import { isAdmissionCategory } from './qbank/catalog';
import { loadSyllabusStats, type SyllabusStats } from './qbank/data';
import { asLevel, hrefs } from './qbank/nav';
import { QbankProvider } from './qbank/store';
import Home from './qbank/Home';
import ChapterPicker from './qbank/ChapterPicker';
import BankView from './qbank/BankView';
import RecordsView from './qbank/RecordsView';

/*
 * /qbank — the question bank, browsed by level → subject → chapter. The URL
 * decides which screen is shown (see qbank/nav.ts); this component loads the
 * per-level question counts and routes between the screens. Progress records
 * live in <QbankProvider>.
 */

const QuestionBankInner: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const view = searchParams.get('view');
  const level = asLevel(searchParams.get('level'));
  const hasLevel = !!searchParams.get('level');
  const subject = searchParams.get('subject');
  const chapter = searchParams.get('chapter');
  const scope = searchParams.get('scope');
  const q = searchParams.get('q');
  const categoryParam = searchParams.get('admissionCategory');
  const category = isAdmissionCategory(categoryParam) ? categoryParam : null;

  /* Question counts per paper/chapter, per level (drives the subject tiles and chapter list). */
  const [stats, setStats] = useState<Record<string, SyllabusStats>>({});
  const needsStats = !q && (subject ? !chapter && scope !== 'all' : view !== 'records');
  useEffect(() => {
    if (!needsStats || stats[level]) return;
    let cancelled = false;
    loadSyllabusStats(level)
      .then((s) => !cancelled && setStats((prev) => ({ ...prev, [level]: s })))
      .catch((e) => logger.info('qbank: stats unavailable', e));
    return () => {
      cancelled = true;
    };
  }, [needsStats, level, stats]);

  const goHome = useCallback(() => navigate(hrefs.home(hasLevel ? level : null)), [navigate, hasLevel, level]);

  /* ── screens ───────────────────────────────────────────────────────── */
  if (q) {
    return <BankView level={hasLevel ? level : null} subject={null} chapter={null} search={q} category={null} onBack={goHome} />;
  }

  if (subject) {
    if (chapter || scope === 'all') {
      return (
        <BankView level={level} subject={subject} chapter={chapter} search={null} category={category} onBack={() => navigate(hrefs.subject(level, subject))} />
      );
    }
    return <ChapterPicker level={level} subject={subject} stats={stats[level] ?? null} onBack={goHome} />;
  }

  if (view === 'records') {
    return <RecordsView onBack={goHome} />;
  }

  return <Home level={level} stats={stats[level] ?? null} />;
};

const QuestionBank: React.FC = () => (
  <QbankProvider>
    <div className="pk-landing dash relative min-h-full bg-paper text-ink dark:bg-ink dark:text-paper">
      <QuestionBankInner />
    </div>
  </QbankProvider>
);

export default QuestionBank;
