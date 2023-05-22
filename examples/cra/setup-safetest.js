import { setup } from 'safetest/jest-setup';

setup({
    ciOptions: {
        usingArtifactsDir: '../../build/cra/artifacts'
    }
});
