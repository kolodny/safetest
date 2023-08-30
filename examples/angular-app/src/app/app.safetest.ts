import { describe, it } from 'safetest/jest';
import { makeSafetestBed } from 'safetest/ng';

const { render, ng } = makeSafetestBed(() => ({
  TestBed: import('@angular/core/testing'),
  PlatformBrowser: import('@angular/platform-browser'),
  components: {
    // Appy: async () => (await import('./app.component')).AppComponent,
  },
}));

describe('angular-app', () => {
  it('works', async () => {
    const { page } = await render(
      () => import('./app.component').then((x) => x.HelloWorldComponent),
      {
        headless: false,
        url: 'http://localhost:4200',
      }
    );
    console.log(await page.evaluate(() => document.body.innerHTML));
  });
});
