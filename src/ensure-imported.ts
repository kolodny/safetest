import { anythingProxy } from './anythingProxy';
import { global } from './global';

const realGlobals = Symbol.for('safetest.globals');
const globals: Record<string, any> = (global as any)[realGlobals] ?? {};

export const ensureImported = <T>(
  globalProp: string,
  name: string,
  throwing?: boolean
): T => {
  const g = global as any;
  const original = globals[globalProp] ?? g[globalProp] ?? anythingProxy;
  globals[globalProp] = original;
  g[globalProp] = () => {
    if (throwing) throw new Error(`'${name}' must be imported from safetest!`);
    return original;
  };

  return original;
};
