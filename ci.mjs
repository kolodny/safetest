import concurrently from 'concurrently';
import getPort from 'get-port';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const craPort = await getPort();

const craExitInfo = await concurrently(
  [
    {
      command: 'npm start',
      name: 'App',
      prefixColor: 'bgMagenta.bold',
      cwd: __dirname + '/examples/create-react-app',
      env: {
        ...process.env,
        SKIP_PREFLIGHT_CHECK: true,
        PORT: craPort,
        BROWSER: 'none',
      },
    },
    {
      command: `npx wait-on http://localhost:${craPort} && npm run safetest -- --watchAll=false`,
      name: 'Safetest',
      prefixColor: 'bgYellow.bold',
      cwd: __dirname + '/examples/create-react-app',
      env: {
        ...process.env,
        SKIP_PREFLIGHT_CHECK: true,
        BASE_URL: `http://localhost:${craPort}`,
        BROWSER: 'none',
      },
    },
  ],
  {
    prefix: 'CRA {name}',
    killOthers: ['failure', 'success'],
    successCondition: 'first',
  }
);

if (craExitInfo.every((i) => i.killed)) {
  console.warn('CRA exited');
  process.exit(1);
}

console.log('CRA passed!');

const viteReactTsPort = await getPort();

const viteReactExitInfo = await concurrently(
  [
    {
      command: `npm run dev -- --port ${viteReactTsPort}`,
      name: 'App',
      prefixColor: 'bgMagenta.bold',
      cwd: __dirname + '/examples/vite-react',
      env: {
        ...process.env,
      },
    },
    {
      command: `npx wait-on -c waitOnConfig.json http-get://localhost:${viteReactTsPort} && npm run safetest`,
      name: 'Safetest',
      prefixColor: 'bgYellow.bold',
      cwd: __dirname + '/examples/vite-react',
      env: {
        ...process.env,
        BASE_URL: `http://localhost:${viteReactTsPort}`,
      },
    },
  ],
  {
    prefix: 'Vite React-TS {name}',
    killOthers: ['failure', 'success'],
    successCondition: 'first',
  }
);

if (viteReactExitInfo.every((i) => i.killed)) {
  console.warn('Vite React-TS exited');
  process.exit(1);
}

console.log('Vite React-TS passed!');

const vitestPort = await getPort();

const vitestExitInfo = await concurrently(
  [
    {
      command: `npm run dev -- --port ${vitestPort}`,
      name: 'App',
      prefixColor: 'bgMagenta.bold',
      cwd: __dirname + '/examples/vitest',
      env: {
        ...process.env,
      },
    },
    {
      command: `npx wait-on -c waitOnConfig.json http-get://localhost:${vitestPort} && npx vitest run`,
      name: 'Safetest',
      prefixColor: 'bgYellow.bold',
      cwd: __dirname + '/examples/vitest',
      env: {
        ...process.env,
        BASE_URL: `http://localhost:${vitestPort}`,
      },
    },
  ],
  {
    prefix: 'Vitest {name}',
    killOthers: ['failure', 'success'],
    successCondition: 'first',
  }
);

if (vitestExitInfo.every((i) => i.killed)) {
  console.warn('Vitest exited');
  process.exit(1);
}

console.log('Vitest passed!');

const viteVueTsPort = await getPort();

const viteVueExitInfo = await concurrently(
  [
    {
      command: `npm run dev -- --port ${viteVueTsPort}`,
      name: 'App',
      prefixColor: 'bgMagenta.bold',
      cwd: __dirname + '/examples/vite-vue',
      env: {
        ...process.env,
      },
    },
    {
      command: `npx wait-on -c waitOnConfig.json http-get://localhost:${viteVueTsPort} && npm run safetest`,
      name: 'Safetest',
      prefixColor: 'bgYellow.bold',
      cwd: __dirname + '/examples/vite-vue',
      env: {
        ...process.env,
        BASE_URL: `http://localhost:${viteVueTsPort}`,
      },
    },
  ],
  {
    prefix: 'Vite Vue-TS {name}',
    killOthers: ['failure', 'success'],
    successCondition: 'first',
  }
);

if (viteVueExitInfo.every((i) => i.killed)) {
  console.warn('Vite Vue-TS exited');
  process.exit(1);
}

console.log('vite Vue-TS passed!');

const viteSvelteTsPort = await getPort();

const viteSvelteExitInfo = await concurrently(
  [
    {
      command: `npm run dev -- --port ${viteSvelteTsPort}`,
      name: 'App',
      prefixColor: 'bgMagenta.bold',
      cwd: __dirname + '/examples/vite-svelte',
      env: {
        ...process.env,
      },
    },
    {
      command: `npx wait-on -c waitOnConfig.json http-get://localhost:${viteSvelteTsPort} && npm run safetest`,
      name: 'Safetest',
      prefixColor: 'bgYellow.bold',
      cwd: __dirname + '/examples/vite-svelte',
      env: {
        ...process.env,
        BASE_URL: `http://localhost:${viteSvelteTsPort}`,
      },
    },
  ],
  {
    prefix: 'Vite Svelte {name}',
    killOthers: ['failure', 'success'],
    successCondition: 'first',
  }
);

if (viteSvelteExitInfo.every((i) => i.killed)) {
  console.warn('Vite Svelte exited');
  process.exit(1);
}

console.log('Vite Svelte passed!');

const esBuildPort = await getPort();

const esbuildExitInfo = await concurrently(
  [
    {
      command: `npx esbuild --bundle --minify --sourcemap  src/index.tsx --outfile=public/index.js --servedir=public --serve=${esBuildPort}`,
      name: 'App',
      prefixColor: 'bgMagenta.bold',
      cwd: __dirname + '/examples/esbuild',
      env: {
        ...process.env,
      },
    },
    {
      command: `npx wait-on http-get://localhost:${esBuildPort} && npm run safetest`,
      name: 'Safetest',
      prefixColor: 'bgYellow.bold',
      cwd: __dirname + '/examples/esbuild',
      env: {
        ...process.env,
        BASE_URL: `http://localhost:${esBuildPort}`,
      },
    },
  ],
  {
    prefix: 'Esbuild {name}',
    killOthers: ['failure', 'success'],
    successCondition: 'first',
  }
);

if (esbuildExitInfo.every((i) => i.killed)) {
  console.warn('esbuild exited');
  process.exit(1);
}

console.log('esbuild passed');

const mochaPort = await getPort();

const mochaExitInfo = await concurrently(
  [
    {
      command: `npx esbuild --bundle --minify --sourcemap  src/index.tsx --outfile=public/index.js --servedir=public --serve=${mochaPort}`,
      name: 'App',
      prefixColor: 'bgMagenta.bold',
      cwd: __dirname + '/examples/mocha',
      env: {
        ...process.env,
      },
    },
    {
      command: `npx wait-on http-get://localhost:${mochaPort} && npm run safetest`,
      name: 'Safetest',
      prefixColor: 'bgYellow.bold',
      cwd: __dirname + '/examples/mocha',
      env: {
        ...process.env,
        BASE_URL: `http://localhost:${mochaPort}`,
      },
    },
  ],
  {
    prefix: 'Mocha {name}',
    killOthers: ['failure', 'success'],
    successCondition: 'first',
  }
);

if (mochaExitInfo.every((i) => i.killed)) {
  console.warn('mocha exited');
  process.exit(1);
}

console.log('mocha passed');

const ngPort = await getPort();

const ngExitInfo = await concurrently(
  [
    {
      command: `npx ng serve --port ${ngPort}`,
      name: 'App',
      prefixColor: 'bgMagenta.bold',
      cwd: __dirname + '/examples/ng-app',
      env: {
        ...process.env,
      },
    },
    {
      command: `npx wait-on http://localhost:${ngPort} && npm run safetest`,
      name: 'Safetest',
      prefixColor: 'bgYellow.bold',
      cwd: __dirname + '/examples/ng-app',
      env: {
        ...process.env,
        BASE_URL: `http://localhost:${ngPort}`,
      },
    },
  ],
  {
    prefix: 'Ng {name}',
    killOthers: ['failure', 'success'],
    successCondition: 'first',
  }
);

if (ngExitInfo.every((i) => i.killed)) {
  console.warn('ng exited');
  process.exit(1);
}

console.log('esbuild passed');
