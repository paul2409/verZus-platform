// VERZUS M5 STEPS 5.9-5.13

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function authenticate(page: Page) {
  await page.context().addCookies([
    {
      name: "verzus_mock_session",
      value: "mock-authenticated",
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}

test.beforeEach(async ({ page }) => {
  await authenticate(page);
});

test("Play answers the primary player questions without horizontal overflow", async ({ page }) => {
  await page.goto("/play?scenario=check_in_open");

  await expect(page.getByRole("heading", { name: "Your next battle is ready." })).toBeVisible();
  await expect(page.getByText("R3DSTORM", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "CHECK IN NOW" })).toBeVisible();
  await expect(page.getByText("MAINLAND TITANS", { exact: true })).toBeVisible();
  await expect(page.getByText("EA FC Rookie Cup", { exact: true })).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("check-in is idempotent and survives refresh", async ({ page }) => {
  await page.goto("/play?scenario=check_in_open");

  const action = page.getByRole("button", { name: "CHECK IN NOW" });
  await action.dblclick();

  await expect(page.getByRole("button", { name: "CHECKED IN" })).toBeDisabled();
  await page.reload();
  await expect(page.getByRole("button", { name: "CHECKED IN" })).toBeDisabled();
});

test("partial API failure does not remove the next match or quick actions", async ({ page }) => {
  await page.goto("/play?scenario=partial_api_failure");

  await expect(page.getByText("PARTIAL SERVICE DEGRADATION")).toBeVisible();
  await expect(page.getByText("R3DSTORM", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "FIND MATCH Ranked queue" })).toBeVisible();
  await expect(page.getByText("SIGNAL DEGRADED").first()).toBeVisible();
});

test("offline state preserves navigation and a controlled fallback", async ({ page }) => {
  await page.goto("/play?scenario=offline");

  await expect(page.getByText("OFFLINE MODE").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "FIND MATCH Ranked queue" })).toBeVisible();
});

test("Play has no serious or critical accessibility violations", async ({ page }) => {
  await page.goto("/play?scenario=normal");

  const results = await new AxeBuilder({ page }).analyze();
  const severe = results.violations.filter(
    (violation) => violation.impact === "serious" || violation.impact === "critical",
  );

  expect(severe).toEqual([]);
});
