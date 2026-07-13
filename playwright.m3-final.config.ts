// VERZUS M3 STEP 3.8

import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.M3_FINAL_BASE_URL ?? "http://127.0.0.1:3104";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /m3-shell-navigation\.spec\.ts/,
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
            outputFolder: "artifacts/m3-final-report",
          },
        ],
      ]
    : [["line"]],
  outputDir: "artifacts/m3-final-results",
  use: {
    baseURL,
    colorScheme: "dark",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
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
    command: "npm run start -- --hostname 127.0.0.1 --port 3104",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
