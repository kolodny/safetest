'use client';

import { Bootstrap as SafetestBootstrap } from 'safetest/react';
import { imports } from './imports';

export const Bootstrap = (props: React.PropsWithChildren) => (
  <SafetestBootstrap imports={imports}>{props.children}</SafetestBootstrap>
);
