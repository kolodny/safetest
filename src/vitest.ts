/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createBlockFn } from './blocks';
import { state } from './state';
import { isInNode } from './is-in-node';
import { afterAllFn, afterEachFn } from './teardown';

import type * as Vitest from 'vitest';

interface MakeViteParamters {
  /**
   * vitest import promise.
   * We do this since the vite can't bundle vitest for the browser
   */
  vitest: Promise<typeof Vitest>;
  /**
   * This should be `__filename` so that vitest can know about which
   * file is being tested. It can't figure this out any other way.
   */
  __filename: string;
}

/**
 * Unfortunately, vite can't bundle vitest for the browser. It also doesn't have
 * a way to get the filename of the test file. So we have to do this.
 *
 * Usually this is exactly how you'd use this function before you declare your tests:
 * ```
 * import { makeVitest } from 'safetest/vitest';
 *
 * const { describe, it, expect } = await makeVitest(() => ({
 *   vitest: import(/* @vite-ignore * / `${'vitest'}`),
 *   __filename,
 * }));
 * ```
 *
 * Please note that '* /' should be connected (but can't in a doc comment).),
 */
export const makeVitest = async (
  args: () => MakeViteParamters
): Promise<
  Exclude<typeof Vitest, 'it'> & {
    it: typeof Vitest.it & { debug: typeof Vitest.it };
  }
> => {
  const argItems = isInNode
    ? args()
    : ({ __filename: '', vitest: {} as any } as MakeViteParamters);
  const vitest = await argItems.vitest;
  if (isInNode) {
    state.__filename = argItems.__filename;
  }
  const {
    describe = {} as typeof Vitest.describe,
    it = {} as typeof Vitest.it,
    beforeAll,
    beforeEach,
    afterAll,
    afterEach,
  } = vitest;

  const makeDescribe =
    (actualThing: Function) =>
    (name: string, fn: () => void, ...extraArgs: any[]) =>
      createBlockFn(
        name,
        fn,
        extraArgs,
        (...args: any[]) => {
          if (isInNode && !state.isGlobalSetupTeardownRegistered) {
            state.isGlobalSetupTeardownRegistered = true;
            afterEach(afterEachFn);
            afterAll(afterAllFn);
          }
          return actualThing(...args);
        },
        true
      );

  // eslint-disable-next-line @typescript-eslint/ban-types
  const makeIt =
    (actualThing: Function) =>
    (name: string, fn: () => void, ...extraArgs: any[]) =>
      createBlockFn(
        name,
        fn,
        extraArgs,
        (...args: any[]) => {
          if (isInNode && !state.isGlobalSetupTeardownRegistered) {
            state.isGlobalSetupTeardownRegistered = true;
            afterEach(afterEachFn);
            afterAll(afterAllFn);
          }
          return actualThing(...args);
        },
        false
      );

  const exportedDescribe: typeof Vitest.describe = makeDescribe(
    describe
  ) as any;
  exportedDescribe.only = makeDescribe(describe.only) as any;
  exportedDescribe.skip = makeDescribe(describe.skip) as any;
  exportedDescribe.todo = ((name: string) =>
    createBlockFn(name, undefined as any, [], describe.todo, false)) as any;

  const exportedIt: typeof Vitest.it & { debug: typeof Vitest.it } = makeIt(
    it
  ) as any;
  exportedIt.only = makeIt(it.only) as any;
  exportedIt.skip = makeIt(it.skip) as any;
  exportedIt.todo = ((name: string) =>
    createBlockFn(name, undefined as any, [], it.todo, false)) as any;

  exportedIt.debug = ((...args: Parameters<jest.It>) => {
    const testKey = (makeIt(it.only) as any)(...args);
    state.debugging.add(testKey);
  }) as any;

  const wrapperAfterEach: typeof afterEach = (...args) => {
    if (isInNode) {
      return afterEach(...args);
    }
  };

  const wrapperAfterAll: typeof afterAll = (...args) => {
    if (isInNode) {
      return afterAll(...args);
    }
  };

  const wrapperBeforeEach: typeof beforeEach = (...args) => {
    if (isInNode) {
      return beforeEach(...args);
    }
  };

  const wrapperBeforeAll: typeof beforeAll = (...args) => {
    if (isInNode) {
      return beforeAll(...args);
    }
  };

  return {
    ...(vitest as any),
    describe: exportedDescribe,
    it: exportedIt as typeof Vitest.it & { debug: typeof Vitest.it },
    test: exportedIt,
    beforeEach: wrapperBeforeEach,
    beforeAll: wrapperBeforeAll,
    afterEach: wrapperAfterEach,
    afterAll: wrapperAfterAll,
  };
};
