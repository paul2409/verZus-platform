// VERZUS M4 STEP 4.10

import { describe, expect, it, vi } from "vitest";

import { refreshSessionSafely } from "./auth-session-refresh.client";

describe("safe session refresh client", () => {
  it("does not call the server while offline", async () => {
    const fetcher = vi.fn();

    const result = await refreshSessionSafely({
      fetcher,
      online: false,
    });

    expect(fetcher).not.toHaveBeenCalled();
    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.failure.code).toBe("offline");
    }
  });

  it("returns the refreshed authentication state", async () => {
    const result = await refreshSessionSafely({
      online: true,
      fetcher: vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              ok: true,
              state: "authenticated",
              message: "Session refreshed.",
            }),
            {
              status: 200,
            },
          ),
      ),
    });

    expect(result).toEqual({
      ok: true,
      state: "authenticated",
    });
  });

  it("maps unauthorized refreshes to session refresh failure", async () => {
    const result = await refreshSessionSafely({
      online: true,
      fetcher: vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              ok: false,
              error: {
                code: "unauthorized",
                message: "Session expired.",
                retryable: false,
              },
            }),
            {
              status: 401,
            },
          ),
      ),
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.failure.code).toBe("session_refresh_failed");
    }
  });

  it("preserves maintenance failures", async () => {
    const result = await refreshSessionSafely({
      online: true,
      fetcher: vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              ok: false,
              error: {
                code: "maintenance",
                message: "Authentication is under maintenance.",
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
