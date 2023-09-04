import { h } from 'vue';
// @ts-ignore
import Counter from './components/Counter.vue';
import { render } from 'safetest/vue';
import { makeVitest } from 'safetest/vitest';

const { describe, it, expect } = await makeVitest(() => import('vitest'));

describe('Example', () => {
  it('works with jsx syntax', async () => {
    const { page } = await render(<Counter startingCount={3} />);
    await expect(page.locator('text=Count is 3')).toBeVisible();
  });

  it('works with regular mounting syntax', async () => {
    const { page } = await render(Counter, { props: { startingCount: 2 } });
    await expect(page.locator('text=Count is 2')).toBeVisible();
  });

  it('can render the entire page', async () => {
    const { page } = await render();
    await expect(
      page.locator('text="Click on the Vite and Vue logos to learn more"')
    ).toBeVisible();
  });
});
