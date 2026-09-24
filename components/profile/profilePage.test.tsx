import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

/*
 * Render-level behaviour of the profile page: own profile (identity, stats,
 * heat-map, subjects, badges, edit sheet), someone else's profile, the legacy
 * ?tab= redirects and the settings view.
 */

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const auth = vi.hoisted(() => ({ state: {} as Record<string, unknown>, updateUserProfile: vi.fn(), logout: vi.fn() }));
const api = vi.hoisted(() => ({ fetchUserStatsAPI: vi.fn(), fetchLeaderboardAPI: vi.fn() }));
const cache = vi.hoisted(() => ({ store: new Map<string, unknown>() }));
const toast = vi.hoisted(() => ({ showToast: vi.fn() }));
const prefs = vi.hoisted(() => ({ questionFont: 'font-noto', questionFontSize: 'text-base', setQuestionFont: vi.fn(), setQuestionFontSize: vi.fn() }));
const fb = vi.hoisted(() => ({ sendPasswordResetEmail: vi.fn(async () => undefined) }));

vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => auth.state }));
vi.mock('../../contexts/CacheContext', () => ({
  useCache: () => ({
    getCache: (k: string) => cache.store.get(k) ?? null,
    setCache: (k: string, v: unknown) => cache.store.set(k, v),
    clearCache: () => cache.store.clear(),
  }),
}));
vi.mock('../../contexts/PreferencesContext', () => ({ usePreferences: () => prefs }));
vi.mock('../Toast', () => ({ useToast: () => toast }));
vi.mock('../../services/api', () => api);
vi.mock('../../services/firebase', () => ({ auth: {} }));
vi.mock('../../services/imageUpload', () => ({ uploadImageToCloudinary: vi.fn(async () => 'https://img.test/new.png') }));
vi.mock('firebase/auth', () => fb);

import ProfilePage from '../ProfilePage';

const USER = {
  uid: 'u1',
  displayName: 'নাবিলা রহমান',
  email: 'nabila@example.com',
  photoURL: null,
  metadata: { creationTime: 'Fri, 15 May 2025 10:00:00 GMT' },
  providerData: [{ providerId: 'password' }],
};
const EXT = { college: 'ঢাকা কলেজ', hscBatch: 'HSC 2026', department: 'Science', target: 'Medical', phoneNumber: '01712345678', dailyStudyGoal: '৪-৬ ঘণ্টা' };
const day = (offset: number) => new Date(Date.now() - offset * 86_400_000).toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });

const STATS = {
  points: 1250,
  totalExams: 15,
  totalCorrect: 312,
  totalWrong: 96,
  currentStreak: 4,
  activityLog: [day(0), day(1), day(2), day(3), day(10), day(11), day(12), day(13), day(14), day(15)],
  subjectBreakdown: [
    { subject: 'Biology', total: 134, correct: 113 },
    { subject: 'Physics', total: 136, correct: 107 },
    { subject: 'Chemistry', total: 88, correct: 62 },
    { subject: 'Higher Math', total: 50, correct: 30 },
  ],
  strongestTopics: [
    { topic: 'কোষ বিভাজন', accuracy: 94, total: 18 },
    { topic: 'ভেক্টর', accuracy: 90, total: 11 },
  ],
  weakestTopics: [{ topic: 'সরলরেখা', accuracy: 42, total: 12 }],
  user: { displayName: 'নাবিলা রহমান', college: 'ঢাকা কলেজ', createdAt: Date.UTC(2025, 4, 15) },
};
const OTHER_STATS = {
  ...STATS,
  points: 980,
  totalExams: 9,
  totalCorrect: 150,
  totalWrong: 60,
  currentStreak: 2,
  user: { displayName: 'তানভীর আহমেদ', college: 'নটর ডেম কলেজ', hscBatch: 'HSC 2026', department: 'Science', target: 'Engineering', email: 'secret@example.com', phoneNumber: '01999999999', createdAt: Date.UTC(2025, 0, 2) },
};
const BOARD = [
  { uid: 'a', displayName: 'তাহমিদ খান', points: 5200 },
  { uid: 'b', displayName: 'সারা আহমেদ', points: 4800 },
  { uid: 'u1', displayName: 'নাবিলা রহমান', points: 1250 },
];

let lastLocation: { pathname: string; search: string; state: unknown } = { pathname: '', search: '', state: null };
const Probe = () => {
  const loc = useLocation();
  lastLocation = { pathname: loc.pathname, search: loc.search, state: loc.state };
  return null;
};

const click = (el: Element | undefined | null) => {
  if (!el) throw new Error('element not found');
  return act(async () => {
    (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
};
const buttons = () => Array.from(document.querySelectorAll('button'));
const byText = (text: string) => buttons().find((b) => (b.textContent || '').trim() === text) ?? buttons().find((b) => (b.textContent || '').includes(text));
const byLabel = (label: string) => document.querySelector(`[aria-label="${label}"]`);
const body = () => document.body.textContent || '';
const flush = (ms = 40) => act(() => new Promise<void>((r) => setTimeout(r, ms)));
const setInput = (el: Element | null, value: string) => {
  if (!el) throw new Error('input not found');
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  return act(async () => {
    setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

let root: Root | null = null;
const mount = async (path = '/profile') => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () =>
    root!.render(
      <MemoryRouter initialEntries={[path]}>
        <Probe />
        <Routes>
          <Route path="/profile" element={<ProfilePage themeMode="light" />} />
          <Route path="/profile/:userId" element={<ProfilePage themeMode="light" />} />
          <Route path="/settings" element={<ProfilePage themeMode="light" setThemeMode={setTheme} />} />
          <Route path="*" element={<p>ELSEWHERE</p>} />
        </Routes>
      </MemoryRouter>,
    ),
  );
  await flush();
};
const setTheme = vi.fn();

beforeEach(() => {
  localStorage.clear();
  cache.store.clear();
  auth.updateUserProfile.mockReset().mockResolvedValue(undefined);
  auth.logout.mockReset().mockResolvedValue(undefined);
  auth.state = {
    currentUser: USER,
    userAvatar: '',
    enrolledCourses: [{ id: 'med-final-24', title: 'মেডিকেল ফাইনাল মডেল টেস্ট', progress: 35 }],
    extendedProfile: EXT,
    updateUserProfile: auth.updateUserProfile,
    logout: auth.logout,
  };
  api.fetchUserStatsAPI.mockReset().mockImplementation(async (uid: string) => (uid === 'u1' ? STATS : OTHER_STATS));
  api.fetchLeaderboardAPI.mockReset().mockResolvedValue(BOARD);
  toast.showToast.mockReset();
  setTheme.mockReset();
  fb.sendPasswordResetEmail.mockClear();
});

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = null;
  document.body.innerHTML = '';
});

describe('ProfilePage — own profile', () => {
  it('shows identity, numbers, rank, streaks, subjects, topics and badges from the API', async () => {
    await mount();
    expect(api.fetchUserStatsAPI).toHaveBeenCalledWith('u1');
    const text = body();
    expect(text).toContain('নাবিলা রহমান');
    expect(text).toContain('HSC ২০২৬ · বিজ্ঞান · মেডিকেল');
    expect(text).toContain('ঢাকা কলেজ');
    expect(text).toContain('মে ২০২৫ থেকে');
    expect(byLabel('সংখ্যায় অগ্রগতি')?.textContent).toContain('১,২৫০');
    expect(byLabel('সংখ্যায় অগ্রগতি')?.textContent).toContain('#৩');
    expect(byLabel('সংখ্যায় অগ্রগতি')?.textContent).toContain('৭৬%');
    expect(byLabel('সক্রিয়তা')?.textContent).toContain('চলতি স্ট্রিক ৪ দিন');
    expect(byLabel('সক্রিয়তা')?.textContent).toContain('সেরা স্ট্রিক ৬ দিন');
    expect(byLabel('বিষয়ভিত্তিক দক্ষতা')?.textContent).toContain('জীববিজ্ঞান');
    expect(byLabel('শক্তি ও দুর্বলতা')?.textContent).toContain('কোষ বিভাজন');
    expect(byLabel('শক্তি ও দুর্বলতা')?.textContent).toContain('সরলরেখা');
    expect(byLabel('অর্জন')?.textContent).toContain('৪/৯ ব্যাজ আনলক');
    expect(byLabel('আমার কোর্স')?.textContent).toContain('মেডিকেল ফাইনাল মডেল টেস্ট');
    // Removed for good: the learning-pulse card and the old tabs.
    expect(text).not.toContain('নির্ভুলতায় এগিয়ে যাচ্ছেন');
    expect(text).not.toContain('লার্নিং পালস');
    expect(text).not.toContain('সেভ করা প্রশ্ন');
    expect(text).not.toContain('পরীক্ষার ইতিহাস');
    // Cached like the dashboard so the next visit paints instantly.
    expect(cache.store.get('dashboard_u1')).toMatchObject({ stats: STATS });
  });

  it('opens the edit sheet, validates, and saves through updateUserProfile', async () => {
    await mount();
    await click(byText('এডিট'));
    await flush(500);
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    const name = dialog!.querySelector('input[autocomplete="name"]');
    const phone = dialog!.querySelector('input[autocomplete="tel"]');
    expect((name as HTMLInputElement).value).toBe('নাবিলা রহমান');
    expect((phone as HTMLInputElement).value).toBe('01712345678');

    await setInput(phone, '০১৯১১');
    await click(byText('সেভ করো'));
    expect(auth.updateUserProfile).not.toHaveBeenCalled();
    expect(dialog!.textContent).toContain('সঠিক ১১ ডিজিটের নম্বর দাও');

    await setInput(phone, '০১৯১১ ২২২ ৩৩৩');
    await setInput(name, 'নাবিলা র.');
    await click(Array.from(dialog!.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'ইঞ্জিনিয়ারিং'));
    await click(byText('সেভ করো'));
    await flush(100);
    expect(auth.updateUserProfile).toHaveBeenCalledTimes(1);
    const [savedName, savedPhoto, extra] = auth.updateUserProfile.mock.calls[0];
    expect(savedName).toBe('নাবিলা র.');
    expect(savedPhoto).toBe('');
    expect(extra).toMatchObject({ phoneNumber: '01911222333', target: 'Engineering', hscBatch: 'HSC 2026', department: 'Science', college: 'ঢাকা কলেজ' });
    expect(toast.showToast).toHaveBeenCalledWith('প্রোফাইল আপডেট হয়েছে', 'success');
    await flush(500);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it('opens the sheet straight away for ?edit=1 (from the settings shortcut)', async () => {
    await mount('/profile?edit=1');
    await flush(300);
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain('প্রোফাইল এডিট');
  });

  it('navigates: subject → mock builder with the subject, gear → settings, logout → /auth', async () => {
    await mount();
    await click(Array.from(byLabel('বিষয়ভিত্তিক দক্ষতা')!.querySelectorAll('button')).find((b) => b.textContent?.includes('পদার্থবিজ্ঞান')));
    expect(lastLocation.pathname).toBe('/quiz');
    expect(lastLocation.state).toEqual({ subject: 'Physics' });

    await mount();
    await click(byLabel('সেটিংস'));
    expect(lastLocation.pathname).toBe('/settings');

    await mount();
    await click(byText('লগআউট'));
    await flush(50);
    expect(auth.logout).toHaveBeenCalled();
    expect(lastLocation.pathname).toBe('/auth');
  });

  it('redirects the retired tabs to their own pages', async () => {
    await mount('/profile?tab=MISTAKES');
    expect(lastLocation.pathname).toBe('/wrong-questions');
    await mount('/profile?tab=SAVED');
    expect(lastLocation.pathname).toBe('/saved-questions');
    await mount('/profile?tab=HISTORY');
    expect(lastLocation.pathname).toBe('/history');
  });

  it('paints from the session cache and still shows a friendly note when the API is down', async () => {
    cache.store.set('dashboard_u1', { stats: STATS, leaderboard: BOARD });
    api.fetchUserStatsAPI.mockRejectedValue(new Error('offline'));
    api.fetchLeaderboardAPI.mockRejectedValue(new Error('offline'));
    await mount();
    expect(body()).toContain('১,২৫০');
    expect(body()).not.toContain('পরিসংখ্যান আনা যায়নি');

    cache.store.clear();
    await mount();
    expect(body()).toContain('পরিসংখ্যান আনা যায়নি');
    expect(body()).toContain('মক টেস্ট দাও'); // empty-state CTA
  });
});

describe('ProfilePage — someone else', () => {
  it('shows their public card with a challenge button and hides private details', async () => {
    await mount('/profile/u2');
    expect(api.fetchUserStatsAPI).toHaveBeenCalledWith('u2');
    const text = body();
    expect(text).toContain('তানভীর আহমেদ');
    expect(text).toContain('নটর ডেম কলেজ');
    expect(text).toContain('HSC ২০২৬ · বিজ্ঞান · ইঞ্জিনিয়ারিং');
    expect(text).not.toContain('secret@example.com');
    expect(text).not.toContain('01999999999');
    expect(text).not.toContain('নাবিলা রহমান');
    expect(byText('এডিট')).toBeUndefined();
    expect(byLabel('পড়াশোনার তথ্য')).toBeNull();
    expect(byLabel('আমার কোর্স')).toBeNull();
    expect(byLabel('সংখ্যায় অগ্রগতি')?.textContent).toContain('৯৮০');

    await click(byText('চ্যালেঞ্জ করো'));
    expect(lastLocation.pathname).toBe('/battle');
    expect(lastLocation.state).toMatchObject({ opponent: { uid: 'u2', name: 'তানভীর আহমেদ' } });
  });
});

describe('ProfilePage — settings', () => {
  it('renders theme, question text, account and policy controls and wires them up', async () => {
    await mount('/settings');
    const text = body();
    expect(text).toContain('সেটিংস');
    expect(text).toContain('nabila@example.com');
    expect(text).toContain('017 1234 5678');

    await click(Array.from(byLabel('থিম বেছে নাও')!.querySelectorAll('button')).find((b) => b.getAttribute('aria-label') === 'ডার্ক'));
    expect(setTheme).toHaveBeenCalledWith('dark');

    await click(Array.from(byLabel('ফন্ট বেছে নাও')!.querySelectorAll('button')).find((b) => b.getAttribute('aria-label') === 'নোটো সান্স'));
    expect(prefs.setQuestionFont).toHaveBeenCalledWith('font-noto');
    await click(Array.from(byLabel('আকার বেছে নাও')!.querySelectorAll('button')).find((b) => b.textContent?.includes('আরও বড়')));
    expect(prefs.setQuestionFontSize).toHaveBeenCalledWith('text-xl');

    await click(byText('পাসওয়ার্ড বদলাও'));
    await flush(50);
    expect(fb.sendPasswordResetEmail).toHaveBeenCalledWith({}, 'nabila@example.com');
    expect(body()).toContain('রিসেট লিংক ইমেইলে পাঠানো হয়েছে');

    await click(byText('প্রাইভেসি পলিসি'));
    expect(lastLocation.pathname).toBe('/privacy');

    await mount('/settings');
    await click(byText('প্রোফাইল এডিট'));
    expect(lastLocation.pathname).toBe('/profile');
    expect(lastLocation.search).toBe('?edit=1');
  });

  it('hides the password row for Google-only accounts and answers the legacy ?tab=SETTINGS link', async () => {
    auth.state = { ...auth.state, currentUser: { ...USER, providerData: [{ providerId: 'google.com' }] } };
    await mount('/profile?tab=SETTINGS');
    expect(body()).toContain('প্রশ্নের লেখা');
    expect(byText('পাসওয়ার্ড বদলাও')).toBeUndefined();
  });
});
