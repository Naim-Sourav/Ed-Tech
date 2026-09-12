#!/usr/bin/env node
/**
 * scripts/preview-seo.mjs
 * ---------------------------------------------------------------------------
 * Zero-dependency static server for eyeballing the generated SEO pages.
 *
 * Two things it does that a normal static server does not:
 *   1. Rewrites the absolute production origin into root-relative URLs, so the
 *      same build works on any host (sandbox preview, localhost, …).
 *   2. Serves a navigation menu at "/" instead of dist/index.html. The SPA
 *      shell needs JS + the Firebase/API backend, so opening the preview root
 *      would show you a blank app, not the question pages. The real SPA shell
 *      is still reachable at /index.html. Pass --spa-root to get it at "/" too.
 *
 *   node scripts/preview-seo.mjs --dir dist --port 4173
 */
import { createServer } from 'node:http';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, extname, normalize, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv;
const dirArg = argv.indexOf('--dir');
const DIR = dirArg !== -1 ? argv[dirArg + 1] : 'dist';
const portArg = argv.indexOf('--port');
const PORT = portArg !== -1 ? Number(argv[portArg + 1]) : 4173;
const SPA_ROOT = argv.includes('--spa-root');
const ORIGIN = 'https://www.porikkhangon.app';
const HERE = dirname(fileURLToPath(import.meta.url));

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
};

// Fallbacks so public/ assets (logo, og image, icons) resolve without a build.
const FALLBACK_DIRS = [join(HERE, '..', 'public'), join(HERE, '..')];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---------------------------------------------------------------------------
// Navigation index for "/"
// ---------------------------------------------------------------------------
async function walk(dir, depth = 0) {
  if (depth > 6) return [];
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full, depth + 1)));
    else if (e.name === 'index.html') out.push(full);
  }
  return out;
}

/** Pull the <title> out of a generated page so the menu is readable. */
async function titleOf(file) {
  try {
    const h = await readFile(file, 'utf8');
    const m = h.match(/<title>(.*?)<\/title>/s);
    return m ? m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim() : '';
  } catch {
    return '';
  }
}

async function buildMenu() {
  const qFiles = (await walk(join(DIR, 'q'))).slice(0, 60);
  const listFiles = (await walk(join(DIR, 'questions'))).slice(0, 40);
  const syllabusFiles = (await walk(join(DIR, 'hsc-syllabus'))).slice(0, 24);

  const qTotal = (await walk(join(DIR, 'q'))).length;

  const rows = await Promise.all(
    qFiles.map(async (f) => {
      const href = '/' + relative(DIR, f).replace(/index\.html$/, '');
      return { href, title: await titleOf(f) };
    })
  );
  const lists = await Promise.all(
    listFiles.map(async (f) => {
      const href = '/' + relative(DIR, f).replace(/index\.html$/, '');
      return { href, title: await titleOf(f) };
    })
  );
  const syll = await Promise.all(
    syllabusFiles.map(async (f) => {
      const href = '/' + relative(DIR, f).replace(/index\.html$/, '');
      return { href, title: await titleOf(f) };
    })
  );

  const li = (x) => `<li><a href="${esc(x.href)}">${esc(x.title || x.href)}</a></li>`;

  return `<!DOCTYPE html>
<html lang="bn"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>প্রিভিউ — জেনারেট হওয়া SEO পেজ</title>
<link rel="stylesheet" href="/seo.css">
<style>
.menu{max-width:860px;margin:0 auto}
.menu h1{font-size:26px;margin:0 0 4px}
.menu .sub{color:var(--muted);margin:0 0 22px;font-size:15px}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}
.col h2{font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:var(--brand-ink);margin:0 0 8px}
.col ul{list-style:none;margin:0;padding:0;display:grid;gap:6px;max-height:60vh;overflow:auto}
.col a{display:block;background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:9px 12px;font-size:14.5px;color:var(--ink-2);line-height:1.6}
.col a:hover{border-color:var(--brand-line);color:var(--ink);text-decoration:none}
.top{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 24px}
.top a{background:var(--surface);border:1px solid var(--line);border-radius:999px;padding:6px 14px;font-size:14px;font-weight:600;color:var(--ink-2)}
.top a:hover{border-color:var(--brand-line);text-decoration:none}
</style>
</head><body>
<header class="topbar"><div class="topbar-in">
  <span class="brand"><img src="/Pshape.svg" alt="" width="32" height="32"><span>প্রিভিউ<small>LOCAL BUILD</small></span></span>
  <span style="color:var(--muted);font-size:13px">${qTotal}টি প্রশ্ন পেজ জেনারেট হয়েছে</span>
</div></header>
<main class="menu">
  <h1>জেনারেট হওয়া SEO পেজগুলো</h1>
  <p class="sub">এটা লোকাল প্রিভিউ মেনু — আসল সাইটে এই পেজটা নেই। নিচের যেকোনো লিংকে ক্লিক করো।</p>
  <div class="top">
    <a href="/questions/">📚 প্রশ্নব্যাংক হাব</a>
    <a href="/hsc-syllabus/">📘 সিলেবাস হাব</a>
    <a href="/index.html">⚛️ আসল SPA হোমপেজ</a>
    <a href="/sitemap.xml">🗺️ sitemap.xml</a>
    <a href="/robots.txt">🤖 robots.txt</a>
    <a href="/seo.css">🎨 seo.css</a>
  </div>
  <div class="cols">
    <section class="col"><h2>প্রশ্ন পেজ</h2><ul>${rows.map(li).join('')}</ul></section>
    <section class="col"><h2>অধ্যায়ের প্রশ্ন তালিকা</h2><ul>${lists.map(li).join('')}</ul></section>
    <section class="col"><h2>সিলেবাস পেজ</h2><ul>${syll.map(li).join('')}</ul></section>
  </div>
</main>
</body></html>`;
}

// ---------------------------------------------------------------------------
createServer(async (req, res) => {
  try {
    let raw;
    try {
      raw = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    } catch {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('malformed path');
      return;
    }
    let p = raw.endsWith('/') ? `${raw}index.html` : raw;
    p = normalize(p).replace(/^(\.\.[/\\])+/, '');

    // "/" -> preview menu, unless --spa-root asks for the real SPA shell.
    if (raw === '/' && !SPA_ROOT) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(await buildMenu());
      return;
    }

    let file = join(DIR, p);
    let st = null;
    try {
      st = await stat(file);
    } catch {
      for (const base of FALLBACK_DIRS) {
        const alt = join(base, p);
        try {
          st = await stat(alt);
          file = alt;
          break;
        } catch {
          /* keep looking */
        }
      }
    }
    if (!st || st.isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404</h1>');
      return;
    }

    const type = TYPES[extname(file).toLowerCase()] || 'application/octet-stream';
    let buf = await readFile(file);
    if (type.startsWith('text/') || type === 'application/xml; charset=utf-8') {
      buf = Buffer.from(buf.toString('utf8').split(ORIGIN).join(''), 'utf8');
    }
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    res.end(buf);
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(String(e));
  }
}).listen(PORT, '0.0.0.0', () => {
  console.log(`[preview] serving ${DIR} on http://0.0.0.0:${PORT}`);
  console.log(`[preview] "/" = navigation menu${SPA_ROOT ? ' (disabled by --spa-root)' : ''}; SPA shell at /index.html`);
});
