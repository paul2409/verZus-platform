// VERZUS M4 STEP 4.5

import type { AuthSubmissionError } from "../contracts";
import type { AuthSubmitResult } from "../forms/auth-form.submitter";
import {
  authApiResponseSchema,
  type AuthApiError,
} from "./auth-api.schema";

export function adaptAuthApiError(
  error: AuthApiError,
): AuthSubmissionError {
  return {
    code: error.code as AuthSubmissionError["code"],
    message: error.message,
    requestId: error.requestId,
    retryable: error.retryable,
    fieldErrors: error.fieldErrors,
    retryAfterSeconds: error.retryAfterSeconds,
  };
}

export function adaptAuthApiPayload(input: unknown): AuthSubmitResult {
  const parsed = authApiResponseSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: "unknown",
        message:
          "The authentication service returned an invalid response.",
        requestId: null,
        retryable: true,
        fieldErrors: {},
        retryAfterSeconds: null,
      },
    };
  }

  if (!parsed.data.ok) {
    return {
      ok: false,
      error: adaptAuthApiError(parsed.data.error),
    };
  }

  return {
    ok: true,
    message: parsed.data.message,
  };
}

export function createNetworkAuthFailure(): AuthSubmitResult {
  const offline =
    typeof navigator !== "undefined" && navigator.onLine === false;

  return {
    ok: false,
    error: {
      code: offline ? "offline" : "service_unavailable",
      message: offline
        ? "You appear to be offline. Reconnect and retry."
        : "The authentication service is temporarily unavailable.",
      requestId: null,
      retryable: true,
      fieldErrors: {},
      retryAfterSeconds: null,
    },
  };
}
