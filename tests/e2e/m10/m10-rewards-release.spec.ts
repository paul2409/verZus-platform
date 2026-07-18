// VERZUS M10.8 OPTIONAL REWARD RELEASE BROWSER CHECKS

import { expect, test } from "@playwright/test";

test("Rewards route renders the approved hierarchy without horizontal overflow", async ({
  page,
}) => {
  await page.goto("/rewards");

  await expect(page.getByRole("heading", { level: 1, name: "Rewards" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your progress" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Claimable rewards" })).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});

test("A failed reward widget remains locally isolated", async ({ page }) => {
  await page.goto("/rewards?widget=inventory&widgetScenario=crash");

  await expect(page.getByRole("heading", { level: 1, name: "Rewards" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "This reward panel stopped" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry panel" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your progress" })).toBeVisible();
});

test("Reward health exposes release-stage capabilities", async ({ request }) => {
  const response = await request.get("/api/health/rewards");
  expect(response.ok()).toBe(true);

  const body = (await response.json()) as {
    feature: string;
    stage: string;
    capabilities: Record<string, string>;
  };

  expect(body.feature).toBe("rewards");
  expect(body.stage).toBe("10.8");
  expect(body.capabilities.idempotentClaiming).toBe("ready");
  expect(body.capabilities.featureIsolation).toBe("ready");
});
