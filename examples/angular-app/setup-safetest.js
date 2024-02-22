const { setup } = require("safetest/setup");

setup({
  bootstrappedAt: require.resolve("./src/main.ts"),
  url: "http://localhost:4200/angular-app",
  headless: false,
  ciOptions: {
    usingArtifactsDir: "artifacts",
  },
});
