import { setup } from 'safetest/setup';

vitest.setConfig({ testTimeout: 30000 });

setup({
  bootstrappedAt: require.resolve('./src.main.ts'),
  ciOptions: {
    usingArtifactsDir: '../../build/vite-svelte-ts/artifacts',
  },
});
