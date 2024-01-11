import { setOptions } from '.';
import { startDocker, stopDocker } from './docker';
import { RenderOptions } from './render';
import { state } from './state';
import { set } from 'lodash';
import { getViewUrl, openLocalBrowser, startServer } from './redirect-server';
import { safeRequire } from './safe-require';
import { collectArtifacts } from './artifacts';

type Options = RenderOptions & { bootstrappedAt: string };

export const setup = (options: Options) => {
  if (!options.bootstrappedAt) throw new Error('bootstrappedAt is required');
  state.bootstrappedAt = require.resolve(options.bootstrappedAt);

  const parse = (s: string) => {
    try {
      return JSON.parse(s);
    } catch {
      return s;
    }
  };

  const opts: Record<string, string> = {
    url: options.url ?? '',
    docker: options.useDocker ? 'true' : '',
    headed: 'headless' in options ? `${options.headless}` : '',
  };
  const envEntries = Object.entries(process.env)
    .map(([name, value]) => [name.toLowerCase(), `${value}`] as const)
    .filter(([name]) => name.startsWith('opt_'))
    .map(([name, value]) => [name.slice(4).replace(/_/g, '.'), parse(value)]);

  for (const [name, value] of envEntries) set(opts, name, value);

  const url = options.url ?? opts['url'];
  if (!url) throw new Error('Target URL is required!');
  let useDocker = !!opts['docker'] || !!options.useDocker;
  const headless = useDocker ? true : !opts['headed'];

  const isCi = (state.isCi = !!opts['ci'] || !!process.env['CI']);
  if (opts['artifacts']) {
    state.artifactsJson = opts['artifacts'];
  }

  const hostname = new URL(url).hostname;
  const localUrl = hostname === 'localhost' || hostname === '127.0.0.1';

  setOptions({
    url: `${url}`,
    useDocker,
    headless,
    matchImageSnapshotOptions: {
      failureThreshold: useDocker ? 0 : 1,
      failureThresholdType: 'percent',
    },
  });

  setOptions(options);
  useDocker = !!state.options.useDocker;

  afterAll(async () => {
    // This needs to run for each vitest test, not sure why this doesn't work with vitest in the vitest.ts setup.
    await collectArtifacts();
  });

  if (useDocker) {
    const dockerSafeUrl = new URL(url);
    if (localUrl) dockerSafeUrl.hostname = 'host.docker.internal';
    beforeAll(async () => {
      const docker = await startDocker(state.options);
      await startServer(opts);

      const browserServer = `http://localhost:${docker?.ports.SERVER_PORT}/`;
      setOptions({
        url: `${dockerSafeUrl}`,
        browserServer,
        afterAllDone: stopDocker,
      });
      if (opts['headed'] && !isCi) {
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
