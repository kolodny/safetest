import { setup } from 'safetest/setup';

jest.setTimeout(30000);

setup({
    ciOptions: {
        usingArtifactsDir: '../../build/cra/artifacts'
    }
});
