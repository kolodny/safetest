import { setup } from 'safetest/setup';
import * as vitest from 'vitest';

setup({
  runner: 'vitest',
  api: {
    setTimeout: (ms) => vitest.vitest.setConfig({ testTimeout: ms }),
    beforeAll: vitest.beforeAll,
  },
  options: {
    defaultTimeout: 3000000,
    defaultNavigationTimeout: 3000000,
    timeout: 3000000,
    ciOptions: {
      usingArtifactsDir: '../../build/vite-svelte-ts/artifacts',
    },
  },
});
