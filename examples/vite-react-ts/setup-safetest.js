import { setup } from 'safetest/setup';

vitest.setConfig({ testTimeout: 30000 });

setup({
  ciOptions: {
    usingArtifactsDir: '../../build/vite-react-ts/artifacts',
  },
});
