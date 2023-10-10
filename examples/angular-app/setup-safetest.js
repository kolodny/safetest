const { setup } = require("safetest/setup");

jest.setTimeout(30000);

setup({
  bootstrappedAt: require.resolve("./src/main.ts"),
  ciOptions: {
    usingArtifactsDir: "artifacts",
  },
});
