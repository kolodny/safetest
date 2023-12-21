import React from 'react';
import { Suite as SuiteType } from './file';
import { Accordion } from './accordion';
import { Test } from './test';

export const Suite: React.FunctionComponent<
  React.PropsWithChildren<{ suite: SuiteType }>
> = ({ suite }) => {
  return (
    <Accordion summary={suite.name}>
      {Object.values(suite.suites).map((suite) => (
        <Suite key={suite.id} suite={suite} />
      ))}
      {Object.values(suite.tests).map((test) => (
        <Test key={test.id} test={test} />
      ))}
    </Accordion>
  );
};
