import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { setup } from 'safetest/setup';

const pathToExtension = path.resolve('ext');

const persistentContext = mkdtempSync(path.join(tmpdir(), 'safetest-'));

setup({
  // eslint-disable-next-line no-undef
  bootstrappedAt: require.resolve('./src/main.tsx'),
  headless: false,
  persistentContext,
  args: [
    `--disable-extensions-except=${pathToExtension}`,
    `--load-extension=${pathToExtension}`,
  ],
});
