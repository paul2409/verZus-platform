// VERZUS M11.8 OPTIONAL PROFILE RELEASE BROWSER CHECKS

import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
}

test("Own profile renders without horizontal overflow", async ({ page }) => {
  await page.goto("/profile");
  await expect(page.getByRole("heading", { level: 2, name: "Player profile" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Prismo" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("Public profile keeps edit controls private", async ({ page }) => {
  await page.goto("/players/player-prismo");
  await expect(page.getByRole("heading", { level: 1, name: "Player profile" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Edit profile" })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("Profile health exposes release capabilities", async ({ request }) => {
  const response = await request.get("/api/health/profiles");
  expect(response.ok()).toBe(true);

  const body = (await response.json()) as {
    feature: string;
    stage: string;
    capabilities: Record<string, string>;
  };

  expect(body.feature).toBe("profiles");
  expect(body.stage).toBe("11.8");
  expect(body.capabilities.publicProjection).toBe("ready");
  expect(body.capabilities.featureIsolation).toBe("ready");
});
