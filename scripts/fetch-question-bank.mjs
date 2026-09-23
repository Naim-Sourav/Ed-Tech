#!/usr/bin/env node
/**
 * fetch-question-bank.mjs
 * ---------------------------------------------------------------------------
 * Downloads the ENTIRE question bank from the backend API into a local
 * newline-delimited JSON file (NDJSON, one question per line) so it can be
 * audited / cleaned offline without hammering the API repeatedly.
 *
 * Why NDJSON: 50k+ questions never have to be fully parsed into memory at once
 * and the file can be streamed line-by-line by the audit tool.
 *
 * Usage:
 *   node scripts/fetch-question-bank.mjs                       # defaults below
 *   node scripts/fetch-question-bank.mjs --out exports/qb.ndjson
 *   node scripts/fetch-question-bank.mjs --limit 500 --max-pages 2
 *   node scripts/fetch-question-bank.mjs --api https://other.host/api
 *
 * Options:
 *   --api <url>        API base (default: $API_BASE or the production backend)
 *   --out <file>       Output NDJSON path (default: exports/question-bank.ndjson)
 *   --limit <n>        Questions per request (default 2000 — API max is generous)
 *   --max-pages <n>    Safety cap on number of requests (default 100)
 *   --concurrency <n>  Parallel page requests (default 2 — be nice to the API)
 *   --timeout <ms>     Per request timeout (default 90000 — Render cold starts)
 *   --retries <n>      Retries per page (default 4, exponential backoff)
 *   --filter <query>   Extra query string appended to every request
 *                      e.g. --filter "subject=Biology 1st Paper"
 */

import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const DEFAULT_API = process.env.API_BASE || 'https://mongodb-hb6b.onrender.com/api';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};

const API = arg('api', DEFAULT_API).replace(/\/+$/, '');
const OUT = resolve(arg('out', 'exports/question-bank.ndjson'));
const LIMIT = Number(arg('limit', 2000));
const MAX_PAGES = Number(arg('max-pages', 100));
const CONCURRENCY = Number(arg('concurrency', 2));
const TIMEOUT = Number(arg('timeout', 90000));
const RETRIES = Number(arg('retries', 4));
const FILTER = arg('filter', '');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url) {
  let lastErr;
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);
    try {
      const res = await fetch(url, { signal: controller.signal, headers: { accept: 'application/json' } });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        throw new Error(`Invalid JSON (first 120 chars): ${text.slice(0, 120)}`);
      }
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      if (attempt < RETRIES) {
        const backoff = Math.min(30000, 2000 * 2 ** (attempt - 1));
        console.error(`  ! ${url} failed (${err.message}) — retry ${attempt}/${RETRIES - 1} in ${backoff / 1000}s`);
        await sleep(backoff);
      }
    }
  }
  throw lastErr;
}

const pageUrl = (page) => {
  const qs = [`page=${page}`, `limit=${LIMIT}`];
  if (FILTER) qs.push(FILTER.replace(/^\?/, ''));
  return `${API}/admin/questions?${qs.join('&')}`;
};

const normalizeRow = (q) => (q && typeof q === 'object' ? { ...q, _id: q._id || q.id } : q);

async function main() {
  console.log(`API        : ${API}`);
  console.log(`Output     : ${OUT}`);
  console.log(`Page size  : ${LIMIT} (concurrency ${CONCURRENCY})`);
  if (FILTER) console.log(`Filter     : ${FILTER}`);

  const first = await getJson(pageUrl(1));
  const total = Number(first.total ?? (first.questions || []).length);
  const firstBatch = (first.questions || []).map(normalizeRow);
  const pages = Math.min(MAX_PAGES, Math.max(1, Math.ceil(total / LIMIT)));

  console.log(`Total      : ${total} questions across ~${pages} page(s)`);

  const all = [...firstBatch];
  const seenIds = new Set(firstBatch.map((q) => q._id));
  const seenPages = new Set([1]);

  let nextPage = 2;
  const worker = async () => {
    while (nextPage <= pages) {
      const page = nextPage++;
      if (seenPages.has(page)) continue;
      seenPages.add(page);
      try {
        const data = await getJson(pageUrl(page));
        const batch = (data.questions || []).map(normalizeRow);
        for (const q of batch) {
          if (q._id && seenIds.has(q._id)) continue;
          if (q._id) seenIds.add(q._id);
          all.push(q);
        }
        console.log(`  page ${page}/${pages}: +${batch.length} (total ${all.length})`);
      } catch (err) {
        console.error(`  page ${page} permanently failed: ${err.message}`);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, CONCURRENCY) }, worker));

  mkdirSync(dirname(OUT), { recursive: true });
  // A previous run may already hold data (e.g. a partial run) — keep everything.
  if (existsSync(OUT)) {
    for (const line of readFileSync(OUT, 'utf8').split('\n')) {
      if (!line.trim()) continue;
      try {
        const q = JSON.parse(line);
        if (q._id && seenIds.has(q._id)) continue;
        if (q._id) seenIds.add(q._id);
        all.push(q);
      } catch {
        /* ignore malformed lines */
      }
    }
  }
  writeFileSync(OUT, all.map((q) => JSON.stringify(q)).join('\n') + '\n');
  console.log(`\n✅ Saved ${all.length} unique questions → ${OUT} (API reported total ${total})`);
}

main().catch((err) => {
  console.error('❌ Fatal:', err);
  process.exit(1);
});
