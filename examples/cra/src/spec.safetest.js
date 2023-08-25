import React from 'react';
import { render } from 'safetest/react';
import { describe, it, expect, retryTimes, browserMock } from 'safetest/jest';

retryTimes(3);

export const Main = () => {
    return <>This is cool</>;
};

describe('Main', () => {
    it('should render', async () => {
        const { page } = await render(<Main />);
        expect(page).toBeTruthy();
    });

    it('can do a screenshot test', async () => {
        const { page } = await render((app) => app);
        await page.evaluate(() => document.querySelector('[aria-label="Live Customize"]').remove());
        await page.waitForTimeout(3000);
        expect(await page.screenshot()).toMatchImageSnapshot({ failureThreshold: 10 });
    });

    it('can check that a spy was called', async () => {
        const spy = browserMock.fn();
        const { page } = await render(<button onClick={() => spy('foo')}>Click me</button>);
        expect(await spy).not.toHaveBeenCalled();
        await page.locator('text=Click me').click();
        // expect(await spy).toHaveBeenCalled();
        expect(await spy).toHaveBeenCalledWith('foo');
    });

    it('can do many interactions fast', async () => {
        const Counter = () => {
            const [count, setCount] = React.useState(0);
            return (
                <div>
                    <button onClick={() => setCount(count + 1)}>Count is {count}</button>
                </div>
            );
        };
        const { page } = await render(<Counter />);
        await expect(page.locator('text=Count is 0')).toBeVisible();
        for (let i = 1; i <= 500; i++) {
            await page.locator('button:not(a)').click();
            await expect(page.locator(`text=Count is ${i}`)).toBeVisible();
        }
    });

    for (let i = 0; i < 50; i++) {
        it(`stress test ${i} run`, async () => {
            const Counter = () => {
                const [count, setCount] = React.useState(0);
                return (
                    <div>
                        Viewing test #{i}
                        <button onClick={() => setCount(count + 1)}>Count is {count}</button>
                    </div>
                );
            };
            const { page } = await render(<Counter />);
            await expect(page.locator('text=Count is 0')).toBeVisible();
            await page.locator('button:not(a)').click();
            await page.locator('button:not(b)').click();
            await page.locator('button:not(c)').click();
            await expect(page.locator('text=Count is 3')).toBeVisible();
            await page.locator('button:not(d)').click();
            await page.locator('button:not(e)').click();
            await page.locator('button:not(f)').click();
            await expect(page.locator('text=Count is 6')).toBeVisible();
        });
    }
});
