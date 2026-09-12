# প্রশ্ন পেজ SEO — সব প্রশ্ন ইনডেক্স + নতুন ডিজাইন

তারিখ: ২০২৬-০৯-১২ · ব্রাঞ্চ: `arena/01a094ca-ed-tech`
আগের অডিটের ধারাবাহিকতা: `SEO-AUDIT.md`

---

## ১. "শুধু সেই একটা প্রশ্নই আসছে, বাকিগুলো আসছে না" — আসল কারণ

তোমার ডাটাবেজে এখন **৫০,৩৪৩টি প্রশ্ন** আছে (API-এর `total` ফিল্ড থেকে যাচাই করা)।
কিন্তু Google-এ ১টা প্রশ্ন দেখানোর জন্য ৩টা জিনিস একসাথে লাগে:

| প্রয়োজন | আগের অবস্থা | এখন |
|---|---|---|
| ১. প্রতিটি প্রশ্নের **আলাদা URL** যা HTTP 200 দেয় | শুধু ~২৫০টি স্ট্যাটিক পেজ ছিল | ✅ জেনারেটর এখন পুরো DB পড়ে |
| ২. URL-গুলো **sitemap-এ** থাকা | হ্যাঁ, কিন্তু ওই ২৫০টা | ✅ ৪০,০০০ URL করে অটো-ভাগ হওয়া sitemap index |
| ৩. Google-এর **ক্রল বাজেট** ও কোয়ালিটি সিগন্যাল | পেজে কনটেন্ট পাতলা, কোনো ওয়েবফন্ট নেই | ✅ নতুন ডিজাইন, ব্যাখ্যা, internal link |

> **মূল কথা:** Google "ডাটাবেজ দেখে" না। সে শুধু **URL** দেখে। ডাটাবেজের ৫০,৩৪৩টি
> প্রশ্নের জন্য ৫০,৩৪৩টি আলাদা URL-এ 200 রেসপন্স না থাকলে কিছুই ইনডেক্স হবে না।
> তুমি যে প্রশ্নটার জন্য manually "Request indexing" দিয়েছিলে, সেটার পেজ তৈরি হয়েছিল —
> তাই ওটাই এসেছে। বাকিগুলোর পেজই ছিল না।

### GitHub Pages-এ কেন পুরো ৫০ হাজার সম্ভব না

মেপে দেখা গেছে:

- ১টি প্রশ্ন পেজ ≈ **১২ KB** (CSS আলাদা ফাইলে নেওয়ার পরেও)
- ৫০,৩৪৩ × ১২ KB ≈ **৬০০ MB শুধু HTML**
- GitHub Pages-এর নিয়ম: পাবলিশড সাইট **১ GB**-এর কম, এবং **ডিপ্লয় ১০ মিনিটে টাইমআউট** করে
  ([GitHub Docs — Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits))

মানে স্ট্যাটিক দিয়ে পুরো ব্যাংক কভার করা ঝুঁকিপূর্ণ। তাই দুটো ট্র্যাক রাখা হয়েছে:

- **ট্র্যাক A (স্ট্যাটিক):** সবচেয়ে ভালো ৫,০০০ প্রশ্নের পেজ GitHub Pages-এ — আজই লাইভ করা যায়।
- **ট্র্যাক B (SSR):** বাকি সব প্রশ্ন backend থেকে রেন্ডার — ১০০% কভারেজ, শূন্য রিবিল্ড।

---

## ২. "- চর্চা", "- Sattacademy" — এটা কীভাবে হয়

এটা **সার্চ রেজাল্টের টাইটেলের শেষে বসানো সাইটের নাম**। দুইভাবে হয়:

1. **`<title>` ট্যাগের ভেতরেই** লেখা থাকে — যেমন `<title>প্রশ্ন… - চর্চা</title>`
2. **Google নিজে বসিয়ে দেয়** — Google-এর *Site names* ফিচার। সে সাইটের নাম বের করে
   `WebSite` JSON-LD → `og:site_name` → হোমপেজের `<title>` → ডোমেইন নাম, এই ক্রমে।
   Sattacademy-র প্রশ্ন পেজের টাইটেল দেখলে দেখবে ওদের `<title>`-এ ব্র্যান্ড নেই
   (শুধু প্রশ্নটা), তবু রেজাল্টে "- Sattacademy" দেখায় → মানে Google নিজে বসাচ্ছে।

### আমরা যা ঠিক করেছি

| ফাইল | পরিবর্তন |
|---|---|
| `index.html` | `WebSite.name` ছিল `"Porikkhangon"` (ইংরেজি) → এখন `"পরীক্ষাঙ্গন"`, `alternateName: ["Porikkhangon", …]`। ফলে Google বাংলা নামটাই সাইট-নেম হিসেবে নেবে |
| `index.html` | `og:site_name` → `পরীক্ষাঙ্গন` |
| `index.html` | হোমপেজ টাইটেল → `পরীক্ষাঙ্গন (Porikkhangon) — HSC ও Admission প্রস্তুতির AI প্ল্যাটফর্ম` |
| `seo/render.mjs` | প্রতিটি SEO পেজের `<title>` = প্রশ্ন + `\| পরীক্ষাঙ্গন` সফিক্স |
| `seo/render.mjs` | প্রতিটি পেজে `WebSite` + `Organization` JSON-LD (`@id` দিয়ে একই নোড রেফারেন্স) |
| `seo/render.mjs` | `cutTitle()`/`widthUnits()` — Google টাইটেল অক্ষরে না, **পিক্সেলে** কাটে; বাংলা অক্ষর ল্যাটিনের প্রায় দ্বিগুণ চওড়া। তাই বাজেট ৫৮ "ইউনিট" ধরে শব্দের সীমানায় কাটা হয়, শেষে `…` |

> ⚠️ **গুরুত্বপূর্ণ:** সাইটের নাম **সব জায়গায় এক** হতে হবে। কোথাও "Porikkhangon",
> কোথাও "পরীক্ষাঙ্গন", কোথাও "Porikkhangon App" লিখলে Google কনফিউজ হয়ে ডোমেইন নাম
> (`porikkhangon.app`) দেখাতে শুরু করে। এখন সব জায়গায় **পরীক্ষাঙ্গন**।
>
> পরিবর্তন লাইভ হওয়ার পর Search Console → URL Inspection → হোমপেজ → "Request indexing" দাও।
> সাইট-নেম আপডেট হতে সাধারণত কয়েক দিন থেকে ২–৩ সপ্তাহ লাগে।

---

## ৩. প্রশ্ন পেজের নতুন ডিজাইন

আগের পেজের সবচেয়ে বড় সমস্যা ছিল: CSS-এ `font-family:'Hind Siliguri'` লেখা ছিল,
কিন্তু **ফন্ট ফাইলটাই লোড হচ্ছিল না** — কোনো `<link>` ছিল না। তাই ব্রাউজার
system-ui fallback ব্যবহার করত → "ফন্ট সাধারণ" লাগত।

### যা বদলেছে

| বিষয় | আগে | এখন |
|---|---|---|
| ফন্ট | কোনো ওয়েবফন্ট লোড হতো না | **Noto Serif Bengali** (প্রশ্নের হেডিং) + **Hind Siliguri** (বডি) + Inter (সংখ্যা), preconnect + `display=swap` |
| প্রশ্নের টাইপোগ্রাফি | sans, ছোট | serif, `clamp(22px,4.6vw,33px)`, `line-height:1.85` (বাংলার উঁচু-নিচু অক্ষরের জন্য দরকার) |
| বিকল্প (ক খ গ ঘ) | সাধারণ বর্ডার | ৩২px লেটার ব্যাজ, সঠিকটিতে সবুজ badge + `inset 3px` এক্সেন্ট + "সঠিক উত্তর" ট্যাগ |
| সঠিক উত্তর | এক লাইন টেক্সট | ✓ সার্কেল + লেবেল + serif-এ উত্তর — আলাদা প্যানেল |
| ব্যাখ্যা | সাধারণ বক্স | বাম দিকে কমলা এক্সেন্ট বার, uppercase লেবেল, `line-height:2` |
| ব্যাখ্যা না থাকলে | কিছুই না | amber কলআউট + AI টিউটর লিংক (খালি পেজ নয়) |
| চিপস (বিষয়/অধ্যায়) | সাধারণ `<span>` — **কোনো লিংক না** | **সব চিপ লিংক** → বিষয়/অধ্যায় পেজে। এটাই internal linking, Google-এর কাছে সবচেয়ে বড় সিগন্যাল |
| এক্সাম ট্যাগ (`DU-A '25-26`) | দেখাত না | নীল পিল হিসেবে দেখায় |
| তারিখ | ছিল না | "যোগ করা হয়েছে" + `datePublished`/`dateModified` JSON-LD |
| সম্পর্কিত প্রশ্ন | ৫টি, কোনো নম্বর না | ৮টি, নম্বরসহ + "এই অধ্যায়ের সব Nটি প্রশ্ন" লিংক |
| Prev/Next | ছিল না | আছে → ক্রলার এক প্রশ্ন থেকে পরেরটায় হাঁটতে পারে |
| MathJax | সব প্রশ্ন পেজে (~1 MB) | **শুধু যেসব প্রশ্নে TeX আছে** (`needsMath()` চেক করে) |
| CSS | প্রতি পেজে ~৭ KB ইনলাইন | একটা শেয়ার্ড `/seo.css` (~১৬ KB, সব পেজে ক্যাশ হয়) |
| ডার্ক মোড | না | `prefers-color-scheme` দিয়ে পূর্ণ |
| প্রিন্ট | বাজে | টুলবার/ফুটার/ব্যানার বাদ |

`components/QuestionPage.tsx` (অ্যাপের ভেতরের পেজ) একই ডিজাইনে আপডেট করা হয়েছে —
একই serif হেডিং, একই লেটার ব্যাজ, একই উত্তর প্যানেল।

**প্রিভিউ:** `node scripts/preview-seo.mjs --dir dist --port 4173`

---

## ৪. নতুন পেজ স্ট্রাকচার

```
/hsc-syllabus/                              সিলেবাস হাব
/hsc-syllabus/<subject>/                    ১৪টি বিষয় পেজ
/hsc-syllabus/<subject>/<chapter>/          ৯৫টি অধ্যায় পেজ
/questions/                                 প্রশ্নব্যাংক ইনডেক্স (বিষয়ভিত্তিক, আসল সংখ্যাসহ)   ← নতুন
/questions/<subject>/<chapter>/             অধ্যায়ের সব প্রশ্নের তালিকা (১০০টি/পেজ)        ← নতুন
/questions/<subject>/<chapter>/2/           …পরবর্তী পাতা
/q/<slug>/                                  একেকটি প্রশ্নের পূর্ণাঙ্গ পেজ
/seo.css                                    শেয়ার্ড স্টাইলশিট                                 ← নতুন
/sitemap.xml                                ৪০,০০০ URL-এ অটো-ভাগ হওয়া sitemap index
/sitemap-part-N.xml
```

`/questions/<subject>/<chapter>/` পেজগুলোই **ইঞ্জিন**: এখান থেকে প্রতিটি প্রশ্নের পেজে
লিংক যায়, তাই Google একটা হাব থেকে ক্রল করে গভীরে নামতে পারে। শুধু sitemap দিলেই হয় না —
internal link ছাড়া Google পেজগুলোকে "গুরুত্বপূর্ণ" মনে করে না।

---

## ৫. ট্র্যাক A — স্ট্যাটিক (আজই, GitHub Pages-এ)

```bash
npm run build          # = tsc && vite build && generate-seo-pages (ডিফল্ট ৫০০০ প্রশ্ন)
npm run seo:pages      # শুধু SEO পেজ জেনারেট
```

জেনারেটর ফ্ল্যাগ:

| ফ্ল্যাগ | কাজ |
|---|---|
| `--questions 5000` | কতগুলো প্রশ্ন পেজ তৈরি হবে (ডিফল্ট)। র‍্যাংকিং: ব্যাখ্যা আছে > ভর্তি > এক্সাম ট্যাগ আছে |
| `--questions all` | সব ৫০,৩৪৩টি — **শুধু SSR থাকলে**, নইলে ১ GB লিমিট ভাঙবে |
| `--skip-fetch` | API কল না করে bundled ডেটা + ক্যাশ ব্যবহার |
| `--refresh` | ক্যাশ উপেক্ষা করে নতুন করে API থেকে নামাও |
| `--link-all` | অধ্যায়ের তালিকায় **সব** প্রশ্নের লিংক দাও (SSR ছাড়া ব্যবহার কোরো না — 404 হবে) |
| `--out dist` | আউটপুট ডিরেক্টরি |

**ক্যাশ:** প্রথমবার ~১০১টি রিকোয়েস্ট করে পুরো DB নামিয়ে `.seo-cache/questions-full.json`-এ রাখে
(১২ ঘণ্টা বৈধ, `.gitignore` করা আছে)। পরের বিল্ড সেকেন্ডে শেষ হয়। GitHub Actions-এ প্রতিটি
রান নতুন, তাই ওখানে প্রতিবার ফেচ হবে — ~২–৪ মিনিট।

### এখন যা করতে হবে

1. এই ব্রাঞ্চ `main`-এ মার্জ করো → Actions অটো-ডিপ্লয় করবে।
2. Search Console → Sitemaps → `https://www.porikkhangon.app/sitemap.xml` সাবমিট করো
   (এখন এটা sitemap **index**, আগেরটা রিপ্লেস হয়ে যাবে)।
3. URL Inspection → `https://www.porikkhangon.app/questions/` → Request indexing।
4. ১ সপ্তাহ পর **Pages** রিপোর্টে দেখো কতগুলো "Discovered – currently not indexed" — ওটাই
   ক্রল বাজেটের আসল ছবি।

> **সতর্কতা:** ৫,০০০ পেজ একসাথে ফেললে Google ধীরে ক্রল করবে, এটা স্বাভাবিক।
> কিন্তু **ব্যাখ্যা ছাড়া** হাজার হাজার পাতলা পেজ ফেললে "scaled content" ঝুঁকি আছে।
> তাই র‍্যাংকিং ফাংশন ব্যাখ্যাওয়ালা প্রশ্নকে আগে রাখে। ব্যাখ্যা যত বাড়াবে, ইনডেক্সিং তত দ্রুত হবে।

---

## ৬. ট্র্যাক B — SSR: ডাটাবেজের **সব** প্রশ্ন, অটোমেটিক

`seo/ssr-server.mjs` — zero-dependency Node সার্ভার যা রানটাইমে প্রতিটি প্রশ্নের পেজ বানায়।
নতুন প্রশ্ন যোগ করলে **কিছুই করতে হয় না** — পরের মিনিটেই তার পেজ আর sitemap-এ URL চলে আসে।

এটা যে রাউটগুলো সামলায়:

```
GET /q/<slug>/              200 + পূর্ণাঙ্গ HTML  (না পেলে ব্র্যান্ডেড 404 পেজ)
GET /sitemap.xml            sitemap index (৪০,০০০ URL করে ভাগ করা)
GET /sitemap-questions-N.xml
GET /seo.css
GET /healthz
```

বাকি সব প্যাথ তোমার পরের হ্যান্ডলারে চলে যায়।

### ৬ক. তোমার Render backend-এ বসানো (সবচেয়ে সহজ)

`mongodb-hb6b.onrender.com` যেই repo থেকে ডিপ্লয় হয়, সেখানে:

```js
// server.js (তোমার Express এন্ট্রি)
import { createSeoHandler } from './seo/ssr-server.mjs';
const seo = createSeoHandler();            // ডিফল্ট: REST দিয়ে নিজেই সব প্রশ্ন ইনডেক্স করে
app.use((req, res, next) => seo(req, res).then((done) => !done && next()));
```

Mongoose একই প্রসেসে থাকলে REST-এর বদলে সরাসরি DB ব্যবহার করো —
`seo/ssr-server.mjs`-এর নিচে কপি-পেস্ট করার মতো কোড দেওয়া আছে। তখন একটা ইনডেক্স দিও:

```js
db.questions.createIndex({ slug: 1 }, { unique: true })
```

`seo/` ফোল্ডারটা শুধু কপি করলেই হবে — কোনো npm ডিপেন্ডেন্সি নেই।

### ৬খ. ডোমেইন রাউটিং (একটা বেছে নাও)

**অপশন ১ — Cloudflare Worker (GitHub Pages-এই থেকে যাও)** ⭐ সবচেয়ে কম ঝামেলা

1. Cloudflare-এ `porikkhangon.app` যোগ করো, nameserver বদলাও।
2. DNS: `www` → CNAME `naim-sourav.github.io`, প্রক্সি **চালু** (কমলা মেঘ)।
   GitHub Pages → Settings → Pages → Custom domain-এ `www.porikkhangon.app` যেন থাকে।
3. Workers & Pages → Create Worker → `seo/cloudflare-worker.js` পেস্ট করো।
4. Settings → Triggers → Route: `www.porikkhangon.app/*`

ব্যাস — `/q/*` আর `/sitemap*` Render-এ যাবে, বাকি সব GitHub Pages থেকে আসবে।

**অপশন ২ — Cloudflare Pages / Netlify-তে হোস্টিং সরিয়ে নাও**

- Build command `npm run build`, output `dist`।
- `public/_redirects`-এ রাউলগুলো আগে থেকেই লেখা আছে:
  ```
  /q/*                     https://mongodb-hb6b.onrender.com/q/:splat      200
  /sitemap.xml             https://mongodb-hb6b.onrender.com/sitemap.xml   200
  /sitemap-questions-*.xml https://mongodb-hb6b.onrender.com/:splat        200
  /*  /index.html  200
  ```
- সুবিধা: Cloudflare Pages-এ ব্যান্ডউইথ লিমিট নেই।

### ৬গ. SSR লাইভ হওয়ার পর

```bash
npm run seo:pages -- --link-all --questions 5000
```

এতে অধ্যায়ের তালিকা পেজগুলো **সব** ৫০,৩৪৩টি প্রশ্নে লিংক করবে (পেজগুলো Render দেবে),
আর GitHub Pages-এ শুধু সেরা ৫,০০০টির স্ট্যাটিক কপি থাকবে। Search Console-এ sitemap
রি-সাবমিট করো — এবার ৫০ হাজার URL দেখাবে।

### যাচাই

```bash
node seo/ssr-server.mjs --port 8080
curl -i http://localhost:8080/healthz
curl -i http://localhost:8080/q/শুকনো-বরফ-কী/
curl -s http://localhost:8080/sitemap.xml | head
```

---

## ৭. ফাইল ম্যাপ

| ফাইল | কী |
|---|---|
| `seo/theme.mjs` | সাইট কনস্ট্যান্ট, `THEME_CSS`, `WebSite`/`Organization` JSON-LD |
| `seo/render.mjs` | সব পেজের রেন্ডারার — স্ট্যাটিক ও SSR দুটোই এখান থেকেই চলে |
| `seo/ssr-server.mjs` | রানটাইম সার্ভার (১০০% কভারেজ) |
| `seo/cloudflare-worker.js` | `/q/*` রাউটিং (অপশন ১) |
| `scripts/generate-seo-pages.mjs` | বিল্ড-টাইম স্ট্যাটিক জেনারেটর + sitemap |
| `scripts/preview-seo.mjs` | লোকাল প্রিভিউ সার্ভার |
| `public/_redirects` | Cloudflare Pages / Netlify রাউটিং (অপশন ২) |
| `public/robots.txt` | `/q/`, `/questions/` Allow + sitemap |
| `components/QuestionPage.tsx` | অ্যাপের ভেতরের প্রশ্ন পেজ (একই ডিজাইন) |

---

## ৮. এই রিলিজে যা যাচাই করা হয়েছে / হয়নি

**যাচাই করা:**
- `npm run build` (পুরো পাইপলাইন: `tsc` → `vite build` → SEO জেনারেটর) — সফল, ৪৬৮টি SEO পেজ + sitemap
- `npx tsc --noEmit` — পুরো প্রজেক্ট, ০ এরর (নতুন `QuestionPage.tsx` সহ)
- `npx eslint components/QuestionPage.tsx` — ০ এরর
- ২৬১টি জেনারেট হওয়া প্রশ্ন পেজ স্ক্যান করে: সবগুলোতে `<title>`, description, canonical,
  বৈধ JSON-LD ও `/seo.css` আছে; **০টিতে** raw TeX রয়ে গেছে, **০টি** টাইটেল ৬০ ইউনিটের বেশি,
  সবগুলোতে ঠিক একবার ব্র্যান্ড সফিক্স
- `sitemap.xml` XML-parsed: ৪৬৯টি URL (২৬১ প্রশ্ন + ৯৭ তালিকা + ১১০ সিলেবাস + হোম)
- `seo/ssr-server.mjs` — mock সোর্স দিয়ে: `/q/<slug>/` 200, অজানা স্লাগে 404 পেজ,
  `/sitemap.xml`, `/seo.css`, `/healthz`, এবং অ-SEO প্যাথে pass-through — সব ঠিক
- API থেকে নিশ্চিত: মোট প্রশ্ন **৫০,৩৪৩**, `slug` ফিল্ড আগে থেকেই আছে

**যাচাই করা যায়নি (এই স্যান্ডবক্স থেকে):**
- Render backend-এ `createSeoHandler` মাউন্ট করা — backend repo এখানে নেই
- Cloudflare Worker/`_redirects` লাইভ রাউটিং — ডোমেইন/DNS অ্যাক্সেস নেই
- Google-এর আসল ইনডেক্সিং আচরণ — এটা সময়সাপেক্ষ
