/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'foliate-js': fileURLToPath(new URL('./vendor/foliate-js', import.meta.url)),
    },
  },
  // foliate-js usa ESM puro com imports relativos; deixa o Vite servir
  // como source em vez de pre-bundle.
  optimizeDeps: {
    exclude: ['foliate-js'],
  },
  server: {
    port: 5173,
    strictPort: true,
    fs: {
      // Permite servir ficheiros do submódulo vendor/.
      allow: ['..', '.'],
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    passWithNoTests: true,
    exclude: ['tests/e2e/**', '**/node_modules/**'],
  },
});
