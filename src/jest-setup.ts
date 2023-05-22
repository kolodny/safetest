import { setOptions } from '.';
import { beforeAll, setTimeout } from './jest';
import { startDocker, stopDocker } from './docker';
import { RenderOptions } from './render';
import { state } from './state';
import { camelCase } from 'lodash';
import { getViewUrl, openLocalBrowser, startServer } from './redirect-server';

export const parsed = Object.fromEntries(
  process.argv
    .map((arg) => arg.match(/(?<=--)([^=]*)(?:=(.*))?/)?.slice(1))
    .map((item) => {
      let value: any = item?.[1];
      if (value === 'false') value = false;
      else if (value === 'true') value = true;
      else if (value === undefined) value = true;
      else if (value === 'undefined') value = undefined;
      else if (!isNaN(parseFloat(value))) value = +value;
      return [camelCase(item?.[0]), value];
    })
    .filter(Boolean)
);

const targetUrl = parsed['url'] || process.env['TARGET_URL'];
if (!targetUrl) throw new Error('Target URL is required');
const url = new URL(targetUrl);
let useDocker = !!parsed['docker'];
const headless = useDocker ? false : !parsed['headed'];

state.isCi = !!parsed['ci'] || !!process.env['CI'];

const localUrl = url.hostname === 'localhost' || url.hostname === '127.0.0.1';

setTimeout(30000);

setOptions({
  url: `${url}`,
  useDocker,
  headless,
  matchImageSnapshotOptions: {
    failureThreshold: useDocker ? 0 : 1,
    failureThresholdType: 'percent',
  },
});

export const setup = (
  options?: RenderOptions | ((options: RenderOptions) => RenderOptions)
) => {
  if (options) {
    if (typeof options === 'function') options = options(state.options);
    setOptions(options);
  }
  useDocker = !!state.options.useDocker;

  if (useDocker) {
    if (localUrl) url.hostname = 'host.docker.internal';
    beforeAll(async () => {
      const docker = await startDocker();
      await startServer();

      const browserServer = `http://localhost:${docker?.ports.SERVER_PORT}/`;
      setOptions({
        url: `${url}`,
        browserServer,
        afterAllDone: stopDocker,
      });
      const isCi = !!parsed['ci'] || !!process.env['CI'];
      if (parsed['headed'] && !isCi) {
        await openLocalBrowser('http://localhost:8844');
      } else {
        const viewUrl = getViewUrl();
        const msg = `\n\nGo to ${viewUrl} to view the remote tests\n\n`;
        if (viewUrl) console.log(msg);
      }
    }, 30000);
  }
};
