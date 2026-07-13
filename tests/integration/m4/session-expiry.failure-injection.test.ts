// VERZUS M4 STEP 4.11

import { describe, expect, it, vi } from "vitest";

import { refreshSessionSafely } from "../../../src/features/auth/api/auth-session-refresh.client";
import { resolveAuthFailureDisplay } from "../../../src/features/auth/security/auth-failure.policy";
import { decideAuthRouteAccess } from "../../../src/features/auth/server/auth-route-policy";

describe("M4 session-expiry failure injection", () => {
  it("redirects an expired protected request to recovery with a safe return path", () => {
    expect(decideAuthRouteAccess("/inbox", "session_expired", "?thread=7")).toMatchObject({
      action: "redirect",
      destination: "/session-expired?next=%2Finbox%3Fthread%3D7",
    });
  });

  it("converts a refresh rejection into an explicit recovery action", async () => {
    const fetcher = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            ok: false,
            error: {
              code: "unauthorized",
              message: "Session expired.",
              retryable: false,
              requestId: "refresh-failure-1",
            },
          }),
          {
            status: 401,
          },
        ),
    );

    const result = await refreshSessionSafely({
      online: true,
      fetcher,
    });

    expect(result.ok).toBe(false);

    if (result.ok) {
      return;
    }

    expect(result.failure.code).toBe("session_refresh_failed");

    const display = resolveAuthFailureDisplay(result.failure);

    expect(display.action.kind).toBe("navigate");
    expect(display.action.target).toBe("/session-expired");
  });

  it("does not classify maintenance as offline", async () => {
    const result = await refreshSessionSafely({
      online: true,
      fetcher: vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              ok: false,
              error: {
                code: "maintenance",
                message: "Authentication is temporarily unavailable.",
                retryable: true,
              },
            }),
            {
              status: 503,
            },
          ),
      ),
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.failure.code).toBe("maintenance");
      expect(result.failure.retryable).toBe(true);
    }
  });
});
