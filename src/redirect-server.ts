import http from 'http';
import { once } from 'lodash';
import playwright from 'playwright';
import * as WS from 'ws';
import inspector from 'inspector';
import console from 'console';
// @ts-ignore
// import r2 from 'r2';

import { overrideEvents } from './override-events';
import { state } from './state';
import { setOptions } from './set-options';
import { Deferred, deferred } from './defer';
import { parsed } from './jest-setup';
import { safeRequire } from './safe-require';

const myIp = process.env['MY_IP'];

const makeWarning = (msg: string) => {
  let warnOnce = false;
  return (console: Console) => {
    if (warnOnce) return;
    warnOnce = true;
    console.warn(msg);
  };
};

const warn = makeWarning(
  'Remote viewing session detected, monkey patching page actions to allow screen casting without breaking playwright events.'
);

const wss = new WS.Server({ noServer: true });
const getAllSockets = () => {
  const webSockets: WS.WebSocket[] = [];
  wss.clients.forEach(function each(webSocket) {
    if (webSocket.readyState === WS.OPEN) {
      webSockets.push(webSocket);
    }
  });
  return webSockets;
};
let lastTest = '';

const defers = new Map<string, Deferred>();
defers.set('INITIAL', deferred());

let latestDefer = defers.get('INITIAL')!;
let viewUrl = '';

const debugInfo = async () => {
  const inspectorUrl = inspector.url();
  if (!inspectorUrl) return;
  const port = new URL(inspectorUrl).port;
  const r2 = safeRequire('r2');
  console.log('r2', r2);
  const response = await r2(`http://127.0.0.1:${port}/json/list`);
  const list = await response.json;
  const rawUrl = list[0].devtoolsFrontendUrl;
  if (!rawUrl) return {};
  const url = new URL(rawUrl);
  const ws = url.searchParams.get('ws')?.split(':');
  if (!ws) return {};
  const fixedWs = [myIp || ws[0], ws[1]].join(':');
  url.searchParams.set('ws', fixedWs);

  return { nodeDebugUrl: `${url}` };
};

export const notify = async (tabId: number, url: string) => {
  const payload = JSON.stringify({ tabId, url, ...(await debugInfo()) });
  if (tabId === 0) lastTest = url;
  const key = `${tabId}:${url}`;
  latestDefer = deferred();
  defers.set(key, latestDefer);
  for (const webSocket of getAllSockets()) webSocket.send(payload);
  return latestDefer.promise;
};

export const openLocalBrowser = async (url: string) => {
  const localBrowser = await playwright.chromium?.launch({
    headless: false,
  });
  const debugUrl = new URL(url);
  if (debugUrl.hostname === 'localhost') debugUrl.hostname = '127.0.0.1';
  debugUrl.port = `${state.debugPort}`;
  const context = await localBrowser.newContext({
    storageState: {
      cookies: [],
      origins: [
        {
          origin: `${debugUrl}`,
          localStorage: [{ name: 'panel-selectedTab', value: '"console"' }],
        },
      ],
    },
  });
  const page = await context.newPage();
  await page.goto(`${url}?tab=0`);

  setOptions({ afterAllDone: () => localBrowser.close() });
};

export const startServer = once(async () => {
  const indexHTML = `
    <style>
      html, body { height: 100%; width: 100%; padding: 0; margin: 0; }
      body { display: flex; flex-direction: column; }
      iframe { flex-grow: 1; padding: 0; margin: 0; border: 0 }
    </style>
    <div style="font-family: monospace; background: #ddd" id=nodeDebugUrl></div>
    <iframe id=iframe></iframe>
    <script>
      let webSocket;
      const tabId = +new URL(location).searchParams.get('tab');
      const connect = () => {
        webSocket = new WebSocket('ws://' + window.location.hostname + ':8844/');
        webSocket.addEventListener('open', () => {
          console.log('connected');
        });
        webSocket.addEventListener('message', (event) => {
          const data = JSON.parse(event.data);
          console.log('Message from server ', data);
          if (data.nodeDebugUrl) {
            nodeDebugUrl.style.padding = '10px';
            nodeDebugUrl.innerHTML = \`Node Devtools UI: <span style="user-select: all;background: #aaa;padding: 5px;">\${data.nodeDebugUrl}</span>\`;
          }
          if (data.tabId === tabId) {
            iframe.src = data.url;
            const key = [data.tabId, data.url].join(':');
            webSocket.send(JSON.stringify({ received: key }));
          }
        });
        webSocket.addEventListener('close', (event) => {
          console.log('Socket is closed. Reconnect will be attempted in 1 second.', event.reason);
          setTimeout(connect);
        });
      };
      connect();
    </script>
  `;
  await new Promise<http.Server>(async (resolve) => {
    const server = http.createServer((_req, response) => {
      warn(console);
      state.options.enableScreenCasting = true;
      for (const page of state.browserContextInstance?.pages() ?? []) {
        overrideEvents(page);
      }
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end(indexHTML);
    });

    server.once('error', () => {
      console.warn(
        'Failed to start server, you need to connect directly to the debug port to remote view.'
      );
      resolve(server);
    });
    const host = !!parsed['ci'] ? '0.0.0.0' : '127.0.0.1';
    server.listen(8844, host, () => resolve(server));
    const sockets: any[] = [];
    server.on('connection', (socket) => sockets.push(socket));
    server.on('upgrade', function upgrade(request, socket, head) {
      wss.handleUpgrade(request, socket, head, async (ws) => {
        state.options.enableScreenCasting = true;
        for (const page of state.browserContextInstance?.pages() ?? []) {
          overrideEvents(page);
        }
        warn(console);
        if (lastTest) {
          const url = lastTest;
          const payload = JSON.stringify({
            tabId: 0,
            url,
            ...(await debugInfo()),
          });
          ws.send(payload);
        }
        defers.get('INITIAL')?.resolve();
        ws.addEventListener('message', (event) => {
          const data = JSON.parse(`${event.data}`);
          defers.get(data.received)?.resolve();
          defers.delete(data.received);
        });
      });
    });

    setOptions({
      afterAllDone: async () => {
        for (const s of sockets) s.destroy();
        for (const ws of getAllSockets()) ws.close();
        wss.close();
        server?.close?.();
      },
    });
  });

  viewUrl = `http://${myIp || '127.0.0.1'}:8844/`;
});

export const waitForInitialConnection = () => defers.get('INITIAL')?.promise;
export const waitForLatestConnection = () => latestDefer?.promise;
export const getViewUrl = () => viewUrl;
