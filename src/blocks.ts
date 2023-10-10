/* eslint-disable @typescript-eslint/no-explicit-any */
import { state } from './state';
import { isInNode } from './is-in-node';

const seen = new Set<string>();
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
  if (isDescribe) {
    key = state.currentSuite = createId(name, state.currentSuite);
  } else {
    key = createId(name, state.currentSuite);
  }

  if (!isDescribe) state.tests[key] = fn;
  if (isInNode) {
    if (!fn) {
      // `it.todo` does this
      actualThing(name);
    } else {
      actualThing(
        name,
        function (this: any, ...args: any[]) {
          if (!isDescribe) state.activeTest = key;
          const exitTest = () => {
            if (isDescribe) {
              state.currentSuite = previousSuite;
            } else delete state.activeTest;
          };

          if (key in state.retryMap) {
            state.retryMap[key]++;
          } else {
            state.retryMap[key] = 0;
          }
          const result = (fn as any).call(this, ...args);
          if (result && 'then' in result) {
            return result
              .then((resolved: any) => {
                state.passedTests.add(key);
                return resolved;
              })
              .finally(exitTest);
          } else {
            exitTest();
          }
          state.passedTests.add(key);
          return result;
        },
        ...extraArgs
      );
    }
  } else {
    // In the browser
    if (isDescribe) {
      fn();
    }
  }
  return key;
};
