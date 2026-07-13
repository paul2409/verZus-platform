// VERZUS M4 STEP 4.7

export {
  finishOnboarding,
  getOnboardingProgress,
  OnboardingApiClientError,
  saveOnboardingProgressRequest,
} from "./onboarding-api.client";

export {
  onboardingApiErrorSchema,
  onboardingApiFailureSchema,
  onboardingApiResponseSchema,
  onboardingProgressRequestSchema,
  onboardingProgressSuccessSchema,
} from "./onboarding-api.schema";

export type {
  OnboardingApiError,
  OnboardingApiFailure,
  OnboardingApiResponse,
  OnboardingProgressSuccess,
} from "./onboarding-api.schema";

// VERZUS M4 STEP 4.9 EXPORTS START
export { adaptOnboardingProgressPayload } from "./onboarding-progress.adapter";

export {
  adaptOnboardingAvailabilityOptionsPayload,
  adaptOnboardingCrewOptionsPayload,
  adaptOnboardingGameOptionsPayload,
  adaptOnboardingIdentityOptionsPayload,
  adaptOnboardingLocationOptionsPayload,
} from "./onboarding-options.adapter";

export {
  getOnboardingAvailabilityOptions,
  getOnboardingCrewOptions,
  getOnboardingGameOptions,
  getOnboardingIdentityOptions,
  getOnboardingLocationOptions,
} from "./onboarding-options.client";
export type {
  OnboardingAvailabilityOptionsQuery,
  OnboardingCrewOptionsQuery,
  OnboardingLocationOptionsQuery,
} from "./onboarding-options.client";

export {
  onboardingAvailabilityOptionsDataSchema,
  onboardingAvailabilityOptionsResponseSchema,
  onboardingCrewOptionsDataSchema,
  onboardingCrewOptionsResponseSchema,
  onboardingGameOptionsDataSchema,
  onboardingGameOptionsResponseSchema,
  onboardingIdentityOptionsDataSchema,
  onboardingIdentityOptionsResponseSchema,
  onboardingLocationOptionsDataSchema,
  onboardingLocationOptionsResponseSchema,
  onboardingOptionMetaSchema,
} from "./onboarding-options.schema";
export type {
  OnboardingAvailabilityOptionsData,
  OnboardingCrewOptionsData,
  OnboardingGameOptionsData,
  OnboardingIdentityOptionsData,
  OnboardingLocationOptionsData,
  OnboardingOptionMeta,
} from "./onboarding-options.schema";
// VERZUS M4 STEP 4.9 EXPORTS END
