import { anythingProxy } from './anythingProxy';
import { global } from './global';
import { isInNode } from './is-in-node';

export const ensureImported = (globalProp: string, name: string) => {
  const g = global as any;
  if (!g[globalProp]) {
    if (isInNode) throw new Error(`No global variable '${name}'`);
    g[globalProp] = anythingProxy;
  }
};
