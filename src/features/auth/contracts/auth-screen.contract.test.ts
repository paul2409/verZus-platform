// VERZUS M4 STEP 4.2

import { describe, expect, it } from "vitest";

import { authScreenContracts, getAuthScreenContract } from "./auth-screen.contract";

describe("authentication screen contracts", () => {
  it("maps every required authentication route", () => {
    expect(getAuthScreenContract("login").route).toBe("/login");
    expect(getAuthScreenContract("register").route).toBe("/register");
    expect(getAuthScreenContract("email-verification").route).toBe("/verify-email");
    expect(getAuthScreenContract("forgot-password").route).toBe("/forgot-password");
    expect(getAuthScreenContract("reset-password").route).toBe("/reset-password");
    expect(getAuthScreenContract("session-expired").route).toBe("/session-expired");
  });

  it("requires password visibility only where password fields exist", () => {
    expect(authScreenContracts.login.passwordVisibility).toBe(true);
    expect(authScreenContracts.register.passwordVisibility).toBe(true);
    expect(authScreenContracts["email-verification"].passwordVisibility).toBe(false);
    expect(authScreenContracts["forgot-password"].passwordVisibility).toBe(false);
  });

  it("defines rate limiting for every mutation form", () => {
    expect(authScreenContracts.login.rateLimited).toBe(true);
    expect(authScreenContracts.register.rateLimited).toBe(true);
    expect(authScreenContracts["email-verification"].rateLimited).toBe(true);
    expect(authScreenContracts["forgot-password"].rateLimited).toBe(true);
    expect(authScreenContracts["reset-password"].rateLimited).toBe(true);
    expect(authScreenContracts["session-expired"].rateLimited).toBe(false);
  });

  it("does not expose fake fields on the session-expired state", () => {
    expect(authScreenContracts["session-expired"].fields).toHaveLength(0);
    expect(authScreenContracts["session-expired"].entryStates).toContain("session_expired");
  });
});
