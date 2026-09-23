/**
 * questionQuality.ts
 * ---------------------------------------------------------------------------
 * Question-bank hygiene helpers, shared by:
 *   • the app (import/upload time + render time + admin tools)
 *   • the offline cleanup CLI (`scripts/question-bank-audit.mjs`,
 *     `scripts/question-bank-fix.mjs`) which bundles this file with esbuild.
 *
 * Covers the inconsistencies reported for the production bank:
 *   1. Explanations that literally contain the word "Explanation" (or "ব্যাখ্যা")
 *      with one explanation written before it and another written after it.
 *   2. Explanations that are simply the same text twice ("A … A …").
 *   3. Explanations that are empty, are just the question repeated, or are
 *      duplicated at sentence level.
 *   4. Duplicate questions (same text, shuffled options, NFC/NFD variants,
 *      invisible characters, trailing board labels…).
 *   5. Field level noise: zero-width characters, stray whitespace, HTML
 *      entities, mojibake (à¦…), junk tags, out-of-range answer index…
 *
 * No browser or Node APIs are used here on purpose — it must stay importable
 * from plain Node ESM (bundled) and from the React app alike.
 */

export interface BankQuestion {
  _id?: string;
  id?: string;
  slug?: string;
  orderIndex?: number;
  question?: string;
  options?: string[];
  optionsImages?: string[];
  correctAnswerIndex?: number;
  explanation?: string;
  explanationImage?: string;
  questionImage?: string;
  contextText?: string;
  contextImage?: string;
  subject?: string;
  chapter?: string;
  topic?: string;
  examRef?: string;
  level?: string;
  board?: string;
  college?: string;
  admissionCategory?: string;
  tags?: string[];
  year?: number;
  createdAt?: number | string;
  [key: string]: unknown;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 1. TEXT PRIMITIVES
 * ═══════════════════════════════════════════════════════════════════════════ */

const ZERO_WIDTH = /[\u200B-\u200D\u2060\uFEFF]/g;

/** Remove invisible characters and normalise Unicode form. */
export const stripInvisible = (text: string): string =>
  String(text ?? '').normalize('NFC').replace(ZERO_WIDTH, '');

/**
 * Full text normalisation used for display and for every comparison:
 * NFC form, canonical য়/ড়/ঢ়, invisible characters removed, spaces unified.
 */
export const normalizeQuestionText = (text: string): string =>
  stripInvisible(text)
    .replace(/\u09AF\u09BC/g, '\u09DF') // য + ়  → য়
    .replace(/\u09A1\u09BC/g, '\u09DC') // ড + ়  → ড়
    .replace(/\u09A2\u09BC/g, '\u09DD') // ঢ + ়  → ঢ়
    .replace(/\u00A0/g, ' ') // non-breaking space
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

/** Aggressive key used for equality: no spaces, no punctuation, lowercase. */
export const comparisonKey = (text: string): string =>
  normalizeQuestionText(text)
    .toLowerCase()
    .replace(/[.,;:"'’“”|।॥?!()\[\]{}<>«»_\-–—]/g, '')
    .replace(/\s+/g, '');

/** HTML entities + the most common markup that sneaks in from PDF/Word imports. */
export const decodeEntities = (text: string): string =>
  String(text ?? '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&times;/gi, '×')
    .replace(/&divide;/gi, '÷')
    .replace(/&deg;/gi, '°');

/** `\n`, `\r\n` written as literal characters (very common in scraped data). */
export const unescapeLiterals = (text: string): string =>
  String(text ?? '')
    .replace(/\\r\\n|\\n|\\r/g, '\n')
    .replace(/\\t/g, ' ')
    .replace(/\\"/g, '"');

/** Mojibake produced by decoding UTF-8 Bengali/Latin as Latin-1 (à¦…, à§‡, â€¦). */
export const looksLikeMojibake = (text: string): boolean =>
  /à¦|à§|â€|Ã¢|Ã©|Ã¨|Ã¼|ï¿½|\uFFFD/.test(String(text ?? ''));

const isDigit = (ch: string): boolean => !!ch && /[0-9\u09E6-\u09EF]/.test(ch);

/**
 * Split into sentences, keeping the terminators attached to their sentence.
 * Handles the two traps of scientific Bangla text:
 *   • decimals — "০.০৫ মিগ্রা" must not split at the dot
 *   • numbered lists — "১. প্রথম ধাপ" must not split either
 * so a plain "." only ends a sentence at the end of a line/string or before a
 * following sentence that starts with a capital letter.
 */
export const splitSentences = (text: string): string[] => {
  const source = normalizeQuestionText(text);
  const sentences: string[] = [];
  let current = '';
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    current += ch;
    const isHardEnd = ch === '।' || ch === '॥' || ch === '?' || ch === '!' || ch === '\n';
    let isDotEnd = false;
    if (ch === '.' && !isDigit(source[i - 1] ?? '')) {
      const next = source[i + 1];
      const afterSpace = next && /\s/.test(next) ? source[i + 2] : next;
      isDotEnd = !next || /\s/.test(next) ? !afterSpace || /[A-Z\u0980-\u09FF]/.test(afterSpace) : false;
    }
    if (isHardEnd || isDotEnd) {
      const sentence = current.replace(/\s+/g, ' ').trim();
      if (sentence) sentences.push(sentence);
      current = '';
    }
  }
  const tail = current.replace(/\s+/g, ' ').trim();
  if (tail) sentences.push(tail);
  return sentences;
};

/** Levenshtein distance with an early bail-out above `max`. */
export const editDistance = (a: string, b: string, max = Infinity): number => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array<number>(b.length + 1);
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    let rowMin = curr[0];
    for (let j = 1; j <= b.length; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      if (curr[j] < rowMin) rowMin = curr[j];
    }
    if (rowMin > max) return max + 1;
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
};

/**
 * Word level Jaccard similarity — catches the very common "same question, one
 * extra parenthetical / synonym" variants that character distance misses:
 *   "নিচের কোনটি তাপহারী বিক্রিয়া?"  vs  "নিচের কোনটি তাপহারী (endothermic) বিক্রিয়া?"
 */
export const wordSimilarity = (a: string, b: string): number => {
  // ⚠️ \p{M} (combining marks) is essential: without it every Bengali vowel
  // sign / hasant splits the word into meaningless fragments.
  const words = (text: string) =>
    new Set(
      normalizeQuestionText(text)
        .toLowerCase()
        .split(/[^\p{L}\p{M}\p{N}]+/u)
        .filter((w) => w.length > 1),
    );
  const wa = words(a);
  const wb = words(b);
  if (!wa.size || !wb.size) return 0;
  let shared = 0;
  for (const w of wa) if (wb.has(w)) shared++;
  return shared / (wa.size + wb.size - shared);
};

/** 0…1 similarity between two strings (1 = identical). */
export const similarity = (a: string, b: string): number => {
  const max = Math.max(a.length, b.length);
  if (max === 0) return 1;
  const dist = editDistance(a, b, Math.ceil(max * 0.9));
  return dist > max ? 0 : 1 - dist / max;
};

/** Character 3-gram Jaccard similarity — cheap, good enough for near-duplicates. */
export const ngramSimilarity = (a: string, b: string, n = 3): number => {
  if (a === b) return 1;
  if (a.length < n || b.length < n) return similarity(a, b);
  const grams = (s: string) => {
    const set = new Set<string>();
    for (let i = 0; i + n <= s.length; i++) set.add(s.slice(i, i + n));
    return set;
  };
  const ga = grams(a);
  const gb = grams(b);
  let shared = 0;
  for (const g of ga) if (gb.has(g)) shared++;
  return shared / (ga.size + gb.size - shared);
};

/* ═══════════════════════════════════════════════════════════════════════════
 * 2. EXPLANATION REPAIR
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * The literal labels that get pasted *inside* the explanation field by AI
 * generations, scrapers and copy-paste. Kept multilingual on purpose.
 */
export const EXPLANATION_LABEL =
  '(?:explanation|explaination|explain|reasoning|solution|answer|ans|ব্যাখ্যা|ব্যাখ্য়া|ব্যাখা|সমাধান|উত্তর)';

/**
 * A label that *must* be followed by a colon/dash to count as a separate
 * section: `Explanation:`, `Ans:`, `সমাধান –` …
 * (the "Ans" / "Solution" words appear legitimately inside sentences, so they
 * only split when they are clearly used as a label).
 */
const LABEL_WITH_SEPARATOR_RE = new RegExp(
  `(^|[\\s।॥?!.,;)\\]}])\\s*[*_~\`'"\\[{(]{0,3}\\s*${EXPLANATION_LABEL}\\s*[)*_~\`'"\\]}]{0,3}\\s*[:：\\-–—]{1,2}\\s*[*_~\`'"\\[{(]{0,3}\\s+`,
  'i',
);

/** The unambiguous standalone words that split even without a colon. */
const STANDALONE_LABEL_RE = /(^|[\s।॥?!.)\]}])\s*[*_~`'"\[{(]{0,3}\s*(?:Explanation|Explaination|ব্যাখ্যা|ব্যাখ্য়া)\s*[)*_~`'"\]}]{0,3}\s*[:：\-–—]{0,2}\s+/i;

/** Label that sits at the very start of the field (e.g. "Explanation: …"). */
const LEADING_LABEL_RE = new RegExp(`^\\s*[*_~\\\`'"\\[{(]{0,3}\\s*${EXPLANATION_LABEL}\\s*[*_~\\\`'"\\]}]{0,3}\\s*[:：\\-–—]\\s*`, 'i');
/** Label that sits at the very end of the field (e.g. "… Explanation"). */
const TRAILING_LABEL_RE = new RegExp(`[\\s।.]*(?:${EXPLANATION_LABEL})\\s*[:：\\-–—]?\\s*[*_~\\\`'"\\]}]{0,3}\\s*$`, 'i');

export interface ExplanationIssue {
  code:
    | 'explanation-marker'
    | 'explanation-doubled'
    | 'explanation-duplicate-sentences'
    | 'explanation-leading-label'
    | 'explanation-trailing-label'
    | 'explanation-only-question'
    | 'explanation-option-echo'
    | 'explanation-empty-with-image'
    | 'explanation-missing';
  detail?: string;
}

export interface CleanExplanationResult {
  text: string;
  changed: boolean;
  issues: ExplanationIssue[];
}

/** Field value that is really just a label with nothing behind it. */
const isLabelOnly = (text: string): boolean =>
  new RegExp(`^\\s*${EXPLANATION_LABEL}\\s*[:：\\-–—]?\\s*$`, 'i').test(text);

/** Visible length (everything but spaces/punctuation) — used to ignore stubs. */
const visibleLength = (text: string): number =>
  (text || '').replace(/[\s.,;:!?।॥\-–—"'()\[\]{}]/g, '').length;

/**
 * Split an explanation on the embedded "Explanation"/"ব্যাখ্যা" labels.
 * Returns the usable chunks in their original order.
 */
export const splitOnExplanationLabels = (text: string): { chunks: string[]; found: boolean } => {
  const normalized = normalizeQuestionText(unescapeLiterals(decodeEntities(text)));
  const splitOnce = (input: string, re: RegExp): string =>
    input.replace(re, (match, lead: string) => (/^\s*$/.test(lead || '') ? '\u0000' : `${lead}\u0000`));
  let marked = splitOnce(normalized, LABEL_WITH_SEPARATOR_RE);
  if (!marked.includes('\u0000')) marked = splitOnce(marked, STANDALONE_LABEL_RE);
  const rawChunks = marked.split('\u0000').map((c) => c.trim());
  const found = rawChunks.length > 1;
  // Stubs such as "গ।" left behind by an "Ans:" label are dropped, the rest kept.
  const chunks = rawChunks.filter((c) => visibleLength(c) >= 3);
  return { chunks: found ? chunks : rawChunks.filter(Boolean), found };
};

/** Join explanation chunks, avoiding double spaces and doubled terminal marks. */
const joinChunks = (chunks: string[]): string => {
  const out: string[] = [];
  for (const raw of chunks) {
    const chunk = raw.trim();
    if (!chunk) continue;
    const prev = out[out.length - 1];
    if (prev && prev === chunk) continue; // exact repeat
    out.push(chunk);
  }
  return out
    .join(' ')
    .replace(/\s+([।॥,;:.?!])/g, '$1')
    .replace(/([।॥.]){2,}/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

/**
 * Collapse sentence level repeats: "ক। খ। ক। খ।" → "ক। খ।".
 * Also drops a sentence that is a near duplicate of the previous one.
 */
export const dedupeSentences = (text: string): string => {
  const sentences = splitSentences(text);
  if (sentences.length < 2) return normalizeQuestionText(text);
  const kept: string[] = [];
  const seen: string[] = [];
  for (const sentence of sentences) {
    const key = comparisonKey(sentence);
    if (!key) continue;
    const duplicate = seen.some((s) => s === key || (key.length > 25 && ngramSimilarity(s, key) > 0.92));
    if (duplicate) continue;
    seen.push(key);
    kept.push(sentence);
  }
  return joinChunks(kept);
};

/**
 * The "A … Explanation … B" pattern: keep/merge the two explanations so the
 * student sees one clean explanation instead of the same thing twice.
 */
const collapseDoubledExplanation = (text: string): { text: string; doubled: boolean } => {
  const normalized = normalizeQuestionText(text);
  if (visibleLength(normalized) < 24) return { text: normalized, doubled: false };

  // a) text repeated verbatim: "XYXY"
  const half = Math.floor(normalized.length / 2);
  for (const cut of [half, half - 1, half + 1]) {
    if (cut < 12) continue;
    const a = normalized.slice(0, cut).trim();
    const b = normalized.slice(cut).trim();
    if (a && b && similarity(comparisonKey(a), comparisonKey(b)) > 0.9) {
      return { text: a.length >= b.length ? a : b, doubled: true };
    }
  }

  // b) sentence halves are the same story: "ক…। খ…। ক…। খ…।"
  const sentences = splitSentences(normalized);
  if (sentences.length >= 4 && sentences.length % 2 === 0) {
    const mid = sentences.length / 2;
    const first = comparisonKey(sentences.slice(0, mid).join(' '));
    const second = comparisonKey(sentences.slice(mid).join(' '));
    if (first && similarity(first, second) > 0.85) {
      const head = sentences.slice(0, mid).join(' ');
      return { text: head.length >= normalized.length - head.length ? head : sentences.slice(mid).join(' '), doubled: true };
    }
  }
  return { text: normalized, doubled: false };
};

/**
 * Repair an explanation field. Pure function — the CLI and the app both call it.
 *
 * Input:  "মিনিটের কাঁটার T=3600s। Explanation: মিনিটের কাঁটার পর্যায়কাল 3600 সেকেন্ড।"
 * Output: "মিনিটের কাঁটার T=3600s।"   (issues: explanation-marker)
 */
export const cleanExplanation = (
  raw: string | null | undefined,
  context?: { question?: string; options?: string[] },
): CleanExplanationResult => {
  const issues: ExplanationIssue[] = [];
  let text = normalizeQuestionText(unescapeLiterals(decodeEntities(String(raw ?? ''))));

  if (!text) return { text: '', changed: false, issues: [] };

  // 1. labels pasted at the very start / very end of the field
  const withoutLeading = text.replace(LEADING_LABEL_RE, '');
  if (withoutLeading !== text) {
    issues.push({ code: 'explanation-leading-label' });
    text = withoutLeading.trim();
  }
  const withoutTrailing = text.replace(TRAILING_LABEL_RE, '');
  if (withoutTrailing !== text && visibleLength(withoutTrailing) > 0) {
    issues.push({ code: 'explanation-trailing-label' });
    text = withoutTrailing.trim();
  }
  if (!text) return { text: '', changed: true, issues };

  // 2. the reported bug: "<ব্যাখ্যা> Explanation <আরেক ব্যাখ্যা>"
  const { chunks, found } = splitOnExplanationLabels(text);
  if (found && chunks.length > 0) {
    // Chunks that tell the same story are collapsed (prefer the richer one).
    const kept: string[] = [];
    for (const chunk of chunks) {
      const dupIndex = kept.findIndex((k) => {
        const kc = comparisonKey(k);
        const cc = comparisonKey(chunk);
        return (
          kc === cc ||
          similarity(kc, cc) > 0.82 ||
          ngramSimilarity(kc, cc) > 0.85 ||
          // "X" written before the label and "According to WHO, X" written after
          (kc.length > 18 && cc.length > 18 && (kc.includes(cc) || cc.includes(kc)))
        );
      });
      if (dupIndex === -1) kept.push(chunk);
      else if (visibleLength(chunk) > visibleLength(kept[dupIndex])) kept[dupIndex] = chunk;
    }
    const joined = joinChunks(kept);
    if (visibleLength(joined) > 0) {
      if (chunks.length > 1) issues.push({ code: 'explanation-marker', detail: `${chunks.length} labelled chunks` });
      text = joined;
    }
  }

  // 3. text repeated without any label
  const doubled = collapseDoubledExplanation(text);
  if (doubled.doubled) {
    issues.push({ code: 'explanation-doubled' });
    text = doubled.text;
  }

  // 4. sentence level duplicates ("ক। খ। ক। খ।")
  const deduped = dedupeSentences(text);
  if (comparisonKey(deduped) !== comparisonKey(text)) {
    issues.push({ code: 'explanation-duplicate-sentences' });
    text = deduped;
  }

  // 5. explanation that is only the question repeated back
  if (context?.question) {
    const q = comparisonKey(context.question);
    const e = comparisonKey(text);
    if (q && e && (q === e || (q.length > 20 && similarity(q, e) > 0.93))) {
      issues.push({ code: 'explanation-only-question' });
    }
    // "explanation" that merely repeats one option is useless too
    const options = (context.options || []).map(comparisonKey).filter((o) => o.length > 1);
    if (options.includes(e)) issues.push({ code: 'explanation-option-echo' });
  }

  // 6. a leftover option letter at the front ("গ। নাইট্রোজেন…" from an "Ans:" label)
  const withoutLetter = text.replace(/^\s*[([{]?\s*[কখগঘa-dA-D]\s*[)\]}।.,:;\-–—]{1,2}\s+/, '');
  if (withoutLetter !== text && visibleLength(withoutLetter) >= 8) text = withoutLetter.trim();

  const finalText = normalizeQuestionText(text).replace(/^[\s।.,;:\-–—]+/, '').trim();
  return { text: finalText, changed: finalText !== normalizeQuestionText(String(raw ?? '')), issues };
};

/* ═══════════════════════════════════════════════════════════════════════════
 * 3. DUPLICATE DETECTION
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Stable identity of a question: its wording + the (order independent) options. */
export const questionFingerprint = (q: BankQuestion, withOptions = true): string => {
  const question = comparisonKey(String(q?.question ?? ''));
  if (!withOptions) return question;
  const options = (q?.options || [])
    .map((o) => comparisonKey(String(o ?? '')))
    .filter(Boolean)
    .sort()
    .join('|');
  return `${question}##${options}`;
};

export interface DuplicatePair {
  a: BankQuestion;
  b: BankQuestion;
  reason: 'exact' | 'fuzzy';
  score: number;
}

/**
 * Compare two questions for "same question" (not just identical strings).
 * Options must line up as a set; the question stem may differ slightly
 * (NFC/NFD, punctuation, whitespace, an extra "(b)" prefix…).
 */
export const areDuplicateQuestions = (
  a: BankQuestion,
  b: BankQuestion,
  opts: { fuzzy?: boolean } = {},
): boolean => {
  const fuzzy = opts.fuzzy !== false;
  const qa = comparisonKey(String(a?.question ?? ''));
  const qb = comparisonKey(String(b?.question ?? ''));
  if (!qa || !qb) return false;

  const oa = (a?.options || []).map((o) => comparisonKey(String(o ?? ''))).filter(Boolean).sort();
  const ob = (b?.options || []).map((o) => comparisonKey(String(o ?? ''))).filter(Boolean).sort();
  const optionsMatch =
    oa.length === ob.length && oa.every((o, i) => similarity(o, ob[i]) > 0.85 || ngramSimilarity(o, ob[i]) > 0.9);
  if (!optionsMatch) return false;

  if (qa === qb) return true;
  if (!fuzzy) return false;

  const maxLen = Math.max(qa.length, qb.length);
  const minLen = Math.min(qa.length, qb.length);
  if (maxLen === 0 || minLen / maxLen < 0.6) return false; // one is a much longer variant
  // A short stem contained in a longer one is the same question with extra words.
  if (minLen > 18 && (qa.includes(qb) || qb.includes(qa))) return true;
  // Options already match exactly, so a looser stem comparison is safe and
  // catches "…(endothermic)…"-style additions.
  const wordSim = wordSimilarity(String(a?.question ?? ''), String(b?.question ?? ''));
  return ngramSimilarity(qa, qb) > 0.82 || similarity(qa, qb) > 0.8 || wordSim > 0.75;
};

/**
 * Group a list of questions into duplicate clusters.
 * Buckets by subject+chapter so 50k questions stay fast.
 */
export const findDuplicateGroups = (
  questions: BankQuestion[],
  opts: { fuzzy?: boolean; key?: (q: BankQuestion) => string } = {},
): BankQuestion[][] => {
  const buckets = new Map<string, BankQuestion[]>();
  for (const q of questions) {
    const key =
      opts.key?.(q) ??
      `${comparisonKey(String(q?.subject ?? ''))}//${comparisonKey(String(q?.chapter ?? ''))}`;
    const list = buckets.get(key);
    if (list) list.push(q);
    else buckets.set(key, [q]);
  }

  const groups: BankQuestion[][] = [];
  for (const list of buckets.values()) {
    if (list.length < 2) continue;
    // exact fingerprint index first (cheap and exact)
    const byFingerprint = new Map<string, BankQuestion[]>();
    for (const q of list) {
      const fp = questionFingerprint(q);
      const bucket = byFingerprint.get(fp);
      if (bucket) bucket.push(q);
      else byFingerprint.set(fp, [q]);
    }

    const clusters: BankQuestion[][] = [];
    const claimed = new Set<BankQuestion>();
    const mergeInto = (q: BankQuestion) => {
      const match = clusters.find(
        (cluster) =>
          areDuplicateQuestions(cluster[0], q, { fuzzy: opts.fuzzy }) &&
          // never merge two clearly-different exam refs, keep them separate copies
          examRefCompatible(cluster[0], q),
      );
      if (match) {
        match.push(q);
        claimed.add(q);
        return true;
      }
      return false;
    };

    for (const bucket of byFingerprint.values()) {
      if (bucket.length > 1) {
        clusters.push([...bucket]);
        bucket.forEach((q) => claimed.add(q));
      }
    }
    // fuzzy pass over everything that was not already clustered
    const remaining = list.filter((q) => !claimed.has(q));
    for (const q of remaining) {
      const cluster = clusters.find((c) => areDuplicateQuestions(c[0], q, { fuzzy: opts.fuzzy }) && examRefCompatible(c[0], q));
      if (cluster) {
        cluster.push(q);
        claimed.add(q);
      } else {
        clusters.push([q]);
        claimed.add(q);
      }
    }

    for (const cluster of clusters) if (cluster.length > 1) groups.push(cluster);
  }
  return groups.sort((a, b) => b.length - a.length);
};

/** Two copies that come from clearly different exams are kept as separate items. */
const examRefCompatible = (a: BankQuestion, b: BankQuestion): boolean => {
  const refs = (q: BankQuestion) =>
    String(q?.examRef ?? '')
      .split(/[,;/]/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
      .sort();
  const ra = refs(a);
  const rb = refs(b);
  if (!ra.length || !rb.length) return true;
  const shared = ra.filter((r) => rb.includes(r));
  if (shared.length) return true;
  // A book/chapter pseudo-ref vs a board ref: still the same question.
  const isBookRef = (r: string) => r.includes('paper') || r.includes('chapter') || r.split(' ').length > 2;
  return ra.every(isBookRef) || rb.every(isBookRef);
};

/* ═══════════════════════════════════════════════════════════════════════════
 * 4. MERGING
 * ═══════════════════════════════════════════════════════════════════════════ */

const isFilled = (value: unknown): boolean =>
  value !== undefined && value !== null && String(value).trim() !== '' && String(value).trim() !== 'General';

export interface MergeResult {
  keepId: string | undefined;
  /** Full document that should be saved as the surviving copy. */
  merged: BankQuestion;
  deleteIds: (string | undefined)[];
  /** Explanation chosen for the survivor (already cleaned). */
  explanation: string;
  removed: number;
}

/** Score a copy so the richest/most complete one survives a merge. */
export const questionRichness = (q: BankQuestion): number => {
  let score = 0;
  const explanation = cleanExplanation(q?.explanation, {
    question: String(q?.question ?? ''),
    options: (q?.options || []).map(String),
  }).text;
  if (visibleLength(explanation) > 0) score += 5;
  score += Math.min(5, Math.floor(visibleLength(explanation) / 120));
  if (isFilled(q?.slug)) score += 1;
  if (isFilled(q?.examRef)) score += 1;
  if (isFilled(q?.topic)) score += 1;
  if (isFilled(q?.level)) score += 1;
  if (isFilled(q?.questionImage)) score += 2;
  if (isFilled(q?.explanationImage)) score += 2;
  if (Number(q?.year) > 0) score += 1;
  score += Math.min(3, (q?.tags || []).filter((t) => String(t).trim()).length * 0.5);
  return score;
};

/**
 * Merge a duplicate cluster into one clean question document.
 * Unions tags/examRefs, keeps the best explanation, keeps images, and copies
 * exam metadata that only one of the copies had.
 */
export const mergeDuplicateQuestions = (cluster: BankQuestion[]): MergeResult => {
  if (!cluster.length) throw new Error('mergeDuplicateQuestions: empty cluster');
  const ranked = [...cluster].sort((a, b) => questionRichness(b) - questionRichness(a));
  const primary = ranked[0];

  const tags = Array.from(
    new Set(cluster.flatMap((q) => (q?.tags || []).map((t) => String(t).trim()).filter(Boolean))),
  );
  const examRefs = Array.from(
    new Set(
      cluster.flatMap((q) =>
        String(q?.examRef ?? '')
          .split(/[,;/]/)
          .map((s) => s.trim())
          .filter(Boolean),
      ),
    ),
  );
  const boards = Array.from(new Set(cluster.map((q) => String(q?.board ?? '').trim()).filter(Boolean)));
  const colleges = Array.from(new Set(cluster.map((q) => String(q?.college ?? '').trim()).filter(Boolean)));

  // Explanation: newest cleaned text wins, ties broken by length.
  const explanations = cluster
    .map((q) =>
      cleanExplanation(q?.explanation, {
        question: String(q?.question ?? ''),
        options: (q?.options || []).map(String),
      }),
    )
    .filter((e) => visibleLength(e.text) > 0)
    .sort((a, b) => b.text.length - a.text.length);
  const explanation = explanations[0]?.text ?? '';

  // Answer index: majority vote (a lone wrong copy must not win).
  const votes = new Map<number, number>();
  for (const q of cluster) {
    const idx = Number(q?.correctAnswerIndex);
    if (Number.isInteger(idx)) votes.set(idx, (votes.get(idx) ?? 0) + 1);
  }
  const correctAnswerIndex = [...votes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0;

  const firstFilled = (pick: (q: BankQuestion) => unknown): string =>
    String(cluster.map(pick).find((v) => isFilled(v)) ?? '');

  const merged: BankQuestion = {
    ...primary,
    question: normalizeQuestionText(String(primary.question ?? '')),
    options: (primary.options || []).map((o) => normalizeQuestionText(String(o ?? ''))),
    correctAnswerIndex,
    explanation,
    tags,
    examRef: examRefs.join(', '),
    ...(boards.length ? { board: boards.join(', ') } : {}),
    ...(colleges.length ? { college: colleges.join(', ') } : {}),
    questionImage: firstFilled((q) => q.questionImage),
    explanationImage: firstFilled((q) => q.explanationImage),
    contextText: firstFilled((q) => q.contextText),
    contextImage: firstFilled((q) => q.contextImage),
    optionsImages:
      cluster.find((q) => (q.optionsImages || []).some((i) => isFilled(i)))?.optionsImages ??
      primary.optionsImages ??
      [],
    year: Math.max(0, ...cluster.map((q) => Number(q?.year) || 0)),
    slug: String(primary.slug || cluster.find((q) => isFilled(q.slug))?.slug || ''),
  };

  return {
    keepId: primary._id ?? primary.id,
    merged,
    deleteIds: cluster.filter((q) => q !== primary).map((q) => q._id ?? q.id),
    explanation,
    removed: cluster.length - 1,
  };
};

/* ═══════════════════════════════════════════════════════════════════════════
 * 5. FIELD LEVEL CHECKS / AUTO FIXES
 * ═══════════════════════════════════════════════════════════════════════════ */

export type IssueCode =
  | 'question-empty'
  | 'question-marker'
  | 'options-count'
  | 'option-empty'
  | 'option-duplicate'
  | 'answer-out-of-range'
  | 'answer-missing'
  | 'subject-missing'
  | 'chapter-missing'
  | 'topic-missing'
  | 'mojibake'
  | 'unicode-nfd'
  | 'invisible-chars'
  | 'whitespace'
  | 'html-markup'
  | 'latex-unbalanced'
  | 'tag-empty'
  | 'tag-junk'
  | 'tag-duplicate'
  | 'slug-missing'
  | 'image-missing';

export interface FieldIssue {
  code: IssueCode;
  field: string;
  detail?: string;
}

/** Detect every field level problem worth reporting (and often auto-fixing). */
export const collectFieldIssues = (q: BankQuestion): FieldIssue[] => {
  const issues: FieldIssue[] = [];
  const question = String(q?.question ?? '');
  const options = (q?.options || []).map((o) => String(o ?? ''));

  if (!normalizeQuestionText(question)) issues.push({ code: 'question-empty', field: 'question' });
  else if (new RegExp(`${EXPLANATION_LABEL}\\s*[:：]`, 'i').test(question))
    issues.push({ code: 'question-marker', field: 'question', detail: 'label inside question text' });

  if (options.length !== 4)
    issues.push({ code: 'options-count', field: 'options', detail: `${options.length} options` });
  if (options.some((o) => !normalizeQuestionText(o))) issues.push({ code: 'option-empty', field: 'options' });
  const optionKeys = options.map(comparisonKey).filter(Boolean);
  if (new Set(optionKeys).size !== optionKeys.length)
    issues.push({ code: 'option-duplicate', field: 'options' });

  const idx = q?.correctAnswerIndex;
  if (idx === undefined || idx === null || (typeof idx === 'string' && !String(idx).trim()))
    issues.push({ code: 'answer-missing', field: 'correctAnswerIndex' });
  else if (!Number.isInteger(Number(idx)) || Number(idx) < 0 || Number(idx) >= Math.max(options.length, 1))
    issues.push({ code: 'answer-out-of-range', field: 'correctAnswerIndex', detail: String(idx) });

  if (!normalizeQuestionText(String(q?.subject ?? ''))) issues.push({ code: 'subject-missing', field: 'subject' });
  if (!normalizeQuestionText(String(q?.chapter ?? ''))) issues.push({ code: 'chapter-missing', field: 'chapter' });
  if (!normalizeQuestionText(String(q?.topic ?? ''))) issues.push({ code: 'topic-missing', field: 'topic' });

  const textFields: [string, unknown][] = [
    ['question', question],
    ['explanation', q?.explanation],
    ...options.map((o, i) => [`options[${i}]`, o] as [string, unknown]),
    ['subject', q?.subject],
    ['chapter', q?.chapter],
    ['topic', q?.topic],
  ];
  for (const [field, value] of textFields) {
    const text = String(value ?? '');
    if (!text) continue;
    if (looksLikeMojibake(text)) issues.push({ code: 'mojibake', field });
    if (text !== text.normalize('NFC')) issues.push({ code: 'unicode-nfd', field });
    if (ZERO_WIDTH.test(text)) issues.push({ code: 'invisible-chars', field });
    ZERO_WIDTH.lastIndex = 0;
    if (/\s{2,}|^\s|\s$/.test(text) || /\\n/.test(text))
      issues.push({ code: 'whitespace', field });
    if (/<\/?(?:br|p|div|span|b|i|u|sub|sup|font)\b[^>]*>/i.test(text))
      issues.push({ code: 'html-markup', field });
    const dollars = (text.match(/(?<!\\)\$/g) || []).length;
    if (dollars % 2 !== 0) issues.push({ code: 'latex-unbalanced', field });
  }

  const tags = (q?.tags || []).map((t) => String(t ?? ''));
  if (tags.some((t) => !t.trim())) issues.push({ code: 'tag-empty', field: 'tags' });
  if (tags.some((t) => t.trim() && JUNK_TAGS.has(comparisonKey(t)))) issues.push({ code: 'tag-junk', field: 'tags' });
  const tagKeys = tags.map(comparisonKey).filter(Boolean);
  if (new Set(tagKeys).size !== tagKeys.length) issues.push({ code: 'tag-duplicate', field: 'tags' });

  if (!String(q?.slug ?? '').trim()) issues.push({ code: 'slug-missing', field: 'slug' });

  return issues;
};

/** Tags that carry no information (they come from a broken import). */
const JUNK_TAGS = new Set(
  ['দাঁড়িকমা', 'দারিকমা', 'darikoma', 'comma', 'na', 'n/a', 'null', 'undefined', '-', '--', '.', ','].map(
    comparisonKey,
  ),
);

/** Clean the junk tags the importer has been collecting. */
export const cleanTags = (tags: unknown): string[] => {
  if (!Array.isArray(tags)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of tags) {
    const tag = normalizeQuestionText(String(raw ?? ''))
      .replace(/^\[TAG_MARKER:\s*/i, '')
      .replace(/\]$/, '')
      .trim();
    const key = comparisonKey(tag);
    if (!tag || !key || seen.has(key) || JUNK_TAGS.has(key)) continue;
    seen.add(key);
    out.push(tag);
  }
  return out;
};

export interface FixResult {
  question: BankQuestion;
  /** Only the changed fields, ready to be sent as an update. */
  patch: Partial<BankQuestion>;
  issues: FieldIssue[];
  explanationIssues: ExplanationIssue[];
  /** true when the automatic fix is safe to apply without human review. */
  autoFixable: boolean;
}

/**
 * Produce the fixed document + the minimal patch for one question.
 * Nothing here touches the network — the caller decides what to write.
 */
export const fixQuestion = (q: BankQuestion): FixResult => {
  const issues = collectFieldIssues(q);
  const question = normalizeQuestionText(String(q?.question ?? ''));
  const options = (q?.options || []).map((o) => normalizeQuestionText(String(o ?? '')));
  const explanationResult = cleanExplanation(q?.explanation, { question, options });

  const patch: Partial<BankQuestion> = {};
  if (question !== String(q?.question ?? '')) patch.question = question;
  if (options.some((o, i) => o !== String((q?.options || [])[i] ?? ''))) patch.options = options;
  if (explanationResult.text !== String(q?.explanation ?? '')) patch.explanation = explanationResult.text;

  const tags = cleanTags(q?.tags);
  if (JSON.stringify(tags) !== JSON.stringify((q?.tags || []).map((t) => String(t ?? '')))) patch.tags = tags;

  for (const field of ['subject', 'chapter', 'topic', 'examRef', 'board', 'college'] as const) {
    const raw = q?.[field];
    if (raw === undefined || raw === null) continue;
    const cleaned = normalizeQuestionText(String(raw));
    if (cleaned !== String(raw)) (patch as Record<string, unknown>)[field] = cleaned;
  }

  const idx = Number(q?.correctAnswerIndex);
  if (Number.isInteger(idx) && idx >= options.length && options.length > 0) {
    // Only clamp when the value is clearly out of range but points at "the last one".
    const fixedIndex = Math.max(0, Math.min(options.length - 1, idx));
    if (fixedIndex !== idx) patch.correctAnswerIndex = fixedIndex;
  }

  const serious = issues.filter((i) =>
    ['question-empty', 'options-count', 'option-empty', 'answer-out-of-range', 'answer-missing', 'mojibake'].includes(
      i.code,
    ),
  );
  const blockingExplanation = explanationResult.issues.filter((i) =>
    ['explanation-only-question', 'explanation-option-echo'].includes(i.code),
  );

  return {
    question: { ...q, ...patch },
    patch,
    issues,
    explanationIssues: explanationResult.issues,
    autoFixable: serious.length === 0 && blockingExplanation.length === 0,
  };
};

/** Convenience for the UI: always render a clean explanation. */
export const safeExplanation = (q: BankQuestion): string =>
  cleanExplanation(q?.explanation, {
    question: String(q?.question ?? ''),
    options: (q?.options || []).map(String),
  }).text;
