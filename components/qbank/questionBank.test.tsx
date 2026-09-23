import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import type { QuizQuestion } from '../../types';

/*
 * Render-level behaviour of the question bank: the institution catalogue
 * built from exam refs, solving a paper with live records, reading mode,
 * launching an exam, the chapter browser and the records screen.
 */

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const api = vi.hoisted(() => ({
  fetchQuestionBankExamRefsAPI: vi.fn(),
  fetchQuestionsByExamRefAPI: vi.fn(),
  fetchQuestionsFromBankAPI: vi.fn(),
  fetchSyllabusStatsAPI: vi.fn(),
  fetchSavedQuestionsAPI: vi.fn(),
  saveQuestionAPI: vi.fn(),
  unsaveQuestionAPI: vi.fn(),
  saveExamResultAPI: vi.fn(),
  recordUserActivityAPI: vi.fn(),
  updateQuestProgressAPI: vi.fn(),
}));
const firestore = vi.hoisted(() => ({ addDoc: vi.fn(), getDocs: vi.fn() }));
const toast = vi.hoisted(() => ({ showToast: vi.fn() }));

vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => ({ currentUser: { uid: 'u1', displayName: 'নাবিলা' } }) }));
vi.mock('../../contexts/CacheContext', () => ({ useCache: () => ({ getCache: () => null, setCache: () => undefined, clearCache: () => undefined }) }));
vi.mock('../../contexts/PreferencesContext', () => ({ usePreferences: () => ({ questionFont: 'font-noto', questionFontSize: 'text-base' }) }));
vi.mock('../Toast', () => ({ useToast: () => toast }));
vi.mock('../../services/api', () => api);
vi.mock('../../services/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  addDoc: firestore.addDoc,
  getDocs: firestore.getDocs,
  collection: () => ({}),
  query: () => ({}),
  where: () => ({}),
}));

import QuestionBank from '../QuestionBank';
import { resetDataCaches } from './data';

const REFS = ["DU-A '23-24", "DU-B '23-24", "DU-A '22-23", "Medical '23-24", 'BUET 2023'];

const question = (i: number, extra: Partial<QuizQuestion> = {}): QuizQuestion => ({
  _id: `${i}`.padStart(24, 'c'),
  question: `Question number ${i}`,
  options: ['Alpha', 'Beta', 'Gamma', 'Delta'],
  correctAnswerIndex: i % 4,
  explanation: `Because ${i}`,
  subject: i % 2 ? 'Physics' : 'Chemistry',
  chapter: i % 2 ? 'ভেক্টর' : 'গুণগত রসায়ন',
  orderIndex: i,
  ...extra,
});
const PAPER = Array.from({ length: 12 }, (_, i) => question(i + 1, { examRef: "DU-A '23-24" }));

let lastLocation = { pathname: '', search: '' };
const Probe = () => {
  const loc = useLocation();
  lastLocation = { pathname: loc.pathname, search: loc.search };
  return null;
};

const click = (el: Element | undefined | null) => {
  if (!el) throw new Error('element not found');
  return act(async () => {
    (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
};
const buttons = () => Array.from(document.querySelectorAll('button'));
const byText = (text: string) => buttons().find((b) => (b.textContent || '').trim().includes(text));
const body = () => document.body.textContent || '';
const flush = (ms = 40) => act(() => new Promise<void>((r) => setTimeout(r, ms)));
const cards = () => Array.from(document.querySelectorAll('[data-testid="qbank-question"]'));
const option = (card: Element, index: number) => card.querySelector('[role="group"]')!.querySelectorAll('button')[index];

let root: Root | null = null;
const mount = async (url: string) => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () =>
    root!.render(
      <MemoryRouter initialEntries={[url]}>
        <Probe />
        <Routes>
          <Route path="/qbank" element={<QuestionBank />} />
          <Route path="*" element={<p>ELSEWHERE</p>} />
        </Routes>
      </MemoryRouter>,
    ),
  );
  await flush();
};

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  resetDataCaches();
  api.fetchQuestionBankExamRefsAPI.mockReset().mockResolvedValue(REFS);
  api.fetchQuestionsByExamRefAPI.mockReset().mockResolvedValue(PAPER);
  api.fetchQuestionsFromBankAPI.mockReset().mockImplementation(async (page: number) => ({
    questions: Array.from({ length: 25 }, (_, i) => question((page - 1) * 25 + i + 1, { examRef: 'GST 2022' })),
    total: 96,
  }));
  api.fetchSyllabusStatsAPI.mockReset().mockResolvedValue({ 'Physics 1st Paper': { total: 1240, chapters: { ভেক্টর: { total: 96 } } } });
  api.fetchSavedQuestionsAPI.mockReset().mockResolvedValue([{ questionId: { _id: PAPER[1]._id } }]);
  api.saveQuestionAPI.mockReset().mockResolvedValue({ status: 'SAVED' });
  api.unsaveQuestionAPI.mockReset().mockResolvedValue({ success: true });
  api.saveExamResultAPI.mockReset().mockResolvedValue({ success: true });
  api.recordUserActivityAPI.mockReset().mockResolvedValue({ success: true, streak: 3, streakUpdated: true });
  api.updateQuestProgressAPI.mockReset().mockResolvedValue({ success: true });
  firestore.addDoc.mockReset().mockResolvedValue({ id: 'doc' });
  firestore.getDocs.mockReset().mockResolvedValue({ forEach: () => undefined });
  toast.showToast.mockReset();
});

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = null;
  document.body.innerHTML = '';
});

describe('QuestionBank home', () => {
  it('builds the institution catalogue from the exam refs', async () => {
    await mount('/qbank');
    expect(body()).toContain('প্রশ্নব্যাংক');
    expect(body()).toContain('ঢাকা বিশ্ববিদ্যালয়');
    expect(body()).toContain('৩টি'); // three DU papers
    expect(body()).toContain('মেডিকেল ভর্তি পরীক্ষা (MBBS)');
    expect(body()).toContain('গুচ্ছ ভর্তি পরীক্ষা'); // bundled paper shows even though the API has none
    expect(api.fetchQuestionBankExamRefsAPI).toHaveBeenCalledWith('ADMISSION');
    await click(byText('ঢাকা বিশ্ববিদ্যালয়'));
    expect(lastLocation.search).toBe('?institution=du');
    expect(body()).toContain('২০২৩-২৪');
    expect(body()).toContain('খ ইউনিট');
    await click(Array.from(document.querySelectorAll('button[aria-label]')).find((b) => b.getAttribute('aria-label') === 'ক ইউনিট ২০২৩-২৪'));
    expect(lastLocation.search).toContain('examRef=DU-A');
  });

  it('switches tabs through the URL and shows subject tiles with counts', async () => {
    await mount('/qbank?level=ACADEMIC');
    expect(body()).toContain('বোর্ড ও কলেজের প্রশ্ন');
    expect(body()).toContain('১,২৪০ প্রশ্ন');
    expect(body()).not.toContain('প্রতিষ্ঠান অনুযায়ী');
    await click(byText('পদার্থবিজ্ঞান'));
    expect(lastLocation.search).toContain('level=ACADEMIC');
    expect(lastLocation.search).toContain('subject=Physics+1st+Paper');
  });
});

describe('solving a paper', () => {
  it('locks a question after one attempt, keeps live counts and records the sitting', async () => {
    await mount(`/qbank?examRef=${encodeURIComponent("DU-A '23-24")}`);
    expect(api.fetchQuestionsByExamRefAPI).toHaveBeenCalledWith("DU-A '23-24");
    expect(body()).toContain('ক ইউনিট · ২০২৩-২৪');
    expect(body()).toContain('১২ প্রশ্ন');
    expect(cards()).toHaveLength(12);
    expect(body()).not.toContain('শেষ করো');

    await click(option(cards()[0], 1)); // Q1 correct (1 % 4)
    expect(body()).toContain('সঠিক!');
    expect(body()).toContain('Because 1');
    expect((option(cards()[0], 2) as HTMLButtonElement).disabled).toBe(true);
    await click(option(cards()[1], 0)); // Q2 wrong (correct = 2)
    expect(body()).toContain('ভুল — সঠিক উত্তর গ');
    expect(body()).toContain('শেষ করো');

    const store = JSON.parse(localStorage.getItem('pk_qbank_progress_v1:u1') || '{}');
    expect(store.pending.items).toHaveLength(2);
    expect(store.marks[PAPER[0]._id!]).toMatchObject({ r: 1, n: 1 });
    expect(store.marks[PAPER[1]._id!]).toMatchObject({ r: 0, n: 1 });
    expect(store.sources[`paper:DU-A '23-24`]).toMatchObject({ answered: 2, correct: 1, total: 12 });

    // The mark filter reflects the sitting.
    await click(byText('ভুল করা'));
    expect(cards()).toHaveLength(1);
    expect(body()).toContain('Question number 2');
    await click(byText('সব'));

    // Finishing a short sitting stays on the device.
    await click(byText('শেষ করো'));
    expect(body()).toContain('সঠিকতা');
    expect(body()).toContain('৫টির কম উত্তর');
    expect(api.saveExamResultAPI).not.toHaveBeenCalled();
    const closed = JSON.parse(localStorage.getItem('pk_qbank_progress_v1:u1') || '{}');
    expect(closed.pending).toBeNull();
    expect(closed.sessions).toHaveLength(1);
  });

  it('mirrors a longer sitting to the backend as a practice result', async () => {
    await mount(`/qbank?examRef=${encodeURIComponent("DU-A '23-24")}`);
    for (let i = 0; i < 5; i++) await click(option(cards()[i], (i + 1) % 4));
    await click(byText('শেষ করো'));
    await flush(60);
    expect(api.saveExamResultAPI).toHaveBeenCalledTimes(1);
    const [uid, payload] = api.saveExamResultAPI.mock.calls[0];
    expect(uid).toBe('u1');
    expect(payload).toMatchObject({ totalQuestions: 5, correct: 5, wrong: 0, config: { type: 'QBANK_PRACTICE', mode: 'PRACTICE' } });
    expect(payload.config.title).toContain('ঢাকা বিশ্ববিদ্যালয়');
    expect(api.recordUserActivityAPI).toHaveBeenCalledWith('u1');
    expect(firestore.addDoc).toHaveBeenCalledTimes(1);
    expect(api.updateQuestProgressAPI).not.toHaveBeenCalled(); // under the 10-answer quest threshold
    expect(body()).toContain('রেকর্ড সেভ হয়েছে');
    const store = JSON.parse(localStorage.getItem('pk_qbank_progress_v1:u1') || '{}');
    expect(store.sessions[0].synced).toBe(true);
  });

  it('remembers earlier marks and offers the wrong ones again', async () => {
    localStorage.setItem(
      'pk_qbank_progress_v1:u1',
      JSON.stringify({
        v: 1,
        marks: { [PAPER[2]._id!]: { r: 0, t: 1, n: 1, a: 0 }, [PAPER[3]._id!]: { r: 1, t: 1, n: 1, a: 0 } },
        sessions: [],
        sources: {},
        pending: null,
      }),
    );
    await mount(`/qbank?examRef=${encodeURIComponent("DU-A '23-24")}`);
    expect(body()).toContain('এখানে ১টি প্রশ্নে আগে ভুল করেছিলে');
    expect(body()).toContain('২ সমাধান');
    await click(byText('দেখাও'));
    expect(cards()).toHaveLength(1);
    expect(body()).toContain('Question number 3');
  });

  it('reading mode reveals every answer and disables answering', async () => {
    await mount(`/qbank?examRef=${encodeURIComponent("DU-A '23-24")}`);
    await click(Array.from(document.querySelectorAll('button[title]')).find((b) => b.getAttribute('title') === 'সব উত্তর দেখাও'));
    expect(body()).toContain('পড়ার মোড');
    expect(cards().every((c) => Array.from(c.querySelectorAll('[role="group"] button')).every((b) => (b as HTMLButtonElement).disabled))).toBe(true);
    expect(body().match(/Because \d+/g)?.length).toBe(12);
    expect(localStorage.getItem('pk_qbank_progress_v1:u1') ?? '{}').not.toContain('"pending":{');
  });

  it('bookmarks through the saved-questions API', async () => {
    await mount(`/qbank?examRef=${encodeURIComponent("DU-A '23-24")}`);
    const saved = cards()[1].querySelector('button[aria-label="বুকমার্ক সরাও"]');
    expect(saved).not.toBeNull();
    await click(cards()[0].querySelector('button[aria-label="প্রশ্নটি বুকমার্ক করো"]'));
    expect(api.saveQuestionAPI).toHaveBeenCalledWith('u1', PAPER[0]._id);
    expect(toast.showToast).toHaveBeenCalledWith('প্রশ্নটি বুকমার্ক হয়েছে', 'success');
  });

  it('launches a timed exam over the paper with institution defaults', async () => {
    await mount(`/qbank?examRef=${encodeURIComponent("DU-A '23-24")}`);
    await click(byText('পরীক্ষা'));
    expect(body()).toContain('পরীক্ষা দাও');
    expect(body()).toContain('সব (১২)');
    expect(body()).toContain('১০ মিনিট'); // 12 × 0.75 rounded up to 5
    expect(body()).toContain('−০.২৫');
    await click(byText('১২টি প্রশ্নে পরীক্ষা শুরু করো'));
    expect(lastLocation.pathname).toMatch(/^\/exam\/qbank_exam_/);
    const key = Object.keys(localStorage).find((k) => k.startsWith('exam_config_qbank_exam_'))!;
    const config = JSON.parse(localStorage.getItem(key)!);
    expect(config).toMatchObject({ type: 'QBANK_EXAM', mode: 'ALL_AT_ONCE', timeLimit: 10, negativeMarking: 0.25, examRef: "DU-A '23-24" });
    expect(config.questions.map((q: QuizQuestion) => q.question)).toEqual(PAPER.map((q) => q.question));
    expect(config.qbankSource).toMatchObject({ kind: 'exam', id: "DU-A '23-24" });
  });

  it('serves the bundled paper offline', async () => {
    await mount('/qbank?examRef=gst_a_23_24');
    await flush(200);
    expect(api.fetchQuestionsByExamRefAPI).not.toHaveBeenCalled();
    expect(body()).toContain('গুচ্ছ ভর্তি পরীক্ষা');
    expect(body()).toContain('১৪৭ প্রশ্ন');
    expect(cards().length).toBeGreaterThan(100);
    expect(document.querySelector('button[aria-label="প্রশ্নটি বুকমার্ক করো"]')).toBeNull();
  });
});

describe('subject browser', () => {
  it('lists chapters with counts and pages through the bank', async () => {
    await mount('/qbank?level=ACADEMIC&subject=Physics%201st%20Paper');
    expect(body()).toContain('পদার্থবিজ্ঞান ১ম পত্র');
    expect(body()).toContain('সব অধ্যায় মিলিয়ে');
    expect(body()).toContain('৯৬ প্রশ্ন');
    await click(byText('ভেক্টর'));
    expect(lastLocation.search).toContain('chapter=');
    expect(api.fetchQuestionsFromBankAPI).toHaveBeenLastCalledWith(
      1,
      25,
      'Physics 1st Paper',
      'ভেক্টর',
      undefined,
      undefined,
      undefined,
      'ACADEMIC',
      undefined,
      undefined,
      false,
      undefined,
    );
    expect(body()).toContain('৯৬ প্রশ্ন · ২৫টি লোড হয়েছে');
    expect(cards()).toHaveLength(25);
    expect(body()).toContain('GST 2022'); // source chip in bank views

    await click(byText('বোর্ড'));
    expect(api.fetchQuestionsFromBankAPI).toHaveBeenLastCalledWith(
      1,
      25,
      'Physics 1st Paper',
      'ভেক্টর',
      undefined,
      undefined,
      undefined,
      'ACADEMIC',
      'ANY',
      undefined,
      false,
      undefined,
    );
    await click(byText('ঢাকা'));
    expect(api.fetchQuestionsFromBankAPI).toHaveBeenLastCalledWith(
      1,
      25,
      'Physics 1st Paper',
      'ভেক্টর',
      undefined,
      undefined,
      undefined,
      'ACADEMIC',
      'DB',
      undefined,
      false,
      undefined,
    );

    await click(byText('আরও প্রশ্ন দেখাও'));
    expect(api.fetchQuestionsFromBankAPI).toHaveBeenLastCalledWith(
      2,
      25,
      'Physics 1st Paper',
      'ভেক্টর',
      undefined,
      undefined,
      undefined,
      'ACADEMIC',
      'DB',
      undefined,
      false,
      undefined,
    );
    expect(cards()).toHaveLength(50);
  });

  it('searches the bank from the home screen', async () => {
    await mount('/qbank');
    const input = document.querySelector('input[type="search"]') as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    await act(async () => {
      setter.call(input, 'নিউটন');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => {
      input.form!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    expect(lastLocation.search).toContain('q=');
    expect(api.fetchQuestionsFromBankAPI).toHaveBeenLastCalledWith(
      1,
      25,
      undefined,
      undefined,
      undefined,
      undefined,
      'নিউটন',
      undefined,
      undefined,
      undefined,
      false,
      undefined,
    );
    expect(body()).toContain('খোঁজার ফলাফল');
  });
});

describe('records', () => {
  it('shows totals, sources and sessions from the store', async () => {
    const now = Date.now();
    localStorage.setItem(
      'pk_qbank_progress_v1:u1',
      JSON.stringify({
        v: 1,
        marks: { a: { r: 1, t: now, n: 1, a: 0 }, b: { r: 0, t: now, n: 1, a: 0 }, c: { r: 1, t: now, n: 1, a: 0 }, d: { r: 1, t: now, n: 1, a: 0 } },
        sessions: [
          {
            id: 's1',
            startedAt: now - 300_000,
            endedAt: now - 60_000,
            source: { kind: 'paper', id: "DU-A '23-24", title: 'ঢাকা বিশ্ববিদ্যালয় · ক ইউনিট · ২০২৩-২৪' },
            items: [
              { k: 'a', a: 0, c: 1, s: 'Physics' },
              { k: 'b', a: 0, c: 0, s: 'Physics' },
            ],
          },
        ],
        sources: {
          "paper:DU-A '23-24": { title: 'ঢাকা বিশ্ববিদ্যালয় · ক ইউনিট · ২০২৩-২৪', kind: 'paper', answered: 4, correct: 3, total: 60, lastAt: now - 60_000 },
        },
        pending: null,
      }),
    );
    await mount('/qbank?view=records');
    expect(body()).toContain('তোমার রেকর্ড');
    expect(body()).toContain('৭৫%');
    expect(body()).toContain('৪/৬০ সমাধান');
    expect(body()).toContain('১/২ সঠিক · ৪ মিনিট');
    await click(byText('ঢাকা বিশ্ববিদ্যালয় · ক ইউনিট'));
    expect(lastLocation.search).toContain('examRef=DU-A');
  });

  it('closes an open sitting that went stale and imports remote attempts', async () => {
    const old = Date.now() - 2 * 3600_000;
    localStorage.setItem(
      'pk_qbank_progress_v1:u1',
      JSON.stringify({
        v: 1,
        marks: { x: { r: 1, t: old, n: 1, a: 1 } },
        sessions: [],
        sources: {},
        pending: { id: 'p1', startedAt: old - 60_000, endedAt: old, source: { kind: 'paper', id: 'R', title: 'পুরনো' }, items: [{ k: 'x', a: 1, c: 1 }] },
      }),
    );
    firestore.getDocs.mockResolvedValue({
      forEach: (fn: (d: { data: () => unknown }) => void) =>
        fn({
          data: () => ({
            examId: 'qbank_remote9',
            timestamp: old,
            userAnswers: [2],
            questions: [{ _id: PAPER[4]._id, subject: 'Physics', correctAnswerIndex: 1 }],
            config: { type: 'QBANK_PRACTICE', title: 'অন্য ডিভাইস', qbankSource: { kind: 'paper', id: 'R2', title: 'অন্য ডিভাইস' } },
          }),
        }),
    });
    await mount('/qbank?view=records');
    const store = JSON.parse(localStorage.getItem('pk_qbank_progress_v1:u1') || '{}');
    expect(store.pending).toBeNull();
    expect(store.sessions.map((s: { id: string }) => s.id).sort()).toEqual(['p1', 'remote9']);
    expect(store.marks[PAPER[4]._id!]).toMatchObject({ r: 0 });
    expect(body()).toContain('অন্য ডিভাইস');
    expect(body()).toContain('পুরনো');
  });
});
