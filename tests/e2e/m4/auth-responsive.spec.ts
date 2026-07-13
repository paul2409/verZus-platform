// VERZUS M4 STEP 4.11

import { expect, test } from "@playwright/test";

const widths = [360, 390, 430, 768, 1024, 1440];
const routes = [
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/session-expired",
];

for (const width of widths) {
  for (const route of routes) {
    test(`${route} has no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({
        width,
        height: 900,
      });

      await page.goto(route);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );

      expect(overflow).toBeLessThanOrEqual(1);
    });
  }
}
