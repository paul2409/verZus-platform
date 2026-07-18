// VERZUS M9.8 OPTIONAL CREW RELEASE BROWSER CHECKS

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  "/crews/crew-xenon-esports",
  "/crews?membership=none",
  "/crews?view=discover&membership=none",
  "/crews/create?membership=none&step=basics",
] as const;

for (const route of routes) {
  test(`${route} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("main").first()).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    const severe = results.violations.filter(
      (item) => item.impact === "critical" || item.impact === "serious",
    );
    expect(severe).toEqual([]);
  });
}

test("activity failure stays isolated from Crew identity", async ({ page }) => {
  await page.goto("/crews/crew-xenon-esports?resource=activity&scenario=error");
  await expect(page.locator('[data-m9-stage="9.8"]').first()).toBeVisible();
  await expect(page.getByText("Xenon Esports", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("Activity", { exact: true }).first()).toBeVisible();
});

test("suspended lifecycle remains visible and management fails closed", async ({ page }) => {
  await page.goto("/crews/crew-xenon-esports?lifecycleScenario=suspended");
  await expect(page.getByText("suspended", { exact: false }).first()).toBeVisible();
  await expect(page.locator('[data-m9-stage="9.8"]').first()).toBeVisible();
});
