/* eslint-disable @typescript-eslint/no-explicit-any */
import { SafePage } from './safepage';
import { pageMethods, pageProperties } from './playwright-page-keys';
import { global } from './global';

interface Arguments {
  page: SafePage;
  api: any;
  isDebugging: boolean;
}

export const makePause = async ({ page, api, isDebugging }: Arguments) => {
  return () => {
    if (!isDebugging) {
      console.warn(`pause() was called without using it.debug(...). This was
probably a mistake, did you forget to wrap the test with pause() in a it.debug(...) block?`);
    }
    (global as any).page = page;
    (global as any).api = api;
    console.log(`The current test has been paused.
The page object is available in the debugging test.
Run node with --inspect-brk flag to debug with v8 node inspector.
When finished debugging the test, run resume() to
resume the tests (and not leave hanging browser instances around).`);

    return new Promise<void>(async (resolve) => {
      (global as any).resume = resolve;
      if (!page._safetest_internal.fnPrefix) {
        const fnPrefix = `${Math.random()}`;
        page._safetest_internal.fnPrefix = fnPrefix;
        await page._safetest_internal.originalMethods.exposeFunction(
          'resume',
          () => (global as any).resume()
        );
        await page._safetest_internal.originalMethods.exposeFunction(
          '__page_channel__',
          (method: string, args: string) => {
            const parsedArgs = JSON.parse(args, (key, value) => {
              if (`${value}`.startsWith(fnPrefix)) {
                return new Function(`return ${value.slice(fnPrefix.length)}`)();
              }
              return value;
            });
            const parts = method.split('.');
            const bound = parts
              .slice(0, -1)
              .reduce((acc: any, cur) => acc[cur], page);
            const fn = bound[parts[parts.length - 1]];
            return fn.apply(bound, parsedArgs);
          }
        );
      }
      const exposePage = async () => {
        page.evaluate(
          ({ pageMethods, pageProperties, fnPrefix }) => {
            const stringifyArgs = (args: any[]) =>
              JSON.stringify(args, (key, val) => {
                if (typeof val === 'function') {
                  return `${fnPrefix}${val}`;
                }
                return val;
              });

            (window as any).page = {};
            for (const method of pageMethods) {
              (window as any).page[method] = (...args: any[]) => {
                const stringifiedArgs = stringifyArgs(args);
                return (window as any).__page_channel__(
                  method,
                  stringifiedArgs
                );
              };
            }
            for (const property of Object.keys(pageProperties)) {
              (window as any).page[property] = {};
              for (const method of (pageProperties as any)[property]) {
                (window as any).page[property][method] = (...args: any[]) => {
                  const stringifiedArgs = stringifyArgs(args);
                  return (window as any).__page_channel__(
                    `${property}.${method}`,
                    stringifiedArgs
                  );
                };
              }
            }
          },
          {
            pageMethods,
            pageProperties,
            fnPrefix: page._safetest_internal.fnPrefix ?? '',
          }
        );
      };
      await exposePage();
      page.on('load', exposePage);
    });
  };
};
