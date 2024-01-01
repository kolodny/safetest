import { SafePage } from './safepage';
import { state } from './state';

const tryFn = async (fn: () => any) => {
  try {
    return await fn();
  } catch {}
};

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
      await tryFn(() => beforeClose(page));
    }
    await tryFn(() => page.close());
  }
  await tryFn(() => context?.close());
  if (!closed) await tryFn(() => browser?.close());
  delete state.browserContextInstance;
};
