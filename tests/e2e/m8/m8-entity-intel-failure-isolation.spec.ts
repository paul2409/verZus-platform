// VERZUS M8.10 ENTITY INTEL FAILURE ISOLATION E2E

import { expect, test } from "@playwright/test";

test("a failed intel API leaves rankings, filters and retry available", async ({ page }) => {
  await page.goto(
    "/leaderboards/weekly?mode=weekly&intel=player&entityId=player-prismo&intelScenario=error",
  );

  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry intel" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: /leaderboard modes/i })).toBeVisible();
  await expect(page.locator('[data-intel-entity="player"]').first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Close intel card" }).last()).toBeVisible();
});

test("health exposes stage, release and independent entity-intel state", async ({ request }) => {
  const response = await request.get("/api/health/leaderboards");
  expect(response.ok()).toBe(true);
  await expect(response.json()).resolves.toEqual(
    expect.objectContaining({
      feature: "leaderboards",
      stage: "8.10",
      status: "ok",
      entityIntel: "enabled",
    }),
  );
});
