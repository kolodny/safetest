import { state } from './state';
import { isInNode } from './is-in-node';

export const getRetryAttempt = () => {
  if (isInNode) {
    if (!state.activeTest) {
      throw new Error('getRetryAttempt called outside of a test');
    }
    return state.retryMap[state.activeTest];
  }
  return state.browserState?.retryAttempt ?? 0;
};
