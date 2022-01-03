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
      // Note we're forced to use .test.tsx since vitest won't work with .safetest.tsx files
      Object.entries(import.meta.glob('./**/*.test.{j,t}s{,x}')).find(([key]) =>
        key.startsWith(moduleName.replace(/.*src/, '.'))
      )?.[1](),

    element,
    container,
  });
} else {
  render(element, container);
}
