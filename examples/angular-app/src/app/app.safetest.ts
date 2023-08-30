import { describe, it } from 'safetest/jest';
import { setOptions } from 'safetest';
import { makeSafetestBed } from 'safetest/ng';

setOptions({ url: 'http://localhost:4200' });

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
    console.log(await page.evaluate(() => document.body.innerText));
  });

  it('works2', async () => {
    const { page } = await render('baz');
    console.log(await page.evaluate(() => document.body.innerText));
  });

  it('works3', async () => {
    const { page } = await render(() =>
      import('./app.component').then((x) => x.HelloWorldComponent)
    );
    console.log(await page.evaluate(() => document.body.innerText));
  });

  it('works4', async () => {
    const { page } = await render('<hello-world></hello-world>');
    console.log(await page.evaluate(() => document.body.innerText));
  });

  it('works5', async () => {
    const { page } = await render('<my-cool-test></my-cool-test>');
    console.log(await page.evaluate(() => document.body.innerText));
  });
});
