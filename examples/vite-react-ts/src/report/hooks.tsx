import React from 'react';

export const useHashState = <T,>(name: string, defaultValue: T) => {
  const isString = (obj: unknown): obj is string => typeof obj === 'string';
  const isNumber = (obj: unknown): obj is string => typeof obj === 'number';
  const stringOrNumber = (obj: unknown) => isString(obj) || isNumber(obj);
  const stringify = (v: T) => (stringOrNumber(v) ? v : JSON.stringify(v));
  const defaultValueString = stringify(defaultValue);
  const getValue = React.useCallback(
    (hash: URLSearchParams) => {
      let value = defaultValue;
      if (hash.has(name)) {
        const hashValue = hash.get(name)!;
        if (isNumber(defaultValue)) value = +hashValue as T;
        else if (isString(defaultValue)) value = hashValue as T;
        else {
          try {
            value = JSON.parse(hashValue);
          } catch (e) {
            console.error(e);
          }
        }
      }
      return value;
    },
    [defaultValue, name]
  );
  const [state, setState] = React.useState(() => {
    return getValue(new URLSearchParams(location.hash.slice(1)));
  });
  const setWrapped = (value: T) => {
    const hash = new URLSearchParams(location.hash.slice(1));
    const valueString = stringify(value) as string;
    setState(value);
    const same = valueString === defaultValueString;
    if (same) hash.delete(name);
    else hash.set(name, valueString);
    const url = new URL(location.href);
    const oldHash = new URLSearchParams(location.hash.slice(1));
    const newHashValues = Object.fromEntries([
      ...new URLSearchParams([...oldHash, ...[...new URLSearchParams(hash)]]),
    ]);

    url.hash = '';
    const nextHash = `${new URLSearchParams(newHashValues)}`;
    const nextUrl = `${url}#${decodeURIComponent(nextHash)}`;
    history.replaceState(null, '', nextUrl);
  };

  React.useEffect(() => {
    const listener = ({ newURL, oldURL }: HashChangeEvent) => {
      const newHash = new URLSearchParams(new URL(newURL).hash.slice(1));
      const oldHash = new URLSearchParams(new URL(oldURL).hash.slice(1));
      if (newHash.get(name) !== oldHash.get(name)) {
        const newValue = getValue(newHash);
        if (newValue !== state) {
          setState(newValue);
        }
      }
    };

    window.addEventListener('hashchange', listener);
    return () => window.removeEventListener('hashchange', listener);
  }, [getValue, name, state]);

  return [state, setWrapped] as const;
};

export const useFetching = <T,>(
  url: string,
  { enabled }: { enabled: boolean } = { enabled: true }
) => {
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<T>();
  const [error, setError] = React.useState();
  const fetcher = React.useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    fetch(url)
      .then((r) => r.json())
      .then(setData, setError)
      .finally(() => setLoading(false));
  }, [enabled, url]);
  React.useEffect(() => void fetcher(), [fetcher]);
  return { loading, data, error };
};
