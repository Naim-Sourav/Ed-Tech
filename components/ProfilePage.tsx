import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Settings } from 'lucide-react';
import { auth } from '../services/firebase';
import { logger } from '../utils/logger';
import { useAuth } from '../contexts/AuthContext';
import type { EnrolledCourse } from '../contexts/AuthContext';
import { useCache } from '../contexts/CacheContext';
import { useToast } from './Toast';
import { fetchLeaderboardAPI, fetchUserStatsAPI } from '../services/api';
import { uploadImageToCloudinary } from '../services/imageUpload';
import type { LeaderboardUser } from '../types';
import { IconBtn } from './qbank/ui';
import {
  achievements,
  emptyIdentity,
  heatmap,
  isHttpUrl,
  longestStreak,
  profileUrl,
  rankOf,
  streakFromLog,
  subjectRows,
  topicRows,
  type ProfileIdentity,
  type ProfileStats,
  type SubjectRow,
} from './profile/model';
import {
  AccountCard,
  AchievementsCard,
  ActivityCard,
  CoursesCard,
  IdentityCard,
  ProfileSkeleton,
  ProfileTopBar,
  StatsCard,
  StudyInfoCard,
  SubjectsCard,
  TopicsCard,
} from './profile/sections';
import EditProfileSheet, { type ProfileEditResult } from './profile/EditProfileSheet';
import SettingsView, { type ThemeMode } from './profile/SettingsView';

/*
 * Profile (/profile, /profile/:userId) and settings (/settings).
 * Data: the same stats + leaderboard endpoints the dashboard uses, cached per
 * session. Everything derived lives in ./profile/model.ts; the cards in
 * ./profile/sections.tsx. This file only wires state, routing and side effects.
 */

const LEGACY_TABS: Record<string, string> = { SAVED: '/saved-questions', MISTAKES: '/wrong-questions', HISTORY: '/history' };
const BATCH_COURSES = new Set(['gst-super-focus', 'med-final-24']);

type Props = { themeMode?: ThemeMode; toggleTheme?: () => void; setThemeMode?: (mode: ThemeMode) => void };

const ProfilePage: React.FC<Props> = ({ themeMode = 'light', setThemeMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams<{ userId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, userAvatar, enrolledCourses, extendedProfile, updateUserProfile, logout } = useAuth();
  const { showToast } = useToast();
  const { getCache, setCache } = useCache();

  const own = !userId || userId === currentUser?.uid;
  const uid = (own ? currentUser?.uid : userId) ?? '';
  const view: 'profile' | 'settings' = location.pathname === '/settings' || searchParams.get('tab') === 'SETTINGS' ? 'settings' : 'profile';

  /* ── data ────────────────────────────────────────────────────────── */
  const cacheKey = own ? `dashboard_${uid}` : `profile_${uid}`;
  const cached = (getCache(cacheKey) || {}) as { stats?: ProfileStats | null; leaderboard?: LeaderboardUser[] };
  const [stats, setStats] = useState<ProfileStats | null>(cached.stats ?? null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>(cached.leaderboard ?? []);
  const [loading, setLoading] = useState(!cached.stats);
  const [failed, setFailed] = useState(false);
  const [now] = useState(() => new Date());

  const cacheRef = useRef(setCache);
  cacheRef.current = setCache;

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    (async () => {
      try {
        const [statsData, board] = await Promise.all([fetchUserStatsAPI(uid).catch(() => null), fetchLeaderboardAPI().catch(() => [])]);
        if (cancelled) return;
        const nextStats = (statsData as ProfileStats | null) ?? null;
        const nextBoard = Array.isArray(board) ? (board as LeaderboardUser[]) : [];
        if (nextStats) setStats(nextStats);
        setFailed(!nextStats);
        setLeaderboard(nextBoard);
        cacheRef.current(cacheKey, { stats: nextStats ?? cached.stats ?? null, leaderboard: nextBoard });
      } catch (e) {
        logger.error('Profile load error', e);
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uid]); // refetch only when the viewed user changes

  /* ── legacy links: old tabs now live on their own pages ─────────── */
  const tab = searchParams.get('tab');
  useEffect(() => {
    if (tab && LEGACY_TABS[tab]) navigate(LEGACY_TABS[tab], { replace: true });
  }, [tab, navigate]);

  /* ── identity (auth + extended profile win over the stats payload) ── */
  const identity = useMemo<ProfileIdentity>(() => {
    const su = stats?.user ?? {};
    if (!own) {
      return {
        ...emptyIdentity(),
        name: su.displayName || 'শিক্ষার্থী',
        photoURL: isHttpUrl(su.photoURL) ? (su.photoURL as string) : '',
        college: su.college || '',
        hscBatch: su.hscBatch || '',
        department: su.department || '',
        target: su.target || '',
        dailyStudyGoal: su.dailyStudyGoal || '',
        createdAt: su.createdAt ?? null,
      };
    }
    const photo = [userAvatar, currentUser?.photoURL, su.photoURL].find((p) => isHttpUrl(p)) || '';
    return {
      name: currentUser?.displayName || su.displayName || '',
      email: currentUser?.email || su.email || '',
      photoURL: photo,
      college: extendedProfile?.college || su.college || '',
      hscBatch: extendedProfile?.hscBatch || su.hscBatch || '',
      department: extendedProfile?.department || su.department || '',
      target: extendedProfile?.target || su.target || '',
      phoneNumber: extendedProfile?.phoneNumber || su.phoneNumber || '',
      dailyStudyGoal: extendedProfile?.dailyStudyGoal || su.dailyStudyGoal || '',
      createdAt: su.createdAt ?? currentUser?.metadata?.creationTime ?? null,
    };
  }, [own, stats, currentUser, userAvatar, extendedProfile]);

  /* ── derived ─────────────────────────────────────────────────────── */
  const activityLog = useMemo(() => (Array.isArray(stats?.activityLog) ? stats!.activityLog! : []), [stats]);
  const current = stats?.currentStreak ?? streakFromLog(activityLog, now);
  const longest = Math.max(stats?.longestStreak || 0, longestStreak(activityLog), current);
  const rank = rankOf(leaderboard, uid);
  const heat = useMemo(() => heatmap(activityLog, 26, now), [activityLog, now]);
  const subjects = useMemo(() => subjectRows(stats?.subjectBreakdown ?? []), [stats]);
  const topics = useMemo(() => topicRows(stats), [stats]);
  const badges = useMemo(() => achievements({ stats, rank, longest }), [stats, rank, longest]);
  const canResetPassword = !!currentUser?.providerData?.some((p) => p?.providerId === 'password');

  /* ── edit sheet + photo ──────────────────────────────────────────── */
  const [editOpen, setEditOpen] = useState(() => searchParams.get('edit') === '1');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const closeEdit = useCallback(() => {
    setEditOpen(false);
    if (searchParams.get('edit')) {
      const next = new URLSearchParams(searchParams);
      next.delete('edit');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const saveProfile = useCallback(
    async (r: ProfileEditResult) => {
      await updateUserProfile(r.name, r.photoURL, {
        ...extendedProfile,
        phoneNumber: r.phoneNumber,
        hscBatch: r.hscBatch,
        department: r.department,
        target: r.target,
        college: r.college,
        dailyStudyGoal: r.dailyStudyGoal,
      });
      showToast('প্রোফাইল আপডেট হয়েছে', 'success');
    },
    [updateUserProfile, extendedProfile, showToast],
  );

  const onPhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      await updateUserProfile(identity.name, url, extendedProfile ?? undefined);
      showToast('ছবি আপডেট হয়েছে', 'success');
    } catch (err) {
      logger.error('Avatar upload failed', err);
      showToast('ছবি আপলোড হয়নি — আবার চেষ্টা করো', 'error');
    } finally {
      setUploading(false);
    }
  };

  /* ── actions ─────────────────────────────────────────────────────── */
  const share = async () => {
    const url = profileUrl(uid, window.location.origin);
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: `${identity.name} · পরীক্ষাঙ্গন`, url });
        return;
      } catch (err) {
        if ((err as { name?: string })?.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast('প্রোফাইল লিংক কপি হয়েছে', 'success');
    } catch {
      showToast('লিংক কপি করা যায়নি', 'error');
    }
  };

  const challenge = () => navigate('/battle', { state: { opponent: { uid, name: identity.name, avatar: identity.photoURL } } });
  const practice = (row: SubjectRow) => navigate('/quiz', row.group ? { state: { subject: row.group } } : undefined);
  const openCourse = (c: EnrolledCourse) => navigate(BATCH_COURSES.has(c.id) ? `/exam-batch/${c.id}` : '/courses');
  const signOut = async () => {
    try {
      await logout();
    } catch (err) {
      logger.error('Logout failed', err);
    }
    navigate('/auth');
  };
  const resetPassword = async () => {
    if (!identity.email) throw new Error('no-email');
    try {
      await sendPasswordResetEmail(auth, identity.email);
      showToast('পাসওয়ার্ড রিসেট লিংক ইমেইলে পাঠানো হয়েছে', 'success');
    } catch (err) {
      logger.error('Password reset failed', err);
      showToast('লিংক পাঠানো যায়নি — একটু পরে আবার চেষ্টা করো', 'error');
      throw err;
    }
  };

  /* ── render ──────────────────────────────────────────────────────── */
  const shell = 'pk-landing dash relative min-h-full bg-paper pb-28 text-ink dark:bg-ink dark:text-paper md:pb-12';
  const inner = 'mx-auto w-full max-w-6xl px-4 pt-3 md:px-6 md:pt-6';

  if (view === 'settings') {
    return (
      <div className={shell}>
        <div className={inner}>
          <SettingsView
            themeMode={themeMode}
            setThemeMode={setThemeMode}
            identity={identity}
            canResetPassword={canResetPassword}
            onResetPassword={resetPassword}
            onEditProfile={() => navigate('/profile?edit=1')}
            onBack={() => navigate('/profile')}
            onNavigate={(path) => navigate(path)}
            onLogout={signOut}
          />
        </div>
      </div>
    );
  }

  const ready = !loading || !!stats;
  const empty = !loading && !stats;

  return (
    <div className={shell}>
      <div className={inner}>
        <ProfileTopBar
          title="প্রোফাইল"
          eyebrow={own ? 'এক নজরে তোমার অগ্রগতি' : 'শিক্ষার্থীর প্রোফাইল'}
          onBack={own ? undefined : () => navigate(-1)}
          right={own ? <IconBtn icon={Settings} label="সেটিংস" onClick={() => navigate('/settings')} /> : undefined}
        />

        {!ready ? (
          <ProfileSkeleton />
        ) : (
          <div className="mt-4 grid gap-4 md:gap-5 lg:grid-cols-[360px_1fr] lg:items-start">
            {/* left: who */}
            <div className="space-y-4 md:space-y-5">
              <IdentityCard
                identity={identity}
                uid={uid}
                own={own}
                streak={current}
                onEdit={own ? () => setEditOpen(true) : undefined}
                onShare={share}
                onChallenge={own ? undefined : challenge}
                onPickPhoto={own ? () => fileRef.current?.click() : undefined}
                uploading={uploading}
              />
              {own && (
                <div className="hidden space-y-4 md:space-y-5 lg:block">
                  <StudyInfoCard identity={identity} onEdit={() => setEditOpen(true)} />
                  <AccountCard onSettings={() => navigate('/settings')} onLeaderboard={() => navigate('/leaderboard')} onLogout={signOut} />
                </div>
              )}
            </div>

            {/* right: what */}
            <div className="space-y-4 md:space-y-5">
              {empty && failed && (
                <p className="rounded-2xl bg-amber-soft px-4 py-3 text-[13px] font-bold text-amber-900 dark:bg-gold/15 dark:text-amber-100" role="status">
                  পরিসংখ্যান আনা যায়নি — ইন্টারনেট দেখে পেজটা আবার লোড করো।
                </p>
              )}
              <StatsCard stats={stats} rank={rank} onStart={() => navigate('/quiz')} />
              <ActivityCard heat={heat} current={current} longest={longest} />
              <SubjectsCard rows={subjects} onPractice={practice} />
              <TopicsCard strong={topics.strong} weak={topics.weak} own={own} onPractice={own ? () => navigate('/wrong-questions') : undefined} />
              <AchievementsCard list={badges} />
              {own && <CoursesCard courses={enrolledCourses} onOpen={openCourse} onAll={() => navigate('/courses')} />}
              {own && (
                <div className="space-y-4 lg:hidden">
                  <StudyInfoCard identity={identity} onEdit={() => setEditOpen(true)} />
                  <AccountCard onSettings={() => navigate('/settings')} onLeaderboard={() => navigate('/leaderboard')} onLogout={signOut} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {own && (
        <>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhotoFile} aria-label="প্রোফাইল ছবি বেছে নাও" />
          <EditProfileSheet
            open={editOpen}
            onClose={closeEdit}
            initial={identity}
            uid={uid}
            onSave={saveProfile}
            uploadPhoto={uploadImageToCloudinary}
            now={now}
          />
        </>
      )}
    </div>
  );
};

export default ProfilePage;
