import React from 'react';
import { Suite as SuiteType } from './file';
import { Accordion } from './accordion';
import { Test } from './test';
import { Test as TestType } from './file';
import { Label } from './label';
import { StateContext } from './report';
import { Chip } from './chip';

export type Status = TestType['status'];
type Statuses = Partial<Record<Status, number>>;

export const getSuiteStatuses = (suite: SuiteType) => {
  const statuses = getStatusesCount(suite);
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
      {getStatusesText(statuses)}
    </div>
  );
};
const getStatusesText = (statuses: Statuses) =>
  Object.entries(statuses).map(([status, count]) => {
    const label = `${count > 1 ? `${count}x ` : ''}${
      statusMap[status as Status]
    }`;
    return <Chip key={label} label={label} />;
  });
const getTestStatuses = (tests: TestType[], statuses: Statuses = {}) => {
  for (const test of tests) {
    const status = test.status;
    statuses[status] = (statuses[status] || 0) + 1;
  }
  return getStatusesText(statuses);
};
const getStatusesCount = (suite: SuiteType, statuses: Statuses = {}) => {
  const suites = Object.values(suite.suites);
  const tests = Object.values(suite.tests);
  for (const test of tests) {
    const status = test.status;
    statuses[status] = (statuses[status] || 0) + 1;
  }
  for (const suite of suites) {
    getStatusesCount(suite, statuses);
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

const showSuite = (suite: SuiteType, showing?: string) => {
  const counts = getStatusesCount(suite);
  if (showing !== 'all' && !counts[showing as 'passed']) {
    return false;
  }
  return true;
};

export const Suite: React.FunctionComponent<
  React.PropsWithChildren<{ suite: SuiteType }>
> = ({ suite }) => {
  const suites = Object.values(suite.suites);
  const tests = Object.values(suite.tests);
  const showing = React.useContext(StateContext).viewing;
  if (!showSuite(suite, showing)) return null;

  return (
    <>
      {suites
        .filter((subSuite) => showSuite(subSuite, showing))
        .map((subSuite) => (
          <Accordion
            defaultOpen
            key={subSuite.name}
            summary={
              <>
                <Label>Suite</Label> {getSuiteStatuses(subSuite)}
                {subSuite.name}
              </>
            }
          >
            <Suite key={subSuite.id} suite={subSuite} />
          </Accordion>
        ))}
      {tests.length > 0 && (
        <Accordion
          defaultOpen
          summary={<Label>{getTestStatuses(tests)} Tests</Label>}
        >
          {tests
            .filter((t) => (showing === 'all' ? true : t.status === showing))
            .map((test) => (
              <Test key={test.id} test={test} />
            ))}
        </Accordion>
      )}
    </>
  );
};
