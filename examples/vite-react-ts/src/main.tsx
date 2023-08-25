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
  import: async (moduleName: string) =>
    // Note we're forced to use .test.tsx since vitest won't work with .safetest.tsx files
    await Object.entries(import.meta.glob('./**/*.safetest.{j,t}s{,x}')).find(
      ([key]) => key.startsWith(moduleName.replace(/.*src/, '.'))
    )?.[1](),
  render: (e, c) => ReactDOM.createRoot(c).render(e) as any,
});
