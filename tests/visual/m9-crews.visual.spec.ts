// VERZUS M9.8 OPTIONAL CREW VISUAL REGRESSION

import { expect, test } from "@playwright/test";

const cases = [
  ["profile", "/crews/crew-xenon-esports"],
  ["no-crew", "/crews?membership=none"],
  ["discovery", "/crews?view=discover&membership=none"],
  ["creation", "/crews/create?membership=none&step=basics"],
  ["activity-error", "/crews/crew-xenon-esports?resource=activity&scenario=error"],
  ["suspended", "/crews/crew-xenon-esports?lifecycleScenario=suspended"],
] as const;

for (const [name, route] of cases) {
  test(`${name} approved composition`, async ({ page }) => {
    await page.goto(route);
    await page.addStyleTag({
      content:
        "*, *::before, *::after { animation: none !important; transition: none !important; }",
    });
    await expect(page.locator("main").first()).toBeVisible();
    await expect(page).toHaveScreenshot(`m9-${name}.png`, {
      animations: "disabled",
      fullPage: true,
    });
  });
}
