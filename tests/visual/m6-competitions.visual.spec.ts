// VERZUS M6.7 COMPETITION VISUAL REGRESSION

import { expect, test } from "@playwright/test";

const references = [
  ["discovery-normal", "/compete"],
  ["discovery-empty", "/compete?scenario=empty"],
  ["detail-normal", "/compete/ea-fc-rookie-cup"],
  ["entry-closed", "/compete/ea-fc-rookie-cup?scenario=registration_closed"],
  ["waitlist", "/compete/ea-fc-rookie-cup?scenario=waitlist"],
  ["partial-failure", "/compete/ea-fc-rookie-cup?scenario=partial_failure"],
  ["offline", "/compete/ea-fc-rookie-cup?scenario=offline"],
  ["maintenance", "/compete/ea-fc-rookie-cup?scenario=maintenance"],
] as const;

for (const [name, route] of references) {
  test(`${name} visual baseline`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator('[data-m6-release="6.7"]')).toBeVisible();
    await page.addStyleTag({
      content:
        "*,*::before,*::after{animation-duration:0s!important;transition:none!important;caret-color:transparent!important}",
    });
    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.01,
    });
  });
}
