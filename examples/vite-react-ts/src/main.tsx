import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

import { bootstrap } from 'safetest/react';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);

bootstrap({
  element: (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  ),
  importGlob: import.meta.glob('./**/*.safetest.{j,t}s{,x}'),
  render: (element) => root.render(element),
});
