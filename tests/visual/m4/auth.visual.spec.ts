// VERZUS M4 STEP 4.11

import { expect, test } from "@playwright/test";

const approved = process.env.M4_REFERENCES_APPROVED === "true";

const routes = [
  ["login", "/login"],
  ["register", "/register"],
  ["verify-email", "/verify-email"],
  ["forgot-password", "/forgot-password"],
  ["reset-password", "/reset-password"],
  ["session-expired", "/session-expired"],
] as const;

test.describe("M4 approved-reference visual regression", () => {
  test.skip(!approved, "Visual baselines cannot be approved before reference approval.");

  for (const [name, route] of routes) {
    test(`${name} mobile 390`, async ({ page }) => {
      await page.setViewportSize({
        width: 390,
        height: 844,
      });
      await page.goto(route);
      await expect(page).toHaveScreenshot(`${name}-mobile-390.png`, {
        fullPage: true,
      });
    });

    test(`${name} desktop 1440`, async ({ page }) => {
      await page.setViewportSize({
        width: 1440,
        height: 1000,
      });
      await page.goto(route);
      await expect(page).toHaveScreenshot(`${name}-desktop-1440.png`, {
        fullPage: true,
      });
    });
  }
});
