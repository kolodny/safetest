// import { createApp } from 'vue';
import { bootstrap } from 'safetest/vue';

import './style.css';

// @ts-ignore
import App from './App.vue';

// createApp(App).mount('#app');

bootstrap({
  element: App,
  container: '#app',
  import: async (moduleName) =>
    Object.entries(import.meta.glob('./**/*.safetest.[t,j]s{,x}')).find(
      ([key]) => key.startsWith(moduleName.replace(/.*src/, '.'))
    )![1](),
});
