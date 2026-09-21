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
 *   /admission-questions/                   previous-year admission papers hub
 *   /admission-questions/<institution>/     e.g. /admission-questions/medical/
 *   /admission-questions/<institution>/<session>/
 *                                           e.g. /admission-questions/medical/2021-22/
 *                                           = "মেডিকেল ভর্তি পরীক্ষা ২০২১-২২" — the
 *                                           full paper with answers + explanations
 *   /q/<slug>/                              PUBLIC QUESTION PAGES
 *                                           (Sattacademy-style: question +
 *                                           options + answer + explanation,
 *                                           one indexable URL per question)
 *   sitemap.xml                             regenerated with every URL above
 *
 * Question sources (merged, de-duplicated):
 *   1. Live question bank API (anonymous read): per-chapter sample +
 *      admission-level questions with explanations + every question tagged
 *      with an exam session (`GET /admin/questions?board=<Institution> '`,
 *      the API matches the `tags` array) — grouped into exam papers by the
 *      exact `<Institution> 'YY-YY` tag.
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
// 1. Load SYLLABUS_DB + admission exam catalog from TypeScript (no runtime deps)
// ---------------------------------------------------------------------------
const tmp = mkdtempSync(join(tmpdir(), 'seo-syllabus-'));
buildSync({
  entryPoints: [join(ROOT, 'services', 'syllabusData.ts'), join(ROOT, 'data', 'admissionExams.ts')],
  bundle: true,
  format: 'esm',
  outdir: tmp,
  outbase: ROOT,
  outExtension: { '.js': '.mjs' },
  logLevel: 'silent',
});
const { SYLLABUS_DB } = await import(pathToFileURL(join(tmp, 'services', 'syllabusData.mjs')).href);
const EXAMS = await import(pathToFileURL(join(tmp, 'data', 'admissionExams.mjs')).href);
rmSync(tmp, { recursive: true, force: true });
const {
  ADMISSION_INSTITUTIONS,
  ADMISSION_HUB_PATH,
  ADMISSION_CATEGORY_LABELS,
  ADMISSION_CATEGORY_ORDER,
  parseExamTag,
  buildExamTag,
  findInstitutionByTag,
  sessionToBangla,
  sessionToSlug,
  paperTitle,
  paperPath,
  institutionPath,
  qbankPaperLink,
  compareSessionsDesc,
  subjectFamilyOf,
  subjectToBangla,
  subjectOrderFor,
  toBanglaDigits,
} = EXAMS;

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
function shell({ title, description, canonical, breadcrumbs, jsonLd, body, mathjax = false, script = '' }) {
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
.expl>div{white-space:pre-wrap}
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
/* --- previous-year paper pages --- */
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin:20px 0 6px}
.stat{background:#fff;border:1px solid var(--line);border-radius:18px;padding:14px 16px;box-shadow:0 1px 2px rgba(22,18,16,.04)}
.stat b{display:block;font-family:'Noto Serif Bengali',serif;font-size:24px;line-height:1.2;color:var(--deep)}
.stat span{font-size:13px;color:var(--mist);font-weight:600}
.toc{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 6px}
.toc a{border:1px solid var(--line);background:#fff;border-radius:999px;padding:6px 14px;font-size:13.5px;font-weight:700;text-decoration:none;color:var(--ink)}
.toc a:hover{border-color:rgba(255,82,0,.4);color:var(--deep)}
.toc a small{color:var(--mist);font-weight:600;margin-left:4px}
.toolbar{position:sticky;top:64px;z-index:4;display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;margin:20px 0 8px;padding:10px 14px;border-radius:16px;background:rgba(255,255,255,.86);backdrop-filter:blur(10px);border:1px solid var(--line);box-shadow:0 12px 30px -20px rgba(22,18,16,.35)}
.toolbar span{font-size:13px;color:var(--mist);font-weight:600}
.toolbar .tb{display:flex;gap:8px;flex-wrap:wrap}
.toolbar button,.toolbar a.btn{border:1px solid var(--line);background:#fff;border-radius:999px;padding:7px 14px;font:inherit;font-size:13px;font-weight:700;color:var(--ink);cursor:pointer;text-decoration:none}
.toolbar button:hover,.toolbar a.btn:hover{border-color:rgba(255,82,0,.4);color:var(--deep)}
.toolbar a.btn.primary{background:var(--ink);color:#fff;border-color:var(--ink)}
.toolbar a.btn.primary:hover{background:var(--deep);border-color:var(--deep);color:#fff}
h2.sub{margin-top:40px;padding-top:10px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
h2.sub small{font-size:13px;color:var(--mist);font-weight:600;background:#fff;border:1px solid var(--line);border-radius:999px;padding:3px 12px}
article.pq{background:#fff;border:1px solid var(--line);border-radius:22px;padding:20px 22px 18px;margin:14px 0;box-shadow:0 1px 2px rgba(22,18,16,.04);scroll-margin-top:130px}
article.pq .pq-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px}
article.pq .num{flex:none;min-width:34px;height:34px;padding:0 10px;border-radius:12px;background:var(--ink);color:#fff;font-weight:800;display:grid;place-items:center;font-size:14px}
article.pq .meta{font-size:12.5px;color:var(--mist);font-weight:600}
article.pq h3{margin:0 0 6px;font-size:17.5px;line-height:1.7;font-weight:700;font-family:'Hind Siliguri','Noto Sans Bengali',sans-serif}
article.pq h3 a{color:var(--ink);text-decoration:none}
article.pq h3 a:hover{color:var(--deep)}
article.pq ol.opts{margin:12px 0;gap:8px;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr))}
article.pq ol.opts li{padding:9px 12px;border-radius:14px;font-size:15px}
article.pq ol.opts li .lt{width:30px;height:30px;border-radius:10px;font-size:14px}
article.pq ol.opts li .tick{display:none!important}
article.pq .answer{margin:10px 0 6px;padding:10px 14px;font-size:14.5px}
article.pq .answer .amed{width:30px;height:30px;font-size:15px}
article.pq details.expl{margin:8px 0 0;padding:0;background:var(--cream);border:1px solid rgba(255,82,0,.16);border-left:5px solid var(--brand)}
article.pq details.expl summary{cursor:pointer;padding:11px 16px;font-weight:700;color:var(--deep);list-style:none;font-size:14.5px}
article.pq details.expl summary::-webkit-details-marker{display:none}
article.pq details.expl summary::before{content:"+";display:inline-grid;place-items:center;width:20px;height:20px;border-radius:6px;background:#fff;margin-right:8px;font-weight:800}
article.pq details.expl[open] summary::before{content:"−"}
article.pq details.expl .expl-body{padding:0 16px 14px;font-size:15px;white-space:pre-wrap}
body.hide-ans article.pq ol.opts li.correct{border-color:var(--line);background:var(--paper);font-weight:400}
body.hide-ans article.pq ol.opts li.correct .lt{background:var(--mint);color:var(--deep);box-shadow:inset 0 -2px 0 rgba(224,68,0,.25)}
body.hide-ans article.pq .answer,body.hide-ans article.pq details.expl{display:none}
.format{width:100%;border-collapse:separate;border-spacing:0;margin:14px 0 6px;background:#fff;border:1px solid var(--line);border-radius:18px;overflow:hidden;font-size:15px}
.format th,.format td{padding:11px 16px;text-align:left;border-bottom:1px solid var(--line);vertical-align:top}
.format tr:last-child th,.format tr:last-child td{border-bottom:0}
.format th{width:34%;background:var(--cream);font-weight:700;color:var(--deep)}
.faq details{background:#fff;border:1px solid var(--line);border-radius:16px;padding:0;margin:10px 0}
.faq summary{cursor:pointer;padding:13px 18px;font-weight:700;list-style:none}
.faq summary::-webkit-details-marker{display:none}
.faq details div{padding:0 18px 14px;color:var(--mist)}
.card .yr{font-family:'Noto Serif Bengali',serif;font-size:20px;color:var(--deep)}
.card .tagline{display:inline-block;margin-top:8px;font-size:12px;font-weight:700;color:#7a4d00;background:#ffedc2;border-radius:999px;padding:2px 10px}
.pill-row{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 0}
.pill-row a{border:1px solid var(--line);background:#fff;border-radius:999px;padding:6px 14px;font-size:13.5px;font-weight:700;text-decoration:none;color:var(--ink)}
.pill-row a:hover{border-color:rgba(255,82,0,.4);color:var(--deep)}
.pill-row a.cur{background:var(--ink);color:#fff;border-color:var(--ink)}
@media (max-width:640px){article.qcard{padding:22px 16px}article.pq{padding:16px 14px}.toolbar{top:58px}}
@media print{header,footer,.toolbar,.banner,.pager,nav.crumb{display:none!important}body{background:#fff}article.pq{break-inside:avoid;box-shadow:none}article.pq details.expl{display:block}article.pq details.expl .expl-body{display:block}}
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
    <a href="${ADMISSION_HUB_PATH}">বিগত বছরের ভর্তি প্রশ্ন</a> ·
    <a href="/privacy">প্রাইভেসি</a> ·
    <a href="/terms">টার্মস</a>
  </span>
</div></footer>
${script ? `<script>${script}</script>` : ''}
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
  const add = (q, source, sourceLabel = '') => {
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
      topic: q.topic || '',
      level: q.level || '',
      examRef: q.examRef || '',
      tags: Array.isArray(q.tags) ? q.tags.map(String) : [],
      orderIndex: Number(q.orderIndex) || 0,
      createdAt: Number(q.createdAt) || 0,
      questionImage: q.questionImage || '',
      explanationImage: q.explanationImage || '',
      slug: safePath(q.slug || bnSlug(q.question)),
      source,
      sourceLabel: sourceLabel || (q.examRef ? String(q.examRef) : ''),
      seq: byId.size, // insertion order = file/API order, last-resort tiebreaker
    });
    const rec = byId.get(id);
    if (rec && rec.slug.length < 12) {
      rec.slug = safePath(`${bnSlug(rec.chapter || rec.subject || 'mcq')}-${rec.slug}`);
    }
  };

  // 4a. Bundled datasets (always available) — label = where the question came
  //     from; `tag` = the exam-session tag so the paper pages can include them
  //     even when the API is down (they are de-duplicated against API rows).
  const BUNDLED = {
    'data/gst_a_23_24_questions.json': { label: 'GST-A ভর্তি পরীক্ষা ২০২৩-২৪', tag: "GST-A '23-24" },
    'data/medical_24_25_questions.json': { label: 'মেডিকেল ভর্তি পরীক্ষা ২০২৪-২৫', tag: "Medical '24-25" },
  };
  for (const [f, meta] of Object.entries(BUNDLED)) {
    try {
      const arr = JSON.parse(readFileSync(join(ROOT, f), 'utf8'));
      (Array.isArray(arr) ? arr : []).forEach((q) =>
        add({ ...q, level: q.level || 'ADMISSION', tags: [...new Set([...(q.tags || []), meta.tag])] }, 'bundled', meta.label)
      );
    } catch (e) {
      console.warn(`[seo] could not read ${f}: ${e.message}`);
    }
  }

  if (SKIP_FETCH) return [...byId.values()];

  // 4b'. Exam papers: every question tagged "<Institution> 'YY-YY".
  //      `board=` filters the `tags` array with a partial match, so one query
  //      per institution ("Medical '") returns all of its sessions at once;
  //      the exact tag is used later to split them into papers.
  {
    const PAGE = 100;
    const MAX_PAGES = 60; // 6,000 questions per institution is plenty
    const paperDeadline = Date.now() + 300000;
    const perInstitution = ADMISSION_INSTITUTIONS.map((inst) => async () => {
      if (Date.now() > paperDeadline) return null;
      const q = encodeURIComponent(`${inst.tag} '`);
      const first = await fetchJson(`${API}/admin/questions?page=1&limit=${PAGE}&board=${q}`, 30000);
      const rows = [...(first?.questions || [])];
      const total = Number(first?.total) || rows.length;
      const pages = Math.min(Math.ceil(total / PAGE), MAX_PAGES);
      if (pages > 1) {
        const more = await pool(
          Array.from({ length: pages - 1 }, (_, i) => async () => {
            if (Date.now() > paperDeadline) return null;
            const d = await fetchJson(`${API}/admin/questions?page=${i + 2}&limit=${PAGE}&board=${q}`, 30000);
            return d?.questions || [];
          }),
          4
        );
        for (const list of more) if (list) rows.push(...list);
      }
      return { inst: inst.tag, total, rows };
    });
    const results = await pool(perInstitution, 2);
    let paperRows = 0;
    for (const r of results) {
      if (!r) continue;
      for (const q of r.rows) {
        add(q, 'api', '');
        paperRows++;
      }
      console.log(`[seo] exam tags "${r.inst} '…": ${r.rows.length}/${r.total} rows`);
    }
    if (paperRows === 0) console.warn('[seo] WARNING: no exam-tagged questions fetched — paper pages will use bundled data only');
  }

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

// --- Group exam-tagged questions into previous-year papers -----------------
// A question tagged ["Medical '21-22", "Dental '22-23"] appears in both papers.
// Within a paper, near-identical rows (bundled JSON vs API) are collapsed by
// their normalised question text; API rows win because they carry real ids,
// slugs and images.
const MIN_PAPER_QUESTIONS = 10;
const papers = new Map(); // "inst.id|session" -> paper
const textKey = (q) => bnSlug(plain(q.question)).toLowerCase();
for (const q of [...allQuestions].sort((a, b) => (a.source === 'api' ? 0 : 1) - (b.source === 'api' ? 0 : 1))) {
  for (const tag of q.tags) {
    const parsed = parseExamTag(tag);
    if (!parsed) continue;
    const inst = findInstitutionByTag(parsed.prefix);
    if (!inst) continue;
    const key = `${inst.id}|${parsed.session}`;
    if (!papers.has(key)) {
      papers.set(key, {
        inst,
        session: parsed.session,
        tag: buildExamTag(inst.tag, parsed.session),
        title: paperTitle(inst, parsed.session),
        path: paperPath(inst, parsed.session),
        questions: [],
        _seen: new Set(),
      });
    }
    const p = papers.get(key);
    const tk = textKey(q);
    if (p._seen.has(tk)) continue;
    p._seen.add(tk);
    p.questions.push(q);
  }
}
for (const [key, p] of [...papers]) {
  if (p.questions.length < MIN_PAPER_QUESTIONS) {
    papers.delete(key);
    continue;
  }
  const famOrder = subjectOrderFor(p.inst);
  const famRank = (q) => {
    const i = famOrder.indexOf(subjectFamilyOf(q.subject).key);
    return i === -1 ? 99 : i;
  };
  // exam subject order → paper (1st/2nd) → upload batch (≈ chapter order) → serial within batch
  p.questions.sort(
    (a, b) =>
      famRank(a) - famRank(b) ||
      a.subject.localeCompare(b.subject) ||
      a.createdAt - b.createdAt ||
      a.orderIndex - b.orderIndex ||
      a.seq - b.seq
  );
  p.url = `${SITE}${p.path}`;
  p.explained = p.questions.filter((q) => q.explanation).length;
  // subject-family breakdown, in exam order
  const fam = new Map();
  for (const q of p.questions) {
    const f = subjectFamilyOf(q.subject);
    if (!fam.has(f.key)) fam.set(f.key, { ...f, count: 0 });
    fam.get(f.key).count++;
  }
  p.families = [...fam.values()];
  delete p._seen;
  for (const q of p.questions) (q.papers ||= []).push(p);
}
const paperList = [...papers.values()].sort(
  (a, b) =>
    ADMISSION_INSTITUTIONS.indexOf(a.inst) - ADMISSION_INSTITUTIONS.indexOf(b.inst) || compareSessionsDesc(a.session, b.session)
);
const papersByInst = new Map(); // inst.id -> papers (newest first)
for (const p of paperList) {
  if (!papersByInst.has(p.inst.id)) papersByInst.set(p.inst.id, []);
  papersByInst.get(p.inst.id).push(p);
}
console.log(`[seo] previous-year papers: ${paperList.length} (${[...papersByInst.keys()].join(', ') || 'none'})`);

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
${paperList.length ? `<div class="tips"><h2>বিগত বছরের ভর্তি পরীক্ষার প্রশ্ন সমাধান</h2>
<p style="margin:0 0 8px;color:var(--mist)">সিলেবাস শেষ? এবার আসল প্রশ্নে নিজেকে যাচাই করো — ${paperList.length}টি সেশনের পূর্ণাঙ্গ প্রশ্নপত্র ব্যাখ্যাসহ।</p>
<div class="pill-row">
<a href="${ADMISSION_HUB_PATH}">সব ভর্তি পরীক্ষা</a>
${[...papersByInst.keys()].slice(0, 6).map((id) => {
  const ps = papersByInst.get(id);
  return `<a href="${institutionPath(ps[0].inst)}">${esc(ps[0].inst.short)} (${toBanglaDigits(ps.length)} সেশন)</a>`;
}).join('\n')}
</div></div>` : ''}
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

// ===========================================================================
// Previous-year admission papers  (/admission-questions/…)
// Same recipe as the HSC syllabus pages that already rank: one hub, one page
// per institution, one page per session — every page fully server-rendered,
// interlinked, with breadcrumbs + structured data.
// ===========================================================================
const LETTERS = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ'];
const PAPER_HUB_URL = `${SITE}${ADMISSION_HUB_PATH}`;
const HUB_CRUMB = ['বিগত বছরের ভর্তি প্রশ্ন', PAPER_HUB_URL];
const bn = (n) => toBanglaDigits(n);
const familyList = (p) => p.families.map((f) => `${f.bn} ${bn(f.count)}`).join(' · ');

const PAPER_TIPS = [
  'প্রথমবার সময় ধরে সলভ করো (১০০ প্রশ্নে ৬০ মিনিট ধরে নাও) — তারপর উত্তর মিলাও।',
  'ভুল হওয়া প্রশ্নের ব্যাখ্যা পড়ে সেই অধ্যায়টা আবার রিভিশন দাও; শুধু উত্তর মুখস্থ করো না।',
  'কোন অধ্যায় থেকে বারবার প্রশ্ন আসছে সেটা টুকে রাখো — পরের বছরের প্রশ্নের সবচেয়ে ভালো ইঙ্গিত এটাই।',
  'একই সেশনের প্রশ্ন ২–৩ সপ্তাহ পর আবার সলভ করো; দ্বিতীয়বারে ৯০%+ না হলে অধ্যায়টা কাঁচা আছে।',
];

// --- Hub -------------------------------------------------------------------
if (paperList.length) {
  const totalQ = paperList.reduce((n, p) => n + p.questions.length, 0);
  const instIds = [...papersByInst.keys()];
  const sections = ADMISSION_CATEGORY_ORDER.map((cat) => {
    const ids = instIds.filter((id) => papersByInst.get(id)[0].inst.category === cat);
    if (!ids.length) return '';
    const cards = ids
      .map((id) => {
        const ps = papersByInst.get(id);
        const inst = ps[0].inst;
        const n = ps.reduce((s, p) => s + p.questions.length, 0);
        const pills = ps
          .slice(0, 4)
          .map((p) => `<a href="${p.path}">${sessionToBangla(p.session)}</a>`)
          .join('');
        return `<div class="card"><a href="${institutionPath(inst)}" style="text-decoration:none;color:inherit"><b>${esc(inst.name)}</b><span>${esc(inst.nameEn)} · ${bn(ps.length)}টি সেশন · ${bn(n)}টি প্রশ্ন ব্যাখ্যাসহ</span></a><div class="pill-row">${pills}${ps.length > 4 ? `<a href="${institutionPath(inst)}">সব সেশন →</a>` : ''}</div></div>`;
      })
      .join('\n');
    return `<h2 id="${cat}">${esc(ADMISSION_CATEGORY_LABELS[cat])}</h2><div class="grid">${cards}</div>`;
  }).join('\n');

  const latest = paperList.slice().sort((a, b) => compareSessionsDesc(a.session, b.session)).slice(0, 8);

  const body = `
<h1>বিগত বছরের ভর্তি পরীক্ষার প্রশ্ন ও সমাধান — মেডিকেল, ঢাবি, বুয়েট, GST</h1>
<p class="lede">বাংলাদেশের প্রধান ভর্তি পরীক্ষাগুলোর বিগত বছরের প্রশ্নপত্র (Previous Year Question) — প্রতিটি প্রশ্নের সঠিক উত্তর ও ব্যাখ্যাসহ, বিষয় অনুযায়ী সাজানো। পরীক্ষাঙ্গনের প্রশ্নব্যাংক থেকে সরাসরি আসা ${bn(instIds.length)}টি প্রতিষ্ঠানের ${bn(paperList.length)}টি সেশনের মোট ${bn(totalQ)}টি প্রশ্ন এখানে ফ্রিতে পড়া ও প্র্যাকটিস করা যায়।</p>
<div class="stats">
<div class="stat"><b>${bn(instIds.length)}</b><span>ভর্তি পরীক্ষা</span></div>
<div class="stat"><b>${bn(paperList.length)}</b><span>সেশন / প্রশ্নপত্র</span></div>
<div class="stat"><b>${bn(totalQ)}</b><span>প্রশ্ন, উত্তরসহ</span></div>
<div class="stat"><b>${bn(paperList.reduce((n, p) => n + p.explained, 0))}</b><span>ব্যাখ্যাসহ প্রশ্ন</span></div>
</div>
<h2>সাম্প্রতিক প্রশ্নপত্র</h2>
<div class="pill-row">${latest.map((p) => `<a href="${p.path}">${esc(p.title)}</a>`).join('')}</div>
${sections}
<div class="tips"><h2>বিগত বছরের প্রশ্ন কীভাবে সলভ করবে?</h2>
<ul class="topics">${PAPER_TIPS.map((t) => `<li>${esc(t)}</li>`).join('\n')}</ul></div>
<div class="banner"><h2>পুরো প্রশ্নপত্রে টাইমার সহ পরীক্ষা দাও</h2>
<p>যেকোনো সেশন বেছে নাও, অ্যাপে মডেল টেস্ট দাও, ভুলগুলো অটো-সেভ হবে রিভিশনের জন্য — ফ্রি।</p>
<a href="/qbank?level=ADMISSION">প্রশ্নব্যাংকে যাও</a></div>`;

  const jsonLd = [
    breadcrumbLd([['পরীক্ষাঙ্গন', `${SITE}/`], HUB_CRUMB]),
    {
      '@type': 'ItemList',
      name: 'বিগত বছরের ভর্তি পরীক্ষার প্রশ্নপত্র',
      numberOfItems: paperList.length,
      itemListElement: paperList.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.title, url: p.url })),
    },
  ];

  const path = writePage('admission-questions/index.html', shell({
    title: 'বিগত বছরের ভর্তি পরীক্ষার প্রশ্ন ও সমাধান — মেডিকেল, ঢাবি, বুয়েট, GST | পরীক্ষাঙ্গন',
    description: `মেডিকেল, ডেন্টাল, ঢাবি ক ইউনিট, বুয়েট, GST সহ ${instIds.length}টি ভর্তি পরীক্ষার বিগত বছরের প্রশ্ন — ${paperList.length}টি সেশনের ${totalQ}টি MCQ সঠিক উত্তর ও ব্যাখ্যাসহ। পরীক্ষাঙ্গনে ফ্রি প্র্যাকটিস করো।`,
    canonical: PAPER_HUB_URL,
    breadcrumbs: [['পরীক্ষাঙ্গন', `${SITE}/`], HUB_CRUMB],
    jsonLd,
    body,
  }));
  urls.push([path, '0.9']);
}

// --- Institution pages -----------------------------------------------------
for (const ps of papersByInst.values()) {
  const inst = ps[0].inst;
  const instUrl = `${SITE}${institutionPath(inst)}`;
  const totalQ = ps.reduce((n, p) => n + p.questions.length, 0);
  const sessionsBn = ps.map((p) => sessionToBangla(p.session));

  const cards = ps
    .map(
      (p) => `<a class="card" href="${p.path}"><span class="yr">${sessionToBangla(p.session)}</span><b>${esc(p.title)} — প্রশ্ন ও সমাধান</b><span>${bn(p.questions.length)}টি প্রশ্ন · ${familyList(p)}</span>${p.explained ? `<span class="tagline">${bn(p.explained)}টি ব্যাখ্যাসহ</span>` : ''}</a>`
    )
    .join('\n');

  const formatHtml = inst.format?.length
    ? `<h2>${esc(inst.name)} — পরীক্ষার ধরন</h2>
<table class="format">${inst.format.map((r) => `<tr><th>${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join('')}</table>`
    : '';

  const faqHtml = inst.faqs?.length
    ? `<h2>সাধারণ প্রশ্ন</h2><div class="faq">${inst.faqs.map((f) => `<details><summary>${esc(f.q)}</summary><div>${esc(f.a)}</div></details>`).join('')}</div>`
    : '';

  // Chapter frequency across all sessions — genuinely useful "যে অধ্যায় থেকে বেশি প্রশ্ন আসে"
  const chapterFreq = new Map();
  for (const p of ps) for (const q of p.questions) {
    if (!q.chapter) continue;
    const k = `${q.subject}||${q.chapter}`;
    chapterFreq.set(k, (chapterFreq.get(k) || 0) + 1);
  }
  const topChapters = [...chapterFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
  const topChaptersHtml = topChapters.length
    ? `<h2>যে অধ্যায়গুলো থেকে সবচেয়ে বেশি প্রশ্ন এসেছে</h2>
<p class="lede">${esc(inst.short)}-এর ${bn(ps.length)}টি সেশনের ${bn(totalQ)}টি প্রশ্ন বিশ্লেষণ করে পাওয়া শীর্ষ অধ্যায়:</p>
<div class="pill-row">${topChapters.map(([k, n]) => {
  const [subject, chapter] = k.split('||');
  const hasChapterPage = SYLLABUS_DB[subject] && SYLLABUS_DB[subject][chapter];
  const label = `${esc(chapter)} <small style="color:var(--mist)">(${esc(subjectToBangla(subject))}) · ${bn(n)}</small>`;
  return hasChapterPage ? `<a href="${HUB}${slugify(subject)}/${slugify(chapter)}/">${label}</a>` : `<a href="/qbank?level=ADMISSION&subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(chapter)}">${label}</a>`;
}).join('')}</div>`
    : '';

  const body = `
<h1>${esc(inst.name)} — বিগত বছরের প্রশ্ন ও সমাধান (${esc(inst.shortEn)} Question Bank)</h1>
<p class="lede">${esc(inst.description)}</p>
<div class="chips"><span class="chip">${bn(ps.length)}টি সেশন</span><span class="chip">${bn(totalQ)}টি প্রশ্ন</span><span class="chip">সঠিক উত্তর ও ব্যাখ্যাসহ</span><span class="chip">${ps.length > 1 ? `${esc(sessionsBn[sessionsBn.length - 1])} থেকে ${esc(sessionsBn[0])}` : `সেশন ${esc(sessionsBn[0])}`}</span></div>
<h2>সেশন অনুযায়ী প্রশ্নপত্র</h2>
<div class="grid">${cards}</div>
${formatHtml}
${topChaptersHtml}
<div class="tips"><h2>${esc(inst.short)}-এর বিগত প্রশ্ন সলভ করার কৌশল</h2>
<ul class="topics">${PAPER_TIPS.map((t) => `<li>${esc(t)}</li>`).join('\n')}</ul></div>
${faqHtml}
<div class="banner"><h2>${esc(inst.short)}-এর প্রশ্নে টাইমার সহ মডেল টেস্ট দাও</h2>
<p>সেশন বেছে নাও, ${bn(100)} প্রশ্নে ৬০ মিনিট — রেজাল্ট, ভুলের তালিকা ও ব্যাখ্যা সাথে সাথে।</p>
<a href="/qbank?level=ADMISSION&institution=${encodeURIComponent(inst.qbankInstitution)}&unit=all">অ্যাপে প্র্যাকটিস শুরু করো</a></div>`;

  const jsonLd = [
    breadcrumbLd([['পরীক্ষাঙ্গন', `${SITE}/`], HUB_CRUMB, [inst.name, instUrl]]),
    {
      '@type': 'ItemList',
      name: `${inst.name} — বিগত বছরের প্রশ্নপত্র`,
      numberOfItems: ps.length,
      itemListElement: ps.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.title, url: p.url })),
    },
    ...(inst.faqs?.length
      ? [{
          '@type': 'FAQPage',
          mainEntity: inst.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        }]
      : []),
  ];

  const path = writePage(`admission-questions/${inst.id}/index.html`, shell({
    title: `${inst.name} — বিগত বছরের প্রশ্ন ও সমাধান (${inst.shortEn} Question Bank) | পরীক্ষাঙ্গন`,
    description: `${inst.name} ${ps.length > 1 ? `${sessionsBn[sessionsBn.length - 1]} থেকে ${sessionsBn[0]}` : sessionsBn[0]} — ${ps.length}টি সেশনের ${totalQ}টি প্রশ্ন সঠিক উত্তর ও ব্যাখ্যাসহ। ${inst.shortEn} previous year questions with solutions — পরীক্ষাঙ্গনে ফ্রি।`,
    canonical: instUrl,
    breadcrumbs: [['পরীক্ষাঙ্গন', `${SITE}/`], HUB_CRUMB, [inst.name, instUrl]],
    jsonLd,
    body,
  }));
  urls.push([path, '0.8']);
}

// --- Paper pages (one per session) ----------------------------------------
const TOGGLE_SCRIPT = `(function(){var b=document.getElementById('toggle-ans');if(!b)return;var k='pk-hide-ans';var on=localStorage.getItem(k)==='1';function apply(){document.body.classList.toggle('hide-ans',on);b.textContent=on?'উত্তর দেখাও':'উত্তর লুকাও';b.setAttribute('aria-pressed',on?'true':'false');if(!on){document.querySelectorAll('article.pq ol.opts li').forEach(function(x){x.classList.remove('picked');x.style.borderColor='';x.style.background=''})}}b.addEventListener('click',function(){on=!on;try{localStorage.setItem(k,on?'1':'0')}catch(e){}apply()});apply();document.querySelectorAll('article.pq ol.opts li').forEach(function(li){li.addEventListener('click',function(){if(!document.body.classList.contains('hide-ans'))return;var art=li.closest('article');art.querySelectorAll('li').forEach(function(x){x.classList.remove('picked')});li.classList.add('picked');li.style.borderColor=li.classList.contains('correct')?'#16a34a':'#dc2626';li.style.background=li.classList.contains('correct')?'#f2fbf5':'#fef2f2'})})})();`;

for (const p of paperList) {
  const inst = p.inst;
  const siblings = papersByInst.get(inst.id);
  const idx = siblings.indexOf(p);
  const newer = siblings[idx - 1];
  const older = siblings[idx + 1];
  const instUrl = `${SITE}${institutionPath(inst)}`;

  // Sections per subject family, continuous numbering across the page
  let n = 0;
  const sections = p.families
    .map((f) => {
      const qs = p.questions.filter((q) => subjectFamilyOf(q.subject).key === f.key);
      const items = qs
        .map((q) => {
          n++;
          const correctText = q.options[q.correctAnswerIndex] || '';
          const opts = q.options
            .map((opt, i) => `<li${i === q.correctAnswerIndex ? ' class="correct"' : ''}><span class="lt">${LETTERS[i] || i + 1}</span><span class="txt">${esc(opt)}${q.optionsImages?.[i] ? `<br><img class="qimg" loading="lazy" src="${esc(q.optionsImages[i])}" alt="বিকল্প ${i + 1}">` : ''}</span></li>`)
            .join('');
          const expl = q.explanation || q.explanationImage
            ? `<details class="expl"><summary>ব্যাখ্যা</summary><div class="expl-body">${esc(q.explanation)}${q.explanationImage ? `<img class="qimg" loading="lazy" src="${esc(q.explanationImage)}" alt="ব্যাখ্যার চিত্র">` : ''}</div></details>`
            : '';
          const meta = [subjectToBangla(q.subject), q.chapter].filter(Boolean).map(esc).join(' · ');
          return `<article class="pq" id="q${n}">
<div class="pq-head"><span class="num">${bn(n)}</span><span class="meta">${meta}</span></div>
<h3><a href="${rel(q.url)}">${esc(q.question)}</a></h3>
${q.questionImage ? `<img class="qimg" loading="lazy" src="${esc(q.questionImage)}" alt="প্রশ্নের চিত্র">` : ''}
<ol class="opts">${opts}</ol>
<div class="answer"><span class="amed">✓</span><div><b>সঠিক উত্তর:</b> ${LETTERS[q.correctAnswerIndex] || ''}. ${esc(correctText)}</div></div>
${expl}
</article>`;
        })
        .join('\n');
      return `<h2 class="sub" id="${slugify(f.key)}">${esc(f.bn)} <small>${esc(f.en)} · ${bn(qs.length)}টি প্রশ্ন</small></h2>\n${items}`;
    })
    .join('\n');

  const toc = p.families.map((f) => `<a href="#${slugify(f.key)}">${esc(f.bn)}<small>${bn(f.count)}</small></a>`).join('');
  const sessionPills = siblings
    .map((s) => `<a href="${s.path}"${s === p ? ' class="cur" aria-current="page"' : ''}>${sessionToBangla(s.session)}</a>`)
    .join('');

  const pager = `<div class="pager">
${older ? `<a href="${older.path}">← ${esc(older.title)}</a>` : '<span></span>'}
${newer ? `<a href="${newer.path}">${esc(newer.title)} →</a>` : `<a href="${institutionPath(inst)}">সব সেশন</a>`}
</div>`;

  const body = `
<h1>${esc(p.title)} — প্রশ্ন ও সমাধান</h1>
<p class="lede">${esc(inst.name)} ${sessionToBangla(p.session)} সেশনের (${esc(inst.shortEn)} ${sessionToSlug(p.session)}) প্রশ্নপত্রের ${bn(p.questions.length)}টি MCQ — প্রতিটির সঠিক উত্তর${p.explained ? ` এবং ${bn(p.explained)}টি প্রশ্নের বিস্তারিত ব্যাখ্যা` : ''}, বিষয় অনুযায়ী সাজানো (${familyList(p)})। প্রশ্নগুলো পরীক্ষাঙ্গনের প্রশ্নব্যাংক থেকে সরাসরি আনা; কোনো প্রশ্ন আলাদা করে পড়তে তার উপর ক্লিক করো।</p>
<div class="chips"><span class="chip src">${esc(p.tag)}</span><span class="chip">${bn(p.questions.length)}টি প্রশ্ন</span>${p.explained ? `<span class="chip">${bn(p.explained)}টি ব্যাখ্যাসহ</span>` : ''}<span class="chip">ভর্তি পরীক্ষা</span></div>
${siblings.length > 1 ? `<h2>অন্যান্য সেশন</h2>
<div class="pill-row">${sessionPills}</div>` : ''}
<h2>বিষয়ভিত্তিক সূচি</h2>
<div class="toc">${toc}</div>
<div class="toolbar"><span>নিজে সলভ করতে চাও? উত্তর লুকিয়ে অপশনে ট্যাপ করো।</span><div class="tb"><button id="toggle-ans" type="button" aria-pressed="false">উত্তর লুকাও</button><a class="btn primary" href="${qbankPaperLink(inst, p.session)}">টাইমার সহ পরীক্ষা দাও</a></div></div>
${sections}
<div class="tips"><h2>এই প্রশ্নপত্র থেকে সর্বোচ্চ ফল পেতে</h2>
<ul class="topics">${PAPER_TIPS.map((t) => `<li>${esc(t)}</li>`).join('\n')}
<li>${esc(inst.short)}-এর <a href="${institutionPath(inst)}">অন্য সেশনগুলোও</a> একইভাবে সলভ করো — ৫ বছরের প্রশ্ন শেষ করলে ধরন পুরোপুরি চেনা হয়ে যাবে।</li></ul></div>
${pager}
<div class="banner"><h2>${esc(p.title)} — টাইমার সহ পুরো পরীক্ষা দাও</h2>
<p>অ্যাপে এই সেশনের প্রশ্নে মডেল টেস্ট দাও; রেজাল্ট, ভুলের তালিকা ও ব্যাখ্যা সাথে সাথে পাবে — ফ্রি।</p>
<a href="${qbankPaperLink(inst, p.session)}">পরীক্ষা শুরু করো</a></div>`;

  const crumbs = [['পরীক্ষাঙ্গন', `${SITE}/`], HUB_CRUMB, [inst.name, instUrl], [sessionToBangla(p.session), p.url]];
  const jsonLd = [
    breadcrumbLd(crumbs),
    {
      '@type': 'LearningResource',
      '@id': p.url,
      name: `${p.title} — প্রশ্ন ও সমাধান`,
      alternateName: `${inst.nameEn} ${sessionToSlug(p.session)} question with solution`,
      inLanguage: 'bn-BD',
      learningResourceType: 'Previous year question paper with solutions',
      educationalLevel: 'University admission',
      educationalUse: 'practice',
      teaches: p.families.map((f) => f.en),
      about: { '@type': 'Thing', name: `${inst.nameEn} ${sessionToSlug(p.session)}` },
      numberOfItems: p.questions.length,
      isPartOf: { '@type': 'CollectionPage', name: `${inst.name} — বিগত বছরের প্রশ্নপত্র`, url: instUrl },
      provider: { '@type': 'Organization', name: 'Porikkhangon', sameAs: SITE },
      isAccessibleForFree: true,
      hasPart: p.questions.slice(0, 100).map((q) => ({
        '@type': 'Question',
        name: plain(q.question).slice(0, 150),
        url: q.url,
        eduQuestionType: 'Multiple choice',
        acceptedAnswer: { '@type': 'Answer', text: plain(q.options[q.correctAnswerIndex] || '') },
      })),
    },
  ];

  const path = writePage(`admission-questions/${inst.id}/${sessionToSlug(p.session)}/index.html`, shell({
    title: `${p.title} প্রশ্ন ও সমাধান (${inst.shortEn} Question ${sessionToSlug(p.session)}) | পরীক্ষাঙ্গন`,
    description: `${p.title} সেশনের ${p.questions.length}টি প্রশ্নের সঠিক উত্তর ও ব্যাখ্যাসহ সমাধান — ${p.families.map((f) => f.bn).join(', ')}। ${inst.shortEn} ${sessionToSlug(p.session)} question solve — পরীক্ষাঙ্গনে ফ্রি প্র্যাকটিস করো।`,
    canonical: p.url,
    breadcrumbs: crumbs,
    jsonLd,
    body,
    mathjax: true,
    script: TOGGLE_SCRIPT,
  }));
  urls.push([path, '0.8']);
}

// --- Public question pages (Sattacademy-style) ----------------------------
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

  // Previous-year paper(s) this question appeared in → link up to the paper
  // page and sideways to the next questions of the same paper.
  const qPapers = q.papers || [];
  const mainPaper = qPapers[0];
  let paperHtml = '';
  if (mainPaper) {
    const pos = mainPaper.questions.indexOf(q);
    const around = mainPaper.questions.filter((x, i) => x !== q && Math.abs(i - pos) <= 3).slice(0, 5);
    paperHtml = `<h2>এই প্রশ্নটি যে পরীক্ষায় এসেছে</h2>
<div class="pill-row">${qPapers.map((pp) => `<a href="${pp.path}">${esc(pp.title)} — সম্পূর্ণ প্রশ্ন ও সমাধান</a>`).join('')}</div>
${around.length ? `<h2>${esc(mainPaper.title)}-এর আরও প্রশ্ন</h2>
<div class="qlist">${around.map((s) => `<a href="${rel(s.url)}">${esc(plain(s.question).slice(0, 110))}</a>`).join('\n')}</div>` : ''}`;
  }

  const levelLabel = q.level === 'ADMISSION' ? 'ভর্তি পরীক্ষা' : q.level === 'MAINBOOK' ? 'মূল বই' : q.level === 'ACADEMIC' ? 'HSC একাডেমিক' : '';
  const srcChip = mainPaper
    ? `<a class="chip src" href="${mainPaper.path}">সূত্র: ${esc(mainPaper.title)}</a>`
    : q.sourceLabel ? `<span class="chip src">সূত্র: ${esc(String(q.sourceLabel))}</span>` : '';
  const chips = srcChip + [q.subject, q.chapter, levelLabel, ...(q.tags || []).filter((t) => !qPapers.some((pp) => pp.tag === t)).slice(0, 2)]
    .filter((c) => c && c !== q.sourceLabel)
    .map((c) => `<span class="chip">${esc(String(c))}</span>`)
    .join('');

  const descSource = plain(q.question);
  const description = `${descSource.slice(0, 120)} — সঠিক উত্তর ও ব্যাখ্যা${mainPaper ? ` · ${mainPaper.title}` : ''}${q.subject ? ` · ${q.subject}` : ''}${q.chapter ? `, ${q.chapter}` : ''}। পরীক্ষাঙ্গনে ফ্রি MCQ প্র্যাকটিস করো।`;

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
${paperHtml}
${moreHtml}
<div class="banner"><h2>একই ধরনের আরও প্রশ্ন সলভ করো</h2>
<p>৫০,০০০+ প্রশ্ন, ব্যাখ্যাসহ উত্তর, টাইমার ও প্রোগ্রেস ট্র্যাকিং — ফ্রি।</p>
<a href="${mainPaper ? qbankPaperLink(mainPaper.inst, mainPaper.session) : `/qbank?level=ACADEMIC&subject=${encodeURIComponent(q.subject)}&chapter=${encodeURIComponent(q.chapter)}`}">${mainPaper ? `${esc(mainPaper.title)} — পুরো প্রশ্নপত্রে পরীক্ষা দাও` : 'প্রশ্নব্যাংকে প্র্যাকটিস করো'}</a></div>`;

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
      isPartOf: mainPaper
        ? { '@type': 'LearningResource', name: `${mainPaper.title} — প্রশ্ন ও সমাধান`, url: mainPaper.url }
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
    title: `${plain(q.question).slice(0, 70)} | ${mainPaper ? mainPaper.title : `${q.subject || 'MCQ'} সমাধান`} | পরীক্ষাঙ্গন`,
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
