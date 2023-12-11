#! /usr/bin/env node

import { Command } from 'commander';
import { buildDocker } from './docker';
import { readdir, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { mergeArtifacts } from './artifacts';

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
  .command('add-artifact-info')
  .description('Adds artifact info to a json results file')
  .argument('<artifactsJson>', 'json source you want to add to destination')
  .argument('<resultsJson>', 'existing json results file to add to')
  .action(async (artifactsJson, resultsJson) => {
    const artifacts = require(resolve(artifactsJson));
    mergeArtifacts(artifacts.bootstrappedAt, artifacts.artifacts, resultsJson);
    // Object.assign(existing, artifacts);

    // await writeFile(results, JSON.stringify(results, null, 2));
  });

program.parse();
