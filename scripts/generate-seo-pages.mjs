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
 *   /q/<slug>/                              PUBLIC QUESTION PAGES
 *                                           (Sattacademy-style: question +
 *                                           options + answer + explanation,
 *                                           one indexable URL per question)
 *   sitemap.xml                             regenerated with every URL above
 *
 * Question sources (merged, de-duplicated):
 *   1. Live question bank API (anonymous read): per-chapter sample +
 *      admission-level questions with explanations.
 *   2. Bundled datasets in /data (*.json) — guaranteed fallback so question
 *      pages exist even if the API is unreachable at build time.
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
const API = 'https://mongodb-hb6b.onrender.com/api';
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const TODAY = new Date().toISOString().slice(0, 10);
const SKIP_FETCH = process.argv.includes('--skip-fetch');

const outArg = process.argv.indexOf('--out');
const OUT = outArg !== -1 ? process.argv[outArg + 1] : join(ROOT, 'dist');

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
function shell({ title, description, canonical, breadcrumbs, jsonLd, body, mathjax = false }) {
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
</style>
</head>
<body>
<header><div class="header-in">
  <a class="brand" href="/"><img src="${SITE}/Pshape.svg" alt="পরীক্ষাঙ্গন লোগো"> পরীক্ষাঙ্গন</a>
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
    <a href="/hsc-syllabus/">সিলেবাস গাইড</a> ·
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

async function collectQuestions(syllabusSubjects) {
  /** @type {Map<string, any>} */
  const byId = new Map();
  const add = (q, source) => {
    if (!q || !q.question || !Array.isArray(q.options) || q.options.length < 2) return;
    const id = q._id || q.id || `local-${bnSlug(q.question)}-${q.options.length}`;
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
      slug: safePath(q.slug || bnSlug(q.question)),
      source,
    });
    const rec = byId.get(id);
    if (rec && rec.slug.length < 12) {
      rec.slug = safePath(`${bnSlug(rec.chapter || rec.subject || 'mcq')}-${rec.slug}`);
    }
  };

  // 4a. Bundled datasets (always available)
  for (const f of ['data/gst_a_23_24_questions.json', 'data/medical_24_25_questions.json']) {
    try {
      const arr = JSON.parse(readFileSync(join(ROOT, f), 'utf8'));
      (Array.isArray(arr) ? arr : []).forEach((q) => add(q, 'bundled'));
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
        const u = `${API}/admin/questions?page=1&limit=10&subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(chapter)}`;
        const data = await fetchJson(u);
        return (data?.questions || []).map((q) => ({ ...q, _subject: subject, _chapter: chapter }));
      });
    }
  }
  for (let p = 1; p <= 10; p++) {
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
      add(q, 'api');
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
const HUB = '/hsc-syllabus/';

console.log('[seo] collecting questions…');
const allQuestions = await collectQuestions(subjects);

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
const LETTERS = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ'];
let qPages = 0;
for (const q of allQuestions) {
  const subjectSlug = q.subject ? slugify(q.subject) : '';
  const chapterSlug = q.chapter ? slugify(q.chapter) : '';
  const hasSubjectPage = q.subject && SYLLABUS_DB[q.subject];
  const hasChapterPage = hasSubjectPage && SYLLABUS_DB[q.subject][q.chapter];

  const crumbs = [['পরীক্ষাঙ্গন', `${SITE}/`], ['HSC সিলেবাস গাইড', `${SITE}${HUB}`]];
  if (hasSubjectPage) crumbs.push([q.subject, `${SITE}${HUB}${subjectSlug}/`]);
  if (hasChapterPage) crumbs.push([q.chapter, `${SITE}${HUB}${subjectSlug}/${chapterSlug}/`]);
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

  const chips = [q.subject, q.chapter, q.level === 'ADMISSION' ? 'ভর্তি পরীক্ষা' : q.level === 'MAINBOOK' ? 'মূল বই' : q.level === 'ACADEMIC' ? 'HSC একাডেমিক' : '', ...(q.tags || []).slice(0, 2)]
    .filter(Boolean)
    .map((c) => `<span class="chip">${esc(String(c))}</span>`)
    .join('');

  const descSource = plain(q.question);
  const description = `${descSource.slice(0, 120)} — সঠিক উত্তর ও ব্যাখ্যা${q.subject ? ` · ${q.subject}` : ''}${q.chapter ? `, ${q.chapter}` : ''}। পরীক্ষাঙ্গনে ফ্রি MCQ প্র্যাকটিস করো।`;

  const body = `
<article class="qcard">
<div class="chips">${chips}</div>
<h1>${esc(q.question)}</h1>
${q.questionImage ? `<img class="qimg" src="${esc(q.questionImage)}" alt="প্রশ্নের চিত্র">` : ''}
<h2>বিকল্পসমূহ</h2>
<ol class="opts">${optsHtml}</ol>
<div class="answer"><span class="amed">✓</span><div><b>সঠিক উত্তর:</b> ${LETTERS[q.correctAnswerIndex] || ''}. ${esc(correctText)}</div></div>
${explHtml}
</article>
${moreHtml}
<div class="banner"><h2>একই ধরনের আরও প্রশ্ন সলভ করো</h2>
<p>৫০,০০০+ প্রশ্ন, ব্যাখ্যাসহ উত্তর, টাইমার ও প্রোগ্রেস ট্র্যাকিং — ফ্রি।</p>
<a href="/qbank?level=ACADEMIC&subject=${encodeURIComponent(q.subject)}&chapter=${encodeURIComponent(q.chapter)}">প্রশ্নব্যাংকে প্র্যাকটিস করো</a></div>`;

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
      isPartOf: hasChapterPage
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
    <changefreq>${pr === '0.6' ? 'monthly' : 'weekly'}</changefreq>
    <priority>${pr}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'sitemap.xml'), sitemap, 'utf8');

console.log(`[seo] Generated ${urls.length - 1} static pages (${qPages} question pages) + sitemap.xml into ${OUT}`);
