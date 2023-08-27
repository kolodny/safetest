import { setup } from 'safetest/jest-setup';

setup({
    options: {
        ciOptions: {
            usingArtifactsDir: '../../build/cra/artifacts'
        }
    }
});
