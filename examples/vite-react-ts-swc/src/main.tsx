import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { bootstrap } from 'safetest/react';
import './index.css';

bootstrap({
  container: document.getElementById('root'),
  element: (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  ),
  importGlob: import.meta.glob('./**/*.safetest.{j,t}s{,x}'),
  render: (e, c) => ReactDOM.createRoot(c).render(e),
});
