let thenState: 'none' | 'maybe' | 'resolved' = 'none';

export const anythingProxy: any = new Proxy(function anythingProxy() {}, {
  apply: (_target, _thisArg, [resolve]) => {
    if (thenState === 'maybe') {
      thenState = 'resolved';
      return resolve ? resolve(anythingProxy) : anythingProxy;
    }
    return anythingProxy;
  },
  get: (_target, key) => {
    if (key === Symbol.unscopables) return {};
    if (key === Symbol.toPrimitive) return () => '';
    if (key === 'then') {
      if (thenState === 'none') {
        thenState = 'maybe';
      } else if (thenState === 'resolved') {
        thenState = 'none';
        return;
      }
    }
    return anythingProxy;
  },
});
