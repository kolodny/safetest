export type Fns<T> = {
  [FilteredKey in {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [PropName in keyof T]: T[PropName] extends (...args: any) => any
      ? PropName
      : never;
  }[keyof T]]: T[FilteredKey];
};
