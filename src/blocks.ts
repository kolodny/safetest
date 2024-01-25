/* eslint-disable @typescript-eslint/no-explicit-any */
import { state } from './state';
import { isInNode } from './is-in-node';

const seen = state.seen;
const createId = (name: string, parent: string) => {
  const separator = parent ? ' ' : '';
  const concat = `${parent}${separator}${name}`;
  let candidate = concat;
  let index = 2;
  while (seen.has(candidate)) {
    candidate = `${concat} ${index++}`;
  }
  seen.add(candidate);
  return candidate;
};

export const createBlockFn = (
  name: string,
  fn: () => void,
  /** Extra args to pass to the actual fn, like `it(_, _, timeout)` */
  extraArgs: any[],
  // eslint-disable-next-line @typescript-eslint/ban-types
  actualThing: Function,
  /** Is function `describe` which we always run or `it` which we don't run */
  isDescribe: boolean
): string => {
  let key = '';
  const previousSuite = state.currentSuite;
  key = createId(name, state.currentSuite);

  if (!isDescribe) state.tests[key] = fn;
  if (isInNode) {
    if (!fn) {
      // `it.todo` does this
      actualThing(name);
    } else {
      actualThing(
        name,
        function (this: any, ...args: any[]) {
          if (isDescribe) {
            state.currentSuite = key;
          } else state.activeTest = key;
          const exitTest = () => {
            if (isDescribe) {
              state.currentSuite = previousSuite;
            } else delete state.activeTest;
          };
          const passed = (resolved: any) => {
            state.passedTests.add(key);
            exitTest();
            return resolved;
          };
          const failed = (err: any) => {
            exitTest();
            throw err;
          };

          if (key in state.retryMap) {
            state.retryMap[key]++;
          } else {
            state.retryMap[key] = 0;
          }
          try {
            const result = (fn as any).call(this, ...args);
            if (result && 'then' in result) {
              return result.then(passed, failed);
            }
            return passed(result);
          } catch (error) {
            return failed(error);
          }
        },
        ...extraArgs
      );
    }
  } else {
    // In the browser
    if (isDescribe) {
      state.currentSuite = key;
      fn();
      state.currentSuite = previousSuite;
    }
  }
  return key;
};
