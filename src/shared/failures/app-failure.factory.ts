// VERZUS M4 STEP 4.10

import {
  appFailureSchema,
  type AppFailure,
  type AppFailureCode,
  type AppFailureSource,
} from "./app-failure.schema";

export interface CreateAppFailureInput {
  code: AppFailureCode;
  source: AppFailureSource;
  message: string;
  httpStatus?: number | null;
  retryable?: boolean;
  fieldErrors?: Record<string, string[]>;
  retryAfterSeconds?: number | null;
  requestId?: string | null;
}

export function createAppFailure(input: CreateAppFailureInput): AppFailure {
  return appFailureSchema.parse({
    code: input.code,
    source: input.source,
    message: input.message,
    httpStatus: input.httpStatus ?? null,
    retryable: input.retryable ?? false,
    fieldErrors: input.fieldErrors ?? {},
    retryAfterSeconds: input.retryAfterSeconds ?? null,
    requestId: input.requestId ?? null,
  });
}

export function createOfflineFailure(source: AppFailureSource): AppFailure {
  return createAppFailure({
    code: "offline",
    source,
    message: "You appear to be offline. Check your connection and retry.",
    retryable: true,
  });
}

export function createMaintenanceFailure(
  source: AppFailureSource,
  message = "This service is temporarily unavailable for maintenance.",
): AppFailure {
  return createAppFailure({
    code: "maintenance",
    source,
    message,
    httpStatus: 503,
    retryable: true,
  });
}
