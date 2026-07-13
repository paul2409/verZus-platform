// VERZUS M3 STEP 3.8

import { expect, test } from "@playwright/test";

const stories = [
  { id: "m3-application-shell--operational", name: "operational" },
  { id: "m3-application-shell--degraded", name: "degraded" },
  { id: "m3-application-shell--offline", name: "offline" },
  { id: "m3-application-shell--route-loading", name: "route-loading" },
  {
    id: "m3-application-shell--isolated-widget-failure",
    name: "isolated-widget-failure",
  },
] as const;

test.describe("M3 application-shell visual baseline", () => {
  for (const story of stories) {
    test(story.name, async ({ page }) => {
      await page.goto(`/iframe.html?id=${story.id}&viewMode=story`, {
        waitUntil: "networkidle",
      });

      const storyRoot = page.locator('[data-visual-ready="true"]');

      await expect(storyRoot).toBeVisible();
      await page.evaluate(async () => document.fonts.ready);

      await page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation-delay: 0s !important;
            animation-duration: 0s !important;
            caret-color: transparent !important;
            transition: none !important;
          }
        `,
      });

      await expect(storyRoot).toHaveScreenshot(`${story.id}.png`);
    });
  }
});
