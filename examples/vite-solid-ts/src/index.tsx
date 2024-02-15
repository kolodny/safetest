import { render } from 'solid-js/web';
import { bootstrap } from 'safetest/solid';
// import * as Solid from 'solid-js';
// import { Bootstrap } from 'safetest/solid';

import { TodoList as App } from './todo-list';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?'
  );
}

bootstrap({
  element: () => <App />,
  importGlob: import.meta.glob('./**/*.safetest.{j,t}s{,x}'),
  render: (element) => render(element, root!),
});

// render(
//   () => (
//     <Bootstrap
//       Solid={Solid}
//       // loading={''}
//       importGlob={
//         import.meta.env.DEV && import.meta.glob('./**/*.safetest.{j,t}s{,x}')
//       }
//     >
//       <App />
//     </Bootstrap>
//   ),
//   root!
// );
