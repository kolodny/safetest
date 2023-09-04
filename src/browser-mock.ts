import 'setimmediate';

import { state } from './state';
import { isInNode } from './is-in-node';
import { global } from './global';

import type { Mock as JestMock } from 'jest-mock';

global.global = global;
const jestMock: typeof import('jest-mock') = require('jest-mock');
const { spyOn, fn } = jestMock;

type Mock<R, A extends any[]> = JestMock<(...args: A) => R>;

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
export const browserMock = { spyOn: spyOnWrapped, fn: fnWrapped };
