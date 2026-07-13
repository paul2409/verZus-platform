// VERZUS M3 STEP 3.8

import { expect, test, type Page } from "@playwright/test";

const primaryRoutes = [
  "/play",
  "/compete",
  "/matches",
  "/leaderboards/weekly",
  "/crews",
  "/rewards",
] as const;

const secondaryRoutes = ["/profile", "/notifications", "/search", "/settings"] as const;

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const measurement = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));

  expect(
    Math.max(measurement.document, measurement.body),
    `Horizontal overflow: ${JSON.stringify(measurement)}`,
  ).toBeLessThanOrEqual(measurement.viewport + 1);
}

test.describe("M3 production shell", () => {
  for (const route of primaryRoutes) {
    test(`${route} is reachable with persistent navigation`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto(route);

      await expect(page.getByRole("main")).toBeVisible();
      await expect(
        page.getByRole("navigation", { name: "Primary desktop navigation" }),
      ).toBeVisible();
      await expect(page.locator('[aria-current="page"]').first()).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });
  }

  for (const route of secondaryRoutes) {
    test(`${route} is reachable inside the platform shell`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(route);

      await expect(page.getByRole("main")).toBeVisible();
      await expect(
        page.getByRole("navigation", { name: "Primary mobile navigation" }),
      ).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });
  }

  test("mobile navigation reaches a primary destination", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/play");

    const competeLink = page.locator('a[href="/compete"]').last();
    await expect(competeLink).toBeVisible();
    await competeLink.click();

    await expect(page).toHaveURL(/\/compete$/);

    const mobileNavigation = page.getByRole("navigation", {
      name: "Primary mobile navigation",
    });
    const activeMobileDestination = mobileNavigation.locator('[aria-current="page"]');

    await expect(activeMobileDestination).toBeVisible();
    await expect(activeMobileDestination).toHaveAttribute("href", "/compete");
  });

  test("a widget failure does not remove shell navigation", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/m3-shell-audit");

    await page.getByRole("button", { name: "Trigger sidebar failure" }).click();

    await expect(page.getByText("Sidebar intelligence is unavailable")).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Primary desktop navigation" }),
    ).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("a route failure remains inside the platform shell", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/shell-audit-route-crash");

    await expect(page.getByRole("button", { name: "Retry route" })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Primary desktop navigation" }),
    ).toBeVisible();
  });
});
