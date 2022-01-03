/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-eval */
import { global } from './global';
import { isInNode } from './is-in-node';

export const playwright: typeof import('playwright') = isInNode
  ? eval('require')('playwright')
  : {};

export const fs: typeof import('fs/promises') = isInNode
  ? eval('require')('fs').promises
  : {};

export const path: typeof import('path') = isInNode
  ? eval('require')('path')
  : {};

export const child_process: typeof import('child_process') = isInNode
  ? eval('require')('child_process')
  : {};

// source-map acts weird when it think it's in the browser (it checks that by seeing if fetch is defined).
const oldFetch = global['fetch'];
if (!!oldFetch) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).fetch = undefined;
}
export const v8toIstanbul: typeof import('v8-to-istanbul') = isInNode
  ? eval('require')('v8-to-istanbul')
  : {};
if (oldFetch) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).fetch = oldFetch;
}
