import merge from 'deepmerge';

import { RenderOptions } from './get-page';
import { state } from './state';

/**
 * Global render options; overrides any options passed to `render()` call.
 * Pass in `undefined` to reset to default.
 */
export const setOptions = (options?: RenderOptions) => {
  state.options = !options ? {} : merge(state.options ?? {}, options);
};
