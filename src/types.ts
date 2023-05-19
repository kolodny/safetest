import { MatchImageSnapshotOptions } from 'jest-image-snapshot';

export type Fns<T> = {
  [FilteredKey in {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [PropName in keyof T]: T[PropName] extends (...args: any) => any
      ? PropName
      : never;
  }[keyof T]]: T[FilteredKey];
};

declare global {
  namespace jest {
    interface Matchers<R, T> {
      toMatchImageSnapshot(filename: string): R;
      toMatchImageSnapshot(options?: MatchImageSnapshotOptions): R;
    }
  }
}
