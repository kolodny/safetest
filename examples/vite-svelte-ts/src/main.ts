import './app.css';
import App from './App.svelte';
import { bootstrap } from 'safetest/svelte';

const app = bootstrap({
  element: App,
  options: {
    target: document.getElementById('app')!,
  },
  import: async (moduleName) =>
    Object.entries(import.meta.glob('./**/*.safetest.[t,j]s{,x}')).find(
      ([key]) => key.startsWith(moduleName.replace(/.*src/, '.'))
    )?.[1](),
});

export default app;
