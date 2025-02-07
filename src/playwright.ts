import { safeRequire } from "./safe-require";

const { expect } = safeRequire('@playwright/test') as typeof import('@playwright/test');

export { expect };