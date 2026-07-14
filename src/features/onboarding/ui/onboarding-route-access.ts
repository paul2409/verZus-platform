// VERZUS M4 PRODUCTION ONBOARDING ROUTES

import {
  getOnboardingRoute,
  type OnboardingDraft,
  type OnboardingStep,
} from "@/features/onboarding";

const stepOrder = [
  "welcome",
  "games",
  "location",
  "identity",
  "availability",
  "crew",
  "complete",
] as const satisfies readonly OnboardingStep[];

function indexOfStep(step: OnboardingStep): number {
  return stepOrder.indexOf(step);
}

export function resolveOnboardingRouteRedirect(
  draft: OnboardingDraft,
  requestedStep: OnboardingStep,
): string | null {
  if (draft.status === "completed") {
    return "/play";
  }

  if (requestedStep === "complete" && draft.currentStep !== "complete") {
    return getOnboardingRoute(draft.currentStep);
  }

  const requestedIndex = indexOfStep(requestedStep);
  const currentIndex = indexOfStep(draft.currentStep);
  const alreadyCompleted = draft.completedSteps.includes(requestedStep);

  if (requestedIndex > currentIndex && !alreadyCompleted) {
    return getOnboardingRoute(draft.currentStep);
  }

  return null;
}
