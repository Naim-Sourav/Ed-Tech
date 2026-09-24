
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Dev-only middleware: serve the generated static SEO pages (dist/q/<slug>/,
// dist/hsc-syllabus/…) straight from the dev server, mirroring production
// where the static host answers these paths before the SPA fallback.
const serveStaticSeo = {
  name: 'serve-static-seo-pages',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      try {
        const url = decodeURIComponent((req.url || '').split('?')[0]);
        if (/^\/(q|hsc-syllabus)(\/|$)/.test(url)) {
          const root = path.resolve(process.cwd(), 'dist');
          const rel = url.replace(/\/+$/, '').replace(/^\/+/, '');
          const file = path.join(root, rel, 'index.html');
          if (file.startsWith(root + path.sep) && fs.existsSync(file)) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(fs.readFileSync(file));
            return;
          }
        }
      } catch {
        /* fall through to SPA */
      }
      next();
    });
  },
};

// https://vitejs.dev/config/
export default defineConfig(({ mode: _mode }) => {
  return {
    plugins: [react(), serveStaticSeo],
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-is', 'react-router-dom', 'motion'],
      exclude: ['@react-three/fiber', '@react-three/drei', 'three'],
    },
    // Changed to relative base './' to make it portable across GitHub Pages and Vercel
    base: './', 
    resolve: {
      alias: {
        '@': path.resolve('.'),
        'react-is': path.resolve('./node_modules/react-is'),
      },
    },
    // এই অংশটি প্রিভিউ সমস্যা সমাধান করবে
    server: {
      host: true,
      cors: true,
      port: 3000,
      strictPort: true,
      allowedHosts: true, 
      hmr: {
        clientPort: 443
      }
    },
    preview: {
      host: true,
      port: 4173,
      strictPort: true,
      allowedHosts: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-is'],
            utils: ['@google/genai', 'react-markdown', 'lucide-react']
          }
        }
      }
    }
  };
});
