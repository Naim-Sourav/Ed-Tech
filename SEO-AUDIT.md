# পরীক্ষাঙ্গন (porikkhangon.app) — SEO অডিট ও রোডম্যাপ

তারিখ: ২০২৬-০৯-১১ · ব্রাঞ্চ: `arena/01a092a4-ed-tech`

> **পরবর্তী ধাপ:** প্রশ্ন পেজ (ডাটাবেজের সব ৫০,৩৪৩টি প্রশ্ন ইনডেক্স, নতুন ডিজাইন,
> SERP-তে ব্র্যান্ড সফিক্স) নিয়ে যা করা হয়েছে তা আলাদা ডকুমেন্টে: **`SEO-QUESTIONS.md`**

---

## ১. সমস্যা: শুধু "Porikkhangon" সার্চ করলেই সাইট আসে, অন্য কিছুতে আসে না — কেন?

সাইট লাইভ দেখে ও কোড বিশ্লেষণ করে ৫টি মূল কারণ পাওয়া গেছে:

| # | কারণ | বিস্তারিত |
|---|-------|-----------|
| ১ | **ইনডেক্সযোগ্য পেজ মাত্র ১টি** | পুরো অ্যাপ একটি client-rendered SPA এবং `HashRouter` ব্যবহার করে (`/#/dashboard`, `/#/qbank`…)। Google hash-এর পরের অংশ বাদ দেয়, তাই অ্যাপের ভেতরের কোনো পেজ আলাদা URL হিসেবে ইনডেক্স হওয়ার সুযোগই পায় না। লগইনের পরের সব পেজ তো বটেই, ল্যান্ডিং পেজ ছাড়া Google-এর হাতে কিছুই নেই। |
| ২ | **JS ছাড়া পেজে কোনো কনটেন্ট নেই** | `index.html`-এ শুধু লোডিং স্পিনার আছে। যেসব ক্রলার/টুল JS রেন্ডার করে না (Bing আংশিক, social preview, অনেক AI সার্চ), তারা খালি পেজ দেখে। |
| ৩ | **sitemap ও robots ভুল ডোমেইনে পয়েন্ট করছিল** | `public/sitemap.xml`-এ একমাত্র URL ছিল পুরনো `https://naim-sourav.github.io/Ed-Tech/` এবং `robots.txt`-তে লেখা ছিল `Sitemap: https://naim-sourav.github.io/Ed-Tech/#/sitemap.xml` — hash-সহ sitemap URL অকার্যকর, আর ক্রস-ডোমেইন sitemap URL Google গ্রহণ করে না। ফলে Search Console-এ sitemap আপলোড করলেও কোনো কাজ হয়নি। |
| ৪ | **নন-ব্র্যান্ড কীওয়ার্ডের কোনো কনটেন্ট পেজ নেই** | "HSC physics syllabus", "medical admission question bank", "ভর্তি পরীক্ষার প্রস্তুতি" — এসব সার্চে র‍্যাংক করার মতো কোনো আর্টিকেল/গাইড/সিলেবাস পেজ সাইটে নেই। প্রতিযোগীরা (porikha.com, porikkhaai.live, shikho, Play Store অ্যাপ পেজ) হাজারো স্ট্যাটিক কনটেন্ট URL + structured data দিয়ে এই সার্চগুলো দখল করে আছে। |
| ৫ | **ছোটখাটো সিগন্যাল সমস্যা** | og:image ছিল SVG (অনেক প্ল্যাটফর্মে রেন্ডার হয় না), H1-এ ব্র্যান্ড/কীওয়ার্ড ছিল না, stats কাউন্টার ক্রলারে "0+" দেখাত, `user-scalable=no` (মোবাইল ইউজাবিলিটি), SearchAction structured data-তে এমন URL (`/search?q=`) দেওয়া ছিল যেই রুট অ্যাপে নেই। |

> সহজ ভাষায়: **ব্র্যান্ড নামে ইনডেক্স হয়েছ কারণ নামটা ইউনিক; কিন্তু Google-কে র‍্যাংক করার মতো দ্বিতীয় কোনো পেজ বা কনটেন্ট কখনো দেওয়াই হয়নি।**

---

## ২. এই ব্রাঞ্চে যা যা ঠিক করা হয়েছে (কোড-লেভেল ফিক্স)

### ক) ক্রলিং ইনফ্রাস্ট্রাকচার
- `public/robots.txt` — সঠিক `Sitemap: https://www.porikkhangon.app/sitemap.xml`, `/admin` ডিসঅ্যালাউ।
- `public/sitemap.xml` — সঠিক ক্যানোনিক্যাল ডোমেইনের fallback sitemap।
- **নতুন:** `scripts/generate-seo-pages.mjs` — বিল্ডের সময় **১১০টি স্ট্যাটিক, JS-বিহীন, সম্পূর্ণ ক্রলযোগ্য পেজ** তৈরি করে (`dist/hsc-syllabus/...`) + পূর্ণ `sitemap.xml` (১১১ URL)। কনটেন্ট সোর্স `services/syllabusData.ts` (SYLLABUS_DB), তাই পেজগুলো অ্যাপের আসল সিলেবাসের সাথে কখনো অমিল হবে না।
  - ১টি হাব: `/hsc-syllabus/`
  - ১৪টি বিষয় পেজ: `/hsc-syllabus/physics-1st-paper/` ইত্যাদি
  - ৯৫টি অধ্যায় পেজ: প্রতিটিতে সম্পূর্ণ টপিক + সাব-টপিক লিস্ট, প্রস্তুতি টিপস, prev/next লিংক, প্রশ্নব্যাংকে ডিপ-লিংক CTA
  - প্রতি পেজে: canonical, Bengali meta title/description, OpenGraph, Twitter card, BreadcrumbList + Course/Chapter JSON-LD
- `package.json` — `npm run build` এখন বিল্ডের শেষে পেজগুলো জেনারেট করে (GitHub Actions deploy-তেও স্বয়ংক্রিয়ভাবে চলবে); আলাদা চালানোর জন্য `npm run seo:pages`।
- `public/404.html` — GitHub Pages-এ SPA ডিপ-লিংক ফিক্স: `/privacy`-এর মতো লিংক এখন `/#/privacy`-তে ফেরত যায় (আগে raw 404 দেখাত), সাথে ব্র্যান্ডেড 404 পেজ ও SEO লিংক।

### খ) অন-পেজ SEO
- `index.html` — নতুন কীওয়ার্ড-রিচ title/description, `robots` meta, favicon লিংক, 1200×630 `og-image.jpg` (SVG-এর বদলে, ৯৯KB), og:locale, Twitter card, এবং `@graph` JSON-LD: WebSite + EducationalOrganization + WebApplication (free offer সহ) + FAQPage (ল্যান্ডিংয়ের আসল FAQ-এর সাথে হুবহু মিল)। ভুল SearchAction বাদ।
- `<noscript>` ব্লক — JS-বিহীন ক্রলার/ইউজারের জন্য কীওয়ার্ড-রিচ fallback কনটেন্ট ও লিংক।
- **MathJax (~1MB) এখন idle-তে লেজি-লোড** — ল্যান্ডিং পেজের Core Web Vitals (LCP/INP) উন্নত হবে; `startup.typeset` ঠিক আছে তাই রেন্ডারিং অক্ষত।
- `components/LandingPage.tsx` —
  - H1 এখন কীওয়ার্ড-রিচ: *"পরীক্ষাঙ্গন (Porikkhangon) — HSC ও এডমিশন প্রস্তুতির বিশেষ অঙ্গন"* (ব্র্যান্ড অংশ `sr-only`, ডিজাইন অক্ষত)।
  - `AnimatedCounter` এখন ডিফল্টে চূড়ান্ত সংখ্যা দেখায় (ক্রলারে আর "0+" নয়), ব্রাউজারে আগের মতোই অ্যানিমেট করে।
  - Helmet-এ সম্পূর্ণ OG/Twitter/robots/canonical সেট।
- `vite.config.ts` — `preview` কনফিগ যোগ (লোকাল ভেরিফিকেশন সহজ)।
- `public/og-image.jpg` — banner.png থেকে অপটিমাইজড 1200×630 OG ইমেজ।

### গ) যা ইচ্ছাকৃতভাবে এখনো করা হয়নি (ঝুঁকি এড়াতে)
- `HashRouter → BrowserRouter` মাইগ্রেশন (নিচে ফেজ-২)।
- অ্যাপের ভেতরের রাউটগুলোর (legal pages সহ) প্রি-রেন্ডার।

---

## ৩. এখন তোমাকে যা করতে হবে (অগ্রাধিকার ক্রমে)

### ধাপ ১ — ডিপ্লয় (আজই)
এই ব্রাঞ্চের কাজ `main`-এ মার্জ/পুশ করলে GitHub Actions স্বয়ংক্রিয়ভাবে ডিপ্লয় করবে এবং নতুন ১১০ পেজ + sitemap লাইভ হবে।

### ধাপ ২ — Google Search Console + Bing Webmaster (১ দিন)
1. https://search.google.com/search-console → ডোমেইন প্রপার্টি `porikkhangon.app` যোগ করো (DNS TXT ভেরিফিকেশন)।
2. Sitemaps সেকশনে `https://www.porikkhangon.app/sitemap.xml` সাবমিট করো।
3. Bing Webmaster Tools-এও একই সাইট যোগ করো (GSC থেকে ইমপোর্ট করা যায়) — Bing/ChatGPT সার্চ ট্রাফিকের জন্য।
4. URL Inspection → হোমপেজ ও `/hsc-syllabus/` এর জন্য "Request indexing"।
5. ১ সপ্তাহ পর Coverage রিপোর্টে দেখো কত URL ইনডেক্স হলো; sitemap-এর ভুল থাকলে সেখানে দেখাবে।

### ধাপ ৩ — কনটেন্ট ইঞ্জিন (সপ্তাহ ১–৮, সবচেয়ে বেশি ইমপ্যাক্ট)
স্ট্যাটিক পেজ জেনারেটর এখন সিলেবাস কভার করে। র‍্যাংকিং বাড়াতে **প্রতি সপ্তাহে ২টি করে গাইড পেজ** যোগ করো — একই প্যাটার্নে (`scripts/generate-seo-pages.mjs`-এ নতুন সেকশন বা `data/seo/*.json` থেকে)। প্রস্তাবিত টপিক ও টার্গেট কীওয়ার্ড:

| টপিক পেজ | টার্গেট কীওয়ার্ড (bn + en) |
|---|---|
| `/admission/medical/` মেডিকেল ভর্তি প্রস্তুতি গাইড | medical admission preparation, মেডিকেল ভর্তি প্রশ্নব্যাংক, MBBS admission test Bangladesh |
| `/admission/buet/` BUET প্রস্তুতি গাইড | BUET admission question solve, বুয়েট ভর্তি প্রস্তুতি |
| `/admission/du-gst/` DU ও GST গুচ্ছভর্তি গাইড | DU admission test, GST ভর্তি পরীক্ষার সিলেবাস |
| `/hsc-question-bank/` বিগত বছরের প্রশ্ন সংগ্রহ | HSC previous year questions, বোর্ড প্রশ্ন সমাধান |
| `/blog/hsc-routine-2027/` পরীক্ষার রুটিন/সাজেশন আপডেট | HSC routine 2027, HSC suggestion |
| `/study-tips/` পড়ার কৌশল আর্টিকেল | how to study for HSC, ভর্তি পরীক্ষার প্রস্তুতি টিপস |

নিয়ম: প্রতি পেজে ৮০+ শব্দ আসল তথ্য, নিজস্ব ডেটা (যেমন তোমাদের প্রশ্নব্যাংক পরিসংখ্যান), FAQ সেকশন + FAQPage JSON-LD, এবং অ্যাপের রেজিস্ট্রেশনে CTA। **কোনো পরিসংখ্যান/তারিখ বানিয়ে লিখো না** — যে তথ্য নিশ্চিত নও সেটা বাদ দাও।

### ধাপ ৪ — অফ-পেজ ও প্রেজেন্স (সপ্তাহ ২–১২)
- **Google Play Store listing**: প্রতিযোগীদের (Porikkha, Prottoy, Shikho) র‍্যাংকিংয়ের বড় অংশ আসে Play Store পেজ থেকে, যেগুলো Google-এ ইনডেক্স হয়। PWA-এর পাশাপাশি একটি TWA/APK লিস্টিং বিবেচনা করো; অথবা অন্তত Play Console-এ না গেলেও **একই কীওয়ার্ড দিয়ে** ওয়েব প্রপার্টি শক্ত করো।
- Facebook গ্রুপ/পেজ (HSC, ভর্তি ২০২৬-২৭), Telegram চ্যানেল, YouTube-তে "প্রশ্ন সমাধান" শর্ট ভিডিও — প্রতিটিতে `porikkhangon.app/hsc-syllabus/...` লিংক (ডোমেইনে ব্যাকলিংক + রেফারেল)।
- কলেজ/কোচিং পার্টনারশিপ, শিক্ষা-বিষয়ক ডিরেক্টরিতে লিস্টিং।
- OG ইমেজ ঠিক হওয়ায় এখন Facebook/WhatsApp শেয়ারে সুন্দর কার্ড দেখাবে — শেয়ার CTA যোগ করো।

### ধাপ ৫ — ফেজ-২ টেকনিক্যাল (মাস ২–৩)
1. **BrowserRouter মাইগ্রেশন**: `HashRouter` → `BrowserRouter` + GitHub Pages `404.html` রিডাইরেক্ট হ্যাক (এখনো রাখা আছে) বা Netlify/Cloudflare Pages-এ নেওয়া। এরপর পাবলিক রাউটগুলো (`/privacy`, `/terms`, ভবিষ্যতের গাইড) আসল URL পাবে। ঝুঁকি কম কারণ `location.hash` ব্যবহার আছে মাত্র ৩ জায়গায়।
2. **পারফরম্যান্স**: মেইন বাণ্ডল `index-*.js` ≈ 1.5 MB (gzip 366 KB)। `three`, `recharts`, `pdfjs-dist`, `d3` ইত্যাদি lazy chunk-এ সরালে LCP উল্লেখযোগ্য কমবে (CWV র‍্যাংকিং ফ্যাক্টর)। রুটের `1.jpg`–`12.jpg` (মোট ~600KB) অ্যাপে ব্যবহৃত কি না দেখে মুছে দাও।
3. Legal pages (`/privacy`, `/terms`, `/refund`) প্রি-রেন্ডার — পেমেন্ট নেওয়া সাইটের E-E-A-T/ট্রাস্টের জন্য দরকার।
4. অধ্যায় পেজে ভবিষ্যতে আসল প্রশ্ন-সংখ্যা/স্যাম্পল প্রশ্ন যুক্ত করো (Firebase/publicExamService থেকে বিল্ড-টাইমে) — কনটেন্ট ডেনসিটি বাড়বে।

---

## ৪. মাপার পদ্ধতি (KPI)

| মেট্রিক | টুল | টার্গেট (৯০ দিন) |
|---|---|---|
| ইনডেক্সড পেজ | GSC → Pages | ১ → ১০০+ |
| নন-ব্র্যান্ড ইমপ্রেশন | GSC → Performance | ০ → ৫০k+/মাস |
| ক্লিক | GSC → Performance | বৃদ্ধি ট্রেন্ড |
| টার্গেট কীওয়ার্ড পজিশন (তালিকা ধাপ-৩) | GSC / manual | টপ-২০ → টপ-১০ |
| CWV (LCP < 2.5s) | PageSpeed Insights | Pass |

প্রতি সপ্তাহে GSC-এর "Queries" ট্যাবে নতুন কীওয়ার্ড দেখে কনটেন্ট প্ল্যান আপডেট করো — যেসব কীওয়ার্ডে ইমপ্রেশন আসছে কিন্তু ক্লিক নেই, সেই পেজের title/description উন্নত করো।

---

## ৫. রিপো হাইজিন (ঐচ্ছিক কিন্তু প্রস্তাবিত)

- রুটে পড়ে থাকা `1.jpg`–`12.jpg`, `QuestionBank.tsx.txt`, `fix.py`, `*.patch`, `test.cjs`, `test.js`, `metadata.json`, রুটের `sitemap.xml` — কোনোটি বিল্ড/সার্ভে ব্যবহৃত হয় না; সরিয়ে ফেললে রিপো পরিষ্কার থাকবে (SEO-তে সরাসরি প্রভাব নেই, তবে বিভ্রান্তি কমে)।
- `ads.txt` ঠিক আছে (public/-এও কপি হয়)।

---

## ৬. এক নজরে এই ব্রাঞ্চের পরিবর্তন

```
public/robots.txt                    — সঠিক sitemap URL
public/sitemap.xml                   — ক্যানোনিক্যাল fallback sitemap
public/404.html                      — নতুন: SPA ডিপ-লিংক রিকভারি + ব্র্যান্ডেড 404
public/og-image.jpg                  — নতুন: 1200x630 OG ইমেজ
index.html                           — meta/OG/JSON-LD/noscript/MathJax lazy
components/LandingPage.tsx           — H1, counter, Helmet
scripts/generate-seo-pages.mjs       — নতুন: ১১০ স্ট্যাটিক SEO পেজ + sitemap জেনারেটর
package.json                         — build-এ জেনারেটর hook, `npm run seo:pages`
vite.config.ts                       — preview কনফিগ
SEO-AUDIT.md                         — এই ডকুমেন্ট
```

লোকালে দেখতে: `npm run build && npm run preview` → `http://localhost:4173/hsc-syllabus/`
