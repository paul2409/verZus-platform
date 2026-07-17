// VERZUS M7.8 MATCH OPERATIONS E2E

import { expect, test } from "@playwright/test";

test("match lifecycle references remain reachable through the release gate", async ({ page }) => {
  for (const state of ["scheduled", "check-in-open", "lobby-open", "in-progress", "completed"]) {
    await page.goto(`/matches/m7-preview?state=${state}`);
    await expect(page.locator('[data-m7-release="7.8"]')).toBeVisible();
    await expect(page.locator('[data-m7-stage="7.8"]')).toBeVisible();
    await expect(page.locator("body")).not.toContainText("Unhandled Runtime Error");
  }
});

test("health and telemetry endpoints expose controlled contracts", async ({ request }) => {
  const health = await request.get("/api/health/matches");
  expect(health.ok()).toBe(true);
  await expect(health.json()).resolves.toMatchObject({
    ok: true,
    feature: "match-operations",
    stage: "7.8",
  });

  const telemetry = await request.post("/api/telemetry/matches", {
    data: {
      name: "match.route_viewed",
      occurredAt: new Date().toISOString(),
      route: "/matches/m7-preview",
      matchId: "m7-preview",
      environment: "test",
      release: "e2e",
    },
  });
  expect(telemetry.status()).toBe(202);
  expect(telemetry.headers()["x-request-id"]).toBeTruthy();
});
