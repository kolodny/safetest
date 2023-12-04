/* eslint-disable @typescript-eslint/ban-types */
import { cleanupBrowser } from './cleanup-browser';
import { state } from './state';
import type { SafePage } from './safepage';

export const afterEachFn = async () => {
  const pages = (state.browserContextInstance?.pages() as SafePage[]) ?? [];
  for (const [_index, page] of Object.entries(pages)) {
    const index = +_index;
    const hooks = page._safetest_internal?.hooks;
    const toRemove: number[] = [];
    for (const [index, afterTest] of Object.entries(hooks?.afterTest ?? [])) {
      await afterTest(page);
      if (!(afterTest as any).__isGlobal) {
        toRemove.push(+index);
      }
    }
    for (const index of toRemove.reverse()) {
      hooks?.afterTest.splice(index, 1);
    }
    if (index) {
      const hooks = page._safetest_internal?.hooks;
      for (const beforeClose of hooks?.beforeClose ?? []) {
        await beforeClose(page);
      }
      await page.close();
    }
  }
};

export const afterAllFn = async () => {
  state.currentSuite = '';

  await cleanupBrowser();
  for (const afterAllDone of state.afterAllsDone ?? []) {
    await afterAllDone();
  }
  // state.afterAllsDone = [];
};
