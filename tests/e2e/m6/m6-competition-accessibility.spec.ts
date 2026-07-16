// VERZUS M6.7 COMPETITION ACCESSIBILITY

import { expect, test } from "@playwright/test";

test("competition routes expose landmarks, focus and no horizontal overflow", async ({ page }) => {
  await page.goto("/compete/ea-fc-rookie-cup?scenario=registration_closed");

  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();

  const overflow = await page.evaluate(
    () =>
      Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);

  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => document.activeElement?.tagName ?? "BODY");
  expect(focused).not.toBe("BODY");
});

test("retry controls expose accessible names and touch targets", async ({ page }) => {
  await page.goto("/compete/ea-fc-rookie-cup?scenario=maintenance");
  const retry = page
    .getByRole("button", { name: /retry/i })
    .or(page.getByRole("link", { name: /retry/i }))
    .first();
  await expect(retry).toBeVisible();
  const box = await retry.boundingBox();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
});
