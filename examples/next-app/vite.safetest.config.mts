import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'url';

import base from './vite.config.mjs';

// https://vitejs.dev/config/
export default defineConfig({
  ...base,
  resolve: {
    ...base.resolve,
    alias: {
      ...base.resolve?.alias,

      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    testTimeout: 30000,
    reporters: ['basic', 'json'],
    outputFile: 'results.json',
    setupFiles: ['setup-safetest'],
    include: ['**/*.safetest.?(c|m)[jt]s?(x)'],
    poolOptions: {
      threads: {
        singleThread: true,
      },
      forks: {
        singleFork: true,
      },
    },
    inspect: process.env.CI ? false : true,
  },
});
