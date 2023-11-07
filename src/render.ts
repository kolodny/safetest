import type { Page, BrowserContextOptions, LaunchOptions } from 'playwright';

import merge from 'deepmerge';

import { state } from './state';
import { isInNode } from './is-in-node';
import { getPage } from './get-page';
import { SafeRequire, safeRequire } from './safe-require';
import { ensureDir } from './ensure-dir';
import { Hooks, SafePage } from './safepage';
import { makePause } from './make-pause';
import { getRetryAttempt } from './get-retry-attempt';
import { anythingProxy } from './anythingProxy';
import type { MatchImageSnapshotOptions } from 'jest-image-snapshot';
import { exposeFunction } from './expose-function';
import { deferred } from './defer';

export const SAFETEST_INTERFACE = '__safetestApi__';

const timeout = (ms: number) => new Promise((r) => setTimeout(r, ms).unref?.());

export interface Bridge {
  <Return>(callback: () => Return | Promise<Return>): Promise<Return>;
  <Args, Return>(
    args: Args,
    callback: (args: Args) => Return | Promise<Return>
  ): Promise<Return>;
}

export interface RenderOptions extends LaunchOptions, BrowserContextOptions {
  browser?: 'chromium' | 'firefox' | 'webkit';
  /** The base URL of the running app. Defaults to `localhost:3000` per CRA. */
  url?: string;
  /** Remote server to connect to. See https://playwright.dev/docs/api/class-browsertype#browser-type-launch-server */
  browserServer?: string;
  /** The subpath to navigate to when opening the page. */
  subPath?: string;
  /** options to use in CI. */
  ciOptions?:
    | {
        /**
         * Shorthand for:
         *
         *     failureScreenshotsDir: `${ARTIFACTS_DIR}/failure_screenshots`,
         *     recordVideo: { dir: `${ARTIFACTS_DIR}/videos` },
         *     recordTraces: `${ARTIFACTS_DIR}/traces`,
         *     matchImageSnapshotOptions: {
         *       customDiffDir: `${ARTIFACTS_DIR}/image_diffs`,
         *       storeReceivedOnFailure: true,
         *       customReceivedDir: `${ARTIFACTS_DIR}/updated_snapshots`,
         *       failureThreshold: 0,
         *     }
         */
        usingArtifactsDir: string;
      }
    | RenderOptions;
  /** Path to record coverage json files to for each test */
  // coverageDir?: string;
  /** Path to failure-screenshots, defaults to `failure-screenshots/`. */
  failureScreenshotsDir?: string;
  hooks?: Partial<Hooks>;
  recordTraces?: string;
  ignoreConsoleMessages?: RegExp[];
  /** The default timeout. See {@link Page.setDefaultTimeout} */
  defaultTimeout?: number;
  /** The default timeout for navigation. See {@link Page.setDefaultNavigationTimeout} */
  defaultNavigationTimeout?: number;
  matchImageSnapshotOptions?: MatchImageSnapshotOptions;
  /** Run the tests inside a docker container for consistency. */
  useDocker?: boolean;
  /** HACK: enable workaround to allow screen casting the page without breaking playwright events. */
  enableScreenCasting?: boolean;
  /** Only run test the following tests (full test name). */
  debugTests?: string[];
}

export interface RenderReturn {
  /** The Playwright page object of the rendered component. */
  page: Page;
  /** Pause current test. */
  pause: () => Promise<void>;
  /** Bridge API to communicate with browser from node */
  bridge: Bridge;
  /** Node require function, will return an `anything` proxy in the browser */
  require: SafeRequire;
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
  /^\[webpack-dev-server\] Server started/,
  /^Go to .* to debug this test$/,
  /^Download the Apollo DevTools/,
];

export async function render(
  element: RenderableThing,
  options: RenderOptions,
  howToRender: (
    element: RenderableThing,
    container: HTMLElement | string
  ) => Promise<any>
): Promise<RenderReturn> {
  const testName = state.activeTest;

  if (state.options) {
    options = merge(state.options, options);
  }
  state.pauseAtEveryStep = !!options.debugTests;

  if (typeof process !== 'undefined' && process.env['SAFETEST_OPTIONS']) {
    options = merge(
      options,
      JSON.parse(process.env['SAFETEST_OPTIONS']) as RenderOptions
    );
  }
  options.headless = state.debugging.has(testName ?? '')
    ? false
    : 'headless' in options
    ? options.headless
    : true;
  let url =
    options.url ??
    (typeof process !== 'undefined'
      ? process.env['BASE_URL']
      : 'http://localhost:3000') ??
    'http://localhost:3000';

  if (options.subPath) {
    const subPathSeparates = ['/', '?', '#', '&'].includes(
      options.subPath[0] ?? ''
    );
    const urlParts = new URL(url);
    const needsSlash = !urlParts.pathname.endsWith('/') && !subPathSeparates;
    url += (needsSlash ? '/' : '') + options.subPath;
  }

  if (isInNode) {
    const console = safeRequire('console');
    let page = state.browserContextInstance?.pages()[0] as SafePage;

    const inspector = safeRequire('inspector');
    const path = safeRequire('path');

    const filename = state.getState().testPath ?? '';

    const videoDir = options.recordVideo?.dir ?? options.videosPath;

    const safeName = testName?.replace(/[^a-z0-9_]/gi, '_');

    const bootstrapDir = path.dirname(state.bootstrappedAt);
    const filenameWithoutExt = filename.split('.').slice(0, -1).join('.');
    const relative = path.relative(bootstrapDir, filenameWithoutExt);
    const testPath = `./${relative}`;

    const attempt = getRetryAttempt();

    const switchingHeadlessness =
      state.browserContextInstance &&
      state.browserContextInstance.headless !== options.headless;
    if (!page || videoDir || switchingHeadlessness) {
      // If there is videoDir for this test, we need can't reuse an old browserContext that
      // wasn't recording video.
      ({ page } = await getPage(options, !!videoDir || switchingHeadlessness));

      if (!page._safetest_internal.safeTestExposed) {
        page._safetest_internal.safeTestExposed = true;
        await exposeFunction(
          page,
          SAFETEST_INTERFACE,
          async (type: string, ...args: any[]) => {
            const safetest_internal = page._safetest_internal;
            if (type === 'READY') {
              return safetest_internal.renderIsReadyDeferred?.resolve();
            }
            if (type === 'GET_INFO') {
              const info = {
                testName,
                testPath,
                retryAttempt: attempt,
              };
              const hooks = safetest_internal.hooks;
              for (const beforeRender of hooks.beforeRender ?? []) {
                await beforeRender(page, info);
              }
              return info;
            }
            if (type === 'BRIDGE') {
              const [response] = args;
              if ('result' in response) {
                safetest_internal.pendingBridge.resolve(response.result);
              } else {
                safetest_internal.pendingBridge.reject(response.error);
              }
              return;
            }
            console.log(
              'unhandled SAFETEST_INTERFACE call',
              JSON.stringify({ type, args })
            );
            return;
          }
        );
      }
    }

    page._safetest_internal = merge(page._safetest_internal, {
      // coveragePath: options.coverageDir,
      videoDir,
      failureScreenshotDir: options.failureScreenshotsDir,
    } as Partial<SafePage['_safetest_internal']>);

    if (options.recordTraces) {
      await page.context().tracing.start({
        screenshots: true,
        snapshots: true,
        sources: true,
        title: testName!,
      });
      const test = expect.getState().currentTestName ?? '<unknown>';
      const testPath = path
        .relative(process.cwd(), expect.getState().testPath!)
        .replace(/[^a-z0-9_]/g, '_');
      page._safetest_internal.hooks.afterTest.push(async () => {
        const path = `${options.recordTraces}/traces/${testPath}_${safeName}-attempt-${attempt}.zip`;
        state.artifacts.push({ type: 'trace', test, path, confirmed: true });
        try {
          await page.context().tracing.stop({ path });
        } catch {}
      });
    }

    const isDebugging = state.debugging.has(testName ?? '');

    state.exposeGlobals['page'] = page;
    const pause = (state.pause = await makePause({ page, isDebugging }));

    for (const beforeNavigate of page._safetest_internal.hooks.beforeNavigate) {
      await beforeNavigate(page);
    }

    const oldPagePause = page.pause;
    page.pause = (async () => {
      const url = inspector.url();
      let port = 0;
      if (url) {
        port = +new URL(url).port;
      }
      if (port) inspector.close();
      await oldPagePause.call(page);
      if (port) {
        inspector.open(port);
        inspector.waitForDebugger();
      }
    }) as any;

    const consoleMessagesGroups: Record<string, number> = {};
    page.on('console', async (msg) => {
      const text = msg.text();
      for (const ignore of [
        ...IGNORE_CONSOLE_MESSAGES,
        ...(options.ignoreConsoleMessages ?? []),
      ]) {
        if (ignore.test(text)) {
          return;
        }
      }

      try {
        const args = (
          await Promise.all(msg.args().map((a) => a.jsonValue()))
        ).map((a) => JSON.stringify(a));
        const params = [`${msg.type()}:`];
        if (args.length) params.push(...args);
        else params.push(text);
        const key = JSON.stringify(params);
        if (!consoleMessagesGroups[key]) consoleMessagesGroups[key] = 0;
        consoleMessagesGroups[key]++;
      } catch {
        const params = [`${msg.type()}:`, text];
        const key = JSON.stringify(params);
        if (!consoleMessagesGroups[key]) consoleMessagesGroups[key] = 0;
        consoleMessagesGroups[key]++;
      }
    });

    page._safetest_internal.hooks.afterTest.push(async () => {
      const consoleLines: string[] = [];
      const entries = Object.entries(consoleMessagesGroups);
      consoleLines.push('Console messages: ');
      for (const [key, count] of entries) {
        const args = JSON.parse(key).join(' ');
        consoleLines.push((count > 1 ? `(${count}X) ` : '') + `${args}`);
      }
      if (entries.length) {
        console.log(consoleLines.map((l, i) => (i ? `  ${l}` : l)).join('\n'));
      }
    });

    const failDir = page._safetest_internal.failureScreenshotDir;
    if (failDir) {
      page._safetest_internal.hooks.afterTest.push(async () => {
        const passed = state.passedTests.has(testName ?? '');
        if (!passed) {
          const pages = state.browserContextInstance?.pages();
          for (const [index, page] of pages?.entries() ?? []) {
            const suffix = index ? `_${index}` : '';
            const path = `${failDir}/${testName}${suffix}.png`;
            await page.screenshot({ path });
          }
        }
      });
    }

    if (videoDir) {
      const test = expect.getState().currentTestName ?? '<unknown>';
      const testPath = path
        .relative(process.cwd(), expect.getState().testPath!)
        .replace(/[^a-z0-9_]/g, '_');
      page._safetest_internal.hooks.afterTest.push(async () => {
        const pages = state.browserContextInstance?.pages() as SafePage[];
        for (const page of pages ?? []) {
          const index = page._safetest_internal.pageIndex;
          await ensureDir(videoDir);

          const suffix = (pages?.length ?? 0) > 1 ? `_tab${index}` : '';
          const newName = `${safeName}-attempt-${attempt}${suffix}.webm`;
          const path = `${videoDir}/${testPath}_${newName}`;
          state.artifacts.push({ type: 'video', test, path, confirmed: true });
          page?.video()?.saveAs(path);
        }
      });
    }

    // Workaround issue where Playwright sometimes doesn't goto the url after a call to page.goto()
    let gotoAttempts = 5;
    class PageReadyTimeoutError extends Error {
      override name = 'PageReadyTimeoutError';
    }
    const navigationTimeout = options.debugTests
      ? 60 * 60 * 1000
      : options.defaultNavigationTimeout ?? 30000;
    const gotoTestUrl: () => Promise<void> = async () => {
      const defer = deferred();
      page
        .goto(url, { waitUntil: 'commit', timeout: 500 })
        .catch(async (error) => {
          // Invoking evaluate kicks off the page navigation in case it failed.
          const href = await page
            .evaluate(() => window.location.href)
            .catch(() => page.url());
          if (href !== url) defer.reject(error);
        })
        .then(() => page._safetest_internal.renderIsReadyDeferred?.promise)
        .then(() => defer.resolve());

      const rejectForTimeout = () => defer.reject(new PageReadyTimeoutError());
      timeout(navigationTimeout).then(rejectForTimeout);
      return defer.promise.catch((error) => {
        const shouldRetry = gotoAttempts-- > 0;
        const plan = shouldRetry
          ? `retrying (attempts left: ${gotoAttempts + 1})...`
          : 'giving up';
        console.log(`page.goto error: ${error.name} on "${testName}" ${plan}`);
        if (shouldRetry) return gotoTestUrl();
        throw new PageReadyTimeoutError();
      });
    };

    page._safetest_internal.renderIsReadyDeferred = deferred();
    await gotoTestUrl();

    const debugUrl = await page.evaluate(
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
      const activeTest = testName ?? '';
      timeout(100).then(() => {
        const passed = state.passedTests.has(activeTest);
        if (!passed && !isDebugging) {
          console.log(
            `'${testName}' Failed. Go to ${debugUrl.replace(
              'host.docker.internal',
              'localhost'
            )} to debug this test`
          );
        }
      });
    });

    const bridge = (state.bridge = async (passed: any) => {
      if (typeof passed === 'function') passed = {};
      page._safetest_internal.pendingBridge = deferred();

      await page.evaluate(
        ({ passed, SAFETEST_INTERFACE }) => {
          const { callback, defer } = (window as any)[SAFETEST_INTERFACE]
            .bridgePending;
          Promise.resolve()
            .then(() => callback(passed))
            .then((result: any) => {
              (window as any)[SAFETEST_INTERFACE]('BRIDGE', { result });
              defer.resolve(result);
            })
            .catch((error) => {
              (window as any)
                [SAFETEST_INTERFACE]('BRIDGE', { error })(window as any)
                .safeTestBridge({ error });
              defer.reject(error);
            });
        },
        { passed, SAFETEST_INTERFACE }
      );
      return await page._safetest_internal.pendingBridge?.promise;
    });

    const rendered = {
      page,
      pause,
      bridge,
      require: safeRequire,
    };

    return rendered;
  } else {
    if (!state.browserState) {
      throw new Error('App was not bootstrapped to use safetest correctly');
    }
    await howToRender(element, state.browserState.renderContainer.value as any);

    const bridge: any = (state.bridge = (passed: any, callback: any) => {
      if (!callback) callback = passed;
      const defer = deferred();
      if (!(window as any)[SAFETEST_INTERFACE]) {
        console.log(
          'Test is waiting for a bridge call, you can manually invoke it with: `bridged(...)`. Waiting by:',
          callback
        );
        (window as any).bridged = (passed: any) => {
          delete (window as any).bridged;
          defer.resolve(passed);
          return callback(passed);
        };
      } else {
        (window as any)[SAFETEST_INTERFACE].bridgePending = { callback, defer };
      }

      return defer.promise;
    });

    if (typeof (window as any)[SAFETEST_INTERFACE] === 'function') {
      (window as any)[SAFETEST_INTERFACE]?.('READY');
    }

    // await timeout(0);

    return {
      page: anythingProxy,
      pause: () => Promise.resolve(),
      bridge,
      require: anythingProxy,
    };
  }
}
