import React from 'react';

export const Hover: React.FunctionComponent<{
  style?: React.CSSProperties;
  children: (hover: boolean) => React.ReactNode;
}> = ({ children, style }) => {
  const [hover, setHover] = React.useState(false);
  return (
    <span
      style={style}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children(hover)}
    </span>
  );
};
