// VERZUS M4 STEP 4.9

import type { OnboardingDraft } from "../model";
import { onboardingApiResponseSchema, type OnboardingApiError } from "./onboarding-api.schema";

export class OnboardingApiClientError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly retryable: boolean;
  readonly fieldErrors: Record<string, string[]>;

  constructor(error: OnboardingApiError) {
    super(error.message);
    this.name = "OnboardingApiClientError";
    this.code = error.code;
    this.requestId = error.requestId;
    this.retryable = error.retryable;
    this.fieldErrors = error.fieldErrors;
  }
}

function invalidProgressResponse(): OnboardingApiClientError {
  return new OnboardingApiClientError({
    code: "invalid_response",
    message: "The onboarding service returned an invalid progress response.",
    requestId: "onboarding-client-invalid-progress-response",
    retryable: true,
    fieldErrors: {},
  });
}

export function adaptOnboardingProgressPayload(payload: unknown): OnboardingDraft {
  const parsed = onboardingApiResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw invalidProgressResponse();
  }

  if (!parsed.data.ok) {
    throw new OnboardingApiClientError(parsed.data.error);
  }

  return parsed.data.data;
}
