import React from 'react';

export const Label: React.FunctionComponent<React.PropsWithChildren> = ({
  children,
}) => <small style={{ color: '#333' }}>{children}</small>;
