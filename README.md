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
   import { setup } from 'safetest/setup';

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
       await expect(page.locator('text=Welcome to The App')).toBeVisible();
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

In order to make Safetest work, the test code is run in both node and the browser (see the How it works section for more details about this). What this means is that we have full control over both what happens in node as well as the browser as the test is running. This allows us to do some powerful communication between the two environments. One of these items is the ability to make assertions in node from the browser as seen above (the `await spy` was not a typo, it's also type safe so don't worry about forgetting it). `render` also returns a bridge function which we can use to coordinate some complex use cases. For example, here's how we'd test that a loader component can recover from an error:

```tsx
// MoreLoader.tsx
interface LoaderProps<T> {
  getData: (lastId?: string) => Promise<T[]>;
  renderItem: (t: T, index: number) => React.ReactNode;
}

// Pretend this is a real component
export const MoreLoader = <T>(props: LoaderProps<T>) => {
  /* ... */
};

describe('MoreLoader', () => {
  it('can recover from errors', async () => {
    let nextIndex = 0;
    let error = false;
    const { page, bridge } = render(
      <MoreLoader<number>
        getData={async () => {
          if (error) throw new Error('Error');
          return nextIndex++;
        }}
        renderItem={(d) => <>Number is {d}</>}
      />
    );
    await expect(page.locator('text=Number is 0')).toBeVisible();
    await page.locator('.load-more').click();
    await expect(page.locator('text=Number is 1')).toBeVisible();
    await bridge(() => nextIndex = 10)
    await page.locator('.load-more').click();
    await expect(page.locator('text=Number is 10')).toBeVisible();
    await bridge(() => error = true);
    await page.locator('.load-more').click();
    await expect(page.locator('text=Error loading item')).toBeVisible();
    await bridge(() => error = false);
    await page.locator('.load-more').click();
    await expect(page.locator('text=Number is 11')).toBeVisible();
  });
});
```

#### Overrides

Sometimes the `bridge` function doesn't cover all your use cases. For example if you want to test that a component can recover from an error, you'll need to be able to override some logic within the component to simulate an error. For this use case, Safetest provides the `createOverride` function. This function allows you to override any value within the component. For example let's pretend we have this existing component:

```tsx
// Records.tsx
export const Records = () => {
  const { records, loading, error } = useGetRecordsQuery();
  if (loading) return <Loader />;
  if (error) return <Error error={error} />;
  return <RecordList records={records} />;
};
```

We can now override the `useGetRecordsQuery` hook to simulate an error:

```diff
 // Records.tsx
+ const useGetRecordsQuery = createOverride(useGetRecordsQuery)

 export const Records = () => {
+  const useGetRecordQuery = UseGetRecordsQuery.useValue()
   const { records, loading, error } = useGetRecordsQuery();
   if (loading) return <Loader />;
   if (error) return <Error error={error} />;
   return <RecordList records={records} />;
 };
```

The test would look like this:

```tsx
describe('Records', () => {
  it('Has a loading state', async () => {
    const { page } = render(
      <UseGetRecordQuery.Override with={(old) => ({ ...old(), loading: true })}>
        <Records />
      </UseGetRecordQuery.Override>
    );
    await expect(await page.locator('text=Loading')).toBeVisible();
  });

  it('Has an error state', async () => {
    const { page } = render(
      <UseGetRecordQuery.Override
        with={(old) => ({ ...old(), error: new Error('Test Error') })}
      >
        <Records />
      </UseGetRecordQuery.Override>
    );
    await expect(await page.locator('text=Test Error')).toBeVisible();
  });

  it('Has a loaded state', async () => {
    const { page } = render(
      <UseGetRecordQuery.Override
        with={(old) => ({
          ...old(),
          loading: false,
          value: [{ name: 'Tester' }],
        })}
      >
        <Records />
      </UseGetRecordQuery.Override>
    );
    await expect(await page.locator('text=Tester')).toBeVisible();
  });
});
```

This isn't limited to overriding a hook or a service, we can override anything we want. For example we can override the `Date.now()` to get consistent time stamps in our tests. A powerful use case for this is when we have a component that combines 3 graphql calls, we can test what happens if only one of those call fails, etc.

// TODO: Flesh this section out some more since this is really where Safetest can do things that other testing libraries fundamentally can't.

With the tools above we can test pretty much any scenario we can think of. The motto of Safetest is to make any test possible, no matter how complex and involved the test is.

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

Safetest is a combination of a few different technologies glued together intelligently to leverage the best parts of each. The essential technologies used are

- A test runner (this can be Jest or Vitest, feel free to open a PR for other test runners)
- A browser automation library (`Playwright` is the default and only one used currently, this will be a bit harder to extend)
- A UI framework (`React` is the main example used in this Readme, but the examples folder has many more app types)

Take a look at the [examples](./examples/) folder to see different combinations of these technologies. Please feel free to open a PR with more examples.

When the runner first starts it will build a mapping of the test structure. For example suppose we have a test file `src/App.safetest.tsx` with the following contents:

```tsx
import { describe, it, expect } from 'safetest/jest';
import { render } from 'safetest/react';

import { Header } from './components/header';

describe('App', () => {
  it('renders the app', async () => {
    const { page } = await render();
    await expect(page.locator('text=Welcome to The App')).toBeVisible();
  });

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

Safetest will build a tree of the tests and their structure:

```tsx
{
  "App": {
    "renders the app": async () => { /* ... */ },
    "can render a regular header": async () => { /* ... */ },
    "can render an admin header": async () => { /* ... */ },
  }
}
```

The test runner also continues running so for example the `"renders the app"` test will run, it will hit the `render()` function, this will resolve once Safetest opens a browser and navigates to the page. Safetest controls the browser instance and will expose a "magic" function get info about the currently executing test `"App renders the app"`. There's also a magic function exposed that will be called when the browser page is "ready"

On the browser side of things, when the call to bootstrap is called the following happens:

- Safetest will check if there's a a "magic" function available that will give us information about the current executing test.
  - If there is no test info available Safetest will render the page as normal and the bootstrapping process is done.
- Safetest will now call the `import` function that was passed to bootstrap with the name of the test file.
- This will allow Safetest to build that same mapping in the browser.
- Safetest will now execute the `mapping["app renders the app]` function.
- Safetest will hit the `render` function. Safetest will now render this component on the page.
- Safetest will now call the magic exposed function to signal that the page is ready for testing.

  Back in node...

- The await `render(...)` call now resolves and we can continue with the test.

---

By existing in both node and the browser we gain some unique abilities. For example we can enable powerful two way communication between the two environments. This allows us to do things like assert that spies on the component side of things were called as expected. It also allows us to do things like pause the execution of the test and inspect the page in the browser. This is done by calling the `pause` function returned from `render`. This will pause the execution of the test and open a browser window with the page loaded. You can now inspect the page and continue to use the `page` object to interact with the page. This is useful for debugging and troubleshooting.

We can pass nodejs data to the browser and have the browser pass data back to assert on. For a silly example, we can have nodejs make an api call to some non CORs enabled service, or check for the existence of a file in a directory, have the browser so some processing with that data and then pass it back to nodejs. Here's a silly demonstration of this:

```tsx
it('passes data', async () => {
  const { page, bridge } = await render();
  const bridged = await bridge(
    { fromNode: !!require('os').platform() },
    (passed) => {
      return {
        ...passed,
        fromBrowser: !!document.location.href.length,
      };
    }
  );
  expect(bridged).toEqual({
    fromNode: true,
    fromBrowser: true,
  });
});
```