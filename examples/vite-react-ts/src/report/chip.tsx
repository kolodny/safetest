import React from 'react';

export const Chip: React.FunctionComponent<{ label: string }> = ({ label }) => {
  return (
    <div
      style={{
        display: 'inline-block',
        padding: '2px 4px',
        marginRight: 8,
        border: '1px solid #ccc',
        borderRadius: 4,
        height: 16,
        fontSize: 12,
        lineHeight: '18px',
      }}
    >
      {label}
    </div>
  );
};
