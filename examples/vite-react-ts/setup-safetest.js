import { setup } from 'safetest/jest-setup';
import * as vitest from 'vitest';

setup({
  runner: 'vitest',
  api: {
    setTimeout: (ms) => vitest.vitest.setConfig({ testTimeout: ms }),
    beforeAll: vitest.beforeAll,
  },
  options: {
    ciOptions: {
      usingArtifactsDir: '../../build/vite-react-ts/artifacts',
    },
  },
});
