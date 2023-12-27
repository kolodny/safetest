import React from 'react';

export const Hover: React.FunctionComponent<{
  children: (hover: boolean) => React.ReactNode;
}> = ({ children }) => {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children(hover)}
    </div>
  );
};
