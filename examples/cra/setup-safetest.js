import { setup } from 'safetest/setup';

setup({
    api: { beforeAll, setTimeout: (ms) => jest.setTimeout(ms) },
    options: {
        ciOptions: {
            usingArtifactsDir: '../../build/cra/artifacts'
        }
    }
});
