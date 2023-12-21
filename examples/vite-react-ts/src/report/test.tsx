import React from 'react';
import { Test as TestType } from './file';
import { Accordion } from './accordion';

export const Test: React.FunctionComponent<
  React.PropsWithChildren<{ test: TestType }>
> = ({ test }) => {
  return (
    <Accordion defaultOpen summary={test.title}>
      {test.status}
    </Accordion>
  );
};
