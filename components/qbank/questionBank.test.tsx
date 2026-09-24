import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import type { QuizQuestion } from '../../types';

/*
 * Render-level behaviour of the question bank: the level/subject/chapter
 * browser, solving a chapter with live records, the sticky mark filters,
 * লাইভ কুইজ, reading mode, launching an exam, MathJax typesetting and the
 * records screen.
 */

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const api = vi.hoisted(() => ({
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
import { chaptersOf } from '../quiz/catalog';
import { resetDataCaches } from './data';

const SUBJECT = 'Physics 1st Paper';
const CHAPTER = 'ভেক্টর';
/** A second chapter, taken from the syllabus so its spelling matches the picker. */
const OTHER = chaptersOf(SUBJECT)[2];
const CHAPTER_URL = `/qbank?level=ADMISSION&subject=${encodeURIComponent(SUBJECT)}&chapter=${encodeURIComponent(CHAPTER)}`;
const CHAPTER_SOURCE = `chapter:ADMISSION|${SUBJECT}|${CHAPTER}`;

const question = (i: number, extra: Partial<QuizQuestion> = {}): QuizQuestion => ({
  _id: `${i}`.padStart(24, 'c'),
  question: `Question number ${i}`,
  options: ['Alpha', 'Beta', 'Gamma', 'Delta'],
  correctAnswerIndex: i % 4,
  explanation: `Because ${i}`,
  subject: SUBJECT,
  chapter: CHAPTER,
  examRef: i % 2 ? "DU-A '23-24" : 'GST 2022',
  orderIndex: i,
  ...extra,
});
/** The chapter fixture: 12 questions, fits in one page. */
const CHAPTER_Q = Array.from({ length: 12 }, (_, i) => question(i + 1));

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
const key = (k: string) => act(async () => window.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true })));
const buttons = () => Array.from(document.querySelectorAll('button'));
const byText = (text: string) => buttons().find((b) => (b.textContent || '').trim().includes(text));
const body = () => document.body.textContent || '';
const flush = (ms = 40) => act(() => new Promise<void>((r) => setTimeout(r, ms)));
const cards = () => Array.from(document.querySelectorAll('[data-testid="qbank-question"]'));
const option = (card: Element, index: number) => card.querySelector('[role="group"]')!.querySelectorAll('button')[index];
const progress = () => JSON.parse(localStorage.getItem('pk_qbank_progress_v1:u1') || '{}');

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

/** Chapter fixture for ভেক্টর, a 96-question paged bank for everything else. */
const bankResponder = (page: number, _limit: number, _subject?: string, chapter?: string) => {
  if (chapter === CHAPTER) return Promise.resolve({ questions: page === 1 ? CHAPTER_Q : [], total: CHAPTER_Q.length });
  return Promise.resolve({
    questions: Array.from({ length: 25 }, (_, i) => question((page - 1) * 25 + i + 1, { chapter: OTHER })),
    total: 96,
  });
};

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  resetDataCaches();
  delete (window as { MathJax?: unknown }).MathJax;
  Element.prototype.scrollIntoView = vi.fn();
  api.fetchQuestionsFromBankAPI.mockReset().mockImplementation(bankResponder);
  api.fetchSyllabusStatsAPI
    .mockReset()
    .mockResolvedValue({ [SUBJECT]: { total: 1240, chapters: { [CHAPTER]: { total: 12 }, [OTHER]: { total: 96 } } } });
  api.fetchSavedQuestionsAPI.mockReset().mockResolvedValue([{ questionId: { _id: CHAPTER_Q[1]._id } }]);
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
  it('shows the level tabs and subject tiles, without any institution browsing', async () => {
    await mount('/qbank');
    expect(body()).toContain('প্রশ্নব্যাংক');
    expect(body()).toContain('বিষয় বেছে নাও');
    expect(body()).toContain('১,২৪০ প্রশ্ন');
    expect(body()).not.toContain('প্রতিষ্ঠান অনুযায়ী');
    expect(body()).not.toContain('ঢাকা বিশ্ববিদ্যালয়');
    expect(api.fetchSyllabusStatsAPI).toHaveBeenCalledWith('ADMISSION');
    await click(byText('পদার্থবিজ্ঞান'));
    expect(lastLocation.search).toBe('?level=ADMISSION&subject=Physics+1st+Paper');
    expect(body()).toContain('সব অধ্যায় মিলিয়ে');
    expect(body()).toContain('১২ প্রশ্ন');
  });

  it('switches tabs through the URL', async () => {
    await mount('/qbank?level=ACADEMIC');
    expect(body()).toContain('বোর্ড ও কলেজের প্রশ্ন');
    expect(api.fetchSyllabusStatsAPI).toHaveBeenCalledWith('ACADEMIC');
    await click(byText('অনুশীলনী'));
    expect(lastLocation.search).toBe('?level=MAINBOOK');
    expect(body()).toContain('পাঠ্যবইয়ের অনুশীলনী');
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

describe('solving a chapter', () => {
  it('locks a question after one attempt, keeps live counts and records the sitting', async () => {
    await mount(CHAPTER_URL);
    expect(body()).toContain('ভর্তি পরীক্ষা · পদার্থবিজ্ঞান ১ম পত্র');
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

    const store = progress();
    expect(store.pending.items).toHaveLength(2);
    expect(store.marks[CHAPTER_Q[0]._id!]).toMatchObject({ r: 1, n: 1 });
    expect(store.marks[CHAPTER_Q[1]._id!]).toMatchObject({ r: 0, n: 1 });
    expect(store.sources[CHAPTER_SOURCE]).toMatchObject({ answered: 2, correct: 1, total: 12, subject: SUBJECT });

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
    const closed = progress();
    expect(closed.pending).toBeNull();
    expect(closed.sessions).toHaveLength(1);
    expect(closed.sessions[0].source).toMatchObject({ kind: 'chapter', id: `ADMISSION|${SUBJECT}|${CHAPTER}` });
  });

  it('keeps an answered card on screen under the "বাকি" filter until the filter is re-applied', async () => {
    await mount(CHAPTER_URL);
    await click(byText('বাকি'));
    expect(cards()).toHaveLength(12);
    await click(option(cards()[0], 0)); // wrong (correct = 1)
    // Still there, with its verdict — nothing jumps away.
    expect(cards()).toHaveLength(12);
    expect(body()).toContain('ভুল — সঠিক উত্তর খ');
    expect(body()).toContain('বাকি১১'); // the chip count is live even though the card stays
    await click(byText('বাকি')); // re-apply
    expect(cards()).toHaveLength(11);
    expect(cards()[0].textContent).toContain('Question number 2');
  });

  it('offers "পরের প্রশ্ন" after an answer and scrolls to the next unanswered card', async () => {
    await mount(CHAPTER_URL);
    expect(byText('পরের প্রশ্ন')).toBeUndefined();
    await click(option(cards()[0], 1));
    await click(byText('পরের প্রশ্ন'));
    const scrolled = (Element.prototype.scrollIntoView as ReturnType<typeof vi.fn>).mock.instances[0] as Element;
    expect(scrolled.id).toBe(`qbank-q-${CHAPTER_Q[1]._id}`);
  });

  it('mirrors a longer sitting to the backend as a practice result', async () => {
    await mount(CHAPTER_URL);
    for (let i = 0; i < 5; i++) await click(option(cards()[i], (i + 1) % 4));
    await click(byText('শেষ করো'));
    await flush(60);
    expect(api.saveExamResultAPI).toHaveBeenCalledTimes(1);
    const [uid, payload] = api.saveExamResultAPI.mock.calls[0];
    expect(uid).toBe('u1');
    expect(payload).toMatchObject({ subject: SUBJECT, totalQuestions: 5, correct: 5, wrong: 0, config: { type: 'QBANK_PRACTICE', mode: 'PRACTICE' } });
    expect(payload.config.title).toContain('ভেক্টর');
    expect(api.recordUserActivityAPI).toHaveBeenCalledWith('u1');
    expect(firestore.addDoc).toHaveBeenCalledTimes(1);
    expect(api.updateQuestProgressAPI).not.toHaveBeenCalled(); // under the 10-answer quest threshold
    expect(body()).toContain('রেকর্ড সেভ হয়েছে');
    expect(progress().sessions[0].synced).toBe(true);
  });

  it('remembers earlier marks and offers the wrong ones again', async () => {
    localStorage.setItem(
      'pk_qbank_progress_v1:u1',
      JSON.stringify({
        v: 1,
        marks: { [CHAPTER_Q[2]._id!]: { r: 0, t: 1, n: 1, a: 0 }, [CHAPTER_Q[3]._id!]: { r: 1, t: 1, n: 1, a: 0 } },
        sessions: [],
        sources: {},
        pending: null,
      }),
    );
    await mount(CHAPTER_URL);
    expect(body()).toContain('এখানে ১টি প্রশ্নে আগে ভুল করেছিলে');
    expect(body()).toContain('২ সমাধান');
    await click(byText('দেখাও'));
    expect(cards()).toHaveLength(1);
    expect(body()).toContain('Question number 3');
  });

  it('reading mode reveals every answer and disables answering', async () => {
    await mount(CHAPTER_URL);
    await click(Array.from(document.querySelectorAll('button[title]')).find((b) => b.getAttribute('title') === 'সব উত্তর দেখাও'));
    expect(body()).toContain('পড়ার মোড');
    expect(body()).not.toContain('লাইভ কুইজ');
    expect(cards().every((c) => Array.from(c.querySelectorAll('[role="group"] button')).every((b) => (b as HTMLButtonElement).disabled))).toBe(true);
    expect(body().match(/Because \d+/g)?.length).toBe(12);
    expect(localStorage.getItem('pk_qbank_progress_v1:u1') ?? '{}').not.toContain('"pending":{');
  });

  it('bookmarks through the saved-questions API', async () => {
    await mount(CHAPTER_URL);
    expect(cards()[1].querySelector('button[aria-label="বুকমার্ক সরাও"]')).not.toBeNull();
    await click(cards()[0].querySelector('button[aria-label="প্রশ্নটি বুকমার্ক করো"]'));
    expect(api.saveQuestionAPI).toHaveBeenCalledWith('u1', CHAPTER_Q[0]._id);
    expect(toast.showToast).toHaveBeenCalledWith('প্রশ্নটি বুকমার্ক হয়েছে', 'success');
  });

  it('launches a timed exam over the chapter with level defaults', async () => {
    await mount(CHAPTER_URL);
    await click(byText('পরীক্ষা'));
    expect(body()).toContain('পরীক্ষা দাও');
    expect(body()).toContain('সব (১২)');
    expect(body()).toContain('১৫ মিনিট'); // 12 × 1 min rounded up to 5
    expect(body()).toContain('−০.২৫');
    await click(byText('১২টি প্রশ্নে পরীক্ষা শুরু করো'));
    expect(lastLocation.pathname).toMatch(/^\/exam\/qbank_exam_/);
    const stored = Object.keys(localStorage).find((k) => k.startsWith('exam_config_qbank_exam_'))!;
    const config = JSON.parse(localStorage.getItem(stored)!);
    expect(config).toMatchObject({ type: 'QBANK_EXAM', mode: 'ALL_AT_ONCE', timeLimit: 15, negativeMarking: 0.25, subject: SUBJECT, chapter: CHAPTER });
    expect(config.questions).toHaveLength(12);
    expect(config.qbankSource).toMatchObject({ kind: 'exam', id: `ADMISSION|${SUBJECT}|${CHAPTER}` });
  });
});

describe('লাইভ কুইজ', () => {
  it('asks one question at a time and only moves on when the student says so', async () => {
    await mount(CHAPTER_URL);
    expect(body()).toContain('লাইভ কুইজ');
    expect(body()).toContain('১২টি প্রশ্ন');
    await click(byText('লাইভ কুইজ'));
    await flush(50);
    expect(cards()).toHaveLength(1);
    expect(body()).toContain('প্রশ্ন ১ / ১২');
    expect(body()).toContain('এড়িয়ে যাও');
    expect(byText('পরের প্রশ্ন')).toBeUndefined();

    await click(option(cards()[0], 0)); // wrong
    await flush(50);
    // The verdict stays put until "পরের প্রশ্ন".
    expect(cards()).toHaveLength(1);
    expect(body()).toContain('ভুল — সঠিক উত্তর খ');
    expect(body()).toContain('Because 1');
    expect(body()).toContain('তৈরি হলে');
    await flush(300);
    expect(body()).toContain('Question number 1');

    await click(byText('পরের প্রশ্ন'));
    await flush(700); // exit animation
    expect(cards()).toHaveLength(1);
    expect(body()).toContain('Question number 2');
    expect(body()).toContain('প্রশ্ন ২ / ১২');

    // Keyboard: 3 answers (Gamma = correct for Q2), Enter advances.
    await key('3');
    expect(body()).toContain('সঠিক!');
    await key('Enter');
    await flush(700);
    expect(body()).toContain('Question number 3');

    // Skip without answering.
    await click(byText('এড়িয়ে যাও'));
    await flush(700);
    expect(body()).toContain('Question number 4');
    expect(progress().pending.items).toHaveLength(2);

    // Back to the list: the sitting continues there.
    await click(byText('তালিকা'));
    await flush(50);
    expect(cards()).toHaveLength(12);
    expect(body()).toContain('লাইভ কুইজ চালিয়ে যাও');
    expect(body()).toContain('১০টি প্রশ্ন'); // the two answered are out of the queue
    expect(body()).toContain('শেষ করো');
  });

  it('ends with the sitting summary after the last question', async () => {
    await mount(CHAPTER_URL);
    for (let i = 0; i < 11; i++) await click(option(cards()[i], (i + 1) % 4)); // leave only Q12
    expect(body()).toContain('১টি প্রশ্ন');
    await click(byText('লাইভ কুইজ'));
    await flush(50);
    expect(body()).toContain('প্রশ্ন ১ / ১');
    await click(option(cards()[0], 0)); // Q12 correct (12 % 4 = 0)
    expect(body()).toContain('এটাই শেষ প্রশ্ন');
    await click(byText('ফলাফল দেখো'));
    await flush(60);
    expect(body()).toContain('সঠিকতা');
    expect(body()).toContain('১২/১২');
    expect(progress().pending).toBeNull();
    expect(api.saveExamResultAPI).toHaveBeenCalledTimes(1);
  });
});

describe('MathJax', () => {
  it('typesets cards with TeX when they mount and again when the explanation opens', async () => {
    const typesetPromise = vi.fn().mockResolvedValue(undefined);
    (window as { MathJax?: unknown }).MathJax = { typesetPromise };
    api.fetchQuestionsFromBankAPI.mockImplementation(() =>
      Promise.resolve({
        questions: [question(1, { question: 'Solve $x^2 = 4$', explanation: 'Because \\(x = \\pm 2\\)' }), question(2)],
        total: 2,
      }),
    );
    await mount(CHAPTER_URL);
    await flush(50);
    expect(typesetPromise).toHaveBeenCalledTimes(1); // only the card that has TeX
    expect((typesetPromise.mock.calls[0][0] as Element[])[0].id).toBe(`qbank-q-${CHAPTER_Q[0]._id}`);
    typesetPromise.mockClear();
    await click(option(cards()[0], 1)); // reveals the explanation, which holds more TeX
    await flush(50);
    expect(typesetPromise).toHaveBeenCalledTimes(1);
  });

  it('waits for the library when it has not loaded yet', async () => {
    api.fetchQuestionsFromBankAPI.mockImplementation(() => Promise.resolve({ questions: [question(1, { question: '$a+b$' })], total: 1 }));
    await mount(CHAPTER_URL);
    const typesetPromise = vi.fn().mockResolvedValue(undefined);
    (window as { MathJax?: unknown }).MathJax = { typesetPromise }; // the CDN script arrives later
    await flush(600); // > one retry interval
    expect(typesetPromise).toHaveBeenCalledTimes(1);
  });
});

describe('subject browser', () => {
  it('lists chapters with counts and pages through the bank with the HSC filters', async () => {
    await mount('/qbank?level=ACADEMIC&subject=Physics%201st%20Paper');
    expect(body()).toContain('পদার্থবিজ্ঞান ১ম পত্র');
    expect(body()).toContain('সব অধ্যায় মিলিয়ে');
    expect(body()).toContain('৯৬ প্রশ্ন');
    await click(byText(OTHER));
    expect(lastLocation.search).toContain('chapter=');
    const call = (page: number, board?: string) => [
      page,
      25,
      SUBJECT,
      OTHER,
      undefined,
      undefined,
      undefined,
      'ACADEMIC',
      board,
      undefined,
      false,
      undefined,
    ];
    expect(api.fetchQuestionsFromBankAPI).toHaveBeenLastCalledWith(...call(1));
    expect(body()).toContain('৯৬ প্রশ্ন · ২৫টি লোড হয়েছে');
    expect(cards()).toHaveLength(25);
    expect(body()).toContain('GST 2022'); // source chip in bank views
    expect(body()).not.toContain('সব ক্যাটাগরি');

    await click(byText('বোর্ড'));
    expect(api.fetchQuestionsFromBankAPI).toHaveBeenLastCalledWith(...call(1, 'ANY'));
    await click(byText('ঢাকা'));
    expect(api.fetchQuestionsFromBankAPI).toHaveBeenLastCalledWith(...call(1, 'DB'));

    await click(byText('আরও প্রশ্ন দেখাও'));
    expect(api.fetchQuestionsFromBankAPI).toHaveBeenLastCalledWith(...call(2, 'DB'));
    expect(cards()).toHaveLength(50);
  });

  it('filters ভর্তি questions by institution kind (admissionCategory)', async () => {
    await mount(`/qbank?level=ADMISSION&subject=${encodeURIComponent(SUBJECT)}&scope=all&admissionCategory=medical`);
    const call = (category?: string) => [1, 25, SUBJECT, undefined, undefined, undefined, undefined, 'ADMISSION', undefined, undefined, false, category];
    expect(api.fetchQuestionsFromBankAPI).toHaveBeenLastCalledWith(...call('medical'));
    expect(body()).toContain('সব ক্যাটাগরি');
    await click(byText('ইঞ্জিনিয়ারিং'));
    expect(api.fetchQuestionsFromBankAPI).toHaveBeenLastCalledWith(...call('engineering'));
    await click(byText('সব ক্যাটাগরি'));
    expect(api.fetchQuestionsFromBankAPI).toHaveBeenLastCalledWith(...call(undefined));
  });
});

describe('records', () => {
  it('shows totals, sources and sessions from the store', async () => {
    const now = Date.now();
    const id = `ADMISSION|${SUBJECT}|${CHAPTER}`;
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
            source: { kind: 'chapter', id, title: 'পদার্থবিজ্ঞান ১ম পত্র · ভেক্টর', subject: SUBJECT },
            items: [
              { k: 'a', a: 0, c: 1, s: SUBJECT },
              { k: 'b', a: 0, c: 0, s: SUBJECT },
            ],
          },
        ],
        sources: {
          [`chapter:${id}`]: {
            title: 'পদার্থবিজ্ঞান ১ম পত্র · ভেক্টর',
            kind: 'chapter',
            subject: SUBJECT,
            answered: 4,
            correct: 3,
            total: 60,
            lastAt: now - 60_000,
          },
        },
        pending: null,
      }),
    );
    await mount('/qbank?view=records');
    expect(body()).toContain('তোমার রেকর্ড');
    expect(body()).toContain('৭৫%');
    expect(body()).toContain('৪/৬০ সমাধান');
    expect(body()).toContain('১/২ সঠিক · ৪ মিনিট');
    await click(byText('পদার্থবিজ্ঞান ১ম পত্র · ভেক্টর'));
    expect(lastLocation.search).toBe(`?level=ADMISSION&subject=Physics+1st+Paper&chapter=${encodeURIComponent(CHAPTER)}`);
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
        pending: { id: 'p1', startedAt: old - 60_000, endedAt: old, source: { kind: 'search', id: '|R', title: 'পুরনো' }, items: [{ k: 'x', a: 1, c: 1 }] },
      }),
    );
    firestore.getDocs.mockResolvedValue({
      forEach: (fn: (d: { data: () => unknown }) => void) =>
        fn({
          data: () => ({
            examId: 'qbank_remote9',
            timestamp: old,
            userAnswers: [2],
            questions: [{ _id: CHAPTER_Q[4]._id, subject: SUBJECT, correctAnswerIndex: 1 }],
            config: { type: 'QBANK_PRACTICE', title: 'অন্য ডিভাইস', qbankSource: { kind: 'chapter', id: 'R2', title: 'অন্য ডিভাইস' } },
          }),
        }),
    });
    await mount('/qbank?view=records');
    const store = progress();
    expect(store.pending).toBeNull();
    expect(store.sessions.map((s: { id: string }) => s.id).sort()).toEqual(['p1', 'remote9']);
    expect(store.marks[CHAPTER_Q[4]._id!]).toMatchObject({ r: 0 });
    expect(body()).toContain('অন্য ডিভাইস');
    expect(body()).toContain('পুরনো');
  });
});
