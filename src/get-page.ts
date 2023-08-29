import merge from 'deepmerge';

import fetch from 'node-fetch';

import { state } from './state';
import { isInNode } from './is-in-node';
import { safeRequire } from './safe-require';
import { SafePage } from './safepage';
import { cleanupBrowser } from './cleanup-browser';
import { RenderOptions } from './render';
import { overrideEvents } from './override-events';

interface RenderReturn {
  /** The Playwright page object of the rendered component. */
  page: SafePage;
}

const makeWarning = (msg: string) => {
  let warnOnce = false;
  return (console: Console) => {
    if (warnOnce) return;
    warnOnce = true;
    console.warn(msg);
  };
};

const warnOpeningLocal = makeWarning(
  'Docker and headed mode detected, opening a local browser with a remote debug connection.'
);

export async function getPage(
  options: RenderOptions = {},
  forceNewBrowser = false
): Promise<RenderReturn> {
  if (!isInNode) return {} as any;

  const playwright = safeRequire('playwright');

  if (forceNewBrowser) {
    await cleanupBrowser();
  }

  if (!state.browserContextInstance) {
    const server = options.browserServer;
    const browserType = playwright[options.browser ?? 'chromium'];
    const browser = server
      ? await browserType.connect(server)
      : await browserType.launch(options);
    state.nextIndex = 0;
    const started = Date.now();
    state.browserContextInstance = await browser.newContext(options);

    state.browserContextInstance.on('page', (page) => {
      if ((page as SafePage)._safetest_internal) return;
      (page as SafePage)._safetest_internal = {
        pageIndex: state.nextIndex++,
        started: Date.now() - started!,
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

      if (options.defaultTimeout) {
        page.setDefaultTimeout(options.defaultTimeout);
      }
      if (options.defaultNavigationTimeout) {
        page.setDefaultNavigationTimeout(options.defaultNavigationTimeout);
      }

      if (options.enableScreenCasting) {
        overrideEvents(page);
      }
    });
    if (typeof options.headless !== 'undefined' && !server) {
      state.browserContextInstance.headless = options.headless;
    }
    state.browserContextInstance.setDefaultTimeout(3000);
  }

  const server = options.browserServer;
  const page =
    state.browserContextInstance.pages()[0] ??
    ((await state.browserContextInstance.newPage()) as SafePage);

  if (server) {
    const debugPageShown = new Set<string>();

    const logDebugTabs = async () => {
      const debugPort = state.debugPort;
      const console = safeRequire('console');
      const r2 = safeRequire('r2').default;
      const redirectServer = safeRequire('./redirect-server');

      let list = [];
      try {
        const listUrl = `http://127.0.0.1:${debugPort}/json/list`;
        const response = await fetch(listUrl);
        list = await response.json();
      } catch {}
      const items: string[] = list.map((l: any) => l.devtoolsFrontendUrl);
      const itemsSet = new Set(items);
      const newItems = items.filter((url) => !debugPageShown.has(url));
      const removedItems = Array.from(debugPageShown).filter(
        (url) => !itemsSet.has(url)
      );
      const MY_IP = process.env['MY_IP'] || '127.0.0.1';
      for (const url of newItems) {
        const remoteUrl = url.replace('127.0.0.1', MY_IP);
        const debugUrl = `http://${MY_IP}:${debugPort}${remoteUrl}`;
        redirectServer.notify(0, debugUrl);
        if (options.headless === false) {
          warnOpeningLocal(console);
        }
        console.log(`Debug tab at: http://${MY_IP}:${debugPort}${remoteUrl}`);
      }
      for (const url of removedItems) {
        const remoteUrl = url.replace('127.0.0.1', MY_IP);
        const debugUrl = `http://${MY_IP}:${debugPort}${remoteUrl}`;
        debugPageShown.delete(url);
        console.log(`Closed tab    ${debugUrl}`);
      }
    };
    (page as SafePage)._safetest_internal.pageSetupPromise = logDebugTabs();
    page.on('close', logDebugTabs);
  }

  await page._safetest_internal.pageSetupPromise;

  return { page };
}
