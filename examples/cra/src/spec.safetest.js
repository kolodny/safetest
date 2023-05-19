// import React from 'react';

import { render } from 'safetest/lib/react';
import { describe, it, expect } from 'safetest/lib/jest';

export const Main = () => {
    return <>This is cool</>;
};

describe('Main', () => {
    it('should render', async () => {
        const { page } = await render(<Main />);
        expect(page).toBeTruthy();
    });
});
