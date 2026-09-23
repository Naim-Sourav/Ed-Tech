#!/usr/bin/env node
/**
 * question-bank-fix.mjs
 * ---------------------------------------------------------------------------
 * Applies the fix plan produced by `scripts/question-bank-audit.mjs`:
 *
 *   • updates  → re-reads each question from the API, re-cleans it with
 *                utils/questionQuality.ts and PUTs the fixed document back
 *   • merges   → unions tags/exam refs, keeps the richest copy with the best
 *                explanation, then DELETEs the redundant copies
 *
 * Safety:
 *   • dry-run by default — nothing is written unless `--apply` is passed
 *   • every write is re-derived from the *current* server document, so a stale
 *     export can never resurrect old values
 *   • stops immediately if the token is rejected, and prints a summary of any
 *     per-question failure without dying mid-run
 *
 * Usage:
 *   node scripts/question-bank-fix.mjs --plan exports/fix-plan.json            # dry run
 *   ADMIN_TOKEN="<firebase-id-token>" node scripts/question-bank-fix.mjs --plan exports/fix-plan.json --apply
 *   node scripts/question-bank-fix.mjs --plan exports/fix-plan.json --apply --mongo "mongodb+srv://…"
 *
 * Options:
 *   --plan <file>     fix plan (default exports/fix-plan.json)
 *   --api <url>       API base (default $API_BASE or the production backend)
 *   --token <token>   admin Firebase ID token (or $ADMIN_TOKEN)
 *   --mongo <uri>     write straight to MongoDB instead of the API
 *                      (needs `npm install mongodb`)
 *   --apply           actually write (otherwise dry-run)
 *   --only <what>     updates | merges
 *   --limit <n>       process at most n operations
 *   --delay <ms>      pause between writes (default 120)
 *   --report <file>   where to write the run report (default exports/fix-report.json)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadQuestionQuality } from './lib/load-quality.mjs';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : fallback;
};
const flag = (name) => process.argv.includes(`--${name}`);

const PLAN_PATH = resolve(arg('plan', join(ROOT, 'exports/fix-plan.json')));
const REPORT_PATH = resolve(arg('report', join(ROOT, 'exports/fix-report.json')));
const API = arg('api', process.env.API_BASE || 'https://mongodb-hb6b.onrender.com/api').replace(/\/+$/, '');
const TOKEN = arg('token', process.env.ADMIN_TOKEN || '');
const MONGO = arg('mongo', process.env.MONGODB_URI || '');
const APPLY = flag('apply');
const ONLY = arg('only', '');
const LIMIT = Number(arg('limit', 0)) || Infinity;
const DELAY = Number(arg('delay', 120));

const Q = await loadQuestionQuality();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!existsSync(PLAN_PATH)) {
  console.error(`❌ Fix plan not found: ${PLAN_PATH}`);
  console.error('   Create it first:  node scripts/question-bank-audit.mjs --out exports');
  process.exit(1);
}
const plan = JSON.parse(readFileSync(PLAN_PATH, 'utf8'));
const updates = ONLY === 'merges' ? [] : plan.updates || [];
const merges = ONLY === 'updates' ? [] : plan.merges || [];

console.log('');
console.log('Fix plan');
console.log('────────');
console.log(`  generated : ${plan.generatedAt}`);
console.log(`  source    : ${plan.source}`);
console.log(`  updates   : ${updates.length}   (questions with field fixes)`);
console.log(`  merges    : ${merges.length}   (duplicate groups)`);
console.log(`  deletes   : ${merges.reduce((n, m) => n + (m.deleteIds || []).length, 0)}`);
console.log(`  mode      : ${APPLY ? 'APPLY (writes!)' : 'dry run'}`);
console.log(`  target    : ${MONGO ? 'MongoDB (direct)' : API}`);
console.log('');

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------
const headers = () => ({
  'Content-Type': 'application/json',
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
});

async function api(method, path, body, { retries = 3 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${API}${path}`, {
        method,
        headers: headers(),
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(60000),
      });
      if (res.status === 401 || res.status === 403) {
        const error = new Error(`Unauthorized (${res.status}) — the admin token is missing/expired`);
        error.fatal = true;
        throw error;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status} ${method} ${path}`);
      const text = await res.text();
      if (!text) return {};
      try {
        return JSON.parse(text);
      } catch {
        return { raw: text };
      }
    } catch (err) {
      lastError = err;
      if (err.fatal) throw err;
      if (attempt < retries) await sleep(1000 * attempt);
    }
  }
  throw lastError;
}

const unwrapQuestion = (payload) => payload?.question || payload?.data || payload;

// ---------------------------------------------------------------------------
// MongoDB helpers (optional path)
// ---------------------------------------------------------------------------
let mongo = null;
if (MONGO) {
  try {
    const { MongoClient, ObjectId } = await import('mongodb');
    const client = new MongoClient(MONGO);
    await client.connect();
    const db = client.db();
    const collection = db.collection('questions');
    const toId = (id) => {
      try {
        return ObjectId.isValid(String(id)) ? new ObjectId(String(id)) : String(id);
      } catch {
        return String(id);
      }
    };
    mongo = {
      async get(id) {
        return collection.findOne({ _id: toId(id) });
      },
      async replace(doc) {
        const { _id, __v, ...rest } = doc;
        await collection.updateOne({ _id: toId(_id) }, { $set: rest });
      },
      async remove(id) {
        await collection.deleteOne({ _id: toId(id) });
      },
      async close() {
        await client.close();
      },
    };
    console.log(`✓ Connected to MongoDB (collection: questions)`);
    console.log('');
  } catch (err) {
    console.error(`❌ --mongo requested but the MongoDB driver is unavailable: ${err.message}`);
    console.error('   Run: npm install mongodb');
    process.exit(1);
  }
}

const getQuestion = async (id) => (mongo ? mongo.get(id) : unwrapQuestion(await api('GET', `/admin/questions/${id}`)));
const putQuestion = async (id, doc) => (mongo ? mongo.replace(doc) : api('PUT', `/admin/questions/${id}`, doc));
const deleteQuestion = async (id) => (mongo ? mongo.remove(id) : api('DELETE', `/admin/questions/${id}`));

// ---------------------------------------------------------------------------
// Preflight: is the token actually accepted?
// ---------------------------------------------------------------------------
if (APPLY && !mongo) {
  if (!TOKEN) {
    console.error('❌ --apply needs an admin token:  ADMIN_TOKEN="<firebase-id-token>" node scripts/question-bank-fix.mjs --apply');
    process.exit(1);
  }
  try {
    await api('GET', '/admin/questions?page=1&limit=1');
    console.log('✓ Token accepted by the backend');
  } catch (err) {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  }
  console.log('');
}

// ---------------------------------------------------------------------------
// Apply
// ---------------------------------------------------------------------------
const report = { startedAt: new Date().toISOString(), mode: APPLY ? 'apply' : 'dry-run', plans: plan.stats, updated: 0, merged: 0, deleted: 0, skipped: 0, failures: [] };
let operations = 0;

const budgetLeft = () => operations < LIMIT;

for (const entry of updates) {
  if (!budgetLeft()) break;
  operations++;
  const id = entry._id;
  if (!id) {
    report.skipped++;
    continue;
  }
  try {
    const fresh = await getQuestion(id);
    if (!fresh || !fresh.question) {
      report.skipped++;
      continue;
    }
    const { patch } = Q.fixQuestion(fresh);
    if (!Object.keys(patch).length) {
      report.skipped++;
      continue; // already clean since the audit ran
    }
    if (APPLY) {
      await putQuestion(id, { ...fresh, ...patch });
      await sleep(DELAY);
    }
    report.updated++;
    if (report.updated <= 5 || report.updated % 100 === 0) {
      console.log(`  ${APPLY ? '✔' : '·'} update ${id}: ${Object.keys(patch).join(', ')}`);
    }
  } catch (err) {
    if (err.fatal) {
      console.error(`\n❌ ${err.message}`);
      break;
    }
    report.failures.push({ kind: 'update', id, error: err.message });
  }
}

for (const merge of merges) {
  if (!budgetLeft()) break;
  operations++;
  const keepId = merge.keepId;
  const deleteIds = (merge.deleteIds || []).filter(Boolean);
  if (!keepId || !deleteIds.length) {
    report.skipped++;
    continue;
  }
  try {
    const docs = [];
    for (const id of [keepId, ...deleteIds]) {
      const doc = await getQuestion(id);
      if (doc && doc.question) docs.push(doc);
    }
    if (docs.length < 2) {
      report.skipped++;
      continue;
    }
    const result = Q.mergeDuplicateQuestions(docs);
    if (APPLY) {
      const target = docs.find((d) => String(d._id) === String(keepId)) || docs[0];
      await putQuestion(target._id, { ...target, ...result.merged });
      for (const doc of docs) {
        if (String(doc._id) === String(target._id)) continue;
        await deleteQuestion(doc._id);
        report.deleted++;
        await sleep(DELAY);
      }
      await sleep(DELAY);
    } else {
      report.deleted += docs.length - 1;
    }
    report.merged++;
    if (report.merged <= 5 || report.merged % 50 === 0) {
      console.log(`  ${APPLY ? '✔' : '·'} merge → keep ${keepId}, remove ${docs.length - 1} copy(ies)`);
    }
  } catch (err) {
    if (err.fatal) {
      console.error(`\n❌ ${err.message}`);
      break;
    }
    report.failures.push({ kind: 'merge', id: keepId, error: err.message });
  }
}

if (mongo) await mongo.close();

report.finishedAt = new Date().toISOString();

console.log('');
console.log('── Result ───────────────────────────────────────────────────');
console.log(`  questions updated : ${report.updated}`);
console.log(`  duplicate groups  : ${report.merged}`);
console.log(`  copies deleted    : ${report.deleted}`);
console.log(`  skipped (clean)   : ${report.skipped}`);
console.log(`  failures          : ${report.failures.length}`);
console.log('─────────────────────────────────────────────────────────────');
if (!APPLY) console.log('Dry run — nothing was written. Re-run with --apply to write.');

mkdirSync(dirname(REPORT_PATH), { recursive: true });
writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
console.log(`📄 ${REPORT_PATH}`);
