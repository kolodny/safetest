import "@testing-library/jest-dom";
import { setup } from "safetest/setup";

setup({
  bootstrappedAt: require.resolve("./src/index.tsx"),
});
