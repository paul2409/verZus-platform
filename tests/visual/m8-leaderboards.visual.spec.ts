// VERZUS M8.10 LEADERBOARD VISUAL REGRESSION

import { expect, test } from "@playwright/test";

const cases = [
  ["weekly", "/leaderboards/weekly"],
  ["player-intel", "/leaderboards/weekly?intel=player&entityId=player-prismo"],
  ["crew-intel", "/leaderboards/weekly?intel=crew&entityId=crew-xenon"],
  ["match-intel", "/leaderboards/weekly?intel=match&entityId=match-player-prismo"],
] as const;

for (const [name, route] of cases) {
  test(`${name} approved composition`, async ({ page }) => {
    await page.goto(route);
    await page.addStyleTag({
      content: `
        *, *::before, *::after { animation: none !important; transition: none !important; }
        [class*="intelResourceMeta"] { visibility: hidden !important; }
      `,
    });
    await expect(page.locator('[data-m8-stage="8.10"]')).toBeVisible();
    if (name !== "weekly") await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page).toHaveScreenshot(`m8-${name}.png`, {
      animations: "disabled",
      fullPage: true,
    });
  });
}
