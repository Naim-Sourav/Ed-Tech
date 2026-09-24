import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useNavigationType, useSearchParams } from 'react-router-dom';
import { ArrowRight, Play, Plus, Trash2 } from 'lucide-react';
import { logger } from '../utils/logger';
import { useAuth } from '../contexts/AuthContext';
import { fetchSyllabusStatsAPI, fetchUserMistakesAPI, generateQuizFromDB } from '../services/api';
import type { QuizConfig, QuizQuestion } from '../types';
import { labelOf, TARGETS } from '../data/profileOptions';
import { useToast } from './Toast';
import BuilderShell from './quiz/BuilderShell';
import SubjectStep from './quiz/SubjectStep';
import ChapterStep from './quiz/ChapterStep';
import SettingsStep from './quiz/SettingsStep';
import LaunchScreen from './quiz/LaunchScreen';
import { findGroup, partitionSubjects, type SubjectGroup } from './quiz/catalog';
import { autoTitle, countChapters, removeChapter, selectedGroups, isPaperFullySelected, togglePaper, toConfigs, type Selection } from './quiz/selection';
import { countForSelection, type SyllabusStats } from './quiz/stats';
import { defaultSettingsFor, describeSettings, type ExamSettings } from './quiz/presets';
import {
  clearDraft,
  pickQuestions,
  readDraft,
  readLastSetup,
  rememberLastSetup,
  saveExamConfig,
  writeDraft,
  type ExamLaunchConfig,
  type LastSetup,
} from './quiz/launch';
import { bn } from './quiz/ui';

/*
 * Mock-test builder (route: /quiz).
 *
 *   বিষয় (subject) → অধ্যায় (chapters / topics) → সেটিংস → /exam/:id
 *
 * The step lives in the URL so refresh / back work:
 *   ?view=CHAPTER_DRILLDOWN&subject=Physics&paper=Physics%201st%20Paper
 *   ?step=TOPIC_CONFIG · ?step=LOADING · ?mode=RAPID_FIRE (flash cards)
 *
 * Entry points that must keep working:
 *   navigate('/quiz')                                   dashboard hero / quick link
 *   navigate('/quiz', { state: { subject: 'Physics' } }) opens that subject
 *   navigate('/quiz', { state: { mode: 'RAPID_FIRE' } })  flash cards
 *   navigate('/quiz', { state: { mode: 'WRONG_QUESTIONS' } })
 *   navigate('/quiz', { state: { modelTest: {...} } })    auto-start
 *   navigate('/quiz', { state: { fromSetup: true } })     first mock after profile setup
 */

type Phase = 'subject' | 'chapter' | 'settings' | 'loading';

interface LocationState {
  subject?: string;
  mode?: 'RAPID_FIRE' | 'WRONG_QUESTIONS';
  modelTest?: { subject: string; chapter: string; title: string; count: number; time: number };
  fromSetup?: boolean;
  /** Dashboard "আগেরবারের সেটআপে আবার" — jump straight to the settings step of the last setup. */
  resumeLast?: boolean;
}

interface LaunchRequest {
  configs: QuizConfig[];
  count: number;
  config: Omit<ExamLaunchConfig, 'questions' | 'shuffle'>;
  questions?: QuizQuestion[];
  remember?: boolean;
  title: string;
  detail?: string;
  onFail: () => void;
}

const FLASH_COUNT = 15;

const QuizArena: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();
  const [params, setParams] = useSearchParams();
  const { currentUser, extendedProfile } = useAuth();
  const { showToast } = useToast();

  const state = (location.state ?? null) as LocationState | null;

  /* ── URL-derived step ────────────────────────────────────────────── */
  const stepParam = params.get('step');
  const group = findGroup(params.get('subject'));
  const paperParam = params.get('paper') ?? '';
  const paper = group ? (group.papers.includes(paperParam) ? paperParam : group.papers[0]) : '';
  const flash = params.get('mode') === 'RAPID_FIRE' || state?.mode === 'RAPID_FIRE';
  const phase: Phase =
    stepParam === 'LOADING'
      ? 'loading'
      : stepParam === 'TOPIC_CONFIG'
        ? 'settings'
        : params.get('view') === 'CHAPTER_DRILLDOWN' && group
          ? 'chapter'
          : 'subject';

  /* ── Local state ─────────────────────────────────────────────────── */
  const [draft] = useState(() => readDraft());
  const [selection, setSelection] = useState<Selection>(draft.selection);
  const [settings, setSettings] = useState<ExamSettings>(() => draft.settings ?? defaultSettingsFor(extendedProfile));
  const [timeFollowsCount, setTimeFollowsCount] = useState(() => (draft.settings ? draft.settings.timeLimit === draft.settings.count : true));
  const [title, setTitle] = useState('');
  const [stats, setStats] = useState<SyllabusStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [lastSetup, setLastSetup] = useState<LastSetup | null>(() => readLastSetup());
  const [busy, setBusy] = useState<{ title: string; detail?: string } | null>(null);
  const [welcome, setWelcome] = useState(() => !!state?.fromSetup);

  const settingsTouched = useRef(!!draft.settings);
  const inFlight = useRef(false);
  const launched = useRef(false);
  const bootstrapped = useRef(false);
  /** History entries this screen has pushed — lets the in-app back button mirror the browser's. */
  const depth = useRef(0);

  useEffect(() => {
    if (navigationType === 'POP') depth.current = Math.max(0, depth.current - 1);
  }, [location.key, navigationType]);

  /* ── URL helpers ─────────────────────────────────────────────────── */
  const go = useCallback(
    (patch: Record<string, string | null>, opts?: { replace?: boolean }) => {
      const replace = opts?.replace ?? false;
      if (!replace) depth.current += 1;
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(patch).forEach(([k, v]) => (v === null ? next.delete(k) : next.set(k, v)));
          return next;
        },
        { replace },
      );
    },
    [setParams],
  );

  const openSubjects = useCallback((replace = true) => go({ step: null, view: null, subject: null, paper: null }, { replace }), [go]);
  const openChapters = useCallback(
    (g: SubjectGroup, p?: string, replace = false) => go({ step: null, view: 'CHAPTER_DRILLDOWN', subject: g.name, paper: p ?? g.papers[0] }, { replace }),
    [go],
  );
  /** Settings step; when no subject is in the URL, borrow the first selected one so "back" has somewhere to go. */
  const openSettings = useCallback(
    (replace = false, sel: Selection = selection) => {
      const patch: Record<string, string | null> = { step: 'TOPIC_CONFIG' };
      if (!group) {
        const first = selectedGroups(sel)[0];
        if (first) Object.assign(patch, { view: 'CHAPTER_DRILLDOWN', subject: first.name, paper: first.papers[0] });
      }
      go(patch, { replace });
    },
    [go, group, selection],
  );

  /** In-app back: pop real history when we pushed it (so browser back and this button agree), else `fallback`. */
  const goBack = useCallback(
    (fallback: () => void) => {
      if (depth.current > 0) navigate(-1);
      else fallback();
    },
    [navigate],
  );

  /** Leaves the builder: back to wherever the student came from, else the dashboard. */
  const exitBuilder = useCallback(() => {
    if (location.key !== 'default') navigate(-1);
    else navigate('/dashboard');
  }, [location.key, navigate]);

  /* ── Data ────────────────────────────────────────────────────────── */
  useEffect(() => {
    let alive = true;
    fetchSyllabusStatsAPI()
      .then((s) => {
        if (alive) setStats(s && typeof s === 'object' ? (s as SyllabusStats) : null);
      })
      .catch((err) => logger.error('Failed to load syllabus stats', err))
      .finally(() => {
        if (alive) setStatsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Profile arrives after mount for most users: adopt its defaults until the student touches anything.
  useEffect(() => {
    if (!settingsTouched.current && extendedProfile) {
      setSettings((prev) => ({ ...defaultSettingsFor(extendedProfile), view: prev.view }));
    }
  }, [extendedProfile]);

  useEffect(() => {
    writeDraft(selection, settings);
  }, [selection, settings]);

  /* ── Launching ───────────────────────────────────────────────────── */
  const launch = useCallback(
    async (req: LaunchRequest) => {
      if (inFlight.current) return;
      inFlight.current = true;
      setBusy({ title: req.title, detail: req.detail });
      go({ step: 'LOADING' }, { replace: true });
      try {
        const pool =
          req.questions ??
          (
            await Promise.all(
              req.configs.map((cfg) => generateQuizFromDB({ subject: cfg.subject, chapter: cfg.chapter, topics: cfg.topics, count: req.count })),
            )
          ).flat();
        const questions = pickQuestions((pool ?? []).filter(Boolean) as QuizQuestion[], req.count);
        if (questions.length === 0) {
          showToast('ডাটাবেজে এই অধ্যায়/টপিকের উপর এখনো পর্যাপ্ত প্রশ্ন নেই। অন্য অধ্যায় যোগ করে দেখো।', 'warning');
          req.onFail();
          return;
        }
        if (req.remember) {
          rememberLastSetup({ selection, settings, title: req.config.title });
          clearDraft();
        }
        const examId = saveExamConfig({ ...req.config, questions, shuffle: true });
        launched.current = true;
        navigate(`/exam/${examId}`);
      } catch (err) {
        logger.error('Quiz launch failed', err);
        showToast('দুঃখিত, প্রশ্ন লোড করা যায়নি। একটু পরে আবার চেষ্টা করো।', 'error');
        req.onFail();
      } finally {
        inFlight.current = false;
        if (!launched.current) setBusy(null);
      }
    },
    [go, navigate, selection, settings, showToast],
  );

  const startCustom = useCallback(() => {
    const configs = toConfigs(selection);
    if (configs.length === 0) {
      showToast('আগে অন্তত একটা অধ্যায় বাছাই করো', 'warning');
      openSubjects();
      return;
    }
    const examTitle = title.trim() || autoTitle(selection);
    void launch({
      configs,
      count: settings.count,
      config: {
        timeLimit: settings.timeLimit,
        negativeMarking: settings.negativeMarking,
        mode: settings.view,
        title: examTitle,
        isPracticeMode: settings.practice,
      },
      remember: true,
      title: 'প্রশ্নপত্র তৈরি হচ্ছে…',
      detail: `${bn(configs.length)}টি অধ্যায় থেকে ${bn(settings.count)}টি প্রশ্ন বাছাই করছি`,
      onFail: () => openSettings(true),
    });
  }, [launch, openSettings, openSubjects, selection, settings, showToast, title]);

  const startFlash = useCallback(
    (p: string, chapter: string) => {
      void launch({
        configs: [{ subject: p, chapter, topics: [] }],
        count: FLASH_COUNT,
        config: { title: `ফ্ল্যাশ কার্ড: ${chapter}`, mode: 'RAPID_FIRE', timeLimit: 0, negativeMarking: 0, isPracticeMode: true },
        title: 'ফ্ল্যাশ কার্ড সাজানো হচ্ছে…',
        detail: chapter,
        onFail: () => go({ step: null }, { replace: true }),
      });
    },
    [go, launch],
  );

  const startWrongQuestions = useCallback(async () => {
    if (!currentUser) {
      showToast('ভুল প্রশ্ন প্র্যাকটিস করতে আগে লগইন করো', 'error');
      openSubjects();
      return;
    }
    inFlight.current = true;
    setBusy({ title: 'তোমার ভুল প্রশ্নগুলো আনছি…' });
    go({ step: 'LOADING' }, { replace: true });
    let questions: QuizQuestion[] = [];
    try {
      const mistakes = (await fetchUserMistakesAPI(currentUser.uid)) as unknown;
      questions = (Array.isArray(mistakes) ? mistakes : [])
        .map((m) => {
          const rec = m as { questionId?: unknown; question?: unknown };
          return (
            rec.questionId && typeof rec.questionId === 'object' ? rec.questionId : typeof rec.question === 'object' && rec.question ? rec.question : m
          ) as QuizQuestion;
        })
        .filter((q) => q && typeof q === 'object' && 'question' in q);
    } catch (err) {
      logger.error('Failed to load mistakes', err);
      showToast('ভুল প্রশ্ন লোড করা যায়নি', 'error');
      inFlight.current = false;
      setBusy(null);
      openSubjects();
      return;
    }
    inFlight.current = false;
    if (questions.length === 0) {
      setBusy(null);
      showToast('তোমার কোনো ভুল প্রশ্নের রেকর্ড নেই — আগে একটা মক দাও!', 'info');
      openSubjects();
      return;
    }
    void launch({
      configs: [],
      count: questions.length,
      questions,
      config: { title: 'ভুল প্রশ্ন প্র্যাকটিস', mode: 'ALL_AT_ONCE', timeLimit: 0, negativeMarking: 0, isPracticeMode: true },
      title: 'ভুল প্রশ্ন প্র্যাকটিস সাজাচ্ছি…',
      detail: `${bn(questions.length)}টি প্রশ্ন`,
      onFail: () => openSubjects(),
    });
  }, [currentUser, go, launch, openSubjects, showToast]);

  /* ── One-time entry handling (location.state) ────────────────────── */
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    if (state?.mode === 'WRONG_QUESTIONS') {
      void startWrongQuestions();
      return;
    }
    if (state?.resumeLast) {
      const last = readLastSetup();
      if (last) {
        settingsTouched.current = true;
        setSelection(last.selection);
        setSettings(last.settings);
        setTimeFollowsCount(last.settings.timeLimit === last.settings.count);
        setTitle('');
        openSettings(false, last.selection);
        return;
      }
    }
    if (state?.modelTest) {
      const { subject, chapter, title: mtTitle, count, time } = state.modelTest;
      void launch({
        configs: [{ subject, chapter, topics: [] }],
        count: count || 20,
        config: { title: mtTitle || chapter, mode: 'ALL_AT_ONCE', timeLimit: time ?? 0, negativeMarking: 0.25, isPracticeMode: false },
        title: 'মডেল টেস্ট তৈরি হচ্ছে…',
        detail: mtTitle || chapter,
        onFail: () => openSubjects(),
      });
      return;
    }

    // Mirror one-shot navigation state into the URL so it survives later param changes / refresh.
    const patch: Record<string, string | null> = {};
    if (state?.mode === 'RAPID_FIRE' && params.get('mode') !== 'RAPID_FIRE') patch.mode = 'RAPID_FIRE';
    const g = state?.subject && phase === 'subject' ? findGroup(state.subject) : undefined;
    if (g) Object.assign(patch, { step: null, view: 'CHAPTER_DRILLDOWN', subject: g.name, paper: g.papers[0] });
    if (Object.keys(patch).length > 0) go(patch, { replace: true });
  }, []); // intentionally runs once on mount

  /* ── Guards: a refreshed tab may land on a step it cannot render ── */
  useEffect(() => {
    if (launched.current) return; // hand-off to /exam in progress
    if (phase === 'loading' && !inFlight.current) openSubjects();
    else if (phase === 'settings' && countChapters(selection) === 0) openSubjects();
  }, [phase, selection, openSubjects]);

  /* ── Derived ─────────────────────────────────────────────────────── */
  const { featured, rest } = useMemo(() => partitionSubjects(extendedProfile), [extendedProfile]);
  const featuredLabel = useMemo(() => {
    if (extendedProfile?.target) return `${labelOf(TARGETS, extendedProfile.target)} টার্গেট`;
    if (extendedProfile?.department === 'Science') return 'বিজ্ঞান বিভাগ';
    if (extendedProfile?.department) return extendedProfile.department === 'Humanities' ? 'মানবিক বিভাগ' : 'ব্যবসায় শিক্ষা';
    return undefined;
  }, [extendedProfile]);

  const nChapters = countChapters(selection);
  const available = useMemo(() => countForSelection(stats, selection), [stats, selection]);
  const groupsPicked = selectedGroups(selection);

  const updateSettings = (next: ExamSettings) => {
    settingsTouched.current = true;
    setSettings(next);
  };

  const resumeLast = () => {
    if (!lastSetup) return;
    settingsTouched.current = true;
    setSelection(lastSetup.selection);
    setSettings(lastSetup.settings);
    setTimeFollowsCount(lastSetup.settings.timeLimit === lastSetup.settings.count);
    setTitle('');
    openSettings(false, lastSetup.selection);
  };

  const clearAll = () => {
    setSelection({});
    setTitle('');
    clearDraft();
    setLastSetup(readLastSetup());
  };

  /* ── Render ──────────────────────────────────────────────────────── */
  if (phase === 'loading') {
    return <LaunchScreen title={busy?.title ?? 'প্রশ্নপত্র তৈরি হচ্ছে…'} detail={busy?.detail} />;
  }

  const selectionSummary = (
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-mist">বাছাই</p>
      {nChapters > 0 ? (
        <p className="truncate font-bangla text-[15px] font-bold text-ink">
          {bn(nChapters)}টি অধ্যায়
          <span className="font-body font-semibold text-mist"> · {groupsPicked.map((g) => g.display).join(', ')}</span>
          {available > 0 && <span className="font-body font-semibold text-mist"> · ~{bn(available)} প্রশ্ন</span>}
        </p>
      ) : (
        <p className="truncate text-[14px] font-semibold text-mist">অন্তত একটা অধ্যায় বাছাই করো</p>
      )}
    </div>
  );

  const nextButton = (
    <button
      type="button"
      onClick={() => openSettings()}
      disabled={nChapters === 0}
      className="focus-ring group inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-[14.5px] font-bold text-white shadow-[0_16px_36px_-14px_rgba(255,82,0,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-brand"
    >
      সেটিংস
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.5} />
    </button>
  );

  if (phase === 'subject') {
    return (
      <BuilderShell
        contentKey="subject"
        step={0}
        canJumpTo={(i) => (i === 1 ? false : i === 2 ? nChapters > 0 : false)}
        onJump={(i) => i === 2 && openSettings()}
        eyebrow={flash ? 'ফ্ল্যাশ কার্ড' : 'মক টেস্ট · ধাপ ১'}
        title={flash ? 'কোন বিষয়ের ফ্ল্যাশ কার্ড?' : 'কোন বিষয়ে মক দেবে?'}
        subtitle={
          flash
            ? 'বিষয় বেছে নাও, তারপর যে অধ্যায়ে ট্যাপ করবে সেটার ১৫টি কার্ড সাথে সাথে শুরু হবে।'
            : 'একটা বিষয় দিয়ে শুরু করো — পরে চাইলে আরও বিষয় যোগ করে মিশ্র মকও বানাতে পারবে।'
        }
        onBack={exitBuilder}
        backLabel="ফিরে যাও"
        hideRail={flash}
        footer={
          !flash && nChapters > 0 ? (
            <div className="flex items-center gap-3">
              {selectionSummary}
              <button
                type="button"
                onClick={clearAll}
                aria-label="সব বাছাই মুছে ফেলো"
                title="সব বাছাই মুছে ফেলো"
                className="focus-ring grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink/5 text-mist transition-colors hover:bg-rose-50 hover:text-flag"
              >
                <Trash2 className="h-4.5 w-4.5" />
              </button>
              {nextButton}
            </div>
          ) : undefined
        }
      >
        <SubjectStep
          featured={featured}
          rest={rest}
          featuredLabel={featuredLabel}
          stats={stats}
          statsLoading={statsLoading}
          selection={selection}
          flash={flash}
          welcome={welcome}
          lastSetup={lastSetup}
          onResume={resumeLast}
          onPick={(g) => {
            setWelcome(false);
            openChapters(g);
          }}
        />
      </BuilderShell>
    );
  }

  if (phase === 'chapter' && group) {
    const paperFull = isPaperFullySelected(selection, paper);
    return (
      <BuilderShell
        contentKey={`chapter-${group.name}`}
        step={1}
        canJumpTo={(i) => i === 0 || (i === 2 && nChapters > 0)}
        onJump={(i) => (i === 0 ? openSubjects(false) : openSettings())}
        eyebrow={flash ? 'ফ্ল্যাশ কার্ড · অধ্যায় বেছে নাও' : 'মক টেস্ট · ধাপ ২'}
        title={group.display}
        subtitle={
          flash
            ? 'যে অধ্যায়ে ট্যাপ করবে, সেখান থেকে ১৫টি প্রশ্নের ফ্ল্যাশ কার্ড শুরু হবে — প্রতিটি উত্তরের সাথে সাথে ব্যাখ্যা পাবে।'
            : 'যে অধ্যায়গুলো থেকে প্রশ্ন চাও সেগুলোতে টিক দাও। চাইলে “টপিক” খুলে নির্দিষ্ট টপিকও বাছতে পারো।'
        }
        onBack={() => goBack(() => openSubjects())}
        backLabel="বিষয় তালিকায় ফিরে যাও"
        hideRail={flash}
        headerAction={
          !flash ? (
            <button
              type="button"
              onClick={() => setSelection(togglePaper(selection, paper))}
              className={`focus-ring hidden shrink-0 rounded-full px-3.5 py-2 text-[12.5px] font-bold transition-colors sm:inline-flex ${
                paperFull ? 'bg-ink text-white hover:bg-ink/80' : 'bg-mint text-brand-deep hover:bg-brand hover:text-white'
              }`}
            >
              {paperFull ? 'সব বাদ দাও' : group.papers.length > 1 ? 'পুরো পত্র বাছাই' : 'সব অধ্যায় বাছাই'}
            </button>
          ) : undefined
        }
        footer={
          !flash ? (
            <div className="flex items-center gap-2.5 sm:gap-3">
              {selectionSummary}
              <button
                type="button"
                onClick={() => setSelection(togglePaper(selection, paper))}
                className="focus-ring inline-flex h-11 shrink-0 items-center gap-1 rounded-full bg-ink/5 px-3.5 text-[12.5px] font-bold text-ink/70 transition-colors hover:bg-ink/10 sm:hidden"
              >
                {paperFull ? 'সব বাদ' : group.papers.length > 1 ? 'পুরো পত্র' : 'সব অধ্যায়'}
              </button>
              <button
                type="button"
                onClick={() => openSubjects(false)}
                className="focus-ring hidden h-11 shrink-0 items-center gap-1 rounded-full bg-ink/5 px-4 text-[13px] font-bold text-ink/70 transition-colors hover:bg-ink/10 sm:inline-flex"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} /> আরও বিষয়
              </button>
              {nextButton}
            </div>
          ) : undefined
        }
      >
        <ChapterStep
          key={group.name}
          group={group}
          paper={paper}
          onPaperChange={(p) => go({ paper: p }, { replace: true })}
          selection={selection}
          onSelectionChange={setSelection}
          stats={stats}
          flash={flash}
          onStartFlash={startFlash}
        />
      </BuilderShell>
    );
  }

  if (phase === 'settings') {
    return (
      <BuilderShell
        contentKey="settings"
        step={2}
        canJumpTo={(i) => i === 0 || (i === 1 && !!group)}
        onJump={(i) => (i === 0 ? openSubjects(false) : group && openChapters(group, paper))}
        eyebrow="মক টেস্ট · ধাপ ৩"
        title="পরীক্ষার সেটিংস"
        subtitle="প্রশ্ন, সময় আর নেগেটিভ মার্কিং ঠিক করো — না বুঝলে একটা প্রিসেট ট্যাপ করলেই চলবে।"
        onBack={() => goBack(() => (group ? go({ step: null }, { replace: true }) : openSubjects()))}
        backLabel="অধ্যায় বাছাইয়ে ফিরে যাও"
        footer={
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-mist">{title.trim() || autoTitle(selection)}</p>
              <p className="truncate font-bangla text-[15px] font-bold text-ink">{describeSettings(settings)}</p>
            </div>
            <button
              type="button"
              onClick={startCustom}
              className="focus-ring group inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 text-[15px] font-bold text-white shadow-[0_16px_36px_-14px_rgba(255,82,0,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-deep"
            >
              মক শুরু করো
              <Play className="h-4 w-4" fill="currentColor" strokeWidth={0} />
            </button>
          </div>
        }
      >
        <SettingsStep
          settings={settings}
          onSettingsChange={updateSettings}
          timeFollowsCount={timeFollowsCount}
          onTimeFollowsCountChange={setTimeFollowsCount}
          selection={selection}
          onRemoveChapter={(p, c) => setSelection(removeChapter(selection, p, c))}
          onEditSubject={(g) => openChapters(g)}
          onAddSubject={() => openSubjects(false)}
          available={available}
          title={title}
          onTitleChange={setTitle}
        />
      </BuilderShell>
    );
  }

  return null;
};

export default QuizArena;
