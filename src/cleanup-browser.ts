import { SafePage } from './safepage';
import { state } from './state';

export const cleanupBrowser = async (): Promise<void> => {
  const context = state.browserContextInstance;
  const browser = context?.browser();
  if (!context) return;
  let closed = false;
  context.once('close', () => (closed = true));
  const pages = context.pages() ?? [];
  for (const page of pages as SafePage[]) {
    const hooks = page._safetest_internal?.hooks;
    for (const beforeClose of hooks?.beforeClose ?? []) {
      await beforeClose(page);
    }
    await page.close();
  }
  await browser?.close();
  if (!closed) {
    try {
      await context.close();
    } catch {}
  }

  delete state.browserContextInstance;
};
