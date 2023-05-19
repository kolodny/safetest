import type { Page } from 'playwright';

export const exposeFunction = async (
  page: Page,
  name: string,
  fn: any
): Promise<void> => {
  let resolve = false;
  const timeout = new Promise((r) => setTimeout(r, 100));
  const exposed = page.exposeFunction(name, fn).then(() => (resolve = true));
  return Promise.race([timeout, exposed]).then(async () => {
    if (!resolve) {
      await page.reload();
      // @ts-ignore
      const fn = await page.evaluate((name) => typeof window[name], name);
      if (fn !== 'function') return exposeFunction(page, name, fn);
    }
  });
};
