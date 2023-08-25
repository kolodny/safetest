/// <reference types="vitest" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { exec } from 'child_process';
import { rmdir, mkdir, cp } from 'fs/promises';

const root = path.resolve(__dirname, '../..');
const lib = `node_modules/safetest`;
const link = async () => {
  try {
    await rmdir(lib, { recursive: true });
  } catch {}
  await mkdir(`${lib}/lib`, { recursive: true });
  await new Promise((res) => exec(`cp ${root}/* ${lib}/`, res));
  await new Promise((res) => exec(`cp ${root}/lib/* ${lib}/lib/`, res));
};

console.log(root);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'safetest linker',
      buildStart: link,
      handleHotUpdate: link,
    },
    react(),
  ],
  test: {
    include: ['**/*.safetest.?(c|m)[jt]s?(x)'],
  },
});
