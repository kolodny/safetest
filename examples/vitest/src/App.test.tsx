import { render } from 'safetest/react';
import { makeVitest } from 'safetest/vitest';
import * as React from 'react';

const { describe, it, expect } = await makeVitest(() => ({
  vitest: import(/* @vite-ignore */ `${'vitest'}`),
  __filename,
}));

const Thing = () => {
  const [state, setState] = React.useState(0);
  return <div onClick={() => setState(state + 1)}>State is {state}</div>;
};

describe('safetest tests', () => {
  it('BROWSER', async () => {
    const { page } = await render(<Thing />);
    await page.click('div');
    await page.click('div');
    await page.click('div');
    expect(await page.evaluate(() => document.body.innerText)).toEqual(
      'State is 3'
    );
  });
  it('BROWSER', async () => {
    const { page } = await render(<Thing />);
    await page.click('div');
    await page.click('div');
    await page.click('div');
    expect(await page.evaluate(() => document.body.innerText)).toEqual(
      'State is 3'
    );
  });
  it('BROWSER', async () => {
    const { page } = await render(<Thing />);
    await page.click('div');
    await page.click('div');
    await page.click('div');
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(await page.evaluate(() => document.body.innerText)).toEqual(
      'State is 3'
    );
  });
  it('BROWSER', async () => {
    const { page } = await render(<Thing />);
    await page.click('div');
    await page.click('div');
    await page.click('div');
    expect(await page.evaluate(() => document.body.innerText)).toEqual(
      'State is 3'
    );
  });
  it('BROWSER', async () => {
    const { page } = await render(<Thing />);
    await page.click('div');
    await page.click('div');
    await page.click('div');
    expect(await page.evaluate(() => document.body.innerText)).toEqual(
      'State is 3'
    );
  });
  it('BROWSER', async () => {
    const { page } = await render(<Thing />);
    await page.click('div');
    await page.click('div');
    await page.click('div');
    expect(await page.evaluate(() => document.body.innerText)).toEqual(
      'State is 3'
    );
  });
});
