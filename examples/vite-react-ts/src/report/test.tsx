import React from 'react';
import { Test as TestType } from './file';
import { Accordion } from './accordion';
import { Tab, Tabs } from './tabs';
import { Label } from './label';
import { FilenameContext, UrlContext } from './report';

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

const statuses = {
  passed: '✅',
  failed: '❌',
  pending: '⏱',
  skipped: '⏭',
  todo: '📝',
  disabled: '🚫',
  empty: '📭',
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
    if (artifacts.trace) {
      tabs.push({
        title: 'Trace',
        content: artifacts.trace.map((trace) => {
          const aElement = document.createElement('a');
          aElement.href = `${url}${trace}`;
          const traceUrl = aElement.href;
          const viewerUrl = traceUrl.split('/traces/')[0];
          const fullUrl = `${viewerUrl}/?trace=${traceUrl}`;
          const attempt = getAttempt(traceUrl);
          let attemptText = '';
          if (+attempt! > 1) attemptText = ` (attempt ${attempt})`;
          return (
            <div
              key={fullUrl}
              style={{ display: 'inline-block', paddingRight: 8 }}
            >
              <Link href={fullUrl}>
                View Trace
                {attemptText}
              </Link>
            </div>
          );
        }),
      });
    }

    for (const video of artifacts.video ?? []) {
      const attempt = getAttempt(video);
      let attemptText = '';
      if (+attempt! > 1) attemptText = ` (attempt ${attempt})`;
      tabs.push({
        title: `Video${attemptText}`,
        content: <SmartVideo key={video} src={`${url}${video}`} />,
      });
    }

    if (artifacts.diff) {
      tabs.push({
        title: 'Diff',
        content: artifacts.diff.map((img) => (
          <div
            key={img}
            style={{
              border: '1px solid',
              display: 'flex',
              width: 'fit-content',
            }}
          >
            <Link href={img}>
              <img style={{ maxWidth: '80vw' }} alt="" src={img} />
            </Link>
          </div>
        )),
      });
    }

    if (artifacts.received) {
      tabs.push({
        title: 'Diff',
        content: artifacts.received.map((img) => (
          <div
            key={img}
            style={{
              border: '1px solid',
              display: 'flex',
              width: 'fit-content',
            }}
          >
            <Link href={img}>
              <img style={{ maxWidth: '80vw' }} alt="" src={img} />
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
      summary={
        <>
          <Label>{statuses[test.status]}</Label> {test.title} {link}
        </>
      }
    >
      <Tabs tabs={tabs} />
    </Accordion>
  );
};
