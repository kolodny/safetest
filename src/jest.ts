import 'setimmediate';

import { createBlockFn } from './blocks';
import { state } from './state';
import { isInNode } from './is-in-node';
import { afterAllFn, afterEachFn } from './teardown';

import { configureSnapshot } from './configure-snapshot';
import { makeExpect } from './expect';
import { type Mock as JestMock } from './jest-mock';
import { browserMock } from './browser-mock';
import { ensureImported } from './ensure-imported';

type Mock<R, A extends any[]> = JestMock<(...args: A) => R>;

ensureImported('describe', 'describe');
ensureImported('it', 'test/it');
ensureImported('expect', 'expect');
ensureImported('beforeEach', 'beforeEach');
ensureImported('beforeAll', 'beforeAll');
ensureImported('afterEach', 'afterEach');
ensureImported('afterAll', 'afterAll');

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

const makeDescribe: (actualThing: Function) => any =
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
const makeIt: (actualThing: Function) => any =
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
        const current = state.activeTest!;
        if (debugTests && !debugTests.includes(current)) {
          it.skip(name, () => {});
        } else {
          return actualThing(...args);
        }
      },
      false
    );
  };

const todo: any = (name: string) =>
  createBlockFn(name, undefined as any, [], it.todo, false);

const eachNotSupported = () => {
  throw new Error("`.each(...)` tests can't be run in the browser");
};

const exportedDescribe: jest.Describe = makeDescribe(describe);
exportedDescribe.each = eachNotSupported;
exportedDescribe.only = makeDescribe(describe.only);
exportedDescribe.only.each = eachNotSupported;
exportedDescribe.skip = makeDescribe(describe.skip);
exportedDescribe.skip.each = eachNotSupported;

const exportedIt: jest.It & { debug: jest.It } = makeIt(it);
exportedIt.concurrent = makeIt(it.concurrent);
exportedIt.concurrent.each = eachNotSupported;
exportedIt.concurrent.only = makeIt(it.concurrent?.only);
exportedIt.concurrent.only.each = eachNotSupported;
exportedIt.concurrent.skip = makeIt(it.concurrent?.skip);
exportedIt.concurrent.skip.each = eachNotSupported;
exportedIt.each = eachNotSupported;
exportedIt.only = makeIt(it.only);
exportedIt.only.each = eachNotSupported;
exportedIt.skip = makeIt(it.skip);
exportedIt.skip.each = eachNotSupported;
exportedIt.todo = todo;

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
  retryTimes,
  exportedExpect as expect,
  browserMock,
};
