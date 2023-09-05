import { SAFETEST_INTERFACE } from './render';
import { state } from './state';

interface BootstrapArgs {
  import: (s: string) => Promise<any>;
  defaultRender: () => any;
}

export const bootstrap = async (args: BootstrapArgs): Promise<any> => {
  let searchParams: URLSearchParams | undefined;

  try {
    searchParams = new URLSearchParams(window.location.search);
  } catch (e) {}
  let testName = searchParams?.get('test_name');
  let testPath = searchParams?.get('test_path');
  let retryAttempt = 0;
  if (!testPath && !testName && (window as any)[SAFETEST_INTERFACE]) {
    ({ testPath, testName, retryAttempt } =
      (await (window as any)[SAFETEST_INTERFACE]?.('GET_INFO')) ?? {});
  }
  if (testName && testPath) {
    await args.import(testPath);
    if (state.browserState) state.browserState.retryAttempt = retryAttempt;
    await (window as any).waitForSafetestReady;
    state.tests[testName]!();
  } else {
    return args.defaultRender();
  }
};
