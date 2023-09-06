import _ from 'lodash';
import { SAFETEST_INTERFACE } from './render';
import { state } from './state';

// import webpack from 'webpack';

export type Importer =
  | {
      webpackContext: {
        keys(): Array<string>;
        (dependency: string): Promise<unknown>;
      };
    }
  | {
      importGlob: Record<string, () => Promise<unknown>>;
    }
  | {
      import: (s: string) => Promise<unknown>;
    };

type BootstrapArgs = Importer & {
  defaultRender: () => any;
};

export const bootstrap = async (args: BootstrapArgs): Promise<any> => {
  const mapper = (dep: string) =>
    dep.replace(/\.m?[tj]sx?/, '').replace(/^\.(src)?/, '.');
  let known: string[] = [];
  let importer: (s: string) => Promise<any>;
  if ('webpackContext' in args) {
    known = [...new Set(args.webpackContext.keys().map(mapper))];
    importer = args.webpackContext;
  } else if ('importGlob' in args) {
    const mappedGlob = _.mapKeys(args.importGlob, (v, k) => mapper(k));
    known = [...new Set(Object.keys(mappedGlob).map(mapper))];
    importer = (s: string) => mappedGlob[s]!();
  } else {
    importer = args.import;
  }
  let searchParams: URLSearchParams | undefined;

  try {
    searchParams = new URLSearchParams(window.location.search);
  } catch (e) {}

  let testName = searchParams?.get('test_name');
  let testPath = searchParams?.get('test_path');
  if (window.location.hash.includes('safetest')) {
    const urls = known.map((k) => {
      const url = new URL(location.href);
      const append = url.search.includes('?') ? '&' : '?';
      url.search = `${url.search}${append}test_path=${k}`;
      url.hash = '';
      return url.href;
    });
    if (known.length) {
      console.group('Known tests files');
      for (const url of urls) console.info(url);
      console.groupEnd();
    }
  } else if (testPath && !testName) {
    await importer(testPath);
    const tests = Object.keys(state.tests).map((test) => {
      const url = new URL(location.href);
      url.searchParams.set('test_name', test);
      return url.href;
    });
    if (tests.length) {
      console.groupCollapsed('Known tests files');
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
    await importer(testPath);
    if (state.browserState) state.browserState.retryAttempt = retryAttempt;
    await (window as any).waitForSafetestReady;
    state.tests[testName]!();
  } else {
    return args.defaultRender();
  }
};
