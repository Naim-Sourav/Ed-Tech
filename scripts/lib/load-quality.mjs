/**
 * load-quality.mjs
 * ---------------------------------------------------------------------------
 * Loads `utils/questionQuality.ts` into a plain Node CLI.
 *
 * Two strategies, in order:
 *   1. Node ≥ 22.18 strips TypeScript types natively → import the .ts directly
 *      (no build step, no dependency).
 *   2. Older Node → bundle the file with esbuild (already available through
 *      Vite / `npm install esbuild`).
 *
 * This keeps ONE implementation of the cleaning rules for the app, the tests
 * and the CLI — no copy-pasted regexes drifting apart.
 */

import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const TS_ENTRY = join(ROOT, 'utils', 'questionQuality.ts');

export async function loadQuestionQuality() {
  try {
    return await import(pathToFileURL(TS_ENTRY).href);
  } catch (directError) {
    const tmp = mkdtempSync(join(tmpdir(), 'qb-quality-'));
    const bundlePath = join(tmp, 'questionQuality.mjs');
    try {
      const { buildSync } = await import('esbuild');
      buildSync({ entryPoints: [TS_ENTRY], bundle: true, format: 'esm', outfile: bundlePath, logLevel: 'silent' });
      return await import(pathToFileURL(bundlePath).href);
    } catch (bundlingError) {
      console.error('❌ Could not load utils/questionQuality.ts');
      console.error(`   direct import : ${directError.message}`);
      console.error(`   esbuild       : ${bundlingError.message}`);
      console.error('   → use Node 22.18+ or run `npm install` so esbuild is available.');
      process.exit(1);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }
}
