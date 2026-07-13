// VERZUS M4 STEP 4.1

import { describe, expect, it } from "vitest";

import {
  canAccessAuthenticatedRoutes,
  getAuthDestination,
  isTerminalAuthRestriction,
} from "./auth-state";
import { reduceAuthState } from "./auth-state-machine";

describe("authentication state contract", () => {
  it("maps each state to a deterministic destination", () => {
    expect(getAuthDestination("anonymous")).toBe("/login");
    expect(getAuthDestination("email_unverified")).toBe("/verify-email");
    expect(getAuthDestination("onboarding_incomplete")).toBe("/onboarding");
    expect(getAuthDestination("authenticated")).toBe("/play");
    expect(getAuthDestination("session_expired")).toBe("/session-expired");
  });

  it("allows protected routes only for authenticated users", () => {
    expect(canAccessAuthenticatedRoutes("authenticated")).toBe(true);
    expect(canAccessAuthenticatedRoutes("onboarding_incomplete")).toBe(false);
    expect(canAccessAuthenticatedRoutes("session_expired")).toBe(false);
  });

  it("identifies terminal account restrictions", () => {
    expect(isTerminalAuthRestriction("suspended")).toBe(true);
    expect(isTerminalAuthRestriction("banned")).toBe(true);
    expect(isTerminalAuthRestriction("anonymous")).toBe(false);
  });

  it("moves through verification and onboarding without skipping prerequisites", () => {
    const authenticating = reduceAuthState("anonymous", {
      type: "AUTHENTICATION_STARTED",
    });
    const unverified = reduceAuthState(authenticating, {
      type: "AUTHENTICATION_SUCCEEDED",
      nextState: "email_unverified",
    });
    const onboarding = reduceAuthState(unverified, {
      type: "EMAIL_VERIFIED",
    });
    const authenticated = reduceAuthState(onboarding, {
      type: "ONBOARDING_COMPLETED",
    });

    expect(authenticating).toBe("authenticating");
    expect(unverified).toBe("email_unverified");
    expect(onboarding).toBe("onboarding_incomplete");
    expect(authenticated).toBe("authenticated");
  });

  it("handles session expiry and account restrictions explicitly", () => {
    expect(reduceAuthState("authenticated", { type: "SESSION_EXPIRED" })).toBe("session_expired");
    expect(reduceAuthState("authenticated", { type: "ACCOUNT_SUSPENDED" })).toBe("suspended");
    expect(reduceAuthState("authenticated", { type: "ACCOUNT_BANNED" })).toBe("banned");
  });
});
