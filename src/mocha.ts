/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createBlockFn } from './blocks';
import { state } from './state';
import { isInNode } from './is-in-node';
import { afterAllFn, afterEachFn } from './teardown';
import { global } from './global';

import type mocha from 'mocha';

const describe =
  global.describe ?? ('`describe` not available in the browser' as any);
const it = global.it ?? ('`test`/`it` not available in the browser' as any);

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
          after(afterAllFn);
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
          after(afterAllFn);
        }
        return actualThing(...args);
      },
      false
    );

const exportedDescribe: mocha.SuiteFunction = makeDescribe(describe) as any;
exportedDescribe.only = makeDescribe(describe.only) as any;
exportedDescribe.skip = makeDescribe(describe.skip) as any;

const exportedIt: mocha.TestFunction & { debug: mocha.TestFunction } = makeIt(
  it
) as any;
exportedIt.only = makeIt(it.only) as any;
exportedIt.skip = makeIt(it.skip) as any;

exportedIt.debug = ((...args: Parameters<mocha.TestFunction>) => {
  // if (isInNode) mocha.setTimeout(1000 * 60 * 30);
  const testKey = (makeIt(it.only) as any)(...args);
  state.debugging.add(testKey);
}) as any;

const mochaAfterEach: typeof afterEach = (...args) => {
  if (isInNode) {
    return (afterEach as any)(...args);
  }
};

const mochaAfter: typeof after = (...args) => {
  if (isInNode) {
    return (after as any)(...args);
  }
};

const mochaBeforeEach: typeof beforeEach = (...args) => {
  if (isInNode) {
    return (beforeEach as any)(...args);
  }
};

const mochaBefore: typeof before = (...args) => {
  if (isInNode) {
    return (before as any)(...args);
  }
};

export {
  exportedDescribe as describe,
  exportedIt as it,
  exportedIt as test,
  mochaAfterEach as afterEach,
  mochaAfter as after,
  mochaBeforeEach as beforeEach,
  mochaBefore as before,
};
