# প্রশ্ন SEO — কিভাবে Satt Academy / Chorcha / Daricomma এর মতো Google এ প্রশ্ন দেখাবে

## সমস্যা কী ছিল?
তোমার মনে আছে ঠিকই — আগে `slug` ফিল্ড বানানো হয়েছিল এবং `QuestionBank.tsx` এ শেয়ার URL `/question/<slug>` করা ছিল, কিন্তু:
1. কোনো React route ছিল না `/question/:slug` এর জন্য
2. HashRouter ব্যবহার (`/#/question/...`) — Google hash এর পরের অংশ ignore করে, তাই index হয় না
3. কোনো static HTML ছিল না — JS ছাড়া crawler খালি পেজ দেখত
4. QAPage structured data ছিল না — Google বুঝত না এটা প্রশ্ন-উত্তর পেজ

ফলে ডাটাবেজে ২০,০০০+ প্রশ্ন থাকলেও Google এ একটাও দেখাত না।

---

## এখন কী বানানো হয়েছে? (এই ব্রাঞ্চে)

### ১. React পেজ — SPA তে কাজ করবে
**নতুন ফাইল:**
- `services/questionService.ts` — single question fetch + QAPage JSON-LD builder
- `components/QuestionDetailPage.tsx` — public question detail page (login ছাড়াই দেখা যায়)
- `components/QuestionsHubPage.tsx` — `/questions/` hub page, search + subject filter

**রাউটিং (App.tsx):**
```tsx
// Public routes — Google crawlable + user accessible without login
/questions/  -> QuestionsHubPage
/questions/:identifier -> QuestionDetailPage
/question/:identifier  -> QuestionDetailPage (legacy support)
/q/:identifier         -> QuestionDetailPage (short link)
```
- `/exam/:examId` এর মতোই public route, `/*` auth guard এর বাইরে
- Helmet দিয়ে dynamic title, description, canonical, OG tags
- QAPage + FAQPage + LearningResource + BreadcrumbList JSON-LD — Google Search Gallery অনুযায়ী
- Bookmark, Share, Related questions, CTA

**Share URL আপডেট (QuestionBank.tsx):**
- আগে: `https://.../#/question/<id>` (hash, SEO খারাপ)
- এখন: `https://www.porikkhangon.app/questions/<slug>/` (clean, SEO friendly)
- Facebook/WhatsApp এ শেয়ার করলে সুন্দর preview + Google indexable

### ২. Static Generation — Google এর জন্য সবচেয়ে গুরুত্বপূর্ণ
**নতুন ফাইল:** `scripts/generate-question-pages.mjs`

এই স্ক্রিপ্ট build time এ চালায়:
1. API থেকে প্রশ্ন fetch করে (paginated, default 2000, `QUESTION_LIMIT` দিয়ে বাড়ানো যায়)
2. প্রতিটি প্রশ্নের জন্য static HTML বানায়: `dist/questions/<slug>/index.html`
   - কোনো JS লাগে না — crawler সরাসরি HTML পড়তে পারে
   - Question text, options, correct answer, explanation সব HTML এ থাকে
   - QAPage structured data, canonical, OG tags, breadcrumb
3. Subject-wise hub: `dist/questions/subject/<subject>/index.html`
4. Main hub: `dist/questions/index.html`
5. Sitemap: `sitemap-questions.xml` + main `sitemap.xml` এ merge

**Build hook (package.json):**
```json
"build": "tsc && vite build && node scripts/generate-seo-pages.mjs --out dist && node scripts/generate-question-pages.mjs --out dist --limit 2000"
```
- GitHub Actions deploy এও auto চলবে
- API down থাকলে hub placeholder বানায়, build fail করে না (এই মুহূর্তে API down তাই 0 টা question page, কিন্তু infra ready)

### ৩. Robots & Sitemap
- `public/robots.txt`: `Allow: /questions/`, `Allow: /question/`, দুটো sitemap declare
- `public/404.html`: `/questions/<slug>` missing হলে SPA fallback `/ #/questions/<slug>` — user experience নষ্ট হয় না

---

## Satt Academy / Chorcha / Daricomma কিভাবে করে? আমরা কিভাবে মিল রাখলাম?

| Feature | SattAcademy / Chorcha | Porikkhangon (এখন) |
|---|---|---|
| **URL Pattern** | `/question/<id>/<slug>` বা `/mcq/<subject>/...` | `/questions/<slug>/` — একই, clean, keyword rich |
| **Static HTML** | SSR / static generation | Static generation at build (GitHub Pages compatible) |
| **QAPage Schema** | `QAPage > Question > Answer` | ✅ একই, plus FAQPage, LearningResource, Breadcrumb |
| **Internal Linking** | Subject, chapter, related Q | ✅ Subject hub, chapter link, related Q, syllabus link |
| **Sitemap** | Question sitemap আলাদা | ✅ `sitemap-questions.xml` + merged main sitemap |
| **Social Preview** | OG title = question text | ✅ OG title = question text (trimmed), OG image |
| **No login required** | Public | ✅ Public route, no auth needed |

Google এর [QAPage doc](https://developers.google.com/search/docs/appearance/structured-data/qapage) অনুযায়ী আমরা `QAPage` mainEntity হিসেবে ব্যবহার করেছি — এটাই rich result এর জন্য recommended।

---

## কিভাবে Google এ আসবে? (Step-by-step)

### আজই করতে হবে:
1. **Deploy**: এই branch `main` এ merge করো — GitHub Actions auto build করবে
   - `dist/questions/index.html` live হবে
   - `sitemap.xml` এ 112+ URL (syllabus 110 + questions hub)
   - যখন API up থাকবে, build এ 2000 question page + sitemap এ 2000 URL যোগ হবে

2. **Search Console**:
   - https://search.google.com/search-console → property `porikkhangon.app`
   - Sitemaps → `https://www.porikkhangon.app/sitemap.xml` submit
   - Sitemaps → `https://www.porikkhangon.app/sitemap-questions.xml` submit (extra)
   - URL Inspection → `https://www.porikkhangon.app/questions/` → Request indexing
   - একটা sample question URL (যখন generate হবে) → Request indexing

### API up হলে কী হবে?
- Render API `mongodb-hb6b.onrender.com` মাঝে মাঝে sleep করে — GitHub Actions build এর সময় যদি API down থাকে, 0 টা question page generate হবে (এখন যেমন হয়েছে)
- সমাধান: Build এর আগে API wake up করো (একবার `https://mongodb-hb6b.onrender.com/api/admin/questions?page=1&limit=1` hit করলে 30s এ up হয়), তারপর deploy trigger করো
- অথবা `QUESTION_LIMIT=5000` দিয়ে manual build: `npm run seo:questions`

### Content বাড়ানোর পরিকল্পনা:
- প্রতি প্রশ্নের `slug` যেন unique, readable হয় — Admin panel এ `Generate Slugs (SEO)` বাটন আছে, সেটা চালাও
- Slug pattern ভালো: `physics-vector-dot-product-mcq-123` — এতে keyword থাকে, Google পছন্দ করে
- ভবিষ্যতে: `generate-question-pages.mjs` এ `LIMIT` 20000 করলে সব প্রশ্ন static হবে — তবে GitHub Pages এ 20k file (প্রায় 100MB) একটু বেশি, তাই 2000-5000 batch এ করা ভালো। পরে Cloudflare Pages / Netlify এ গেলে ISR ব্যবহার করা যাবে।

---

## টেস্ট কিভাবে করবে?

### Local:
```bash
npm run dev
# তারপর ব্রাউজারে:
http://localhost:5173/#/questions/  -> hub
http://localhost:5173/#/questions/<any-id> -> detail (API থেকে fetch)
```

### Build preview (static pages সহ):
```bash
npm run build
npm run preview
# http://localhost:4173/questions/  -> static hub (JS ছাড়াই content দেখাবে)
# http://localhost:4173/questions/<slug>/ -> static question page
# View source করলে পুরো প্রশ্ন HTML এ দেখা যাবে — এটাই crawler দেখে
```

### Structured Data Test:
- https://search.google.com/test/rich-results → question URL paste করো
- QAPage detected দেখাবে
- https://validator.schema.org/ → JSON-LD valid কিনা

---

## ভবিষ্যৎ উন্নতি (Phase 2)

1. **BrowserRouter migration**: HashRouter → BrowserRouter করলে `/questions/<slug>/` সরাসরি SPA তে কাজ করবে, 404.html hack লাগবে না। SEO-AUDIT.md এ plan আছে।
2. **Incremental generation**: সব প্রশ্ন একবারে না বানিয়ে, popular প্রশ্ন (যেগুলো বেশি search হয়) আগে বানানো — GSC Queries report দেখে।
3. **Question listing SEO**: `/questions/subject/Physics/` এর মতো পেজে আরও content — যেমন "Physics এর সবচেয়ে কঠিন টপিক" ইত্যাদি, FAQ সহ।
4. **Internal linking**: LandingPage, HomeDashboard এ "জনপ্রিয় প্রশ্ন" section যোগ — crawler এর জন্য link juice।
5. **API endpoint**: Backend এ `/api/questions/:slug` public endpoint বানালে fetch আরও reliable হবে (এখন `/admin/questions?search=` fallback ব্যবহার করা হয়েছে)।

---

## ফাইল চেঞ্জ সামারি

```
services/questionService.ts          — নতুন: single Q fetch + JSON-LD builder
components/QuestionDetailPage.tsx    — নতুন: public Q detail, Helmet, QAPage schema
components/QuestionsHubPage.tsx      — নতুন: /questions/ hub, search, subject filter
scripts/generate-question-pages.mjs  — নতুন: static Q pages + sitemap generator
App.tsx                              — public routes যোগ: /questions/*, /question/*, /q/*
components/QuestionBank.tsx          — share URL clean করা: /questions/<slug>/
public/robots.txt                    — Allow /questions/, /question/, দুটো sitemap
public/404.html                      — questions fallback handling
package.json                         — build এ question generator hook
QUESTION-SEO-GUIDE.md                — এই ডকুমেন্ট
```

---

## এক কথায়

**আগে:** প্রশ্ন শুধু app এর ভেতরে, login এর পর, hash URL এ — Google দেখত না।
**এখন:** প্রতিটি প্রশ্নের আলাদা clean URL, static HTML, QAPage schema, sitemap — Satt Academy / Chorcha এর মতোই Google index করবে এবং প্রশ্ন সার্চ করলে তোমার সাইট দেখাবে।

Deploy করার পর 1-2 সপ্তাহে Search Console এ impression আসতে শুরু করবে।
