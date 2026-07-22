import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { readSessionToken } from "@/features/auth/server/auth.http";
import { readAccountSession } from "@/features/auth/server/auth.service";

import type { ProfilePrivacySnapshot } from "../model/profile-privacy.types";
import { profilePrivacyUpdateCommandRawSchema } from "../schema/profile-privacy.schema";
import {
  getProfilePrivacy,
  ProfilePrivacyServiceError,
  saveProfilePrivacy,
} from "./profile-privacy.service";

function serialize(snapshot: ProfilePrivacySnapshot) {
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
    meta: { request_id: snapshot.requestId, source: snapshot.source },
  };
}

function errorResponse(
  requestId: string,
  status: number,
  code: string,
  message: string,
  retryable = false,
  fieldErrors?: Record<string, string[]>,
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        request_id: requestId,
        retryable,
        ...(fieldErrors ? { field_errors: fieldErrors } : {}),
      },
    },
    { status, headers: { "cache-control": "no-store", "x-request-id": requestId } },
  );
}

async function authenticatedUser(request: NextRequest) {
  const session = await readAccountSession(readSessionToken(request));
  return session.state === "authenticated" ? session.user : null;
}

export async function handleProfilePrivacyGet(request: NextRequest): Promise<NextResponse> {
  const requestId = `profile-privacy-${randomUUID()}`;
  const user = await authenticatedUser(request);
  if (!user)
    return errorResponse(
      requestId,
      401,
      "PROFILE_PRIVACY_UNAUTHORIZED",
      "Authentication is required.",
    );
  try {
    return NextResponse.json(serialize(await getProfilePrivacy(user.id, requestId)), {
      headers: { "cache-control": "no-store", "x-request-id": requestId },
    });
  } catch (error) {
    if (error instanceof ProfilePrivacyServiceError)
      return errorResponse(
        requestId,
        error.status,
        error.code,
        "Privacy settings were not found.",
        error.retryable,
      );
    return errorResponse(
      requestId,
      503,
      "PROFILE_PRIVACY_UNAVAILABLE",
      "Privacy settings are temporarily unavailable.",
      true,
    );
  }
}

export async function handleProfilePrivacyPatch(request: NextRequest): Promise<NextResponse> {
  const requestId = `profile-privacy-save-${randomUUID()}`;
  const user = await authenticatedUser(request);
  if (!user)
    return errorResponse(
      requestId,
      401,
      "PROFILE_PRIVACY_UNAUTHORIZED",
      "Authentication is required.",
    );
  const idempotencyKey = request.headers.get("idempotency-key")?.trim() ?? "";
  if (idempotencyKey.length < 8 || idempotencyKey.length > 200)
    return errorResponse(
      requestId,
      400,
      "PROFILE_PRIVACY_IDEMPOTENCY_KEY_REQUIRED",
      "A valid Idempotency-Key header is required.",
    );

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return errorResponse(
      requestId,
      400,
      "PROFILE_PRIVACY_INVALID_JSON",
      "The privacy command is not valid JSON.",
    );
  }
  const parsed = profilePrivacyUpdateCommandRawSchema.safeParse(payload);
  if (!parsed.success)
    return errorResponse(
      requestId,
      400,
      "PROFILE_PRIVACY_VALIDATION_FAILED",
      "Review the privacy selections.",
      false,
      { privacy: parsed.error.issues.map((issue) => issue.message) },
    );

  const d = parsed.data;
  try {
    const snapshot = await saveProfilePrivacy({
      userId: user.id,
      expectedVersion: d.expected_version,
      idempotencyKey,
      requestId,
      settings: {
        profileVisibility: d.profile_visibility,
        location: d.field_audiences.location,
        crew: d.field_audiences.crew,
        statistics: d.field_audiences.statistics,
        trustScore: d.field_audiences.trust_score,
        matchHistory: d.field_audiences.match_history,
        gameHandles: d.field_audiences.game_handles,
        achievements: d.field_audiences.achievements,
        availability: d.field_audiences.availability,
      },
    });
    return NextResponse.json(serialize(snapshot), {
      status: snapshot.replayed ? 200 : 201,
      headers: { "cache-control": "no-store", "x-request-id": requestId },
    });
  } catch (error) {
    if (error instanceof ProfilePrivacyServiceError) {
      const message =
        error.code === "PROFILE_PRIVACY_STALE_VERSION"
          ? "Privacy settings changed. Refresh before saving again."
          : "This request key was already used for different settings.";
      return errorResponse(requestId, error.status, error.code, message, error.retryable);
    }
    return errorResponse(
      requestId,
      503,
      "PROFILE_PRIVACY_UNAVAILABLE",
      "Privacy settings are temporarily unavailable.",
      true,
    );
  }
}
