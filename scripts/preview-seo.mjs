#!/usr/bin/env node
/**
 * scripts/preview-seo.mjs
 * ---------------------------------------------------------------------------
 * Zero-dependency static server for eyeballing the generated SEO pages.
 * Rewrites the absolute production origin into root-relative URLs so the same
 * build works on any host (sandbox preview, localhost, …).
 *
 *   node scripts/preview-seo.mjs --dir dist --port 4173
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';

const argv = process.argv;
const dirArg = argv.indexOf('--dir');
const DIR = dirArg !== -1 ? argv[dirArg + 1] : 'dist';
const portArg = argv.indexOf('--port');
const PORT = portArg !== -1 ? Number(argv[portArg + 1]) : 4173;
const ORIGIN = 'https://www.porikkhangon.app';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
};

const FALLBACK_DIRS = ['public', '.'];

createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    p = normalize(p).replace(/^(\.\.[/\\])+/, '');

    let file = join(DIR, p);
    let st = null;
    try {
      st = await stat(file);
    } catch {
      // fall back to the repo's public/ assets (logo, og image, icons)
      for (const base of FALLBACK_DIRS) {
        const alt = join(base, p);
        try {
          st = await stat(alt);
          file = alt;
          break;
        } catch {
          /* keep looking */
        }
      }
    }
    if (!st || st.isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404</h1>');
      return;
    }

    const type = TYPES[extname(file).toLowerCase()] || 'application/octet-stream';
    let buf = await readFile(file);
    if (type.startsWith('text/') || type === 'application/xml; charset=utf-8') {
      buf = Buffer.from(buf.toString('utf8').split(ORIGIN).join(''), 'utf8');
    }
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    res.end(buf);
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(String(e));
  }
}).listen(PORT, '0.0.0.0', () => {
  console.log(`[preview] serving ${DIR} on http://0.0.0.0:${PORT}`);
});
