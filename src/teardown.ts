/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { cleanupBrowser } from './cleanup-browser';
import { state } from './state';

export const afterEachFn = async () => {
  const pages = state.browserContextInstance?.pages() ?? [];
  if (pages.length > 1) {
    // Previous test had multiple tabs open, don't attempt to reuse any of them.
    await cleanupBrowser();
    return;
  }
  for (const page of pages) {
    for (const afterTest of page._safetest_internal.hooks.afterTest) {
      await afterTest(page);
    }
    page._safetest_internal.ownerOfTest = '';
    page._safetest_internal.hooks.afterTest = [];
  }
  if (pages.some((page) => page._safetest_internal.videoDir)) {
    // We need to close the browser so we don't keep all the recorded video data in memory for all tests before flushing.
    await cleanupBrowser();
    return;
  }
};

export const afterAllFn = async () => {
  await cleanupBrowser();
};
