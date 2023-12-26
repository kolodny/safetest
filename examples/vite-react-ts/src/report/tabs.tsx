import React from 'react';
import { Radio } from './radio';

export interface Tab {
  title: React.ReactNode;
  content: React.ReactNode;
}

export const Tabs: React.FunctionComponent<{ tabs: Tab[] }> = ({ tabs }) => {
  const [selected, setSelected] = React.useState(0);
  return (
    <>
      <div style={{ padding: '0 8px' }}>
        <Radio
          defaultIndex={0}
          options={tabs.map((t) => t.title)}
          onChange={setSelected}
        />
      </div>
      <div style={{ padding: 8 }}>{tabs[selected]?.content}</div>
    </>
  );
};
