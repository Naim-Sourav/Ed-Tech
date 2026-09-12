# নিরাপত্তা নির্দেশিকা (Security Guide)

এই ফাইলে P0 নিরাপত্তা ফিক্সগুলোর পরে **আপনাকে যা যা করতে হবে** তার চেকলিস্ট আছে।
কোড-লেভেল ফিক্স এই রিপোতে করা হয়েছে; নিচের ধাপগুলো Firebase Console / Google Cloud /
backend সার্ভারে করতে হবে।

---

## 🔴 ধাপ ১ — ফাঁস হওয়া Gemini API Key বাতিল করুন (আজই, সবচেয়ে জরুরি)

আগে `services/geminiService.ts`-এ ৩টি আসল API Key হার্ডকোড করা ছিল। কোড থেকে সরানো
হয়েছে, কিন্তু **git history-তে এখনো আছে** — যে কেউ পুরনো commit দেখে Key পেতে পারে।
তাই Key গুলো বাতিল (revoke) করতেই হবে:

1. https://aistudio.google.com/app/apikey → পুরনো ৩টি Key **Delete** করুন।
2. (বিকল্প) https://console.cloud.google.com/apis/credentials → Key ডিলিট করুন।
3. নতুন **একটি** Key বানিয়ে Vercel/GitHub Secrets-এ `VITE_GEMINI_API_KEY` নামে বসান।
   - GitHub Actions deploy: Repo → Settings → Secrets → `VITE_GEMINI_API_KEY`
     (workflow-তে `VITE_API_KEY` নামেও কাজ করবে — দুটোই সাপোর্টেড)।
4. (ঐচ্ছিক কিন্তু ভালো) Google Cloud Console → Credentials → নতুন Key-তে
   **Application restrictions → HTTP referrers** দিয়ে শুধু
   `https://www.porikkhangon.app/*` allow করুন। এতে চুরি হলেও অন্য সাইট থেকে
   ব্যবহার করা যাবে না।

> লোকাল ডেভেলপমেন্টের জন্য `.env.example` দেখে `.env.local` বানান।
> `.env.local` git-এ যাবে না (`.gitignore`-তে আছে)।

---

## 🔴 ধাপ ২ — Firebase Rules ডিপ্লয় করুন

নতুন শক্তিশালী রুলস (`firestore.rules`, `database.rules.json`) এখনো শুধু এই রিপোতে
আছে — Firebase-এ ডিপ্লয় না করা পর্যন্ত কার্যকর হবে না:

```bash
npm install -g firebase-tools
firebase login
firebase use dopamine-quiz          # আপনার project id
firebase deploy --only firestore:rules,database
```

ডিপ্লয়ের পর Firebase Console → Firestore → Rules ট্যাবে নতুন রুলস দেখা যাবে।
প্রথমে **একটা guest exam + একটা battle + admin login** টেস্ট করে নিন।

### Admin ইমেইল তালিকা

দুই জায়গায় একই তালিকা রাখতে হবে (এখন দুই ইমেইল আছে):

| জায়গা | ফাইল |
|---|---|
| Frontend UI gating | `utils/adminConfig.ts` → `ADMIN_EMAILS` |
| Firestore | `firestore.rules` → `isAdmin()` |

যেটা প্রয়োজন নেই সেটা **দুটো জায়গা থেকেই** মুছে দিন।

### `/admins` কালেকশন বুটস্ট্র্যাপ (ঐচ্ছিক)

আগের রুলসে যেকোনো ইউজার নিজেকে `/admins/{uid}` ডক বানিয়ে admin হয়ে যেতে পারত —
সেটা বন্ধ করা হয়েছে। এখন নতুন admin যোগ করতে: Firebase Console → Firestore →
`admins` কালেকশনে `{uid: <user-uid>}` ডকুমেন্ট হাতে বানান (অথবা ইমেইল-লিস্টই যথেষ্ট)।

---

## 🟠 ধাপ ৩ — Backend-এ (Render সার্ভার) যা করতে হবে

Frontend এখন প্রতিটি API কলে `Authorization: Bearer <Firebase ID token>` হেডার
পাঠায় (`services/api.ts` → `authedFetch`)। কিন্তু backend যাচাই না করলে এর কোনো
মানে নেই। Backend রিপোতে (Node/Express ধরে নিয়ে) এই ৩টা কাজ করুন:

### ৩.১. সব রিকোয়েস্টে token যাচাই

```js
// middleware/verifyToken.js
const admin = require('firebase-admin');
admin.initializeApp({ /* service account */ });

async function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing auth token' });
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.auth = decoded; // { uid, email, ... } — TRUSTED
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid auth token' });
  }
}
```

### ৩.২. userId আর body/URL থেকে বিশ্বাস করবেন না

```js
// ❌ ভুল: /users/:userId/... — :userId যে কেউ বদলে দিতে পারে
// ✅ ঠিক:
app.get('/api/users/:userId/stats', verifyToken, (req, res) => {
  if (req.params.userId !== req.auth.uid && !isAdmin(req.auth)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  // ... আসল কাজ
});
```

একই নিয়ম: `/users/:userId/mistakes`, `/saved-questions`, `/exam-results`,
`/quests/*` — সব জায়গায় `req.auth.uid`-এর সাথে মিলিয়ে নিন।

### ৩.৩. `/admin/*` এ admin middleware

```js
const ADMIN_EMAILS = ['nurnaimsourav@gmail.com', 'tasnimahmedutsha600@gmail.com'];
function requireAdmin(req, res, next) {
  if (req.auth.admin === true || ADMIN_EMAILS.includes(req.auth.email)) return next();
  return res.status(403).json({ error: 'Admin only' });
}
app.use('/api/admin', verifyToken, requireAdmin);
```

### ৩.৪. (ভবিষ্যতে) AI প্রক্সি এন্ডপয়েন্ট

এখনো Gemini Key ব্রাউজার বান্ডলে যায় (Vite-র `VITE_*` public হয় — এটা এড়ানো
যায় না)। স্থায়ী সমাধান: backend-এ `/api/ai/*` প্রক্সি বানিয়ে Key সার্ভারে রাখুন,
rate-limit দিন, আর frontend-এ শুধু প্রক্সি কল করুন। তখন referrer restriction-ও
আর দরকার হবে না।

### ৩.৫. (ভবিষ্যতে) সার্ভার-সাইড স্কোরিং

Battle (`submitBattleAnswer`) ও exam ফলাফল এখন ক্লায়েন্টের হিসাব বিশ্বাস করে।
প্রতিযোগিতামূলক leaderboard-এর জন্য: ক্লায়েন্ট শুধু `answers` পাঠাবে, সার্ভার
সঠিক উত্তর মিলিয়ে স্কোর হিসাব করবে।

---

## ✅ এই রিপোতে যা ঠিক করা হয়েছে (সারাংশ)

| # | সমস্যা | ফিক্স |
|---|---|---|
| ১ | Gemini Key হার্ডকোডেড | Key মুছে env-only + কেন্দ্রীয় `getGeminiApiKey()`; `.env.example` যোগ |
| ২ | Backend-এ auth নেই | সব API কলে Firebase ID token (`authedFetch`) |
| ৩ | Admin চেক শুধু UI-তে, দুই জায়গায় দুই ইমেইল | `utils/adminConfig.ts`-এ এক তালিকা; Firestore-এ একই তালিকা |
| ৪ | Firestore: সবার প্রোফাইল/attempts পড়া যেত, `/test` খোলা, `/admins` self-escalation, exams যে কেউ বানাতে পারত | `firestore.rules` পুনর্লিখন: owner/admin-only read, `/test` মুছে ফেলা, exams admin-only, guest writes-এ validation |
| ৫ | `dangerouslySetInnerHTML` দিয়ে XSS ঝুঁকি (৩২ জায়গা) | DOMPurify + `SafeHtml` কম্পোনেন্ট; সব ব্যবহার রূপান্তরিত |
| ৬ | RTDB battles/invites-এ যেকোনো auth ইউজার লিখতে পারত; পাবলিক leaderboard-এ guest e-mail | `database.rules.json` শক্ত (participant-only writes + validation); leaderboard থেকে e-mail সরানো |

## ⚠️ অবশিষ্ট ঝুঁকি (জেনে রাখুন)

- **Battle স্কোর জালিয়াতি (participant দ্বারা):** একই রুমের খেলোয়াড় এখনো নিজের
  স্কোর বদলাতে পারে — পুরো সমাধান ৩.৫ (সার্ভার-সাইড স্কোরিং)।
- **Guest leaderboard স্প্যাম:** validation আছে (টাইপ/সীমা), কিন্তু rate-limit নেই —
  backend প্রক্সি বা App Check যোগ করলে পুরোপুরি বন্ধ হবে।
- **Git history-তে পুরনো Key:** ধাপ ১ না করা পর্যন্ত ঝুঁকি থাকবে।
