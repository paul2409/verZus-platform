// VERZUS M8.10.2 DESKTOP LEADERBOARD POLISH E2E

import { expect, test } from "@playwright/test";

test.describe("M8.10.2 desktop leaderboard polish", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("fits the table without horizontal scrolling and keeps rows compact", async ({ page }) => {
    await page.goto("/leaderboards/weekly?mode=weekly");

    const presentation = page.locator('[data-leaderboard-presentation="table"]');
    await expect(presentation).toBeVisible();
    await expect(page.getByLabel("Rows per page")).toHaveValue("10");

    const overflow = await presentation.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);

    const rowHeights = await presentation
      .locator("tbody:not([data-desktop-pinned]) tr")
      .evaluateAll((rows) => rows.map((row) => Math.round(row.getBoundingClientRect().height)));
    expect(rowHeights.length).toBeGreaterThanOrEqual(6);
    expect(Math.max(...rowHeights)).toBeLessThanOrEqual(64);

    await expect(presentation.locator('tbody[data-desktop-pinned="true"]')).toBeHidden();
    await expect(
      page.getByRole("link", { name: /Open Xenon crew intel card/i }).first(),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /match intel card/i }).first()).toBeVisible();
  });
});
