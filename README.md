<div align="center">

# পরীক্ষাঙ্গন (Porikkhangon)

**HSC ও বিশ্ববিদ্যালয় ভর্তি প্রস্তুতির AI-চালিত লার্নিং প্ল্যাটফর্ম**

🌐 Live: **https://www.porikkhangon.app**

প্রশ্নব্যাংক · মডেল টেস্ট · AI টিউটর · কুইজ ব্যাটল · লিডারবোর্ড · স্টাডি প্ল্যানার

</div>

---

## Run locally

**Prerequisites:** Node.js 20+

```bash
npm install
cp .env.example .env.local   # add your VITE_GEMINI_API_KEY
npm run dev                  # → http://localhost:3000
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build + generate static SEO pages |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run unit tests (Vitest) |
| `npm run seo:pages` | Regenerate static SEO pages into `dist/` only |
| `npm run lint` | ESLint |

## Tech stack

- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS + React Router (BrowserRouter)
- **Backend:** Firebase (Auth, Firestore, RTDB) + Render API (MongoDB)
- **AI:** Google Gemini (via `services/geminiService.ts`)
- **Hosting:** GitHub Pages (custom domain) — auto-deploys from `main`, see `DEPLOYMENT.md`

## Project layout

```
App.tsx                 → routes (public: /, /auth, /exam/*, /q/*, legal pages)
components/             → UI screens (HomeDashboard, QuestionBank, ExamPage, ...)
components/AuthPage.tsx → login / sign-up (name + email + password, Google)
components/onboarding/  → first-run profile setup wizard (avatar · phone · batch ·
                          department · target · study goal) shown after sign-up
components/landing/     → public landing page sections + content data
                          (design ported from premium-edtech-landing-page.zip)
components/QuizArena.tsx→ /quiz mock-test builder (বিষয় → অধ্যায় → সেটিংস → /exam/:id)
components/quiz/        → builder steps + pure model (catalog, selection, presets,
                          stats, launch) — exam config contract lives in launch.ts
data/profileOptions.ts  → shared student-profile vocabulary (levels, batches,
                          departments, targets, goals) used by setup + profile edit
services/               → api.ts (backend), firebase.ts, geminiService.ts, ...
contexts/               → Auth, Admin, Language, Preferences, Cache
utils/                  → logger, sanitize, adminConfig, normalization, ...
scripts/generate-seo-pages.mjs → static /hsc-syllabus/* + /q/* pages + sitemap
public/                 → copied to dist/ (manifest, icons, 404.html, CNAME, ...)
```

## Docs

- `SECURITY.md` — security checklist (API keys, Firebase rules, backend auth)
- `SEO-AUDIT.md` — SEO audit & content roadmap
- `DEPLOYMENT.md` — deploy guide (EN/BN)
- `firestore.rules` / `database.rules.json` — deploy with `firebase deploy --only firestore:rules,database`
