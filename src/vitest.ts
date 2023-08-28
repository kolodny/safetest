/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { anythingProxy } from './anythingProxy';
import { createBlockFn } from './blocks';
import { configureSnapshot } from './configure-snapshot';
import { isInNode } from './is-in-node';
import { safeRequire } from './safe-require';
import { state } from './state';
import { afterAllFn, afterEachFn } from './teardown';

// @ts-ignore
import type * as Vitest from 'vitest';
import { makeExpect } from './expect';

/**
 * vitest import promise.
 * We do this since the vite can't bundle vitest for the browser
 */
type ImportVitest = () => Promise<typeof Vitest>;

type SafetestVite = Promise<
  Omit<typeof Vitest, 'it' | 'expect'> & {
    it: typeof Vitest['it'] & {
      debug: typeof Vitest.it;
    };
    expect: ReturnType<typeof makeExpect>;
  }
>;

/**
 * Unfortunately, vite can't bundle vitest for the browser. It also doesn't have
 * a way to get the filename of the test file. So we have to do this.
 *
 * Usually this is exactly how you'd use this function before you declare your tests:
 * ```
 * import { makeVitest } from 'safetest/vitest';
 *
 * const { describe, it, expect } = await makeVitest(() => import('vitest'));
 * ```
 */
export const makeVitest = async (importVitest: ImportVitest): SafetestVite => {
  const vitest = isInNode ? await importVitest() : (anythingProxy as never);
  const expect = makeExpect(vitest.expect);

  if (isInNode)
    try {
      const pkg = safeRequire.resolve('@playwright/test/package.json');
      const path = safeRequire('path');
      const parent = path.dirname(pkg);
      const matchers = safeRequire(`${parent}/lib/matchers/matchers`);
      vitest.expect.extend(matchers);
    } catch {}

  if (isInNode) {
    if (!require.main?.filename) {
      require.main = { ...require.main!, filename: __filename };
    }
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
            configureSnapshot(vitest.expect);
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
            configureSnapshot(vitest.expect);
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

  const wrapperAfterEach: typeof afterEach = (...args: any[]) => {
    if (isInNode) {
      return afterEach.apply(null, args as any);
    }
  };

  const wrapperAfterAll: typeof afterAll = (...args: any[]) => {
    if (isInNode) {
      return afterAll.apply(null, args as any);
    }
  };

  const wrapperBeforeEach: typeof beforeEach = (...args: any[]) => {
    if (isInNode) {
      return beforeEach.apply(null, args as any);
    }
  };

  const wrapperBeforeAll: typeof beforeAll = (...args: any[]) => {
    if (isInNode) {
      return beforeAll.apply(null, args as any);
    }
  };

  if (isInNode) {
    state.vitestGlobals = {
      beforeEach,
      beforeAll,
      afterEach,
      afterAll,
      expect: vitest.expect,
    };
  }

  return {
    ...(vitest as any),
    describe: exportedDescribe,
    it: exportedIt as typeof Vitest.it & { debug: typeof Vitest.it },
    test: exportedIt,
    expect,
    beforeEach: wrapperBeforeEach,
    beforeAll: wrapperBeforeAll,
    afterEach: wrapperAfterEach,
    afterAll: wrapperAfterAll,
  };
};
