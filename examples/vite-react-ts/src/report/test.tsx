import React from 'react';
import { type Tab } from './tabs';
import { ComponentsContext, FilenameContext } from './report';
import { statusIcons } from './suite';
import { upperFirst } from 'lodash';
import { Test as TestType } from './types';

const getAttempt = (url: string) => url.match(/-attempt-(\d+)/)?.[1];
const getAttemptText = (artifacts: string[], index: number) => {
  const hasMultipleAttempts = artifacts.some((t) => +getAttempt(t)! > 0);
  if (!hasMultipleAttempts) return '';
  const attempt = getAttempt(artifacts[index]);
  return `Attempt #${+attempt! + 1}`;
};

const TabLink: React.FunctionComponent<
  React.PropsWithChildren<{ href?: string }>
> = ({ href, children }) => {
  return (
    <span
      onClick={(e) => {
        const mac = navigator.platform.match('Mac');
        const open = e.shiftKey || (mac && e.metaKey) || (!mac && e.ctrlKey);
        if (!open) return;
        e.preventDefault();
        window.open(href, '_blank');
      }}
      style={{ padding: 8, color: 'inherit', textDecoration: 'none' }}
    >
      {children}
    </span>
  );
};

export const Test: React.FunctionComponent<
  React.PropsWithChildren<{ test: TestType }>
> = ({ test }) => {
  const { Accordion, Label, Tabs, Chip, renderArtifact, getTestUrl } =
    React.useContext(ComponentsContext);
  const filename = React.useContext(FilenameContext);

  const tabs: Tab[] = [];
  const artifacts = test.artifacts;
  if (artifacts) {
    for (const type of ['trace', 'video'] as const) {
      const rendered = (artifacts[type] ?? [])
        .map((trace, index) => {
          const item = renderArtifact(type, trace);
          if (!item) return null;
          const title =
            getAttemptText(artifacts[type]!, index) || `${type} #${+index + 1}`;
          return { title, item: item.element, url: item.url };
        })
        .filter(Boolean);

      if (rendered.length) {
        if (rendered.length === 1) {
          tabs.push({
            title: (
              <TabLink href={rendered[0]?.url}>{upperFirst(type)}</TabLink>
            ),
            content: rendered[0]?.item,
          });
        } else if (rendered?.length) {
          const subTabs: Tab[] = [];
          for (const render of rendered) {
            subTabs.push({
              title: (
                <TabLink href={render?.url}>
                  {upperFirst(render?.title)}
                </TabLink>
              ),
              content: render?.item,
            });
          }
          tabs.push({
            title: upperFirst(type),
            content: <Tabs tabs={subTabs} />,
          });
        }
      }
    }

    for (const key of ['diff', 'received', 'snapshot'] as const) {
      const title = key === 'received' ? 'Updated Golden' : upperFirst(key);
      if (artifacts[key]?.length) {
        const content = artifacts[key]
          ?.map((img) => renderArtifact(key, img))
          .filter(Boolean);

        if (content?.length) {
          tabs.push({
            title: <TabLink href={content[0]?.url}>{title}</TabLink>,
            content: content.map((child, i) => (
              <div
                key={i}
                style={{ marginBottom: 8 }}
                children={child?.element}
              />
            )),
          });
        }
      }
    }
  }

  const testUrl = filename && test && getTestUrl(filename, test.fullName);

  if (testUrl) {
    tabs.push({
      title: <TabLink href={testUrl}>View Component</TabLink>,
      content: (
        <iframe
          src={testUrl}
          style={{
            width: '100%',
            minHeight: 700,
            height: 'calc(100vh - 150px)',
            border: '1px solid #e2e2e2',
          }}
          loading='lazy'
        />
      ),
    });
  }

  return (
    <Accordion
      // onChange={(open) => console.log({ open })}
      summary={
        <>
          <Label>
            <Chip label={statusIcons[test.status]} />
          </Label>{' '}
          <span style={{ position: 'relative', zIndex: 1 }}>{test.title}</span>
          <span style={{ position: 'relative', zIndex: 0, userSelect: 'none' }}>
            <span
              style={{
                color: 'transparent',
                position: 'absolute',
                right: 0,
                top: 0,
                whiteSpace: 'pre',
              }}
            >
              {test.id}
            </span>
            <span
              style={{
                color: 'transparent',
                position: 'absolute',
                right: 0,
                top: 0,
                whiteSpace: 'pre',
              }}
            >
              {test.id.replace(/ > /g, ' ')}
            </span>
          </span>
        </>
      }
    >
      <Tabs tabs={tabs} />
    </Accordion>
  );
};
