Safetest essentially runs in a nodejs and a browser environment. Here's the basic idea of what happens when running Safetest

1. The nodejs test runner (jest, mocha, vitest, etc) runs the tests. Since the `describe`, `it`, and `test` blocks are imported from Safetest, they also build up a tree of tests. What happens is that a test file like this:

```tsx
describe('a test', () => {
  it('works', () => {
    expect(1).toBe(1);
  });
  it('breaks', () => {
    expect(1).toBe(2);
  });
});
```

Will build up a map of tests like this:

```tsx
const map = {
  ['a test works']: () => {
    expect(1).toBe(1);
  },
  ['a test breaks']: () => {
    expect(1).toBe(2);
  },
};
```

When a call to render happens, Safetest will open a Playwright browser and navigate to the base url and wait for an exposed `safetestApi` to be called with `'READY'`.

On the flip side when a browser is opened to the application, the bootstrapping code will inspect if there is a test running. It does this by either calling the `safetestApi` function in the global scope with `'GET_INFO'`, or by checking some url parameters. If a test is running, it will execute the test file (via the `import` function in the bootstrapping code), this will also build up the same map in the browser. It will then execute the corresponding property in that map. When a call to render happens in the `test`/`it` block, it will mount the component in the root element. The bootstrapping code will then send a `'READY'` message to the `safetestApi` function and in the case of the browser the test block will never resolve so as not to have the next line of code like `page.click('div')` attempt to execute.

Back to node, once the `safetestApi('READY')` call is made it will the resolve the call to `render` with the `page` object. Now the user can make assertions
