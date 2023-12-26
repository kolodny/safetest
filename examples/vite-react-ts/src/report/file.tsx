import React from 'react';
import { MergedResults } from 'safetest';
import { SuiteStatuses } from './suite';
import { ComponentsContext, StateContext } from './report';

type File = MergedResults['testResults'][number];

type Result = File['assertionResults'][number];
type Status = Result['status'];

export type Test = Result & { id: string; parent: Suite };

export type Suite = {
  name: string;
  id: string;
  suites: Record<string, Suite>;
  tests: Record<string, Test>;
  parent?: Suite;
};

const createNestedSuite = (file: File) => {
  const filename = file.filename;
  const suitesById: Record<string, Suite> = {};
  const statuses: Record<string, Status> = {};
  const suites: Record<string, Suite> = {};
  const tests: Record<string, Test> = {};
  const fileSuite: Suite = { id: filename, name: filename, suites, tests };
  for (const result of file.assertionResults) {
    const { ancestorTitles, title } = result;
    let suite = fileSuite;
    for (const ancestorTitle of ancestorTitles) {
      const id = `${suite.id} > ${ancestorTitle}`;
      if (!suite.suites[ancestorTitle]) {
        const name = ancestorTitle;
        const newSuite = { id, name, suites: {}, tests: {}, parent: suite };
        suitesById[id] = newSuite;
        suite.suites[ancestorTitle] = newSuite;
      }
      suite = suite.suites[ancestorTitle];
    }
    const id = `${suite.id} > ${result.title}`;
    const test = { ...result, id, parent: suite };
    suite.tests[title] = test;
    statuses[id] = test.status;
  }
  // const grouped: Partial<Record<Status, string[]>> = {};
  // for (const [id, status] of Object.entries(statuses)) {
  //   (grouped[status] ??= []).push(id);
  // }
  return {
    filename,
    suite: fileSuite,
    suiteIds: Object.keys(suitesById),
    statuses,
  };
};

export const File: React.FunctionComponent<{ file: File }> = ({ file }) => {
  const suite = React.useMemo(() => createNestedSuite(file), [file]);
  const { Accordion, Suite } = React.useContext(ComponentsContext);
  const showing = React.useContext(StateContext).viewing;
  let isViewing = false;
  for (const status of Object.values(suite.statuses)) {
    if (showing === 'all' || showing === status) {
      isViewing = true;
      break;
    }
  }
  if (!isViewing) return null;
  return (
    <Accordion
      summary={
        <>
          {<SuiteStatuses suite={suite.suite} />} {suite.filename}
        </>
      }
      defaultOpen
    >
      <Suite suite={suite.suite} />
    </Accordion>
  );
};
