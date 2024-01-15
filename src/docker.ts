import { mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import cp from 'child_process';
import { state } from './state';
import { RenderOptions } from './render';
import { pick } from 'lodash';

const DOCKER_DEBUG_PORT = 9222;
const DOCKER_SERVER_PORT = 2222;

const spawn = (command: string, args: string[], resolveOnOutput?: boolean) => {
  return new Promise<{ stdout: string; exitCode: number | null }>((resolve) => {
    const spawned = cp.spawn(command, args, {
      stdio: ['ignore', 'pipe', 'inherit'],
    });
    let stdout = '';
    spawned.stdout.on('data', (data) => {
      stdout += data;
      process.stdout.write(data);
      if (resolveOnOutput) resolve({ stdout, exitCode: null });
    });

    spawned.on('close', (exitCode) => {
      resolve({ stdout, exitCode });
    });
  });
};

const playwrightVersion = require('playwright/package.json').version;
let GUID = Math.random().toString(36).substring(2, 15);
let imageName = `safetest-image-${playwrightVersion}-${GUID}`;
let containerName = `safetest-server-${playwrightVersion}-${GUID}`;

export const stopDocker = async () => {
  spawn('docker', ['stop', containerName]);
  // In case another test wants to start up docker.
  GUID = Math.random().toString(36).substring(2, 15);
  imageName = `safetest-image-${playwrightVersion}-${GUID}`;
  containerName = `safetest-server-${playwrightVersion}-${GUID}`;
};

export const buildDocker = async () => {
  const { exitCode } = await spawn('docker', [
    'ps',
    '--format',
    '{{.ID}} {{.Names}} ',
  ]);

  if (exitCode) {
    const notFound = exitCode === 127;
    const message = notFound ? 'Docker not found' : `Docker error: ${exitCode}`;
    throw new Error(message);
  }
  const dir = mkdtempSync(join(tmpdir(), 'safetest-docker-'));
  const DOCKERFILE = `
    FROM mcr.microsoft.com/playwright:v${playwrightVersion}-focal

    WORKDIR /ms-playwright

    RUN npm init -y
    RUN npm install playwright@${playwrightVersion}
    COPY index.mjs .
    EXPOSE ${DOCKER_SERVER_PORT}
    EXPOSE ${DOCKER_DEBUG_PORT}

    CMD ["node", "index.mjs"]
    `;
  writeFileSync(join(dir, 'Dockerfile'), DOCKERFILE);
  writeFileSync(
    join(dir, 'index.mjs'),
    `
    import { chromium } from 'playwright';

    const options = JSON.parse(process.argv[2]);
    const launchArgs = {
      args: ['--remote-debugging-port=${DOCKER_DEBUG_PORT}', '--remote-debugging-address=0.0.0.0', '--remote-allow-origins=*'],
    }

    if (options.args) launchArgs.args.push(...options.args);
    if (options.ignoreDefaultArgs) launchArgs.ignoreDefaultArgs = options.ignoreDefaultArgs;

    const server = await chromium.launchServer({
      port: ${DOCKER_SERVER_PORT},
      ...launchArgs,
    });

    // Exit the docker container if no pages are open for 1 hour (perhaps zombie server).
    let ticksWithoutPages = 0;
    setInterval(async () => {
      try {
        const response = await fetch('http://127.0.0.1:${DOCKER_DEBUG_PORT}/json/list');
        const json = await response.json();
        if (json.length === 0) ticksWithoutPages++;
        else ticksWithoutPages = 0;
        if (ticksWithoutPages > 3600) process.exit();
      } catch {}
    }, 1000);

    console.log(server.wsEndpoint());
  `
  );
  await spawn('docker', ['build', '--progress=plain', '-t', imageName, dir]);
};

export const startDocker = async (options: RenderOptions) => {
  await buildDocker();
  await spawn(
    'docker',
    [
      'run',
      '--rm',
      '--name',
      containerName,
      '--publish-all=true',
      imageName,
      'node',
      'index.mjs',
      JSON.stringify(pick(options, ['args', 'ignoreDefaultArgs'])),
    ],
    true
  );
  const ports = await getPorts();

  return { ports };
};

const getPorts = async () => {
  const { stdout } = await spawn('docker', ['port', containerName]);
  const mappings = Object.fromEntries(
    stdout
      .split('\n')
      .filter(Boolean)
      .map((l) => [/^\d+/.exec(l), /\d+$/.exec(l)?.[0]])
  );
  const serverPort = Number(mappings[DOCKER_SERVER_PORT]);
  const debugPort = Number(mappings[DOCKER_DEBUG_PORT]);
  state.debugPort = debugPort;
  return { SERVER_PORT: serverPort, DEBUG_PORT: debugPort };
};
