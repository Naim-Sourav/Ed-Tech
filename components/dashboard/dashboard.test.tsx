import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

/*
 * Render-level behaviour of the home dashboard: greeting + stats from the
 * API, the "resume" strip driven by localStorage, quick links, the streak
 * calendar and the beta notice.
 */

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const auth = vi.hoisted(() => ({ state: {} as Record<string, unknown> }));
const api = vi.hoisted(() => ({ fetchUserStatsAPI: vi.fn(), fetchLeaderboardAPI: vi.fn() }));
const cache = vi.hoisted(() => ({ store: new Map<string, unknown>() }));

vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => auth.state }));
vi.mock('../../contexts/CacheContext', () => ({
  useCache: () => ({
    getCache: (k: string) => cache.store.get(k) ?? null,
    setCache: (k: string, v: unknown) => cache.store.set(k, v),
    clearCache: () => cache.store.clear(),
  }),
}));
vi.mock('../../services/api', () => api);
vi.mock('lottie-react', () => ({ default: () => null }));

import HomeDashboard from '../HomeDashboard';

const USER = { uid: 'u1', displayName: 'নাবিলা রহমান', photoURL: null };
const day = (offset: number) => {
  const d = new Date(Date.now() - offset * 86_400_000);
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });
};

const STATS = {
  points: 1840,
  totalExams: 23,
  totalCorrect: 412,
  totalWrong: 118,
  currentStreak: 5,
  longestStreak: 11,
  activityLog: [day(1), day(2), day(3), day(4), day(5)],
  subjectBreakdown: [
    { subject: 'Physics', total: 180, correct: 140 },
    { subject: 'Chemistry', total: 150, correct: 108 },
    { subject: 'Biology', total: 120, correct: 101 },
  ],
  quests: [
    { id: 'q1', title: 'আজ ১টি মক টেস্ট দাও', target: 1, progress: 0, reward: 20, completed: false, claimed: false },
    { id: 'q2', title: '৫টি ভুল প্রশ্ন রিভিশন করো', target: 5, progress: 5, reward: 15, completed: true, claimed: false },
  ],
  user: { college: 'নটর ডেম কলেজ', target: 'Medical' },
};
const BOARD = [
  { uid: 'a', displayName: 'তাহমিদ খান', points: 5200, college: 'ঢাকা কলেজ' },
  { uid: 'b', displayName: 'সারা আহমেদ', points: 4800 },
  { uid: 'c', displayName: 'রফিকুল ইসলাম', points: 4500 },
  { uid: 'd', displayName: 'জারিন', points: 3000 },
  { uid: 'u1', displayName: 'নাবিলা রহমান', points: 1840 },
];

let lastLocation: { pathname: string; state: unknown } = { pathname: '', state: null };
const Probe = () => {
  const loc = useLocation();
  lastLocation = { pathname: loc.pathname, state: loc.state };
  return null;
};

const click = (el: Element | undefined | null) => {
  if (!el) throw new Error('element not found');
  return act(async () => {
    (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
};
const buttons = () => Array.from(document.querySelectorAll('button'));
const byText = (text: string) => buttons().find((b) => (b.textContent || '').includes(text));
const body = () => document.body.textContent || '';
const flush = () => act(() => new Promise<void>((r) => setTimeout(r, 40)));

let root: Root | null = null;
const mount = async () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () =>
    root!.render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Probe />
        <Routes>
          <Route path="/dashboard" element={<HomeDashboard />} />
          <Route path="*" element={<p>ELSEWHERE</p>} />
        </Routes>
      </MemoryRouter>,
    ),
  );
  await flush();
};

beforeEach(() => {
  localStorage.clear();
  cache.store.clear();
  auth.state = { currentUser: USER, userAvatar: null };
  api.fetchUserStatsAPI.mockReset().mockResolvedValue(STATS);
  api.fetchLeaderboardAPI.mockReset().mockResolvedValue(BOARD);
});

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = null;
  document.body.innerHTML = '';
});

describe('HomeDashboard', () => {
  it('greets the student with their numbers, subjects, quests and rank', async () => {
    await mount();
    expect(body()).toContain('শুভ');
    expect(body()).toContain('নাবিলা রহমান');
    expect(body()).toContain('১,৮৪০'); // points
    expect(body()).toContain('২৩'); // exams
    expect(body()).toContain('৭৮%'); // 412 / 530
    expect(body()).toContain('#৫'); // rank on the board
    expect(body()).toContain('৫ দিনের স্ট্রিক'); // hero nudge (nothing done today)
    expect(body()).toContain('আর ২ দিন'); // 7-day milestone
    expect(body()).toContain('রসায়ন-এ একটু বেশি ভুল হচ্ছে'); // weakest subject: 108/150 = 72%
    expect(body()).toContain('১/২ সম্পন্ন'); // quests
    expect(body()).toContain('তাহমিদ খান');
    expect(body()).toContain('(তুমি)');
    expect(document.querySelector('img[src*="banner"]')).toBeNull(); // promo banner removed
    expect(cache.store.get('dashboard_u1')).toMatchObject({ stats: STATS });
  });

  it('routes the primary actions to the right places', async () => {
    await mount();
    await click(byText('মক টেস্ট দাও'));
    expect(lastLocation.pathname).toBe('/quiz');
  });

  it('sends "ভুলগুলো ঝালাই করো" to the wrong-question bank and the weakest subject into the builder', async () => {
    await mount();
    await click(byText('ভুলগুলো ঝালাই করো'));
    expect(lastLocation.pathname).toBe('/wrong-questions');

    await act(async () => root!.unmount());
    root = null;
    document.body.innerHTML = '';
    await mount();
    await click(byText('রসায়ন-এ একটু বেশি ভুল হচ্ছে'));
    expect(lastLocation).toEqual({ pathname: '/quiz', state: { subject: 'Chemistry' } });
  });

  it('offers to continue an in-progress exam saved on this device', async () => {
    localStorage.setItem(
      'exam_progress_u1_abc',
      JSON.stringify({
        config: { title: 'পদার্থবিজ্ঞান · ভেক্টর', timeLimit: 20, mode: 'ALL_AT_ONCE' },
        questions: Array.from({ length: 10 }, (_, i) => ({ id: String(i), question: 'q', options: ['a', 'b', 'c', 'd'], correctAnswerIndex: 0 })),
        userAnswers: [1, 2, null, 0],
        expiryTime: Date.now() + 5 * 60_000,
        savedAt: Date.now() - 60_000,
      }),
    );
    await mount();
    expect(body()).toContain('চলমান পরীক্ষা');
    expect(body()).toContain('পদার্থবিজ্ঞান · ভেক্টর');
    expect(body()).toContain('৩/১০ উত্তর');
    await click(byText('চালিয়ে যাও'));
    expect(lastLocation.pathname).toBe('/exam/abc');
  });

  it('offers the last setup again when nothing is in progress', async () => {
    localStorage.setItem(
      'pk_quiz_last_setup_v1',
      JSON.stringify({
        selection: { 'Physics 1st Paper-ভেক্টর': ['ভেক্টর রাশি প্রকারভেদ ও সূত্রাবলী'] },
        settings: { count: 20, timeLimit: 20, negativeMarking: 0.25, practice: false, view: 'ALL_AT_ONCE' },
        title: 'পদার্থবিজ্ঞান ১ম পত্র',
        at: Date.now() - 3_600_000,
      }),
    );
    await mount();
    expect(body()).toContain('আগেরবারের সেটআপে আবার');
    expect(body()).toContain('২০ প্রশ্ন · ২০ মিনিট · নেগেটিভ ০.২৫');
    await click(byText('আগেরবারের সেটআপে আবার'));
    expect(lastLocation).toEqual({ pathname: '/quiz', state: { resumeLast: true } });
  });

  it('opens the streak calendar and dismisses the beta notice for good', async () => {
    await mount();
    expect(body()).toContain('বেটা');
    await click(byText('ক্যালেন্ডার'));
    await flush();
    expect(document.querySelector('[role="dialog"]')).toBeTruthy();
    expect(body()).toContain('এই মাসে');
    await click(document.querySelector('[role="dialog"] button[aria-label="বন্ধ করো"]'));
    await act(() => new Promise<void>((r) => setTimeout(r, 500)));
    expect(document.querySelector('[role="dialog"]')).toBeNull();

    await click(document.querySelector('button[aria-label="বন্ধ করো"]'));
    await act(() => new Promise<void>((r) => setTimeout(r, 500)));
    expect(localStorage.getItem('hide_dev_notice')).toBe('true');
    expect(body()).not.toContain('বেটা');
  });

  it('shows the skeleton until the first response and survives a failed stats call', async () => {
    api.fetchUserStatsAPI.mockRejectedValue(new Error('offline'));
    await mount();
    expect(body()).toContain('নাবিলা রহমান');
    expect(body()).toContain('০%'); // no stats → zeroed accuracy, no crash
  });
});
