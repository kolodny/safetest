import { render } from 'safetest/react';
import { makeVitest } from 'safetest/vitest';

const { describe, it, expect } = await makeVitest(() => import('vitest'));

describe('Main', () => {
  it('loads a simple div', async () => {
    const { page } = await render(() => <>Testing123</>);
    expect(await page.screenshot()).toMatchImageSnapshot();
  });

  it('Has a landing page', async () => {
    const { page } = await render((app) => <>{app}</>);
    expect(page).toBeTruthy();
  });
});
