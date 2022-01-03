import React from 'react';
// import App from './App';
// import { describe, test, it, reactRender } from 'safetest';
import { describe, it, setTimeout as jestSetTimeout } from 'safetest/jest';
import { render as reactRender } from 'safetest/react';

jestSetTimeout(300000); // 5 minutes

const Thing = () => {
  const [state, setState] = React.useState(0);
  return <div onClick={() => setState(state + 1)}>State is {state}</div>;
};

describe('safetest tests', () => {
  it('BROWSER', async () => {
    const { page } = await reactRender(<Thing />);
    await page.click('div');
    await page.click('div');
    await page.click('div');
    expect(await page.evaluate(() => document.body.innerText)).toEqual(
      'State is 3'
    );
  });
  it('BROWSER', async () => {
    const { page } = await reactRender(<Thing />);
    await page.click('div');
    await page.click('div');
    await page.click('div');
    expect(await page.evaluate(() => document.body.innerText)).toEqual(
      'State is 3'
    );
  });
  it('BROWSER', async () => {
    const { page } = await reactRender(<Thing />);
    await page.click('div');
    await page.click('div');
    await page.click('div');
    expect(await page.evaluate(() => document.body.innerText)).toEqual(
      'State is 3'
    );
  });
  it('BROWSER', async () => {
    const { page } = await reactRender(<Thing />);
    await page.click('div');
    await page.click('div');
    await page.click('div');
    expect(await page.evaluate(() => document.body.innerText)).toEqual(
      'State is 3'
    );
  });
  it('BROWSER', async () => {
    const { page } = await reactRender(<Thing />);
    await page.click('div');
    await page.click('div');
    await page.click('div');
    expect(await page.evaluate(() => document.body.innerText)).toEqual(
      'State is 3'
    );
  });
  it('BROWSER', async () => {
    const { page } = await reactRender(<Thing />);
    await page.click('div');
    await page.click('div');
    await page.click('div');
    expect(await page.evaluate(() => document.body.innerText)).toEqual(
      'State is 3'
    );
  });
});
