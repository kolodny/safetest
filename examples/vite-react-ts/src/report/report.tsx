import React from 'react';
import {
  useFetching as myUseFetching,
  useHashState as myUseHashState,
} from './hooks';
import { MergedResults } from 'safetest';
import { Status } from './suite';
import { upperFirst } from 'lodash';
import { Accordion as MyAccordion } from './accordion';
import { Chip as MyChip } from './chip';
import { Expandable as MyExpandable } from './expandable';
import { File as MyFile } from './file';
import { Label as MyLabel } from './label';
import { Radio as MyRadio } from './radio';
import { Suite as MySuite } from './suite';
import { Tabs as MyTabs } from './tabs';
import { Test as MyTest } from './test';

export const FilenameContext = React.createContext<string | null>(null);
export const UrlContext = React.createContext<string | null>(null);
export const StateContext = React.createContext<{
  viewing?: string;
  id?: string;
}>({});

const statusMap: Record<Status, boolean> = {
  passed: false,
  failed: false,
  pending: false,
  skipped: false,
  disabled: false,
  todo: false,
};
const statuses = Object.keys(statusMap) as Status[];

type Components = {
  Accordion: typeof MyAccordion;
  Chip: typeof MyChip;
  Expandable: typeof MyExpandable;
  File: typeof MyFile;
  Label: typeof MyLabel;
  Radio: typeof MyRadio;
  Suite: typeof MySuite;
  Tabs: typeof MyTabs;
  Test: typeof MyTest;
};

export const ComponentsContext = React.createContext<Components>({} as never);

interface Props extends Partial<Components> {
  useState?: typeof myUseHashState;
  useFetching?: typeof myUseFetching;
}

export const Report: React.FunctionComponent<Props> = ({
  useFetching = myUseFetching,
  useState = myUseHashState,
  Accordion = MyAccordion,
  Chip = MyChip,
  Expandable = MyExpandable,
  File = MyFile,
  Label = MyLabel,
  Radio = MyRadio,
  Suite = MySuite,
  Tabs = MyTabs,
  Test = MyTest,
} = {}) => {
  const [resultsLocation, setResultsLocation] = useState('results', '');
  const [url] = useState('url', '/');
  const [showing, setShowing] = useState<'all' | Status | undefined>(
    'status',
    'all'
  );
  const results = useFetching<MergedResults>(resultsLocation, {
    enabled: !!resultsLocation,
  });
  const statusCounts = React.useMemo(() => {
    const counts: Partial<Record<string, number>> = { all: 0 };
    for (const file of results.data?.testResults ?? []) {
      for (const test of file.assertionResults) {
        counts[test.status] = (counts[test.status] ?? 0) + 1;
        counts.all!++;
      }
    }
    return counts;
  }, [results.data?.testResults]);

  if (!resultsLocation)
    return (
      <>
        <h1>Test Report</h1>
        <p>No results URL provided.</p>
        <input
          type="text"
          placeholder="Results URL"
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              setResultsLocation((e.target as HTMLInputElement).value);
            }
          }}
        />
      </>
    );

  const statusFilters = ['all', ...statuses];

  return (
    <ComponentsContext.Provider
      value={{
        Accordion,
        Chip,
        Expandable,
        File,
        Label,
        Radio,
        Suite,
        Tabs,
        Test,
      }}
    >
      <h1>Test Report</h1>
      {results.loading && <p>Loading...</p>}
      {results.data && (
        <div
          style={{
            marginBottom: 16,
            padding: 8,
            border: '1px solid #bbb',
          }}
        >
          Showing:
          <div style={{ display: 'inline-block', paddingLeft: 8 }}>
            <Radio
              options={statusFilters.map((s) => {
                const label = upperFirst(s);
                return `${label} (${statusCounts[s] ?? 0})`;
              })}
              defaultIndex={statusFilters.indexOf(showing!)}
              onChange={(e) => {
                setShowing(statusFilters[e ?? 0] as Status | undefined);
              }}
            />
          </div>
        </div>
      )}
      {results.data?.testResults.map((file) => (
        <FilenameContext.Provider key={file.filename} value={file.filename}>
          <UrlContext.Provider value={url}>
            <StateContext.Provider value={{ viewing: showing }}>
              <File file={file} />
            </StateContext.Provider>
          </UrlContext.Provider>
        </FilenameContext.Provider>
      ))}
    </ComponentsContext.Provider>
  );
};
