import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    // Use /Ed-Tech/ for production (GitHub Pages), otherwise use root / for dev
    base: mode === 'production' ? '/Ed-Tech/' : '/',
    resolve: {
      alias: {
        '@': path.resolve('./'),
      },
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