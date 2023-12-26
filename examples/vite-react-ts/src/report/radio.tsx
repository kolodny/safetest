import React from 'react';

export type Props = {
  options: React.ReactNode[];
  onChange: (index: number) => void;
} & ({ index: number } | { defaultIndex?: number });

const css = String.raw;

export const Radio: React.FunctionComponent<Props> = (props) => {
  const { onChange, options } = props;
  const defaultIndex = 'defaultIndex' in props ? props.defaultIndex : undefined;
  const controls = 'index' in props ? props : undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultIndex);
  const changeHandler = (index: number) => {
    if (!controls) setUncontrolled(index);
    onChange(index);
  };
  const selectedValue = controls ? controls.index : uncontrolled;
  return (
    <>
      <div className="radio" style={{ display: 'flex' }}>
        <style>{css`
          @scope {
            :scope label:hover {
              background: #c0c0c0 !important;
            }
          }
        `}</style>
        {options.map((option, index) => (
          <label
            key={index}
            style={{
              background: index === selectedValue ? '#eee' : '#fff',
              transition: 'background 0.2s ease',
              borderRadius: 4,
              border: 'none',
              padding: 8,
              cursor: 'pointer',
            }}
          >
            <input
              style={{ display: 'none' }}
              type="radio"
              value={index}
              checked={index === selectedValue}
              onChange={() => changeHandler(index)}
            />
            {option}
          </label>
        ))}
      </div>
    </>
  );
};
