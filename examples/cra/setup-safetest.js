import { setup } from 'safetest/jest-setup';

setup({
    api: { beforeAll, setTimeout: (ms) => jest.setTimeout(ms) },
    options: {
        ciOptions: {
            usingArtifactsDir: '../../build/cra/artifacts'
        }
    }
});
