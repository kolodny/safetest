import 'setimmediate';

import { createBlockFn } from './blocks';
import { state } from './state';
import { isInNode } from './is-in-node';
import { afterAllFn, afterEachFn } from './teardown';
import { global } from './global';
import { anythingProxy } from './anythingProxy';
import { safeRequire } from './safe-require';

import { configureSnapshot } from './configure-snapshot';
import { makeExpect } from './expect';
import { type Mock as JestMock } from './jest-mock';
import { browserMock } from './browser-mock';

type Mock<R, A extends any[]> = JestMock<(...args: A) => R>;

const ensureImported = <T>(
  globalProp: string,
  name: string,
  throwing?: boolean
): T => {
  const g = global as any;
  const original = g[globalProp] ?? anythingProxy;
  g[globalProp] = () => {
    if (throwing)
      throw new Error(`'${name}' must be imported from safetest/jest`);
    return original;
  };

  return original;
};

if (isInNode)
  try {
    const pkg = safeRequire.resolve('@playwright/test/package.json');
    const path = safeRequire('path');
    const parent = path.dirname(pkg);
    const matchers = safeRequire(`${parent}/lib/matchers/matchers`);
    (global as any).expect.extend(matchers);
  } catch {}

const describe = ensureImported<jest.Describe>('describe', 'describe', true);
const it = ensureImported<jest.It>('it', 'test/it', true);
const expect = ensureImported<jest.Expect>('expect', 'expect', true);
const beforeEach = ensureImported<jest.Lifecycle>('beforeEach', 'beforeEach');
const beforeAll = ensureImported<jest.Lifecycle>('beforeAll', 'beforeAll');
const afterEach = ensureImported<jest.Lifecycle>('afterEach', 'afterEach');
const afterAll = ensureImported<jest.Lifecycle>('afterAll', 'afterAll');

const setTimeout = (timeout: number) => {
  if (isInNode) {
    jest.setTimeout(timeout);
  }
};

const globalSetup = () => {
  state.isGlobalSetupTeardownRegistered = true;
  jest.useRealTimers();
  afterEach(afterEachFn);
  afterAll(afterAllFn);
  configureSnapshot(expect);
};

const makeDescribe =
  (actualThing: Function) =>
  (name: string, fn: () => void, ...extraArgs: any[]) => {
    return createBlockFn(
      name,
      fn,
      extraArgs,
      (...args: any[]) => {
        if (isInNode && !state.isGlobalSetupTeardownRegistered) {
          globalSetup();
        }
        return actualThing(...args);
      },
      true
    );
  };

// eslint-disable-next-line @typescript-eslint/ban-types
const makeIt =
  (actualThing: Function) =>
  (name: string, fn: () => void, ...extraArgs: any[]) => {
    return createBlockFn(
      name,
      fn,
      extraArgs,
      (...args: any[]) => {
        if (isInNode && !state.isGlobalSetupTeardownRegistered) {
          globalSetup();
        }
        const debugTests = state.options.debugTests;
        const current = state.currentSuitePlusTest;
        if (debugTests && !debugTests.includes(current)) {
          it.skip(name, () => {});
        } else {
          return actualThing(...args);
        }
      },
      false
    );
  };

const todo = (name: string) =>
  createBlockFn(name, undefined as any, [], it.todo, false);

const eachNotSupported = () => {
  throw new Error("`.each(...)` tests can't be run in the browser");
};

const exportedDescribe: jest.Describe = makeDescribe(describe) as any;
exportedDescribe.each = eachNotSupported;
exportedDescribe.only = makeDescribe(describe.only) as any;
exportedDescribe.only.each = eachNotSupported;
exportedDescribe.skip = makeDescribe(describe.skip) as any;
exportedDescribe.skip.each = eachNotSupported;

const exportedIt: jest.It & { debug: jest.It } = makeIt(it) as any;
exportedIt.concurrent = makeIt(it.concurrent) as any;
exportedIt.concurrent.each = eachNotSupported;
exportedIt.concurrent.only = makeIt(it.concurrent?.only) as any;
exportedIt.concurrent.only.each = eachNotSupported;
exportedIt.concurrent.skip = makeIt(it.concurrent?.skip) as any;
exportedIt.concurrent.skip.each = eachNotSupported;
exportedIt.each = eachNotSupported;
exportedIt.only = makeIt(it.only) as any;
exportedIt.only.each = eachNotSupported;
exportedIt.skip = makeIt(it.skip) as any;
exportedIt.skip.each = eachNotSupported;
exportedIt.todo = todo as any;

exportedIt.debug = ((...args: Parameters<jest.It>) => {
  const testKey = (exportedIt.only as any)(...args);
  state.debugging.add(testKey);
}) as any;

const retryTimes = (numRetries: number) => {
  if (isInNode) {
    return jest.retryTimes(numRetries);
  }
  return undefined;
};

const exportedExpect = makeExpect(expect);

interface OverrideInfo<Args extends unknown[], Return> {
  /** The arguments passed to the function */
  args: Args;
  /* The return value the original function returned. Using the property will implicitly call the original function */
  returned: Return;
  /** The original spied on function */
  original: Fn<Args, Return>;
}

type Fn<Args extends unknown[], R> = (...args: Args) => R;

type OverrideFn<Args extends unknown[], Return> = (
  callback: (info: OverrideInfo<Args, Return>) => Return
) => BrowserSpy<any, any[]>;
export type BrowserSpy<Return, Args extends unknown[]> = Mock<Return, Args> & {
  override: OverrideFn<Args, Return>;
  overrideOnce: OverrideFn<Args, Return>;
} & Promise<Mock<Return, Args>>;

export const spied = <T extends Fn<unknown[], unknown>>(
  fn: T
): (T extends Fn<infer Args, infer Return> ? BrowserSpy<Return, Args> : never) &
  T => fn as any;

export {
  exportedDescribe as describe,
  exportedIt as it,
  exportedIt as test,
  setTimeout,
  afterEach,
  afterAll,
  beforeEach,
  beforeAll,
  retryTimes,
  exportedExpect as expect,
  browserMock,
};
