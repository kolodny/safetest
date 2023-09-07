import { anythingProxy } from './anythingProxy';
import { createBlockFn } from './blocks';
import { configureSnapshot } from './configure-snapshot';
import { isInNode } from './is-in-node';
import { safeRequire } from './safe-require';
import { state } from './state';
import { afterAllFn, afterEachFn } from './teardown';
import { browserMock } from './browser-mock';

import type * as VitestType from 'vitest';
import { makeExpect } from './expect';
import { global } from './global';

const ensureImported = <T>(
  globalProp: string,
  name: string,
  throwing?: boolean
): T => {
  const g = global as any;
  const original = g[globalProp] ?? anythingProxy;
  g[globalProp] = () => {
    if (throwing)
      throw new Error(`'${name}' must be imported from safetest/vitest`);
    return original;
  };

  return original;
};

type Vitest = typeof VitestType;
type V = Vitest;

const describe = ensureImported<V['describe']>('describe', 'describe', true);
const it = ensureImported<V['it']>('it', 'test/it', true);
const expect = ensureImported<V['expect']>('expect', 'expect', true);
const beforeEach = ensureImported<V['beforeEach']>('beforeEach', 'beforeEach');
const beforeAll = ensureImported<V['beforeAll']>('beforeAll', 'beforeAll');
const afterEach = ensureImported<V['afterEach']>('afterEach', 'afterEach');
const afterAll = ensureImported<V['afterAll']>('afterAll', 'afterAll');

const exportedExpect = makeExpect(expect);

if (isInNode)
  try {
    const pkg = safeRequire.resolve('@playwright/test/package.json');
    const path = safeRequire('path');
    const parent = path.dirname(pkg);
    const matchers = safeRequire(`${parent}/lib/matchers/matchers`);
    expect.extend(matchers);
  } catch {}

if (isInNode) {
  if (!require.main?.filename) {
    require.main = { ...require.main!, filename: __filename };
  }
}

const globalSetup = () => {
  state.isGlobalSetupTeardownRegistered = true;
  afterEach(afterEachFn);
  afterAll(afterAllFn);
  configureSnapshot(expect as any);
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
          globalSetup();
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
          globalSetup();
        }
        return actualThing(...args);
      },
      false
    );

const exportedDescribe: Vitest['describe'] = makeDescribe(describe) as any;
exportedDescribe.only = makeDescribe(describe.only) as any;
exportedDescribe.skip = makeDescribe(describe.skip) as any;
exportedDescribe.todo = makeDescribe(describe.todo) as any;

const exportedIt: Vitest['it'] & { debug: Vitest['it'] } = makeIt(it) as any;
exportedIt.only = makeIt(it.only) as any;
exportedIt.skip = makeIt(it.skip) as any;
exportedIt.todo = ((name: string) =>
  createBlockFn(name, undefined as any, [], it.todo, false)) as any;

exportedIt.debug = ((...args: Parameters<Vitest['it']>) => {
  const testKey = (makeIt(it.only) as any)(...args);
  state.debugging.add(testKey);
}) as any;

if (isInNode) {
  state.vitestGlobals = {
    beforeEach,
    beforeAll,
    afterEach,
    afterAll,
    expect,
  };
}

export {
  exportedDescribe as describe,
  exportedIt as it,
  exportedIt as test,
  afterEach,
  afterAll,
  beforeEach,
  beforeAll,
  exportedExpect as expect,
  browserMock,
};
