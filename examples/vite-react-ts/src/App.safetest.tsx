import React from 'react';
import { render } from 'safetest/react';
import { describe, it, expect } from 'safetest/vitest';

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

  it('can use the bridge function', async () => {
    let count = 0;
    let forceNumber: (num: number) => void = () => {};
    const Counter = () => {
      const forceRender = React.useReducer(() => count, 0)[1];
      forceNumber = (n) => {
        count = n;
        forceRender();
      };
      return (
        <div>
          <button
            onClick={() => {
              count++;
              forceRender();
            }}
          >
            Count is {count}
          </button>
        </div>
      );
    };

    const { page, bridge } = await render(<Counter />);
    await expect(page.locator('text=Count is 0')).toBeVisible();
    await page.click('button');
    await expect(page.locator('text=Count is 1')).toBeVisible();
    await bridge(() => forceNumber(50));
    await expect(page.locator('text=Count is 50')).toBeVisible();
    await page.click('button');
    await expect(page.locator('text=Count is 51')).toBeVisible();
  });
});
