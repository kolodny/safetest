import { setup } from 'safetest/setup';

vitest.setConfig({ testTimeout: 30000 });

setup({
  bootstrappedAt: require.resolve('./src/main.tsx'),
  ciOptions: {
    usingArtifactsDir: 'artifacts',
  },
});
