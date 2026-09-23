import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { QuizQuestion } from '../../types';

/*
 * End-to-end behaviour of the exam player (/exam/:id): bootstrap from a launch
 * config, answering + submitting, time-out auto-submit with the *latest*
 * answers, session resume, the public-exam guest gate and the result screen.
 */

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const auth = vi.hoisted(() => ({ state: { currentUser: null as null | { uid: string; displayName: string; email: string }, loginWithGoogle: vi.fn() } }));
const api = vi.hoisted(() => ({
  fetchExamResultAPI: vi.fn(async () => null as unknown),
  fetchSavedQuestionsAPI: vi.fn(async () => [] as unknown[]),
  saveExamResultAPI: vi.fn(async () => ({})),
  updateQuestProgressAPI: vi.fn(async () => ({})),
  saveQuestionAPI: vi.fn(async () => ({})),
  unsaveQuestionAPI: vi.fn(async () => ({})),
  fetchQuestionsByExamRefAPI: vi.fn(async () => []),
  recordUserActivityAPI: vi.fn(async () => ({ success: true, streakUpdated: false })),
  clearMistakesAPI: vi.fn(async () => ({})),
  generateQuizFromDB: vi.fn(async () => []),
  fetchQuestionPapersAPI: vi.fn(async () => []),
  syncUserToMongoDB: vi.fn(async () => ({})),
}));
const publicApi = vi.hoisted(() => ({
  fetchPublicExam: vi.fn(async () => null as unknown),
  fetchPublicExamLeaderboard: vi.fn(async () => []),
  getUserRank: vi.fn(async () => null),
  submitGuestExamResult: vi.fn(async () => ({})),
}));
const toast = vi.hoisted(() => ({ showToast: vi.fn() }));

vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => auth.state }));
vi.mock('../../contexts/CacheContext', () => ({ useCache: () => ({ clearCache: vi.fn(), getCache: vi.fn(), setCache: vi.fn() }) }));
vi.mock('../../contexts/PreferencesContext', () => ({
  usePreferences: () => ({ questionFont: 'font-noto', questionFontSize: 'text-base', setQuestionFont: vi.fn(), setQuestionFontSize: vi.fn() }),
}));
vi.mock('../Toast', () => ({ useToast: () => toast }));
vi.mock('../../services/api', () => api);
vi.mock('../../services/publicExamService', () => publicApi);
vi.mock('../../services/firebase', () => ({ auth: {}, db: {}, googleProvider: {} }));
vi.mock('firebase/firestore', () => ({ addDoc: vi.fn(async () => ({ id: 'doc' })), collection: vi.fn() }));
vi.mock('firebase/auth', () => ({ createUserWithEmailAndPassword: vi.fn(), signInWithEmailAndPassword: vi.fn(), updateProfile: vi.fn() }));
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

import ExamPage from '../ExamPage';

const USER = { uid: 'u1', displayName: 'নাঈম', email: 'naim@example.com' };
const OPTIONS = ['লাল', 'নীল', 'সবুজ', 'হলুদ'];

const makeQuestions = (n: number): QuizQuestion[] =>
  Array.from({ length: n }, (_, i) => ({
    _id: `q${i + 1}`,
    question: `ভেক্টর প্রশ্ন ${i + 1}`,
    options: OPTIONS,
    correctAnswerIndex: i % 4,
    explanation: `ব্যাখ্যা ${i + 1}`,
    subject: 'Physics 1st Paper',
    chapter: i < 2 ? 'ভেক্টর' : 'গতিবিদ্যা',
  }));

const click = (el: Element | undefined | null) => {
  if (!el) throw new Error('element not found');
  return act(async () => {
    (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
};
const buttons = () => Array.from(document.querySelectorAll('button'));
const byText = (text: string) => buttons().find((b) => (b.textContent || '').includes(text));
const body = () => document.body.textContent || '';
const wait = (ms: number) => act(() => new Promise<void>((r) => setTimeout(r, ms)));
const flush = () => wait(40);

let root: Root | null = null;
const mount = async (examId: string) => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () =>
    root!.render(
      <MemoryRouter initialEntries={['/quiz', `/exam/${examId}`]} initialIndex={1}>
        <Routes>
          <Route path="/exam/:examId" element={<ExamPage />} />
          <Route path="/quiz" element={<p>BUILDER</p>} />
          <Route path="/dashboard" element={<p>DASHBOARD</p>} />
          <Route path="/auth" element={<p>AUTH</p>} />
        </Routes>
      </MemoryRouter>,
    ),
  );
  await flush();
};

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  auth.state.currentUser = USER;
  api.fetchExamResultAPI.mockResolvedValue(null);
  publicApi.fetchPublicExam.mockResolvedValue(null);
});

afterEach(async () => {
  if (root) {
    await act(async () => root!.unmount());
    root = null;
  }
  document.body.innerHTML = '';
});

describe('ExamPage', () => {
  it('runs a single-page exam from the launch config through to the result', async () => {
    localStorage.setItem(
      'exam_config_e1',
      JSON.stringify({
        questions: makeQuestions(3),
        timeLimit: 10,
        negativeMarking: 0.25,
        mode: 'SINGLE_PAGE',
        title: 'পদার্থবিজ্ঞান · ভেক্টর',
        isPracticeMode: false,
        shuffle: false,
      }),
    );
    await mount('e1');

    expect(body()).toContain('ভেক্টর প্রশ্ন 1');
    expect(body()).toContain('নেগেটিভ −০.২৫');

    // Q1: correct (index 0)
    await click(byText('লাল'));
    await flush();
    expect(byText('লাল')?.getAttribute('aria-pressed')).toBe('true');
    await click(byText('পরের প্রশ্ন'));
    await wait(600);
    expect(body()).toContain('ভেক্টর প্রশ্ন 2');

    // Q2: wrong (correct is 1)
    await click(byText('হলুদ'));
    await flush();
    await click(byText('পরের প্রশ্ন'));
    await wait(600);
    expect(body()).toContain('ভেক্টর প্রশ্ন 3');

    // Q3 skipped → finish
    await click(byText('পরীক্ষা শেষ করো'));
    await flush();
    expect(body()).toContain('১ টি প্রশ্ন এখনো বাকি');
    await click(byText('হ্যাঁ, জমা দাও'));
    await wait(120);

    expect(api.saveExamResultAPI).toHaveBeenCalledTimes(1);
    const payload = (api.saveExamResultAPI.mock.calls[0] as unknown[])[1] as Record<string, unknown>;
    expect(payload).toMatchObject({ examId: 'e1', correct: 1, wrong: 1, skipped: 1, score: 0.75, totalQuestions: 3 });
    expect(body()).toContain('পরীক্ষার ফলাফল');
    expect(body()).toContain('০.৭৫');
    expect(localStorage.getItem('exam_progress_u1_e1')).toBeNull();
    // review shows the explanation + verdict chips
    expect(body()).toContain('ব্যাখ্যা 2');
    expect(body()).toContain('তোমার উত্তর');
  });

  it('auto-submits at time-out with the answers given after the clock started, and resumes a session', async () => {
    localStorage.setItem(
      'exam_progress_u1_e2',
      JSON.stringify({
        config: { timeLimit: 1, negativeMarking: 0, mode: 'SINGLE_PAGE', title: 'রিজিউম টেস্ট' },
        questions: makeQuestions(2),
        userAnswers: [null, null],
        currentQIndex: 1,
        savedIndices: [],
        flaggedIndices: [0],
        expiryTime: Date.now() + 1900,
        duration: 12,
      }),
    );
    await mount('e2');

    // resumed at question 2 with question 1 flagged (visible in the palette legend)
    expect(body()).toContain('ভেক্টর প্রশ্ন 2');
    await click(byText('২ / ২'));
    await flush();
    expect(body()).toContain('পরে দেখব ১');
    await click(buttons().find((b) => b.getAttribute('aria-label') === 'বন্ধ করো'));
    await wait(300);

    // answer Q2 correctly (index 1) *after* the timer effect was set up
    await click(byText('নীল'));
    await flush();

    await wait(2600);

    expect(api.saveExamResultAPI).toHaveBeenCalledTimes(1);
    const payload = (api.saveExamResultAPI.mock.calls[0] as unknown[])[1] as Record<string, unknown>;
    expect(payload).toMatchObject({ correct: 1, wrong: 0, skipped: 1 });
    expect(toast.showToast).toHaveBeenCalledWith(expect.stringContaining('সময় শেষ'), 'info');
    expect(body()).toContain('পরীক্ষার ফলাফল');
  });

  it('shows the sign-in gate to guests opening a public exam link', async () => {
    auth.state.currentUser = null;
    publicApi.fetchPublicExam.mockResolvedValue({
      title: 'সাপ্তাহিক লাইভ মক',
      subject: 'Physics',
      duration: 20,
      totalMarks: 20,
      negativeMarking: 0.25,
      questions: makeQuestions(2),
    });
    await mount('pub1');

    expect(body()).toContain('লাইভ পরীক্ষা');
    expect(body()).toContain('সাপ্তাহিক লাইভ মক');
    expect(body()).toContain('২০ মিনিট');
    expect(byText('লগইন করে পরীক্ষা শুরু করো')).toBeTruthy();
    await click(byText('নতুন অ্যাকাউন্ট'));
    await flush();
    expect(byText('অ্যাকাউন্ট খুলে শুরু করো')).toBeTruthy();
  });

  it('opens straight into the result for an already-submitted exam and filters the review', async () => {
    api.fetchExamResultAPI.mockResolvedValue({
      config: { mode: 'ALL_AT_ONCE', negativeMarking: 0 },
      questions: makeQuestions(4),
      userAnswers: [0, 0, 2, null],
    });
    await mount('e3');

    expect(body()).toContain('পরীক্ষার ফলাফল');
    expect(body()).toContain('অধ্যায়ভিত্তিক বিশ্লেষণ');
    expect(body()).toContain('গতিবিদ্যা');
    expect(api.saveExamResultAPI).not.toHaveBeenCalled();

    await click(byText('ভুলগুলো দেখো'));
    await flush();
    expect(body()).toContain('ভেক্টর প্রশ্ন 2');
    expect(body()).not.toContain('ভেক্টর প্রশ্ন 1');
    expect(body()).not.toContain('ভেক্টর প্রশ্ন 3');
  });

  it('reveals the answer immediately in practice mode and locks the question', async () => {
    localStorage.setItem(
      'exam_config_e4',
      JSON.stringify({ questions: makeQuestions(2), timeLimit: 0, negativeMarking: 0, mode: 'ALL_AT_ONCE', title: 'প্র্যাকটিস', isPracticeMode: true }),
    );
    await mount('e4');

    expect(body()).toContain('প্র্যাকটিস মোড');
    expect(body()).toContain('ভেক্টর প্রশ্ন 2');
    expect(body()).not.toContain('ব্যাখ্যা 1');

    await click(byText('হলুদ')); // wrong for Q1 (correct: লাল)
    await flush();
    expect(body()).toContain('ব্যাখ্যা 1');
    expect(byText('হলুদ')?.hasAttribute('disabled')).toBe(true);
    expect(body()).not.toContain('ব্যাখ্যা 2');
  });
});
