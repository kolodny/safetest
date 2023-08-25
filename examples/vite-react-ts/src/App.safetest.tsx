import { render } from 'safetest/react';
// import { setOptions } from 'safetest';
import { makeVitest } from 'safetest/vitest';

const { describe, it, expect } = await makeVitest(() => ({
  vitest: import(/* @vite-ignore */ `${'vitest'}`),
  __filename,
}));

// setOptions({ url: 'http://localhost:5173/' });

describe('Main', () => {
  it('loads a simple div', async () => {
    debugger;
    const { page } = await render(() => <>Testing123</>, { headless: false });
    expect(page).toBeTruthy();
  });

  it('Has a landing page', async () => {
    debugger;
    const { page } = await render((app) => <>{app}</>, { headless: false });
    expect(page).toBeTruthy();
  });
});
