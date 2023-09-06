import { setup } from 'safetest/setup';
import vitest from 'vitest';

vitest.vitest.setConfig({ testTimeout: 30000 });

setup({
  ciOptions: {
    usingArtifactsDir: '../../build/vite-react-ts/artifacts',
  },
});
