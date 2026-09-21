// @vitest-environment jsdom
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { describe, it, expect, vi } from 'vitest';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('../services/api', () => ({
  fetchExamPaperQuestionsAPI: vi.fn(async () => ({ questions: [], total: 0 })),
  fetchQuestionsFromBankAPI: vi.fn(async () => ({ questions: [], total: 0 })),
}));

import PastPaperPage from './PastPaperPage';
import {
  parseExamTag,
  sessionToBangla,
  sessionToSlug,
  slugToSession,
  paperPath,
  qbankPaperLink,
  findInstitutionById,
  subjectToBangla,
} from '../data/admissionExams';

/** Client render (effects run, API is mocked) and return the resulting HTML. */
const render = async (path: string) => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => {
    root.render(
      <HelmetProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/admission-questions" element={<PastPaperPage />} />
            <Route path="/admission-questions/:inst" element={<PastPaperPage />} />
            <Route path="/admission-questions/:inst/:session/*" element={<PastPaperPage />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );
  });
  const html = host.innerHTML;
  await act(async () => root.unmount());
  host.remove();
  return html;
};

describe('admissionExams helpers', () => {
  it('parses exam-session tags', () => {
    expect(parseExamTag("Medical '21-22")).toEqual({ prefix: 'Medical', session: '21-22' });
    expect(parseExamTag("DU-A '25-26")).toEqual({ prefix: 'DU-A', session: '25-26' });
    expect(parseExamTag("ChB '2023")).toBeNull(); // board tag, not a session
    expect(parseExamTag('Medical')).toBeNull();
  });

  it('converts sessions both ways', () => {
    expect(sessionToBangla('21-22')).toBe('২০২১-২২');
    expect(sessionToSlug('21-22')).toBe('2021-22');
    expect(slugToSession('2021-22')).toBe('21-22');
    expect(slugToSession('21-22')).toBe('21-22');
    expect(slugToSession('foo')).toBeNull();
  });

  it('builds stable URLs', () => {
    const medical = findInstitutionById('medical')!;
    expect(paperPath(medical, '21-22')).toBe('/admission-questions/medical/2021-22/');
    expect(qbankPaperLink(medical, '21-22')).toContain("examRef=Medical%20'21-22");
    expect(subjectToBangla('Biology 2nd Paper')).toBe('জীববিজ্ঞান ২য় পত্র');
  });
});

describe('PastPaperPage', () => {
  it('renders the hub', async () => {
    const html = await render('/admission-questions');
    expect(html).toContain('বিগত বছরের ভর্তি পরীক্ষার প্রশ্ন ও সমাধান');
    expect(html).toContain('/admission-questions/medical/');
  });

  it('renders an institution page (no sessions in the mocked bank)', async () => {
    const html = await render('/admission-questions/medical');
    expect(html).toContain('মেডিকেল ভর্তি পরীক্ষা');
    expect(html).toContain('কোনো সেশনের প্রশ্ন এখনো প্রশ্নব্যাংকে যোগ হয়নি');
  });

  it('renders a paper page and asks the bank for the exact exam tag', async () => {
    const api = await import('../services/api');
    const html = await render('/admission-questions/medical/2021-22/');
    expect(html).toContain('মেডিকেল ভর্তি পরীক্ষা ২০২১-২২');
    expect(api.fetchExamPaperQuestionsAPI).toHaveBeenCalledWith("Medical '21-22");
    expect(html).toContain('এই সেশনের প্রশ্ন পাওয়া যায়নি');
  });

  it('handles unknown institutions gracefully', async () => {
    const html = await render('/admission-questions/nope');
    expect(html).toContain('এই পরীক্ষাটি খুঁজে পাওয়া যায়নি');
  });
});
