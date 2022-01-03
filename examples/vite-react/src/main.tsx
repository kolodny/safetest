import React from 'react';
import { render } from 'react-dom';
import './index.css';
import App from './App';
import { bootstrap } from 'safetest/react';

const element = <App />;

const container = document.getElementById('root');

if (process.env.NODE_ENV !== 'production') {
  bootstrap({
    import: async (moduleName) =>
      Object.entries(import.meta.glob('./**/*.safetest.{j,t}s{,x}')).find(
        ([key]) => key.startsWith(moduleName.replace(/.*src/, '.'))
      )?.[1](),
    element,
    container,
  });
} else {
  render(element, container);
}
