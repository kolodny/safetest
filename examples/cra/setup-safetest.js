import { setup } from 'safetest/setup';

jest.setTimeout(30000);

setup({
    bootstrappedAt: require.resolve('./src'),
    ciOptions: {
        usingArtifactsDir: 'artifacts'
    }
});
