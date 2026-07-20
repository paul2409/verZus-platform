// VERZUS M11.7 SERVER-AUTHORITATIVE PROFILE PRIVACY SERVICE

import type {
  ProfilePrivacySaveScenario,
  ProfilePrivacyScenario,
  ProfilePrivacySettings,
  ProfilePrivacySnapshot,
} from "../model/profile-privacy.types";
import {
  findStoredProfilePrivacyCommand,
  persistProfilePrivacyUpdate,
  readProfilePrivacySnapshot,
} from "./profile-privacy.store";

export class ProfilePrivacyServiceError extends Error {
  readonly code: string;
  readonly status: number;
  readonly retryable: boolean;
  readonly fieldErrors: Record<string, string[]> | undefined;

  constructor(input: {
    code: string;
    message: string;
    status: number;
    retryable: boolean;
    fieldErrors?: Record<string, string[]>;
  }) {
    super(input.message);
    this.name = "ProfilePrivacyServiceError";
    this.code = input.code;
    this.status = input.status;
    this.retryable = input.retryable;
    this.fieldErrors = input.fieldErrors;
  }
}

export function normalizeProfilePrivacyScenario(value: string | null): ProfilePrivacyScenario {
  const allowed: ProfilePrivacyScenario[] = [
    "normal",
    "stale",
    "error",
    "offline",
    "slow",
    "malformed",
    "unauthorized",
    "forbidden",
    "not-found",
    "maintenance",
  ];
  return allowed.includes(value as ProfilePrivacyScenario)
    ? (value as ProfilePrivacyScenario)
    : "normal";
}

export function normalizeProfilePrivacySaveScenario(
  value: string | null,
): ProfilePrivacySaveScenario {
  const allowed: ProfilePrivacySaveScenario[] = [
    "normal",
    "slow",
    "error",
    "conflict",
    "unavailable",
    "response-lost",
  ];
  return allowed.includes(value as ProfilePrivacySaveScenario)
    ? (value as ProfilePrivacySaveScenario)
    : "normal";
}

function fingerprint(input: { expectedVersion: number; settings: ProfilePrivacySettings }): string {
  return JSON.stringify(input);
}

export function updateProfilePrivacy(input: {
  expectedVersion: number;
  settings: ProfilePrivacySettings;
  idempotencyKey: string;
  requestId: string;
}): ProfilePrivacySnapshot {
  const commandFingerprint = fingerprint({
    expectedVersion: input.expectedVersion,
    settings: input.settings,
  });

  try {
    const replay = findStoredProfilePrivacyCommand(
      input.idempotencyKey,
      commandFingerprint,
      input.requestId,
    );
    if (replay) return replay;
  } catch (error) {
    if (error instanceof Error && error.message === "IDEMPOTENCY_KEY_REUSED") {
      throw new ProfilePrivacyServiceError({
        code: "PROFILE_PRIVACY_IDEMPOTENCY_KEY_REUSED",
        message: "This request key was already used for a different privacy command.",
        status: 409,
        retryable: false,
      });
    }
    throw error;
  }

  const current = readProfilePrivacySnapshot({ requestId: input.requestId });
  if (current.version !== input.expectedVersion) {
    throw new ProfilePrivacyServiceError({
      code: "PROFILE_PRIVACY_STALE_VERSION",
      message: "Privacy settings changed. Refresh before saving again.",
      status: 409,
      retryable: true,
    });
  }

  return persistProfilePrivacyUpdate({
    settings: input.settings,
    idempotencyKey: input.idempotencyKey,
    fingerprint: commandFingerprint,
    requestId: input.requestId,
  });
}
