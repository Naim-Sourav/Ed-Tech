/**
 * seo/render.mjs
 * ---------------------------------------------------------------------------
 * Pure, dependency-free HTML rendering for every SEO surface of
 * porikkhangon.app. Imported by BOTH:
 *
 *   scripts/generate-seo-pages.mjs  -> build-time static pages (GitHub Pages)
 *   seo/ssr-server.mjs              -> runtime SSR (100% of the question DB)
 *
 * …so a question looks byte-for-byte the same whether it was baked into
 * dist/ or streamed from the backend.
 */

import { SITE, BRAND, BRAND_LATIN, FONT_CSS_URL, SITE_LD, ORG_LD } from './theme.mjs';

export { SITE, BRAND, BRAND_LATIN };
export { THEME_CSS, FONT_CSS_URL } from './theme.mjs';

// ---------------------------------------------------------------------------
// Text helpers  (keep these byte-identical to the historic generator output —
// existing indexed URLs must not change)
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

/** ASCII slug (used for /hsc-syllabus/** paths). */
export function slugify(input) {
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

/** Bengali-preserving slug — same algorithm as the backend `generate-slugs` job. */
export function bnSlug(text) {
  return String(text)
    .normalize('NFC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/[$^_{}~\\]/g, ' ')
    .replace(/[\u0028\u0029\[\]<>«»"'`.,;:!?!…।,]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 70)
    .replace(/-$/g, '');
}

/**
 * Percent-encode only the characters that make a slug an INVALID URL, leaving
 * Bengali text as a readable IRI (Google accepts it and the existing sitemap
 * already ships raw Bengali).
 *
 * Real examples pulled out of the bank:
 *   "10%-Na-2CO-3-..."  -> "%" not followed by two hex digits = malformed escape
 *   "...-Ni-2+-0-1M-||Ag" -> "|" is not allowed unescaped in a path
 * Either one makes the <loc> in sitemap.xml invalid, and Google drops the URL.
 */
const URL_UNSAFE = /["<>|\\^`{}[\]\s\u0000-\u001f]|%(?![0-9a-fA-F]{2})/g;
export function encodeSlug(slug) {
  return String(slug).replace(URL_UNSAFE, (c) => encodeURIComponent(c));
}

/** Filesystem/URL-safe variant of a slug. */
export function safePath(slug) {
  const s = String(slug).replace(/[/?#\\]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return s || 'q';
}

export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** TeX operators → readable Unicode, so titles/descriptions don't read like source. */
const TEX_OPS = {
  times: '×', cdot: '·', div: '÷', pm: '±', mp: '∓',
  le: '≤', leq: '≤', ge: '≥', geq: '≥', ne: '≠', neq: '≠',
  approx: '≈', sim: '~', equiv: '≡', propto: '∝', infty: '∞',
  rightarrow: '→', Rightarrow: '⇒', leftarrow: '←', leftrightarrow: '↔',
  degree: '°', circ: '°', angstrom: 'Å',
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', theta: 'θ',
  lambda: 'λ', mu: 'μ', pi: 'π', rho: 'ρ', sigma: 'σ',
  phi: 'φ', omega: 'ω', Omega: 'Ω', Delta: 'Δ',
};

const TEX_TIGHT = new Set(['degree', 'circ', 'sim', 'angstrom']);

/** Strip TeX markup for titles/descriptions/plain-text JSON-LD. */
export function plain(text) {
  return String(text ?? '')
    .replace(/\\([a-zA-Z]+)/g, (m, name) => {
      if (TEX_OPS[name] === undefined) return ' ';
      // Degree/sim read better glued to what surrounds them: "25°C", not "25 ° C".
      return TEX_TIGHT.has(name) ? TEX_OPS[name] : ` ${TEX_OPS[name]} `;
    })
    .replace(/\\(?=[^a-zA-Z])/g, '') // stray "\ ", "\%", "\{" → keep the char, drop the backslash
    .replace(/\\(?=[^a-zA-Z])/g, '') // stray "\ ", "\%", "\{" → keep the char, drop the backslash
    .replace(/[${}^_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** ASCII digits -> Bengali digits, for user-facing counts. */
export function bnNum(n) {
  const map = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n).replace(/\d/g, (d) => map[Number(d)]);
}

/** Comma-grouped Bengali number, e.g. 50343 -> ৫০,৩৪৩ */
export function bnCount(n) {
  const s = Number(n || 0).toLocaleString('en-US');
  return bnNum(s);
}

/** Does this text need MathJax? (avoids loading ~1 MB of JS on plain questions) */
export function needsMath(text) {
  const s = String(text ?? '');
  return /\$[^$]+\$|\\(?:frac|sqrt|mathrm|text|times|cdot|alpha|beta|theta|le|ge|ne|approx|rightarrow|circ|degree|mathrm|vec|bar|hat|sum|int|log|sin|cos|tan|lim|infty|pi|Omega|Delta|lambda|mu|sigma|phi|psi|omega)\b/.test(s);
}

/**
 * Google truncates titles by *pixel* width (~580 px), not character count, and
 * Bengali glyphs are roughly twice as wide as Latin ones. So we budget in
 * "Bengali character units" and always cut on a word boundary — a chopped
 * title is the single most common reason these sites look unpolished in SERP.
 */
export function widthUnits(s) {
  let w = 0;
  for (const ch of String(s)) w += /[\u0980-\u09FF]/.test(ch) ? 1 : 0.55;
  return w;
}

export function cutTitle(text, units = 46) {
  const s = plain(text);
  if (widthUnits(s) <= units) return s;

  const isWide = (ch) => /[\u0980-\u09FF]/.test(ch);
  const chars = [...s];
  let w = 0;
  let i = 0;
  while (i < chars.length) {
    const cost = isWide(chars[i]) ? 1 : 0.55;
    if (w + cost > units) break;
    w += cost;
    i++;
  }
  const cut = chars.slice(0, i).join('');
  // Prefer ending on a word boundary so we never show half a word.
  const atSpace = cut.lastIndexOf(' ');
  const head = atSpace > 0 ? cut.slice(0, atSpace) : cut;
  return `${head.replace(/[\s,;:.\-\u2013\u2014\u0964]+$/, '')}…`;
}

// ---------------------------------------------------------------------------
// Brand suffix  (the "- চর্চা" / "- Sattacademy" mechanism)
// ---------------------------------------------------------------------------
/**
 * Google renders the brand after a page title either because the `<title>`
 * ends with it, or because it resolved a *site name* (WebSite JSON-LD /
 * og:site_name / homepage title) and appends it itself. We do it explicitly
 * so the SERP line is deterministic across every page type.
 */
export const BRAND_SUFFIX = ` | ${BRAND}`;

export function withBrand(title, suffix = BRAND_SUFFIX) {
  const t = String(title || '').replace(/\s+/g, ' ').trim();
  if (!t) return `${BRAND} — HSC ও ভর্তি প্রস্তুতির প্ল্যাটফর্ম`;
  if (t.includes(BRAND) || t.toLowerCase().includes(BRAND_LATIN.toLowerCase())) return t;
  return `${t}${suffix}`;
}

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------
export const LETTERS = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ'];

export const LEVEL_LABEL = {
  ADMISSION: 'ভর্তি পরীক্ষা',
  MAINBOOK: 'মূল বই',
  ACADEMIC: 'HSC একাডেমিক',
  PUBLIC: 'পাবলিক পরীক্ষা',
};

function isoDate(ms) {
  if (!ms) return '';
  const d = new Date(Number(ms));
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

const BN_MONTHS = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
export function bnDateLabel(ms) {
  if (!ms) return '';
  const d = new Date(Number(ms));
  if (Number.isNaN(d.getTime())) return '';
  return `${bnNum(d.getDate())} ${BN_MONTHS[d.getMonth()]} ${bnNum(d.getFullYear())}`;
}

export function breadcrumbLd(items) {
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

// ---------------------------------------------------------------------------
// Page shell
// ---------------------------------------------------------------------------
/**
 * @param {object} o
 * @param {string} o.title        already brand-suffixed
 * @param {string} o.description
 * @param {string} o.canonical
 * @param {Array<[string,string]>} o.breadcrumbs
 * @param {Array|object} o.jsonLd
 * @param {string} o.body         raw HTML for <main>
 * @param {boolean} o.math        inject MathJax
 * @param {string} [o.robots]
 * @param {string} [o.cssHref]    default "/seo.css"
 * @param {boolean} [o.narrow]    constrain <main> to the reading column
 * @param {string} [o.footerLinks]
 */
export function pageShell(o) {
  const {
    title,
    description,
    canonical,
    breadcrumbs = [],
    jsonLd,
    body,
    math = false,
    robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    cssHref = '/seo.css',
    narrow = false,
    footerLinks = '',
  } = o;

  const crumbHtml = breadcrumbs.length
    ? `<nav class="crumbs" aria-label="breadcrumb">${breadcrumbs
        .map(([label, href], i) =>
          i === breadcrumbs.length - 1
            ? `<span class="cur">${esc(label)}</span>`
            : `<a href="${href}">${esc(label)}</a><span class="sep">›</span>`
        )
        .join('')}</nav>`
    : '';

  const ld = Array.isArray(jsonLd) ? [SITE_LD, ORG_LD, ...jsonLd] : [SITE_LD, ORG_LD, jsonLd].filter(Boolean);

  return `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${canonical}">
<link rel="icon" type="image/svg+xml" href="${SITE}/Pshape.svg">
<link rel="apple-touch-icon" href="${SITE}/icon-192.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONT_CSS_URL}">
<link rel="stylesheet" href="${cssHref}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${BRAND}">
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
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': ld })}</script>
</head>
<body>
<header class="topbar"><div class="topbar-in">
  <a class="brand" href="${SITE}/"><img src="${SITE}/Pshape.svg" alt="${BRAND} লোগো" width="32" height="32">
    <span>${BRAND}<small>${BRAND_LATIN.toUpperCase()}</small></span>
  </a>
  <nav class="topbar-nav">
    <a class="hide-sm" href="${SITE}/questions/">প্রশ্নব্যাংক</a>
    <a class="hide-sm" href="${SITE}/hsc-syllabus/">সিলেবাস</a>
    <a class="btn" href="${SITE}/#/auth">ফ্রি শুরু করো</a>
  </nav>
</div></header>
<main${narrow ? ' class="reading"' : ''}>
${crumbHtml}
${body}
</main>
<footer><div class="footer-in">
  <div class="footer-links">
    <a href="${SITE}/">হোম</a>
    <a href="${SITE}/questions/">সব প্রশ্ন</a>
    <a href="${SITE}/hsc-syllabus/">HSC সিলেবাস গাইড</a>
    <a href="${SITE}/#/qbank">MCQ প্র্যাকটিস</a>
    <a href="${SITE}/#/privacy">প্রাইভেসি</a>
    <a href="${SITE}/#/terms">টার্মস</a>
    <a href="${SITE}/#/refund">রিফান্ড</a>
  </div>
  ${footerLinks}
  <div class="footer-bottom">
    <span>© ${new Date().getFullYear()} ${BRAND} (${BRAND_LATIN}) — HSC ও এডমিশন প্রস্তুতির AI প্ল্যাটফর্ম।</span>
    <span>বাংলাদেশের শিক্ষার্থীদের জন্য তৈরি 🇧🇩</span>
  </div>
</div></footer>
${math ? `<script>window.MathJax={tex:{inlineMath:[['$','$'],['\\\\(','\\\\)']],displayMath:[['$$','$$'],['\\\\[','\\\\]']],processEscapes:true},options:{enableMenu:false,skipHtmlTags:['script','noscript','style','textarea','pre','code']},chtml:{scale:1,minScale:0.5},startup:{typeset:true}};</script>
<script defer src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>` : ''}
</body>
</html>
`;
}

export function renderNotFound(slug = '') {
  const body = `
<div class="card notfound">
  <h1>প্রশ্নটি খুঁজে পাওয়া যায়নি</h1>
  <p class="lede">লিংকটি পুরনো হতে পারে অথবা প্রশ্নটি প্রশ্নব্যাংক থেকে সরানো হয়েছে।</p>
  ${slug ? `<p class="note">খোঁজা স্লাগ: <code>${esc(slug)}</code></p>` : ''}
  <div class="actions">
    <a class="btn" href="${SITE}/questions/">সব প্রশ্ন দেখো</a>
    <a class="btn btn-ghost" href="${SITE}/hsc-syllabus/">সিলেবাস গাইড</a>
  </div>
</div>`;
  return pageShell({
    title: withBrand('পেজটি পাওয়া যায়নি'),
    description: 'প্রশ্নটি খুঁজে পাওয়া যায়নি। পরীক্ষাঙ্গনের প্রশ্নব্যাংক থেকে HSC ও ভর্তি পরীক্ষার প্রশ্ন খুঁজে নাও।',
    canonical: `${SITE}/questions/`,
    jsonLd: [],
    body,
    robots: 'noindex, follow',
    narrow: true,
  });
}

// ---------------------------------------------------------------------------
// The question page
// ---------------------------------------------------------------------------
/**
 * @param {object} q
 * @param {object} ctx
 *   subjectHref, chapterHref, chapterName, subjectName, chapterTotal,
 *   related[{slug,url,question}], prev, next, totalQuestions
 */
export function renderQuestionPage(q, ctx = {}) {
  const {
    subjectHref = '',
    chapterHref = '',
    chapterTotal = 0,
    related = [],
    prev = null,
    next = null,
    totalQuestions = 0,
  } = ctx;

  const qText = String(q.question || '');
  const qPlain = plain(qText);
  const options = Array.isArray(q.options) ? q.options : [];
  const correctIdx = Math.max(0, Number(q.correctAnswerIndex) || 0);
  const correctText = options[correctIdx] || '';

  const createdAt = isoDate(q.createdAt);
  const updatedAt = isoDate(q.updatedAt || q.createdAt);

  // --- chips ---------------------------------------------------------------
  const chips = [];
  if (q.subject) {
    chips.push(
      subjectHref
        ? `<a class="chip chip-subject" href="${subjectHref}">${esc(q.subject)}</a>`
        : `<span class="chip chip-subject">${esc(q.subject)}</span>`
    );
  }
  if (q.chapter) {
    chips.push(
      chapterHref
        ? `<a class="chip" href="${chapterHref}">${esc(q.chapter)}</a>`
        : `<span class="chip">${esc(q.chapter)}</span>`
    );
  }
  const levelLabel = LEVEL_LABEL[q.level] || (q.level ? esc(q.level) : '');
  if (levelLabel) chips.push(`<span class="chip chip-level">${levelLabel}</span>`);
  for (const tag of (q.tags || []).slice(0, 4)) {
    chips.push(`<span class="chip chip-exam" title="পরীক্ষার উৎস">${esc(String(tag))}</span>`);
  }

  // --- options -------------------------------------------------------------
  const optsHtml = options
    .map((opt, i) => {
      const isCorrect = i === correctIdx;
      const img = q.optionsImages?.[i]
        ? `<img src="${esc(q.optionsImages[i])}" alt="বিকল্প ${LETTERS[i] || i + 1}-এর চিত্র" loading="lazy">`
        : '';
      return `<li class="opt${isCorrect ? ' correct' : ''}">
  <span class="opt-letter" aria-hidden="true">${LETTERS[i] || i + 1}</span>
  <span class="opt-body">${esc(opt)}${img}</span>
  ${isCorrect ? '<span class="opt-tag">সঠিক উত্তর</span>' : ''}
</li>`;
    })
    .join('\n');

  // --- explanation ---------------------------------------------------------
  const explHtml = q.explanation
    ? `<div class="expl">
  <h2>ব্যাখ্যা</h2>
  <div class="expl-body">${esc(q.explanation)}${
        q.explanationImage ? `<img src="${esc(q.explanationImage)}" alt="ব্যাখ্যার চিত্র" loading="lazy">` : ''
      }</div>
</div>`
    : `<div class="expl-missing">এই প্রশ্নটির বিস্তারিত ব্যাখ্যা এখনো যোগ করা হয়নি। <a href="${SITE}/#/bot">AI টিউটর</a>-কে জিজ্ঞেস করলে সাথে সাথে সমাধান পেয়ে যাবে।</div>`;

  // --- related -------------------------------------------------------------
  const relatedHtml = related.length
    ? `<h2>একই অধ্যায়ের আরও প্রশ্ন</h2>
<div class="qlist">
${related
  .map(
    (r, i) =>
      `<a href="${r.url}"><span class="n">${bnNum(i + 1)}</span><span>${esc(plain(r.question).slice(0, 120))}</span><span class="arrow">→</span></a>`
  )
  .join('\n')}
</div>
${
  chapterHref && chapterTotal > related.length
    ? `<a class="more-link" href="${chapterHref}">এই অধ্যায়ের সব ${bnCount(chapterTotal)}টি প্রশ্ন দেখো →</a>`
    : ''
}`
    : '';

  const pagerHtml =
    prev || next
      ? `<div class="pager">
  ${
    prev
      ? `<a href="${prev.url}"><small>← আগের প্রশ্ন</small><span>${esc(plain(prev.question).slice(0, 70))}</span></a>`
      : ''
  }
  ${
    next
      ? `<a href="${next.url}"><small>পরের প্রশ্ন →</small><span>${esc(plain(next.question).slice(0, 70))}</span></a>`
      : ''
  }
</div>`
      : '';

  const qbankHref = `${SITE}/#/qbank?level=${encodeURIComponent(q.level || 'ACADEMIC')}&subject=${encodeURIComponent(q.subject || '')}&chapter=${encodeURIComponent(q.chapter || '')}`;

  const metaBits = [];
  if (bnDateLabel(q.createdAt)) metaBits.push(`<span>যোগ করা হয়েছে: <b>${bnDateLabel(q.createdAt)}</b></span>`);
  if (updatedAt && updatedAt !== createdAt) metaBits.push(`<span>হালনাগাদ: <b>${bnDateLabel(q.updatedAt || q.createdAt)}</b></span>`);
  metaBits.push(`<span>বিকল্প: <b>${bnCount(options.length)}টি</b></span>`);
  metaBits.push(`<span>${q.explanation ? '<b>ব্যাখ্যাসহ</b>' : 'ব্যাখ্যা যোগ হচ্ছে'}</span>`);
  metaBits.push(`<a href="${SITE}/#/qbank">অ্যাপে এই প্রশ্ন সলভ করো</a>`);

  const body = `
<article class="card qcard">
  <div class="chips">${chips.join('')}</div>
  <h1>${esc(qText)}</h1>
  ${q.questionImage ? `<img class="qimg" src="${esc(q.questionImage)}" alt="প্রশ্নের চিত্র" loading="lazy">` : ''}

  <h2 class="sr-only">বিকল্পসমূহ</h2>
  <ol class="opts">
${optsHtml}
  </ol>

  <div class="answer">
    <span class="answer-mark" aria-hidden="true">✓</span>
    <span class="answer-body">
      <span class="answer-label">সঠিক উত্তর</span>
      <span class="answer-text">${LETTERS[correctIdx] || ''}. ${esc(correctText)}</span>
    </span>
  </div>

  ${explHtml}

  <div class="actions">
    <a class="btn" href="${qbankHref}">এই অধ্যায়ে ফ্রি প্র্যাকটিস করো</a>
    <a class="btn btn-ghost" href="${SITE}/#/qbank">সব প্রশ্নব্যাংক</a>
  </div>

  <div class="qmeta">${metaBits.join('')}</div>
</article>

${relatedHtml}
${pagerHtml}

<div class="banner">
  <h2>শুধু পড়ে নয় — সলভ করে প্রস্তুতি নাও</h2>
  <p>${totalQuestions ? `${bnCount(totalQuestions)}+` : '৫০,০০০+'} প্রশ্ন · ব্যাখ্যাসহ উত্তর · টাইমার ও প্রোগ্রেস ট্র্যাকিং · AI টিউটর — সব ফ্রি।</p>
  <a href="${SITE}/#/auth">ফ্রি একাউন্ট খোলো</a>
</div>`;

  const crumbs = [['হোম', `${SITE}/`]];
  crumbs.push(['প্রশ্নব্যাংক', `${SITE}/questions/`]);
  if (q.subject) crumbs.push([q.subject, subjectHref || `${SITE}/questions/`]);
  if (q.chapter) crumbs.push([q.chapter, chapterHref || `${SITE}/questions/`]);
  crumbs.push([qPlain.slice(0, 60), q.url || `${SITE}/q/${q.slug}/`]);

  const answerLd = { '@type': 'Answer', text: plain(correctText) };
  if (q.explanation) answerLd.comment = plain(q.explanation).slice(0, 400);

  const jsonLd = [
    breadcrumbLd(crumbs),
    {
      '@type': 'LearningResource',
      '@id': q.url,
      name: qPlain.slice(0, 160),
      url: q.url,
      inLanguage: 'bn-BD',
      learningResourceType: 'MCQ question with solution',
      teaches: q.subject || 'HSC ও ভর্তি প্রস্তুতি',
      educationalLevel: q.level === 'ADMISSION' ? 'University admission' : 'Higher Secondary',
      isAccessibleForFree: true,
      ...(createdAt ? { datePublished: createdAt } : {}),
      ...(updatedAt ? { dateModified: updatedAt } : {}),
      isPartOf: { '@type': 'Course', name: `${q.subject || 'HSC ও ভর্তি'} প্রস্তুতি`, url: subjectHref || `${SITE}/hsc-syllabus/` },
      provider: { '@id': `${SITE}/#organization` },
      hasPart: {
        '@type': 'Question',
        name: qPlain.slice(0, 160),
        inLanguage: 'bn-BD',
        eduQuestionType: 'Multiple choice',
        answerCount: options.length,
        acceptedAnswer: answerLd,
      },
    },
  ];

  // Title = the question, cut to the pixel budget, plus the brand suffix.
  // The subject stays out of the title on purpose: adding it pushed titles to
  // 115+ chars, which Google truncates mid-sentence. It lives in the
  // description, the on-page chips and the JSON-LD instead.
  const title = withBrand(cutTitle(qPlain, 58 - widthUnits(BRAND_SUFFIX)));
  const description = `${qPlain.slice(0, 130)} — সঠিক উত্তর ${LETTERS[correctIdx] || ''}. ${plain(correctText).slice(0, 60)}${
    q.explanation ? ` এবং বিস্তারিত ব্যাখ্যা` : ''
  }। ${q.subject ? `${q.subject}` : 'MCQ'}${q.chapter ? ` · ${q.chapter}` : ''} — পরীক্ষাঙ্গনে ফ্রি প্র্যাকটিস করো।`;

  const math = [qText, ...options, q.explanation || ''].some(needsMath);

  return {
    html: pageShell({ title, description, canonical: q.url, breadcrumbs: crumbs, jsonLd, body, math, narrow: true }),
    title,
    description,
    math,
  };
}

// ---------------------------------------------------------------------------
// Question list pages (the internal-link engine)
// ---------------------------------------------------------------------------
/** /questions/<subject-slug>/<chapter-slug>/ — every question of a chapter. */
export function renderChapterQuestionList({ subject, chapter, questions, page, pages, baseUrl, subjectHref, chapterHref, topicHtml = '' }) {
  const listHtml = questions
    .map(
      (q, i) =>
        `<a href="${q.url}"><span class="n">${bnNum((page - 1) * 100 + i + 1)}</span><span>${esc(plain(q.question).slice(0, 130))}</span><span class="arrow">→</span></a>`
    )
    .join('\n');

  const pager = [];
  if (page > 1) pager.push(`<a href="${baseUrl}${page - 1 === 1 ? '' : `${page - 1}/`}">← আগের পাতা</a>`);
  if (page < pages) pager.push(`<a href="${baseUrl}${page + 1}/">পরের পাতা →</a>`);

  const body = `
<h1>${esc(chapter)} — ${esc(subject)} প্রশ্ন ও সমাধান</h1>
<p class="lede">${esc(subject)} বিষয়ের "${esc(chapter)}" অধ্যায়ের সব MCQ প্রশ্ন, সঠিক উত্তর ও ব্যাখ্যা একসাথে। প্রশ্নে ক্লিক করলে সম্পূর্ণ সমাধান দেখতে পাবে।</p>
${topicHtml}
<h2>প্রশ্ন তালিকা (${bnCount(questions.length)}টি)</h2>
<div class="qlist">
${listHtml}
</div>
${pager.length ? `<div class="pager">${pager.join('')}</div>` : ''}
<div class="banner"><h2>টাইমার ধরে মডেল টেস্ট দাও</h2>
<p>ব্যাখ্যাসহ উত্তর, ইনস্ট্যান্ট রেজাল্ট ও ভুল প্রশ্নের রিভিশন — ফ্রি।</p>
<a href="${SITE}/#/qbank?level=ACADEMIC&subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(chapter)}">এই অধ্যায়ে প্র্যাকটিস শুরু করো</a></div>`;

  const crumbs = [
    ['হোম', `${SITE}/`],
    ['প্রশ্নব্যাংক', `${SITE}/questions/`],
    [subject, subjectHref],
    [chapter, chapterHref],
  ];

  return {
    html: pageShell({
      title: withBrand(`${chapter} — ${subject} MCQ প্রশ্ন ও সমাধান`),
      description: `${subject} — ${chapter} অধ্যায়ের ${bnCount(questions.length)}টি MCQ প্রশ্ন, সঠিক উত্তর ও ব্যাখ্যাসহ। পরীক্ষাঙ্গনে ফ্রি প্র্যাকটিস করো।`,
      canonical: chapterHref,
      breadcrumbs: crumbs,
      jsonLd: [
        breadcrumbLd(crumbs),
        {
          '@type': 'ItemList',
          name: `${chapter} — ${subject} প্রশ্ন`,
          numberOfItems: questions.length,
          itemListElement: questions.map((q, i) => ({ '@type': 'ListItem', position: i + 1, name: plain(q.question).slice(0, 140), url: q.url })),
        },
      ],
      body,
    }),
  };
}

/** /questions/ — subject index with real question counts. */
export function renderQuestionsIndex({ subjects, totalQuestions }) {
  const cards = subjects
    .map(
      (s) =>
        `<a class="gcard" href="${s.href}"><b>${esc(s.name)}</b><span>${bnCount(s.chapters)}টি অধ্যায় · প্রশ্ন ও সমাধান</span><span class="count">${bnCount(s.count)}টি প্রশ্ন</span></a>`
    )
    .join('\n');

  const body = `
<h1>প্রশ্নব্যাংক — প্রশ্ন, সঠিক উত্তর ও ব্যাখ্যা</h1>
<p class="lede">পরীক্ষাঙ্গনের প্রশ্নব্যাংকে HSC ও ভর্তি পরীক্ষার ${bnCount(totalQuestions)}+টি প্রশ্ন অধ্যায়ভিত্তিকভাবে সাজানো আছে। প্রতিটি প্রশ্নের সাথে সঠিক উত্তর ও ব্যাখ্যা দেওয়া — বিষয় বেছে নাও, অধ্যায় খোলো, প্রশ্নে ক্লিক করো।</p>
<h2>বিষয় বেছে নাও</h2>
<div class="grid">${cards}</div>
<div class="banner"><h2>সময় ধরে মডেল টেস্ট দাও</h2>
<p>রিয়েল এক্সাম ফিল, ইনস্ট্যান্ট রেজাল্ট ও ভুল প্রশ্নের রিভিশন — একদম ফ্রি।</p>
<a href="${SITE}/#/auth">ফ্রি শুরু করো</a></div>`;

  const crumbs = [
    ['হোম', `${SITE}/`],
    ['প্রশ্নব্যাংক', `${SITE}/questions/`],
  ];

  return {
    html: pageShell({
      title: withBrand('প্রশ্নব্যাংক — HSC ও ভর্তি পরীক্ষার প্রশ্ন, উত্তর ও ব্যাখ্যা'),
      description: `পরীক্ষাঙ্গনের প্রশ্নব্যাংকে ${bnCount(totalQuestions)}+ HSC ও ভর্তি প্রশ্ন, সঠিক উত্তর ও বিস্তারিত ব্যাখ্যাসহ। অধ্যায়ভিত্তিক ফ্রি MCQ প্র্যাকটিস করো।`,
      canonical: `${SITE}/questions/`,
      breadcrumbs: crumbs,
      jsonLd: [
        breadcrumbLd(crumbs),
        {
          '@type': 'CollectionPage',
          name: 'প্রশ্নব্যাংক',
          url: `${SITE}/questions/`,
          inLanguage: 'bn-BD',
        },
      ],
      body,
    }),
  };
}
