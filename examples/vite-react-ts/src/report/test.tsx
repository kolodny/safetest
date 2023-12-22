import React from 'react';
import { Test as TestType } from './file';
import { Accordion } from './accordion';
import { Tab, Tabs } from './tabs';
import { Label } from './label';
import { FilenameContext, UrlContext } from './report';
import { statusMap } from './suite';

const Link: React.FunctionComponent<
  React.PropsWithChildren<{ href: string }>
> = ({ href, children }) => {
  const [hover, setHover] = React.useState(false);
  return (
    <a
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      target="_blank"
      href={href}
      onClick={(e) => e.stopPropagation()}
      style={{
        textDecoration: hover ? 'underline' : 0,
        color: hover ? '#a0541a' : '#008800',
      }}
    >
      {children}
    </a>
  );
};

const SmartVideo: React.FunctionComponent<{ src: string }> = ({ src }) => (
  <video
    autoPlay
    preload="none"
    onLoadedMetadata={({ currentTarget: video }) => {
      video.width = video.videoWidth;
      video.height = video.videoHeight;
    }}
    width="800"
    height="450"
    src={src}
    style={{ border: '1px solid #e2e2e2' }}
    controls
  />
);

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
  const filename = React.useContext(FilenameContext);
  const url = React.useContext(UrlContext);
  const getTestUrl = () => {
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
    const renderArtifacts = (
      artifacts: string[],
      callback: (artifact: string) => React.ReactNode
    ) => {
      if (artifacts.length === 0) return null;
      if (artifacts.length === 1) return callback(artifacts[0]);
      const subTabs: Tab[] = [];
      for (const [index, artifact] of Object.entries(artifacts)) {
        subTabs.push({
          title: getAttemptText(artifacts, +index),
          content: callback(artifact),
        });
      }
      return <Tabs tabs={subTabs} />;
    };

    tabs.push({
      title: `Trace${(artifacts.video?.length ?? 0) > 1 ? 's' : ''}`,
      content: renderArtifacts(artifacts.trace ?? [], (trace) => {
        const aElement = document.createElement('a');
        aElement.href = `${url}${trace}`;
        const traceUrl = aElement.href;
        const viewerUrl = traceUrl.split('/traces/')[0];
        const fullUrl = `${viewerUrl}/?trace=${traceUrl}`;
        return (
          <div style={{ paddingRight: 8 }}>
            <iframe
              style={{
                width: '100%',
                minHeight: 700,
                height: 'calc(100vh - 80px)',
              }}
              src={fullUrl}
              loading="lazy"
            ></iframe>
          </div>
        );
      }),
    });

    tabs.push({
      title: `Video${(artifacts.video?.length ?? 0) > 1 ? 's' : ''}`,
      content: renderArtifacts(artifacts.video ?? [], (video) => {
        return <SmartVideo key={video} src={`${url}${video}`} />;
      }),
    });

    if (artifacts.diff) {
      tabs.push({
        title: 'Diff',
        content: artifacts.diff.map((img, index) => (
          <div
            key={index}
            style={{
              marginBottom: 8,
              display: 'flex',
              width: 'fit-content',
            }}
          >
            <Link href={`${url}${img}`}>
              <img
                style={{ maxWidth: '80vw', border: '1px solid #e2e2e2' }}
                alt=""
                src={`${url}${img}`}
              />
            </Link>
          </div>
        )),
      });
    }

    if (artifacts.received) {
      tabs.push({
        title: 'Updated Golden',
        content: artifacts.received.map((img, index) => (
          <div
            key={index}
            style={{
              marginBottom: 8,
              display: 'flex',
              width: 'fit-content',
            }}
          >
            <Link href={`${url}${img}`}>
              <img
                style={{ maxWidth: '80vw', border: '1px solid #e2e2e2' }}
                alt=""
                src={`${url}${img}`}
              />
            </Link>
          </div>
        )),
      });
    }
  }

  const testUrl = getTestUrl();
  const link = !!testUrl && (
    <Link href={testUrl}>Open tested component in new tab</Link>
  );

  return (
    <Accordion
      // onChange={(open) => console.log({ open })}
      summary={
        <>
          <Label>{statusMap[test.status]}</Label> {test.title} {link}
        </>
      }
    >
      <Tabs tabs={tabs} />
    </Accordion>
  );
};
