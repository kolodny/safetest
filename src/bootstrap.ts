import { mapKeys } from 'lodash';
import { SAFETEST_INTERFACE } from './render';
import { state } from './state';

// @ts-ignore
import type { ImportGlobFunction } from 'vite';

export type Importer =
  | {
      // @ts-ignore
      webpackContext: false | webpack.Context;
    }
  | {
      importGlob: false | ReturnType<ImportGlobFunction>;
    }
  | {
      import: false | ((s: string) => Promise<unknown>);
    }
  | {
      imports: false | Record<string, () => Promise<unknown>>;
    };

type BootstrapArgs = Importer & {
  defaultRender: () => any;
};

export const bootstrap = async (args: BootstrapArgs): Promise<any> => {
  const mapper = (dep: string) => {
    const noExt = dep.replace(/\.m?[tj]sx?/, '');
    return noExt.startsWith('.') ? noExt : `./${noExt}`;
  };
  let known: string[] = [];
  let importer: (s: string) => unknown;
  if ('webpackContext' in args) {
    if (args.webpackContext === false) return args.defaultRender();
    known = [...new Set(args.webpackContext.keys().map(mapper))];
    importer = args.webpackContext;
  } else if ('importGlob' in args) {
    if (args.importGlob === false) return args.defaultRender();
    const entries = Object.entries(args.importGlob);
    const entriesMapped = entries.map(([k, v]) => [mapper(k), v] as const);
    const fixedImports = Object.fromEntries(entriesMapped);
    known = entriesMapped.map(([k]) => k);
    importer = (s) => (fixedImports[mapper(s)] as any)();
  } else if ('imports' in args) {
    const entries = Object.entries(args.imports);
    const entriesMapped = entries.map(([k, v]) => [mapper(k), v] as const);
    const fixedImports = Object.fromEntries(entriesMapped);
    known = entriesMapped.map(([k]) => k);
    importer = (s) => fixedImports[mapper(s)]();
  } else {
    if (args.import === false) return args.defaultRender();
    importer = args.import;
  }

  let searchParams: URLSearchParams | undefined;

  try {
    searchParams = new URLSearchParams(window.location.search);
  } catch (e) {}

  let testName = searchParams?.get('test_name');
  let testPath = searchParams?.get('test_path');
  if (window.location.hash.includes('safetest')) {
    if (known.length) {
      Promise.resolve().then(async () => {
        for (const k of known) {
          state.tests = {};
          await importer(k);
          await (window as any).waitForSafetestReady;
          const tests = Object.keys(state.tests);
          console.group(`Tests for ${k} (${tests.length} total)`);
          for (const test of tests) {
            const url = new URL(location.href);
            const append = url.search.includes('?') ? '&' : '?';
            const testName = test.trim().replace(/ /g, '+');
            url.search = `${url.search}${append}test_path=${k}&test_name=${testName}`;
            url.hash = '';
            console.log(url.href);
          }
          console.groupEnd();
        }
      });
    } else {
      console.log('No known tests');
    }
  } else if (testPath && !testName) {
    try {
      await importer(testPath);
      await (window as any).waitForSafetestReady;
    } catch {
      console.log(`Test "${testPath}" not found, known tests are:`, known);
    }
    const tests = Object.keys(state.tests).map((test) => {
      const url = new URL(location.href);
      const append = url.search.includes('?') ? '&' : '?';
      url.search = `${url.search}${append}test_name=${test}`;
      url.hash = '';
      return url.href;
    });
    if (tests.length) {
      console.groupCollapsed('Known test files');
      for (const test of tests) console.info(test);
      console.groupEnd();
    }
  }
  let retryAttempt = 0;
  if (!testPath && !testName && (window as any)[SAFETEST_INTERFACE]) {
    ({ testPath, testName, retryAttempt } =
      (await (window as any)[SAFETEST_INTERFACE]?.('GET_INFO')) ?? {});
  }
  if (testName && testPath) {
    try {
      await importer(testPath);
      await (window as any).waitForSafetestReady;
    } catch (error) {
      console.log(
        `file "${testPath}" could not be imported, known files are:`,
        known
      );
      throw error;
    }
    if (state.browserState) state.browserState.retryAttempt = retryAttempt;
    await (window as any).waitForSafetestReady;
    if (typeof state.tests[testName] !== 'function') {
      const availableTests = Object.keys(state.tests);
      console.log(
        `Test "${testName}" not found, known tests are:`,
        availableTests
      );
    } else {
      state.tests[testName]!();
    }
  } else {
    return args.defaultRender();
  }
};
