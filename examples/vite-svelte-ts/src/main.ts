import './app.css';
import App from './App.svelte';
import { bootstrap } from 'safetest/svelte';

const target = document.getElementById('app')!;

const app = bootstrap({
  element: App,
  importGlob: import.meta.glob('./**/*.safetest.{j,t}s{,x}'),
  render: async (Element) => new Element({ target }),
});

export default app;
