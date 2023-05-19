/* eslint-disable @typescript-eslint/no-explicit-any */
import { state } from './state';
import { isInNode } from './is-in-node';

const smartAppendToCurrent = (appending: string) =>
  (state.currentSuitePlusTest ? state.currentSuitePlusTest + ' ' : '') +
  appending;

export const createBlockFn = (
  name: string,
  fn: () => void,
  /** Extra args to pass to the actual fn, like `it(_, _, timeout)` */
  extraArgs: any[],
  // eslint-disable-next-line @typescript-eslint/ban-types
  actualThing: Function,
  /** Is function `describe` which we always run or `it` which we don't run */
  isSetupFn: boolean
): string => {
  const previous = state.currentSuitePlusTest;
  let key = smartAppendToCurrent(name);
  if (!isSetupFn && key in state.tests) {
    let index = 2;
    while (key in state.tests) {
      key = smartAppendToCurrent(`${name} - ${index++}`);
    }
  }
  state.tests[key] = fn;
  state.currentSuitePlusTest = key;
  if (isInNode) {
    // console.log({ STATE: state.tests });
    if (!fn) {
      // `it.todo` does this
      actualThing(name);
    } else {
      actualThing(
        name,
        function (this: any, ...args: any[]) {
          state.activeTest = key;
          if (key in state.retryMap) {
            state.retryMap[key]++;
          } else {
            state.retryMap[key] = 0;
          }
          state.currentSuitePlusTest = key;
          const result = (fn as any).call(this, ...args);
          if (result && 'then' in result) {
            return result.then((resolved: any) => {
              state.passedTests.add(key);
              return resolved;
            });
          }
          state.passedTests.add(key);
          return result;
        },
        ...extraArgs
      );
    }
  } else {
    // In the browser
    if (isSetupFn) {
      fn();
    }
  }
  state.currentSuitePlusTest = previous;
  return key;
};
