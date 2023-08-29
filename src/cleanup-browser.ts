import { state } from './state';

export const cleanupBrowser = async (): Promise<void> => {
  const context = state.browserContextInstance;
  if (!context) return;
  let closed = false;
  context.once('close', () => (closed = true));
  const pages = context.pages() ?? [];
  for (const page of pages) {
    const hooks = page._safetest_internal?.hooks;
    for (const beforeClose of hooks?.beforeClose ?? []) {
      await beforeClose(page);
    }
    await page.close();
  }
  if (!closed) await context.close();
  if (!closed) await context.browser()?.close();
  delete state.browserContextInstance;
};
