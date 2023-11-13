import { setOptions } from '.';
import { startDocker, stopDocker } from './docker';
import { RenderOptions } from './render';
import { state } from './state';
import { camelCase } from 'lodash';
import { getViewUrl, openLocalBrowser, startServer } from './redirect-server';
import { getTree } from './ps';
import { safeRequire } from './safe-require';
import { collectArtifacts } from './artifacts';
import merge from 'deepmerge';

type Options = RenderOptions & { bootstrappedAt: string };

export const setup = (options: Options) => {
  if (!options.bootstrappedAt) throw new Error('bootstrappedAt is required');
  state.bootstrappedAt = options.bootstrappedAt;
  let argv = process.argv;
  if (typeof vitest !== 'undefined') {
    const processes = getTree();
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

  if (typeof process !== 'undefined' && process.env['SAFETEST_OPTIONS']) {
    merge(parsed, JSON.parse(process.env['SAFETEST_OPTIONS']) as RenderOptions);
  }

  const targetUrl = parsed['url'] || process.env['TARGET_URL'];
  if (!targetUrl)
    throw new Error(
      'Target URL is required! Either pass --url, set TARGET_URL, or set the SAFETEST_OPTIONS'
    );
  const url = new URL(targetUrl);
  let useDocker = !!parsed['docker'];
  const headless = useDocker ? true : !parsed['headed'];

  state.isCi = !!parsed['ci'] || !!process.env['CI'];
  if (parsed['artifactsJson']) {
    state.artifactsJson = parsed['artifactsJson'];
  }

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
    setOptions(options);
  }
  useDocker = !!state.options.useDocker;

  afterAll(async () => {
    // This needs to run for each vitest test, not sure why this doesn't work with vitest in the vitest.ts setup.
    await collectArtifacts();
  });

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
    });
  }
};
