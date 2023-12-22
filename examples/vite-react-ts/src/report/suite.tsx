import React from 'react';
import { Suite as SuiteType } from './file';
import { Accordion } from './accordion';
import { Test } from './test';
import { Test as TestType } from './file';
import { Label } from './label';

type Status = TestType['status'];
type Statuses = Partial<Record<Status, number>>;

export const getSuiteStatuses = (suite: SuiteType) => {
  const statuses = getStatusesInner(suite);
  return getStatusesText(statuses);
};
const getStatusesText = (statuses: Statuses) =>
  Object.entries(statuses)
    .map(
      ([status, count]) =>
        `${count > 1 ? `${count}x ` : ''}${statusMap[status as Status]}`
    )
    .join(', ');
const getTestStatuses = (tests: TestType[], statuses: Statuses = {}) => {
  for (const test of tests) {
    const status = test.status;
    statuses[status] = (statuses[status] || 0) + 1;
  }
  return getStatusesText(statuses);
};
const getStatusesInner = (suite: SuiteType, statuses: Statuses = {}) => {
  const suites = Object.values(suite.suites);
  const tests = Object.values(suite.tests);
  for (const test of tests) {
    const status = test.status;
    statuses[status] = (statuses[status] || 0) + 1;
  }
  for (const suite of suites) {
    getStatusesInner(suite, statuses);
  }
  return statuses;
};

export const statusMap = {
  passed: '✅',
  failed: '❌',
  pending: '⏱',
  skipped: '⏭',
  todo: '📝',
  disabled: '🚫',
  empty: '📭',
};

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
              <Label>Suite</Label>{' '}
              <small>
                <Label>{getSuiteStatuses(suite)}</Label>
              </small>{' '}
              {suite.name}
            </>
          }
        >
          <Suite key={suite.id} suite={suite} />
        </Accordion>
      ))}
      {tests.length > 0 && (
        <Accordion
          defaultOpen
          summary={<Label>{getTestStatuses(tests)} Tests</Label>}
        >
          {tests.map((test) => (
            <Test key={test.id} test={test} />
          ))}
        </Accordion>
      )}
    </>
  );
};
