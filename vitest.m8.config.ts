// VERZUS M8.10 VITEST CONFIGURATION

import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: [
      "src/features/leaderboards/release/**/*.test.ts",
      "src/features/leaderboards/telemetry/**/*.test.ts",
      "tests/integration/m8-*.test.ts",
    ],
  },
});
