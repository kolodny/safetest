import { createBlockFn } from './blocks';
import { configureSnapshot } from './configure-snapshot';
import { isInNode } from './is-in-node';
import { state } from './state';
import { afterAllFn, afterEachFn } from './teardown';
import { browserMock } from './browser-mock';

import type * as VitestType from 'vitest';
import { makeExpect } from './expect';
import { ensureImported } from './ensure-imported';

type Vitest = typeof VitestType;

ensureImported('describe', 'describe');
ensureImported('it', 'test/it');
ensureImported('expect', 'expect');
ensureImported('beforeEach', 'beforeEach');
ensureImported('beforeAll', 'beforeAll');
ensureImported('afterEach', 'afterEach');
ensureImported('afterAll', 'afterAll');

const exportedExpect = makeExpect(expect);

const globalSetup = () => {
  state.isGlobalSetupTeardownRegistered = true;
  afterEach(afterEachFn);
  afterAll(afterAllFn);
  configureSnapshot(expect);
};

const makeDescribe: (actualThing: Function) => any =
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

const makeIt: (actualThing: Function) => any =
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

const exportedDescribe: Vitest['describe'] = makeDescribe(describe);
exportedDescribe.only = makeDescribe(describe.only);
exportedDescribe.skip = makeDescribe(describe.skip);
exportedDescribe.todo = makeDescribe((describe as any)?.todo);

const exportedIt: Vitest['it'] & { debug: Vitest['it'] } = makeIt(it);
exportedIt.only = makeIt(it.only);
exportedIt.skip = makeIt(it.skip);
exportedIt.todo = ((name: string) =>
  createBlockFn(name, undefined as any, [], it.todo, false)) as any;

exportedIt.debug = ((...args: Parameters<Vitest['it']>) => {
  const testKey = makeIt(it.only)(...args);
  state.debugging.add(testKey);
}) as any;

export {
  exportedDescribe as describe,
  exportedIt as it,
  exportedIt as test,
  exportedExpect as expect,
  browserMock,
};
