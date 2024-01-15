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
      <div className='radio'>
        {options.map((option, index) => (
          <Hover key={index} style={{ marginRight: 4 }}>
            {(hover) => (
              <label
                style={{
                  cursor: 'pointer',
                  display: 'inline-flex',
                  // padding: 8,
                  background: hover
                    ? '#ddd'
                    : index === selectedValue
                    ? '#eee'
                    : '#fff',
                  transition: 'background 0.2s ease',
                  borderRadius: 4,
                  border: 'none',
                }}
              >
                <input
                  style={{ display: 'none' }}
                  type='radio'
                  value={index}
                  checked={index === selectedValue}
                  onChange={() => changeHandler(index)}
                />
                {option}
              </label>
            )}
          </Hover>
        ))}
      </div>
    </>
  );
};
