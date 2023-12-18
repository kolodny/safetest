#! /usr/bin/env node

import { Command } from 'commander';
import { buildDocker } from './docker';
import { sync } from 'glob';
import { dirname, relative, resolve } from 'path';
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
  .command('generate-import-map')
  .description(
    'Generates the import map for safetest spec files for build systems without globbing support'
  )
  .argument('<bootstrappedAt>', 'source file that safetest is bootstrapped at')
  .argument('<folder>', 'folder to search for spec files')
  .argument(
    '[glob]',
    'glob to use for searching for spec files',
    '**/*.safetest.{j,t}s{,x}'
  )
  .action(async (bootstrappedAt, folder, glob) => {
    const relativeBootstrappedAt = resolve(process.cwd(), bootstrappedAt);
    const bootstrappedDir = dirname(relativeBootstrappedAt);
    const files = sync(glob, { cwd: folder, absolute: true });

    let imports = 'export const imports = {\n';
    for (const file of files) {
      const relativeFile = relative(bootstrappedDir, file);
      let name = `${relativeFile.replace(/\.m?[tj]sx?/, '')}`;
      if (!name.startsWith('.')) name = `./${name}`;
      imports += `  '${name}': () => import('${name}'),\n`;
    }
    imports += '};\n';
    console.log(imports);
  });

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
