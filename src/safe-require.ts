import { anythingProxy } from './anythingProxy';
import { isInNode } from './is-in-node';

type Module = {
  assert: typeof import('assert');
  async_hooks: typeof import('async_hooks');
  buffer: typeof import('buffer');
  child_process: typeof import('child_process');
  cluster: typeof import('cluster');
  console: typeof import('console');
  constants: typeof import('constants');
  crypto: typeof import('crypto');
  dgram: typeof import('dgram');
  dns: typeof import('dns');
  domain: typeof import('domain');
  events: typeof import('events');
  fs: typeof import('fs');
  http: typeof import('http');
  http2: typeof import('http2');
  https: typeof import('https');
  inspector: typeof import('inspector');
  module: typeof import('module');
  net: typeof import('net');
  os: typeof import('os');
  path: typeof import('path');
  perf_hooks: typeof import('perf_hooks');
  process: typeof import('process');
  playwright: typeof import('playwright');
  punycode: typeof import('punycode');
  querystring: typeof import('querystring');
  readline: typeof import('readline');
  repl: typeof import('repl');
  stream: typeof import('stream');
  string_decoder: typeof import('string_decoder');
  timers: typeof import('timers');
  tls: typeof import('tls');
  trace_events: typeof import('trace_events');
  tty: typeof import('tty');
  url: typeof import('url');
  util: typeof import('util');
  v8: typeof import('v8');
  vm: typeof import('vm');
  wasi: typeof import('wasi');
  worker_threads: typeof import('worker_threads');
  zlib: typeof import('zlib');
};

/** Node require function, will return an `anything` proxy in the browser */
export type SafeRequire = { resolve: typeof require.resolve } & (<
  T extends keyof Module | (string & { _?: 0 })
>(
  t: T
) => T extends keyof Module ? Module[T] : any);

const nodeRequire = // @ts-ignore
  !isInNode || typeof __webpack_require__ === 'function'
    ? anythingProxy
    : require;

/** Node require function, will return an `anything` proxy in the browser */
export const safeRequire: SafeRequire = isInNode
  ? // eslint-disable-next-line no-eval
    nodeRequire
  : anythingProxy;
