import React from 'react';
import { ComponentsContext } from './report';

const borderColor = '#e2e2e2';
const backgroundColorOpen = '#f7f7f7';
const backgroundColorClosed = '#fafafa';

export const Accordion: React.FunctionComponent<
  React.PropsWithChildren<{
    summary: React.ReactNode;
    open?: boolean;
    defaultOpen?: boolean;
    onChange?: (open: boolean) => void;
  }>
> = ({ children, summary, open: propOpen, defaultOpen, onChange }) => {
  const { Expandable } = React.useContext(ComponentsContext);
  const [open, setOpen] = React.useState(defaultOpen ?? !!propOpen);

  React.useEffect(() => {
    if (propOpen !== undefined) setOpen(propOpen);
  }, [propOpen]);

  const background = open ? backgroundColorOpen : backgroundColorClosed;

  return (
    <div style={{ border: `1px solid #${borderColor}` }}>
      <div
        onClick={() => {
          setOpen(!open);
          onChange?.(!open);
        }}
        style={{ cursor: 'pointer', padding: 10, margin: 2, background }}
      >
        <span
          style={{
            marginRight: '0.5em',
            display: 'inline-block',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          <span style={{ userSelect: 'none' }}>❯</span>
        </span>
        {summary}
      </div>
      <Expandable expanded={open}>
        <div style={{ marginLeft: '1.5em', padding: 8 }}>{children}</div>
      </Expandable>
    </div>
  );
};
