const { setup } = require("safetest/setup");

setup({
  api: {
    beforeAll,
    setTimeout: (ms) => jest.setTimeout(ms),
  },
  options: {
    ciOptions: {
      usingArtifactsDir: "../../build/angular-app/artifacts",
    },
  },
});
