// VERZUS M4 STEP 4.11

import { defineConfig, mergeConfig } from "vitest/config";

import baseConfig from "./vitest.config";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ["src/**/*.test.{ts,tsx}", "tests/integration/m4/**/*.test.{ts,tsx}"],
    },
  }),
);
