import React from 'react';
import { type Tab } from './tabs';
import { ComponentsContext, FilenameContext } from './report';
import { statusMap } from './suite';
import { upperFirst } from 'lodash';
import { Test as TestType } from './types';

const getAttempt = (url: string) => url.match(/-attempt-(\d+)/)?.[1];
const getAttemptText = (artifacts: string[], index: number) => {
  const hasMultipleAttempts = artifacts.some((t) => +getAttempt(t)! > 0);
  if (!hasMultipleAttempts) return '';
  const attempt = getAttempt(artifacts[index]);
  return `Attempt #${+attempt! + 1}`;
};

export const Test: React.FunctionComponent<
  React.PropsWithChildren<{ test: TestType }>
> = ({ test }) => {
  const { Accordion, Label, Tabs, Chip, renderArtifactUrl, getTestUrl } =
    React.useContext(ComponentsContext);
  const filename = React.useContext(FilenameContext);

  const tabs: Tab[] = [];
  const artifacts = test.artifacts;
  if (artifacts) {
    const renderArtifacts = (
      artifacts: string[],
      callback: (artifact: string) => React.ReactNode
    ) => {
      if (artifacts.length === 0) return null;
      if (artifacts.length === 1) return callback(artifacts[0]);
      const subTabs: Tab[] = [];
      for (const [index, artifact] of Object.entries(artifacts)) {
        subTabs.push({
          title: getAttemptText(artifacts, +index) || `Trace #${+index + 1}`,
          content: callback(artifact),
        });
      }
      return <Tabs tabs={subTabs} />;
    };

    tabs.push({
      title: `Trace${(artifacts.video?.length ?? 0) > 1 ? 's' : ''}`,
      content: renderArtifacts(artifacts.trace ?? [], (trace) => {
        return (
          <div style={{ paddingRight: 8 }}>
            {renderArtifactUrl('trace', trace)}
          </div>
        );
      }),
    });

    tabs.push({
      title: `Video${(artifacts.video?.length ?? 0) > 1 ? 's' : ''}`,
      content: renderArtifacts(artifacts.video ?? [], (video) => {
        return <div>{renderArtifactUrl('video', video)}</div>;
      }),
    });

    for (const key of ['diff', 'received', 'snapshot'] as const) {
      const title = key === 'received' ? 'Updated Golden' : upperFirst(key);
      if (artifacts[key]?.length) {
        const content = artifacts[key]
          ?.map((img, index) => (
            <div key={index} style={{ marginBottom: 8 }}>
              {renderArtifactUrl(key, img)}
            </div>
          ))
          .filter(Boolean);

        if (content?.length) {
          tabs.push({ title, content });
        }
      }
    }
  }

  const testUrl = filename && test && getTestUrl(filename, test.fullName);

  if (testUrl) {
    tabs.push({
      title: (
        <span
          style={{ padding: '8px 0' }}
          onClick={(e) => {
            e.preventDefault();
            window.open(testUrl, '_blank');
          }}
        >
          View Component
          <svg
            style={{ paddingLeft: 6, zoom: 0.7 }}
            viewBox="0 0 1024 1024"
            height="1em"
            width="1em"
          >
            <path d="M 345.6 172.7985 L 345.6 287.9994 L 115.2 288 L 115.2 864 L 691.2 864 L 691.2 633.5994 L 806.3982 633.5994 L 806.4 979.2 L 0 979.2 L 0 172.8 L 345.6 172.7985 Z M 979.2 0 L 979.2 460.8 L 864 460.8 L 864 196.6545 L 386.3294 674.3293 L 304.8706 592.8706 L 782.541 115.1982 L 518.4 115.2 L 518.4 0 L 979.2 0 Z" />
          </svg>
        </span>
      ),
      content: null,
    });
  }

  return (
    <Accordion
      // onChange={(open) => console.log({ open })}
      summary={
        <>
          <Label>
            <Chip label={statusMap[test.status]} />
          </Label>{' '}
          {test.title}
        </>
      }
    >
      <Tabs tabs={tabs} />
    </Accordion>
  );
};
