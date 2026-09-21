import { afterAll, beforeAll, expect, it } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import LandingPage from '../LandingPage';
import { demoQuestions } from './data';


/**
 * Landing page guard-rails:
 *  1. every section of the design renders,
 *  2. the platform is SSC / HSC / Admission only — no government-job exam copy.
 */
beforeAll(() => {
  // jsdom gaps framer-motion + the design rely on at runtime
  window.matchMedia = window.matchMedia || ((q: string) => ({
    matches: false, media: q, onchange: null,
    addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {},
    dispatchEvent() { return false; },
  }));
  class IO { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } }
  class RO { observe() {} unobserve() {} disconnect() {} }
  // @ts-expect-error test shim
  window.IntersectionObserver = IO;
  window.ResizeObserver = RO;
  // @ts-expect-error test shim
  globalThis.IntersectionObserver = IO;
  globalThis.ResizeObserver = RO;

  const el = document.createElement('div');
  document.body.appendChild(el);
  root = createRoot(el);
  render = () =>
    act(async () => {
      root!.render(
        <HelmetProvider>
          <MemoryRouter>
            <LandingPage onLoginClick={() => {}} />
          </MemoryRouter>
        </HelmetProvider>,
      );
    });
});

let render: () => Promise<void>;
let root: ReturnType<typeof createRoot> | null = null;

// the question card runs a 1s timer — unmount so its interval is cleared
afterAll(async () => {
  await act(async () => {
    root?.unmount();
  });
  root = null;
});

it('renders every section of the landing page', async () => {
  await render();
  const text = document.body.textContent || '';
  for (const needle of [
    'ফ্রিতে পরীক্ষা শুরু করো',      // hero CTA
    'ভেক্টর রাশি',                  // question demo (previous landing page)
    'porikkhangon.app/live-exam',   // app-window chrome bar on the demo card
    'জাতীয় লিডারবোর্ড',              // leaderboard panel inside the app window
    'পরীক্ষা বাকি',                  // exam countdown panel inside the app window
    'পরীক্ষা প্রস্তুতির',           // hero headline
    'বিস্তৃত অঙ্গন',                // hero headline highlight
    'এসএসসি বোর্ড প্রস্তুতি',        // exam marquee (SSC · HSC · Admission)
    'সব এখানেই আছে',                // features
    'Made with love for students',  // cta + footer trust line
    'বোর্ড প্রশ্ন আর্কাইভ',          // restored feature card
    'কুইজ ব্যাটল ও লিডারবোর্ড',      // restored feature card
    'Every exam',                   // showcase (previous landing page)
    'মাত্র ৩টা চরণে',               // benefits roadmap
    'গাইডবুক + কোচিং',              // guidebook comparison
    'যারা জিতেছে',                  // testimonials
    'Cheaper than',                 // pricing (previous landing page plans)
    'সচরাচর জিজ্ঞাসা',              // faq
    'শুধু পরীক্ষা দেওয়া নয়',        // features subtitle
    'প্রতিদিনই লাইভ মক',             // live-exam card (no Friday-only wording)
    'বিকাশ', 'নগদ', 'রকেট',          // payment methods
    'ফ্রি অ্যাকাউন্ট খোলো',          // cta
    'সর্বস্বত্ব সংরক্ষিত',           // footer
  ]) {
    expect(text, needle).toContain(needle);
  }
  expect(document.querySelectorAll('section[id]').length).toBeGreaterThanOrEqual(5);
});

it('switches the landing between light and dark theme', async () => {
  await render();
  const root = document.documentElement;
  const before = root.classList.contains('dark');

  const toggle = Array.from(document.querySelectorAll('button')).find((b) =>
    (b.getAttribute('aria-label') || '').includes('মোডে যাও'),
  );
  expect(toggle, 'theme toggle button').toBeTruthy();

  await act(async () => {
    toggle!.click();
  });
  expect(root.classList.contains('dark')).toBe(!before);

  await act(async () => {
    toggle!.click();
  });
  expect(root.classList.contains('dark')).toBe(before);
});

it('ships demo questions whose marked answer is actually correct', () => {
  // regression: the SSC physics question used to mark `দ্রুতি` (a scalar) as the
  // vector quantity. The answer must be a genuinely vector quantity.
  const physics = demoQuestions[0];
  expect(physics.options[physics.answer]).toBe('বেগ');

  const chem = demoQuestions[1];
  expect(chem.question).toContain('pH');
  expect(chem.options[chem.answer]).toBe('10⁻⁴ M');

  // every question must point at an existing option
  for (const q of demoQuestions) {
    expect(q.answer).toBeGreaterThanOrEqual(0);
    expect(q.answer).toBeLessThan(q.options.length);
    expect(q.options[q.answer]).toBeTruthy();
  }
});

it('never shows government-job exam content', async () => {
  await render();
  const text = document.body.textContent || '';
  for (const forbidden of ['বিসিএস', 'ব্যাংক জব', 'NTRCA', 'প্রাথমিক সহকারী', 'চাকরিটা', 'ক্যাডার', 'প্রিলি', 'নিয়োগ', 'চর্চা', 'Google Play', 'App Store', 'উপায়', 'স্কুল থেকে ঢাকার ক্যাম্পাস']) {
    expect(text, forbidden).not.toContain(forbidden);
  }
});
