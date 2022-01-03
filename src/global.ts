export const g: typeof global =
  typeof globalThis !== 'undefined'
    ? globalThis
    : typeof self !== 'undefined'
    ? self
    : typeof window !== 'undefined'
    ? window
    : typeof global !== 'undefined'
    ? global
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ({} as any);

export { g as global };
