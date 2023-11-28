const { setup } = require("safetest/setup");

setup({
  bootstrappedAt: require.resolve("./src/main.ts"),
  ciOptions: {
    usingArtifactsDir: "artifacts",
  },
});
