import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { QuizQuestion } from '../../types';
import { logger } from '../../utils/logger';
import { useAuth } from '../../contexts/AuthContext';
import { useCache } from '../../contexts/CacheContext';
import { usePreferences } from '../../contexts/PreferencesContext';
import { fetchSavedQuestionsAPI, saveQuestionAPI, unsaveQuestionAPI } from '../../services/api';
import { hasBangla } from '../exam/model';
import { useToast } from '../Toast';
import type { FontSizeStep } from './QuestionCard';
import { hydrateFromRemote, syncSession, type SyncOutcome } from './persist';
import {
  closeSession,
  markSynced,
  questionKey,
  readStore,
  recordAnswer,
  setSourceTotal,
  shouldSyncRemotely,
  writeStore,
  type ProgressStore,
  type SessionRecord,
  type SessionSource,
} from './records';

/*
 * One store per signed-in user, shared by every question-bank view. Answers
 * are written to localStorage synchronously; closed sittings are mirrored to
 * the backend in the background.
 */

/** A sitting left open for longer than this is closed on the next visit. */
const STALE_AFTER_MS = 30 * 60_000;

export interface FinishResult {
  session: SessionRecord | null;
  /** Resolves once the remote mirror finished (null when nothing was sent). */
  remote: Promise<SyncOutcome | null>;
}

interface QbankContextValue {
  uid: string;
  store: ProgressStore;
  answer: (source: SessionSource, q: QuizQuestion, chosen: number) => void;
  finish: () => FinishResult;
  setTotal: (source: SessionSource, total: number) => void;
  remember: (questions: QuizQuestion[]) => void;
  saved: Set<string>;
  toggleSave: (q: QuizQuestion) => void;
  fontFor: (text?: string) => string;
  fontSize: FontSizeStep;
}

const QbankContext = createContext<QbankContextValue | null>(null);

export const useQbank = (): QbankContextValue => {
  const ctx = useContext(QbankContext);
  if (!ctx) throw new Error('useQbank must be used inside <QbankProvider>');
  return ctx;
};

const storage = (): Storage | null => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
};

export const QbankProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { clearCache } = useCache();
  const { showToast } = useToast();
  const { questionFont, questionFontSize } = usePreferences();
  const uid = currentUser?.uid || '';
  // Kept in refs so effects below do not depend on the identity of context callbacks.
  const clearCacheRef = useRef(clearCache);
  clearCacheRef.current = clearCache;
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  const [store, setStore] = useState<ProgressStore>(() => readStore(uid, storage()));
  const storeRef = useRef(store);
  storeRef.current = store;
  const questionsRef = useRef(new Map<string, QuizQuestion>());

  const commit = useCallback(
    (next: ProgressStore) => {
      storeRef.current = next;
      setStore(next);
      writeStore(uid, storage(), next);
    },
    [uid],
  );

  const pushRemote = useCallback(
    (session: SessionRecord | null): Promise<SyncOutcome | null> => {
      if (!session || !uid || !shouldSyncRemotely(session)) return Promise.resolve(null);
      return syncSession(uid, session, questionsRef.current)
        .then((outcome) => {
          commit(markSynced(storeRef.current, session.id));
          clearCacheRef.current(`dashboard_${uid}`);
          clearCacheRef.current(`profile_${uid}`);
          return outcome;
        })
        .catch((e) => {
          logger.error('qbank: remote sync failed', e);
          return null;
        });
    },
    [uid, commit],
  );

  /* Load the user's store, close a stale sitting, then fold in remote history. */
  useEffect(() => {
    let cancelled = false;
    let loaded = readStore(uid, storage());
    if (loaded.pending && Date.now() - loaded.pending.endedAt > STALE_AFTER_MS) {
      const closed = closeSession(loaded, loaded.pending.endedAt);
      loaded = closed.store;
      commit(loaded);
      void pushRemote(closed.session);
    } else {
      commit(loaded);
    }
    if (uid) {
      hydrateFromRemote(uid, loaded).then((merged) => {
        if (!cancelled && merged) commit({ ...merged, pending: storeRef.current.pending, marks: { ...merged.marks, ...storeRef.current.marks } });
      });
    }
    return () => {
      cancelled = true;
    };
  }, [uid, commit, pushRemote]);

  /* Leaving the bank closes the open sitting so it becomes a record. (Deferred so StrictMode's simulated unmount does not count.) */
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    return () => {
      closeTimer.current = setTimeout(() => {
        const { store: next, session } = closeSession(storeRef.current);
        if (session) {
          storeRef.current = next;
          writeStore(uid, storage(), next);
          void pushRemote(session);
        }
      }, 60);
    };
  }, [uid, pushRemote]);

  const answer = useCallback(
    (source: SessionSource, q: QuizQuestion, chosen: number) => {
      questionsRef.current.set(questionKey(q), q);
      const before = storeRef.current.pending;
      const next = recordAnswer(storeRef.current, source, q, chosen);
      commit(next);
      // Answering in a different source closed the previous sitting — mirror it.
      if (before && next.pending && before.id !== next.pending.id) void pushRemote(next.sessions.find((s) => s.id === before.id) ?? null);
    },
    [commit, pushRemote],
  );

  const finish = useCallback((): FinishResult => {
    const { store: next, session } = closeSession(storeRef.current);
    commit(next);
    return { session, remote: pushRemote(session) };
  }, [commit, pushRemote]);

  const setTotal = useCallback(
    (source: SessionSource, total: number) => {
      const next = setSourceTotal(storeRef.current, source, total);
      if (next !== storeRef.current) commit(next);
    },
    [commit],
  );

  const remember = useCallback((questions: QuizQuestion[]) => {
    questions.forEach((q) => questionsRef.current.set(questionKey(q), q));
  }, []);

  /* Bookmarks */
  const [saved, setSaved] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    fetchSavedQuestionsAPI(uid)
      .then((list: unknown) => {
        if (cancelled || !Array.isArray(list)) return;
        const ids = new Set<string>();
        list.forEach((s) => {
          const id = (s as { questionId?: { _id?: string } | string })?.questionId;
          const value = typeof id === 'string' ? id : id?._id;
          if (value) ids.add(value);
        });
        setSaved(ids);
      })
      .catch(logger.error);
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const toggleSave = useCallback(
    (q: QuizQuestion) => {
      const id = q._id || q.id;
      const notify = showToastRef.current;
      if (!id) {
        notify('এই প্রশ্নটি বুকমার্ক করা যায় না', 'info');
        return;
      }
      if (!uid) {
        notify('বুকমার্ক করতে লগইন করো', 'info');
        return;
      }
      const was = saved.has(id);
      setSaved((prev) => {
        const next = new Set(prev);
        if (was) next.delete(id);
        else next.add(id);
        return next;
      });
      (was ? unsaveQuestionAPI(uid, id) : saveQuestionAPI(uid, id)).catch(logger.error);
      notify(was ? 'বুকমার্ক সরানো হয়েছে' : 'প্রশ্নটি বুকমার্ক হয়েছে', was ? 'info' : 'success');
    },
    [uid, saved],
  );

  const fontFor = useCallback((text: string = '') => (hasBangla(text) ? questionFont : 'font-sans'), [questionFont]);

  const value = useMemo<QbankContextValue>(
    () => ({ uid, store, answer, finish, setTotal, remember, saved, toggleSave, fontFor, fontSize: questionFontSize }),
    [uid, store, answer, finish, setTotal, remember, saved, toggleSave, fontFor, questionFontSize],
  );

  return <QbankContext.Provider value={value}>{children}</QbankContext.Provider>;
};
