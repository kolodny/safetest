#! /usr/bin/env node

import { Command } from 'commander';
import { buildDocker } from './docker';
import { readdir, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';

const pkg = require('../package.json');

const program = new Command();

program
  .name('safetest')
  .description('CLI helpers for safetest')
  .version(pkg.version);

program
  .command('cache-build-docker')
  .description(
    'Builds the safetest docker image so that it will be cached when running tests'
  )
  .action(buildDocker);

program
  .command('collect-artifacts')
  .description('Collect artifacts of the current test run')
  .argument(
    '<artifacts-json>',
    'artifacts json sources to collect - ie what you passed as `--artifacts-json`'
  )
  .argument('[destination]', 'artifacts json file to save collected artifacts')
  .action(async (src, dest) => {
    const dir = await readdir(dirname(src));
    const artifacts = dir.filter((f) => f.startsWith(`${src}_`));
    const collected = {};
    for (const artifact of artifacts) {
      const data = require(resolve(artifact));
      Object.assign(collected, data);
    }
    dest = dest || `${src}.json`;
    await writeFile(dest, JSON.stringify(collected, null, 2));
  });

program.parse();
