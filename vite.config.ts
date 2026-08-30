
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode: _mode }) => {
  return {
    plugins: [react()],
    optimizeDeps: {
      include: ['react-is']
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
      port: 5174,
      strictPort: false,
      allowedHosts: true, 
      hmr: {
        clientPort: 443
      }
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
