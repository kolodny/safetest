import { Matchers } from './playwright-types';
import type { BrowserSpy } from './browser-mock';
import { isInNode } from './is-in-node';
import { anythingProxy } from './anythingProxy';
import * as matchers from './matchers';
import { state } from './state';

export const makeExpect = <T>(expect: T) => {
  const anyExpect = expect as any;
  const mappedMatchers = Object.fromEntries(
    Object.entries(matchers).map(([key, value]) => {
      if (typeof value !== 'function') return [key, value];
      const wrappedFn = function (this: any, ...args: any[]) {
        const matched = (value as any).apply(this, args);
        if (matched && 'finally' in matched) {
          state.pendingExpects[key] = state.pendingExpects[key] ?? 0;
          state.pendingExpects[key]++;
          return matched.finally(() => {
            state.pendingExpects[key]--;
          });
        }
        return matched;
      };
      return [key, wrappedFn];
    })
  );
  anyExpect.extend(mappedMatchers);

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

  return exportedExpect;
};
