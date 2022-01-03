import { render } from 'safetest/svelte';
import * as safeJest from 'safetest/jest';
import Counter from './lib/Thing.svelte';
const { describe, it } = safeJest;

safeJest.setTimeout(300000); // 5 minutes

describe('safetest tests', () => {
  it('BROWSER', async () => {
    const { page } = await render(Counter);
    await page.click('div');
    await page.click('div');
    await page.click('div');
    expect(await page.evaluate(() => document.body.innerText)).toEqual(
      'State is 3'
    );
  });
});
