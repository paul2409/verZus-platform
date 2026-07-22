import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { readRuntimeSession, readRuntimeSessionToken } from "@/lib/session/runtime-session.server";

import { profileEditUpdateCommandSchema } from "../model/profile-edit.schema";
import type { ProfileEditSnapshot } from "../model/profile-edit.types";
import {
  ProfileEditConflictError,
  readProfileEditSnapshot,
  updateProfileEdit,
} from "./profile-edit.repository";

function serialize(snapshot: ProfileEditSnapshot) {
  return {
    data: {
      version: snapshot.version,
      updated_at: snapshot.updatedAt,
      avatar_url: snapshot.avatarUrl,
      replayed: snapshot.replayed,
      fields: {
        display_name: snapshot.fields.displayName,
        handle: snapshot.fields.handle,
        title: snapshot.fields.title,
        bio: snapshot.fields.bio,
        location_label: snapshot.fields.locationLabel,
        country_code: snapshot.fields.countryCode,
        availability_state: snapshot.fields.availabilityState,
        availability_label: snapshot.fields.availabilityLabel,
        availability_detail: snapshot.fields.availabilityDetail,
        next_window_label: snapshot.fields.nextWindowLabel,
      },
    },
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
  const session = await readRuntimeSession(readRuntimeSessionToken(request));
  return session.state === "authenticated" ? session.user : null;
}

export async function handleProfileEditGet(request: NextRequest): Promise<NextResponse> {
  const requestId = `profile-edit-${randomUUID()}`;
  const user = await authenticatedUser(request);
  if (!user)
    return errorResponse(
      requestId,
      401,
      "PROFILE_EDIT_UNAUTHORIZED",
      "Authentication is required.",
    );
  const snapshot = await readProfileEditSnapshot(user.id);
  if (!snapshot)
    return errorResponse(requestId, 404, "PROFILE_EDIT_NOT_FOUND", "Player profile was not found.");
  return NextResponse.json(serialize(snapshot), {
    headers: { "cache-control": "no-store", "x-request-id": requestId },
  });
}

export async function handleProfileEditPatch(request: NextRequest): Promise<NextResponse> {
  const requestId = `profile-edit-save-${randomUUID()}`;
  const user = await authenticatedUser(request);
  if (!user)
    return errorResponse(
      requestId,
      401,
      "PROFILE_EDIT_UNAUTHORIZED",
      "Authentication is required.",
    );
  const idempotencyKey = request.headers.get("idempotency-key")?.trim() ?? "";
  if (idempotencyKey.length < 8 || idempotencyKey.length > 200) {
    return errorResponse(
      requestId,
      400,
      "PROFILE_EDIT_IDEMPOTENCY_KEY_REQUIRED",
      "A valid Idempotency-Key header is required.",
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return errorResponse(
      requestId,
      400,
      "PROFILE_EDIT_INVALID_JSON",
      "The profile command is not valid JSON.",
    );
  }
  const parsed = profileEditUpdateCommandSchema.safeParse(payload);
  if (!parsed.success) {
    return errorResponse(
      requestId,
      400,
      "PROFILE_EDIT_VALIDATION_FAILED",
      "Review the profile fields.",
      false,
      {
        profile: parsed.error.issues.map((issue) => issue.message),
      },
    );
  }

  try {
    const f = parsed.data.fields;
    const snapshot = await updateProfileEdit({
      userId: user.id,
      expectedVersion: parsed.data.expected_version,
      idempotencyKey,
      requestId,
      fields: {
        displayName: f.display_name,
        handle: f.handle,
        title: f.title,
        bio: f.bio,
        locationLabel: f.location_label,
        countryCode: f.country_code,
        availabilityState: f.availability_state,
        availabilityLabel: f.availability_label,
        availabilityDetail: f.availability_detail,
        nextWindowLabel: f.next_window_label,
      },
    });
    return NextResponse.json(serialize(snapshot), {
      status: snapshot.replayed ? 200 : 201,
      headers: { "cache-control": "no-store", "x-request-id": requestId },
    });
  } catch (error) {
    if (error instanceof ProfileEditConflictError) {
      if (error.code === "HANDLE_TAKEN")
        return errorResponse(
          requestId,
          409,
          "PROFILE_HANDLE_TAKEN",
          "That player handle is already in use.",
          false,
          { handle: ["Choose another handle."] },
        );
      if (error.code === "IDEMPOTENCY_KEY_REUSED")
        return errorResponse(
          requestId,
          409,
          "PROFILE_EDIT_IDEMPOTENCY_KEY_REUSED",
          "This request key was already used for different profile data.",
        );
      return errorResponse(
        requestId,
        409,
        "PROFILE_EDIT_STALE_VERSION",
        "Your profile changed. Reload before saving again.",
        true,
      );
    }
    console.error(
      JSON.stringify({
        level: "error",
        feature: "profiles",
        requestId,
        message: error instanceof Error ? error.message : "Unknown profile update failure",
      }),
    );
    return errorResponse(
      requestId,
      503,
      "PROFILE_EDIT_UNAVAILABLE",
      "Profile editing is temporarily unavailable.",
      true,
    );
  }
}
