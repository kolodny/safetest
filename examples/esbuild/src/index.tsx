import React from 'react';
import { bootstrap } from 'safetest/react';

import { importMap } from './import-map';

import { App } from './app';

const element = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
const container = document.getElementById('root');
// console.log(process.env.NODE_ENV);
// if (process.env.NODE_ENV !== 'production') {
bootstrap({
  import: (s) => importMap[s](),
  element,
  container,
});
// } else {
//   ReactDOM.render(element, container);
// }
