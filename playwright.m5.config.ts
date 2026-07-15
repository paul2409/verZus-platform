// VERZUS M5 STEPS 5.9-5.13

import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.M5_PORT ?? 3112);
const baseURL = `http://127.0.0.1:${port}`;

const project = (
  name: string,
  width: number,
  height: number,
  device = devices["Desktop Chrome"],
) => ({
  name,
  use: {
    ...device,
    viewport: { width, height },
  },
});

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [["line"], ["html", { open: "never", outputFolder: "reports/m5-playwright" }]]
    : [["list"], ["html", { open: "never", outputFolder: "reports/m5-playwright" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    project("mobile-360", 360, 800),
    project("mobile-390", 390, 844, devices["iPhone 13"]),
    project("mobile-430", 430, 932),
    project("tablet-768", 768, 1024),
    project("tablet-1024", 1024, 900),
    project("desktop-1440", 1440, 1000),
  ],
  webServer: {
    command: `npm run dev -- --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_APP_ENV: "test",
      NEXT_PUBLIC_API_BASE_URL: `${baseURL}/api`,
      NEXT_PUBLIC_ENABLE_MOCKS: "true",
      NEXT_PUBLIC_ENABLE_M5_PLAY_COMMAND_CENTER: "true",
      NEXT_PUBLIC_RELEASE_SHA: process.env.GITHUB_SHA ?? "m5-e2e",
    },
  },
});
