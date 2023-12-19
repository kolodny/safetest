import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

import { bootstrap } from 'safetest/react';
import './index.css';

const container = document.getElementById('root')!;

bootstrap({
  container,
  element: (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  ),
  importGlob: import.meta.glob('./**/*.safetest.{j,t}s{,x}'),
  render: (element) => ReactDOM.createRoot(container).render(element),
});
