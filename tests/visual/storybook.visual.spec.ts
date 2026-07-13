import { expect, test } from "@playwright/test";

const stories = [
  { id: "design-system-baseline--foundation", name: "foundation" },
  { id: "design-system-baseline--badges-and-identities", name: "badges-and-identities" },
  { id: "design-system-baseline--selection-controls", name: "selection-controls" },
  { id: "design-system-baseline--feedback-states", name: "feedback-states" },
  { id: "design-system-baseline--bottom-navigation-baseline", name: "bottom-navigation" },
  { id: "design-system-intel-cards--intel-cards-baseline", name: "intel-cards" },
] as const;

test.describe("VERZUS Storybook visual baseline", () => {
  for (const story of stories) {
    test(story.name, async ({ page }) => {
      await page.goto(`/iframe.html?id=${story.id}&viewMode=story`, {
        waitUntil: "networkidle",
      });

      const storyRoot = page.locator('[data-visual-ready="true"]');
      await expect(storyRoot).toBeVisible();

      await page.evaluate(async () => {
        await document.fonts.ready;
      });

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
