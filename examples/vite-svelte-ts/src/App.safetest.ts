import { describe, it, expect } from 'safetest/vitest';
import { render } from 'safetest/svelte';
import Counter from './lib/Counter.svelte';

describe('example', () => {
  it('can test an app', async () => {
    const { page } = await render();
    await page.locator('button').click();
    await expect(page.locator(`text=count is 124`)).toBeVisible();
  });

  it('works', async () => {
    const { page } = await render(Counter);
    await page.locator('button').click();
    await page.locator('button').click();
    await page.locator('button').click();
    await expect(page.locator(`text=count is 3`)).toBeVisible();
  });
});
