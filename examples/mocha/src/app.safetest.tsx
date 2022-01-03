import React from 'react';
// import App from './App';
// import { describe, test, it, reactRender } from 'safetest';
import * as safeMocha from 'safetest/mocha';
import { render as reactRender } from 'safetest/react';
// import assert from 'assert';
const { describe, it } = safeMocha;

const assert = (a: unknown, b: unknown) => {
  if (a !== b) {
    throw new Error(`${a} !== ${b}`);
  }
};

const Thing = () => {
  const [state, setState] = React.useState(0);
  return <div onClick={() => setState(state + 1)}>State is {state}</div>;
};

describe('safetest tests', function () {
  this.timeout?.(300000);

  it('BROWSER', async () => {
    const { page } = await reactRender(<Thing />);
    await page.click('div');
    await page.click('div');
    await page.click('div');
    assert(await page.evaluate(() => document.body.innerText), 'State is 3');
  });
  it('BROWSER', async () => {
    const { page } = await reactRender(<Thing />);
    await page.click('div');
    await page.click('div');
    await page.click('div');
    assert(await page.evaluate(() => document.body.innerText), 'State is 3');
  });
  it('BROWSER', async () => {
    const { page } = await reactRender(<Thing />);
    await page.click('div');
    await page.click('div');
    await page.click('div');
    assert(await page.evaluate(() => document.body.innerText), 'State is 3');
  });
  it('BROWSER', async () => {
    const { page } = await reactRender(<Thing />);
    await page.click('div');
    await page.click('div');
    await page.click('div');
    assert(await page.evaluate(() => document.body.innerText), 'State is 3');
  });
  it('BROWSER', async () => {
    const { page } = await reactRender(<Thing />);
    await page.click('div');
    await page.click('div');
    await page.click('div');
    assert(await page.evaluate(() => document.body.innerText), 'State is 3');
  });
  it('BROWSER', async () => {
    const { page } = await reactRender(<Thing />);
    await page.click('div');
    await page.click('div');
    await page.click('div');
    assert(await page.evaluate(() => document.body.innerText), 'State is 3');
  });
});
