import { setOptions } from '.';
import { startDocker, stopDocker } from './docker';
import { RenderOptions } from './render';
import { state } from './state';
import { camelCase } from 'lodash';
import { getViewUrl, openLocalBrowser, startServer } from './redirect-server';
import { getTree } from './ps';
import { safeRequire } from './safe-require';

type Options = RenderOptions | ((options: RenderOptions) => RenderOptions);

export const setup = (options: Options) => {
  const processes = getTree();
  let argv = process.argv;
  if (typeof vitest !== 'undefined') {
    let current = processes[process.pid];
    while (current && !current.argv.join(' ').includes('.bin/vitest')) {
      current = processes[current.ppid];
    }
    argv = current?.argv!;
  }

  const parsed = Object.fromEntries(
    argv!
      .map((arg) => arg.match(/(?<=--)([^=]*)(?:=(.*))?/)?.slice(1))
      .map((item) => {
        let value: any = item?.[1];
        if (!item?.[0]) return undefined as never;
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
  const headless = useDocker ? true : !parsed['headed'];

  state.isCi = !!parsed['ci'] || !!process.env['CI'];

  const localUrl = url.hostname === 'localhost' || url.hostname === '127.0.0.1';

  setOptions({
    url: `${url}`,
    useDocker,
    headless,
    matchImageSnapshotOptions: {
      failureThreshold: useDocker ? 0 : 1,
      failureThresholdType: 'percent',
    },
  });

  if (options) {
    if (typeof options === 'function') options = options(state.options);
    setOptions(options);
  }
  useDocker = !!state.options.useDocker;

  if (useDocker) {
    if (localUrl) url.hostname = 'host.docker.internal';
    beforeAll(async () => {
      const docker = await startDocker();
      await startServer(parsed);

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
        const console = safeRequire('console');
        const msg = `\n\nGo to ${viewUrl} to view the remote tests\n\n`;
        if (viewUrl) console.log(msg);
      }
    }, 30000);
  }
};
