import { createApp } from 'vue';
import { bootstrap } from 'safetest/vue';

import './style.css';

import App from './App.vue';

// createApp(App).mount('#app');

bootstrap({
  element: App,
  container: '#app',
  importGlob: import.meta.glob('./**/*.safetest.{j,t}s{,x}'),
  render: async (element) => createApp(element).mount('#app'),
});
