import { describe, it, setTimeout, expect } from 'safetest/jest';
import { setOptions } from 'safetest';
import { makeSafetestBed } from 'safetest/ng';

const { render, ng } = makeSafetestBed(() => ({
  TestBed: import('@angular/core/testing'),
  Ng: import('@angular/core'),
  PlatformBrowser: import('@angular/platform-browser'),
  DynamicTesting: import('@angular/platform-browser-dynamic/testing'),
  configure: async (ng) => {
    @ng.Component({
      selector: 'my-cool-test',
      template: `<div>My cool test</div>`,
    })
    class MyTest {}
    return {
      declarations: [
        MyTest,
        (await import('./app.component')).HelloWorldComponent,
      ],
    };
  },
}));

describe('angular-app', () => {
  it('works', async () => {
    const { page } = await render('bar');
    await expect(page.locator('text=bar')).toBeVisible();
    expect(await page.screenshot()).toMatchImageSnapshot({
      failureThreshold: 10,
    });
  });

  it('works2', async () => {
    const { page } = await render('baz');
    const bodyText = await page.evaluate(() => document.body.innerText.trim());
    expect(bodyText).toBeTruthy();
  });

  it('works3', async () => {
    const { page } = await render(() =>
      import('./app.component').then((x) => x.HelloWorldComponent)
    );
    const bodyText = await page.evaluate(() => document.body.innerText.trim());
    expect(bodyText).toBeTruthy();
  });

  it('works4', async () => {
    const { page } = await render('<hello-world></hello-world>');
    const bodyText = await page.evaluate(() => document.body.innerText.trim());
    expect(bodyText).toBeTruthy();
  });

  it('works5', async () => {
    const { page } = await render('<my-cool-test></my-cool-test>');
    const bodyText = await page.evaluate(() => document.body.innerText.trim());
    expect(bodyText).toBeTruthy();
  });
});
