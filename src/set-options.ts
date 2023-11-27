import merge from 'deepmerge';
import { RenderOptions } from './render';
import { safeRequire } from './safe-require';

import { state } from './state';

/**
 * Global render options; overrides any options passed to `render()` call.
 * Pass in `undefined` to reset to default.
 */
export const setOptions = (
  options?: RenderOptions & { afterAllDone?: () => Promise<void> }
) => {
  if (options?.hooks?.afterTest) {
    options.hooks.afterTest = options.hooks.afterTest.map((fn) => {
      (fn as any).__isGlobal = true;
      return fn;
    });
  }
  let ciOptions = options?.ciOptions;
  const usingArtifactsDir = (ciOptions as any)?.usingArtifactsDir;
  if (state.isCi && usingArtifactsDir) {
    ciOptions = {
      failureScreenshotsDir: `${usingArtifactsDir}/failure_screenshots`,
      recordVideo: { dir: `${usingArtifactsDir}/videos` },
      recordTraces: `${usingArtifactsDir}/trace`,
      matchImageSnapshotOptions: {
        customDiffDir: `${usingArtifactsDir}/image_diffs`,
        storeReceivedOnFailure: true,
        customReceivedDir: `${usingArtifactsDir}/updated_snapshots`,
        failureThreshold: 0,
      },
    };
  }
  if (options && ciOptions && state.isCi) {
    options = merge(options, ciOptions as any);
    if ((ciOptions as any).recordVideo) {
      const afterTest = options.hooks?.afterTest;
      afterTest?.push(() => new Promise((r) => setTimeout(r, 750)));
    }
  }
  const recordTraces = options?.recordTraces;
  if (recordTraces) {
    const { cpSync, mkdirSync } = safeRequire('fs');
    const { dirname, resolve } = safeRequire('path');
    // eslint-disable-next-line no-eval
    const r = eval('require');
    const playwrightDir = dirname(r.resolve('playwright-core/package.json'));
    const trace = resolve(playwrightDir, 'lib/webpack/traceViewer');
    try {
      cpSync(trace, recordTraces, { recursive: true });
      mkdirSync(`${recordTraces}/traces`);
    } catch {} // This may already exist
  }
  if (options?.afterAllDone) {
    state.afterAllsDone.push(options.afterAllDone);
    delete options.afterAllDone;
  }
  state.options = !options ? {} : merge(state.options ?? {}, options);
};

export const getOptions = () => state.options;
