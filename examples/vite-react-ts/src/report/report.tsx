import React from 'react';
import { useFetching, useHashState } from './hooks';
import { MergedResults } from 'safetest';
import { File } from './file';

export const Report: React.FunctionComponent = () => {
  const [url, setUrl] = useHashState('results', '');
  const results = useFetching<MergedResults>(url, { enabled: !!url });
  if (!url)
    return (
      <>
        <h1>Test Report</h1>
        <p>No results URL provided.</p>
        <input
          type="text"
          placeholder="Results URL"
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              setUrl((e.target as HTMLInputElement).value);
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
        <File key={file.filename} file={file} />
      ))}
    </>
  );
};
