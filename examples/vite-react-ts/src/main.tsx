import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

import { bootstrap } from 'safetest/react';
import './index.css';

// console.log(321);

bootstrap({
  container: document.getElementById('root'),
  element: (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  ),
  importGlob: import.meta.glob('./**/*.safetest.{j,t}s{,x}'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render: (e, c) => ReactDOM.createRoot(c).render(e) as any,
});
