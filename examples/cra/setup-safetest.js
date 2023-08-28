import { setup } from 'safetest/jest-setup';

setup({
    api: jest,
    options: {
        ciOptions: {
            usingArtifactsDir: '../../build/cra/artifacts'
        }
    }
});
