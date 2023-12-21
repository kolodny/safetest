import React from 'react';
import { Suite as SuiteType } from './file';
import { Accordion } from './accordion';
import { Test } from './test';
import { Label } from './label';

export const Suite: React.FunctionComponent<
  React.PropsWithChildren<{ suite: SuiteType }>
> = ({ suite }) => {
  const suites = Object.values(suite.suites);
  const tests = Object.values(suite.tests);
  return (
    <>
      {suites.map((suite) => (
        <Accordion
          defaultOpen
          key={suite.name}
          summary={
            <>
              <Label>Suite</Label> {suite.name}
            </>
          }
        >
          <Suite key={suite.id} suite={suite} />
        </Accordion>
      ))}
      {tests.length > 0 && (
        <Accordion defaultOpen summary={<Label>Tests</Label>}>
          {tests.map((test) => (
            <Test key={test.id} test={test} />
          ))}
        </Accordion>
      )}
    </>
  );
};
