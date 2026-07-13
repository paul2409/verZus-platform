// VERZUS M4 STEP 4.1

import { describe, expect, it } from "vitest";

import { adaptAuthSession, parseAuthSessionResponse } from "./auth-session.adapter";

const validResponse = {
  state: "authenticated",
  user: {
    id: "player-001",
    email: "player@example.com",
    phone: null,
    role: "player",
    emailVerified: true,
    onboardingComplete: true,
  },
  session: {
    id: "session-001",
    expiresAt: "2026-07-13T12:00:00.000Z",
    refreshable: true,
    deviceId: "device-001",
  },
  restrictionReason: null,
  requestId: "request-001",
} as const;

describe("authentication session schema", () => {
  it("validates and adapts a trusted session response", () => {
    const parsed = parseAuthSessionResponse(validResponse);
    const viewModel = adaptAuthSession(parsed);

    expect(viewModel.state).toBe("authenticated");
    expect(viewModel.userId).toBe("player-001");
    expect(viewModel.refreshable).toBe(true);
    expect(viewModel.requestId).toBe("request-001");
  });

  it("rejects an authenticated state without a user", () => {
    expect(() =>
      parseAuthSessionResponse({
        ...validResponse,
        user: null,
      }),
    ).toThrow();
  });

  it("rejects an authenticated state without a session", () => {
    expect(() =>
      parseAuthSessionResponse({
        ...validResponse,
        session: null,
      }),
    ).toThrow();
  });

  it("requires a reason for suspended and banned states", () => {
    expect(() =>
      parseAuthSessionResponse({
        ...validResponse,
        state: "suspended",
        session: null,
        restrictionReason: null,
      }),
    ).toThrow();
  });
});
