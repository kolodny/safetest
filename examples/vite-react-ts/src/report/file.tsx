import React from 'react';
import { SuiteStatuses } from './suite';
import { ComponentsContext, StateContext } from './report';
import { File as FileType, Status, Suite, Test } from './types';

const createNestedSuite = (file: FileType) => {
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

  return {
    filename,
    suite: fileSuite,
    suiteIds: Object.keys(suitesById),
    statuses,
  };
};

export const File: React.FunctionComponent<{ file: FileType }> = ({ file }) => {
  const suite = React.useMemo(() => createNestedSuite(file), [file]);
  const { Accordion, Suite, Label } = React.useContext(ComponentsContext);
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
          <SuiteStatuses suite={suite.suite} /> <Label>File: </Label>
          {suite.filename}
        </>
      }
      defaultOpen
    >
      <Suite suite={suite.suite} />
    </Accordion>
  );
};
