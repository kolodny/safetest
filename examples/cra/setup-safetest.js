import { setup } from 'safetest/jest-setup';

setup({
    api: {
        beforeAll: jest.beforeAll,
        setTimeout: jest.setTimeout
    },
    options: {
        ciOptions: {
            usingArtifactsDir: '../../build/cra/artifacts'
        }
    }
});
