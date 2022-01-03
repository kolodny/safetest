import concurrently from 'concurrently';
import getPort from 'get-port';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const port = await getPort();

console.log(`App starting at http://localhost:${port}`);

await concurrently(
  [
    {
      command: 'npm run build -- --watch --preserveWatchOutput',
      name: 'library',
      prefixColor: 'bgBlue.bold',
    },
    {
      command: 'npm start',
      name: 'app',
      prefixColor: 'bgMagenta.bold',
      cwd: __dirname + '/examples/create-react-app',
      env: {
        ...process.env,
        SKIP_PREFLIGHT_CHECK: true,
        PORT: port,
        BROWSER: 'none',
      },
    },
    {
      command: `npx wait-on http://localhost:${port} && npx chokidar './src/**/*.*' '${__dirname}/dist' --initial  -c 'npm run safetest:debug -- --watchAll=false'`,
      name: 'safetest',
      prefixColor: 'bgYellow.bold',
      cwd: __dirname + '/examples/create-react-app',
      env: {
        ...process.env,
        SKIP_PREFLIGHT_CHECK: true,
        BASE_URL: `http://localhost:${port}`,
        BROWSER: 'none',
      },
    },
  ],
  {
    killOthers: ['failure', 'success'],
  }
);
