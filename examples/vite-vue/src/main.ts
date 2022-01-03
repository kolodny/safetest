import { createApp } from 'vue';
import { bootstrap } from 'safetest/vue3';
import App from './App.vue';

bootstrap({
  element: App,
  container: '#app',
  import: async (moduleName) =>
    Object.entries(import.meta.glob('./**/*.safetest.[t,j]s{,x}')).find(
      ([key]) => key.startsWith(moduleName.replace(/.*src/, '.'))
    )?.[1](),
});

// createApp(App).mount('#app')
