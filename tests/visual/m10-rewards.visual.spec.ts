// VERZUS M10.8 OPTIONAL REWARD VISUAL REGRESSION

import { expect, test } from "@playwright/test";

const cases = [
  { name: "overview", path: "/rewards" },
  { name: "no-rewards", path: "/rewards?resource=inventory&scenario=empty" },
  { name: "claim-failure", path: "/rewards?claimScenario=error" },
  {
    name: "achievement-detail",
    path: "/rewards?achievement=achievement-weekly-warrior#achievement-detail",
  },
  { name: "widget-isolation", path: "/rewards?widget=inventory&widgetScenario=crash" },
] as const;

for (const item of cases) {
  test(`${item.name} visual`, async ({ page }, testInfo) => {
    await page.goto(item.path);
    await page.getByRole("heading", { level: 1, name: "Rewards" }).waitFor();
    await expect(page).toHaveScreenshot(`m10-${item.name}-${testInfo.project.name}.png`, {
      animations: "disabled",
      fullPage: true,
    });
  });
}
