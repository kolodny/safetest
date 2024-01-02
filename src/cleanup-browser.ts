import { SafePage } from './safepage';
import { state } from './state';

const ignoreError = (promise?: Promise<any>) => promise?.catch(() => {});

export const cleanupBrowser = async (): Promise<void> => {
  const context = state.browserContextInstance;
  if (!context) return;
  const pages = context.pages() ?? [];
  for (const page of pages as SafePage[]) {
    const hooks = page._safetest_internal?.hooks;
    for (const beforeClose of hooks?.beforeClose ?? []) {
      await ignoreError(beforeClose(page));
    }
    await ignoreError(page.close());
  }
  await ignoreError(context?.close());

  setTimeout(() => {
    const browser = context.browser();
    if (browser?.isConnected()) ignoreError(browser?.close());
  }, 100);

  delete state.browserContextInstance;
};
