import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import LandingPage from './LandingPage';

/**
 * Smoke test: the redesigned landing page must render end-to-end without
 * throwing (all sections present, crawler-safe counters show final values).
 */
describe('LandingPage (v2 redesign)', () => {
  const html = renderToString(
    React.createElement(
      HelmetProvider,
      {},
      React.createElement(LandingPage, { onLoginClick: () => {} })
    )
  );

  it('renders hero copy and interactive sim', () => {
    expect(html).toContain('পড়া মুখস্থ নয়');
    expect(html).toContain('আসল প্রস্তুতি');
    expect(html).toContain('porikkhangon.app/live-exam');
  });

  it('renders every major section', () => {
    ['features', 'showcase', 'why', 'pricing', 'faq', 'cta'].forEach((id) => {
      expect(html).toContain(`id="${id}"`);
    });
  });

  it('shows final counter values for crawlers (no zero-state)', () => {
    expect(html).toContain('৫০,০০০');
    expect(html).toContain('২৪/৭');
    expect(html).toContain('১০+');
  });

  it('renders pricing plans and FAQ', () => {
    expect(html).toContain('অ্যাডমিশন বান্ডেল');
    expect(html).toContain('পরীক্ষাঙ্গন কি সত্যিই ফ্রি?');
  });
});
