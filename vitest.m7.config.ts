// VERZUS M7.8 VITEST CONFIGURATION

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: [
      "src/features/matches/operations/**/*.test.{ts,tsx}",
      "tests/integration/m7-*.test.{ts,tsx}",
    ],
    exclude: ["tests/e2e/**", ".next/**", "node_modules/**"],
  },
});
