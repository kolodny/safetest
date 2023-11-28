import { setup } from 'safetest/setup';

setup({
    bootstrappedAt: require.resolve('./src'),
    ciOptions: {
        usingArtifactsDir: 'artifacts'
    }
});
