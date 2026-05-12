import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.js',
    css: true,
    include: ['src/__tests__/unit/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['src/__tests__/acceptance/**'],
  },
});
