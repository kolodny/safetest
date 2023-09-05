/// <reference types="vitest" />

import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { exec } from 'child_process';
import { mkdir, rmdir } from 'fs/promises';
import path from 'path';

const env = process.env.NODE_ENV || 'development';

const root = path.resolve(__dirname, '../..');
const lib = `node_modules/safetest`;
const link = async () => {
  if (env === 'test') return;
  try {
    await rmdir(lib, { recursive: true });
  } catch {
    // ignore
  }
  await mkdir(`${lib}/lib`, { recursive: true });
  await new Promise((res) => exec(`cp ${root}/* ${lib}/`, res));
  await new Promise((res) => exec(`cp ${root}/lib/* ${lib}/lib/`, res));
};

// https://vitejs.dev/config/
export default defineConfig({
  base: '/vite-svelte-ts/',
  server: {
    port: env === 'test' ? 3001 : 3000,
  },
  plugins: [
    {
      name: 'safetest linker',
      buildStart: link,
      handleHotUpdate: link,
    },
    svelte(),
  ],
  test: {
    globals: true,
    testTimeout: 3000000,
    reporters: ['basic', 'json'],
    outputFile: 'results.json',
    setupFiles: ['setup-safetest'],
    include: ['**/*.safetest.?(c|m)[jt]s?(x)'],
  },
});
