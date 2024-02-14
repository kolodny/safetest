/// <reference types="vitest" />

import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    globals: true,
    testTimeout: 30000,
    reporters: ["basic", "json"],
    outputFile: "results.json",
    setupFiles: ["setup-safetest"],
    include: ["**/*.safetest.?(c|m)[jt]s?(x)"],
    poolOptions: {
      threads: {
        singleThread: process.env.CI ? false : true,
      },
    },
    inspect: process.env.CI ? false : true,
  },
});
