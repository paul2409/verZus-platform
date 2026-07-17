// VERZUS M8.10.1 COMPACT DESKTOP DENSITY E2E

import { expect, test } from "@playwright/test";

test.describe("M8 compact desktop leaderboard density", () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test("keeps headers and ranking rows within the approved desktop height budget", async ({
    page,
  }) => {
    await page.goto("/leaderboards/weekly?mode=crew&size=10");

    const presentation = page.locator('[data-leaderboard-presentation="table"]');
    await expect(presentation).toBeVisible();

    const headerHeight = await presentation
      .locator("thead tr")
      .evaluate((element) => Math.round(element.getBoundingClientRect().height));
    expect(headerHeight).toBeLessThanOrEqual(48);

    const rows = presentation.locator("tbody tr");
    expect(await rows.count()).toBeGreaterThanOrEqual(5);

    const rowHeights = await rows.evaluateAll((elements) =>
      elements.slice(0, 10).map((element) => Math.round(element.getBoundingClientRect().height)),
    );

    expect(Math.max(...rowHeights)).toBeLessThanOrEqual(78);
    expect(Math.min(...rowHeights)).toBeGreaterThanOrEqual(60);

    const metadata = presentation.locator('[class*="compactMeta"]').first();
    await expect(metadata).toBeVisible();
    const metadataHeight = await metadata.evaluate((element) =>
      Math.round(element.getBoundingClientRect().height),
    );
    expect(metadataHeight).toBeLessThanOrEqual(22);
  });
});
