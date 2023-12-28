import { createApp } from 'vue';
import { bootstrap } from 'safetest/vue';

import './style.css';

import App from './App.vue';

bootstrap({
  element: App,
  container: '#app',
  importGlob: import.meta.glob('./**/*.safetest.{j,t}s{,x}'),
  render: async (element, props) => createApp(element, props).mount('#app'),
});
