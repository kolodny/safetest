/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createBlockFn } from './blocks';
import { state } from './state';
import { isInNode } from './is-in-node';
import { afterAllFn, afterEachFn } from './teardown';
import { global } from './global';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type {} from 'jest';

const describe =
  global.describe ?? ('`describe` not available in the browser' as any);
const it = global.it ?? ('`test`/`it` not available in the browser' as any);

const setTimeout = (timeout: number) => {
  if (isInNode) {
    jest.setTimeout(timeout);
  }
};

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
  // if (isInNode) jest.setTimeout(1000 * 60 * 30);
  const testKey = (makeIt(it.only) as any)(...args);
  state.debugging.add(testKey);
}) as any;

const jestAfterEach: typeof afterEach = (callback, timeout) => {
  if (isInNode) {
    return afterEach(callback, timeout);
  }
};

const jestAfterAll: typeof afterAll = (callback, timeout) => {
  if (isInNode) {
    return afterAll(callback, timeout);
  }
};

const jestBeforeEach: typeof beforeEach = (callback, timeout) => {
  if (isInNode) {
    return beforeEach(callback, timeout);
  }
};

const jestBeforeAll: typeof beforeAll = (callback, timeout) => {
  if (isInNode) {
    return beforeAll(callback, timeout);
  }
};

const retryTimes = (numRetries: number) => {
  if (isInNode) {
    return jest.retryTimes(numRetries);
  }
};

export {
  exportedDescribe as describe,
  exportedIt as it,
  exportedIt as test,
  setTimeout,
  jestAfterEach as afterEach,
  jestAfterAll as afterAll,
  jestBeforeEach as beforeEach,
  jestBeforeAll as beforeAll,
  retryTimes,
};
