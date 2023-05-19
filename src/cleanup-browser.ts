import { state } from './state';

export const cleanupBrowser = async (): Promise<void> => {
  const context = state.browserContextInstance;
  if (!context) return;
  const pages = context?.pages() ?? [];
  for (const page of pages) {
    const hooks = page._safetest_internal?.hooks;
    for (const beforeClose of hooks?.beforeClose ?? []) {
      await beforeClose(page);
    }
    await page.close();
  }
  await context?.close();
  await context?.browser()?.close();
  delete state.browserContextInstance;
};
