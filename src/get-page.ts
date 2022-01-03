/* eslint-disable @typescript-eslint/no-explicit-any */
import { BrowserContextOptions, LaunchOptions } from 'playwright';
import merge from 'deepmerge';

import { state } from './state';
import { isInNode } from './is-in-node';
import { playwright } from './safe-node-imports';
import { Hooks, SafePage } from './safepage';
import { pageMethods } from './playwright-page-keys';
import { cleanupBrowser } from './cleanup-browser';

export interface RenderOptions extends LaunchOptions, BrowserContextOptions {
  browser?: 'chromium' | 'firefox' | 'webkit';
  /** The base URL of the running app. Defaults to `localhost:3000` per CRA. */
  url?: string;
  /** Path to record coverage json files to for each test */
  coverageDir?: string;
  /** Path to failure-screenshots, defaults to `failure-screenshots/`. */
  failureScreenshotsDir?: string;
  hooks?: Partial<Hooks>;
}

interface RenderReturn {
  /** The Playwright page object of the rendered component. */
  page: SafePage;
}

export async function getPage(
  options: RenderOptions = {},
  forceNewBrowser = false
): Promise<RenderReturn> {
  if (!isInNode) return {} as any;

  if (forceNewBrowser) {
    await cleanupBrowser();
  }

  if (!state.browserContextInstance) {
    const browser = await playwright[options.browser ?? 'chromium'].launch(
      options
    );
    state.browserContextInstance = await browser.newContext(options);
    state.browserContextInstance.headless = options.headless;
    state.browserContextInstance.setDefaultTimeout(3000);
  }

  const page: SafePage =
    (await state.browserContextInstance.newPage()) as SafePage;
  page._safetest_internal = {
    originalMethods: {},
    hooks: merge(
      {
        beforeNavigate: [],
        beforeClose: [],
        afterClose: [],
        afterTest: [],
      },
      options.hooks ?? {}
    ),
  } as any;

  for (const method of pageMethods) {
    if (typeof (page as any)[method] === 'function') {
      (page._safetest_internal.originalMethods as any)[method] = (page as any)[
        method
      ].bind(page);
    }
  }

  return { page };
}
