// VERZUS M4 STEP 4.11

import { expect, test } from "@playwright/test";

const routes = [
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/session-expired",
];

for (const route of routes) {
  test(`authentication semantics: ${route}`, async ({ page }) => {
    await page.goto(route);

    await expect(page.locator("body")).toBeVisible();

    const duplicateIds = await page.evaluate(() => {
      const counts = new Map<string, number>();

      for (const element of document.querySelectorAll("[id]")) {
        const id = element.id;
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }

      return [...counts.entries()].filter(([, count]) => count > 1).map(([id]) => id);
    });

    expect(duplicateIds).toEqual([]);

    const unlabeledInputs = await page.evaluate(() =>
      [
        ...document.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
          "input:not([type='hidden']), select, textarea",
        ),
      ]
        .filter((control) => {
          const id = control.id;
          const explicitLabel =
            id.length > 0 && document.querySelector(`label[for="${CSS.escape(id)}"]`);

          return !(
            explicitLabel ||
            control.closest("label") ||
            control.getAttribute("aria-label") ||
            control.getAttribute("aria-labelledby")
          );
        })
        .map((control) => control.outerHTML),
    );

    expect(unlabeledInputs).toEqual([]);
  });
}
