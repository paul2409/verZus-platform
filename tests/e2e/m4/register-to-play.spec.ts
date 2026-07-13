// VERZUS M4 STEP 4.11

import { expect, test } from "@playwright/test";

const approved = process.env.M4_REFERENCES_APPROVED === "true";

test.describe("M4 register-to-Play journey", () => {
  test.skip(
    !approved,
    "Blocked until mobile and desktop references are approved and final onboarding screens exist.",
  );

  test("registers, verifies, completes onboarding, and enters Play", async ({ page }) => {
    await page.goto("/register");
    await expect(page).toHaveURL(/\/register/);

    // Final selectors are added only after the approved references
    // are implemented. This test intentionally remains approval-gated.
  });
});
