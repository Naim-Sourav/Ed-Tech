import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Ed-Tech/', // Updated to match your GitHub repository name
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
});
