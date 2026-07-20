// VERZUS M11.7 PROFILE PRIVACY HTTP HANDLERS

import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { ProfilePrivacySnapshot } from "../model/profile-privacy.types";
import { profilePrivacyUpdateCommandRawSchema } from "../schema/profile-privacy.schema";
import {
  normalizeProfilePrivacySaveScenario,
  normalizeProfilePrivacyScenario,
  ProfilePrivacyServiceError,
  updateProfilePrivacy,
} from "./profile-privacy.service";
import {
  readProfilePrivacySnapshot,
  shouldLoseProfilePrivacyResponse,
} from "./profile-privacy.store";

function serializeSnapshot(snapshot: ProfilePrivacySnapshot) {
  return {
    data: {
      player_id: snapshot.playerId,
      version: snapshot.version,
      updated_at: snapshot.updatedAt,
      profile_visibility: snapshot.settings.profileVisibility,
      field_audiences: {
        location: snapshot.settings.location,
        crew: snapshot.settings.crew,
        statistics: snapshot.settings.statistics,
        trust_score: snapshot.settings.trustScore,
        match_history: snapshot.settings.matchHistory,
        game_handles: snapshot.settings.gameHandles,
        achievements: snapshot.settings.achievements,
        availability: snapshot.settings.availability,
      },
      replayed: snapshot.replayed,
    },
    meta: {
      request_id: snapshot.requestId,
      source: snapshot.source,
    },
  };
}

function errorResponse(
  requestId: string,
  input: {
    code: string;
    message: string;
    status: number;
    retryable: boolean;
    fieldErrors?: Record<string, string[]>;
  },
) {
  return NextResponse.json(
    {
      error: {
        code: input.code,
        message: input.message,
        request_id: requestId,
        retryable: input.retryable,
        ...(input.fieldErrors ? { field_errors: input.fieldErrors } : {}),
      },
    },
    {
      status: input.status,
      headers: { "cache-control": "no-store", "x-request-id": requestId },
    },
  );
}

export async function handleProfilePrivacyGet(request: NextRequest): Promise<NextResponse> {
  const requestId = `profile-privacy-${randomUUID()}`;
  const scenario = normalizeProfilePrivacyScenario(request.nextUrl.searchParams.get("scenario"));

  if (scenario === "slow") await new Promise((resolve) => setTimeout(resolve, 1_200));

  const failures = {
    error: [
      "PROFILE_PRIVACY_UNAVAILABLE",
      "Privacy settings are temporarily unavailable.",
      503,
      true,
    ],
    offline: [
      "PROFILE_PRIVACY_OFFLINE",
      "Privacy settings are unavailable while offline.",
      503,
      true,
    ],
    unauthorized: ["PROFILE_PRIVACY_UNAUTHORIZED", "Authentication is required.", 401, false],
    forbidden: [
      "PROFILE_PRIVACY_FORBIDDEN",
      "This account cannot manage privacy settings.",
      403,
      false,
    ],
    "not-found": ["PROFILE_PRIVACY_NOT_FOUND", "Privacy settings were not found.", 404, false],
    maintenance: [
      "PROFILE_PRIVACY_MAINTENANCE",
      "Privacy settings are under maintenance.",
      503,
      true,
    ],
  } as const;

  if (scenario in failures) {
    const [code, message, status, retryable] = failures[scenario as keyof typeof failures];
    return errorResponse(requestId, { code, message, status, retryable });
  }

  if (scenario === "malformed") {
    return NextResponse.json(
      { data: { privacy: false }, meta: { request_id: requestId, source: "malformed" } },
      { headers: { "cache-control": "no-store", "x-request-id": requestId } },
    );
  }

  const snapshot = readProfilePrivacySnapshot({
    requestId,
    source: scenario === "stale" ? "mock-profile-privacy-stale" : "mock-profile-privacy",
  });
  return NextResponse.json(serializeSnapshot(snapshot), {
    headers: { "cache-control": "no-store", "x-request-id": requestId },
  });
}

export async function handleProfilePrivacyPatch(request: NextRequest): Promise<NextResponse> {
  const requestId = `profile-privacy-save-${randomUUID()}`;
  const idempotencyKey = request.headers.get("idempotency-key")?.trim() ?? "";
  if (idempotencyKey.length < 8 || idempotencyKey.length > 200) {
    return errorResponse(requestId, {
      code: "PROFILE_PRIVACY_IDEMPOTENCY_KEY_REQUIRED",
      message: "A valid Idempotency-Key header is required.",
      status: 400,
      retryable: false,
      fieldErrors: { idempotencyKey: ["Use an 8 to 200 character request key."] },
    });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return errorResponse(requestId, {
      code: "PROFILE_PRIVACY_INVALID_JSON",
      message: "The privacy command body is not valid JSON.",
      status: 400,
      retryable: false,
    });
  }

  const parsed = profilePrivacyUpdateCommandRawSchema.safeParse(payload);
  if (!parsed.success) {
    return errorResponse(requestId, {
      code: "PROFILE_PRIVACY_VALIDATION_FAILED",
      message: "The privacy command failed validation.",
      status: 400,
      retryable: false,
      fieldErrors: {
        privacy: parsed.error.issues.map((issue) => issue.message),
      },
    });
  }

  const scenario = normalizeProfilePrivacySaveScenario(
    request.nextUrl.searchParams.get("scenario"),
  );
  if (scenario === "slow") await new Promise((resolve) => setTimeout(resolve, 1_200));
  if (scenario === "error") {
    return errorResponse(requestId, {
      code: "PROFILE_PRIVACY_SAVE_FAILED",
      message: "Privacy settings could not be saved.",
      status: 500,
      retryable: true,
    });
  }
  if (scenario === "unavailable") {
    return errorResponse(requestId, {
      code: "PROFILE_PRIVACY_SERVICE_UNAVAILABLE",
      message: "Privacy settings are temporarily unavailable.",
      status: 503,
      retryable: true,
    });
  }
  if (scenario === "conflict") {
    return errorResponse(requestId, {
      code: "PROFILE_PRIVACY_STALE_VERSION",
      message: "Privacy settings changed. Refresh before saving again.",
      status: 409,
      retryable: true,
    });
  }

  try {
    const snapshot = updateProfilePrivacy({
      expectedVersion: parsed.data.expected_version,
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
      idempotencyKey,
      requestId,
    });

    if (
      scenario === "response-lost" &&
      !snapshot.replayed &&
      shouldLoseProfilePrivacyResponse(idempotencyKey)
    ) {
      return errorResponse(requestId, {
        code: "PROFILE_PRIVACY_RESPONSE_LOST",
        message: "The save may have completed. Retry safely with the same request.",
        status: 504,
        retryable: true,
      });
    }

    return NextResponse.json(serializeSnapshot(snapshot), {
      status: snapshot.replayed ? 200 : 201,
      headers: { "cache-control": "no-store", "x-request-id": requestId },
    });
  } catch (error) {
    if (error instanceof ProfilePrivacyServiceError) {
      return errorResponse(requestId, {
        code: error.code,
        message: error.message,
        status: error.status,
        retryable: error.retryable,
        ...(error.fieldErrors ? { fieldErrors: error.fieldErrors } : {}),
      });
    }
    return errorResponse(requestId, {
      code: "PROFILE_PRIVACY_UNEXPECTED_FAILURE",
      message: "Privacy settings could not be completed.",
      status: 500,
      retryable: true,
    });
  }
}
