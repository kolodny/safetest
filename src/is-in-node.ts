export const isInNode =
  typeof process === 'object' &&
  Object.prototype.toString.call(process).slice(8, -1) === 'process';
