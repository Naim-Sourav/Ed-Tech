import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { logger } from '../utils/logger';
import { useAuth } from '../contexts/AuthContext';
import { useCache } from '../contexts/CacheContext';
import { fetchLeaderboardAPI, fetchUserStatsAPI } from '../services/api';
import type { LeaderboardUser } from '../types';
import {
  accuracyOf,
  boardRows,
  dhakaParts,
  formatBnDate,
  greetingFor,
  heroMessage,
  questPreview,
  questsDone,
  rankOf,
  readActiveSessions,
  readSetupPreview,
  subjectRows,
  todayKey,
  weakestSubject,
  weekRhythm,
  type DashboardStats,
  type SubjectRow,
} from './dashboard/model';
import {
  BetaNotice,
  DashboardSkeleton,
  HeroCard,
  LeaderboardCard,
  QuestsCard,
  QuickAccess,
  ResumeStrip,
  StreakCard,
  SubjectsCard,
  TopBar,
  heroStats,
  type QuickLink,
} from './dashboard/sections';
import StreakCalendar from './dashboard/StreakCalendar';

/*
 * Home dashboard — the first screen after sign-in. Data comes from the stats
 * and leaderboard endpoints (cached per session); everything derived lives in
 * ./dashboard/model.ts so it can be unit-tested.
 */

const NOTICE_KEY = 'hide_dev_notice';

const HomeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userAvatar } = useAuth();
  const { getCache, setCache } = useCache();

  const uid = currentUser?.uid ?? '';
  const cacheKey = `dashboard_${uid}`;
  const cached = (getCache(cacheKey) || {}) as { stats?: DashboardStats; leaderboard?: LeaderboardUser[] };

  const [stats, setStats] = useState<DashboardStats | null>(cached.stats ?? null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>(cached.leaderboard ?? []);
  const [isLoading, setIsLoading] = useState(!cached.stats);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showNotice, setShowNotice] = useState(() => {
    try {
      return localStorage.getItem(NOTICE_KEY) !== 'true';
    } catch {
      return true;
    }
  });
  const [now, setNow] = useState(() => new Date());

  /* ── data ────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    (async () => {
      try {
        const [statsData, board] = await Promise.all([fetchUserStatsAPI(uid).catch(() => null), fetchLeaderboardAPI().catch(() => [])]);
        if (cancelled) return;
        const nextStats = (statsData as DashboardStats | null) ?? null;
        const nextBoard = Array.isArray(board) ? (board as LeaderboardUser[]) : [];
        if (nextStats) setStats(nextStats);
        setLeaderboard(nextBoard);
        setCache(cacheKey, { stats: nextStats ?? cached.stats ?? null, leaderboard: nextBoard });
      } catch (e) {
        logger.error('Dashboard data load error', e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uid]); // refetch only when the signed-in user changes

  // Keep the greeting / "today" markers honest when the tab stays open past midnight.
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  /* ── derived ─────────────────────────────────────────────────────── */
  const activityLog = useMemo(() => (Array.isArray(stats?.activityLog) ? stats!.activityLog! : []), [stats]);
  const streak = stats?.currentStreak || 0;
  const longest = Math.max(stats?.longestStreak || 0, streak);
  const todayActive = activityLog.includes(todayKey(now));
  const week = useMemo(() => weekRhythm(activityLog, now), [activityLog, now]);
  const accuracy = accuracyOf(stats);
  const totalExams = stats?.totalExams || 0;
  const rows = useMemo(() => subjectRows(stats?.subjectBreakdown), [stats]);
  const weakest = useMemo(() => weakestSubject(rows), [rows]);
  const dailyQuests = useMemo(() => (Array.isArray(stats?.quests) ? stats!.quests! : []), [stats]);
  const quests = useMemo(() => questPreview(dailyQuests), [dailyQuests]);
  const rank = useMemo(() => rankOf(leaderboard, uid), [leaderboard, uid]);
  const board = useMemo(
    () =>
      boardRows(
        leaderboard,
        uid
          ? {
              uid,
              displayName: currentUser?.displayName,
              photoURL: currentUser?.photoURL || userAvatar,
              points: stats?.points,
              college: stats?.user?.college || stats?.college,
            }
          : null,
      ),
    [leaderboard, uid, currentUser?.displayName, currentUser?.photoURL, userAvatar, stats],
  );
  const sessions = useMemo(() => readActiveSessions(uid, typeof localStorage === 'undefined' ? null : localStorage, now.getTime()), [uid, now]);
  const setupPreview = useMemo(() => (sessions.length === 0 ? readSetupPreview() : null), [sessions.length]);

  const parts = dhakaParts(now);
  const greeting = greetingFor(parts.hour);
  const dateLine = formatBnDate(now);
  const message = heroMessage({ todayActive, streak, totalExams });
  const hasMistakes = (stats?.totalWrong || 0) > 0;

  /* ── actions ─────────────────────────────────────────────────────── */
  const startMock = useCallback(() => navigate('/quiz'), [navigate]);
  const openQuick = useCallback((link: QuickLink) => navigate(link.path, { state: link.state }), [navigate]);
  const practiceSubject = useCallback((row: SubjectRow) => navigate('/quiz', row.group ? { state: { subject: row.group } } : undefined), [navigate]);
  const dismissNotice = () => {
    setShowNotice(false);
    try {
      localStorage.setItem(NOTICE_KEY, 'true');
    } catch {
      /* ignore */
    }
  };

  if (isLoading && !stats) {
    return (
      <div className="pk-landing dash min-h-full bg-paper text-ink dark:bg-ink dark:text-paper">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="pk-landing dash relative min-h-full overflow-hidden bg-paper pb-28 text-ink dark:bg-ink dark:text-paper md:pb-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(255,82,0,0.10),transparent)] blur-2xl dark:opacity-70"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(255,185,46,0.16),transparent)] blur-3xl dark:opacity-60"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-28 top-72 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(255,122,53,0.10),transparent)] blur-3xl dark:opacity-70"
      />

      <div className="animate-page-enter relative z-10 mx-auto w-full max-w-6xl px-4 pt-3 md:px-6 md:pt-6">
        <TopBar
          streak={streak}
          avatar={userAvatar || currentUser?.photoURL}
          name={currentUser?.displayName}
          onStreak={() => setShowCalendar(true)}
          onAccount={() => navigate('/account')}
        />

        {/* One column on phones (ordered by `order-*`), two columns from lg. */}
        <div className="mt-3 flex flex-col gap-4 md:mt-0 lg:grid lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start lg:gap-5">
          <div className="contents lg:flex lg:flex-col lg:gap-5">
            <div className="order-1 lg:order-none">
              <HeroCard
                greeting={greeting}
                dateLine={dateLine}
                name={currentUser?.displayName || 'শিক্ষার্থী'}
                message={message}
                rank={rank}
                stats={heroStats(stats?.points || 0, totalExams, accuracy)}
                onStart={startMock}
                secondaryLabel={hasMistakes ? 'ভুলগুলো ঝালাই করো' : 'র‍্যাপিড ফায়ার'}
                onSecondary={() => (hasMistakes ? navigate('/wrong-questions') : navigate('/quiz', { state: { mode: 'RAPID_FIRE' } }))}
              />
            </div>
            {(sessions[0] || setupPreview) && (
              <div className="order-2 lg:order-none">
                <ResumeStrip
                  session={sessions[0] ?? null}
                  setup={setupPreview}
                  onResume={(id) => navigate(`/exam/${id}`)}
                  onRepeat={() => navigate('/quiz', { state: { resumeLast: true } })}
                />
              </div>
            )}
            <div className="order-3 lg:order-none">
              <QuickAccess onOpen={openQuick} onAll={() => navigate('/exams')} />
            </div>
            {quests.length > 0 && (
              <div className="order-5 lg:order-none">
                <QuestsCard quests={quests} done={questsDone(dailyQuests)} total={dailyQuests.length} onAll={() => navigate('/challenges')} />
              </div>
            )}
            {rows.length > 0 && (
              <div className="order-6 lg:order-none">
                <SubjectsCard rows={rows} weakest={weakest} onPractice={practiceSubject} />
              </div>
            )}
          </div>

          <div className="contents lg:flex lg:flex-col lg:gap-5">
            <div className="order-4 lg:order-none">
              <StreakCard
                streak={streak}
                longest={longest}
                week={week}
                todayActive={todayActive}
                onCalendar={() => setShowCalendar(true)}
                onPractice={startMock}
              />
            </div>
            <div className="order-7 lg:order-none">
              <LeaderboardCard rows={board.rows} gap={board.gap} rank={rank} onOpen={() => navigate('/leaderboard')} />
            </div>
            <AnimatePresence initial={false}>
              {showNotice && <BetaNotice key="beta-notice" className="order-8 lg:order-none" onDismiss={dismissNotice} />}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <StreakCalendar
        open={showCalendar}
        onClose={() => setShowCalendar(false)}
        streak={streak}
        longest={longest}
        activityLog={activityLog}
        todayActive={todayActive}
        onPractice={() => {
          setShowCalendar(false);
          startMock();
        }}
        now={now}
      />
    </div>
  );
};

export default HomeDashboard;
