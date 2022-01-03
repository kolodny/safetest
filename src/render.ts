/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Page } from 'playwright';
import merge from 'deepmerge';

import { state } from './state';
import { isInNode } from './is-in-node';
import { getPage, RenderOptions } from './get-page';
import { fs, path } from './safe-node-imports';
import { ensureDir } from './ensure-dir';
import { SafePage } from './safepage';
import { makePause } from './make-pause';
import { getRetryAttempt } from './get-retry-attempt';

interface RenderReturn {
  /** The Playwright page object of the rendered component. */
  page: Page;
  /** Pause current test. */
  pause: () => Promise<void>;
}

interface RenderReturnWithApi<
  API extends { [K: string]: (...args: any[]) => any }
> extends RenderReturn {
  /** The API object to communicate with the rendered component */
  api: {
    // Strip off the `this` context on the node calling side.
    [K in keyof API]: (
      ...args: Parameters<API[K]>
    ) => ReturnType<API[K]> extends Promise<any>
      ? ReturnType<API[K]>
      : Promise<ReturnType<API[K]>>;
  };
}

type RenderableThing = { __isRenderable: true; thing: any };

const IGNORE_CONSOLE_MESSAGES = [
  /^\[vite\] connected\.$/,
  /^\[vite\] connecting\.\.\.$/,
  /^Download the Vue Devtools extension for a better development experience/,
  /^You are running Vue in development mode/,
  /^%cDownload the React DevTools for a better development experience/,
  /\[HMR\] Waiting for update signal from WDS\.\.\.$/,
  /^\[webpack-dev-server\] Live Reloading enabled.$/,
  /^Go to .* to debug this test$/,
];

export async function render<
  API extends { [K: string]: (...args: any[]) => any }
>(
  element: RenderableThing,
  api: API,
  options: RenderOptions,
  howToRender: (
    element: RenderableThing,
    container: HTMLElement | string
  ) => Promise<any>
): Promise<RenderReturnWithApi<API>> {
  if (state.options) {
    options = merge(options, state.options);
  }
  if (typeof process !== 'undefined' && process.env.SAFETEST_OPTIONS) {
    options = merge(
      options,
      JSON.parse(process.env.SAFETEST_OPTIONS) as RenderOptions
    );
  }
  options.headless = state.debugging.has(state.activeTest ?? '')
    ? false
    : 'headless' in options
    ? options.headless
    : true;
  options.url =
    options.url ??
    (typeof process !== 'undefined'
      ? process.env.BASE_URL
      : 'http://localhost:3000') ??
    'http://localhost:3000';

  if (isInNode) {
    let page = state.browserContextInstance?.pages()[0] as SafePage;

    let moduleParentId = '';
    if (module && module.id && module.parent) {
      let current = module;
      while (current?.id && current.id.includes('node_modules/safetest/')) {
        current = current.parent as any;
      }
      moduleParentId = current?.id;
    }
    const filename =
      state.__filename || moduleParentId || require.main?.filename || '';
    let fullPath = path.dirname(filename);
    let pathToUse = '';
    while (fullPath.length > 1 && !pathToUse) {
      if ((await fs.readdir(fullPath)).includes('node_modules')) {
        pathToUse = fullPath;
      }
      fullPath = path.dirname(fullPath);
    }

    const videoDir = options.recordVideo?.dir ?? options.videosPath;
    const testName = state.activeTest;

    const testPath = filename
      .replace(pathToUse, '')
      .replace(/^\//, '')
      .replace(/\.[jt]sx?$/g, '');
    let safetestApiReady = Promise.resolve();
    let pageIsReadyResolve: (() => void) | undefined = undefined;
    const pageIsReady = new Promise(
      (resolve) => (pageIsReadyResolve = resolve as any)
    );
    const isMultiTab = page?._safetest_internal.ownerOfTest === testName;
    const switchingHeadlessness =
      state.browserContextInstance &&
      state.browserContextInstance.headless !== options.headless;
    if (!page || isMultiTab || videoDir || switchingHeadlessness) {
      // If there is videoDir for this test, we need can't reuse an old browserContext that
      // wasn't recording video.
      ({ page } = await getPage(options, !!videoDir || switchingHeadlessness));

      let functionExposed: Promise<void> = undefined as any;
      safetestApiReady = new Promise<void>((resolve) => {
        functionExposed =
          page._safetest_internal.originalMethods.exposeFunction(
            'safetestApi',
            (type: string, ...args: any[]) => {
              if (type === 'READY') {
                page._safetest_internal.renderIsReadyResolve?.();
                resolve();
                return;
              }
              if (type === 'GET_INFO') {
                return {
                  testName: state.activeTest,
                  testPath,
                  retryAttempt: getRetryAttempt(),
                };
              }
              console.log({ type, args });
            }
          );
      });
      await functionExposed;
    }
    page._safetest_internal.renderIsReadyResolve = pageIsReadyResolve;

    page._safetest_internal = merge(page._safetest_internal, {
      ownerOfTest: state.activeTest ?? '',
      coveragePath: options.coverageDir,
      videoDir,
      failureScreenshotsPath: options.failureScreenshotsDir,
    } as Partial<SafePage['_safetest_internal']>);

    for (const beforeNavigate of page._safetest_internal.hooks.beforeNavigate) {
      await beforeNavigate(page);
    }

    for (const key of Object.keys(api ?? {}) as Array<keyof API>) {
      const fnString = (api[key] as any).toString().replace(/^async ?/, '');
      (api[key] as any) = async (...args: any) => {
        return page._safetest_internal.originalMethods.evaluate(
          ({ key, args }) => {
            return (window as any).safetestApi?.[key](...args);
          },
          { key, args }
        );
      };
      (api[key] as any).toString = () => `async ${fnString}`;
    }

    const isDebugging = state.debugging.has(testName ?? '');

    const pause = await makePause({ page, api, isDebugging });

    page._safetest_internal.originalMethods.on('console', async (msg) => {
      const text = msg.text();
      for (const ignore of IGNORE_CONSOLE_MESSAGES) {
        if (ignore.test(text)) {
          return;
        }
      }

      try {
        const args = (
          await Promise.all(msg.args().map((a) => a.jsonValue()))
        ).map((a) => JSON.stringify(a));
        console.log(`${msg.type()} FROM BROWSER:`, ...args);
      } catch {
        console.log(`${msg.type()} FROM BROWSER (non-serializable):`, text);
      }
    });

    if (page._safetest_internal.failureScreenshotDir) {
      page._safetest_internal.hooks.beforeClose.push(async () => {
        const passed = state.passedTests.has(state.activeTest ?? '');
        if (!passed) {
          for (const page of state.browserContextInstance?.pages() ?? []) {
            await page.screenshot({
              path: `${page._safetest_internal.failureScreenshotDir}/failure-for-${testName}.png`,
            });
          }
        }
      });
    }

    if (page._safetest_internal.videoDir) {
      page._safetest_internal.hooks.afterClose.push(async () => {
        await ensureDir(page._safetest_internal.videoDir!);

        const videoFilename = await page?.video()?.path();

        await fs.rename(
          path.join(
            page._safetest_internal.videoDir!,
            path.basename(videoFilename!)
          ),
          path.join(page._safetest_internal.videoDir!, `${testName}.webm`)
        );
      });
    }

    await page._safetest_internal.originalMethods.goto(options.url!, {
      waitUntil: 'domcontentloaded',
    });
    await pageIsReady;

    const debugUrl = await page._safetest_internal.originalMethods.evaluate(
      ({ testName, testPath }) => {
        const url = new URL(window.location.href);
        url.searchParams.set('test_name', testName!);
        url.searchParams.set('test_path', testPath!);
        const debugUrl = url.toString().replace(/%2F/g, '/');
        console.log(`Go to ${debugUrl} to debug this test`);
        return debugUrl;
      },
      { testName, testPath }
    );

    if (isDebugging) {
      console.log(`Go to ${debugUrl} to debug this test`);
    }
    page._safetest_internal.hooks.afterTest.push(async () => {
      const passed = state.passedTests.has(state.activeTest ?? '');
      if (!passed && !isDebugging) {
        console.log(
          `'${state.activeTest}' Failed. Go to ${debugUrl} to debug this test`
        );
      }
    });

    await safetestApiReady;
    const rendered = { page, pause };
    if (api) {
      (rendered as any).api = api;
    }
    return rendered as any;
  } else {
    if (!state.browserState) {
      throw new Error('App was not bootstrapped to use safetest correctly');
    }
    await howToRender(element, state.browserState.renderContainer.value as any);
    for (const key of Object.keys(api ?? {}) as Array<keyof API>) {
      if (!(window as any).safetestApi) {
        (window as any).safetestApi = {};
      }
      (window as any).safetestApi[key] = (...args: any[]) => {
        return (api?.[key] as any)(...args);
      };
      (window as any).safetestApi[key].toString = () =>
        (api?.[key] as any)?.toString();
    }
    if (typeof (window as any).safetestApi === 'function') {
      (window as any).safetestApi?.('READY');
    }

    // In browser, hang the call to render so expect(...) calls aren't made, the bootstrapping
    // will take over from here.
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await new Promise(() => {});
    return {} as any;
  }
}
