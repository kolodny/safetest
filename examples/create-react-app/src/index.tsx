import React from 'react';
import { render } from 'react-dom';
import { bootstrap } from 'safetest/react';

import './index.css';
import App from './App';

const element = <App />;
const container = document.getElementById('root');

if (process.env.NODE_ENV !== 'production') {
  bootstrap({
    import: (s) =>
      import(`${s.replace(/.*src/, '.').replace(/\.safetest$/, '')}.safetest`),
    element,
    container,
  });
} else {
  render(element, container);
}
