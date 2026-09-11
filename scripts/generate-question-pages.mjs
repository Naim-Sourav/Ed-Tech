#!/usr/bin/env node
/**
 * generate-question-pages.mjs
 * ---------------------------------------------------------------------------
 * Generates static, fully crawlable question pages for SEO — similar to how
 * SattAcademy, Chorcha, Daricomma do it.
 *
 * Why needed?
 * - The app is a HashRouter SPA, so Google only sees / . No question is indexed.
 * - Each question needs its own URL with QAPage structured data.
 *
 * What it does:
 * - Fetches questions from the API (paginated)
 * - Generates /questions/<slug>/index.html for each question
 * - Generates /questions/index.html hub page
 * - Generates /questions/subject/<subject>/ index pages
 * - Generates sitemap-questions.xml (and merges into main sitemap.xml)
 *
 * Usage:
 *   node scripts/generate-question-pages.mjs --out dist --limit 2000
 *
 * Env:
 *   API_BASE - override API base (default https://mongodb-hb6b.onrender.com/api)
 *   QUESTION_LIMIT - max questions to generate (default 2000, to keep build fast)
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SITE = "https://www.porikkhangon.app";
const API_BASE = process.env.API_BASE || "https://mongodb-hb6b.onrender.com/api";

const outArg = process.argv.indexOf("--out");
const OUT = outArg !== -1 ? process.argv[outArg + 1] : join(ROOT, "dist");

const limitArg = process.argv.indexOf("--limit");
const LIMIT = limitArg !== -1 ? parseInt(process.argv[limitArg + 1], 10) : parseInt(process.env.QUESTION_LIMIT || "2000", 10);

const TODAY = new Date().toISOString().slice(0, 10);

function esc(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function stripHtml(html) {
  if (!html) return "";
  return String(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
function truncate(text, max = 160) {
  const t = stripHtml(text);
  if (t.length <= max) return t;
  return t.slice(0, max - 3) + "...";
}

async function fetchJson(url) {
  try {
    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!res.ok) {
      console.warn(`[question-seo] fetch failed ${res.status} ${url}`);
      return null;
    }
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      console.warn(`[question-seo] invalid JSON from ${url}`);
      return null;
    }
  } catch (e) {
    console.warn(`[question-seo] fetch error ${url}: ${e.message}`);
    return null;
  }
}

async function fetchAllQuestions(limit) {
  const questions = [];
  let page = 1;
  const perPage = 100;
  console.log(`[question-seo] Fetching up to ${limit} questions from ${API_BASE}`);

  while (questions.length < limit) {
    const url = `${API_BASE}/admin/questions?page=${page}&limit=${perPage}`;
    const data = await fetchJson(url);
    if (!data?.questions?.length) {
      console.log(`[question-seo] No more questions at page ${page}`);
      break;
    }
    questions.push(...data.questions);
    console.log(`[question-seo] Fetched page ${page}, total ${questions.length}/${limit}`);
    if (data.questions.length < perPage) break;
    page++;
    // Be nice to API
    await new Promise(r => setTimeout(r, 200));
    if (questions.length >= limit) break;
  }
  return questions.slice(0, limit);
}

function buildQuestionJsonLd(q, canonical) {
  const questionText = stripHtml(q.question);
  const answerText = q.options?.[q.correctAnswerIndex] || "";
  const explanationText = stripHtml(q.explanation || "");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "পরীক্ষাঙ্গন", "item": `${SITE}/` },
          { "@type": "ListItem", "position": 2, "name": "প্রশ্নব্যাংক", "item": `${SITE}/questions/` },
          ...(q.subject ? [{ "@type": "ListItem", "position": 3, "name": q.subject, "item": `${SITE}/questions/subject/${encodeURIComponent(q.subject)}/` }] : []),
          { "@type": "ListItem", "position": q.subject ? 4 : 3, "name": questionText.slice(0, 60), "item": canonical },
        ],
      },
      {
        "@type": "QAPage",
        "mainEntity": {
          "@type": "Question",
          "name": questionText,
          "text": questionText,
          "answerCount": 1,
          "upvoteCount": 0,
          "author": { "@type": "Organization", "name": "Porikkhangon" },
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `${stripHtml(answerText)}${explanationText ? ` — ${explanationText}` : ""}`,
            "url": canonical,
            "author": { "@type": "Organization", "name": "Porikkhangon" },
          },
        },
      },
    ],
  };
}

function shell({ title, description, canonical, jsonLd, body, breadcrumbs }) {
  const crumbHtml = breadcrumbs
    ? breadcrumbs.map(([label, href], i) => {
        const isLast = i === breadcrumbs.length - 1;
        return isLast ? `<span class="cur">${esc(label)}</span>` : `<a href="${href}">${esc(label)}</a><span class="sep">›</span>`;
      }).join(" ")
    : "";

  return `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${canonical}">
<link rel="icon" type="image/svg+xml" href="${SITE}/Pshape.svg">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Porikkhangon">
<meta property="og:locale" content="bn_BD">
<meta property="og:url" content="${canonical}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${SITE}/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE}/og-image.jpg">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
<style>
:root{--ink:#111827;--muted:#6b7280;--line:#e5e7eb;--brand:#f97316;--bg:#fcfcfc}
*{box-sizing:border-box}
body{margin:0;font-family:'Hind Siliguri','Noto Sans Bengali',system-ui,sans-serif;color:var(--ink);background:var(--bg);line-height:1.75}
a{color:var(--brand);text-decoration:none}
a:hover{text-decoration:underline}
header{border-bottom:1px solid var(--line);background:#fff;position:sticky;top:0;z-index:5}
.header-in{max-width:960px;margin:0 auto;padding:12px 20px;display:flex;align-items:center;justify-content:space-between}
.brand{display:flex;align-items:center;gap:8px;font-weight:800;color:var(--ink);text-decoration:none}
.brand img{height:28px}
.cta{background:var(--brand);color:#fff;padding:8px 16px;border-radius:10px;font-weight:700;font-size:13px;text-decoration:none}
main{max-width:800px;margin:0 auto;padding:24px 20px 48px}
nav.crumb{font-size:13px;color:var(--muted);margin-bottom:16px;display:flex;flex-wrap:wrap;gap:6px}
nav.crumb a{color:var(--muted)}
nav.crumb .sep{color:#d1d5db}
h1{font-size:clamp(18px,4vw,24px);line-height:1.4;margin:0 0 12px}
.badge{display:inline-block;font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;background:#f3f4f6;border:1px solid var(--line);margin-right:6px}
.badge-orange{background:#fff7ed;color:#ea580c;border-color:#fed7aa}
.badge-blue{background:#eff6ff;color:#2563eb;border-color:#bfdbfe}
.card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:18px 20px;margin:18px 0}
.option{padding:10px 14px;border:1px solid var(--line);border-radius:12px;margin:8px 0;display:flex;gap:10px;align-items:flex-start;background:#f9fafb}
.option.correct{background:#ecfdf5;border-color:#6ee7b7;color:#065f46;font-weight:600}
.option .letter{width:26px;height:26px;border-radius:50%;background:#fff;border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0}
.expl{background:#fff7ed;border:1px solid #fed7aa;border-radius:14px;padding:14px 18px;margin-top:18px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;margin:16px 0}
.mini{border:1px solid var(--line);border-radius:12px;padding:12px 14px;background:#fff;text-decoration:none;color:var(--ink);font-size:14px}
.mini:hover{border-color:var(--brand)}
footer{border-top:1px solid var(--line);background:#fff;margin-top:32px}
.footer-in{max-width:960px;margin:0 auto;padding:20px;display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;color:var(--muted);font-size:13px}
</style>
</head>
<body>
<header><div class="header-in">
  <a class="brand" href="${SITE}/"><img src="${SITE}/Pshape.svg" alt="logo"> পরীক্ষাঙ্গন</a>
  <a class="cta" href="${SITE}/#/qbank">অ্যাপে প্র্যাকটিস করো</a>
</div></header>
<main>
  ${crumbHtml ? `<nav class="crumb">${crumbHtml}</nav>` : ""}
  ${body}
</main>
<footer><div class="footer-in">
  <span>© ${new Date().getFullYear()} পরীক্ষাঙ্গন — ${esc(title.slice(0,80))}</span>
  <span><a href="${SITE}/">হোম</a> · <a href="${SITE}/questions/">প্রশ্নব্যাংক</a> · <a href="${SITE}/hsc-syllabus/">সিলেবাস</a></span>
</div></footer>
</body>
</html>`;
}

function writePage(relPath, html) {
  const full = join(OUT, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, html, "utf8");
}

// Main
(async () => {
  mkdirSync(OUT, { recursive: true });

  let questions = [];
  try {
    questions = await fetchAllQuestions(LIMIT);
  } catch (e) {
    console.warn(`[question-seo] Failed to fetch questions: ${e.message}`);
  }

  if (!questions.length) {
    console.warn("[question-seo] No questions fetched — generating only hub placeholder");
  } else {
    console.log(`[question-seo] Generating ${questions.length} static question pages...`);
  }

  const urls = [];
  urls.push(["/", "1.0"]);
  urls.push(["/questions/", "0.9"]);
  urls.push(["/hsc-syllabus/", "0.8"]);

  // Group by subject for subject pages
  const bySubject = {};
  for (const q of questions) {
    const subj = q.subject || "General";
    if (!bySubject[subj]) bySubject[subj] = [];
    bySubject[subj].push(q);
  }

  // Generate individual question pages
  for (const q of questions) {
    const slug = q.slug || q._id || q.id;
    if (!slug) continue;
    const safeSlug = String(slug).replace(/[^a-zA-Z0-9-_]/g, "-").replace(/--+/g, "-").slice(0, 120);
    // Use original slug for URL if it's URL-safe, else safeSlug
    const urlSlug = q.slug || safeSlug;
    const canonical = `${SITE}/questions/${encodeURIComponent(urlSlug)}/`;
    const questionText = stripHtml(q.question);
    const answerText = q.options?.[q.correctAnswerIndex] || "";
    const explanationText = stripHtml(q.explanation || "");

    const title = `${questionText.slice(0, 70)} | ${q.subject || ""} ${q.chapter || ""} | পরীক্ষাঙ্গন`;
    const description = truncate(
      q.explanation
        ? `${questionText} — উত্তর: ${stripHtml(answerText)}. ${explanationText}`
        : `${questionText} — ${q.subject || ""} ${q.chapter || ""} প্রশ্নের উত্তর ও ব্যাখ্যা।`,
      155
    );

    const jsonLd = buildQuestionJsonLd(q, canonical);

    const optionsHtml = (q.options || []).map((opt, i) => {
      const isCorrect = i === q.correctAnswerIndex;
      return `<div class="option ${isCorrect ? "correct" : ""}"><span class="letter">${["ক","খ","গ","ঘ"][i] || String.fromCharCode(65+i)}</span><span>${esc(stripHtml(opt))}${isCorrect ? " ✓" : ""}</span></div>`;
    }).join("\n");

    const body = `
<h1>${esc(questionText)}</h1>
<div style="margin:8px 0 14px">
  ${q.subject ? `<span class="badge badge-blue">${esc(q.subject)}</span>` : ""}
  ${q.chapter ? `<span class="badge">${esc(q.chapter)}</span>` : ""}
  ${q.examRef ? `<span class="badge badge-orange">${esc(q.examRef)}</span>` : ""}
  ${q.topic ? `<span class="badge">${esc(q.topic)}</span>` : ""}
</div>

${q.contextText ? `<div class="card" style="background:#f0f9ff;border-color:#bae6fd"><div style="font-size:11px;font-weight:800;letter-spacing:1px;color:#0284c7;margin-bottom:6px">উদ্দীপক</div><div>${esc(stripHtml(q.contextText))}</div></div>` : ""}

<div class="card">
  <div style="font-size:14px;font-weight:700;margin-bottom:10px">প্রশ্ন:</div>
  <div style="font-size:16px;font-weight:600">${esc(questionText)}</div>
  ${q.questionImage ? `<img src="${esc(q.questionImage)}" alt="question image" style="max-width:100%;margin-top:12px;border-radius:10px;border:1px solid #e5e7eb">` : ""}
</div>

<div class="card">
  <div style="font-size:14px;font-weight:700;margin-bottom:10px">অপশনসমূহ:</div>
  ${optionsHtml}
</div>

<div class="expl">
  <div style="font-size:12px;font-weight:800;letter-spacing:1px;color:#ea580c;margin-bottom:8px">সঠিক উত্তর ও ব্যাখ্যা</div>
  <div style="font-weight:700;margin-bottom:6px">উত্তর: ${["ক","খ","গ","ঘ"][q.correctAnswerIndex] || q.correctAnswerIndex} — ${esc(stripHtml(answerText))}</div>
  ${explanationText ? `<div style="font-size:14px;color:#374151">${esc(explanationText)}</div>` : `<div style="font-size:13px;color:#6b7280">ব্যাখ্যা যোগ করা হয়নি। অ্যাপে বিস্তারিত দেখো।</div>`}
</div>

<div class="card" style="background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;border:none;text-align:center">
  <div style="font-weight:800;font-size:16px;margin-bottom:6px">এই অধ্যায়ের সব প্রশ্ন প্র্যাকটিস করবে?</div>
  <div style="opacity:.9;font-size:13px;margin-bottom:14px">২০,০০০+ প্রশ্ন, ব্যাখ্যা, মডেল টেস্ট — ফ্রি</div>
  <a href="${SITE}/#/qbank?subject=${encodeURIComponent(q.subject||'')}&chapter=${encodeURIComponent(q.chapter||'')}" style="display:inline-block;background:#fff;color:#ea580c;font-weight:800;padding:10px 22px;border-radius:10px;text-decoration:none">প্রশ্নব্যাংক খুলো</a>
</div>

<div style="margin-top:20px">
  <a href="${SITE}/questions/" style="font-size:13px">← সব প্রশ্নে ফিরে যান</a>
  ${q.subject ? ` · <a href="${SITE}/questions/subject/${encodeURIComponent(q.subject)}/" style="font-size:13px">${esc(q.subject)} এর সব প্রশ্ন</a>` : ""}
</div>
`;

    const breadcrumbs = [
      ["পরীক্ষাঙ্গন", `${SITE}/`],
      ["প্রশ্নব্যাংক", `${SITE}/questions/`],
      ...(q.subject ? [[q.subject, `${SITE}/questions/subject/${encodeURIComponent(q.subject)}/`]] : []),
      [questionText.slice(0, 40) + "...", canonical],
    ];

    writePage(`questions/${urlSlug}/index.html`, shell({ title, description, canonical, jsonLd, body, breadcrumbs }));
    urls.push([`questions/${urlSlug}/`, "0.7"]);
  }

  // Subject hub pages
  for (const [subject, qs] of Object.entries(bySubject)) {
    const canonical = `${SITE}/questions/subject/${encodeURIComponent(subject)}/`;
    const title = `${subject} প্রশ্নব্যাংক — ${qs.length}টি MCQ | পরীক্ষাঙ্গন`;
    const description = `${subject} বিষয়ের ${qs.length}টি MCQ প্রশ্ন — উত্তর ও ব্যাখ্যা সহ। HSC, Medical, BUET, DU, GST ভর্তি প্রস্তুতির জন্য।`;

    const listHtml = qs.slice(0, 50).map(q => {
      const slug = q.slug || q._id || q.id;
      return `<a class="mini" href="${SITE}/questions/${encodeURIComponent(slug)}/"><b>${esc(stripHtml(q.question).slice(0, 80))}</b><br><span style="color:#6b7280;font-size:12px">${esc(q.chapter||'')}${q.examRef ? ` · ${esc(q.examRef)}` : ''}</span></a>`;
    }).join("\n");

    const body = `
<h1>${esc(subject)} — প্রশ্নব্যাংক</h1>
<p style="color:#6b7280">${qs.length}টি প্রশ্ন • ব্যাখ্যা সহ • ফ্রি প্র্যাকটিস</p>
<div class="grid">${listHtml}</div>
${qs.length > 50 ? `<p style="font-size:13px;color:#6b7280;margin-top:12px">আরও ${qs.length - 50}টি প্রশ্ন অ্যাপে আছে।</p>` : ""}
<div class="card" style="text-align:center"><a href="${SITE}/#/qbank?subject=${encodeURIComponent(subject)}" style="font-weight:700">অ্যাপে ${esc(subject)} প্র্যাকটিস করো →</a></div>
`;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": title,
      "description": description,
      "url": canonical,
    };

    writePage(`questions/subject/${encodeURIComponent(subject)}/index.html`, shell({
      title,
      description,
      canonical,
      jsonLd,
      body,
      breadcrumbs: [
        ["পরীক্ষাঙ্গন", `${SITE}/`],
        ["প্রশ্নব্যাংক", `${SITE}/questions/`],
        [subject, canonical],
      ],
    }));
    urls.push([`questions/subject/${encodeURIComponent(subject)}/`, "0.6"]);
  }

  // Main questions hub page
  {
    const canonical = `${SITE}/questions/`;
    const title = "প্রশ্নব্যাংক — HSC, Medical, BUET, DU, GST ২০,০০০+ MCQ | পরীক্ষাঙ্গন";
    const description = "HSC ও ভর্তি পরীক্ষার ২০,০০০+ MCQ — উত্তর ও ব্যাখ্যা সহ। Physics, Chemistry, Math, Biology, Bangla, English, ICT, GK।";

    const subjectCards = Object.entries(bySubject).map(([subj, qs]) => {
      return `<a class="mini" href="${SITE}/questions/subject/${encodeURIComponent(subj)}/"><b>${esc(subj)}</b><br><span style="color:#6b7280;font-size:12px">${qs.length}টি প্রশ্ন</span></a>`;
    }).join("\n");

    const recentList = questions.slice(0, 20).map(q => {
      const slug = q.slug || q._id || q.id;
      return `<a class="mini" href="${SITE}/questions/${encodeURIComponent(slug)}/"><b>${esc(stripHtml(q.question).slice(0, 70))}</b><br><span style="color:#6b7280;font-size:11px">${esc(q.subject||'')} ${q.chapter ? `· ${esc(q.chapter)}` : ''}</span></a>`;
    }).join("\n");

    const body = `
<h1>প্রশ্নব্যাংক — ২০,০০০+ MCQ প্রশ্ন, উত্তর ও ব্যাখ্যা সহ</h1>
<p style="color:#6b7280">HSC, Medical, BUET, DU, GST ভর্তি পরীক্ষার প্রশ্ন এক জায়গায়। প্রতিটি প্রশ্নের আলাদা লিংক, QAPage structured data, Google এ সার্চ করলে পাওয়া যায় — Satt Academy / Chorcha এর মতো।</p>

<h2 style="margin-top:28px">বিষয় অনুযায়ী প্রশ্ন</h2>
<div class="grid">${subjectCards || '<div style="color:#6b7280">প্রশ্ন লোড হচ্ছে... অ্যাপে সব বিষয় দেখো</div>'}</div>

<h2 style="margin-top:28px">সাম্প্রতিক প্রশ্ন</h2>
<div class="grid">${recentList || '<div style="color:#6b7280">API থেকে প্রশ্ন লোড করা যায়নি। বিল্ডের সময় API চালু থাকলে এখানে প্রশ্ন দেখাবে।</div>'}</div>

<div class="card" style="background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;border:none;text-align:center;margin-top:28px">
  <div style="font-weight:800;font-size:18px">ফ্রিতে প্র্যাকটিস শুরু করো</div>
  <p style="opacity:.9;font-size:14px;margin:6px 0 14px">অ্যাপে লগইন করে সব প্রশ্ন, মডেল টেস্ট, AI টিউটর</p>
  <a href="${SITE}/#/auth" style="display:inline-block;background:#fff;color:#ea580c;font-weight:800;padding:12px 24px;border-radius:12px;text-decoration:none">ফ্রি একাউন্ট খোলো</a>
</div>

<div style="margin-top:24px;font-size:13px;color:#6b7280">
  <p><b>কিভাবে কাজ করে?</b> প্রতিটি প্রশ্নের URL: <code>${SITE}/questions/&lt;slug&gt;/</code> — Google এই পেজগুলো crawl করে। প্রতিটি পেজে QAPage + FAQPage JSON-LD আছে, তাই প্রশ্ন সার্চ করলে rich result দেখায়। Satt Academy, Chorcha, Daricomma একই পদ্ধতি ব্যবহার করে।</p>
</div>
`;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": title,
      "description": description,
      "url": canonical,
    };

    writePage("questions/index.html", shell({
      title,
      description,
      canonical,
      jsonLd,
      body,
      breadcrumbs: [
        ["পরীক্ষাঙ্গন", `${SITE}/`],
        ["প্রশ্নব্যাংক", canonical],
      ],
    }));
  }

  // Sitemap for questions
  const sitemapQuestions = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([p, pr]) => `  <url>
    <loc>${p === "/" ? `${SITE}/` : `${SITE}/${p.startsWith("/") ? p.slice(1) : p}`}${p.endsWith("/") ? "" : "/"}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${pr}</priority>
  </url>`).join("\n")}
</urlset>
`;

  writeFileSync(join(OUT, "sitemap-questions.xml"), sitemapQuestions, "utf8");
  console.log(`[question-seo] Wrote sitemap-questions.xml with ${urls.length} URLs`);

  // Merge with existing sitemap.xml if exists
  const mainSitemapPath = join(OUT, "sitemap.xml");
  try {
    if (existsSync(mainSitemapPath)) {
      const existing = readFileSync(mainSitemapPath, "utf8");
      // Extract URLs from existing
      const existingUrls = [...existing.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
      const allUrls = new Set(existingUrls);
      urls.forEach(([p]) => {
        const loc = p === "/" ? `${SITE}/` : `${SITE}/${p.startsWith("/") ? p.slice(1) : p}`;
        const locSlash = loc.endsWith("/") ? loc : loc + "/";
        allUrls.add(locSlash);
      });

      const merged = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...allUrls].sort().map(loc => `  <url>
    <loc>${loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${loc === `${SITE}/` ? "1.0" : loc.includes("/questions/") ? (loc === `${SITE}/questions/` ? "0.9" : "0.7") : "0.7"}</priority>
  </url>`).join("\n")}
</urlset>
`;
      writeFileSync(mainSitemapPath, merged, "utf8");
      console.log(`[question-seo] Merged into sitemap.xml, total ${allUrls.size} URLs`);
    } else {
      // No existing, write our sitemap as main
      writeFileSync(mainSitemapPath, sitemapQuestions, "utf8");
      console.log(`[question-seo] Wrote sitemap.xml (no existing found)`);
    }
  } catch (e) {
    console.warn(`[question-seo] Failed to merge sitemap: ${e.message}`);
  }

  console.log(`[question-seo] Done. Generated ${questions.length} question pages into ${OUT}/questions/`);
})();
