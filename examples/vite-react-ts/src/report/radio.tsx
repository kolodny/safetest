import React from 'react';
import { Hover } from './hover';

export type Props = {
  options: React.ReactNode[];
  onChange: (index: number) => void;
} & ({ index: number } | { defaultIndex?: number });

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
      <div className="radio" style={{ display: 'inline-flex' }}>
        {options.map((option, index) => (
          <Hover key={index}>
            {(hover) => (
              <div
                key={index}
                style={{
                  background: hover
                    ? '#ddd'
                    : index === selectedValue
                    ? '#eee'
                    : '#fff',
                  transition: 'background 0.2s ease',
                  borderRadius: 4,
                  paddingRight: 8,
                  marginRight: 4,
                  border: 'none',
                  padding: 8,
                  cursor: 'pointer',
                }}
              >
                <label style={{ cursor: 'pointer' }}>
                  <input
                    style={{ display: 'none' }}
                    type="radio"
                    value={index}
                    checked={index === selectedValue}
                    onChange={() => changeHandler(index)}
                  />
                  {option}
                </label>
              </div>
            )}
          </Hover>
        ))}
      </div>
    </>
  );
};
