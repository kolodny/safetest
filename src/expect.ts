import { Matchers } from './playwright-types';
import type { BrowserSpy } from './browser-mock';
import { isInNode } from './is-in-node';
import { anythingProxy } from './anythingProxy';
import * as matchers from './matchers';

export const makeExpect = <T>(expect: T) => {
  const anyExpect = expect as any;
  anyExpect.extend(matchers);

  const _exportedExpect = <T>(
    actual: T
  ): 0 extends 1 & T
    ? Matchers<T>
    : T extends BrowserSpy<any, any[]>
    ? 'Browser mocks need to be awaited. Try changing `expect(spy)` to `expect(await spy)`'
    : Matchers<T> => {
    if ((actual as any)?.__isBrowserSpy) {
      console.warn(
        'Browser mocks need to be awaited. Try changing `expect(spy)` to `expect(await spy)`'
      );
      return 'Browser mocks need to be awaited. Try changing `expect(spy)` to `expect(await spy)`' as any;
    }
    return anyExpect(actual);
  };

  const exportedExpect = isInNode ? _exportedExpect : (anythingProxy as never);

  if (isInNode) {
    for (const matcher of Object.keys(anyExpect)) {
      try {
        if (typeof anyExpect[matcher] === 'function') {
          (exportedExpect as any)[matcher] = anyExpect[matcher].bind(expect);
        } else {
          (exportedExpect as any)[matcher] = anyExpect[matcher];
        }
      } catch {}
    }
  }
  return exportedExpect;
};
