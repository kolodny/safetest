import { describe, it, expect } from 'safetest/jest';
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

  it('allows custom components', async () => {
    const { page } = await render(async (ng) =>
      ng.Component({
        template: `
                    <div>
                      <span>Count is {{ count }}</span>
                      <button (click)="onIncrement()">Inc</button>
                    </div>
                  `,
      })(
        class {
          count = 0;
          onIncrement = () => (this.count += 1);
        }
      )
    );

    for (let i = 0; i < 500; i++) {
      await expect(page.locator(`text=Count is ${i}`)).toBeVisible();
      await page.click('text=Inc');
    }
  });
});
