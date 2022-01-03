import React from 'react';
// import App from './App';
// import { describe, test, it, reactRender } from 'safetest';
import { render as reactRender } from 'safetest/react';
import { describe, it, setTimeout as jestSetTimeout } from 'safetest/jest';

jestSetTimeout(300000); // 5 minutes

const Thing = () => {
  const [state, setState] = React.useState(0);
  return <div onClick={() => setState(state + 1)}>State is {state}</div>;
};

describe('safetest tests', () => {
  it.skip('BROWSER', async () => {
    const { pause } = await reactRender(
      (app) => ({
        element: <Thing />,
        api: {
          foo: () => document.body.innerText,
        },
      }),
      { headless: false }
    );
    const { page: page2 } = await reactRender(
      (app) => ({
        element: (
          <div>
            The second thing
            <Thing />
          </div>
        ),
        api: {
          foo: () => document.body.innerText,
        },
      }),
      { headless: false }
    );
    (global as any).page2 = page2;
    debugger;
    await pause();
  });
  it.skip('BROWSER2', async () => {
    const { page, pause } = await reactRender(
      (app) => ({
        element: (
          <>
            2222
            <Thing />
          </>
        ),
        api: {
          foo: () => document.body.innerText,
        },
      }),
      { headless: false }
    );
    await pause();
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
