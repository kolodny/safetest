import React from 'react';
import { useFetching, useHashState } from './hooks';
import { MergedResults } from 'safetest';
import { File } from './file';
import { Radio } from './radio';
import { Status } from './suite';
import { upperFirst } from 'lodash';

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

export const Report: React.FunctionComponent = () => {
  const [resultsLocation, setResultsLocation] = useHashState('results', '');
  const [url] = useHashState('url', '/');
  const [showing, setShowing] = useHashState<'all' | Status | undefined>(
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
    <>
      <h1>Test Report</h1>
      {results.loading && <p>Loading...</p>}
      {results.data && (
        <div
          style={{
            marginBottom: 16,
            padding: 8,
            border: '1px solid',
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
    </>
  );
};
