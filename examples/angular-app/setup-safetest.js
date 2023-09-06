const { setup } = require("safetest/setup");

jest.setTimeout(30000);

setup({
  ciOptions: {
    usingArtifactsDir: "../../build/angular-app/artifacts",
  },
});
