import { makeSafetestBed } from 'safetest/ng';

import { describe, it, setTimeout as setJestTimeout } from 'safetest/jest';

setJestTimeout(300000); // 5 minutes

const safetestBedPromise = makeSafetestBed(async () => {
  const { ThingComponent } = await import('./app/thing/thing.component');
  const ng = await import('@angular/core');

  @ng.Component({
    selector: 'app-thing-inline',
    template: `<div (click)="inc()">State is {{ value }}</div>`,
  })
  class InlineThingComponent {
    @ng.Input() startingValue = 0;
    value = this.startingValue;
    inc() {
      this.value++;
    }
    ngOnInit() {
      this.value = this.startingValue;
    }
  }

  return {
    TestBed: await import('@angular/core/testing'),
    ng,
    dynamicTesting: await import('@angular/platform-browser-dynamic/testing'),
    components: { ThingComponent, InlineThingComponent },
  };
});

describe('safetest tests', () => {
  it('Simple case', async () => {
    const safetestBed = await safetestBedPromise;
    const { page } = await safetestBed.render(
      () => safetestBed.components.ThingComponent
    );
    await page.click('div');
    await page.click('div');
    await page.click('div');
    expect(await page.evaluate(() => document.body.innerText)).toEqual(
      'State is 3'
    );
  });

  it('Rendering a string', async () => {
    const safetestBed = await safetestBedPromise;
    const { page } = await safetestBed.render('<div>Cool</div>');
    expect(await page.evaluate(() => document.body.innerText)).toEqual('Cool');
  });
  it('Creating a component on the fly', async () => {
    const safetestBed = await safetestBedPromise;
    const thing = safetestBed.makeComponent(
      '<div>Cool2 {{ value }}</div>',
      class {
        value = 123;
      }
    );
    const { page } = await safetestBed.render(thing);
    expect(await page.evaluate(() => document.body.innerText)).toEqual(
      'Cool2 123'
    );
  });

  it('Rendering a component from the makeSafetestBed function', async () => {
    const safetestBed = await safetestBedPromise;

    const { page } = await safetestBed.render(
      '<app-thing-inline [startingValue]="22"></app-thing-inline>'
    );
    await page.click('div');
    await page.click('div');
    await page.click('div');
    expect(await page.evaluate(() => document.body.innerText)).toEqual(
      'State is 25'
    );
  });
});
