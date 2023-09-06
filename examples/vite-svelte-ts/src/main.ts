import './app.css';
import App from './App.svelte';
import { bootstrap } from 'safetest/svelte';

const app = bootstrap({
  element: App,
  options: {
    target: document.getElementById('app')!,
  },
  importGlob: import.meta.glob('./**/*.safetest.{j,t}s{,x}'),
});

export default app;
