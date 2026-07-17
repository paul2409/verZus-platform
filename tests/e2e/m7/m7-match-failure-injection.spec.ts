// VERZUS M7.8 MATCH OPERATIONS FAILURE INJECTION

import { expect, test } from "@playwright/test";

const references = [
  "/matches/m7-preview?access=unauthorized",
  "/matches/m7-preview?access=forbidden",
  "/matches/m7-preview?access=not_found",
  "/matches/m7-preview?access=maintenance",
  "/matches/m7-preview?state=in-progress&availability=offline",
  "/matches/m7-preview?state=in-progress&availability=stale",
  "/matches/m7-preview?state=in-progress&resource=timeline&scenario=partial_failure",
  "/matches/m7-preview?state=in-progress&crash=timeline",
] as const;

for (const route of references) {
  test(`${route} remains controlled`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator('[data-m7-release="7.8"]')).toBeVisible();
    await expect(page.locator("body")).not.toContainText("Application error");
    await expect(page.locator("body")).not.toContainText("Unhandled Runtime Error");
  });
}
