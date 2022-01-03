import { state } from './state';

export const cleanupBrowser = async (): Promise<void> => {
  const pages = state.browserContextInstance?.pages() ?? [];
  for (const page of pages) {
    for (const beforeClose of page._safetest_internal.hooks.beforeClose) {
      await beforeClose(page);
    }
    await page._safetest_internal.originalMethods.close();
  }
  await state.browserContextInstance?.browser()?.close();
  delete state.browserContextInstance;
  for (const page of pages) {
    for (const afterClose of page._safetest_internal.hooks.afterClose) {
      await afterClose(page);
    }
  }
};
