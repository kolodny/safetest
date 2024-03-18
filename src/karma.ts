import { createBlockFn } from './blocks';
import { state } from './state';
import { afterAllFn, afterEachFn } from './teardown';
import { browserMock } from './browser-mock';
import { ensureImported } from './ensure-imported';
import {isInNode} from "./is-in-node";
import {makeExpect} from "./expect";

const exportedExpect = makeExpect(expect);

ensureImported('describe', 'describe');
ensureImported('it', 'test/it');
ensureImported('expect', 'expect');
ensureImported('beforeEach', 'beforeEach');
ensureImported('beforeAll', 'beforeAll');
ensureImported('afterEach', 'afterEach');
ensureImported('afterAll', 'afterAll');

const globalSetup = () => {
    state.isGlobalSetupTeardownRegistered = true;
    afterEach(afterEachFn);
    afterAll(afterAllFn);
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

const exportedDescribe = makeDescribe(describe);
exportedDescribe.only = makeIt(it.only);
exportedDescribe.skip = makeDescribe(describe.skip);
exportedDescribe.todo = makeDescribe((describe as any)?.todo);

const exportedIt = makeIt(it);
exportedIt.todo = ((name: string) =>
    createBlockFn(name, undefined as any, [], it.todo, false)) as any;

exportedIt.debug = ((...args: any[]) => {
    const testKey = makeIt(it.only)(...args);
    state.debugging.add(testKey);
});

export {
    exportedDescribe as describe,
    exportedIt as it,
    exportedIt as test,
    exportedExpect as expect,
    browserMock,
};