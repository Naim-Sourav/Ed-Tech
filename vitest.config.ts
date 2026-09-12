import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['utils/**/*.test.ts', 'services/**/*.test.ts', 'components/**/*.test.tsx'],
    globals: false,
  },
});
