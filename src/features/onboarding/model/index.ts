// VERZUS M4 STEP 4.7

export {
  availabilitySchema,
  availabilitySlotSchema,
  crewChoiceSchema,
  dayOfWeekSchema,
  gameIdSchema,
  gamingPlatformSchema,
  identityUpdateSchema,
  locationSchema,
  locationUpdateSchema,
  onboardingDraftSchema,
  onboardingProgressUpdateSchema,
  onboardingStatusSchema,
  onboardingStepSchema,
  onboardingStepValues,
  playerIdentitySchema,
  selectedGamesSchema,
} from "./onboarding.schema";

export type {
  AvailabilitySlot,
  CrewChoice,
  LocationInput,
  OnboardingDraft,
  OnboardingProgressUpdate,
  OnboardingStatus,
  OnboardingStep,
  PlayerIdentityInput,
} from "./onboarding.schema";

export {
  completeOnboarding,
  createInitialOnboardingDraft,
  getFirstIncompleteStep,
  getOnboardingProgressPercent,
  requiredOnboardingSteps,
  saveOnboardingProgress,
} from "./onboarding.state-machine";

export type {
  OnboardingMutationFailureCode,
  OnboardingMutationResult,
} from "./onboarding.state-machine";
