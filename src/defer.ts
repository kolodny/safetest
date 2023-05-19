export interface Deferred<T = void> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
}

export const deferred = <T = void>() => {
  const deferred: Deferred<T> = {
    promise: null,
    resolve: null,
    reject: null,
  } as any;
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
};
