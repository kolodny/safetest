import React from 'react';
import { Test as TestType } from './file';
import { Accordion } from './accordion';
import { Tab, Tabs } from './tabs';
import { Label } from './label';
import { FilenameContext, UrlContext } from './report';

export const Test: React.FunctionComponent<
  React.PropsWithChildren<{ test: TestType }>
> = ({ test }) => {
  const filename = React.useContext(FilenameContext);
  const url = React.useContext(UrlContext);
  const getTestUrl = () => {
    console.log({ url, filename });
    if (!url || !filename) return null;
    const filePrefix = filename.startsWith('.') ? '' : './';
    const fixedFile = `${filePrefix}${filename}`.replace(/\.[jt]sx?$/g, '');
    const testName = test.fullName.trim().replace(/ /g, '+');
    const search = `?test_path=${fixedFile}&test_name=${testName}`;
    return `${url}${search}`;
  };

  const tabs: Tab[] = [];
  const artifacts = test.artifacts;
  if (artifacts) {
    if (artifacts.trace) {
      tabs.push({
        title: 'Trace',
        content: <pre>{artifacts.trace}</pre>,
      });
    }
  }

  const testUrl = getTestUrl();
  const link = !!testUrl && (
    <a
      href={testUrl}
      target="_blank"
      onClick={(e) => e.stopPropagation()}
      style={{
        textDecoration: 0,
        color: '#228800',
      }}
    >
      Open tested component in new tab
    </a>
  );

  return (
    <Accordion
      defaultOpen
      summary={
        <>
          <Label>{test.status}</Label> {test.title} {link}
        </>
      }
    >
      <Tabs tabs={tabs} />
    </Accordion>
  );
};
