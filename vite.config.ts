
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    // Changed to relative base './' to prevent path issues in different deployment environments (PWA friendliness)
    base: '/', 
    resolve: {
      alias: {
        '@': path.resolve('.'), 
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
