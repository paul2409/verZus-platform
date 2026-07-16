// VERZUS M6.7 COMPETITION E2E

import { expect, test } from "@playwright/test";

const competitionId = "ea-fc-rookie-cup";

test("discovery and detail remain reachable through the release gate", async ({ page }) => {
  await page.goto("/compete");
  await expect(page.locator('[data-m6-release="6.7"]')).toBeVisible();

  await page.goto(`/compete/${competitionId}`);
  await expect(page.locator('[data-m6-release="6.7"]')).toBeVisible();
  await expect(page.locator('[data-m6-stage="6.7"]')).toBeVisible();
});

test("the lifecycle API is independently healthy and traceable", async ({ request }) => {
  const response = await request.get(
    `/api/competitions/${competitionId}/lifecycle?scenario=normal`,
  );
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body).toMatchObject({
    ok: true,
    data: { competition_id: competitionId, entry_allowed: true },
  });
  expect(response.headers()["x-request-id"]).toBeTruthy();
});

test("health exposes stage, flag and immutable release metadata", async ({ request }) => {
  const response = await request.get("/api/health/competitions");
  expect(response.ok()).toBeTruthy();
  await expect(response.json()).resolves.toMatchObject({
    ok: true,
    feature: "competitions",
    stage: "6.7",
  });
});
