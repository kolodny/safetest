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
  .command('merge-json')
  .description('Merge multiple json objects')
  .argument('<destination>', 'existing file to merge into')
  .argument('<jsons...>', 'json source you want to add to destination')
  .action(async (dest, jsons) => {
    const existing = require(resolve(dest));
    for (const json of jsons) {
      const data = require(resolve(json));
      Object.assign(existing, data);
    }

    await writeFile(dest, JSON.stringify(existing, null, 2));
  });

program.parse();
