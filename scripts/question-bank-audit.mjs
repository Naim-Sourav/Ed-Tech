#!/usr/bin/env node
/**
 * question-bank-audit.mjs
 * ---------------------------------------------------------------------------
 * Reads the question bank (NDJSON / JSON export, or straight from the API) and
 * produces:
 *
 *   audit-report.md   human readable findings (also usable as a GH job summary)
 *   audit-report.json machine readable findings
 *   fix-plan.json     every automatic fix: field patches + duplicate merges
 *
 * The checks live in `utils/questionQuality.ts` (same code the app uses), so the
 * CLI and the UI never disagree about what "clean" means.
 *
 * Usage:
 *   node scripts/question-bank-audit.mjs                       # reads exports/question-bank.ndjson
 *   node scripts/question-bank-audit.mjs --file data/med.json
 *   node scripts/question-bank-audit.mjs --api                 # download first, then audit
 *   node scripts/question-bank-audit.mjs --out exports --sample 8 --no-fuzzy
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { loadQuestionQuality } from './lib/load-quality.mjs';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : fallback;
};
const flag = (name) => process.argv.includes(`--${name}`);

const FILE = resolve(arg('file', join(ROOT, 'exports/question-bank.ndjson')));
const OUT_DIR = resolve(arg('out', join(ROOT, 'exports')));
const REPORT_PATH = resolve(arg('report', join(OUT_DIR, 'audit-report.md')));
const JSON_PATH = resolve(arg('json', join(OUT_DIR, 'audit-report.json')));
const PLAN_PATH = resolve(arg('plan', join(OUT_DIR, 'fix-plan.json')));
const SAMPLE = Number(arg('sample', 5));
const USE_FUZZY = !flag('no-fuzzy');
const FROM_API = flag('api');
const API = arg('api', process.env.API_BASE || 'https://mongodb-hb6b.onrender.com/api');

// ---------------------------------------------------------------------------
// 1. Load the shared quality module (the same file the app imports)
// ---------------------------------------------------------------------------
const Q = await loadQuestionQuality();

// ---------------------------------------------------------------------------
// 2. Read the bank
// ---------------------------------------------------------------------------
function loadQuestions(path) {
  if (!existsSync(path)) {
    console.error(`❌ Question file not found: ${path}`);
    console.error('   Run: node scripts/fetch-question-bank.mjs');
    process.exit(1);
  }
  const raw = readFileSync(path, 'utf8');
  const trimmed = raw.trim();
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
      for (const key of ['questions', 'data', 'docs', 'items']) {
        if (Array.isArray(parsed[key])) return parsed[key];
      }
    } catch {
      /* fall through to NDJSON parsing */
    }
  }
  const out = [];
  for (const line of trimmed.split('\n')) {
    if (!line.trim()) continue;
    try {
      out.push(JSON.parse(line));
    } catch {
      /* skip malformed line */
    }
  }
  return out;
}

if (FROM_API) {
  console.log(`↓ Downloading the bank from ${API} …`);
  execFileSync(process.execPath, [join(ROOT, 'scripts', 'fetch-question-bank.mjs'), '--api', API, '--out', FILE], {
    stdio: 'inherit',
  });
}

const questions = loadQuestions(FILE);
if (!questions.length) {
  console.error('❌ No questions loaded.');
  process.exit(1);
}
console.log(`✓ Loaded ${questions.length} questions from ${FILE}`);

// ---------------------------------------------------------------------------
// 3. Per-question analysis
// ---------------------------------------------------------------------------
const issueCounts = new Map();
const examples = new Map();
const explanationIssueCounts = new Map();
const explanationExamples = new Map();
const updates = [];
const unreviewed = [];

const addIssue = (code, q, detail) => {
  issueCounts.set(code, (issueCounts.get(code) || 0) + 1);
  const list = examples.get(code) || [];
  if (list.length < SAMPLE) {
    list.push({
      _id: q._id || q.id,
      subject: q.subject,
      chapter: q.chapter,
      question: String(q.question || '').slice(0, 160),
      detail,
    });
  }
  examples.set(code, list);
};

const addExplanationIssue = (code, q, detail) => {
  explanationIssueCounts.set(code, (explanationIssueCounts.get(code) || 0) + 1);
  const list = explanationExamples.get(code) || [];
  if (list.length < SAMPLE) {
    list.push({
      _id: q._id || q.id,
      before: String(q.explanation || '').slice(0, 300),
      after: detail?.after ? String(detail.after).slice(0, 300) : undefined,
    });
  }
  explanationExamples.set(code, list);
};

let withoutExplanation = 0;

for (const q of questions) {
  const { patch, issues, explanationIssues } = Q.fixQuestion(q);
  for (const issue of issues) addIssue(issue.code, q, issue.detail);
  for (const e of explanationIssues) addExplanationIssue(e.code, q, { after: patch.explanation });
  if (!String(q.explanation || '').trim() && !String(q.explanationImage || '').trim()) withoutExplanation++;

  if (Object.keys(patch).length) {
    updates.push({
      _id: q._id || q.id,
      subject: q.subject,
      chapter: q.chapter,
      reasons: [...new Set([...issues.map((i) => i.code), ...explanationIssues.map((i) => i.code)])],
      patch,
    });
  }
  const blocking = issues.filter((i) =>
    ['question-empty', 'options-count', 'option-empty', 'answer-out-of-range', 'answer-missing', 'mojibake'].includes(
      i.code,
    ),
  );
  if (blocking.length) {
    unreviewed.push({
      _id: q._id || q.id,
      question: String(q.question || '').slice(0, 200),
      blocking: blocking.map((i) => `${i.code}${i.detail ? ` (${i.detail})` : ''}`),
    });
  }
}

// ---------------------------------------------------------------------------
// 4. Duplicates
// ---------------------------------------------------------------------------
const dupGroups = Q.findDuplicateGroups(questions, { fuzzy: USE_FUZZY });
const merges = dupGroups.map((group) => {
  const result = Q.mergeDuplicateQuestions(group);
  return {
    keepId: result.keepId,
    deleteIds: result.deleteIds,
    size: group.length,
    question: String(group[0].question || '').slice(0, 200),
    subject: group[0].subject,
    chapter: group[0].chapter,
    explanationsMerged: group.filter((g) => String(g.explanation || '').trim()).length,
    merged: {
      explanation: result.merged.explanation,
      tags: result.merged.tags,
      examRef: result.merged.examRef,
      correctAnswerIndex: result.merged.correctAnswerIndex,
    },
  };
});
const duplicatesToDelete = merges.reduce((sum, m) => sum + m.deleteIds.length, 0);

// Cross-chapter copies: identical question filed under different chapters.
// These are NOT auto-merged (each chapter legitimately lists its own items) but
// they are reported so a human can decide.
const fingerprintMap = new Map();
for (const q of questions) {
  const fp = Q.questionFingerprint(q);
  if (!fp || fp === '##') continue;
  const list = fingerprintMap.get(fp);
  if (list) list.push(q);
  else fingerprintMap.set(fp, [q]);
}
const crossChapter = [];
for (const list of fingerprintMap.values()) {
  if (list.length < 2) continue;
  const places = new Set(list.map((q) => `${q.subject ?? ''}//${q.chapter ?? ''}`));
  if (places.size < 2) continue;
  crossChapter.push({
    question: String(list[0].question || '').slice(0, 160),
    places: [...places],
    copies: list.map((q) => q._id || q.id),
  });
}

// ---------------------------------------------------------------------------
// 5. Bank-wide inconsistencies
// ---------------------------------------------------------------------------
const valueVariants = (field) => {
  const map = new Map();
  for (const q of questions) {
    const raw = String(q[field] ?? '').trim();
    if (!raw) continue;
    const key = Q.comparisonKey(raw);
    if (!map.has(key)) map.set(key, new Map());
    const variants = map.get(key);
    variants.set(raw, (variants.get(raw) || 0) + 1);
  }
  return [...map.entries()]
    .filter(([, variants]) => variants.size > 1)
    .map(([key, variants]) => ({ normalized: key, variants: [...variants.entries()].sort((a, b) => b[1] - a[1]) }));
};

const subjectVariants = valueVariants('subject');
const chapterVariants = valueVariants('chapter');

// duplicate slugs (breaks /q/<slug>/ SEO pages)
const slugCounts = new Map();
for (const q of questions) {
  const slug = String(q.slug || '').trim();
  if (!slug) continue;
  slugCounts.set(slug, (slugCounts.get(slug) || 0) + 1);
}
const duplicateSlugs = [...slugCounts.entries()].filter(([, count]) => count > 1).sort((a, b) => b[1] - a[1]);

const bySubject = new Map();
for (const q of questions) {
  const key = String(q.subject || '(none)');
  bySubject.set(key, (bySubject.get(key) || 0) + 1);
}

// ---------------------------------------------------------------------------
// 6. Write the artefacts
// ---------------------------------------------------------------------------
mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(dirname(REPORT_PATH), { recursive: true });
mkdirSync(dirname(JSON_PATH), { recursive: true });
mkdirSync(dirname(PLAN_PATH), { recursive: true });

const plan = {
  generatedAt: new Date().toISOString(),
  source: FILE,
  options: { fuzzy: USE_FUZZY },
  stats: {
    totalQuestions: questions.length,
    questionsNeedingUpdate: updates.length,
    duplicateGroups: merges.length,
    duplicateQuestionsToDelete: duplicatesToDelete,
    questionsWithoutExplanation: withoutExplanation,
    questionsNeedingManualReview: unreviewed.length,
  },
  updates,
  merges,
  manualReview: unreviewed,
};

writeFileSync(PLAN_PATH, JSON.stringify(plan, null, 2));
writeFileSync(
  JSON_PATH,
  JSON.stringify(
    {
      ...plan.stats,
      issueCounts: Object.fromEntries([...issueCounts.entries()].sort((a, b) => b[1] - a[1])),
      explanationIssueCounts: Object.fromEntries([...explanationIssueCounts.entries()].sort((a, b) => b[1] - a[1])),
      subjectVariants,
      chapterVariants,
      duplicateSlugs: duplicateSlugs.slice(0, 50),
      crossChapterDuplicates: crossChapter.slice(0, 100),
      bySubject: Object.fromEntries([...bySubject.entries()].sort((a, b) => b[1] - a[1])),
      examples: Object.fromEntries(examples),
      explanationExamples: Object.fromEntries(explanationExamples),
    },
    null,
    2,
  ),
);

const pct = (n) => `${((n / questions.length) * 100).toFixed(1)}%`;
const lines = [];
lines.push('# Question-bank quality audit');
lines.push('');
lines.push(`- Generated: ${new Date().toISOString()}`);
lines.push(`- Source: \`${FILE}\``);
lines.push(`- Questions analysed: **${questions.length}**`);
lines.push(`- Fuzzy duplicate matching: ${USE_FUZZY ? 'on' : 'off'}`);
lines.push('');
lines.push('## Summary');
lines.push('');
lines.push('| Metric | Count |');
lines.push('|---|---|');
lines.push(`| Questions needing a field fix | ${updates.length} (${pct(updates.length)}) |`);
lines.push(`| Duplicate groups | ${merges.length} |`);
lines.push(`| Redundant copies to remove | ${duplicatesToDelete} |`);
lines.push(`| Questions with no explanation at all | ${withoutExplanation} (${pct(withoutExplanation)}) |`);
lines.push(`| Questions flagged for manual review | ${unreviewed.length} |`);
lines.push('');
lines.push('## Issues found');
lines.push('');
lines.push('| Code | Occurrences | Share |');
lines.push('|---|---|---|');
for (const [code, count] of [...issueCounts.entries()].sort((a, b) => b[1] - a[1])) {
  lines.push(`| \`${code}\` | ${count} | ${pct(count)} |`);
}
lines.push('');
lines.push('## Explanation problems');
lines.push('');
if (!explanationIssueCounts.size) lines.push('_None found._');
else {
  lines.push('| Code | Occurrences | Share |');
  lines.push('|---|---|---|');
  for (const [code, count] of [...explanationIssueCounts.entries()].sort((a, b) => b[1] - a[1])) {
    lines.push(`| \`${code}\` | ${count} | ${pct(count)} |`);
  }
  for (const [code, list] of explanationExamples) {
    lines.push('');
    lines.push(`### \`${code}\` — examples`);
    for (const ex of list) {
      lines.push('');
      lines.push(`**before** (\`${ex._id}\`):`);
      lines.push('```');
      lines.push(ex.before || '(empty)');
      lines.push('```');
      if (ex.after !== undefined) {
        lines.push('**after cleaning**:');
        lines.push('```');
        lines.push(ex.after || '(empty)');
        lines.push('```');
      }
    }
  }
}
lines.push('');
lines.push('## Top duplicates');
lines.push('');
if (!merges.length) lines.push('_No duplicates found._');
else {
  lines.push('| Copies | Keep | Delete | Question |');
  lines.push('|---|---|---|---|');
  for (const m of merges.slice(0, 20)) {
    lines.push(
      `| ${m.size} | \`${m.keepId}\` | ${m.deleteIds.map((d) => `\`${d}\``).join(' ')} | ${String(m.question).replace(/\|/g, '\\|').slice(0, 90)} |`,
    );
  }
}
lines.push('');
lines.push('## Subject / chapter spelling variants');
lines.push('');
lines.push(`- Subjects stored under more than one spelling: **${subjectVariants.length}**`);
lines.push(`- Chapters stored under more than one spelling: **${chapterVariants.length}**`);
if (chapterVariants.length) {
  lines.push('');
  lines.push('| Canonical | Variants (count) |');
  lines.push('|---|---|');
  for (const v of chapterVariants.slice(0, 15)) {
    lines.push(`| ${v.normalized} | ${v.variants.map(([text, n]) => `\`${text}\` (${n})`).join(' / ')} |`);
  }
}
lines.push('');
lines.push('## Same question filed under different chapters');
lines.push('');
lines.push(`Found **${crossChapter.length}** questions whose wording + options appear under more than one subject/chapter. These are left for a human to decide (a copy in two chapters may be intentional), but they are the usual cause of "I saw this question twice".`);
if (crossChapter.length) {
  lines.push('');
  lines.push('| Question | Filed under | Copies |');
  lines.push('|---|---|---|');
  for (const c of crossChapter.slice(0, 15)) {
    lines.push(
      `| ${c.question.replace(/\|/g, '\\|').slice(0, 70)} | ${c.places.join(' • ')} | ${c.copies.length} |`,
    );
  }
}
lines.push('');
lines.push('## Duplicate slugs (SEO URLs collide)');
lines.push('');
lines.push(duplicateSlugs.length ? duplicateSlugs.slice(0, 15).map(([s, n]) => `- \`${s}\` ×${n}`).join('\n') : '_None._');
lines.push('');
lines.push('## Questions per subject');
lines.push('');
lines.push('| Subject | Questions |');
lines.push('|---|---|');
for (const [subject, count] of [...bySubject.entries()].sort((a, b) => b[1] - a[1])) {
  lines.push(`| ${subject} | ${count} |`);
}
lines.push('');
lines.push('## How to apply the fixes');
lines.push('');
lines.push('```bash');
lines.push('# 1. dry run — shows exactly what would change');
lines.push('node scripts/question-bank-fix.mjs --plan exports/fix-plan.json --dry-run');
lines.push('');
lines.push('# 2. apply (needs an admin Firebase ID token)');
lines.push('ADMIN_TOKEN="<firebase-id-token>" node scripts/question-bank-fix.mjs --plan exports/fix-plan.json --apply');
lines.push('```');
lines.push('');
lines.push(`Full machine readable findings: \`${JSON_PATH}\``);
lines.push(`Fix plan: \`${PLAN_PATH}\``);
lines.push('');

writeFileSync(REPORT_PATH, lines.join('\n'));

console.log('');
console.log('── Audit summary ────────────────────────────────────────────');
console.log(`  questions                : ${questions.length}`);
console.log(`  field fixes proposed     : ${updates.length}`);
console.log(`  duplicate groups         : ${merges.length}`);
console.log(`  redundant copies         : ${duplicatesToDelete}`);
console.log(`  without explanation      : ${withoutExplanation}`);
console.log(`  manual review needed     : ${unreviewed.length}`);
console.log('  issue breakdown          :');
for (const [code, count] of [...issueCounts.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`      ${code.padEnd(30)} ${count}`);
}
for (const [code, count] of [...explanationIssueCounts.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`      ${code.padEnd(30)} ${count}`);
}
console.log('─────────────────────────────────────────────────────────────');
console.log(`📄 ${REPORT_PATH}`);
console.log(`📄 ${JSON_PATH}`);
console.log(`📄 ${PLAN_PATH}`);
