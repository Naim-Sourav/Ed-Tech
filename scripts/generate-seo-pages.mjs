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
 *   /admission-questions/                   PREVIOUS-YEAR ADMISSION PAPERS hub
 *   /admission-questions/<exam>/            one page per exam (Medical, DU-A …)
 *   /admission-questions/<exam>/<YYYY-YY>/  full paper with answers +
 *                                           explanations, e.g.
 *                                           "মেডিকেল ভর্তি পরীক্ষা ২০২১-২২"
 *   /q/<slug>/                              PUBLIC QUESTION PAGES
 *                                           (Sattacademy-style: question +
 *                                           options + answer + explanation,
 *                                           one indexable URL per question)
 *   sitemap.xml                             regenerated with every URL above
 *
 * Question sources (merged, de-duplicated):
 *   1. Live question bank API (anonymous read): per-chapter sample +
 *      admission-level questions with explanations + one request per
 *      exam sitting (`board=<tag>` is an exact tag filter, e.g.
 *      "Medical '21-22") for the past-paper pages.
 *   2. Bundled datasets in /data (*.json) — guaranteed fallback so question
 *      pages exist even if the API is unreachable at build time.
 *
 * The exam catalogue (names, tag prefixes, subject order) lives in
 * data/admissionExams.ts and is shared with the in-app fallback route.
 *
 * Usage:
 *   node scripts/generate-seo-pages.mjs                 # dist/, fetches API
 *   node scripts/generate-seo-pages.mjs --skip-fetch    # bundled data only
 *   node scripts/generate-seo-pages.mjs --out dist
 */

import { buildSync } from 'esbuild';
import { mkdirSync, writeFileSync, rmSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SITE = 'https://www.porikkhangon.app';
const HUB = '/hsc-syllabus/';        // HSC syllabus hub
const ADM = '/admission-questions/'; // previous-year admission papers hub
const API = 'https://mongodb-hb6b.onrender.com/api';
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const TODAY = new Date().toISOString().slice(0, 10);
const SKIP_FETCH = process.argv.includes('--skip-fetch');

const outArg = process.argv.indexOf('--out');
const OUT = outArg !== -1 ? process.argv[outArg + 1] : join(ROOT, 'dist');

// ---------------------------------------------------------------------------
// 1. Load TypeScript data modules without adding runtime deps
// ---------------------------------------------------------------------------
async function loadTsModule(entry) {
  const tmp = mkdtempSync(join(tmpdir(), 'seo-ts-'));
  const bundlePath = join(tmp, 'bundle.mjs');
  buildSync({ entryPoints: [entry], bundle: true, format: 'esm', outfile: bundlePath, logLevel: 'silent' });
  try {
    return await import(pathToFileURL(bundlePath).href);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}
const { SYLLABUS_DB } = await loadTsModule(join(ROOT, 'services', 'syllabusData.ts'));
const {
  ADMISSION_EXAMS,
  BUNDLED_PAPERS,
  CATEGORY_LABELS_BN,
  candidateSessions,
  sessionTag,
  sessionSlug,
  sessionLabelBn,
  subjectLabelBn,
  subjectBase,
  subjectRank,
  toBnDigits,
} = await loadTsModule(join(ROOT, 'data', 'admissionExams.ts'));

// ---------------------------------------------------------------------------
// 2. Helpers
// ---------------------------------------------------------------------------
const BN_DIGITS = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
const TRANSLIT = {
  'অ': 'o', 'আ': 'a', 'ই': 'i', 'ঈ': 'ii', 'উ': 'u', 'ঊ': 'uu', 'ঋ': 'ri', 'এ': 'e', 'ঐ': 'oi', 'ও': 'o', 'ঔ': 'ou',
  'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng', 'চ': 'c', 'ছ': 'ch', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'n',
  'ট': 't', 'ঠ': 'th', 'ড': 'd', 'ঢ': 'dh', 'ণ': 'n', 'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
  'প': 'p', 'ফ': 'f', 'ব': 'b', 'ভ': 'bh', 'ম': 'm', 'য': 'y', 'র': 'r', 'ল': 'l', 'শ': 'sh', 'ষ': 'sh',
  'স': 's', 'হ': 'h', 'ড়': 'r', 'ঢ়': 'rh', 'য়': 'y', 'ৎ': 't', 'ং': 'ng', 'ঃ': 'h', 'ঁ': 'n',
  'া': 'a', 'ি': 'i', 'ী': 'i', 'ু': 'u', 'ূ': 'u', 'ৃ': 'ri', 'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou',
  '্': '', '়': '', '৳': '', 'ঽ': '',
};

function slugify(input) {
  let s = String(input);
  for (const [bn, en] of Object.entries(BN_DIGITS)) s = s.split(bn).join(en);
  let out = '';
  for (const ch of s) {
    if (/[a-z0-9]/i.test(ch)) out += ch;
    else if (TRANSLIT[ch] !== undefined) out += TRANSLIT[ch];
    else out += '-';
  }
  out = out.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return out || 'page';
}

/** Bengali-preserving slug, same style as the backend `generate-slugs` job. */
function bnSlug(text) {
  return String(text)
    .normalize('NFC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\\[a-zA-Z]+/g, ' ')          // drop TeX commands (\frac, \mathrm…)
    .replace(/[$^_{}~\\]/g, ' ')           // drop TeX punctuation
    .replace(/[\u0028\u0029\[\]<>«»"'`.,;:!?!…।,]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 70)
    .replace(/-$/g, '');
}

/** Filesystem/URL safe variant of a slug (Bengali kept, path chars removed). */
function safePath(slug) {
  const s = String(slug).replace(/[/?#\\]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return s || 'q';
}

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Root-relative form of an internal URL (keeps canonical/OG absolute). */
function rel(u) {
  const v = String(u);
  return v.startsWith(SITE) ? (v.slice(SITE.length) || '/') : v;
}

function topicsOf(chapterValue) {
  return (chapterValue || []).map((item) =>
    typeof item === 'string' ? { title: item, subTopics: [] } : { title: item.title, subTopics: item.subTopics || [] }
  );
}

function countTopics(topics) {
  return topics.reduce((n, t) => n + 1 + t.subTopics.length, 0);
}

function plain(text) {
  // Strip lightweight TeX markup for meta/description usage
  return String(text ?? '')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/[${}^_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
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
    'তাত্ত্বিক প্রশ্নের উত্তর পয়েন্ট আকারে লিখে অভ্যাস করো।',
  ],
  general: [
    'অধ্যায়ের মূল কনসেপ্ট আগে বোঝো, তারপর প্রশ্ন অনুশীলন করো।',
    'প্রতিটি অধ্যায় শেষে নিজেকে ১০ মিনিটে রিভিশন দাও।',
    'ভুল প্রশ্নগুলো সংরক্ষণ করে রাখো এবং সপ্তাহে একদিন রিভিশন দাও।',
    'সময় ধরে মডেল টেস্ট দাও যাতে গতি ও নির্ভুলতা দুটোই বাড়ে।',
  ],
};

// ---------------------------------------------------------------------------
// 3. Page shell
// ---------------------------------------------------------------------------
function shell({ title, description, canonical, breadcrumbs, jsonLd, body, mathjax = false, section = 'syllabus', head = '' }) {
  const crumbHtml = breadcrumbs
    .map(([label, href], i) => {
      const isLast = i === breadcrumbs.length - 1;
      return isLast
        ? `<span class="cur">${esc(label)}</span>`
        : `<a href="${rel(href)}">${esc(label)}</a><span class="sep">›</span>`;
    })
    .join(' ');

  return `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@600;700;800&display=swap" rel="stylesheet">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="${canonical}">
<link rel="icon" type="image/svg+xml" href="${SITE}/Pshape.svg">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Porikkhangon">
<meta property="og:locale" content="bn_BD">
<meta property="og:url" content="${canonical}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${SITE}/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE}/og-image.jpg">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
${mathjax ? `<script>window.MathJax={tex:{inlineMath:[['$','$'],['\\\\(','\\\\)']],displayMath:[['$$','$$'],['\\\\[','\\\\]']],processEscapes:true},options:{enableMenu:false},chtml:{scale:1,minScale:0.5},startup:{typeset:true}};</script>
<script async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>` : ''}
${head}
<style>
/* Warm editorial v2 — dark ink chrome, dot-grid paper, gradient flourishes */
:root{--paper:#faf9f6;--ink:#161210;--ink2:#201a16;--brand:#ff5200;--deep:#e04400;--lime:#ffb92e;--mint:#ffeade;--cream:#fff1e8;--mist:#6f655c;--line:rgba(22,18,16,.09);--ok:#16a34a;--okbg:#f2fbf5}
*{box-sizing:border-box}
body{margin:0;font-family:'Hind Siliguri','Noto Sans Bengali',system-ui,sans-serif;color:var(--ink);line-height:1.8;-webkit-font-smoothing:antialiased;
background:radial-gradient(60% 42% at 50% 0%,rgba(255,82,0,.09),transparent),radial-gradient(38% 30% at 92% 8%,rgba(255,185,46,.12),transparent),radial-gradient(rgba(22,18,16,.04) 1px,transparent 1px) var(--paper);background-size:auto,auto,22px 22px}
::selection{background:#ffd9c2;color:var(--ink)}
a{color:var(--deep)}
header{background:var(--ink);position:sticky;top:0;z-index:5;box-shadow:0 10px 30px -18px rgba(22,18,16,.6)}
.header-in{max-width:1000px;margin:0 auto;padding:13px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--paper);font-weight:700;font-size:17px}
.brand img{height:32px;width:auto;filter:brightness(0) invert(1) sepia(1) saturate(0) hue-rotate(180deg)}
.brand .mark{width:34px;height:34px;border-radius:12px;background:conic-gradient(from 140deg,var(--brand),var(--lime) 42%,#ff7a35 78%,var(--brand));display:grid;place-items:center;color:#fff;font-weight:800;font-size:16px}
.cta{background:var(--lime);color:var(--ink);text-decoration:none;font-weight:800;padding:9px 20px;border-radius:999px;font-size:14px;white-space:nowrap;box-shadow:0 10px 24px -10px rgba(255,185,46,.6);transition:transform .15s}
.cta:hover{transform:translateY(-1px)}
main{max-width:1000px;margin:0 auto;padding:34px 20px 70px}
nav.crumb{font-size:13px;color:var(--mist);margin-bottom:22px;display:flex;flex-wrap:wrap;gap:6px;font-weight:600}
nav.crumb a{color:var(--mist);text-decoration:none}
nav.crumb a:hover{color:var(--brand)}
nav.crumb .sep{color:#d8cfc6}
nav.crumb .cur{color:var(--ink)}
h1{font-family:'Noto Serif Bengali',serif;font-weight:800;font-size:clamp(26px,4.4vw,40px);line-height:1.55;margin:0 0 14px;letter-spacing:-.01em}
h1::after{content:"";display:block;width:76px;height:5px;border-radius:999px;margin-top:16px;background:linear-gradient(90deg,var(--brand),var(--lime))}
h2{font-family:'Noto Serif Bengali',serif;font-weight:700;font-size:clamp(19px,3vw,26px);margin:36px 0 14px}
h2::before{content:"";display:inline-block;width:11px;height:11px;border-radius:4px;background:linear-gradient(135deg,var(--brand),var(--lime));margin-right:10px;transform:rotate(45deg)}
p.lede{color:var(--mist);font-size:16.5px;margin:0 0 8px}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 16px}
.chip{background:#fff;border:1px solid rgba(255,82,0,.22);color:var(--deep);border-radius:999px;padding:5px 14px;font-size:13px;font-weight:700;box-shadow:0 2px 6px -2px rgba(22,18,16,.08)}
.chip::before{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--brand);margin-right:7px;vertical-align:2px}
.chip.src{background:#ffedc2;border-color:rgba(255,185,46,.5);color:#7a4d00}
.chip.src::before{background:#c47f00}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;margin:22px 0}
.card{border:1px solid var(--line);border-radius:20px;padding:18px 20px;text-decoration:none;color:var(--ink);background:#fff;transition:all .2s;box-shadow:0 1px 2px rgba(22,18,16,.04)}
.card:hover{border-color:rgba(255,82,0,.4);transform:translateY(-3px);box-shadow:0 22px 44px -20px rgba(22,18,16,.28)}
.card b{display:block;font-size:16.5px;margin-bottom:4px}
.card span{color:var(--mist);font-size:13px}
ul.topics{margin:8px 0 0;padding-left:20px}
ul.topics li{margin:6px 0}
ul.topics ul{margin:4px 0;padding-left:18px;color:var(--mist);font-size:14.5px}
.tips{background:var(--cream);border:1px solid rgba(255,82,0,.16);border-left:5px solid var(--brand);border-radius:20px;padding:18px 22px;margin:26px 0}
.tips h2{margin-top:0}
.banner{position:relative;overflow:hidden;margin:42px 0 8px;border-radius:32px;background:var(--ink);color:#fff;padding:40px 30px;text-align:center}
.banner::before{content:"";position:absolute;right:-100px;top:-100px;width:320px;height:320px;border-radius:50%;background:conic-gradient(from 120deg,rgba(255,82,0,0),rgba(255,82,0,.55),rgba(255,185,46,.4),rgba(255,82,0,0));filter:blur(60px)}
.banner::after{content:"";position:absolute;left:-80px;bottom:-120px;width:260px;height:260px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,185,46,.25),transparent);filter:blur(50px)}
.banner h2{margin:0 0 10px;color:var(--lime);position:relative}
.banner h2::before{display:none}
.banner p{margin:0 0 20px;color:rgba(255,255,255,.72);position:relative}
.banner a{position:relative;display:inline-block;background:var(--lime);color:var(--ink);font-weight:800;text-decoration:none;padding:13px 30px;border-radius:999px;box-shadow:0 16px 36px -14px rgba(255,185,46,.6);transition:transform .15s}
.banner a:hover{transform:translateY(-2px)}
.pager{display:flex;justify-content:space-between;gap:12px;margin-top:32px;flex-wrap:wrap}
.pager a{border:1px solid var(--line);background:#fff;border-radius:14px;padding:10px 18px;text-decoration:none;font-size:14px;font-weight:600;color:var(--ink)}
.pager a:hover{border-color:rgba(255,82,0,.4);color:var(--deep)}
article.qcard{position:relative;overflow:hidden;background:#fff;border:1px solid var(--line);border-radius:28px;padding:30px 28px 34px;box-shadow:0 30px 70px -32px rgba(22,18,16,.25);margin-top:6px}
article.qcard::before{content:"";position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,var(--brand),var(--lime) 55%,var(--brand))}
ol.opts{list-style:none;margin:20px 0;padding:0;display:grid;gap:11px}
ol.opts li{display:flex;align-items:flex-start;gap:13px;border:1px solid var(--line);border-radius:18px;padding:13px 17px;background:var(--paper);transition:all .18s}
ol.opts li:hover{border-color:rgba(255,82,0,.4);transform:translateY(-1px);box-shadow:0 14px 30px -18px rgba(22,18,16,.25)}
ol.opts li .lt{flex:none;width:38px;height:38px;border-radius:13px;background:var(--mint);color:var(--deep);font-weight:800;display:grid;place-items:center;font-size:16px;box-shadow:inset 0 -2px 0 rgba(224,68,0,.25)}
ol.opts li .txt{flex:1}
ol.opts li.correct{border-color:rgba(22,163,74,.5);background:var(--okbg);font-weight:700}
ol.opts li.correct .lt{background:var(--ok);color:#fff;box-shadow:none}
ol.opts li .tick{display:none;color:var(--ok);font-weight:800;font-size:13px;margin-top:6px}
ol.opts li.correct .tick{display:block}
.answer{display:flex;align-items:flex-start;gap:14px;margin:20px 0;padding:16px 20px;border-radius:18px;background:var(--okbg);border:1px solid rgba(22,163,74,.35)}
.answer .amed{flex:none;width:40px;height:40px;border-radius:50%;background:var(--ok);color:#fff;display:grid;place-items:center;font-size:19px;font-weight:800;box-shadow:0 10px 22px -10px rgba(22,163,74,.7)}
.answer b{color:var(--ok)}
.expl{margin:16px 0;padding:18px 22px;border-radius:18px;background:var(--cream);border:1px solid rgba(255,82,0,.16);border-left:5px solid var(--brand)}
.expl h2{margin:0 0 8px;font-size:18px}
.expl>div{white-space:pre-line}
.expl h2::before{width:9px;height:9px}
.qimg{max-width:100%;border-radius:12px;margin:10px 0}
.qlist{display:grid;gap:10px;margin:16px 0}
.qlist a{border:1px solid var(--line);border-radius:16px;padding:13px 18px;text-decoration:none;color:var(--ink);background:#fff;font-size:15px;font-weight:600;transition:all .15s;position:relative}
.qlist a::after{content:"→";position:absolute;right:16px;top:50%;transform:translateY(-50%);color:var(--brand);opacity:0;transition:all .15s}
.qlist a:hover{border-color:rgba(255,82,0,.4);color:var(--deep);padding-right:40px}
.qlist a:hover::after{opacity:1}
footer{background:var(--ink);color:rgba(250,249,246,.65);margin-top:56px}
.footer-in{max-width:1000px;margin:0 auto;padding:28px 20px;display:flex;flex-wrap:wrap;gap:8px 22px;align-items:center;justify-content:space-between;font-size:14px}
footer a{color:rgba(250,249,246,.65);text-decoration:none}
footer a:hover{color:var(--lime)}
@media (max-width:640px){article.qcard{padding:22px 16px}}
/* header nav */
.topnav{display:flex;gap:2px;margin-left:auto;margin-right:10px}
.topnav a{color:rgba(250,249,246,.72);text-decoration:none;font-size:13.5px;font-weight:600;padding:6px 11px;border-radius:999px;white-space:nowrap}
.topnav a:hover,.topnav a[aria-current]{background:rgba(255,255,255,.09);color:#fff}
@media (max-width:600px){.topnav{display:none}}
/* subtitle under h1 (bilingual keyword line) */
p.sub{margin:-4px 0 14px;color:var(--mist);font-size:14.5px;font-weight:600;letter-spacing:.01em}
/* quick facts */
.meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin:18px 0 6px}
.meta div{background:#fff;border:1px solid var(--line);border-radius:16px;padding:12px 14px;box-shadow:0 1px 2px rgba(22,18,16,.04)}
.meta b{display:block;font-size:22px;font-family:'Noto Serif Bengali',serif;line-height:1.3}
.meta span{font-size:12.5px;color:var(--mist);font-weight:600}
/* jump links */
.jump{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 4px}
.jump a{background:#fff;border:1px solid var(--line);border-radius:999px;padding:6px 14px;font-size:13px;font-weight:700;text-decoration:none;color:var(--ink);transition:all .15s}
.jump a:hover{border-color:rgba(255,82,0,.45);color:var(--deep)}
.jump a small{color:var(--mist);font-weight:600;margin-left:4px}
/* toolbar (JS-enhanced show/hide all answers) */
.toolbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;margin:20px 0 4px}
.tog{display:none;border:1px solid rgba(22,163,74,.4);background:var(--okbg);color:var(--ok);font-weight:800;font-size:13.5px;padding:8px 16px;border-radius:999px;cursor:pointer;font-family:inherit}
.tog:hover{background:#e6f7ec}
.js .tog{display:inline-block}
/* paper question blocks */
.qbox{background:#fff;border:1px solid var(--line);border-radius:22px;padding:18px 20px 16px;margin:12px 0;box-shadow:0 1px 2px rgba(22,18,16,.04);scroll-margin-top:80px}
.qbox .qh{display:flex;gap:12px;align-items:flex-start}
.qbox .qn{flex:none;width:34px;height:34px;border-radius:12px;background:var(--ink);color:var(--lime);font-weight:800;display:grid;place-items:center;font-size:13.5px;text-decoration:none;margin-top:3px}
.qbox .qn:hover{background:var(--deep);color:#fff}
.qbox h3{margin:0;font-size:16.5px;font-weight:700;line-height:1.75;font-family:inherit;flex:1}
.qbox .ctx{background:var(--paper);border:1px dashed var(--line);border-radius:14px;padding:10px 14px;margin:0 0 10px;font-size:14.5px;color:var(--ink)}
.qbox ol.opts{margin:12px 0 0;gap:8px}
.qbox ol.opts li{padding:9px 13px;border-radius:14px;font-size:15px}
.qbox ol.opts li .lt{width:30px;height:30px;border-radius:10px;font-size:13.5px}
.qbox .plink{font-size:12.5px;font-weight:700;color:var(--mist);text-decoration:none;white-space:nowrap;margin-top:8px}
.qbox .plink:hover{color:var(--deep)}
details.sol{margin-top:12px;border-radius:16px;border:1px solid rgba(22,163,74,.3);background:var(--okbg);overflow:hidden}
details.sol summary{cursor:pointer;list-style:none;padding:10px 16px;font-weight:800;color:var(--ok);display:flex;align-items:center;gap:8px;font-size:14.5px;user-select:none}
details.sol summary::-webkit-details-marker{display:none}
details.sol summary::before{content:"▸";display:inline-block;transition:transform .2s}
details.sol[open] summary::before{transform:rotate(90deg)}
details.sol .sol-in{padding:6px 16px 14px;border-top:1px dashed rgba(22,163,74,.3)}
details.sol .ansl{font-weight:800;margin:6px 0 4px}
details.sol .ansl b{color:var(--ok)}
details.sol .ex{margin-top:6px;font-size:15px;color:var(--ink);white-space:pre-line}
details.sol .ex .lbl{display:block;font-size:12.5px;font-weight:800;color:var(--deep);letter-spacing:.04em;margin-bottom:2px}
/* chapter-frequency table */
.freq{overflow-x:auto;margin:14px 0}
.freq table{width:100%;border-collapse:collapse;font-size:14.5px;background:#fff;border:1px solid var(--line);border-radius:16px;overflow:hidden}
.freq th,.freq td{padding:9px 14px;text-align:left;border-bottom:1px solid var(--line)}
.freq th{background:var(--cream);font-size:12.5px;color:var(--mist);letter-spacing:.03em}
.freq tr:last-child td{border-bottom:0}
.freq td.n{font-weight:800;text-align:right;width:90px}
/* session cards */
.sessions{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px;margin:18px 0}
.sessions a{display:block;background:#fff;border:1px solid var(--line);border-radius:20px;padding:16px 18px;text-decoration:none;color:var(--ink);transition:all .2s;box-shadow:0 1px 2px rgba(22,18,16,.04)}
.sessions a:hover{border-color:rgba(255,82,0,.4);transform:translateY(-3px);box-shadow:0 22px 44px -20px rgba(22,18,16,.28)}
.sessions b{display:block;font-family:'Noto Serif Bengali',serif;font-size:24px;line-height:1.3}
.sessions span{display:block;color:var(--mist);font-size:13px;margin-top:2px}
.sessions em{display:inline-block;margin-top:8px;font-style:normal;font-size:12px;font-weight:800;color:var(--deep);background:var(--mint);border-radius:999px;padding:2px 10px}
/* exam cards on the hub */
.exams{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px;margin:18px 0 26px}
.exams a{display:block;background:#fff;border:1px solid var(--line);border-radius:22px;padding:18px 20px;text-decoration:none;color:var(--ink);transition:all .2s}
.exams a:hover{border-color:rgba(255,82,0,.4);transform:translateY(-3px);box-shadow:0 22px 44px -20px rgba(22,18,16,.28)}
.exams b{display:block;font-size:16.5px;line-height:1.5}
.exams span{display:block;color:var(--mist);font-size:13px;margin-top:4px}
.exams .yrs{margin-top:10px;display:flex;flex-wrap:wrap;gap:5px}
.exams .yrs i{font-style:normal;font-size:11.5px;font-weight:700;background:var(--paper);border:1px solid var(--line);border-radius:999px;padding:1px 8px;color:var(--ink)}
/* cross-promo card */
.xlink{display:flex;gap:16px;align-items:center;justify-content:space-between;flex-wrap:wrap;background:linear-gradient(135deg,#fff1e8,#ffedc2);border:1px solid rgba(255,82,0,.18);border-radius:22px;padding:18px 22px;margin:26px 0}
.xlink b{display:block;font-size:17px}
.xlink span{color:var(--mist);font-size:14px}
.xlink a{background:var(--ink);color:#fff;text-decoration:none;font-weight:800;padding:10px 20px;border-radius:999px;font-size:14px;white-space:nowrap}
.faq details{background:#fff;border:1px solid var(--line);border-radius:16px;padding:0 18px;margin:10px 0}
.faq summary{cursor:pointer;font-weight:700;padding:13px 0;list-style:none;display:flex;justify-content:space-between;gap:12px}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{content:"+";color:var(--brand);font-weight:800;font-size:18px;line-height:1}
.faq details[open] summary::after{content:"−"}
.faq details p{margin:0 0 14px;color:var(--mist)}
@media print{header,footer,.banner,.toolbar,.jump,.pager,.xlink{display:none!important}details.sol{display:block}details.sol summary{display:none}details.sol .sol-in{display:block!important;border-top:0}details.sol:not([open]) .sol-in{display:block}}
</style>
</head>
<body>
<header><div class="header-in">
  <a class="brand" href="/"><img src="${SITE}/Pshape.svg" alt="পরীক্ষাঙ্গন লোগো"> পরীক্ষাঙ্গন</a>
  <nav class="topnav" aria-label="সেকশন">
    <a href="${HUB}"${section === 'syllabus' ? ' aria-current="page"' : ''}>HSC সিলেবাস</a>
    <a href="${ADM}"${section === 'admission' ? ' aria-current="page"' : ''}>ভর্তি প্রশ্নব্যাংক</a>
  </nav>
  <a class="cta" href="/auth">ফ্রি শুরু করো</a>
</div></header>
<main>
  <nav class="crumb" aria-label="breadcrumb">${crumbHtml}</nav>
  ${body}
</main>
<footer><div class="footer-in">
  <span>© ${new Date().getFullYear()} পরীক্ষাঙ্গন (Porikkhangon) — HSC ও এডমিশন প্রস্তুতির AI প্ল্যাটফর্ম</span>
  <span>
    <a href="/">হোম</a> ·
    <a href="${HUB}">সিলেবাস গাইড</a> ·
    <a href="${ADM}">ভর্তি প্রশ্নব্যাংক</a> ·
    <a href="/privacy">প্রাইভেসি</a> ·
    <a href="/terms">টার্মস</a>
  </span>
</div></footer>
</body>
</html>
`;
}

function breadcrumbLd(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, url], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: url,
    })),
  };
}

function writePage(relPath, html) {
  const full = join(OUT, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, html, 'utf8');
  return relPath.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
}

// ---------------------------------------------------------------------------
// 4. Question collection (API + bundled fallback)
// ---------------------------------------------------------------------------
async function fetchJson(url, timeoutMs = 20000) {
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
      } catch (e) {
        results[idx] = null;
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, worker));
  return results;
}

/** Stable identity for a question row (API `_id`, else derived from its text). */
function questionId(q) {
  return q._id || q.id || `local-${bnSlug(q.question)}-${(q.options || []).length}`;
}

/** Normalised text key used to spot the same question coming from two sources. */
function textKey(q) {
  return plain(q.question).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim().slice(0, 160);
}

// ---------------------------------------------------------------------------
// 4-pre. Previous-year admission papers (one exact-tag query per sitting)
// ---------------------------------------------------------------------------
const PAPER_MIN_QUESTIONS = 10;   // skip sittings with too little data (thin pages)
const PAPER_PAGE_LIMIT = 200;
const PAPER_MAX_QUESTIONS = 400;
const PAPER_SANITY_TOTAL = 2000;  // a "paper" bigger than this means the filter was ignored

/** One retry for transient failures (Render free tier hiccups). */
async function fetchJsonRetry(url, timeoutMs) {
  try {
    return await fetchJson(url, timeoutMs);
  } catch {
    await new Promise((r) => setTimeout(r, 1500));
    return fetchJson(url, timeoutMs);
  }
}

async function fetchPaper(tag) {
  const url = (page) => `${API}/admin/questions?page=${page}&limit=${PAPER_PAGE_LIMIT}&board=${encodeURIComponent(tag)}`;
  const first = await fetchJsonRetry(url(1));
  let rows = first?.questions || [];
  const total = Number(first?.total) || rows.length;
  if (!rows.length || total > PAPER_SANITY_TOTAL) return [];
  for (let page = 2; rows.length < Math.min(total, PAPER_MAX_QUESTIONS) && page <= 3; page++) {
    const more = await fetchJson(url(page));
    const list = more?.questions || [];
    if (!list.length) break;
    rows = rows.concat(list);
  }
  // Defensive: keep only rows that really carry the tag (tolerates case/space drift)
  const want = tag.toLowerCase().replace(/\s+/g, ' ');
  return rows.filter((q) => !Array.isArray(q.tags) || q.tags.some((t) => String(t).toLowerCase().replace(/\s+/g, ' ') === want));
}

/**
 * @returns {Promise<Map<string, Map<number, {tag:string, questions:any[], sources:Set<string>}>>>}
 *          examId -> startYear -> paper
 */
async function collectPastPapers() {
  const papers = new Map();
  const put = (examId, year, tag, rows, source) => {
    if (!papers.has(examId)) papers.set(examId, new Map());
    const byYear = papers.get(examId);
    if (!byYear.has(year)) byYear.set(year, { tag, questions: [], sources: new Set(), seen: new Set() });
    const paper = byYear.get(year);
    let added = 0;
    for (const q of rows) {
      if (!q || !q.question || !Array.isArray(q.options) || q.options.length < 2) continue;
      const key = textKey(q);
      if (paper.seen.has(key)) continue;
      paper.seen.add(key);
      paper.questions.push({ ...q, tags: Array.isArray(q.tags) && q.tags.length ? q.tags : [tag], level: q.level || 'ADMISSION' });
      added++;
    }
    if (added) paper.sources.add(source);
  };

  const ordered = [...ADMISSION_EXAMS].sort((a, b) => a.priority - b.priority);

  if (!SKIP_FETCH) {
    // Wake the API up first (free-tier hosts cold-start slowly) so the short
    // per-request timeouts below don't all trip on the very first call.
    await fetchJson(`${API}/admin/questions?page=1&limit=1`, 60000).catch(() => {});

    const sessions = candidateSessions();
    const tasks = [];
    for (const exam of ordered) {
      for (const year of sessions) {
        const tag = sessionTag(exam.tagPrefix, year);
        tasks.push(async () => ({ examId: exam.id, year, tag, rows: await fetchPaper(tag) }));
      }
    }
    const deadline = Date.now() + 150000; // hard cap so CI never hangs
    const results = await pool(tasks.map((t) => async () => (Date.now() > deadline ? null : t())), 6);
    let hits = 0;
    for (const r of results) {
      if (!r || !r.rows.length) continue;
      put(r.examId, r.year, r.tag, r.rows, 'api');
      hits++;
    }
    if (hits === 0) console.warn('[seo] WARNING: no past papers returned by the API — using bundled papers only');
    else console.log(`[seo] past papers from API: ${hits} sittings`);
  }

  // Bundled papers complete (or replace) what the API returned for that sitting
  for (const b of BUNDLED_PAPERS) {
    const exam = ADMISSION_EXAMS.find((e) => e.id === b.examId);
    if (!exam) continue;
    try {
      const arr = JSON.parse(readFileSync(join(ROOT, b.file), 'utf8'));
      put(exam.id, b.startYear, sessionTag(exam.tagPrefix, b.startYear), Array.isArray(arr) ? arr : [], 'bundled');
    } catch (e) {
      console.warn(`[seo] could not read ${b.file}: ${e.message}`);
    }
  }

  // Drop thin sittings and empty exams
  for (const [examId, byYear] of papers) {
    for (const [year, paper] of byYear) {
      delete paper.seen;
      if (paper.questions.length < PAPER_MIN_QUESTIONS) byYear.delete(year);
    }
    if (!byYear.size) papers.delete(examId);
  }
  return papers;
}

async function collectQuestions(syllabusSubjects, preloaded = []) {
  /** @type {Map<string, any>} */
  const byId = new Map();
  const add = (q, source, sourceLabel = '') => {
    if (!q || !q.question || !Array.isArray(q.options) || q.options.length < 2) return;
    const id = questionId(q);
    if (byId.has(id)) return;
    byId.set(id, {
      _id: id,
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
      contextText: q.contextText || '',
      slug: safePath(q.slug || bnSlug(q.question)),
      source,
      sourceLabel: sourceLabel || (q.examRef ? String(q.examRef) : ''),
    });
    const rec = byId.get(id);
    if (rec && rec.slug.length < 12) {
      rec.slug = safePath(`${bnSlug(rec.chapter || rec.subject || 'mcq')}-${rec.slug}`);
    }
  };

  // 4-pre. Past-paper questions first so their exam label wins the de-dup
  for (const { q, label } of preloaded) add(q, 'paper', label);

  // 4a. Bundled datasets (always available) — label = where the question came from
  const BUNDLED_LABELS = {
    'data/gst_a_23_24_questions.json': 'GST-A ভর্তি পরীক্ষা ২০২৩-২৪',
    'data/medical_24_25_questions.json': 'মেডিকেল ভর্তি পরীক্ষা ২০২৪-২৫',
  };
  for (const f of Object.keys(BUNDLED_LABELS)) {
    try {
      const arr = JSON.parse(readFileSync(join(ROOT, f), 'utf8'));
      (Array.isArray(arr) ? arr : []).forEach((q) => add(q, 'bundled', BUNDLED_LABELS[f]));
    } catch (e) {
      console.warn(`[seo] could not read ${f}: ${e.message}`);
    }
  }

  if (SKIP_FETCH) return [...byId.values()];

  // 4b. Live API: per-chapter sample + admission questions with explanations
  const tasks = [];
  for (const [subject, chapters] of syllabusSubjects) {
    for (const chapter of Object.keys(chapters)) {
      tasks.push(async () => {
        const u = `${API}/admin/questions?page=1&limit=25&subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(chapter)}`;
        const data = await fetchJson(u);
        return (data?.questions || []).map((q) => ({ ...q, _subject: subject, _chapter: chapter }));
      });
    }
  }
  for (let p = 1; p <= 40; p++) {
    tasks.push(async () => {
      const data = await fetchJson(`${API}/admin/questions?page=${p}&limit=100&level=ADMISSION`);
      return data?.questions || [];
    });
  }

  const deadline = Date.now() + 150000; // hard cap so CI never hangs
  const bounded = tasks.map((t) => async () => {
    if (Date.now() > deadline) return null;
    return t();
  });

  const results = await pool(bounded, 8);
  let apiCount = 0;
  for (const list of results) {
    if (!list) continue;
    for (const q of list) {
      add(q, 'api', q.level === 'ADMISSION' && !q.examRef ? 'ভর্তি পরীক্ষা' : '');
      apiCount++;
    }
  }
  if (apiCount === 0) {
    console.warn('[seo] WARNING: question API unreachable — falling back to bundled datasets only');
  } else {
    console.log(`[seo] question fetch: ${apiCount} raw rows from API`);
  }
  return [...byId.values()];
}

// ---------------------------------------------------------------------------
// 5. Generate
// ---------------------------------------------------------------------------
const urls = []; // [path, priority]
const subjects = Object.entries(SYLLABUS_DB);

console.log('[seo] collecting previous-year admission papers…');
const papers = await collectPastPapers();
const paperLabel = (exam, year) => `${exam.shortBn} ভর্তি পরীক্ষা ${sessionLabelBn(year)}`;
const preloaded = [];
for (const exam of ADMISSION_EXAMS) {
  for (const [year, paper] of papers.get(exam.id) || []) {
    for (const q of paper.questions) preloaded.push({ q, label: paperLabel(exam, year) });
  }
}
console.log(`[seo] past papers: ${[...papers.values()].reduce((n, m) => n + m.size, 0)} sittings, ${preloaded.length} questions`);

console.log('[seo] collecting questions…');
const allQuestions = await collectQuestions(subjects, preloaded);

// De-duplicate slugs & index by chapter
const seenSlug = new Map();
for (const q of allQuestions) {
  const n = seenSlug.get(q.slug) || 0;
  seenSlug.set(q.slug, n + 1);
  if (n > 0) q.slug = `${q.slug}-${String(q._id).slice(-6)}`;
  q.url = `${SITE}/q/${q.slug}/`;
}
const byChapterKey = new Map(); // "subject||chapter" -> questions
for (const q of allQuestions) {
  const key = `${q.subject}||${q.chapter}`;
  if (!byChapterKey.has(key)) byChapterKey.set(key, []);
  byChapterKey.get(key).push(q);
}
console.log(`[seo] unique questions for static pages: ${allQuestions.length}`);
const recById = new Map(allQuestions.map((r) => [r._id, r]));

// ---------------------------------------------------------------------------
// 5a. Previous-year admission papers  (/admission-questions/**)
// ---------------------------------------------------------------------------
const LETTERS = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ'];
const examUrl = (exam) => `${SITE}${ADM}${exam.id}/`;
const paperUrl = (exam, year) => `${SITE}${ADM}${exam.id}/${sessionSlug(year)}/`;
const paperTitleBn = (exam, year) => `${exam.nameBn} ${sessionLabelBn(year)}`;
const paperTitleEn = (exam, year) => `${exam.nameEn} ${sessionSlug(year)}`;
const bnCount = (n) => toBnDigits(n);

/** tag (lower-case) -> { exam, year } so /q/ pages can link back to their paper */
const paperByTag = new Map();
for (const exam of ADMISSION_EXAMS) {
  for (const [year, paper] of papers.get(exam.id) || []) {
    paperByTag.set(paper.tag.toLowerCase(), { exam, year });
  }
}

/** Sort a paper into its natural reading order: subject blocks, then original order. */
function orderPaper(exam, questions) {
  return questions
    .map((q, i) => ({ q, i }))
    .sort((a, b) =>
      subjectRank(a.q.subject || '', exam.subjectOrder) - subjectRank(b.q.subject || '', exam.subjectOrder) ||
      (Number(a.q.orderIndex) || 1e9) - (Number(b.q.orderIndex) || 1e9) ||
      a.i - b.i
    )
    .map((x) => x.q);
}

/** Group consecutive questions by base subject (1st + 2nd paper merged). */
function groupBySubject(questions) {
  const groups = [];
  for (const q of questions) {
    const base = subjectBase(q.subject || '');
    const label = subjectLabelBn(base) || 'অন্যান্য';
    let g = groups[groups.length - 1];
    if (!g || g.label !== label) {
      g = { label, subject: base, id: slugify(base || label), items: [] };
      groups.push(g);
    }
    g.items.push(q);
  }
  return groups;
}

function renderPaperQuestion(q, n) {
  const rec = recById.get(questionId(q));
  const qLink = rec ? rel(rec.url) : '';
  const opts = q.options
    .map((opt, i) => `<li><span class="lt">${LETTERS[i] || i + 1}</span><span class="txt">${esc(opt)}${q.optionsImages?.[i] ? `<br><img class="qimg" src="${esc(q.optionsImages[i])}" alt="বিকল্প ${i + 1}" loading="lazy">` : ''}</span></li>`)
    .join('');
  const ci = Number(q.correctAnswerIndex) || 0;
  const correct = q.options[ci] ?? '';
  const expl = q.explanation
    ? `<div class="ex"><span class="lbl">ব্যাখ্যা</span>${esc(q.explanation)}${q.explanationImage ? `<br><img class="qimg" src="${esc(q.explanationImage)}" alt="ব্যাখ্যার চিত্র" loading="lazy">` : ''}</div>`
    : '';
  return `<article class="qbox" id="q${n}">
${q.contextText ? `<div class="ctx">${esc(q.contextText)}</div>` : ''}<div class="qh">${qLink ? `<a class="qn" href="${qLink}" title="এই প্রশ্নের আলাদা পেজ">${bnCount(n)}</a>` : `<span class="qn">${bnCount(n)}</span>`}<h3>${esc(q.question)}</h3></div>
${q.questionImage ? `<img class="qimg" src="${esc(q.questionImage)}" alt="প্রশ্ন ${bnCount(n)} এর চিত্র" loading="lazy">` : ''}
<ol class="opts">${opts}</ol>
<details class="sol"><summary>উত্তর ও ব্যাখ্যা দেখো</summary><div class="sol-in">
<p class="ansl">সঠিক উত্তর: <b>(${LETTERS[ci] || ci + 1}) ${esc(correct)}</b></p>${expl}
${qLink ? `<a class="plink" href="${qLink}">এই প্রশ্নের আলাদা পেজ →</a>` : ''}
</div></details>
</article>`;
}

const PAPER_TOGGLE_JS = `<script>document.documentElement.classList.add('js');(function(){var b=document.querySelector('[data-toggle-all]');if(!b)return;var open=false;b.addEventListener('click',function(){open=!open;document.querySelectorAll('details.sol').forEach(function(d){d.open=open;});b.textContent=open?'সব উত্তর লুকাও':'সব উত্তর দেখাও';});})();</script>`;

const examsWithPapers = ADMISSION_EXAMS
  .filter((e) => papers.has(e.id))
  .sort((a, b) => a.priority - b.priority);

let paperPages = 0;
for (const exam of examsWithPapers) {
  const byYear = papers.get(exam.id);
  const years = [...byYear.keys()].sort((a, b) => b - a); // newest first
  const examCrumbs = [['পরীক্ষাঙ্গন', `${SITE}/`], ['ভর্তি প্রশ্নব্যাংক', `${SITE}${ADM}`], [exam.shortBn, examUrl(exam)]];

  // ---- one page per sitting ------------------------------------------------
  years.forEach((year, yi) => {
    const paper = byYear.get(year);
    const ordered = orderPaper(exam, paper.questions);
    const groups = groupBySubject(ordered);
    const total = ordered.length;
    const withExpl = ordered.filter((q) => q.explanation).length;
    const titleBn = paperTitleBn(exam, year);
    const titleEn = paperTitleEn(exam, year);
    const url = paperUrl(exam, year);

    // chapter frequency (data-driven "which chapters mattered" table)
    const freq = new Map();
    for (const q of ordered) {
      if (!q.chapter) continue;
      const key = `${subjectLabelBn(q.subject)}||${q.chapter}`;
      freq.set(key, (freq.get(key) || 0) + 1);
    }
    const freqRows = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);

    let n = 0;
    const sections = groups
      .map((g) => {
        const items = g.items.map((q) => renderPaperQuestion(q, ++n)).join('\n');
        return `<section id="${g.id}"><h2>${esc(g.label)} <small style="font-weight:600;color:var(--mist);font-size:14px">(${bnCount(g.items.length)}টি প্রশ্ন)</small></h2>\n${items}</section>`;
      })
      .join('\n');

    const jump = groups.map((g) => `<a href="#${g.id}">${esc(g.label)}<small>${bnCount(g.items.length)}</small></a>`).join('');
    const prevYear = years[yi + 1];
    const nextYear = years[yi - 1];
    const pager = `<div class="pager">
      ${prevYear ? `<a href="${rel(paperUrl(exam, prevYear))}">← ${esc(exam.shortBn)} ${sessionLabelBn(prevYear)}</a>` : '<span></span>'}
      ${nextYear ? `<a href="${rel(paperUrl(exam, nextYear))}">${esc(exam.shortBn)} ${sessionLabelBn(nextYear)} →</a>` : `<a href="${rel(examUrl(exam))}">সব সেশন</a>`}
    </div>`;
    const otherYears = years.filter((y) => y !== year);
    const otherHtml = otherYears.length
      ? `<h2>${esc(exam.shortBn)} — অন্যান্য বছরের প্রশ্ন</h2><div class="jump">${otherYears.map((y) => `<a href="${rel(paperUrl(exam, y))}">${sessionLabelBn(y)}</a>`).join('')}</div>`
      : '';
    const formatHtml = exam.formatBn?.length
      ? `<div class="tips"><h2>পরীক্ষার ধরন</h2><ul class="topics">${exam.formatBn.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></div>`
      : '';
    const freqHtml = freqRows.length
      ? `<h2>কোন অধ্যায় থেকে কয়টি প্রশ্ন এসেছে</h2>
<p class="lede">এই প্রশ্নপত্রের প্রশ্নগুলো যে অধ্যায় থেকে এসেছে তার ভিত্তিতে তৈরি তালিকা — রিভিশনের অগ্রাধিকার ঠিক করতে কাজে লাগাও।</p>
<div class="freq"><table><thead><tr><th>বিষয়</th><th>অধ্যায়</th><th style="text-align:right">প্রশ্ন</th></tr></thead><tbody>
${freqRows.map(([k, c]) => { const [sub, ch] = k.split('||'); return `<tr><td>${esc(sub)}</td><td>${esc(ch)}</td><td class="n">${bnCount(c)}টি</td></tr>`; }).join('\n')}
</tbody></table></div>`
      : '';

    const subjectsBn = groups.map((g) => g.label).join(', ');
    const shortTitleBn = `${exam.shortBn} ভর্তি পরীক্ষা ${sessionLabelBn(year)}`;
    const shortTitleEn = `${exam.nameEn.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+/g, ' ').trim()} ${sessionSlug(year)}`;
    const body = `
<h1>${esc(titleBn)} — প্রশ্ন ও সমাধান</h1>
<p class="sub">${esc(titleEn)} · Question with Answers &amp; Explanations</p>
<p class="lede">${esc(titleBn)} এ আসা ${bnCount(total)}টি প্রশ্ন সঠিক উত্তর${withExpl ? ' ও ব্যাখ্যা' : ''}সহ এক পেজে। বিষয়: ${esc(subjectsBn)}। প্রতিটি প্রশ্ন আগে নিজে চেষ্টা করো, তারপর "উত্তর ও ব্যাখ্যা দেখো"-তে ক্লিক করে মিলিয়ে নাও — এভাবেই বিগত বছরের প্রশ্ন থেকে সবচেয়ে বেশি শেখা যায়।</p>
<div class="chips"><span class="chip src">${esc(exam.shortBn)}</span><span class="chip">সেশন ${sessionLabelBn(year)}</span><span class="chip">${bnCount(total)}টি প্রশ্ন</span>${withExpl ? `<span class="chip">${bnCount(withExpl)}টি ব্যাখ্যাসহ</span>` : ''}</div>
<div class="meta">
  <div><b>${bnCount(total)}</b><span>মোট প্রশ্ন</span></div>
  <div><b>${bnCount(groups.length)}</b><span>বিষয়</span></div>
  <div><b>${bnCount(withExpl)}</b><span>ব্যাখ্যাসহ সমাধান</span></div>
  <div><b>${sessionLabelBn(year)}</b><span>শিক্ষাবর্ষ</span></div>
</div>
<div class="toolbar"><div class="jump">${jump}</div><button type="button" class="tog" data-toggle-all>সব উত্তর দেখাও</button></div>
${sections}
${freqHtml}
${formatHtml}
${otherHtml}
${pager}
<div class="banner"><h2>${esc(exam.shortBn)} প্রস্তুতি এখানেই শেষ নয়</h2>
<p>পরীক্ষাঙ্গনে ${esc(exam.shortBn)}সহ সব ভর্তি পরীক্ষার প্রশ্নব্যাংক, টাইমারসহ মডেল টেস্ট ও AI দুর্বলতা রিপোর্ট — একদম ফ্রি।</p>
<a href="/qbank?level=ADMISSION&admissionCategory=${encodeURIComponent(exam.category)}">প্রশ্নব্যাংকে প্র্যাকটিস করো</a></div>`;

    const crumbs = [...examCrumbs, [sessionLabelBn(year), url]];
    const jsonLd = [
      breadcrumbLd(crumbs),
      {
        '@type': 'Quiz',
        '@id': url,
        name: `${titleBn} — প্রশ্ন ও সমাধান`,
        alternateName: `${titleEn} question solution`,
        inLanguage: 'bn-BD',
        url,
        about: { '@type': 'Thing', name: exam.nameEn },
        educationalLevel: 'University admission',
        educationalAlignment: { '@type': 'AlignmentObject', alignmentType: 'educationalSubject', targetName: groups.map((g) => g.subject || g.label).join(', ') },
        numberOfQuestions: total,
        provider: { '@type': 'Organization', name: 'Porikkhangon', sameAs: SITE },
        isAccessibleForFree: true,
        hasPart: ordered.slice(0, 100).map((q) => ({
          '@type': 'Question',
          eduQuestionType: 'Multiple choice',
          name: plain(q.question).slice(0, 150),
          text: plain(q.question).slice(0, 300),
          acceptedAnswer: { '@type': 'Answer', text: plain(q.options[Number(q.correctAnswerIndex) || 0] ?? '') },
          suggestedAnswer: q.options.map((o) => ({ '@type': 'Answer', text: plain(o) })),
        })),
      },
    ];

    const path = writePage(`admission-questions/${exam.id}/${sessionSlug(year)}/index.html`, shell({
      title: `${shortTitleBn} প্রশ্ন সমাধান — ${shortTitleEn} Question Solution | পরীক্ষাঙ্গন`,
      description: `${titleBn} এর ${bnCount(total)}টি প্রশ্নের সঠিক উত্তর${withExpl ? ' ও ব্যাখ্যা' : ''}সহ সম্পূর্ণ সমাধান — ${subjectsBn}। ${shortTitleEn} question bank with answers, পরীক্ষাঙ্গনে ফ্রি।`.slice(0, 300),
      canonical: url,
      breadcrumbs: crumbs,
      jsonLd,
      body,
      mathjax: true,
      section: 'admission',
      head: PAPER_TOGGLE_JS,
    }));
    urls.push([path, '0.8']);
    paperPages++;
  });

  // ---- exam page (all sittings) --------------------------------------------
  {
    const url = examUrl(exam);
    const totalQ = years.reduce((n, y) => n + byYear.get(y).questions.length, 0);
    const cards = years
      .map((y) => {
        const paper = byYear.get(y);
        const subs = [...new Set(orderPaper(exam, paper.questions).map((q) => subjectLabelBn(subjectBase(q.subject))).filter(Boolean))];
        return `<a href="${rel(paperUrl(exam, y))}"><b>${sessionLabelBn(y)}</b><span>${bnCount(paper.questions.length)}টি প্রশ্ন${subs.length ? ` · ${esc(subs.slice(0, 4).join(', '))}${subs.length > 4 ? ' …' : ''}` : ''}</span><em>প্রশ্ন ও সমাধান →</em></a>`;
      })
      .join('\n');
    const formatHtml = exam.formatBn?.length
      ? `<div class="tips"><h2>${esc(exam.shortBn)} ভর্তি পরীক্ষার ধরন</h2><ul class="topics">${exam.formatBn.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></div>`
      : '';
    const others = examsWithPapers.filter((e) => e.id !== exam.id).slice(0, 8);
    const faqs = [
      [`${exam.shortBn} ভর্তি পরীক্ষার বিগত বছরের প্রশ্ন কোথায় পাব?`, `এই পেজে ${exam.nameBn} এর ${bnCount(years.length)}টি সেশনের (${years.length > 1 ? `${sessionLabelBn(years[years.length - 1])} থেকে ${sessionLabelBn(years[0])}` : sessionLabelBn(years[0])}) প্রশ্ন সেশন অনুযায়ী সাজানো আছে। যেকোনো সেশনে ক্লিক করলে সেই বছরের সব প্রশ্ন সঠিক উত্তরসহ এক পেজে পাবে।`],
      ['প্রশ্নগুলোর ব্যাখ্যা আছে কি?', 'প্রতিটি প্রশ্নের সঠিক উত্তর দেওয়া আছে এবং যেসব প্রশ্নে ব্যাখ্যা যুক্ত হয়েছে সেগুলো "উত্তর ও ব্যাখ্যা দেখো" অংশে দেখানো হয়। প্রতিটি প্রশ্নের আলাদা পেজও আছে।'],
      ['এই প্রশ্নগুলো দিয়ে কি মডেল টেস্ট দেওয়া যায়?', 'হ্যাঁ। পরীক্ষাঙ্গন অ্যাপে ফ্রি একাউন্ট খুলে ভর্তি প্রশ্নব্যাংক থেকে টাইমারসহ মডেল টেস্ট দেওয়া যায় এবং ভুল প্রশ্নগুলো সেভ করে পরে রিভিশন করা যায়।'],
      ['বিগত বছরের প্রশ্ন সলভ করা কেন জরুরি?', 'বিগত বছরের প্রশ্ন থেকে প্রশ্নের ধরন, বারবার আসা টপিক ও সময় ব্যবস্থাপনার ধারণা পাওয়া যায়। প্রতিটি সেশনের পেজে "কোন অধ্যায় থেকে কয়টি প্রশ্ন এসেছে" তালিকা দেওয়া আছে, যা রিভিশনের অগ্রাধিকার ঠিক করতে সাহায্য করে।'],
    ];
    const faqHtml = `<h2>সাধারণ জিজ্ঞাসা</h2><div class="faq">${faqs.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`;

    const body = `
<h1>${esc(exam.nameBn)} — বিগত বছরের প্রশ্ন ও সমাধান</h1>
<p class="sub">${esc(exam.nameEn)} · Previous Years' Question Bank with Solutions</p>
<p class="lede">${esc(exam.descriptionBn)}</p>
<div class="meta">
  <div><b>${bnCount(years.length)}</b><span>সেশনের প্রশ্নপত্র</span></div>
  <div><b>${bnCount(totalQ)}</b><span>মোট প্রশ্ন</span></div>
  <div><b>${sessionLabelBn(years[0])}</b><span>সর্বশেষ সেশন</span></div>
</div>
<h2>সেশন বেছে নাও</h2>
<div class="sessions">${cards}</div>
${formatHtml}
<div class="tips"><h2>বিগত বছরের প্রশ্ন দিয়ে কীভাবে প্রস্তুতি নেবে?</h2>
<ul class="topics">
<li>প্রথমে সময় ধরে পুরো প্রশ্নপত্র নিজে সলভ করো — উত্তর না দেখে।</li>
<li>তারপর "উত্তর ও ব্যাখ্যা দেখো" দিয়ে মিলিয়ে নাও; ভুলগুলোর অধ্যায় আলাদা করে নোট করো।</li>
<li>প্রতিটি সেশনের পেজে থাকা "কোন অধ্যায় থেকে কয়টি প্রশ্ন" তালিকা দেখে রিভিশনের অগ্রাধিকার ঠিক করো।</li>
<li>পরীক্ষাঙ্গন অ্যাপে একই প্রশ্নব্যাংক থেকে মডেল টেস্ট দাও এবং ভুল প্রশ্ন সেভ করে রাখো।</li>
</ul></div>
${faqHtml}
${others.length ? `<h2>অন্যান্য ভর্তি পরীক্ষার প্রশ্নব্যাংক</h2><div class="jump">${others.map((e) => `<a href="${rel(examUrl(e))}">${esc(e.shortBn)}</a>`).join('')}<a href="${ADM}">সব পরীক্ষা →</a></div>` : ''}
<div class="banner"><h2>${esc(exam.shortBn)} প্রস্তুতির জন্য মডেল টেস্ট দাও</h2>
<p>বিগত বছরের প্রশ্নসহ পূর্ণাঙ্গ প্রশ্নব্যাংক, টাইমার, ইনস্ট্যান্ট রেজাল্ট ও AI দুর্বলতা রিপোর্ট — ফ্রি।</p>
<a href="/qbank?level=ADMISSION&admissionCategory=${encodeURIComponent(exam.category)}">প্রশ্নব্যাংক খোলো</a></div>`;

    const jsonLd = [
      breadcrumbLd(examCrumbs),
      {
        '@type': 'CollectionPage',
        '@id': url,
        name: `${exam.nameBn} — বিগত বছরের প্রশ্ন ও সমাধান`,
        alternateName: `${exam.nameEn} previous year questions`,
        inLanguage: 'bn-BD',
        url,
        isPartOf: { '@type': 'WebSite', name: 'Porikkhangon', url: SITE },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: years.length,
          itemListElement: years.map((y, i) => ({ '@type': 'ListItem', position: i + 1, name: `${paperTitleBn(exam, y)} প্রশ্ন ও সমাধান`, url: paperUrl(exam, y) })),
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
    ];

    const path = writePage(`admission-questions/${exam.id}/index.html`, shell({
      title: `${exam.shortBn} ভর্তি পরীক্ষার বিগত বছরের প্রশ্ন ও সমাধান — ${exam.nameEn.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+/g, ' ').trim()} Question Bank | পরীক্ষাঙ্গন`,
      description: `${exam.nameBn} এর ${bnCount(years.length)}টি সেশনের (${years.length > 1 ? `${sessionLabelBn(years[years.length - 1])}–${sessionLabelBn(years[0])}` : sessionLabelBn(years[0])}) ${bnCount(totalQ)}টি প্রশ্ন সঠিক উত্তর ও ব্যাখ্যাসহ। ${exam.nameEn} previous year question solve — পরীক্ষাঙ্গনে ফ্রি।`.slice(0, 300),
      canonical: url,
      breadcrumbs: examCrumbs,
      jsonLd,
      body,
      section: 'admission',
    }));
    urls.push([path, '0.8']);
  }
}

// ---- admission hub --------------------------------------------------------
if (examsWithPapers.length) {
  const url = `${SITE}${ADM}`;
  const crumbs = [['পরীক্ষাঙ্গন', `${SITE}/`], ['ভর্তি প্রশ্নব্যাংক', url]];
  const byCat = new Map();
  for (const e of examsWithPapers) {
    if (!byCat.has(e.category)) byCat.set(e.category, []);
    byCat.get(e.category).push(e);
  }
  const catOrder = ['medical', 'varsity', 'engineering', 'krishi', 'others'];
  const catSections = catOrder
    .filter((c) => byCat.has(c))
    .map((c) => {
      const cards = byCat
        .get(c)
        .map((e) => {
          const byYear = papers.get(e.id);
          const years = [...byYear.keys()].sort((a, b) => b - a);
          const totalQ = years.reduce((n, y) => n + byYear.get(y).questions.length, 0);
          return `<a href="${rel(examUrl(e))}"><b>${esc(e.nameBn)}</b><span>${bnCount(years.length)}টি সেশন · ${bnCount(totalQ)}টি প্রশ্ন সমাধানসহ</span><div class="yrs">${years.slice(0, 6).map((y) => `<i>${sessionLabelBn(y)}</i>`).join('')}${years.length > 6 ? `<i>+${bnCount(years.length - 6)}</i>` : ''}</div></a>`;
        })
        .join('\n');
      return `<h2>${esc(CATEGORY_LABELS_BN[c] || c)}</h2><div class="exams">${cards}</div>`;
    })
    .join('\n');

  const recent = examsWithPapers
    .flatMap((e) => [...papers.get(e.id).keys()].map((y) => ({ e, y, n: papers.get(e.id).get(y).questions.length })))
    .sort((a, b) => b.y - a.y || a.e.priority - b.e.priority)
    .slice(0, 12);
  const totalSittings = examsWithPapers.reduce((n, e) => n + papers.get(e.id).size, 0);
  const totalQ = examsWithPapers.reduce((n, e) => n + [...papers.get(e.id).values()].reduce((m, p) => m + p.questions.length, 0), 0);

  const topNames = examsWithPapers.slice(0, 4).map((e) => e.shortBn).join(', ');
  const topNamesEn = examsWithPapers.slice(0, 4).map((e) => e.nameEn.replace(/\s*\(.*?\)\s*/g, ' ').replace(/ Admission Test.*$/i, '').trim()).join(', ');
  const body = `
<h1>ভর্তি পরীক্ষার বিগত বছরের প্রশ্ন ও সমাধান — ${esc(topNames)}</h1>
<p class="sub">Previous Years' Admission Test Questions with Solutions (${esc(topNamesEn)} &amp; more)</p>
<p class="lede">পরীক্ষাঙ্গনের ভর্তি প্রশ্নব্যাংকে ${bnCount(examsWithPapers.length)}টি ভর্তি পরীক্ষার ${bnCount(totalSittings)}টি সেশনের ${bnCount(totalQ)}টি প্রশ্ন সঠিক উত্তর ও ব্যাখ্যাসহ সাজানো আছে — সেশন অনুযায়ী, বিষয় অনুযায়ী। প্রশ্নগুলো আমাদের ডেটাবেস থেকে সরাসরি নেওয়া, তাই অ্যাপের প্রশ্নব্যাংক ও মডেল টেস্টেও একই প্রশ্ন প্র্যাকটিস করতে পারবে।</p>
<div class="meta">
  <div><b>${bnCount(examsWithPapers.length)}</b><span>ভর্তি পরীক্ষা</span></div>
  <div><b>${bnCount(totalSittings)}</b><span>সেশনের প্রশ্নপত্র</span></div>
  <div><b>${bnCount(totalQ)}</b><span>প্রশ্ন, উত্তরসহ</span></div>
</div>
${catSections}
<h2>সাম্প্রতিক প্রশ্নপত্র</h2>
<div class="sessions">${recent.map(({ e, y, n }) => `<a href="${rel(paperUrl(e, y))}"><b>${sessionLabelBn(y)}</b><span>${esc(e.shortBn)} · ${bnCount(n)}টি প্রশ্ন</span><em>প্রশ্ন ও সমাধান →</em></a>`).join('\n')}</div>
<div class="tips"><h2>কীভাবে ব্যবহার করবে?</h2>
<ul class="topics">
<li>নিজের টার্গেট পরীক্ষা বেছে নাও — সেখানে সব সেশনের প্রশ্নপত্র পাবে।</li>
<li>প্রতিটি সেশনের পেজে প্রশ্নগুলো বিষয় অনুযায়ী সাজানো; আগে নিজে সলভ করো, তারপর উত্তর মেলাও।</li>
<li>"কোন অধ্যায় থেকে কয়টি প্রশ্ন" তালিকা দেখে রিভিশনের অগ্রাধিকার ঠিক করো।</li>
<li>HSC সিলেবাস ধরে অধ্যায়ভিত্তিক পড়তে চাইলে <a href="${HUB}">HSC সিলেবাস গাইড</a> দেখো।</li>
</ul></div>
<div class="banner"><h2>বিগত বছরের প্রশ্ন দিয়ে মডেল টেস্ট দাও</h2>
<p>টাইমার, নেগেটিভ মার্কিং, ইনস্ট্যান্ট রেজাল্ট ও AI দুর্বলতা রিপোর্ট — পরীক্ষাঙ্গনে ফ্রি।</p>
<a href="${SITE}/auth">এখনই ফ্রি একাউন্ট খোলো</a></div>`;

  const jsonLd = [
    breadcrumbLd(crumbs),
    {
      '@type': 'CollectionPage',
      '@id': url,
      name: 'ভর্তি পরীক্ষার বিগত বছরের প্রশ্ন ও সমাধান',
      alternateName: 'Bangladesh admission test previous year question bank',
      inLanguage: 'bn-BD',
      url,
      isPartOf: { '@type': 'WebSite', name: 'Porikkhangon', url: SITE },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: examsWithPapers.length,
        itemListElement: examsWithPapers.map((e, i) => ({ '@type': 'ListItem', position: i + 1, name: `${e.nameBn} — বিগত বছরের প্রশ্ন`, url: examUrl(e) })),
      },
    },
  ];

  const path = writePage('admission-questions/index.html', shell({
    title: `ভর্তি পরীক্ষার বিগত বছরের প্রশ্ন ও সমাধান — ${topNames} | পরীক্ষাঙ্গন`,
    description: `${topNames}সহ ${bnCount(examsWithPapers.length)}টি ভর্তি পরীক্ষার ${bnCount(totalSittings)}টি সেশনের প্রশ্ন সঠিক উত্তর ও ব্যাখ্যাসহ। Previous year admission question solve (${topNamesEn}) — পরীক্ষাঙ্গনে ফ্রি।`.slice(0, 300),
    canonical: url,
    breadcrumbs: crumbs,
    jsonLd,
    body,
    section: 'admission',
  }));
  urls.push([path, '0.9']);
}
console.log(`[seo] admission pages: ${examsWithPapers.length} exams, ${paperPages} sittings`);

// --- Hub page -------------------------------------------------------------
{
  const totalChapters = subjects.reduce((n, [, ch]) => n + Object.keys(ch).length, 0);
  const cards = subjects
    .map(([subject, chapters]) => {
      const slug = slugify(subject);
      const n = Object.keys(chapters).length;
      return `<a class="card" href="${HUB}${slug}/"><b>${esc(subject)}</b><span>${n}টি অধ্যায় · সম্পূর্ণ সিলেবাস ও টপিক লিস্ট</span></a>`;
    })
    .join('\n');

  const body = `
<h1>HSC সিলেবাস ২০২৬ — বিষয় ও অধ্যায়ভিত্তিক পূর্ণাঙ্গ গাইড</h1>
<p class="lede">পরীক্ষাঙ্গন (Porikkhangon)-এর অধ্যায়ভিত্তিক সিলেবাস গাইডে HSC ও ভর্তি পরীক্ষার ${subjects.length}টি বিষয়ের ${totalChapters}টি অধ্যায়ের সম্পূর্ণ টপিক তালিকা, প্রস্তুতি টিপস এবং ফ্রি MCQ প্র্যাকটিসের সুবিধা একসাথে পাবে। নিজের বিষয় বেছে নাও, অধ্যায় খুলে দেখো কোন কোন টপিক থেকে প্রশ্ন আসে — এবং সাথে সাথেই প্রশ্নব্যাংকে প্র্যাকটিস শুরু করো।</p>
<h2>বিষয় বেছে নাও</h2>
<div class="grid">${cards}</div>
${examsWithPapers.length ? `<div class="xlink"><div><b>ভর্তি পরীক্ষার বিগত বছরের প্রশ্ন ও সমাধান</b><span>${esc(examsWithPapers.slice(0, 5).map((e) => e.shortBn).join(', '))} — সেশন অনুযায়ী পূর্ণাঙ্গ প্রশ্নপত্র, উত্তর ও ব্যাখ্যাসহ।</span></div><a href="${ADM}">প্রশ্নব্যাংক দেখো</a></div>` : ''}
<div class="tips"><h2>কীভাবে এই গাইড ব্যবহার করবে?</h2>
<ul class="topics">
<li>প্রথমে নিজের বিষয়ের পেজে যাও — সেখানে সব অধ্যায়ের তালিকা পাবে।</li>
<li>অধ্যায়ের পেজে সেই অধ্যায়ের প্রতিটি টপিক ও সাব-টপিক সাজানো আছে।</li>
<li>টপিক শেষে পরীক্ষাঙ্গনের প্রশ্নব্যাংকে সেই অধ্যায়ের MCQ প্র্যাকটিস করো।</li>
<li>ভুল প্রশ্নগুলো সেভ করে রাখো — রিভিশনের সময় এক ক্লিকে ফিরে পাবে।</li>
</ul></div>
<div class="banner"><h2>সিলেবাস জানা যথেষ্ট নয় — প্র্যাকটিসই আসল</h2>
<p>৫০,০০০+ প্রশ্ন, মডেল টেস্ট, AI টিউটর ও কুইজ ব্যাটল — সব ফ্রিতে।</p>
<a href="${SITE}/auth">এখনই ফ্রি একাউন্ট খোলো</a></div>`;

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

  const path = writePage('hsc-syllabus/index.html', shell({
    title: 'HSC সিলেবাস গাইড — বিষয় ও অধ্যায়ভিত্তিক টপিক লিস্ট | পরীক্ষাঙ্গন',
    description: 'HSC ও ভর্তি পরীক্ষার সব বিষয়ের অধ্যায়ভিত্তিক সিলেবাস, টপিক লিস্ট ও প্রস্তুতি টিপস এক জায়গায়। পরীক্ষাঙ্গনে ফ্রি MCQ প্র্যাকটিসসহ পূর্ণাঙ্গ প্রস্তুতি নাও।',
    canonical: `${SITE}${HUB}`,
    breadcrumbs: [['পরীক্ষাঙ্গন', `${SITE}/`], ['HSC সিলেবাস গাইড', `${SITE}${HUB}`]],
    jsonLd,
    body,
  }));
  urls.push([path, '0.9']);
}

// --- Subject + chapter pages ----------------------------------------------
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
        return `<a class="card" href="${HUB}${subjectSlug}/${slugify(chapter)}/"><b>${i + 1}. ${esc(chapter)}</b><span>${n}টি টপিক${qCount ? ` · ${qCount}টি সলভড প্রশ্ন` : ''}</span></a>`;
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
<a href="/qbank?level=ACADEMIC&subject=${encodeURIComponent(subject)}">প্রশ্নব্যাংক খোলো</a></div>`;

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
        provider: { '@type': 'Organization', name: 'Porikkhangon', sameAs: SITE },
        hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', courseWorkload: 'PT60H' },
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'BDT', category: 'free' },
      },
    ];

    const path = writePage(`hsc-syllabus/${subjectSlug}/index.html`, shell({
      title: `${subject} সিলেবাস ও অধ্যায় তালিকা | পরীক্ষাঙ্গন`,
      description: `${subject} বিষয়ের HSC সিলেবাস: ${chapterEntries.length}টি অধ্যায়ের টপিক লিস্ট, প্রস্তুতি টিপস ও ফ্রি MCQ প্র্যাকটিস — পরীক্ষাঙ্গনে।`,
      canonical: `${SITE}${HUB}${subjectSlug}/`,
      breadcrumbs: [['পরীক্ষাঙ্গন', `${SITE}/`], ['HSC সিলেবাস গাইড', `${SITE}${HUB}`], [subject, `${SITE}${HUB}${subjectSlug}/`]],
      jsonLd,
      body,
    }));
    urls.push([path, '0.8']);
  }

  // Chapter pages
  chapterEntries.forEach(([chapter, value], idx) => {
    const chapterSlug = slugify(chapter);
    const topics = topicsOf(value);
    const topicCount = countTopics(topics);
    const chapterQuestions = byChapterKey.get(`${subject}||${chapter}`) || [];

    const topicHtml = topics
      .map((t, i) => {
        const sub = t.subTopics.length
          ? `<ul>${t.subTopics.map((st) => `<li>${esc(st)}</li>`).join('')}</ul>`
          : '';
        return `<li><b>${i + 1}. ${esc(t.title)}</b>${sub}</li>`;
      })
      .join('\n');

    const sampleHtml = chapterQuestions.length
      ? `<h2>এই অধ্যায়ের সলভড প্রশ্ন</h2>
<div class="qlist">${chapterQuestions.slice(0, 8).map((q) => `<a href="${rel(q.url)}">${esc(plain(q.question).slice(0, 110))}</a>`).join('\n')}</div>`
      : '';

    const prev = chapterEntries[idx - 1];
    const next = chapterEntries[idx + 1];
    const pager = `<div class="pager">
      ${prev ? `<a href="${HUB}${subjectSlug}/${slugify(prev[0])}/">← ${esc(prev[0])}</a>` : '<span></span>'}
      ${next ? `<a href="${HUB}${subjectSlug}/${slugify(next[0])}/">${esc(next[0])} →</a>` : `<a href="${HUB}${subjectSlug}/">সব অধ্যায়</a>`}
    </div>`;

    const body = `
<h1>${esc(subject)} — ${esc(chapter)}: সম্পূর্ণ সিলেবাস ও টপিক লিস্ট</h1>
<p class="lede">${esc(subject)} বিষয়ের ${idx + 1} নং অধ্যায় "${esc(chapter)}"-এর সম্পূর্ণ টপিক ও সাব-টপিক তালিকা (${topicCount}টি টপিক)। সিলেবাস ধরে পড়ো, তারপর পরীক্ষাঙ্গনের প্রশ্নব্যাংকে এই অধ্যায়ের MCQ প্র্যাকটিস করে নিজেকে যাচাই করো।</p>
<h2>অধ্যায়ের টপিকসমূহ</h2>
<ul class="topics">${topicHtml}</ul>
${sampleHtml}
<div class="tips"><h2>এই অধ্যায় পড়ার টিপস</h2>
<ul class="topics">${tips.slice(0, 3).map((t) => `<li>${esc(t)}</li>`).join('\n')}
<li>অধ্যায় শেষে পরীক্ষাঙ্গনে "${esc(chapter)}" এর প্রশ্ন সলভ করো এবং ভুলগুলো সেভ করে রাখো।</li></ul></div>
${pager}
<div class="banner"><h2>"${esc(chapter)}" এর প্রশ্ন প্র্যাকটিস করবে?</h2>
<p>ব্যাখ্যাসহ উত্তর, টাইমার ও ইনস্ট্যান্ট রেজাল্ট — একদম ফ্রি।</p>
<a href="/qbank?level=ACADEMIC&subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(chapter)}">এই অধ্যায়ের প্রশ্ন সলভ করো</a></div>`;

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
          provider: { '@type': 'Organization', name: 'Porikkhangon', sameAs: SITE },
        },
      },
    ];

    const path = writePage(`hsc-syllabus/${subjectSlug}/${chapterSlug}/index.html`, shell({
      title: `${chapter} | ${subject} সিলেবাস ও টপিক লিস্ট | পরীক্ষাঙ্গন`,
      description: `${subject} — ${chapter}: ${topicCount}টি টপিকের সম্পূর্ণ তালিকা, প্রস্তুতি টিপস ও ফ্রি MCQ প্র্যাকটিস। পরীক্ষাঙ্গনে অধ্যায়ভিত্তিক প্রস্তুতি শুরু করো।`,
      canonical: `${SITE}${HUB}${subjectSlug}/${chapterSlug}/`,
      breadcrumbs: [['পরীক্ষাঙ্গন', `${SITE}/`], ['HSC সিলেবাস গাইড', `${SITE}${HUB}`], [subject, `${SITE}${HUB}${subjectSlug}/`], [chapter, `${SITE}${HUB}${subjectSlug}/${chapterSlug}/`]],
      jsonLd,
      body,
    }));
    urls.push([path, '0.7']);
  });
}

// --- Public question pages (Sattacademy-style) ----------------------------
let qPages = 0;
for (const q of allQuestions) {
  const subjectSlug = q.subject ? slugify(q.subject) : '';
  const chapterSlug = q.chapter ? slugify(q.chapter) : '';
  const hasSubjectPage = q.subject && SYLLABUS_DB[q.subject];
  const hasChapterPage = hasSubjectPage && SYLLABUS_DB[q.subject][q.chapter];

  // Which previous-year paper (if any) this question belongs to
  const paperHit = (q.tags || []).map((t) => paperByTag.get(String(t).toLowerCase())).find(Boolean) || null;

  const crumbs = paperHit
    ? [['পরীক্ষাঙ্গন', `${SITE}/`], ['ভর্তি প্রশ্নব্যাংক', `${SITE}${ADM}`], [paperHit.exam.shortBn, examUrl(paperHit.exam)], [sessionLabelBn(paperHit.year), paperUrl(paperHit.exam, paperHit.year)]]
    : [['পরীক্ষাঙ্গন', `${SITE}/`], ['HSC সিলেবাস গাইড', `${SITE}${HUB}`]];
  if (!paperHit && hasSubjectPage) crumbs.push([q.subject, `${SITE}${HUB}${subjectSlug}/`]);
  if (!paperHit && hasChapterPage) crumbs.push([q.chapter, `${SITE}${HUB}${subjectSlug}/${chapterSlug}/`]);
  crumbs.push([plain(q.question).slice(0, 60), q.url]);

  const optsHtml = q.options
    .map((opt, i) => {
      const correct = i === q.correctAnswerIndex;
      return `<li${correct ? ' class="correct"' : ''}><span class="lt">${LETTERS[i] || i + 1}</span><span class="txt">${esc(opt)}${q.optionsImages?.[i] ? `<br><img class="qimg" src="${esc(q.optionsImages[i])}" alt="বিকল্প ${i + 1}">` : ''}</span><span class="tick">✓ সঠিক উত্তর</span></li>`;
    })
    .join('\n');

  const correctText = q.options[q.correctAnswerIndex] || '';
  const explHtml = q.explanation
    ? `<div class="expl"><h2>ব্যাখ্যা</h2><div>${esc(q.explanation)}</div>${q.explanationImage ? `<img class="qimg" src="${esc(q.explanationImage)}" alt="ব্যাখ্যার চিত্র">` : ''}</div>`
    : '';

  const siblings = (byChapterKey.get(`${q.subject}||${q.chapter}`) || []).filter((x) => x.slug !== q.slug).slice(0, 5);
  const moreHtml = siblings.length
    ? `<h2>একই অধ্যায়ের আরও প্রশ্ন</h2>
<div class="qlist">${siblings.map((s) => `<a href="${rel(s.url)}">${esc(plain(s.question).slice(0, 110))}</a>`).join('\n')}</div>`
    : '';

  const levelLabel = q.level === 'ADMISSION' ? 'ভর্তি পরীক্ষা' : q.level === 'MAINBOOK' ? 'মূল বই' : q.level === 'ACADEMIC' ? 'HSC একাডেমিক' : '';
  const srcChip = paperHit
    ? `<a class="chip src" href="${rel(paperUrl(paperHit.exam, paperHit.year))}" style="text-decoration:none">সূত্র: ${esc(paperLabel(paperHit.exam, paperHit.year))} — পুরো প্রশ্নপত্র →</a>`
    : q.sourceLabel ? `<span class="chip src">সূত্র: ${esc(String(q.sourceLabel))}</span>` : '';
  const chips = srcChip + [q.subject, q.chapter, levelLabel, ...(q.tags || []).slice(0, 2)]
    .filter((c) => c && c !== q.sourceLabel)
    .map((c) => `<span class="chip">${esc(String(c))}</span>`)
    .join('');

  const descSource = plain(q.question);
  const description = `${descSource.slice(0, 120)} — সঠিক উত্তর ও ব্যাখ্যা${q.subject ? ` · ${q.subject}` : ''}${q.chapter ? `, ${q.chapter}` : ''}। পরীক্ষাঙ্গনে ফ্রি MCQ প্র্যাকটিস করো।`;

  const body = `
<article class="qcard">
<div class="chips">${chips}</div>
<h1>${esc(q.question)}</h1>
${q.questionImage ? `<img class="qimg" src="${esc(q.questionImage)}" alt="প্রশ্নের চিত্র">` : ''}
<h2>অপশন</h2>
<ol class="opts">${optsHtml}</ol>
<div class="answer"><span class="amed">✓</span><div><b>সঠিক উত্তর:</b> ${LETTERS[q.correctAnswerIndex] || ''}. ${esc(correctText)}</div></div>
${explHtml}
</article>
${moreHtml}
${paperHit ? `<div class="xlink"><div><b>${esc(paperLabel(paperHit.exam, paperHit.year))} — সম্পূর্ণ প্রশ্নপত্র</b><span>এই সেশনের সব প্রশ্ন সঠিক উত্তর ও ব্যাখ্যাসহ এক পেজে, বিষয় অনুযায়ী সাজানো।</span></div><a href="${rel(paperUrl(paperHit.exam, paperHit.year))}">পুরো প্রশ্নপত্র দেখো</a></div>` : ''}
<div class="banner"><h2>একই ধরনের আরও প্রশ্ন সলভ করো</h2>
<p>৫০,০০০+ প্রশ্ন, ব্যাখ্যাসহ উত্তর, টাইমার ও প্রোগ্রেস ট্র্যাকিং — ফ্রি।</p>
<a href="${paperHit ? `/qbank?level=ADMISSION&admissionCategory=${encodeURIComponent(paperHit.exam.category)}` : `/qbank?level=ACADEMIC&subject=${encodeURIComponent(q.subject)}&chapter=${encodeURIComponent(q.chapter)}`}">প্রশ্নব্যাংকে প্র্যাকটিস করো</a></div>`;

  const jsonLd = [
    breadcrumbLd(crumbs),
    {
      '@type': 'LearningResource',
      '@id': q.url,
      name: plain(q.question).slice(0, 150),
      inLanguage: 'bn-BD',
      learningResourceType: 'MCQ question with solution',
      teaches: q.subject || 'HSC ও ভর্তি পরস্তুতি',
      educationalLevel: q.level === 'ADMISSION' ? 'University admission' : 'Higher Secondary',
      isPartOf: paperHit
        ? { '@type': 'Quiz', name: `${paperTitleBn(paperHit.exam, paperHit.year)} — প্রশ্ন ও সমাধান`, url: paperUrl(paperHit.exam, paperHit.year) }
        : hasChapterPage
        ? { '@type': 'Course', name: `${q.subject} — HSC প্রস্তুতি কোর্স`, url: `${SITE}${HUB}${subjectSlug}/` }
        : { '@type': 'Course', name: 'HSC ও ভর্তি প্রস্তুতি', url: `${SITE}${HUB}` },
      provider: { '@type': 'Organization', name: 'Porikkhangon', sameAs: SITE },
      hasPart: {
        '@type': 'Question',
        name: plain(q.question).slice(0, 150),
        inLanguage: 'bn-BD',
        suggestedAnswer: q.options.map((o, i) => ({
          '@type': 'Answer',
          text: plain(o),
          position: i + 1,
          ...(i === q.correctAnswerIndex ? { comment: 'correct' } : {}),
        })),
        acceptedAnswer: { '@type': 'Answer', text: plain(correctText) },
        ...(q.explanation ? { acceptedAnswer: { '@type': 'Answer', text: plain(correctText), explanation: plain(q.explanation).slice(0, 500) } } : {}),
      },
    },
  ];

  writePage(`q/${q.slug}/index.html`, shell({
    title: `${plain(q.question).slice(0, 70)} | ${q.subject || 'MCQ'} সমাধান | পরীক্ষাঙ্গন`,
    description,
    canonical: q.url,
    breadcrumbs: crumbs,
    jsonLd,
    body,
    mathjax: true,
    section: paperHit ? 'admission' : 'syllabus',
  }));
  urls.push([`q/${q.slug}`, '0.6']);
  qPages++;
}

// --- Root + sitemap --------------------------------------------------------
urls.push(['/', '1.0']);
// Client-rendered app entry points (BrowserRouter deep links, no trailing slash).
urls.push(['auth', '0.7']);
urls.push(['privacy', '0.4']);
urls.push(['terms', '0.4']);
urls.push(['refund', '0.3']);
const NO_TRAILING_SLASH = new Set(['auth', 'privacy', 'terms', 'refund']);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .sort((a, b) => Number(b[1]) - Number(a[1]) || a[0].localeCompare(b[0]))
  .map(
    ([p, pr]) => `  <url>
    <loc>${p === '/' ? `${SITE}/` : NO_TRAILING_SLASH.has(p) ? `${SITE}/${p}` : `${SITE}/${p}/`}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${pr === '0.6' || p.startsWith('admission-questions/') && p.split('/').length === 3 ? 'monthly' : 'weekly'}</changefreq>
    <priority>${pr}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'sitemap.xml'), sitemap, 'utf8');

console.log(`[seo] Generated ${urls.length - 1} static pages (${qPages} question pages, ${paperPages} past-paper pages) + sitemap.xml into ${OUT}`);
