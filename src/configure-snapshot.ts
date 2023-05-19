import type { MatchImageSnapshotOptions } from 'jest-image-snapshot';
import { merge } from 'lodash';
import { safeRequire } from './safe-require';
import { state } from './state';

export const configureSnapshot = (expect: jest.Expect) => {
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
      const { toMatchImageSnapshot } = safeRequire('jest-image-snapshot');
      return (toMatchImageSnapshot as any).call(this, received, mergedOptions);
    },
  });
};
