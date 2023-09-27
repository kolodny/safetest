import type { MatchImageSnapshotOptions } from 'jest-image-snapshot';
import { merge } from 'lodash';
import { safeRequire } from './safe-require';
import { state } from './state';

const exists = async (path: string) => {
  const fs = safeRequire('fs');
  return new Promise((resolve) => {
    fs.access(path, (err) => resolve(!err));
  });
};

export const configureSnapshot = (expect: jest.Expect) => {
  const artifacts = state.artifacts;
  const common: MatchImageSnapshotOptions = {
    customSnapshotsDir: './__image_snapshots__',
    customSnapshotIdentifier: (parameters) =>
      `${parameters.defaultIdentifier.replace(/-\d+$/, '')}-${
        parameters.counter
      }-snap`,
  };

  expect.extend({
    toMatchImageSnapshot: function (
      received: Buffer,
      options: MatchImageSnapshotOptions
    ) {
      const mergedOptions = merge(
        common,
        state.options.matchImageSnapshotOptions,
        options
      );

      const customSnapshotIdentifier = mergedOptions.customSnapshotIdentifier;
      mergedOptions.customSnapshotIdentifier = (parameters) => {
        const test = expect.getState().currentTestName ?? '<unknown>';
        if (typeof customSnapshotIdentifier === 'function') {
          const id = customSnapshotIdentifier!(parameters);
          const path = safeRequire('path');
          const SNAPSHOTS_DIR = '__image_snapshots__';

          const snapshotsDir =
            mergedOptions.customSnapshotsDir ?? SNAPSHOTS_DIR;
          const receivedPostfix =
            mergedOptions.customReceivedPostfix ?? '-received';
          const receivedDir =
            mergedOptions.customReceivedDir ??
            path.join(snapshotsDir, '__received_output__');
          const received = path.join(
            receivedDir,
            `${id}${receivedPostfix}.png`
          );
          const diffDir =
            mergedOptions.customDiffDir ??
            path.join(snapshotsDir, '__diff_output__');

          const diff = path.join(diffDir, `${id}-diff.png`);
          const snapshot = path.join(snapshotsDir, `${id}.png`);
          artifacts.push({ type: 'snapshot', test, path: snapshot });
          artifacts.push({ type: 'received', test, path: received });
          artifacts.push({ type: 'diff', test, path: diff });

          return id;
        }
        return customSnapshotIdentifier!;
      };
      const { toMatchImageSnapshot } = safeRequire('jest-image-snapshot');
      return (toMatchImageSnapshot as any).call(this, received, mergedOptions);
    },
  });
};
