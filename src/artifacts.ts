import { safeRequire } from './safe-require';
import { state } from './state';

const path = safeRequire('path');
const fs = safeRequire('fs');

const exists = async (path: string) => {
  return new Promise((resolve) => {
    fs.access(path, (err) => resolve(!err));
  });
};

const artifacts = state.artifacts;

export const collectArtifacts = async () => {
  const file = state.artifactsJson;
  const bootstrappedAt = path.dirname(require.resolve(state.bootstrappedAt));
  const testPath = path.relative(bootstrappedAt, state.testPath ?? '');

  if (file) {
    const byTest: Record<
      string,
      Array<{ type: typeof state.artifacts[number]['type']; path: string }>
    > = {};

    for (const artifact of artifacts) {
      // Videos take a few ms to write to disk but we know they'll be there, hack to get around that race condition
      if (artifact.confirmed || (await exists(artifact.path))) {
        if (!byTest[artifact.test]) byTest[artifact.test] = [];
        const info = { type: artifact.type, path: artifact.path };
        byTest[artifact.test]?.push(info);
      }
    }

    const bootstrappedAt = path.relative(process.cwd(), state.bootstrappedAt);

    const json = { artifacts: { [testPath]: byTest }, bootstrappedAt };
    try {
      const contents = fs.readFileSync(path.resolve(file), 'utf-8');
      const existing = JSON.parse(contents);
      Object.assign(json.artifacts, existing.artifacts);
    } catch {}
    fs.writeFileSync(file, JSON.stringify(json, null, 2));
  }
};
