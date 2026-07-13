// VERZUS M3 STEP 3.7

import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const viewports = [
  { name: "mobile-360", width: 360, height: 800 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "mobile-430", width: 430, height: 932 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "laptop-1024", width: 1024, height: 900 },
  { name: "desktop-1440", width: 1440, height: 1000 },
] as const;

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const measurements = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));

  expect(
    Math.max(measurements.document, measurements.body),
    `Horizontal overflow: ${JSON.stringify(measurements)}`,
  ).toBeLessThanOrEqual(measurements.viewport + 1);
}

async function expectAuditControlsMeetTouchTarget(page: Page): Promise<void> {
  const failing = await page
    .getByTestId("m3-audit-controls")
    .locator("button, a")
    .evaluateAll((elements) =>
      elements
        .filter((element) => {
          const style = window.getComputedStyle(element);
          return style.display !== "none" && style.visibility !== "hidden";
        })
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            label: element.textContent?.trim() ?? "unnamed",
            width: rect.width,
            height: rect.height,
          };
        })
        .filter((target) => target.height < 44 || target.width < 44),
    );

  expect(failing, `Touch targets below 44px: ${JSON.stringify(failing)}`).toEqual([]);
}

async function expectNoSeriousAccessibilityViolations(page: Page): Promise<void> {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const blocking = result.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? ""),
  );

  const report = blocking.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    targets: violation.nodes.flatMap((node) => node.target),
  }));

  expect(report, `Accessibility violations: ${JSON.stringify(report, null, 2)}`).toEqual([]);
}

for (const viewport of viewports) {
  test(`${viewport.name}: responsive shell and accessibility`, async ({ page }) => {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await page.goto("/m3-shell-audit");

    await expect(page.getByRole("heading", { name: "Shell Resilience Audit" })).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await expectAuditControlsMeetTouchTarget(page);
    await expectNoSeriousAccessibilityViolations(page);

    if (viewport.width >= 1024) {
      await expect(
        page.getByRole("navigation", { name: "Primary desktop navigation" }),
      ).toBeVisible();
    } else {
      await expect(
        page.getByRole("navigation", { name: "Primary mobile navigation" }),
      ).toBeVisible();
    }
  });
}

test("shell children fail independently", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/m3-shell-audit");

  await page.getByRole("button", { name: "Trigger sidebar failure" }).click();
  await expect(page.getByText("Sidebar intelligence is unavailable")).toBeVisible();
  await expect(page.getByText("Next Match")).toBeVisible();

  await page.getByRole("button", { name: "Trigger profile failure" }).click();
  await expect(page.getByRole("link", { name: "Open profile" })).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();

  await page.getByRole("button", { name: "Trigger notification failure" }).click();
  await page.getByRole("button", { name: "Open notifications, 3 unread" }).click();
  await expect(page.getByText("Notification content is unavailable")).toBeVisible();
  await expect(page.getByText("Current Position")).toBeVisible();
});

test("offline and feature-disabled states remain controlled", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/m3-shell-audit");

  await page.getByRole("button", { name: "Enable offline mode" }).click();
  await expect(page.getByText("Offline mode").first()).toBeVisible();
  await expect(
    page.locator('[data-navigation-id="compete"][aria-disabled="true"]').first(),
  ).toBeVisible();
  await expect(
    page.locator('[data-navigation-id="play"] a, a[data-navigation-id="play"]').first(),
  ).toBeVisible();

  await page.getByRole("button", { name: "Disable Crews feature" }).click();
  await expect(
    page.locator('[data-navigation-id="crews"][aria-disabled="true"]').first(),
  ).toBeVisible();
});

test("global overlays dismiss with Escape and restore focus", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto("/m3-shell-audit");

  const searchTrigger = page.getByRole("button", { name: "Search" });
  await searchTrigger.focus();
  await searchTrigger.click();
  await expect(page.getByRole("dialog", { name: "Search VERZUS" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Search VERZUS" })).toBeHidden();
  await expect(searchTrigger).toBeFocused();

  const notificationTrigger = page.getByRole("button", {
    name: "Open notifications, 3 unread",
  });
  await notificationTrigger.focus();
  await notificationTrigger.click();
  await expect(page.getByRole("dialog", { name: "Notifications" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Notifications" })).toBeHidden();
  await expect(notificationTrigger).toBeFocused();
});

test("route loading keeps existing content visible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/m3-shell-audit");

  await page.getByRole("button", { name: "Start route loading" }).click();

  await expect(page.getByRole("progressbar")).toBeVisible();
  await expect(page.getByRole("main")).toHaveAttribute("aria-busy", "true");
  await expect(page.getByText("Next Match")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("a route crash preserves the platform shell", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/shell-audit-route-crash");

  await expect(
    page.getByRole("heading", {
      name: "Shell audit route is temporarily unavailable",
    }),
  ).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary desktop navigation" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry route" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
