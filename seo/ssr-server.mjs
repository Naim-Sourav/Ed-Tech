#!/usr/bin/env node
/**
 * seo/ssr-server.mjs
 * ---------------------------------------------------------------------------
 * Serves a real, 200-OK, fully-rendered page for EVERY question in the
 * database — 50,343 today, and every question you add tomorrow, with no
 * rebuild and no redeploy. This is the piece static generation cannot do on
 * GitHub Pages (a full-bank static build measures ~600 MB of HTML, and Pages
 * caps published sites at 1 GB with a 10-minute deploy timeout).
 *
 * Zero dependencies — plain node:http — so you can either:
 *
 *   (A) run it as its own service:
 *         node seo/ssr-server.mjs --port 8080
 *
 *   (B) mount it inside your existing Render/Express backend:
 *         import { createSeoHandler } from './seo/ssr-server.mjs';
 *         const seo = createSeoHandler({ source: mongoSource });
 *         app.use((req, res, next) => seo(req, res).then((done) => !done && next()));
 *
 * Routes it owns
 *   GET /q/<slug>/            question page  (200, or a branded 404 page)
 *   GET /sitemap.xml          sitemap index (or a single sitemap if < 40k URLs)
 *   GET /sitemap-questions-N.xml
 *   GET /seo.css              the shared stylesheet
 *   GET /healthz              liveness
 *
 * Everything else falls through to your next handler.
 *
 * SEE SEO-QUESTIONS.md for the DNS/edge routing that points
 * https://www.porikkhangon.app/q/* at this server.
 */

import { createServer } from 'node:http';
import { THEME_CSS, SITE } from './theme.mjs';
import { renderQuestionPage, renderNotFound, slugify, safePath } from './render.mjs';

const argv = process.argv;
const portArg = argv.indexOf('--port');
const PORT = portArg !== -1 ? Number(argv[portArg + 1]) : Number(process.env.PORT) || 8080;
const API = process.env.QUESTION_API || 'https://mongodb-hb6b.onrender.com/api';
const SITEMAP_CHUNK = 40000;

// ---------------------------------------------------------------------------
// Data source
// ---------------------------------------------------------------------------
/**
 * Default source: page through the public read-only REST endpoint and keep an
 * in-memory slug index. ~101 requests for 50k questions, refreshed every 6 h.
 *
 * If you have Mongoose in the same process, replace it — see README notes at
 * the bottom of this file. A Mongo-backed source is strictly better.
 */
export function createRestSource({ apiBase = API, refreshMs = 6 * 60 * 60 * 1000, limit = 500, concurrency = 6 } = {}) {
  let bySlug = new Map();
  let byChapter = new Map();
  let all = [];
  let total = 0;
  let loading = null;

  async function fetchJson(url) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 30000);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
      return await res.json();
    } finally {
      clearTimeout(t);
    }
  }

  async function build() {
    const first = await fetchJson(`${apiBase}/admin/questions?page=1&limit=${limit}`);
    total = Number(first?.total) || 0;
    const got = (first?.questions || []).length;
    const effLimit = total > limit && got > 0 && got < limit ? got : limit;
    const pages = Math.max(1, Math.ceil(total / effLimit));
    const rows = [...(first?.questions || [])];

    let idx = 2;
    while (idx <= pages) {
      const batch = [];
      for (let k = 0; k < concurrency && idx <= pages; k++, idx++) {
        const p = idx;
        batch.push(fetchJson(`${apiBase}/admin/questions?page=${p}&limit=${effLimit}`).catch(() => null));
      }
      const res = await Promise.all(batch);
      for (const r of res) if (r?.questions?.length) rows.push(...r.questions);
    }

    const nextSlug = new Map();
    const nextChapter = new Map();
    const seen = new Set();
    for (const q of rows) {
      if (!q || !q.question || !Array.isArray(q.options) || q.options.length < 2) continue;
      const id = String(q._id || q.id || '');
      if (seen.has(id)) continue;
      seen.add(id);
      let slug = safePath(q.slug || '');
      if (!slug) continue;
      if (nextSlug.has(slug)) slug = `${slug}-${id.slice(-6)}`;
      const rec = { ...q, slug, url: `${SITE}/q/${slug}/` };
      nextSlug.set(slug, rec);
      const key = `${q.subject || ''}||${q.chapter || ''}`;
      if (!nextChapter.has(key)) nextChapter.set(key, []);
      nextChapter.get(key).push(rec);
    }
    bySlug = nextSlug;
    byChapter = nextChapter;
    all = [...nextSlug.values()];
    console.log(`[seo-ssr] indexed ${all.length} questions (${total} reported) from ${apiBase}`);
  }

  function ensure() {
    if (loading) return loading;
    loading = build()
      .catch((e) => console.error(`[seo-ssr] index build failed: ${e.message}`))
      .finally(() => {
        loading = null;
        setTimeout(ensure, refreshMs).unref?.();
      });
    return loading;
  }

  return {
    ready: ensure,
    stats: () => ({ known: all.length, total, chapters: byChapter.size }),
    bySlug: (slug) => bySlug.get(safePath(slug)) || null,
    chapter: (subject, chapter) => byChapter.get(`${subject}||${chapter}`) || [],
    all: () => all,
  };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
function send(res, status, body, type = 'text/html; charset=utf-8', extra = {}) {
  const buf = Buffer.isBuffer(body) ? body : Buffer.from(String(body), 'utf8');
  const etag = `"${buf.length}-${simpleHash(buf)}"`;
  res.writeHead(status, {
    'Content-Type': type,
    'Content-Length': buf.length,
    ETag: etag,
    'Cache-Control': 'public, max-age=600, s-maxage=86400, stale-while-revalidate=604800',
    'X-Content-Type-Options': 'nosniff',
    ...extra,
  });
  res.end(buf);
}

function simpleHash(buf) {
  let h = 5381;
  const step = Math.max(1, Math.floor(buf.length / 4096));
  for (let i = 0; i < buf.length; i += step) h = ((h << 5) + h + buf[i]) >>> 0;
  return h.toString(36);
}

/**
 * @returns {(req, res) => Promise<boolean>} true when the response was handled
 */
export function createSeoHandler({ source = createRestSource(), site = SITE } = {}) {
  return async function seo(req, res) {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const path = decodeURIComponent(url.pathname);

    if (path === '/healthz') {
      send(res, 200, JSON.stringify({ ok: true, ...source.stats() }), 'application/json; charset=utf-8');
      return true;
    }
    if (path === '/seo.css') {
      send(res, 200, THEME_CSS, 'text/css; charset=utf-8');
      return true;
    }

    // ---- sitemaps ---------------------------------------------------------
    if (path === '/sitemap.xml' || /^\/sitemap-questions-\d+\.xml$/.test(path)) {
      await source.ready();
      const items = source.all();
      const parts = Math.max(1, Math.ceil(items.length / SITEMAP_CHUNK));
      const today = new Date().toISOString().slice(0, 10);

      if (parts === 1 && path === '/sitemap.xml') {
        send(
          res,
          200,
          `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
            items.map((q) => `  <url><loc>${site}/q/${q.slug}/</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`).join('\n') +
            `\n</urlset>\n`,
          'application/xml; charset=utf-8'
        );
        return true;
      }

      if (path === '/sitemap.xml') {
        const entries = Array.from(
          { length: parts },
          (_, i) => `  <sitemap><loc>${site}/sitemap-questions-${i + 1}.xml</loc><lastmod>${today}</lastmod></sitemap>`
        ).join('\n');
        send(res, 200, `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>\n`, 'application/xml; charset=utf-8');
        return true;
      }

      const n = Number(path.match(/-(\d+)\.xml$/)[1]);
      if (n < 1 || n > parts) {
        send(res, 404, '<?xml version="1.0"?><error>no such sitemap</error>', 'application/xml; charset=utf-8');
        return true;
      }
      const slice = items.slice((n - 1) * SITEMAP_CHUNK, n * SITEMAP_CHUNK);
      send(
        res,
        200,
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          slice.map((q) => `  <url><loc>${site}/q/${q.slug}/</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`).join('\n') +
          `\n</urlset>\n`,
        'application/xml; charset=utf-8'
      );
      return true;
    }

    // ---- question pages ----------------------------------------------------
    const m = path.match(/^\/q\/([^/]+)\/?$/);
    if (!m) return false;

    await source.ready();
    const slug = safePath(m[1]);
    const q = source.bySlug(slug);
    if (!q) {
      send(res, 404, renderNotFound(slug));
      return true;
    }

    const siblings = source.chapter(q.subject, q.chapter);
    const at = siblings.findIndex((x) => x.slug === q.slug);
    const related = siblings.filter((x) => x.slug !== q.slug).slice(0, 8);

    const subjectSlug = q.subject ? slugify(q.subject) : '';
    const chapterSlug = q.chapter ? slugify(q.chapter) : '';

    const { html } = renderQuestionPage(q, {
      // When the syllabus hub is served statically from the same domain these
      // links are valid; otherwise the renderer degrades to plain chips.
      subjectHref: subjectSlug ? `${site}/hsc-syllabus/${subjectSlug}/` : '',
      chapterHref: subjectSlug && chapterSlug ? `${site}/hsc-syllabus/${subjectSlug}/${chapterSlug}/` : '',
      chapterTotal: siblings.length,
      related,
      prev: at > 0 ? siblings[at - 1] : null,
      next: at >= 0 && at < siblings.length - 1 ? siblings[at + 1] : null,
      totalQuestions: source.stats().total,
    });

    send(res, 200, html);
    return true;
  };
}

// ---------------------------------------------------------------------------
// Standalone entry point
// ---------------------------------------------------------------------------
const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop());
if (isMain) {
  const handler = createSeoHandler();
  createServer((req, res) => {
    handler(req, res)
      .then((handled) => {
        if (!handled) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('not found');
        }
      })
      .catch((e) => {
        console.error('[seo-ssr]', e);
        if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('server error');
      });
  }).listen(PORT, '0.0.0.0', () => {
    console.log(`[seo-ssr] listening on http://0.0.0.0:${PORT}  (API: ${API})`);
  });
}

/* ---------------------------------------------------------------------------
 * Using your own Mongo source (recommended) — replace the REST sweep:
 *
 *   import mongoose from 'mongoose';
 *   import { createSeoHandler } from './seo/ssr-server.mjs';
 *
 *   const Q = mongoose.model('Question');
 *   let cache = null, cacheAt = 0;
 *   async function load() {
 *     if (cache && Date.now() - cacheAt < 6 * 3600e3) return cache;
 *     const rows = await Q.find({}, 'slug subject chapter question options ' +
 *       'optionsImages correctAnswerIndex explanation explanationImage tags level createdAt updatedAt').lean();
 *     const bySlug = new Map(rows.map((r) => [r.slug, { ...r, url: `https://www.porikkhangon.app/q/${r.slug}/` }]));
 *     const byChapter = new Map();
 *     for (const r of rows) {
 *       const k = `${r.subject}||${r.chapter}`;
 *       if (!byChapter.has(k)) byChapter.set(k, []);
 *       byChapter.get(k).push(bySlug.get(r.slug));
 *     }
 *     cache = { bySlug, byChapter, all: [...bySlug.values()], total: rows.length };
 *     cacheAt = Date.now();
 *     return cache;
 *   }
 *   const source = {
 *     ready: load,
 *     stats: () => ({ known: cache?.all.length || 0, total: cache?.total || 0 }),
 *     bySlug: (s) => cache?.bySlug.get(s) || null,
 *     chapter: (su, ch) => cache?.byChapter.get(`${su}||${ch}`) || [],
 *     all: () => cache?.all || [],
 *   };
 *   app.use((req, res, next) => createSeoHandler({ source })(req, res).then((d) => !d && next()));
 *
 * Don't forget a Mongo index:  db.questions.createIndex({ slug: 1 }, { unique: true })
 * ------------------------------------------------------------------------- */
