# Safetest: Next Generation UI Testing Library

Safetest is a powerful UI testing library that combines Playwright, Jest, and React for a powerful end-to-end testing solution for applications and component testing. With Safetest, you can easily test the functionality and appearance of your application, ensuring that it works as expected and looks great on all devices.

Safetest provides a seamless testing experience by integrating with your existing development environment and offering a familiar, easy-to-use API for creating and managing tests.

## Features

- **Playwright Integration**: Run your tests on real browsers using Playwright. Safetest automatically handles browser management, so you can focus on what's important: writing tests.
  - Screenshot diffing via [jest-image-snapshot](https://github.com/americanexpress/jest-image-snapshot)
  - [Video recording](https://playwright.dev/docs/videos)
  - [Trace Viewer](https://playwright.dev/docs/trace-viewer)
  - [Full control over network layer](https://playwright.dev/docs/network#handle-requests)
- **Jest Integration**: Safetest leverages the Jest test runner. Write your tests using familiar Jest syntax and benefit from its powerful assertion library and mocking capabilities.
- **Vitest Integration**: Safetest can also use the Vitest runner. If you have a `vite` project you'll probably want to use this
- **React Support**: Safetest is designed with React applications in mind, so you can easily test your components and their interactions. This allows for focused testing of individual components, for Example testing that `<Header admin={true}>` behaves as expected.
- **Easy Setup**: Safetest is easy to set up and configure, so you can start writing tests in no time. No need to worry about complex configurations or dependencies; Safetest takes care of it all.
- **Easy Auth Hooks**: If your app is testing an authenticated application, Safetest provides hooks to handles the auth flow in a reusable method across all your tests.

## Getting Started

To get started with Safetest, follow these steps:

1. ### Install Safetest as a dependency in your project:

   ```bash
   npm install --save-dev safetest
   ```

   Or, if you're using Yarn:

   ```bash
   yarn add --dev safetest
   ```

The following instructions assume you're using `create-react-app`. Look in the examples folder for other setup configurations.

1. ### Add run command to `package.json` scripts:

   Add the following line to your `package.json` scripts:

   ```json
   {
     "scripts": {
       "safetest": "react-scripts --inspect test --runInBand --url=${TARGET_URL:-http://localhost:3000} --testMatch '**/*.safetest.{j,t}s{,x}' --setupFilesAfterEnv ./setup-safetest.tsx",
       "safetest:ci": "npm run safetest -- --watchAll=false --ci=1 --docker=1 --url=DEPLOYED_URL --json --outputFile=results.json",
       "safetest:regenerate-screenshots": "npm run safetest -- --watchAll=false --docker=1 --update-snapshot",
       "process:ci": "node -e 'require(\"safetest/process-action\")' -- --results=results.json --artifacts=artifacts --url=DEPLOYED_URL --build-url=."
     }
   }
   ```

   The preceding script runs the default runner (`react-scripts`) with a couple of flags and environment variables to make sure Safetest is loaded and run with jest, and that all `.safetest.tsx` test files are tested. You may need to adjust based on your specific setup for example using `craco` or `react-app-rewired` instead.

1. ### Add `setup-safetest.tsx` file:

   Create a file called `setup-safetest.tsx` in the root of your project and add the following code:

   ```ts
   import { setup } from 'safetest/jest-setup';

   setup({
     api: { beforeAll, setTimeout: (ms) => jest.setTimeout(ms) },
     options: { ciOptions: { usingArtifactsDir: 'artifacts' } },
   });
   ```

   This file is the minimal setup required to get Safetest working with your project. It's also where you can configure Safetest by specifying options to the `setup` function.

1. ### Bootstrapping your application

   In order for Safetest to be able to work with your application, you need to bootstrap it to load. This is done by modifying your application's entry point (usually `src/index.tsx`) as follows:

   ```diff
    import ReactDOM from "react-dom";
   +import { bootstrap } from 'safetest/react';
    import App from "./App";

   -ReactDOM.render(
   -  <App />,
   -  document.getElementById("app")
   -);
   +const container = document.getElementById("app");
   +const element = <App />;

   +const isProd = process.env.NODE_ENV === 'production';

   +bootstrap({
   +  container,
   +  element,
   +  render: (e, c) => ReactDOM.render(e, c) as any,
   +  import: async (s) =>
   +    // Build time check so we don't bundle our tests in prod. This is optional since it'll only bundle the tests as a lazy webpack module and not part of the main bundle.
   +    !isProd &&
   +    import(`${s.replace(/.*src/, '.').replace(/\.safetest$/, '')}.safetest`),
   +});
   ```

   The above magic import makes use of [Webpack Dynamic Imports](https://webpack.js.org/guides/code-splitting/#dynamic-imports) to bundle the `.safetest.tsx` files in your project separately. This allows you to write tests for your application in the same project as your application, without having to worry about setting up a separate test project or about the tests being loaded when loading your application in a non test context. The `isProd` check is only really needed if you don't want to leak your tests into production, but it's not strictly necessary.

1. ### Creating your first tests

   Now that you've set up Safetest, you can start writing your first tests. Create a file called `src/App.safetest.tsx` and add the following code:

   ```ts
   import { describe, it, expect } from 'safetest/jest';
   import { render } from 'safetest/react';

   import { Header } from './Header';

   // Whole App testing
   describe('App', () => {
     it('renders without crashing', async () => {
       const { page } = await render();
       await expect(page.locator('text=Welcome to The App'))
         .toContain('Welcome to React')
         .toBeVisible();
     });
   });

   // Component testing
   describe('Header', () => {
     it('renders without crashing', async () => {
       const { page } = await render(<Header />);
       await expect(page.locator('text=Logout')).toBeVisible();
       expect(await page.screenshot()).toMatchImageSnapshot();
     });
   });
   ```

1. ### Running your tests

   Now that you've created your first tests, you can run it using the following command:

   ```bash
   npm run safetest
   ```

   Additionally, you can pass it a a number of custom command line arguments. The options are `--headed=1`, `--url=...`, `--docker=1`, and `--ci=1`, for example to see the browser window while the tests are running:

   ```bash
   npm run safetest -- --headed=1
   ```

1. ### Integrating into CI

   Assuming part of your CI pipeline deploys the app to some url `https://my-app.com` you can add a step to the CI pipeline by either adding a script to manually invoking the following:

   ```bash
   npm run safetest -- --watchAll=false --ci=1 --docker=1 --url=https://my-app.com --json --outputFile=results.json
   ```

   Safetest also provides a processor which you can also add as a script or manually invoke:

   ```bash
   node -e 'require("safetest/process-action")' -- --results=results.json --artifacts=artifacts --url=https://my-app.com --build-url=.
   ```

Now when you create a PR you'll get a bunch of CI goodies like a detailed report of what pass/failed as well as links to:

- Trace viewer of each test
- Video of test execution
- Ability to open tested component in the deployed environment

[See here](https://safetest-kolodnygithub-gmailcom.vercel.app/) for a the reports (and apps) of each the example projects.

## Writing Tests

Since Safetest is bootstrapped within the application, essentially every test is a component test. If you don't specify a component in `render` then it will just render the default component (for example `<App />` in the getting started section). `render` also allows passing a function which will be called with the default component as an argument, this is useful for overriding props or wrapping the component in a provider.

If you just want to test your application as a whole, you can use this syntax

```ts
const { page } = await render();
```

and just pretend everything after that line is a [`@playwright/test` test](https://playwright.dev/docs/writing-tests).

The following section showcases a couple of common testing scenarios:

### Testing a component

```ts
import { describe, it, expect } from 'safetest/jest';
import { render } from 'safetest/react';
import { Header } from './Header';

describe('Header', () => {
  it('can render a regular header', async () => {
    const { page } = await render(<Header />);
    await expect(page.locator('text=Logout')).toBeVisible();
    await expect(page.locator('text=admin')).not.toBeVisible();
    expect(await page.screenshot()).toMatchImageSnapshot();
  });

  it('can render an admin header', async () => {
    const { page } = await render(<Header admin={true} />);
    await expect(page.locator('text=Logout')).toBeVisible();
    await expect(page.locator('text=admin')).toBeVisible();
    expect(await page.screenshot()).toMatchImageSnapshot();
  });
});
```

#### Snapshot testing

Safetest comes out of the box with snapshot testing enabled via [`jest-image-snapshot`](https://github.com/americanexpress/jest-image-snapshot). A simple example of this is shown above. You can also mask over or remove DOM elements before the snapshot to have deterministic tests. A common scenario for this is to remove a date field from the UI before taking a snapshot since, since the value will be different every time and cause the screenshots not to match.

```ts
import { describe, it, expect } from 'safetest/jest';
import { render } from 'safetest/react';

describe('Snapshot', () => {
  it('works with date fields', async () => {
    const { page } = await render();
    await page.evaluate(() => document.querySelector('.header-date')?.remove());
    expect(await page.screenshot()).toMatchImageSnapshot();
  });
});
```

There is also a `mask` option you can pass to `page.screenshot({ mask: ... })`, however that only covers over the element, if the elements width changes over tests, the snapshot diffs will still fail.

#### Deterministic snapshots

Due to hardware and platform differences between dev machines and CI environments, there will be slight rendering differences between snapshots generated locally and in CI. To solve this problem and to ensure that a consistent and reproducible test setup is used, Safetest can run your tests in a docker container. This should be used in CI by default (via the `safetest:ci` script). To run your tests in docker locally or to generate updated snapshots which will match CI, you can run:  
`npm run safetest -- --docker=1` and `yarn safetest:regenerate-screenshots` respectively.

Note that you can also run this on "headed" mode, which will open a browser window connected to the debugPort within the docker container as show below:

#### Mocks and spies

Safetest also has the ability to provide mocks and spies to component props which you can assert against in your tests. This is useful for testing that components behave as you'd expect.

```ts
import { describe, it, expect, browserMock } from 'safetest/jest';
import { render } from 'safetest/react';
import { Header } from './Header';

describe('Header', () => {
  /* ... */

  it('calls the passed logout handler when clicked', async () => {
    const spy = browserMock.fn();
    const { page } = await render(<Header handleLogout={spy} />);
    await page.locator('text=Logout').click();
    expect(await spy).toHaveBeenCalled();
  });
});
```

#### Communicating between node and the browser.

In order to make Safetest work, the test code is run in both node and the browser (see the How it works section for more details about this). What this means is that we have full control over both what happens in node as well as the browser as the test is running. This allows us to do some powerful communication between the two environments. One of these items is the ability to make assertions in node from the browser as seen above (the `await spy` was not a typo, it's also type safe so don't worry about forgetting it). `render` also returns a bridge function which we can use to coordinate some complex use cases. For example, here's how we'd test that retires work when editing some resource:

```ts
// SaveResource.tsx
export const Resource: React.FC<{ resourceId: string }> = ({ resourceId }) => {
  const resource = useResource(resourceId);
};
```

TODO: FINISH this section

### Providers and Contexts

An issue that `React Testing Library` and component testing libraries need to contend with is rewrapping the component in required providers and contexts. This is due to `react-query`, `react-redux`, `react-router`, etc. all requiring a provider to be present in the tree. However since Safetest is bootstrapped with the application, we can just shuffle around some code to make this work for all use cases. All that's required is to move the Providers/Contexts to a separate file (for example `src/Providers.tsx`) and use it when bootstrapping the application:

#### `src/Provider.tsx`

```ts
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ApolloClient, ApolloProvider } from '@apollo/client';

// Create provider clients.
const apolloClient = new ApolloClient({});
const queryClient = new QueryClient({});

export const Provider: React.FC = ({ children }) => (
  <QueryClientProvider client={new QueryClient()}>
    <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
  </QueryClientProvider>
);
```

#### `src/index.tsx`

```ts
import { bootstrap } from 'safetest/react';
import { Provider } from './Provider';
bootstrap({
  container,
  element,
  render: (e, c) => ReactDOM.render(<Provider>{e}</Provider>, c) as any,
  import: async (s: string) =>
    // Build time check so we don't bundle our tests in prod where Replicant can't run them.
    !isProd &&
    import(`${s.replace(/.*src/, '.').replace(/\.safetest$/, '')}.safetest`),
});
```

Now you never need to think again about providers and contexts, just use `render` as you normally would.

## Debugging and Troubleshooting

Safetest takes advantage of playwright and jest to provide a lot of debugging and troubleshooting tools. Here are some of the most useful ones. The script copied in the package.json file will open a debug port that you can connect to with the node inspector. You can just add a `debugger` statement in your test and the node-inspector will just catch it. Alternately to can add a `launch.json` file with [**these run properties**](TODO) and have vscode auto-attach to the process.

The `render` also returns a `pause` method that will pause the execution of the page and allow you to inspect the page in the browser and to continue to use the playwright `page` object. See [this video for a demo](TODO).

## How Safetest works

TODO:
