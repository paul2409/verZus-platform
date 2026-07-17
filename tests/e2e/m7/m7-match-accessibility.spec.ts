// VERZUS M7.8 MATCH OPERATIONS ACCESSIBILITY

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const route of [
  "/matches/m7-preview?state=check-in-open",
  "/matches/m7-preview?state=submit-result",
  "/matches/m7-preview?state=disputed",
  "/matches/m7-preview?access=maintenance",
]) {
  test(`${route} has no serious or critical accessibility violations`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator('[data-m7-release="7.8"]')).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    const severe = results.violations.filter(
      ({ impact }) => impact === "serious" || impact === "critical",
    );
    expect(severe).toEqual([]);
  });
}

test("keyboard focus leaves the document body", async ({ page }) => {
  await page.goto("/matches/m7-preview?state=check-in-open");
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => document.activeElement?.tagName);
  expect(focused).not.toBe("BODY");
});
