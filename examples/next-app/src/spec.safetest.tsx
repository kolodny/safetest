import { describe, it, expect } from 'safetest/vitest';
import { render } from 'safetest/react';
import { MainPageFileOverride } from './app/Overrides';

describe('app test', () => {
  it('works', async () => {
    const { page } = await render((app) => (
      <MainPageFileOverride.Override
        with={(old) => old?.split('').reverse().join('')}
        children={app}
      />
    ));
    await expect(
      page.locator('text=Get started by editing xst.egap/ppa/crs')
    ).toBeVisible();
    expect(await page.screenshot()).toMatchImageSnapshot();
  });
});

describe('simple', () => {
  it('s', async () => {
    const { page } = await render(<div>Test1</div>);
    await expect(page.locator('text=Test1')).toBeVisible();
    expect(await page.screenshot()).toMatchImageSnapshot();
  });
});

describe('complex', () => {
  describe('nested', () => {
    describe('deeply', () => {
      it('c.n.d', async () => {
        const { page } = await render(<div>Test2</div>);
        await expect(page.locator('text=Test2')).toBeVisible();
        expect(await page.screenshot()).toMatchImageSnapshot();
      });
    });
  });
  describe('sibling', () => {
    it('c.s', async () => {
      const { page } = await render(<div>Test3</div>);
      await expect(page.locator('text=Test3')).toBeVisible();
      expect(await page.screenshot()).toMatchImageSnapshot();
    });
  });
});

describe('another complex', () => {
  describe('nested', () => {
    describe('deeply', () => {
      it('c.n.d', async () => {
        const { page } = await render(<div>Test4</div>);
        await expect(page.locator('text=Test4')).toBeVisible();
        expect(await page.screenshot()).toMatchImageSnapshot();
      });
    });
  });
  describe('sibling', () => {
    it('c.s', async () => {
      const { page } = await render(<div>Test3</div>);
      await expect(page.locator('text=Test3')).toBeVisible();
    });
  });
});
