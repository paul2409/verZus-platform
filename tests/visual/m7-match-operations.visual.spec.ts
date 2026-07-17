// VERZUS M7.8 MATCH OPERATIONS VISUAL REGRESSION

import { expect, test } from "@playwright/test";

const states = [
  "scheduled",
  "check-in-unavailable",
  "check-in-open",
  "checked-in",
  "opponent-not-checked-in",
  "both-ready",
  "lobby-open",
  "in-progress",
  "submit-result",
  "awaiting-opponent-confirmation",
  "result-confirmed",
  "disputed",
  "forfeit",
  "cancelled",
  "completed",
] as const;

for (const state of states) {
  test(`${state} visual baseline`, async ({ page }) => {
    await page.goto(`/matches/m7-preview?state=${state}`);
    await expect(page.locator('[data-m7-release="7.8"]')).toBeVisible();
    await page.addStyleTag({
      content:
        "*,*::before,*::after{animation-duration:0s!important;transition:none!important;caret-color:transparent!important}",
    });
    await expect(page).toHaveScreenshot(`${state}.png`, {
      fullPage: true,
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.01,
    });
  });
}
