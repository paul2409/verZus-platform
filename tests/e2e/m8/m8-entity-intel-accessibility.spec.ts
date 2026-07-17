// VERZUS M8.10 ENTITY INTEL ACCESSIBILITY E2E

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const kind of ["player", "crew", "match"] as const) {
  test(`${kind} intel has no serious or critical accessibility violations`, async ({ page }) => {
    await page.goto(
      `/leaderboards/weekly?intel=${kind}&entityId=${
        kind === "player" ? "player-prismo" : kind === "crew" ? "crew-xenon" : "match-player-prismo"
      }`,
    );
    await expect(page.getByRole("dialog")).toBeVisible();

    const results = await new AxeBuilder({ page })
      .disableRules(["color-contrast-enhanced"])
      .analyze();
    const severe = results.violations.filter(
      (item) => item.impact === "critical" || item.impact === "serious",
    );
    expect(severe).toEqual([]);
  });
}
