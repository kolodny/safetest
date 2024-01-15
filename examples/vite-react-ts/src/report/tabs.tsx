import React from 'react';
import { ComponentsContext } from './report';

export interface Tab {
  title: React.ReactNode;
  content: React.ReactNode;
}

export const Tabs: React.FunctionComponent<{ tabs: Tab[] }> = ({ tabs }) => {
  const [selected, setSelected] = React.useState(0);
  const { Radio } = React.useContext(ComponentsContext);
  return (
    <>
      <div>
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
