// VERZUS M4 STEP 4.6

import { describe, expect, it } from "vitest";
import { resolveBrowserAuthDestination } from "./auth-redirect";

describe("browser authentication redirects", () => {
  it("returns a safe requested route after login", () => {
    expect(resolveBrowserAuthDestination("authenticated", "?next=%2Fprofile%2Fplayer-1")).toBe(
      "/profile/player-1",
    );
  });

  it("rejects external requested routes", () => {
    expect(resolveBrowserAuthDestination("authenticated", "?next=https%3A%2F%2Fexample.com")).toBe(
      "/play",
    );
  });

  it("keeps verification and onboarding state-driven", () => {
    expect(resolveBrowserAuthDestination("email_unverified", "?next=%2Fplay")).toBe(
      "/verify-email",
    );
    expect(resolveBrowserAuthDestination("onboarding_incomplete", "?next=%2Fplay")).toBe(
      "/onboarding",
    );
  });
});
