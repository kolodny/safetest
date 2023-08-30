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
import type { Mock as JestMock } from 'jest-mock';

const jestMock: typeof import('jest-mock') = safeRequire('jest-mock');
const { spyOn, fn } = jestMock;

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

const describe = ensureImported<jest.Describe>('describe', 'describe', true);
const it = ensureImported<jest.It>('it', 'test/it', true);
const expect = ensureImported<jest.Expect>('expect', 'expect', true);
const beforeEach = ensureImported<jest.Lifecycle>('beforeEach', 'beforeEach');
const beforeAll = ensureImported<jest.Lifecycle>('beforeAll', 'beforeAll');
const afterEach = ensureImported<jest.Lifecycle>('afterEach', 'afterEach');
const afterAll = ensureImported<jest.Lifecycle>('afterAll', 'afterAll');

if (isInNode)
  try {
    const pkg = safeRequire.resolve('@playwright/test/package.json');
    const path = safeRequire('path');
    const parent = path.dirname(pkg);
    const matchers = safeRequire(`${parent}/lib/matchers/matchers`);
    expect.extend(matchers);
  } catch {}

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

const browserSpy = <Args extends unknown[], Return>(
  spy: Mock<Return, Args>,
  original?: (...args: any[]) => any
): BrowserSpy<Return, Args> => {
  const facade = function (this: any) {
    return spy.apply(this, arguments);
  } as BrowserSpy<Return, Args>;
  const makeOverride = (once: boolean) => {
    const property = once ? 'overrideOnce' : 'override';
    const mockMethod = once ? 'mockImplementationOnce' : 'mockImplementation';
    (spy as any)[property] = (callback: Function) => {
      spy[mockMethod]((...args: any[]) => {
        let originalCalled = false;
        let returned: any;
        const wrapped = (...args: any[]) => {
          if (originalCalled) {
            throw new Error('Original function called multiple times');
          } else {
            originalCalled = true;
            returned = original?.(...args);
            return returned;
          }
        };
        const passed = {
          args,
          get returned() {
            if (originalCalled) return returned;
            return wrapped(...args);
          },
          original,
        };

        const returns = callback(passed);
        if (!originalCalled) {
          wrapped(...args);
        }
        return returns;
      });
      return spy;
    };
  };
  if (original || isInNode) {
    makeOverride(false);
    makeOverride(true);
    const mockRestore = spy.mockRestore.bind(spy);
    spy.mockRestore = () => {
      mockRestore();
      if (original) spy.mockImplementation(original);
    };
  }
  for (const key of Object.keys(spy)) {
    if (isInNode && typeof (spy as any)[key] === 'function') {
      (facade as any)[key] = () => spy;
    } else {
      (facade as any)[key] = (spy as any)[key];
    }
  }
  facade.then = async (resolve: any) => {
    const mock = await state.bridge?.(() => spy.mock);
    if (isInNode) spy.mock = mock;
    return resolve(spy);
  };
  (facade as any).__isBrowserSpy = true;

  return facade;
};

type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];
function spyOnWrapped<T, K extends FunctionPropertyNames<T>>(
  obj: T,
  method: K
): T[K] extends Fn<infer Args, infer Return>
  ? BrowserSpy<Return, Args>
  : BrowserSpy<any[], any>;
function spyOnWrapped<T>(
  obj: T,
  method: keyof T,
  accessType: 'get' | 'set'
): BrowserSpy<any[], any>;
function spyOnWrapped(obj: any, method: any, accessType?: 'get' | 'set') {
  let spy: Mock<any[], any>;
  let original = undefined;
  if (isInNode) {
    spy = fn();
  } else {
    original = obj[method];
    spy = accessType
      ? (spyOn(obj, method, accessType as any) as any)
      : spyOn(obj, method);
  }
  return browserSpy(spy, original);
}

const fnWrapped = function (impl?: (...args: any) => any) {
  const spy = fn(impl);
  return browserSpy(spy, impl);
};
const browserMock = { spyOn: spyOnWrapped, fn: fnWrapped };

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
