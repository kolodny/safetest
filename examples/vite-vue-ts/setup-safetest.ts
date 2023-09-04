import { setup } from 'safetest/jest-setup';
import * as vitest from 'vitest';

setup({
  runner: 'vitest',
  api: {
    setTimeout: (ms) => vitest.vitest.setConfig({ testTimeout: ms }),
    beforeAll: vitest.beforeAll as any,
  },
  options: {
    ciOptions: {
      usingArtifactsDir: '../../build/vite-vue-ts/artifacts',
    },
  },
});
