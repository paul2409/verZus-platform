// VERZUS M4 STEP 4.6

import { describe, expect, it } from "vitest";
import {
  createLoginDestination,
  decideAuthRouteAccess,
  isProtectedRoute,
} from "./auth-route-policy";

describe("server authentication route policy", () => {
  it("protects application routes for anonymous users", () => {
    expect(isProtectedRoute("/play")).toBe(true);
    expect(isProtectedRoute("/profile/player-1")).toBe(true);
    expect(decideAuthRouteAccess("/play", "anonymous", "?tab=matches")).toMatchObject({
      action: "redirect",
      destination: "/login?next=%2Fplay%3Ftab%3Dmatches",
    });
  });

  it("creates an internal login destination", () => {
    expect(createLoginDestination("/profile/player-1", "?view=stats")).toBe(
      "/login?next=%2Fprofile%2Fplayer-1%3Fview%3Dstats",
    );
  });

  it("enforces verification and onboarding", () => {
    expect(decideAuthRouteAccess("/play", "email_unverified")).toMatchObject({
      action: "redirect",
      destination: "/verify-email",
    });
    expect(decideAuthRouteAccess("/leaderboards", "onboarding_incomplete")).toMatchObject({
      action: "redirect",
      destination: "/onboarding",
    });
    expect(decideAuthRouteAccess("/onboarding/games", "onboarding_incomplete")).toMatchObject({
      action: "allow",
    });
  });

  it("redirects authenticated players away from auth routes", () => {
    expect(
      decideAuthRouteAccess("/login", "authenticated", "?next=%2Finbox%3Fthread%3D7"),
    ).toMatchObject({ action: "redirect", destination: "/inbox?thread=7" });
    expect(decideAuthRouteAccess("/play", "authenticated")).toMatchObject({ action: "allow" });
  });

  it("isolates suspended and banned accounts", () => {
    expect(decideAuthRouteAccess("/play", "suspended")).toMatchObject({
      action: "redirect",
      destination: "/account/suspended",
    });
    expect(decideAuthRouteAccess("/login", "banned")).toMatchObject({
      action: "redirect",
      destination: "/account/banned",
    });
  });

  it("preserves expired-session recovery destinations", () => {
    expect(decideAuthRouteAccess("/inbox", "session_expired", "?thread=7")).toMatchObject({
      action: "redirect",
      destination: "/session-expired?next=%2Finbox%3Fthread%3D7",
    });
  });
});
