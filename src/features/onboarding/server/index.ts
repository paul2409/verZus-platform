// VERZUS M4 STEP 4.7

export {
  MOCK_ONBOARDING_COOKIE,
  decodeMockOnboardingDraft,
  encodeMockOnboardingDraft,
} from "./mock-onboarding.cookie";

export {
  completeMockOnboardingProgress,
  getMockOnboardingProgress,
  updateMockOnboardingProgress,
} from "./mock-onboarding.service";
export type { MockOnboardingServiceResult } from "./mock-onboarding.service";

// VERZUS M4 STEP 4.9 EXPORTS START
export {
  getMockOnboardingAvailabilityOptions,
  getMockOnboardingCrewOptions,
  getMockOnboardingGameOptions,
  getMockOnboardingIdentityOptions,
  getMockOnboardingLocationOptions,
  onboardingMockScenarioValues,
} from "./mock-onboarding-options.service";
export type {
  MockOnboardingOptionsResult,
  OnboardingMockScenario,
} from "./mock-onboarding-options.service";
// VERZUS M4 STEP 4.9 EXPORTS END
