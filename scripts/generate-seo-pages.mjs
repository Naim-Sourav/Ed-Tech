#!/usr/bin/env node
/**
 * generate-seo-pages.mjs
 * ---------------------------------------------------------------------------
 * Generates static, fully crawlable SEO pages (no JavaScript required) into
 * the build output directory (default: dist/):
 *
 *   /hsc-syllabus/                          syllabus hub
 *   /hsc-syllabus/<subject>/                14 subject pages
 *   /hsc-syllabus/<subject>/<chapter>/      95 chapter pages
 *   /questions/                             question-bank index (by subject)
 *   /questions/<subject>/<chapter>/         question list per chapter
 *   /q/<slug>/                              PUBLIC QUESTION PAGES
 *   /seo.css                                shared stylesheet (was inline)
 *   sitemap.xml (+ sitemap-part-N.xml)      every URL above
 *
 * Question sources (merged, de-duplicated):
 *   1. Live question bank API — the FULL collection is paged through
 *      (50k+ rows) and cached to .seo-cache/ so repeated builds are instant.
 *   2. Bundled datasets in /data (*.json) — guaranteed fallback so question
 *      pages exist even if the API is unreachable at build time.
 *
 * Every question in the database is *known* to the build (real counts, chapter
 * lists, sitemap candidates) but only `--questions N` of them get their own
 * static page, because GitHub Pages caps published sites at 1 GB and deploys
 * at 10 minutes. To cover 100% of the DB, run seo/ssr-server.mjs instead —
 * see SEO-QUESTIONS.md.
 *
 * Usage:
 *   node scripts/generate-seo-pages.mjs                     # dist/, fetches API
 *   node scripts/generate-seo-pages.mjs --skip-fetch        # bundled data only
 *   node scripts/generate-seo-pages.mjs --questions all     # every question
 *   node scripts/generate-seo-pages.mjs --questions 5000    # top 5000 (default)
 *   node scripts/generate-seo-pages.mjs --refresh           # ignore the cache
 *   node scripts/generate-seo-pages.mjs --out dist
 */

import { buildSync } from 'esbuild';
import { mkdirSync, writeFileSync, rmSync, mkdtempSync, readFileSync, existsSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { SITE, BRAND, THEME_CSS } from '../seo/theme.mjs';
import {
  slugify,
  bnSlug,
  safePath,
  esc,
  plain,
  bnCount,
  pageShell,
  breadcrumbLd,
  renderQuestionPage,
  renderChapterQuestionList,
  renderQuestionsIndex,
} from '../seo/render.mjs';

const API = 'https://mongodb-hb6b.onrender.com/api';
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const TODAY = new Date().toISOString().slice(0, 10);
const HUB = '/hsc-syllabus/';
const QHUB = '/questions/';

const argv = process.argv;
const SKIP_FETCH = argv.includes('--skip-fetch');
const REFRESH = argv.includes('--refresh');
const outArg = argv.indexOf('--out');
const OUT = outArg !== -1 ? argv[outArg + 1] : join(ROOT, 'dist');

// When the SSR server (seo/ssr-server.mjs) serves /q/*, EVERY question has a
// real page — so chapter lists can link the whole bank instead of the subset
// that got baked into dist/.
const LINK_ALL = argv.includes('--link-all');

const qArg = argv.indexOf('--questions');
const Q_RAW = qArg !== -1 ? argv[qArg + 1] : '5000';
const Q_ALL = String(Q_RAW).toLowerCase() === 'all';
const Q_LIMIT = Q_ALL ? Infinity : Math.max(50, parseInt(Q_RAW, 10) || 5000);

const CACHE_DIR = join(ROOT, '.seo-cache');
const CACHE_FILE = join(CACHE_DIR, 'questions-full.json');
const CACHE_MAX_AGE_MS = 12 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// 1. Load SYLLABUS_DB from TypeScript without adding runtime deps
// ---------------------------------------------------------------------------
const tmp = mkdtempSync(join(tmpdir(), 'seo-syllabus-'));
const bundlePath = join(tmp, 'syllabus.mjs');
buildSync({
  entryPoints: [join(ROOT, 'services', 'syllabusData.ts')],
  bundle: true,
  format: 'esm',
  outfile: bundlePath,
  logLevel: 'silent',
});
const { SYLLABUS_DB } = await import(pathToFileURL(bundlePath).href);
rmSync(tmp, { recursive: true, force: true });

// ---------------------------------------------------------------------------
// 2. Syllabus helpers
// ---------------------------------------------------------------------------
function topicsOf(chapterValue) {
  return (chapterValue || []).map((item) =>
    typeof item === 'string' ? { title: item, subTopics: [] } : { title: item, subTopics: item.subTopics || [] }
  );
}

function countTopics(topics) {
  return topics.reduce((n, t) => n + 1 + t.subTopics.length, 0);
}

function subjectGroup(subject) {
  const s = subject.toLowerCase();
  if (s.startsWith('physics') || s.startsWith('chemistry') || s.startsWith('higher math')) return 'science-math';
  if (s.startsWith('biology')) return 'biology';
  if (s.startsWith('bangla')) return 'bangla';
  if (s.startsWith('english')) return 'english';
  if (s.startsWith('ict')) return 'ict';
  return 'general';
}

const GROUP_TIPS = {
  'science-math': [
    'প্রতিটি অধ্যায়ের সংজ্ঞা ও সূত্র নিজের ভাষায় লিখে রাখো — সূত্র মুখস্থ নয়, ব্যবহার শেখো।',
    'অধ্যায় শেষে অন্তত ৫০টি MCQ সলভ করো এবং ভুলগুলো আলাদা করে নোট করো।',
    'গাণিতিক সমস্যাগুলো সময় নিয়ে সলভ করো; ভর্তি পরীক্ষায় গতিই পার্থক্য গড়ে দেয়।',
    'বোর্ড প্রশ্ন + ভর্তি প্রশ্ন — দুই ধরনের প্রশ্নই অনুশীলন করো, কারণ ধরন আলাদা।',
  ],
  biology: [
    'চিত্র ও ডায়াগ্রামসহ পড়ো; বায়োলজির অনেক প্রশ্ন চিত্রভিত্তিক আসে।',
    'প্রতিটি অধ্যায়ের মূল শব্দগুলো (keywords) হাইলাইট করে রাখো — রিভিশনে কাজে লাগবে।',
    'উদাহরণ ও বৈজ্ঞানিক নামগুলো টেবিল আকারে লিখে রাখো।',
    'অধ্যায় শেষে MCQ + সংক্ষিপ্ত প্রশ্ন দুটোই অনুশীলন করো।',
  ],
  bangla: [
    'গদ্য-পদ্যের মূল ভাব ও লেখকের পরিচিতি নোট করো।',
    'ব্যাকরণ অংশ নিয়মিত অনুশীলন করো — এখানে নম্বর নিশ্চিত।',
    'উপন্যাস ও নাটকের প্লট, চরিত্র ও প্রশ্নোত্তর গুছিয়ে রাখো।',
    'নির্মিতি অংশের ফরম্যাটগুলো মুখস্থ রাখো এবং নিজে লিখে অভ্যাস করো।',
  ],
  english: [
    'Grammar-এর প্রতিটি টপিকের নিয়ম + exception উদাহরণসহ শেখো।',
    'প্রতিদিন অন্তত ২০টি MCQ সলভ করো — pattern চেনা সহজ হবে।',
    'Reading ও vocab-এর জন্য নিয়মিত passage পড়ো।',
    'ভুল করা প্রশ্নগুলো পরে আবার সলভ করো।',
  ],
  ict: [
    'অধ্যায়ের প্র্যাকটিক্যাল অংশগুলো হাতে-কলমে করে দেখো।',
    'সংখ্যা পদ্ধতি ও লজিক গেটের অঙ্কগুলো নিজে করো।',
    'প্রোগ্রামিং অংশের সিনট্যাক্স নোট করে রাখো।',
    'তাত্ত্বিক প্রশ্নগুলো পয়েন্ট আকারে লিখে অভ্যাস করো।',
  ],
  general: [
    'অধ্যায়ের মূল কনসেপ্ট আগে বোঝো, তারপর প্রশ্ন অনুশীলন করো।',
    'প্রতিটি অধ্যায় শেষে নিজেকে ১০ মিনিটে রিভিশন দাও।',
    'ভুল প্রশ্নগুলো সংরক্ষণ করে রাখো এবং সপ্তাহে একদিন রিভিশন দাও।',
    'সময় ধরে মডেল টেস্ট দাও যাতে গতি ও নির্ভুলতা দুটোই বাড়ে।',
  ],
};

// ---------------------------------------------------------------------------
// 3. Output helpers
// ---------------------------------------------------------------------------
const urls = []; // [path, priority]
function writePage(relPath, html) {
  const full = join(OUT, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, html, 'utf8');
  return relPath.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
}

// ---------------------------------------------------------------------------
// 4. Question collection
// ---------------------------------------------------------------------------
async function fetchJson(url, timeoutMs = 30000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

async function pool(tasks, concurrency = 8) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < tasks.length) {
      const idx = i++;
      try {
        results[idx] = await tasks[idx]();
      } catch {
        results[idx] = null;
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, worker));
  return results;
}

/** Normalise any raw row (API or bundled JSON) into the shape the renderer wants. */
function normalise(q, source) {
  if (!q || !q.question || !Array.isArray(q.options) || q.options.length < 2) return null;
  const id = q._id || q.id || `local-${bnSlug(q.question)}-${q.options.length}`;
  let slug = safePath(q.slug || bnSlug(q.question));
  if (slug.length < 12) slug = safePath(`${bnSlug(q.chapter || q.subject || 'mcq')}-${slug}`);
  return {
    _id: String(id),
    question: String(q.question),
    options: q.options.map(String),
    optionsImages: q.optionsImages || [],
    correctAnswerIndex: Number(q.correctAnswerIndex) || 0,
    explanation: q.explanation || '',
    subject: q.subject || '',
    chapter: q.chapter || '',
    level: q.level || '',
    examRef: q.examRef || '',
    tags: q.tags || [],
    questionImage: q.questionImage || '',
    explanationImage: q.explanationImage || '',
    createdAt: Number(q.createdAt) || 0,
    updatedAt: Number(q.updatedAt) || 0,
    slug,
    source,
  };
}

/**
 * Page through the WHOLE collection. Uses `total` from the first response so
 * the number of requests adapts to however big the bank has grown.
 */
async function fetchAllFromApi({ limit = 500, concurrency = 6, deadlineMs = 600000 } = {}) {
  const first = await fetchJson(`${API}/admin/questions?page=1&limit=${limit}`);
  const total = Number(first?.total) || (first?.questions || []).length;
  const gotFirst = (first?.questions || []).length;
  // Some APIs silently cap `limit`; trust what actually came back.
  const effLimit = total > limit && gotFirst > 0 && gotFirst < limit ? gotFirst : limit;
  const pages = Math.max(1, Math.ceil(total / effLimit));
  const deadline = Date.now() + deadlineMs;
  console.log(`[seo] API reports ${total} questions → ${pages} pages of ${effLimit}`);

  const rows = [...(first?.questions || [])];
  const tasks = [];
  for (let p = 2; p <= pages; p++) {
    tasks.push(async () => {
      if (Date.now() > deadline) return null;
      const data = await fetchJson(`${API}/admin/questions?page=${p}&limit=${effLimit}`);
      return data?.questions || [];
    });
  }
  const batches = Math.ceil(tasks.length / 60);
  let empty = 0;
  for (let b = 0; b < batches; b++) {
    const slice = tasks.slice(b * 60, b * 60 + 60);
    const res = await pool(slice, concurrency);
    for (const list of res) {
      if (list && list.length) rows.push(...list);
      else empty++;
    }
    process.stdout.write(`\r[seo] fetched ${rows.length}/${total} …`);
  }
  process.stdout.write('\n');
  if (empty > 20) console.warn(`[seo] ${empty} pages came back empty — the bank may be smaller than reported`);
  return { rows, total };
}

/** Bundled JSON datasets — always available, used as supplement/fallback. */
function loadBundled(add) {
  for (const f of ['data/gst_a_23_24_questions.json', 'data/medical_24_25_questions.json']) {
    try {
      const arr = JSON.parse(readFileSync(join(ROOT, f), 'utf8'));
      (Array.isArray(arr) ? arr : []).forEach((q) => add(q, 'bundled'));
    } catch (e) {
      console.warn(`[seo] could not read ${f}: ${e.message}`);
    }
  }
}

/**
 * Every question in the database, from cache when possible.
 * Returns { questions: Map<id, q>, total, cached }
 */
async function collectAllQuestions() {
  const map = new Map();
  const add = (q, source) => {
    const n = normalise(q, source);
    if (n && !map.has(n._id)) map.set(n._id, n);
  };

  // (a) cache
  let total = 0;
  let cached = false;
  if (!REFRESH && existsSync(CACHE_FILE)) {
    const age = Date.now() - statSync(CACHE_FILE).mtimeMs;
    if (age < CACHE_MAX_AGE_MS) {
      try {
        const parsed = JSON.parse(readFileSync(CACHE_FILE, 'utf8'));
        for (const q of parsed.questions || []) add(q, q.source || 'api');
        if (map.size) {
          total = parsed.total || map.size;
          cached = true;
          console.log(`[seo] using cache: ${map.size} questions (${Math.round(age / 60000)} min old, DB total ${total})`);
        }
      } catch (e) {
        console.warn(`[seo] cache unreadable (${e.message}) — refetching`);
      }
    }
  }

  // (b) live API — full sweep (skipped when the cache is fresh)
  if (!cached && !SKIP_FETCH) {
    try {
      const { rows, total: t } = await fetchAllFromApi();
      total = t;
      rows.forEach((q) => add(q, 'api'));
      console.log(`[seo] API sweep complete: ${map.size} unique questions`);
    } catch (e) {
      console.warn(`[seo] API unreachable (${e.message}) — falling back to bundled datasets`);
    }
  }

  // (c) bundled supplement / fallback
  loadBundled(add);

  // (d) persist cache
  if (!cached && map.size > 1000) {
    try {
      mkdirSync(CACHE_DIR, { recursive: true });
      writeFileSync(CACHE_FILE, JSON.stringify({ total, fetchedAt: Date.now(), questions: [...map.values()] }), 'utf8');
      console.log(`[seo] cached ${map.size} questions → .seo-cache/questions-full.json`);
    } catch (e) {
      console.warn(`[seo] could not write cache: ${e.message}`);
    }
  }

  return { questions: map, total: total || map.size, cached };
}

/** Rank questions so a capped build spends its page budget on the best ones. */
function scoreQuestion(q) {
  let s = 0;
  if (q.explanation && q.explanation.trim().length > 40) s += 100;
  else if (q.explanation) s += 40;
  if (q.level === 'ADMISSION') s += 30;
  if (q.tags?.length) s += 12;
  if (q.options.length === 4) s += 6;
  if (q.chapter) s += 4;
  return s;
}

// ---------------------------------------------------------------------------
// 5. Generate
// ---------------------------------------------------------------------------
console.log('[seo] collecting questions…');
const { questions: allMap, total: dbTotal } = await collectAllQuestions();

// Unique slugs + stable URLs
const seenSlug = new Map();
for (const q of allMap.values()) {
  const n = seenSlug.get(q.slug) || 0;
  seenSlug.set(q.slug, n + 1);
  if (n > 0) q.slug = `${q.slug}-${q._id.slice(-6)}`;
  q.url = `${SITE}/q/${q.slug}/`;
}

// Index by chapter — real counts for every chapter, even if not every question
// in it gets a static page.
const byChapterKey = new Map(); // "subject||chapter" -> questions[]
for (const q of allMap.values()) {
  const key = `${q.subject}||${q.chapter}`;
  if (!byChapterKey.has(key)) byChapterKey.set(key, []);
  byChapterKey.get(key).push(q);
}
for (const list of byChapterKey.values()) list.sort((a, b) => a.orderIndex - b.orderIndex || a._id.localeCompare(b._id));

// Which questions actually get their own static page?
const ranked = [...allMap.values()].sort((a, b) => scoreQuestion(b) - scoreQuestion(a));
const pageQuestions = ranked.slice(0, Q_LIMIT);
const published = new Set(pageQuestions.map((q) => q._id));
for (const q of pageQuestions) q.published = true;

// De-duplicate published slugs per chapter so list order is stable
const chapterPublished = new Map();
for (const q of pageQuestions) {
  const key = `${q.subject}||${q.chapter}`;
  if (!chapterPublished.has(key)) chapterPublished.set(key, []);
  chapterPublished.get(key).push(q);
}
for (const list of chapterPublished.values()) list.sort((a, b) => a._id.localeCompare(b._id));

console.log(
  `[seo] DB total: ${dbTotal} · known: ${allMap.size} · static question pages: ${pageQuestions.length}` +
    (Q_ALL ? '' : ` (cap --questions ${Q_LIMIT})`)
);

// --- shared stylesheet ------------------------------------------------------
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'seo.css'), THEME_CSS.trim() + '\n', 'utf8');

const subjects = Object.entries(SYLLABUS_DB);

// --- /questions/ hub --------------------------------------------------------
{
  const subjectCards = [];
  for (const [subject, chapters] of subjects) {
    let count = 0;
    for (const chapter of Object.keys(chapters)) count += (byChapterKey.get(`${subject}||${chapter}`) || []).length;
    subjectCards.push({
      name: subject,
      href: `${SITE}${HUB}${slugify(subject)}/`,
      chapters: Object.keys(chapters).length,
      count,
    });
  }
  // Subjects present in the bank but absent from SYLLABUS_DB
  const knownSubjects = new Set(subjects.map(([s]) => s));
  const extraCounts = new Map();
  for (const q of allMap.values()) {
    if (!q.subject || knownSubjects.has(q.subject)) continue;
    extraCounts.set(q.subject, (extraCounts.get(q.subject) || 0) + 1);
  }
  for (const [subject, count] of extraCounts) {
    subjectCards.push({ name: subject, href: `${SITE}/#/qbank?subject=${encodeURIComponent(subject)}`, chapters: 0, count });
  }

  const path = writePage('questions/index.html', renderQuestionsIndex({ subjects: subjectCards, totalQuestions: dbTotal }).html);
  urls.push([path, '0.9']);
}

// --- Syllabus hub -----------------------------------------------------------
{
  const totalChapters = subjects.reduce((n, [, ch]) => n + Object.keys(ch).length, 0);
  const cards = subjects
    .map(([subject, chapters]) => {
      const slug = slugify(subject);
      const n = Object.keys(chapters).length;
      return `<a class="gcard" href="${SITE}${HUB}${slug}/"><b>${esc(subject)}</b><span>${n}টি অধ্যায় · সম্পূর্ণ সিলেবাস ও টপিক লিস্ট</span></a>`;
    })
    .join('\n');

  const body = `
<h1>HSC সিলেবাস ২০২৬ — বিষয় ও অধ্যায়ভিত্তিক পূর্ণাঙ্গ গাইড</h1>
<p class="lede">পরীক্ষাঙ্গন (${BRAND})-এর অধ্যায়ভিত্তিক সিলেবাস গাইডে HSC ও ভর্তি পরীক্ষার ${subjects.length}টি বিষয়ের ${totalChapters}টি অধ্যায়ের সম্পূর্ণ টপিক তালিকা, প্রস্তুতি টিপস এবং ফ্রি MCQ প্র্যাকটিসের সুবিধা একসাথে পাবে। নিজের বিষয় বেছে নাও, অধ্যায় খুলে দেখো কোন কোন টপিক থেকে প্রশ্ন আসে — এবং সাথে সাথেই প্রশ্নব্যাংকে প্র্যাকটিস শুরু করো।</p>
<h2>বিষয় বেছে নাও</h2>
<div class="grid">${cards}</div>
<div class="tips"><h2>কীভাবে এই গাইড ব্যবহার করবে?</h2>
<ul class="topics">
<li>প্রথমে নিজের বিষয়ের পেজে যাও — সেখানে সব অধ্যায়ের তালিকা পাবে।</li>
<li>অধ্যায়ের পেজে সেই অধ্যায়ের প্রতিটি টপিক ও সাব-টপিক সাজানো আছে।</li>
<li>টপিক শেষে পরীক্ষাঙ্গনের প্রশ্নব্যাংকে সেই অধ্যায়ের MCQ প্র্যাকটিস করো।</li>
<li>ভুল প্রশ্নগুলো সেভ করে রাখো — রিভিশনের সময় এক ক্লিকে ফিরে পাবে।</li>
</ul></div>
<div class="banner"><h2>সিলেবাস জানা যথেষ্ট নয় — প্র্যাকটিসই আসল</h2>
<p>${bnCount(dbTotal)}+ প্রশ্ন, মডেল টেস্ট, AI টিউটর ও কুইজ ব্যাটল — সব ফ্রিতে।</p>
<a href="${SITE}/#/auth">এখনই ফ্রি একাউন্ট খোলো</a></div>`;

  const jsonLd = [
    breadcrumbLd([
      ['পরীক্ষাঙ্গন', `${SITE}/`],
      ['HSC সিলেবাস গাইড', `${SITE}${HUB}`],
    ]),
    {
      '@type': 'ItemList',
      name: 'HSC বিষয়সমূহের সিলেবাস গাইড',
      numberOfItems: subjects.length,
      itemListElement: subjects.map(([subject], i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: subject,
        url: `${SITE}${HUB}${slugify(subject)}/`,
      })),
    },
  ];

  const path = writePage(
    'hsc-syllabus/index.html',
    pageShell({
      title: `HSC সিলেবাস গাইড — বিষয় ও অধ্যায়ভিত্তিক টপিক লিস্ট | ${BRAND}`,
      description: 'HSC ও ভর্তি পরীক্ষার সব বিষয়ের অধ্যায়ভিত্তিক সিলেবাস, টপিক লিস্ট ও প্রস্তুতি টিপস এক জায়গায়। পরীক্ষাঙ্গনে ফ্রি MCQ প্র্যাকটিসসহ পূর্ণাঙ্গ প্রস্তুতি নাও।',
      canonical: `${SITE}${HUB}`,
      breadcrumbs: [
        ['পরীক্ষাঙ্গন', `${SITE}/`],
        ['HSC সিলেবাস গাইড', `${SITE}${HUB}`],
      ],
      jsonLd,
      body,
    })
  );
  urls.push([path, '0.9']);
}

// --- Subject + chapter pages -----------------------------------------------
for (const [subject, chapters] of subjects) {
  const subjectSlug = slugify(subject);
  const chapterEntries = Object.entries(chapters);
  const group = subjectGroup(subject);
  const tips = GROUP_TIPS[group] || GROUP_TIPS.general;

  // Subject page
  {
    const cards = chapterEntries
      .map(([chapter, value], i) => {
        const n = countTopics(topicsOf(value));
        const qCount = (byChapterKey.get(`${subject}||${chapter}`) || []).length;
        return `<a class="gcard" href="${SITE}${HUB}${subjectSlug}/${slugify(chapter)}/"><b>${i + 1}. ${esc(chapter)}</b><span>${n}টি টপিক${qCount ? ` · ${bnCount(qCount)}টি প্রশ্ন` : ''}</span>${qCount ? `<span class="count">${bnCount(qCount)} প্রশ্ন ও সমাধান</span>` : ''}</a>`;
      })
      .join('\n');

    const body = `
<h1>${esc(subject)} — HSC সিলেবাস ও অধ্যায় তালিকা</h1>
<p class="lede">${esc(subject)} বিষয়ের মোট ${chapterEntries.length}টি অধ্যায়ের সম্পূর্ণ সিলেবাস, অধ্যায়ভিত্তিক টপিক লিস্ট এবং প্রস্তুতি কৌশল। প্রতিটি অধ্যায়ে ক্লিক করলে সেই অধ্যায়ের সব টপিক ও সাব-টপিক দেখতে পাবে, এবং পরীক্ষাঙ্গনের প্রশ্নব্যাংকে সরাসরি প্র্যাকটিস শুরু করতে পারবে।</p>
<h2>অধ্যায়সমূহ</h2>
<div class="grid">${cards}</div>
<div class="tips"><h2>${esc(subject)} প্রস্তুতির কার্যকর কৌশল</h2>
<ul class="topics">${tips.map((t) => `<li>${esc(t)}</li>`).join('\n')}</ul></div>
<div class="banner"><h2>${esc(subject)}-এর MCQ প্র্যাকটিস করো ফ্রিতে</h2>
<p>অধ্যায়ভিত্তিক প্রশ্নব্যাংক, ব্যাখ্যাসহ উত্তর ও প্রোগ্রেস ট্র্যাকিং।</p>
<a href="${SITE}/#/qbank?level=ACADEMIC&subject=${encodeURIComponent(subject)}">প্রশ্নব্যাংক খোলো</a></div>`;

    const jsonLd = [
      breadcrumbLd([
        ['পরীক্ষাঙ্গন', `${SITE}/`],
        ['HSC সিলেবাস গাইড', `${SITE}${HUB}`],
        [subject, `${SITE}${HUB}${subjectSlug}/`],
      ]),
      {
        '@type': 'Course',
        name: `${subject} — HSC প্রস্তুতি কোর্স`,
        description: `HSC ${subject} বিষয়ের সম্পূর্ণ সিলেবাস, অধ্যায়ভিত্তিক টপিক লিস্ট, প্রস্তুতি টিপস এবং MCQ প্র্যাকটিস।`,
        inLanguage: 'bn-BD',
        educationalLevel: 'Higher Secondary',
        teaches: subject,
        provider: { '@id': `${SITE}/#organization` },
        hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online' },
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'BDT', category: 'free' },
      },
    ];

    const path = writePage(
      `hsc-syllabus/${subjectSlug}/index.html`,
      pageShell({
        title: `${subject} সিলেবাস ও অধ্যায় তালিকা | ${BRAND}`,
        description: `${subject} বিষয়ের HSC সিলেবাস: ${chapterEntries.length}টি অধ্যায়ের টপিক লিস্ট, প্রস্তুতি টিপস ও ফ্রি MCQ প্র্যাকটিস — পরীক্ষাঙ্গনে।`,
        canonical: `${SITE}${HUB}${subjectSlug}/`,
        breadcrumbs: [
          ['পরীক্ষাঙ্গন', `${SITE}/`],
          ['HSC সিলেবাস গাইড', `${SITE}${HUB}`],
          [subject, `${SITE}${HUB}${subjectSlug}/`],
        ],
        jsonLd,
        body,
      })
    );
    urls.push([path, '0.8']);
  }

  // Chapter pages
  chapterEntries.forEach(([chapter, value], idx) => {
    const chapterSlug = slugify(chapter);
    const topics = topicsOf(value);
    const topicCount = countTopics(topics);
    const chapterAll = byChapterKey.get(`${subject}||${chapter}`) || [];
    const chapterPub = chapterPublished.get(`${subject}||${chapter}`) || [];

    const topicHtml = topics
      .map((t, i) => {
        const sub = t.subTopics.length ? `<ul>${t.subTopics.map((st) => `<li>${esc(st)}</li>`).join('')}</ul>` : '';
        return `<li><b>${i + 1}. ${esc(t.title)}</b>${sub}</li>`;
      })
      .join('\n');

    const sampleHtml = chapterPub.length
      ? `<h2>এই অধ্যায়ের প্রশ্ন ও সমাধান</h2>
<div class="qlist">${chapterPub
          .slice(0, 8)
          .map((q, i) => `<a href="${q.url}"><span class="n">${i + 1}</span><span>${esc(plain(q.question).slice(0, 120))}</span><span class="arrow">→</span></a>`)
          .join('\n')}</div>
<a class="more-link" href="${SITE}${QHUB}${subjectSlug}/${chapterSlug}/">এই অধ্যায়ের সব ${bnCount(chapterPub.length)}টি প্রশ্ন দেখো →</a>`
      : '';

    const prev = chapterEntries[idx - 1];
    const next = chapterEntries[idx + 1];
    const pager = `<div class="pager">
      ${prev ? `<a href="${SITE}${HUB}${subjectSlug}/${slugify(prev[0])}/"><small>← আগের অধ্যায়</small><span>${esc(prev[0])}</span></a>` : ''}
      ${next ? `<a href="${SITE}${HUB}${subjectSlug}/${slugify(next[0])}/"><small>পরের অধ্যায় →</small><span>${esc(next[0])}</span></a>` : `<a href="${SITE}${HUB}${subjectSlug}/"><small>সব অধ্যায়</small><span>${esc(subject)}</span></a>`}
    </div>`;

    const body = `
<h1>${esc(subject)} — ${esc(chapter)}: সম্পূর্ণ সিলেবাস ও টপিক লিস্ট</h1>
<p class="lede">${esc(subject)} বিষয়ের ${idx + 1} নং অধ্যায় "${esc(chapter)}"-এর সম্পূর্ণ টপিক ও সাব-টপিক তালিকা (${topicCount}টি টপিক${chapterAll.length ? `, ${bnCount(chapterAll.length)}টি প্রশ্ন` : ''})। সিলেবাস ধরে পড়ো, তারপর পরীক্ষাঙ্গনের প্রশ্নব্যাংকে এই অধ্যায়ের MCQ প্র্যাকটিস করে নিজেকে যাচাই করো।</p>
<h2>অধ্যায়ের টপিকসমূহ</h2>
<ul class="topics">${topicHtml}</ul>
${sampleHtml}
<div class="tips"><h2>এই অধ্যায় পড়ার টিপস</h2>
<ul class="topics">${tips.slice(0, 3).map((t) => `<li>${esc(t)}</li>`).join('\n')}
<li>অধ্যায় শেষে পরীক্ষাঙ্গনে "${esc(chapter)}" এর প্রশ্ন সলভ করো এবং ভুলগুলো সেভ করে রাখো।</li></ul></div>
${pager}
<div class="banner"><h2>"${esc(chapter)}" এর প্রশ্ন প্র্যাকটিস করবে?</h2>
<p>ব্যাখ্যাসহ উত্তর, টাইমার ও ইনস্ট্যান্ট রেজাল্ট — একদম ফ্রি।</p>
<a href="${SITE}/#/qbank?level=ACADEMIC&subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(chapter)}">এই অধ্যায়ের প্রশ্ন সলভ করো</a></div>`;

    const jsonLd = [
      breadcrumbLd([
        ['পরীক্ষাঙ্গন', `${SITE}/`],
        ['HSC সিলেবাস গাইড', `${SITE}${HUB}`],
        [subject, `${SITE}${HUB}${subjectSlug}/`],
        [chapter, `${SITE}${HUB}${subjectSlug}/${chapterSlug}/`],
      ]),
      {
        '@type': 'Chapter',
        name: `${chapter} — ${subject}`,
        position: idx + 1,
        inLanguage: 'bn-BD',
        description: `${subject} বিষয়ের "${chapter}" অধ্যায়ের সম্পূর্ণ টপিক ও সাব-টপিক তালিকা এবং প্রস্তুতি গাইড।`,
        isPartOf: {
          '@type': 'Course',
          name: `${subject} — HSC প্রস্তুতি কোর্স`,
          url: `${SITE}${HUB}${subjectSlug}/`,
          provider: { '@id': `${SITE}/#organization` },
        },
      },
    ];

    const path = writePage(
      `hsc-syllabus/${subjectSlug}/${chapterSlug}/index.html`,
      pageShell({
        title: `${chapter} | ${subject} সিলেবাস ও টপিক লিস্ট | ${BRAND}`,
        description: `${subject} — ${chapter}: ${topicCount}টি টপিকের সম্পূর্ণ তালিকা, প্রস্তুতি টিপস ও ফ্রি MCQ প্র্যাকটিস। পরীক্ষাঙ্গনে অধ্যায়ভিত্তিক প্রস্তুতি শুরু করো।`,
        canonical: `${SITE}${HUB}${subjectSlug}/${chapterSlug}/`,
        breadcrumbs: [
          ['পরীক্ষাঙ্গন', `${SITE}/`],
          ['HSC সিলেবাস গাইড', `${SITE}${HUB}`],
          [subject, `${SITE}${HUB}${subjectSlug}/`],
          [chapter, `${SITE}${HUB}${subjectSlug}/${chapterSlug}/`],
        ],
        jsonLd,
        body,
      })
    );
    urls.push([path, '0.7']);
  });
}

// --- Chapter question-list pages (/questions/<subject>/<chapter>/) ---------
const PER_PAGE = 100;
let listPages = 0;
const listSource = LINK_ALL ? byChapterKey : chapterPublished;
for (const [key, list] of listSource) {
  if (!list.length) continue;
  const [subject, chapter] = [key.slice(0, key.indexOf('||')), key.slice(key.indexOf('||') + 2)];
  if (!subject || !chapter) continue;
  const subjectSlug = slugify(subject);
  const chapterSlug = slugify(chapter);
  const pages = Math.ceil(list.length / PER_PAGE);
  const baseUrl = `${SITE}${QHUB}${subjectSlug}/${chapterSlug}/`;
  const subjectHref = SYLLABUS_DB[subject] ? `${SITE}${HUB}${subjectSlug}/` : `${SITE}/questions/`;

  for (let p = 1; p <= pages; p++) {
    const slice = list.slice((p - 1) * PER_PAGE, p * PER_PAGE);
    const rel = p === 1 ? `questions/${subjectSlug}/${chapterSlug}/index.html` : `questions/${subjectSlug}/${chapterSlug}/${p}/index.html`;
    const path = writePage(
      rel,
      renderChapterQuestionList({
        subject,
        chapter,
        questions: slice,
        page: p,
        pages,
        baseUrl,
        subjectHref,
        chapterHref: baseUrl,
      }).html
    );
    urls.push([path, '0.7']);
    listPages++;
  }
}
console.log(`[seo] chapter question-list pages: ${listPages}${LINK_ALL ? ' (linking the FULL bank — requires seo/ssr-server.mjs)' : ''}`);

// --- Question pages (/q/<slug>/) -------------------------------------------
let qPages = 0;
let qBytes = 0;
const byId = new Map([...allMap.values()].map((q) => [q._id, q]));
for (const q of pageQuestions) {
  const key = `${q.subject}||${q.chapter}`;
  const siblings = (chapterPublished.get(key) || []).filter((x) => x._id !== q._id);
  const at = siblings.findIndex((x) => x.slug === q.slug);
  const related = siblings.filter((x) => x.slug !== q.slug).slice(0, 8);
  const prev = at > 0 ? siblings[at - 1] : null;
  const next = at >= 0 && at < siblings.length - 1 ? siblings[at + 1] : null;

  const subjectSlug = q.subject ? slugify(q.subject) : '';
  const chapterSlug = q.chapter ? slugify(q.chapter) : '';
  const hasSubjectPage = q.subject && SYLLABUS_DB[q.subject];
  const hasChapterPage = hasSubjectPage && SYLLABUS_DB[q.subject][q.chapter];

  const { html } = renderQuestionPage(q, {
    subjectHref: hasSubjectPage ? `${SITE}${HUB}${subjectSlug}/` : '',
    chapterHref: hasChapterPage ? `${SITE}${HUB}${subjectSlug}/${chapterSlug}/` : '',
    chapterTotal: (chapterPublished.get(key) || []).length,
    related,
    prev,
    next,
    totalQuestions: dbTotal,
  });

  writePage(`q/${q.slug}/index.html`, html);
  qBytes += Buffer.byteLength(html, 'utf8');
  urls.push([`q/${q.slug}`, '0.6']);
  qPages++;
}

// --- Sitemap -----------------------------------------------------------------
urls.push(['/', '1.0']);
const sorted = urls
  .sort((a, b) => Number(b[1]) - Number(a[1]) || a[0].localeCompare(b[0]))
  .map(([p, pr]) => ({ loc: p === '/' ? `${SITE}/` : `${SITE}/${p}/`, pr }));

const CHUNK = 40000; // Google's hard limit is 50k URLs / 50 MB per sitemap file
const urlEntry = ({ loc, pr }) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${pr === '0.6' ? 'monthly' : 'weekly'}</changefreq>
    <priority>${pr}</priority>
  </url>`;

mkdirSync(OUT, { recursive: true });
if (sorted.length <= CHUNK) {
  writeFileSync(
    join(OUT, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sorted.map(urlEntry).join('\n')}
</urlset>
`,
    'utf8'
  );
} else {
  const parts = Math.ceil(sorted.length / CHUNK);
  const entries = [];
  for (let i = 0; i < parts; i++) {
    const slice = sorted.slice(i * CHUNK, (i + 1) * CHUNK);
    const name = `sitemap-part-${i + 1}.xml`;
    writeFileSync(
      join(OUT, name),
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${slice.map(urlEntry).join('\n')}
</urlset>
`,
      'utf8'
    );
    entries.push(`  <sitemap><loc>${SITE}/${name}</loc><lastmod>${TODAY}</lastmod></sitemap>`);
  }
  writeFileSync(
    join(OUT, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</sitemapindex>
`,
    'utf8'
  );
  console.log(`[seo] sitemap split into ${parts} parts (>${CHUNK} URLs)`);
}

// --- Size report --------------------------------------------------------------
const estTotalMB = (qBytes / 1024 / 1024).toFixed(1);
console.log(
  `[seo] Generated ${urls.length - 1} pages ` +
    `(${qPages} question, ${listPages} list, syllabus rest) + sitemap.xml into ${OUT}`
);
console.log(`[seo] question pages occupy ~${estTotalMB} MB`);
if (Q_ALL && qBytes > 700 * 1024 * 1024) {
  console.warn(
    '[seo] WARNING: the question pages alone exceed ~700 MB. GitHub Pages caps published sites at 1 GB and\n' +
      '      deployments time out after 10 minutes, so a full-bank static build is likely to fail.\n' +
      '      Use seo/ssr-server.mjs to serve every question dynamically instead — see SEO-QUESTIONS.md.'
  );
}
void published;
void byId;
