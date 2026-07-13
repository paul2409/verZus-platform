// VERZUS M4 STEP 4.10

import { z } from "zod";

import type { AuthState } from "../model/auth-state";
import {
  adaptHttpFailure,
  createAppFailure,
  createOfflineFailure,
  type AppFailure,
} from "../../../shared/failures";

const sessionRefreshStateSchema = z.enum([
  "anonymous",
  "authenticating",
  "authenticated",
  "email_unverified",
  "onboarding_incomplete",
  "suspended",
  "banned",
  "session_expired",
]);

const refreshSuccessSchema = z.object({
  ok: z.literal(true),
  state: sessionRefreshStateSchema,
  message: z.string().optional(),
});

const refreshFailureSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: z.string().optional(),
    message: z.string().optional(),
    retryable: z.boolean().optional(),
    fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
    requestId: z.string().optional(),
  }),
});

const refreshResponseSchema = z.discriminatedUnion("ok", [
  refreshSuccessSchema,
  refreshFailureSchema,
]);

export type SessionRefreshResult =
  | {
      ok: true;
      state: AuthState;
    }
  | {
      ok: false;
      failure: AppFailure;
    };

export interface RefreshSessionOptions {
  fetcher?: typeof fetch;
  online?: boolean;
}

function browserIsOnline(): boolean {
  return typeof navigator === "undefined" || navigator.onLine;
}

function createRefreshFailure(
  message = "Your session could not be refreshed. Sign in again.",
): AppFailure {
  return createAppFailure({
    code: "session_refresh_failed",
    source: "auth",
    message,
    httpStatus: 401,
    retryable: false,
  });
}

async function readJsonSafely(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function refreshSessionSafely(
  options: RefreshSessionOptions = {},
): Promise<SessionRefreshResult> {
  const online = options.online ?? browserIsOnline();

  if (!online) {
    return {
      ok: false,
      failure: createOfflineFailure("auth"),
    };
  }

  const fetcher = options.fetcher ?? fetch;
  let response: Response;

  try {
    response = await fetcher("/api/auth/session/refresh", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({}),
    });
  } catch {
    return {
      ok: false,
      failure: createOfflineFailure("auth"),
    };
  }

  const payload = await readJsonSafely(response);
  const parsed = refreshResponseSchema.safeParse(payload);

  if (parsed.success && parsed.data.ok) {
    return {
      ok: true,
      state: parsed.data.state,
    };
  }

  if (!parsed.success) {
    return {
      ok: false,
      failure: createRefreshFailure("The session refresh response was invalid. Sign in again."),
    };
  }

  const failure = adaptHttpFailure({
    source: "auth",
    status: response.status,
    payload,
    online: true,
    retryAfterHeader: response.headers.get("retry-after"),
  });

  if (response.status === 401 || failure.code === "unauthorized") {
    return {
      ok: false,
      failure: createRefreshFailure(),
    };
  }

  return {
    ok: false,
    failure,
  };
}
