import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import type { QuizQuestion } from '../../types';
import { chaptersOf, flattenTopics } from './catalog';

/*
 * End-to-end behaviour of the mock-test builder (/quiz):
 * subject → chapter → settings → exam hand-off, plus the deep-link / mode
 * entry points other screens rely on.
 */

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const auth = vi.hoisted(() => ({ state: {} as Record<string, unknown> }));
const api = vi.hoisted(() => ({
  fetchSyllabusStatsAPI: vi.fn(),
  generateQuizFromDB: vi.fn(),
  fetchUserMistakesAPI: vi.fn(),
}));
const toast = vi.hoisted(() => ({ showToast: vi.fn() }));

vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => auth.state }));
vi.mock('../../services/api', () => api);
vi.mock('../Toast', () => ({ useToast: () => toast }));

import QuizArena from '../QuizArena';

const PHY1 = 'Physics 1st Paper';
const phyChapters = chaptersOf(PHY1);

const makeQuestions = (cfg: { subject: string; chapter: string; count: number }): QuizQuestion[] =>
  Array.from({ length: cfg.count }, (_, i) => ({
    id: `${cfg.subject}|${cfg.chapter}|${i}`,
    question: `${cfg.chapter} প্রশ্ন ${i + 1}`,
    options: ['ক', 'খ', 'গ', 'ঘ'],
    correctAnswerIndex: 0,
    explanation: '',
  }));

let lastLocation: { pathname: string; search: string; state: unknown } = { pathname: '', search: '', state: null };
const Probe = () => {
  const loc = useLocation();
  lastLocation = { pathname: loc.pathname, search: loc.search, state: loc.state };
  return null;
};

const click = (el: Element | undefined | null) => {
  if (!el) throw new Error('element not found');
  (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
};
const buttons = () => Array.from(document.querySelectorAll('button'));
const byText = (text: string) => buttons().find((b) => (b.textContent || '').includes(text));
const byLabel = (label: string) => buttons().find((b) => (b.getAttribute('aria-label') || '').includes(label));
const body = () => document.body.textContent || '';
const flush = () => act(() => new Promise<void>((r) => setTimeout(r, 30)));

let root: Root | null = null;
const mount = async (entry: string | { pathname: string; state?: unknown } = '/quiz') => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () =>
    root!.render(
      <MemoryRouter initialEntries={[entry as string]}>
        <Probe />
        <Routes>
          <Route path="/quiz" element={<QuizArena />} />
          <Route path="/exam/:examId" element={<p>EXAM PAGE</p>} />
          <Route path="/dashboard" element={<p>DASHBOARD</p>} />
        </Routes>
      </MemoryRouter>,
    ),
  );
  await flush();
};

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  auth.state = { currentUser: { uid: 'u1' }, extendedProfile: { target: 'Engineering', department: 'Science', hscBatch: 'HSC 2026' } };
  api.fetchSyllabusStatsAPI.mockReset().mockResolvedValue({
    [PHY1]: { total: 320, chapters: { [phyChapters[0]]: { total: 40 }, [phyChapters[1]]: { total: 25 } } },
    'Physics 2nd Paper': { total: 180 },
  });
  api.generateQuizFromDB.mockReset().mockImplementation(async (cfg: { subject: string; chapter: string; count: number }) => makeQuestions(cfg));
  api.fetchUserMistakesAPI.mockReset().mockResolvedValue([]);
  toast.showToast.mockReset();
});

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = null;
  document.body.innerHTML = '';
});

describe('QuizArena — mock-test builder', () => {
  it('walks subject → chapter → settings and hands the exam to /exam/:id', async () => {
    await mount();

    // step 1: personalised subject grid (Engineering → Physics first)
    expect(body()).toContain('কোন বিষয়ে মক দেবে?');
    expect(body()).toContain('তোমার জন্য সাজানো');
    expect(body()).toContain('ইঞ্জিনিয়ারিং টার্গেট');
    expect(body()).toContain('৫০০ প্রশ্ন'); // 320 + 180 from stats
    await act(async () => click(byLabel('পদার্থবিজ্ঞান')));

    // step 2: chapters of the 1st paper, URL carries the state
    expect(lastLocation.search).toContain('view=CHAPTER_DRILLDOWN');
    expect(lastLocation.search).toContain('subject=Physics');
    expect(body()).toContain(phyChapters[0]);
    expect(body()).toContain('অন্তত একটা অধ্যায় বাছাই করো');
    expect((byText('সেটিংস') as HTMLButtonElement).disabled).toBe(true);

    await act(async () => click(byLabel(`${phyChapters[0]} বাছাই করো`)));
    expect(body()).toContain('১টি অধ্যায়');
    expect(body()).toContain('পুরো অধ্যায়');

    // pick a single topic in the second chapter
    await act(async () => click(buttons().filter((b) => b.getAttribute('aria-controls')?.startsWith('topics-'))[1]));
    const topic = flattenTopics(PHY1, phyChapters[1])[0];
    await act(async () => click(buttons().find((b) => b.getAttribute('aria-pressed') !== null && b.textContent === topic)));
    expect(body()).toContain('২টি অধ্যায়');
    expect(body()).toContain(`১/${String(flattenTopics(PHY1, phyChapters[1]).length).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[+d])} টপিক বাছাই`);

    expect((byText('সেটিংস') as HTMLButtonElement).disabled).toBe(false);
    await act(async () => click(byText('সেটিংস')));

    // step 3: settings — Engineering target ⇒ admission defaults, then a preset
    expect(lastLocation.search).toContain('step=TOPIC_CONFIG');
    expect(body()).toContain('পরীক্ষার সেটিংস');
    expect(body()).toContain('২০ প্রশ্ন · ২০ মিনিট · নেগেটিভ ০.২৫');
    expect(body()).toContain('~৬৫'); // 40 + 25 pool estimate
    await act(async () => click(byText('ঝটপট রিভিশন')));
    expect(body()).toContain('১০ প্রশ্ন · সময় নেই · নেগেটিভ নেই · প্র্যাকটিস মোড');
    expect(body()).toContain('পদার্থবিজ্ঞান মক (২টি অধ্যায়)');

    // launch
    await act(async () => click(byText('মক শুরু করো')));
    await flush();

    expect(api.generateQuizFromDB).toHaveBeenCalledTimes(2);
    expect(api.generateQuizFromDB).toHaveBeenCalledWith({ subject: PHY1, chapter: phyChapters[0], topics: [], count: 10 });
    expect(api.generateQuizFromDB).toHaveBeenCalledWith({ subject: PHY1, chapter: phyChapters[1], topics: [topic], count: 10 });

    expect(lastLocation.pathname).toMatch(/^\/exam\/exam_\d+_\d+$/);
    const examId = lastLocation.pathname.split('/').pop()!;
    const config = JSON.parse(localStorage.getItem(`exam_config_${examId}`) || 'null');
    expect(config).toMatchObject({
      timeLimit: 0,
      negativeMarking: 0,
      mode: 'ALL_AT_ONCE',
      isPracticeMode: true,
      shuffle: true,
      title: 'পদার্থবিজ্ঞান মক (২টি অধ্যায়)',
    });
    expect(config.questions).toHaveLength(10);
    expect(new Set(config.questions.map((q: QuizQuestion) => q.id)).size).toBe(10);

    // remembered for next time, draft cleared
    expect(localStorage.getItem('pk_quiz_last_setup_v1')).toContain(PHY1);
    expect(sessionStorage.getItem('pk_quiz_builder_draft_v1')).toBeNull();
  });

  it('offers "আবার দাও" for the last mock and pre-fills the settings step', async () => {
    localStorage.setItem(
      'pk_quiz_last_setup_v1',
      JSON.stringify({
        selection: { [`${PHY1}-${phyChapters[0]}`]: flattenTopics(PHY1, phyChapters[0]) },
        settings: { count: 30, timeLimit: 30, negativeMarking: 0.5, practice: false, view: 'SINGLE_PAGE' },
        title: `পদার্থবিজ্ঞান · ${phyChapters[0]}`,
        at: Date.now(),
      }),
    );
    await mount();
    expect(body()).toContain('আগের মক');
    await act(async () => click(byText('আবার দাও')));
    expect(lastLocation.search).toContain('step=TOPIC_CONFIG');
    expect(body()).toContain('৩০ প্রশ্ন · ৩০ মিনিট · নেগেটিভ ০.৫');
    expect(body()).toContain(phyChapters[0]);
  });

  it('opens a subject directly from location.state and greets first-mock students', async () => {
    await mount({ pathname: '/quiz', state: { subject: 'Chemistry', fromSetup: true } });
    expect(lastLocation.search).toContain('subject=Chemistry');
    expect(body()).toContain(chaptersOf('Chemistry 1st Paper')[0]);
    expect(body()).toContain('রসায়ন');
  });

  it('shows the welcome banner after profile setup', async () => {
    await mount({ pathname: '/quiz', state: { fromSetup: true } });
    expect(body()).toContain('প্রোফাইল রেডি — এবার প্রথম মকটা দিয়ে ফেলো!');
  });

  it('flash-card mode starts a rapid-fire round straight from a chapter', async () => {
    await mount({ pathname: '/quiz', state: { mode: 'RAPID_FIRE' } });
    expect(body()).toContain('কোন বিষয়ের ফ্ল্যাশ কার্ড?');
    expect(lastLocation.search).toContain('mode=RAPID_FIRE');
    await act(async () => click(byLabel('পদার্থবিজ্ঞান')));
    expect(lastLocation.search).toContain('mode=RAPID_FIRE'); // survives the param change
    expect(body()).toContain('১৫টি কার্ড');
    await act(async () => click(byText(phyChapters[0])));
    await flush();
    expect(api.generateQuizFromDB).toHaveBeenCalledWith({ subject: PHY1, chapter: phyChapters[0], topics: [], count: 15 });
    const examId = lastLocation.pathname.split('/').pop()!;
    expect(JSON.parse(localStorage.getItem(`exam_config_${examId}`)!)).toMatchObject({
      mode: 'RAPID_FIRE',
      isPracticeMode: true,
      timeLimit: 0,
      title: `ফ্ল্যাশ কার্ড: ${phyChapters[0]}`,
    });
  });

  it('wrong-question mode with no mistakes falls back to the subject grid with a hint', async () => {
    await mount({ pathname: '/quiz', state: { mode: 'WRONG_QUESTIONS' } });
    await flush();
    expect(api.fetchUserMistakesAPI).toHaveBeenCalledWith('u1');
    expect(toast.showToast).toHaveBeenCalledWith(expect.stringContaining('ভুল প্রশ্নের রেকর্ড নেই'), 'info');
    expect(body()).toContain('কোন বিষয়ে মক দেবে?');
  });

  it('auto-starts a model test from location.state', async () => {
    await mount({ pathname: '/quiz', state: { modelTest: { subject: PHY1, chapter: phyChapters[0], title: 'সাপ্তাহিক মডেল টেস্ট', count: 20, time: 20 } } });
    await flush();
    expect(api.generateQuizFromDB).toHaveBeenCalledWith({ subject: PHY1, chapter: phyChapters[0], topics: [], count: 20 });
    const examId = lastLocation.pathname.split('/').pop()!;
    expect(JSON.parse(localStorage.getItem(`exam_config_${examId}`)!)).toMatchObject({
      title: 'সাপ্তাহিক মডেল টেস্ট',
      negativeMarking: 0.25,
      timeLimit: 20,
      isPracticeMode: false,
      mode: 'ALL_AT_ONCE',
    });
  });

  it('returns to the settings step with a toast when the bank has no questions', async () => {
    api.generateQuizFromDB.mockResolvedValue([]);
    sessionStorage.setItem('pk_quiz_builder_draft_v1', JSON.stringify({ selection: { [`${PHY1}-${phyChapters[0]}`]: flattenTopics(PHY1, phyChapters[0]) } }));
    await mount('/quiz?step=TOPIC_CONFIG');
    expect(body()).toContain('পরীক্ষার সেটিংস'); // draft survived the "refresh"
    await act(async () => click(byText('মক শুরু করো')));
    await flush();
    expect(toast.showToast).toHaveBeenCalledWith(expect.stringContaining('পর্যাপ্ত প্রশ্ন নেই'), 'warning');
    expect(lastLocation.pathname).toBe('/quiz');
    expect(lastLocation.search).toContain('step=TOPIC_CONFIG');
    expect(body()).toContain('পরীক্ষার সেটিংস');
  });

  it('in-app back mirrors browser history and keeps the selection', async () => {
    await mount();
    await act(async () => click(byLabel('পদার্থবিজ্ঞান')));
    await act(async () => click(byLabel(`${phyChapters[0]} বাছাই করো`)));
    await act(async () => click(byText('সেটিংস')));
    expect(body()).toContain('পরীক্ষার সেটিংস');

    await act(async () => click(byLabel('অধ্যায় বাছাইয়ে ফিরে যাও')));
    await flush();
    expect(lastLocation.search).not.toContain('step=');
    expect(body()).toContain('পুরো অধ্যায়'); // chapter still ticked

    await act(async () => click(byLabel('বিষয় তালিকায় ফিরে যাও')));
    await flush();
    expect(body()).toContain('কোন বিষয়ে মক দেবে?');
    expect(byLabel('পদার্থবিজ্ঞান')?.getAttribute('aria-label')).toContain('১টি অধ্যায় বাছাই করা');
    expect(body()).toContain('১টি অধ্যায়'); // footer summary with a shortcut to settings

    await act(async () => click(byLabel('ফিরে যাও')));
    await flush();
    expect(lastLocation.pathname).toBe('/dashboard');
  });

  it('guards deep links to steps that need a selection', async () => {
    await mount('/quiz?step=TOPIC_CONFIG');
    expect(body()).toContain('কোন বিষয়ে মক দেবে?');
    expect(lastLocation.search).not.toContain('step=');
  });
});
