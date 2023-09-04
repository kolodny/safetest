import { h } from 'vue';
import Counter from './components/Counter.vue';
import { render } from 'safetest/vue';
import { describe, it, expect } from 'safetest/vitest';

describe('Example', () => {
  it('works with jsx syntax', async () => {
    const { page } = await render(<Counter startingCount={3} />);
    await expect(page.locator('text=Count is 3')).toBeVisible();
  });

  it('works with regular mounting syntax', async () => {
    const { page } = await render(Counter, { props: { startingCount: 2 } });
    await expect(page.locator('text=Count is 2')).toBeVisible();
  });

  it('can do many interactions fast', async () => {
    const { page } = await render(<Counter startingCount={0} />);
    await expect(page.locator('text=Count is 0')).toBeVisible();
    for (let i = 1; i <= 500; i++) {
      await page.locator('button:not(a)').click();
      await expect(page.locator(`text=Count is ${i}`)).toBeVisible();
    }
  });

  for (let i = 0; i < 50; i++) {
    it(`stress test ${i} run`, async () => {
      const { page } = await render(<Counter startingCount={0} />);
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

  it('can render the entire page', async () => {
    const { page } = await render();
    await expect(
      page.locator('text="Click on the Vite and Vue logos to learn more"')
    ).toBeVisible();
  });
});
