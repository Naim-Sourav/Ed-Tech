# Porikkhangon (পরীক্ষাঙ্গন) — Website Analysis Report

**Project:** Shikkha Shohayok / Porikkhangon — AI learning assistant for Bangladeshi HSC & Admission students
**Live URL:** https://www.porikkhangon.app (README) / configured for GitHub Pages (`naim-sourav.github.io/Ed-Tech` per DEPLOYMENT.md)
**Stack:** React 18 + TypeScript + Vite + Tailwind CSS; Firebase (Auth, Firestore, Realtime DB, Messaging) + MongoDB REST backend (onrender.com); Gemini AI (`@google/genai`); react-three-fiber, recharts, motion, d3, lottie.
**Scale:** 84 `.tsx`/`.ts` files, ~37,200 LOC. Git history shows active feature work (battle invite, presence, theming).

> Note: This is an analysis only. The "Next steps" are recommendations, NOT approved implementation work. Switch to an implementation agent to act on them.

---

## 1. What the site does (feature map)
- **Auth & profile:** Google sign-in, anonymous fallback, profile/onboarding, avatar creator, presence.
- **Learning core:** Home dashboard, Courses, Question Bank (archives), Exam Hub, Quiz Arena, Daily Challenges, Saved/Wrong questions, Exam History/Planner.
- **AI features:** `PorikkhangonAI` chatbot, Concept Tutor, AI quiz/question generation (`geminiService.ts`), admission search/info.
- **Social/competitive:** Real-time Quiz Battle (RTDB), battle invites, Leaderboard, Study Groups, Guest leaderboard.
- **Commerce/admin:** Payment page, full Admin panel (question generator, PDF/image upload, JSON upload, duplicate finder, tag mappers), push notifications.
- **Localization:** Bengali/English via `LanguageContext`/`translations.ts`; theming light/dark/system + dynamic `theme-color`.

## 2. Architecture assessment
**Strengths**
- Lazy-loaded routes (`lazyWithRetry`) keep initial bundle small.
- `HashRouter` chosen — correct for static/GitHub Pages hosting (no server rewrites needed).
- Clear separation: `components/`, `contexts/`, `services/`, `data/`, `utils/`, `types.ts`.
- Firestore rules define per-collection access and an `isAdmin()` helper.

**Weaknesses**
- Monolithic `App.tsx` (~640 LOC) mixes routing, layout, battle-invite state, notification polling, theme. Hard to maintain.
- Heavy client-side AI calls (Gemini key lives in browser). No server proxy for generations → quota/cost/abuse exposure.
- Mixed data sources: Firestore, RTDB, local JSON banks, and external MongoDB REST — loosely coupled, no single data-access layer.
- No automated tests beyond trivial `test.js`/`test.cjs`; lint is strict (`--max-warnings 0`) so CI could break easily.

## 3. Critical issues (priority order)

### 🔴 P0 — Hardcoded Gemini API keys in client source
`services/geminiService.ts:40-42` embeds 3 real `AIzaSy...` keys directly in source (plus the Firebase `apiKey` in `services/firebase.ts:10`). These ship in the public JS bundle. Anyone can extract and abuse them (quota drain, billing).
- **Fix:** Remove all keys; use a server proxy (Cloud Function / your Render backend) to call Gemini. If client calls are unavoidable, load only from `VITE_*` env and never commit. Revoke the leaked keys now in Google Cloud.

### 🔴 P0 — Firestore rules too permissive
- `match /{document=**}` (line 160) allows **read for any authenticated user** on every collection not otherwise matched. Combined with `battle_rooms`/`study_groups`/`test` allowing `write/update` for any authenticated user, a logged-in user can read/modify data across the app.
- `study_groups` `update` (line 55) permits any authenticated user to overwrite any field (not just `activeCount`) — tamperable.
- `telegramVerifications` (line 82) allows any user to `read`/`delete` codes — can read others' verification codes.
- `guest_attempts`/`guest_leaderboard` (lines 108-116) allow unauthenticated `create`/`read` — open to spam/fake entries.
- Admin gated partly by a hardcoded email (`tasnimahmedutsha600@gmail.com`, line 169) — fragile.

### 🟠 P1 — Backend coupling & secrets
- `services/api.ts:6` hardcodes `https://mongodb-hb6b.onrender.com/api`. No fallback/error UX noted; single point of failure.
- Firebase config + messagingSenderId are public by design, but confirm App Check is enabled to stop abuse.

### 🟠 P1 — Deployment inconsistency
README states `porikkhangon.app`; DEPLOYMENT.md states GitHub Pages `naim-sourav.github.io/Ed-Tech`. The `vite.config.ts` base is `/Ed-Tech/` in prod. Unclear which is the real production target — risk of broken asset paths if domain changes.

## 4. Code-quality & maintainability notes
- `any` used in several places (e.g., `mainTabs`, invite handlers, `AppRoutes` props) — weakens type safety.
- Inline SVG mascot loader in `App.tsx` makes the file bulky; extract to a component.
- Battle invite logic (45s countdown, RTDB listeners) is complex and embedded in layout — extract to a hook/`BattleInvite` component.
- Large `QuestionBank.tsx.txt` (41KB) and `App.tsx` (49KB) suggest oversized single files.
- No CI test gate; reliance on `tsc` + lint only.

## 5. Performance / UX
- Lazy loading + Suspense good. But Gemini calls are synchronous-looking awaits with no caching layer beyond `CacheContext`; repeated AI generation costs latency + quota.
- `motion` + `three` + `d3` + `recharts` + `lottie` is a lot of animation weight; verify tree-shaking/usage to keep bundle reasonable.

## 6. Recommended next steps (not yet implemented)
1. **Revoke & remove** the 3 leaked Gemini keys; route all AI calls through a server proxy. (P0)
2. **Tighten Firestore rules**: remove open catch-all read; scope `study_groups`/`battle_rooms`/`telegramVerifications` writes to owners/admins; add rate-limit/validation on guest collections. (P0)
3. **Extract** routing/layout/invite logic out of `App.tsx` into `routes.tsx`, `MainLayout`, `useBattleInvite`. (P1)
4. **Add App Check** + environment-based `API_BASE`; centralize data access in `services/`. (P1)
5. **Resolve deployment target** (custom domain vs GitHub Pages) and align `vite.config` base + docs. (P1)
6. **Add tests** (Vitest) for `geminiService` JSON parsing, `normalization`, and key components; keep strict lint. (P2)
7. **Audit bundle** for unused 3D/chart deps. (P2)

## 7. Open questions for the owner
- Is there a backend proxy already (Render `/api`) that can hold the Gemini key? If yes, point `geminiService` at it.
- Is `porikkhangon.app` the real domain (needs `base: '/'` not `/Ed-Tech/`)?
- Are the 3 hardcoded keys still active/owned by you — should they be revoked immediately?
