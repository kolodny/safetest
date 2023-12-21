import React from 'react';
import { MergedResults } from 'safetest';
import { Accordion } from './accordion';
import { Suite } from './suite';

type File = MergedResults['testResults'][number];

type Result = File['assertionResults'][number];

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
  const testIds: string[] = [];
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
    testIds.push(id);
  }
  return { filename, suite: fileSuite, suiteIds: Object.keys(tests), testIds };
};

export const File: React.FunctionComponent<{ file: File }> = ({ file }) => {
  const suite = React.useMemo(() => createNestedSuite(file), [file]);
  console.log(suite);
  return (
    <Accordion summary={suite.filename}>
      <Suite suite={suite.suite} />
    </Accordion>
  );
};
