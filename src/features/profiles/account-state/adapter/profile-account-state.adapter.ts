// VERZUS M11.7 PROFILE ACCOUNT-STATE ADAPTER

import type { ProfileAccountState } from "../model/profile-account-state.types";
import {
  profileAccountStateErrorRawSchema,
  profileAccountStateResponseRawSchema,
} from "../schema/profile-account-state.schema";

export class ProfileAccountStateResourceError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly retryable: boolean;
  readonly status: number;

  constructor(input: {
    code: string;
    message: string;
    requestId: string;
    retryable: boolean;
    status: number;
  }) {
    super(input.message);
    this.name = "ProfileAccountStateResourceError";
    this.code = input.code;
    this.requestId = input.requestId;
    this.retryable = input.retryable;
    this.status = input.status;
  }
}

export function adaptProfileAccountState(payload: unknown): ProfileAccountState {
  const parsed = profileAccountStateResponseRawSchema.parse(payload);
  return {
    status: parsed.data.status,
    profileId: parsed.data.profile_id,
    title: parsed.data.title,
    message: parsed.data.message,
    caseReference: parsed.data.case_reference,
    reviewAtLabel: parsed.data.review_at_label,
    canEditProfile: parsed.data.can_edit_profile,
    canViewPublicProfile: parsed.data.can_view_public_profile,
    requestId: parsed.meta.request_id,
    source: parsed.meta.source,
  };
}

export async function adaptProfileAccountStateError(
  response: Response,
): Promise<ProfileAccountStateResourceError> {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return new ProfileAccountStateResourceError({
      code: "PROFILE_ACCOUNT_STATE_INVALID_ERROR",
      message: "Profile status returned an unreadable response.",
      requestId: response.headers.get("x-request-id") ?? "profile-state-unknown",
      retryable: response.status >= 500,
      status: response.status,
    });
  }
  const parsed = profileAccountStateErrorRawSchema.safeParse(payload);
  if (!parsed.success) {
    return new ProfileAccountStateResourceError({
      code: "PROFILE_ACCOUNT_STATE_UNKNOWN_ERROR",
      message: "Profile status could not be confirmed.",
      requestId: response.headers.get("x-request-id") ?? "profile-state-unknown",
      retryable: response.status >= 500,
      status: response.status,
    });
  }
  return new ProfileAccountStateResourceError({
    code: parsed.data.error.code,
    message: parsed.data.error.message,
    requestId: parsed.data.error.request_id,
    retryable: parsed.data.error.retryable,
    status: response.status,
  });
}
