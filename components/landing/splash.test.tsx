import { expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/** Verify the pre-React splash is readable in both themes. */
it('splash mark + wordmark are visible in light and dark', () => {
  // The splash lives in the source index.html (it has to paint before the bundle),
  // so assert against the source file — the built CSS is folded in when present.
  const html = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8');
  const assetsDir = path.resolve(process.cwd(), 'dist/assets');
  const cssFile = fs.existsSync(assetsDir)
    ? fs.readdirSync(assetsDir).find((f) => /^index-.*\.css$/.test(f))
    : undefined;
  const appCss = cssFile ? fs.readFileSync(path.join(assetsDir, cssFile), 'utf8') : '';

  // the old invert filter (which turned the wordmark white-on-white) must be gone
  expect(html).not.toContain('invert(1)');
  expect(html).not.toContain('loading-logo-text');

  const inline = html.slice(html.indexOf('<style>'), html.indexOf('</style>') + 8);
  const splash = html.slice(html.indexOf('<div id="app-loading">'), html.indexOf('<!-- Crawlable fallback'));
  const style = document.createElement('style');
  style.textContent = inline + '\n' + appCss;
  document.head.appendChild(style);

  const host = document.createElement('div');
  host.innerHTML = splash;
  document.body.appendChild(host);

  // splash keeps the transparent "P" mark on its own black tile + a text wordmark
  const mark = document.querySelector('.loading-mark')!;
  const img = mark.querySelector('img')!;
  const word = document.querySelector('.loading-wordmark')!;
  expect(img.getAttribute('src') || '').toMatch(/p-logo-mark\.png$/);
  expect(word.textContent).toBe('পরীক্ষাঙ্গন');
  expect(document.querySelectorAll('#app-loading img').length).toBe(1); // no second (letter) logo

  // light theme → tile black, wordmark dark ink
  document.documentElement.className = '';
  const lightWord = window.getComputedStyle(word).color;
  expect(lightWord).not.toMatch(/rgba?\(255, 255, 255/);

  // dark theme → wordmark goes light, tile gets its hairline ring
  document.documentElement.className = 'dark';
  const darkWord = window.getComputedStyle(word).color;
  const darkTile = window.getComputedStyle(mark).boxShadow;
  expect(darkWord).not.toBe(lightWord);
  expect(darkWord).toMatch(/rgba?\(24[0-9], 2[0-9][0-9], 2[0-9][0-9]/); // #f5f0ea
  expect(darkTile).toContain('rgba(255, 255, 255, 0.14)');
  console.log('light wordmark:', lightWord, '| dark wordmark:', darkWord);
});
