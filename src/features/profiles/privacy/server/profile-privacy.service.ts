import type {
  ProfilePrivacySettings,
  ProfilePrivacySnapshot,
} from "../model/profile-privacy.types";
import {
  ProfilePrivacyConflictError,
  readProfilePrivacySnapshot,
  updateProfilePrivacy as persistProfilePrivacy,
} from "./profile-privacy.repository";

export class ProfilePrivacyServiceError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
    readonly retryable: boolean,
  ) {
    super(code);
  }
}

export async function getProfilePrivacy(
  userId: string,
  requestId: string,
): Promise<ProfilePrivacySnapshot> {
  const snapshot = await readProfilePrivacySnapshot(userId, requestId);
  if (!snapshot) throw new ProfilePrivacyServiceError("PROFILE_PRIVACY_NOT_FOUND", 404, false);
  return snapshot;
}

export async function saveProfilePrivacy(input: {
  userId: string;
  expectedVersion: number;
  settings: ProfilePrivacySettings;
  idempotencyKey: string;
  requestId: string;
}): Promise<ProfilePrivacySnapshot> {
  try {
    return await persistProfilePrivacy(input);
  } catch (error) {
    if (error instanceof ProfilePrivacyConflictError) {
      if (error.code === "IDEMPOTENCY_KEY_REUSED") {
        throw new ProfilePrivacyServiceError("PROFILE_PRIVACY_IDEMPOTENCY_KEY_REUSED", 409, false);
      }
      throw new ProfilePrivacyServiceError("PROFILE_PRIVACY_STALE_VERSION", 409, true);
    }
    throw error;
  }
}
