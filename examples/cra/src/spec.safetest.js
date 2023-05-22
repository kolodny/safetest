import { render } from 'safetest/react';
import { describe, it, expect } from 'safetest/jest';

export const Main = () => {
    return <>This is cool</>;
};

describe('Main', () => {
    it('should render', async () => {
        const { page } = await render(<Main />);
        expect(page).toBeTruthy();
    });
});
