import React from 'react';
import {
  useFetching as myUseFetching,
  useHashState as myUseHashState,
} from './hooks';
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
import { Link } from './link';
import { SmartVideo } from './smart-video';
import { ArtifactType, MergedResults, Status } from './types';

export const FilenameContext = React.createContext<string | null>(null);
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

export const ComponentsContext = React.createContext<Required<Props>>(
  {} as never
);

export type Props = Partial<Components> &
  Partial<{
    useState: typeof myUseHashState;
    useFetching: typeof myUseFetching;
    getTestUrl: (filename: string, test: string) => string | undefined;
    renderArtifact: (type: ArtifactType, artifact: string) => React.ReactNode;
  }>;

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
  getTestUrl,
  renderArtifact,
} = {}) => {
  const [resultsLocation, setResultsLocation] = useState('results', '');
  const [url] = useState('url', '/');
  const [showing, setShowing] = useState<'all' | Status>('status', 'all');
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

  const myGetTestUrl =
    getTestUrl ??
    ((filename, test) => {
      if (!url || !filename) return '';
      const filePrefix = filename.startsWith('.') ? '' : './';
      const fixedFile = `${filePrefix}${filename}`.replace(/\.[jt]sx?$/g, '');
      const testName = test.trim().replace(/ /g, '+');
      const search = `?test_path=${fixedFile}&test_name=${testName}`;
      return `${url}${search}`;
    });

  const myRenderArtifact =
    renderArtifact ??
    ((type, artifact) => {
      if (type === 'trace') {
        const aElement = document.createElement('a');
        aElement.href = `${url}${artifact}`;
        const traceUrl = aElement.href;
        const viewerUrl = traceUrl.split('/traces/')[0];
        const fullUrl = `${viewerUrl}/?trace=${traceUrl}`;
        return (
          <iframe
            style={{
              width: '100%',
              minHeight: 700,
              height: 'calc(100vh - 150px)',
              border: '1px solid #e2e2e2',
            }}
            src={fullUrl}
            loading="lazy"
          />
        );
      }
      if (type === 'video') {
        return <SmartVideo src={`${url}${artifact}`} />;
      }
      if (type === 'snapshot') return null;
      return (
        <div
          style={{
            display: 'flex',
            width: 'fit-content',
          }}
        >
          <Link href={`${url}${artifact}`}>
            <img
              style={{ maxWidth: '80vw', border: '1px solid #e2e2e2' }}
              alt=""
              src={`${url}${artifact}`}
            />
          </Link>
        </div>
      );
      return `${url}${artifact}`;
    });

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
        getTestUrl: myGetTestUrl,
        renderArtifact: myRenderArtifact,
        useState,
        useFetching,
      }}
    >
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
                setShowing(statusFilters[e ?? 0] as Status);
              }}
            />
          </div>
        </div>
      )}
      {results.data?.testResults.map((file) => (
        <FilenameContext.Provider key={file.filename} value={file.filename}>
          <StateContext.Provider value={{ viewing: showing }}>
            <File file={file} />
          </StateContext.Provider>
        </FilenameContext.Provider>
      ))}
    </ComponentsContext.Provider>
  );
};
