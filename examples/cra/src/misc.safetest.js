import { describe, it, expect } from 'safetest/vitest';
import { render } from 'safetest/react';

describe('simple', () => {
    it('s', async () => {
        const { page } = await render(<div>Test1</div>);
        await expect(page.locator('text=Test1')).toBeVisible();
    });
});

describe('complex', () => {
    describe('nested', () => {
        describe('deeply', () => {
            it('c.n.d', async () => {
                const { page } = await render(<div>Test2</div>);
                await expect(page.locator('text=Test2')).toBeVisible();
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

describe('another complex', () => {
    describe('nested', () => {
        describe('deeply', () => {
            it('c.n.d', async () => {
                const { page } = await render(<div>Test2</div>);
                await expect(page.locator('text=Test2')).toBeVisible();
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
