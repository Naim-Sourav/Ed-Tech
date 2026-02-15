
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    // Use relative base to ensure assets work in both root and subpath environments (Cloudflare & IDX)
    base: './', 
    resolve: {
      alias: {
        '@': path.resolve('./src'), // আপনার ফোল্ডার স্ট্রাকচার অনুযায়ী পাথ ঠিক করা হলো
      },
    },
    // এই অংশটি প্রিভিউ সমস্যা সমাধান করবে
    server: {
      host: true, // এটি প্রিভিউকে পারমিশন দেয়
      cors: true, // এটি ব্লকিং সমস্যা দূর করে
      port: 5173,
      strictPort: true, // পোর্ট ফিক্সড রাখবে
      hmr: {
        clientPort: 443 // Google AI Studio বা ক্লাউড প্রিভিউ-এর জন্য এটি মাঝে মাঝে লাগে
      }
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
