// VERZUS M6.7 COMPETITION FAILURE INJECTION

import { expect, test } from "@playwright/test";

const scenarios = [
  "registration_closed",
  "waitlist",
  "not_eligible",
  "full_capacity",
  "cancelled",
  "offline",
  "partial_failure",
  "unauthorized",
  "forbidden",
  "not_found",
  "maintenance",
] as const;

for (const scenario of scenarios) {
  test(`${scenario} is controlled and keeps the route boundary alive`, async ({ page }) => {
    await page.goto(`/compete/ea-fc-rookie-cup?scenario=${scenario}`);
    await expect(page.locator('[data-m6-release="6.7"]')).toBeVisible();
    await expect(page.locator("body")).not.toContainText("Application error");
    await expect(page.locator("body")).not.toContainText("Unhandled Runtime Error");
  });
}
