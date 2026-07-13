// VERZUS M4 STEP 4.8

export {
  getOnboardingReferenceGaps,
  canImplementFinalOnboardingScreen,
  onboardingReferenceAudit,
  referenceStatusValues,
} from "./onboarding-reference.audit";
export type {
  OnboardingReferenceAuditEntry,
  ReferenceGap,
  ReferenceStatus,
  ReferenceViewport,
  ReferenceViewportAudit,
} from "./onboarding-reference.audit";

export {
  getOnboardingRoute,
  getOnboardingStepFromPath,
  isKnownOnboardingRoute,
  onboardingRouteSteps,
  onboardingStepRoutes,
  resolveOnboardingResumeRoute,
} from "./onboarding-route.contract";

export {
  getOnboardingScreenContract,
  onboardingScreenContracts,
  onboardingScreenStateValues,
} from "./onboarding-screen.contract";
export type {
  OnboardingDataDependency,
  OnboardingDependencySource,
  OnboardingFailureIsolationRule,
  OnboardingResponsiveContract,
  OnboardingScreenContract,
  OnboardingScreenState,
} from "./onboarding-screen.contract";
