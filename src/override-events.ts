import { Page } from 'playwright';
import { state } from './state';
import { safeRequire } from './safe-require';

const console = safeRequire('console');

const mid =
  'paused, type `resume()` in the console to resume the test. Paused on:';

export const overrideEvents = (page: Page) => {
  const locator = page.locator('');
  const proto = Object.getPrototypeOf(locator);
  for (const evt of ['click', 'dblclick'] as const) {
    proto[evt] = async function (options: any) {
      if (state.pauseAtEveryStep) {
        const optionsStr = options ? JSON.stringify(options) : '';
        const selector = JSON.stringify(this._selector);
        const test = state.currentSuitePlusTest;
        const msg = `'${test}' ${mid} page.locator(${selector}).${evt}(${optionsStr})`;
        console.log(msg);
        await page.evaluate(({ msg }) => console.log(msg), { msg });
        await state.pause?.();
      }
      return this.dispatchEvent(evt, null, { strict: true, ...options });
    };
    page.constructor.prototype[evt] = async function (
      selector: any,
      options: any
    ) {
      if (state.pauseAtEveryStep) {
        const optionsStr = options ? `, ${JSON.stringify(options)}` : '';
        const selectorStr = JSON.stringify(selector);
        const test = state.currentSuitePlusTest;
        const msg = `'${test}' ${mid} page.${evt}(${selectorStr}${optionsStr})`;
        console.log(msg);
        await page.evaluate(({ msg }) => console.log(msg), { msg });
        await state.pause?.();
      }

      return this.dispatchEvent(selector, evt, undefined, {
        strict: true,
        ...options,
      });
    };
  }
};
