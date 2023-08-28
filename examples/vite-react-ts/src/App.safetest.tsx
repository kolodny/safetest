import React from 'react';
import { render } from 'safetest/react';
import { makeVitest } from 'safetest/vitest';

const { describe, it, expect } = await makeVitest(() => import('vitest'));

describe('Main', () => {
  it('loads a simple div', async () => {
    const { page } = await render(() => <>Testing123</>);
    expect(await page.screenshot()).toMatchImageSnapshot();
  });

  it('Has a landing page', async () => {
    const { page } = await render();
    expect(page).toBeTruthy();
  });

  it('can do many interactions fast', async () => {
    const Counter = () => {
      const [count, setCount] = React.useState(0);
      return (
        <div>
          <button onClick={() => setCount(count + 1)}>Count is {count}</button>
        </div>
      );
    };
    const { page } = await render(<Counter />);
    await expect(page.locator('text=Count is 0')).toBeVisible();
    for (let i = 1; i <= 500; i++) {
      await page.locator('button:not(a)').click();
      await expect(page.locator(`text=Count is ${i}`)).toBeVisible();
    }
  });

  for (let i = 0; i < 50; i++) {
    it(`stress test ${i} run`, async () => {
      const Counter = () => {
        const [count, setCount] = React.useState(0);
        return (
          <div>
            Viewing test #{i}
            <button onClick={() => setCount(count + 1)}>
              Count is {count}
            </button>
          </div>
        );
      };
      const { page } = await render(<Counter />);
      await expect(page.locator('text=Count is 0')).toBeVisible();
      await page.locator('button:not(a)').click();
      await page.locator('button:not(b)').click();
      await page.locator('button:not(c)').click();
      await expect(page.locator('text=Count is 3')).toBeVisible();
      await page.locator('button:not(d)').click();
      await page.locator('button:not(e)').click();
      await page.locator('button:not(f)').click();
      await expect(page.locator('text=Count is 6')).toBeVisible();
    });
  }
});
