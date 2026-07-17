// VERZUS M8.10 ENTITY INTEL INTERACTION E2E

import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function openFirst(page: Page, kind: "player" | "crew" | "match") {
  const trigger = page.locator(`[data-intel-entity="${kind}"]`).first();
  await expect(trigger).toBeVisible();
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`intel=${kind}`));
  return trigger;
}

test.describe("M8 entity intel interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/leaderboards/weekly");
    await expect(page.locator('[data-m8-stage="8.10"]')).toBeVisible();
  });

  test("player, Crew and match targets open their owning cards", async ({ page }) => {
    for (const kind of ["player", "crew", "match"] as const) {
      await openFirst(page, kind);
      await expect(page.locator(`[data-m8-intel-stage="8.10"]`)).toHaveAttribute(
        "data-intel-kind",
        kind,
      );
      await page.getByRole("button", { name: "Close intel card" }).last().click();
      await expect(page.getByRole("dialog")).toHaveCount(0);
    }
  });

  test("Space activates an entity and Escape closes with focus restoration", async ({ page }) => {
    const trigger = page.locator('[data-intel-entity="player"]').first();
    await trigger.focus();
    await page.keyboard.press("Space");
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("button", { name: "Close intel card" }).last()).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("browser Back closes a deep interaction without resetting filters", async ({ page }) => {
    await page.goto("/leaderboards/weekly?mode=game&game=ea-fc&size=3");
    await openFirst(page, "player");
    await page.goBack();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveURL(/mode=game/);
    await expect(page).toHaveURL(/game=ea-fc/);
    await expect(page).toHaveURL(/size=3/);
  });
});
