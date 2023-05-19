export const g: typeof global =
  typeof globalThis !== 'undefined'
    ? globalThis
    : // eslint-disable-next-line no-restricted-globals
    typeof self !== 'undefined'
    ? // eslint-disable-next-line no-restricted-globals
      self
    : typeof window !== 'undefined'
    ? window
    : typeof global !== 'undefined'
    ? global
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ({} as any);

export { g as global };
