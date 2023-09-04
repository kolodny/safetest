/// <reference types="vitest" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { exec } from 'child_process';
import { rmdir, mkdir } from 'fs/promises';

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

const env = process.env.NODE_ENV || 'development';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/vite-react-ts/',
  server: {
    port: env === 'test' ? 3001 : 3000,
  },
  plugins: [
    {
      name: 'safetest linker',
      buildStart: link,
      handleHotUpdate: link,
    },
    react(),
  ],
  test: {
    globals: true,
    reporters: ['basic', 'json'],
    outputFile: 'results.json',
    setupFiles: ['setup-safetest'],
    include: ['**/*.safetest.?(c|m)[jt]s?(x)'],
  },
});
