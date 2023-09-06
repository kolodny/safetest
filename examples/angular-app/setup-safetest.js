const { setup } = require("safetest/setup");

setup({
  ciOptions: {
    usingArtifactsDir: "../../build/angular-app/artifacts",
  },
});
