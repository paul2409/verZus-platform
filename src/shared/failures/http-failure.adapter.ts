// VERZUS M4 STEP 4.10

import {
  appFailureCodeValues,
  type AppFailure,
  type AppFailureCode,
  type AppFailureSource,
} from "./app-failure.schema";
import { createAppFailure, createOfflineFailure } from "./app-failure.factory";

interface ErrorEnvelope {
  code?: unknown;
  message?: unknown;
  retryable?: unknown;
  fieldErrors?: unknown;
  requestId?: unknown;
}

export interface AdaptHttpFailureInput {
  source: AppFailureSource;
  status: number | null;
  payload: unknown;
  online: boolean;
  retryAfterHeader?: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readErrorEnvelope(payload: unknown): ErrorEnvelope {
  if (!isRecord(payload)) {
    return {};
  }

  const error = payload.error;

  if (isRecord(error)) {
    return error;
  }

  return payload;
}

function normalizeFailureCode(rawCode: unknown, status: number | null): AppFailureCode {
  const aliases: Record<string, AppFailureCode> = {
    invalid_credentials: "invalid_credentials",
    duplicate_account: "duplicate_account",
    account_exists: "duplicate_account",
    expired_verification_code: "expired_verification_code",
    verification_code_expired: "expired_verification_code",
    expired_reset_token: "expired_reset_token",
    reset_token_expired: "expired_reset_token",
    rate_limited: "rate_limited",
    too_many_requests: "rate_limited",
    maintenance: "maintenance",
    service_unavailable: "maintenance",
    session_refresh_failed: "session_refresh_failed",
    suspended: "suspended",
    account_suspended: "suspended",
    banned: "banned",
    account_banned: "banned",
    partial_failure: "partial_failure",
    unauthorized: "unauthorized",
    forbidden: "forbidden",
    validation_failed: "validation_failed",
  };

  if (typeof rawCode === "string" && aliases[rawCode]) {
    return aliases[rawCode];
  }

  if (typeof rawCode === "string" && appFailureCodeValues.includes(rawCode as AppFailureCode)) {
    return rawCode as AppFailureCode;
  }

  switch (status) {
    case 401:
      return "unauthorized";
    case 403:
      return "forbidden";
    case 409:
      return "duplicate_account";
    case 410:
      return "expired_reset_token";
    case 429:
      return "rate_limited";
    case 503:
      return "maintenance";
    default:
      return "unknown";
  }
}

function defaultFailureMessage(code: AppFailureCode): string {
  const messages: Record<AppFailureCode, string> = {
    invalid_credentials: "The email, gamer tag, or password is incorrect.",
    duplicate_account: "An account already exists with these details.",
    expired_verification_code: "This verification code has expired.",
    expired_reset_token: "This password reset link has expired.",
    rate_limited: "Too many attempts were made. Wait before retrying.",
    offline: "You appear to be offline. Check your connection and retry.",
    maintenance: "This service is temporarily unavailable for maintenance.",
    session_refresh_failed: "Your session could not be refreshed. Sign in again.",
    suspended: "This account is temporarily suspended.",
    banned: "This account has been banned.",
    partial_failure: "Some information could not be loaded.",
    unauthorized: "Authentication is required.",
    forbidden: "You do not have permission to perform this action.",
    validation_failed: "Check the highlighted information and retry.",
    unknown: "Something went wrong. Retry the action.",
  };

  return messages[code];
}

function readFieldErrors(value: unknown): Record<string, string[]> {
  if (!isRecord(value)) {
    return {};
  }

  const result: Record<string, string[]> = {};

  for (const [key, messages] of Object.entries(value)) {
    if (Array.isArray(messages) && messages.every((message) => typeof message === "string")) {
      result[key] = messages;
    }
  }

  return result;
}

export function parseRetryAfterSeconds(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }

  const seconds = Number(value);

  if (Number.isInteger(seconds) && seconds >= 0) {
    return seconds;
  }

  const date = Date.parse(value);

  if (Number.isNaN(date)) {
    return null;
  }

  return Math.max(0, Math.ceil((date - Date.now()) / 1000));
}

export function adaptHttpFailure(input: AdaptHttpFailureInput): AppFailure {
  if (!input.online) {
    return createOfflineFailure(input.source);
  }

  const envelope = readErrorEnvelope(input.payload);
  const code = normalizeFailureCode(envelope.code, input.status);

  return createAppFailure({
    code,
    source: input.source,
    message:
      typeof envelope.message === "string" && envelope.message.trim().length > 0
        ? envelope.message
        : defaultFailureMessage(code),
    httpStatus: input.status,
    retryable:
      typeof envelope.retryable === "boolean"
        ? envelope.retryable
        : ["offline", "maintenance", "rate_limited", "partial_failure", "unknown"].includes(code),
    fieldErrors: readFieldErrors(envelope.fieldErrors),
    retryAfterSeconds: parseRetryAfterSeconds(input.retryAfterHeader),
    requestId: typeof envelope.requestId === "string" ? envelope.requestId : null,
  });
}
