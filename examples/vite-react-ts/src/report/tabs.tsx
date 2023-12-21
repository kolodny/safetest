import React from 'react';

export interface Tab {
  title: React.ReactNode;
  content: React.ReactNode;
}

export const Tabs: React.FunctionComponent<{ tabs: Tab[] }> = ({ tabs }) => {
  const [selected, setSelected] = React.useState(0);
  return (
    <>
      <div className="tabs">
        {tabs.map((tab, index) => (
          <button
            style={{
              transition: 'background 0.2s ease',
              background: index === selected ? '#eee' : '#fff',
              border: 'none',
              padding: 8,
              cursor: 'pointer',
              outline: 'none',
            }}
            key={index}
            className={index === selected ? 'selected' : ''}
            onClick={() => setSelected(index)}
          >
            {tab.title}
          </button>
        ))}
      </div>
      <div style={{ padding: 8 }}>{tabs[selected]?.content}</div>
    </>
  );
};
