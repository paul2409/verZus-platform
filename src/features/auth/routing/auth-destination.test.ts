// VERZUS M4 STEP 4.6

import { describe, expect, it } from "vitest";
import {
  getAuthStateDestination,
  readSafeNextPath,
  sanitizeInternalNextPath,
} from "./auth-destination";

describe("authentication destinations", () => {
  it("maps authentication states to canonical routes", () => {
    expect(getAuthStateDestination("authenticated")).toBe("/play");
    expect(getAuthStateDestination("email_unverified")).toBe("/verify-email");
    expect(getAuthStateDestination("onboarding_incomplete")).toBe("/onboarding");
    expect(getAuthStateDestination("suspended")).toBe("/account/suspended");
    expect(getAuthStateDestination("banned")).toBe("/account/banned");
    expect(getAuthStateDestination("anonymous")).toBe("/login");
  });

  it("accepts safe internal destinations", () => {
    expect(sanitizeInternalNextPath("/profile/player-1?view=stats#recent")).toBe(
      "/profile/player-1?view=stats#recent",
    );
  });

  it("rejects external, protocol-relative, and blocked destinations", () => {
    expect(sanitizeInternalNextPath("https://example.com/path")).toBeNull();
    expect(sanitizeInternalNextPath("//example.com/path")).toBeNull();
    expect(sanitizeInternalNextPath("/\\example.com")).toBeNull();
    expect(sanitizeInternalNextPath("/login")).toBeNull();
    expect(sanitizeInternalNextPath("/onboarding/games")).toBeNull();
  });

  it("reads a safe encoded next value", () => {
    expect(readSafeNextPath("?next=%2Finbox%3Fthread%3D7")).toBe("/inbox?thread=7");
  });

  it("uses next only for authenticated players", () => {
    expect(getAuthStateDestination("authenticated", "/rankings?game=fc")).toBe("/rankings?game=fc");
    expect(getAuthStateDestination("email_unverified", "/rankings")).toBe("/verify-email");
  });
});
