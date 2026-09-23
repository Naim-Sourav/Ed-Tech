import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { logger } from '../utils/logger';
import { groupPapers, type Category, type Paper } from './qbank/catalog';
import { loadPapers, loadSyllabusStats, type SyllabusStats } from './qbank/data';
import { asLevel, hrefs } from './qbank/nav';
import { QbankProvider } from './qbank/store';
import Home from './qbank/Home';
import InstitutionView from './qbank/InstitutionView';
import PaperView from './qbank/PaperView';
import ChapterPicker from './qbank/ChapterPicker';
import BankView from './qbank/BankView';
import RecordsView from './qbank/RecordsView';

/*
 * /qbank — the question bank. The URL decides which screen is shown (see
 * qbank/nav.ts); this component loads the shared catalogue data and routes
 * between the screens. Progress records live in <QbankProvider>.
 */

const CATEGORY_IDS: Category[] = ['medical', 'varsity', 'engineering', 'krishi', 'others'];

const QuestionBankInner: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const view = searchParams.get('view');
  const institution = searchParams.get('institution');
  const unit = searchParams.get('unit');
  const examRef = searchParams.get('examRef');
  const level = asLevel(searchParams.get('level'));
  const hasLevel = !!searchParams.get('level');
  const subject = searchParams.get('subject');
  const chapter = searchParams.get('chapter');
  const scope = searchParams.get('scope');
  const q = searchParams.get('q');
  const legacyCategory = searchParams.get('admissionCategory');

  /* Catalogue: papers (examRefs) + per-level question counts. */
  const [papers, setPapers] = useState<Paper[] | null>(null);
  const [stats, setStats] = useState<Record<string, SyllabusStats>>({});

  useEffect(() => {
    let cancelled = false;
    loadPapers()
      .then((list) => !cancelled && setPapers(list))
      .catch((e) => {
        logger.error('qbank: papers failed', e);
        if (!cancelled) setPapers([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const needsStats = !examRef && !q && (subject ? !chapter && scope !== 'all' : !institution && view !== 'records');
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

  const groups = useMemo(() => (papers ? groupPapers(papers) : null), [papers]);
  const paperFor = useCallback((ref: string): Paper | null => papers?.find((p) => p.ref === ref) ?? null, [papers]);

  const goHome = useCallback(() => navigate(hrefs.home(hasLevel ? level : null)), [navigate, hasLevel, level]);

  /* ── screens ───────────────────────────────────────────────────────── */
  if (examRef) {
    const paper = paperFor(examRef);
    const back = () => navigate(paper ? hrefs.institution(paper.institution.id) : hrefs.home());
    return <PaperView examRef={examRef} paper={paper} onBack={back} />;
  }

  if (q) {
    return <BankView level={hasLevel ? level : null} subject={null} chapter={null} search={q} onBack={goHome} />;
  }

  if (subject) {
    if (chapter || scope === 'all') {
      return <BankView level={level} subject={subject} chapter={chapter} search={null} onBack={() => navigate(hrefs.subject(level, subject))} />;
    }
    return <ChapterPicker level={level} subject={subject} stats={stats[level] ?? null} onBack={goHome} />;
  }

  if (institution) {
    const group = groups?.find((g) => g.institution.id === institution) ?? null;
    return (
      <InstitutionView
        group={group}
        loading={papers === null}
        unit={unit}
        onUnit={(u) => {
          const next = new URLSearchParams(searchParams);
          if (u) next.set('unit', u);
          else next.delete('unit');
          setSearchParams(next, { replace: true });
        }}
        onBack={() => navigate(hrefs.home())}
      />
    );
  }

  if (view === 'records') {
    return <RecordsView onBack={goHome} />;
  }

  const initialCategory = legacyCategory && CATEGORY_IDS.includes(legacyCategory as Category) ? (legacyCategory as Category) : 'all';
  return <Home level={level} papers={papers} stats={stats[level] ?? null} initialCategory={initialCategory} />;
};

const QuestionBank: React.FC = () => (
  <QbankProvider>
    <div className="pk-landing dash relative min-h-full bg-paper text-ink dark:bg-ink dark:text-paper">
      <QuestionBankInner />
    </div>
  </QbankProvider>
);

export default QuestionBank;
