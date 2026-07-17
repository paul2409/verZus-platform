// VERZUS M8.10.2 DESKTOP LEADERBOARD POLISH PLAYWRIGHT CONFIG

import { defineConfig, devices } from "@playwright/test";

const port = 3120;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/e2e/m8",
  testMatch: "m8-leaderboard-desktop-polish.spec.ts",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    viewport: { width: 1440, height: 900 },
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run m8:preview",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_APP_ENV: "test",
      NEXT_PUBLIC_API_BASE_URL: `${baseURL}/api`,
      NEXT_PUBLIC_ENABLE_MOCKS: "true",
      NEXT_PUBLIC_RELEASE_SHA: "m8-10-2-polish",
    },
  },
});
