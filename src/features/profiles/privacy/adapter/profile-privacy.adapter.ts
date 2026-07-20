// VERZUS M11.7 PROFILE PRIVACY ADAPTER

import {
  profilePrivacyErrorRawSchema,
  profilePrivacyResponseRawSchema,
} from "../schema/profile-privacy.schema";
import type {
  ProfilePrivacyApiErrorShape,
  ProfilePrivacySnapshot,
} from "../model/profile-privacy.types";

export class ProfilePrivacyResourceError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly retryable: boolean;
  readonly status: number;
  readonly fieldErrors: Record<string, string[]> | undefined;

  constructor(input: ProfilePrivacyApiErrorShape & { status: number }) {
    super(input.message);
    this.name = "ProfilePrivacyResourceError";
    this.code = input.code;
    this.requestId = input.requestId;
    this.retryable = input.retryable;
    this.status = input.status;
    this.fieldErrors = input.fieldErrors;
  }
}

export function adaptProfilePrivacyResponse(payload: unknown): ProfilePrivacySnapshot {
  const parsed = profilePrivacyResponseRawSchema.parse(payload);
  return {
    playerId: parsed.data.player_id,
    version: parsed.data.version,
    updatedAt: parsed.data.updated_at,
    settings: {
      profileVisibility: parsed.data.profile_visibility,
      location: parsed.data.field_audiences.location,
      crew: parsed.data.field_audiences.crew,
      statistics: parsed.data.field_audiences.statistics,
      trustScore: parsed.data.field_audiences.trust_score,
      matchHistory: parsed.data.field_audiences.match_history,
      gameHandles: parsed.data.field_audiences.game_handles,
      achievements: parsed.data.field_audiences.achievements,
      availability: parsed.data.field_audiences.availability,
    },
    requestId: parsed.meta.request_id,
    source: parsed.meta.source,
    replayed: parsed.data.replayed,
  };
}

export async function adaptProfilePrivacyError(
  response: Response,
): Promise<ProfilePrivacyResourceError> {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return new ProfilePrivacyResourceError({
      code: "PROFILE_PRIVACY_INVALID_ERROR_RESPONSE",
      message: "The privacy service returned an unreadable error response.",
      requestId: response.headers.get("x-request-id") ?? "privacy-error-unknown",
      retryable: response.status >= 500,
      status: response.status,
    });
  }

  const parsed = profilePrivacyErrorRawSchema.safeParse(payload);
  if (!parsed.success) {
    return new ProfilePrivacyResourceError({
      code: "PROFILE_PRIVACY_UNKNOWN_ERROR",
      message: "Profile privacy could not be completed.",
      requestId: response.headers.get("x-request-id") ?? "privacy-error-unknown",
      retryable: response.status >= 500,
      status: response.status,
    });
  }

  return new ProfilePrivacyResourceError({
    code: parsed.data.error.code,
    message: parsed.data.error.message,
    requestId: parsed.data.error.request_id,
    retryable: parsed.data.error.retryable,
    status: response.status,
    ...(parsed.data.error.field_errors ? { fieldErrors: parsed.data.error.field_errors } : {}),
  });
}
