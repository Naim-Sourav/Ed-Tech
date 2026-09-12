/**
 * Cloudflare Worker — routes the SEO surfaces of www.porikkhangon.app to the
 * Render backend (which server-renders a page for EVERY question in the DB)
 * while everything else keeps coming from GitHub Pages.
 *
 * Deploy:
 *   1. Cloudflare dashboard → Workers & Pages → Create → Worker.
 *   2. Paste this file.
 *   3. Settings → Triggers → Add Route:
 *        Route:   www.porikkhangon.app/*
 *        Zone:    porikkhangon.app
 *   4. DNS: `www` CNAME -> naim-sourav.github.io, proxy ON (orange cloud).
 *      (GitHub Pages → Settings → Pages → Custom domain must still list
 *       www.porikkhangon.app.)
 *
 * No Worker needed if you move hosting to Cloudflare Pages — then the rules in
 * public/_redirects do the same job.
 */

const BACKEND = 'https://mongodb-hb6b.onrender.com';

/** Paths the backend renders dynamically. */
const SSR = [
  /^\/q\/[^/]+\/?$/,              // question pages
  /^\/sitemap\.xml$/,             // sitemap (index)
  /^\/sitemap-questions-\d+\.xml$/, // sitemap parts
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = decodeURIComponent(url.pathname);

    if (request.method === 'GET' && SSR.some((re) => re.test(path))) {
      const upstream = await fetch(`${BACKEND}${path}`, {
        headers: { 'User-Agent': 'porikkhangon-edge/1.0' },
        // Cloudflare caches the upstream response at the edge for 1 h.
        cf: { cacheTtl: 3600, cacheEverything: true },
      });

      const headers = new Headers(upstream.headers);
      headers.set('X-Served-By', 'porikkhangon-ssr');
      return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers });
    }

    // Everything else -> GitHub Pages origin.
    return fetch(request);
  },
};
