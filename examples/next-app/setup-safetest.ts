import { setup } from 'safetest/setup';

setup({
  // eslint-disable-next-line no-undef
  bootstrappedAt: require.resolve('./src/app/layout.tsx'),
  ciOptions: {
    usingArtifactsDir: 'artifacts',
  },
});
