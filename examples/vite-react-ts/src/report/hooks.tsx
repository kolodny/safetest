import React from 'react';

const hash = new URLSearchParams(location.hash.slice(1));
export const useHashState = <T,>(name: string, defaultValue: T) => {
  const isString = (obj: unknown): obj is string => typeof obj === 'string';
  const isNumber = (obj: unknown): obj is string => typeof obj === 'number';
  const stringOrNumber = (obj: unknown) => isString(obj) || isNumber(obj);
  const stringify = (v: T) => (stringOrNumber(v) ? v : JSON.stringify(v));
  const defaultValueString = stringify(defaultValue);
  const [state, setState] = React.useState(() => {
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
  });
  const setWrapped = (value: T) => {
    const valueString = stringify(value) as string;
    setState(value);
    const same = valueString === defaultValueString;
    if (same) hash.delete(name);
    else hash.set(name, valueString);
    location.hash = decodeURIComponent(`${hash}`);
  };
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
