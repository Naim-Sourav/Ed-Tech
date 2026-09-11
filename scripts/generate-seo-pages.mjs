#!/usr/bin/env node
/**
 * generate-seo-pages.mjs
 * ---------------------------------------------------------------------------
 * Generates static, fully crawlable SEO pages (no JavaScript required) for the
 * HSC syllabus content hub, plus a fresh sitemap.xml, into the build output
 * directory (default: dist/).
 *
 * Why: the app itself is a client-rendered SPA behind a hash router, so search
 * engines effectively see ONE indexable URL. These static pages give Google /
 * Bing real, content-rich URLs (subject + chapter level) that can rank for
 * non-brand queries such as "HSC physics 1st paper syllabus" or
 * "রসায়ন ১ম পত্র ২য় অধ্যায় টপিক".
 *
 * Usage:
 *   node scripts/generate-seo-pages.mjs            # writes into dist/
 *   node scripts/generate-seo-pages.mjs --out dist # same, explicit
 *
 * The content source of truth is services/syllabusData.ts (SYLLABUS_DB), so the
 * pages can never drift away from what the app actually offers.
 */

import { buildSync } from 'esbuild';
import { mkdirSync, writeFileSync, rmSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SITE = 'https://www.porikkhangon.app';
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const TODAY = new Date().toISOString().slice(0, 10);

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

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function topicsOf(chapterValue) {
  // SyllabusItem = string | { title, subTopics[] }
  return (chapterValue || []).map((item) =>
    typeof item === 'string' ? { title: item, subTopics: [] } : { title: item.title, subTopics: item.subTopics || [] }
  );
}

function countTopics(topics) {
  return topics.reduce((n, t) => n + 1 + t.subTopics.length, 0);
}

// Subject family -> study guidance (evergreen, hand written)
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
function shell({ title, description, canonical, breadcrumbs, jsonLd, body }) {
  const crumbHtml = breadcrumbs
    .map(([label, href], i) => {
      const isLast = i === breadcrumbs.length - 1;
      return isLast
        ? `<span class="cur">${esc(label)}</span>`
        : `<a href="${href}">${esc(label)}</a><span class="sep">›</span>`;
    })
    .join(' ');

  return `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
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
<style>
:root{--ink:#111827;--muted:#6b7280;--line:#e5e7eb;--brand:#f97316;--bg:#ffffff}
*{box-sizing:border-box}
body{margin:0;font-family:'Hind Siliguri','Noto Sans Bengali',system-ui,sans-serif;color:var(--ink);background:var(--bg);line-height:1.8}
a{color:var(--brand)}
header{border-bottom:1px solid var(--line);background:#fff;position:sticky;top:0;z-index:5}
.header-in{max-width:960px;margin:0 auto;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--ink);font-weight:700}
.brand img{height:34px;width:auto}
.cta{background:var(--brand);color:#fff;text-decoration:none;font-weight:700;padding:9px 18px;border-radius:10px;font-size:14px;white-space:nowrap}
main{max-width:960px;margin:0 auto;padding:28px 20px 56px}
nav.crumb{font-size:13px;color:var(--muted);margin-bottom:18px;display:flex;flex-wrap:wrap;gap:6px}
nav.crumb a{color:var(--muted);text-decoration:none}
nav.crumb a:hover{color:var(--brand)}
nav.crumb .sep{color:#d1d5db}
h1{font-size:clamp(24px,4.5vw,38px);line-height:1.35;margin:0 0 10px}
h2{font-size:clamp(19px,3vw,26px);margin:34px 0 12px}
p.lede{color:var(--muted);font-size:16px;margin:0 0 8px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;margin:22px 0}
.card{border:1px solid var(--line);border-radius:14px;padding:16px 18px;text-decoration:none;color:var(--ink);background:#fff;transition:border-color .15s}
.card:hover{border-color:var(--brand)}
.card b{display:block;font-size:16px;margin-bottom:4px}
.card span{color:var(--muted);font-size:13px}
ul.topics{margin:8px 0 0;padding-left:20px}
ul.topics li{margin:5px 0}
ul.topics ul{margin:4px 0;padding-left:18px;color:var(--muted);font-size:14.5px}
.tips{background:#fff7ed;border:1px solid #fed7aa;border-radius:14px;padding:16px 20px;margin:22px 0}
.tips h2{margin-top:0}
.banner{margin:34px 0 8px;border-radius:18px;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;padding:26px 24px;text-align:center}
.banner h2{margin:0 0 6px;color:#fff}
.banner p{margin:0 0 16px;opacity:.95}
.banner a{display:inline-block;background:#fff;color:#ea580c;font-weight:800;text-decoration:none;padding:12px 26px;border-radius:12px}
.pager{display:flex;justify-content:space-between;gap:12px;margin-top:30px;flex-wrap:wrap}
.pager a{border:1px solid var(--line);border-radius:12px;padding:10px 16px;text-decoration:none;font-size:14px}
footer{border-top:1px solid var(--line);background:#fafafa}
.footer-in{max-width:960px;margin:0 auto;padding:26px 20px;display:flex;flex-wrap:wrap;gap:8px 22px;align-items:center;justify-content:space-between;color:var(--muted);font-size:14px}
footer a{color:var(--muted);text-decoration:none}
footer a:hover{color:var(--brand)}
</style>
</head>
<body>
<header><div class="header-in">
  <a class="brand" href="${SITE}/"><img src="${SITE}/Pshape.svg" alt="পরীক্ষাঙ্গন লোগো"> পরীক্ষাঙ্গন</a>
  <a class="cta" href="${SITE}/#/auth">ফ্রি শুরু করো</a>
</div></header>
<main>
  <nav class="crumb" aria-label="breadcrumb">${crumbHtml}</nav>
  ${body}
</main>
<footer><div class="footer-in">
  <span>© ${new Date().getFullYear()} পরীক্ষাঙ্গন (Porikkhangon) — HSC ও এডমিশন প্রস্তুতির AI প্ল্যাটফর্ম</span>
  <span>
    <a href="${SITE}/">হোম</a> ·
    <a href="${SITE}/hsc-syllabus/">সিলেবাস গাইড</a> ·
    <a href="${SITE}/#/privacy">প্রাইভেসি</a> ·
    <a href="${SITE}/#/terms">টার্মস</a>
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
// 4. Generate
// ---------------------------------------------------------------------------
const urls = []; // [path, priority]
const subjects = Object.entries(SYLLABUS_DB);
const HUB = '/hsc-syllabus/';

// --- Hub page -------------------------------------------------------------
{
  const totalChapters = subjects.reduce((n, [, ch]) => n + Object.keys(ch).length, 0);
  const cards = subjects
    .map(([subject, chapters]) => {
      const slug = slugify(subject);
      const n = Object.keys(chapters).length;
      return `<a class="card" href="${SITE}${HUB}${slug}/"><b>${esc(subject)}</b><span>${n}টি অধ্যায় · সম্পূর্ণ সিলেবাস ও টপিক লিস্ট</span></a>`;
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
<p>২০,০০০+ প্রশ্ন, মডেল টেস্ট, AI টিউটর ও কুইজ ব্যাটল — সব ফ্রিতে।</p>
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
        return `<a class="card" href="${SITE}${HUB}${subjectSlug}/${slugify(chapter)}/"><b>${i + 1}. ${esc(chapter)}</b><span>${n}টি টপিক · সিলেবাস ও প্রস্তুতি গাইড</span></a>`;
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
        provider: { '@type': 'Organization', name: 'Porikkhangon', sameAs: SITE },
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'online',
          courseWorkload: 'PT60H',
        },
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

    const topicHtml = topics
      .map((t, i) => {
        const sub = t.subTopics.length
          ? `<ul>${t.subTopics.map((st) => `<li>${esc(st)}</li>`).join('')}</ul>`
          : '';
        return `<li><b>${i + 1}. ${esc(t.title)}</b>${sub}</li>`;
      })
      .join('\n');

    const prev = chapterEntries[idx - 1];
    const next = chapterEntries[idx + 1];
    const pager = `<div class="pager">
      ${prev ? `<a href="${SITE}${HUB}${subjectSlug}/${slugify(prev[0])}/">← ${esc(prev[0])}</a>` : '<span></span>'}
      ${next ? `<a href="${SITE}${HUB}${subjectSlug}/${slugify(next[0])}/">${esc(next[0])} →</a>` : `<a href="${SITE}${HUB}${subjectSlug}/">সব অধ্যায়</a>`}
    </div>`;

    const body = `
<h1>${esc(subject)} — ${esc(chapter)}: সম্পূর্ণ সিলেবাস ও টপিক লিস্ট</h1>
<p class="lede">${esc(subject)} বিষয়ের ${idx + 1} নং অধ্যায় "${esc(chapter)}"-এর সম্পূর্ণ টপিক ও সাব-টপিক তালিকা (${topicCount}টি টপিক)। সিলেবাস ধরে পড়ো, তারপর পরীক্ষাঙ্গনের প্রশ্নব্যাংকে এই অধ্যায়ের MCQ প্র্যাকটিস করে নিজেকে যাচাই করো।</p>
<h2>অধ্যায়ের টপিকসমূহ</h2>
<ul class="topics">${topicHtml}</ul>
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

// --- Root + sitemap --------------------------------------------------------
urls.push(['/', '1.0']);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .sort((a, b) => Number(b[1]) - Number(a[1]) || a[0].localeCompare(b[0]))
  .map(
    ([p, pr]) => `  <url>
    <loc>${p === '/' ? `${SITE}/` : `${SITE}/${p}/`}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${pr}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'sitemap.xml'), sitemap, 'utf8');

console.log(`[seo] Generated ${urls.length - 1} static pages + sitemap.xml into ${OUT}`);
