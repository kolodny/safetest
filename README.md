# Safetest

## TODO/Help wanted:

This library needs a lot of documentation around how it works, how to use it, and what it's trying to accomplish. For now I'm releasing as is and asking for help on docs and better integration into non CRA project setups. The idea for this library was originally meant to accompany CRA however I quickly realized it can easily work with almost any other setup as well, however I don't have experience or expertise in idiomatic Vue usage or other frameworks. Also Angular usage is very rough around the edges, I'm hoping someone can help me with that.

Safetest is a testing framework to run any level of tests in a browser environment.
Safetest aims to do this in an unobtrusive and agnostic way as possible.

Take a look at the examples folder to see how to use Safetest in a variety of projects.

Check out how-it-works.md for more information on how Safetest works internally.

The main points of Safetest are:

- Give you confidence in your tests work in a real browser environment
- Test your entire application as a unit
- Test specific components in your application (Component Testing)
- Expose a Playwright `page` instance API to interact with your application
- Works with Jest, Vitest, and Mocha
- Works with React, Vue, Svelte, and Angular
- TODO:...

Here is a sample of a how one would use Safetest in a CRA project:

```ts
import { describe, it } from 'safetest/jest';
import { render } from 'safetest/react';

import { Header } from './components/header';

describe('Header', () => {
  it('renders a user', async () => {
    const fakeUser: User = { name: 'Alice' /* ... */ };
    const { page } = await render(<Header user={fakeUser} />);
    await expect(await page.locator('text=Alice').exists()).toBe(true);
  });
});
```

Using Safetest requires a bootstrapping in the application code and a render function in the test code. These two pieces work together to create a test environment that completely generalized to the framework you are using. You can mix and match React with esbuild, Angular with Webpack, or Svelte with Vite. Below are the instructions for bootstrapping each framework.

The core mechanism that makes Safetest work revolves around bootstrapping your application with some code such that you can still do development on it while also allowing the tests to mount different components to make test assertions.

As an example, here's how one would bootstrap a React application:

```tsx
import React from 'react';
import { render } from 'react-dom';
import { bootstrap } from 'safetest/react';

import App from './App';

// Old code:
// render(<App />, document.getElementById('root'));

// New code:
bootstrap({
  import: (s) =>
    import(`${s.replace(/.*src/, '.').replace(/\.safetest$/, '')}.safetest`),
  element: <App />,
  container: document.getElementById('root'),
});
```

This way when the application loads, Safetest can check if it's actievly running a test and will switch to mount the component under test in the container element. The way Safetest is able to load test files is by the `import` mechanism that's passed into the bootsstrap function, this allows us to not need to itergrate into the build tools to load the test files magically since most bundlers already know how to magically bundle globs. In the example above, Webpack (which create-react-app uses) will automatically bundle all files that end with `.safetest` for us. This bootstrapping is all that's needed to make Safetest work with basically every FrontEnd framework.

Here is the full list of supported frameworks and the accompanying code to bootstrap them:

<details>
  <summary>React</summary>

```tsx
import { bootstrap } from 'safetest/react';

import App from './App';

bootstrap({
  import: (s) =>
    import(`${s.replace(/.*src/, '.').replace(/\.safetest$/, '')}.safetest`),
  element: <App />,
  container: document.getElementById('root'),
});
```

</details>

<details>
  <summary>Vue 3</summary>

Most Vue apps use vite which has an `import.meta.glob` feature that allows you to import files that match a glob pattern. Usage differs than the CRA example above but is similar.

```tsx
import { bootstrap } from 'safetest/vue3';

import App from './App';

// Old code:
// createApp(App).mount('#app')

// New code:
bootstrap({
  element: App,
  container: '#app',
  import: async (moduleName) =>
    Object.entries(import.meta.glob('./**/*.safetest.[t,j]s{,x}')).find(
      ([key]) => key.startsWith(moduleName.replace(/.*src/, '.'))
    )?.[1](),
});
```

</details>

<details>
  <summary>Svelte</summary>

```tsx
import App from './App.svelte';
import { bootstrap } from 'safetest/svelte';

const app = bootstrap({
  element: App,
  options: {
    target: document.getElementById('app'),
  },
  import: async (moduleName) =>
    Object.entries(import.meta.glob('./*_/_.safetest.[t,j]s{,x}')).find(
      ([key]) => key.startsWith(moduleName.replace(/.\*src/, '.'))
    )?.[1](),
});
```

</details>

<details>
  <summary>Angular</summary>

## Help wanted:

Angular is tricky to get to work since the bundling @angular/core or any other browser based library fails in a node context. For this reason we need to do all the import using dynamic import() syntax when creating a testbed.

```tsx
import App from './App.svelte';
import { bootstrap } from 'safetest/svelte';

const app = bootstrap({
  element: App,
  options: {
    target: document.getElementById('app'),
  },
  import: async (moduleName) =>
    Object.entries(import.meta.glob('./*_/_.safetest.[t,j]s{,x}')).find(
      ([key]) => key.startsWith(moduleName.replace(/.\*src/, '.'))
    )?.[1](),
});
```

</details>

---

After bootstrapping you should check that your application still works in a regular dev environment. The other piece of getting Safetest to work is to write the tests which can vary based on the framework you are using.

<details>
  <summary>React</summary>

React is probably the simplist of the frameworks to get Safetest to work:

```tsx
import { describe, it } from 'safetest/jest';
import { render } from 'safetest/react';

describe('Header', () => {
  it('renders a user', async () => {
    const fakeUser: User = { name: 'Alice' /* ... */ };
    const { page } = await render(<Header user={fakeUser} />);
    await expect(await page.locator('text=Alice').exists()).toBe(true);
  });
});
```

</details>

<details>
  <summary>Vue 3</summary>

```tsx
import { describe, it } from 'safetest/jest';
import { render } from 'safetest/vue3';
```

---

### How is this different than [Cypress Component Testing](https://docs.cypress.io/guides/component-testing/introduction)?

While on the surface Safetest and Cypress Component Testing are very similar, there are fundamental differences between them and each serves a different purpose.

Cypress Component Testing is meant to be a storybook + test runner which is meant to be used alongside active development in an almost red, green, refactor cycle.

Safetest, on the other hand, is a very low level testing framework which can be used to replace all of your tests, and can run for development or deployed environments.

Because of this lack of strong opinions within Safetest, adding a new FrontEnd library to support or a specific test running is a trivial task. Since Safetest isn't integrated into the build system, it can also work with basically any bundler or build system that exists. The examples folder has usages with Vite, Webpack, esbuild, and Ng-compiler - and more can be added with the only major hurdle being the need to figure out how to make the import property in the bootstrap call work.

Examples folder also contains usages in React, Vue, Svelte, and Angular.

The examples folder showcases the ease of integrating Safetest into your own projects.

- Works in a wide variety of FrontEnd libraries/frameworks
  - React
  - Vue
  - Svelte
  - Angular
- Hypothetically works with any bundler/build system
  - Vite
  - Webpack
  - Esbuild
  - Ng-Compiler
- Works with major library frameworks
  - Jest
  - Mocha
  - Vitest

Some of the examples above were integrated on the order of minutes (not hours) and adding new frameworks, bundlers, and test runners is a trivial task.

One way to highlight the difference is that Safetest can run a test which requires two different browser tabs to be open at the same time by just calling `render` twice in a single test block. Cypress Component Testing can only run a test in one browser tab at a time.
As you can see Safetest is a very low level testing framework meant to work within your existing dev (or deployed) environment.
