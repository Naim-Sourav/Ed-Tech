
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    // Use repository name as base for GitHub Pages deployment
    base: mode === 'production' ? '/Ed-Tech/' : '/', 
    resolve: {
      alias: {
        '@': path.resolve('./src'), // আপনার ফোল্ডার স্ট্রাকচার অনুযায়ী পাথ ঠিক করা হলো
      },
    },
    // এই অংশটি প্রিভিউ সমস্যা সমাধান করবে
    server: {
      host: true, // Allow access from network (required for preview and cloud environments)
      cors: true, // Enable CORS to prevent request blocking
      port: 5173,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            utils: ['@google/genai', 'react-markdown', 'lucide-react']
          }
        }
      }
    }
  };
});
