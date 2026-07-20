// VERZUS M11.8 OPTIONAL PROFILE VISUAL REGRESSION

import { expect, test } from "@playwright/test";

const cases = [
  { name: "own-profile", path: "/profile", heading: "Prismo" },
  { name: "public-profile", path: "/players/player-prismo", heading: "Player profile" },
  { name: "profile-edit", path: "/profile/edit", heading: "Edit profile" },
  { name: "match-history", path: "/profile/matches", heading: "Match history" },
  {
    name: "identity-insights",
    path: "/profile/achievements",
    heading: "Player progression",
  },
  { name: "privacy-settings", path: "/profile/settings", heading: "Privacy settings" },
  {
    name: "suspended-profile",
    path: "/profile?accountScenario=suspended",
    heading: "Profile suspended",
  },
] as const;

for (const item of cases) {
  test(`${item.name} visual`, async ({ page }, testInfo) => {
    await page.goto(item.path);
    await page.getByRole("heading", { name: item.heading }).first().waitFor();
    await expect(page).toHaveScreenshot(`m11-${item.name}-${testInfo.project.name}.png`, {
      animations: "disabled",
      fullPage: true,
    });
  });
}
