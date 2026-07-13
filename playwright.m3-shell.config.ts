// VERZUS M3 STEP 3.7

import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.M3_SHELL_AUDIT_BASE_URL ?? "http://127.0.0.1:3103";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /m3-shell-audit\.spec\.ts/,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  ...(process.env.CI ? { workers: 1 } : {}),
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  reporter: process.env.CI
    ? [
        ["line"],
        [
          "html",
          {
            open: "never",
            outputFolder: "artifacts/m3-shell-audit-report",
          },
        ],
      ]
    : [["line"]],
  outputDir: "artifacts/m3-shell-audit-results",
  use: {
    baseURL,
    colorScheme: "dark",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    contextOptions: {
      reducedMotion: "reduce",
    },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 3103",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
