import React from 'react';
import { useFetching, useHashState } from './hooks';
import { MergedResults } from 'safetest';
import { File } from './file';

export const FilenameContext = React.createContext<string | null>(null);
export const UrlContext = React.createContext<string | null>(null);

export const Report: React.FunctionComponent = () => {
  const [resultsLocation, setResultsLocation] = useHashState('results', '');
  const [url] = useHashState('url', '/');
  const aElement = document.createElement('a');
  aElement.href = url;

  const results = useFetching<MergedResults>(resultsLocation, {
    enabled: !!resultsLocation,
  });
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

  return (
    <>
      <h1>Test Report</h1>
      {results.loading && <p>Loading...</p>}
      {results.data?.testResults.map((file) => (
        <FilenameContext.Provider key={file.filename} value={file.filename}>
          <UrlContext.Provider value={url}>
            <File file={file} />
          </UrlContext.Provider>
        </FilenameContext.Provider>
      ))}
    </>
  );
};
