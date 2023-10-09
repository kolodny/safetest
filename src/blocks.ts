/* eslint-disable @typescript-eslint/no-explicit-any */
import { state } from './state';
import { isInNode } from './is-in-node';

const smartAppendToCurrent = (appending: string) =>
  (state.currentSuitePlusTest ? state.currentSuitePlusTest + ' ' : '') +
  appending;

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
  const previous = state.currentSuitePlusTest;
  let key = smartAppendToCurrent(name);
  if (!isDescribe && key in state.tests) {
    let index = 2;
    while (key in state.tests) {
      key = smartAppendToCurrent(`${name} - ${index++}`);
    }
  }
  if (!isDescribe) state.tests[key] = fn;
  const previousSuite = state.currentSuite;
  if (isDescribe) state.currentSuite = createId(name, state.currentSuite);
  state.currentSuitePlusTest = key;
  if (isInNode) {
    if (!fn) {
      // `it.todo` does this
      actualThing(name);
    } else {
      if (!isDescribe) state.currentTest = name;
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
    if (isDescribe) {
      fn();
    }
  }
  if (isDescribe) state.currentSuite = previousSuite;
  state.currentSuitePlusTest = previous;
  return key;
};
