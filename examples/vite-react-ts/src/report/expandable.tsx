import React from 'react';

const usePrevious = <T,>(value: T) => {
  const ref = React.useRef<T>(value);
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export const Expandable: React.FunctionComponent<
  React.PropsWithChildren<{ expanded: boolean; ms?: number }>
> = ({ expanded, children, ms }) => {
  const actualMs = ms ?? 200;
  const ref = React.useRef<HTMLDivElement>(null);
  const [myExpanded, setMyExpanded] = React.useState(expanded);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();
  const previousExpanded = usePrevious(expanded);
  const changed = React.useRef(false);
  const initialHide = React.useRef(!expanded);

  const transition = (ms: number) => `all ${ms}ms ease-in-out`;

  const myExpand = React.useCallback(
    (nextExpanded: boolean) => {
      const node = ref.current;

      if (node) {
        if (!changed.current) {
          node.style.transition = transition(actualMs);
        }
        if (nextExpanded === myExpanded) return;
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
        setMyExpanded(nextExpanded);
        const getHeight = () => node.getBoundingClientRect().height;
        const start = getHeight();
        node.style.maxHeight = '';
        const full = getHeight();
        const end = nextExpanded ? full : 0;
        node.style.maxHeight = `${start}px`;
        node.getBoundingClientRect();
        const percentageOfFullAnimation = Math.abs(end - start) / full;
        const timeout = (actualMs ?? 2000) * percentageOfFullAnimation;
        node.style.transition = transition(timeout);
        node.style.maxHeight = `${end}px`;
        timeoutRef.current = setTimeout(() => {
          changed.current = true;
          timeoutRef.current = undefined;
          if (nextExpanded) node.style.maxHeight = '';
        }, timeout);
      }
    },
    [actualMs, myExpanded]
  );

  React.useEffect(() => {
    if (previousExpanded !== expanded) myExpand(expanded);
  }, [previousExpanded, expanded, myExpand]);

  const style: React.CSSProperties = { overflow: 'hidden' };
  if (initialHide.current) style.maxHeight = '0';

  return <div style={style} ref={ref} children={children} />;
};
