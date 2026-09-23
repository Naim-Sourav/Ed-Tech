import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import type { QuizQuestion } from '../../types';
import { logger } from '../../utils/logger';
import { db } from '../../services/firebase';
import { recordUserActivityAPI, saveExamResultAPI, updateQuestProgressAPI } from '../../services/api';
import {
  buildAttemptDoc,
  buildResultPayload,
  mergeFromAttempts,
  QUEST_MIN_ANSWERS,
  shouldSyncRemotely,
  type ProgressStore,
  type SessionRecord,
} from './records';

/*
 * Remote side of the question-bank records: pushes a closed sitting to the
 * same places an exam result goes (MongoDB stats + mistake book, Firestore
 * history, activity streak, quests) and pulls earlier sittings back so a new
 * device starts with the right marks. Everything here is best-effort.
 */

export interface SyncOutcome {
  /** Streak was extended by this sitting. */
  streakUpdated: boolean;
  streak?: number;
}

export async function syncSession(uid: string, session: SessionRecord, questionsByKey: Map<string, QuizQuestion>): Promise<SyncOutcome | null> {
  if (!uid || !shouldSyncRemotely(session)) return null;
  const payload = buildResultPayload(session, questionsByKey);
  if (payload.totalQuestions === 0) return null;
  const now = Date.now();

  // Firestore queues writes while offline and only settles once online, so the mirror is not awaited.
  addDoc(collection(db, 'attempts'), buildAttemptDoc(uid, payload, now)).catch((e) => logger.error('qbank: attempt mirror failed', e));

  const [activity] = await Promise.all([
    recordUserActivityAPI(uid).catch(() => null),
    saveExamResultAPI(uid, payload).catch((e) => logger.error('qbank: result save failed', e)),
    session.items.length >= QUEST_MIN_ANSWERS ? updateQuestProgressAPI(uid, 'EXAM_COMPLETE', 1).catch(() => null) : Promise.resolve(null),
  ]);
  return { streakUpdated: !!(activity && activity.success && activity.streakUpdated), streak: activity?.streak };
}

const HYDRATED_KEY = 'pk_qbank_hydrated_v1';

/** Once per app session: fold question-bank attempts from Firestore into the local store. */
export async function hydrateFromRemote(uid: string, store: ProgressStore): Promise<ProgressStore | null> {
  if (!uid) return null;
  try {
    if (sessionStorage.getItem(`${HYDRATED_KEY}:${uid}`)) return null;
  } catch {
    /* ignore */
  }
  try {
    const snap = await getDocs(query(collection(db, 'attempts'), where('userId', '==', uid)));
    const docs: Record<string, unknown>[] = [];
    snap.forEach((d) => docs.push(d.data() as Record<string, unknown>));
    try {
      sessionStorage.setItem(`${HYDRATED_KEY}:${uid}`, '1');
    } catch {
      /* ignore */
    }
    return mergeFromAttempts(store, docs);
  } catch (e) {
    logger.info('qbank: remote hydrate skipped', e);
    return null;
  }
}
