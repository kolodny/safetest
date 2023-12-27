import React from 'react';
import { Hover } from './hover';

export const Link: React.FunctionComponent<
  React.PropsWithChildren<{ href: string }>
> = ({ href, children }) => {
  return (
    <Hover>
      {(hover) => (
        <a
          target="_blank"
          href={href}
          onClick={(e) => e.stopPropagation()}
          style={{
            textDecoration: hover ? 'underline' : 0,
            color: hover ? '#a0541a' : '#008800',
          }}
        >
          {children}
        </a>
      )}
    </Hover>
  );
};
