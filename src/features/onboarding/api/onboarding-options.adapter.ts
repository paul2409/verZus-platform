// VERZUS M4 STEP 4.9

import {
  onboardingAvailabilityOptionsResponseSchema,
  onboardingCrewOptionsResponseSchema,
  onboardingGameOptionsResponseSchema,
  onboardingIdentityOptionsResponseSchema,
  onboardingLocationOptionsResponseSchema,
  type OnboardingAvailabilityOptionsData,
  type OnboardingCrewOptionsData,
  type OnboardingGameOptionsData,
  type OnboardingIdentityOptionsData,
  type OnboardingLocationOptionsData,
} from "./onboarding-options.schema";
import { OnboardingApiClientError } from "./onboarding-progress.adapter";

function invalidOptionsResponse(resource: string): OnboardingApiClientError {
  return new OnboardingApiClientError({
    code: "invalid_response",
    message: `The onboarding service returned invalid ${resource} options.`,
    requestId: `onboarding-client-invalid-${resource}-response`,
    retryable: true,
    fieldErrors: {},
  });
}

export function adaptOnboardingGameOptionsPayload(payload: unknown): OnboardingGameOptionsData {
  const parsed = onboardingGameOptionsResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw invalidOptionsResponse("game");
  }

  if (!parsed.data.ok) {
    throw new OnboardingApiClientError(parsed.data.error);
  }

  return parsed.data.data;
}

export function adaptOnboardingLocationOptionsPayload(
  payload: unknown,
): OnboardingLocationOptionsData {
  const parsed = onboardingLocationOptionsResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw invalidOptionsResponse("location");
  }

  if (!parsed.data.ok) {
    throw new OnboardingApiClientError(parsed.data.error);
  }

  return parsed.data.data;
}

export function adaptOnboardingIdentityOptionsPayload(
  payload: unknown,
): OnboardingIdentityOptionsData {
  const parsed = onboardingIdentityOptionsResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw invalidOptionsResponse("identity");
  }

  if (!parsed.data.ok) {
    throw new OnboardingApiClientError(parsed.data.error);
  }

  return parsed.data.data;
}

export function adaptOnboardingAvailabilityOptionsPayload(
  payload: unknown,
): OnboardingAvailabilityOptionsData {
  const parsed = onboardingAvailabilityOptionsResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw invalidOptionsResponse("availability");
  }

  if (!parsed.data.ok) {
    throw new OnboardingApiClientError(parsed.data.error);
  }

  return parsed.data.data;
}

export function adaptOnboardingCrewOptionsPayload(payload: unknown): OnboardingCrewOptionsData {
  const parsed = onboardingCrewOptionsResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw invalidOptionsResponse("crew");
  }

  if (!parsed.data.ok) {
    throw new OnboardingApiClientError(parsed.data.error);
  }

  return parsed.data.data;
}
