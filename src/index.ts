import { isInNode } from './is-in-node';
export { getRetryAttempt } from './get-retry-attempt';
export { setOptions } from './set-options';

const isInBrowser = !isInNode;
export { isInNode, isInBrowser };
export const runInBrowser = <T>(fn: () => Promise<T>): Promise<T> | undefined =>
  isInNode ? undefined : fn();
export const runInNode = <T>(fn: () => Promise<T>): Promise<T> | undefined =>
  isInNode ? fn() : undefined;
