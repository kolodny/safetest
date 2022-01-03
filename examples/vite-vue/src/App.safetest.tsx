import App from './App.vue';
import { h, reactive, defineComponent } from 'vue';

import { render } from 'safetest/vue3';
import { describe, it, setTimeout as setJestTimeout } from 'safetest/jest';

setJestTimeout(300000); // 5 minutes

const Thing = defineComponent({
  setup: () => reactive({ count: 0 }),
  render() {
    return h(
      'div',
      {
        onClick: () => this.count++,
      },
      ['State is ', this.count]
    );
  },
});

// Thing.renderTriggered

describe('safetest tests', () => {
  it('BROWSER', async () => {
    const { page } = await render(Thing);
    await page.click('div');
    await page.click('div');
    await page.click('div');
    expect(await page.evaluate(() => document.body.innerText)).toEqual(
      'State is 3'
    );
  });

  it('BROWSER2', async () => {
    const { page } = await render(App);
    await page.click('div');
    await page.click('div');
    await page.click('div');
    expect(await page.evaluate(() => document.body.innerText)).toContain(
      'Hello Vue 3'
    );
  });
});
