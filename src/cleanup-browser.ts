import { SafePage } from './safepage';
import { state } from './state';

const ignoreError = (promise?: Promise<any>) => promise?.catch(() => {});

export const cleanupBrowser = async (): Promise<void> => {
  const context = state.browserContextInstance;
  if (!context) return;
  const browser = context.browser();
  let connected = true;
  browser?.once('disconnected', () => (connected = false));

  const pages = context.pages() ?? [];
  for (const page of pages as SafePage[]) {
    const hooks = page._safetest_internal?.hooks;
    for (const beforeClose of hooks?.beforeClose ?? []) {
      await ignoreError(beforeClose(page));
    }
    await ignoreError(page.close());
  }
  await ignoreError(context?.close());

  const docker = state.options.useDocker;
  if (!docker && connected && browser?.isConnected()) {
    await ignoreError(browser?.close());
  }

  delete state.browserContextInstance;
};
