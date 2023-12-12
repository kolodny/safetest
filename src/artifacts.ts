import _ from 'lodash';
import { safeRequire } from './safe-require';
import { state } from './state';

import { FormattedTestResults } from '@jest/test-result';

const path = safeRequire('path');
const fs = safeRequire('fs');

const exists = async (path: string) => {
  return new Promise((resolve) => {
    fs.access(path, (err) => resolve(!err));
  });
};

const artifacts = state.artifacts;

type ArtifactType = typeof state.artifacts[number]['type'];
type Group = Partial<Record<ArtifactType, string[]>>;
type Grouped = Record<string, Group>;

type TestResults = FormattedTestResults['testResults'];
type FormattedTestResult = TestResults[number];
type AssertionResult = FormattedTestResult['assertionResults'][number];
export type MergedResults = Omit<FormattedTestResults, 'testResults'> & {
  testResults: Array<
    Omit<FormattedTestResult, 'assertionResults'> & {
      filename: string;
      assertionResults: Array<AssertionResult & { artifacts?: Group }>;
    }
  >;
};

export const collectArtifacts = async () => {
  const file = state.artifactsJson;
  const bootstrappedAt = path.dirname(require.resolve(state.bootstrappedAt));
  const testPath = path.relative(bootstrappedAt, state.testPath ?? '');

  if (file) {
    const byTest: Record<
      string,
      Array<{ type: ArtifactType; path: string }>
    > = {};

    for (const artifact of artifacts) {
      // Videos take a few ms to write to disk but we know they'll be there, hack to get around that race condition
      if (artifact.confirmed || (await exists(artifact.path))) {
        if (!byTest[artifact.test]) byTest[artifact.test] = [];
        const info = { type: artifact.type, path: artifact.path };
        byTest[artifact.test]?.push(info);
      }
    }

    const grouped: Grouped = {};
    for (const [test, artifacts] of Object.entries(byTest)) {
      const group: Group = (grouped[test] = {});
      const unique = _.uniqBy(artifacts, 'path');
      for (const artifact of unique) {
        if (!group[artifact.type]) group[artifact.type] = [];
        group[artifact.type]!.push(artifact.path);
      }
    }

    const relativeBootstrappedAt = path.relative(
      process.cwd(),
      state.bootstrappedAt
    );

    const json = {
      artifacts: { [testPath]: grouped },
      bootstrappedAt: relativeBootstrappedAt,
    };
    try {
      const contents = fs.readFileSync(path.resolve(file), 'utf-8');
      const existing = JSON.parse(contents);
      Object.assign(json.artifacts, existing.artifacts);
    } catch {}
    fs.writeFileSync(file, JSON.stringify(json, null, 2));
  }
};

export const mergeArtifacts = (
  bootstrappedAt: string,
  artifacts: Record<string, Grouped>,
  resultsJson: string
) => {
  const results: MergedResults = require(path.resolve(resultsJson));
  const resultsFilenames = results.testResults.map((r) => r.name);
  const artifactsFilenames = Object.keys(artifacts ?? {});
  const prefix = resultsFilenames
    .flatMap((f) =>
      artifactsFilenames.map((a) =>
        f.endsWith(a) ? f.slice(0, -a.length) : null
      )
    )
    .filter(Boolean)[0];

  for (const file of results.testResults) {
    const filename = file.name.slice(prefix?.length ?? 0);
    file.filename = filename;

    const actuallyBootstrappedAt = path.resolve(bootstrappedAt);
    const relativeBootstrappedAt = path.relative('.', actuallyBootstrappedAt);
    const relativeBootstrapDir = path.dirname(relativeBootstrappedAt);
    const relativeFilename = path.join(relativeBootstrapDir, filename);

    for (const assertionResult of file.assertionResults) {
      const { ancestorTitles } = assertionResult;
      if (ancestorTitles[0] === '') ancestorTitles.shift();
      const parts = [...ancestorTitles, assertionResult.title];
      const full1 = parts.join(' ');
      const full2 = relativeFilename + ' > ' + parts.join(' > ');
      const fileArtifacts = artifacts[filename];
      const testArtifacts = fileArtifacts?.[full1] ?? fileArtifacts?.[full2];
      if (testArtifacts) {
        assertionResult.artifacts = testArtifacts;
      }
    }
  }
  fs.writeFileSync(resultsJson, JSON.stringify(results, null, 2));
};
